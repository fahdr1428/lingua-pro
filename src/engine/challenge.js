// =============================================================================
// challenge.js (v113) — keep every lesson hard enough to think, never so hard
// it's guessing.
//
// A fixed lesson is the wrong difficulty for almost everyone who takes it. The
// learner who already knows the words coasts through four-option questions at
// 95% — clicking, not thinking — and the learner who is struggling meets
// from-memory questions they can't yet answer, fails half of them and learns
// that the app makes them feel stupid. Learning is fastest in between: most
// answers right, enough wrong that every answer takes effort. Wilson et al.
// (2019, "The Eighty Five Percent Rule for optimal learning") put the sweet
// spot for this kind of training at roughly 85% correct; the classic "zone of
// proximal development" is the same idea from the other side.
//
// So the lesson watches its own success rate as it goes, over the last few
// answers, and adjusts the NEXT suitable question:
//
//   breezing (≥ HIGH right)   the next choose-from-options question about a word
//                             the learner has already met becomes from-memory
//   struggling (≤ LOW right)  the next from-memory question becomes pick-the-word,
//                             with the answer on screen — a win to rebuild from
//
// One change at a time, then a pause (COOLDOWN answers) to see what it did.
// Never in an exam or a checkpoint: those have to measure, not coach.
//
// The thresholds were tuned against simulated learners in
// scripts/test-challenge.mjs, which also proves the adjustment moves strong,
// average and struggling learners toward the band, and that a fixed lesson
// doesn't.
// =============================================================================

export const CHALLENGE = {
  window: 6,         // judge on the last six answers
  minAnswered: 4,    // and not before there are four
  high: 0.83,        // 5 of 6, or 4 of 4: stretch them…
  steady: 0.75,      // …but only if the whole lesson is going that well, not one lucky run
  low: 0.6,          // 3 of 5–6 or fewer: support them
  cooldownUp: 2,     // after stretching, wait two answers to see what it did
  cooldownDown: 0,   // support comes at once: a run of failures costs more than a run of easy wins
};

// What a question gives away. Choosing has the answer on screen; producing it
// from memory gives nothing.
const SUPPORTED = new Set(["pick_meaning", "pick_word", "listen_pick", "true_false", "complete_sentence"]);
const FROM_MEMORY = "recall_write";

/** "up", "down" or "hold", from this lesson's graded answers so far (oldest first, true = right). */
export function challengeDecision(results, cfg = CHALLENGE) {
  const recent = (results || []).slice(-cfg.window);
  if (recent.length < cfg.minAnswered) return "hold";
  const rate = recent.filter(Boolean).length / recent.length;
  const overall = results.filter(Boolean).length / results.length;
  if (rate >= cfg.high && overall >= cfg.steady) return "up";
  if (rate <= cfg.low) return "down";
  return "hold";
}

/**
 * Which upcoming exercise to change, and into what — or null.
 *
 * Looks at most `lookahead` questions ahead. A question is only made harder if
 * its word has already been met — before this lesson (`progress`) or earlier in
 * it (an introduction before it) — because asking someone to produce a word
 * they have never seen is a guessing game, not a challenge. And only if the
 * word hasn't already been asked from memory in this lesson: the browser test
 * caught a perfect run writing one new word from memory three times in seven
 * questions, which is repetition, not challenge.
 */
export function planAdjustment(exercises, fromIdx, decision, { progress = {}, lookahead = 5, disabled = null } = {}) {
  if (decision !== "up" && decision !== "down") return null;
  // Switched off in Settings: never stepped up INTO it. (Stepping down out of
  // it is still fine — there would be nothing to step down from.)
  if (decision === "up" && (disabled || []).includes(FROM_MEMORY)) return null;
  const metInLesson = new Set(), recalledInLesson = new Set();
  for (let i = 0; i < fromIdx && i < exercises.length; i++) {
    const ex = exercises[i];
    if (ex?.type === "introduce_batch") for (const it of ex.items || []) metInLesson.add(it.id);
    if (ex?.item?.id) metInLesson.add(ex.item.id);
    if (ex?.type === FROM_MEMORY && ex.item?.id) recalledInLesson.add(ex.item.id);
  }
  for (let i = fromIdx; i < exercises.length && i < fromIdx + lookahead; i++) {
    const ex = exercises[i];
    if (!ex?.item || ex.pretest || ex.practice || ex.round || ex.challenge) continue;
    if (ex.type === "introduce_batch" || ex.type === "introduce") continue;
    const met = metInLesson.has(ex.item.id) || (progress[ex.item.id]?.reps || 0) > 0;
    if (decision === "up" && SUPPORTED.has(ex.type) && met && !recalledInLesson.has(ex.item.id)) return { index: i, to: FROM_MEMORY };
    if (decision === "down" && ex.type === FROM_MEMORY) return { index: i, to: "pick_word" };
  }
  return null;
}

/**
 * The whole step for one answer: record it, decide, and return what to change.
 * `state` is { results: boolean[], quietUntil: number } and is returned updated.
 * Pure — the lesson screen holds the state and applies the change.
 */
export function afterAnswer(state, correct, exercises, idx, { progress = {}, exam = false, disabled = null, cfg = CHALLENGE } = {}) {
  const results = [...(state?.results || []), !!correct];
  const answered = results.length;
  const next = { results, quietUntil: state?.quietUntil || 0 };
  if (exam || answered < next.quietUntil) return { state: next, change: null };
  const decision = challengeDecision(results, cfg);
  const change = planAdjustment(exercises, idx + 1, decision, { progress, disabled });
  if (change) next.quietUntil = answered + (decision === "up" ? cfg.cooldownUp : cfg.cooldownDown);
  return { state: next, change: change ? { ...change, direction: decision } : null };
}
