# v82 — the words you can't learn, and the tab you left open

Two things, one about learning and one about shipping. The first is the more
important, and it had been in the app since the beginning.

---

## The app's answer to "I can't do this" was to ask something harder

Exercise difficulty was chosen from `reps` — the number of times a word had been
put in front of you. `reps` only goes up, and it goes up **just as fast when you
get it wrong**.

So a word you had failed six times looked, to the app, like a word you knew
well. It got the hardest question in the set: type it cold, build a sentence
with it. You failed. FSRS collapsed its stability, so it came back tomorrow.
Where it was asked the same way. Where you failed again.

Measured on a Spanish word forgotten seven times: **51 of 60 exercises were cold
production**. Not a tendency — very nearly the whole distribution.

In spaced repetition these are called **leeches**, and they are one of the main
reasons people quit. Anki's answer is to suspend the card, which in a language
course means quietly deciding on someone's behalf that they will never learn
"because". That isn't an answer.

**The word isn't the problem, the question is.** Someone who can't type a word
from cold can very often pick it out of four, or read it inside a sentence that
carries its meaning. That isn't a consolation prize — a successful retrieval is
the thing that builds stability in the first place, and an easy success does more
for a fading memory than a hard failure ever will. Get one win, and the word has
somewhere to grow from.

So difficulty now comes from an **effective** rep count that lapses pull back
down, and past five lapses the word is deliberately met in context, where there
is something to hold on to.

## And they stop eating the whole session

Reviews are sorted by retrievability, lowest first. That's right: the word
closest to being lost is the one most worth a repetition.

Taken literally it has an ugly consequence. The words you keep forgetting always
have the lowest retrievability — that is what forgetting them *means* — so they
win every slot, every day. Ten weeks in, a learner with thirty leeches opens the
app to a session made **entirely** of the thirty words they are worst at. In the
test deck, 8 of 9 queued words.

Every session ends in being wrong about the same things, nothing you *do* know
ever comes back, and there is no evidence of progress anywhere in the lesson.
That's a quitting experience, produced by a sort order that is individually
correct at every single step.

Struggling words now get a bounded share of the review slots — a third, minimum
two. Enough to work on properly, not enough to become the lesson. Three hard
words met carefully beats twelve skimmed.

## And the app says so

Getting a word wrong for the sixth time while the app says nothing invites
exactly one conclusion, and it's about the learner rather than the word. The
feedback card now ends with:

> This one keeps slipping. That happens with a few words in every language, and
> it isn't a verdict on you — we'll keep bringing it back gently until it sticks.

and, when they finally get it:

> And that's the one that keeps slipping away from you — nicely done.

---

## Measuring it, and being honest about the measurement

`simulate-learner.mjs` answers 85% of questions right at random, which is useless
here: a uniformly-random learner has no hard words, so nothing ever gets stuck.

`scripts/simulate-leech.mjs` gives each word a fixed intrinsic difficulty *for
this learner* and models the answer on three things — how fresh the memory is,
how hard that word is for them, and **how much the question is asking for**. That
third term is the point: it makes recognising a hard, half-faded word winnable at
about half, and typing the same word a near-certain failure.

**It runs six learners, not one, and that turned out to matter.** The lesson
generator makes twenty-nine `Math.random()` calls. A single run measures luck at
least as much as the algorithm — two runs of *identical* code differed by eight
words on the headline number, which is larger than most changes worth making. An
early single-run comparison said one variant was clearly worse; over twelve runs
it was clearly better. `Math.random` is pointed at the seeded PRNG so a trial is
reproducible end to end.

Twelve simulated learners, 90 daily lessons each:

| | before | after |
|---|---|---|
| words still being failed at day 90 | **15.5** | **12.4** |
| accuracy on those words, last six questions | 43% | **49%** |
| difficulty demanded of them (0 = pick from four, 0.55 = type it cold) | 0.27 | **0.17** |
| overall accuracy | 71% | **75%** |
| questions per lesson | 15.8 | 15.9 |

That last row is the one I had to work for. The first attempt routed struggling
words through the "new word" ladder and ran lessons **23% longer**; a second
tried two rungs and ran 13% longer. Over twelve learners those bought about one
further word rescued, at the cost of two extra questions in every lesson every
day for everyone. Longer sessions are their own way of losing people. **Easier
questions, not more of them.**

Both failures are guarded by assertions in `test-engine.mjs` that fail loudly
against the old code (`51 of 60 exercises on it were production`, `8 of 9 queued
words were leeches`), so this can't come back quietly.

---

## The tab you left open

v81 shipped a service worker. It also, without meaning to, made deploys worse.

This app code-splits fifteen screens into content-hashed chunks. Someone leaves a
tab open, we deploy, the chunk names change — and an hour later they tap
"Reading" and the old chunk is requested from a host that only serves the current
deployment. `React.lazy` rejects. The screen dies.

A **versioned** asset cache makes that strictly worse: the new worker activates,
deletes the old cache as housekeeping, and destroys the one copy of that chunk
still in existence. The tab was previously broken only if it was online and
unlucky; now it's broken either way.

Two changes:

- **The asset cache is unversioned and capped** (400 entries, ~ten releases). A
  fingerprinted name means an old chunk is still exactly correct for the page
  that wants it. Keeping it is the difference between an open tab surviving a
  deploy and an open tab breaking. The build's own files are re-added on install,
  which moves them to the back of the eviction queue, so the build a tab is
  actually running is never the one dropped.
- **A chunk-load failure reloads once**, rather than showing "Something went
  wrong · Failed to fetch dynamically imported module" over a **Go back home**
  button — the one offer that doesn't help, since home already works and every
  other screen will fail the same way. Once per session, guarded by
  `sessionStorage`, because an app that reloads itself forever is worse than any
  error screen. If it can't record that it tried, it doesn't try.

Also in the worker: a navigation response is only cached as the shell if it's
`ok` and not `redirected`. A 404 from a half-finished deploy was previously
written in as the offline app and kept — the worst possible thing to persist,
given the entire point is surviving without a network to correct it with.

---

## Verification

```sh
npm run check && npm run test-engine && npm run verify-offline && npm run audit-a11y
```

`test-engine` 200 pass · `check` 58 · `verify-offline` 15/15 · `audit-a11y` 0
issues · `validate-themes` 0 errors · lesson fuzz 227/227.

## Still open

- **`sessionSize` doesn't mean what it says.** Asking for 8 questions produces
  about 16 — graduated retrieval, conjugation injection and the reinforcement
  round each add their own. It's a real number honestly arrived at, but it isn't
  the number the learner chose, and someone picking short sessions is usually
  picking them for a reason. Worth fixing properly rather than by trimming
  whichever phase is easiest to trim.
- Roughly one example sentence per word; two or three would build flexible
  knowledge rather than one memorised frame.
- The Punjabi and Nigerian Pidgin reading passages want a native speaker's eye.
- Urdu and Arabic example romanisation sits at 55% / 38%.
- Keyboard-only and screen-reader journeys have not been walked by a human.
- The service worker still has no update prompt. A new version takes over on the
  next load, which is correct but silent — and now, at least, an open tab that
  misses the change recovers instead of breaking.
