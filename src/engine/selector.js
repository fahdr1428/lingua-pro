// =============================================================================
// SELECTOR — decides what to show next, in real time.
// =============================================================================
// Strategy:
//   1. Compute current retrievability R for every studied card.
//   2. Anything with R < retentionTarget is "due-ish" — sort by R ascending
//      (the card you're MOST likely to forget gets reviewed first).
//   3. If review queue is short, mix in new cards by frequency rank
//      (most useful words first, not random order).
//   4. Cap the total so a session has a clear end.
// =============================================================================

import { retrievability } from "./srs.js";

const DEFAULTS = {
  sessionSize: 10,
  newPerSession: 4,
  dueThreshold: 0.9,        // R below this = due
  newCardSource: "frequency", // 'frequency' | 'difficulty' | 'random'
};

/**
 * @param {Array} vocab           - all word objects for the language
 * @param {Object} progress       - { [vocabId]: cardState }
 * @param {Object} opts
 * @returns {Array} ordered list of vocab items for this session
 */
export function buildQueue(vocab, progress, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  const now = Date.now();

  // Bucket 1: studied cards that are due, sorted by retrievability (lowest first)
  const due = vocab
    .filter((v) => progress[v.id])
    .map((v) => ({ item: v, r: retrievability(progress[v.id], now), card: progress[v.id] }))
    .filter(({ r }) => r < cfg.dueThreshold)
    .sort((a, b) => a.r - b.r);

  // v38 ADAPTIVE REVIEW: if a due backlog is building up, reduce how many new
  // words we introduce this session so reviews don't get crowded out. This is
  // the core of "consolidated repetitive learning" — when you have words
  // slipping, the app prioritises locking them in before piling on new ones.
  // Backlog tiers: 0-5 due → normal new intake; 6-15 → half; 16+ → reviews only.
  let effectiveNewPerSession = cfg.newPerSession;
  if (due.length >= 16) effectiveNewPerSession = 0;
  else if (due.length >= 6) effectiveNewPerSession = Math.max(1, Math.floor(cfg.newPerSession / 2));

  // Bucket 2: unseen cards, sorted by frequency rank (most useful first).
  // v41: if a goal-category order is provided, words whose category is in the
  // goal sort FIRST (in goal-priority order), then by frequency within that.
  // Words outside the goal still come after, so the learner never gets stuck.
  const goalCats = cfg.goalCategories || null; // array of category names, or null
  const goalRank = (v) => {
    if (!goalCats) return 0;
    const idx = goalCats.indexOf(v.category);
    return idx === -1 ? goalCats.length : idx; // in-goal: its position; else last
  };
  const unseen = vocab
    .filter((v) => !progress[v.id])
    .sort((a, b) => {
      if (goalCats) {
        const ga = goalRank(a), gb = goalRank(b);
        if (ga !== gb) return ga - gb; // goal-priority category first
      }
      if (cfg.newCardSource === "frequency") return (a.frequencyRank || 9999) - (b.frequencyRank || 9999);
      if (cfg.newCardSource === "difficulty") return (a.difficulty || 5) - (b.difficulty || 5);
      return Math.random() - 0.5;
    });

  // Bucket 3: mature words not strictly due — keep them fresh!
  // We sprinkle these in so users keep seeing words they "know" instead of
  // feeling like the app forgot them. Sample by lowest current retrievability
  // (still healthy, but closest to fading) — this is what real learning looks like.
  const mature = vocab
    .filter((v) => progress[v.id] && !due.find((d) => d.item.id === v.id))
    .map((v) => ({ item: v, r: retrievability(progress[v.id], now) }))
    .sort((a, b) => a.r - b.r);

  // Mix: due cards first, then new, then sprinkle mature
  const maxDue = Math.min(due.length, Math.max(2, cfg.sessionSize - effectiveNewPerSession));
  const remainingAfterDue = cfg.sessionSize - maxDue;
  const newSlot = Math.min(unseen.length, Math.min(effectiveNewPerSession, remainingAfterDue));
  const matureSlot = cfg.sessionSize - maxDue - newSlot;

  const queue = [
    ...due.slice(0, maxDue).map((d) => d.item),
    ...unseen.slice(0, newSlot),
    ...mature.slice(0, Math.max(0, matureSlot)).map((m) => m.item),
  ];

  // If still short, backfill with anything available
  if (queue.length < cfg.sessionSize) {
    const backfill = vocab
      .filter((v) => !queue.find((q) => q.id === v.id))
      .sort((a, b) => (a.frequencyRank || 9999) - (b.frequencyRank || 9999))
      .slice(0, cfg.sessionSize - queue.length);
    queue.push(...backfill);
  }

  return queue;
}

/** How many cards are due RIGHT NOW. */
export function countDue(vocab, progress, threshold = 0.9, now = Date.now()) {
  let due = 0;
  for (const v of vocab) {
    const c = progress[v.id];
    if (!c) continue;
    if (retrievability(c, now) < threshold) due++;
  }
  return due;
}

/** How many cards have been seen at all. */
export function countLearned(vocab, progress) {
  return vocab.filter((v) => progress[v.id]?.reps > 0).length;
}

/** Filtered selector — for "study this category only" / custom decks. */
export function filterVocab(vocab, { category, tags, stage, unit, difficultyMax } = {}) {
  return vocab.filter((v) => {
    if (category && v.category !== category) return false;
    if (unit && v.unit !== unit) return false;
    if (stage && v.stage !== stage) return false;
    if (difficultyMax && v.difficulty > difficultyMax) return false;
    if (tags && tags.length && !tags.some((t) => (v.tags || []).includes(t))) return false;
    return true;
  });
}
