# v80 — the accessibility half nobody had looked at

Two releases running I wrote "accessibility has never been audited beyond what
Lighthouse automates" in the *Still open* list. This closes it, and the thing it
found was bigger than a contrast tweak.

---

## What Lighthouse couldn't tell you

Lighthouse scored the app **83** and named two failures, both fixed in v78. That
score is one page load. It never opened a lesson, a settings screen or the
reading library — where most of the controls actually are.

`scripts/audit-a11y.mjs` walks **sixteen real screens in all three themes** and
checks four things: controls with no accessible name, text below WCAG AA
contrast, images with no `alt` attribute, and unlabelled inputs. Contrast is
computed from what the browser actually paints, not from the palette, because a
token can be fine in isolation and fail against the surface it lands on.

**First run: 82 issues.**

```
  totals — 4 unnamed controls · 74 contrast · 0 missing alt · 4 unlabelled inputs
```

**Now:**

```
  totals — 0 unnamed controls · 0 contrast · 0 missing alt · 0 unlabelled inputs
```

---

## The one that mattered: the dark theme was unusable

`--ink` is used **82 times** across the app and `--root` 14 more. **No theme
overrode either.** Both kept the value defined for the cream palette — a deep
navy and a warm brown — so on the Dark theme they rendered near-black text on a
near-black background.

Measured: **1.2:1**, against a required 4.5:1. That isn't low contrast. It's
invisible. Anyone who picked Dark got an app whose headings, station titles and
half its buttons they could not read, and nothing anywhere said so.

Three more tokens had never been themed either (`--miss`, and the two shadows),
and five surfaces painted themselves **white regardless of theme** —
including `.glass`, which sits on *every Card in the app* with `!important`:

```css
.glass { background: rgba(255,255,255,0.78) !important; }
```

So on Dark, every card was a white panel over a near-black page — and because of
the `!important`, it silently overrode the inline gradient on the upgrade card
too, leaving black text on white glass that the design never asked for.

---

## The pattern underneath all of it

Nearly every contrast failure was one mistake repeated: **a colour doing two
jobs at once.**

| token | as a fill | as text |
|---|---|---|
| `--accent` | amber button — fine | amber on cream = **2.83:1** |
| `--primary` | green button — fine | green on cream = **4.40:1** |
| `--ink` | dark button with white text — fine | needs to *invert* on a dark theme |

A palette that works as fills quietly fails as text, and the two can't be the
same value once there's more than one theme. Split into paired tokens:

- `--accent-text`, `--primary-text` — the same hue, darkened until it passes
- `--ink-solid` / `--ink-on` — a button fill and the text that sits on it, so
  Dark can have a *light* button with *dark* text, which is the opposite of what
  `--ink` must be there
- `--on-primary` — bright green needed dark text (white on it was **2.28:1**)
- `--glass`, `--raised`, `--raised-soft` — the frosted and proud surfaces, themed
- `--danger-text` — the same split again, for the "under pressure" labels, which
  hardcoded a red that was unreadable on Dark and marginal on light

The worst of these was **the transliteration**: amber at 2.98:1, which made the
pronunciation guide the least readable text on the screen for the readers who
need it most — the exact audience this app exists for.

### Two mistakes I made doing it

Both caught by re-running the audit rather than by looking:

- The blanket accent→accent-text sweep hit a button on a **black** background,
  where the bright original was the readable one and the darkened variant was
  not. Reverted with a note.
- Inverting `--ink` for Dark fixed the text and broke every primary button —
  white text on a now-light fill, 1.26:1. That's what forced the `--ink-solid` /
  `--ink-on` split rather than a single value.

### And two in the audit itself

A checker that cries wolf gets switched off, so both were worth fixing:

- **Gradients.** A gradient has `backgroundColor: transparent`, so the walk
  sailed past it to the page background and reported black text on a bright
  amber card as 1.08:1 — false, three times over. Gradients are now reported as
  unmeasurable and checked by hand.
- **Semi-transparent surfaces** were skipped entirely rather than composited.
  Fixing that immediately surfaced seven *real* failures on the Profile screen
  it had been hiding.

### And a guard, so this class of bug can't come back

`scripts/validate-themes.mjs`, now in `npm run check`, enforces the rule the
whole failure came from: **if `:root` defines a colour, every theme must give it
a value.** Theming by fallback fails silently — a missing override looks perfect
in whichever theme it was authored against, which is exactly why `--ink` went 82
usages and several releases without anyone noticing.

It also flags colours hardcoded in the stylesheet, which no theme can reach at
all. That found four more (a pale-green route line, an amber verdict, two white
sub-labels) and correctly still warns about the "not ready to publish" banner,
which is deliberately identical on every theme and now says so in a comment.

---

## Also closed: re-asking when the policies change

`COMPLIANCE.md` listed this as outstanding. The version someone agreed to was
recorded in `appState.consent.policyVersion` and **nothing ever compared it to
the current one** — so a change to what the app does with your data would have
gone by in silence.

There's now a bar when they differ, with a link to what changed and an
acknowledgement that records the new version and when it was read. It is
deliberately **not** a modal: nothing about a policy update justifies stopping
someone mid-lesson.

---

## Verification

```sh
npm run check && npm run audit-a11y && node scripts/verify-browser.mjs
```

- **`audit-a11y` — 0 issues** across sixteen screens × three themes (was 82).
  Not in `npm run check`: contrast on a warm palette involves judgement, and a
  script that fails a build over a 4.4:1 hint gets switched off within a week.
- **`verify-browser` — 227 assertions, 0 fail** (was 223), including four new
  ones on the policy-change notice: it appears when the version is stale, does
  not block the app, and records both the new version and when it was read.
- **`validate-themes`** — new, in `npm run check`. 3 themes · 21 colour tokens ·
  0 errors.
- `check` 58, `test-engine` 197, `validate-passages` 0 errors — unchanged.
- Both themes were also looked at, not only measured. Measurement says a colour
  passes; it doesn't say the screen still looks like itself.

## Still open

- The Punjabi and Nigerian Pidgin reading passages want a native speaker's eye.
  The validator guarantees the vocabulary, not the register.
- Roughly one example sentence per word. Two or three, in different contexts, is
  what builds flexible knowledge rather than one memorised frame.
- Urdu and Arabic example romanisation sits at 55% / 38%; the rest show the
  sentence without a pronunciation line rather than guessing at one.
- Trusted Types is still unset — it needs a policy for the few places the app
  assigns markup, which is a real change rather than a header.
- Keyboard-only and screen-reader journeys have not been walked by a human.
  Everything above is what a machine can see.
