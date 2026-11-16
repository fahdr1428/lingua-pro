// =============================================================================
// textShape.js (v119) — small text helpers for what Home's cards and the
// guide's speech bubble show. Plain JS so test-guides.mjs can reach them.
// =============================================================================

// v119: "Subject + Verb (note: verb comes LAST in Urdu)" → a short title and
// a note in sentence case ("Verb comes last in Urdu").
export function splitSkill(skill = "") {
  const m = String(skill).match(/^(.*?)\s*\((.+)\)\s*$/);
  if (!m || !m[1].trim()) return { head: String(skill).trim(), note: null };
  let note = m[2].replace(/^note:\s*/i, "").replace(/[!.]+$/, "").trim();
  note = note.replace(/\b([A-Z]{3,})\b/g, (w) => w.toLowerCase());
  note = note.charAt(0).toUpperCase() + note.slice(1);
  return { head: m[1].trim(), note: note || null };
}

// v119: the guide's first hello, kept to a speech bubble's length — the whole
// introduction pushed the lesson below the fold. Whole sentences only.
export function firstSentences(text = "", max = 140) {
  const parts = String(text).match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [String(text)];
  let out = "";
  for (const p of parts) {
    if (out && (out + p).trim().length > max) break;
    out += p;
  }
  return out.trim();
}
