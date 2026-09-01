// =============================================================================
// merge-second-frames.mjs (v101) — write second-frames.mjs into extraExamples.js.
//
// extraExamples.js is the one place the app looks for a word's extra sentences
// (mergeExamples reads it and nothing else), so the new frames go there rather
// than into a second source of truth that could drift out of step with it.
//
// Refuses, loudly, rather than writing something the learner would never see:
//   · a lemma the pack does not have — the key would sit in the file forever
//     matching nothing, which is exactly how 65 examples went missing in v92
//   · a sentence the word already has — mergeExamples dedupes by native string,
//     so it would be a dead frame
//   · a non-Latin language with no transliteration
//
//   node scripts/merge-second-frames.mjs [--dry]
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { SECOND_FRAMES } from "./content/second-frames.mjs";
import { EXTRA_EXAMPLES } from "../src/data/extraExamples.js";
import { LATIN_SCRIPT_LANGUAGES } from "../src/data/registry.js";

const DRY = process.argv.includes("--dry");
const MARKER = "  // ===== v101 SECOND FRAMES";

let added = 0, skipped = 0, refused = 0;
const perLang = {};

for (const [code, entries] of Object.entries(SECOND_FRAMES)) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const byLemma = new Map(pack.vocab.map((w) => [w.lemma, w]));
  const existing = EXTRA_EXAMPLES[code] || {};
  const rows = [];

  for (const [lemma, [native, translit, translation]] of Object.entries(entries)) {
    const at = `${code}/${lemma}`;
    const word = byLemma.get(lemma);

    if (!word) { console.log(`  refuse ${at}: the pack has no such lemma`); refused++; continue; }
    if (!native || !translation) { console.log(`  refuse ${at}: incomplete`); refused++; continue; }
    if (!LATIN_SCRIPT_LANGUAGES.has(code) && !translit) {
      console.log(`  refuse ${at}: non-Latin script needs a transliteration`); refused++; continue;
    }

    // Pack-WIDE, not just this word's own frames. Ten of the first batch were
    // sentences another card in the same pack already used — "水很冷" belongs to
    // 冷, "Su soğuk." to soğuk — and validate-word-truth caught every one after
    // they had been written. mergeExamples dedupes per lemma, so they would
    // have merged fine and simply repeated a sentence the learner had already
    // seen on a different card.
    const have = new Set([
      ...pack.vocab.flatMap((v) => (v.examples || []).map((e) => e.native)),
      ...Object.values(existing).flat().map((e) => e.native),
    ]);
    if (have.has(native)) { console.log(`  skip   ${at}: the word already has that sentence`); skipped++; continue; }
    if (existing[lemma]) { console.log(`  skip   ${at}: already has an extra frame`); skipped++; continue; }

    rows.push(
      translit
        ? `    ${JSON.stringify(lemma)}: [{ native: ${JSON.stringify(native)}, translit: ${JSON.stringify(translit)}, translation: ${JSON.stringify(translation)} }],`
        : `    ${JSON.stringify(lemma)}: [{ native: ${JSON.stringify(native)}, translation: ${JSON.stringify(translation)} }],`
    );
    added++;
  }

  if (rows.length) perLang[code] = rows;
}

if (Object.keys(perLang).length) {
  const path = "src/data/extraExamples.js";
  let src = readFileSync(path, "utf8");

  for (const [code, rows] of Object.entries(perLang)) {
    // Find this language's block and append inside it, so mergeExamples finds
    // the new keys under the language it already looks them up by.
    const open = new RegExp(`\\n  ${code}: \\{`);
    const m = open.exec(src);
    if (!m) { console.log(`  refuse ${code}: no block in extraExamples.js`); refused++; continue; }

    // Walk to the matching close brace of this language block.
    let i = m.index + m[0].length, depth = 1;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const insertAt = i - 1;                       // just before the closing brace
    const block = `\n${MARKER} — survival words that had only one sentence\n${rows.join("\n")}\n  `;
    src = src.slice(0, insertAt) + block + src.slice(insertAt);
    console.log(`  ${code}: +${rows.length}`);
  }

  if (!DRY) writeFileSync(path, src);
}

console.log(`\n  ${added} added · ${skipped} skipped · ${refused} refused${DRY ? "  (dry run — nothing written)" : ""}\n`);
if (refused) process.exit(1);
