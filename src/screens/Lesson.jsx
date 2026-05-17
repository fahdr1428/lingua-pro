// =============================================================================
// LESSON — the core learning loop. Generates a session via engine.generateSession,
// renders one exercise at a time, submits answers via engine.submitAnswer.
// =============================================================================

import React, { useState, useEffect, useRef } from "react";
import { Button, Card, ProgressBar, Container } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";
import { EXERCISE, generateLesson } from "../engine/generator.js";
import { explainAnswer } from "../engine/explain.js";
import { getCharacter } from "../data/characters.js";

// Languages that don't use the Latin alphabet — for these, romanization is the
// hero (so beginners can read it) and the native script is a smaller reference.
const NON_LATIN_LANGUAGES = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn"]);

export function Lesson({ engine, pack, appState, setAppState, params, onNavigate, refreshStats }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = NON_LATIN_LANGUAGES.has(pack.code);
  const [session, setSession] = useState(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [typed, setTyped] = useState("");
  const [tapped, setTapped] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [showExplain, setShowExplain] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedItems, setMissedItems] = useState([]); // items answered wrong (for review)
  const [streakInLesson, setStreakInLesson] = useState(0); // consecutive correct in this lesson
  const [hintActive, setHintActive] = useState(false);     // user accepted the hint offer
  const [hintOffered, setHintOffered] = useState(false);   // 60s passed → "Need a hint?" fades in
  const [hearts, setHearts] = useState(appState.hearts);
  const [done, setDone] = useState(false);
  const [resultData, setResultData] = useState(null);
  const startedAt = useRef(Date.now());

  // Build session on mount
  useEffect(() => {
    let cancelled = false;
    engine
      .generateSession({
        mode: params?.mode || "smart",
        filter: params?.filter || null,
        sessionSize: appState?.sessionSize || 6,
        newPerSession: Math.max(2, Math.round((appState?.sessionSize || 6) / 2)),
      })
      .then((s) => {
        if (cancelled) return;
        setSession(s);
      });
    return () => { cancelled = true; };
  }, [engine, params]);

  // Auto-play audio for listening exercises — must be at top with other hooks
  const exercise = session?.exercises?.[idx];
  useEffect(() => {
    if (exercise?.playAudio) speak(exercise.item.lemma, lang.ttsCode, { audioId: exercise.item.id });
  }, [exercise, lang.ttsCode]);

  // After 60s of being stuck on a question (no answer submitted yet), quietly
  // fade in a "Need a hint?" offer. It is OFFERED, not forced — a user who is
  // just being careful or got distracted can ignore it; a genuinely stuck user
  // sees a lifeline appear exactly when they need it. Resets every question.
  useEffect(() => {
    setHintOffered(false);
    setHintActive(false);
    if (!exercise || feedback) return;
    if (exercise.type === EXERCISE.INTRODUCE || exercise.type === EXERCISE.INTRODUCE_BATCH) return;
    const t = setTimeout(() => setHintOffered(true), 60000);
    return () => clearTimeout(t);
  }, [idx, exercise, feedback]);

  if (!session) {
    return <Container><div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>Building your lesson…</div></Container>;
  }

  if (session.exercises.length === 0) {
    return (
      <Container style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 60 }}>🎉</div>
        <h2>All caught up!</h2>
        <p style={{ color: "var(--text-dim)" }}>Nothing to review right now. Try Smart Mix or come back later.</p>
        <Button style={{ marginTop: 20 }} onClick={() => onNavigate("home")}>Back home</Button>
      </Container>
    );
  }

  if (done) {
    return <Result data={resultData} pack={pack} appState={appState} onNavigate={onNavigate} />;
  }

  function reset() {
    setPicked(null);
    setTyped("");
    setTapped([]);
    setFeedback(null);
    setShowExplain(false);
    setHintActive(false);
    setHintOffered(false);
  }

  async function check() {
    let given;
    if (exercise.type === EXERCISE.TAP_WORDS || exercise.type === EXERCISE.BUILD_SENTENCE) given = tapped.join(" ");
    else if (exercise.type === EXERCISE.TYPE_TRANSLATION) given = typed;
    else given = picked;

    const result = await engine.submitAnswer(exercise, given);

    // INTRODUCE is informational — don't count it in correct/total
    if (result.intro) return;

    setFeedback(result.correct ? "correct" : "wrong");
    if (result.correct) {
      setCorrectCount((c) => c + 1);
      setStreakInLesson((s) => s + 1);
    } else {
      setStreakInLesson(0);
      // Record the missed item so we can offer a focused review at the end
      if (exercise.item) {
        setMissedItems((prev) =>
          prev.find((m) => m.id === exercise.item.id) ? prev : [...prev, exercise.item]
        );
      }
      if (!appState.isPremium) setHearts((h) => Math.max(0, h - 1));
    }
  }

  // Skip ONLY used when audio fails on a listening exercise. This forgives a
  // technical problem (broken audio) the user can't control — NOT a difficulty
  // problem. The reason is logged so the founder can see how often audio fails
  // and for which languages. No heart penalty.
  function skipForAudio() {
    try {
      setAppState((s) => ({
        ...s,
        skipLog: [
          ...(s.skipLog || []).slice(-199), // keep last 200
          {
            ts: Date.now(),
            lang: pack.code,
            reason: "audio_not_working",
            exerciseType: exercise?.type || "unknown",
            wordId: exercise?.item?.id || null,
          },
        ],
      }));
    } catch {}
    reset();
    setIdx((i) => i + 1);
  }

  async function next() {
    if (idx + 1 >= session.exercises.length) {
      // Session complete — only count testable exercises (skip INTRODUCE)
      const testable = session.exercises.filter((e) => e.type !== EXERCISE.INTRODUCE && e.type !== EXERCISE.INTRODUCE_BATCH).length;
      const total = testable || session.exercises.length; // fallback in edge case
      const accuracy = total > 0 ? correctCount / total : 1;
      const xpEarned = correctCount * 10 + (accuracy === 1 && correctCount > 0 ? 20 : 0);
      const today = new Date().toDateString();
      const wasYesterday = appState.lastStudyDate === new Date(Date.now() - 86400000).toDateString();
      const newStreak = appState.lastStudyDate === today ? appState.streak : wasYesterday ? appState.streak + 1 : 1;

      await engine.logSession({ correct: correctCount, total, xp: xpEarned, durationMs: Date.now() - startedAt.current });
      const sessions = await engine.getSessions();

      setAppState((s) => ({
        ...s,
        totalXp: s.totalXp + xpEarned,
        streak: newStreak,
        lastStudyDate: today,
        gems: s.gems + Math.floor(xpEarned / 10),
        hearts,
        sessions,
      }));
      await refreshStats();
      setResultData({ correct: correctCount, total, xp: xpEarned, accuracy: Math.round(accuracy * 100) });
      setDone(true);
      return;
    }
    reset();
    setIdx((i) => i + 1);
  }

  const wordStyle = {
    fontSize: lang.rtl ? 42 : 38,
    fontWeight: 800,
    lineHeight: lang.rtl ? 1.5 : 1.2,
    direction: lang.rtl ? "rtl" : "ltr",
    fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
    margin: "20px 0 12px",
  };

  // Safety: if exercise is malformed, skip it.
  // INTRODUCE_BATCH is special — it uses `items` (array), not `item`.
  const isBatch = exercise?.type === EXERCISE.INTRODUCE_BATCH;
  if (!exercise || !exercise.type || (!isBatch && !exercise.item) || (isBatch && !exercise.items?.length)) {
    return (
      <Container style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>🤔</div>
        <h2>Hmm, something odd happened</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 20 }}>This exercise didn't load properly. Let's skip it.</p>
        <Button onClick={() => { reset(); setIdx(i => i + 1); }}>Skip & continue</Button>
        <Button variant="ghost" style={{ marginTop: 12 }} onClick={() => onNavigate("home")}>Back home</Button>
      </Container>
    );
  }

  const canCheck =
    exercise.type === EXERCISE.INTRODUCE ||
    exercise.type === EXERCISE.INTRODUCE_BATCH ||
    (exercise.type.includes("pick") && picked) ||
    (exercise.type === EXERCISE.TYPE_TRANSLATION && typed.trim()) ||
    (exercise.type === EXERCISE.TAP_WORDS && tapped.length > 0) ||
    (exercise.type === EXERCISE.BUILD_SENTENCE && tapped.length > 0) ||
    (exercise.type === EXERCISE.COMPLETE_SENTENCE && picked) ||
    (exercise.type === EXERCISE.LISTEN_PICK && picked);

  const voiceAvailable = hasVoiceFor(lang.ttsCode);

  return (
    <div>
      {/* Lesson topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          background: "var(--bg-alt)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button onClick={() => onNavigate("home")} style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 22, cursor: "pointer" }}>✕</button>
        <div style={{ flex: 1, margin: "0 16px" }}>
          <ProgressBar value={idx + (feedback ? 1 : 0)} max={session.exercises.length} />
        </div>
        {streakInLesson >= 3 && (
          <div
            className="pop"
            key={streakInLesson}
            style={{
              color: "var(--accent)",
              fontWeight: 800,
              fontSize: 13,
              marginRight: 10,
              whiteSpace: "nowrap",
            }}
          >
            🔥 {streakInLesson} in a row
          </div>
        )}
        <div style={{ color: "var(--danger)", fontWeight: 800 }}>❤️ {appState.isPremium ? "∞" : hearts}</div>
      </div>

      <Container style={{ paddingBottom: 200 }}>
        <div className="slide-up" key={idx}>
          {exercise.type !== EXERCISE.INTRODUCE && exercise.type !== EXERCISE.INTRODUCE_BATCH && (
            <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
              {exercise.prompt}
            </div>
          )}

          {/* INTRODUCE_BATCH — flashcard carousel: see all new words first, then test */}
          {exercise.type === EXERCISE.INTRODUCE_BATCH && (
            <IntroBatchCards
              items={exercise.items}
              lang={lang}
              isNonLatin={isNonLatin}
              voiceAvailable={voiceAvailable}
              onComplete={() => { reset(); setIdx((i) => i + 1); }}
            />
          )}

          {/* INTRODUCE — full word card with meaning, example, hear button.
              For non-Latin scripts, romanization is the HERO so beginners can read it. */}
          {exercise.type === EXERCISE.INTRODUCE && (
            <div className="pop" style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>
                ✨ NEW WORD
              </div>

              {isNonLatin ? (
                <>
                  {/* HERO: romanization (readable!) */}
                  <div style={{ fontSize: 48, fontWeight: 900, marginTop: 16, color: "var(--text)", letterSpacing: -0.5 }}>
                    {exercise.item.translit}
                  </div>
                  {/* Pronunciation hint */}
                  {exercise.item.pronunciation && (
                    <div style={{ fontSize: 15, color: "var(--text-dim)", marginTop: 4, fontStyle: "italic" }}>
                      say it like: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{exercise.item.pronunciation}</span>
                    </div>
                  )}
                  {/* Meaning */}
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", marginTop: 16, marginBottom: 8 }}>
                    = {exercise.item.translation}
                  </div>
                  {/* Native script as REFERENCE, smaller */}
                  <div style={{
                    fontSize: lang.rtl ? 32 : 28,
                    lineHeight: 1.4,
                    direction: lang.rtl ? "rtl" : "ltr",
                    fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                    color: "var(--text-dim)",
                    marginTop: 8,
                    marginBottom: 8,
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}>
                    {exercise.item.lemma}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1 }}>
                    {pack.code === "zh" ? "Chinese characters" : pack.code === "ja" ? "Japanese script" : pack.code === "ko" ? "Korean script" : "Native script"}
                  </div>
                </>
              ) : (
                <>
                  {/* Latin scripts: native script IS the hero */}
                  <div style={{ ...wordStyle, fontSize: 50, marginTop: 16 }}>
                    {exercise.item.lemma}
                  </div>
                  {exercise.item.pronunciation && (
                    <div style={{ fontSize: 15, color: "var(--text-dim)", marginTop: 4, fontStyle: "italic" }}>
                      say it like: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{exercise.item.pronunciation}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", marginTop: 12, marginBottom: 16 }}>
                    = {exercise.item.translation}
                  </div>
                </>
              )}

              {voiceAvailable && (
                <Button
                  variant="secondary"
                  style={{ marginTop: 12, marginBottom: 16, width: "auto", padding: "12px 24px" }}
                  onClick={() => speak(exercise.item.lemma, lang.ttsCode, { audioId: exercise.item.id })}
                >
                  🔊 Hear it again
                </Button>
              )}

              {exercise.item.examples?.[0] && (
                <Card style={{ background: "var(--surface-hi)", marginTop: 12, textAlign: "left" }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                    USED IN A SENTENCE
                  </div>
                  {isNonLatin ? (
                    <>
                      {/* English meaning is the readable line, native script as reference */}
                      <div style={{ fontSize: 19, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>
                        "{exercise.item.examples[0].translation}"
                      </div>
                      <div style={{
                        fontSize: 18,
                        direction: lang.rtl ? "rtl" : "ltr",
                        fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                        color: "var(--text-dim)",
                      }}>
                        {exercise.item.examples[0].native}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                        {exercise.item.examples[0].native}
                      </div>
                      <div style={{ fontSize: 14, color: "var(--text-dim)", fontStyle: "italic" }}>
                        "{exercise.item.examples[0].translation}"
                      </div>
                    </>
                  )}
                </Card>
              )}
            </div>
          )}

          {exercise.showWord && exercise.type !== EXERCISE.INTRODUCE && (
            <div style={{ textAlign: "center" }}>
              {isNonLatin ? (
                <>
                  {/* Hero: romanization */}
                  <div style={{ fontSize: 38, fontWeight: 800, marginTop: 12, color: "var(--text)" }}>
                    {exercise.item.translit}
                  </div>
                  {/* Native script smaller, as reference */}
                  <div style={{
                    fontSize: lang.rtl ? 24 : 22,
                    direction: lang.rtl ? "rtl" : "ltr",
                    fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                    color: "var(--text-dim)",
                    marginTop: 4,
                  }}>
                    {exercise.item.lemma}
                  </div>
                </>
              ) : (
                <div style={wordStyle}>{exercise.item.lemma}</div>
              )}
              {voiceAvailable && (
                <Button
                  variant="ghost"
                  style={{ marginTop: 8, fontSize: 18 }}
                  onClick={() => speak(exercise.item.lemma, lang.ttsCode, { audioId: exercise.item.id })}
                >
                  🔊 Listen
                </Button>
              )}
            </div>
          )}

          {exercise.type === EXERCISE.LISTEN_PICK && (
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <button
                onClick={() => speak(exercise.item.lemma, lang.ttsCode, { audioId: exercise.item.id })}
                style={{
                  background: "var(--blue)",
                  border: "none",
                  borderRadius: "50%",
                  width: 100,
                  height: 100,
                  fontSize: 48,
                  cursor: "pointer",
                }}
              >
                🔊
              </button>
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-dim)" }}>Tap to play again</div>
            </div>
          )}

          {/* Sentence with blank */}
          {exercise.type === EXERCISE.COMPLETE_SENTENCE && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  direction: lang.rtl ? "rtl" : "ltr",
                  fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                  padding: "16px",
                  background: "var(--surface)",
                  border: "2px dashed var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                {exercise.sentence}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>"{exercise.translation}"</div>
            </div>
          )}

          {/* PICK options */}
          {(exercise.type === EXERCISE.PICK_MEANING ||
            exercise.type === EXERCISE.PICK_WORD ||
            exercise.type === EXERCISE.LISTEN_PICK ||
            exercise.type === EXERCISE.COMPLETE_SENTENCE) && (
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {exercise.options.map((opt, i) => {
                const isAnswer = feedback && opt === exercise.answer;
                const isWrong = feedback && opt === picked && opt !== exercise.answer;
                const isPicked = picked === opt;
                // HINT: when active, eliminate the first half of the wrong
                // options (deterministic by option order, so it's stable
                // across re-renders). Narrows difficulty without revealing.
                const hiddenByHint = (() => {
                  if (feedback || !hintActive) return [];
                  const wrongs = exercise.options.filter((o) => o !== exercise.answer);
                  return wrongs.slice(0, Math.ceil(wrongs.length / 2));
                })();
                const isHinted = hiddenByHint.includes(opt);
                const showNative = exercise.type === EXERCISE.PICK_WORD || exercise.type === EXERCISE.COMPLETE_SENTENCE;

                // For non-Latin script PICK_WORD: each option is a native lemma.
                // Find its translit so we can show both lines.
                let optTranslit = null;
                if (showNative && isNonLatin) {
                  const matchingItem = pack.vocab.find((v) => v.lemma === opt);
                  optTranslit = matchingItem?.translit;
                }

                return (
                  <button
                    key={i}
                    onClick={() => !feedback && !isHinted && setPicked(opt)}
                    style={{
                      background: isAnswer ? "var(--primary-dark)" : isWrong ? "var(--danger)" : isPicked ? "var(--surface-hi)" : "var(--surface)",
                      border: `2px solid ${isAnswer ? "var(--primary)" : isWrong ? "var(--danger)" : isPicked ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 12,
                      padding: 16,
                      color: isAnswer || isWrong ? "#fff" : "var(--text)",
                      fontSize: showNative ? 18 : 16,
                      fontWeight: 700,
                      cursor: feedback || isHinted ? "default" : "pointer",
                      textAlign: "center",
                      lineHeight: 1.3,
                      opacity: isHinted ? 0.3 : 1,
                      textDecoration: isHinted ? "line-through" : "none",
                      transition: "opacity 0.3s",
                    }}
                  >
                    {showNative && isNonLatin && optTranslit ? (
                      <>
                        {/* Romanization HUGE so beginners can read */}
                        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                          {optTranslit}
                        </div>
                        {/* Native script smaller below */}
                        <div style={{
                          fontSize: 16,
                          direction: lang.rtl ? "rtl" : "ltr",
                          fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                          opacity: 0.75,
                          fontWeight: 500,
                        }}>
                          {opt}
                        </div>
                      </>
                    ) : showNative ? (
                      <div style={{
                        fontSize: 22,
                        direction: lang.rtl ? "rtl" : "ltr",
                        fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                      }}>
                        {opt}
                      </div>
                    ) : (
                      opt
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TYPE */}
          {exercise.type === EXERCISE.TYPE_TRANSLATION && (
            <input
              value={typed}
              onChange={(e) => !feedback && setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canCheck && !feedback && check()}
              placeholder="Type your answer…"
              autoFocus
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 12,
                background: "var(--surface-hi)",
                border: "2px solid var(--border)",
                color: "var(--text)",
                fontSize: 18,
                marginTop: 24,
                boxSizing: "border-box",
              }}
            />
          )}

          {/* TAP WORDS or BUILD SENTENCE — both use word-bank UI */}
          {(exercise.type === EXERCISE.TAP_WORDS || exercise.type === EXERCISE.BUILD_SENTENCE) && (
            <div style={{ marginTop: 24 }}>
              {exercise.type === EXERCISE.BUILD_SENTENCE ? (
                <Card style={{ background: "var(--surface-hi)", marginBottom: 16, padding: 18, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                    Translate this
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>
                    "{exercise.translation}"
                  </div>
                </Card>
              ) : (
                <div style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 12 }}>"{exercise.translation}"</div>
              )}
              <div
                style={{
                  minHeight: 70,
                  background: "var(--surface)",
                  border: "2px dashed var(--border)",
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  direction: lang.rtl ? "rtl" : "ltr",
                }}
              >
                {tapped.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => !feedback && setTapped((t) => t.filter((_, j) => j !== i))}
                    style={{
                      background: "var(--surface-hi)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 18,
                      cursor: "pointer",
                      fontFamily: lang.rtl ? '"Noto Naskh Arabic", serif' : "inherit",
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8, direction: lang.rtl ? "rtl" : "ltr" }}>
                {exercise.bank.map((w, i) => {
                  // Hide bank items already used (handle duplicates by index)
                  const usedIndices = [];
                  for (let j = 0; j < tapped.length; j++) {
                    const matchIdx = exercise.bank.findIndex((bw, bi) => bw === tapped[j] && !usedIndices.includes(bi));
                    if (matchIdx >= 0) usedIndices.push(matchIdx);
                  }
                  if (usedIndices.includes(i)) return null;
                  return (
                    <button
                      key={i}
                      onClick={() => !feedback && setTapped((t) => [...t, w])}
                      style={{
                        background: "var(--primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontSize: 18,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: lang.rtl ? '"Noto Naskh Arabic", serif' : "inherit",
                      }}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <>
              <Card
                style={{
                  marginTop: 24,
                  background: feedback === "correct" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  border: `2px solid ${feedback === "correct" ? "var(--primary)" : "var(--danger)"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: feedback === "correct" ? "var(--primary)" : "var(--danger)" }}>
                    {feedback === "correct" ? "✓ Correct!" : "✗ Not quite"}
                  </div>
                  {/* Why? button — only shown if not already expanded */}
                  {!showExplain && (
                    <button
                      onClick={() => setShowExplain(true)}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--text-dim)",
                        cursor: "pointer",
                      }}
                    >
                      💡 Why?
                    </button>
                  )}
                </div>
                {feedback === "wrong" && (
                  <div style={{ marginTop: 8 }}>
                    Correct answer: <strong>{exercise.answer}</strong>
                  </div>
                )}
                {exercise.item.examples?.[0] && !showExplain && (
                  <div style={{ marginTop: 10, color: "var(--text-dim)", fontSize: 14 }}>
                    <em>{exercise.item.examples[0].native}</em> — {exercise.item.examples[0].translation}
                  </div>
                )}
              </Card>

              {/* Expanded explanation card */}
              {showExplain && (() => {
                const userGiven = exercise.type === EXERCISE.TAP_WORDS || exercise.type === EXERCISE.BUILD_SENTENCE
                  ? tapped.join(" ")
                  : exercise.type === EXERCISE.TYPE_TRANSLATION
                  ? typed
                  : picked;
                const exp = explainAnswer(exercise, userGiven, pack.code);
                return (
                  <Card
                    className="slide-up"
                    style={{
                      marginTop: 12,
                      background: exp.special ? "var(--accent-soft)" : "var(--surface-hi)",
                      border: `2px solid ${exp.special ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{
                        fontSize: 11,
                        color: exp.special ? "var(--accent)" : "var(--text-dim)",
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}>
                        {exp.special ? "⚡ Grammar tip" : "💡 Explanation"}
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{exp.title}</div>
                    <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.55 }}>
                      {/* Render simple **bold** markdown */}
                      {exp.body.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={i} style={{ color: exp.special ? "var(--accent)" : "var(--primary)" }}>{part.slice(2, -2)}</strong>
                        ) : (
                          <React.Fragment key={i}>{part}</React.Fragment>
                        )
                      )}
                    </div>
                  </Card>
                );
              })()}
            </>
          )}
        </div>
      </Container>

      {/* Sticky footer button */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          background: "var(--bg-alt)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {exercise.type === EXERCISE.INTRODUCE_BATCH ? null : exercise.type === EXERCISE.INTRODUCE ? (
            <Button onClick={async () => { await check(); next(); }}>Got it →</Button>
          ) : !feedback ? (
            <>
              {/* "Need a hint?" — fades in only after 60s stuck, and only if
                  the exercise type supports the narrowing hint. Offered, not
                  forced: a careful or distracted user can simply ignore it. */}
              {hintOffered && !hintActive &&
                (exercise.type === EXERCISE.PICK_MEANING ||
                  exercise.type === EXERCISE.PICK_WORD ||
                  exercise.type === EXERCISE.LISTEN_PICK ||
                  exercise.type === EXERCISE.COMPLETE_SENTENCE) && (
                  <div className="slide-up" style={{ textAlign: "center", marginBottom: 12 }}>
                    <button
                      onClick={() => setHintActive(true)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--accent)",
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      💡 Stuck? Tap for a hint
                    </button>
                  </div>
                )}

              {hintActive && (
                <div style={{ textAlign: "center", marginBottom: 12, fontSize: 12, color: "var(--text-dim)" }}>
                  Two wrong answers removed — you've got this.
                </div>
              )}

              <Button style={{ opacity: canCheck ? 1 : 0.4 }} disabled={!canCheck} onClick={check}>
                Check
              </Button>

              {/* Audio-failure escape hatch — ONLY on listening exercises.
                  Not a general skip; it forgives broken audio, not difficulty. */}
              {exercise.type === EXERCISE.LISTEN_PICK && (
                <button
                  onClick={skipForAudio}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-dim)",
                    cursor: "pointer",
                  }}
                >
                  🔇 Can't hear it? Skip this one
                </button>
              )}
            </>
          ) : (
            <Button onClick={next}>{idx + 1 >= session.exercises.length ? "Finish" : "Continue"}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// RESULT — designed to feel rewarding + screenshot-worthy for sharing
// =============================================================================

function Result({ data, pack, appState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const framework = pack.frameworks?.[Math.floor(Math.random() * (pack.frameworks?.length || 1))];

  // Pick celebration based on performance
  const tier = data.accuracy === 100 ? "perfect" : data.accuracy >= 80 ? "great" : data.accuracy >= 60 ? "good" : "keep_going";
  const celebrations = {
    perfect: { emoji: "🏆", title: "PERFECT!", subtitle: "You absolutely smashed it" },
    great: { emoji: "🎉", title: "Great job!", subtitle: "You're getting really good at this" },
    good: { emoji: "💪", title: "Lesson complete", subtitle: "Every rep makes the next one easier" },
    keep_going: { emoji: "🌱", title: "Keep growing", subtitle: "Mistakes are how the brain learns" },
  };
  const celeb = celebrations[tier];

  async function shareResult() {
    const text = `Just learned ${data.correct} ${lang.name} words on Lingua! 🌍\n${data.accuracy}% accuracy · ${appState.streak}-day streak 🔥\nLearn languages the world ignores.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Lingua progress", text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied! Paste it anywhere to share.");
      } catch {}
    }
  }

  // Rebuild the lesson using ONLY the words the user got wrong.
  // This is the single most effective study technique — focused review of misses.
  function reviewMistakes() {
    if (missedItems.length === 0) return;
    const pool = pack.vocab || [];
    // Reuse the engine's lesson generator with missed items as the queue.
    // Empty progress = they get gentle exercise types (good for a retry).
    const exercises = generateLesson(missedItems, pool, {});
    setSession({ exercises, mode: "review" });
    setIdx(0);
    setPicked(null);
    setTyped("");
    setTapped([]);
    setFeedback(null);
    setShowExplain(false);
    setCorrectCount(0);
    setMissedItems([]);
    setStreakInLesson(0);
    setDone(false);
    setResultData(null);
    startedAt.current = Date.now();
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${lang.color}22, var(--bg))` }}>
      <Container style={{ textAlign: "center", paddingTop: 40 }}>
        <div className="slide-up" style={{ fontSize: 90, marginBottom: 8 }}>
          {celeb.emoji}
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>
          {celeb.title}
        </h1>
        <p style={{ color: "var(--text-dim)", marginBottom: 24, fontSize: 16 }}>{celeb.subtitle}</p>

        {/* The cultural guide reacts — culturally-specific warmth, not generic */}
        {(() => {
          const character = getCharacter(pack.code);
          if (!character) return null;
          const msg = character.celebrations[tier];
          return (
            <Card style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textAlign: "left",
              background: "var(--surface)",
              border: `1px solid var(--border)`,
              borderLeft: `4px solid ${character.accent}`,
              marginBottom: 24,
            }}>
              <div style={{
                fontSize: 30,
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "var(--surface-hi)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {character.emoji}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: character.accent }}>{character.name}</div>
                <div style={{ fontSize: 14, color: "var(--text)", marginTop: 2, lineHeight: 1.4 }}>{msg}</div>
              </div>
            </Card>
          );
        })()}
        {/* Big highlight stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          <Card style={{ marginBottom: 0, background: "var(--surface)" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>XP</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--accent)" }}>+{data.xp}</div>
          </Card>
          <Card style={{ marginBottom: 0, background: "var(--surface)" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>Accuracy</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--primary)" }}>{data.accuracy}%</div>
          </Card>
          <Card style={{ marginBottom: 0, background: "var(--surface)" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>Streak</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--danger)" }}>{appState.streak}🔥</div>
          </Card>
        </div>

        {framework && (
          <Card style={{ textAlign: "left", background: "var(--surface-hi)", border: "2px dashed var(--accent)" }}>
            <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>
              ⚡ FRAMEWORK INSIGHT
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{framework.title}</div>
            <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5 }}>{framework.body}</div>
          </Card>
        )}

        {missedItems.length > 0 && (
          <Card style={{ background: "var(--surface-hi)", border: "2px solid var(--accent)", marginTop: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
              You missed {missedItems.length} word{missedItems.length === 1 ? "" : "s"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12 }}>
              Reviewing mistakes right away is the fastest way to lock them in.
            </div>
            <Button onClick={reviewMistakes} style={{ background: "var(--accent)", color: "#000" }}>
              🔁 Review my mistakes
            </Button>
          </Card>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
          <Button variant="secondary" onClick={shareResult}>📤 Share</Button>
          <Button onClick={() => onNavigate("home")}>Continue</Button>
        </div>
      </Container>
    </div>
  );
}

// =============================================================================
// IntroBatchCards — flashcard carousel shown at the start of a lesson when
// there are new words. User flips each card and swipes through. After the last
// card, "Start practice" appears. This batch-introduction is much better
// pedagogy than testing each word right after introducing it.
// =============================================================================

function IntroBatchCards({ items, lang, isNonLatin, voiceAvailable, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seenAll, setSeenAll] = useState(false);

  const card = items[idx];
  const isLast = idx === items.length - 1;

  // Auto-play audio when a new card appears
  useEffect(() => {
    if (card && voiceAvailable) {
      // Small delay so it doesn't feel jarring
      const t = setTimeout(() => speak(card.lemma, lang.ttsCode, { audioId: card.id }), 250);
      return () => clearTimeout(t);
    }
  }, [card?.id, voiceAvailable, lang.ttsCode]);

  function next() {
    if (isLast) {
      setSeenAll(true);
      return;
    }
    setIdx(idx + 1);
    setFlipped(false);
  }

  function prev() {
    if (idx === 0) return;
    setIdx(idx - 1);
    setFlipped(false);
  }

  if (!card) return null;

  return (
    <div className="slide-up" style={{ marginTop: 12 }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>
          ✨ NEW WORDS — TAP TO FLIP
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          Card {idx + 1} of {items.length}
        </div>
      </div>

      {/* The card */}
      <div
        onClick={() => setFlipped(!flipped)}
        key={`${idx}-${flipped}`}
        className="pop"
        style={{
          background: flipped ? "var(--primary-soft)" : "var(--surface)",
          border: `2px solid ${flipped ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "var(--radius-lg)",
          minHeight: 280,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 14,
          boxShadow: "var(--shadow-card)",
        }}
      >
        {!flipped ? (
          // FRONT: word
          <>
            {isNonLatin ? (
              <>
                <div style={{ fontSize: 44, fontWeight: 900, marginBottom: 8 }}>
                  {card.translit}
                </div>
                {card.pronunciation && (
                  <div style={{ fontSize: 14, color: "var(--text-dim)", fontStyle: "italic", marginBottom: 12 }}>
                    say it like: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{card.pronunciation}</span>
                  </div>
                )}
                <div style={{
                  fontSize: lang.rtl ? 30 : 26,
                  lineHeight: 1.4,
                  direction: lang.rtl ? "rtl" : "ltr",
                  fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                  color: "var(--text-dim)",
                  paddingTop: 4,
                  paddingBottom: 4,
                }}>
                  {card.lemma}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 44, fontWeight: 900 }}>{card.lemma}</div>
            )}
            <div style={{ marginTop: 20, fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1 }}>
              Tap to reveal meaning
            </div>
          </>
        ) : (
          // BACK: meaning + example
          <>
            <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Meaning
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)", marginBottom: 16 }}>
              {card.translation}
            </div>
            {card.examples?.[0] && (
              <div style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic", lineHeight: 1.5 }}>
                "{card.examples[0].translation}"
              </div>
            )}
          </>
        )}
      </div>

      {/* Listen button */}
      {voiceAvailable && (
        <Button
          variant="secondary"
          style={{ marginBottom: 12 }}
          onClick={(e) => { e.stopPropagation(); speak(card.lemma, lang.ttsCode, { audioId: card.id }); }}
        >
          🔊 Hear it again
        </Button>
      )}

      {/* Navigation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
        <Button
          variant="secondary"
          onClick={prev}
          style={{ opacity: idx === 0 ? 0.4 : 1 }}
          disabled={idx === 0}
        >
          ← Previous
        </Button>
        <Button onClick={next}>
          {isLast ? "Done" : "Next →"}
        </Button>
      </div>

      {/* Once seen all, show Start Practice */}
      {seenAll && (
        <Button
          style={{ marginTop: 16, background: "var(--accent)", color: "#000", boxShadow: "0 4px 0 #b56305" }}
          onClick={onComplete}
        >
          🚀 Start practice
        </Button>
      )}
    </div>
  );
}
