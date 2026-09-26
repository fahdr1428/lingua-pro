// =============================================================================
// validate-content-index.mjs (v103) — is the generated index still true?
//
// src/data/contentIndex.js exists so the home screen can ask "does this
// language have any conversations / any passages?" without pulling 104KB of
// content into the eager bundle. That makes it a COPY of a fact that lives
// somewhere else, and every copy in this repo's history has drifted: nine
// copies of NON_LATIN in src/ (v92, which hid 249 romanisations from learners),
// six copies of the Latin-script list in scripts/ (v102, three of which had
// never heard of German, Tagalog or Somali).
//
// A copy is only safe if something regenerates it and compares. This does that
// — byte for byte, so a stale index cannot reach a build.
//
// It ALSO checks the thing the index exists to protect: that the heavy content
// libraries have not crept back into the eager import graph. An index nobody
// imports saves nothing, and an index imported alongside the library it
// replaces saves nothing either.
//
//   npm run validate-content-index
// =============================================================================

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildIndex, render } from "./build-content-index.mjs";

const errors = [];

// --- 1. is the file what the generator would write right now? ---------------
const PATH = "src/data/contentIndex.js";
const onDisk = readFileSync(PATH, "utf8");
const fresh = render(buildIndex());
if (onDisk !== fresh) {
  errors.push(
    `${PATH} is out of date with the content it counts. Run: npm run build-content-index`
  );
}

// --- 2. is the eager bundle still free of the libraries it replaced? --------
//
// Walks STATIC imports only, from the app's entry point. A dynamic import()
// becomes its own chunk and does not count.
const HEAVY = {
  "src/data/conversations.js": "the conversation library",
  "src/data/passages.js": "the reading library",
  // v107 — per-language libraries a learner only ever needs one slice of,
  // loaded when a screen that shows them opens.
  "src/data/culture.js": "the culture notes",
  "src/data/sentencePatterns.js": "the Sentence Lab patterns",
  "src/data/grammar.js": "the grammar lessons",
  "src/data/conjugations.js": "the verb tables",
  "src/data/tenses.js": "the tense tables",
};

function resolveSpec(from, spec) {
  if (!spec.startsWith(".")) return null;
  const p = resolve(dirname(from), spec);
  for (const c of [p, `${p}.js`, `${p}.jsx`, `${p}/index.js`]) if (existsSync(c)) return c;
  return null;
}

const seen = new Set();
const cameFrom = new Map();
function walk(file, via) {
  if (seen.has(file)) return;
  seen.add(file);
  cameFrom.set(file, via);
  const src = readFileSync(file, "utf8");
  const patterns = [
    /^\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']/gm,
    /^\s*import\s+["']([^"']+)["']/gm,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(src))) {
      const r = resolveSpec(file, m[1]);
      if (r) walk(r, file);
    }
  }
}
walk(resolve("src/main.jsx"), null);

const cwd = `${process.cwd()}/`;
const eager = new Set([...seen].map((f) => f.replace(cwd, "")));

for (const [file, what] of Object.entries(HEAVY)) {
  if (!eager.has(file)) continue;
  const abs = resolve(file);
  const chain = [];
  for (let at = cameFrom.get(abs); at; at = cameFrom.get(at)) chain.push(at.replace(cwd, ""));
  errors.push(
    `${file} (${what}) is statically imported into the eager bundle again — ` +
    `every learner downloads it before their first word. Imported via: ${chain.slice(0, 3).join(" ← ")}. ` +
    `If it is only needed to know WHETHER there is content, use src/data/contentIndex.js.`
  );
}

const kb = [...seen].reduce((n, f) => n + readFileSync(f, "utf8").length, 0) / 1024;
console.log(`\n  contentIndex.js in sync · eager graph ${seen.size} modules, ${Math.round(kb)}KB of source`);

// v107 — a budget, so the first download can't quietly grow back. It was
// 1,312KB of source (243KB gzipped) before v107 split the per-language
// libraries out; 914KB (174KB gzipped) after. The headroom is for ordinary
// feature work; crossing it means something big became eager — find it in
// the list this prints, and load it where it's used instead.
const EAGER_BUDGET_KB = 1000;
if (kb > EAGER_BUDGET_KB) {
  const biggest = [...seen].map((f) => [f.replace(cwd, ""), readFileSync(f, "utf8").length / 1024])
    .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([f, k]) => `${f} ${Math.round(k)}KB`).join(", ");
  errors.push(`the eager bundle is ${Math.round(kb)}KB of source, over the ${EAGER_BUDGET_KB}KB budget. Largest: ${biggest}`);
}

if (errors.length) {
  console.log(`\n  ✗ ${errors.length} problems\n`);
  for (const e of errors) console.log(`   ${e}`);
  console.log();
  process.exit(1);
}
console.log("  ✓ ok\n");
