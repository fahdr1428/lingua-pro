// =============================================================================
// PRACTICE — single entry point that merges "Read & Understand" and
// "Conversation Starters" behind one toggle. This reduces home-screen clutter
// (two near-identical browse screens become one door) WITHOUT rewriting the
// underlying screens — it renders the existing, tested components below a
// segmented toggle. Lower bug risk than fusing their internals.
// =============================================================================

import React, { useState } from "react";
import { Container } from "../ui/primitives.jsx";
import { Reading } from "./Reading.jsx";
import { Conversations } from "./Conversations.jsx";
import { PASSAGES } from "../data/passages.js";
import { getConversations } from "../data/conversations.js";

export function Practice(props) {
  const { pack } = props;
  const hasPassages = !!(PASSAGES[pack.code] && PASSAGES[pack.code].length);
  const hasConvos = getConversations(pack.code).length > 0;

  // Default to whichever exists; prefer reading if both.
  const [tab, setTab] = useState(hasPassages ? "read" : "talk");

  // The child screens render their own back button (→ home). We inject a
  // toggle bar above them via a shared chrome wrapper.
  return (
    <div>
      <Container style={{ paddingBottom: 0 }}>
        <div
          style={{
            display: "flex",
            gap: 6,
            background: "var(--surface)",
            borderRadius: 999,
            padding: 5,
            marginBottom: 4,
            marginTop: 8,
          }}
        >
          <button
            onClick={() => setTab("read")}
            disabled={!hasPassages}
            style={tabStyle(tab === "read", !hasPassages)}
          >
            📖 Read &amp; Understand
          </button>
          <button
            onClick={() => setTab("talk")}
            disabled={!hasConvos}
            style={tabStyle(tab === "talk", !hasConvos)}
          >
            💬 Conversations
          </button>
        </div>
      </Container>

      {/* Render the existing, working screen for the active tab. They each
          handle their own state, audio, subtitles, and back navigation. */}
      {tab === "read" ? <Reading {...props} /> : <Conversations {...props} />}
    </div>
  );
}

function tabStyle(active, disabled) {
  return {
    flex: 1,
    background: active ? "var(--primary)" : "transparent",
    color: active ? "#fff" : disabled ? "var(--text-mute)" : "var(--text-dim)",
    border: "none",
    borderRadius: 999,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "background 0.15s",
  };
}
