// =============================================================================
// VOICES (v74) — which voice talks to you, and how it sounds.
//
// THE COMPLAINT THIS FIXES: "the AI agent is so rough and scary". It was, and
// it was our fault. The old picker preferred `localService` voices for latency,
// and on a lot of machines the local English voice is an old formant
// synthesiser — eSpeak, Pico, "compact" — which is exactly the flat robotic
// growl people mean when they say a computer voice is unsettling. Chrome ships
// far more natural network voices alongside it, and we were actively skipping
// them to save a few hundred milliseconds.
//
// So the ranking is inverted: NATURALNESS FIRST, locality only as a tiebreak
// between voices of equal quality.
//
// And because no ranking is right for everyone — voices are a matter of taste,
// and being spoken to in a voice you dislike for twenty minutes a day is a real
// reason to stop using an app — the learner can choose. This module holds the
// preference and both speech paths (coach English and target language) read it.
// =============================================================================

let cache = [];
let loaded = false;

function load() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  cache = window.speechSynthesis.getVoices() || [];
  loaded = cache.length > 0;
  if (!loaded) {
    // Voices arrive asynchronously on first load in every browser.
    window.speechSynthesis.onvoiceschanged = () => {
      cache = window.speechSynthesis.getVoices() || [];
      loaded = cache.length > 0;
      for (const fn of listeners) fn();
    };
  }
}
if (typeof window !== "undefined") load();

const listeners = new Set();
/** Subscribe to the voice list becoming available. Returns an unsubscribe fn. */
export function onVoicesReady(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function voicesLoaded() {
  return loaded;
}

export function allVoices() {
  if (!cache.length) load();
  return cache;
}

// Name fragments that reliably indicate a modern concatenative/neural voice…
const NATURAL = [/natural/i, /neural/i, /online/i, /\bgoogle\b/i, /siri/i, /premium/i, /enhanced/i, /multilingual/i];
// …and ones that reliably indicate the old formant synthesisers people find
// unpleasant. These are the "scary" voices.
const ROBOTIC = [/espeak/i, /compact/i, /\bpico\b/i, /festival/i, /flite/i, /eloquence/i];

/** Higher is better. Used to order the picker and to choose a default. */
export function voiceQuality(v) {
  const name = `${v?.name || ""} ${v?.voiceURI || ""}`;
  let q = 0;
  if (NATURAL.some((re) => re.test(name))) q += 4;
  if (ROBOTIC.some((re) => re.test(name))) q -= 5;
  // Only a tiebreak now — a local robot is still a robot.
  if (v?.localService) q += 1;
  if (v?.default) q += 0.5;
  return q;
}

/**
 * Voices that can speak `tag`, best first. Exact locale matches outrank
 * same-language ones, and within each group the more natural voice wins.
 */
export function voicesFor(tag) {
  const want = String(tag || "").toLowerCase();
  const base = want.split("-")[0];
  if (!base) return [];
  return allVoices()
    .filter((v) => (v.lang || "").toLowerCase().split("-")[0] === base)
    .map((v) => {
      const lang = (v.lang || "").toLowerCase();
      return { v, rank: (lang === want ? 10 : 0) + voiceQuality(v) };
    })
    .sort((a, b) => b.rank - a.rank)
    .map((x) => x.v);
}

/** Is there any voice at all for this language? */
export function hasVoiceFor(tag) {
  return voicesFor(tag).length > 0;
}

// ---------------------------------------------------------------------------
// Tone. Rate and pitch presets, in plain words rather than numbers — nobody
// knows what pitch 1.06 sounds like, and everybody knows what "warm" means.
// ---------------------------------------------------------------------------
export const TONES = [
  { id: "warm", label: "Warm", blurb: "Unhurried and friendly", rate: 0.93, pitch: 1.06 },
  { id: "neutral", label: "Neutral", blurb: "Straightforward, no colouring", rate: 1.0, pitch: 1.0 },
  { id: "calm", label: "Calm", blurb: "Slower and lower — easiest to follow", rate: 0.85, pitch: 0.94 },
  { id: "bright", label: "Bright", blurb: "Quicker and lighter", rate: 1.08, pitch: 1.12 },
];

export function getTone(id) {
  return TONES.find((t) => t.id === id) || TONES[0];
}

// ---------------------------------------------------------------------------
// Preferences. Held in module state so the audio layer stays callable from
// anywhere; App.jsx pushes the persisted value in whenever it changes.
// ---------------------------------------------------------------------------
const DEFAULT_PREFS = {
  coachVoiceURI: null,   // null = pick the best available automatically
  tone: "warm",
  speed: 1,              // multiplier on the tone's rate, 0.7–1.3
  targetVoiceURI: {},    // { [langCode]: voiceURI }
};

let prefs = { ...DEFAULT_PREFS };

export function setVoicePrefs(next) {
  prefs = { ...DEFAULT_PREFS, ...(next || {}), targetVoiceURI: { ...(next?.targetVoiceURI || {}) } };
}

export function getVoicePrefs() {
  return prefs;
}

/** The rate/pitch the coach should speak at, from the chosen tone and speed. */
export function coachDelivery() {
  const tone = getTone(prefs.tone);
  const speed = Math.max(0.6, Math.min(1.5, Number(prefs.speed) || 1));
  return { rate: Math.max(0.5, Math.min(2, tone.rate * speed)), pitch: tone.pitch };
}

/**
 * Resolve a voice for a tag, honouring the learner's choice.
 *
 * A chosen voice that has since disappeared (a different device, an OS update)
 * falls back to the best automatic pick rather than to silence.
 */
export function resolveVoice(tag, chosenURI) {
  const list = voicesFor(tag);
  if (!list.length) return null;
  if (chosenURI) {
    const found = list.find((v) => v.voiceURI === chosenURI) ||
      allVoices().find((v) => v.voiceURI === chosenURI);
    if (found) return found;
  }
  return list[0];
}

/** The voice for the coach's English narration. */
export function coachVoice() {
  return resolveVoice("en-GB", prefs.coachVoiceURI) || resolveVoice("en-US", prefs.coachVoiceURI);
}

/** The voice for a target language, honouring a per-language override. */
export function targetVoice(tag, langCode) {
  return resolveVoice(tag, prefs.targetVoiceURI?.[langCode]);
}

// ---------------------------------------------------------------------------
// v75 — WHEN THERE IS NO VOICE FOR THE LANGUAGE AT ALL.
//
// Urdu ships no recorded audio in this repo and most devices have no ur-PK
// voice, so the audio button did precisely nothing: no sound, no message, no
// way to tell a broken app from a quiet one.
//
// Urdu and Hindi are the same spoken language. A Hindi voice pronounces Urdu
// correctly — it simply cannot read the Perso-Arabic script. Every word in the
// packs carries a Latin transliteration, so we convert that to Devanagari and
// hand it to a hi-IN voice. Punjabi (written here in Shahmukhi) takes the same
// route for the same reason.
//
// This is a last resort, tried only after a real voice and a recorded file have
// both failed.
// ---------------------------------------------------------------------------
export const SPEECH_FALLBACK = {
  ur: { tag: "hi-IN", convert: "devanagari", via: "Hindi" },
  pa: { tag: "hi-IN", convert: "devanagari", via: "Hindi" },
};

export function fallbackVoiceFor(langCode) {
  const spec = SPEECH_FALLBACK[langCode];
  if (!spec) return null;
  const v = voicesFor(spec.tag)[0];
  return v ? { ...spec, voice: v } : null;
}

/**
 * What can this device actually do for this language?
 *   "voice"    a real voice for the language
 *   "fallback" a near-language voice reading a converted transliteration
 *   "none"     nothing — the UI should say so rather than offering a dead button
 *
 * Recorded MP3s are checked separately and asynchronously by tts.js; this is the
 * synchronous answer the UI needs to decide whether to render a play button.
 */
export function speechAvailability(tag, langCode) {
  if (voicesFor(tag).length) return "voice";
  if (fallbackVoiceFor(langCode)) return "fallback";
  return "none";
}

/** A short label for a voice, without the noisy vendor suffixes. */
export function voiceLabel(v) {
  if (!v) return "Automatic";
  return String(v.name || v.voiceURI)
    .replace(/\s*\((?:enhanced|premium|natural|online|compact)\)\s*/gi, " ")
    .replace(/^(Microsoft|Google|Apple)\s+/i, "")
    .replace(/\s*-\s*(English|Urdu|Spanish|French|Arabic|Hindi|Bengali|Korean|Chinese|Turkish|Japanese|Punjabi|Indonesian)\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim() || String(v.name || "Voice");
}
