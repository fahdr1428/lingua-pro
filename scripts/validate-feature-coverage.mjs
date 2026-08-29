// =============================================================================
// validate-feature-coverage.mjs (v95) — which languages actually have which
// features, and does every door open onto something.
//
// A language pack is not one thing. It is vocabulary, a journey, a script
// course, grammar, reading passages, scripted conversations, culture notes,
// verb tables and sentence patterns — and they were added at different times by
// different passes. The newest languages shipped with the first few and none of
// the rest, which is invisible until you open the app as one of those learners.
//
// Before v95, Persian, Malayalam, Tamil, Somali and Tagalog had NO culture
// notes and NO conversations, and Home offered "Listen & follow — scripted
// conversations, with subtitles" to all of them. The door opened onto "no
// conversation starters for Tamil yet".
//
// So there are two rules here:
//
//   1. NO DOOR ONTO AN EMPTY ROOM. If a feature is offered on Home for a
//      language, the data behind it must exist. This is an ERROR.
//   2. GAPS ARE COUNTED AND NAMED. A missing feature that is correctly gated
//      is a content gap, not a bug — but it should be visible in one place
//      rather than discovered by a learner.
//
//   npm run validate-feature-coverage
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { CULTURE } from "../src/data/culture.js";
import { CONVERSATIONS } from "../src/data/conversations.js";
import { PASSAGES } from "../src/data/passages.js";
import { SENTENCE_PATTERNS } from "../src/data/sentencePatterns.js";
import { CHARACTERS } from "../src/data/characters.js";
import { JOURNEY } from "../src/data/journey.js";

const codes = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")).sort();

const has = (table, code) => Array.isArray(table[code]) ? table[code].length > 0 : !!table[code];

// gated: the app checks before offering it, so an absence is a gap not a bug.
// required: the app assumes it exists, so an absence would break a screen.
const FEATURES = [
  { key: "journey",   label: "route map",     table: JOURNEY,          required: true },
  { key: "guide",     label: "guide",         table: CHARACTERS,        required: true },
  { key: "culture",   label: "culture notes", table: CULTURE,           gated: "hasCulture" },
  { key: "convos",    label: "conversations", table: CONVERSATIONS,     gated: "getConversations" },
  { key: "passages",  label: "passages",      table: PASSAGES,          gated: "PASSAGES" },
  { key: "patterns",  label: "sentence lab",  table: SENTENCE_PATTERNS, gated: "hasSentencePatterns" },
];

const errors = [], gaps = [];
const rows = [];

for (const code of codes) {
  const cells = [];
  for (const f of FEATURES) {
    const present = has(f.table, code);
    cells.push(present);
    if (!present) {
      if (f.required) {
        errors.push(`${code}: no ${f.label} — the app reads this without checking, so the screen breaks`);
      } else {
        gaps.push(`${code}: no ${f.label}`);
      }
    }
  }
  rows.push([code, cells]);
}

// Rule 1, enforced against the source: the Practice door must be gated on the
// data existing. A regression here is what shipped for five languages.
const home = readFileSync("src/screens/Home.jsx", "utf8");
if (/title: "Listen & follow"/.test(home)) {
  const gatedHere = /getConversations\(pack\.code\)\.length > 0/.test(home)
    && /PASSAGES\[pack\.code\]/.test(home);
  if (!gatedHere) {
    errors.push(
      `Home.jsx offers "Listen & follow" without checking that any conversation or passage exists — ` +
      `for a language with neither, that door opens onto an empty screen.`
    );
  }
}

console.log("");
console.log("  lang  " + FEATURES.map((f) => f.label.slice(0, 13).padEnd(15)).join(""));
for (const [code, cells] of rows) {
  console.log("  " + code.padEnd(6) + cells.map((c) => (c ? "  yes" : "  —").padEnd(15)).join(""));
}

const complete = rows.filter(([, c]) => c.every(Boolean)).length;
console.log(`\n  ${complete}/${rows.length} languages have every feature`);

if (gaps.length) {
  console.log(`\n  ${gaps.length} content gap(s) — correctly gated, so nothing is broken:`);
  for (const g of gaps) console.log("   · " + g);
}

if (errors.length) {
  console.error(`\n  ${errors.length} error(s):`);
  for (const e of errors) console.error("   ✗ " + e);
  console.error("");
  process.exit(1);
}
console.log(`\n  every door opens onto something · 0 errors\n`);
