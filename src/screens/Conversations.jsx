// =============================================================================
// CONVERSATIONS — a freely browsable phrasebook of practical exchanges.
// No tests, no gating, no scoring. Users explore at their own pace. Built to
// feel like the Reading feature but for real conversation starters.
// =============================================================================

import React, { useState } from "react";
import { Button, Card, Container } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";
import { getConversations } from "../data/conversations.js";

const NON_LATIN = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn"]);

export function Conversations({ pack, appState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = NON_LATIN.has(pack.code);
  const voiceAvailable = hasVoiceFor(lang.ttsCode);
  const list = getConversations(pack.code);

  const [openId, setOpenId] = useState(null);
  // Default the subtitle helpers ON for non-Latin scripts (audio may be silent)
  const [showRoman, setShowRoman] = useState(true);
  const [showTrans, setShowTrans] = useState(true);

  if (list.length === 0) {
    return (
      <Container>
        <div style={{ marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Back
          </Button>
        </div>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>💬</div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>No conversation starters for {lang.name} yet</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
            We're adding practical phrases for every language. Check back soon!
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
          Conversation starters
        </div>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>💬 Real conversations</h1>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 16 }}>
        Practical exchanges you'll actually use. Tap any one to open it. Browse freely — nothing is tested here.
      </p>

      {/* Subtitle controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setShowRoman((v) => !v)} style={pill(showRoman)}>
          {showRoman ? "✓ " : ""}Pronunciation
        </button>
        <button onClick={() => setShowTrans((v) => !v)} style={pill(showTrans)}>
          {showTrans ? "✓ " : ""}Translation
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((conv) => {
          const isOpen = openId === conv.id;
          return (
            <Card key={conv.id} style={{ padding: 0, overflow: "hidden" }}>
              {/* Header row — tap to expand/collapse */}
              <button
                onClick={() => setOpenId(isOpen ? null : conv.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "var(--text)",
                }}
              >
                <div style={{ fontSize: 26 }}>{conv.emoji}</div>
                <div style={{ flex: 1, fontSize: 15, fontWeight: 800 }}>{conv.situation}</div>
                <div style={{ fontSize: 16, color: "var(--text-dim)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</div>
              </button>

              {/* Expanded exchange */}
              {isOpen && (
                <div className="slide-up" style={{ padding: "0 16px 16px" }}>
                  {conv.lines.map((line, i) => (
                    <div
                      key={i}
                      onClick={() => voiceAvailable && speak(line.native, lang.ttsCode)}
                      style={{
                        padding: "12px 0",
                        borderTop: "1px solid var(--border)",
                        cursor: voiceAvailable ? "pointer" : "default",
                      }}
                    >
                      <div style={{
                        fontSize: isNonLatin && lang.rtl ? 22 : 19,
                        fontWeight: 700,
                        lineHeight: 1.5,
                        direction: lang.rtl ? "rtl" : "ltr",
                        fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                        marginBottom: showRoman || showTrans ? 5 : 0,
                      }}>
                        {line.native}
                        {voiceAvailable && <span style={{ fontSize: 12, opacity: 0.45, marginLeft: 8 }}>🔊</span>}
                      </div>
                      {showRoman && (
                        <div style={{ fontSize: 13, color: "var(--accent)", fontStyle: "italic", marginBottom: 2 }}>
                          {line.translit}
                        </div>
                      )}
                      {showTrans && (
                        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                          {line.translation}
                        </div>
                      )}
                      {line.note && (
                        <div style={{
                          fontSize: 12,
                          color: "var(--text)",
                          background: "var(--surface-hi)",
                          borderRadius: 8,
                          padding: "8px 10px",
                          marginTop: 8,
                          lineHeight: 1.4,
                        }}>
                          💡 {line.note}
                        </div>
                      )}
                    </div>
                  ))}
                  {!voiceAvailable && (
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 10, textAlign: "center" }}>
                      Audio isn't available on this device — use Pronunciation to read it aloud yourself.
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "var(--text-mute)" }}>
        {list.length} conversations · more added regularly
      </div>
    </Container>
  );
}

function pill(active) {
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
