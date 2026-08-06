# v75 — lesson defects, Urdu audio, Arabic dialects, German, and skipping ahead

Five things asked for. All five done, plus the bugs found while looking.

---

## 1. "Sometimes the lessons are crashing"

"Sometimes" is the hard part — it means a specific combination of language,
progress state and exercise type that clicking around won't reproduce. So I built
a fuzz (`scripts/test-lessons.mjs`) that generates **85,000+ exercises** across
every language pack, every mode and five progress states, and asserts the exact
contract `Lesson.jsx` relies on.

It found four defects — and driving real lessons in a browser found a fifth,
which is the one people were actually seeing:

**0. Every lesson that ended with a speaking prompt ended in an error screen.**
Since v70 the generator appends the SPEAK_PROMPT last. But that exercise —
along with the grammar moment and the intro flashcards — advanced with a bare
`setIdx(i => i + 1)`, skipping the end-of-lesson check that lives in `next()`.
Finishing the last exercise stepped past the end of the list, the renderer got
`undefined`, and the learner saw **"Hmm, something odd happened"** instead of
their results: no summary, no XP, no streak, no SRS update for the session. It
reproduced in **20 of the 56** language/progress combinations the browser
harness plays. Everything that moves a lesson forward now goes through one
`advance()` that ends the lesson properly when it's the last exercise.

**A. MATCH_PAIRS could be unwinnable — this is the one that reads as a crash.**
The exercise pairs words with meanings by tapping the meaning column. When two
words in the set shared a translation, one pair became permanently unmatchable:
the Check button never enabled and there was no way forward. Mid-lesson, with no
error message, that is indistinguishable from the app breaking. Pairs are now
deduped by meaning before the set is chosen.

**B. Questions could offer the same answer twice.** Distractors were deduped by
word id, not by the label the option actually renders with. Arabic has more than
one word for "tomorrow" and the pack lists both, so a question showed "tomorrow"
twice — and tapping the *wrong* identical option was marked wrong and cost a
heart. There was no way to be right. Both distractor pickers now dedupe by what
the learner sees, and each exercise type passes the label its options render with
(translation for meaning-picking, lemma for word-picking).

**C. TRUE_FALSE could be unanswerable.** The "lie" was taken as the first
distractor without checking it differed from the truth. When it didn't, the claim
shown was actually true while the graded answer was "False".

**D. `generateLesson` threw on `null` progress.** A JavaScript default parameter
only applies to `undefined`, so an explicit `null` — which is what an in-flight
storage read hands over — sailed through and threw on the first lookup.

A second harness (`scripts/verify-lessons-browser.mjs`) then plays real lessons
in headless Chromium across every language and progress level, tapping options,
word banks and match grids, watching for a `pageerror`, the error boundary, or a
screen with nothing tappable on it.

---

## 2. "The Urdu sound isn't working, alongside others"

It wasn't. **There are no recorded audio files for Urdu or Turkish**, so both
depended entirely on a browser voice for their locale — and most devices have no
`ur-PK` voice at all. The audio button produced no sound, no message, and no way
to tell a broken app from a quiet one.

**The fix that actually works:** Urdu and Hindi are the same spoken language. A
Hindi voice pronounces Urdu correctly — it simply cannot read the Perso-Arabic
script. Every word in the packs ships with a Latin transliteration, so v75 adds
`toDevanagari()` and hands the converted text to a `hi-IN` voice. Punjabi (written
here in Shahmukhi) takes the same route.

```
salaam       → सलाम
shukriya     → शुक्रिया
khuda hafiz  → खुदा हफ़िज़
mera naam    → मेरा नाम
```

The conversion handles the two things that matter for a TTS engine: consonant
clusters get a virama, and a word-final "a" becomes a long vowel rather than the
inherent one — otherwise Hindi TTS schwa-deletes it and says "shukriy".

Playback is now a four-tier chain: recorded MP3 → a real voice for the language →
a near-language voice reading converted text → nothing, *and the UI says so*.

Turkish needs none of this — `tr-TR` ships on most systems — but it had no
recorded audio either, and now correctly reports what it can and can't do.

---

## 3. Arabic dialects — and German ones

"Arabic" was three options. It's now seven, because a learner heading to
Casablanca and one heading to Kuwait need genuinely different things, and MSA —
which is what most courses teach — is nobody's mother tongue:

**Modern Standard · Egyptian · Levantine · Gulf (Khaleeji) · Maghrebi (Darija) ·
Iraqi · Sudanese**

Each carries concrete vocabulary and phonology a speaker from that place would
recognise, not adjectives. The Maghrebi note says plainly that Darija is hard for
Arabic speakers from the east to follow — that's a real fact about the language,
not a failing on the learner's part, and pretending otherwise sets them up badly.

German gets **Germany / Austria / Switzerland**, with the Swiss note making clear
that Swiss Standard German is what's *written*, while everyday speech is Swiss
German dialect — a different thing again.

And the choice moved. It used to be buried in the mission brief; it's now a
standing preference in Settings that every conversation reads, stored per
language on the learner profile.

---

## 4. German

A full pack: **157 words across 13 units**, each with a pronunciation guide and a
worked example sentence, plus:

- **A guide** — Matthias from Leipzig, who repairs second-hand bicycles.
- **A 12-stop journey** across 4 chapters, every line checked against the pack's
  own vocabulary, with verb-second order observed and a consistent du/Sie register
  inside each exchange.
- **10 culture notes**: Sie until you're invited to du; greeting the room rather
  than the person; why directness isn't rudeness; Anmeldung and the Termin;
  Moin vs Servus vs Grüß Gott placing you on a map.
- **5 frameworks** covering the things that actually block learners: der/die/das,
  verb-second, verb-to-the-end after weil/dass, du vs Sie, and separable verbs.
- **A sound guide** for the parts English speakers get wrong: ä/ö/ü, ß, ei vs ie,
  sp-/st- at the start of a word, v as "f", w as "v", z as "ts".

---

## 5. Skipping ahead

Someone who grew up hearing a language, or did two years of it at school, opens
the app and is asked to learn "hello". They don't stay. The old test-out covered
a single unit and sampled the whole pack at random — that's a placement quiz, not
an answer to "can I skip **this** chapter".

New **Skip ahead** screen: per chapter, a test drawn only from that chapter's own
words, asked in **both directions** so recognition alone isn't a pass. Pass it and
the words are seeded as known and the chapter is marked passed, unlocking the next
one through the same gate a real exam pass uses.

**The bar is 85%, against 70% for a normal chapter exam.** Failing an exam costs
you a retry; skipping a chapter you don't actually know costs you the next twenty
lessons, because everything after it assumes those words. Asymmetric risk,
asymmetric bar.

On a fail it names the words that let you down and offers to learn them properly,
rather than reporting a bare percentage.

---

## Verification

```sh
npm run check    # validators + speech + generator + lessons + engine + coach + build
```

- `test-lessons` — 85,000+ generated exercises against the lesson screen's real
  contract, plus eight degenerate-input cases.
- `test-engine` — **109 assertions**, now including the Arabic dialect set, the
  German pack and guide, the Latin→Devanagari round trip (convert a
  transliteration, romanise it back, land on the same sounds), and that the
  skip-ahead bar is stricter than the chapter-exam bar.
- `test-speech` — 31 cases including the cross-script ones from v74.
- `verify-browser.mjs` — the missions/fluency/voice passes from v73–v74, plus new
  ones that play the German skip-ahead test to a pass **by deriving the correct
  answers from the pack rather than reading them out of the DOM** (the answer must
  never be in the page), and that check all seven Arabic dialects are offered and
  the choice persists.
- `verify-lessons-browser.mjs` — **112 real lessons, 9,996 steps**, played in
  every language at four progress levels. Zero crashes, zero dead ends. Twenty
  of those combinations failed before the `advance()` fix.

## Known limitations

- The Devanagari conversion is a pronunciation aid, never shown to the learner,
  and it's approximate: `bhai` → भै rather than भाई. It is close enough for a TTS
  engine and vastly better than silence.
- Urdu, Turkish and German still have **no recorded audio files**. Generating them
  needs Google Cloud TTS credentials this repo doesn't have; `scripts/generate-audio.cjs`
  is ready when they exist.
- German has no conjugation or tense tables yet, so the CONJUGATE exercise types
  don't fire for it. The other twelve exercise types all do.
