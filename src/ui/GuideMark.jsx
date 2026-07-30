// =============================================================================
// GuideMark (v70) — the guide's face, without an emoji in sight.
//
// THE PROBLEM IT SOLVES: guides were rendered as `character.emoji` — 👩🏼, 🧕🏽,
// 🧔🏽. Three things wrong with that. It renders differently on every platform
// (so the guide literally isn't the same person on iOS and Android), it can't be
// coloured or sized to the design, and it reads as a sticker. Flat.
//
// THE ANSWER: a seal. The guide's initial IN THEIR OWN SCRIPT — آ for Amina,
// 林 for Lin, ن for Nasreen — set in a hairline ring in their accent colour over
// a soft wash. It borrows from the stamp/tughra/chop tradition rather than from
// cartoon mascots, which is both more culturally rooted and more adult.
//
// It also does something an emoji can't: `speaking` makes the ring breathe while
// the guide's voice is playing, so the seal is visibly the thing that's talking.
//
// Rendered as SVG so it's crisp at any size and needs no image assets.
// =============================================================================

import React from "react";
import { getCharacter } from "../data/characters.js";

// Scripts that need a serif/naskh face for the initial to look printed rather
// than like UI chrome. Latin initials look better in the display serif.
const SCRIPT_FONT = {
  ur: '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif',
  ar: '"Noto Naskh Arabic", "Noto Nastaliq Urdu", serif',
  pa: '"Noto Naskh Arabic", "Noto Nastaliq Urdu", serif',
  hi: '"Noto Serif Devanagari", Georgia, serif',
  bn: '"Noto Serif Bengali", Georgia, serif',
  ja: '"Hiragino Mincho ProN", "Yu Mincho", serif',
  zh: '"Songti SC", "Noto Serif SC", serif',
  ko: '"Apple SD Gothic Neo", "Noto Serif KR", serif',
};

/**
 * @param {string} code      language code — picks the guide and the script font
 * @param {number} size      diameter in px (28 / 44 / 72 are the used sizes)
 * @param {boolean} speaking animate the ring while the guide's voice plays
 * @param {boolean} muted    de-emphasise (used behind dimmed content)
 */
export function GuideMark({ code, size = 44, speaking = false, muted = false, style, title }) {
  const guide = getCharacter(code);
  if (!guide) return null;

  const accent = guide.accent || "var(--ink)";
  const initial = guide.initial || guide.name?.[0] || "?";
  const font = SCRIPT_FONT[code] || '"Fraunces", Georgia, serif';

  // Nastaliq and Naskh sit high in their em box and need a nudge down plus a
  // smaller size to stay inside the ring; Latin/CJK centre cleanly.
  const arabicish = code === "ur" || code === "ar" || code === "pa";
  const fontSize = size * (arabicish ? 0.4 : 0.42);
  const baseline = size * (arabicish ? 0.62 : 0.605);

  const ringId = `gm-wash-${code}`;

  return (
    <span
      className={`guide-mark${speaking ? " guide-mark-speaking" : ""}`}
      style={{ width: size, height: size, flexShrink: 0, display: "inline-flex", opacity: muted ? 0.55 : 1, ...style }}
      title={title || `${guide.name} — ${guide.role}`}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id={ringId} cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.13" />
          </radialGradient>
        </defs>

        {/* the wash */}
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={`url(#${ringId})`} />
        {/* the hairline ring, in the guide's own colour */}
        <circle
          cx={size / 2} cy={size / 2} r={size / 2 - 1}
          fill="none" stroke={accent} strokeOpacity="0.5"
          strokeWidth={size >= 60 ? 1.4 : 1.1}
        />
        {/* the seal: their initial, in their script */}
        <text
          x="50%" y={baseline}
          textAnchor="middle"
          fill={accent}
          fontSize={fontSize}
          fontFamily={font}
          fontWeight="600"
        >
          {initial}
        </text>
      </svg>
    </span>
  );
}

/**
 * The guide's byline — seal, name, and what they actually do. Used where there's
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
