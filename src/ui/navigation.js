// =============================================================================
// navigation.js (v104) — the back button, and the direction it means.
//
// WHAT WAS WRONG
//
// This app has no router. Screens were swapped with `setScreen(name)`, and
// nothing ever touched the history stack. Measured in a real browser: open the
// app, tap Practice, tap Flashcards, press the browser's back button —
//
//     AFTER BROWSER BACK -> url: about:blank
//
// — you are out of the app. `history.length` was 2 at the home screen and
// still 2 after two navigations. On Android, and in any installed PWA, the
// system back gesture IS the back button, so from any screen in this app, back
// closed it. Three years of Material guidance and every platform's habit say
// back goes up one level; here it went to the void.
//
// That is also why moving between screens felt like a slideshow rather than a
// place. Without history there is no such thing as "back", so every screen
// change could only ever be the same 240ms fade-in, in the same direction,
// whether you were going deeper or returning.
//
// WHAT THIS DOES
//
//   1. Every navigation pushes a history entry, so back walks up the stack and
//      only leaves the app from the home screen — where leaving is correct.
//   2. It knows which way you are going, because a `popstate` is a return and
//      a `navigate()` is a departure. The direction is handed to CSS as a view
//      transition type, so forward and back are visibly different movements.
//   3. Scroll position is remembered per entry. Going forward starts at the
//      top; coming back puts you where you were. Before this, `navigate` ran
//      `window.scrollTo(0, 0)` unconditionally, so returning to a long home
//      screen always threw away your place.
//
// WHY THE VIEW TRANSITION API AND NOT AN ANIMATION LIBRARY
//
// Because the browser does the hard part. It snapshots the old screen, runs
// the DOM update, snapshots the new one, and cross-fades between real
// composited layers — no double-mounting, no measuring, nothing on the main
// thread. Verified present in this project's Chromium (141): the object form
// with `types`, `:active-view-transition-type()`, `view-transition-class` and
// `skipTransition` are all supported. Where it is absent — Firefox at time of
// writing — `navigate` simply updates state and the existing `.screen-enter`
// animation plays, exactly as before. No polyfill, no dependency.
// =============================================================================

const KEY = "lingua:nav";

/** Is the browser able to do this at all? */
export const canViewTransition =
  typeof document !== "undefined" && typeof document.startViewTransition === "function";

/**
 * Motion is a preference for most people and a medical problem for some. A
 * vestibular disorder makes a sliding full-screen panel genuinely unpleasant,
 * so when the system asks for reduced motion we skip the movement and let the
 * screen simply be there.
 *
 * Read at call time, not once at module load: people change this setting, and
 * an app that only notices at boot is an app that ignores them until reload.
 */
export function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * Run `update` inside a directional view transition.
 *
 * `direction` is "forward" or "back"; it becomes a view transition TYPE, which
 * CSS selects on with :active-view-transition-type(forward). Types rather than
 * a class on <html> because the browser scopes them to the transition itself —
 * there is no state left behind to clean up if something throws mid-flight.
 *
 * `extraTypes` carries anything else CSS needs to know about THIS move. The
 * one in use is whether the bottom bar is appearing or disappearing: a lesson
 * takes over the whole viewport and has no bar, so entering one has to fade it
 * out. Naming the case is better than cross-fading the bar on every
 * navigation — two identical snapshots fading through each other dip to about
 * 75% opacity halfway, which reads as the bar flickering on every single tap.
 *
 * The update must be applied synchronously inside the callback, which in React
 * means flushSync; the caller passes that in rather than this module importing
 * react-dom, so it stays testable in plain Node.
 */
export function withTransition(direction, update, extraTypes = []) {
  if (!canViewTransition || prefersReducedMotion()) {
    update();
    return null;
  }
  try {
    return document.startViewTransition({ update, types: ["screen", direction, ...extraTypes] });
  } catch {
    // Any refusal — a duplicate view-transition-name is the usual one — must
    // not cost the navigation itself. The screen change is the point; the
    // animation is decoration.
    update();
    return null;
  }
}

/**
 * The navigation stack.
 *
 * Deliberately NOT a router. Adding one would mean URLs for thirty screens,
 * which is a product decision (shareable deep links, and what they expose about
 * someone's learning) rather than a technical one, and it is not this change.
 * What this needs is only an ordered list of where you have been, so that back
 * means something. history.state carries the index; the entries live here.
 */
export function createNavigator({ onChange, getScroll, setScroll }) {
  let stack = [{ screen: "home", params: null, scroll: 0 }];
  let index = 0;

  // sessionStorage, not localStorage: a navigation stack belongs to this tab
  // and this visit. Restoring yesterday's stack into today's tab would make
  // back lead somewhere the person never was.
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (saved && Array.isArray(saved.stack) && saved.stack.length) {
      stack = saved.stack;
      index = Math.min(Math.max(0, saved.index | 0), stack.length - 1);
    }
  } catch { /* a corrupt stack is not worth a crash; start fresh */ }

  const persist = () => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ stack, index }));
    } catch { /* private mode, quota — navigation still works, it just forgets */ }
  };

  const current = () => stack[index];

  function go(screen, params) {
    // Re-navigating to the screen you are already on should not stack up
    // entries you then have to press back through. Tapping "Learn" twice is
    // one place, not two.
    //
    // It should not do NOTHING either. Every phone in the world treats a
    // second tap on the tab you are already on as "take me back to the top",
    // and a tab bar that ignores you is a tab bar you stop trusting. Smooth
    // rather than instant, because a jump to the top from halfway down a long
    // home screen is disorienting — unless the person has asked for less
    // motion, in which case it is immediate.
    if (current().screen === screen && JSON.stringify(current().params || null) === JSON.stringify(params || null)) {
      if (getScroll() > 0) {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
      return;
    }
    stack[index] = { ...current(), scroll: getScroll() };
    stack = stack.slice(0, index + 1).concat([{ screen, params: params || null, scroll: 0 }]);
    index = stack.length - 1;
    persist();
    try {
      history.pushState({ linguaIndex: index }, "");
    } catch { /* about:srcdoc and friends; the app still works, back does not */ }
    onChange(current(), "forward");
    setScroll(0);
  }

  /**
   * A popstate. The browser has already moved; our job is to work out which
   * way and catch up.
   *
   * The index comes from history.state rather than being assumed to be
   * index - 1, because the back button is not the only way to move: a long
   * press on it, or the history menu, can jump several entries at once, and
   * decrementing by one there would leave this stack lying about where it is.
   */
  function onPop(event) {
    const to = event?.state?.linguaIndex;
    if (typeof to !== "number" || !stack[to]) {
      // An entry we did not write — the page's own initial entry. Let it be:
      // the browser leaves the app, which from the home screen is right.
      return false;
    }
    stack[index] = { ...current(), scroll: getScroll() };
    const direction = to < index ? "back" : "forward";
    index = to;
    persist();
    onChange(current(), direction);
    setScroll(current().scroll || 0);
    return true;
  }

  /** Replace the current entry without stacking — used for the initial screen. */
  function replace(screen, params) {
    stack[index] = { screen, params: params || null, scroll: 0 };
    persist();
    try {
      history.replaceState({ linguaIndex: index }, "");
    } catch { /* see above */ }
  }

  return { go, onPop, replace, current, size: () => stack.length, at: () => index };
}
