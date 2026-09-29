// =============================================================================
// verify-rush.mjs (v109) — Word Rush, played in a real browser.
//
// Plays a short round (12 s, passed as a navigation param) in Urdu, Spanish
// and Japanese, answering from the language pack so the test knows what is
// right:
//   · six correct answers score 1+1+2+2+2+3 = 11 (the ×2 at three in a row,
//     ×3 at six), and the combo shows
//   · a deliberate miss scores nothing, resets the combo, and shows the right
//     answer
//   · keys 1–4 answer
//   · when the clock runs out: the score, the missed word listed, the best
//     score saved, XP added and a session logged (so it counts for today)
//   · "Practise … properly" opens a lesson given exactly the missed word
//     (that the session then covers it is test-games' job)
//   · English → word direction plays too; nothing scrolls sideways at 360px
//
// PROVEN CAPABLE OF FAILING: with comboMultiplier returning 1, it reports
// "six right … should score 11, the screen says 6" and the missing ×3.
//
//   (cd dist && python3 -m http.server 4173) &
//   node scripts/verify-rush.mjs
// =============================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CODES = (process.env.ONLY || "ur,es,ja").split(",");
const DAY = 86400000;
let problems = 0;
const fail = (m) => { console.log("    ✗ " + m); problems++; };
const ok = (m) => console.log("    ✓ " + m);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

for (const code of CODES) {
  console.log(`\n=== ${code} ===`);
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const now = Date.now();
  const progress = {};
  pack.vocab.slice(0, 20).forEach((v) => { progress[v.id] = { difficulty: 5, stability: 5, reps: 3, lapses: 0, lastReview: now - 3 * DAY, nextReview: now + DAY, lastRating: 3 }; });
  const byLemma = new Map();
  for (const v of pack.vocab) (byLemma.get(v.lemma) || byLemma.set(v.lemma, []).get(v.lemma)).push(v);
  const byMeaning = new Map();
  for (const v of pack.vocab) (byMeaning.get(v.translation) || byMeaning.set(v.translation, []).get(v.translation)).push(v);

  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(`page error: ${e.message}`));
  await page.goto(BASE);
  await page.evaluate(([c, p]) => {
    localStorage.setItem("lingua:app", JSON.stringify({
      onboarded: true, currentLanguage: c, tutorialSeen: true, totalXp: 100, streak: 1, soundEffects: false,
      lessonsCompleted: { [c]: 5 }, scriptCourse: { [c]: { passed: true } },
      consent: { terms: true, ageConfirmed: 13, at: 0, policyVersion: "2026-08-06" },
    }));
    localStorage.setItem("lingua:progress", JSON.stringify({ [c]: p }));
  }, [code, progress]);

  const open = async (params) => {
    await page.evaluate((prm) => sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: [{ screen: "home" }, { screen: "rush", params: prm }], index: 0 })), params);
    await page.reload();
    await page.waitForTimeout(700);
    await page.evaluate(() => { history.pushState({ linguaIndex: 1 }, ""); history.pushState({ linguaIndex: 99 }, ""); history.back(); });
    await page.waitForSelector("text=Word Rush", { timeout: 6000 }).catch(() => {});
  };

  // The right option for what's on screen, from the pack.
  const rightIndex = async (dir) => {
    const { prompt, options } = await page.evaluate(() => ({
      prompt: document.querySelector("[data-testid=rush-prompt]")?.textContent.trim(),
      options: [...document.querySelectorAll("[data-testid=rush-options] button")].map((b) => b.textContent.replace(/^\d/, "").trim()),
    }));
    const cands = dir === "meaning" ? (byLemma.get(prompt) || []).map((v) => v.translation) : (byMeaning.get(prompt) || []).map((v) => v.lemma);
    return { prompt, options, idx: options.findIndex((o) => cands.includes(o)) };
  };
  const click = (i) => page.evaluate((i) => document.querySelectorAll("[data-testid=rush-options] button")[i].click(), i);
  const liveScore = () => page.evaluate(() => Number(document.querySelector("[data-testid=rush-live-score]")?.textContent));

  await open({ seconds: 12 });
  const best0 = await page.evaluate(() => document.querySelector("[data-testid=rush-best]")?.textContent);
  if (best0 !== "0") fail(`a first game should show best 0, showed "${best0}"`);
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Start")?.click());
  await page.waitForTimeout(300);

  // Six right.
  let rights = 0;
  for (let i = 0; i < 6; i++) {
    const r = await rightIndex("meaning");
    if (r.idx < 0) { fail(`couldn't find the right answer for "${r.prompt}" among [${r.options.join(" | ")}]`); break; }
    await click(r.idx);
    rights++;
    await page.waitForTimeout(380);
  }
  const s6 = await liveScore();
  if (s6 !== 11) fail(`six right in a row should score 1+1+2+2+2+3 = 11, the screen says ${s6}`);
  else ok("six right score 11 — the multiplier steps at three and six in a row");
  const combo = await page.evaluate(() => document.body.innerText.includes("×3"));
  if (!combo) fail("the ×3 combo isn't shown after six in a row");

  // One deliberate miss.
  const miss = await rightIndex("meaning");
  const wrongIdx = [0, 1, 2, 3].find((i) => i !== miss.idx);
  await click(wrongIdx);
  await page.waitForTimeout(150);
  const shown = await page.evaluate((idx) => {
    const b = document.querySelectorAll("[data-testid=rush-options] button")[idx];
    return b ? getComputedStyle(b).borderColor : "";
  }, miss.idx);
  const afterMiss = await liveScore();
  if (afterMiss !== 11) fail(`a miss changed the score to ${afterMiss}`);
  if (!shown) fail("after a miss the right answer isn't marked");
  const missedWord = (byLemma.get(miss.prompt) || [])[0];
  await page.waitForTimeout(1000);

  // One by keyboard.
  const kb = await rightIndex("meaning");
  if (kb.idx >= 0) {
    await page.keyboard.press(String(kb.idx + 1));
    await page.waitForTimeout(350);
    const s = await liveScore();
    if (s !== 12) fail(`a correct answer by keyboard after a miss should make it 12 (combo reset to ×1), it's ${s}`);
    else ok("a miss resets the combo; key " + (kb.idx + 1) + " answers");
  }

  // Let the clock run out.
  await page.waitForSelector("[data-testid=rush-score]", { timeout: 15000 }).catch(() => {});
  const res = await page.evaluate(() => ({
    score: document.querySelector("[data-testid=rush-score]")?.textContent,
    missed: document.querySelector("[data-testid=rush-missed]")?.innerText || "",
    overflow: document.scrollingElement.scrollWidth - window.innerWidth,
  }));
  if (!res.score) { fail("the round never ended"); await ctx.close(); continue; }
  if (missedWord && !res.missed.includes(missedWord.translation)) fail(`the missed word "${missedWord.translation}" isn't in "the ones that got away"`);
  else ok(`round over: ${res.score} points; "${missedWord?.translation}" listed as missed`);
  if (res.overflow > 1) fail(`results scroll sideways by ${res.overflow}px`);
  await page.waitForTimeout(400);
  const saved = await page.evaluate(() => ({ app: JSON.parse(localStorage.getItem("lingua:app")), sessions: JSON.parse(localStorage.getItem("lingua:sessions") || "[]") }));
  const bestSaved = saved.app.gameBest?.[code]?.["rush-meaning"];
  if (String(bestSaved) !== res.score) fail(`best score saved as ${bestSaved}, the round scored ${res.score}`);
  if (!(saved.app.totalXp > 100)) fail(`XP didn't go up (${saved.app.totalXp})`);
  if (!saved.sessions.some((s) => s.mode === "rush")) fail("no session logged — the round won't count toward today's goal");
  else ok(`best ${bestSaved} saved · XP ${saved.app.totalXp} · session logged`);

  // Practise the missed one.
  const practised = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /properly/.test(x.textContent));
    if (b) b.click();
    return !!b;
  });
  if (!practised) fail('no "Practise … properly" button');
  else {
    await page.waitForTimeout(1500);
    // The lesson mixes in review of other words, so its first screens needn't
    // be the missed one (test-games checks the session covers it). What only
    // the browser can show: a real lesson opened, asked for exactly this word.
    const nav = await page.evaluate(() => JSON.parse(sessionStorage.getItem("lingua:nav") || "{}"));
    const entry = nav.stack?.[nav.index];
    const lessonOpen = await page.evaluate(() => !!document.querySelector("#main") && !/Word Rush/.test(document.querySelector("#main").innerText) && /✕/.test(document.querySelector("#main").innerText));
    if (entry?.screen !== "lesson" || entry?.params?.mode !== "words") fail(`"Practise … properly" opened ${entry?.screen} (${JSON.stringify(entry?.params)}), not a words lesson`);
    else if (!missedWord || !entry.params.filter?.vocabIds?.includes(missedWord.id)) fail(`the practice lesson wasn't given the missed word ${missedWord?.id} — got ${JSON.stringify(entry.params.filter)}`);
    else if (!lessonOpen) fail("the practice lesson didn't open");
    else ok(`“Practise … properly” opens a lesson on ${missedWord.id} (${missedWord.translation})`);
  }

  // The other direction.
  await open({ seconds: 6 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /English →/.test(b.textContent))?.click());
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Start")?.click());
  await page.waitForTimeout(300);
  const w = await rightIndex("word");
  if (w.idx < 0) fail(`English → word: couldn't find "${w.prompt}" among [${w.options.join(" | ")}]`);
  else { await click(w.idx); await page.waitForTimeout(350); if ((await liveScore()) !== 1) fail("English → word: a right answer didn't score"); else ok("English → word plays"); }

  await ctx.close();
}

await browser.close();
console.log(`\n  ${CODES.length} languages · ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
