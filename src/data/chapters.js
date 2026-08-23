// =============================================================================
// CHAPTERS (v44) — gated chapter structure.
//
// Units are grouped into CHAPTERS of 3. At the end of each chapter there's a
// gated EXAM. You must score >= PASS_THRESHOLD to unlock the next chapter's
// units. Unlimited retries; on a fail the app offers to review the missed words.
//
// Mapping:
//   Chapter 1 = units 1,2,3   → its exam gates units 4,5,6
//   Chapter 2 = units 4,5,6   → its exam gates units 7,8,9
// =============================================================================

export const UNITS_PER_CHAPTER = 3;
export const PASS_THRESHOLD = 0.7; // 70% to pass a chapter exam

// The share of a unit's words that counts as "done with this". Same number the
// chapter-exam availability check uses, so "complete enough to sit the exam"
// and "complete enough not to be locked out of" cannot drift apart.
export const PROVEN_BAR = 0.6;

export function chapterOfUnitIndex(unitIndex) {
  return Math.floor(unitIndex / UNITS_PER_CHAPTER) + 1;
}

export function unitIndicesForChapter(chapterNum) {
  const start = (chapterNum - 1) * UNITS_PER_CHAPTER;
  return [start, start + 1, start + 2];
}

export function hasPassedChapter(appState, langCode, chapterNum) {
  const passed = appState?.chaptersPassed?.[langCode] || [];
  return passed.includes(chapterNum);
}

// A chapter's exam is "available" once all its units meet the completion bar.
export function isChapterExamAvailable(unitProgress, chapterNum, unitCompletionBar = PROVEN_BAR) {
  const idxs = unitIndicesForChapter(chapterNum);
  for (const i of idxs) {
    const u = unitProgress[i];
    if (!u) return false;
    if ((u.pct || 0) < unitCompletionBar) return false;
  }
  return true;
}

// Compute which unit indices are unlocked, applying chapter gates.
//
// v63 FIX: passing a chapter exam now genuinely unlocks EVERYTHING up to and
// including that chapter, plus the whole next chapter. Previously a learner
// could pass the exam and still find units locked because the old rule also
// required the immediately-previous unit to be 30% complete — so people who
// tested out of earlier material got stuck with nowhere to go. An exam pass is
// proof of understanding; it should never leave the path blocked.
export function computeUnlocks(unitProgress, appState, langCode) {
  // Highest chapter the learner has passed the exam for (0 = none yet).
  let highestPassed = 0;
  for (let c = 1; c <= completeChapterCount(unitProgress.length) + 1; c++) {
    if (hasPassedChapter(appState, langCode, c)) highestPassed = c;
  }

  const unlocks = [];
  for (let i = 0; i < unitProgress.length; i++) {
    const chapter = chapterOfUnitIndex(i);
    let unlocked;
    if (i === 0) {
      unlocked = true;
    } else if ((unitProgress[i]?.pct || 0) >= PROVEN_BAR) {
      // v85.1 — NEVER LOCK SOMETHING THE LEARNER HAS ALREADY PASSED.
      //
      // The route map offers "test out" on LOCKED stops, which is the whole
      // point of it: someone who grew up hearing the language taps a stop three
      // chapters ahead and proves they know it. Passing needs 85% — a higher
      // bar than the chapter exam's 70% — and it seeds every word in the unit
      // as known, so the unit reads 100% complete.
      //
      // And then this function locked it anyway, because the chapter gate was
      // evaluated before anything else and "chapter 3 while you're in chapter 1"
      // fell straight through to `unlocked = false`. You sat a test, passed it
      // at 85%, watched the screen say "those words are marked as known and the
      // next stop is open", went back to the map — and the stop was still shut.
      // Nothing about that is recoverable by the learner; retaking it produces
      // the identical outcome.
      //
      // A completion bar is only reachable by doing the work or by proving you
      // did not need to, and neither is a reason to bar the door.
      //
      // This deliberately does NOT cascade: the next unit along is still judged
      // by the branches below, so testing out of one stop opens that stop and
      // not the rest of a chapter you have not touched.
      unlocked = true;
    } else if (chapter <= highestPassed) {
      // Everything in a chapter you've already passed stays open — no
      // back-tracking required to revisit or finish earlier units.
      unlocked = true;
    } else if (chapter === highestPassed + 1) {
      // The chapter you've just unlocked: first unit always open, the rest
      // follow the normal gentle 30% progression.
      const isFirstOfChapter = i % UNITS_PER_CHAPTER === 0;
      unlocked = isFirstOfChapter ? true : (unitProgress[i - 1]?.pct || 0) >= 0.3;
    } else {
      unlocked = false; // still gated behind a chapter exam
    }
    unlocks.push(unlocked);
  }
  return unlocks;
}

export function completeChapterCount(unitCount) {
  return Math.floor(unitCount / UNITS_PER_CHAPTER);
}

// The vocab IDs belonging to a chapter (for building its exam).
export function chapterVocabIds(vocab, chapterNum) {
  const idxs = unitIndicesForChapter(chapterNum);
  const unitIds = idxs.map((i) => `u${i + 1}`);
  return vocab.filter((v) => unitIds.includes(v.unit)).map((v) => v.id);
}
