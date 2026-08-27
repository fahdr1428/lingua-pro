// =============================================================================
// merge-translit.mjs (v92) — write example romanisation into the packs.
//
// Keyed by the native sentence, so a key that matches nothing is a typo in the
// content file rather than a silent no-op. That case is an ERROR: an entry I
// wrote and the app never shows is worse than one I never wrote, because the
// count looks right.
//
// Existing translit is never overwritten — the hand-written ones already in the
// packs are the style reference, not something to be replaced.
//
//   node scripts/merge-translit.mjs
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { ZH } from "./content/translit-zh.mjs";
import { KO } from "./content/translit-ko.mjs";
import { JA } from "./content/translit-ja.mjs";
import { AR, UR, PA } from "./content/translit-arabic-script.mjs";

const TABLES = { zh: ZH, ko: KO, ja: JA, ar: AR, ur: UR, pa: PA };

const errors = [];
const rows = [];

for (const [code, table] of Object.entries(TABLES)) {
  const path = `src/data/languages/${code}.json`;
  const pack = JSON.parse(readFileSync(path, "utf8"));

  const used = new Set();
  let filled = 0, already = 0, stillMissing = 0;

  for (const w of pack.vocab || []) {
    for (const e of w.examples || []) {
      if (e.translit) { already++; continue; }
      const t = table[e.native];
      if (t) {
        e.translit = t;
        used.add(e.native);
        filled++;
      } else {
        stillMissing++;
        errors.push(`${code}: no romanisation for "${e.native}"`);
      }
    }
  }

  // A key that matched nothing means the native text in the table doesn't
  // exactly equal the text in the pack — usually invisible whitespace or a
  // different comma. Loud, because it fails silently otherwise.
  for (const key of Object.keys(table)) {
    if (!used.has(key)) {
      const isReal = (pack.vocab || []).some((w) =>
        (w.examples || []).some((e) => e.native === key));
      if (!isReal) errors.push(`${code}: table key "${key}" matches no example in the pack`);
    }
  }

  rows.push({ code, filled, already, stillMissing });
  if (!errors.length) writeFileSync(path, JSON.stringify(pack, null, 2) + "\n");
}

console.log("");
for (const r of rows) {
  console.log(`  ${r.stillMissing ? "[X]" : "[ok]"} ${r.code.padEnd(3)} +${String(r.filled).padStart(4)} filled · ${String(r.already).padStart(4)} already had one · ${r.stillMissing} still missing`);
}

if (errors.length) {
  console.error(`\n  REFUSED TO WRITE — ${errors.length} problem(s):\n`);
  for (const e of errors.slice(0, 25)) console.error("   ✗ " + e);
  if (errors.length > 25) console.error(`   … and ${errors.length - 25} more`);
  console.error("");
  process.exit(1);
}

const total = rows.reduce((n, r) => n + r.filled, 0);
console.log(`\n  ${total} example sentences can now be said out loud\n`);
