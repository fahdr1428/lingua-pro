// =============================================================================
// verify-keyboard-card.mjs (v94) — flip the flashcard without a mouse.
//
// The flashcard is the first thing a lesson shows and the most-used control in
// the app. It flipped on a click on a bare <div>: no tab stop, no role, no
// name, no Enter/Space. Mouse-only, and silent to a screen reader.
//
// Adding role/tabIndex/onKeyDown to the source proves nothing on its own — the
// element has to actually take focus and respond. This drives it with the
// keyboard only and checks the card really turned over.
// =============================================================================
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const seed = (code) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 0, streak: 0, hearts: 99, heartsMax: 99, gems: 0, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: {}, sessions: [],
  grammarSeen: {}, learningGoal: {}, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  passagesRead: {}, userName: "",
  lastStudyDate: new Date().toISOString().slice(0, 10),
  consent: { terms: true, ageConfirmed: 13, at: 0 },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
});

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let problems = 0;
const fail = (m) => { console.log("    ✗ " + m); problems++; };

for (const code of (process.env.ONLY || "ur,ml").split(",")) {
  console.log(`\n=== ${code} ===`);
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(`page error: ${e.message}`));
  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), seed(code));
  await page.reload();
  await page.waitForTimeout(1400);

  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")]
      .find((x) => !x.disabled && /Learn this|Continue|Start/i.test(x.textContent || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(1400);

  // A lesson can open on a grammar moment or an intro panel, so step forward
  // until the flashcards appear rather than assuming they are first.
  for (let i = 0; i < 12; i++) {
    if (await page.locator('[role="button"][aria-pressed]').count()) break;
    await page.evaluate(() => {
      for (const re of [/^Check$/i, /^Continue$/i, /^Got it$/i, /^Next$/i, /^Start$/i, /skip/i]) {
        const b = [...document.querySelectorAll("button")]
          .find((x) => !x.disabled && re.test((x.textContent || "").trim()));
        if (b) { b.click(); return; }
      }
      // Same fallback the lesson fuzz uses: take the last enabled control.
      const any = [...document.querySelectorAll("button")].filter((b) => !b.disabled);
      if (any.length) any[any.length - 1].click();
    });
    await page.waitForTimeout(500);
  }

  const card = page.locator('[role="button"][aria-pressed]').first();
  if (!(await card.count())) { fail("no focusable flashcard on screen"); await ctx.close(); continue; }

  // Tab until the card takes focus — a real keyboard user's route to it.
  let focused = false;
  for (let i = 0; i < 40 && !focused; i++) {
    await page.keyboard.press("Tab");
    focused = await page.evaluate(() =>
      document.activeElement?.getAttribute("aria-pressed") !== null &&
      document.activeElement?.getAttribute("role") === "button");
  }
  if (!focused) { fail("the flashcard never receives focus when tabbing"); await ctx.close(); continue; }
  console.log("    ✓ reachable by Tab");

  const name = await page.evaluate(() => document.activeElement.getAttribute("aria-label"));
  if (!name) fail("focused card has no accessible name");
  else console.log(`    ✓ announced as: "${name}"`);

  const before = await page.evaluate(() => document.activeElement.getAttribute("aria-pressed"));
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => {
    const el = document.querySelector('[role="button"][aria-pressed]');
    return el?.getAttribute("aria-pressed");
  });
  if (before === after) fail(`Enter did not flip the card (aria-pressed stayed ${before})`);
  else console.log(`    ✓ Enter flips it (aria-pressed ${before} → ${after})`);

  await ctx.close();
}
await browser.close();
console.log(`\n  ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
