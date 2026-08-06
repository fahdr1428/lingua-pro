#!/usr/bin/env node
/**
 * test-lessons.mjs — fuzzes the lesson generator against every language pack and
 * checks that every exercise it emits carries the fields the lesson screen will
 * read without guarding.
 *
 *   npm run test-lessons
 *
 * WHY THIS EXISTS: "sometimes the lessons are crashing." Sometimes is the hard
 * part — it means a specific combination of language, progress state and
 * exercise type, and it's not reproducible by clicking around. So this generates
 * thousands of lessons across every pack, every mode, and a spread of progress
 * states, and asserts the contract that Lesson.jsx actually relies on.
 *
 * The required-field lists below are derived from reading Lesson.jsx: every
 * place it does `exercise.item.lemma` or `exercise.options.map(...)` WITHOUT a
 * null check is a field this file makes mandatory. If a renderer stops needing
 * one, delete it here too — a stale requirement is as bad as a missing one.
 */

import { readFileSync, readdirSync } from "node:fs";
import { generateLesson, EXERCISE } from "../src/engine/generator.js";

const results = [];
function check(name, cond, detail = "") {
  results.push({ name, ok: !!cond });
  console.log(`  ${cond ? "ok  " : "FAIL"} ${name}${cond || !detail ? "" : "  → " + detail}`);
}

// What each exercise type must carry. `item` means item.lemma AND item.id must
// both be present — Lesson.jsx reads both without a guard.
const REQUIRED = {
  [EXERCISE.INTRODUCE_BATCH]: { arrays: ["items"], item: false },
  [EXERCISE.INTRODUCE]: { arrays: [], item: true },
  [EXERCISE.PICK_MEANING]: { arrays: ["options"], item: true },
  [EXERCISE.PICK_WORD]: { arrays: ["options"], item: true },
  [EXERCISE.LISTEN_PICK]: { arrays: ["options"], item: true },
  [EXERCISE.TYPE_TRANSLATION]: { arrays: [], item: true },
  [EXERCISE.TAP_WORDS]: { arrays: ["bank"], item: true },
  [EXERCISE.COMPLETE_SENTENCE]: { arrays: ["options"], item: true, strings: ["sentence"] },
  [EXERCISE.BUILD_SENTENCE]: { arrays: ["bank"], item: true },
  [EXERCISE.CONJUGATE]: { arrays: ["options"], item: false },
  [EXERCISE.CONJUGATE_TENSE]: { arrays: ["options"], item: false },
  [EXERCISE.MATCH_PAIRS]: { arrays: ["pairs"], item: false },
  [EXERCISE.ODD_ONE_OUT]: { arrays: ["options"], item: false },
  [EXERCISE.LETTER_SCRAMBLE]: { arrays: ["bank"], item: true },
  [EXERCISE.TRUE_FALSE]: { arrays: [], item: true },
  [EXERCISE.SPEAK_PROMPT]: { arrays: [], item: true },
};

const packs = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(`src/data/languages/${f}`, "utf8")));

check("every language pack loads", packs.length >= 13, String(packs.length));

/** Progress states worth fuzzing — each has broken something at some point. */
function progressStates(vocab) {
  return [
    ["brand new", {}],
    ["a few seen once", Object.fromEntries(vocab.slice(0, 5).map((v) => [v.id, { reps: 1, lapses: 0, ease: 2.5, interval: 1 }]))],
    ["half learned", Object.fromEntries(vocab.slice(0, Math.floor(vocab.length / 2)).map((v) => [v.id, { reps: 4, lapses: 1, ease: 2.4, interval: 6 }]))],
    ["everything mastered", Object.fromEntries(vocab.map((v) => [v.id, { reps: 12, lapses: 0, ease: 2.8, interval: 90 }]))],
    ["everything lapsed", Object.fromEntries(vocab.map((v) => [v.id, { reps: 3, lapses: 6, ease: 1.3, interval: 1 }]))],
  ];
}

let generated = 0;
const problems = [];

function validate(where, exercises) {
  for (const ex of exercises) {
    generated++;
    if (!ex || typeof ex !== "object") { problems.push(`${where}: emitted a non-object`); continue; }
    if (!ex.type) { problems.push(`${where}: exercise with no type`); continue; }

    // GRAMMAR_MOMENT is injected by the screen, not the generator, and has its
    // own renderer with its own guards.
    if (ex.type === "GRAMMAR_MOMENT") continue;

    const spec = REQUIRED[ex.type];
    if (!spec) { problems.push(`${where}: unknown exercise type "${ex.type}"`); continue; }

    if (spec.item) {
      if (!ex.item) problems.push(`${where}: ${ex.type} has no .item`);
      else {
        if (!ex.item.lemma) problems.push(`${where}: ${ex.type} item has no lemma (${ex.item.id})`);
        if (!ex.item.id) problems.push(`${where}: ${ex.type} item has no id`);
        if (!ex.item.translation) problems.push(`${where}: ${ex.type} item has no translation (${ex.item.id})`);
      }
    }
    for (const key of spec.arrays) {
      if (!Array.isArray(ex[key])) problems.push(`${where}: ${ex.type} has no .${key} array`);
      else if (ex[key].length === 0) problems.push(`${where}: ${ex.type} has an EMPTY .${key}`);
    }
    for (const key of spec.strings || []) {
      if (typeof ex[key] !== "string" || !ex[key]) problems.push(`${where}: ${ex.type} has no .${key}`);
    }

    // Options must be selectable: every renderer keys off a value it can compare
    // against `answer`, and an option list with no correct answer in it is an
    // unanswerable question — the learner loses a heart with no way to be right.
    if (Array.isArray(ex.options) && ex.answer !== undefined) {
      const values = ex.options.map((o) => (typeof o === "string" ? o : o?.form ?? o?.lemma ?? o?.text ?? o?.meaning));
      if (!values.includes(ex.answer)) {
        problems.push(`${where}: ${ex.type} answer "${ex.answer}" is not among its options [${values.join(" | ")}]`);
      }
      if (new Set(values).size !== values.length) {
        problems.push(`${where}: ${ex.type} has duplicate options [${values.join(" | ")}]`);
      }
    }
    if (Array.isArray(ex.pairs)) {
      if (new Set(ex.pairs.map((p) => p.meaning)).size !== ex.pairs.length) {
        problems.push(`${where}: MATCH_PAIRS has two pairs with the same meaning — one is unmatchable`);
      }
      if (ex.pairs.some((p) => !p.id || !p.lemma || !p.meaning)) {
        problems.push(`${where}: MATCH_PAIRS has an incomplete pair`);
      }
    }
  }
}

console.log("\nlesson generator · every pack, every mode, every progress state\n");

for (const pack of packs) {
  const vocab = pack.vocab || [];
  for (const [label, progress] of progressStates(vocab)) {
    // Queues of assorted shapes, including the awkward small ones.
    const queues = [
      vocab.slice(0, 1),
      vocab.slice(0, 2),
      vocab.slice(0, 4),
      vocab.slice(0, 6),
      vocab.slice(0, 15),
      vocab.slice(20, 32),
      vocab.slice(-8),
    ].filter((q) => q.length);

    for (const queue of queues) {
      for (const [modeLabel, args] of [
        ["normal", [false, false]],
        ["exam", [true, false]],
        ["chapter exam", [false, true]],
      ]) {
        // Several runs: the generator shuffles, so one pass proves little.
        for (let run = 0; run < 4; run++) {
          const where = `${pack.code}/${label}/${queue.length} words/${modeLabel}`;
          try {
            const out = generateLesson(
              queue, vocab, progress, pack.code,
              pack.conjugations || null, pack.tenses || null,
              args[0], args[1]
            );
            if (!Array.isArray(out)) { problems.push(`${where}: did not return an array`); continue; }
            if (out.length === 0) problems.push(`${where}: produced an EMPTY lesson — the screen has nothing to render`);
            validate(where, out);
          } catch (e) {
            problems.push(`${where}: THREW ${e?.message || e}`);
          }
        }
      }
    }
  }
}

const unique = [...new Set(problems)];
const dupes = unique.filter((u) => /duplicate options/.test(u));
const others = unique.filter((u) => !/duplicate options/.test(u));
check(`${generated} generated exercises all satisfy the lesson screen's contract`,
  others.length === 0, `\n      ${others.slice(0, 20).join("\n      ")}`);
check("no question offers the same answer twice",
  dupes.length === 0, `${dupes.length} cases, e.g.\n      ${dupes.slice(0, 3).join("\n      ")}`);

// =========================================================================
console.log("\nlesson generator · degenerate input must not throw\n");

const es = packs.find((p) => p.code === "es");
const degenerate = [
  ["an empty queue", () => generateLesson([], es.vocab, {}, "es")],
  ["an empty pool", () => generateLesson(es.vocab.slice(0, 4), [], {}, "es")],
  ["both empty", () => generateLesson([], [], {}, "es")],
  ["null progress", () => generateLesson(es.vocab.slice(0, 4), es.vocab, null, "es")],
  ["no language code", () => generateLesson(es.vocab.slice(0, 4), es.vocab, {})],
  ["a word with no examples", () => generateLesson(
    [{ ...es.vocab[0], examples: undefined }], es.vocab, {}, "es")],
  ["a word with no translit", () => generateLesson(
    [{ ...es.vocab[0], translit: undefined }], es.vocab, {}, "es")],
  ["a word with an empty lemma", () => generateLesson(
    [{ ...es.vocab[0], lemma: "" }], es.vocab, {}, "es")],
];
for (const [label, fn] of degenerate) {
  let ok = true, detail = "";
  try {
    const out = fn();
    if (!Array.isArray(out)) { ok = false; detail = "did not return an array"; }
  } catch (e) {
    ok = false;
    detail = `threw ${e?.message || e}`;
  }
  check(`survives ${label}`, ok, detail);
}

// =========================================================================
const failed = results.filter((r) => !r.ok);
console.log(`\n  ${results.length - failed.length} pass, ${failed.length} fail\n`);
process.exit(failed.length ? 1 : 0);
