# v83 — what the research actually says, and where this app stood

Prompted by Lightbown and Spada's survey of second-language acquisition
research, which reviews six approaches to teaching a language and the evidence
for and against each. The full audit is in [RESEARCH.md](RESEARCH.md). Three
things came out of it, and the third is the one that matters.

---

## 1. Every correction was a recast

When the AI coach found an error it handed over the fix three ways at once:
`corrections[].better` gave the corrected fragment, `fluent_version` rewrote the
whole sentence, `coaching` said it aloud. Then it offered **"Say it the right
way"** — with the answer sitting on screen above the button.

That is a recast followed by a repeat-after-me. The learner reads the fix aloud
and retrieves nothing, which is both the feedback move the research finds
learners act on least *and* the audio-lingual drill pattern the same research
watched fall out of favour in the 1970s. Two discredited things stacked.

The survey is blunt about it: *many students don't make use of subtler forms of
feedback when their incorrect utterances are repeated back to them correctly.*
There is nothing to **do** with a recast. What produces repair is a **prompt** —
an elicitation, a clarification request, a metalinguistic clue — because the
learner has to retrieve the form themselves, and the retrieval is the part that
sticks.

So corrections now carry an `ask`: a question that points at what needs changing
without containing the answer.

> You put that in the present — how would you say it about yesterday?

The learner attempts first. The corrected form appears after their attempt, or
when they tap **Show me**, which is always one tap away and never scolds — the
failure mode of withheld feedback is someone stuck and quietly giving up, which
is worse than the failure mode it replaces. The whole rewritten sentence
collapses to a button while an ask is open, because printing it answers every
question on the card at once. And the coach is now told not to smuggle the fix
into its own spoken reply, which is a recast wearing a hat.

Four assertions in `test-coach-api.mjs` guard the field, the instruction, and
the rule that the ask must never contain the answer.

**And the other half of the same argument (v83.3).** Swain's Output Hypothesis
is that needing to say something you can't quite say yet is itself what drives
learning. "Stay at their level, never show off" is comprehensible input handled
well and it was the only side present. About every third turn the coach now asks
something that needs more than a word back — why, what happened, what would you
do — with the push in what the **question** demands rather than in vocabulary
they haven't got. Running out of words mid-sentence is the teachable moment, not
a failure to move past.

---

## 2. 39% of grammar checks tested the paragraph, not the language

19 of 49 comprehension checks were written entirely in English:

> **Where does the verb go in Urdu?** At the end / At the start / After the
> subject / It varies freely

You can answer every one of those having never seen a sentence in the language.
They test whether someone read the paragraph above — knowledge *about* a
language, and a well-documented thing to be able to do while remaining unable to
use it.

The rule question **stays**. Lightbown and Spada's conclusion is not that
explaining rules is a mistake — learners given explicit instruction on a pattern
measurably improve on that pattern. The mistake was that explaining was the whole
of it. An application item is now generated after each rule question, from the
lesson's own native-authored examples, so nothing invents a sentence in a
language it has no business inventing sentences in. 94 items across all 47
lessons.

**The hard part was ambiguity, and it caught two bugs of mine.** Within a lesson
the examples deliberately contrast the feature being taught, so *Yo hablo
español* and *Hablo español* both mean "I speak Spanish" — offer both and a
correct answer gets marked wrong, which is worse than the trivia it replaces
because it teaches something false. Glosses are reduced to their meaning before
comparison, and getting that right meant noticing:

- **Deleting parenthesised text was wrong.** "(I) speak Spanish" became "speak
  Spanish" while "I speak Spanish" stayed as it was, so two identical meanings
  stopped matching and the collision check waved the ambiguous question straight
  through. The parenthesis marks a word as *implied*; it has to be unwrapped, not
  dropped.
- **The teaching glosses leaked the answer.** "I am a student (defining → ser)"
  names which verb to pick. "I water drink-am = I drink water" hands over the
  word order the lesson is asking about.

517 assertions in `validate-grammar-checks.mjs`.

---

## 3. The app had about a minute of reading in it

This is the finding that matters, and it took writing a script to see it.

```
npm run measure-input
```

| | |
|---|---|
| Connected text, all fourteen languages | **~623 words** |
| Thinnest | Korean, **4 words** |
| Words met in exactly one sentence | **2111 of 2235 — 94%** |

Against that: fourteen exercise types, a spaced-repetition scheduler fitted to a
forgetting curve, graduated retrieval, conjugation injection, a placement test, a
leech-recovery path. A very elaborate machine for practising **items**, attached
to almost no **language**.

Every survey of second-language acquisition agrees comprehensible input is
necessary and disagrees only about whether it's sufficient. A minute of reading
is not a disagreement about theory. It's an absence — and it's easy to arrive at
without noticing, because building more exercise machinery feels like building
more app. It is. It just isn't building more language.

### What was already there and unused

Every vocabulary word carries a native-authored example sentence — 315 to 667
words per language, **several times the entire reading library** — and a learner
meets each one **once**, alone, inside a multiple-choice question, and never sees
it again.

The new screen puts them back together in the order the learner can read them.
It invents nothing: every sentence was written and reviewed as part of the
curriculum. It is not a story and the screen doesn't pretend otherwise. What it
*is* is narrow reading at the right level — the same small vocabulary met again
in different frames, which is exactly what 94% of the words in this app never
get.

The meaning is hidden until asked for, because reading with the translation
beside it isn't reading, it's translating: the eye takes the English and the
target language never gets processed. There's no score and nothing to get wrong.
It's the one part of the app that isn't testing anybody.

### The ordering was wrong first, in the way that matters

"Every course word in it is known" sounds right and is far too lax. Only 45–58%
of the words in these sentences are course vocabulary at all — the rest are
function words, inflections and things the course never teaches — so a sentence
whose one course word was known and whose other three words were nowhere in the
curriculum scored as perfectly readable.

`measure-stream.mjs` was written to catch exactly that and did: **eight languages
were handing a ten-word beginner most of the curriculum** and calling it their
level. That's the worse failure of the two it was watching for, because it fails
quietly and it fails by discouraging precisely the person it's for.

Two conditions now, and the second is the one that bites:

1. **The one new word is the word the sentence teaches.** Every example hangs off
   a specific vocabulary entry, and that word is the gap — i+1 falling out of how
   the curriculum is already built rather than being imposed on it.
2. **At least half the rest is already theirs**, which at the measured density is
   roughly "you know the content words".

The curve is now what it should be — Urdu goes 2+4 sentences at ten words, 16+11
at thirty, 91+14 at a hundred and twenty. One language still offers a complete
beginner nothing, and the screen says so plainly rather than showing an empty
page that looks broken.

### And a gap I hadn't seen

**Japanese, Korean and Mandarin example sentences have no romanisation field at
all.** Not missing here and there — the field doesn't exist in those packs. Every
example sentence in those three languages can be looked at and not said by a
learner who can't yet read the script. Arabic is at 38%, Urdu 55%.

The app has a romaniser. It could fill these and it must not: `audio/romanise.js`
is a rough phonetic skeleton built for scoring speech attempts, and it says in
its own header that it must never be shown to a learner. Handing someone an
approximation of how their grandmother's language sounds is the wrong thing for
this app to invent.

So: sayable lines sort first, the screen says plainly that the pronunciation
isn't written yet, and points at the audio, which is real. `measure-input` tracks
the gap so it can be filled by someone who should be filling it.

---

## Verification

```sh
npm run check && npm run measure-input && npm run measure-stream
```

`validate-grammar-checks` 517 · `test-engine` 200 · `test-coach` 62 ·
`test-lessons` 31 · `test-generator` 11 · `validate-passages` 0 errors ·
`validate-themes` 0 errors · `audit-a11y` 0 issues · `verify-offline` 15/15 ·
`verify-deploy-skew` 8/8 · lesson fuzz 227/227.

## Still open

Ordered by how much they'd improve the app, from [RESEARCH.md](RESEARCH.md):

1. **Written passages by native speakers.** ~623 words across fourteen languages
   is the finding that matters and everything else is second.
2. **Pronunciation for the sentences that have none** — three languages at zero.
3. **Two or three examples per word** instead of one. 94% are met in one frame.
4. No grammar at all for Turkish, Punjabi, Indonesian or Nigerian Pidgin.
5. **`sessionSize` still doesn't mean what it says** — asking for 8 questions
   produces about 16.
6. Keyboard-only and screen-reader journeys have not been walked by a human.
