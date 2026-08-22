// =============================================================================
// build-sw.mjs (v81) — give the service worker the build's own filenames.
//
// THE BUG THIS FIXES, which is a real-user bug and not a test artefact.
//
// A service worker does not control the page that registers it. On someone's
// very first visit the HTML, the JS bundle and the stylesheet are all fetched
// BEFORE the worker exists, so they never pass through it and never land in the
// cache. The worker installs, precaches the handful of static URLs it knows
// about — the manifest, the icons — and reports itself ready. Then the person
// goes into a tunnel, the app tries to load, and the cached HTML asks for a
// bundle that was never cached. Blank screen.
//
// It looked fine in the first test run purely by luck: an extra reload happened
// to land while the worker was controlling. Everything after that failed, which
// is the honest result.
//
// The fix is to precache the app's own entry files by name — but their names are
// content hashes that only exist after the build. So this runs after `vite
// build`, reads what was actually produced, and writes the list into the worker.
// That is all Workbox's injectManifest does, and it is about thirty lines.
//
// Run automatically as part of `npm run build`.
// =============================================================================

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const DIST = "dist";
const SW = `${DIST}/sw.js`;

if (!existsSync(SW)) {
  console.error("  build-sw: dist/sw.js is missing — did vite build run?");
  process.exit(1);
}

const html = readFileSync(`${DIST}/index.html`, "utf8");

// The entry files the HTML asks for on load. Anything else — the lazily-imported
// screens, the fourteen language packs, the audio — arrives through cache-on-use,
// because precaching all of it would mean a multi-megabyte download before the
// first lesson for languages the learner will never open.
const entry = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);

// The two faces preloaded in index.html: without them a first offline paint
// falls back to a system font mid-word, which looks broken rather than plain.
const fonts = [...html.matchAll(/href="(\/fonts\/[^"]+\.woff2)"/g)].map((m) => m[1]);

const precache = [...new Set([...entry, ...fonts])];

if (!precache.length) {
  console.error("  build-sw: found no entry assets in dist/index.html — refusing to ship a worker that precaches nothing");
  process.exit(1);
}

const sw = readFileSync(SW, "utf8");
const marker = "const BUILD_ASSETS = [];";
if (!sw.includes(marker)) {
  console.error(`  build-sw: could not find "${marker}" in public/sw.js`);
  process.exit(1);
}

writeFileSync(
  SW,
  sw.replace(
    marker,
    "const BUILD_ASSETS = [\n" + precache.map((u) => `  ${JSON.stringify(u)},`).join("\n") + "\n];"
  )
);

const total = readdirSync(`${DIST}/assets`).length;
console.log(`  build-sw: ${precache.length} entry files precached (${total} in dist/assets; the rest load on use)`);
