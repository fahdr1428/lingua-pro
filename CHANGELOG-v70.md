# v70 — Route, Voice & Culture

Everything in this release, why it was done, and the four bugs it uncovered.

Run `npm run check` to verify the lot (vocab + journey validators, speech and
generator tests, then the build).

---

## 1 · The journey became a route map

**Before.** `JourneySpine` drew a 1.5px vertical line with small dots beside a
list of sentences. Every stop looked identical; there was no sense of terrain, no
sense of distance covered, and chapters didn't exist visually at all. "Your
journey" was a heading over a to-do list.

**Now.** `src/screens/JourneyMap.jsx` — a transit-route diagram, deliberately not
the bubble path every language app uses.

- One continuous line runs down the page. Behind you it's solid and inked; ahead
  it's dashed and pale. That single detail — one drawn line whose weight and
  texture carry state — is what makes it read as distance travelled.
- Waypoints are **stations**, and each one names a conversation rather than a
  unit: "You can ask where something is." Past tense behind you, **Next** on the
  current one, "Then" ahead.
- The current station is marked **You are here** and opens to show the actual
  exchange — their line and yours, both with a listen button, plus a way straight
  into the speaking trainer. The map is something you practise from, not just
  navigation.
- **Regions** (chapters) have headers naming the real units inside them, a
  progress count, and a **checkpoint** gate at the end drawn as a bar across the
  route rather than another station.
- The line **jogs** sideways between regions, so the page reads as a route rather
  than a straight list.

Sized so that a region is exactly `UNITS_PER_CHAPTER` stops — which means the
checkpoint drawn at the end of a region **is** the real chapter exam that gates
the next one. Group them any other way and the map draws gates where the app
doesn't gate.

## 2 · The guide stopped being an emoji

**Before.** Guides rendered as `character.emoji` — 👩🏼, 🧕🏽, 🧔🏽. That renders
differently on every platform (so the guide isn't the same person on iOS and
Android), can't be coloured or sized to the design, and reads as a sticker.

**Now.** `src/ui/GuideMark.jsx` draws a **seal**: the guide's initial in *their
own language's script* — آ for Amina, 林 for Lin, ن for Nasreen — in a hairline
ring in their accent colour over a soft wash. Borrowed from the stamp/tughra/chop
tradition rather than from cartoon mascots. SVG, so it's crisp at any size and
needs no image assets. `emoji` was deleted from the data so nothing can silently
fall back to it.

It also does something an emoji can't: a `speaking` state that breathes while the
guide's voice is playing, so the seal is visibly the thing that's talking.

Guides also gained a **city**, a **craft** (Amina teaches literature; Lin runs a
tea shop and will correct your tones), a **voice profile** (TTS rate and pitch),
and a spoken **signature line**. They read as people now.

**Three languages had no guide at all** — Punjabi, Indonesian and Nigerian
Pidgin, the app's most distinctive offerings. They now have Nasreen (Lahore),
Sari (Yogyakarta) and Chidi (Lagos).

## 3 · Speaking: the app can finally listen

The "Speak" tab in the bottom nav led to a **reading** screen. Nothing in the app
ever listened to the learner — you could finish the entire course without saying
a word out loud.

New `src/audio/speech.js` and `src/screens/Speak.jsx`, in two modes:

- **Say it** — "How would you say 'and where are you from?'" and nothing else. No
  native text, no transliteration, no audio hint. You produce it from memory; the
  answer is revealed only after you've tried.
- **Conversation** — the guide speaks a line aloud, you answer aloud, they react
  in their own voice and move on. Built from the journey stops, so it's the same
  content the map promised you could handle.

Plus **in-lesson**: a new `SPEAK_PROMPT` exercise appears once per lesson, after
the word has been recognised and recalled in the same session (asking someone to
pronounce a word they met ninety seconds ago tests courage, not memory).

### How the grading works, and why it's lenient

`scoreAttempt()` grades "would a patient native speaker have understood you",
not "did you match a string". Three bands — got it / close / not yet — and it
never marks an accent down. Concretely:

- Recognisers mangle non-native pronunciation, and for languages with no
  recogniser at all we listen in a nearby locale, so the transcript can arrive in
  the wrong script entirely. So every attempt is scored against **all** acceptable
  forms — native script, transliteration, variants — and the best is taken.
- Speech has no spaces in it, so where the recogniser splits words differently
  from our transliteration ("bon jour", "as salamu alaykum") the character score
  is the truthful signal and the token score is noise. It takes whichever is
  stronger rather than averaging the good one away.
- Filler is stripped, diacritics are folded, Arabic letter forms are normalised
  (أ إ آ → ا, ی → ي), punctuation across scripts is dropped.
- **But leniency has a floor**: leaving out a whole content word is "close",
  never "got it" — judged by character mass, so dropping "o" from
  assalam-o-alaikum is forgiven while dropping "shukriya" from "main theek hoon,
  shukriya" is not.
- Feedback names the word that went missing instead of saying "wrong".

`npm run test-speech` covers 17 cases; each one is a real failure mode.

**What this is and isn't.** Recognition and grading both run on-device: no API
key, no per-request cost, no latency, and the learner's voice never leaves their
machine. It is **not** a language model. `judge()` is a single seam where a hosted
grader can be dropped in later without touching any screen.

**The fallback is first-class.** Firefox has no `SpeechRecognition`, and
permission can be denied anywhere. Both become a typing drill with identical
grading, not a dead end.

## 4 · Culture

New `src/data/culture.js` and `src/screens/Culture.jsx` ("Inside Urdu").

A learner who knows 100 Urdu words still doesn't know that refusing chai once
means nothing, that `tum` to a stranger stings, or that a flat statement about
tomorrow sounds presumptuous without `inshallah`. **104 notes across all 13
languages**, each tagged by the kind of knowledge it is — etiquette, register,
sound, body language, custom — and tied to a situation so it surfaces where it's
relevant. One rotates onto the home screen daily, matched to the unit you're
actually on.

Written to the same discipline as `funFacts.js`: no invented statistics, nothing
a native speaker would roll their eyes at, and where a practice varies by region
it says so rather than flattening it into one false rule.

## 5 · More chapters, more words

- The journey went from **1 language × 6 stops** to **6 languages × 12 stops ×
  4 chapters** (Urdu, Spanish, French, Turkish, Hindi, Arabic).
- Four new units, filling genuine gaps rather than padding: **Turkish had no
  body-part words and no feelings words at all** — "I'm tired" was unsayable in a
  118-word course — and no weather vocabulary. Hindi and Arabic had scattered
  nature words but no unit for them. +38 words, validated.
- 1,535 words total, 0 validator errors.

---

## Bugs found and fixed on the way

1. **Every Turkish learner crashed at the end of every lesson.** `characters.js`
   defined `encouragement` for Turkish where all twelve other languages define
   `celebrations`, and the result screen read `character.celebrations[tier]`
   unguarded — a `TypeError` straight into the error boundary. Live since v59.
   The key is normalised and reads now go through `getCelebration()`, which
   can't throw.

2. **The Sentence Lab hero action always dead-ended.** `App.jsx` never passed
   `params` to `SentenceLab`, which reads `params.pattern` — so one of the four
   things the coach can pick as your next session always landed on "No pattern
   available right now." `params` is now part of `screenProps`, so the whole
   class of bug is gone.

3. **Two journey waypoints were unreachable in three languages.** A stop is gated
   on the unit at the same index, and Turkish had 10 units for 12 stops. Nothing
   threw — the map just quietly promised conversations the course had no path to.
   Fixed by adding the units, and `npm run validate-journey` now fails the build
   on any out-of-range stop.

4. **Future stations rendered as lowercase fragments.** `stop.next` is written to
   follow a lead-in ("…you'll be able to greet someone"), and the map rendered it
   bare. Now "Next — …" on the current stop and "Then …" ahead.

## New commands

| Command | What it checks |
|---|---|
| `npm run validate-journey` | Every journey stop points at a unit that exists, both halves of each exchange are present, non-Latin stops have transliteration |
| `npm run test-speech` | 17 grading cases — leniency where it belongs, strictness where it matters |
| `npm run test-generator` | The speaking exercise: never unseen words, one per lesson, always last, never in exams |
| `npm run check` | All validators + tests + build |
