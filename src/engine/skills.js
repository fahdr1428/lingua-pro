// =============================================================================
// SKILLS — separate progress for each skill, and a stage for each word.
//
// Proficiency is not one number. A learner can recognise 300 words and produce
// 40, read a sentence and be unable to build one. This module turns the answer
// log (Engine.recordAttempt) into:
//
//   · a SKILL PROFILE: vocabulary, grammar, reading, listening, writing,
//     speaking, interaction, each with a score, a confidence, and an honest
//     "not enough evidence yet" when there isn't any;
//   · a MASTERY STAGE per word: new → introduced → knowledge → recall →
//     application → secure (docs/ZABAN_LEARNING_ENGINE.md §2).
//
// HOW A SCORE IS MADE. Each answer is evidence about the skills its exercise
// uses (SKILLS_OF below). An answer produced from memory counts fully; one
// chosen from options counts 70%, because the right answer was on the screen.
// A hint or a near-miss counts half. So a learner who has only ever chosen from
// options cannot score above 70 — recognition is not mastery.
//
// CONFIDENCE. Under MIN_EVIDENCE answers for a skill, there is no score, only
// "not enough evidence yet". Confidence rises with more answers and more days
// with answers; a score from one sitting says little about memory.
//
// Pure functions. Loaded lazily by the screens that show skills.
// =============================================================================

export const SKILLS = ["vocabulary", "grammar", "reading", "listening", "writing", "speaking", "interaction"];

export const SKILL_LABEL = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  reading: "Reading",
  listening: "Listening",
  writing: "Writing",
  speaking: "Speaking",
  interaction: "Conversation",
};

/** Which skills an exercise type gives evidence for. */
export const SKILLS_OF = {
  pick_meaning: ["vocabulary", "reading"],
  pick_word: ["vocabulary"],
  true_false: ["vocabulary"],
  match_pairs: ["vocabulary"],
  odd_one_out: ["vocabulary"],
  type_translation: ["vocabulary", "reading"],
  listen_pick: ["listening", "vocabulary"],
  recall_write: ["vocabulary", "writing"],
  dictation: ["listening", "writing"],
  fix_sentence: ["reading", "vocabulary"],
  letter_scramble: ["writing"],
  complete_sentence: ["reading", "grammar"],
  tap_words: ["reading", "grammar"],
  build_sentence: ["grammar", "writing"],
  conjugate: ["grammar"],
  conjugate_tense: ["grammar"],
  speak_prompt: ["speaking"],
  grammar_check: ["grammar"],
  dialogue: ["interaction"],
  dialogue_pick: ["interaction", "listening"],
  passage: ["reading"],
  mission: ["interaction"],
};

/** Exercise types where the answer was on the screen to choose. */
export const CHOSEN = new Set([
  "pick_meaning", "pick_word", "true_false", "match_pairs", "odd_one_out", "listen_pick",
  "complete_sentence", "conjugate", "conjugate_tense", "grammar_check", "dialogue_pick", "passage", "fix_sentence",
]);

export const MIN_EVIDENCE = 12;   // answers before a skill shows a score
export const WINDOW = 60;         // most recent answers per skill that count

/** How much one logged answer is worth, 0..1. */
export function credit(a) {
  if (!a || !a.ok) return 0;
  const supported = (a.h || 0) > 0 || a.v === "close" || a.v === "alternative";
  const base = CHOSEN.has(a.t) ? 0.7 : 1;
  return supported ? base * 0.5 : base;
}

const DAY = 86400000;

/**
 * The skill profile for one language's answer log.
 * @param {Array} attempts  [{t, ts, ok, h?, v?}]
 * @returns {{skills: Object<string, {score:number|null, n:number, days:number, confidence:string}>, focus: string|null}}
 */
export function skillProfile(attempts = [], { now = Date.now() } = {}) {
  const by = Object.fromEntries(SKILLS.map((s) => [s, []]));
  for (const a of attempts) {
    for (const s of SKILLS_OF[a?.t] || []) by[s].push(a);
  }
  const skills = {};
  for (const s of SKILLS) {
    const recent = by[s].slice(-WINDOW);
    const n = recent.length;
    const days = new Set(recent.map((a) => Math.floor((a.ts || 0) / DAY))).size;
    if (n < MIN_EVIDENCE) {
      skills[s] = { score: null, n, days, confidence: "none" };
      continue;
    }
    const score = Math.round((100 * recent.reduce((x, a) => x + credit(a), 0)) / n);
    const confidence = n >= 40 && days >= 3 ? "high" : days >= 2 ? "medium" : "low";
    skills[s] = { score, n, days, confidence };
  }
  // The skill to work on: the lowest-scoring one with evidence, or — if
  // nothing has evidence yet — the productive skill with the least practice.
  const scored = SKILLS.filter((s) => skills[s].score !== null).sort((a, b) => skills[a].score - skills[b].score);
  let focus = scored[0] || null;
  if (scored.length >= 2 && skills[scored[0]].score >= 85) focus = null;
  if (!focus) {
    const productive = ["speaking", "writing", "interaction"].sort((a, b) => skills[a].n - skills[b].n);
    if (attempts.length >= MIN_EVIDENCE) focus = productive[0];
  }
  void now;
  return { skills, focus };
}

/** Why a skill is the focus, in one plain sentence. */
export function focusReason(profile) {
  const f = profile?.focus;
  if (!f) return null;
  const s = profile.skills[f];
  if (s.score === null) return `You haven't practised ${SKILL_LABEL[f].toLowerCase()} much yet.`;
  return `${SKILL_LABEL[f]} is your lowest score (${s.score}).`;
}

// ---------------------------------------------------------------------------
// MASTERY STAGES per word.
// ---------------------------------------------------------------------------
export const STAGES = ["new", "introduced", "knowledge", "recall", "application", "secure"];

export const STAGE_LABEL = {
  new: "Not started",
  introduced: "Introduced",
  knowledge: "Recognised",
  recall: "From memory",
  application: "Used in sentences",
  secure: "Secure",
};

const CONSTRUCT = new Set(["build_sentence", "tap_words", "complete_sentence", "dialogue"]);

/**
 * The stage of one word.
 *  · introduced  — met, not yet answered right
 *  · knowledge   — recognised (answered right, but only by choosing)
 *  · recall      — produced from memory (card.recalls ≥ 1)
 *  · application — recalled AND used correctly in a sentence or exchange
 *  · secure      — recalled at least twice, used, and remembered over a week
 *                  of spaced reviews (FSRS stability ≥ 7 days)
 * `usedIn` is the set of word ids answered right in a construction exercise.
 */
export function stageOf(card, id, usedIn = new Set()) {
  if (!card || !(card.reps > 0)) return "new";
  const failedLast = card.lastRating === 1 || card.lastRating === "again";
  // Same rule as recall.js canRecall: cards from before v113 that earned a
  // week's stability count as one recall.
  const recalls = typeof card.recalls === "number" ? card.recalls : (card.stability || 0) >= 7 ? 1 : 0;
  const used = usedIn.has(id);
  if (!failedLast && recalls >= 2 && used && (card.stability || 0) >= 7) return "secure";
  if (!failedLast && recalls >= 1 && used) return "application";
  if (!failedLast && recalls >= 1) return "recall";
  if (!failedLast) return "knowledge";
  return "introduced";
}

/** Ids answered right in sentence-building or exchange exercises. */
export function usedInSentences(attempts = []) {
  const out = new Set();
  for (const a of attempts) {
    if (a?.ok && CONSTRUCT.has(a.t) && !(a.h > 0)) for (const id of [].concat(a.id || [])) out.add(id);
  }
  return out;
}

/** Count of words at each stage, for a set of ids. */
export function stageCounts(ids, progress = {}, attempts = []) {
  const usedIn = usedInSentences(attempts);
  const counts = Object.fromEntries(STAGES.map((s) => [s, 0]));
  for (const id of ids) counts[stageOf(progress[id], id, usedIn)]++;
  return counts;
}
