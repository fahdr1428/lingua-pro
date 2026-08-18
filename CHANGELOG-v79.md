# v79 — making the app teach

The ask: significantly improve it so people **actually learn the language**, and
make it friendly towards learning.

I audited the app against what is actually known about how people acquire a
language, rather than guessing. Five findings. Three were serious, one was the
same bug in two places, and one was an app that had quietly stopped teaching.

---

## 1. Getting something wrong taught you nothing

This was the worst one, and it's the single most wasteful moment a language app
has. You'd answer a question wrong. The app showed **"✗ Not quite"** in alarm
red, and the explanation sat behind a **"💡 Why?"** chip you had to go and press.

At that exact moment the learner is at peak attention — they've just been
surprised, and they want to know why. Most people never pressed the button, so
most mistakes passed in silence. A wrong answer without an explanation isn't
practice; it's just a score.

**The explanation now opens by itself, on every mistake.** Getting it *right*
still leaves it collapsed — you don't need it, and stopping to read one after
every correct answer turns a six-question lesson into twelve.

It also says something more useful than it did. It used to announce the answer.
It now names what you actually chose:

> You went for **کل**, which means "yesterday, tomorrow".
> The word for "today" is **آج**. It sounds like: aaj.

"The answer is X" tells you the answer. "You picked Y, which means Z" tells you
where your idea of the language was wrong, which is what stops it happening
again.

---

## 2. The most valuable thing in the app was being thrown away — twice

Every one of the 2,235 words carries a real example sentence in the language
being learned. Both places that used them **showed only the English gloss and
discarded the sentence itself.**

```js
// explain.js, and again on the new-word card:
parts.push(`Used in a sentence: "${item.examples[0].translation}"`);
//                                                    ↑ the English
//                                     item.examples[0].native was never read
```

So the first time anyone met a new Urdu word, they saw the word, its English
meaning, and **an English sentence**. Nothing whatsoever about how the word
behaves in Urdu. Same again on every missed answer.

Both now show the real sentence, with the word picked out inside it, tappable to
hear:

> **how it's actually used ▸ tap to hear**
> میں <mark>آج</mark> بازار جاتا ہوں
> main aaj bazaar jata hoon — *I go to the market today*

A word learned as a pair — "kitaab = book" — is a fact about a dictionary. A word
seen doing a job in a sentence is a piece of the language, and it's the second
one that survives contact with a native speaker talking at normal speed.

The highlight matches case-insensitively, which lifted the hit rate from **65% to
82%** across the packs (Spanish 47→88%, French 46→90%, Turkish 42→84%). It fails
softly by design: where an inflected form doesn't contain the dictionary form —
and in Japanese and Chinese, where there are no word boundaries to match on —
the sentence renders plain rather than the app guessing at morphology and
highlighting half a word, which would teach something false.

---

## 3. It charged you for trying

```js
if (!appState.isPremium) setHearts((h) => Math.max(0, h - 1));
```

Every wrong answer took a heart, and a red ❤️ counter ticked down in the lesson
header while you worked.

A wrong answer is not a failure state — **it is the mechanism**. Retrieval that
fails, followed immediately by the right answer, is what moves a word into
memory. Charging someone for the one behaviour the whole app depends on teaches
them to attempt less: to skip the words they're unsure of, which are precisely
the words they need.

And it was doing that **for nothing**. Hearts gated no lesson, blocked no screen
and unlocked nothing when spent. The counter went down, turned red, and had no
mechanic behind it at all. All of the discouragement, none of the design.

Gone. Hearts only ever go up now, as a small thank-you for a clean run, and the
counter is out of the lesson entirely — replaced by the progress bar, which
counts up.

Downstream of that: **"Unlimited hearts" was the headline benefit in the upgrade
pitch.** That was selling relief from a penalty that no longer exists — and was
never true even before, since hearts gated nothing. Replaced, with a line saying
plainly that every lesson, word and exercise stays free and nothing is charged
for a mistake.

Everything else at the moment of a mistake got the same treatment: no cross next
to your attempt, amber instead of alarm-red (a new `--miss` token, so `--danger`
is left for things that are actually destructive), and copy that points at the
answer rather than scoring you.

| before | after |
|---|---|
| ✗ Not quite | Not this one — here's why |
| Not quite — give it another go | Not this time — and you can take it as many times as you like |
| You scored 62%. You need 70% to unlock the next chapter. | 62%, and the bar is 70% — the words below are the ones between you and it. Nothing is lost by trying. |

---

## 4. "The comprehensible input pillar" had thirteen passages

`Reading.jsx` describes itself in its own header as *"the comprehensible input
pillar"*. Comprehensible input — connected text you can mostly follow — is the
best-evidenced mechanism in second-language acquisition. Here is what was
actually behind it:

| | passages |
|---|---|
| es | 3 |
| fr, ur | 2 |
| hi, bn, ar, ko, ja, zh | 1 each |
| **de, id, pa, pcm, tr** | **none at all** |

Thirteen, across fourteen languages, most of them three lines long. Five
languages had a screen that said "no reading passages yet".

**Now 41 passages, 168 lines, every language covered, none with fewer than four.**

### The rule they're built on, and the tool that enforces it

A passage is only comprehensible input if the learner can actually comprehend
it. The moment it uses words the course never teaches, it stops being input and
becomes a wall — and a wall dressed up as practice is worse than nothing,
because the learner concludes they're the problem.

So `scripts/validate-passages.mjs` enforces: **a passage may only use words the
course teaches.** Every content word is checked against that language's own
vocabulary pack, and anything unrecognised is reported by name. It's wired into
`npm run check`, so this can't quietly rot.

It caught real problems while I was writing: Arabic used **نحن** ("we") and
Urdu used **کلو** ("kilo"), neither of which those courses teach. Both rewritten.

**What it cannot check is grammar.** Nothing automated can tell you whether a
sentence is well-formed or idiomatic. The validator says so in its own header,
and so do I: these passages are deliberately simple and built from validated
vocabulary, but **a native speaker should read the Punjabi and Pidgin sets
before this goes in front of many people.** I'm confident in the vocabulary
coverage; I'm not claiming native-speaker judgement on register.

### Two bugs in my own validator, found by running it

- The **Urdu full stop (۔)** and **Devanagari danda (।)** weren't in the
  punctuation set, so it reported `ہے۔` and `हैं।` as unknown vocabulary — a wall
  of false failures hiding the two real ones underneath.
- The Punjabi function-word list was written in **Gurmukhi**. This pack writes
  Punjabi in **Shahmukhi**, as it's written in Pakistan. Every line failed for
  entirely the wrong reason.

### And the library now actually advances

Which passages you'd read was component state, reset on every mount, so the next
one was drawn at random from the whole set each visit. With one or two passages
that hardly mattered. With a real library it does — you could open Reading five
times and be handed the same piece four times, and reasonably conclude there was
nothing else in there. It's remembered across visits now.

Reading also gets its own door in Practice instead of sitting two taps deep
behind a combined screen. It was defensible to bury it at 13 passages. It isn't
at 41.

---

## 5. The worst thing in the codebase: it stopped teaching people

I wrote a simulator (`scripts/simulate-learner.mjs`) that drives the real engine
through a learner doing one lesson a day at 85% accuracy, because unit tests can
tell you a function returns the right value and cannot tell you that someone
doing everything right stops making progress after three weeks.

**After 30 daily lessons the simulated learner knew 26 words.** Under one new
word a day, and falling toward zero.

The cause, in `selector.js`:

```js
if (due.length >= 16) effectiveNewPerSession = 0;
```

Sixteen due words is not a backlog. It is what a healthy deck looks like after a
fortnight — spaced repetition schedules words to come back, so the due count
climbs with the size of what you know and settles at a plateau. With
eight-question sessions that plateau clears sixteen almost immediately, and from
then on **the app introduced nothing new. Ever.**

Someone could keep turning up, keep answering, keep their streak alive for
months, and quietly stop learning the language — while the app congratulated
them on the streak. Every function involved was behaving exactly as written.

Two changes:

- **The measure is now sessions of work outstanding, not a raw count.** A raw
  number cannot tell "sixteen due out of thirty known" from "sixteen due out of
  five hundred", and it was treating the second like the first. Three sessions'
  worth waiting is a normal week; six is worth pausing for. That is also the
  question the learner is actually asking.
- **There is a floor.** Below the worst tier the intake throttles hard — that
  part of the original intent was right — but never to zero while there are words
  left to teach. Turning up should always be worth something.

| | after 30 days | after 90 days |
|---|---|---|
| before | 26 words, then flat | 26 words |
| after | 55 words | **131 words**, still climbing |

Review load stayed healthy throughout — 8.4 review items per lesson, ~7 exposures
per word, 0% of words seen only once at the plateau. This is not "teach faster by
reviewing less"; it is removing a hard stop.

A side effect worth having: because the throttle now scales with session length,
the lesson-length setting genuinely controls pace for the first time. Over 90
days, **108 / 131 / 166 words** for short / normal / marathon sessions. Under the
old absolute threshold, session length made no difference at all.

Five assertions in `test-engine` now guard this specifically, including that a
heavy backlog still yields at least one new word and that a longer session earns
a faster pace.

---

## Verification

```sh
npm run check && node scripts/verify-browser.mjs
```

- **`verify-browser.mjs` — 223 assertions, 0 fail** (was 208). The new section
  drives a real Urdu lesson, deliberately answers wrong, and checks the three
  things that decide whether a mistake teaches: the explanation appears without
  being asked for, the sentence shown is **Urdu and not the English gloss**
  (asserted on the script range, so the old bug cannot come back unnoticed), and
  nothing is taken away for attempting. Plus: every language has reading
  material, and a German passage renders.
- **`validate-passages`** — new, in `npm run check`. 14 languages, 41 passages,
  168 lines, 0 errors.
- **`test-engine` — 197 assertions** (was 192), five of them new and guarding
  the never-stop-teaching rule directly.
- `scripts/simulate-learner.mjs` — not in `npm run check` (slow, and its output
  is a judgement call rather than pass/fail), but it is how finding 5 was found
  and how the fix was measured.

Three harness bugs of my own found and fixed along the way: the home hero opens
the Sentence Lab at that progress level rather than a lesson, so the test was
walking into a different screen entirely; option buttons had no stable hook (they
have `.opt-btn` now, carrying no hint of which is correct — the suite derives
that from the pack, never the DOM); and a MATCH_PAIRS exercise has no "check"
step to press.

## Still open

- The Punjabi and Nigerian Pidgin passages want a native speaker's eye before
  this is in front of a lot of people. The validator guarantees the vocabulary,
  not the register.
- 2,360 example sentences for 2,235 words is barely one each. Two or three per
  word, in different contexts, is what actually builds flexible knowledge of a
  word rather than a single memorised frame.
- Japanese and Chinese sit at ~50% on the in-context highlight and always will
  without a tokeniser.
