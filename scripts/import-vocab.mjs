#!/usr/bin/env node
/**
 * import-vocab.mjs — turn a verified word list (CSV) into the app's language JSON.
 *
 *   npm run import-vocab -- content/ur.csv            # merge into ur.json
 *   npm run import-vocab -- content/ur.csv --dry      # preview only, write nothing
 *   npm run import-vocab -- content/ur.csv --replace  # rebuild the word list wholesale
 *
 * WHAT THIS DOES AND DOESN'T DO
 * -----------------------------
 * It automates the PLUMBING (CSV -> validated JSON -> app), never the CONTENT.
 * Nothing here translates, generates, or guesses a word. Every row must already
 * have been verified by a human or a reliable source. Machine-translated
 * heritage-language vocabulary is exactly the failure this project avoids.
 *
 * MERGE SEMANTICS (the default, and the safe one)
 * ----------------------------------------------
 * Existing words keep their IDs, so live learners keep their progress — FSRS
 * cards are keyed by word ID. A row matches an existing word by `id` if given,
 * otherwise by its lemma. Matched rows update fields; unmatched rows are
 * appended with the next free ID. Nothing is ever silently deleted.
 *
 * `--replace` rebuilds the list from the CSV alone. It will drop words that
 * aren't in the file, which orphans learner progress for those words, so it
 * asks for an explicit confirmation flag.
 *
 * SAFETY
 * ------
 * - Validation runs first. Any hard error aborts before a byte is written.
 * - The existing JSON is backed up to <file>.bak on every write.
 * - --dry prints the full plan and writes nothing.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LANG_DIR = path.join(ROOT, "src", "data", "languages");

// ---------------------------------------------------------------------------
// Script ranges — a cheap but effective guard against content landing in the
// wrong script (e.g. a Punjabi row typed in Gurmukhi when the app uses
// Shahmukhi, or an Urdu row that's actually still in English).
// ---------------------------------------------------------------------------
const SCRIPTS = {
  ur: { name: "Urdu (Arabic script)", re: /[\u0600-\u06FF\u0750-\u077F]/ },
  pa: { name: "Punjabi (Shahmukhi)", re: /[\u0600-\u06FF\u0750-\u077F]/ },
  ar: { name: "Arabic", re: /[\u0600-\u06FF\u0750-\u077F]/ },
  hi: { name: "Hindi (Devanagari)", re: /[\u0900-\u097F]/ },
  bn: { name: "Bengali", re: /[\u0980-\u09FF]/ },
  ja: { name: "Japanese", re: /[\u3040-\u30FF\u4E00-\u9FFF]/ },
  ko: { name: "Korean (Hangul)", re: /[\uAC00-\uD7AF\u1100-\u11FF]/ },
  zh: { name: "Chinese", re: /[\u4E00-\u9FFF]/ },
};
// Languages written in Latin script don't need a transliteration column.
const LATIN = new Set(["es", "fr", "id", "pcm", "tr"]);

// ---------------------------------------------------------------------------
// A small dependency-free CSV parser: handles quoted fields, embedded commas,
// escaped quotes ("") and newlines inside quotes.
// ---------------------------------------------------------------------------
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}

const norm = (s) => String(s ?? "").trim();
const key = (s) => norm(s).toLowerCase();

function readCSV(file) {
  const rows = parseCSV(fs.readFileSync(file, "utf8"));
  if (rows.length < 2) throw new Error("CSV has no data rows.");
  const headers = rows[0].map((h) => key(h).replace(/\s+/g, "_"));
  return rows.slice(1).map((cells, i) => {
    const o = { __line: i + 2 };
    headers.forEach((h, j) => { o[h] = norm(cells[j]); });
    return o;
  });
}

// ---------------------------------------------------------------------------
// Validation — hard errors block the write; warnings are reported but allowed.
// ---------------------------------------------------------------------------
function validate(rows, code, existing) {
  const errors = [], warnings = [];
  const script = SCRIPTS[code];
  const unitIds = new Set((existing.units || []).map((u) => u.id));
  const seenLemma = new Map();
  const seenId = new Map();

  rows.forEach((r) => {
    const at = `row ${r.__line}`;
    if (!r.lemma) { errors.push(`${at}: missing lemma`); return; }
    if (!r.translation) errors.push(`${at} ("${r.lemma}"): missing translation`);

    // Transliteration is how a heritage learner who can't read the script yet
    // actually says the word — non-negotiable for non-Latin languages.
    if (!LATIN.has(code) && !r.translit) {
      errors.push(`${at} ("${r.lemma}"): missing translit (required for ${code})`);
    }

    // Right word, wrong script is a silent, nasty failure.
    if (script && !script.re.test(r.lemma)) {
      errors.push(`${at} ("${r.lemma}"): not in ${script.name} — wrong script or still in English?`);
    }

    if (!r.unit) errors.push(`${at} ("${r.lemma}"): missing unit`);
    else {
      const u = /^u\d+$/i.test(r.unit) ? r.unit.toLowerCase() : `u${String(r.unit).replace(/\D/g, "")}`;
      r.unit = u;
      if (!unitIds.has(u)) warnings.push(`${at} ("${r.lemma}"): unit ${u} isn't defined in ${code}.json units`);
    }

    const lk = key(r.lemma);
    if (seenLemma.has(lk)) errors.push(`${at}: duplicate lemma "${r.lemma}" (also row ${seenLemma.get(lk)})`);
    else seenLemma.set(lk, r.__line);

    if (r.id) {
      if (seenId.has(r.id)) errors.push(`${at}: duplicate id ${r.id} (also row ${seenId.get(r.id)})`);
      else seenId.set(r.id, r.__line);
      if (!existing.vocab.some((w) => w.id === r.id)) {
        errors.push(`${at}: id ${r.id} doesn't exist in ${code}.json — leave the id blank to add a new word`);
      }
    }

    if (r.example_native && !r.example_translation) {
      warnings.push(`${at} ("${r.lemma}"): example has no translation`);
    }
  });

  return { errors, warnings };
}

// ---------------------------------------------------------------------------
function nextIdMaker(code, vocab) {
  let max = 0;
  for (const w of vocab) {
    const m = /_(\d+)$/.exec(w.id || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return () => `${code}_${String(++max).padStart(4, "0")}`;
}

function rowToWord(r, id, prev) {
  const w = { ...(prev || {}) };
  w.id = id;
  w.unit = r.unit || w.unit;
  w.lemma = r.lemma;
  if (r.translit) w.translit = r.translit;
  w.translation = r.translation || w.translation;
  if (r.category) w.category = r.category;
  if (r.pronunciation) w.pronunciation = r.pronunciation;
  w.difficulty = r.difficulty ? Number(r.difficulty) : (w.difficulty ?? 1);
  if (r.frequency_rank) w.frequencyRank = Number(r.frequency_rank);
  if (r.example_native) {
    w.examples = [{ native: r.example_native, translation: r.example_translation || "" }];
  }
  return w;
}

// ---------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const dry = args.includes("--dry");
  const replace = args.includes("--replace");
  const confirmed = args.includes("--i-know-this-drops-words");

  if (!file) {
    console.error("Usage: npm run import-vocab -- <file.csv> [--dry] [--replace]");
    process.exit(1);
  }
  if (!fs.existsSync(file)) { console.error(`No such file: ${file}`); process.exit(1); }

  const code = path.basename(file).split(".")[0].toLowerCase();
  const target = path.join(LANG_DIR, `${code}.json`);
  if (!fs.existsSync(target)) {
    console.error(`No language file for "${code}" (expected ${target}).`);
    console.error(`Name the CSV after the language code, e.g. ur.csv`);
    process.exit(1);
  }

  const existing = JSON.parse(fs.readFileSync(target, "utf8"));
  const rows = readCSV(file);

  console.log(`\n  ${code}.json — ${existing.vocab.length} words currently`);
  console.log(`  ${path.basename(file)} — ${rows.length} rows read\n`);

  const { errors, warnings } = validate(rows, code, existing);
  if (warnings.length) {
    console.log("  Warnings:");
    warnings.forEach((w) => console.log(`    ! ${w}`));
    console.log("");
  }
  if (errors.length) {
    console.log("  Errors — nothing was written:");
    errors.forEach((e) => console.log(`    x ${e}`));
    console.log(`\n  ${errors.length} error${errors.length === 1 ? "" : "s"} to fix.\n`);
    process.exit(1);
  }

  if (replace && !confirmed) {
    const dropped = existing.vocab.length;
    console.log(`  --replace would rebuild the list from the CSV alone.`);
    console.log(`  Any of the ${dropped} existing words missing from the CSV would be dropped,`);
    console.log(`  and learners' progress on those words orphaned.`);
    console.log(`  Re-run with --i-know-this-drops-words if that's really what you want.\n`);
    process.exit(1);
  }

  const byId = new Map(existing.vocab.map((w) => [w.id, w]));
  const byLemma = new Map(existing.vocab.map((w) => [key(w.lemma), w]));
  const nextId = nextIdMaker(code, existing.vocab);

  const added = [], updated = [];
  const result = replace ? [] : [...existing.vocab];
  const indexOfId = new Map(result.map((w, i) => [w.id, i]));

  for (const r of rows) {
    const prev = r.id ? byId.get(r.id) : byLemma.get(key(r.lemma));
    if (prev && !replace) {
      const merged = rowToWord(r, prev.id, prev);
      const changed = JSON.stringify(merged) !== JSON.stringify(prev);
      result[indexOfId.get(prev.id)] = merged;
      if (changed) updated.push(merged);
    } else if (prev && replace) {
      result.push(rowToWord(r, prev.id, prev)); // keep the ID so progress survives
      updated.push(r.lemma);
    } else {
      const w = rowToWord(r, nextId(), null);
      result.push(w);
      added.push(w);
    }
  }

  const removed = replace
    ? existing.vocab.filter((w) => !result.some((n) => n.id === w.id))
    : [];

  console.log(`  Plan: +${added.length} new · ~${updated.length} updated · -${removed.length} removed`);
  added.slice(0, 8).forEach((w) => console.log(`    + ${w.id}  ${w.lemma}  (${w.translation})`));
  if (added.length > 8) console.log(`    + …and ${added.length - 8} more`);
  removed.slice(0, 8).forEach((w) => console.log(`    - ${w.id}  ${w.lemma}`));

  if (dry) { console.log(`\n  --dry: nothing written.\n`); return; }

  fs.copyFileSync(target, `${target}.bak`);
  const out = { ...existing, vocab: result };
  fs.writeFileSync(target, JSON.stringify(out, null, 2) + "\n", "utf8");

  console.log(`\n  Written: ${path.relative(ROOT, target)} (${result.length} words)`);
  console.log(`  Backup:  ${path.relative(ROOT, target)}.bak`);
  console.log(`  Next: npm run validate-vocab && npx vite build\n`);
}

main();
