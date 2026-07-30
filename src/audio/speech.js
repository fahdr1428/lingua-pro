// =============================================================================
// SPEECH (v70) — listening to the learner, and judging them kindly.
//
// Two halves:
//
//   1. RECOGNITION — a thin wrapper over the browser's SpeechRecognition. This
//      runs on-device: no API key, no per-request cost, no network latency, and
//      nothing about the learner's voice leaves their machine. Support is real
//      but uneven (Chrome and Safari yes, Firefox no), so every caller must
//      handle `isRecognitionSupported() === false` by falling back to typing.
//
//   2. JUDGEMENT — scoreAttempt(). Deliberately lenient, because the failure
//      mode that kills a speaking feature is telling someone with a perfectly
//      comprehensible accent that they got it wrong. We are grading "would a
//      patient native speaker have understood you", not "did you match a
//      string".
//
// WHY LENIENT, CONCRETELY:
//   - Recognisers mangle non-native pronunciation, and for languages with no
//     dedicated recogniser we deliberately listen in a fallback locale, so the
//     transcript arrives in the wrong script entirely.
//   - Transliteration has no single standard. assalam-o-alaikum,
//     as-salamu alaykum and salam alaykum are the same utterance.
//   - So we score against EVERY acceptable form (native script, transliteration,
//     hand-written variants), take the best, and blend a token-overlap score
//     with a character-similarity score so that dropping one small word or
//     fluffing one syllable doesn't fail the whole attempt.
//
// SEAM FOR A MODEL-BACKED GRADER: judge() is the single entry point the UI
// calls. Swapping the local scorer for a hosted model later means replacing the
// body of judge() and nothing else — every caller already awaits it.
// =============================================================================

// ---------------------------------------------------------------------------
// Recognition support
// ---------------------------------------------------------------------------

function RecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isRecognitionSupported() {
  return !!RecognitionCtor();
}

// Locales the browser is most likely to have a recogniser for. When a language
// has no recogniser at all, listening in a nearby locale still produces a
// usable transcript because we score against transliteration as well.
const RECOGNITION_FALLBACK = {
  ur: "hi-IN",   // no widely-shipped Urdu recogniser; Hindi is phonetically close
  pa: "hi-IN",
  pcm: "en-NG",
  bn: "bn-IN",
};

export function recognitionLocale(langCode, ttsCode) {
  return RECOGNITION_FALLBACK[langCode] || ttsCode || "en-US";
}

/**
 * Start listening. Returns a handle with .stop() and .abort().
 *
 * onResult receives { transcripts, isFinal } where `transcripts` is every
 * alternative the recogniser offered, best-first. Passing all of them to the
 * scorer materially improves fairness — the recogniser's second guess is often
 * the closer one for a non-native speaker.
 */
export function startListening({
  langCode,
  ttsCode,
  onResult,
  onError,
  onEnd,
  maxAlternatives = 5,
  interim = true,
} = {}) {
  const Ctor = RecognitionCtor();
  if (!Ctor) {
    onError?.({ code: "unsupported", message: "Speech recognition isn't available in this browser." });
    return null;
  }

  let rec;
  try {
    rec = new Ctor();
  } catch (e) {
    onError?.({ code: "init_failed", message: String(e?.message || e) });
    return null;
  }

  rec.lang = recognitionLocale(langCode, ttsCode);
  rec.continuous = false;
  rec.interimResults = interim;
  rec.maxAlternatives = maxAlternatives;

  let stopped = false;

  rec.onresult = (event) => {
    const result = event.results?.[event.results.length - 1];
    if (!result) return;
    const transcripts = [];
    for (let i = 0; i < result.length; i++) {
      const t = result[i]?.transcript;
      if (t) transcripts.push(t);
    }
    if (transcripts.length) onResult?.({ transcripts, isFinal: !!result.isFinal });
  };

  rec.onerror = (event) => {
    // "no-speech" and "aborted" are ordinary user behaviour, not faults —
    // callers get them tagged so they can stay quiet about them.
    const code = event?.error || "unknown";
    onError?.({
      code,
      benign: code === "no-speech" || code === "aborted",
      message: MIC_ERRORS[code] || "Something went wrong with the microphone.",
    });
  };

  rec.onend = () => { if (!stopped) onEnd?.(); };

  try {
    rec.start();
  } catch (e) {
    onError?.({ code: "start_failed", message: String(e?.message || e) });
    return null;
  }

  return {
    stop() { stopped = true; try { rec.stop(); } catch {} },
    abort() { stopped = true; try { rec.abort(); } catch {} },
  };
}

const MIC_ERRORS = {
  "not-allowed": "Microphone access was blocked. You can allow it in your browser's site settings.",
  "service-not-allowed": "Your browser blocked speech recognition for this page.",
  "no-speech": "I didn't catch anything — try again a bit louder.",
  "audio-capture": "No microphone found.",
  network: "Speech recognition needs a connection and couldn't reach it.",
  aborted: "Listening stopped.",
};

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

// Words a recogniser commonly inserts, or that learners add while thinking.
// Stripped before scoring so "um, salam" scores as "salam".
const FILLER = new Set([
  "um", "uh", "er", "erm", "ah", "oh", "hmm", "mm", "like", "so", "well", "okay", "ok",
  "yeah", "yep", "yes", "right", "just", "maybe", "i", "think", "its",
]);

// Arabic-script diacritics + Devanagari/Bengali/Gurmukhi vowel marks. Removed so
// that writing a word with or without vowel points compares equal.
const COMBINING = new RegExp(
  "[" +
  "\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED" + // Arabic/Urdu harakat
  "\\u0900-\\u0903\\u093A-\\u094F\\u0951-\\u0957" +        // Devanagari
  "\\u0981-\\u0983\\u09BC-\\u09CD" +                        // Bengali
  "\\u0A01-\\u0A03\\u0A3C-\\u0A4D" +                        // Gurmukhi
  "]",
  "g"
);

/**
 * Aggressive, script-aware normalisation. Everything here exists because it
 * caused a false negative at some point:
 *   - NFD + strip marks: café == cafe, é == e
 *   - Arabic letter folding: أ إ آ ا all become ا; ی ي both become ي
 *   - punctuation and the Arabic/Urdu comma & question mark
 *   - hyphens to spaces: assalam-o-alaikum == assalam o alaikum
 */
export function normalise(input) {
  if (!input) return "";
  let s = String(input).trim().toLowerCase();

  s = s.normalize("NFD").replace(/[\u0300-\u036F]/g, "");
  s = s.replace(COMBINING, "");

  // Arabic-script letter folding
  s = s
    .replace(/[أإآٱ]/g, "ا") // hamza forms → alef
    .replace(/ى/g, "ي")                     // alef maksura → yeh
    .replace(/ی/g, "ي")                     // farsi yeh → yeh
    .replace(/ک/g, "ك")                     // keheh → kaf
    .replace(/ة/g, "ه")                     // teh marbuta → heh
    .replace(/ە/g, "ه")
    .replace(/ـ/g, "");                          // tatweel (stretching)

  // Punctuation → space (keeps word boundaries), including Arabic punctuation
  s = s.replace(/[.,!?;:"'`´’‘“”()[\]{}…،؛؟۔、。，！？—–_/\\|]/g, " ");
  s = s.replace(/-/g, " ");

  return s.replace(/\s+/g, " ").trim();
}

export function tokens(input) {
  const n = normalise(input);
  if (!n) return [];
  // CJK has no spaces — fall back to per-character tokens so overlap scoring
  // still has something meaningful to compare.
  if (!n.includes(" ") && /[\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(n)) {
    return Array.from(n).filter((c) => c.trim());
  }
  return n.split(" ").filter((t) => t && !FILLER.has(t));
}

// ---------------------------------------------------------------------------
// Similarity
// ---------------------------------------------------------------------------

/** Levenshtein distance, two-row variant (O(min) memory). */
export function editDistance(a = "", b = "") {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = new Array(b.length + 1);
  let cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[b.length];
}

/** 0–1 character similarity, whitespace ignored. */
function charSimilarity(a, b) {
  const x = normalise(a).replace(/\s/g, "");
  const y = normalise(b).replace(/\s/g, "");
  if (!x && !y) return 1;
  if (!x || !y) return 0;
  const d = editDistance(x, y);
  return Math.max(0, 1 - d / Math.max(x.length, y.length));
}

/**
 * Token F1, with per-token fuzzy matching. A heard token counts as matching a
 * target token when it's within a small edit distance of it, so one slipped
 * syllable doesn't cost the whole word.
 */
function tokenSimilarity(heard, target) {
  const h = tokens(heard);
  const t = tokens(target);
  if (!h.length && !t.length) return 1;
  if (!h.length || !t.length) return 0;

  const remaining = [...h];
  let matched = 0;
  for (const want of t) {
    const tolerance = want.length <= 3 ? 0 : want.length <= 5 ? 1 : 2;
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = editDistance(want, remaining[i]);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    if (bestIdx >= 0 && bestDist <= tolerance) {
      matched++;
      remaining.splice(bestIdx, 1);
    }
  }
  const precision = matched / h.length;
  const recall = matched / t.length;
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export const BAND = { GOT: "got", CLOSE: "close", MISS: "miss" };

// Tuned to err toward encouragement. A learner scoring 0.72 has said something
// a native would understand, and telling them "not yet" at that level is how
// people quit.
const GOT_AT = 0.7;
const CLOSE_AT = 0.42;

/**
 * Score one attempt against every acceptable form of the target.
 *
 * @param {string|string[]} heard    transcript(s) from the recogniser, or typed text
 * @param {object} target
 * @param {string} target.native     the native-script form
 * @param {string} target.translit   the romanisation
 * @param {string[]} [target.accept] extra acceptable forms (shortened answers, variants)
 * @returns {{score:number, band:string, matchedForm:string, heard:string,
 *            missing:string[], extra:string[]}}
 */
export function scoreAttempt(heard, target = {}) {
  const candidates = Array.isArray(heard) ? heard.filter(Boolean) : [heard].filter(Boolean);
  const forms = [target.native, target.translit, ...(target.accept || [])]
    .filter(Boolean)
    .map(String);

  if (!candidates.length || !forms.length) {
    return { score: 0, band: BAND.MISS, matchedForm: forms[0] || "", heard: "", missing: [], extra: [] };
  }

  let best = { score: -1, band: BAND.MISS, matchedForm: forms[0], heard: candidates[0] };

  for (const candidate of candidates) {
    for (const form of forms) {
      // Blend, weighted toward token overlap: saying all the right words in a
      // slightly wrong order or accent should pass, whereas a fluent-sounding
      // string of the wrong words should not.
      const tok = tokenSimilarity(candidate, form);
      const chr = charSimilarity(candidate, form);
      let score = 0.62 * tok + 0.38 * chr;

      // Speech has no spaces in it. Where the recogniser split words differently
      // from our transliteration ("bon jour" for bonjour, "as salamu alaykum"
      // for assalam-o-alaikum) the token score collapses while the character
      // score stays high and is the more truthful signal — so take whichever
      // piece of evidence is stronger rather than averaging the good one away.
      score = Math.max(score, chr);

      // Containment bonus: the learner said the target plus extra words
      // ("umm, salam alaikum yeah"). That's a pass, not a partial.
      const cn = normalise(candidate);
      const fn = normalise(form);
      if (fn && cn.includes(fn)) score = Math.max(score, 0.92);
      if (cn && fn.includes(cn) && cn.length >= Math.max(3, fn.length * 0.6)) {
        score = Math.max(score, 0.72);
      }
      if (cn && fn && cn === fn) score = 1;

      if (score > best.score) {
        best = { score, matchedForm: form, heard: candidate };
      }
    }
  }

  // Which target words didn't land — used for specific, actionable feedback
  // instead of a bare "try again".
  const targetTokens = tokens(best.matchedForm);
  const heardTokens = tokens(best.heard);
  const leftover = [...heardTokens];
  const missing = [];
  for (const want of targetTokens) {
    const tolerance = want.length <= 3 ? 0 : want.length <= 5 ? 1 : 2;
    let idx = -1, bestDist = Infinity;
    for (let i = 0; i < leftover.length; i++) {
      const d = editDistance(want, leftover[i]);
      if (d < bestDist) { bestDist = d; idx = i; }
    }
    if (idx >= 0 && bestDist <= tolerance) leftover.splice(idx, 1);
    else missing.push(want);
  }

  // A token can look "missing" purely because the recogniser split words
  // differently from our transliteration — "bon jour" for bonjour, "as salamu"
  // for assalam. Speech has no spaces, so before calling anything absent we
  // check it against the space-stripped transcript. This keeps the cap below
  // honest and stops feedback naming words the learner clearly did say.
  const heardFlat = normalise(best.heard).replace(/\s/g, "");
  const trulyMissing = missing.filter((w) => !flatContains(heardFlat, w));

  // Leniency has a floor: leaving out a whole content word is "close", never
  // "got it". Judged by character mass rather than word count, so dropping a
  // one-letter connector ("o" in assalam-o-alaikum) is forgiven while dropping
  // "shukriya" from "main theek hoon, shukriya" is not. Without this, the
  // character-similarity path above would wave through half an answer.
  let score = Math.max(0, Math.min(1, best.score));
  const targetMass = targetTokens.join("").length;
  const missingMass = trulyMissing.join("").length;
  if (targetMass > 0 && missingMass / targetMass >= 0.2) {
    score = Math.min(score, GOT_AT - 0.01);
  }

  return {
    score,
    band: bandFor(score),
    matchedForm: best.matchedForm,
    heard: best.heard,
    missing: trulyMissing,
    extra: leftover,
  };
}

/**
 * Is `needle` present inside the space-stripped `hay`, allowing one slip for
 * longer words? Substring first (cheap, catches most cases), then a sliding
 * window with edit distance for the near-misses.
 */
function flatContains(hay, needle) {
  if (!hay || !needle) return false;
  if (hay.includes(needle)) return true;
  if (needle.length < 4) return false;
  const tolerance = needle.length <= 6 ? 1 : 2;
  for (let i = 0; i <= hay.length - needle.length + tolerance; i++) {
    for (let len = needle.length - tolerance; len <= needle.length + tolerance; len++) {
      if (len <= 0 || i + len > hay.length) continue;
      if (editDistance(needle, hay.slice(i, i + len)) <= tolerance) return true;
    }
  }
  return false;
}

function bandFor(score) {
  if (score >= GOT_AT) return BAND.GOT;
  if (score >= CLOSE_AT) return BAND.CLOSE;
  return BAND.MISS;
}

/**
 * The seam. Everything in the UI calls this and awaits it, so a hosted grader
 * can be dropped in here later without touching a single screen.
 */
export async function judge(heard, target, opts = {}) {
  const result = scoreAttempt(heard, target);
  return { ...result, feedback: feedbackFor(result, target, opts) };
}

/**
 * Turn a score into a sentence worth reading. Specific beats generic: naming
 * the word that went missing is actionable, "not quite" is not.
 */
export function feedbackFor(result, target = {}, { guideName } = {}) {
  const who = guideName ? `${guideName} heard` : "I heard";

  if (result.band === BAND.GOT) {
    if (result.score >= 0.97) return "That's it — clean.";
    if (result.extra.length) return "Understood you fine. You added a little extra, which is normal in real speech.";
    return "Understood. That would land with a native speaker.";
  }

  if (result.band === BAND.CLOSE) {
    if (result.missing.length === 1) {
      return `Close — the part that went missing was “${result.missing[0]}”. Say it again with that in.`;
    }
    if (result.missing.length > 1) {
      return `Close. ${who} most of it, but “${result.missing.slice(0, 2).join("” and “")}” didn't come through.`;
    }
    return "Close — the words were right, the shape was a little off. One more go.";
  }

  if (!result.heard) return "Nothing came through. Check your mic and try again.";
  return `${who} “${result.heard}”. Have another listen and match the rhythm — this one takes a couple of tries.`;
}

/** Percentage for display. Never shows 0% for a genuine attempt — demoralising. */
export function displayScore(result) {
  if (!result || !result.heard) return 0;
  return Math.max(5, Math.round(result.score * 100));
}
