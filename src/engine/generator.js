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
};

const NUM_DISTRACTORS = 3;

/**
 * NEW LESSON FLOW (v8):
 *   1. If there are new words, show them as a batch of flashcards FIRST
 *      (single INTRODUCE_BATCH exercise wraps all new words).
 *   2. Then test ALL words (new + review) in mixed order with varied types.
 *   3. For mature words (reps>=3), inject occasional BUILD_SENTENCE.
 *
 * @param {Array} queue   ordered vocab items from selector.buildQueue
 * @param {Array} pool    full vocab pool to pull distractors from
 * @param {Object} progress cardState by id
 * @returns {Array} exercise objects ready for the UI
 */
export function generateLesson(queue, pool, progress = {}) {
  const exercises = [];
  const newWords = queue.filter((item) => {
    const card = progress[item.id];
    return !card || (card.reps || 0) === 0;
  });

  // Phase 1: batch-introduce all new words at once as a flashcard carousel
  if (newWords.length > 0) {
    exercises.push({
      type: EXERCISE.INTRODUCE_BATCH,
      items: newWords,
      prompt: `Learn ${newWords.length} new word${newWords.length === 1 ? "" : "s"}`,
    });
  }

  // Phase 2: test every word in queue with appropriate exercise type
  // (shuffled so new + review interleave)
  const shuffled = [...queue].sort(() => Math.random() - 0.5);
  for (const item of shuffled) {
    const card = progress[item.id];
    exercises.push(buildExercise(item, pool, card, 0, progress));
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

function buildExercise(item, pool, card, _depth = 0, progress = {}) {
  const reps = card?.reps || 0;
  const type = chooseExerciseType(reps, item);
  const distractors = pickDistractors(item, pool, NUM_DISTRACTORS);

  // Safe fallback: if recursion gets too deep, always return a simple pick_meaning
  const safeFallback = () => ({
    type: EXERCISE.PICK_MEANING,
    item,
    prompt: "What does this word mean?",
    showWord: true,
    playAudio: false,
    options: shuffle([item.translation, ...distractors.map((d) => d.translation)]).filter(Boolean),
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
        options: safeOptions(shuffle([item.translation, ...distractors.map((d) => d.translation)])),
        answer: item.translation,
      };

    case EXERCISE.PICK_WORD:
      return {
        type,
        item,
        prompt: `Pick the word for "${item.translation}"`,
        showWord: false,
        playAudio: false,
        options: safeOptions(shuffle([item.lemma, ...distractors.map((d) => d.lemma)])),
        answer: item.lemma,
      };

    case EXERCISE.LISTEN_PICK:
      return {
        type,
        item,
        prompt: "Tap the word you hear",
        showWord: false,
        playAudio: true,
        options: safeOptions(shuffle([item.translation, ...distractors.map((d) => d.translation)])),
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
      return {
        type,
        item,
        prompt: "Complete the sentence",
        sentence: sentenceWithBlank,
        translation: ex.translation || item.translation,
        showWord: false,
        playAudio: false,
        options: safeOptions(shuffle([item.lemma, ...distractors.map((d) => d.lemma)])),
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

function chooseExerciseType(reps, item) {
  const hasExample = item.examples?.[0]?.native?.split(" ").length >= 3;

  // Brand new: gentle introduction
  if (reps === 0) {
    return Math.random() < 0.7 ? EXERCISE.PICK_MEANING : EXERCISE.LISTEN_PICK;
  }
  // Building familiarity: mostly recognition, some production
  if (reps < 3) {
    const r = Math.random();
    if (r < 0.35) return EXERCISE.PICK_MEANING;
    if (r < 0.6) return EXERCISE.PICK_WORD;
    if (r < 0.75) return EXERCISE.LISTEN_PICK;
    if (r < 0.9 && hasExample) return EXERCISE.COMPLETE_SENTENCE;
    return EXERCISE.PICK_WORD;
  }
  // Mature: prefer production (recall, not recognise)
  const r = Math.random();
  // BUILD_SENTENCE for productive practice — but only if we have a sentence
  if (r < 0.3 && hasExample) return EXERCISE.BUILD_SENTENCE;
  if (r < 0.5 && item.examples?.[0]?.native?.split(" ").length >= 2) return EXERCISE.TAP_WORDS;
  if (r < 0.7) return EXERCISE.TYPE_TRANSLATION;
  if (r < 0.85 && item.examples?.length) return EXERCISE.COMPLETE_SENTENCE;
  return EXERCISE.PICK_WORD;
}

/** Prefer distractors from the same category — feels less random. */
function pickDistractors(item, pool, n) {
  const all = pool.filter((p) => p.id !== item.id);
  if (all.length === 0) return [];
  const sameCat = shuffle(all.filter((p) => p.category === item.category));
  const others = shuffle(all.filter((p) => p.category !== item.category));
  const chosen = [];
  // Prefer same category first, then fill from others
  for (const src of [sameCat, others]) {
    for (const d of src) {
      if (chosen.length >= n) break;
      if (!chosen.find((c) => c.id === d.id)) chosen.push(d);
    }
  }
  // If still not enough, fill with any remaining
  if (chosen.length < n) {
    for (const d of shuffle(all)) {
      if (chosen.length >= n) break;
      if (!chosen.find((c) => c.id === d.id)) chosen.push(d);
    }
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
  if (exercise.type === EXERCISE.TAP_WORDS || exercise.type === EXERCISE.BUILD_SENTENCE) {
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
