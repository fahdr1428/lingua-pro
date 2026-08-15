// =============================================================================
// DIALECTS (v76) — the word the course teaches vs. the word people say.
//
// THE PROBLEM. Courses teach Modern Standard Arabic because it's the written
// standard and it's consistent. Then the learner lands in Cairo, asks "ماذا؟"
// and gets a blank look, because everyone there says "إيه؟". They conclude the
// app taught them nothing useful. They're not wrong.
//
// WHAT THIS LAYER DOES. Vocabulary entries can carry a `dialects` map keyed by
// the region ids in personas.js:
//
//   "dialects": {
//     "ar-EG":   { "lemma": "إيه",  "translit": "eh"   },
//     "ar-LV":   { "lemma": "شو",   "translit": "shu"  },
//     "ar-GULF": { "lemma": "شنو",  "translit": "shnu" }
//   }
//
// When the learner has chosen a variety, the app shows the spoken form next to
// the standard one, ACCEPTS it as a correct spoken answer, and can drill it
// directly. When they haven't chosen, nothing changes.
//
// THE ONE RULE: a dialect entry exists only where the word GENUINELY differs.
// Padding every noun with four identical forms would teach that dialects vary
// everywhere, which is false — the useful signal is exactly which words change,
// and there are fewer of them than learners fear.
// =============================================================================

import { getRegion, regionsFor } from "./personas.js";

/** The spoken form for this word in this variety, or null if it doesn't differ. */
export function dialectForm(item, regionId) {
  if (!item || !regionId) return null;
  const d = item.dialects?.[regionId];
  if (!d || !d.lemma) return null;
  // A "dialect form" identical to the standard one is not a dialect form.
  if (d.lemma === item.lemma) return null;
  return d;
}

/** Does this language have any dialect data at all? */
export function hasDialectData(vocab) {
  return (vocab || []).some((v) => v.dialects && Object.keys(v.dialects).length > 0);
}

/** Words that differ in this variety — the set worth drilling. */
export function dialectWords(vocab, regionId) {
  if (!regionId) return [];
  return (vocab || [])
    .map((v) => ({ item: v, form: dialectForm(v, regionId) }))
    .filter((x) => x.form);
}

/**
 * Everything a grader should accept for this word. The learner who answers in
 * their chosen dialect is RIGHT, and marking them wrong for it is the single
 * fastest way to make the dialect setting feel like a lie.
 */
export function acceptedForms(item, regionId) {
  const forms = [item?.lemma, item?.translit].filter(Boolean);
  const d = dialectForm(item, regionId);
  if (d) {
    forms.push(d.lemma);
    if (d.translit) forms.push(d.translit);
  }
  return [...new Set(forms)];
}

/** How many of this language's words change in each variety — for the picker. */
export function dialectCoverage(langCode, vocab) {
  return regionsFor(langCode).map((r) => ({
    ...r,
    changes: dialectWords(vocab, r.id).length,
  }));
}

/** Short label for a variety, for UI that has no room for the full name. */
export function regionLabel(langCode, regionId) {
  return getRegion(langCode, regionId)?.name || null;
}
