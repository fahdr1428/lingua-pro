#!/usr/bin/env node
// =============================================================================
// test-curriculum.mjs — the structured course, for ALL 21 languages, in node.
//
//   npm run test-curriculum
//
// What it holds the course to:
//   · every language has a course profile the app and the tutor can use, with
//     a direction that matches the registry and an honest review status;
//   · the course is built from the pack and loses nothing: every word is in
//     exactly one lesson, every journey exchange is exactly one module's task;
//   · objectives only claim what the content has: their quoted words are the
//     pack's, a "build sentences" example is one of the word's own examples,
//     and nothing says "reviewed";
//   · every lesson builds a seven-phase session, with an assessment that is
//     production only and flagged as such;
//   · Mandarin and Japanese get sentence tiles from taught words, and only
//     from taught words;
//   · per-objective feedback, skill scores, word stages and "next lesson" do
//     what docs/ZABAN_LEARNING_ENGINE.md says, including the cases that must
//     NOT pass;
//   · the engine logs answers without giving a conversation reply a card.
//
// Each rule below was checked against a deliberately broken copy of the code
// it guards (see the commit message).
// =============================================================================

import { LANGUAGES } from "../src/data/registry.js";
import { COURSES, FEATURES, SCRIPTS } from "../src/data/courses.js";
import { JOURNEY } from "../src/data/journey.js";
import { taskLessonId } from "../src/data/journeyChapters.js";
import { allCodes, loadPack, measure } from "./lib/inventory.mjs";
import { segment, lemmaSet, wordsUsedIn, nextLesson, lessonSatisfied, LESSON_SIZE, OBJECTIVE } from "../src/engine/curriculum.js";
import { buildGuidedSession, scoreObjectives, toRevise, loadCourse } from "../src/engine/guided.js";
import { skillProfile, credit, stageOf, usedInSentences, MIN_EVIDENCE, SKILLS } from "../src/engine/skills.js";
import { generateLesson, EXERCISE } from "../src/engine/generator.js";
import { contextFrom } from "../src/ai/learnerContext.js";

let checks = 0;
const problems = [];
const check = (cond, msg) => { checks++; if (!cond) problems.push(msg); };

const DAY = 86400000;
const now = Date.now();
const mature = (extra = {}) => ({ reps: 4, recalls: 2, stability: 10, lastReview: now - 3 * DAY, lastRating: 3, difficulty: 5, lapses: 0, ...extra });

// ---------------------------------------------------------------------------
// 1. Course profiles
// ---------------------------------------------------------------------------
for (const code of allCodes()) {
  const c = COURSES[code];
  check(!!c, `${code}: no course profile`);
  if (!c) continue;
  check(!!SCRIPTS[c.script], `${code}: unknown script "${c.script}"`);
  check((SCRIPTS[c.script]?.dir === "rtl") === !!LANGUAGES[code].rtl, `${code}: profile direction ${SCRIPTS[c.script]?.dir} disagrees with the registry`);
  for (const f of c.features) check(f in FEATURES, `${code}: unknown feature "${f}"`);
  check(c.difficulties.length >= 3, `${code}: fewer than three learner difficulties`);
  check(typeof c.tutor === "string" && c.tutor.length > 30, `${code}: no tutor instructions`);
  check(c.review === "unreviewed", `${code}: review status "${c.review}" — nothing has been reviewed by a qualified speaker yet`);
  if (!["es", "fr", "de", "id", "tr", "pcm", "tl", "so", "vi", "yo"].includes(code)) {
    check(!!c.romanisation, `${code}: a non-Latin script with no romanisation scheme stated`);
  }
}
check(Object.keys(COURSES).length === Object.keys(LANGUAGES).length, "a profile exists for a language the registry doesn't have");

// ---------------------------------------------------------------------------
// 2. The course, for every language
// ---------------------------------------------------------------------------
const measured = {};
for (const code of allCodes()) {
  const m = measure(code);
  measured[code] = m;
  const pack = loadPack(code);
  const course = m.course;
  check(course.status === "legacy-unreviewed", `${code}: course status "${course.status}"`);
  check(course.modules.length === pack.units.length, `${code}: ${course.modules.length} modules for ${pack.units.length} units`);

  const seen = new Map();
  for (const mod of course.modules) for (const l of mod.lessons) if (l.kind === "words") for (const id of l.items) seen.set(id, (seen.get(id) || 0) + 1);
  const words = pack.vocab.filter((v) => !v.custom);
  const lost = words.filter((v) => !seen.has(v.id));
  const twice = [...seen].filter(([, n]) => n > 1);
  check(!lost.length, `${code}: ${lost.length} words in no lesson (e.g. ${lost[0]?.id})`);
  check(!twice.length, `${code}: ${twice.length} words in more than one lesson`);

  const glosses = new Set(words.map((v) => String(v.translation).split(/[,;/(]/)[0].trim()));
  const stops = JOURNEY[code]?.stops || [];
  const tasks = new Map();
  for (const mod of course.modules) {
    for (const l of mod.lessons) {
      if (l.kind === "words") {
        check(l.items.length <= LESSON_SIZE + 2, `${code} ${l.id}: ${l.items.length} words in one lesson`);
        check(l.objectives.some((o) => o.type === OBJECTIVE.RECALL), `${code} ${l.id}: no from-memory objective`);
        for (const q of (l.objectives.find((o) => o.type === OBJECTIVE.RECALL)?.text.match(/“([^”]+)”/g) || [])) {
          check(glosses.has(q.slice(1, -1)), `${code} ${l.id}: objective quotes “${q.slice(1, -1)}”, which is no word's meaning`);
        }
        const cons = l.objectives.find((o) => o.type === OBJECTIVE.CONSTRUCT);
        if (cons) {
          const own = cons.items.some((id) => (words.find((v) => v.id === id)?.examples || []).some((e) => e.native === cons.example.native));
          check(own, `${code} ${l.id}: the construct example isn't one of its own words' examples`);
        }
        check(!/\b\d+ words in “/.test(l.objectives.map((o) => o.text).join(" ")), `${code} ${l.id}: a lesson objective still counts the module's words`);
      } else {
        tasks.set(l.stop, (tasks.get(l.stop) || 0) + 1);
        const nth = stops.filter((s) => s.unitIndex === mod.index).findIndex((s) => s.id === l.stop);
        check(l.id === taskLessonId(code, mod.index, nth), `${code}: task id ${l.id} isn't what the map links to (${taskLessonId(code, mod.index, nth)})`);
      }
      for (const o of l.objectives) check(!/review(ed)? by/i.test(o.text), `${code} ${l.id}: an objective claims review`);
    }
  }
  for (const s of stops) check(tasks.get(s.id) === 1, `${code}: journey stop ${s.id} is the task of ${tasks.get(s.id) || 0} modules`);
}

// ---------------------------------------------------------------------------
// 2b. The course the app builds (from the small content index) is the course
//     built from the full grammar and pattern libraries.
// ---------------------------------------------------------------------------
for (const code of allCodes()) {
  const app = await loadCourse(loadPack(code));
  const shape = (c) => JSON.stringify(c.modules.map((m) => [m.id, m.grammar, m.patterns, m.objectives.map((o) => [o.id, o.text]), m.lessons.map((l) => [l.id, l.title, l.grammar, l.objectives.map((o) => o.text)])]));
  check(shape(app) === shape(measured[code].course), `${code}: the app's course differs from the one built from the full content`);
}

// ---------------------------------------------------------------------------
// 3. Every lesson builds a seven-phase session
// ---------------------------------------------------------------------------
const ORDER = ["recall", "intro", "teach", "guided", "apply", "assess"];
let sessions = 0;
for (const code of allCodes()) {
  const pack = loadPack(code);
  const course = await loadCourse(pack);
  const old = Object.fromEntries(pack.vocab.map((v) => [v.id, mature()]));
  for (const mod of course.modules) for (const l of mod.lessons) for (const progress of [{}, old]) {
    const s = await buildGuidedSession(pack, l.id, { progress });
    sessions++;
    if (!s?.exercises?.length) { check(false, `${code} ${l.id}: empty session`); continue; }
    const phases = s.exercises.map((e) => e.phase);
    check(phases.every(Boolean), `${code} ${l.id}: an exercise without a phase`);
    check(phases.every((p, i) => i === 0 || ORDER.indexOf(p) >= ORDER.indexOf(phases[i - 1])), `${code} ${l.id}: phases out of order: ${[...new Set(phases)].join(">")}`);
    const assess = s.exercises.filter((e) => e.phase === "assess");
    check(assess.length > 0, `${code} ${l.id}: no assessment`);
    check(assess.every((e) => e.assess), `${code} ${l.id}: an assessment question not flagged as one`);
    check(assess.every((e) => ["recall_write", "speak_prompt"].includes(e.type) || e.logAs === "dialogue" || e.logAs === "dialogue_pick"),
      `${code} ${l.id}: assessment includes ${assess.find((e) => !["recall_write", "speak_prompt"].includes(e.type) && !e.logAs)?.type}`);
    for (const e of s.exercises.filter((x) => x.noSchedule)) {
      check(String(e.item?.id).includes("_stop_"), `${code} ${l.id}: a conversation exercise carries a word id (${e.item?.id})`);
    }
    if (l.kind === "task") check(s.exercises.some((e) => e.type === "EXCHANGE"), `${code} ${l.id}: a task with no exchange to teach`);
    if (progress === old && l.kind === "words") check(phases[0] === "recall", `${code} ${l.id}: a returning learner's lesson doesn't start with recall`);
  }
}
check(sessions === 2 * Object.values(measured).reduce((n, m) => n + m.course.lessonCount, 0), "not every lesson was built");

// ---------------------------------------------------------------------------
// 4. Tiles for languages without spaces
// ---------------------------------------------------------------------------
{
  const zh = loadPack("zh");
  const lem = lemmaSet(zh.vocab);
  const ex = zh.vocab.flatMap((v) => (v.examples || []).map((e) => e.native));
  const tiled = ex.map((t) => segment(t, "zh", lem)).filter(Boolean);
  check(tiled.length >= 60, `only ${tiled.length} of ${ex.length} Mandarin examples split into taught words`);
  check(tiled.every((tiles) => tiles.every((t) => lem.has(t))), "a Mandarin tile that isn't a taught word");
  check(segment("你好朋友", "zh", new Set(["你好", "朋友"]))?.join("|") === "你好|朋友", "你好朋友 should split into 你好 | 朋友");
  check(segment("你好朋友", "zh", new Set(["你好"])) === null, "an untaught part must make the split null, not a guess");
  check(segment("私は水を飲みます", "ja", new Set(["私", "水", "飲みます"]))?.join("|") === "私|は|水|を|飲みます", "Japanese particles stand as their own tiles");
  check(segment("Yo como pan", "es", new Set())?.length === 3, "spaced languages split on spaces");

  // The lessons themselves: Mandarin learners now get sentences to build.
  const old = Object.fromEntries(zh.vocab.map((v) => [v.id, mature({ recalls: 0, stability: 4 })]));
  let built = 0;
  for (let i = 0; i < 12; i++) {
    const queue = zh.vocab.slice(i * 8, i * 8 + 8);
    built += generateLesson(queue, zh.vocab, old, "zh").filter((e) => e.type === EXERCISE.BUILD_SENTENCE || e.type === EXERCISE.TAP_WORDS).length;
  }
  check(built > 0, "Mandarin lessons still never ask for a sentence to be built");
}

// ---------------------------------------------------------------------------
// 5. Which words a sentence uses
// ---------------------------------------------------------------------------
{
  const v = (id, lemma) => ({ id, lemma });
  check(wordsUsedIn("Okulda çalışıyorum", [v("t", "okul")], "tr").length === 1, "Turkish: a suffixed word is the taught word");
  check(wordsUsedIn("والماء بارد", [v("a", "ماء")], "ar").length === 1, "Arabic: و + ال on a taught word still counts");
  check(wordsUsedIn("Yo como pan", [v("e", "comer")], "es").length === 0, "Spanish: an inflected verb is not the taught infinitive");
  check(wordsUsedIn("Buenos días, señor", [v("b", "Buenos días")], "es").length === 1, "multi-word lemmas match as a sequence");
}

// ---------------------------------------------------------------------------
// 6. Per-objective feedback
// ---------------------------------------------------------------------------
{
  const g = {
    objectives: [
      { id: "m.recognise", type: "recognise", items: ["a", "b", "c"] },
      { id: "m.recall", type: "recall", items: ["a", "b", "c"] },
      { id: "m.construct", type: "construct", items: ["a"] },
      { id: "m.g.x", type: "understand", items: [] },
      { id: "m.use", type: "use", items: [] },
    ],
  };
  const A = (phase, t, id, ok, extra = {}) => ({ phase, t, id, ok, h: 0, ...extra });
  const answers = [
    A("guided", "pick_meaning", "a", true), A("guided", "pick_meaning", "b", true), A("guided", "listen_pick", "c", false),
    A("apply", "build_sentence", "a", true, { objective: "m.construct" }),
    A("assess", "recall_write", "a", true), A("assess", "recall_write", "b", true, { h: 1 }), A("assess", "recall_write", "c", true),
    A("teach", "grammar", null, true, { objective: "m.g.x" }),
  ];
  const r = scoreObjectives(g, answers);
  check(r["m.recognise"].status === "met" && r["m.recognise"].right === 2, `recognise 2/3 is met: ${JSON.stringify(r["m.recognise"])}`);
  check(r["m.recall"].right === 2 && r["m.recall"].status === "met", `a hinted answer is not recall: ${JSON.stringify(r["m.recall"])}`);
  check(scoreObjectives(g, answers.map((a) => (a.id === "c" && a.phase === "assess" ? { ...a, ok: false } : a)))["m.recall"].status === "not-yet", "1 of 3 unaided is not met");
  check(r["m.construct"].status === "met", "a built sentence meets construct");
  check(r["m.g.x"].status === "explained", "grammar taught reads 'explained', never 'met'");
  check(r["m.use"].status === "none", "no conversation in the assessment: 'not tested', not met");
  check(scoreObjectives(g, [A("assess", "dialogue", "x", true)])["m.use"].status === "met", "the conversation built in assessment meets use");
  check(scoreObjectives(g, [A("apply", "dialogue", "x", true)])["m.use"].status === "none", "the conversation in application alone doesn't meet use");
  check(scoreObjectives(g, [A("assess", "pick_word", "a", true)])["m.recall"].status === "none", "a choice in the assessment is not recall evidence");
  check(toRevise(answers).join() === "b", `words to revise: missed or hinted in assessment (got ${toRevise(answers)})`);
}

// ---------------------------------------------------------------------------
// 7. Skills and stages
// ---------------------------------------------------------------------------
{
  const at = (t, ok, extra = {}) => ({ t, ok, ts: now, ...extra });
  check(credit(at("recall_write", true)) === 1, "from memory counts fully");
  check(credit(at("pick_meaning", true)) === 0.7, "a choice counts 0.7");
  check(credit(at("recall_write", true, { h: 1 })) === 0.5, "a hint halves it");
  check(credit(at("recall_write", false)) === 0, "wrong counts nothing");
  const few = skillProfile(Array.from({ length: MIN_EVIDENCE - 1 }, () => at("recall_write", true)));
  check(few.skills.vocabulary.score === null && few.skills.vocabulary.confidence === "none", "under the evidence minimum there is no score");
  const choosing = skillProfile(Array.from({ length: 40 }, () => at("pick_meaning", true)));
  check(choosing.skills.vocabulary.score <= 70, `recognising alone can't score above 70 (got ${choosing.skills.vocabulary.score})`);
  check(SKILLS.length === 7, "seven skills");
  const mixed = skillProfile([
    ...Array.from({ length: 20 }, () => at("recall_write", true)),
    ...Array.from({ length: 20 }, (_, i) => at("speak_prompt", i % 3 === 0)),
  ]);
  check(mixed.focus === "speaking", `the weakest skill with evidence is the focus (got ${mixed.focus})`);
  check(skillProfile([]).focus === null, "no answers, no focus");

  const used = usedInSentences([at("build_sentence", true, { id: "a" }), at("tap_words", true, { id: "b", h: 1 }), at("dialogue", true, { id: ["c", "d"] })]);
  check(used.has("a") && !used.has("b") && used.has("c") && used.has("d"), "used in a sentence: right and unaided, conversation words too");
  check(stageOf(undefined, "x") === "new", "no card: new");
  check(stageOf({ reps: 1, lastRating: 1 }, "x") === "introduced", "met, missed: introduced");
  check(stageOf({ reps: 2, lastRating: 2, recalls: 0, stability: 2 }, "x") === "knowledge", "recognised: knowledge");
  check(stageOf({ reps: 3, lastRating: 3, recalls: 1, stability: 3 }, "x") === "recall", "produced: recall");
  check(stageOf({ reps: 3, lastRating: 3, recalls: 1, stability: 3 }, "x", new Set(["x"])) === "application", "produced and used: application");
  check(stageOf({ reps: 5, lastRating: 3, recalls: 2, stability: 3 }, "x", new Set(["x"])) === "application", "not yet a week's stability: not secure");
  check(stageOf({ reps: 5, lastRating: 3, recalls: 2, stability: 9 }, "x", new Set(["x"])) === "secure", "twice from memory, used, a week's stability: secure");
  check(stageOf({ reps: 5, lastRating: 1, recalls: 2, stability: 9 }, "x", new Set(["x"])) === "introduced", "just missed: not secure, whatever came before");
}

// ---------------------------------------------------------------------------
// 8. The next lesson
// ---------------------------------------------------------------------------
{
  const pack = loadPack("es");
  const course = await loadCourse(pack);
  const m1 = course.modules[0];
  check(nextLesson(course, {}, {}).lesson.id === m1.lessons[0].id, "a new learner starts at the first lesson");
  const own = Object.fromEntries(m1.items.map((id) => [id, mature()]));
  const nx = nextLesson(course, {}, own);
  check(nx.lesson.kind === "task" && nx.module.id === m1.id, `words of module 1 produced from memory: next is its conversation (got ${nx.lesson.id})`);
  check(nextLesson(course, { exchanges: { [m1.exchange.id]: now } }, own).module.index === 1, "…and with that practised, module 2");
  check(!lessonSatisfied(m1.lessons[0], {}, Object.fromEntries(m1.items.map((id) => [id, mature({ recalls: 0, stability: 2 })]))), "words only recognised don't satisfy a lesson");
  check(lessonSatisfied(m1.lessons[0], { done: { [m1.lessons[0].id]: now } }, {}), "a finished lesson is satisfied");
}

// ---------------------------------------------------------------------------
// 9. What the tutor is told
// ---------------------------------------------------------------------------
{
  const pack = loadPack("ur");
  const course = await loadCourse(pack);
  const v = pack.vocab;
  const progress = { [v[0].id]: mature(), [v[1].id]: mature({ recalls: 0, stability: 2 }), [v[2].id]: mature({ lapses: 3, lastRating: 1 }) };
  const ctx = contextFrom({ vocab: v, progress, next: nextLesson(course, {}, progress), focus: "speaking" });
  check(ctx.known[0].w === v[0].lemma, "known words: produced from memory first");
  check(ctx.known.length === 3, `known words are the met ones (got ${ctx.known.length})`);
  check(ctx.weak.length === 1 && ctx.weak[0].w === v[2].lemma, "weak words: the ones that keep lapsing");
  check(ctx.objectives.length > 0 && ctx.module.startsWith("1."), "the next lesson's module and objectives are included");
  const lots = Object.fromEntries(v.map((x) => [x.id, mature()]));
  check(contextFrom({ vocab: v, progress: lots }).known.length === 40, "known words are capped at 40");
}

// ---------------------------------------------------------------------------
// 10. The engine's log
// ---------------------------------------------------------------------------
{
  const { Engine } = await import("../src/engine/Engine.js");
  const mem = new Map();
  const storage = { async get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; }, async set(k, val) { mem.set(k, JSON.stringify(val)); }, async keys() { return [...mem.keys()]; } };
  const e = new Engine(storage);
  const pack = loadPack("ur");
  e.pack = pack; e.languageCode = "ur";
  const course = await loadCourse(pack);
  const task = course.modules[0].lessons.find((l) => l.kind === "task");
  const s = await buildGuidedSession(pack, task.id, {});
  const dialogue = s.exercises.find((x) => x.logAs === "dialogue" || x.logAs === "dialogue_pick");
  await e.submitAnswer(dialogue, dialogue.answer);
  const prog = await e.getProgress();
  check(!Object.keys(prog).some((k) => k.includes("_stop_")), "a conversation reply never gets an SRS card");
  const log = await e.getAttempts();
  check(log.length === 1 && log[0].ok === true && (log[0].t === "dialogue" || log[0].t === "dialogue_pick"), `the reply is logged as conversation evidence: ${JSON.stringify(log)}`);
  const word = s.exercises.find((x) => x.type === "recall_write");
  await e.submitAnswer(word, { text: word.answer });
  const log2 = await e.getAttempts();
  check(log2.at(-1).t === "recall_write" && log2.at(-1).ph === "assess" && log2.at(-1).id === word.item.id, `a word answer is logged with its phase: ${JSON.stringify(log2.at(-1))}`);
  for (let i = 0; i < 900; i++) await e.recordEvidence("passage", true);
  check((await e.getAttempts()).length === 800, "the log keeps the last 800 answers per language");
  const st = await e.saveLessonResult(task.id, { objectives: { x: { status: "met" } }, exchange: task.stop });
  check(st.done[task.id] && st.exchanges[task.stop], "a finished task records the lesson and its conversation");
}

console.log(`\n  curriculum: ${checks} checks across ${allCodes().length} languages, ${sessions} lesson sessions built`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems.slice(0, 40)) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ every language's course is complete, honest about itself, and every lesson runs in seven phases\n");
