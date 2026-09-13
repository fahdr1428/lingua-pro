# v103 — the state the app actually finds

Four bugs, all of the same family: something was written correctly once, and a
second piece of code that came later disagreed with it and nobody noticed,
because nothing was watching that seam.

## 1. Reading forgot everything you read

`Reading.jsx` had two writers for `appState.passagesRead`, and they disagreed
about what it was:

```js
line 29   passagesRead: { ...st.passagesRead, [code]: ids }   // a map
line 94   passagesRead: (s.passagesRead || 0) + 1             // a counter
```

It is the map — `{ langCode: [passageId, …] }`, declared in `App.jsx`. The
second line runs when a comprehension answer is correct, and `{} || 0` is `{}`,
and `{} + 1` is the **string `"[object Object]1"`**. So getting one reading
question right replaced the entire per-language read history with fifteen
characters of nonsense. The next visit read `passagesRead?.[code] || []` off
that string, got `[]`, and started drawing from the whole library again.

That is exactly the repeat-passage bug v79 was written to fix:

> It used to be component state, reset every time the screen mounted, so the
> next passage was drawn at random from the whole set each visit. […] a learner
> could open Reading five times and be handed the same piece four times, and
> conclude there was nothing else in there.

v79 fixed it. This line quietly un-fixed it.

Verified in a browser before and after — `verify-reading-memory.mjs` answers the
comprehension question correctly (reading the passage's own answer out of
`passages.js`, since the options lock after one attempt) and then looks at what
is in storage:

```
before   es: passagesRead is a string ("[object Object]1"), not a map — the read history is gone
         ar: passagesRead is a string ("[object Object]1"), not a map — the read history is gone
after    29 reading visits across 10 languages · no repeats, no corruption
```

The passage is also recorded **when you answer**, not only when you press "More
to read" — a learner who read one piece and left had the visit forgotten.

## 2. Two badges that could never be earned

The same value was the "First Read" badge's only evidence:

```js
check: (c) => (c.appState.passagesRead || 0) >= 1,
```

As the map it is meant to be, an object is never `>= 1`. As the corrupted
string, `NaN >= 1`. **There was no value of `passagesRead` that both kept the
history and unlocked the badge.**

The "First real text" milestone on the profile screen had a different answer to
the same question, and it was also always zero: it counted
`sessions.filter(s => s.type === "reading")`, and nothing in this app has ever
written a session of type `"reading"`.

Both now use `countPassagesRead()`, which reads the record that actually exists.

## 3. The line after every answer was unreadable in eleven languages

Under the correct/wrong card, `Lesson.jsx` rendered:

```jsx
<em>{item.examples[0].native}</em> — {item.examples[0].translation}
```

No romanisation. No `dir`. No `lang`. In eleven languages that is a line of
script the learner is here **precisely because they cannot read it**, and the
romanisation was sitting in the same object, unused — all 2,442 non-Latin
example sentences in the repo carry a `translit`, without exception. It is the
v92 bug (587 romanisations in the data, none on screen) on the busiest surface
in the app: it appears after every single answer.

The missing `dir` was its own bug. `<em>مرحبا صديقي</em> — hello my friend` has
no direction on the native run, so the bidi algorithm pulls the em-dash and the
English into the right-to-left run and the line comes out in a jumbled order.
That cannot be seen in the source, which is why the check is a browser check:

```
before   ta: feedback line "நீங்க எப்படி இருக்கீங்க?" has no romanisation beside it
         ta: feedback line "நீங்க எப்படி இருக்கீங்க?" has no dir attribute — bidi will scramble it
         ko: feedback line "안녕하세요 친구" has no romanisation beside it
```

It now renders through `InContext` — the component the new-word card has used
since v79 — so it gets the romanisation, the direction, the language, the word
picked out inside its own sentence, and tap-to-hear.

It also shows **the sentence the question was actually built from**
(`exercise.example`) rather than `examples[0]`. 1,193 of 3,401 words now carry a
second frame and the generator chooses between them by which words the learner
already knows, so pinning the footer to the first one showed a different
sentence from the one just answered.

## 4. 425 words were barred from sentence exercises by a stale gate

`chooseExerciseType` asked `examples[0]` how long it was and decided from that
alone whether a word could carry a sentence exercise:

```js
const ex0 = item.examples?.[0]?.native || "";
```

Since v101 a word can have several frames, and for 425 of them the first is the
short one. Arabic مرحبا leads with `مرحبا صديقي` (2 words) and also has
`مرحبا، كيف الحال؟`. Those words were quietly barred from `BUILD_SENTENCE` and
`TAP_WORDS` even though `pickBestExample`, twenty lines away, would have found
them a sentence — and `buildGraduatedSet` was already asking the whole set. The
gate now asks the question the builders will actually ask.

```
newly eligible for BUILD_SENTENCE (≥3 words):       425
newly eligible for TAP_WORDS / COMPLETE (≥2 words):  22
ar:54  ko:39  bn:38  es:32  hi:32  tr:31  fa:30  fr:30  ta:29  ur:28  ml:27 …
```

Opening that gate exposed the other half of the same seam. `pickBestExample`
chose between a word's frames by how many of their words the learner already
knew — and nothing else. So the gate could say "this word can carry a sentence
exercise, one of its frames is long enough", and the picker could then hand
back the short frame, and the builder would fall back to an easier question.
The same disagreement in `COMPLETE_SENTENCE`, which blanks the word out of its
own sentence: **270 words have some frame containing the word and some frame
that doesn't**, and the picker had no reason to prefer the usable one.

`pickBestExample(minWords, mustContain)` now sets aside candidates that can't
do the job when any candidate can, and lets learned-word overlap decide between
what's left. The gate and the picker ask the same question.

(A further 253 words have *no* frame containing the lemma at all — inflected
forms, and the two scripts with no word boundaries. Those fall back either way;
that is the soft failure `InContext` has documented since v79, not a bug.)

## 5. A saved state the app couldn't read took the screen down

Found by accident, from a malformed test seed: `chaptersPassed: { ar: true }`.
`chapters.js` does `chaptersPassed?.[langCode] || []` and then `.includes(n)`;
`true.includes` throws; the throw happened inside a lazy boundary, so the error
screen never appeared and **the route map sat on "Loading…" forever** with no
way back but clearing site data.

The underlying reason is that `usePersistentState` *replaced* the defaults with
whatever was in `localStorage` rather than merging onto them. So a save written
several versions ago also arrives with every key added since set to `undefined`
rather than its default.

`localStorage` is not a trusted input. It is shared with every version of Zaban
that has ever run on that device, it survives reinstalls, and a person can edit
it by hand. `normalizeAppState` now reconciles it against `DEFAULT_APP_STATE`
before the app sees it — keeping a saved value only when it is the same kind of
thing the default is, and dropping per-language entries that are not lists.

It deliberately **does not** delete keys it doesn't recognise: a value written
by a *newer* version, from a second tab open across a deploy, is carried through
untouched rather than silently destroyed.

Being exact about what this fixed: rebuilt with the reconciliation unwired,
only the `chaptersPassed` case actually crashed. The other five saved states in
`verify-state-recovery.mjs` reach a usable screen either way, because their call
sites happen to guard. They are kept because "happens to guard today" is not a
property anyone maintains, and because they are the shapes real devices are
carrying right now — but this is one demonstrated crash prevented, not six.

## 6. And the flashcard, still showing an English sentence

The back of a flashcard showed `"{examples[0].translation}"` and nothing else:
the word, its English meaning, and an English sentence. Nothing about how the
word behaves in the language. That is word-for-word what v79 fixed on the
lesson's new-word card, still sitting on the screen whose entire job is to show
you a word.

Three surfaces show an example sentence, and each of the two that came after
v79 rendered it by hand instead of reusing `InContext` — and each lost something
doing it. `InContext` is now `src/ui/InContext.jsx`, so there is one place for
that to be right.

## 7. 104KB downloaded before the first word, to answer a yes/no question

The home screen decides whether to offer the "listen and read" door like this:

```js
getConversations(pack.code).length > 0 || (PASSAGES[pack.code] || []).length > 0
```

`Home.jsx` is eagerly imported, so that line pulled `conversations.js` (75KB of
source) and `passages.js` (29KB) into the bundle every learner downloads before
their first word — for two `.length` checks. Both screens that actually *show*
that content are lazy. Only the question "is there any?" was keeping the answer
in the first payload, and the answer is 42 numbers.

`contentIndex.js` is those numbers, generated. Generated rather than hand-kept
because a hand-kept index is a copy, and every copy in this repo's history has
drifted — nine of `NON_LATIN` in v92, six of the Latin-script list in v102.
`validate-content-index` regenerates it and compares byte for byte, and also
walks the static import graph from `main.jsx` to check the libraries have not
crept back in:

```
✗ src/data/passages.js (the reading library) is statically imported into the eager
  bundle again — every learner downloads it before their first word.
  Imported via: src/screens/Home.jsx ← src/screens/screens.jsx ← src/App.jsx.
```

| | before | after |
|---|---|---|
| eager import graph | 1,290KB of source | 1,187KB |
| first-load chunk | 848KB | 768KB |
| **gzipped over the wire** | **259KB** | **235KB** |

24KB of gzip off the first paint, for an app whose whole point is reaching
people in diaspora communities who are often not on fast connections.

What was deliberately *not* done: `culture.js` (67KB), `sentencePatterns.js`
(108KB) and the three grammar files (93KB) are also in the eager graph, and
they are not availability checks — the home screen renders the culture note of
the day and the next Sentence Lab pattern, and lessons render grammar moments.
Getting those out means making them load asynchronously, which changes render
timing across the app. That is a real change to a codebase whose current
stability rests on a 14,177-step fuzz, and it does not belong in a release
that is otherwise about correctness. Noted, not attempted.

## Checks added

Each one was run against a build with the fix removed, and each one failed
there. A check that has never failed is not evidence.

| | |
|---|---|
| `test-state-shape` | 15 saved states and writes this app has to survive — in `npm run check` |
| `verify-reading-memory` | plays Reading in a browser, in every language with a library |
| `verify-answer-feedback` | reads the line under the answer, in all eleven non-Latin scripts |
| `verify-state-recovery` | opens the app with six damaged saves and asks if it is usable |
| `validate-content-index` | the generated index still matches, and the heavy libraries are still out of the eager bundle — in `npm run check` |

And one tripwire that fires at the moment of the mistake rather than after it.
Repairing a bad save at load means the app now *survives* a writer that
disagrees with the rest of the code about what a field is — and would then
never mention it again. Self-healing that hides the wound is worse than the
wound, so `warnOnShapeChange` runs on every write in development:

```
[state] app.passagesRead changed type: object → string ("[object Object]1").
The default for this field is an object. Whoever wrote this disagrees with the
rest of the app about what the field is.
```

That is the exact line this release started from. It would have fired the first
time anyone opened Reading in `npm run dev`.

## An existing check earned its keep, and then needed rewriting

`validate-feature-coverage` failed this release. Good — that is the check that
exists because Persian, Malayalam, Tamil, Somali and Tagalog once shipped with
a "Listen & follow" door that opened onto an empty screen.

But it failed for the wrong reason. It matched one exact spelling of the gate:

```js
/getConversations\(pack\.code\)\.length > 0/ && /PASSAGES\[pack\.code\]/
```

which tests how the line is *phrased*, not whether the door is gated. Moving
the availability question onto `contentIndex` kept the gate and did the same
job, and this failed the build anyway. It now accepts any spelling that
genuinely answers the question, from a named set — and still fails when the
gate is deleted, which is the regression it exists for:

```
✗ Home.jsx offers "Listen & follow" without checking that any conversations or
  passages exist — for a language with neither, that door opens onto an empty
  screen. If the gate was rephrased rather than removed, add the new spelling
  to CONVERSATION_GATE / PASSAGE_GATE in this file.
```
