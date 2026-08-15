# v76 — teaching the words people actually use

The ask: more words, focused on common ones, "so we're actually teaching people";
Arabic dialects with talking practice; a tutorial; a way to test out and jump
forward; better exercises; more adjustable.

---

## 1. The vocabulary was too thin to teach from

I measured it rather than guessing. Against a list of **81 concepts a beginner
course must cover to be usable at all** — to have, to want, can, need, money,
how, man, woman, price, left, right, near, far, doctor, with, without, not —
every single pack was missing between 18 and 45 of them.

Arabic's "Family" unit had **two words in it**. "Common Verbs" had four. A unit
that small produces the same three questions forever, and the learner correctly
concludes there's nothing there.

**1692 → 2235 words (+543, +32%)**, and every pack now covers at least 75 of the
81 essentials, with Arabic, Japanese and Chinese at 81/81. No unit anywhere has
fewer than six words.

| | before | after | | | before | after |
|---|---|---|---|---|---|---|
| **ar** | 110 | **185** | | **ja** | 94 | **142** |
| **ur** | 147 | **177** | | **ko** | 118 | **163** |
| **hi** | 110 | **151** | | **zh** | 123 | **156** |
| **pa** | 101 | **133** | | **bn** | 97 | **130** |
| **es** | 157 | **187** | | **id** | 102 | **136** |
| **fr** | 143 | **176** | | **pcm** | 97 | **139** |
| **de** | 157 | **180** | | **tr** | 136 | **180** |

Every pack's `frequencyRank` was also rebuilt to be **dense and unique**, because
the selector introduces new words in rank order — and several packs had sparse,
partly arbitrary ranks that made "most useful first" a claim rather than a fact.

The `test-engine` suite now asserts all of this, so a future pack can't quietly
drift back to pretty-but-useless.

---

## 2. Arabic dialects — and practice in them

MSA is the language of news and books and **nobody's mother tongue**. A learner
who memorises ماذا and lands in Cairo hears إيه and doesn't recognise it. They
conclude the app taught them nothing useful, and they're right.

Vocabulary entries now carry a `dialects` map, and **39 Arabic words have real
spoken forms** across six varieties:

| Variety | Words that differ |
|---|---|
| Egyptian | 46 |
| Levantine | 34 |
| Maghrebi (Darija) | 20 |
| Gulf (Khaleeji) | 18 |
| Iraqi | 13 |
| Sudanese | 11 |

```
what   ماذا  →  إيه (EG) · شو (LV) · شنو (Gulf/IQ) · شنو (MA)
where  أين   →  فين (EG) · وين (LV/Gulf/IQ) · فين (MA)
how    كيف   →  إزاي (EG) · شلون (Gulf/IQ) · كيفاش (MA)
want   يريد  →  عايز (EG) · بدي (LV) · أبي (Gulf) · بغيت (MA)
```

**The rule: a dialect entry exists only where the word genuinely differs.**
Padding every noun with four identical forms would teach that dialects vary
everywhere, which is false — the useful signal is exactly *which* words change,
and there are fewer than learners fear. The validator now **fails the build** on
a dialect form identical to its standard form; it caught 16 of mine.

Three places use it:

- **A dialect drill** — "what people actually say". Runs both directions:
  recognise what you hear (the survival skill) and produce the local form (the
  fitting-in skill), with a microphone option because the point of a dialect is
  being understood out loud. It opens by telling you how many words change out of
  how many you're learning — the honest, reassuring number.
- **In lessons** — the first time you meet a word that differs, you see both.
- **In grading** — answering in your chosen dialect is now **correct**, in
  lessons and in speaking drills. Marking it wrong was the fastest way to make
  the setting feel like a lie.

---

## 3. The tutorial

There was one, but it was four emoji slides written when the app was flashcards
and quizzes. It never mentioned speaking, missions, dialects or skipping ahead —
so the features people most needed to know about were the ones nobody found.

Rewritten to six, in the order a learner meets them, and it makes two things
explicit that people otherwise discover too late: **you can skip what you already
know**, and **you can turn off question types that don't suit you**. Still
skippable; Settings still replays it.

---

## 4. Testing out and jumping forward

Already shipped in v75 and unchanged: the **Skip ahead** screen tests a chapter's
own words in both directions at an 85% bar (against 70% for a normal chapter
exam), and a pass seeds those words as known and unlocks everything up to it.
This release makes it one of the six tutorial cards so people actually find it.

---

## 5. Adjustable: turn off question types

Some exercise types are a wall rather than a challenge, and which ones depends on
the person and the moment — listening on a device with no voice for the language,
typing on a phone in a script you have no keyboard for, speaking out loud on a
train. The only options were to endure them or stop using the app.

Settings now has a switch per type: listening, speaking, typing, spelling,
sentence building, matching, odd-one-out, verb forms.

Two guardrails:
- **Recognition and recall can't be switched off.** They're what a vocabulary
  course *is*.
- **Turning everything off still produces a working lesson**, not an empty one —
  and the screen states plainly that a narrower set means less practice at the
  things you switched off, rather than pretending the choice is free.

---

## Bugs found while building this

- **Two exercise types ignored the preference entirely.** MATCH_PAIRS and
  ODD_ONE_OUT are built outside the main exercise switch, so the filter never saw
  them — switching them off did nothing. Caught by a test that asserted every
  disabled type is *genuinely* absent rather than just that the common ones are.
- **The merge tool compared lemmas case-sensitively**, so "Kiri" and "kiri" both
  got in as separate entries — two rows for one word, which the generator then
  offers as two options to the same question.
- **16 hand-authored dialect forms were identical to the standard word.** Caught
  by the new validator rule, dropped.
- **An English word leaked into a Japanese example sentence** ("父は work
  しています"). Caught on review, fixed.

---

## Verification

```sh
npm run check
```

- `test-engine` — **186 assertions**. New ones cover essential-concept coverage
  per language, minimum unit sizes, dense unique frequency ranks, that the words
  carrying dialect forms are the high-frequency ones, that no dialect form
  duplicates its standard form, that a dialect answer is accepted while an
  unchosen dialect adds nothing, and that every exercise type can actually be
  switched off.
- `validate-vocab` — now validates dialect data: real region ids, correct script,
  no self-identical forms.
- `verify-browser.mjs` — **120 assertions** in headless Chromium, including
  playing the Arabic dialect drill through to its result and toggling exercise
  types in Settings.
- `verify-lessons-browser.mjs` — real lessons in all 14 languages at four
  progress levels.

## Still open

- Urdu, Turkish and German have no recorded audio files; the Hindi-voice fallback
  covers Urdu and Punjabi, and generating the rest needs Google Cloud TTS
  credentials this repo doesn't have.
- Dialect data is Arabic-only. The structure is language-agnostic and the picker
  already exists for Spanish, French, German, Chinese and Urdu — those varieties
  currently differ in the coach's speech but not yet in the vocabulary, and the
  drill honestly says "nothing to drill yet" rather than inventing differences.
