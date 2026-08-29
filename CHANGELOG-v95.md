# v95 — five languages had a door that opened onto nothing

A language pack is not one thing. It's vocabulary, a route map, a script course,
grammar, reading passages, scripted conversations, culture notes, verb tables and
sentence patterns — added by different passes at different times. The newest
languages arrived with the first few and none of the rest, and that is invisible
unless you open the app as one of those learners.

Nothing was measuring it. Now something is.

## What the measurement found

| | route map | guide | culture | conversations | passages | sentence lab |
|---|---|---|---|---|---|---|
| Persian | ✓ | ✓ | **—** | **—** | — | — |
| Malayalam | ✓ | ✓ | **—** | **—** | — | — |
| Tamil | ✓ | ✓ | **—** | **—** | — | — |
| Somali | ✓ | ✓ | **—** | **—** | — | — |
| Tagalog | ✓ | ✓ | **—** | **—** | — | — |

Culture is gated on `hasCulture()`, so those five learners simply never saw the
"Inside Tamil" door — a silent absence.

**Conversations were not gated.** Home offered *"Listen & follow — Scripted
conversations, with subtitles"* to every language, and for those five it opened
onto:

> 💬 No conversation starters for Tamil yet

An honest empty state, which is better than a crash. Not offering an empty room
is better than both.

## What's in it now

**40 culture notes** — 8 each for Persian, Malayalam, Tamil, Somali and Tagalog.
This is the app's differentiator, the "what natives notice" layer, and it was
missing from exactly the languages where it matters most:

- Persian **taarof** — the shopkeeper who waves your money away means nothing of
  the kind; you insist, twice, and then you pay.
- Tagalog **po** — the respect particle, and the single thing Filipino relatives
  notice first in a child raised abroad.
- Tamil **diglossia** — written Tamil and spoken Tamil are different enough that
  learning only the written form leaves you understanding the news and lost at a
  dinner table.
- Malayalam **chetta / chechi** — everyone slightly older is a brother or sister,
  including the bus conductor; using a bare name sounds abrupt.
- Somali **clan** — genuinely important, genuinely fraught, and not a learner's
  question to open with.

**60 scripted conversations** (396 lines) — 10 situations each for German,
Persian, Malayalam, Tamil, Somali and Tagalog, matching the ten every other
language already had. Several carry the note a phrasebook would leave out:

- Malayalam and Tamil goodbyes are *"I'll go and come back"* — neither language
  says a flat goodbye, and the literal version sounds final.
- Persian *"ghâbel nadârad"* at the shop is taarof, not a free item.
- Tagalog *"na-late ako"* — ordinary Taglish; nobody reaches for a pure Tagalog
  word there.

## The door is gated now

`Listen & follow` only appears when a conversation or a passage exists for that
language, the same way the culture door already worked.
`validate-feature-coverage.mjs` prints the whole matrix, counts the gaps, and
**fails the build** if that door is offered without the data behind it.

Remaining gaps, all correctly gated and now visible in one place: the sentence
lab covers 11 of 19, and five languages still have no reading passages — which
stays open deliberately, because passages want a native speaker rather than a
generated approximation.

## The new content was checked like everything else

`validate-word-truth.mjs` now covers the scripted conversations too — 396 more
lines through the same script-purity and romanisation checks as the example
sentences. **3,858 sentences checked, 0 errors.**

## And verified on screen

Adding data proves nothing. `verify-new-doors.mjs` drives a real browser for each
language, opens both doors, and reads back what is actually rendered:

```
=== fa ===
    ✓ culture: 8/8 notes on screen — e.g. "Taarof: the first offer is never the real one"
    ✓ conversations: 10/10 situations on screen — e.g. "Greeting someone"
```

All six languages, both screens, 8/8 and 10/10 every time.

### A mistake worth recording, for the fourth time

The first run reported *"no 'Inside <language>' door on Home"* for all five
languages. The door was there. My selector was `/^Inside /` and the tile's text
begins with its emoji — `🫖Inside Persian`.

This is the same anchored-regex trap that produced a false negative in v91
(`/Lesson 1\b/`), v92 (the flashcard on the back face) and v93 (`.guide-line`
selectors that matched nothing). Four times now the check has been wrong rather
than the app. The pattern is always the same: **a check that finds nothing looks
exactly like a check that passed**, so every one of these has to be proved
capable of failing before its silence means anything.

## Verified

- `npm run check` — 19 languages, 3,858 sentences, 0 errors; every door opens
  onto something, 0 errors; every clickable element keyboard-reachable, 0 errors
- `audit-a11y` — all screens, all three themes: 0 unnamed controls, 0 contrast
  failures, 0 missing alt, 0 unlabelled inputs
- `verify-new-doors` — fa, ml, ta, so, tl, de: culture and conversations both
  render, 0 problems
- `verify-lessons-browser` — full fuzz across all 19 languages
