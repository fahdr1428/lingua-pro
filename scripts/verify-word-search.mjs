// =============================================================================
// verify-word-search.mjs (v104) — can you find a word on the screen called
// "My words"?
//
// THE CRASH
//
// The filter was:
//
//   !v.translation.toLowerCase().includes(q) && !v.translit.toLowerCase().includes(q)
//
// `translit` is absent on Latin-script words — 612 of them across ten
// languages, and in Vietnamese, Yoruba, Somali and Tagalog it is absent from
// EVERY word in the pack. So as soon as a query failed to match a translation,
// `.toLowerCase()` ran on undefined and the screen fell through to the error
// boundary. In those four languages that was the first keystroke, every time:
//
//   😵 Something went wrong — Cannot read properties of undefined (reading 'toLowerCase')
//
// THE TWO THINGS IT NEVER DID
//
//   · It never searched the word itself, only its English gloss. You could not
//     find "hola" in a Spanish pack — on the screen called "My words".
//   · It matched literally. Nobody looking for "chào" on an English keyboard
//     is going to type the grave accent, and Yoruba would need a sub-dot and
//     two tone marks. The query and the text are now both folded to bare
//     letters, so "chao" finds "chào" and an exactly-typed query still works.
//
// PROVEN CAPABLE OF FAILING: against the v103 build every language in CASES
// reports the crash, and every lemma query returns nothing.
//
//   npm run build && (cd dist && python3 -m http.server 4173 &)
//   npm run verify-word-search
// =============================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { foldForSearch } from "../src/data/searchText.js";

const BASE = process.env.BASE || "http://localhost:4173";

// Each case: a language, a query someone would plausibly type on an English
// keyboard, and at least one word it must find. The expectations are checked
// against the pack itself first, so a content change that removes a word fails
// loudly here rather than quietly weakening the test.
const CASES = [
  ["vi", "chao", 1],       // chào / xin chào — typed without the tone mark
  ["vi", "cam on", 1],     // cảm ơn
  ["yo", "oko", 2],        // ọkọ̀ vehicle · ọkọ husband · oko farm
  ["yo", "bawo", 1],       // báwo ni
  ["so", "nabad", 1],
  ["tl", "salamat", 1],
  ["es", "hola", 1],       // the lemma, which the old filter never looked at
  ["tr", "degil", 1],      // değil, typed without the cedilla-g
  ["ur", "shukriya", 1],   // a non-Latin pack, matched on its romanisation
];

const problems = [];
let searches = 0;

function seed(code) {
  return JSON.stringify({
    onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
    totalXp: 800, streak: 3, hearts: 5, heartsMax: 5, gems: 50, isPremium: true,
    theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
    lessonsCompleted: { [code]: 8 }, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: { [code]: [1, 2] }, sentenceDropsDone: { [code]: 3 },
    lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {}, passagesRead: {},
  });
}

// --- 0. do the packs still contain what the cases expect? -------------------
for (const [code, query, atLeast] of CASES) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const q = foldForSearch(query);
  const hits = (pack.vocab || []).filter((v) =>
    foldForSearch(v.lemma).includes(q) ||
    foldForSearch(v.translation).includes(q) ||
    foldForSearch(v.translit).includes(q)).length;
  if (hits < atLeast) {
    problems.push(`${code}/"${query}": the pack itself only has ${hits} match(es), expected ${atLeast} — the case is stale, not the app`);
  }
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

const byLanguage = new Map();
for (const c of CASES) {
  if (!byLanguage.has(c[0])) byLanguage.set(c[0], []);
  byLanguage.get(c[0]).push(c);
}

console.log("");
for (const [code, cases] of byLanguage) {
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  const crashes = [];
  page.on("pageerror", (e) => crashes.push(String(e?.message || e).slice(0, 100)));

  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate((s) => localStorage.setItem("lingua:app", s), seed(code));
  await page.reload();
  await page.waitForTimeout(1300);

  // Practice tab → My words
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".bottom-nav button")].find((x) => /practice/i.test(x.innerText || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /📚/.test(x.innerText || "") || /my words/i.test(x.innerText || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(800);

  const box = page.locator('input[type="search"]').first();
  if (!(await box.count())) {
    problems.push(`${code}: no search box on the word list`);
    await ctx.close();
    continue;
  }

  let screenGone = false;
  for (const [, query, atLeast] of cases) {
    await box.fill(query).catch(() => { screenGone = true; });
    if (screenGone) {
      problems.push(`${code}: the search box vanished mid-run — the error boundary had already replaced the screen`);
      break;
    }
    await page.waitForTimeout(500);
    searches++;

    const state = await page.evaluate(() => {
      const t = document.body.innerText;
      const m = /(\d+) words · (\d+) shown/.exec(t);
      return { broken: /something went wrong/i.test(t), shown: m ? Number(m[2]) : null };
    });

    if (state.broken) {
      problems.push(`${code}: typing "${query}" took the whole screen down — ${crashes[0] || "error boundary"}`);
      screenGone = true;
      break;   // the screen is gone; further queries in this language prove nothing
    }
    if (state.shown === null) {
      problems.push(`${code}: could not read the result count after searching "${query}"`);
    } else if (state.shown < atLeast) {
      problems.push(`${code}: "${query}" found ${state.shown} word(s), expected at least ${atLeast}`);
    } else {
      console.log(`    ${code}  "${query}"`.padEnd(22) + `${state.shown} found`);
    }
  }

  // A query that should match nothing must produce an empty list, not a crash
  // and not everything. Skipped when the screen is already down — typing into
  // a box the error boundary has removed throws a timeout, which reads as the
  // harness failing rather than the app, and hides the finding above it.
  if (screenGone) { await ctx.close(); continue; }
  await box.fill("zzqqxx");
  await page.waitForTimeout(400);
  const none = await page.evaluate(() => {
    const m = /(\d+) words · (\d+) shown/.exec(document.body.innerText);
    return { broken: /something went wrong/i.test(document.body.innerText), shown: m ? Number(m[2]) : null };
  });
  if (none.broken) problems.push(`${code}: a query that matches nothing crashed the screen`);
  else if (none.shown !== 0) problems.push(`${code}: a nonsense query showed ${none.shown} words instead of none`);

  await ctx.close();
}

await browser.close();

console.log(`\n  ${searches} searches across ${byLanguage.size} languages`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems) console.log(`   ${p}`);
  console.log();
  process.exit(1);
}
console.log("  ✓ the word list is searchable by the word, in every script, without the marks\n");
