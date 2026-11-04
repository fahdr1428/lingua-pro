// =============================================================================
// JOURNEY CHAPTERS — how a language's stops group into the map's regions.
//
// Split out of journey.js so the map can draw without the journey content
// (~76KB of exchanges in 21 languages) being in the first download: the
// content now loads with the home screen, like the other per-language
// libraries since v107. journey.js re-exports all of this.
// =============================================================================

// Must stay equal to UNITS_PER_CHAPTER in chapters.js — imported rather than
// redeclared so the two can't drift apart (see journey.js header).
import { UNITS_PER_CHAPTER } from "./chapters.js";

// Fallback region names, used when the caller can't supply real unit titles.
export const CHAPTER_TITLES = [
  "Meeting people",
  "Everyday needs",
  "Out in the world",
  "Saying more",
];

/**
 * Group stops into the regions the map draws, in UNITS_PER_CHAPTER-sized runs
 * so journey chapter N is exactly chapters.js chapter N.
 * Returns [{ number, title, stops: [{...stop, globalIndex}], startsAt, endsAtUnit }].
 */
export function chaptersOf(stops = []) {
  if (!stops.length) return [];
  const chapters = [];
  for (let i = 0, number = 1; i < stops.length; i += UNITS_PER_CHAPTER, number++) {
    const slice = stops
      .slice(i, i + UNITS_PER_CHAPTER)
      .map((s, j) => ({ ...s, globalIndex: i + j }));
    if (!slice.length) break;
    chapters.push({
      number,
      title: CHAPTER_TITLES[number - 1] || `Chapter ${number}`,
      stops: slice,
      startsAt: i,
      endsAtUnit: slice[slice.length - 1].unitIndex,
    });
  }
  return chapters;
}

/** Stops cleared, from real unit progress (60% of a stop's unit learned), in order. */
export function reachedOf(stops = [], unitProgress = []) {
  let reached = 0;
  for (const s of stops) {
    const u = unitProgress[s.unitIndex];
    if (u && (u.pct || 0) >= 0.6) reached++;
    else break;
  }
  return reached;
}

/**
 * The structured course's module task for a stop: the lesson that practises
 * exactly this exchange (curriculum.js builds it as `<code>.mNN.task`).
 */
export function taskLessonId(langCode, unitIndex, nth = 0) {
  return `${langCode}.m${String(unitIndex + 1).padStart(2, "0")}.task${nth ? nth + 1 : ""}`;
}

/** Which of its unit's stops this is (0 for the first): Yoruba's Greetings has two. */
export function nthOnUnit(stops, stop) {
  return stops.filter((s) => s.unitIndex === stop.unitIndex).findIndex((s) => s.id === stop.id);
}
