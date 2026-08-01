// =============================================================================
// MISSIONS (v73) — the outcome the app never had.
//
// THE PROBLEM: "practice conversation" is not a thing anyone wants to do. People
// want to order without switching to English, get through a work call, argue a
// refund and win. Practice is the cost; the outcome is the point. An app whose
// conversations just… stop, with no verdict, gives the learner no reason to come
// back and no way to know if it worked.
//
// A mission is a conversation with a PASS CONDITION. Every one has:
//
//   objectives  concrete, checkable things that must happen in the dialogue —
//               not vibes. "Ask the price" is checkable; "converse well" is not.
//   failIf      the things that end it. Almost always includes switching to
//               English, because that's the actual failure mode in real life.
//   persona     who you're up against. A refund argument against a friendly
//               native teaches nothing; it needs someone unhelpful.
//   pressure    raises the stakes independently of the persona.
//
// The model is given the objectives and reports, per turn, which are met. The
// app does not guess — it reads the returned list. Objectives the model doesn't
// report are simply not met.
//
// DIFFICULTY is the learner's real level (profile.js), not a per-mission
// setting: the same mission should be winnable at A1 and still interesting at B2,
// with the other side adjusting rather than the goal changing.
// =============================================================================

export const MISSION_CATEGORIES = [
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "daily", label: "Everyday", icon: "🛒" },
  { id: "work", label: "Work", icon: "💼" },
  { id: "social", label: "Social", icon: "🍷" },
  { id: "hard", label: "Under pressure", icon: "🔥" },
];

export const MISSIONS = [
  // ---------------------------------------------------------------- everyday
  {
    id: "order-coffee",
    category: "daily",
    title: "Order without switching to English",
    stake: "You're at the counter. There's a queue behind you.",
    setting: "A busy café. You are the customer; the other person is serving.",
    persona: "rushed",
    pressure: 2,
    minutes: 3,
    objectives: [
      { id: "greet", label: "Greet them the way a local would" },
      { id: "order", label: "Order a drink" },
      { id: "modify", label: "Change or add something to the order" },
      { id: "pay", label: "Ask what it costs and respond" },
    ],
    failIf: ["Switching to English for a full sentence", "Giving up and leaving without ordering"],
    opener: "They look up from the till and wait.",
  },
  {
    id: "refund-argument",
    category: "hard",
    title: "Argue a refund — and win",
    stake: "They've already said no once. You're right, and you need to hold your ground politely.",
    setting: "A shop. You are returning something faulty; the other person does not want to refund it.",
    persona: "rushed",
    pressure: 3,
    minutes: 5,
    objectives: [
      { id: "problem", label: "Explain clearly what's wrong with it" },
      { id: "refuse", label: "Push back when they first refuse" },
      { id: "polite", label: "Stay polite while insisting" },
      { id: "resolve", label: "Get to a refund, replacement, or a manager" },
    ],
    failIf: ["Switching to English", "Accepting the first refusal without pushing back"],
    opener: "They glance at the item and say it can't be returned.",
  },
  {
    id: "directions-lost",
    category: "travel",
    title: "You're lost, and their directions are fast",
    stake: "No phone signal. You have to actually understand the answer.",
    setting: "A street. You are lost; the other person is a local passer-by in a hurry.",
    persona: "rushed",
    pressure: 2,
    minutes: 3,
    objectives: [
      { id: "ask", label: "Stop someone politely and ask the way" },
      { id: "understand", label: "Show you understood — repeat it back" },
      { id: "clarify", label: "Ask them to repeat or slow down when you don't catch it" },
      { id: "thank", label: "Thank them properly" },
    ],
    failIf: ["Switching to English", "Pretending to understand and walking off"],
    opener: "Someone is walking past. You have about three seconds to stop them.",
  },
  {
    id: "doctor-visit",
    category: "daily",
    title: "Explain what hurts",
    stake: "You need to be understood correctly. Getting this wrong has consequences.",
    setting: "A doctor's surgery. You are the patient; the other person is the doctor.",
    persona: "teacher",
    pressure: 1,
    minutes: 4,
    objectives: [
      { id: "symptom", label: "Say what's wrong and where" },
      { id: "duration", label: "Say how long it's been going on" },
      { id: "answer", label: "Answer their follow-up questions" },
      { id: "instructions", label: "Confirm you understood what to do next" },
    ],
    failIf: ["Switching to English", "Leaving without understanding the instructions"],
    opener: "The doctor asks what brought you in today.",
  },
  // -------------------------------------------------------------------- work
  {
    id: "job-interview",
    category: "work",
    title: "Get through the interview",
    stake: "Formal register, follow-up questions, and no allowances made for you.",
    setting: "A job interview. You are the candidate; the other person is interviewing you.",
    persona: "interviewer",
    pressure: 3,
    minutes: 6,
    objectives: [
      { id: "introduce", label: "Introduce yourself in the formal register" },
      { id: "experience", label: "Describe what you've done before" },
      { id: "why", label: "Say why you want the role" },
      { id: "question", label: "Ask them a question back" },
    ],
    failIf: ["Switching to English", "Using the informal register throughout"],
    opener: "They shake your hand, sit down, and ask you to tell them about yourself.",
  },
  {
    id: "phone-call",
    category: "work",
    title: "Take a call with no faces to read",
    stake: "No gestures, no lip-reading, no context. Just the voice.",
    setting: "A phone call. You are taking a call about an appointment; the other person is calling you.",
    persona: "rushed",
    pressure: 2,
    minutes: 4,
    objectives: [
      { id: "answer", label: "Answer the phone the way a local would" },
      { id: "grasp", label: "Work out what they want" },
      { id: "arrange", label: "Agree a time or a next step" },
      { id: "close", label: "End the call properly" },
    ],
    failIf: ["Switching to English", "Hanging up without agreeing anything"],
    opener: "The phone rings. You pick up.",
  },
  // ------------------------------------------------------------------ social
  {
    id: "first-date",
    category: "social",
    title: "Keep a first date going",
    stake: "Silence is the enemy. You have to ask as much as you answer.",
    setting: "A first date at a bar. You are on the date; the other person is your date.",
    persona: "friendly",
    pressure: 1,
    minutes: 5,
    objectives: [
      { id: "smalltalk", label: "Open with something other than the weather" },
      { id: "ask", label: "Ask them at least two questions about themselves" },
      { id: "share", label: "Say something real about yourself" },
      { id: "next", label: "Suggest doing something again" },
    ],
    failIf: ["Switching to English", "Only answering and never asking"],
    opener: "They sit down, smile, and say they nearly got the wrong bar.",
  },
  {
    id: "meet-the-family",
    category: "social",
    title: "Meet their family without freezing",
    stake: "Respectful register, and someone's grandmother is watching.",
    setting: "A family home. You are meeting your partner's family for the first time.",
    persona: "friendly",
    pressure: 1,
    minutes: 5,
    objectives: [
      { id: "greet", label: "Greet the elders with the right level of respect" },
      { id: "compliment", label: "Compliment the food or the home" },
      { id: "answer", label: "Answer the questions they ask about you" },
      { id: "ask", label: "Ask them something in return" },
    ],
    failIf: ["Switching to English", "Using the casual register with the elders"],
    opener: "The door opens and three people are looking at you at once.",
  },
  // ------------------------------------------------------------------ travel
  {
    id: "missed-connection",
    category: "travel",
    title: "You've missed your connection",
    stake: "The desk is closing and there's one seat left on the later train.",
    setting: "A station ticket desk. You have missed a connection; the other person works there and is busy.",
    persona: "rushed",
    pressure: 3,
    minutes: 4,
    objectives: [
      { id: "explain", label: "Explain what happened" },
      { id: "options", label: "Ask what your options are" },
      { id: "decide", label: "Pick one and confirm the details" },
      { id: "cost", label: "Find out whether it costs anything" },
    ],
    failIf: ["Switching to English", "Walking away without a plan"],
    opener: "They're already looking at the next person in the queue.",
  },
  {
    id: "haggle-market",
    category: "travel",
    title: "Haggle at the market",
    stake: "The first price is not the price. Everyone knows it but you.",
    setting: "A market stall. You want to buy something; the seller has quoted a tourist price.",
    persona: "mate",
    pressure: 2,
    minutes: 4,
    objectives: [
      { id: "price", label: "Ask the price" },
      { id: "counter", label: "Make a counter-offer" },
      { id: "hold", label: "Hold your ground at least once" },
      { id: "close", label: "Agree a price or walk away politely" },
    ],
    failIf: ["Switching to English", "Paying the first price asked"],
    opener: "They name a number and watch your face.",
  },
];

export function getMission(id) {
  return MISSIONS.find((m) => m.id === id) || null;
}

export function missionsByCategory(categoryId) {
  return MISSIONS.filter((m) => m.category === categoryId);
}

/**
 * Missions in a sensible order for this learner: unattempted-but-approachable
 * first, then unpassed, then passed ones last (still available — a passed mission
 * is worth redoing at a higher level).
 */
export function recommendMissions(profile, goalId = null) {
  const history = profile?.missions || {};
  const goalWeight = { travel: "travel", conversation: "social", family: "social", basics: "daily" };
  const preferred = goalWeight[goalId] || null;

  return [...MISSIONS].sort((a, b) => {
    const ha = history[a.id], hb = history[b.id];
    const rank = (m, h) => {
      if (h?.passed) return 3;              // done — offer last
      if (h?.attempts) return 0;            // started and not finished — offer first
      if (preferred && m.category === preferred) return 1;
      return 2;
    };
    const ra = rank(a, ha), rb = rank(b, hb);
    if (ra !== rb) return ra - rb;
    return a.pressure - b.pressure;         // gentler first within a rank
  });
}

/** Pass bar: every objective, or all but one on the longer missions. */
export function passThreshold(mission) {
  return mission.objectives.length >= 4 ? mission.objectives.length - 1 : mission.objectives.length;
}
