// Writes alphabet + alphabetGroups into the packs that had neither.
import { readFileSync, writeFileSync } from "node:fs";
import { ALPHABETS } from "./content/alphabets.mjs";

for (const [code, data] of Object.entries(ALPHABETS)) {
  const file = `src/data/languages/${code}.json`;
  const pack = JSON.parse(readFileSync(file, "utf8"));
  const ids = new Set(data.groups.map((g) => g.id));
  for (const l of data.letters) {
    if (!ids.has(l.group)) throw new Error(`${code}: letter "${l.char}" is in unknown group ${l.group}`);
  }
  for (const g of data.groups) {
    const n = data.letters.filter((l) => l.group === g.id).length;
    if (!n) throw new Error(`${code}: group ${g.id} has no letters`);
  }
  pack.alphabet = data.letters;
  pack.alphabetGroups = data.groups;
  writeFileSync(file, JSON.stringify(pack, null, 2) + "\n");
  console.log(`  ${code}: ${data.letters.length} letters in ${data.groups.length} groups`);
}
