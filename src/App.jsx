// =============================================================================
// APP — root component, owns navigation state, wires engine + screens together.
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { useEngine } from "./hooks/useEngine.js";
import { usePersistentState } from "./hooks/usePersistentState.js";
import { getStorage } from "./storage/index.js";
import { BottomNav, SideRail, Button, Container } from "./ui/primitives.jsx";
import { applyTheme } from "./ui/themes.js";
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
import { Flashcards } from "./screens/Flashcards.jsx";
import { AlphabetLessons } from "./screens/AlphabetLessons.jsx";
import { Reading } from "./screens/Reading.jsx";
import { Conversations } from "./screens/Conversations.jsx";
import { SentenceLab } from "./screens/SentenceLab.jsx";
import { Grammar } from "./screens/Grammar.jsx";
import { Practice } from "./screens/Practice.jsx";
import { Speak } from "./screens/Speak.jsx";
import { Culture } from "./screens/Culture.jsx";
import { TestOut } from "./screens/TestOut.jsx";

// Error boundary — catches crashes and shows a recovery button instead of a white screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text)" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>😵</div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Something went wrong</h2>
          <p style={{ color: "var(--text-dim)", marginBottom: 24, fontSize: 14 }}>
            {String(this.state.error?.message || "Unknown error")}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onRecover?.();
            }}
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 24px",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Go back home
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

  // Apply theme whenever it changes
  useEffect(() => {
    if (appState?.theme) applyTheme(appState.theme);
  }, [appState?.theme]);

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
        onComplete={({ language, goal }) =>
          setAppState((s) => ({ ...s, onboarded: true, currentLanguage: language, dailyGoalXp: goal }))
        }
      />
    );
  }

  if (loading || !pack) {
    return <CenterMsg>Loading {appState.currentLanguage}…</CenterMsg>;
  }

  // One-time tutorial — shown right after onboarding, before first use.
  if (!appState.tutorialSeen) {
    return <Tutorial onDone={() => setAppState((s) => ({ ...s, tutorialSeen: true }))} />;
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
      <div key={screen} className="screen-enter">
        {screen === "home" && <Home {...screenProps} />}
        {screen === "hub" && <PracticeHub {...screenProps} />}
        {screen === "letters" && <Letters {...screenProps} />}
        {screen === "lesson" && <Lesson {...screenProps} />}
        {screen === "flashcards" && <Flashcards {...screenProps} />}
        {screen === "alphabet" && <AlphabetLessons {...screenProps} />}
        {screen === "practice" && <Practice {...screenProps} />}
        {screen === "speak" && <Speak {...screenProps} />}
        {screen === "culture" && <Culture {...screenProps} />}
        {screen === "testout" && <TestOut {...screenProps} />}
        {screen === "reading" && <Reading {...screenProps} />}
        {screen === "conversations" && <Conversations {...screenProps} />}
        {screen === "sentencelab" && <SentenceLab {...screenProps} />}
        {screen === "grammar" && <Grammar {...screenProps} />}
        {screen === "vocab" && <Vocab {...screenProps} />}
        {screen === "profile" && <Profile {...screenProps} onSwitchLanguage={switchLanguage} />}
        {screen === "settings" && <Settings appState={appState} setAppState={setAppState} onResetAll={resetAll} onNavigate={navigate} />}
        {screen === "upgrade" && <Upgrade appState={appState} setAppState={setAppState} onNavigate={navigate} />}
      </div>
      </div>
      {!FOCUSED.has(screen) && <BottomNav screen={screen} onNavigate={navigate} />}
    </ErrorBoundary>
  );
}

function CenterMsg({ children }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 100, color: "var(--text-dim)" }}>
      <img src="/zaban-mark-transparent.png" alt="Zaban" style={{ width: 72, height: 72, objectFit: "contain", margin: "0 auto 20px", display: "block", opacity: 0.9 }} />
      {children}
    </div>
  );
}

// One-time tutorial — explains how the app works. Shown once after onboarding.
// Kept short and skippable; this is "how to use it", not a feature tour.
function Tutorial({ onDone }) {
  const [step, setStep] = React.useState(0);
  const steps = [
    {
      emoji: "📚",
      title: "Learn by doing",
      body: "Each lesson introduces a few new words as flashcards, then quizzes you in different ways — picking, listening, and building sentences. Short sessions, every day, is how it sticks.",
    },
    {
      emoji: "🔤",
      title: "Reading the script",
      body: "For languages like Urdu or Korean, you'll always see the pronunciation (in English letters) under the native script. You don't need to read the script on day one — sound it out and it comes with time.",
    },
    {
      emoji: "💡",
      title: "Stuck? That's fine",
      body: "If you're stuck on a question for a while, a hint appears. If audio won't play on your device, you can skip listening questions. Getting things wrong is part of learning — you'll review your mistakes at the end.",
    },
    {
      emoji: "🗣️",
      title: "Beyond words",
      body: "Once you know some words, try Read & Understand for short passages, and Conversation Starters for real phrases you'll actually use. Browse those freely — they're not tested.",
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
