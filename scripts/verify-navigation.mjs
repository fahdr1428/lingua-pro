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
// 5c. NO SECOND ANIMATION FIRES AFTER THE PUSH ENDS
//
// v104.2's actual bug, found by direct measurement, not a screenshot guess.
// `.screen-enter`'s fade was suppressed with:
//     html:active-view-transition .screen-enter { animation: none; }
// which looked right and was wrong: the moment the push finished,
// `:active-view-transition` went false, `.screen-enter`'s animation-name
// flipped from `none` back to `screenIn2`, and per the CSS Animations spec
// that starts a BRAND NEW animation instance — even reapplying the "same"
// name after `none` restarts it. So immediately after the slide settled, the
// whole panel dropped to transparent and faded back up over ~250ms:
// getComputedStyle read opacity 0 the instant :active-view-transition became
// false, then 0.37 → 0.62 → 0.77 → 0.86 → 0.95 → 1 across the next few frames.
// A second, unrelated flash bolted onto the end of a transition that had
// already finished correctly.
//
// The fix (App.jsx, animatedByViewTransition) decides whether `.screen-enter`
// is present AT ALL from JS, before the DOM changes, so there is no
// animation-name to ever flip back. This polls computed opacity on <main> for
// 400ms after a transition ends and fails if it is ever caught below 0.95.
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await openApp(ctx);
  await toPractice(page);
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    window.__opacitySamples = [];
    window.__sampling = false;
    const poll = () => {
      if (window.__sampling) {
        const m = document.querySelector("main");
        if (m) window.__opacitySamples.push(Number(getComputedStyle(m).opacity));
      }
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  });

  await page.evaluate(() => { window.__sampling = true; });
  await page.goBack().catch(() => {});
  await page.waitForTimeout(700);
  await page.evaluate(() => { window.__sampling = false; });

  const samples = await page.evaluate(() => window.__opacitySamples);
  const min = samples.length ? Math.min(...samples) : null;
  if (min === null) {
    problems.push("no opacity samples were taken on <main> across a back-navigation — this check proved nothing");
  } else if (min < 0.95) {
    problems.push(
      `<main>'s opacity dropped to ${min.toFixed(2)} at some point after a navigation — a second fade-in is running ` +
      `on top of (or after) the view transition's own push. Samples: ${samples.map((n) => n.toFixed(2)).join(",")}`
    );
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 5d. FOCUS MOVES WITH THE SCREEN
//
// <main key={screen}> has fully remounted on every navigation since v78, but
// nothing ever moved keyboard focus to it. Measured directly: focus a button
// that lives INSIDE <main> — a card, a journey stop, anything that isn't the
// persistent tab bar — activate it with the keyboard, and the element it was
// on is destroyed by the remount. Focus fell all the way back to <body>. A
// keyboard or screen-reader user's next Tab started from the very top of the
// page — the language picker — every time they navigated by anything other
// than the five tab-bar buttons, which happen to survive the remount and so
// happened to keep focus by accident.
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await openApp(ctx);

  // Reach Practice, then focus+activate a button that lives INSIDE <main> —
  // Flashcards, on the Practice hub — exactly as a keyboard user would.
  await toPractice(page);
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /📇/.test(x.innerText || ""));
    if (b) b.focus();
  });
  const before = await page.evaluate(() => document.activeElement?.textContent?.slice(0, 20));
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);

  const after = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    isBody: document.activeElement === document.body,
    id: document.activeElement?.id,
  }));
  if (after.isBody) {
    problems.push(
      `activating "${before}" (a button inside <main>) via the keyboard left focus on <body> after navigating — ` +
      `a keyboard or screen-reader user is now nowhere and has to tab from the very top of the page`
    );
  } else if (after.tag !== "MAIN" && after.id !== "main") {
    problems.push(`focus after navigating landed on <${after.tag}>, not #main — expected the new screen's landmark to receive it`);
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

// ---------------------------------------------------------------------------
// 7. SWITCHING LANGUAGE DOESN'T LEAVE A STALE ENTRY IN THE STACK
//
// switchLanguage/pickLanguageInstant/resetAll used to call setScreen("home")
// directly — the same navRef-bypass pattern as the exam-retake bug (see the
// v104.2 comment on go() in navigation.js). It looked harmless because
// switching language routes through <Onboarding>, which renders above the
// screen/<main> system entirely and so never asks the desynced stack a
// question it would get wrong — right up until the person backs out of
// Onboarding and then forward again.
//
// Reproduced here: build a stack of Home -> Practice -> Profile, switch
// language from Profile (this should collapse the CURRENT stack entry to
// "home", not leave it labelled "profile"), complete onboarding, then press
// back (lands on Practice, untouched by any of this) and forward again.
// Forward should return to home — where the person actually was when they
// switched — not to the stale "profile" label a bare setScreen() left
// behind because it never told the navigator anything had changed.
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await openApp(ctx);

  // Profile and Home are told apart by DOM markers, not by scanning
  // screenText's first 60 characters for the word "profile" — it never
  // appears there. The Profile screen's own heading is "Learning {language}"
  // (see screens.jsx); the word "Profile" exists only as the bottom-nav tab
  // label, which sits well past that 60-character cut. The settings gear
  // (aria-label="Settings") is unique to Profile; the language-picker button
  // (aria-label="Switch language") is unique to Home's TopBar, since only
  // Home passes onPickLanguage to it. Caught by running this exact check
  // against the truncated-text version first: it reported Profile as
  // unreachable even though the click had worked correctly.
  const onProfile = (page) => page.evaluate(() => !!document.querySelector('button[aria-label="Settings"]'));
  const onHome = (page) => page.evaluate(() => !!document.querySelector('button[aria-label="Switch language"]'));

  await toPractice(page);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".bottom-nav button")].find((x) => /profile/i.test(x.innerText || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(600);

  if (!(await onProfile(page))) {
    problems.push(`could not reach Profile to run the language-switch check — got "${await screenText(page)}"`);
  } else {
    const clicked = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => /switch.*language|change.*language/i.test(x.innerText || ""));
      if (b) { b.click(); return true; }
      return false;
    });
    if (!clicked) {
      problems.push('no "switch language" control found on Profile — this check proved nothing');
    } else {
      await page.waitForTimeout(500);
      // Onboarding step 0 -> 1
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => /get started/i.test(x.innerText || ""));
        if (b) b.click();
      });
      await page.waitForTimeout(300);
      // Step 1: pick any language, continue
      await page.evaluate(() => document.querySelector(".card-lift")?.click());
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => /^continue$/i.test((x.innerText || "").trim()));
        if (b) b.click();
      });
      await page.waitForTimeout(200);
      // Step 2: pick a goal, continue
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => /regular/i.test(x.innerText || ""));
        if (b) b.click();
      });
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => /^continue$/i.test((x.innerText || "").trim()));
        if (b) b.click();
      });
      await page.waitForTimeout(200);
      // Step 3: consent, start learning
      await page.evaluate(() => {
        for (const c of document.querySelectorAll('input[type="checkbox"]')) c.click();
      });
      await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => /start learning/i.test(x.innerText || ""));
        if (b) b.click();
      });
      await page.waitForTimeout(700);

      if (!(await onHome(page))) {
        problems.push(`completing onboarding after a language switch did not land on home — got "${await screenText(page)}"`);
      } else {
        await page.goBack().catch(() => {});
        await page.waitForTimeout(700);
        if (!/practice/i.test(await screenText(page))) {
          problems.push(`back after a post-switch onboarding did not land on Practice — got "${await screenText(page)}"`);
        }
        await page.goForward().catch(() => {});
        await page.waitForTimeout(700);
        if (await onProfile(page)) {
          problems.push(
            `going forward after a language switch landed back on the stale Profile screen instead of home — ` +
            `the navigator's stack still thinks the entry at this position is "profile" because the switch never told it otherwise`
          );
        } else if (!(await onHome(page))) {
          problems.push(`going forward after a language switch landed on "${await screenText(page)}", not home`);
        }
      }
    }
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 8. THE DESKTOP RAIL SURVIVES A FORWARD NAVIGATION
//
// Every check above runs at a 414×896 phone viewport — the only viewport
// this file had ever used. Caught only by looking at actual screenshots at a
// desktop width (1440×900), not by any of the numeric checks above, all of
// which passed the whole time: for the first ~70ms of a FORWARD navigation,
// the departing screen's snapshot visibly painted over the side rail,
// blanking "Zaban" and the five nav items until it finished sliding clear.
//
// The mechanism: ::view-transition-old(screen)/::view-transition-new(screen)
// carry an explicit z-index (1/2) so the arriving screen covers the one it
// slides over. ::view-transition-group(rail) had no z-index at all — which
// defaults to auto, and an explicit positive z-index always outranks a
// sibling stacked at auto, regardless of paint order. On the phone layout
// this was invisible: the bottom nav sits in a different row, so a
// horizontal slide of <main> never crosses it. On the desktop layout the
// rail sits in the SAME row, immediately to <main>'s left — and a FORWARD
// navigation's departing screen slides LEFT, directly through the rail's own
// screen space, with a higher z-index than it.
//
// FIRST ATTEMPT AT THIS CHECK sampled pixels with page.screenshot() in a
// tight loop, looking for the rail's dark (--ink) text going missing. It
// never failed, even reverted onto the exact code this section's own
// comment above describes — because page.screenshot() in this environment
// takes 100-250ms round-trip, and the whole bug window is ~35-70ms: the
// first screenshot always lands after the transition has already finished.
// This is the same lesson v104.2 already paid for once (see 5c above) —
// screenshot polling races the very thing it is trying to catch.
//
// The fix is to not use screenshots at all. z-index is a computed style, and
// computed style of a view-transition pseudo-element is readable the
// ordinary way — getComputedStyle(document.documentElement,
// "::view-transition-group(rail)") — synchronously, from inside the page,
// the instant the transition is ready. No round trip, nothing to race.
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await openApp(ctx);

  const z = await page.evaluate(() => new Promise((resolve) => {
    const btn = [...document.querySelectorAll(".side-rail-item")].find((x) => /practice/i.test(x.innerText || ""));
    if (!btn) return resolve(null);
    const orig = document.startViewTransition?.bind(document);
    if (!orig) return resolve(null);
    document.startViewTransition = (arg) => {
      const vt = orig(arg);
      let captured = null;
      vt.ready.then(() => {
        const read = (pseudo) => getComputedStyle(document.documentElement, pseudo).zIndex;
        captured = {
          rail: read("::view-transition-group(rail)"),
          nav: read("::view-transition-group(nav)"),
          screenOld: read("::view-transition-old(screen)"),
          screenNew: read("::view-transition-new(screen)"),
        };
      }, () => {});
      vt.finished.finally(() => resolve(captured));
      return vt;
    };
    btn.click();
  }));

  if (!z) {
    problems.push("could not capture z-index during a desktop forward navigation — this check proved nothing");
  } else {
    const num = (v) => (v === "auto" ? null : Number(v));
    const railZ = num(z.rail);
    const screenTop = Math.max(num(z.screenOld) ?? -Infinity, num(z.screenNew) ?? -Infinity);
    if (railZ === null) {
      problems.push(
        `::view-transition-group(rail) has no z-index (computed "auto") while the screen it sits beside does ` +
        `(old=${z.screenOld}, new=${z.screenNew}) — a sibling with z-index:auto always loses to one with a ` +
        `positive z-index, so the departing screen's forward-navigation slide (which moves LEFT, through the ` +
        `rail's own column) paints directly over the rail. Confirmed on camera: "Zaban" and all five nav items ` +
        `disappear for the ~70ms it takes to slide clear.`
      );
    } else if (railZ <= screenTop) {
      problems.push(`::view-transition-group(rail) z-index (${railZ}) does not outrank the screen's (${screenTop}) — the rail can still be painted over`);
    }
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 9. THE ON-SCREEN "← BACK" GOES BACK (v107)
//
// Thirteen Back buttons were forward navigations to a hard-coded screen:
// Practice → Grammar → "← Back" landed on Home and pushed a history entry, so
// the browser's back then returned to Grammar. The sentence stream's Back went
// to Reading — for Tamil, an empty screen whose only button is the stream.
// Checked here: the button returns to where you came from, WITHOUT growing the
// history, for three screens reached from Practice. And Tamil (no passages)
// is not offered a Reading door at all.
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await openApp(ctx);
  const clickDoor = (re) => page.evaluate((src) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && new RegExp(src).test(x.innerText || ""));
    if (b) b.click();
    return !!b;
  }, re.source);
  const onHub = () => page.evaluate(() => /Every drill in one place/.test(document.querySelector("#main")?.innerText || ""));

  for (const [door, label] of [[/🧭\s*Grammar/, "Grammar"], [/📜\s*Urdu you can read/, "sentence stream"], [/🎯\s*Practise a topic/, "Topics"]]) {
    await toPractice(page);
    if (!(await onHub(page))) { problems.push(`[back button] couldn't reach Practice before testing ${label}`); continue; }
    if (!(await clickDoor(door))) { problems.push(`[back button] no ${label} door in Practice`); continue; }
    await page.waitForTimeout(800);
    const before = await page.evaluate(() => history.length);
    const clicked = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && /← Back/.test(x.innerText || ""));
      if (b) b.click();
      return !!b;
    });
    if (!clicked) { problems.push(`[back button] ${label} has no "← Back" button`); continue; }
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => history.length);
    if (!(await onHub(page))) problems.push(`[back button] "← Back" on ${label} didn't return to Practice — landed on "${await screenText(page)}"`);
    if (after > before) problems.push(`[back button] "← Back" on ${label} pushed a new history entry (${before} → ${after}) instead of going back`);
    // and go home between runs so each starts from the same place
    await page.evaluate(() => [...document.querySelectorAll(".bottom-nav button")].find((x) => /learn/i.test(x.innerText || ""))?.click());
    await page.waitForTimeout(500);
  }
  await ctx.close();

  const ctx2 = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const ta = await ctx2.newPage();
  await ta.goto(BASE, { waitUntil: "load" });
  await ta.evaluate((s) => { localStorage.setItem("lingua:app", s.replace(/"ur"/g, '"ta"')); localStorage.setItem("lingua:progress", "{}"); }, seed);
  await ta.reload();
  await ta.waitForTimeout(1300);
  await toPractice(ta);
  const doors = await ta.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.innerText || ""));
  if (!doors.some((t) => /Tamil you can read/.test(t))) problems.push("[reading door] Tamil's Practice lost the sentence-stream door");
  if (doors.some((t) => /Read some Tamil/.test(t))) problems.push(`[reading door] Tamil has no reading passages but Practice still offers "Read some Tamil" — it opens onto "No reading passages for Tamil yet"`);
  await ctx2.close();
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
