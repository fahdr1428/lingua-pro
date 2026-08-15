// =============================================================================
// merge.mjs — shared vocabulary merge, used by every expansion script.
//
// Adding words by hand into a 60KB JSON file is how duplicates, wrong unit ids
// and broken frequency ordering get in. Every expansion goes through here
// instead, and it enforces the rules that matter:
//
//   - never add a lemma the pack already has (merge into it instead)
//   - never add a second word with an identical English meaning, because the
//     generator will happily offer both as options to the same question and the
//     learner will be marked wrong for picking the other correct answer
//   - drop a "dialect form" that's identical to the standard one — an arrow
//     pointing from a word to itself teaches a difference that doesn't exist
//   - re-rank the whole pack afterwards, so the selector (which introduces new
//     words in frequencyRank order) actually teaches the most useful ones first
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";

/** Drop dialect entries whose written form matches the standard word. */
export function dialectMap(dialects, standardLemma) {
  if (!dialects) return null;
  const out = {};
  for (const [id, [lemma, translit]] of Object.entries(dialects)) {
    if (!lemma || lemma === standardLemma) continue;
    out[id] = { lemma, translit };
  }
  return Object.keys(out).length ? out : null;
}

const meaningsOf = (translation) =>
  String(translation).toLowerCase().split(/\s*,\s*/).map((x) => x.replace(/^to /, "").trim()).filter(Boolean);

/**
 * @param {string} code                 language code
 * @param {Array}  rows                 [lemma, translit, pronunciation, translation,
 *                                       unit, category, difficulty, examples, dialects?]
 * @param {object} opts.translitIsLemma true for Latin-script packs, where the
 *                                      transliteration is the word itself
 */
export function merge(code, rows, { translitIsLemma = false, quiet = false } = {}) {
  const file = `src/data/languages/${code}.json`;
  const pack = JSON.parse(readFileSync(file, "utf8"));

  // Case-insensitively: the Latin-script packs capitalise inconsistently
  // ("Kiri" vs "kiri"), and an exact-match check let both into the same pack —
  // two entries for one word, which the generator then offers as two options to
  // the same question.
  const key = (l) => String(l).trim().toLowerCase();
  const byLemma = new Map(pack.vocab.map((v) => [key(v.lemma), v]));
  const takenMeanings = new Set(pack.vocab.flatMap((v) => meaningsOf(v.translation)));
  const unitIds = new Set((pack.units || []).map((u) => u.id));
  let nextId = Math.max(...pack.vocab.map((v) => Number(v.id.split("_")[1]))) + 1;

  const added = [], enriched = [], skipped = [], problems = [];

  for (const row of rows) {
    const [lemma, translit, pronunciation, translation, unit, category, difficulty, examples = [], dialects] = row;

    if (!unitIds.has(unit)) { problems.push(`${lemma}: unit "${unit}" doesn't exist in ${code}`); continue; }

    const already = byLemma.get(key(lemma));
    if (already) {
      let touched = false;
      const d = dialectMap(dialects, lemma);
      if (d && !already.dialects) { already.dialects = d; touched = true; }
      if (!already.pronunciation && pronunciation) { already.pronunciation = pronunciation; touched = true; }
      const haveNatives = new Set((already.examples || []).map((e) => e.native));
      for (const [native, t] of examples) {
        if (!haveNatives.has(native) && (already.examples || []).length < 3) {
          already.examples = [...(already.examples || []), { native, translation: t }];
          touched = true;
        }
      }
      (touched ? enriched : skipped).push(lemma);
      continue;
    }

    // Two words with the same English gloss become two identical options in one
    // question. The learner picks the "wrong" right answer and loses a heart.
    const clash = meaningsOf(translation).find((m) => takenMeanings.has(m));
    if (clash) { skipped.push(`${lemma} → "${clash}" already taught`); continue; }
    meaningsOf(translation).forEach((m) => takenMeanings.add(m));

    const entry = {
      id: `${code}_${String(nextId++).padStart(4, "0")}`,
      lemma,
      translit: translitIsLemma ? lemma : translit,
      pronunciation: translitIsLemma ? (pronunciation || translit) : pronunciation,
      translation, category, difficulty, unit,
      examples: examples.map(([native, t]) => ({ native, translation: t })),
    };
    const d = dialectMap(dialects, lemma);
    if (d) entry.dialects = d;

    byLemma.set(key(lemma), entry);
    added.push(entry);
  }

  pack.vocab = [...pack.vocab, ...added];

  // Re-rank so the most useful words are introduced first. Difficulty leads,
  // then unit order (which is the intended teaching sequence), then the existing
  // rank as a stable tiebreak.
  const unitOrder = Object.fromEntries((pack.units || []).map((u, i) => [u.id, i]));
  [...pack.vocab]
    .sort((a, b) =>
      (a.difficulty - b.difficulty) ||
      ((unitOrder[a.unit] ?? 99) - (unitOrder[b.unit] ?? 99)) ||
      ((a.frequencyRank || 999) - (b.frequencyRank || 999)))
    .forEach((v, i) => { v.frequencyRank = i + 1; });

  pack.categories = [...new Set(pack.vocab.map((v) => v.category))].sort();
  writeFileSync(file, JSON.stringify(pack, null, 1) + "\n");

  if (!quiet) {
    const perUnit = {};
    for (const v of pack.vocab) perUnit[v.unit] = (perUnit[v.unit] || 0) + 1;
    const thin = (pack.units || []).filter((u) => (perUnit[u.id] || 0) < 8).map((u) => `${u.id}:${perUnit[u.id] || 0}`);
    console.log(
      `${code}: ${String(pack.vocab.length).padStart(4)} words  (+${added.length} new, ${enriched.length} enriched, ${skipped.length} already there)` +
      (thin.length ? `   thin units: ${thin.join(" ")}` : "")
    );
    for (const p of problems) console.log(`   ! ${p}`);
  }
  return { added: added.length, enriched: enriched.length, problems };
}
