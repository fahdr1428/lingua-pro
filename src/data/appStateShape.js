// =============================================================================
// appStateShape.js (v103) — reconcile the saved state with the state this
// version of the app expects.
//
// WHY THIS EXISTS
//
// usePersistentState did this:
//
//     storage.get(key).then((v) => { if (v != null) setValueRaw(v); })
//
// — it REPLACES the defaults with whatever is in localStorage, rather than
// merging onto them. Two consequences, both reachable by ordinary users:
//
//   1. Someone who last opened Zaban several versions ago has a saved object
//      with none of the keys added since. `scriptCourse`, `passagesRead`,
//      `disabledExercises`, `consent`, `voice` and the rest come back
//      undefined instead of {} / [] / null. Most call sites guard with
//      `|| {}`, but "most" is the problem: it only takes one that doesn't.
//
//   2. A value of the WRONG TYPE takes the whole screen down. This was found
//      by accident, with `chaptersPassed: { ar: true }` in a test seed:
//      chapters.js does `appState?.chaptersPassed?.[langCode] || []` and then
//      `.includes(n)`, `true.includes` throws, and the route map sat on
//      "Loading…" forever — inside a lazy boundary, so the error screen never
//      appeared and there was no way back other than clearing site data.
//
// localStorage is not a trusted input. It is shared across every version of
// the app that has ever run on that device, it survives reinstalls, and it can
// be edited by hand. The app should meet whatever it finds and keep going.
//
// WHAT THIS DOES NOT DO: it does not delete keys it doesn't recognise. A value
// written by a NEWER version than the one running — a learner with two tabs
// open across a deploy — is carried through untouched. Dropping it would mean
// this version silently deleting the other one's progress.
// =============================================================================

/** The kind of a value, at the granularity this reconciliation cares about. */
function kindOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

/**
 * Merge a saved state onto the defaults, keeping a saved value only when it is
 * the same kind of thing the default is.
 *
 * @param {*} saved     whatever came back from storage — any shape, or none
 * @param {Object} defaults  DEFAULT_APP_STATE
 * @returns {{ state: Object, repaired: string[] }}
 *   `repaired` names every key that was missing or the wrong type. It is
 *   returned rather than logged so callers can decide — the app reports it
 *   once to the console, and the tests assert on it.
 */
export function normalizeAppState(saved, defaults) {
  const repaired = [];
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    // Not an object at all. Nothing to reconcile; start clean rather than
    // handing every screen a string to destructure.
    return { state: { ...defaults }, repaired: saved === null || saved === undefined ? [] : ["<whole state>"] };
  }

  const out = { ...defaults };

  // Keys this version knows about: take the saved value when its kind matches.
  for (const key of Object.keys(defaults)) {
    const want = defaults[key];
    const got = saved[key];

    if (got === undefined) {
      repaired.push(key);          // older save, key not written yet
      continue;                    // out[key] is already the default
    }

    // `null` is a legitimate value for the keys whose default is null
    // (voice, consent, aiConsent, currentLanguage, lastStudyDate) and is also
    // what several of them mean by "not set", so it is always allowed through.
    if (got === null) { out[key] = null; continue; }

    if (want === null) { out[key] = got; continue; }   // default tells us nothing

    if (kindOf(got) !== kindOf(want)) {
      repaired.push(key);          // wrong type — this is the one that crashes
      continue;
    }

    out[key] = got;
  }

  // Keys from a newer version of the app: keep them exactly as they are.
  for (const key of Object.keys(saved)) {
    if (!(key in defaults)) out[key] = saved[key];
  }

  return { state: out, repaired };
}

/**
 * The per-language shapes that live INSIDE those top-level objects. A saved
 * `chaptersPassed` can be a perfectly good object whose one value is `true`,
 * which passes the check above and still crashes chapters.js. Anything that is
 * read as a list per language gets its values checked too.
 */
const LIST_PER_LANGUAGE = ["chaptersPassed", "grammarSeen", "testedOut", "passagesRead"];

export function normalizeLanguageLists(state, repaired = []) {
  for (const key of LIST_PER_LANGUAGE) {
    const map = state[key];
    if (!map || typeof map !== "object" || Array.isArray(map)) continue;

    // Rebuilt rather than edited in place. normalizeAppState hands through the
    // saved object itself when its type is right, so deleting a key here would
    // reach into the caller's object — which is harmless in the app, where it
    // is a throwaway JSON.parse result, and exactly the kind of thing that
    // stops being harmless later.
    const kept = {};
    let changed = false;
    for (const code of Object.keys(map)) {
      if (Array.isArray(map[code])) kept[code] = map[code];
      else { repaired.push(`${key}.${code}`); changed = true; }
    }
    if (changed) state[key] = kept;
  }
  return repaired;
}

/**
 * v103 — shout, in development, the moment a write changes the TYPE of a field.
 *
 * normalizeAppState repairs a damaged save at load, which means the app now
 * survives a writer that disagrees with the rest of the code about what a field
 * is. Surviving it is not the same as knowing about it: the bug that motivated
 * all of this — Reading.jsx writing `passagesRead: (s.passagesRead || 0) + 1`
 * over a `{ langCode: [ids] }` map — would now be quietly mopped up at the next
 * reload and never noticed again. Self-healing that hides the wound is worse
 * than the wound.
 *
 * So the write itself is where it gets caught. This fires the first time anyone
 * reads a passage in `npm run dev`:
 *
 *   [state] app.passagesRead changed type: object → string ("[object Object]1").
 *   The default for this field is an object. Whoever wrote this disagrees with
 *   the rest of the app about what the field is.
 *
 * DEV only, and deliberately: it is a message to whoever is writing the code,
 * not to the learner, and the reconciliation already handles it in production.
 *
 * @returns {string[]} the warnings, so a test can assert on them
 */
export function warnOnShapeChange(key, initial, prev, next, warn = console.warn) {
  const out = [];
  if (!initial || typeof initial !== "object" || Array.isArray(initial)) return out;
  if (!next || typeof next !== "object" || Array.isArray(next)) return out;
  for (const field of Object.keys(initial)) {
    const want = kindOf(initial[field]);
    if (want === "null") continue;                       // the default tells us nothing
    if (!(field in next)) continue;
    const got = kindOf(next[field]);
    if (got === "null" || got === want) continue;
    // Already the wrong type before this write — report the write that broke
    // it, not every write afterwards.
    if (prev && typeof prev === "object" && kindOf(prev[field]) === got) continue;
    let shown;
    try { shown = JSON.stringify(next[field]); } catch { shown = String(next[field]); }
    const msg =
      `[state] ${key}.${field} changed type: ${want} → ${got} (${String(shown).slice(0, 40)}). ` +
      `The default for this field is ${want === "array" ? "an array" : `a ${want}`}. ` +
      `Whoever wrote this disagrees with the rest of the app about what the field is.`;
    out.push(msg);
    warn(msg);
  }
  return out;
}
