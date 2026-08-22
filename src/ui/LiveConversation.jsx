// =============================================================================
// LIVE CONVERSATION (v73) — the one talking surface, used by Speak and Missions.
//
// v72 had a conversation UI buried inside Speak.jsx. Missions need the same
// thing with stakes attached, and two copies of a component this stateful would
// have drifted apart within a week — so it lives here once and takes props for
// the parts that differ (persona, region, mission, scenario).
//
// WHAT'S NEW HERE BEYOND "IT CHATS":
//
//   REAL-TIME CORRECTION. The coach returns structured corrections, and they
//   render attached to the learner's own bubble — struck-through fragment, the
//   native version beside it, one line on why. Not a lecture at the end of the
//   session that nobody reads: the fix arrives while the sentence is still in
//   their head, and they can say it again on the spot.
//
//   LATENCY IS MEASURED, NOT GUESSED. The clock starts when the guide stops
//   speaking and stops on the FIRST interim transcript — the moment the learner
//   actually began talking, not when they finished. That's the number that makes
//   responsiveness in fluency.js real, and it's why typed turns record no
//   latency at all: typing speed isn't hesitation.
//
//   EVERY TURN IS REMEMBERED. onTurn() hands the parent a graded record that
//   goes into the profile, which comes back as the learner brief on the next
//   request. That loop is the whole difference between a chatbot and something
//   that trains you.
// =============================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GuideMark } from "./GuideMark.jsx";
import { guideVoice } from "../data/characters.js";
import { speak } from "../audio/tts.js";
import { sayCoach, cancelVoice, idle as voiceIdle, voiceSupported } from "../audio/voice.js";
import { coachTurn, CoachError } from "../ai/coach.js";
import { startListening, judge, BAND } from "../audio/speech.js";
import { AiBadge, ReportAi } from "./AiDisclosure.jsx";

// The coach grades comprehensibility as one of three verdicts. Coding them onto
// 0–1 is a lossy but honest reading of a real judgement about a real utterance —
// it is not a number invented to fill a gap. Pronunciation is deliberately NOT
// derived from this: without a target phrase there is nothing to compare against,
// so conversation turns never claim a pronunciation signal.
const VERDICT_SCORE = { good: 0.92, close: 0.62, retry: 0.3 };
const VERDICT_BAND = { good: BAND.GOT, close: BAND.CLOSE, retry: BAND.MISS };

export function LiveConversation({
  lang, langCode, guide, micSupported, level = "beginner",
  persona = null, region = null, mission = null, scenario = "", learnerBrief = "",
  onTurn, onObjectivesMet, onEnd, onTranscript,
  emptyHint = "",
  // v77 — the report control writes into app state, so the conversation needs it.
  appState = null, setAppState = null, onNavigate = null,
}) {
  const [turns, setTurns] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [speakingNow, setSpeakingNow] = useState(false);
  const [typed, setTyped] = useState("");
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(null);

  const handle = useRef(null);
  const heardRef = useRef("");
  const scroller = useRef(null);
  const started = useRef(false);
  const ended = useRef(false);
  const voice = guideVoice(langCode);

  // Latency clock. `readyAt` is set the instant the guide stops talking; the
  // learner's turn is timed from there to their first audible word.
  const readyAt = useRef(null);
  const startedSpeakingAt = useRef(null);

  useEffect(() => () => { try { handle.current?.abort(); } catch {} cancelVoice(); }, []);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, pending]);

  // Hand the full exchange upward so a debrief can replay it.
  useEffect(() => { onTranscript?.(turns); }, [turns, onTranscript]);

  const send = useCallback(async ({ learnerText = "", opening = false, spoken = false, latencyMs = null }) => {
    setError(null);
    setPending(true);
    try {
      const history = turns.map((t) => ({
        role: t.role,
        text: t.role === "guide" ? t.native : t.text,
      }));
      const data = await coachTurn({
        langName: lang.name,
        guide: guide ? { name: guide.name, city: guide.city, craft: guide.craft } : null,
        level, history, learnerText, opening,
        persona, region, mission, scenario, learnerBrief,
        pressure: mission ? mission.pressure : persona?.pressure ?? 0,
      });
      if (data.refused) { setError(data.coaching); return; }

      // Attach corrections to the learner's own bubble — the sentence they're
      // being corrected on should be right next to the correction.
      setTurns((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "learner") {
            next[i] = { ...next[i], corrections: data.corrections, fluent: data.fluentVersion };
            break;
          }
        }
        return [...next, {
          role: "guide",
          native: data.reply.native, translit: data.reply.translit, en: data.reply.en,
          coaching: data.coaching, verdict: data.verdict, suggestion: data.suggestion,
        }];
      });

      if (learnerText) {
        onTurn?.({
          band: VERDICT_BAND[data.verdict] || BAND.CLOSE,
          score: VERDICT_SCORE[data.verdict] ?? 0.6,
          latencyMs,
          said: learnerText,
          spoken,
          topic: mission?.id || scenario || "conversation",
          errors: (data.corrections || []).map((c) => ({
            id: c.id, label: c.label, kind: c.kind, example: c.said,
          })),
        });
      }

      if (data.objectivesMet?.length) onObjectivesMet?.(data.objectivesMet);

      cancelVoice();
      setSpeakingNow(true);
      try {
        if (data.coaching && learnerText && voiceSupported()) await sayCoach(data.coaching);
        await speak(data.reply.native, lang.ttsCode, { ...voice, translit: data.reply.translit });
      } finally {
        setSpeakingNow(false);
        readyAt.current = Date.now();
      }

      if (data.missionOver && !ended.current) {
        ended.current = true;
        onEnd?.("finished");
      }
    } catch (e) {
      setError(e instanceof CoachError ? e.message : "The coach couldn't answer that one.");
    } finally {
      setPending(false);
    }
    // voice is derived from langCode; listing its fields keeps the dep array stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turns, lang.name, lang.ttsCode, langCode, guide, level, persona, region, mission,
      scenario, learnerBrief, onTurn, onObjectivesMet, onEnd]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    send({ opening: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(text, { spoken = false } = {}) {
    const clean = String(text || "").trim();
    if (!clean || pending) return;
    // Only spoken turns carry a latency: how long you take to type says nothing
    // about whether you were translating in your head.
    const latencyMs = spoken && readyAt.current && startedSpeakingAt.current
      ? Math.max(0, startedSpeakingAt.current - readyAt.current)
      : null;
    startedSpeakingAt.current = null;
    setTurns((prev) => [...prev, { role: "learner", text: clean, spoken }]);
    setTyped("");
    send({ learnerText: clean, spoken, latencyMs });
  }

  async function listen() {
    setMicError(null);
    heardRef.current = "";
    startedSpeakingAt.current = null;
    cancelVoice();
    await voiceIdle();
    setListening(true);
    handle.current = startListening({
      langCode, ttsCode: lang.ttsCode,
      onResult: ({ transcripts, isFinal }) => {
        // The first interim result is the first moment we know they're talking.
        if (!startedSpeakingAt.current) startedSpeakingAt.current = Date.now();
        heardRef.current = transcripts[0] || "";
        if (isFinal) { setListening(false); submit(heardRef.current, { spoken: true }); }
      },
      onError: (e) => { setListening(false); if (!e.benign || e.code === "no-speech") setMicError(e.message); },
      onEnd: () => { setListening(false); if (heardRef.current) submit(heardRef.current, { spoken: true }); },
    });
    if (!handle.current) setListening(false);
  }

  const last = turns[turns.length - 1];
  const suggestion = last?.role === "guide" ? last.suggestion : "";

  return (
    <>
      {/* v77 — the standing AI marker. It sits above the thread and never goes
          away, because the guide has a name, a home town and a first-person
          voice: without this, nothing on screen says "machine". A toast that
          fades would satisfy nobody; this is visible whenever the conversation
          is. */}
      <div className="ai-strip">
        <AiBadge />
        <span className="ai-strip-text">
          {guide?.name ? `${guide.name} is an AI character` : "You're talking to an AI"} — it can be wrong.
        </span>
        {onNavigate && (
          <button
            className="ai-strip-link"
            onClick={() => onNavigate("legal", { policy: "ai" })}
          >
            details
          </button>
        )}
      </div>

      <div className="coach-thread" ref={scroller}>
        {!turns.length && !pending && emptyHint && <div className="empty-note">{emptyHint}</div>}

        {turns.map((t, i) => (
          t.role === "guide" ? (
            <div className="coach-turn coach-turn-guide" key={i}>
              <GuideMark code={langCode} size={30} speaking={speakingNow && i === turns.length - 1} />
              <div style={{ minWidth: 0, flex: 1 }}>
                {t.coaching && <div className="coach-coaching">{t.coaching}</div>}
                <div className="coach-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>{t.native}</div>
                <div className="coach-tl">{t.translit}</div>
                <div className="coach-en">{t.en}</div>
                {setAppState && (
                  <ReportAi
                    text={[t.coaching, t.native, t.en].filter(Boolean).join(" | ")}
                    context={{ where: mission ? `mission:${mission.id}` : "speak", lang: langCode }}
                    appState={appState}
                    setAppState={setAppState}
                  />
                )}
              </div>
              <button className="xchg-play" onClick={() => speak(t.native, lang.ttsCode, { ...voice, translit: t.translit })} aria-label="Play again">
                <PlayIcon />
              </button>
            </div>
          ) : (
            <div className="coach-turn coach-turn-you" key={i}>
              <div className="coach-you-bubble">{t.text}</div>
              {t.corrections?.length > 0 && (
                <div className="corr-stack">
                  {t.corrections.map((c, n) => (
                    <FixChip key={n} c={c} lang={lang} langCode={langCode} micSupported={micSupported} />
                  ))}
                </div>
              )}
              {/* v83: this is the whole sentence, rewritten — which means that
                  while there are corrections still asking the learner to work
                  something out, printing it here hands them every answer at
                  once and there is no point asking. It collapses to a button
                  when there's an open ask, and shows outright when there isn't. */}
              {t.fluent?.native && (
                <FluentLine
                  fluent={t.fluent}
                  gated={(t.corrections || []).some((c) => c.ask)}
                  lang={lang}
                  langCode={langCode}
                  voice={voice}
                />
              )}
            </div>
          )
        ))}

        {pending && (
          <div className="coach-turn coach-turn-guide">
            <GuideMark code={langCode} size={30} />
            <div className="coach-typing" aria-label="thinking"><span /><span /><span /></div>
          </div>
        )}
      </div>

      {error && (
        <div className="coach-error">
          {error}
          <button className="quiet-link" onClick={() => send({ opening: turns.length === 0 })}>try again</button>
        </div>
      )}

      {suggestion && !pending && (
        <button className="coach-suggestion" onClick={() => submit(suggestion)}>
          Stuck? Say “{suggestion}”
        </button>
      )}

      <div className="coach-input">
        {micSupported && (
          <button
            className={`coach-mic${listening ? " coach-mic-live" : ""}`}
            onClick={listening ? () => { try { handle.current?.stop(); } catch {} } : listen}
            disabled={pending}
            aria-label={listening ? "Stop" : "Speak"}
          >
            <MicIcon />
          </button>
        )}
        <input
          className="type-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(typed); }}
          placeholder={listening ? "Listening…" : "Say it, or type it…"}
          disabled={pending}
          autoComplete="off" autoCorrect="off" spellCheck={false}
        />
        <button className="coach-send" onClick={() => submit(typed)} disabled={pending || !typed.trim()}>
          Send
        </button>
      </div>
      {micError && <div className="mic-error" style={{ textAlign: "left" }}>{micError}</div>}
    </>
  );
}

// ---------------------------------------------------------------------------
// A single correction, inline. The learner can say the fixed version straight
// back — a correction you only read is a correction you forget.
// ---------------------------------------------------------------------------
function FixChip({ c, lang, langCode, micSupported }) {
  const [state, setState] = useState("idle"); // idle | listening | done
  const [result, setResult] = useState(null);
  const [shown, setShown] = useState(false);  // they asked to just be told
  const handle = useRef(null);
  const heardRef = useRef("");

  useEffect(() => () => { try { handle.current?.abort(); } catch {} }, []);

  async function tryAgain() {
    heardRef.current = "";
    cancelVoice();
    await voiceIdle();
    setState("listening");
    const grade = async (transcripts) => {
      const r = await judge(transcripts, { native: c.better, translit: c.better });
      setResult(r);
      setState("done");
    };
    handle.current = startListening({
      langCode, ttsCode: lang.ttsCode,
      onResult: ({ transcripts, isFinal }) => {
        heardRef.current = transcripts[0] || "";
        if (isFinal) grade(transcripts);
      },
      onError: () => setState("idle"),
      onEnd: () => setState((s) => {
        if (s === "listening" && heardRef.current) { grade([heardRef.current]); return "listening"; }
        return s === "listening" ? "idle" : s;
      }),
    });
    if (!handle.current) setState("idle");
  }

  // v83 — ASK, THEN TELL.
  //
  // This card used to print `said → better` at the top, with the answer sitting
  // on screen, and then offer "Say it the right way" underneath. That is a
  // recast followed by a repeat-after-me: the learner reads the fix aloud and
  // retrieves nothing. Classroom research is consistent that recasts are the
  // feedback move learners act on least — there is nothing for them to do with
  // one — while prompts that make them produce the form themselves are what
  // actually shifts accuracy.
  //
  // So the answer is held back until they've had a go, or until they ask for it.
  // "Show me" is always one tap away and never scolds: the failure mode of
  // withheld feedback is someone stuck and quietly giving up, which is worse
  // than the failure mode it replaces.
  const revealed = shown || state === "done";

  return (
    <div className={`corr-card corr-${c.kind}`}>
      <div className="corr-row">
        <span className={`corr-said${revealed ? "" : " corr-said-open"}`}>{c.said}</span>
        {revealed && (
          <>
            <span className="corr-arrow" aria-hidden="true">→</span>
            <span className="corr-better" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>{c.better}</span>
            <button className="xchg-play" onClick={() => speak(c.better, lang.ttsCode, guideVoice(langCode))} aria-label="Hear the fix">
              <PlayIcon />
            </button>
          </>
        )}
      </div>

      {/* The ask is the whole point of the card before they've answered. Older
          replies from before this field existed fall back to `why`, which at
          least says what's going on. */}
      <div className={revealed ? "corr-why" : "corr-ask"}>
        {revealed ? c.why : (c.ask || c.why)}
      </div>

      {!revealed && (
        <div className="corr-actions">
          {micSupported && (
            <button className="corr-retry" onClick={tryAgain} disabled={state === "listening"}>
              {state === "listening" ? "Listening…" : "Have a go"}
            </button>
          )}
          <button className="corr-show" onClick={() => setShown(true)}>
            Show me
          </button>
        </div>
      )}

      {state === "done" && result && (
        <div className={`corr-verdict corr-verdict-${result.band}`}>
          {result.band === BAND.GOT ? "That's it — you had it." : result.band === BAND.CLOSE ? "Close enough — a native would follow that." : "Not quite, but it's in there."}
        </div>
      )}
      {revealed && state !== "done" && micSupported && (
        <button className="corr-retry" onClick={tryAgain} disabled={state === "listening"}>
          {state === "listening" ? "Listening…" : "Say it now"}
        </button>
      )}
    </div>
  );
}

function FluentLine({ fluent, gated, lang, langCode, voice }) {
  const [open, setOpen] = useState(!gated);
  if (!open) {
    return (
      <button className="fluent-peek" onClick={() => setOpen(true)}>
        Show the whole sentence the way a native would say it
      </button>
    );
  }
  return (
    <button
      className="fluent-line"
      onClick={() => speak(fluent.native, lang.ttsCode, { ...voice, translit: fluent.translit })}
      title="Hear it"
    >
      <span className="fluent-tag">a native would say</span>
      <span className="fluent-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>{fluent.native}</span>
      {fluent.translit && <span className="fluent-tl">{fluent.translit}</span>}
    </button>
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

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
