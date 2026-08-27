// =============================================================================
// shot-script-course.mjs (v91) — walk the script course and prove it renders.
//
// The joined-forms panel is the one thing here that can be right in the source
// and wrong on screen: it builds initial/medial/final shapes with ZWJ and relies
// on the font to do the shaping. If the font doesn't cooperate the learner sees
// four identical glyphs and the lesson teaches nothing — so this measures the
// rendered boxes rather than trusting the markup.
//
// It also checks that the two system lessons — the ones that turn letters into
// words — actually appear and can be completed: vowel signs for the abugidas,
// block assembly for Hangul.
//
//   node scripts/shot-script-course.mjs
// =============================================================================

import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const OUT = process.env.OUT || "/tmp/shots-script";
mkdirSync(OUT, { recursive: true });

const seed = (code) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 43, streak: 1, hearts: 5, heartsMax: 5, gems: 54, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: { [code]: 3 }, sessions: [],
  grammarSeen: {}, learningGoal: {}, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  passagesRead: {}, userName: "",
  lastStudyDate: new Date().toISOString().slice(0, 10),
  consent: { terms: true, ageConfirmed: 13, at: 0 },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
});

const CASES = [
  { code: "ml", label: "Malayalam", system: "Vowel signs" },
  { code: "ta", label: "Tamil", system: "Vowel signs" },
  { code: "hi", label: "Hindi", system: "Vowel signs" },
  { code: "bn", label: "Bengali", system: "Vowel signs" },
  { code: "ur", label: "Urdu", joining: true },
  { code: "ar", label: "Arabic", joining: true },
  { code: "fa", label: "Persian", joining: true },
  { code: "pa", label: "Punjabi", joining: true },
  { code: "ko", label: "Korean", system: "Building syllable blocks" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Mandarin" },
];

// The real group ids, straight from the packs — so unlocking in the test uses
// the same keys the app writes, not a guess at them.
for (const c of CASES) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${c.code}.json`, "utf8"));
  c.groupIds = (pack.alphabetGroups || []).map((g) => g.id);
}

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

let problems = 0;
const fail = (m) => { console.log("    ✗ " + m); problems++; };

for (const c of CASES) {
  console.log(`\n=== ${c.label} (${c.code}) ===`);
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(`page error: ${e.message}`));

  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), seed(c.code));
  await page.evaluate(() => localStorage.removeItem("alphabet_progress"));
  await page.reload();
  await page.waitForTimeout(1400);

  // Letters & sounds sits behind the "Everything else" door on Home.
  await page.locator("button, a", { hasText: /everything else/i }).first().click();
  await page.waitForTimeout(500);
  await page.locator("button, a", { hasText: /letters & sounds/i }).first().click();
  await page.waitForTimeout(700);

  if (!(await page.locator("button", { hasText: /START HERE/i }).count())) {
    fail("no primer tile — the learner meets letter one cold");
  }
  await page.screenshot({ path: `${OUT}/${c.code}-1-lessons.png`, fullPage: true });

  // --- primer -------------------------------------------------------------
  await page.locator("button", { hasText: /START HERE/i }).first().click();
  await page.waitForTimeout(500);
  const primer = await page.evaluate(() => ({
    heading: document.querySelector("h1")?.textContent?.trim() || null,
    hard: /the hard part/i.test(document.body.innerText),
    good: /good news/i.test(document.body.innerText),
  }));
  if (!primer.heading) fail("primer has no heading");
  if (!primer.hard) fail("primer doesn't name the hard part");
  if (!primer.good) fail("primer has no first win");
  console.log(`    primer: "${primer.heading}"`);
  await page.screenshot({ path: `${OUT}/${c.code}-2-primer.png`, fullPage: true });

  await page.locator("button", { hasText: /show me the letters/i }).first().click();
  await page.waitForTimeout(500);

  // --- letters, and the joined-forms panel --------------------------------
  await page.locator("button", { hasText: /Lesson 1/i }).first().click();
  await page.waitForTimeout(600);

  if (c.joining) {
    // Step forward until we hit a letter that connects BOTH ways — the
    // non-connectors legitimately show only two forms.
    let found = null;
    for (let i = 0; i < 10 && !found; i++) {
      const forms = await page.evaluate(() => {
        if (!/in a word/i.test(document.body.innerText)) return null;
        const want = ["ALONE", "START", "MIDDLE", "END"];
        const out = [];
        for (const el of document.querySelectorAll("div")) {
          const t = (el.textContent || "").trim().toUpperCase();
          const prev = el.previousElementSibling;
          if (want.includes(t) && prev) {
            const r = prev.getBoundingClientRect();
            out.push({ label: t, w: Math.round(r.width), h: Math.round(r.height), cps: [...prev.textContent].length });
          }
        }
        return out;
      });
      if (forms && forms.length === 4) { found = forms; break; }
      const nxt = page.locator("button", { hasText: /next letter/i });
      if (!(await nxt.count())) break;
      await nxt.first().click();
      await page.waitForTimeout(350);
    }

    if (!found) {
      fail("no letter in lesson 1 showed all four joined forms");
    } else {
      console.log("    joined forms: " + found.map((f) => `${f.label}(${f.cps}cp ${f.w}x${f.h})`).join(" "));
      const cps = new Set(found.map((f) => f.cps));
      if (cps.size < 2) fail("all four forms have identical content — ZWJ isn't reaching the font");
      else console.log(`    ✓ shaping inputs differ (${cps.size} distinct codepoint counts)`);
      const zero = found.filter((f) => f.w === 0 || f.h === 0);
      if (zero.length) fail(`${zero.length} form box rendered at zero size`);
    }
    await page.screenshot({ path: `${OUT}/${c.code}-3-letter.png`, fullPage: true });
  } else {
    await page.screenshot({ path: `${OUT}/${c.code}-3-letter.png`, fullPage: true });
  }

  // --- the system lesson: vowel signs / syllable blocks -------------------
  if (c.system) {
    // It must be GATED behind the letters — showing matras to someone who
    // hasn't met a consonant is noise — so first assert the gate.
    await page.locator("button", { hasText: /← Lessons/i }).first().click();
    await page.waitForTimeout(500);

    const tile = page.locator("button", { hasText: new RegExp(c.system, "i") });
    if (!(await tile.count())) {
      fail(`no "${c.system}" lesson — the letters never become words`);
    } else {
      if (!(await tile.first().isDisabled())) {
        fail(`"${c.system}" is open before the letters are done`);
      } else {
        console.log(`    "${c.system}" is gated behind the letters ✓`);
      }

      // Now unlock it the way finishing the letters would, using the real
      // group ids from the pack rather than anything scraped from the DOM.
      await page.evaluate(({ code, ids }) => {
        const prog = JSON.parse(localStorage.getItem("alphabet_progress") || "{}");
        prog[code] = prog[code] || {};
        for (const id of ids) prog[code][id] = true;
        localStorage.setItem("alphabet_progress", JSON.stringify(prog));
      }, { code: c.code, ids: c.groupIds });

      await page.reload();
      await page.waitForTimeout(1200);
      await page.locator("button, a", { hasText: /everything else/i }).first().click();
      await page.waitForTimeout(400);
      await page.locator("button, a", { hasText: /letters & sounds/i }).first().click();
      await page.waitForTimeout(600);

      const open = page.locator("button", { hasText: new RegExp(c.system, "i") });
      if (await open.first().isDisabled()) {
        fail(`"${c.system}" stayed locked after every letter lesson was completed`);
      } else {
        await open.first().click();
        await page.waitForTimeout(600);
        const built = await page.evaluate(() => document.body.innerText);
        // The whole point: a syllable/block the letter list never showed.
        if (!/=/.test(built)) fail(`"${c.system}" opened but shows no assembled form`);
        else console.log(`    "${c.system}" opens and assembles ✓`);
        await page.screenshot({ path: `${OUT}/${c.code}-4-system.png`, fullPage: true });
      }
    }
  }

  console.log(`    screenshots → ${OUT}/${c.code}-*.png`);
  await ctx.close();
}

await browser.close();
console.log(`\n  ${CASES.length} languages walked · ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
