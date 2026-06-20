// =============================================================================
// TEST OUT — optional placement quiz (v26). For learners who already know a
// lot of the language: prove it and skip ahead instead of grinding beginner
// lessons. Self-contained — does NOT modify the normal lesson flow. On a
// passing score it seeds progress so known words don't reappear as "new".
// =============================================================================

import React, { useState, useMemo } from "react";
import { Button, Card, Container } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";

const NON_LATIN = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn", "pa"]);
const PASS_THRESHOLD = 0.8; // 80%+ to test out
const QUIZ_SIZE = 12;

export function TestOut({ engine, pack, appState, setAppState, onNavigate, refreshStats }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = NON_LATIN.has(pack.code);

  const [phase, setPhase] = useState("intro"); // intro | quiz | done
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [resultMsg, setResultMsg] = useState(null);
  // v36: track each answer's correctness deterministically so the final tally
  // never depends on async state having flushed. Fixes "test does nothing".
  const answersRef = React.useRef({});

  // Build a fixed quiz: sample words across the pack, English→native multiple
  // choice. Stable for the session via useMemo.
  const quiz = useMemo(() => {
    const vocab = (pack.vocab || []).filter((v) => v.lemma && v.translation);
    if (vocab.length < 8) return [];
    const shuffled = [...vocab].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, Math.min(QUIZ_SIZE, vocab.length));
    return picks.map((item) => {
      // 3 distractors with different meanings
      const distractors = shuffled
        .filter((v) => v.id !== item.id && v.translation !== item.translation)
        .slice(0, 3);
      const options = [item, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map((v) => ({ lemma: v.lemma, translit: v.translit, id: v.id }));
      return { item, prompt: item.translation, answerLemma: item.lemma, options };
    });
  }, [pack.vocab]);

  if (quiz.length === 0) {
    return (
      <Container>
        <div style={{ marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Back
          </Button>
        </div>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 800 }}>Not enough content to test out of {lang.name} yet</div>
        </Card>
      </Container>
    );
  }

  // ---------- INTRO ----------
  if (phase === "intro") {
    return (
      <Container style={{ paddingBottom: 100 }}>
        <div style={{ marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Back
          </Button>
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎯</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>Test out</h1>
          <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 24 }}>
            Already know some {lang.name}? Take a quick {quiz.length}-question quiz.
            Score {Math.round(PASS_THRESHOLD * 100)}% or higher and the words you
            already know won't be treated as new — you'll skip ahead instead of
            repeating basics.
          </p>
          <Card style={{ textAlign: "left", fontSize: 13, color: "var(--text-dim)", marginBottom: 24, lineHeight: 1.6 }}>
            This only ever helps you — it never removes progress. If you don't
            pass, nothing changes and you just keep learning normally.
          </Card>
          <Button onClick={() => setPhase("quiz")}>Start the quiz →</Button>
        </div>
      </Container>
    );
  }

  // ---------- DONE ----------
  if (phase === "done") {
    // v36: use the deterministic ref so the displayed score always matches what
    // was actually answered (the `correct` state could be stale on the last Q).
    const finalCorrect = Object.values(answersRef.current).filter(Boolean).length;
    const pct = Math.round((finalCorrect / quiz.length) * 100);
    const passed = finalCorrect / quiz.length >= PASS_THRESHOLD;
    return (
      <Container style={{ paddingBottom: 100 }}>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? "🎉" : "💪"}</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            {finalCorrect} / {quiz.length} ({pct}%)
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 24 }}>
            {passed
              ? resultMsg ||
                "You clearly already know these. They've been marked as known, so you'll skip ahead to fresh material."
              : "Not quite the threshold — but no problem at all. Nothing changed; just keep learning normally and you'll get there."}
          </p>
          <Button onClick={async () => { if (refreshStats) { try { await refreshStats(); } catch {} } onNavigate("home"); }}>Back to home</Button>
        </div>
      </Container>
    );
  }

  // ---------- QUIZ ----------
  const q = quiz[idx];

  async function submit() {
    if (picked == null || answered) return;
    const isRight = picked === q.answerLemma;
    answersRef.current[idx] = isRight; // deterministic record
    setAnswered(true);
    if (isRight) setCorrect((c) => c + 1);
  }

  async function nextQ() {
    if (idx + 1 >= quiz.length) {
      // v36: tally from the deterministic ref, NOT the async `correct` state,
      // which may not have flushed for the final question.
      const finalCorrect = Object.values(answersRef.current).filter(Boolean).length;
      const passed = finalCorrect / quiz.length >= PASS_THRESHOLD;
      if (passed) {
        // Seed progress for the quizzed words so they're treated as known.
        // Robust + fail-safe: never throw out of here.
        try {
          const knownIds = quiz.map((qq) => qq.item.id);
          if (engine?.seedKnown) {
            await engine.seedKnown(knownIds);
          }
          setAppState((s) => {
            const to = { ...(s.testedOut || {}) };
            to[pack.code] = Array.from(new Set([...(to[pack.code] || []), ...knownIds]));
            return { ...s, testedOut: to };
          });
          if (refreshStats) await refreshStats();
          setResultMsg(
            `${knownIds.length} words marked as known. They won't be reintroduced as new — you've skipped ahead.`
          );
        } catch (e) {
          console.warn("test-out seeding failed (non-fatal):", e);
          setResultMsg("You passed! (Couldn't sync skip-ahead, but no harm done — keep learning.)");
        }
      }
      setPhase("done");
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setAnswered(false);
  }

  return (
    <Container style={{ paddingBottom: 140 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, marginTop: 8 }}>
        <button onClick={() => onNavigate("home")} style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 22, cursor: "pointer" }}>✕</button>
        <div style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 700 }}>
          {idx + 1} / {quiz.length}
        </div>
      </div>

      <Card style={{ padding: 24, marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          What is the word for
        </div>
        <div style={{ fontSize: 24, fontWeight: 900 }}>{q.prompt}</div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          const isAnswer = answered && opt.lemma === q.answerLemma;
          const isWrongPick = answered && opt.lemma === picked && opt.lemma !== q.answerLemma;
          const isPicked = picked === opt.lemma;
          return (
            <button
              key={i}
              onClick={() => !answered && setPicked(opt.lemma)}
              style={{
                background: isAnswer ? "var(--primary-dark)" : isWrongPick ? "var(--danger)" : isPicked ? "var(--surface-hi)" : "var(--surface)",
                border: `2px solid ${isAnswer ? "var(--primary)" : isWrongPick ? "var(--danger)" : isPicked ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 12,
                padding: 16,
                color: isAnswer || isWrongPick ? "#fff" : "var(--text)",
                cursor: answered ? "default" : "pointer",
                textAlign: "center",
              }}
            >
              {isNonLatin && opt.translit ? (
                <>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{opt.translit}</div>
                  <div style={{
                    fontSize: 16, opacity: 0.7, marginTop: 2,
                    direction: lang.rtl ? "rtl" : "ltr",
                    fontFamily: lang.rtl ? '"Noto Nastaliq Urdu","Noto Naskh Arabic",serif' : "inherit",
                  }}>
                    {opt.lemma}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 18, fontWeight: 700 }}>{opt.lemma}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* v31: inline Check/Next button — always visible at the bottom of the
          content. Belt-and-braces backup so the user can never get stuck even
          if the fixed footer has a layout quirk on their browser. */}
      <div style={{ marginTop: 20 }}>
        {!answered ? (
          <Button
            style={{ opacity: picked ? 1 : 0.4 }}
            disabled={!picked}
            onClick={submit}
          >
            Check
          </Button>
        ) : (
          <Button onClick={nextQ}>{idx + 1 >= quiz.length ? "See result" : "Next"}</Button>
        )}
      </div>

      {/* The fixed footer also stays for users who DO scroll/keep it pinned. */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: "var(--bg-alt)", borderTop: "1px solid var(--border)", zIndex: 10 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {!answered ? (
            <Button style={{ opacity: picked ? 1 : 0.4 }} disabled={!picked} onClick={submit}>
              Check
            </Button>
          ) : (
            <Button onClick={nextQ}>{idx + 1 >= quiz.length ? "See result" : "Next"}</Button>
          )}
        </div>
      </div>
    </Container>
  );
}
