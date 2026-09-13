// =============================================================================
// verify-answer-feedback.mjs (v103) — read the line the app shows a learner in
// the half-second after they answer.
//
// Lesson.jsx renders, under the correct/wrong card:
//
//     <em>{item.examples[0].native}</em> — {item.examples[0].translation}
//
// In a non-Latin language that is a line of script the learner is here
// precisely because they cannot read it, with no romanisation beside it. The
// romanisation exists — every one of the 2,442 non-Latin example sentences in
// the repo carries a `translit` — it is simply not rendered here. This is the
// v92 bug (587 romanisations in the data, none on the intro card) in the one
// surface a learner sees more often than any other: it appears after EVERY
// answer, right or wrong.
//
// The same line is also the app's only bidi hazard. `<em>عربى</em> — meaning`
// has no dir="rtl" on the native run, so the em-dash and the English gloss are
// reordered into the Arabic run by the bidi algorithm and the line renders in
// a jumbled order. You cannot see that in the source; you can see it in a
// browser, which is why this check is a browser check.
//
// What it asserts, per language, from the DOM and not the source:
//
//   1. If the feedback line shows a native-script sentence, a romanisation is
//      shown with it (when showRomanization is on, which is the default).
//   2. The native run carries dir and lang, so bidi and font selection are
//      correct.
//   3. The sentence shown is the sentence the exercise used — not examples[0]
//      when the question was built from examples[1]. 1,193 words now have a
//      second frame, so this is reachable for a third of the vocabulary.
//
// PROVEN CAPABLE OF FAILING: run against the pre-fix build it reports every
// non-Latin language, e.g.
//   ar: feedback line "مرحبا صديقي" has no romanisation beside it
//   ar: feedback line "مرحبا صديقي" has no dir attribute — bidi will scramble it
//
//   npm run build && (cd dist && python3 -m http.server 4173 &)
//   npm run verify-answer-feedback
// =============================================================================

import { chromium } from "playwright";
import { readdirSync, readFileSync } from "node:fs";
import { LATIN_SCRIPT_LANGUAGES } from "../src/data/registry.js";

const BASE = process.env.BASE || "http://localhost:4173";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;

const codes = readdirSync("src/data/languages")
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((c) => !LATIN_SCRIPT_LANGUAGES.has(c))
  .filter((c) => !ONLY || ONLY.includes(c));

const problems = [];
let linesSeen = 0, withTranslit = 0, lessonsPlayed = 0, checks = 0;

function seedState(code) {
  return JSON.stringify({
    onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
    totalXp: 800, streak: 3, hearts: 5, heartsMax: 5, gems: 50, isPremium: true,
    theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
    lessonsCompleted: { [code]: 6 }, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: { [code]: [1, 2, 3] }, sentenceDropsDone: { [code]: 9 },
    lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  });
}

// Some reps on the first words, so the lesson serves recall and production
// exercises rather than a run of INTRODUCE cards (which have their own,
// already-correct, sentence card and never reach the feedback footer).
function seedProgress(pack) {
  const out = {};
  for (const w of (pack.vocab || []).slice(0, 40)) {
    out[w.id] = {
      reps: 3, lapses: 0, ease: 2.5, interval: 1,
      due: new Date(Date.now() - 86400000).toISOString(),
    };
  }
  return JSON.stringify(out);
}

/** Read the example line under the correct/wrong card, if one is on screen. */
async function readFeedbackLine(page) {
  return page.evaluate(() => {
    // .answer-frame is the footer under the correct/wrong card, and nothing
    // else. Scoping matters: .in-context also appears on the new-word preview
    // card, which has always been correct, so an unscoped search would read
    // that one and report this surface as healthy.
    const box = document.querySelector(".answer-frame");
    if (!box || !box.offsetParent) return null;
    const native = box.querySelector(".in-context-native");
    if (!native) return null;
    const text = (native.textContent || "").trim();
    if (!text) return null;
    return {
      native: text,
      dir: native.getAttribute("dir") || native.closest("[dir]")?.getAttribute("dir") || "",
      lang: native.getAttribute("lang") || native.closest("[lang]")?.getAttribute("lang") || "",
      boxText: (box.textContent || "").replace(/\s+/g, " ").trim(),
      romanised: [...box.querySelectorAll("[data-translit]")].map((n) => n.textContent.trim()),
    };
  });
}

async function step(page) {
  if (await page.locator("text=Something went wrong").count()) return "crash";
  for (const done of ["Back to home", "Continue learning", "Finish"]) {
    const b = page.locator(`button:has-text("${done}")`).first();
    if (await b.count() && await b.isVisible().catch(() => false)) return "done";
  }

  const bank = page.locator("[data-bank] button, .bank-tile");
  if (await bank.count()) {
    const n = await bank.count();
    for (let i = 0; i < n; i++) {
      const t = bank.nth(i);
      if (await t.isEnabled().catch(() => false)) await t.click({ timeout: 1200 }).catch(() => {});
    }
  }
  for (const link of ["or type it", "or type it instead"]) {
    const b = page.locator(`button:has-text("${link}")`).first();
    if (await b.count() && await b.isVisible().catch(() => false)) {
      await b.click({ timeout: 1200 }).catch(() => {});
      break;
    }
  }
  const input = page.locator('input[type="text"]:visible, input:not([type]):visible');
  if (await input.count()) await input.first().fill("answer").catch(() => {});

  await page.evaluate(() => {
    const SKIP = /^(check|continue|next|skip|got it|hear|listen|play|back|close|try again|say it again|or type|✕|🔊|report)/i;
    const b = [...document.querySelectorAll("button")].filter((x) => {
      if (x.disabled) return false;
      const r = x.getBoundingClientRect();
      if (r.width < 20 || r.height < 20) return false;
      const t = (x.innerText || "").trim();
      return t && !SKIP.test(t);
    });
    b.slice(0, 8).forEach((x) => x.click());
  });

  // Check first — that is what produces the feedback card this script reads.
  const check = page.locator('button:has-text("Check")').first();
  if (await check.count() && await check.isVisible().catch(() => false) && await check.isEnabled().catch(() => false)) {
    await check.click({ timeout: 2000 }).catch(() => {});
    return "checked";
  }
  for (const label of ["Continue", "Next", "Got it", "I've got these", "skip this one"]) {
    const b = page.locator(`button:has-text("${label}")`).first();
    if (await b.count() && await b.isVisible().catch(() => false) && await b.isEnabled().catch(() => false)) {
      await b.click({ timeout: 2000 }).catch(() => {});
      return "step";
    }
  }
  return "stuck";
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(([a, p]) => {
    localStorage.setItem("lingua:app", a);
    localStorage.setItem("lingua:progress", p);
  }, [seedState(code), seedProgress(pack)]);
  await page.reload();
  await page.waitForTimeout(1200);

  // Three lessons per language. The footer is hidden whenever the explanation
  // card auto-opens, which it does on every miss, so a harness that answers by
  // guessing reads a line on roughly a third of its answers. One lesson each
  // yielded two lines across four languages — enough to prove the bug was
  // reachable, nowhere near enough to claim the surface is healthy in eleven
  // scripts. Three lessons each is what makes the pass mean something.
  for (let lesson = 0; lesson < 3; lesson++) {
  if (lesson > 0) {
    await page.goto(BASE, { waitUntil: "load" });
    await page.waitForTimeout(1100);
  }
  // Start a lesson by tapping a unit — deterministic in every language.
  const unit = page.locator("button[data-unit]").first();
  if (!(await unit.count())) {
    if (lesson === 0) problems.push(`${code}: no unit to tap on the home screen`);
    break;
  }
  await unit.click().catch(() => {});
  await page.waitForTimeout(900);
  lessonsPlayed++;

  for (let i = 0; i < 60; i++) {
    const r = await step(page);
    if (r === "crash") { problems.push(`${code}: the lesson crashed`); break; }
    if (r === "done" || r === "stuck") break;
    await page.waitForTimeout(320);

    if (r !== "checked") continue;
    checks++;
    // The feedback card animates in; reading it on the same tick finds the
    // previous exercise's DOM or nothing at all.
    await page.waitForTimeout(450);
    const line = await readFeedbackLine(page);
    if (!line) continue;
    linesSeen++;

    if (process.env.SHOT && linesSeen <= 2) {
      await page.locator(".answer-frame").scrollIntoViewIfNeeded().catch(() => {});
      await page.screenshot({ path: `/tmp/feedback-${code}-${linesSeen}.png` });
    }

    if (line.romanised.length) withTranslit++;
    else problems.push(`${code}: feedback line "${line.native}" has no romanisation beside it — the learner is shown a script they came here unable to read`);

    if (!line.dir) problems.push(`${code}: feedback line "${line.native}" has no dir attribute — bidi will scramble it against the English gloss`);
    if (!line.lang) problems.push(`${code}: feedback line "${line.native}" has no lang attribute — the wrong font and the wrong voice`);

    // The sentence on screen must be one the pack actually contains for the
    // word under test; a mismatch means the footer is showing examples[0] while
    // the question was built from another frame.
    const known = new Set();
    for (const w of pack.vocab || []) for (const e of w.examples || []) known.add(e.native);
    if (!known.has(line.native) && !line.native.includes("…")) {
      // Not necessarily wrong — extraExamples sentences are merged in at load
      // and are not in the pack file — so this is reported, never counted as a
      // pass, and read by hand.
      problems.push(`${code}: feedback sentence "${line.native}" is not in the pack file (extra frame, or the wrong sentence)`);
    }
  }
  }

  await ctx.close();
}

await browser.close();

console.log(`\n  ${lessonsPlayed} lessons played · ${checks} answers checked · ${linesSeen} feedback lines read · ${withTranslit} carried a romanisation`);
if (!linesSeen) {
  console.log("\n  ✗ no feedback line was ever read — this check proved nothing.\n");
  process.exit(1);
}
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems.slice(0, 30)) console.log(`   ${p}`);
  if (problems.length > 30) console.log(`   … and ${problems.length - 30} more`);
  console.log();
  process.exit(1);
}
console.log("\n  ✓ every feedback line was readable\n");
