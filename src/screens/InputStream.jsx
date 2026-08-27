// =============================================================================
// THE INPUT STREAM — read the language, rather than answer questions about it.
//
// Measured before building this: the whole reading library is about 623 words of
// connected text ACROSS FOURTEEN LANGUAGES. Korean gets four. Against that sat
// fourteen exercise types, a memory model and a spaced-repetition scheduler —
// a great deal of machinery for practising items, attached to about a minute of
// actual language.
//
// Every vocabulary word already carries a native-authored example sentence, and
// a learner meets each one ONCE, alone, inside a multiple-choice question. This
// screen puts them back together in the order the learner can read them. It
// invents nothing: every sentence here was written and reviewed as part of the
// curriculum. See src/engine/inputStream.js for how "can read" is decided, and
// for the too-lax first version that a measurement script caught.
//
// WHY IT LOOKS LIKE THIS.
//
// The meaning is hidden until asked for. Reading with the translation beside it
// isn't reading, it's translating — the eye takes the English and the target
// language never gets processed at all. Tapping to check is a different act from
// reading in parallel, and it's the one that does the work.
//
// There is no score, no streak and nothing to get wrong. This is the one part of
// the app that isn't testing them, and quietly attaching points to it would turn
// it into another exercise.
// =============================================================================

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Container } from "../ui/primitives.jsx";
import { LANGUAGES, isNonLatinScript } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";
import { readableSentences } from "../engine/inputStream.js";


export function InputStream({ pack, engine, appState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = isNonLatinScript(pack.code);
  const voiceAvailable = hasVoiceFor(lang.ttsCode);
  const showRoman = appState?.showRomanization !== false;

  const [progress, setProgress] = useState(null);
  const [revealed, setRevealed] = useState(() => new Set());

  useEffect(() => {
    let alive = true;
    engine.getProgress().then((p) => { if (alive) setProgress(p || {}); });
    return () => { alive = false; };
  }, [engine, pack.code]);

  const sentences = useMemo(
    // Someone reading in romanisation can't say a line that hasn't got any, so
    // those sort to the back for them. Someone reading the script itself is
    // unaffected.
    () => (progress ? readableSentences(pack, progress, { preferTranslit: showRoman && isNonLatin }) : []),
    [pack, progress, showRoman, isNonLatin]
  );

  const fluent = sentences.filter((s) => s.unknown === 0);
  const stretch = sentences.filter((s) => s.unknown === 1);

  const toggle = (key) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <Button variant="ghost" onClick={() => onNavigate("reading")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
        ← Back
      </Button>
      <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
        Reading
      </div>
    </div>
  );

  if (progress === null) {
    return <Container>{header}</Container>;
  }

  // A learner ten words in genuinely may have nothing here yet — one language
  // offers a beginner nothing at all, and saying so is better than an empty
  // screen that looks broken.
  if (!sentences.length) {
    return (
      <Container>
        {header}
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌱</div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Not quite yet</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
            A few more words and there'll be real {lang.name} here to read — whole
            sentences, not questions. Do a lesson or two and come back.
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container style={{ paddingBottom: 140 }}>
      {header}

      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>
        {lang.name} you can read
      </h1>
      <p style={{ color: "var(--text-dim)", fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
        {fluent.length > 0
          ? `${fluent.length} sentence${fluent.length === 1 ? "" : "s"} built entirely from words you know`
          : "Sentences built around words you know"}
        {stretch.length > 0 && `, and ${stretch.length} with one new word in`}.
        {" "}Read first — tap a line only if you need the meaning.
      </p>

      {/* v83 — DON'T GO QUIET ABOUT A GAP THE LEARNER CAN SEE.
          Japanese, Korean and Mandarin example sentences carry no romanisation
          at all — not a missing field here and there, the field doesn't exist in
          those packs — and Arabic and Urdu are at 38% and 55%. Someone who can't
          read the script meets a line they cannot say.
          The romaniser in audio/romanise.js could fill it and must not: it's a
          rough phonetic skeleton built for scoring speech, documented as never
          to be shown to a learner, and an approximation of how someone's
          grandmother's language sounds is the wrong thing for this app to
          invent. Saying so, and pointing at the audio, is honest. */}
      {isNonLatin && showRoman && sentences.filter((s) => s.translit).length < sentences.length / 2 && (
        <div style={{
          fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.55,
          background: "var(--surface-hi)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "10px 12px", marginBottom: 16,
        }}>
          Most of these don't have a written pronunciation yet — we'd rather leave
          it blank than guess at it. Tap 🔊 on any line to hear how it goes.
        </div>
      )}

      {fluent.length > 0 && (
        <Section
          label="You know every word of these"
          sentences={fluent}
          {...{ lang, pack, isNonLatin, showRoman, voiceAvailable, revealed, toggle }}
        />
      )}

      {stretch.length > 0 && (
        <Section
          label="One new word each"
          note="Work it out from the rest of the sentence before you look — that's the bit that sticks."
          sentences={stretch}
          {...{ lang, pack, isNonLatin, showRoman, voiceAvailable, revealed, toggle }}
        />
      )}
    </Container>
  );
}

function Section({ label, note, sentences, lang, pack, isNonLatin, showRoman, voiceAvailable, revealed, toggle }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        fontSize: 11, fontWeight: 800, color: "var(--text-dim)",
        textTransform: "uppercase", letterSpacing: 1, marginBottom: note ? 4 : 10,
      }}>
        {label}
      </div>
      {note && (
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.55, marginBottom: 10 }}>
          {note}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sentences.map((s, i) => {
          const key = `${s.wordId}:${i}`;
          const open = revealed.has(key);
          return (
            <div
              key={key}
              onClick={() => toggle(key)}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "12px 14px", cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    dir={lang.rtl ? "rtl" : "ltr"}
                    lang={pack.code}
                    style={{
                      fontSize: isNonLatin && lang.rtl ? 21 : 17, fontWeight: 700,
                      lineHeight: 1.6,
                      fontFamily: lang.rtl ? '"Noto Nastaliq Urdu","Noto Naskh Arabic",serif' : "inherit",
                    }}
                  >
                    {s.native}
                  </div>
                  {showRoman && s.translit && (
                    <div style={{ fontSize: 12.5, color: "var(--accent-text)", fontStyle: "italic", marginTop: 3 }}>
                      {s.translit}
                    </div>
                  )}
                  {open ? (
                    <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 6, lineHeight: 1.5 }}>
                      {s.translation}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 6, opacity: 0.75 }}>
                      Tap for the meaning
                    </div>
                  )}
                </div>
                {voiceAvailable && (
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(s.native, lang.ttsCode); }}
                    aria-label="Hear this sentence"
                    style={{
                      background: "transparent", border: "1px solid var(--border)",
                      borderRadius: 999, width: 34, height: 34, minWidth: 34,
                      cursor: "pointer", color: "var(--text-dim)", fontSize: 14,
                    }}
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
