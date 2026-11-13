// =============================================================================
// FIND YOUR LEVEL (v117) — where in this course should this learner start?
//
// The chapter test (SkipAhead) answers "can I skip THIS chapter". Someone who
// grew up hearing the language doesn't know which chapter to ask about. This
// walks the chapters in order from the first one not already open: twelve
// questions each, in both directions, eleven to pass (adapt.js — the bar is no
// easier than the chapter test's for anyone who doesn't know the chapter). It stops asking the moment a chapter is
// settled, and stops altogether at the first chapter not passed. That chapter
// is where the learner starts.
//
// A passed chapter gets exactly what the chapter test gives it (seedKnown +
// chapters.js withChapterPassed), as soon as it is passed — so stopping
// half-way keeps what was earned. Its words are marked known and come back
// for review within a week. Nothing is deleted, and nothing here is logged as
// a mistake: a word never taught isn't one.
// =============================================================================

import React, { useMemo, useRef, useState } from "react";
import { LANGUAGES, isNonLatinScript, scriptFont } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";
import { hasPassedChapter, withChapterPassed } from "../data/chapters.js";
import { placementStages, probeQuestions, probeVerdict, PROBE_SIZE, PROBE_PASS } from "../engine/adapt.js";

export function Placement({ engine, pack, appState, setAppState, onNavigate, refreshStats }) {
  const lang = LANGUAGES[pack.code];
  const nonLatin = isNonLatinScript(pack.code);
  const voice = hasVoiceFor(lang.ttsCode);
  const translitOf = useMemo(() => new Map((pack.vocab || []).map((v) => [v.lemma, v.translit || ""])), [pack.vocab]);

  // The chapters still to place: from the first one that isn't already open.
  const stages = useMemo(() => {
    const all = placementStages(pack);
    const from = all.findIndex((s) => !hasPassedChapter(appState, pack.code, s.num));
    return from < 0 ? [] : all.slice(from);
    // Fixed for the visit: passing a chapter mid-test must not reshuffle the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack]);

  const [phase, setPhase] = useState("intro");      // intro | quiz | between | result
  const [at, setAt] = useState(0);                  // which stage is being asked
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const answers = useRef([]);
  const missed = useRef([]);
  const [passedNow, setPassedNow] = useState(0);    // chapters passed in THIS visit
  const [last, setLast] = useState(null);           // { right, of } of the probe just finished

  const stage = stages[at];
  const q = questions[idx];

  function begin(i) {
    answers.current = [];
    setQuestions(probeQuestions(stages[i], pack));
    setAt(i); setIdx(0); setPicked(null);
    setPhase("quiz");
  }

  async function settle(verdict) {
    const right = answers.current.filter(Boolean).length;
    setLast({ right, of: answers.current.length });
    if (verdict === "passed") {
      // Exactly what passing the chapter test does — applied now, so stopping
      // later keeps it.
      try { await engine.seedKnown(stage.ids); await engine.skipKnownModules(stage.ids); } catch {}
      setAppState((s) => withChapterPassed(s, pack.code, stage.num, stage.ids));
      refreshStats?.();
      setPassedNow((n) => n + 1);
      setPhase(at + 1 < stages.length ? "between" : "result");
    } else {
      setPhase("result");
    }
  }

  function answer(option) {
    if (picked !== null) return;
    setPicked(option);
    const right = option === q.answer;
    answers.current.push(right);
    if (!right) missed.current.push(q.item);
    const verdict = probeVerdict(answers.current);
    setTimeout(() => {
      if (verdict === "asking" && idx + 1 < questions.length) { setPicked(null); setIdx((n) => n + 1); }
      else settle(verdict === "asking" ? "failed" : verdict);
    }, 650);
  }

  const startStage = phase === "result" ? stages[passedNow] || null : null;

  return (
    <div className="speak-screen" data-testid="placement" data-phase={phase}>
      <header className="speak-bar">
        <button className="speak-close" aria-label="Close" onClick={() => onNavigate("home")}>✕</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Find your level</div>
          <div className="speak-title">
            {phase === "quiz" && stage ? `Chapter ${stage.num}` : `Where to start in ${lang.name}`}
          </div>
        </div>
      </header>

      {phase === "intro" && (
        <div className="speak-body">
          {stages.length === 0 ? (
            <>
              <p className="intro-sub" style={{ margin: "0 0 16px" }}>
                There's nothing left to place: every chapter that can be tested is already open.
              </p>
              <div className="result-actions">
                <button className="btn-quiet" onClick={() => onNavigate("home")}>Back</button>
              </div>
            </>
          ) : (
            <>
              <p className="intro-sub" style={{ margin: "0 0 14px" }}>
                If you already know some {lang.name}, this finds where you should start. It asks about one chapter at a
                time, from Chapter {stages[0].num}: {PROBE_SIZE} questions, and {PROBE_PASS} right moves you past it.
              </p>
              <ul className="place-points">
                <li>It stops at the first chapter you don't pass. That's where you start.</li>
                <li>Two misses in a chapter settles it, so a beginner is done in under a minute.</li>
                <li>Words you're moved past are marked known and come back for review within a week.</li>
              </ul>
              <div className="mission-list" style={{ marginTop: 16 }}>
                {stages.map((s) => (
                  <div key={s.num} className="mission-card place-stage">
                    <div className="mission-card-top"><span className="mission-title">Chapter {s.num}</span></div>
                    <div className="mission-stake">{s.unitTitles.join(" · ")}</div>
                    <div className="mission-meta"><span>{s.ids.length} words</span></div>
                  </div>
                ))}
              </div>
              <div className="result-actions">
                <button className="btn-hero btn-hero-sm" data-testid="placement-start" onClick={() => begin(0)}>Start</button>
                <button className="btn-quiet" onClick={() => onNavigate("skipahead")}>Test one chapter instead</button>
              </div>
            </>
          )}
        </div>
      )}

      {phase === "quiz" && q && (
        <div className="speak-body">
          <div className="round-progress" aria-label={`Question ${idx + 1} of up to ${questions.length}`}>
            {questions.map((_, n) => (
              <span key={n} className={`round-pip${n < idx ? " pip-done" : n === idx ? " pip-now" : ""}`} />
            ))}
          </div>

          <div className="prompt-card" data-testid="placement-question" data-dir={q.dir}>
            <div className="eyebrow">{q.dir === "word" ? `Which is the ${lang.name} for this?` : "What does this mean?"}</div>
            <div
              className="prompt-ask"
              dir={q.dir === "meaning" && lang.rtl ? "rtl" : "ltr"}
              lang={q.dir === "meaning" ? pack.code : "en"}
              style={q.dir === "meaning" ? { fontFamily: scriptFont(pack.code, undefined) } : undefined}
            >
              {q.prompt}
            </div>
            {q.dir === "meaning" && nonLatin && q.promptTranslit && <div className="place-tl">{q.promptTranslit}</div>}
            {q.dir === "meaning" && voice && (
              <button
                className="quiet-link"
                onClick={() => speak(q.item.lemma, lang.ttsCode, { audioId: q.item.id, code: pack.code, translit: q.item.translit })}
              >
                hear it
              </button>
            )}
          </div>

          <div className="skip-options">
            {q.options.map((o) => {
              const isAnswer = picked !== null && o === q.answer;
              const isWrong = picked === o && o !== q.answer;
              const tl = q.dir === "word" && nonLatin ? translitOf.get(o) : "";
              return (
                <button
                  key={o}
                  className={`skip-option${isAnswer ? " skip-right" : ""}${isWrong ? " skip-wrong" : ""}`}
                  onClick={() => answer(o)}
                  disabled={picked !== null}
                  dir={q.dir === "word" && lang.rtl ? "rtl" : "ltr"}
                  lang={q.dir === "word" ? pack.code : "en"}
                >
                  <span className="skip-option-main" style={q.dir === "word" ? { fontFamily: scriptFont(pack.code, undefined) } : undefined}>{o}</span>
                  {tl && <span className="skip-option-sub" dir="ltr">{tl}</span>}
                </button>
              );
            })}
          </div>

          <button className="quiet-link" data-testid="placement-stop" onClick={() => setPhase("result")}>Stop here</button>
        </div>
      )}

      {phase === "between" && stage && (
        <div className="speak-body" data-testid="placement-between">
          <div className="place-verdict">
            <div className="eyebrow">Chapter {stage.num} · passed</div>
            <div className="place-big">{last?.right} of {last?.of} right</div>
            <p className="intro-sub" style={{ margin: "8px 0 0" }}>
              Its {stage.ids.length} words are marked known. Next is Chapter {stages[at + 1].num}: {stages[at + 1].unitTitles.join(" · ")}.
            </p>
          </div>
          <div className="result-actions">
            <button className="btn-hero btn-hero-sm" data-testid="placement-continue" onClick={() => begin(at + 1)}>
              Try Chapter {stages[at + 1].num}
            </button>
            <button className="btn-quiet" onClick={() => setPhase("result")}>Stop here and start at Chapter {stages[at + 1].num}</button>
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className="speak-body" data-testid="placement-result" data-passed={passedNow} data-start={startStage ? startStage.num : ""}>
          <div className="place-verdict">
            <div className="eyebrow">Your starting point</div>
            <div className="place-big">
              {startStage ? `Chapter ${startStage.num}` : "Past every chapter"}
            </div>
            <p className="intro-sub" style={{ margin: "8px 0 0" }}>
              {startStage && passedNow === 0 && (
                <>Chapter {startStage.num} has words you don't know yet, so that's the right place to begin: {startStage.unitTitles.join(" · ")}.</>
              )}
              {startStage && passedNow > 0 && (
                <>
                  You passed {passedNow === 1 ? "one chapter" : `${passedNow} chapters`}, so {passedNow === 1 ? "its" : "their"} words
                  are marked known and will come back for review within a week. You start at {startStage.unitTitles.join(" · ")}.
                </>
              )}
              {!startStage && (
                <>You passed every chapter that can be tested. All of it is open, and its words will come back for review within a week.</>
              )}
            </p>
          </div>

          {missed.current.length > 0 && (
            <div className="place-missed" data-testid="placement-missed">
              <div className="eyebrow" style={{ marginBottom: 8 }}>The ones you missed</div>
              {missed.current.slice(0, 6).map((w) => (
                <div key={w.id} className="place-missed-row">
                  <span dir={lang.rtl ? "rtl" : "ltr"} lang={pack.code} style={{ fontFamily: scriptFont(pack.code, undefined) }} className="place-missed-native">{w.lemma}</span>
                  {nonLatin && w.translit && <span className="place-tl">{w.translit}</span>}
                  <span className="place-missed-en">{w.translation}</span>
                </div>
              ))}
            </div>
          )}

          <div className="result-actions">
            <button className="btn-hero btn-hero-sm" data-testid="placement-done" onClick={() => onNavigate("home")}>Go to my course</button>
          </div>
        </div>
      )}
    </div>
  );
}
