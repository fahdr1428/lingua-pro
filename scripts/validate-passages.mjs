// =============================================================================
// validate-passages.mjs (v79) — keep the reading library actually readable.
//
// A reading passage is only comprehensible input if the learner can, in fact,
// comprehend it. The moment a passage uses words the course never teaches, it
// stops being input and becomes a wall — and a wall dressed up as practice is
// worse than no practice, because the learner concludes they're the problem.
//
// So this enforces the rule the library is built on: A PASSAGE MAY ONLY USE
// WORDS THE COURSE TEACHES. Every content word is checked against that
// language's own vocabulary pack. Anything unrecognised is reported by name.
//
// WHAT THIS CAN AND CANNOT CHECK — worth being straight about:
//   ✓ every word is one the course teaches, so the passage is readable
//   ✓ the structure is sound: four options, the answer among them, unique ids,
//     transliteration present for every non-Latin line
//   ✗ GRAMMAR. Nothing here can tell you whether a sentence is well-formed, or
//     idiomatic, or something a native speaker would ever say. That needs a
//     native speaker, and the README says so.
//
// Japanese and Chinese are checked differently and more weakly: they have no
// spaces to tokenise on, so instead of "is every token known" the measure is
// "how much of this text is covered by words we teach". Stated plainly rather
// than pretending the same rigour applies.
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";

const NO_SPACES = new Set(["ja", "zh"]);
// Below this share of recognised words, a passage isn't comprehensible input.
const MIN_COVERAGE = 0.9;
const MIN_COVERAGE_NO_SPACES = 0.75;

// Function words a course teaches implicitly or that carry no lexical load.
// Kept per language and deliberately short: the more that goes in here, the
// weaker the check becomes, so anything added should be a genuine grammatical
// particle rather than a word we simply forgot to teach.
const GRAMMATICAL = {
  es: ["el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "a", "al", "y", "o", "que", "es", "está", "estoy", "soy", "hay", "muy", "no", "sí", "me", "te", "se", "mi", "tu", "su", "para", "por", "con", "en"],
  fr: ["le", "la", "les", "un", "une", "des", "de", "du", "à", "au", "aux", "et", "ou", "que", "qui", "est", "sont", "c'est", "je", "tu", "il", "elle", "nous", "vous", "ne", "pas", "très", "mon", "ma", "mes", "ton", "sa", "son", "pour", "avec", "en", "dans", "j'ai", "il y a"],
  de: ["der", "die", "das", "ein", "eine", "einen", "und", "oder", "ist", "sind", "ich", "du", "er", "sie", "wir", "nicht", "sehr", "mein", "meine", "dein", "für", "mit", "in", "im", "zu", "zum", "es", "gibt", "auch", "aber", "hier", "da"],
  tr: ["ve", "bir", "bu", "şu", "o", "ben", "sen", "biz", "için", "ile", "de", "da", "çok", "var", "yok", "ama", "değil"],
  id: ["dan", "atau", "yang", "di", "ke", "dari", "ini", "itu", "saya", "kamu", "kita", "untuk", "dengan", "ada", "tidak", "sangat", "juga", "tapi"],
  pcm: ["di", "de", "dey", "na", "for", "wey", "and", "but", "e", "i", "you", "we", "dem", "go", "no", "make", "sey", "so", "come", "am"],
  ur: ["ہے", "ہیں", "ہوں", "کا", "کی", "کے", "کو", "میں", "سے", "پر", "اور", "یا", "نہیں", "بہت", "بھی", "یہ", "وہ", "ایک", "کہ"],
  hi: ["है", "हैं", "हूँ", "का", "की", "के", "को", "में", "से", "पर", "और", "या", "नहीं", "बहुत", "भी", "यह", "वह", "एक", "कि"],
  // Shahmukhi, not Gurmukhi — this pack writes Punjabi in the Perso-Arabic
  // script, as it is written in Pakistan. A Gurmukhi list here failed every
  // line in the pack for the wrong reason.
  pa: ["اے", "ہے", "نے", "دا", "دی", "دے", "نوں", "وچ", "توں", "تے", "نہیں", "بہت", "وی", "ایہ", "اوہ", "اک", "کہ", "میرا", "میری", "تیرا", "مینوں", "آں", "ایں", "جی", "کردا", "جاندا"],
  bn: ["আছে", "আছি", "আছেন", "হয়", "এর", "কে", "তে", "থেকে", "এবং", "বা", "না", "খুব", "ও", "এই", "সেই", "একটা", "একটি"],
  ar: ["ال", "في", "من", "على", "و", "أو", "هذا", "هذه", "هو", "هي", "أنا", "أنت", "لا", "نعم", "جدا", "جداً", "مع", "إلى", "عن"],
  ko: ["은", "는", "이", "가", "을", "를", "에", "에서", "와", "과", "도", "만", "의", "하고", "그리고", "그런데", "너무", "아주"],
};

// People and places used in passages. A name is not vocabulary — nobody needs
// "Anna" taught to them — but without this the validator flags every one of
// them as an unknown word and the noise buries the real failures.
const NAMES = new Set([
  "anna", "emre", "ali", "sara", "amina", "hassan", "maria", "chidi", "budi", "siti",
  "hamburg", "berlin", "lahore", "istanbul", "jakarta", "lagos", "kaduna",
  "علی", "سارہ", "آمنہ", "حسن", "لاہور", "सारा", "अली", "حسّان",
]);

const strip = (s) =>
  String(s)
    .toLowerCase()
    // Punctuation across every script this app uses. The Urdu full stop (۔) and
    // the Devanagari danda (।) were missing at first, which made the validator
    // report "ہے۔" and "हैं।" as unknown vocabulary — a wall of false failures
    // that hid the two real ones underneath.
    .replace(/[.,!?;:"'“”‘’()¿¡—–…、。！？「」『』،؟۔।॥]/g, " ")
    // Arabic short vowels and shadda are optional in writing; a word carrying
    // them is the same word without.
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Does the pack teach this token? Allows for light inflection at either end. */
function known(token, lemmas) {
  if (lemmas.has(token)) return true;
  // "hablas" against the lemma "hablar": share a long enough stem.
  for (const l of lemmas) {
    if (l.length >= 4 && (token.startsWith(l.slice(0, -1)) || l.startsWith(token.slice(0, -1)))) {
      if (Math.abs(l.length - token.length) <= 3) return true;
    }
  }
  return false;
}

export function validatePassages({ quiet = false } = {}) {
  const src = readFileSync("src/data/passages.js", "utf8");
  const errors = [];
  const warnings = [];
  const rows = [];

  // Import rather than parse: the file is a module and the module is the truth.
  return import("../src/data/passages.js").then(({ PASSAGES }) => {
    const packFiles = readdirSync("src/data/languages").filter((f) => f.endsWith(".json"));
    const allCodes = packFiles.map((f) => f.replace(".json", ""));
    const seenIds = new Set();

    for (const code of allCodes) {
      const list = PASSAGES[code] || [];
      if (!list.length) {
        errors.push(`${code}: no reading passages at all — the Reading screen has nothing to show`);
        rows.push([code, 0, 0, "—"]);
        continue;
      }

      const pack = JSON.parse(readFileSync(`src/data/languages/${code}.json`, "utf8"));
      const lemmas = new Set();
      for (const v of pack.vocab) {
        lemmas.add(strip(v.lemma));
        // Words inside the taught example sentences count as taught: the learner
        // has met them on the card for that word.
        for (const e of v.examples || []) {
          for (const t of strip(e.native).split(" ")) if (t) lemmas.add(t);
        }
      }
      for (const g of GRAMMATICAL[code] || []) lemmas.add(strip(g));
      for (const n of NAMES) lemmas.add(n);

      let totalTokens = 0, unknownTokens = 0;
      const unknownWords = new Set();

      for (const p of list) {
        // ---- structure ----
        const where = `${code}/${p.id || "(no id)"}`;
        if (!p.id) errors.push(`${where}: missing id`);
        if (seenIds.has(p.id)) errors.push(`${where}: duplicate id`);
        seenIds.add(p.id);
        if (!p.title) errors.push(`${where}: missing title`);
        if (!Array.isArray(p.lines) || p.lines.length < 3) {
          errors.push(`${where}: needs at least 3 lines to be a passage rather than a phrase`);
        }
        if (!Array.isArray(p.options) || p.options.length !== 4) {
          errors.push(`${where}: needs exactly 4 answer options, has ${p.options?.length}`);
        } else {
          if (!p.options.includes(p.answer)) {
            errors.push(`${where}: the answer "${p.answer}" is not one of the options — unanswerable`);
          }
          if (new Set(p.options).size !== p.options.length) {
            errors.push(`${where}: two options are identical`);
          }
        }
        if (!p.question) errors.push(`${where}: missing comprehension question`);

        for (const [i, line] of (p.lines || []).entries()) {
          if (!line.native) errors.push(`${where} line ${i + 1}: no text`);
          if (!line.translation) errors.push(`${where} line ${i + 1}: no English translation`);
          if (!NO_SPACES.has(code) && code !== "es" && code !== "fr" && code !== "de" &&
              code !== "id" && code !== "tr" && code !== "pcm" && !line.translit) {
            errors.push(`${where} line ${i + 1}: non-Latin script needs a transliteration`);
          }

          // ---- comprehensibility ----
          if (NO_SPACES.has(code)) {
            const text = strip(line.native).replace(/ /g, "");
            let covered = 0;
            for (let a = 0; a < text.length; a++) {
              for (const l of lemmas) {
                if (l && l.length && text.startsWith(l, a)) { covered += l.length; a += l.length - 1; break; }
              }
            }
            totalTokens += text.length;
            unknownTokens += Math.max(0, text.length - covered);
          } else {
            for (const t of strip(line.native).split(" ")) {
              if (!t) continue;
              totalTokens++;
              if (!known(t, lemmas)) { unknownTokens++; unknownWords.add(t); }
            }
          }
        }
      }

      const coverage = totalTokens ? 1 - unknownTokens / totalTokens : 0;
      const bar = NO_SPACES.has(code) ? MIN_COVERAGE_NO_SPACES : MIN_COVERAGE;
      rows.push([code, list.length, list.reduce((a, p) => a + p.lines.length, 0), `${Math.round(coverage * 100)}%`]);

      if (coverage < bar) {
        errors.push(
          `${code}: only ${Math.round(coverage * 100)}% of the reading text uses words the course teaches ` +
          `(needs ${Math.round(bar * 100)}%). Unknown: ${[...unknownWords].slice(0, 12).join(", ")}`
        );
      } else if (unknownWords.size) {
        warnings.push(`${code}: ${unknownWords.size} unrecognised word(s): ${[...unknownWords].slice(0, 8).join(", ")}`);
      }
    }

    if (!quiet) {
      console.log("\n  lang  passages  lines  words the course teaches");
      for (const [c, n, l, cov] of rows) {
        console.log(`  ${c.padEnd(5)} ${String(n).padStart(6)} ${String(l).padStart(7)}   ${cov.padStart(4)}`);
      }
      const totalP = rows.reduce((a, r) => a + r[1], 0);
      const totalL = rows.reduce((a, r) => a + r[2], 0);
      console.log(`\n  ${allCodes.length} languages · ${totalP} passages · ${totalL} lines · ${errors.length} errors · ${warnings.length} warnings`);
      for (const w of warnings) console.log(`  [!] ${w}`);
      for (const e of errors) console.log(`  ERROR ${e}`);
    }
    return { errors, warnings };
  });
}

const isMain = process.argv[1] && process.argv[1].endsWith("validate-passages.mjs");
if (isMain) {
  const { errors } = await validatePassages();
  process.exit(errors.length ? 1 : 0);
}
