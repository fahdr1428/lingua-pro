# v91 — the alphabet was never the writing system

v90 gave five languages a list of letters and fixed a screen that had been
telling Malayalam learners they already knew the alphabet. That was the obvious
hole. This is the bigger one underneath it.

**A list of letters is not a script course.** For the three hardest script
families in this app, the letter list was not even half of one — a learner could
complete every lesson, score full marks, and still not read a single word.

## What was broken

### Arabic script — every letter was shown alone

ar, fa, ur and pa taught 83 letters between them, all in **isolated form**.

No word in any of those languages is written in isolated forms. Letters connect
to their neighbours and change shape depending on where they sit, and that
shape-shifting is the single defining difficulty of the script. Someone could
finish the entire Urdu alphabet course, meet ب on the page as بـ, and not
recognise it.

The app never mentioned this happens.

### Abugidas — consonants were taught bare

hi, bn, ml and ta teach consonants as "ka", "ta", "pa". That is accurate, and it
is exactly the trap: the consonant **already contains a vowel**, there is no bare
"k" anywhere in the chart, and there is no way to write "ki" without a mark the
course never showed.

38 Malayalam letters, and not one syllable the learner could construct.

### Hangul — 24 letters, never written in a line

ko taught every jamo and never said that they **stack into squares**.
ㅎ + ㅏ + ㄴ is 한, not ㅎㅏㄴ. Block assembly is the whole mechanism, and it was
missing.

## What v91 adds

**A primer for all 11 non-Latin languages**, read before letter one — how the
system works, what is hardest about it, and what the first win is. Someone
opening a Malayalam course has no reason to know that consonants carry a vowel,
and without that every letter afterwards is filed in the wrong drawer.

**Joined forms** on every Arabic-script letter card: alone, start, middle, end.
Built with ZWJ (U+200D) rather than hardcoded presentation-form codepoints, so
the reader's own font does the shaping — which is what that character is for.
Non-connectors correctly show only two forms, and say why:

> *Alif never joins to the letter after it — so the next letter always starts
> fresh.*

**A vowel-sign lesson** for each abugida — the full matra set on a demo
consonant, gated behind the letters so it lands on consonants the learner has
actually met. It teaches the three things that catch everyone:

- signs **written before** the consonant but **read after** it (कि is "ki")
- signs that **wrap around both sides** (কো, കൊ, கொ)
- signs that **fuse into** the consonant's shape (Tamil கு)

**A block-assembly lesson** for Hangul: vertical vowels sit to the right,
horizontal vowels sit underneath, the batchim goes along the bottom, and ㅇ is a
silent placeholder at the top and "ng" at the bottom. It ends on 한국 — six
letters the learner can now read as the name of a country.

**Confusable sets with the tell.** ب/پ/ت/ٹ/ث differ by dots and one small ط, and
that family is where most early Urdu reading errors live. ന/ണ and ത/ട are
dental-versus-retroflex and are different words. ண/ன/ந is three Tamil n's.
ㄱ/ㅋ is one added stroke and one puff of air. Each set shows the letters
together with the current one highlighted, and states what actually separates
them.

**The quiz now runs in both directions.** It only ever asked "what sound does
this letter make?", which is recognition. Half the questions now give you the
sound and ask you to find the letter, which is what reading asks of you.

## Guardrails

`validate-alphabets.mjs` fails the build if:

- a non-Latin language has no primer, or a primer that doesn't name the hard part
- an Arabic-script language has no joining rules, or names a non-connector that
  isn't one of its letters
- an abugida has no vowel signs, or builds a demo syllable out of a consonant it
  doesn't teach
- Hangul has no block lesson
- a confusable set has no tell

`merge-script-systems.mjs` refuses to write anything it can't verify against the
pack it's writing into, and reports every confusable that names a letter the
course doesn't teach. That check caught three on the first run — Urdu pointing at
ڈ and Japanese at れ and ほ, none of which those courses teach. All three were
rewritten to use letters the learner actually meets.

`shot-script-course.mjs` walks all 11 languages in a real browser. It exists
because the joined-forms panel is the one thing here that can be correct in the
source and wrong on screen: if the font ignores ZWJ, the learner sees four
identical glyphs and the lesson teaches nothing. So it measures the rendered
boxes and asserts the shaping inputs differ, rather than trusting the markup.

## Found while measuring

**Nastaliq descenders were landing on the text underneath them.** With the forms
row in place, ب's dot rendered on top of its own "ALONE" caption and on the
divider above the letter's name. The default line box does not reserve room for
how far below the baseline nastaliq and naskh hang their dots and tails. Every
glyph container now takes its metrics from one `glyphBox()` helper that gives RTL
scripts real extra room instead of default leading.

**The walker's first two selectors were wrong in ways that looked like app
bugs.** A DOM `.click()` inside `page.evaluate` didn't take, and `/Lesson 1\b/`
never matched because the tile's text runs `Lesson 1Starter letters` — "1" and
"S" are both word characters, so there is no boundary between them. Both were
reported as missing lessons before being diagnosed as the test's fault.

## Verified

- `validate-alphabets` — 19 languages, 0 errors, 0 warnings
- `npm run check` — 2,965 words, 19 journeys, 90 grammar lessons / 990 checks,
  208 engine assertions, 65 coach assertions, all green
- `shot-script-course` — 11 languages walked in Chromium, 0 problems; joined
  forms confirmed rendering as four distinct shapes for ar, fa, ur and pa
- `verify-lessons-browser` — full fuzz across all 19 languages against this build
