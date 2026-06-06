// =============================================================================
// SOUND EFFECTS — short positive/negative tones for lesson feedback.
// Generated via Web Audio API so we ship no .mp3 files. Honours the user's
// `soundEffects` setting. Fails silent if Web Audio isn't available.
// =============================================================================

let ctx = null;
function getCtx() {
  if (ctx) return ctx;
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    return ctx;
  } catch { return null; }
}

/**
 * Play a short pleasant chime for a correct answer.
 * Two ascending notes — a warm "tick + ping".
 */
export function playCorrect() {
  const c = getCtx();
  if (!c) return;
  try {
    // Resume context on user gesture (Safari requirement)
    if (c.state === "suspended") c.resume();
    const now = c.currentTime;
    // Note 1: E5 (~659 Hz)
    tone(c, 659.25, now,        0.12, 0.20);
    // Note 2: A5 (~880 Hz) — slightly higher, brief
    tone(c, 880.00, now + 0.10, 0.18, 0.18);
  } catch {}
}

/**
 * Play a soft "no" tone for an incorrect answer — gentle, not punishing.
 * Single low-pitched note, short.
 */
export function playWrong() {
  const c = getCtx();
  if (!c) return;
  try {
    if (c.state === "suspended") c.resume();
    const now = c.currentTime;
    // A3 (~220 Hz) — low, brief, soft
    tone(c, 220.00, now, 0.18, 0.15);
  } catch {}
}

/**
 * Play a small celebratory flourish at the end of a lesson — three rising notes.
 */
export function playLessonComplete() {
  const c = getCtx();
  if (!c) return;
  try {
    if (c.state === "suspended") c.resume();
    const now = c.currentTime;
    tone(c, 523.25, now,        0.15, 0.20); // C5
    tone(c, 659.25, now + 0.12, 0.15, 0.20); // E5
    tone(c, 783.99, now + 0.24, 0.30, 0.22); // G5
  } catch {}
}

// Internal: schedule a single sine tone with a smooth attack/release envelope
function tone(c, freq, startAt, duration, gain) {
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startAt);
  // Envelope: small attack, linear release
  env.gain.setValueAtTime(0, startAt);
  env.gain.linearRampToValueAtTime(gain, startAt + 0.015);
  env.gain.linearRampToValueAtTime(0, startAt + duration);
  osc.connect(env).connect(c.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}
