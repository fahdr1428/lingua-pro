// =============================================================================
// test-challenge.mjs (v113) — the lesson adapts its difficulty toward the band
// where people learn, and a fixed lesson doesn't.
//
// THE RULES (challenge.js), checked directly:
//   · nothing is decided before four answers; 5/6 right steps up, 3/6 steps down
//   · a question is only stepped UP to from-memory if its word has been met
//     (before the lesson, or introduced earlier in it)
//   · guesses before teaching, speaking practice and exam rounds are never touched
//   · after a change, it waits before judging again (no see-sawing)
//   · an exam never adapts
//
// THE EFFECT, on real lessons in Spanish, Urdu and Japanese, answered by three
// simulated learners. The answer model is deliberately simple and assumes only
// what every study of this agrees on — recognising is easier than producing:
//
//                 choose from options   assemble   from memory
//   strong              97%               92%          88%
//   average             90%               75%          62%
//   struggling          72%               50%          30%
//
// It measures where the DIFFICULTY lands, not how much anyone learns. Claims:
//   · the strong learner is stretched: more of their questions are from
//     memory, and they no longer sail through at the fixed lesson's rate
//   · the struggling learner is supported: more answers land
//   · everyone ends up between 60% and 92% right
//
// PROVEN CAPABLE OF FAILING, each break made on purpose and then undone:
//   · no whole-lesson gate on stepping up → the struggling profile drops to
//     59.96% right, out of the band
//   · no cooldown after stretching → a change on every answer (3,4,5,6,7) —
//     which this file only caught once the spacing it checks was a literal 2
//     rather than the very setting being broken
//   · a word stepped up twice in one lesson, or stepped up into a type
//     switched off in Settings → those checks fail
//
//   npm run test-challenge
// =============================================================================

import { readFileSync } from "node:fs";
import { Engine } from "../src/engine/Engine.js";
import { reshapeExercise } from "../src/engine/generator.js";
import { challengeDecision, planAdjustment, afterAnswer, CHALLENGE } from "../src/engine/challenge.js";

const problems = [];
let checks = 0;
const check = (ok, msg) => { checks++; if (!ok) problems.push(msg); };

// ---- the rules ----------------------------------------------------------------
check(challengeDecision([true, true, true]) === "hold", "nothing is decided before four answers");
check(challengeDecision([true, true, true, true]) === "up", "4 of 4 steps up");
check(challengeDecision([true, true, true, true, true, false]) === "up", "5 of 6 steps up");
check(challengeDecision([true, true, true, true, false, false]) === "hold", "4 of 6 holds");
check(challengeDecision([true, false, true, false, true, false]) === "down", "3 of 6 steps down");
check(challengeDecision([false, false, true, false]) === "down", "1 of 4 steps down");
{
  const item = (id) => ({ id, lemma: id, translation: `t-${id}` });
  const lesson = [
    { type: "pick_word", item: item("a"), pretest: true },
    { type: "introduce_batch", items: [item("a"), item("b")] },
    { type: "pick_word", item: item("c") },                       // never met
    { type: "pick_meaning", item: item("b") },                    // met in this lesson
    { type: "speak_prompt", item: item("b"), practice: true, mode: "shadow" },
    { type: "recall_write", item: item("a") },
  ];
  const up = planAdjustment(lesson, 2, "up");
  check(up?.index === 3 && up.to === "recall_write", `step up skips the unmet word and picks the met one: ${JSON.stringify(up)}`);
  check(planAdjustment(lesson, 2, "up", { progress: { c: { reps: 2 } } })?.index === 2, "a word met in an earlier lesson can be stepped up");
  check(planAdjustment(lesson, 0, "up")?.index !== 0, "a guess-before-teaching is never touched");
  const down = planAdjustment(lesson, 2, "down");
  check(down?.index === 5 && down.to === "pick_word", `step down finds the from-memory question: ${JSON.stringify(down)}`);
  check(planAdjustment(lesson, 4, "down")?.index === 5, "speaking practice is skipped over");
  check(planAdjustment([{ type: "pick_word", item: item("b"), round: 2 }], 0, "up", { progress: { b: { reps: 3 } } }) === null, "an exam round is never changed");
  check(planAdjustment(lesson, 2, "up", { disabled: ["recall_write"] }) === null, "writing from memory switched off in Settings: never stepped up into it");
  {
    const again = [
      { type: "introduce_batch", items: [item("n")] },
      { type: "recall_write", item: item("n"), challenge: "up" },
      { type: "pick_word", item: item("n") },
      { type: "pick_meaning", item: item("m") },
    ];
    const p = planAdjustment(again, 2, "up", { progress: { m: { reps: 1 } } });
    check(p?.index === 3, `a word already asked from memory in this lesson isn't stepped up again: ${JSON.stringify(p)}`);
  }
  check(planAdjustment(lesson, 2, "down", { disabled: ["recall_write"] })?.index === 5, "…but a from-memory question can still be stepped down");
  let st = { results: [], quietUntil: 0 };
  const ex6 = Array.from({ length: 12 }, (_, i) => ({ type: "pick_word", item: item(`w${i}`) }));
  const prog = Object.fromEntries(ex6.map((x) => [x.item.id, { reps: 2 }]));
  const changes = [];
  for (let i = 0; i < 8; i++) {
    const r = afterAnswer(st, true, ex6, i, { progress: prog });
    st = r.state;
    if (r.change) changes.push(i);
  }
  // A literal 2, not CHALLENGE.cooldownUp: compared with the setting it guards,
  // this passed with the cooldown set to 0.
  check(changes.length >= 2 && changes.every((c, k) => k === 0 || c - changes[k - 1] >= 2), `after stretching, two answers pass before the next change: at ${changes}`);
  check(afterAnswer({ results: [true, true, true, true, true] }, true, ex6, 5, { progress: prog, exam: true }).change === null, "an exam never adapts");
}

// ---- the effect -----------------------------------------------------------------
const PROFILES = {
  strong: { choose: 0.97, assemble: 0.92, recall: 0.88 },
  average: { choose: 0.9, assemble: 0.75, recall: 0.62 },
  struggling: { choose: 0.72, assemble: 0.5, recall: 0.3 },
};
const KIND = (t) => (["recall_write", "speak_prompt", "type_translation"].includes(t) ? "recall"
  : ["tap_words", "build_sentence", "letter_scramble"].includes(t) ? "assemble" : "choose");

function prng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296); }
function mem() { const m = new Map(); return { async get(k) { return m.has(k) ? JSON.parse(m.get(k)) : null; }, async set(k, v) { m.set(k, JSON.stringify(v)); }, async remove(k) { m.delete(k); }, async update(k, fn) { const v = fn(await this.get(k)); await this.set(k, v); return v; }, async keys() { return [...m.keys()]; }, async clear() { m.clear(); } }; }

const DAY = 86400000;
async function lessonsFor(code, n, seed) {
  const realRandom = Math.random;
  Math.random = prng(seed);
  try {
    const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
    const e = new Engine(mem()); e.pack = pack; e.languageCode = code;
    const now = Date.now(), progress = {};
    pack.vocab.slice(0, 40).forEach((v, i) => { progress[v.id] = { difficulty: 5, stability: 2 + (i % 6), reps: 1 + (i % 4), lapses: 0, lastReview: now - 3 * DAY, lastRating: 3, recalls: i % 3 === 0 ? 1 : 0 }; });
    await e.storage.set("progress", { [code]: progress });
    const out = [];
    for (let i = 0; i < n; i++) out.push({ pack, progress, exercises: (await e.generateSession({ mode: "smart", sessionSize: 6, newPerSession: 3, speakingPasses: 0 })).exercises });
    return out;
  } finally { Math.random = realRandom; }
}

function play(lesson, profile, adapt, rand) {
  const exercises = lesson.exercises.map((x) => ({ ...x }));
  let state = { results: [], quietUntil: 0 };
  let right = 0, graded = 0, fromMemory = 0;
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    if (!ex.item || ex.type === "introduce_batch" || ex.type === "introduce" || ex.pretest || ex.practice) continue;
    const kind = KIND(ex.type);
    const ok = rand() < profile[kind];
    graded++; if (ok) right++; if (kind === "recall") fromMemory++;
    if (!adapt) continue;
    const r = afterAnswer(state, ok, exercises, i, { progress: lesson.progress });
    state = r.state;
    if (r.change) {
      const swapped = reshapeExercise(exercises[r.change.index], r.change.to, lesson.pack.vocab, lesson.progress);
      if (swapped) exercises[r.change.index] = { ...swapped, challenge: r.change.direction };
    }
  }
  return { right, graded, fromMemory };
}

const results = {};
for (const [name, profile] of Object.entries(PROFILES)) {
  const agg = { fixed: { right: 0, graded: 0, fromMemory: 0 }, adaptive: { right: 0, graded: 0, fromMemory: 0 } };
  let seed = 1;
  for (const code of ["es", "ur", "ja"]) {
    const lessons = await lessonsFor(code, 12, 100 + seed++);
    for (const [mode, adapt] of [["fixed", false], ["adaptive", true]]) {
      const rand = prng(7 + seed);
      for (const l of lessons) {
        const r = play(l, profile, adapt, rand);
        agg[mode].right += r.right; agg[mode].graded += r.graded; agg[mode].fromMemory += r.fromMemory;
      }
    }
  }
  const rate = (m) => agg[m].right / agg[m].graded;
  const mem = (m) => agg[m].fromMemory / agg[m].graded;
  results[name] = { fixed: rate("fixed"), adaptive: rate("adaptive"), memFixed: mem("fixed"), memAdaptive: mem("adaptive") };
}

const pct = (x) => `${Math.round(x * 100)}%`;
for (const [name, r] of Object.entries(results)) {
  console.log(`  ${name.padEnd(11)} right: fixed ${pct(r.fixed)} → adaptive ${pct(r.adaptive)}   ·   from memory: ${pct(r.memFixed)} → ${pct(r.memAdaptive)} of questions`);
}
const s = results.strong, w = results.struggling;
check(s.memAdaptive > s.memFixed + 0.05, `the strong learner should get more from-memory questions (${pct(s.memFixed)} → ${pct(s.memAdaptive)})`);
check(s.adaptive < s.fixed, `the strong learner should be stretched below the fixed lesson's rate (${pct(s.fixed)} → ${pct(s.adaptive)})`);
check(w.adaptive > w.fixed + 0.03, `the struggling learner should land more answers (${pct(w.fixed)} → ${pct(w.adaptive)})`);
for (const [name, r] of Object.entries(results)) {
  check(r.adaptive >= 0.6 && r.adaptive <= 0.92, `${name}: adaptive success ${(r.adaptive * 100).toFixed(2)}% is outside 60–92%`);
}

console.log(`\n  challenge: ${checks} checks`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ the strong profile gets harder questions, the struggling one easier, and all three land between 60% and 92% right\n");
