// =============================================================================
// test-speaking.mjs (v110) — the speaking ladder does what speaking.js promises.
//
//   · levels unlock at 0 / 3 / 12 / 30 good attempts
//   · ECHO: only for a word this lesson introduces, straight after the intro
//   · SHADOW / SENTENCE: only on words already met (reps ≥ 1 / ≥ 2), with a
//     sentence from that word's own examples, before the closing RECALL
//   · which rungs appear depends on the level: 1 none of the sentence tasks,
//     2 shadow, 3 build (shadow if nothing's ready), 4 both
//   · no word is spoken twice in one lesson; RECALL stays last
//   · nothing in exams, nothing when speaking is switched off
//   · practice rungs never move a word's schedule
//   · every pack has sentences to speak for most of its words
//
// Run across every lesson the engine builds for all 21 languages at every level.
//
// PROVEN CAPABLE OF FAILING: with the reps gate removed (56 problems, e.g.
// "sentence on ar_0001 with reps 1"), with echo placed at the end (506),
// with the level rules ignored (189, "sentence tasks before level 2"), and
// with practice answers sent to the scheduler (a missed shadowing attempt
// lapsed the card).
//
//   npm run test-speaking
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { speakingLevel, speakableSentence, weaveSpeaking, SPEAK_MODE } from "../src/engine/speaking.js";
import { Engine } from "../src/engine/Engine.js";
import { EXERCISE } from "../src/engine/generator.js";

const problems = [];
let checks = 0;
const check = (ok, msg) => { checks++; if (!ok) problems.push(msg); };

let seed = 7;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

// ---- levels ---------------------------------------------------------------
const lv = [0, 2, 3, 11, 12, 29, 30, 500].map((n) => speakingLevel(n).level).join(",");
check(lv === "1,1,2,2,3,3,4,4", `levels by passes 0,2,3,11,12,29,30,500: ${lv}`);
check(speakingLevel(0).toNext === 3 && speakingLevel(30).next === null, "distance to the next level");

// ---- an engine with in-memory storage ---------------------------------------
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

const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const DAY = 86400000;
let lessons = 0;
const seenModes = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));

  // Coverage: most words have a sentence worth saying.
  const cov = pack.vocab.filter((w) => speakableSentence(w)).length / pack.vocab.length;
  check(cov >= 0.7, `${code}: only ${Math.round(cov * 100)}% of words have a sentence to speak`);

  for (const passes of [0, 3, 12, 30]) {
    const level = speakingLevel(passes).level;
    // A learner part-way in: the first 30 words met, some well.
    const e = new Engine(memStorage());
    e.pack = pack; e.languageCode = code;
    const now = Date.now();
    const progress = {};
    pack.vocab.slice(0, 30).forEach((v, i) => {
      progress[v.id] = { difficulty: 5, stability: 3, reps: 1 + (i % 4), lapses: 0, lastReview: now - 4 * DAY, nextReview: now - DAY, lastRating: 3 };
    });
    await e.storage.set("progress", { [code]: progress });

    for (let round = 0; round < 3; round++) {
      const s = await e.generateSession({ mode: "smart", sessionSize: 6, newPerSession: 3, speakingPasses: passes });
      lessons++;
      const ex = s.exercises;
      const speaks = ex.filter((x) => x.type === EXERCISE.SPEAK_PROMPT);
      const at = `${code} L${level}`;
      const ids = speaks.map((x) => x.item.id);
      check(new Set(ids).size === ids.length, `${at}: a word is spoken twice in one lesson (${ids.join(",")})`);

      const recallIdx = ex.findIndex((x) => x.type === EXERCISE.SPEAK_PROMPT && !x.mode);
      if (recallIdx >= 0) check(recallIdx === ex.length - 1, `${at}: RECALL isn't last`);

      for (const x of speaks) {
        const mode = x.mode || SPEAK_MODE.RECALL;
        seenModes[level].add(mode);
        const reps = progress[x.item.id]?.reps || 0;
        if (mode === SPEAK_MODE.ECHO) {
          const i = ex.indexOf(x);
          const prev = ex[i - 1];
          const introduced = prev && (prev.type === EXERCISE.INTRODUCE_BATCH ? (prev.items || []).some((it) => it.id === x.item.id) : prev.type === EXERCISE.INTRODUCE && prev.item?.id === x.item.id);
          check(introduced, `${at}: ECHO of ${x.item.id} isn't straight after that word's introduction`);
          check(x.practice === true, `${at}: ECHO must be practice`);
        }
        if (mode === SPEAK_MODE.SHADOW || mode === SPEAK_MODE.SENTENCE) {
          const need = mode === SPEAK_MODE.SHADOW ? 1 : 2;
          check(reps >= need, `${at}: ${mode} on ${x.item.id} with reps ${reps} (needs ${need})`);
          check(x.practice === true, `${at}: ${mode} must be practice`);
          check(x.sentence && (x.item.examples || []).some((e2) => e2.native === x.sentence.native), `${at}: ${mode} sentence isn't one of the word's own examples`);
          check(x.sentence?.translation, `${at}: ${mode} sentence has no translation`);
          const i = ex.indexOf(x);
          check(ex.slice(i + 1).every((y) => y.type === EXERCISE.SPEAK_PROMPT), `${at}: ${mode} isn't in the closing speaking run`);
        }
      }
      const has = (m) => speaks.some((x) => x.mode === m);
      if (level === 1) check(!has(SPEAK_MODE.SHADOW) && !has(SPEAK_MODE.SENTENCE), `${at}: sentence tasks before level 2`);
      if (level === 2) check(!has(SPEAK_MODE.SENTENCE), `${at}: building sentences before level 3`);
      if (level === 3) check(!(has(SPEAK_MODE.SHADOW) && has(SPEAK_MODE.SENTENCE)), `${at}: both sentence tasks before level 4`);
    }

    // Exams and the off switch.
    const exam = await e.generateSession({ mode: "exam", sessionSize: 6, speakingPasses: passes, filter: { vocabIds: pack.vocab.slice(0, 6).map((v) => v.id) } });
    check(!exam.exercises.some((x) => x.type === EXERCISE.SPEAK_PROMPT), `${code} L${level}: speaking in an exam`);
    const off = await e.generateSession({ mode: "smart", sessionSize: 6, speakingPasses: passes, disabledExercises: [EXERCISE.SPEAK_PROMPT] });
    check(!off.exercises.some((x) => x.type === EXERCISE.SPEAK_PROMPT), `${code} L${level}: speaking switched off but still asked`);
  }
}

// Across all languages each level actually shows its rungs.
check(seenModes[1].has(SPEAK_MODE.ECHO) && seenModes[1].has(SPEAK_MODE.RECALL), `level 1 shows echo and recall: ${[...seenModes[1]]}`);
check(seenModes[2].has(SPEAK_MODE.SHADOW), `level 2 shows shadowing: ${[...seenModes[2]]}`);
check(seenModes[3].has(SPEAK_MODE.SENTENCE), `level 3 shows building sentences: ${[...seenModes[3]]}`);
check(seenModes[4].has(SPEAK_MODE.SHADOW) && seenModes[4].has(SPEAK_MODE.SENTENCE), `level 4 shows both: ${[...seenModes[4]]}`);

// ---- weave rules on a hand-built lesson ------------------------------------
{
  const w = (id, reps, ex = "one two three four") => ({ id, lemma: id, translation: `t-${id}`, examples: [{ native: ex, translation: "a sentence" }], reps });
  const words = [w("a", 0), w("b", 0), w("c", 3), w("d", 3), w("e", 1)];
  const progress = Object.fromEntries(words.filter((x) => x.reps).map((x) => [x.id, { reps: x.reps }]));
  const base = [
    { type: "introduce_batch", items: [words[0], words[1]] },
    { type: "pick_meaning", item: words[2] },
    { type: "pick_meaning", item: words[3] },
    { type: "speak_prompt", item: words[2], answer: "c" },
  ];
  const woven = weaveSpeaking(base, { queue: words, progress, passes: 30, rand });
  check(woven[1].mode === SPEAK_MODE.ECHO && ["a", "b"].includes(woven[1].item.id), "echo sits right after the intro, on a new word");
  check(!woven.some((x) => x.mode && x.item.id === "c"), "the recall word isn't reused");
  check(woven[woven.length - 1] === base[3], "the generator's recall stays last");
  check(weaveSpeaking(base, { queue: words, progress, passes: 30, examMode: true }).length === base.length, "exam mode adds nothing");
  check(weaveSpeaking(base, { queue: words, progress, passes: 30, allowed: false }).length === base.length, "switched off adds nothing");
  const noIntro = weaveSpeaking(base.slice(1), { queue: words, progress, passes: 0, rand });
  check(!noIntro.some((x) => x.mode === SPEAK_MODE.ECHO), "no echo without an introduction");
}

// ---- practice never moves the schedule --------------------------------------
{
  const pack = JSON.parse(readFileSync("src/data/languages/es.json", "utf8"));
  const e = new Engine(memStorage());
  e.pack = pack; e.languageCode = "es";
  const item = pack.vocab[3];
  const card = { difficulty: 5, stability: 3, reps: 2, lapses: 0, lastReview: Date.now() - 3 * DAY, nextReview: Date.now() + DAY, lastRating: 3 };
  await e.storage.set("progress", { es: { [item.id]: card } });
  await e.submitAnswer({ type: EXERCISE.SPEAK_PROMPT, mode: SPEAK_MODE.SHADOW, practice: true, item, answer: item.lemma }, "\u0000speak-miss");
  const after = (await e.getProgress())[item.id];
  check(JSON.stringify(after) === JSON.stringify(card), `a missed shadowing attempt changed the card: ${JSON.stringify(after)}`);
}

console.log(`\n  speaking ladder: ${checks} checks · ${lessons} lessons across ${codes.length} languages at 4 levels`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems.slice(0, 25)) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ echo after new words, sentences only on known words, harder as you get stronger, never in exams\n");
