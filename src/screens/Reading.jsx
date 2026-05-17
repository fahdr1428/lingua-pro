// =============================================================================
// READING — comprehension practice ("Read & Understand").
// Shows a short connected passage. Audio plays if available; if not, the
// subtitle toggles mean the learner can still read and learn. Ends with a
// comprehension question. This is the "comprehensible input" pillar.
// =============================================================================

import React, { useState, useMemo } from "react";
import { Button, Card, Container } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";
import { getPassage, PASSAGES } from "../data/passages.js";

const NON_LATIN = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn"]);

export function Reading({ pack, appState, setAppState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = NON_LATIN.has(pack.code);
  const voiceAvailable = hasVoiceFor(lang.ttsCode);
  const hasPassages = !!(PASSAGES[pack.code] && PASSAGES[pack.code].length);

  const [seenIds, setSeenIds] = useState([]);
  const [passage, setPassage] = useState(() => getPassage(pack.code, []));
  const [showTranslation, setShowTranslation] = useState(false);
  const [showRomanization, setShowRomanization] = useState(isNonLatin);
  const [phase, setPhase] = useState("read"); // "read" | "question" | "done"
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // No passages for this language — friendly fallback
  if (!hasPassages || !passage) {
    return (
      <Container>
        <div style={{ marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Back
          </Button>
        </div>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>📖</div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>No reading passages for {lang.name} yet</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
            We're adding short reading practice for every language. Keep learning vocabulary in the meantime!
          </div>
        </Card>
      </Container>
    );
  }

  function playAll() {
    if (!voiceAvailable) return;
    // Speak each line with a small gap
    passage.lines.forEach((line, i) => {
      setTimeout(() => speak(line.native, lang.ttsCode), i * 1800);
    });
  }

  function nextPassage() {
    const newSeen = [...seenIds, passage.id];
    setSeenIds(newSeen);
    const next = getPassage(pack.code, newSeen);
    setPassage(next);
    setShowTranslation(false);
    setShowRomanization(isNonLatin);
    setPhase("read");
    setPicked(null);
    setFeedback(null);
  }

  function checkAnswer() {
    if (!picked) return;
    const correct = picked === passage.answer;
    setFeedback(correct ? "correct" : "wrong");
    if (correct && setAppState) {
      // Record passage completion for the "First Read" badge + daily mission
      try {
        setAppState((s) => ({
          ...s,
          passagesRead: (s.passagesRead || 0) + 1,
          passageLog: [...(s.passageLog || []).slice(-99), Date.now()],
        }));
      } catch {}
    }
  }

  // ---------------------------------------------------------------------------
  // READ PHASE
  // ---------------------------------------------------------------------------
  if (phase === "read") {
    return (
      <Container style={{ paddingBottom: 160 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Back
          </Button>
          <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            Read & Understand
          </div>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>{passage.title}</h1>
        <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 16 }}>
          Read the passage. {voiceAvailable ? "Tap a line to hear it." : "Use the toggles below if you need help."}
        </p>

        {/* Audio + subtitle controls */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {voiceAvailable && (
            <button onClick={playAll} style={pillStyle(true)}>
              🔊 Play all
            </button>
          )}
          <button onClick={() => setShowRomanization((v) => !v)} style={pillStyle(showRomanization)}>
            {showRomanization ? "✓ " : ""}Pronunciation
          </button>
          <button onClick={() => setShowTranslation((v) => !v)} style={pillStyle(showTranslation)}>
            {showTranslation ? "✓ " : ""}Translation
          </button>
        </div>

        {/* The passage */}
        <Card style={{ padding: 20 }}>
          {passage.lines.map((line, i) => (
            <div
              key={i}
              onClick={() => voiceAvailable && speak(line.native, lang.ttsCode)}
              style={{
                padding: "14px 0",
                borderBottom: i < passage.lines.length - 1 ? "1px solid var(--border)" : "none",
                cursor: voiceAvailable ? "pointer" : "default",
              }}
            >
              <div style={{
                fontSize: isNonLatin && lang.rtl ? 26 : 22,
                fontWeight: 700,
                lineHeight: 1.5,
                direction: lang.rtl ? "rtl" : "ltr",
                fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                marginBottom: showRomanization || showTranslation ? 6 : 0,
              }}>
                {line.native}
                {voiceAvailable && <span style={{ fontSize: 13, opacity: 0.5, marginLeft: 8 }}>🔊</span>}
              </div>
              {showRomanization && (
                <div style={{ fontSize: 14, color: "var(--accent)", fontStyle: "italic", marginBottom: 2 }}>
                  {line.translit}
                </div>
              )}
              {showTranslation && (
                <div style={{ fontSize: 14, color: "var(--text-dim)" }}>
                  {line.translation}
                </div>
              )}
            </div>
          ))}
        </Card>

        {!voiceAvailable && (
          <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 10, textAlign: "center" }}>
            Audio isn't available on this device — use the Pronunciation toggle to read it aloud yourself.
          </div>
        )}

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: "var(--bg-alt)", borderTop: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <Button onClick={() => setPhase("question")}>I've read it — test me →</Button>
          </div>
        </div>
      </Container>
    );
  }

  // ---------------------------------------------------------------------------
  // QUESTION PHASE
  // ---------------------------------------------------------------------------
  if (phase === "question") {
    return (
      <Container style={{ paddingBottom: 160 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => setPhase("read")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Re-read
          </Button>
          <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            Comprehension
          </div>
        </div>

        <Card style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Question
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{passage.question}</div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {passage.options.map((opt, i) => {
            const isAnswer = feedback && opt === passage.answer;
            const isWrong = feedback && opt === picked && opt !== passage.answer;
            const isPicked = picked === opt;
            return (
              <button
                key={i}
                onClick={() => !feedback && setPicked(opt)}
                style={{
                  background: isAnswer ? "var(--primary-dark)" : isWrong ? "var(--danger)" : isPicked ? "var(--surface-hi)" : "var(--surface)",
                  border: `2px solid ${isAnswer ? "var(--primary)" : isWrong ? "var(--danger)" : isPicked ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 12,
                  padding: 16,
                  color: isAnswer || isWrong ? "#fff" : "var(--text)",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: feedback ? "default" : "pointer",
                  textAlign: "left",
                }}
              >
                {opt}
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
              {feedback === "correct" ? "✓ You understood it!" : `✗ The answer was: ${passage.answer}`}
            </div>
            {feedback === "wrong" && (
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 6 }}>
                Tap "Re-read" above to look at the passage again — comprehension comes with re-reading.
              </div>
            )}
          </Card>
        )}

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: "var(--bg-alt)", borderTop: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {!feedback ? (
              <>
                <Button style={{ opacity: picked ? 1 : 0.4 }} disabled={!picked} onClick={checkAnswer}>
                  Check
                </Button>
                <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "var(--text-mute)" }}>
                  Not sure? Tap "Re-read" above — comprehension comes with re-reading.
                </div>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Button variant="secondary" onClick={() => onNavigate("home")}>Done</Button>
                <Button onClick={nextPassage}>Next passage →</Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    );
  }

  return null;
}

function pillStyle(active) {
  return {
    background: active ? "var(--primary)" : "var(--surface)",
    color: active ? "#fff" : "var(--text-dim)",
    border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
