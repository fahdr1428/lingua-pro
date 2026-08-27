// =============================================================================
// SKIP AHEAD (v75) — prove you already know a chapter and move past it.
//
// THE PROBLEM. Someone who grew up hearing a language, or did two years of it at
// school, opens the app and is asked to learn "hello". They will not stay. The
// existing test-out covered a single unit and sampled the whole pack at random,
// which is a placement quiz — useful, but it doesn't answer "can I skip THIS
// chapter", which is the question a returning learner actually has.
//
// WHAT THIS IS. Per chapter, a test drawn only from that chapter's own words,
// asked in both directions so recognition alone isn't enough. Pass it and the
// chapter's words are seeded as known and the chapter is marked passed, which
// unlocks the next one through the normal gate in chapters.js — the same gate a
// real exam pass goes through, so nothing downstream needs to know the
// difference.
//
// THE PASS BAR IS DELIBERATELY HIGHER THAN THE NORMAL CHAPTER EXAM (85% vs 70%).
// Failing a chapter exam costs you a retry; skipping a chapter you don't
// actually know costs you the next twenty lessons, because everything after it
// assumes those words. Asymmetric risk, asymmetric bar.
//
// AND IT NEVER SKIPS SILENTLY. On a fail it names the words that let you down
// and offers to start the chapter properly, because "you got 60%" with no
// detail is the least useful thing a test can say.
// =============================================================================

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { LANGUAGES, isNonLatinScript } from "../data/registry.js";
import { getCharacter } from "../data/characters.js";
import { GuideMark } from "../ui/GuideMark.jsx";
import { speak } from "../audio/tts.js";
import {
  UNITS_PER_CHAPTER, unitIndicesForChapter, chapterVocabIds,
  hasPassedChapter, completeChapterCount,
} from "../data/chapters.js";

// Higher than the 70% a normal chapter exam needs. See the header.
const PASS = 0.85;
const QUESTIONS = 14;

export function SkipAhead({ engine, pack, appState, setAppState, params, onNavigate, refreshStats }) {
  const lang = LANGUAGES[pack.code];
  const guide = getCharacter(pack.code);
  const isNonLatin = isNonLatinScript(pack.code);

  const [phase, setPhase] = useState("pick");   // pick | quiz | result
  const [chapter, setChapter] = useState(null); // the target: a chapter OR a unit
  const [result, setResult] = useState(null);

  const chapterCount = Math.max(1, completeChapterCount((pack.units || []).length));

  const chapters = useMemo(() => {
    const out = [];
    for (let c = 1; c <= chapterCount; c++) {
      const ids = chapterVocabIds(pack.vocab || [], c);
      const unitTitles = unitIndicesForChapter(c)
        .map((i) => pack.units?.[i]?.title)
        .filter(Boolean);
      out.push({
        kind: "chapter",
        num: c,
        label: `Chapter ${c}`,
        ids,
        unitTitles,
        passed: hasPassedChapter(appState, pack.code, c),
        // A chapter with too few words can't make a fair test.
        testable: ids.length >= 8,
      });
    }
    return out;
  }, [pack.vocab, pack.units, pack.code, appState, chapterCount]);

  // v78 — TESTING OUT OF A SINGLE UNIT.
  //
  // The route map's locked stops now link here with a unit id. Previously they
  // pointed at a separate v26 screen that ignored the unit entirely and quizzed
  // twelve random words from the whole language — so "test out of Family"
  // handed you words from Directions and Numbers, and passing it meant nothing
  // in particular. One rigorous test, scoped to whatever you tapped, is better
  // than two tests where the reachable one is wrong.
  const unitTarget = useMemo(() => {
    const unitId = params?.fromUnit;
    if (!unitId) return null;
    const ids = (pack.vocab || []).filter((v) => v.unit === unitId).map((v) => v.id);
    if (ids.length < 6) return null; // too few words to judge anyone on
    const title = (pack.units || []).find((u) => u.id === unitId)?.title || "this unit";
    return { kind: "unit", unitId, num: null, label: title, ids, unitTitles: [title], testable: true, passed: false };
  }, [params?.fromUnit, pack.vocab, pack.units]);

  // Arriving with a unit id means the learner already chose — go straight to the
  // questions rather than making them pick a chapter they didn't ask about.
  useEffect(() => {
    if (unitTarget) { setChapter(unitTarget); setResult(null); setPhase("quiz"); }
  }, [unitTarget]);

  const start = useCallback((c) => {
    setChapter(c);
    setResult(null);
    setPhase("quiz");
  }, []);

  const finish = useCallback(async (r) => {
    setResult(r);
    setPhase("result");
    if (!r.passed || !chapter) return;

    // Seed the words as known. For a unit that's the whole effect: the unit's
    // completion percentage jumps, which is exactly what the unlock rule in
    // chapters.js reads, so the next unit opens. A unit pass deliberately does
    // NOT clear a chapter gate — the chapter exam still stands, because proving
    // one unit is not proving six.
    await engine.seedKnown(chapter.ids);
    setAppState((s) => {
      const testedOut = new Set(s.testedOut?.[pack.code] || []);
      chapter.ids.forEach((id) => testedOut.add(id));
      const next = { ...s, testedOut: { ...s.testedOut, [pack.code]: [...testedOut] } };

      if (chapter.kind === "chapter") {
        const passed = new Set(s.chaptersPassed?.[pack.code] || []);
        // Everything up to and including this chapter — you cannot meaningfully
        // skip chapter 3 while chapter 1 is still gated.
        for (let c = 1; c <= chapter.num; c++) passed.add(c);
        next.chaptersPassed = { ...s.chaptersPassed, [pack.code]: [...passed].sort((a, b) => a - b) };
      }
      return next;
    });
    refreshStats?.();
  }, [chapter, engine, pack.code, setAppState, refreshStats]);

  return (
    <div className="speak-screen">
      <header className="speak-bar">
        <button
          className="speak-close"
          aria-label={phase === "pick" ? "Close" : "Back"}
          onClick={() => (phase === "pick" ? onNavigate("home") : setPhase("pick"))}
        >
          {phase === "pick" ? "✕" : "←"}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">{chapter?.kind === "unit" ? "Test out" : "Skip ahead"}</div>
          <div className="speak-title">
            {phase === "pick" ? `Already know some ${lang.name}?` : `${chapter?.label} test`}
          </div>
        </div>
        {guide && <GuideMark code={pack.code} size={34} />}
      </header>

      {phase === "pick" && (
        <ChapterPicker
          chapters={chapters}
          lang={lang}
          onStart={start}
          onNavigate={onNavigate}
        />
      )}

      {phase === "quiz" && chapter && (
        <ChapterQuiz
          key={chapter.unitId || chapter.num}
          chapter={chapter}
          pack={pack}
          lang={lang}
          isNonLatin={isNonLatin}
          onFinish={finish}
          onQuit={() => setPhase("pick")}
        />
      )}

      {phase === "result" && result && chapter && (
        <SkipResult
          result={result}
          chapter={chapter}
          lang={lang}
          langCode={pack.code}
          guide={guide}
          isNonLatin={isNonLatin}
          onRetry={() => start(chapter)}
          onPick={() => setPhase("pick")}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

// =============================================================================
// PICK — which chapter do you want to skip?
// =============================================================================
function ChapterPicker({ chapters, lang, onStart, onNavigate }) {
  const nextToTest = chapters.find((c) => !c.passed && c.testable);

  return (
    <div className="speak-body">
      <p className="intro-sub" style={{ margin: "0 0 16px" }}>
        If you already know a chapter's worth of {lang.name} — from school, from
        family, from living somewhere — prove it here and move past it. The test
        uses only that chapter's own words, in both directions, and the bar is
        deliberately high: skipping something you don't know makes everything
        after it harder.
      </p>

      <div className="mission-list">
        {chapters.map((c) => (
          <button
            key={c.num}
            className="mission-card"
            disabled={!c.testable}
            onClick={() => onStart(c)}
          >
            <div className="mission-card-top">
              <span className="mission-title">Chapter {c.num}</span>
              {c.passed && <span className="mission-badge mission-badge-done">already open</span>}
              {!c.passed && c.num === nextToTest?.num && <span className="mission-badge">start here</span>}
            </div>
            <div className="mission-stake">
              {c.unitTitles.length ? c.unitTitles.join(" · ") : `Units ${unitIndicesForChapter(c.num).map((i) => i + 1).join(", ")}`}
            </div>
            <div className="mission-meta">
              <span>{c.ids.length} words</span>
              <span>·</span>
              <span>{Math.min(QUESTIONS, c.ids.length)} questions</span>
              <span>·</span>
              <span>{Math.round(PASS * 100)}% to pass</span>
              {!c.testable && <><span>·</span><span>not enough words to test</span></>}
            </div>
          </button>
        ))}
      </div>

      <div className="empty-note" style={{ paddingTop: 24 }}>
        Passing a chapter here unlocks everything up to it and marks its words as
        known — they'll still come back for review later, just not as brand-new
        words. Nothing is deleted, and you can revisit any unit whenever you like.
      </div>

      <div className="result-actions">
        <button className="btn-quiet" onClick={() => onNavigate("home")}>Back</button>
      </div>
    </div>
  );
}

// =============================================================================
// QUIZ — both directions, so recognition alone isn't a pass.
// =============================================================================
function ChapterQuiz({ chapter, pack, lang, isNonLatin, onFinish, onQuit }) {
  const questions = useMemo(() => {
    const inChapter = (pack.vocab || []).filter((v) => chapter.ids.includes(v.id) && v.lemma && v.translation);
    const shuffled = [...inChapter].sort(() => Math.random() - 0.5).slice(0, QUESTIONS);

    return shuffled.map((item, i) => {
      // Alternate direction. Recognising a word you've seen is much easier than
      // producing it, and a test made only of the easy half is not a test.
      const toNative = i % 2 === 0;

      // Distractors from the same chapter, deduped by the label they'll render
      // with — two options reading the same thing makes the question unanswerable.
      const label = (v) => (toNative ? v.lemma : v.translation);
      const seen = new Set([label(item)]);
      const distractors = [];
      for (const v of [...inChapter].sort(() => Math.random() - 0.5)) {
        if (distractors.length >= 3) break;
        if (v.id === item.id) continue;
        const l = label(v);
        if (!l || seen.has(l)) continue;
        seen.add(l);
        distractors.push(v);
      }

      return {
        item,
        toNative,
        prompt: toNative ? item.translation : (isNonLatin ? item.translit || item.lemma : item.lemma),
        native: item.lemma,
        options: [item, ...distractors]
          .sort(() => Math.random() - 0.5)
          .map((v) => ({
            id: v.id,
            label: label(v),
            sub: toNative && isNonLatin ? v.translit : null,
          })),
        answerId: item.id,
      };
    }).filter((q) => q.options.length >= 2);
  }, [chapter, pack.vocab, isNonLatin]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const answers = React.useRef([]);

  if (!questions.length) {
    return (
      <div className="speak-body">
        <div className="empty-note">There aren't enough distinct words in this chapter to build a fair test.</div>
        <div className="result-actions"><button className="btn-quiet" onClick={onQuit}>Back</button></div>
      </div>
    );
  }

  const q = questions[idx];

  function answer(optionId) {
    if (picked) return;
    setPicked(optionId);
    const right = optionId === q.answerId;
    answers.current.push({ item: q.item, right });
    // A brief pause so the learner sees which was right — then straight on.
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const correct = answers.current.filter((a) => a.right).length;
        onFinish({
          correct,
          total: answers.current.length,
          score: correct / answers.current.length,
          passed: correct / answers.current.length >= PASS,
          missed: answers.current.filter((a) => !a.right).map((a) => a.item),
        });
      } else {
        setPicked(null);
        setIdx((n) => n + 1);
      }
    }, 700);
  }

  return (
    <div className="speak-body">
      <div className="round-progress" aria-label={`Question ${idx + 1} of ${questions.length}`}>
        {questions.map((_, n) => (
          <span key={n} className={`round-pip${n < idx ? " pip-done" : n === idx ? " pip-now" : ""}`} />
        ))}
      </div>

      <div className="prompt-card">
        <div className="eyebrow">{q.toNative ? `Say this in ${lang.name}` : "What does this mean?"}</div>
        <div
          className="prompt-ask"
          dir={!q.toNative && lang.rtl ? "rtl" : "ltr"}
          lang={!q.toNative ? pack.code : "en"}
        >
          {q.prompt}
        </div>
        {!q.toNative && (
          <button
            className="quiet-link"
            onClick={() => speak(q.native, lang.ttsCode, { audioId: q.item.id, code: pack.code, translit: q.item.translit })}
          >
            hear it
          </button>
        )}
      </div>

      <div className="skip-options">
        {q.options.map((o) => {
          const isAnswer = picked && o.id === q.answerId;
          const isWrong = picked === o.id && o.id !== q.answerId;
          return (
            <button
              key={o.id}
              className={`skip-option${isAnswer ? " skip-right" : ""}${isWrong ? " skip-wrong" : ""}`}
              onClick={() => answer(o.id)}
              disabled={!!picked}
              dir={q.toNative && lang.rtl ? "rtl" : "ltr"}
            >
              <span className="skip-option-main">{o.label}</span>
              {o.sub && <span className="skip-option-sub">{o.sub}</span>}
            </button>
          );
        })}
      </div>

      <button className="quiet-link" onClick={onQuit}>Stop the test</button>
    </div>
  );
}

// =============================================================================
// RESULT
// =============================================================================
function SkipResult({ result, chapter, lang, langCode, guide, isNonLatin, onRetry, onPick, onNavigate }) {
  const pct = Math.round(result.score * 100);

  return (
    <div className="speak-body">
      <div className={`result-card debrief-${result.passed ? "pass" : "fail"}`}>
        {guide && <GuideMark code={langCode} size={54} style={{ margin: "0 auto 14px" }} />}
        <h2 className="result-title">
          {result.passed
            ? chapter.kind === "unit"
              ? `“${chapter.label}” is behind you`
              : `Chapter ${chapter.num} is behind you`
            : "Not quite — and that's useful to know"}
        </h2>
        <p className="result-sub">
          {result.passed
            ? chapter.kind === "unit"
              ? `${result.correct} of ${result.total}. Those words are marked as known and this stop is open. The stops after it still come in order, and the chapter exam still stands — proving one unit isn't proving six.`
              : `${result.correct} of ${result.total}. Everything up to chapter ${chapter.num} is open, and those words are marked as known — they'll come back for review, not as new words.`
            : `${result.correct} of ${result.total}. You need ${Math.round(PASS * 100)}% to skip ${chapter.kind === "unit" ? "a stop" : "a chapter"}, because everything after it builds on these words. The ones below are what let you down.`}
        </p>

        <div className="result-stats">
          <div><b>{pct}%</b><span>scored</span></div>
          <div><b>{Math.round(PASS * 100)}%</b><span>needed</span></div>
        </div>

        {result.missed.length > 0 && (
          <div className="result-work">
            <div className="eyebrow">Worth learning properly</div>
            {result.missed.slice(0, 8).map((w) => (
              <div className="result-work-row" key={w.id}>
                <span className="result-work-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>
                  {w.lemma}
                </span>
                <span className="result-work-tl">
                  {isNonLatin && w.translit ? `${w.translit} · ` : ""}{w.translation}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="result-actions">
          {result.passed ? (
            <>
              <button className="btn-hero btn-hero-sm" onClick={() => onNavigate("home")}>See what's open now</button>
              <button className="btn-quiet" onClick={onPick}>
                {chapter.kind === "unit" ? "Skip a whole chapter instead" : "Try the next chapter"}
              </button>
            </>
          ) : (
            <>
              <button className="btn-hero btn-hero-sm" onClick={() => onNavigate("hub")}>Learn these properly</button>
              <button className="btn-quiet" onClick={onRetry}>Try the test again</button>
              <button className="btn-quiet" onClick={onPick}>
                {chapter.kind === "unit" ? "Test out of a whole chapter" : "Other chapters"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
