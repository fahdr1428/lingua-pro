// =============================================================================
// GUIDED PARTS — the pieces of a structured lesson that ordinary lessons don't
// have: where you are in the seven phases, what the lesson will let you do,
// the conversation a module task builds towards, and the per-objective
// feedback at the end. Loaded with the first structured lesson, not before.
//
// Every native line goes through NativeLine, which sets dir, lang and the
// script's typeface (registry.scriptFont) and adds romanisation for scripts
// the learner can't be assumed to read — so the same component is right for
// Urdu Nastaliq, Arabic Naskh, Devanagari, Hangul, Chinese and Yoruba alike.
// =============================================================================

import React from "react";
import { Button } from "../ui/primitives.jsx";
import { LANGUAGES, isNonLatinScript, scriptFont } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";
import { PHASES } from "../engine/guided.js";
import "./guided.css";

export const OBJECTIVE_LABEL = {
  recognise: "Recognise",
  recall: "From memory",
  construct: "Build",
  understand: "Grammar",
  use: "Conversation",
};

/** One line of the language: script, romanisation, meaning. */
export function NativeLine({ code, line, who = null, size = "md" }) {
  const lang = LANGUAGES[code] || {};
  if (!line?.text) return null;
  const voice = hasVoiceFor(lang.ttsCode);
  return (
    <div className={`g-line g-line-${size}`}>
      {who && <div className="g-line-who">{who}</div>}
      <div className="g-line-body">
        <span className="g-native" dir={lang.rtl ? "rtl" : "ltr"} lang={code} style={{ fontFamily: scriptFont(code) }}>
          {line.text}
        </span>
        {isNonLatinScript(code) && line.translit && <span className="g-translit">{line.translit}</span>}
        {line.en && <span className="g-gloss">{line.en}</span>}
      </div>
      {voice && (
        <button
          type="button"
          className="g-hear"
          aria-label={`Hear: ${line.en || line.translit || "this line"}`}
          onClick={() => speak(line.text, lang.ttsCode, { code, translit: line.translit })}
        >
          🔊
        </button>
      )}
    </div>
  );
}

/** Where the learner is among the lesson's phases. */
export function PhaseStrip({ phases = [], current }) {
  const at = Math.max(0, phases.indexOf(current));
  const meta = PHASES.find((p) => p.id === current) || PHASES[0];
  return (
    <div className="g-phases" data-testid="guided-phase" data-phase={current}>
      <ol className="g-phase-steps" aria-hidden="true">
        {phases.map((p, i) => (
          <li key={p} className={i < at ? "g-done" : i === at ? "g-now" : ""} />
        ))}
      </ol>
      <div className="g-phase-label">
        <span className="g-phase-n">Step {at + 1} of {phases.length}</span>{" "}
        <strong>{meta.label}</strong>
        <span className="g-phase-blurb"> · {meta.blurb}</span>
      </div>
    </div>
  );
}

/** Phase 2 — what this lesson is for. */
export function ObjectivesCard({ ex, code, onContinue }) {
  return (
    <div className="g-card" data-testid="guided-objectives">
      <div className="g-eyebrow">
        {ex.module.emoji ? `${ex.module.emoji} ` : ""}Module {ex.module.index + 1} · {ex.module.title}
      </div>
      <h2 className="g-title">{ex.lesson.title}</h2>
      <p className="g-lead">By the end of this lesson you'll be able to:</p>
      <ul className="g-objectives">
        {ex.objectives.map((o) => (
          <li key={o.id}>
            <span className={`g-tag g-tag-${o.type}`}>{OBJECTIVE_LABEL[o.type] || o.type}</span>
            <span className="g-objective-text">{o.text}</span>
          </li>
        ))}
      </ul>
      {ex.situation && (
        <div className="g-situation">
          <div className="g-eyebrow">The conversation this module leads to</div>
          <NativeLine code={code} line={ex.situation.they} who="They" size="sm" />
          <NativeLine code={code} line={ex.situation.you} who="You" size="sm" />
        </div>
      )}
      <p className="g-note">
        Built from this course's own words and examples. Not yet reviewed by a teacher.
      </p>
      <Button onClick={onContinue} data-testid="guided-start">Start</Button>
    </div>
  );
}

/** Phase 3 of a module task — the exchange, taught before it's practised. */
export function ExchangeCard({ ex, code, onContinue }) {
  const e = ex.exchange;
  return (
    <div className="g-card" data-testid="guided-exchange">
      <div className="g-eyebrow">Your goal</div>
      <h2 className="g-title">{e.outcome}</h2>
      <NativeLine code={code} line={e.they} who="They say" />
      <NativeLine code={code} line={e.you} who="You answer" />
      {ex.words?.length > 0 && (
        <>
          <div className="g-eyebrow g-space">Words in this exchange</div>
          <ul className="g-words">
            {ex.words.map((w) => (
              <li key={w.id}>
                <span dir={LANGUAGES[code]?.rtl ? "rtl" : "ltr"} lang={code} style={{ fontFamily: scriptFont(code) }}>{w.lemma}</span>
                {isNonLatinScript(code) && w.translit && <span className="g-translit"> {w.translit}</span>}
                <span className="g-gloss"> — {w.translation}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="g-lead">Next you'll choose the right reply, then build it yourself.</p>
      <Button onClick={onContinue} data-testid="guided-exchange-go">I'm ready</Button>
    </div>
  );
}

/** "They say …" above a conversation exercise. */
export function ContextBubble({ context, code }) {
  if (!context?.they) return null;
  return (
    <div className="g-context" data-testid="guided-context">
      <NativeLine code={code} line={context.they} who="They say" size="sm" />
      {context.goal && <div className="g-context-goal">Goal: {context.goal}</div>}
    </div>
  );
}

const STATUS = {
  met: { label: "Met", cls: "g-met" },
  "not-yet": { label: "Not yet", cls: "g-notyet" },
  explained: { label: "Explained", cls: "g-explained" },
  none: { label: "Not tested here", cls: "g-none" },
};

/** Phase 7 — what the answers say about each objective. */
export function ObjectiveResults({ guided, results = {}, revise = [], pack, next = null, onNext }) {
  const byId = new Map((pack?.vocab || []).map((v) => [v.id, v]));
  const words = revise.map((id) => byId.get(id)).filter(Boolean);
  return (
    <div className="g-card g-results" data-testid="guided-results">
      <div className="g-eyebrow">Feedback · {guided.title}</div>
      <ul className="g-objectives">
        {guided.objectives.map((o) => {
          const r = results[o.id] || { status: "none" };
          const s = STATUS[r.status] || STATUS.none;
          return (
            <li key={o.id} data-status={r.status}>
              <span className={`g-status ${s.cls}`}>{s.label}</span>
              <span className="g-objective-text">
                {o.text}
                {r.of > 0 && <span className="g-score"> · {r.right}/{r.of}</span>}
              </span>
            </li>
          );
        })}
      </ul>
      {words.length > 0 && (
        <div className="g-revise">
          <div className="g-eyebrow">Coming back for review</div>
          <div className="g-revise-list">
            {words.map((w) => (
              <span key={w.id} className="g-chip">
                <span lang={pack.code} style={{ fontFamily: scriptFont(pack.code) }}>{w.lemma}</span>
                <span className="g-gloss"> {w.translation}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {next && onNext && (
        <Button variant="secondary" onClick={onNext} data-testid="guided-next">
          Next lesson: {next.title}
        </Button>
      )}
    </div>
  );
}
