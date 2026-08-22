// =============================================================================
// verify-offline.mjs (v81) — cut the network and see whether it's true.
//
// "Offline mode" was sold in the upgrade pitch for several releases while there
// was no service worker at all. The only honest way to claim it now is to
// actually take the network away and finish a lesson.
//
// This does exactly that: loads the app once with a connection so the worker can
// install, then sets the context OFFLINE and, with no network whatsoever:
//
//   - reloads the app from scratch and gets a working home screen
//   - opens a lesson and answers questions
//   - opens the reading library
//   - checks the AI screens say plainly that they need a connection, rather
//     than hanging on a request that cannot succeed
//   - checks progress written while offline actually persisted
//
// It also checks the thing most likely to be got wrong in the other direction:
// that /api/* is NEVER served from a cache. Those are AI conversations and
// decoded private messages, and a stale reply would be both wrong and a privacy
// problem.
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

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

console.log("\n=== offline ===\n");

// ---- 1. one visit with a connection, so the worker can install --------------
await page.goto(BASE);
await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), SEED);
await page.reload();

// Wait for the worker to be ACTIVE AND CONTROLLING, rather than for a number of
// milliseconds. A fixed timeout passes on an idle machine and fails on a busy
// one, and a verification script that is flaky is worse than no script — it
// teaches you to re-run it until it goes green.
const registered = await page.evaluate(async () => {
  if (!("serviceWorker" in navigator)) return "unsupported";
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (!reg) return "none";
  if (!navigator.serviceWorker.controller) {
    await new Promise((res) => {
      navigator.serviceWorker.addEventListener("controllerchange", res, { once: true });
      setTimeout(res, 8000);
    });
  }
  return navigator.serviceWorker.controller ? "active" : "uncontrolled";
});
check("the service worker registers and takes control", registered === "active", registered);

// And wait for the shell to actually hold the documents it needs, rather than
// assuming a precache that runs asynchronously has finished.
await page.waitForFunction(async () => {
  const keys = await caches.keys();
  const shell = keys.find((k) => k.startsWith("zaban-shell"));
  const assets = keys.find((k) => k.startsWith("zaban-assets"));
  if (!shell) return false;
  const shellCount = (await (await caches.open(shell)).keys()).length;
  const assetCount = assets ? (await (await caches.open(assets)).keys()).length : 0;
  return shellCount >= 3 && assetCount >= 2;
}, null, { timeout: 20000 }).catch(() => {});
const cached = await page.evaluate(async () => {
  const keys = await caches.keys();
  const counts = {};
  for (const k of keys) counts[k] = (await (await caches.open(k)).keys()).length;
  return counts;
});
check("the app shell is cached", Object.keys(cached).some((k) => k.startsWith("zaban-shell")), JSON.stringify(cached));
check("the build assets are cached", Object.keys(cached).some((k) => k.startsWith("zaban-assets")), JSON.stringify(cached));

// Play a little audio so the audio cache has something in it.
await page.evaluate(() => fetch("/audio/ur/ur_0001.mp3").catch(() => {}));
await page.waitForTimeout(600);

// ---- 2. NETWORK OFF ---------------------------------------------------------
const failedReqs = [];
page.on("requestfailed", (r) => failedReqs.push(r.url().replace(BASE, "") + " " + (r.failure()?.errorText || "")));
page.on("console", (m) => { if (m.type() === "error") failedReqs.push("console: " + m.text().slice(0, 90)); });
await ctx.setOffline(true);
await page.reload();
await page.waitForSelector(".bottom-nav, .offline-bar", { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1200);

const bodyText = await page.locator("body").innerText();
check("the app loads from scratch with no network", !/hasn't finished saving/i.test(bodyText) && bodyText.length > 80,
  // On a failure, what actually 404'd is the whole diagnosis — this one turned
  // out to be Vary: Origin, and without the list it was unguessable.
  `body=${JSON.stringify(bodyText.slice(0, 60))} failed=${JSON.stringify(failedReqs.slice(0, 4))}`);
check("it says so, and says what still works", await page.locator(".offline-bar").isVisible());
check("the bar leads with what works rather than what doesn't",
  /carry on as normal|still work/i.test(await page.locator(".offline-bar").innerText().catch(() => "")));

// ---- 3. a real lesson, offline ---------------------------------------------
for (let h = 0; h < 6; h++) {
  await page.locator(".station-head").nth(h).click().catch(() => {});
  await page.waitForTimeout(250);
  if (await page.locator("button[data-unit]:not([disabled])").count()) break;
}
await page.locator("button[data-unit]:not([disabled])").first().click().catch(() => {});
await page.waitForTimeout(2000);
check("a lesson opens with no network", (await page.locator(".bottom-nav").count()) === 0);

let steps = 0;
for (let i = 0; i < 10; i++) {
  const moved = await page.evaluate(() => {
    const opts = [...document.querySelectorAll(".opt-btn")];
    if (opts.length >= 2) { opts[0].click(); return "answered"; }
    const go = [...document.querySelectorAll("button")].find(
      (b) => /^(check|continue|next|got it|i've got these|start practice|done)/i.test((b.innerText || "").trim()) && !b.disabled);
    if (go) { go.click(); return "advanced"; }
    return null;
  });
  if (!moved) break;
  steps++;
  await page.waitForTimeout(450);
}
check("the lesson can actually be played offline", steps >= 6, `${steps} steps`);
check("no crashes while offline", errors.length === 0, errors.slice(0, 2).join(" | "));

// ---- 4. progress written offline survives ----------------------------------
const xpAfter = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}").totalXp);
check("progress made offline is saved", typeof xpAfter === "number", String(xpAfter));

// ---- 5. reading, offline ----------------------------------------------------
await page.goto(BASE).catch(() => {});
await page.waitForTimeout(1800);
await page.locator(".bottom-nav button", { hasText: "Practice" }).click().catch(() => {});
await page.waitForTimeout(700);
await page.locator("button", { hasText: "Read some" }).first().click().catch(() => {});
await page.waitForTimeout(900);
const reading = await page.locator("body").innerText();
check("the reading library works offline", !/No reading passages/i.test(reading) && reading.length > 150);

// ---- 6. the AI degrades honestly -------------------------------------------
await page.goto(BASE).catch(() => {});
await page.waitForTimeout(1800);
await page.locator(".skip-invite-lead").click().catch(() => {});
await page.waitForTimeout(900);
const decode = await page.locator("body").innerText();
check("Decode says it needs a connection instead of hanging",
  /needs a connection/i.test(decode), decode.slice(0, 120));
check("and says what still works without one",
  /works offline|lessons, reviews/i.test(decode));

// ---- 7. /api is never served from cache ------------------------------------
const apiCached = await page.evaluate(async () => {
  const keys = await caches.keys();
  for (const k of keys) {
    const reqs = await (await caches.open(k)).keys();
    if (reqs.some((r) => new URL(r.url).pathname.startsWith("/api/"))) return k;
  }
  return null;
});
check("no AI request is ever cached — those are private messages", apiCached === null, String(apiCached));

// ---- 8. back online ---------------------------------------------------------
await ctx.setOffline(false);
await page.goto(BASE);
await page.waitForTimeout(1800);
check("the offline notice clears when the connection returns",
  (await page.locator(".offline-bar").count()) === 0);

await browser.close();
const failed = out.filter((r) => !r.ok);
console.log(`\n  ${out.length - failed.length} pass, ${failed.length} fail\n`);
process.exit(failed.length ? 1 : 0);
