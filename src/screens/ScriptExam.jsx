// =============================================================================
// ScriptExam.jsx (v99) — "prove you can read this, and skip Chapter 0."
//
// The exam that closes Chapter 0, and the reason Chapter 0 doesn't waste
// anyone's time. A heritage learner who reads Urdu fluently and speaks almost
// none of it should sit this, pass in two minutes, and never open a letter
// lesson. A learner who has only ever heard the language should fail it,
// cheerfully, and be pointed at the primer.
//
// WHAT IT ASKS
//
// Not "name this letter". Naming letters is a party trick that a reader does
// not perform and a non-reader can be drilled into. The questions are the two a
// reader answers without thinking —
//
//     WHAT DOES THIS SAY?   (a real word from the pack → its romanisation)
//     WHAT DOES IT MEAN?    (a real word from the pack → its English)
//
// — with the letter-and-sound knowledge underneath them, in both directions,
// because recognising ക when shown it is a much weaker skill than producing it
// when asked for "ka".
//
// The distractors are the point. A multiple-choice reading question with random
// wrong answers can be passed without reading: rule out the three that look
// nothing like it. So wrong answers are drawn from the SAME script, the same
// length band where possible, and for letters from that letter's own confusable
// set when the pack declares one — ത vs ട, ن vs ت. Those are the pairs a
// non-reader cannot separate, which is exactly what the exam is asking about.
// =============================================================================

import React, { useMemo, useRef, useState } from "react";
import { Button, Card, Container, ProgressBar } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { SCRIPT_PASS } from "../data/scriptCourse.js";
import { buildExam } from "../data/scriptExamPaper.js";
import { speak } from "../audio/tts.js";

export function ScriptExam({ pack, appState, setAppState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const questions = useMemo(() => buildExam(pack), [pack]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const answeredRef = useRef(-1); // which question index has already been scored — see choose()
  const [right, setRight] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  // A pack thin enough that no honest exam can be built should say so rather
  // than serve four questions and call it proof.
  if (!q) {
    return (
      <Container style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 56 }}>🔤</div>
        <h2 style={{ fontWeight: 900 }}>Not enough script data yet</h2>
        <p style={{ color: "var(--text-dim)", lineHeight: 1.5 }}>
          This language doesn't have enough letters and words in the pack to set a fair reading test.
          Work through Chapter 0 instead — nothing is locked.
        </p>
        <Button onClick={() => onNavigate("alphabet")}>Open the script course →</Button>
      </Container>
    );
  }

  function choose(opt) {
    // v107: guarded by a ref, not the `picked` state. State only updates on
    // the next render, so two presses inside one task both passed `if
    // (picked)` and both scored — any question with the right answer among
    // the presses counted as right. A browser test that pressed every option
    // "passed" the reading test 12 out of 12 that way. One answer per question.
    if (picked || answeredRef.current === idx) return;
    answeredRef.current = idx;
    setPicked(opt);
    const correct = opt === q.answer;
    if (correct) setRight((r) => r + 1);
    if (q.speakOnReveal) setTimeout(() => speak(q.speakOnReveal, lang.ttsCode, { code: pack.code, translit: q.speakTranslit }), 250);
  }

  function next() {
    if (idx + 1 >= questions.length) {
      const score = right / questions.length;
      const passedNow = score >= SCRIPT_PASS;
      // v107: a fail is recorded too (attempts, last score) — see
      // hasAttemptedScript. Home uses it to move the learner on to the letter
      // lessons instead of offering this same test again as the next step.
      setAppState((s) => {
        const prev = s.scriptCourse?.[pack.code] || {};
        return {
          ...s,
          scriptCourse: {
            ...(s.scriptCourse || {}),
            [pack.code]: {
              ...prev,
              passed: passedNow || !!prev.passed,
              attempts: (prev.attempts || 0) + 1,
              at: Date.now(),
              ...(passedNow ? { score } : { lastScore: score }),
            },
          },
          totalXp: (s.totalXp || 0) + (passedNow && !prev.passed ? 40 : 0),
        };
      });
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  }

  if (done) {
    const score = right / questions.length;
    const passed = score >= SCRIPT_PASS;
    return (
      <Container style={{ paddingTop: 40, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 8 }} aria-hidden="true">{passed ? "🗝️" : "📖"}</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>
          {passed ? "You can read it." : "Not yet — and that's the normal answer"}
        </h2>
        <div role="status" style={{ color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 }}>
          {right} of {questions.length} right.{" "}
          {passed
            ? `Chapter 0 is behind you. ${lang.name} lessons start at introductions.`
            : `You need ${Math.ceil(SCRIPT_PASS * questions.length)} to skip Chapter 0. Most people who grew up hearing a language and never read it land about here — that's what Chapter 0 is for.`}
        </div>
        {passed ? (
          <Button onClick={() => onNavigate("home")}>Start Chapter 1 →</Button>
        ) : (
          <>
            <Button onClick={() => onNavigate("alphabet")}>Learn the script →</Button>
            <button
              className="quiet-link"
              onClick={() => onNavigate("home")}
              style={{ marginTop: 12 }}
            >
              Back to the route
            </button>
          </>
        )}
      </Container>
    );
  }

  const correct = picked === q.answer;

  return (
    <Container style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ marginBottom: 8 }}>
        <ProgressBar value={(idx / questions.length) * 100} />
      </div>
      <div style={{
        textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--accent-text)",
        letterSpacing: 1, textTransform: "uppercase", marginBottom: 16,
      }}>
        🔤 Reading test · {idx + 1} of {questions.length}
      </div>

      <Card style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: q.sub ? 2 : 16 }}>{q.prompt}</div>
        {q.sub && <div style={{ fontSize: 12.5, color: "var(--text-mute)", marginBottom: 16 }}>{q.sub}</div>}

        {q.show && (
          <div
            dir={lang.rtl ? "rtl" : "ltr"}
            style={{
              fontSize: 46, fontWeight: 700, lineHeight: 1.5, margin: "8px 0 20px",
              fontFamily: lang.rtl ? '"Noto Naskh Arabic", serif' : "inherit",
            }}
          >
            {q.show}
          </div>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          {q.options.map((opt) => {
            const isAnswer = opt === q.answer;
            const chosen = picked === opt;
            const state = !picked ? "idle" : isAnswer ? "right" : chosen ? "wrong" : "idle";
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={Boolean(picked)}
                dir={q.bigOptions && lang.rtl ? "rtl" : "ltr"}
                style={{
                  padding: q.bigOptions ? "14px 16px" : "13px 16px",
                  fontSize: q.bigOptions ? 30 : 16,
                  fontWeight: q.bigOptions ? 700 : 600,
                  borderRadius: 12,
                  cursor: picked ? "default" : "pointer",
                  textAlign: "center",
                  color: state === "idle" ? "var(--text)" : "#fff",
                  background:
                    state === "right" ? "var(--success, #10b981)"
                    : state === "wrong" ? "var(--danger)"
                    : "var(--surface)",
                  border: `2px solid ${state === "idle" ? "var(--border)" : "transparent"}`,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div role="status" aria-live="polite" style={{ minHeight: 24, marginTop: 14, fontSize: 13.5 }}>
          {picked && (correct
            ? "Right."
            : `Not that one — it's "${q.answer}".`)}
        </div>

        {picked && <Button style={{ marginTop: 4 }} onClick={next}>
          {idx + 1 >= questions.length ? "See how you did →" : "Next →"}
        </Button>}
      </Card>

      <button
        className="quiet-link"
        onClick={() => onNavigate("home")}
        style={{ marginTop: 16, display: "block", marginInline: "auto" }}
      >
        Leave the test
      </button>
    </Container>
  );
}

export default ScriptExam;
