# v77 — publishable

The ask: make sure this is okay to put in front of the public, on web and on
mobile, without falling foul of AI regulation.

I audited the app against what it actually does rather than what I hoped it did,
and found seven gaps. Two of them were things already written down in the code
that were **not true**.

---

## 1. The app told people a lie about their microphone

`src/audio/speech.js` carried this, in a comment, as a design principle:

> "nothing about the learner's voice leaves their machine"

**It isn't true.** The Web Speech API is not on-device in Chrome — Chrome streams
microphone audio to Google's speech service and returns a transcript. The comment
was heading straight into a privacy policy, where it would have been a false
statement to users and to regulators, which is materially worse than having no
policy at all.

Corrected in the code, and the privacy policy now states the real position: **this
app never receives your audio; your browser vendor does, under their policy** — and
every speaking exercise can be answered by typing instead, graded identically.

## 2. Every visitor's IP address was going to Google before the app loaded

`index.html` pulled fonts from `fonts.googleapis.com` and `fonts.gstatic.com`. That
transmits the visitor's IP to Google on page load, with no consent and no way to
decline. A German court awarded damages for exactly this (LG München I,
3 O 17493/20).

Fonts are now **self-hosted** (`scripts/fetch-fonts.mjs` → `public/fonts/`), which
also drops the 24 subsets the app never renders — cyrillic, greek, vietnamese.

**The app now makes zero third-party requests until the learner opens an AI
conversation.** There's a browser test that fails if that ever stops being true.

---

## 3. The AI never said it was an AI

This is the one with a specific regulatory hook. The guide has a name, a home
town, a job and a first-person introduction:

> "Assalam-o-alaikum! I'm Amina, from Lahore. I teach literature…"

That's deliberate and it's why people practise — a character is far easier to talk
to than a text box. It's also precisely the case **EU AI Act Article 50** is
written about: you must tell people they're interacting with an AI *unless it's
obvious*. A woman introducing herself by name is the opposite of obvious.

There was no disclosure anywhere in the conversation UI. Now:

- **A consent gate before the first conversation** — what it is, that it's often
  wrong, exactly what leaves the device and who receives it, and that declining
  costs nothing. Two separate confirmations, neither pre-ticked (a pre-ticked
  consent box is not consent — *Planet49*, C-673/17).
- **A permanent marker above every conversation.** Not a toast that fades. If the
  conversation is on screen, so is the fact that it's a machine.
- **The model is instructed never to deny it.** Asked in any language, seriously or
  as a joke, whether it's a real person, it must break character and say it's an
  AI. Without that instruction "stay in character" means the app lies to anyone
  who asks the one question that matters.
- **Both doors are gated** — the conversation *and* the scenario builder, which
  sends the learner's own typed description off the device.
- **A report control on every AI reply.** It stores locally and *says so*, because
  claiming a report had been filed when there's no backend would be its own lie.
- **Withdrawal** — a switch in Settings. Consent you can't withdraw isn't consent.

### Boundaries the character doesn't get to cross

The persona instruction was, in effect, "be whoever they asked for". It now has
limits, stated last so they override the character:

- never deny being an AI;
- not a doctor, lawyer, therapist or financial adviser whatever the character does
  for a living — it offers to practise the *language* of that appointment instead,
  which is the genuinely useful thing it can do;
- no sexual or romantic roleplay, whoever the character is and whatever is asked;
- no claiming feelings about the learner, a life that continues after the
  conversation, or memory beyond the current request.

The scenario generator has a matching block, since a learner-typed description is
otherwise a free hand at defining the scene.

---

## 4. Age

- **13 for the app**, asked at onboarding.
- **16 for the AI**, asked again at the gate.

GDPR Art. 8 sets digital consent at 16 with member states free to drop to 13; the
UK sets 13 but the Children's Code imposes design duties well past it. Rather than
trying to work out which number applies to which user in which country, the app
takes the highest common bar for the one feature carrying real risk and leaves
everything else open to everyone.

Self-declared, not verified. `COMPLIANCE.md` says so plainly rather than implying
otherwise.

## 5. You could delete your data but not take it

Settings had a reset button and nothing else. Delete without export is the worse
half of the pair.

**Export** now writes every key the app holds as JSON, built and saved in the
browser with no network call — an export that posted your data to a server to
generate a download would be the most ironic possible implementation. The key list
comes from storage rather than a hand-written array, so it can't quietly go stale
the first time a feature adds a key and silently omit something.

**Delete** now says what it destroys and that there's no copy anywhere.

## 6. Mobile

You don't need separate apps and shouldn't build them separately.

`public/manifest.webmanifest` plus the manifest link and Apple meta tags make the
web app **installable** — Add to Home Screen on iOS, Install on Android, standalone
and full-screen with an icon, no store submission, updates ship instantly. For most
users that's enough.

For real store listings the route is **Capacitor** wrapping this exact build —
one codebase, three targets. `COMPLIANCE.md` has the commands and, more usefully,
the list of what changes: native speech plugin and usage strings, age rating, App
Store 1.2 (AI conversation counts as user-generated content), in-app purchase.

## 7. Everything is written down

`COMPLIANCE.md` — what's handled, what isn't, what needs a lawyer, and three
🔴 blockers that stop you publishing today:

1. **Operator placeholders.** `src/legal/policies.js` has `[LEGAL ENTITY NAME]`,
   `[CONTACT EMAIL]`, `[POSTAL ADDRESS]`, `[COUNTRY / STATE OF ESTABLISHMENT]`.
   They render as literal bracketed text and the app shows a red "not ready to
   publish" banner while any remain — at onboarding and on the Legal screen. That
   banner is the tripwire. Don't remove it; fill the values in.
2. **A lawyer has to read the policies.** They're accurate about the product —
   every factual claim checked against source, which is more than a template gives
   you — but accurate isn't the same as sufficient for your jurisdiction.
3. **Decide where AI reports go** before any store submission. Local-only is
   defensible for a web app and probably not for App Store 1.2.

---

## Verification

```sh
npm run check && node scripts/verify-browser.mjs
```

- `verify-browser.mjs` — **178 assertions** (was 120), including three new
  sections written against behaviour rather than copy, so rewording a policy
  doesn't turn them red:
  - **onboarding** — both boxes required, neither pre-ticked, policies readable
    *before* accepting, answers survive going to read them, what was agreed is
    recorded, and agreeing to the app does **not** silently agree to the AI;
  - **the AI gate** — nothing is sent before consent (asserted by counting calls
    to a stubbed endpoint, not by reading the UI), both doors gated, declining
    returns you to a working app and is remembered, the marker is on screen once
    accepted, and a report is genuinely stored;
  - **data rights** — the export is a real file containing *every* stored key, the
    AI can be switched off after being switched on, and the policies are reachable.
  - Plus: **zero third-party requests** on load and through onboarding.
- `npm run check` — 58 engine/content assertions and the build, unchanged.
- `verify-lessons-browser.mjs` — **112 lessons, 9738 steps, 0 problems** across all
  14 languages at four progress levels. This is the run that confirms the v76.1
  missing-import fix holds everywhere, not just in the three languages the smoke
  test covers.

## Still open

- Accessibility has never been audited against WCAG 2.2 AA.
- No Content-Security-Policy header yet — now practical, since there are no
  third-party origins left to allow.
- Consent isn't re-asked when the policies change; `LAST_UPDATED` is stored in
  `appState.consent.policyVersion` but nothing compares it yet.
