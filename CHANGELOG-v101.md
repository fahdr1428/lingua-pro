# v101 — a word met once is known once

The app's own research audit has named the same weakness for eighteen versions:

> "A word met in a single frame is known in that frame."

Measured after v100: **2,651 of 3,145 words — 84% — appeared in exactly one
sentence in the entire app.** A learner who meets *beber* as "Beber agua" and
nowhere else has learned a collocation, not a verb.

## 787 second sentences

Every one of the 42 **survival concepts** — the words every language is required
to teach, and the ones the SRS shows most — now has two frames in all nineteen
languages.

| | before | after |
|---|---|---|
| survival words with one frame | **607** | **0** |
| all words with one frame | 2,651 (84%) | 2,044 (65%) |
| words with two or more | 494 (16%) | **1,101 (35%)** |
| sentences in the app | 3,858 | **4,645** |

## What makes it a second frame

Not a second sentence — a different one. The word has to be doing a different
job:

```
Beber   frame 1  "Beber agua"                bare infinitive, then object
        frame 2  "Bebo té cada mañana"       conjugated, sentence-initial

baño    frame 1  "¿Dónde está el baño?"      object of a question, final
        frame 2  "El baño está a la derecha" subject, initial
```

`validate-second-frames.mjs` enforces the part it can: the two frames must not
be the same sentence apart from punctuation, and one must not be wholly inside
the other with the word in the same place. Run against the **existing** extras
before a single new one was written, it found **25 dead frames** — pairs that
looked like two sentences and were one:

```
Sí claro / Sí, claro          Mi madre / Mi madre cocina bien
No gracias / No, gracias      بہت شکریہ / بہت بہت شکریہ
```

All 25 replaced. Six base examples that were one- or two-word fragments —
"Görüşürüz!", "ごめんなさい", "很好" — were turned into sentences, because a
phrase is not a frame.

## The bigger find

While checking that the new sentences reached a learner, `src/engine/inputStream.js`
turned out to read

```js
for (const ex of v.examples || [])
```

— the pack's own examples, and nothing else. **It never called `mergeExamples`,
so `extraExamples.js` had never reached the input stream at all.** That is 1,160
sentences, a third of the app's corpus, absent from the one screen whose entire
purpose is comprehensible input. The vocabulary cards merged them. The reading
feature did not, and nothing noticed because every check read the data files
rather than what the engine returns.

One line. The effect on what a learner can actually read:

| sentences available at 30 words known | before | after |
|---|---|---|
| French | 16 | **26** |
| Bengali | 21 | **30** |
| Hindi | 24 | **30** |
| Urdu | 16 | **23** |
| Somali (at 10 words) | 2 | **6** |
| Malayalam (at 10 words) | 7 | **11** |

## A check that couldn't fail, caught

The first version of this proof was a browser test: open the reading screen,
look for a sentence that exists only in `extraExamples.js`. It passed. It also
passed against a build with the merge **deliberately removed** — the screen
surfaces sentences by more than one route, so the absence never showed.

A check that cannot fail is worse than no check, so it was thrown away and the
claim moved to where it can be isolated. `test-input-stream.mjs` calls
`readableSentences` and looks at what comes back:

```
with the merge:     526 of 978 extra-only sentences served
without it:           0 of 978   — ar 0/41, bn 0/46, de 0/51, es 0/64 …
```

## Other things the checks caught, in the content written minutes earlier

- **Ten new sentences already existed elsewhere in the same pack.** "水很冷"
  belongs to 冷, "Su soğuk." to soğuk. `mergeExamples` dedupes per lemma, so they
  would have merged cleanly and simply repeated a sentence the learner had
  already seen on another card. `validate-word-truth` found every one; the merge
  script now checks the whole pack rather than one word.
- **Two romanisation clashes** — the same sentence written two ways on two cards.
- **A Tagalog `din`/`rin` mismatch** and three other card/example disagreements,
  from v100's frames check.

## Honest limits

`validate-second-frames` warns rather than fails when the word sits in the same
part of both sentences, because position is only a proxy for the thing that
matters. 水を ください and 水が冷たいです put 水 in the same place and use it as an
object and then a subject; failing the build on the proxy would push someone to
reword good frames to satisfy it.

It also reports, without failing, that **808 pairs still have a phrase of two
words or fewer on one side** — almost always the pack's original example. The
second frame is a sentence everywhere now. The first often still isn't. That is
the next piece of this work.

## Verified

- `npm run check` — 3,145 words, **4,645 sentences**, every validator and audit, exit 0
- `validate-second-frames` — 980 pairs, no second frame repeats the first
- `test-input-stream` — 526 of 978 extra sentences reach the stream; **0 of 978**
  with the merge removed
- full browser fuzz across all 19 languages
