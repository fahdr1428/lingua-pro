# v93 — the guide congratulated Malayalam learners in Malayalam script

Every language has a guide: a named person with a city, a craft and a voice, who
greets you, reacts when you get something right, and says well done at the end of
a lesson. It is the app's entire warmth layer — the part that isn't a test.

For sixteen languages that copy is **romanised**, blended with English:

> Priya (Hindi): *"Shabaash! Bilkul sahi. Bahut khoob."*
> Jisoo (Korean): *"Wanbyeok! Perfect. Jeongmal jalhaesseoyo."*

Malayalam, Tamil and Persian shipped in v86 and v89 with **all of it in native
script** — greetings, the correct/wrong reactions, the streak note, and the
end-of-lesson celebration:

> Sreeja (Malayalam): *"കൊള്ളാം! ഒരു തെറ്റുപോലുമില്ല."*
> Meena (Tamil): *"அருமை! ஒரு தப்பு கூட இல்லை."*
> Roya (Persian): *"عالی بود! بدون هیچ اشتباهی."*

So the one moment the app stops testing you and says *well done*, it said it in a
script you came here because you cannot read. Every reaction to every answer,
too — "ശരി!" for correct, "സാരമില്ല." for wrong. The warmth layer was invisible
to exactly the learner it was built for.

All three guides now speak the way the other sixteen do, keeping their voice and
their city:

> Sreeja: *"Kollaam! Oru thettu polum illa. Not one."*
> Meena: *"Arumai! Oru thappu kooda illai. Not one."*
> Roya: *"Aali bood! Bedoone hich eshtebaahi. Not one."*

`validate-guide-copy.mjs` fails the build if any guide's learner-facing copy
contains a script the learner can't be assumed to read. `signature` is exempt —
it ships with its own `translit` and `en`, and showing the real script there is
the point.

## A hole in v92's own validator

v92 reported **"100% of examples romanised"**. That was true of the language
packs, and `registry.js` merges `src/data/extraExamples.js` into the vocab at
load time — which `validate-translit.mjs` never read.

So 65 Urdu and Hindi example sentences reached learners with no romanisation
while the check said everything was fine. A validator that measures a file
rather than what the learner actually gets is worse than no validator, because
it produces a number people trust. All 65 are written, and the extras are now
folded into the same count as everything else.

## A third of the "extra examples" were dead

`extraExamples.js` exists to give a word a **second** frame — the single most
requested thing in RESEARCH.md, since 96% of words are met in exactly one
sentence. Its header says every key was verified against the vocab, and it was:
the **lemma** was checked. The **sentence** never was.

`mergeExamples()` dedupes by native string. **49 of the 149 entries repeated a
sentence the pack already had**, so they were dropped at load and gave the
learner nothing:

| | live extras | dead duplicates |
|---|---|---|
| Spanish | 31 | 12 |
| French | 30 | 11 |
| Urdu | 21 | 17 |
| Hindi | 18 | 9 |

All 49 replaced with sentences that put the word in a **different grammatical
role**, which is the point of a second frame — the word generalises through
varied encounters, not repeated ones:

- `Grande`: "Una casa grande" → **"Mi hermano es más grande"** (attributive → comparative)
- `Ir`: "Voy a casa" → **"¿Adónde vas?"** (statement → question, 1st → 2nd person)
- `Avoir`: "J'ai faim" → **"Tu as le temps ?"**
- `کل` (yesterday/tomorrow): "کل ملیں گے" → **"کل بارش ہوئی تھی"** (future → past, the word's other meaning)
- `رات`: "اچھی رات" → **"وہ رات کو کام کرتا ہے"** (greeting → adverbial)

The Urdu one matters most: کل means both *yesterday* and *tomorrow*, and the
only example used it as tomorrow.

`validate-translit.mjs` now fails the build on an extra that duplicates a pack
sentence, or one keyed to a lemma that doesn't exist.

## Then a second frame for the other fifteen languages

`extraExamples.js` covered four languages. It now covers **all nineteen**:

| | before | after |
|---|---|---|
| languages with second frames | 4 | **19** |
| live second frames | 100 | **371** |
| dead duplicates | 49 | **0** |
| words met in a single sentence | 96% | **83%** |
| words with two or more frames | 125 | **494** |

Every one was written to put the word in a **different grammatical role** from
the sentence already in the pack, because that is the point — a word met twice
in the same shape is met once:

- `کل` (Urdu, *yesterday* and *tomorrow*): the only example used it as tomorrow.
  Now also **"کل بارش ہوئی تھی"** — it rained yesterday.
- `一` (Japanese, counter): "一つ" → **"一時に会いましょう"** — the same character
  as a clock hour rather than a thing-counter.
- `是` (Mandarin): "是的" standing alone → **"他是我朋友"** as a copula.
- `Bitte` (German, *please* and *you're welcome* and *pardon?*): "Einen Kaffee,
  bitte." → **"Wie bitte? Ich habe das nicht verstanden."**
- `ശരി` (Malayalam, *okay* / *correct*): "ശരി, പോകാം" as agreement →
  **"ഇത് ശരിയാണോ?"** as an adjective.

The dead-extra check caught six collisions while writing these, including three
where the sentence I chose already existed under a different lemma.

## Found by the check I wrote last time

The duplicate-romanisation check added in v92 — "the same sentence romanised two
different ways" — caught 11 of these immediately, because I had romanised the
duplicates differently from the pack's existing version. It also caught six more
dead extras my own manual pass missed: I compared each extra against **its own
lemma's** examples, while the validator compares against the **whole pack**, and
a sentence can duplicate a different lemma's example. The validator was stricter
than I was.

## And a trap I walked into twice more

Two of this round's checks were written against things that don't exist:

- selectors like `.guide-line` and `.result-praise` — the guide's reaction banner
  and celebration card are inline-styled `<div>`s with **no class names at all**,
  so the check would have matched nothing and printed a clean pass.
- a crude data auditor that flagged 51 "missing romanisations" in
  `sentencePatterns.js` — false positives: the chunks each carry their own
  `translit`, and only the wrapper object doesn't.

The guide check now searches the page text for the **actual strings** the guide
can say, pulled from `characters.js`. A selector that matches nothing looks
identical to a pass; a string search for known content cannot.

## Verified

- `npm run check` — 19 languages, 0 errors: alphabets, translit (now including
  the merged extras), script flags, guide copy, themes, grammar, engine, coach
- `validate-guide-copy` — 19 guides, every one speaks to the learner
- `verify-recovery-card` — in a real browser, Sreeja says *"Kollaam!"*,
  *"Midukkan!"*, *"Saaramilla."*; Meena says *"Arumai!"*, *"Paravaayilla."*;
  Roya says *"Doroste!"*, *"Aalie!"*, *"Nazdik bood!"* — every line readable,
  alongside the flashcard and re-teach romanisations from v92
- `verify-lessons-browser` — full fuzz across all 19 languages
