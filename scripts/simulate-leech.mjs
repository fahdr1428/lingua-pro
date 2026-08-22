// =============================================================================
// simulate-leech.mjs (v82) — what happens to the words someone can't learn?
//
// simulate-learner.mjs answers 85% of questions correctly at random. That is
// useful for measuring intake, and useless for measuring this, because a
// uniformly-random learner has no hard words: every item drifts to the same
// place and nothing ever gets stuck.
//
// Real learners are not like that. Some words are opaque to them — no cognate,
// an unfamiliar shape, a sound they can't yet hear the difference in — and those
// words fail far more often than the rest. In spaced repetition they are called
// LEECHES, and they are the reason people quit. The loop is:
//
//   fail → stability collapses → due again tomorrow → asked again → fail
//
// and because this app chooses the exercise type from `reps`, which only ever
// goes UP, a word you have failed six times is treated as a word you know well
// and gets the HARDEST question in the set. The app's answer to "I can't do
// this" was to ask something harder. That is the thing being measured here.
//
// THE ANSWER MODEL. Probability of a correct answer depends on three things,
// which is roughly what the evidence says:
//
//   * retrievability — how fresh the memory is (from FSRS)
//   * the word's intrinsic difficulty FOR THIS LEARNER — fixed per word
//   * what is being asked — recognising a word is far easier than producing it,
//     and that gap widens the weaker the memory is
//
// The third is the point. A learner who cannot type a word from cold can very
// often pick it out of four, or complete a sentence that carries it. Those are
// not consolation prizes: a successful retrieval is what builds stability, and
// an easy successful retrieval builds more of it than a hard failed one.
//
//   node scripts/simulate-leech.mjs
//
// Not part of `npm run check` — slow, stochastic, and its output is a judgement
// call. Run it when changing how exercises are chosen.
// =============================================================================

import { readFileSync } from "node:fs";
import { Engine } from "../src/engine/Engine.js";
import { retrievability } from "../src/engine/srs.js";

const DAYS = Number(process.env.DAYS || 90);
const SIZE = Number(process.env.SIZE || 8);
const SEED = Number(process.env.SEED || 20250822);
// WHY MORE THAN ONE RUN. The lesson generator makes twenty-nine Math.random()
// calls — which exercise type, which distractors, which of several equally good
// branches. A single run of this therefore measures luck at least as much as it
// measures the algorithm: two runs of IDENTICAL code differed by eight words on
// the headline number, which is larger than most of the changes worth making.
// So it runs several independent learners and reports the mean.
const TRIALS = Number(process.env.TRIALS || 6);

// Seeded PRNG, and Math.random is pointed at it too, so a trial is reproducible
// end to end rather than only in the parts this file controls.
function prng(s) {
  let seed = s >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// What each exercise actually demands of the learner. Recognition is a
// four-way choice with the answer somewhere on screen; production is cold
// recall with nothing to lean on.
const DEMAND = {
  pick_meaning: 0.0, true_false: 0.0, listen_pick: 0.1, match_pairs: 0.05,
  odd_one_out: 0.1, pick_word: 0.15,
  complete_sentence: 0.25, tap_words: 0.3,
  letter_scramble: 0.45, build_sentence: 0.5, type_translation: 0.55,
  conjugate: 0.4, conjugate_tense: 0.5, speak_prompt: 0.35,
};

const PACK = JSON.parse(readFileSync("src/data/languages/ur.json", "utf8"));

async function runTrial(seedValue) {
  const rand = prng(seedValue);
  const realRandom = Math.random;
  Math.random = rand;                     // the generator's coin flips too

  const mem = new Map();
  const storage = {
    async get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; },
    async set(k, v) { mem.set(k, JSON.stringify(v)); },
    async remove(k) { mem.delete(k); },
    async update(k, fn) { const v = fn(await this.get(k)); await this.set(k, v); return v; },
    async keys() { return [...mem.keys()]; },
    async clear() { mem.clear(); },
  };

  const e = new Engine(storage);
  e.pack = PACK;
  e.languageCode = "ur";

  // How hard each word is for THIS learner, fixed for the whole run — that is
  // what makes a leech a leech rather than a run of bad luck. Most words are
  // ordinary; about one in eight lands above 0.6 and fights back. Skewed rather
  // than uniform because that is the shape of it: you don't find half a
  // language impossible, you find a handful of it impossible.
  const hardness = new Map();
  const hardnessOf = (id) => {
    if (!hardness.has(id)) hardness.set(id, Math.min(1, Math.pow(rand(), 4) * 1.05));
    return hardness.get(id);
  };

  function willAnswerCorrectly(ex, card) {
    const d = hardnessOf(ex.item.id);
    const demand = DEMAND[ex.type] ?? 0.3;
    const r = card ? retrievability(card, Date.now()) : 0.35;

    // How much of the word they can actually summon right now. A fresh memory
    // carries you a long way; a faded one leaves you exposed to exactly how
    // much the question is asking for, which is why demand is scaled by r.
    const skill = 1.35 - 0.95 * d - demand * (1.0 - 0.5 * r) - 0.35 * (1 - r);

    // Four options give you a floor even knowing nothing. Typing it cold gives
    // you none. This is the whole reason exercise choice matters for a word
    // someone is losing: recognising a hard, half-faded word is winnable at
    // about half, and typing the same word is a near-certain failure.
    const floor = demand <= 0.15 ? 0.25 : demand <= 0.3 ? 0.1 : 0.02;
    return rand() < floor + (1 - floor) * Math.max(0, Math.min(1, skill));
  }

  const realDate = Date.now;
  const asked = new Map();
  const perLesson = [];
  let answered = 0, correct = 0;

  for (let day = 0; day < DAYS; day++) {
    Date.now = () => realDate() + day * 24 * 3600 * 1000;
    const s = await e.generateSession({ mode: "smart", sessionSize: SIZE });
    const progress = await e.getProgress();
    const testable = s.exercises.filter((x) => x.item && !x.type.startsWith("introduce"));
    perLesson.push(testable.length);
    for (const ex of testable) {
      const right = willAnswerCorrectly(ex, progress[ex.item.id]);
      answered++; if (right) correct++;
      if (!asked.has(ex.item.id)) asked.set(ex.item.id, []);
      asked.get(ex.item.id).push({ type: ex.type, right });
      await e.submitAnswer(ex, right ? (ex.answer ?? "") : "___definitely_wrong___");
    }
  }
  Date.now = realDate;
  Math.random = realRandom;

  const progress = await e.getProgress();
  const studied = Object.entries(progress).filter(([, c]) => c.reps > 0);
  const leeches = studied.filter(([, c]) => (c.lapses || 0) >= 4);
  const recent = ([id]) => (asked.get(id) || []).slice(-6);

  // Still failing at the end: of the last six times we asked, most were wrong.
  const stuck = leeches.filter((l) => {
    const last = recent(l);
    return last.length >= 4 && last.filter((a) => !a.right).length > last.length / 2;
  });

  const leechAnswers = leeches.flatMap(recent);
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

  return {
    studied: studied.length,
    accuracy: answered ? correct / answered : 0,
    perLesson: mean(perLesson),
    leeches: leeches.length,
    stuck: stuck.length,
    leechAccuracy: leechAnswers.length
      ? leechAnswers.filter((a) => a.right).length / leechAnswers.length : 0,
    leechDemand: mean(leechAnswers.map((a) => DEMAND[a.type] ?? 0.3)),
  };
}

const runs = [];
for (let i = 0; i < TRIALS; i++) runs.push(await runTrial(SEED + i * 7919));

const of = (k) => runs.map((r) => r[k]);
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const spread = (a) => `${Math.min(...a).toFixed(0)}–${Math.max(...a).toFixed(0)}`;
const pct = (x) => `${Math.round(x * 100)}%`;

console.log(`\n${TRIALS} learners · ${DAYS} daily lessons · sessionSize ${SIZE} · seed ${SEED}\n`);
console.log(`  words studied:              ${mean(of("studied")).toFixed(0)}`);
console.log(`  overall accuracy:           ${pct(mean(of("accuracy")))}`);
console.log(`  questions per lesson:       ${mean(of("perLesson")).toFixed(1)}   (asked for ${SIZE})`);
console.log("");
console.log(`  words lapsed 4+ times:      ${mean(of("leeches")).toFixed(1)}   (range ${spread(of("leeches"))})`);
console.log(`  ...STILL FAILING at day ${DAYS}:  ${mean(of("stuck")).toFixed(1)}   (range ${spread(of("stuck"))})`);
console.log("");
console.log(`  on those struggling words, over their last six questions:`);
console.log(`    accuracy:                 ${pct(mean(of("leechAccuracy")))}`);
console.log(`    average demand asked:     ${mean(of("leechDemand")).toFixed(2)}   (0 = pick from four, 0.55 = type it cold)`);
console.log("");
console.log(`  A word someone keeps forgetting should be met with an easier`);
console.log(`  question, not a harder one. If demand stays high while accuracy`);
console.log(`  stays low, the app is asking people to fail.\n`);
