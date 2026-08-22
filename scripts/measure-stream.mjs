// =============================================================================
// measure-stream.mjs (v83) — does the input stream actually have anything in it?
//
// readableSentences reassembles the curriculum's example sentences into
// something a learner can sit and read, ordered by how much of each they
// already know. Two ways that can fail silently, and both would look fine in
// the code:
//
//   EMPTY — if unknown-word counting is too strict, every sentence is "too
//   hard" and the screen is blank forever. A beginner is the case that matters:
//   they know almost nothing, so almost everything has an unknown word in it.
//
//   INDISCRIMINATE — if it's too lax, everything qualifies from day one, the
//   ordering means nothing, and a learner who knows ten words is handed the
//   whole language and told it's their level. That's worse than empty: it
//   fails quietly, and it fails by discouraging exactly the person it's for.
//
// So this walks a learner from ten words to the whole deck and prints what the
// stream holds at each point. The shape to look for is growth: a little at the
// start, a lot by the middle, and the "read outright" band overtaking the
// "one new word" band as they learn.
//
//   npm run measure-stream
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { readableSentences, inputSummary } from "../src/engine/inputStream.js";
import { LANGUAGES } from "../src/data/registry.js";

const DIR = "src/data/languages";
const STAGES = [10, 30, 60, 120, 9999];

const pad = (s, n) => String(s).padEnd(n);
const num = (s, n) => String(s).padStart(n);

console.log("\n  Sentences waiting in the input stream, as a learner progresses");
console.log("  (read outright + one new word)\n");
console.log(`  ${pad("", 18)}${STAGES.map((s) => num(s === 9999 ? "all" : s + "w", 12)).join("")}`);
console.log(`  ${"─".repeat(18 + STAGES.length * 12)}`);

let anyEmpty = 0, anyAllAtOnce = 0;

for (const file of readdirSync(DIR).sort()) {
  const pack = JSON.parse(readFileSync(`${DIR}/${file}`, "utf8"));
  const cells = [];
  for (const stage of STAGES) {
    const progress = {};
    for (const v of (pack.vocab || []).slice(0, stage)) {
      progress[v.id] = { reps: 3, lapses: 0, stability: 5, lastReview: Date.now() };
    }
    const s = inputSummary(pack, progress);
    cells.push(`${s.fluent}+${s.stretch}`);
    if (stage === 10 && s.total === 0) anyEmpty++;
    // Ten words in, being offered essentially the whole curriculum would mean
    // the level filter isn't doing anything.
    if (stage === 10 && s.total > (pack.vocab || []).length * 0.6) anyAllAtOnce++;
  }
  console.log(`  ${pad(LANGUAGES[pack.code]?.name || pack.code, 18)}${cells.map((c) => num(c, 12)).join("")}`);
}

// A worked example, so the ordering can be read rather than trusted.
const ur = JSON.parse(readFileSync(`${DIR}/ur.json`, "utf8"));
const progress = {};
for (const v of ur.vocab.slice(0, 30)) progress[v.id] = { reps: 3, lapses: 0, stability: 5, lastReview: Date.now() };
const list = readableSentences(ur, progress);
const sum = inputSummary(ur, progress);

console.log(`\n  Urdu, 30 words in: ${sum.total} sentences, ~${sum.words} words of reading.`);
console.log(`  (the whole Urdu reading library is 54 words)\n`);
for (const s of list.slice(0, 6)) {
  console.log(`   ${s.unknown === 0 ? "read " : "+1   "} ${s.native}`);
  console.log(`         ${s.translit}`);
  console.log(`         ${s.translation}`);
}

console.log("");
if (anyEmpty) console.log(`  [!] ${anyEmpty} language(s) offer a beginner nothing at all.`);
if (anyAllAtOnce) console.log(`  [!] ${anyAllAtOnce} language(s) hand a ten-word beginner most of the curriculum.`);
if (!anyEmpty && !anyAllAtOnce) console.log("  Every language gives a beginner something, and none gives them everything.\n");
