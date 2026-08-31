// =============================================================================
// validate-core-vocab.mjs (v100) — does every language teach the same course?
//
// Until v100 nothing in the repo said what a language pack was FOR, so nineteen
// packs written in different passes drifted. Measured before any of them were
// touched: 420 distinct concepts app-wide, 53 taught in all nineteen languages,
// 147 taught in exactly one. Punjabi had no word for "eat". Persian had none
// for "drink". Five packs had no word for "bathroom" — while the Sentence Lab
// taught "Where is the bathroom?" in three of them.
//
// This measures each pack against src/data/coreVocabulary.js and fails the
// build on a missing TIER 1 concept. Tier 2 is reported as a warning; tier 3 is
// reported and never enforced.
//
// The check is on MEANINGS, not strings: a concept lists the English glosses
// that count as teaching it, so Persian خوردن covering both eat and drink
// satisfies both, and "uncle (mother's brother)" satisfies "uncle".
//
//   npm run validate-core-vocab
// =============================================================================

import { readdirSync, readFileSync } from "node:fs";
import { CORE, TIER_NAMES, missingConcepts, taughtGlosses } from "../src/data/coreVocabulary.js";

const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));

const errors = [];
const warnings = [];
const rows = [];

const tierCount = { 1: 0, 2: 0, 3: 0 };
for (const k of CORE) tierCount[k.tier]++;

// The spine itself has to be coherent before it can judge anything.
{
  const ids = new Set();
  for (const k of CORE) {
    if (ids.has(k.id)) errors.push(`coreVocabulary: duplicate concept id "${k.id}"`);
    ids.add(k.id);
    if (!k.accepts.length) errors.push(`coreVocabulary: "${k.id}" accepts no glosses — nothing could ever satisfy it`);
    if (![1, 2, 3].includes(k.tier)) errors.push(`coreVocabulary: "${k.id}" has tier ${k.tier}`);
  }
}

let totalMissing = 0;

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const vocab = pack.vocab || [];
  const missing = missingConcepts(vocab);
  totalMissing += missing.length;

  const byTier = { 1: [], 2: [], 3: [] };
  for (const m of missing) byTier[m.tier].push(m.label);

  if (byTier[1].length) {
    errors.push(`${code}: missing ${byTier[1].length} survival word(s) — ${byTier[1].join(", ")}`);
  }
  if (byTier[2].length) {
    warnings.push(`${code}: missing ${byTier[2].length} everyday word(s) — ${byTier[2].slice(0, 12).join(", ")}${byTier[2].length > 12 ? "…" : ""}`);
  }

  rows.push([
    code,
    vocab.length,
    `${tierCount[1] - byTier[1].length}/${tierCount[1]}`,
    `${tierCount[2] - byTier[2].length}/${tierCount[2]}`,
    `${tierCount[3] - byTier[3].length}/${tierCount[3]}`,
  ]);
}

// A pack far smaller than the rest is its own kind of failure: the learner who
// picked it gets less of a course than the one who picked Spanish, whatever the
// concept coverage says.
{
  const sizes = rows.map((r) => r[1]);
  const median = [...sizes].sort((a, b) => a - b)[Math.floor(sizes.length / 2)];
  for (const [code, n] of rows) {
    if (n < median * 0.7) {
      warnings.push(`${code}: ${n} words against a median of ${median} — a thinner course than the rest of the app`);
    }
  }
}

console.log(`\n  core vocabulary: ${CORE.length} concepts · ${tierCount[1]} survival · ${tierCount[2]} everyday · ${tierCount[3]} reach`);
console.log(`  ${"lang".padEnd(6)}${"words".padStart(6)}${"survival".padStart(11)}${"everyday".padStart(11)}${"reach".padStart(9)}`);
for (const [code, n, t1, t2, t3] of rows) {
  console.log(`  ${code.padEnd(6)}${String(n).padStart(6)}${t1.padStart(11)}${t2.padStart(11)}${t3.padStart(9)}`);
}
console.log(`\n  ${totalMissing} concept gap(s) across ${codes.length} languages`);

if (warnings.length) {
  console.log(`\n  ${warnings.length} warning(s)`);
  for (const w of warnings) console.log(`    ~ ${w}`);
}

if (errors.length) {
  console.log(`\n  ${errors.length} error(s)`);
  for (const e of errors) console.log(`    ✗ ${e}`);
  console.log("");
  process.exit(1);
}

console.log("\n  every language teaches every survival word · 0 errors\n");
