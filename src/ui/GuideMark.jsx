// =============================================================================
// GuideMark — the guide's face, wherever the guide appears.
//
// v70 drew a seal: the guide's initial, in their script, in a hairline ring.
// v119 draws the guide (GuideAvatar.jsx): a portrait that blinks, talks while
// the guide's voice plays, and reacts to answers. The drawing is its own chunk
// — 28KB of source that would otherwise be in every first download — fetched
// as soon as the app starts, so it is normally there before Home is.
// =============================================================================

import React, { useCallback, useEffect, useRef, useState } from "react";
import { getCharacter, guideVoice } from "../data/characters.js";
import { speak, stopSpeaking } from "../audio/tts.js";

// The guide's colour in the face's circle: shown while the drawing loads, and
// for good if it can't (offline before it was ever fetched, or a tab older
// than the deploy that replaced the file). A face that fails to load must
// never take the screen it sits on down with it.
function AvatarDisc({ accent = "#5a8f7b", size = 44, muted = false, style }) {
  return (
    <span
      className="guide-mark guide-avatar-wait"
      style={{ width: size, height: size, flexShrink: 0, display: "inline-block", borderRadius: "50%", background: `radial-gradient(circle at 32% 24%, ${accent}55, ${accent}22)`, opacity: muted ? 0.55 : 1, ...style }}
      aria-hidden="true"
    />
  );
}

const avatarChunk = import("./GuideAvatar.jsx");
avatarChunk.catch(() => {});
const LazyAvatar = React.lazy(() =>
  avatarChunk.then((m) => ({ default: m.GuideAvatar })).catch(() => ({ default: AvatarDisc })));

/**
 * @param {string}  code      language code — picks the guide
 * @param {number}  size      diameter in px
 * @param {string}  mood      "idle" | "happy" | "encourage"
 * @param {boolean} speaking  the mouth moves while the guide's voice plays
 * @param {boolean} muted     de-emphasise (used behind dimmed content)
 */
export function GuideMark({ code, size = 44, speaking = false, muted = false, style, title, mood = "idle", blink }) {
  const guide = getCharacter(code);
  if (!guide) return null;
  // While the drawing's chunk arrives (it is fetched at start-up, so this is
  // rarely seen): the guide's own colour in the same circle, so nothing moves.
  return (
    <React.Suspense fallback={<AvatarDisc accent={guide.accent} size={size} muted={muted} style={style} />}>
      <LazyAvatar
        code={code} accent={guide.accent} size={size} mood={mood} speaking={speaking} blink={blink}
        muted={muted} style={style} title={title} className="guide-mark"
      />
    </React.Suspense>
  );
}

/**
 * The guide's byline — face, name, and what they actually do. Used where there's
 * room to introduce them as a person rather than a decoration.
 */
export function GuideByline({ code, size = 44, speaking = false, showCraft = true, style }) {
  const guide = getCharacter(code);
  if (!guide) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0, ...style }}>
      <GuideMark code={code} size={size} speaking={speaking} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.25 }}>
          {guide.name}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-mute)", lineHeight: 1.35 }}>
          {showCraft && guide.craft ? `${guide.craft} · ${guide.city}` : guide.city}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// v119 — THE GUIDE SAYS SOMETHING. A face and a speech bubble: Home's greeting,
// a reaction to an answer, the line at the end of a lesson. With `onFace` the
// face is a button (Home: tap to hear the guide).
// =============================================================================
export function GuideSays({ code, mood = "idle", size = 44, speaking = false, onFace, faceLabel, testid, className = "", children }) {
  const guide = getCharacter(code);
  if (!guide) return null;
  const face = <GuideMark code={code} size={size} mood={mood} speaking={speaking} />;
  return (
    <div className={`guide-says ${className}`.trim()} data-testid={testid} data-mood={mood}>
      {onFace ? (
        <button type="button" className="guide-says-face" onClick={onFace} aria-label={faceLabel} data-testid={testid ? `${testid}-face` : undefined}>
          {face}
          <span className="guide-says-play" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" />
            </svg>
          </span>
        </button>
      ) : face}
      <div className="guide-bubble">{children}</div>
    </div>
  );
}

/**
 * The guide's voice, with the mouth moving while it plays.
 * Returns [talking, say]; say(text, translit) resolves to whether audio played.
 * A voice that never reports finishing stops the mouth after 7 seconds.
 */
export function useGuideVoice(code, ttsCode) {
  const [talking, setTalking] = useState(false);
  const live = useRef(true);
  useEffect(() => () => { live.current = false; }, []);
  const say = useCallback(async (text, translit) => {
    if (!text || !ttsCode) return false;
    setTalking(true);
    let played = false;
    try {
      played = await Promise.race([
        speak(text, ttsCode, { ...guideVoice(code), translit }),
        new Promise((r) => setTimeout(() => r("timeout"), 7000)),
      ]);
      if (played === "timeout") { stopSpeaking(); played = true; }
    } catch { played = false; }
    if (live.current) setTalking(false);
    return !!played;
  }, [code, ttsCode]);
  return [talking, say];
}
