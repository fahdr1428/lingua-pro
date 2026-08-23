// =============================================================================
// APP — root component, owns navigation state, wires engine + screens together.
// =============================================================================

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useEngine } from "./hooks/useEngine.js";
import { usePersistentState } from "./hooks/usePersistentState.js";
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
const named = (loader, key) => React.lazy(() => loader().then((m) => ({ default: m[key] })));

const Flashcards = named(() => import("./screens/Flashcards.jsx"), "Flashcards");
const AlphabetLessons = named(() => import("./screens/AlphabetLessons.jsx"), "AlphabetLessons");
const Reading = named(() => import("./screens/Reading.jsx"), "Reading");
const Conversations = named(() => import("./screens/Conversations.jsx"), "Conversations");
const SentenceLab = named(() => import("./screens/SentenceLab.jsx"), "SentenceLab");
const Grammar = named(() => import("./screens/Grammar.jsx"), "Grammar");
const Practice = named(() => import("./screens/Practice.jsx"), "Practice");
const Speak = named(() => import("./screens/Speak.jsx"), "Speak");
const Culture = named(() => import("./screens/Culture.jsx"), "Culture");
const Missions = named(() => import("./screens/Missions.jsx"), "Missions");
const Fluency = named(() => import("./screens/Fluency.jsx"), "Fluency");
const SkipAhead = named(() => import("./screens/SkipAhead.jsx"), "SkipAhead");
const DialectDrill = named(() => import("./screens/DialectDrill.jsx"), "DialectDrill");
const Legal = named(() => import("./screens/Legal.jsx"), "Legal");
const Decode = named(() => import("./screens/Decode.jsx"), "Decode");
const InputStream = named(() => import("./screens/InputStream.jsx"), "InputStream");

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
  const [appState, setAppState, loaded] = usePersistentState("app", DEFAULT_APP_STATE);
  const [screen, setScreen] = useState("home");
  const [params, setParams] = useState(null);

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

  const navigate = useCallback((s, p) => {
    setScreen(s);
    setParams(p || null);
    window.scrollTo(0, 0);
  }, []);

  const switchLanguage = useCallback(() => {
    setAppState((s) => ({ ...s, onboarded: false, currentLanguage: null }));
    setScreen("home");
  }, [setAppState]);

  // v40: instant language switch — change the active language WITHOUT wiping
  // onboarding/goal. Used by the quick-switch picker in the top bar so changing
  // languages is one tap, not a re-onboarding flow. Per-language progress is
  // preserved automatically since it's keyed by language code in storage.
  const pickLanguageInstant = useCallback((code) => {
    setAppState((s) => ({ ...s, currentLanguage: code }));
    setScreen("home");
    window.scrollTo(0, 0);
  }, [setAppState]);

  const resetAll = useCallback(async () => {
    await getStorage().clear();
    setAppState(DEFAULT_APP_STATE);
    setScreen("home");
  }, [setAppState]);

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
      <main key={screen} className="screen-enter" id="main">
        <Suspense fallback={<div className="screen-loading">Loading…</div>}>
        {screen === "home" && <Home {...screenProps} />}
        {screen === "hub" && <PracticeHub {...screenProps} />}
        {screen === "letters" && <Letters {...screenProps} />}
        {screen === "lesson" && <Lesson {...screenProps} />}
        {screen === "flashcards" && <Flashcards {...screenProps} />}
        {screen === "alphabet" && <AlphabetLessons {...screenProps} />}
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
            transition: "width 0.2s",
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
