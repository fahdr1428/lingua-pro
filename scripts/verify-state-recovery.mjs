// =============================================================================
// verify-state-recovery.mjs (v103) — open the app with a damaged save and see
// whether a learner can still use it.
//
// test-state-shape.mjs proves normalizeAppState returns the right object. That
// is not the same claim as "the app survives" — the reconciliation has to
// actually be wired into the hook that loads the state, and a unit test of the
// function cannot tell you whether it is. This opens a real browser with each
// bad save already in localStorage and asks the only question that matters:
// is the home screen usable?
//
// The saves are real shapes, not fuzz:
//   · chaptersPassed:{code:true}  — the one that hung the route map on
//     "Loading…" forever, inside a lazy boundary where the error screen never
//     appeared and the only way out was clearing site data
//   · passagesRead:"[object Object]1" — what every learner who answered a
//     reading question correctly before v103 has in storage right now
//   · a v44-era save — missing every key added in the sixty versions since
//   · junk — a string where the object should be
//
// PROVEN CAPABLE OF FAILING: rebuilt with the reconciliation unwired from
// App.jsx, the first case reports both halves of the real failure:
//   a chapter list that is `true`: threw — (… || []).includes is not a function
//   a chapter list that is `true`: no lesson to start — "…CHAPTER 0 How Arabic…"
//
// Worth being exact about what that run showed: only the `chaptersPassed`
// case actually crashed. The other five reach a usable screen even without
// the reconciliation, because their call sites happen to guard. They are kept
// because "happens to guard today" is not a property anyone maintains, and
// because they are the shapes real devices are carrying — but this file
// claims one demonstrated crash prevented, not six.
//
//   npm run build && (cd dist && python3 -m http.server 4173 &)
//   npm run verify-state-recovery
// =============================================================================

import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:4173";
const CODE = "ar";

const base = {
  onboarded: true, currentLanguage: CODE, tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 800, streak: 3, hearts: 5, heartsMax: 5, gems: 50, isPremium: true,
  theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
  lessonsCompleted: { [CODE]: 6 }, sessions: [], grammarSeen: {}, learningGoal: {},
  chaptersPassed: { [CODE]: [1] }, sentenceDropsDone: { [CODE]: 2 },
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
};

// `expect` is what a good outcome looks like for that save. A save with a
// recoverable learner in it must land back on their route map; a save with
// nothing recoverable in it ("wat" holds no progress to keep) should land on
// onboarding — that is the app working, not failing, and asserting "a unit to
// tap" for it would be the check being wrong rather than the app.
const CASES = [
  ["a chapter list that is `true`", { ...base, chaptersPassed: { [CODE]: true } }, "route"],
  ["passagesRead left a string by the pre-v103 write", { ...base, passagesRead: "[object Object]1" }, "route"],
  ["a v44-era save, missing sixty versions of keys",
    { onboarded: true, currentLanguage: CODE, totalXp: 1200, streak: 9, theme: "cream", tutorialSeen: true, lessonsCompleted: { [CODE]: 6 } }, "route"],
  ["testedOut holding a string instead of a list", { ...base, testedOut: { [CODE]: "ar_0001" } }, "route"],
  ["grammarSeen holding a number", { ...base, grammarSeen: { [CODE]: 3 } }, "route"],
  ["the whole save is a string", "wat", "onboarding"],
];

const problems = [];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

for (const [name, state, expect] of CASES) {
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  const crashes = [];
  page.on("pageerror", (e) => crashes.push(String(e?.message || e)));

  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate((s) => {
    localStorage.setItem("lingua:app", s);
    localStorage.setItem("lingua:progress", "{}");
  }, JSON.stringify(state));
  await page.reload();
  await page.waitForTimeout(2200);

  const seen = await page.evaluate(() => ({
    text: document.body.innerText.replace(/\s+/g, " "),
    units: document.querySelectorAll("button[data-unit]").length,
    boundary: /something went wrong/i.test(document.body.innerText),
    onboarding: [...document.querySelectorAll("button")].some((b) => /get started/i.test(b.innerText || "")),
  }));

  if (crashes.length) problems.push(`${name}: threw — ${crashes[0].slice(0, 110)}`);
  if (seen.boundary) problems.push(`${name}: the app fell through to the error boundary`);
  if (expect === "route") {
    // The route map is the thing that hung. A usable home screen has a unit to
    // tap; a hung one sits on "Loading…" under YOUR ROUTE.
    if (!seen.units) {
      const where = /your route(.{0,60})/i.exec(seen.text)?.[1]?.trim() || seen.text.slice(0, 80);
      problems.push(`${name}: no lesson to start — "…${where}…"`);
    }
  } else if (!seen.onboarding) {
    problems.push(`${name}: expected to land on onboarding, got "${seen.text.slice(0, 90)}"`);
  }

  await ctx.close();
}

await browser.close();

console.log(`\n  ${CASES.length} damaged saves opened in a real browser`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems) console.log(`   ${p}`);
  console.log();
  process.exit(1);
}
console.log("\n  ✓ every one of them reached a usable home screen\n");
