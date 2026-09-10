// =============================================================================
// validate-script-flags.mjs (v92) — no more hand-typed language lists.
//
// This bug has now happened three times, and every time it hurt the same person.
//
//   v90  AlphabetLessons told Malayalam learners "you already use the Latin
//        alphabet" because the empty state was hardcoded.
//   v92  Eight screens each kept their OWN copy of
//          new Set(["ur","ar","hi","ja","ko","zh","fa","bn","pa"])
//        and not one learned about Malayalam or Tamil when they shipped in v89.
//        Every one of those screens then treated both languages as if the
//        learner could already read the script: the native line became the hero
//        instead of the English, and InContext gates the romanisation on that
//        flag, so all 249 Malayalam and Tamil romanisations were invisible.
//
// The failure is never the list being wrong on the day it is typed. It is the
// list not knowing a language was added six months later. So the rule is: there
// is ONE list, it lives in src/data/registry.js, it names the SHORT side
// (Latin-script), and a new language defaults to "the learner needs help
// reading this" — the safe direction to be wrong in.
//
// This fails the build if a second copy appears anywhere in src/.
//
//   npm run validate-script-flags
// =============================================================================

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const errors = [], notes = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(js|jsx)$/.test(p)) out.push(p);
  }
  return out;
}

const files = walk("src");

// The set as it appears in the registry — the one legitimate definition.
const REGISTRY = "src/data/registry.js";
const registrySrc = readFileSync(REGISTRY, "utf8");
if (!/export const LATIN_SCRIPT_LANGUAGES/.test(registrySrc)) {
  errors.push(`${REGISTRY}: LATIN_SCRIPT_LANGUAGES is gone — the single source of truth for script handling`);
}
if (!/export function isNonLatinScript/.test(registrySrc)) {
  errors.push(`${REGISTRY}: isNonLatinScript() is gone — screens import it to decide how to present a language`);
}

// Any OTHER file that hardcodes a set of language codes for script decisions.
// Matched on shape, not on the exact nine codes, so a "fixed" copy that adds
// ml and ta but stays a copy is still caught.
const SCRIPT_SET = /(?:const|let)\s+\w*(?:NON_LATIN|LATIN|SCRIPT)\w*\s*=\s*new Set\(\s*\[([^\]]*)\]/gi;

for (const file of files) {
  if (file.replace(/\\/g, "/") === REGISTRY) continue;
  const src = readFileSync(file, "utf8");
  let m;
  while ((m = SCRIPT_SET.exec(src))) {
    const codes = m[1].split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean);
    // Only language-code-shaped lists — two or three letters.
    const langish = codes.filter((c) => /^[a-z]{2,3}$/.test(c));
    if (langish.length >= 3) {
      errors.push(
        `${file}: hardcodes a script list [${langish.join(", ")}] — import isNonLatinScript from data/registry.js instead. ` +
        `This is exactly the copy that never learned about Malayalam and Tamil.`
      );
    }
  }
}

// v102 — this used to compare two hand-kept literals: the registry's set and a
// copy inside validate-alphabets.mjs. Six scripts turned out to be keeping
// their own copies, and they had drifted — import-vocab, measure-input and
// validate-journey had never learned about German, Tagalog or Somali. So the
// copies are gone and every script imports the registry's set. What is worth
// checking now is that they still DO, rather than that two literals match.
const SHOULD_IMPORT = [
  "scripts/validate-vocab.mjs",
  "scripts/validate-alphabets.mjs",
  "scripts/validate-journey.mjs",
  "scripts/measure-input.mjs",
  "scripts/import-vocab.mjs",
  "scripts/merge-core-vocab.mjs",
];
for (const file of SHOULD_IMPORT) {
  const src = readFileSync(file, "utf8");
  if (/const LATIN = new Set\(/.test(src)) {
    errors.push(
      `${file} has grown its own Latin-script list again. There is one, in ` +
      `src/data/registry.js, and every copy of it in this repo's history has drifted.`
    );
  } else if (!/LATIN_SCRIPT_LANGUAGES/.test(src)) {
    errors.push(`${file} no longer imports LATIN_SCRIPT_LANGUAGES — it decides script handling from something else now`);
  }
}
notes.push(`${SHOULD_IMPORT.length} scripts take the Latin-script list from the registry`);

console.log("");
if (notes.length) for (const n of notes) console.log("  [ok] " + n);
console.log(`  [ok] ${files.length} source files scanned for duplicate script lists`);

if (errors.length) {
  console.error(`\n  ${errors.length} error(s):`);
  for (const e of errors) console.error("   ✗ " + e);
  console.error("");
  process.exit(1);
}
console.log(`\n  one source of truth · 0 errors\n`);
