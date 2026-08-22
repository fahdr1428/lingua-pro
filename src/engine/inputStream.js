// =============================================================================
// THE INPUT STREAM (v83) — read everything you can already read.
//
// THE PROBLEM THIS ANSWERS, measured by scripts/measure-input.mjs: the entire
// reading library is about 623 words of connected text ACROSS FOURTEEN
// LANGUAGES. Korean gets four words. Mandarin four. Meanwhile the app has
// fourteen exercise types, a memory model fitted to a forgetting curve,
// graduated retrieval and a leech-recovery path.
//
// That is a very elaborate machine for practising ITEMS attached to almost no
// LANGUAGE, and it is the exact imbalance the research warns about. Every survey
// of second-language acquisition agrees on comprehensible input being necessary;
// they disagree only about whether it is sufficient. A minute of reading per
// language is not a disagreement about theory, it's an absence.
//
// WHY THIS ISN'T FIXED BY WRITING MORE PASSAGES. It should be, eventually, and
// it needs native speakers — this app teaches Punjabi, Nigerian Pidgin, Bengali
// and Urdu to people with family who speak them, and prose I generated myself
// and presented as course material would be exactly the wrong thing to hand
// someone trying to talk to their grandmother.
//
// WHAT IS ALREADY THERE AND UNUSED. Every vocabulary word carries a
// native-authored example sentence: roughly 450–670 words per language, several
// times the entire reading library, already reviewed as part of the curriculum.
// A learner meets each of those ONCE, alone, inside a multiple-choice question,
// and never sees it again. Reassembling them into something you can sit and read
// invents nothing and roughly ten times the input available.
//
// It is not a story and this file will not pretend otherwise — it is a run of
// sentences, and the screen says so. What it IS, precisely, is narrow reading at
// the right level: the same small vocabulary met again in different frames,
// which is the thing 94% of words in this app never get.
//
// THE ORDER IS THE WHOLE DESIGN. Sentences are sorted by how much of them the
// learner already knows:
//
//   0 unknown words   consolidation — a sentence you can simply READ, which for
//                     most learners of most apps is a rare experience
//   1 unknown word    the classic i+1: comprehensible because everything around
//                     the gap is known, and the gap is what gets acquired
//   2+ unknown        held back. Input stops being comprehensible input and
//                     becomes noise, and noise teaches nothing.
// =============================================================================

// Scripts that don't put spaces between words. Token counting means nothing
// there, so coverage is measured over characters and lemmas are matched as
// substrings rather than as whole words.
const UNSPACED = new Set(["zh", "ja"]);

// Punctuation across every script the app teaches — Latin, Arabic, Devanagari,
// CJK. Splitting on these keeps a full stop from welding itself to the last word.
const PUNCT = /[.,!?;:"'`´’“”«»()[\]{}…—–\-،؛؟۔।॥、。！？]/g;

const clean = (s) => String(s || "").replace(PUNCT, " ").replace(/\s+/g, " ").trim();

// How much of a sentence has to be words the learner knows. Measured across the
// packs, only 45–58% of the words in these sentences are course vocabulary at
// all, so half is close to "you know all the content words" rather than a
// demand that they know every particle.
const MIN_COVERAGE = 0.5;

/**
 * Which of these lemmas appear in this sentence.
 *
 * Substring matching for unspaced scripts, whole-word for the rest. A Spanish
 * "es" must not match inside "estudiante" — that would report a sentence as
 * understood when it isn't, which is the one error that matters here: it puts
 * something incomprehensible in front of someone and calls it their level.
 */
function lemmasIn(sentence, lemmas, code) {
  const hay = clean(sentence);
  const found = [];
  if (UNSPACED.has(code)) {
    const flat = hay.replace(/\s/g, "");
    for (const l of lemmas) {
      const needle = clean(l).replace(/\s/g, "");
      if (needle && flat.includes(needle)) found.push(l);
    }
    return found;
  }
  const words = new Set(hay.toLowerCase().split(" "));
  for (const l of lemmas) {
    const c = clean(l).toLowerCase();
    if (!c) continue;
    // Multi-word lemmas ("de nada") are matched against the whole string.
    if (c.includes(" ") ? hay.toLowerCase().includes(c) : words.has(c)) found.push(l);
  }
  return found;
}

/** How many separate words the sentence has, in a way that works per script. */
function lengthOf(sentence, code) {
  const c = clean(sentence);
  if (!c) return 0;
  return UNSPACED.has(code)
    ? Math.max(1, Math.round([...c.replace(/\s/g, "")].length / 1.6))
    : c.split(" ").length;
}

/**
 * Every sentence the learner could read, easiest first.
 *
 * @param {Object} pack       the language pack
 * @param {Object} progress   { [vocabId]: cardState } — reps > 0 means met
 * @param {Object} opts       { maxUnknown } how far past their level to go
 * @returns {Array} [{ native, translit, translation, unknown, known, total, wordId }]
 */
export function readableSentences(pack, progress = {}, { maxUnknown = 1, preferTranslit = false } = {}) {
  const code = pack?.code;
  const vocab = pack?.vocab || [];
  if (!vocab.length) return [];

  const knownLemmas = [];
  const allLemmas = [];
  for (const v of vocab) {
    if (!v.lemma) continue;
    allLemmas.push(v.lemma);
    if ((progress[v.id]?.reps || 0) > 0) knownLemmas.push(v.lemma);
  }

  const seen = new Set();
  const out = [];

  for (const v of vocab) {
    for (const ex of v.examples || []) {
      if (!ex?.native) continue;
      const key = clean(ex.native);
      if (!key || seen.has(key)) continue;   // the same sentence can hang off two words
      seen.add(key);

      const total = lengthOf(ex.native, code);
      const knownHere = lemmasIn(ex.native, knownLemmas, code);
      const allHere = lemmasIn(ex.native, allLemmas, code);

      // WHAT COUNTS AS UNKNOWN, and the mistake worth writing down.
      //
      // The obvious rule — "every COURSE word in it is known" — is far too lax,
      // and measure-stream.mjs caught it doing exactly what it was written to
      // catch: eight languages offered a ten-word beginner most of the
      // curriculum. Only about half the words in these sentences are course
      // vocabulary at all (45% in Arabic, 58% in Urdu, 46% in Spanish); the rest
      // are function words, inflected forms, and words the course never teaches.
      // A sentence whose one course word is known and whose other three words
      // are nowhere in the curriculum scored as fully readable. It isn't.
      //
      // Two conditions instead, and the second is the one that bites:
      //
      //   1. THE ONE NEW WORD IS THE WORD THE SENTENCE TEACHES. Every example
      //      hangs off a specific vocabulary entry; that word is the gap. This
      //      is i+1 falling straight out of how the curriculum is already built
      //      rather than being imposed on it.
      //   2. ENOUGH OF THE REST IS THEIRS. Half the sentence, which given the
      //      density measured above means roughly "the content words are known".
      const hostKnown = (progress[v.id]?.reps || 0) > 0;
      const otherUnknown = Math.max(0, allHere.length - knownHere.length - (hostKnown ? 0 : 1));
      if (otherUnknown > 0) continue;          // more than one gap: not input, noise

      const coverage = total ? knownHere.length / total : 0;
      const unknown = hostKnown ? 0 : 1;
      // A sentence being read outright has to be genuinely theirs; one being
      // stretched into gets a little slack, because the word it teaches is
      // by definition not known yet and so cannot count towards coverage.
      if (coverage < (hostKnown ? MIN_COVERAGE : MIN_COVERAGE - 0.15)) continue;

      out.push({
        native: ex.native,
        translit: ex.translit || "",
        translation: ex.translation || ex.gloss || "",
        unknown,
        known: knownHere.length,
        coverage,
        total,
        wordId: v.id,
        lemma: v.lemma,
      });
    }
  }

  // Everything you can read outright, then everything with a single gap.
  //
  // Within a band: sentences someone can SAY come first, then shorter before
  // longer. The transliteration gap is real and visible here — Urdu example
  // romanisation is around 55%, Arabic 38% — and a learner who can't yet read
  // Nastaliq meets a line they cannot pronounce at all. The honest response is
  // to put the sayable ones first, not to generate a romanisation: the
  // romaniser in audio/romanise.js is a rough phonetic skeleton built for
  // scoring speech, it is documented as never to be shown to a learner, and
  // handing someone an approximation of how their grandmother's language sounds
  // is exactly the wrong thing for this app to do. Filling those in properly is
  // an authoring job.
  //
  // Shorter before longer, because a short sentence read fluently is worth more
  // than a long one decoded.
  return out.sort(
    (a, b) =>
      a.unknown - b.unknown ||
      (preferTranslit ? (b.translit ? 1 : 0) - (a.translit ? 1 : 0) : 0) ||
      a.total - b.total
  );
}

/**
 * A summary for the UI, so it can say something true about what's waiting
 * rather than "you have 42 sentences", which means nothing to anyone.
 */
export function inputSummary(pack, progress = {}) {
  const all = readableSentences(pack, progress, { maxUnknown: 1 });
  const fluent = all.filter((s) => s.unknown === 0);
  const words = all.reduce((n, s) => n + s.total, 0);
  return { total: all.length, fluent: fluent.length, stretch: all.length - fluent.length, words };
}
