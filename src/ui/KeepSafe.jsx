// =============================================================================
// KEEP IT SAFE (v118) — progress lives in this browser, so protect it.
//
// Two things a browser will do to a site's saved data without asking:
//   · any browser may clear it when the device runs short of space, unless
//     the site has been granted "persistent" storage;
//   · Safari on iPhone and iPad deletes a site's script-written data after
//     seven days of Safari use without a visit to that site — unless the site
//     has been added to the Home Screen, which is exempt.
//
// So: ask for persistent storage once the learner has something worth keeping
// (a lesson done — and from a tap, since some browsers only grant it then),
// and on iPhone/iPad in Safari, say once, plainly, how to make it stick. No
// accounts and no server are needed for either.
// =============================================================================

import React from "react";

let asked = false;

/** Ask the browser to keep this site's data. Safe to call often; asks once per page load. */
export function requestPersistence() {
  if (asked) return;
  asked = true;
  try {
    const s = typeof navigator !== "undefined" ? navigator.storage : null;
    if (!s?.persist) return;
    s.persisted?.().then((already) => { if (!already) s.persist().catch(() => {}); }).catch(() => {});
  } catch {
    // Not available (private browsing, old browser): nothing to do.
  }
}

/** iPhone/iPad Safari, opened as a web page rather than from the Home Screen. */
export function needsHomeScreen(nav = typeof navigator !== "undefined" ? navigator : null, win = typeof window !== "undefined" ? window : null) {
  if (!nav || !win) return false;
  const ua = nav.userAgent || "";
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (nav.maxTouchPoints || 0) > 1);
  if (!ios) return false;
  const standalone = nav.standalone === true || !!win.matchMedia?.("(display-mode: standalone)")?.matches;
  return !standalone;
}

/** One dismissible note on Home, once there is progress to lose. */
export function KeepSafeNote({ appState, setAppState, code }) {
  const lessons = appState?.lessonsCompleted?.[code] || 0;
  if (!lessons || appState?.keepSafeDismissed || !needsHomeScreen()) return null;
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  const device = /iPhone|iPod/.test(ua) ? "iPhone" : "iPad";
  return (
    <div className="keep-safe" role="note" data-testid="keep-safe">
      <div style={{ minWidth: 0 }}>
        <div className="keep-safe-title">Keep your progress on this {device}</div>
        <div className="keep-safe-text">
          Your progress is saved in this browser, and on an {device} a website's saved data can be deleted after seven
          days of browsing without a visit to it. Added to your Home Screen, Zaban is kept: in Safari, tap Share, then
          “Add to Home Screen”.
        </div>
      </div>
      <button type="button" className="keep-safe-ok" onClick={() => setAppState((s) => ({ ...s, keepSafeDismissed: true }))}>
        OK
      </button>
    </div>
  );
}
