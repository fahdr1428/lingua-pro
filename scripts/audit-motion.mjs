// =============================================================================
// audit-motion.mjs (v96) — motion that is cheap, and motion that can be turned off.
//
// Two things go wrong with UI motion, and neither is visible by looking at it
// on a fast machine:
//
//   1. ANIMATING A LAYOUT PROPERTY. `transition: width` re-runs layout on every
//      frame. `transform` and `opacity` are handed to the compositor and cost
//      almost nothing. Three progress bars were animating width.
//
//   2. MOTION THAT IGNORES prefers-reduced-motion. The app had fourteen
//      INFINITE animations — a bobbing tutor, a pulsing mic, a breathing seal,
//      a blinking caret — and the reduced-motion block named six selectors.
//      Every new animation had to remember to opt out, and none of them did.
//      For someone with a vestibular disorder that setting is not a preference,
//      and endless motion is the exact trigger.
//
// The fix for (2) is a blanket rule rather than a list, because a list is
// something you have to remember. This checks the blanket rule is still there.
//
//   npm run audit-motion
// =============================================================================

import { readFileSync } from "node:fs";

const css = readFileSync("src/index.css", "utf8");
const errors = [], warnings = [], notes = [];

// --- 1. layout-animating transitions ---------------------------------------
const LAYOUT_PROPS = /\b(width|height|top|left|right|bottom|margin|padding)\b/;
const lines = css.split("\n");
lines.forEach((line, i) => {
  const m = line.match(/transition:\s*([^;]+);/);
  if (!m) return;
  // Split the shorthand into its comma-separated parts and look at the property
  // each one names, so `transition: transform 200ms` isn't flagged for "form".
  for (const part of m[1].split(",")) {
    const prop = part.trim().split(/\s+/)[0];
    if (LAYOUT_PROPS.test(prop)) {
      errors.push(
        `src/index.css:${i + 1} — transitions "${prop}", which runs layout on every frame. ` +
        `Use transform (translate/scale) so the compositor can do it instead.`
      );
    }
  }
});

// --- 2. reduced motion, as a blanket rule ----------------------------------
const blanket = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\*,\s*\*::before,\s*\*::after\s*\{[^}]*animation-duration:\s*0\.01ms\s*!important/s;
if (!blanket.test(css)) {
  errors.push(
    `src/index.css — no blanket prefers-reduced-motion rule. ` +
    `Naming individual selectors does not hold: the app has ${(css.match(/animation:[^;]*infinite/g) || []).length} ` +
    `infinite animations and every new one has to remember to opt out.`
  );
} else {
  const infinite = (css.match(/animation:[^;]*infinite/g) || []).length;
  notes.push(`blanket reduced-motion rule present — covers all ${infinite} infinite animations`);
}

// --- 3. animations long enough to feel slow --------------------------------
for (const m of css.matchAll(/animation:\s*[\w-]+\s+(\d+)ms/g)) {
  const ms = Number(m[1]);
  if (ms > 600) warnings.push(`an animation runs ${ms}ms — over ~600ms a transition starts to feel like waiting`);
}

// --- 4. will-change left on permanently ------------------------------------
for (const m of css.matchAll(/will-change:\s*([^;]+);/g)) {
  if (!/auto/.test(m[1])) {
    warnings.push(`will-change: ${m[1].trim()} — pins a compositor layer for the life of the element; set it only while animating`);
  }
}

console.log("");
for (const n of notes) console.log("  [ok] " + n);
console.log(`  [ok] ${lines.length} lines of CSS scanned`);

if (warnings.length) {
  console.log(`\n  ${warnings.length} warning(s):`);
  for (const w of warnings) console.log("   ! " + w);
}
if (errors.length) {
  console.error(`\n  ${errors.length} error(s):`);
  for (const e of errors) console.error("   ✗ " + e);
  console.error("");
  process.exit(1);
}
console.log(`\n  motion is composited and can be switched off · 0 errors\n`);
