// =============================================================================
// test-state-shape.mjs (v103) — the saved states this app has to survive.
//
// localStorage is not a trusted input: it is shared with every version of Zaban
// that has ever run on the device, it survives reinstalls, and a person can
// edit it. Until v103 the app replaced its defaults with whatever was in there,
// so a save from an older version arrived missing every key added since, and a
// single wrong-typed value crashed a screen with no way back — chapters.js does
// `chaptersPassed?.[code] || []` then `.includes(n)`, and `true.includes` throws
// inside a lazy boundary, which left the route map on "Loading…" forever.
//
// Each case below is a state someone could actually be carrying. The assertion
// is the same for all of them: the reconciled state is safe to hand to the
// screens, and nothing the learner earned is thrown away.
//
//   npm run test-state-shape
// =============================================================================

import { normalizeAppState, normalizeLanguageLists, warnOnShapeChange } from "../src/data/appStateShape.js";
import { hasPassedChapter } from "../src/data/chapters.js";
import { countPassagesRead } from "../src/engine/gamification.js";

// A trimmed stand-in for DEFAULT_APP_STATE — the shapes that matter here.
const DEFAULTS = {
  onboarded: false,
  currentLanguage: null,
  totalXp: 0,
  streak: 0,
  showRomanization: true,
  theme: "cream",
  sessionSize: 6,
  grammarSeen: {},
  lessonsCompleted: {},
  chaptersPassed: {},
  sentenceDropsDone: {},
  testedOut: {},
  scriptCourse: {},
  passagesRead: {},
  disabledExercises: [],
  consent: null,
  voice: null,
  sessions: [],
};

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failures++;
    console.log(`  ✗ ${name}\n      ${e.message}`);
  }
}
function eq(a, b, what) {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa !== sb) throw new Error(`${what}: expected ${sb}, got ${sa}`);
}
function norm(saved) {
  const { state, repaired } = normalizeAppState(saved, DEFAULTS);
  normalizeLanguageLists(state, repaired);
  return { state, repaired };
}

console.log("\n  the saved states this app has to survive\n");

// --- 1. the crash that started this --------------------------------------
check("chaptersPassed:{ar:true} no longer crashes the route map", () => {
  const { state } = norm({ onboarded: true, chaptersPassed: { ar: true } });
  // This is the exact call that threw: chapters.js line 31.
  const passed = hasPassedChapter(state, "ar", 1);
  if (passed !== false) throw new Error(`expected false, got ${passed}`);
});

check("...and the pre-fix state really did throw, so the case is not hypothetical", () => {
  let threw = false;
  try { hasPassedChapter({ chaptersPassed: { ar: true } }, "ar", 1); } catch { threw = true; }
  if (!threw) throw new Error("hasPassedChapter did not throw on the raw bad state — this test proves nothing");
});

// --- 2. an old save, missing keys added since ----------------------------
check("a v44-era save gets every key added since, at its default", () => {
  const old = { onboarded: true, currentLanguage: "ur", totalXp: 1200, streak: 9, theme: "cream" };
  const { state, repaired } = norm(old);
  eq(state.scriptCourse, {}, "scriptCourse");
  eq(state.passagesRead, {}, "passagesRead");
  eq(state.disabledExercises, [], "disabledExercises");
  eq(state.sessions, [], "sessions");
  if (state.consent !== null) throw new Error("consent should default to null");
  // And nothing they earned was touched.
  eq(state.totalXp, 1200, "totalXp");
  eq(state.streak, 9, "streak");
  eq(state.currentLanguage, "ur", "currentLanguage");
  if (!repaired.includes("scriptCourse")) throw new Error("the missing keys should be reported");
});

// --- 3. the passagesRead corruption this version also fixes --------------
check('passagesRead: "[object Object]1" is repaired, not carried', () => {
  const { state, repaired } = norm({ onboarded: true, passagesRead: "[object Object]1" });
  eq(state.passagesRead, {}, "passagesRead");
  eq(countPassagesRead(state), 0, "countPassagesRead");
  if (!repaired.includes("passagesRead")) throw new Error("should be reported as repaired");
});

check("a healthy passagesRead map is left alone and counted", () => {
  const { state } = norm({ onboarded: true, passagesRead: { es: ["p1", "p2"], ar: ["p1"] } });
  eq(state.passagesRead, { es: ["p1", "p2"], ar: ["p1"] }, "passagesRead");
  eq(countPassagesRead(state), 3, "countPassagesRead");
});

// --- 4. per-language values of the wrong shape ---------------------------
check("a bad language entry is dropped and the good ones kept", () => {
  const { state, repaired } = norm({
    onboarded: true,
    chaptersPassed: { ar: [1, 2], ur: true, es: 3 },
    testedOut: { fr: ["fr_0001"], de: "nope" },
  });
  eq(state.chaptersPassed, { ar: [1, 2] }, "chaptersPassed");
  eq(state.testedOut, { fr: ["fr_0001"] }, "testedOut");
  if (hasPassedChapter(state, "ar", 2) !== true) throw new Error("ar chapter 2 should still read as passed");
  if (!repaired.includes("chaptersPassed.ur")) throw new Error("should name the dropped entry");
});

// --- 5. hostile and nonsense saves ---------------------------------------
check("a save that is not an object at all falls back to defaults", () => {
  for (const bad of ["wat", 42, true, ["a", "b"]]) {
    const { state } = norm(bad);
    eq(state.theme, "cream", `theme after ${JSON.stringify(bad)}`);
    eq(state.chaptersPassed, {}, `chaptersPassed after ${JSON.stringify(bad)}`);
  }
});

check("primitives of the wrong type are replaced, right ones kept", () => {
  const { state } = norm({
    onboarded: "yes",        // string, want boolean
    totalXp: "1200",         // string, want number
    sessionSize: 12,         // fine
    showRomanization: false, // fine, and false must survive
    theme: 7,                // number, want string
  });
  eq(state.onboarded, false, "onboarded");
  eq(state.totalXp, 0, "totalXp");
  eq(state.sessionSize, 12, "sessionSize");
  eq(state.showRomanization, false, "showRomanization must not be defaulted back to true");
  eq(state.theme, "cream", "theme");
});

// --- 6. forward compatibility --------------------------------------------
check("a key from a NEWER version is carried through untouched", () => {
  const { state } = norm({ onboarded: true, somethingFromV110: { deep: [1, 2, 3] } });
  eq(state.somethingFromV110, { deep: [1, 2, 3] }, "somethingFromV110");
});

check("null is allowed wherever the default is null", () => {
  const { state, repaired } = norm({ onboarded: true, consent: null, voice: null, currentLanguage: null });
  if (state.consent !== null || state.voice !== null) throw new Error("nulls should pass through");
  for (const k of ["consent", "voice", "currentLanguage"]) {
    if (repaired.includes(k)) throw new Error(`${k} was reported repaired when it was fine`);
  }
});

check("a first run reports nothing to repair", () => {
  const { repaired } = norm(null);
  if (repaired.length) throw new Error(`expected nothing, got ${repaired.join(", ")}`);
});

// --- 7. the dev tripwire on the WRITE ------------------------------------
//
// Repairing a bad save at load means the app survives a disagreeing writer —
// and would then never mention it again. The write is where it should be
// caught, so these replay the exact line that started all of this.
const quiet = () => {};

check("the write that broke passagesRead is caught as it happens", () => {
  const prev = { ...DEFAULTS, passagesRead: {} };
  const next = { ...prev, passagesRead: (prev.passagesRead || 0) + 1 };  // the v79-era line, verbatim
  const said = warnOnShapeChange("app", DEFAULTS, prev, next, quiet);
  if (said.length !== 1) throw new Error(`expected one warning, got ${said.length}: ${said.join(" | ")}`);
  if (!/passagesRead changed type: object → string/.test(said[0])) {
    throw new Error(`wrong message: ${said[0]}`);
  }
});

check("an ordinary write says nothing", () => {
  const prev = { ...DEFAULTS, totalXp: 100, passagesRead: { es: ["p1"] } };
  const next = { ...prev, totalXp: 120, passagesRead: { es: ["p1", "p2"] }, streak: 4 };
  const said = warnOnShapeChange("app", DEFAULTS, prev, next, quiet);
  if (said.length) throw new Error(`expected silence, got: ${said.join(" | ")}`);
});

check("it names the write that broke it, not every write after", () => {
  const broken = { ...DEFAULTS, passagesRead: "[object Object]1" };
  const later = { ...broken, totalXp: 40 };
  const said = warnOnShapeChange("app", DEFAULTS, broken, later, quiet);
  if (said.length) throw new Error(`should stay quiet once already broken, got: ${said.join(" | ")}`);
});

check("nulls and absent fields are not mistaken for type changes", () => {
  const prev = { ...DEFAULTS };
  const next = { ...prev, consent: { terms: true }, voice: null };
  delete next.sessions;
  const said = warnOnShapeChange("app", DEFAULTS, prev, next, quiet);
  if (said.length) throw new Error(`expected silence, got: ${said.join(" | ")}`);
});

console.log(failures ? `\n  ✗ ${failures} failed\n` : "\n  ✓ all good\n");
process.exit(failures ? 1 : 0);
