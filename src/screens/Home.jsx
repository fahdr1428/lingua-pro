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
import { hasJourney, getStops, getChapterTitle, stopsReached } from "../data/journey.js";
import { getCharacter } from "../data/characters.js";
import { GuideMark } from "../ui/GuideMark.jsx";
import { JourneyMap } from "./JourneyMap.jsx";
import { cultureOfTheDay, tagLabel, hasCulture } from "../data/culture.js";
import { isRecognitionSupported } from "../audio/speech.js";
import { getLevel } from "../engine/gamification.js";
import { computeFluency } from "../engine/fluency.js";
import { hasDialectData, regionLabel } from "../data/dialects.js";
import { MISSIONS } from "../data/missions.js";
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
//
// v78: `public/scenes/` does not exist and never has. Every home render fired
// two image requests that 404'd before the band hid itself — wasted round trips
// on the critical path, and 404s in the console of anyone who opened dev tools.
// The component is kept, because the idea is good and the images may yet be
// made, but it now checks whether the file is there before rendering anything,
// and stays silent when it isn't.
const sceneCache = new Map(); // code → Promise<string|null>

function findScene(code) {
  if (sceneCache.has(code)) return sceneCache.get(code);
  const p = new Promise((resolve) => {
    const idx = 1 + Math.floor(Math.random() * 3);
    const tryLoad = (n, fallback) => {
      const img = new Image();
      img.onload = () => resolve(`/scenes/${code}-${n}.jpg`);
      img.onerror = () => (fallback ? tryLoad(1, false) : resolve(null));
      img.src = `/scenes/${code}-${n}.jpg`;
    };
    tryLoad(idx, idx !== 1);
  });
  sceneCache.set(code, p);
  return p;
}

function SceneBand({ code, name }) {
  const [src, setSrc] = useState(null);
  const kb = useMemo(() => (Math.random() < 0.5 ? "kb-a" : "kb-b"), []);

  useEffect(() => {
    let live = true;
    findScene(code).then((s) => { if (live) setSrc(s); });
    return () => { live = false; };
  }, [code]);

  if (!src) return null;
  return (
    <div className={`scene-band ${kb}`}>
      <img src={src} alt="" width="880" height="344" />
      <div className="scene-veil" />
      <div className="scene-cap">{name}</div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// v65 SMART LAYER — reads signals the app already tracks (no AI backend, no
// API cost, no latency, and it can never invent a wrong statistic). Every
// number shown to the learner comes from their real progress data.
// ---------------------------------------------------------------------------
function useLearnerSignals(appState, stats, langCode) {
  return useMemo(() => {
    const today = new Date().toDateString();
    const last = appState?.lastStudyDate || null;
    // Days since last study (0 = today, 1 = yesterday, …)
    let daysIdle = 0;
    if (last && last !== today) {
      const diff = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
      daysIdle = Math.max(1, isNaN(diff) ? 1 : diff);
    }
    // Recent accuracy from the last few sessions (if recorded)
    const sessions = Array.isArray(appState?.sessions) ? appState.sessions.slice(-5) : [];
    const withAcc = sessions.filter((x) => typeof x?.accuracy === "number");
    const recentAccuracy = withAcc.length
      ? withAcc.reduce((a, b) => a + b.accuracy, 0) / withAcc.length
      : null;
    const lessonsDone = appState?.lessonsCompleted?.[langCode] || 0;
    return {
      daysIdle,
      isComeback: daysIdle >= 2,
      isFirstEver: lessonsDone === 0,
      recentAccuracy,          // 0–1 or null when unknown
      struggling: recentAccuracy !== null && recentAccuracy < 0.6,
      confident: recentAccuracy !== null && recentAccuracy >= 0.9,
      streak: appState?.streak || 0,
      due: stats?.due || 0,
    };
  }, [appState, stats, langCode]);
}

// Context-aware phrasing. A written pool chosen by real signals — same warmth
// as generated copy, but deterministic and honest.
function adaptCopy(plan, sig) {
  if (!plan) return plan;
  const p = { ...plan };
  if (sig.isComeback && (p.kind === "review" || p.kind === "lesson")) {
    p.eyebrow = "Welcome back";
    p.title = sig.due > 0
      ? `Quick comeback — bring back ${sig.due} words`
      : "Quick comeback session";
    p.sub = `It's been ${sig.daysIdle} day${sig.daysIdle === 1 ? "" : "s"} — a short one is all it takes to pick the thread back up.`;
    p.mins = Math.min(p.mins || 3, 2);
  } else if (p.kind === "review" && sig.struggling) {
    p.eyebrow = "Shore up";
    p.sub = "These are the ones slipping — a few minutes here pays off more than new words.";
  } else if (p.kind === "lesson" && sig.confident) {
    p.eyebrow = "You're on a roll";
    p.sub = p.sub || "";
    p.sub = "Recent recall has been strong — good moment to take on new ground.";
  } else if (p.kind === "lesson" && sig.isFirstEver) {
    p.eyebrow = "Start here";
    p.sub = "Your first few words — we'll quiz them gently until they stick.";
  }
  return p;
}

export function Home({ engine, pack, stats, appState, setAppState, onNavigate, onPickLanguage, profile }) {
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

  // v65: adapt the chosen plan's wording to the learner's current situation.
  const signals = useLearnerSignals(appState, stats, pack.code);

  // v66 JOURNEY — capability stops for languages that have verified content.
  // Languages without it keep the existing unit path untouched.
  const stops = hasJourney(pack.code) ? getStops(pack.code) : [];
  const reached = stops.length ? stopsReached(pack.code, unitProgress) : 0;
  const currentStop = stops.length ? stops[Math.min(reached, stops.length - 1)] : null;
  const smartAction = useMemo(() => adaptCopy(nextAction, signals), [nextAction, signals]);

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

  // v70: tied to the unit they're actually on, so the note is contextual rather
  // than trivia — etiquette for the greetings unit, register for pronouns, etc.
  const cultureNote = useMemo(
    () => cultureOfTheDay(pack.code, { unit: currentUnit?.id, category: currentUnit?.title }),
    [pack.code, currentUnit?.id, currentUnit?.title]
  );

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
      <Container className="home-container">

        <SceneBand code={pack.code} name={lang.name} />

        <div className="home-cols">
        <div>

        {/* ===== 1 · GREETING + COACH LINE =====
            v78: this block was 291px — a 30px two-line headline, a typewriter
            line, a byline and a name field — which pushed the one thing on this
            screen you can actually press below the fold on a phone. It's now a
            single compact row. The headline earns its place at the top of a
            marketing page; on the screen you open every day to do a lesson, the
            lesson is what should be visible. */}
        <div className="home-greet">
          {character
            ? <GuideMark code={pack.code} size={34} />
            : <span style={{ fontSize: 22, lineHeight: "30px" }}>🌿</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 2 }}>
              {daypart()}{appState.userName ? `, ${appState.userName}` : ""}
              {character ? ` · ${character.name}` : ""}
            </div>
            <Typewriter key={line} text={line} style={{
              fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.45, minHeight: 21,
            }} />
          </div>
        </div>
        {!appState.userName && (
          <NameCapture onSave={(n) => setAppState((s) => ({ ...s, userName: n }))} />
        )}

        {/* ===== 2 · UP NEXT — the one action ===== */}
        {/* v65: comeback nudge — only when genuinely away 2+ days, warm not guilt-trippy */}
        {signals.isComeback && (
          <div style={{
            background: "var(--primary-soft)", border: "1px solid var(--primary)",
            borderRadius: 14, padding: "12px 16px", marginBottom: 14,
            fontSize: 13, color: "var(--primary-dark)", fontWeight: 700,
          }}>
            🌱 Good to see you back{signals.streak > 0 ? "" : " — streaks restart easily"}. A two-minute session is enough today.
          </div>
        )}

        {smartAction && (
          <div className="hero-premium">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow" style={{ color: "var(--root)" }}>
                  {goalMet ? "Daily goal met · keep going" : smartAction.eyebrow}
                </div>
                <div style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 25, fontWeight: 600, marginTop: 6, lineHeight: 1.2, color: "var(--ink)",
                }}>
                  {smartAction.title}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 8, lineHeight: 1.5 }}>
                  {smartAction.sub}
                </div>
              </div>
              <DailyRing pct={dailyPct} met={goalMet} today={todayXp} goal={appState.dailyGoalXp || 35} />
            </div>

            {/* v66: the conversation this stop unlocks — shown on lesson steps */}
            {currentStop && smartAction.kind === "lesson" && (
              <div className="exchange">
                <div>
                  <div className="exchange-label">They say</div>
                  <div className="exchange-line" dir={lang.rtl ? "rtl" : "ltr"}>{currentStop.they.text}</div>
                  <div className="exchange-en">{currentStop.they.translit} — {currentStop.they.en}</div>
                </div>
                <div>
                  <div className="exchange-label">You answer</div>
                  <div className="exchange-line" dir={lang.rtl ? "rtl" : "ltr"}>{currentStop.you.text}</div>
                  <div className="exchange-en">{currentStop.you.translit} — {currentStop.you.en}</div>
                </div>
              </div>
            )}

            {smartAction.progress && (
              <div style={{ marginTop: 16 }}>
                <div className="hairline-bar">
                  <div className="hairline-fill progress-fill" style={{ width: `${Math.round((smartAction.progress.value / smartAction.progress.max) * 100)}%` }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 6 }}>
                  {smartAction.progress.value} of {smartAction.progress.max} words
                </div>
              </div>
            )}

            <button className="btn-premium" onClick={smartAction.go}>
              {goalMet ? "Keep going" : "Continue"} · ~{smartAction.mins} min
            </button>

            {weakWord && smartAction.kind !== "review" && (
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
        <div className="stat-strip desktop-hide">
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

        {/* ===== LEVEL 2 · WHERE AM I GOING — the route, as a map (v70) =====
            Moved directly under the hero in v85. It used to sit below the
            practice doors and the progress numbers, so "where am I in this
            language?" — the question a returning learner actually opens the app
            with — was three scrolls down, under things they had not asked for
            yet. The order of this page is now the order of the questions:
            what do I do now → where am I → what else can I practise → how am I
            doing overall. */}
        <h3 className="home-section-head">Your route</h3>

        {loadingUnits ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>Loading…</div>
        ) : stops.length > 0 ? (
          <JourneyMap
            langCode={pack.code}
            lang={lang}
            stops={stops}
            reached={reached}
            unitProgress={unitProgress}
            appState={appState}
            pack={pack}
            onNavigate={onNavigate}
          />
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

        {/* ===== LEVEL 3 · WHAT ELSE CAN I PRACTISE =====
            These were scattered: the speaking door sat above the fluency
            numbers, the decode and skip-ahead doors were wedged between the
            route heading and the route itself. Individually each is a good
            card; at the same visual weight and in no particular order they
            competed with the one action the page is actually recommending.
            Grouped under a heading they read as a menu you consult when you
            want something else, which is what they are. */}
        <h3 className="home-section-head">Practise something real</h3>
        <div className="practise-grid">
        {/* v78 — the door to real life. Placed above the route, because for the
            audience this app is actually for, the message they can't read is a
            more urgent problem than lesson four. */}
        <button className="skip-invite skip-invite-lead" onClick={() => onNavigate("decode")}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="speak-invite-title">Got a message you can't read?</span>
            <span className="speak-invite-sub">
              Paste any real {lang.name} — a text from family, a sign, a song.
              See what it says, and how much of it you already knew.
            </span>
          </span>
          <span className="speak-invite-arrow" aria-hidden="true">→</span>
        </button>

        {/* ===== 3b · SPEAK IT — the app can finally listen (v70) ===== */}
        {(stats.learned || 0) >= 3 && (
          <button className="speak-invite" onClick={() => onNavigate("speak")}>
            <span className="speak-invite-icon" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="speak-invite-title">Say it out loud</span>
              <span className="speak-invite-sub">
                {isRecognitionSupported()
                  ? "I'll listen and tell you honestly — accents welcome"
                  : "Practise producing it from memory"}
              </span>
            </span>
            <span className="speak-invite-arrow" aria-hidden="true">→</span>
          </button>
        )}

        {/* v76 — the words that differ where they're going. Only shown when the
            language actually has dialect data, so it never appears as an empty
            promise. */}
        {hasDialectData(pack.vocab) && (
          <button className="skip-invite" onClick={() => onNavigate("dialect")}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="speak-invite-title">
                {profile?.region
                  ? `What they actually say in ${regionLabel(pack.code, profile.region)}`
                  : `${lang.name} isn't one language`}
              </span>
              <span className="speak-invite-sub">
                {profile?.region
                  ? "Drill the words that change — the ones that'd leave you stuck"
                  : "Pick the variety you're learning for and drill what differs"}
              </span>
            </span>
            <span className="speak-invite-arrow" aria-hidden="true">→</span>
          </button>
        )}

        {/* v75 — for anyone who already knows a chunk of this. Grinding "hello"
            when you grew up hearing the language is why people leave on day one. */}
        <button className="skip-invite" onClick={() => onNavigate("skipahead")}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="speak-invite-title">Already know some {lang.name}?</span>
            <span className="speak-invite-sub">Take a chapter test and skip straight past it</span>
          </span>
          <span className="speak-invite-arrow" aria-hidden="true">→</span>
        </button>

          <button className="skip-invite" onClick={() => onNavigate("hub")}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="speak-invite-title">Everything else</span>
              <span className="speak-invite-sub">Flashcards, reading, grammar, the alphabet course</span>
            </span>
            <span className="speak-invite-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        {/* ===== LEVEL 4 · HOW AM I DOING OVERALL =====
            Last on purpose. Progress figures are what you check when you are
            already here and already learning; leading with them answers a
            question nobody arrived with. */}
        <h3 className="home-section-head">How you're doing</h3>
        {/* ===== 3c · WHERE YOU ACTUALLY ARE (v73) =====
            The fluency number and the missions entry, side by side. This is the
            answer to "no outcome": a figure that moves when you speak, and a list
            of conversations you can now get through. Both show the truth when
            there isn't one yet — a dash, not a flattering placeholder. */}
        <FluencyStrip profile={profile} lang={lang} onNavigate={onNavigate} />

        </div>

        <aside className="reach-rail">
          <ReachPanel
            stops={stops}
            reached={reached}
            chapterTitle={getChapterTitle(pack.code)}
            due={stats.due || 0}
            onReview={() => onNavigate("lesson", { mode: "due" })}
          />

          {/* v70: one cultural note a day — the "why it's said that way" layer
              that a word list can't give you. Rotates daily, deterministic so
              it doesn't flicker between renders. */}
          {cultureNote && (
            <div className="culture-note" style={{ marginTop: 22 }}>
              <div className="culture-tag">{tagLabel(cultureNote.tag)}</div>
              <div className="culture-title">{cultureNote.title}</div>
              <div className="culture-body">{cultureNote.body}</div>
            </div>
          )}
        </aside>
        </div>
      </Container>
    </div>
  );
}

// =============================================================================
// DAILY RING — the daily goal, drawn as a fine ring. Fills as XP comes in.
// =============================================================================
// v85 — "0% OF WHAT?"
//
// This showed a bare percentage in the corner of the hero card, next to a title
// like "Build: Subject + Verb". Every reasonable reading of that is wrong: it
// looks like 0% of the lesson, or 0% of the words remembered, or 0% of the
// chapter. It is the share of today's XP goal, and nothing on screen said so.
//
// A number nobody can interpret is worse than no number, and on a first session
// it is actively discouraging — a big fat 0% for someone who has done nothing
// wrong. It now shows the XP itself with the goal spelled out underneath, which
// is the same information and needs no decoding.
function DailyRing({ pct = 0, met = false, today = 0, goal = 0 }) {
  const R = 24, C = 2 * Math.PI * R;
  return (
    <div className="daily-ring">
      <svg
        width="60" height="60" viewBox="0 0 60 60" style={{ flexShrink: 0 }}
        role="img"
        aria-label={met ? `Daily goal met — ${today} XP` : `${today} of ${goal} XP today`}
      >
        <circle cx="30" cy="30" r={R} fill="none" stroke="var(--border)" strokeWidth="3.5" />
        <circle
          cx="30" cy="30" r={R} fill="none"
          stroke={met ? "var(--primary)" : "var(--root)"} strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 30 30)"
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)" }}
        />
        <text x="30" y="36" textAnchor="middle" fill="var(--ink)" fontSize={met ? "17" : "16"} fontWeight="800">
          {met ? "✓" : today}
        </text>
      </svg>
      <span className="daily-ring-cap">{met ? "goal met" : `of ${goal} XP`}</span>
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
        aria-label="Your name"
        autoComplete="given-name"
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
    // v70: the mic moved to the bottom nav's Speak tab, so reading and
    // conversations — which used to live behind that tab — get a door here.
    // Without this they'd have become unreachable.
    // v79: reading gets its own door. It used to be reachable only through the
    // combined "Read & listen" screen, two taps in — which was defensible when
    // the library was 13 passages across 14 languages, and isn't now there are
    // 41 and every language has some. Connected text you can mostly understand
    // is the best-evidenced way anyone learns a language; it shouldn't be the
    // hardest thing in the app to find.
    { icon: "📖", title: `Read some ${lang.name}`, sub: "Short pieces built only from words you've met", go: () => onNavigate("reading"), highlight: (stats.learned || 0) >= 10 },
    // v83: those 41 passages are 623 words BETWEEN THEM — a minute of reading
    // split fourteen ways, and four words of it is Korean. The sentence stream
    // is several times that in every language, assembled from the example
    // sentences the curriculum already carries, so it gets its own door rather
    // than living behind the one that runs out fastest.
    { icon: "📜", title: `${lang.name} you can read`, sub: "Real sentences, at exactly your level", go: () => onNavigate("stream"), highlight: (stats.learned || 0) >= 15 },
    { icon: "🎧", title: "Listen & follow", sub: "Scripted conversations, with subtitles", go: () => onNavigate("practice") },
    { icon: "📇", title: "Flashcards", sub: "Flip through your words at your own pace", go: () => onNavigate("flashcards") },
    { icon: "🧭", title: "Grammar", sub: `How ${lang.name} actually fits together`, go: () => onNavigate("grammar") },
    { icon: "📚", title: "My words", sub: `${stats.learned || 0} learned · ${stats.mastered || 0} mastered`, go: () => onNavigate("vocab") },
  ];
  if (hasCulture(pack.code)) {
    doors.push({
      icon: "🫖", title: `Inside ${lang.name}`,
      sub: "Etiquette, register, and what natives notice",
      go: () => onNavigate("culture"),
    });
  }
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


// v66 — "Your reach": the widening circle of conversations you can hold.
// Reads from real unit progress, so it can never overstate what someone knows.
// =============================================================================
// THE TODAY PANEL (v85, was ReachPanel)
//
// The review that prompted this said the right-hand column "feels almost like
// another website has been placed next to the dashboard", and that was fair.
// It held three unrelated things in no particular order: a list of phrases you
// can already say, a chapter counter, a review button, and — rendered
// separately, outside this component entirely — a card about pronunciation.
// Four pieces of information, no hierarchy, nothing tying them together.
//
// They are all about TODAY, so the panel now says so and orders them by what
// the learner can act on:
//
//   1. what is waiting for you    — the only thing here with a button
//   2. where you are              — one line, no ceremony
//   3. what you can already say   — the reward, and it reads as a reward when
//                                   it is not competing with the other two
//
// The pronunciation note stays outside the component (it rotates daily and has
// nothing to do with progress) but now sits under the same heading, so the
// column reads as one panel rather than as two.
// =============================================================================
export function ReachPanel({ stops = [], reached = 0, chapterTitle, due = 0, onReview }) {
  const held = stops.slice(0, reached);
  return (
    <div>
      <h3 className="eyebrow" style={{ margin: "0 0 12px" }}>Today</h3>

      {/* 1 — the one actionable thing in this column. */}
      {due > 0 ? (
        <button className="today-due" onClick={onReview}>
          <span className="today-due-n">{due}</span>
          <span style={{ minWidth: 0 }}>
            <span className="today-due-title">
              {due === 1 ? "word is ready to come back" : "words are ready to come back"}
            </span>
            <span className="today-due-sub">A few minutes keeps them yours</span>
          </span>
        </button>
      ) : (
        <div className="today-clear">
          Nothing waiting to be reviewed — you're clear.
        </div>
      )}

      {/* 2 — where you are, in one line. */}
      {chapterTitle && stops.length > 0 && (
        <div className="today-where">
          <b>Chapter one · {chapterTitle}</b>
          <span>{reached} of {stops.length} stops</span>
        </div>
      )}

      {/* 3 — what that work has bought them so far. */}
      {stops.length > 0 && (
        <>
          <div className="today-sub-head">
            {held.length === 0 ? "What you'll be able to say" : "What you can already say"}
          </div>
          {held.length === 0 ? (
            <div className="today-empty">
              Your first stop fills this in — it's the list you'll want to look at
              on a hard day.
            </div>
          ) : (
            <div className="today-held">
              {held.map((st, i) => (
                <div key={st.id} className="today-held-row">
                  <span className="today-held-tick" aria-hidden="true">✓</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="today-held-what">{st.done}</div>
                    <div className="today-held-say">{st.you.translit}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// v66 — the journey spine. Vertical, scrollable, and every stop states a
// CONVERSATION rather than a unit number. Chapter exams sit inline on the same
// line, and any units past the written stops still render as unit nodes, so
// nothing in the curriculum becomes unreachable.
export function JourneySpine({ stops, reached, unitProgress, appState, pack, onNavigate }) {
  const rows = [];

  stops.forEach((st, i) => {
    const isDone = i < reached;
    const isNow = i === reached;
    const unit = unitProgress[st.unitIndex];
    const label = isDone ? st.done : isNow ? `Next — ${st.next}` : `Then ${st.next}`;
    const last = i === stops.length - 1;

    rows.push(
      <div className="stop-row" key={st.id}>
        <div className="stop-gutter">
          <div className={`stop-dot ${isDone ? "stop-dot-done" : isNow ? "stop-dot-now" : "stop-dot-todo"}`}>
            {isDone ? "✓" : ""}
          </div>
          {!last && <div className={`stop-line ${isDone ? "stop-line-done" : ""}`} />}
        </div>
        <button
          data-unit={unit?.id}
          onClick={() => unit && unit.unlocked && onNavigate("lesson", { mode: "unit", filter: { unit: unit.id } })}
          disabled={!unit || !unit.unlocked}
          style={{
            flex: 1, textAlign: "left", background: "none", border: "none",
            padding: "0 0 16px", cursor: unit?.unlocked ? "pointer" : "default",
            opacity: isDone ? 0.72 : unit?.unlocked ? 1 : 0.5, minWidth: 0,
          }}
        >
          <div style={{ fontSize: 14.5, color: "var(--text)", lineHeight: 1.4, fontWeight: isNow ? 700 : 400 }}>
            {label}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 3 }}>
            {isDone ? st.you.translit : `${st.they.translit} → ${st.you.translit}`}
          </div>
        </button>
      </div>
    );

    // Chapter exam sits on the spine wherever a chapter closes.
    const unitIdx = st.unitIndex;
    const isChapterEnd = (unitIdx + 1) % UNITS_PER_CHAPTER === 0;
    if (isChapterEnd && unitProgress.length > unitIdx + 1) {
      const chapterNum = chapterOfUnitIndex(unitIdx);
      const vocabIds = chapterVocabIds(pack.vocab, chapterNum);
      rows.push(
        <div className="stop-row" key={`exam-${chapterNum}`}>
          <div className="stop-gutter">
            <div className="stop-dot stop-dot-todo" style={{ borderRadius: 3 }} />
            <div className="stop-line" />
          </div>
          <div style={{ flex: 1, paddingBottom: 16, minWidth: 0 }}>
            <ChapterExamCard
              chapterNum={chapterNum}
              available={isChapterExamAvailable(unitProgress, chapterNum)}
              passed={hasPassedChapter(appState, pack.code, chapterNum)}
              onStart={() =>
                onNavigate("lesson", {
                  mode: "chapter_exam",
                  chapter: chapterNum,
                  filter: { vocabIds },
                  sessionSize: Math.min(10, Math.max(6, vocabIds.length)),
                })
              }
            />
          </div>
        </div>
      );
    }
  });

  // Units beyond the written stops keep their existing cards — the curriculum
  // stays fully reachable while capability content is still being written.
  const firstUnwritten = stops.length ? Math.max(...stops.map((s) => s.unitIndex)) + 1 : 0;
  const rest = unitProgress.slice(firstUnwritten);
  if (rest.length > 0) {
    rows.push(
      <div key="rest" style={{ marginTop: 6 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Further on</div>
        <div className="journey-row">
          {rest.map((unit, j) => (
            <UnitNode
              key={unit.id}
              unit={unit}
              index={firstUnwritten + j}
              isCurrent={false}
              onTap={() => unit.unlocked && onNavigate("lesson", { mode: "unit", filter: { unit: unit.id } })}
              onTestOut={() => onNavigate("testout", { fromUnit: unit.id })}
            />
          ))}
        </div>
      </div>
    );
  }

  return <div className="stagger">{rows}</div>;
}

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
        data-unit={unit.id}
        aria-label={`${unit.title}${isLocked ? " — locked" : isComplete ? " — complete" : ""}`}
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
      role="button"
      tabIndex={available && !passed ? 0 : -1}
      aria-disabled={!available || passed}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && available && !passed) { e.preventDefault(); onStart(); }
      }}
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


// ---------------------------------------------------------------------------
// v73 — the fluency score and the missions door, on the home screen where the
// learner can see whether any of this is working.
// ---------------------------------------------------------------------------
function FluencyStrip({ profile, lang, onNavigate }) {
  const f = computeFluency(profile);
  const passed = Object.values(profile?.missions || {}).filter((m) => m.passed).length;

  return (
    <div className="home-strip">
      <button className="strip-card" onClick={() => onNavigate("fluency")}>
        <span className="strip-value">
          {f.overall === null ? "—" : f.overall}
          {f.overall !== null && <span className="strip-of">/100</span>}
        </span>
        <span className="strip-label">Fluency</span>
        <span className="strip-sub">
          {f.overall === null
            ? "Speak once and this starts"
            : f.provisional ? `Early — ${f.evidence.turns} attempts in` : "Tap to see the working"}
        </span>
      </button>

      <button className="strip-card" onClick={() => onNavigate("missions")}>
        <span className="strip-value">{passed}<span className="strip-of">/{MISSIONS.length}</span></span>
        <span className="strip-label">Missions passed</span>
        <span className="strip-sub">
          {passed === 0
            ? `Real situations, in ${lang.name}, with a pass mark`
            : "Conversations you can now get through"}
        </span>
      </button>
    </div>
  );
}
