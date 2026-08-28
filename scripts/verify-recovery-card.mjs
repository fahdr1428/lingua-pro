// =============================================================================
// verify-recovery-card.mjs (v92) — the re-teach card must be sayable too.
//
// Two screens show a learner an example sentence:
//
//   IntroBatchCards → InContext   the flashcards at the start of a lesson.
//                                 This one already rendered the romanisation.
//   EXERCISE.INTRODUCE            the v63 supportive recovery round — the
//                                 re-teach that fires when you got words WRONG.
//                                 This one did not.
//
// The second is the one that matters most and was the one missing it: a learner
// who just missed a word is re-shown it with an example sentence, and for a
// non-Latin language that sentence was unsayable.
//
// The main fuzz never caught it because the fuzz mostly answers correctly and
// so rarely enters recovery. This drives a lesson answering DELIBERATELY WRONG
// to force the round, then asserts the romanisation is on screen.
//
//   node scripts/verify-recovery-card.mjs
// =============================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { CHARACTERS } from "../src/data/characters.js";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CODES = (process.env.ONLY || "ur,ja,ko,zh,ml,ar").split(",");

const seed = (code) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 0, streak: 0, hearts: 99, heartsMax: 99, gems: 0, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: {}, sessions: [],
  grammarSeen: {}, learningGoal: {}, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  passagesRead: {}, userName: "",
  lastStudyDate: new Date().toISOString().slice(0, 10),
  consent: { terms: true, ageConfirmed: 13, at: 0 },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
});

// Any character the learner cannot be assumed to read.
const NATIVE_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Malayalam}\p{Script=Tamil}\p{Script=Gurmukhi}]/u;

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

let problems = 0;
const fail = (m) => { console.log("    ✗ " + m); problems++; };

for (const code of CODES) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const known = new Set();
  for (const w of pack.vocab || []) for (const e of w.examples || []) if (e.translit) known.add(e.translit);

  // Every line this language's guide can say to the learner.
  const g = CHARACTERS[code] || {};
  const guideLines = [
    ...(g.greetings || []),
    ...Object.values(g.celebrations || {}),
    ...(g.reactions?.correct || []), ...(g.reactions?.wrong || []), ...(g.reactions?.streak || []),
  ].filter((x) => typeof x === "string" && x.length > 2);

  console.log(`\n=== ${code} ===`);
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(`page error: ${e.message}`));

  await page.goto(BASE, { timeout: 20000 });
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), seed(code));
  await page.reload();
  await page.waitForTimeout(1400);

  // Everything below uses evaluate + fixed waits. No locator.click() on an
  // element that might not exist — that is what hung the first attempt at this.
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")]
      .find((x) => !x.disabled && /Learn this|Continue ·|Continue|Start/i.test(x.textContent || ""));
    if (b) { b.click(); return b.textContent.trim().slice(0, 30); }
    return null;
  });
  if (!clicked) { fail("could not start a lesson"); await ctx.close(); continue; }
  await page.waitForTimeout(1200);

  let sawIntro = false, sawRoman = false, introLines = null;
  let sawFlash = false, flashRoman = false, flashLines = null;
  const guideSeen = [];

  for (let step = 0; step < 160; step++) {
    const state = await page.evaluate(() => {
      const txt = document.body.innerText;
      const label = [...document.querySelectorAll("div")]
        .find((e) => (e.textContent || "").trim() === "USED IN A SENTENCE");

      // The flashcard's example sits on the BACK of the card, and the card
      // flips on a click on the card <div> rather than a button — which is why
      // a button-clicking driver never sees this face at all. Flip it.
      if (!document.querySelector(".in-context") && /TAP TO FLIP/.test(txt)) {
        const card = [...document.querySelectorAll("div.pop")]
          .find((d) => (d.style.minHeight || "").startsWith("280"));
        if (card) card.click();
      }
      const ic = document.querySelector(".in-context");

      return {
        card: label && label.parentElement
          ? label.parentElement.innerText.split("\n").map((s) => s.trim()).filter(Boolean)
          : null,
        flash: ic ? {
          native: ic.querySelector(".in-context-native")?.textContent?.trim() || "",
          translit: ic.querySelector(".in-context-tl")?.textContent?.trim() || "",
          en: ic.querySelector(".in-context-en")?.textContent?.trim() || "",
        } : null,
        done: /Lesson complete|Session complete|You (learned|got)/i.test(txt),
        // The guide's voice on screen. Its reaction banner and celebration
        // card are inline-styled divs with no class names, so there is nothing
        // to select — instead the caller passes in every line this guide can
        // say, and we look for them in the page text. A selector that matches
        // nothing looks exactly like a clean pass; a string search cannot.
        body: txt,
      };
    });

    // v93 — the guide's own words, as they land on screen.
    //
    // Malayalam, Tamil and Persian shipped with every line of guide copy in
    // native script: greetings, the correct/wrong reactions, and the
    // end-of-lesson celebration. So the one moment the app stops testing you
    // and says well done, it said it in a script you came here unable to read.
    // Every other language romanises it. This watches the real screen.
    for (const line of guideLines) {
      if (state.body.includes(line) && !guideSeen.includes(line)) guideSeen.push(line);
    }

    if (state.flash && state.flash.native && !sawFlash) {
      sawFlash = true;
      flashLines = state.flash;
      flashRoman = !!state.flash.translit && known.has(state.flash.translit);
    }

    if (state.card && !sawIntro) {
      sawIntro = true;
      introLines = state.card;
      sawRoman = state.card.some((l) => known.has(l));
    }
    if (state.done) break;

    // Answer WRONG on purpose: pick the LAST option, which is the correct one
    // only by chance, so misses accumulate and the recovery round fires.
    await page.evaluate(() => {
      const opts = [...document.querySelectorAll("button")].filter(
        (b) => !b.disabled && /option|choice|opt-/i.test(b.className || ""));
      if (opts.length) { opts[opts.length - 1].click(); return; }
      const input = document.querySelector("input[type=text], .type-input");
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(input, "zzzz");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.waitForTimeout(140);
    await page.evaluate(() => {
      for (const label of [/^Check$/i, /^Continue$/i, /^Got it$/i, /^Next$/i, /skip/i, /Tap to flip|I've got these/i]) {
        const b = [...document.querySelectorAll("button")].find(
          (x) => !x.disabled && label.test((x.textContent || "").trim()));
        if (b) { b.click(); return; }
      }
      const any = [...document.querySelectorAll("button")].filter((b) => !b.disabled);
      if (any.length) any[any.length - 1].click();
    });
    await page.waitForTimeout(260);
  }

  // --- surface 1: the flashcard every learner meets at the start of a lesson
  if (!sawFlash) {
    console.log("    – flashcard example not observed in this run");
  } else {
    console.log(`    flashcard: ${flashLines.native}  |  ${flashLines.translit || "(no romanisation)"}  |  ${flashLines.en}`);
    if (flashRoman) console.log("    ✓ flashcard romanisation on screen");
    else fail("flashcard example shows no romanisation");
  }

  // --- surface 2: the re-teach card, after a mistake
  if (!sawIntro) {
    console.log("    – recovery round not reached in this run (no re-teach card appeared)");
  } else {
    console.log("    re-teach card lines:");
    for (const l of introLines) console.log("      · " + l);
    if (sawRoman) console.log("    ✓ re-teach romanisation on screen");
    else fail("re-teach card shows no romanisation — a learner who just missed the word still can't say it");
  }

  if (!guideSeen.length) {
    console.log("    – no guide copy observed on screen in this run");
  } else {
    const bad = guideSeen.filter((g) => NATIVE_SCRIPT.test(g));
    console.log(`    guide said: ${guideSeen.map((g) => JSON.stringify(g.slice(0, 44))).join(", ")}`);
    if (bad.length) fail(`guide spoke in native script — unreadable to this learner: ${bad[0].slice(0, 48)}`);
    else console.log("    ✓ every guide line seen was readable");
  }

  if (!sawFlash && !sawIntro) {
    fail("neither example surface was observed — this run verified nothing");
  }

  await ctx.close();
}

await browser.close();
console.log(`\n  ${CODES.length} languages · ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
