// =============================================================================
// APP — root component, owns navigation state, wires engine + screens together.
// =============================================================================

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { flushSync } from "react-dom";
import { useEngine } from "./hooks/useEngine.js";
import { usePersistentState } from "./hooks/usePersistentState.js";
import { normalizeAppState, normalizeLanguageLists } from "./data/appStateShape.js";
import { createNavigator, withTransition, canViewTransition, prefersReducedMotion } from "./ui/navigation.js";
import { useProfile } from "./hooks/useProfile.js";
import { getStorage } from "./storage/index.js";
import { BottomNav, SideRail, Button, Container } from "./ui/primitives.jsx";
import { applyTheme } from "./ui/themes.js";
import { LANGUAGES } from "./data/registry.js";
import { setVoicePrefs } from "./audio/voices.js";
import {
  Onboarding,
  Home,
  PracticeHub,
  Letters,
  Vocab,
  Profile,
  Settings,
  Upgrade,
} from "./screens/screens.jsx";
import { Lesson } from "./screens/Lesson.jsx";
import { APP_MIN_AGE, LAST_UPDATED } from "./legal/policies.js";
import { OfflineBar } from "./ui/Offline.jsx";

// v78 — CODE SPLITTING.
//
// Everything used to be in one 759KB bundle, of which Lighthouse measured 108KB
// as unused on first load: a learner opening the app to do a lesson downloaded
// the mission engine, the fluency dial, the dialect drill and three legal
// policies before the first word appeared.
//
// Home and Lesson stay eagerly imported — they are the two screens someone
// actually arrives at, and lazy-loading the thing you always need immediately
// just adds a round trip. Everything else loads when it's first opened, which on
// a phone is the difference between a fast first paint and a slow one.
//
// The `.then` shims exist because these are named exports; React.lazy wants a
// module with a default.
//
// v104 — THE LOADERS LIVE IN ONE MAP, because something else needs them.
//
// Splitting a screen off means it is fetched the first time it is opened, and
// on a slow connection that is a stall on the busiest surfaces in the app.
// Measured at 400kbps — an ordinary phone on a bad signal, which is most of
// this app's audience some of the time:
//
//     Speak tab      "Loading…" for ~1400ms
//     Missions tab   "Loading…" for ~1500ms
//
// Both are one tap from everywhere, via the bottom bar. Nobody should wait a
// second and a half to reach a tab. So the chunks are fetched during idle time
// after the app has settled — see prefetchScreens below — and by the time a
// tab is tapped the module is already in memory and the navigation is instant.
// A single map keeps the import specifiers identical between the lazy wrapper
// and the prefetcher; two copies of `import("./screens/Speak.jsx")` would be
// two chunks, and the prefetch would warm one while the app used the other.
const SCREEN_LOADERS = {
  flashcards: () => import("./screens/Flashcards.jsx"),
  alphabet: () => import("./screens/AlphabetLessons.jsx"),
  scriptexam: () => import("./screens/ScriptExam.jsx"),
  reading: () => import("./screens/Reading.jsx"),
  conversations: () => import("./screens/Conversations.jsx"),
  sentencelab: () => import("./screens/SentenceLab.jsx"),
  grammar: () => import("./screens/Grammar.jsx"),
  practice: () => import("./screens/Practice.jsx"),
  speak: () => import("./screens/Speak.jsx"),
  culture: () => import("./screens/Culture.jsx"),
  missions: () => import("./screens/Missions.jsx"),
  fluency: () => import("./screens/Fluency.jsx"),
  skipahead: () => import("./screens/SkipAhead.jsx"),
  dialect: () => import("./screens/DialectDrill.jsx"),
  legal: () => import("./screens/Legal.jsx"),
  decode: () => import("./screens/Decode.jsx"),
  stream: () => import("./screens/InputStream.jsx"),
  topics: () => import("./screens/Topics.jsx"),
  listen: () => import("./screens/Listen.jsx"),
};

// One tap away from everywhere, so they are warmed first. The rest follow.
const PREFETCH_FIRST = ["speak", "missions", "practice", "flashcards"];

// v107: data a LESSON needs, split out of the first download (grammar, verb
// and tense tables — see validate-content-index's HEAVY list). A lesson is the
// most likely next tap, so these are warmed before any screen: the first
// lesson should never be the thing that waits on the network. Same import
// specifiers as Lesson.jsx / Engine.js, so they resolve to the same chunks.
const DATA_WARM = [
  () => import("./data/grammar.js"),
  () => import("./data/conjugations.js"),
  () => import("./data/tenses.js"),
];

/**
 * Warm the split chunks while nobody is waiting on anything.
 *
 * requestIdleCallback rather than a timer: it runs when the main thread has
 * nothing better to do, so it cannot compete with the first render or with a
 * lesson someone has already started. Sequential rather than all at once —
 * seventeen parallel requests on a slow connection would fight each other and
 * the one the person actually taps could end up last in the queue.
 *
 * Save-Data is honoured. It is an explicit request not to spend someone's data
 * on things they did not ask for, and speculative downloads are exactly that.
 */
function prefetchScreens() {
  try {
    if (navigator.connection?.saveData) return;
  } catch { /* no Network Information API; carry on */ }

  const order = [
    ...DATA_WARM,
    ...[...PREFETCH_FIRST, ...Object.keys(SCREEN_LOADERS).filter((k) => !PREFETCH_FIRST.includes(k))].map((k) => SCREEN_LOADERS[k]),
  ];
  const idle = window.requestIdleCallback || ((fn) => setTimeout(() => fn({ timeRemaining: () => 8 }), 220));

  let i = 0;
  const step = () => {
    if (i >= order.length) return;
    const load = order[i++];
    // A failed prefetch is not an error anyone should see: the screen will be
    // fetched again, and reported properly, when it is actually opened.
    Promise.resolve().then(load).catch(() => {}).then(() => idle(step));
  };
  idle(step);
}

const named = (key, exportName) =>
  React.lazy(() => SCREEN_LOADERS[key]().then((m) => ({ default: m[exportName] })));

const Flashcards = named("flashcards", "Flashcards");
const AlphabetLessons = named("alphabet", "AlphabetLessons");
const ScriptExam = named("scriptexam", "ScriptExam");
const Reading = named("reading", "Reading");
const Conversations = named("conversations", "Conversations");
const SentenceLab = named("sentencelab", "SentenceLab");
const Grammar = named("grammar", "Grammar");
const Practice = named("practice", "Practice");
const Speak = named("speak", "Speak");
const Culture = named("culture", "Culture");
const Missions = named("missions", "Missions");
const Fluency = named("fluency", "Fluency");
const SkipAhead = named("skipahead", "SkipAhead");
const DialectDrill = named("dialect", "DialectDrill");
const Legal = named("legal", "Legal");
const Decode = named("decode", "Decode");
const InputStream = named("stream", "InputStream");
const Topics = named("topics", "Topics");
const Listen = named("listen", "Listen");

// A lazily-imported screen that fails to load is almost never a bug in the
// screen. It's a deploy: this app splits fifteen screens into content-hashed
// chunks, and when we ship, the old names stop existing. Anyone with the tab
// open is now running an app that asks for files the server has never heard of,
// and the first screen they open dies.
//
// "Go back home" is the wrong offer there — home already works, and every other
// screen will fail the same way. The only fix is to fetch the new index.html,
// so we do that ourselves rather than making someone guess.
//
// Browsers word this differently, hence the alternatives.
const CHUNK_ERROR =
  /dynamically imported module|importing a module script failed|chunkloaderror|failed to fetch dynamically/i;
const RELOADED_KEY = "lingua:chunk-reload";

const isChunkError = (error) => CHUNK_ERROR.test(String(error?.message || ""));

// Error boundary — catches crashes and shows a recovery button instead of a white screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    if (!isChunkError(error)) return;
    // Reload exactly once per session. If the reload didn't fix it — we're
    // offline, or the chunk is genuinely gone — a second one won't either, and
    // an app that reloads itself forever is worse than any error screen.
    try {
      if (sessionStorage.getItem(RELOADED_KEY) === "1") return;
      sessionStorage.setItem(RELOADED_KEY, "1");
    } catch {
      // No way to remember we already tried, so don't risk the loop.
      return;
    }
    window.location.reload();
  }
  render() {
    if (this.state.hasError) {
      const stale = isChunkError(this.state.error);
      return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text)" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{stale ? "🔄" : "😵"}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>
            {stale ? "Zaban just updated" : "Something went wrong"}
          </h2>
          <p style={{ color: "var(--text-dim)", marginBottom: 24, fontSize: 14 }}>
            {stale
              ? "This tab is running the old version, so that screen wouldn't load. Reload to get the new one — everything you've learned is saved."
              : String(this.state.error?.message || "Unknown error")}
          </p>
          <button
            onClick={() => {
              if (stale) {
                window.location.reload();
                return;
              }
              this.setState({ hasError: false, error: null });
              this.props.onRecover?.();
            }}
            style={{
              background: "var(--primary)",
              color: "var(--on-primary)",
              border: "none",
              borderRadius: 12,
              padding: "14px 24px",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {stale ? "Reload" : "Go back home"}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Screens that take over the whole viewport: no side rail, no bottom nav, and a
// single-column shell (without the shell override the lone child lands in the
// rail's 212px track and gets clipped — that was the v67 bug).
//
// Speak is deliberately NOT in here. It's a bottom-nav destination, and having
// the nav vanish the moment you tap it is disorienting; it carries its own close
// button instead.
const FOCUSED = new Set(["lesson"]);

const DEFAULT_APP_STATE = {
  onboarded: false,
  currentLanguage: null,
  dailyGoalXp: 35,
  totalXp: 0,
  streak: 0,
  lastStudyDate: null,
  hearts: 5,
  heartsMax: 5,
  heartsRefilledAt: Date.now(),
  gems: 50,
  isPremium: false,
  showRomanization: true,
  sound: true,
  soundEffects: true,  // v30: positive/negative chimes on answers (toggleable)
  theme: "cream",
  sessionSize: 6,
  tutorialSeen: false,
  grammarSeen: {}, // { langCode: [grammarLessonId, ...] } — for in-lesson rotation
  lessonsCompleted: {}, // { langCode: count } — drives review checkpoint cadence
  learningGoal: {}, // v41: { langCode: goalId } — user-chosen focus after the core
  chaptersPassed: {}, // v44: { langCode: [chapterNum,...] } — gated chapter exams passed
  sentenceDropsDone: {}, // v47: { langCode: highestDropNumber } — Sentence Lab progress
  lastCheckpointAt: {}, // { langCode: lessonCount when last checkpoint cleared }
  testedOut: {}, // { langCode: [wordId,...] } — words skipped via placement test
  scriptCourse: {}, // v99: { langCode: { passed, at, score } } — Chapter 0's reading exam
  passagesRead: {}, // v79: { langCode: [passageId,...] } — so the reading library advances
  voice: null, // v74: { coachVoiceURI, tone, speed, targetVoiceURI } — null = automatic
  disabledExercises: [], // v76: exercise types the learner switched off
  consent: null, // v77: { ageConfirmed, terms, at, policyVersion } — set at onboarding
  aiConsent: null, // v77: { accepted, at, ageConfirmed } — the separate, higher AI bar
  aiReports: [], // v77: locally-held reports of bad AI output; goes out with the export
  userName: "", // v57: what the coach calls you
  momentDone: {}, // v57: { langCode: dateString } — daily Moment recall done
  planVisited: {}, // v57: { langCode: { date, speak, life } } — plan step visits
  sessions: [],
};

export default function App() {
  // v103 — the saved state is reconciled against DEFAULT_APP_STATE before the
  // app ever sees it. It comes from localStorage, which is shared with every
  // version of Zaban that has run on this device and can be edited by hand, so
  // it can be missing keys added since the learner last opened the app, or
  // carry a value of the wrong type. One wrong type used to be enough to leave
  // the route map on "Loading…" forever with no error screen and no way back.
  const [appState, setAppState, loaded] = usePersistentState("app", DEFAULT_APP_STATE, (saved) => {
    const { state, repaired } = normalizeAppState(saved, DEFAULT_APP_STATE);
    normalizeLanguageLists(state, repaired);
    if (repaired.length) {
      console.warn(`[state] reconciled ${repaired.length} field(s) from an older or damaged save:`, repaired.join(", "));
    }
    return state;
  });
  const [screen, setScreen] = useState("home");
  const [params, setParams] = useState(null);
  // v104.2 — FOCUS FOLLOWS THE SCREEN, for keyboard and screen-reader users.
  //
  // <main key={screen}> has fully remounted on every navigation since v78 —
  // that is what makes the screen-reader landmark meaningful in the first
  // place. But nothing ever moved FOCUS to it. Measured directly: focus a
  // button that lives inside <main> (anything that isn't the persistent tab
  // bar — a card, a "Retake exam" button, a journey stop), activate it with
  // the keyboard, and the element it was on is destroyed by the remount.
  // Focus does not move to the new screen; it falls all the way back to
  // <body>. A keyboard user's next Tab starts from the very top of the page
  // — the language picker in the top bar — every single time they navigate
  // by anything other than the five tab-bar buttons, which happen to survive
  // the remount and so happen to keep focus by accident.
  //
  // The effect below moves focus to <main> on EVERY navigation, including a
  // tap on a tab-bar button — checked directly rather than assumed, because
  // the tab bar survives the remount (see FOCUSED / the persistent chrome)
  // and the first instinct is that focus should just stay there. It
  // shouldn't: a screen reader given nothing after "Practice" is pressed
  // announces nothing at all — the person has to go hunting to discover the
  // screen even changed. Native mobile accessibility does the same thing on
  // a tab switch for the same reason. What a sighted keyboard user loses is
  // smaller — their next Tab reaches the new screen's first control rather
  // than the next tab along — and is the trade the platforms it copies make
  // too.
  const mainRef = useRef(null);
  const everMounted = useRef(false);

  const { engine, pack, stats, loading, refreshStats } = useEngine(appState?.currentLanguage);
  // v73: the learner profile is owned here, once, and passed down. Speak, the
  // missions and the fluency screen all read AND write it; a per-screen copy
  // would let one screen's stale snapshot overwrite another's fresh write.
  const { profile, mutate: mutateProfile } = useProfile(appState?.currentLanguage);

  // Apply theme whenever it changes
  useEffect(() => {
    if (appState?.theme) applyTheme(appState.theme);
  }, [appState?.theme]);

  // v74: push the learner's voice choice into the audio layer. It lives in
  // module state rather than context so audio can be called from anywhere, so
  // this is the one place that keeps it in sync with what's persisted.
  useEffect(() => {
    setVoicePrefs(appState?.voice);
  }, [appState?.voice]);

  // Hearts auto-refill: 1 heart per 30 min for free users
  useEffect(() => {
    if (!appState || appState.isPremium) return;
    const id = setInterval(() => {
      setAppState((s) => {
        if (!s || s.hearts >= s.heartsMax) return s;
        const elapsed = Date.now() - (s.heartsRefilledAt || Date.now());
        const refill = Math.floor(elapsed / (30 * 60 * 1000));
        if (refill < 1) return s;
        return {
          ...s,
          hearts: Math.min(s.heartsMax, s.hearts + refill),
          heartsRefilledAt: Date.now(),
        };
      });
    }, 60000);
    return () => clearInterval(id);
  }, [appState?.isPremium, setAppState]);

  // v104 — NAVIGATION HAS A HISTORY NOW, AND A DIRECTION.
  //
  // This was `setScreen(s); setParams(p); window.scrollTo(0, 0)`. Nothing
  // touched the history stack, so measured in a browser: home → Practice →
  // Flashcards → press back, and you land on about:blank. On Android and in
  // any installed PWA the system back gesture is that button, so back closed
  // the app from every screen in it.
  //
  // It also scrolled to the top unconditionally, which is right when you go
  // deeper and wrong when you come back — returning to a long home screen
  // always threw away your place.
  //
  // See src/ui/navigation.js for the stack, and index.css for what "forward"
  // and "back" look like.
  const navRef = useRef(null);
  const screenRef = useRef("home");
  // v104.2 — WHETHER THE SCREEN CURRENTLY ON-DOM WAS PUSHED IN BY A REAL VIEW
  // TRANSITION, decided in JS instead of raced in CSS.
  //
  // `.screen-enter`'s fade was suppressed only WHILE a transition was active:
  //   html:active-view-transition .screen-enter { animation: none; }
  // Measured with getAnimations() on a real back-navigation, that rule does
  // not just fail to help — it manufactures a second glitch. The push finishes,
  // `:active-view-transition` goes false, and `.screen-enter`'s animation-name
  // flips from `none` back to `screenIn2`. Per the CSS Animations spec, that
  // transition — even re-applying a name the element already "had" before it
  // was suppressed — starts a BRAND NEW animation instance. So immediately
  // after the slide settles, the whole panel drops to transparent and fades
  // back up over ~250ms: getComputedStyle read opacity 0 the instant the
  // transition ended, then 0.37 → 0.62 → 0.77 → 0.86 → 0.95 → 1 over the next
  // four frames. That is the "flash" — not the slide, a second animation
  // the slide's own end was silently triggering.
  //
  // The fix is to never let `.screen-enter` exist on a view-transitioned
  // screen at all, decided once, before the DOM changes, rather than raced
  // against a CSS pseudo-class that flips at the wrong moment.
  const animatedByViewTransition = useRef(false);
  if (!navRef.current) {
    navRef.current = createNavigator({
      onChange: (entry, direction) => {
        // A lesson takes over the viewport and has no bottom bar. Tell CSS
        // which way the chrome is going so it can fade the bar rather than
        // letting it sit there for the whole transition and then vanish in one
        // frame — a pop at the exact moment the learner is looking at it.
        const wasFocused = FOCUSED.has(screenRef.current);
        const willFocus = FOCUSED.has(entry.screen);
        const chrome = wasFocused === willFocus ? [] : [willFocus ? "chromeout" : "chromein"];
        screenRef.current = entry.screen;
        // Mirrors withTransition's own condition exactly, so this is set to
        // true only when a view transition will actually run — never when it
        // is about to fall back to a plain DOM update.
        animatedByViewTransition.current = canViewTransition && !prefersReducedMotion();
        withTransition(direction, () => {
          flushSync(() => {
            setScreen(entry.screen);
            setParams(entry.params);
          });
        }, chrome);
      },
      getScroll: () => window.scrollY,
      // Restoring scroll has to wait for the new screen to have laid out, or
      // there is nothing yet to scroll to and the browser clamps to 0.
      setScroll: (y) => requestAnimationFrame(() => window.scrollTo(0, y)),
    });
  }

  useEffect(() => {
    navRef.current.replace("home", null);
    const onPop = (e) => navRef.current.onPop(e);
    window.addEventListener("popstate", onPop);
    prefetchScreens();
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // v104.2 — see the note above mainRef. Skips the very first screen: nobody
  // navigated to get there, and stealing focus the instant the app opens —
  // before anyone has done anything — is its own kind of disorienting.
  // preventScroll because scroll position is already handled by the nav
  // stack (top on the way in, restored on the way back); without it, focus()
  // performs its own scroll-into-view first and the two fight each other.
  useEffect(() => {
    if (!everMounted.current) { everMounted.current = true; return; }
    mainRef.current?.focus({ preventScroll: true });
  }, [screen]);

  const navigate = useCallback((s, p) => {
    navRef.current.go(s, p);
  }, []);

  // v104.3 — these three all used to call `setScreen("home")` directly,
  // bypassing navRef the same way the exam-retake bug did. Measured with
  // Playwright: after switching language, `history.length` didn't move and
  // `history.state.linguaIndex` stayed pointed at the entry from BEFORE the
  // switch — the navigator's stack thought it was still wherever the user
  // had been, while the screen on-DOM said "home". It never visibly broke
  // navigation here only because switching language routes through
  // <Onboarding>, which renders above the screen/<main> system entirely and
  // so never asks the desynced stack a question it would get wrong. That's
  // luck, not correctness, and `params` was left stale too — a plain
  // setScreen never clears it, so whatever params the PREVIOUS screen was
  // showing (a lesson's exercise filter, a conversation stop id) stayed in
  // React state after the jump to "home".
  //
  // `replace`, not `go`: this isn't a place to arrive at that back should
  // walk you out of — it's a full reset of context (new language, or a wiped
  // account), so the current stack entry becomes "home" in place rather than
  // stacking a new one on top of wherever the user happened to be.
  const resetToHome = useCallback(() => {
    navRef.current.replace("home", null);
    screenRef.current = "home";
    // No view transition ran for this jump, so let the plain CSS entrance
    // animation play instead of leaving `<main>` a hard, unanimated cut.
    animatedByViewTransition.current = false;
    setScreen("home");
    setParams(null);
  }, []);

  const switchLanguage = useCallback(() => {
    setAppState((s) => ({ ...s, onboarded: false, currentLanguage: null }));
    resetToHome();
  }, [setAppState, resetToHome]);

  // v40: instant language switch — change the active language WITHOUT wiping
  // onboarding/goal. Used by the quick-switch picker in the top bar so changing
  // languages is one tap, not a re-onboarding flow. Per-language progress is
  // preserved automatically since it's keyed by language code in storage.
  const pickLanguageInstant = useCallback((code) => {
    setAppState((s) => ({ ...s, currentLanguage: code }));
    resetToHome();
    window.scrollTo(0, 0);
  }, [setAppState, resetToHome]);

  const resetAll = useCallback(async () => {
    await getStorage().clear();
    setAppState(DEFAULT_APP_STATE);
    resetToHome();
  }, [setAppState, resetToHome]);

  // Loading states
  if (!loaded) {
    return <CenterMsg>Loading…</CenterMsg>;
  }

  if (!appState.onboarded || !appState.currentLanguage) {
    return (
      <Onboarding
        onComplete={({ language, goal, consent }) =>
          setAppState((s) => ({
            ...s,
            onboarded: true,
            currentLanguage: language,
            dailyGoalXp: goal,
            // v77 — recorded so the app can prove what was agreed and when, and
            // re-ask if the policies change. Separate from aiConsent, which is a
            // higher bar for a narrower thing.
            consent: consent || s.consent || null,
          }))
        }
      />
    );
  }

  if (loading || !pack) {
    return <CenterMsg>Loading {appState.currentLanguage}…</CenterMsg>;
  }

  // One-time tutorial — shown right after onboarding, before first use.
  if (!appState.tutorialSeen) {
    return <Tutorial langName={LANGUAGES[appState.currentLanguage]?.name || "the language"} onDone={() => setAppState((s) => ({ ...s, tutorialSeen: true }))} />;
  }

  // Screen router.
  //
  // v70 FIX: `params` is part of screenProps rather than passed by hand to the
  // two or three screens someone remembered. It was missing on sentencelab,
  // which reads params.pattern — so the Sentence Lab hero action on Home, one of
  // the four things the coach can pick as your next session, always dead-ended
  // on "No pattern available right now." Screens that take no params ignore it.
  const screenProps = {
    engine, pack, stats, appState, setAppState, params,
    profile, mutateProfile,
    onNavigate: navigate, refreshStats, onPickLanguage: pickLanguageInstant,
  };

  return (
    <ErrorBoundary onRecover={() => navigate("home")}>
      {/* v52: keyed wrapper — remounts on every screen change so the
          screenIn animation plays. No hard cuts between screens. */}
      {/* v67 FIX: the lesson screen hides the side rail, so the shell must
          collapse to a single column — otherwise the lesson lands in the
          212px rail track and gets clipped. */}
      <div className={FOCUSED.has(screen) ? "app-shell app-shell-full" : "app-shell"}>
      {!FOCUSED.has(screen) && (
        <SideRail
          screen={screen}
          onNavigate={navigate}
          streak={appState.streak || 0}
          totalXp={appState.totalXp || 0}
        />
      )}
      {/* v85 — EVERYTHING THAT IS NOT THE RAIL LIVES IN ONE COLUMN.
          .app-shell is a two-track grid on desktop: 212px for the rail, the
          rest for the app. Its children were the rail AND every banner AND the
          <main>, so each extra banner consumed a grid cell and pushed the one
          after it onto the next row. With the policy-change notice showing,
          <main> landed in track ONE — 212px wide, below a 100vh sticky sidebar,
          which reads as a completely blank app on a desktop screen.
          It only bit when a banner was present, which is why every screenshot
          taken with a clean seed looked fine.
          One wrapper means no future banner can do this again. */}
      <div className="app-main">
      <OfflineBar />

      {/* v80 — THE POLICIES CHANGED SINCE YOU AGREED.
          COMPLIANCE.md listed this as outstanding: the version agreed to was
          stored in appState.consent.policyVersion and nothing ever compared it
          to the current one, so an update to what the app does with your data
          would have gone by in silence. It's a bar, not a modal — nothing is
          blocked, because nothing about the change requires blocking someone
          mid-lesson — and dismissing it records the new version as read. */}
      {appState.consent?.terms && appState.consent.policyVersion !== LAST_UPDATED && (
        <div className="policy-update" role="status">
          <span>
            The privacy policy and terms changed on {LAST_UPDATED}.
          </span>
          <button className="policy-update-read" onClick={() => navigate("legal", { policy: "privacy" })}>
            Read what changed
          </button>
          <button
            className="policy-update-ok"
            onClick={() => setAppState((st) => ({ ...st, consent: { ...st.consent, policyVersion: LAST_UPDATED, reviewedAt: Date.now() } }))}
          >
            Got it
          </button>
        </div>
      )}

      {/* v78: <main> — screen readers navigate by landmark, and without one the
          only way to reach content is to walk the whole nav on every screen
          change. Suspense wraps it because the heavier screens are code-split;
          the fallback is deliberately plain, since it shows for a few hundred
          milliseconds at most and a spinner that flashes is worse than a word. */}
      {/* v104.2: "screen-enter" is applied only when THIS screen was not
          pushed in by a view transition — the very first paint (nothing to
          transition from), or a browser/setting where withTransition never
          runs one at all. See the note above animatedByViewTransition.

          tabIndex={-1}: programmatically focusable, never part of the normal
          Tab order — nobody should ever tab INTO the landmark itself, only
          land there because a navigation just happened. See the focus effect
          below for why this needs to exist at all. */}
      <main key={screen} ref={mainRef} tabIndex={-1} className={animatedByViewTransition.current ? "" : "screen-enter"} id="main">
        <Suspense fallback={<div className="screen-loading">Loading…</div>}>
        {screen === "home" && <Home {...screenProps} />}
        {screen === "hub" && <PracticeHub {...screenProps} />}
        {screen === "letters" && <Letters {...screenProps} />}
        {screen === "lesson" && <Lesson {...screenProps} />}
        {screen === "flashcards" && <Flashcards {...screenProps} />}
        {screen === "alphabet" && <AlphabetLessons {...screenProps} />}
        {screen === "scriptexam" && <ScriptExam {...screenProps} />}
        {screen === "practice" && <Practice {...screenProps} />}
        {screen === "speak" && <Speak {...screenProps} />}
        {screen === "culture" && <Culture {...screenProps} />}
        {screen === "missions" && <Missions {...screenProps} />}
        {screen === "fluency" && <Fluency {...screenProps} />}
        {/* v78: both routes land on SkipAhead. "testout" carries params.fromUnit
            and tests that one unit; "skipahead" shows the chapter picker. The old
            TestOut screen ignored the unit it was given and quizzed the whole
            language at random, so the button existed and did the wrong thing. */}
        {(screen === "testout" || screen === "skipahead") && <SkipAhead {...screenProps} />}
        {screen === "dialect" && <DialectDrill {...screenProps} />}
        {screen === "reading" && <Reading {...screenProps} />}
        {screen === "conversations" && <Conversations {...screenProps} />}
        {screen === "sentencelab" && <SentenceLab {...screenProps} />}
        {screen === "grammar" && <Grammar {...screenProps} />}
        {screen === "vocab" && <Vocab {...screenProps} />}
        {screen === "profile" && <Profile {...screenProps} onSwitchLanguage={switchLanguage} />}
        {screen === "settings" && <Settings {...screenProps} onResetAll={resetAll} />}
        {screen === "upgrade" && <Upgrade appState={appState} setAppState={setAppState} onNavigate={navigate} />}
        {screen === "legal" && <Legal {...screenProps} />}
        {screen === "decode" && <Decode {...screenProps} />}
        {screen === "stream" && <InputStream {...screenProps} />}
        {screen === "topics" && <Topics {...screenProps} />}
        {screen === "listen" && <Listen {...screenProps} />}
        </Suspense>
      </main>
      </div>
      </div>
      {!FOCUSED.has(screen) && <BottomNav screen={screen} onNavigate={navigate} />}
    </ErrorBoundary>
  );
}

function CenterMsg({ children }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 100, color: "var(--text-dim)" }}>
      <img src="/mark-160.webp" alt="Zaban" width="72" height="72" style={{ width: 72, height: 72, objectFit: "contain", margin: "0 auto 20px", display: "block", opacity: 0.9 }} />
      {children}
    </div>
  );
}

// =============================================================================
// TUTORIAL — how the app works, shown once after onboarding.
//
// The old version was four emoji slides written when the app was flashcards and
// quizzes. It never mentioned speaking, missions, dialects or skipping ahead —
// so the features people most needed to know about were the ones nobody found.
//
// This says what's here, in the order a new learner meets it, and it makes two
// things explicit that people otherwise discover too late or not at all:
// you can skip material you already know, and you can turn off question types
// that don't suit you.
//
// It stays skippable, and Settings can replay it.
// =============================================================================
function Tutorial({ onDone, langName }) {
  const [step, setStep] = React.useState(0);
  const steps = [
    {
      emoji: "📚",
      title: "Short lessons, every day",
      body: `Each lesson introduces a few new words, then tests them several ways — picking, listening, spelling, building sentences. The most useful ${langName} words come first, so even a week gets you something you can actually use.`,
    },
    {
      emoji: "⏩",
      title: "Already know some? Skip it",
      body: "You don't have to start at hello. From the home screen you can take a chapter test and jump straight past anything you already know — pass it and those words are marked as known instead of taught from scratch.",
    },
    {
      emoji: "🗣️",
      title: "Say things out loud",
      body: "The app listens. It's deliberately lenient: if a native speaker would understand you, that's a pass, and an accent is never a mistake. No microphone, or not somewhere you can talk? Type instead — it's graded the same.",
    },
    {
      emoji: "🎭",
      title: "Real situations, not just words",
      body: "Missions are conversations with something at stake — order without switching to English, argue a refund, get through an interview. You choose who you're up against, and afterwards you get every line you said with a native version beside it.",
    },
    {
      emoji: "🌍",
      title: "The version people actually speak",
      body: `Courses teach the standard form. Streets don't use it. Pick the variety you're learning for and ${langName === "Arabic" ? "you'll see what Cairo or Beirut or the Gulf actually says" : "you'll see the local forms alongside the standard ones"} — and your guide will speak it too.`,
    },
    {
      emoji: "⚙️",
      title: "Make it fit you",
      body: "In Settings you can change the voice that talks to you and how fast it speaks, choose your dialect, set the daily goal and lesson length, and switch off any question type that gets in your way rather than pushing you.",
    },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{s.emoji}</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>{s.title}</h1>
        <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 28 }}>{s.body}</p>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8,
            height: 8,
            borderRadius: 999,
            background: i === step ? "var(--primary)" : "var(--border)",
            // v107: no width transition — animating a layout property re-runs
            // layout each frame (see audit-motion); the dot simply changes.
          }} />
        ))}
      </div>

      <button
        onClick={() => (isLast ? onDone() : setStep(step + 1))}
        style={{
          background: "var(--primary)",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "16px",
          fontSize: 16,
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 4px 0 var(--primary-dark)",
        }}
      >
        {isLast ? "Start learning →" : "Next"}
      </button>
      {!isLast && (
        <button
          onClick={onDone}
          style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 14 }}
        >
          Skip
        </button>
      )}
    </div>
  );
}
