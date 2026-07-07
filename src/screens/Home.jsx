// =============================================================================
// HOME (v58) — "one action per screen".
//
// v57 gave Zaban a coach; v58 gives it calm. The screen is four quiet blocks:
//
//   1. Greeting + one coach sentence (typed, state-driven — no card, no box)
//   2. UP NEXT — the single hero action. The coach picks ONE thing using a
//      strict priority: milestone exam → review backlog → sentence drop →
//      current lesson. Big serif title, daily-goal ring, one big button.
//   3. A slim stat strip — streak · level · today's XP. Retention mechanics
//      visible at a glance, never shouting.
//   4. Your path — the compact journey (real-life goals + chapter exams).
//
// Everything else (flashcards, grammar, letters, big exam, focus picker,
// words) lives behind the Practice tab. Premium comes from restraint:
// whitespace, hairline borders, one serif headline, almost no emoji.
// =============================================================================

import React, { useState, useEffect, useMemo, useRef } from "react";
import { TopBar, Container } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { getCharacter } from "../data/characters.js";
import { getLevel } from "../engine/gamification.js";
import { LEARNING_GOALS, getGoal } from "../data/goals.js";
import {
  UNITS_PER_CHAPTER, computeUnlocks, isChapterExamAvailable,
  hasPassedChapter, chapterOfUnitIndex, chapterVocabIds,
} from "../data/chapters.js";
import { hasSentencePatterns, getPatternForDrop } from "../data/sentencePatterns.js";
import {
  todayKey, weakestWords, streakStage, nextMilestone, coachLine, daypart,
  goalLabel, estMinutes,
} from "../engine/coach.js";

// =============================================================================
// HOME
// =============================================================================

// v60 — SceneBand: the language's cultural place, embedded as a living hero.
// Random scene pick per visit + slow Ken Burns drift (alive, never static).
// Loads /scenes/{code}-{1..3}.jpg; falls back to -1, then hides entirely —
// languages without images keep the clean minimal layout.
function SceneBand({ code, name }) {
  const [idx, setIdx] = useState(() => 1 + Math.floor(Math.random() * 3));
  const [ok, setOk] = useState(true);
  const kb = useMemo(() => (Math.random() < 0.5 ? "kb-a" : "kb-b"), []);
  if (!ok) return null;
  return (
    <div className={`scene-band ${kb}`}>
      <img
        src={`/scenes/${code}-${idx}.jpg`}
        alt=""
        onError={() => (idx !== 1 ? setIdx(1) : setOk(false))}
      />
      <div className="scene-veil" />
      <div className="scene-cap">{name}</div>
    </div>
  );
}

export function Home({ engine, pack, stats, appState, setAppState, onNavigate, onPickLanguage }) {
  const lang = LANGUAGES[pack.code];
  const [unitProgress, setUnitProgress] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [weakList, setWeakList] = useState([]);

  // Character intro bookkeeping — the guide introduces itself once.
  useEffect(() => {
    const met = appState.metCharacters || [];
    if (getCharacter(pack.code) && !met.includes(pack.code)) {
      const t = setTimeout(() => {
        setAppState((s) => ({
          ...s,
          metCharacters: [...(s.metCharacters || []), pack.code],
        }));
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [pack.code]);

  const todayXp = useMemo(() => {
    const today = todayKey();
    return (appState.sessions || [])
      .filter((s) => new Date(s.ts).toDateString() === today && s.language === pack.code)
      .reduce((sum, s) => sum + (s.xp || 0), 0);
  }, [appState.sessions, pack.code]);

  useEffect(() => {
    let cancelled = false;
    engine.getUnitProgress().then((up) => {
      if (cancelled) return;
      const unlocks = computeUnlocks(up, appState, pack.code);
      setUnitProgress(up.map((u, i) => ({ ...u, unlocked: unlocks[i] })));
      setLoadingUnits(false);
    });
    return () => { cancelled = true; };
  }, [engine, stats, appState, pack.code]);

  useEffect(() => {
    let cancelled = false;
    engine.getProgress().then((progress) => {
      if (cancelled) return;
      setWeakList(weakestWords(pack.vocab || [], progress, 3));
    });
    return () => { cancelled = true; };
  }, [engine, stats, pack.code]);

  const currentUnit = unitProgress.find((u) => u.unlocked && u.pct < 1) || unitProgress[0];

  // ---------------------------------------------------------------------------
  // THE one next action — strict priority, no competing cards.
  // ---------------------------------------------------------------------------
  const nextAction = useMemo(() => {
    // 1. Milestone exam due (every 3 lessons)
    const done = appState?.lessonsCompleted?.[pack.code] || 0;
    const lastCleared = appState?.lastCheckpointAt?.[pack.code] ?? -1;
    if (done >= 3 && done % 3 === 0 && lastCleared !== done && (stats.learned || 0) >= 6) {
      const examSize = Math.min(15, Math.max(6, stats.learned));
      return {
        kind: "exam",
        eyebrow: "Milestone exam",
        title: `Prove your first ${done} lessons`,
        sub: `${examSize} questions — recall, listening, gaps. Pass it and you'll know it stuck.`,
        mins: estMinutes(examSize),
        go: () => onNavigate("lesson", { mode: "exam", sessionSize: examSize, milestone: done }),
      };
    }
    // 2. Review backlog
    if ((stats.due || 0) >= 4) {
      return {
        kind: "review",
        eyebrow: "Review",
        title: `Bring back ${stats.due} words`,
        sub: "Quick recall before they fade — this is where fluency is made.",
        mins: estMinutes(Math.min(stats.due, 8)),
        go: () => onNavigate("lesson", { mode: "due" }),
      };
    }
    // 3. Sentence Lab drop earned
    if (hasSentencePatterns(pack.code)) {
      const dropsDone = appState?.sentenceDropsDone?.[pack.code] || 0;
      const nextDrop = dropsDone + 1;
      if (Math.floor(done / 2) >= nextDrop) {
        const pattern = getPatternForDrop(pack.code, nextDrop);
        if (pattern) {
          return {
            kind: "lab",
            eyebrow: "Sentence Lab",
            title: `Build: ${pattern.skill}`,
            sub: "Construct a real sentence, one piece at a time.",
            mins: 2,
            go: () => onNavigate("sentencelab", { pattern, dropNumber: nextDrop }),
          };
        }
      }
    }
    // 4. The current lesson
    if (currentUnit) {
      return {
        kind: "lesson",
        eyebrow: "Next lesson",
        title: goalLabel(currentUnit),
        sub: currentUnit.description || "A few new words, quizzed until they stick.",
        mins: estMinutes(appState.sessionSize || 6),
        progress: { value: currentUnit.learned || 0, max: currentUnit.total || 1 },
        go: () => onNavigate("lesson", { mode: "unit", filter: { unit: currentUnit.id } }),
      };
    }
    return null;
  }, [appState, pack.code, stats, currentUnit]);

  // ---------------------------------------------------------------------------
  // The coach line
  // ---------------------------------------------------------------------------
  const character = getCharacter(pack.code);
  const hasMet = (appState.metCharacters || []).includes(pack.code);
  const milestone = nextMilestone(appState, pack.code);
  const goalMet = todayXp >= (appState.dailyGoalXp || 35);
  const weakWord = weakList.length ? weakList[0].word : null;
  const line = character && !hasMet
    ? character.intro
    : coachLine({
        langName: lang.name,
        due: stats.due || 0,
        weakWord,
        streak: appState.streak || 0,
        milestone,
        planDoneCount: goalMet ? 4 : 0,
        planTotal: 4,
      });

  const lv = getLevel(appState.totalXp || 0);
  const flame = streakStage(appState.streak || 0);
  const dailyPct = Math.min(1, todayXp / (appState.dailyGoalXp || 35));

  return (
    <div className="home-wash">
      <TopBar
        streak={appState.streak}
        gems={appState.gems}
        hearts={appState.hearts}
        totalXp={appState.totalXp}
        premium={appState.isPremium}
        currentLang={pack.code}
        onPickLanguage={onPickLanguage}
      />
      <Container style={{ maxWidth: 560 }}>

        <SceneBand code={pack.code} name={lang.name} />

        {/* ===== 1 · GREETING + COACH LINE ===== */}
        <div style={{ margin: "10px 0 26px" }}>
          <div className="eyebrow">{daypart()}{appState.userName ? `, ${appState.userName}` : ""}</div>
          <h1 style={{ fontSize: 30, fontWeight: 600, margin: "6px 0 0", lineHeight: 1.18 }}>
            {milestone
              ? <>{milestone.remaining} {milestone.remaining === 1 ? "session" : "sessions"} from<br /><em style={{ fontStyle: "italic" }}>{milestone.goal}</em>.</>
              : <>Every session makes<br />{lang.name} more yours.</>}
          </h1>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 14 }}>
            <span style={{ fontSize: 20, lineHeight: "26px" }}>{character?.emoji || "🌿"}</span>
            <Typewriter key={line} text={line} style={{
              fontSize: 15, color: "var(--text-dim)", lineHeight: 1.5, minHeight: 24, flex: 1,
            }} />
          </div>
          {!appState.userName && <NameCapture onSave={(n) => setAppState((s) => ({ ...s, userName: n }))} />}
        </div>

        {/* ===== 2 · UP NEXT — the one action ===== */}
        {nextAction && (
          <div className="hero-premium">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow" style={{ color: "var(--root)" }}>
                  {goalMet ? "Daily goal met · keep going" : nextAction.eyebrow}
                </div>
                <div style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 25, fontWeight: 600, marginTop: 6, lineHeight: 1.2, color: "var(--ink)",
                }}>
                  {nextAction.title}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 8, lineHeight: 1.5 }}>
                  {nextAction.sub}
                </div>
              </div>
              <DailyRing pct={dailyPct} met={goalMet} />
            </div>

            {nextAction.progress && (
              <div style={{ marginTop: 16 }}>
                <div className="hairline-bar">
                  <div className="hairline-fill progress-fill" style={{ width: `${Math.round((nextAction.progress.value / nextAction.progress.max) * 100)}%` }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 6 }}>
                  {nextAction.progress.value} of {nextAction.progress.max} words
                </div>
              </div>
            )}

            <button className="btn-premium" onClick={nextAction.go}>
              {goalMet ? "Keep going" : "Continue"} · ~{nextAction.mins} min
            </button>

            {weakWord && nextAction.kind !== "review" && (
              <button
                className="quiet-link"
                onClick={() => onNavigate("lesson", { mode: "weak", sessionSize: 4 })}
              >
                or a 2-minute fix for “{weakWord.translit || weakWord.lemma}”
              </button>
            )}
          </div>
        )}

        {/* ===== 3 · STAT STRIP — retention, visible but quiet ===== */}
        <div className="stat-strip">
          <div className="stat-cell">
            <div className="stat-value">
              <span className={appState.streak >= 3 ? "flame-alive" : ""}>{flame.emoji}</span> {appState.streak || 0}
            </div>
            <div className="stat-label">day streak</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value">Level {lv.level}</div>
            <div className="hairline-bar" style={{ marginTop: 7 }}>
              <div className="hairline-fill" style={{ width: `${Math.round((lv.progressPct || 0) * 100)}%` }} />
            </div>
            <div className="stat-label">{lv.name}</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value">{todayXp}<span style={{ fontSize: 13, color: "var(--text-mute)", fontWeight: 600 }}> / {appState.dailyGoalXp}</span></div>
            <div className="hairline-bar" style={{ marginTop: 7 }}>
              <div className="hairline-fill" style={{ width: `${Math.round(dailyPct * 100)}%`, background: goalMet ? "var(--primary)" : undefined }} />
            </div>
            <div className="stat-label">XP today</div>
          </div>
        </div>

        {/* ===== 4 · YOUR PATH — compact ===== */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "30px 0 14px" }}>
          <h3 className="eyebrow" style={{ margin: 0 }}>Your path</h3>
          <button className="quiet-link" style={{ margin: 0 }} onClick={() => onNavigate("hub")}>
            All practice tools →
          </button>
        </div>

        {loadingUnits ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>Loading…</div>
        ) : (
          <div className="journey-row stagger">
            {unitProgress.map((unit, i) => {
              const rows = [
                <UnitNode
                  key={unit.id}
                  unit={unit}
                  index={i}
                  isCurrent={currentUnit?.id === unit.id}
                  onTap={() => unit.unlocked && onNavigate("lesson", { mode: "unit", filter: { unit: unit.id } })}
                  onTestOut={() => onNavigate("testout", { fromUnit: unit.id })}
                />,
              ];
              const isChapterEnd = (i + 1) % UNITS_PER_CHAPTER === 0;
              const chapterNum = chapterOfUnitIndex(i);
              const hasNextChapter = unitProgress.length > (i + 1);
              if (isChapterEnd && hasNextChapter) {
                const available = isChapterExamAvailable(unitProgress, chapterNum);
                const passed = hasPassedChapter(appState, pack.code, chapterNum);
                const vocabIds = chapterVocabIds(pack.vocab, chapterNum);
                const examSize = Math.min(10, Math.max(6, vocabIds.length));
                rows.push(
                  <ChapterExamCard
                    key={`exam-${chapterNum}`}
                    chapterNum={chapterNum}
                    available={available}
                    passed={passed}
                    onStart={() =>
                      onNavigate("lesson", {
                        mode: "chapter_exam",
                        chapter: chapterNum,
                        filter: { vocabIds },
                        sessionSize: examSize,
                      })
                    }
                  />
                );
              }
              return rows;
            })}
          </div>
        )}
      </Container>
    </div>
  );
}

// =============================================================================
// DAILY RING — the daily goal, drawn as a fine ring. Fills as XP comes in.
// =============================================================================
function DailyRing({ pct = 0, met = false }) {
  const R = 24, C = 2 * Math.PI * R;
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ flexShrink: 0 }} aria-label={`Daily goal ${Math.round(pct * 100)}%`}>
      <circle cx="30" cy="30" r={R} fill="none" stroke="var(--border)" strokeWidth="3.5" />
      <circle
        cx="30" cy="30" r={R} fill="none"
        stroke={met ? "var(--primary)" : "var(--root)"} strokeWidth="3.5"
        strokeLinecap="round" strokeDasharray={C}
        strokeDashoffset={C * (1 - pct)}
        transform="rotate(-90 30 30)"
        style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)" }}
      />
      <text x="30" y="35" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="700">
        {met ? "✓" : `${Math.round(pct * 100)}%`}
      </text>
    </svg>
  );
}

// =============================================================================
// TYPEWRITER — the coach "thinks and types". Respects reduced motion.
// =============================================================================
function Typewriter({ text, style }) {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    []
  );
  const [shown, setShown] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced) { setShown(text); return; }
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [text, reduced]);

  const typing = shown.length < text.length;
  return (
    <div style={style} aria-label={text}>
      {shown}
      {typing && <span className="type-caret" aria-hidden="true">▍</span>}
    </div>
  );
}

// =============================================================================
// NAME CAPTURE — one-time, inline
// =============================================================================
function NameCapture({ onSave }) {
  const [name, setName] = useState("");
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "center", marginTop: 16,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 999, padding: "5px 6px 5px 16px", maxWidth: 380,
    }}>
      <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 600, whiteSpace: "nowrap" }}>
        What should I call you?
      </span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); }}
        placeholder="Your name"
        style={{
          flex: 1, minWidth: 60, border: "none", background: "transparent",
          fontSize: 14, fontWeight: 600, outline: "none", padding: "6px 0",
        }}
      />
      <button
        onClick={() => name.trim() && onSave(name.trim())}
        disabled={!name.trim()}
        style={{
          background: name.trim() ? "var(--ink)" : "var(--surface-hi)",
          color: name.trim() ? "#fff" : "var(--text-mute)",
          border: "none", borderRadius: 999, padding: "8px 16px",
          fontSize: 13, fontWeight: 700, cursor: name.trim() ? "pointer" : "default",
        }}
      >
        Save
      </button>
    </div>
  );
}

// =============================================================================
// PRACTICE HUB — everything else lives here. Also holds the focus picker.
// =============================================================================
export function PracticeHub({ pack, stats, appState, setAppState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const [pickingFocus, setPickingFocus] = useState(false);

  const doors = [
    { icon: "📇", title: "Flashcards", sub: "Flip through your words at your own pace", go: () => onNavigate("flashcards") },
    { icon: "🧭", title: "Grammar", sub: `How ${lang.name} actually fits together`, go: () => onNavigate("grammar") },
    { icon: "📚", title: "My words", sub: `${stats.learned || 0} learned · ${stats.mastered || 0} mastered`, go: () => onNavigate("vocab") },
  ];
  if (pack.alphabet?.length > 0) {
    doors.unshift({ icon: "🔤", title: "Letters & sounds", sub: "Learn to read the script itself", go: () => onNavigate("alphabet") });
  }
  if ((stats.learned || 0) >= 15) {
    doors.push({ icon: "📝", title: "Big exam", sub: "Everything you know, tested every way", go: () => onNavigate("lesson", { mode: "exam", sessionSize: Math.min(25, stats.learned) }) });
  }
  if ((stats.due || 0) > 0) {
    doors.unshift({ icon: "🌿", title: `Review ${stats.due} due words`, sub: "Spaced repetition — keep them alive", go: () => onNavigate("lesson", { mode: "due" }), highlight: true });
  }

  const lessonsDone = appState?.lessonsCompleted?.[pack.code] || 0;
  const currentGoal = getGoal(appState?.learningGoal?.[pack.code]);

  return (
    <Container style={{ maxWidth: 560 }}>
      <h2 style={{ fontSize: 26, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>Practice</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 20, fontSize: 14 }}>
        Every drill in one place. Dip in wherever you like — none of this is graded.
      </p>

      {/* Focus — moved here from Home (v58) so the home stays a single action */}
      {lessonsDone >= 2 && (
        pickingFocus || !currentGoal ? (
          <div style={{ marginBottom: 14 }}>
            <PathChooser
              onPick={(goalId) => {
                setAppState((s) => ({ ...s, learningGoal: { ...(s.learningGoal || {}), [pack.code]: goalId } }));
                setPickingFocus(false);
              }}
            />
          </div>
        ) : (
          <div style={{
            background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: 14,
            border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
          }}>
            <div style={{ fontSize: 24 }}>{currentGoal.emoji}</div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow">Your focus</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{currentGoal.title}</div>
            </div>
            <button
              onClick={() => setPickingFocus(true)}
              style={{
                background: "var(--surface-hi)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "6px 12px", color: "var(--text-dim)",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Change
            </button>
          </div>
        )
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {doors.map((d) => (
          <button
            key={d.title}
            onClick={d.go}
            className="card-lift"
            style={{
              display: "flex", alignItems: "center", gap: 14, textAlign: "left",
              background: "var(--surface)", borderRadius: "var(--radius-lg)",
              border: d.highlight ? "2px solid var(--primary)" : "1px solid var(--border)",
              padding: 16, cursor: "pointer", boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{
              fontSize: 24, width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: "var(--surface-hi)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {d.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{d.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{d.sub}</div>
            </div>
            <div style={{ fontSize: 18, color: "var(--text-mute)" }}>→</div>
          </button>
        ))}
      </div>
    </Container>
  );
}

// =============================================================================
// UNIT NODE — compact, quiet journey card (v58)
// =============================================================================
function UnitNode({ unit, index, isCurrent, onTap, onTestOut }) {
  const isComplete = unit.pct >= 1;
  const isLocked = !unit.unlocked;

  let bg, fg, border;
  if (isLocked) {
    bg = "var(--surface)"; fg = "var(--text-mute)"; border = "var(--border)";
  } else if (isComplete) {
    bg = "var(--primary-soft)"; fg = "var(--primary-dark)"; border = "var(--border)";
  } else if (isCurrent) {
    bg = "var(--ink)"; fg = "#fff"; border = "var(--ink)";
  } else {
    bg = "var(--surface)"; fg = "var(--text)"; border = "var(--border)";
  }

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-lg)",
        color: fg,
        opacity: isLocked ? 0.7 : 1,
        boxShadow: isCurrent ? "var(--shadow-deep)" : "none",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onTap}
        disabled={isLocked}
        style={{
          width: "100%", background: "transparent", border: "none", padding: 14,
          color: "inherit", cursor: isLocked ? "not-allowed" : "pointer",
          textAlign: "left", display: "flex", alignItems: "center", gap: 12,
        }}
      >
        <div
          style={{
            width: 46, height: 46, borderRadius: "50%",
            background: isLocked ? "var(--surface-hi)" : isCurrent ? "rgba(255,255,255,0.14)" : "var(--surface-hi)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0, position: "relative",
          }}
        >
          {isLocked ? "🔒" : isComplete ? "✓" : unit.emoji}
          {!isLocked && !isComplete && unit.pct > 0 && (
            <svg style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} width="46" height="46">
              <circle cx="23" cy="23" r="21" fill="none" stroke={isCurrent ? "rgba(255,255,255,0.25)" : "var(--border)"} strokeWidth="2.5" />
              <circle cx="23" cy="23" r="21" fill="none" stroke={isCurrent ? "#fff" : "var(--root)"} strokeWidth="2.5"
                strokeDasharray={`${unit.pct * 132} 132`} strokeLinecap="round" />
            </svg>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow" style={{ color: "inherit", opacity: 0.6 }}>
            Goal {index + 1}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, marginTop: 1 }}>{goalLabel(unit)}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
            {isLocked
              ? "Finish the previous goal"
              : isComplete
              ? `Done · ${unit.mastered} mastered`
              : `${unit.learned} / ${unit.total} words`}
          </div>
        </div>

        {!isLocked && (
          <div style={{ fontSize: 16, opacity: 0.7, flexShrink: 0 }}>→</div>
        )}
      </button>

      {isLocked && onTestOut && index > 0 && (
        <div
          style={{
            borderTop: "1px dashed var(--border)", padding: "9px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Already know this?
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onTestOut(); }}
            style={{
              background: "transparent", color: "var(--ink)", border: "1px solid var(--border)",
              borderRadius: 999, padding: "5px 13px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Test out
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CHAPTER EXAM CARD — quiet (v58)
// =============================================================================
function ChapterExamCard({ chapterNum, available, passed, onStart }) {
  return (
    <div
      onClick={() => available && !passed && onStart()}
      style={{
        background: passed ? "var(--primary-soft)" : "var(--surface)",
        border: `1px solid ${passed ? "var(--border)" : available ? "var(--ink)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: 16,
        cursor: available && !passed ? "pointer" : "default",
        opacity: !available && !passed ? 0.6 : 1,
        marginTop: 4, marginBottom: 4,
        boxShadow: available && !passed ? "var(--shadow-deep)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 26 }}>{passed ? "🏆" : available ? "📝" : "🔒"}</div>
        <div style={{ flex: 1 }}>
          <div className="eyebrow">Chapter {chapterNum} exam</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: passed ? "var(--primary-dark)" : "var(--text)", marginTop: 1 }}>
            {passed ? "Passed" : available ? "Ready — unlocks the next chapter" : "Finish this chapter first"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
            {passed ? "Retake any time to refresh" : "3 rounds · 70% to pass · unlimited retries"}
          </div>
        </div>
        {available && !passed && <div style={{ fontSize: 18, color: "var(--ink)" }}>→</div>}
      </div>
    </div>
  );
}

// =============================================================================
// PATH CHOOSER (v41 mechanics)
// =============================================================================
function PathChooser({ onPick }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: "var(--radius-lg)",
      padding: 18, border: "1px solid var(--border)", boxShadow: "var(--shadow-card)",
    }}>
      <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>
        Choose your focus
      </div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 }}>
        Your lessons will prioritise the words that matter for your goal. Change it any time.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LEARNING_GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => onPick(g.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 12, padding: 13, cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ fontSize: 26, flexShrink: 0 }}>{g.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{g.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2, lineHeight: 1.4 }}>{g.blurb}</div>
            </div>
            <div style={{ fontSize: 18, color: "var(--text-mute)" }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
}
