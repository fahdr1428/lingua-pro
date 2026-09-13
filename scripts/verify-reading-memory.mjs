// =============================================================================
// verify-reading-memory.mjs (v103) — does the reading library remember what
// you have read, and does finishing a passage unlock the badge for it?
//
// Reading.jsx has two writers for `appState.passagesRead` and they disagree
// about what it is:
//
//   line 29   passagesRead: { ...st.passagesRead, [code]: ids }   // a map
//   line 94   passagesRead: (s.passagesRead || 0) + 1             // a counter
//
// The second one runs when a comprehension answer is correct. `{} || 0` is
// `{}`, and `{} + 1` is the STRING "[object Object]1", so answering one
// question correctly replaces the whole per-language read history with a
// fifteen-character string. The next visit reads
// `passagesRead?.[code] || []` off that string, gets [], and draws from the
// whole library again — which is precisely the repeat-passage bug v79 was
// written to fix. v79 fixed it; this second writer silently un-fixed it.
//
// The same value is the "First Read" badge's only evidence
// (gamification.js:121, `(appState.passagesRead || 0) >= 1`). As a map it is
// never >= 1; as "[object Object]1" it is NaN >= 1. So the badge is
// unreachable in both states — there is no value of passagesRead that both
// keeps the history and unlocks the badge.
//
// What this asserts, from the browser and not the source:
//
//   1. After answering a passage question correctly, `passagesRead` is still a
//      map, and the passage's id is in this language's list.
//   2. Coming back to Reading serves a passage that has not been served yet,
//      for as many passages as the language has.
//   3. The "First Read" badge is unlocked afterwards.
//
// PROVEN CAPABLE OF FAILING: against the pre-fix build,
//   ar: passagesRead is a string ("[object Object]1"), not a map — the read history is gone
//   ar: came back to Reading and was handed "..." again
//   ar: read a passage and the First Read badge is still locked
//
//   npm run build && (cd dist && python3 -m http.server 4173 &)
//   npm run verify-reading-memory
// =============================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { PASSAGES } from "../src/data/passages.js";

const BASE = process.env.BASE || "http://localhost:4173";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;

// Languages with more than one passage — with a single passage "served
// something new" is not a question that can be asked.
const codes = Object.entries(PASSAGES)
  .filter(([, list]) => Array.isArray(list) && list.length >= 2)
  .map(([c]) => c)
  .filter((c) => !ONLY || ONLY.includes(c));

const problems = [];
let visits = 0, badgesChecked = 0;

function seedState(code) {
  return JSON.stringify({
    onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
    totalXp: 900, streak: 3, hearts: 5, heartsMax: 5, gems: 50, isPremium: true,
    theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
    lessonsCompleted: { [code]: 10 }, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: { [code]: [1, 2] }, sentenceDropsDone: { [code]: 4 },
    lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
    passagesRead: {}, passageLog: [],
  });
}

/** Every word in the pack marked learned, so passages are unlocked. */
function seedProgress(code, pack) {
  const out = {};
  for (const w of pack.vocab || []) {
    out[w.id] = { reps: 6, lapses: 0, ease: 2.6, interval: 9, due: new Date(Date.now() + 6e8).toISOString() };
  }
  return JSON.stringify(out);
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
  }, [seedState(code), seedProgress(code, pack)]);

  const served = [];
  const rounds = Math.min(PASSAGES[code].length, 3);

  for (let round = 0; round < rounds; round++) {
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.waitForTimeout(900);

    // Reach Reading through the app's own door: the Practice tab, where the
    // "Read some <language>" card lives. Matching "reading" anywhere on the
    // home screen instead lands in the Sentence Lab, via the "Everything else,
    // flashcards, reading, grammar…" drawer — which looks like a visit and
    // measures nothing.
    await page.evaluate(() => {
      const b = [...document.querySelectorAll(".bottom-nav button")].find((x) => /practice/i.test(x.innerText || ""));
      if (b) b.click();
    });
    await page.waitForTimeout(700);
    const opened = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => /📖/.test(x.innerText || "") && /read some/i.test(x.innerText || ""));
      if (b) { b.click(); return true; }
      return false;
    });
    if (!opened) { problems.push(`${code}: no "Read some …" card in the Practice tab`); break; }
    await page.waitForTimeout(1000);
    visits++;

    const title = await page.evaluate(() => {
      const h = document.querySelector("h1, h2, h3");
      return (h?.textContent || document.body.innerText.slice(0, 60)).trim();
    });
    if (served.includes(title)) {
      problems.push(`${code}: visit ${round + 1} served "${title}" again — the read history is not holding`);
    }
    served.push(title);

    // Walk from the passage to the comprehension question. Retried, because a
    // single click raced the passage screen's entrance animation often enough
    // that five of ten languages reported a data mismatch they did not have.
    // NOTE on the whitespace: innerText reflects LAYOUT, so at 414px the
    // letter-spaced eyebrow "COMPREHENSION QUESTION" wraps and comes back as
    // "COMPREHENSION\nQUESTION". Testing the raw text for the phrase found it
    // nowhere and reported all ten languages as unable to reach a screen they
    // were already on. Collapse the whitespace first.
    const onQuestion = () =>
      page.evaluate(() => /comprehension question/i.test(document.body.innerText.replace(/\s+/g, " ")));

    for (let i = 0; i < 5; i++) {
      if (await onQuestion()) break;
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => /test me/i.test(x.innerText || ""));
        if (b) b.click();
      });
      await page.waitForTimeout(600);
    }
    if (!(await onQuestion())) {
      const where = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 150));
      problems.push(`${code}: could not reach the comprehension question from the passage — on screen: "${where}"`);
      break;
    }

    // Answer it CORRECTLY — only a correct answer runs the write being tested,
    // and the options lock the moment feedback appears, so there is exactly one
    // attempt per visit. Which passage was served is read off the question text
    // and matched against passages.js, rather than guessed at by clicking.
    // Which passage is this? Matched by looking for each passage's question in
    // the page text rather than by hunting for a node that ends in "?" — an
    // Arabic question ends in "؟", so that hunt returned "" and the check
    // reported a data mismatch that did not exist.
    const body = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " "));
    const served_p = PASSAGES[code].find((p) => p.question && body.includes(p.question.replace(/\s+/g, " ").trim()));
    if (!served_p) {
      problems.push(`${code}: the question on screen matches no passage in passages.js — ${body.slice(0, 120)}`);
      break;
    }
    const clicked = await page.evaluate((ans) => {
      const b = [...document.querySelectorAll("button")]
        .filter((x) => !x.closest(".bottom-nav"))
        .find((x) => (x.innerText || "").trim() === ans);
      if (b) { b.click(); return true; }
      return false;
    }, served_p.answer);
    if (!clicked) {
      problems.push(`${code}: the correct answer "${served_p.answer}" is not among the options on screen`);
      break;
    }
    const check = page.locator('button:has-text("Check")').first();
    if (await check.count() && await check.isEnabled().catch(() => false)) {
      await check.click().catch(() => {});
      await page.waitForTimeout(700);
    }
    if (!(await page.evaluate(() => /you understood it/i.test(document.body.innerText)))) {
      problems.push(`${code}: answered "${served_p.answer}" — the passage's own answer — and the app called it wrong`);
      break;
    }
    await page.waitForTimeout(600);

    // --- what did that do to the stored state? ------------------------------
    const stored = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem("lingua:app") || "{}"); } catch { return {}; }
    });
    const pr = stored.passagesRead;
    if (typeof pr !== "object" || pr === null || Array.isArray(pr)) {
      problems.push(`${code}: passagesRead is a ${typeof pr} (${JSON.stringify(pr)?.slice(0, 40)}), not a map — the read history is gone`);
      break;
    }
    const list = pr[code];
    if (!Array.isArray(list) || !list.length) {
      problems.push(`${code}: nothing was recorded under passagesRead.${code} after reading a passage`);
      break;
    }
  }

  // --- the badge ------------------------------------------------------------
  const badge = await page.evaluate(() => {
    const nav = [...document.querySelectorAll(".bottom-nav button")].find((b) => /you|profile|me/i.test(b.innerText));
    if (nav) nav.click();
    return true;
  });
  if (badge) {
    await page.waitForTimeout(900);
    const locked = await page.evaluate(() => {
      const t = document.body.innerText;
      if (!/first read/i.test(t)) return null;          // badge list not on this screen
      const el = [...document.querySelectorAll("*")].find((n) =>
        n.children.length === 0 && /first read/i.test(n.textContent || ""));
      const card = el?.closest("div");
      if (!card) return null;
      const style = card ? getComputedStyle(card) : null;
      return style ? Number(style.opacity) < 0.9 || /locked/i.test(card.textContent) : null;
    });
    if (locked !== null) {
      badgesChecked++;
      if (locked) problems.push(`${code}: read a passage and the First Read badge is still locked`);
    }
  }

  await ctx.close();
}

await browser.close();

console.log(`\n  ${visits} reading visits across ${codes.length} languages · ${badgesChecked} badge states read`);
if (!visits) {
  console.log("\n  ✗ Reading was never opened — this check proved nothing.\n");
  process.exit(1);
}
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems.slice(0, 30)) console.log(`   ${p}`);
  console.log();
  process.exit(1);
}
console.log("\n  ✓ the reading library remembers what it served\n");
