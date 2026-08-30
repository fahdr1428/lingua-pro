# v98 — the Sentence Lab, for everyone, and it stops giving away the answer

The Sentence Lab is the only exercise in the app where a learner *assembles* a
sentence instead of recognising one. Two things were wrong with it.

## 1. Eight languages never saw it

`hasSentencePatterns()` gates the Lab, so German, Chinese, Persian, Punjabi,
Tamil, Malayalam, Somali and Tagalog learners simply never met the exercise —
correctly gated, silently absent. All eight now have a five-rung ladder.

They are not translated English templates. Each ladder is built around the thing
that language does differently, because that is the thing a learner gets wrong
for years otherwise:

| | the rung that matters |
|---|---|
| **German** | the conjugated verb is the **second** thing in the sentence, always — *Morgen gehe ich*, never *Morgen ich gehe* |
| **Chinese** | measure words — you cannot say "one sister", it has to be 一**个**姐姐 — and the question word **stays where the answer goes**: 洗手间在哪里？ |
| **Persian** | the verb comes last: *man âb mikhoram* is word-for-word "I water drink" |
| **Punjabi** | the present tense agrees with the **speaker's gender** — پیندا ہاں / پیندی ہاں — taught at level 1, not as a footnote |
| **Tamil** | questions are a **suffix**: பேசுகிறீர்கள் → பேசுகிறீர்கள**ா**? Nothing moves |
| **Malayalam** | the same trick with -ഓ, plus dative subjects for having and wanting |
| **Somali** | every statement needs `waa`, and `ma` at the front *replaces* it to ask — a sentence has one marker or the other, never both |
| **Tagalog** | the verb comes **first**, and `ba` sits near the front rather than at the end |

That closes the last feature gap: **all nineteen languages now have every
feature except reading passages**, which stay deliberately open (five languages,
waiting on a native speaker — `validate-passages.mjs` names them and the reason).

## 2. A third of build steps handed over the finished sentence

The word bank was shuffled like this:

```js
arr.slice().sort(() => Math.random() - 0.5)
```

A comparator that ignores its arguments is not a shuffle. Measured over 4,000
deals per size:

| chunks | dealt already in the correct order |
|---|---|
| 2 | **49.7%** |
| 3 | **37.8%** |
| 4 | **19.3%** |
| 5 | 8.8% |

Thirty-seven of the shipped steps are two chunks — every level-1 pattern in
several languages is *"Ich trinke"*, *"Kumakain ako"*, *"دستشویی کجاست؟"*. Across
all the content the app ships, **37% of build steps opened with the sentence
already assembled**, and the learner tapped left to right for a 🎉.

Now Fisher–Yates, reshuffled while the result still matches the answer.
`shuffleBank` moved into its own file so it can be tested without a browser, and
`test-shuffle.mjs` fails with exactly the table above against the old line.

## 3. Two smaller things in the same screen

- **Dead buttons in the tab order.** Tiles already placed render through the same
  `ChunkTile` with no `onClick` — still real `<button>`s, so a keyboard user was
  walked through a row of controls that do nothing. They're `disabled` now, which
  is both the accurate semantics and removes them from the tab order.
- **"Not quite" was only a colour.** The wrong-order message and the "Perfect
  word order!" celebration mounted and unmounted with no live region, so a screen
  reader user tapped a tile and got silence either way. Both are `role="status"`
  now.

## The check that had to exist first

`validate-sentence-lab.mjs`, and the reason it exists is one line of
`SentenceLab.jsx`:

```jsx
{isNonLatin ? chunk.translit : chunk.text}
```

In eleven languages **the draggable tile is the romanisation**. A chunk with a
missing `translit` isn't a cosmetic flaw there — it's a blank tile the learner is
asked to place, and the source file it came from looks completely fine, because
it has a perfectly good `text`. Reading the data would never show you this. It
also checks that ladders climb, that every tile has a gloss, that roles are real
(a wrong role makes the colour legend lie about the grammar), that a twist isn't
the base sentence again, and that `getPatternForDrop` returns something for every
drop past the end of the ladder.

Proven capable of failing: blanking one `translit` and mislabelling one role
produced exactly those two errors and exit 1.

### And the check earned itself immediately

It also compares each tile's script against the one the language pack actually
teaches — and caught the Punjabi ladder, which I had written in **Gurmukhi**.
This pack writes Punjabi in **Shahmukhi**, the Perso-Arabic script, as it is
written in Pakistan. Every other screen in the course shows the learner
Shahmukhi. The Lab would have switched to a completely different alphabet
partway through, and nothing else in the repo would have said a word — the
patterns were correct Punjabi, just in the script the learner has never been
shown.

```
✗ pa: pattern 1 base chunk 1: written in Gurmukhi, but this pack teaches Arabic — "ਮੈਂ"
```

Rewritten in Shahmukhi against the pack's own sentences, down to the copula:
Punjabi uses **اے (ae)**, and Urdu's ہے (hai) is the giveaway that someone is
speaking Urdu with Punjabi words. The level-3 rung teaches that چاہیدا agrees
with the *thing wanted* rather than the speaker — مینوں پانی چاہیدا اے but
مینوں مدد چاہیدی اے.

## Verified

- `npm run validate-sentence-lab` — 19 languages · 95 patterns · 605 tiles · 0 errors
- `npm run test-shuffle` — 9 pass, 0 fail; 5 fail against the old shuffle
- `npm run validate-feature-coverage` — sentence lab now `yes` for all 19
- `npm run check` — every validator, audit and build, exit 0
- `verify-lessons-browser` — full fuzz across all 19 languages
