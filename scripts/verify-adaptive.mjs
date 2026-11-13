// =============================================================================
// verify-adaptive.mjs (v117) — the course responds to the learner, in a real
// browser (adapt.js, Placement.jsx, the course panel, the lesson screen).
//
//   SECOND PASS (es, ur)
//   · a structured lesson answered badly ends with the second-pass offer;
//   · a learner whose last lesson went badly finds it as Home's one next
//     action; it opens on the words again, then finding, then writing; its
//     results lead to the next lesson; afterwards Home has moved on;
//   · declining it from Home goes straight to the next lesson, and it is
//     recorded as declined (not offered again).
//   SKILL DRILLS (es, ur)
//   · a skill row on Home's course panel is a button; the writing drill is
//     only from-memory questions, on words the learner has met.
//   FIND YOUR LEVEL (es, ur at 320px)
//   · reached from the first lesson's card; answered from the pack (never the
//     page), passing Chapter 1 opens it and moves the course's next lesson
//     past it; a beginner who misses two is told to start at Chapter 1 after
//     just two questions; RTL prompts run right to left, nothing scrolls
//     sideways.
//   KEYBOARD
//   · 1 chooses the first option, Enter checks and Enter continues; a digit
//     typed into an answer box stays in the box.
// =============================================================================

import { chromium } from "playwright";
import { loadPack } from "./lib/inventory.mjs";
import { loadCourse } from "../src/engine/guided.js";
import { OBJECTIVE } from "../src/engine/curriculum.js";
import { chapterVocabIds, UNITS_PER_CHAPTER } from "../src/data/chapters.js";
import { LANGUAGES } from "../src/data/registry.js";

const BASE = process.env.BASE || "http://localhost:4173";
const DAY = 86400000;
const problems = [];
const fail = (m) => { console.log("    ✗ " + m); problems.push(m); };
const ok = (m) => console.log("    ✓ " + m);

const appSeed = (code, extra = {}) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35, totalXp: 60, streak: 1,
  soundEffects: false, sessionSize: 8, lessonsCompleted: { [code]: 1 }, scriptCourse: { [code]: { passed: true } },
  consent: { terms: true, ageConfirmed: 13, at: 1, policyVersion: "2026-08-06" }, themeSettled: true, theme: "ink",
  ...extra,
});
const metCard = (now) => ({ reps: 1, lapses: 0, stability: 1, difficulty: 5, lastReview: now - 60000, nextReview: now + DAY, lastRating: 3, recalls: 0 });

async function open(browser, code, { app, progress = null, course = null, stack = null, width = 414 }) {
  const ctx = await browser.newContext({ viewport: { width, height: 860 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(([c, a, p, k, s]) => {
    localStorage.clear();
    localStorage.setItem("lingua:app", a);
    if (p) localStorage.setItem("lingua:progress", JSON.stringify({ [c]: JSON.parse(p) }));
    if (k) localStorage.setItem("lingua:course", JSON.stringify({ [c]: JSON.parse(k) }));
    if (s) sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: JSON.parse(s), index: 0 }));
  }, [code, JSON.stringify(app), progress && JSON.stringify(progress), course && JSON.stringify(course), stack && JSON.stringify(stack)]);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1800);
  if (stack && stack.length > 1) {
    await page.evaluate(() => { history.pushState({ linguaIndex: 1 }, ""); history.pushState({ linguaIndex: 99 }, ""); history.back(); });
    await page.waitForTimeout(1600);
  }
  return { ctx, page, errors };
}

const hero = (page) => page.locator(".hero-premium").innerText().then((t) => t.replace(/\s+/g, " ")).catch(() => "");
const sideways = (page) => page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
const saved = (page, key, code) => page.evaluate(([k, c]) => (JSON.parse(localStorage.getItem(`lingua:${k}`) || "{}")[c]) || null, [key, code]);

// Play a lesson to its results, answering wrongly where it can (an empty-ish guess).
async function playToResults(page, steps = 160) {
  for (let i = 0; i < steps; i++) {
    if (await page.locator("[data-testid=lesson-results]").count()) return true;
    const tiles = page.locator("[data-bank] button, .bank-tile");
    for (let k = 0, n = await tiles.count(); k < n; k++) { const t = tiles.nth(k); if (await t.isEnabled().catch(() => false)) await t.click({ timeout: 800 }).catch(() => {}); }
    for (const link of ["or type it", "or type it instead"]) {
      const b = page.locator(`#main button:has-text("${link}")`).first();
      if (await b.count() && await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); break; }
    }
    const input = page.locator("#main input:visible");
    if (await input.count()) await input.first().fill("qqqq").catch(() => {});
    await page.evaluate(() => {
      const SKIP = /^(check|continue|next|skip|got it|hear|listen|play|back|close|try again|say it again|or type|✕|report|←|previous|leave|finish|hint|a bit more|that's all|show me|all the words)/i;
      const bs = [...document.querySelectorAll("#main button")].filter((b) => { if (b.disabled || b.closest(".bottom-nav, .side-rail")) return false; const t = (b.innerText || "").trim(); const r = b.getBoundingClientRect(); return r.width >= 20 && t && !SKIP.test(t) && !/Skip this one/i.test(t); });
      bs.slice(0, 8).forEach((b) => b.click());
    });
    for (const label of ["Check", "Continue", "Finish", "Next", "Got it", "Start practice", "I'm ready", "Start", "skip this one"]) {
      const b = page.locator(`#main button:has-text("${label}")`).first();
      if (await b.count() && await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) { await b.click({ timeout: 1500 }).catch(() => {}); break; }
    }
    await page.waitForTimeout(260);
  }
  return !!(await page.locator("[data-testid=lesson-results]").count());
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

for (const code of (process.env.ONLY || "es,ur").split(",")) {
  const lang = LANGUAGES[code];
  const pack = loadPack(code);
  const course = await loadCourse(pack);
  const l1 = course.modules[0].lessons.find((l) => l.kind !== "task");
  const after1 = course.modules[0].lessons[course.modules[0].lessons.indexOf(l1) + 1] || course.modules[1].lessons[0];
  const recall = l1.objectives.find((o) => o.type === OBJECTIVE.RECALL);
  console.log(`\n=== ${code} (${lang.name}) ===`);

  // ---- 1. A lesson answered badly ends with the second-pass offer.
  {
    const { ctx, page, errors } = await open(browser, code, {
      app: appSeed(code, { lessonsCompleted: { [code]: 0 } }),
      stack: [{ screen: "home" }, { screen: "lesson", params: { mode: "guided", filter: { lesson: l1.id } } }],
    });
    if (!(await playToResults(page))) fail(`${code}: the lesson never reached its results`);
    else {
      const offer = await page.locator("[data-testid=guided-second]").innerText().catch(() => "");
      if (!offer) fail(`${code}: a lesson answered wrongly has no second-pass offer on its results`);
      else if (!/didn't come from memory/.test(offer)) fail(`${code}: the offer doesn't say why: ${offer.slice(0, 100)}`);
      else ok(`a badly answered lesson ends with “${offer.split("\n").pop()}”`);
      const skip = await page.locator("[data-testid=guided-next]").innerText().catch(() => "");
      if (skip && !/^Skip to the next lesson/.test(skip)) fail(`${code}: with a second pass offered, the next-lesson button should say it skips: ${skip}`);
    }
    if (errors.length) fail(`${code}: page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }

  // ---- 2. Home offers the second pass; it runs look → find → write; then Home moves on.
  const now = Date.now();
  const badState = { done: { [l1.id]: now - 120000 }, results: { [l1.id]: { ts: now - 120000, objectives: { [recall.id]: { status: "not-yet", right: 0, of: l1.items.length } } } }, exchanges: {}, second: {} };
  const badProgress = Object.fromEntries(l1.items.map((id) => [id, metCard(now)]));
  {
    const { ctx, page, errors } = await open(browser, code, { app: appSeed(code), progress: badProgress, course: badState });
    const h = await hero(page);
    if (!/second pass/i.test(h)) fail(`${code}: Home's next action isn't the second pass — "${h.slice(0, 120)}"`);
    else {
      ok(`Home's next action: “${h.slice(0, 80)}…”`);
      await page.locator(".hero-premium .btn-premium").click();
      await page.waitForTimeout(1500);
      const first = await page.evaluate(() => document.querySelector("#main")?.innerText || "");
      if (!/LOOK AGAIN|Look again/.test(first)) fail(`${code}: the second pass doesn't open on the words again — "${first.slice(0, 100)}"`);
      // Walk it: note the order of question kinds.
      const kinds = [];
      for (let i = 0; i < 120; i++) {
        if (await page.locator("[data-testid=lesson-results]").count()) break;
        const k = await page.evaluate(() => (document.querySelector("[data-testid=recall]") ? "write" : document.querySelector(".opt-btn") ? "find" : "other"));
        if (kinds[kinds.length - 1] !== k) kinds.push(k);
        if (k === "write") await page.locator("#main input").first().fill("qqqq").catch(() => {});
        if (k === "find") await page.locator(".opt-btn").first().click().catch(() => {});
        for (const label of ["Start practice", "Check", "Continue", "Finish", "Next"]) {
          const b = page.locator(`#main button:has-text("${label}")`).first();
          if (await b.count() && await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) { await b.click({ timeout: 1500 }).catch(() => {}); break; }
        }
        await page.waitForTimeout(220);
      }
      const order = kinds.filter((k) => k !== "other").join(" → ");
      if (order !== "find → write") fail(`${code}: second pass order is ${order}, expected find → write`);
      const done = await page.locator("[data-testid=second-done]").innerText().catch(() => "");
      if (!done) fail(`${code}: no second-pass summary on the results`);
      else if (!(await page.locator("[data-testid=second-next]").count())) fail(`${code}: the second pass doesn't lead on to the next lesson`);
      else ok(`second pass: look again → ${order}; results lead on to the next lesson`);
      const st = await saved(page, "course", code);
      if (!st?.second?.[l1.id] || st.second[l1.id].declined) fail(`${code}: the finished second pass wasn't recorded: ${JSON.stringify(st?.second)}`);
      await page.evaluate(() => sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: [{ screen: "home" }], index: 0 })));
      await page.reload(); await page.waitForTimeout(1800);
      const h2 = await hero(page);
      if (/second pass/i.test(h2)) fail(`${code}: Home still offers the second pass after it was done`);
      else ok("afterwards Home has moved on");
    }
    if (errors.length) fail(`${code}: page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }

  // ---- 3. Declining from Home: straight to the next lesson, recorded.
  {
    const { ctx, page, errors } = await open(browser, code, { app: appSeed(code), progress: badProgress, course: badState });
    const alt = page.locator(".hero-premium .quiet-link", { hasText: /or go on to the next lesson|or leave these for review/ });
    if (!(await alt.count())) fail(`${code}: the second pass can't be declined from Home`);
    else {
      await alt.first().click();
      await page.waitForTimeout(1600);
      const inLesson = await page.locator('button[aria-label="Leave the lesson"]').count();
      const st = await saved(page, "course", code);
      if (!st?.second?.[l1.id]?.declined) fail(`${code}: declining wasn't recorded: ${JSON.stringify(st?.second)}`);
      else if (!inLesson) fail(`${code}: declining didn't open the next lesson`);
      else ok(`declining opens the next lesson (${after1.title}) and is remembered`);
    }
    if (errors.length) fail(`${code}: page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }

  // ---- 4. A skill row is a button; the writing drill is only writing, only met words.
  {
    const learned = pack.vocab.slice(0, 30);
    const progress = Object.fromEntries(learned.map((v, i) => [v.id, { ...metCard(now), reps: 2, stability: 1 + (i % 4), recalls: 1, lastReview: now - (2 + (i % 5)) * DAY }]));
    const { ctx, page, errors } = await open(browser, code, { app: appSeed(code, { lessonsCompleted: { [code]: 4 } }), progress, course: { done: Object.fromEntries(course.modules[0].lessons.map((l) => [l.id, now - DAY])), results: {}, exchanges: {}, second: {} } });
    await page.locator("[data-testid=course-panel]").scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(600);
    const btn = page.locator("[data-testid=practise-writing]");
    if (!(await btn.count())) fail(`${code}: the Writing skill on Home isn't a button`);
    else {
      await btn.click();
      await page.waitForTimeout(1600);
      const seen = [];
      for (let i = 0; i < 4; i++) {
        const recallBox = await page.locator("[data-testid=recall]").count();
        const meaning = await page.evaluate(() => document.querySelector(".recall-meaning")?.textContent?.replace(/^“|”$/g, "") || "");
        seen.push(recallBox ? meaning : "(not a from-memory question)");
        if (!recallBox) break;
        await page.locator("#main input").first().fill("qqqq");
        await page.locator('#main button:has-text("Check")').first().click();
        await page.waitForTimeout(400);
        await page.locator('#main button:has-text("Continue")').first().click().catch(() => {});
        await page.waitForTimeout(400);
      }
      const known = new Set(learned.map((v) => v.translation));
      if (seen.some((m) => m.startsWith("("))) fail(`${code}: the writing drill asked something else: ${seen.join(" | ")}`);
      else if (seen.some((m) => !known.has(m))) fail(`${code}: the writing drill asked a word the learner hasn't met: ${seen.join(" | ")}`);
      else ok(`Writing on Home opens a writing drill on met words: ${seen.slice(0, 3).join(", ")}…`);
    }
    if (errors.length) fail(`${code}: page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }

  // ---- 5. Find your level: pass Chapter 1 (answers from the pack), stop, and the course has moved on.
  {
    const width = code === "ur" ? 320 : 414;
    const { ctx, page, errors } = await open(browser, code, { app: appSeed(code, { lessonsCompleted: { [code]: 0 } }), width });
    const link = page.locator(".hero-premium .quiet-link", { hasText: "Find your level" });
    if (!(await link.count())) fail(`${code}: a new learner's first lesson card has no way to find their level`);
    else {
      await link.click();
      await page.waitForTimeout(1200);
      await page.locator("[data-testid=placement-start]").click();
      await page.waitForTimeout(500);
      const ch1 = new Set(chapterVocabIds(pack.vocab, 1));
      const words = pack.vocab.filter((v) => ch1.has(v.id));
      let asked = 0, dirOk = true;
      for (let i = 0; i < 14; i++) {
        if (!(await page.locator("[data-testid=placement-question]").count())) break;
        const q = await page.evaluate(() => {
          const card = document.querySelector("[data-testid=placement-question]");
          const ask = card.querySelector(".prompt-ask");
          return { dir: card.dataset.dir, prompt: ask.textContent, askDir: ask.getAttribute("dir"), options: [...document.querySelectorAll(".skip-option .skip-option-main")].map((x) => x.textContent) };
        });
        if (code === "ur" && q.dir === "meaning" && q.askDir !== "rtl") dirOk = false;
        const answers = q.dir === "meaning"
          ? words.filter((v) => v.lemma === q.prompt).map((v) => v.translation)
          : words.filter((v) => v.translation === q.prompt).map((v) => v.lemma);
        const pick = q.options.findIndex((o) => answers.includes(o));
        if (pick < 0) { fail(`${code}: couldn't find the answer to “${q.prompt}” among ${q.options.join(" | ")}`); break; }
        await page.locator(".skip-option").nth(pick).click();
        asked++;
        await page.waitForTimeout(900);
        if (await sideways(page) > 0) fail(`${code}: placement scrolls sideways at ${width}px`);
      }
      const between = await page.locator("[data-testid=placement-between]").count();
      if (!between) fail(`${code}: answering every question right didn't pass Chapter 1 (${asked} asked)`);
      else {
        if (!dirOk) fail(`${code}: a ${lang.name} prompt isn't drawn right to left`);
        await page.locator("[data-testid=placement-between] .btn-quiet").click();
        await page.waitForTimeout(600);
        const res = await page.evaluate(() => { const r = document.querySelector("[data-testid=placement-result]"); return r ? { passed: r.dataset.passed, start: r.dataset.start } : null; });
        const app = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
        const st = await saved(page, "course", code);
        if (!res || res.passed !== "1" || res.start !== "2") fail(`${code}: placement result ${JSON.stringify(res)}, expected 1 passed, start at 2`);
        else if (!(app.chaptersPassed?.[code] || []).includes(1)) fail(`${code}: Chapter 1 wasn't opened: ${JSON.stringify(app.chaptersPassed)}`);
        else {
          await page.locator("[data-testid=placement-done]").click();
          await page.waitForTimeout(1800);
          const h = await hero(page);
          // The first lesson of Chapter 2's first module. (The card's eyebrow
          // reads "Start here" for a learner's first lesson, not "Module N".)
          const want = course.modules[UNITS_PER_CHAPTER].lessons[0].title;
          if (!h.includes(want)) fail(`${code}: after placement Home's next lesson isn't Chapter 2's first (“${want}”) — "${h.slice(0, 100)}"`);
          else ok(`Find your level: Chapter 1 passed in ${asked} questions, start at Chapter 2; Home now offers “${want}”${code === "ur" ? "; prompts RTL, no sideways scroll at 320px" : ""}`);
          if (st && Object.keys(st.done || {}).length) fail(`${code}: placement recorded lessons as done: ${Object.keys(st.done).join(", ")}`);
        }
      }
    }
    if (errors.length) fail(`${code}: page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }

  // ---- 6. A beginner: two misses settle it, start at Chapter 1.
  {
    const { ctx, page } = await open(browser, code, { app: appSeed(code, { lessonsCompleted: { [code]: 0 } }), stack: [{ screen: "home" }, { screen: "placement" }] });
    await page.locator("[data-testid=placement-start]").click();
    await page.waitForTimeout(500);
    const ch1 = new Set(chapterVocabIds(pack.vocab, 1));
    const words = pack.vocab.filter((v) => ch1.has(v.id));
    let asked = 0;
    while (asked < 6 && (await page.locator("[data-testid=placement-question]").count())) {
      const q = await page.evaluate(() => ({ dir: document.querySelector("[data-testid=placement-question]").dataset.dir, prompt: document.querySelector("[data-testid=placement-question] .prompt-ask").textContent, options: [...document.querySelectorAll(".skip-option .skip-option-main")].map((x) => x.textContent) }));
      const right = q.dir === "meaning" ? words.filter((v) => v.lemma === q.prompt).map((v) => v.translation) : words.filter((v) => v.translation === q.prompt).map((v) => v.lemma);
      const wrong = q.options.findIndex((o) => !right.includes(o));
      await page.locator(".skip-option").nth(wrong).click();
      asked++;
      await page.waitForTimeout(900);
    }
    const res = await page.evaluate(() => { const r = document.querySelector("[data-testid=placement-result]"); return r ? { passed: r.dataset.passed, start: r.dataset.start, missed: !!document.querySelector("[data-testid=placement-missed]") } : null; });
    const app = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
    if (!res || res.passed !== "0" || res.start !== "1" || asked !== 2) fail(`${code}: a beginner: ${JSON.stringify(res)} after ${asked} questions — expected start at 1 after 2`);
    else if ((app.chaptersPassed?.[code] || []).length) fail(`${code}: a beginner had chapters opened: ${JSON.stringify(app.chaptersPassed)}`);
    else if (!res.missed) fail(`${code}: the beginner's result doesn't show the words missed`);
    else ok("a beginner is settled after 2 questions, starts at Chapter 1, and sees the words missed");
    await ctx.close();
  }
}

// ---- 7. Keyboard answers (es word drill: its first question is "find the word").
{
  const pack = loadPack("es");
  const now = Date.now();
  const progress = Object.fromEntries(pack.vocab.slice(0, 30).map((v, i) => [v.id, { ...metCard(now), reps: 2, stability: 1 + (i % 4), recalls: 1, lastReview: now - 3 * DAY }]));
  const { ctx, page, errors } = await open(browser, "es", {
    app: appSeed("es"), progress,
    stack: [{ screen: "home" }, { screen: "lesson", params: { mode: "skill", filter: { skill: "vocabulary" } } }],
  });
  await page.mouse.click(5, 300);
  const firstOpt = await page.locator(".opt-btn").count();
  if (!firstOpt) fail("es: the word drill doesn't open on an options question");
  else {
    await page.keyboard.press("1");
    await page.waitForTimeout(200);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    const fb = await page.locator("[data-testid=answer-feedback]").count();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    const moved = !(await page.locator("[data-testid=answer-feedback]").count());
    if (!fb) fail("es: 1 then Enter didn't answer the question");
    else if (!moved) fail("es: Enter after the answer didn't continue");
    else ok("1 chooses, Enter checks, Enter continues");
    // A digit typed into an answer box stays there.
    for (let i = 0; i < 6 && !(await page.locator("#main input").count()); i++) {
      await page.locator(".opt-btn").first().click().catch(() => {});
      await page.locator('#main button:has-text("Check")').first().click().catch(() => {});
      await page.waitForTimeout(300);
      await page.locator('#main button:has-text("Continue")').first().click().catch(() => {});
      await page.waitForTimeout(300);
    }
    const input = page.locator("#main input").first();
    if (await input.count()) {
      await input.click();
      await page.keyboard.type("a1");
      const v = await input.inputValue();
      if (v !== "a1") fail(`es: typing "a1" into the answer box left "${v}"`);
      else ok("digits typed into an answer box stay in the box");
    }
  }
  if (errors.length) fail(`es: page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

await browser.close();
if (problems.length) { console.log(`\n  ✗ ${problems.length} problems\n`); process.exit(1); }
console.log("\n  ✓ second pass, skill drills, find your level and keyboard answers work, left to right and right to left\n");
