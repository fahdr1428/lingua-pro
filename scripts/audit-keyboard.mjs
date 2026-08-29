// =============================================================================
// audit-keyboard.mjs (v94) — everything you can tap, you must be able to reach.
//
// audit-a11y.mjs walks the rendered app and checks names and contrast.
// audit-interface.mjs checks the Web Interface Guidelines. Neither catches the
// oldest bug in an app built from inline-styled divs:
//
//     <div onClick={...}>  is invisible to a keyboard and to a screen reader.
//
// It has no tab stop, no role, no name, and no Enter/Space handling. A mouse
// user never notices. Someone using a keyboard, a switch, or a screen reader
// simply cannot use the control at all.
//
// Ten of these were shipping, and two of them were the FLASHCARD — the single
// most-used interaction in the app, the thing a lesson opens with. It flipped
// on a click on a bare <div>, so the whole "see the word, then the meaning"
// mechanic was mouse-only. (There was a window-level keydown listener for
// Space, which is not the same thing: nothing is focusable, nothing is
// announced, and a screen-reader user has no way to know the card exists.)
//
// The rule: if it has onClick and it isn't a <button> or <a>, it needs
// role + tabIndex + a keyboard handler. This fails the build otherwise.
//
//   npm run audit-keyboard
// =============================================================================

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const errors = [], notes = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.jsx$/.test(p)) out.push(p);
  }
  return out;
}

const files = walk("src");
let interactive = 0;

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");

  for (let i = 0; i < lines.length; i++) {
    // Opening tag of a non-interactive element.
    if (!/^\s*<(div|span|li|section|article|td|tr)\b/.test(lines[i])) continue;

    // Read forward to the end of the opening tag — these are multi-line and
    // heavily inline-styled, so the attributes can be twenty lines down.
    let tag = "", depth = 0, done = false;
    for (let j = i; j < Math.min(i + 30, lines.length) && !done; j++) {
      let piece = lines[j];
      for (let k = 0; k < piece.length; k++) {
        const ch = piece[k];
        if (ch === "{") depth++;
        else if (ch === "}") depth--;
        // The first > outside a JSX expression ENDS the opening tag. Anything
        // after it is a child — a nested <button> there is not this element's
        // business, and reading it made the audit blame the wrong element.
        else if (ch === ">" && depth <= 0 && piece[k - 1] !== "=") {
          piece = piece.slice(0, k + 1); done = true; break;
        }
      }
      tag += piece + " ";
    }

    if (!/\bonClick=/.test(tag)) continue;
    interactive++;

    // A wrapper whose only job is to stop a click reaching the parent isn't a
    // control — it's plumbing, and giving it a tab stop would be worse.
    if (/onClick=\{\s*\(e\)\s*=>\s*e\.stopPropagation\(\)\s*\}/.test(tag)) continue;

    // A MODAL BACKDROP is the one case where a tab stop is the wrong answer.
    // Click-to-dismiss is a mouse convenience layered on top of a dialog that
    // must already be dismissible another way; making the backdrop focusable
    // would put a nameless stop between the user and the dialog's own controls.
    // The keyboard equivalent is Escape, so require THAT instead.
    if (/position:\s*["']fixed["']/.test(tag) && /inset:\s*0/.test(tag)) {
      const rest = lines.slice(Math.max(0, i - 40), i + 5).join("\n");
      if (!/["']Escape["']/.test(rest)) {
        errors.push(
          `${file}:${i + 1} — a click-to-dismiss overlay with no Escape key. ` +
          `A backdrop must not be a tab stop, so Escape is the only way a keyboard user can close this.`
        );
      } else {
        notes.push(`${file}:${i + 1} — overlay dismisses on Escape (backdrops are deliberately not tab stops)`);
      }
      continue;
    }

    const hasRole = /\brole=/.test(tag);
    const hasTab = /\btabIndex=/.test(tag);
    const hasKeys = /\bonKeyDown=|\bonKeyUp=|\bonKeyPress=/.test(tag);

    const missing = [
      !hasRole && "role",
      !hasTab && "tabIndex",
      !hasKeys && "a key handler",
    ].filter(Boolean);

    if (missing.length) {
      const el = tag.trim().slice(0, 40).replace(/\s+/g, " ");
      errors.push(
        `${file}:${i + 1} — clickable ${el}… has no ${missing.join(", ")}. ` +
        `A keyboard cannot reach it and a screen reader cannot name it.`
      );
    }
  }
}

console.log("");
console.log(`  [ok] ${files.length} components scanned · ${interactive} clickable non-button elements found`);
for (const n of notes) console.log("  [ok] " + n);

if (errors.length) {
  console.error(`\n  ${errors.length} unreachable control(s):`);
  for (const e of errors) console.error("   ✗ " + e);
  console.error("");
  process.exit(1);
}
console.log(`\n  every clickable element is reachable by keyboard · 0 errors\n`);
