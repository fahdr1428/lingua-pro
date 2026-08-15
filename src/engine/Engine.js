// =============================================================================
// ENGINE — single facade the UI talks to.
// =============================================================================
// The UI never imports srs/selector/generator directly. It calls engine methods.
// This means: change the algorithm, change the storage backend, change the
// data source — the UI doesn't notice.
// =============================================================================

import { newCardState, review, masteryLevel, RATING } from "./srs.js";
import { buildQueue, countDue, countLearned, filterVocab } from "./selector.js";
import { generateLesson, gradeAnswer, EXERCISE } from "./generator.js";
import { CONJUGATIONS } from "../data/conjugations.js";
import { TENSES } from "../data/tenses.js";
import { loadLanguagePack } from "../data/registry.js";

export class Engine {
  constructor(storage) {
    this.storage = storage;
    this.languageCode = null;
    this.pack = null;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  async loadLanguage(code) {
    if (this.languageCode === code && this.pack) return this.pack;
    this.pack = await loadLanguagePack(code);
    this.languageCode = code;
    return this.pack;
  }

  // ---------------------------------------------------------------------------
  // Progress access
  // ---------------------------------------------------------------------------
  async getProgress() {
    const all = (await this.storage.get("progress")) || {};
    return all[this.languageCode] || {};
  }

  async setCard(vocabId, card) {
    const all = (await this.storage.get("progress")) || {};
    if (!all[this.languageCode]) all[this.languageCode] = {};
    all[this.languageCode][vocabId] = card;
    await this.storage.set("progress", all);
  }

  // v26 TEST-OUT: mark a set of words as already known. Gives each a card
  // that looks moderately learned (so it won't be reintroduced as NEW), but
  // still with finite stability so it re-enters normal spaced review later —
  // "tested out" means "don't reteach from zero", NOT "never see again".
  async seedKnown(vocabIds = []) {
    if (!Array.isArray(vocabIds) || vocabIds.length === 0) return;
    const all = (await this.storage.get("progress")) || {};
    if (!all[this.languageCode]) all[this.languageCode] = {};
    const now = Date.now();
    for (const id of vocabIds) {
      // Don't downgrade a word the learner already has real progress on.
      const existing = all[this.languageCode][id];
      if (existing && (existing.reps || 0) >= 2) continue;
      all[this.languageCode][id] = {
        difficulty: 5,            // neutral
        stability: 7,             // ~a week before it needs review
        lastReview: now,
        nextReview: now + 7 * 24 * 60 * 60 * 1000,
        reps: 2,                  // enough that it's not "new"
        lapses: 0,
        lastRating: "good",
        seededByTestOut: true,
      };
    }
    await this.storage.set("progress", all);
  }

  // ---------------------------------------------------------------------------
  // Stats — for the UI dashboard
  // ---------------------------------------------------------------------------
  async getStats() {
    const progress = await this.getProgress();
    const vocab = this.pack?.vocab || [];
    return {
      total: vocab.length,
      learned: countLearned(vocab, progress),
      due: countDue(vocab, progress),
      mastered: vocab.filter((v) => progress[v.id] && masteryLevel(progress[v.id]) >= 4).length,
    };
  }

  /** Per-unit progress for the unit map on home screen. */
  async getUnitProgress() {
    const progress = await this.getProgress();
    const vocab = this.pack?.vocab || [];
    const units = this.pack?.units || [];
    return units.map((u) => {
      const items = vocab.filter((v) => v.unit === u.id);
      const learned = items.filter((v) => progress[v.id]?.reps > 0).length;
      const mastered = items.filter((v) => progress[v.id] && masteryLevel(progress[v.id]) >= 4).length;
      const total = items.length;
      const pct = total > 0 ? learned / total : 0;
      return {
        ...u,
        total,
        learned,
        mastered,
        pct,
        // 'available' = previous unit at least 30% learned, or first unit always available
        // Will be set in caller using order
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Lesson generation — bulletproof: ALWAYS returns at least sessionSize exercises
  // ---------------------------------------------------------------------------
  async generateSession({ mode = "smart", filter = null, sessionSize = 8, newPerSession = 4, goalCategories = null, disabledExercises = null } = {}) {
    const progress = await this.getProgress();
    let pool = this.pack.vocab;
    if (filter) pool = filterVocab(pool, filter);

    // Safety: if filter returned empty, fall back to whole vocab
    if (pool.length === 0) pool = this.pack.vocab;

    let queue;
    if (mode === "due") {
      queue = buildQueue(pool, progress, { sessionSize, newPerSession: 0 });
      // If nothing due, fall back to new
      if (queue.length === 0) {
        queue = pool.filter((v) => !progress[v.id]).slice(0, sessionSize);
      }
    } else if (mode === "new") {
      queue = pool.filter((v) => !progress[v.id]).slice(0, sessionSize);
      // If no new words, return practice from learned ones
      if (queue.length === 0) {
        queue = [...pool].sort(() => Math.random() - 0.5).slice(0, sessionSize);
      }
    } else if (mode === "checkpoint") {
      // v25 REVIEW CHECKPOINT — pull from EVERYTHING the learner has seen so
      // far (not just what's strictly "due"), with a wide spread, to confirm
      // older words still stick. Falls back gracefully if little learned yet.
      const learned = pool.filter((v) => progress[v.id]?.reps > 0);
      if (learned.length >= 4) {
        // Prioritise weaker/older items but include a broad sample
        const byNeed = [...learned].sort((a, b) => {
          const pa = progress[a.id], pb = progress[b.id];
          const lapsesDiff = (pb?.lapses || 0) - (pa?.lapses || 0);
          if (lapsesDiff !== 0) return lapsesDiff;
          return (pa?.lastReview || 0) - (pb?.lastReview || 0); // older first
        });
        // Take a spread: some weak, some random, for varied recall
        const weak = byNeed.slice(0, Math.ceil(sessionSize * 0.6));
        const rest = byNeed.slice(Math.ceil(sessionSize * 0.6));
        const randomExtra = rest.sort(() => Math.random() - 0.5).slice(0, sessionSize - weak.length);
        queue = [...weak, ...randomExtra].sort(() => Math.random() - 0.5);
      } else {
        // Not enough learned yet — just review whatever exists
        queue = buildQueue(pool, progress, { sessionSize, newPerSession: 0 });
        if (queue.length === 0) queue = pool.slice(0, sessionSize);
      }
    } else if (mode === "chapter_exam") {
      // v44 CHAPTER EXAM — a gated exam over the words of a SPECIFIC chapter.
      // The caller passes filter.vocabIds (the chapter's word IDs). We test all
      // of them (capped for sanity), regardless of mastery, since this is the
      // gate that decides whether the learner advances.
      const ids = new Set(filter?.vocabIds || []);
      let chapterWords = pool.filter((v) => ids.has(v.id));
      // Cap to keep the exam a reasonable length; if a chapter is huge, sample.
      const MAX = sessionSize || 12;
      if (chapterWords.length > MAX) {
        chapterWords = [...chapterWords].sort(() => Math.random() - 0.5).slice(0, MAX);
      }
      queue = chapterWords;
      if (queue.length === 0) {
        // Safety: if no chapter words resolved, fall back to learned words.
        queue = pool.filter((v) => progress[v.id]?.reps > 0).slice(0, MAX);
      }
    } else if (mode === "exam") {
      // v38 BIG EXAM — a comprehensive test over EVERYTHING the learner has
      // studied. Pulls a large sample (caller sets sessionSize, e.g. 25),
      // weighted toward weaker/older items but with a broad spread so it feels
      // like a real exam over the whole vocabulary. No new words — exams test
      // what you've learned, they don't teach.
      const learned = pool.filter((v) => progress[v.id]?.reps > 0);
      if (learned.length === 0) {
        // Nothing learned yet — exam isn't meaningful; fall back to a few new words
        queue = pool.slice(0, Math.min(sessionSize, pool.length));
      } else {
        // Weight: weakest (most lapses, then lowest retrievability) first, but
        // include a broad random spread so it's not ONLY the hardest words.
        const byNeed = [...learned].sort((a, b) => {
          const pa = progress[a.id], pb = progress[b.id];
          const lapsesDiff = (pb?.lapses || 0) - (pa?.lapses || 0);
          if (lapsesDiff !== 0) return lapsesDiff;
          return (pa?.lastReview || 0) - (pb?.lastReview || 0);
        });
        const weakHalf = byNeed.slice(0, Math.ceil(sessionSize * 0.5));
        const rest = byNeed.slice(Math.ceil(sessionSize * 0.5))
          .sort(() => Math.random() - 0.5)
          .slice(0, sessionSize - weakHalf.length);
        queue = [...weakHalf, ...rest].sort(() => Math.random() - 0.5);
      }
    } else if (mode === "weak") {
      queue = pool
        .filter((v) => progress[v.id])
        .sort((a, b) => (progress[b.id]?.lapses || 0) - (progress[a.id]?.lapses || 0))
        .slice(0, sessionSize);
      if (queue.length === 0) {
        queue = pool.slice(0, sessionSize);
      }
    } else if (mode === "unit" && filter?.unit) {
      // Unit lesson: focus on this unit's words specifically.
      // Mix learned (for review) and unseen (for new), prioritising unseen.
      const unitWords = pool;
      const unseen = unitWords.filter((v) => !progress[v.id]);
      const learned = unitWords.filter((v) => progress[v.id]);
      queue = [...unseen, ...learned.sort(() => Math.random() - 0.5)].slice(0, sessionSize);
    } else {
      // 'smart' — selector decides the mix
      queue = buildQueue(pool, progress, { sessionSize, newPerSession, goalCategories });
      // If selector returns nothing, give a random sample
      if (queue.length === 0) {
        queue = [...pool].sort(() => Math.random() - 0.5).slice(0, sessionSize);
      }
    }

    // Final safety net: if queue is STILL empty, take anything from the pack
    if (queue.length === 0) {
      queue = (this.pack.vocab || []).slice(0, sessionSize);
    }

    return {
      mode,
      exercises: generateLesson(
        queue,
        this.pack.vocab,
        progress,
        this.languageCode,
        CONJUGATIONS[this.languageCode] || null,
        TENSES, // v34b: pass the full TENSES map; generator picks the right one
        mode === "exam", // v38: exam mode = one test question per word, no intros
        mode === "chapter_exam", // v44: 3-round gated chapter exam
        disabledExercises, // v76: exercise types the learner switched off
      ),
    };
  }

  // ---------------------------------------------------------------------------
  // Submitting an answer — single source of truth for SRS updates
  // ---------------------------------------------------------------------------
  async submitAnswer(exercise, given) {
    const result = gradeAnswer(exercise, given);

    // INTRODUCE step: just acknowledge, don't update SRS state
    if (result.intro) {
      return { ...result, rating: null, card: null, mastery: 0 };
    }

    // v68 PRETEST: the learner is guessing at a word they haven't been taught
    // yet. Grading it as a failed review would tell FSRS the word is hard when
    // in truth it was never introduced — so scheduling stays untouched.
    if (exercise.pretest) {
      return { ...result, rating: null, card: null, mastery: 0, pretest: true };
    }

    // Map correctness + exercise difficulty into FSRS rating (1..4)
    const rating = inferRating(exercise, result.correct);

    const id = exercise.item.id;
    const progress = await this.getProgress();
    const oldCard = progress[id] || newCardState();
    const newCard = review(oldCard, rating);
    await this.setCard(id, newCard);

    return {
      ...result,
      rating,
      card: newCard,
      mastery: masteryLevel(newCard),
    };
  }

  // ---------------------------------------------------------------------------
  // Sessions log — for streaks, charts, achievements
  // ---------------------------------------------------------------------------
  async logSession({ correct, total, xp, durationMs, mode }) {
    const log = (await this.storage.get("sessions")) || [];
    log.push({
      ts: Date.now(),
      language: this.languageCode,
      correct,
      total,
      xp,
      durationMs,
      // v57: which kind of session this was ("unit", "due", "weak", "exam",
      // "chapter_exam", "checkpoint"). Lets the daily plan mark its steps as
      // genuinely done rather than guessing.
      mode: mode || "unit",
    });
    // Keep last 90 days only
    const cutoff = Date.now() - 90 * 86400000;
    const trimmed = log.filter((s) => s.ts >= cutoff);
    await this.storage.set("sessions", trimmed);
    return trimmed;
  }

  async getSessions() {
    return (await this.storage.get("sessions")) || [];
  }
}

// Heuristic: a correct production exercise = stronger evidence than a correct
// recognition exercise. A typed answer that's slightly off could be HARD.
function inferRating(exercise, correct) {
  if (!correct) return RATING.AGAIN;
  const productionTypes = [EXERCISE.TYPE_TRANSLATION, EXERCISE.TAP_WORDS];
  if (productionTypes.includes(exercise.type)) return RATING.GOOD;
  // Recognition = lower-evidence success
  return RATING.GOOD; // could downgrade to HARD with timing data later
}
