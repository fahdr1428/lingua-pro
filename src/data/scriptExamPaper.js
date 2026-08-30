// =============================================================================
// scriptExamPaper.js (v99) — building the Chapter 0 reading exam.
//
// Its own module so the paper can be built and inspected without a browser.
// The exam decides whether a learner skips the whole script course, so what it
// asks and what it offers as wrong answers are the substance of the feature,
// not presentation. scripts/test-script-exam.mjs builds a paper for every
// language, thousands of times, and checks the properties that make it a
// reading test rather than a guessing game.
//
// See ScriptExam.jsx for what the questions look like on screen.
// =============================================================================

import { SCRIPT_EXAM_SIZE } from "./scriptCourse.js";

/** Fisher–Yates. Never `sort(() => Math.random() - 0.5)` — see scripts/test-shuffle.mjs. */
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick n distinct distractors, preferring the ones that are genuinely confusable. */
function distractors(correct, preferred, fallback, n = 3) {
  const out = [];
  const seen = new Set([correct]);
  for (const pool of [preferred, fallback]) {
    for (const c of shuffled(pool)) {
      if (out.length >= n) break;
      if (!c || seen.has(c)) continue;
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

/**
 * Build the paper.
 *
 * Deliberately weighted towards reading whole words rather than letters: a
 * course that gates on letters gates on the wrong thing.
 */
/** Latin letters and the usual punctuation — used to tell a script from a romanisation. */
const LATINISH = /^[ -ɏḀ-ỿ\s'’\-.()]+$/;

export function buildExam(pack) {
  const allLetters = (pack.alphabet || []).filter((l) => l.char && l.name);
  const sys = pack.scriptSystem || {};

  // Chinese's "alphabet" is the pinyin initials — b, p, m, f — because Chinese
  // has no alphabet. Asking "which letter makes the sound m?" would put four
  // Latin letters on screen and test nothing about reading 漢字. So when the
  // pack's letters are a romanisation rather than a script, the letter
  // questions are dropped and the paper is entirely 字 → sound → meaning, which
  // is exactly the reading skill in question.
  const lettersAreScript = allLetters.length > 0 && !allLetters.every((l) => LATINISH.test(l.char));
  const letters = lettersAreScript ? allLetters : [];

  // The confusable sets, flattened per character, so a letter question can pull
  // its distractors from the letters it is actually confused with.
  const confusableOf = new Map();
  for (const set of sys.confusables || []) {
    const chars = (set.letters || set.chars || []).map((c) => (typeof c === "string" ? c : c.char)).filter(Boolean);
    for (const c of chars) {
      confusableOf.set(c, (confusableOf.get(c) || []).concat(chars.filter((o) => o !== c)));
    }
  }

  // Short, common words: the ones a reader meets first and the ones whose
  // romanisation is short enough to judge at a glance.
  const words = (pack.vocab || [])
    .filter((v) => v.lemma && v.translit && v.translation)
    .filter((v) => v.lemma.length <= 14 && !v.lemma.includes(" "))
    .slice(0, 120);

  const questions = [];

  // How many word questions to ask. When there are no letter questions to ask
  // (Chinese), the whole paper is words rather than a short paper.
  // Over-generate. Questions are dropped further down when a pack can't supply
  // four distinct options — Malayalam and Tamil each name two different letters
  // "oo", Japanese has nine words sharing a romanisation — and a paper that
  // came out 11 questions long instead of 12 quietly moved its own pass mark.
  // The test that caught it builds 200 papers per language for exactly this
  // reason: one draw is not a property.
  const perWordKind = (lettersAreScript ? 4 : Math.ceil(SCRIPT_EXAM_SIZE / 2)) * 3;
  const perLetterKind = 6;

  // --- what does it say? -----------------------------------------------------
  for (const v of shuffled(words).slice(0, perWordKind)) {
    const others = words.filter((w) => w.id !== v.id).map((w) => w.translit);
    const sameLength = others.filter((t) => Math.abs(t.length - v.translit.length) <= 2);
    questions.push({
      kind: "read",
      prompt: "What does this say?",
      sub: "Read it aloud, then choose the sounds",
      show: v.lemma,
      big: true,
      answer: v.translit,
      options: shuffled([v.translit, ...distractors(v.translit, sameLength, others)]),
      speakOnReveal: v.lemma,
    });
  }

  // --- what does it mean? ----------------------------------------------------
  for (const v of shuffled(words).slice(0, perWordKind)) {
    const others = words.filter((w) => w.id !== v.id).map((w) => w.translation);
    questions.push({
      kind: "mean",
      prompt: "What does it mean?",
      sub: "No romanisation this time",
      show: v.lemma,
      big: true,
      answer: v.translation,
      options: shuffled([v.translation, ...distractors(v.translation, [], others)]),
      speakOnReveal: v.lemma,
    });
  }

  // --- letter → sound --------------------------------------------------------
  for (const l of shuffled(letters).slice(0, perLetterKind)) {
    const others = letters.filter((o) => o.char !== l.char).map((o) => o.name);
    const near = (confusableOf.get(l.char) || [])
      .map((c) => letters.find((o) => o.char === c)?.name)
      .filter(Boolean);
    questions.push({
      kind: "letter",
      prompt: "What sound does this letter make?",
      show: l.char,
      big: true,
      answer: l.name,
      options: shuffled([l.name, ...distractors(l.name, near, others)]),
      speakOnReveal: l.char,
    });
  }

  // --- sound → letter (the harder direction) ---------------------------------
  for (const l of shuffled(letters).slice(0, perLetterKind)) {
    const others = letters.filter((o) => o.char !== l.char).map((o) => o.char);
    const near = confusableOf.get(l.char) || [];
    questions.push({
      kind: "sound",
      prompt: `Which letter makes the sound "${l.name}"?`,
      show: null,
      answer: l.char,
      bigOptions: true,
      options: shuffled([l.char, ...distractors(l.char, near, others)]),
    });
  }

  // A question is only asked if it has four DISTINCT options.
  //
  // distractors() dedupes by value, so a pack where two words share a
  // romanisation (Arabic has two "ghadan", Japanese nine such pairs) or two
  // letters share a name (five in Malayalam) quietly produced a three-option
  // question — a visible oddity that reads as the app being broken, and a
  // free 33% guess. Dropping the question is the honest fix; there are always
  // more words than the paper needs.
  const sound = new Set();
  const usable = questions.filter((q) => {
    const opts = new Set(q.options);
    if (opts.size !== 4) return false;
    if (!opts.has(q.answer)) return false;
    // Never ask the same prompt twice in one paper.
    const key = `${q.kind}|${q.show || q.prompt}`;
    if (sound.has(key)) return false;
    sound.add(key);
    return true;
  });

  // Compose to a deliberate shape rather than taking whatever the shuffle
  // happens to leave: two thirds reading real words, one third the letters
  // underneath them. Any kind that comes up short is topped up from the word
  // questions, never from letters — a paper that drifted towards naming letters
  // would stop testing the thing it claims to.
  const byKind = (k) => usable.filter((q) => q.kind === k);
  const want = lettersAreScript
    ? [["read", 4], ["mean", 4], ["letter", 2], ["sound", 2]]
    : [["read", Math.ceil(SCRIPT_EXAM_SIZE / 2)], ["mean", Math.floor(SCRIPT_EXAM_SIZE / 2)]];

  const paper = [];
  for (const [kind, n] of want) paper.push(...byKind(kind).slice(0, n));
  if (paper.length < SCRIPT_EXAM_SIZE) {
    const spare = [...byKind("read"), ...byKind("mean")].filter((q) => !paper.includes(q));
    paper.push(...spare.slice(0, SCRIPT_EXAM_SIZE - paper.length));
  }

  return shuffled(paper).slice(0, SCRIPT_EXAM_SIZE);
}
