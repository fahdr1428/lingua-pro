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
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

const quietAfter = {};

/** @returns {Promise<Record<string, number>>} ms of "Loading…" per tab */
async function measure({ saveData }) {
  // Service workers blocked: CDP's network emulation throttles the PAGE, but a
  // service worker's own fetches aren't throttled. Once the worker controls
  // the page (it does after the reload below), chunks arrive at full speed and
  // neither arm can stall, so the control below reported "no tab stalled".
  // On a real phone the worker's fetches are exactly as slow as the network.
  // Blocking it measures that network, which is what this check is about.
  // (Offline behaviour, which IS the worker's job, is verify-offline's.)
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 }, serviceWorkers: "block" });
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
  const t0 = Date.now();
  await page.reload();
  // Until the page has gone quiet: everything Home needs and, where allowed,
  // the prefetch. This was a fixed 6 seconds, which was only "plenty" because
  // the service worker's unthrottled fetches (see above) finished everything
  // early. At a true 400kbps the first visit downloads for about ten seconds
  // (much of it the script's typeface). Measured with the worker blocked, the
  // v113 build failed the old 6-second check too: Speak 1450ms, Missions 850ms.
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1000);
  quietAfter[saveData ? "cold" : "warm"] = Date.now() - t0;

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
console.log(`    page quiet after ${(quietAfter.warm / 1000).toFixed(1)}s with prefetch, ${(quietAfter.cold / 1000).toFixed(1)}s with Save-Data\n`);
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
// Measured from a quiet page, an un-warmed tab's chunk (Speak: 17KB, plus its
// conversation code) takes about 350ms at 400kbps. The old bar of 400ms was
// set when the stall included competing downloads. What the control has to
// show is a stall the prefetched arm doesn't have: clearly above its 150ms limit.
const anyCold = TABS.some(([l]) => cold[l] >= 200);
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
