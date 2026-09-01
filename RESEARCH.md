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

**What changed (v101).** Two things, and the second was not the plan.

Every one of the 42 survival concepts — the words every language must teach —
now has a SECOND example sentence in all nineteen languages: 787 new sentences,
each putting the word in a different slot from the first. Words met in exactly
one frame: 84% → 65%. Survival words met in one frame: 607 → 0.

Then, checking the new sentences reached a learner, `src/engine/inputStream.js`
turned out to read `v.examples` and never call `mergeExamples` — so
`extraExamples.js` had NEVER reached the input stream. 1,160 sentences, a third
of the app's corpus, absent from the one screen whose entire purpose is
comprehensible input. The vocabulary cards merged them; the reading feature did
not, and nothing noticed because every check read the data files rather than
what the engine returns. Readable sentences at 30 words known, before → after:
French 16 → 26, Bengali 21 → 30, Hindi 24 → 30, Somali at ten words 2 → 6.

The browser check written to prove that fix PASSED against a build with the
merge deliberately removed — the reading screen surfaces sentences by more than
one route, so the absence never showed. It was thrown away and the claim moved
to `test-input-stream.mjs`, which calls `readableSentences` directly: 526 of 978
extra-only sentences served with the merge, **0 of 978** without it.

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

**And Swain's half (v83.3).** "Stay at their level, never show off" is
comprehensible input handled well, and it was the *only* side — a tutor who only
asks questions the learner can already answer never creates the moment where
someone notices a gap and reaches. About every third turn the coach now asks
something that needs more than a word back, with the push in what the **question
demands** rather than in vocabulary they haven't got; that distinction is the
line between stretching someone and losing them. Running out of words mid-
sentence is treated as the teachable moment rather than something to move past.

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
2. ~~**Pronunciation for the sentences that have none.**~~ **Done in v92.**
   Japanese, Korean and Mandarin example sentences carried **no romanisation
   field at all**; Arabic was at 41%, Urdu 59%. 724 sentences across six
   languages could be looked at and not said by the exact learner this app is
   for. They are now written — by hand, because the app's own romaniser is a
   rough phonetic skeleton built for scoring speech and documented as never to
   be shown to a learner, and an approximation of how someone's grandmother's
   language sounds is the wrong thing to hand them.

   All eleven non-Latin languages are at 100%, and `validate-translit.mjs` fails
   the build if that slips. It also runs three checks that catch what hand-written
   romanisation actually gets wrong at volume: a pinyin syllable count that
   doesn't match the character count, a word count that doesn't match for the
   spaced scripts, and the same sentence romanised two different ways in two
   places.

   Two bugs surfaced while verifying it reached the screen. The recovery round's
   re-teach card never rendered the romanisation at all. And eight screens each
   kept a private copy of the non-Latin language list, none of which had learned
   about Malayalam or Tamil — so both were presented as though the learner could
   already read the script, and every Malayalam and Tamil romanisation was
   hidden. There is one list now, in `src/data/registry.js`, and
   `validate-script-flags.mjs` fails the build if a second copy appears.
3. **Two or three example sentences per word instead of one.** 96% of words are
   met in a single frame — 2,840 of 2,965. A word seen in one sentence is learned
   as that sentence; the form-meaning mapping generalises through varied
   encounters, not repeated ones.

   `src/data/extraExamples.js` is the mechanism for this and it covers four
   languages (es, fr, ur, hi). v93 found that **49 of its 149 entries — a third —
   were dead**: they repeated a sentence the pack already had, and
   `mergeExamples()` dedupes by native string, so they were dropped at load and
   gave no second frame at all. The file's header says every key was verified
   against the vocab, and it was; the LEMMA was checked, the SENTENCE never was.
   All 49 were replaced with sentences that put the word in a different
   grammatical role, and `validate-translit.mjs` now fails the build on a dead
   extra or one keyed to a lemma that doesn't exist.

   v93 then extended it from four languages to **all nineteen**: 371 live second
   frames, up from 100, each written to put the word in a different grammatical
   role from the sentence already in the pack. Words met in a single frame fell
   from **96% to 83%**, and words with two or more went from 125 to 494.

   Still open: 2,471 words still have exactly one frame, and a second is worth
   less than a third and fourth for the highest-frequency words. This is the
   remaining content grind, and it is worth more than any new feature.
4. **Every language now teaches its own script — and how that script works**
   (v90, v91). v90 closed the first hole: Malayalam, Tamil, Persian, Tagalog and
   Somali shipped with no alphabet at all, and seven older packs had letters with
   no lesson group to reach them through — Punjabi's fourteen Shahmukhi letters
   among them.

   v91 closed the larger one. A list of letters had been standing in for a
   writing system, and for the hard scripts it was not half of one:

   - **Arabic script (ar, fa, ur, pa)** taught only ISOLATED forms. No word in
     any of those languages is written that way, so a learner could finish the
     whole Urdu alphabet and not read one Urdu word. Every letter now also shows
     its initial, medial and final forms, built with ZWJ so the reader's own font
     does the shaping, and the non-connectors are named as the rule they are.
   - **Abugidas (hi, bn, ml, ta)** taught consonants bare. ക is "ka"; there is no
     bare "k" in the chart and no way to write "ki" without a mark nobody had
     shown. A vowel-sign lesson now teaches the full matra set on a demo
     consonant, including the three things that catch everyone: signs written
     before the letter they follow, signs that wrap around both sides, and signs
     that fuse into the consonant's shape.
   - **Hangul (ko)** taught all 24 jamo and never said they stack. ㅎ + ㅏ + ㄴ is
     한, not ㅎㅏㄴ. A block-assembly lesson now teaches the square.

   Plus a primer for all eleven non-Latin languages — how the system works, what
   is hardest, and what the first win is — read before letter one, and confusable
   sets with the tell that separates them (ب/ت/ث, ന/ണ, ண/ன/ந, ㄱ/ㅋ).
   `validate-alphabets.mjs` now fails the build if a non-Latin language has no
   primer, an Arabic-script language has no joining rules, an abugida has no
   vowel signs, or Hangul has no block lesson.

4b. **The course assumed literacy, and for heritage learners that is backwards.**
   The app taught a genuine script course — primer, letter groups, vowel signs,
   joined forms, Hangul blocks, confusable pairs — and put it in a tile under
   "more ways to practise", below the fold, next to flashcards. The route opened
   on *Introductions* and showed Malayalam in Malayalam script.

   The people this app is for often speak some of a language and read none of
   it. Handing that person ഞാൻ is not comprehensible input, it is a wall; and
   the thing that would have helped looked optional.

   **v99 makes the script course Chapter 0** — first on the route, ahead of
   introductions, for the eleven languages whose packs carry letters. The eight
   Latin-script languages show nothing, because there is nothing honest to
   teach.

   The design constraint that shaped it: a learner who *already* reads must be
   able to leave in two minutes. So the chapter opens with its own exit — a
   twelve-question reading test — and the test asks *what does this say* and
   *what does it mean* using real words from the learner's pack, rather than
   asking them to name letters. Naming letters is a party trick a reader never
   performs and a non-reader can be drilled into.

   The distractors are where a multiple-choice reading test is won or lost: with
   random wrong answers the question is answerable by elimination without
   reading anything, so they come from the same script, the same length band,
   and — for letters — from that letter's own confusable set (ത vs ട, ن vs ت).
   Guessing passes fewer than 1 in 1,000 times, measured over 20,000 simulated
   papers.

   Two defects surfaced only because the checks build the real thing rather than
   inspect the data: Chinese would have been asked to name `b p m f` (the pinyin
   initials — Chinese has no alphabet), and papers were coming out eleven
   questions long wherever a pack names two letters the same, which silently
   moved the exam's own pass mark. Neither is visible in a single draw;
   `test-script-exam.mjs` builds 200 papers per language.

4c. **Nothing said what a pack was FOR, so nineteen of them drifted.** Measured
   in v100, before anything was changed: 420 distinct concepts across the app,
   **53 taught in all nineteen languages, and 147 taught in exactly one**. The
   Persian pack had 120 words and the Spanish pack 193.

   The gaps were not obscure. Punjabi did not teach "eat"; Persian did not teach
   "drink"; Chinese did not teach "want". Arabic, German, Hindi, Japanese and
   Turkish taught "I" and "you" and no third person at all — a learner could
   introduce themselves and then not mention anybody else. Five packs had no
   word for "bathroom", while the Sentence Lab added in v98 teaches *"Where is
   the bathroom?"* in three of them.

   `src/data/coreVocabulary.js` is the floor: 115 concepts in three tiers, where
   a concept is a MEANING and lists the English glosses that count as teaching
   it — because Persian خوردن covers eat and drink, and "uncle (mother's
   brother)" is still *uncle*. Missing a survival concept fails the build. 182
   words later the gap is 197 → 7, all optional.

   A quarter of the "missing" words were not missing: they were the same
   inconsistency in different clothes — *cooked rice* against *rice*, *hunger*
   against *hungry*, *illness* against *sick*. The fix for those is the concept
   list accepting both, not a duplicate word. Two were real finds: Korean 차 is
   both tea and car (the pack taught tea, so the car had to be 자동차), and
   Tamil கூட means both "with" and "also" while the pack taught half of it.

4d. **A card has to spell its own word the same way twice.** `validate-word-frames.mjs`
   found 68 cards showing a learner two romanisations of one word — `suq`/`sooq`,
   `arigatou`/`arigatō`, `khana`/`khaana`.

   Two mistakes on the way there are worth more than the fix:

   - **The first check was wrong.** It asked whether the card's romanisation
     appeared inside the sentence's, which fires on every inflected language:
     Arabic lists يذهب (third person) and uses أذهب ("I go"), inflecting on the
     *front* of the word. Twenty-nine healthy cards reported as broken is a
     check that gets switched off, and then the four real problems underneath
     never surface. The sharp question is whether a token in the sentence is the
     same word *after folding away convention differences* but spelled
     differently — inflection folds to something else and drops out.
   - **The automated fix was wrong.** It wanted to rewrite `bú shì` → `bù shì`
     and `yí ge` → `yī ge`: correct pinyin into wrong pinyin. `foldConvention`
     strips tone marks so the CHECKER tolerates sandhi; using the same fold to
     drive a REWRITE inverts its purpose. A tool that normalises has to know
     which differences carry meaning. Chinese is reported and never failed now,
     and Punjabi and Urdu were done by hand because there the card was often the
     worse spelling.

5. **Feature coverage is uneven, and now it is measured.** A language pack is
   not one thing — vocabulary, a route map, a script course, grammar, passages,
   conversations, culture notes, verb tables and sentence patterns were added by
   different passes, and the newest languages arrived with the first few and
   none of the rest.

   v95 measured it for the first time. Persian, Malayalam, Tamil, Somali and
   Tagalog had **no culture notes and no scripted conversations**, and Home
   offered "Listen & follow — scripted conversations, with subtitles" to all of
   them without checking: the door opened onto "no conversation starters for
   Tamil yet". 40 culture notes and 60 conversations later, all nineteen
   languages have both, and `validate-feature-coverage.mjs` fails the build if a
   door is offered without the data behind it.

   v98 closed the sentence lab gap: German, Chinese, Persian, Punjabi, Tamil,
   Malayalam, Somali and Tagalog now have ladders of their own, so **all
   nineteen languages have every feature except passages**. Each ladder is built
   around the one thing that language does differently rather than a translated
   English template — German's verb-second rule, Chinese measure words and the
   question word staying where the answer goes, Tagalog's verb-first order and
   its `ba` particle, Somali's `waa`/`waxaan` markers, Punjabi's gendered present
   tense, the `-ஆ` / `-ഓ` question suffixes in Tamil and Malayalam. The only
   remaining gap is reading passages for five languages (item 6).

   Two defects surfaced while building it, both invisible in the source:

   - `validate-sentence-lab.mjs` exists because `SentenceLab.jsx` renders
     `{isNonLatin ? chunk.translit : chunk.text}` — **in eleven languages the
     draggable tile is the romanisation**, so a chunk missing `translit` is a
     blank tile the learner is asked to place, and the file it came from looks
     perfectly fine.
   - the word bank was shuffled with `sort(() => Math.random() - 0.5)`. Measured
     over 4,000 deals: **49.7% of two-chunk banks, 37.8% of three-chunk and
     19.3% of four-chunk banks came out already in the correct order** — across
     the content the app ships, 37% of build steps handed the learner the
     finished sentence and asked them to build it. Fisher–Yates with a reshuffle
     when the result matches the answer; `test-shuffle.mjs` pins it, and fails
     with those exact numbers against the old line.

6. **Five languages have no reading passages and no recorded audio** — Tagalog
   and Persian (v86), Malayalam, Tamil and Somali (v89). The packs, guides and example sentences are there and
   the input stream works from them; the curated reading library does not exist
   yet, and `validate-passages.mjs` names both languages and the reason rather
   than letting the absence pass quietly. Writing literary Tagalog or Persian
   and calling it course material is the thing this project has said it will not
   do.
7. **A native speaker's eye on Punjabi and Nigerian Pidgin passages** — and now
   on the Tagalog and Persian packs too.
8. **Grammar beyond 4–6 lessons per language.** The "none at all for Turkish,
   Punjabi, Indonesian, Nigerian Pidgin, Tagalog or Persian" that stood here was
   closed by v88, and v89 covered Malayalam, Tamil and Somali. All nineteen
   languages now have a grammar curriculum — 90 lessons, 990 generated checks —
   so what remains is depth rather than absence.

## What this app already does that the research supports

- Spaced repetition on a real memory model, with intervals fitted to a
  forgetting curve rather than to a multiplier.
- Frequency-ordered vocabulary.
- Genuine interaction with adaptive difficulty, and missions with a pass mark
  that can actually be failed.
- Comprehensibility as the standard for speaking, not exactness — "would a
  native speaker understand this" rather than "was it perfect".
- Explicit grammar available, never compulsory.
- Prompts before recasts, since v83, and questions that ask the learner to
  reach, since v83.3.
- Difficulty that falls back when a word keeps being forgotten, since v82 —
  which is the closest thing here to respecting a developmental sequence.
