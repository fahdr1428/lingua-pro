# v78 — Decode, and the things the PageSpeed report was telling you

Three asks: explain the Lighthouse report, fix the test that "still hasn't been
implemented", cut the scrolling — and find something worth building that the big
apps don't do.

---

## 1. The test-out *was* implemented. It was unreachable, and then wrong.

You were right and it's worth being precise about why, because it's the more
interesting kind of bug.

**It was unreachable.** "Test out" shipped in v75 attached to `UnitNode` — the
fallback unit list, which only renders for languages with **no written journey**.
Urdu, Arabic, Punjabi, Spanish, French, German and Hindi all *have* one, so they
render `JourneyMap` instead, which had no test-out affordance anywhere. On every
language a real person is likely to pick, a locked stop was a dead end with an
apology on it. Built, shipped, and invisible to most of the app's users — which
from where they're sitting is identical to never having been built.

**And what it did open was wrong.** The `testout` route pointed at a v26 screen
that took a `fromUnit` parameter and *ignored it*, then quizzed twelve words
sampled at random from the entire language. So "test out of Family" handed you
words from Directions, and passing it meant nothing in particular.

Fixed by deleting the old screen rather than repairing it. Both routes now land
on `SkipAhead`, the v75 implementation that was already rigorous — both
directions, 85% to pass, distractors from the same set, and it names the words
that let you down on a fail. It now takes a unit as well as a chapter:

| | Chapter test | Stop test (new) |
|---|---|---|
| Words | that chapter's | that one stop's |
| On a pass | seeds them known, opens everything up to that chapter | seeds them known, opens the next stop |
| Chapter exam | cleared | **still stands** — proving one unit isn't proving six |

Locked stops in the route now carry the door, and locked tiles in "Further on"
are tappable instead of dead.

---

## 2. The PageSpeed report, translated

**91 / 83 / 100 / 100** — good, with two accessibility failures that were real
and one performance problem that was self-inflicted.

### Accessibility 83 → the two named failures, both fixed

**`maximum-scale=1` in the viewport tag.** This was in there to stop iOS zooming
when you focus an input. It also **stopped anyone pinch-zooming the page at all**
— in an app that renders Nastaliq and Naskh at 14px. That's not a theoretical
accessibility complaint. Removed, and the actual cause fixed instead: iOS only
zooms on inputs under 16px, so every text field is now 16px on touch and there's
nothing to suppress.

**No `<main>` landmark.** Screen readers navigate by landmark. Without one, the
only way to reach content is to walk the entire navigation on every screen
change. Added.

### Performance 91 → what the diagnostics meant

| Lighthouse said | What it was | Now |
|---|---|---|
| Render-blocking requests, **900ms** | Self-hosting the fonts in v77 fixed a privacy problem and created a performance one: `fonts.css` was a *second* render-blocking request, an entire round trip on a throttled connection to fetch 6KB of `@font-face` rules | Bundled into the app's own stylesheet; the two faces used above the fold are `preload`ed so they download alongside the CSS rather than after it |
| Reduce unused JS, **108 KiB** | One 759KB bundle. Opening the app to do a lesson downloaded the mission engine, the fluency dial, the dialect drill and three legal policies first | Code-split. Home and Lesson stay eager — lazy-loading what you always need is just a round trip — everything else loads on first open. **759KB → 604KB** on the critical path |
| Improve image delivery, **50 KiB** | A 48KB PNG being drawn at 22×22 in the bottom nav, on every screen | WebP at the rendered sizes: **48KB → 2.9KB** for the mark, 83KB → 19KB for the logo. `scripts/make-icons.mjs` regenerates them |
| Images without explicit dimensions | Contributing to layout shift | Width and height on all of them |

**One more thing the report didn't catch:** `public/scenes/` does not exist and
never has, so `SceneBand` fired **two 404s on every single home render** before
hiding itself. It now checks whether the image is there before rendering
anything.

### Best Practices 100, but with four open "Trust and Safety" items

CSP, COOP, clickjacking, Trusted Types — all unset. Now that v77 removed the last
third-party origin, a strict policy was finally possible, so `vercel.json` sets
`default-src 'self'` with no external hosts permitted at all, plus COOP,
`X-Frame-Options: DENY`, `nosniff`, a referrer policy, HSTS, and a
`Permissions-Policy` granting the microphone to this origin only while denying
camera, geolocation and payment outright.

---

## 3. The scrolling — measured, not guessed

I measured it (`scripts/measure-home.mjs`, kept in the repo). Home on a 414×896
phone was **3,424px — 3.8 full screens**, and more than half of that was a single
thing:

```
 1896px  route          ← chapters you cannot open yet, rendered in full
  291px  greeting
  283px  hero (the one button that does something)
  112px  stat strip
```

Someone on lesson three scrolled past forty locked stops. Two changes:

- **Future chapters collapse to one line each**, tappable to look ahead. Nothing
  is removed — that matters, because the new test-out doors live inside those
  stations — but the default view is what you can act on today. Route:
  **1,896px → 978px**.
- **The greeting was a 291px block** — a 30px two-line headline, a typewriter
  line, a byline and a name field — sitting above the only button on the page.
  It's a single row now. The headline earns its place on a landing page; on the
  screen you open daily to do a lesson, the lesson should be what you see.

**3,424px → 2,342px (3.8 → 2.6 screens),** and the thing you came to press is
now above the fold.

---

## 4. Decode — the thing the big apps structurally cannot do

I looked for the gap rather than guessing at one, and the research points
somewhere specific. Heritage speakers **have conversational fluency and lack
literacy** — they understand the language spoken and cannot read it, because
school taught them English literacy and nothing taught them this. They are not
beginners in the language. They are beginners in the script, and every beginner
course is aimed at the wrong problem.

Meanwhile the apps that *do* let you import your own text — LingQ, Readlang,
Lenguia — are built around European languages with abundant content. None of them
help with Urdu, Punjabi, Nastaliq or Nigerian Pidgin, and none treat the **script
itself** as the barrier.

And the reason Duolingo can't do this at all is structural, not a matter of
priorities: **every large app teaches from a closed set of sentences it wrote
itself.** The message on your phone is not one of them and never will be.

### So: paste the actual message.

A text from your mum. A sign in a photo. A song lyric, a recipe, a form you've
been putting off. You get:

- **what it means**, naturally — and **word-for-word in the original order**, so
  you can see how the language actually builds a sentence;
- **who talks like that.** "Warm and informal — how an aunt writes to a nephew."
  Register is the thing heritage speakers most often can't judge and most often
  get wrong;
- **every word**, with the dictionary form beside the form as written, and a note
  when they differ — *"the -ak ending is 'your', addressed to a man"*. That gap
  is where reading a script is actually learned;
- **how many of these words you already know**, counted against your own deck;
- **something you could send back.** Understanding a message you can't answer is
  half a rescue.

### The number is the point

> **11/16** — You already knew 11 of the 16 words in this.

Someone who is certain they know nothing pastes a message from their grandmother
and finds out they could already read two thirds of it. **Nothing else in the app
can tell them that, because nothing else in the app is looking at their real
life.** That count is computed **on the device**, against their own progress —
their practice record is never sent to the decoder.

### Saved words become real cards

Not a side list that quietly rots. `Engine.addCustomWords` appends them to the
loaded pack, so from that moment the same FSRS schedules them, the same reviews
surface them, the same stats count them. A word from your grandmother's message
deserves at least the treatment a word from a course gets.

Two rules keep that from being a mistake:

- **They stay out of the ordinary course pool.** Your lesson three should not
  suddenly contain a word from your aunt's WhatsApp. They return through review,
  and through their own drill.
- **Nothing is duplicated.** Deduped against the whole pack, not just previous
  saves — otherwise the course teaches a word, you save it again, and the
  generator offers you two identical options to one question.

### Privacy, because this one deserves it

What you paste is **usually somebody else's private message**, and they haven't
agreed to anything. So the screen says where the text goes **above the box**,
before you type. It's capped, sent in a user turn, never interpolated into the
system prompt, never logged, and it sits behind the same AI consent gate as the
conversation. The model is told the text is data and never an instruction to it.
`COMPLIANCE.md` flags the third-party-content question for a lawyer explicitly
rather than quietly hoping.

---

## Bugs found while building this

- **Saving a word wiped its own confirmation.** The effect that pre-ticks unknown
  words also cleared the "saved" state, and it watched a value derived from
  progress — which saving changes. So the words went in and the screen said
  nothing. Caught because the browser test checks storage *and* the screen, and
  the two disagreed.
- **`masteryLevel` returns a number 0–5**, and I compared it to `"new"`. Every
  word would have counted as known.
- **`npm i sharp` pruned Playwright**, which was installed but never listed in
  `package.json` — so the entire browser suite would have failed on a fresh
  checkout. Now a declared devDependency.
- Two harness bugs of my own: `.mission-card` first matches the custom-scenario
  door, not a mission; and Urdu quiz prompts render the romanisation, not the
  lemma.

---

## Verification

```sh
npm run check && node scripts/verify-browser.mjs
```

- **`verify-browser.mjs` — 208 assertions, 0 fail** (was 178). New sections:
  - **decode** — the pasted text is sent and *nothing else about the learner*;
    proper nouns are excluded from the count; the known-word count is computed
    from the learner's own progress rather than taken from the model; saving
    persists, carries its source sentence, and produces a real lesson from those
    words;
  - **testing out of one stop** — the door exists on a journey language, and
    every question comes from the unit tapped, which is precisely what the old
    screen got wrong.
- **`test-engine` — 192 assertions** (was 186), including six against the real
  `Engine`: saved words are added once, land in the vocab the SRS reads, aren't
  duplicated when the course already teaches them, stay out of the ordinary
  lesson pool, can be drilled deliberately, and are properly removed on forget.
- Home height is measured, not asserted by eye: `node scripts/measure-home.mjs`.

## Still open

- Accessibility has never been audited against WCAG 2.2 AA beyond what Lighthouse
  automates — it says so itself, and the manual half is where most of it lives.
- Trusted Types is still unset; it needs a policy for the few places the app
  assigns markup, which is a real change rather than a header.
- Decode is text-only. A photo of a sign or a letter is the obvious next step and
  the API already supports images.
