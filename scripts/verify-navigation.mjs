// =============================================================================
// verify-navigation.mjs (v104) — does back go back, and does the app know
// which way you are moving?
//
// WHAT THIS EXISTS FOR
//
// Before v104 this app never touched the history stack. Measured here, in this
// browser, against the shipped build:
//
//     home → Practice → Flashcards → browser back
//     AFTER BROWSER BACK -> url: about:blank
//
// `history.length` was 2 at the home screen and still 2 after two navigations.
// On Android and in any installed PWA the system back gesture IS that button,
// so back closed the app from every screen in it. That is the kind of bug that
// never appears in a bug report because the person assumes they did something
// wrong.
//
// WHAT IT ASSERTS, from the DOM and the real history stack:
//
//   1. Back from a deep screen returns to the previous screen IN the app.
//   2. Back from the home screen leaves — because that is correct, and a nav
//      stack that traps you is worse than one that does nothing.
//   3. Going forward runs a view transition typed `forward`; going back runs
//      one typed `back`. Without the type the CSS cannot tell the two apart and
//      every movement is the same movement.
//   4. The persistent chrome does not travel with the content. The bottom nav
//      has its own view-transition-name precisely so it stands still; without
//      it the whole app appears to come apart on every tap.
//   5. Scroll is restored coming back and reset going forward.
//   6. Under prefers-reduced-motion no view transition is started at all.
//
// PROVEN CAPABLE OF FAILING: run against the v103 build it reports
//   back from a deep screen left the app entirely (url about:blank)
//   forward navigation started no view transition
//
//   npm run build && (cd dist && python3 -m http.server 4173 &)
//   npm run verify-navigation
// =============================================================================

import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:4173";
const CODE = "ur";

const seed = JSON.stringify({
  onboarded: true, currentLanguage: CODE, tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 800, streak: 3, hearts: 5, heartsMax: 5, gems: 50, isPremium: true,
  theme: "cream", showRomanization: true, soundEffects: false, sessionSize: 10,
  lessonsCompleted: { [CODE]: 8 }, sessions: [], grammarSeen: {}, learningGoal: {},
  chaptersPassed: { [CODE]: [1, 2] }, sentenceDropsDone: { [CODE]: 3 },
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {}, passagesRead: {},
});

const problems = [];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

/** A page with startViewTransition wrapped so every call is recorded. */
async function openApp(context) {
  const page = await context.newPage();
  page.on("pageerror", (e) => problems.push(`page threw: ${String(e?.message || e).slice(0, 120)}`));
  await page.addInitScript(() => {
    window.__vt = [];
    window.__anims = [];
    const orig = document.startViewTransition?.bind(document);
    if (orig) {
      document.startViewTransition = (arg) => {
        window.__vt.push(arg && arg.types ? [...arg.types] : ["callback-form"]);
        const vt = orig(arg);
        // Record what is ACTUALLY animating the moment the transition is
        // ready. This is the only place the browser's own defaults are
        // visible, and they are what made v104's first attempt look broken.
        vt.ready.then(() => {
          for (const a of document.getAnimations()) {
            const pseudo = a.effect?.pseudoElement;
            if (pseudo && pseudo.includes("view-transition")) {
              window.__anims.push({ pseudo, name: a.animationName, ms: a.effect.getTiming().duration });
            }
          }
        }, () => {});
        return vt;
      };
    }
  });
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate((s) => {
    localStorage.setItem("lingua:app", s);
    localStorage.setItem("lingua:progress", "{}");
  }, seed);
  await page.reload();
  await page.waitForTimeout(1500);
  return page;
}

const screenText = (page) =>
  page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 60));

async function toPractice(page) {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".bottom-nav button")].find((x) => /practice/i.test(x.innerText || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(700);
}

async function toFlashcards(page) {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /📇/.test(x.innerText || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(700);
}

// ---------------------------------------------------------------------------
// 1-3. the stack, and the direction
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await openApp(ctx);

  const histAtHome = await page.evaluate(() => history.length);
  await toPractice(page);
  await toFlashcards(page);

  const histDeep = await page.evaluate(() => history.length);
  if (histDeep <= histAtHome) {
    problems.push(`two navigations added no history entries (${histAtHome} → ${histDeep}) — back cannot work`);
  }

  await page.goBack().catch(() => {});
  await page.waitForTimeout(800);
  if (page.url().startsWith("about:")) {
    problems.push(`back from a deep screen left the app entirely (url ${page.url()})`);
  } else if (!/practice/i.test(await screenText(page))) {
    problems.push(`back from Flashcards did not land on Practice — got "${await screenText(page)}"`);
  }

  await page.goBack().catch(() => {});
  await page.waitForTimeout(800);
  const home = await screenText(page);
  if (page.url().startsWith("about:")) {
    problems.push("back from Practice left the app instead of reaching home");
  } else if (!/good (morning|afternoon|evening)|your route/i.test(home)) {
    problems.push(`back from Practice did not land on home — got "${home}"`);
  }

  const types = await page.evaluate(() => window.__vt);
  const flat = types.map((t) => t.join("+"));
  if (!flat.some((t) => /forward/.test(t))) {
    problems.push(`forward navigation started no view transition typed "forward" — saw ${JSON.stringify(flat)}`);
  }
  if (!flat.some((t) => /back/.test(t))) {
    problems.push(`back navigation started no view transition typed "back" — saw ${JSON.stringify(flat)}`);
  }

  // 2. back from HOME should leave. A stack that traps you is worse than none.
  await page.goBack().catch(() => {});
  await page.waitForTimeout(600);
  if (!page.url().startsWith("about:")) {
    problems.push(`back from the home screen stayed in the app (url ${page.url()}) — that traps the person`);
  }

  await ctx.close();
}

// ---------------------------------------------------------------------------
// 3b. NOTHING IS LEFT TO THE BROWSER'S DEFAULTS
//
// This is the check that would have saved v104's first attempt, and it is here
// because "a transition ran" and "the transition looks right" are different
// claims and only the first one was being made.
//
// A view transition captures the WHOLE element, not the visible part. <main>
// is ~3000px tall on the home screen and ~1600px on Practice, and the UA's
// default `::view-transition-group` animation animates the group's box between
// those two heights while both snapshots are stretched to fill it. The entire
// page squashed vertically as it slid. The UA's default old/new animation is a
// cross-fade, which on two screens of dense text means you read both at once —
// frozen mid-flight it looks like a misregistered print job.
//
// Neither shows up in a screenshot of the finished screen. Both show up here:
// every animation on a view-transition pseudo-element must be one we wrote.
// UA animations are named `-ua-view-transition-...`, so the rule is simply
// that no animation name starts with `-ua-`.
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await openApp(ctx);
  await toPractice(page);
  await page.waitForTimeout(600);
  await page.goBack().catch(() => {});
  await page.waitForTimeout(700);

  const anims = await page.evaluate(() => window.__anims);
  if (!anims.length) {
    problems.push("no view-transition animations were recorded at all — this check proved nothing");
  }
  const ua = anims.filter((a) => /^-ua-/.test(a.name || ""));
  for (const a of ua) {
    problems.push(
      `${a.pseudo} is running the browser's default animation "${a.name}" (${a.ms}ms). ` +
      `The group default resizes the box between two page heights and squashes the content; ` +
      `the old/new default cross-fades two screens of text through each other. Neither is wanted.`
    );
  }
  // And the ones we DO run must be transform-only. An opacity fade between two
  // text screens is the double-exposure this release removed.
  const named = anims.filter((a) => !/^-ua-/.test(a.name || "")).map((a) => a.name);
  for (const want of ["pushInFromRight", "pushOutToLeft", "pushInFromLeft", "pushOutToRight"]) {
    if (!named.includes(want)) {
      problems.push(`expected the ${want} push animation to run across a forward+back pair; saw ${JSON.stringify([...new Set(named)])}`);
    }
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 4. the chrome holds still while the content travels
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await openApp(ctx);

  const navBefore = await page.evaluate(() => {
    const n = document.querySelector(".bottom-nav");
    return n ? n.getBoundingClientRect().top : null;
  });
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".bottom-nav button")].find((x) => /practice/i.test(x.innerText || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(140);   // mid-flight

  const mid = await page.evaluate(() => ({
    active: document.documentElement.matches(":active-view-transition"),
    navTop: document.querySelector(".bottom-nav")?.getBoundingClientRect().top ?? null,
    named: getComputedStyle(document.querySelector(".bottom-nav")).viewTransitionName,
  }));
  if (!mid.active) {
    problems.push("sampled mid-navigation and no view transition was running — cannot judge the chrome");
  }
  if (mid.named === "none" || !mid.named) {
    problems.push("the bottom nav has no view-transition-name, so it travels with the content and the app comes apart");
  }
  if (navBefore !== null && mid.navTop !== null && Math.abs(navBefore - mid.navTop) > 2) {
    problems.push(`the bottom nav moved ${Math.round(Math.abs(navBefore - mid.navTop))}px during a screen change`);
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 5. scroll: top going forward, where you left it coming back
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await openApp(ctx);

  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  const parked = await page.evaluate(() => window.scrollY);
  if (parked < 100) {
    problems.push(`the home screen would not scroll (scrollY ${parked}) — scroll memory cannot be measured`);
  }

  await toPractice(page);
  await page.waitForTimeout(600);
  const afterForward = await page.evaluate(() => window.scrollY);
  if (afterForward > 40) {
    problems.push(`going forward kept the old scroll position (${afterForward}px) — a new screen should start at the top`);
  }

  await page.goBack().catch(() => {});
  await page.waitForTimeout(900);
  const afterBack = await page.evaluate(() => window.scrollY);
  if (parked >= 100 && Math.abs(afterBack - parked) > 60) {
    problems.push(`coming back landed at ${afterBack}px, not the ${parked}px you left from — the place was thrown away`);
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 5b. tapping the tab you are already on returns you to the top
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await openApp(ctx);
  await toPractice(page);
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => window.scrollY);
  const histBefore = await page.evaluate(() => history.length);

  await toPractice(page);        // the SAME tab again
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => window.scrollY);
  const histAfter = await page.evaluate(() => history.length);

  if (before > 100 && after > 40) {
    problems.push(`tapping the current tab again left the screen at ${after}px — every phone treats that as "back to the top"`);
  }
  if (histAfter !== histBefore) {
    problems.push(`tapping the current tab again pushed a history entry (${histBefore} → ${histAfter}) — back would then replay the same screen`);
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 6. reduced motion: no transition at all
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 }, reducedMotion: "reduce" });
  const page = await openApp(ctx);
  await toPractice(page);
  const types = await page.evaluate(() => window.__vt);
  if (types.length) {
    problems.push(`prefers-reduced-motion is set and ${types.length} view transition(s) still ran — a full-screen slide is exactly what that setting exists to stop`);
  }
  if (!/practice/i.test(await screenText(page))) {
    problems.push("with reduced motion the navigation did not happen at all — the movement is optional, the navigation is not");
  }
  await ctx.close();
}

await browser.close();

console.log("\n  navigation checked in a real browser: stack, direction, chrome, scroll, reduced motion");
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems) console.log(`   ${p}`);
  console.log();
  process.exit(1);
}
console.log("  ✓ back goes back, forward and back look different, and the chrome stays put\n");
