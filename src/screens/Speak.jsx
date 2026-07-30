// =============================================================================
// SPEAK (v70) — the speaking trainer. The thing the app was missing entirely.
//
// Until now the "Speak" tab in the bottom nav led to a READING screen. Nothing in
// the app ever listened to the learner. You could finish the whole course without
// once saying a word out loud.
//
// TWO MODES:
//
//   1. SAY IT — "How would you say 'and where are you from?'" and nothing else.
//      No native text, no transliteration, no audio hint. You have to produce it
//      from memory, which is the whole point: recognition is easy and recall is
//      what fluency is made of. The answer is revealed only after you've tried.
//
//   2. CONVERSATION — the guide speaks a line aloud, you answer out loud, they
//      react and move on. Built from the journey stops, so it's the same content
//      the map promised you could handle.
//
// HOW IT JUDGES: audio/speech.js does the grading, deliberately leniently. Three
// bands — got it / close / not yet — and it never marks someone down for an
// accent. Feedback names the word that went missing rather than saying "wrong".
//
// WHAT THIS IS AND ISN'T: recognition and grading both run on-device. No API key,
// no per-request cost, no latency, and the learner's voice never leaves their
// machine. It is NOT a language model, and the code doesn't pretend otherwise —
// judge() in speech.js is a single seam where a hosted grader can be dropped in
// later without touching this screen.
//
// FALLBACK IS FIRST-CLASS: Firefox has no SpeechRecognition, and permission can
// be denied anywhere. Both cases become a typing drill with the same grading,
// not a dead end.
// =============================================================================

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Container } from "../ui/primitives.jsx";
import { GuideMark } from "../ui/GuideMark.jsx";
import { LANGUAGES } from "../data/registry.js";
import { getCharacter, getReaction, guideVoice } from "../data/characters.js";
import { getStops, hasJourney, stopsReached } from "../data/journey.js";
import { cultureOfTheDay, tagLabel } from "../data/culture.js";
import { speak, stopSpeaking } from "../audio/tts.js";
import {
  isRecognitionSupported, startListening, judge, displayScore, BAND,
} from "../audio/speech.js";

export function Speak({ engine, pack, appState, setAppState, params, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const guide = getCharacter(pack.code);
  const micSupported = isRecognitionSupported();

  const [mode, setMode] = useState("say");
  const [unitProgress, setUnitProgress] = useState([]);

  useEffect(() => {
    let cancelled = false;
    engine.getUnitProgress().then((up) => { if (!cancelled) setUnitProgress(up); });
    return () => { cancelled = true; };
  }, [engine]);

  // Stop any audio when the screen unmounts — otherwise the guide keeps talking
  // over the next screen.
  useEffect(() => () => stopSpeaking(), []);

  const reached = hasJourney(pack.code) ? stopsReached(pack.code, unitProgress) : 0;

  // ---------------------------------------------------------------------------
  // What to practise. Journey lines first (they're verified full sentences the
  // learner has been promised), then vocabulary they've actually learned.
  // Nothing is drawn from material they haven't met — being asked to produce a
  // word you've never seen isn't a challenge, it's a trick.
  // ---------------------------------------------------------------------------
  const [learnedIds, setLearnedIds] = useState(null);
  useEffect(() => {
    let cancelled = false;
    engine.getProgress().then((progress) => {
      if (cancelled) return;
      const ids = new Set(
        Object.entries(progress || {})
          .filter(([, card]) => (card?.reps || 0) > 0)
          .map(([id]) => id)
      );
      setLearnedIds(ids);
    });
    return () => { cancelled = true; };
  }, [engine, pack.code]);

  const drills = useMemo(() => {
    const out = [];
    const stops = getStops(pack.code);

    // Everything up to and including the current stop — the map said you could
    // handle these, so these are fair game.
    stops.slice(0, Math.max(1, reached + 1)).forEach((s) => {
      out.push({
        key: `stop-${s.id}`,
        ask: s.you.en,
        target: { native: s.you.text, translit: s.you.translit },
        context: s.they,
        source: "journey",
      });
    });

    if (learnedIds && learnedIds.size) {
      (pack.vocab || [])
        .filter((v) => learnedIds.has(v.id))
        .slice(0, 40)
        .forEach((v) => {
          out.push({
            key: `word-${v.id}`,
            ask: v.translation,
            target: { native: v.lemma, translit: v.translit, accept: [v.translit] },
            audioId: v.id,
            pronunciation: v.pronunciation,
            source: "word",
          });
        });
    }

    // If a specific stop was requested from the map, put it first.
    if (params?.stopId) {
      const i = out.findIndex((d) => d.key === `stop-${params.stopId}`);
      if (i > 0) out.unshift(out.splice(i, 1)[0]);
    }
    return out;
  }, [pack.code, pack.vocab, reached, learnedIds, params?.stopId]);

  const convoTurns = useMemo(() => {
    const stops = getStops(pack.code);
    return stops.slice(0, Math.max(1, reached + 1));
  }, [pack.code, reached]);

  // Session tally, banked as XP on the way out so speaking counts toward the
  // daily goal like any other practice.
  const tally = useRef({ attempts: 0, got: 0, xp: 0 });
  const bank = useCallback(() => {
    const t = tally.current;
    if (!t.attempts) return;
    const xp = t.xp;
    const accuracy = t.attempts ? t.got / t.attempts : 0;
    tally.current = { attempts: 0, got: 0, xp: 0 };
    setAppState((s) => ({
      ...s,
      totalXp: (s.totalXp || 0) + xp,
      sessions: [
        ...(s.sessions || []).slice(-199),
        { ts: Date.now(), language: pack.code, xp, accuracy, kind: "speak" },
      ],
    }));
  }, [setAppState, pack.code]);

  useEffect(() => () => bank(), [bank]);

  function leave() {
    bank();
    stopSpeaking();
    onNavigate("home");
  }

  const culture = cultureOfTheDay(pack.code);

  return (
    <div className="home-wash">
      <div className="speak-bar">
        <button onClick={leave} className="speak-close" aria-label="Close">✕</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Speaking</div>
          <div className="speak-title">Out loud, in {lang.name}</div>
        </div>
        {guide && <GuideMark code={pack.code} size={34} />}
      </div>

      <Container style={{ maxWidth: 560, paddingTop: 14 }}>
        {!micSupported && (
          <div className="mic-warn">
            <strong>No microphone in this browser.</strong> Speech recognition needs
            Chrome, Edge or Safari. You can still do everything here by typing —
            the grading is identical.
          </div>
        )}

        <div className="seg">
          <button className={`seg-btn${mode === "say" ? " seg-on" : ""}`} onClick={() => setMode("say")}>
            Say it
          </button>
          <button
            className={`seg-btn${mode === "convo" ? " seg-on" : ""}`}
            onClick={() => setMode("convo")}
            disabled={!convoTurns.length}
          >
            Conversation
          </button>
        </div>

        {mode === "say" ? (
          <SayItDrill
            drills={drills}
            lang={lang}
            langCode={pack.code}
            guide={guide}
            micSupported={micSupported}
            tally={tally}
          />
        ) : (
          <ConversationDrill
            turns={convoTurns}
            lang={lang}
            langCode={pack.code}
            guide={guide}
            micSupported={micSupported}
            tally={tally}
          />
        )}

        {culture && (
          <div className="culture-note" style={{ marginTop: 26 }}>
            <div className="culture-tag">{tagLabel(culture.tag)}</div>
            <div className="culture-title">{culture.title}</div>
            <div className="culture-body">{culture.body}</div>
          </div>
        )}
      </Container>
    </div>
  );
}

// =============================================================================
// SAY IT — recall production. English in, speech out, nothing given away.
// =============================================================================
function SayItDrill({ drills, lang, langCode, guide, micSupported, tally }) {
  const [i, setI] = useState(0);
  const [result, setResult] = useState(null);
  const drill = drills[i];

  function onGraded(r) {
    tally.current.attempts++;
    if (r.band === BAND.GOT) { tally.current.got++; tally.current.xp += 4; }
    else if (r.band === BAND.CLOSE) tally.current.xp += 2;
    setResult(r);
  }

  function next() {
    setResult(null);
    setI((n) => (n + 1) % Math.max(1, drills.length));
  }

  if (!drills.length) {
    return (
      <div className="speak-empty">
        <p>Nothing to say out loud yet — finish a lesson first and your words will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="drill-card">
        <div className="eyebrow">How would you say</div>
        <div className="drill-ask">{drill.ask}</div>
        {drill.context && (
          <div className="drill-context">
            Someone just said: “{drill.context.translit}” — {drill.context.en}
          </div>
        )}
        {!result && (
          <div className="drill-nohint">
            No hint on purpose. Say it from memory — that's the part that sticks.
          </div>
        )}
      </div>

      <AttemptPad
        key={drill.key}
        target={drill.target}
        lang={lang}
        langCode={langCode}
        guide={guide}
        micSupported={micSupported}
        onGraded={onGraded}
        result={result}
        onRetry={() => setResult(null)}
      />

      {result && (
        <Verdict
          result={result}
          target={drill.target}
          pronunciation={drill.pronunciation}
          audioId={drill.audioId}
          lang={lang}
          langCode={langCode}
          guide={guide}
          onNext={next}
          onRetry={() => setResult(null)}
          nextLabel="Next phrase"
        />
      )}

      <div className="drill-count">{i + 1} of {drills.length}</div>
    </div>
  );
}

// =============================================================================
// CONVERSATION — the guide talks, you answer, they react. Turn-based, voiced.
// =============================================================================
function ConversationDrill({ turns, lang, langCode, guide, micSupported, tally }) {
  const [turn, setTurn] = useState(0);
  const [result, setResult] = useState(null);
  const [guideSpeaking, setGuideSpeaking] = useState(false);
  const [reaction, setReaction] = useState(null);
  const stop = turns[turn];

  const voice = guideVoice(langCode);

  // The guide opens each turn by speaking their line, the way a person would.
  const sayTheirLine = useCallback(async () => {
    if (!stop) return;
    setGuideSpeaking(true);
    try {
      await speak(stop.they.text, lang.ttsCode, voice);
    } finally {
      setGuideSpeaking(false);
    }
  }, [stop, lang.ttsCode, voice.rate, voice.pitch]);

  useEffect(() => {
    setResult(null);
    setReaction(null);
    const t = setTimeout(() => { sayTheirLine(); }, 350);
    return () => clearTimeout(t);
  }, [turn]);

  async function onGraded(r) {
    tally.current.attempts++;
    if (r.band === BAND.GOT) { tally.current.got++; tally.current.xp += 5; }
    else if (r.band === BAND.CLOSE) tally.current.xp += 2;
    setResult(r);

    const kind = r.band === BAND.GOT ? "correct" : "wrong";
    const line = getReaction(langCode, kind);
    if (line) {
      setReaction(line);
      setGuideSpeaking(true);
      try { await speak(line, lang.ttsCode, voice); } finally { setGuideSpeaking(false); }
    }
  }

  if (!stop) {
    return <div className="speak-empty"><p>No conversation for this language yet.</p></div>;
  }

  const atEnd = turn >= turns.length - 1;

  return (
    <div>
      <div className="convo-card">
        <div className="convo-them">
          <GuideMark code={langCode} size={40} speaking={guideSpeaking} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="convo-who">{guide?.name || "They"} says</div>
            <div className="convo-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>
              {stop.they.text}
            </div>
            <div className="convo-tl">{stop.they.translit}</div>
            <div className="convo-en">{stop.they.en}</div>
          </div>
          <button className="xchg-play" onClick={sayTheirLine} aria-label="Play again">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            </svg>
          </button>
        </div>

        <div className="convo-your-turn">
          <div className="eyebrow">Your turn — say</div>
          <div className="convo-goal">{stop.you.en}</div>
        </div>
      </div>

      <AttemptPad
        key={`${stop.id}-${turn}`}
        target={stop.you}
        lang={lang}
        langCode={langCode}
        guide={guide}
        micSupported={micSupported}
        onGraded={onGraded}
        result={result}
        onRetry={() => setResult(null)}
      />

      {reaction && (
        <div className="convo-reaction">
          <GuideMark code={langCode} size={24} speaking={guideSpeaking} />
          <span>{reaction}</span>
        </div>
      )}

      {result && (
        <Verdict
          result={result}
          target={stop.you}
          lang={lang}
          langCode={langCode}
          guide={guide}
          onNext={() => setTurn((t) => (atEnd ? 0 : t + 1))}
          onRetry={() => setResult(null)}
          nextLabel={atEnd ? "Start over" : "Their reply →"}
        />
      )}

      <div className="drill-count">Turn {turn + 1} of {turns.length}</div>
    </div>
  );
}

// =============================================================================
// ATTEMPT PAD — the mic, or the keyboard. Shared by both modes so the two can't
// drift apart in behaviour.
// =============================================================================
function AttemptPad({ target, lang, langCode, guide, micSupported, onGraded, result, onRetry }) {
  const [state, setState] = useState("idle"); // idle | listening | judging
  const [heardLive, setHeardLive] = useState("");
  const [error, setError] = useState(null);
  const [typed, setTyped] = useState("");
  const [typing, setTyping] = useState(!micSupported);
  const handle = useRef(null);
  const settled = useRef(false);
  // Mirrors heardLive for the onEnd handler. Reading the state variable there
  // would capture the value from the render that registered the callback — i.e.
  // always "" — so a recogniser that ends without firing a final result would
  // silently discard a perfectly good attempt.
  const heardRef = useRef("");

  // Never leave the mic open behind us.
  useEffect(() => () => { try { handle.current?.abort(); } catch {} }, []);

  async function grade(transcripts) {
    if (settled.current) return;
    settled.current = true;
    setState("judging");
    const r = await judge(transcripts, target, { guideName: guide?.name });
    setState("idle");
    onGraded(r);
  }

  function listen() {
    setError(null);
    setHeardLive("");
    heardRef.current = "";
    settled.current = false;
    stopSpeaking(); // don't let TTS bleed into the mic
    setState("listening");

    handle.current = startListening({
      langCode,
      ttsCode: lang.ttsCode,
      onResult: ({ transcripts, isFinal }) => {
        setHeardLive(transcripts[0] || "");
        heardRef.current = transcripts[0] || "";
        if (isFinal) grade(transcripts);
      },
      onError: (e) => {
        setState("idle");
        if (!e.benign) setError(e.message);
        else if (e.code === "no-speech") setError(e.message);
        if (e.code === "not-allowed" || e.code === "service-not-allowed" || e.code === "unsupported") {
          setTyping(true);
        }
      },
      onEnd: () => {
        // Some engines end without ever firing a final result — grade the last
        // interim transcript rather than silently doing nothing.
        setState((s) => (s === "listening" ? "idle" : s));
        if (!settled.current && heardRef.current) grade([heardRef.current]);
      },
    });

    if (!handle.current) { setState("idle"); setTyping(true); }
  }

  function stop() {
    try { handle.current?.stop(); } catch {}
    setState("idle");
  }

  if (result) return null;

  return (
    <div className="pad">
      {!typing ? (
        <>
          <button
            className={`mic mic-${state}`}
            onClick={state === "listening" ? stop : listen}
            disabled={state === "judging"}
            aria-label={state === "listening" ? "Stop listening" : "Start speaking"}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </button>
          <div className="mic-state">
            {state === "listening"
              ? heardLive ? `“${heardLive}”` : "Listening… say it now"
              : state === "judging"
              ? "One moment…"
              : "Tap and say it out loud"}
          </div>
          {error && <div className="mic-error">{error}</div>}
          <button className="quiet-link" onClick={() => setTyping(true)}>
            or type it instead
          </button>
        </>
      ) : (
        <div className="type-pad">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && typed.trim()) grade([typed]); }}
            placeholder="Type what you'd say…"
            className="type-input"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            className="type-submit"
            disabled={!typed.trim()}
            onClick={() => { settled.current = false; grade([typed]); }}
          >
            Check
          </button>
          {micSupported && (
            <button className="quiet-link" onClick={() => { setTyping(false); setTyped(""); }}>
              or use the microphone
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// VERDICT — the answer, revealed only now, with what they actually said and one
// specific thing to fix.
// =============================================================================
function Verdict({
  result, target, pronunciation, audioId, lang, langCode, guide, onNext, onRetry, nextLabel,
}) {
  const [playing, setPlaying] = useState(false);
  const band = result.band;

  const head = band === BAND.GOT ? "Got it" : band === BAND.CLOSE ? "Close" : "Not yet";

  async function hear() {
    setPlaying(true);
    try {
      await speak(target.native, lang.ttsCode, { audioId, ...guideVoice(langCode) });
    } finally {
      setPlaying(false);
    }
  }

  // Play the model answer straight away — hearing it right after trying is when
  // the correction actually lands.
  useEffect(() => { const t = setTimeout(hear, 250); return () => clearTimeout(t); }, []);

  return (
    <div className={`verdict verdict-${band}`}>
      <div className="verdict-head">
        <span className="verdict-word">{head}</span>
        <span className="verdict-score">{displayScore(result)}%</span>
      </div>

      <div className="verdict-feedback">{result.feedback}</div>

      {result.heard && (
        <div className="verdict-heard">You said: “{result.heard}”</div>
      )}

      <div className="verdict-answer">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">The line</div>
          <div className="verdict-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>
            {target.native}
          </div>
          <div className="verdict-tl">{target.translit}</div>
          {pronunciation && <div className="verdict-pron">say it like: {pronunciation}</div>}
        </div>
        <button className={`xchg-play${playing ? " xchg-playing" : ""}`} onClick={hear} aria-label="Listen">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          </svg>
        </button>
      </div>

      <div className="verdict-actions">
        <button className="station-go" onClick={onNext}>{nextLabel}</button>
        <button className="station-speak" onClick={onRetry}>Try again</button>
      </div>
    </div>
  );
}
