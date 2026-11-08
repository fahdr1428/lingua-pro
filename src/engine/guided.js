// =============================================================================
// GUIDED — one structured lesson, in the seven phases of the Zaban lesson
// framework (docs/ZABAN_EDUCATIONAL_ARCHITECTURE.md §3):
//
//   1 Recall        a few earlier words, from memory where they can be
//   2 Introduction  what this lesson will let you do (its objectives)
//   3 Teaching      the new words in context, the module's grammar, or the
//                   conversation the module leads to
//   4 Guided        recognising them, with support available
//   5 Application   putting them into sentences; for a module task, building
//                   your side of the conversation
//   6 Assessment    from memory, no hints, nothing to choose from
//   7 Feedback      per-objective results (scoreObjectives) and what comes
//                   back for review — shown on the results screen
//
// Built from the course (curriculum.js) and the existing exercise builders
// (generator.js), so every language gets it and every exercise renders with
// the screens that already handle its script, direction and romanisation.
//
// Lazy-loaded: the first download doesn't carry it.
// =============================================================================

import { buildCourse, findLesson, OBJECTIVE, wordsUsedIn } from "./curriculum.js";
import { buildOfType, buildPairs, sentenceTiles, EXERCISE } from "./generator.js";
import { canRecall } from "./recall.js";
import { retrievability } from "./srs.js";
import { SPEAK_MODE } from "./speaking.js";
import { buildFixSentence, buildDictation } from "./teach.js";

// Answers that produce the word with nothing to choose from.
const PRODUCED = new Set([EXERCISE.RECALL_WRITE, EXERCISE.SPEAK_PROMPT]);

export const PHASES = [
  { id: "recall", label: "Recall", blurb: "What do you already know?" },
  { id: "intro", label: "Introduction", blurb: "What are we learning?" },
  { id: "teach", label: "Teaching", blurb: "Understand it" },
  { id: "guided", label: "Guided practice", blurb: "Try it, with help" },
  { id: "apply", label: "Application", blurb: "Use what you've learned" },
  { id: "assess", label: "Assessment", blurb: "No hints, no options" },
  { id: "feedback", label: "Feedback", blurb: "What to work on" },
];

// ---------------------------------------------------------------------------
// The course for a pack, built once per language per session.
// ---------------------------------------------------------------------------
const courses = new Map();

export async function loadCourse(pack) {
  const key = `${pack.code}:${(pack.vocab || []).length}`;
  if (courses.has(key)) return courses.get(key);
  // Only the titles of the grammar lessons and Sentence Lab rungs are needed
  // to build the course, and those are in the small generated content index.
  // Home builds the course on every visit; the two libraries are 151KB, and on
  // a slow connection downloading them held up everything Home loaded after.
  // (test-curriculum checks this gives the same course as the full content.)
  const [{ getStops }, { COURSES }, { GRAMMAR_TITLES, PATTERN_SKILLS }] = await Promise.all([
    import("../data/journey.js"),
    import("../data/courses.js"),
    import("../data/contentIndex.js"),
  ]);
  const course = buildCourse(pack, {
    grammar: (GRAMMAR_TITLES[pack.code] || []).map(([id, title]) => ({ id, title })),
    patterns: (PATTERN_SKILLS[pack.code] || []).map((skill) => ({ skill })),
    stops: getStops(pack.code),
    profile: COURSES[pack.code] || null,
  });
  courses.set(key, course);
  return course;
}

// ---------------------------------------------------------------------------
// The conversation exercises (module tasks).
// ---------------------------------------------------------------------------

/** A stand-in item for a whole reply, so the existing renderers can show it. */
function replyItem(exchange, code) {
  return {
    id: `${code}_stop_${exchange.id}`,
    lemma: exchange.you.text,
    translit: exchange.you.translit,
    translation: exchange.you.en,
    examples: [{ native: exchange.they.text, translit: exchange.they.translit, translation: exchange.they.en }],
  };
}

/** Every conversation in the course, with the module it belongs to. */
function allExchanges(course) {
  return course.modules.flatMap((m) => (m.exchanges || (m.exchange ? [m.exchange] : [])).map((e) => ({ e, at: m.index })));
}

/** Choose your reply: this exchange's reply among other exchanges' replies. */
export function dialoguePick(module, course, code, ex = module.exchange) {
  if (!ex) return null;
  // Every other conversation in the course, nearest module first: the replies
  // a learner at this point could actually confuse.
  const others = allExchanges(course)
    .filter(({ e }) => e.id !== ex.id && e.you.text !== ex.you.text)
    .sort((a, b) => Math.abs(a.at - module.index) - Math.abs(b.at - module.index))
    .map(({ e }) => e.you);
  const wrong = others.slice(0, 3);
  if (wrong.length < 2) return null;
  const options = shuffle([ex.you, ...wrong]);
  return {
    type: EXERCISE.PICK_WORD,
    logAs: "dialogue_pick",
    noSchedule: true,
    item: replyItem(ex, code),
    prompt: "Choose the reply that fits",
    context: { they: ex.they, goal: ex.outcome },
    options: options.map((o) => o.text),
    optionTranslit: Object.fromEntries(options.map((o) => [o.text, o.translit])),
    answer: ex.you.text,
    wordIds: ex.coverage.replyWords,
    objective: ex.useId,
  };
}

/** Build your reply from tiles. Null when the reply can't be split safely. */
export function dialogueBuild(module, course, code, pool, ex = module.exchange) {
  if (!ex) return null;
  const item = replyItem(ex, code);
  const tiles = ex.tiles || sentenceTiles(ex.you.text, item, pool);
  if (!tiles || tiles.length < 2) return null;
  const spare = [];
  for (const { e } of allExchanges(course)) {
    if (e.id === ex.id) continue;
    for (const t of e.tiles || []) if (!tiles.includes(t) && !spare.includes(t)) spare.push(t);
    if (spare.length >= 6) break;
  }
  return {
    type: EXERCISE.BUILD_SENTENCE,
    logAs: "dialogue",
    noSchedule: true,
    item,
    prompt: "Build your reply",
    context: { they: ex.they, goal: ex.outcome },
    translation: ex.you.en,
    example: { native: ex.you.text, translit: ex.you.translit, translation: ex.you.en },
    showWord: false,
    playAudio: false,
    bank: shuffle([...tiles, ...shuffle(spare).slice(0, 2)]),
    answer: tiles.join(" "),
    wordIds: ex.coverage.replyWords,
    objective: ex.useId,
  };
}

// ---------------------------------------------------------------------------
// The session.
// ---------------------------------------------------------------------------
export async function buildGuidedSession(pack, lessonId, { progress = {}, attempts = [], disabled = null, canHear = null, rand = Math.random } = {}) {
  void attempts;
  const course = await loadCourse(pack);
  const found = findLesson(course, lessonId);
  if (!found) return null;
  const { module, lesson } = found;
  const code = pack.code;
  const pool = (pack.vocab || []).filter((v) => !v.custom);
  const byId = new Map(pool.map((v) => [v.id, v]));
  const items = lesson.items.map((id) => byId.get(id)).filter(Boolean);
  const isTask = lesson.kind === "task";
  // A task practises ITS conversation (a module can lead to more than one).
  const exchange = isTask ? (module.exchanges || []).find((e) => e.id === lesson.stop) || null : module.exchange;
  const off = disabled instanceof Set ? disabled : new Set(disabled || []);
  const ex = [];
  const add = (e, phase, extra = {}) => { if (e) ex.push({ ...e, phase, ...extra }); };
  const ofType = (item, type) => buildOfType(item, type, pool, progress, off);

  // 1 RECALL — words met before this lesson, the ones closest to being
  // forgotten first. From memory if they've been produced before; otherwise
  // picked out, since asking cold for a word never produced is a guess.
  const inLesson = new Set(lesson.items);
  const earlier = pool
    .filter((v) => !inLesson.has(v.id) && (progress[v.id]?.reps || 0) > 0)
    .sort((a, b) => retrievability(progress[a.id]) - retrievability(progress[b.id]))
    .slice(0, 3);
  for (const v of earlier) add(ofType(v, canRecall(progress[v.id]) ? EXERCISE.RECALL_WRITE : EXERCISE.PICK_WORD), "recall");

  // 2 INTRODUCTION
  const situation = exchange ? { they: exchange.they, you: exchange.you } : null;
  add({
    type: "OBJECTIVES",
    lesson: { id: lesson.id, title: lesson.title, kind: lesson.kind },
    module: { id: module.id, title: module.title, emoji: module.emoji, index: module.index },
    objectives: lesson.objectives.map((o) => ({ id: o.id, type: o.type, text: o.text })),
    situation,
    status: course.status,
  }, "intro");

  // 3 TEACHING
  if (!isTask) {
    const unmet = items.filter((v) => !((progress[v.id]?.reps || 0) > 0));
    const teach = unmet.length ? unmet : items;
    add({ type: EXERCISE.INTRODUCE_BATCH, items: teach, prompt: `Learn ${teach.length} word${teach.length === 1 ? "" : "s"}` }, "teach");
    if (lesson.grammar?.length) {
      const { getGrammar } = await import("../data/grammar.js");
      for (const gid of lesson.grammar) {
        const g = getGrammar(code).find((x) => x.id === gid);
        if (g) add({ type: "GRAMMAR_MOMENT", grammar: g }, "teach", { objective: `${module.id}.g.${gid}` });
      }
    }
  } else if (exchange) {
    add({
      type: "EXCHANGE",
      exchange,
      words: exchange.words.map((id) => byId.get(id)).filter(Boolean),
    }, "teach");
  }

  // 4 GUIDED PRACTICE — recognising, with the usual support (hints narrow
  // the options; a wrong answer explains itself).
  if (!isTask) {
    items.forEach((v, i) => {
      const listen = i % 3 === 2 && !off.has(EXERCISE.LISTEN_PICK);
      add(ofType(v, listen ? EXERCISE.LISTEN_PICK : EXERCISE.PICK_MEANING), "guided", { objective: `${module.id}.recognise` });
    });
    if (items.length >= 4 && !off.has(EXERCISE.MATCH_PAIRS)) add(buildPairs(items), "guided");
    // v116 — DICTATION (teach.js): one of the new words, heard and written.
    // Only where it can actually be heard, and not for anyone who has turned
    // off listening or writing.
    if (typeof canHear === "function" && !off.has(EXERCISE.LISTEN_PICK) && !off.has(EXERCISE.RECALL_WRITE)) {
      const heard = [...items].reverse().find((v) => v.lemma && v.lemma.length <= 24 && canHear(v));
      if (heard) add(buildDictation(heard), "guided");
    }
  } else {
    add(dialoguePick(module, course, code, exchange), "guided");
    // Two of the module's words, picked out, to warm up the reply.
    for (const v of items.slice(0, 2)) add(ofType(v, EXERCISE.PICK_WORD), "guided", { objective: `${module.id}.recognise` });
  }

  // 5 APPLICATION — the words in sentences; for a task, the reply itself.
  if (!isTask) {
    const construct = lesson.objectives.find((o) => o.type === OBJECTIVE.CONSTRUCT);
    const builders = items.filter((v) => construct?.items.includes(v.id)).slice(0, 3);
    const kinds = [EXERCISE.BUILD_SENTENCE, EXERCISE.COMPLETE_SENTENCE, EXERCISE.TAP_WORDS];
    builders.forEach((v, i) => {
      const e = ofType(v, kinds[i % kinds.length]);
      // A builder that fell back to a word question is not sentence evidence.
      if (e && kinds.includes(e.type)) add(e, "apply", { objective: `${module.id}.construct` });
    });
    // v116 — SPOT THE MISTAKE (teach.js): one of this lesson's words, in a
    // sentence where another word has taken its place. Practice, not
    // assessment: it is not counted toward an objective.
    for (const v of [...items].sort(() => rand() - 0.5)) {
      const fix = buildFixSentence(v, pool, { rand });
      if (fix) { add(fix, "apply"); break; }
    }
  } else {
    const built = dialogueBuild(module, course, code, pool, exchange);
    if (built) add(built, "apply");
    else add(dialoguePick(module, course, code, exchange), "apply");
  }

  // 6 ASSESSMENT — from memory, no hints. Words of a task lesson are sampled
  // (weakest first) so a module task stays short.
  const assessItems = isTask
    ? [...items].sort((a, b) => (progress[a.id]?.stability || 0) - (progress[b.id]?.stability || 0)).slice(0, 4)
    : items;
  for (const v of assessItems) {
    // Writing switched off: say it from memory instead (as recall sessions do).
    // Both off: a choice — which the scorer does not count as recall.
    const e = !off.has(EXERCISE.RECALL_WRITE)
      ? ofType(v, EXERCISE.RECALL_WRITE)
      : !off.has(EXERCISE.SPEAK_PROMPT)
      ? { type: EXERCISE.SPEAK_PROMPT, item: v, answer: v.lemma, prompt: "Say it from memory", mode: SPEAK_MODE.RECALL }
      : ofType(v, EXERCISE.PICK_WORD);
    add(e, "assess", { assess: true, objective: `${module.id}.recall` });
  }
  if (isTask) {
    const final = dialogueBuild(module, course, code, pool, exchange) || dialoguePick(module, course, code, exchange);
    add(final, "assess", { assess: true });
  }

  return {
    mode: "guided",
    exercises: ex,
    guided: {
      lessonId: lesson.id,
      kind: lesson.kind,
      title: lesson.title,
      module: { id: module.id, title: module.title, index: module.index },
      stop: lesson.stop || null,
      objectives: lesson.objectives.map((o) => ({ id: o.id, type: o.type, text: o.text, items: o.items })),
      phases: PHASES.filter((p) => p.id === "feedback" || ex.some((e) => e.phase === p.id)).map((p) => p.id),
    },
  };
}

// ---------------------------------------------------------------------------
// FEEDBACK — what the answers say about each objective.
//
// Each objective is judged only on the evidence its type needs:
//   recognise  — the guided-phase answers on its words (2 in 3 right)
//   recall     — the assessment answers, unaided (2 in 3 right, no hints)
//   construct  — the application sentences (at least half right)
//   understand — the grammar was taught; the checks inside it are practice,
//                so it reads "explained", not "met"
//   use        — the conversation built or chosen correctly in assessment
// An objective with no evidence in this lesson says so rather than passing.
// ---------------------------------------------------------------------------
export function scoreObjectives(guided, answers = []) {
  const results = {};
  for (const o of guided?.objectives || []) {
    const mine = (pred) => answers.filter((a) => pred(a));
    let ev = [];
    if (o.type === OBJECTIVE.RECOGNISE) ev = mine((a) => a.phase === "guided" && o.items.includes(a.id));
    else if (o.type === OBJECTIVE.RECALL) ev = mine((a) => a.phase === "assess" && o.items.includes(a.id) && PRODUCED.has(a.t));
    else if (o.type === OBJECTIVE.CONSTRUCT) ev = mine((a) => a.phase === "apply" && a.objective === o.id);
    else if (o.type === OBJECTIVE.USE) ev = mine((a) => a.phase === "assess" && (a.t === "dialogue" || a.t === "dialogue_pick"));
    if (o.type === OBJECTIVE.UNDERSTAND) {
      const taught = answers.some((a) => a.objective === o.id);
      results[o.id] = { status: taught ? "explained" : "none", right: 0, of: 0 };
      continue;
    }
    if (!ev.length) { results[o.id] = { status: "none", right: 0, of: 0 }; continue; }
    const right = ev.filter((a) => a.ok && !(o.type === OBJECTIVE.RECALL && a.h > 0)).length;
    const need = o.type === OBJECTIVE.CONSTRUCT ? 0.5 : o.type === OBJECTIVE.USE ? 1 : 2 / 3;
    results[o.id] = { status: right / ev.length >= need ? "met" : "not-yet", right, of: ev.length };
  }
  return results;
}

/** The words to bring back: assessed and missed, or answered with help. */
export function toRevise(answers = []) {
  const ids = new Set();
  for (const a of answers) if (a.phase === "assess" && a.id && (!a.ok || a.h > 0)) ids.add(a.id);
  return [...ids];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export { wordsUsedIn };
