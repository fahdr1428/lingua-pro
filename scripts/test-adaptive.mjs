// =============================================================================
// test-adaptive.mjs (v117) — the course responds to the learner (adapt.js).
//
// In every language:
//   SECOND PASS
//   · due exactly when the lesson finished most recently is a word lesson whose
//     from-memory objective came back "not yet", some of its words still can't
//     be produced, it hasn't had (or been declined) one, and it is recent;
//   · not due when any one of those is false — including when a LATER lesson
//     went fine, so old lessons never pile up;
//   · the session is the words again, then each found, then each written,
//     every word found before any is written, each once; writing switched off
//     becomes saying; nothing but those words.
//   · through the engine: built only for the lesson it is due for, recorded
//     once finished or declined, and never offered again.
//   SKILL DRILLS
//   · only that skill's exercise types (a builder's fallback is left out), and
//     each type is evidence for that skill in skills.js;
//   · learned words only, none twice, weakest memory first, 4–8 exercises or
//     no drill at all; switched-off types never appear; listening only from
//     words that can be heard; writing and word drills exist in all 21.
//   FIND YOUR LEVEL
//   · chapters in order from the first, each big enough to judge;
//   · twelve questions: the chapter's own words, every unit represented, both
//     directions, four options with exactly one right, no word twice;
//   · the verdict over all 4,096 answer patterns: passed exactly when eleven
//     of twelve would be right, and it stops the moment that is settled;
//   · no easier than the chapter test for someone who half-knows a chapter;
//   · a pass means what the chapter test's pass means, and afterwards the
//     course's next lesson is past the chapter — conversation tasks included —
//     while the map still asks for the conversations to be practised.
//
// Each rule was checked against a deliberately broken copy of the code it
// guards (see the commit message).
// =============================================================================

import { allCodes, loadPack } from "./lib/inventory.mjs";
import {
  secondPass, buildSecondPass, SECOND_PASS_MAX, SECOND_PASS_DAYS,
  buildSkillDrill, availableDrills, drillTypes, DRILLS, DRILL_MIN, DRILL_SIZE,
  placementStages, probeQuestions, probeVerdict, placementOutcome, PROBE_SIZE, PROBE_PASS, PROBE_MIN_WORDS,
} from "../src/engine/adapt.js";
import { loadCourse } from "../src/engine/guided.js";
import { nextLesson, lessonSatisfied, OBJECTIVE } from "../src/engine/curriculum.js";
import { EXERCISE } from "../src/engine/generator.js";
import { SKILLS_OF } from "../src/engine/skills.js";
import { retrievability } from "../src/engine/srs.js";
import { canRecall } from "../src/engine/recall.js";
import { sameMeaning } from "../src/engine/games.js";
import { chapterVocabIds, withChapterPassed, UNITS_PER_CHAPTER, hasPassedChapter } from "../src/data/chapters.js";

let checks = 0;
const problems = [];
const check = (ok, msg) => { checks++; if (!ok) problems.push(msg); };
const DAY = 86400000;
const NOW = Date.UTC(2026, 10, 11);

function seeded(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// A word met but never produced / produced from memory.
const met = (daysAgo = 1) => ({ reps: 1, lapses: 0, stability: 1, difficulty: 5, lastReview: NOW - daysAgo * DAY, nextReview: NOW, lastRating: 3, recalls: 0 });
const owned = () => ({ ...met(), reps: 3, stability: 9, recalls: 1 });
const memEngine = async (code) => {
  const { Engine } = await import("../src/engine/Engine.js");
  const mem = new Map();
  const storage = { async get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; }, async set(k, v) { mem.set(k, JSON.stringify(v)); }, async keys() { return [...mem.keys()]; } };
  const e = new Engine(storage);
  e.pack = loadPack(code); e.languageCode = code;
  return { e, storage };
};

let lessonsTried = 0, drillsBuilt = 0, probes = 0;
const placeable = {};

for (const code of allCodes()) {
  const pack = loadPack(code);
  const pool = (pack.vocab || []).filter((v) => !v.custom);
  const byId = new Map(pool.map((v) => [v.id, v]));
  const course = await loadCourse(pack);

  // -------------------------------------------------------------------------
  // 1. Second pass
  // -------------------------------------------------------------------------
  const wordLessons = course.modules.flatMap((m) => m.lessons.filter((l) => l.kind !== "task").map((l) => ({ m, l })));
  const tasks = course.modules.flatMap((m) => m.lessons.filter((l) => l.kind === "task").map((l) => ({ m, l })));
  for (const { m, l } of wordLessons.slice(0, 6)) {
    lessonsTried++;
    const where = `${code} ${l.id}`;
    const recall = l.objectives.find((o) => o.type === OBJECTIVE.RECALL);
    check(!!recall, `${where}: a word lesson with no from-memory objective`);
    if (!recall) continue;
    const res = (status) => ({ [l.id]: { ts: NOW - 60000, objectives: { [recall.id]: { status, right: 0, of: l.items.length } } } });
    const progress = Object.fromEntries(l.items.map((id) => [id, met()]));
    const state = { done: { [l.id]: NOW - 60000 }, results: res("not-yet"), second: {} };

    const due = secondPass(course, state, progress, { now: NOW });
    check(!!due && due.lesson.id === l.id && due.module.id === m.id, `${where}: a lesson whose words didn't come from memory gets no second pass`);
    if (due) {
      check(due.ids.length === Math.min(l.items.length, SECOND_PASS_MAX) && due.ids.every((id) => l.items.includes(id)), `${where}: second pass words aren't the lesson's (${due.ids.length} of ${l.items.length})`);
    }
    // Each condition, removed one at a time.
    check(!secondPass(course, { ...state, results: res("met") }, progress, { now: NOW }), `${where}: second pass after the objective was MET`);
    check(!secondPass(course, { ...state, results: res("none") }, progress, { now: NOW }), `${where}: second pass with no from-memory evidence at all`);
    check(!secondPass(course, { ...state, results: {} }, progress, { now: NOW }), `${where}: second pass with no result saved`);
    check(!secondPass(course, state, Object.fromEntries(l.items.map((id) => [id, owned()])), { now: NOW }), `${where}: second pass when every word can already be produced`);
    check(!secondPass(course, { ...state, second: { [l.id]: { ts: NOW } } }, progress, { now: NOW }), `${where}: second pass offered twice`);
    check(!secondPass(course, { ...state, second: { [l.id]: { ts: NOW, declined: true } } }, progress, { now: NOW }), `${where}: second pass offered again after it was declined`);
    check(!secondPass(course, { ...state, done: { [l.id]: NOW - (SECOND_PASS_DAYS + 1) * DAY } }, progress, { now: NOW }), `${where}: second pass for a lesson finished ${SECOND_PASS_DAYS + 1} days ago`);
    check(!secondPass(course, { done: {}, results: {}, second: {} }, progress, { now: NOW }), `${where}: second pass for a lesson that was never finished`);
    // Only what's left: a word since produced is not in it.
    if (l.items.length > 1) {
      const some = { ...progress, [l.items[0]]: owned() };
      const part = secondPass(course, state, some, { now: NOW });
      check(!!part && !part.ids.includes(l.items[0]) && part.ids.length === Math.min(l.items.length - 1, SECOND_PASS_MAX), `${where}: second pass includes a word already produced from memory`);
    }
    // A later lesson went fine: the old one is not dug up.
    const later = wordLessons.find((x) => x.l.id !== l.id);
    if (later) {
      const lr = later.l.objectives.find((o) => o.type === OBJECTIVE.RECALL);
      const st2 = {
        done: { ...state.done, [later.l.id]: NOW - 1000 },
        results: { ...state.results, [later.l.id]: { ts: NOW, objectives: { [lr.id]: { status: "met" } } } },
        second: {},
      };
      check(!secondPass(course, st2, progress, { now: NOW }), `${where}: second pass dug up after a later lesson (${later.l.id}) went fine`);
    }
    // The most recent lesson is a conversation task: nothing to write again.
    if (tasks.length) {
      const st3 = { ...state, done: { ...state.done, [tasks[0].l.id]: NOW - 1000 } };
      check(!secondPass(course, st3, progress, { now: NOW }), `${where}: second pass offered after a conversation task`);
    }

    // The session.
    const s = buildSecondPass(pack, l, due?.ids || [], { progress, rand: seeded(lessonsTried) });
    check(!!s && s.mode === "second" && s.secondPass.lessonId === l.id, `${where}: no second-pass session`);
    if (s && due) {
      const [first, ...rest] = s.exercises;
      check(first.type === EXERCISE.INTRODUCE_BATCH && first.again === true && first.items.length === due.ids.length, `${where}: second pass doesn't open on the words again`);
      const finds = rest.filter((e) => e.pass === "find"), writes = rest.filter((e) => e.pass === "write");
      check(finds.length + writes.length === rest.length, `${where}: an exercise that is neither find nor write`);
      check(finds.every((e) => e.type === EXERCISE.PICK_WORD) && writes.every((e) => e.type === EXERCISE.RECALL_WRITE && !e.assess && e.cue !== "audio"), `${where}: wrong exercise types in the second pass`);
      const idsOf = (list) => list.map((e) => e.item.id).sort().join(",");
      const want = [...due.ids].sort().join(",");
      check(idsOf(finds) === want && idsOf(writes) === want, `${where}: every word should be found once and written once (find ${finds.length}, write ${writes.length}, words ${due.ids.length})`);
      const lastFind = Math.max(...rest.map((e, i) => (e.pass === "find" ? i : -1)));
      const firstWrite = rest.findIndex((e) => e.pass === "write");
      check(firstWrite < 0 || lastFind < firstWrite, `${where}: a word is written before every word has been found`);
      // Writing off: say it. Both off: only finding is left.
      const noWrite = buildSecondPass(pack, l, due.ids, { progress, disabled: [EXERCISE.RECALL_WRITE] });
      check(noWrite.exercises.filter((e) => e.pass === "write").every((e) => e.type === EXERCISE.SPEAK_PROMPT) && noWrite.exercises.some((e) => e.pass === "write"), `${where}: writing switched off, but the second pass still asks for it`);
      const neither = buildSecondPass(pack, l, due.ids, { progress, disabled: [EXERCISE.RECALL_WRITE, EXERCISE.SPEAK_PROMPT] });
      check(!neither.exercises.some((e) => e.pass === "write"), `${where}: writing and speaking both off, and one is still asked for`);
    }
    check(buildSecondPass(pack, l, [], { progress }) === null, `${where}: a second pass with no words`);
  }

  // -------------------------------------------------------------------------
  // 2. Skill drills
  // -------------------------------------------------------------------------
  const learnedWords = pool.slice(0, 60);
  const progress = Object.fromEntries(learnedWords.map((v, i) => [v.id, { ...met(1 + (i % 9)), reps: 2, stability: 1 + (i % 5) }]));
  const learnedIds = new Set(learnedWords.map((v) => v.id));
  for (const skill of Object.keys(DRILLS)) {
    const where = `${code} ${skill} drill`;
    const types = drillTypes(skill);
    for (const t of types) check((SKILLS_OF[t] || []).includes(skill), `${where}: ${t} is in the drill but is not evidence for ${skill} in skills.js`);
    const d = buildSkillDrill(skill, pack, progress, { canHear: () => true, rand: seeded(7) });
    if (!d) continue;
    drillsBuilt++;
    const ex = d.exercises;
    check(d.mode === "skill" && d.skill === skill, `${where}: not labelled as its skill`);
    check(ex.length >= DRILL_MIN && ex.length <= DRILL_SIZE, `${where}: ${ex.length} exercises`);
    check(ex.every((e) => types.includes(e.logAs || e.type)), `${where}: an exercise of another kind: ${[...new Set(ex.map((e) => e.logAs || e.type))].join(", ")}`);
    check(ex.every((e) => learnedIds.has(e.item.id)), `${where}: a word the learner hasn't met`);
    check(new Set(ex.map((e) => e.item.id)).size === ex.length, `${where}: the same word twice`);
    const rs = ex.map((e) => retrievability(progress[e.item.id]));
    check(rs.every((r, i) => i === 0 || r >= rs[i - 1] - 1e-9), `${where}: not weakest memory first`);
    // A switched-off type never appears; and with them all off there is no drill.
    for (const t of types) {
      const offType = t === "dictation" ? EXERCISE.RECALL_WRITE : t;
      const without = buildSkillDrill(skill, pack, progress, { canHear: () => true, disabled: [offType] });
      if (without) check(!without.exercises.some((e) => (e.logAs || e.type) === t || e.type === offType), `${where}: ${offType} is switched off and still appears`);
    }
    const allOff = types.map((t) => (t === "dictation" ? EXERCISE.RECALL_WRITE : t));
    check(buildSkillDrill(skill, pack, progress, { canHear: () => true, disabled: allOff }) === null, `${where}: a drill made of types the learner switched off`);
  }
  check(buildSkillDrill("listening", pack, progress, {}) === null, `${code}: a listening drill with no way to hear`);
  check(buildSkillDrill("listening", pack, progress, { canHear: () => false }) === null, `${code}: a listening drill from words that can't be heard`);
  check(buildSkillDrill("writing", pack, {}, { canHear: () => true }) === null, `${code}: a drill for a learner with no words`);
  const three = Object.fromEntries(learnedWords.slice(0, DRILL_MIN - 1).map((v) => [v.id, progress[v.id]]));
  check(buildSkillDrill("writing", pack, three, {}) === null, `${code}: a ${DRILL_MIN - 1}-question drill`);
  check(buildSkillDrill("speaking", pack, progress, {}) === null && buildSkillDrill("nonsense", pack, progress, {}) === null, `${code}: a drill for a skill that has none`);
  const avail = availableDrills(pack, progress, { canHear: () => true });
  check(avail.includes("writing") && avail.includes("vocabulary"), `${code}: writing and word drills should always be available with 60 words (got ${avail.join(", ")})`);
  placeable[code] = placementStages(pack).length;

  // -------------------------------------------------------------------------
  // 3. Find your level
  // -------------------------------------------------------------------------
  const stages = placementStages(pack);
  check(stages.every((s, i) => s.num === i + 1), `${code}: placement chapters aren't 1, 2, 3… in order: ${stages.map((s) => s.num)}`);
  for (const st of stages) {
    const where = `${code} chapter ${st.num}`;
    check(st.ids.length >= PROBE_MIN_WORDS && PROBE_MIN_WORDS > PROBE_SIZE && st.ids.join() === chapterVocabIds(pack.vocab, st.num).join(), `${where}: not the chapter's own words, or too few to judge (${st.ids.length})`);
    const units = new Set(st.ids.map((id) => byId.get(id)?.unit).filter(Boolean));
    for (const seed of [st.num, st.num + 101, st.num + 977]) {
      probes++;
      const qs = probeQuestions(st, pack, seeded(seed));
      check(qs.length === PROBE_SIZE, `${where}: ${qs.length} questions`);
      check(new Set(qs.map((q) => q.item.id)).size === qs.length, `${where}: a word asked twice`);
      check(qs.every((q) => st.ids.includes(q.item.id)), `${where}: a question about another chapter's word`);
      check(qs.filter((q) => q.dir === "meaning").length === PROBE_SIZE / 2 && qs.filter((q) => q.dir === "word").length === PROBE_SIZE / 2, `${where}: not half in each direction`);
      check(new Set(qs.map((q) => q.item.unit)).size === units.size, `${where}: only ${new Set(qs.map((q) => q.item.unit)).size} of ${units.size} units asked about`);
      for (const q of qs) {
        const right = q.dir === "meaning" ? q.item.translation : q.item.lemma;
        check(q.answer === right && q.options.length === 4 && q.options.filter((o) => o === q.answer).length === 1 && new Set(q.options).size === 4, `${where} ${q.item.id}: not four options with one right`);
        if (q.dir === "meaning") {
          for (const o of q.options) if (o !== q.answer) check(!sameMeaning(o, q.answer), `${where} ${q.item.id}: wrong option "${o}" means the same as "${q.answer}"`);
        }
      }
    }
  }

  // After passing chapter 1 by test: the course's next lesson is past it.
  if (stages.length) {
    const { e } = await memEngine(code);
    const st = stages[0];
    await e.seedKnown(st.ids);
    const beforeSkip = nextLesson(course, await e.getCourseState(), await e.getProgress());
    await e.skipKnownModules(st.ids);
    const state = await e.getCourseState();
    const nx = nextLesson(course, state, await e.getProgress());
    check(!nx || nx.module.index >= UNITS_PER_CHAPTER, `${code}: after passing Chapter 1 by test the next lesson is still in it (${nx?.lesson.id})`);
    const ch1Tasks = course.modules.slice(0, UNITS_PER_CHAPTER).flatMap((m) => m.lessons.filter((l) => l.kind === "task"));
    if (ch1Tasks.length) {
      check(beforeSkip && beforeSkip.module.index < UNITS_PER_CHAPTER, `${code}: (control) without skipKnownModules the course should still be held in Chapter 1`);
      check(ch1Tasks.every((l) => !state.done[l.id] && !state.exchanges[l.stop]), `${code}: a skipped conversation is recorded as done or practised`);
    }
    // A second language's lessons are untouched, and nothing outside the chapter is skipped.
    const outside = course.modules.slice(UNITS_PER_CHAPTER).flatMap((m) => m.lessons);
    check(outside.every((l) => !state.skipped[l.id]), `${code}: a lesson outside Chapter 1 was skipped`);
    check(course.modules.slice(0, UNITS_PER_CHAPTER).every((m) => m.lessons.every((l) => lessonSatisfied(l, state, {}) )), `${code}: a Chapter 1 lesson is not behind the learner after the pass`);
  }
}

// ---------------------------------------------------------------------------
// 4. Second pass through the engine (three scripts)
// ---------------------------------------------------------------------------
for (const code of ["es", "ur", "zh"]) {
  const { e, storage } = await memEngine(code);
  const course = await loadCourse(e.pack);
  const l = course.modules[0].lessons.find((x) => x.kind !== "task");
  const other = course.modules[1].lessons.find((x) => x.kind !== "task");
  const recall = l.objectives.find((o) => o.type === OBJECTIVE.RECALL);
  await storage.set("progress", { [code]: Object.fromEntries(l.items.map((id) => [id, { ...met(0), lastReview: Date.now() - 1000 }])) });
  await e.saveLessonResult(l.id, { objectives: { [recall.id]: { status: "not-yet", right: 0, of: l.items.length } } });
  const s = await e.generateSession({ mode: "second", filter: { lesson: l.id } });
  check(s.mode === "second" && s.exercises.length === 1 + 2 * Math.min(l.items.length, SECOND_PASS_MAX), `${code}: engine second pass has ${s.exercises.length} steps for ${l.items.length} words`);
  const wrong = await e.generateSession({ mode: "second", filter: { lesson: other.id } });
  check(wrong.exercises.length === 0, `${code}: a second pass was built for a lesson it isn't due for`);
  // Writing each word from memory is what ends the need for it.
  for (const ex of s.exercises.filter((x) => x.pass === "write")) await e.submitAnswer(ex, { text: ex.answer });
  check(l.items.slice(0, SECOND_PASS_MAX).every(async (id) => canRecall((await e.getProgress())[id])), `${code}: words written in the second pass`);
  const prog = await e.getProgress();
  check(l.items.slice(0, SECOND_PASS_MAX).every((id) => canRecall(prog[id])), `${code}: a word written from memory in the second pass still can't be recalled`);
  await e.saveSecondPass(l.id);
  const st = await e.getCourseState();
  check(!!st.second[l.id] && !st.second[l.id].declined, `${code}: the finished second pass wasn't recorded`);
  check(!secondPass(course, st, await e.getProgress()), `${code}: second pass offered again after it was done`);
  check((await e.generateSession({ mode: "second", filter: { lesson: l.id } })).exercises.length === 0, `${code}: a finished second pass can be started again`);
  // Declining records it too.
  const { e: e2, storage: s2 } = await memEngine(code);
  await s2.set("progress", { [code]: Object.fromEntries(l.items.map((id) => [id, { ...met(0), lastReview: Date.now() - 1000 }])) });
  await e2.saveLessonResult(l.id, { objectives: { [recall.id]: { status: "not-yet" } } });
  check(!!secondPass(course, await e2.getCourseState(), await e2.getProgress()), `${code}: (control) second pass should be due before declining`);
  await e2.saveSecondPass(l.id, { declined: true });
  const st2 = await e2.getCourseState();
  check(st2.second[l.id]?.declined === true && !secondPass(course, st2, await e2.getProgress()), `${code}: a declined second pass is offered again`);
  // A drill through the engine is that skill's drill, or nothing.
  const { e: e3, storage: s3 } = await memEngine(code);
  await s3.set("progress", { [code]: Object.fromEntries(e3.pack.vocab.slice(0, 40).map((v) => [v.id, { ...met(2), lastReview: Date.now() - 2 * DAY }])) });
  const drill = await e3.generateSession({ mode: "skill", filter: { skill: "writing" }, sessionSize: 6 });
  check(drill.mode === "skill" && drill.exercises.length === 6 && drill.exercises.every((x) => x.type === EXERCISE.RECALL_WRITE), `${code}: engine writing drill: ${drill.exercises.length} × ${[...new Set(drill.exercises.map((x) => x.type))]}`);
  const none = await e3.generateSession({ mode: "skill", filter: { skill: "listening" } });
  check(none.mode === "skill" && none.exercises.length === 0, `${code}: a listening drill with nothing to hear became some other lesson (${none.exercises.length} exercises)`);
}

// ---------------------------------------------------------------------------
// 5. The probe's verdict, over every answer pattern
// ---------------------------------------------------------------------------
{
  let stoppedEarly = 0;
  for (let mask = 0; mask < 1 << PROBE_SIZE; mask++) {
    const full = Array.from({ length: PROBE_SIZE }, (_, i) => !!(mask & (1 << i)));
    const wouldPass = full.filter(Boolean).length >= PROBE_PASS;
    let verdict = "asking", asked = 0;
    while (verdict === "asking" && asked < PROBE_SIZE) { asked++; verdict = probeVerdict(full.slice(0, asked)); }
    check(verdict !== "asking", `verdict: still asking after ${asked} answers (${mask.toString(2)})`);
    check((verdict === "passed") === wouldPass, `verdict: ${verdict} for ${full.filter(Boolean).length} of ${PROBE_SIZE} right (${mask.toString(2)})`);
    // It stopped the moment the result was settled, and not before.
    const settledAt = (() => {
      for (let n = 1; n <= PROBE_SIZE; n++) {
        const r = full.slice(0, n).filter(Boolean).length, w = n - r;
        if (w > PROBE_SIZE - PROBE_PASS || r >= PROBE_PASS) return n;
      }
      return PROBE_SIZE;
    })();
    check(asked === settledAt, `verdict: asked ${asked} questions, settled at ${settledAt} (${mask.toString(2)})`);
    if (asked < PROBE_SIZE) stoppedEarly++;
  }
  check(probeVerdict([]) === "asking" && probeVerdict([false, false]) === "failed" && probeVerdict([false]) === "asking", "verdict: a beginner is settled by the second miss, not before");
  check(stoppedEarly > 0, "verdict: never stops early");

  // No easier than the chapter test (14 questions, 85%) for a half-knower.
  const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  const pAtLeast = (n, k, p) => { let s = 0; for (let i = k; i <= n; i++) s += C(n, i) * p ** i * (1 - p) ** (n - i); return s; };
  for (const p of [0.5, 0.6, 0.7, 0.75]) {
    const probe = pAtLeast(PROBE_SIZE, PROBE_PASS, p), chapter = pAtLeast(14, Math.ceil(0.85 * 14), p);
    check(probe <= chapter + 1e-9, `placement is easier than the chapter test for someone who knows ${p * 100}% (${(probe * 100).toFixed(1)}% vs ${(chapter * 100).toFixed(1)}%)`);
  }
  check(pAtLeast(PROBE_SIZE, PROBE_PASS, 0.25) < 0.0001, "placement can be passed by guessing");

  const stages = [{ num: 1, ids: ["a", "b"] }, { num: 2, ids: ["c"] }, { num: 3, ids: ["d", "e", "f"] }];
  const o0 = placementOutcome(stages, 0), o2 = placementOutcome(stages, 2), o3 = placementOutcome(stages, 3), o9 = placementOutcome(stages, 9);
  check(o0.start?.num === 1 && o0.skippedWords === 0, "outcome: nothing passed starts at chapter 1");
  check(o2.start?.num === 3 && o2.skippedWords === 3, "outcome: two passed starts at chapter 3");
  check(o3.start === null && o3.skippedWords === 6 && o9.passed === 3, "outcome: everything passed has no chapter to start at");
}

// ---------------------------------------------------------------------------
// 6. What a chapter pass does to the saved state (shared with the chapter test)
// ---------------------------------------------------------------------------
{
  const before = { theme: "ink", testedOut: { ur: ["ur_0001"], es: ["es_0009"] }, chaptersPassed: { es: [1] } };
  const frozen = JSON.stringify(before);
  const after = withChapterPassed(before, "ur", 2, ["ur_0001", "ur_0050"]);
  check(JSON.stringify(before) === frozen, "chapter pass: the saved state was changed in place");
  check(JSON.stringify(after.chaptersPassed.ur) === "[1,2]" && hasPassedChapter(after, "ur", 1) && hasPassedChapter(after, "ur", 2) && !hasPassedChapter(after, "ur", 3), `chapter pass: passing chapter 2 should open 1 and 2: ${JSON.stringify(after.chaptersPassed)}`);
  check(JSON.stringify(after.testedOut.ur) === '["ur_0001","ur_0050"]', `chapter pass: tested-out words ${JSON.stringify(after.testedOut.ur)}`);
  check(JSON.stringify(after.testedOut.es) === '["es_0009"]' && JSON.stringify(after.chaptersPassed.es) === "[1]" && after.theme === "ink", "chapter pass: another language, or another setting, was touched");
  const fresh = withChapterPassed(undefined, "ta", 1, ["ta_0001"]);
  check(JSON.stringify(fresh.chaptersPassed) === '{"ta":[1]}', "chapter pass: an empty save");
}

for (const [code, n] of Object.entries(placeable)) check(n >= 2, `${code}: only ${n} chapter(s) can be placed`);
console.log(`  placeable chapters: ${Object.entries(placeable).map(([c, n]) => `${c} ${n}`).join(", ")}`);
console.log(`\n  adaptive: ${checks} checks · second pass on ${lessonsTried} lessons · ${drillsBuilt} drills built · ${probes} placement probes · every answer pattern`);
if (problems.length) {
  for (const p of [...new Set(problems)].slice(0, 30)) console.log(`    ✗ ${p}`);
  console.log(`\n  ✗ ${problems.length} problems\n`);
  process.exit(1);
}
console.log("\n  ✓ a bad lesson gets a second pass once, a drill is its skill and nothing else, placement is fair and moves the course on\n");
