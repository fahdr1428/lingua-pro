// =============================================================================
// DIALECT DRILL (v76) — "what people actually say".
//
// The gap this closes is the one that makes learners give up on Arabic: they
// learn ماذا and أين and كيف, land somewhere, and hear إيه and فين and إزاي.
// The vocabulary they worked for is the written standard, and the street runs on
// something else.
//
// This drills exactly the words that CHANGE — nothing else. There are far fewer
// of them than people fear, which is itself the reassuring part, and the screen
// says so.
//
// It runs in two directions on purpose:
//   RECOGNISE  you hear the dialect word, what does it mean? — the survival skill
//   PRODUCE    you know the standard word, say the local one — the fitting-in skill
//
// And you can SAY the answer, not just tap it, because the whole reason to learn
// a dialect is to be understood out loud.
// =============================================================================

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { LANGUAGES } from "../data/registry.js";
import { getCharacter, guideVoice } from "../data/characters.js";
import { GuideMark } from "../ui/GuideMark.jsx";
import { regionsFor, getRegion } from "../data/personas.js";
import { dialectWords, hasDialectData, dialectCoverage } from "../data/dialects.js";
import { speak } from "../audio/tts.js";
import { cancelVoice, idle as voiceIdle } from "../audio/voice.js";
import { isRecognitionSupported, startListening, judge, BAND, displayScore } from "../audio/speech.js";
import { recordTurn } from "../engine/profile.js";

const ROUND = 8;

export function DialectDrill({ pack, appState, setAppState, onNavigate, profile, mutateProfile }) {
  const lang = LANGUAGES[pack.code];
  const guide = getCharacter(pack.code);
  const micSupported = isRecognitionSupported();

  const [regionId, setRegionId] = useState(profile?.region || null);
  const [phase, setPhase] = useState(profile?.region ? "intro" : "pick"); // pick | intro | round | result
  const [scored, setScored] = useState([]);

  const coverage = useMemo(() => dialectCoverage(pack.code, pack.vocab), [pack.code, pack.vocab]);
  const words = useMemo(() => dialectWords(pack.vocab, regionId), [pack.vocab, regionId]);
  const region = getRegion(pack.code, regionId);

  useEffect(() => () => cancelVoice(), []);

  const choose = useCallback((id) => {
    setRegionId(id);
    mutateProfile?.((p) => ({ ...p, region: id }));
    setPhase("intro");
  }, [mutateProfile]);

  const record = useCallback((entry) => {
    mutateProfile?.((p) => recordTurn(p, { ...entry, topic: `dialect: ${region?.name || regionId}` }));
  }, [mutateProfile, region?.name, regionId]);

  function finish(entries) {
    setScored(entries);
    setPhase("result");
    const xp = entries.reduce((n, e) => n + (e.correct ? 4 : 1), 0);
    if (xp) {
      setAppState((s) => ({
        ...s,
        totalXp: (s.totalXp || 0) + xp,
        sessions: [
          ...(s.sessions || []).slice(-199),
          { ts: Date.now(), language: pack.code, xp, accuracy: entries.filter((e) => e.correct).length / entries.length, kind: "dialect" },
        ],
      }));
    }
  }

  if (!hasDialectData(pack.vocab)) {
    return (
      <div className="speak-screen">
        <header className="speak-bar">
          <button onClick={() => onNavigate("home")} className="speak-close" aria-label="Close">✕</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow">Dialects</div>
            <div className="speak-title">Not for {lang.name}</div>
          </div>
        </header>
        <div className="speak-body">
          <div className="empty-note">
            {lang.name} doesn't have dialect data in this course yet — the standard
            form is what people use. Arabic is where this matters most, and that's
            where it's built out.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="speak-screen">
      <header className="speak-bar">
        <button
          onClick={() => (phase === "pick" || phase === "intro" ? onNavigate("home") : setPhase("intro"))}
          className="speak-close"
          aria-label={phase === "pick" ? "Close" : "Back"}
        >
          {phase === "pick" || phase === "intro" ? "✕" : "←"}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">What people actually say</div>
          <div className="speak-title">
            {region ? `${region.name} ${lang.name}` : `Which ${lang.name}?`}
          </div>
        </div>
        {guide && <GuideMark code={pack.code} size={34} />}
      </header>

      {phase === "pick" && (
        <div className="speak-body">
          <p className="intro-sub" style={{ margin: "0 0 16px" }}>
            The course teaches the standard form, because that's what's written and
            what everyone can read. But it isn't what anyone says. Pick where you're
            headed and you'll learn both.
          </p>
          <div className="mission-list">
            {coverage.map((r) => (
              <button key={r.id} className="mission-card" onClick={() => choose(r.id)} disabled={r.changes === 0}>
                <div className="mission-card-top">
                  <span className="mission-title">{r.flag ? `${r.flag} ` : ""}{r.name}</span>
                </div>
                {r.blurb && <div className="mission-stake">{r.blurb}</div>}
                <div className="mission-meta">
                  <span>{r.changes} {r.changes === 1 ? "word differs" : "words differ"}</span>
                  {r.changes === 0 && <><span>·</span><span>nothing to drill yet</span></>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "intro" && (
        <div className="speak-body">
          <div className="intro-card">
            <div className="intro-mark">{guide ? <GuideMark code={pack.code} size={64} /> : null}</div>
            <h2 className="intro-title">
              {words.length} words change in {region?.name}
            </h2>
            <p className="intro-sub">
              Out of {pack.vocab.length} you're learning. That's the honest number,
              and it's smaller than people expect — most of the language is shared.
              These are the ones that would leave you stuck.
            </p>
            <ul className="intro-points">
              <li><b>Both directions.</b> Recognising what you hear, and saying it their way.</li>
              <li><b>The standard form still counts.</b> Nothing you've learned becomes wrong.</li>
              <li><b>Say it or tap it</b> — the microphone accepts either form.</li>
            </ul>
            <button className="btn-hero" onClick={() => setPhase("round")} disabled={words.length < 4}>
              {words.length < 4 ? "Not enough words yet" : `Drill ${Math.min(ROUND, words.length)} of them`}
            </button>
            <button className="quiet-link" onClick={() => setPhase("pick")}>choose a different variety</button>
          </div>

          <div className="replay">
            <div className="eyebrow">All of them, for reference</div>
            <div className="dialect-table">
              {words.map(({ item, form }) => (
                <div className="dialect-row" key={item.id}>
                  <span className="dialect-meaning">{item.translation}</span>
                  <span className="dialect-std" dir="rtl" lang={pack.code}>{item.lemma}</span>
                  <span className="dialect-arrow" aria-hidden="true">→</span>
                  <span className="dialect-local" dir="rtl" lang={pack.code}>{form.lemma}</span>
                  <span className="dialect-tl">{form.translit}</span>
                  <button
                    className="xchg-play"
                    onClick={() => speak(form.lemma, lang.ttsCode, { ...guideVoice(pack.code), translit: form.translit })}
                    aria-label={`Hear ${form.translit}`}
                  >
                    <PlayIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "round" && (
        <DialectRound
          key={regionId}
          words={words}
          lang={lang}
          langCode={pack.code}
          region={region}
          micSupported={micSupported}
          onRecord={record}
          onFinish={finish}
        />
      )}

      {phase === "result" && (
        <DialectResult
          scored={scored}
          region={region}
          lang={lang}
          langCode={pack.code}
          guide={guide}
          onAgain={() => setPhase("round")}
          onDone={() => onNavigate("home")}
        />
      )}
    </div>
  );
}

// =============================================================================
function DialectRound({ words, lang, langCode, region, micSupported, onRecord, onFinish }) {
  const questions = useMemo(() => {
    const picked = [...words].sort(() => Math.random() - 0.5).slice(0, ROUND);
    return picked.map(({ item, form }, i) => {
      // Alternate: recognise what you heard, then produce what they'd say.
      const produce = i % 2 === 1;
      const others = words.filter((w) => w.item.id !== item.id).sort(() => Math.random() - 0.5);
      const distractors = [];
      const seen = new Set([produce ? form.lemma : item.translation]);
      for (const o of others) {
        if (distractors.length >= 3) break;
        const label = produce ? o.form.lemma : o.item.translation;
        if (seen.has(label)) continue;
        seen.add(label);
        distractors.push(o);
      }
      return { item, form, produce, distractors };
    }).filter((q) => q.distractors.length >= 2);
  }, [words]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const results = useRef([]);
  const q = questions[i];

  if (!q) {
    return (
      <div className="speak-body">
        <div className="empty-note">Not enough differing words to build a round yet.</div>
      </div>
    );
  }

  const options = useMemo(() => {
    const all = [
      { key: q.item.id, label: q.produce ? q.form.lemma : q.item.translation, sub: q.produce ? q.form.translit : null, right: true },
      ...q.distractors.map((d) => ({
        key: d.item.id,
        label: q.produce ? d.form.lemma : d.item.translation,
        sub: q.produce ? d.form.translit : null,
        right: false,
      })),
    ];
    return all.sort(() => Math.random() - 0.5);
  }, [q]);

  function answer(opt) {
    if (picked) return;
    setPicked(opt.key);
    results.current.push({ item: q.item, form: q.form, correct: opt.right, produce: q.produce });
    onRecord?.({
      band: opt.right ? BAND.GOT : BAND.MISS,
      score: opt.right ? 0.95 : 0.2,
      said: opt.right ? q.form.translit : "",
      spoken: false,
    });
    setTimeout(() => {
      if (i + 1 >= questions.length) onFinish(results.current);
      else { setPicked(null); setI((n) => n + 1); }
    }, 750);
  }

  return (
    <div className="speak-body">
      <div className="round-progress" aria-label={`Question ${i + 1} of ${questions.length}`}>
        {questions.map((_, n) => (
          <span key={n} className={`round-pip${n < i ? " pip-done" : n === i ? " pip-now" : ""}`} />
        ))}
      </div>

      <div className="prompt-card">
        <div className="eyebrow">
          {q.produce
            ? `You know the standard word. What would they say in ${region?.name}?`
            : `You hear this in ${region?.name}. What does it mean?`}
        </div>
        <div className="prompt-ask" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>
          {q.produce ? q.item.lemma : q.form.lemma}
        </div>
        <div className="prompt-hint">
          {q.produce
            ? `${q.item.translit} · “${q.item.translation}”`
            : q.form.translit}
        </div>
        <button
          className="quiet-link"
          onClick={() => {
            const t = q.produce ? q.item : { lemma: q.form.lemma, translit: q.form.translit };
            speak(t.lemma, lang.ttsCode, { ...guideVoice(langCode), translit: t.translit });
          }}
        >
          hear it
        </button>
      </div>

      <div className="skip-options">
        {options.map((o) => {
          const isAnswer = picked && o.right;
          const isWrong = picked === o.key && !o.right;
          return (
            <button
              key={o.key}
              className={`skip-option${isAnswer ? " skip-right" : ""}${isWrong ? " skip-wrong" : ""}`}
              onClick={() => answer(o)}
              disabled={!!picked}
              dir={q.produce && lang.rtl ? "rtl" : "ltr"}
            >
              <span className="skip-option-main">{o.label}</span>
              {o.sub && <span className="skip-option-sub">{o.sub}</span>}
            </button>
          );
        })}
      </div>

      {micSupported && q.produce && (
        <SayItInstead
          target={{ native: q.form.lemma, translit: q.form.translit, accept: [q.form.translit] }}
          lang={lang}
          langCode={langCode}
          onGraded={(r) => {
            if (r.band !== BAND.MISS) answer(options.find((o) => o.right));
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Saying it is the point. Tapping proves you recognise it; speaking proves you
// could use it. A pass here counts the question as answered.
// ---------------------------------------------------------------------------
function SayItInstead({ target, lang, langCode, onGraded }) {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const handle = useRef(null);
  const heardRef = useRef("");

  useEffect(() => () => { try { handle.current?.abort(); } catch {} }, []);

  async function listen() {
    heardRef.current = "";
    cancelVoice();
    await voiceIdle();
    setState("listening");
    const grade = async (transcripts) => {
      const r = await judge(transcripts, target);
      setResult(r);
      setState("done");
      onGraded?.(r);
    };
    handle.current = startListening({
      langCode, ttsCode: lang.ttsCode,
      onResult: ({ transcripts, isFinal }) => {
        heardRef.current = transcripts[0] || "";
        if (isFinal) grade(transcripts);
      },
      onError: () => setState("idle"),
      onEnd: () => { if (heardRef.current) grade([heardRef.current]); else setState((s) => (s === "listening" ? "idle" : s)); },
    });
    if (!handle.current) setState("idle");
  }

  if (state === "done" && result) {
    return (
      <div className={`corr-verdict corr-verdict-${result.band}`} style={{ textAlign: "center", marginTop: 12 }}>
        {result.band === BAND.GOT ? `That's it — ${displayScore(result)}%` : result.band === BAND.CLOSE ? "Close enough to be understood" : "Not quite — tap the answer instead"}
      </div>
    );
  }

  return (
    <button className="corr-retry" style={{ margin: "14px auto 0", display: "block" }} onClick={listen} disabled={state === "listening"}>
      {state === "listening" ? "Listening…" : "or say it out loud"}
    </button>
  );
}

// =============================================================================
function DialectResult({ scored, region, lang, langCode, guide, onAgain, onDone }) {
  const right = scored.filter((s) => s.correct).length;
  const missed = scored.filter((s) => !s.correct);

  return (
    <div className="speak-body">
      <div className="result-card">
        {guide && <GuideMark code={langCode} size={54} style={{ margin: "0 auto 14px" }} />}
        <h2 className="result-title">
          {right === scored.length ? `You'd follow that conversation` : `${right} of ${scored.length}`}
        </h2>
        <p className="result-sub">
          {right === scored.length
            ? `Every one. Those are the words that would otherwise have stopped you in ${region?.name}.`
            : `The standard forms you already know still work everywhere they're written. These are just the spoken ones worth adding.`}
        </p>

        {missed.length > 0 && (
          <div className="result-work">
            <div className="eyebrow">Worth another look</div>
            {missed.map((m, i) => (
              <div className="result-work-row" key={i}>
                <span className="result-work-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>
                  {m.form.lemma}
                </span>
                <span className="result-work-tl">{m.form.translit} · “{m.item.translation}”</span>
              </div>
            ))}
          </div>
        )}

        <div className="result-actions">
          <button className="btn-hero btn-hero-sm" onClick={onAgain}>Another round</button>
          <button className="btn-quiet" onClick={onDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  );
}
