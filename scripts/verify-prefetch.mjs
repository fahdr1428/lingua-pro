// =============================================================================
// verify-prefetch.mjs (v104) — is a tab instant, and does Save-Data still mean
// what it says?
//
// This app code-splits seventeen screens, which is right: it keeps the first
// paint small. The cost is that the first visit to a split screen fetches it,
// and on a bad connection that is a stall on the surfaces people use most.
// Measured at 400kbps with 150ms latency — an ordinary phone on a weak signal,
// which is a good part of this app's audience some of the time:
//
//     Speak tab      "Loading…" for ~1400ms
//     Missions tab   "Loading…" for ~1500ms
//
// Both are one tap from everywhere, via the bottom bar.
//
// v104 warms those chunks during idle time after boot. This measures the claim
// in a throttled browser rather than asserting it from the source, and it
// measures BOTH arms, because a check that only looks at the fast path cannot
// tell "the prefetch worked" apart from "the harness cannot see a spinner":
//
//   · prefetch allowed  → no spinner on any bottom-nav tab
//   · Save-Data set     → prefetch skipped, and the spinner comes back
//
// The second arm is not just a control. Save-Data is an explicit request not
// to spend someone's data on things they did not ask for, and a speculative
// download is exactly that. Honouring it has to be checked, or it decays into
// a comment that used to be true.
//
//   npm run build && (cd dist && python3 -m http.server 4173 &)
//   npm run verify-prefetch
// =============================================================================

import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:4173";

// A weak but usable mobile connection. Fast enough that the app works, slow
// enough that a 40KB chunk is felt.
const SLOW = { offline: false, latency: 150, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 };

const seed = JSON.stringify({
  onboarded: true, currentLanguage: "ur", tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 800, streak: 3, hearts: 5, heartsMax: 5, gems: 50, isPremium: true,
  theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
  lessonsCompleted: { ur: 8 }, sessions: [], grammarSeen: {}, learningGoal: {},
  chaptersPassed: { ur: [1, 2] }, sentenceDropsDone: { ur: 3 },
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {}, passagesRead: {},
});

const TABS = [["Speak", "speak"], ["Missions", "missions"], ["Practice", "practice"]];

const problems = [];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

/** @returns {Promise<Record<string, number>>} ms of "Loading…" per tab */
async function measure({ saveData }) {
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  if (saveData) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
    });
  }
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.emulateNetworkConditions", SLOW);

  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate((s) => localStorage.setItem("lingua:app", s), seed);
  await page.reload();
  await page.waitForTimeout(6000);   // plenty of idle time for the prefetch

  const out = {};
  for (const [label, match] of TABS) {
    await page.evaluate((m) => {
      const b = [...document.querySelectorAll(".bottom-nav button")].find((x) => new RegExp(m, "i").test(x.innerText || ""));
      if (b) b.click();
    }, match);
    let frames = 0;
    for (let i = 0; i < 30; i++) {
      if (/Loading…/.test(await page.evaluate(() => document.body.innerText))) frames++;
      await page.waitForTimeout(50);
    }
    out[label] = frames * 50;
  }
  await ctx.close();
  return out;
}

const warm = await measure({ saveData: false });
const cold = await measure({ saveData: true });
await browser.close();

console.log("\n  bottom-nav tabs on a 400kbps connection — milliseconds showing \"Loading…\"\n");
console.log("    tab         prefetched   Save-Data (prefetch off)");
for (const [label] of TABS) {
  console.log(`    ${label.padEnd(11)} ${String(warm[label] + "ms").padEnd(12)} ${cold[label]}ms`);
}

for (const [label] of TABS) {
  if (warm[label] > 150) {
    problems.push(`${label} still showed "Loading…" for ${warm[label]}ms with prefetch on — the chunk is not being warmed`);
  }
}

// The control. If nothing stalls even with prefetching disabled, this check is
// measuring nothing and its pass means nothing.
const anyCold = TABS.some(([l]) => cold[l] >= 400);
if (!anyCold) {
  problems.push(
    "with Save-Data set — which skips the prefetch — no tab stalled either. " +
    "Either Save-Data is being ignored and the prefetch ran anyway, or this harness " +
    "can no longer see a spinner. Both make the pass above worthless."
  );
}

if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems) console.log(`   ${p}`);
  console.log();
  process.exit(1);
}
console.log("\n  ✓ tabs are instant, and Save-Data still switches the prefetch off\n");
