// =============================================================================
// verify-lessons-browser.mjs — drives real lessons in a real browser, in every
// language, at several progress levels, and reports any crash.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/verify-lessons-browser.mjs
//
// "Sometimes the lessons are crashing" is only findable this way: the generator
// shuffles, exercise types unlock at different reps, and the crash is in the
// RENDER, not the data. So this plays lessons — tapping options, tapping word
// banks, typing, matching pairs — and watches for a pageerror or the app's own
// error boundary.
//
// Not part of `npm run check`: it needs Playwright, which isn't a dependency.
// =============================================================================

import { chromium } from "playwright";
import { readFileSync, readdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:4173";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
const LESSONS_PER_STATE = Number(process.env.LESSONS || 2);

const packs = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(`src/data/languages/${f}`, "utf8")))
  .filter((p) => !ONLY || ONLY.includes(p.code));

const failures = [];
let lessonsPlayed = 0;
let stepsTaken = 0;

function seedState(code) {
  return JSON.stringify({
    onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
    totalXp: 500, streak: 2, hearts: 5, heartsMax: 5, gems: 50,
    // Premium so a wrong answer can't end the run early — we're hunting crashes,
    // not testing the hearts economy.
    isPremium: true,
    theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
    lessonsCompleted: { [code]: 8 }, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: {}, sentenceDropsDone: {}, lastCheckpointAt: {}, testedOut: {},
    momentDone: {}, planVisited: {},
  });
}

/** Progress blobs matching the states the generator fuzz covers. */
function seedProgress(pack, level) {
  const now = Date.now();
  const card = (reps, lapses) => ({
    reps, lapses, ease: 2.5, interval: 6, stability: 6, difficulty: 5,
    due: now - 86400000, lastReview: now - 2 * 86400000,
  });
  const vocab = pack.vocab || [];
  const entries = {};
  if (level === "few") vocab.slice(0, 8).forEach((v) => { entries[v.id] = card(1, 0); });
  if (level === "half") vocab.slice(0, Math.floor(vocab.length / 2)).forEach((v) => { entries[v.id] = card(4, 1); });
  if (level === "mature") vocab.forEach((v) => { entries[v.id] = card(9, 0); });
  return JSON.stringify({ [pack.code]: entries });
}

/**
 * Answer whatever exercise is on screen, then press Check/Continue.
 * Returns "done" when the lesson has finished, "stuck" when nothing was
 * actionable, "crash" when the error boundary appeared.
 */
async function playStep(page) {
  if (await page.locator("text=Something went wrong").count()) return "crash";

  // Lesson complete screens carry one of these.
  for (const done of ["Back to home", "Continue learning", "Finish", "Done"]) {
    const b = page.locator(`button:has-text("${done}")`);
    if (await b.count()) {
      const visible = await b.first().isVisible().catch(() => false);
      if (visible) return "done";
    }
  }

  // 1. Word-bank exercises: tap every tile, in order.
  const bank = page.locator('[data-bank] button, .bank-tile');
  if (await bank.count()) {
    const n = await bank.count();
    for (let i = 0; i < n; i++) {
      const t = bank.nth(i);
      if (await t.isEnabled().catch(() => false)) await t.click({ timeout: 1500 }).catch(() => {});
    }
  }

  // 2. Match pairs: tap left column then the matching right column entry.
  //    Falls back to brute force — tap each left, then each right — which
  //    always completes an exercise whose pairs are actually matchable.
  //    (An unmatchable pair is exactly the bug this is looking for.)
  // 3. Speaking exercises. A headless browser has no microphone, so take the
  //    typed path the app itself offers rather than treating the screen as a
  //    dead end — "or type it" and "skip this one" are both real ways forward.
  for (const link of ["or type it", "or type it instead"]) {
    const b = page.locator(`button:has-text("${link}")`).first();
    if (await b.count() && await b.isVisible().catch(() => false)) {
      await b.click({ timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(200);
      break;
    }
  }

  // 4. Text input.
  const input = page.locator('input[type="text"]:visible, input:not([type]):visible');
  if (await input.count()) {
    await input.first().fill("answer").catch(() => {});
  }

  // 5. Plain option buttons — the common case. Click the first enabled one that
  //    isn't a nav/utility control.
  const clicked = await page.evaluate(() => {
    // "Try again" resets the speaking exercise, so sweeping it alongside the
    // real options made the harness oscillate forever instead of advancing.
    const SKIP = /^(check|continue|next|skip|got it|hear|listen|play|back|close|try again|say it again|or type|✕|🔊|report)/i;
    const buttons = [...document.querySelectorAll("button")].filter((b) => {
      if (b.disabled) return false;
      const r = b.getBoundingClientRect();
      if (r.width < 20 || r.height < 20) return false;
      const t = (b.innerText || "").trim();
      if (!t || SKIP.test(t)) return false;
      return true;
    });
    if (!buttons.length) return false;
    // Tap up to 4 — enough to complete a match-pairs grid, harmless elsewhere
    // since a second tap on an option just re-selects it.
    buttons.slice(0, 8).forEach((b) => b.click());
    return true;
  });

  // 6. Advance. "skip this one" is last: it's the app's own escape hatch and a
  //    legitimate way through a speaking prompt you can't answer.
  for (const label of ["Check", "Continue", "Next", "Got it", "I've got these", "skip this one"]) {
    const b = page.locator(`button:has-text("${label}")`).first();
    if (await b.count() && await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) {
      await b.click({ timeout: 2000 }).catch(() => {});
      return "step";
    }
  }
  return clicked ? "step" : "stuck";
}

/**
 * Get back to the home screen from wherever we are.
 *
 * A lesson hides the bottom nav (it's a focused screen), so "click the Learn
 * tab" only works once we've already left the lesson. This walks out first,
 * then navigates, and verifies it actually arrived — the previous version
 * assumed both and reported the app as having no way to start a lesson.
 */
async function goHome(page) {
  for (let i = 0; i < 6; i++) {
    if (await page.locator(".bottom-nav").count()) {
      await page.locator(".bottom-nav button", { hasText: "Learn" }).click().catch(() => {});
      await page.waitForTimeout(600);
      if (await page.locator(".station-head, button[data-unit]").count()) return true;
      continue;
    }
    // Still inside a focused screen — take the exit it offers.
    const left = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) =>
        /back to home|continue learning|finish|^done$|^continue$|^✕$/i.test((x.innerText || "").trim()));
      if (b) { b.click(); return true; }
      return false;
    });
    if (!left) return false;
    await page.waitForTimeout(700);
  }
  return false;
}

async function runLanguage(browser, pack, level) {
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e?.message || e)));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/fonts\.googleapis|ERR_CONNECTION_RESET|icon-\d+\.png|favicon/.test(t)) return;
    errors.push(t);
  });

  await page.goto(BASE);
  await page.evaluate(([app, prog]) => {
    localStorage.setItem("lingua:app", app);
    localStorage.setItem("lingua:progress", prog);
  }, [seedState(pack.code), seedProgress(pack, level)]);
  await page.reload();
  await page.waitForTimeout(1500);

  for (let lesson = 0; lesson < LESSONS_PER_STATE; lesson++) {
    if (!(await goHome(page))) {
      const where = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 120));
      failures.push(`${pack.code}/${level}: couldn't get back to home after lesson ${lesson} — ${where}`);
      break;
    }

    // Start a lesson by tapping a UNIT. Deterministic in every language, unlike
    // the hero action — which is legitimately a Sentence Lab drop or a review in
    // some states, and matching it by button text found the bottom nav's own
    // "Learn" tab instead.
    //
    // On a journey language the units live inside collapsed stops on the route
    // map, so every stop is expanded first.
    // The route map is an accordion: only one stop is open at a time, and a
    // locked stop shows an explanatory note instead of a Learn button. So open
    // them one at a time and stop at the first that offers a lesson.
    const heads = await page.locator(".station-head").count();
    for (let h = 0; h < heads; h++) {
      await page.locator(".station-head").nth(h).click().catch(() => {});
      await page.waitForTimeout(220);
      if (await page.locator("button[data-unit]:not([disabled])").count()) break;
    }

    const started = await page.evaluate((n) => {
      const units = [...document.querySelectorAll("button[data-unit]")].filter((b) => !b.disabled);
      if (!units.length) return false;
      units[n % units.length].click();
      return true;
    }, lesson);
    if (!started) { failures.push(`${pack.code}/${level}: no way to start a lesson from home`); break; }
    await page.waitForTimeout(1100);

    // A lesson takes over the viewport and hides the nav. If the nav is still
    // there we never left home, and every assertion after this would be a
    // false pass.
    const inLesson = (await page.locator(".bottom-nav").count()) === 0;
    if (!inLesson) {
      const where = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 120));
      failures.push(`${pack.code}/${level}: clicking the start action didn't open a lesson — ${where}`);
      break;
    }

    let outcome = "step";
    for (let step = 0; step < 90 && outcome === "step"; step++) {
      outcome = await playStep(page);
      stepsTaken++;
      await page.waitForTimeout(160);
      if (errors.length) break;
    }
    lessonsPlayed++;

    if (errors.length) {
      failures.push(`${pack.code}/${level}: ${errors[0]}`);
      break;
    }
    if (outcome === "crash") {
      const msg = await page.locator("text=Something went wrong").locator("xpath=..").innerText().catch(() => "");
      failures.push(`${pack.code}/${level}: error boundary — ${msg.replace(/\s+/g, " ").slice(0, 160)}`);
      break;
    }
    if (outcome === "stuck") {
      const shot = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 200));
      failures.push(`${pack.code}/${level}: STUCK — nothing tappable. Screen said: ${shot}`);
      break;
    }


  }

  await ctx.close();
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

for (const pack of packs) {
  for (const level of ["new", "few", "half", "mature"]) {
    process.stdout.write(`  ${pack.code}/${level} … `);
    const before = failures.length;
    try {
      await runLanguage(browser, pack, level);
    } catch (e) {
      failures.push(`${pack.code}/${level}: harness error — ${e?.message || e}`);
    }
    console.log(failures.length === before ? "ok" : "FAIL");
  }
}

await browser.close();

console.log(`\n  ${lessonsPlayed} lessons played, ${stepsTaken} steps, ${failures.length} problems\n`);
for (const f of failures) console.log(`  FAIL ${f}`);
process.exit(failures.length ? 1 : 0);
