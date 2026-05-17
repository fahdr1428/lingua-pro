// =============================================================================
// APP — root component, owns navigation state, wires engine + screens together.
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { useEngine } from "./hooks/useEngine.js";
import { usePersistentState } from "./hooks/usePersistentState.js";
import { getStorage } from "./storage/index.js";
import { BottomNav, Button, Container } from "./ui/primitives.jsx";
import { applyTheme } from "./ui/themes.js";
import {
  Onboarding,
  Home,
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

const DEFAULT_APP_STATE = {
  onboarded: false,
  currentLanguage: null,
  dailyGoalXp: 30,
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
  theme: "cream",
  sessionSize: 6,
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

  // Screen router
  const screenProps = { engine, pack, stats, appState, setAppState, onNavigate: navigate, refreshStats };

  return (
    <ErrorBoundary onRecover={() => navigate("home")}>
      {screen === "home" && <Home {...screenProps} />}
      {screen === "letters" && <Letters {...screenProps} />}
      {screen === "lesson" && <Lesson {...screenProps} params={params} />}
      {screen === "flashcards" && <Flashcards {...screenProps} params={params} />}
      {screen === "alphabet" && <AlphabetLessons {...screenProps} />}
      {screen === "reading" && <Reading {...screenProps} />}
      {screen === "conversations" && <Conversations {...screenProps} />}
      {screen === "vocab" && <Vocab {...screenProps} />}
      {screen === "profile" && <Profile {...screenProps} onSwitchLanguage={switchLanguage} />}
      {screen === "settings" && <Settings appState={appState} setAppState={setAppState} onResetAll={resetAll} />}
      {screen === "upgrade" && <Upgrade appState={appState} setAppState={setAppState} onNavigate={navigate} />}
      {screen !== "lesson" && <BottomNav screen={screen} onNavigate={navigate} />}
    </ErrorBoundary>
  );
}

function CenterMsg({ children }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 100, color: "var(--text-dim)" }}>
      {children}
    </div>
  );
}
