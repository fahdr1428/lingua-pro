// =============================================================================
// validate-second-frames.mjs (v101) — is the second frame actually a second one?
//
// The app's own research audit names this as its biggest gap:
//
//     "A word met in a single frame is known in that frame."
//
// After v100, 2,651 of 3,145 words — 84% — appeared in exactly one sentence in
// the whole app. Adding a second sentence only helps if it shows the word doing
// something DIFFERENT. Two frames like
//
//     "Beber agua"        and        "Beber leche"
//
// are one frame with the noun swapped: same slot, same shape, nothing new
// learned about the verb. So this checks the property that makes the second
// frame worth its place —
//
//   · ERROR — the two frames are the same sentence apart from punctuation, or
//     one is wholly contained in the other. "Sí claro" / "Sí, claro" is one
//     frame written twice; "Mi madre" / "Mi madre cocina bien" is a fragment
//     and the sentence it is a fragment of.
//   · WARNING — the word sits in the same part of both sentences and neither is
//     a question. Never an error, for two reasons. Some word classes CANNOT
//     move: an interjection is always first, a numeral always precedes its
//     noun. And position is only a proxy for the thing that matters, which is
//     the word's JOB — 水を ください and 水が冷たいです put 水 in the same place
//     and use it as an object and then a subject. A build that failed on the
//     proxy would push someone to reword good frames.
//   · WARNING — a frame of one or two words. "Mi madre" is not a frame, it is a
//     phrase, and a word met only in a phrase is the problem this file exists
//     to fix.
//
//   npm run validate-second-frames
// =============================================================================

import { readdirSync, readFileSync } from "node:fs";
import { EXTRA_EXAMPLES } from "../src/data/extraExamples.js";
import { LATIN_SCRIPT_LANGUAGES } from "../src/data/registry.js";
import { stemMatch } from "./lib/romanisation.mjs";

const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));

const errors = [];
const warnings = [];
const phrases = [];

/** Where in the sentence does the word sit — start, middle or end? */
function slot(sentence, word) {
  // Case-insensitive on purpose: a sentence capitalises its first word, so
  // "Görüşürüz!" and "Yarın görüşürüz." would otherwise look like the word is
  // absent from the second — and that pair is a GOOD second frame, the word
  // moving from the whole sentence to its end.
  const s = String(sentence).toLowerCase();
  const w = String(word).toLowerCase();
  const i = s.indexOf(w);
  if (i < 0) return null;
  const mid = (i + w.length / 2) / Math.max(1, s.length);
  return mid < 0.34 ? "start" : mid < 0.67 ? "middle" : "end";
}

const isQuestion = (s) => /[?？؟]/.test(String(s));

// Word classes that cannot move. Checked against the English gloss, which is
// the only language-independent handle available here.
const FIXED_POSITION = /^(yes|no|hello|hi|goodbye|bye|thanks|thank you|please|sorry|excuse me|good morning|good day|good night|good evening|welcome|one|two|three|four|five|six|seven|eight|nine|ten|i|you|he|she|we|they|it)\b/i;

const words = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[.,!?;:"'“”‘’()¿¡—–…、。！？「」『』،؟۔।॥]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

/** Share of the shorter sentence's words that also appear in the longer one. */
function overlap(a, b) {
  const A = new Set(words(a)), B = new Set(words(b));
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared++;
  return shared / Math.min(A.size, B.size);
}

let pairs = 0, secondFrames = 0;

for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const extras = EXTRA_EXAMPLES[code] || {};

  for (const w of pack.vocab || []) {
    const base = (w.examples || []).map((e) => e.native).filter(Boolean);
    const extra = (extras[w.lemma] || []).map((e) => e.native).filter(Boolean);
    if (!base.length || !extra.length) continue;

    const first = base[0];
    for (const second of extra) {
      secondFrames++;
      const at = `${code}/${w.id} "${w.lemma}"`;

      if (first === second) {
        errors.push(`${at}: the second frame is the same sentence as the first`);
        continue;
      }

      // For a Latin-script language the lemma is the literal string; for the
      // rest it is too, since the native text is in the same script.
      if (!second.includes(w.lemma) && !stemMatch(second, w.lemma)) {
        warnings.push(`${at}: the second frame "${second}" does not obviously contain the word`);
      }

      pairs++;
      const s1 = slot(first, w.lemma);
      const s2 = slot(second, w.lemma);
      const movedSlot = s1 && s2 && s1 !== s2;
      const changedKind = isQuestion(first) !== isQuestion(second);
      const lenRatio = Math.max(first.length, second.length) / Math.max(1, Math.min(first.length, second.length));
      const changedShape = lenRatio >= 1.6;

      // Same sentence apart from punctuation, or one swallowed by the other.
      const bare = (x) => words(x).join(" ");
      if (bare(first) === bare(second)) {
        errors.push(`${at}: the two frames are the same sentence apart from punctuation — "${first}" / "${second}"`);
        continue;
      }
      // One frame inside the other is only dead weight when the word also
      // stays put. "Görüşürüz!" and "Yarın görüşürüz." is containment AND a
      // real second frame: the word goes from being the whole sentence to
      // sitting at its end.
      if ((bare(second).includes(bare(first)) || bare(first).includes(bare(second))) && !movedSlot) {
        errors.push(`${at}: one frame is wholly inside the other and the word does not move — "${first}" / "${second}"`);
        continue;
      }

      // A WARNING, not an error, and the reason is a limit of the check rather
      // than tolerance for bad content. What matters is that the word does a
      // different JOB in the second frame; all this can see is where it sits.
      // Those come apart:
      //
      //   水を ください  /  水が冷たいです     both initial, and yet one is the
      //                                      object of a request and the other
      //                                      the subject of a description
      //   मौसम बुरा है  /  वह एक बुरा दिन था   both mid, predicative vs attributive
      //
      // Failing the build on a position heuristic would push someone to reword
      // good frames to satisfy it. So it reports, and a human decides.
      const fixed = FIXED_POSITION.test(String(w.translation || ""));
      if (!movedSlot && !changedKind && !changedShape && !fixed) {
        warnings.push(
          `${at}: the word sits in the same part of both frames — "${first}" / "${second}"`
        );
      }

      const shortest = Math.min(words(first).length, words(second).length);
      if (shortest <= 2) phrases.push(`${code}`);
    }
  }
}

console.log(`\n  second frames: ${secondFrames} across ${codes.length} languages · ${pairs} pairs compared`);

// The base frames are often two words — "مرحبا صديقي", "Mi madre". A phrase is
// not a frame, and it is the debt this file only half pays off: the SECOND
// frame is now a sentence everywhere, but the first often still isn't.
// Summarised per language rather than listed, so it stays visible without
// drowning the errors.
if (phrases.length) {
  const per = {};
  for (const c of phrases) per[c] = (per[c] || 0) + 1;
  const total = phrases.length;
  console.log(`\n  ${total} pair(s) where one frame is a phrase of two words or fewer — usually the pack's original example`);
  console.log("    " + Object.entries(per).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${n}`).join(" · "));
}

if (warnings.length) {
  console.log(`\n  ${warnings.length} warning(s)`);
  for (const w of warnings.slice(0, 12)) console.log(`    ~ ${w}`);
  if (warnings.length > 12) console.log(`    ~ …and ${warnings.length - 12} more`);
}

if (errors.length) {
  console.log(`\n  ${errors.length} error(s)`);
  for (const e of errors.slice(0, 60)) console.log(`    ✗ ${e}`);
  if (errors.length > 60) console.log(`    ✗ …and ${errors.length - 60} more`);
  console.log("");
  process.exit(1);
}

console.log("\n  no second frame repeats the first · 0 errors\n");
