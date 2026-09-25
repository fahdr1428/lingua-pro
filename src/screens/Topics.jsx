// =============================================================================
// TOPICS (v105) — "practise just numbers", "just food", "just family".
//
// Every session before this was the curriculum's choice. That is right most
// days, and wrong the evening before you phone your grandmother and want the
// numbers solid, or the afternoon before dinner at your aunt's. This screen
// lists the pack's topics with how far you are into each, and one tap runs a
// short lesson inside that topic only: a few words you haven't met yet, plus
// the learned ones you're closest to forgetting (engine mode "topic", see
// buildTopicQueue in selector.js).
// =============================================================================

import React, { useEffect, useState } from "react";
import { Button, Card, Container, ProgressBar } from "../ui/primitives.jsx";
import { LANGUAGES } from "../data/registry.js";
import { goBack } from "../ui/navigation.js";

const ICONS = {
  Greetings: "👋", Politeness: "🙏", "About You": "🙋", Family: "👪", People: "🧑‍🤝‍🧑",
  Numbers: "🔢", Food: "🍲", Verbs: "🏃", Places: "🏠", Time: "⏰", Feelings: "💛",
  Body: "🩺", Colors: "🎨", Weather: "⛅", Nature: "🌿", Travel: "🧳", Transport: "🚌",
  Useful: "🧰", Common: "💬", Connectors: "🔗", Questions: "❓", Adjectives: "✨", Survival: "🆘",
};

// Roughly the order someone would reach for them: the first conversation,
// then the people in it, then the day around them. Unknown topics sort last.
const ORDER = [
  "Greetings", "Politeness", "About You", "Survival", "Family", "People", "Numbers",
  "Food", "Time", "Places", "Travel", "Transport", "Body", "Feelings", "Weather",
  "Colors", "Nature", "Questions", "Verbs", "Adjectives", "Common", "Connectors", "Useful",
];
const rank = (c) => { const i = ORDER.indexOf(c); return i === -1 ? ORDER.length : i; };

export const TOPIC_SESSION_SIZE = 8;

// Which topic to put at the top: the one with the most words slipping, else
// the started topic that's furthest from done. Nothing for a learner who has
// started none — the card would only repeat the first row of the list.
export function suggestTopic(topics) {
  const slipping = [...topics].filter((t) => t.due > 0).sort((a, b) => b.due - a.due);
  if (slipping.length) return { topic: slipping[0], why: `${slipping[0].due} word${slipping[0].due === 1 ? "" : "s"} slipping` };
  const started = topics.filter((t) => t.learned > 0 && t.learned < t.total)
    .sort((a, b) => a.learned / a.total - b.learned / b.total);
  if (started.length) return { topic: started[0], why: "Pick up where you left off" };
  return null;
}

export function Topics({ engine, pack, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const [topics, setTopics] = useState(null);

  useEffect(() => {
    let cancelled = false;
    engine.getTopics()
      .then((t) => { if (!cancelled) setTopics([...t].sort((a, b) => rank(a.category) - rank(b.category))); })
      .catch(() => { if (!cancelled) setTopics([]); });
    return () => { cancelled = true; };
  }, [engine]);

  const start = (category) => onNavigate("lesson", {
    mode: "topic", filter: { category }, sessionSize: TOPIC_SESSION_SIZE, topic: category,
  });

  const header = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => goBack(onNavigate, "hub")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
          ← Back
        </Button>
        <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
          Topics
        </div>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>🎯 Practise a topic</h1>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 20 }}>
        Pick one corner of {lang.name} and drill just that — a few new words, and the ones you're closest to forgetting.
      </p>
    </>
  );

  if (topics === null) {
    return <Container style={{ paddingBottom: 120, maxWidth: 560 }}>{header}<div className="screen-loading">Loading…</div></Container>;
  }

  if (topics.length === 0) {
    return (
      <Container style={{ paddingBottom: 120, maxWidth: 560 }}>
        {header}
        <Card style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>No topics for {lang.name} yet</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Your regular lessons cover everything in the meantime.</div>
        </Card>
      </Container>
    );
  }

  const suggestion = suggestTopic(topics);

  return (
    <Container style={{ paddingBottom: 120, maxWidth: 560 }}>
      {header}

      {suggestion && (
        <button
          onClick={() => start(suggestion.topic.category)}
          className="card-lift"
          aria-label={`Suggested: practise ${suggestion.topic.category}. ${suggestion.why}.`}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left",
            background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "2px solid var(--primary)",
            padding: 16, cursor: "pointer", boxShadow: "var(--shadow-card)", marginBottom: 20,
          }}
        >
          <div style={{
            fontSize: 26, width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: "var(--surface-hi)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {ICONS[suggestion.topic.category] || "📘"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow">Suggested</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>{suggestion.topic.category}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>{suggestion.why}</div>
          </div>
          <div style={{ fontSize: 18, color: "var(--primary)", fontWeight: 800 }}>Go →</div>
        </button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }} data-testid="topic-list">
        {topics.map((t) => {
          const done = t.learned === t.total && t.total > 0;
          return (
            <button
              key={t.category}
              onClick={() => start(t.category)}
              className="card-lift"
              aria-label={`${t.category}: ${t.learned} of ${t.total} words learned${t.due ? `, ${t.due} slipping` : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)",
                padding: 14, cursor: "pointer", boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{
                fontSize: 22, width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: "var(--surface-hi)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {ICONS[t.category] || "📘"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{t.category}</div>
                  {t.due > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
                      background: "var(--surface-hi)", color: "var(--primary)", border: "1px solid var(--border)",
                    }}>
                      {t.due} slipping
                    </span>
                  )}
                  {done && t.due === 0 && <span aria-hidden="true" style={{ fontSize: 13 }}>✓</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>
                  {t.learned} of {t.total} learned{t.mastered ? ` · ${t.mastered} mastered` : ""}
                </div>
                <ProgressBar value={t.learned} max={t.total} height={6} />
              </div>
              <div style={{ fontSize: 18, color: "var(--text-mute)" }}>→</div>
            </button>
          );
        })}
      </div>
    </Container>
  );
}
