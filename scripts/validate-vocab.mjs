#!/usr/bin/env node
/**
 * validate-vocab.mjs — check every language file for the mistakes that actually
 * happen when content is added in bulk.
 *
 *   npm run validate-vocab            # all languages
 *   npm run validate-vocab -- ur pa   # just these
 *
 * Run it before every push. It exits non-zero on errors, so it can also sit in
 * CI later. This is content QA, not code QA — the render tests cover the app,
 * this covers the words.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REGIONS } from "../src/data/personas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANG_DIR = path.resolve(__dirname, "..", "src", "data", "languages");

const SCRIPTS = {
  ur: { name: "Urdu (Arabic script)", re: /[\u0600-\u06FF\u0750-\u077F]/ },
  pa: { name: "Punjabi (Shahmukhi)", re: /[\u0600-\u06FF\u0750-\u077F]/ },
  ar: { name: "Arabic", re: /[\u0600-\u06FF\u0750-\u077F]/ },
  hi: { name: "Hindi (Devanagari)", re: /[\u0900-\u097F]/ },
  bn: { name: "Bengali", re: /[\u0980-\u09FF]/ },
  ja: { name: "Japanese", re: /[\u3040-\u30FF\u4E00-\u9FFF]/ },
  ko: { name: "Korean (Hangul)", re: /[\uAC00-\uD7AF\u1100-\u11FF]/ },
  zh: { name: "Chinese", re: /[\u4E00-\u9FFF]/ },
  fa: { name: "Persian (Arabic script)", re: /[\u0600-\u06FF\u0750-\u077F]/ },
};
const LATIN = new Set(["es", "fr", "id", "pcm", "tr", "de", "tl"]);

function checkLanguage(code) {
  const file = path.join(LANG_DIR, `${code}.json`);
  const d = JSON.parse(fs.readFileSync(file, "utf8"));
  const errors = [], warnings = [];
  const script = SCRIPTS[code];
  const unitIds = new Set((d.units || []).map((u) => u.id));
  const ids = new Set(), lemmas = new Map();

  for (const w of d.vocab || []) {
    const at = w.id || w.lemma || "(unknown)";

    if (!w.id) errors.push(`${at}: missing id`);
    else if (ids.has(w.id)) errors.push(`${w.id}: duplicate id`);
    else ids.add(w.id);

    if (!w.lemma) errors.push(`${at}: missing lemma`);
    if (!w.translation) errors.push(`${at}: missing translation`);

    // A learner who can't read the script yet relies entirely on this.
    if (!LATIN.has(code) && !w.translit) errors.push(`${at}: missing translit`);

    // Content in the wrong script fails silently in the UI — catch it here.
    if (script && w.lemma && !script.re.test(w.lemma)) {
      errors.push(`${at} ("${w.lemma}"): not in ${script.name}`);
    }

    if (!w.unit) errors.push(`${at}: missing unit`);
    else if (unitIds.size && !unitIds.has(w.unit)) {
      warnings.push(`${at}: unit "${w.unit}" not defined in units[]`);
    }

    if (w.lemma) {
      const k = w.lemma.trim().toLowerCase();
      if (lemmas.has(k)) warnings.push(`${at}: lemma "${w.lemma}" also on ${lemmas.get(k)}`);
      else lemmas.set(k, w.id);
    }

    for (const ex of w.examples || []) {
      if (!ex.native) errors.push(`${at}: example missing native text`);
      if (!ex.translation) warnings.push(`${at}: example missing translation`);
    }

    // v76 DIALECT FORMS. A wrong region id fails silently in the UI — the form
    // simply never shows — so it's checked here where it's loud.
    if (w.dialects) {
      const valid = new Set((REGIONS[code] || []).map((r) => r.id));
      for (const [regionId, form] of Object.entries(w.dialects)) {
        if (!valid.has(regionId)) {
          errors.push(`${at}: dialect "${regionId}" is not a variety of ${code} (have: ${[...valid].join(", ") || "none"})`);
        }
        if (!form?.lemma) errors.push(`${at}: dialect ${regionId} has no lemma`);
        if (!form?.translit) warnings.push(`${at}: dialect ${regionId} has no transliteration`);
        // A "dialect form" identical to the standard one teaches nothing and
        // makes the drill ask a question with two identical answers.
        if (form?.lemma && form.lemma === w.lemma) {
          errors.push(`${at}: dialect ${regionId} is identical to the standard form — drop it rather than implying a difference`);
        }
        if (script && form?.lemma && !script.re.test(form.lemma)) {
          errors.push(`${at}: dialect ${regionId} ("${form.lemma}") is not in ${script.name}`);
        }
      }
    }
  }

  // A unit with too few words produces thin, repetitive lessons.
  const perUnit = {};
  for (const w of d.vocab || []) perUnit[w.unit] = (perUnit[w.unit] || 0) + 1;
  for (const [u, n] of Object.entries(perUnit)) {
    if (n < 4) warnings.push(`unit ${u} has only ${n} word${n === 1 ? "" : "s"} — lessons will be thin`);
  }

  const dialectWords = (d.vocab || []).filter((w) => w.dialects && Object.keys(w.dialects).length).length;
  return { code, count: (d.vocab || []).length, dialectWords, errors, warnings };
}

const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const codes = (only.length ? only : fs.readdirSync(LANG_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))).sort();

let totalErrors = 0, totalWarnings = 0, totalWords = 0;
console.log("");
for (const code of codes) {
  const r = checkLanguage(code);
  totalErrors += r.errors.length;
  totalWarnings += r.warnings.length;
  totalWords += r.count;
  const mark = r.errors.length ? "x" : r.warnings.length ? "!" : "ok";
  console.log(`  [${mark}] ${code}  ${String(r.count).padStart(4)} words` +
    (r.dialectWords ? `  ${r.dialectWords} with dialects` : "") +
    (r.errors.length ? `  ${r.errors.length} error(s)` : "") +
    (r.warnings.length ? `  ${r.warnings.length} warning(s)` : ""));
  r.errors.slice(0, 10).forEach((e) => console.log(`        x ${e}`));
  if (r.errors.length > 10) console.log(`        x …and ${r.errors.length - 10} more`);
  r.warnings.slice(0, 4).forEach((w) => console.log(`        ! ${w}`));
  if (r.warnings.length > 4) console.log(`        ! …and ${r.warnings.length - 4} more`);
}
console.log(`\n  ${codes.length} languages · ${totalWords} words · ${totalErrors} errors · ${totalWarnings} warnings\n`);
process.exit(totalErrors ? 1 : 0);
