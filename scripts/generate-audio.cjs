#!/usr/bin/env node
// =============================================================================
// generate-audio.js — generate MP3 files for every vocab word using
// Google Cloud Text-to-Speech.
// =============================================================================
//
// Setup (one-time, ~15 minutes):
//   1. Go to console.cloud.google.com and create a project (free)
//   2. Enable the "Cloud Text-to-Speech API" for that project
//   3. Create a service account, download its JSON key file
//   4. Save the key file as `google-tts-key.json` in this project's root folder
//      (DO NOT COMMIT IT — see .gitignore)
//   5. npm install @google-cloud/text-to-speech
//   6. node scripts/generate-audio.js
//
// What it does:
//   - Reads every src/data/languages/*.json file
//   - For each vocab item, calls Google TTS with the native lemma
//   - Saves the MP3 to public/audio/{lang}/{id}.mp3
//   - Skips files that already exist (so re-running is fast)
//
// Cost:
//   - Google Cloud TTS free tier = 4M characters/month for standard voices,
//     1M for WaveNet (premium) voices.
//   - Your full vocab is ~3000 chars total.
//   - You will not hit the limit unless you have millions of users.
// =============================================================================

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LANG_DIR = path.join(ROOT, "src", "data", "languages");
const OUT_DIR = path.join(ROOT, "public", "audio");

// Map our language codes to Google TTS voice configs.
// Voice names from https://cloud.google.com/text-to-speech/docs/voices
const VOICE_CONFIG = {
  ur: { languageCode: "ur-PK", voiceName: "ur-PK-Standard-A", gender: "FEMALE" },
  es: { languageCode: "es-ES", voiceName: "es-ES-Wavenet-D", gender: "MALE" },
  fr: { languageCode: "fr-FR", voiceName: "fr-FR-Wavenet-A", gender: "FEMALE" },
  ja: { languageCode: "ja-JP", voiceName: "ja-JP-Wavenet-A", gender: "FEMALE" },
  ko: { languageCode: "ko-KR", voiceName: "ko-KR-Wavenet-A", gender: "FEMALE" },
  zh: { languageCode: "cmn-CN", voiceName: "cmn-CN-Wavenet-A", gender: "FEMALE" },
  ar: { languageCode: "ar-XA", voiceName: "ar-XA-Wavenet-A", gender: "FEMALE" },
  hi: { languageCode: "hi-IN", voiceName: "hi-IN-Wavenet-A", gender: "FEMALE" },
  bn: { languageCode: "bn-IN", voiceName: "bn-IN-Wavenet-A", gender: "FEMALE" },
};

// Lazy-load to avoid crashing if not installed yet
let TTS;
try {
  TTS = require("@google-cloud/text-to-speech");
} catch {
  console.error("\n❌ @google-cloud/text-to-speech is not installed.\n");
  console.error("Run:  npm install @google-cloud/text-to-speech\n");
  process.exit(1);
}

// Check for credentials
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const keyPath = path.join(ROOT, "google-tts-key.json");
  if (fs.existsSync(keyPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
    console.log(`✓ Using credentials from ${keyPath}`);
  } else {
    console.error("\n❌ Google Cloud credentials not found.\n");
    console.error("Either:");
    console.error("  1. Save your service account JSON as google-tts-key.json in the project root");
    console.error("  2. OR set GOOGLE_APPLICATION_CREDENTIALS to point at your key file\n");
    console.error("Setup guide: https://cloud.google.com/text-to-speech/docs/before-you-begin\n");
    process.exit(1);
  }
}

const client = new TTS.TextToSpeechClient();

async function synthesize(text, voiceConfig) {
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: voiceConfig.languageCode,
      name: voiceConfig.voiceName,
      ssmlGender: voiceConfig.gender,
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 0.9, // slightly slower for learners
    },
  });
  return response.audioContent;
}

async function processLanguage(code) {
  const voiceConfig = VOICE_CONFIG[code];
  if (!voiceConfig) {
    console.log(`⚠️  ${code}: no voice config — skipping`);
    return { generated: 0, skipped: 0, failed: 0 };
  }

  const file = path.join(LANG_DIR, `${code}.json`);
  if (!fs.existsSync(file)) {
    console.log(`⚠️  ${code}: no language file at ${file}`);
    return { generated: 0, skipped: 0, failed: 0 };
  }

  const pack = JSON.parse(fs.readFileSync(file, "utf8"));
  const outDir = path.join(OUT_DIR, code);
  fs.mkdirSync(outDir, { recursive: true });

  let generated = 0, skipped = 0, failed = 0;

  for (const word of pack.vocab) {
    const outFile = path.join(outDir, `${word.id}.mp3`);
    if (fs.existsSync(outFile)) {
      skipped++;
      continue;
    }
    try {
      const audio = await synthesize(word.lemma, voiceConfig);
      fs.writeFileSync(outFile, audio, "binary");
      generated++;
      process.stdout.write(`  ✓ ${code}/${word.id} ${word.lemma}\n`);
      // Tiny delay to be polite to the API
      await new Promise((r) => setTimeout(r, 50));
    } catch (e) {
      failed++;
      console.error(`  ✗ ${code}/${word.id} ${word.lemma}: ${e.message}`);
    }
  }
  return { generated, skipped, failed };
}

(async () => {
  console.log("🎙  Generating audio files for all vocabulary...\n");
  const codes = Object.keys(VOICE_CONFIG);
  let totalGenerated = 0, totalSkipped = 0, totalFailed = 0;
  for (const code of codes) {
    console.log(`\n=== ${code.toUpperCase()} ===`);
    const stats = await processLanguage(code);
    totalGenerated += stats.generated;
    totalSkipped += stats.skipped;
    totalFailed += stats.failed;
    console.log(`  ${code}: ${stats.generated} new, ${stats.skipped} cached, ${stats.failed} failed`);
  }
  console.log(`\n🎉 Done. Generated ${totalGenerated}, skipped ${totalSkipped} (already existed), failed ${totalFailed}.`);
  console.log(`\nFiles saved to: public/audio/`);
  console.log(`These will be served by Vercel as static assets at https://yoursite.com/audio/{lang}/{id}.mp3\n`);
})();
