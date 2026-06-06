# 🎙 Generating Audio for Lingua — Step by Step

You've already done the hard parts (Google Cloud project, TTS API enabled,
service account, downloaded the JSON key). Here's the finish line.

## Steps

### 1. Put the key file in the project root
Rename your downloaded Google Cloud key to exactly `google-tts-key.json` and
move it into the project's top folder:

```bash
mv ~/Downloads/your-downloaded-key-file.json ~/Downloads/lingua-pro20/google-tts-key.json
```

(It's in .gitignore, so it will NOT be committed to GitHub.)

### 2. Install the Google TTS library
```bash
cd ~/Downloads/lingua-pro20
npm install @google-cloud/text-to-speech
```

### 3. Run the generator
```bash
npm run audio
```

Writes MP3s to public/audio/{language}/{id}.mp3 for ~1,150 words across 12
languages. Costs a few cents of the free tier, takes a few minutes. Re-running
skips existing files.

### 4. Commit the audio + push
```bash
git add public/audio
git commit -m "Add generated audio files for all vocabulary"
git push
```

### 5. Verify
After Vercel redeploys (~60s), start a lesson and tap 🔊 Listen — you should
hear real pronunciation instead of the browser voice.

## Troubleshooting
- "not installed" → rerun step 2
- "credentials not found" → key must be named exactly google-tts-key.json in project root
- a language fails "voice not found" → tell me which; I'll switch it to a Standard voice
- pcm uses an English voice (no Pidgin TTS exists); pa uses pa-IN
