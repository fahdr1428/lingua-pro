// =============================================================================
// LESSON — the core learning loop. Generates a session via engine.generateSession,
// renders one exercise at a time, submits answers via engine.submitAnswer.
// =============================================================================

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button, Card, ProgressBar, Container } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";
import { playCorrect, playWrong, playLessonComplete } from "../audio/sfx.js";
import { EXERCISE, generateLesson } from "../engine/generator.js";
import { explainAnswer } from "../engine/explain.js";
import { getCharacter } from "../data/characters.js";
import { getGrammar } from "../data/grammar.js";
import { pickFunFact } from "../data/funFacts.js";
import { goalCategoryOrder } from "../data/goals.js";
import { WORD_PRONUNCIATION } from "../data/wordPronunciation.js";

// Languages that don't use the Latin alphabet — for these, romanization is the
// hero (so beginners can read it) and the native script is a smaller reference.
const NON_LATIN_LANGUAGES = new Set(["ur", "ar", "hi", "ja", "ko", "zh", "fa", "bn", "pa"]);

export function Lesson({ engine, pack, appState, setAppState, params, onNavigate, refreshStats }) {
  const lang = LANGUAGES[pack.code];
  const isNonLatin = NON_LATIN_LANGUAGES.has(pack.code);
  const character = getCharacter(pack.code);

  // Map each individual native word → its romanization, so word-bank tiles
  // (TAP_WORDS / BUILD_SENTENCE) can show pronunciation. This is a READING
  // AID only — it never reveals meaning. Built by zipping each lemma's
  // space-separated native words with its space-separated translit.
  const wordTranslit = useMemo(() => {
    const m = {};
    // Layer 1: derive from vocab lemma/translit pairs
    for (const v of pack.vocab || []) {
      if (!v.lemma || !v.translit) continue;
      const nativeWords = String(v.lemma).split(/\s+/).filter(Boolean);
      const translitWords = String(v.translit).split(/\s+/).filter(Boolean);
      if (nativeWords.length === translitWords.length) {
        nativeWords.forEach((nw, i) => { if (!m[nw]) m[nw] = translitWords[i]; });
      } else {
        if (!m[v.lemma]) m[v.lemma] = v.translit;
      }
    }
    // Layer 2: supplementary hand-written dictionary for sentence words that
    // aren't standalone vocab (example sentences carry no pronunciation field).
    const supp = WORD_PRONUNCIATION[pack.code] || {};
    for (const [w, p] of Object.entries(supp)) {
      if (!m[w]) m[w] = p;
    }
    return m;
  }, [pack.vocab, pack.code]);

  const [session, setSession] = useState(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [typed, setTyped] = useState("");
  const [tapped, setTapped] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]); // v35: MATCH_PAIRS matched pairs
  const [matchSelection, setMatchSelection] = useState(null); // v35: currently-selected left item
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [combo, setCombo] = useState(0); // v62: consecutive correct answers
  const [recoveryDone, setRecoveryDone] = useState(false); // v63: supportive re-ask round appended once
  const [inRecovery, setInRecovery] = useState(false); // v63: currently in the "let's nail these" round
  const [reaction, setReaction] = useState(null);  // tutor's in-lesson interjection
  const [showExplain, setShowExplain] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedItems, setMissedItems] = useState([]); // items answered wrong (for review)
  const [streakInLesson, setStreakInLesson] = useState(0); // consecutive correct in this lesson
  const [hintActive, setHintActive] = useState(false);     // user accepted the hint offer
  const [hintOffered, setHintOffered] = useState(false);   // 60s passed → "Need a hint?" fades in
  const [hearts, setHearts] = useState(appState.hearts);
  const [done, setDone] = useState(false);
  const [resultData, setResultData] = useState(null);
  const startedAt = useRef(Date.now());

  // Build session on mount
  useEffect(() => {
    let cancelled = false;
    engine
      .generateSession({
        mode: params?.mode || "smart",
        filter: params?.filter || null,
        sessionSize: params?.sessionSize || appState?.sessionSize || 6,
        newPerSession: Math.max(2, Math.round((appState?.sessionSize || 6) / 2)),
        goalCategories: goalCategoryOrder(appState?.learningGoal?.[pack.code]),
      })
      .then((s) => {
        if (cancelled) return;
        // v24: weave grammar INTO the lesson, a little at a time. Pick the
        // next unseen grammar lesson for this language and insert one short
        // "grammar moment" right after the intro batch (so: new words first,
        // then one bite of grammar in context, then practice). Skipped for
        // review/mistake sessions — those aren't the place to teach new theory.
        try {
          const isReviewish = params?.mode === "due" || params?.mode === "review" || params?.mode === "checkpoint" || params?.mode === "exam" || s.mode === "review";
          if (!isReviewish) {
            const allGrammar = getGrammar(pack.code);
            const seen = (appState?.grammarSeen?.[pack.code]) || [];
            const nextG = allGrammar.find((g) => !seen.includes(g.id))
              // if all seen, gently cycle back to the first (spaced refresher)
              || (allGrammar.length ? allGrammar[(seen.length) % allGrammar.length] : null);
            if (nextG) {
              const exercises = [...s.exercises];
              // Find insertion point: right after the last intro/intro_batch
              let insertAt = 0;
              for (let i = 0; i < exercises.length; i++) {
                const t = exercises[i].type;
                if (t === EXERCISE.INTRODUCE || t === EXERCISE.INTRODUCE_BATCH) insertAt = i + 1;
                else break;
              }
              exercises.splice(insertAt, 0, { type: "GRAMMAR_MOMENT", grammar: nextG });
              s = { ...s, exercises, grammarShownId: nextG.id };
            }
          }
        } catch (e) {
          // Grammar injection must NEVER break a lesson — fail silent.
          console.warn("grammar moment injection skipped:", e);
        }
        setSession(s);
      });
    return () => { cancelled = true; };
  }, [engine, params]);

  // Auto-play audio for listening exercises — must be at top with other hooks
  const exercise = session?.exercises?.[idx];
  useEffect(() => {
    if (exercise?.playAudio) speak(exercise.item.lemma, lang.ttsCode, { audioId: exercise.item.id });
  }, [exercise, lang.ttsCode]);

  // After 60s of being stuck on a question (no answer submitted yet), quietly
  // fade in a "Need a hint?" offer. It is OFFERED, not forced — a user who is
  // just being careful or got distracted can ignore it; a genuinely stuck user
  // sees a lifeline appear exactly when they need it. Resets every question.
  useEffect(() => {
    setHintOffered(false);
    setHintActive(false);
    if (!exercise || feedback) return;
    if (exercise.type === EXERCISE.INTRODUCE || exercise.type === EXERCISE.INTRODUCE_BATCH || exercise.type === "GRAMMAR_MOMENT") return;
    const t = setTimeout(() => setHintOffered(true), 60000);
    return () => clearTimeout(t);
  }, [idx, exercise, feedback]);

  if (!session) {
    return <Container><div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>Building your lesson…</div></Container>;
  }

  if (session.exercises.length === 0) {
    return (
      <Container style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 60 }}>🎉</div>
        <h2>All caught up!</h2>
        <p style={{ color: "var(--text-dim)" }}>Nothing to review right now. Try Smart Mix or come back later.</p>
        <Button style={{ marginTop: 20 }} onClick={() => onNavigate("home")}>Back home</Button>
      </Container>
    );
  }

  // Rebuild the lesson using ONLY the words the user got wrong. Defined HERE
  // in Lesson (not Result) because all the state setters live in this scope —
  // putting it in Result was the bug that crashed the result screen.
  function reviewMistakes() {
    if (missedItems.length === 0) return;
    const pool = pack.vocab || [];
    const exercises = generateLesson(missedItems, pool, {});
    setSession({ exercises, mode: "review" });
    setIdx(0);
    setPicked(null);
    setTyped("");
    setTapped([]);
    setFeedback(null);
    setReaction(null);
    setShowExplain(false);
    setCorrectCount(0);
    setMissedItems([]);
    setStreakInLesson(0);
    setDone(false);
    setResultData(null);
    startedAt.current = Date.now();
  }

  if (done) {
    return (
      <Result
        data={resultData}
        pack={pack}
        appState={appState}
        setAppState={setAppState}
        onNavigate={onNavigate}
        missedItems={missedItems}
        onReviewMistakes={reviewMistakes}
        isExam={params?.mode === "exam"}
        isChapterExam={params?.mode === "chapter_exam"}
        chapterNum={params?.chapter}
        passThreshold={70}
      />
    );
  }

  function reset() {
    setPicked(null);
    setTyped("");
    setTapped([]);
    setMatchedPairs([]);
    setMatchSelection(null);
    setFeedback(null);
    setReaction(null);
    setShowExplain(false);
    setHintActive(false);
    setHintOffered(false);
  }

  async function check() {
    let given;
    if (exercise.type === EXERCISE.TAP_WORDS || exercise.type === EXERCISE.BUILD_SENTENCE) given = tapped.join(" ");
    else if (exercise.type === EXERCISE.LETTER_SCRAMBLE) given = tapped.join(""); // v59: letters join with no space
    else if (exercise.type === EXERCISE.TYPE_TRANSLATION) given = typed;
    else if (exercise.type === EXERCISE.MATCH_PAIRS) {
      // Build the id:meaning|... string from matched pairs, sorted, to compare
      // against the exercise's canonical answer.
      given = matchedPairs.map((p) => `${p.id}:${p.meaning}`).sort().join("|");
    }
    else given = picked;

    let result;
    try {
      result = await engine.submitAnswer(exercise, given);
    } catch (e) {
      // If grading fails for any reason, fall back to a local check so the
      // user can still progress instead of the question freezing.
      console.warn("submitAnswer failed, using local fallback:", e);
      const norm = (s) => String(s || "").trim().toLowerCase();
      const isCorrect = norm(given) === norm(exercise.answer);
      result = { correct: isCorrect, intro: false };
    }

    // INTRODUCE is informational — don't count it in correct/total
    if (result.intro) return;

    setFeedback(result.correct ? "correct" : "wrong");
    setCombo((c) => (result.correct ? c + 1 : 0));
    // v30: play a short positive/negative chime (honours user setting)
    if (appState.soundEffects !== false) {
      try { result.correct ? playCorrect() : playWrong(); } catch {}
    }
    // Pick a short, varied tutor reaction so the character feels present
    // during the lesson, not just at the end. Streak reaction if on a roll.
    if (character?.reactions) {
      const pool = result.correct
        ? (streakInLesson >= 2 && character.reactions.streak?.length
            ? character.reactions.streak
            : character.reactions.correct)
        : character.reactions.wrong;
      if (pool?.length) setReaction(pool[Math.floor(Math.random() * pool.length)]);
    }
    if (result.correct) {
      if (!exercise.pretest) setCorrectCount((c) => c + 1);
      setStreakInLesson((s) => s + 1);
    } else if (exercise.pretest) {
      // v68: a wrong guess on a word we haven't taught yet is expected — it's
      // the mechanism, not a failure. No heart, no combo break, and it isn't
      // added to missed items (the word is about to be introduced anyway).
      setStreakInLesson((s) => s);
    } else {
      setStreakInLesson(0);
      // Record the missed item so we can offer a focused review at the end
      if (exercise.item) {
        setMissedItems((prev) =>
          prev.find((m) => m.id === exercise.item.id) ? prev : [...prev, exercise.item]
        );
      }
      if (!appState.isPremium) setHearts((h) => Math.max(0, h - 1));
    }
  }

  // Skip ONLY used when audio fails on a listening exercise. This forgives a
  // technical problem (broken audio) the user can't control — NOT a difficulty
  // problem. The reason is logged so the founder can see how often audio fails
  // and for which languages. No heart penalty.
  function skipForAudio() {
    try {
      setAppState((s) => ({
        ...s,
        skipLog: [
          ...(s.skipLog || []).slice(-199), // keep last 200
          {
            ts: Date.now(),
            lang: pack.code,
            reason: "audio_not_working",
            exerciseType: exercise?.type || "unknown",
            wordId: exercise?.item?.id || null,
          },
        ],
      }));
    } catch {}
    reset();
    setIdx((i) => i + 1);
  }

  async function next() {
    // v63 SUPPORTIVE RECOVERY ROUND — a lesson shouldn't end while words are
    // still shaky. Instead of a blunt re-test, we append a short warm round
    // that RE-TEACHES each missed word (INTRODUCE) and then asks it again in an
    // easier recognition format. Happens once, only in normal lessons (never in
    // exams, which must measure honestly), and only for real misses.
    if (
      idx + 1 >= session.exercises.length &&
      !recoveryDone &&
      missedItems.length > 0 &&
      params?.mode !== "exam" &&
      params?.mode !== "chapter_exam" &&
      params?.milestone == null
    ) {
      try {
        const pool = pack.vocab || [];
        const extra = [];
        for (const item of missedItems) {
          // Re-teach first (no penalty, just a friendly reminder of the word)…
          extra.push({ type: EXERCISE.INTRODUCE, item });
          // …then ask it back in a gentle recognition format.
          const distractors = pool
            .filter((w) => w.id !== item.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          const options = [item, ...distractors].sort(() => Math.random() - 0.5);
          extra.push({
            type: EXERCISE.PICK_WORD,
            item,
            prompt: item.meaning,
            options,
            answer: item.lemma,
          });
        }
        if (extra.length > 0) {
          setSession((prev) => ({ ...prev, exercises: [...prev.exercises, ...extra] }));
          setRecoveryDone(true);
          setInRecovery(true);
          setMissedItems([]); // cleared: they get a genuine second chance
          reset();
          setIdx((i) => i + 1);
          return;
        }
      } catch {}
    }

    if (idx + 1 >= session.exercises.length) {
      // Session complete — only count testable exercises (skip INTRODUCE)
      const testable = session.exercises.filter((e) => e.type !== EXERCISE.INTRODUCE && e.type !== EXERCISE.INTRODUCE_BATCH && e.type !== "GRAMMAR_MOMENT" && !e.pretest).length;
      const total = testable || session.exercises.length; // fallback in edge case
      const accuracy = total > 0 ? correctCount / total : 1;
      // v36: rebalanced XP economy. Previously 10 XP/correct meant a ~17-exercise
      // lesson awarded 170+ XP, blowing past even the 120 "Intense" daily goal in
      // a fraction of one lesson (user feedback: "reached daily goal after one
      // exercise"). Now 2 XP/correct + 5 perfect-bonus, so a full ~17-question
      // lesson is ~35-40 XP — roughly one "Regular" (35) daily goal.
      const xpEarned = correctCount * 2 + (accuracy === 1 && correctCount > 0 ? 5 : 0);
      const today = new Date().toDateString();
      const wasYesterday = appState.lastStudyDate === new Date(Date.now() - 86400000).toDateString();
      const newStreak = appState.lastStudyDate === today ? appState.streak : wasYesterday ? appState.streak + 1 : 1;

      // CRITICAL: ending the lesson must NEVER fail. If storage or the engine
      // throws (quota, corrupt data, slow promise), we still show the result
      // screen so the user is never trapped on the final question.
      let sessions = appState.sessions || [];
      try {
        await engine.logSession({ correct: correctCount, total, xp: xpEarned, durationMs: Date.now() - startedAt.current, mode: params?.mode || "unit" });
        sessions = await engine.getSessions();
      } catch (e) {
        // Soft-fail: keep going with existing sessions. Better a slightly
        // stale stat than a stuck lesson.
        console.warn("logSession failed, continuing anyway:", e);
      }

      try {
        const shownG = session?.grammarShownId;
        const isCheckpoint = params?.mode === "checkpoint";
        const isExam = params?.mode === "exam";
        const isMilestoneExam = isExam && params?.milestone != null;
        const isChapterExam = params?.mode === "chapter_exam";
        // v44: chapter exam pass/fail. accuracy is 0-1; PASS at >= 0.7.
        const chapterExamPassed = isChapterExam && accuracy >= 0.7;
        setAppState((s) => {
          const next = {
            ...s,
            totalXp: (s.totalXp || 0) + xpEarned,
            streak: newStreak,
            lastStudyDate: today,
            gems: (s.gems || 0) + Math.floor(xpEarned / 10),
            // v62: flawless lesson earns a bonus heart (capped at 5)
            hearts: accuracy >= 1 && !isExam && !isChapterExam && !s.isPremium
              ? Math.min(5, hearts + 1) : hearts,
            sessions,
          };
          // Mark the grammar moment from this lesson as seen, so the next
          // lesson rotates to a new one instead of repeating it.
          if (shownG) {
            const gs = { ...(s.grammarSeen || {}) };
            const arr = gs[pack.code] || [];
            if (!arr.includes(shownG)) gs[pack.code] = [...arr, shownG];
            next.grammarSeen = gs;
          }
          // v39: only NORMAL lessons increment the lesson counter that drives
          // the every-3-lessons milestone. Exams and checkpoints don't count.
          if (!isCheckpoint && !isExam && !isChapterExam) {
            const lc = { ...(s.lessonsCompleted || {}) };
            lc[pack.code] = (lc[pack.code] || 0) + 1;
            next.lessonsCompleted = lc;
          } else if (isCheckpoint || isMilestoneExam) {
            const cp = { ...(s.lastCheckpointAt || {}) };
            cp[pack.code] = (s.lessonsCompleted?.[pack.code]) || 0;
            next.lastCheckpointAt = cp;
          }
          // v44: record a passed chapter exam → unlocks the next chapter.
          if (chapterExamPassed && params?.chapter != null) {
            const cp = { ...(s.chaptersPassed || {}) };
            const arr = cp[pack.code] || [];
            if (!arr.includes(params.chapter)) {
              cp[pack.code] = [...arr, params.chapter];
            }
            next.chaptersPassed = cp;
          }
          return next;
        });
      } catch (e) {
        console.warn("setAppState failed:", e);
      }

      try {
        await refreshStats();
      } catch (e) {
        console.warn("refreshStats failed:", e);
      }

      // These two ALWAYS run no matter what failed above — the user sees
      // their result and is never stuck.
      setResultData({ correct: correctCount, total, xp: xpEarned, accuracy: Math.round(accuracy * 100), examVocabIds: params?.filter?.vocabIds || [], examSize: params?.sessionSize || 8 });
      setDone(true);
      // v30: celebratory chime on lesson completion (if sound effects on)
      if (appState.soundEffects !== false) {
        try { playLessonComplete(); } catch {}
      }
      return;
    }
    reset();
    setIdx((i) => i + 1);
  }

  const wordStyle = {
    fontSize: lang.rtl ? 42 : 38,
    fontWeight: 800,
    lineHeight: lang.rtl ? 1.5 : 1.2,
    direction: lang.rtl ? "rtl" : "ltr",
    fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
    margin: "20px 0 12px",
  };

  // GRAMMAR MOMENT — a short in-lesson teaching card (v24). Handled BEFORE the
  // item guard below because it intentionally has no `.item`. One concept,
  // its examples, and one optional check, then continue. Never blocks.
  if (exercise?.type === "GRAMMAR_MOMENT") {
    const g = exercise.grammar;
    return (
      <GrammarMoment
        g={g}
        lang={lang}
        isNonLatin={isNonLatin}
        voiceAvailable={hasVoiceFor(lang.ttsCode)}
        onContinue={() => { reset(); setIdx((i) => i + 1); }}
      />
    );
  }

  // Safety: if exercise is malformed, skip it.
  // INTRODUCE_BATCH uses `items`, MATCH_PAIRS uses `pairs`, ODD_ONE_OUT uses
  // `options` — none of these have a single `item`, so they need their own checks.
  const isBatch = exercise?.type === EXERCISE.INTRODUCE_BATCH;
  const isMatchPairs = exercise?.type === EXERCISE.MATCH_PAIRS;
  const isOddOneOut = exercise?.type === EXERCISE.ODD_ONE_OUT;
  const malformed =
    !exercise ||
    !exercise.type ||
    (isBatch && !exercise.items?.length) ||
    (isMatchPairs && !exercise.pairs?.length) ||
    (isOddOneOut && !exercise.options?.length) ||
    (!isBatch && !isMatchPairs && !isOddOneOut && !exercise.item);
  if (malformed) {
    return (
      <Container style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>🤔</div>
        <h2>Hmm, something odd happened</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 20 }}>This exercise didn't load properly. Let's skip it.</p>
        <Button onClick={() => { reset(); setIdx(i => i + 1); }}>Skip & continue</Button>
        <Button variant="ghost" style={{ marginTop: 12 }} onClick={() => onNavigate("home")}>Back home</Button>
      </Container>
    );
  }

  const canCheck =
    exercise.type === EXERCISE.INTRODUCE ||
    exercise.type === EXERCISE.INTRODUCE_BATCH ||
    (exercise.type.includes("pick") && picked) ||
    (exercise.type === EXERCISE.TYPE_TRANSLATION && typed.trim()) ||
    (exercise.type === EXERCISE.TAP_WORDS && tapped.length > 0) ||
    (exercise.type === EXERCISE.BUILD_SENTENCE && tapped.length > 0) ||
    (exercise.type === EXERCISE.COMPLETE_SENTENCE && picked) ||
    (exercise.type === EXERCISE.LISTEN_PICK && picked) ||
    // v34c CRITICAL FIX: CONJUGATE and CONJUGATE_TENSE were missing from this
    // list, meaning the Check button stayed disabled even when the user picked
    // an answer. This bug has been live since v29 and is the screenshot bug.
    (exercise.type === EXERCISE.CONJUGATE && picked) ||
    (exercise.type === EXERCISE.CONJUGATE_TENSE && picked) ||
    // v35: new formats
    (exercise.type === EXERCISE.ODD_ONE_OUT && picked) ||
    (exercise.type === EXERCISE.MATCH_PAIRS && exercise.pairs && matchedPairs.length === exercise.pairs.length) ||
    // v59: new formats
    (exercise.type === EXERCISE.LETTER_SCRAMBLE && tapped.length > 0) ||
    (exercise.type === EXERCISE.TRUE_FALSE && picked);

  const voiceAvailable = hasVoiceFor(lang.ttsCode);

  return (
    <div>
      {/* Lesson topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          background: "var(--bg-alt)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button onClick={() => onNavigate("home")} style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 22, cursor: "pointer" }}>✕</button>
        <div style={{ flex: 1, margin: "0 16px" }}>
          <ProgressBar value={idx + (feedback ? 1 : 0)} max={session.exercises.length} />
          {/* v63: warm framing for the recovery round — never punitive */}
          {/* v68: pretest framing — makes the guess feel purposeful, not like a trap */}
          {exercise?.pretest && (
            <div style={{
              marginTop: 10, background: "var(--surface-hi)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "var(--text-dim)",
              textAlign: "center", lineHeight: 1.5,
            }}>
              🤔 You haven't learnt this one yet — have a guess anyway.
              <span style={{ color: "var(--text-mute)" }}> Guessing first makes it stick better.</span>
            </div>
          )}

          {inRecovery && (
            <div style={{
              marginTop: 10, background: "var(--primary-soft)", border: "1px solid var(--primary)",
              borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "var(--primary-dark)",
              fontWeight: 700, textAlign: "center",
            }}>
              🌱 Let's lock in the tricky ones — one more look, no pressure
            </div>
          )}
        </div>
        {streakInLesson >= 3 && (
          <div
            className="pop"
            key={streakInLesson}
            style={{
              color: "var(--accent)",
              fontWeight: 800,
              fontSize: 13,
              marginRight: 10,
              whiteSpace: "nowrap",
            }}
          >
            🔥 {streakInLesson} in a row
          </div>
        )}
        <div style={{ color: "var(--danger)", fontWeight: 800 }}>❤️ {appState.isPremium ? "∞" : hearts}</div>
      </div>

      <Container style={{ paddingBottom: 200 }}>
        <div className="slide-up" key={idx}>
          {exercise.type !== EXERCISE.INTRODUCE && exercise.type !== EXERCISE.INTRODUCE_BATCH && (
            <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
              {exercise.prompt}
            </div>
          )}

          {/* INTRODUCE_BATCH — flashcard carousel: see all new words first, then test */}
          {exercise.type === EXERCISE.INTRODUCE_BATCH && (
            <IntroBatchCards
              items={exercise.items}
              lang={lang}
              isNonLatin={isNonLatin}
              voiceAvailable={voiceAvailable}
              onComplete={() => { reset(); setIdx((i) => i + 1); }}
            />
          )}

          {/* INTRODUCE — full word card with meaning, example, hear button.
              For non-Latin scripts, romanization is the HERO so beginners can read it. */}
          {exercise.type === EXERCISE.INTRODUCE && (
            <div className="pop" style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>
                ✨ NEW WORD
              </div>

              {isNonLatin ? (
                <>
                  {/* HERO: romanization (readable!) */}
                  <div style={{ fontSize: 48, fontWeight: 900, marginTop: 16, color: "var(--text)", letterSpacing: -0.5 }}>
                    {exercise.item.translit}
                  </div>
                  {/* Pronunciation hint */}
                  {exercise.item.pronunciation && (
                    <div style={{ fontSize: 15, color: "var(--text-dim)", marginTop: 4, fontStyle: "italic" }}>
                      say it like: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{exercise.item.pronunciation}</span>
                    </div>
                  )}
                  {/* Meaning */}
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", marginTop: 16, marginBottom: 8 }}>
                    = {exercise.item.translation}
                  </div>
                  {/* Native script as REFERENCE, smaller */}
                  <div style={{
                    fontSize: lang.rtl ? 32 : 28,
                    lineHeight: 1.4,
                    direction: lang.rtl ? "rtl" : "ltr",
                    fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                    color: "var(--text-dim)",
                    marginTop: 8,
                    marginBottom: 8,
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}>
                    {exercise.item.lemma}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1 }}>
                    {pack.code === "zh" ? "Chinese characters" : pack.code === "ja" ? "Japanese script" : pack.code === "ko" ? "Korean script" : "Native script"}
                  </div>
                </>
              ) : (
                <>
                  {/* Latin scripts: native script IS the hero */}
                  <div style={{ ...wordStyle, fontSize: 50, marginTop: 16 }}>
                    {exercise.item.lemma}
                  </div>
                  {exercise.item.pronunciation && appState.showRomanization !== false && (
                    <div style={{ fontSize: 15, color: "var(--text-dim)", marginTop: 4, fontStyle: "italic" }}>
                      say it like: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{exercise.item.pronunciation}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", marginTop: 12, marginBottom: 16 }}>
                    = {exercise.item.translation}
                  </div>
                </>
              )}

              {voiceAvailable && (
                <Button
                  variant="secondary"
                  style={{ marginTop: 12, marginBottom: 16, width: "auto", padding: "12px 24px" }}
                  onClick={() => speak(exercise.item.lemma, lang.ttsCode, { audioId: exercise.item.id })}
                >
                  🔊 Hear it again
                </Button>
              )}

              {exercise.item.examples?.[0] && (
                <Card style={{ background: "var(--surface-hi)", marginTop: 12, textAlign: "left" }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                    USED IN A SENTENCE
                  </div>
                  {isNonLatin ? (
                    <>
                      {/* English meaning is the readable line, native script as reference */}
                      <div style={{ fontSize: 19, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>
                        "{exercise.item.examples[0].translation}"
                      </div>
                      <div style={{
                        fontSize: 18,
                        direction: lang.rtl ? "rtl" : "ltr",
                        fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                        color: "var(--text-dim)",
                      }}>
                        {exercise.item.examples[0].native}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                        {exercise.item.examples[0].native}
                      </div>
                      <div style={{ fontSize: 14, color: "var(--text-dim)", fontStyle: "italic" }}>
                        "{exercise.item.examples[0].translation}"
                      </div>
                    </>
                  )}
                </Card>
              )}
            </div>
          )}

          {exercise.showWord && exercise.type !== EXERCISE.INTRODUCE && (
            <div style={{ textAlign: "center" }}>
              {isNonLatin ? (
                <>
                  {/* Hero: romanization */}
                  <div style={{ fontSize: 38, fontWeight: 800, marginTop: 12, color: "var(--text)" }}>
                    {exercise.item.translit}
                  </div>
                  {/* Native script smaller, as reference */}
                  <div style={{
                    fontSize: lang.rtl ? 24 : 22,
                    direction: lang.rtl ? "rtl" : "ltr",
                    fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                    color: "var(--text-dim)",
                    marginTop: 4,
                  }}>
                    {exercise.item.lemma}
                  </div>
                </>
              ) : (
                <div style={wordStyle}>{exercise.item.lemma}</div>
              )}
              {voiceAvailable && (
                <Button
                  variant="ghost"
                  style={{ marginTop: 8, fontSize: 18 }}
                  onClick={() => speak(exercise.item.lemma, lang.ttsCode, { audioId: exercise.item.id })}
                >
                  🔊 Listen
                </Button>
              )}
            </div>
          )}

          {exercise.type === EXERCISE.LISTEN_PICK && (
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <button
                onClick={() => speak(exercise.item.lemma, lang.ttsCode, { audioId: exercise.item.id })}
                style={{
                  background: "var(--blue)",
                  border: "none",
                  borderRadius: "50%",
                  width: 100,
                  height: 100,
                  fontSize: 48,
                  cursor: "pointer",
                }}
              >
                🔊
              </button>
              <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-dim)" }}>Tap to play again</div>
            </div>
          )}

          {/* Sentence with blank */}
          {exercise.type === EXERCISE.COMPLETE_SENTENCE && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  direction: lang.rtl ? "rtl" : "ltr",
                  fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                  padding: "16px",
                  background: "var(--surface)",
                  border: "2px dashed var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                {exercise.sentence}
              </div>
              {/* Pronunciation of the prompt words (READING AID — no meaning).
                  Helps learners who can't yet read the script know what they
                  are being asked to complete. The blank stays a blank. */}
              {isNonLatin && (() => {
                const parts = String(exercise.sentence).split(/\s+/).filter(Boolean);
                const pron = parts
                  .map((p) => (p.includes("____") ? "____" : (wordTranslit[p] || null)))
                  .filter(Boolean);
                // Only show if we actually have pronunciations (not just blanks)
                if (pron.filter((x) => x !== "____").length === 0) return null;
                return (
                  <div style={{ fontSize: 14, color: "var(--accent)", fontStyle: "italic", marginTop: 8, direction: "ltr" }}>
                    {pron.join(" ")}
                  </div>
                );
              })()}
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>"{exercise.translation}"</div>
            </div>
          )}

          {/* v35 ODD_ONE_OUT — pick the word that doesn't belong. */}
          {exercise.type === EXERCISE.ODD_ONE_OUT && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {exercise.options.map((opt, i) => {
                const isAnswer = feedback && opt.lemma === exercise.answer;
                const isWrong = feedback && opt.lemma === picked && opt.lemma !== exercise.answer;
                const isPicked = picked === opt.lemma;
                return (
                  <button
                    key={i}
                    onClick={() => !feedback && setPicked(opt.lemma)}
                    style={{
                      background: isAnswer ? "var(--primary-dark)" : isWrong ? "var(--danger)" : isPicked ? "var(--surface-hi)" : "var(--surface)",
                      border: `2px solid ${isAnswer ? "var(--primary)" : isWrong ? "var(--danger)" : isPicked ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 12, padding: 16,
                      color: isAnswer || isWrong ? "#fff" : "var(--text)",
                      cursor: feedback ? "default" : "pointer", textAlign: "center",
                    }}
                  >
                    {isNonLatin && opt.translit ? (
                      <>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{opt.translit}</div>
                        <div style={{ fontSize: 16, opacity: 0.7, marginTop: 2,
                          direction: lang.rtl ? "rtl" : "ltr",
                          fontFamily: lang.rtl ? '"Noto Nastaliq Urdu","Noto Naskh Arabic",serif' : "inherit" }}>
                          {opt.lemma}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{opt.lemma}</div>
                    )}
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{opt.meaning}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* v35 MATCH_PAIRS — tap a word on the left, then its meaning on the
              right, to form a pair. All pairs matched → Check enabled. */}
          {exercise.type === EXERCISE.MATCH_PAIRS && (() => {
            const matchedIds = new Set(matchedPairs.map((p) => p.id));
            const matchedMeanings = new Set(matchedPairs.map((p) => p.meaning));
            // Stable shuffled meaning column (compute once per exercise via idx seed)
            const meanings = exercise.pairs.map((p) => p.meaning);
            return (
              <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                {/* Left: words */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {exercise.pairs.map((p, i) => {
                    const isMatched = matchedIds.has(p.id);
                    const isSelected = matchSelection?.id === p.id;
                    return (
                      <button
                        key={i}
                        disabled={isMatched || !!feedback}
                        onClick={() => { if (!feedback && !isMatched) setMatchSelection(p); }}
                        style={{
                          background: isMatched ? "var(--primary-dark)" : isSelected ? "var(--surface-hi)" : "var(--surface)",
                          border: `2px solid ${isMatched ? "var(--primary)" : isSelected ? "var(--primary)" : "var(--border)"}`,
                          borderRadius: 10, padding: 12, opacity: isMatched ? 0.6 : 1,
                          color: isMatched ? "#fff" : "var(--text)",
                          cursor: isMatched ? "default" : "pointer",
                          direction: lang.rtl ? "rtl" : "ltr",
                          fontFamily: (isNonLatin && lang.rtl) ? '"Noto Nastaliq Urdu","Noto Naskh Arabic",serif' : "inherit",
                          fontWeight: 700,
                        }}
                      >
                        {isNonLatin && p.translit ? `${p.translit}` : p.lemma}
                      </button>
                    );
                  })}
                </div>
                {/* Right: meanings */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {meanings.map((m, i) => {
                    const isMatched = matchedMeanings.has(m);
                    return (
                      <button
                        key={i}
                        disabled={isMatched || !!feedback}
                        onClick={() => {
                          if (feedback || isMatched || !matchSelection) return;
                          // Match current selection's word to this meaning.
                          // Correct only if they actually belong together.
                          if (matchSelection.meaning === m) {
                            setMatchedPairs((prev) => [...prev, { id: matchSelection.id, meaning: m }]);
                            setMatchSelection(null);
                          } else {
                            // Wrong pairing — flash by clearing selection (gentle)
                            setMatchSelection(null);
                          }
                        }}
                        style={{
                          background: isMatched ? "var(--primary-dark)" : "var(--surface)",
                          border: `2px solid ${isMatched ? "var(--primary)" : "var(--border)"}`,
                          borderRadius: 10, padding: 12, opacity: isMatched ? 0.6 : 1,
                          color: isMatched ? "#fff" : "var(--text)",
                          cursor: isMatched ? "default" : "pointer", fontWeight: 600,
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* PICK options */}
          {/* v29 CONJUGATE — pick the right conjugated form for a given person.
              Options are objects { form, translit } instead of plain strings.
              Surfaces the language's note about how conjugation works. */}
          {(exercise.type === EXERCISE.CONJUGATE || exercise.type === EXERCISE.CONJUGATE_TENSE) && (
            <div style={{ marginTop: 12 }}>
              {/* v34b: tense badge — show "PAST" / "FUTURE" prominently for tense exercises */}
              {exercise.type === EXERCISE.CONJUGATE_TENSE && exercise.tenseName && (
                <div style={{
                  display: "inline-block",
                  fontSize: 11, fontWeight: 800, letterSpacing: 1,
                  background: exercise.tense === "past" ? "#6b3a8e" : "#1e6091",
                  color: "#fff", padding: "4px 10px", borderRadius: 999,
                  marginBottom: 10, textTransform: "uppercase",
                }}>
                  {exercise.tense === "past" ? "⏪ past" : "⏩ future"} · {exercise.tenseName}
                </div>
              )}
              {exercise.note && (
                <div style={{
                  fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5,
                  background: "var(--surface)", borderRadius: 10, padding: 10,
                  marginBottom: 12, fontStyle: "italic",
                }}>
                  💡 {exercise.note}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {exercise.options.map((opt, i) => {
                  const isAnswer = feedback && opt.form === exercise.answer;
                  const isWrong = feedback && opt.form === picked && opt.form !== exercise.answer;
                  const isPicked = picked === opt.form;
                  return (
                    <button
                      key={i}
                      onClick={() => !feedback && setPicked(opt.form)}
                      style={{
                        background: isAnswer ? "var(--primary-dark)" : isWrong ? "var(--danger)" : isPicked ? "var(--surface-hi)" : "var(--surface)",
                        border: `2px solid ${isAnswer ? "var(--primary)" : isWrong ? "var(--danger)" : isPicked ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: 12,
                        padding: 16,
                        color: isAnswer || isWrong ? "#fff" : "var(--text)",
                        cursor: feedback ? "default" : "pointer",
                        textAlign: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      {isNonLatin && opt.translit ? (
                        <>
                          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{opt.translit}</div>
                          <div style={{
                            fontSize: 17, opacity: 0.7,
                            direction: lang.rtl ? "rtl" : "ltr",
                            fontFamily: lang.rtl ? '"Noto Nastaliq Urdu","Noto Naskh Arabic",serif' : "inherit",
                          }}>
                            {opt.form}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{opt.form}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(exercise.type === EXERCISE.PICK_MEANING ||
            exercise.type === EXERCISE.PICK_WORD ||
            exercise.type === EXERCISE.LISTEN_PICK ||
            exercise.type === EXERCISE.TRUE_FALSE ||
            exercise.type === EXERCISE.COMPLETE_SENTENCE) && (
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {exercise.options.map((opt, i) => {
                const isAnswer = feedback && opt === exercise.answer;
                const isWrong = feedback && opt === picked && opt !== exercise.answer;
                const isPicked = picked === opt;
                // HINT: when active, eliminate the first half of the wrong
                // options (deterministic by option order, so it's stable
                // across re-renders). Narrows difficulty without revealing.
                const hiddenByHint = (() => {
                  if (feedback || !hintActive) return [];
                  const wrongs = exercise.options.filter((o) => o !== exercise.answer);
                  return wrongs.slice(0, Math.ceil(wrongs.length / 2));
                })();
                const isHinted = hiddenByHint.includes(opt);
                const showNative = exercise.type === EXERCISE.PICK_WORD || exercise.type === EXERCISE.COMPLETE_SENTENCE;

                // PRINCIPLE: pronunciation/transliteration is a READING AID —
                // it helps decode the script without revealing meaning, so it's
                // always shown for non-Latin scripts. The English MEANING is
                // the ANSWER on every recall exercise (PICK_WORD asks you to
                // recall the word for a meaning; COMPLETE_SENTENCE asks you to
                // recall which word fits) — so it is NEVER shown on the options
                // here. (PICK_MEANING is different: its options ARE English by
                // design, handled in its own branch.)
                let optTranslit = null;
                const optMeaning = null; // intentionally never set in this block
                if (showNative && isNonLatin) {
                  const matchingItem = pack.vocab.find((v) => v.lemma === opt);
                  optTranslit = matchingItem?.translit;
                }

                return (
                  <button
                    key={i}
                    onClick={() => !feedback && !isHinted && setPicked(opt)}
                    style={{
                      background: isAnswer ? "var(--primary-dark)" : isWrong ? "var(--danger)" : isPicked ? "var(--surface-hi)" : "var(--surface)",
                      border: `2px solid ${isAnswer ? "var(--primary)" : isWrong ? "var(--danger)" : isPicked ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 12,
                      padding: 16,
                      color: isAnswer || isWrong ? "#fff" : "var(--text)",
                      fontSize: showNative ? 18 : 16,
                      fontWeight: 700,
                      cursor: feedback || isHinted ? "default" : "pointer",
                      textAlign: "center",
                      lineHeight: 1.3,
                      opacity: isHinted ? 0.3 : 1,
                      textDecoration: isHinted ? "line-through" : "none",
                      transition: "opacity 0.3s",
                    }}
                  >
                    {showNative && isNonLatin && optTranslit ? (
                      <>
                        {/* Romanization HUGE so beginners can read */}
                        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                          {optTranslit}
                        </div>
                        {/* Native script smaller below */}
                        <div style={{
                          fontSize: 16,
                          direction: lang.rtl ? "rtl" : "ltr",
                          fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                          opacity: 0.75,
                          fontWeight: 500,
                        }}>
                          {opt}
                        </div>
                        {/* English meaning — PICK_WORD only (helps recall);
                            never on COMPLETE_SENTENCE where it spoils it */}
                        {optMeaning && (
                          <div style={{
                            fontSize: 13,
                            opacity: 0.7,
                            fontWeight: 600,
                            marginTop: 4,
                          }}>
                            {optMeaning}
                          </div>
                        )}
                      </>
                    ) : showNative ? (
                      <div style={{
                        fontSize: 22,
                        direction: lang.rtl ? "rtl" : "ltr",
                        fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                      }}>
                        {opt}
                      </div>
                    ) : (
                      opt
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TYPE */}
          {exercise.type === EXERCISE.TYPE_TRANSLATION && (
            <input
              value={typed}
              onChange={(e) => !feedback && setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canCheck && !feedback && check()}
              placeholder="Type your answer…"
              autoFocus
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 12,
                background: "var(--surface-hi)",
                border: "2px solid var(--border)",
                color: "var(--text)",
                fontSize: 18,
                marginTop: 24,
                boxSizing: "border-box",
              }}
            />
          )}

          {/* TAP WORDS, BUILD SENTENCE, or LETTER SCRAMBLE — all use the bank UI */}
          {(exercise.type === EXERCISE.TAP_WORDS || exercise.type === EXERCISE.BUILD_SENTENCE || exercise.type === EXERCISE.LETTER_SCRAMBLE) && (
            <div style={{ marginTop: 24 }}>
              {exercise.type === EXERCISE.BUILD_SENTENCE || exercise.type === EXERCISE.LETTER_SCRAMBLE ? (
                <Card style={{ background: "var(--surface-hi)", marginBottom: 16, padding: 18, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                    {exercise.type === EXERCISE.LETTER_SCRAMBLE ? "Spell the word for" : "Translate this"}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>
                    "{exercise.translation}"
                  </div>
                </Card>
              ) : (
                <div style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 12 }}>"{exercise.translation}"</div>
              )}
              <div
                style={{
                  minHeight: 70,
                  background: "var(--surface)",
                  border: "2px dashed var(--border)",
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  direction: lang.rtl ? "rtl" : "ltr",
                }}
              >
                {tapped.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => !feedback && setTapped((t) => t.filter((_, j) => j !== i))}
                    style={{
                      background: "var(--surface-hi)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "8px 14px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 18, fontFamily: lang.rtl ? '"Noto Naskh Arabic", serif' : "inherit" }}>{w}</span>
                    {isNonLatin && wordTranslit[w] && (
                      <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>{wordTranslit[w]}</span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8, direction: lang.rtl ? "rtl" : "ltr" }}>
                {exercise.bank.map((w, i) => {
                  // Hide bank items already used (handle duplicates by index)
                  const usedIndices = [];
                  for (let j = 0; j < tapped.length; j++) {
                    const matchIdx = exercise.bank.findIndex((bw, bi) => bw === tapped[j] && !usedIndices.includes(bi));
                    if (matchIdx >= 0) usedIndices.push(matchIdx);
                  }
                  if (usedIndices.includes(i)) return null;
                  return (
                    <button
                      key={i}
                      onClick={() => !feedback && setTapped((t) => [...t, w])}
                      style={{
                        background: "var(--primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 14px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: lang.rtl ? '"Noto Naskh Arabic", serif' : "inherit" }}>{w}</span>
                      {isNonLatin && wordTranslit[w] && (
                        <span style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>{wordTranslit[w]}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <>
              <Card
                style={{
                  marginTop: 24,
                  background: feedback === "correct" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  border: `2px solid ${feedback === "correct" ? "var(--primary)" : "var(--danger)"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: feedback === "correct" ? "var(--primary)" : "var(--danger)" }}>
                    {/* v62: varied coach reactions (stable per exercise via idx) */}
                    {exercise?.pretest
                      ? (feedback === "correct"
                          ? "✓ Good instinct — you guessed it"
                          : "That's the one to remember — now let's learn it")
                      : feedback === "correct"
                      ? ["✓ Correct!", "✓ Nice one", "✓ That was clean", "✓ Exactly right", "✓ You've got this"][idx % 5]
                      : ["✗ Not quite", "✗ Close — look again", "✗ No stress, check it"][idx % 3]}
                    {feedback === "correct" && combo >= 2 && (
                      <span className="pop" style={{ marginLeft: 10, fontSize: 14, background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 999, padding: "3px 10px", verticalAlign: "middle" }}>
                        🔥 {combo} in a row
                      </span>
                    )}
                  </div>
                  {/* Why? button — only shown if not already expanded */}
                  {!showExplain && (
                    <button
                      onClick={() => setShowExplain(true)}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--text-dim)",
                        cursor: "pointer",
                      }}
                    >
                      💡 Why?
                    </button>
                  )}
                </div>
                {/* Tutor's in-lesson reaction — makes the guide feel present */}
                {reaction && character && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    color: character.accent,
                  }}>
                    <span style={{ fontSize: 20 }}>{character.emoji}</span>
                    <span style={{ fontStyle: "italic" }}>“{reaction}”</span>
                  </div>
                )}
                {feedback === "wrong" && (
                  <div style={{ marginTop: 8 }}>
                    Correct answer: <strong>{exercise.answer}</strong>
                  </div>
                )}
                {exercise.item?.examples?.[0] && !showExplain && (
                  <div style={{ marginTop: 10, color: "var(--text-dim)", fontSize: 14 }}>
                    <em>{exercise.item.examples[0].native}</em> — {exercise.item.examples[0].translation}
                  </div>
                )}
              </Card>

              {/* Expanded explanation card */}
              {showExplain && (() => {
                const userGiven = exercise.type === EXERCISE.TAP_WORDS || exercise.type === EXERCISE.BUILD_SENTENCE
                  ? tapped.join(" ")
                  : exercise.type === EXERCISE.TYPE_TRANSLATION
                  ? typed
                  : picked;
                const exp = explainAnswer(exercise, userGiven, pack.code);
                return (
                  <Card
                    className="slide-up"
                    style={{
                      marginTop: 12,
                      background: exp.special ? "var(--accent-soft)" : "var(--surface-hi)",
                      border: `2px solid ${exp.special ? "var(--accent)" : "var(--border)"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{
                        fontSize: 11,
                        color: exp.special ? "var(--accent)" : "var(--text-dim)",
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}>
                        {exp.special ? "⚡ Grammar tip" : "💡 Explanation"}
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{exp.title}</div>
                    <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.55 }}>
                      {/* Render simple **bold** markdown */}
                      {exp.body.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={i} style={{ color: exp.special ? "var(--accent)" : "var(--primary)" }}>{part.slice(2, -2)}</strong>
                        ) : (
                          <React.Fragment key={i}>{part}</React.Fragment>
                        )
                      )}
                    </div>
                  </Card>
                );
              })()}
            </>
          )}
        </div>
      </Container>

      {/* Sticky footer button */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          background: "var(--bg-alt)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {exercise.type === EXERCISE.INTRODUCE_BATCH ? null : exercise.type === EXERCISE.INTRODUCE ? (
            <Button onClick={async () => { await check(); next(); }}>Got it →</Button>
          ) : !feedback ? (
            <>
              {/* "Need a hint?" — fades in only after 60s stuck, and only if
                  the exercise type supports the narrowing hint. Offered, not
                  forced: a careful or distracted user can simply ignore it. */}
              {hintOffered && !hintActive &&
                (exercise.type === EXERCISE.PICK_MEANING ||
                  exercise.type === EXERCISE.PICK_WORD ||
                  exercise.type === EXERCISE.LISTEN_PICK ||
                  exercise.type === EXERCISE.COMPLETE_SENTENCE) && (
                  <div className="slide-up" style={{ textAlign: "center", marginBottom: 12 }}>
                    <button
                      onClick={() => setHintActive(true)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--accent)",
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      💡 Stuck? Tap for a hint
                    </button>
                  </div>
                )}

              {hintActive && (
                <div style={{ textAlign: "center", marginBottom: 12, fontSize: 12, color: "var(--text-dim)" }}>
                  Two wrong answers removed — you've got this.
                </div>
              )}

              <Button style={{ opacity: canCheck ? 1 : 0.4 }} disabled={!canCheck} onClick={check}>
                Check
              </Button>

              {/* Audio-failure escape hatch — ONLY on listening exercises.
                  Not a general skip; it forgives broken audio, not difficulty. */}
              {exercise.type === EXERCISE.LISTEN_PICK && (
                <button
                  onClick={skipForAudio}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-dim)",
                    cursor: "pointer",
                  }}
                >
                  🔇 Can't hear it? Skip this one
                </button>
              )}
            </>
          ) : (
            <Button onClick={next}>{idx + 1 >= session.exercises.length ? "Finish" : "Continue"}</Button>
          )}
        </div>
      </div>

      {/* v30: improved persistent tutor avatar — bigger, named, more present.
          Idle-bobs gently. Bounces happily on correct, wobbles sadly on wrong.
          Hidden during the flashcard intro (full-screen flow). Shows a small
          speech-bubble reaction briefly when one is set. pointerEvents:none on
          the wrapper so it can never block taps. */}
      {!isBatch && character && (
        <div
          style={{
            position: "fixed",
            left: 16,
            bottom: 100,
            zIndex: 5,
            pointerEvents: "none",
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            maxWidth: "calc(100vw - 110px)", // leave room for any side button
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              key={`mood-${feedback || "idle"}-${idx}`}
              className={
                feedback === "correct" ? "tutor-happy"
                : feedback === "wrong" ? "tutor-sad"
                : "tutor-idle"
              }
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, #fff, ${character.accent || "var(--surface-hi)"})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                border: `3px solid ${character.accent || "var(--primary)"}`,
              }}
              aria-label={`${character.name}, your guide`}
            >
              {character.emoji}
            </div>
            {/* Tutor name label, soft pill */}
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.5,
              padding: "2px 8px",
              background: "rgba(255,255,255,0.85)",
              color: "var(--text)",
              borderRadius: 999,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              whiteSpace: "nowrap",
              maxWidth: 90,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {character.name}
            </div>
          </div>
          {/* Speech bubble — only when there's a reaction this turn */}
          {reaction && feedback && (
            <div
              key={`bub-${idx}-${feedback}`}
              className="slide-up"
              style={{
                background: "#fff",
                color: "#111",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 700,
                fontStyle: "italic",
                maxWidth: 200,
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                marginBottom: 18, // align top of bubble with avatar emoji
                position: "relative",
                lineHeight: 1.35,
              }}
            >
              {reaction}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// RESULT — designed to feel rewarding + screenshot-worthy for sharing
// =============================================================================

function Result({ data, pack, appState, setAppState, onNavigate, missedItems = [], onReviewMistakes, isExam = false, isChapterExam = false, chapterNum = null, passThreshold = 70 }) {
  const lang = LANGUAGES[pack.code];
  const framework = pack.frameworks?.[Math.floor(Math.random() * (pack.frameworks?.length || 1))];

  // v44: chapter exam pass/fail state
  const chapterPassed = isChapterExam && data.accuracy >= passThreshold;

  // v27: pick a culturally true fun fact, stable across re-renders.
  // Avoids facts shown in recent lessons so it feels fresh.
  const funFact = useMemo(() => {
    try {
      const recent = (appState?.recentFunFacts?.[pack.code]) || [];
      return pickFunFact(pack.code, recent);
    } catch { return null; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack.code]);

  // Record the shown fact so future result screens rotate past it.
  // Keep only last 4 per language to allow eventual recycling.
  useEffect(() => {
    if (!funFact || !setAppState) return;
    try {
      setAppState((s) => {
        const next = { ...(s.recentFunFacts || {}) };
        const arr = next[pack.code] || [];
        if (arr.includes(funFact.idx)) return s; // already recorded — no-op
        next[pack.code] = [...arr, funFact.idx].slice(-4);
        return { ...s, recentFunFacts: next };
      });
    } catch {}
  }, [funFact, pack.code, setAppState]);

  // Pick celebration based on performance
  const tier = data.accuracy === 100 ? "perfect" : data.accuracy >= 80 ? "great" : data.accuracy >= 60 ? "good" : "keep_going";
  // v38: exams get a letter grade + exam-flavoured messaging instead of the
  // normal lesson celebration.
  const examGrade =
    data.accuracy >= 95 ? "A+" : data.accuracy >= 90 ? "A" : data.accuracy >= 80 ? "B" :
    data.accuracy >= 70 ? "C" : data.accuracy >= 60 ? "D" : "Keep practising";
  const examCelebrations = {
    perfect: { emoji: "🏆", title: `Exam grade: ${examGrade}`, subtitle: "Flawless — you really know these" },
    great:   { emoji: "🎓", title: `Exam grade: ${examGrade}`, subtitle: "Strong result across your vocabulary" },
    good:    { emoji: "📘", title: `Exam grade: ${examGrade}`, subtitle: "Solid — a few to firm up" },
    keep_going: { emoji: "📚", title: `Exam grade: ${examGrade}`, subtitle: "Good honest checkpoint — now you know what to review" },
  };
  const celebrations = isExam ? examCelebrations : {
    perfect: { emoji: "🏆", title: "PERFECT!", subtitle: "Flawless — bonus heart earned ❤️" },
    great: { emoji: "🎉", title: "Great job!", subtitle: "You're getting really good at this" },
    good: { emoji: "💪", title: "Lesson complete", subtitle: "Every rep makes the next one easier" },
    keep_going: { emoji: "🌱", title: "Keep growing", subtitle: "Mistakes are how the brain learns" },
  };
  const celeb = celebrations[tier];

  async function shareResult() {
    const text = `Just learned ${data.correct} ${lang.name} words on Zaban! 🌍\n${data.accuracy}% accuracy · ${appState.streak}-day streak 🔥\nLearn languages the world ignores.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Zaban progress", text });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied! Paste it anywhere to share.");
      } catch {}
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${lang.color}22, var(--bg))` }}>
      <Container style={{ textAlign: "center", paddingTop: 40 }}>
        <div className="slide-up" style={{ fontSize: 90, marginBottom: 8 }}>
          {celeb.emoji}
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>
          {celeb.title}
        </h1>
        <p style={{ color: "var(--text-dim)", marginBottom: 24, fontSize: 16 }}>{celeb.subtitle}</p>

        {/* v44: CHAPTER EXAM gate result — clear pass/fail with the threshold. */}
        {isChapterExam && (
          <div style={{
            background: chapterPassed ? "var(--primary-dark)" : "var(--surface)",
            border: `2px solid ${chapterPassed ? "var(--primary)" : "var(--danger)"}`,
            borderRadius: 16, padding: 20, marginBottom: 24,
          }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>{chapterPassed ? "🔓" : "🔒"}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: chapterPassed ? "#fff" : "var(--text)" }}>
              {chapterPassed ? `Chapter ${chapterNum} passed!` : "Not quite — give it another go"}
            </div>
            <div style={{ fontSize: 15, color: chapterPassed ? "rgba(255,255,255,0.85)" : "var(--text-dim)", marginTop: 6, lineHeight: 1.5 }}>
              {chapterPassed
                ? `You scored ${data.accuracy}%. The next chapter is now unlocked — keep going!`
                : `You scored ${data.accuracy}%. You need ${passThreshold}% to unlock the next chapter. Review the words you missed and retake the exam — unlimited tries.`}
            </div>
            {!chapterPassed && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                {missedItems.length > 0 && (
                  <Button onClick={() => onReviewMistakes && onReviewMistakes()}>
                    Review the {missedItems.length} I missed
                  </Button>
                )}
                <Button
                  variant={missedItems.length > 0 ? "secondary" : "primary"}
                  onClick={() => onNavigate("lesson", { mode: "chapter_exam", chapter: chapterNum, filter: { vocabIds: data.examVocabIds || [] }, sessionSize: data.examSize || 8 })}
                >
                  Retake Chapter {chapterNum} exam
                </Button>
              </div>
            )}
            {chapterPassed && (
              <Button style={{ marginTop: 16 }} onClick={() => onNavigate("home")}>
                Continue to next chapter →
              </Button>
            )}
          </div>
        )}

        {/* The cultural guide reacts — culturally-specific warmth, not generic */}
        {(() => {
          const character = getCharacter(pack.code);
          if (!character) return null;
          const msg = character.celebrations[tier];
          return (
            <Card style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textAlign: "left",
              background: "var(--surface)",
              border: `1px solid var(--border)`,
              borderLeft: `4px solid ${character.accent}`,
              marginBottom: 24,
            }}>
              <div style={{
                fontSize: 30,
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "var(--surface-hi)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {character.emoji}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: character.accent }}>{character.name}</div>
                <div style={{ fontSize: 14, color: "var(--text)", marginTop: 2, lineHeight: 1.4 }}>{msg}</div>
              </div>
            </Card>
          );
        })()}
        {/* Big highlight stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          <Card style={{ marginBottom: 0, background: "var(--surface)" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>XP</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--accent)" }}>+{data.xp}</div>
          </Card>
          <Card style={{ marginBottom: 0, background: "var(--surface)" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>Accuracy</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--primary)" }}>{data.accuracy}%</div>
          </Card>
          <Card style={{ marginBottom: 0, background: "var(--surface)" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>Streak</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--danger)" }}>{appState.streak}🔥</div>
          </Card>
        </div>

        {framework && (
          <Card style={{ textAlign: "left", background: "var(--surface-hi)", border: "2px dashed var(--accent)" }}>
            <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>
              ⚡ FRAMEWORK INSIGHT
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{framework.title}</div>
            <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.5 }}>{framework.body}</div>
          </Card>
        )}

        {/* v27: a warm cultural fact about the language. Encouraging, never
            childish, never a made-up statistic. */}
        {funFact && (
          <Card style={{
            textAlign: "left",
            background: "linear-gradient(135deg, rgba(139,127,214,0.10), var(--surface))",
            border: "1px solid var(--border)",
            marginTop: 12,
          }}>
            <div style={{ fontSize: 11, color: "var(--purple, #8b7fd6)", fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>
              🌍 DID YOU KNOW
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text)" }}>
              {funFact.fact}
            </div>
          </Card>
        )}

        {missedItems.length > 0 && onReviewMistakes && (
          <Card style={{ background: "var(--surface-hi)", border: "2px solid var(--accent)", marginTop: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
              You missed {missedItems.length} word{missedItems.length === 1 ? "" : "s"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12 }}>
              Reviewing mistakes right away is the fastest way to lock them in.
            </div>
            <Button onClick={onReviewMistakes} style={{ background: "var(--accent)", color: "#000" }}>
              🔁 Review my mistakes
            </Button>
          </Card>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
          <Button variant="secondary" onClick={shareResult}>📤 Share</Button>
          <Button onClick={() => onNavigate("home")}>Continue</Button>
        </div>
      </Container>
    </div>
  );
}

// =============================================================================
// IntroBatchCards — flashcard carousel shown at the start of a lesson when
// there are new words. User flips each card and swipes through. After the last
// card, "Start practice" appears. This batch-introduction is much better
// pedagogy than testing each word right after introducing it.
// =============================================================================

function IntroBatchCards({ items, lang, isNonLatin, voiceAvailable, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seenAll, setSeenAll] = useState(false);
  const touchStart = useRef(null);

  const card = items[idx];
  const isLast = idx === items.length - 1;

  // Auto-play audio when a new card appears
  useEffect(() => {
    if (card && voiceAvailable) {
      // Small delay so it doesn't feel jarring
      const t = setTimeout(() => speak(card.lemma, lang.ttsCode, { audioId: card.id }), 250);
      return () => clearTimeout(t);
    }
  }, [card?.id, voiceAvailable, lang.ttsCode]);

  function next() {
    if (isLast) {
      setSeenAll(true);
      return;
    }
    setIdx(idx + 1);
    setFlipped(false);
  }

  function prev() {
    if (idx === 0) return;
    setIdx(idx - 1);
    setFlipped(false);
  }

  // v30: keyboard nav — arrow keys + space to flip
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, isLast]);

  // v30: touch swipe — left/right on mobile
  function onTouchStart(e) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    // Threshold: horizontal swipe must be at least 40px AND more horizontal than vertical
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next(); // swipe left → next
    else prev();        // swipe right → prev
  }

  if (!card) return null;

  return (
    <div className="slide-up" style={{ marginTop: 12 }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>
          ✨ NEW WORDS — TAP TO FLIP
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          Card {idx + 1} of {items.length}
        </div>
      </div>

      {/* The card */}
      <div
        onClick={() => setFlipped(!flipped)}
        key={`${idx}-${flipped}`}
        className="pop"
        style={{
          background: flipped ? "var(--primary-soft)" : "var(--surface)",
          border: `2px solid ${flipped ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "var(--radius-lg)",
          minHeight: 280,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 14,
          boxShadow: "var(--shadow-card)",
        }}
      >
        {!flipped ? (
          // FRONT: word
          <>
            {isNonLatin ? (
              <>
                <div style={{ fontSize: 44, fontWeight: 900, marginBottom: 8 }}>
                  {card.translit}
                </div>
                {card.pronunciation && (
                  <div style={{ fontSize: 14, color: "var(--text-dim)", fontStyle: "italic", marginBottom: 12 }}>
                    say it like: <span style={{ color: "var(--accent)", fontWeight: 700 }}>{card.pronunciation}</span>
                  </div>
                )}
                <div style={{
                  fontSize: lang.rtl ? 30 : 26,
                  lineHeight: 1.4,
                  direction: lang.rtl ? "rtl" : "ltr",
                  fontFamily: lang.rtl ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif' : "inherit",
                  color: "var(--text-dim)",
                  paddingTop: 4,
                  paddingBottom: 4,
                }}>
                  {card.lemma}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 44, fontWeight: 900 }}>{card.lemma}</div>
            )}
            <div style={{ marginTop: 20, fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1 }}>
              Tap to reveal meaning
            </div>
          </>
        ) : (
          // BACK: meaning + example
          <>
            <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Meaning
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)", marginBottom: 16 }}>
              {card.translation}
            </div>
            {card.examples?.[0] && (
              <div style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic", lineHeight: 1.5 }}>
                "{card.examples[0].translation}"
              </div>
            )}
          </>
        )}
      </div>

      {/* Listen button */}
      {voiceAvailable && (
        <Button
          variant="secondary"
          style={{ marginBottom: 12 }}
          onClick={(e) => { e.stopPropagation(); speak(card.lemma, lang.ttsCode, { audioId: card.id }); }}
        >
          🔊 Hear it again
        </Button>
      )}

      {/* Navigation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
        <Button
          variant="secondary"
          onClick={prev}
          style={{ opacity: idx === 0 ? 0.4 : 1 }}
          disabled={idx === 0}
        >
          ← Previous
        </Button>
        <Button onClick={next}>
          {isLast ? "Done" : "Next →"}
        </Button>
      </div>

      {/* Once seen all, show Start Practice */}
      {seenAll && (
        <Button
          style={{ marginTop: 16, background: "var(--accent)", color: "#000", boxShadow: "0 4px 0 #b56305" }}
          onClick={onComplete}
        >
          🚀 Start practice
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// GRAMMAR MOMENT — a single in-lesson grammar teaching card (v24).
// Concept + worked examples + one optional check. Light, skippable, in-context.
// =============================================================================
function GrammarMoment({ g, lang, isNonLatin, voiceAvailable, onContinue }) {
  const [checkAnswered, setCheckAnswered] = React.useState(null);
  const check = g.checks && g.checks[0];

  function boldify(text) {
    const esc = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  return (
    <Container style={{ paddingBottom: 140 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>
          Grammar moment
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 38 }}>{g.emoji}</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{g.title}</h1>
      </div>

      <Card style={{ padding: 18, marginBottom: 14 }}>
        <div
          style={{ fontSize: 14, lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: boldify(g.concept) }}
        />
      </Card>

      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Examples
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {(g.examples || []).map((ex, i) => (
          <div
            key={i}
            onClick={() => voiceAvailable && speak(ex.native, lang.ttsCode)}
            style={{ background: "var(--surface)", borderRadius: 10, padding: 12, cursor: voiceAvailable ? "pointer" : "default" }}
          >
            <div style={{
              fontSize: isNonLatin && lang.rtl ? 20 : 17, fontWeight: 700,
              direction: lang.rtl ? "rtl" : "ltr",
              fontFamily: lang.rtl ? '"Noto Nastaliq Urdu","Noto Naskh Arabic",serif' : "inherit",
            }}>
              {ex.native}
              {voiceAvailable && <span style={{ fontSize: 12, opacity: 0.4, marginLeft: 8 }}>🔊</span>}
            </div>
            <div style={{ fontSize: 13, color: "var(--accent)", fontStyle: "italic", marginTop: 3 }}>{ex.translit}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{ex.gloss}</div>
          </div>
        ))}
      </div>

      {check && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Quick check
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{check.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {check.options.map((opt, oi) => {
              const answered = checkAnswered != null;
              const isChosen = checkAnswered === opt;
              const isCorrect = opt === check.answer;
              let bg = "var(--surface)", border = "var(--border)";
              if (answered) {
                if (isCorrect) { bg = "rgba(34,197,94,0.15)"; border = "var(--primary)"; }
                else if (isChosen) { bg = "rgba(239,68,68,0.15)"; border = "var(--danger)"; }
              }
              return (
                <button
                  key={oi}
                  onClick={() => checkAnswered == null && setCheckAnswered(opt)}
                  style={{
                    background: bg, border: `2px solid ${border}`, color: "var(--text)",
                    borderRadius: 10, padding: "10px 12px", fontSize: 13, fontWeight: 700,
                    cursor: answered ? "default" : "pointer", textAlign: "left",
                  }}
                >
                  {opt}{answered && isCorrect ? "  ✓" : ""}
                </button>
              );
            })}
          </div>
          {checkAnswered != null && (
            <div style={{
              fontSize: 13, color: "var(--text-dim)", marginBottom: 8,
              background: "var(--surface-hi)", borderRadius: 8, padding: "8px 10px", lineHeight: 1.5,
            }}>
              💡 {check.explain}
            </div>
          )}
        </>
      )}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: "var(--bg-alt)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Button onClick={onContinue}>Got it — continue →</Button>
        </div>
      </div>
    </Container>
  );
}
