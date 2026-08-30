# Publishing Zaban — what's handled, what isn't, what needs a lawyer

**This is not legal advice.** I'm not a solicitor and neither is the code. This
is an honest engineering account of what the app does, which obligations that
plausibly triggers, what I built to meet them, and — the part that matters most —
**what is still missing and would be a problem if you published tomorrow**.

Read the [Before you publish](#before-you-publish) checklist first. Three items
on it are blockers.

---

## What the app actually does

Everything below follows from these facts, so they're worth stating plainly.

| | |
|---|---|
| **Accounts** | None. No sign-up, no email, no password, no user id. |
| **Where progress lives** | `localStorage` on the device, under the `lingua:` prefix. There is no server-side copy. |
| **Analytics** | None. No SDK, no pixel, no product analytics of any kind. |
| **Advertising** | None. No ad SDK, no advertising identifier. |
| **Cookies** | None set by the app. |
| **Payments** | None. `isPremium` is a local flag with no payment path behind it. |
| **Data leaving the device** | Three things, all feature-gated: conversation text to Anthropic via `/api/coach`, text the learner pastes into Decode via `/api/decode`, and microphone audio to the **browser vendor** during speech recognition. |
| **Server-side storage** | None. `/api/coach`, `/api/scenario` and `/api/decode` are stateless — they hold nothing between requests and log no request content. |

That "no accounts, no analytics, no server-side storage" combination is why this
is a genuinely small compliance surface. Most of the risk sits in one place: the
AI conversation.

---

## The AI, and why it's the sharp end

The design decision that makes this product good is also the one that creates the
obligation. The guide has **a name, a home town, a job and a first-person
introduction**:

> "Assalam-o-alaikum! I'm Amina, from Lahore. I teach literature…"

That's deliberate — a character is far easier to talk to than a text box, and
people practise more when they're talking to someone. But **EU AI Act Article 50**
requires that people be informed they're interacting with an AI system *unless
that is obvious from the circumstances*. A named character introducing herself in
the first person is the textbook example of "not obvious". Before this release
there was **no disclosure anywhere in the conversation UI**.

### What was built

| Obligation | What exists now | Where |
|---|---|---|
| Tell people it's an AI | `AiGate` — a consent screen before the first conversation: what it is, that it gets things wrong, what leaves the device, what declining costs (nothing) | `src/ui/AiDisclosure.jsx` |
| Keep telling them | `AiBadge` on a permanent strip above every conversation thread. Not a toast — it's on screen whenever the conversation is | `LiveConversation.jsx` |
| Don't let it deny being AI | A `BOUNDARIES` block in the system prompt that overrides the persona: asked in any language whether it's a person, it says plainly that it's an AI | `api/coach.js` |
| Say it can be wrong | On the gate, on the strip, in the AI disclosure policy, and on the Fluency score where model-graded turns feed the number | throughout |
| Reporting mechanism | `ReportAi` on every AI turn and on every decode | `src/ui/AiDisclosure.jsx` |
| Withdrawal | Settings switch that turns the AI off after consent was given | `screens.jsx` → `PrivacyAndAi` |
| Full written disclosure | "About the AI" policy — what's sent, to whom, what it's not for | `src/legal/policies.js` |

### Other AI-side boundaries added

The persona instruction used to be, in effect, "be whoever they asked for". It
now has limits stated last in the prompt, so they read as overriding the
character:

- **Never deny being an AI** (above).
- **Not a doctor, lawyer, therapist or financial adviser**, whatever the
  character does for a living — it offers to practise the *language* of that
  appointment instead, which is the genuinely useful thing it can do.
- **No sexual or romantic roleplay**, regardless of persona or request.
- **No claiming feelings about the learner, a continuing life, or memory beyond
  the current request.**
- The scenario generator has a matching block, since a learner-typed description
  is otherwise a free hand at defining the scene.
- The decoder has its own, adapted to what it does: it must translate faithfully
  even when the content is difficult (a real message about an illness is exactly
  when someone most needs to understand it), it must not advise on the content,
  and the suggested reply must never commit the learner to anything.

### Decode: a third-party data path worth naming explicitly

`/api/decode` (v78) takes text the learner pastes — very often **a private
message written by somebody else**, who has not agreed to anything. That is a
materially different kind of input from the learner's own conversation turns, and
it is treated as such:

- the screen says where the text goes **above the box**, before anything is
  typed, not in a policy afterwards;
- it is capped at 600 characters, goes in a user turn, is never interpolated into
  the system prompt, and is not logged;
- it sits behind the same AI consent gate as the conversation;
- the model is instructed that the text is data and never an instruction to it;
- words the learner saves keep a 200-character fragment of the source sentence
  locally so they can see the context — that fragment is in the data export and
  is destroyed by Delete, like everything else.

⚠️ **For a lawyer:** the learner is pasting a third party's message. Our lawful
basis analysis covers the learner's own data; text about, and written by, other
people passing through a processor is worth a specific look before launch. The
mitigation in the product is that nothing is retained server-side and the learner
is told before they paste.

### AI risk classification

Under the EU AI Act, a language-learning conversation partner is **not** in Annex
III (it isn't used to determine access to education, assess learning outcomes for
an institution, or monitor exams). It's a **limited-risk** system whose obligation
is transparency — Article 50 — which is what the above addresses.

⚠️ **This changes if you ever add**: certification, a score that gates admission or
employment, proctoring, or emotion recognition. Any of those could move it into
high-risk with a very different obligation set. Don't add them without advice.

---

## Privacy

### Where the data is

On the device. That single fact does most of the work: there's no breach surface,
no retention schedule to write, no processor agreements for storage, and the
subject rights are ones the person can exercise themselves.

### The false claim I removed

`src/audio/speech.js` carried this comment:

> "nothing about the learner's voice leaves their machine"

**That was wrong.** The Web Speech API is not on-device in Chrome — Chrome streams
microphone audio to Google's speech service and returns a transcript. The comment
was on its way into a privacy policy, where it would have been a false statement
to users and to regulators. It's now corrected in the code, and the privacy
policy states the true position: **the app never receives your audio; your browser
vendor does, under their policy.** Every speaking exercise can be answered by
typing instead, graded identically.

### Google Fonts — fixed

`index.html` loaded fonts from `fonts.googleapis.com` / `fonts.gstatic.com`, which
transmits every visitor's IP address to Google on page load, before consent and
with no way to decline. A German court (LG München I, 3 O 17493/20) awarded
damages for exactly that pattern.

The fonts are now **self-hosted** in `public/fonts/`, generated by
`node scripts/fetch-fonts.mjs`, which also drops the subsets the app never renders
(cyrillic, greek, vietnamese) — 31 files kept, 24 skipped. **The app now makes no
third-party requests at all until the learner opens an AI conversation.**

### Subject rights

- **Export** — Settings → "Export everything the app holds about you". Enumerates
  every `lingua:` key from storage rather than a hand-written list, so it can't
  silently go stale when a feature adds a key. JSON, built and saved in the
  browser, no network. (`src/legal/exportData.js`)
- **Erasure** — Settings → "Delete all my data", with a confirm that says plainly
  it's permanent and there's no copy anywhere.
- **Access / portability / rectification** — the export is all three, since the
  person holds the only copy.

---

## Children

- **App minimum: 13.** Asked at onboarding, with the terms and privacy policy
  readable inline before ticking. Neither box is pre-ticked — a pre-ticked
  consent box is not consent (*Planet49*, C-673/17).
- **AI minimum: 16.** GDPR Art. 8 sets the digital-consent age at 16 with member
  states free to lower it to 13; the UK sets 13 but the Children's Code imposes
  design duties well past it. Rather than resolving which number applies to which
  user in which country, the app takes the **highest common bar for the one
  feature that carries real risk** — free-text conversation with a language model
  — and leaves everything else open.

⚠️ **These are self-declared, not verified.** That's what the overwhelming majority
of consumer apps do, and it is not the same as age assurance. If you market to
under-18s, or an app store classifies you as child-directed, this is likely to be
insufficient — get advice before that happens.

---

## Mobile and web: one codebase or several?

You asked whether you need separate apps. **You don't, and you shouldn't build
them separately** — three codebases would triple the work and guarantee they
drift.

### What now works

The web app is installable **and works offline** (v81). `public/manifest.webmanifest`
plus the manifest link and Apple meta tags in `index.html` mean **Add to Home
Screen** on iOS and **Install app** on Android give a standalone, full-screen app
with an icon and no browser chrome. `public/sw.js` then makes everything except
the AI conversations work with no connection at all. Nothing to submit, nothing
to review, updates ship instantly.

⚠️ **Privacy note on the cache:** `/api/*` is network-only and is never written to
any cache, deliberately — those requests carry AI conversations and text pasted
into Decode, which is often a third party's private message. `scripts/verify-offline.mjs`
asserts that nothing under `/api/` is ever found in cache storage. Everything the
worker does cache (the app shell, hashed build assets, and audio recordings) is
public course content, not personal data, and is cleared by the browser's normal
"clear site data" alongside the localStorage that Delete already erases.

**For most of your users this is enough**, and it's the fastest path to people
actually using it.

### If you want real store listings

The route is **Capacitor** — it wraps this exact build in a native shell:

```sh
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init Zaban com.yourdomain.zaban --web-dir=dist
npm run build && npx cap add ios && npx cap add android && npx cap sync
```

One codebase, three targets. What changes:

| | Web / PWA | App Store / Play |
|---|---|---|
| Review | None | Yes, and they read the policies |
| Privacy policy URL | Should have | **Required**, plus a data-safety form |
| Speech recognition | Browser API (Google/Apple) | Needs a native plugin + `NSSpeechRecognitionUsageDescription` / `NSMicrophoneUsageDescription` with honest strings |
| Age rating | — | Declared; AI chat usually pushes to 12+/17+ depending on the store's read |
| UGC rules | — | **App Store 1.2** — AI conversation counts. Needs a report mechanism (built), a way to act on reports (**not built — see blockers**), and published terms |
| Payments | — | Digital goods must use in-app purchase. `isPremium` has no payment path today, so nothing to fix yet — but don't add a Stripe link inside the app |

⚠️ The **`ReportAi` control stores reports locally only.** It says so to the
learner rather than pretending a report was filed. For a store submission that's
probably not enough: reviewers expect reports to reach the operator. See blockers.

---

## Before you publish

### 🔴 Blockers

1. **Fill in the operator placeholders** in `src/legal/policies.js` — legal
   entity, contact email, postal address, jurisdiction. They render as literal
   `[LEGAL ENTITY NAME]` text, and the Legal screen shows a red "Not ready to
   publish" banner while any remain, in the app and at onboarding. That banner is
   the tripwire; don't remove it, fill the values in.
2. **Have a lawyer read the policies.** They're accurate about the product — I
   checked every factual claim against the source, which is more than a template
   gives you — but accurate is not the same as sufficient for your jurisdiction
   and your entity.
3. **Decide where AI reports go** before any store submission. Options: an email
   address in the policy the learner can copy the export to (cheapest, honest), a
   simple `/api/report` endpoint, or a third-party form. Local-only storage is
   defensible for a web app and probably not for App Store 1.2.

### 🟡 Should do

4. ~~**Set a Content-Security-Policy header.**~~ **Done in v78** — `vercel.json`
   sets a strict CSP (`default-src 'self'`, no third-party origins at all), plus
   COOP, `X-Frame-Options: DENY`, `nosniff`, a referrer policy, HSTS, and a
   `Permissions-Policy` that grants the microphone to this origin only and denies
   camera, geolocation and payment outright.
5. **Serve the policies at stable public URLs** too, not only in-app — app stores
   and payment processors ask for a link, not a screenshot.
6. ~~**Re-ask for consent when the policies change.**~~ **Done in v80** — when
   the stored `appState.consent.policyVersion` differs from `LAST_UPDATED`, a bar
   appears with a link to what changed and an acknowledgement that records the
   new version and the time it was read. Deliberately not a modal.
7. **Decide on retention for Anthropic's side.** The app stores nothing
   server-side, but Anthropic's own retention applies to what's sent. Check the
   commercial terms for your account and make sure the privacy policy matches.
8. **Accessibility.** Not a legal blocker for most private operators today, but
   EN 301 549 / WCAG 2.2 AA is where public-sector and larger-operator obligations
   are heading. **Partly addressed in v80**: `npm run audit-a11y` walks sixteen
   screens in three themes and reports 0 issues for accessible names, AA text
   contrast, image alt text and input labels — down from 82, and it found that
   the Dark theme had been rendering near-black text on near-black at 1.2:1.
   **Extended in v94–v96.** `npm run audit-keyboard` fails the build if any
   clickable element lacks a role, a tab stop and a key handler — it found ten
   that did, two of them the flashcard, which made the app's single most-used
   interaction mouse-only (WCAG 2.1.1 Keyboard). The language picker could be
   opened by keyboard and not closed by one; it now has `role="dialog"`,
   `aria-modal`, a label and Escape (2.1.2, 4.1.2). `npm run audit-motion`
   requires a blanket `prefers-reduced-motion` rule — the app had fourteen
   infinite animations and the old rule named six selectors, so a bobbing tutor
   and a pulsing mic kept running for someone who had asked the OS to stop them
   (2.3.3 Animation from Interactions). Verified empirically: three animations
   running normally, **zero** with reduced motion requested. Progress bars also
   now expose `role="progressbar"` with their value (4.1.2). **v98** fixed the
   Sentence Lab: tiles already placed were still real `<button>`s with no
   handler, so a keyboard user was walked through a row of controls that do
   nothing (they're `disabled` now), and the "Not quite" / "Perfect word order!"
   feedback was a colour and a mounted `<div>` with no live region — a screen
   reader user tapped a tile and got silence either way. Both are `role="status"`
   (4.1.3 Status Messages).

   ⚠️ Still outstanding: a real screen-reader journey walked by a human, and
   focus management on route changes. Automated checks cannot tell you whether
   the app is *usable* blind — only that the labels exist.
9. **Move the AI rate limit into a shared store.** **Partly addressed in v97.**
   All three AI endpoints identified the caller as
   `x-forwarded-for.split(",")[0]` — the *leftmost* entry of a header the caller
   writes — so sending a fresh `X-Forwarded-For` on every request looked like a
   fresh visitor and the limit never fired. On endpoints with no accounts in
   front of them that spend money per call, that was the whole protection. They
   now take the address only from headers the platform sets, fall back to the
   rightmost forwarded entry, bound the sum across endpoints, and enforce a
   per-instance ceiling that address rotation cannot escape
   (`npm run test-api-guard`, 12 assertions).

   ⚠️ Still outstanding: the counters are in-process, so the real ceiling is
   this times the number of warm instances. Vercel KV / Upstash is the fix, and
   it needs provisioning this repo does not assume. Set `AI_MAX_PER_MINUTE` and
   `AI_MAX_PER_CALLER` to suit your budget, and put a spend cap on the Anthropic
   key regardless.

### 🟢 Already handled

- AI disclosure, gated consent, permanent on-screen marker, model instructed
  never to deny being an AI
- Age gates (13 app / 16 AI), no pre-ticked boxes, policies readable before
  accepting
- Data export and permanent delete
- Privacy policy, terms, AI disclosure — accurate to the code, including the
  uncomfortable bit about browser speech recognition
- No analytics, no ads, no cookies, no tracking, no third-party requests before
  consent
- API key server-side only; learner text in user turns, never interpolated into
  the system prompt; three-level rate limiting on an address the caller cannot
  forge (v97); caps on body, history and turn length; refusals handled; upstream
  errors never echoed to the client
- Reporting control on every AI turn
- Installable on mobile without an app store

---

## Where things live

```
src/legal/policies.js      the policy text + OPERATOR placeholders + age constants
src/legal/exportData.js    GDPR export — enumerates storage, no network
src/screens/Legal.jsx      the in-app policy reader
src/ui/AiDisclosure.jsx    AiGate, AiBadge, AiNote, ReportAi
api/coach.js               BOUNDARIES block in buildSystem()
api/scenario.js            BOUNDARIES block in SYSTEM
scripts/fetch-fonts.mjs    regenerates the self-hosted fonts
public/manifest.webmanifest
```

Last reviewed against the code: **2026-08-21** (v81).
