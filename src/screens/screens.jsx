// =============================================================================
// SCREENS — thin React components. They consume useEngine and call engine
// methods. No business logic lives here.
// =============================================================================

import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, ProgressBar, TopBar, Container } from "../ui/primitives.jsx";
import { listLanguages, LANGUAGES } from "../data/registry.js";
import { speak } from "../audio/tts.js";
import { masteryLevel, retrievability } from "../engine/srs.js";
import { THEMES } from "../ui/themes.js";
import { getCharacter, getGreeting } from "../data/characters.js";
import { getLevel, earnedBadges, BADGES, getDailyMissions, getProgressionMilestones } from "../engine/gamification.js";

// =============================================================================
// ONBOARDING — language picker + daily goal
// =============================================================================

export function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState(null);
  const [goal, setGoal] = useState(30);

  if (step === 0) {
    return (
      <Container style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🌍</div>
        <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 12px", letterSpacing: -1 }}>Lingua</h1>
        <p style={{ fontSize: 18, color: "var(--text-dim)", maxWidth: 380, margin: "0 auto 40px", lineHeight: 1.5 }}>
          Learn the languages the world ignores. Real grammar frameworks. Adaptive spaced repetition. No fluff.
        </p>
        <Button onClick={() => setStep(1)}>Get Started</Button>
      </Container>
    );
  }

  if (step === 1) {
    return (
      <Container>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 20 }}>Pick a language</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 24 }}>Start with one. Add more later.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {listLanguages().map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{
                background: language === lang.code ? lang.color : "var(--surface)",
                border: `2px solid ${language === lang.code ? lang.color : "var(--border)"}`,
                borderRadius: 16,
                padding: 18,
                cursor: "pointer",
                color: "var(--text)",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 6 }}>{lang.flag}</div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{lang.name}</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>{lang.nativeName}</div>
              {lang.niche && (
                <div
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.3)",
                    color: "#ffd700",
                    fontWeight: 700,
                  }}
                >
                  ⭐ Rare find
                </div>
              )}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Button style={{ opacity: language ? 1 : 0.4 }} disabled={!language} onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      </Container>
    );
  }

  // Step 2 — daily goal
  const goals = [
    { xp: 10, label: "Casual", time: "5 min/day" },
    { xp: 30, label: "Regular", time: "15 min/day" },
    { xp: 60, label: "Serious", time: "30 min/day" },
    { xp: 120, label: "Intense", time: "60 min/day" },
  ];
  return (
    <Container>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 20 }}>Daily goal</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 24 }}>You can change this anytime.</p>
      {goals.map((g) => (
        <button
          key={g.xp}
          onClick={() => setGoal(g.xp)}
          style={{
            background: goal === g.xp ? "var(--primary-dark)" : "var(--surface)",
            border: `2px solid ${goal === g.xp ? "var(--primary)" : "var(--border)"}`,
            borderRadius: 16,
            padding: 20,
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            color: "var(--text)",
            textAlign: "left",
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{g.label}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{g.time}</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>{g.xp} XP</div>
        </button>
      ))}
      <div style={{ marginTop: 24 }}>
        <Button onClick={() => onComplete({ language, goal })}>Start Learning</Button>
      </div>
    </Container>
  );
}

// =============================================================================
// HOME — Duolingo-style unit path
// =============================================================================

export function Home({ engine, pack, stats, appState, setAppState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const [unitProgress, setUnitProgress] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  // After the intro has been shown once, remember it so the character
  // switches to rotating short greetings instead of re-introducing itself.
  useEffect(() => {
    const met = appState.metCharacters || [];
    if (getCharacter(pack.code) && !met.includes(pack.code)) {
      const t = setTimeout(() => {
        setAppState((s) => ({
          ...s,
          metCharacters: [...(s.metCharacters || []), pack.code],
        }));
      }, 4000); // let them read the intro first
      return () => clearTimeout(t);
    }
  }, [pack.code]);

  const todayXp = useMemo(() => {
    const today = new Date().toDateString();
    return (appState.sessions || [])
      .filter((s) => new Date(s.ts).toDateString() === today && s.language === pack.code)
      .reduce((sum, s) => sum + (s.xp || 0), 0);
  }, [appState.sessions, pack.code]);

  // Load unit progress
  useEffect(() => {
    let cancelled = false;
    engine.getUnitProgress().then((up) => {
      if (cancelled) return;
      // Mark which units are unlocked: first one always, others if previous >= 30%
      const enriched = up.map((u, i) => {
        if (i === 0) return { ...u, unlocked: true };
        const prev = up[i - 1];
        return { ...u, unlocked: prev.pct >= 0.3 };
      });
      setUnitProgress(enriched);
      setLoadingUnits(false);
    });
  }, [engine, stats]);

  const framework = pack.frameworks?.[0];

  // Find the current unit (first unlocked but not 100% complete)
  const currentUnit = unitProgress.find((u) => u.unlocked && u.pct < 1) || unitProgress[0];

  return (
    <div>
      <TopBar
        streak={appState.streak}
        gems={appState.gems}
        hearts={appState.hearts}
        totalXp={appState.totalXp}
        premium={appState.isPremium}
      />
      <Container>
        {/* Cultural guide — gives the app a rooted, human feel */}
        {(() => {
          const character = getCharacter(pack.code);
          if (!character) return null;
          const hasMet = (appState.metCharacters || []).includes(pack.code);
          const greeting = hasMet ? getGreeting(pack.code) : character.intro;
          return (
            <Card style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "var(--surface)",
              border: `1px solid var(--border)`,
              borderLeft: `4px solid ${character.accent}`,
            }}>
              <div style={{
                fontSize: 40,
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--surface-hi)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {character.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: character.accent }}>
                  {character.name} · <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>{character.role}</span>
                </div>
                <div style={{ fontSize: 14, color: "var(--text)", marginTop: 3, lineHeight: 1.4 }}>
                  {greeting}
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Daily goal hero */}
        <Card style={{ background: `linear-gradient(135deg, ${lang.color}, var(--surface))` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Daily Goal</div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>{todayXp} / {appState.dailyGoalXp} XP</div>
            </div>
            <div style={{ fontSize: 50 }}>{lang.flag}</div>
          </div>
          <ProgressBar value={todayXp} max={appState.dailyGoalXp} color="var(--accent)" />
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
            {todayXp >= appState.dailyGoalXp ? "🎉 Goal smashed for today!" : `${appState.dailyGoalXp - todayXp} XP to go`}
          </div>
        </Card>

        {/* The HERO button — most important on screen. Always works. */}
        {currentUnit && (
          <button
            onClick={() => onNavigate("lesson", { mode: "unit", filter: { unit: currentUnit.id } })}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "24px 20px",
              color: "#fff",
              cursor: "pointer",
              marginBottom: 24,
              boxShadow: "0 6px 0 var(--primary-dark)",
              transition: "transform 0.1s",
              textAlign: "left",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            onTouchStart={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
            onTouchEnd={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.9, letterSpacing: 1, textTransform: "uppercase" }}>
              {currentUnit.pct === 0 ? "Start here" : "Continue learning"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
              {currentUnit.emoji} {currentUnit.title}
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              {currentUnit.description}
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, opacity: 0.95 }}>
                {currentUnit.learned} / {currentUnit.total} words
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.25)",
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                START →
              </div>
            </div>
          </button>
        )}

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          <Card style={{ marginBottom: 0, textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--primary)" }}>{stats.learned}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Learned</div>
          </Card>
          <Card style={{ marginBottom: 0, textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--accent)" }}>{stats.due}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Due now</div>
          </Card>
          <Card style={{ marginBottom: 0, textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--purple)" }}>{stats.mastered}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Mastered</div>
          </Card>
        </div>

        {/* Quick actions */}
        {stats.due > 0 && (
          <Button
            style={{ background: "var(--blue)", boxShadow: "0 4px 0 #1e40af", marginBottom: 24 }}
            onClick={() => onNavigate("lesson", { mode: "due" })}
          >
            🔄 Review {stats.due} word{stats.due === 1 ? "" : "s"}
          </Button>
        )}

        {/* Alphabet course (proper curriculum, not just a reference) */}
        {pack.alphabet?.length > 0 && (
          <button
            onClick={() => onNavigate("alphabet")}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, var(--purple), var(--surface))",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: 20,
              color: "var(--text)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              marginBottom: 12,
              textAlign: "left",
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Letters & Sounds</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                {(pack.alphabetGroups || []).length > 1
                  ? `${pack.alphabetGroups.length} lessons · learn the script step by step`
                  : "Master the alphabet first"}
              </div>
            </div>
            <div style={{ fontSize: 36 }}>🔤</div>
          </button>
        )}

        {/* Flashcards entry */}
        <button
          onClick={() => onNavigate("flashcards")}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, var(--blue), var(--surface))",
            border: "none",
            borderRadius: "var(--radius-lg)",
            padding: 20,
            color: "var(--text)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            marginBottom: 12,
            textAlign: "left",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Flashcards</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Browse words at your own pace</div>
          </div>
          <div style={{ fontSize: 36 }}>📇</div>
        </button>

        {/* Reading entry — comprehensible input */}
        <button
          onClick={() => onNavigate("reading")}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, var(--primary), var(--surface))",
            border: "none",
            borderRadius: "var(--radius-lg)",
            padding: 20,
            color: "var(--text)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            marginBottom: 12,
            textAlign: "left",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Read &amp; Understand</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Short passages with audio &amp; subtitles</div>
          </div>
          <div style={{ fontSize: 36 }}>📖</div>
        </button>

        {/* Conversation starters — browsable phrasebook */}
        <button
          onClick={() => onNavigate("conversations")}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, var(--accent), var(--surface))",
            border: "none",
            borderRadius: "var(--radius-lg)",
            padding: 20,
            color: "var(--text)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Conversation Starters</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Real phrases you'll actually use — browse freely</div>
          </div>
          <div style={{ fontSize: 36 }}>💬</div>
        </button>

        {/* The unit path — the visual learning journey */}
        <h3 style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
          Learning path
        </h3>

        {loadingUnits ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {unitProgress.map((unit, i) => (
              <UnitNode
                key={unit.id}
                unit={unit}
                index={i}
                isCurrent={currentUnit?.id === unit.id}
                onTap={() => unit.unlocked && onNavigate("lesson", { mode: "unit", filter: { unit: unit.id } })}
              />
            ))}
          </div>
        )}

        {/* Framework callout */}
        {framework && (
          <Card style={{ marginTop: 24, background: "var(--surface-hi)", border: "2px dashed var(--accent)" }}>
            <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>
              ⚡ FRAMEWORK
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{framework.title}</div>
            <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5 }}>{framework.body}</div>
          </Card>
        )}
      </Container>
    </div>
  );
}

// Visual unit node on the path
function UnitNode({ unit, index, isCurrent, onTap }) {
  const isComplete = unit.pct >= 1;
  const isLocked = !unit.unlocked;
  const isStarted = unit.learned > 0 && !isComplete;

  let bg, fg, border;
  if (isLocked) {
    bg = "var(--surface)";
    fg = "var(--text-mute)";
    border = "var(--border)";
  } else if (isComplete) {
    bg = "linear-gradient(135deg, var(--accent), #f59e0b)";
    fg = "#000";
    border = "var(--accent)";
  } else if (isCurrent) {
    bg = "linear-gradient(135deg, var(--primary), var(--primary-dark))";
    fg = "#fff";
    border = "var(--primary)";
  } else {
    bg = "var(--surface)";
    fg = "var(--text)";
    border = "var(--border)";
  }

  return (
    <button
      onClick={onTap}
      disabled={isLocked}
      style={{
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: "var(--radius-lg)",
        padding: 16,
        color: fg,
        cursor: isLocked ? "not-allowed" : "pointer",
        textAlign: "left",
        opacity: isLocked ? 0.55 : 1,
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: isCurrent ? "0 4px 0 var(--primary-dark)" : "none",
        transition: "transform 0.1s",
      }}
    >
      {/* Big circle/badge */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: isLocked ? "var(--surface-hi)" : "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          flexShrink: 0,
          position: "relative",
        }}
      >
        {isLocked ? "🔒" : isComplete ? "⭐" : unit.emoji}
        {/* Progress ring */}
        {!isLocked && !isComplete && unit.pct > 0 && (
          <svg
            style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
            width="56"
            height="56"
          >
            <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3" />
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="3"
              strokeDasharray={`${unit.pct * 163} 163`}
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Title + progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>
          Unit {index + 1}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{unit.title}</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
          {isLocked
            ? "Complete previous unit to unlock"
            : isComplete
            ? `🏆 Complete · ${unit.mastered} mastered`
            : `${unit.learned} / ${unit.total} words`}
        </div>
      </div>

      {!isLocked && (
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            opacity: 0.9,
            flexShrink: 0,
          }}
        >
          →
        </div>
      )}
    </button>
  );
}

// =============================================================================
// LETTERS
// =============================================================================

export function Letters({ pack, appState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const letters = pack.alphabet || [];
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <TopBar streak={appState.streak} gems={appState.gems} hearts={appState.hearts} totalXp={appState.totalXp} premium={appState.isPremium} />
      <Container>
        <Button variant="ghost" onClick={() => onNavigate("home")}>← Back</Button>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 4px" }}>Letters & Sounds</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 20 }}>
          Tap any letter to hear it. Listen, repeat, master the sounds before words.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))", gap: 10 }}>
          {letters.map((l, i) => (
            <button
              key={i}
              onClick={() => { setSelected(l); speak(l.char, lang.ttsCode); }}
              style={{
                background: selected?.char === l.char ? "var(--primary-dark)" : "var(--surface)",
                border: `2px solid ${selected?.char === l.char ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                padding: 16,
                color: "var(--text)",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  direction: lang.rtl ? "rtl" : "ltr",
                  fontFamily: lang.rtl ? '"Noto Naskh Arabic", serif' : "inherit",
                }}
              >
                {l.char}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{l.name}</div>
            </button>
          ))}
        </div>
        {selected && (
          <Card style={{ marginTop: 20, background: "var(--surface-hi)" }}>
            <div style={{ fontSize: 14, color: "var(--text-dim)" }}>Letter</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{selected.name} ({selected.char})</div>
            <div style={{ marginTop: 8, fontSize: 14 }}><strong>Sound:</strong> {selected.sound}</div>
            <Button style={{ marginTop: 14 }} onClick={() => speak(selected.char, lang.ttsCode)}>
              🔊 Hear again
            </Button>
          </Card>
        )}
      </Container>
    </div>
  );
}

// =============================================================================
// VOCAB BROWSER
// =============================================================================

export function Vocab({ engine, pack, appState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const all = pack.vocab || [];
  const categories = ["All", ...pack.categories];
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState({});

  useEffect(() => {
    engine.getProgress().then(setProgress);
  }, [engine]);

  const filtered = all.filter((v) => {
    if (filter !== "All" && v.category !== filter) return false;
    if (search && !v.translation.toLowerCase().includes(search.toLowerCase()) && !v.translit.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <TopBar streak={appState.streak} gems={appState.gems} hearts={appState.hearts} totalXp={appState.totalXp} premium={appState.isPremium} />
      <Container>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>Vocabulary</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            background: "var(--surface-hi)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontSize: 16,
            boxSizing: "border-box",
            marginBottom: 12,
          }}
        />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                background: filter === c ? "var(--primary)" : "var(--surface-hi)",
                color: filter === c ? "#fff" : "var(--text-dim)",
                border: "none",
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        {filtered.map((v) => {
          const card = progress[v.id];
          const m = card ? masteryLevel(card) : 0;
          return (
            <Card key={v.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      direction: lang.rtl ? "rtl" : "ltr",
                      fontFamily: lang.rtl ? '"Noto Naskh Arabic", serif' : "inherit",
                    }}
                  >
                    {v.lemma}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic" }}>{v.translit}</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{v.translation}</div>
                </div>
                <button
                  onClick={() => speak(v.lemma, lang.ttsCode, { audioId: v.id })}
                  style={{
                    background: "var(--surface-hi)",
                    border: "none",
                    borderRadius: 999,
                    width: 40,
                    height: 40,
                    fontSize: 18,
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                >
                  🔊
                </button>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      background: i < m ? "var(--primary)" : "var(--surface-hi)",
                      borderRadius: 999,
                    }}
                  />
                ))}
              </div>
            </Card>
          );
        })}
      </Container>
    </div>
  );
}

// =============================================================================
// PROFILE
// =============================================================================

export function Profile({ engine, pack, stats, appState, onNavigate, onSwitchLanguage }) {
  const lang = LANGUAGES[pack.code];
  const [unitProgress, setUnitProgress] = useState([]);
  const [masteryBreakdown, setMasteryBreakdown] = useState({ new: 0, learning: 0, familiar: 0, mastered: 0 });

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      const xp = (appState.sessions || [])
        .filter((s) => new Date(s.ts).toDateString() === d.toDateString())
        .reduce((sum, s) => sum + (s.xp || 0), 0);
      return { day: d.toLocaleDateString("en", { weekday: "short" })[0], xp, isToday: i === 6 };
    });
  }, [appState.sessions]);
  const maxXp = Math.max(...last7Days.map((d) => d.xp), 30);

  // Words learned this week
  const wordsThisWeek = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    return (appState.sessions || [])
      .filter((s) => new Date(s.ts).getTime() >= sevenDaysAgo)
      .reduce((sum, s) => sum + (s.correct || 0), 0);
  }, [appState.sessions]);

  // Total study time this week (minutes)
  const studyMinsThisWeek = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const ms = (appState.sessions || [])
      .filter((s) => new Date(s.ts).getTime() >= sevenDaysAgo)
      .reduce((sum, s) => sum + (s.durationMs || 0), 0);
    return Math.round(ms / 60000);
  }, [appState.sessions]);

  // Load unit + mastery breakdown from engine
  useEffect(() => {
    if (!engine) return;
    let cancelled = false;
    Promise.all([engine.getUnitProgress(), engine.getProgress()]).then(([units, progress]) => {
      if (cancelled) return;
      setUnitProgress(units);
      // Bucket each word by mastery level
      const breakdown = { new: 0, learning: 0, familiar: 0, mastered: 0 };
      for (const v of pack.vocab || []) {
        const card = progress[v.id];
        if (!card || card.reps === 0) breakdown.new++;
        else if (card.reps < 3) breakdown.learning++;
        else if (masteryLevel(card) >= 4) breakdown.mastered++;
        else breakdown.familiar++;
      }
      setMasteryBreakdown(breakdown);
    });
    return () => { cancelled = true; };
  }, [engine, pack.vocab, stats]);

  const totalWords = pack.vocab?.length || 0;
  const masteryTotal = Math.max(1, totalWords);

  return (
    <div>
      <TopBar streak={appState.streak} gems={appState.gems} hearts={appState.hearts} totalXp={appState.totalXp} premium={appState.isPremium} />
      <Container>
        <Card style={{ textAlign: "center", background: `linear-gradient(135deg, ${lang.color}, var(--surface))` }}>
          <div style={{ fontSize: 60 }}>{lang.flag}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>Learning {lang.name}</div>
          <div style={{ opacity: 0.9, fontSize: 14 }}>{lang.tagline}</div>
        </Card>

        {/* This week summary */}
        <h3 style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginTop: 8, marginBottom: 12 }}>
          This week
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          <Card style={{ marginBottom: 0, textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--primary)" }}>{wordsThisWeek}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Words practiced</div>
          </Card>
          <Card style={{ marginBottom: 0, textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--accent)" }}>{studyMinsThisWeek}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Minutes</div>
          </Card>
          <Card style={{ marginBottom: 0, textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--danger)" }}>{appState.streak}🔥</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Day streak</div>
          </Card>
        </div>

        {/* 7-day chart */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>XP earned (last 7 days)</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 8, height: 100 }}>
            {last7Days.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{d.xp || ""}</div>
                <div
                  style={{
                    width: "100%",
                    background: d.xp > 0 ? (d.isToday ? "var(--accent)" : "var(--primary)") : "var(--surface-hi)",
                    borderRadius: 6,
                    height: `${Math.max(4, (d.xp / maxXp) * 80)}px`,
                    transition: "height 0.4s",
                  }}
                />
                <div style={{ fontSize: 11, color: d.isToday ? "var(--accent)" : "var(--text-dim)", fontWeight: 700 }}>{d.day}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Mastery breakdown */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
            Word mastery <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({totalWords} total)</span>
          </div>
          <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ width: `${(masteryBreakdown.mastered / masteryTotal) * 100}%`, background: "var(--purple)" }} />
            <div style={{ width: `${(masteryBreakdown.familiar / masteryTotal) * 100}%`, background: "var(--primary)" }} />
            <div style={{ width: `${(masteryBreakdown.learning / masteryTotal) * 100}%`, background: "var(--accent)" }} />
            <div style={{ width: `${(masteryBreakdown.new / masteryTotal) * 100}%`, background: "var(--surface-hi)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
            <MasteryRow color="var(--purple)" label="Mastered" count={masteryBreakdown.mastered} />
            <MasteryRow color="var(--primary)" label="Familiar" count={masteryBreakdown.familiar} />
            <MasteryRow color="var(--accent)" label="Learning" count={masteryBreakdown.learning} />
            <MasteryRow color="var(--surface-hi)" label="Not seen" count={masteryBreakdown.new} />
          </div>
        </Card>

        {/* Per-unit progress */}
        {unitProgress.length > 0 && (
          <Card>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Unit progress</div>
            {unitProgress.map((u) => (
              <div key={u.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {u.emoji} {u.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    {u.learned}/{u.total}
                  </div>
                </div>
                <div style={{ height: 6, background: "var(--surface-hi)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    width: `${u.pct * 100}%`,
                    height: "100%",
                    background: u.pct >= 1 ? "var(--accent)" : "var(--primary)",
                    transition: "width 0.4s",
                  }} />
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* LEVEL — capability ladder, derived from real XP */}
        {(() => {
          const lv = getLevel(appState.totalXp || 0);
          return (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 40 }}>{lv.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>
                    Level {lv.level}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{lv.name}</div>
                </div>
              </div>
              {lv.next ? (
                <>
                  <div style={{ height: 8, background: "var(--surface-hi)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${lv.progressPct * 100}%`, height: "100%", background: "var(--accent)", transition: "width 0.5s" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>
                    {lv.xpToNext} XP to <strong>{lv.next.name}</strong>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>
                  Top level reached — remarkable dedication.
                </div>
              )}
            </Card>
          );
        })()}

        {/* TODAY'S MISSIONS — small purposeful goals */}
        <h3 style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginTop: 8, marginBottom: 12 }}>
          Today's missions
        </h3>
        <Card>
          {getDailyMissions(appState, pack).map((m, i, arr) => (
            <div key={m.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              opacity: m.done ? 0.6 : 1,
            }}>
              <div style={{ fontSize: 22 }}>{m.done ? "✅" : m.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, textDecoration: m.done ? "line-through" : "none" }}>
                  {m.label}
                </div>
                <div style={{ height: 5, background: "var(--surface-hi)", borderRadius: 999, marginTop: 5, overflow: "hidden" }}>
                  <div style={{ width: `${(m.progress / m.target) * 100}%`, height: "100%", background: m.done ? "var(--primary)" : "var(--accent)" }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, minWidth: 36, textAlign: "right" }}>
                {m.progress}/{m.target}
              </div>
            </div>
          ))}
        </Card>

        {/* BADGES — real capabilities & honest consistency */}
        <h3 style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginTop: 8, marginBottom: 12 }}>
          Badges
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {(() => {
            const ctx = { stats, appState, pack };
            const earned = new Set(earnedBadges(ctx).map((b) => b.id));
            return BADGES.map((b) => {
              const has = earned.has(b.id);
              return (
                <Card key={b.id} style={{ marginBottom: 0, textAlign: "center", opacity: has ? 1 : 0.3, padding: 14 }}>
                  <div style={{ fontSize: 30, filter: has ? "none" : "grayscale(1)" }}>{b.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, marginTop: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 2, lineHeight: 1.3 }}>{b.desc}</div>
                </Card>
              );
            });
          })()}
        </div>

        {/* PROGRESSION PATH — capability journey, not just numbers.
            Shows what the learner can now actually DO. Healthy motivation. */}
        <h3 style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginTop: 24, marginBottom: 12 }}>
          Your journey
        </h3>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {(() => {
            // Build milestone context from available data
            let alphabetDone = false;
            try {
              const ap = JSON.parse(localStorage.getItem("alphabet_progress") || "{}");
              alphabetDone = Object.keys(ap[pack.code] || {}).length > 0;
            } catch {}
            const passagesRead = (appState.sessions || []).filter((s) => s.type === "reading").length;
            const daysStudied = new Set(
              (appState.sessions || []).map((s) => new Date(s.ts).toDateString())
            ).size;
            const mctx = {
              learned: stats.learned || 0,
              mastered: stats.mastered || 0,
              alphabetDone,
              passagesRead,
              daysStudied,
            };
            const milestones = getProgressionMilestones(mctx);
            return milestones.map((m, i) => {
              const isLast = i === milestones.length - 1;
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "14px 16px",
                    borderBottom: isLast ? "none" : "1px solid var(--border)",
                    opacity: m.reached ? 1 : 0.45,
                  }}
                >
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: m.reached ? "var(--primary-soft)" : "var(--surface-hi)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    filter: m.reached ? "none" : "grayscale(1)",
                  }}>
                    {m.reached ? m.emoji : "🔒"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{m.label}</span>
                      {m.reached && (
                        <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>✓ reached</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2, lineHeight: 1.4 }}>
                      {m.capability}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </Card>

        <Button variant="secondary" style={{ marginTop: 16 }} onClick={onSwitchLanguage}>
          🔁 Switch language
        </Button>

        {!appState.isPremium && (
          <Card
            style={{
              marginTop: 16,
              background: "linear-gradient(135deg, var(--accent), var(--pink))",
              color: "#000",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900 }}>✨ Lingua Plus</div>
            <div style={{ fontSize: 14, marginTop: 4, marginBottom: 12 }}>
              Unlimited hearts • Offline mode • No ads
            </div>
            <button
              style={{
                background: "#000",
                color: "var(--accent)",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontWeight: 800,
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() => onNavigate("upgrade")}
            >
              Try free for 7 days
            </button>
          </Card>
        )}
      </Container>
    </div>
  );
}

function MasteryRow({ color, label, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 10, height: 10, borderRadius: 999, background: color, flexShrink: 0 }} />
      <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, marginLeft: "auto" }}>{count}</div>
    </div>
  );
}

// =============================================================================
// SETTINGS
// =============================================================================

export function Settings({ appState, setAppState, onResetAll }) {
  return (
    <div>
      <TopBar streak={appState.streak} gems={appState.gems} hearts={appState.hearts} totalXp={appState.totalXp} premium={appState.isPremium} />
      <Container>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>Settings</h2>
        <Card>
          <Row
            label="Daily goal"
            sub={`${appState.dailyGoalXp} XP per day`}
            control={
              <select
                value={appState.dailyGoalXp}
                onChange={(e) => setAppState((s) => ({ ...s, dailyGoalXp: parseInt(e.target.value) }))}
                style={{
                  background: "var(--surface-hi)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 8,
                }}
              >
                <option value={10}>10 XP</option>
                <option value={30}>30 XP</option>
                <option value={60}>60 XP</option>
                <option value={120}>120 XP</option>
              </select>
            }
          />
          <Row
            label="Lesson length"
            sub={`${appState.sessionSize || 6} questions per lesson`}
            control={
              <select
                value={appState.sessionSize || 6}
                onChange={(e) => setAppState((s) => ({ ...s, sessionSize: parseInt(e.target.value) }))}
                style={{
                  background: "var(--surface-hi)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 8,
                }}
              >
                <option value={4}>Short (4)</option>
                <option value={6}>Normal (6)</option>
                <option value={10}>Long (10)</option>
                <option value={15}>Marathon (15)</option>
              </select>
            }
          />
          <Row
            label="Show romanization"
            sub="Phonetic spelling under each word"
            control={
              <input
                type="checkbox"
                checked={appState.showRomanization !== false}
                onChange={(e) => setAppState((s) => ({ ...s, showRomanization: e.target.checked }))}
                style={{ width: 20, height: 20 }}
              />
            }
          />
          <Row
            label="Sound effects"
            sub="Audio for words and feedback"
            control={
              <input
                type="checkbox"
                checked={appState.sound !== false}
                onChange={(e) => setAppState((s) => ({ ...s, sound: e.target.checked }))}
                style={{ width: 20, height: 20 }}
              />
            }
          />
        </Card>

        {/* Theme picker */}
        <h3 style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginTop: 24, marginBottom: 12 }}>
          Theme
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {Object.entries(THEMES).map(([key, theme]) => {
            const isSelected = (appState.theme || "cream") === key;
            return (
              <button
                key={key}
                onClick={() => setAppState((s) => ({ ...s, theme: key }))}
                style={{
                  background: theme.vars["--surface"],
                  border: `2px solid ${isSelected ? theme.vars["--primary"] : theme.vars["--border"]}`,
                  borderRadius: "var(--radius)",
                  padding: 14,
                  cursor: "pointer",
                  textAlign: "center",
                  color: theme.vars["--text"],
                  position: "relative",
                  minHeight: 110,
                  boxShadow: isSelected ? `0 4px 0 ${theme.vars["--primary-dark"]}` : "none",
                  transition: "transform 0.1s",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>{theme.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{theme.name}</div>
                <div style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.3 }}>{theme.description}</div>
                {isSelected && (
                  <div style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: theme.vars["--primary"],
                    color: "#fff",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}>
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
          onClick={() => {
            if (confirm("Reset all progress? This cannot be undone.")) onResetAll();
          }}
        >
          Reset all progress
        </Button>
        <Card style={{ marginTop: 16, fontSize: 12, color: "var(--text-mute)", textAlign: "center" }}>
          Lingua Pro v0.7 — Built with love for languages the world ignores.
        </Card>
      </Container>
    </div>
  );
}

function Row({ label, sub, control }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div>
        <div style={{ fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{sub}</div>
      </div>
      {control}
    </div>
  );
}

// =============================================================================
// UPGRADE
// =============================================================================

export function Upgrade({ appState, setAppState, onNavigate }) {
  return (
    <div>
      <TopBar streak={appState.streak} gems={appState.gems} hearts={appState.hearts} totalXp={appState.totalXp} premium={appState.isPremium} />
      <Container>
        <Button variant="ghost" onClick={() => onNavigate("profile")}>← Back</Button>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: 60 }}>✨</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "8px 0" }}>Lingua Plus</h1>
          <p style={{ color: "var(--text-dim)" }}>Unlock everything. Support development.</p>
        </div>
        <Card style={{ background: "linear-gradient(135deg, var(--purple), var(--surface))", marginTop: 24 }}>
          {[
            ["❤️", "Unlimited hearts", "Never get blocked mid-lesson"],
            ["📴", "Offline mode", "Learn anywhere"],
            ["🚫", "No ads", "Pure focus"],
            ["📊", "Advanced stats", "See exactly where you're improving"],
            ["🎯", "Custom study lists", "Build vocab decks for trips, exams, work"],
            ["💖", "Support a tiny indie team", "You make this exist"],
          ].map(([emoji, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 24 }}>{emoji}</div>
              <div>
                <div style={{ fontWeight: 800 }}>{title}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{desc}</div>
              </div>
            </div>
          ))}
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
          <button
            style={{
              background: "var(--surface)",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: 20,
              cursor: "pointer",
              color: "var(--text)",
            }}
            onClick={() => setAppState((s) => ({ ...s, isPremium: true }))}
          >
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Monthly</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>£6.99</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Cancel anytime</div>
          </button>
          <button
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.15), var(--surface))",
              border: "2px solid var(--accent)",
              borderRadius: "var(--radius-lg)",
              padding: 20,
              cursor: "pointer",
              color: "var(--text)",
              position: "relative",
            }}
            onClick={() => setAppState((s) => ({ ...s, isPremium: true }))}
          >
            <div
              style={{
                position: "absolute",
                top: -10,
                right: 10,
                background: "var(--accent)",
                color: "#000",
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 999,
                fontWeight: 800,
              }}
            >
              SAVE 40%
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Yearly</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>£49.99</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>£4.16/month</div>
          </button>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-mute)", textAlign: "center", marginTop: 20 }}>
          (Demo button — wire to Stripe/RevenueCat for real billing. See README.)
        </p>
      </Container>
    </div>
  );
}
