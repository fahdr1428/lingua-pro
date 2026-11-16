// =============================================================================
// verify-audit.mjs (v118) — the outside audit's fixes, in a real browser.
//
//   SIGN-UP ASKS WHERE TO START
//   · Urdu is first on the picker; Continue waits for the answers; a language
//     written in Latin letters isn't asked about a script;
//   · the answers are saved, and decide Home's first card:
//       can't read the script  → lesson 1 (with romanisation), and the letters
//                                course offered on the same card;
//       understands it         → Find your level, with "the very beginning"
//                                a tap away (and choosing it is remembered);
//       reads a little         → the reading test, with lesson 1 a tap away;
//   · the tour is three cards; the draft-policy note has no developer notes.
//   HOME
//   · after the daily goal, the button over a reading test says so — not
//     "Keep going";
//   · after lesson 1, "What you can already say" lists nothing; a stop is
//     listed once its words come from memory and its conversation is done.
//   AI OFF
//   · the message reader says the AI isn't set up BEFORE asking for consent.
//   YOUR DATA
//   · export → a different learner on the device → restore from the file:
//     the device holds exactly the exported learner again;
//   · a file that isn't a backup is refused and storage is untouched.
//   LESSONS
//   · Enter presses the teach-only buttons ("Got it", "Next →", "Start
//     practice"); a highlighted word in Urdu is a whole word.
//   KEEP IT SAFE
//   · iPhone Safari after a lesson: the Home Screen note, once; never on a
//     desktop browser.
// =============================================================================

import { chromium, devices } from "playwright";
import { readFileSync } from "node:fs";
import { loadPack } from "./lib/inventory.mjs";
import { loadCourse } from "../src/engine/guided.js";

const BASE = process.env.BASE || "http://localhost:4173";
const SP = process.env.OUT_DIR || "/tmp";
const DAY = 86400000;
const problems = [];
const fail = (m) => { console.log("    ✗ " + m); problems.push(m); };
const ok = (m) => console.log("    ✓ " + m);
const expect = (cond, good, bad) => (cond ? ok(good) : fail(bad));

const consent = { terms: true, ageConfirmed: 13, at: 1, policyVersion: "2026-08-06" };
const appSeed = (code, extra = {}) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35, totalXp: 0, streak: 0,
  soundEffects: false, sessionSize: 8, consent, themeSettled: true, theme: "ink", ...extra,
});

const urPack = loadPack("ur");
const urCourse = await loadCourse(urPack);
const l1 = urCourse.modules[0].lessons[0];
const firstStop = urCourse.modules[0].exchanges?.[0] || null;

async function open(browser, { app, progress = null, course = null, stack = null, ctxOpts = {}, routeApi = true }) {
  const ctx = await browser.newContext({ viewport: { width: 414, height: 860 }, ...ctxOpts });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  if (routeApi) await page.route("**/api/**", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(([a, p, k, s]) => {
    localStorage.clear();
    if (a) localStorage.setItem("lingua:app", a);
    if (p) localStorage.setItem("lingua:progress", p);
    if (k) localStorage.setItem("lingua:course", k);
    if (s) sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: JSON.parse(s), index: 0 }));
  }, [app && JSON.stringify(app), progress && JSON.stringify(progress), course && JSON.stringify(course), stack && JSON.stringify(stack)]);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1800);
  if (stack && stack.length > 1) {
    await page.evaluate(() => { history.pushState({ linguaIndex: 1 }, ""); history.pushState({ linguaIndex: 99 }, ""); history.back(); });
    await page.waitForTimeout(1600);
  }
  return { ctx, page, errors };
}
const heroText = (page) => page.locator(".hero-premium").first().innerText().then((t) => t.replace(/\s+/g, " ")).catch(() => "");
const heroBtn = (page) => page.locator(".hero-premium [data-testid=hero-go]").first().innerText().then((t) => t.trim()).catch(() => "");
const sideways = (page) => page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

// ---------------------------------------------------------------------------
console.log("\n=== sign-up asks where to start ===");
{
  const { ctx, page, errors } = await open(browser, { app: null });
  await page.locator("button", { hasText: "Get started" }).click();
  await page.waitForTimeout(400);
  const firstLang = await page.evaluate(() => {
    const names = ["Urdu", "Punjabi", "Hindi", "Vietnamese", "Yoruba", "Spanish", "French"];
    const b = [...document.querySelectorAll("button")].find((x) => names.some((n) => (x.innerText || "").includes(n)));
    return b ? b.innerText.replace(/\s+/g, " ").trim() : "";
  });
  expect(/Urdu/.test(firstLang), "Urdu is the first language offered", `the first language offered is "${firstLang.slice(0, 40)}"`);
  const cont = page.locator("button", { hasText: /^Continue$/ });
  await page.locator("button").filter({ hasText: "Spanish" }).first().click();
  await page.waitForTimeout(200);
  expect((await page.locator("[data-testid=start-questions]").count()) === 1, "picking a language asks where to start", "no where-to-start questions after picking a language");
  expect((await page.locator("[data-testid=reads-no]").count()) === 0, "Spanish (Latin letters) isn't asked about a script", "Spanish is asked whether they can read its script");
  expect(await cont.isDisabled(), "Continue waits for the answer", "Continue is enabled before the question is answered");
  await page.locator("button").filter({ hasText: "Urdu" }).first().click();
  await page.waitForTimeout(200);
  await page.locator("[data-testid=hears-none]").click();
  expect(await cont.isDisabled(), "for Urdu, Continue also waits for the script answer", "Continue enabled for Urdu without the script answer");
  await page.locator("[data-testid=reads-no]").click();
  expect(await page.locator("[data-testid=reads-no]").getAttribute("aria-pressed") === "true", "the chosen answer is marked as chosen", "the chosen answer isn't aria-pressed");
  // Keyboard: the choice buttons keep focus through a re-render.
  await page.locator("[data-testid=hears-some]").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
  expect(focused === "hears-some", "a choice made from the keyboard keeps focus", `focus moved to "${focused}" after choosing from the keyboard`);
  await page.locator("[data-testid=hears-none]").click();
  await cont.click();
  await page.waitForTimeout(400);
  await page.locator("button", { hasText: /^Continue$/ }).click();
  await page.waitForTimeout(400);
  const warn = await page.locator(".legal-warn").innerText().catch(() => "");
  if (warn) expect(!/COMPLIANCE|Development build|\.js\b/.test(warn), "the draft-policy note has no developer notes", `the policy note shows developer notes: "${warn.slice(0, 80)}"`);
  await page.locator(".ai-check input").nth(0).check();
  await page.locator(".ai-check input").nth(1).check();
  await page.locator("button", { hasText: "Start learning" }).click();
  await page.waitForTimeout(1200);
  let cards = 0;
  for (let i = 0; i < 8 && !(await page.locator(".hero-premium").count()); i++) {
    const b = page.locator("button", { hasText: /^(Next|Start learning)/ }).first();
    if (!(await b.count())) break;
    await b.click(); cards++;
    await page.waitForTimeout(450);
  }
  expect(cards === 3, "the tour is three cards", `the tour took ${cards} cards`);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
  expect(saved.startingPoint?.ur?.hears === "none" && saved.startingPoint?.ur?.reads === "no",
    "the answers are saved", `startingPoint saved as ${JSON.stringify(saved.startingPoint)}`);
  await page.waitForTimeout(1200);
  const h = await heroText(page);
  expect(!/Can you read/i.test(h) && /Module 1|Start here/i.test(h), "can't read the script → Home starts with lesson 1", `can't read the script, and Home's first card is "${h.slice(0, 90)}"`);
  expect(/learn to read the Urdu script first/i.test(h), "…and offers the letters on the same card", `no way to the letters on the first card: "${h.slice(0, 120)}"`);
  expect(await sideways(page) <= 0, "nothing scrolls sideways", `Home scrolls sideways by ${await sideways(page)}px`);
  // The audit: the first lesson was two screens down. Its button must be on
  // the first screen of a phone, without scrolling.
  const btnBottom = await page.locator(".hero-premium [data-testid=hero-go]").first().evaluate((b) => b.getBoundingClientRect().bottom).catch(() => 9999);
  expect(btnBottom <= 860, `the first lesson's button is on the first screen (${Math.round(btnBottom)}px of 860)`, `the first lesson's button is ${Math.round(btnBottom)}px down, below an 860px phone screen`);
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

for (const [label, start, want, btn, alt] of [
  ["understands it when heard", { hears: "some", reads: "yes" }, /Find where to start in Urdu/, /^Find my level/, /start at the very beginning/],
  ["reads a little", { hears: "none", reads: "little" }, /Can you read Urdu/, /^Take the reading test/, /start the first lesson now/],
]) {
  console.log(`\n=== first card: ${label} ===`);
  const { ctx, page, errors } = await open(browser, { app: appSeed("ur", { startingPoint: { ur: start } }) });
  const h = await heroText(page);
  expect(want.test(h), `Home offers "${want.source.replace(/\\/g, "")}"`, `Home's first card is "${h.slice(0, 90)}"`);
  const b = await heroBtn(page);
  expect(btn.test(b), `its button says "${b}"`, `its button says "${b}"`);
  expect(alt.test(h), "lesson 1 is one tap away on the same card", `no way to lesson 1 on the card: "${h.slice(0, 140)}"`);
  if (label.startsWith("understands")) {
    await page.locator(".hero-premium .quiet-link", { hasText: /very beginning/ }).click();
    await page.waitForTimeout(1500);
    expect(await page.locator(".lesson-screen, [data-testid=lesson], #main").count() > 0 && !(await page.locator(".hero-premium").count()),
      "\"the very beginning\" opens a lesson", "\"the very beginning\" didn't leave Home");
    const s = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
    expect(!!s.placementDone?.ur, "…and is remembered", `placementDone is ${JSON.stringify(s.placementDone)}`);
    await page.evaluate(() => sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: [{ screen: "home" }], index: 0 })));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1800);
    const again = await heroText(page);
    expect(!/Find where to start/.test(again), "Find your level isn't pushed again", `Home offers Find your level again: "${again.slice(0, 80)}"`);
  }
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== Home after the daily goal ===");
{
  const now = Date.now();
  const { ctx, page, errors } = await open(browser, {
    app: appSeed("ur", { lessonsCompleted: { ur: 1 }, sessions: [{ ts: now - 60000, language: "ur", xp: 60, mode: "smart" }], totalXp: 60 }),
  });
  const h = await heroText(page);
  const b = await heroBtn(page);
  expect(/Can you read Urdu/i.test(h), "the reading test is still the first card", `first card: "${h.slice(0, 80)}"`);
  expect(/Chapter 0/i.test(h) && !/Daily goal met/i.test(h), "its eyebrow still names the step", `eyebrow: "${h.slice(0, 60)}"`);
  expect(/^Take the reading test/.test(b), `the button over it says "${b}"`, `the button over a reading test says "${b}"`);
  const ring = await page.locator(".daily-ring-cap").first().innerText().catch(() => "");
  expect(/goal met/i.test(ring), "the ring says the goal is met", `the ring says "${ring}"`);
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== what you can already say ===");
{
  const now = Date.now();
  const met = (recalls) => ({ reps: 2, lapses: 0, stability: 2, difficulty: 5, lastReview: now - 60000, nextReview: now + DAY, lastRating: 3, recalls });
  const app = appSeed("ur", { lessonsCompleted: { ur: 1 }, scriptCourse: { ur: { passed: true } }, startingPoint: { ur: { hears: "none", reads: "yes" } } });
  const unitIds = urPack.vocab.filter((v) => v.unit === urCourse.modules[0].unitId).map((v) => v.id);
  // After lesson 1: its words met, not from memory; no conversation done.
  {
    const { ctx, page } = await open(browser, {
      app, ctxOpts: { viewport: { width: 1280, height: 900 } },
      progress: { ur: Object.fromEntries(l1.items.map((id) => [id, met(0)])) },
      course: { ur: { done: { [l1.id]: now }, results: {}, exchanges: {} } },
    });
    expect((await page.locator("[data-testid=held-empty]").count()) === 1 && (await page.locator("[data-testid=held-list]").count()) === 0,
      "after lesson 1 the list is empty — nothing is claimed", "after lesson 1 a conversation is listed as something you can already say");
    await ctx.close();
  }
  // Words from memory, every lesson done, but the conversation never had:
  // still nothing claimed — "can already say" means having said it.
  {
    const { ctx, page } = await open(browser, {
      app: { ...app, lessonsCompleted: { ur: 4 } }, ctxOpts: { viewport: { width: 1280, height: 900 } },
      progress: { ur: Object.fromEntries(unitIds.map((id) => [id, met(2)])) },
      course: { ur: { done: Object.fromEntries(urCourse.modules[0].lessons.filter((l) => l.kind !== "task").map((l) => [l.id, now])), results: {}, exchanges: {} } },
    });
    expect((await page.locator("[data-testid=held-empty]").count()) === 1,
      "words known but the conversation never practised: still not listed", "a conversation never practised is listed as something you can already say");
    await ctx.close();
  }
  // Words from memory AND the conversation done: listed.
  if (firstStop) {
    const { ctx, page } = await open(browser, {
      app: { ...app, lessonsCompleted: { ur: 4 } }, ctxOpts: { viewport: { width: 1280, height: 900 } },
      progress: { ur: Object.fromEntries(unitIds.map((id) => [id, met(2)])) },
      course: { ur: { done: Object.fromEntries(urCourse.modules[0].lessons.map((l) => [l.id, now])), results: {}, exchanges: { [firstStop.id]: now } } },
    });
    const list = await page.locator("[data-testid=held-list]").innerText().catch(() => "");
    expect(list.length > 0, "a stop is listed once its words come from memory and its conversation is done", "a stop practised and owned is still not listed");
    await ctx.close();
  } else fail("Urdu's first module has no conversation to check");
}

// ---------------------------------------------------------------------------
console.log("\n=== the AI isn't set up ===");
{
  const { ctx, page, errors } = await open(browser, { app: appSeed("ur"), stack: [{ screen: "home" }, { screen: "decode" }] });
  await page.waitForTimeout(800);
  expect((await page.locator("[data-testid=ai-off]").count()) === 1, "the message reader says the AI isn't set up", "the message reader doesn't say the AI is off");
  expect((await page.locator(".ai-check").count()) === 0, "…without asking for consent first", "the message reader asks for AI consent before saying it can't work");
  const t = await page.locator("[data-testid=ai-off]").innerText().catch(() => "");
  expect(!/ANTHROPIC|API key|docs\//i.test(t), "…in plain words", `developer notes on the AI-off screen: "${t.slice(0, 80)}"`);
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== export, then restore ===");
{
  const now = Date.now();
  const learner = appSeed("ur", { lessonsCompleted: { ur: 5 }, streak: 6, totalXp: 340, scriptCourse: { ur: { passed: true } } });
  const progress = { ur: Object.fromEntries(urPack.vocab.slice(0, 9).map((v) => [v.id, { reps: 3, lapses: 0, stability: 4, difficulty: 5, lastReview: now - DAY, nextReview: now + DAY, lastRating: 3, recalls: 1 }])) };
  const { ctx, page, errors } = await open(browser, { app: learner, progress, stack: [{ screen: "home" }, { screen: "settings" }] });
  const before = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("lingua:")).map((k) => [k, localStorage.getItem(k)])));
  const exportBtn = page.locator("button", { hasText: /Export everything/ });
  await exportBtn.scrollIntoViewIfNeeded();
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 8000 }), exportBtn.click()]);
  const file = `${SP}/zaban-verify-audit-${process.pid}.json`;
  await dl.saveAs(file);
  const exported = JSON.parse(readFileSync(file, "utf8"));
  expect(exported.app === "Zaban" && exported.data?.app?.streak === 6, "the export holds the learner", "the export doesn't hold the learner");

  // A bad file first: refused, nothing touched.
  const bad = `${SP}/zaban-not-a-backup-${process.pid}.json`;
  await import("node:fs").then((fs) => fs.writeFileSync(bad, JSON.stringify({ hello: "world" })));
  await page.locator("[data-testid=restore-input]").setInputFiles(bad);
  await page.waitForTimeout(400);
  expect((await page.locator("[data-testid=restore-error]").count()) === 1, "a file that isn't a backup is refused, with a reason", "a file that isn't a backup wasn't refused");
  expect((await page.locator("[data-testid=restore-confirm]").count()) === 0, "…and nothing is offered to restore", "a bad file was offered for restoring");

  // Now the device holds someone else.
  await page.evaluate(() => {
    localStorage.setItem("lingua:app", JSON.stringify({ ...JSON.parse(localStorage.getItem("lingua:app")), streak: 0, totalXp: 5, lessonsCompleted: { ur: 0 } }));
    localStorage.removeItem("lingua:progress");
    localStorage.setItem("lingua:stray", JSON.stringify({ from: "another history" }));
  });
  await page.locator("[data-testid=restore-input]").setInputFiles(file);
  await page.waitForTimeout(400);
  const confirm = await page.locator("[data-testid=restore-confirm]").innerText().catch(() => "");
  expect(/Urdu \(9 words\)/.test(confirm) && /6-day streak/.test(confirm), "the backup is described before anything is written", `the restore card says "${confirm.replace(/\s+/g, " ").slice(0, 120)}"`);
  expect(/replaces/i.test(confirm), "…and says it replaces what's here", "the restore card doesn't say it replaces the device's data");
  await page.locator("[data-testid=restore-go]").click();
  await page.waitForLoadState("load");
  await page.waitForTimeout(2000);
  const after = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("lingua:")).map((k) => [k, localStorage.getItem(k)])));
  const appAfter = JSON.parse(after["lingua:app"] || "{}");
  expect(appAfter.streak === 6 && appAfter.lessonsCompleted?.ur === 5, "after restoring, the learner is back", `after restoring: streak ${appAfter.streak}, lessons ${JSON.stringify(appAfter.lessonsCompleted)}`);
  expect(after["lingua:progress"] === before["lingua:progress"], "…with every word's progress exactly as exported", "word progress differs after the restore");
  expect(!("lingua:stray" in after), "…and nothing left over from the other history", "a key the backup didn't hold survived the restore");
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== Enter, and whole-word highlights (Urdu lesson 1) ===");
{
  const { ctx, page, errors } = await open(browser, {
    app: appSeed("ur", { scriptCourse: { ur: { passed: true } } }),
    stack: [{ screen: "home" }, { screen: "lesson", params: { mode: "guided", filter: { lesson: l1.id } } }],
  });
  const TEACH = /^(Got it( →| — continue →)?|Next →|Start|Start practice|I'm ready)$/;
  let pressed = 0, stuck = null, marks = 0, badMark = null;
  for (let step = 0; step < 80 && pressed < 12; step++) {
    // A word card: turn it over, which is where its example sentence is.
    if (await page.locator(".card-turn[aria-pressed=false]").count()) {
      await page.locator(".card-turn").first().click();
      await page.waitForTimeout(350);
    }
    const st = await page.evaluate((re) => {
      const R = new RegExp(re);
      const root = document.getElementById("main");
      if (!root) return null;
      const teach = [...root.querySelectorAll("button")].find((b) => !b.disabled && R.test((b.innerText || "").trim()));
      const m = [...root.querySelectorAll(".in-context-mark")].map((x) => {
        const whole = x.parentElement?.textContent || "";
        const at = whole.indexOf(x.textContent);
        return { word: x.textContent, before: whole[at - 1] || "", after: whole[at + x.textContent.length] || "" };
      });
      return { teach: teach ? teach.innerText.trim() : null, text: root.innerText.slice(0, 600), marks: m, done: /Lesson complete|Session complete|Results|You finished/i.test(root.innerText) };
    }, TEACH.source);
    if (!st || st.done) break;
    for (const m of st.marks) {
      marks++;
      const edge = /[\s.,!?;:،؛؟۔"“”()—–-]|^$/;
      if (!edge.test(m.before) || !edge.test(m.after)) badMark = badMark || m;
    }
    if (st.teach) {
      await page.evaluate(() => document.activeElement?.blur?.());
      await page.keyboard.press("Enter");
      await page.waitForTimeout(550);
      const now = await page.evaluate(() => (document.getElementById("main")?.innerText || "").slice(0, 600));
      if (now === st.text) { stuck = st.teach; break; }
      pressed++;
      continue;
    }
    // Anything else: answer it however the screen allows, by mouse.
    const acted = await page.evaluate(() => {
      const root = document.getElementById("main");
      const opt = root.querySelector(".opt-btn:not([disabled])");
      if (opt) { opt.click(); return "opt"; }
      const inp = root.querySelector("input[type=text], textarea");
      if (inp) { const set = Object.getOwnPropertyDescriptor(inp.constructor.prototype, "value").set; set.call(inp, "a"); inp.dispatchEvent(new Event("input", { bubbles: true })); return "typed"; }
      const tile = root.querySelector(".word-tile:not([disabled]), .tile:not([disabled])");
      if (tile) { tile.click(); return "tile"; }
      const any = [...root.querySelectorAll("button")].find((b) => !b.disabled && /^(Check|Continue|Skip|I can't listen now|Can't speak now|Finish)/.test((b.innerText || "").trim()));
      if (any) { any.click(); return "button"; }
      return null;
    });
    await page.waitForTimeout(acted ? 450 : 700);
    if (acted === "opt" || acted === "typed" || acted === "tile") {
      await page.evaluate(() => {
        const b = [...document.getElementById("main").querySelectorAll("button")].find((x) => !x.disabled && /^(Check|Continue)$/.test((x.innerText || "").trim()));
        b?.click();
      });
      await page.waitForTimeout(500);
    }
  }
  expect(!stuck, `Enter pressed ${pressed} teach-only button${pressed === 1 ? "" : "s"}`, `Enter did nothing on "${stuck}"`);
  expect(pressed >= 1, "at least one was pressed from the keyboard", "no teach-only button was reached");
  if (marks) expect(!badMark, `${marks} highlighted word${marks === 1 ? "" : "s"}, each a whole word`, `a highlight cuts a word: "${badMark?.before}|${badMark?.word}|${badMark?.after}"`);
  else console.log("    · no example sentence came up in this run (the function is covered by test-audit)");
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== keep it safe ===");
{
  const app = appSeed("ur", { lessonsCompleted: { ur: 1 }, scriptCourse: { ur: { passed: true } } });
  const { ctx, page, errors } = await open(browser, { app, ctxOpts: { ...devices["iPhone 13"] } });
  const note = await page.locator("[data-testid=keep-safe]").innerText().catch(() => "");
  expect(/iPhone/.test(note) && /Add to Home Screen/.test(note), "iPhone Safari after a lesson: the Home Screen note", `no Home Screen note on iPhone Safari (got "${note.slice(0, 60)}")`);
  await page.locator("[data-testid=keep-safe] button", { hasText: "OK" }).click().catch(() => {});
  await page.waitForTimeout(400);
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
  expect(s.keepSafeDismissed === true && (await page.locator("[data-testid=keep-safe]").count()) === 0, "…said once: OK dismisses it for good", "dismissing the note didn't stick");
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();

  const d = await open(browser, { app });
  expect((await d.page.locator("[data-testid=keep-safe]").count()) === 0, "never on a desktop browser", "the iPhone note shows on a desktop browser");
  const fresh = await open(browser, { app: appSeed("ur"), ctxOpts: { ...devices["iPhone 13"] } });
  expect((await fresh.page.locator("[data-testid=keep-safe]").count()) === 0, "never before there is progress to lose", "the iPhone note shows before any lesson");
  await d.ctx.close(); await fresh.ctx.close();
}

await browser.close();
console.log(problems.length ? `\nverify-audit: ${problems.length} problem(s)` : "\nverify-audit: all pass");
process.exit(problems.length ? 1 : 0);
