// =============================================================================
// verify-listen.mjs (v106) — Listen and repeat actually walks through words.
//
// The screen is a loop of awaits: play the word, pause, say the meaning, play
// it again, next. If any await never resolves, the loop just stops, silently,
// on "Listen". That is exactly what tts.js did for every word with a recorded
// MP3 until v106, so this drives the real screen in Arabic — which ships
// recordings — and checks that:
//
//   · Start moves through all four phases on the first word
//   · a recorded clip was actually requested (the MP3 path ran, not only TTS)
//   · the loop reaches word 2 and 3 on its own, hands off
//   · Pause stops it: the word count doesn't move afterwards
//   · Urdu, which has no recordings, advances too (browser-voice path)
//   · nothing scrolls sideways at 360px
//
// PROVEN CAPABLE OF FAILING: with the pre-v106 tryPlayMp3 restored, every
// recorded clip hangs until the screen's own 6 s per-word ceiling rescues it,
// and the Arabic run fails to reach word 3 in 24 s ("loop stalled").
//
//   (cd dist && python3 -m http.server 4173) &
//   node scripts/verify-listen.mjs
// =============================================================================

import { chromium } from "playwright";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CODES = (process.env.ONLY || "ar,ur").split(",");

const seed = (code) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 420, streak: 3, hearts: 5, heartsMax: 5, gems: 50, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: { [code]: 6 }, sessions: [],
  grammarSeen: {}, learningGoal: {}, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  passagesRead: {}, userName: "", soundEffects: false,
  lastStudyDate: new Date().toISOString().slice(0, 10),
  consent: { terms: true, ageConfirmed: 13, at: 0, policyVersion: "2026-08-06" },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
});

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--autoplay-policy=no-user-gesture-required"],
});
let problems = 0;
const fail = (m) => { console.log("    ✗ " + m); problems++; };
const clickText = (page, re) => page.evaluate((src) => {
  const rx = new RegExp(src, "i");
  const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent !== null && rx.test(x.textContent || ""));
  if (b) b.click();
  return !!b;
}, re.source);

for (const code of CODES) {
  console.log(`\n=== ${code} ===`);
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(`page error: ${e.message}`));
  const clips = new Set();
  page.on("request", (r) => { const m = r.url().match(/\/audio\/[a-z]+\/([^/]+)\.mp3/); if (m) clips.add(m[1]); });

  await page.goto(BASE);
  await page.evaluate((s) => { localStorage.setItem("lingua:app", JSON.stringify(s)); localStorage.setItem("lingua:progress", "{}"); }, seed(code));
  await page.reload();
  await page.waitForTimeout(1300);
  await clickText(page, /everything else/);
  await page.waitForTimeout(600);
  if (!(await clickText(page, /Listen and repeat/))) { fail("no 'Listen and repeat' door in Practice"); await ctx.close(); continue; }
  await page.waitForSelector("[data-testid=listen-word]", { timeout: 5000 }).catch(() => {});

  const read = () => page.evaluate(() => ({
    phase: document.querySelector("[data-testid=listen-phase]")?.textContent?.trim(),
    count: document.querySelector("[data-testid=listen-count]")?.textContent?.trim(),
    word: document.querySelector("[data-testid=listen-word]")?.textContent?.trim(),
    overflow: document.scrollingElement.scrollWidth - window.innerWidth,
  }));

  const first = await read();
  if (!first.word) { fail("listen screen shows no word"); await ctx.close(); continue; }
  if (first.overflow > 0) fail(`screen scrolls sideways by ${first.overflow}px at 360px`);

  await clickText(page, /Start/);
  // Watch the phases for the first word, then wait for the loop to move on.
  const phases = new Set();
  const counts = new Set();
  const until = Date.now() + 24000;
  while (Date.now() < until) {
    const s = await read();
    if (s.phase) phases.add(s.phase);
    counts.add(s.count);
    if (counts.has("Word 3 of 12") || [...counts].some((c) => /Word 3 of/.test(c))) break;
    await page.waitForTimeout(150);
  }
  for (const p of ["Listen", "Say it aloud", "It means", "Once more"]) {
    if (!phases.has(p)) fail(`never showed the "${p}" phase`);
  }
  const reached3 = [...counts].some((c) => /Word 3 of/.test(c));
  if (!reached3) fail(`loop stalled — only reached ${[...counts].join(" → ")} in 24s`);
  else console.log(`    ✓ phases ${[...phases].join(" → ")}; reached ${[...counts].filter(Boolean).pop()} hands-off`);

  if (code === "ar") {
    if (!clips.size) fail("no recorded clip was requested — the MP3 path didn't run");
    else console.log(`    ✓ recorded clips played: ${[...clips].slice(0, 4).join(", ")}`);
  }

  await clickText(page, /Pause/);
  await page.waitForTimeout(200);
  const paused = await read();
  await page.waitForTimeout(3500);
  const later = await read();
  if (paused.phase !== "Ready") fail(`after Pause the phase reads "${paused.phase}", expected "Ready"`);
  if (paused.count !== later.count) fail(`Pause didn't stop the loop: ${paused.count} → ${later.count}`);
  else console.log(`    ✓ Pause holds at ${later.count}`);

  await ctx.close();
}

await browser.close();
console.log(`\n  ${CODES.length} languages · ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
