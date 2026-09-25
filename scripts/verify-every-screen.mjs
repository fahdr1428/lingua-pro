// =============================================================================
// verify-every-screen.mjs (v107) — open every screen, in every language, and
// look for the things that are embarrassing rather than subtle.
//
// Each other verify-* script drives one feature in depth. None of them asks
// the dumb, broad question: if a learner of Tamil opens the Grammar screen on a
// phone in dark mode, does anything obviously break? This does, for every
// screen the app can render, by writing the navigation stack the app restores
// from sessionStorage (lingua:nav) and reloading — the same path a real reload
// takes, so nothing is faked.
//
// On each screen it fails on:
//   · an uncaught exception, or the error boundary's "Something went wrong"
//   · console errors (network noise from fonts and missing optional images
//     aside)
//   · a screen with nothing in it
//   · "undefined", "NaN", "[object Object]" or "{{" in visible text — a value
//     that didn't arrive, printed anyway
//   · the page scrolling sideways
//   · a button with no accessible name (icon-only, no aria-label)
//   · a broken image
//
// Phone (390×844, light) for every language; desktop (1440×900, dark) for a
// spread of scripts. A learner half-way through, with some words slipping.
//
//   (cd dist && python3 -m http.server 4173) &
//   node scripts/verify-every-screen.mjs            # ONLY=ur,ar  SCREENS=grammar
// =============================================================================

import { chromium } from "playwright";
import { readFileSync, readdirSync } from "node:fs";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const ALL = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
const DESKTOP = (process.env.DESKTOP || "ur,ar,ja,zh,ta,yo,de").split(",");

// Every screen App.jsx renders, with the params a real visit would carry.
const SCREENS = [
  ["home"], ["hub"], ["letters"], ["flashcards"], ["alphabet"], ["scriptexam"],
  ["practice"], ["speak"], ["culture"], ["missions"], ["fluency"], ["skipahead"],
  ["dialect"], ["reading"], ["conversations"], ["sentencelab"], ["grammar"],
  ["vocab"], ["profile"], ["settings"], ["upgrade"], ["legal"], ["decode"],
  ["stream"], ["topics"], ["listen"],
  ["lesson", { mode: "smart" }],
  ["lesson", { mode: "topic", filter: { category: "Food" }, sessionSize: 8, topic: "Food" }],
].filter(([s]) => !process.env.SCREENS || process.env.SCREENS.split(",").includes(s));

const DAY = 86400000;
function seedProgress(pack) {
  const now = Date.now();
  const out = {};
  pack.vocab.slice(0, Math.floor(pack.vocab.length / 2)).forEach((v, i) => {
    out[v.id] = {
      difficulty: 5, stability: 2 + (i % 20), reps: 2 + (i % 5), lapses: i % 7 === 0 ? 2 : 0,
      lastReview: now - (1 + (i % 30)) * DAY, nextReview: now - DAY, lastRating: 3,
    };
  });
  return { [pack.code]: out };
}
const seedApp = (code, theme) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 1400, streak: 4, hearts: 5, heartsMax: 5, gems: 80, theme,
  showRomanization: true, sessionSize: 6, soundEffects: false,
  lessonsCompleted: { [code]: 12 }, sessions: [], grammarSeen: {}, learningGoal: { [code]: "basics" },
  chaptersPassed: {}, sentenceDropsDone: { [code]: 2 }, lastCheckpointAt: {}, testedOut: {},
  momentDone: {}, planVisited: {}, passagesRead: {}, userName: "Sam",
  lastStudyDate: new Date().toISOString().slice(0, 10),
  consent: { terms: true, ageConfirmed: 13, at: 0, policyVersion: "2026-08-06" },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
});

// Filtered by the URL that failed, not by the message: "Failed to load
// resource" is exactly what a missing image in app code looks like, and an
// earlier version of this filter swallowed the 404s it should have reported.
// What's left out: the font CDN (blocked by this sandbox), icons, the /api/
// coach (no key in a local build), and recorded audio a word doesn't have.
const NOISE = /fonts\.g|favicon|icon-\d+|ERR_CONNECTION|\/api\/|\/audio\/\w+\/\w+\.mp3/;
const problems = [];
let visits = 0;

async function visit(page, code, viewport, screen, params, errors) {
  errors.length = 0;
  // The app always opens on Home (App.jsx replaces the current entry on load),
  // so a stack written to sessionStorage is not enough by itself. Its back/
  // forward handling is real, though: a popstate carrying linguaIndex N shows
  // stack[N]. So: seed [home, target] at index 0, reload, push two entries,
  // and go back one — the browser delivers linguaIndex 1, the target.
  await page.evaluate(([screen, params]) => {
    sessionStorage.setItem("lingua:nav", JSON.stringify({
      stack: [{ screen: "home", params: null, scroll: 0 }, { screen, params: params || null, scroll: 0 }], index: 0,
    }));
  }, [screen, params]);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    history.pushState({ linguaIndex: 1 }, "");
    history.pushState({ linguaIndex: 99 }, "");
    history.back();
  });
  // Wait for the screen to have something in it, rather than a fixed sleep: a
  // lazy chunk under three parallel browsers can take longer than a second.
  // And, for any screen but Home, until Home has actually been replaced — the
  // popstate navigation runs inside a view transition, which under load can
  // take longer than the first paint of content.
  await page.waitForFunction((isHome) => {
    const main = document.querySelector("#main");
    const t = (main?.innerText || "").trim();
    return t.length > 15 && t !== "Loading…" && (isHome || !main.querySelector(".home-greet"));
  }, screen === "home", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(300);
  // Home is recognised by its structure, not its words — a Japanese reading
  // passage titled "Good morning" is not the home screen's greeting.
  const stillHome = await page.evaluate(() => !!document.querySelector("#main .home-greet"));
  if (screen !== "home" && stillHome) {
    problems.push(`${code} ${viewport} ${screen}: harness never left Home — this visit checked nothing`);
  }
  visits++;
  const where = `${code} ${viewport} ${screen}${params?.mode ? `(${params.mode})` : ""}`;

  const r = await page.evaluate(() => {
    const main = document.querySelector("#main");
    const text = (main?.innerText || "").trim();
    const all = document.body.innerText || "";
    const bad = [];
    for (const re of [/\bundefined\b/, /\bNaN\b/, /\[object Object\]/, /\{\{/]) {
      const m = all.match(re);
      if (m) {
        const i = all.indexOf(m[0]);
        bad.push(all.slice(Math.max(0, i - 40), i + 30).replace(/\s+/g, " "));
      }
    }
    const nameless = [...document.querySelectorAll("button, [role=button], a[href]")]
      .filter((b) => b.offsetParent !== null)
      .filter((b) => !(b.innerText || "").trim() && !b.getAttribute("aria-label") && !b.getAttribute("title")
        && !b.querySelector("img[alt]:not([alt=''])"))
      .map((b) => b.outerHTML.slice(0, 90));
    const brokenImgs = [...document.images]
      .filter((i) => i.complete && i.naturalWidth === 0 && i.offsetParent !== null && !/scenes\//.test(i.src))
      .map((i) => i.src);
    return {
      text: text.length,
      crashed: /Something went wrong/i.test(all),
      overflow: document.scrollingElement.scrollWidth - window.innerWidth,
      bad, nameless, brokenImgs,
      loading: /^Loading…$/.test(text),
    };
  });

  if (r.crashed) problems.push(`${where}: error boundary — "Something went wrong"`);
  if (r.text < 15 && !r.crashed) problems.push(`${where}: screen is empty (${r.text} chars)${r.loading ? " — stuck on Loading…" : ""}`);
  for (const b of r.bad) problems.push(`${where}: broken value in text: "…${b}…"`);
  if (r.overflow > 1) problems.push(`${where}: page scrolls sideways by ${r.overflow}px`);
  for (const n of r.nameless.slice(0, 3)) problems.push(`${where}: button with no accessible name: ${n}`);
  for (const i of r.brokenImgs) problems.push(`${where}: broken image ${i}`);
  for (const e of errors) problems.push(`${where}: ${e}`);
}

async function run(browser, code, viewport, theme, size) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const ctx = await browser.newContext({ viewport: size });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`uncaught: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = `${m.text()} ${m.location()?.url || ""}`;
    if (!NOISE.test(t)) errors.push(`console.error: ${t.slice(0, 200)}`);
  });
  await page.goto(BASE);
  await page.evaluate(([a, p]) => {
    localStorage.setItem("lingua:app", JSON.stringify(a));
    localStorage.setItem("lingua:progress", JSON.stringify(p));
  }, [seedApp(code, theme), seedProgress(pack)]);
  for (const [screen, params] of SCREENS) {
    try { await visit(page, code, viewport, screen, params, errors); }
    catch (e) { problems.push(`${code} ${viewport} ${screen}: harness error ${e.message}`); }
  }
  await ctx.close();
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const jobs = [];
for (const code of ALL.filter((c) => !ONLY || ONLY.includes(c))) jobs.push([code, "phone", "cream", { width: 390, height: 844 }]);
for (const code of DESKTOP.filter((c) => !ONLY || ONLY.includes(c))) jobs.push([code, "desktop", "dark", { width: 1440, height: 900 }]);

// Three at a time: a full pass is several hundred reloads.
const queue = [...jobs];
await Promise.all([0, 1, 2].map(async () => {
  while (queue.length) {
    const [code, vp, theme, size] = queue.shift();
    await run(browser, code, vp, theme, size);
    process.stdout.write(`  · ${code} ${vp}\n`);
  }
}));
await browser.close();

const unique = [...new Set(problems)];
console.log(`\n  every screen: ${visits} screen visits · ${jobs.length} language/device runs`);
if (unique.length) {
  console.log(`\n  ✗ ${unique.length} problems\n`);
  for (const p of unique) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ no crashes, empty screens, broken values, sideways scroll, nameless buttons or broken images\n");
