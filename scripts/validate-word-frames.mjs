// =============================================================================
// validate-word-frames.mjs (v100) — one word, one spelling, on the same card.
//
// A vocabulary card shows the word, its romanisation, and a sentence with that
// sentence's own romanisation underneath. Three of those four things describe
// the same word, and they have to agree.
//
// THE FIRST VERSION OF THIS CHECK WAS WRONG, and worth recording. It asked
// whether the card's romanisation appeared inside the sentence's romanisation,
// which fires on every inflected language in the app:
//
//     ✗ ar "يذهب": the card says "yadhhab" and the sentence "adhhab ila al-bayt"
//
// That is not an error. يذهب is the third-person form a dictionary lists and
// أذهب is "I go" — Arabic inflects on the front of the word, so a prefix test
// finds nothing and reports 29 healthy cards as broken. A check that loud gets
// switched off, and then the four real problems underneath it never surface.
//
// So the question is sharper: is there a token in the sentence that is the SAME
// WORD as the card's romanisation — folding away the differences between
// romanisation conventions — but SPELLED DIFFERENTLY? That is not inflection.
// That is the same card telling the learner two things:
//
//     suq / sooq          qalilan / qaleelan          a'ish / aeesh
//
// Those are the same sounds written two ways, on one card, and the learner has
// no way to know which one to say. foldConvention() is shared with
// validate-word-truth.mjs precisely so the two checks cannot disagree about
// what counts as the same word.
//
//   npm run validate-word-frames
// =============================================================================

import { readdirSync, readFileSync } from "node:fs";
import { foldConvention } from "./lib/romanisation.mjs";
import { LATIN_SCRIPT_LANGUAGES } from "../src/data/registry.js";

// Mandarin is reported, never failed. In pinyin a card and its example are
// SUPPOSED to differ:
//
//   不 is bù, and bú before a fourth tone      不是 → bú shì
//   一 is yī, and yí / yì depending on what follows
//   喜欢 xǐhuān is said xǐhuan — the second syllable goes neutral in the word
//
// foldConvention strips tone marks precisely so the checker tolerates that.
// Treating the difference as an error would push someone to "fix" correct
// pinyin into wrong pinyin, which is what the first draft of the auto-fixer
// tried to do.
const TONE_SANDHI = new Set(["zh"]);

const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));

const errors = [];
const warnings = [];
const notes = [];

// The apostrophe and the ayn are LETTERS in these romanisations — ma'a, sayyi',
// 'atshaan — not punctuation. Stripping them split "saa'a" into "saa" and "a",
// and "saa" folds to the same thing as "saa'a", so the check reported six
// Arabic cards as inconsistent with themselves when the fault was in the
// tokeniser.
const tokens = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[.,!?;:"“”()¿¡—–…]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

let cards = 0, frames = 0;

for (const code of codes) {
  if (LATIN_SCRIPT_LANGUAGES.has(code)) continue;   // no romanisation to disagree with
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));

  for (const w of pack.vocab || []) {
    if (!w.translit) continue;
    cards++;
    const cardFolded = foldConvention(w.translit);
    if (!cardFolded) continue;

    for (const [i, ex] of (w.examples || []).entries()) {
      if (!ex.translit) continue;
      frames++;

      for (const t of tokens(ex.translit)) {
        if (t === w.translit.toLowerCase()) break;          // spelled the same: done
        if (foldConvention(t) !== cardFolded) continue;      // a different word
        const line = `${code}/${w.id} "${w.lemma}": the card romanises it "${w.translit}" and its own example writes "${t}"`;
        if (TONE_SANDHI.has(code)) notes.push(`${line} — tone sandhi or a neutral tone, which is correct`);
        else errors.push(`${line} — the same word, two spellings, on one card`);
        break;
      }
    }
  }
}

// A card with no example at all is a flashcard rather than a piece of language.
// Reported, not enforced: filling every one is a content project, not a bug.
for (const code of codes) {
  const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
  const bare = (pack.vocab || []).filter((w) => !(w.examples || []).length).length;
  if (bare) warnings.push(`${code}: ${bare} word(s) with no example sentence at all`);
}

console.log(`\n  word frames: ${cards} romanised cards · ${frames} romanised examples`);

if (notes.length) {
  console.log(`\n  ${notes.length} note(s) — expected differences, not faults`);
  for (const n of notes.slice(0, 8)) console.log(`    · ${n}`);
  if (notes.length > 8) console.log(`    · …and ${notes.length - 8} more`);
}

if (warnings.length) {
  console.log(`\n  ${warnings.length} warning(s)`);
  for (const w of warnings) console.log(`    ~ ${w}`);
}

if (errors.length) {
  console.log(`\n  ${errors.length} error(s)`);
  for (const e of errors.slice(0, 40)) console.log(`    ✗ ${e}`);
  if (errors.length > 40) console.log(`    ✗ …and ${errors.length - 40} more`);
  console.log("");
  process.exit(1);
}

console.log("\n  every card spells its own word the same way twice · 0 errors\n");
