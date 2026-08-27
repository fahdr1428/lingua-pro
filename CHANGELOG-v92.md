# v92 — 724 sentences a learner could look at but not say

The vocabulary always carried a romanisation, so you could say the **word**.
Then you met that word inside an example sentence written entirely in a script
you cannot read, with nothing to sound it out from.

| | examples | had a romanisation |
|---|---|---|
| Japanese | 157 | 8 (5%) |
| Korean | 189 | 11 (6%) |
| Mandarin | 173 | 10 (6%) |
| Arabic | 244 | 101 (41%) |
| Urdu | 196 | 115 (59%) |
| Punjabi | 147 | 137 (93%) |

**724 sentences**, aimed squarely at the person this app exists for: someone who
hears the language at home, was schooled in English, and cannot read a line of
it.

They are written now. By hand — the romaniser in `audio/romanise.js` could have
filled them mechanically and must not: it is a rough phonetic skeleton built for
scoring speech, documented as never to be shown to a learner, and handing someone
an approximation of how their grandmother's language sounds is exactly the wrong
thing for this app to do.

Conventions follow whatever each pack already used, rather than imposing a new
one:

- **Mandarin** — pinyin with tone marks, words spaced, proper nouns capitalised.
  Tone sandhi is marked on 不 and 一, because the learner has to say it that way:
  不是 is `bú shì`.
- **Korean** — Revised Romanization, particles hyphenated off the noun
  (`eomeoni-neun yori-reul jalhaeyo`), liaison applied as it is actually said
  (할아버지 → `harabeoji`).
- **Japanese** — modified Hepburn with macrons, particles written as they are
  **said**: は → `wa`, を → `o`, へ → `e`.
- **Arabic / Urdu / Punjabi** — the readable convention speakers actually use,
  not an academic system with dots under letters nobody can type. Sun letters
  assimilate (`ash-shams`, `as-sooq`); Roman Urdu stays Roman Urdu
  (`yeh kitaab hai`).

## Then two bugs, found by checking it reached the screen

Filling the data proves nothing. Both of these were found by driving real
lessons in a browser, and neither is visible in the data.

### The re-teach card never showed it

There are two places a learner meets an example sentence. The flashcards at the
start of a lesson (`InContext`) rendered the romanisation correctly. The **v63
supportive recovery round** — the re-teach that fires when you got words *wrong*
— did not.

That is the worse of the two to lose. A learner who just missed a word is
re-shown it with an example sentence, and for a non-Latin language that sentence
was unsayable, at the exact moment they were already struggling.

The main fuzz never caught it because the fuzz mostly answers correctly and so
rarely enters recovery. `verify-recovery-card.mjs` now drives a lesson answering
**deliberately wrong** to force the round, and asserts the romanisation is on
screen — and that the line shown is one the language actually ships, not
something generated at render time.

### Eight screens each had their own copy of the language list, and none knew about Malayalam or Tamil

```js
const NON_LATIN = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn", "pa"]);
```

That set appeared **nine times** across `src/` — in Lesson, Flashcards, Reading,
Grammar, Conversations, SentenceLab, SkipAhead, InputStream, and (as its
inverse) AlphabetLessons. Malayalam and Tamil shipped in v89. Not one copy
learned about them.

So both languages were presented as though the learner could already read the
script: the native line became the hero instead of the English. And because
`InContext` gates the romanisation on that same flag, **every Malayalam and
Tamil example romanisation was hidden** — all 249 of them, including the ones
that had been there since v89.

This is the third time this exact shape of bug has hurt the same person. v90 was
a hardcoded empty state telling Malayalam learners they already used the Latin
alphabet. The failure is never the list being wrong on the day it is typed — it
is the list not knowing a language was added six months later.

There is one list now, in `src/data/registry.js`, and it names the **short**
side. A new language defaults to "the learner needs help reading this", which is
the safe direction to be wrong in. `validate-script-flags.mjs` fails the build if
a second copy appears anywhere in `src/`, matching on *shape* rather than on the
exact codes — so a "fixed" copy that adds ml and ta but stays a copy is still
caught. It caught a tenth copy on its first run: the one I had written myself in
v90.

## Corrections to my own reporting

I said mid-way that the Lesson sentence card "never showed translit" and called
it the bigger finding. That was wrong twice over, and worth recording:

1. The **live** flashcard path already rendered it correctly.
2. I then concluded the card I had fixed was dead code, because `buildIntroduce`
   is never called. Also wrong — `Lesson.jsx:369` pushes that exercise type
   directly in the recovery round.

The real finding was the one underneath both mistakes: the screen a struggling
learner sees was missing it, and eight copies of a stale list were hiding it for
two languages entirely.

## Guardrails added

| script | fails the build when |
|---|---|
| `validate-translit.mjs` | a non-Latin language has an example with no romanisation; a romanisation still contains native script; one sentence romanised two ways; pinyin syllables ≠ characters; word counts disagree without a linguistic reason |
| `validate-script-flags.mjs` | a second hardcoded script list appears in `src/`; the registry and `validate-alphabets` disagree about which languages are Latin |
| `verify-recovery-card.mjs` | either example surface — the flashcard or the re-teach card — shows no romanisation, or neither surface was observed at all |

The word-count check encodes the **rules** rather than a list of excused
sentences — Urdu's future auxiliary merging into the verb (آئے گا → `aayega`),
Arabic's و prefix splitting off as `wa`, hyphens joining what the script writes
apart — so new content gets the same treatment automatically. That took the
warnings from nine legitimate ones down to zero, which matters: nine warnings
that are all fine is how people learn to ignore warnings.

The pinyin syllable check earned its keep immediately. Across all 173 Mandarin
sentences it flagged exactly one — 请慢点儿说, where erhua fuses 儿 onto the
previous syllable — and nothing else. My first attempt at excusing that case was
too broad and wrongly excused 儿子 and 女儿, where 儿 is a full syllable; it now
detects the fusion in the romanisation, where it is actually visible.

## A note on how the verification itself went wrong twice

The first attempt at checking this was folded into the main fuzz. It reported
nothing and I nearly read that as a pass — twice. Both times the check was
structurally unable to see what it was looking for:

1. It watched for the re-teach card, which only appears after mistakes, and the
   fuzz mostly answers correctly.
2. Repointed at the flashcard, it still saw nothing — because the example is on
   the **back** of the card, and the card flips on a click on a `<div>`, not a
   button. A button-clicking driver never turns it over.

A check that observes nothing and prints nothing is indistinguishable from a
check that passed. The fuzz assertion was reverted — the fuzz stays what it is
good at, hunting crashes — and the behaviour check lives in
`verify-recovery-card.mjs`, which drives lessons properly, flips the card, and
**fails loudly if it observed no example surface at all** rather than reporting
a quiet success.

## Verified

`npm run check` — 19 languages, 2,965 words, 100% example romanisation across
all 11 non-Latin languages, 0 errors; one source of truth, 0 errors.

`verify-recovery-card` — all 11 non-Latin languages, flashcard surface, every
line confirmed to be one the pack actually ships:

| | flashcard | re-teach card |
|---|---|---|
| ml | `shari, pokaam` | `ningalkku sukhamaano?` |
| ta | `sari, pogalaam` | not triggered |
| hi | `maaf kijiye` | not triggered |
| ar | `as-salamu alaykum wa rahmatullah` | `marhaba sadeeqi` |
| bn | `biday bondhu` | `assalamu alaikum bhai` |
| fa | `salâm âghâ, hâl-e shomâ chetore?` | not triggered |
| ja | `ohayō gozaimasu` | `konnichiwa Tanaka-san` |
| ko | `annyeonghi gaseyo` | `annyeonghaseyo chingu` |
| pa | `maaf karna yaar` | not triggered |
| ur | `maaf karein janab` | `assalam alaikum` |
| zh | `duìbùqǐ, wǒ chídào le` | `nǐ hǎo péngyǒu` |

Malayalam and Tamil are the two that mattered most: both surfaces were blank of
romanisation before this change, for every sentence.

`verify-lessons-browser` — full fuzz, 19 languages, 152 lessons, 12,906 steps,
0 problems, bundle hash identical at both ends of the run.
