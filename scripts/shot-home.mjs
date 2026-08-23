// =============================================================================
// shot-home.mjs — screenshot Home at real desktop widths, and measure how much
// of the screen the content is actually using.
//
// The complaint this exists to answer is "the screen feels empty": a mobile-first
// app scaled onto a 16:9 monitor uses a narrow strip down the middle and leaves
// the rest blank. That is measurable rather than a matter of taste — the numbers
// below are content width as a share of viewport width.
//
//   node scripts/shot-home.mjs [--out dir] [--seed away|fresh]
// =============================================================================

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:4173";
const OUT = process.env.OUT || "/tmp/shots";
mkdirSync(OUT, { recursive: true });

// A learner who's been away — that's the state the review screenshotted, with
// the comeback nudge showing.
const SEED = {
  onboarded: true, currentLanguage: "fr", tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 43, streak: 1, hearts: 5, heartsMax: 5, gems: 54, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: { fr: 3 }, sessions: [],
  grammarSeen: {}, learningGoal: {}, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  passagesRead: {}, userName: "",
  lastStudyDate: new Date(Date.now() - 63 * 864e5).toISOString().slice(0, 10),
  consent: { terms: true, ageConfirmed: 13, at: 0 },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
};

const SIZES = [
  // The phone is the primary platform — a desktop layout change that quietly
  // breaks 414px is a much worse regression than the one it fixed.
  { name: "phone-414", width: 414, height: 896 },
  { name: "laptop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

console.log("\n=== home, desktop ===\n");

for (const size of SIZES) {
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    serviceWorkers: "block",
  });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), SEED);
  await page.reload();
  await page.waitForSelector(".home-container", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);

  const m = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const box = (s) => { const el = q(s); return el ? el.getBoundingClientRect() : null; };
    const container = box(".home-container");
    const rail = box(".side-rail");
    const cols = box(".home-cols");
    const reach = box(".reach-rail");
    return {
      viewport: window.innerWidth,
      container: container ? Math.round(container.width) : null,
      containerLeft: container ? Math.round(container.left) : null,
      rail: rail ? Math.round(rail.width) : 0,
      main: cols && reach ? Math.round(cols.width - reach.width) : null,
      reach: reach ? Math.round(reach.width) : null,
      pageHeight: Math.round(document.body.scrollHeight),
    };
  });

  const used = (m.rail || 0) + (m.container || 0);
  const share = Math.round((used / m.viewport) * 100);
  console.log(`  ${size.name}`);
  console.log(`    viewport ${m.viewport}px · rail ${m.rail}px · content ${m.container}px`);
  console.log(`    main column ${m.main}px · reach column ${m.reach}px`);
  console.log(`    USING ${used}px of ${m.viewport}px — ${share}%   (${m.viewport - used}px empty)`);
  console.log(`    page height ${m.pageHeight}px\n`);

  await page.screenshot({ path: `${OUT}/home-${size.name}.png`, fullPage: false });
  await page.screenshot({ path: `${OUT}/home-${size.name}-full.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
console.log(`  written to ${OUT}\n`);
