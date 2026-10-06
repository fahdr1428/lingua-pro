// =============================================================================
// test-reachability.mjs (v112) — every word a pack has, a learner can reach.
//
// Adding words is only worth something if lessons actually teach them. A word
// can sit in a pack forever unreached: filed under a unit id the pack doesn't
// define, filtered out by a selector rule, or ranked behind something that
// never runs out. Nothing checked this; the validators look at the words,
// not at whether the course ever gets to them.
//
// So: for every language, a simulated learner does ordinary lessons ("smart",
// the mode Continue uses), marking every word each lesson introduces or asks
// as learned, until a lesson brings nothing new. Then:
//
//   · every word in the pack (except saved-from-chat ones, which never enter
//     the course by design) must have been reached
//   · and in a sensible number of lessons — no language should need more
//     than one lesson per three words to get through its course
//   · each unit's own lesson (the route map's stops) reaches every word in it
//
// PROVEN CAPABLE OF FAILING: with one Spanish word filed under "u99" it
// reports "1 words are filed under units the pack doesn't define"; with the
// smart selector silently dropping the Food category it reports, in all 21
// languages, the food words no lesson reaches ("ar: 15 of 278 words…").
//
//   npm run test-reachability
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { Engine } from "../src/engine/Engine.js";

const problems = [];
let checks = 0;
const check = (ok, msg) => { checks++; if (!ok) problems.push(msg); };

function memStorage() {
  const mem = new Map();
  return {
    async get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; },
    async set(k, v) { mem.set(k, JSON.stringify(v)); },
    async remove(k) { mem.delete(k); },
    async update(k, fn) { const v = fn(await this.get(k)); await this.set(k, v); return v; },
    async keys() { return [...mem.keys()]; },
    async clear() { mem.clear(); },
  };
}

// Everything a session shows the learner as a word to learn.
function wordsIn(session) {
  const ids = new Set();
  for (const ex of session.exercises || []) {
    if (ex.type === "introduce_batch") for (const it of ex.items || []) ids.add(it.id);
    if (ex.item?.id) ids.add(ex.item.id);
  }
  return ids;
}

const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const lessonsNeeded = {};

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const course = pack.vocab.filter((v) => !v.custom);
  const e = new Engine(memStorage());
  e.pack = pack;
  e.languageCode = code;
  const reached = new Set();
  const now = Date.now();
  let lessons = 0, stale = 0;
  while (reached.size < course.length && lessons < course.length) {
    const s = await e.generateSession({ mode: "smart", sessionSize: 8, newPerSession: 4 });
    lessons++;
    const before = reached.size;
    const progress = await e.getProgress();
    for (const id of wordsIn(s)) {
      reached.add(id);
      // Learned and comfortably remembered, so the next lesson moves on.
      if (!progress[id]) progress[id] = { difficulty: 4, stability: 365, reps: 2, lapses: 0, lastReview: now, lastRating: 3 };
    }
    await e.storage.set("progress", { [code]: progress });
    stale = reached.size === before ? stale + 1 : 0;
    if (stale >= 3) break;
  }
  lessonsNeeded[code] = lessons;
  const missed = course.filter((v) => !reached.has(v.id));
  check(missed.length === 0, `${code}: ${missed.length} of ${course.length} words are never reached by ordinary lessons — e.g. ${missed.slice(0, 4).map((v) => `${v.id} "${v.translation}" (${v.unit})`).join(", ")}`);
  check(lessons <= Math.ceil(course.length / 3), `${code}: needed ${lessons} lessons for ${course.length} words — the course crawls`);

  // Every word is filed under a unit the pack defines — otherwise no stop on
  // the route map ever teaches it.
  const unitIds = new Set((pack.units || []).map((u) => u.id));
  const orphans = course.filter((v) => !unitIds.has(v.unit));
  check(orphans.length === 0, `${code}: ${orphans.length} words are filed under units the pack doesn't define — e.g. ${orphans.slice(0, 3).map((v) => `${v.id} (${v.unit})`).join(", ")}`);

  // Each unit's own lesson reaches every word in that unit.
  for (const u of pack.units || []) {
    const unitWords = course.filter((v) => v.unit === u.id);
    if (!unitWords.length) continue;
    const ue = new Engine(memStorage());
    ue.pack = pack;
    ue.languageCode = code;
    const got = new Set();
    for (let i = 0; i < unitWords.length + 3 && got.size < unitWords.length; i++) {
      const s = await ue.generateSession({ mode: "unit", filter: { unit: u.id }, sessionSize: 8, newPerSession: 4 });
      const progress = await ue.getProgress();
      for (const id of wordsIn(s)) {
        if (unitWords.some((w) => w.id === id)) got.add(id);
        if (!progress[id]) progress[id] = { difficulty: 4, stability: 365, reps: 2, lapses: 0, lastReview: now, lastRating: 3 };
      }
      await ue.storage.set("progress", { [code]: progress });
    }
    const uMissed = unitWords.filter((w) => !got.has(w.id));
    check(uMissed.length === 0, `${code} ${u.id} "${u.title}": its lessons never reach ${uMissed.length} of its ${unitWords.length} words — e.g. ${uMissed.slice(0, 3).map((v) => v.translation).join(", ")}`);
  }
}

console.log(`\n  reachability: ${checks} checks across ${codes.length} languages`);
console.log("  lessons to reach every word: " + codes.map((c) => `${c} ${lessonsNeeded[c]}`).join(" · "));
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems.slice(0, 25)) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ every word in every pack is reached, by the course and by its own unit\n");
