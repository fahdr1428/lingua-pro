// =============================================================================
// HOME (v57) — "a coach, not a dashboard".
//
// The screen is ONE guided flow:
//   1. The coach speaks — a typed line derived from real learner state
//      (weak words, review backlog, streak, milestone distance).
//   2. TODAY'S PLAN — a root-rail (echoing the Z-with-roots logo) of four
//      steps: Warm up → Learn → Speak → Use it. Exactly one step is "active"
//      and carries the amber accent; done steps fold into quiet green leaves;
//      upcoming steps fade. One action at a time.
//   3. A sticky "Continue · ~2 min" CTA on mobile so the next step is never
//      more than one thumb-tap away.
//   4. Below the fold: real-life goals (the journey, renamed from units),
//      explore chips, and the framework callout — all visually secondary.
//
// No AI backend — the coach brain is src/engine/coach.js (pure rules).
// =============================================================================

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button, Card, ProgressBar, TopBar, Container } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { speak } from "../audio/tts.js";
import { pickFunFact } from "../data/funFacts.js";
import { HeroBackdrop } from "../ui/HeroBackdrop.jsx";
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
export function Home({ engine, pack, stats, appState, setAppState, onNavigate, onPickLanguage }) {
  const lang = LANGUAGES[pack.code];
  const [unitProgress, setUnitProgress] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [weakList, setWeakList] = useState([]);

  // Character intro bookkeeping (kept from v53) — the guide introduces itself
  // once, then rotates to coach lines.
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

  // Unit progress + chapter-gated unlocks (unchanged mechanics from v44)
  useEffect(() => {
    let cancelled = false;
    engine.getUnitProgress().then((up) => {
      if (cancelled) return;
      const unlocks = computeUnlocks(up, appState, pack.code);
      const enriched = up.map((u, i) => ({ ...u, unlocked: unlocks[i] }));
      setUnitProgress(enriched);
      setLoadingUnits(false);
    });
    return () => { cancelled = true; };
  }, [engine, stats, appState, pack.code]);

  // v57: pull the FSRS progress map once to find genuinely shaky words —
  // this is what powers "you wobbled on X → 2-min fix".
  useEffect(() => {
    let cancelled = false;
    engine.getProgress().then((progress) => {
      if (cancelled) return;
      setWeakList(weakestWords(pack.vocab || [], progress, 3));
    });
    return () => { cancelled = true; };
  }, [engine, stats, pack.code]);

  const framework = pack.frameworks?.[0];
  const currentUnit = unitProgress.find((u) => u.unlocked && u.pct < 1) || unitProgress[0];

  // ---------------------------------------------------------------------------
  // TODAY'S PLAN — assembled from real state
  // ---------------------------------------------------------------------------
  const today = todayKey();
  const todayModes = useMemo(() => (
    (appState.sessions || [])
      .filter((s) => s.language === pack.code && new Date(s.ts).toDateString() === today)
      .map((s) => s.mode || "unit")
  ), [appState.sessions, pack.code, today]);

  const visited = appState.planVisited?.[pack.code]?.date === today
    ? appState.planVisited[pack.code]
    : {};
  const momentDoneToday = appState.momentDone?.[pack.code] === today;
  const warmIsReview = (stats.due || 0) >= 4;
  const didWeakFixToday = todayModes.includes("weak");

  // Step 4 variant: a Sentence Lab drop when one is earned, else real convos.
  const labStep = useMemo(() => {
    if (!hasSentencePatterns(pack.code)) return null;
    const lessonsDone = appState?.lessonsCompleted?.[pack.code] || 0;
    const dropsDone = appState?.sentenceDropsDone?.[pack.code] || 0;
    const nextDrop = dropsDone + 1;
    if (Math.floor(lessonsDone / 2) < nextDrop) return null;
    const pattern = getPatternForDrop(pack.code, nextDrop);
    return pattern ? { pattern, nextDrop } : null;
  }, [appState, pack.code]);

  const markVisited = (key) => {
    setAppState((s) => {
      const cur = s.planVisited?.[pack.code];
      const base = cur?.date === today ? cur : { date: today };
      return { ...s, planVisited: { ...(s.planVisited || {}), [pack.code]: { ...base, date: today, [key]: true } } };
    });
  };

  const plan = useMemo(() => {
    const steps = [];
    steps.push({
      id: "warmup",
      icon: "🌿",
      title: warmIsReview ? `Warm up: ${stats.due} words drifting back` : "Warm up: today's recall",
      sub: warmIsReview
        ? "Quick recall so what you learned stays alive"
        : "One word. Try to retrieve it before you peek.",
      mins: warmIsReview ? estMinutes(Math.min(stats.due, 8)) : 1,
      done: warmIsReview ? todayModes.some((m) => m === "due" || m === "weak") : momentDoneToday,
      inline: !warmIsReview, // the Moment renders inside the step
      go: warmIsReview ? () => onNavigate("lesson", { mode: "due" }) : null,
    });
    steps.push({
      id: "concept",
      icon: currentUnit?.emoji || "📘",
      title: `Learn: ${currentUnit ? goalLabel(currentUnit) : "new words"}`,
      sub: currentUnit?.description || "A few new words, quizzed until they stick",
      mins: estMinutes(appState.sessionSize || 6),
      done: todayModes.some((m) => ["unit", "checkpoint", "exam", "chapter_exam"].includes(m)),
      go: currentUnit
        ? () => onNavigate("lesson", { mode: "unit", filter: { unit: currentUnit.id } })
        : null,
    });
    steps.push({
      id: "speak",
      icon: "🗣️",
      title: "Speak: shadow a real conversation",
      sub: "Listen to each line, then say it out loud — accent and all",
      mins: 3,
      done: !!visited.speak,
      go: () => { markVisited("speak"); onNavigate("practice"); },
    });
    steps.push(labStep ? {
      id: "life",
      icon: "🧱",
      title: `Use it: build "${labStep.pattern.skill}"`,
      sub: "Construct a real sentence, one piece at a time",
      mins: 2,
      done: !!visited.life,
      go: () => { markVisited("life"); onNavigate("sentencelab", { pattern: labStep.pattern, dropNumber: labStep.nextDrop }); },
    } : {
      id: "life",
      icon: "💬",
      title: "Use it: talk about real life",
      sub: "Family, food, feelings — the way people actually speak",
      mins: 3,
      done: !!visited.life,
      go: () => { markVisited("life"); onNavigate("practice"); },
    });
    return steps;
  }, [warmIsReview, stats.due, todayModes, momentDoneToday, currentUnit, visited, labStep, appState.sessionSize]);

  const doneCount = plan.filter((s) => s.done).length;
  const activeIdx = plan.findIndex((s) => !s.done);
  const activeStep = activeIdx >= 0 ? plan[activeIdx] : null;

  // ---------------------------------------------------------------------------
  // The coach line
  // ---------------------------------------------------------------------------
  const character = getCharacter(pack.code);
  const hasMet = (appState.metCharacters || []).includes(pack.code);
  const milestone = nextMilestone(appState, pack.code);
  const weakWord = !didWeakFixToday && weakList.length ? weakList[0].word : null;
  const line = character && !hasMet
    ? character.intro
    : coachLine({
        langName: lang.name,
        due: stats.due || 0,
        weakWord,
        streak: appState.streak || 0,
        milestone,
        planDoneCount: doneCount,
        planTotal: plan.length,
      });

  const lv = getLevel(appState.totalXp || 0);
  const flame = streakStage(appState.streak || 0);

  return (
    <div style={{ position: "relative" }}>
      <TopBar
        streak={appState.streak}
        gems={appState.gems}
        hearts={appState.hearts}
        totalXp={appState.totalXp}
        premium={appState.isPremium}
        currentLang={pack.code}
        onPickLanguage={onPickLanguage}
      />
      <HeroBackdrop />
      <Container style={{ position: "relative", zIndex: 1, paddingBottom: 170 }}>

        {/* ===== COACH HERO ===== */}
        <div style={{ margin: "6px 0 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dim)" }}>
            {daypart()}{appState.userName ? `, ${appState.userName}` : ""} ☀️
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "4px 0 0", lineHeight: 1.15 }}>
            {milestone
              ? <>You're <span style={{ color: "var(--primary)" }}>{milestone.remaining} {milestone.remaining === 1 ? "session" : "sessions"}</span> from {milestone.goal}.</>
              : <>Every session makes {lang.name} more yours.</>}
          </h1>

          {/* The coach speaks — typed, personal, state-driven */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 14 }}>
            <div className="coach-avatar" style={{
              fontSize: 26, width: 46, height: 46, borderRadius: "50%",
              background: "var(--surface)", border: `2px solid ${character?.accent || "var(--primary)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {character?.emoji || "🌿"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: character?.accent || "var(--primary)" }}>
                {character?.name || "Your coach"}
                <span style={{ color: "var(--text-dim)", fontWeight: 600 }}> · {character?.role || `${lang.name} guide`}</span>
              </div>
              <Typewriter key={line} text={line} style={{
                fontSize: 15, color: "var(--text)", marginTop: 3, lineHeight: 1.45, minHeight: 42,
              }} />
            </div>
          </div>

          {/* 2-minute fix — only when a word is genuinely shaky */}
          {weakWord && doneCount < plan.length && (
            <button
              onClick={() => onNavigate("lesson", { mode: "weak", sessionSize: 4 })}
              className="fix-chip"
            >
              🎯 2-min fix: <strong style={{ margin: "0 4px" }}>{weakWord.translit || weakWord.lemma}</strong> →
            </button>
          )}

          {/* Living progress microline: evolving flame + level + today */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
            <span title={flame.label} style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dim)", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className={appState.streak >= 3 ? "flame-alive" : ""} style={{ fontSize: flame.size }}>{flame.emoji}</span>
              {appState.streak || 0}-day · {flame.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-mute)" }}>
              Level {lv.level} · {lv.name}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-mute)" }}>
              {todayXp} / {appState.dailyGoalXp} XP today
            </span>
          </div>

          {/* One-time name capture — makes every greeting personal from then on */}
          {!appState.userName && <NameCapture onSave={(n) => setAppState((s) => ({ ...s, userName: n }))} />}
        </div>

        {/* ===== TODAY'S PLAN — the root rail ===== */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <h3 style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>
            Today's plan
          </h3>
          <span style={{ fontSize: 12, fontWeight: 800, color: doneCount === plan.length ? "var(--primary)" : "var(--text-mute)" }}>
            {doneCount}/{plan.length} {doneCount === plan.length ? "· done 🎉" : ""}
          </span>
        </div>

        <div className="plan-rail" style={{ marginBottom: 26 }}>
          <div className="plan-stem" aria-hidden="true" />
          {plan.map((step, i) => (
            <PlanStep
              key={step.id}
              step={step}
              index={i}
              state={step.done ? "done" : i === activeIdx ? "active" : "next"}
            >
              {/* Inline Moment: warm-up on light days happens right here */}
              {step.inline && !step.done && i === activeIdx && (
                <MomentCard
                  pack={pack}
                  lang={lang}
                  embedded
                  onDone={() => setAppState((s) => ({
                    ...s,
                    momentDone: { ...(s.momentDone || {}), [pack.code]: today },
                  }))}
                />
              )}
            </PlanStep>
          ))}
        </div>

        {/* ===== MILESTONE EXAM (kept from v39, quieter) ===== */}
        {(() => {
          const done = appState?.lessonsCompleted?.[pack.code] || 0;
          const lastCleared = appState?.lastCheckpointAt?.[pack.code] ?? -1;
          const dueForExam =
            done >= 3 && done % 3 === 0 && lastCleared !== done && (stats.learned || 0) >= 6;
          if (!dueForExam) return null;
          const examSize = Math.min(15, Math.max(6, stats.learned));
          return (
            <div style={{
              background: "var(--surface)", border: "2px solid var(--purple)",
              borderRadius: "var(--radius-lg)", padding: 18, marginBottom: 22,
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--purple)", marginBottom: 4 }}>
                📝 Milestone exam
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 4 }}>{done}-lesson milestone reached</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.5 }}>
                {examSize} questions testing your words every way — recall, recognition, listening, gaps. Pass it and you'll know they've really stuck.
              </div>
              <Button
                style={{ background: "var(--purple)", boxShadow: "0 4px 0 #5b21b6" }}
                onClick={() => onNavigate("lesson", { mode: "exam", sessionSize: examSize, milestone: done })}
              >
                Start milestone exam →
              </Button>
            </div>
          );
        })()}

        {/* ===== SECONDARY: explore chips (quiet) ===== */}
        <div className="fade-secondary" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 22, paddingBottom: 4 }}>
          {pack.alphabet?.length > 0 && (
            <ExploreChip onClick={() => onNavigate("alphabet")}>🔤 Letters & sounds</ExploreChip>
          )}
          <ExploreChip onClick={() => onNavigate("flashcards")}>📇 Flashcards</ExploreChip>
          {(stats.learned || 0) >= 15 && (
            <ExploreChip onClick={() => onNavigate("lesson", { mode: "exam", sessionSize: Math.min(25, stats.learned) })}>
              📝 Big exam
            </ExploreChip>
          )}
          <ExploreChip onClick={() => onNavigate("grammar")}>🧭 Grammar</ExploreChip>
          <ExploreChip onClick={() => onNavigate("vocab")}>📚 My words</ExploreChip>
        </div>

        {/* ===== GOAL PICKER (v41, compact) ===== */}
        {(() => {
          const lessonsDone = appState?.lessonsCompleted?.[pack.code] || 0;
          const CORE_LESSONS = 2;
          if (lessonsDone < CORE_LESSONS) {
            return (
              <div className="fade-secondary" style={{
                background: "var(--surface)", border: "1px dashed var(--border)",
                borderRadius: "var(--radius-lg)", padding: 14, marginBottom: 20,
                fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5,
              }}>
                🔓 Finish your first couple of lessons and you'll be able to
                <strong style={{ color: "var(--text)" }}> choose your own path</strong> — travel, conversation, family, and more.
              </div>
            );
          }
          const currentGoalId = appState?.learningGoal?.[pack.code];
          const currentGoal = getGoal(currentGoalId);
          return (
            <div style={{ marginBottom: 20 }}>
              {!currentGoal ? (
                <PathChooser
                  onPick={(goalId) =>
                    setAppState((s) => ({ ...s, learningGoal: { ...(s.learningGoal || {}), [pack.code]: goalId } }))
                  }
                />
              ) : (
                <div className="fade-secondary" style={{
                  background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: 14,
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ fontSize: 26 }}>{currentGoal.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-dim)" }}>
                      Your focus
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text)" }}>{currentGoal.title}</div>
                  </div>
                  <button
                    onClick={() =>
                      setAppState((s) => {
                        const lg = { ...(s.learningGoal || {}) };
                        delete lg[pack.code];
                        return { ...s, learningGoal: lg };
                      })
                    }
                    style={{
                      background: "var(--surface-hi)", border: "1px solid var(--border)",
                      borderRadius: 8, padding: "6px 12px", color: "var(--text-dim)",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ===== REAL-LIFE GOALS (the journey, renamed) ===== */}
        <h3 style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          Real-life goals
        </h3>

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

        {/* ===== FRAMEWORK (secondary) ===== */}
        {framework && (
          <Card className="fade-secondary" style={{ marginTop: 22, background: "var(--surface-hi)", border: "1px dashed var(--root)" }}>
            <div style={{ fontSize: 11, color: "var(--root)", fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>
              ⚡ FRAMEWORK
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{framework.title}</div>
            <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5 }}>{framework.body}</div>
          </Card>
        )}
      </Container>

      {/* ===== STICKY CTA (mobile) — the next step, one thumb away ===== */}
      <div className="sticky-cta-wrap">
        {activeStep ? (
          <button
            className="sticky-cta"
            onClick={() => activeStep.go ? activeStep.go() : window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span style={{ fontSize: 18, marginRight: 8 }}>{activeStep.icon}</span>
            Continue learning · ~{activeStep.mins} min →
          </button>
        ) : (
          <button className="sticky-cta sticky-cta-done" onClick={() => onNavigate("hub")}>
            🎉 Plan complete — free practice →
          </button>
        )}
      </div>
    </div>
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
  const doneRef = useRef(reduced);

  useEffect(() => {
    if (reduced) { setShown(text); return; }
    doneRef.current = false;
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 2; // two chars a tick — brisk, not sluggish
      setShown(text.slice(0, i));
      if (i >= text.length) { doneRef.current = true; clearInterval(id); }
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
// PLAN STEP — one node on the root rail
// =============================================================================
function PlanStep({ step, index, state, children }) {
  const isActive = state === "active";
  const isDone = state === "done";

  return (
    <div className={`plan-step plan-step-${state}`}>
      {/* Node on the stem */}
      <div className={`plan-node ${isDone ? "plan-node-done pop" : isActive ? "plan-node-active" : ""}`}>
        {isDone ? "✓" : step.icon}
      </div>

      {/* Card — a div with button semantics (NOT a <button>) because the
          warm-up Moment embeds its own buttons inside; nested <button>s are
          invalid HTML and break tap handling on iOS. */}
      <div
        className={`plan-card ${isActive ? "plan-card-active card-lift" : ""}`}
        role="button"
        tabIndex={step.go ? 0 : -1}
        onClick={() => step.go && step.go()}
        onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && step.go) { e.preventDefault(); step.go(); } }}
        style={{ cursor: step.go ? "pointer" : "default" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
              color: isActive ? "var(--accent)" : "var(--text-mute)",
            }}>
              Step {index + 1}{isDone ? " · done" : isActive ? " · up next" : ""}
            </div>
            <div style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: isActive ? 19 : 16, fontWeight: 700, marginTop: 3,
              color: "var(--ink)",
              textDecoration: isDone ? "line-through" : "none",
              textDecorationColor: "var(--text-mute)",
              textDecorationThickness: 1,
            }}>
              {step.title}
            </div>
            {!isDone && (
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 3, lineHeight: 1.4 }}>
                {step.sub}
              </div>
            )}
            {isActive && (
              <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 8, fontWeight: 700 }}>
                ⏱ Most learners at your level finish this in ~{step.mins + 1} min
              </div>
            )}
          </div>
          {!isDone && (
            <div style={{
              flexShrink: 0, fontSize: 12, fontWeight: 800, whiteSpace: "nowrap",
              borderRadius: 999, padding: "7px 13px",
              background: isActive ? "var(--accent)" : "var(--surface-hi)",
              color: isActive ? "#fff" : "var(--text-dim)",
              boxShadow: isActive ? "0 3px 0 #b45309" : "none",
            }}>
              {step.go ? `${step.mins} min →` : `${step.mins} min`}
            </div>
          )}
        </div>
        {children && <div style={{ marginTop: 12 }}>{children}</div>}
      </div>
    </div>
  );
}

// =============================================================================
// MOMENT — active-recall daily word (v55), now embeddable inside the plan
// =============================================================================
export function MomentCard({ pack, lang, onDone, embedded = false }) {
  const [revealed, setRevealed] = useState(false);
  const vocab = pack.vocab || [];
  if (!vocab.length) return null;
  const dayIdx = Math.floor(Date.now() / 86400000);
  const word = vocab[dayIdx % vocab.length];
  const fact = (() => { try { const f = pickFunFact(pack.code, []); return typeof f?.fact === "string" ? f.fact : null; } catch { return null; } })();

  const reveal = (e) => {
    e?.stopPropagation?.();
    setRevealed(true);
    speak(word.lemma, lang.ttsCode, { audioId: word.id });
    onDone?.();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: embedded ? "var(--surface-hi)" : "var(--surface-hi)",
        borderRadius: 14, padding: "14px 16px",
        border: "1px solid var(--border)", textAlign: "left",
      }}
    >
      <div style={{ fontSize: 15, lineHeight: 1.5, color: "var(--text)" }}>
        How would you say <strong>"{word.meaning}"</strong> in {lang.name}?
      </div>
      {!revealed ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Say it out loud first, then…</span>
          <button
            onClick={reveal}
            style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
          >
            Reveal
          </button>
        </div>
      ) : (
        <div
          onClick={(e) => { e.stopPropagation(); speak(word.lemma, lang.ttsCode, { audioId: word.id }); }}
          style={{ marginTop: 10, fontWeight: 800, fontSize: 20, color: "var(--primary)", cursor: "pointer" }}
        >
          {word.lemma} 🔊 {word.translit ? <span style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 600 }}>({word.translit})</span> : null}
        </div>
      )}
      {revealed && fact && (
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 10, lineHeight: 1.5 }}>{fact}</div>
      )}
    </div>
  );
}

// =============================================================================
// NAME CAPTURE — one-time, inline, dismissable by simply ignoring it
// =============================================================================
function NameCapture({ onSave }) {
  const [name, setName] = useState("");
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "center", marginTop: 14,
      background: "var(--surface)", border: "1px dashed var(--border)",
      borderRadius: 999, padding: "6px 8px 6px 16px", maxWidth: 380,
    }}>
      <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 700, whiteSpace: "nowrap" }}>
        What should I call you?
      </span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); }}
        placeholder="Your name"
        style={{
          flex: 1, minWidth: 60, border: "none", background: "transparent",
          fontSize: 14, fontWeight: 700, outline: "none", padding: "6px 0",
        }}
      />
      <button
        onClick={() => name.trim() && onSave(name.trim())}
        disabled={!name.trim()}
        style={{
          background: name.trim() ? "var(--primary)" : "var(--surface-hi)",
          color: name.trim() ? "#fff" : "var(--text-mute)",
          border: "none", borderRadius: 999, padding: "7px 14px",
          fontSize: 13, fontWeight: 800, cursor: name.trim() ? "pointer" : "default",
        }}
      >
        Save
      </button>
    </div>
  );
}

function ExploreChip({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: "0 0 auto", background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 999, padding: "10px 16px", fontSize: 13, fontWeight: 800,
        color: "var(--text)", cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// =============================================================================
// PRACTICE HUB — the "Practice" tab. Calm grid of every drill in the app.
// =============================================================================
export function PracticeHub({ pack, stats, appState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
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
  return (
    <Container>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 12, marginBottom: 4 }}>Practice</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 20, fontSize: 14 }}>
        Every drill in one place. Dip in wherever you like — none of this is graded.
      </p>
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
              fontSize: 26, width: 50, height: 50, borderRadius: 14, flexShrink: 0,
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
// UNIT NODE — journey card, de-oranged (v57): amber is reserved for the
// active plan step. Completed units settle into a quiet green.
// =============================================================================
function UnitNode({ unit, index, isCurrent, onTap, onTestOut }) {
  const isComplete = unit.pct >= 1;
  const isLocked = !unit.unlocked;

  let bg, fg, border;
  if (isLocked) {
    bg = "var(--surface)"; fg = "var(--text-mute)"; border = "var(--border)";
  } else if (isComplete) {
    bg = "var(--primary-soft)"; fg = "var(--primary-dark)"; border = "var(--primary)";
  } else if (isCurrent) {
    bg = "linear-gradient(135deg, var(--primary), var(--primary-dark))"; fg = "#fff"; border = "var(--primary)";
  } else {
    bg = "var(--surface)"; fg = "var(--text)"; border = "var(--border)";
  }

  return (
    <div
      style={{
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: "var(--radius-lg)",
        color: fg,
        opacity: isLocked ? 0.8 : 1,
        boxShadow: isCurrent ? "0 4px 0 var(--primary-dark)" : "none",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onTap}
        disabled={isLocked}
        style={{
          width: "100%", background: "transparent", border: "none", padding: 16,
          color: "inherit", cursor: isLocked ? "not-allowed" : "pointer",
          textAlign: "left", display: "flex", alignItems: "center", gap: 14,
        }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: isLocked ? "var(--surface-hi)" : isComplete ? "rgba(47,125,79,0.12)" : "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, flexShrink: 0, position: "relative",
          }}
        >
          {isLocked ? "🔒" : isComplete ? "✅" : unit.emoji}
          {!isLocked && !isComplete && unit.pct > 0 && (
            <svg style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} width="56" height="56">
              <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3" />
              <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3"
                strokeDasharray={`${unit.pct * 163} 163`} strokeLinecap="round" />
            </svg>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>
            Goal {index + 1} · {unit.title}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{goalLabel(unit)}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
            {isLocked
              ? "Complete the previous goal to unlock"
              : isComplete
              ? `🏆 Done · ${unit.mastered} mastered`
              : `${unit.learned} / ${unit.total} words`}
          </div>
        </div>

        {!isLocked && (
          <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.9, flexShrink: 0 }}>→</div>
        )}
      </button>

      {isLocked && onTestOut && index > 0 && (
        <div
          style={{
            borderTop: "1px dashed var(--border)", padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Already know this? Skip with a quick test.
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onTestOut(); }}
            style={{
              background: "var(--ink)", color: "#fff", border: "none",
              borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 800,
              cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            🎯 Test out
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CHAPTER EXAM CARD (v44 mechanics, v57 quieter styling)
// =============================================================================
function ChapterExamCard({ chapterNum, available, passed, onStart }) {
  const border = passed ? "var(--primary)" : available ? "var(--purple)" : "var(--border)";
  return (
    <div
      onClick={() => available && !passed && onStart()}
      style={{
        background: passed ? "var(--primary-soft)" : "var(--surface)",
        border: `2px solid ${border}`,
        borderRadius: "var(--radius-lg)",
        padding: 18,
        cursor: available && !passed ? "pointer" : "default",
        opacity: !available && !passed ? 0.65 : 1,
        position: "relative",
        marginTop: 4, marginBottom: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 32 }}>{passed ? "🏆" : available ? "📝" : "🔒"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-dim)" }}>
            Chapter {chapterNum} Exam
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, color: passed ? "var(--primary-dark)" : available ? "var(--purple)" : "var(--text)" }}>
            {passed ? "Passed ✓" : available ? "Ready — test to unlock the next chapter" : "Finish this chapter to unlock"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
            {passed
              ? "Retake it any time to refresh"
              : available
              ? "3 rounds · need 70% to pass · unlimited retries"
              : "Complete the 3 goals above first"}
          </div>
        </div>
        {available && !passed && <div style={{ fontSize: 22, color: "var(--purple)" }}>→</div>}
      </div>
    </div>
  );
}

// =============================================================================
// PATH CHOOSER (v41, unchanged mechanics)
// =============================================================================
function PathChooser({ onPick }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: "var(--radius-lg)",
      padding: 18, border: "2px solid var(--primary)",
    }}>
      <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>
        🎯 Choose your path
      </div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 }}>
        You've got the basics down. What do you want to focus on? Your lessons
        will prioritise the words that matter for your goal. You can change this
        any time.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LEARNING_GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => onPick(g.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "var(--bg)", border: "2px solid var(--border)",
              borderRadius: 12, padding: 14, cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ fontSize: 30, flexShrink: 0 }}>{g.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>{g.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2, lineHeight: 1.4 }}>{g.blurb}</div>
            </div>
            <div style={{ fontSize: 20, color: "var(--text-dim)" }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
}
