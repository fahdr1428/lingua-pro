// =============================================================================
// LEARNING GOALS (v41) — the "choose your path" feature.
//
// Everyone completes the fixed CORE first (greetings + about-you basics). After
// that, instead of marching through units in a fixed order, the learner picks a
// GOAL. The goal decides which word categories get prioritised in their lessons
// — a relevance-first path rather than one straight line.
//
// Each goal lists `categories` in priority order. The lesson selector pulls new
// words preferentially from these categories (falling back to anything else
// once they're exhausted, so a learner never gets stuck).
//
// Goals are intentionally broad and few — too many choices is overwhelming.
// =============================================================================

export const LEARNING_GOALS = [
  {
    id: "basics",
    emoji: "🌱",
    title: "Just the basics",
    blurb: "The most useful everyday words — a solid all-round foundation.",
    // Broad spread of the most common everyday categories.
    categories: ["Common", "Useful", "People", "Food", "Time", "Numbers", "Verbs"],
  },
  {
    id: "conversation",
    emoji: "💬",
    title: "Everyday conversation",
    blurb: "Talk with people — questions, polite words, and common verbs.",
    categories: ["Greetings", "Useful", "Common", "Verbs", "People", "Feelings"],
  },
  {
    id: "travel",
    emoji: "✈️",
    title: "Travel & getting around",
    blurb: "Directions, transport, food, and the words you need on a trip.",
    categories: ["Travel", "Places", "Transport", "Food", "Numbers", "Useful"],
  },
  {
    id: "family",
    emoji: "👨‍👩‍👧",
    title: "Family & people",
    blurb: "Talk about family, relationships, and the people around you.",
    categories: ["Family", "People", "Feelings", "Body", "Common"],
  },
  {
    id: "everything",
    emoji: "🧭",
    title: "Take me through everything",
    blurb: "The classic path — every topic, in a balanced order.",
    // Empty = no prioritisation; selector uses its normal frequency order.
    categories: [],
  },
];

export function getGoal(goalId) {
  return LEARNING_GOALS.find((g) => g.id === goalId) || null;
}

// Given a learner's goal and the full vocab pool, return an ORDERED list of
// category names to prioritise new words from. Always returns something usable.
export function goalCategoryOrder(goalId) {
  const g = getGoal(goalId);
  if (!g || !g.categories.length) return null; // null = no preference
  return g.categories;
}
