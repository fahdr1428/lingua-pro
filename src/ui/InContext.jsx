// =============================================================================
// InContext — one word, inside a real sentence, with the word picked out.
//
// v103: lifted out of Lesson.jsx, unchanged. Three surfaces show a learner an
// example sentence — the new-word preview card, the line under every answer,
// and the back of a flashcard — and each of the two that came later rendered
// the sentence by hand instead of reusing this, and each lost something doing
// it. The answer footer dropped the romanisation and the dir attribute, so in
// eleven languages it showed unreadable script and in three of those the bidi
// algorithm scrambled the line. The flashcard dropped the sentence entirely
// and showed only its English gloss — the exact thing v79 wrote this component
// to stop. One component, so there is one place for that to be right.
//
// WHY IT LOOKS LIKE THIS (v79)
//
// A word learned as a pair — "kitaab = book" — is a fact about a dictionary. A
// word seen doing a job in a sentence is a piece of the language. The second one
// survives contact with a native speaker talking at normal speed; the first one
// mostly doesn't.
//
// The highlight is a substring match on the lemma, matched case-insensitively —
// packs store "Ser" as the dictionary form and write "yo soy" or "es" in the
// sentence, and an exact match found the word in only 65% of entries against
// 82% this way. Spanish went from 47% to 88%, French 46% to 90%. It's the
// SENTENCE's own text that gets rendered, never the lemma's, so a capitalised
// dictionary form can't appear mid-sentence where the real word is lower case.
//
// It FAILS SOFTLY on purpose. In an inflected language the example often carries
// a conjugated or declined form that doesn't contain the dictionary form at all,
// and in Japanese and Chinese there are no word boundaries to match on — those
// two sit around 50% and always will. When the match fails the sentence renders
// plain, rather than the app guessing at morphology and highlighting half a word,
// which would teach something false.
// =============================================================================

import React from "react";
import { speak } from "../audio/tts.js";

export function InContext({ example, lemma, lang, isNonLatin, voiceAvailable }) {
  const native = example.native || "";
  const at = lemma && lemma.length > 1
    ? native.toLowerCase().indexOf(lemma.toLowerCase())
    : -1;
  const found = at >= 0;
  // Sliced out of the sentence, so the casing shown is the sentence's own.
  const asWritten = found ? native.slice(at, at + lemma.length) : "";

  return (
    <button
      className="in-context"
      onClick={(e) => {
        e.stopPropagation(); // the card itself flips on click
        if (voiceAvailable) speak(native, lang.ttsCode, { code: lang.code, translit: example.translit });
      }}
      aria-label={voiceAvailable ? "Hear this sentence" : "Example sentence"}
    >
      <span className="in-context-tag">
        {voiceAvailable ? "how it's actually used ▸ tap to hear" : "how it's actually used"}
      </span>
      <span className="in-context-native" dir={lang.rtl ? "rtl" : "ltr"} lang={lang.code}>
        {found ? (
          <>
            {native.slice(0, at)}
            <mark className="in-context-mark">{asWritten}</mark>
            {native.slice(at + lemma.length)}
          </>
        ) : (
          native
        )}
      </span>
      {isNonLatin && example.translit && (
        <span className="in-context-tl" data-translit>{example.translit}</span>
      )}
      <span className="in-context-en">{example.translation}</span>
    </button>
  );
}
