// =============================================================================
// verify-topics.mjs (v105) — the "Practise a topic" door, in a real browser.
//
// test-topics.mjs holds the queue and the counts to their promise in Node.
// This drives what a learner actually does: Practice → "Practise a topic" →
// the list (does every topic the engine offers have a row, do the numbers on
// the Numbers row match what was seeded, is Numbers suggested because its
// words are slipping) → tap Numbers → a lesson that opens on Numbers words →
// Back returns to the list, not somewhere else. Run across scripts that have
// bitten this app before: Urdu and Arabic (RTL), Japanese, Korean, Hindi, and
// German as the Latin control. Also at phone width, no sideways scroll.
//
//   (cd dist && python3 -m http.server 4173) &
//   node scripts/verify-topics.mjs
// =============================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { summariseTopics } from "../src/engine/selector.js";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CODES = (process.env.ONLY || "ur,ar,ja,ko,hi,de").split(",");
const DAY = 86400000;

const seed = (code) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 420, streak: 3, hearts: 5, heartsMax: 5, gems: 50, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: { [code]: 6 }, sessions: [],
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
const clickText = (page, re) => page.evaluate((src) => {
  const rx = new RegExp(src, "i");
  const b = [...document.querySelectorAll("button, a, [role=button]")].find((x) => x.offsetParent !== null && rx.test(x.textContent || ""));
  if (b) b.click();
  return !!b;
}, re.source);

for (const code of CODES) {
  console.log(`\n=== ${code} ===`);
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const numbers = pack.vocab.filter((v) => v.category === "Numbers" && !v.custom);
  // Three Numbers words learned a month ago and not seen since: slipping.
  const now = Date.now();
  const learned = numbers.slice(0, 3);
  const progress = {};
  for (const v of learned) {
    progress[v.id] = { difficulty: 5, stability: 2, lastReview: now - 30 * DAY, nextReview: now - 28 * DAY, reps: 2, lapses: 1, lastRating: 3 };
  }
  const expected = summariseTopics(pack.vocab, progress, { now });
  const expNumbers = expected.find((t) => t.category === "Numbers");

  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(`page error: ${e.message}`));
  await page.goto(BASE);
  await page.evaluate(([s, p, c]) => {
    localStorage.setItem("lingua:app", JSON.stringify(s));
    localStorage.setItem("lingua:progress", JSON.stringify({ [c]: p }));
  }, [seed(code), progress, code]);
  await page.reload();
  await page.waitForTimeout(1400);

  if (!(await clickText(page, /everything else/))) { fail("no way into Practice from Home"); await ctx.close(); continue; }
  await page.waitForTimeout(700);
  if (!(await clickText(page, /Practise a topic/))) { fail("no 'Practise a topic' door in Practice"); await ctx.close(); continue; }
  await page.waitForSelector("[data-testid=topic-list]", { timeout: 5000 }).catch(() => {});

  const rows = await page.$$eval("[data-testid=topic-list] > button", (bs) => bs.map((b) => b.getAttribute("aria-label")));
  if (rows.length !== expected.length) fail(`${rows.length} topic rows on screen, engine offers ${expected.length}`);
  else console.log(`    ✓ ${rows.length} topics listed`);

  const numRow = rows.find((r) => r.startsWith("Numbers:"));
  const want = `Numbers: ${expNumbers.learned} of ${expNumbers.total} words learned, ${expNumbers.due} slipping`;
  if (numRow !== want) fail(`Numbers row reads "${numRow}", expected "${want}"`);
  else console.log(`    ✓ ${numRow}`);

  const suggested = await page.evaluate(() => [...document.querySelectorAll("button[aria-label^='Suggested']")].map((b) => b.getAttribute("aria-label"))[0] || "");
  if (!/practise Numbers/.test(suggested)) fail(`suggested "${suggested}" — Numbers has the only slipping words, it should be suggested`);
  else console.log(`    ✓ ${suggested}`);

  const overflow = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
  if (overflow > 0) fail(`topics screen scrolls sideways by ${overflow}px at 360px wide`);

  // Tap the Numbers row itself (not the suggestion) and read the lesson.
  await page.evaluate(() => [...document.querySelectorAll("[data-testid=topic-list] > button")].find((b) => b.getAttribute("aria-label").startsWith("Numbers:"))?.click());
  await page.waitForTimeout(1500);
  const text = await page.evaluate(() => document.body.innerText);
  const fresh = numbers.slice(3, 6);
  const seen = fresh.filter((v) => text.includes(v.lemma) || (v.translit && text.includes(v.translit)) || text.includes(v.translation));
  if (!seen.length) fail(`topic lesson opened without any of the next Numbers words (${fresh.map((v) => v.translation).join(", ")}) on screen:\n      ${text.slice(0, 160).replace(/\n/g, " | ")}`);
  else console.log(`    ✓ lesson opens on Numbers words: ${seen.map((v) => v.translation).join(", ")}`);

  await page.goBack();
  await page.waitForTimeout(900);
  const backOnList = await page.$("[data-testid=topic-list]");
  if (!backOnList) fail("Back from the topic lesson did not return to the topic list");
  else console.log("    ✓ Back returns to the topic list");

  await ctx.close();
}

// Desktop: the list sits in the main column beside the rail, no sideways scroll.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), seed("ur"));
  await page.reload();
  await page.waitForTimeout(1400);
  await clickText(page, /everything else/);
  await page.waitForTimeout(700);
  await clickText(page, /Practise a topic/);
  await page.waitForSelector("[data-testid=topic-list]", { timeout: 5000 }).catch(() => {});
  const box = await page.evaluate(() => {
    const l = document.querySelector("[data-testid=topic-list]")?.getBoundingClientRect();
    const rail = document.querySelector(".side-rail")?.getBoundingClientRect();
    return l && { left: l.left, railRight: rail ? rail.right : 0, overflow: document.scrollingElement.scrollWidth - window.innerWidth };
  });
  console.log("\n=== desktop 1440 ===");
  if (!box) fail("topic list not found on desktop");
  else if (box.left < box.railRight) fail(`topic list (left ${box.left}) overlaps the side rail (right ${box.railRight})`);
  else if (box.overflow > 0) fail(`desktop topics screen scrolls sideways by ${box.overflow}px`);
  else console.log("    ✓ list sits clear of the rail, no sideways scroll");
  await ctx.close();
}

await browser.close();
console.log(`\n  ${CODES.length} languages · ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
