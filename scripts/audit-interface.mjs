// =============================================================================
// audit-interface.mjs (v84) — the Web Interface Guidelines, as a script.
//
// Vercel's Web Interface Guidelines are a good list. A good list read once is
// worth very little: it catches what is wrong on the day you read it and
// nothing that arrives afterwards. So the rules that can be checked mechanically
// are checked mechanically, and this runs in `npm run check` alongside the
// contrast audit.
//
// WHAT THIS DELIBERATELY DOES NOT DO. It does not flag anything it cannot be
// confident about. The v80 accessibility audit taught this the hard way: it
// reported gradients as 1.08:1 contrast failures and skipped every
// semi-transparent surface, and the noise hid seven real failures on the Profile
// screen. A tool that cries wolf gets ignored, and then it is worse than no tool
// at all. Every rule below either has no plausible false positive, or is scoped
// tightly enough that the exceptions are enumerated in the code.
//
//   npm run audit-interface
//
// Source: https://github.com/vercel-labs/web-interface-guidelines
// =============================================================================

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const findings = [];
const note = (file, line, msg) => findings.push({ file, line, msg });

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk("src").filter((f) => /\.(jsx?|css)$/.test(f));
const jsx = files.filter((f) => f.endsWith(".jsx"));
const css = files.filter((f) => f.endsWith(".css"));
const read = (f) => readFileSync(f, "utf8");
const lines = (f) => read(f).split("\n");
const rel = (f) => relative(".", f);

// The attributes of a JSX tag opened on `start`, as one string.
//
// Naive `slice(0, indexOf(">"))` does not work and produced a silent false
// negative in the first version of this file: an arrow function in an onKeyDown
// handler contains `>`, so the tag was truncated three lines early and an
// autoFocus below it was never seen. Walk to the first line that actually
// closes the tag instead.
function tagAttrs(src, start, max = 25) {
  const out = [];
  for (let i = start; i < Math.min(src.length, start + max); i++) {
    const l = src[i];
    out.push(l);
    const closing = l.replace(/=>/g, "  ");     // blank out arrows, keep offsets
    if (i > start && /^\s*\/?>/.test(l)) break;
    if (/\/>\s*$/.test(closing) || /[^=]>\s*$/.test(closing)) break;
  }
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// CSS rules
// ---------------------------------------------------------------------------
// Blank out comment bodies while preserving line numbers. Without this the
// audit reads its own explanations: the comment describing why an `outline:
// none` was removed contains the words "outline: none", so the rule fired on
// the note saying it had been fixed.
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

for (const f of css) {
  const src = stripComments(read(f)).split("\n");

  src.forEach((l, i) => {
    // `transition: all` animates every property including layout ones, so a
    // change to width or top gets animated on the main thread. List them.
    if (/transition:\s*all\b/.test(l)) {
      note(rel(f), i + 1, "transition: all — list the properties; `all` animates layout too");
    }
    // Killing the outline without putting a focus indicator back means a
    // keyboard user cannot see where they are. The one legitimate use is
    // suppressing the ring for MOUSE clicks via :focus:not(:focus-visible).
    if (/outline:\s*none/.test(l) && !/:focus:not\(:focus-visible\)/.test(src[i - 1] + l)) {
      const selector = [...src.slice(Math.max(0, i - 6), i + 1)].reverse()
        .find((s) => /^\s*[.#a-zA-Z\[][^{]*\{/.test(s)) || "";
      if (!/:focus:not\(:focus-visible\)/.test(selector)) {
        note(rel(f), i + 1, `outline: none with no focus indicator to replace it (${selector.trim().slice(0, 40)})`);
      }
    }
  });

  const whole = stripComments(read(f));

  // A dark theme with a fixed `color-scheme` gets light scrollbars, light
  // native form controls and a light <select> on a near-black page. This is the
  // same shape of bug as v80's --ink: a global that no theme overrides.
  const cs = whole.match(/color-scheme:\s*([a-z ]+);/);
  // A dark theme is one whose --bg is very dark. Parse the values rather than
  // pattern-matching the source: the first version of this rule looked for
  // `--bg: #0` and never fired, because the value is quoted in a JS object and
  // the quote sat between the colon and the hash.
  const themesSrc = read("src/ui/themes.js");
  const darkThemeExists = [...themesSrc.matchAll(/"--bg":\s*"(#[0-9a-fA-F]{6})"/g)]
    .some((m) => parseInt(m[1].slice(1, 3), 16) < 0x40);
  // ...but a static `color-scheme` in the stylesheet is only a problem if
  // nothing sets it per theme at runtime. This app already does, in
  // applyTheme, and the second version of this rule reported it as a bug
  // anyway — which is the exact failure this file's header warns about, so it
  // is worth having done it once here and fixed it rather than shipping it.
  const setsSchemeAtRuntime = /\.colorScheme\s*=/.test(themesSrc);
  if (cs && !/light dark/.test(cs[1]) && darkThemeExists && !setsSchemeAtRuntime) {
    const ln = whole.slice(0, whole.indexOf(cs[0])).split("\n").length;
    note(rel(f), ln, `color-scheme: ${cs[1].trim()} is fixed, but the app ships a dark theme — native controls and scrollbars stay light on a dark page`);
  }

  // Scroll chaining: flick past the end of a sheet and the page behind it
  // scrolls. Cheap to prevent, invisible until someone notices it feels broken.
  for (const cls of ["sheet", "modal", "drawer", "dialog"]) {
    const re = new RegExp(`^\\.[a-z-]*${cls}[a-z-]*\\s*\\{`, "m");
    if (re.test(whole) && !whole.includes("overscroll-behavior")) {
      note(rel(f), 0, `has .${cls}-like scrollable surfaces but no overscroll-behavior anywhere — scroll chains to the page behind`);
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// index.html
// ---------------------------------------------------------------------------
{
  const html = readFileSync("index.html", "utf8");
  const htmlLines = html.split("\n");

  // Pinch-zoom is how a low-vision user reads anything. Blocking it is a WCAG
  // failure and PageSpeed flags it by name.
  htmlLines.forEach((l, i) => {
    if (/name="viewport"/.test(l) && /(user-scalable\s*=\s*no|maximum-scale\s*=\s*1)/.test(l)) {
      note("index.html", i + 1, "viewport blocks zoom (user-scalable=no / maximum-scale=1)");
    }
  });

  // The browser chrome paints theme-color behind the status bar. If it doesn't
  // match the theme the app actually starts in, a phone shows a band of the
  // wrong colour above the app.
  const tc = html.match(/name="theme-color"\s+content="([^"]+)"/);
  if (tc) {
    const themes = readFileSync("src/ui/themes.js", "utf8");
    // The first --bg in the file is the default (cream) theme's ground.
    const firstBg = themes.match(/"--bg":\s*"([^"]+)"/);
    if (firstBg && firstBg[1].toLowerCase() !== tc[1].toLowerCase()) {
      const ln = html.slice(0, html.indexOf(tc[0])).split("\n").length;
      note("index.html", ln, `theme-color ${tc[1]} does not match the default theme's background ${firstBg[1]}`);
    }
  }
}

// ---------------------------------------------------------------------------
// JSX rules
// ---------------------------------------------------------------------------
for (const f of jsx) {
  const src = lines(f);
  const whole = src.join("\n");

  src.forEach((l, i) => {
    // A div that handles clicks is not focusable, not in the tab order, and
    // does not fire on Enter or Space.
    if (/<(div|span)\b[^>]*\sonClick=/.test(l)) {
      note(rel(f), i + 1, `<${RegExp.$1} onClick> — use <button> so it is focusable and works on Enter/Space`);
    }
    // No dimensions means the page reflows when the image lands.
    if (/<img\b/.test(l)) {
      const close = tagAttrs(src, i);
      if (!/width=/.test(close) || !/height=/.test(close)) {
        note(rel(f), i + 1, "<img> without explicit width/height — causes layout shift");
      }
      if (!/alt=/.test(close)) note(rel(f), i + 1, "<img> without alt");
    }
    // Blocking paste breaks password managers and anyone using a clipboard
    // because typing is hard for them.
    if (/onPaste/.test(l) && /preventDefault/.test(l)) {
      note(rel(f), i + 1, "onPaste + preventDefault — never block paste");
    }
    // A placeholder is not a label: it disappears the moment you type, and
    // screen readers do not reliably announce it.
    if (/<input\b/.test(l)) {
      const tag = tagAttrs(src, i);
      const wrapped = src.slice(Math.max(0, i - 3), i).join("\n").includes("<label");
      const labelled = /aria-label|aria-labelledby|\bid=/.test(tag) || wrapped;
      const isCheckbox = /type="(checkbox|radio)"/.test(tag);
      if (!labelled && !isCheckbox) {
        note(rel(f), i + 1, "<input> with no label, aria-label or wrapping <label> — a placeholder is not a label");
      }
      // autoFocus on a phone opens the keyboard immediately, which covers the
      // thing the learner is meant to be reading.
      // Only UNCONDITIONAL autoFocus. `autoFocus={hasKeyboard}` is the correct
      // shape of this — desktop only — and flagging it would push someone
      // towards deleting a working fix to quieten the tool.
      if (/autoFocus(\s|\/|>|=\{true\})/.test(tag)) {
        note(rel(f), i + 1, "unconditional autoFocus on an input — on a phone this opens the keyboard over the question");
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Cross-cutting: async status with nothing to announce it
// ---------------------------------------------------------------------------
//
// `role="status"` and `role="alert"` carry an implicit live region, and the
// guidelines themselves say to reach for semantic HTML before ARIA — so the
// first version of this rule, which looked for the literal string `aria-live`,
// reported the offline bar as unannounced when it was already correct. Check
// for either, and check the ONE region that matters rather than the codebase in
// general: whether the learner is told they got it right.
{
  const lesson = read("src/screens/Lesson.jsx");
  const feedbackBlock = lesson.slice(lesson.indexOf("{/* Feedback */}"), lesson.indexOf("{/* Feedback */}") + 1200);
  const announced = /aria-live|role="(status|alert)"/.test(feedbackBlock);
  if (!announced) {
    note("src/screens/Lesson.jsx", lesson.slice(0, lesson.indexOf("{/* Feedback */}")).split("\n").length,
      "answer feedback is not a live region — a screen reader user is never told whether they got it right");
  }
}

// ---------------------------------------------------------------------------
const byFile = new Map();
for (const x of findings) {
  if (!byFile.has(x.file)) byFile.set(x.file, []);
  byFile.get(x.file).push(x);
}

console.log("\n=== web interface guidelines ===\n");
for (const [file, items] of [...byFile].sort()) {
  console.log(`  ${file}`);
  for (const it of items.sort((a, b) => a.line - b.line)) {
    console.log(`    ${file}:${it.line} — ${it.msg}`);
  }
  console.log("");
}
console.log(`  ${findings.length} finding${findings.length === 1 ? "" : "s"}\n`);
process.exit(findings.length ? 1 : 0);
