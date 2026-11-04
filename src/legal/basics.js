// The few legal facts the first screen needs — dates, ages, whether the
// operator placeholders are filled in. Kept apart from policies.js (the full
// texts) so the texts load with the Legal screen, not before the first word.
// policies.js re-exports everything here, so there is one source.

export const LAST_UPDATED = "2026-08-06";

/** Filled in by the operator before publishing. Rendered literally if left. */
export const OPERATOR = {
  entity: "[LEGAL ENTITY NAME]",
  contactEmail: "[CONTACT EMAIL]",
  address: "[POSTAL ADDRESS]",
  jurisdiction: "[COUNTRY / STATE OF ESTABLISHMENT]",
};

/** True when the operator hasn't filled the placeholders in yet. */
export function policiesIncomplete() {
  return Object.values(OPERATOR).some((v) => /^\[.*\]$/.test(v));
}

/** The id of the AI disclosure policy, for links that open it. */
export const AI_DISCLOSURE_ID = "ai";

// Age gating — see the note in policies.js.
export const AI_MIN_AGE = 16;
export const APP_MIN_AGE = 13;
