#!/usr/bin/env node
// =============================================================================
// verify-course.mjs — the structured course, in a real browser, in ALL 21
// languages.
//
// For every language:
//   · Home shows the course panel (variety, module progress, seven skills with
//     "not enough evidence" for a new learner) and the next action is the
//     course's first structured lesson ("Module 1 · …");
//   · that lesson opens on its objectives, shows its phase ("Step n of m"),
//     draws the language in the right direction and typeface (Nastaliq for
//     Urdu; Naskh for Arabic, Persian and Shahmukhi; nothing Arabic for the
//     rest), and plays through to per-objective feedback;
//   · what it did is saved: the lesson is done, the answers are logged with
//     their phases, and after a RELOAD Home offers the next lesson;
//   · the module's conversation task opens on its exchange, shows "They say"
//     above the conversation exercises, and finishes;
//   · the Course screen lists exactly the pack's units as modules, with the
//     review status stated;
//   · nothing scrolls sideways at 320px, and there are no page errors.
//
// Plus one returning learner (Spanish, words of unit 1 already produced from
// memory): Home skips the word lessons they can already do and offers the
// module's conversation — and the map withholds "You can …" until it's done.
//
//   npx vite build && (npx vite preview --port 4173 --strictPort &) ; node scripts/verify-course.mjs
//   CODES=ur,zh node scripts/verify-course.mjs     # a subset
// =============================================================================

import { chromium } from "playwright";
import { readFileSync, existsSync } from "node:fs";
import { LANGUAGES } from "../src/data/registry.js";
import { measure } from "./lib/inventory.mjs";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CODES = (process.env.CODES || Object.keys(LANGUAGES).sort().join(",")).split(",");
const NOISE = /favicon|Failed to load resource|ERR_|net::|speechSynthesis|AudioContext|NotAllowedError|status of 404/i;
const CHROME = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/opt/pw-browsers/chromium"].find((p) => existsSync(p));

let problems = 0;
const fail = (where, m) => { console.log(`    ✗ ${where}: ${m}`); problems++; };
const pack = (code) => JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
const DAY = 86400000;
const now = Date.now();

function appState(code, extra = {}) {
  return {
    onboarded: true, currentLanguage: code, tutorialSeen: true, soundEffects: false,
    lessonsCompleted: { [code]: 0 }, scriptCourse: { [code]: { passed: true } }, sessionSize: 6,
    metCharacters: [code], userName: "Sam", sessions: [],
    consent: { terms: true, ageConfirmed: 13, at: 0, policyVersion: "2026-08-06" },
    ...extra,
  };
}

const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});

async function open(code, { app, progress = {}, stack = [{ screen: "home" }], width = 360, course = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = `${m.text()} ${m.location()?.url || ""}`;
    if (!NOISE.test(t)) errors.push(`console: ${t.slice(0, 160)}`);
  });
  await page.goto(BASE);
  await page.evaluate(([c, a, p, s, cs]) => {
    localStorage.clear();
    localStorage.setItem("lingua:app", JSON.stringify(a));
    localStorage.setItem("lingua:progress", JSON.stringify({ [c]: p }));
    if (cs) localStorage.setItem("lingua:course", JSON.stringify({ [c]: cs }));
    sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: s, index: s.length - 1 }));
  }, [code, app || appState(code), progress, stack, course]);
  await page.reload();
  await page.waitForTimeout(1600);
  return { ctx, page, errors };
}

const sideways = (page) => page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
const mainText = (page) => page.evaluate(() => (document.querySelector("#main")?.innerText || "").replace(/\s+/g, " "));

/** Play a lesson to its results, by whatever each screen offers. Records what it saw. */
async function play(page, where, seen = new Set()) {
  for (let i = 0; i < 140; i++) {
    if (await page.locator("text=Something went wrong").count()) { fail(where, `error boundary at step ${i}`); return false; }
    const state = await page.evaluate(() => {
      const m = document.querySelector("#main");
      const t = m?.innerText || "";
      return {
        done: /📤 Share/.test(t),
        phase: document.querySelector("[data-testid=guided-phase]")?.getAttribute("data-phase") || null,
        objectives: !!document.querySelector("[data-testid=guided-objectives]"),
        exchange: !!document.querySelector("[data-testid=guided-exchange]"),
        context: !!document.querySelector("[data-testid=guided-context]"),
      };
    });
    if (state.phase) seen.add(`phase:${state.phase}`);
    if (state.objectives) seen.add("objectives");
    if (state.exchange) seen.add("exchange");
    if (state.context) seen.add("context");
    if (state.done) return true;

    // Tiles, in order.
    const tiles = page.locator("[data-bank] button, .bank-tile");
    for (let k = 0, n = await tiles.count(); k < n; k++) {
      const t = tiles.nth(k);
      if (await t.isEnabled().catch(() => false)) await t.click({ timeout: 1000 }).catch(() => {});
    }
    for (const link of ["or type it", "or type it instead"]) {
      const b = page.locator(`#main button:has-text("${link}")`).first();
      if (await b.count() && await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); break; }
    }
    const input = page.locator("#main input:visible");
    if (await input.count()) await input.first().fill("answer").catch(() => {});

    await page.evaluate(() => {
      const SKIP = /^(check|continue|next|skip|got it|hear|listen|play|back|close|try again|say it again|or type|✕|🔊|report|←|previous|leave|finish|hint|a bit more|that's all)/i;
      const buttons = [...document.querySelectorAll("#main button")].filter((b) => {
        if (b.disabled || b.closest(".bottom-nav, .side-rail")) return false;
        if (/Skip this one/i.test(b.innerText || "")) return false;
        const r = b.getBoundingClientRect();
        const t = (b.innerText || "").trim();
        return r.width >= 20 && r.height >= 20 && t && !SKIP.test(t);
      });
      buttons.slice(0, 8).forEach((b) => b.click());
    });
    if (await page.evaluate(() => /📤 Share/.test(document.querySelector("#main")?.innerText || ""))) return true;
    let moved = false;
    for (const label of ["Check", "Continue", "Finish", "Next", "Done", "Got it", "Start practice", "skip this one"]) {
      const b = page.locator(`#main button:has-text("${label}")`).first();
      if (await b.count() && await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) {
        await b.click({ timeout: 2000 }).catch(() => {});
        moved = true;
        break;
      }
    }
    await page.waitForTimeout(moved ? 300 : 450);
  }
  fail(where, `didn't reach the results in 140 steps — at "${(await mainText(page)).slice(0, 100)}"`);
  return false;
}

const EXPECT_FONT = { ur: /Nastaliq/, ar: /^"?Noto Naskh/, fa: /^"?Noto Naskh/, pa: /^"?Noto Naskh/ };

for (const code of CODES) {
  const name = LANGUAGES[code].name;
  const p = pack(code);
  const where = `${code}`;
  const rtl = !!LANGUAGES[code].rtl;

  // --- a new learner: Home → lesson 1 → results → Home (reload) -------------
  {
    const { ctx, page, errors } = await open(code);
    const panel = await page.locator("[data-testid=course-panel]").innerText().catch(() => "");
    if (!panel) fail(where, "Home has no course panel");
    else {
      if (!/Module 1 of \d+/.test(panel)) fail(where, `the course panel doesn't place a new learner in Module 1 — "${panel.replace(/\s+/g, " ").slice(0, 120)}"`);
      const skills = await page.locator("[data-testid=skill-profile] li").count();
      if (skills !== 7) fail(where, `${skills} skills shown, expected 7`);
      if (!/Not enough evidence yet/.test(panel)) fail(where, "a learner with no answers is shown skill scores");
    }
    const hero = (await page.locator(".hero-premium").innerText().catch(() => "")).replace(/\s+/g, " ");
    const firstTitle = measure(code).course.modules[0].lessons[0].title;
    if (!hero.includes(firstTitle)) fail(where, `the next action isn't the course's first lesson ("${firstTitle}") — "${hero.slice(0, 100)}"`);
    if (await sideways(page) > 1) fail(where, "Home scrolls sideways at 360px");

    await page.locator(".hero-premium .btn-premium").click();
    await page.waitForTimeout(1500);
    if (!(await page.locator("[data-testid=guided-objectives]").count())) fail(where, `the lesson didn't open on its objectives — "${(await mainText(page)).slice(0, 100)}"`);
    const phaseLabel = await page.locator("[data-testid=guided-phase]").innerText().catch(() => "");
    if (!/Step \d+ of \d+/.test(phaseLabel)) fail(where, `no phase indicator — "${phaseLabel}"`);
    const native = await page.evaluate(() => {
      const el = document.querySelector(".g-native");
      return el ? { dir: el.getAttribute("dir"), font: getComputedStyle(el).fontFamily, lang: el.getAttribute("lang") } : null;
    });
    if (native) {
      if (native.dir !== (rtl ? "rtl" : "ltr")) fail(where, `native line drawn ${native.dir}, expected ${rtl ? "rtl" : "ltr"}`);
      if (native.lang !== code) fail(where, `native line lang="${native.lang}"`);
      if (EXPECT_FONT[code] && !EXPECT_FONT[code].test(native.font)) fail(where, `${name} drawn in ${native.font}`);
      if (!EXPECT_FONT[code] && /Nastaliq|Naskh/.test(native.font)) fail(where, `${name} drawn in an Arabic-script face: ${native.font}`);
    }

    const seen = new Set();
    const finished = await play(page, `${where} lesson 1`, seen);
    if (finished) {
      for (const ph of ["objectives", "phase:teach", "phase:guided", "phase:assess"]) {
        if (!seen.has(ph)) fail(where, `lesson 1 never showed ${ph}`);
      }
      const res = page.locator("[data-testid=guided-results]");
      if (!(await res.count())) fail(where, "no per-objective feedback on the results screen");
      else {
        const statuses = await res.locator("li[data-status]").evaluateAll((els) => els.map((e) => e.getAttribute("data-status")));
        if (!statuses.length || statuses.some((s) => !["met", "not-yet", "explained", "none"].includes(s))) fail(where, `objective statuses: ${statuses.join(",")}`);
      }
      const saved = await page.evaluate((c) => ({
        course: JSON.parse(localStorage.getItem("lingua:course") || "{}")[c] || {},
        attempts: JSON.parse(localStorage.getItem("lingua:attempts") || "{}")[c] || [],
      }), code);
      if (!saved.course.done?.[`${code}.m01.l1`]) fail(where, `lesson ${code}.m01.l1 wasn't recorded as done (${JSON.stringify(Object.keys(saved.course.done || {}))})`);
      if (!saved.attempts.some((a) => a.ph === "assess")) fail(where, "no assessment answers in the answer log");
      if (saved.attempts.some((a) => String(a.id || "").includes("_stop_"))) fail(where, "a conversation reply was logged as a word");

      const hero1 = hero;
      await page.evaluate(() => sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: [{ screen: "home" }], index: 0 })));
      await page.reload();
      await page.waitForTimeout(1800);
      const hero2 = (await page.locator(".hero-premium").innerText().catch(() => "")).replace(/\s+/g, " ");
      if (!hero2 || hero2 === hero1) fail(where, `after a reload Home still offers the same thing — "${hero2.slice(0, 90)}"`);
    }
    if (errors.length) fail(where, `page errors: ${errors.slice(0, 2).join(" | ")}`);
    console.log(`  ${problems ? "·" : "✓"} ${where}: lesson 1 → feedback → saved → next`);
    await ctx.close();
  }

  // --- the module's conversation task --------------------------------------
  {
    const lesson = `${code}.m01.task`;
    const { ctx, page, errors } = await open(code);
    // Opened the way a learner would: the Course screen lists every lesson.
    await page.locator("[data-testid=open-course]").click().catch(() => {});
    await page.waitForTimeout(1400);
    await page.locator(`[data-lesson="${lesson}"]`).click().catch(() => fail(where, `the Course screen has no ${lesson}`));
    await page.waitForTimeout(1500);
    const seen = new Set();
    const finished = await play(page, `${where} task`, seen);
    if (finished) {
      if (!seen.has("exchange")) fail(where, "the conversation task never showed its exchange");
      if (!seen.has("context")) fail(where, "no conversation exercise showed what was said to you");
      const done = await page.evaluate(([c, l]) => !!(JSON.parse(localStorage.getItem("lingua:course") || "{}")[c]?.done?.[l]), [code, lesson]);
      if (!done) fail(where, "the task wasn't recorded as done");
    }
    if (errors.length) fail(where, `page errors (task): ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }

  // --- 320px: Home, the objectives card, the Course screen -------------------
  {
    const { ctx, page, errors } = await open(code, { width: 320 });
    if (await sideways(page) > 1) fail(where, `Home scrolls sideways at 320px by ${await sideways(page)}px`);
    await page.locator("[data-testid=open-course]").click().catch(() => fail(where, "no 'See the whole course' link"));
    await page.waitForTimeout(1500);
    const modules = await page.locator("[data-module]").count();
    if (modules !== p.units.length) fail(where, `Course screen shows ${modules} modules for ${p.units.length} units`);
    if (!(await page.locator("[data-testid=review-status]").count())) fail(where, "the Course screen doesn't state its review status");
    const facts = await page.locator("[data-testid=course-profile]").innerText().catch(() => "");
    if (!/Script/.test(facts) || (rtl ? !/right to left/.test(facts) : !/left to right/.test(facts))) fail(where, `course profile direction wrong: "${facts.replace(/\s+/g, " ").slice(0, 120)}"`);
    if (await sideways(page) > 1) fail(where, `Course screen scrolls sideways at 320px by ${await sideways(page)}px`);
    await page.locator("[data-lesson]").first().click();
    await page.waitForTimeout(1500);
    if (!(await page.locator("[data-testid=guided-objectives]").count())) fail(where, "a lesson opened from the Course screen didn't show its objectives");
    if (await sideways(page) > 1) fail(where, `the objectives card scrolls sideways at 320px by ${await sideways(page)}px`);
    if (errors.length) fail(where, `page errors (320px): ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }
}

// --- a returning learner: what they can already do is skipped ---------------
if (CODES.includes("es")) {
  const where = "es returning";
  const es = pack("es");
  const u1 = es.vocab.filter((v) => v.unit === es.units[0].id);
  const progress = {};
  for (const v of u1) progress[v.id] = { difficulty: 5, stability: 9, reps: 4, lapses: 0, lastReview: now - 2 * DAY, nextReview: now + 7 * DAY, lastRating: 3, recalls: 2 };
  // Four lessons in, milestone exam and Sentence Lab drops already taken, so the
  // course step is what Home picks.
  const returning = appState("es", { lessonsCompleted: { es: 4 }, lastCheckpointAt: { es: 3 }, sentenceDropsDone: { es: 5 } });
  const { ctx, page, errors } = await open("es", { progress, app: returning });
  const hero = (await page.locator(".hero-premium").innerText().catch(() => "")).replace(/\s+/g, " ");
  if (!/Conversation:/i.test(hero)) fail(where, `unit 1's words are produced from memory; Home should offer Module 1's conversation, offers "${hero.slice(0, 100)}"`);
  const first = await page.locator(".route .station").nth(0);
  const label = await first.locator(".station-label").innerText().catch(() => "");
  if (/^You can/.test(label.trim())) fail(where, `the map says "${label.trim()}" before the conversation was practised`);
  await first.locator(".station-head").click().catch(() => {});
  await page.waitForTimeout(400);
  if (!(await first.locator("[data-task]").count())) fail(where, "the almost-yours stop has no 'Practise the conversation' button");
  await ctx.close();

  // …and with the conversation practised, the claim is made.
  const r = await open("es", { progress, app: returning, course: { done: {}, results: {}, exchanges: { [`es-c1-s1`]: now } } });
  const label2 = await r.page.locator(".route .station").nth(0).locator(".station-label").innerText().catch(() => "");
  if (!/^You can/.test(label2.trim())) fail(where, `words from memory and the conversation practised, but the stop reads "${label2.trim().slice(0, 80)}"`);
  if (errors.length || r.errors.length) fail(where, `page errors: ${[...errors, ...r.errors].slice(0, 2).join(" | ")}`);
  await r.ctx.close();
  console.log(`  ${problems ? "·" : "✓"} es: a returning learner is sent to what they can't yet do`);
}

await browser.close();
console.log(`\n  course: ${CODES.length} languages`);
if (problems) {
  console.log(`  ✗ ${problems} problems\n`);
  process.exit(1);
}
console.log("  ✓ the structured course works, is saved, and is laid out correctly in every language\n");
