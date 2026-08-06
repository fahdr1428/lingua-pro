// =============================================================================
// SCREENS — thin React components. They consume useEngine and call engine
// methods. No business logic lives here.
// =============================================================================

import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, ProgressBar, TopBar, Container } from "../ui/primitives.jsx";
import { listLanguages, LANGUAGES } from "../data/registry.js";
import { speak } from "../audio/tts.js";
import { pickFunFact } from "../data/funFacts.js";
import { HeroBackdrop } from "../ui/HeroBackdrop.jsx";
import { masteryLevel, retrievability } from "../engine/srs.js";
import { THEMES } from "../ui/themes.js";
import { VoiceSettings, DialectSettings } from "./VoiceSettings.jsx";
import { getCharacter, getGreeting } from "../data/characters.js";
import { getLevel, earnedBadges, BADGES, getDailyMissions, getProgressionMilestones } from "../engine/gamification.js";
import { LEARNING_GOALS, getGoal } from "../data/goals.js";
import { UNITS_PER_CHAPTER, computeUnlocks, isChapterExamAvailable, hasPassedChapter, chapterOfUnitIndex, chapterVocabIds } from "../data/chapters.js";
import { hasSentencePatterns, getPatternForDrop, ladderHeight } from "../data/sentencePatterns.js";

// =============================================================================
// ONBOARDING — language picker + daily goal
// =============================================================================

// v69 (ui-ux-pro-max premium pass): onboarding is the first thing anyone sees,
// so it now shares the "luxury is restraint" language the rest of the app
// settled into — home-wash backdrop, eyebrow step counters, quiet ink-tinted
// selection states instead of a wall of saturated per-language brand colors.
export function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState(null);
  const [goal, setGoal] = useState(35);

  if (step === 0) {
    return (
      <div className="home-wash">
        <Container style={{ paddingTop: "14vh", textAlign: "center" }}>
          <img
            src="/zaban-logo.png"
            alt="Zaban"
            style={{ width: "min(260px, 66vw)", height: "auto", margin: "0 auto 8px", display: "block" }}
          />
          <p style={{ fontSize: 17, color: "var(--text-dim)", maxWidth: 380, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Learn the languages the world ignores. Real grammar frameworks. Adaptive spaced repetition. No fluff.
          </p>
          <Button onClick={() => setStep(1)}>Get started</Button>
        </Container>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="home-wash">
        <Container>
          <div className="eyebrow" style={{ marginTop: 24 }}>Step 1 of 2</div>
          <h2 style={{ fontSize: 27, fontWeight: 600, marginTop: 6, marginBottom: 4 }}>Pick a language</h2>
          <p style={{ color: "var(--text-dim)", marginBottom: 22, fontSize: 14 }}>Start with one. Add more later.</p>
          <div className="stagger" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {listLanguages().map((lang) => {
              const selected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className="card-lift"
                  style={{
                    background: selected ? "var(--primary-soft)" : "var(--surface)",
                    border: `1.5px solid ${selected ? "var(--ink)" : "var(--border)"}`,
                    borderRadius: "var(--radius-lg)",
                    padding: 16,
                    cursor: "pointer",
                    color: "var(--text)",
                    textAlign: "left",
                    boxShadow: selected ? "var(--shadow-deep)" : "var(--shadow-card)",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{lang.flag}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>{lang.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{lang.nativeName}</div>
                  {lang.niche && (
                    <div
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        fontSize: 10.5,
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        fontWeight: 800,
                      }}
                    >
                      ✦ Rare find
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 22, paddingBottom: 24 }}>
            <Button style={{ opacity: language ? 1 : 0.4 }} disabled={!language} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // Step 2 — daily goal
  const goals = [
    { xp: 20, label: "Casual", time: "1 lesson / few days" },
    { xp: 35, label: "Regular", time: "~1 lesson a day" },
    { xp: 70, label: "Serious", time: "~2 lessons a day" },
    { xp: 140, label: "Intense", time: "~4 lessons a day" },
  ];
  return (
    <div className="home-wash">
      <Container>
        <div className="eyebrow" style={{ marginTop: 24 }}>Step 2 of 2</div>
        <h2 style={{ fontSize: 27, fontWeight: 600, marginTop: 6, marginBottom: 4 }}>Daily goal</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 22, fontSize: 14 }}>You can change this anytime.</p>
        <div className="stagger">
          {goals.map((g) => {
            const selected = goal === g.xp;
            return (
              <button
                key={g.xp}
                onClick={() => setGoal(g.xp)}
                className="card-lift"
                style={{
                  background: selected ? "var(--primary-soft)" : "var(--surface)",
                  border: `1.5px solid ${selected ? "var(--ink)" : "var(--border)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: 18,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  color: "var(--text)",
                  textAlign: "left",
                  marginBottom: 10,
                  boxShadow: selected ? "var(--shadow-deep)" : "var(--shadow-card)",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{g.label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{g.time}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--root)" }}>{g.xp} XP</div>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 22, paddingBottom: 24 }}>
          <Button onClick={() => onComplete({ language, goal })}>Start learning</Button>
        </div>
      </Container>
    </div>
  );
}

// =============================================================================
// HOME — v57 coach flow. Lives in its own file now: Home.jsx
// =============================================================================
export { Home, PracticeHub } from "./Home.jsx";

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

  // v69: group into category sections instead of one flat 150+-item scroll.
  // Each row is compact (no per-word Card chrome) — the mastery dots and
  // speak button stay, but padding drops from a full card to a hairline row.
  const grouped = useMemo(() => {
    const byCat = new Map();
    for (const v of filtered) {
      if (!byCat.has(v.category)) byCat.set(v.category, []);
      byCat.get(v.category).push(v);
    }
    return [...byCat.entries()];
  }, [filtered]);

  return (
    <div>
      <TopBar streak={appState.streak} gems={appState.gems} hearts={appState.hearts} totalXp={appState.totalXp} premium={appState.isPremium} />
      <Container style={{ maxWidth: 560 }}>
        <h2 style={{ fontSize: 26, fontWeight: 600, marginTop: 8, marginBottom: 2 }}>Vocabulary</h2>
        <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>{all.length} words · {filtered.length} shown</p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            width: "100%",
            padding: 13,
            borderRadius: 14,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontSize: 15,
            boxSizing: "border-box",
            marginBottom: 12,
          }}
        />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 6 }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                background: filter === c ? "var(--ink)" : "var(--surface)",
                color: filter === c ? "#fff" : "var(--text-dim)",
                border: `1px solid ${filter === c ? "var(--ink)" : "var(--border)"}`,
                borderRadius: 999,
                padding: "7px 15px",
                fontSize: 12.5,
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

        {grouped.map(([cat, words]) => (
          <div key={cat} style={{ marginTop: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{cat} · {words.length}</div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
              {words.map((v, i) => {
                const card = progress[v.id];
                const m = card ? masteryLevel(card) : 0;
                return (
                  <div
                    key={v.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                      borderBottom: i < words.length - 1 ? "1px solid var(--surface-hi)" : "none",
                    }}
                  >
                    <button
                      onClick={() => speak(v.lemma, lang.ttsCode, { audioId: v.id, code: lang.code, translit: v.translit })}
                      aria-label={`Hear ${v.lemma}`}
                      style={{
                        background: "var(--surface-hi)", border: "none", borderRadius: "50%",
                        width: 34, height: 34, fontSize: 15, cursor: "pointer", color: "var(--text-dim)",
                        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      🔊
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 16, fontWeight: 800, color: "var(--ink)",
                            direction: lang.rtl ? "rtl" : "ltr",
                            fontFamily: lang.rtl ? '"Noto Naskh Arabic", serif' : "inherit",
                          }}
                        >
                          {v.lemma}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-mute)", fontStyle: "italic" }}>{v.translit}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 1 }}>{v.translation}</div>
                    </div>
                    <div style={{ display: "flex", gap: 3, flexShrink: 0, width: 44 }}>
                      {[0, 1, 2, 3, 4].map((di) => (
                        <div
                          key={di}
                          style={{
                            flex: 1, height: 4, borderRadius: 999,
                            background: di < m ? "var(--primary)" : "var(--surface-hi)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)", fontSize: 14 }}>
            No words match “{search}”.
          </div>
        )}
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
        <div className="hero-premium" style={{ textAlign: "center", position: "relative" }}>
          {/* v57: Settings moved off the bottom nav — it lives here now */}
          <button
            onClick={() => onNavigate("settings")}
            aria-label="Settings"
            style={{
              position: "absolute", top: 14, right: 14,
              background: "var(--surface-hi)", border: "1px solid var(--border)",
              borderRadius: 999, width: 38, height: 38, fontSize: 16, cursor: "pointer",
            }}
          >
            ⚙️
          </button>
          <div style={{ fontSize: 52 }}>{lang.flag}</div>
          <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 22, fontWeight: 600, marginTop: 8, color: "var(--ink)" }}>Learning {lang.name}</div>
          <div style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 2 }}>{lang.tagline}</div>
        </div>

        {/* This week summary */}
        <h3 className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>This week</h3>
        <div className="stat-strip" style={{ marginBottom: 18 }}>
          <div className="stat-cell">
            <div className="stat-value">{wordsThisWeek}</div>
            <div className="stat-label">Words</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value">{studyMinsThisWeek}</div>
            <div className="stat-label">Minutes</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value">{appState.streak} <span className={appState.streak >= 3 ? "flame-alive" : ""}>🔥</span></div>
            <div className="stat-label">Day streak</div>
          </div>
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
                  <div className="eyebrow">Level {lv.level}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{lv.name}</div>
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
        <h3 className="eyebrow" style={{ marginTop: 8, marginBottom: 12 }}>Today's missions</h3>
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
        <h3 className="eyebrow" style={{ marginTop: 8, marginBottom: 12 }}>Badges</h3>
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
        <h3 className="eyebrow" style={{ marginTop: 24, marginBottom: 12 }}>Your journey</h3>
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
            <div style={{ fontSize: 18, fontWeight: 900 }}>✨ Zaban Plus</div>
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

export function Settings({ appState, setAppState, onResetAll, onNavigate, pack, profile, mutateProfile }) {
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
            label="Show pronunciation hints"
            sub="The 'say it like' phonetic guide under words (turn off if you prefer audio only)"
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
            sub="Chimes when you get answers right or wrong"
            control={
              <input
                type="checkbox"
                checked={appState.soundEffects !== false}
                onChange={(e) => setAppState((s) => ({ ...s, soundEffects: e.target.checked }))}
                style={{ width: 20, height: 20 }}
              />
            }
          />
        </Card>

        {/* v74 — the voice the learner actually hears, and their choice of it. */}
        <DialectSettings langCode={pack?.code || appState.currentLanguage} profile={profile} mutateProfile={mutateProfile} />
        <VoiceSettings appState={appState} setAppState={setAppState} langCode={pack?.code || appState.currentLanguage} />

        {/* Theme picker */}
        <h3 className="eyebrow" style={{ marginTop: 24, marginBottom: 12 }}>Theme</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {Object.entries(THEMES).map(([key, theme]) => {
            const isSelected = (appState.theme || "cream") === key;
            return (
              <button
                key={key}
                onClick={() => setAppState((s) => ({ ...s, theme: key }))}
                style={{
                  background: theme.vars["--surface"],
                  border: `1.5px solid ${isSelected ? theme.vars["--primary"] : theme.vars["--border"]}`,
                  borderRadius: "var(--radius-lg)",
                  padding: 14,
                  cursor: "pointer",
                  textAlign: "center",
                  color: theme.vars["--text"],
                  position: "relative",
                  minHeight: 110,
                  boxShadow: isSelected ? theme.vars["--shadow-deep"] || "var(--shadow-card)" : "none",
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
          style={{ marginBottom: 12 }}
          onClick={() => setAppState((s) => ({ ...s, tutorialSeen: false }))}
        >
          📖 Show the tutorial again
        </Button>

        <Button
          variant="secondary"
          style={{ marginBottom: 12 }}
          onClick={() => onNavigate && onNavigate("testout")}
        >
          🎯 Test out (skip ahead if you already know it)
        </Button>

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
          <img src="/zaban-mark-transparent.png" alt="Zaban" style={{ width: 48, height: 48, objectFit: "contain", margin: "0 auto 8px", display: "block", opacity: 0.85 }} />
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-dim)", marginBottom: 2 }}>Zaban</div>
          Built with love for the languages the world forgets.
          <div style={{ marginTop: 4, fontStyle: "italic" }}>Language connects us.</div>
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
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "8px 0" }}>Zaban Plus</h1>
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
