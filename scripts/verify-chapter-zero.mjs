// =============================================================================
// verify-chapter-zero.mjs (v99) — walk Chapter 0 in a real browser.
//
// Chapter 0 is the first thing a new learner in eleven languages meets, so the
// claim being checked is the whole feature:
//
//   1. A learner opening a non-Latin language for the first time is offered the
//      reading test as the hero action — not "Introductions" in a script nobody
//      asked whether they could read.
//   2. Chapter 0 is on the route, above the first stop, and each of its steps
//      deep-links to its own lesson rather than dumping them at a menu.
//   3. The exam runs: twelve questions, four options each, a verdict at the end.
//   4. Passing it actually removes Chapter 0 from the way — the route collapses
//      to one line and the hero moves on to the lessons.
//   5. A Latin-script language shows NONE of this.
//
//   npm run build && npx vite preview --port 4173 &
//   npm run verify-chapter-zero
// =============================================================================

import { chromium } from "playwright";
import { readdirSync, readFileSync } from "node:fs";
import { hasScriptCourse, scriptStops, SCRIPT_EXAM_SIZE } from "../src/data/scriptCourse.js";

const BASE = process.env.BASE || "http://localhost:4173";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;

const packs = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    const p = JSON.parse(readFileSync(`src/data/languages/${f}`, "utf8"));
    p.code = p.code || f.replace(".json", "");
    return p;
  })
  .filter((p) => !ONLY || ONLY.includes(p.code));

const problems = [];
let checked = 0, examsSat = 0;

function seed(code, extra = {}) {
  return JSON.stringify({
    onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
    totalXp: 0, streak: 0, hearts: 5, heartsMax: 5, gems: 50, isPremium: true,
    theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
    lessonsCompleted: {}, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: {}, sentenceDropsDone: {}, lastCheckpointAt: {}, testedOut: {},
    momentDone: {}, planVisited: {}, scriptCourse: {}, ...extra,
  });
}

async function open(page, code, extra) {
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(([s]) => {
    localStorage.setItem("lingua:app", s);
    localStorage.setItem("lingua:progress", "{}");
    localStorage.removeItem("alphabet_progress");
  }, [seed(code, extra)]);
  await page.reload();
  await page.waitForTimeout(1000);
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

for (const pack of packs) {
  const code = pack.code;
  const wants = hasScriptCourse(pack);
  checked++;

  await open(page, code);

  const zero = await page.locator(".chapter-zero").count();
  const eyebrow = (await page.locator(".hero-premium .eyebrow").first().textContent().catch(() => "")) || "";

  // --- 5. a Latin-script language must show none of it ----------------------
  if (!wants) {
    if (zero) problems.push(`${code}: writes in the Latin alphabet but Chapter 0 is on its route`);
    if (/chapter 0/i.test(eyebrow)) problems.push(`${code}: hero offers Chapter 0 to a Latin-script language`);
    continue;
  }

  // --- 1 & 2. it is offered, and it is on the route -------------------------
  if (!zero) { problems.push(`${code}: Chapter 0 is missing from the route`); continue; }
  if (!/chapter 0/i.test(eyebrow)) {
    problems.push(`${code}: a brand-new learner's hero action is "${eyebrow.trim()}", not the reading test`);
  }

  const expected = scriptStops(pack);
  await page.locator('.chapter-zero button[aria-expanded]').click();
  await page.waitForTimeout(300);
  const stopTitles = await page.locator(".chapter-zero .stop-row button").allTextContents();
  if (stopTitles.length !== expected.length) {
    problems.push(`${code}: ${stopTitles.length} steps on the route, ${expected.length} in the data`);
  }
  for (const s of expected) {
    if (!stopTitles.some((t) => t.includes(s.title))) {
      problems.push(`${code}: step "${s.title}" is in the data but not on the route`);
    }
  }

  // Each step must open its own lesson, not the menu. The menu shows every
  // group at once; a lesson shows one thing.
  if (expected.length) {
    await page.locator(".chapter-zero .stop-row button").first().click();
    await page.waitForTimeout(700);
    const body = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ");
    const looksLikeMenu = expected.length > 2 && expected.every((s) => body.includes(s.title));
    if (looksLikeMenu) problems.push(`${code}: tapping a Chapter 0 step landed on the menu, not that lesson`);
    if (/something went wrong/i.test(body)) problems.push(`${code}: the first Chapter 0 step crashed`);
  }

  // --- 3. the exam runs -----------------------------------------------------
  await open(page, code);
  await page.locator('.chapter-zero .btn-premium').click();
  await page.waitForTimeout(800);

  const header = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ");
  if (/Not enough script data/i.test(header)) {
    problems.push(`${code}: the reading test could not be built at all`);
    continue;
  }
  // The eyebrow is text-transform: uppercase, so match the text, not the case.
  if (!/reading test · 1 of /i.test(header)) {
    problems.push(`${code}: the reading test did not start — "${header.slice(0, 120)}"`);
    continue;
  }
  examsSat++;

  // Answer every question wrong on purpose where possible, then check we are
  // told so rather than waved through.
  let answered = 0;
  for (let q = 0; q < SCRIPT_EXAM_SIZE + 2; q++) {
    const opts = page.locator('div[style*="grid"] > button:not([disabled])');
    const n = await opts.count();
    if (!n) break;
    if (n !== 4) { problems.push(`${code}: question ${q + 1} offered ${n} options, not 4`); break; }
    await opts.first().click();
    await page.waitForTimeout(120);
    answered++;
    const next = page.locator('button:has-text("Next →"), button:has-text("See how you did")').first();
    if (!(await next.count())) { problems.push(`${code}: no way forward after answering question ${q + 1}`); break; }
    await next.click();
    await page.waitForTimeout(180);
  }
  if (answered !== SCRIPT_EXAM_SIZE) {
    problems.push(`${code}: the paper was ${answered} questions, expected ${SCRIPT_EXAM_SIZE}`);
  }
  const verdict = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ");
  if (!/(You can read it|Not yet)/.test(verdict)) {
    problems.push(`${code}: the test ended without a verdict — "${verdict.slice(0, 120)}"`);
  }

  // --- 4. passing it gets Chapter 0 out of the way --------------------------
  await open(page, code, { scriptCourse: { [code]: { passed: true, at: Date.now(), score: 1 } } });
  const stillThere = await page.locator(".chapter-zero").count();
  const passedEyebrow = (await page.locator(".hero-premium .eyebrow").first().textContent().catch(() => "")) || "";
  if (stillThere) problems.push(`${code}: Chapter 0 still fills the route after the test is passed`);
  if (/chapter 0/i.test(passedEyebrow)) {
    problems.push(`${code}: still nagging about Chapter 0 after it was passed — hero says "${passedEyebrow.trim()}"`);
  }
  const line = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ");
  if (!/you can read/i.test(line)) {
    problems.push(`${code}: no trace of Chapter 0 on the route after passing — it should collapse, not vanish`);
  }
}

await browser.close();

console.log(`\n  chapter 0 in a browser: ${checked} languages · ${examsSat} reading tests sat end to end`);

if (problems.length) {
  console.log(`\n  ${problems.length} problem(s)`);
  for (const p of problems.slice(0, 30)) console.log(`    ✗ ${p}`);
  console.log("");
  process.exit(1);
}
console.log("  offered where it is needed, absent where it isn't, and it gets out of the way · 0 problems\n");
