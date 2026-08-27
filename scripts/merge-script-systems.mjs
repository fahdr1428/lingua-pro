// =============================================================================
// merge-script-systems.mjs (v91) — write the script systems into the packs.
//
// Refuses to write anything it can't verify against the pack it's writing into:
// a demo consonant that isn't in the alphabet, a non-connector that isn't in the
// alphabet, or a confusable set that names a letter the course never teaches.
//
// The last one is a warning rather than an error — pointing at a letter the
// learner hasn't met yet ("there is also ڈ, watch for it") is legitimate — but
// it is printed every run so it stays a decision rather than an accident.
//
//   node scripts/merge-script-systems.mjs
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { SCRIPT_SYSTEMS } from "./content/script-systems.mjs";

const errors = [], notes = [];

for (const [code, sys] of Object.entries(SCRIPT_SYSTEMS)) {
  const path = `src/data/languages/${code}.json`;
  let pack;
  try {
    pack = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    errors.push(`${code}: no language pack at ${path}`);
    continue;
  }

  const chars = new Set((pack.alphabet || []).map((l) => l.char));
  if (!chars.size) { errors.push(`${code}: pack has no alphabet to attach a script system to`); continue; }

  // --- primer is required, and must actually say something -------------------
  const p = sys.primer;
  if (!p?.title || !p?.tagline) errors.push(`${code}: primer needs a title and a tagline`);
  if (!p?.facts?.length) errors.push(`${code}: primer has no facts — an empty intro is worse than none`);
  if (!p?.hardest) errors.push(`${code}: primer doesn't say what's hardest, which is the part learners need most`);
  if (!p?.firstWin) errors.push(`${code}: primer has no first win — every hard script needs one`);
  for (const f of p?.facts || []) {
    if (!f.icon || !f.label || !f.text) errors.push(`${code}: a primer fact is missing icon/label/text`);
  }

  // --- joining: every non-connector must be a letter we teach ---------------
  if (sys.joining) {
    for (const c of sys.joining.nonConnectors) {
      if (!chars.has(c)) errors.push(`${code}: non-connector "${c}" is not in the alphabet, so the rule can never be shown`);
    }
    if (!sys.joining.note) errors.push(`${code}: joining has no note explaining the rule`);
  }

  // --- vowel signs: the demo consonant must be taught ------------------------
  if (sys.vowelSigns) {
    const v = sys.vowelSigns;
    if (!chars.has(v.demo)) errors.push(`${code}: vowel-sign demo "${v.demo}" is not in the alphabet`);
    if (!v.signs?.length) errors.push(`${code}: vowelSigns has no signs`);
    for (const s of v.signs || []) {
      if (!s.sign || !s.combined || !s.reads) errors.push(`${code}: a vowel sign is missing sign/combined/reads`);
      // The combined form must genuinely contain the demo consonant, or we are
      // showing the learner a syllable built from a letter they didn't learn.
      if (s.combined && !s.combined.includes(v.demo)) {
        errors.push(`${code}: "${s.combined}" doesn't contain the demo consonant ${v.demo}`);
      }
      if (!s.where) errors.push(`${code}: vowel sign "${s.sign}" doesn't say where it goes`);
    }
  }

  // --- blocks (Hangul) ------------------------------------------------------
  if (sys.blocks) {
    if (!sys.blocks.patterns?.length) errors.push(`${code}: blocks has no patterns`);
    for (const b of sys.blocks.patterns || []) {
      if (!b.parts?.length || !b.result || !b.reads || !b.why) {
        errors.push(`${code}: block pattern "${b.shape}" is incomplete`);
      }
    }
  }

  // --- confusables ----------------------------------------------------------
  for (const c of sys.confusables || []) {
    if (!c.chars?.length || c.chars.length < 2) errors.push(`${code}: a confusable set needs at least two characters`);
    if (!c.tell) errors.push(`${code}: confusable ${c.chars?.join("/")} has no tell — the whole point is the tell`);
    for (const ch of c.chars || []) {
      if (!chars.has(ch)) notes.push(`${code}: confusable names "${ch}", which this course doesn't teach`);
    }
  }

  pack.scriptSystem = {
    primer: sys.primer,
    ...(sys.joining ? { joining: sys.joining } : {}),
    ...(sys.vowelSigns ? { vowelSigns: sys.vowelSigns } : {}),
    ...(sys.blocks ? { blocks: sys.blocks } : {}),
    ...(sys.confusables ? { confusables: sys.confusables } : {}),
  };

  if (!errors.length) writeFileSync(path, JSON.stringify(pack, null, 2) + "\n");
}

if (errors.length) {
  console.error("\n  REFUSED TO WRITE — fix these first:\n");
  for (const e of errors) console.error("   ✗ " + e);
  console.error("");
  process.exit(1);
}

console.log("");
for (const [code, sys] of Object.entries(SCRIPT_SYSTEMS)) {
  const bits = [
    "primer",
    sys.joining && `joining(${sys.joining.nonConnectors.length} non-connectors)`,
    sys.vowelSigns && `vowels(${sys.vowelSigns.signs.length})`,
    sys.blocks && `blocks(${sys.blocks.patterns.length})`,
    sys.confusables && `confusables(${sys.confusables.length})`,
  ].filter(Boolean);
  console.log(`  [ok] ${code.padEnd(4)} ${bits.join(" · ")}`);
}
if (notes.length) {
  console.log("");
  for (const n of notes) console.log("   ! " + n);
}
console.log(`\n  ${Object.keys(SCRIPT_SYSTEMS).length} script systems written\n`);
