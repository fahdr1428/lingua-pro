// =============================================================================
// test-markdown-render.mjs (v104.4) — *italic* markdown must not leave its
// asterisks on the page.
//
// WHAT THIS EXISTS FOR
//
// grammar_part1/2/3.js and explain.js's SPECIAL_CASES are hand-authored prose
// that uses **bold** to name the grammatical point and *italic* to set off an
// embedded native-script or romanised example inline in an English sentence —
// standard editorial markup, used 41 times across German, Turkish, Persian,
// Punjabi, Tamil, Malayalam, Somali, Indonesian, Tagalog, Nigerian Pidgin,
// Spanish and French. Both places this content is rendered — GrammarMoment's
// boldify() and the answer-explanation splitter, both in Lesson.jsx —
// implemented **bold** only. Every *italic* span rendered with its asterisks
// left on, literally, in production: "*میں روٹی کھاندا آں*" with the stars
// still there, on every language that used the convention.
//
// PROVEN CAPABLE OF FAILING: reverting boldify() to `/\*\*(.+?)\*\*/g` only
// (dropping the `|\*(.+?)\*` alternative) makes this fail with exactly the
// finding below; so does reverting the explanation splitter's regex the same
// way.
//
//   npm run test-markdown-render
// =============================================================================

import { readFileSync } from "node:fs";

const problems = [];

// ---------------------------------------------------------------------------
// 1. The two renderers still implement *italic*, not just **bold**.
// ---------------------------------------------------------------------------
const lessonSrc = readFileSync("src/screens/Lesson.jsx", "utf8");

const boldifyMatch = lessonSrc.match(/function boldify\(text\)\s*\{[\s\S]{0,400}?\n  \}/);
if (!boldifyMatch) {
  problems.push("could not find boldify() in Lesson.jsx — this check proved nothing");
} else if (!boldifyMatch[0].includes("|\\*(.+?)\\*")) {
  problems.push(
    `boldify() no longer matches single-asterisk *italic* spans — it only handles **bold**, so every ` +
    `*embedded native-script example* in grammar_part*.js will render with its asterisks left on`
  );
}

const splitterMatch = lessonSrc.match(/exp\.body\.split\([^)]*\)/);
if (!splitterMatch) {
  problems.push("could not find the exp.body.split(...) explanation renderer in Lesson.jsx — this check proved nothing");
} else if (!splitterMatch[0].includes("|\\*[^*]+\\*")) {
  problems.push(
    `the answer-explanation splitter's regex no longer matches single-asterisk *italic* spans — SPECIAL_CASES entries ` +
    `like "Soy→Estoy" and "Le→La" in explain.js will render with their asterisks left on`
  );
}

// ---------------------------------------------------------------------------
// 2. The content that motivated this still exists and is still balanced —
//    guards against someone silently stripping the markup instead of fixing
//    the renderer, which would make check #1 pass for the wrong reason.
// ---------------------------------------------------------------------------
const dataFiles = [
  "src/data/grammar_part1.js",
  "src/data/grammar_part2.js",
  "src/data/grammar_part3.js",
  "src/engine/explain.js",
];

let italicSpans = 0;
for (const f of dataFiles) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return;
    const singleStars = (line.match(/(?<!\*)\*(?!\*)/g) || []).length;
    if (singleStars === 0) return;
    italicSpans += Math.floor(singleStars / 2);
    if (singleStars % 2 !== 0) {
      problems.push(`${f}:${i + 1} has an odd number of single asterisks (${singleStars}) — an *italic* span is unclosed: ${trimmed.slice(0, 120)}`);
    }
  });
}
if (italicSpans === 0) {
  problems.push("no *italic* spans found in grammar/explanation content at all — this check's premise no longer holds, verify by hand");
}

console.log(`\n  markdown rendering: ${italicSpans} *italic* spans found in content, checked against both renderers`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems) console.log(`   ${p}`);
  console.log();
  process.exit(1);
}
console.log("  ✓ boldify() and the explanation splitter both handle **bold** and *italic*, and the content is balanced\n");
