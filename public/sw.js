// =============================================================================
// SERVICE WORKER (v81) — the app works without a connection.
//
// WHY THIS EXISTS, AND WHY IT'S EMBARRASSING THAT IT DIDN'T. "Offline mode" was
// sold in two places in the upgrade pitch and there was no service worker at
// all: the app was entirely online-only. That is the same class of false claim
// as "Unlimited hearts", which was removed in v79 for exactly this reason — and
// this one survived, in copy I had rewritten, in the same card.
//
// WHY IT MATTERS MORE HERE THAN IT WOULD ELSEWHERE. This app is built for
// heritage languages, which means its learners are disproportionately in and
// travelling to places where mobile data is expensive, metered, or simply
// absent — Pakistan, Nigeria, India, Bangladesh — and everywhere else they're on
// a train under a river. The whole course is already local: the packs are
// bundled, the audio is on the origin, progress lives in localStorage, and the
// only thing that ever needs the network is the AI. An app that already runs
// entirely on the device had no business failing because a tunnel arrived.
//
// THE STRATEGY, per kind of request:
//
//   THE SHELL — precached on install, so the very first offline load works
//   rather than only working if you happened to visit the right screen before.
//
//   HASHED BUILD ASSETS (/assets/*, /fonts/*) — cache-first. Vite fingerprints
//   them, so a cached one is by definition still correct; the name changes when
//   the content does.
//
//   AUDIO (/audio/*) — cache-on-use, 8.5MB across 11 languages. Precaching all
//   of it would mean a 8.5MB download before anyone had done a single lesson,
//   most of it for languages they will never open. So it fills as they learn,
//   and Settings offers a deliberate "download this language" for a journey.
//
//   /api/* — NETWORK ONLY, never cached, not even opportunistically. These are
//   AI conversations and decoded private messages. A stale cached reply would be
//   both wrong and a privacy problem, and there is no version of "your
//   grandmother's message, served from a cache" that is a good idea.
//
//   NAVIGATION — network-first with a fast timeout, falling back to the cached
//   shell. Network-first rather than cache-first so a deploy is picked up
//   promptly; the timeout is there because "slow" is the common failure on a
//   patchy connection, not "absent", and a 30-second hang is worse than an
//   instant offline render.
//
// THE STALE TAB PROBLEM (v82), which v81 made worse before it made it better.
//
// This app code-splits: fifteen screens arrive as lazily-imported chunks with
// content-hashed names. Someone leaves a tab open, we deploy, and the chunk
// names change. They tap "Reading" an hour later, the old chunk is requested,
// and the host no longer has it — every static host serves the current
// deployment, not the last four. React.lazy rejects, and the screen dies.
//
// A service worker with a VERSIONED asset cache makes that strictly worse: the
// new worker activates, deletes the old cache as housekeeping, and destroys the
// one copy of that chunk still in existence. The tab was previously only broken
// if it was online and unlucky; now it's broken either way.
//
// So the asset cache is unversioned and capped instead. A fingerprinted name
// means an old chunk is still exactly correct for the page that wants it, and
// keeping it is the difference between an open tab surviving a deploy and an
// open tab breaking. The app also handles the failure at the other end — see the
// chunk-error reload in App.jsx — because the cache can still be evicted by the
// browser, and belt-and-braces is the right amount of engineering for "the app
// breaks for everyone who had it open when we shipped".
// =============================================================================

// Bumped on every release that changes the shell. Old caches are deleted on
// activate, so this is also how a bad cache gets cleaned up in the field.
const VERSION = "v82";
const SHELL = `zaban-shell-${VERSION}`;

// DELIBERATELY UNVERSIONED, and this is load-bearing — see "the stale tab
// problem" below. Vite fingerprints every file in here, so a name uniquely
// identifies its bytes: keeping an old build's chunks costs a little disk and
// saves an open tab from breaking the moment we deploy. Capped, so it can't
// grow across a year of releases.
const ASSETS = "zaban-assets";
const AUDIO = "zaban-audio";        // likewise: an mp3 of a word being said does
                                    // not change between releases.

// Kept small on purpose. Everything else arrives through cache-on-use, and a
// long precache list is a long list of things that can 404 and abort the whole
// install.
// Filled in at build time by scripts/build-sw.mjs with the app's own entry
// bundle and stylesheet, whose names are content hashes that don't exist until
// the build has run. Without this the very first visit caches the HTML but not
// the JavaScript it asks for — a worker does not control the page that
// registered it, so those requests never pass through here — and the first
// offline load is a blank screen.
const BUILD_ASSETS = [];

const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon-32.png",
  "/icon-180.png",
  "/icon-512.png",
  "/mark-64.webp",
  "/mark-160.webp",
];

const NAV_TIMEOUT_MS = 3500;
// ~2000 words of audio. Comfortably more than anyone learns, far less than a
// browser will evict without warning.
const AUDIO_MAX_ENTRIES = 2400;
// A build produces ~35 files under /assets. 400 is roughly ten releases' worth
// of history, which is far more overlap than any tab stays open for, and still
// a small number of small files. The oldest go first, so the build a tab is
// actually running is never the one evicted.
const ASSETS_MAX_ENTRIES = 400;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // addAll is all-or-nothing: one 404 and nothing is cached at all. Add them
      // individually so a missing icon can't leave a learner with no offline app.
      await Promise.all(
        SHELL_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => {})
        )
      );
      // The entry bundle and stylesheet, by their hashed names. These are what
      // make the FIRST offline load work rather than only the second.
      // Re-adding a URL that's already cached re-inserts it, which moves it to
      // the back of the eviction queue — so this build's files are the last
      // things the cap would ever drop, and older builds' chunks age out first.
      const assets = await caches.open(ASSETS);
      await Promise.all(
        BUILD_ASSETS.map((url) =>
          assets.add(new Request(url, { cache: "reload" })).catch(() => {})
        )
      );
      await trim(ASSETS, ASSETS_MAX_ENTRIES);
      // Take over as soon as this version is ready rather than waiting for every
      // tab to close — paired with clients.claim() below.
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, ASSETS, AUDIO]);
      for (const key of await caches.keys()) {
        if (key.startsWith("zaban-") && !keep.has(key)) await caches.delete(key);
      }
      // Navigation preload shaves the round trip off the network-first path.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => {});
      }
      await self.clients.claim();
    })()
  );
});

// A cache that forgets its oldest entries rather than growing without bound.
// Cache Storage has no LRU of its own, and 8.5MB of audio plus a browser's own
// eviction heuristics is not something to leave to chance.
async function trim(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  // keys() returns insertion order, so the front is the oldest.
  for (const stale of keys.slice(0, keys.length - maxEntries)) {
    await cache.delete(stale);
  }
}

async function putCapped(cacheName, request, response, maxEntries) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  await trim(cacheName, maxEntries);
}

// WHY EVERY LOOKUP PASSES ignoreVary.
//
// This cost an afternoon and is worth writing down. Cache matching honours the
// Vary header: a stored response is only returned when the headers Vary names
// are identical on the new request. Vite's preview server — and Vercel, on some
// routes — sends `Vary: Origin`.
//
// A request the WORKER creates for precaching carries no Origin header. The
// request the PAGE makes for the same file does, because a module script and a
// crossorigin font preload are both CORS requests. Same URL, different Origin
// header, so the match failed and every precached asset fell through to the
// network — which offline means a blank screen.
//
// It was intermittent, which is the worst kind: on some loads the asset had
// already been cached by cacheFirst from the page's own request, which does
// carry Origin, and then it matched fine.
//
// Ignoring Vary is safe for exactly what is cached here: same-origin, immutable,
// content-hashed static files whose bytes do not depend on any request header.
// It would not be safe for a content-negotiated response, and nothing like that
// is ever cached.
async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await caches.match(request, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  // Opaque responses (no-cors) report status 0 and can silently fill the cache
  // with errors, so only store real successes.
  if (response && response.ok) {
    if (maxEntries) {
      putCapped(cacheName, request, response.clone(), maxEntries).catch(() => {});
    } else {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
  }
  return response;
}

async function audioFirst(request) {
  const cached = await caches.match(request, { cacheName: AUDIO, ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    putCapped(AUDIO, request, response.clone(), AUDIO_MAX_ENTRIES).catch(() => {});
  }
  return response;
}

async function navigate(event) {
  try {
    const preload = await event.preloadResponse;
    if (preload) {
      // Only cache a GOOD response as the shell. A 404 or a 502 from a bad
      // deploy would otherwise be written in as the offline app and stay there
      // until the next successful navigation — the worst possible thing to
      // persist, since the whole point is to survive not having a network to
      // correct it with.
      //
      // `redirected` matters too: a redirected response cannot legally be
      // returned from a service worker for a navigation, and replaying one from
      // cache throws rather than degrading.
      if (preload.ok && !preload.redirected) {
        const cache = await caches.open(SHELL);
        cache.put("/", preload.clone());
      }
      return preload;
    }
    // Race the network against a timeout. On a patchy connection the failure
    // mode is a long hang, not a clean error, and a hang looks like a broken app.
    const response = await Promise.race([
      fetch(event.request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("slow")), NAV_TIMEOUT_MS)),
    ]);
    if (response && response.ok && !response.redirected) {
      const cache = await caches.open(SHELL);
      cache.put("/", response.clone());
    }
    return response;
  } catch {
    // This is the whole point of the file.
    const cached =
      (await caches.match("/", { ignoreVary: true })) ||
      (await caches.match(event.request, { ignoreVary: true }));
    if (cached) return cached;
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Zaban — offline</title>" +
      "<body style='font-family:system-ui;padding:40px;text-align:center;color:#211d16;background:#fbf7f0'>" +
      "<h1 style='font-size:20px'>You're offline</h1>" +
      "<p style='color:#655f52;font-size:14px;line-height:1.6'>Zaban hasn't finished saving itself to this device yet. " +
      "Open it once with a connection and it'll work without one after that.</p>",
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Never touch another origin. There aren't any as of v77, and if one is ever
  // added it should be a deliberate decision here rather than an accident.
  if (url.origin !== self.location.origin) return;

  // AI conversations and decoded private messages. Never cached, in any
  // circumstance — see the header.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(navigate(event));
    return;
  }

  if (url.pathname.startsWith("/audio/")) {
    event.respondWith(audioFirst(request));
    return;
  }

  // Fingerprinted by the build, so a cached copy is correct by construction.
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/fonts/")) {
    event.respondWith(cacheFirst(request, ASSETS, ASSETS_MAX_ENTRIES));
    return;
  }

  // Everything else on the origin: icons, the manifest, the logo.
  event.respondWith(
    cacheFirst(request, SHELL).catch(() =>
      caches.match(request, { ignoreVary: true }).then((r) => r || Response.error())
    )
  );
});

// ---------------------------------------------------------------------------
// Deliberate download, for someone who knows they're about to lose signal.
// The page posts a list of URLs; we fetch them with a small amount of
// concurrency and report progress back so the UI can show something true.
// ---------------------------------------------------------------------------
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") { self.skipWaiting(); return; }
  if (data.type !== "PRECACHE_AUDIO" || !Array.isArray(data.urls)) return;

  const port = event.ports && event.ports[0];
  event.waitUntil(
    (async () => {
      const urls = data.urls.slice(0, AUDIO_MAX_ENTRIES);
      const cache = await caches.open(AUDIO);
      let done = 0, failed = 0;
      const CONCURRENCY = 6;

      const worker = async () => {
        while (urls.length) {
          const url = urls.pop();
          try {
            if (await cache.match(url, { ignoreVary: true })) { done++; continue; }
            const res = await fetch(url);
            if (res.ok) await cache.put(url, res); else failed++;
          } catch {
            failed++;
          }
          done++;
          if (port && done % 10 === 0) port.postMessage({ done, failed });
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
      if (port) port.postMessage({ done, failed, finished: true });
    })()
  );
});
