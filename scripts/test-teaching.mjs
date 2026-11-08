// =============================================================================
// test-teaching.mjs (v116) — spot the mistake, dictation, and your mistakes.
//
// Over every word in every language:
//   SPOT THE MISTAKE
//   · exactly one tile differs from the sentence it came from, and it is the
//     one the exercise says is wrong;
//   · the tile it replaced is the lesson's word, which appears once;
//   · the word swapped in appears nowhere else in the sentence, and never
//     shares a meaning with the word it replaced (so the sentence really no
//     longer says the English shown);
//   · the choices hold the right word and the wrong one, 3–4 of them, no two
//     alike or alike in meaning — exactly one can be right;
//   · grading needs BOTH the right tile and the right word.
//   DICTATION
//   · in a structured lesson only where the word can be heard, and not when
//     listening or writing is switched off; never scheduled, never counted
//     as from-memory, logged as dictation.
//   SPOT THE MISTAKE IN LESSONS
//   · one per word lesson that has a word able to carry it; practice only
//     (no objective).
//   YOUR MISTAKES
//   · a miss stays until put right (a clean from-memory answer after it, or
//     two right in a row); most-missed first; old misses fall away.
//
// Each rule was checked against a deliberately broken copy of the code it
// guards (see the commit message).
// =============================================================================

import { allCodes, loadPack } from "./lib/inventory.mjs";
import { buildFixSentence, buildDictation, mistakeNotebook, fixableFrames, tileCore } from "../src/engine/teach.js";
import { gradeAnswer, EXERCISE, sentenceTiles } from "../src/engine/generator.js";
import { sameMeaning } from "../src/engine/games.js";
import { buildGuidedSession, loadCourse } from "../src/engine/guided.js";
import { credit, SKILLS_OF } from "../src/engine/skills.js";

let checks = 0;
const problems = [];
const check = (ok, msg) => { checks++; if (!ok) problems.push(msg); };
const word = (s) => tileCore(s).normalize("NFC").toLocaleLowerCase();

function seeded(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------------------------------------------------------------------------
// 1. Spot the mistake, every word, every language
// ---------------------------------------------------------------------------
const coverage = {};
let built = 0;
for (const code of allCodes()) {
  const pack = loadPack(code);
  const pool = (pack.vocab || []).filter((v) => !v.custom);
  let n = 0;
  for (const [k, item] of pool.entries()) {
    for (const seed of [k + 1, k + 7919]) {
      const f = buildFixSentence(item, pool, { rand: seeded(seed) });
      if (!f) continue;
      n++; built++;
      const where = `${code} ${item.id} (${item.lemma})`;
      const original = sentenceTiles(f.example.native, item, pool);
      check(f.type === EXERCISE.FIX_SENTENCE && f.answer === item.lemma, `${where}: not a fix-sentence for the word`);
      check(original.length === f.tiles.length, `${where}: tile count changed (${original.length} → ${f.tiles.length})`);
      const diff = f.tiles.map((t, i) => (t !== original[i] ? i : -1)).filter((i) => i >= 0);
      check(diff.length === 1 && diff[0] === f.wrongIndex, `${where}: ${diff.length} tiles differ (${diff}) — the wrong one is said to be ${f.wrongIndex}`);
      check(word(original[f.wrongIndex]) === word(item.lemma), `${where}: the replaced tile "${original[f.wrongIndex]}" is not the word`);
      check(original.filter((t) => word(t) === word(item.lemma)).length === 1, `${where}: the word appears more than once in its sentence`);
      check(word(f.tiles[f.wrongIndex]) === word(f.wrong.lemma), `${where}: the swapped tile "${f.tiles[f.wrongIndex]}" is not the wrong word "${f.wrong.lemma}"`);
      check(f.tiles.filter((t) => word(t) === word(f.wrong.lemma)).length === 1, `${where}: the wrong word "${f.wrong.lemma}" appears elsewhere in the sentence`);
      check(!sameMeaning(item.translation, f.wrong.translation), `${where}: "${f.wrong.lemma}" (${f.wrong.translation}) means the same as "${item.translation}" — the sentence may still be right`);
      check(f.translation === f.example.translation && !!f.translation, `${where}: the English shown is not the sentence's own`);
      // Choices
      const opts = f.options;
      check(opts.length >= 3 && opts.length <= 4, `${where}: ${opts.length} choices`);
      check(opts.includes(f.answer) && opts.includes(f.wrong.lemma), `${where}: choices lack the answer or the wrong word`);
      check(new Set(opts.map(word)).size === opts.length, `${where}: two choices read the same: ${opts.join(" / ")}`);
      for (let i = 0; i < opts.length; i++) for (let j = i + 1; j < opts.length; j++) {
        check(!sameMeaning(f.optionMeaning[opts[i]], f.optionMeaning[opts[j]]), `${where}: choices "${opts[i]}" and "${opts[j]}" share a meaning`);
      }
      // Grading
      const right = gradeAnswer(f, { tile: f.wrongIndex, fix: f.answer });
      check(right.correct, `${where}: the right tile and word are graded wrong`);
      check(!gradeAnswer(f, { tile: f.wrongIndex, fix: f.wrong.lemma }).correct, `${where}: putting the wrong word back is graded right`);
      const otherTile = (f.wrongIndex + 1) % f.tiles.length;
      check(!gradeAnswer(f, { tile: otherTile, fix: f.answer }).correct, `${where}: the wrong tile with the right word is graded right`);
      const otherOpt = opts.find((o) => o !== f.answer && o !== f.wrong.lemma);
      if (otherOpt) check(!gradeAnswer(f, { tile: f.wrongIndex, fix: otherOpt }).correct, `${where}: another choice is graded right`);
      check(!gradeAnswer(f, { tile: f.wrongIndex, fix: null }).correct && !gradeAnswer(f, null).correct, `${where}: an empty answer is graded right`);
    }
    // A word with no usable frame must never produce one.
    if (!fixableFrames(item, pool).length) check(buildFixSentence(item, pool, { rand: seeded(k) }) === null, `${code} ${item.id}: built from a sentence it can't carry`);
  }
  coverage[code] = n;
}
for (const [code, n] of Object.entries(coverage)) check(n > 0, `${code}: no word in the language can carry spot-the-mistake`);

// ---------------------------------------------------------------------------
// 2. In the structured lessons
// ---------------------------------------------------------------------------
let lessons = 0, withFix = 0, withDictation = 0;
for (const code of allCodes()) {
  const pack = loadPack(code);
  const pool = (pack.vocab || []).filter((v) => !v.custom);
  const byId = new Map(pool.map((v) => [v.id, v]));
  const course = await loadCourse(pack);
  for (const m of course.modules) {
    for (const l of m.lessons) {
      if (l.kind === "task") continue;
      lessons++;
      const s = await buildGuidedSession(pack, l.id, { canHear: () => true, rand: seeded(lessons) });
      const where = `${code} ${l.id}`;
      const fixes = s.exercises.filter((e) => e.type === EXERCISE.FIX_SENTENCE);
      const canCarry = l.items.some((id) => byId.get(id) && fixableFrames(byId.get(id), pool).length);
      check(fixes.length === (canCarry ? 1 : 0), `${where}: ${fixes.length} spot-the-mistake (a word can carry one: ${canCarry})`);
      for (const f of fixes) {
        check(f.phase === "apply" && !f.objective && !f.assess, `${where}: spot-the-mistake should be application practice, not assessed`);
        check(l.items.includes(f.item.id), `${where}: spot-the-mistake is about a word from another lesson`);
      }
      if (fixes.length) withFix++;
      const dict = s.exercises.filter((e) => e.cue === "audio");
      check(dict.length === 1, `${where}: ${dict.length} dictations with sound available`);
      for (const d of dict) {
        check(d.type === EXERCISE.RECALL_WRITE && d.logAs === "dictation" && d.noSchedule && d.playAudio && d.phase === "guided" && !d.objective,
          `${where}: dictation is not a guided, unscheduled, logged-as-dictation question: ${JSON.stringify({ t: d.type, l: d.logAs, n: d.noSchedule, p: d.phase, o: d.objective })}`);
        check(l.items.includes(d.item.id), `${where}: dictation of a word from another lesson`);
      }
      if (dict.length) withDictation++;
      if (lessons % 9 === 0) {
        const silent = await buildGuidedSession(pack, l.id, {});
        check(!silent.exercises.some((e) => e.cue === "audio"), `${where}: dictation where nothing can be heard`);
        const noListen = await buildGuidedSession(pack, l.id, { canHear: () => true, disabled: [EXERCISE.LISTEN_PICK] });
        check(!noListen.exercises.some((e) => e.cue === "audio"), `${where}: dictation with listening switched off`);
        const noWrite = await buildGuidedSession(pack, l.id, { canHear: () => true, disabled: [EXERCISE.RECALL_WRITE] });
        check(!noWrite.exercises.some((e) => e.cue === "audio"), `${where}: dictation with writing switched off`);
        const deaf = await buildGuidedSession(pack, l.id, { canHear: () => false });
        check(!deaf.exercises.some((e) => e.cue === "audio"), `${where}: dictation of a word that can't be heard`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Dictation through the engine: graded as writing, never scheduled or
//    counted as from memory
// ---------------------------------------------------------------------------
{
  const { Engine } = await import("../src/engine/Engine.js");
  const mem = new Map();
  const storage = { async get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; }, async set(k, v) { mem.set(k, JSON.stringify(v)); }, async keys() { return [...mem.keys()]; } };
  const e = new Engine(storage);
  const pack = loadPack("hi");
  e.pack = pack; e.languageCode = "hi";
  const item = pack.vocab.find((v) => v.translit && v.lemma);
  const d = buildDictation(item);
  const byScript = await e.submitAnswer(d, { text: item.lemma });
  const byRoman = await e.submitAnswer(d, { text: item.translit });
  check(byScript.correct && byRoman.correct, `dictation: the script and the romanisation are both accepted (${byScript.correct}, ${byRoman.correct})`);
  check(!(await e.getProgress())[item.id], "dictation moved the review schedule");
  const log = await e.getAttempts();
  check(log.length === 2 && log.every((a) => a.t === "dictation"), `dictation is logged as dictation: ${JSON.stringify(log)}`);
  check(JSON.stringify(SKILLS_OF.dictation) === JSON.stringify(["listening", "writing"]), "dictation is evidence about listening and writing");
  // A from-memory answer still counts; a dictation one doesn't.
  const recall = { type: EXERCISE.RECALL_WRITE, item, answer: item.lemma, translation: item.translation };
  await e.submitAnswer(recall, { text: item.lemma });
  check(((await e.getProgress())[item.id]?.recalls || 0) === 1, "a from-memory answer counts as produced");
  // Spot the mistake is chosen from what's on screen: 70% credit, like other choices.
  check(credit({ t: "fix_sentence", ok: true }) === 0.7, "spot-the-mistake earns full from-memory credit");
}

// ---------------------------------------------------------------------------
// 4. Your mistakes
// ---------------------------------------------------------------------------
{
  const vocab = [
    { id: "x_1", lemma: "uno", translation: "one" }, { id: "x_2", lemma: "dos", translation: "two" },
    { id: "x_3", lemma: "tres", translation: "three" }, { id: "x_4", lemma: "cuatro", translation: "four" },
    { id: "x_5", lemma: "cinco", translation: "five" },
  ];
  const now = Date.UTC(2026, 10, 8);
  const at = (h) => now - h * 3600000;
  const log = [
    { id: "x_1", t: "pick_meaning", ok: false, ts: at(50) }, { id: "x_1", t: "recall_write", ok: false, ts: at(40) },
    { id: "x_1", t: "dictation", ok: false, ts: at(30) },                                             // 3 misses
    { id: "x_2", t: "recall_write", ok: false, ts: at(20) },                                          // 1 miss, recent
    { id: "x_3", t: "recall_write", ok: false, ts: at(20) }, { id: "x_3", t: "recall_write", ok: true, ts: at(10) },   // put right from memory
    { id: "x_4", t: "pick_word", ok: false, ts: at(20) }, { id: "x_4", t: "pick_word", ok: true, ts: at(10) }, { id: "x_4", t: "pick_word", ok: true, ts: at(9) }, // two in a row
    { id: "x_5", t: "recall_write", ok: false, ts: at(24 * 40) },                                     // too old
    { id: "x_2", t: "recall_write", ok: true, ts: at(5), h: 1 },                                      // right with a hint: not put right
    { id: ["x_1", "x_2"], t: "dialogue", ok: false, ts: at(1) },                                      // a reply, not a word
    { id: "zz_9", t: "pick_word", ok: false, ts: at(1) },                                             // not in the pack
  ];
  const nb = mistakeNotebook(log, vocab, { now });
  const ids = nb.map((m) => m.item.id);
  check(JSON.stringify(ids) === JSON.stringify(["x_1", "x_2"]), `mistakes: expected x_1 then x_2, got ${JSON.stringify(ids)}`);
  check(nb[0]?.misses === 3 && nb[0].kinds.includes("writing what you heard") && nb[0].kinds.includes("writing it from memory"), `mistakes: x_1 counted and described: ${JSON.stringify(nb[0])}`);
  check(mistakeNotebook([], vocab, { now }).length === 0 && mistakeNotebook(undefined, vocab, { now }).length === 0, "mistakes: an empty log is an empty notebook");
}

console.log(`\n  teaching: ${checks} checks · spot-the-mistake built ${built} times · in ${withFix}/${lessons} word lessons · dictation in ${withDictation}/${lessons}`);
console.log(`  words able to carry spot-the-mistake: ${Object.entries(coverage).map(([c, n]) => `${c} ${n}`).join(", ")}`);
if (problems.length) {
  for (const p of [...new Set(problems)].slice(0, 30)) console.log(`    ✗ ${p}`);
  console.log(`\n  ✗ ${problems.length} problems\n`);
  process.exit(1);
}
console.log("\n  ✓ one word wrong, one word right, nothing ambiguous; dictation honest about what it is; mistakes stay until fixed\n");
