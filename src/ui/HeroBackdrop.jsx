// v56 — rotating hand-painted heritage backdrop. Three language-neutral SVG
// scenes cross-fade behind the home screen: mountain valley at dusk, an old
// city skyline, a lantern-lit night. Painted in code: no photos, no licensing,
// instant load. Respects prefers-reduced-motion (holds scene 1).
import React from "react";

const scenes = [
  // 1 — mountain valley at dusk
  <svg key="m" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sk1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#f6d8b8"/><stop offset="100%" stopColor="#e9b98d"/>
    </linearGradient></defs>
    <rect width="800" height="500" fill="url(#sk1)"/>
    <circle cx="600" cy="120" r="46" fill="#fff3dd" opacity="0.9"/>
    <path d="M0 320 L160 170 L300 320 Z" fill="#b98a63" opacity="0.85"/>
    <path d="M120 340 L330 130 L520 340 Z" fill="#9a6f4e" opacity="0.9"/>
    <path d="M400 340 L590 180 L800 340 Z" fill="#845c3f" opacity="0.85"/>
    <path d="M300 168 L330 130 L365 172 L340 186 Z" fill="#fff6ea"/>
    <rect y="330" width="800" height="170" fill="#6f4f36"/>
  </svg>,
  // 2 — old city skyline with domes
  <svg key="c" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sk2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#dfe8ea"/><stop offset="100%" stopColor="#c3d4d8"/>
    </linearGradient></defs>
    <rect width="800" height="500" fill="url(#sk2)"/>
    <ellipse cx="230" cy="270" rx="70" ry="58" fill="#7d99a3"/>
    <rect x="160" y="270" width="140" height="120" fill="#7d99a3"/>
    <rect x="330" y="200" width="18" height="190" fill="#68858f"/>
    <rect x="452" y="200" width="18" height="190" fill="#68858f"/>
    <ellipse cx="400" cy="255" rx="55" ry="46" fill="#8fa9b2"/>
    <rect x="345" y="255" width="110" height="135" fill="#8fa9b2"/>
    <rect x="520" y="240" width="180" height="150" fill="#7d99a3"/>
    <rect y="386" width="800" height="114" fill="#5d7680"/>
  </svg>,
  // 3 — lantern night
  <svg key="l" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sk3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3a3f5c"/><stop offset="100%" stopColor="#57536e"/>
    </linearGradient></defs>
    <rect width="800" height="500" fill="url(#sk3)"/>
    <circle cx="150" cy="150" r="26" fill="#ffd98a" opacity="0.95"/>
    <circle cx="150" cy="150" r="48" fill="#ffd98a" opacity="0.18"/>
    <circle cx="420" cy="110" r="20" fill="#ffc46b" opacity="0.95"/>
    <circle cx="420" cy="110" r="40" fill="#ffc46b" opacity="0.16"/>
    <circle cx="660" cy="180" r="24" fill="#ffdf9e" opacity="0.95"/>
    <circle cx="660" cy="180" r="44" fill="#ffdf9e" opacity="0.17"/>
    <rect y="380" width="800" height="120" fill="#2d3049"/>
  </svg>,
];

export function HeroBackdrop() {
  return (
    <div className="hero-backdrop" aria-hidden="true">
      {scenes.map((s, i) => (
        <div key={i} className={`hero-scene hero-scene-${i + 1}`}>{s}</div>
      ))}
      <div className="hero-veil" />
    </div>
  );
}
