# v96 — motion that costs nothing and can be switched off

The app already had a motion system: 22 keyframes, three easing tokens, spring
curves, staggered entrances. It was decent. Two things were wrong with it, and
neither is visible by looking at the app on a fast machine.

## 1. The card didn't turn, it swapped

The flashcard is the first thing a lesson shows and the most-used control in the
app. Flipping it re-keyed the element and played a scale-bounce: the word
vanished, the meaning appeared in its place, and **nothing connected them**.

A card that *turns* says the two faces are the same object. That is the entire
job of the animation, and it's the difference between an app that feels built
and one that feels assembled.

```
mid-flip transform: matrix3d(0.967364, 0, 0.212659, 0, 0, 0.990463, …)
✓ the card turns rather than swapping
```

Deliberately a half-turn rather than a two-sided 3D card: the faces are different
heights — the back carries an example sentence — and absolutely positioning them
to share a box either clips the taller one or pads the shorter. A half-turn reads
as a flip and cannot break the layout.

## 2. Reduced motion was a list, and lists get forgotten

The app has **fourteen infinite animations** — a tutor bobbing every 3.5s, a
pulsing mic, a breathing seal, a blinking caret, drifting hero scenery. The
`prefers-reduced-motion` block named **six selectors**.

Every animation added since had to remember to opt out. None of them did.

For someone with a vestibular disorder that setting is not a preference, and
endless motion is the precise trigger. Naming selectors cannot work, so it's a
blanket rule now — motion collapses to near-instant rather than being deleted, so
state changes stay legible and nothing waits on an animation that never runs.

Measured in a real browser, not asserted:

| | animations running |
|---|---|
| `prefers-reduced-motion: no-preference` | 3 |
| `prefers-reduced-motion: reduce` | **0** |

## 3. Every progress bar ran layout on every frame

Three rules animated `width`. Growing a box's width re-runs layout for that box
on each of ~30 frames, for every bar on screen — and Home shows three.

They now slide a full-width fill under an overflow-hidden track, which the
compositor handles on its own thread. Translating rather than `scaleX` on
purpose: scaling squashes the rounded right-hand cap out of shape.

That needed the fill amount to reach CSS, so it arrives as a `--fill` custom
property from the five call sites. Verified by measuring painted geometry rather
than reading the stylesheet:

```
✓ hairline-fill  declared 68% · covers 68% of its track
✓ hairline-fill  declared  0% · covers  0% of its track
```

Progress bars also gained `role="progressbar"` and their value, which they never
had — they were decorative to a screen reader.

## Smaller things

- **Screen transitions** are 240ms/8px instead of 320ms/14px. At 320ms a screen
  change reads as a slide; at 240ms it reads as the screen simply being there,
  which is what you want dozens of times a session.
- **`will-change` removed** from `.screen-enter` and `.bar-fill`. Left on, it
  pins a compositor layer for the life of the element — the opposite of the
  optimisation it looks like.
- **Answer feedback** has a spring on the chosen option and a rise on the banner,
  rather than both appearing.

## Guardrails

`audit-motion.mjs` fails the build when:

- a `transition` names a layout property (`width`, `height`, `top`, `margin`…)
- the blanket `prefers-reduced-motion` rule is missing
- and it warns on animations over 600ms, and on stale `will-change`

It parses the transition shorthand per-part, so `transition: transform 200ms`
isn't flagged for containing "form" — the naive version was.

`verify-motion.mjs` proves it in a browser: painted bar geometry against declared
value, animation count under both motion preferences, and the flip's transform
matrix sampled mid-animation.

## Verified

- `npm run check` — 3,858 sentences 0 errors; every door opens onto something;
  every clickable element keyboard-reachable; **motion is composited and can be
  switched off**, 0 errors
- `verify-motion` — bars paint at their declared fill; 3 → 0 animations under
  reduced motion; card turn confirmed by transform matrix. 0 problems
- `audit-a11y` — all screens, all three themes: 0 unnamed controls, 0 contrast,
  0 missing alt, 0 unlabelled inputs
- `verify-lessons-browser` — full fuzz across all 19 languages
