// =============================================================================
// GRAMMAR — CHECKS THAT TEST USE, NOT TRIVIA (v83)
//
// THE PROBLEM, measured. Of the 49 comprehension checks across the nine grammar
// curricula, 19 — 39% — were written entirely in English:
//
//     "Where does the verb go in Urdu?"   At the end / At the start / ...
//     "Why can Spanish drop 'yo' (I)?"    The verb ending shows who acts / ...
//
// You can answer every one of those having never seen a sentence in the
// language. They test whether someone has read the paragraph above, which is
// knowledge ABOUT the language, and a well-documented thing to be able to do
// while remaining unable to use it. Someone can hold "Urdu is verb-final" as a
// fact for a year and still not produce a verb-final sentence.
//
// WHAT THE RESEARCH ACTUALLY SAYS, and why this isn't an argument for deleting
// them. Lightbown and Spada's survey of the field lands on what they call "get
// it right in the end": neither pure input nor pure drilling, but meaningful use
// of the language from the start, WITH some explicit attention to its forms.
// Learners given explicit instruction on a pattern do measurably better on that
// pattern. The mistake here was never that the app explains rules — it's that
// explaining was the whole of it, and the check that followed asked about the
// explanation rather than about the language.
//
// So the rule question stays, and an APPLICATION item is added after it. Same
// pattern, now with a sentence in front of you.
//
// WHY THESE ARE GENERATED RATHER THAN WRITTEN. Every string here comes from the
// lesson's own examples, which are already authored and reviewed as part of the
// curriculum. Nothing invents a sentence in Bengali or Japanese, nothing
// perturbs one into a form no one has checked, and nothing has to be maintained
// in parallel — add an example to a lesson and its checks follow.
//
// THE AMBIGUITY PROBLEM, which is the whole difficulty. Within a single lesson
// the examples usually contrast the exact feature being taught:
//
//     "Yo hablo español"   → "I speak Spanish"
//     "Hablo español"      → "(I) speak Spanish — 'yo' dropped"
//
// Ask "which one means 'I speak Spanish'?" with both on screen and there are two
// right answers, one of which is marked wrong. That is worse than the trivia it
// replaces: it teaches the learner that something correct is incorrect. So
// glosses are normalised down to their actual meaning — parentheses, editorial
// notes after a dash, punctuation, case — and any candidate that collides with
// the answer is dropped, falling back to other lessons in the same language.
// An item that can't find two clean distractors is not generated at all.
// =============================================================================

/**
 * The meaning a gloss actually carries, with the editorial apparatus stripped.
 * "(I) speak Spanish — 'yo' dropped" and "I speak Spanish" are the same claim
 * about the world, and an option set must never contain both.
 */
/**
 * A curriculum gloss is written to TEACH, sitting under the sentence it belongs
 * to, and it carries three kinds of scaffolding that must come off before it can
 * be used as a question — each of which produced a real bug on the first pass:
 *
 *   "I water drink-am = I drink water"   an interlinear gloss. As a question it
 *                                        hands over the word order the lesson is
 *                                        asking about.
 *   "I am a student (defining → ser)"    a trailing note that literally names
 *                                        which of the two verbs to pick.
 *   "(I) speak Spanish — 'yo' dropped"   a leading parenthesis marking an
 *                                        implied subject, plus an editor's note.
 *
 * The last one is the subtle one. Deleting parenthesised text — the obvious
 * move — turns this into "speak Spanish" while its near-twin "I speak Spanish"
 * stays as it is, so the two stop matching and the collision check waves through
 * a question with both of them as options. The parenthesis has to be UNWRAPPED,
 * not dropped: it marks a word as implied, it doesn't remove it from the meaning.
 */
export function askableGloss(gloss = "") {
  let g = String(gloss);
  const eq = g.lastIndexOf("=");
  if (eq !== -1) g = g.slice(eq + 1);            // interlinear → plain English
  g = g.replace(/\s*[—–]\s.*$/, "");             // an editor's note after a dash
  g = g.replace(/\s*\([^)]*\)\s*$/, "");         // a trailing hint, e.g. "(→ ser)"
  g = g.replace(/\(([^)]*)\)/g, "$1");           // "(I) speak" → "I speak"
  return g.replace(/\s+/g, " ").trim();
}

/**
 * The meaning a gloss actually carries. Two options that reduce to the same key
 * are the same claim about the world, and an option set must never hold both.
 */
export function glossKey(gloss = "") {
  return askableGloss(gloss)
    .toLowerCase()
    .replace(/["'`´’]/g, "")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Deterministic shuffle. Options must not reorder between renders — the answer
// is compared by value, so a reshuffle isn't wrong, but a question that
// rearranges itself while you're reading it is its own small cruelty.
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const OPTIONS = 3;

/**
 * Application checks for one grammar lesson.
 *
 * @param {Object} lesson       the lesson, with .examples
 * @param {Array}  siblings     every lesson for this language, for distractors
 * @param {Object} opts         { max } how many to generate (default 2)
 * @returns {Array} checks in the same {q, options, answer, explain} shape the
 *                  hand-written ones use, so they render with no UI change.
 */
export function applicationChecks(lesson, siblings = [], { max = 2 } = {}) {
  const examples = (lesson?.examples || []).filter((e) => e?.native && e?.gloss);
  if (examples.length < 1) return [];

  // Distractors: same lesson first, because those contrast the very feature
  // being taught and so make the question about the grammar rather than about
  // guessing the topic. Then anything else in the language.
  const elsewhere = (siblings || [])
    .filter((l) => l?.id !== lesson?.id)
    .flatMap((l) => l.examples || [])
    .filter((e) => e?.native && e?.gloss);

  const rand = seeded(String(lesson?.id || "lesson"));
  const out = [];
  // Asked once per MEANING, not once per example. Where a lesson contrasts two
  // sentences that say the same thing — "Yo hablo español" and "Hablo español"
  // — generating one item each puts the identical question on screen twice with
  // two different right answers, which reads as the app contradicting itself.
  const askedAlready = new Set();

  for (const ex of examples) {
    if (out.length >= max) break;
    const answerKey = glossKey(ex.gloss);
    if (!answerKey || askedAlready.has(answerKey)) continue;
    askedAlready.add(answerKey);

    const taken = new Set([answerKey]);
    const usable = (cand) => {
      if (!cand || cand.native === ex.native) return false;
      const k = glossKey(cand.gloss);
      // The collision test. Two options that mean the same thing is a question
      // with two right answers, and marking one of them wrong teaches something
      // false — worse than the trivia this is replacing.
      if (!k || taken.has(k)) return false;
      taken.add(k);
      return true;
    };

    const distractors = [
      ...examples.filter((e) => e !== ex),
      ...elsewhere,
    ].filter(usable).slice(0, OPTIONS - 1);

    if (distractors.length < OPTIONS - 1) continue;   // no clean question here

    const options = shuffle([ex.native, ...distractors.map((d) => d.native)], rand);
    out.push({
      q: `Which one means “${askableGloss(ex.gloss)}”?`,
      options,
      answer: ex.native,
      explain: [ex.translit, ex.gloss].filter(Boolean).join(" — "),
      applied: true,
    });
  }

  return out;
}

/**
 * The lesson's checks, rule question first and then the one that asks them to
 * use it. Explicit knowledge earns its place by feeding into use; on its own it
 * is a fact about a language rather than any part of speaking one.
 */
export function checksFor(lesson, siblings = []) {
  return [...(lesson?.checks || []), ...applicationChecks(lesson, siblings)];
}
