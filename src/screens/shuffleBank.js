// =============================================================================
// shuffleBank.js (v98) — the Sentence Lab's word bank.
//
// Its own file so it can be tested without a browser. What it replaced was:
//
//     arr.slice().sort(() => Math.random() - 0.5)
//
// which is a biased shuffle, and on a TWO-chunk pattern came out in the correct
// order roughly half the time. Several level-1 patterns are two chunks — "Ich
// trinke", "Kumakain ako", "دستشویی کجاست؟" — so every other learner opened the
// build step to find the sentence already assembled and was asked to build it.
// =============================================================================

/**
 * @param {Array<object>} chunks the pattern's chunks, in the correct order
 * @returns {Array<object>} the same chunks, tagged with `_id` = correct index,
 *   in an order that is not the correct one (when more than one chunk).
 */
export function shuffleBank(chunks) {
  const arr = chunks.map((c, i) => ({ ...c, _id: i }));
  if (arr.length < 2) return arr;
  const inOrder = (a) => a.every((c, i) => c._id === i);
  for (let attempt = 0; attempt < 12; attempt++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (!inOrder(arr)) return arr;
  }
  // Vanishingly unlikely; swap the first two rather than hand back the answer.
  [arr[0], arr[1]] = [arr[1], arr[0]];
  return arr;
}
