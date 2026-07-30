#!/usr/bin/env node
/**
 * validate-journey.mjs — guards the journey map against the one bug that
 * silently breaks it: a stop pointing at a unit the language doesn't have.
 *
 *   npm run validate-journey
 *
 * WHY THIS EXISTS. The map gates each stop on the unit at the same index. A
 * language with 10 units and 12 stops renders two waypoints that can never be
 * reached and never be tapped — the map promises a conversation the course has
 * no path to. Nothing throws, nothing logs, it just quietly lies. That is
 * exactly the class of bug a validator should own.
 *
 * Also checks the things that make a stop useless if missing: both halves of the
 * exchange, the done/next capability sentences, and a transliteration for any
 * non-Latin script (a learner who can't read the script has nothing else).
 *
 * Exits non-zero on errors so it can gate a push or sit in CI.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JOURNEY, getChapters } from "../src/data/journey.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANG_DIR = path.resolve(__dirname, "..", "src", "data", "languages");

const LATIN = new Set(["es", "fr", "id", "pcm", "tr"]);

let totalErrors = 0;
let totalWarnings = 0;

console.log("");

for (const code of Object.keys(JOURNEY).sort()) {
  const errors = [];
  const warnings = [];

  const file = path.join(LANG_DIR, `${code}.json`);
  if (!fs.existsSync(file)) {
    errors.push(`no language pack at ${code}.json — journey has stops for a language that doesn't exist`);
    report(code, 0, errors, warnings);
    totalErrors += errors.length;
    continue;
  }

  const pack = JSON.parse(fs.readFileSync(file, "utf8"));
  const unitCount = (pack.units || []).length;
  const stops = JOURNEY[code].stops || [];

  const seenIds = new Set();
  let lastIndex = -1;

  stops.forEach((s, i) => {
    const at = s.id || `stop ${i + 1}`;

    if (!s.id) errors.push(`${at}: missing id`);
    else if (seenIds.has(s.id)) errors.push(`${at}: duplicate id`);
    else seenIds.add(s.id);

    // THE check this file exists for.
    if (typeof s.unitIndex !== "number") {
      errors.push(`${at}: missing unitIndex`);
    } else if (s.unitIndex < 0 || s.unitIndex >= unitCount) {
      errors.push(
        `${at}: unitIndex ${s.unitIndex} is out of range — ${code} has ${unitCount} units ` +
        `(valid 0-${unitCount - 1}). This waypoint can never be reached.`
      );
    } else if (s.unitIndex < lastIndex) {
      // stopsReached() counts sequentially and breaks at the first gap, so a
      // stop that goes backwards would freeze progress for everything after it.
      warnings.push(`${at}: unitIndex ${s.unitIndex} goes backwards from ${lastIndex}`);
    }
    if (typeof s.unitIndex === "number") lastIndex = Math.max(lastIndex, s.unitIndex);

    if (!s.done) errors.push(`${at}: missing "done" capability sentence`);
    if (!s.next) errors.push(`${at}: missing "next" capability sentence`);

    for (const side of ["they", "you"]) {
      const line = s[side];
      if (!line) { errors.push(`${at}: missing "${side}" half of the exchange`); continue; }
      if (!line.text) errors.push(`${at}.${side}: missing text`);
      if (!line.en) errors.push(`${at}.${side}: missing English gloss`);
      if (!LATIN.has(code) && !line.translit) {
        errors.push(`${at}.${side}: missing translit (non-Latin script — the learner has nothing to read)`);
      }
    }
  });

  // Chapter grouping should not produce an orphan chapter of one stop; it looks
  // broken on the map.
  const chapters = getChapters(code);
  const last = chapters[chapters.length - 1];
  if (chapters.length > 1 && last && last.stops.length === 1) {
    warnings.push(`final chapter has a single stop — reads as a stray waypoint on the map`);
  }

  report(code, stops.length, errors, warnings, unitCount, chapters.length);
  totalErrors += errors.length;
  totalWarnings += warnings.length;
}

function report(code, stopCount, errors, warnings, unitCount, chapterCount) {
  const mark = errors.length ? "x" : warnings.length ? "!" : "ok";
  const detail = unitCount !== undefined
    ? `${String(stopCount).padStart(2)} stops · ${chapterCount} chapters · ${unitCount} units`
    : "";
  console.log(`  [${mark}] ${code.padEnd(4)} ${detail}` +
    (errors.length ? `  ${errors.length} error(s)` : "") +
    (warnings.length ? `  ${warnings.length} warning(s)` : ""));
  errors.forEach((e) => console.log(`        x ${e}`));
  warnings.forEach((w) => console.log(`        ! ${w}`));
}

console.log(
  `\n  ${Object.keys(JOURNEY).length} journeys · ${totalErrors} errors · ${totalWarnings} warnings\n`
);
process.exit(totalErrors ? 1 : 0);
