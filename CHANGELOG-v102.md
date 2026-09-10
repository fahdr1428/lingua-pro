# v102 — Vietnamese and Yoruba

Two languages, 256 words, and a bug that had been quietly spreading since v92.

## Why these two

The app's line is "learn the languages the world ignores". Both of these are
enormous and both are genuinely untaught:

| | speakers | diaspora | courses worth the name |
|---|---|---|---|
| **Vietnamese** | ~85M | 2.3M in the US alone; Australia, France, Canada, Germany, Czechia | beginner apps, then nothing |
| **Yoruba** | ~45M | London, Houston, Toronto, Salvador | effectively none |

They also share the thing this app is best placed to fix. Both are written in
the Latin alphabet, so they *look* readable — and both are routinely written
without the marks that make them unambiguous:

```
Vietnamese   ma ghost · má mother · mà but · mả tomb · mã horse · mạ seedling
Yoruba       ọkọ̀ vehicle · ọkọ husband · oko farm
```

A learner who has only ever seen unmarked Yoruba or unmarked Vietnamese has been
looking at ambiguous text and blaming themselves for not following it. Every
headword and every example in both packs carries its full marks, and the letters
course teaches the marks rather than the alphabet — which is the part a learner
is actually missing.

## What each language shipped with

Not a vocabulary list. The same eight things every other language has:

- **131 Vietnamese / 125 Yoruba words**, each with an example sentence, covering
  every one of the 42 survival and 65 everyday concepts in `coreVocabulary.js`
- **an alphabet course** — Vietnamese's six tones and six extra vowels, Yoruba's
  three tones and its dotted letters; both with the `đ`/`d` and `ẹ`/`e` traps
  spelled out
- **a route map** — eight stops, each a real exchange
- **a guide** — Linh, who runs a phở shop in Hanoi that opens at five; Bọ́lá, an
  Ibadan drummer, because the talking drum works by copying the language's tones
- **8 culture notes each**, including why Vietnamese has no neutral word for "I"
  and why not greeting someone in Yoruba reads as a refusal
- **6 conversations each**
- **a five-rung Sentence Lab** — Vietnamese classifiers and the `không` that both
  negates and asks; Yoruba's pre-verb particles and the `ṣé` that fronts a question
- **86 second frames**, so no survival word is met only once

Reading passages are deliberately absent and declared as such, the same as for
the other five languages waiting on a native speaker. Generating prose and
calling it course material is the one thing this project has said it won't do.

## The bug underneath

Adding the packs failed the build with 256 errors: *"missing translit"* on every
Vietnamese and Yoruba word. Both are Latin-script and carry no transliteration —
so something didn't know that. Six somethings, in fact:

```
scripts/import-vocab.mjs        es fr id pcm tr
scripts/measure-input.mjs       es fr de id pcm tr
scripts/validate-journey.mjs    es fr id pcm tr
scripts/validate-vocab.mjs      es fr id pcm tr de tl so
scripts/validate-alphabets.mjs  es fr de id tr pcm tl so
scripts/merge-core-vocab.mjs    es fr de id tr pcm tl so
```

Six hand-kept copies of the Latin-script list, **already drifted** — three of
them had never learned about German, Tagalog or Somali, added versions ago.

This is exactly the v92 bug. That one was nine copies of `NON_LATIN` inside
`src/`, which between them hid 249 romanisations from learners; it was fixed by
consolidating into `registry.js`. The scripts were never included, so they went
on copying it. All six now import `LATIN_SCRIPT_LANGUAGES` from the registry.

`validate-script-flags.mjs` used to guard this by comparing two literals — the
registry's and the one in `validate-alphabets`. Comparing two copies cannot
notice a third. It now checks the thing that actually matters: that each of
those six files still imports the registry's set and has not grown its own.

```
✗ scripts/validate-vocab.mjs has grown its own Latin-script list again.
  There is one, in src/data/registry.js, and every copy of it in this
  repo's history has drifted.
```

## And a smaller one in the gloss parser

`taughtGlosses` split a translation on commas and *then* stripped parentheses, so
`"yes (polite, northern)"` became `"yes (polite"` — which normalises to
`yes polite` and matches nothing. Vietnamese needs a parenthetical on half its
pack (northern/southern, which pronoun, which register), so it surfaced
immediately. Parentheses come off first now.

## Verified

- `npm run check` — **21 languages, 3,401 words, 5,031 sentences**, every
  validator and audit, exit 0
- `validate-core-vocab` — vi and yo teach all 42 survival and all 65 everyday concepts
- `verify-lessons-browser` — vi and yo, all four progress states: 16 lessons,
  1,440 steps, 0 problems
- `verify-sentence-lab` — 10 labs opened, 34 tiles read, 0 problems
- full browser fuzz across all 21 languages
