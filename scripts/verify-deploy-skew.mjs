// =============================================================================
// verify-deploy-skew.mjs (v82) — what happens to a tab that was open when we
// shipped?
//
// THE FAILURE. This app code-splits fifteen screens into content-hashed chunks.
// Someone leaves a tab open, we deploy, the chunk names change, and an hour
// later they tap "Reading" — a request for a file the host no longer serves,
// because a static host serves the current deployment and not the last four.
// React.lazy rejects and the screen dies. It is the most common way an SPA
// breaks in production and it never happens in development, where the files it
// asks for are always the files that exist.
//
// The recovery has to be a RELOAD: fetch the new index.html, get the new chunk
// names. What the app used to show instead was an error boundary reading
// "Something went wrong · Failed to fetch dynamically imported module" over a
// "Go back home" button — the one offer that cannot help, since home already
// works and every other screen will fail in exactly the same way.
//
// This reproduces it honestly: block a lazily-imported chunk at the network
// layer, which is what a missing file looks like from inside the page, and check
// that
//
//   1. the app reloads itself, once
//   2. after the reload, if it STILL fails, it says something true and offers
//      the button that would actually work
//   3. it does not reload forever, which is worse than any error screen
//
// The service worker is blocked for this run on purpose. It has its own answer
// to this problem — an unversioned asset cache that keeps old chunks — and with
// it enabled we would be testing that instead. This is the second line of
// defence, and the second line is the one that has to hold when the cache has
// been evicted.
//
//   npm run build && npx vite preview &
//   node scripts/verify-deploy-skew.mjs
// =============================================================================

import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:4173";
const out = [];
const check = (name, ok, detail = "") => {
  out.push({ name, ok });
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : "  → " + detail}`);
};

const SEED = {
  onboarded: true, currentLanguage: "ur", tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 420, streak: 3, hearts: 5, heartsMax: 5, gems: 50, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: { ur: 9 }, sessions: [],
  grammarSeen: {}, learningGoal: {}, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  passagesRead: {}, consent: { terms: true, ageConfirmed: 13, at: 0 },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
};

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const ctx = await browser.newContext({
  viewport: { width: 414, height: 896 },
  serviceWorkers: "block",
});
const page = await ctx.newPage();

console.log("\n=== deploy skew ===\n");

// The entry bundle must keep loading — we are simulating a deploy that changed
// the LAZY chunks, not a host that has fallen over. Blocking everything would
// prove nothing except that a blank page is blank.
const entryScripts = new Set();
page.on("response", (r) => {
  if (r.request().resourceType() === "script" && r.url().includes("/assets/")) {
    entryScripts.add(new URL(r.url()).pathname);
  }
});

await page.goto(BASE);
await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), SEED);
await page.reload();
await page.waitForSelector(".bottom-nav", { timeout: 15000 });

const entryLoaded = [...entryScripts];
check("the app loads normally to begin with", entryLoaded.length > 0, "no /assets scripts seen");

// Now the deploy. Every chunk NOT already loaded is gone, which is exactly the
// state of a host one deploy later.
let blocked = 0;
await ctx.route("**/assets/*.js", async (route) => {
  const path = new URL(route.request().url()).pathname;
  if (entryLoaded.includes(path)) return route.continue();
  blocked++;
  await route.abort("failed");
});

let loads = 0;
page.on("load", () => { loads++; });

// Reading is lazily imported — this is the tap that used to kill the tab.
const openReading = async () => {
  await page.locator(".bottom-nav button", { hasText: "Practice" }).click().catch(() => {});
  await page.waitForTimeout(600);
  await page.locator("button", { hasText: "Read some" }).first().click().catch(() => {});
};

await openReading();
await page.waitForFunction(() => document.querySelector(".bottom-nav"), { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1500);

check("a missing chunk was actually requested", blocked > 0, `${blocked} blocked`);
check("the app reloaded itself to pick up the new build", loads >= 1, `${loads} reloads`);

// In production that reload is the end of it: the new index.html names chunks
// that exist. Here the block is still in place, which stands in for the case
// that actually needs the error screen — the reload didn't help, because the
// browser is offline or the file is genuinely gone. Ask again.
const loadsAfterFirst = loads;
await openReading();
await page
  .waitForFunction(() => /just updated/i.test(document.body.innerText), { timeout: 20000 })
  .catch(() => {});

const body = await page.locator("body").innerText();

check(
  "it does not reload in a loop when the reload didn't help",
  loads === loadsAfterFirst,
  `${loads - loadsAfterFirst} further reloads — one recovery is a fix, repeated ones are a trap`
);
check(
  "it says what happened, in words a learner can act on",
  /just updated/i.test(body) && /reload/i.test(body),
  body.slice(0, 200).replace(/\s+/g, " ")
);
check(
  "it does not show a raw module-loader error",
  !/dynamically imported module|ChunkLoadError/i.test(body),
  body.slice(0, 200).replace(/\s+/g, " ")
);
check(
  "and it does not offer the recovery that cannot work",
  !/go back home/i.test(body),
  "'Go back home' does nothing when every screen is stale"
);

// The reload flag must be per-session, not permanent: a second deploy later in
// the same browser should still get its one automatic recovery.
const flag = await page.evaluate(() => {
  try { return sessionStorage.getItem("lingua:chunk-reload"); } catch { return "unavailable"; }
});
check("the one-shot guard is recorded", flag === "1", `sessionStorage says ${flag}`);

await browser.close();

const failed = out.filter((r) => !r.ok);
console.log(`\n  ${out.length - failed.length} pass, ${failed.length} fail\n`);
process.exit(failed.length ? 1 : 0);
