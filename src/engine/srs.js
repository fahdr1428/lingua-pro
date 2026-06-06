// =============================================================================
// FSRS-LITE — Free Spaced Repetition Scheduler (simplified)
// =============================================================================
// Why this and not SM-2:
//   SM-2 (Anki's old algo, 2003) just multiplies an interval by an "ease factor".
//   FSRS models recall as a probability function over time, fits empirically
//   to how human memory actually decays, and is what Anki switched to in 2024.
//
// Three numbers per card:
//   D  difficulty   1..10  — how intrinsically hard this item is for you
//   S  stability    days   — how long until R drops to 0.9 (the "memory half-life")
//   R  retrievability 0..1 — current probability you can recall it
//
// Recall function (FSRS-5 power form):
//   R(t) = (1 + t / (9 · S))^(-1)
//
// You rate a review 1..4 (Again / Hard / Good / Easy). The algorithm updates
// D and S based on the rating, the previous R, and an exponential growth term.
// =============================================================================

export const RATING = {
  AGAIN: 1, // "I had no idea"
  HARD: 2,  // "I got it but barely"
  GOOD: 3,  // "I got it"
  EASY: 4,  // "Too easy"
};

const DAY_MS = 86_400_000;

// Tunable weights — these are simplified FSRS weights. Real FSRS has 17 of
// them and gets fit per-user; for a starter platform the defaults below
// produce sensible scheduling. You can later expose a "fit weights" job
// that retrains them on a user's history.
const W = {
  initialStab: [1.0, 1.5, 4.0, 8.0],     // days, indexed by rating-1
  initialDiff: 5.0,                       // mid scale
  diffDelta: 0.7,                         // how much rating shifts difficulty
  stabilityDecay: -0.5,                   // exponent in stability formula
  retentionTarget: 0.9,                   // schedule reviews to keep R >= 0.9
  hardPenalty: 0.85,                      // stability multiplier on HARD
  easyBonus: 1.3,                         // stability multiplier on EASY
  lapseBase: 0.2,                         // stability after AGAIN, ratio of old
  lapseFloor: 0.5,                        // never less than half a day
};

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/** A fresh, never-seen card. */
export function newCardState() {
  return {
    difficulty: null,
    stability: null,
    lastReview: null,
    nextReview: null,
    reps: 0,
    lapses: 0,
    lastRating: null,
  };
}

/** Probability you can recall this card right now. */
export function retrievability(card, now = Date.now()) {
  if (!card.lastReview || !card.stability) return 0; // never seen
  const days = (now - card.lastReview) / DAY_MS;
  return Math.pow(1 + days / (9 * card.stability), -1);
}

/** Days until the card should next be reviewed (target retention 0.9). */
export function intervalDays(stability) {
  // Solving R = (1 + t/9S)^-1 = retentionTarget for t
  // → t = 9S · (1/retentionTarget - 1)
  const t = 9 * stability * (1 / W.retentionTarget - 1);
  return Math.max(1, Math.round(t));
}

/** Apply a review and return the updated card state. */
export function review(card, rating, now = Date.now()) {
  // First review: bootstrap
  if (!card.lastReview) {
    const stability = W.initialStab[rating - 1];
    const difficulty = clamp(W.initialDiff - W.diffDelta * (rating - 3), 1, 10);
    return {
      difficulty,
      stability,
      lastReview: now,
      nextReview: now + intervalDays(stability) * DAY_MS,
      reps: 1,
      lapses: rating === RATING.AGAIN ? 1 : 0,
      lastRating: rating,
    };
  }

  const r = retrievability(card, now);

  // Difficulty drifts by rating
  let newD = card.difficulty - W.diffDelta * (rating - 3);
  newD = clamp(newD, 1, 10);

  // Stability update
  let newS;
  if (rating === RATING.AGAIN) {
    // Lapse: collapse stability but with a floor; harder cards collapse more
    newS = Math.max(W.lapseFloor, card.stability * W.lapseBase * Math.exp(0.3 * (5 - newD)));
  } else {
    // Successful recall: grow stability. Growth depends on:
    //   - how surprising the success was (lower r → bigger jump)
    //   - how easy the card is (lower D → bigger jump)
    //   - existing stability (with diminishing returns via stabilityDecay)
    const surpriseBonus = Math.exp(0.4 * (1 - r));
    const easyFactor = (11 - newD) * Math.pow(card.stability, W.stabilityDecay);
    let factor = 1 + Math.exp(2.0) * easyFactor * (surpriseBonus - 1) * 0.05;
    if (rating === RATING.HARD) factor *= W.hardPenalty;
    if (rating === RATING.EASY) factor *= W.easyBonus;
    factor = Math.max(1.05, factor); // always grow at least a bit on success
    newS = card.stability * factor;
  }

  return {
    difficulty: newD,
    stability: newS,
    lastReview: now,
    nextReview: now + intervalDays(newS) * DAY_MS,
    reps: card.reps + 1,
    lapses: card.lapses + (rating === RATING.AGAIN ? 1 : 0),
    lastRating: rating,
  };
}

/** A 0..5 mastery score for the UI (derived, not stored). */
export function masteryLevel(card) {
  if (!card.lastReview) return 0;
  if (card.stability >= 30) return 5;
  if (card.stability >= 14) return 4;
  if (card.stability >= 7) return 3;
  if (card.stability >= 3) return 2;
  return 1;
}
