// v57 render test — run with: node render-test.mjs
// Renders the new Home coach-flow in several real learner states via jsdom
// and asserts the plan, coach line, CTA, and journey all appear. Also unit-
// tests the coach brain (pure functions).

import { JSDOM } from "jsdom";

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`, {
  url: "http://localhost/",
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.localStorage = dom.window.localStorage;
global.HTMLElement = dom.window.HTMLElement;
global.SVGElement = dom.window.SVGElement;
global.Audio = class { play() { return Promise.resolve(); } pause() {} };
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

const React = (await import("react")).default;
const { createRoot } = await import("react-dom/client");
const screens = await import("./st.mjs");
const coach = await import("./coach-test.mjs");

let failures = 0;
function check(name, cond, extra = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else { failures++; console.error(`  ✗ FAIL: ${name} ${extra}`); }
}

// ---------------------------------------------------------------------------
// Coach brain unit checks
// ---------------------------------------------------------------------------
console.log("\n[coach.js]");
check("goalLabel maps Greetings", coach.goalLabel({ title: "Greetings" }) === "Say hello like a local");
check("goalLabel maps Food & Drink", coach.goalLabel({ title: "Food & Drink" }) === "Order food & drink");
check("goalLabel falls back to title", coach.goalLabel({ title: "Weird Custom Unit" }) === "Weird Custom Unit");
check("streakStage 0 is seed", coach.streakStage(0).emoji === "🌱");
check("streakStage 8 is blazing", coach.streakStage(8).label === "Blazing");
check("nextMilestone counts down", (() => {
  const m = coach.nextMilestone({ lessonsCompleted: { ur: 1 } }, "ur");
  return m && m.remaining === 1 && m.goal === "introducing yourself";
})());
check("nextMilestone null past ladder", coach.nextMilestone({ lessonsCompleted: { ur: 99 } }, "ur") === null);
check("weakestWords finds lapsed word", (() => {
  const vocab = [{ id: "a" }, { id: "b" }];
  const now = Date.now();
  const progress = {
    a: { reps: 3, lapses: 2, stability: 5, lastReview: now },
    b: { reps: 3, lapses: 0, stability: 50, lastReview: now },
  };
  const w = coach.weakestWords(vocab, progress, 3, now);
  return w.length === 1 && w[0].word.id === "a";
})());
check("coachLine mentions weak word", coach.coachLine({ langName: "Urdu", weakWord: { lemma: "سلام", translit: "salaam" } }).includes("salaam"));
check("coachLine celebrates done plan", coach.coachLine({ langName: "Urdu", planDoneCount: 4, planTotal: 4 }).includes("done"));
check("estMinutes floor", coach.estMinutes(2) === 1 && coach.estMinutes(6) === 2);

// ---------------------------------------------------------------------------
// Render harness
// ---------------------------------------------------------------------------
const PACK = {
  code: "ur",
  vocab: [
    { id: "w1", lemma: "سلام", translit: "salaam", meaning: "hello", unit: "u1" },
    { id: "w2", lemma: "شکریہ", translit: "shukriya", meaning: "thank you", unit: "u1" },
    { id: "w3", lemma: "پانی", translit: "paani", meaning: "water", unit: "u2" },
  ],
  units: [
    { id: "u1", title: "Greetings", emoji: "👋", description: "Say hello, goodbye, please and thank you" },
    { id: "u2", title: "About You", emoji: "🙋", description: "Pronouns and basic introductions" },
    { id: "u3", title: "Family", emoji: "👨‍👩‍👧", description: "Mother, father, brother, sister" },
    { id: "u4", title: "Numbers 1-10", emoji: "🔢", description: "Count and use basic numbers" },
  ],
  frameworks: [{ title: "SOV order", body: "Urdu puts the verb last." }],
  alphabet: [{ char: "ا" }],
};

function makeEngine({ unitProgress, progress = {} } = {}) {
  return {
    getUnitProgress: async () =>
      unitProgress ||
      PACK.units.map((u, i) => ({ ...u, total: 5, learned: i === 0 ? 3 : 0, mastered: 0, pct: i === 0 ? 0.6 : 0 })),
    getProgress: async () => progress,
  };
}

const BASE_STATE = {
  streak: 0, gems: 50, hearts: 5, totalXp: 0, dailyGoalXp: 35, isPremium: false,
  sessions: [], metCharacters: ["ur"], lessonsCompleted: {}, learningGoal: {},
  chaptersPassed: {}, sentenceDropsDone: {}, lastCheckpointAt: {},
  userName: "", momentDone: {}, planVisited: {}, sessionSize: 6,
};

async function renderHome(props) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  let error = null;
  const origErr = console.error;
  console.error = (...a) => { const s = String(a[0]); if (s.includes("Error") && !s.includes("act(")) error = a; };
  root.render(React.createElement(screens.Home, props));
  await new Promise((r) => setTimeout(r, 350)); // flush effects + typewriter ticks
  console.error = origErr;
  return { text: container.textContent, html: container.innerHTML, root, container, error };
}

const noop = () => {};
const defaultProps = () => ({
  engine: makeEngine(),
  pack: PACK,
  stats: { total: 3, learned: 2, due: 0, mastered: 0 },
  appState: { ...BASE_STATE },
  setAppState: noop,
  onNavigate: noop,
  onPickLanguage: noop,
});

// --- Scenario 1: fresh-ish user, light day (Moment warm-up) ---
console.log("\n[Home — fresh user, light day]");
{
  const r = await renderHome(defaultProps());
  check("no render error", !r.error, JSON.stringify(r.error));
  check("shows Today's plan", r.text.includes("Today's plan"));
  check("plan has 4 steps", r.text.includes("Step 1") && r.text.includes("Step 4"));
  check("warm-up is inline Moment", r.text.includes("How would you say"));
  check("Learn step uses goal label", r.text.includes("Say hello like a local"));
  check("speak step present", r.text.includes("shadow a real conversation"));
  check("sticky CTA present", r.html.includes("sticky-cta"));
  check("name capture shown", r.text.includes("What should I call you?"));
  check("journey renamed", r.text.includes("Real-life goals"));
  check("journey shows goal labels", r.text.includes("Introduce yourself"));
  check("streak seed stage", r.text.includes("Plant your streak"));
  check("root stem in DOM", r.html.includes("plan-stem"));
  r.root.unmount();
}

// --- Scenario 2: review backlog (due >= 4) ---
console.log("\n[Home — review backlog]");
{
  const p = defaultProps();
  p.stats = { total: 3, learned: 3, due: 6, mastered: 0 };
  const r = await renderHome(p);
  check("no render error", !r.error, JSON.stringify(r.error));
  check("warm-up becomes review", r.text.includes("6 words drifting back"));
  check("no inline Moment on review days", !r.text.includes("How would you say"));
  r.root.unmount();
}

// --- Scenario 3: plan partially done via today's real sessions + name set ---
console.log("\n[Home — partially done, named user]");
{
  const p = defaultProps();
  p.appState = {
    ...BASE_STATE,
    userName: "Syed",
    streak: 4,
    momentDone: { ur: new Date().toDateString() },
    sessions: [{ ts: Date.now(), language: "ur", xp: 20, correct: 5, total: 6, mode: "unit" }],
    lessonsCompleted: { ur: 3 },
    planVisited: {},
  };
  const r = await renderHome(p);
  check("no render error", !r.error, JSON.stringify(r.error));
  check("greets by name", r.text.includes("Syed"));
  check("no name capture once named", !r.text.includes("What should I call you?"));
  check("steps marked done", r.text.includes("· done"));
  check("flame evolved (Burning)", r.text.includes("Burning"));
  check("milestone headline", r.text.includes("1 session") && r.text.includes("from greeting people"));
  r.root.unmount();
}

// --- Scenario 4: weak word → 2-min fix chip ---
console.log("\n[Home — weak word fix]");
{
  const now = Date.now();
  const p = defaultProps();
  p.engine = makeEngine({
    progress: { w1: { reps: 4, lapses: 3, stability: 2, lastReview: now - 3 * 86400000 } },
  });
  const r = await renderHome(p);
  check("no render error", !r.error, JSON.stringify(r.error));
  check("fix chip appears", r.text.includes("2-min fix") && r.text.includes("salaam"));
  r.root.unmount();
}

// --- PracticeHub ---
console.log("\n[PracticeHub]");
{
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(React.createElement(screens.PracticeHub, {
    pack: PACK,
    stats: { learned: 20, mastered: 4, due: 3 },
    appState: { ...BASE_STATE },
    onNavigate: noop,
  }));
  await new Promise((r) => setTimeout(r, 100));
  const t = container.textContent;
  check("hub renders title", t.includes("Practice"));
  check("hub shows review door", t.includes("Review 3 due words"));
  check("hub shows flashcards + grammar + words", t.includes("Flashcards") && t.includes("Grammar") && t.includes("My words"));
  check("hub shows big exam at 20 learned", t.includes("Big exam"));
  check("hub shows letters door", t.includes("Letters & sounds"));
  root.unmount();
}

console.log(failures === 0 ? "\nALL RENDER TESTS PASSED ✅" : `\n${failures} FAILURES ❌`);
process.exit(failures === 0 ? 0 : 1);
