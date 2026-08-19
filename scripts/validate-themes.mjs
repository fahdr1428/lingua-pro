// =============================================================================
// validate-themes.mjs (v80) — every theme must define every colour.
//
// THE BUG THIS EXISTS TO PREVENT. `--ink` is used 82 times across the app and
// `--root` 14 more, and no theme overrode either. Both kept the value written
// for the cream palette, so on the Dark theme they painted near-black text on a
// near-black background: 1.2:1 against a required 4.5:1. Not "low contrast" —
// invisible. Anyone who chose Dark got an app they could not read, and nothing
// in the codebase said a word about it, because every individual rule was
// correct and the fallback chain worked exactly as CSS says it should.
//
// That is the failure mode of theming by fallback: a missing override is silent
// and looks fine in whichever theme it was authored against. So the rule is now
// explicit — if `:root` defines a colour, EVERY theme must give it a value.
//
// It also catches the other half of the same problem: a colour hardcoded in the
// stylesheet, which no theme can override at all.
// =============================================================================

import { readFileSync } from "node:fs";

const css = readFileSync("src/index.css", "utf8");
const { THEMES } = await import("../src/ui/themes.js");

const errors = [];
const warnings = [];

// ---- 1. every colour token in :root is themed everywhere --------------------
const rootBlock = css.slice(css.indexOf(":root {"), css.indexOf("\n}", css.indexOf(":root {")));
const declared = [...rootBlock.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]);

// A token is a colour if its value looks like one. Spacing, radii, easings and
// shadows are deliberately not required to be themed.
const isColour = (v) => /^#[0-9a-f]{3,8}$/i.test(v) || /^(rgb|hsl)a?\(/i.test(v);
const colourTokens = declared.filter(([, v]) => isColour(v)).map(([k]) => k);

for (const [name, theme] of Object.entries(THEMES)) {
  const missing = colourTokens.filter((t) => !(t in theme.vars));
  if (missing.length) {
    errors.push(
      `theme "${name}" never defines ${missing.join(", ")} — it will inherit the ` +
      `:root value, which was written for a different palette`
    );
  }
}

// ---- 2. nothing paints a hardcoded colour that a theme can't reach ----------
// Scoped to backgrounds and text, where an unthemed colour is a readability
// failure rather than a cosmetic one. Borders and shadows are left alone.
const HARDCODED = /(?:^|\s)(background|background-color|color)\s*:\s*(#[0-9a-f]{3,8}|rgba?\([^)]*\)|white|black)\s*(?:!important)?\s*;/gi;
// Legitimate exceptions: pure white/black ON a known-coloured fill, and the
// overlays that are the same on every theme by design.
const ALLOW = new Set(["#fff", "#ffffff", "#000", "#000000", "white", "black"]);

for (const m of css.matchAll(HARDCODED)) {
  const value = m[2].toLowerCase();
  if (ALLOW.has(value)) continue;
  if (/rgba\([^)]*,\s*0?\.\d+\s*\)/.test(value) && /^rgba\(\s*0\s*,\s*0\s*,\s*0/.test(value)) continue; // black scrims
  const line = css.slice(0, m.index).split("\n").length;
  warnings.push(`src/index.css:${line} paints ${m[1]}: ${m[2]} directly — no theme can change it`);
}

// ---- report -----------------------------------------------------------------
console.log(`\n  ${Object.keys(THEMES).length} themes · ${colourTokens.length} colour tokens · ${errors.length} errors · ${warnings.length} warnings`);
for (const w of warnings.slice(0, 12)) console.log(`  [!] ${w}`);
if (warnings.length > 12) console.log(`  [!] …and ${warnings.length - 12} more`);
for (const e of errors) console.log(`  ERROR ${e}`);
console.log("");

process.exit(errors.length ? 1 : 0);
