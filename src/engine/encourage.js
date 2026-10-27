// =============================================================================
// encourage.js (v111) — what the end of a lesson can honestly say.
//
// "Great job!" is the same sentence on day one and day ninety, and learners
// learn to skim it. Encouragement that works points at something TRUE and
// SPECIFIC the learner can now do. So the results screen shows:
//
//   · NOW YOU CAN SAY — real sentences built on words they produced in this
//     lesson (v113: written or said from memory, not merely chosen), with
//     sound: evidence, not praise
//   · their speaking this lesson, and how close the next speaking level is
//   · a milestone when their known words cross 10, 25, 50, 100…
//   · v113: the words they wrote from memory, with no hint — the strongest
//     evidence a lesson can produce that a word is theirs
//
// Everything here is pure, so the claims it makes can be tested.
// =============================================================================

import { speakableSentence, speakingLevel } from "./speaking.js";

export const LEARNED_MILESTONES = [10, 25, 50, 100, 150, 200, 300, 400, 500];

/** The largest milestone crossed going from `before` to `after` known words, or null. */
export function crossedMilestone(before, after) {
  let hit = null;
  for (const m of LEARNED_MILESTONES) if (before < m && after >= m) hit = m;
  return hit;
}

/** What crossing a milestone means, said plainly. */
export function milestoneLine(m, langName) {
  if (m >= 300) return `${m} ${langName} words. Most everyday conversation runs on fewer than that — you're past the point where it stays foreign.`;
  if (m >= 100) return `${m} ${langName} words. That's the core that the most common sentences are built from.`;
  if (m >= 50) return `${m} ${langName} words — enough to start following simple sentences when you hear them.`;
  if (m >= 25) return `${m} ${langName} words. You can greet, ask, thank and answer about yourself.`;
  return `Your first ${m} ${langName} words. The hardest ten of any language are the first ten.`;
}

/**
 * Up to `max` sentences the learner can now say: from the words in `rightIds`
 * (the lesson passes the ones produced from memory), new words first (that's
 * what today added), one per word, no sentence twice.
 */
export function sayNow(items, rightIds, { introducedIds = new Set(), max = 2 } = {}) {
  const right = (items || []).filter((it) => it?.id && rightIds?.has(it.id));
  const seen = new Set(), out = [], usedText = new Set();
  const ordered = [...right.filter((it) => introducedIds.has(it.id)), ...right.filter((it) => !introducedIds.has(it.id))];
  for (const it of ordered) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    const s = speakableSentence(it);
    if (!s || usedText.has(s.native)) continue;
    usedText.add(s.native);
    out.push({ item: it, sentence: s });
    if (out.length >= max) break;
  }
  return out;
}

/**
 * v113: what writing words from memory this lesson adds up to. Only answers
 * given with no hint count as "from memory" — `right` is those, out of `asked`.
 */
export function memoryLine(right, asked) {
  if (!asked) return null;
  if (right === asked) {
    return asked === 1
      ? "You wrote it from memory, with nothing on screen to choose from."
      : `You wrote all ${asked} from memory, with nothing on screen to choose from.`;
  }
  if (right > 0) return `You wrote ${right} of ${asked} from memory. The others will be back soon, and each try makes the next one easier.`;
  return "None came from memory this time, which is normal while words are new. They'll be back soon, and each try makes the next one easier.";
}

/** This lesson's speaking, against the ladder. */
export function speakingSummary(passesBefore, passed, attempts) {
  const before = speakingLevel(passesBefore);
  const after = speakingLevel(passesBefore + passed);
  return { passed, attempts, level: after, levelUp: after.level > before.level };
}
