// =============================================================================
// ALPHABET LESSONS — a real script course for non-Latin writing systems.
//
// v91 — the letter list was never the whole system, and for the hard scripts it
// wasn't even half of one. Three things were missing, and each of them was the
// difference between "knows the letters" and "can read":
//
//   ARABIC SCRIPT — letters were only ever shown ISOLATED. No word is written
//     that way. Now every letter also shows its initial / medial / final forms,
//     built live with ZWJ so the reader's own font shapes them properly.
//
//   ABUGIDAS — consonants were taught bare. ക is "ka"; ki is കി. A vowel-sign
//     lesson now teaches the marks that actually make syllables.
//
//   HANGUL — 24 jamo and no mention that they stack. ㅎ+ㅏ+ㄴ is 한, not ㅎㅏㄴ.
//     A block-assembly lesson now teaches the square.
//
// Plus a primer that explains how the system works BEFORE letter one, confusable
// pairs with the tell that separates them, and a quiz that runs in both
// directions instead of only letter → sound.
// =============================================================================

import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Container, ProgressBar } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";

// localStorage key for tracking which groups are completed (per language)
const STORAGE_KEY = "alphabet_progress";

// Languages genuinely written in the Latin alphabet. Used only to decide which
// honest message to show when a pack has no alphabet data — never to decide
// whether to teach one.
const LATIN_SCRIPT = new Set(["es", "fr", "de", "id", "tr", "pcm", "tl", "so"]);

// Synthetic lesson ids, kept out of the way of real group ids.
const PRIMER = "__primer";
const VOWELS = "__vowelsigns";
const BLOCKS = "__blocks";

// Zero-width joiner. Appending it to an Arabic letter tells the font to shape
// that letter as though a letter follows it — which is how you show an initial
// or medial form without hardcoding presentation-form codepoints.
const ZWJ = "‍";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveProgress(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

// Build the four positional forms of an Arabic-script letter.
// Every letter joins BACKWARD (to the letter before it). Only some join
// FORWARD — the non-connectors are the reason Arabic words look gappy.
function joinedForms(char, nonConnectors) {
  const forward = !nonConnectors.includes(char);
  return {
    isolated: char,
    initial: forward ? char + ZWJ : null,
    medial: forward ? ZWJ + char + ZWJ : null,
    final: ZWJ + char,
  };
}

function scriptFont(lang) {
  return lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit";
}

// Nastaliq and naskh hang dots and tails well below the baseline — far below
// what the line box reserves. Left alone, ب's dot lands on top of the caption
// underneath it and the divider line above it. Every box holding one of these
// glyphs needs deliberate extra room rather than the default leading.
function glyphBox(lang, fontSize) {
  const rtl = !!lang.rtl;
  return {
    fontSize,
    lineHeight: rtl ? 2.05 : 1.35,
    fontFamily: scriptFont(lang),
    direction: rtl ? "rtl" : "ltr",
    paddingBottom: rtl ? Math.round(fontSize * 0.28) : 0,
  };
}

export function AlphabetLessons({ pack, appState, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const voiceAvailable = hasVoiceFor(lang.ttsCode);
  const sys = pack.scriptSystem || null;

  const [progress, setProgress] = useState(loadProgress());
  const [activeGroup, setActiveGroup] = useState(null);
  const [phase, setPhase] = useState("learn"); // "learn" | "quiz" | "done"
  const [letterIdx, setLetterIdx] = useState(0);

  const groups = pack.alphabetGroups || [];
  const langProgress = progress[pack.code] || {};

  function markDone(id) {
    const next = { ...progress, [pack.code]: { ...(progress[pack.code] || {}), [id]: true } };
    setProgress(next);
    saveProgress(next);
  }

  // Confusable sets that involve at least one letter in the current group, so a
  // warning only appears where it's actually relevant.
  const groupLetters = useMemo(() => {
    if (!activeGroup || activeGroup.synthetic) return [];
    return (pack.alphabet || []).filter((a) => a.group === activeGroup.id);
  }, [activeGroup, pack.alphabet]);

  // -------------------------------------------------------------------------
  // PRIMER — how this writing system works, before any letter
  // -------------------------------------------------------------------------
  if (activeGroup?.id === PRIMER && sys?.primer) {
    return (
      <ScriptPrimer
        primer={sys.primer}
        lang={lang}
        onDone={() => { markDone(PRIMER); setActiveGroup(null); }}
        onBack={() => setActiveGroup(null)}
      />
    );
  }

  // -------------------------------------------------------------------------
  // VOWEL SIGNS — the half of an abugida the letter list leaves out
  // -------------------------------------------------------------------------
  if (activeGroup?.id === VOWELS && sys?.vowelSigns) {
    return (
      <VowelSignLesson
        data={sys.vowelSigns}
        lang={lang}
        voiceAvailable={voiceAvailable}
        onDone={() => { markDone(VOWELS); setActiveGroup(null); }}
        onBack={() => setActiveGroup(null)}
      />
    );
  }

  // -------------------------------------------------------------------------
  // SYLLABLE BLOCKS — Hangul letters are never written in a line
  // -------------------------------------------------------------------------
  if (activeGroup?.id === BLOCKS && sys?.blocks) {
    return (
      <BlockLesson
        data={sys.blocks}
        lang={lang}
        voiceAvailable={voiceAvailable}
        onDone={() => { markDone(BLOCKS); setActiveGroup(null); }}
        onBack={() => setActiveGroup(null)}
      />
    );
  }

  // -------------------------------------------------------------------------
  // GROUP PICKER — primer, letter lessons, then the system lessons
  // -------------------------------------------------------------------------
  if (!activeGroup) {
    const lettersDone = groups.length > 0 && groups.every((g) => langProgress[g.id]);

    return (
      <Container>
        <div style={{ marginBottom: 16 }}>
          <Button variant="ghost" onClick={() => onNavigate("home")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
            ← Back
          </Button>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>
          🔤 Letters &amp; Sounds
        </h1>
        <p style={{ color: "var(--text-dim)", marginBottom: 24, fontSize: 14 }}>
          Learn the script first. Start with how the writing system works, then take
          the letters a handful at a time.
        </p>

        {groups.length === 0 ? (
          /* v90 — THIS USED TO LIE.
             The message was hardcoded to "{lang.name} uses the Latin alphabet,
             so you're already set!" and shown for ANY language with no alphabet
             data. Malayalam, Tamil and Persian all shipped without it, so a
             learner who came specifically to learn to read the script their
             family writes in was told there was nothing to learn and sent away.
             It now checks whether the language is actually Latin-script, and
             says the honest thing when it isn't. */
          <Card style={{ textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>📚</div>
            {LATIN_SCRIPT.has(pack.code) ? (
              <>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{lang.name} uses letters you already read</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  Nothing new to decode here — head back and start on the words.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>The {lang.name} script isn't written up yet</div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  {lang.name} doesn't use the Latin alphabet, so this is a real gap
                  rather than nothing to teach. Every word in the course carries a
                  romanisation, so you can keep learning while this is written.
                </div>
              </>
            )}
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* --- The primer, always open, always first --------------------- */}
            {sys?.primer && (
              <LessonTile
                emoji="🧭"
                kicker="Start here"
                title={sys.primer.title}
                subtitle={langProgress[PRIMER] ? "Read · tap to read again" : sys.primer.tagline}
                completed={!!langProgress[PRIMER]}
                unlocked
                onClick={() => setActiveGroup({ id: PRIMER, synthetic: true })}
              />
            )}

            {/* --- The letters ---------------------------------------------- */}
            {groups.map((g, i) => {
              const isCompleted = !!langProgress[g.id];
              const isUnlocked = i === 0 || langProgress[groups[i - 1].id];
              const count = (pack.alphabet || []).filter((a) => a.group === g.id).length;
              return (
                <LessonTile
                  key={g.id}
                  emoji={g.emoji}
                  kicker={`Lesson ${i + 1}`}
                  title={g.title}
                  subtitle={
                    !isUnlocked ? "Complete the previous lesson to unlock"
                      : isCompleted ? `${count} letter${count === 1 ? "" : "s"} · Complete`
                      : `${count} letter${count === 1 ? "" : "s"} · ${g.description}`
                  }
                  completed={isCompleted}
                  unlocked={isUnlocked}
                  onClick={() => { setActiveGroup(g); setLetterIdx(0); setPhase("learn"); }}
                />
              );
            })}

            {/* --- The system lessons: the part that makes letters into words -
                Deliberately AFTER the letters, because they operate on letters
                the learner has by then actually met. */}
            {sys?.vowelSigns && (
              <LessonTile
                emoji="✏️"
                kicker="Putting it together"
                title="Vowel signs"
                subtitle={
                  !lettersDone ? "Finish the letters to unlock"
                    : langProgress[VOWELS] ? `${sys.vowelSigns.signs.length} signs · Complete`
                    : `${sys.vowelSigns.signs.length} signs · How ${sys.vowelSigns.demo} becomes ${sys.vowelSigns.signs[0].combined}`
                }
                completed={!!langProgress[VOWELS]}
                unlocked={lettersDone}
                onClick={() => setActiveGroup({ id: VOWELS, synthetic: true })}
              />
            )}

            {sys?.blocks && (
              <LessonTile
                emoji="🧱"
                kicker="Putting it together"
                title="Building syllable blocks"
                subtitle={
                  !lettersDone ? "Finish the letters to unlock"
                    : langProgress[BLOCKS] ? `${sys.blocks.patterns.length} patterns · Complete`
                    : `${sys.blocks.patterns.length} patterns · Letters stack into squares`
                }
                completed={!!langProgress[BLOCKS]}
                unlocked={lettersDone}
                onClick={() => setActiveGroup({ id: BLOCKS, synthetic: true })}
              />
            )}
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
    const forms = sys?.joining ? joinedForms(letter.char, sys.joining.nonConnectors) : null;
    const confusable = (sys?.confusables || []).find((c) => c.chars.includes(letter.char));

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

        <div style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 800, letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
          ✨ {activeGroup.title.toUpperCase()}
        </div>

        {/* The letter card — letter sits in a fixed-height container so
            decorative curves of Arabic/Nastaliq scripts don't crowd siblings */}
        <Card className="pop" style={{ textAlign: "center", padding: "28px 24px 32px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: lang.rtl ? 210 : 160,
            marginBottom: 24,
          }}>
            <div style={{ fontWeight: 900, ...glyphBox(lang, 120) }}>
              {letter.char}
            </div>
          </div>
          <div style={{
            height: 1,
            background: "var(--border)",
            margin: "0 auto 16px",
            width: 60,
          }} />
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--primary-text)", marginBottom: 8 }}>
            {letter.name}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-dim)", fontStyle: "italic" }}>
            sounds like: <span style={{ color: "var(--accent-text)", fontWeight: 700 }}>{letter.sound}</span>
          </div>
          {letter.note && (
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 12, lineHeight: 1.5 }}>
              {letter.note}
            </div>
          )}
        </Card>

        {/* --- JOINED FORMS ------------------------------------------------
            The reason this exists: every letter used to be shown alone, and no
            Arabic-script word is written that way. */}
        {forms && (
          <Card style={{ marginTop: 14, padding: "16px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "var(--accent-text)", textTransform: "uppercase", marginBottom: 4 }}>
              In a word
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
              {forms.initial
                ? "This letter changes shape depending on where it sits. Same letter every time."
                : `${letter.name} never joins to the letter after it — so the next letter always starts fresh.`}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${forms.initial ? 4 : 2}, 1fr)`,
              gap: 8,
              direction: "ltr",
            }}>
              {[
                ["Alone", forms.isolated],
                ["Start", forms.initial],
                ["Middle", forms.medial],
                ["End", forms.final],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label} style={{
                  background: "var(--surface-hi)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "10px 4px 8px",
                  textAlign: "center",
                }}>
                  <div style={{ minHeight: 76, ...glyphBox(lang, 40) }}>
                    {val}
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* --- DON'T MIX IT UP --------------------------------------------- */}
        {confusable && (
          <Card style={{ marginTop: 14, padding: "16px 14px", borderColor: "var(--accent)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "var(--accent-text)", textTransform: "uppercase", marginBottom: 10 }}>
              ⚠️ Don't mix these up
            </div>
            <div style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              marginBottom: 12,
              flexWrap: "wrap",
              direction: "ltr",
            }}>
              {confusable.chars.map((c) => (
                <div key={c} style={{
                  ...glyphBox(lang, 34),
                  minWidth: 54,
                  textAlign: "center",
                  padding: "4px 8px",
                  borderRadius: 10,
                  background: c === letter.char ? "var(--primary-soft)" : "var(--surface-hi)",
                  border: `2px solid ${c === letter.char ? "var(--primary)" : "var(--border)"}`,
                }}>
                  {c}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.55 }}>
              {confusable.tell}
            </div>
          </Card>
        )}

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
  // QUIZ PHASE
  // -------------------------------------------------------------------------
  if (phase === "quiz") {
    return (
      <AlphabetQuiz
        letters={groupLetters}
        lang={lang}
        voiceAvailable={voiceAvailable}
        onComplete={(passed) => {
          if (passed) {
            markDone(activeGroup.id);
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
            <Button onClick={() => { setActiveGroup(null); setPhase("learn"); }}>
              Back to lessons →
            </Button>
          )}
        </div>
      </Container>
    );
  }

  return null;
}

// =============================================================================
// LessonTile — one row in the lesson list
// =============================================================================
function LessonTile({ emoji, kicker, title, subtitle, completed, unlocked, onClick }) {
  return (
    <button
      disabled={!unlocked}
      onClick={onClick}
      style={{
        background: completed ? "var(--primary-soft)" : "var(--surface)",
        border: `2px solid ${completed ? "var(--primary)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: 16,
        cursor: unlocked ? "pointer" : "not-allowed",
        opacity: unlocked ? 1 : 0.55,
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
        background: completed ? "var(--primary)" : "var(--surface-hi)",
        color: completed ? "#fff" : "var(--text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        flexShrink: 0,
      }}>
        {!unlocked ? "🔒" : completed ? "✓" : emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>
          {kicker}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{subtitle}</div>
      </div>
      {unlocked && <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.7 }}>→</div>}
    </button>
  );
}

// =============================================================================
// ScriptPrimer — how the writing system works, before letter one.
//
// This is the screen the app never had. Someone opening a Malayalam or Urdu
// course has no idea that consonants carry a vowel, or that letters change
// shape, and every letter they then learn is filed in the wrong drawer.
// =============================================================================
function ScriptPrimer({ primer, lang, onDone, onBack }) {
  return (
    <Container style={{ paddingBottom: 140 }}>
      <div style={{ marginBottom: 16 }}>
        <Button variant="ghost" onClick={onBack} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
          ← Lessons
        </Button>
      </div>

      <div style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>
        🧭 START HERE
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>{primer.title}</h1>
      <p style={{ color: "var(--text-dim)", marginBottom: 22, fontSize: 15, lineHeight: 1.5 }}>
        {primer.tagline}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {primer.facts.map((f, i) => (
          <Card key={i} style={{ padding: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              flexShrink: 0,
              background: "var(--surface-hi)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontFamily: scriptFont(lang),
            }}>
              {f.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 3 }}>{f.label}</div>
              <div style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.55 }}>{f.text}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: 14, padding: 18, borderColor: "var(--accent)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "var(--accent-text)", textTransform: "uppercase", marginBottom: 8 }}>
          The hard part
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{primer.hardest}</div>
      </Card>

      <Card style={{ marginTop: 12, padding: 18, background: "var(--primary-soft)", borderColor: "var(--primary)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "var(--primary-text)", textTransform: "uppercase", marginBottom: 8 }}>
          And the good news
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{primer.firstWin}</div>
      </Card>

      <div style={{ marginTop: 20, marginBottom: 140 }}>
        <Button onClick={onDone}>Got it — show me the letters →</Button>
      </div>
    </Container>
  );
}

// =============================================================================
// VowelSignLesson — the missing half of every abugida.
//
// The letter list taught ക and called it "ka". It is "ka", and that is exactly
// the problem: there is no bare "k" in the chart, and no way to write "ki"
// without a mark nobody had shown the learner.
// =============================================================================
function VowelSignLesson({ data, lang, voiceAvailable, onDone, onBack }) {
  const [idx, setIdx] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const sign = data.signs[idx];
  const isLast = idx === data.signs.length - 1;

  if (quiz) {
    return (
      <CombinedQuiz
        signs={data.signs}
        demo={data.demo}
        lang={lang}
        voiceAvailable={voiceAvailable}
        onComplete={(passed) => { if (passed) onDone(); else { setIdx(0); setQuiz(false); } }}
        onBack={() => setQuiz(false)}
      />
    );
  }

  return (
    <Container style={{ paddingBottom: 140 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="ghost" onClick={onBack} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
          ← Lessons
        </Button>
        <div style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 700 }}>
          {idx + 1} / {data.signs.length}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <ProgressBar value={idx + 1} max={data.signs.length} />
      </div>

      <div style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 800, letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
        ✏️ VOWEL SIGNS
      </div>

      {idx === 0 && (
        <Card style={{ marginBottom: 12, padding: 16 }}>
          <div style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{data.note}</div>
        </Card>
      )}

      {/* consonant + sign = syllable */}
      <Card className="pop" style={{ textAlign: "center", padding: "26px 18px 30px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20,
        }}>
          <Piece value={data.demo} caption={data.demoName} />
          <div style={{ fontSize: 30, fontWeight: 900, color: "var(--text-dim)" }}>+</div>
          <Piece value={sign.sign} caption="the sign" dashed />
          <div style={{ fontSize: 30, fontWeight: 900, color: "var(--text-dim)" }}>=</div>
          <Piece value={sign.combined} caption={sign.reads} highlight />
        </div>

        <div style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "var(--accent-text)",
          background: "var(--surface-hi)",
          border: "1px solid var(--border)",
          borderRadius: 999,
          padding: "4px 12px",
          marginBottom: 12,
        }}>
          goes {sign.where}
        </div>

        <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55 }}>{sign.hint}</div>
      </Card>

      {voiceAvailable && (
        <Button
          variant="secondary"
          style={{ marginTop: 14 }}
          onClick={() => speak(sign.combined, lang.ttsCode)}
        >
          🔊 Hear {sign.reads}
        </Button>
      )}

      <div style={{ marginTop: 14, marginBottom: 140 }}>
        <Button onClick={() => (isLast ? setQuiz(true) : setIdx(idx + 1))}>
          {isLast ? "Take the quiz →" : "Next sign →"}
        </Button>
      </div>
    </Container>
  );
}

function Piece({ value, caption, highlight, dashed }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: 54,
        lineHeight: 1.35,
        minWidth: 78,
        minHeight: 88,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 10px",
        borderRadius: 14,
        background: highlight ? "var(--primary-soft)" : "var(--surface-hi)",
        border: `2px ${dashed ? "dashed" : "solid"} ${highlight ? "var(--primary)" : "var(--border)"}`,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-dim)", marginTop: 6 }}>{caption}</div>
    </div>
  );
}

// =============================================================================
// BlockLesson — Hangul letters are never written in a line.
// =============================================================================
function BlockLesson({ data, lang, voiceAvailable, onDone, onBack }) {
  const [idx, setIdx] = useState(0);
  const b = data.patterns[idx];
  const isLast = idx === data.patterns.length - 1;

  return (
    <Container style={{ paddingBottom: 140 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="ghost" onClick={onBack} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
          ← Lessons
        </Button>
        <div style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 700 }}>
          {idx + 1} / {data.patterns.length}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <ProgressBar value={idx + 1} max={data.patterns.length} />
      </div>

      <div style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 800, letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
        🧱 SYLLABLE BLOCKS
      </div>

      {idx === 0 && (
        <Card style={{ marginBottom: 12, padding: 16 }}>
          <div style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{data.note}</div>
        </Card>
      )}

      <Card className="pop" style={{ textAlign: "center", padding: "26px 18px 30px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-text)", marginBottom: 18 }}>
          {b.shape}
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 20,
        }}>
          {b.parts.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-dim)" }}>+</div>}
              <Piece value={p} caption="" />
            </React.Fragment>
          ))}
          <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-dim)" }}>=</div>
          <Piece value={b.result} caption={b.reads} highlight />
        </div>
        <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, textAlign: "left" }}>{b.why}</div>
      </Card>

      {voiceAvailable && (
        <Button variant="secondary" style={{ marginTop: 14 }} onClick={() => speak(b.result, lang.ttsCode)}>
          🔊 Hear it
        </Button>
      )}

      <div style={{ marginTop: 14, marginBottom: 140 }}>
        <Button onClick={() => (isLast ? onDone() : setIdx(idx + 1))}>
          {isLast ? "Finish →" : "Next pattern →"}
        </Button>
      </div>
    </Container>
  );
}

// =============================================================================
// CombinedQuiz — read a syllable you have never been shown as a whole.
// =============================================================================
function CombinedQuiz({ signs, demo, lang, voiceAvailable, onComplete, onBack }) {
  const questions = useMemo(() => {
    const sample = [...signs].sort(() => Math.random() - 0.5).slice(0, Math.min(4, signs.length));
    return sample.map((s) => {
      const distractors = signs.filter((x) => x.combined !== s.combined).sort(() => Math.random() - 0.5).slice(0, 3);
      return { answer: s, options: [s, ...distractors].sort(() => Math.random() - 0.5) };
    });
  }, [signs]);

  return (
    <QuizRunner
      questions={questions}
      lang={lang}
      voiceAvailable={voiceAvailable}
      kicker="⚡ READ IT"
      prompt="What does this syllable read as?"
      renderStimulus={(q) => q.answer.combined}
      speakText={(q) => q.answer.combined}
      optionKey={(o) => o.combined}
      renderOption={(o) => (
        <>
          <div style={{ fontWeight: 800 }}>{o.reads}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{o.hint}</div>
        </>
      )}
      answerLabel={(o) => o.reads}
      onComplete={onComplete}
      onBack={onBack}
    />
  );
}

// =============================================================================
// AlphabetQuiz — now runs in BOTH directions.
//
// It only ever asked "what sound does this letter make?", which is recognition.
// Half the questions now go the other way — you are given the sound and have to
// find the letter, which is what reading actually asks of you.
// =============================================================================
function AlphabetQuiz({ letters, lang, voiceAvailable, onComplete, onBack }) {
  const questions = useMemo(() => {
    const sample = [...letters].sort(() => Math.random() - 0.5).slice(0, Math.min(4, letters.length));
    return sample.map((letter, i) => {
      const distractors = letters.filter((l) => l.char !== letter.char).sort(() => Math.random() - 0.5).slice(0, 3);
      return {
        answer: letter,
        options: [letter, ...distractors].sort(() => Math.random() - 0.5),
        // Alternate direction, so a group always exercises both.
        reverse: i % 2 === 1 && letters.length > 1,
      };
    });
  }, [letters]);

  return (
    <QuizRunner
      questions={questions}
      lang={lang}
      voiceAvailable={voiceAvailable}
      kicker="⚡ QUIZ"
      prompt={(q) => (q.reverse ? "Which letter makes this sound?" : "What sound does this letter make?")}
      renderStimulus={(q) => (q.reverse ? null : q.answer.char)}
      renderStimulusText={(q) => (q.reverse ? q.answer.sound : null)}
      speakText={(q) => q.answer.char}
      optionKey={(o) => o.char}
      renderOption={(o, q) =>
        q.reverse ? (
          <div style={{ ...glyphBox(lang, 34), textAlign: lang.rtl ? "right" : "left" }}>
            {o.char}
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 800 }}>{o.name}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>sounds like: {o.sound}</div>
          </>
        )
      }
      answerLabel={(o) => o.name}
      onComplete={onComplete}
      onBack={onBack}
    />
  );
}

// =============================================================================
// QuizRunner — shared machinery for the letter quiz and the syllable quiz.
// =============================================================================
function QuizRunner({
  questions, lang, voiceAvailable, kicker, prompt,
  renderStimulus, renderStimulusText, speakText,
  optionKey, renderOption, answerLabel,
  onComplete, onBack,
}) {
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;
  if (!q) return null;

  const stimulus = renderStimulus(q);
  const stimulusText = renderStimulusText ? renderStimulusText(q) : null;
  const promptText = typeof prompt === "function" ? prompt(q) : prompt;

  function check() {
    if (!picked) return;
    const isCorrect = optionKey(picked) === optionKey(q.answer);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (isLast) {
      onComplete(correctCount / questions.length >= 0.75);
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

      <div style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 800, letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
        {kicker}
      </div>

      <Card style={{ textAlign: "center", padding: "24px 20px" }}>
        <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 16 }}>{promptText}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: lang.rtl ? 180 : 130 }}>
          {stimulus ? (
            <div style={{ fontWeight: 900, ...glyphBox(lang, 100) }}>
              {stimulus}
            </div>
          ) : (
            <div style={{ fontSize: 30, fontWeight: 800, color: "var(--accent-text)", fontStyle: "italic", padding: "0 12px" }}>
              “{stimulusText}”
            </div>
          )}
        </div>
        {voiceAvailable && speakText(q) && (
          <Button
            variant="ghost"
            style={{ marginTop: 8, fontSize: 14 }}
            onClick={() => speak(speakText(q), lang.ttsCode)}
          >
            🔊 Hear it
          </Button>
        )}
      </Card>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          const isAnswer = feedback && optionKey(opt) === optionKey(q.answer);
          const isWrong = feedback && picked && optionKey(opt) === optionKey(picked) && optionKey(opt) !== optionKey(q.answer);
          const isPicked = picked && optionKey(picked) === optionKey(opt);
          return (
            <button
              key={i}
              onClick={() => !feedback && setPicked(opt)}
              style={{
                background: isAnswer ? "var(--primary-dark)" : isWrong ? "var(--miss)" : isPicked ? "var(--surface-hi)" : "var(--surface)",
                border: `2px solid ${isAnswer ? "var(--primary)" : isWrong ? "var(--miss)" : isPicked ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 12,
                padding: 14,
                color: isAnswer ? "var(--on-primary-dark)" : isWrong ? "var(--on-miss)" : "var(--text)",
                fontSize: 16,
                fontWeight: 700,
                cursor: feedback ? "default" : "pointer",
                textAlign: "left",
              }}
            >
              {renderOption(opt, q)}
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
            {feedback === "correct" ? "✓ Correct!" : `✗ The answer was ${answerLabel(q.answer)}`}
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
