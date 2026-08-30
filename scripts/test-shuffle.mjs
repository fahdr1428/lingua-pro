// =============================================================================
// test-shuffle.mjs (v98) — the word bank must never hand back the answer.
//
// The Sentence Lab asks a learner to tap chunks into the correct order. Its
// word bank was shuffled with
//
//     arr.sort(() => Math.random() - 0.5)
//
// A comparator that ignores its arguments isn't a shuffle — the result depends
// on the engine's sort, and on short arrays it barely moves anything. On a
// TWO-chunk pattern it came out already in the correct order about half the
// time, which means half of all level-1 Sentence Labs opened with the sentence
// pre-assembled and the learner tapping left-to-right for a 🎉.
//
// Eight of the nineteen languages have two-chunk level-1 patterns, so this was
// not an edge case.
//
//   npm run test-shuffle
// =============================================================================

import { shuffleBank } from "../src/screens/shuffleBank.js";
import { SENTENCE_PATTERNS } from "../src/data/sentencePatterns.js";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
};

const inOrder = (a) => a.every((c, i) => c._id === i);
const RUNS = 4000;

// --- the property that matters ----------------------------------------------
console.log("\n  the bank is never the answer");

for (const n of [2, 3, 4, 5]) {
  const chunks = Array.from({ length: n }, (_, i) => ({ text: `w${i}`, role: "object" }));
  let solved = 0;
  for (let i = 0; i < RUNS; i++) if (inOrder(shuffleBank(chunks))) solved++;
  ok(`${n} chunks: never dealt already solved`, solved === 0, `${solved}/${RUNS} runs were pre-solved`);
}

// A single chunk has no wrong order — it must still come back intact rather
// than looping or throwing.
{
  const one = shuffleBank([{ text: "Bilmiyorum", role: "negation" }]);
  ok("one chunk is returned as-is", one.length === 1 && one[0]._id === 0);
}

// --- it is still a shuffle, not a rotation ----------------------------------
console.log("\n  and it is still random");

{
  // Every position should see every chunk. A biased shuffle pins elements.
  const chunks = Array.from({ length: 4 }, (_, i) => ({ text: `w${i}`, role: "object" }));
  const seen = [new Set(), new Set(), new Set(), new Set()];
  for (let i = 0; i < RUNS; i++) {
    shuffleBank(chunks).forEach((c, pos) => seen[pos].add(c._id));
  }
  ok("every chunk reaches every position", seen.every((s) => s.size === 4),
    seen.map((s) => s.size).join("/"));
}

{
  // Position 0 should be roughly uniform over the chunks that can sit there.
  // With the "not the correct order" constraint, _id 0 is slightly rarer at
  // position 0 — but not absent, and nothing should dominate.
  const chunks = Array.from({ length: 4 }, (_, i) => ({ text: `w${i}`, role: "object" }));
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < RUNS; i++) counts[shuffleBank(chunks)[0]._id]++;
  const share = counts.map((c) => c / RUNS);
  ok("no chunk dominates the first slot", Math.max(...share) < 0.4, share.map((s) => s.toFixed(2)).join(" "));
  ok("no chunk is shut out of the first slot", Math.min(...share) > 0.1, share.map((s) => s.toFixed(2)).join(" "));
}

// --- against the real content -----------------------------------------------
console.log("\n  against every pattern the app ships");

{
  const twoChunk = [];
  let checked = 0, presolved = 0;
  for (const [lang, ladder] of Object.entries(SENTENCE_PATTERNS)) {
    for (const p of ladder) {
      const steps = [p, p.extend, p.twist].filter(Boolean);
      for (const s of steps) {
        // A one-chunk step (Turkish "Bilmiyorum" — one word IS the sentence)
        // has no wrong order to be in. Counting it would make the assertion
        // impossible to satisfy rather than meaningful; the first run of this
        // test reported exactly those two steps as failures.
        if (s.chunks.length < 2) continue;
        if (s.chunks.length === 2) twoChunk.push(`${lang}/${s.chunks.map((c) => c.text).join(" ")}`);
        for (let i = 0; i < 40; i++) {
          checked++;
          if (inOrder(shuffleBank(s.chunks))) presolved++;
        }
      }
    }
  }
  ok(`no shipped step is ever dealt solved (${checked} deals)`, presolved === 0, `${presolved} pre-solved`);
  console.log(`       ${twoChunk.length} two-chunk steps ship — the ones the old shuffle gave away`);
}

console.log(`\n  ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
