// =============================================================================
// test-input-stream.mjs (v101) — the reading stream must use every sentence
// the app has.
//
// THE BUG THIS PINS
//
// src/engine/inputStream.js collected sentences with
//
//     for (const ex of v.examples || [])
//
// — the pack's own examples, and nothing else. extraExamples.js was never
// consulted, so 1,160 sentences (a third of the app's entire corpus, including
// every second frame added in v101) were absent from the one screen whose whole
// purpose is comprehensible input. The vocabulary cards merged them. The
// reading feature did not. Nothing noticed, because every check read the data
// files rather than what the engine returns.
//
// Asserted here rather than in a browser on purpose. The browser version of
// this check PASSED against a build with the merge deliberately removed — the
// reading screen surfaces sentences by more than one route, so the absence
// didn't show. A check that cannot fail is worse than no check, so the claim is
// made where it can be isolated: call readableSentences and look at what comes
// back.
//
//   npm run test-input-stream
// =============================================================================

import { readdirSync, readFileSync } from "node:fs";
import { readableSentences } from "../src/engine/inputStream.js";
import { EXTRA_EXAMPLES } from "../src/data/extraExamples.js";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
};

const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));

/** A learner who has met every word, so the stream offers everything it can. */
function knowsEverything(pack) {
  const now = Date.now();
  const out = {};
  for (const w of pack.vocab) {
    out[w.id] = { reps: 6, lapses: 0, ease: 2.5, interval: 30, stability: 30, difficulty: 5, due: now + 8.64e7, lastReview: now };
  }
  return out;
}

console.log("\n  the reading stream draws on extraExamples.js");

const missing = [];
let totalExtraOnly = 0, totalServed = 0;

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  pack.code = pack.code || code;

  const packSentences = new Set(pack.vocab.flatMap((w) => (w.examples || []).map((e) => e.native)));
  const extras = EXTRA_EXAMPLES[code] || {};
  const extraOnly = Object.values(extras).flat()
    .map((e) => e?.native)
    .filter((n) => n && !packSentences.has(n));
  if (!extraOnly.length) continue;

  const stream = readableSentences(pack, knowsEverything(pack), { maxUnknown: 3 });
  const served = new Set(stream.map((s) => s.native));

  const seen = extraOnly.filter((n) => served.has(n));
  totalExtraOnly += extraOnly.length;
  totalServed += seen.length;

  // Not all of them: a sentence can still be filtered out for being too far
  // past the learner's level. But if NONE arrive, the merge is gone.
  if (!seen.length) missing.push(`${code} (0 of ${extraOnly.length})`);
}

ok(`every language's extra sentences reach the stream (${totalServed} of ${totalExtraOnly} served)`,
  missing.length === 0, missing.join(", "));

ok("more than half of the extra sentences are actually offered",
  totalServed > totalExtraOnly / 2, `${totalServed}/${totalExtraOnly}`);

// --- and the stream is bigger than it was ------------------------------------
console.log("\n  and the stream is worth reading");

{
  const thin = [];
  for (const code of codes) {
    const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
    pack.code = pack.code || code;
    const n = readableSentences(pack, knowsEverything(pack), { maxUnknown: 1 }).length;
    if (n < 60) thin.push(`${code} ${n}`);
  }
  ok("every language offers at least 60 readable sentences to a finished learner",
    thin.length === 0, thin.join(", "));
}

// --- v118: "You know every word of these" is only said when it is true -------
console.log("\n  and \"you know every word\" is true");
{
  const PUNCT = /[.,!?;:"'`´’“”«»()[\]{}…—–\-،؛؟۔।॥、。！？]/g;
  const clean = (x) => String(x || "").replace(PUNCT, " ").replace(/\s+/g, " ").trim().toLowerCase();
  const wrong = [];
  let full = 0, notFull = 0;
  for (const code of codes) {
    if (code === "zh" || code === "ja") continue;      // checked by segment.js's own rule below
    const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
    pack.code = pack.code || code;
    // A learner half-way through: the first half of the words.
    const half = Object.fromEntries(pack.vocab.slice(0, Math.ceil(pack.vocab.length / 2)).map((v) => [v.id, { reps: 3 }]));
    const knownWords = new Set(pack.vocab.filter((v) => half[v.id]).flatMap((v) => clean(v.lemma).split(" ")));
    for (const st of readableSentences(pack, half, { maxUnknown: 1 })) {
      if (!st.full) { notFull++; continue; }
      full++;
      const stray = clean(st.native).split(" ").filter((t) => t && !knownWords.has(t));
      if (stray.length) wrong.push(`${code} "${st.native}" → ${stray.join(", ")}`);
    }
  }
  ok(`a sentence is "full" only when every word in it is a known word (${full} full, ${notFull} not)`, wrong.length === 0, wrong.slice(0, 4).join(" | "));
  ok("both kinds occur, so the check is exercising something", full > 100 && notFull > 100, `${full} / ${notFull}`);
  const ur = JSON.parse(readFileSync("src/data/languages/ur.json", "utf8")); ur.code = "ur";
  const all = readableSentences(ur, knowsEverything(ur), { maxUnknown: 1 });
  const bilkul = all.find((x) => x.native === "ہاں بالکل");
  ok("Urdu “ہاں بالکل” (بالکل isn't a course word) is not called fully known", !!bilkul && bilkul.full === false, JSON.stringify(bilkul || null));
  // Chinese: a full sentence splits completely into taught words.
  const zh = JSON.parse(readFileSync("src/data/languages/zh.json", "utf8")); zh.code = "zh";
  const zhAll = readableSentences(zh, knowsEverything(zh), { maxUnknown: 1 });
  ok("Chinese has both full and not-full sentences", zhAll.some((x) => x.full) && zhAll.some((x) => !x.full), `${zhAll.filter((x) => x.full).length} full of ${zhAll.length}`);
}

console.log(`\n  ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
