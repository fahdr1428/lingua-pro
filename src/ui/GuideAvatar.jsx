// =============================================================================
// GuideAvatar (v119) — the guide, drawn.
//
// One SVG portrait per guide, built from GUIDE_LOOKS (data/guideLooks.js):
// skin, hair, what covers it, clothes, and the detail from their work. It is
// drawn in a 120×120 box and scales to any size without image files.
//
// MOODS — the guide reacts, which a letter in a ring never could:
//   idle       a soft smile; blinks now and then (only at sizes where a blink
//              can be seen, so a list of small faces doesn't flicker)
//   happy      eyes crease, mouth opens — a right answer, a finished lesson
//   encourage  brows lift in the middle, a small closed smile — a miss
//   speaking   (a flag, any mood) the mouth moves while the guide's voice plays
//
// Every animation is CSS on transform/opacity and stops under
// prefers-reduced-motion (the blanket rule in index.css).
// =============================================================================

import React, { useId } from "react";
import { lookFor } from "../data/guideLooks.js";
import "./GuideAvatar.css";

// ---- colour helpers ---------------------------------------------------------
function rgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a, b, t) {
  const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b);
  const c = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}
const darken = (c, t) => mix(c, "#000000", t);
const lighten = (c, t) => mix(c, "#ffffff", t);
const lum = (c) => { const [r, g, b] = rgb(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

const FACE = "M60 31 C73.5 31 81 41.5 81 55 C81 69.5 72 80 60 80 C48 80 39 69.5 39 55 C39 41.5 46.5 31 60 31 Z";
const FACE_SHADE = "M71 33.5 C78 38 81 46 81 55 C81 69.5 72 80 60 80 C67 76 73 68 74 57 C75 47 74 40 71 33.5 Z";
const GOLD = "#e3b552";
const INK = "#241a15";

// ---- hair -------------------------------------------------------------------
// Each style: back (behind the head and neck), front (over the forehead),
// locks (over the shoulders, drawn after the clothes).
const HAIR = {
  short: {
    front: "M38.6 56 C36.5 37 46 27 60 27 C74 27 83.5 37 81.4 56 C80.6 49 78.5 44 75.5 41.5 C69 44 52 44.5 44.5 41.5 C41.5 44 39.4 49 38.6 56 Z",
  },
  crop: {
    front: "M39.5 52 C38.5 36 47.5 28.5 60 28.5 C72.5 28.5 81.5 36 80.5 52 C79 45 76 41.5 72 40 C65 41.5 55 41.5 48 40 C44 41.5 41 45 39.5 52 Z",
  },
  neat: {
    front: "M38.6 55 C36.5 36 47 27 61 27 C75 27 84 37 81.4 55 C80 47 77 42 72 40 C63 43 52 42 45 38.5 C42 42 39.6 48 38.6 55 Z",
    part: "M51 29 Q49.5 34 46.5 38.5",
  },
  wavyshort: {
    front: "M38.6 56 C35 40 41 30 49 28.5 C52 25 58 25 61 26.5 C65 24.5 72 25.5 75 29 C80.5 32 84 41 81.4 56 C80.5 49 78 44.5 75 42 C70 45.5 60 44 55 41.5 C50 44 45 44 43 42 C40.5 45.5 39.2 50 38.6 56 Z",
  },
  parted: {
    back: "M37 60 C34 36 46 25 60 25 C74 25 86 36 83 60 C83 70 80 76 76 79 L44 79 C40 76 37 70 37 60 Z",
    front: "M38.8 57 C37 37 47 28 60 28 C73 28 83 37 81.2 57 C80 46 74 37.5 60 37 C46 37.5 40 46 38.8 57 Z",
    part: "M60 28.6 L60 36.6",
  },
  bun: {
    bun: [60, 23.5, 9.5],
    back: "M37 60 C34 36 46 25 60 25 C74 25 86 36 83 60 C83 70 80 76 76 79 L44 79 C40 76 37 70 37 60 Z",
    front: "M38.8 57 C37 37 47 28 60 28 C73 28 83 37 81.2 57 C80 47 75 39.5 64 37.5 C56 38 45 43 38.8 57 Z",
  },
  braid: {
    back: "M37 60 C34 36 46 25 60 25 C74 25 86 36 83 60 C83 70 80 76 76 79 L44 79 C40 76 37 70 37 60 Z",
    front: "M38.8 57 C37 37 47 28 60 28 C73 28 83 37 81.2 57 C80 46 74 37.5 60 37 C46 37.5 40 46 38.8 57 Z",
    part: "M60 28.6 L60 36.6",
    braid: [[79.5, 73], [81, 80], [82.2, 87], [83.3, 94], [84.3, 101], [85.2, 108]],
  },
  long: {
    back: "M36 56 C33 33 46 23 60 23 C74 23 87 33 84 56 C84 74 87 88 90 100 C82 104 38 104 30 100 C33 88 36 74 36 56 Z",
    front: "M38.6 58 C36 37 46.5 27 60.5 27 C74 27 84 37 81.4 58 C80 49 76 42 70 39.5 C62 44 50 47 41.5 52 C40.2 54 39.3 56 38.6 58 Z",
    locks: [
      "M39.5 54 C38 70 37 84 34.5 98 C38.5 100.5 42.5 99.5 45 97 C43.5 84 43.6 70 44.5 58 Z",
      "M80.5 54 C82 70 83 84 85.5 98 C81.5 100.5 77.5 99.5 75 97 C76.5 84 76.4 70 75.5 58 Z",
    ],
  },
  wavy: {
    back: "M35.5 57 C32 33 46 22.5 60 22.5 C74 22.5 88 33 84.5 57 C83 66 88 72 86 81 C84.5 88 89 94 87 101 C78 105 42 105 33 101 C31 94 35.5 88 34 81 C32 72 37 66 35.5 57 Z",
    front: "M38.4 58 C35.5 38 45 27 60 27 C75 27 84.5 38 81.6 58 C80 48 75 40.5 64 38.5 C61.5 40.5 60.5 42 60 44 C59 41 56 39 54 38.6 C46 40.5 40 48 38.4 58 Z",
    locks: [
      "M39.5 54 C36 66 40 74 36.5 84 C34 91 36 97 33 101 C39 103 44 100 45 96 C42 88 46 80 43.5 70 C42.5 64 44 60 44.5 57 Z",
      "M80.5 54 C84 66 80 74 83.5 84 C86 91 84 97 87 101 C81 103 76 100 75 96 C78 88 74 80 76.5 70 C77.5 64 76 60 75.5 57 Z",
    ],
  },
  bob: {
    back: "M36 54 C34 32 46 24 60 24 C74 24 86 32 84 54 L85.5 77 C82 80.5 77.5 80 75.5 77.5 L44.5 77.5 C42.5 80 38 80.5 34.5 77 Z",
    front: "M39 52 C38.5 34 48 28 60 28 C72 28 81.5 34 81 52 C79 48 77 46.5 74.5 46 C69 47.5 51 47.5 45.5 46 C43 46.5 41 48 39 52 Z",
  },
};

// ---- clothes ----------------------------------------------------------------
const BODY = {
  round: "M10 124 C11 103 27 93 47 90 Q60 100 73 90 C93 93 109 103 110 124 Z",
  v: "M10 124 C11 103 27 93 47 90 L60 105 L73 90 C93 93 109 103 110 124 Z",
  collar: "M10 124 C11 103 27 93 47 90 L60 103 L73 90 C93 93 109 103 110 124 Z",
  high: "M10 124 C11 103 27 93 50 91 L50 85.5 Q60 89 70 85.5 L70 91 C93 93 109 103 110 124 Z",
};
const NECKLINE = {
  round: "M47 90 Q60 100 73 90",
  v: "M47 90 L60 105 L73 90",
  collar: null,
  high: "M50 85.5 Q60 89 70 85.5",
};

// ---- the face's parts, by mood -------------------------------------------------
function Brows({ kind, mood, color }) {
  const w = kind === "full" ? 2.3 : kind === "straight" ? 1.9 : 1.6;
  const d = mood === "encourage"
    ? ["M47.4 50.4 Q51.4 49 55.4 47.6", "M64.6 47.6 Q68.6 49 72.6 50.4"]
    : mood === "happy"
    ? ["M47.4 48.6 Q51.5 46.2 55.4 47.8", "M64.6 47.8 Q68.5 46.2 72.6 48.6"]
    : kind === "straight"
    ? ["M47.4 49.4 Q51.5 48.2 55.4 48.9", "M64.6 48.9 Q68.5 48.2 72.6 49.4"]
    : ["M47.4 50 Q51.5 47.8 55.4 49.3", "M64.6 49.3 Q68.5 47.8 72.6 50"];
  return (
    <g stroke={color} strokeWidth={w} strokeLinecap="round" fill="none">
      <path d={d[0]} />
      <path d={d[1]} />
    </g>
  );
}

function Eyes({ mood, tiny }) {
  if (mood === "happy") {
    return (
      <g stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M48.6 57.4 Q51.5 53.6 54.4 57.4" />
        <path d="M65.6 57.4 Q68.5 53.6 71.4 57.4" />
      </g>
    );
  }
  return (
    <g className="ga-eyes">
      <ellipse cx="51.5" cy="56.2" rx={tiny ? 2.6 : 2.3} ry={tiny ? 3 : 2.8} fill={INK} />
      <ellipse cx="68.5" cy="56.2" rx={tiny ? 2.6 : 2.3} ry={tiny ? 3 : 2.8} fill={INK} />
      {!tiny && <circle cx="52.3" cy="55.1" r="0.85" fill="#ffffff" />}
      {!tiny && <circle cx="69.3" cy="55.1" r="0.85" fill="#ffffff" />}
    </g>
  );
}

function Mouth({ mood, speaking, lip }) {
  const smile = mood === "encourage"
    ? <path d="M55.6 70.4 Q60 73 64.4 70.4" stroke={lip} strokeWidth="1.9" strokeLinecap="round" fill="none" />
    : <path d="M54.2 69.8 Q60 74.8 65.8 69.8" stroke={lip} strokeWidth="1.9" strokeLinecap="round" fill="none" />;
  const open = (
    <g>
      <path d="M53.6 69 Q60 78.6 66.4 69 Q60 71 53.6 69 Z" fill="#5a1f1a" />
      <path d="M55.4 69.9 Q60 71.4 64.6 69.9 L64.1 71.1 Q60 72.5 55.9 71.1 Z" fill="#ffffff" opacity="0.92" />
    </g>
  );
  if (speaking) {
    return (
      <g>
        <g className="ga-talk-a"><ellipse cx="60" cy="71" rx="3.6" ry="2.7" fill="#5a1f1a" /></g>
        <g className="ga-talk-b">{mood === "happy" ? open : smile}</g>
      </g>
    );
  }
  return mood === "happy" ? open : smile;
}

function Beard({ kind, color }) {
  if (!kind) return null;
  const full = "M39.6 57 C40 71 48.5 82.5 60 83 C71.5 82.5 80 71 80.4 57 C79.5 64 76.5 70.5 71.5 72.5 C67.5 69.2 52.5 69.2 48.5 72.5 C43.5 70.5 40.5 64 39.6 57 Z";
  const trim = "M41 60 C42 72 49.5 81 60 81.5 C70.5 81 78 72 79 60 C77.5 67 74 71.5 70.5 73 C67 70.5 53 70.5 49.5 73 C46 71.5 42.5 67 41 60 Z";
  const tash = "M52.4 68.7 C55.4 65.8 64.6 65.8 67.6 68.7 C64.6 67.6 55.4 67.6 52.4 68.7 Z";
  if (kind === "stubble") return <path d={full} fill={color} opacity="0.26" />;
  if (kind === "mustache") return <path d={tash} fill={color} />;
  return (
    <g fill={color}>
      <path d={kind === "trim" ? trim : full} />
      <path d={tash} />
    </g>
  );
}

function Earring({ kind, x }) {
  if (kind === "hoop") return <circle cx={x} cy="65.4" r="2.7" fill="none" stroke={GOLD} strokeWidth="1.1" />;
  if (kind === "jhumka") {
    return (
      <g fill={GOLD}>
        <circle cx={x} cy="62.8" r="1.25" />
        <path d={`M${x - 2.4} 66.6 Q${x} 62.6 ${x + 2.4} 66.6 Z`} />
        <circle cx={x - 1.5} cy="67.5" r="0.55" /><circle cx={x} cy="67.8" r="0.55" /><circle cx={x + 1.5} cy="67.5" r="0.55" />
      </g>
    );
  }
  return <circle cx={x} cy="62.6" r="1.35" fill={GOLD} />;
}

const HIJAB = "M60 21 C79 21 90.5 35 89.5 56 C88.8 71 84.5 81 90 92 C96 99 101 108 103 124 L17 124 C19 108 24 99 30 92 C35.5 81 31.2 71 30.5 56 C29.5 35 41 21 60 21 Z";
const HIJAB_FRAME = "M60 29 C75.5 29 83.6 40.5 83.4 55.5 C83.2 71 73.5 82.6 60 82.6 C46.5 82.6 36.8 71 36.6 55.5 C36.4 40.5 44.5 29 60 29 Z";
const HIJAB_BAND = "M38 52 C36.8 37.5 46.5 29.5 60 29.5 C73.5 29.5 83.2 37.5 82 52 C79.5 43 71 38.6 60 38.6 C49 38.6 40.5 43 38 52 Z";
const DUPATTA = "M32 62 C29 35 43 19.5 60 19.5 C77 19.5 91 35 88 62 L93 106 C88 108 83 107 80 104 L79 66 C80 45 72 33 60 33 C48 33 40 45 41 66 L40 104 C37 107 32 108 27 106 Z";

/**
 * @param {string}  code      language code (picks the guide)
 * @param {number}  size      px
 * @param {string}  mood      "idle" | "happy" | "encourage"
 * @param {boolean} speaking  mouth moves while the guide's voice plays
 * @param {boolean} blink     blink now and then (default: on from 40px up)
 * @param {string}  title     accessible name; without it the face is decorative
 */
export function GuideAvatar({ code, accent = "#5a8f7b", size = 44, mood = "idle", speaking = false, blink, muted = false, title, style, className = "" }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const look = lookFor(code);
  if (!look) return null;

  const [skin, skinShade] = look.skin;
  const hairColor = look.hair?.color || INK;
  const hair = HAIR[look.hair?.style] || HAIR.short;
  const cover = look.cover || null;
  const hijab = cover?.kind === "hijab";
  const dupatta = cover?.kind === "dupatta";
  const garment = look.garment || { color: accent, neck: "round" };
  const neck = garment.neck || "round";
  const deep = lum(skin) < 0.5;
  const lip = mix(skinShade, "#7a2620", deep ? 0.42 : 0.55);
  const browColor = lum(hairColor) > 0.45 ? darken(hairColor, 0.35) : hairColor;
  const tiny = size < 32;
  const doBlink = blink ?? size >= 40;

  const clip = `ga-c-${uid}`, wash = `ga-w-${uid}`, cloth = `ga-g-${uid}`;

  return (
    <span
      className={`guide-avatar ga-mood-${mood}${speaking ? " ga-talking" : ""}${doBlink ? " ga-blink" : ""} ${className}`.trim()}
      style={{ width: size, height: size, flexShrink: 0, display: "inline-flex", opacity: muted ? 0.55 : 1, ...style }}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
      data-mood={mood}
      data-speaking={speaking ? "true" : undefined}
    >
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <clipPath id={clip}><circle cx="60" cy="60" r="60" /></clipPath>
          <radialGradient id={wash} cx="32%" cy="24%" r="85%">
            <stop offset="0%" stopColor={lighten(accent, 0.55)} stopOpacity="0.55" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.22" />
          </radialGradient>
          <linearGradient id={cloth} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighten(garment.color, 0.06)} />
            <stop offset="100%" stopColor={darken(garment.color, 0.18)} />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${clip})`}>
          {/* the wash behind them, in the guide's colour */}
          <circle cx="60" cy="60" r="60" fill="var(--surface-hi, #1c2422)" />
          <circle cx="60" cy="60" r="60" fill={`url(#${wash})`} />

          <g className="ga-figure">
            {/* hair behind the head */}
            {hair.bun && !hijab && <circle cx={hair.bun[0]} cy={hair.bun[1]} r={hair.bun[2]} fill={hairColor} />}
            {hair.back && !hijab && <path d={hair.back} fill={darken(hairColor, 0.12)} />}

            {/* neck, then clothes */}
            <path d="M51.5 70 L51.5 106 L68.5 106 L68.5 70 Z" fill={skin} />
            <ellipse cx="60" cy="79.5" rx="9" ry="4.6" fill={skinShade} opacity="0.75" />
            <path d={BODY[neck] || BODY.round} fill={`url(#${cloth})`} />
            {garment.trim && NECKLINE[neck] && (
              <path d={NECKLINE[neck]} fill="none" stroke={garment.trim} strokeWidth="2.4" strokeLinejoin="round" />
            )}
            {neck === "collar" && (
              <g fill={garment.trim || lighten(garment.color, 0.25)}>
                <path d="M47 90 L55.2 101.5 L59.6 96.4 L51.8 88.6 Z" />
                <path d="M73 90 L64.8 101.5 L60.4 96.4 L68.2 88.6 Z" />
              </g>
            )}
            {neck === "high" && garment.trim && (
              <path d="M60 89 L60 106" stroke={garment.trim} strokeWidth="1.6" />
            )}
            {look.apron && (
              <g fill="#ddd1b8">
                <path d="M46.5 104 L73.5 104 L76 124 L44 124 Z" />
                <path d="M46.5 104 L44.2 90.5 L46.6 90 L49 104 Z" />
                <path d="M73.5 104 L75.8 90.5 L73.4 90 L71 104 Z" />
                <ellipse cx="66" cy="113" rx="3.2" ry="2" fill="#b5653b" opacity="0.55" />
              </g>
            )}
            {/* Meena's braid over her shoulder */}
            {hair.braid && !hijab && hair.braid.map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="4.4" ry="4.1" fill={hairColor} stroke={darken(hairColor, 0.5)} strokeWidth="0.6" />
            ))}
            {hair.locks && !hijab && hair.locks.map((d, i) => <path key={i} d={d} fill={hairColor} />)}

            {/* what covers the hair */}
            {hijab && (
              <g>
                <path d={HIJAB} fill={cover.color} />
                {cover.pattern && [[36, 100], [44, 108], [52, 114], [80, 101], [88, 109], [72, 113], [40, 90], [84, 90]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="1.4" fill={cover.pattern} opacity="0.6" />
                ))}
                <path d="M33 95 C42 99 50 100 56 106" stroke={darken(cover.color, 0.28)} strokeWidth="1.3" fill="none" opacity="0.55" />
                <path d="M87 95 C80 100 72 102 66 108" stroke={darken(cover.color, 0.28)} strokeWidth="1.3" fill="none" opacity="0.55" />
                <path d={HIJAB_FRAME} fill={darken(cover.color, 0.2)} />
              </g>
            )}
            {dupatta && (
              <g>
                <path d={DUPATTA} fill={cover.color} opacity="0.96" />
                <path d="M41 66 C40 45 48 33 60 33 C72 33 80 45 79 66" fill="none" stroke={lighten(cover.color, 0.3)} strokeWidth="1.1" opacity="0.7" />
              </g>
            )}

            {/* ears */}
            {!hijab && (
              <g>
                <ellipse cx="39" cy="57" rx="3.4" ry="5.4" fill={skin} />
                <ellipse cx="81" cy="57" rx="3.4" ry="5.4" fill={skin} />
                {!tiny && <path d="M39.6 54 Q37.6 57 39.8 60" stroke={skinShade} strokeWidth="1" fill="none" />}
                {!tiny && <path d="M80.4 54 Q82.4 57 80.2 60" stroke={skinShade} strokeWidth="1" fill="none" />}
                {look.earrings && <><Earring kind={look.earrings} x={39} /><Earring kind={look.earrings} x={81} /></>}
              </g>
            )}

            {/* the face */}
            <path d={FACE} fill={skin} />
            <path d={FACE_SHADE} fill={skinShade} opacity="0.35" />
            {!tiny && (
              <g fill={deep ? "#c4553f" : "#f07a6a"} opacity={deep ? 0.2 : 0.17}>
                <circle cx="47.2" cy="64.6" r="3.9" />
                <circle cx="72.8" cy="64.6" r="3.9" />
              </g>
            )}
            <Beard kind={look.beard} color={hairColor} />
            {!tiny && <path d="M60.6 58.6 Q58.3 64.3 61.4 65.2" stroke={darken(skinShade, 0.08)} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.9" />}
            <Brows kind={look.brows} mood={mood} color={browColor} />
            <Eyes mood={mood} tiny={tiny} />
            <Mouth mood={mood} speaking={speaking} lip={lip} />
            {look.bindi && !tiny && <circle cx="60" cy="46.4" r="1.25" fill="#a3142a" />}
            {look.nosestud && !tiny && <circle cx="63.4" cy="63.4" r="0.9" fill={GOLD} />}

            {/* hair over the forehead, and whatever sits on it */}
            {!hijab && hair.front && <path d={hair.front} fill={hairColor} />}
            {!hijab && hair.part && !tiny && <path d={hair.part} stroke={darken(hairColor, 0.55)} strokeWidth="1" fill="none" opacity="0.8" />}
            {hijab && <path d={HIJAB_BAND} fill={cover.color} />}
            {cover?.kind === "fila" && (
              <g>
                <path d="M37.5 47 C36.5 31 47 22.5 61 22.5 C74 22.5 84 30 83 45 C76 41 66 39.5 58 40 C50 40.5 43 43 37.5 47 Z" fill={cover.color} />
                <path d="M60.5 22.8 C68 17.5 80 18.5 86.5 26 C88.5 29 88 33 85.5 35 C82 30 72 25 60.5 22.8 Z" fill={darken(cover.color, 0.18)} />
                {cover.pattern && <path d="M40.5 44.2 C50 39.6 70 38.2 81.6 41.6" stroke={cover.pattern} strokeWidth="1.4" fill="none" />}
                {cover.pattern && <path d="M39.6 39.5 C50 34 70 32.5 82.6 36.5" stroke={cover.pattern} strokeWidth="0.9" fill="none" opacity="0.7" />}
              </g>
            )}
            {look.jasmine && !hijab && [[82.5, 44], [84.8, 49], [85.8, 54.2], [85.6, 59.4], [84.4, 64.4], [82.4, 69]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.15" fill="#fbf6e6" stroke="#e1d3ae" strokeWidth="0.5" />
            ))}
            {look.headphones && (
              <g>
                <path d="M36.2 57 C32.5 25 87.5 25 83.8 57" stroke="#2a2a2e" strokeWidth="3.4" fill="none" strokeLinecap="round" />
                <rect x="31.5" y="49" width="8.6" height="15.5" rx="3.8" fill="#2f2f34" />
                <rect x="79.9" y="49" width="8.6" height="15.5" rx="3.8" fill="#2f2f34" />
                <rect x="33.4" y="52" width="2" height="9.5" rx="1" fill={garment.color} />
                <rect x="84.6" y="52" width="2" height="9.5" rx="1" fill={garment.color} />
              </g>
            )}
            {look.glasses === "round" && (
              <g stroke="#2a2320" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.1">
                <circle cx="51.5" cy="56" r="6.2" />
                <circle cx="68.5" cy="56" r="6.2" />
                <path d="M57.7 55.4 Q60 53.8 62.3 55.4" fill="none" />
                <path d="M45.3 55 L39.5 53.6 M74.7 55 L80.5 53.6" fill="none" />
              </g>
            )}
            {look.glasses === "rect" && (
              <g stroke="#2a2320" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.1">
                <rect x="44.6" y="51.6" width="13.2" height="9.4" rx="2.6" />
                <rect x="62.2" y="51.6" width="13.2" height="9.4" rx="2.6" />
                <path d="M57.8 55.4 Q60 54 62.2 55.4" fill="none" />
                <path d="M44.6 54.6 L39.5 53.6 M75.4 54.6 L80.5 53.6" fill="none" />
              </g>
            )}
          </g>
        </g>
        <circle cx="60" cy="60" r="59.3" fill="none" stroke={accent} strokeOpacity="0.45" strokeWidth="1.4" />
      </svg>
    </span>
  );
}
