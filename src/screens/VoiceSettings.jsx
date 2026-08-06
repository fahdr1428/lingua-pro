// =============================================================================
// VOICE SETTINGS (v74) — choose who talks to you, and how.
//
// The complaint was that the voice was "rough and scary". Two things were wrong:
// the picker preferred fast local voices over natural-sounding ones (fixed in
// audio/voices.js), and there was no way for the learner to say "not that one".
//
// This is the second half. Tone in plain words rather than pitch numbers, a
// speed slider, and the actual voice list from the device for both the coach's
// English and the language being learned — each with a Preview button, because
// nobody can choose a voice from a name.
//
// EVERYTHING PREVIEWS IMMEDIATELY. A settings screen where you change something,
// leave, and find out later whether it helped is a settings screen nobody uses.
// =============================================================================

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { LANGUAGES } from "../data/registry.js";
import { regionsFor } from "../data/personas.js";
import { getCharacter } from "../data/characters.js";
import {
  TONES, getTone, voicesFor, voiceLabel, onVoicesReady, voicesLoaded,
  setVoicePrefs, coachDelivery,
} from "../audio/voices.js";
import { say, cancelVoice } from "../audio/voice.js";

export const DEFAULT_VOICE_PREFS = {
  coachVoiceURI: null,
  tone: "warm",
  speed: 1,
  targetVoiceURI: {},
};

export function VoiceSettings({ appState, setAppState, langCode }) {
  const prefs = { ...DEFAULT_VOICE_PREFS, ...(appState?.voice || {}) };
  const lang = LANGUAGES[langCode];
  const guide = getCharacter(langCode);

  // The voice list arrives asynchronously in every browser, so re-render when
  // it does rather than showing an empty picker forever.
  const [, bump] = useState(0);
  useEffect(() => onVoicesReady(() => bump((n) => n + 1)), []);

  // A device with NO voices at all never fires onvoiceschanged, so the "loaded"
  // flag stays false forever and an emptiness check hung off it would never
  // fire either. Give the list a moment to arrive, then believe what we see.
  const [settled, setSettled] = useState(voicesLoaded());
  useEffect(() => {
    if (voicesLoaded()) { setSettled(true); return; }
    const t = setTimeout(() => setSettled(true), 700);
    return () => clearTimeout(t);
  }, []);

  const englishVoices = useMemo(() => voicesFor("en-GB"), [voicesLoaded()]);
  const targetVoices = useMemo(() => (lang ? voicesFor(lang.ttsCode) : []), [lang?.ttsCode, voicesLoaded()]);

  const update = useCallback((patch) => {
    setAppState((s) => {
      const next = { ...DEFAULT_VOICE_PREFS, ...(s.voice || {}), ...patch };
      // Push into the audio layer immediately so the preview below uses it.
      setVoicePrefs(next);
      return { ...s, voice: next };
    });
  }, [setAppState]);

  function previewCoach(voiceURI = prefs.coachVoiceURI, tone = prefs.tone, speed = prefs.speed) {
    cancelVoice();
    const t = getTone(tone);
    const rate = Math.max(0.5, Math.min(2, t.rate * (Number(speed) || 1)));
    const v = englishVoices.find((x) => x.voiceURI === voiceURI) || englishVoices[0] || null;
    say(
      guide?.name
        ? `Hello. I'm the voice that talks you through this. ${guide.name} will speak the ${lang?.name || "target"} — I'll do the coaching.`
        : "Hello. I'm the voice that talks you through this.",
      { lang: "en-GB", rate, pitch: t.pitch, voice: v }
    );
  }

  function previewTarget(voiceURI) {
    if (!lang) return;
    cancelVoice();
    const v = targetVoices.find((x) => x.voiceURI === voiceURI) || targetVoices[0] || null;
    const sample = SAMPLES[langCode] || lang.name;
    say(sample, { lang: lang.ttsCode, rate: 0.9, pitch: 1, voice: v });
  }

  const noVoices = (voicesLoaded() || settled) && englishVoices.length === 0 && targetVoices.length === 0;

  return (
    <div className="voice-settings">
      <h3 className="eyebrow" style={{ marginTop: 24, marginBottom: 4 }}>The voice that talks to you</h3>
      <p className="brief-note" style={{ marginBottom: 12 }}>
        Pick whatever you'd actually want to listen to. Nothing here changes what
        you're taught — only how it sounds.
      </p>

      {noVoices && (
        <div className="empty-note" style={{ padding: "20px 16px" }}>
          This browser has no speech voices installed, so there's nothing to
          choose between. Everything still works — you'll just read the coaching
          instead of hearing it.
        </div>
      )}

      {!noVoices && (
        <>
          <div className="voice-block">
            <div className="voice-block-head">Tone</div>
            <div className="chip-row">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  className={`chip${prefs.tone === t.id ? " chip-on" : ""}`}
                  onClick={() => { update({ tone: t.id }); previewCoach(prefs.coachVoiceURI, t.id, prefs.speed); }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="brief-note">{getTone(prefs.tone).blurb}. Tap one to hear it.</div>
          </div>

          <div className="voice-block">
            <div className="voice-block-head">
              Speed
              <span className="voice-value">{Math.round((Number(prefs.speed) || 1) * 100)}%</span>
            </div>
            <input
              className="voice-slider"
              type="range"
              min="0.7" max="1.3" step="0.05"
              value={prefs.speed}
              aria-label="Speaking speed"
              onChange={(e) => update({ speed: Number(e.target.value) })}
              onMouseUp={(e) => previewCoach(prefs.coachVoiceURI, prefs.tone, Number(e.target.value))}
              onTouchEnd={(e) => previewCoach(prefs.coachVoiceURI, prefs.tone, Number(e.target.value))}
            />
            <div className="brief-note">Slower is easier to follow while you're still decoding.</div>
          </div>

          {englishVoices.length > 0 && (
            <div className="voice-block">
              <div className="voice-block-head">Coaching voice (English)</div>
              <div className="voice-row">
                <select
                  className="voice-select"
                  value={prefs.coachVoiceURI || ""}
                  onChange={(e) => {
                    const uri = e.target.value || null;
                    update({ coachVoiceURI: uri });
                    previewCoach(uri);
                  }}
                >
                  <option value="">Best available on this device</option>
                  {englishVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {voiceLabel(v)} · {v.lang}
                    </option>
                  ))}
                </select>
                <button className="voice-preview" onClick={() => previewCoach()}>Preview</button>
              </div>
              <div className="brief-note">
                {englishVoices.length} available. The first is usually the most natural —
                the flat robotic ones are ranked last on purpose.
              </div>
            </div>
          )}

          {lang && (
            <div className="voice-block">
              <div className="voice-block-head">{lang.name} voice</div>
              {targetVoices.length === 0 ? (
                <div className="brief-note">
                  This device has no {lang.name} voice installed, so {guide?.name || "your guide"}'s
                  lines fall back to the recorded audio where we have it. Adding the
                  language to your operating system's language settings usually
                  installs one.
                </div>
              ) : (
                <>
                  <div className="voice-row">
                    <select
                      className="voice-select"
                      value={prefs.targetVoiceURI?.[langCode] || ""}
                      onChange={(e) => {
                        const uri = e.target.value || null;
                        update({ targetVoiceURI: { ...prefs.targetVoiceURI, [langCode]: uri } });
                        previewTarget(uri);
                      }}
                    >
                      <option value="">Best available on this device</option>
                      {targetVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {voiceLabel(v)} · {v.lang}
                        </option>
                      ))}
                    </select>
                    <button className="voice-preview" onClick={() => previewTarget(prefs.targetVoiceURI?.[langCode])}>
                      Preview
                    </button>
                  </div>
                  <div className="brief-note">
                    Recorded audio is used where we have it; this voice covers everything else.
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// A short, ordinary sentence in each language — a greeting is what a learner can
// judge a voice by, and it's the phrase they'll hear most often.
const SAMPLES = {
  ur: "السلام علیکم، آپ کیسے ہیں؟",
  es: "Hola, ¿qué tal? Me alegro de verte.",
  fr: "Bonjour, comment ça va aujourd'hui ?",
  ja: "こんにちは。お元気ですか。",
  ar: "مرحبا، كيف حالك اليوم؟",
  hi: "नमस्ते, आप कैसे हैं?",
  bn: "নমস্কার, আপনি কেমন আছেন?",
  ko: "안녕하세요. 잘 지내셨어요?",
  zh: "你好，最近怎么样？",
  pa: "ست سری اکال، تسیں کیویں او؟",
  id: "Halo, apa kabar hari ini?",
  pcm: "How you dey? I hope say you dey fine.",
  tr: "Merhaba, nasılsın bugün?",
};

// =============================================================================
// DIALECT (v75) — which variety of the language you're actually learning.
//
// "Arabic" is not one spoken language and neither is Spanish. A learner heading
// to Casablanca and one heading to Kuwait need different things, and being
// taught the wrong variety is worse than being taught neither. This used to be
// buried in the mission brief; it belongs here, as a standing preference that
// every conversation reads.
//
// It is stored on the learner PROFILE rather than app settings, because it is
// per-language: someone learning both Arabic and German has one answer for each.
// =============================================================================
export function DialectSettings({ langCode, profile, mutateProfile }) {
  const lang = LANGUAGES[langCode];
  const regions = regionsFor(langCode);
  if (!lang || regions.length === 0) return null;

  const chosen = profile?.region || null;
  const current = regions.find((r) => r.id === chosen);

  return (
    <div className="dialect-settings">
      <h3 className="eyebrow" style={{ marginTop: 24, marginBottom: 4 }}>Which {lang.name}</h3>
      <p className="brief-note" style={{ marginBottom: 12 }}>
        Your guide will stay in this variety in every conversation. Lessons still
        teach the standard forms — this changes who you practise talking to.
      </p>

      <div className="voice-block">
        <div className="chip-row">
          {regions.map((r) => (
            <button
              key={r.id}
              className={`chip${chosen === r.id ? " chip-on" : ""}`}
              onClick={() => mutateProfile?.((p) => ({ ...p, region: chosen === r.id ? null : r.id }))}
            >
              {r.flag ? `${r.flag} ` : ""}{r.name}
            </button>
          ))}
        </div>
        <div className="brief-note">
          {current
            ? (current.blurb || `Your guide will speak ${current.name} ${lang.name}.`)
            : `No preference — you'll get the standard variety. Tap one if you're learning for somewhere specific.`}
        </div>
      </div>
    </div>
  );
}
