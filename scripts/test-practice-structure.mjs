// =============================================================================
// test-practice-structure.mjs (v111) — speaking sessions, end-of-lesson
// encouragement, and the organised Practice tab do what they claim.
//
//   SPEAKING SESSION (speaking.js buildSpeakingSession), every pack × level:
//     · six tasks once six words are known; none below three known words
//     · laid out easy → hard: echo, recall, shadow, build — never backwards
//     · the level's plan (a missing rung's slots go to recall, never vanish)
//     · only known words; build needs reps ≥ 2; sentences are the word's own
//     · no word twice; recall is scheduled, the rest are practice
//     · the engine's "speak" mode serves it, and falls back to a normal
//       lesson for a beginner
//   ENCOURAGEMENT (encourage.js):
//     · milestones fire exactly when crossed; "now you can say" only uses
//       words answered right, today's new words first, one sentence each
//     · the speaking summary knows when a level was crossed
//   PRACTICE TAB (explore.js):
//     · sections in order, speak first after review; the review door isn't
//       counted as something to explore; untried doors marked; the
//       suggestion follows EXPLORE_ORDER; visiting is recorded once
//     · every door Home.jsx builds has a section that exists and a place in
//       EXPLORE_ORDER, so a door added later can't silently fall out of it
//
// PROVEN CAPABLE OF FAILING: session laid out hard → easy (336 problems);
// a missing rung's slots dropped instead of given to recall ("a level-4
// session had 4 tasks"); sayNow ignoring which answers were right ("used a
// word answered wrong"); the review door counted as explorable ("1 of 6");
// a door missing from EXPLORE_ORDER ("door rush has no place").
//
//   npm run test-practice-structure
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { buildSpeakingSession, speakingLevel, speakableSentence, SESSION_PLAN, SPEAK_MODE } from "../src/engine/speaking.js";
import { crossedMilestone, sayNow, speakingSummary, LEARNED_MILESTONES } from "../src/engine/encourage.js";
import { organisePractice, markVisited, PRACTICE_SECTIONS, EXPLORE_ORDER } from "../src/engine/explore.js";
import { Engine } from "../src/engine/Engine.js";

const problems = [];
let checks = 0;
const check = (ok, msg) => { checks++; if (!ok) problems.push(msg); };
let seed = 11;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const RANK = { echo: 0, recall: 1, shadow: 2, sentence: 3 };
const modeOf = (x) => x.mode || SPEAK_MODE.RECALL;

// ---- speaking sessions ------------------------------------------------------
const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
let sessions = 0;
for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const progress = {};
  pack.vocab.slice(0, 40).forEach((v, i) => { progress[v.id] = { reps: 1 + (i % 4), stability: i % 9, lastReview: i }; });
  for (const passes of [0, 3, 12, 30]) {
    const level = speakingLevel(passes).level;
    for (let r = 0; r < 4; r++) {
      const s = buildSpeakingSession(pack.vocab, progress, passes, rand);
      sessions++;
      const at = `${code} L${level}`;
      check(s.length === 6, `${at}: ${s.length} tasks, expected 6`);
      const ids = s.map((x) => x.item.id);
      check(new Set(ids).size === ids.length, `${at}: a word twice`);
      const ranks = s.map((x) => RANK[modeOf(x)]);
      check(ranks.every((v, i) => i === 0 || v >= ranks[i - 1]), `${at}: not easy → hard: ${s.map(modeOf).join(",")}`);
      const plan = SESSION_PLAN[level];
      const n = (m) => s.filter((x) => modeOf(x) === m).length;
      check(n("echo") === plan.echo, `${at}: ${n("echo")} echoes, plan says ${plan.echo}`);
      check(n("shadow") <= plan.shadow && n("sentence") <= plan.sentence, `${at}: more sentence tasks than planned`);
      check(n("recall") === plan.recall + (plan.shadow - n("shadow")) + (plan.sentence - n("sentence")), `${at}: recall didn't take up the missing rungs' slots`);
      for (const x of s) {
        const reps = progress[x.item.id]?.reps || 0;
        check(reps >= 1, `${at}: unknown word ${x.item.id} in a speaking session`);
        if (modeOf(x) === "sentence") check(reps >= 2, `${at}: build on ${x.item.id} with reps ${reps}`);
        if (x.sentence) check((x.item.examples || []).some((e) => e.native === x.sentence.native), `${at}: sentence isn't the word's own`);
        check(modeOf(x) === "recall" ? !x.practice : x.practice === true, `${at}: ${modeOf(x)} practice flag wrong`);
      }
    }
  }
  // Nobody ready to build a sentence (every known word met once): the build
  // slots must go to recall, not vanish.
  const once = Object.fromEntries(pack.vocab.slice(0, 30).map((v) => [v.id, { reps: 1, stability: 1 }]));
  const thin = buildSpeakingSession(pack.vocab, once, 30, rand);
  check(thin.length === 6 && !thin.some((x) => modeOf(x) === "sentence"), `${code}: with no word ready to build on, a level-4 session had ${thin.length} tasks (${thin.map(modeOf)})`);
  // Too few known words.
  const two = Object.fromEntries(pack.vocab.slice(0, 2).map((v) => [v.id, { reps: 2 }]));
  check(buildSpeakingSession(pack.vocab, two, 30, rand).length === 0, `${code}: a session with two known words`);
}

// The engine serves it, and falls back for a beginner.
{
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
  e.pack = JSON.parse(readFileSync("src/data/languages/ur.json", "utf8"));
  e.languageCode = "ur";
  const fresh = await e.generateSession({ mode: "speak", speakingPasses: 30 });
  check(fresh.exercises.some((x) => x.type !== "speak_prompt"), "a beginner's speaking session should fall back to an ordinary lesson");
  const progress = Object.fromEntries(e.pack.vocab.slice(0, 20).map((v) => [v.id, { reps: 3, stability: 2 }]));
  await storage.set("progress", { ur: progress });
  const sp = await e.generateSession({ mode: "speak", speakingPasses: 30 });
  check(sp.mode === "speak" && sp.exercises.length === 6 && sp.exercises.every((x) => x.type === "speak_prompt"), `engine "speak" mode: ${sp.exercises.map((x) => x.type).join(",")}`);
}

// ---- encouragement ------------------------------------------------------------
check(crossedMilestone(9, 10) === 10 && crossedMilestone(10, 11) === null && crossedMilestone(20, 60) === 50 && crossedMilestone(0, 0) === null,
  `milestones: ${[crossedMilestone(9, 10), crossedMilestone(10, 11), crossedMilestone(20, 60), crossedMilestone(0, 0)]}`);
check(LEARNED_MILESTONES.every((m, i) => i === 0 || m > LEARNED_MILESTONES[i - 1]), "milestones ascend");
{
  const pack = JSON.parse(readFileSync("src/data/languages/es.json", "utf8"));
  const withS = pack.vocab.filter((v) => speakableSentence(v)).slice(0, 6);
  const right = new Set([withS[2].id, withS[4].id, withS[5].id]);
  const intro = new Set([withS[4].id]);
  const said = sayNow(withS, right, { introducedIds: intro });
  check(said.length === 2, `sayNow gives two, gave ${said.length}`);
  check(said.every((x) => right.has(x.item.id)), "sayNow used a word answered wrong");
  check(said[0]?.item.id === withS[4].id, "today's new word should come first");
  check(sayNow(withS, new Set(), {}).length === 0, "nothing right → nothing claimed");
  check(new Set(said.map((x) => x.sentence.native)).size === said.length, "a sentence twice");
}
check(speakingSummary(2, 1, 3).levelUp === true && speakingSummary(3, 1, 1).levelUp === false && speakingSummary(11, 2, 2).level.level === 3,
  "speaking summary level-up detection");

// ---- the Practice tab ----------------------------------------------------------
{
  const doors = [
    { id: "due", section: "review" }, { id: "rush", section: "words" }, { id: "flashcards", section: "words" },
    { id: "speak-session", section: "speak" }, { id: "grammar", section: "understand" }, { id: "exam", section: "test" },
  ];
  const r = organisePractice(doors, ["rush"]);
  check(r.sections.map((x) => x.id).join(",") === "review,speak,words,understand,test", `section order: ${r.sections.map((x) => x.id)}`);
  check(r.total === 5 && r.explored === 1, `explored ${r.explored} of ${r.total}, expected 1 of 5 (review isn't explorable)`);
  check(r.suggestion?.id === "speak-session", `suggestion ${r.suggestion?.id}`);
  const words = r.sections.find((x) => x.id === "words").doors;
  check(words.find((d) => d.id === "rush").isNew === false && words.find((d) => d.id === "flashcards").isNew === true, "isNew marks");
  check(r.sections[0].doors[0].isNew === false, "the review door is never 'new'");
  const all = organisePractice(doors, doors.map((d) => d.id));
  check(all.suggestion === null && all.explored === all.total, "everything tried → no suggestion");
  const st1 = markVisited({}, "ur", "rush");
  const st2 = markVisited(st1, "ur", "rush");
  check(st2 === st1 && st1.doorsVisited.ur.length === 1, "markVisited records once");
  check(markVisited(st1, "es", "rush").doorsVisited.ur.length === 1, "markVisited is per language");
}
{
  // Every door Home builds is placed.
  const src = readFileSync("src/screens/Home.jsx", "utf8");
  const hub = src.slice(src.indexOf("export function PracticeHub("));
  const found = [...hub.matchAll(/id: "([a-z-]+)", section: "([a-z]+)"/g)].map((m) => ({ id: m[1], section: m[2] }));
  check(found.length >= 14, `found ${found.length} doors in PracticeHub`);
  const secIds = new Set(PRACTICE_SECTIONS.map((x) => x.id));
  for (const d of found) {
    check(secIds.has(d.section), `door ${d.id} is in section "${d.section}", which doesn't exist`);
    if (d.section !== "review") check(EXPLORE_ORDER.includes(d.id), `door ${d.id} has no place in EXPLORE_ORDER`);
  }
  check(new Set(found.map((d) => d.id)).size === found.length, "two doors share an id");
}

console.log(`\n  practice structure: ${checks} checks · ${sessions} speaking sessions across ${codes.length} languages`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems.slice(0, 25)) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ sessions climb easy → hard, encouragement only claims what's true, every door has a place\n");
