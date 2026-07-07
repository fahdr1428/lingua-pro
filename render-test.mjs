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


// ===========================================================================
// v59 — TURKISH PACK INTEGRITY
// ===========================================================================
console.log("\n[Turkish pack integrity]");
{
  const fs = await import("fs");
  const tr = JSON.parse(fs.readFileSync("./src/data/languages/tr.json", "utf8"));
  check("97 words", tr.vocab.length === 97, String(tr.vocab.length));
  check("10 units", tr.units.length === 10);
  const ids = tr.vocab.map((v) => v.id);
  check("ids unique", new Set(ids).size === ids.length);
  const unitIds = new Set(tr.units.map((u) => u.id));
  check("no orphan unit refs", tr.vocab.every((v) => unitIds.has(v.unit)));
  check("every word complete", tr.vocab.every((v) => v.lemma && v.translit && v.translation && v.category && v.examples?.[0]?.native && v.examples?.[0]?.translation));
  check("every unit has words", tr.units.every((u) => tr.vocab.some((v) => v.unit === u.id)));
  check("frameworks verified trio", tr.frameworks.length === 3 && tr.frameworks.some((f) => f.id === "vowel-harmony"));
  check("alphabet covers special letters", tr.alphabet.some((a) => a.char.includes("ğ")) && tr.alphabet.some((a) => a.char.includes("ı")));
}

// ===========================================================================
// v59 — TURKISH REGISTRATION (registry, character, convos, patterns, facts)
// ===========================================================================
console.log("\n[Turkish registration]");
{
  const reg = await import("./reg-test.mjs");
  check("registry has tr", !!reg.LANGUAGES.tr && reg.LANGUAGES.tr.ttsCode === "tr-TR");
  check("13 languages listed", reg.listLanguages().length === 13, String(reg.listLanguages().length));
  const chars = await import("./chars-test.mjs");
  check("Elif exists", chars.getCharacter("tr")?.name === "Elif");
  const convos = await import("./convos-test.mjs");
  check("10 tr conversations", convos.getConversations("tr").length === 10);
  const pats = await import("./pats-test.mjs");
  check("tr sentence ladder = 5 rungs", pats.ladderHeight("tr") === 5);
  check("tr pattern drop 1 exists", !!pats.getPatternForDrop("tr", 1));
  check("tr rung 5 teaches negation", pats.getPatternForDrop("tr", 5).chunks.some((c) => c.role === "negation"));
  const facts = await import("./facts-test.mjs");
  const f = facts.pickFunFact("tr", []);
  check("tr fun fact available", typeof f?.fact === "string" && f.fact.length > 10);
}

// ===========================================================================
// v59 — NEW EXERCISE TYPES (letter scramble + true/false)
// ===========================================================================
console.log("\n[New exercise types]");
{
  const gen = await import("./gen-test.mjs");
  const fs = await import("fs");
  const tr = JSON.parse(fs.readFileSync("./src/data/languages/tr.json", "utf8"));
  const pool = tr.vocab;

  check("EXERCISE enum extended", gen.EXERCISE.LETTER_SCRAMBLE === "letter_scramble" && gen.EXERCISE.TRUE_FALSE === "true_false");

  // Generate many lessons at mixed reps; both new types should appear for tr,
  // and every produced exercise must be structurally valid.
  const progress = {};
  for (const v of pool.slice(0, 40)) progress[v.id] = { reps: 2, lapses: 0, stability: 5, lastReview: Date.now() };
  let sawScramble = null, sawTF = null, structuralFail = null;
  for (let i = 0; i < 60 && (!sawScramble || !sawTF); i++) {
    const exercises = gen.generateLesson(pool.slice(0, 12), pool, progress, "tr");
    for (const ex of exercises) {
      if (ex.type === "letter_scramble") sawScramble = ex;
      if (ex.type === "true_false") sawTF = ex;
      if (ex.type === "letter_scramble" && (!Array.isArray(ex.bank) || ex.bank.join("").length !== ex.answer.length)) structuralFail = "scramble bank/answer mismatch";
      if (ex.type === "true_false" && (!ex.options || ex.options.join() !== "True,False" || !["True","False"].includes(ex.answer))) structuralFail = "true_false malformed";
    }
  }
  check("letter scramble appears for Turkish", !!sawScramble);
  check("true/false appears", !!sawTF);
  check("no structural failures", !structuralFail, structuralFail || "");

  // Grading
  if (sawScramble) {
    check("scramble grades correct spelling", gen.gradeAnswer(sawScramble, sawScramble.answer).correct === true);
    check("scramble rejects wrong spelling", gen.gradeAnswer(sawScramble, sawScramble.answer.split("").reverse().join("") + "x").correct === false);
    check("scramble bank is the word's letters", [...sawScramble.bank].sort().join("") === [...sawScramble.answer].sort().join(""));
  }
  if (sawTF) {
    check("true/false grades the truth", gen.gradeAnswer(sawTF, sawTF.answer).correct === true);
    check("true/false rejects the lie", gen.gradeAnswer(sawTF, sawTF.answer === "True" ? "False" : "True").correct === false);
  }

  // Scramble must NEVER fire for Urdu (Arabic script) — the gate matters.
  const urPool = [
    { id: "u1", lemma: "سلام", translation: "hello", category: "Greetings", examples: [{ native: "سلام دوست", translation: "hello friend" }] },
    { id: "u2", lemma: "پانی", translation: "water", category: "Food", examples: [{ native: "پانی دو", translation: "give water" }] },
    { id: "u3", lemma: "شکریہ", translation: "thanks", category: "Greetings", examples: [] },
    { id: "u4", lemma: "دوست", translation: "friend", category: "People", examples: [] },
  ];
  const urProgress = {}; for (const v of urPool) urProgress[v.id] = { reps: 2, lapses: 0, stability: 5, lastReview: Date.now() };
  let urScramble = false;
  for (let i = 0; i < 40; i++) {
    const s = gen.generateLesson(urPool, urPool, urProgress, "ur");
    if (s.some((e) => e.type === "letter_scramble")) urScramble = true;
  }
  check("scramble never fires for Arabic script", !urScramble);
}

// ===========================================================================
// v59 — HOME RENDERS WITH THE TURKISH PACK
// ===========================================================================
console.log("\n[Home — Turkish]");
{
  const fs = await import("fs");
  const trPack = JSON.parse(fs.readFileSync("./src/data/languages/tr.json", "utf8"));
  const p = defaultProps();
  p.pack = { ...trPack, code: "tr" };
  p.engine = {
    getUnitProgress: async () => trPack.units.map((u, i) => ({ ...u, total: 10, learned: i === 0 ? 4 : 0, mastered: 0, pct: i === 0 ? 0.4 : 0 })),
    getProgress: async () => ({}),
  };
  p.appState = { ...BASE_STATE, metCharacters: [] }; // Elif introduces herself
  const r = await renderHome(p);
  check("no render error", !r.error, JSON.stringify(r.error));
  check("Elif introduces herself", r.text.includes("Elif"));
  check("Turkish greetings goal label", r.text.includes("Say hello like a local"));
  check("Turkish unit titles render", r.text.includes("Getting By") || r.text.includes("Food & Drink"));
  r.root.unmount();
}


// ===========================================================================
// v59 — LESSON SCREEN RENDERS THE NEW EXERCISE UIs
// ===========================================================================
console.log("\n[Lesson — new exercise UIs]");
{
  const gen = await import("./gen-test.mjs");
  const lessonMod = await import("./lesson-test.mjs");
  const fs = await import("fs");
  const tr = JSON.parse(fs.readFileSync("./src/data/languages/tr.json", "utf8"));
  const merhaba = tr.vocab.find((v) => v.lemma === "Merhaba");
  const pool = tr.vocab.slice(0, 20);

  const scramble = { type: "letter_scramble", item: merhaba, prompt: `Spell the word for "hello"`, translation: merhaba.translation, showWord: false, playAudio: false, bank: [...merhaba.lemma].reverse(), answer: merhaba.lemma };
  const tf = { type: "true_false", item: merhaba, prompt: `True or false: this means "water"`, showWord: true, playAudio: false, options: ["True", "False"], answer: "False" };

  async function renderLesson(firstExercise) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    let error = null;
    const origErr = console.error;
    console.error = (...a) => { const s = String(a[0]); if (s.includes("Error") && !s.includes("act(")) error = a; };
    const engine = {
      generateSession: async () => ({ exercises: [firstExercise], mode: "unit" }),
      submitAnswer: async (ex, given) => ({ ...gen.gradeAnswer(ex, given), rating: 3, card: null, mastery: 1 }),
      getStats: async () => ({ total: 20, learned: 5, due: 0, mastered: 0 }),
      getSessions: async () => [],
      logSession: async () => [],
    };
    root.render(React.createElement(lessonMod.Lesson, {
      engine,
      pack: { ...tr, code: "tr" },
      stats: { total: 20, learned: 5, due: 0, mastered: 0 },
      appState: { ...BASE_STATE },
      setAppState: noop,
      onNavigate: noop,
      refreshStats: noop,
      params: { mode: "unit" },
    }));
    await new Promise((r) => setTimeout(r, 300));
    console.error = origErr;
    return { text: container.textContent, root, error };
  }

  const r1 = await renderLesson(scramble);
  check("scramble renders without error", !r1.error, JSON.stringify(r1.error));
  check("scramble shows spell header", r1.text.includes("Spell the word for"));
  check("scramble shows the meaning", r1.text.includes(`"hello"`));
  check("scramble shows letter tiles", [...merhaba.lemma].every((ch) => r1.text.includes(ch)));
  r1.root.unmount();

  const r2 = await renderLesson(tf);
  check("true/false renders without error", !r2.error, JSON.stringify(r2.error));
  check("true/false shows the claim", r2.text.includes('this means "water"'));
  check("true/false shows the word", r2.text.includes("Merhaba"));
  check("true/false shows both options", r2.text.includes("True") && r2.text.includes("False"));
  r2.root.unmount();
}

console.log(failures === 0 ? "\nALL RENDER TESTS PASSED ✅" : `\n${failures} FAILURES ❌`);
process.exit(failures === 0 ? 0 : 1);
