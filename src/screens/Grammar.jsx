// =============================================================================
// GRAMMAR — browsable, teachable grammar lessons. Never compulsory; the user
// chooses to come here. Each lesson: concept explained simply, worked examples
// with literal glosses, and quick comprehension checks they can try.
// =============================================================================

import React, { useState } from "react";
import { Button, Card, Container } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";
import { getGrammar } from "../data/grammar.js";

const NON_LATIN = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn", "pa"]);

export function Grammar({ pack, appState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = NON_LATIN.has(pack.code);
  const voiceAvailable = hasVoiceFor(lang.ttsCode);
  const lessons = getGrammar(pack.code);

  const [openId, setOpenId] = useState(null);
  // Per-check selected answers: { "lessonId:checkIdx": "chosenOption" }
  const [answers, setAnswers] = useState({});

  if (lessons.length === 0) {
    return (
      <Container>
        <div style={{ marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Back
          </Button>
        </div>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>📐</div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>No grammar guide for {lang.name} yet</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
            We're writing careful grammar lessons for every language. Keep practicing vocabulary meanwhile!
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container style={{ paddingBottom: 120 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
          ← Back
        </Button>
        <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
          Grammar
        </div>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>📐 How {lang.name} works</h1>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 20 }}>
        Short lessons on the patterns behind the language. Read them in any order, any time — this is here when you want it, never required.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {lessons.map((L, li) => {
          const isOpen = openId === L.id;
          return (
            <Card key={L.id} style={{ padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => setOpenId(isOpen ? null : L.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: 16, background: "transparent", border: "none",
                  cursor: "pointer", textAlign: "left", color: "var(--text)",
                }}
              >
                <div style={{ fontSize: 24 }}>{L.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700 }}>Lesson {li + 1}</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{L.title}</div>
                </div>
                <div style={{ fontSize: 16, color: "var(--text-dim)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</div>
              </button>

              {isOpen && (
                <div className="slide-up" style={{ padding: "0 16px 18px" }}>
                  {/* Concept */}
                  <div style={{
                    fontSize: 14, lineHeight: 1.65, color: "var(--text)",
                    borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 16,
                  }}
                    dangerouslySetInnerHTML={{ __html: boldify(L.concept) }}
                  />

                  {/* Examples */}
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                    Examples
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                    {L.examples.map((ex, ei) => (
                      <div
                        key={ei}
                        onClick={() => voiceAvailable && speak(ex.native, lang.ttsCode)}
                        style={{
                          background: "var(--surface)", borderRadius: 10, padding: 12,
                          cursor: voiceAvailable ? "pointer" : "default",
                        }}
                      >
                        <div style={{
                          fontSize: isNonLatin && lang.rtl ? 20 : 17, fontWeight: 700,
                          direction: lang.rtl ? "rtl" : "ltr",
                          fontFamily: lang.rtl ? '"Noto Nastaliq Urdu","Noto Naskh Arabic",serif' : "inherit",
                        }}>
                          {ex.native}
                          {voiceAvailable && <span style={{ fontSize: 12, opacity: 0.4, marginLeft: 8 }}>🔊</span>}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--accent)", fontStyle: "italic", marginTop: 3 }}>{ex.translit}</div>
                        <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{ex.gloss}</div>
                      </div>
                    ))}
                  </div>

                  {/* Comprehension checks */}
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                    Quick check
                  </div>
                  {L.checks.map((c, ci) => {
                    const key = `${L.id}:${ci}`;
                    const chosen = answers[key];
                    const answered = chosen != null;
                    return (
                      <div key={ci} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{c.q}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {c.options.map((opt, oi) => {
                            const isChosen = chosen === opt;
                            const isCorrect = opt === c.answer;
                            let bg = "var(--surface)", border = "var(--border)", color = "var(--text)";
                            if (answered) {
                              if (isCorrect) { bg = "rgba(34,197,94,0.15)"; border = "var(--primary)"; }
                              else if (isChosen) { bg = "rgba(239,68,68,0.15)"; border = "var(--danger)"; }
                            }
                            return (
                              <button
                                key={oi}
                                onClick={() => !answered && setAnswers((a) => ({ ...a, [key]: opt }))}
                                style={{
                                  background: bg, border: `2px solid ${border}`, color,
                                  borderRadius: 10, padding: "10px 12px", fontSize: 13,
                                  fontWeight: 700, cursor: answered ? "default" : "pointer", textAlign: "left",
                                }}
                              >
                                {opt}{answered && isCorrect ? "  ✓" : ""}
                              </button>
                            );
                          })}
                        </div>
                        {answered && (
                          <div style={{
                            fontSize: 13, color: "var(--text-dim)", marginTop: 8,
                            background: "var(--surface-hi)", borderRadius: 8, padding: "8px 10px", lineHeight: 1.5,
                          }}>
                            💡 {c.explain}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "var(--text-mute)" }}>
        {lessons.length} grammar lessons · learn at your own pace
      </div>
    </Container>
  );
}

// Minimal **bold** → <strong> conversion for concept text. Escapes HTML first
// so user-irrelevant injection is impossible (content is static/authored).
function boldify(text) {
  const esc = String(text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
