// =============================================================================
// verify-motion.mjs (v96) — the bars still fill, and reduced motion is obeyed.
//
// v96 changed every progress bar from growing its width to sliding a full-width
// fill. That is invisible in the CSS and very visible if it is wrong: a bar
// stuck empty, stuck full, or spilling past its track.
//
// So this measures the painted geometry — where the fill actually sits inside
// its track — rather than trusting the stylesheet. And it checks that with
// prefers-reduced-motion set, the infinite animations really do stop, which is
// the accessibility half of the same change.
//
//   node scripts/verify-motion.mjs
// =============================================================================

import { chromium } from "playwright";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const seed = {
  onboarded: true, currentLanguage: "ur", tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 420, streak: 3, hearts: 5, heartsMax: 5, gems: 50, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: { ur: 9 }, sessions: [],
  grammarSeen: {}, learningGoal: {}, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  passagesRead: {}, userName: "",
  lastStudyDate: new Date().toISOString().slice(0, 10),
  consent: { terms: true, ageConfirmed: 13, at: 0 },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let problems = 0;
const fail = (m) => { console.log("  ✗ " + m); problems++; };

// --- 1. the bars are painted where they should be ---------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), seed);
  await page.reload();
  await page.waitForTimeout(1800);

  const bars = await page.evaluate(() => {
    const out = [];
    for (const fill of document.querySelectorAll(".hairline-fill, .dim-fill, .bar-fill")) {
      const track = fill.parentElement;
      const f = fill.getBoundingClientRect(), t = track.getBoundingClientRect();
      if (t.width < 4) continue;                      // off-screen / collapsed
      const declared = getComputedStyle(fill).getPropertyValue("--fill").trim();
      out.push({
        cls: fill.className,
        declared,
        // how much of the track the fill visually covers, 0..1
        covered: Math.max(0, Math.min(t.right, f.right) - t.left) / t.width,
        overflowsRight: f.right > t.right + 1,
      });
    }
    return out;
  });

  if (!bars.length) fail("no progress bars found on Home — nothing was verified");
  else {
    console.log(`  ${bars.length} progress bar(s) painted:`);
    for (const b of bars) {
      const pct = Math.round(b.covered * 100);
      const want = b.declared ? Number(b.declared.replace("%", "")) : null;
      const ok = want === null || Math.abs(pct - want) <= 3;
      console.log(`    ${ok ? "✓" : "✗"} ${b.cls.split(" ")[0].padEnd(16)} declared ${b.declared || "(inline)"} · covers ${pct}% of its track`);
      if (!ok) fail(`${b.cls}: declared ${b.declared} but covers ${pct}%`);
      if (b.overflowsRight) fail(`${b.cls}: fill spills past the right edge of its track`);
    }
    if (bars.every((b) => b.covered === 0)) fail("every bar is empty — the fills are not being positioned");
    if (bars.every((b) => b.covered >= 0.99)) fail("every bar is full — --fill is not reaching the CSS");
  }
  await ctx.close();
}

// --- 2. reduced motion actually stops the endless animations ----------------
for (const reduced of [false, true]) {
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), seed);
  await page.reload();
  await page.waitForTimeout(1600);

  const running = await page.evaluate(() =>
    document.getAnimations().filter((a) => {
      const d = a.effect?.getTiming?.();
      return a.playState === "running" && (d?.iterations === Infinity || (d?.duration || 0) > 100);
    }).length);

  console.log(`  prefers-reduced-motion: ${reduced ? "reduce" : "no-preference"} — ${running} animation(s) running`);
  if (reduced && running > 0) {
    fail(`${running} animations still running with reduced motion requested`);
  }
  if (!reduced && running === 0) {
    console.log("    (none running at this instant — one-shot entrances may have finished)");
  }
  await ctx.close();
}

// --- 3. the flashcard genuinely turns --------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify({ ...s, lessonsCompleted: {} })), seed);
  await page.reload();
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")]
      .find((x) => !x.disabled && /Learn this|Continue|Start/i.test(x.textContent || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(1400);
  for (let i = 0; i < 12; i++) {
    if (await page.locator(".card-turn").count()) break;
    await page.evaluate(() => {
      for (const re of [/^Check$/i, /^Continue$/i, /^Got it$/i, /^Next$/i]) {
        const b = [...document.querySelectorAll("button")].find((x) => !x.disabled && re.test((x.textContent || "").trim()));
        if (b) { b.click(); return; }
      }
      const any = [...document.querySelectorAll("button")].filter((b) => !b.disabled);
      if (any.length) any[any.length - 1].click();
    });
    await page.waitForTimeout(450);
  }

  if (!(await page.locator(".card-turn").count())) {
    fail("no flashcard on screen — the card turn was not verified");
  } else {
    const scene = await page.evaluate(() => {
      const el = document.querySelector(".card-turn");
      return { perspective: getComputedStyle(el.parentElement).perspective };
    });
    if (scene.perspective === "none") fail("the card has no perspective — a rotation will look flat");
    else console.log(`  card scene perspective: ${scene.perspective}`);

    // Flip it, then sample the transform WHILE the animation is playing.
    await page.locator(".card-turn").first().focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(90);
    const mid = await page.evaluate(() => {
      const el = document.querySelector(".card-turn");
      if (!el) return null;
      const anims = el.getAnimations().map((a) => a.animationName || a.effect?.getKeyframes?.().length);
      return { transform: getComputedStyle(el).transform, anims };
    });
    if (!mid) fail("the card vanished during the flip");
    else if (!/matrix3d|matrix/.test(mid.transform) || mid.transform === "none") {
      fail(`no transform during the flip (got "${mid.transform}") — the card is still swapping, not turning`);
    } else {
      console.log(`  mid-flip transform: ${mid.transform.slice(0, 58)}…`);
      console.log("  ✓ the card turns rather than swapping");
    }
  }
  await ctx.close();
}

await browser.close();
console.log(`\n  ${problems} problem${problems === 1 ? "" : "s"}\n`);
process.exit(problems ? 1 : 0);
