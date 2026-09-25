// =============================================================================
// validate-audio-index.mjs (v107) — src/data/audioIndex.js must describe the
// MP3s that are actually in public/audio. Regenerates it in memory and fails
// if the committed file differs: a recording added without the index would
// never be played, and an index entry with no file would put the 404s back.
//
//   npm run validate-audio-index
// =============================================================================

import { readFileSync, existsSync } from "node:fs";
import { buildAudioIndex, render } from "./build-audio-index.mjs";

const PATH = "src/data/audioIndex.js";
if (!existsSync(PATH)) {
  console.error(`\n  ✗ ${PATH} is missing — run npm run build-audio-index\n`);
  process.exit(1);
}
const want = render(buildAudioIndex());
const have = readFileSync(PATH, "utf8");
if (want !== have) {
  console.error(`\n  ✗ ${PATH} is out of date with public/audio — run npm run build-audio-index\n`);
  process.exit(1);
}

// And the lookup itself answers correctly for every file and for a neighbour.
const { hasRecording, AUDIO_RUNS } = await import(`../${PATH}`);
const problems = [];
for (const [code, runs] of Object.entries(AUDIO_RUNS)) {
  const [a, b] = runs[0];
  const id = (n) => `${code}_${String(n).padStart(4, "0")}`;
  if (!hasRecording(code, id(a))) problems.push(`${code}: first recording ${id(a)} not found`);
  if (!hasRecording(code, id(b))) problems.push(`${code}: last recording ${id(b)} not found`);
  if (hasRecording(code, id(runs[runs.length - 1][1] + 1))) problems.push(`${code}: claims a recording past the last file`);
  if (hasRecording(code === "ar" ? "bn" : "ar", id(a)) && code !== "ar") problems.push(`${code}: an id matched under another language`);
}
if (problems.length) {
  console.error(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems) console.error(`   ${p}`);
  process.exit(1);
}
console.log(`\n  audio index matches public/audio · ${Object.keys(AUDIO_RUNS).length} languages · 0 errors\n`);
