// =============================================================================
// make-icons.mjs (v78) — generate the small marks the UI actually renders.
//
// The app was shipping a 48KB PNG to draw a 22px logo in the bottom nav, on
// every screen. Lighthouse called it out as ~50KB of wasted image delivery, and
// it's on the critical path for a phone on a slow connection.
//
// This writes WebP at the sizes the CSS asks for. WebP because it's ~70% smaller
// than PNG at this size and has been supported everywhere for years; the PNGs
// stay on disk as the favicon and apple-touch-icon, which have to be PNG.
//
// Run: node scripts/make-icons.mjs
// =============================================================================

import sharp from "sharp";
import { statSync } from "node:fs";

// [source, output, rendered size] — 2× the CSS size, for retina.
const JOBS = [
  ["public/zaban-mark-transparent.png", "public/mark-64.webp", 64],
  ["public/zaban-mark-transparent.png", "public/mark-160.webp", 160],
  ["public/zaban-logo.png", "public/logo-560.webp", 560],
];

for (const [src, out, size] of JOBS) {
  await sharp(src).resize({ width: size, withoutEnlargement: true }).webp({ quality: 88 }).toFile(out);
  const before = statSync(src).size, after = statSync(out).size;
  console.log(
    `${out.padEnd(28)} ${String(size).padStart(4)}px  ` +
    `${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(1)}KB  ` +
    `(-${Math.round((1 - after / before) * 100)}%)`
  );
}
