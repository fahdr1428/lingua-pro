// =============================================================================
// validate-sentence-lab.mjs (v98) — the Sentence Lab, checked against what the
// learner actually sees.
//
// The Lab is the one place in the app where a learner assembles a sentence
// themselves rather than recognising one. That makes a bad pattern worse than a
// bad flashcard: they don't just fail to learn a phrase, they practise a wrong
// rule until it's automatic.
//
// The subtle one this exists to catch: SentenceLab.jsx line 42 renders
//
//     {isNonLatin ? chunk.translit : chunk.text}
//
// so in Chinese, Tamil, Malayalam, Punjabi, Persian, Arabic, Hindi, Urdu,
// Bengali, Japanese and Korean the DRAGGABLE TILE IS THE ROMANISATION. A chunk
// with a missing translit is not a cosmetic flaw there — it is a blank tile the
// learner is asked to place, and reading the source file will never show you
// that, because the source file has a perfectly good `text`.
//
//   npm run validate-sentence-lab
// =============================================================================

import { readFileSync } from "node:fs";
import { SENTENCE_PATTERNS, ROLE_COLORS, hasSentencePatterns, getPatternForDrop } from "../src/data/sentencePatterns.js";
import { isNonLatinScript } from "../src/data/registry.js";

// Which writing system a string is in, by the block its letters fall in. Crude
// on purpose — it only has to separate scripts that look nothing alike.
//
// This exists because the Punjabi ladder was first drafted in GURMUKHI, and
// this pack writes Punjabi in SHAHMUKHI (Perso-Arabic), as it is written in
// Pakistan. Every other screen shows the learner Shahmukhi; the Lab would have
// switched to a script they had never been shown, mid-course, and nothing in
// the app would have complained. Punjabi is written in both, so neither script
// is "wrong" — being a different one from the rest of the pack is.
const BLOCKS = [
  ["Arabic",     /[؀-ۿݐ-ݿﭐ-﷿]/],
  ["Gurmukhi",   /[਀-੿]/],
  ["Devanagari", /[ऀ-ॿ]/],
  ["Bengali",    /[ঀ-৿]/],
  ["Tamil",      /[஀-௿]/],
  ["Malayalam",  /[ഀ-ൿ]/],
  ["Hangul",     /[가-힯ᄀ-ᇿ㄰-㆏]/],
  ["Kana",       /[぀-ヿ]/],
  ["Han",        /[一-鿿]/],
];

function scriptsIn(text) {
  const found = new Set();
  for (const [name, re] of BLOCKS) if (re.test(text)) found.add(name);
  return found;
}

/** The scripts a language pack actually teaches, from its own vocabulary. */
function packScripts(code) {
  try {
    const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
    const found = new Set();
    for (const v of pack.vocab.slice(0, 200)) for (const s of scriptsIn(v.lemma || "")) found.add(s);
    return found;
  } catch {
    return null;
  }
}

const errors = [];
const warnings = [];
const err = (lang, msg) => errors.push(`${lang}: ${msg}`);
const warn = (lang, msg) => warnings.push(`${lang}: ${msg}`);

const ROLES = new Set(Object.keys(ROLE_COLORS));

/** Every step a learner can be shown, flattened: the base, its extend, its twist. */
function steps(pattern) {
  const out = [{ kind: "base", ...pattern }];
  if (pattern.extend) out.push({ kind: "extend", ...pattern.extend });
  if (pattern.twist) out.push({ kind: "twist", ...pattern.twist });
  return out;
}

let patternCount = 0, chunkCount = 0;

for (const [lang, ladder] of Object.entries(SENTENCE_PATTERNS)) {
  const nonLatin = isNonLatinScript(lang);
  const taught = packScripts(lang);
  if (taught === null) err(lang, "has patterns but no language pack");

  if (!Array.isArray(ladder) || ladder.length === 0) {
    err(lang, "declared but empty — hasSentencePatterns() will hide the Lab");
    continue;
  }

  // The ladder is meant to climb. getPatternForDrop walks it in array order, so
  // levels out of order means a learner meets the hard rung first.
  const levels = ladder.map((p) => p.level);
  for (let i = 1; i < levels.length; i++) {
    if (!(levels[i] > levels[i - 1])) {
      err(lang, `level ${levels[i]} follows level ${levels[i - 1]} — the ladder doesn't climb`);
    }
  }

  ladder.forEach((pattern, pi) => {
    patternCount++;
    const at = `pattern ${pi + 1} (level ${pattern.level})`;

    if (!pattern.skill || !String(pattern.skill).trim()) err(lang, `${at}: no skill — the header renders empty`);

    for (const step of steps(pattern)) {
      const where = `${at} ${step.kind}`;

      if (!Array.isArray(step.chunks) || step.chunks.length === 0) {
        err(lang, `${where}: no chunks to build`);
        continue;
      }
      if (!step.translation || !String(step.translation).trim()) {
        err(lang, `${where}: no translation — the learner is asked to build a meaning that isn't shown`);
      }
      if (step.kind === "twist" && !String(step.prompt || "").trim()) {
        err(lang, `${where}: no prompt — the twist step asks nothing`);
      }

      step.chunks.forEach((c, ci) => {
        chunkCount++;
        const tile = `${where} chunk ${ci + 1}`;

        if (!String(c.text || "").trim()) err(lang, `${tile}: empty text`);
        if (!String(c.gloss || "").trim()) err(lang, `${tile}: no gloss — the tile has no caption`);

        if (!ROLES.has(c.role)) {
          // Not fatal in the UI (it falls back to particle) but the colour and
          // the legend then lie about the grammar.
          err(lang, `${tile}: role "${c.role}" is not one of ${[...ROLES].join(", ")}`);
        }

        // THE ONE THAT MATTERS. In a non-Latin language the tile IS the translit.
        if (nonLatin && !String(c.translit || "").trim()) {
          err(lang, `${tile}: no translit — this language renders the romanisation on the tile, so the learner drags a blank`);
        }

        // A translit identical to the native text means someone pasted the
        // script into the wrong field; the tile then shows script the learner
        // was told they wouldn't have to read yet.
        if (nonLatin && c.translit && c.translit === c.text) {
          err(lang, `${tile}: translit is a copy of the native text`);
        }

        // The script has to be the one the rest of the course teaches.
        if (taught && taught.size) {
          for (const s of scriptsIn(c.text)) {
            if (!taught.has(s)) {
              err(lang, `${tile}: written in ${s}, but this pack teaches ${[...taught].join("/")} — "${c.text}"`);
            }
          }
        }
      });

      // Two tiles reading the same thing are indistinguishable once shuffled.
      const shown = step.chunks.map((c) => (nonLatin ? c.translit : c.text));
      const dupes = shown.filter((t, i) => shown.indexOf(t) !== i);
      if (dupes.length) warn(lang, `${where}: two tiles both read "${dupes[0]}" — indistinguishable once shuffled`);
    }

    // A twist that rebuilds the sentence the learner just built teaches nothing.
    if (pattern.twist) {
      const base = pattern.chunks.map((c) => c.text).join(" ");
      const twist = pattern.twist.chunks.map((c) => c.text).join(" ");
      if (base === twist) err(lang, `${at}: the twist is the same sentence as the base`);
    }
    if (pattern.extend) {
      const base = pattern.chunks.map((c) => c.text).join(" ");
      const ext = pattern.extend.chunks.map((c) => c.text).join(" ");
      if (base === ext) err(lang, `${at}: the extend step adds nothing`);
      else if (ext.length < base.length) warn(lang, `${at}: the extend step is shorter than the base`);
    }
  });

  // The gate the screen actually consults, and the accessor it actually calls.
  if (!hasSentencePatterns(lang)) err(lang, "hasSentencePatterns() says no — the Lab will never open");
  for (let drop = 1; drop <= ladder.length + 2; drop++) {
    if (!getPatternForDrop(lang, drop)) err(lang, `getPatternForDrop(drop ${drop}) returned nothing`);
  }
}

const langs = Object.keys(SENTENCE_PATTERNS);
console.log(`\n  sentence lab: ${langs.length} languages · ${patternCount} patterns · ${chunkCount} tiles`);
console.log(`  ${langs.join(" ")}`);

if (warnings.length) {
  console.log(`\n  ${warnings.length} warning(s)`);
  for (const w of warnings.slice(0, 20)) console.log(`    ~ ${w}`);
}

if (errors.length) {
  console.log(`\n  ${errors.length} error(s)`);
  for (const e of errors.slice(0, 40)) console.log(`    ✗ ${e}`);
  console.log("");
  process.exit(1);
}

console.log("\n  every tile has something on it and every ladder climbs · 0 errors\n");
