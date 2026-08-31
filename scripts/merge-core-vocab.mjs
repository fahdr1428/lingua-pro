// =============================================================================
// merge-core-vocab.mjs (v100) — write scripts/content/core-fill.mjs into the packs.
//
// Mechanical, idempotent and loud about what it refuses:
//   · skips a word whose lemma the pack already has (running twice is safe)
//   · skips a word whose concept the pack already satisfies (the fill file
//     could be out of date with the packs)
//   · refuses a unit id the pack does not define, rather than creating a word
//     that belongs to no lesson
//   · assigns ids and frequencyRank continuing the pack's own numbering
//
//   node scripts/merge-core-vocab.mjs [--dry]
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { CORE_FILL, CORE_FILL_2 } from "./content/core-fill.mjs";
import { CORE, normalizeGloss, taughtGlosses } from "../src/data/coreVocabulary.js";

const DRY = process.argv.includes("--dry");
const LATIN = new Set(["es", "fr", "de", "id", "tr", "pcm", "tl", "so"]);
const byId = new Map(CORE.map((k) => [k.id, k]));

let added = 0, skipped = 0, refused = 0;

// Both passes, merged the same way. Entries the packs already satisfy are
// skipped, so re-running after a pass has landed is a no-op.
const ALL = {};
for (const src of [CORE_FILL, CORE_FILL_2]) {
  for (const [code, entries] of Object.entries(src)) ALL[code] = (ALL[code] || []).concat(entries);
}

for (const [code, entries] of Object.entries(ALL)) {
  const path = `src/data/languages/${code}.json`;
  const pack = JSON.parse(readFileSync(path, "utf8"));
  const vocab = pack.vocab || [];

  const unitIds = new Set((pack.units || []).map((u) => u.id));
  const haveLemma = new Set(vocab.map((w) => String(w.lemma).trim().toLowerCase()));
  const taught = taughtGlosses(vocab);

  // Continue the pack's own numbering rather than inventing a scheme.
  let maxNum = 0, maxRank = 0;
  for (const w of vocab) {
    const n = Number(String(w.id).split("_")[1]);
    if (Number.isFinite(n)) maxNum = Math.max(maxNum, n);
    maxRank = Math.max(maxRank, Number(w.frequencyRank) || 0);
  }

  const fresh = [];
  for (const [conceptId, lemma, translit, translation, category, unit, exN, exT, exE] of entries) {
    const concept = byId.get(conceptId);
    const at = `${code}/${lemma}`;

    if (!concept) { console.log(`  refuse ${at}: "${conceptId}" is not a core concept`); refused++; continue; }
    if (!unitIds.has(unit)) { console.log(`  refuse ${at}: unit "${unit}" is not defined in the pack`); refused++; continue; }
    if (!LATIN.has(code) && !translit) { console.log(`  refuse ${at}: non-Latin script needs a transliteration`); refused++; continue; }
    if (!exN || !exE) { console.log(`  refuse ${at}: no example sentence`); refused++; continue; }

    if (haveLemma.has(String(lemma).trim().toLowerCase()) && code !== "de") {
      console.log(`  skip   ${at}: the pack already has this lemma`); skipped++; continue;
    }
    if (concept.accepts.some((a) => taught.has(normalizeGloss(a)))) {
      console.log(`  skip   ${at}: "${concept.label}" is already taught`); skipped++; continue;
    }

    maxNum += 1; maxRank += 1;
    const entry = {
      id: `${code}_${String(maxNum).padStart(4, "0")}`,
      unit,
      category,
      lemma,
      translation,
      difficulty: 1,
      frequencyRank: maxRank,
      examples: [{ native: exN, translation: exE, ...(exT ? { translit: exT } : {}) }],
    };
    if (translit) entry.translit = translit;

    fresh.push(entry);
    haveLemma.add(String(lemma).trim().toLowerCase());
    for (const seg of String(translation).split(/[,;/]/)) {
      const g = normalizeGloss(seg);
      if (g) taught.add(g);
    }
    added++;
  }

  if (!fresh.length) continue;

  // A category the pack has never used has to be declared, or the pack's own
  // category list stops describing it.
  const cats = new Set(pack.categories || []);
  for (const w of fresh) cats.add(w.category);
  pack.categories = [...cats].sort();

  pack.vocab = vocab.concat(fresh);
  console.log(`  ${code}: +${fresh.length} → ${pack.vocab.length} words`);
  if (!DRY) writeFileSync(path, JSON.stringify(pack, null, 2) + "\n");
}

console.log(`\n  ${added} added · ${skipped} skipped · ${refused} refused${DRY ? "  (dry run — nothing written)" : ""}\n`);
if (refused) process.exit(1);
