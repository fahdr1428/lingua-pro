# v74 — Urdu speaking was broken, and the voice was unpleasant

Two reports, both correct, both traced to real defects rather than taste.

---

## 1. "The Urdu one and some other languages, Speak doesn't work"

It didn't. **Every Urdu speaking attempt scored 0.00**, including perfect ones.

### What was happening

`speech.js` assumed no browser ships an Urdu recogniser, so it listened in
`hi-IN` instead. Chrome obliged and returned a transcript — **in Devanagari**.
The grader then compared `अस्सलाम ओ अलैकुम` against the Urdu target
`السلام علیکم` and its transliteration `assalam o alaikum`, found nothing in
common with either, and failed it.

Punjabi failed identically: it's rendered here in Shahmukhi (Arabic script) and
was also being listened to in Hindi.

```
before:  "अस्सलाम ओ अलैकुम"  →  0.00  miss
after:   "अस्सलाम ओ अलैकुम"  →  1.00  got
```

### The fix, in three parts

**Ask for the real language first** (`recognitionLocales`). Chrome does ship
Urdu. There is no way to feature-detect language support — the API accepts any
tag and only complains when it starts — so we request `ur-PK`, and if the
browser actually rejects it with `language-not-supported`, `startListening`
silently retries on `hi-IN` without showing the learner an error they can do
nothing about.

**A romanisation bridge** (`src/audio/romanise.js`). Whatever script comes back
is reduced to a rough Latin phonetic skeleton and scored against the
transliteration we already ship. Covers Devanagari, Arabic/Urdu, Bengali and
Gurmukhi. It is applied *in addition to* the existing comparisons and the best
score wins, so an approximate mapping can only help — it can't make a
previously-passing attempt fail. Schwa deletion is implemented properly
(शुक्रिया is "shukriya", not "shukriyaa"); without it every word gained a
trailing vowel and perfect attempts landed at 0.69, one hundredth under the
pass mark.

**Vowel-length folding** (`foldVowels`). Transliteration has no standard: our
packs write `paani`, a faithful romanisation writes `paanee`, a learner types
`pani`. Same word, same sound. All three now fold to `pani` and compare equal.
Applied as an extra comparison on both sides, never as a replacement.

### The second half of the same bug

Fixing the score wasn't enough. The word-level diagnostics — which words were
missing, feeding the "you left out a whole word" cap — still compared the raw
Urdu script against the raw Devanagari transcript, so every word looked missing
and the cap pulled a perfect attempt back under the pass mark anyway.
`scoreAttempt` now tracks the pair of strings that actually produced the score
separately from the pair the learner is *shown*, and the diagnostics use the
former. The learner still sees the real transcript and the real target — the
internal skeleton is never displayed, and there's a test asserting exactly that.

---

## 2. "The AI agent is so rough and scary"

Also our fault, and also a specific line of code.

`pickVoice()` preferred `localService` voices to avoid a network round trip. On
a great many machines the local English voice is an old formant synthesiser —
eSpeak, Pico, "compact" — which is precisely the flat robotic growl people mean.
Chrome ships far more natural network voices right alongside it, and we were
actively skipping them to save a few hundred milliseconds.

**Naturalness now ranks first**, locality only as a tiebreak between voices of
equal quality (`src/audio/voices.js`). Voice names matching `natural`, `neural`,
`online`, `google`, `siri`, `premium`, `enhanced` rank up; `espeak`, `compact`,
`pico`, `festival`, `flite`, `eloquence` rank down. Both speech paths — the
coach's English narration and the target language — go through the same ranking
now, so they can't drift apart.

### And the learner decides

> "let the user decide what tone voice they want talking back to them"

A **Voice** section in Settings:

- **Tone** — Warm, Neutral, Calm, Bright. Plain words, not pitch numbers.
  Tapping one plays it immediately.
- **Speed** — 70–130%, previewing when you let go of the slider.
- **Coaching voice** — the actual list of English voices on the device, ranked
  best-first, with Preview.
- **{Language} voice** — the same for the language being learned, remembered
  per language. If the device has none, it says so and explains that adding the
  language in the OS usually installs one.

Nothing is chosen blind: every control previews on the spot.

And in the live conversation, a **"Talk to me like a…"** row lets you switch
between the five personas mid-session without going to Settings — changing it
restarts the conversation, because a partner who changes character halfway
through is more confusing than starting again.

---

## Honest limitations

- Speech recognition is still Chrome/Edge/Safari only. Firefox has none, and the
  app falls back to typing with identical grading.
- The romanisation is **deliberately approximate**. It exists to give the scorer
  something comparable and is never shown to a learner. Arabic script doesn't
  write short vowels, so an Arabic-script target reduces to a consonant skeleton
  — good enough for the character-similarity half of the scorer, not a
  transliteration standard.
- Where the recogniser genuinely has no locale for a language, the transcript is
  still a phonetic approximation from a neighbouring language. It scores fairly
  now; it isn't magic.
- One case remains at "close" rather than "got": Devanagari श्री romanises to
  `shri` against the `sri` in our Punjabi transliteration. That's a real spelling
  variant, and "close" is the honest verdict.

---

## Verification

```sh
npm run check
```

- `scripts/test-speech.mjs` — **31 cases**, including 9 new cross-script ones
  that were guaranteed failures before this change, and 4 negatives proving the
  bridge doesn't turn wrong answers into passes. Plus assertions that the
  transcript shown back is the real one and not the skeleton, and that Urdu asks
  for `ur-PK` before `hi-IN`.
- `scripts/test-engine.mjs` — **89 assertions**, now including voice ranking
  (a natural network voice must beat a local formant synthesiser), tone/speed
  clamping, and the romanisation rules (schwa deletion, virama, nukta letters,
  vowel folding).
- `scripts/verify-browser.mjs` — **91 assertions** in headless Chromium,
  including two new passes over the voice settings: one with a faked device
  voice list containing a robotic local voice next to a natural network one
  (asserting the natural one is offered above it, and that the choice persists),
  and one with no voices at all (asserting it says so rather than showing an
  empty picker).
