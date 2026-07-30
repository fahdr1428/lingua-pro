// =============================================================================
// VOICE (v71) — the coach's spoken voice, and a queue so it never talks over
// itself.
//
// WHY THIS EXISTS. v70 put the speaking feedback on screen as text. That's the
// wrong medium: someone practising pronunciation is looking at their mouth, not
// at a paragraph. The whole point of a speaking coach is that it TALKS to you.
//
// Two problems had to be solved to make that work:
//
//   1. THE COACHING IS IN ENGLISH, THE MODEL ANSWER IS NOT. "Close — the bit
//      that went missing was shukriya" has to be spoken by an English voice, and
//      then the Urdu line by an Urdu voice, back to back. tts.js only ever spoke
//      in the target language, so this needed its own path.
//
//   2. SPEECH IS ASYNCHRONOUS AND OVERLAPS. Fire two `speak()` calls and the
//      browser either interleaves them or drops one — and every one of them
//      calls `speechSynthesis.cancel()` on entry, so the second kills the first.
//      Everything here goes through one sequential queue with a generation
//      counter, so a new turn cancels the old one cleanly instead of racing it.
//
// AND THE ONE THAT BITES: the microphone must not be open while the coach is
// speaking, or the recogniser transcribes the coach. Callers await `idle()`
// before listening — see `say()`'s return value.
// =============================================================================

import { stopSpeaking as stopTargetAudio } from "./tts.js";

let voicesCache = [];
let queue = [];
let speaking = false;
let generation = 0;

function loadVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  voicesCache = window.speechSynthesis.getVoices() || [];
  if (!voicesCache.length) {
    window.speechSynthesis.onvoiceschanged = () => {
      voicesCache = window.speechSynthesis.getVoices() || [];
    };
  }
}
if (typeof window !== "undefined") loadVoices();

export function voiceSupported() {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

/**
 * Pick a voice for a BCP-47 tag, preferring a local (offline) one — remote
 * voices add a network round trip mid-conversation, which reads as the coach
 * hesitating.
 */
function pickVoice(tag) {
  if (!voicesCache.length) loadVoices();
  if (!voicesCache.length) return null;
  const want = String(tag || "").toLowerCase();
  const base = want.split("-")[0];

  const exactLocal = voicesCache.find((v) => v.lang?.toLowerCase() === want && v.localService);
  if (exactLocal) return exactLocal;
  const exact = voicesCache.find((v) => v.lang?.toLowerCase() === want);
  if (exact) return exact;
  const baseLocal = voicesCache.find((v) => v.lang?.toLowerCase().startsWith(base) && v.localService);
  if (baseLocal) return baseLocal;
  return voicesCache.find((v) => v.lang?.toLowerCase().startsWith(base)) || null;
}

/**
 * Queue one utterance. Resolves when it has finished speaking (or immediately
 * if speech isn't available, so callers never hang waiting for a voice that
 * doesn't exist).
 *
 * @param {string} text
 * @param {object} opts
 * @param {string} opts.lang  BCP-47 tag — "en-GB" for coaching, lang.ttsCode for the target
 * @param {number} opts.rate  0.1–10; coaching sits slightly slow so it's easy to follow
 * @param {number} opts.pitch 0–2
 */
export function say(text, { lang = "en-GB", rate = 0.98, pitch = 1 } = {}) {
  if (!voiceSupported() || !text) return Promise.resolve(false);
  const myGeneration = generation;
  return new Promise((resolve) => {
    queue.push({ text: String(text), lang, rate, pitch, resolve, generation: myGeneration });
    pump();
  });
}

/** The coach's own voice — English, a touch slow, warm pitch. */
export function sayCoach(text) {
  return say(text, { lang: "en-GB", rate: 0.97, pitch: 1.04 });
}

function pump() {
  if (speaking) return;
  const next = queue.shift();
  if (!next) return;

  // Dropped by a cancel() that happened while this item sat in the queue.
  if (next.generation !== generation) {
    next.resolve(false);
    return pump();
  }

  speaking = true;
  let settled = false;
  const finish = (ok) => {
    if (settled) return;
    settled = true;
    speaking = false;
    next.resolve(ok);
    pump();
  };

  try {
    const u = new SpeechSynthesisUtterance(next.text);
    u.lang = next.lang;
    u.rate = next.rate;
    u.pitch = next.pitch;
    const v = pickVoice(next.lang);
    if (v) u.voice = v;
    u.onend = () => finish(true);
    u.onerror = () => finish(false);
    window.speechSynthesis.speak(u);

    // Safety net: some engines never fire onend for long strings, which would
    // wedge the queue and leave the mic permanently blocked. Roughly 14
    // characters a second plus a second of slack.
    const budget = 1200 + (next.text.length / 14) * 1000;
    setTimeout(() => finish(false), Math.min(20000, budget));
  } catch {
    finish(false);
  }
}

/** Cancel everything queued and speaking. Safe to call repeatedly. */
export function cancelVoice() {
  generation++;
  const dropped = queue;
  queue = [];
  speaking = false;
  for (const item of dropped) item.resolve(false);
  try { window.speechSynthesis?.cancel(); } catch {}
  stopTargetAudio(); // also stop any pre-generated MP3 mid-play
}

/** Resolves once nothing is queued or speaking — await before opening the mic. */
export function idle() {
  if (!speaking && !queue.length) return Promise.resolve();
  return new Promise((resolve) => {
    const check = setInterval(() => {
      if (!speaking && !queue.length) {
        clearInterval(check);
        resolve();
      }
    }, 60);
    // Never wait forever on a stuck engine.
    setTimeout(() => { clearInterval(check); resolve(); }, 12000);
  });
}
