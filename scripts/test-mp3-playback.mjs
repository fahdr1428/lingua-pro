// =============================================================================
// test-mp3-playback.mjs (v106) — a recorded clip that plays must let go.
//
// tts.js's tryPlayMp3() marked itself settled the moment play() began, and its
// "ended" handler only resolved when NOT settled — so a clip that played to
// the end never resolved. `await speak(…, { audioId })` hung for every word
// with a recording, and the speaking drill's auto-advance (Speak.jsx) waits on
// exactly that. A clip stopped part-way never resolved either.
//
// This drives speak() with a fake <audio> in four situations: a clip that
// plays, one that is stopped part-way, one that loads too late, one that 404s.
//
// PROVEN CAPABLE OF FAILING: against the pre-v106 tryPlayMp3, "a clip that
// plays" and "stopped part-way" both time out. "Loads too late" and "missing
// file" passed before too — they are here so the rewrite can't break them.
//
//   npm run test-mp3-playback
// =============================================================================

const problems = [];
let plays = 0;

// Each fake clip follows a script: when it becomes playable, and how it ends.
let script = { readyAfter: 10, lengthMs: 60, fail: false };

class FakeAudio {
  constructor(src) {
    this.src = src; this.duration = script.lengthMs / 1000; this.paused = true;
    this.listeners = {}; this.currentTime = 0;
    this.s = { ...script };
  }
  addEventListener(type, fn, opts) {
    (this.listeners[type] ||= []).push({ fn, once: opts?.once });
  }
  emit(type) {
    const ls = this.listeners[type] || [];
    this.listeners[type] = ls.filter((l) => !l.once);
    for (const l of ls) l.fn();
  }
  removeAttribute(a) { if (a === "src") this.src = ""; }
  load() {
    if (this.s.fail) { setTimeout(() => this.emit("error"), 5); return; }
    setTimeout(() => this.emit("canplaythrough"), this.s.readyAfter);
  }
  play() {
    if (!this.src) return Promise.reject(new Error("no source"));
    plays++;
    this.paused = false;
    this.endTimer = setTimeout(() => { this.paused = true; this.emit("pause"); this.emit("ended"); }, this.s.lengthMs);
    return Promise.resolve();
  }
  pause() {
    if (this.paused) return;
    clearTimeout(this.endTimer);
    this.paused = true;
    this.emit("pause");
  }
}
globalThis.Audio = FakeAudio;

const { speak, stopSpeaking } = await import("../src/audio/tts.js");

const within = (p, ms) => Promise.race([p.then((v) => ({ v })), new Promise((r) => setTimeout(() => r({ timeout: true }), ms))]);

// 1. A clip that plays to the end resolves true, promptly.
{
  script = { readyAfter: 10, lengthMs: 60, fail: false };
  const r = await within(speak("x", "ar-SA", { audioId: "ar_0001" }), 1500);
  if (r.timeout) problems.push("a clip that plays to the end never resolved — anything awaiting speak() hangs (Speak.jsx auto-advance)");
  else if (r.v !== true) problems.push(`a clip that played resolved ${r.v}, expected true`);
}

// 2. Stopped part-way (the learner moved on): the await ends too.
{
  script = { readyAfter: 10, lengthMs: 5000, fail: false };
  const p = speak("x", "ar-SA", { audioId: "ar_0002" });
  await new Promise((r) => setTimeout(r, 100));
  stopSpeaking();
  const r = await within(p, 1500);
  if (r.timeout) problems.push("stopping a clip part-way left speak() pending forever");
}

// 3. Loads after the 3 s window: speak() gives up, and the clip must NOT then
//    start playing on top of whatever came next.
{
  script = { readyAfter: 3300, lengthMs: 60, fail: false };
  plays = 0;
  const r = await within(speak("x", "ar-SA", { audioId: "ar_0003" }), 5000);
  await new Promise((res) => setTimeout(res, 600)); // let the late canplaythrough arrive
  if (r.timeout) problems.push("a clip that never became playable left speak() pending");
  if (plays > 0) problems.push(`a clip that missed its start window played anyway ${plays}× — it would talk over the fallback voice`);
}

// 4. No such file: resolves (false from the MP3 tier, then no browser voice here).
{
  script = { readyAfter: 10, lengthMs: 60, fail: true };
  const r = await within(speak("x", "ar-SA", { audioId: "ar_9999" }), 1500);
  if (r.timeout) problems.push("a missing clip left speak() pending");
  else if (r.v !== false) problems.push(`a missing clip with no browser voice resolved ${r.v}, expected false`);
}

console.log("\n  mp3 playback: 4 situations through speak()");
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ a recorded clip resolves when it ends or is stopped, and a late one never talks over the fallback\n");
process.exit(0);
