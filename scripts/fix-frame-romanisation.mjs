// =============================================================================
// fix-frame-romanisation.mjs (v100) — make a card agree with itself.
//
// validate-word-frames.mjs found 68 cards showing a learner two spellings of
// one word: the card says "arigatou" and its own example says "arigatō"; the
// card says "khana" and the example "khaana".
//
// The card's spelling wins, and not arbitrarily. That field has a second job:
// audio/tts.js feeds it to a near-language voice as a pronunciation fallback,
// and Hindi and Urdu convert it back to Devanagari for speech scoring. Macrons
// and apostrophes are not safe in it. So the example romanisation is rewritten
// to match the card, never the other way round.
//
// Only tokens that fold to the SAME word are touched — an inflected form is a
// different word and is left exactly as it is.
//
// CHINESE IS EXCLUDED, and this is the important part. The dry run wanted to
// "fix" these:
//
//     bú shì      → bù shì          一 and 不 change tone before a fourth tone
//     yí ge rén   → yī ge rén       and the example is the form you SAY
//     xǐhuan      → xǐhuān          the second syllable is neutral in the word
//
// Every one of those rewrites correct pinyin into wrong pinyin. foldConvention
// strips tone marks so the checker stops complaining about sandhi; using that
// same fold to drive a REWRITE inverts its purpose and destroys the
// distinction it was built to tolerate. A tool that normalises has to know
// which differences carry meaning.
//
// Punjabi and Urdu are excluded too, for the opposite reason: there the card is
// often the worse spelling (پانی is "paani", and the card says "pani"), so
// "card wins" would degrade the example. Those eight are corrected by hand in
// fix-romanisation-by-hand, choosing the better spelling for BOTH.
//
//   node scripts/fix-frame-romanisation.mjs [--dry]
// =============================================================================

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { foldConvention } from "./lib/romanisation.mjs";
import { LATIN_SCRIPT_LANGUAGES } from "../src/data/registry.js";

const DRY = process.argv.includes("--dry");

// Where the card's spelling is genuinely the canonical one and the example is
// merely a different convention: Japanese macron vs wapuro (the card must stay
// ASCII because audio/tts.js feeds it to a voice), Korean hyphen placement, and
// Arabic apostrophes and vowel length.
const CARD_WINS = new Set(["ja", "ko", "ar", "hi", "bn", "fa", "ml", "ta"]);
const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));

let fixed = 0;

for (const code of codes) {
  if (LATIN_SCRIPT_LANGUAGES.has(code) || !CARD_WINS.has(code)) continue;
  const path = `src/data/languages/${code}.json`;
  const pack = JSON.parse(readFileSync(path, "utf8"));
  let touched = 0;

  for (const w of pack.vocab || []) {
    if (!w.translit) continue;
    const card = w.translit;
    const cardFolded = foldConvention(card);
    if (!cardFolded) continue;

    for (const ex of w.examples || []) {
      if (!ex.translit) continue;
      // Split keeping the separators, so punctuation and spacing survive.
      const parts = ex.translit.split(/([^\p{L}\p{M}'’-]+)/u);
      let changed = false;
      for (let i = 0; i < parts.length; i++) {
        const t = parts[i];
        if (!t || !/[\p{L}]/u.test(t)) continue;
        if (t.toLowerCase() === card.toLowerCase()) continue;
        if (foldConvention(t) !== cardFolded) continue;
        // Same word, different spelling. Take the card's, keeping the
        // example's capitalisation.
        parts[i] = /^[A-Z]/.test(t) ? card.charAt(0).toUpperCase() + card.slice(1) : card;
        changed = true;
      }
      if (changed) {
        const before = ex.translit;
        ex.translit = parts.join("");
        console.log(`  ${code}/${w.id} "${w.lemma}": ${before}  →  ${ex.translit}`);
        touched++; fixed++;
      }
    }
  }

  if (touched && !DRY) writeFileSync(path, JSON.stringify(pack, null, 2) + "\n");
}

console.log(`\n  ${fixed} example romanisation(s) brought into line with their own card${DRY ? "  (dry run)" : ""}\n`);
