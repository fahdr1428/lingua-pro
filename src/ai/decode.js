// =============================================================================
// DECODE CLIENT (v78) — same contract as the other AI clients: typed errors, a
// hard timeout, and a failure costs the learner nothing but this one decode.
//
// The timeout is longer than the coach's because this runs at medium effort on a
// block of text rather than a single conversational turn, and a breakdown that
// arrives in eight seconds and is right beats one that arrives in two and has
// the wrong dictionary forms in it.
// =============================================================================

import { CoachError } from "./coach.js";

const ENDPOINT = "/api/decode";
const TIMEOUT_MS = 60_000;

export const MAX_DECODE_CHARS = 600;

let probe = null;

/** Is decoding available on this deployment? Asked once per page load. */
export function probeDecode() {
  if (probe) return probe;
  probe = (async () => {
    try {
      const res = await fetch(ENDPOINT, { method: "GET" });
      if (!res.ok) return { configured: false };
      return await res.json();
    } catch {
      return { configured: false };
    }
  })();
  return probe;
}

export async function decodeText({ text, langName, regionPrompt = "" }) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ctl.signal,
      body: JSON.stringify({ text: String(text).slice(0, MAX_DECODE_CHARS), langName, regionPrompt }),
    });
  } catch (e) {
    clearTimeout(timer);
    if (e?.name === "AbortError") {
      throw new CoachError("timeout", "That took too long — try pasting a shorter piece.");
    }
    throw new CoachError("offline", "Couldn't reach the decoder. Check your connection.");
  }
  clearTimeout(timer);

  let data = null;
  try { data = await res.json(); } catch { /* handled below */ }

  if (!res.ok) {
    if (res.status === 501) throw new CoachError("not_configured", data?.message || "Decoding isn't set up on this deployment.");
    if (res.status === 429) throw new CoachError("rate_limited", data?.message || "Give it a moment before decoding another.");
    if (res.status === 400) throw new CoachError("bad_input", data?.message || "Paste something to decode first.");
    throw new CoachError("failed", data?.message || "Couldn't break that one down.");
  }
  if (data?.refused) throw new CoachError("refused", data.message || "Couldn't break that one down.");
  if (!Array.isArray(data?.tokens)) throw new CoachError("failed", "Couldn't break that one down.");
  return data;
}
