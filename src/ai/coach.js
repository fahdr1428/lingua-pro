// =============================================================================
// COACH CLIENT (v71) — talks to /api/coach, and copes when it isn't there.
//
// The whole design rule here is: the AI coach is an ENHANCEMENT, never a
// dependency. The app has to work identically on a deployment with no API key,
// offline, or when Anthropic is having a bad afternoon. So:
//
//   - `probeCoach()` asks once whether the endpoint is configured, caches the
//     answer, and the Coach tab simply doesn't appear if it isn't.
//   - Every failure resolves to a typed CoachError rather than throwing an
//     opaque network error, so the UI can say something true about what
//     happened and offer the scripted partner instead.
//   - A hard timeout, because a conversation partner that hangs is worse than
//     one that admits defeat.
// =============================================================================

const ENDPOINT = "/api/coach";
const TIMEOUT_MS = 30_000;

export class CoachError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CoachError";
    this.code = code;
  }
}

let probe = null; // cached promise: { configured, model }

/**
 * Is the AI coach available on this deployment? Asked once per page load.
 * Resolves { configured: false } on any failure — a probe that can't complete
 * means the feature can't be offered, which is the same outcome as unconfigured.
 */
export function probeCoach() {
  if (probe) return probe;
  probe = (async () => {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 6000);
      const res = await fetch(ENDPOINT, { method: "GET", signal: ctl.signal });
      clearTimeout(t);
      if (!res.ok) return { configured: false };
      const data = await res.json();
      return { configured: !!data.configured, model: data.model || null };
    } catch {
      return { configured: false };
    }
  })();
  return probe;
}

/** Forget the cached probe — used after a config change in dev. */
export function resetCoachProbe() {
  probe = null;
}

/**
 * Ask the guide for their next conversational turn.
 *
 * @param {object} args
 * @param {string} args.langName    e.g. "Urdu"
 * @param {object} args.guide       { name, city, craft }
 * @param {string} args.level       "beginner" | "early intermediate" | "intermediate"
 * @param {Array}  args.history     [{ role: "learner"|"guide", text }]
 * @param {string} args.learnerText what they just said (or "" with opening:true)
 * @param {boolean} args.opening    true for the first turn, before they've spoken
 * @param {string} args.scenario    optional situation to play out
 * @returns {Promise<{reply:{native,translit,en}, verdict, coaching, suggestion, refused?:boolean}>}
 */
export async function coachTurn({
  langName, guide, level = "beginner", history = [], learnerText = "",
  opening = false, scenario = "",
}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ctl.signal,
      body: JSON.stringify({
        langName, guide, level, scenario, opening, learnerText,
        // Trim client-side too so a long session doesn't grow the request
        // without bound; the server caps this again regardless.
        history: history.slice(-12).map((h) => ({ role: h.role, text: h.text })),
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    if (e?.name === "AbortError") {
      throw new CoachError("timeout", "The coach took too long to answer.");
    }
    throw new CoachError("offline", "Couldn't reach the coach — check your connection.");
  }
  clearTimeout(timer);

  let data = null;
  try { data = await res.json(); } catch { /* handled below */ }

  if (!res.ok) {
    if (res.status === 501) throw new CoachError("not_configured", data?.message || "The AI coach isn't set up on this deployment.");
    if (res.status === 429) throw new CoachError("rate_limited", data?.message || "Too many turns too quickly — give it a moment.");
    if (res.status === 503) throw new CoachError("upstream", data?.message || "The coach is briefly unavailable.");
    throw new CoachError("failed", data?.message || "The coach couldn't answer that one.");
  }
  if (!data) throw new CoachError("failed", "The coach sent something unreadable.");
  if (data.refused) return { refused: true, coaching: data.message || "Let's keep to the conversation.", reply: null };
  if (!data.reply?.native) throw new CoachError("failed", "The coach sent an empty reply.");

  return data;
}

/**
 * Map lessons completed onto the level label the prompt uses. Deliberately
 * conservative — being taught above your level is what makes people quit, and
 * the cost of being pitched slightly low is close to zero.
 */
export function levelFor(lessonsCompleted = 0, learnedWords = 0) {
  if (lessonsCompleted >= 20 && learnedWords >= 120) return "intermediate";
  if (lessonsCompleted >= 8 && learnedWords >= 50) return "early intermediate";
  return "beginner";
}
