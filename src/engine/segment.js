// =============================================================================
// SEGMENT — split a sentence into the tiles a learner arranges.
//
// Most languages here put spaces between words, so a sentence's tiles are its
// space-separated words. Chinese and Japanese don't. Splitting on spaces gave
// every Mandarin example sentence ONE tile, so Mandarin learners never got a
// sentence to build: the builders saw "too short" and fell back to an easier
// question (measured: 0 of 262 Mandarin examples had a space, 33 of 258
// Japanese ones).
//
// For those two, the sentence is split into words the pack TEACHES, longest
// first (plus Japanese particles as their own tiles). If any part of the
// sentence isn't a taught word, the answer is null: no tiles at all is better
// than a guessed word boundary that teaches the wrong thing.
// =============================================================================

/** Languages written without spaces between words. */
export const NO_SPACE = new Set(["zh", "ja"]);

export const PUNCT = /[.,!?;:¿¡"“”‘’«»()[\]{}…—–\-،؛؟۔।॥、。，！？；：「」『』（）]/g;

// Particles and the copula's polite endings, which follow a word in Japanese.
// Only used to split; nothing is taught from this list.
const JA_PARTICLES = ["です", "ます", "は", "が", "を", "に", "で", "と", "も", "の", "へ", "か", "ね", "よ"];

/** The lemmas a no-space language may be split into (taught words only). */
export function lemmaSet(vocab) {
  const set = new Set();
  for (const v of vocab || []) {
    if (!v?.lemma || v.custom) continue;
    const l = String(v.lemma).replace(PUNCT, "").replace(/\s+/g, "");
    if (l) set.add(l);
  }
  return set;
}

/**
 * Tiles for a sentence, or null when it can't be split safely (or is a single
 * tile, which is nothing to arrange).
 */
export function segment(text, code, lemmas) {
  if (!NO_SPACE.has(code)) {
    const parts = String(text || "").split(/\s+/).filter(Boolean);
    return parts.length >= 2 ? parts : null;
  }
  const s = String(text || "").replace(PUNCT, "").replace(/\s+/g, "");
  if (!s) return null;
  const dict = lemmas instanceof Set ? lemmas : new Set(lemmas || []);
  const extra = code === "ja" ? JA_PARTICLES : [];
  let maxLen = 1;
  for (const l of dict) maxLen = Math.max(maxLen, [...l].length);
  const chars = [...s];
  const out = [];
  let i = 0;
  while (i < chars.length) {
    let hit = null;
    for (let len = Math.min(maxLen, chars.length - i); len >= 1; len--) {
      const piece = chars.slice(i, i + len).join("");
      if (dict.has(piece) || extra.includes(piece)) { hit = piece; break; }
    }
    if (!hit) return null;
    out.push(hit);
    i += [...hit].length;
  }
  return out.length >= 2 ? out : null;
}
