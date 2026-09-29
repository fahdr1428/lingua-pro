// =============================================================================
// verify-speaking.mjs (v110) — the speaking ladder, played in a real lesson.
//
// No microphone (speech recognition removed from the page), which is the path
// a lot of browsers take and the one that must still teach something:
//
//   · level 2 (Shadow): the lesson has an ECHO right after the new words —
//     the word shown with its sound and meaning, "I said it" to go on — and a
//     SHADOW with a real sentence from the pack; RECALL can be typed, and a
//     good one that takes the learner to 12 says "Speaking level 3 · Build"
//   · level 4 (Flow): a SENTENCE task shows only what the sentence means plus
//     the key word; typing the sentence scores "Got it"
//   · the speaking record is saved; the lesson reaches its results screen;
//     nothing scrolls sideways at 360px; no page errors
//
// PROVEN CAPABLE OF FAILING: with weaveSpeaking returning the lesson
// unchanged it reports no echo, no shadowing and no build-a-sentence task;
// without the per-step key on SpeakMoment (the bug this test found — the
// shadow step's state leaked into the recall after it) it reports "no
// microphone, but the recall step offers no way to type it".
//
//   (cd dist && python3 -m http.server 4173) &
//   node scripts/verify-speaking.mjs
// =============================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { mergeExamples } from "../src/data/extraExamples.js";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CODES = (process.env.ONLY || "ur,es,ko").split(",");
const DAY = 86400000;
let problems = 0;
const fail = (m) => { console.log("    ✗ " + m); problems++; };
const ok = (m) => console.log("    ✓ " + m);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

async function playLesson(code, passes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  // The app merges extra example sentences in when it loads a pack; so must we.
  for (const v of pack.vocab) v.examples = mergeExamples(code, v.lemma, v.examples || []);
  const now = Date.now();
  const progress = {};
  pack.vocab.slice(0, 40).forEach((v, i) => {
    progress[v.id] = { difficulty: 5, stability: 3, reps: 1 + (i % 4), lapses: 0, lastReview: now - 4 * DAY, nextReview: now - DAY, lastRating: 3 };
  });
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  await ctx.addInitScript(() => { try { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; } catch {} window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE);
  await page.evaluate(([c, p, n]) => {
    localStorage.setItem("lingua:app", JSON.stringify({
      onboarded: true, currentLanguage: c, tutorialSeen: true, totalXp: 100, streak: 1, soundEffects: false,
      lessonsCompleted: { [c]: 6 }, scriptCourse: { [c]: { passed: true } }, sessionSize: 6,
      speaking: { [c]: { passes: n, attempts: n } },
      disabledExercises: ["match_pairs", "odd_one_out", "build_sentence", "tap_words", "letter_scramble", "type_translation", "listen_pick", "conjugate", "conjugate_tense", "true_false", "complete_sentence"],
      consent: { terms: true, ageConfirmed: 13, at: 0, policyVersion: "2026-08-06" },
    }));
    localStorage.setItem("lingua:progress", JSON.stringify({ [c]: p }));
  }, [code, progress, passes]);
  await page.evaluate(() => sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: [{ screen: "home" }, { screen: "lesson", params: { mode: "smart" } }], index: 0 })));
  await page.reload();
  await page.waitForTimeout(800);
  await page.evaluate(() => { history.pushState({ linguaIndex: 1 }, ""); history.pushState({ linguaIndex: 99 }, ""); history.back(); });
  await page.waitForTimeout(1500);

  const byMeaning = new Map(pack.vocab.map((v) => [v.translation, v]));
  const sentences = new Map();
  for (const v of pack.vocab) for (const e of v.examples || []) sentences.set(e.native, e);
  const log = { echo: 0, shadow: 0, sentence: 0, recall: 0, levelUp: "", typedPasses: 0, finished: false, overflow: 0, steps: 0 };
  let echoIdx = -1, introIdx = -1;

  for (let step = 0; step < 90; step++) {
    log.steps = step;
    const main = await page.evaluate(() => document.querySelector("#main")?.innerText || "");
    log.overflow = Math.max(log.overflow, await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth));
    if (/\b\d+ of \d+ right\b|📤 Share|Lesson complete/i.test(main)) { log.finished = true; break; }
    const lvlStrip = await page.locator("[data-testid=speak-level]").count();
    if (lvlStrip) {
      const mode = await page.locator("[data-testid=speak-level]").getAttribute("data-mode");
      if (mode === "echo") {
        log.echo++; echoIdx = step;
        const model = await page.locator("[data-testid=speak-model]").innerText();
        if (!pack.vocab.some((v) => model.includes(v.lemma))) fail(`${code}: echo shows no word from the pack: ${model.slice(0, 60)}`);
        await page.getByRole("button", { name: "I said it" }).click();
      } else if (mode === "shadow") {
        log.shadow++;
        const model = await page.locator("[data-testid=speak-model]").innerText();
        if (![...sentences.keys()].some((s) => model.includes(s))) fail(`${code}: shadowing shows no sentence from the pack: ${model.slice(0, 80)}`);
        await page.getByRole("button", { name: "I said it" }).click();
      } else if (mode === "sentence") {
        log.sentence++;
        const meaning = (await page.locator("[data-testid=speak-meaning]").innerText()).replace(/[“”]/g, "").trim();
        const hint = await page.locator("[data-testid=speak-hint]").innerText();
        // The hint names the word; the sentence must be one of THAT word's own.
        const hinted = pack.vocab.filter((v) => hint.includes(v.lemma));
        const ex = hinted.flatMap((v) => v.examples || []).find((e) => e.translation === meaning);
        if (!ex) { fail(`${code}: "${meaning}" isn't an example of the hinted word (${hint})`); break; }
        await page.locator(".type-input").fill(ex.translit || ex.native);
        await page.locator(".type-submit").click();
        await page.waitForSelector("[data-testid=speak-verdict]", { timeout: 4000 }).catch(() => {});
        const verdict = await page.locator("[data-testid=speak-verdict]").innerText().catch(() => "");
        if (!/Got it/.test(verdict)) fail(`${code}: typing the sentence exactly didn't score "Got it": ${verdict.slice(0, 80)}`);
        else log.typedPasses++;
        if (await page.locator("[data-testid=speak-levelup]").count()) log.levelUp = await page.locator("[data-testid=speak-levelup]").innerText();
        await page.getByRole("button", { name: "Continue" }).click();
      } else {
        log.recall++;
        const m = main.match(/How do you say “([^”]+)”/);
        const w = m && byMeaning.get(m[1]);
        if (!(await page.locator(".type-input").count())) {
          // No microphone here, so a mic button is a dead end.
          fail(`${code}: no microphone, but the recall step offers no way to type it`);
          await page.getByText("skip this one").click();
        } else if (!w) { await page.getByText("skip this one").click(); }
        else {
          await page.locator(".type-input").fill(w.translit || w.lemma);
          await page.locator(".type-submit").click();
          await page.waitForSelector("[data-testid=speak-verdict]", { timeout: 4000 }).catch(() => {});
          const verdict = await page.locator("[data-testid=speak-verdict]").innerText().catch(() => "");
          if (/Got it|Close/.test(verdict)) log.typedPasses++;
          if (await page.locator("[data-testid=speak-levelup]").count()) log.levelUp = await page.locator("[data-testid=speak-levelup]").innerText();
          await page.getByRole("button", { name: "Continue" }).click();
        }
      }
      await page.waitForTimeout(400);
      continue;
    }
    // Everything else: new-word cards, grammar, multiple choice.
    if (/tap to flip|card \d+ of \d+/i.test(main)) introIdx = step;
    const opts = page.locator(".opt-btn");
    if (await opts.count() >= 2) {
      await opts.first().click();
      await page.waitForTimeout(150);
      await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /^check/i.test((b.innerText || "").trim()) && !b.disabled)?.click());
      await page.waitForTimeout(600);
    }
    await page.evaluate(() => {
      const bs = [...document.querySelectorAll("button")].filter((b) => !b.disabled);
      const label = (b) => (b.innerText || "").trim();
      (bs.find((b) => /start practice/i.test(label(b))) || bs.find((b) => /^\W*(continue|next|got it|i've got these|done|finish)/i.test(label(b))))?.click();
    });
    await page.waitForTimeout(450);
  }
  const saved = await page.evaluate((c) => JSON.parse(localStorage.getItem("lingua:app")).speaking?.[c], code);
  log.saved = saved;
  // Home shows where they are on the ladder.
  await page.evaluate(() => sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: [{ screen: "home" }], index: 0 })));
  await page.reload();
  await page.waitForSelector("[data-testid=home-speaking-level]", { timeout: 6000 }).catch(() => {});
  log.home = await page.locator("[data-testid=home-speaking-level]").innerText().catch(() => "");
  log.errors = errors;
  log.echoAfterIntro = echoIdx < 0 || introIdx < 0 || echoIdx > introIdx;
  await ctx.close();
  return log;
}

for (const code of CODES) {
  console.log(`\n=== ${code} ===`);
  // Level 2, one good try from level 3.
  const a = await playLesson(code, 11);
  if (!a.echo) fail(`${code} L2: no echo after the new words`); else ok(`echo after the new words (${a.echo})`);
  if (!a.shadow) fail(`${code} L2: no shadowing`); else ok("shadowing a sentence from the pack, with “I said it” when there's no microphone");
  if (a.sentence) fail(`${code} L2: a build-a-sentence task before level 3`);
  if (a.typedPasses && !/Speaking level 3 · Build/.test(a.levelUp)) fail(`${code} L2: a good try at 11 didn't announce level 3 (saw "${a.levelUp}")`);
  else if (a.typedPasses) ok(`“${a.levelUp.trim()}”`);
  if (!a.saved || a.saved.passes !== 11 + a.typedPasses) fail(`${code} L2: speaking record ${JSON.stringify(a.saved)}, expected passes ${11 + a.typedPasses}`);
  if (!a.finished) fail(`${code} L2: the lesson never reached its results (${a.steps} steps)`);
  const expectLevel = 11 + a.typedPasses >= 12 ? "Speaking level 3 · Build" : "Speaking level 2 · Shadow";
  if (!a.home.includes(expectLevel)) fail(`${code}: Home says "${a.home}", expected "${expectLevel}"`);
  else ok(`Home: “${a.home}”`);
  if (a.overflow > 1) fail(`${code} L2: scrolls sideways by ${a.overflow}px`);
  if (a.errors.length) fail(`${code} L2: page errors: ${a.errors.slice(0, 2).join(" | ")}`);

  // Level 4.
  const b = await playLesson(code, 30);
  if (!b.sentence) fail(`${code} L4: no build-a-sentence task`); else ok("build a sentence from its meaning — typed, scored “Got it”");
  if (!b.finished) fail(`${code} L4: the lesson never reached its results (${b.steps} steps)`);
  if (b.overflow > 1) fail(`${code} L4: scrolls sideways by ${b.overflow}px`);
  if (b.errors.length) fail(`${code} L4: page errors: ${b.errors.slice(0, 2).join(" | ")}`);
}

await browser.close();
console.log(`\n  ${CODES.length} languages · ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
