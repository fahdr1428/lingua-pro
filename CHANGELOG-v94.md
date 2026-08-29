# v94 — auditing the words, and the keyboard

Two questions: is each word actually right, and can everyone use the app.

## Is each word right?

v92 and v93 added roughly 1,100 hand-written sentences and romanisations across
nineteen languages. "I was careful" is not a verification method. So
`validate-word-truth.mjs` checks the things a machine genuinely can, across all
**3,462** example sentences:

1. **The word is in its own example.** An example for `പോയിവരാം` that doesn't
   contain `പോയിവരാം` teaches a different word.
2. **The sentence is in the right script.** A stray Devanagari character in a
   Malayalam sentence is invisible to me and obvious to a reader.
3. **The romanisation belongs to that sentence.** The worst failure mode here,
   and undetectable by reading the file.
4. **The translation says something** — not empty, not a copy of the native.
5. **Two examples are not the same sentence.**

### What it found

**A semantic error in Arabic.** `من هذا؟` — "Who is this?" — was romanised
**`min hadha`**. Arabic writes مَن (*man*, who) and مِن (*min*, from) identically
without vowels, and the romanisation exists precisely to disambiguate that. A
learner reading the line learned to say "**from** this". Now `man hadha`.

**Punjabi romanisation was compressed past the point of usefulness.** 45 of them
dropped short vowels or used `y` as a vowel — the SMS style a fluent speaker
writes to another fluent speaker:

| was | now |
|---|---|
| `main nahin smjhya` | `main nahin samjhya` |
| `main roti khrydna oan` | `main roti khareedna aan` |
| `mainu madad chahydy ae` | `mainu madad chahidi ae` |
| `tusin kithe rhnde ao` | `tusin kithe rehnde ao` |
| `myre kol waqt nahin` | `mere kol waqt nahin` |
| `meherbani karke dubara dso` | `meherbani karke dubara daso` |

The romanisation exists so a learner who cannot read Shahmukhi can say the word.
`khrydna` does not do that.

**Three words whose "two frames" were one sentence twice** — `wissen` had
"Ich weiß es nicht." and "Ich weiss es nicht"; Arabic `بارد` and Turkish `yemek`
the same. Each now has a genuinely different second sentence.

**Four spellings that contradicted the pack's own lemma** — `gimchi` where the
course teaches `kimchi`, and three of my own extras. And one Nigerian Pidgin
extra I had written as word-for-word English ("Thank you for your help"), which
taught nothing; now "Thank you well well".

### What it deliberately does not report

The first run produced 68 romanisation warnings of which about six mattered. The
rest were **conventions, not errors** — `sayōnara`/`sayounara`, `ra's`/`raas`,
`pani`/`paani`, and the deliberate Mandarin tone sandhi `bù`/`bú`. A check that
cries wolf 62 times gets switched off, so `foldConvention()` folds those away.

It cannot simply normalise the vocab `translit` field to match instead: that
field has a second job — `audio/tts.js` feeds it to a near-language voice as a
pronunciation fallback, and Hindi and Urdu convert it back to Devanagari for
speech scoring. Macrons and apostrophes are not safe in it.

The 247 surviving warnings are almost all legitimate inflection: Spanish `Ir` →
"Voy a casa", German `können` → "Kannst du…", Japanese 一 read `hitotsu` as a
counter and `ichi` alone. Teaching an infinitive and showing it conjugated is
correct, so these stay warnings rather than errors.

Nigerian Pidgin is exempt from the identical-translation error: it is
English-lexified, so "Cold water" really is the same sentence in both columns.

## Can everyone use it?

`audit-a11y.mjs` walks the rendered app for names and contrast, and it was
clean. It was clean because it could not see the problem.

**Ten clickable `<div>`s had no tab stop, no role, no name and no key handler.**
A mouse user never notices. A keyboard, switch or screen-reader user cannot use
the control at all.

**Two of them were the flashcard** — the first thing a lesson shows and the most
used control in the app. The entire "see the word, then the meaning" mechanic was
mouse-only. There *was* a window-level Space listener, which is not the same
thing: nothing was focusable, nothing was announced, and a screen-reader user had
no way to know the card existed.

Fixed, and verified in a browser with the keyboard only:

```
✓ reachable by Tab
✓ announced as: "Card showing the word — activate to see the meaning"
✓ Enter flips it (aria-pressed false → true)
```

Also now keyboard-operable: the "tap to hear" lines in Reading, Grammar,
Conversations and the Lesson grammar panel; the input-stream reveal row (with
`aria-expanded`); and the Home mission tile (with `aria-disabled`).

**The language-picker modal could be opened by keyboard and not closed by one.**
It had a labelled ✕ but no Escape, no `role="dialog"`, no `aria-modal` and no
label — a screen reader announced an anonymous pile of buttons. It now has all
four.

`audit-keyboard.mjs` fails the build if a clickable non-button element lacks
role, tabIndex and a key handler. Modal backdrops are exempt from the tab-stop
rule — making one focusable would put a nameless stop in front of the dialog —
but the audit then *requires* Escape instead.

**The a11y walk never visited three of the app's screens.** The script course
grew a primer, a letter card with joined forms, and a vowel-sign lesson in v91,
and the walk stopped at the lesson list. All three are now audited in all three
themes — and separately verified to actually load, because the walker swallows
navigation errors and "clean" would otherwise have meant "never got there".

## Mistakes made and caught while doing this

- I put `aria-hidden="true"` on the modal backdrop. The dialog is its child, so
  that would have hidden the entire modal from every screen reader. Caught and
  reverted immediately.
- I referenced `open[key]` for `aria-expanded` in InputStream. The state is a
  `Set` called `revealed` — it would have thrown and crashed the screen.
- I added `useEffect` to `primitives.jsx`, which imported only `useState`.
- The first fix made the flashcard *worse*: my new handler and the old
  window-level listener both fired, so one keypress flipped the card twice and
  it landed exactly where it started. Only a real keyboard test caught that —
  the source looked right.
- My first keyboard audit blamed the wrong element, reading a nested `<button>`
  on the same line as part of its parent's attributes.

## Verified

- `npm run check` — 19 languages, 3,462 sentences, 0 errors; 30 components,
  every clickable element keyboard-reachable, 0 errors
- `audit-a11y` — all screens including the three new ones, all three themes:
  0 unnamed controls, 0 contrast failures, 0 missing alt, 0 unlabelled inputs
- `verify-keyboard-card` — Urdu, Malayalam and Japanese: card reachable by Tab,
  announced, and flipped with Enter
- `verify-lessons-browser` — full fuzz across all 19 languages
