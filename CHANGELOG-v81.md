# v81 — it works without a connection

The app sold "Offline mode" in two places and there was **no service worker at
all**. It was entirely online-only: a tunnel, a plane, a bad afternoon on a
mobile network, and nothing worked.

That's the same false claim as "Unlimited hearts", which I removed in v79 for
exactly this reason — and this one survived, in the same card, in copy I had
rewritten. I read past it twice.

---

## Why it matters more here than it would elsewhere

This app is for heritage languages, so its learners are disproportionately in and
travelling to places where mobile data is expensive, metered or simply absent:
Pakistan, Nigeria, India, Bangladesh. Everyone else is on a train under a river.

And the whole course was **already local**. The packs are bundled. The 8.5MB of
recorded audio is on our own origin. Progress lives in `localStorage`. The only
thing that has ever needed a network is the AI. An app that already ran entirely
on the device had no business failing because a tunnel arrived.

---

## What it does now

Everything except the AI conversations. Lessons, reviews, the spaced-repetition
scheduler, the reading library, flashcards, grammar, the alphabet course,
speaking drills, and every bit of progress — all offline, verified with the
network genuinely cut rather than mocked.

The strategy, per kind of request:

| | |
|---|---|
| **App shell** | precached on install, so the *first* offline load works |
| **Build assets** (`/assets`, `/fonts`) | cache-first — Vite fingerprints them, so a cached one is correct by construction |
| **Audio** | cache-on-use, plus a deliberate "download this language" in Settings |
| **`/api/*`** | **never cached, in any circumstance** |
| **Navigation** | network-first with a 3.5s timeout, falling back to the cached shell |

**`/api/*` is network-only on purpose.** Those requests carry AI conversations
and decoded private messages. A stale cached reply would be both wrong and a
privacy problem, and there is no version of "your grandmother's message, served
from a cache" that is a good idea. The offline test asserts nothing under
`/api/` ever ends up in a cache.

Audio is cache-on-use rather than precached because precaching 8.5MB before
anyone has done a single lesson — most of it for languages they will never open —
is a worse default than filling it as they learn. For the person who *knows*
they're about to lose signal, Settings has **"Take Urdu on a plane"**, which
reports what actually landed on the device rather than what it asked for: three
of the fourteen languages have no recorded audio at all, and a progress bar
sailing to 100% over 177 consecutive 404s would be a lie told very convincingly.

The offline bar leads with **what still works**, not what's broken. Almost
everything does, and a banner that just says "You are offline" invites someone to
close an app that would have been fine.

---

## Two real bugs found by testing it properly

Neither would have been caught by reading the code, and the second is the kind of
thing that ships and quietly breaks for a fraction of users forever.

### 1. A service worker doesn't control the page that registers it

On someone's very first visit, the HTML, the JS bundle and the stylesheet are all
fetched **before the worker exists**. They never pass through it and never land
in the cache. The worker then installs, precaches the handful of static URLs it
knows by name, and reports itself ready — and the first offline load is a blank
screen, because the cached HTML asks for a bundle that was never cached.

The fix is to precache the entry files by name, but their names are content
hashes that only exist after the build. `scripts/build-sw.mjs` runs after `vite
build`, reads what was actually produced, and writes the list into the worker.
That's all Workbox's `injectManifest` does, in about thirty lines and with no
dependency.

### 2. `Vary: Origin`

This one cost an afternoon and is the more interesting failure.

With the assets correctly precached, they *still* failed offline. The URLs were
demonstrably in the cache. They just never matched.

Cache matching honours the `Vary` header, and Vite's preview server — like Vercel
on some routes — sends `Vary: Origin`. A request the **worker** creates for
precaching carries no `Origin` header. The request the **page** makes for the
same file does, because a module script and a `crossorigin` font preload are both
CORS requests. Same URL, different `Origin`, no match.

It was **intermittent**, which is the worst kind: on some loads the file had
already been cached by `cacheFirst` from the page's own request, which does carry
`Origin`, and then it matched perfectly. One run in three passed.

Every lookup now passes `ignoreVary: true`, which is safe for precisely what's
cached here — same-origin, immutable, content-hashed files whose bytes don't
depend on any request header — and would not be safe for a content-negotiated
response, which is never cached.

---

## And the claims are true now

- The upgrade card led with **"Offline mode"**. Offline is free for everyone, so
  it isn't something to sell — it's stated as a fact on the line below instead.
- The Upgrade screen listed **"📴 Offline mode · Learn anywhere"** as a premium
  feature. Replaced with the thing that *is* worth having: saving every recording
  for a journey.

`vercel.json` also gained the two headers this needs in production: `sw.js` must
never be cached (a stale worker can never be replaced, and there is no
server-side fix afterwards), and `/audio/*` is immutable for a year.

---

## Verification

```sh
npm run check && npm run verify-offline && npm run audit-a11y
```

- **`verify-offline` — 15 assertions, 0 fail, three runs in a row.** It installs
  the worker, sets the browser context genuinely offline, then reloads the app
  from scratch, opens a lesson and plays eight steps of it, opens the reading
  library, confirms Decode says it needs a connection instead of hanging,
  confirms progress written offline persisted, confirms **no `/api/` request is
  ever in a cache**, and confirms the notice clears when the network returns.
  Three runs because the `Vary` bug passed one run in three, and a single green
  run proves nothing about a race.
- `verify-browser` 227/227 · `audit-a11y` 0 issues · `validate-themes` 0 errors ·
  `check` 58 · `test-engine` 197.

## Still open

- The Punjabi and Nigerian Pidgin reading passages want a native speaker's eye.
- Roughly one example sentence per word; two or three would build flexible
  knowledge rather than one memorised frame.
- Urdu and Arabic example romanisation sits at 55% / 38%.
- Keyboard-only and screen-reader journeys have not been walked by a human.
- The service worker has no update prompt yet — a new version takes over on the
  next load, which is correct but silent. Telling someone an update is ready
  needs a UI decision about when it's not rude to say so.
