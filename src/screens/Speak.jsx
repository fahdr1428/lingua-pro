// =============================================================================
// SPEAK (v72) — one session, with a beginning, a middle and an end.
//
// WHAT WAS WRONG WITH v71. It was three tabs — "Say it", "Scripted",
// "Live coach" — and that was the whole problem. Three modes that all vaguely
// mean "speaking" is not a feature, it's a settings screen: the learner has to
// decide what kind of practice they want before they've done any. On top of
// that it never ended. "1 of 36" is a slog, not a session. There was no start,
// no finish, no sense of having done a thing. The microphone — the only control
// that matters — sat below the fold under a prompt card, a hint, and a giant
// browser-support warning.
//
// WHAT THIS IS INSTEAD. One flow with a shape:
//
//     intro  →  round × 6  →  result  →  (talk to your guide)
//
//   - INTRO says what's about to happen and how long it takes, and asks for the
//     microphone ONCE, up front — not as a permission dialog that ambushes the
//     first prompt.
//   - ROUND is one prompt at a time with the mic as the hero of the screen and a
//     progress bar across the top. A pass plays its audio and moves on by itself;
//     a miss stays put, because that's where the practice actually is.
//   - RESULT is the thing v71 had no concept of: how it went, which lines to
//     work on, and one clear next action.
//   - TALK is the live coach — the destination you graduate to, not a tab
//     competing for attention before you've said a word.
//
// THE SCRIPTED MODE IS GONE, folded in rather than deleted: a prompt drawn from
// a journey stop now plays the other person's line aloud first and then asks you
// to answer it. That IS the scripted conversation, minus the separate tab.
//
// AND WHEN THE COACH ISN'T CONFIGURED it says so, with a link, instead of
// silently hiding the tab. A feature that vanishes without explanation reads as
// a bug — which is exactly how it read.
// =============================================================================

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GuideMark } from "../ui/GuideMark.jsx";
import { LANGUAGES } from "../data/registry.js";
import { getCharacter, guideVoice } from "../data/characters.js";
import { getStops, hasJourney, stopsReached } from "../data/journey.js";
import { speak } from "../audio/tts.js";
import { sayCoach, cancelVoice, idle as voiceIdle, voiceSupported } from "../audio/voice.js";
import { probeCoach, levelFor } from "../ai/coach.js";
import { LiveConversation } from "../ui/LiveConversation.jsx";
import { PERSONAS, getPersona, getRegion } from "../data/personas.js";
import { recordTurn, summariseForPrompt } from "../engine/profile.js";
import {
  isRecognitionSupported, startListening, judge, displayScore, BAND,
} from "../audio/speech.js";

const ROUND_SIZE = 6;
// How long a passing verdict stays on screen before it carries itself forward.
// Long enough to read the coach's sentence; short enough not to feel like a wait.
const MIN_VERDICT_MS = 2200;

// =============================================================================
// ORCHESTRATOR
// =============================================================================
export function Speak({ engine, pack, appState, setAppState, params, onNavigate, profile, mutateProfile }) {
  const lang = LANGUAGES[pack.code];
  const guide = getCharacter(pack.code);
  const micSupported = isRecognitionSupported();

  const [phase, setPhase] = useState("intro"); // intro | round | result | talk
  const [unitProgress, setUnitProgress] = useState([]);
  const [learnedIds, setLearnedIds] = useState(null);
  const [coachReady, setCoachReady] = useState(null); // null = still probing
  const [scored, setScored] = useState([]);           // one entry per prompt attempted

  useEffect(() => {
    let cancelled = false;
    engine.getUnitProgress().then((up) => { if (!cancelled) setUnitProgress(up); });
    engine.getProgress().then((progress) => {
      if (cancelled) return;
      setLearnedIds(new Set(
        Object.entries(progress || {})
          .filter(([, c]) => (c?.reps || 0) > 0)
          .map(([id]) => id)
      ));
    });
    probeCoach().then((p) => { if (!cancelled) setCoachReady(!!p.configured); });
    return () => { cancelled = true; };
  }, [engine, pack.code]);

  useEffect(() => () => cancelVoice(), []);

  const reached = hasJourney(pack.code) ? stopsReached(pack.code, unitProgress) : 0;

  // ---------------------------------------------------------------------------
  // What to practise. Journey lines first — they're full sentences the map has
  // already promised the learner can handle, and they carry the other half of a
  // conversation. Vocabulary fills the rest. Nothing they haven't met.
  // ---------------------------------------------------------------------------
  const pool = useMemo(() => {
    const out = [];
    getStops(pack.code).slice(0, Math.max(1, reached + 1)).forEach((s) => {
      out.push({
        key: `stop-${s.id}`,
        kind: "line",
        ask: s.you.en,
        prompt: s.they,                       // spoken first — you're answering someone
        target: { native: s.you.text, translit: s.you.translit },
      });
    });
    if (learnedIds?.size) {
      (pack.vocab || [])
        .filter((v) => learnedIds.has(v.id))
        .forEach((v) => out.push({
          key: `word-${v.id}`,
          kind: "word",
          ask: v.translation,
          target: { native: v.lemma, translit: v.translit, accept: [v.translit] },
          audioId: v.id,
          pronunciation: v.pronunciation,
        }));
    }
    return out;
  }, [pack.code, pack.vocab, reached, learnedIds]);

  // The session: journey lines first, then a shuffled spread of words, capped at
  // ROUND_SIZE so it always ends. A deep link from the route map pins its phrase
  // to the front.
  const session = useMemo(() => {
    const lines = pool.filter((d) => d.kind === "line");
    const words = pool.filter((d) => d.kind === "word").sort(() => Math.random() - 0.5);
    let picked = [...lines.slice(-3), ...words].slice(0, ROUND_SIZE);
    if (params?.stopId) {
      const wanted = pool.find((d) => d.key === `stop-${params.stopId}`);
      if (wanted) picked = [wanted, ...picked.filter((d) => d.key !== wanted.key)].slice(0, ROUND_SIZE);
    }
    return picked;
  }, [pool, params?.stopId]);

  // XP is banked once, when the session ends or the screen closes.
  const banked = useRef(false);
  const bank = useCallback((entries) => {
    if (banked.current || !entries.length) return;
    banked.current = true;
    const got = entries.filter((e) => e.band === BAND.GOT).length;
    const xp = entries.reduce((n, e) => n + (e.band === BAND.GOT ? 5 : e.band === BAND.CLOSE ? 2 : 1), 0);
    setAppState((s) => ({
      ...s,
      totalXp: (s.totalXp || 0) + xp,
      sessions: [
        ...(s.sessions || []).slice(-199),
        { ts: Date.now(), language: pack.code, xp, accuracy: got / entries.length, kind: "speak" },
      ],
    }));
    return xp;
  }, [setAppState, pack.code]);

  const scoredRef = useRef(scored);
  scoredRef.current = scored;
  useEffect(() => () => bank(scoredRef.current), [bank]);

  function close() {
    bank(scoredRef.current);
    cancelVoice();
    onNavigate("home");
  }

  function finish(entries) {
    bank(entries);
    setScored(entries);
    setPhase("result");
  }

  function restart() {
    banked.current = false;
    setScored([]);
    setPhase("round");
  }

  // v73: every graded attempt goes into the learner profile. This is the memory
  // the coach reads back on the next conversation, and the evidence the fluency
  // score is computed from — so it's recorded per ATTEMPT, not per session, and
  // it carries `spoken` so a typed answer never claims a pronunciation signal.
  const record = useCallback((entry) => {
    mutateProfile?.((p) => recordTurn(p, {
      band: entry.band,
      score: entry.score,
      latencyMs: entry.latencyMs,
      topic: entry.topic,
      said: entry.said,
      spoken: entry.spoken,
    }));
  }, [mutateProfile]);

  const shared = { lang, langCode: pack.code, guide, micSupported };

  return (
    <div className="speak-screen">
      <header className="speak-bar">
        <button onClick={close} className="speak-close" aria-label="Close">✕</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Speaking</div>
          <div className="speak-title">
            {phase === "talk" ? `Talking with ${guide?.name || "your guide"}` : `Out loud, in ${lang.name}`}
          </div>
        </div>
        {guide && <GuideMark code={pack.code} size={34} />}
      </header>

      {phase === "intro" && (
        <SpeakIntro
          {...shared}
          count={session.length}
          ready={session.length > 0}
          onStart={() => setPhase("round")}
        />
      )}

      {phase === "round" && (
        <SpeakRound {...shared} session={session} onFinish={finish} onRecord={record} />
      )}

      {phase === "result" && (
        <SpeakResult
          {...shared}
          scored={scored}
          coachReady={coachReady}
          onAgain={restart}
          onTalk={() => setPhase("talk")}
          onDone={close}
          onNavigate={onNavigate}
        />
      )}

      {phase === "talk" && (
        <TalkToGuide
          {...shared}
          level={levelFor(appState?.lessonsCompleted?.[pack.code] || 0, learnedIds?.size || 0)}
          profile={profile}
          mutateProfile={mutateProfile}
          onBack={() => setPhase("result")}
        />
      )}
    </div>
  );
}

// =============================================================================
// INTRO — say what's about to happen, and get the microphone out of the way.
// =============================================================================
function SpeakIntro({ lang, langCode, guide, micSupported, count, ready, onStart }) {
  const [mic, setMic] = useState("unknown"); // unknown | granted | denied | unavailable
  const [asking, setAsking] = useState(false);

  useEffect(() => { if (!micSupported) setMic("unavailable"); }, [micSupported]);

  // Ask ONCE, here, rather than letting the browser's permission prompt land on
  // top of the first question.
  async function askForMic() {
    if (!navigator?.mediaDevices?.getUserMedia) { setMic("unavailable"); return; }
    setAsking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop()); // we only wanted the permission
      setMic("granted");
    } catch {
      setMic("denied");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="speak-body">
      <div className="intro-card">
        <div className="intro-mark">
          {guide ? <GuideMark code={langCode} size={64} /> : null}
        </div>
        <h2 className="intro-title">
          {count} things to say out loud
        </h2>
        <p className="intro-sub">
          I'll ask, you answer in {lang.name}. Say it however it comes out —
          it doesn't have to be exact, and an accent is not a mistake.
          About {Math.max(2, Math.round(count * 0.6))} minutes.
        </p>

        <ul className="intro-points">
          <li><b>You'll hear it back</b> after every go, so you can copy the rhythm.</li>
          <li><b>Nothing is graded harshly.</b> If a native speaker would understand you, that's a pass.</li>
          <li><b>Say it again</b> as many times as you like — that's the point.</li>
        </ul>

        {mic === "unavailable" && (
          <div className="intro-mic intro-mic-off">
            No microphone in this browser — Chrome, Edge or Safari have one.
            You can still do the whole session by typing, and it's graded exactly the same.
          </div>
        )}
        {mic === "denied" && (
          <div className="intro-mic intro-mic-off">
            Microphone blocked. You can allow it in your browser's address bar, or
            just type your answers — the grading is identical.
          </div>
        )}
        {mic === "granted" && (
          <div className="intro-mic intro-mic-on">Microphone ready.</div>
        )}

        {micSupported && mic === "unknown" && (
          <button className="btn-quiet" onClick={askForMic} disabled={asking}>
            {asking ? "Waiting for permission…" : "Turn on the microphone"}
          </button>
        )}

        <button className="btn-hero" onClick={onStart} disabled={!ready}>
          {ready ? "Start speaking" : "Finish a lesson first"}
        </button>
        {!ready && (
          <p className="intro-empty">
            There's nothing to practise yet — learn a few words and they'll show up here.
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// ROUND — one prompt at a time. The mic is the hero.
// =============================================================================
function SpeakRound({ lang, langCode, guide, micSupported, session, onFinish, onRecord }) {
  const [i, setI] = useState(0);
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [lastScore, setLastScore] = useState(null);
  const scored = useRef([]);
  const drill = session[i];

  const advance = useCallback((entry) => {
    if (entry) scored.current = [...scored.current, entry];
    cancelVoice();
    if (i + 1 >= session.length) return onFinish(scored.current);
    setResult(null);
    setAttempt(0);
    setLastScore(null);
    setI((n) => n + 1);
  }, [i, session.length, onFinish]);

  function onGraded(r, meta = {}) {
    setAttempt((n) => n + 1);
    setResult(r);
    // Recorded per attempt, including retries — a second go that lands IS
    // evidence, and dropping it would make the profile flatter than the truth.
    onRecord?.({
      band: r.band,
      score: r.score,
      latencyMs: meta.latencyMs ?? null,
      spoken: !!meta.spoken,
      said: r.heard || "",
      topic: drill.kind === "line" ? "conversation lines" : "vocabulary",
    });
  }

  function retry() {
    setLastScore(result?.score ?? null);
    setResult(null);
  }

  if (!drill) return null;

  const best = result
    ? { band: result.band, score: result.score, ask: drill.ask, target: drill.target }
    : null;

  return (
    <div className="speak-body">
      <div className="round-progress" aria-label={`Question ${i + 1} of ${session.length}`}>
        {session.map((_, n) => (
          <span key={n} className={`round-pip${n < i ? " pip-done" : n === i ? " pip-now" : ""}`} />
        ))}
      </div>

      <PromptCard drill={drill} lang={lang} langCode={langCode} revealed={!!result} />

      {!result ? (
        <MicPad
          key={`${drill.key}-${attempt}`}
          target={drill.target}
          lang={lang}
          langCode={langCode}
          guide={guide}
          micSupported={micSupported}
          previousScore={lastScore}
          onGraded={onGraded}
        />
      ) : (
        <InlineVerdict
          result={result}
          drill={drill}
          lang={lang}
          langCode={langCode}
          attempt={attempt}
          isLast={i + 1 >= session.length}
          onRetry={retry}
          onNext={() => advance(best)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// The prompt. For a journey line the other person speaks first, so the learner
// is answering someone rather than reciting.
// ---------------------------------------------------------------------------
function PromptCard({ drill, lang, langCode, revealed }) {
  const [playing, setPlaying] = useState(false);
  const spoken = useRef(false);

  const play = useCallback(async () => {
    if (!drill.prompt) return;
    setPlaying(true);
    try { await speak(drill.prompt.text, lang.ttsCode, guideVoice(langCode)); }
    finally { setPlaying(false); }
  }, [drill, lang.ttsCode, langCode]);

  useEffect(() => {
    spoken.current = false;
    if (!drill.prompt) return;
    const t = setTimeout(() => { if (!spoken.current) { spoken.current = true; play(); } }, 300);
    return () => clearTimeout(t);
  }, [drill.key, play]);

  return (
    <div className="prompt-card">
      {drill.prompt && (
        <button className={`prompt-heard${playing ? " prompt-heard-live" : ""}`} onClick={play}>
          <span className="prompt-heard-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            </svg>
          </span>
          <span style={{ minWidth: 0 }}>
            <span className="prompt-heard-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>
              {drill.prompt.text}
            </span>
            <span className="prompt-heard-en">{drill.prompt.en}</span>
          </span>
        </button>
      )}

      <div className="eyebrow">{drill.prompt ? "Answer with" : "How would you say"}</div>
      <div className="prompt-ask">{drill.ask}</div>
      {!revealed && (
        <div className="prompt-hint">From memory — no hint until you've had a go.</div>
      )}
    </div>
  );
}

// =============================================================================
// MIC PAD — the biggest thing on the screen, because it's the only thing to do.
// =============================================================================
function MicPad({ target, lang, langCode, guide, micSupported, previousScore, onGraded }) {
  const [state, setState] = useState("idle"); // idle | listening | judging
  const [heard, setHeard] = useState("");
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(!micSupported);
  const [typed, setTyped] = useState("");
  const handle = useRef(null);
  const settled = useRef(false);
  const heardRef = useRef("");

  // Latency: from the mic opening to the first interim transcript — the moment
  // they actually started talking. It is NOT measured for typed answers, because
  // typing speed says nothing about whether you were translating in your head.
  const openedAt = useRef(null);
  const firstWordAt = useRef(null);

  useEffect(() => () => { try { handle.current?.abort(); } catch {} }, []);

  async function grade(transcripts, meta = {}) {
    if (settled.current) return;
    settled.current = true;
    setState("judging");
    const r = await judge(transcripts, target, { guideName: guide?.name, previousScore });
    setState("idle");
    onGraded(r, meta);
  }

  function spokenMeta() {
    return {
      spoken: true,
      latencyMs: openedAt.current && firstWordAt.current
        ? Math.max(0, firstWordAt.current - openedAt.current)
        : null,
    };
  }

  async function listen() {
    setError(null);
    setHeard("");
    heardRef.current = "";
    settled.current = false;
    firstWordAt.current = null;
    // Wait for any audio to actually stop; speechSynthesis.cancel() is async, and
    // a mic opened too early transcribes the app's own voice.
    cancelVoice();
    await voiceIdle();
    setState("listening");
    openedAt.current = Date.now();
    handle.current = startListening({
      langCode,
      ttsCode: lang.ttsCode,
      onResult: ({ transcripts, isFinal }) => {
        if (!firstWordAt.current) firstWordAt.current = Date.now();
        setHeard(transcripts[0] || "");
        heardRef.current = transcripts[0] || "";
        if (isFinal) grade(transcripts, spokenMeta());
      },
      onError: (e) => {
        setState("idle");
        if (e.code === "not-allowed" || e.code === "service-not-allowed" || e.code === "unsupported") {
          setTyping(true);
        }
        setError(e.message);
      },
      onEnd: () => {
        setState((s) => (s === "listening" ? "idle" : s));
        if (!settled.current && heardRef.current) grade([heardRef.current], spokenMeta());
      },
    });
    if (!handle.current) { setState("idle"); setTyping(true); }
  }

  if (typing) {
    return (
      <div className="pad">
        <div className="type-pad">
          <input
            className="type-input"
            value={typed}
            autoFocus
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && typed.trim()) grade([typed]); }}
            placeholder="Type what you'd say…"
            autoComplete="off" autoCorrect="off" spellCheck={false}
          />
          <button className="type-submit" disabled={!typed.trim()} onClick={() => grade([typed])}>
            Check
          </button>
          {micSupported && (
            <button className="quiet-link" onClick={() => { setTyping(false); setTyped(""); setError(null); }}>
              use the microphone instead
            </button>
          )}
        </div>
        {error && <div className="mic-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="pad">
      <button
        className={`mic mic-big mic-${state}`}
        onClick={state === "listening" ? () => { try { handle.current?.stop(); } catch {} } : listen}
        disabled={state === "judging"}
        aria-label={state === "listening" ? "Stop and check" : "Hold the thought — tap and speak"}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      </button>
      <div className="mic-state">
        {state === "listening"
          ? (heard ? `“${heard}”` : "Listening — say it now")
          : state === "judging" ? "One moment…" : "Tap, then say it"}
      </div>
      {error && <div className="mic-error">{error}</div>}
      <button className="quiet-link" onClick={() => setTyping(true)}>or type it instead</button>
    </div>
  );
}

// =============================================================================
// INLINE VERDICT — compact, spoken, and it gets out of the way on a pass.
// =============================================================================
function InlineVerdict({ result, drill, lang, langCode, attempt, isLast, onRetry, onNext }) {
  const [talking, setTalking] = useState(false);
  const passed = result.band === BAND.GOT;
  const target = drill.target;

  useEffect(() => {
    let cancelled = false;
    const shownAt = Date.now();
    (async () => {
      await new Promise((r) => setTimeout(r, 180));
      if (cancelled) return;
      if (result.spoken && voiceSupported()) {
        setTalking(true);
        await sayCoach(result.spoken);
        setTalking(false);
      }
      if (cancelled) return;
      await speak(target.native, lang.ttsCode, { audioId: drill.audioId, ...guideVoice(langCode) });

      // A pass carries itself forward — staying on a question you've answered is
      // just friction. A miss stays put, because that's where the work is.
      if (cancelled || !passed) return;

      // But it must stay long enough to READ. When neither speech synthesis nor
      // a pre-recorded clip is available (Firefox, a device with no voices, a
      // word with no audio file) both awaits above resolve almost instantly, and
      // without this floor the feedback would flash past in half a second — the
      // learner would never see why they passed.
      const elapsed = Date.now() - shownAt;
      await new Promise((r) => setTimeout(r, Math.max(600, MIN_VERDICT_MS - elapsed)));
      if (!cancelled) onNext();
    })();
    return () => { cancelled = true; cancelVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`vslim vslim-${result.band}`}>
      <div className="vslim-top">
        <GuideMark code={langCode} size={30} speaking={talking} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="vslim-head">
            <span className="vslim-band">{passed ? "Got it" : result.band === BAND.CLOSE ? "Close" : "Not yet"}</span>
            <span className="vslim-score">{displayScore(result)}%</span>
          </div>
          <div className="vslim-say">{result.feedback}</div>
        </div>
      </div>

      <div className="vslim-line">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="vslim-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>{target.native}</div>
          <div className="vslim-tl">
            {target.translit}
            {drill.pronunciation ? ` · ${drill.pronunciation}` : ""}
          </div>
          {result.heard && <div className="vslim-heard">you said “{result.heard}”</div>}
        </div>
        <button
          className="xchg-play"
          onClick={() => speak(target.native, lang.ttsCode, { audioId: drill.audioId, ...guideVoice(langCode) })}
          aria-label="Hear it again"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          </svg>
        </button>
      </div>

      <div className="vslim-actions">
        {passed ? (
          <button className="btn-quiet" onClick={onNext}>{isLast ? "Finish" : "Next"} →</button>
        ) : (
          <>
            <button className="btn-hero btn-hero-sm" onClick={onRetry}>Say it again</button>
            <button className="btn-quiet" onClick={onNext}>{isLast ? "Finish" : "Move on"}</button>
          </>
        )}
      </div>
      {attempt > 1 && !passed && (
        <div className="vslim-attempt">Attempt {attempt} — nobody gets this first go</div>
      )}
    </div>
  );
}

// =============================================================================
// RESULT — the thing v71 had no concept of. How it went, and what's next.
// =============================================================================
function SpeakResult({ lang, langCode, guide, scored, coachReady, onAgain, onTalk, onDone, onNavigate }) {
  const got = scored.filter((s) => s.band === BAND.GOT).length;
  const shaky = scored.filter((s) => s.band !== BAND.GOT);
  const xp = scored.reduce((n, e) => n + (e.band === BAND.GOT ? 5 : e.band === BAND.CLOSE ? 2 : 1), 0);

  const headline =
    !scored.length ? "Nothing scored this time"
    : got === scored.length ? "Every one of them landed"
    : got >= scored.length / 2 ? "That's real progress"
    : "You said all of them out loud";

  const subline =
    !scored.length ? "Come back and give it a go — speaking is the fastest way in."
    : got === scored.length ? "Not one of those would have left a native speaker guessing."
    : `${got} of ${scored.length} would land as-is. The rest just need another pass — that's completely normal.`;

  return (
    <div className="speak-body">
      <div className="result-card">
        {guide && <GuideMark code={langCode} size={54} style={{ margin: "0 auto 14px" }} />}
        <h2 className="result-title">{headline}</h2>
        <p className="result-sub">{subline}</p>

        <div className="result-stats">
          <div><b>{got}/{scored.length}</b><span>landed</span></div>
          <div><b>+{xp}</b><span>xp</span></div>
        </div>

        {shaky.length > 0 && (
          <div className="result-work">
            <div className="eyebrow">Worth another go</div>
            {shaky.slice(0, 4).map((s, i) => (
              <div className="result-work-row" key={i}>
                <span className="result-work-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>
                  {s.target.native}
                </span>
                <span className="result-work-tl">{s.target.translit}</span>
              </div>
            ))}
          </div>
        )}

        {/* The graduation step: controlled practice, then free production. */}
        {coachReady === true && (
          <button className="btn-hero" onClick={onTalk}>
            Now have a conversation with {guide?.name || "your guide"}
          </button>
        )}
        {coachReady === false && (
          <div className="result-locked">
            <b>Want a real conversation?</b> {guide?.name || "Your guide"} can talk with you
            freely — say anything and they answer, correct one thing, and ask you
            something back. It needs an Anthropic API key set on the deployment
            (<code>ANTHROPIC_API_KEY</code>); see <code>docs/ai-coach.md</code>.
          </div>
        )}

        {/* v73: the drill is the warm-up; the mission is the thing they came for. */}
        {coachReady === true && scored.length > 0 && (
          <button className="quiet-link" onClick={() => onNavigate("missions")}>
            or take it into a real situation →
          </button>
        )}

        <div className="result-actions">
          <button className="btn-quiet" onClick={onAgain}>Another {ROUND_SIZE}</button>
          <button className="btn-quiet" onClick={onDone}>Done for now</button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TALK — the live coach. The conversation itself now lives in
// ui/LiveConversation.jsx, shared with Missions; this is the framing around it.
// =============================================================================
function TalkToGuide({ lang, langCode, guide, micSupported, level, profile, mutateProfile, onBack }) {
  const learnerBrief = useMemo(() => summariseForPrompt(profile), [profile]);
  const personaId = profile?.persona || "friendly";
  const persona = getPersona(personaId);
  const region = getRegion(langCode, profile?.region);

  const onTurn = useCallback((rec) => {
    mutateProfile?.((p) => recordTurn(p, rec));
  }, [mutateProfile]);

  return (
    <div className="speak-body speak-body-talk">
      <button className="talk-back" onClick={onBack}>← back to the session</button>

      {/* v74 — how they talk to you is your call. Changing it starts the
          conversation again, because a partner who changes character mid-way is
          more confusing than starting over. */}
      <div className="manner-row">
        <span className="manner-label">Talk to me like a</span>
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            className={`chip${personaId === p.id ? " chip-on" : ""}`}
            onClick={() => mutateProfile?.((prev) => ({ ...prev, persona: p.id }))}
          >
            {p.name}
          </button>
        ))}
      </div>

      <LiveConversation
        key={personaId}
        lang={lang}
        langCode={langCode}
        guide={guide}
        micSupported={micSupported}
        level={level}
        persona={persona}
        region={region}
        learnerBrief={learnerBrief}
        onTurn={onTurn}
      />
    </div>
  );
}
