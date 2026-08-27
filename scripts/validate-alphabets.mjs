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

// v91 — a list of letters is not a script course.
//
// ARABIC-SCRIPT languages must teach joining, because every letter the course
// showed was in ISOLATED form and no word in any of these languages is written
// that way. ABUGIDAS must teach vowel signs, because a consonant chart with no
// matras decodes nothing — ക is "ka" and there is no way to write "ki" without
// a mark the learner was never shown. HANGUL must teach block assembly, because
// the jamo are never written in a line.
//
// These aren't nice-to-haves. Without them a learner can finish the entire
// course and still not read one word.
const ARABIC_SCRIPT = new Set(["ar", "fa", "ur", "pa"]);
const ABUGIDA = new Set(["hi", "bn", "ml", "ta"]);
const SYLLABLE_BLOCKS = new Set(["ko"]);

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

  // --- v91: the writing system itself, not just its letters -----------------
  const sys = pack.scriptSystem;
  if (!LATIN.has(code)) {
    if (!sys?.primer) {
      errors.push(`${code}: no script primer — the learner meets letter one with no idea how the system works`);
    } else {
      const p = sys.primer;
      if (!p.facts?.length) errors.push(`${code}: primer has no facts`);
      if (!p.hardest) errors.push(`${code}: primer doesn't name the hard part`);
      if (!p.firstWin) errors.push(`${code}: primer has no first win`);
    }
  }

  if (ARABIC_SCRIPT.has(code)) {
    if (!sys?.joining) {
      errors.push(`${code}: Arabic script with no joining rules — every letter is shown isolated, and no word is written that way`);
    } else {
      const missing = sys.joining.nonConnectors.filter((c) => !letters.some((l) => l.char === c));
      for (const c of missing) errors.push(`${code}: non-connector "${c}" isn't a letter in this course`);
    }
  }

  if (ABUGIDA.has(code)) {
    const v = sys?.vowelSigns;
    if (!v) {
      errors.push(`${code}: abugida with no vowel signs — the consonant chart alone cannot spell a single syllable`);
    } else {
      if (!letters.some((l) => l.char === v.demo)) {
        errors.push(`${code}: vowel-sign demo "${v.demo}" isn't taught in this course`);
      }
      if (!v.signs?.length) errors.push(`${code}: vowelSigns has no signs`);
      for (const s of v.signs || []) {
        if (!s.combined?.includes(v.demo)) {
          errors.push(`${code}: syllable "${s.combined}" isn't built from the demo consonant ${v.demo}`);
        }
      }
    }
  }

  if (SYLLABLE_BLOCKS.has(code) && !sys?.blocks?.patterns?.length) {
    errors.push(`${code}: Hangul with no block lesson — jamo are never written in a line`);
  }

  for (const c of sys?.confusables || []) {
    if (!c.tell) errors.push(`${code}: confusable ${c.chars?.join("/")} has no tell`);
    for (const ch of c.chars || []) {
      if (!letters.some((l) => l.char === ch)) {
        warnings.push(`${code}: confusable names "${ch}", which this course doesn't teach`);
      }
    }
  }

  rows.push([code, letters.length, groups.length, sys]);
}

console.log("");
for (const [code, n, g, sys] of rows) {
  const mine = [...errors, ...warnings].filter((m) => m.startsWith(`${code}:`) || m.startsWith(`${code} `));
  const bad = errors.filter((m) => m.startsWith(`${code}:`) || m.startsWith(`${code} `)).length;
  const extras = [
    sys?.primer && "primer",
    sys?.joining && "joining",
    sys?.vowelSigns && `${sys.vowelSigns.signs.length} vowel signs`,
    sys?.blocks && `${sys.blocks.patterns.length} blocks`,
    sys?.confusables && `${sys.confusables.length} confusables`,
  ].filter(Boolean).join(" · ");
  console.log(`  ${bad ? "[X]" : mine.length ? "[!]" : "[ok]"} ${code.padEnd(4)} ${String(n).padStart(3)} letters · ${g} groups${extras ? " · " + extras : ""}`);
  for (const m of mine) console.log(`        ${bad ? "✗" : "!"} ${m}`);
}
console.log(`\n  ${codes.length} languages · ${errors.length} errors · ${warnings.length} warnings\n`);
process.exit(errors.length ? 1 : 0);
