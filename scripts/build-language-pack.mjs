// =============================================================================
// build-language-pack.mjs (v102) — turn a content file into a language pack.
//
// The content files (scripts/content/lang-*.mjs) are the thing a human reviews:
// words, glosses, one example each, in flat rows. This assembles them into the
// JSON shape src/data/languages/*.json uses, so nobody hand-maintains ids,
// frequency ranks or the category list.
//
// Refuses rather than writing something broken:
//   · a unit id the pack does not define
//   · a duplicate lemma
//   · an example that does not contain the word
//   · a concept id that is not in coreVocabulary.js
//   · a survival or everyday concept the pack never covers
//
//   node scripts/build-language-pack.mjs vi yo
// =============================================================================

import { writeFileSync } from "node:fs";
import { CORE, normalizeGloss, taughtGlosses } from "../src/data/coreVocabulary.js";

const SOURCES = {
  vi: () => import("./content/lang-vi.mjs").then((m) => m.VI),
  yo: () => import("./content/lang-yo.mjs").then((m) => m.YO),
};

const want = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const codes = want.length ? want : Object.keys(SOURCES);
const byId = new Map(CORE.map((k) => [k.id, k]));

let failed = false;

for (const code of codes) {
  if (!SOURCES[code]) { console.log(`  refuse ${code}: no content file`); failed = true; continue; }
  const src = await SOURCES[code]();
  const problems = [];

  const unitIds = new Set(src.units.map((u) => u.id));
  const groupIds = new Set(src.alphabetGroups.map((g) => g.id));
  for (const l of src.alphabet) {
    if (!groupIds.has(l.group)) problems.push(`letter "${l.char}" is in group "${l.group}", which is not declared`);
  }
  for (const g of src.alphabetGroups) {
    if (!src.alphabet.some((l) => l.group === g.id)) problems.push(`group "${g.id}" has no letters`);
  }

  const seenLemma = new Set();
  const seenConcept = new Set();
  const vocab = [];
  const categories = new Set();

  src.vocab.forEach(([conceptId, unit, category, lemma, translation, exNative, exEn], i) => {
    const at = `${code}/${lemma}`;
    if (!unitIds.has(unit)) problems.push(`${at}: unit "${unit}" is not defined`);
    if (!lemma || !translation) problems.push(`${at}: incomplete row`);
    if (seenLemma.has(lemma)) problems.push(`${at}: duplicate lemma`);
    seenLemma.add(lemma);

    if (conceptId) {
      if (!byId.has(conceptId)) problems.push(`${at}: "${conceptId}" is not a core concept`);
      else if (seenConcept.has(conceptId)) problems.push(`${at}: concept "${conceptId}" is already covered`);
      seenConcept.add(conceptId);
    }

    if (!exNative || !exEn) problems.push(`${at}: no example sentence`);
    else if (!exNative.toLowerCase().includes(lemma.toLowerCase().split(" ")[0].slice(0, Math.max(2, Math.ceil(lemma.split(" ")[0].length * 0.6))))) {
      problems.push(`${at}: the example "${exNative}" does not contain the word`);
    }

    categories.add(category);
    vocab.push({
      id: `${code}_${String(i + 1).padStart(4, "0")}`,
      unit,
      category,
      lemma,
      translation,
      difficulty: 1,
      frequencyRank: i + 1,
      examples: [{ native: exNative, translation: exEn }],
    });
  });

  // Every survival and everyday concept has to be here, or validate-core-vocab
  // fails the build the moment this pack lands.
  const taught = taughtGlosses(vocab);
  for (const k of CORE) {
    if (k.tier === 3) continue;
    const covered = k.accepts.some((a) => taught.has(normalizeGloss(a)));
    if (!covered) problems.push(`missing tier-${k.tier} concept "${k.label}"`);
  }

  if (problems.length) {
    console.log(`\n  ${code}: ${problems.length} problem(s)`);
    for (const p of problems.slice(0, 25)) console.log(`    ✗ ${p}`);
    if (problems.length > 25) console.log(`    ✗ …and ${problems.length - 25} more`);
    failed = true;
    continue;
  }

  const pack = {
    schemaVersion: 1,
    code,
    categories: [...categories].sort(),
    units: src.units,
    alphabet: src.alphabet,
    frameworks: [],
    vocab,
    alphabetGroups: src.alphabetGroups,
  };

  writeFileSync(`src/data/languages/${code}.json`, JSON.stringify(pack, null, 2) + "\n");
  console.log(`  ${code}: ${vocab.length} words · ${src.units.length} units · ${src.alphabet.length} letters · written`);
}

console.log("");
if (failed) process.exit(1);
