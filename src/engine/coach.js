// =============================================================================
// COACH (v57) — the rule-based "coach brain" behind the Home flow.
//
// No AI backend. Every line the coach says is derived from REAL learner
// state: the FSRS progress map (lapses + retrievability), the session log,
// the streak, and lesson counts. Pure functions only — trivially testable,
// nothing here touches storage or React.
// =============================================================================

import { retrievability } from "./srs.js";

export function todayKey(now = new Date()) {
  return now.toDateString();
}

// ---------------------------------------------------------------------------
// Weakest words — the "you wobbled on X → 2-min fix" source of truth.
// A word qualifies when the learner has actually met it (reps > 0) and it is
// genuinely shaky: it has lapsed at least once, or its recall probability has
// decayed low. Sorted worst-first.
// ---------------------------------------------------------------------------
export function weakestWords(vocab = [], progress = {}, n = 3, now = Date.now()) {
  const scored = [];
  for (const v of vocab) {
    const card = progress[v.id];
    if (!card || !(card.reps > 0)) continue;
    const r = retrievability(card, now);
    const lapses = card.lapses || 0;
    if (lapses < 1 && r >= 0.6) continue; // solid — leave it alone
    scored.push({ word: v, lapses, r });
  }
  scored.sort((a, b) => (b.lapses - a.lapses) || (a.r - b.r));
  return scored.slice(0, n);
}

// ---------------------------------------------------------------------------
// Streak stages — the flame that EVOLVES instead of a bare number.
// ---------------------------------------------------------------------------
export function streakStage(streak = 0) {
  if (streak >= 30) return { emoji: "☄️", label: "Unstoppable", size: 22 };
  if (streak >= 14) return { emoji: "🌋", label: "On fire", size: 21 };
  if (streak >= 7)  return { emoji: "🔥", label: "Blazing", size: 20 };
  if (streak >= 3)  return { emoji: "🔥", label: "Burning", size: 18 };
  if (streak >= 1)  return { emoji: "✨", label: "Spark lit", size: 17 };
  return { emoji: "🌱", label: "Plant your streak", size: 17 };
}

// ---------------------------------------------------------------------------
// Milestones — progress with MEANING. Instead of "67%", the coach says
// "you're 2 sessions away from ordering food". Ladder is in completed
// lessons for the active language.
// ---------------------------------------------------------------------------
const MILESTONES = [
  { at: 2,  goal: "introducing yourself" },
  { at: 4,  goal: "greeting people with confidence" },
  { at: 6,  goal: "ordering food and drink" },
  { at: 9,  goal: "holding a basic conversation" },
  { at: 12, goal: "talking about your family" },
  { at: 16, goal: "getting around while travelling" },
  { at: 22, goal: "telling simple stories" },
  { at: 30, goal: "thinking in the language" },
];

export function nextMilestone(appState, langCode) {
  const done = appState?.lessonsCompleted?.[langCode] || 0;
  const next = MILESTONES.find((m) => m.at > done);
  if (!next) return null;
  return { remaining: next.at - done, goal: next.goal };
}

// ---------------------------------------------------------------------------
// The coach line — picks the ONE most relevant thing to say, in priority
// order: shaky words > big review backlog > streak protection > milestone
// pull > gentle default. Deterministic given the same state.
// ---------------------------------------------------------------------------
export function coachLine({ langName, due = 0, weakWord = null, streak = 0, milestone = null, planDoneCount = 0, planTotal = 4 }) {
  if (planDoneCount >= planTotal) {
    return `That's today's plan done. Anything extra now is pure bonus — your ${langName} thanks you.`;
  }
  if (weakWord) {
    const shown = weakWord.translit || weakWord.lemma;
    return `"${shown}" wobbled last time you saw it. A two-minute fix now and it stays yours.`;
  }
  if (due >= 8) {
    return `${due} words are starting to drift. A quick warm-up brings them back before they fade.`;
  }
  if (streak >= 3 && planDoneCount === 0) {
    return `You're on a ${streak}-day streak — one short session today keeps it alive.`;
  }
  if (milestone) {
    return `You're ${milestone.remaining} ${milestone.remaining === 1 ? "session" : "sessions"} away from ${milestone.goal}. Ready to push your ${langName} today?`;
  }
  return `Ready to push your ${langName} today? One step at a time — I've lined them up below.`;
}

export function daypart(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// ---------------------------------------------------------------------------
// Real-world goal labels — turns academic unit themes into practical goals
// ("Greetings" → "Say hello like a local"). Keyword-matched so it works
// across all 12 languages' unit sets; falls back to the unit's own title.
// ---------------------------------------------------------------------------
const GOAL_MAP = [
  [/greet/i,               "Say hello like a local"],
  [/about you|introduc/i,  "Introduce yourself"],
  [/family/i,              "Talk about your family"],
  [/number/i,              "Count, pay, bargain"],
  [/food|drink|eat/i,      "Order food & drink"],
  [/verb/i,                "Say what you're doing"],
  [/travel|direction|place/i, "Find your way around"],
  [/time|day|week/i,       "Make plans & tell time"],
  [/colou?r|adjective|describ/i, "Describe the world"],
  [/home|house/i,          "Talk about home"],
  [/work|job/i,            "Talk about your work"],
  [/body|health/i,         "Explain how you feel"],
  [/weather/i,             "Chat about the weather"],
  [/shop|market|buy/i,     "Shop at the market"],
  [/question/i,            "Ask real questions"],
  [/feel|emotion/i,        "Say how you feel"],
  [/nature|animal/i,       "Talk about the world outside"],
  [/clothes|wear/i,        "Talk about what you wear"],
];

export function goalLabel(unit) {
  const t = unit?.title || "";
  for (const [re, label] of GOAL_MAP) {
    if (re.test(t)) return label;
  }
  return t;
}

// Rough honest time estimate: ~3 quiz items a minute, minimum 1 minute.
export function estMinutes(items = 6) {
  return Math.max(1, Math.round(items / 3));
}
