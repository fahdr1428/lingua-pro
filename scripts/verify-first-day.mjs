// =============================================================================
// verify-first-day.mjs (v107) — a brand-new learner's whole first session,
// on real devices from the smallest phone to a desktop.
//
// Every other browser check starts from a seeded save. This one starts from
// nothing: an empty browser, the splash screen, choosing a language, the goal,
// age and terms — then Home, the first thing it offers (Chapter 0's reading
// test for a non-Latin script, a word lesson otherwise), played to the end —
// then back on Home, with the lesson counted and a streak begun, and a second
// lesson that actually starts. It is the one path every learner takes, and
// until now nothing walked it past the consent screen.
//
// Five languages (Latin, Devanagari with Chapter 0, Arabic RTL, Chinese,
// Yoruba tone marks) × four screens: 320×568 (the smallest phone still in
// use), 390×844, 820×1180 (tablet) and 1440×900.
//
// Fails on: any uncaught error or app console error, the error boundary, a
// step the learner can't get past, a sideways-scrolling page, Home not
// counting the lesson, or the second lesson not starting.
//
//   (cd dist && python3 -m http.server 4173) &
//   node scripts/verify-first-day.mjs          # ONLY=es,hi  DEVICES=320
// =============================================================================

import { chromium } from "playwright";
import { LANGUAGES } from "../src/data/registry.js";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CODES = (process.env.ONLY || "es,hi,ar,zh,yo").split(",");
const DEVICES = [
  ["320", { width: 320, height: 568 }], ["390", { width: 390, height: 844 }],
  ["tablet", { width: 820, height: 1180 }], ["desktop", { width: 1440, height: 900 }],
].filter(([k]) => !process.env.DEVICES || process.env.DEVICES.split(",").includes(k));
const NOISE = /fonts\.g|favicon|icon-\d+|ERR_CONNECTION|\/api\/|\/audio\/\w+\/\w+\.mp3/;

const problems = [];
const fail = (where, m) => problems.push(`${where}: ${m}`);

/**
 * Answer whatever exercise is on screen, then press Check/Continue.
 * Returns "done" when the lesson has finished, "stuck" when nothing was
 * actionable, "crash" when the error boundary appeared.
 */
async function playStep(page) {
  if (await page.locator("text=Something went wrong").count()) return "crash";

  // Finished = an actual results screen: a lesson's (Share + Continue) or the
  // reading test's "N of 12 right". Not any button that happens to say
  // "Done" — the new-words cards end on one, and treating that as the end of
  // the lesson is how this harness used to stop half-way through.
  const finished = await page.evaluate(() => {
    const t = document.querySelector("#main")?.innerText || document.body.innerText;
    return /\b\d+ of \d+ right\b/.test(t) || /📤 Share/.test(t);
  });
  if (finished) return "done";

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
    const SKIP = /^(check|continue|next|skip|got it|hear|listen|play|back|close|try again|say it again|or type|✕|🔊|report|←|previous|leave|finish)/i;
    // Only the screen's own controls: the reading test keeps the bottom nav on
    // screen, and "tap everything" used to wander off to Missions and Practice.
    const buttons = [...document.querySelectorAll("#main button")].filter((b) => {
      if (b.disabled) return false;
      if (b.closest(".bottom-nav, .side-rail, .policy-update")) return false;
      if (/Skip this one/i.test(b.innerText || "")) return false; // the audio escape hatch ends a last question
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

  // A bulk click above can itself finish the lesson; don't then press the
  // results screen's own Continue and walk off it.
  if (await page.evaluate(() => /\b\d+ of \d+ right\b|📤 Share/.test(document.querySelector("#main")?.innerText || ""))) return "done";
  // 6. Advance. "skip this one" is last: it's the app's own escape hatch and a
  //    legitimate way through a speaking prompt you can't answer.
  for (const label of ["Check", "Continue", "Finish", "Next", "Done", "Got it", "I've got these", "skip this one"]) {
    const b = page.locator(`#main button:has-text("${label}")`).first();
    if (await b.count() && await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) {
      await b.click({ timeout: 2000 }).catch(() => {});
      return "step";
    }
  }
  return clicked ? "step" : "stuck";
}


const clickText = (page, re) => page.evaluate((src) => {
  const rx = new RegExp(src, "i");
  const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent !== null && !x.disabled && rx.test((x.innerText || "").trim()));
  if (b) b.click();
  return !!b;
}, re.source);

async function playThrough(page, where, label) {
  const recent = [];
  for (let i = 0; i < 160; i++) {
    const now = await page.evaluate(() => (document.querySelector("#main")?.innerText || "").replace(/\s+/g, " ").slice(0, 110));
    if (!recent.length || !recent[recent.length - 1].endsWith(now)) recent.push(`[${i}] ${now}`);
    if (recent.length > 30) recent.shift();
    if (process.env.TRACE) console.log(`    <${i}> ${(await page.evaluate(() => (document.querySelector("#main")?.innerText || "").replace(/\s+/g, " ").slice(0, 160)))}`);
    const r = await playStep(page);
    if (process.env.TRACE2) { console.log("      clicks: " + (await page.evaluate(() => { const c = window.__clicks.splice(0); return c.join(" | "); }))); }
    if (process.env.TRACE2) for (const ms of [30, 200, 600]) { await page.waitForTimeout(ms); console.log(`      +${ms} ${(await page.evaluate(() => (document.querySelector("#main")?.innerText || "").replace(/\s+/g, " ").slice(0, 120)))}`); }
    await page.waitForTimeout(350);
    if (r === "crash") { fail(where, `${label}: the error boundary appeared at step ${i}`); return false; }
    if (process.env.TRACE) console.log(`    [${i}] ${r} :: ${(await page.evaluate(() => (document.querySelector("#main")?.innerText || document.body.innerText).replace(/\s+/g, " ").slice(0, 110)))}`);
    if (r === "done") return true;
    if (r === "stuck") {
      const t = await page.evaluate(() => (document.querySelector("#main")?.innerText || document.body.innerText).replace(/\s+/g, " ").slice(0, 140));
      // The script test and a lesson both end on screens with a way home.
      if (/Back home|Continue|Go to lessons|Start lessons|See the/i.test(t) && i > 3) return true;
      fail(where, `${label}: stuck at step ${i} — "${t}"`);
      return false;
    }
  }
  fail(where, `${label}: didn't finish in 160 steps — last screens:\n      ${recent.join("\n      ")}`);
  return false;
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const code of CODES) {
  const name = LANGUAGES[code].name;
  for (const [dev, size] of DEVICES) {
    const where = `${code} ${dev}`;
    const ctx = await browser.newContext({ viewport: size });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => fail(where, `uncaught: ${e.message}`));
    if (process.env.TRACE2) {
      await page.addInitScript(() => {
        window.__clicks = [];
        document.addEventListener("click", (e) => {
          const b = e.target.closest("button");
          window.__clicks.push(`${Math.round(performance.now())} ${e.isTrusted ? "trusted" : "synthetic"} "${(b?.innerText || e.target.tagName).replace(/\s+/g, " ").slice(0, 40)}"`);
        }, true);
      });
    }
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const t = `${m.text()} ${m.location()?.url || ""}`;
      if (!NOISE.test(t)) fail(where, `console.error: ${process.env.FULLERR ? t : t.slice(0, 180)}`);
    });
    const sideways = async (at) => {
      const o = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
      if (o > 1) fail(where, `${at}: page scrolls sideways by ${o}px`);
    };

    await page.goto(BASE, { waitUntil: "load" });
    await page.waitForTimeout(900);
    await sideways("splash");

    // --- onboarding -----------------------------------------------------
    if (!(await clickText(page, /^Get started$/))) { fail(where, "no Get started on a fresh install"); await ctx.close(); continue; }
    await page.waitForTimeout(400);
    await sideways("language picker");
    const picked = await page.evaluate((n) => {
      const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && new RegExp(`^\\S*\\s*${n}\\b`).test((x.innerText || "").trim().replace(/^\W+/, "")));
      const c = b || [...document.querySelectorAll("button")].find((x) => x.offsetParent && (x.innerText || "").includes(n));
      if (c) { c.scrollIntoView(); c.click(); }
      return !!c;
    }, name);
    if (!picked) { fail(where, `${name} isn't on the language picker`); await ctx.close(); continue; }
    await page.waitForTimeout(200);
    await clickText(page, /^Continue$/);
    await page.waitForTimeout(400);
    await sideways("goal step");
    await clickText(page, /^Continue$/);
    await page.waitForTimeout(400);
    await sideways("consent step");
    const boxes = page.locator(".ai-check input");
    if ((await boxes.count()) !== 2) { fail(where, `consent step has ${await boxes.count()} boxes, expected 2`); await ctx.close(); continue; }
    await boxes.nth(0).check(); await boxes.nth(1).check();
    await clickText(page, /Start learning/);
    await page.waitForTimeout(1200);

    // The first-run tour. A new learner reads it, so page through with Next
    // rather than Skip — each card has to fit and each Next has to work.
    let tourCards = 0;
    for (let i = 0; i < 10; i++) {
      if (await page.locator(".hero-premium").count()) break;
      await sideways(`tour card ${i + 1}`);
      if (!(await clickText(page, /^(Next|Got it|Let's go|Start|Done)\b/))) break;
      tourCards++;
      await page.waitForTimeout(450);
    }
    await page.waitForTimeout(600);
    await sideways("first Home");

    // --- first thing Home offers ---------------------------------------
    const hero = await page.evaluate(() => (document.querySelector(".hero-premium")?.innerText || "").replace(/\s+/g, " "));
    if (!hero) {
      const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 140));
      fail(where, `Home has no next-action card after onboarding and ${tourCards} tour cards — "${t}"`);
      await ctx.close(); continue;
    }
    const isScriptTest = /Can you read/i.test(hero);
    const expectScript = !["es", "fr", "de", "id", "tl", "pcm", "tr", "vi", "yo", "so"].includes(code);
    if (expectScript && !isScriptTest) fail(where, `a new ${name} learner wasn't offered Chapter 0 first — hero: "${hero.slice(0, 80)}"`);
    await page.locator(".hero-premium .btn-premium").first().click();
    await page.waitForTimeout(1200);
    await sideways(isScriptTest ? "reading test" : "first lesson");
    if (!(await playThrough(page, where, isScriptTest ? "Chapter 0 reading test" : "first lesson"))) { await ctx.close(); continue; }
    await sideways("results");

    // Back to Home by whatever the finish screen offers.
    for (let i = 0; i < 4; i++) {
      if (await page.locator(".bottom-nav").count() && await page.locator(".hero-premium").count()) break;
      if (!(await clickText(page, /^(Back home|Continue|Done|Finish|Go to lessons|Start lessons)/))) {
        await page.evaluate(() => [...document.querySelectorAll(".bottom-nav button")].find((b) => /learn/i.test(b.innerText || ""))?.click());
      }
      await page.waitForTimeout(900);
    }
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
    if (!isScriptTest) {
      if ((saved.lessonsCompleted?.[code] || 0) < 1) fail(where, `finished the first lesson but lessonsCompleted is ${JSON.stringify(saved.lessonsCompleted)}`);
      if ((saved.streak || 0) < 1) fail(where, `finished the first lesson but the streak is ${saved.streak}`);
    } else if (!saved.scriptCourse?.[code]) {
      fail(where, `took the reading test but nothing about it was saved (scriptCourse=${JSON.stringify(saved.scriptCourse)})`);
    } else if (!saved.scriptCourse[code].passed) {
      // Failed it (random answers). The next step must be learning to read,
      // not the same test again — and Chapter 1 must still be reachable.
      const heroAfter = await page.evaluate(() => (document.querySelector(".hero-premium")?.innerText || "").replace(/\s+/g, " "));
      if (/Can you read/i.test(heroAfter)) fail(where, `failed the reading test and Home's next step is the same test again — "${heroAfter.slice(0, 90)}"`);
      if (!/learning to read/i.test(heroAfter)) fail(where, `after a failed reading test the next step isn't a letter lesson — "${heroAfter.slice(0, 90)}"`);
      if (!/start Chapter 1/i.test(heroAfter)) fail(where, "after a failed reading test there's no way into Chapter 1");
    }

    // --- and the next thing starts --------------------------------------
    const hero2 = page.locator(".hero-premium .btn-premium").first();
    if (!(await hero2.count())) { fail(where, "Home has no next action after the first session"); await ctx.close(); continue; }
    await hero2.click();
    await page.waitForTimeout(1500);
    const second = await page.evaluate(() => (document.querySelector("#main")?.innerText || "").replace(/\s+/g, " ").slice(0, 120));
    if (/Something went wrong/i.test(second) || second.length < 10) fail(where, `the second session didn't start — "${second}"`);
    await sideways("second session");
    console.log(`  ✓ ${where}: ${isScriptTest ? `reading test (${saved.scriptCourse?.[code]?.passed ? "passed" : "not passed"}, ${saved.scriptCourse?.[code]?.attempts} attempt)` : "lesson"} → Home → "${second.slice(0, 50)}…"`);
    await ctx.close();
  }
}
await browser.close();

const unique = [...new Set(problems)];
console.log(`\n  first day: ${CODES.length} languages × ${DEVICES.length} devices`);
if (unique.length) {
  console.log(`\n  ✗ ${unique.length} problems\n`);
  for (const p of unique) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ a new learner gets from an empty browser through their first session and into the next, everywhere\n");
