// =============================================================================
// validate-alphabets.mjs (v90) — every non-Latin language must teach its script.
//
// Five languages shipped with `alphabet: []`, and the Letters & sounds screen
// filled the gap with a hardcoded sentence claiming the language used the Latin
// alphabet. For Malayalam, Tamil and Persian that was simply false, and it was
// told to exactly the learner the app is built for: someone who speaks the
// language at home, was schooled in English, and cannot read a word of it.
//
// A script course is not a nice-to-have for those languages. It is the first
// door, and the app was telling people the door didn't exist.
//
// This makes that failure loud. A language written in a non-Latin script must
// have letters and groups; every letter must sit in a declared group; every
// group must contain letters; and nothing may be silently empty.
//
//   npm run validate-alphabets
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";

// Genuinely Latin-script languages. Keep in step with LATIN_SCRIPT in
// src/screens/AlphabetLessons.jsx — the screen decides what to SAY, this
// decides what to REQUIRE, and they must agree about which is which.
const LATIN = new Set(["es", "fr", "de", "id", "tr", "pcm", "tl", "so"]);

const errors = [], warnings = [], rows = [];
const codes = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .sort();

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const letters = pack.alphabet || [];
  const groups = pack.alphabetGroups || [];

  if (!letters.length) {
    if (LATIN.has(code)) {
      warnings.push(`${code}: no script course — Latin script, so the screen says so honestly`);
    } else {
      errors.push(`${code}: NO SCRIPT COURSE, and ${code} is not written in Latin letters — the one thing a learner who can't read it needs`);
    }
    rows.push([code, 0, 0]);
    continue;
  }

  const ids = new Set(groups.map((g) => g.id));
  if (!groups.length) errors.push(`${code}: has ${letters.length} letters but no groups to teach them in`);

  for (const g of groups) {
    if (!g.id) errors.push(`${code}: a group has no id`);
    if (!g.title) errors.push(`${code}: group ${g.id} has no title`);
    const n = letters.filter((l) => l.group === g.id).length;
    if (!n) errors.push(`${code}: group "${g.id}" has no letters — an empty lesson`);
  }

  const seen = new Set();
  for (const l of letters) {
    const at = `${code} "${l.char}"`;
    if (!l.char) errors.push(`${code}: a letter has no character`);
    if (!l.sound) errors.push(`${at}: no sound described — the whole point of the card`);
    if (!l.name) warnings.push(`${at}: no letter name`);
    if (l.group && ids.size && !ids.has(l.group)) {
      errors.push(`${at}: group "${l.group}" is not declared, so this letter is unreachable`);
    }
    if (seen.has(l.char)) warnings.push(`${at}: appears twice`);
    seen.add(l.char);
  }

  rows.push([code, letters.length, groups.length]);
}

console.log("");
for (const [code, n, g] of rows) {
  const mine = [...errors, ...warnings].filter((m) => m.startsWith(`${code}:`) || m.startsWith(`${code} `));
  const bad = errors.filter((m) => m.startsWith(`${code}:`) || m.startsWith(`${code} `)).length;
  console.log(`  ${bad ? "[X]" : mine.length ? "[!]" : "[ok]"} ${code.padEnd(4)} ${String(n).padStart(3)} letters · ${g} groups`);
  for (const m of mine) console.log(`        ${bad ? "✗" : "!"} ${m}`);
}
console.log(`\n  ${codes.length} languages · ${errors.length} errors · ${warnings.length} warnings\n`);
process.exit(errors.length ? 1 : 0);
