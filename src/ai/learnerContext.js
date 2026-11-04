// =============================================================================
// LEARNER CONTEXT — what the tutor is told about this learner's COURSE.
//
// The profile brief (profile.js summariseForPrompt) says how a learner talks:
// their level, their recurring errors. It never said what they have been
// TAUGHT, so the tutor pitched vocabulary blind and couldn't steer towards
// what the learner was working on. This adds, for the current language:
//
//   · the module they're in and the objectives of their next lesson;
//   · words they know (produced from memory first, then recognised), so the
//     tutor can stay inside them;
//   · words they keep missing, so the tutor can give them chances to use them;
//   · the skill their profile says to work on.
//
// Only short strings from the pack and the course — no free text the learner
// wrote. The server caps every field again and puts the block in the user
// turn as data, never in the system prompt (api/coach.js).
// =============================================================================

import { canRecall } from "../engine/recall.js";
import { retrievability } from "../engine/srs.js";

const KNOWN_MAX = 40;
const WEAK_MAX = 6;

const sense = (t) => String(t || "").split(/[,;/(]/)[0].trim().slice(0, 40);
const entry = (v) => ({ w: String(v.lemma).slice(0, 40), t: String(v.translit || "").slice(0, 40), en: sense(v.translation) });

/** Pure: the context from data already loaded. Exported for tests. */
export function contextFrom({ vocab = [], progress = {}, next = null, focus = null }) {
  const met = vocab.filter((v) => !v.custom && (progress[v.id]?.reps || 0) > 0);
  const recalled = met.filter((v) => canRecall(progress[v.id]));
  const recognised = met.filter((v) => !canRecall(progress[v.id]));
  const byStrength = (a, b) => (progress[b.id]?.stability || 0) - (progress[a.id]?.stability || 0);
  const known = [...recalled.sort(byStrength), ...recognised.sort(byStrength)].slice(0, KNOWN_MAX).map(entry);

  const weak = met
    .filter((v) => (progress[v.id]?.lapses || 0) > 0 || progress[v.id]?.lastRating === 1)
    .sort((a, b) => (progress[b.id]?.lapses || 0) - (progress[a.id]?.lapses || 0)
      || retrievability(progress[a.id]) - retrievability(progress[b.id]))
    .slice(0, WEAK_MAX)
    .map(entry);

  // The conversation the learner is heading for: the task's own, or the module's first.
  const ex = next
    ? (next.lesson.kind === "task" && (next.module.exchanges || []).find((e) => e.id === next.lesson.stop)) || next.module.exchange
    : null;
  const objectives = next
    ? [
        ...next.lesson.objectives.filter((o) => o.type !== "recognise" && o.type !== "use").map((o) => o.text),
        ...(ex ? [`${ex.outcome} (the module's conversation)`] : []),
      ].slice(0, 4)
    : [];

  return {
    module: next ? `${next.module.index + 1}. ${next.module.title}` : "",
    lesson: next ? next.lesson.title : "",
    objectives,
    known,
    weak,
    focus: focus || null,
  };
}

/** The context for the current language, built from the engine. */
export async function buildLearnerContext(engine, pack) {
  if (!engine || !pack) return null;
  try {
    const [{ loadCourse }, { nextLesson }, { skillProfile }] = await Promise.all([
      import("../engine/guided.js"),
      import("../engine/curriculum.js"),
      import("../engine/skills.js"),
    ]);
    const [progress, attempts, state] = await Promise.all([engine.getProgress(), engine.getAttempts(), engine.getCourseState()]);
    const course = await loadCourse(pack);
    return contextFrom({
      vocab: pack.vocab || [],
      progress,
      next: nextLesson(course, state, progress),
      focus: skillProfile(attempts).focus,
    });
  } catch {
    // The tutor works without it, as it did before; it just pitches blind.
    return null;
  }
}
