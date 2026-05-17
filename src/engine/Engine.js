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
  async generateSession({ mode = "smart", filter = null, sessionSize = 8, newPerSession = 4 } = {}) {
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
      queue = buildQueue(pool, progress, { sessionSize, newPerSession });
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
      exercises: generateLesson(queue, this.pack.vocab, progress),
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
  async logSession({ correct, total, xp, durationMs }) {
    const log = (await this.storage.get("sessions")) || [];
    log.push({
      ts: Date.now(),
      language: this.languageCode,
      correct,
      total,
      xp,
      durationMs,
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
