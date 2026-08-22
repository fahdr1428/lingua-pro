// =============================================================================
// OFFLINE UI (v81)
//
// Two components, and the restraint in both is the point.
//
//   OfflineBar — shown only when the browser is CERTAIN there's no connection,
//   and it says what still works rather than what's broken. Almost everything
//   does: lessons, reviews, reading, flashcards, grammar, the alphabet course,
//   speaking drills and every bit of progress. Only the AI needs a network. A
//   banner that just says "You are offline" invites someone to close the app;
//   this one tells them there's no reason to.
//
//   DownloadLanguage — for the person who knows they're about to lose signal.
//   It reports what actually landed on the device, not what it asked for, which
//   matters because three of the fourteen languages have no recorded audio at
//   all and a progress bar sailing to 100% over 177 consecutive 404s would be a
//   lie told very convincingly.
// =============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { isOffline, onOfflineChange, downloadAudio, audioCached } from "../offline.js";

export function useOffline() {
  const [off, setOff] = useState(isOffline);
  useEffect(() => onOfflineChange(setOff), []);
  return off;
}

export function OfflineBar() {
  const off = useOffline();
  if (!off) return null;
  return (
    <div className="offline-bar" role="status">
      <span aria-hidden="true">◍</span>
      <span>
        <b>No connection.</b> Lessons, reviews, reading and your progress all
        carry on as normal — only the AI conversations need the internet.
      </span>
    </div>
  );
}

/** A short, honest line for a screen that genuinely cannot work offline. */
export function NeedsConnection({ what = "This" }) {
  return (
    <div className="result-locked">
      <b>{what} needs a connection.</b> It talks to a language model, which is the
      one part of this app that isn't on your device. Everything else — lessons,
      reviews, reading, flashcards, the alphabet course — works offline.
    </div>
  );
}

export function DownloadLanguage({ pack, langName }) {
  const [state, setState] = useState(null);   // null | {done,total,failed,finished}
  const [have, setHave] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => setHave(await audioCached(pack)), [pack]);
  useEffect(() => { refresh(); }, [refresh]);

  // No service worker means no cache to fill; saying nothing is better than
  // offering a button that quietly does nothing.
  if (typeof navigator === "undefined" || !navigator.serviceWorker?.controller) return null;
  if (have && have.total === 0) return null;

  async function go() {
    setBusy(true);
    const res = await downloadAudio(pack, setState);
    setState({ ...res, finished: true });
    setBusy(false);
    refresh();
  }

  const pct = state?.total ? Math.round((state.done / state.total) * 100) : 0;
  const landed = state?.finished ? state.done - (state.failed || 0) : null;

  return (
    <div className="dl-lang">
      <div className="dl-lang-head">
        <div>
          <b>Take {langName} on a plane</b>
          <div className="dl-lang-sub">
            {have && have.cached > 0
              ? `${have.cached} of ${have.total} recordings already saved to this device.`
              : "Save every recording to this device so it plays without a connection."}
          </div>
        </div>
      </div>

      {busy && (
        <>
          <div className="hairline-bar"><div className="hairline-fill" style={{ width: `${pct}%` }} /></div>
          <div className="dl-lang-sub" style={{ marginTop: 6 }}>{state?.done || 0} of {state?.total || 0}…</div>
        </>
      )}

      {state?.finished && !busy && (
        <div className="dl-lang-done">
          {landed > 0
            ? `${landed} recordings saved. They'll play with no connection.`
            : `${langName} has no recorded audio yet — nothing to save. The app still reads it aloud with your device's own voice, which works offline too.`}
          {state.failed > 0 && landed > 0 && (
            <span className="dl-lang-note"> {state.failed} words have no recording yet.</span>
          )}
        </div>
      )}

      {!busy && !state?.finished && (
        <button className="btn-quiet" onClick={go}>
          ⬇ Save the audio to this device
        </button>
      )}
    </div>
  );
}
