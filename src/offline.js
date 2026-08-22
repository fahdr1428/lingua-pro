// =============================================================================
// OFFLINE (v81) — registering the service worker, and knowing where we stand.
//
// Two jobs beyond `register()`:
//
//   TELLING THE TRUTH ABOUT CONNECTIVITY. `navigator.onLine` is famously weak —
//   it reports whether there's a network interface, not whether anything is
//   reachable, so a captive portal or a dead uplink both read as "online". It's
//   used here only as a fast negative: onLine === false definitely means
//   offline, while onLine === true is treated as "probably", and the AI clients
//   still have to handle a failed request either way. The UI never claims more
//   than that.
//
//   UPDATES WITHOUT YANKING THE PAGE. A new worker takes over on the next load;
//   an app that reloads itself mid-lesson to install an update has thrown away
//   the learner's answer to be helpful. The notice waits.
// =============================================================================

import { LANGUAGES } from "./data/registry.js";

let registration = null;
const listeners = new Set();

export function onOfflineChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const emit = () => listeners.forEach((fn) => fn(isOffline()));

/** Definitely offline? Only ever a fast negative — see the header. */
export function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  // The dev server serves modules that would be cached wrongly, and a stale
  // shell in development is a bug hunt nobody needs.
  if (import.meta.env?.DEV) return;

  window.addEventListener("online", emit);
  window.addEventListener("offline", emit);

  window.addEventListener("load", async () => {
    try {
      registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    } catch {
      // No offline support on this browser or this deployment. The app works
      // exactly as it did before; there is nothing to tell the learner.
    }
  });
}

/** Is this build cached well enough to open without a connection? */
export async function isReadyOffline() {
  try {
    if (!("caches" in window)) return false;
    const keys = await caches.keys();
    return keys.some((k) => k.startsWith("zaban-shell-"));
  } catch {
    return false;
  }
}

/**
 * Every audio file this language has, as URLs the worker can fetch.
 *
 * Derived from the pack's own vocabulary rather than a directory listing, since
 * the browser can't list a directory. Words with no recording simply 404 and are
 * counted as failures, which is why the UI reports what actually landed rather
 * than what was asked for — three of the fourteen languages have no recorded
 * audio at all, and promising a download that silently does nothing would be
 * its own small lie.
 */
export function audioUrlsFor(pack) {
  const code = pack?.code;
  if (!code) return [];
  // Mirror tts.js exactly: the folder is the base of the TTS code, so "ur-PK"
  // and "ur" both live in /audio/ur. Guessing differently here would download
  // 177 files into a directory that doesn't exist and report it as a failure.
  const dir = (LANGUAGES[code]?.ttsCode || code).split("-")[0];
  return (pack.vocab || [])
    .filter((v) => v.id && !v.custom)
    .map((v) => `/audio/${dir}/${v.id}.mp3`);
}

/**
 * Ask the worker to download a language for a journey.
 *
 * @param {object} pack
 * @param {(p: {done:number, failed:number, total:number, finished?:boolean}) => void} onProgress
 * @returns {Promise<{done:number, failed:number, total:number}>}
 */
export function downloadAudio(pack, onProgress) {
  return new Promise((resolve) => {
    const urls = audioUrlsFor(pack);
    const total = urls.length;
    if (!total || !navigator.serviceWorker?.controller) {
      resolve({ done: 0, failed: 0, total });
      return;
    }
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => {
      const p = { ...e.data, total };
      onProgress?.(p);
      if (e.data.finished) resolve(p);
    };
    navigator.serviceWorker.controller.postMessage(
      { type: "PRECACHE_AUDIO", urls },
      [channel.port2]
    );
  });
}

/** How much of this language is already on the device. */
export async function audioCached(pack) {
  try {
    if (!("caches" in window)) return { cached: 0, total: 0 };
    const cache = await caches.open("zaban-audio");
    const urls = audioUrlsFor(pack);
    const keys = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
    return { cached: urls.filter((u) => keys.has(u)).length, total: urls.length };
  } catch {
    return { cached: 0, total: 0 };
  }
}
