// =============================================================================
// romanisation.mjs (v100) — shared romanisation helpers.
//
// foldConvention and stemMatch lived inside validate-word-truth.mjs, and
// validate-word-frames.mjs needs exactly the same two ideas: what counts as
// "the same sounds spelled a different defensible way", and what counts as
// "the same word, inflected". A second copy of either would drift, and the
// whole point of both checks is that they agree with each other about what a
// word is.
// =============================================================================

/**
 * Fold away the differences between romanisation CONVENTIONS, so the check
 * reports disagreements about the WORD rather than about the system used to
 * write it. Without this the output is 68 warnings of which about six matter.
 *
 * These are all the same sound spelled two defensible ways:
 *   macron vs wapuro      sayōnara / sayounara,  jū / juu,  kyō / kyou
 *   the hamza and ayn     ra's / raas,  ma'a / maa,  ba'd / baad
 *   long-vowel doubling   pani / paani,  suq / suuq
 *   pinyin tone marks     bù / bú  — the sandhi is deliberate, and marked
 *
 * The vocab `translit` field cannot simply be normalised to match: audio/tts.js
 * feeds it to a near-language voice as a pronunciation fallback, and Hindi and
 * Urdu convert it back to Devanagari for speech scoring. It has a second job,
 * and macrons and apostrophes are not safe in it.
 */
export function foldConvention(s) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")  // ō→o, bù→bu, â→a
    .replace(/['’ʻ`\-]/g, "")                          // ra's→ras, li-anna→lianna
    .replace(/ou/g, "o").replace(/([aeiou])\1+/g, "$1") // wapuro & doubling
    .replace(/([a-z])\1+/g, "$1");                      // shukkran→shukran
}

/** Is `needle` traceable inside `hay`, allowing for inflection at either end? */
export function stemMatch(hay, needle) {
  if (!needle) return true;
  const h = hay.toLowerCase(), n = needle.toLowerCase();
  if (h.includes(n)) return true;
  // Allow the word to have been inflected: try progressively shorter stems,
  // never below 3 characters or half the word, whichever is longer.
  const floor = Math.max(3, Math.ceil(n.length / 2));
  for (let len = n.length - 1; len >= floor; len--) {
    if (h.includes(n.slice(0, len))) return true;
  }
  return false;
}
