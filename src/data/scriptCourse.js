// =============================================================================
// scriptCourse.js (v99) — Chapter 0: how this language is written.
//
// THE PROBLEM THIS FIXES
//
// The app taught a script course, and taught it well: a primer on how the
// system works, letter groups, vowel signs for the abugidas, joined forms for
// the Arabic scripts, Hangul blocks, confusable pairs. And it hid the whole
// thing behind a tile in "more ways to practise", below the fold, next to
// flashcards.
//
// Meanwhile the route — the thing a learner actually follows — opened on
// "Introductions", with Malayalam words written in Malayalam, on the assumption
// that the person reading them could read them. For a heritage learner that
// assumption is often exactly backwards: they can speak some of it and cannot
// read a word. Handing them ഞാൻ and moving on is not a course, it's a wall with
// a greeting written on it.
//
// So the script course is now Chapter 0. It sits at the TOP of the route, ahead
// of introductions, as the first thing the language asks of you — and it ends in
// an exam, because someone who already reads the script must be able to prove it
// in two minutes and go straight to Chapter 1 rather than sit through letters
// they have known since childhood.
//
// WHAT COUNTS AS "KNOWING IT"
//
// Not "can name the letters". The exam asks the two questions a reader answers
// without thinking — WHAT DOES THIS SAY, and WHAT DOES IT MEAN — using real
// words from the learner's own pack, plus the letter/sound knowledge underneath
// them. Naming letters is a party trick; reading is the skill.
//
// Languages written in the Latin alphabet have no Chapter 0. There is nothing
// honest to teach: a Spanish learner can already read "hola". The gate is the
// pack's own alphabet data, not a hand-kept list.
// =============================================================================

import { isNonLatinScript } from "./registry.js";

/** The pass mark for the reading exam, as a share of questions. */
export const SCRIPT_PASS = 0.8;

/** How many questions the exam asks. Short enough to sit twice. */
export const SCRIPT_EXAM_SIZE = 12;

/**
 * Does this language have a Chapter 0 to teach?
 *
 * Two conditions, both read from the pack rather than from a list: the script
 * is not Latin, and the pack actually carries letters to teach. A language that
 * gains alphabet data gains Chapter 0 automatically; one that loses it stops
 * offering a door onto nothing.
 */
export function hasScriptCourse(pack) {
  if (!pack?.code || !isNonLatinScript(pack.code)) return false;
  return Array.isArray(pack.alphabet) && pack.alphabet.length >= 8;
}

/**
 * The rows of Chapter 0, in the order a learner should meet them.
 *
 * The teaching lives in AlphabetLessons (it was always good); this is the map
 * that puts it on the route. Each stop carries the `lesson` id that screen
 * uses, so the spine can deep-link straight into the right group instead of
 * dropping the learner at a menu.
 */
export function scriptStops(pack) {
  if (!hasScriptCourse(pack)) return [];
  const sys = pack.scriptSystem || {};
  const stops = [];

  if (sys.primer) {
    stops.push({
      id: "__primer",
      title: sys.primer.title || "How this script works",
      sub: sys.primer.tagline || "Before letter one — what kind of system this is",
      kind: "primer",
    });
  }

  for (const g of pack.alphabetGroups || []) {
    const n = pack.alphabet.filter((l) => l.group === g.id).length;
    if (!n) continue;
    stops.push({
      id: g.id,
      title: g.title,
      sub: `${n} letter${n === 1 ? "" : "s"}, with the sound each one makes`,
      kind: "letters",
      count: n,
    });
  }

  // The step that turns letters into reading, and it is a different step for
  // each family. Naming it explicitly matters: a learner who knows the 38
  // Malayalam consonants still cannot read കി without the vowel signs.
  if (sys.vowelSigns) {
    stops.push({
      id: "__vowelsigns",
      title: "Vowel signs",
      sub: "The marks that turn a consonant into a syllable",
      kind: "system",
    });
  }
  // Deliberately NOT a stop of its own for the Arabic scripts: joining isn't a
  // separate lesson in AlphabetLessons, it's shown on every letter card as that
  // letter's initial/medial/final forms. A stop here would link to nothing.
  if (sys.blocks) {
    stops.push({
      id: "__blocks",
      title: "Building syllable blocks",
      sub: "Letters stack into squares — ㅎ + ㅏ + ㄴ is 한, not ㅎㅏㄴ",
      kind: "system",
    });
  }

  return stops;
}

/**
 * Has the learner passed the reading exam?
 *
 * This — not "visited every group" — is what opens Chapter 1, because it is the
 * only thing that means they can read. Someone who arrived able to read sits it
 * first and never opens a letter lesson.
 */
export function hasPassedScript(appState, code) {
  return Boolean(appState?.scriptCourse?.[code]?.passed);
}

/** Which Chapter 0 stops have been worked through, from the alphabet screen's own store. */
export function scriptStopsDone(groupProgress, pack) {
  const done = groupProgress?.[pack.code] || {};
  return scriptStops(pack).filter((s) => done[s.id]).length;
}

/**
 * Is the reading exam worth offering yet?
 *
 * Always. That is the point: a learner who can already read should meet the
 * exam before the lessons, not after them. The route says so in words rather
 * than hiding it until some progress bar fills.
 */
export function isScriptExamOpen() {
  return true;
}
