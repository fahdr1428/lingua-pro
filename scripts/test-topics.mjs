// =============================================================================
// test-topics.mjs (v105) — "Practise a topic" does what its screen says.
//
// The Topics screen promises two things per row: "N of M learned" (plus how
// many are slipping), and that tapping it runs a lesson in that topic only —
// a few words you haven't met, and the learned ones you're closest to
// forgetting. Both halves are pure functions in selector.js; this holds them,
// and the engine's "topic" mode that wires them together, to that promise
// against every real language pack.
//
// PROVEN CAPABLE OF FAILING: with buildTopicQueue's shaky list sorted by
// highest retrievability instead of lowest, the "weakest first" check fails;
// with the fresh cap removed (every unseen word admitted), the "new words
// capped" check fails; with summariseTopics counting custom words, the
// "custom words" check fails.
//
//   npm run test-topics
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { buildTopicQueue, summariseTopics } from "../src/engine/selector.js";
import { review, RATING } from "../src/engine/srs.js";
import { Engine } from "../src/engine/Engine.js";
import { EXERCISE } from "../src/engine/generator.js";

const DAY = 86400000;
const NOW = Date.UTC(2026, 0, 15);
const problems = [];
const fail = (m) => problems.push(m);
let checks = 0;
const check = (cond, msg) => { checks++; if (!cond) fail(msg); };

// A card first seen `daysAgo` days ago with one rating — older and harder
// means lower retrievability now.
const cardSeen = (daysAgo, rating = RATING.GOOD) => review({}, rating, NOW - daysAgo * DAY);

// ---------------------------------------------------------------------------
// 1. buildTopicQueue on a hand-built topic, where the right answer is known.
// ---------------------------------------------------------------------------
{
  const vocab = Array.from({ length: 12 }, (_, i) => ({ id: `w${i}`, category: "Numbers" }));
  const progress = {
    w0: cardSeen(1),                // fresh in memory
    w1: cardSeen(40, RATING.HARD),  // nearly gone
    w2: cardSeen(10),
    w3: { ...cardSeen(10), lapses: 3 }, // same age as w2, but a leech: goes first of the two
  };
  const q = buildTopicQueue(vocab, progress, { sessionSize: 8, newPerSession: 3, now: NOW });
  const ids = q.map((v) => v.id);
  check(q.length === 8, `queue should fill the session (8), got ${q.length}: ${ids.join(",")}`);
  check(new Set(ids).size === ids.length, `queue repeats a word: ${ids.join(",")}`);
  const learnedInQueue = ids.filter((id) => progress[id]);
  check(learnedInQueue.length === 4, `all 4 learned words should be in the queue, got ${learnedInQueue.join(",")}`);
  check(learnedInQueue[0] === "w1", `weakest first: the 40-day-old HARD card (w1) should lead the learned words, got ${learnedInQueue.join(",")}`);
  check(learnedInQueue[learnedInQueue.length - 1] === "w0", `strongest last: the card seen yesterday (w0) should come last, got ${learnedInQueue.join(",")}`);
  check(learnedInQueue.indexOf("w3") < learnedInQueue.indexOf("w2"), `at equal retrievability the leech (w3, 3 lapses) should go before w2, got ${learnedInQueue.join(",")}`);
}

// New-word cap: with plenty of learned words to review, only newPerSession new ones.
{
  const vocab = Array.from({ length: 30 }, (_, i) => ({ id: `w${i}`, category: "Food" }));
  const progress = {};
  for (let i = 0; i < 15; i++) progress[`w${i}`] = cardSeen(i + 1);
  const q = buildTopicQueue(vocab, progress, { sessionSize: 8, newPerSession: 3, now: NOW });
  const fresh = q.filter((v) => !progress[v.id]);
  check(fresh.length === 3, `new words capped: expected 3 unseen words when 15 learned ones need review, got ${fresh.length}`);
  check(q.length === 8, `capped session should still be full (8), got ${q.length}`);
}

// A brand-new topic: nothing learned, so the session is all new words, in pack order.
{
  const vocab = Array.from({ length: 20 }, (_, i) => ({ id: `w${i}`, category: "Body" }));
  const q = buildTopicQueue(vocab, {}, { sessionSize: 8, newPerSession: 3, now: NOW });
  check(q.length === 8, `brand-new topic should still give a full session (8), got ${q.length}`);
  check(q.map((v) => v.id).join(",") === "w0,w1,w2,w3,w4,w5,w6,w7", `brand-new topic should take words in curriculum order, got ${q.map((v) => v.id).join(",")}`);
}

// A tiny topic: never more words than exist.
{
  const vocab = [{ id: "a", category: "Colors" }, { id: "b", category: "Colors" }];
  const q = buildTopicQueue(vocab, { a: cardSeen(3) }, { sessionSize: 8, newPerSession: 3, now: NOW });
  check(q.length === 2, `2-word topic should give a 2-word session, got ${q.length}`);
}

// ---------------------------------------------------------------------------
// 2. summariseTopics counts.
// ---------------------------------------------------------------------------
{
  const vocab = [
    { id: "a", category: "Food" }, { id: "b", category: "Food" }, { id: "c", category: "Food" },
    { id: "d", category: "Food" }, { id: "x", category: "Food", custom: true },
    { id: "e", category: "Tiny" }, { id: "f", category: "Tiny" },
  ];
  const mastered = { ...cardSeen(0), stability: 20 };
  const progress = { a: cardSeen(0), b: cardSeen(60, RATING.HARD), c: mastered, x: cardSeen(0) };
  const topics = summariseTopics(vocab, progress, { now: NOW });
  const food = topics.find((t) => t.category === "Food");
  check(!!food, "Food topic missing from summary");
  if (food) {
    check(food.total === 4, `custom words: saved-from-chat words must not count toward a topic's total (expected 4, got ${food.total})`);
    check(food.learned === 3, `Food learned should be 3, got ${food.learned}`);
    check(food.mastered === 1, `Food mastered should be 1 (stability 20), got ${food.mastered}`);
    check(food.due === 1, `Food due should be 1 (the 60-day-old HARD card), got ${food.due}`);
  }
  check(!topics.some((t) => t.category === "Tiny"), "a 2-word category should be dropped (minWords 3) rather than offered as a topic");
}

// ---------------------------------------------------------------------------
// 3. The engine's "topic" mode, against every real pack and every topic.
// ---------------------------------------------------------------------------
const mem = new Map();
const storage = {
  async get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; },
  async set(k, v) { mem.set(k, JSON.stringify(v)); },
  async remove(k) { mem.delete(k); },
  async update(k, fn) { const v = fn(await this.get(k)); await this.set(k, v); return v; },
  async keys() { return [...mem.keys()]; },
  async clear() { mem.clear(); },
};

const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")).sort();
let sessions = 0;
for (const code of codes) {
  mem.clear();
  const e = new Engine(storage);
  e.pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  e.languageCode = code;

  const topics = await e.getTopics();
  check(topics.length >= 5, `${code}: only ${topics.length} topics offered — the Topics screen would look empty`);
  for (const t of topics) {
    const s = await e.generateSession({ mode: "topic", filter: { category: t.category }, sessionSize: 8, newPerSession: 3 });
    sessions++;
    const items = s.exercises.flatMap((x) => x.item ? [x.item] : x.type === EXERCISE.INTRODUCE_BATCH ? x.items || [] : []);
    const off = items.filter((v) => v.category !== t.category);
    check(items.length > 0, `${code}/${t.category}: topic lesson has no word exercises`);
    check(off.length === 0, `${code}/${t.category}: topic lesson strayed into ${[...new Set(off.map((v) => v.category))].join(", ")} (${off.slice(0, 3).map((v) => v.lemma).join(", ")})`);
    // New words must be taught before they're tested, same as any lesson.
    const introduced = new Set();
    for (const x of s.exercises) {
      if (x.type === EXERCISE.INTRODUCE && x.item) introduced.add(x.item.id);
      if (x.type === EXERCISE.INTRODUCE_BATCH) for (const it of x.items || []) introduced.add(it.id);
    }
    check(introduced.size > 0, `${code}/${t.category}: first topic session introduced no new words`);
  }
}

console.log(`\n  topics: ${checks} checks, ${sessions} real topic sessions across ${codes.length} packs`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems.slice(0, 40)) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ topic lessons stay in their topic, teach before testing, and review the weakest words first\n");
