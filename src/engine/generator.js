// =============================================================================
// LESSON GENERATOR — builds exercises on the fly from any vocab list.
// =============================================================================
// No static lessons. Every "lesson" is generated at runtime from the queue
// the selector hands us. The generator's job:
//
//   1. Pick an EXERCISE TYPE per word, based on the word's mastery level.
//      - New cards (reps=0): always recognition (low cognitive load).
//      - Mature cards (reps≥3): production exercises (recall, not recognise).
//      - Mid cards: a mix.
//   2. Build distractors that are semantically plausible (same category if
//      possible) — not just random.
//   3. Mix exercise types within a session to prevent fatigue.
//   4. Inject the occasional "listening" exercise (TTS-only prompt).
// =============================================================================

export const EXERCISE = {
  INTRODUCE_BATCH: "introduce_batch", // show all new words as flashcards FIRST
  INTRODUCE: "introduce",           // (legacy, kept for backwards compat)
  PICK_MEANING: "pick_meaning",     // see word → pick translation
  PICK_WORD: "pick_word",           // see translation → pick word
  LISTEN_PICK: "listen_pick",       // hear word → pick translation
  TYPE_TRANSLATION: "type_translation", // see word → type translation
  TAP_WORDS: "tap_words",           // arrange words to form sentence
  COMPLETE_SENTENCE: "complete_sentence", // fill the gap
  BUILD_SENTENCE: "build_sentence", // tap words to build sentence (productive)
  CONJUGATE: "conjugate",           // v29: "How do you say 'I go'?" - person-form pick
  CONJUGATE_TENSE: "conjugate_tense", // v34b: "How do you say 'I WENT' / 'I WILL GO'?"
  MATCH_PAIRS: "match_pairs",       // v35: tap word ↔ meaning to match 4 pairs
  ODD_ONE_OUT: "odd_one_out",       // v35: pick the word that doesn't belong to the category
  LETTER_SCRAMBLE: "letter_scramble", // v59: spell the word from shuffled letter tiles
  TRUE_FALSE: "true_false",         // v59: quick judgement — does this word mean X?
  SPEAK_PROMPT: "speak_prompt",     // v70: say it out loud; graded leniently by ear
};

const NUM_DISTRACTORS = 3;

/**
 * v29 lesson flow — addresses "lessons are too basic" feedback:
 *   1. Intro batch (flashcards) for any new words.
 *   2. PRIMARY recall test for every queue item (one per word, varied types).
 *   3. CONJUGATION exercises for any verbs in the queue (one per testable verb).
 *   4. REINFORCEMENT round — extra mixed exercises on words from the queue +
 *      previously-learned vocab pulled from the pool, ensuring old words get
 *      revisited rather than forgotten. Targets minimum 10 testable exercises.
 *   5. Whole thing shuffled (except intro stays first) so it doesn't feel like
 *      a list of identical questions.
 *
 * @param {Array} queue   ordered vocab items the selector handed us
 * @param {Array} pool    full vocab pool (for distractors + reinforcement)
 * @param {Object} progress cardState by id
 * @param {string} langCode  required for conjugation lookup (optional; if absent, conjugation skipped)
 * @param {Object} conjugations  the language's CONJUGATIONS entry (optional)
 */
/**
 * v76 — EXERCISE PREFERENCES.
 *
 * Some exercise types are a wall for some people rather than a challenge:
 * listening questions on a device with no voice for the language, typing on a
 * phone in a script you can't type, speaking on a train. Before this, the only
 * options were to endure them or stop using the app.
 *
 * `disabled` is a Set of EXERCISE values the learner has switched off. It is
 * applied as a FILTER on what gets built, never as a hard requirement — if
 * turning everything off would leave a word untestable, it still gets a plain
 * pick-the-meaning question, because an empty lesson is worse than an
 * unwelcome one.
 */
export function generateLesson(queue, pool, progress = {}, langCode = null, conjugations = null, tenses = null, examMode = false, chapterExam = false, disabled = null) {
  // A default only applies when the argument is undefined, so an explicit null
  // — which is what an in-flight storage read hands us — sailed straight through
  // and threw on the first progress[id] lookup.
  if (!progress || typeof progress !== "object") progress = {};
  if (!Array.isArray(queue)) queue = [];
  if (!Array.isArray(pool)) pool = [];
  DISABLED = disabled instanceof Set ? disabled : (Array.isArray(disabled) ? new Set(disabled) : null);
  const exercises = [];

  // v44 CHAPTER EXAM — a gated, 3-round exam (easy → medium → hard). Each word
  // appears across the rounds so it's tested multiple ways, building difficulty.
  // Round 1 (easy):   PICK_MEANING  — recognition (see word → choose meaning)
  // Round 2 (medium): PICK_WORD     — recall (see meaning → choose word)
  // Round 3 (hard):   LISTEN_PICK / COMPLETE_SENTENCE — listening & production
  // Exercises carry a `round` (1-3) and `roundLabel` so the UI can show progress.
  if (chapterExam) {
    const rounds = [
      { n: 1, label: "Round 1 · Recognise", type: EXERCISE.PICK_MEANING },
      { n: 2, label: "Round 2 · Recall", type: EXERCISE.PICK_WORD },
      { n: 3, label: "Round 3 · Listen & Produce", type: "MIXED_HARD" },
    ];
    for (const round of rounds) {
      // Shuffle the words within each round so order varies.
      const roundItems = [...queue].sort(() => Math.random() - 0.5);
      roundItems.forEach((item, i) => {
        const card = progress[item.id];
        let type = round.type;
        if (type === "MIXED_HARD") {
          // Alternate listening and fill-the-blank; fall back if no sentence.
          const hasSentence = (item.examples || []).some((ex) => {
            const w = (ex?.native || "").split(/\s+/).filter(Boolean).length;
            return w >= 2;
          });
          if (i % 2 === 0 && hasSentence) type = EXERCISE.COMPLETE_SENTENCE;
          else type = EXERCISE.LISTEN_PICK;
        }
        let ex = buildExerciseOfType(item, type, pool, card, 0, progress);
        if (!ex) ex = buildExerciseOfType(item, EXERCISE.PICK_WORD, pool, card, 0, progress);
        if (ex) {
          ex.round = round.n;
          ex.roundLabel = round.label;
          exercises.push(ex);
        }
      });
    }
    // Do NOT shuffle across rounds — rounds must stay in difficulty order.
    return exercises;
  }

  // v38/v39 EXAM MODE — pure testing: one solid question per word, no flashcard
  // intros, no graduated multi-level sets. It's a test, not a teaching session.
  // v39: each word is tested with a DIFFERENT method (rotated), so the exam
  // exercises varied recall skills — recognition, recall, listening, and
  // fill-in-the-blank — rather than the same question shape every time.
  if (examMode) {
    // Question types to rotate through. COMPLETE_SENTENCE only works when the
    // word has a usable example sentence, so we check per-word and fall back.
    const examTypes = [
      EXERCISE.PICK_WORD,        // recall: meaning → word (hardest, most weight)
      EXERCISE.PICK_MEANING,     // recognition: word → meaning
      EXERCISE.LISTEN_PICK,      // listening: hear → meaning
      EXERCISE.COMPLETE_SENTENCE,// production: fill the gap
    ];
    queue.forEach((item, i) => {
      const card = progress[item.id];
      // Rotate the type by position so methods are evenly spread.
      let type = examTypes[i % examTypes.length];
      // COMPLETE_SENTENCE needs a sentence; if absent, fall back to PICK_WORD.
      if (type === EXERCISE.COMPLETE_SENTENCE) {
        const hasSentence = (item.examples || []).some((ex) => {
          const w = (ex?.native || "").split(/\s+/).filter(Boolean).length;
          return w >= 2;
        });
        if (!hasSentence) type = EXERCISE.PICK_WORD;
      }
      let ex = buildExerciseOfType(item, type, pool, card, 0, progress);
      // buildExerciseOfType can fall back internally; guarantee we always get
      // something testable by defaulting to PICK_WORD if it returned null.
      if (!ex) ex = buildExerciseOfType(item, EXERCISE.PICK_WORD, pool, card, 0, progress);
      if (ex) exercises.push(ex);
    });
    // Shuffle so it's not in queue order.
    return exercises.sort(() => Math.random() - 0.5);
  }

  const newWords = queue.filter((item) => {
    const card = progress[item.id];
    return !card || (card.reps || 0) === 0;
  });

  // Phase 0 (v68) PRETESTING — "have a guess first".
  //
  // Counter-intuitive but well replicated: attempting an answer BEFORE being
  // taught produces better retention than being taught first, even when the
  // guess is wrong — provided the correct answer follows immediately.
  // (Pan & Sana 2021 found pretesting beat post-testing across formats, with
  // and without feedback; reported effect sizes d ~= 0.35-0.75.)
  //
  // The guess is deliberately harmless: no heart is lost, it doesn't count
  // toward lesson accuracy, and it never touches SRS scheduling. Its only job
  // is to prime attention before the word is introduced.
  //
  // Capped at 3 so a lesson never opens with a wall of unanswerable questions.
  if (newWords.length > 0) {
    for (const item of newWords.slice(0, 3)) {
      const ex = buildExerciseOfType(item, EXERCISE.PICK_WORD, pool, null, 0, progress);
      if (ex) {
        ex.pretest = true;
        exercises.push(ex);
      }
    }
  }

  // Phase 1: intro flashcards
  if (newWords.length > 0) {
    exercises.push({
      type: EXERCISE.INTRODUCE_BATCH,
      items: newWords,
      prompt: `Learn ${newWords.length} new word${newWords.length === 1 ? "" : "s"}`,
    });
  }

  // Phase 2: graduated retrieval — each queue word gets multiple exercises at
  // progressively harder levels (recognise → recall → produce). Same word,
  // different difficulties, all in one lesson. Will be interleaved with other
  // words below so we never see the same word back-to-back.
  const perWordSets = queue.map((item) => ({
    item,
    exercises: buildGraduatedSet(item, pool, progress[item.id], progress),
  }));

  // Phase 3: conjugation injection — for any verbs in the queue that have
  // conjugation data, add one CONJUGATE exercise. New verbs ARE eligible
  // because they're introduced in this lesson's flashcard batch first, so
  // the learner has seen the dictionary form before the conjugation question.
  const conjugationExercises = [];
  if (conjugations && langCode) {
    for (const item of queue) {
      const cex = buildConjugationExercise(item, langCode, conjugations);
      if (cex) conjugationExercises.push(cex);
    }
  }

  // Phase 3b (v34b): TENSE injection — for verbs in queue that have past/future
  // tense data AND the learner has seen the verb at least once (reps >= 1),
  // occasionally inject a tense exercise. Gated on reps to avoid throwing past
  // tense at a verb the learner has literally just met. Maximum one tense
  // exercise per queue verb per lesson to keep things digestible.
  const tenseExercises = [];
  if (tenses && langCode && tenses[langCode]) {
    for (const item of queue) {
      const reps = progress[item.id]?.reps || 0;
      if (reps < 1) continue; // skip brand-new
      // Choose past or future randomly if both available, else whichever exists
      const hasPast = !!tenses[langCode].past?.[item.lemma];
      const hasFuture = !!tenses[langCode].future?.[item.lemma];
      if (!hasPast && !hasFuture) continue;
      let tense;
      if (hasPast && hasFuture) tense = Math.random() < 0.5 ? "past" : "future";
      else tense = hasPast ? "past" : "future";
      const tex = buildTenseExercise(item, langCode, tense, tenses, { [langCode]: conjugations });
      if (tex) tenseExercises.push(tex);
    }
  }

  // Phase 4: reinforcement — bring back previously-learned words so they don't
  // fade. With graduated retrieval producing 2-3 exercises per queue word, the
  // lesson is already content-rich; we only top up if total is still under 10.
  const TARGET_TESTABLE = 10;
  const perWordTotal = perWordSets.reduce((n, s) => n + s.exercises.length, 0);
  const reinforcement = [];
  const need = Math.max(0, TARGET_TESTABLE - perWordTotal - conjugationExercises.length - tenseExercises.length);

  if (need > 0) {
    const queueIds = new Set(queue.map((q) => q.id));
    const learnedPool = pool.filter((w) =>
      !queueIds.has(w.id) && progress[w.id]?.reps > 0
    );
    learnedPool.sort((a, b) => {
      const pa = progress[a.id], pb = progress[b.id];
      const lapsesDiff = (pb?.lapses || 0) - (pa?.lapses || 0);
      if (lapsesDiff !== 0) return lapsesDiff;
      return (pa?.lastReview || 0) - (pb?.lastReview || 0);
    });
    const reinforcementPicks = learnedPool.slice(0, need);
    for (const item of reinforcementPicks) {
      const card = progress[item.id];
      reinforcement.push(buildExercise(item, pool, card, 0, progress));
    }
  }

  // Phase 4b (v35): VARIETY exercise — once per lesson, add a match-pairs or
  // odd-one-out using learned words. Breaks the single-answer rhythm. Only when
  // there's enough learned vocabulary to build one cleanly. Placed in its own
  // bucket so the interleaver treats it like any other extra.
  const varietyExercises = [];
  {
    const queueIds = new Set(queue.map((q) => q.id));
    const learnedWords = pool.filter((w) =>
      (progress[w.id]?.reps > 0 || queueIds.has(w.id)) && w.lemma && w.translation
    );
    if (learnedWords.length >= 5) {
      // Alternate between the two formats based on a coin flip
      if (Math.random() < 0.5) {
        const mp = allowed(EXERCISE.MATCH_PAIRS) ? buildMatchPairs(shuffle(learnedWords).slice(0, 4)) : null;
        if (mp) varietyExercises.push(mp);
      } else {
        // odd-one-out needs a seed item with a category that has >=3 members
        const seed = shuffle(learnedWords).find((w) => {
          const sameCat = learnedWords.filter((x) => x.category === w.category);
          const otherCat = learnedWords.filter((x) => x.category && x.category !== w.category);
          return sameCat.length >= 3 && otherCat.length >= 1;
        });
        if (seed) {
          const oo = allowed(EXERCISE.ODD_ONE_OUT) ? buildOddOneOut(seed, learnedWords) : null;
          if (oo) varietyExercises.push(oo);
        }
      }
    }
  }

  // Phase 5: interleave. CRITICAL — keep the per-word ORDER preserved (L1
  // before L2 before L3) but ensure no word appears back-to-back. We do this
  // with a round-robin: take the first exercise from each word's list, then
  // the second from each, etc. That naturally interleaves while preserving
  // intra-word progression.
  const interleaved = [];
  let i = 0;
  while (perWordSets.some((s) => s.exercises[i])) {
    for (const s of perWordSets) {
      if (s.exercises[i]) interleaved.push(s.exercises[i]);
    }
    i++;
  }

  // Sprinkle conjugation + reinforcement throughout — insert at random valid
  // positions, but avoid placing an exercise next to another for the same word.
  const finalMix = [...interleaved];
  // Phase 4c (v68) HYBRID BLOCKED -> INTERLEAVED PRACTICE.
  //
  // Interleaving (mixing words from different units) beats blocked practice for
  // long-term retention, because it forces discrimination between items rather
  // than letting a learner coast on one category. BUT the same literature is
  // clear that it BACKFIRES for beginners: Hwang (2025, Language Learning)
  // found interleaving alone actively harmed low-achieving L2 vocabulary
  // learners through cognitive overload, and that a HYBRID — block first, then
  // interleave once a threshold of solid knowledge exists — outperformed both.
  //
  // So this only switches on once the learner has a real base of established
  // words. Below that, lessons stay blocked, which is the correct treatment
  // for someone still forming their first form-meaning links.
  const INTERLEAVE_MIN_ESTABLISHED = 20;
  const discrimination = [];
  const qIds = new Set(queue.map((q) => q.id));
  const established = pool.filter((w) => !qIds.has(w.id) && (progress[w.id]?.reps || 0) >= 2);
  if (established.length >= INTERLEAVE_MIN_ESTABLISHED) {
    const picks = [...established].sort(() => Math.random() - 0.5).slice(0, 2);
    for (const item of picks) {
      const ex = buildExercise(item, pool, progress[item.id], 0, progress);
      if (ex) {
        ex.interleaved = true;
        discrimination.push(ex);
      }
    }
  }

  const extras = [...conjugationExercises, ...tenseExercises, ...reinforcement, ...discrimination, ...varietyExercises].sort(() => Math.random() - 0.5);
  for (const ex of extras) {
    const myId = ex.item?.id;
    // Find positions where inserting won't create a same-word back-to-back
    const validPositions = [];
    for (let pos = 0; pos <= finalMix.length; pos++) {
      const beforeId = pos > 0 ? finalMix[pos - 1].item?.id : null;
      const afterId  = pos < finalMix.length ? finalMix[pos].item?.id : null;
      if (myId && (beforeId === myId || afterId === myId)) continue;
      validPositions.push(pos);
    }
    const insertAt = validPositions.length
      ? validPositions[Math.floor(Math.random() * validPositions.length)]
      : finalMix.length; // last resort: append (shouldn't happen in practice)
    finalMix.splice(insertAt, 0, ex);
  }

  exercises.push(...finalMix);

  // Phase 5 (v70) SAY IT OUT LOUD — one spoken production exercise per lesson.
  //
  // WHY IT'S LAST AND WHY IT'S ONE. Speaking is the highest-effort retrieval the
  // app can ask for, so it goes after the word has been recognised and recalled
  // in the same session — asking someone to pronounce a word they met ninety
  // seconds ago tests courage, not memory. Gated on reps >= 1 for the same
  // reason. One per lesson keeps it a moment rather than a gauntlet, and means a
  // learner with no microphone loses very little (it falls back to typing).
  const speakable = allowed(EXERCISE.SPEAK_PROMPT)
    ? queue.filter((item) => (progress[item.id]?.reps || 0) >= 1 && item.lemma)
    : [];
  if (speakable.length) {
    const pick = speakable[Math.floor(Math.random() * speakable.length)];
    exercises.push({
      type: EXERCISE.SPEAK_PROMPT,
      item: pick,
      answer: pick.lemma,
      prompt: "Say it out loud",
    });
  }

  return exercises;
}

function buildIntroduce(item) {
  return {
    type: EXERCISE.INTRODUCE,
    item,
    prompt: "New word",
    showWord: true,
    playAudio: true,
    answer: null, // no answer needed — just tap continue
  };
}

// v82: carry "this one has been fighting you" through to the feedback card, so
// the app can say it out loud. Someone failing the same word for the sixth time
// is already drawing a conclusion about themselves; it costs nothing to tell
// them it's a normal thing that happens to a few words in every language, and
// silence on the subject is its own message.
//
// Set here rather than read from progress in the UI because the generator
// already has the card, and the alternative is threading learner state into a
// component that has managed without it.
function markStruggling(exercise, card) {
  if (exercise && (card?.lapses || 0) >= 3) exercise.struggling = true;
  return exercise;
}

function buildExercise(item, pool, card, _depth = 0, progress = {}) {
  const reps = card?.reps || 0;
  const type = chooseExerciseType(reps, item, card?.lapses || 0);
  return markStruggling(buildExerciseOfType(item, type, pool, card, _depth, progress), card);
}

// v32: explicit-type variant — same renderer, takes the type as a parameter
// instead of choosing it. Used by buildGraduatedSet to generate multiple
// exercises of EXPLICIT difficulty levels for one word in a single lesson.
// Set for the current lesson, read by buildExerciseOfType. Module-scoped rather
// than threaded through nine call sites; generateLesson sets it on entry.
let DISABLED = null;

/** Is this exercise type available to build right now? */
function allowed(type) {
  return !DISABLED || !DISABLED.has(type);
}

function buildExerciseOfType(item, type, pool, card, _depth = 0, progress = {}) {
  // A disabled type falls back to the simplest always-available question rather
  // than producing nothing.
  const UNDISABLEABLE = [EXERCISE.PICK_MEANING, EXERCISE.PICK_WORD, EXERCISE.INTRODUCE, EXERCISE.INTRODUCE_BATCH];
  if (!allowed(type) && !UNDISABLEABLE.includes(type)) {
    type = EXERCISE.PICK_WORD;
  }
  // Options are labelled by translation for meaning-picking exercises and by
  // lemma for word-picking ones, so the two sets are deduped separately —
  // "tomorrow" appearing twice and "غدا"/"بكرة" appearing twice are different
  // collisions and only one matters per exercise type.
  const byMeaning = pickDistractors(item, pool, NUM_DISTRACTORS, (p) => p.translation);
  const byWord = pickDistractors(item, pool, NUM_DISTRACTORS, (p) => p.lemma);
  const distractors = byMeaning.length ? byMeaning : byWord;

  // Safe fallback: if recursion gets too deep, always return a simple pick_meaning
  const safeFallback = () => ({
    type: EXERCISE.PICK_MEANING,
    item,
    prompt: "What does this word mean?",
    showWord: true,
    playAudio: false,
    options: shuffle([item.translation, ...byMeaning.map((d) => d.translation)]).filter(Boolean),
    answer: item.translation,
  });

  if (_depth > 2) return safeFallback();

  // -------------------------------------------------------------------------
  // SENTENCE REUSE — pick the example sentence that best reinforces words
  // the user has already learned. We score each candidate sentence by how
  // many of its words are also in the learned vocab pool. Higher = better.
  // -------------------------------------------------------------------------
  const pickBestExample = () => {
    const examples = item.examples || [];
    if (examples.length <= 1) return examples[0] || null;

    // Build a set of learned-word lemmas (any word with reps > 0)
    const learnedLemmas = new Set();
    for (const w of pool) {
      if (progress[w.id]?.reps > 0) learnedLemmas.add(w.lemma);
    }

    // Score each example: count how many words in it are learned
    let best = examples[0];
    let bestScore = -1;
    for (const ex of examples) {
      if (!ex?.native) continue;
      const words = ex.native.split(/\s+/);
      let score = 0;
      for (const w of words) {
        if (learnedLemmas.has(w)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        best = ex;
      }
    }
    return best;
  };

  // Filter out undefined from options
  const safeOptions = (arr) => arr.filter((x) => x != null && x !== undefined);

  switch (type) {
    case EXERCISE.PICK_MEANING:
      return {
        type,
        item,
        prompt: "What does this word mean?",
        showWord: true,
        playAudio: false,
        options: safeOptions(shuffle([item.translation, ...byMeaning.map((d) => d.translation)])),
        answer: item.translation,
      };

    case EXERCISE.PICK_WORD:
      return {
        type,
        item,
        prompt: `Pick the word for "${item.translation}"`,
        showWord: false,
        playAudio: false,
        options: safeOptions(shuffle([item.lemma, ...byWord.map((d) => d.lemma)])),
        answer: item.lemma,
      };

    case EXERCISE.LISTEN_PICK:
      return {
        type,
        item,
        prompt: "Tap the word you hear",
        showWord: false,
        playAudio: true,
        options: safeOptions(shuffle([item.translation, ...byMeaning.map((d) => d.translation)])),
        answer: item.translation,
      };

    case EXERCISE.TYPE_TRANSLATION:
      return {
        type,
        item,
        prompt: "Type the meaning in English",
        showWord: true,
        playAudio: false,
        answer: item.translation,
      };

    // v59: LETTER SCRAMBLE — spell the word yourself from shuffled letter
    // tiles. Pure production at the letter level; makes the learner attend to
    // the word's actual spelling (great for special characters like ç/ğ/ş).
    // Only offered for single-word, Latin-script lemmas of a friendly length —
    // chooseExerciseType gates this via canScramble(), but we re-check here
    // because explicit-type callers (graduated sets) can request it directly.
    case EXERCISE.LETTER_SCRAMBLE: {
      if (!canScramble(item)) {
        return buildExercise(item, pool, { ...card, reps: 1 }, _depth + 1, progress);
      }
      const letters = item.lemma.split("");
      return {
        type,
        item,
        prompt: `Spell the word for "${item.translation}"`,
        translation: item.translation,
        showWord: false,
        playAudio: false,
        bank: shuffle([...letters]),
        answer: item.lemma,
      };
    }

    // v59: TRUE / FALSE — a fast judgement call. Half the time the shown
    // meaning is right, half the time it's a same-category distractor. Quick,
    // low-friction recognition that adds variety between heavier exercises.
    case EXERCISE.TRUE_FALSE: {
      // The lie must differ from the truth, or the claim shown is actually TRUE
      // while the graded answer is "False" — unanswerable, and it costs a heart.
      const lie = byMeaning.find((d) => d.translation && d.translation !== item.translation)?.translation;
      if (!lie) return safeFallback();
      const truthful = Math.random() < 0.5;
      const claim = truthful ? item.translation : lie;
      return {
        type,
        item,
        prompt: `True or false: this means "${claim}"`,
        showWord: true,
        playAudio: false,
        options: ["True", "False"],
        answer: truthful ? "True" : "False",
      };
    }

    case EXERCISE.TAP_WORDS: {
      const ex = pickBestExample();
      if (!ex || !ex.native || ex.native.split(" ").length < 2) {
        return buildExercise(item, pool, { ...card, reps: 1 }, _depth + 1, progress);
      }
      const words = ex.native.split(" ").filter(Boolean);
      const distractorWords = distractors
        .flatMap((d) => (d.examples?.[0]?.native || d.lemma).split(" "))
        .filter((w) => w && !words.includes(w))
        .slice(0, 2);
      return {
        type,
        item,
        prompt: "Tap the words in order",
        translation: ex.translation || item.translation,
        showWord: false,
        playAudio: false,
        bank: shuffle([...words, ...distractorWords]),
        answer: words.join(" "),
      };
    }

    case EXERCISE.COMPLETE_SENTENCE: {
      const ex = pickBestExample();
      if (!ex || !ex.native || !ex.native.includes(item.lemma)) {
        return buildExercise(item, pool, { ...card, reps: 0 }, _depth + 1, progress);
      }
      const sentenceWithBlank = ex.native.replace(item.lemma, "____");
      // v34b: stricter distractor picking for fill-in-the-gap — same category
      // AND comparable word length (so distractors LOOK like they could fit).
      // This makes the choice about MEANING, not visual elimination.
      const fillDistractors = pickGrammaticalDistractors(item, pool, NUM_DISTRACTORS, (p) => p.lemma);
      return {
        type,
        item,
        prompt: "Complete the sentence",
        sentence: sentenceWithBlank,
        translation: ex.translation || item.translation,
        showWord: false,
        playAudio: false,
        options: safeOptions(shuffle([item.lemma, ...fillDistractors.map((d) => d.lemma)])),
        answer: item.lemma,
      };
    }

    case EXERCISE.BUILD_SENTENCE: {
      // Productive: show English, user taps native words in correct order.
      // Uses pickBestExample to prefer sentences with words user has learned.
      const ex = pickBestExample();
      if (!ex || !ex.native || ex.native.split(" ").length < 2) {
        return buildExercise(item, pool, { ...card, reps: 2 }, _depth + 1, progress);
      }
      const words = ex.native.split(" ").filter(Boolean);
      // Add 2-3 distractor words that don't appear in the answer
      const distractorWords = distractors
        .flatMap((d) => (d.examples?.[0]?.native || d.lemma).split(" "))
        .filter((w) => w && !words.includes(w))
        .slice(0, 3);
      return {
        type,
        item,
        prompt: "Build this sentence",
        translation: ex.translation || item.translation,
        showWord: false,
        playAudio: false,
        bank: shuffle([...words, ...distractorWords]),
        answer: words.join(" "),
      };
    }

    default:
      return safeFallback();
  }
}

// =============================================================================
// v29 — CONJUGATION EXERCISE
// Asks the learner to pick the right conjugated form for a given person.
// Prompt: "How do you say: I + <verb meaning>?"  e.g. "I + to go"
// Options: the correct form for that person + 3 other-person forms as
// distractors (so the learner must distinguish forms by person).
//
// langCode + vocab item + conjugation table are passed in by the caller.
// Returns null if the verb has no conjugation data — caller falls back.
// =============================================================================
function buildConjugationExercise(item, langCode, conjugations) {
  // v34c FIX: guard against noun-verb homographs (e.g. Urdu کھانا is BOTH
  // "food, meal" (noun) AND "to eat" (verb) with identical spelling). Without
  // this check, the noun entry gets matched to verb conjugation data, producing
  // nonsense prompts like "How do you say: 'You food, meal'?"
  // The check: a real verb's English translation starts with "to ".
  const isVerb = /^to\s+/i.test(item.translation || "");
  if (!isVerb) return null;

  const verbTable = conjugations?.verbs?.[item.lemma];
  if (!verbTable) return null;

  const PERSONS = ["I", "you", "he", "she", "we", "they"];
  // Pick a random person to test
  const person = PERSONS[Math.floor(Math.random() * PERSONS.length)];
  const correct = verbTable[person];
  if (!correct?.form) return null;

  // Build distractors from OTHER persons. Dedupe by form (languages where
  // all persons share one form — zh, ja, ko — will fall back gracefully).
  const otherForms = PERSONS
    .filter((p) => p !== person)
    .map((p) => verbTable[p])
    .filter((f) => f?.form && f.form !== correct.form);

  const distractorForms = [];
  const seen = new Set([correct.form]);
  for (const f of otherForms) {
    if (!seen.has(f.form)) {
      seen.add(f.form);
      distractorForms.push(f);
    }
  }

  // Need at least 1 distractor for a meaningful question. If the language
  // has zero variation (like Mandarin), let caller handle — return null.
  if (distractorForms.length < 1) return null;

  // Shuffle distractors and take up to 3
  const picks = distractorForms.sort(() => Math.random() - 0.5).slice(0, 3);
  const allOptions = shuffle([correct, ...picks]);

  // Prompt: "I + to go" — clearer than trying to render "I go" in English
  // for verbs that aren't standalone (helps Spanish "Voy"="(I) go" cases too).
  const pronounEn = { I: "I", you: "you", he: "he", she: "she", we: "we", they: "they" }[person];
  const verbMeaningRaw = item.translation || "";
  // If translation starts with "to ", strip it — "to go" + person → "I + go"
  const verbMeaning = verbMeaningRaw.replace(/^to\s+/i, "");

  return {
    type: EXERCISE.CONJUGATE,
    item,
    person,
    prompt: `How do you say: "${pronounEn} ${verbMeaning}"?`,
    options: allOptions.map((o) => ({ form: o.form, translit: o.translit })),
    answer: correct.form,
    answerTranslit: correct.translit,
    note: conjugations?.note || null, // surface the language-specific teaching note
  };
}

// =============================================================================
// v34b — TENSE EXERCISE (past / future)
// Asks the learner to pick the right tense form for a given person + tense.
// Distractors: include the PRESENT-tense form so the learner must distinguish
//   "I go" from "I went" / "I will go" — that's the lesson itself.
// =============================================================================
function buildTenseExercise(item, langCode, tense, tenses, conjugations) {
  // v34c FIX: same noun-verb-homograph guard as buildConjugationExercise.
  // Without this, کھانا the noun would be asked in past/future tense, which
  // is incoherent.
  const isVerb = /^to\s+/i.test(item.translation || "");
  if (!isVerb) return null;

  const tenseTable = tenses?.[langCode]?.[tense]?.[item.lemma];
  if (!tenseTable) return null;

  const PERSONS = ["I", "you", "he", "she", "we", "they"];
  // Pick a random person
  const person = PERSONS[Math.floor(Math.random() * PERSONS.length)];
  const correct = tenseTable[person];
  if (!correct?.form) return null;

  // Distractor pool: present-tense form of the same verb (the lesson — "this is
  // PAST, not present"), and other-person forms in the same tense.
  const distractorPool = [];
  const seen = new Set([correct.form]);

  // 1. Present tense form for the same person — strong distractor (teaches tense)
  const presentForm = conjugations?.[langCode]?.verbs?.[item.lemma]?.[person];
  if (presentForm?.form && !seen.has(presentForm.form)) {
    distractorPool.push(presentForm);
    seen.add(presentForm.form);
  }

  // 2. Other-person forms in the same tense
  for (const p of PERSONS) {
    if (p === person) continue;
    const f = tenseTable[p];
    if (f?.form && !seen.has(f.form)) {
      distractorPool.push(f);
      seen.add(f.form);
    }
  }

  if (distractorPool.length < 1) return null;

  // Shuffle distractors and take up to 3
  const picks = distractorPool.sort(() => Math.random() - 0.5).slice(0, 3);
  const allOptions = shuffle([correct, ...picks]);

  const pronounEn = { I: "I", you: "you", he: "he", she: "she", we: "we", they: "they" }[person];
  const verbMeaningRaw = item.translation || "";
  const verbMeaning = verbMeaningRaw.replace(/^to\s+/i, "");

  // Build the English prompt based on tense
  let englishPhrase;
  if (tense === "past") {
    // Use a generic past phrasing — "yesterday X verbed"
    englishPhrase = `${pronounEn} ${pastForm(verbMeaning)}`;
  } else { // future
    englishPhrase = `${pronounEn} will ${verbMeaning}`;
  }

  return {
    type: EXERCISE.CONJUGATE_TENSE,
    item,
    person,
    tense,
    prompt: `How do you say: "${englishPhrase}"?`,
    options: allOptions.map((o) => ({ form: o.form, translit: o.translit })),
    answer: correct.form,
    answerTranslit: correct.translit,
    note: tenses?.[langCode]?.[`${tense}Note`] || null,
    tenseName: tenses?.[langCode]?.[`${tense}Name`] || (tense === "past" ? "Past" : "Future"),
  };
}

// Very simple English past-tense renderer for the prompt only. Doesn't need
// linguistic precision — just enough to convey "I + past action".
function pastForm(verb) {
  const v = (verb || "").trim();
  // A small irregular list covering the common verbs in our content
  const irregulars = {
    "go": "went", "eat": "ate", "drink": "drank", "speak": "spoke",
    "have": "had", "be": "was", "do": "did", "see": "saw", "want": "wanted",
    "know": "knew", "think": "thought", "say": "said", "give": "gave",
    "take": "took", "hear": "heard", "come": "came", "sleep": "slept",
    "buy": "bought", "make": "made",
  };
  if (irregulars[v]) return irregulars[v];
  // Generic rule: ends in 'e' → +d; else +ed; ends in consonant+y → ied
  if (v.endsWith("e")) return v + "d";
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ied";
  return v + "ed";
}

// =============================================================================
// v32 — GRADUATED RETRIEVAL
// For a single vocab word, return an ORDERED list of exercises at
// progressively harder levels:
//   L1 RECOGNISE  PICK_MEANING — easiest: see word, pick meaning
//   L2 RECALL     PICK_WORD    — recall: see meaning, pick word
//   L3 PRODUCE    COMPLETE_SENTENCE — hardest: use the word in a sentence
//
// The graduation depends on what the learner has seen before:
//   reps 0 (new):       all 3 levels (recognise → recall → produce)
//   reps 1-2 (known):   skip L1, do L2 + L3
//   reps 3+ (mature):   just L3 (produce only)
// Production (L3) only happens if a sentence is available; otherwise drop it.
//
// Result: the SAME word is tested at multiple difficulties in ONE lesson,
// building from "do you recognise this?" to "can you use it in a sentence?"
// — which is the pedagogical model the user asked for.
// =============================================================================
// =============================================================================
// v35 — MATCH_PAIRS: show 4 words + 4 meanings, learner taps to pair them.
// A review-style exercise using words the learner has already met. Great for
// breaking the rhythm of single-answer questions.
// Returns null if there aren't enough distinct words to make 4 pairs.
// =============================================================================
function buildMatchPairs(items) {
  // items: array of vocab entries to pair (need at least 3, ideally 4)
  //
  // v75: the meaning column is what gets tapped, so two pairs sharing a meaning
  // leaves one of them permanently unmatchable — the learner can never complete
  // the exercise and the Check button never enables. That is a hard stop in the
  // middle of a lesson, and it reads exactly like the lesson has broken.
  const seenMeaning = new Set();
  const usable = shuffle(items.filter((it) => it && it.lemma && it.translation))
    .filter((it) => {
      if (seenMeaning.has(it.translation)) return false;
      seenMeaning.add(it.translation);
      return true;
    });
  if (usable.length < 3) return null;
  const chosen = usable.slice(0, 4);

  // Each pair: { id, lemma, translit, meaning }
  const pairs = chosen.map((it) => ({
    id: it.id,
    lemma: it.lemma,
    translit: it.translit || "",
    meaning: it.translation,
  }));

  return {
    type: EXERCISE.MATCH_PAIRS,
    prompt: "Match each word to its meaning",
    pairs,
    // The "answer" is the full correct mapping id->meaning; grading checks all matched.
    answer: pairs.map((p) => `${p.id}:${p.meaning}`).sort().join("|"),
  };
}

// =============================================================================
// v35 — ODD_ONE_OUT: show 4 words, 3 from one category + 1 from another.
// Learner picks the one that doesn't belong. Teaches category/semantic grouping.
// Returns null if we can't find 3 same-category + 1 different.
// =============================================================================
function buildOddOneOut(item, pool) {
  // Find 3 words (including item) sharing item's category
  const sameCat = shuffle(pool.filter((p) => p.category === item.category && p.lemma));
  if (sameCat.length < 3) return null;
  const group = sameCat.slice(0, 3);

  // Find 1 word from a DIFFERENT category — this is the odd one
  const otherCat = shuffle(pool.filter((p) => p.category && p.category !== item.category && p.lemma));
  if (otherCat.length < 1) return null;
  const odd = otherCat[0];

  const options = shuffle([...group, odd]).map((w) => ({
    id: w.id,
    lemma: w.lemma,
    translit: w.translit || "",
    meaning: w.translation,
    isOdd: w.id === odd.id,
  }));

  return {
    type: EXERCISE.ODD_ONE_OUT,
    prompt: `Which word doesn't belong? (3 are "${item.category}")`,
    options,
    answer: odd.lemma,
    oddCategory: odd.category,
    groupCategory: item.category,
  };
}

function buildGraduatedSet(item, pool, card, progress = {}) {
  const reps = card?.reps || 0;
  const lapses = card?.lapses || 0;
  const examples = item.examples || [];
  const hasShortSentence = examples.some((ex) => {
    const w = (ex?.native || "").split(/\s+/).filter(Boolean).length;
    return w >= 2;
  });

  // Decide which levels to include based on familiarity
  const levels = [];
  // v82: a word someone keeps losing gets its own rung — see the leech note
  // above chooseExerciseType.
  //
  // Deliberately ONE exercise, which took three tries to get right. Routing a
  // struggling word through the "new word" ladder instead ran lessons 23%
  // longer, and a two-rung version 13% longer; measured over twelve simulated
  // learners those bought about one further word rescued, at the cost of two
  // extra questions in every lesson every day for everyone. Longer sessions are
  // their own way of losing people. Easier questions, not more of them.
  if (lapses >= 3) {
    levels.push(
      hasShortSentence && Math.random() < 0.5
        ? EXERCISE.COMPLETE_SENTENCE   // the word held up by its own sentence
        : EXERCISE.PICK_MEANING        // a win to build from
    );
  } else if (reps === 0) {
    levels.push(EXERCISE.PICK_MEANING); // recognise
    // v59: sometimes swap plain recognition for a fast true/false judgement
    if (Math.random() < 0.3) levels.push(EXERCISE.TRUE_FALSE);
    levels.push(EXERCISE.PICK_WORD);     // recall
    if (hasShortSentence) levels.push(EXERCISE.COMPLETE_SENTENCE); // produce
  } else if (reps < 3) {
    levels.push(EXERCISE.PICK_WORD);     // recall
    // v59: spell it yourself — letter-level production for Latin-script words
    if (canScramble(item) && Math.random() < 0.4) levels.push(EXERCISE.LETTER_SCRAMBLE);
    if (hasShortSentence) levels.push(EXERCISE.COMPLETE_SENTENCE);
  } else {
    // Mature: production only (or recall if no sentence available)
    if (canScramble(item) && Math.random() < 0.25) levels.push(EXERCISE.LETTER_SCRAMBLE);
    if (hasShortSentence) levels.push(EXERCISE.COMPLETE_SENTENCE);
    else levels.push(EXERCISE.PICK_WORD);
  }

  // Build the exercises
  return levels.map((type) =>
    markStruggling(buildExerciseOfType(item, type, pool, card, 0, progress), card)
  );
}

// v59: LETTER_SCRAMBLE eligibility — single word, Latin script (incl. Turkish
// ç ğ ı ö ş ü and Western European accents), 3–12 letters. Scripts like Arabic,
// Devanagari, Hangul, or kanji don't decompose into tappable "letters" the
// same way, so those languages simply never see this exercise.
function canScramble(item) {
  const lemma = item?.lemma || "";
  if (lemma.length < 3 || lemma.length > 12) return false;
  if (lemma.includes(" ")) return false;
  return /^[a-zA-ZçğıöşüâîûÇĞİÖŞÜáéíóúñüàèìòùäëïöß']+$/.test(lemma);
}

// =============================================================================
// v82 — THE LEECH SPIRAL, and why `reps` alone was the wrong question to ask.
//
// `reps` counts how many times a word has been PUT IN FRONT of someone. It only
// ever goes up, and it goes up just as fast when they get it wrong. So a word
// someone has failed six times has a high rep count, is treated as well known,
// and is handed the hardest exercise in the set — type it cold, build a sentence
// with it. They fail. Stability collapses. It comes back tomorrow. It gets asked
// the same way. They fail again.
//
// In spaced repetition these are called LEECHES, and they are one of the main
// reasons people quit: a handful of words dominate every session, and every
// session ends in being wrong about the same things. Anki's answer is to suspend
// the card, which for a language course means quietly deciding someone will
// never learn "because". That isn't an answer, it's giving up on their behalf.
//
// The better answer is that the WORD isn't the problem, the QUESTION is. A
// learner who cannot type a word from cold can very often pick it out of four,
// or read it inside a sentence that carries its meaning. That isn't a
// consolation prize — a successful retrieval is the thing that builds stability
// in the first place, and an easy success does more for a fading memory than a
// hard failure ever will. Get one win, and the word has somewhere to grow from.
//
// So difficulty is chosen from an EFFECTIVE rep count that lapses pull back
// down, and past a certain point the word is deliberately met in context, where
// there is something to hold on to.
//
// Measured with scripts/simulate-leech.mjs — a learner for whom some words are
// genuinely hard, which is every learner.
// =============================================================================
function effectiveReps(reps, lapses) {
  if (lapses >= 5) return 0;  // meet it as if new: recognition, and in a sentence
  if (lapses >= 3) return 1;  // ease off production, keep the context work
  if (lapses >= 2) return Math.min(reps, 2);
  return reps;
}

function chooseExerciseType(reps, item, lapses = 0) {
  const ex0 = item.examples?.[0]?.native || "";
  const exWords = ex0.split(" ").filter(Boolean).length;
  const hasShortSentence = exWords >= 2;        // enough for TAP_WORDS / COMPLETE
  const hasRealSentence = exWords >= 3;         // enough for a meaningful BUILD

  // A word that is genuinely fighting them. Show it inside its sentence where
  // possible — a word that won't stick alone often sticks in context, which is
  // the entire comprehensible-input argument — and otherwise ask the most
  // winnable question there is. Never cold production: that is what has been
  // failing.
  if (lapses >= 5) {
    const r = Math.random();
    if (hasShortSentence && r < 0.45) return EXERCISE.COMPLETE_SENTENCE;
    if (r < 0.7) return EXERCISE.PICK_MEANING;
    return EXERCISE.LISTEN_PICK;
  }

  reps = effectiveReps(reps, lapses);

  // Brand new (reps 0): gentle — but if there's a sentence, occasionally show
  // it via COMPLETE_SENTENCE so learners see words IN CONTEXT from the start,
  // not just isolated. Words alone don't teach language; context does.
  if (reps === 0) {
    const r = Math.random();
    if (r < 0.5) return EXERCISE.PICK_MEANING;
    if (r < 0.6) return EXERCISE.TRUE_FALSE;    // v59: fast, low-stakes first contact
    if (r < 0.78) return EXERCISE.LISTEN_PICK;
    if (hasShortSentence) return EXERCISE.COMPLETE_SENTENCE; // see it in a sentence
    return EXERCISE.PICK_MEANING;
  }

  // Building familiarity (reps 1-2): real mix of recognition AND production.
  // Sentence work now appears ~40% of the time, not just for mature words.
  if (reps < 3) {
    const r = Math.random();
    if (r < 0.22) return EXERCISE.PICK_MEANING;
    if (r < 0.32 && canScramble(item)) return EXERCISE.LETTER_SCRAMBLE; // v59: spell it yourself
    if (r < 0.42) return EXERCISE.PICK_WORD;
    if (r < 0.5) return EXERCISE.LISTEN_PICK;
    if (r < 0.72 && hasShortSentence) return EXERCISE.COMPLETE_SENTENCE;
    if (r < 0.9 && hasRealSentence) return EXERCISE.TAP_WORDS;
    return EXERCISE.PICK_WORD;
  }

  // Mature (reps 3+): production-heavy. Building full sentences is the
  // priority — that's the actual skill, not word recognition.
  const r = Math.random();
  if (r < 0.4 && hasRealSentence) return EXERCISE.BUILD_SENTENCE;   // up from 0.3
  if (r < 0.62 && hasShortSentence) return EXERCISE.TAP_WORDS;
  if (r < 0.72 && canScramble(item)) return EXERCISE.LETTER_SCRAMBLE; // v59: spelling under pressure
  if (r < 0.8) return EXERCISE.TYPE_TRANSLATION;
  if (r < 0.92 && hasShortSentence) return EXERCISE.COMPLETE_SENTENCE;
  return EXERCISE.PICK_WORD;
}

/** Prefer distractors from the same category — feels less random. */
function pickDistractors(item, pool, n, labelOf = null) {
  const all = pool.filter((p) => p.id !== item.id);
  if (all.length === 0) return [];

  // v75 — DEDUPE BY WHAT THE LEARNER SEES, not by id.
  //
  // Two different words can share a translation: Arabic has more than one word
  // for "tomorrow", and the pack lists both. Deduping on id alone let both into
  // the same question, so the learner saw "tomorrow" twice, and tapping the
  // wrong identical option was marked wrong and cost a heart. There is no way
  // to be right in that question. The label the option RENDERS with is the only
  // thing that can be compared, so that is what's deduped.
  const label = labelOf || ((p) => p.id);
  const taken = new Set([label(item)]);
  const chosen = [];
  const consider = (d) => {
    if (chosen.length >= n) return;
    const l = label(d);
    if (l == null || l === "" || taken.has(l)) return;
    taken.add(l);
    chosen.push(d);
  };

  const sameCat = shuffle(all.filter((p) => p.category === item.category));
  const others = shuffle(all.filter((p) => p.category !== item.category));
  // Prefer same category first, then fill from others, then anything.
  for (const src of [sameCat, others, shuffle(all)]) {
    for (const d of src) consider(d);
    if (chosen.length >= n) break;
  }
  return chosen;
}

// v34b: STRICTER distractor picking for COMPLETE_SENTENCE fill-in-the-gap.
// The "right" distractor here is a word that COULD GRAMMATICALLY FIT in the
// blank — same category (so it's the same kind of word), comparable length
// (so it's not visually obvious which is the answer), and not a near-synonym
// (since two correct-ish answers confuses the learner).
//
// Strategy:
//   1. First pool: same category AND same is-it-a-verb pattern.
//   2. Backfill: same category only.
//   3. Last resort: any pool item (matches old behaviour).
function pickGrammaticalDistractors(item, pool, n, labelOf = null) {
  const all = pool.filter((p) => p.id !== item.id);
  if (all.length === 0) return [];
  // Same rule as pickDistractors: no two options may render identically.
  const label = labelOf || ((p) => p.id);
  const takenLabels = new Set([label(item)]);

  // Detect if the target is a verb (translation starts with "to ")
  const isVerb = /^to\s/i.test(item.translation || "");
  const targetLen = (item.lemma || "").length;

  // Tier 1: same category, same verb-ness, length within ±50%
  const tier1 = shuffle(all.filter((p) => {
    if (p.category !== item.category) return false;
    const pIsVerb = /^to\s/i.test(p.translation || "");
    if (pIsVerb !== isVerb) return false;
    const pLen = (p.lemma || "").length;
    const ratio = targetLen > 0 ? pLen / targetLen : 1;
    return ratio >= 0.5 && ratio <= 2.0;
  }));

  // Tier 2: same category, regardless of length
  const tier2 = shuffle(all.filter((p) => p.category === item.category));

  // Tier 3: anything else
  const tier3 = shuffle(all);

  const chosen = [];
  for (const src of [tier1, tier2, tier3]) {
    for (const d of src) {
      if (chosen.length >= n) break;
      const l = label(d);
      if (l == null || l === "" || takenLabels.has(l)) continue;
      takenLabels.add(l);
      chosen.push(d);
    }
    if (chosen.length >= n) break;
  }
  return chosen;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Score the user's answer to an exercise. Returns { correct, expected, given } */
export function gradeAnswer(exercise, given) {
  // INTRODUCE / INTRODUCE_BATCH are informational — no answer to grade
  if (exercise.type === EXERCISE.INTRODUCE || exercise.type === EXERCISE.INTRODUCE_BATCH) {
    return { correct: true, expected: null, given: null, intro: true };
  }
  const norm = (s) => String(s || "").trim().toLowerCase().replace(/[.,!?،؟。]/g, "");
  let correct;
  if (exercise.type === EXERCISE.MATCH_PAIRS) {
    // given is expected to be the same id:meaning|... string format, sorted.
    // The UI builds this once all pairs are matched. Compare to answer.
    correct = String(given || "").split("|").sort().join("|") === exercise.answer;
  } else if (exercise.type === EXERCISE.TAP_WORDS || exercise.type === EXERCISE.BUILD_SENTENCE) {
    correct = norm(Array.isArray(given) ? given.join(" ") : given) === norm(exercise.answer);
  } else if (exercise.type === EXERCISE.TYPE_TRANSLATION) {
    // Forgiving: accept any of the translations if the answer has comma-separated alts
    const accepted = exercise.answer.split(/[,/]/).map(norm);
    correct = accepted.includes(norm(given));
  } else {
    correct = norm(given) === norm(exercise.answer);
  }
  return { correct, expected: exercise.answer, given };
}
