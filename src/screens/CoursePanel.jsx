// =============================================================================
// COURSE PANEL — on Home, under the one next action: which course this is,
// where the learner is in it, their skills, and the one thing to work on.
//
// Every number here comes from the learner's own answers (Engine attempts and
// cards) through skills.js. A skill without enough evidence says so instead of
// showing a flattering bar. Loaded after Home paints.
// =============================================================================

import React, { useEffect, useState } from "react";
import { LANGUAGES } from "../data/registry.js";
import { hasPassages } from "../data/contentIndex.js";
import { skillProfile, focusReason, SKILLS, SKILL_LABEL, MIN_EVIDENCE, stageCounts, STAGE_LABEL } from "../engine/skills.js";
import { hasAudioFor } from "../audio/tts.js";
import "./course.css";

// v117 — what a drill of each skill is called (adapt.js DRILLS, kept here so
// the label doesn't wait on the engine chunk).
const DRILL_LABEL = {
  listening: "Listening drill", writing: "Writing drill", reading: "Reading drill",
  grammar: "Sentence drill", vocabulary: "Word drill",
};

/**
 * Where to go to work on a skill.
 *
 * v117: when a DRILL of that skill can be built from this learner's own words
 * (adapt.js buildSkillDrill — `drills` lists the ones that can), that is the
 * action: a session made only of that skill's exercise types. Otherwise the
 * nearest screen, as before.
 */
export function skillAction(skill, code, drills = null) {
  if (drills?.includes(skill) && DRILL_LABEL[skill]) {
    return { label: DRILL_LABEL[skill], screen: "lesson", params: { mode: "skill", filter: { skill } }, drill: true };
  }
  switch (skill) {
    case "speaking": return { label: "Practise speaking", screen: "speak", params: {} };
    case "listening": return { label: "Listen and repeat", screen: "listen", params: {} };
    case "reading": return hasPassages(code)
      ? { label: "Read a short passage", screen: "reading", params: {} }
      : { label: "Build sentences", screen: "sentencelab", params: {} };
    case "grammar": return { label: "Open the grammar lessons", screen: "grammar", params: {} };
    case "interaction": return { label: "Try a real-world mission", screen: "missions", params: {} };
    case "writing":
    case "vocabulary":
    default: return { label: "Write words from memory", screen: "lesson", params: { mode: "recall" } };
  }
}

/**
 * The learner's answers, cards and skill profile — and (v117, when `pack` is
 * given) which skills have a drill that can be built right now.
 */
export function useSkills(engine, deps = [], pack = null) {
  const [state, setState] = useState(null);
  useEffect(() => {
    let live = true;
    Promise.all([engine.getAttempts(), engine.getProgress()])
      .then(async ([attempts, progress]) => {
        if (!live) return;
        setState({ attempts, progress, profile: skillProfile(attempts), drills: [] });
        if (!pack) return;
        try {
          const { availableDrills } = await import("../engine/adapt.js");
          const ttsCode = LANGUAGES[pack.code]?.ttsCode;
          const canHear = (v) => { try { return hasAudioFor(ttsCode, v.id); } catch { return false; } };
          const drills = availableDrills(pack, progress, { canHear });
          if (live) setState((st) => (st ? { ...st, drills } : st));
        } catch {
          // No drills is a smaller panel, not an error.
        }
      })
      .catch(() => { if (live) setState({ attempts: [], progress: {}, profile: skillProfile([]), drills: [] }); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, pack, ...deps]);
  return state;
}

/**
 * What tapping each skill does: its drill when one can be built; for speaking
 * and conversation, the screens that practise them. A skill with nothing to
 * practise on yet has no action and is drawn as a plain row.
 */
export function skillActions(code, drills = [], learned = 0) {
  const out = {};
  for (const s of SKILLS) {
    if (drills.includes(s)) out[s] = skillAction(s, code, drills);
    else if (s === "speaking" && learned >= 3) out[s] = { label: "Speaking session", screen: "lesson", params: { mode: "speak" } };
    else if (s === "interaction" && learned >= 3) out[s] = { label: "Real-world missions", screen: "missions", params: {} };
  }
  return out;
}

export function SkillBars({ profile, compact = false, actions = null, onPractise = null }) {
  if (!profile) return null;
  return (
    <ul className={`zs-skills${compact ? " zs-compact" : ""}`} data-testid="skill-profile">
      {SKILLS.map((s) => {
        const k = profile.skills[s];
        const none = k.score === null;
        const act = onPractise && actions?.[s];
        const cells = (
          <>
            <span className="zs-skill-name">{SKILL_LABEL[s]}</span>
            {none ? (
              <span className="zs-skill-none">
                Not enough evidence yet{k.n ? ` · ${k.n} of ${MIN_EVIDENCE} answers` : ""}
              </span>
            ) : (
              <>
                <span className="zs-bar" role="img" aria-label={`${SKILL_LABEL[s]} ${k.score} out of 100, ${k.confidence} confidence`}>
                  <span className="zs-bar-fill" style={{ "--fill": `${k.score}%` }} />
                </span>
                <span className="zs-skill-score">{k.score}</span>
              </>
            )}
          </>
        );
        return (
          <li key={s} data-skill={s} data-score={none ? "" : k.score} className={act ? "zs-can" : undefined}>
            {act ? (
              <button type="button" className="zs-skill-go" data-testid={`practise-${s}`} data-drill={act.drill ? s : undefined}
                aria-label={`${SKILL_LABEL[s]}: ${none ? "no score yet" : `${k.score} out of 100`}. ${act.label}`}
                onClick={() => onPractise(act, s)}>
                {cells}
                <span className="zs-skill-chev" aria-hidden="true">›</span>
              </button>
            ) : cells}
          </li>
        );
      })}
    </ul>
  );
}

export function CoursePanel({ course, engine, pack, stats, onNavigate }) {
  const lang = LANGUAGES[pack.code] || {};
  const skills = useSkills(engine, [stats], pack);
  const full = course.full;
  const profile = full?.profile;
  const next = course.next;
  const standing = course.standing || [];
  const finishedModules = standing.filter((m) => m.finished).length;
  const currentIdx = next ? next.module.index : full.modules.length - 1;
  const focus = skills?.profile?.focus || null;
  const action = focus ? skillAction(focus, pack.code, skills?.drills) : null;
  const actions = skills ? skillActions(pack.code, skills.drills, stats?.learned || 0) : null;
  const tappable = !!actions && Object.keys(actions).length > 0;

  const allIds = full.modules.flatMap((m) => m.items);
  const stages = skills ? stageCounts(allIds, skills.progress, skills.attempts) : null;

  return (
    <section className="zs-panel" aria-labelledby="zs-course-head" data-testid="course-panel">
      <div className="zs-head">
        <h3 id="zs-course-head" className="zs-title">Your {lang.name} course</h3>
        <button className="zs-link" onClick={() => onNavigate("course")} data-testid="open-course">
          See the whole course
        </button>
      </div>
      {profile && (
        <p className="zs-identity">
          {profile.variety} · {profile.register}
        </p>
      )}

      <div className="zs-modules" aria-label={`Module ${currentIdx + 1} of ${full.modules.length}`}>
        {full.modules.map((m, i) => (
          <span
            key={m.id}
            className={`zs-mod${standing[i]?.finished ? " zs-mod-done" : i === currentIdx ? " zs-mod-now" : ""}`}
            title={m.title}
          />
        ))}
      </div>
      <div className="zs-sub">
        {next
          ? <>Module {currentIdx + 1} of {full.modules.length}: <strong>{next.module.title}</strong> · {standing[currentIdx]?.complete || 0} of {standing[currentIdx]?.total || 0} lessons</>
          : <>Every module done — {finishedModules} of {full.modules.length}</>}
      </div>

      {stages && (
        <div className="zs-stages" data-testid="word-stages">
          {["secure", "application", "recall", "knowledge", "introduced"].map((st) =>
            stages[st] ? (
              <span key={st} className={`zs-stage zs-stage-${st}`}>
                <strong>{stages[st]}</strong> {STAGE_LABEL[st].toLowerCase()}
              </span>
            ) : null
          )}
          <span className="zs-stage zs-stage-new"><strong>{stages.new}</strong> not started</span>
        </div>
      )}

      <h4 className="zs-h4">Your skills</h4>
      <SkillBars profile={skills?.profile} compact actions={actions} onPractise={(a) => onNavigate(a.screen, a.params)} />
      <p className="zs-fine">
        {tappable && <>Tap a skill to practise it. </>}
        From memory counts fully; choosing from options counts 70%. Estimates from your answers here, not a certificate.
      </p>

      {focus && action && (
        <div className="zs-focus" data-testid="skill-focus" data-focus={focus}>
          <div>
            <div className="zs-eyebrow">Work on next</div>
            <div className="zs-focus-text">{focusReason(skills.profile)}</div>
          </div>
          <button className="zs-btn" onClick={() => onNavigate(action.screen, action.params)}>
            {action.label}
          </button>
        </div>
      )}
    </section>
  );
}
