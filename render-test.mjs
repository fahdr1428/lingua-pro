// v58 render test — run with: node render-test.mjs
// The home screen is now ONE action; these tests assert the priority chain
// (milestone exam → review → sentence drop → lesson), the stat strip, the
// quiet secondary actions, and the hub (now hosting the focus picker).

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
// Coach brain unit checks (unchanged brain)
// ---------------------------------------------------------------------------
console.log("\n[coach.js]");
check("goalLabel maps Greetings", coach.goalLabel({ title: "Greetings" }) === "Say hello like a local");
check("streakStage 0 is seed", coach.streakStage(0).emoji === "🌱");
check("nextMilestone counts down", (() => {
  const m = coach.nextMilestone({ lessonsCompleted: { ur: 1 } }, "ur");
  return m && m.remaining === 1;
})());
check("weakestWords finds lapsed word", (() => {
  const now = Date.now();
  const w = coach.weakestWords(
    [{ id: "a" }, { id: "b" }],
    { a: { reps: 3, lapses: 2, stability: 5, lastReview: now }, b: { reps: 3, lapses: 0, stability: 50, lastReview: now } },
    3, now
  );
  return w.length === 1 && w[0].word.id === "a";
})());

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
  frameworks: [],
  alphabet: [{ char: "ا" }],
};

function makeEngine({ progress = {} } = {}) {
  return {
    getUnitProgress: async () =>
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
  await new Promise((r) => setTimeout(r, 350));
  console.error = origErr;
  return { text: container.textContent, html: container.innerHTML, root, error };
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

// --- 1: fresh user → next action is the LESSON ---
console.log("\n[Home — fresh user → lesson]");
{
  const r = await renderHome(defaultProps());
  check("no render error", !r.error, JSON.stringify(r.error));
  check("hero eyebrow is Next lesson", r.text.includes("Next lesson"));
  check("hero title is goal label", r.text.includes("Say hello like a local"));
  check("Continue button with time", r.text.includes("Continue · ~"));
  check("lesson progress shown", r.text.includes("3 of 5 words"));
  check("daily ring present", r.html.includes("Daily goal 0%"));
  check("stat strip: streak/level/xp", r.text.includes("day streak") && r.text.includes("Level 1") && r.text.includes("XP today"));
  check("path renamed + tools link", r.text.includes("Your path") && r.text.includes("All practice tools"));
  check("name capture shown", r.text.includes("What should I call you?"));
  check("no plan rail (v57 removed)", !r.html.includes("plan-stem"));
  check("premium hero class present", r.html.includes("hero-premium"));
  r.root.unmount();
}

// --- 2: review backlog wins over lesson ---
console.log("\n[Home — review backlog]");
{
  const p = defaultProps();
  p.stats = { total: 3, learned: 3, due: 6, mastered: 0 };
  const r = await renderHome(p);
  check("no render error", !r.error, JSON.stringify(r.error));
  check("hero is review", r.text.includes("Bring back 6 words"));
  r.root.unmount();
}

// --- 3: milestone exam wins over everything ---
console.log("\n[Home — milestone exam due]");
{
  const p = defaultProps();
  p.stats = { total: 30, learned: 10, due: 6, mastered: 0 };
  p.appState = { ...BASE_STATE, lessonsCompleted: { ur: 3 } };
  const r = await renderHome(p);
  check("no render error", !r.error, JSON.stringify(r.error));
  check("hero is milestone exam", r.text.includes("Milestone exam") && r.text.includes("Prove your first 3 lessons"));
  r.root.unmount();
}

// --- 4: sentence drop earned (no review, no exam) ---
console.log("\n[Home — sentence drop]");
{
  const p = defaultProps();
  p.stats = { total: 30, learned: 10, due: 0, mastered: 0 };
  p.appState = { ...BASE_STATE, lessonsCompleted: { ur: 2 }, sentenceDropsDone: {} };
  const r = await renderHome(p);
  check("no render error", !r.error, JSON.stringify(r.error));
  check("hero is Sentence Lab", r.text.includes("Sentence Lab") && r.text.includes("Build:"));
  r.root.unmount();
}

// --- 5: goal met + named user + weak-word quiet link ---
console.log("\n[Home — goal met, named, weak word]");
{
  const now = Date.now();
  const p = defaultProps();
  p.engine = makeEngine({ progress: { w1: { reps: 4, lapses: 3, stability: 2, lastReview: now - 3 * 86400000 } } });
  p.appState = {
    ...BASE_STATE, userName: "Syed", streak: 4,
    sessions: [{ ts: now, language: "ur", xp: 40, correct: 6, total: 6, mode: "unit" }],
  };
  const r = await renderHome(p);
  check("no render error", !r.error, JSON.stringify(r.error));
  check("greets by name", r.text.includes("Syed"));
  check("goal met state", r.text.includes("Daily goal met") && r.text.includes("Keep going"));
  check("weak-word quiet link", r.text.includes("2-minute fix") && r.text.includes("salaam"));
  check("flame evolved", r.text.includes("🔥"));
  r.root.unmount();
}

// --- PracticeHub with focus picker ---
console.log("\n[PracticeHub]");
{
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(React.createElement(screens.PracticeHub, {
    pack: PACK,
    stats: { learned: 20, mastered: 4, due: 3 },
    appState: { ...BASE_STATE, lessonsCompleted: { ur: 2 } },
    setAppState: noop,
    onNavigate: noop,
  }));
  await new Promise((r) => setTimeout(r, 100));
  const t = container.textContent;
  check("hub renders", t.includes("Practice"));
  check("focus picker moved here", t.includes("Choose your focus"));
  check("review door", t.includes("Review 3 due words"));
  check("all drills present", t.includes("Flashcards") && t.includes("Grammar") && t.includes("My words") && t.includes("Big exam") && t.includes("Letters & sounds"));
  root.unmount();
}

console.log(failures === 0 ? "\nALL RENDER TESTS PASSED ✅" : `\n${failures} FAILURES ❌`);
process.exit(failures === 0 ? 0 : 1);
