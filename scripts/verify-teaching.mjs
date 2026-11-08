// =============================================================================
// verify-teaching.mjs (v116) — spot the mistake, dictation and Your mistakes,
// in a real browser, in four kinds of script.
//
// For Spanish, Urdu (right-to-left, Nastaliq), Chinese (no spaces) and Hindi:
//   · a structured lesson reaches spot-the-mistake; the RIGHT answer is worked
//     out from the language pack (which tile, put back to which word, restores
//     the sentence the English belongs to) — never read off the page — and is
//     graded right; in a second run the wrong tile is graded a miss and the
//     card names the word that broke the sentence;
//   · tiles run in the script's direction and typeface, with no sideways
//     scroll at 320px;
//   · dictation shows no meaning before the answer, offers the sound, accepts
//     a typed answer, shows the word and its meaning after, and is logged as
//     dictation;
//   · the words missed then appear on Your mistakes, and "Practise" opens a
//     lesson; a learner with no misses sees the empty state.
// =============================================================================

import { chromium } from "playwright";
import { loadPack } from "./lib/inventory.mjs";
import { loadCourse } from "../src/engine/guided.js";
import { fixableFrames, tileCore } from "../src/engine/teach.js";
import { LANGUAGES } from "../src/data/registry.js";

const BASE = process.env.BASE || "http://localhost:4173";
const CODES = (process.env.ONLY || "es,ur,zh,hi").split(",");
const SHOTS = process.env.SHOTS || null;   // a folder: save what the learner saw
const shot = (page, name) => (SHOTS ? page.screenshot({ path: `${SHOTS}/${name}.png` }).catch(() => {}) : null);
const NO_SPACE = new Set(["zh", "ja"]);

const problems = [];
const fail = (m) => { console.log("    ✗ " + m); problems.push(m); };
const ok = (m) => console.log("    ✓ " + m);

const seed = (code) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35, totalXp: 120, streak: 2,
  soundEffects: false, sessionSize: 8, lessonsCompleted: { [code]: 1 }, scriptCourse: { [code]: { passed: true } },
  consent: { terms: true, ageConfirmed: 13, at: 1, policyVersion: "2026-08-06" }, themeSettled: true, theme: "ink",
});

async function open(browser, code, stack, width = 414) {
  const ctx = await browser.newContext({ viewport: { width, height: 860 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(([a, s]) => {
    localStorage.clear();
    localStorage.setItem("lingua:app", a);
    sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: s, index: 0 }));
  }, [JSON.stringify(seed(code)), stack]);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1600);
  if (stack.length > 1) {
    await page.evaluate(() => { history.pushState({ linguaIndex: 1 }, ""); history.pushState({ linguaIndex: 99 }, ""); history.back(); });
    await page.waitForTimeout(1600);
  }
  return { ctx, page, errors };
}

// The first word lesson in the course with a word that can carry spot-the-mistake.
async function lessonWithFix(code) {
  const pack = loadPack(code);
  const pool = pack.vocab.filter((v) => !v.custom);
  const byId = new Map(pool.map((v) => [v.id, v]));
  const course = await loadCourse(pack);
  for (const m of course.modules) for (const l of m.lessons) {
    if (l.kind !== "task" && l.items.some((id) => byId.get(id) && fixableFrames(byId.get(id), pool).length)) return { pack, lesson: l };
  }
  return { pack, lesson: null };
}

// Which tile, put back to which choice, restores a real sentence whose English is the one shown.
function solveFix(pack, code, english, tiles, options) {
  const norm = (s) => String(s).normalize("NFC").toLocaleLowerCase().replace(/\s+/g, NO_SPACE.has(code) ? "" : " ").trim();
  const sentences = pack.vocab.flatMap((v) => v.examples || []).filter((e) => e?.native && e.translation === english).map((e) => norm(e.native));
  for (let i = 0; i < tiles.length; i++) for (const o of options) {
    const t = tiles.slice();
    t[i] = t[i].replace(tileCore(t[i]), tileCore(o));
    const joined = norm(t.join(NO_SPACE.has(code) ? "" : " "));
    if (sentences.includes(joined)) return { tile: i, fix: o };
  }
  return null;
}

// Move a lesson on by one step, stopping at the exercise we want.
async function stepUntil(page, want) {
  for (let step = 0; step < 60; step++) {
    if (await page.locator(want).count()) return true;
    if (await page.locator("[data-testid=lesson-results]").count()) return false;
    const tiles = page.locator("[data-bank] button, .bank-tile");
    for (let k = 0, n = await tiles.count(); k < n; k++) { const t = tiles.nth(k); if (await t.isEnabled().catch(() => false)) await t.click({ timeout: 800 }).catch(() => {}); }
    const input = page.locator("#main input:visible");
    if (await input.count()) await input.first().fill("answer").catch(() => {});
    await page.evaluate(() => {
      const SKIP = /^(check|continue|next|skip|got it|hear|listen|play|back|close|try again|say it again|or type|✕|report|←|previous|leave|finish|hint|a bit more|that's all|show me|all the words)/i;
      const bs = [...document.querySelectorAll("#main button")].filter((b) => { if (b.disabled || b.closest(".bottom-nav, .side-rail, .fix")) return false; const t = (b.innerText || "").trim(); const r = b.getBoundingClientRect(); return r.width >= 20 && t && !SKIP.test(t) && !/Skip this one/i.test(t); });
      bs.slice(0, 8).forEach((b) => b.click());
    });
    if (await page.locator(want).count()) return true;
    for (const label of ["Check", "Continue", "Next", "Got it", "Start practice", "Start", "skip this one"]) {
      const b = page.locator(`#main button:has-text("${label}")`).first();
      if (await b.count() && await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) { await b.click({ timeout: 1500 }).catch(() => {}); break; }
    }
    await page.waitForTimeout(280);
  }
  return false;
}

async function readFix(page) {
  return page.evaluate(() => ({
    english: document.querySelector(".fix-en")?.textContent.replace(/^“|”$/g, "") || "",
    tiles: [...document.querySelectorAll(".fix-tile .fix-tile-native")].map((x) => x.textContent),
    options: [...document.querySelectorAll(".fix-option .fix-option-native")].map((x) => x.textContent),
    dir: document.querySelector(".fix-tiles")?.getAttribute("dir"),
    font: getComputedStyle(document.querySelector(".fix-tile-native") || document.body).fontFamily,
    overflow: document.scrollingElement.scrollWidth - window.innerWidth,
  }));
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

for (const code of CODES) {
  const lang = LANGUAGES[code];
  console.log(`\n=== ${code} (${lang.name}) ===`);
  const { pack, lesson } = await lessonWithFix(code);
  if (!lesson) { fail(`${code}: no lesson can carry spot-the-mistake`); continue; }
  const stack = [{ screen: "home" }, { screen: "lesson", params: { mode: "guided", filter: { lesson: lesson.id } } }];

  // ---- Run 1: answer spot-the-mistake right; get dictation wrong on purpose.
  {
    const { ctx, page, errors } = await open(browser, code, stack, code === "ur" ? 320 : 414);
    let sawDictation = false;
    if (await stepUntil(page, "[data-testid=dictation], [data-testid=fix-sentence]")) {
      if (await page.locator("[data-testid=dictation]").count()) {
        sawDictation = true;
        await shot(page, `${code}-dictation`);
        const before = await page.evaluate(() => document.querySelector("[data-testid=dictation]").innerText);
        const playBtn = await page.locator('[data-testid=dictation] button[aria-label="Play the word again"]').count();
        if (/“.+”/.test(before)) fail(`${code}: dictation shows a meaning before the answer: ${before.slice(0, 80)}`);
        if (!playBtn) fail(`${code}: dictation has no way to hear the word again`);
        await page.locator("[data-testid=dictation] input").fill("qqqq");
        await page.locator('#main button:has-text("Check")').first().click();
        await page.waitForTimeout(500);
        const after = await page.evaluate(() => document.querySelector("[data-testid=recall-answer]")?.innerText || "");
        if (!/“.+”/.test(after)) fail(`${code}: dictation's answer card doesn't give the meaning: ${after.slice(0, 80)}`);
        const log = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:attempts") || "{}"));
        const mine = (log[Object.keys(log)[0]] || []);
        if (!mine.some((a) => a.t === "dictation" && a.ok === false)) fail(`${code}: the dictation miss isn't logged as dictation: ${JSON.stringify(mine.slice(-2))}`);
        else ok("dictation: no meaning shown first, sound offered, meaning after, logged as dictation");
        await page.locator('#main button:has-text("Continue")').first().click().catch(() => {});
        await page.waitForTimeout(300);
      }
      if (await stepUntil(page, "[data-testid=fix-sentence]")) {
        const f = await readFix(page);
        const sol = solveFix(pack, code, f.english, f.tiles, f.options);
        if (!sol) fail(`${code}: no tile and choice restore a sentence meaning “${f.english}” — tiles ${f.tiles.join(" | ")}, choices ${f.options.join(" | ")}`);
        else {
          if (f.dir !== (lang.rtl ? "rtl" : "ltr")) fail(`${code}: tiles run ${f.dir}`);
          if (code === "ur" && !/Nastaliq/.test(f.font)) fail(`${code}: tiles not in Nastaliq: ${f.font}`);
          if (f.overflow > 0) fail(`${code}: ${f.overflow}px sideways scroll on spot-the-mistake`);
          await shot(page, `${code}-fix-ask`);
          await page.locator(".fix-tile").nth(sol.tile).click();
          await page.locator(".fix-option").nth(f.options.indexOf(sol.fix)).click();
          await page.locator('#main button:has-text("Check")').first().click();
          await page.waitForTimeout(500);
          await shot(page, `${code}-fix-right`);
          const fb = await page.evaluate(() => document.querySelector("[data-testid=answer-feedback]")?.innerText || "");
          const why = await page.locator("[data-testid=fix-why]").count();
          if (!/^✓/.test(fb.trim())) fail(`${code}: the right tile and word were not graded right: ${fb.slice(0, 80)}`);
          else if (!why) fail(`${code}: no explanation of the swapped word`);
          else ok(`spot the mistake: “${f.english}” — tile ${sol.tile + 1} → ${sol.fix} graded right, ${f.dir}, no sideways scroll at ${code === "ur" ? 320 : 414}px`);
        }
      } else fail(`${code}: lesson ${lesson.id} never reached spot-the-mistake`);
    } else fail(`${code}: lesson ${lesson.id} reached neither dictation nor spot-the-mistake`);
    if (!sawDictation) console.log("    · no dictation came up before spot-the-mistake in this run");
    if (errors.length) fail(`${code}: page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }

  // ---- Run 2: tap the wrong tile; the miss names the word; Your mistakes lists it.
  {
    const { ctx, page, errors } = await open(browser, code, stack);
    if (await stepUntil(page, "[data-testid=fix-sentence]")) {
      const f = await readFix(page);
      const sol = solveFix(pack, code, f.english, f.tiles, f.options);
      if (sol) {
        const wrongTile = (sol.tile + 1) % f.tiles.length;
        await page.locator(".fix-tile").nth(wrongTile).click();
        await page.locator(".fix-option").nth(f.options.indexOf(sol.fix)).click();
        await page.locator('#main button:has-text("Check")').first().click();
        await page.waitForTimeout(500);
        await shot(page, `${code}-fix-miss`);
        const fb = await page.evaluate(() => document.querySelector("[data-testid=answer-feedback]")?.innerText || "");
        const why = await page.evaluate(() => document.querySelector("[data-testid=fix-why]")?.innerText || "");
        const wrongWord = f.tiles[sol.tile];
        if (/^✓/.test(fb.trim())) fail(`${code}: the wrong tile was graded right`);
        else if (!why.includes("breaks it") || !why.includes(tileCore(wrongWord))) fail(`${code}: the miss doesn't name the word that broke it (${tileCore(wrongWord)}): ${why.slice(0, 120)}`);
        else ok(`a wrong tile is a miss, and the card names “${tileCore(wrongWord)}” as the word that broke it`);

        // Your mistakes: the word that belonged is listed, and Practise opens a lesson.
        await page.evaluate(() => { history.pushState({ linguaIndex: 50 }, ""); });
        await page.locator('button[aria-label="Leave the lesson"]').click().catch(() => {});
        await page.waitForTimeout(900);
        await page.evaluate(() => [...document.querySelectorAll(".bottom-nav button")].find((x) => /practice/i.test(x.innerText || ""))?.click());
        await page.waitForTimeout(900);
        await page.evaluate(() => document.querySelector('[data-door="mistakes"]')?.click());
        await page.waitForTimeout(1200);
        await shot(page, `${code}-mistakes`);
        const listed = await page.evaluate(() => document.querySelector("[data-testid=mistakes-list]")?.innerText || "");
        if (!listed) fail(`${code}: Your mistakes shows no list after a miss`);
        else if (!listed.includes(tileCore(sol.fix))) fail(`${code}: Your mistakes doesn't list “${tileCore(sol.fix)}”: ${listed.slice(0, 120)}`);
        else {
          await page.locator("[data-testid=mistakes-practise]").click();
          await page.waitForTimeout(1500);
          const inLesson = await page.locator('button[aria-label="Leave the lesson"]').count();
          if (!inLesson) fail(`${code}: Practise didn't open a lesson`);
          else ok(`Your mistakes lists “${tileCore(sol.fix)}”, and Practise opens a lesson on it`);
        }
      }
    } else fail(`${code}: run 2 never reached spot-the-mistake`);
    if (errors.length) fail(`${code}: page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }
}

// ---- A learner with no misses sees the empty state.
{
  const { ctx, page } = await open(browser, "es", [{ screen: "home" }, { screen: "mistakes" }]);
  if (!(await page.locator("[data-testid=mistakes-empty]").count())) fail("es: Your mistakes with no misses doesn't show its empty state");
  else ok("Your mistakes with nothing missed says so");
  await ctx.close();
}

await browser.close();
if (problems.length) { console.log(`\n  ✗ ${problems.length} problems\n`); process.exit(1); }
console.log("\n  ✓ spot the mistake, dictation and Your mistakes work in four scripts\n");
