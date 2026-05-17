// =============================================================================
// ALPHABET LESSONS — proper foundational course for non-Latin scripts.
// User picks a group → sees each letter with audio → takes a 4-question quiz
// → group is marked complete and the next unlocks.
// =============================================================================

import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, ProgressBar } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";

const NON_LATIN_LANGUAGES = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn"]);

// localStorage key for tracking which groups are completed (per language)
const STORAGE_KEY = "alphabet_progress";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveProgress(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

export function AlphabetLessons({ pack, appState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = NON_LATIN_LANGUAGES.has(pack.code);
  const voiceAvailable = hasVoiceFor(lang.ttsCode);

  const [progress, setProgress] = useState(loadProgress());
  const [activeGroup, setActiveGroup] = useState(null);
  const [phase, setPhase] = useState("learn"); // "learn" | "quiz" | "done"
  const [letterIdx, setLetterIdx] = useState(0);

  const groups = pack.alphabetGroups || [];
  const langProgress = progress[pack.code] || {};

  // Letters in the current group
  const groupLetters = useMemo(() => {
    if (!activeGroup) return [];
    return (pack.alphabet || []).filter((a) => a.group === activeGroup.id);
  }, [activeGroup, pack.alphabet]);

  // -------------------------------------------------------------------------
  // GROUP PICKER — show all groups with locks/checkmarks
  // -------------------------------------------------------------------------
  if (!activeGroup) {
    return (
      <Container>
        <div style={{ marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Back
          </Button>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>
          🔤 Letters & Sounds
        </h1>
        <p style={{ color: "var(--text-dim)", marginBottom: 24, fontSize: 14 }}>
          Learn the script first. Each lesson teaches a small group, then quizzes you. Complete a lesson to unlock the next.
        </p>

        {groups.length === 0 ? (
          <Card style={{ textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>📚</div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>No alphabet lessons for {lang.name} yet</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
              {lang.name} uses the Latin alphabet, so you're already set! Head back to start learning vocabulary.
            </div>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {groups.map((g, i) => {
              const isCompleted = !!langProgress[g.id];
              const isUnlocked = i === 0 || langProgress[groups[i - 1].id];
              const count = (pack.alphabet || []).filter((a) => a.group === g.id).length;
              return (
                <button
                  key={g.id}
                  disabled={!isUnlocked}
                  onClick={() => { setActiveGroup(g); setLetterIdx(0); setPhase("learn"); }}
                  style={{
                    background: isCompleted ? "var(--primary-soft)" : "var(--surface)",
                    border: `2px solid ${isCompleted ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "var(--radius-lg)",
                    padding: 16,
                    cursor: isUnlocked ? "pointer" : "not-allowed",
                    opacity: isUnlocked ? 1 : 0.55,
                    color: "var(--text)",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: isCompleted ? "var(--primary)" : "var(--surface-hi)",
                    color: isCompleted ? "#fff" : "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    flexShrink: 0,
                  }}>
                    {!isUnlocked ? "🔒" : isCompleted ? "✓" : g.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>
                      Lesson {i + 1}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                      {!isUnlocked ? "Complete the previous lesson to unlock"
                        : isCompleted ? `${count} letter${count === 1 ? "" : "s"} · Complete`
                        : `${count} letter${count === 1 ? "" : "s"} · ${g.description}`}
                    </div>
                  </div>
                  {isUnlocked && (
                    <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.7 }}>→</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Container>
    );
  }

  // -------------------------------------------------------------------------
  // LEARN PHASE — flip through letters one by one
  // -------------------------------------------------------------------------
  if (phase === "learn") {
    const letter = groupLetters[letterIdx];
    if (!letter) {
      // Empty group — skip to picker
      setActiveGroup(null);
      return null;
    }

    const isLast = letterIdx === groupLetters.length - 1;

    function nextLetter() {
      if (isLast) { setPhase("quiz"); return; }
      setLetterIdx(letterIdx + 1);
    }

    return (
      <Container style={{ paddingBottom: 140 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => setActiveGroup(null)} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Lessons
          </Button>
          <div style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 700 }}>
            {letterIdx + 1} / {groupLetters.length}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <ProgressBar value={letterIdx + 1} max={groupLetters.length} />
        </div>

        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800, letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
          ✨ {activeGroup.title.toUpperCase()}
        </div>

        {/* The letter card — letter sits in a fixed-height container so
            decorative curves of Arabic/Nastaliq scripts don't crowd siblings */}
        <Card className="pop" style={{ textAlign: "center", padding: "28px 24px 32px", minHeight: 320 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 160,
            marginBottom: 24,
          }}>
            <div style={{
              fontSize: 120,
              fontWeight: 900,
              lineHeight: 1.2,
              direction: lang.rtl ? "rtl" : "ltr",
              fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
            }}>
              {letter.char}
            </div>
          </div>
          <div style={{
            height: 1,
            background: "var(--border)",
            margin: "0 auto 16px",
            width: 60,
          }} />
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--primary)", marginBottom: 8 }}>
            {letter.name}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-dim)", fontStyle: "italic" }}>
            sounds like: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{letter.sound}</span>
          </div>
        </Card>

        {voiceAvailable && (
          <Button
            variant="secondary"
            style={{ marginTop: 14, marginBottom: 14 }}
            onClick={() => speak(letter.char, lang.ttsCode)}
          >
            🔊 Hear it
          </Button>
        )}

        <Button onClick={nextLetter} style={{ marginTop: 4 }}>
          {isLast ? "Take the quiz →" : "Next letter →"}
        </Button>
      </Container>
    );
  }

  // -------------------------------------------------------------------------
  // QUIZ PHASE — 4 questions: pick the right sound for each letter
  // -------------------------------------------------------------------------
  if (phase === "quiz") {
    return (
      <AlphabetQuiz
        letters={groupLetters}
        lang={lang}
        voiceAvailable={voiceAvailable}
        onComplete={(passed) => {
          if (passed) {
            const newProg = { ...progress };
            newProg[pack.code] = { ...(newProg[pack.code] || {}), [activeGroup.id]: true };
            setProgress(newProg);
            saveProgress(newProg);
            setPhase("done");
          } else {
            // Failed — back to learning
            setLetterIdx(0);
            setPhase("learn");
          }
        }}
        onBack={() => setPhase("learn")}
      />
    );
  }

  // -------------------------------------------------------------------------
  // DONE
  // -------------------------------------------------------------------------
  if (phase === "done") {
    const groupIdx = groups.findIndex((g) => g.id === activeGroup.id);
    const nextGroup = groups[groupIdx + 1];
    return (
      <Container style={{ textAlign: "center", paddingTop: 40 }}>
        <div className="pop" style={{ fontSize: 90, marginBottom: 12 }}>🎉</div>
        <h1 style={{ fontSize: 32, fontWeight: 900 }}>Lesson complete!</h1>
        <p style={{ color: "var(--text-dim)", marginBottom: 30 }}>
          You learned <strong>{groupLetters.length} letter{groupLetters.length === 1 ? "" : "s"}</strong>. Keep going!
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Button variant="secondary" onClick={() => { setActiveGroup(null); setPhase("learn"); }}>
            All lessons
          </Button>
          {nextGroup ? (
            <Button onClick={() => { setActiveGroup(nextGroup); setLetterIdx(0); setPhase("learn"); }}>
              Next lesson →
            </Button>
          ) : (
            <Button onClick={() => onNavigate("home")}>
              Start vocab →
            </Button>
          )}
        </div>
      </Container>
    );
  }

  return null;
}

// =============================================================================
// AlphabetQuiz — 4-question quiz at end of each letter group
// =============================================================================
function AlphabetQuiz({ letters, lang, voiceAvailable, onComplete, onBack }) {
  // Build 4 questions: random sample of letters, with 4 sound options each
  const questions = useMemo(() => {
    const sample = [...letters].sort(() => Math.random() - 0.5).slice(0, Math.min(4, letters.length));
    return sample.map((letter) => {
      const distractors = letters.filter((l) => l.char !== letter.char).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [letter, ...distractors].sort(() => Math.random() - 0.5);
      return { letter, options, answer: letter };
    });
  }, [letters]);

  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  function check() {
    if (!picked) return;
    const isCorrect = picked.char === q.answer.char;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (isLast) {
      // Pass if at least 75% correct
      const passed = correctCount / questions.length >= 0.75;
      onComplete(passed);
      return;
    }
    setQIdx(qIdx + 1);
    setPicked(null);
    setFeedback(null);
  }

  return (
    <Container style={{ paddingBottom: 140 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="ghost" onClick={onBack} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
          ← Review
        </Button>
        <div style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 700 }}>
          Question {qIdx + 1} / {questions.length}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <ProgressBar value={qIdx + (feedback ? 1 : 0)} max={questions.length} />
      </div>

      <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800, letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
        ⚡ QUIZ
      </div>

      <Card style={{ textAlign: "center", padding: "24px 20px" }}>
        <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 16 }}>What sound does this letter make?</div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 130,
        }}>
          <div style={{
            fontSize: 100,
            fontWeight: 900,
            lineHeight: 1.2,
            direction: lang.rtl ? "rtl" : "ltr",
            fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
          }}>
            {q.letter.char}
          </div>
        </div>
        {voiceAvailable && (
          <Button
            variant="ghost"
            style={{ marginTop: 8, fontSize: 14 }}
            onClick={() => speak(q.letter.char, lang.ttsCode)}
          >
            🔊 Hear it
          </Button>
        )}
      </Card>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          const isAnswer = feedback && opt.char === q.answer.char;
          const isWrong = feedback && opt.char === picked?.char && opt.char !== q.answer.char;
          const isPicked = picked?.char === opt.char;
          return (
            <button
              key={i}
              onClick={() => !feedback && setPicked(opt)}
              style={{
                background: isAnswer ? "var(--primary-dark)" : isWrong ? "var(--danger)" : isPicked ? "var(--surface-hi)" : "var(--surface)",
                border: `2px solid ${isAnswer ? "var(--primary)" : isWrong ? "var(--danger)" : isPicked ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 12,
                padding: 14,
                color: isAnswer || isWrong ? "#fff" : "var(--text)",
                fontSize: 16,
                fontWeight: 700,
                cursor: feedback ? "default" : "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 800 }}>{opt.name}</div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>sounds like: {opt.sound}</div>
            </button>
          );
        })}
      </div>

      {feedback && (
        <Card style={{
          marginTop: 16,
          background: feedback === "correct" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
          border: `2px solid ${feedback === "correct" ? "var(--primary)" : "var(--danger)"}`,
        }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: feedback === "correct" ? "var(--primary)" : "var(--danger)" }}>
            {feedback === "correct" ? "✓ Correct!" : `✗ The answer was ${q.answer.name}`}
          </div>
        </Card>
      )}

      {/* Inline button so it isn't covered by the BottomNav */}
      <div style={{ marginTop: 20, marginBottom: 140 }}>
        {!feedback ? (
          <Button style={{ opacity: picked ? 1 : 0.4 }} disabled={!picked} onClick={check}>
            Check
          </Button>
        ) : (
          <Button onClick={next}>{isLast ? "Finish" : "Continue"}</Button>
        )}
      </div>
    </Container>
  );
}
