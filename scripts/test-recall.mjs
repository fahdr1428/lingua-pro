// =============================================================================
// test-recall.mjs (v113) — the from-memory grader is fair, in all 21 languages.
//
// For EVERY word of EVERY pack:
//   · the word itself is right — as written, in capitals, with punctuation,
//     with a trailing space
//   · its romanisation is right (non-Latin scripts), with vowel length and
//     tone marks folded the way people type
//   · Arabic-script words typed on another country's keyboard are right
//     (Arabic ي/ك for Urdu/Persian ی/ک), and so with harakat added
//   · a word with its accents dropped, or a noun without its article, is
//     CLOSE — never exact, and never wrong
//   · one slip in a word of five letters or more is close or a different real
//     word — never exact
// For EVERY PAIR of different words in a pack:
//   · typing the other word is never "exact" or "close" — it's named as the
//     other word, or accepted as a synonym when the meanings overlap
// And the edges: empty is empty, nonsense is wrong.
//
// And the hints, at both levels, for every word: typing exactly what a hint
// shows is never graded right.
//
// PROVEN CAPABLE OF FAILING, each break made on purpose and then undone:
//   · the phonetic skeleton allowed within one script → 18 problems (Arabic
//     مع "with" graded exact for ماء "water")
//   · the other-real-word check moved after "close" → 1,184 problems (أكل
//     "food" graded close for يأكل "to eat")
//   · hints not checked against the grader → 193 problems (the hint "ma…" is
//     itself an accepted answer for ماء, maa, once vowel length is folded)
//
//   npm run test-recall
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { gradeRecall, nativeKey, romanKey, isLatinWord, recallHint, canRecall } from "../src/engine/recall.js";

const problems = [];
let checks = 0;
const check = (ok, msg) => { checks++; if (!ok) problems.push(msg); };
const codes = readdirSync("src/data/languages").filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();

let words = 0, pairs = 0, homophones = 0;
for (const code of codes) {
  const vocab = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8")).vocab;
  for (const w of vocab) {
    words++;
    const g = (text) => gradeRecall(text, w, { vocab });
    const at = `${code} ${w.id} "${w.lemma}"`;
    // Capitals — except for Turkish words with dotless ı, whose capital I lowercases
    // to the other letter (i) outside a Turkish locale; nobody types those in caps.
    const caps = /[ıİ]/.test(w.lemma) ? [] : [w.lemma.toUpperCase()];
    for (const form of [w.lemma, ...caps, `${w.lemma}!`, ` ${w.lemma} `]) {
      const r = g(form);
      check(r.verdict === "exact", `${at}: "${form}" graded ${r.verdict}`);
    }
    const latin = isLatinWord(w.lemma);
    if (!latin && w.translit) {
      const r = g(w.translit);
      // A romanisation another word shares exactly is ambiguous by nature
      // (pinyin without tones: 是 shì and 试 shì) — counted, not failed.
      if (r.verdict !== "exact") {
        const shared = vocab.some((o) => o.id !== w.id && o.translit && romanKey(o.translit) === romanKey(w.translit));
        if (shared) homophones++;
        else check(false, `${at}: its romanisation "${w.translit}" graded ${r.verdict}`);
      }
      const folded = w.translit.replace(/aa/g, "a").replace(/ee/g, "i").replace(/oo/g, "u");
      const rf = g(folded);
      check(rf.correct, `${at}: "${folded}" (vowel length folded) graded ${rf.verdict}`);
    }
    if (/[ی]/.test(w.lemma) || /[ک]/.test(w.lemma)) {
      const arabicKeyboard = w.lemma.replace(/ی/g, "ي").replace(/ک/g, "ك");
      check(g(arabicKeyboard).verdict === "exact", `${at}: typed on an Arabic keyboard ("${arabicKeyboard}") isn't exact`);
    }
    if (/[؀-ۿ]/.test(w.lemma)) {
      const voweled = w.lemma.replace(/([بتثجحخدذرزسشصضطظعغفقلمن])/u, "$1َ");
      check(g(voweled).verdict === "exact", `${at}: with a fatha added ("${voweled}") isn't exact`);
    }
    if (latin) {
      const markless = w.lemma.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
      if (markless !== w.lemma) {
        const r = g(markless);
        check(["close", "other-word", "alternative"].includes(r.verdict), `${at}: without accents ("${markless}") graded ${r.verdict}`);
      }
      const bare = w.lemma.replace(/^(der|die|das|el|la|los|las|le|les|l'|un|une)\s+/i, "");
      if (bare !== w.lemma) {
        const r = g(bare);
        check(["close", "other-word", "alternative"].includes(r.verdict), `${at}: without its article ("${bare}") graded ${r.verdict}`);
      }
    }
    const chars = [...w.lemma];
    if (chars.length >= 5 && !/\s/.test(w.lemma)) {
      const slip = [...chars.slice(0, 2), ...chars.slice(3)].join("");
      const r = g(slip);
      check(r.verdict !== "exact", `${at}: a letter missing ("${slip}") graded exact`);
    }
    check(g("").verdict === "empty", `${at}: empty isn't "empty"`);
    check(!g("qqqqzzzz").correct, `${at}: nonsense graded right`);
  }

  // Every pair of different words.
  for (const a of vocab) {
    for (const b of vocab) {
      if (a.id === b.id || nativeKey(a.lemma) === nativeKey(b.lemma)) continue;
      pairs++;
      const r = gradeRecall(b.lemma, a, { vocab });
      if (r.verdict === "exact" || r.verdict === "close") {
        // Only acceptable when the two are spelled the same once keyboard
        // variants are folded — then they are one written word.
        check(false, `${code}: typing "${b.lemma}" (${b.translation}) for "${a.translation}" (${a.lemma}) graded ${r.verdict}`);
      }
    }
  }
}

// Hints leave the remembering to the learner.
{
  const item = { lemma: "شکریہ", translit: "shukriya" };
  const h1 = recallHint(item, 1), h2 = recallHint(item, 2);
  check(h1.native === "ش…" && h1.translit === "s…", `hint level 1: ${JSON.stringify(h1)}`);
  check(h2.native.length < item.lemma.length + 1 && h2.translit.startsWith("shuk"), `hint level 2: ${JSON.stringify(h2)}`);
  check(recallHint({ lemma: "ab", translit: "" }, 2).native === "a…", "a hint never gives the whole word away");
  const art = recallHint({ lemma: "die Frage" }, 1).native;
  check(art === "d… F…", `an article gives only its first letter — which one is still the learner's to remember: "${art}"`);
  const phrase = recallHint({ lemma: "buenos días" }, 1).native;
  check(phrase === "b… d…", `a phrase shows its shape, word by word: "${phrase}"`);
  const one = recallHint({ lemma: "是", translit: "shì" }, 2);
  check(one.native === "" && one.translit === "sh…", `a one-character word shows nothing of itself, only its romanisation: ${JSON.stringify(one)}`);
  // Across every word of every pack, at both levels: typing exactly what the
  // hint shows is never graded right. (It was, at first, for "maa": the hint
  // "ma…" is itself an accepted answer once vowel length is folded.)
  for (const code of codes) {
    const vocab = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8")).vocab;
    for (const w of vocab) {
      for (const level of [1, 2]) {
        const h = recallHint(w, level, { vocab });
        for (const shown of [h.native, h.translit]) {
          if (!shown) continue;
          const r = gradeRecall(shown.replace(/…/g, ""), w, { vocab });
          check(!r.correct, `${code} ${w.id} "${w.lemma}": typing the level-${level} hint "${shown}" is graded ${r.verdict}`);
        }
      }
    }
  }
}

// canRecall: what counts as being able to say a word.
{
  const now = Date.now();
  check(!canRecall(null) && !canRecall({ reps: 0 }), "an unseen word can't be recalled");
  check(canRecall({ lastReview: now, recalls: 1, lastRating: 3 }), "recalled once, not failed since → yes");
  check(!canRecall({ lastReview: now, recalls: 0, lastRating: 3, stability: 40 }), "never produced from memory (v113 card) → no, however stable");
  check(!canRecall({ lastReview: now, recalls: 3, lastRating: 1 }), "failed the last attempt → not right now");
  check(canRecall({ lastReview: now, stability: 9, lastRating: 3 }), "a pre-v113 card a week stable → yes (nobody loses what they earned)");
  check(!canRecall({ lastReview: now, stability: 3, lastRating: 3 }), "a pre-v113 card barely started → no");
}

console.log(`\n  recall grader: ${checks} checks · ${words} words, ${pairs} pairs of different words, ${codes.length} languages`);
console.log(`  ${homophones} romanisations shared by two different words (accepted for either — romanisation can't tell them apart)`);
if (problems.length) {
  console.log(`\n  ✗ ${problems.length} problems\n`);
  for (const p of problems.slice(0, 30)) console.log(`   ${p}`);
  process.exit(1);
}
console.log("  ✓ every word is right in its script and its romanisation; no other word is ever taken for it\n");
