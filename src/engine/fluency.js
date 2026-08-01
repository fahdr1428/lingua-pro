// =============================================================================
// FLUENCY SCORE (v73) — one number, and the four real things behind it.
//
// A score is the most dangerous feature in a learning app, because a score
// people don't believe is worse than no score at all. So the rule here is
// absolute: EVERY sub-score is computed from something the learner measurably
// did, and where the evidence isn't there the value is `null` and the UI shows
// "—". Nothing is padded, nothing starts at a flattering 50, and nothing moves
// unless behaviour moved.
//
// THE FOUR DIMENSIONS, and what each is actually measuring:
//
//   ACCURACY       mean grade across recent utterances, weighted toward recent
//                  ones. This is "did what you said come out right".
//   RESPONSIVENESS how long between being asked and starting to speak. Hesitation
//                  is the single most visible marker of non-fluency, and it's the
//                  one thing a text-based app can never measure. We can.
//   RANGE          how many DISTINCT words the learner has produced out loud,
//                  against a target band. Producing is a far smaller set than
//                  recognising, which is exactly why it's the honest measure.
//   PRONUNCIATION  mean similarity score from the speech grader, over attempts
//                  that actually went through a microphone. Typed answers are
//                  excluded — they say nothing about pronunciation, and folding
//                  them in would inflate the number for someone who never spoke.
//
// The overall score is a weighted blend of whichever dimensions have evidence,
// renormalised so a learner who has only ever typed still gets a meaningful
// overall out of the three that apply — rather than being silently marked down
// for a dimension they haven't attempted.
// =============================================================================

// Recency weighting: an utterance from 30 days ago counts about a third as much
// as one from today. Fluency is a "now" property.
const RECENCY_HALF_LIFE_DAYS = 21;

// What counts as a fluent-feeling pause before speaking. Under 2s reads as
// fluent; past ~9s the learner is translating in their head, which is precisely
// the habit this metric exists to surface.
const FAST_MS = 2000;
const SLOW_MS = 9000;

// Distinct spoken words that counts as a full "range" score. Deliberately modest:
// a confident A2 speaker produces a few hundred distinct words, and pretending
// otherwise makes the bar meaningless.
const RANGE_TARGET = 350;

const MIN_TURNS_FOR_SCORE = 5;
const MIN_TIMED_FOR_SPEED = 4;
const MIN_SPOKEN_FOR_PRONUNCIATION = 4;

function recencyWeight(ts) {
  const days = (Date.now() - ts) / 86400000;
  return Math.pow(0.5, days / RECENCY_HALF_LIFE_DAYS);
}

function weightedMean(items, valueOf) {
  let sum = 0, weight = 0;
  for (const it of items) {
    const v = valueOf(it);
    if (v === null || v === undefined || Number.isNaN(v)) continue;
    const w = recencyWeight(it.ts);
    sum += v * w;
    weight += w;
  }
  return weight > 0 ? sum / weight : null;
}

const pct = (x) => (x === null ? null : Math.max(0, Math.min(100, Math.round(x * 100))));

/**
 * Compute the current fluency picture from a profile.
 *
 * @returns {{
 *   overall: number|null,
 *   accuracy: number|null, responsiveness: number|null,
 *   range: number|null, pronunciation: number|null,
 *   evidence: {turns:number, timed:number, spoken:number, distinctWords:number},
 *   provisional: boolean,
 *   missing: string[],
 * }}
 */
export function computeFluency(profile) {
  const turns = profile?.turns || [];
  const spokenWords = profile?.spokenWords || [];

  const graded = turns.filter((t) => typeof t.score === "number");
  const timed = turns.filter((t) => typeof t.latencyMs === "number" && t.latencyMs > 0);
  // Only microphone attempts carry a meaningful pronunciation signal.
  const spoken = turns.filter((t) => t.spoken && typeof t.score === "number");

  const missing = [];

  // --- accuracy -----------------------------------------------------------
  let accuracy = null;
  if (graded.length >= MIN_TURNS_FOR_SCORE) accuracy = weightedMean(graded, (t) => t.score);
  else missing.push("accuracy");

  // --- responsiveness -----------------------------------------------------
  let responsiveness = null;
  if (timed.length >= MIN_TIMED_FOR_SPEED) {
    responsiveness = weightedMean(timed, (t) => {
      if (t.latencyMs <= FAST_MS) return 1;
      if (t.latencyMs >= SLOW_MS) return 0;
      return 1 - (t.latencyMs - FAST_MS) / (SLOW_MS - FAST_MS);
    });
  } else missing.push("responsiveness");

  // --- range --------------------------------------------------------------
  // Square-rooted: going from 10 to 50 distinct words is a much bigger real
  // change than 300 to 340, and a linear scale would make early progress
  // invisible exactly when encouragement matters most.
  let range = null;
  if (spokenWords.length >= 10) {
    range = Math.min(1, Math.sqrt(spokenWords.length / RANGE_TARGET));
  } else missing.push("range");

  // --- pronunciation ------------------------------------------------------
  let pronunciation = null;
  if (spoken.length >= MIN_SPOKEN_FOR_PRONUNCIATION) {
    pronunciation = weightedMean(spoken, (t) => t.score);
  } else missing.push("pronunciation");

  // --- overall ------------------------------------------------------------
  // Renormalised over whatever we actually have, so a typing-only learner isn't
  // penalised for a pronunciation score they never had the chance to earn.
  const parts = [
    { v: accuracy, w: 0.40 },
    { v: responsiveness, w: 0.20 },
    { v: range, w: 0.15 },
    { v: pronunciation, w: 0.25 },
  ].filter((p) => p.v !== null);

  const totalW = parts.reduce((n, p) => n + p.w, 0);
  const overall = totalW > 0
    ? parts.reduce((n, p) => n + p.v * p.w, 0) / totalW
    : null;

  return {
    overall: pct(overall),
    accuracy: pct(accuracy),
    responsiveness: pct(responsiveness),
    range: pct(range),
    pronunciation: pct(pronunciation),
    evidence: {
      turns: graded.length,
      timed: timed.length,
      spoken: spoken.length,
      distinctWords: spokenWords.length,
    },
    // Below this much evidence the number moves a lot per turn, and saying so is
    // more honest than showing a confident-looking figure built on four data points.
    provisional: graded.length < 15,
    missing,
  };
}

/**
 * Change since the last recorded snapshot, so the app can say "up 4 this week"
 * with something behind it. Returns null when there's nothing to compare to.
 */
export function fluencyDelta(profile, current) {
  const history = profile?.fluency || [];
  if (!history.length || current?.overall === null) return null;
  const weekAgo = Date.now() - 7 * 86400000;
  // Prefer a point from about a week back; fall back to the oldest we have.
  const prior = [...history].reverse().find((p) => p.ts <= weekAgo) || history[0];
  if (!prior || typeof prior.overall !== "number") return null;
  const delta = current.overall - prior.overall;
  return { delta, since: prior.ts, days: Math.max(1, Math.round((Date.now() - prior.ts) / 86400000)) };
}

export const DIMENSIONS = [
  {
    key: "accuracy",
    label: "Accuracy",
    blurb: "How often what you said came out right",
    unlock: "Answer a few more prompts",
  },
  {
    key: "responsiveness",
    label: "Responsiveness",
    blurb: "How quickly you start speaking — hesitation is the clearest tell",
    unlock: "Answer a few prompts with the microphone",
  },
  {
    key: "range",
    label: "Range",
    blurb: "Distinct words you've actually produced out loud",
    unlock: "Say a few more different things",
  },
  {
    key: "pronunciation",
    label: "Pronunciation",
    blurb: "How closely your speech matched the target",
    unlock: "Use the microphone rather than typing",
  },
];

/** A short, honest sentence about where they are. Never flattering, never bleak. */
export function fluencyBlurb(f) {
  if (f.overall === null) {
    return "Speak a few lines and your fluency picture starts here.";
  }
  if (f.provisional) {
    return `Early reading from ${f.evidence.turns} attempts — it'll settle as you do more.`;
  }
  if (f.overall >= 85) return "You're being understood easily and answering without stalling.";
  if (f.overall >= 70) return "Comfortably understood. Speed is usually what's left at this point.";
  if (f.overall >= 50) return "Getting through, with pauses. More speaking is the fastest lever.";
  return "Early days — every attempt out loud moves this more than a lesson does.";
}
