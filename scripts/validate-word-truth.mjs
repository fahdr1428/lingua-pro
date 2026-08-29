// =============================================================================
// validate-word-truth.mjs (v94) — is each word actually right?
//
// v92 and v93 added roughly 1,100 hand-written sentences and romanisations
// across nineteen languages. "I was careful" is not a verification method, and
// the errors that survive careful writing at that volume are specific and
// mechanical. This checks the ones a machine genuinely can:
//
//   1. THE WORD IS IN ITS OWN EXAMPLE. An example sentence for പോയിവരാം that
//      doesn't contain പോയിവരാം teaches the learner a different word. This is
//      also the app's own stated principle — "meet every word inside a
//      sentence" — and nothing was enforcing it on the sentence text.
//
//   2. THE SENTENCE IS IN THE RIGHT SCRIPT. A stray Devanagari character in a
//      Malayalam sentence, or Arabic in a Persian one, is invisible to me and
//      obvious to a reader. validate-vocab checks this for lemmas; nothing
//      checked it for the sentences, which is where I did most of the writing.
//
//   3. THE ROMANISATION MATCHES THE SENTENCE. If the lemma is in the native
//      text, the lemma's own romanisation should be traceable in the sentence's
//      romanisation. A romanisation of a different sentence is the single
//      worst failure mode here, and it is undetectable by reading the file.
//
//   4. THE TRANSLATION SAYS SOMETHING. Not empty, not a copy of the native.
//
// Checks 1 and 3 are matched leniently: languages inflect, and Malayalam and
// Tamil agglutinate heavily, so an exact substring match would produce mostly
// noise. The rule is a stem match — if a good chunk of the word is present, it
// passes. That still catches a sentence built around the wrong word entirely,
// which is the failure worth catching.
//
//   npm run validate-word-truth
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { EXTRA_EXAMPLES } from "../src/data/extraExamples.js";
import { LATIN_SCRIPT_LANGUAGES } from "../src/data/registry.js";

const SCRIPT_OF = {
  ml: "Malayalam", ta: "Tamil", hi: "Devanagari", bn: "Bengali",
  ar: "Arabic", fa: "Arabic", ur: "Arabic", pa: "Arabic",
  ko: "Hangul", zh: "Han", ja: null,   // Japanese legitimately mixes three
};

const CAP = Number(process.env.CAP || 40);
const errors = [], warnings = [], rows = [];

// Strip anything that isn't a letter of the language: punctuation, digits,
// spaces, and the zero-width joiners Arabic script uses.
const stripNonLetters = (s) => s.replace(/[\s\p{P}\p{S}\p{N}‌‍]/gu, "");

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
function foldConvention(s) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")  // ō→o, bù→bu, â→a
    .replace(/['’ʻ`\-]/g, "")                          // ra's→ras, li-anna→lianna
    .replace(/ou/g, "o").replace(/([aeiou])\1+/g, "$1") // wapuro & doubling
    .replace(/([a-z])\1+/g, "$1");                      // shukkran→shukran
}

/** Is `needle` traceable inside `hay`, allowing for inflection at either end? */
function stemMatch(hay, needle) {
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

const codes = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")).sort();

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const scriptName = SCRIPT_OF[code];
  const script = scriptName ? new RegExp(`\\p{Script=${scriptName}}`, "u") : null;
  const foreign = scriptName
    ? new RegExp(`[\\p{Script=Malayalam}\\p{Script=Tamil}\\p{Script=Devanagari}\\p{Script=Bengali}\\p{Script=Arabic}\\p{Script=Hangul}\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}]`, "gu")
    : null;

  let checked = 0, noLemma = 0, badScript = 0, badRoman = 0;

  const check = (lemma, lemmaTranslit, e, where) => {
    checked++;
    const at = `${code} ${where} "${lemma}"`;

    if (!e.translation || !e.translation.trim()) {
      errors.push(`${at}: example "${e.native}" has no translation`);
    } else if (e.translation.trim() === e.native.trim() && code !== "pcm") {
      // Nigerian Pidgin is English-lexified, so "Cold water" really is the same
      // sentence in both columns. Everywhere else an identical pair means the
      // translation was never written.
      errors.push(`${at}: translation is identical to the native text`);
    }

    // 1. the word must be in its own sentence
    if (!stemMatch(e.native, lemma)) {
      noLemma++;
      warnings.push(`${at}: its example "${e.native}" doesn't contain the word`);
    }

    // 2. the sentence must be in this language's script
    if (script) {
      if (!script.test(e.native)) {
        badScript++;
        errors.push(`${at}: example "${e.native}" contains no ${scriptName} at all`);
      } else {
        const strays = new Set();
        for (const ch of stripNonLetters(e.native)) {
          if (/[a-zA-Z]/.test(ch)) continue;              // Latin loanwords are fine
          if (!script.test(ch) && foreign.test(ch)) strays.add(ch);
          foreign.lastIndex = 0;
        }
        if (strays.size) {
          badScript++;
          errors.push(`${at}: example "${e.native}" mixes in non-${scriptName} letters: ${[...strays].join(" ")}`);
        }
      }
    }

    // 3. the romanisation must belong to THIS sentence
    if (e.translit && lemmaTranslit && stemMatch(e.native, lemma)) {
      if (!stemMatch(foldConvention(e.translit), foldConvention(lemmaTranslit))) {
        badRoman++;
        warnings.push(`${at}: romanisation "${e.translit}" doesn't contain the word's own romanisation "${lemmaTranslit}"`);
      }
    }
  };

  for (const w of pack.vocab || []) {
    for (const e of w.examples || []) check(w.lemma, w.translit, e, "example for");

    // 5. TWO EXAMPLES THAT ARE THE SAME SENTENCE. A second frame is only worth
    //    having if it is a different sentence; "Ich weiß es nicht." and
    //    "Ich weiss es nicht" are one sentence written twice, and the learner
    //    gets none of the varied exposure the second slot exists for.
    const shapes = new Map();
    for (const e of w.examples || []) {
      const shape = e.native.toLowerCase()
        .replace(/ß/g, "ss").replace(/[\s\p{P}\p{S}]/gu, "");
      if (shapes.has(shape)) {
        errors.push(`${code} "${w.lemma}": two examples are the same sentence — "${shapes.get(shape)}" and "${e.native}"`);
      }
      shapes.set(shape, e.native);
    }
  }
  for (const [lemma, arr] of Object.entries(EXTRA_EXAMPLES[code] || {})) {
    const w = (pack.vocab || []).find((v) => v.lemma === lemma);
    for (const e of arr) check(lemma, w?.translit, e, "EXTRA for");
  }

  rows.push([code, checked, noLemma, badScript, badRoman]);
}

console.log("");
console.log("  code  checked  word absent  wrong script  romanisation mismatch");
for (const [code, n, a, s, r] of rows) {
  const mark = s ? "[X]" : (a || r) ? "[!]" : "[ok]";
  console.log(`  ${mark} ${code.padEnd(4)} ${String(n).padStart(5)} ${String(a).padStart(11)} ${String(s).padStart(13)} ${String(r).padStart(22)}`);
}

if (warnings.length) {
  console.log(`\n  ${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, CAP)) console.log("   ! " + w);
  if (warnings.length > 40) console.log(`   … and ${warnings.length - CAP} more`);
}
if (errors.length) {
  console.error(`\n  ${errors.length} error(s):`);
  for (const e of errors.slice(0, CAP)) console.error("   ✗ " + e);
  if (errors.length > 40) console.error(`   … and ${errors.length - CAP} more`);
}

const total = rows.reduce((n, r) => n + r[1], 0);
console.log(`\n  ${total} sentences checked · ${errors.length} errors · ${warnings.length} warnings\n`);
process.exit(errors.length ? 1 : 0);
