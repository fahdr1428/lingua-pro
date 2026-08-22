# What the research says, and where this app actually stands

An honest audit against Lightbown and Spada's survey of second-language
acquisition research (*How Languages are Learned*), which reviews six broad
approaches and the evidence for and against each.

Every number here is produced by a script in this repository, not by
impression — `npm run measure-input`, `npm run measure-stream`,
`npm run validate-grammar-checks`, `npm run simulate-leech`. Re-run them; they
will disagree with this document the moment it stops being true.

---

## The short version

The app is very good at the approach the research is **least** enthusiastic
about, and thin on the one nobody disputes.

It has fourteen exercise types, a spaced-repetition scheduler fitted to a
forgetting curve, graduated retrieval, conjugation and tense injection, a
placement test and a leech-recovery path. All of that is machinery for
practising **items**.

Until v83 it had **623 words of connected text across all fourteen languages**.
Korean got four.

That is the imbalance the survey warns about, in the direction it warns about,
and it is easy to arrive at without noticing: building more exercise machinery
feels like building more app, because it is. It just isn't building more
language.

---

## 1. Accuracy first — drills, patterns, correct from the start

**What the research says.** The audio-lingual method, built on behaviourist
psychology, has learners repeat correct patterns so bad habits never form. It
fell out of favour: most language use isn't imitative, grammatical patterns
appear to emerge in a fixed developmental order regardless of teaching, and one
study found students drilled hard on a particular pattern used it more *and made
more errors in their other sentences*.

**Where the app was.** This was the app's centre of gravity, and one part of it
was straightforwardly the audio-lingual pattern: when the AI coach found an
error it printed the corrected form and offered **"Say it the right way"** with
the answer on screen. Read the fix aloud. Repeat after me.

**What changed (v83).** Corrections now lead with a question that points at the
problem without containing the answer, and the form is held back until the
learner has had a go or taps "Show me". See §3 for why.

**Still true.** A lesson is still mostly discrete items. That is defensible —
see §6 — but it should be a choice rather than the only thing there is.

---

## 2. Input is all you need — Krashen's Input Hypothesis

**What the research says.** Comprehensible input, attended to for meaning, is
what drives acquisition. The strong claim — that it's *sufficient*, and that
drills and grammar are useless — is not supported: French immersion students
reach native comprehension and still make persistent grammatical errors after
years. The weaker claim, that input is necessary and central, is not seriously
disputed by anyone.

**Where the app was.** This is where it was weakest, by a distance, and the
distance is measurable:

| | |
|---|---|
| Connected text, all 14 languages | **~623 words** |
| Thinnest language | Korean, **4 words** |
| Words met in exactly one sentence | **2111 of 2235 — 94%** |

A word met in a single frame is known in that frame. Ninety-four per cent of the
vocabulary in this app is in that position.

**What changed (v83).** Every vocabulary word already carried a native-authored
example sentence — 315 to 667 words per language, several times the whole
reading library — and each was met **once**, alone, inside a multiple-choice
question. The input stream reassembles them, ordered by how much of each the
learner can already read: sentences they know every word of, then sentences
whose single new word is the one that sentence teaches. That is i+1 falling out
of how the curriculum is already built rather than being imposed on it.

It invents nothing. That constraint is not squeamishness — this app teaches
Punjabi, Nigerian Pidgin, Bengali and Urdu to people with family who speak them,
and generated prose presented as course material is the wrong thing to hand
someone trying to talk to their grandmother.

**Still true, and it is the biggest open problem in the app.** Reassembled
sentences are not connected text. Nobody acquires a language from a list of
unrelated lines, however well ordered. Real passages, written by people who
speak these languages, is the work that would most improve this app, and it
isn't work I can do.

---

## 3. Talking is everything — output and interaction

**What the research says.** Swain's Output Hypothesis: having to express
something more complex than you can currently manage is itself a driver of
learning. Long's Interaction Hypothesis: interaction, not just input, is
essential — partners adapt to be understood, and the learner can hypothesise and
get immediate feedback. The caveat is sharp: conversation partners typically
*don't* correct when they've understood, and **many learners don't act on subtler
feedback when their incorrect sentence is simply repeated back correctly.**

**Where the app was.** It has AI conversation, missions with pass marks, speaking
drills with lenient scoring — a genuinely strong interaction story, and the best
thing in the app.

And every correction channel it had was a **recast** — the corrected form handed
over — which is precisely the move the survey names as the one learners fail to
use. There were three of them at once:

- `corrections[].better` — the fixed fragment
- `fluent_version` — the whole sentence rewritten
- `coaching` — spoken aloud, naming the thing to change

Then **"Say it the right way"**, with the answer above it. Nothing was ever
retrieved. Measured against a Spanish word forgotten seven times, in the lesson
engine, the same pattern held: **51 of 60 exercises were cold production** on a
word the learner could not produce.

**What changed (v83).** Corrections carry an `ask` — an elicitation or
metalinguistic clue that points at the problem without containing the answer.
The learner attempts first; the form is revealed after, or on request. The
rewritten sentence collapses to a button while an ask is open, because printing
it answers every question on the card at once. The coach is also told not to
smuggle the fix into its own reply, which is a recast by another name.

"Show me" is always one tap away and never scolds. The failure mode of withheld
feedback is someone stuck and quietly giving up, which is worse than the failure
mode it replaces.

**Still true.** The coach is told to stay at the learner's level and never show
off, which is the input side well handled and the *output* side unattended:
nothing ever asks them to reach for something they haven't got. Swain's push is
missing.

---

## 4. Learn a language on the side — content-based instruction

**What the research says.** Teach something else *in* the language. Canadian
French immersion produces near-native comprehension while keeping pace with the
standard curriculum. Drawbacks: it takes years to perform academically in a new
language, and speaking accuracy still suffers without attention to form.

**Where the app stands.** Not applicable in the strong sense — nobody is doing
their maths homework in Urdu here. The nearest things are the culture screens and
Decode, which turns a real message from a real person into the material. Decode
is the closest this app gets to language-as-medium rather than
language-as-subject, and it is the most distinctive thing in it.

---

## 5. Study in the proper sequence — Pienemann's processability

**What the research says.** Grammatical structures are acquired in a fixed
developmental order that instruction cannot skip. Vocabulary can be taught any
time; some syntax cannot. The lesson isn't that grammar shouldn't be taught, but
that it should be taught in the order learners naturally progress.

**Where the app stands.** Vocabulary is ordered by frequency, which is sound and
well evidenced. Grammar is 4–6 lessons per language, ordered by topic, and
nothing anywhere models a developmental sequence.

**Honestly: I can't fix this.** Processability sequences are established
empirically, per language, by researchers. There is published work for English
and German; for Nigerian Pidgin and Shahmukhi Punjabi there is little or none,
and inventing an order and presenting it as *the* order would be a fabrication
dressed as science. The most that can honestly be said is that the app does not
force production of structures a learner isn't ready for — which, since v82, it
genuinely doesn't: exercise difficulty is now pulled back when a word keeps being
forgotten instead of escalated.

---

## 6. "Get it right in the end" — the synthesis the authors land on

**What the research says.** Meaningful use of the language from the very
beginning, *plus* explicit attention to its forms. Learners given explicit
instruction on a pattern measurably improve on that pattern; real ability doesn't
emerge without time spent genuinely communicating. Neither half alone.

**Where the app was.** It had both halves and had wired them the wrong way round
in one specific, measurable place. Of 49 grammar comprehension checks, **19 —
39% — were written entirely in English**:

> Where does the verb go in Urdu? · At the end / At the start / After the subject

You can answer every one of those having never seen a sentence in the language.
They test whether someone read the paragraph above, which is knowledge *about* a
language and a well-documented thing to be able to do while remaining unable to
use it.

**What changed (v83).** The rule question stays — explicit instruction does help,
that's the finding. An application item is generated after it from the lesson's
own native-authored examples: same pattern, now with a sentence in front of you.
94 items across all 47 lessons.

The hard part was ambiguity, and it produced two bugs of my own worth recording.
Within a lesson the examples deliberately contrast the feature being taught, so
"Yo hablo español" and "Hablo español" both mean *I speak Spanish*, and offering
both marks a correct answer wrong — worse than the trivia it replaces, because it
teaches something false. Normalising glosses to their meaning fixed it, once I
noticed that *deleting* "(I)" made an implied subject vanish so two identical
meanings stopped matching, and that the teaching glosses were leaking the answer
outright ("I am a student (defining → ser)"). 517 assertions now guard it.

---

## What would improve this app most, in order

1. **Written passages, by native speakers.** ~623 words across fourteen
   languages is the finding that matters, and everything else is second. The
   input stream multiplies what's available several times over but it is a run
   of sentences, not connected text.
2. **Pronunciation for the sentences that have none.** Japanese, Korean and
   Mandarin example sentences carry **no romanisation field at all** — every one
   of them can be looked at and not said by a learner who can't read the script.
   Arabic is at 38%, Urdu 55%. The app's own romaniser could fill these and must
   not: it's a rough phonetic skeleton built for scoring speech and documented as
   never to be shown to a learner.
3. **Two or three example sentences per word instead of one.** 94% of words are
   met in a single frame.
4. **Push the learner's output.** The coach never asks for anything beyond what
   they can already say. That's the input side handled and Swain's half missing.
5. **A native speaker's eye on Punjabi and Nigerian Pidgin passages.**
6. **Grammar beyond 4–6 lessons**, and none at all for Turkish, Punjabi,
   Indonesian or Nigerian Pidgin.

## What this app already does that the research supports

- Spaced repetition on a real memory model, with intervals fitted to a
  forgetting curve rather than to a multiplier.
- Frequency-ordered vocabulary.
- Genuine interaction with adaptive difficulty, and missions with a pass mark
  that can actually be failed.
- Comprehensibility as the standard for speaking, not exactness — "would a
  native speaker understand this" rather than "was it perfect".
- Explicit grammar available, never compulsory.
- Prompts before recasts, since v83.
- Difficulty that falls back when a word keeps being forgotten, since v82 —
  which is the closest thing here to respecting a developmental sequence.
