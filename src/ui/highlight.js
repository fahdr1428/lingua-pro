// Where a word ends, in the scripts that put spaces between words.
const BOUNDARY = /[\s.,!?;:،؛؟۔।॥"“”„«»()\[\]…—–-]/;
const UNSPACED = new Set(["zh", "ja"]);

/**
 * Where to draw the highlight: [start, end) in `native`, or null.
 *
 * v118 — NEVER PART OF A JOINED WORD. The match is a substring, and in a
 * script whose letters join that did two wrong things at once: سلام inside
 * السلام was marked as ال|سلام, which breaks the lam–sin join so the word is
 * drawn as two pieces, and what it marked wasn't the word in the sentence
 * anyway. In every non-Latin script that uses spaces the highlight now covers
 * the WHOLE word the match falls in. Latin scripts keep the part-word match
 * (it finds "habl" forms and breaks nothing); Chinese and Japanese have no
 * spaces and no joining, so they keep it too.
 */
export function highlightRange(native, lemma, { nonLatin = false, code = "" } = {}) {
  if (!native || !lemma || lemma.length < 2) return null;
  const at = native.toLowerCase().indexOf(lemma.toLowerCase());
  if (at < 0) return null;
  let start = at, end = at + lemma.length;
  if (nonLatin && !UNSPACED.has(code)) {
    while (start > 0 && !BOUNDARY.test(native[start - 1])) start--;
    while (end < native.length && !BOUNDARY.test(native[end])) end++;
  }
  return [start, end];
}
