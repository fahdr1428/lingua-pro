// =============================================================================
// verify-recall.mjs (v113) — writing words from memory, played in a real
// browser at phone width.
//
//   URDU, from Home. A unit walked past but not yet from memory:
//   · Home's one next step is "Make it yours", and it opens a session in which
//     every question is an empty box and a meaning
//   · a hint shows the start of the word and never the word; answering after
//     it is right, says so, and doesn't count as from memory
//   · the romanisation is accepted, and the answer shows how it's written
//   · typing a DIFFERENT real word names it and what it means
//   · "Show me" gives the word and an honest note, not a failure screen
//   · Urdu typed on an Arabic keyboard (ي ك for ی ک) is right
//   · the results say how many came from memory, and list them
//   · back home: the stop says "Almost yours" with the true count, and Home
//     doesn't ask for the same session again straight away
//
//   SPANISH, the map. A stop whose words were written from memory claims
//   "You can…" with a ✓; the one after it, met but not produced, says
//   "Almost yours" and its button opens a from-memory session.
//
//   SPANISH, a lesson answered perfectly. After a run of right answers a
//   choose-from-options question becomes a from-memory one, marked "You're on
//   a roll" — the difficulty adjusting itself as the lesson goes.
//
//   EASIER TO USE (v113). After the longest feedback a lesson has — a different
//   real word, with the explanation open — Continue is on screen without
//   scrolling, and so is the results screen's; the last new-word card starts
//   practice in one tap.
//
//   Everywhere: nothing scrolls sideways at 360px, and no page errors.
//
// PROVEN CAPABLE OF FAILING, each fix undone on purpose in a throwaway build:
//   · `contain: layout` back on <main> → "Continue is at 1115px on an 800px
//     screen — below the fold", and the results' at 1711px
//   · the map's ✓ back on reaching a stop rather than owning it → "a stop
//     claims 'You can greet someone properly' before its words came from
//     memory", and no Make-it-yours button
//   · the last new-word card back to "Done" → "still says Done"
//   · the lesson's step-up switched off → "no step up seen in 55 answers"
//
//   (cd dist && python3 -m http.server 4173) &
//   node scripts/verify-recall.mjs
// =============================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { canRecall } from "../src/engine/recall.js";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const DAY = 86400000;
let problems = 0;
const fail = (m) => { console.log("    ✗ " + m); problems++; };
const ok = (m) => console.log("    ✓ " + m);
const expect = (cond, good, bad) => (cond ? ok(good) : fail(bad));
// Whatever moves a lesson on, in priority order: "Start practice" sits beside
// "Done" on the last new-word card, and pressing Done again forever is a stall.
const ADVANCE = [/start practice/i, /^Got it/, /^Continue/, /^Finish/, /^Next →/, /^Done/];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const pack = (code) => JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));

function appState(code, extra = {}) {
  return {
    onboarded: true, currentLanguage: code, tutorialSeen: true, totalXp: 300, streak: 2, soundEffects: false,
    lessonsCompleted: { [code]: 4 }, scriptCourse: { [code]: { passed: true } }, sessionSize: 6,
    metCharacters: [code], userName: "Sam", sessions: [],
    consent: { terms: true, ageConfirmed: 13, at: 0, policyVersion: "2026-08-06" },
    ...extra,
  };
}
const now = Date.now();
const met = (extra = {}) => ({ difficulty: 5, stability: 3, reps: 2, lapses: 0, lastReview: now - 2 * DAY, nextReview: now + 5 * DAY, lastRating: 3, recalls: 0, ...extra });

async function open(code, app, progress, stack, index = stack.length - 1) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE);
  await page.evaluate(([c, a, p, s, i]) => {
    localStorage.setItem("lingua:app", JSON.stringify(a));
    localStorage.setItem("lingua:progress", JSON.stringify({ [c]: p }));
    sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: s, index: i }));
  }, [code, app, progress, stack, index]);
  await page.reload();
  await page.waitForTimeout(1500);
  return { ctx, page, errors };
}
const overflow = (page) => page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
const text = (page, sel) => page.locator(sel).first().innerText().catch(() => "");
async function clickButton(page, res) {
  return page.evaluate((srcs) => {
    const buttons = [...document.querySelectorAll("button")].filter((x) => !x.disabled);
    for (const [src, flags] of srcs) {
      const re = new RegExp(src, flags);
      const b = buttons.find((x) => re.test((x.innerText || "").trim()));
      if (b) { b.click(); return true; }
    }
    return false;
  }, (Array.isArray(res) ? res : [res]).map((r) => [r.source, r.flags]));
}
async function goHome(page) {
  await page.evaluate(() => sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: [{ screen: "home" }], index: 0 })));
  await page.reload();
  await page.waitForTimeout(1800);
}

// -----------------------------------------------------------------------------
// URDU — "make it yours", from Home
// -----------------------------------------------------------------------------
{
  console.log("\n=== Urdu: make it yours ===");
  const ur = pack("ur");
  const [u1, u2] = ur.units;
  const unit1 = ur.vocab.filter((v) => v.unit === u1.id);
  const progress = {};
  for (const v of unit1) progress[v.id] = met();
  for (const v of ur.vocab.filter((v) => v.unit === u2.id).slice(0, 3)) progress[v.id] = met();
  const { ctx, page, errors } = await open("ur", appState("ur"), progress, [{ screen: "home" }]);

  const hero = await text(page, ".hero-premium");
  expect(/make it yours/i.test(hero) && /0 of \d+ words from memory/.test(hero),
    "Home's next step is “Make it yours”, with 0 of the unit's words from memory",
    `Home's next step isn't make-it-yours: ${hero.replace(/\n/g, " / ")}`);
  await page.locator(".hero-premium .btn-premium").click();
  await page.waitForTimeout(1500);

  const byMeaning = (m) => unit1.filter((v) => v.translation === m);
  const titles = [];
  let asked = 0, cleanRight = 0, seenNonRecall = 0, hintChecked = false, otherChecked = false, gaveUpChecked = false, arabicKbChecked = false, romanChecked = false;
  for (let step = 0; step < 60; step++) {
    const main = await text(page, "#main");
    if (/📤 Share|PERFECT!|Great job!|Lesson complete|Keep growing/.test(main) && (await page.locator("[data-testid=enc-memory]").count())) break;
    if (await page.locator("[data-testid=recall]").count()) {
      asked++;
      const meaning = (await text(page, ".recall-meaning")).replace(/[“”]/g, "").trim();
      const w = byMeaning(meaning)[0];
      if (!w) { fail(`a from-memory question for "${meaning}", which isn't a unit-1 word`); await clickButton(page, /^Show me$/); }
      else if (asked === 1) {
        await clickButton(page, /Hint/);
        await page.waitForTimeout(200);
        const hint = await text(page, "[data-testid=recall-hint]");
        expect(/Starts/.test(hint) && !hint.includes(w.lemma), `the hint shows a start, not the word: “${hint.trim()}”`, `hint is "${hint}" for ${w.lemma}`);
        await page.locator(".recall-input").fill(w.translit);
        await page.keyboard.press("Enter");
        await page.waitForTimeout(500);
        const fb = await text(page, "[data-testid=answer-feedback]");
        const note = await text(page, "[data-testid=recall-note]");
        hintChecked = /Got it, with a hint/.test(fb) && /without the hint/.test(note);
        expect(hintChecked, "right after a hint: “Got it, with a hint”, and a nudge to try without", `after a hint: "${fb.slice(0, 80)}" / "${note}"`);
      } else if (asked === 2) {
        await page.locator(".recall-input").fill(w.translit);
        await page.locator("button", { hasText: /^Check$/ }).click();
        await page.waitForTimeout(500);
        const fb = await text(page, "[data-testid=answer-feedback]");
        const ans = await text(page, "[data-testid=recall-answer]");
        romanChecked = /From memory|You remembered|Straight from memory/.test(fb) && ans.includes(w.lemma);
        expect(romanChecked, `“${w.translit}” in English letters is right, and the answer shows it written: ${w.lemma}`, `romanisation "${w.translit}" → "${fb.slice(0, 60)}", answer "${ans}"`);
        if (romanChecked) cleanRight++;
      } else if (asked === 3) {
        const other = ur.vocab.find((v) => v.unit !== u1.id && v.translation !== w.translation && v.translit && !/\s/.test(v.lemma) && v.translit.length > 3);
        await page.locator(".recall-input").fill(other.lemma);
        await page.locator("button", { hasText: /^Check$/ }).click();
        await page.waitForTimeout(500);
        const fb = await text(page, "[data-testid=answer-feedback]");
        const note = await text(page, "[data-testid=recall-note]");
        otherChecked = /a real word — just a different one/.test(fb) && note.includes(other.translation);
        expect(otherChecked, `another real word is named: “${note.trim()}”`, `typing ${other.lemma} for ${w.lemma}: "${fb.slice(0, 80)}" / "${note}"`);
        const box = await page.locator("button", { hasText: /^Continue$/ }).boundingBox();
        expect(box && box.y >= 0 && box.y + box.height <= 800, "with the explanation open, Continue is on screen without scrolling",
          `Continue is at ${box ? Math.round(box.y) : "?"}px on an 800px screen — below the fold`);
      } else if (asked === 4) {
        await clickButton(page, /^Show me$/);
        await page.waitForTimeout(500);
        const fb = await text(page, "[data-testid=answer-feedback]");
        const why = await text(page, ".slide-up");
        gaveUpChecked = /Here it is/.test(fb) && (await text(page, "[data-testid=recall-answer]")).includes(w.lemma);
        expect(gaveUpChecked, "“Show me” gives the word, without a cross", `show me: "${fb.slice(0, 80)}"`);
        if (!/better than a wild guess|beats a wild guess/.test(await text(page, "#main"))) fail(`"Show me" isn't explained honestly: ${why.slice(0, 120)}`);
      } else {
        // Urdu as an Arabic keyboard types it: ي for ی, ك for ک.
        const typed = w.lemma.replace(/ی/g, "ي").replace(/ک/g, "ك");
        await page.locator(".recall-input").fill(typed);
        await page.locator("button", { hasText: /^Check$/ }).click();
        await page.waitForTimeout(500);
        const fb = await text(page, "[data-testid=answer-feedback]");
        const right = /^✓/.test(fb.trim());
        if (typed !== w.lemma) { arabicKbChecked = arabicKbChecked || right; if (!right) fail(`${w.lemma} typed on an Arabic keyboard (${typed}) was marked wrong`); }
        if (right) cleanRight++;
      }
      titles.push((await text(page, "[data-testid=answer-feedback]")).split("\n")[0]);
      if (await overflow(page) > 1) fail(`the from-memory question scrolls sideways at 360px (${await overflow(page)}px)`);
      await clickButton(page, /^(Continue|Finish)$/);
      await page.waitForTimeout(450);
      continue;
    }
    // The second-chance round after misses: re-teach, then an easy question.
    seenNonRecall++;
    const opts = page.locator(".opt-btn");
    if (await opts.count() >= 2) {
      await opts.first().click();
      await page.waitForTimeout(150);
      await clickButton(page, /^Check$/);
      await page.waitForTimeout(500);
    }
    await clickButton(page, ADVANCE);
    await page.waitForTimeout(450);
  }
  expect(asked >= 5, `a make-it-yours session of ${asked} from-memory questions`, `only ${asked} from-memory questions were asked`);
  if (!arabicKbChecked) console.log("    · (no word with ی or ک came up to type on an Arabic keyboard)");
  else ok("Urdu typed on an Arabic keyboard is right");

  const memCard = await text(page, "[data-testid=enc-memory]");
  expect(new RegExp(`You wrote ${cleanRight} of ${asked} from memory`).test(memCard) || (cleanRight === asked && /all \d+ from memory/.test(memCard)),
    `the results: “${memCard.split("\n")[1] || memCard}”`, `results card says "${memCard}", expected ${cleanRight} of ${asked}`);
  const resultBox = await page.locator("button", { hasText: /^Continue$/ }).boundingBox();
  expect(resultBox && resultBox.y + resultBox.height <= 800, "the results screen's Continue is on screen without scrolling",
    `results Continue is at ${resultBox ? Math.round(resultBox.y) : "?"}px on an 800px screen`);
  const listed = await page.locator("[data-testid=enc-memory] .enc-word").count();
  expect(listed === cleanRight, `and lists the ${cleanRight} words written from memory`, `lists ${listed} words, expected ${cleanRight}`);

  // Back home: the stop tells the truth, and Home moves on.
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:progress")).ur);
  const recalled = unit1.filter((v) => canRecall(saved[v.id])).length;
  await goHome(page);
  const route = await text(page, ".route");
  expect(/Almost yours/.test(route) && route.includes(`${recalled} of ${unit1.length} words from memory`),
    `the stop now reads “Almost yours” · ${recalled} of ${unit1.length} words from memory`,
    `the map doesn't show the true count (${recalled} of ${unit1.length}): ${route.slice(0, 200)}`);
  if (recalled / unit1.length < 0.6 && (await page.locator(".station-done .station-label").count())) {
    const claim = await text(page, ".station-done .station-label");
    if (/^You can/.test(claim)) fail(`a stop claims "${claim}" before its words came from memory`);
  }
  const hero2 = await text(page, ".hero-premium");
  expect(!/make it yours/i.test(hero2), "Home doesn't ask for the same session again straight away", `Home asks again: ${hero2.slice(0, 80)}`);
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// -----------------------------------------------------------------------------
// SPANISH — what the map claims
// -----------------------------------------------------------------------------
{
  console.log("\n=== Spanish: the map's claims ===");
  const es = pack("es");
  const [u1, u2, u3] = es.units;
  const progress = {};
  for (const v of es.vocab.filter((v) => v.unit === u1.id)) progress[v.id] = met({ recalls: 1, stability: 6 });
  for (const v of es.vocab.filter((v) => v.unit === u2.id)) progress[v.id] = met();
  for (const v of es.vocab.filter((v) => v.unit === u3.id).slice(0, 2)) progress[v.id] = met();
  const { ctx, page, errors } = await open("es", appState("es", { sessions: [{ ts: now - DAY, language: "es", mode: "recall", correct: 3, total: 3, xp: 6 }] }), progress, [{ screen: "home" }]);

  const stations = page.locator(".route .station");
  const first = await stations.nth(0).locator(".station-label").innerText();
  const firstDot = await stations.nth(0).locator(".station-dot").innerText();
  expect(/^You can/.test(first.trim()) && firstDot.includes("✓"), `a stop whose words came from memory: ✓ “${first.trim()}”`, `stop 1 reads "${first.slice(0, 80)}" (dot "${firstDot}")`);
  const second = await stations.nth(1).locator(".station-label").innerText();
  const secondDot = await stations.nth(1).locator(".station-dot").innerText();
  expect(/Almost yours/.test(second) && !secondDot.includes("✓"), "the next, met but not produced: “Almost yours”, no ✓", `stop 2 reads "${second.slice(0, 80)}" (dot "${secondDot}")`);
  await stations.nth(1).locator(".station-head").click();
  await page.waitForTimeout(500);
  const btn = stations.nth(1).locator("[data-recall]");
  expect(await btn.count() === 1 && /Make it yours · 0\/\d+ from memory/.test(await btn.innerText()), `its button: “${(await btn.innerText().catch(() => "")).trim()}”`, "no Make-it-yours button on the almost-yours stop");
  if (await btn.count()) await btn.click();
  await page.waitForTimeout(1500);
  expect(await page.locator("[data-testid=recall]").count() === 1, "…which opens a from-memory question", "the button didn't open a from-memory question");
  if (await overflow(page) > 1) fail(`scrolls sideways at 360px (${await overflow(page)}px)`);
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// -----------------------------------------------------------------------------
// SPANISH — a lesson that adjusts itself
// -----------------------------------------------------------------------------
{
  console.log("\n=== Spanish: the lesson adjusts ===");
  const es = pack("es");
  const progress = {};
  es.vocab.slice(0, 30).forEach((v, i) => { progress[v.id] = met({ reps: 3 + (i % 3), stability: 4 + (i % 5), recalls: 1 }); });
  // Only the questions this test can answer correctly from the page itself.
  const off = ["listen_pick", "true_false", "complete_sentence", "match_pairs", "odd_one_out", "build_sentence", "tap_words", "letter_scramble", "type_translation", "conjugate", "conjugate_tense", "speak_prompt"];
  let chips = 0, chipWasRecall = 0, graded = 0, wrongs = 0, lastCard = null;
  for (let attempt = 0; attempt < 3 && !chips; attempt++) {
    const { ctx, page, errors } = await open("es", appState("es", { disabledExercises: off }), progress, [{ screen: "home" }, { screen: "lesson", params: { mode: "smart" } }], 0);
    await page.evaluate(() => { history.pushState({ linguaIndex: 1 }, ""); history.pushState({ linguaIndex: 99 }, ""); history.back(); });
    await page.waitForTimeout(1500);
    const lemmas = new Set(es.vocab.map((v) => v.lemma));
    for (let step = 0; step < 70; step++) {
      const main = await text(page, "#main");
      if (process.env.DEBUG) console.log(`      [${step}] ${main.replace(/\n/g, " / ").slice(0, 150)}`);
      if (/📤 Share|PERFECT!|Great job!|Lesson complete|Keep growing/.test(main)) break;
      if (await page.locator("[data-testid=challenge-up]").count()) { chips++; if (await page.locator("[data-testid=recall]").count()) chipWasRecall++; }
      const card = /Card (\d+) of (\d+)/.exec(main);
      if (card && card[1] === card[2] && lastCard === null) {
        const labels = (await page.locator("#main button").allInnerTexts()).map((t) => t.trim());
        lastCard = labels.some((t) => /Start practice/.test(t)) && !labels.includes("Done");
      }
      if (await page.locator("[data-testid=recall]").count()) {
        const meaning = (await text(page, ".recall-meaning")).replace(/[“”]/g, "").trim();
        const w = es.vocab.find((v) => v.translation === meaning);
        await page.locator(".recall-input").fill(w ? w.lemma : "?");
        await clickButton(page, /^Check$/);
      } else if (await page.locator(".opt-btn").count() >= 2) {
        const opts = await page.locator(".opt-btn").allInnerTexts();
        // The prompt is set in capitals by CSS, and innerText returns it that way.
        const pickFor = /pick the word for "([^"]+)"/i.exec(main);
        let choice = -1;
        if (pickFor) choice = opts.findIndex((o) => es.vocab.some((v) => v.translation.toLowerCase() === pickFor[1].toLowerCase() && v.lemma === o.trim()));
        else {
          // "What does this word mean?": the word is on screen as a line of its own.
          const lines = new Set(main.split("\n").map((l) => l.trim()));
          choice = opts.findIndex((o) => es.vocab.some((v) => v.translation === o.trim() && lemmas.has(v.lemma) && lines.has(v.lemma)));
        }
        await page.locator(".opt-btn").nth(Math.max(0, choice)).click();
        await clickButton(page, /^Check$/);
      } else {
        await clickButton(page, ADVANCE);
        await page.waitForTimeout(350);
        continue;
      }
      await page.waitForTimeout(450);
      graded++;
      if (!/^✓/.test((await text(page, "[data-testid=answer-feedback]")).trim())) wrongs++;
      await clickButton(page, /^(Continue|Finish)$/);
      await page.waitForTimeout(350);
    }
    if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }
  if (lastCard === null) console.log("    · (no new-word cards came up)");
  else expect(lastCard, "the last new-word card's own button starts practice — one tap, not “Done” then “Start practice”", "the last new-word card still says Done");
  expect(chips > 0 && chips === chipWasRecall, `after a run of right answers, a question turned into a from-memory one: “You're on a roll” (${chips}× in ${graded} answers, ${wrongs} wrong)`,
    `no step up seen in ${graded} answers (${wrongs} wrong, ${chips} chips, ${chipWasRecall} on from-memory questions)`);
}

await browser.close();
console.log(`\n  ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
