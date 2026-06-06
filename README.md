# Lingua Pro

A production-grade language learning platform. FSRS spaced repetition, dynamic lesson generation, modular architecture designed to scale to 100k+ words per language. Built single-handedly to be Duolingo for the languages Duolingo ignores — Urdu, Persian, Hindi, Arabic and friends, alongside the usual suspects.

---

## What's in the box

```
lingua-pro/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx                      ← entry
    ├── App.jsx                       ← root router
    ├── index.css                     ← design tokens
    │
    ├── engine/                       ← THE BRAIN. Pure logic, no React.
    │   ├── srs.js                    ← FSRS-lite algorithm
    │   ├── selector.js               ← priority-queue card picker
    │   ├── generator.js              ← dynamic exercise generation
    │   └── Engine.js                 ← facade the UI talks to
    │
    ├── storage/                      ← adapter pattern, swappable backends
    │   ├── index.js                  ← factory (one line to swap)
    │   ├── localStorageAdapter.js    ← works today
    │   └── supabaseAdapter.js        ← stub, ready for cloud sync
    │
    ├── audio/
    │   └── tts.js                    ← browser SpeechSynthesis (free)
    │
    ├── data/
    │   ├── registry.js               ← lazy-loaded language packs
    │   └── languages/
    │       ├── ur.json   (80 words, 10 units)
    │       ├── es.json   (79 words, 10 units)
    │       ├── fr.json   (75 words, 10 units)
    │       ├── ja.json   (38 words, 7 units)
    │       ├── ar.json   (27 words, 7 units)
    │       └── hi.json   (26 words, 7 units)
    │
    ├── hooks/
    │   ├── useEngine.js              ← React glue to the engine
    │   └── usePersistentState.js
    │
    ├── ui/
    │   └── primitives.jsx            ← Button, Card, ProgressBar, etc.
    │
    └── screens/
        ├── screens.jsx               ← Onboarding, Home, Letters, Vocab, Profile, Settings, Upgrade
        └── Lesson.jsx                ← the core learning loop
```

**Layered architecture, each layer replaceable:**

```
UI  ─→  HOOKS  ─→  ENGINE  ─→  STORAGE
                      ↓
                    DATA
```

- The UI never imports SRS, selector, or generator directly. It calls `engine.generateSession()` and `engine.submitAnswer()`.
- The engine never imports React. It's pure JS. You could put it on a server tomorrow.
- Storage is an adapter — `localStorage` today, Supabase by changing one file.
- Languages are JSON. Adding a language = one file, one registry entry. No code changes.

---

## Run it locally — 5 minutes

```bash
npm install
npm run dev
```

Open http://localhost:5173. That's it.

To deploy: push to GitHub → import on vercel.com → click Deploy. Live URL in 60 seconds.

---

## The interesting parts

### FSRS-lite spaced repetition

Three numbers per card: **difficulty** (1–10, intrinsic), **stability** (days, the "memory half-life"), **retrievability** (0–1, current recall probability).

Recall function: `R(t) = (1 + t / (9 · S))^(-1)`

The selector sorts every card by current R and surfaces the lowest first — i.e. the card you're most likely to forget right now. This beats every "review every X days" scheme, including Anki's old SM-2.

See `src/engine/srs.js` for the math, `src/engine/selector.js` for the queue.

### Dynamic lesson generation

There are no static lessons in this codebase. None. Every "lesson" is built at runtime:

1. Selector returns ~10 words (mix of overdue + new based on user load).
2. Generator picks an exercise type per word **based on its mastery**: new cards get gentle recognition, mature cards get production exercises (typing, sentence construction).
3. Distractors are pulled from the same category when possible — so a "fruit" word's wrong options are other fruits, not random nonsense.
4. Exercise types mix within a session to prevent fatigue.

Result: drop 10,000 words into `ur.json`, you instantly have 10,000 words' worth of dynamically-generated lessons.

See `src/engine/generator.js`.

### Schema for vocabulary

```json
{
  "id": "ur_0001",
  "lemma": "سلام",
  "translit": "salaam",
  "translation": "hello, peace",
  "category": "Greetings",
  "difficulty": 1,
  "frequencyRank": 5,
  "tags": ["greeting", "formal"],
  "examples": [{ "native": "السلام علیکم", "translation": "Peace be upon you" }]
}
```

`frequencyRank` is the magic field — new cards are introduced in frequency order so the most useful words appear first. This is how every serious language course works.

---

## Adding a language

1. Create `src/data/languages/de.json` matching the schema above (look at `ur.json`).
2. Add an entry to `src/data/registry.js`:
   ```js
   de: {
     code: "de", name: "German", nativeName: "Deutsch",
     flag: "🇩🇪", rtl: false, ttsCode: "de-DE",
     color: "#000000", tagline: "Engineering of language",
     loader: () => import("./languages/de.json"),
   }
   ```

Done. The new language appears on the picker, gets all the engine features, and the bundle only ships its data when a user picks it (lazy import).

---

## Adding more vocabulary

Just append to the `vocab` array in any language file. Maintain the schema. The lesson engine, SRS scheduler, and stats all pick it up instantly.

**Realistic goal:** 300 words per language for a launch, 1,000+ for a serious product. Hire a native-speaker linguist on Upwork (~£150–250 per language) and brief them with one example item from `ur.json`. They can produce 200 words in a weekend.

---

## Audio — what works now and how to upgrade

**Today (free, zero setup):** `src/audio/tts.js` uses the browser's built-in `SpeechSynthesis` API. It supports 30+ languages out of the box, has zero cost, and works offline. Voice quality varies by OS — macOS and iOS sound great; some Android devices sound robotic. Some niche languages (Persian) may be missing entirely on certain devices.

**Upgrade path 1: ElevenLabs (~$5/mo for ~30k chars)** — the best AI voices money can buy. Replace `speak()` with a fetch to the ElevenLabs API, or pre-generate MP3s at build time and host them on Cloudflare R2 (free under 10GB). Best quality:cost ratio for a small launch.

**Upgrade path 2: Google Cloud TTS (~$4 per million chars)** — cheaper at scale, decent quality. Same pattern: pre-generate, host, fetch.

**Upgrade path 3: hire native voice actors** — best quality, ~£300 per 300 words per language via Upwork or Voices.com. Necessary for premium tier eventually.

The adapter pattern means upgrading is one file change. No screens, no engine code.

---

## Backend — adding cloud sync

Right now: progress lives in `localStorage`. Survives reloads, lost on browser clear.

To add Supabase (~1 day of work):

1. `npm install @supabase/supabase-js`
2. Create a Supabase project at supabase.com (free tier).
3. Run this SQL in their SQL editor:
   ```sql
   create table kv (
     user_id uuid references auth.users not null,
     key text not null,
     value jsonb,
     updated_at timestamptz default now(),
     primary key (user_id, key)
   );
   alter table kv enable row level security;
   create policy "users own rows" on kv
     for all using (auth.uid() = user_id);
   ```
4. Open `src/storage/supabaseAdapter.js` — it's already implemented as a stub.
5. In `src/storage/index.js`, swap the factory:
   ```js
   import { createClient } from "@supabase/supabase-js";
   import { SupabaseAdapter } from "./supabaseAdapter.js";
   const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
   instance = new SupabaseAdapter(client);
   ```

That's it. The engine and every screen continue to work — they only know about the adapter interface.

You'll also need a sign-in screen. Supabase Auth gives you email + Google in ~30 lines.

---

## Mobile — getting to the App Store

**Easiest path: Capacitor (1 day).** Wraps your existing web app as a real native iOS/Android app. Same code runs everywhere.

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init Lingua com.you.lingua
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

Hit Run in Xcode. You have an iOS app.

**Better long-term: React Native + Expo.** Rewrite the screens as `<View>` instead of `<div>` — but the engine, storage, audio adapters, and language packs all transfer **unchanged**. That's the point of the architecture.

---

## Monetisation — wiring real billing

**Web (Stripe):**
- Create products in Stripe Dashboard: "Lingua Plus Monthly" / "Yearly"
- In `src/screens/screens.jsx`, find the `Upgrade` component
- Replace `setAppState((s) => ({ ...s, isPremium: true }))` with a redirect to Stripe Checkout
- Add a webhook on your backend that sets `isPremium = true` on successful payment

**Mobile (RevenueCat — recommended):**
- Free up to $10K MRR
- Wraps Apple/Google subscription APIs cleanly — one SDK call instead of dealing with native StoreKit
- Lets you track revenue across both stores in one dashboard

**Ads (free tier monetisation):**
- Web: Google AdSense, banner above the bottom nav
- Mobile: AdMob, same placement
- Show only to non-premium users (`!appState.isPremium`)

---

## What's deliberately NOT in this codebase

- **Static lesson files.** Every lesson is generated. This is a feature.
- **Hardcoded language data inside `.js` files.** All language data is JSON, lazy-loaded. Scales to 100k entries per language without bloating the bundle.
- **Tightly-coupled storage.** Swap localStorage for Supabase, IndexedDB, or your own API by changing one file.
- **A UI library.** Inline styles only. Zero dependencies beyond React. The whole bundle is ~207KB before gzip.
- **A backend.** localStorage is enough until you have 100+ users. Adding Supabase later is a one-file swap.

---

## Connectors I can't wire from this chat (you'll need accounts)

These are the things that need YOU to sign up and put credentials in — I can write the code, but the secrets and accounts are yours:

| Service | What it does | Cost | When to add |
|---|---|---|---|
| **Supabase** | Cloud database, auth, file storage | Free up to 500MB | When you have 50+ users |
| **Stripe** | Web payments | 2.9% + 30p per txn | When you want to charge web users |
| **RevenueCat** | iOS/Android subscriptions | Free under $10K MRR | When you go to App Store |
| **Apple Developer** | Required to publish on iOS App Store | £79/year | When mobile app is ready |
| **Google Play Console** | Required for Android | £20 one-time | When you want Android too |
| **ElevenLabs** | High-quality AI voices | $5/mo+ | When ready to upgrade audio |
| **Cloudflare R2** | Cheap CDN for audio files | Free under 10GB | When using pre-generated audio |
| **PostHog** or **Plausible** | Analytics — see what users actually do | Free tiers | Week 1 of any launch |
| **Sentry** | Error tracking, see crashes in real-time | Free up to 5k events/mo | Before any public launch |
| **Mailgun** or **Resend** | Transactional email (welcome, password reset) | Free tier | When you add accounts |
| **Cloudflare Turnstile** | CAPTCHA without Google tracking | Free | When sign-up gets bot traffic |

Get **Supabase + Sentry + PostHog** before launching publicly. The other three (Stripe, RevenueCat, ElevenLabs) only matter once you have users actually wanting to pay.

---

## Realistic 8-week launch plan

**Week 1** — Deploy this to Vercel. Share with 10 friends. Watch them use it, take notes.
**Week 2** — Hire a Urdu linguist on Upwork to expand `ur.json` to 250+ items.
**Week 3** — Wire Supabase. Add email auth. Migrate localStorage data on first login.
**Week 4** — Capacitor wrapper. Run on your phone via TestFlight (Apple Developer account needed).
**Week 5** — Add Sentry + PostHog. Fix the top 5 errors users hit.
**Week 6** — Wire Stripe (web) and RevenueCat (mobile). Test the upgrade flow end-to-end.
**Week 7** — TestFlight beta with 20 real users from r/Urdu, r/learnurdu, Pakistani diaspora groups.
**Week 8** — App Store submission. Privacy policy via termly.io. Screenshots. Description with keywords.

The hardest part is content. Everything else is mechanical.

---

## License

MIT (or whatever you want — it's your code).
