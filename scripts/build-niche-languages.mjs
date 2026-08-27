// Writes the v89 niche packs. Same guards as build-new-languages.mjs: ids and
// frequency ranks assigned here, duplicate lemmas and unknown units refused.
import { writeFileSync, existsSync } from "node:fs";
import * as packs from "./content/niche-languages.mjs";

for (const base of [packs.MALAYALAM, packs.TAMIL, packs.SOMALI]) {
  const extra = packs.TOPUP?.[base.code] || [];
  const pack = { ...base, vocab: [...base.vocab, ...extra] };
  const file = `src/data/languages/${pack.code}.json`;
  if (existsSync(file) && !process.argv.includes("--force")) {
    console.log(`  ${pack.code}: exists — pass --force to overwrite`); continue;
  }
  const seen = new Set(), units = new Set(pack.units.map((u) => u.id));
  const out = { ...pack, vocab: pack.vocab.map((v, i) => {
    const key = v.lemma.trim().toLowerCase();
    if (seen.has(key)) throw new Error(`${pack.code}: duplicate lemma "${v.lemma}"`);
    seen.add(key);
    if (!units.has(v.unit)) throw new Error(`${pack.code}: "${v.lemma}" has unknown unit ${v.unit}`);
    return { id: `${pack.code}_${String(i + 1).padStart(4, "0")}`, ...v, frequencyRank: i + 1 };
  })};
  writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
  console.log(`  ${pack.code}: ${out.vocab.length} words → ${file}`);
}
