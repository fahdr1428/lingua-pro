#!/usr/bin/env node
/**
 * test-generator.mjs — does the lesson generator behave?
 *
 *   npm run test-generator
 *
 * Focused on the v70 speaking exercise, whose rules matter: never ask someone to
 * pronounce a word they've never seen, exactly one per lesson, always last (after
 * the word has been recognised and recalled in the same session), and never
 * inside an exam — exams grade by string, this grades by ear.
 */
// Does the generator actually emit the v70 speaking exercise, and only for words
// the learner has already met?
import fs from "node:fs";
import { generateLesson, EXERCISE } from "../src/engine/generator.js";

const pack = JSON.parse(fs.readFileSync(new URL("../src/data/languages/ur.json", import.meta.url), "utf8"));
const pool = pack.vocab;

function run(label, progress, queue) {
  const ex = generateLesson(queue, pool, progress, "ur", null, null, false, false);
  const speak = ex.filter((e) => e.type === EXERCISE.SPEAK_PROMPT);
  console.log(
    `  ${label.padEnd(34)} exercises=${String(ex.length).padStart(3)}  speak=${speak.length}` +
    (speak.length ? `  word="${speak[0].item.translit}" reps=${progress[speak[0].item.id]?.reps ?? 0}` : "")
  );
  return { ex, speak };
}

console.log("\ngenerator · SPEAK_PROMPT\n");

// all-new words: nothing should be speakable (reps 0)
const brandNew = run("all words brand new", {}, pool.slice(0, 6));
if (brandNew.speak.length !== 0) { console.log("  FAIL: asked a learner to pronounce a word they've never seen"); process.exit(1); }

// seen words: exactly one speak exercise, and it must be a seen word
const seen = {};
for (const v of pool.slice(0, 6)) seen[v.id] = { reps: 3, lapses: 0, stability: 6, difficulty: 5, due: Date.now(), lastReview: Date.now() };
const withSeen = run("words already met (reps 3)", seen, pool.slice(0, 6));
if (withSeen.speak.length !== 1) { console.log("  FAIL: expected exactly 1 speak exercise, got " + withSeen.speak.length); process.exit(1); }
if ((seen[withSeen.speak[0].item.id]?.reps || 0) < 1) { console.log("  FAIL: speak exercise picked an unseen word"); process.exit(1); }
if (withSeen.speak[0].answer !== withSeen.speak[0].item.lemma) { console.log("  FAIL: answer must be the lemma so SRS grading works"); process.exit(1); }

// it must be LAST — speaking comes after recognition and recall in the session
const last = withSeen.ex[withSeen.ex.length - 1];
if (last.type !== EXERCISE.SPEAK_PROMPT) { console.log("  FAIL: speak exercise is not last, it's " + last.type); process.exit(1); }

// exam modes must NOT include it (exams grade by string, not by ear)
const exam = generateLesson(pool.slice(0, 6), pool, seen, "ur", null, null, true, false);
const chapterExam = generateLesson(pool.slice(0, 6), pool, seen, "ur", null, null, false, true);
console.log(`  ${"exam mode".padEnd(34)} exercises=${String(exam.length).padStart(3)}  speak=${exam.filter(e=>e.type===EXERCISE.SPEAK_PROMPT).length}`);
console.log(`  ${"chapter exam".padEnd(34)} exercises=${String(chapterExam.length).padStart(3)}  speak=${chapterExam.filter(e=>e.type===EXERCISE.SPEAK_PROMPT).length}`);
if (exam.some(e=>e.type===EXERCISE.SPEAK_PROMPT) || chapterExam.some(e=>e.type===EXERCISE.SPEAK_PROMPT)) {
  console.log("  FAIL: speaking leaked into an exam"); process.exit(1);
}

console.log("\n  all generator checks passed\n");
