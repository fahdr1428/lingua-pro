// =============================================================================
// FLASHCARDS — passive study mode. Tap a unit, swipe through cards, tap to flip.
// No quiz attached — for browsing/passive review.
// =============================================================================

import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";

const NON_LATIN_LANGUAGES = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn"]);

export function Flashcards({ pack, appState, onNavigate, params }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = NON_LATIN_LANGUAGES.has(pack.code);
  const voiceAvailable = hasVoiceFor(lang.ttsCode);

  // If no unit param, show unit picker
  const [selectedUnit, setSelectedUnit] = useState(params?.unit || null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Filter cards by unit if one is selected
  const cards = useMemo(() => {
    if (!selectedUnit) return [];
    return (pack.vocab || []).filter((v) => v.unit === selectedUnit);
  }, [pack.vocab, selectedUnit]);

  // Build per-unit progress for the picker
  const unitsWithCounts = useMemo(() => {
    return (pack.units || []).map((u) => ({
      ...u,
      count: (pack.vocab || []).filter((v) => v.unit === u.id).length,
    }));
  }, [pack.units, pack.vocab]);

  const card = cards[idx];

  // -------------------------------------------------------------------------
  // KEYBOARD SHORTCUTS (desktop): spacebar to flip, arrows to navigate.
  // Hook is at the top so it runs in every render path — Rules of Hooks.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedUnit || !card) return; // only active in card view
    function onKey(e) {
      // Don't intercept keys if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (idx + 1 >= cards.length) {
          setSelectedUnit(null); setIdx(0); setFlipped(false);
        } else {
          setIdx((i) => i + 1); setFlipped(false);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (idx > 0) { setIdx((i) => i - 1); setFlipped(false); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedUnit, idx, cards.length, card]);

  // -------------------------------------------------------------------------
  // Unit picker view
  // -------------------------------------------------------------------------
  if (!selectedUnit) {
    return (
      <Container>
        <div style={{ marginBottom: 20 }}>
          <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Back
          </Button>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>
          📇 Flashcards
        </h1>
        <p style={{ color: "var(--text-dim)", marginBottom: 24, fontSize: 14 }}>
          Browse words at your own pace. Tap a card to flip it.
        </p>

        <h3 style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Pick a topic
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {unitsWithCounts.map((u) => (
            <button
              key={u.id}
              disabled={u.count === 0}
              onClick={() => { setSelectedUnit(u.id); setIdx(0); setFlipped(false); }}
              style={{
                background: u.count === 0 ? "var(--surface)" : "var(--surface)",
                border: "2px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: 16,
                cursor: u.count === 0 ? "not-allowed" : "pointer",
                opacity: u.count === 0 ? 0.5 : 1,
                color: "var(--text)",
                textAlign: "left",
                transition: "transform 0.1s",
              }}
              onMouseEnter={(e) => { if (u.count > 0) e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: 32, marginBottom: 6 }}>{u.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{u.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                {u.count} card{u.count === 1 ? "" : "s"}
              </div>
            </button>
          ))}
        </div>
      </Container>
    );
  }

  // -------------------------------------------------------------------------
  // Empty unit fallback
  // -------------------------------------------------------------------------
  if (cards.length === 0) {
    return (
      <Container style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>🤷</div>
        <h2>No cards in this topic yet</h2>
        <Button style={{ marginTop: 20 }} onClick={() => setSelectedUnit(null)}>Pick another topic</Button>
      </Container>
    );
  }

  // -------------------------------------------------------------------------
  // Card view
  // -------------------------------------------------------------------------
  function nextCard() {
    if (idx + 1 >= cards.length) {
      setSelectedUnit(null);
      setIdx(0);
      setFlipped(false);
    } else {
      setIdx(idx + 1);
      setFlipped(false);
    }
  }

  function prevCard() {
    if (idx === 0) return;
    setIdx(idx - 1);
    setFlipped(false);
  }

  const unit = pack.units.find((u) => u.id === selectedUnit);

  return (
    <Container style={{ paddingBottom: 140 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <Button
          variant="ghost"
          onClick={() => { setSelectedUnit(null); setIdx(0); setFlipped(false); }}
          style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}
        >
          ← Topics
        </Button>
        <div style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 700 }}>
          {idx + 1} / {cards.length}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, textAlign: "center" }}>
        {unit?.emoji} {unit?.title}
      </div>

      {/* The card itself — tap to flip */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="slide-up"
        key={`${idx}-${flipped}`}
        style={{
          background: flipped ? "var(--primary-soft)" : "var(--surface)",
          border: `2px solid ${flipped ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "var(--radius-lg)",
          minHeight: 280,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 16,
          boxShadow: "var(--shadow-card)",
        }}
      >
        {!flipped ? (
          // FRONT: word
          <>
            {isNonLatin ? (
              <>
                <div style={{ fontSize: 42, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>
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
            <div style={{ marginTop: 24, fontSize: 12, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1 }}>
              Tap or press space
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
              <div style={{
                fontSize: 14,
                color: "var(--text-dim)",
                fontStyle: "italic",
                lineHeight: 1.5,
                maxWidth: 400,
              }}>
                "{card.examples[0].translation}"
              </div>
            )}
          </>
        )}
      </div>

      {/* Audio button */}
      {voiceAvailable && (
        <Button
          variant="secondary"
          style={{ marginBottom: 12 }}
          onClick={(e) => { e.stopPropagation(); speak(card.lemma, lang.ttsCode, { audioId: card.id }); }}
        >
          🔊 Listen
        </Button>
      )}

      {/* Nav arrows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Button variant="secondary" onClick={prevCard} style={{ opacity: idx === 0 ? 0.4 : 1 }} disabled={idx === 0}>
          ← Previous
        </Button>
        <Button onClick={nextCard}>
          {idx + 1 >= cards.length ? "Done" : "Next →"}
        </Button>
      </div>

      {/* Keyboard shortcut hint — only visible on desktop where you can press keys */}
      <div style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "var(--text-mute)" }}>
        On desktop: <kbd style={kbdStyle}>Space</kbd> to flip · <kbd style={kbdStyle}>←</kbd> <kbd style={kbdStyle}>→</kbd> to navigate
      </div>
    </Container>
  );
}

const kbdStyle = {
  display: "inline-block",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  padding: "1px 6px",
  margin: "0 2px",
  fontSize: 10,
  fontFamily: "monospace",
  color: "var(--text-dim)",
};
