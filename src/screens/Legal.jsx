// =============================================================================
// LEGAL (v77) — the policies, in the app, readable.
//
// App stores require a privacy policy URL and reviewers open it. More usefully,
// a policy nobody can find is a policy that protects nobody: this is reachable
// from Settings, from onboarding, and from the AI consent gate, and it's written
// to be read rather than to be survived.
// =============================================================================

import React, { useState } from "react";
import { POLICIES, getPolicy, LAST_UPDATED, policiesIncomplete } from "../legal/policies.js";

export function Legal({ params, onNavigate }) {
  const [id, setId] = useState(params?.policy || "privacy");
  const policy = getPolicy(id);

  return (
    <div className="speak-screen">
      <header className="speak-bar">
        <button onClick={() => onNavigate(params?.back || "settings")} className="speak-close" aria-label="Back">←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Legal</div>
          <div className="speak-title">{policy.title}</div>
        </div>
      </header>

      <div className="speak-body">
        <div className="chip-row">
          {POLICIES.map((p) => (
            <button key={p.id} className={`chip${id === p.id ? " chip-on" : ""}`} onClick={() => setId(p.id)}>
              {p.title}
            </button>
          ))}
        </div>

        {policiesIncomplete() && (
          <div className="legal-warn">
            <b>Not ready to publish.</b> This policy still contains placeholders
            for the operator's legal entity, contact address and jurisdiction.
            Fill them in <code>src/legal/policies.js</code> before making the app
            public — see <code>COMPLIANCE.md</code>.
          </div>
        )}

        <p className="policy-summary">{policy.summary}</p>

        {policy.sections.map((s, i) => (
          <section className="policy-section" key={i}>
            <h3 className="policy-heading">{s.heading}</h3>
            {s.body.map((para, j) => <p className="policy-para" key={j}>{para}</p>)}
          </section>
        ))}

        <p className="policy-updated">Last updated {LAST_UPDATED}.</p>
      </div>
    </div>
  );
}
