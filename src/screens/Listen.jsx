// =============================================================================
// LISTEN (v106) — hands-free: hear it, say it, hear what it means, hear it again.
//
// Every other drill needs eyes and a thumb. This one runs while you cook, walk
// or drive: each word is played, then a pause long enough to say it aloud,
// then its meaning in English, then the word once more. It is shadowing — the
// oldest audio method there is — and for a heritage learner, who mostly needs
// the SOUND of the family language back in their mouth, it's the closest thing
// to sitting with a grandparent who repeats things patiently.
//
// It is deliberately NOT graded: nothing is heard back, so nothing is written
// to the review schedule. Pretending otherwise would teach FSRS lies.
//
// This depends on `await speak()` resolving when a recorded clip finishes;
// before v106 it never did (see tts.js tryPlayMp3), and this screen is what
// found that out.
// =============================================================================

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, Card, Container } from "../ui/primitives.jsx";
import { LANGUAGES, isNonLatinScript } from "../data/registry.js";
import { speak, stopSpeaking, speechModeFor } from "../audio/tts.js";
import { sayCoach, cancelVoice, voiceSupported } from "../audio/voice.js";
import { goBack } from "../ui/navigation.js";

export const GAPS = { short: 1600, long: 2800 };
const PHASE_LABEL = { hear: "Listen", repeat: "Say it aloud", meaning: "It means", again: "Once more", done: "" };

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Urdu is read in Nastaliq; Arabic, Persian and Shahmukhi in Naskh — the same
// split GuideMark uses. Nastaliq's tall descenders need the extra line height.
const nativeFont = (code, rtl) =>
  !rtl ? "inherit"
    : code === "ur" ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif'
      : '"Noto Naskh Arabic", "Noto Nastaliq Urdu", serif';

// Media glyphs (⏮ ⏸ ⏭) render as tofu or at a third of the size in half the
// system fonts on Android and Windows. Drawn icons look the same everywhere.
const Icon = ({ d, label }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label} style={{ display: "block", margin: "0 auto" }}>
    <path d={d} />
  </svg>
);
const ICON = {
  prev: "M6 5h2v14H6zM20 5v14L9 12z",
  next: "M16 5h2v14h-2zM4 5l11 7-11 7z",
  play: "M7 4.5v15l12-7.5z",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  again: "M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z",
};

export function Listen({ engine, pack, appState, params, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const nonLatin = isNonLatinScript(pack.code);
  const showTranslit = appState?.showRomanization !== false;
  const category = params?.category || null;

  const [words, setWords] = useState(null);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("hear");
  const [playing, setPlaying] = useState(false);
  const [gap, setGap] = useState("short");
  const [finished, setFinished] = useState(false);
  const run = useRef(0);
  const idxRef = useRef(0);
  const gapRef = useRef(gap);
  gapRef.current = gap;

  const voiceMode = speechModeFor(lang.ttsCode, pack.code);

  useEffect(() => {
    let cancelled = false;
    engine.getListenQueue({ category, size: 12 })
      .then((q) => { if (!cancelled) setWords(q); })
      .catch(() => { if (!cancelled) setWords([]); });
    return () => { cancelled = true; };
  }, [engine, category]);

  const halt = useCallback(() => {
    run.current++;
    stopSpeaking();
    cancelVoice();
  }, []);

  // Stop everything when the screen goes away — a voice that keeps talking
  // after you've left is the single most annoying thing an audio app can do.
  useEffect(() => halt, [halt]);

  const playFrom = useCallback(async (start) => {
    if (!words?.length) return;
    halt();
    const me = run.current;
    const live = () => run.current === me;
    setPlaying(true);
    setFinished(false);

    for (let i = start; i < words.length; i++) {
      const w = words[i];
      idxRef.current = i;
      setIdx(i);
      // Some speech engines never fire `onend`; a hands-free loop that waits on
      // one forever just stops. No single word takes six seconds to say.
      const say = () => Promise.race([
        speak(w.lemma, lang.ttsCode, { audioId: w.id, code: pack.code, translit: w.translit }),
        wait(6000),
      ]);

      // When nothing can be played — no recording and no voice on this device —
      // speak() returns at once, and "Listen" used to flash straight into "Say
      // it aloud" before the word had been presented at all. Hold it long
      // enough to read instead.
      setPhase("hear");
      const heardAt = Date.now();
      if (!(await say())) await wait(Math.max(0, 1400 - (Date.now() - heardAt)));
      if (!live()) return;

      setPhase("repeat");
      await wait(gapRef.current === "long" ? GAPS.long : GAPS.short);
      if (!live()) return;

      setPhase("meaning");
      const spoke = voiceSupported() ? await sayCoach(w.translation) : false;
      if (!live()) return;
      if (!spoke) await wait(1200); // no English voice: leave the meaning up long enough to read
      if (!live()) return;

      setPhase("again");
      const againAt = Date.now();
      if (!(await say())) await wait(Math.max(0, 900 - (Date.now() - againAt)));
      if (!live()) return;
      await wait(700);
      if (!live()) return;
    }
    setPlaying(false);
    setFinished(true);
    setPhase("done");
  }, [words, halt, lang.ttsCode, pack.code]);

  const pause = () => { halt(); setPlaying(false); setPhase("hear"); };
  const step = (d) => {
    const next = Math.max(0, Math.min((words?.length || 1) - 1, idxRef.current + d));
    if (playing) playFrom(next);
    else { idxRef.current = next; setIdx(next); setPhase("hear"); }
  };

  const header = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => { halt(); goBack(onNavigate, "hub"); }} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
          ← Back
        </Button>
        <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
          Hands-free
        </div>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>🔁 Listen and repeat</h1>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 18 }}>
        Hear each word, say it aloud in the pause, hear what it means, then hear it once more. Put the phone down — this works with your eyes closed.
      </p>
    </>
  );

  if (words === null) {
    return <Container style={{ paddingBottom: 120, maxWidth: 560 }}>{header}<div className="screen-loading">Loading…</div></Container>;
  }
  if (!words.length) {
    return (
      <Container style={{ paddingBottom: 120, maxWidth: 560 }}>
        {header}
        <Card style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontWeight: 800 }}>No words to play yet</div>
        </Card>
      </Container>
    );
  }

  const w = words[idx];
  // While playing, the meaning waits for its turn (so you can try to recall it);
  // stopped or stepping through by hand, it is simply shown.
  const showMeaning = !playing || phase === "meaning" || phase === "again";

  return (
    <Container style={{ paddingBottom: 120, maxWidth: 560 }}>
      {header}

      {voiceMode === "none" && (
        <div role="note" style={{
          fontSize: 13, color: "var(--text-dim)", background: "var(--surface-hi)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "10px 12px", marginBottom: 14,
        }}>
          This device has no {lang.name} voice, so recorded words will play but others may be silent. The words still show on screen.
        </div>
      )}

      <Card style={{ padding: 0, overflow: "hidden" }} data-testid="listen-card">
        <div style={{ padding: "22px 20px 18px", textAlign: "center", minHeight: 250, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="eyebrow" aria-live="polite" data-testid="listen-phase" style={{ marginBottom: 12, minHeight: 16 }}>
            {finished ? "Round complete" : playing ? PHASE_LABEL[phase] : "Ready"}
          </div>
          <div
            dir={lang.rtl ? "rtl" : "ltr"}
            lang={pack.code}
            data-testid="listen-word"
            style={{
              fontSize: nonLatin ? 44 : 38, fontWeight: 800, color: "var(--text)", overflowWrap: "anywhere",
              fontFamily: nativeFont(pack.code, lang.rtl), lineHeight: pack.code === "ur" ? 1.9 : 1.35,
              paddingBottom: pack.code === "ur" ? 12 : 0, // Nastaliq descends well below the line
            }}
          >
            {w.lemma}
          </div>
          {showTranslit && w.translit && (
            <div style={{ fontSize: 17, color: "var(--text-dim)", marginTop: 4 }}>{w.translit}</div>
          )}
          <div
            data-testid="listen-meaning"
            style={{
              fontSize: 18, fontWeight: 700, color: "var(--primary)", marginTop: 14, minHeight: 26,
              opacity: showMeaning ? 1 : 0, transition: "opacity 200ms ease",
            }}
            aria-hidden={!showMeaning}
          >
            {w.translation}
          </div>
        </div>
        {/* The pause to speak in, drawn as a bar that empties — so you know how
            long you have without anyone counting at you. */}
        <div style={{ height: 4, background: "var(--surface-hi)", overflow: "hidden" }}>
          {playing && phase === "repeat" && (
            <div
              key={`${idx}-${gap}`}
              className="listen-gap"
              style={{ "--gap": `${gap === "long" ? GAPS.long : GAPS.short}ms` }}
            />
          )}
        </div>
      </Card>

      <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-dim)", margin: "12px 0 16px" }} data-testid="listen-count">
        Word {idx + 1} of {words.length}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 10 }}>
        <Button variant="secondary" onClick={() => step(-1)} aria-label="Previous word" disabled={idx === 0}><Icon d={ICON.prev} /></Button>
        {playing ? (
          <Button onClick={pause} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 20 }}><Icon d={ICON.pause} /></span> Pause
          </Button>
        ) : (
          <Button onClick={() => playFrom(finished ? 0 : idx)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 20 }}><Icon d={finished ? ICON.again : ICON.play} /></span>
            {finished ? "Play again" : idx === 0 ? "Start" : "Resume"}
          </Button>
        )}
        <Button variant="secondary" onClick={() => step(1)} aria-label="Next word" disabled={idx >= words.length - 1}><Icon d={ICON.next} /></Button>
      </div>

      <div role="group" aria-label="Pause length" style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18 }}>
        {[["short", "Short pause"], ["long", "Longer pause"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setGap(k)}
            aria-pressed={gap === k}
            style={{
              padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
              border: gap === k ? "2px solid var(--primary)" : "1px solid var(--border)",
              background: gap === k ? "var(--surface-hi)" : "var(--surface)", color: "var(--text)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {finished && (
        <Card style={{ marginTop: 18, textAlign: "center" }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>{words.length} words, heard and said</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12 }}>
            Saying a word aloud is what moves it from "I recognise it" to "I can use it".
          </div>
          <Button variant="secondary" onClick={() => { halt(); onNavigate("lesson", { mode: "smart" }); }}>Now test yourself →</Button>
        </Card>
      )}
    </Container>
  );
}
