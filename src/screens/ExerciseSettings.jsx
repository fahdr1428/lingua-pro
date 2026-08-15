// =============================================================================
// EXERCISE SETTINGS (v76) — turn off the question types that don't suit you.
//
// WHY THIS EXISTS. Some exercise types are a wall rather than a challenge, and
// which ones depends entirely on the person and the moment: listening questions
// on a device with no voice for the language, typing on a phone in a script you
// have no keyboard for, speaking out loud on a train. Before this the only
// options were to endure them or stop using the app, and people choose the
// second one.
//
// TWO GUARDRAILS:
//   - Recognition and recall can't be switched off. They're what a vocabulary
//     course IS; without them there's no lesson, only a slideshow.
//   - Turning something off narrows what you practise, and the screen says so
//     plainly rather than pretending the choice is free.
// =============================================================================

import React from "react";
import { EXERCISE } from "../engine/generator.js";

const TOGGLEABLE = [
  {
    id: EXERCISE.LISTEN_PICK,
    label: "Listening",
    blurb: "Hear the word, pick what it means",
    offNote: "Useful to turn off if this device has no voice for your language.",
  },
  {
    id: EXERCISE.SPEAK_PROMPT,
    label: "Speaking out loud",
    blurb: "Say the word; graded leniently by ear",
    offNote: "Turn off when you can't talk. It's the fastest way to learn, so turn it back on when you can.",
  },
  {
    id: EXERCISE.TYPE_TRANSLATION,
    label: "Typing",
    blurb: "Type the meaning in English",
    offNote: "Fine to turn off on a phone.",
  },
  {
    id: EXERCISE.LETTER_SCRAMBLE,
    label: "Spelling",
    blurb: "Build the word from shuffled letters",
    offNote: "Hard in a script you're still learning to read.",
  },
  {
    id: EXERCISE.BUILD_SENTENCE,
    label: "Building sentences",
    blurb: "Tap words into the right order",
    offNote: "The hardest type, and the one that teaches word order.",
  },
  {
    id: EXERCISE.MATCH_PAIRS,
    label: "Matching pairs",
    blurb: "Pair four words with four meanings",
    offNote: "",
  },
  {
    id: EXERCISE.ODD_ONE_OUT,
    label: "Odd one out",
    blurb: "Spot the word that doesn't belong",
    offNote: "",
  },
  {
    id: EXERCISE.CONJUGATE,
    label: "Verb forms",
    blurb: "Pick the right form for I / you / we",
    offNote: "Only appears for languages with conjugation tables.",
  },
];

export function ExerciseSettings({ appState, setAppState }) {
  const off = new Set(appState?.disabledExercises || []);

  function toggle(id) {
    setAppState((s) => {
      const next = new Set(s.disabledExercises || []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...s, disabledExercises: [...next] };
    });
  }

  const offCount = off.size;

  return (
    <div className="exercise-settings">
      <h3 className="eyebrow" style={{ marginTop: 24, marginBottom: 4 }}>Question types</h3>
      <p className="brief-note" style={{ marginBottom: 12 }}>
        Turn off anything that gets in your way rather than pushing you. Picking
        the meaning and picking the word always stay on — without them there's no
        lesson.
      </p>

      <div className="voice-block">
        {TOGGLEABLE.map((t) => {
          const enabled = !off.has(t.id);
          return (
            <div className="ex-row" key={t.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ex-label">{t.label}</div>
                <div className="ex-blurb">{enabled ? t.blurb : (t.offNote || "Switched off.")}</div>
              </div>
              <button
                className={`ex-toggle${enabled ? " ex-on" : ""}`}
                role="switch"
                aria-checked={enabled}
                aria-label={`${t.label}: ${enabled ? "on" : "off"}`}
                onClick={() => toggle(t.id)}
              >
                <span className="ex-knob" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="brief-note">
        {offCount === 0
          ? "Everything on — you'll meet every kind of question."
          : `${offCount} turned off. Your lessons will be narrower, which is a real trade: the types you've switched off are the ones you'll get least practice at.`}
      </div>
    </div>
  );
}
