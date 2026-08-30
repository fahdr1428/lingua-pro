// =============================================================================
// test-script-exam.mjs (v99) — the Chapter 0 exam has to be a reading test.
//
// This exam decides whether a learner skips the entire script course. Get it
// wrong in either direction and the first thing the app does is fail them:
//
//   too easy   → a non-reader passes, then meets ഞാൻ in lesson one with nothing
//                to read it with, and concludes the language is the problem.
//   too hard   → someone who has read Urdu since childhood is made to sit
//                through "this is alif" before they are allowed to learn a word.
//
// Multiple choice makes the first failure the easy one to write by accident. A
// question with random distractors can be answered by elimination: pick the one
// that isn't obviously the wrong shape, the wrong length, the wrong script. So
// the properties below are about the WRONG answers as much as the right one.
//
// Papers are built for real, from the real packs, 200 times per language —
// because the paper is randomised, and a property that holds for one draw is
// not a property.
//
//   npm run test-script-exam
// =============================================================================

import { readdirSync, readFileSync } from "node:fs";
import { buildExam } from "../src/data/scriptExamPaper.js";
import { hasScriptCourse, SCRIPT_EXAM_SIZE, SCRIPT_PASS } from "../src/data/scriptCourse.js";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
};

const LATINISH = /^[ -ɏḀ-ỿ\s'’\-.()]+$/;
const DRAWS = 200;

const packs = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    const p = JSON.parse(readFileSync(`src/data/languages/${f}`, "utf8"));
    p.code = p.code || f.replace(".json", "");
    return p;
  })
  .filter(hasScriptCourse);

console.log(`\n  building ${DRAWS} papers each for ${packs.length} languages`);

// --- the paper is the right size ---------------------------------------------
{
  const short = [];
  for (const pack of packs) {
    for (let i = 0; i < DRAWS; i++) {
      const paper = buildExam(pack);
      if (paper.length !== SCRIPT_EXAM_SIZE) { short.push(`${pack.code} drew ${paper.length}`); break; }
    }
  }
  ok(`every paper is ${SCRIPT_EXAM_SIZE} questions`, short.length === 0, short.slice(0, 4).join(", "));
}

// --- every question is answerable ---------------------------------------------
{
  const bad = [];
  for (const pack of packs) {
    for (let i = 0; i < DRAWS; i++) {
      for (const q of buildExam(pack)) {
        if (q.options.length !== 4) { bad.push(`${pack.code}: ${q.options.length} options`); break; }
        if (new Set(q.options).size !== 4) { bad.push(`${pack.code}: duplicate option in [${q.options.join(" | ")}]`); break; }
        if (!q.options.includes(q.answer)) { bad.push(`${pack.code}: answer "${q.answer}" not among its options`); break; }
        if (!q.prompt) { bad.push(`${pack.code}: a question with no prompt`); break; }
      }
      if (bad.length) break;
    }
  }
  ok("four distinct options, one of them the answer", bad.length === 0, bad.slice(0, 3).join("; "));
}

// --- THE ONE THAT MATTERS: the wrong answers are in the same script -----------
//
// If the answer is in Malayalam and two distractors are in Latin letters, the
// question can be answered without reading anything.
{
  const leaks = [];
  for (const pack of packs) {
    for (let i = 0; i < DRAWS; i++) {
      for (const q of buildExam(pack)) {
        const kinds = new Set(q.options.map((o) => LATINISH.test(o)));
        if (kinds.size > 1) {
          leaks.push(`${pack.code}/${q.kind}: [${q.options.join(" | ")}]`);
          break;
        }
      }
      if (leaks.length) break;
    }
  }
  ok("no question mixes scripts in its options", leaks.length === 0, leaks.slice(0, 3).join("; "));
}

// --- the same prompt is never asked twice in one paper -------------------------
{
  const dupes = [];
  for (const pack of packs) {
    for (let i = 0; i < DRAWS; i++) {
      const paper = buildExam(pack);
      const keys = paper.map((q) => `${q.kind}|${q.show || q.prompt}`);
      if (new Set(keys).size !== keys.length) { dupes.push(pack.code); break; }
    }
  }
  ok("no paper asks the same thing twice", dupes.length === 0, dupes.slice(0, 4).join(", "));
}

// --- it is mostly a READING test, not a letter-naming test ---------------------
//
// The whole argument for this exam is that reading words is the skill and
// naming letters is not. If the paper drifts towards letters it stops testing
// what it claims to.
{
  const thin = [];
  for (const pack of packs) {
    let wordQs = 0, total = 0;
    for (let i = 0; i < DRAWS; i++) {
      for (const q of buildExam(pack)) {
        total++;
        if (q.kind === "read" || q.kind === "mean") wordQs++;
      }
    }
    const share = wordQs / total;
    if (share < 0.5) thin.push(`${pack.code} ${(share * 100).toFixed(0)}%`);
  }
  ok("at least half of every paper is reading real words", thin.length === 0, thin.join(", "));
}

// --- Chinese gets no letter questions -----------------------------------------
//
// The zh pack's "alphabet" is the pinyin initials, because Chinese has no
// alphabet. "Which letter makes the sound m?" would show four Latin letters and
// test nothing. validate-script-course.mjs flagged this the first time it ran.
{
  const zh = packs.find((p) => p.code === "zh");
  if (zh) {
    let lettery = 0;
    for (let i = 0; i < DRAWS; i++) {
      for (const q of buildExam(zh)) if (q.kind === "letter" || q.kind === "sound") lettery++;
    }
    ok("Chinese is asked to read characters, never to name letters", lettery === 0, `${lettery} letter questions`);
  }
}

// --- a reader passes it, a non-reader does not --------------------------------
//
// Simulated: a "reader" answers correctly; a "guesser" picks at random. With
// four options and a 80% bar, guessing through 12 questions should essentially
// never pass. If it can, the exam is a lottery that hands out skips.
{
  const bar = Math.ceil(SCRIPT_PASS * SCRIPT_EXAM_SIZE);
  let guessedPasses = 0;
  const TRIALS = 20000;
  for (let t = 0; t < TRIALS; t++) {
    let right = 0;
    for (let q = 0; q < SCRIPT_EXAM_SIZE; q++) if (Math.random() < 0.25) right++;
    if (right >= bar) guessedPasses++;
  }
  ok(`guessing passes fewer than 1 in 1000 times (needs ${bar}/${SCRIPT_EXAM_SIZE})`,
    guessedPasses / TRIALS < 0.001, `${guessedPasses}/${TRIALS}`);
}

console.log(`\n  ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
