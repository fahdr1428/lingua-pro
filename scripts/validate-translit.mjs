// =============================================================================
// validate-translit.mjs (v92) — every example sentence must be sayable.
//
// The vocabulary always carried a romanisation, so a learner could say the WORD.
// Then they met it inside an example sentence written entirely in a script they
// cannot read, with nothing to sound it out from. 724 of 1,481 sentences across
// six languages were in that state.
//
// This makes the gap fail the build rather than sit in a document. It also runs
// three mechanical checks that catch the errors hand-written romanisation
// actually makes:
//
//   · a pinyin syllable count that doesn't match the character count, which is
//     what a dropped or doubled word looks like in Mandarin
//   · a word count that doesn't match, for the scripts that use spaces
//   · the same sentence romanised two different ways in two places
//
// None of these can tell you a romanisation is RIGHT. All of them catch the
// specific ways it goes wrong at volume.
//
//   npm run validate-translit
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { EXTRA_EXAMPLES } from "../src/data/extraExamples.js";

// v93 — THIS SCRIPT HAD A HOLE THE SIZE OF ITS OWN CLAIM.
//
// v92 reported "100% of examples romanised" and it was true of the language
// packs. But registry.js merges src/data/extraExamples.js into the vocab at
// load time, and this validator only ever read the pack JSON — so 65 Urdu and
// Hindi sentences reached the learner without a romanisation and the check said
// everything was fine.
//
// A validator that measures a file rather than what the learner actually gets
// is worse than no validator, because it produces a number people trust. The
// extras are folded in below and counted the same as any other example.

// Languages whose examples cannot be read aloud without help.
const NEEDS_TRANSLIT = new Set(["ar", "bn", "fa", "hi", "ja", "ko", "ml", "pa", "ta", "ur", "zh"]);
// Of those, the ones that put spaces between words, so word counts are comparable.
const SPACED = new Set(["ar", "bn", "fa", "hi", "ko", "ml", "pa", "ta", "ur"]);

const errors = [], warnings = [], rows = [];

const isHan = (ch) => /\p{Script=Han}/u.test(ch);
const nativeScript = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Malayalam}\p{Script=Tamil}]/u;

// A pinyin syllable has exactly one vowel nucleus, and a nucleus is a maximal
// run of vowels (including tone-marked ones): "péngyǒu" is e + ou = 2.
function pinyinSyllables(s) {
  const v = "aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ";
  let n = 0, inRun = false;
  for (const ch of s.toLowerCase()) {
    const isV = v.includes(ch);
    if (isV && !inRun) n++;
    inRun = isV;
  }
  return n;
}

// A word count that doesn't line up is usually a dropped word — but three
// things make it differ legitimately, and they are RULES rather than a list of
// excused sentences, so new content gets the same treatment automatically.
function wordCountExplained(code, native, translit, nw, tw) {
  // 1. A hyphen in the romanisation deliberately joins what the script writes
  //    apart: Urdu's izafat (talib-e-ilm), Korean's particles (jib-e).
  if (tw < nw && translit.includes("-")) return true;

  // 2. Urdu and Punjabi write the future auxiliary گا / گے / گی as its own word;
  //    Roman Urdu attaches it to the verb (آئے گا → aayega).
  if ((code === "ur" || code === "pa") && tw < nw && /\s(گا|گے|گی)\b/.test(native)) return true;

  // 3. Arabic prefixes و ("and") straight onto the next word; romanisation
  //    splits it off as wa.
  if (code === "ar" && tw > nw && /(^|\s)و\S/.test(native)) return true;

  // 4. A multi-word foreign name or loan that English spells as one word
  //    (باتھ روم → bathroom).
  if (tw < nw && /^[\x20-\x7E]+$/.test(translit.replace(/[?.,!]/g, ""))
      && nw - tw === 1 && /[a-z]{6,}/.test(translit)) return true;

  return false;
}

const codes = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .sort();

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const vocab = pack.vocab || [];

  let total = 0, have = 0;
  const seen = new Map(); // native -> translit, to catch two spellings of one line

  // Everything the learner will actually see for this language: the pack's own
  // examples, plus the supplementary ones registry.js merges in at load time.
  const extras = Object.values(EXTRA_EXAMPLES[code] || {}).flat();

  // v93 — an extra example that repeats a sentence the pack already has is
  // DEAD WEIGHT. mergeExamples() dedupes by native string, so it is dropped at
  // load and the learner never sees it. 49 of the 149 extras (a third) were in
  // that state: the file's header says every key was checked against the vocab,
  // and it was — the LEMMA was verified, the SENTENCE never was. The whole
  // point of an extra is a SECOND frame for a word, and a duplicate is none.
  {
    const packSentences = new Set(vocab.flatMap((w) => (w.examples || []).map((e) => e.native)));
    for (const [lemma, arr] of Object.entries(EXTRA_EXAMPLES[code] || {})) {
      for (const e of arr) {
        if (packSentences.has(e.native)) {
          errors.push(`${code}: extra example for "${lemma}" repeats a sentence the pack already has ("${e.native}") — mergeExamples drops it, so it gives the learner no second frame`);
        }
      }
      if (!vocab.some((w) => w.lemma === lemma)) {
        errors.push(`${code}: extra examples are keyed to "${lemma}", which is not a lemma in the pack — they can never attach to anything`);
      }
    }
  }
  const allExamples = [
    ...vocab.flatMap((w) => w.examples || []),
    ...extras,
  ];

  {
    for (const e of allExamples) {
      total++;
      if (!e.translit) {
        if (NEEDS_TRANSLIT.has(code)) {
          errors.push(`${code}: "${e.native}" has no romanisation — unreadable to anyone who can't read the script`);
        }
        continue;
      }
      have++;

      // A romanisation containing the original script is a copy-paste slip.
      if (nativeScript.test(e.translit)) {
        errors.push(`${code}: romanisation of "${e.native}" still contains native script: "${e.translit}"`);
      }

      // The same sentence must romanise the same way everywhere it appears.
      const prev = seen.get(e.native);
      if (prev && prev !== e.translit) {
        errors.push(`${code}: "${e.native}" is romanised two ways — "${prev}" and "${e.translit}"`);
      }
      seen.set(e.native, e.translit);

      if (code === "zh") {
        const chars = [...e.native].filter(isHan).length;
        const syls = pinyinSyllables(e.translit);
        // Erhua fuses 儿 onto the syllable before it (点儿 → diǎnr), so one
        // fewer syllable than characters is the language working correctly.
        // Detect it in the ROMANISATION, where the fused r is visible — 儿 in
        // 儿子 (érzi) and 女儿 (nǚ'ér) is a full syllable and must still count.
        const fused = /\S{2,}r\b/.test(e.translit) && !/\bér\b/.test(e.translit);
        if (chars !== syls && !(fused && chars - syls === 1)) {
          warnings.push(`zh: "${e.native}" is ${chars} characters but "${e.translit}" is ${syls} syllables`);
        }
      }

      if (SPACED.has(code)) {
        const nw = e.native.trim().split(/\s+/).length;
        const tw = e.translit.trim().split(/\s+/).length;
        if (nw !== tw && !wordCountExplained(code, e.native, e.translit, nw, tw)) {
          warnings.push(`${code}: "${e.native}" is ${nw} words but "${e.translit}" is ${tw}`);
        }
      }
    }
  }

  rows.push([code, total, have]);
}

console.log("");
for (const [code, total, have] of rows) {
  const need = NEEDS_TRANSLIT.has(code);
  const pct = total ? Math.round((have / total) * 100) : 100;
  const mark = !need ? "[--]" : have === total ? "[ok]" : "[X]";
  console.log(`  ${mark} ${code.padEnd(4)} ${String(have).padStart(4)}/${String(total).padEnd(4)} examples romanised${need ? ` · ${pct}%` : " · Latin script, not needed"}`);
}

if (warnings.length) {
  console.log(`\n  ${warnings.length} consistency warning(s):`);
  for (const w of warnings.slice(0, 30)) console.log("   ! " + w);
  if (warnings.length > 30) console.log(`   … and ${warnings.length - 30} more`);
}

if (errors.length) {
  console.error(`\n  ${errors.length} error(s):`);
  for (const e of errors.slice(0, 30)) console.error("   ✗ " + e);
  if (errors.length > 30) console.error(`   … and ${errors.length - 30} more`);
}

console.log(`\n  ${codes.length} languages · ${errors.length} errors · ${warnings.length} warnings\n`);
process.exit(errors.length ? 1 : 0);
