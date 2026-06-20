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
export function isChapterExamAvailable(unitProgress, chapterNum, unitCompletionBar = 0.6) {
  const idxs = unitIndicesForChapter(chapterNum);
  for (const i of idxs) {
    const u = unitProgress[i];
    if (!u) return false;
    if ((u.pct || 0) < unitCompletionBar) return false;
  }
  return true;
}

// Compute which unit indices are unlocked, applying chapter gates.
export function computeUnlocks(unitProgress, appState, langCode) {
  const unlocks = [];
  for (let i = 0; i < unitProgress.length; i++) {
    const chapter = chapterOfUnitIndex(i);
    let unlocked;
    if (i === 0) {
      unlocked = true;
    } else if (chapter === 1) {
      unlocked = (unitProgress[i - 1]?.pct || 0) >= 0.3;
    } else {
      const prevChapterPassed = hasPassedChapter(appState, langCode, chapter - 1);
      if (!prevChapterPassed) {
        unlocked = false; // GATED
      } else {
        const isFirstOfChapter = i % UNITS_PER_CHAPTER === 0;
        unlocked = isFirstOfChapter ? true : (unitProgress[i - 1]?.pct || 0) >= 0.3;
      }
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
