// =============================================================================
// speaking.js (v110) — a speaking ladder woven through every lesson.
//
// Until now a lesson asked for speech exactly once: one word, from memory, at
// the end. That trains recall of single words and nothing else — the learner
// never says a sentence, never repeats a native model while it's fresh, and
// the task on day 60 is the same as on day 2. Speaking is a skill that grows
// in steps, and each step needs the one before it:
//
//   ECHO      hear a new word, say it straight back. Imitation, no memory
//             needed — the point is to get the mouth round the sounds while
//             the model is still ringing in the ear.
//   RECALL    say a word you've met, from its meaning (the v70 exercise).
//   SHADOW    hear a whole sentence and say it along/after the model:
//             rhythm, linking, intonation — what single words never give you.
//   SENTENCE  see what a sentence means and say it in the language, with the
//             key word as a hint. This is production: building an utterance.
//
// Which rungs a lesson uses depends on how much speaking the learner has done
// (good attempts, counted per language), so speaking gets harder as they get
// stronger — ECHO and RECALL from the start, SHADOW once they've had a few
// good tries, SENTENCE after that, and both sentence tasks at the top.
//
// ECHO, SHADOW and SENTENCE are PRACTICE: they never move a word's review
// schedule (imitating a model is not evidence of remembering it) and they sit
// outside the lesson's accuracy (skipping one because you're on a bus costs
// nothing). RECALL stays the one scheduled speaking task, as before.
// =============================================================================

export const SPEAK_MODE = { ECHO: "echo", RECALL: "recall", SHADOW: "shadow", SENTENCE: "sentence" };

export const SPEAKING_LEVELS = [
  { level: 1, at: 0, name: "Echo", can: "say new words back, and words you know from memory" },
  { level: 2, at: 3, name: "Shadow", can: "repeat whole sentences after a native model" },
  { level: 3, at: 12, name: "Build", can: "say sentences from their meaning" },
  { level: 4, at: 30, name: "Flow", can: "shadow and build a sentence in every lesson" },
];

/** Where a learner is on the ladder, given their good speaking attempts. */
export function speakingLevel(passes = 0) {
  const n = Math.max(0, Number(passes) || 0);
  let cur = SPEAKING_LEVELS[0];
  for (const l of SPEAKING_LEVELS) if (n >= l.at) cur = l;
  const next = SPEAKING_LEVELS.find((l) => l.at > n) || null;
  return { ...cur, passes: n, next, toNext: next ? next.at - n : 0 };
}

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean);

/**
 * A sentence worth saying for this word: from its own examples, with a
 * translation to show, long enough to be more than the word (two words and
 * eight letters — Korean 침대가 편해요 "the bed is comfortable" is a whole
 * sentence in two) and short enough to say in one breath (ten words). Chinese
 * and Japanese don't put spaces between words, so there it's 3–16 characters
 * (你好吗 "how are you?" is three).
 */
export function speakableSentence(item) {
  for (const ex of item?.examples || []) {
    const native = String(ex?.native || "").trim();
    if (!native || !ex.translation) continue;
    // A Hangul block is a whole syllable — 저는 학생이에요 "I am a student" is
    // seven of them — so it counts double.
    const bare = native.replace(/[\p{P}\p{S}\s\d]/gu, "");
    const letters = [...bare].length + (bare.match(/\p{Script=Hangul}/gu) || []).length;
    const spaced = /\s/.test(native);
    const ok = spaced
      ? words(native).length >= 2 && words(native).length <= 10 && letters >= 8
      : letters >= 3 && letters <= 16 && /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(native);
    if (ok) return { native, translit: ex.translit || "", translation: ex.translation };
  }
  return null;
}

/**
 * Add the speaking rungs a lesson should have to an already-built exercise list.
 * Pure: the same inputs and `rand` give the same lesson.
 *
 *   exercises  what the generator built (its RECALL, if any, is last)
 *   queue      the words this lesson is about
 *   progress   the learner's cards
 *   passes     good speaking attempts so far, in this language
 *   allowed    false if the learner switched speaking off
 *   examMode   exams grade by string; speaking never goes in one
 */
export function weaveSpeaking(exercises, { queue = [], progress = {}, passes = 0, allowed = true, examMode = false, rand = Math.random } = {}) {
  const out = Array.isArray(exercises) ? [...exercises] : [];
  if (!allowed || examMode || !out.length) return out;
  const { level } = speakingLevel(passes);
  const reps = (item) => progress?.[item?.id]?.reps || 0;
  const pickFrom = (list) => list[Math.floor(rand() * list.length)];
  const taken = new Set(out.filter((e) => e.type === "speak_prompt" && e.item).map((e) => e.item.id));

  // ECHO — right after the new words are introduced, one of them said back.
  let introAt = -1;
  const introduced = [];
  out.forEach((e, i) => {
    if (e.type === "introduce_batch" && Array.isArray(e.items)) { introAt = i; introduced.push(...e.items); }
    else if (e.type === "introduce" && e.item) { introAt = i; introduced.push(e.item); }
  });
  const echoable = introduced.filter((it) => it?.lemma && !taken.has(it.id));
  if (introAt >= 0 && echoable.length) {
    const item = pickFrom(echoable);
    taken.add(item.id);
    out.splice(introAt + 1, 0, {
      type: "speak_prompt", mode: SPEAK_MODE.ECHO, practice: true,
      item, answer: item.lemma, prompt: "Say it after me",
    });
  }

  // SHADOW and SENTENCE — at the end, before the RECALL that closes the lesson,
  // on words the learner has already met (the same courage-not-memory rule as
  // RECALL: nobody should be asked for a sentence around a word from a minute ago).
  const withSentence = (minReps) => queue
    .filter((it) => it?.lemma && reps(it) >= minReps && !taken.has(it.id))
    .map((it) => ({ it, s: speakableSentence(it) }))
    .filter((x) => x.s);
  const tail = [];
  const wantShadow = level === 2 || level >= 4;
  const wantSentence = level >= 3;
  if (wantSentence) {
    const c = withSentence(2);
    if (c.length) {
      const { it, s } = pickFrom(c);
      taken.add(it.id);
      tail.push({ type: "speak_prompt", mode: SPEAK_MODE.SENTENCE, practice: true, item: it, answer: it.lemma, sentence: s, prompt: "Say it in the language" });
    }
  }
  // Level 3 falls back to shadowing when no word is ready to build a sentence around.
  if (wantShadow || (level === 3 && !tail.length)) {
    const c = withSentence(1);
    if (c.length) {
      const { it, s } = pickFrom(c);
      taken.add(it.id);
      tail.unshift({ type: "speak_prompt", mode: SPEAK_MODE.SHADOW, practice: true, item: it, answer: it.lemma, sentence: s, prompt: "Say the whole sentence" });
    }
  }
  if (tail.length) {
    const last = out[out.length - 1];
    const recallLast = last?.type === "speak_prompt" && !last.mode;
    out.splice(recallLast ? out.length - 1 : out.length, 0, ...tail);
  }
  return out;
}
