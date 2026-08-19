// =============================================================================
// SENTENCE LAB (v47) — progressive, step-by-step sentence building.
//
// Teaches ONE pattern per drop, built up in escalating steps:
//   1. SEE IT      — full sentence, color-coded chunks, translation + audio
//   2. BUILD IT    — tap chunks into order WITH the structure scaffolded
//   3. BUILD AGAIN — same sentence, scaffold removed (from memory-ish)
//   4. EXTEND      — add one piece (if the pattern has an `extend`)
//   5. TWIST       — a small variation so they generalise (if `twist` present)
//
// Designed to feel gentle and confidence-building, not like a test. Lots of
// "you've got this" energy, immediate visual feedback, no hearts lost.
// =============================================================================

import React, { useState, useMemo } from "react";
import { Button, Card, Container, ProgressBar } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { ROLE_COLORS } from "../data/sentencePatterns.js";
import { speak } from "../audio/tts.js";

const NON_LATIN = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn", "pa"]);

// A single color-coded chunk "tile"
function ChunkTile({ chunk, isNonLatin, rtl, onClick, faded, small }) {
  const color = ROLE_COLORS[chunk.role] || ROLE_COLORS.particle;
  return (
    <button
      onClick={onClick}
      style={{
        background: faded ? "var(--surface)" : color.bg,
        color: faded ? "var(--text-dim)" : "#fff",
        border: faded ? "2px dashed var(--border)" : "none",
        borderRadius: 12,
        padding: small ? "8px 12px" : "12px 16px",
        cursor: onClick ? "pointer" : "default",
        textAlign: "center",
        minWidth: 60,
        transition: "transform 0.1s",
        direction: rtl ? "rtl" : "ltr",
      }}
    >
      <div style={{ fontSize: small ? 18 : 22, fontWeight: 800, lineHeight: 1.2 }}>
        {isNonLatin ? chunk.translit : chunk.text}
      </div>
      <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{chunk.gloss}</div>
    </button>
  );
}

// The color legend so learners learn what each color means
function RoleLegend({ roles }) {
  const unique = [...new Set(roles)];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 12 }}>
      {unique.map((r) => {
        const c = ROLE_COLORS[r] || ROLE_COLORS.particle;
        return (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-dim)" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, display: "inline-block" }} />
            {c.label}
          </div>
        );
      })}
    </div>
  );
}

export function SentenceLab({ pack, params, onNavigate, appState, setAppState }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = NON_LATIN.has(pack.code);
  const rtl = lang?.rtl;
  const pattern = params?.pattern;
  const dropNumber = params?.dropNumber || 1;

  // Steps: see → build (scaffold) → build (no scaffold) → extend? → twist?
  const steps = useMemo(() => {
    const s = ["see", "build_scaffold", "build_free"];
    if (pattern?.extend) s.push("extend");
    if (pattern?.twist) s.push("twist");
    s.push("done");
    return s;
  }, [pattern]);

  const [stepIdx, setStepIdx] = useState(0);
  const step = steps[stepIdx];

  if (!pattern) {
    return (
      <Container style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 60 }}>🧱</div>
        <h2>Sentence Lab</h2>
        <p style={{ color: "var(--text-dim)" }}>No pattern available right now.</p>
        <Button onClick={() => onNavigate("home")}>Back home</Button>
      </Container>
    );
  }

  const next = () => setStepIdx((i) => Math.min(i + 1, steps.length - 1));

  // Completion → record this drop as done so the next drops climb the ladder
  function finish() {
    setAppState((s) => {
      const done = { ...(s.sentenceDropsDone || {}) };
      done[pack.code] = Math.max(done[pack.code] || 0, dropNumber);
      return { ...s, sentenceDropsDone: done, totalXp: (s.totalXp || 0) + 15 };
    });
    onNavigate("home");
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${lang.color}18, var(--bg))` }}>
      <Container style={{ paddingTop: 24, paddingBottom: 40 }}>
        {/* progress */}
        <div style={{ marginBottom: 8 }}>
          <ProgressBar value={(stepIdx / (steps.length - 1)) * 100} />
        </div>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--accent-text)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
          🧱 Sentence Lab · Drop {dropNumber}
        </div>
        <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-dim)", marginBottom: 20 }}>
          {pattern.skill}
        </div>

        {step === "see" && <SeeStep pattern={pattern} lang={lang} isNonLatin={isNonLatin} rtl={rtl} onNext={next} />}
        {step === "build_scaffold" && <BuildStep pattern={pattern} lang={lang} isNonLatin={isNonLatin} rtl={rtl} scaffold onNext={next} />}
        {step === "build_free" && <BuildStep pattern={pattern} lang={lang} isNonLatin={isNonLatin} rtl={rtl} onNext={next} />}
        {step === "extend" && <SeeStep pattern={{ ...pattern.extend, note: pattern.extend.note }} lang={lang} isNonLatin={isNonLatin} rtl={rtl} onNext={next} isExtend />}
        {step === "twist" && <TwistStep twist={pattern.twist} lang={lang} isNonLatin={isNonLatin} rtl={rtl} onNext={next} />}
        {step === "done" && <DoneStep onFinish={finish} skill={pattern.skill} />}
      </Container>
    </div>
  );
}

// STEP 1 / EXTEND — show the sentence built, color coded, with audio
function SeeStep({ pattern, lang, isNonLatin, rtl, onNext, isExtend }) {
  const full = pattern.chunks.map((c) => c.text).join(" ");
  const fullTranslit = pattern.chunks.map((c) => c.translit).join(" ");
  return (
    <Card style={{ textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-text)", marginBottom: 12 }}>
        {isExtend ? "✨ Now let's make it longer" : "👀 Look how this sentence is built"}
      </div>
      {/* the chunks, in order, color-coded */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16, direction: rtl ? "rtl" : "ltr" }}>
        {pattern.chunks.map((c, i) => (
          <ChunkTile key={i} chunk={c} isNonLatin={isNonLatin} rtl={rtl} />
        ))}
      </div>
      {/* full sentence + translation */}
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 4 }}>{isNonLatin ? fullTranslit : ""}</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>"{pattern.translation}"</div>
      <button
        onClick={() => speak(full, lang.ttsCode)}
        style={{ background: "none", border: "1px solid var(--border)", borderRadius: 999, padding: "6px 14px", cursor: "pointer", color: "var(--text)", fontSize: 14, marginTop: 8 }}
      >
        🔊 Hear it
      </button>
      {pattern.note && (
        <div style={{ marginTop: 16, background: "var(--surface-hi)", borderRadius: 10, padding: 12, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
          💡 {pattern.note}
        </div>
      )}
      <RoleLegend roles={pattern.chunks.map((c) => c.role)} />
      <Button style={{ marginTop: 20 }} onClick={onNext}>Got it →</Button>
    </Card>
  );
}

// STEP 2/3 — tap the chunks into the correct order. `scaffold` shows ghost slots.
function BuildStep({ pattern, lang, isNonLatin, rtl, scaffold, onNext }) {
  const correct = pattern.chunks;
  const [placed, setPlaced] = useState([]);
  const [wrong, setWrong] = useState(false);

  const bank = useMemo(() => {
    const arr = correct.map((c, i) => ({ ...c, _id: i }));
    return arr.slice().sort(() => Math.random() - 0.5);
  }, [pattern]);

  const remaining = bank.filter((b) => !placed.find((p) => p._id === b._id));

  function tap(chunk) {
    const nextIndex = placed.length;
    // The correct next chunk is the one whose original index === nextIndex.
    if (chunk._id === nextIndex) {
      const np = [...placed, chunk];
      setPlaced(np);
      setWrong(false);
      if (np.length === correct.length) {
        setTimeout(() => {
          speak(correct.map((c) => c.text).join(" "), lang.ttsCode);
        }, 200);
      }
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 600);
    }
  }

  const complete = placed.length === correct.length;

  return (
    <Card style={{ textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-text)", marginBottom: 6 }}>
        {scaffold ? "🪜 Build it — tap in order" : "💪 Now build it yourself"}
      </div>
      <div style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 16 }}>"{pattern.translation}"</div>

      {/* placed area / scaffold slots */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center",
        minHeight: 64, alignItems: "center", padding: 12, marginBottom: 16,
        background: "var(--surface)", borderRadius: 12,
        border: wrong ? "2px solid var(--danger)" : "2px solid transparent",
        direction: rtl ? "rtl" : "ltr",
      }}>
        {placed.map((c, i) => (
          <ChunkTile key={i} chunk={c} isNonLatin={isNonLatin} rtl={rtl} small />
        ))}
        {/* scaffold: show ghost slots with the role hint for unplaced positions */}
        {scaffold && correct.slice(placed.length).map((c, i) => {
          const col = ROLE_COLORS[c.role] || ROLE_COLORS.particle;
          return (
            <div key={`ghost-${i}`} style={{ border: `2px dashed ${col.bg}`, borderRadius: 12, padding: "8px 12px", minWidth: 60, opacity: 0.6 }}>
              <div style={{ fontSize: 11, color: col.bg, fontWeight: 700 }}>{col.label}</div>
            </div>
          );
        })}
        {placed.length === 0 && !scaffold && (
          <span style={{ color: "var(--text-mute)", fontSize: 14 }}>Tap the words below in order…</span>
        )}
      </div>

      {/* word bank */}
      {!complete && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", direction: rtl ? "rtl" : "ltr" }}>
          {remaining.map((c) => (
            <ChunkTile key={c._id} chunk={c} isNonLatin={isNonLatin} rtl={rtl} small onClick={() => tap(c)} />
          ))}
        </div>
      )}

      {wrong && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>Not quite — remember the word order. Try the next piece.</div>}

      {complete && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 32 }}>🎉</div>
          <div style={{ fontWeight: 800, color: "var(--accent-text)", marginBottom: 12 }}>Perfect word order!</div>
          <Button onClick={onNext}>Continue →</Button>
        </div>
      )}
    </Card>
  );
}

// TWIST — "make it your own": build a small variation from a prompt
function TwistStep({ twist, lang, isNonLatin, rtl, onNext }) {
  const correct = twist.chunks;
  const [placed, setPlaced] = useState([]);
  const [wrong, setWrong] = useState(false);
  const bank = useMemo(() => correct.map((c, i) => ({ ...c, _id: i })).slice().sort(() => Math.random() - 0.5), [twist]);
  const remaining = bank.filter((b) => !placed.find((p) => p._id === b._id));

  function tap(chunk) {
    if (chunk._id === placed.length) {
      const np = [...placed, chunk];
      setPlaced(np);
      setWrong(false);
      if (np.length === correct.length) setTimeout(() => speak(correct.map((c) => c.text).join(" "), lang.ttsCode), 200);
    } else {
      setWrong(true); setTimeout(() => setWrong(false), 600);
    }
  }
  const complete = placed.length === correct.length;

  return (
    <Card style={{ textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-text)", marginBottom: 6 }}>🎯 Make it your own</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, lineHeight: 1.5 }}>{twist.prompt}</div>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", minHeight: 56, alignItems: "center",
        padding: 12, marginBottom: 16, background: "var(--surface)", borderRadius: 12,
        border: wrong ? "2px solid var(--danger)" : "2px solid transparent", direction: rtl ? "rtl" : "ltr",
      }}>
        {placed.map((c, i) => <ChunkTile key={i} chunk={c} isNonLatin={isNonLatin} rtl={rtl} small />)}
        {placed.length === 0 && <span style={{ color: "var(--text-mute)", fontSize: 14 }}>Tap the words in order…</span>}
      </div>
      {!complete && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", direction: rtl ? "rtl" : "ltr" }}>
          {remaining.map((c) => <ChunkTile key={c._id} chunk={c} isNonLatin={isNonLatin} rtl={rtl} small onClick={() => tap(c)} />)}
        </div>
      )}
      {wrong && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>Close — check the order and try the next piece.</div>}
      {complete && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 32 }}>🌟</div>
          <div style={{ fontWeight: 800, color: "var(--accent-text)", marginBottom: 4 }}>You built that yourself!</div>
          <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 12 }}>"{twist.translation}"</div>
          <Button onClick={onNext}>Finish →</Button>
        </div>
      )}
    </Card>
  );
}

// DONE — celebratory close
function DoneStep({ onFinish, skill }) {
  return (
    <Card style={{ textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 8 }}>🏗️</div>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px" }}>Sentence built!</h2>
      <p style={{ color: "var(--text-dim)", marginBottom: 8, lineHeight: 1.5 }}>
        You just learned to build: <strong style={{ color: "var(--text)" }}>{skill}</strong>
      </p>
      <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 20 }}>
        Each Sentence Lab builds on the last — they get a little more complex as you go. +15 XP
      </p>
      <Button onClick={onFinish}>Back to learning →</Button>
    </Card>
  );
}
