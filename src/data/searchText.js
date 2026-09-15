// =============================================================================
// searchText.js (v104) — fold a string down to what someone can actually type.
//
// WHY THIS IS NOT JUST toLowerCase()
//
// This app teaches twenty-one languages, and ten of them are written in the
// Latin alphabet plus marks that an English keyboard cannot produce without
// effort most people will not make while searching a word list:
//
//     Vietnamese   chào  ngủ  đường  tiếng
//     Yoruba       ọkọ̀   ẹ̀yìn  ṣùgbọ́n
//     Turkish      değil  şey  ısı
//     Somali       waxbá
//     Spanish      añejo  ¿qué?
//
// A learner looking for "chao" should find "chào". Requiring the grave accent
// means the search box only works for people who already know the word well
// enough not to need it.
//
// HOW: NFD splits a letter from its combining marks, and the combining marks
// are then dropped. That covers every accent, the Vietnamese tone marks, and
// the Yoruba sub-dot, because all of them decompose. The handful that do NOT
// decompose are listed explicitly — `đ`, `ø`, `ł`, `ı` and their kin are
// single letters in Unicode with no accented base to strip, so NFD leaves them
// alone and a Vietnamese learner typing "duong" would still miss "đường".
//
// Folding is applied to BOTH the query and the text, so an exactly-typed query
// still matches: "chào" folds to "chao" on both sides.
//
// Deliberately NOT a general-purpose collation. It is a search convenience for
// Latin-script text; the non-Latin packs carry a romanisation that is already
// plain ASCII, and folding leaves it untouched.
// =============================================================================

// Letters whose "plain" form Unicode does not give us by decomposition.
const STANDALONE = {
  "đ": "d", "Đ": "d",   // Vietnamese d-with-stroke — a distinct letter, not a d
  "ð": "d", "Ð": "d",
  "ø": "o", "Ø": "o",
  "ł": "l", "Ł": "l",
  "ı": "i", "İ": "i",   // Turkish dotless i, and dotted capital I
  "ß": "ss",
  "æ": "ae", "Æ": "ae",
  "œ": "oe", "Œ": "oe",
  "ŋ": "ng", "Ŋ": "ng", // used in some West African orthographies
  "ʼ": "'", "’": "'", "‘": "'",
};

/**
 * @param {string|undefined|null} s
 * @returns {string} lower-case, mark-free, safe to call on anything
 */
export function foldForSearch(s) {
  if (!s) return "";                 // undefined translit was the crash; never again
  let out = String(s).toLowerCase();
  out = out.replace(/[đĐðÐøØłŁıİßæÆœŒŋŊʼ’‘]/g, (c) => STANDALONE[c] ?? c);
  // NFD first, then drop combining marks (U+0300–U+036F covers Latin accents,
  // Vietnamese tones and the Yoruba sub-dot once decomposed).
  out = out.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return out.trim();
}
