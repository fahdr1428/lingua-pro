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
import { ExerciseSettings } from "./ExerciseSettings.jsx";
import { getCharacter, getGreeting } from "../data/characters.js";
import { getLevel, earnedBadges, BADGES, getDailyMissions, getProgressionMilestones } from "../engine/gamification.js";
import { LEARNING_GOALS, getGoal } from "../data/goals.js";
import { UNITS_PER_CHAPTER, computeUnlocks, isChapterExamAvailable, hasPassedChapter, chapterOfUnitIndex, chapterVocabIds } from "../data/chapters.js";
import { hasSentencePatterns, getPatternForDrop, ladderHeight } from "../data/sentencePatterns.js";
import { APP_MIN_AGE, AI_MIN_AGE, LAST_UPDATED, policiesIncomplete } from "../legal/policies.js";
import { Legal } from "./Legal.jsx";
import { aiAccepted, aiDeclined } from "../ui/AiDisclosure.jsx";
import { downloadExport } from "../legal/exportData.js";
import { DownloadLanguage } from "../ui/Offline.jsx";

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
  // v77 — the two things we have to establish before anyone starts, and a
  // reader for the policies so "I accept" isn't a claim about something the
  // person had no way of seeing.
  const [ageOk, setAgeOk] = useState(false);
  const [terms, setTerms] = useState(false);
  const [reading, setReading] = useState(null); // policy id, or null

  // The router doesn't exist yet at onboarding, so the policy reader is shown
  // inline. Better than a link that leaves the flow and loses the answers.
  if (reading) {
    return <Legal params={{ policy: reading }} onNavigate={() => setReading(null)} />;
  }

  if (step === 0) {
    return (
      <div className="home-wash">
        <Container style={{ paddingTop: "14vh", textAlign: "center" }}>
          <img
            src="/logo-560.webp"
            alt="Zaban"
            width="551"
            height="527"
            fetchPriority="high"
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
          <div className="eyebrow" style={{ marginTop: 24 }}>Step 1 of 3</div>
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
                        color: "var(--accent-text)",
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

  // Step 3 — the bit every consumer app has to have and most bury. Kept short,
  // in plain words, and with the policies one tap away rather than a URL that
  // opens somewhere else. Neither box is pre-ticked: a pre-ticked consent box is
  // not consent, and that is settled law in the EU (Planet49).
  if (step === 3) {
    return (
      <div className="home-wash">
        <Container>
          <div className="eyebrow" style={{ marginTop: 24 }}>Step 3 of 3</div>
          <h2 style={{ fontSize: 27, fontWeight: 600, marginTop: 6, marginBottom: 4 }}>Before you start</h2>
          <p style={{ color: "var(--text-dim)", marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
            Two quick things. Your progress is stored on this device only — there's
            no account, we don't have a copy of it, and we never ask for your name
            or email. The only feature that sends anything anywhere is the AI
            conversation, and that one asks you separately, later.
          </p>

          {policiesIncomplete() && (
            <div className="legal-warn" style={{ marginBottom: 16 }}>
              <b>Development build.</b> The policies still have operator
              placeholders in them. See <code>COMPLIANCE.md</code>.
            </div>
          )}

          <label className="ai-check">
            <input type="checkbox" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} />
            <span>I'm {APP_MIN_AGE} or older. <span style={{ color: "var(--text-mute)" }}>(The AI conversation features need {AI_MIN_AGE}+ and ask again.)</span></span>
          </label>
          <label className="ai-check">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>I've read and accept the terms and the privacy policy.</span>
          </label>

          <div className="chip-row" style={{ marginTop: 4, marginBottom: 18 }}>
            <button className="chip" onClick={() => setReading("privacy")}>Read the privacy policy</button>
            <button className="chip" onClick={() => setReading("terms")}>Read the terms</button>
            <button className="chip" onClick={() => setReading("ai")}>About the AI</button>
          </div>

          <div style={{ paddingBottom: 24 }}>
            <Button
              style={{ opacity: ageOk && terms ? 1 : 0.4 }}
              disabled={!ageOk || !terms}
              onClick={() =>
                onComplete({
                  language,
                  goal,
                  consent: { ageConfirmed: APP_MIN_AGE, terms: true, at: Date.now(), policyVersion: LAST_UPDATED },
                })
              }
            >
              Start learning
            </Button>
            <p style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 12, textAlign: "center" }}>
              Under {APP_MIN_AGE}? This app isn't for you yet — please don't tick the box.
            </p>
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
        <div className="eyebrow" style={{ marginTop: 24 }}>Step 2 of 3</div>
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
          <Button onClick={() => setStep(3)}>Continue</Button>
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
          aria-label="Search your words"
          type="search"
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
                background: filter === c ? "var(--ink-solid)" : "var(--surface)",
                color: filter === c ? "var(--ink-on)" : "var(--text-dim)",
                border: `1px solid ${filter === c ? "var(--ink-solid)" : "var(--border)"}`,
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
                <div style={{ fontSize: 13, color: "var(--accent-text)", fontWeight: 700 }}>
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
                        <span style={{ fontSize: 11, color: "var(--primary-text)", fontWeight: 700 }}>✓ reached</span>
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
          <Card className="glass-gradient" style={{ marginTop: 16, color: "#000" }}>
            {/* v79: this used to lead with "Unlimited hearts". Hearts are no
                longer spent on wrong answers, so that was selling relief from a
                penalty that doesn't exist — and it was never true even before,
                because hearts gated nothing. Nothing here is charged for a
                mistake, and the pitch shouldn't imply otherwise. */}
            <div style={{ fontSize: 18, fontWeight: 900 }}>✨ Zaban Plus</div>
            <div style={{ fontSize: 14, marginTop: 4, marginBottom: 12 }}>
              No ads • Support the languages nobody else builds for
            </div>
            {/* v81: "Offline mode" used to lead this list, and there was no
                service worker — the app was entirely online-only. It works
                offline for everyone now, which means it is not something to
                sell; it has moved to the line below, as a fact. */}
            <div style={{ fontSize: 11.5, marginBottom: 12, opacity: 0.8 }}>
              Every lesson, every word and every exercise stays free — and works
              offline. We don't charge you for getting something wrong.
            </div>
            <button
              style={{
                background: "#000",
                // --accent, not --accent-text: this one sits on BLACK, where the
                // bright amber is the readable choice and the darkened text
                // variant is the unreadable one. The v80 sweep swapped it
                // blindly and made this button worse; the audit caught it.
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
                aria-label="Daily goal in XP"
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
                aria-label="Questions per lesson"
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
                aria-label="Show pronunciation hints"
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
                aria-label="Sound effects"
                checked={appState.soundEffects !== false}
                onChange={(e) => setAppState((s) => ({ ...s, soundEffects: e.target.checked }))}
                style={{ width: 20, height: 20 }}
              />
            }
          />
        </Card>

        {/* v74 — the voice the learner actually hears, and their choice of it. */}
        <ExerciseSettings appState={appState} setAppState={setAppState} />
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

        {/* v81 — offline. The course is already local; this makes the audio local
            too, for someone who knows they're about to lose signal. */}
        <h3 className="eyebrow" style={{ marginTop: 26, marginBottom: 10 }}>Offline</h3>
        <DownloadLanguage pack={pack} langName={LANGUAGES[pack?.code]?.name || "this language"} />

        {/* v77 — privacy, AI and the law, in the app rather than on a website
            nobody visits. Grouped together because that's how people look for
            them, and because a reviewer opening the app needs to find them
            without a tour. */}
        <PrivacyAndAi appState={appState} setAppState={setAppState} onNavigate={onNavigate} onResetAll={onResetAll} />
        <Card style={{ marginTop: 16, fontSize: 12, color: "var(--text-mute)", textAlign: "center" }}>
          <img src="/mark-160.webp" alt="Zaban" width="48" height="48" style={{ width: 48, height: 48, objectFit: "contain", margin: "0 auto 8px", display: "block", opacity: 0.85 }} />
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-dim)", marginBottom: 2 }}>Zaban</div>
          Built with love for the languages the world forgets.
          <div style={{ marginTop: 4, fontStyle: "italic" }}>Language connects us.</div>
        </Card>
      </Container>
    </div>
  );
}

// =============================================================================
// PRIVACY, AI AND YOUR DATA (v77)
//
// The three things a person is entitled to be able to do without asking anyone:
// read what the app does, take their data with them, and destroy it. Plus the
// one switch that turns the AI off after they've already said yes — consent you
// can't withdraw isn't consent.
// =============================================================================
function PrivacyAndAi({ appState, setAppState, onNavigate, onResetAll }) {
  const [exported, setExported] = useState(null);
  const [busy, setBusy] = useState(false);
  const reports = appState?.aiReports || [];
  const on = aiAccepted(appState);

  async function doExport() {
    setBusy(true);
    try {
      const n = await downloadExport();
      setExported(n);
    } catch {
      setExported(-1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h3 className="eyebrow" style={{ marginTop: 26, marginBottom: 10 }}>Privacy, AI and your data</h3>

      <Card style={{ marginBottom: 12 }}>
        <Row
          label="AI conversation features"
          sub={
            on
              ? "On. Your text and a short summary of your practice record go to Anthropic when you use them."
              : aiDeclined(appState)
              ? "Off. Everything else in the app works exactly as it does now."
              : `Not set up yet. You'll be asked the first time you open a conversation. Needs ${AI_MIN_AGE}+.`
          }
          control={
            <input
              type="checkbox"
              checked={on}
              onChange={(e) =>
                setAppState((s) => ({
                  ...s,
                  // Turning it ON here still requires the full gate, so this only
                  // ever records a withdrawal. Consent has to be given where the
                  // disclosure is, not from a switch with no text next to it.
                  aiConsent: e.target.checked
                    ? null
                    : { accepted: false, at: Date.now(), version: 1 },
                }))
              }
              style={{ width: 20, height: 20 }}
              aria-label="AI conversation features"
            />
          }
        />
        {!on && (
          <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: -8 }}>
            To turn it back on, open Speak and start a conversation — the
            disclosure comes with it.
          </div>
        )}
      </Card>

      <div className="chip-row" style={{ marginBottom: 14 }}>
        <button className="chip" onClick={() => onNavigate?.("legal", { policy: "privacy" })}>Privacy policy</button>
        <button className="chip" onClick={() => onNavigate?.("legal", { policy: "ai" })}>About the AI</button>
        <button className="chip" onClick={() => onNavigate?.("legal", { policy: "terms" })}>Terms</button>
      </div>

      <Button variant="secondary" style={{ marginBottom: 12 }} disabled={busy} onClick={doExport}>
        {busy ? "Building your file…" : "⬇ Export everything the app holds about you"}
      </Button>
      {exported !== null && (
        <div style={{ fontSize: 12.5, color: exported < 0 ? "var(--danger)" : "var(--text-dim)", marginTop: -6, marginBottom: 12 }}>
          {exported < 0
            ? "Couldn't build the file. If you're in private browsing, storage may be blocked."
            : `Saved — ${exported} record${exported === 1 ? "" : "s"}, as JSON. That's the whole of it; there's no copy anywhere else.`}
        </div>
      )}

      {reports.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            AI replies you flagged ({reports.length})
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 10 }}>
            Held on this device — this app has no reporting server, and saying a
            report had been filed when it hadn't would be worse than saying so.
            They go out with your export.
          </div>
          {reports.slice(-5).reverse().map((r, i) => (
            <div key={i} style={{ fontSize: 12, color: "var(--text-mute)", borderTop: "1px solid var(--border)", padding: "8px 0" }}>
              <span style={{ opacity: 0.7 }}>{new Date(r.ts).toLocaleDateString()} · {r.context?.where || "conversation"} — </span>
              {String(r.text || "").slice(0, 120)}
            </div>
          ))}
          <button
            className="quiet-link"
            onClick={() => setAppState((s) => ({ ...s, aiReports: [] }))}
          >
            clear the list
          </button>
        </Card>
      )}

      <Button
        variant="secondary"
        style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
        onClick={() => {
          if (confirm("Delete everything? Your progress, streak, review schedule and settings all go, permanently. There is no copy anywhere else, so this cannot be undone.")) onResetAll();
        }}
      >
        Delete all my data
      </Button>
      <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 6, marginBottom: 4 }}>
        Erases everything on this device. Export first if you want to keep it.
      </div>
    </>
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
            // v81: offline is free for everyone, so it is no longer a premium
            // line. It was listed here for releases while no service worker
            // existed at all.
            ["🎧", "Every recording, saved", "Download a language for a journey"],
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
