// =============================================================================
// validate-guide-copy.mjs (v93) — the guide must speak to the learner, not past.
//
// Every language has a guide: a named person with a city, a craft and a voice,
// who greets you, reacts when you get something right, and congratulates you at
// the end of a lesson. It is the app's entire warmth layer.
//
// For sixteen languages that copy is written in ROMANISED language blended with
// English — "Shabaash! Bilkul sahi", "Wanbyeok! Perfect." A learner reads it,
// hears the language in it, and understands it.
//
// Malayalam, Tamil and Persian shipped in v86 and v89 with all of it in NATIVE
// SCRIPT: greetings, the correct/wrong reactions, the streak note, and the
// end-of-lesson celebration. So the one moment the app stops testing you and
// says well done, it said it in a script you came here because you cannot read.
//
// That is the same failure as v90 (the alphabet screen's hardcoded lie) and v92
// (eight stale copies of the non-Latin list): content added later did not follow
// the pattern, and nothing was watching. This watches.
//
// The rule: a guide's learner-facing copy must be readable by someone who cannot
// yet read the script. `signature` is exempt — it carries its own translit and
// en fields, and showing the real script there is the point.
//
//   npm run validate-guide-copy
// =============================================================================

import { CHARACTERS } from "../src/data/characters.js";
import { LATIN_SCRIPT_LANGUAGES } from "../src/data/registry.js";

// Any character from a script the learner can't be assumed to read.
const NATIVE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Malayalam}\p{Script=Tamil}\p{Script=Gurmukhi}]/u;

// Fields the learner reads as instructions or encouragement. `signature` is
// deliberately absent: it is the one place the script itself is the content,
// and it ships with translit + en alongside.
const SPOKEN_TO_LEARNER = ["intro", "greetings", "celebrations", "streakNote", "reactions"];

const errors = [], rows = [];

function strings(value, path, out) {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) strings(v, `${path}.${k}`, out);
  }
}

for (const [code, guide] of Object.entries(CHARACTERS)) {
  const latin = LATIN_SCRIPT_LANGUAGES.has(code);
  const found = [];

  for (const field of SPOKEN_TO_LEARNER) {
    if (guide[field] == null) {
      errors.push(`${code}: guide has no ${field} — Lesson.jsx reads these unguarded`);
      continue;
    }
    const out = [];
    strings(guide[field], field, out);
    for (const [path, text] of out) {
      if (NATIVE.test(text)) found.push([path, text]);
    }
  }

  if (found.length) {
    for (const [path, text] of found) {
      errors.push(
        `${code}: ${path} is in native script with no romanisation — "${text.slice(0, 48)}${text.length > 48 ? "…" : ""}". ` +
        `The guide's copy has to be readable by someone who can't read the script yet; every other language romanises it.`
      );
    }
  }

  rows.push([code, latin, found.length]);
}

console.log("");
for (const [code, latin, bad] of rows) {
  const mark = bad ? "[X]" : "[ok]";
  console.log(`  ${mark} ${code.padEnd(4)} guide copy ${latin ? "· Latin script" : "· romanised for the learner"}`);
}

if (errors.length) {
  console.error(`\n  ${errors.length} error(s):`);
  for (const e of errors) console.error("   ✗ " + e);
  console.error("");
  process.exit(1);
}
console.log(`\n  ${rows.length} guides · every one speaks to the learner · 0 errors\n`);
