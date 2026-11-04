// =============================================================================
// CURRICULUM — Course → Module → Lesson → Objective, for every language.
//
// The packs were written as vocabulary units with a journey of conversations
// laid over them. This builds the structure the educational architecture asks
// for (docs/ZABAN_CURRICULUM_FRAMEWORK.md) out of what each language actually
// has, without inventing anything:
//
//   · a MODULE per unit, in the pack's order;
//   · LESSONS of at most LESSON_SIZE new words, plus a module task when the
//     module has a conversation to practise;
//   · OBJECTIVES typed by the evidence they need (recognise, recall, construct,
//     understand, use), each pointing at the items or content that prove it;
//   · grammar lessons and Sentence Lab patterns placed in the module where the
//     words of their examples have been taught, not wherever they fall.
//
// THE RULE: an objective is only written when the content to teach and assess
// it exists in that language. A language with no grammar lessons gets no
// "understand" objectives; a unit whose examples are too short to build gets no
// "construct" objective. Every objective text quotes real items from the pack.
//
// STATUS. Nothing built here has been reviewed by a teacher. The course carries
// status "legacy-unreviewed" and the UI says so. See validate-curriculum.
//
// Pure functions, no imports from the UI. Loaded lazily by the screens that
// need it, so it costs nothing on first load.
// =============================================================================

export const OBJECTIVE = {
  RECOGNISE: "recognise",
  RECALL: "recall",
  CONSTRUCT: "construct",
  UNDERSTAND: "understand",
  USE: "use",
};

/** What counts as evidence for each objective type (exercise types). */
export const EVIDENCE = {
  recognise: ["pick_meaning", "pick_word", "listen_pick", "match_pairs", "true_false", "odd_one_out"],
  recall: ["recall_write", "speak_prompt"],
  construct: ["build_sentence", "tap_words", "complete_sentence"],
  understand: ["grammar_check"],
  use: ["dialogue"],
};

/** At most this many new words in one lesson (A1 working-memory limit). */
export const LESSON_SIZE = 7;

import { NO_SPACE, PUNCT, segment, lemmaSet } from "./segment.js";
import { canRecall } from "./recall.js";
export { NO_SPACE, segment, lemmaSet };

// Languages that attach suffixes to the word (case, particles, possession), so a
// taught word can appear with an ending: Turkish evde, Korean 물을, Tamil
// வீட்டில, Somali gurigu, Bengali বাড়িতে.
const SUFFIXING = new Set(["tr", "ko", "ta", "ml", "so", "bn", "fa"]);
// Arabic attaches prefixes: و (and), ال (the), ب (with/in), ل (for), ف, ك.
const AR_PREFIX = /^(?:و|ف)?(?:ب|ل|ك)?(?:ال)?/;

/** Lowercase (Turkish-aware), NFC, punctuation removed, spaces collapsed. */
export function normalise(text, code = "") {
  const t = String(text || "").normalize("NFC");
  const lower = code === "tr" ? t.toLocaleLowerCase("tr") : t.toLowerCase();
  return lower.replace(PUNCT, " ").replace(/\s+/g, " ").trim();
}

/** Space-separated tokens of a sentence. */
export function tokensOf(text, code = "") {
  const n = normalise(text, code);
  return n ? n.split(" ") : [];
}

function tokenMatches(token, lemmaToken, code) {
  if (token === lemmaToken) return true;
  if (code === "ar") {
    const bare = token.replace(AR_PREFIX, "");
    if (bare === lemmaToken || bare === lemmaToken.replace(/^ال/, "")) return true;
  }
  if (SUFFIXING.has(code) && [...lemmaToken].length >= 2 && token.startsWith(lemmaToken)) return true;
  return false;
}

/**
 * Which of `items` appear in `text`. Exact forms only, apart from the affixes
 * above: a learner who knows "comer" has not been taught "como", so an
 * inflected form is not counted as a taught word.
 */
export function wordsUsedIn(text, items, code = "") {
  const found = [];
  if (NO_SPACE.has(code)) {
    const t = normalise(text, code).replace(/\s+/g, "");
    for (const v of items) {
      const l = normalise(v.lemma, code).replace(/\s+/g, "");
      if (l && t.includes(l)) found.push(v);
    }
    return found;
  }
  const toks = tokensOf(text, code);
  for (const v of items) {
    const lt = tokensOf(v.lemma, code);
    if (!lt.length) continue;
    outer: for (let i = 0; i + lt.length <= toks.length; i++) {
      for (let j = 0; j < lt.length; j++) if (!tokenMatches(toks[i + j], lt[j], code)) continue outer;
      found.push(v);
      break;
    }
  }
  return found;
}

/** First sense of a gloss: "hello, peace" → "hello". */
export function firstSense(translation) {
  return String(translation || "").split(/[,;/(]/)[0].trim();
}

function listOf(words) {
  const w = words.filter(Boolean);
  if (w.length <= 1) return w[0] || "";
  return `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}`;
}

function capitalise(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** "you'll be able to greet someone" → "Greet someone". */
export function outcomeOf(stop) {
  return capitalise(String(stop?.next || "").replace(/^you'll be able to\s+/i, "").trim());
}

/** Example sentences usable for building: enough tiles, with the taught word in them. */
function buildableExamples(item, code, lemmas) {
  return (item.examples || []).filter((e) => {
    const tiles = segment(e.native, code, lemmas);
    return tiles && tiles.length >= 3 && wordsUsedIn(e.native, [item], code).length > 0;
  });
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  // A last lesson of one or two words is merged into the one before it.
  if (out.length > 1 && out[out.length - 1].length < 3) {
    const tail = out.pop();
    out[out.length - 1] = [...out[out.length - 1], ...tail];
  }
  return out;
}

/**
 * Place a sequence (grammar lessons, Sentence Lab rungs) across the modules in
 * the author's order, evenly spaced. Their examples are fully glossed, so they
 * don't wait for every example word to be taught — and placing them by words
 * would push "the verb goes last" to the end of the course, which is backwards.
 */
function placeInOrder(entries, moduleCount) {
  return entries.map((entry, i) => ({
    entry,
    module: Math.min(moduleCount - 1, Math.floor((i * moduleCount) / Math.max(1, entries.length))),
  }));
}

/**
 * Build the course for one language.
 *
 * @param {object} pack     the loaded language pack (code, units, vocab)
 * @param {object} extras   { grammar, patterns, stops, profile }
 */
export function buildCourse(pack, { grammar = [], patterns = [], stops = [], profile = null } = {}) {
  const code = pack.code;
  const units = pack.units || [];
  const vocab = (pack.vocab || []).filter((v) => !v.custom && v.unit !== "custom");
  const unitIdx = new Map(units.map((u, i) => [u.id, i]));
  const unitIndexOf = (v) => unitIdx.get(v.unit) ?? units.length - 1;
  const lemmas = lemmaSet(vocab);
  const moduleCount = Math.max(1, units.length);

  const grammarAt = placeInOrder(grammar, moduleCount);
  const patternAt = placeInOrder(patterns, moduleCount);

  const modules = units.map((u, mi) => {
    const id = `${code}.m${String(mi + 1).padStart(2, "0")}`;
    const items = vocab
      .filter((v) => v.unit === u.id)
      .sort((a, b) => (a.frequencyRank ?? 9999) - (b.frequencyRank ?? 9999) || (a.difficulty ?? 1) - (b.difficulty ?? 1));
    // Usually one conversation per module; Yoruba's Greetings has two (greeting
    // properly, greeting by time of day), so a module can lead to several.
    const myStops = stops.filter((s) => s.unitIndex === mi);
    const myGrammar = grammarAt.filter((g) => g.module === mi).map((g) => g.entry);
    const myPatterns = patternAt.filter((p) => p.module === mi).map((p) => p.entry);

    // ---- the conversations this module leads to, and what they need -------
    const exchanges = myStops.map((stop, nth) => {
      const used = wordsUsedIn(`${stop.they?.text || ""} ${stop.you?.text || ""}`, vocab, code);
      const youUsed = wordsUsedIn(stop.you?.text || "", vocab, code);
      return {
        id: stop.id,
        they: stop.they,
        you: stop.you,
        done: stop.done,
        outcome: outcomeOf(stop),
        // The pack words the exchange uses, and where they are taught. A
        // word taught in a LATER module is one the conversation needs before
        // the course has taught it; the module task teaches the line as a
        // phrase, and the map waits for it to be practised (see JourneyMap).
        words: used.map((v) => v.id),
        coverage: {
          unitWords: used.filter((v) => v.unit === u.id).length,
          earlierWords: used.filter((v) => unitIndexOf(v) < mi).length,
          laterWords: used.filter((v) => unitIndexOf(v) > mi).map((v) => v.id),
          replyWords: youUsed.map((v) => v.id),
        },
        tiles: segment(stop.you?.text || "", code, lemmas),
        nth,
        taskId: `${id}.task${nth ? nth + 1 : ""}`,
        useId: `${id}.use${nth ? nth + 1 : ""}`,
      };
    });
    const exchange = exchanges[0] || null;

    // ---- objectives ---------------------------------------------------------
    const objectives = [];
    const gl = items.slice(0, 3).map((v) => `“${firstSense(v.translation)}”`);
    if (items.length) {
      objectives.push({
        id: `${id}.recognise`, type: OBJECTIVE.RECOGNISE,
        text: `Recognise the ${items.length} words in “${u.title}” when you read or hear them`,
        items: items.map((v) => v.id),
      });
      objectives.push({
        id: `${id}.recall`, type: OBJECTIVE.RECALL,
        text: `Say or write them from memory, such as ${listOf(gl)}`,
        items: items.map((v) => v.id),
      });
    }
    const builders = items.filter((v) => buildableExamples(v, code, lemmas).length);
    if (builders.length >= 2) {
      const ex = buildableExamples(builders[0], code, lemmas)[0];
      objectives.push({
        id: `${id}.construct`, type: OBJECTIVE.CONSTRUCT,
        text: `Put them into sentences, like “${ex.translation}”`,
        items: builders.map((v) => v.id),
        example: ex,
      });
    }
    for (const g of myGrammar) {
      objectives.push({
        id: `${id}.g.${g.id}`, type: OBJECTIVE.UNDERSTAND,
        text: `Understand: ${g.title}`, grammar: g.id, items: [],
      });
    }
    for (const ex of exchanges) {
      objectives.push({
        id: ex.useId, type: OBJECTIVE.USE,
        text: `${ex.outcome}, in a short exchange`,
        stop: ex.id, items: ex.words,
      });
    }

    // ---- lessons ------------------------------------------------------------
    const groups = chunk(items, LESSON_SIZE);
    const lessons = groups.map((group, li) => {
      // A lesson's objectives are about ITS words, worded for them: the
      // module's "the 15 words in Greetings" is not what a 7-word lesson
      // teaches. Ids stay the module's, so evidence adds up across lessons.
      const lessonObjectives = [];
      lessonObjectives.push({
        id: `${id}.recognise`, type: OBJECTIVE.RECOGNISE,
        text: `Recognise these ${group.length} words when you read or hear them`,
        items: group.map((v) => v.id),
      });
      const shown = group.slice(0, 4).map((v) => `“${firstSense(v.translation)}”`);
      lessonObjectives.push({
        id: `${id}.recall`, type: OBJECTIVE.RECALL,
        text: `Say or write them from memory: ${group.length > 4 ? `${shown.join(", ")} and ${group.length - 4} more` : listOf(shown)}`,
        items: group.map((v) => v.id),
      });
      const lessonBuilders = group.filter((v) => buildableExamples(v, code, lemmas).length);
      if (lessonBuilders.length) {
        const ex = buildableExamples(lessonBuilders[0], code, lemmas)[0];
        lessonObjectives.push({
          id: `${id}.construct`, type: OBJECTIVE.CONSTRUCT,
          text: `Put them into sentences, like “${ex.translation}”`,
          items: lessonBuilders.map((v) => v.id),
          example: ex,
        });
      }
      if (li === 0) lessonObjectives.push(...objectives.filter((o) => o.type === OBJECTIVE.UNDERSTAND));
      return {
        id: `${id}.l${li + 1}`,
        kind: "words",
        module: id,
        title: `Say ${listOf(group.slice(0, 3).map((v) => firstSense(v.translation)))}${group.length > 3 ? "…" : ""}`,
        items: group.map((v) => v.id),
        grammar: li === 0 ? myGrammar.map((g) => g.id) : [],
        objectives: lessonObjectives,
      };
    });
    for (const ex of exchanges) {
      lessons.push({
        id: ex.taskId,
        kind: "task",
        module: id,
        title: `Conversation: ${ex.outcome.toLowerCase()}`,
        items: items.map((v) => v.id),
        stop: ex.id,
        objectives: [
          ...objectives.filter((o) => o.type === OBJECTIVE.USE && o.stop === ex.id),
          ...(items.length
            ? [{
                id: `${id}.recall`, type: OBJECTIVE.RECALL,
                text: `Still recall this module's words from memory (a few, checked again)`,
                items: items.map((v) => v.id),
              }]
            : []),
        ],
      });
    }

    return {
      id,
      index: mi,
      unitId: u.id,
      title: u.title,
      emoji: u.emoji || "",
      description: u.description || "",
      outcome: exchange ? exchange.outcome : u.description || u.title,
      items: items.map((v) => v.id),
      grammar: myGrammar.map((g) => ({ id: g.id, title: g.title })),
      patterns: myPatterns.map((p) => p.skill),
      exchange,
      exchanges,
      objectives,
      lessons,
    };
  });

  return {
    code,
    status: "legacy-unreviewed",
    provenance: "Generated from the existing language pack by src/engine/curriculum.js. Not reviewed by a teacher.",
    profile,
    modules,
    lessonCount: modules.reduce((n, m) => n + m.lessons.length, 0),
  };
}

/** Find a lesson (and its module) by id. */
export function findLesson(course, lessonId) {
  for (const m of course?.modules || []) {
    const l = m.lessons.find((x) => x.id === lessonId);
    if (l) return { module: m, lesson: l };
  }
  return null;
}

/**
 * Is this lesson behind the learner? Finished as a structured lesson — or its
 * evidence is already there another way: every word of a word lesson produced
 * from memory (recall.js canRecall), or a task's conversation practised. So a
 * learner who learned through the older unit lessons isn't sent back to the
 * start of the course to re-do what they can already do.
 *
 * `state` is Engine.getCourseState(): { done: {id: ts}, exchanges: {stopId: ts} }.
 */
export function lessonSatisfied(lesson, state = {}, progress = {}) {
  if (state.done?.[lesson.id]) return true;
  if (lesson.kind === "task") return !!(lesson.stop && state.exchanges?.[lesson.stop]);
  return lesson.items.length > 0 && lesson.items.every((id) => canRecall(progress[id]));
}

/** Where the learner is: the first lesson, in course order, not yet behind them. */
export function nextLesson(course, state = {}, progress = {}) {
  const st = Array.isArray(state) ? { done: Object.fromEntries(state.map((id) => [id, 1])) } : state || {};
  for (const m of course?.modules || []) {
    for (const l of m.lessons) if (!lessonSatisfied(l, st, progress)) return { module: m, lesson: l };
  }
  return null;
}

/** How far through each module the learner is. */
export function moduleStanding(course, state = {}, progress = {}) {
  return (course?.modules || []).map((m) => {
    const complete = m.lessons.filter((l) => lessonSatisfied(l, state, progress)).length;
    return { id: m.id, complete, total: m.lessons.length, finished: complete === m.lessons.length && m.lessons.length > 0 };
  });
}
