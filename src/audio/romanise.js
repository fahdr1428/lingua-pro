// =============================================================================
// ROMANISATION (v74) — the bridge that makes speaking work for Urdu and Punjabi.
//
// THE BUG THIS FIXES, precisely. The browser has no widely-shipped Urdu
// recogniser, so speech.js listened in hi-IN instead. Chrome duly returned a
// transcript — in DEVANAGARI. The grader then compared अस्सलाम ओ अलैकुम against
// the Urdu target السلام علیکم and its transliteration "assalam o alaikum",
// found nothing in common with either, and scored a flawless utterance 0.00.
// Every single Urdu speaking attempt failed. Punjabi, written here in Shahmukhi,
// failed the same way for the same reason.
//
// THE FIX. Reduce whatever came back to a rough Latin phonetic skeleton and
// compare that against the transliteration we already ship. Devanagari
// "अस्सलाम ओ अलैकुम" romanises to roughly "assalaam o alaikum", which scores
// against "assalam o alaikum" as it should.
//
// THIS IS DELIBERATELY APPROXIMATE. It is not a transliteration standard and
// must never be shown to a learner — it exists only to give the scorer
// something comparable. It is applied ON TOP of the existing comparisons and the
// best score wins, so a rough mapping can only ever help; it cannot make a
// previously-passing attempt fail.
//
// Schwa is the hard part in Brahmic scripts: क alone is "ka", but क् and क + a
// vowel sign are not. The rule below (emit the inherent 'a' unless a vowel sign
// or virama follows) is what a phonetic skeleton needs and no more.
// =============================================================================

// --- Devanagari (Hindi, and what a hi-IN recogniser returns for Urdu) -------
const DEVA_CONSONANT = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v", "ळ": "l",
  "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  // nukta forms — the Perso-Arabic sounds Urdu needs
  "क़": "q", "ख़": "kh", "ग़": "gh", "ज़": "z", "ड़": "r", "ढ़": "rh", "फ़": "f",
};
const DEVA_VOWEL = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
  "ऋ": "ri", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऑ": "o",
};
const DEVA_MATRA = {
  "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o",
};
const DEVA_SIGN = { "ं": "n", "ँ": "n", "ः": "h", "़": "" };
const DEVA_VIRAMA = "्";

// --- Bengali ----------------------------------------------------------------
const BENG_CONSONANT = {
  "ক": "k", "খ": "kh", "গ": "g", "ঘ": "gh", "ঙ": "ng",
  "চ": "ch", "ছ": "chh", "জ": "j", "ঝ": "jh", "ঞ": "n",
  "ট": "t", "ঠ": "th", "ড": "d", "ঢ": "dh", "ণ": "n",
  "ত": "t", "থ": "th", "দ": "d", "ধ": "dh", "ন": "n",
  "প": "p", "ফ": "ph", "ব": "b", "ভ": "bh", "ম": "m",
  "য": "j", "র": "r", "ল": "l", "শ": "sh", "ষ": "sh", "স": "s", "হ": "h",
  "ড়": "r", "ঢ়": "rh", "য়": "y", "ৎ": "t",
};
const BENG_VOWEL = {
  "অ": "o", "আ": "a", "ই": "i", "ঈ": "i", "উ": "u", "ঊ": "u",
  "ঋ": "ri", "এ": "e", "ঐ": "oi", "ও": "o", "ঔ": "ou",
};
const BENG_MATRA = {
  "া": "a", "ি": "i", "ী": "i", "ু": "u", "ূ": "u", "ৃ": "ri",
  "ে": "e", "ৈ": "oi", "ো": "o", "ৌ": "ou",
};
const BENG_SIGN = { "ং": "ng", "ঁ": "n", "ঃ": "h", "়": "" };
const BENG_VIRAMA = "্";

// --- Gurmukhi (Punjabi as a pa-Guru-IN recogniser returns it) ---------------
const GURU_CONSONANT = {
  "ਕ": "k", "ਖ": "kh", "ਗ": "g", "ਘ": "gh", "ਙ": "ng",
  "ਚ": "ch", "ਛ": "chh", "ਜ": "j", "ਝ": "jh", "ਞ": "n",
  "ਟ": "t", "ਠ": "th", "ਡ": "d", "ਢ": "dh", "ਣ": "n",
  "ਤ": "t", "ਥ": "th", "ਦ": "d", "ਧ": "dh", "ਨ": "n",
  "ਪ": "p", "ਫ": "ph", "ਬ": "b", "ਭ": "bh", "ਮ": "m",
  "ਯ": "y", "ਰ": "r", "ਲ": "l", "ਵ": "v", "ਸ਼": "sh", "ਸ": "s", "ਹ": "h",
  "ਖ਼": "kh", "ਗ਼": "gh", "ਜ਼": "z", "ੜ": "r", "ਫ਼": "f", "ਲ਼": "l",
};
const GURU_VOWEL = { "ਅ": "a", "ਆ": "aa", "ਇ": "i", "ਈ": "ee", "ਉ": "u", "ਊ": "oo", "ਏ": "e", "ਐ": "ai", "ਓ": "o", "ਔ": "au" };
const GURU_MATRA = { "ਾ": "aa", "ਿ": "i", "ੀ": "ee", "ੁ": "u", "ੂ": "oo", "ੇ": "e", "ੈ": "ai", "ੋ": "o", "ੌ": "au" };
const GURU_SIGN = { "ਂ": "n", "ੰ": "n", "ਃ": "h", "਼": "", "ੱ": "" };
const GURU_VIRAMA = "੍";

// --- Arabic / Urdu ----------------------------------------------------------
// Arabic script doesn't write short vowels, so this produces a consonant
// skeleton ("slam alykm"). That's still enormously more comparable to a Latin
// transliteration than the raw script was, and the character-similarity half of
// the scorer is what picks it up.
const ARAB = {
  "ا": "a", "أ": "a", "إ": "i", "آ": "aa", "ٱ": "a",
  "ب": "b", "پ": "p", "ت": "t", "ٹ": "t", "ة": "h", "ث": "s",
  "ج": "j", "چ": "ch", "ح": "h", "خ": "kh",
  "د": "d", "ڈ": "d", "ذ": "z", "ر": "r", "ڑ": "r", "ز": "z", "ژ": "zh",
  "س": "s", "ش": "sh", "ص": "s", "ض": "z", "ط": "t", "ظ": "z",
  "ع": "a", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ک": "k", "گ": "g",
  "ل": "l", "م": "m", "ن": "n", "ں": "n", "و": "o", "ؤ": "o",
  "ه": "h", "ہ": "h", "ھ": "h", "ۃ": "h",
  "ی": "y", "ي": "y", "ئ": "y", "ے": "e", "ى": "a",
  "ء": "", "ْ": "", "ّ": "",
  // harakat, when they're actually written
  "َ": "a", "ُ": "u", "ِ": "i", "ً": "an", "ٌ": "un", "ٍ": "in",
};

/** Which of the supported scripts, if any, does this string mostly use? */
export function scriptOf(text) {
  const s = String(text || "");
  if (/[ऀ-ॿ]/.test(s)) return "deva";
  if (/[ঀ-৿]/.test(s)) return "beng";
  if (/[਀-੿]/.test(s)) return "guru";
  if (/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(s)) return "arab";
  if (/[A-Za-z]/.test(s)) return "latin";
  return null;
}

/**
 * Brahmic scripts share one shape: consonant carries an inherent vowel unless a
 * vowel sign or a virama follows it. One walker handles all three.
 */
/**
 * Does the consonant at index `i` keep its inherent vowel?
 *
 * No, if a vowel sign or a virama follows — and also no at the end of a word.
 * SCHWA DELETION is a real feature of Hindi, Punjabi and Bengali: शुक्रिया is
 * "shukriya", not "shukriyaa", and राम is "raam", not "raama". Without this rule
 * every romanised word gained a trailing vowel, which cost roughly 0.05 of
 * similarity per word — enough on its own to keep a perfect Urdu utterance a
 * hair under the pass mark.
 */
function inherentVowel(s, i, matras, virama) {
  const next = s[i + 1];
  if (next === undefined) return false;            // end of string
  if (matras[next] || next === virama) return false;
  if (/[\s.,!?;:—–]/.test(next)) return false;     // end of word
  return true;
}

function brahmic(text, { consonants, vowels, matras, signs, virama }) {
  const s = String(text);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    // Two-codepoint nukta forms (क + ़ = क़) must be tried before the base letter.
    const pair = ch + (s[i + 1] || "");
    if (consonants[pair]) {
      out += consonants[pair];
      i++;
      if (inherentVowel(s, i, matras, virama)) out += "a";
      continue;
    }

    if (consonants[ch]) {
      out += consonants[ch];
      if (inherentVowel(s, i, matras, virama)) out += "a";
      continue;
    }
    if (vowels[ch]) { out += vowels[ch]; continue; }
    if (matras[ch]) { out += matras[ch]; continue; }
    if (ch in signs) { out += signs[ch]; continue; }
    if (ch === virama) continue;
    if (/\s/.test(ch)) { out += " "; continue; }
    // Anything else (punctuation, Latin already present) passes through.
    if (/[a-z0-9]/i.test(ch)) out += ch;
  }
  return out.replace(/\s+/g, " ").trim();
}

function arabic(text) {
  const s = String(text);
  let out = "";
  for (const ch of s) {
    if (ch in ARAB) { out += ARAB[ch]; continue; }
    if (/\s/.test(ch)) { out += " "; continue; }
    if (/[a-z0-9]/i.test(ch)) out += ch;
  }
  return out.replace(/\s+/g, " ").trim();
}

/**
 * Reduce text in a supported non-Latin script to a rough Latin skeleton.
 * Returns "" when there's nothing to convert, so callers can cheaply skip.
 */
export function romanise(text) {
  const script = scriptOf(text);
  switch (script) {
    case "deva":
      return brahmic(text, { consonants: DEVA_CONSONANT, vowels: DEVA_VOWEL, matras: DEVA_MATRA, signs: DEVA_SIGN, virama: DEVA_VIRAMA });
    case "beng":
      return brahmic(text, { consonants: BENG_CONSONANT, vowels: BENG_VOWEL, matras: BENG_MATRA, signs: BENG_SIGN, virama: BENG_VIRAMA });
    case "guru":
      return brahmic(text, { consonants: GURU_CONSONANT, vowels: GURU_VOWEL, matras: GURU_MATRA, signs: GURU_SIGN, virama: GURU_VIRAMA });
    case "arab":
      return arabic(text);
    default:
      return "";
  }
}

/**
 * Fold vowel length and the i/ee, u/oo pairs in Latin text.
 *
 * Transliteration has no standard, and this is where it hurts most: our packs
 * write "paani", a faithful romanisation writes "paanee", and a learner typing
 * from memory writes "pani". All three are the same word said the same way, and
 * a grader that calls two of them wrong is the grader that makes people stop
 * speaking. Folding all three to "pani" makes them compare equal.
 *
 * Applied as an EXTRA comparison on both sides, never as a replacement — vowel
 * length is phonemic in several of these languages, so the unfolded comparison
 * still runs first and a higher score from it always wins.
 */
export function foldVowels(latin) {
  return String(latin || "")
    .toLowerCase()
    .replace(/aa+/g, "a")
    .replace(/(?:ee+|ii+)/g, "i")
    .replace(/(?:oo+|uu+)/g, "u")
    .replace(/([a-z])\1+/g, "$1$1");  // any other run of 3+ collapses to 2
}

/** Do these two strings use different writing systems? */
export function scriptsDiffer(a, b) {
  const sa = scriptOf(a), sb = scriptOf(b);
  return !!sa && !!sb && sa !== sb;
}
