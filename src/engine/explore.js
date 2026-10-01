// =============================================================================
// explore.js (v111) — the Practice tab, organised, and what's not been tried.
//
// Practice had grown to seventeen doors in one flat list, in the order they
// were built: reading next to flashcards next to the exam, speaking nowhere
// near the top, nothing to say which ones a learner had never opened. Most
// learners use the first three doors of a long list and never see the rest.
//
// So doors are grouped by what they train (speak first — it's the skill the
// rest serve), each one a learner hasn't opened is marked, the tab says how
// much of it they've explored, and one untried door is suggested — in an
// order that goes from the most useful next step to the most specialised.
// =============================================================================

export const PRACTICE_SECTIONS = [
  { id: "review", title: "Due today", blurb: "" },
  { id: "speak", title: "Speak", blurb: "Out loud, every day — the skill the rest of this is for." },
  { id: "words", title: "Words", blurb: "Drill them, race them, and keep them alive." },
  { id: "read", title: "Read & listen", blurb: "Connected language you can mostly follow." },
  { id: "understand", title: "Understand", blurb: "How it's written, how it fits together, what it means to people." },
  { id: "test", title: "Test yourself", blurb: "" },
];

// Untried doors are suggested in this order: the next most useful habit first.
export const EXPLORE_ORDER = [
  "speak-session", "listen", "rush", "topics", "stream", "reading", "conversations",
  "speak-screen", "grammar", "culture", "flashcards", "alphabet", "vocab", "exam",
];

/**
 * @param doors    [{ id, section, ... }] — what this learner can open right now
 * @param visited  ids they've opened before
 * @returns { sections, explored, total, suggestion }
 *   sections    PRACTICE_SECTIONS that have doors, in order, each door marked
 *               `isNew` if never opened
 *   explored    how many of the explorable doors have been opened
 *   total       how many explorable doors there are (the review door isn't
 *               one — it comes and goes with what's due)
 *   suggestion  one untried door, or null when they've tried them all
 */
export function organisePractice(doors, visited = []) {
  const seen = new Set(visited || []);
  const explorable = (doors || []).filter((d) => d.section !== "review");
  const sections = PRACTICE_SECTIONS
    .map((sec) => ({
      ...sec,
      doors: (doors || []).filter((d) => d.section === sec.id).map((d) => ({ ...d, isNew: d.section !== "review" && !seen.has(d.id) })),
    }))
    .filter((sec) => sec.doors.length);
  const explored = explorable.filter((d) => seen.has(d.id)).length;
  const untried = explorable.filter((d) => !seen.has(d.id));
  const rank = (d) => { const i = EXPLORE_ORDER.indexOf(d.id); return i < 0 ? EXPLORE_ORDER.length : i; };
  const suggestion = untried.sort((a, b) => rank(a) - rank(b))[0] || null;
  return { sections, explored, total: explorable.length, suggestion };
}

/** appState after opening a door: the id recorded once, per language. */
export function markVisited(state, code, id) {
  const cur = state?.doorsVisited?.[code] || [];
  if (cur.includes(id)) return state;
  return { ...state, doorsVisited: { ...(state?.doorsVisited || {}), [code]: [...cur, id] } };
}
