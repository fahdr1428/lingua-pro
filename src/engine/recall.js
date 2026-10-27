// =============================================================================
// recall.js (v113) — grading a word written FROM MEMORY.
//
// WHY THIS EXISTS. Until v113, three-quarters of every lesson was choosing from
// options — even three months in — and nothing ever asked a learner to produce
// a word in the language from memory. Choosing tests recognition: the answer is
// on screen and you only have to know it when you see it. Producing it with
// nothing to lean on is a different and much stronger kind of retrieval, and it
// is the one that builds words you can actually USE: the testing effect is
// larger for recall than for recognition (Kang, McDermott & Roediger 2007;
// Carpenter & DeLosh 2006), and practising in the productive direction is what
// builds productive knowledge (Schneider, Healy & Bourne 2002; Nation).
//
// So lessons now ask "how do you write 'thank you'?" with an empty box. That
// only works if the box is FAIR, which across 21 languages and five scripts
// means:
//
//   · romanisation counts — a learner who can say شکریہ but not type it, or is
//     on a phone with no Urdu keyboard, types "shukriya" and is right
//   · the long and short of romanisation is forgiven (paani = pani) and so are
//     pinyin tone marks, which most keyboards can't type
//   · keyboard variants of the same Arabic-script letter are the same letter
//     (Arabic ي/ك vs Urdu ی/ک), and harakat are never required
//   · a missing accent, a missing German/Spanish/French article, or a one-letter
//     slip is CLOSE: right word, and here's how it's spelled
//   · but typing a DIFFERENT real word is never "close": "perro" for "pero" is
//     dog, not but, and saying so is the most useful thing the grader can do
//   · typing another word with the same meaning is right (two words for tea)
//
// Pure functions, tested against every word of every pack in
// scripts/test-recall.mjs.
// =============================================================================

import { romanise, foldVowels, scriptOf } from "../audio/romanise.js";
import { sameMeaning } from "./games.js";

const ZERO_WIDTH = /[​-‏⁠﻿]/g;
const ARABIC_MARKS = /[ً-ٰٟـ]/g; // harakat, dagger alef, tatweel
const PUNCT = /[.,!?;:،؛؟。！？、"“”„«»‹›()[\]{}…]/g;

/** Same letter, different keyboard: what an Arabic, Persian or Urdu keyboard produces. */
function foldArabicLetters(s) {
  return s
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[يىي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[ه]/g, "ہ");
}

/** The key a native-script answer is compared on. Case, punctuation, harakat and keyboard variants don't matter. */
export function nativeKey(s) {
  return foldArabicLetters(
    String(s || "").normalize("NFC").toLowerCase().replace(/ß/g, "ss")
      .replace(ZERO_WIDTH, "")
      .replace(ARABIC_MARKS, "")
      .replace(PUNCT, " ")
      .replace(/[-‐‑–—]/g, " ")
  ).replace(/\s+/g, " ").trim();
}

/** Latin text with its accents and tone marks taken off. */
export function marklessKey(s) {
  return nativeKey(s)
    .normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/ı/g, "i").replace(/ß/g, "ss").replace(/đ/g, "d").replace(/ø/g, "o").replace(/ł/g, "l").replace(/æ/g, "ae")
    .replace(/['’ʼ`]/g, "");
}

/** Romanisation, compared the way people actually type it: no marks, no spaces or apostrophes, vowel length folded. */
export function romanKey(s) {
  return foldVowels(marklessKey(s).replace(/[\s'’-]/g, ""));
}

const LATIN_LETTER = /\p{Script=Latin}/u;
const OTHER_LETTER = /[\p{L}]/u;
/** Is this word written in the Latin alphabet (accented or not)? */
export function isLatinWord(s) {
  const letters = [...String(s || "")].filter((ch) => OTHER_LETTER.test(ch));
  return letters.length > 0 && letters.every((ch) => LATIN_LETTER.test(ch));
}

// German, Spanish and French nouns are taught with their article ("die Frage").
// An article is a whole word followed by a space ("le" in "les gens" or "Leute"
// is not one), except French l' which runs into its noun.
const ARTICLE = /^(?:(?:der|die|das|den|dem|el|la|los|las|le|les|un|une|una|uno|ein|eine)\s+|l['’]\s*)/i;
function withoutArticle(s) {
  return String(s || "").replace(ARTICLE, "").trim();
}

/** Levenshtein distance on code points. */
export function editDistance(a = "", b = "") {
  const A = [...a], B = [...b];
  if (!A.length) return B.length;
  if (!B.length) return A.length;
  let prev = Array.from({ length: B.length + 1 }, (_, i) => i);
  for (let i = 1; i <= A.length; i++) {
    const cur = [i];
    for (let j = 1; j <= B.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[B.length];
}

/** How many slips a word of this length forgives: none for short words, where one letter is a different word. */
function slack(len) {
  return len <= 3 ? 0 : len <= 7 ? 1 : 2;
}

/** Every key a written word can be matched on. Cached per word object. */
const KEYS = new WeakMap();
function keysOf(word) {
  if (word && typeof word === "object" && KEYS.has(word)) return KEYS.get(word);
  const lemma = word?.lemma || "", translit = word?.translit || "";
  const latin = isLatinWord(lemma);
  const keys = {
    native: nativeKey(lemma),
    roman: !latin && translit ? romanKey(translit) : null,
    script: scriptOf(lemma),
  };
  if (word && typeof word === "object") KEYS.set(word, keys);
  return keys;
}

/** The keys of what the learner typed — computed once per answer. */
function answerKeys(text) {
  const r = romanise(text);
  // isLatinWord, not scriptOf: pinyin "è" is Latin with no plain a–z in it.
  return { native: nativeKey(text), roman: romanKey(text), fromScript: r ? romanKey(r) : null, script: isLatinWord(text) ? "latin" : scriptOf(text) };
}

function matchVia(gk, keys) {
  if (gk.native && gk.native === keys.native) return "native";
  if (!keys.roman) return null;
  // Romanisation counts for words in non-Latin scripts.
  if (gk.script === "latin" && gk.roman === keys.roman) return "romanisation";
  // An answer in ANOTHER non-Latin script (a Hindi keyboard for an Urdu word)
  // is compared by its rough phonetic skeleton. Never within the same script:
  // the skeleton is far too coarse for that — it took Arabic مع "with" for
  // ماء "water", and Hindi कम "less" for काम "work".
  if (gk.fromScript && gk.script && keys.script && gk.script !== keys.script && gk.fromScript === keys.roman) return "romanisation";
  return null;
}

/** Index of a pack's words by every key, built once per vocabulary array. */
const INDEX = new WeakMap();
function indexOf(vocab) {
  if (INDEX.has(vocab)) return INDEX.get(vocab);
  const byNative = new Map(), byRoman = new Map();
  for (const w of vocab) {
    if (!w?.lemma) continue;
    const k = keysOf(w);
    (byNative.get(k.native) || byNative.set(k.native, []).get(k.native)).push(w);
    if (k.roman) (byRoman.get(k.roman) || byRoman.set(k.roman, []).get(k.roman)).push(w);
  }
  const idx = { byNative, byRoman };
  INDEX.set(vocab, idx);
  return idx;
}

/**
 * Grade a word written from memory.
 *
 * @param {string} given    what the learner typed
 * @param {object} item     the word being asked ({ id, lemma, translit, translation })
 * @param {object} opts
 * @param {Array}  opts.vocab   the pack's words — to recognise a DIFFERENT real word, or a synonym
 * @param {Array}  opts.accept  extra forms that are right (the learner's dialect)
 * @returns {{ verdict: "exact"|"close"|"alternative"|"other-word"|"wrong"|"empty",
 *             correct: boolean, via?: string, note?: string, other?: object, expected: string }}
 */
export function gradeRecall(given, item, { vocab = [], accept = [] } = {}) {
  const expected = item?.lemma || "";
  const text = String(given || "").trim();
  if (!text) return { verdict: "empty", correct: false, expected };
  const gk = answerKeys(text);

  const via = matchVia(gk, keysOf(item));
  if (via) return { verdict: "exact", correct: true, via, expected };
  for (const form of accept) {
    if (form && matchVia(gk, keysOf({ lemma: form, translit: "" }))) return { verdict: "exact", correct: true, via: "native", expected };
  }

  // Another real word of this pack, typed exactly. Checked before "close", so a
  // different word is never mistaken for a misspelling of this one.
  const ownKey = nativeKey(expected);
  const idx = indexOf(vocab);
  const candidates = [
    ...(idx.byNative.get(gk.native) || []),
    ...(idx.byRoman.get(gk.roman) || []),
    ...(gk.fromScript ? idx.byRoman.get(gk.fromScript) || [] : []),
  ].filter((w) => w.id !== item.id && keysOf(w).native !== ownKey && matchVia(gk, keysOf(w)));
  if (candidates.length) {
    const synonym = candidates.find((w) => sameMeaning(w.translation, item.translation));
    if (synonym) {
      return { verdict: "alternative", correct: true, expected, other: { lemma: synonym.lemma, translit: synonym.translit || "", translation: synonym.translation },
        note: `Also right. The word this lesson is practising is ${expected}.` };
    }
    const w = candidates[0];
    return { verdict: "other-word", correct: false, expected, other: { lemma: w.lemma, translit: w.translit || "", translation: w.translation },
      note: `${w.lemma} means “${w.translation}”.` };
  }

  const latin = isLatinWord(expected);
  if (latin) {
    const bare = withoutArticle(expected);
    // The noun without its article, or with the wrong one.
    if (bare !== expected) {
      if (nativeKey(withoutArticle(text)) === nativeKey(bare) || marklessKey(withoutArticle(text)) === marklessKey(bare)) {
        return { verdict: "close", correct: true, via: "native", expected, note: `Nouns come with their article: ${expected}.` };
      }
    }
    if (marklessKey(text) === marklessKey(expected)) {
      return { verdict: "close", correct: true, via: "native", expected, note: `Mind the accents: ${expected}.` };
    }
    const d = editDistance(marklessKey(text), marklessKey(expected));
    if (d > 0 && d <= slack([...marklessKey(expected)].length)) {
      return { verdict: "close", correct: true, via: "native", expected, note: `Nearly — it's spelled ${expected}.` };
    }
    return { verdict: "wrong", correct: false, expected };
  }

  // Non-Latin: a slip in the script itself, or in the romanisation.
  const eN = keysOf(item).native;
  if (scriptOf(text) !== "latin" && gk.native) {
    const d = editDistance(gk.native, eN);
    if (d > 0 && d <= slack([...eN].length)) {
      return { verdict: "close", correct: true, via: "native", expected, note: `Nearly — it's written ${expected}.` };
    }
  }
  if (item.translit) {
    const eR = romanKey(item.translit);
    const d = editDistance(gk.roman, eR);
    if (gk.roman && d > 0 && d <= slack(eR.length)) {
      return { verdict: "close", correct: true, via: "romanisation", expected, note: `Nearly — it's ${item.translit}.` };
    }
  }
  return { verdict: "wrong", correct: false, expected };
}

/**
 * A hint that leaves the remembering to the learner: the first letter at
 * level 1, about half the word at level 2. In both the script and its
 * romanisation, so it helps whichever the learner is using.
 *
 * Word by word, so a phrase shows its shape ("b… d…" for "buenos días") and a
 * noun's article gives only its first letter ("d… F…" for "die Frage": which
 * article is still the learner's to remember). Never the whole answer: a
 * one-character word (是) has no part to show, so its hint is the romanisation.
 */
export function recallHint(item, level = 1, { vocab = [] } = {}) {
  // Counted in letters, so "¿Qué?" starts "¿Q…" rather than "¿…", and a vowel
  // sign stays with its consonant (Hindi की, not क).
  const LETTER = /[\p{L}\p{N}]/u, MARK = /\p{M}/u;
  const revealWord = (w, cut) => {
    const chars = [...w];
    const letters = chars.filter((c) => LETTER.test(c)).length;
    if (letters <= 1) return w;
    const want = Math.max(1, Math.min(level <= 1 ? 1 : Math.max(2, Math.ceil(letters / 2)), letters - 1) - cut);
    let out = "", seen = 0;
    for (const c of chars) {
      if (seen >= want && !MARK.test(c)) break;
      out += c;
      if (LETTER.test(c)) seen++;
    }
    return out + "…";
  };
  // What's shown must never itself be an answer the grader takes. It would be
  // more often than you'd think: "ma…" for "maa" (vowel length is forgiven),
  // and Bengali "দোকা…" for "দোকান" (the vowel signs riding along make it one
  // slip short of the word), or Punjabi "کی…" for "کیہ" (کی is another word
  // for "what", which counts). So the hint is checked against the grader and
  // backs off a letter at a time — and shows nothing if one letter is too much.
  const reveal = (s) => {
    const text = String(s || "").trim();
    if ([...text].length <= 1) return "";
    const words = text.split(/\s+/);
    for (let cut = 0; cut < 12; cut++) {
      const hint = words.map((w) => revealWord(w, cut)).join(" ");
      if (!gradeRecall(hint.replace(/…/g, ""), item, { vocab }).correct) return hint;
    }
    return "";
  };
  return { native: reveal(item?.lemma), translit: item?.translit ? reveal(item.translit) : "" };
}

// -----------------------------------------------------------------------------
// What counts as evidence that a learner CAN say a word, not just recognise it.
// -----------------------------------------------------------------------------

/**
 * Has this word been produced from memory, and is the latest attempt not a
 * failure? Cards from before v113 have no `recalls` field; for those, having
 * survived spaced reviews to a week's stability is taken as the evidence, so
 * a word already well established isn't made to prove itself again. A word
 * that was only ever met is not: a stop that showed ✓ for meeting its words
 * shows "Almost yours" until they're produced — which is the point.
 */
export function canRecall(card) {
  if (!card || !card.lastReview) return false;
  const failedLast = card.lastRating === 1 || card.lastRating === "again";
  if (failedLast) return false;
  if (typeof card.recalls === "number") return card.recalls >= 1;
  return (card.stability || 0) >= 7;
}
