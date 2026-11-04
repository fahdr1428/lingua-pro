// =============================================================================
// COURSE — the whole course for the current language, in one place:
//
//   · what the course is (variety, register, script, how the language works,
//     what learners find hard, other varieties) and its honest review status;
//   · the learner's skill profile, with what each number means;
//   · every module: what it leads to, its lessons (done / next / open / not yet
//     open), its objectives, its grammar and its conversation.
//
// Built from curriculum.js and courses.js for whichever language is loaded —
// the same screen for all 21 languages, with each one's own content.
// =============================================================================

import React, { useEffect, useMemo, useState } from "react";
import { Container } from "../ui/primitives.jsx";
import { LANGUAGES, scriptFont } from "../data/registry.js";
import { computeUnlocks } from "../data/chapters.js";
import { goBack } from "../ui/navigation.js";
import { loadCourse } from "../engine/guided.js";
import { moduleStanding, nextLesson, lessonSatisfied } from "../engine/curriculum.js";
import { FEATURES, SCRIPTS } from "../data/courses.js";
import { SkillBars, useSkills, skillAction } from "./CoursePanel.jsx";
import { focusReason, SKILL_LABEL } from "../engine/skills.js";
import { OBJECTIVE_LABEL } from "./GuidedParts.jsx";
import "./course.css";

export function CourseScreen({ engine, pack, appState, stats, onNavigate }) {
  const lang = LANGUAGES[pack.code] || {};
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(() => new Set());
  const skills = useSkills(engine, [stats]);

  useEffect(() => {
    let live = true;
    Promise.all([loadCourse(pack), engine.getCourseState(), engine.getProgress(), engine.getUnitProgress()])
      .then(([course, state, progress, units]) => {
        if (!live) return;
        const unlocks = computeUnlocks(units, appState, pack.code);
        setData({ course, state, progress, unlocks, standing: moduleStanding(course, state, progress), next: nextLesson(course, state, progress) });
      })
      .catch((e) => { console.warn("course screen:", e); if (live) setData({ failed: true }); });
    return () => { live = false; };
  }, [engine, pack, appState, stats]);

  const profile = data?.course?.profile;
  const script = profile ? SCRIPTS[profile.script] : null;
  const toggle = (id) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const focus = skills?.profile?.focus;
  const action = useMemo(() => (focus ? skillAction(focus, pack.code) : null), [focus, pack.code]);

  if (!data) return <Container><div className="zc-note" style={{ padding: 40, textAlign: "center" }}>Loading the course…</div></Container>;
  if (data.failed) return <Container><div className="zc-note" style={{ padding: 40 }}>The course couldn't be built just now. Your lessons on Home still work.</div></Container>;

  const { course, state, progress, unlocks, standing, next } = data;

  return (
    <Container className="zc">
      <div className="zc-top">
        <button className="zc-back" onClick={() => goBack(onNavigate)} aria-label="Back">←</button>
        <div>
          <h1 className="zc-h1">{lang.name} course</h1>
          <div className="zc-native" lang={pack.code} dir={lang.rtl ? "rtl" : "ltr"} style={{ fontFamily: scriptFont(pack.code) }}>{lang.nativeName}</div>
        </div>
      </div>
      <span className="zc-badge" data-testid="review-status">
        Practice course · generated from existing content · not yet reviewed by a teacher
      </span>

      {/* ---- what this course is ---- */}
      {profile && (
        <section className="zs-panel" aria-labelledby="zc-about">
          <h2 id="zc-about" className="zs-title">What you're learning</h2>
          <dl className="zc-facts" data-testid="course-profile">
            <dt>Variety</dt><dd>{profile.variety}</dd>
            <dt>Register</dt><dd>{profile.register}</dd>
            <dt>Script</dt><dd>{script?.name}{script ? ` · ${script.dir === "rtl" ? "right to left" : "left to right"}` : ""}</dd>
            {profile.romanisation && (<><dt>Romanisation</dt><dd>{profile.romanisation}</dd></>)}
            <dt>Word order</dt><dd>{profile.wordOrder}</dd>
            {profile.exams && (<><dt>Formal exams</dt><dd>{profile.exams}. Zaban doesn't award levels; these are the exams that do.</dd></>)}
          </dl>
          {profile.features.filter((f) => f !== "non-latin").length > 0 && (
            <>
              <h3 className="zs-h4">How {lang.name} works</h3>
              <ul className="zc-list">
                {profile.features.filter((f) => f !== "non-latin").map((f) => <li key={f}>{FEATURES[f]}</li>)}
              </ul>
            </>
          )}
          <h3 className="zs-h4">What learners find hard</h3>
          <ul className="zc-list">
            {profile.difficulties.map((d) => <li key={d}>{d}</li>)}
          </ul>
          {profile.otherVarieties && <p className="zc-note"><strong>Other varieties.</strong> {profile.otherVarieties}</p>}
          {profile.contentNotes?.length > 0 && (
            <>
              <h3 className="zs-h4">Known issues in this course's content</h3>
              <ul className="zc-list" data-testid="content-notes">
                {profile.contentNotes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </>
          )}
        </section>
      )}

      {/* ---- skills ---- */}
      <section className="zs-panel" aria-labelledby="zc-skills">
        <h2 id="zc-skills" className="zs-title">Your skills</h2>
        <p className="zc-note">
          Each skill is scored from your last answers that use it. Writing or saying something from memory counts fully,
          choosing it from options counts 70%, and a hint or a near miss counts half. Under 12 answers there's no score yet.
        </p>
        <SkillBars profile={skills?.profile} />
        {focus && action && (
          <div className="zs-focus">
            <div>
              <div className="zs-eyebrow">Work on next · {SKILL_LABEL[focus]}</div>
              <div className="zs-focus-text">{focusReason(skills.profile)}</div>
            </div>
            <button className="zs-btn" onClick={() => onNavigate(action.screen, action.params)}>{action.label}</button>
          </div>
        )}
      </section>

      {/* ---- modules ---- */}
      <section className="zs-panel" aria-labelledby="zc-modules">
        <h2 id="zc-modules" className="zs-title">Modules</h2>
        <p className="zc-note">
          {course.modules.length} modules, {course.lessonCount} lessons. Each lesson teaches up to 7 words in seven steps,
          from recall to an assessment without hints; each module ends with its conversation.
        </p>
        {course.modules.map((m) => {
          const st = standing[m.index];
          const isOpen = open.has(m.id) || next?.module.id === m.id;
          const unlocked = unlocks[m.index] !== false;
          return (
            <div className="zc-module" key={m.id} data-module={m.id}>
              <div className="zc-mod-head">
                <h3 className="zc-mod-title">{m.emoji} {m.index + 1}. {m.title}</h3>
                <span className="zc-mod-count">{st?.complete || 0}/{st?.total || 0} lessons</span>
              </div>
              <div className="zc-mod-outcome">{m.exchange ? `Leads to: ${m.exchange.outcome.toLowerCase()}` : m.description}</div>
              <ul className="zc-lessons">
                {m.lessons.map((l) => {
                  const done = lessonSatisfied(l, state, progress);
                  const isNext = next?.lesson.id === l.id;
                  return (
                    <li key={l.id} className={`zc-lesson${done ? " zc-lesson-done" : isNext ? " zc-lesson-next" : ""}`}>
                      <span className="zc-lesson-mark" aria-hidden="true">{done ? "✓" : l.kind === "task" ? "💬" : ""}</span>
                      <span className="zc-lesson-title">
                        {l.title}
                        {done && <span className="sr-only"> (done)</span>}
                      </span>
                      <button
                        className="zc-lesson-go"
                        disabled={!unlocked}
                        data-lesson={l.id}
                        onClick={() => onNavigate("lesson", { mode: "guided", filter: { lesson: l.id } })}
                        aria-label={`${done ? "Practise" : "Start"}: ${l.title}`}
                      >
                        {!unlocked ? "Locked" : done ? "Again" : isNext ? "Start" : "Open"}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button className="zc-toggle" onClick={() => toggle(m.id)} aria-expanded={isOpen}>
                {isOpen ? "Hide" : "Show"} what this module teaches
              </button>
              {isOpen && (
                <>
                  <ul className="zc-objectives">
                    {m.objectives.map((o) => (
                      <li key={o.id}><span className="zc-objtype">{OBJECTIVE_LABEL[o.type]}</span><span>{o.text}</span></li>
                    ))}
                  </ul>
                  {m.patterns.length > 0 && <p className="zc-note">Sentence Lab: {m.patterns.join(" · ")}</p>}
                  {(m.exchanges || []).map((ex) => (
                    <p className="zc-note" key={ex.id}>
                      Conversation:{" "}
                      <span lang={pack.code} dir={lang.rtl ? "rtl" : "ltr"} style={{ fontFamily: scriptFont(pack.code) }}>{ex.you.text}</span>
                      {" "}— {ex.you.en}
                      {state.exchanges?.[ex.id] ? " · practised ✓" : ""}
                    </p>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </section>
    </Container>
  );
}
