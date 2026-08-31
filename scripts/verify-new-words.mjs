// =============================================================================
// verify-new-words.mjs (v100) — do the new words actually reach a learner?
//
// 180 words were added to the packs. A word in a JSON file is not a word in a
// course: it has to be inside a unit the learner can open, it has to be picked
// up by the exercise generator, and it has to render. Every previous content
// pass in this repo that was checked only against the file turned out to have
// shipped something the learner never saw — 65 examples that bypassed a
// validator, 49 that were dead duplicates, 249 romanisations hidden behind a
// stale script list.
//
// So this opens the app, walks to the vocabulary browser the way a learner does
// — Home, "Everything else", "My words" — and looks for each new word on
// screen, in its own script, rendered.
//
// WHAT IT DOES AND DOES NOT PROVE, having been checked both ways:
//
//   [yes] the word is in the shipped bundle and renders. Serving a build with
//     one Urdu word removed reports "1/1 new word(s) not on screen".
//   [no]  the word is reachable through a LESSON. Moving that same word into a
//     unit the pack does not define changed nothing here — the vocabulary
//     browser lists the whole pack regardless of unit. That gap is real and it
//     is covered elsewhere: validate-vocab.mjs warns on a word whose unit is
//     not in units[]. Two checks with one supportable claim each beats one
//     check with a claim it cannot support.
//
//   npm run build && npx vite preview --port 4173 &
//   npm run verify-new-words
// =============================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { CORE_FILL, CORE_FILL_2 } from "./content/core-fill.mjs";

const BASE = process.env.BASE || "http://localhost:4173";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;

// Every lemma the fill added, per language, that actually landed in the pack.
const wanted = {};
for (const src of [CORE_FILL, CORE_FILL_2]) {
  for (const [code, rows] of Object.entries(src)) {
    if (ONLY && !ONLY.includes(code)) continue;
    const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
    for (const [, lemma] of rows) {
      if (pack.vocab.some((w) => w.lemma === lemma)) (wanted[code] = wanted[code] || new Set()).add(lemma);
    }
  }
}

const problems = [];
let looked = 0, found = 0;

function seed(code) {
  return JSON.stringify({
    onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
    totalXp: 500, streak: 2, hearts: 5, heartsMax: 5, gems: 50, isPremium: true,
    theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
    lessonsCompleted: { [code]: 30 }, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: { [code]: [1, 2, 3, 4, 5, 6] }, sentenceDropsDone: {},
    lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
    scriptCourse: { [code]: { passed: true, at: Date.now(), score: 1 } },
  });
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

for (const [code, lemmas] of Object.entries(wanted)) {
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(([s]) => {
    localStorage.setItem("lingua:app", s);
    localStorage.setItem("lingua:progress", "{}");
  }, [seed(code)]);
  await page.reload();
  await page.waitForTimeout(900);

  // "My words" sits among the practice doors, below the route, so Home has to
  // be scrolled before the door exists on screen.
  for (let i = 0; i < 25; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(40);
  }
  // The practice doors live behind an "Everything else" disclosure on Home.
  const more = page.locator('text=Everything else').first();
  if (await more.count()) { await more.click(); await page.waitForTimeout(500); }
  for (let i = 0; i < 25; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(40);
  }
  const door = page.locator('text=My words').first();
  if (!(await door.count())) {
    problems.push(`${code}: no "My words" door on Home — cannot check the word list`);
    continue;
  }
  await door.click();
  await page.waitForTimeout(1200);

  // Whatever screen we landed on, scroll it fully and take the text.
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => window.scrollBy(0, 900));
    await page.waitForTimeout(60);
  }
  const text = await page.evaluate(() => document.body.innerText);

  const missing = [];
  for (const lemma of lemmas) {
    looked++;
    if (text.includes(lemma)) found++;
    else missing.push(lemma);
  }
  if (missing.length) {
    problems.push(`${code}: ${missing.length}/${lemmas.size} new word(s) not on screen — ${missing.slice(0, 6).join(", ")}`);
  }
}

await browser.close();

console.log(`\n  new words in a browser: ${found} of ${looked} found on screen`);
if (problems.length) {
  console.log(`\n  ${problems.length} problem(s)`);
  for (const p of problems) console.log(`    ✗ ${p}`);
  console.log("");
  process.exit(1);
}
console.log("  every word added to a pack reaches the learner · 0 problems\n");
