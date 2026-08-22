// =============================================================================
// MISSIONS (v73) — conversations you can win or lose.
//
// THE PROBLEM THIS ANSWERS, in the user's words: "it doesn't train the user —
// it just chats." A chat has no outcome, so there is nothing to come back for
// and no way to know whether any of it worked. A mission has a pass condition,
// a scene, someone who isn't necessarily on your side, and a debrief.
//
// THE SHAPE:
//
//     pick  →  brief  →  run  →  debrief
//
//   PICK      the missions, ordered for this learner by what they've already
//             done — plus "describe your own", which builds a real mission with
//             real objectives rather than a free-text chat with a label on it.
//   BRIEF     the stakes, who you're up against, which variety of the language,
//             and what the app already knows about your level. You can change
//             the persona: practising a refund argument against someone nice
//             teaches you nothing.
//   RUN       the conversation, with the objectives ticking off live and
//             corrections landing on your own sentences as you go.
//   DEBRIEF   REPLAY & FIX. Every line you said, what a native would have said
//             instead, and a microphone to say it again properly. This is where
//             the learning actually consolidates — and it's the honest version
//             of the "AI twin" idea: your own sentences upgraded, not a
//             synthesised clone of your voice, which would need a voice API this
//             app doesn't have.
// =============================================================================

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { LANGUAGES } from "../data/registry.js";
import { getCharacter, guideVoice } from "../data/characters.js";
import { GuideMark } from "../ui/GuideMark.jsx";
import { LiveConversation } from "../ui/LiveConversation.jsx";
import { MISSIONS, MISSION_CATEGORIES, getMission, recommendMissions, passThreshold } from "../data/missions.js";
import { PERSONAS, getPersona, regionsFor, getRegion } from "../data/personas.js";
import { recordTurn, recordMission, summariseForPrompt, difficultyFor, DIFFICULTY_LABEL } from "../engine/profile.js";
import { probeCoach, levelFor, CoachError } from "../ai/coach.js";
import { buildScenario } from "../ai/scenario.js";
import { NeedsConnection, useOffline } from "../ui/Offline.jsx";
import { AiGate, aiAccepted } from "../ui/AiDisclosure.jsx";
import { isRecognitionSupported, startListening, judge, BAND } from "../audio/speech.js";
import { speak } from "../audio/tts.js";
import { cancelVoice, idle as voiceIdle } from "../audio/voice.js";

export function Missions({ pack, appState, setAppState, params, onNavigate, profile, mutateProfile }) {
  const offline = useOffline();
  const lang = LANGUAGES[pack.code];
  const guide = getCharacter(pack.code);
  const micSupported = isRecognitionSupported();

  const [phase, setPhase] = useState("pick"); // pick | brief | run | debrief
  // v77 — set when something AI-backed was tapped before consent was given.
  // Holds the phase to return to, so declining doesn't strand anyone.
  const [gateBackTo, setGateBackTo] = useState(null);
  const [mission, setMission] = useState(null);
  const [personaId, setPersonaId] = useState(null);
  const [regionId, setRegionId] = useState(profile?.region || null);
  const [coachReady, setCoachReady] = useState(null);

  const [transcript, setTranscript] = useState([]);
  const [met, setMet] = useState([]);
  // Read inside the objectives callback, which must stay identity-stable — a new
  // function every render would restart the conversation component's effects.
  const missionRef = useRef(null);
  missionRef.current = mission;

  useEffect(() => {
    let cancelled = false;
    probeCoach().then((p) => { if (!cancelled) setCoachReady(!!p.configured); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => cancelVoice(), []);

  // Deep link from Home: /missions with a mission id.
  useEffect(() => {
    if (params?.missionId) {
      const m = getMission(params.missionId);
      if (m) { setMission(m); setPersonaId(m.persona); setPhase("brief"); }
    }
  }, [params?.missionId]);

  const level = levelFor(appState?.lessonsCompleted?.[pack.code] || 0, 0);
  const learnerBrief = useMemo(() => summariseForPrompt(profile), [profile]);
  const persona = getPersona(personaId || mission?.persona || "friendly");
  const region = getRegion(pack.code, regionId);

  function begin(m) {
    setMission(m);
    setPersonaId(m.persona);
    setPhase("brief");
  }

  function start() {
    setTranscript([]);
    setMet([]);
    setPhase("run");
  }

  const onTurn = useCallback((rec) => {
    mutateProfile((p) => recordTurn(p, rec));
  }, [mutateProfile]);

  const onObjectivesMet = useCallback((ids) => {
    // The model sends the cumulative list; union rather than replace, so a turn
    // that forgets to repeat an earlier objective can't un-earn it.
    //
    // Filtered against THIS mission's ids as well. The server already discards
    // ids it doesn't recognise, but the pass mark is counted here from
    // met.length — so an id that slipped through would inflate the count and
    // hand out a pass nobody earned. Two cheap checks beat one silent false pass.
    setMet((prev) => {
      const valid = new Set((missionRef.current?.objectives || []).map((o) => o.id));
      return [...new Set([...prev, ...ids.filter((id) => valid.has(id))])];
    });
  }, []);

  const onTranscriptChange = useCallback((turns) => setTranscript(turns), []);

  const finish = useCallback(() => {
    setPhase("debrief");
  }, []);

  // Banking the result happens on entering the debrief, once.
  const banked = useRef(false);
  useEffect(() => {
    if (phase !== "debrief" || banked.current || !mission) return;
    banked.current = true;
    const need = passThreshold(mission);
    const passed = met.length >= need;
    const spoke = transcript.filter((t) => t.role === "learner").length;
    mutateProfile((p) => recordMission(p, mission.id, { passed, score: met.length / mission.objectives.length }));
    if (spoke > 0) {
      const xp = spoke * 4 + (passed ? 20 : 0);
      setAppState((s) => ({
        ...s,
        totalXp: (s.totalXp || 0) + xp,
        sessions: [
          ...(s.sessions || []).slice(-199),
          { ts: Date.now(), language: pack.code, xp, accuracy: met.length / mission.objectives.length, kind: "mission" },
        ],
      }));
    }
  }, [phase, mission, met, transcript, mutateProfile, setAppState, pack.code]);

  function backToPick() {
    banked.current = false;
    setMission(null);
    setTranscript([]);
    setMet([]);
    setGateBackTo(null);
    setPhase("pick");
  }

  // Consent is the single condition: accepting inside the gate flips this and
  // the gate disappears on its own, leaving whatever asked for it on screen.
  const showGate = !aiAccepted(appState) && (gateBackTo !== null || phase === "run");

  return (
    <div className="speak-screen">
      <header className="speak-bar">
        <button
          onClick={() => (phase === "pick" ? onNavigate("home") : backToPick())}
          className="speak-close"
          aria-label={phase === "pick" ? "Close" : "Back"}
        >
          {phase === "pick" ? "✕" : "←"}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Missions</div>
          <div className="speak-title">
            {phase === "pick" ? `Things you'll be able to do in ${lang.name}` : mission?.title || "Mission"}
          </div>
        </div>
        {guide && <GuideMark code={pack.code} size={34} />}
      </header>

      {/* v77 — one gate covers both doors into the model: running a scene, and
          describing your own situation for one to be built. The scenario builder
          sends the learner's own words off the device, so it can't sit behind
          the same consent as everything else "later". */}
      {showGate && (
        <AiGate
          appState={appState}
          setAppState={setAppState}
          guideName={guide?.name}
          langName={lang.name}
          onDecline={() => { setGateBackTo(null); setPhase(gateBackTo || "pick"); }}
          onNavigate={onNavigate}
        />
      )}

      {/* v81: missions are live conversations with a language model — the one
          part of this app that genuinely cannot work without a connection. Said
          before the picker rather than after a request that was never going to
          land. */}
      {offline && (
        <div className="speak-body"><NeedsConnection what="Missions" /></div>
      )}

      {phase === "pick" && !showGate && !offline && (
        <MissionPicker
          profile={profile}
          goalId={appState?.learningGoal?.[pack.code]}
          coachReady={coachReady}
          lang={lang}
          level={level}
          onPick={begin}
          aiOk={aiAccepted(appState)}
          onNeedAi={() => setGateBackTo("pick")}
        />
      )}

      {phase === "brief" && mission && (
        <MissionBrief
          mission={mission}
          lang={lang}
          langCode={pack.code}
          guide={guide}
          profile={profile}
          persona={persona}
          personaId={personaId}
          onPersona={setPersonaId}
          regionId={regionId}
          onRegion={(id) => { setRegionId(id); mutateProfile((p) => ({ ...p, region: id })); }}
          coachReady={coachReady}
          onStart={start}
        />
      )}

      {phase === "run" && mission && !showGate && (
        <div className="speak-body speak-body-talk">
          <ObjectiveBar mission={mission} met={met} />
          <LiveConversation
            lang={lang}
            langCode={pack.code}
            guide={guide}
            micSupported={micSupported}
            level={level}
            persona={persona}
            region={region}
            mission={mission}
            learnerBrief={learnerBrief}
            onTurn={onTurn}
            onObjectivesMet={onObjectivesMet}
            onEnd={finish}
            onTranscript={onTranscriptChange}
            emptyHint={mission.opener}
            appState={appState}
            setAppState={setAppState}
            onNavigate={onNavigate}
          />
          <button className="quiet-link" style={{ marginTop: 10 }} onClick={finish}>
            End the scene and see how it went
          </button>
        </div>
      )}

      {phase === "debrief" && mission && (
        <MissionDebrief
          mission={mission}
          met={met}
          transcript={transcript}
          lang={lang}
          langCode={pack.code}
          guide={guide}
          micSupported={micSupported}
          onRetry={() => { banked.current = false; setMet([]); setTranscript([]); setPhase("run"); }}
          onPick={backToPick}
          onFluency={() => onNavigate("fluency")}
        />
      )}
    </div>
  );
}

// =============================================================================
// PICK
// =============================================================================
function MissionPicker({ profile, goalId, coachReady, lang, level, onPick, aiOk, onNeedAi }) {
  const [filter, setFilter] = useState("all");
  const ordered = useMemo(() => recommendMissions(profile, goalId), [profile, goalId]);
  const shown = filter === "all" ? ordered : ordered.filter((m) => m.category === filter);
  const history = profile?.missions || {};

  return (
    <div className="speak-body">
      {coachReady === false && (
        <div className="result-locked" style={{ marginBottom: 14 }}>
          <b>Missions need the AI coach.</b> They're live conversations with someone
          who plays the other side, so they need an Anthropic API key set on the
          deployment (<code>ANTHROPIC_API_KEY</code>); see <code>docs/ai-coach.md</code>.
          Everything else in the app works without it.
        </div>
      )}

      <p className="intro-sub" style={{ margin: "0 0 14px" }}>
        Not lessons — situations. Each one has things you have to actually get done
        in {lang.name}, and someone on the other side who won't necessarily help you.
      </p>

      <div className="chip-row">
        <button className={`chip${filter === "all" ? " chip-on" : ""}`} onClick={() => setFilter("all")}>All</button>
        {MISSION_CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip${filter === c.id ? " chip-on" : ""}`}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <CustomScenario lang={lang} level={level} coachReady={coachReady} onBuilt={onPick} aiOk={aiOk} onNeedAi={onNeedAi} />

      <div className="mission-list">
        {shown.map((m) => {
          const h = history[m.id];
          return (
            <button key={m.id} className="mission-card" onClick={() => onPick(m)} disabled={coachReady === false}>
              <div className="mission-card-top">
                <span className="mission-title">{m.title}</span>
                {h?.passed
                  ? <span className="mission-badge mission-badge-done">passed</span>
                  : h?.attempts
                    ? <span className="mission-badge">in progress</span>
                    : null}
              </div>
              <div className="mission-stake">{m.stake}</div>
              <div className="mission-meta">
                <span>{m.objectives.length} objectives</span>
                <span>·</span>
                <span>~{m.minutes} min</span>
                <span>·</span>
                <span className={`pressure pressure-${m.pressure}`}>{PRESSURE_WORD[m.pressure]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PRESSURE_WORD = { 0: "relaxed", 1: "steady", 2: "brisk", 3: "under pressure" };

// ---------------------------------------------------------------------------
// The scenario generator. Their situation, not ours.
// ---------------------------------------------------------------------------
function CustomScenario({ lang, level, coachReady, onBuilt, aiOk = true, onNeedAi }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function build() {
    setBusy(true);
    setError(null);
    try {
      const mission = await buildScenario({ description: text.trim(), langName: lang.name, level });
      onBuilt(mission);
    } catch (e) {
      setError(e instanceof CoachError ? e.message : "Couldn't build that one.");
    } finally {
      setBusy(false);
    }
  }

  if (coachReady === false) return null;

  if (!open) {
    return (
      <button className="mission-card mission-card-custom" onClick={() => (aiOk ? setOpen(true) : onNeedAi?.())}>
        <div className="mission-card-top">
          <span className="mission-title">Describe your own situation</span>
        </div>
        <div className="mission-stake">
          Whatever you're actually dreading — a specific phone call, a specific
          person's family. It gets built into a mission with real objectives.
        </div>
      </button>
    );
  }

  return (
    <div className="custom-scenario">
      <div className="eyebrow">What do you need to be able to do?</div>
      <textarea
        className="scenario-input"
        rows={3}
        value={text}
        autoFocus
        maxLength={300}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. I have to ring the letting agent and explain the boiler is broken, and they always talk too fast"
      />
      <div className="scenario-actions">
        <button className="btn-hero btn-hero-sm" onClick={build} disabled={busy || text.trim().length < 8}>
          {busy ? "Building the scene…" : "Build it"}
        </button>
        <button className="btn-quiet" onClick={() => { setOpen(false); setError(null); }}>Cancel</button>
      </div>
      {error && <div className="mic-error" style={{ textAlign: "left" }}>{error}</div>}
    </div>
  );
}

// =============================================================================
// BRIEF — stakes, opponent, variety, level. Then you go in.
// =============================================================================
function MissionBrief({
  mission, lang, langCode, guide, profile, persona, personaId, onPersona,
  regionId, onRegion, coachReady, onStart,
}) {
  const regions = regionsFor(langCode);
  const difficulty = difficultyFor(profile);
  const attempts = profile?.missions?.[mission.id]?.attempts || 0;

  return (
    <div className="speak-body">
      <div className="brief-card">
        <div className="eyebrow">{mission.custom ? "Your scenario" : "The situation"}</div>
        <h2 className="intro-title">{mission.title}</h2>
        <p className="intro-sub">{mission.stake}</p>

        <div className="brief-scene">{mission.setting}</div>

        <div className="eyebrow" style={{ marginTop: 18 }}>You'll have done it when you</div>
        <ul className="brief-objectives">
          {mission.objectives.map((o) => <li key={o.id}>{o.label}</li>)}
        </ul>

        <div className="brief-fail">
          <b>It ends badly if:</b> {mission.failIf.join(" · ")}
        </div>

        <div className="eyebrow" style={{ marginTop: 20 }}>Who you're up against</div>
        <div className="chip-row">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              className={`chip${(personaId || mission.persona) === p.id ? " chip-on" : ""}`}
              onClick={() => onPersona(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="brief-note">{persona.blurb}.</div>

        {regions.length > 0 && (
          <>
            <div className="eyebrow" style={{ marginTop: 18 }}>Which {lang.name}</div>
            <div className="chip-row">
              {regions.map((r) => (
                <button
                  key={r.id}
                  className={`chip${regionId === r.id ? " chip-on" : ""}`}
                  onClick={() => onRegion(regionId === r.id ? null : r.id)}
                >
                  {r.name}
                </button>
              ))}
            </div>
            <div className="brief-note">
              {regionId
                ? "They'll stay in that variety throughout."
                : "No preference — you'll get the standard variety."}
            </div>
          </>
        )}

        <div className="brief-level">
          <b>Pitched at your level:</b> {DIFFICULTY_LABEL[difficulty]}
          <span className="brief-level-src">
            {(profile?.turns?.length || 0) >= 6
              ? ` Based on your last ${Math.min(20, profile.turns.length)} graded attempts.`
              : " We'll adjust this once you've spoken a bit more."}
          </span>
        </div>

        {attempts > 0 && (
          <div className="brief-note" style={{ marginTop: 10 }}>
            You've been in this one {attempts === 1 ? "once" : `${attempts} times`} before.
          </div>
        )}

        <button className="btn-hero" onClick={onStart} disabled={coachReady === false}>
          Start — {guide?.name || "your guide"} plays the other side
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// OBJECTIVES, ticking off live. The whole reason a mission isn't just a chat.
// =============================================================================
function ObjectiveBar({ mission, met }) {
  const need = passThreshold(mission);
  return (
    <div className="obj-bar">
      <div className="obj-bar-head">
        <span className="eyebrow">Objectives</span>
        <span className="obj-count">{met.length}/{mission.objectives.length} · {need} to pass</span>
      </div>
      <div className="obj-list">
        {mission.objectives.map((o) => {
          const done = met.includes(o.id);
          return (
            <div key={o.id} className={`obj-item${done ? " obj-done" : ""}`}>
              <span className="obj-tick" aria-hidden="true">{done ? "✓" : ""}</span>
              <span>{o.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// DEBRIEF — the verdict, then REPLAY & FIX.
// =============================================================================
function MissionDebrief({ mission, met, transcript, lang, langCode, guide, micSupported, onRetry, onPick, onFluency }) {
  const need = passThreshold(mission);
  const passed = met.length >= need;
  const said = transcript.filter((t) => t.role === "learner");
  const fixable = said.filter((t) => t.corrections?.length || t.fluent?.native);

  return (
    <div className="speak-body">
      <div className={`result-card debrief-${passed ? "pass" : "fail"}`}>
        {guide && <GuideMark code={langCode} size={54} style={{ margin: "0 auto 14px" }} />}
        <h2 className="result-title">
          {!said.length ? "You didn't get going"
            : passed ? "You got it done"
            : "Not this time"}
        </h2>
        <p className="result-sub">
          {!said.length
            ? "Nothing was said, so there's nothing to score. Go back in and say anything at all — a wrong sentence beats a silent one."
            : passed
              ? `${met.length} of ${mission.objectives.length} objectives, in ${lang.name}, without switching out. That's the thing you came here to be able to do.`
              : `${met.length} of ${mission.objectives.length} objectives — you needed ${need}. That's a normal first run at this; the fixes below are where it turns around.`}
        </p>

        <div className="obj-list obj-list-result">
          {mission.objectives.map((o) => {
            const done = met.includes(o.id);
            return (
              <div key={o.id} className={`obj-item${done ? " obj-done" : " obj-missed"}`}>
                <span className="obj-tick" aria-hidden="true">{done ? "✓" : "○"}</span>
                <span>{o.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {fixable.length > 0 && (
        <div className="replay">
          <div className="eyebrow">Replay &amp; fix</div>
          <p className="replay-sub">
            Every line you said, and how it would have come out of a native's mouth.
            Say them again here — this is the part that sticks.
          </p>
          {fixable.map((t, i) => (
            <ReplayRow key={i} turn={t} lang={lang} langCode={langCode} micSupported={micSupported} />
          ))}
        </div>
      )}

      {said.length > 0 && !fixable.length && (
        <div className="empty-note">
          Nothing came back needing a fix — everything you said would have landed as-is.
        </div>
      )}

      <div className="result-actions">
        <button className="btn-hero btn-hero-sm" onClick={onRetry}>Run it again</button>
        <button className="btn-quiet" onClick={onFluency}>See your fluency</button>
        <button className="btn-quiet" onClick={onPick}>Other missions</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// One line of the replay: what you said, what it should have been, and a mic.
// ---------------------------------------------------------------------------
function ReplayRow({ turn, lang, langCode, micSupported }) {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const handle = useRef(null);
  const heardRef = useRef("");
  const target = turn.fluent?.native || turn.corrections?.[0]?.better || "";

  useEffect(() => () => { try { handle.current?.abort(); } catch {} }, []);

  async function retry() {
    if (!target) return;
    heardRef.current = "";
    cancelVoice();
    await voiceIdle();
    setState("listening");
    const grade = async (transcripts) => {
      const r = await judge(transcripts, { native: target, translit: turn.fluent?.translit || target });
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
      onEnd: () => {
        if (heardRef.current) grade([heardRef.current]);
        else setState((s) => (s === "listening" ? "idle" : s));
      },
    });
    if (!handle.current) setState("idle");
  }

  return (
    <div className="replay-row">
      <div className="replay-said">“{turn.text}”</div>

      {turn.corrections?.map((c, i) => (
        <div key={i} className="replay-fix">
          <span className="corr-said">{c.said}</span>
          <span className="corr-arrow" aria-hidden="true">→</span>
          <span className="corr-better" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>{c.better}</span>
          <div className="corr-why">{c.why}</div>
        </div>
      ))}

      {turn.fluent?.native && (
        <div className="replay-fluent">
          <div className="fluent-tag">a native would say</div>
          <div className="fluent-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>{turn.fluent.native}</div>
          {turn.fluent.translit && <div className="fluent-tl">{turn.fluent.translit}</div>}
          {turn.fluent.note && <div className="corr-why">{turn.fluent.note}</div>}
        </div>
      )}

      <div className="replay-actions">
        {target && (
          <button
            className="xchg-play"
            onClick={() => speak(target, lang.ttsCode, { ...guideVoice(langCode), translit: turn.fluent?.translit })}
            aria-label="Hear it"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            </svg>
          </button>
        )}
        {micSupported && target && state !== "done" && (
          <button className="corr-retry" onClick={retry} disabled={state === "listening"}>
            {state === "listening" ? "Listening…" : "Say it properly"}
          </button>
        )}
        {state === "done" && result && (
          <span className={`corr-verdict corr-verdict-${result.band}`}>
            {result.band === BAND.GOT ? "That's it." : result.band === BAND.CLOSE ? "Close — that would land." : "Nearly. One more go."}
          </span>
        )}
      </div>
    </div>
  );
}

export { MISSIONS };
