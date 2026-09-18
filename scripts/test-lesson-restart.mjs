// =============================================================================
// test-lesson-restart.mjs (v104.2) — retaking a failed chapter exam.
//
// Found while investigating the v104 transition work, not by looking for it:
// "Retake Chapter 1 exam" on the fail screen calls
//
//     onNavigate("lesson", { mode: "chapter_exam", chapter: 1,
//                             filter: { vocabIds: [...] }, sessionSize: 8 })
//
// from WITHIN Lesson.jsx, while the current screen is ALREADY "lesson". Two
// separate bugs compounded on that one click:
//
//   1. THE NAVIGATION STACK SWALLOWED IT. A retake of the same chapter passes
//      the SAME chapter, the SAME vocabIds, the SAME sessionSize as the
//      attempt that just failed — so the new params are byte-for-byte
//      identical (by JSON.stringify) to the ones already on the stack. The
//      v104 "tapping the tab you're on scrolls to top instead of stacking"
//      optimization used that same identity check unconditionally, so it
//      treated this as "already here" and never called onChange at all — no
//      transition, no new session request, nothing.
//
//   2. EVEN IF IT HAD NAVIGATED, THE SCREEN WOULD NOT HAVE UPDATED. Lesson.jsx
//      does not remount between two "lesson" navigations — key={screen} in
//      App.jsx only changes with the screen NAME — so `done`, `idx`,
//      `resultData` and a dozen other pieces of per-session state would have
//      stayed exactly as the FAILED attempt left them. `if (done) return
//      <Result …/>` gates ahead of everything, so the old fail screen — with
//      the old score — would have kept rendering forever regardless of what
//      the new session's engine.generateSession() call returned.
//
// Both are fixed and both are tested here, at the level each is decidable at:
// the navigation stack in isolation (no browser needed — it is plain JS), and
// Lesson.jsx's own source, checked for the wiring that makes (2) impossible to
// silently regress (a full DOM harness would tell us less than reading this
// does, since the actual claim is "this effect calls that function").
//
//   node scripts/test-lesson-restart.mjs
// =============================================================================

import { readFileSync } from "node:fs";
import { createNavigator } from "../src/ui/navigation.js";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (e) { failures++; console.log(`  ✗ ${name}\n      ${e.message}`); }
}

// --- 1. the navigation stack must not swallow a same-screen retake --------
check("retaking the same chapter exam (identical params) fires a new navigation", () => {
  const calls = [];
  const nav = createNavigator({ onChange: (entry, dir) => calls.push({ entry, dir }), getScroll: () => 0, setScroll: () => {} });
  nav.replace("home", null);

  const examParams = { mode: "chapter_exam", chapter: 1, filter: { vocabIds: ["ur_0001", "ur_0002", "ur_0003"] }, sessionSize: 8 };
  nav.go("lesson", examParams);
  if (calls.length !== 1) throw new Error(`expected 1 call after the first attempt, got ${calls.length}`);

  // The retake: same chapter, same word list, same size — a fresh object,
  // structurally identical to what's already on the stack.
  const retakeParams = { mode: "chapter_exam", chapter: 1, filter: { vocabIds: ["ur_0001", "ur_0002", "ur_0003"] }, sessionSize: 8 };
  nav.go("lesson", retakeParams);
  if (calls.length !== 2) {
    throw new Error(
      `retake was swallowed — expected 2 onChange calls total, got ${calls.length}. ` +
      `This is the exact bug: a real button press did nothing.`
    );
  }
  if (calls[1].dir !== "forward") throw new Error(`retake should be a forward navigation, got "${calls[1].dir}"`);
});

// --- 2. bare tab-to-tab dedup (the thing this optimization exists for)
//        must still work, so the fix does not overcorrect --------------------
check("tapping the same param-less tab twice still dedupes (no stray history entry)", () => {
  const calls = [];
  const nav = createNavigator({ onChange: (entry, dir) => calls.push({ entry, dir }), getScroll: () => 0, setScroll: () => {} });
  nav.replace("home", null);
  nav.go("hub", null);
  if (calls.length !== 1) throw new Error(`expected 1 call, got ${calls.length}`);
  nav.go("hub", null);           // tapping "Practice" again while already there
  if (calls.length !== 1) throw new Error(`a second param-less tap on the same tab should not navigate again — got ${calls.length} calls`);
  if (nav.size() !== 2) throw new Error(`the second tap should not have grown the stack — size is ${nav.size()}, expected 2`);
});

// --- 3. a params-carrying screen you're "already on" with DIFFERENT params
//        must still navigate (speak with a different stopId, say) ----------
check("the same screen with genuinely different params still navigates", () => {
  const calls = [];
  const nav = createNavigator({ onChange: (entry, dir) => calls.push({ entry, dir }), getScroll: () => 0, setScroll: () => {} });
  nav.replace("home", null);
  nav.go("speak", { stopId: "a" });
  nav.go("speak", { stopId: "b" });
  if (calls.length !== 2) throw new Error(`expected 2 calls for two different stopIds, got ${calls.length}`);
});

// --- 4. Lesson.jsx must actually call the reset when params change ---------
//
// A DOM harness could assert this too, but what it would need to reach —
// a genuinely failed, gated chapter exam via real play — asserts far less
// than reading the wiring itself: the claim is "this effect calls that
// function," which is either true in the source or it isn't.
check("Lesson.jsx resets session state inside the params-driven effect, not just on mount", () => {
  const src = readFileSync("src/screens/Lesson.jsx", "utf8");

  if (!/function resetSessionState\s*\(/.test(src)) {
    throw new Error("resetSessionState no longer exists — was it renamed or removed?");
  }
  if (!/setSession\(null\)/.test(src)) {
    throw new Error("resetSessionState no longer clears the old session, so a stale exercise from the previous params could flash before the new one arrives");
  }

  // The effect keyed on [engine, params] — the one that fires on every
  // params change, not just mount — must call resetSessionState as its
  // first order of business, before the async engine call.
  const effectMatch = /useEffect\(\(\) => \{\s*resetSessionState\(\);\s*let cancelled = false;\s*engine\s*\n\s*\.generateSession/;
  if (!effectMatch.test(src)) {
    throw new Error(
      "the session-building effect no longer starts with resetSessionState() — " +
      "without it, `done` from a previous session survives a params change and " +
      "the Result screen (gated on `done`) never lets go, no matter what a new " +
      "session's engine.generateSession() call returns."
    );
  }
  const depsMatch = /resetSessionState\(\);[\s\S]*?\}, \[engine, params\]\)/;
  if (!depsMatch.test(src)) {
    throw new Error("the session-building effect's dependency array is not [engine, params] — the reset would not fire on every params change");
  }

  // reviewMistakes must use the SAME function rather than its own list —
  // that drift (match-pairs/combo/hints added later, never added to its
  // hand-written reset) is what made a second copy the wrong fix here.
  const reviewMatch = /function reviewMistakes\(\)[\s\S]{0,600}?resetSessionState\(\);/;
  if (!reviewMatch.test(src)) {
    throw new Error("reviewMistakes() no longer calls resetSessionState() — check it hasn't grown its own hand-written reset list again");
  }
});

console.log(failures ? `\n  ✗ ${failures} failed\n` : "\n  ✓ all good\n");
process.exit(failures ? 1 : 0);
