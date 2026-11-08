// =============================================================================
// TEACH (v116) — three things that teach rather than only test.
//
//   SPOT THE MISTAKE  A sentence the learner has met, with ONE word swapped for
//                     a word of different meaning, beside the English it should
//                     say. They find the word that breaks the meaning, then
//                     choose the word that belongs. Noticing a wrong form is a
//                     different skill from choosing a right one, and it is the
//                     skill self-correction is made of.
//
//   DICTATION         Hear the word, write it — in the script or as it sounds.
//                     Links the sound to the written form, the link reading
//                     aloud and listening both lean on. It is NOT recall: the
//                     sound gives the word away, so it never counts as "from
//                     memory" and never moves the review schedule.
//
//   YOUR MISTAKES     The words this learner keeps missing, from the answer log,
//                     until they have been got right cleanly since.
//
// WHAT MAKES "SPOT THE MISTAKE" HONEST. The sentence is wrong because its
// meaning no longer matches the English shown — not because a rule we can't
// check says so. The swapped-in word never shares a meaning with the original
// (games.js sameMeaning, the test the option lists already use), the original
// word appears exactly once in the sentence, and the swapped-in word does not
// appear in it at all — so exactly one word is wrong and exactly one fixes it.
// test-teaching checks that for every word in every language.
//
// Pure functions; loaded lazily with structured lessons and the Mistakes screen.
// =============================================================================

import { EXERCISE, sentenceTiles } from "./generator.js";
import { sameMeaning } from "./games.js";

// Leading/trailing punctuation and symbols around a tile: "Hola," → "Hola".
const EDGE = /^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu;
export const tileCore = (t) => String(t || "").replace(EDGE, "");
const fold = (s) => String(s || "").normalize("NFC").toLocaleLowerCase();
const oneWord = (s) => !!s && !/\s/.test(String(s).trim());
// A word as it is compared: no edge punctuation, one case ("¿Qué?" = "qué").
const word = (s) => fold(tileCore(s));

/** Every example of `item` that can carry the exercise: 3–9 tiles, the word in it exactly once. */
export function fixableFrames(item, pool) {
  if (!item?.lemma || !oneWord(item.lemma)) return [];
  const out = [];
  for (const ex of item.examples || []) {
    if (!ex?.native || !ex.translation) continue;
    const tiles = sentenceTiles(ex.native, item, pool);
    if (!tiles || tiles.length < 3 || tiles.length > 9) continue;
    const hits = [];
    if (!word(item.lemma)) return [];
    tiles.forEach((t, i) => { if (word(t) === word(item.lemma)) hits.push(i); });
    if (hits.length !== 1) continue;
    out.push({ ex, tiles, at: hits[0] });
  }
  return out;
}

/**
 * Spot the mistake. Null when no example can carry it safely.
 * `rand` is injectable so tests are deterministic.
 */
export function buildFixSentence(item, pool, { rand = Math.random } = {}) {
  const frames = fixableFrames(item, pool);
  if (!frames.length) return null;
  const frame = frames[Math.floor(rand() * frames.length)];
  const inSentence = new Set(frame.tiles.map(word));

  const usable = (d) =>
    d && d.id !== item.id && !d.custom && oneWord(d.lemma) && word(d.lemma) && d.translation &&
    word(d.lemma) !== word(item.lemma) && !inSentence.has(word(d.lemma)) &&
    !sameMeaning(item.translation, d.translation);
  const mix = (arr) => arr.map((x) => [rand(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  // Same topic first: a swap the learner could plausibly have made.
  const ranked = [
    ...mix(pool.filter((d) => usable(d) && d.category === item.category)),
    ...mix(pool.filter((d) => usable(d) && d.category !== item.category)),
  ];
  if (!ranked.length) return null;
  const wrong = ranked[0];

  // The choices: the right word, the wrong one, and up to two more — never two
  // that read the same or mean the same, so only one choice can be right.
  const options = [item, wrong];
  for (const d of ranked.slice(1)) {
    if (options.length >= 4) break;
    if (options.some((o) => word(o.lemma) === word(d.lemma) || sameMeaning(o.translation, d.translation))) continue;
    options.push(d);
  }
  if (options.length < 3) return null;

  const original = frame.tiles[frame.at];
  const core = tileCore(original);
  // Keep a capital where the sentence had one ("Hola," → "Adiós,").
  const bare = tileCore(wrong.lemma);
  const swapIn = /^\p{Lu}/u.test(core) && bare === bare.toLocaleLowerCase()
    ? bare.charAt(0).toLocaleUpperCase() + bare.slice(1)
    : bare;
  const tiles = frame.tiles.map((t, i) => (i === frame.at ? t.replace(core, swapIn) : t));

  return {
    type: EXERCISE.FIX_SENTENCE,
    item,
    prompt: "One word breaks the meaning. Find it, then choose the word that belongs.",
    translation: frame.ex.translation,
    example: frame.ex,
    tiles,
    wrongIndex: frame.at,
    wrong: { id: wrong.id, lemma: wrong.lemma, translit: wrong.translit || "", translation: wrong.translation },
    options: mix(options).map((o) => o.lemma),
    optionTranslit: Object.fromEntries(options.map((o) => [o.lemma, o.translit || ""])),
    optionMeaning: Object.fromEntries(options.map((o) => [o.lemma, o.translation])),
    answer: item.lemma,
    showWord: false,
    playAudio: false,
  };
}

/** Dictation: hear the word, write it. Graded as written recall (recall.js), logged apart from it. */
export function buildDictation(item) {
  if (!item?.lemma) return null;
  return {
    type: EXERCISE.RECALL_WRITE,
    cue: "audio",
    logAs: "dictation",
    // The sound gives the word away: evidence about listening and writing,
    // not a review of remembering it.
    noSchedule: true,
    item,
    prompt: "Write what you hear",
    translation: item.translation,
    showWord: false,
    playAudio: true,
    answer: item.lemma,
  };
}

// ---------------------------------------------------------------------------
// YOUR MISTAKES
// ---------------------------------------------------------------------------
const DAY = 86400000;
const PRODUCED = new Set(["recall_write", "speak_prompt"]);

/** What kind of question a miss came from, in words a learner reads. */
export const MISS_KIND = {
  recall_write: "writing it from memory",
  speak_prompt: "saying it",
  dictation: "writing what you heard",
  listen_pick: "hearing it",
  pick_meaning: "reading it",
  pick_word: "finding it",
  type_translation: "translating it",
  build_sentence: "a sentence",
  tap_words: "a sentence",
  complete_sentence: "a sentence",
  fix_sentence: "a sentence",
  conjugate: "its forms",
  conjugate_tense: "its forms",
  letter_scramble: "spelling it",
  true_false: "its meaning",
  match_pairs: "its meaning",
};

/**
 * The words to work on: missed in the last `days`, and not put right since.
 * Put right = a clean from-memory answer after the last miss, or two right
 * answers in a row after it. Most-missed first, then most recent.
 */
export function mistakeNotebook(attempts = [], vocab = [], { now = Date.now(), days = 30, limit = 30 } = {}) {
  const byId = new Map((vocab || []).filter((v) => v?.id).map((v) => [v.id, v]));
  const since = now - days * DAY;
  const per = new Map();
  for (const a of attempts || []) {
    if (!a || typeof a.id !== "string" || !byId.has(a.id) || !(a.ts >= since)) continue;
    if (!per.has(a.id)) per.set(a.id, []);
    per.get(a.id).push(a);
  }
  const out = [];
  for (const [id, list] of per) {
    list.sort((p, q) => p.ts - q.ts);
    const misses = list.filter((a) => !a.ok);
    if (!misses.length) continue;
    const last = misses[misses.length - 1];
    const after = list.filter((a) => a.ts > last.ts);
    const cleanRecall = after.some((a) => a.ok && PRODUCED.has(a.t) && !(a.h > 0) && a.v !== "alternative");
    let run = 0, best = 0;
    for (const a of after) { run = a.ok ? run + 1 : 0; best = Math.max(best, run); }
    if (cleanRecall || best >= 2) continue;
    const kinds = [...new Set(misses.map((a) => MISS_KIND[a.t]).filter(Boolean))];
    out.push({ item: byId.get(id), misses: misses.length, lastMiss: last.ts, kinds });
  }
  out.sort((p, q) => (q.misses - p.misses) || (q.lastMiss - p.lastMiss));
  return out.slice(0, limit);
}
