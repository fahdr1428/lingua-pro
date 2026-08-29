// =============================================================================
// verify-new-doors.mjs (v95) — the culture and conversation screens must open.
//
// Persian, Malayalam, Tamil, Somali and Tagalog had no culture notes and no
// scripted conversations. Home gates the culture door on hasCulture(), so those
// learners never saw it at all; the Practice door was NOT gated, so it was
// offered and opened onto "no conversation starters for Tamil yet".
//
// Both now have content. Adding data proves nothing on its own — the door has
// to appear and the screen behind it has to render real text, so this drives
// both in a browser and reads what is on screen.
//
//   node scripts/verify-new-doors.mjs
// =============================================================================

import { chromium } from "playwright";
import { CULTURE } from "../src/data/culture.js";
import { CONVERSATIONS } from "../src/data/conversations.js";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CODES = (process.env.ONLY || "fa,ml,ta,so,tl").split(",");

const seed = (code) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 420, streak: 3, hearts: 5, heartsMax: 5, gems: 50, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: { [code]: 6 }, sessions: [],
  grammarSeen: {}, learningGoal: {}, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  passagesRead: {}, userName: "",
  lastStudyDate: new Date().toISOString().slice(0, 10),
  consent: { terms: true, ageConfirmed: 13, at: 0 },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
});

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let problems = 0;
const fail = (m) => { console.log("    ✗ " + m); problems++; };

for (const code of CODES) {
  console.log(`\n=== ${code} ===`);
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(`page error: ${e.message}`));
  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), seed(code));
  await page.reload();
  await page.waitForTimeout(1500);

  const openDoors = async () => {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button, a, [role=button]")]
        .find((x) => /everything else/i.test(x.textContent || ""));
      if (b) b.click();
    });
    await page.waitForTimeout(700);
  };

  // --- culture ------------------------------------------------------------
  await openDoors();
  const cultureDoor = await page.evaluate(() =>
    !!([...document.querySelectorAll("button, a, [role=button]")]
      .find((x) => /Inside \S/i.test(x.textContent || ""))));
  if (!cultureDoor) {
    fail("no 'Inside <language>' door on Home, though culture notes exist");
  } else {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button, a, [role=button]")]
        .find((x) => /Inside \S/i.test(x.textContent || ""));
      if (b) b.click();
    });
    await page.waitForTimeout(900);
    const text = await page.evaluate(() => document.body.innerText);
    const titles = CULTURE[code].map((e) => e.title);
    const shown = titles.filter((t) => text.includes(t));
    if (!shown.length) fail("culture screen opened but shows none of this language's notes");
    else console.log(`    ✓ culture: ${shown.length}/${titles.length} notes on screen — e.g. "${shown[0].slice(0, 46)}"`);
  }

  // --- conversations ------------------------------------------------------
  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), seed(code));
  await page.reload();
  await page.waitForTimeout(1400);
  await openDoors();

  const convoDoor = await page.evaluate(() =>
    !!([...document.querySelectorAll("button, a, [role=button]")]
      .find((x) => /Listen & follow/i.test(x.textContent || ""))));
  if (!convoDoor) {
    fail("no 'Listen & follow' door, though conversations exist");
  } else {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button, a, [role=button]")]
        .find((x) => /Listen & follow/i.test(x.textContent || ""));
      if (b) b.click();
    });
    await page.waitForTimeout(900);
    // Practice defaults to the reading tab when passages exist; these languages
    // have none, so it should land on conversations.
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")]
        .find((x) => !x.disabled && /Conversations/i.test(x.textContent || ""));
      if (b) b.click();
    });
    await page.waitForTimeout(800);
    const text = await page.evaluate(() => document.body.innerText);
    if (/No conversation starters/i.test(text)) {
      fail("Conversations still shows the empty state");
    } else {
      const sits = CONVERSATIONS[code].map((c) => c.situation);
      const shown = sits.filter((sname) => text.includes(sname));
      if (!shown.length) fail("Conversations opened but shows none of this language's situations");
      else console.log(`    ✓ conversations: ${shown.length}/${sits.length} situations on screen — e.g. "${shown[0]}"`);
    }
  }

  await ctx.close();
}

await browser.close();
console.log(`\n  ${CODES.length} languages · ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
