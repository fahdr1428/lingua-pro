// =============================================================================
// GAMIFICATION — levels, badges, missions. Every reward is tied to REAL
// learning (words mastered, passages understood, consistency), never to raw
// time spent or compulsive login. Honest by design — keeps the "respect the
// learner" positioning while still feeling motivating and alive.
// =============================================================================

// -----------------------------------------------------------------------------
// LEVELS — derived from total XP. Names mean something (a capability ladder),
// not just numbers. Thresholds grow gradually so early levels feel attainable.
// -----------------------------------------------------------------------------
const LEVELS = [
  { level: 1, name: "First Words", minXp: 0, emoji: "🌱" },
  { level: 2, name: "Getting Started", minXp: 100, emoji: "🌿" },
  { level: 3, name: "Finding Your Feet", minXp: 250, emoji: "🍃" },
  { level: 4, name: "Building Up", minXp: 500, emoji: "🌳" },
  { level: 5, name: "Conversational Basics", minXp: 900, emoji: "💬" },
  { level: 6, name: "Holding Your Own", minXp: 1500, emoji: "🗣️" },
  { level: 7, name: "Comfortable", minXp: 2400, emoji: "☕" },
  { level: 8, name: "Confident", minXp: 3600, emoji: "✨" },
  { level: 9, name: "Fluent-Track", minXp: 5200, emoji: "🎯" },
  { level: 10, name: "Advanced", minXp: 7500, emoji: "🏔️" },
];

export function getLevel(totalXp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (totalXp >= l.minXp) current = l;
  }
  const next = LEVELS.find((l) => l.minXp > totalXp) || null;
  const span = next ? next.minXp - current.minXp : 1;
  const into = totalXp - current.minXp;
  const progressPct = next ? Math.min(1, into / span) : 1;
  return {
    ...current,
    next,
    progressPct,
    xpToNext: next ? next.minXp - totalXp : 0,
  };
}

// -----------------------------------------------------------------------------
// BADGES — each represents a real capability or genuine consistency.
// `check(ctx)` receives { stats, appState, pack } and returns true when earned.
// -----------------------------------------------------------------------------
export const BADGES = [
  {
    id: "first_lesson",
    name: "First Steps",
    emoji: "👣",
    desc: "Completed your first lesson",
    check: (c) => (c.appState.sessions || []).length >= 1,
  },
  {
    id: "words_25",
    name: "Vocabulary Sprout",
    emoji: "🌱",
    desc: "Learned 25 words",
    check: (c) => c.stats.learned >= 25,
  },
  {
    id: "words_50",
    name: "Word Collector",
    emoji: "📚",
    desc: "Learned 50 words",
    check: (c) => c.stats.learned >= 50,
  },
  {
    id: "words_100",
    name: "Centurion",
    emoji: "💯",
    desc: "Learned 100 words",
    check: (c) => c.stats.learned >= 100,
  },
  {
    id: "mastered_25",
    name: "Solid Foundation",
    emoji: "🧱",
    desc: "Mastered 25 words (long-term recall)",
    check: (c) => c.stats.mastered >= 25,
  },
  {
    id: "mastered_50",
    name: "Deep Roots",
    emoji: "🌳",
    desc: "Mastered 50 words",
    check: (c) => c.stats.mastered >= 50,
  },
  {
    id: "consistent_7",
    name: "Steady Hand",
    emoji: "🎯",
    desc: "Studied 7 different days",
    check: (c) => uniqueStudyDays(c.appState) >= 7,
  },
  {
    id: "consistent_30",
    name: "Habit Formed",
    emoji: "⭐",
    desc: "Studied 30 different days",
    check: (c) => uniqueStudyDays(c.appState) >= 30,
  },
  {
    id: "alphabet_done",
    name: "Script Reader",
    emoji: "🔤",
    desc: "Completed an alphabet lesson",
    check: (c) => {
      try {
        const ap = JSON.parse(localStorage.getItem("alphabet_progress") || "{}");
        const langProg = ap[c.pack.code] || {};
        return Object.keys(langProg).length >= 1;
      } catch { return false; }
    },
  },
  {
    id: "reader",
    name: "First Read",
    emoji: "📖",
    desc: "Understood a reading passage",
    check: (c) => (c.appState.passagesRead || 0) >= 1,
  },
  {
    id: "polyglot_2",
    name: "Two Tongues",
    emoji: "🌍",
    desc: "Studied 2 different languages",
    check: (c) => Object.keys(c.appState.langXp || {}).length >= 2,
  },
];

function uniqueStudyDays(appState) {
  const days = new Set(
    (appState.sessions || []).map((s) => new Date(s.ts).toDateString())
  );
  return days.size;
}

export function earnedBadges(ctx) {
  return BADGES.filter((b) => {
    try { return b.check(ctx); } catch { return false; }
  });
}

// -----------------------------------------------------------------------------
// MISSIONS — small, purposeful goals. Refresh daily. Tied to learning actions,
// never "open the app" or "spend N minutes".
// -----------------------------------------------------------------------------
export function getDailyMissions(appState, pack) {
  const today = new Date().toDateString();
  const todaySessions = (appState.sessions || []).filter(
    (s) => new Date(s.ts).toDateString() === today
  );
  const wordsToday = todaySessions.reduce((sum, s) => sum + (s.correct || 0), 0);
  const xpToday = todaySessions.reduce((sum, s) => sum + (s.xp || 0), 0);
  const lessonsToday = todaySessions.length;
  const passagesToday = (appState.passageLog || []).filter(
    (p) => new Date(p).toDateString() === today
  ).length;

  return [
    {
      id: "m_words",
      label: "Practice 10 words",
      emoji: "📝",
      progress: Math.min(wordsToday, 10),
      target: 10,
      done: wordsToday >= 10,
    },
    {
      id: "m_lesson",
      label: "Complete a lesson",
      emoji: "✅",
      progress: Math.min(lessonsToday, 1),
      target: 1,
      done: lessonsToday >= 1,
    },
    {
      id: "m_xp",
      label: "Earn 30 XP",
      emoji: "⚡",
      progress: Math.min(xpToday, 30),
      target: 30,
      done: xpToday >= 30,
    },
    {
      id: "m_read",
      label: "Read one passage",
      emoji: "📖",
      progress: Math.min(passagesToday, 1),
      target: 1,
      done: passagesToday >= 1,
    },
  ];
}

// =============================================================================
// PROGRESSION MILESTONES — translates raw stats into CAPABILITY statements.
// This is healthy motivation: "here's what you can now actually DO", not
// "here's a number going up". Each milestone is true and earned.
// =============================================================================
export function getProgressionMilestones(ctx) {
  const { learned = 0, mastered = 0, alphabetDone = false, passagesRead = 0, daysStudied = 0 } = ctx;
  return [
    {
      id: "p_start",
      label: "Started your journey",
      capability: "You've begun learning — the hardest step.",
      emoji: "🌱",
      reached: learned >= 1,
    },
    {
      id: "p_alphabet",
      label: "Read the script",
      capability: "You can recognise letters and sound them out.",
      emoji: "🔤",
      reached: alphabetDone,
    },
    {
      id: "p_survival",
      label: "Survival words",
      capability: "You know enough to greet someone and be polite.",
      emoji: "👋",
      reached: learned >= 15,
    },
    {
      id: "p_first_read",
      label: "First real text",
      capability: "You understood a short passage of connected language.",
      emoji: "📖",
      reached: passagesRead >= 1,
    },
    {
      id: "p_phrases",
      label: "Everyday phrases",
      capability: "You can handle simple everyday situations — food, directions, family.",
      emoji: "💬",
      reached: learned >= 50,
    },
    {
      id: "p_retention",
      label: "It's sticking",
      capability: "You've held 25+ words in long-term memory, not just seen them.",
      emoji: "🧠",
      reached: mastered >= 25,
    },
    {
      id: "p_habit",
      label: "A real habit",
      capability: "You've studied across many days — this is now part of your life.",
      emoji: "⭐",
      reached: daysStudied >= 14,
    },
    {
      id: "p_foundation",
      label: "Solid foundation",
      capability: "100+ words and growing — you have a base to build real fluency on.",
      emoji: "🏔️",
      reached: learned >= 100,
    },
  ];
}
