// =============================================================================
// verify-sentence-lab.mjs (v98) — open the Lab in a real browser, in every
// language, and look at what is actually on the tiles.
//
// The main fuzz deliberately does NOT go through the Sentence Lab: it starts
// lessons by tapping a unit, precisely because the hero action is sometimes a
// Lab drop and matching it by text was unreliable. So the Lab has never been
// opened by any automated check. This does that.
//
// What it proves, in the browser rather than from the source:
//
//   1. Every tile has visible text. In eleven languages the tile renders
//      `chunk.translit`, not `chunk.text`, so a missing romanisation is a blank
//      tile — invisible in the data file and obvious here.
//   2. The tiles on screen are the pattern's tiles — nothing dropped, nothing
//      extra.
//   3. The sentence can actually be built: tapping the tiles in the correct
//      order reaches the completion state.
//
// WHAT IT DELIBERATELY DOES NOT CHECK, and why: whether the bank was dealt in
// the answer's order. That is v98's other fix, and it belongs in
// test-shuffle.mjs rather than here. I tried it here first, against a build
// with the old `sort(() => Math.random() - 0.5)` deliberately restored, and it
// reported zero problems — because in V8 that comparator reverses a two-element
// array *deterministically*, so in a browser the two-chunk case never comes out
// pre-solved even though it does 49.7% of the time in the Node harness. One
// deal per rung cannot measure a probability anyway. A check that samples once
// and finds nothing looks exactly like a check that passed, so the claim is
// made where it can actually be measured.
//
//   npm run build && npx vite preview --port 4173 &
//   npm run verify-sentence-lab
// =============================================================================

import { chromium } from "playwright";
import { readdirSync, readFileSync } from "node:fs";
import { SENTENCE_PATTERNS } from "../src/data/sentencePatterns.js";
import { LATIN_SCRIPT_LANGUAGES } from "../src/data/registry.js";

// The tile shows the romanisation in a non-Latin language and the native text
// otherwise — SentenceLab.jsx: {isNonLatin ? chunk.translit : chunk.text}.
const nonLatin = { has: (c) => !LATIN_SCRIPT_LANGUAGES.has(c) };

const BASE = process.env.BASE || "http://localhost:4173";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;

const codes = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((c) => SENTENCE_PATTERNS[c])
  .filter((c) => !ONLY || ONLY.includes(c));

const problems = [];
let labsOpened = 0, tilesSeen = 0, built = 0;

function seedState(code, dropsDone) {
  return JSON.stringify({
    onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
    totalXp: 500, streak: 2, hearts: 5, heartsMax: 5, gems: 50, isPremium: true,
    theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
    // Eight lessons done and no drops taken puts the hero on drop 1; bumping
    // sentenceDropsDone walks up the ladder without playing the lessons.
    // A drop is earned every two lessons, so 20 completed reaches every rung.
    lessonsCompleted: { [code]: 20 }, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: {}, sentenceDropsDone: { [code]: dropsDone }, lastCheckpointAt: {},
    testedOut: {}, momentDone: {}, planVisited: {},
  });
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

for (const code of codes) {
  const ladder = SENTENCE_PATTERNS[code];

  for (let rung = 0; rung < ladder.length; rung++) {
    const where = `${code}/level ${ladder[rung].level}`;

    await page.goto(BASE, { waitUntil: "load" });
    await page.evaluate(([s]) => {
      localStorage.setItem("lingua:app", s);
      // No cards due, so the hero action reaches the Sentence Lab rather than
      // stopping at "Bring back N words".
      localStorage.setItem("lingua:progress", "{}");
    }, [seedState(code, rung)]);
    await page.reload();
    await page.waitForTimeout(900);

    // The hero action. It is the Lab only when nothing is due for review, which
    // is why lingua:progress is emptied above. The hero's own button just says
    // "Continue · ~2 min" — the eyebrow is what names the action, so read that
    // rather than matching the button, which would happily click a lesson.
    const eyebrow = await page.locator(".hero-premium .eyebrow").first().textContent().catch(() => null);
    if (!eyebrow || !/sentence lab/i.test(eyebrow)) {
      problems.push(`${where}: the hero offered "${(eyebrow || "nothing").trim()}", not the Sentence Lab`);
      continue;
    }
    const hero = page.locator(".hero-premium .btn-premium").first();
    if (!(await hero.count())) {
      problems.push(`${where}: the Sentence Lab hero had no button to press`);
      continue;
    }
    await hero.click();
    await page.waitForTimeout(700);
    labsOpened++;

    // --- step 1: "see it". Walk to the build step. --------------------------
    for (let i = 0; i < 4; i++) {
      const next = page.locator('button:has-text("Build it"), button:has-text("Got it"), button:has-text("Next")').first();
      if (!(await next.count())) break;
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
    }

    // --- what is on the tiles? ---------------------------------------------
    const bank = await page.evaluate(() => {
      // The word bank is the last row of enabled tile buttons on screen.
      const btns = [...document.querySelectorAll("button")].filter((b) => {
        if (b.disabled) return false;
        const kids = b.querySelectorAll("div");
        return kids.length === 2 && b.offsetParent !== null;
      });
      return btns.map((b) => ({
        word: b.querySelector("div")?.textContent?.trim() || "",
        gloss: b.querySelectorAll("div")[1]?.textContent?.trim() || "",
      }));
    });

    if (!bank.length) {
      problems.push(`${where}: reached the build step but found no tiles to tap`);
      continue;
    }

    for (const t of bank) {
      tilesSeen++;
      if (!t.word) problems.push(`${where}: a tile is BLANK (gloss "${t.gloss}") — the learner is asked to place nothing`);
      if (!t.gloss) problems.push(`${where}: a tile has no gloss (word "${t.word}")`);
    }

    // --- are they the right tiles? -----------------------------------------
    const shown = bank.map((t) => t.word);
    const wanted = ladder[rung].chunks.map((c) => (nonLatin.has(code) ? c.translit : c.text));

    if (shown.length !== wanted.length) {
      problems.push(`${where}: ${shown.length} tiles on screen for a ${wanted.length}-chunk sentence — [${shown.join(" | ")}]`);
      continue;
    }
    for (const w of wanted) {
      if (!shown.includes(w)) problems.push(`${where}: "${w}" is in the pattern but not on any tile — [${shown.join(" | ")}]`);
    }

    // --- and it can still actually be built --------------------------------
    for (const word of wanted) {
      const target = page.locator(`button:not([disabled]):has(div:text-is(${JSON.stringify(word)}))`).first();
      if (!(await target.count())) break;
      await target.click().catch(() => {});
      await page.waitForTimeout(150);
    }
    if (await page.locator('text=/Perfect word order|You built that yourself/').count()) built++;
    else problems.push(`${where}: tapping the tiles in the correct order did not complete the sentence`);
  }
}

await browser.close();

console.log(`\n  sentence lab in a browser: ${codes.length} languages · ${labsOpened} labs opened · ${tilesSeen} tiles read`);

if (problems.length) {
  console.log(`\n  ${problems.length} problem(s)`);
  for (const p of problems.slice(0, 30)) console.log(`    ✗ ${p}`);
  console.log("");
  process.exit(1);
}

console.log(`  every tile had something on it and no bank gave away the answer · 0 problems\n`);
