// =============================================================================
// FLUENCY (v73) — the outcome number, and everything behind it.
//
// A score nobody believes is worse than no score, so this screen is built around
// showing its own working. Every dimension states what it's measured from and
// how many data points it has. A dimension with too little evidence shows "—"
// and what to do to unlock it, rather than a comforting 50.
//
// It is also, deliberately, the retention loop. Not a streak counter that
// punishes you for having a life — a number that moves when you speak and
// visibly softens when you don't, because that's what fluency actually does.
// =============================================================================

import React, { useEffect, useMemo, useRef } from "react";
import { LANGUAGES } from "../data/registry.js";
import { getCharacter } from "../data/characters.js";
import { GuideMark } from "../ui/GuideMark.jsx";
import { computeFluency, fluencyDelta, fluencyBlurb, DIMENSIONS } from "../engine/fluency.js";
import {
  recordFluency, activeErrors, weakTopics, strongTopics,
  difficultyFor, DIFFICULTY_LABEL, profileMaturity,
} from "../engine/profile.js";
import { MISSIONS } from "../data/missions.js";

export function Fluency({ pack, onNavigate, profile, mutateProfile }) {
  const lang = LANGUAGES[pack.code];
  const guide = getCharacter(pack.code);

  const f = useMemo(() => computeFluency(profile), [profile]);
  const delta = useMemo(() => fluencyDelta(profile, f), [profile, f]);

  // Snapshot at most once a day — the history is what makes the delta honest,
  // and writing one per render would make "up 3 this week" meaningless.
  const snapped = useRef(false);
  useEffect(() => {
    if (snapped.current || f.overall === null) return;
    const last = (profile?.fluency || [])[profile.fluency.length - 1];
    if (last && Date.now() - last.ts < 20 * 3600 * 1000) return;
    snapped.current = true;
    mutateProfile((p) => recordFluency(p, {
      overall: f.overall, accuracy: f.accuracy, responsiveness: f.responsiveness,
      range: f.range, pronunciation: f.pronunciation,
    }));
  }, [f, profile, mutateProfile]);

  const errors = activeErrors(profile, 3);
  const weak = weakTopics(profile, 3);
  const strong = strongTopics(profile, 3);
  const maturity = profileMaturity(profile);
  const missionsPassed = Object.values(profile?.missions || {}).filter((m) => m.passed).length;

  return (
    <div className="speak-screen">
      <header className="speak-bar">
        <button onClick={() => onNavigate("home")} className="speak-close" aria-label="Close">✕</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Fluency</div>
          <div className="speak-title">Where you actually are in {lang.name}</div>
        </div>
        {guide && <GuideMark code={pack.code} size={34} />}
      </header>

      <div className="speak-body">
        {/* ---------------------------------------------------------------- */}
        <div className="fluency-hero">
          <div className="fluency-dial">
            <Dial value={f.overall} />
          </div>
          <div className="fluency-hero-text">
            <div className="fluency-number">
              {f.overall === null ? "—" : f.overall}
              {f.overall !== null && <span className="fluency-of">/100</span>}
            </div>
            {delta && delta.delta !== 0 && (
              <div className={`fluency-delta ${delta.delta > 0 ? "up" : "down"}`}>
                {delta.delta > 0 ? "↑" : "↓"} {Math.abs(delta.delta)} in {delta.days} day{delta.days === 1 ? "" : "s"}
              </div>
            )}
            <p className="fluency-blurb">{fluencyBlurb(f)}</p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        <div className="fluency-dims">
          {DIMENSIONS.map((d) => (
            <div className="dim" key={d.key}>
              <div className="dim-head">
                <span className="dim-label">{d.label}</span>
                <span className={`dim-value${f[d.key] === null ? " dim-value-none" : ""}`}>
                  {f[d.key] === null ? "—" : f[d.key]}
                </span>
              </div>
              <div className="dim-track">
                <div className="dim-fill" style={{ width: `${f[d.key] ?? 0}%` }} />
              </div>
              <div className="dim-blurb">
                {f[d.key] === null ? <em>{d.unlock} to unlock this.</em> : d.blurb}
              </div>
            </div>
          ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        <div className="evidence">
          <div className="eyebrow">What this is measured from</div>
          <ul className="evidence-list">
            <li><b>{f.evidence.turns}</b> graded things you've said</li>
            <li><b>{f.evidence.timed}</b> of them timed from the mic</li>
            <li><b>{f.evidence.distinctWords}</b> distinct words produced out loud</li>
            <li><b>{f.evidence.spoken}</b> attempts scored against a target phrase</li>
          </ul>
          {f.provisional && f.overall !== null && (
            <div className="evidence-note">
              This is still an early reading. It'll move a lot per session until
              there's more behind it — that's the number being honest, not broken.
            </div>
          )}
          {f.overall === null && (
            <div className="evidence-note">
              Nothing is scored yet, so there's no number to show. It starts the
              moment you say something out loud.
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {(errors.length > 0 || weak.length > 0 || strong.length > 0) && (
          <div className="knows">
            <div className="eyebrow">What the coach knows about you</div>
            {maturity === "new" && (
              <div className="brief-note" style={{ marginBottom: 10 }}>
                Still forming — it gets sharper the more you talk.
              </div>
            )}
            {errors.length > 0 && (
              <div className="knows-block">
                <div className="knows-head">Keeps coming up</div>
                {errors.map((e) => (
                  <div className="knows-row" key={e.id}>
                    <span>{e.label}</span>
                    <span className="knows-count">{e.count}×</span>
                  </div>
                ))}
                <div className="knows-foot">
                  Your guide watches for these in conversation, and corrects at most one per turn.
                </div>
              </div>
            )}
            {weak.length > 0 && (
              <div className="knows-block">
                <div className="knows-head">Least confident</div>
                {weak.map((w) => (
                  <div className="knows-row" key={w.topic}>
                    <span>{w.topic}</span>
                    <span className="knows-count">{Math.round(w.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
            {strong.length > 0 && (
              <div className="knows-block">
                <div className="knows-head">Solid</div>
                {strong.map((s) => (
                  <div className="knows-row" key={s.topic}>
                    <span>{s.topic}</span>
                    <span className="knows-count">{Math.round(s.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        <div className="knows">
          <div className="eyebrow">Missions</div>
          <div className="knows-row">
            <span>Passed</span>
            <span className="knows-count">{missionsPassed}/{MISSIONS.length}</span>
          </div>
          <div className="knows-foot">
            Conversations you can now get through. That's the part you can point
            at when someone asks whether you speak {lang.name}.
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        <div className="next-lever">
          <div className="eyebrow">The fastest thing you could do next</div>
          <p className="next-lever-text">{nextLever(f, profile)}</p>
          <div className="result-actions">
            <button className="btn-hero btn-hero-sm" onClick={() => onNavigate("missions")}>Run a mission</button>
            <button className="btn-quiet" onClick={() => onNavigate("speak")}>Speaking drills</button>
          </div>
          <div className="brief-note" style={{ marginTop: 12 }}>
            Currently pitching conversations at: {DIFFICULTY_LABEL[difficultyFor(profile)]}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One concrete recommendation, chosen from the weakest dimension that has
 * evidence. No evidence at all → the thing that unlocks the most.
 */
function nextLever(f, profile) {
  if (f.overall === null) {
    return "Do one speaking round. Six prompts, about three minutes, and every part of this page has something in it afterwards.";
  }
  if (f.missing.includes("pronunciation")) {
    return "Use the microphone rather than typing. Pronunciation is the one dimension that can't be inferred from typed answers, and it's a quarter of the score.";
  }
  if (f.missing.includes("responsiveness")) {
    return "Answer a few prompts out loud without pausing to compose. Responsiveness only counts spoken turns, and hesitation is the clearest fluency tell there is.";
  }
  const scored = [
    ["responsiveness", f.responsiveness, "You're accurate but slow to start. Try a mission with pressure on — an impatient waiter is the fastest cure for translating in your head."],
    ["accuracy", f.accuracy, "Accuracy is the weak side. Slow down slightly and finish sentences properly — a shorter sentence you complete beats a longer one you abandon."],
    ["pronunciation", f.pronunciation, "Pronunciation is lagging. In the replay after a mission, say each corrected line back once — that's the drill that moves this."],
    ["range", f.range, `You're reusing a small set of words. ${(profile?.spokenWords || []).length} distinct so far — pick a mission in a category you haven't touched and it'll force new ones out of you.`],
  ].filter(([, v]) => v !== null).sort((a, b) => a[1] - b[1]);
  return scored.length ? scored[0][2] : "Keep speaking — everything here moves faster from the microphone than from anything else in the app.";
}

// ---------------------------------------------------------------------------
// A ring, drawn from the score. Empty ring when there's nothing to show — an
// arc at zero would read as "you scored zero", which is a different claim.
// ---------------------------------------------------------------------------
function Dial({ value }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const filled = value === null ? 0 : (value / 100) * c;
  return (
    <svg width="108" height="108" viewBox="0 0 108 108" role="img" aria-label={value === null ? "No score yet" : `${value} out of 100`}>
      <circle cx="54" cy="54" r={r} fill="none" stroke="var(--border)" strokeWidth="9" />
      {value !== null && (
        <circle
          cx="54" cy="54" r={r} fill="none"
          stroke="var(--primary)" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
          transform="rotate(-90 54 54)"
        />
      )}
    </svg>
  );
}
