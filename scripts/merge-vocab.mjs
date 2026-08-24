// =============================================================================
// merge-vocab.mjs (v86) — add words to a language pack, safely.
//
// Editing 14 JSON files by hand is how you get duplicate ids, words in the
// wrong script, and a lemma that already exists three units earlier. This takes
// a plain list of new words per language, assigns ids continuing each pack's own
// sequence, refuses anything that collides with what's already there, and
// writes the packs back.
//
// It does NOT validate the language itself — `npm run validate-vocab` does that,
// and it runs straight after. This only guarantees the mechanical parts are
// right, which is the part a human is bad at and a script is good at.
//
//   node scripts/merge-vocab.mjs            # apply
//   node scripts/merge-vocab.mjs --dry      # show what would change
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { ADDITIONS } from "./content/additions.mjs";

const DRY = process.argv.includes("--dry");
const LANG_DIR = "src/data/languages";

let added = 0, skipped = 0;
const report = [];

for (const [code, words] of Object.entries(ADDITIONS)) {
  const file = `${LANG_DIR}/${code}.json`;
  const pack = JSON.parse(readFileSync(file, "utf8"));

  // Continue the pack's own id sequence rather than guessing a format.
  const nums = pack.vocab
    .map((w) => Number(String(w.id).replace(/^.*_/, "")))
    .filter((n) => Number.isFinite(n));
  let next = (nums.length ? Math.max(...nums) : 0) + 1;
  const width = String(pack.vocab[0]?.id || "").replace(/^.*_/, "").length || 4;

  // New words rank after the existing curriculum. They are supplementary, and
  // giving them a low (= common) rank would silently reorder what a beginner
  // meets first — the unit is what decides where they appear.
  const maxRank = Math.max(0, ...pack.vocab.map((w) => w.frequencyRank || 0));
  let rank = maxRank + 1;

  const haveLemma = new Set(pack.vocab.map((w) => String(w.lemma).trim().toLowerCase()));
  const unitIds = new Set((pack.units || []).map((u) => u.id));
  const cats = new Set(pack.categories || []);
  const fresh = [];

  for (const w of words) {
    const key = String(w.lemma).trim().toLowerCase();
    if (haveLemma.has(key)) {
      report.push(`  ${code}: skipped "${w.lemma}" — already in the pack`);
      skipped++;
      continue;
    }
    if (w.unit && unitIds.size && !unitIds.has(w.unit)) {
      report.push(`  ${code}: FAILED "${w.lemma}" — unit ${w.unit} does not exist`);
      skipped++;
      continue;
    }
    haveLemma.add(key);
    if (w.category) cats.add(w.category);
    fresh.push({
      id: `${code}_${String(next++).padStart(width, "0")}`,
      unit: w.unit,
      lemma: w.lemma,
      ...(w.translit ? { translit: w.translit } : {}),
      translation: w.translation,
      category: w.category,
      difficulty: w.difficulty ?? 2,
      frequencyRank: rank++,
      ...(w.examples ? { examples: w.examples } : {}),
      ...(w.note ? { note: w.note } : {}),
    });
    added++;
  }

  if (!fresh.length) continue;
  pack.vocab.push(...fresh);
  pack.categories = [...cats].sort();
  report.push(`  ${code}: +${fresh.length} words (${pack.vocab.length} total)`);
  if (!DRY) writeFileSync(file, JSON.stringify(pack, null, 2) + "\n");
}

console.log(`\n${DRY ? "DRY RUN — nothing written" : "merged"}\n`);
console.log(report.join("\n"));
console.log(`\n  ${added} added · ${skipped} skipped\n`);
