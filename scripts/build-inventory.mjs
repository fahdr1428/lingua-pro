#!/usr/bin/env node
// =============================================================================
// build-inventory.mjs — writes docs/ZABAN_LANGUAGE_INVENTORY.md from the
// content itself: every language, what it has, what its course looks like,
// what's wrong with it, and what is still to be written.
//
//   npm run build-inventory            # write the document
//   npm run validate-inventory         # fail if it's out of date (in check)
//
// Nothing in the document is typed by hand except the fixed explanations in
// this file. Numbers come from scripts/lib/inventory.mjs, so when content
// changes, the inventory either changes with it or the check fails.
// =============================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allCodes, measure } from "./lib/inventory.mjs";
import { SCRIPTS } from "../src/data/courses.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "docs", "ZABAN_LANGUAGE_INVENTORY.md");

const rows = allCodes().map(measure).sort((a, b) => b.words - a.words || a.name.localeCompare(b.name));
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : "—");
const yes = (b) => (b ? "yes" : "—");

function objectiveCounts(course) {
  const c = { recognise: 0, recall: 0, construct: 0, understand: 0, use: 0 };
  for (const m of course.modules) for (const o of m.objectives) c[o.type]++;
  return c;
}

function remaining(r) {
  const out = [];
  if (!r.grammar) out.push("Write grammar lessons: there are none, so structures are only met inside example sentences.");
  else if (r.grammar < 6) out.push(`Write more grammar lessons (${r.grammar} today) so that every A1 structure the modules use is explained.`);
  if (!r.passages) out.push("Write graded reading passages (none today), so reading has evidence beyond single sentences.");
  if (r.withExamples < r.words) out.push(`Write example sentences for the ${r.words - r.withExamples} words that have none.`);
  if (!r.latin && r.withTranslit < r.words) out.push(`Add romanisation for ${r.words - r.withTranslit} words.`);
  const thin = r.unitTitles.filter((_, i) => r.unitSizes[i] < 12);
  if (thin.length) out.push(`Fill the thin units (under 12 words): ${thin.join(", ")}.`);
  if (r.stops && r.stopsUsingUnitWords < r.stops) {
    out.push(`Re-place or rewrite the ${r.stops - r.stopsUsingUnitWords} journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).`);
  }
  if (!r.audio) out.push("Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.");
  else out.push(`Replace synthetic audio with recordings by a speaker of the variety (${r.audio} words have a pre-generated synthetic recording).`);
  if (r.units < 9) out.push(`Add units to cover a full A1 range of topics (${r.units} today; the Urdu, Spanish and Mandarin packs have 13).`);
  if (r.conjugatedVerbs === 0 && r.profile?.features.includes("verb-agreement")) out.push("Add verb tables: verbs change with the person here, and there are none to practise from.");
  for (const n of r.profile?.contentNotes || []) out.push(`Resolve: ${n}`);
  out.push("Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).");
  return out;
}

const L = [];
L.push("# Zaban — language inventory and curriculum coverage");
L.push("");
L.push("> **Generated** by `npm run build-inventory` from the content files. Do not edit by hand:");
L.push("> `npm run validate-inventory` (part of `npm run check`) fails when this is out of date.");
L.push("");
L.push("Every number below is measured from the language packs, grammar lessons, sentence patterns,");
L.push("conversations, passages and journey in `src/data/`. The **course** columns describe the");
L.push("structured course that `src/engine/curriculum.js` builds from that content for each language");
L.push("(modules, lessons, typed objectives). Its status is **legacy-unreviewed**: built from existing");
L.push("content, not yet reviewed by a qualified speaker or teacher. Nothing here is a CEFR claim. The");
L.push("packs cover Pre-A1/A1 topics at most, and no level has been validated.");
L.push("");
L.push("## 1. What each language has");
L.push("");
L.push("| Language | Code | Script | Dir | Variety taught | Words | Units | Grammar lessons | Sentence patterns | Conversations | Reading passages | Culture notes | Verb tables | Synthetic audio | Spoken varieties |");
L.push("|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|");
for (const r of rows) {
  const sc = r.profile ? SCRIPTS[r.profile.script]?.name : "?";
  L.push(`| ${r.name} | \`${r.code}\` | ${sc} | ${r.rtl ? "RTL" : "LTR"} | ${r.profile?.variety || "?"} | ${r.words} | ${r.units} | ${r.grammar} | ${r.patterns} | ${r.conversations} | ${r.passages} | ${r.culture} | ${r.conjugatedVerbs || "—"} | ${r.audio || "—"} | ${r.varieties.length ? r.varieties.join(", ") : "—"} |`);
}
L.push("");
L.push("Synthetic audio: pre-generated text-to-speech MP3s for the first words of a pack (`public/audio`).");
L.push("Every other line is spoken by the device's own voice, where it has one for the language.");
L.push("Speaking practice uses the browser's speech recognition where available. It checks intelligibility");
L.push("against the expected text and is not a pronunciation assessment.");
L.push("");
L.push("## 2. Content quality, measured");
L.push("");
L.push("| Language | Words with an example | Examples containing the taught form | Romanisation | Pronunciation guide | Words with dialect forms | Journey stops | …using their unit's words |");
L.push("|---|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) {
  L.push(`| ${r.name} | ${pct(r.withExamples, r.words)} | ${pct(r.exampleShowsForm, r.withExamples)} | ${r.latin ? "Latin script" : pct(r.withTranslit, r.words)} | ${pct(r.withPron, r.words)} | ${r.withDialect || "—"} | ${r.stops} | ${r.stopsUsingUnitWords} |`);
}
L.push("");
L.push("*Examples containing the taught form* measures what a gap-fill can use. Inflecting languages");
L.push("legitimately miss it for verbs (Spanish *comer* → *como*). *Using their unit's words* counts the");
L.push("journey conversations whose lines contain any word of the unit the map attaches them to. A low");
L.push("number is the audit's finding: the conversations were laid out in their own order, not the units'.");
L.push("");
L.push("## 3. The structured course (curriculum coverage matrix)");
L.push("");
L.push("| Language | Modules | Lessons | Word lessons | Conversation tasks | Recognise | Recall | Construct | Grammar (understand) | Use (conversation) |");
L.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) {
  const c = objectiveCounts(r.course);
  const lessons = r.course.modules.flatMap((m) => m.lessons);
  L.push(`| ${r.name} | ${r.course.modules.length} | ${lessons.length} | ${lessons.filter((l) => l.kind === "words").length} | ${lessons.filter((l) => l.kind === "task").length} | ${c.recognise} | ${c.recall} | ${c.construct} | ${c.understand} | ${c.use} |`);
}
L.push("");
L.push("Each word lesson teaches at most 7 words in seven phases: recall, introduction, teaching, guided");
L.push("practice, application, assessment without hints or options, and per-objective feedback. Each");
L.push("conversation task teaches one journey exchange and assesses it by having the learner build or");
L.push("choose the reply. A module has a *construct* objective only when its words have example sentences");
L.push("long enough to build. It has an *understand* objective only when the language has a grammar lesson");
L.push("placed there.");
L.push("");
L.push("| Level | Status, every language |");
L.push("|---|---|");
L.push("| Pre-A1 | Script courses (Chapter 0) for the non-Latin scripts; letters and marks for Vietnamese and Yoruba |");
L.push("| A1 | Partially covered: the topics above, as generated structured lessons. **Not reviewed, not validated.** |");
L.push("| A2 – C2 | **Not built** for any language. The architecture supports them; the content doesn't exist. |");
L.push("");
L.push("## 4. Each language");
L.push("");
for (const r of rows) {
  const p = r.profile;
  L.push(`### ${r.name} (\`${r.code}\`) · ${r.nativeName}`);
  L.push("");
  if (p) {
    L.push(`- **Variety and register:** ${p.variety}; ${p.register}.`);
    L.push(`- **Writing:** ${SCRIPTS[p.script]?.name}, ${r.rtl ? "right to left" : "left to right"}.${p.romanisation ? ` Romanisation: ${p.romanisation}.` : ""}`);
    L.push(`- **Structure:** ${p.wordOrder}.`);
    L.push(`- **What learners find hard:** ${p.difficulties.join("; ")}.`);
    if (p.otherVarieties) L.push(`- **Other varieties:** ${p.otherVarieties}`);
    if (p.exams) L.push(`- **Formal exams elsewhere:** ${p.exams}.`);
  }
  L.push(`- **Units:** ${r.unitTitles.map((t, i) => `${t} (${r.unitSizes[i]})`).join(", ")}.`);
  if (r.grammarTitles.length) L.push(`- **Grammar lessons:** ${r.grammarTitles.join("; ")}.`);
  L.push(`- **Course:** ${r.course.modules.length} modules, ${r.course.lessonCount} lessons.`);
  if (r.issues.length) {
    L.push(`- **Known issues:**`);
    for (const i of r.issues) L.push(`  - ${i}`);
  }
  L.push(`- **Content still to write or fix:**`);
  for (const x of remaining(r)) L.push(`  - ${x}`);
  L.push("");
}
L.push("## 5. What every language shares");
L.push("");
L.push("- One course architecture: profile (`src/data/courses.js`) → modules → lessons → typed objectives");
L.push("  (`src/engine/curriculum.js`), and seven-phase lessons (`src/engine/guided.js`).");
L.push("- One learner model: the answer log and skill profile (`src/engine/skills.js`), used by Home, the");
L.push("  Course screen and the AI tutor (`src/ai/learnerContext.js`, `api/coach.js`).");
L.push("- The same screens, drawing each script in its own direction and typeface (`scriptFont` in");
L.push("  `src/data/registry.js`), tested in every language by `scripts/verify-course.mjs`.");
L.push("");

const text = L.join("\n") + "\n";
if (process.argv.includes("--check")) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (current !== text) {
    console.log("\n  ✗ docs/ZABAN_LANGUAGE_INVENTORY.md is out of date — run npm run build-inventory\n");
    process.exit(1);
  }
  console.log(`\n  ✓ language inventory up to date (${rows.length} languages)\n`);
} else {
  fs.writeFileSync(OUT, text);
  console.log(`  wrote ${path.relative(process.cwd(), OUT)} (${rows.length} languages)`);
}
