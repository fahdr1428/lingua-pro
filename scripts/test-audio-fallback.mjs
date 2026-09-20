// =============================================================================
// test-audio-fallback.mjs (v104.5) — the Urdu/Punjabi voice fallback needs
// translit to work at all, and most call sites were not passing it.
//
// WHAT THIS EXISTS FOR
//
// voices.js's SPEECH_FALLBACK (v75) exists specifically because "most devices
// have no ur-PK voice" would otherwise make every Urdu/Punjabi audio button do
// nothing: a Hindi voice pronounces Urdu correctly, it just cannot read the
// Perso-Arabic script, so the Latin transliteration every word already carries
// is converted to Devanagari and handed to a hi-IN voice instead.
//
// tts.js's speakWithBrowser() only takes that route when opts.translit is
// truthy — `if (fb && translit) { ... }` — and roughly a dozen call sites
// across the app called speak(nativeText, ttsCode) with no third argument at
// all. The fallback voice existed, hasAudioFor() correctly reported "yes,
// something can play this" so the button rendered, and then the button did
// nothing when pressed — the exact dead-button failure v75 was written to
// prevent, reintroduced call site by call site.
//
// PROVEN CAPABLE OF FAILING: dropping `, { code: pack.code, translit: line.translit }`
// from any one of the entries below and running this reports that exact
// call site.
//
//   npm run test-audio-fallback
// =============================================================================

import { readFileSync } from "node:fs";

const problems = [];

// Each entry: a file, a snippet of the speak(...) call as it must read (a
// literal substring match — brittle on purpose, so a reformat that keeps the
// same options is fine but silently dropping the option is caught).
const CALLS = [
  { file: "src/screens/AlphabetLessons.jsx", must: 'speak(letter.char, lang.ttsCode, { code: pack.code, translit: letter.name })' },
  { file: "src/screens/screens.jsx", must: 'speak(l.char, lang.ttsCode, { code: pack.code, translit: l.name })' },
  { file: "src/screens/screens.jsx", must: 'speak(selected.char, lang.ttsCode, { code: pack.code, translit: selected.name })' },
  { file: "src/screens/Conversations.jsx", must: 'speak(line.native, lang.ttsCode, { code: pack.code, translit: line.translit })' },
  { file: "src/screens/Grammar.jsx", must: 'speak(ex.native, lang.ttsCode, { code: pack.code, translit: ex.translit })' },
  { file: "src/screens/Lesson.jsx", must: 'speak(ex.native, lang.ttsCode, { code: lang.code, translit: ex.translit })' },
  { file: "src/screens/InputStream.jsx", must: 'speak(s.native, lang.ttsCode, { code: pack.code, translit: s.translit })' },
  { file: "src/screens/Reading.jsx", must: 'speak(line.native, lang.ttsCode, { code: pack.code, translit: line.translit })' },
  { file: "src/screens/SentenceLab.jsx", must: 'speak(full, lang.ttsCode, { code: lang.code, translit: fullTranslit })' },
  { file: "src/screens/SentenceLab.jsx", must: 'translit: correct.map((c) => c.translit).join(" ")' },
  { file: "src/screens/ScriptExam.jsx", must: 'speak(q.speakOnReveal, lang.ttsCode, { code: pack.code, translit: q.speakTranslit })' },
  { file: "src/data/scriptExamPaper.js", must: "speakTranslit: v.translit" },
  { file: "src/data/scriptExamPaper.js", must: "speakTranslit: l.name" },
];

for (const { file, must } of CALLS) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    problems.push(`${file}: could not read the file — this check proved nothing`);
    continue;
  }
  if (!src.includes(must)) {
    problems.push(`${file}: expected to find\n     ${must}\n   but it's gone — this speak() call (or its data) lost its translit, so the Urdu/Punjabi fallback voice will silently do nothing here again`);
  }
}

// ---------------------------------------------------------------------------
// The fallback mechanism itself: still gated on translit, still Urdu+Punjabi.
// ---------------------------------------------------------------------------
const voicesSrc = readFileSync("src/audio/voices.js", "utf8");
if (!/ur:\s*\{[^}]*hi-IN/.test(voicesSrc)) {
  problems.push("src/audio/voices.js: SPEECH_FALLBACK no longer maps ur -> a hi-IN voice");
}
const ttsSrc = readFileSync("src/audio/tts.js", "utf8");
if (!/if\s*\(fb\s*&&\s*translit\)/.test(ttsSrc)) {
  problems.push("src/audio/tts.js: speakWithBrowser no longer gates the fallback on translit being present — check by hand whether the logic moved rather than broke");
}

console.log(`\n  audio fallback wiring: ${CALLS.length} speak() call sites checked for translit`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems) console.log(`   ${p}\n`);
  process.exit(1);
}
console.log("  ✓ every checked call site passes translit through, so the Urdu/Punjabi fallback voice can actually speak\n");
