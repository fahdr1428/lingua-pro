// =============================================================================
// verify-theme-migration.mjs (v115) — the one-time move to Ink keeps the save.
//
// THE BUG THIS EXISTS FOR. v115 made Ink the default and moves learners who
// were on the old default (cream) or the retired Dark palette to it, once. The
// first version of that migration ran on the app's FIRST render — before the
// saved state had loaded — and setAppState writes straight to storage. So it
// wrote DEFAULT_APP_STATE (plus the new theme) over the learner's real save:
// a returning learner opened the app on the welcome screen with their
// language, streak and consent gone. verify-answer-feedback caught it as "no
// unit to tap" in 7 of 9 languages; whether it struck depended on timing.
//
// The move now happens while the save is read (App.jsx's reconcile), which
// writes nothing; the next real save carries it. Checked here, on a real page,
// several times per case because the original fault was a race:
//   · the stored save is never replaced — onboarding, language, streak and
//     consent are all still there after the app has loaded;
//   · the learner lands on their route map, not the welcome screen;
//   · the page paints the right theme: cream (never chosen) and the retired
//     "dark" become Ink; Ocean, and Paper chosen after the move
//     (cream + themeSettled), stay as chosen.
// =============================================================================

import { chromium } from "playwright";
const { THEMES } = await import("../src/ui/themes.js");

const BASE = process.env.BASE || "http://localhost:4173";
const RUNS = Number(process.env.RUNS || 4);

const learner = (extra) => ({
  onboarded: true, currentLanguage: "ur", tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 900, streak: 11, sessionSize: 10, soundEffects: false,
  lessonsCompleted: { ur: 6 }, scriptCourse: { ur: { passed: true } },
  consent: { terms: true, ageConfirmed: 13, at: 1, policyVersion: "2026-08-06" },
  userName: "Rafi",
  ...extra,
});

const CASES = [
  ["on the old default (cream), never chose", learner({ theme: "cream" }), "ink"],
  ["on the retired Dark palette", learner({ theme: "dark" }), "ink"],
  ["chose Ocean", learner({ theme: "ocean" }), "ocean"],
  ["chose Paper after the move", learner({ theme: "cream", themeSettled: true }), "cream"],
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const problems = [];

for (const [label, seed, want] of CASES) {
  let ok = 0;
  for (let run = 0; run < RUNS; run++) {
    const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "load" });
    await page.evaluate((s) => { localStorage.clear(); localStorage.setItem("lingua:app", s); }, JSON.stringify(seed));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1500);

    const saved = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem("lingua:app")); } catch { return null; } });
    const onRoute = await page.locator("button[data-unit]").count();
    const welcome = await page.evaluate(() => /Get started/.test(document.body.innerText));
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
    await ctx.close();

    const where = `${label} (run ${run + 1})`;
    const before = problems.length;
    if (!saved) problems.push(`${where}: no saved state after load`);
    else {
      if (saved.onboarded !== true || saved.currentLanguage !== "ur") problems.push(`${where}: the save was replaced — onboarded ${saved.onboarded}, language ${saved.currentLanguage}`);
      if (saved.streak !== 11) problems.push(`${where}: streak ${saved.streak}, expected 11`);
      if (!saved.consent) problems.push(`${where}: consent lost`);
      if (saved.theme !== seed.theme && saved.theme !== want) problems.push(`${where}: stored theme "${saved.theme}" is neither the saved one nor "${want}"`);
    }
    if (welcome || !onRoute) problems.push(`${where}: landed on ${welcome ? "the welcome screen" : "a screen with no unit to tap"}`);
    const wantBg = THEMES[want].vars["--bg"].toLowerCase();
    if (bg.toLowerCase() !== wantBg) problems.push(`${where}: page painted --bg ${bg}, expected ${want} (${wantBg})`);
    if (problems.length === before) ok++;
  }
  console.log(`  ${ok === RUNS ? "✓" : "✗"} ${label}: ${ok}/${RUNS} runs kept the save and ended on "${want}"`);
}

await browser.close();

if (problems.length) {
  for (const p of [...new Set(problems)].slice(0, 20)) console.log(`    ✗ ${p}`);
  console.log(`\n  ✗ ${problems.length} problems\n`);
  process.exit(1);
}
console.log("\n  ✓ the move to Ink keeps every save, and a chosen theme stays chosen\n");
