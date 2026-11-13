// =============================================================================
// ADAPT (v117) — the course responds to the learner.
//
// Before this, three things did not adapt:
//
//   · A LESSON THAT WENT BADLY STILL COUNTED. Finishing a lesson marked it done
//     whatever the answers were: 4 of 26 right, every objective "not yet", and
//     the next action was the next lesson's new words on top of them.
//     → SECOND PASS: when the words of the lesson just finished did not come
//       from memory, the next action is a short round on exactly those words —
//       look again, find each one, then write each one. Then the course moves
//       on. It can be declined; it is offered once.
//
//   · THE SKILL PROFILE COULD BE READ BUT NOT ACTED ON. Seven scores, and one
//     link to a general screen.
//     → SKILL DRILLS: a session made only of the exercise types that train one
//       skill, on the learner's own learned words, weakest memory first.
//
//   · EVERYONE STARTED AT "HELLO". The chapter test (SkipAhead) lets someone
//     skip a chapter they pick; nothing found WHICH chapter.
//     → FIND YOUR LEVEL: one chapter at a time from the first, twelve
//       questions in both directions, eleven to pass. It stops at the first
//       chapter not passed, and that is where the learner starts.
//
// HOW STRICT PLACEMENT IS. Skipping a chapter you don't know costs the next
// twenty lessons, so the chapter test asks 14 questions and wants 85% (12
// right). A probe must be no easier for anyone who doesn't know the chapter.
// The first design, 9 of 10, was: someone who knows half of it passed 1.1% of
// the time against the chapter test's 0.6% (test-adaptive caught it). 11 of
// 12 is stricter at every level up to 90% known — 70% known passes 8.5% of
// the time against 16.1% — while someone who knows 95% still passes 88% of
// the time. It stops asking the moment the result is settled (two misses, or
// eleven right). A passed chapter gets exactly what the chapter test
// gives it (chapters.js withChapterPassed + Engine.seedKnown): its words are
// marked known and come back for review within a week, where a miss brings
// them back properly.
//
// Pure functions. Loaded lazily with lessons, Home's course panel and the
// placement screen. test-adaptive checks every rule in every language.
// =============================================================================

import { canRecall } from "./recall.js";
import { retrievability } from "./srs.js";
import { EXERCISE, buildOfType } from "./generator.js";
import { buildFixSentence, buildDictation } from "./teach.js";
import { OBJECTIVE } from "./curriculum.js";
import { rushQuestion } from "./games.js";
import { SPEAK_MODE } from "./speaking.js";
import { chapterVocabIds, completeChapterCount, unitIndicesForChapter } from "../data/chapters.js";

const DAY = 86400000;
const asSet = (d) => (d instanceof Set ? d : new Set(d || []));
const shuffled = (arr, rand = Math.random) => arr.map((x) => [rand(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

// ---------------------------------------------------------------------------
// SECOND PASS
// ---------------------------------------------------------------------------
export const SECOND_PASS_MAX = 7;
export const SECOND_PASS_DAYS = 14;

/**
 * Is a second pass due? Only for the lesson finished most recently: a word
 * lesson whose from-memory objective came back "not yet", that still has words
 * the learner can't produce, hasn't had its second pass (or declined it), and
 * was finished in the last two weeks. Older lessons are left to review and to
 * Your mistakes — a returning learner is not handed a wall of second passes.
 */
export function secondPass(course, state = {}, progress = {}, { now = Date.now() } = {}) {
  const done = state?.done || {}, results = state?.results || {}, second = state?.second || {};
  let latest = null;
  for (const m of course?.modules || []) {
    for (const l of m.lessons) {
      const ts = done[l.id];
      if (typeof ts === "number" && (!latest || ts > latest.ts)) latest = { module: m, lesson: l, ts };
    }
  }
  if (!latest || latest.lesson.kind === "task") return null;
  const { module, lesson, ts } = latest;
  if (second[lesson.id] || now - ts > SECOND_PASS_DAYS * DAY) return null;
  const recall = (lesson.objectives || []).find((o) => o.type === OBJECTIVE.RECALL);
  const res = recall ? results[lesson.id]?.objectives?.[recall.id] : null;
  if (!res || res.status !== "not-yet") return null;
  const ids = lesson.items.filter((id) => !canRecall(progress[id]));
  if (!ids.length) return null;
  return { module, lesson, ids: ids.slice(0, SECOND_PASS_MAX) };
}

/**
 * The second-pass session: the words again as cards, then each one found among
 * options, then each one written from memory (with hints allowed — this is
 * practice). Every word is found before any is written, so the writing is not
 * a copy of the card just seen.
 */
export function buildSecondPass(pack, lesson, ids, { progress = {}, disabled = null, rand = Math.random } = {}) {
  const pool = (pack?.vocab || []).filter((v) => !v.custom);
  const byId = new Map(pool.map((v) => [v.id, v]));
  const items = (ids || []).map((id) => byId.get(id)).filter(Boolean).slice(0, SECOND_PASS_MAX);
  if (!items.length || !lesson) return null;
  const off = asSet(disabled);
  const ex = [{
    type: EXERCISE.INTRODUCE_BATCH, items, again: true,
    prompt: `Look again at ${items.length} word${items.length === 1 ? "" : "s"}`,
  }];
  for (const v of shuffled(items, rand)) {
    const e = buildOfType(v, EXERCISE.PICK_WORD, pool, progress, off);
    if (e) ex.push({ ...e, pass: "find" });
  }
  for (const v of shuffled(items, rand)) {
    const e = !off.has(EXERCISE.RECALL_WRITE)
      ? buildOfType(v, EXERCISE.RECALL_WRITE, pool, progress, off)
      : !off.has(EXERCISE.SPEAK_PROMPT)
      ? { type: EXERCISE.SPEAK_PROMPT, item: v, answer: v.lemma, prompt: "Say it from memory", mode: SPEAK_MODE.RECALL }
      : null;
    if (e) ex.push({ ...e, pass: "write" });
  }
  return {
    mode: "second",
    exercises: ex,
    secondPass: { lessonId: lesson.id, title: lesson.title, ids: items.map((v) => v.id) },
  };
}

// ---------------------------------------------------------------------------
// SKILL DRILLS
// ---------------------------------------------------------------------------
export const DRILL_SIZE = 8;
export const DRILL_MIN = 4;

/** The skills that can be drilled here, and what a drill of each is. */
export const DRILLS = {
  listening: { label: "Listening drill", blurb: "Hear a word, then pick it or write it." },
  writing: { label: "Writing drill", blurb: "Write your words from memory." },
  reading: { label: "Reading drill", blurb: "Your words in sentences: complete them, order them, fix them." },
  grammar: { label: "Sentence drill", blurb: "Build and complete whole sentences." },
  vocabulary: { label: "Word drill", blurb: "The words you're closest to forgetting." },
};

const DICTATION = "dictation";
const KINDS = {
  listening: [EXERCISE.LISTEN_PICK, DICTATION],
  writing: [EXERCISE.RECALL_WRITE],
  reading: [EXERCISE.COMPLETE_SENTENCE, EXERCISE.FIX_SENTENCE, EXERCISE.TAP_WORDS],
  grammar: [EXERCISE.BUILD_SENTENCE, EXERCISE.COMPLETE_SENTENCE, EXERCISE.TAP_WORDS],
  vocabulary: [EXERCISE.PICK_WORD, EXERCISE.RECALL_WRITE, EXERCISE.PICK_MEANING],
};

/** The exercise types a drill of this skill may contain (as logged). */
export function drillTypes(skill) {
  return (KINDS[skill] || []).map((k) => (k === DICTATION ? DICTATION : k));
}

/**
 * A drill for one skill: up to DRILL_SIZE exercises of that skill's types, one
 * per learned word, weakest memory first. Null when fewer than DRILL_MIN can
 * be built — a three-question "drill" is not offered. Exercise types the
 * learner has switched off are never used, and listening is only built from
 * words that can be heard.
 */
export function buildSkillDrill(skill, pack, progress = {}, { size = DRILL_SIZE, disabled = null, canHear = null, rand = Math.random } = {}) {
  const kinds = KINDS[skill];
  if (!kinds) return null;
  const off = asSet(disabled);
  const pool = (pack?.vocab || []).filter((v) => !v.custom && v.lemma && v.translation);
  const learned = pool
    .filter((v) => (progress[v.id]?.reps || 0) > 0)
    .sort((a, b) => retrievability(progress[a.id]) - retrievability(progress[b.id]));
  const hear = (v) => { try { return typeof canHear === "function" && !!canHear(v); } catch { return false; } };

  const make = (v, kind) => {
    if (kind === DICTATION) {
      if (off.has(EXERCISE.LISTEN_PICK) || off.has(EXERCISE.RECALL_WRITE) || !hear(v) || v.lemma.length > 24) return null;
      return buildDictation(v);
    }
    if (off.has(kind)) return null;
    if (kind === EXERCISE.LISTEN_PICK && !hear(v)) return null;
    if (kind === EXERCISE.FIX_SENTENCE) return buildFixSentence(v, pool, { rand });
    const e = buildOfType(v, kind, pool, progress, off);
    // The builders fall back to a simpler question when a word can't carry the
    // one asked for. A fallback is not this skill's exercise: leave it out.
    return e && e.type === kind ? e : null;
  };

  const ex = [];
  for (const v of learned) {
    if (ex.length >= size) break;
    for (let k = 0; k < kinds.length; k++) {
      const e = make(v, kinds[(ex.length + k) % kinds.length]);
      if (e) { ex.push({ ...e, drill: skill }); break; }
    }
  }
  if (ex.length < DRILL_MIN) return null;
  return { mode: "skill", skill, exercises: ex };
}

/** Which skills have a drill available right now. */
export function availableDrills(pack, progress = {}, opts = {}) {
  return Object.keys(DRILLS).filter((s) => !!buildSkillDrill(s, pack, progress, opts));
}

// ---------------------------------------------------------------------------
// FIND YOUR LEVEL
// ---------------------------------------------------------------------------
export const PROBE_SIZE = 12;
export const PROBE_PASS = 11;
// A chapter must be big enough that twelve questions are a SAMPLE of it. 18
// words keeps the smallest packs in (Malayalam and Tamil's
// first chapter has 22 words: 12 questions ask about just over half of it).
export const PROBE_MIN_WORDS = 18;

/** The chapters that can be probed, in order. Stops at the first too small to judge. */
export function placementStages(pack) {
  const out = [];
  const n = completeChapterCount((pack?.units || []).length);
  for (let c = 1; c <= n; c++) {
    const ids = chapterVocabIds(pack.vocab || [], c);
    if (ids.length < PROBE_MIN_WORDS) break;
    out.push({
      num: c,
      ids,
      unitTitles: unitIndicesForChapter(c).map((i) => pack.units?.[i]?.title).filter(Boolean),
    });
  }
  return out;
}

/**
 * Twelve questions on one chapter: words drawn evenly from its units, alternating
 * direction (see the word → its meaning; see the meaning → the word), four
 * options each with exactly one right (games.js rushQuestion, which Word Rush
 * already relies on for that).
 */
export function probeQuestions(stage, pack, rand = Math.random) {
  const pool = (pack?.vocab || []).filter((v) => !v.custom && v.lemma && v.translation);
  const byId = new Map(pool.map((v) => [v.id, v]));
  const byUnit = new Map();
  for (const id of stage?.ids || []) {
    const w = byId.get(id);
    if (!w) continue;
    if (!byUnit.has(w.unit)) byUnit.set(w.unit, []);
    byUnit.get(w.unit).push(w);
  }
  const lists = [...byUnit.values()].map((l) => shuffled(l, rand));
  const out = [];
  for (let i = 0; out.length < PROBE_SIZE && lists.some((l) => l.length); i++) {
    const l = lists[i % lists.length];
    const item = l.pop();
    if (!item) continue;
    const q = rushQuestion(item, pool, out.length % 2 ? "word" : "meaning", rand);
    if (q.options.length === 4) out.push(q);
  }
  return out;
}

/** Where a probe stands after these answers (true = right): "asking" | "passed" | "failed". */
export function probeVerdict(answers = [], size = PROBE_SIZE, pass = PROBE_PASS) {
  const right = answers.filter(Boolean).length;
  const wrong = answers.length - right;
  if (wrong > size - pass) return "failed";      // can no longer pass — stop asking
  if (right >= pass) return "passed";            // already passed — stop asking
  return answers.length >= size ? "failed" : "asking";
}

/** After `passed` chapters in a row from the first: where the learner starts. */
export function placementOutcome(stages = [], passed = 0) {
  const n = Math.max(0, Math.min(passed, stages.length));
  return {
    passed: n,
    start: n < stages.length ? stages[n] : null,           // null: past everything that can be probed
    skippedWords: stages.slice(0, n).reduce((sum, s) => sum + s.ids.length, 0),
  };
}
