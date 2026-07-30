// =============================================================================
// CULTURE (v70) — "Inside <language>". The screen that answers the questions a
// word list can't.
//
// A learner who knows 100 Urdu words still doesn't know that refusing chai once
// means nothing, that tum to a stranger stings, or that a flat statement about
// tomorrow sounds presumptuous without inshallah. That knowledge is what
// separates someone who has studied a language from someone who has been around
// it — and it's exactly what an app usually leaves out.
//
// Notes are grouped by what kind of knowledge they are (etiquette, register,
// sound, body language, custom) rather than by unit, because that's how someone
// browses this: "what will I get wrong socially" is a different question from
// "what will I get wrong phonetically".
//
// The guide introduces the screen, because these are the things a person tells
// you, not things a course teaches you.
// =============================================================================

import React, { useState } from "react";
import { Container } from "../ui/primitives.jsx";
import { GuideByline } from "../ui/GuideMark.jsx";
import { LANGUAGES } from "../data/registry.js";
import { getCharacter } from "../data/characters.js";
import { getCultureNotes, tagLabel } from "../data/culture.js";
import { FUN_FACTS } from "../data/funFacts.js";

const TAG_ORDER = ["etiquette", "register", "sound", "gesture", "custom"];

const TAG_BLURB = {
  etiquette: "Who you may say it to, and when",
  register: "Formal, familiar, intimate — and the cost of picking wrong",
  sound: "What natives do with their mouths that learners miss",
  gesture: "The body language that travels with the words",
  custom: "The practice the phrase sits inside",
};

export function Culture({ pack, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const guide = getCharacter(pack.code);
  const notes = getCultureNotes(pack.code);
  const facts = FUN_FACTS[pack.code] || [];
  const [tag, setTag] = useState("all");

  const tagsPresent = TAG_ORDER.filter((t) => notes.some((n) => n.tag === t));
  const shown = tag === "all" ? notes : notes.filter((n) => n.tag === tag);

  return (
    <div className="home-wash">
      <div className="speak-bar">
        <button onClick={() => onNavigate("hub")} className="speak-close" aria-label="Back">←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Culture</div>
          <div className="speak-title">Inside {lang.name}</div>
        </div>
      </div>

      <Container style={{ maxWidth: 620, paddingTop: 16 }}>
        {guide && (
          <div style={{ marginBottom: 18 }}>
            <GuideByline code={pack.code} size={44} />
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.62, marginTop: 12, marginBottom: 0 }}>
              These are the things I'd tell you over tea rather than in a lesson —
              the bits that decide whether you sound like someone who studied
              {" "}{lang.name} or someone who has actually spent time around it.
            </p>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="empty-note">
            <p>No cultural notes written for {lang.name} yet.</p>
          </div>
        ) : (
          <>
            <div className="culture-filters">
              <button className={`chip${tag === "all" ? " chip-on" : ""}`} onClick={() => setTag("all")}>
                Everything <span className="chip-n">{notes.length}</span>
              </button>
              {tagsPresent.map((t) => (
                <button key={t} className={`chip${tag === t ? " chip-on" : ""}`} onClick={() => setTag(t)}>
                  {tagLabel(t)} <span className="chip-n">{notes.filter((n) => n.tag === t).length}</span>
                </button>
              ))}
            </div>

            {tag !== "all" && TAG_BLURB[tag] && (
              <p style={{ fontSize: 12.5, color: "var(--text-mute)", margin: "0 0 14px", lineHeight: 1.5 }}>
                {TAG_BLURB[tag]}
              </p>
            )}

            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {shown.map((n) => (
                <div className="culture-note" key={n.id}>
                  <div className="culture-tag">{tagLabel(n.tag)}</div>
                  <div className="culture-title">{n.title}</div>
                  <div className="culture-body">{n.body}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {facts.length > 0 && (
          <>
            <h3 className="eyebrow" style={{ margin: "32px 0 12px" }}>Also true</h3>
            <ul className="fact-list">
              {facts.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </>
        )}
      </Container>
    </div>
  );
}
