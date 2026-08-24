// Writes the two new packs from scripts/content/new-languages.mjs, assigning
// ids and frequency ranks the same way every other pack has them.
import { writeFileSync, existsSync } from "node:fs";
import { TAGALOG, PERSIAN, ESSENTIALS } from "./content/new-languages.mjs";

for (const base of [TAGALOG, PERSIAN]) {
  // The essentials list is appended rather than woven in, so the order a
  // learner meets words in stays the hand-ordered one and these arrive after.
  const pack = { ...base, vocab: [...base.vocab, ...(ESSENTIALS[base.code] || [])] };
  const file = `src/data/languages/${pack.code}.json`;
  if (existsSync(file) && !process.argv.includes("--force")) {
    console.log(`  ${pack.code}: exists — pass --force to overwrite`);
    continue;
  }
  const seen = new Set();
  const out = { ...pack, vocab: pack.vocab.map((v, i) => {
    const key = v.lemma.trim().toLowerCase();
    if (seen.has(key)) throw new Error(`${pack.code}: duplicate lemma "${v.lemma}"`);
    seen.add(key);
    const units = new Set(pack.units.map((u) => u.id));
    if (!units.has(v.unit)) throw new Error(`${pack.code}: "${v.lemma}" has unknown unit ${v.unit}`);
    return { id: `${pack.code}_${String(i + 1).padStart(4, "0")}`, ...v, frequencyRank: i + 1 };
  })};
  writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  console.log(`  ${pack.code}: ${out.vocab.length} words → ${file}`);
}
