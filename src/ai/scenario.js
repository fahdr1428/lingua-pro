// =============================================================================
// SCENARIO CLIENT (v73) — build a mission from a sentence the learner typed.
// Same rule as the coach client: typed errors, hard timeout, and a failure here
// costs the learner nothing except the custom scenario.
// =============================================================================

import { CoachError } from "./coach.js";

const ENDPOINT = "/api/scenario";
const TIMEOUT_MS = 40_000;

export async function buildScenario({ description, langName, level = "beginner" }) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ctl.signal,
      body: JSON.stringify({ description, langName, level }),
    });
  } catch (e) {
    clearTimeout(timer);
    if (e?.name === "AbortError") throw new CoachError("timeout", "That took too long to build — try a shorter description.");
    throw new CoachError("offline", "Couldn't reach the scenario builder.");
  }
  clearTimeout(timer);

  let data = null;
  try { data = await res.json(); } catch { /* handled below */ }

  if (!res.ok) {
    if (res.status === 501) throw new CoachError("not_configured", data?.message || "Custom scenarios aren't set up on this deployment.");
    if (res.status === 429) throw new CoachError("rate_limited", data?.message || "Give it a moment before building another.");
    if (res.status === 400) throw new CoachError("bad_input", data?.message || "Describe the situation in a bit more detail.");
    throw new CoachError("failed", data?.message || "Couldn't build that one.");
  }
  if (data?.refused) throw new CoachError("refused", data.message || "Let's pick a different situation.");
  if (!data?.mission?.objectives?.length) throw new CoachError("failed", "Couldn't build that one.");
  return data.mission;
}
