// =============================================================================
// verify-practice-structure.mjs (v111) — the organised Practice tab, a
// speaking session, and the end-of-lesson encouragement, in a real browser.
//
//   · Practice shows its sections in order (Speak first), "You've tried 0 of
//     N", untried doors marked, and suggests the speaking session
//   · the suggestion opens a session that is ALL speaking, easy → hard
//     (echo, recall, shadow, build by data-mode), playable with no microphone
//   · its results say how much you spoke and show the speaking level; good
//     attempts earn XP; it doesn't count as a curriculum lesson
//   · back on Practice: 1 of N tried, the door no longer "not tried", a new
//     suggestion, and the visit saved
//   · an ordinary lesson that takes a learner from 9 known words to 10+ says
//     so, and "Now you can say" shows real sentences from the pack
//   · 360px, no sideways scroll, no page errors
//
// PROVEN CAPABLE OF FAILING: with Practice not recording visits it reports
// "after the visit: You've tried 0 of 14"; with the results screen given no
// encouragement it reports the missing speaking summary, milestone and
// "Now you can say".
//
//   (cd dist && python3 -m http.server 4173) &
//   node scripts/verify-practice-structure.mjs
// =============================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { mergeExamples } from "../src/data/extraExamples.js";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CODES = (process.env.ONLY || "ur,es,ja").split(",");
const DAY = 86400000;
const RANK = { echo: 0, recall: 1, shadow: 2, sentence: 3 };
let problems = 0;
const fail = (m) => { console.log("    ✗ " + m); problems++; };
const ok = (m) => console.log("    ✓ " + m);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

function loadPack(code) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  for (const v of pack.vocab) v.examples = mergeExamples(code, v.lemma, v.examples || []);
  return pack;
}

async function setup(code, { known, passes = 4, extra = {} }) {
  const pack = loadPack(code);
  const now = Date.now();
  const progress = {};
  pack.vocab.slice(0, known).forEach((v, i) => {
    progress[v.id] = { difficulty: 5, stability: 2 + (i % 5), reps: 1 + (i % 4), lapses: 0, lastReview: now - 4 * DAY, nextReview: now + 2 * DAY, lastRating: 3 };
  });
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  await ctx.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE);
  await page.evaluate(([c, p, n, ex]) => {
    localStorage.setItem("lingua:app", JSON.stringify({
      onboarded: true, currentLanguage: c, tutorialSeen: true, totalXp: 100, streak: 1, soundEffects: false,
      lessonsCompleted: { [c]: 6 }, scriptCourse: { [c]: { passed: true } }, sessionSize: 6, learningGoal: { [c]: "basics" },
      speaking: { [c]: { passes: n, attempts: n } },
      consent: { terms: true, ageConfirmed: 13, at: 0, policyVersion: "2026-08-06" }, ...ex,
    }));
    localStorage.setItem("lingua:progress", JSON.stringify({ [c]: p }));
  }, [code, progress, passes, extra]);
  await page.reload();
  await page.waitForTimeout(1300);
  return { pack, ctx, page, errors };
}

// Play whatever lesson is on screen to its results, recording speaking modes.
async function playThrough(page, pack) {
  const byMeaning = new Map(pack.vocab.map((v) => [v.translation, v]));
  const modes = [];
  let overflow = 0;
  for (let step = 0; step < 90; step++) {
    const main = await page.evaluate(() => document.querySelector("#main")?.innerText || "");
    overflow = Math.max(overflow, await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth));
    if (/\b\d+ of \d+ right\b|📤 Share|data-testid=enc/i.test(main) || await page.locator("[data-testid=enc-speaking], [data-testid=enc-saynow]").count() || /XP\s*\+\d+/.test(main)) {
      return { modes, overflow, finished: true };
    }
    if (await page.locator("[data-testid=speak-level]").count()) {
      const mode = await page.locator("[data-testid=speak-level]").getAttribute("data-mode");
      modes.push(mode);
      if (mode === "echo" || mode === "shadow") await page.getByRole("button", { name: "I said it" }).click();
      else {
        let text = null;
        if (mode === "sentence") {
          const meaning = (await page.locator("[data-testid=speak-meaning]").innerText()).replace(/[“”]/g, "").trim();
          const hint = await page.locator("[data-testid=speak-hint]").innerText();
          const ex = pack.vocab.filter((v) => hint.includes(v.lemma)).flatMap((v) => v.examples || []).find((e) => e.translation === meaning);
          text = ex && (ex.translit || ex.native);
        } else {
          const m = main.match(/How do you say “([^”]+)”/);
          const w = m && byMeaning.get(m[1]);
          text = w && (w.translit || w.lemma);
        }
        if (!text || !(await page.locator(".type-input").count())) { await page.getByText("skip this one").click(); }
        else {
          await page.locator(".type-input").fill(text);
          await page.locator(".type-submit").click();
          await page.waitForSelector("[data-testid=speak-verdict]", { timeout: 4000 }).catch(() => {});
          await page.getByRole("button", { name: "Continue" }).click();
        }
      }
      await page.waitForTimeout(350);
      continue;
    }
    // Multiple choice: answer from the pack so the lesson is mostly right.
    const opts = page.locator(".opt-btn");
    if (await opts.count() >= 2) {
      const texts = await opts.allInnerTexts();
      const words = pack.vocab;
      let pick = texts.findIndex((t) => words.some((v) => main.includes(v.lemma) && t.includes(v.translation)) || words.some((v) => main.includes(`“${v.translation}”`) && (t.includes(v.lemma) || (v.translit && t.includes(v.translit)))));
      if (pick < 0) pick = 0;
      await opts.nth(pick).click();
      await page.waitForTimeout(120);
      await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /^check/i.test((b.innerText || "").trim()) && !b.disabled)?.click());
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => {
      const bs = [...document.querySelectorAll("button")].filter((b) => !b.disabled);
      const label = (b) => (b.innerText || "").trim();
      (bs.find((b) => /start practice/i.test(label(b))) || bs.find((b) => /^\W*(continue|next|got it|i've got these|done|finish)/i.test(label(b))))?.click();
    });
    await page.waitForTimeout(400);
  }
  return { modes, overflow, finished: false };
}

async function openPractice(page) {
  await page.evaluate(() => sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: [{ screen: "home" }], index: 0 })));
  await page.reload();
  await page.waitForTimeout(1000);
  await page.locator(".bottom-nav button", { hasText: "Practice" }).click();
  await page.waitForTimeout(700);
}

for (const code of CODES) {
  console.log(`\n=== ${code} ===`);
  // ---- Practice tab + speaking session ------------------------------------
  {
    const { pack, ctx, page, errors } = await setup(code, { known: 30, passes: 12 });
    await openPractice(page);
    const sections = await page.evaluate(() => [...document.querySelectorAll(".practice-section")].map((s) => s.dataset.section));
    // "Due today" comes first when something is due; then Speak.
    if (sections.filter((x) => x !== "review")[0] !== "speak") fail(`sections start with ${sections[0]}, not speak: ${sections}`);
    else ok(`sections: ${sections.join(" → ")}`);
    const head = await page.locator("[data-testid=explore-head]").innerText();
    const m0 = head.match(/tried (\d+) of (\d+)/);
    if (!m0 || m0[1] !== "0") fail(`explore head "${head}"`);
    // Before anything's been opened every door is new, so none is marked.
    const notTried = await page.locator(".new-pill").count();
    if (notTried !== 0) fail(`${notTried} doors marked "Not tried yet" before anything's been opened — noise`);
    const next = await page.locator("[data-testid=explore-next]").innerText();
    if (!/Speaking session/.test(next)) fail(`"Try next" is "${next.replace(/\s+/g, " ")}", expected the speaking session`);
    else ok(`“You've tried 0 of ${m0?.[2]}”, no noise, Try next: Speaking session`);

    const xpBefore = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app")).totalXp);
    await page.locator("[data-testid=explore-next]").click();
    await page.waitForTimeout(1500);
    const run = await playThrough(page, pack);
    const ranks = run.modes.map((md) => RANK[md]);
    if (run.modes.length !== 6) fail(`the speaking session had ${run.modes.length} speaking tasks (${run.modes}), expected 6`);
    else if (!ranks.every((v, i) => i === 0 || v >= ranks[i - 1])) fail(`not easy → hard: ${run.modes}`);
    else ok(`speaking session: ${run.modes.join(" → ")}`);
    if (!run.finished) fail("the speaking session never reached its results");
    const spoke = await page.locator("[data-testid=enc-speaking]").innerText().catch(() => "");
    if (!/You spoke 6 times/.test(spoke) || !/Speaking level \d/.test(spoke)) fail(`results don't show the speaking summary: "${spoke}"`);
    else ok(`results: “${spoke.split("\n").slice(1, 2).join(" ").trim()}”`);
    const app = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app")));
    if (!(app.totalXp > xpBefore)) fail(`no XP for a speaking session (${xpBefore} → ${app.totalXp})`);
    if ((app.lessonsCompleted?.[code] || 0) !== 6) fail(`a speaking session counted as a curriculum lesson (${app.lessonsCompleted?.[code]})`);
    if (run.overflow > 1) fail(`scrolls sideways by ${run.overflow}px`);

    await openPractice(page);
    const head2 = await page.locator("[data-testid=explore-head]").innerText();
    const sessionDoorNew = await page.locator('[data-door="speak-session"] .new-pill').count();
    const pills = await page.locator(".new-pill").count();
    const total = Number((head2.match(/of (\d+)/) || [])[1]);
    if (pills !== total - 1) fail(`after one visit ${pills} doors are marked "Not tried yet", expected ${total - 1}`);
    const next2 = await page.locator("[data-testid=explore-next]").innerText().catch(() => "");
    const visited = await page.evaluate((c) => JSON.parse(localStorage.getItem("lingua:app")).doorsVisited?.[c], code);
    if (!/tried 1 of/.test(head2) || sessionDoorNew || /Speaking session/.test(next2) || !visited?.includes("speak-session")) {
      fail(`after the visit: "${head2}", door still new: ${!!sessionDoorNew}, next "${next2.replace(/\s+/g, " ")}", saved ${JSON.stringify(visited)}`);
    } else ok(`after: “${head2.split("\n")[0]}”, new suggestion: ${next2.replace(/\s+/g, " ").replace(/^Try next\s*/i, "").slice(0, 40)}`);
    if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }

  // ---- an ordinary lesson crossing 10 known words --------------------------
  {
    // The harness answers multiple choice; the other question types are
    // switched off with the app's own toggles (what's checked here is the
    // results screen, not the exercises — test-lessons covers those).
    const { pack, ctx, page, errors } = await setup(code, { known: 9, passes: 0, extra: {
      disabledExercises: ["match_pairs", "odd_one_out", "build_sentence", "tap_words", "letter_scramble", "type_translation", "listen_pick", "conjugate", "conjugate_tense", "true_false", "complete_sentence"],
    } });
    await page.evaluate(() => sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: [{ screen: "home" }, { screen: "lesson", params: { mode: "smart" } }], index: 0 })));
    await page.reload();
    await page.waitForTimeout(800);
    await page.evaluate(() => { history.pushState({ linguaIndex: 1 }, ""); history.pushState({ linguaIndex: 99 }, ""); history.back(); });
    await page.waitForTimeout(1500);
    const run = await playThrough(page, pack);
    if (!run.finished) fail("the lesson never reached its results");
    const milestone = await page.locator("[data-testid=enc-milestone]").innerText().catch(() => "");
    if (!/\b10\b/.test(milestone)) fail(`crossing 10 known words wasn't marked: "${milestone}"`);
    else ok(`milestone: “${milestone.replace(/\s+/g, " ").slice(0, 70)}…”`);
    const say = await page.locator("[data-testid=enc-saynow]").innerText().catch(() => "");
    const sentences = pack.vocab.flatMap((v) => v.examples || []).map((e) => e.native);
    if (!say || !sentences.some((s) => say.includes(s))) fail(`no "Now you can say" with a pack sentence: "${say.slice(0, 80)}"`);
    else ok(`“Now you can say”: ${say.split("\n")[1]}`);
    if (run.overflow > 1) fail(`scrolls sideways by ${run.overflow}px`);
    if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }
}

await browser.close();
console.log(`\n  ${CODES.length} languages · ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
