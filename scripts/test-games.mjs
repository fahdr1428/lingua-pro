// =============================================================================
// test-games.mjs (v109) — Word Rush's logic does what the game promises.
//
//   · every question, in every language and both directions, has the right
//     answer among its options, four options where the pool allows, and no
//     two options that read the same
//   · no distractor is ALSO right: not "please, go ahead" beside "please", not
//     "to help" beside "help", and in English → word, not the other word for
//     "tea" beside the one being asked for (checked here with its own gloss
//     reader, not the game's, so one bug can't hide in both)
//   · distractors come from the same topic when the topic has enough words
//   · a missed word comes back within a few questions
//   · the pool is the learner's words, topped up from the course for beginners
//   · the multiplier and XP cap are what the screen says
//   · "practise the ones I missed" makes a lesson on exactly those words
//
// PROVEN CAPABLE OF FAILING: with the duplicate-text check removed from
// rushQuestion, the "no two options read the same" check fails (Arabic has two
// words glossed "tomorrow", Japanese two "tea"); with deck.missed() a no-op, the comeback check fails;
// with the same-topic preference cut to one word, the topic check fails. On
// the game as v109 first wrote it — whole glosses compared, and no meaning
// check in English → word — the "also right" check found 39 distractors that
// were right answers too, e.g. Arabic من فضلك offered with both "please" and
// "please, go ahead, help yourself"; with only the English → word meaning check
// removed, it still finds 21, e.g. "hungry" offering both جوعان and جَوعان.
//
//   npm run test-games
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { buildRushPool, rushQuestion, comboMultiplier, createRushDeck, rushXp } from "../src/engine/games.js";
import { Engine } from "../src/engine/Engine.js";

const problems = [];
let checks = 0;
const check = (ok, msg) => { checks++; if (!ok) problems.push(msg); };
const norm = (s) => String(s).trim().toLowerCase();

// The test's own reading of a gloss, written separately from games.js: split on
// , ; / and " or " outside parentheses; a part is "qualified" if it carries a
// parenthesis. Two parts mean the same if they match once the parenthesis and
// a leading to/the/a/an are gone — unless BOTH are qualified, because "you
// (formal)" vs "you (familiar)" is a real choice, and the point of the lesson.
function parts(s) {
  const out = [];
  let depth = 0, cur = "";
  const str = String(s || "");
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (!depth && /[,;/]/.test(ch)) { out.push(cur); cur = ""; continue; }
    if (!depth && str.slice(i, i + 4) === " or ") { out.push(cur); cur = ""; i += 3; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((p) => ({
    core: p.replace(/\([^)]*\)/g, " ").toLowerCase().replace(/\s+/g, " ").trim().replace(/^(to|the|a|an) /, ""),
    qual: /\(/.test(p),
  })).filter((p) => p.core);
}
const sameMeaning = (a, b) => norm(a) === norm(b) || parts(a).some((x) => parts(b).some((y) => x.core === y.core && !(x.qual && y.qual)));

// Seeded RNG so a failure reproduces.
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
let questions = 0, sameTopicChances = 0, sameTopicHits = 0, alsoRight = 0;

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  // Every word in the pack, so a word added later is covered the day it lands.
  const pool = buildRushPool(pack.vocab, {}, { min: Infinity });
  const byLemma = new Map();
  for (const w of pool) (byLemma.get(norm(w.lemma)) || byLemma.set(norm(w.lemma), []).get(norm(w.lemma))).push(w);
  for (const dir of ["meaning", "word"]) {
    for (const item of pool) {
      const q = rushQuestion(item, pool, dir, rand);
      questions++;
      const answer = dir === "meaning" ? item.translation : item.lemma;
      check(q.answer === answer, `${code}/${dir} ${item.id}: answer is "${q.answer}", expected "${answer}"`);
      check(q.options.includes(q.answer), `${code}/${dir} ${item.id}: the right answer isn't among the options`);
      check(q.options.length === 4, `${code}/${dir} ${item.id}: ${q.options.length} options, expected 4`);
      const texts = q.options.map(norm);
      check(new Set(texts).size === texts.length, `${code}/${dir} ${item.id}: two options read the same — [${q.options.join(" | ")}]`);

      // No distractor is also a right answer.
      const distractors = q.options.filter((o) => o !== q.answer);
      for (const o of distractors) {
        if (dir === "meaning") {
          if (sameMeaning(o, item.translation)) { alsoRight++; check(false, `${code}/meaning ${item.lemma}: "${o}" is also right — [${q.options.join(" | ")}]`); }
        } else {
          const other = byLemma.get(norm(o)) || [];
          if (other.some((w) => sameMeaning(w.translation, item.translation))) { alsoRight++; check(false, `${code}/word "${item.translation}": ${o} means that too — [${q.options.join(" | ")}]`); }
        }
      }

      // Same-topic preference: a distractor from outside the topic is only
      // allowed when every unused word in the topic would have been a bad
      // option (it reads the same as, or means the same as, one already there).
      const usable = (w) => {
        const t = dir === "meaning" ? w.translation : w.lemma;
        if (w.id === item.id || !t) return false;
        if (sameMeaning(w.translation, item.translation)) return false;
        if (norm(w.lemma) === norm(item.lemma)) return false;
        return true;
      };
      const topic = pool.filter((w) => w.category === item.category && usable(w));
      const topicTexts = new Set(topic.map((w) => norm(dir === "meaning" ? w.translation : w.lemma)));
      const outsiders = distractors.filter((o) => !topicTexts.has(norm(o)));
      const kept = q.options.filter((o) => !outsiders.includes(o));
      const wasted = topic.filter((w) => {
        const t = dir === "meaning" ? w.translation : w.lemma;
        return !kept.some((o) => sameMeaning(o, t));
      });
      sameTopicChances++;
      if (!outsiders.length || !wasted.length) sameTopicHits++;
      else if (sameTopicChances - sameTopicHits <= 3) problems.push(`${code}/${dir} ${item.id}: took ${outsiders.join(", ")} from outside the topic while ${wasted.slice(0, 2).map((w) => dir === "meaning" ? w.translation : w.lemma).join(", ")} was free`);
    }
  }
}
check(sameTopicHits === sameTopicChances, `distractors came from the word's own topic in ${sameTopicHits} of ${sameTopicChances} questions (the rest reached outside while the topic still had usable words)`);
if (alsoRight) problems.unshift(`${alsoRight} distractors were also right answers`);

// ---- ambiguity: "you" beside "you (formal)" has two right answers ----------
{
  const pool = [
    { id: "a", lemma: "tu", translation: "you", category: "P" },
    { id: "b", lemma: "aap", translation: "you (formal)", category: "P" },
    { id: "c", lemma: "tum", translation: "you (familiar)", category: "P" },
    { id: "d", lemma: "main", translation: "I", category: "P" },
    { id: "e", lemma: "hum", translation: "we", category: "P" },
    { id: "f", lemma: "voh", translation: "he, she", category: "P" },
  ];
  let bad = 0, register = 0;
  for (let i = 0; i < 300; i++) {
    for (const item of pool) {
      const o = rushQuestion(item, pool, "meaning", rand).options;
      if (o.includes("you") && (o.includes("you (formal)") || o.includes("you (familiar)"))) bad++;
      if (o.includes("you (formal)") && o.includes("you (familiar)")) register++;
    }
  }
  check(bad === 0, `"you" appeared beside a qualified "you" ${bad} times — two right answers`);
  check(register > 0, "formal and familiar \"you\" should still be allowed side by side (that's the register lesson)");
}

// ---- the deck: a missed word comes back soon; a pass covers everything ------
{
  const pool = Array.from({ length: 10 }, (_, i) => ({ id: `w${i}`, lemma: `l${i}`, translation: `t${i}`, category: "X" }));
  const deck = createRushDeck(pool, rand);
  const first = deck.next();
  deck.missed(first);
  const nextFour = [deck.next(), deck.next(), deck.next(), deck.next()].map((w) => w.id);
  check(nextFour.includes(first.id), `a missed word should come back within 4 questions — got ${nextFour.join(",")} after missing ${first.id}`);

  const deck2 = createRushDeck(pool, rand);
  const seen = new Set();
  for (let i = 0; i < pool.length; i++) seen.add(deck2.next().id);
  check(seen.size === pool.length, `one pass of the deck should ask every word once — saw ${seen.size} of ${pool.length}`);
  let prev = null, repeats = 0;
  for (let i = 0; i < 200; i++) { const w = deck2.next(); if (prev && w.id === prev) repeats++; prev = w.id; }
  check(repeats === 0, `the same word came up twice in a row ${repeats} times`);
}

// ---- the pool --------------------------------------------------------------
{
  const vocab = Array.from({ length: 30 }, (_, i) => ({ id: `v${i}`, lemma: `l${i}`, translation: `t${i}`, category: "X" }));
  vocab.push({ id: "c1", lemma: "mine", translation: "a word I saved", category: "X", custom: true });
  const learned = Object.fromEntries(vocab.slice(10, 25).map((v) => [v.id, { reps: 2 }]));
  const p1 = buildRushPool(vocab, learned, { min: 12 });
  check(p1.length === 15 && p1.every((v) => learned[v.id]), `with 15 learned words the pool should be exactly those 15 — got ${p1.length}`);
  const few = Object.fromEntries(vocab.slice(20, 23).map((v) => [v.id, { reps: 1 }]));
  const p2 = buildRushPool(vocab, few, { min: 12 });
  check(p2.length === 12, `a beginner's pool should be topped up to 12 — got ${p2.length}`);
  check(p2.slice(3).map((v) => v.id).join(",") === "v0,v1,v2,v3,v4,v5,v6,v7,v8", `top-up words should follow the course order — got ${p2.slice(3).map((v) => v.id).join(",")}`);
  check(!buildRushPool(vocab, {}, { min: 40 }).some((v) => v.custom), "saved-from-chat words shouldn't be in the game");
}

// ---- scoring ---------------------------------------------------------------
check([0, 1, 2, 3, 5, 6, 8, 9, 30].map(comboMultiplier).join(",") === "1,1,1,2,2,3,3,4,4", `multiplier steps: ${[0, 1, 2, 3, 5, 6, 8, 9, 30].map(comboMultiplier).join(",")}`);
check(rushXp(7) === 7 && rushXp(80) === 25 && rushXp(-1) === 0, "XP is one per correct answer, capped at 25");

// ---- "practise the ones I missed" ------------------------------------------
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
  for (const code of ["ur", "es", "ja"]) {
    const e = new Engine(storage);
    e.pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
    e.languageCode = code;
    const ids = [e.pack.vocab[40].id, e.pack.vocab[7].id, e.pack.vocab[120].id];
    const s = await e.generateSession({ mode: "words", filter: { vocabIds: ids }, sessionSize: 3, newPerSession: 3 });
    const tested = new Set(s.exercises.filter((x) => x.item).map((x) => x.item.id));
    for (const x of s.exercises) if (x.type === "introduce_batch") for (const it of x.items || []) tested.add(it.id);
    check(ids.every((id) => tested.has(id)), `${code}: a "words" lesson should cover all three missed words — covered ${[...tested].filter((id) => ids.includes(id)).length}`);
    const primary = s.exercises.filter((x) => x.item && !x.recovery).map((x) => x.item.id);
    check(primary.filter((id) => ids.includes(id)).length > 0, `${code}: the "words" lesson asked none of the missed words`);
  }
}

console.log(`\n  word rush: ${checks} checks · ${questions} questions across ${codes.length} languages, both directions`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems.slice(0, 25)) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ one right answer every time, same-topic distractors, misses come back, and they become a lesson\n");
