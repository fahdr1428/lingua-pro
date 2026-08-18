// =============================================================================
// romanise-examples.mjs (v79) — give the example sentences a pronunciation.
//
// THE PROBLEM. Every word in the app carries an example sentence, and v79 made
// those sentences central: they're on the new-word card and on every missed
// answer, because a word seen doing a job in a sentence is what actually sticks.
// Then I measured them: **0 of 1,333 example sentences in the eight non-Latin
// languages had a romanisation.** Not a low number — zero.
//
// For this app's audience that is close to fatal. The people it is built for
// largely understand their family's language spoken and cannot read the script.
// Showing them آج کا دن with no way to say it out loud makes the most valuable
// thing on the card unreadable to exactly the people it's for.
//
// WHY NOT JUST TRANSLITERATE THE SCRIPT. Because for Arabic-script languages it
// produces something worse than nothing. Urdu and Arabic don't write short
// vowels, so src/audio/romanise.js — which is right for the fuzzy speech
// matching it was built for — turns میں گھر جاتا ہوں into "myn ghr jata hon".
// A learner reading that aloud would be taught the wrong pronunciation. A bad
// pronunciation guide is worse than none, because none is honest.
//
// WHAT THIS DOES INSTEAD. Composes the sentence out of the pack's own
// word-level transliterations, which are hand-written and correct. Each token is
// matched against the vocabulary; if EVERY token resolves, the sentence gets a
// romanisation assembled from known-good parts. If any token doesn't, the
// sentence is left alone — a half-romanised line with a hole in it teaches a
// hole. Devanagari, Bengali and Gurmukhi write their vowels, so those three fall
// back to the transliterator for unknown tokens; Arabic-script ones never do.
//
//   node scripts/content/romanise-examples.mjs          # report only
//   node scripts/content/romanise-examples.mjs --write  # apply
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { romanise } from "../../src/audio/romanise.js";

const NON_LATIN = ["ur", "ar", "hi", "pa", "bn"];
// Scripts that write their vowels, so machine transliteration is safe enough to
// fill a gap. Arabic-script languages are deliberately absent.
const VOWELLED = new Set(["hi", "bn", "pa"]);

// Grammatical words that carry the sentence but aren't taught as vocabulary.
// Hand-written, because getting these wrong is what a bad guide looks like.
const PARTICLES = {
  ur: { "ہے": "hai", "ہیں": "hain", "ہوں": "hoon", "کا": "ka", "کی": "ki", "کے": "ke", "کو": "ko", "میں": "mein", "سے": "se", "پر": "par", "نے": "ne", "تھا": "tha", "تھی": "thi", "گا": "ga", "گی": "gi", "رہا": "raha", "رہی": "rahi", "ہو": "ho", "کر": "kar", "بہت": "bohot", "یہ": "yeh", "وہ": "woh", "اور": "aur", "نہیں": "nahin",
    // Possessives and object pronouns — the commonest words in any sentence and
    // none of them vocabulary entries, so nothing else could supply them.
    "میرا": "mera", "میری": "meri", "میرے": "mere", "تمہارا": "tumhara", "تمہاری": "tumhari",
    "آپ کا": "aap ka", "اس": "is", "اسے": "usay", "مجھے": "mujhe", "تمہیں": "tumhein", "ہمیں": "hamein",
    "جاتا": "jata", "جاتی": "jati", "کرتا": "karta", "کرتی": "karti", "چاہیے": "chahiye",
    "بھی": "bhi", "کیا": "kya", "کہاں": "kahan", "کیوں": "kyun", "کب": "kab", "آؤ": "aao",
    "تیز": "tez", "کتاب": "kitaab", "ایک": "ek", "دو": "do", "بہن": "behen", "لیے": "liye", "ساتھ": "saath" },
  pa: { "نئیں": "nahin", "کر": "kar", "کپ": "cup", "تیز": "tez", "جی": "ji", "بڑی": "vaddi",
    "اے": "ae", "ہے": "hai", "دا": "da", "دी": "di", "دے": "de", "نوں": "nu", "وچ": "vich", "توں": "ton", "تے": "te", "آں": "aan", "ایں": "ain", "نہیں": "nahin", "بہت": "bohot", "میرا": "mera", "میری": "meri", "مینوں": "mainu", "کردا": "karda", "جاندا": "janda" },
  ar: { "في": "fi", "من": "min", "على": "ala", "إلى": "ila", "مع": "maa", "عن": "an", "هذا": "hadha", "هذه": "hadhihi", "هو": "huwa", "هي": "hiya", "أنا": "ana", "أنت": "anta", "لا": "la", "و": "wa", "ال": "al", "جدا": "jiddan", "جداً": "jiddan", "كان": "kana", "هل": "hal", "ما": "ma",
    // First-person verb forms. The packs store Arabic verbs in the third-person
    // masculine (يريد, yureed) as dictionaries do, but example sentences are
    // mostly written in the first person, so none of them resolved.
    "أريد": "ureed", "أحتاج": "ahtaaj", "أذهب": "adhhab", "آكل": "aakul", "أشرب": "ashrab",
    "أتكلم": "atakallam", "أفهم": "afham", "أعرف": "a'rif", "أرى": "araa", "أسمع": "asma'",
    "أعمل": "a'mal", "أحب": "uhibb", "أستطيع": "astati'", "أراك": "araak", "أقول": "aqool",
    "صديقي": "sadeeqi", "جميل": "jameel", "كثيرا": "katheeran", "أيضا": "aydan", "الآن": "al-aan",
    "عندي": "indi", "لدي": "ladayya", "شكرا": "shukran", "نعم": "na'am" },
  hi: { "है": "hai", "हैं": "hain", "हूँ": "hoon", "का": "ka", "की": "ki", "के": "ke", "को": "ko", "में": "mein", "से": "se", "पर": "par", "ने": "ne", "था": "tha", "थी": "thi", "और": "aur", "नहीं": "nahin", "यह": "yeh", "वह": "woh", "बहुत": "bahut" },
  bn: { "আছে": "achhe", "আছি": "achhi", "আছেন": "achhen", "এবং": "ebong", "না": "na", "খুব": "khub", "এই": "ei", "সেই": "sei", "একটা": "ekta", "একটি": "ekti", "থেকে": "theke", "আমি": "ami", "তুমি": "tumi" },
};

const PUNCT = /[.,!?;:"'“”‘’()¿¡—–…、。！？「」『』،؟۔।॥]/g;
const strip = (s) => String(s).replace(PUNCT, " ").replace(/[ً-ْٰ]/g, "").replace(/\s+/g, " ").trim();

const write = process.argv.includes("--write");
let grandTotal = 0, grandDone = 0;

for (const code of NON_LATIN) {
  const file = `src/data/languages/${code}.json`;
  const pack = JSON.parse(readFileSync(file, "utf8"));

  // Lemma → romanisation, from the pack's own hand-written transliterations.
  const known = new Map();
  for (const v of pack.vocab) {
    if (!v.translit) continue;
    known.set(strip(v.lemma), v.translit.trim());
    // Multi-word entries ("السلام علیکم" → "assalam alaikum") also give us the
    // individual pieces, aligned by position when the counts match.
    const lw = strip(v.lemma).split(" "), tw = v.translit.trim().split(/\s+/);
    if (lw.length > 1 && lw.length === tw.length) {
      lw.forEach((w, i) => { if (!known.has(w)) known.set(w, tw[i]); });
    }
  }
  for (const [w, r] of Object.entries(PARTICLES[code] || {})) known.set(strip(w), r);

  let total = 0, done = 0;
  const misses = new Map();

  for (const v of pack.vocab) {
    for (const ex of v.examples || []) {
      if (!ex.native) continue;
      total++;
      if (ex.translit && ex.translit.trim()) { done++; continue; }

      const tokens = strip(ex.native).split(" ").filter(Boolean);
      const parts = [];
      let ok = true;
      for (const t of tokens) {
        let r = known.get(t);
        // Arabic and Urdu join the definite article to the noun: الماء is ال +
        // ماء, and only the bare noun is in the vocabulary. Strip it, look up
        // the noun, and put "al-" back on the front of the answer.
        if (!r && (code === "ar" || code === "ur") && t.startsWith("ال") && t.length > 3) {
          const bare = known.get(t.slice(2));
          if (bare) r = `al-${bare}`;
        }
        if (!r && VOWELLED.has(code)) {
          const auto = romanise(t);
          // Only trust the machine where it produced something with vowels in it.
          if (auto && /[aeiou]/.test(auto)) r = auto;
        }
        if (!r) { ok = false; misses.set(t, (misses.get(t) || 0) + 1); break; }
        parts.push(r);
      }
      if (ok && parts.length) {
        ex.translit = parts.join(" ");
        done++;
      }
    }
  }

  grandTotal += total; grandDone += done;
  const top = [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w, n]) => `${w}×${n}`);
  console.log(
    `${code.padEnd(4)} ${String(done).padStart(4)}/${String(total).padEnd(4)} romanised (${String(Math.round(done / total * 100)).padStart(3)}%)` +
    (top.length ? `   missing: ${top.join(" ")}` : "")
  );

  if (write) writeFileSync(file, JSON.stringify(pack, null, 1) + "\n");
}

console.log(`\n  ${grandDone}/${grandTotal} example sentences now have a pronunciation (${Math.round(grandDone / grandTotal * 100)}%)`);
if (!write) console.log("  (report only — pass --write to apply)");
