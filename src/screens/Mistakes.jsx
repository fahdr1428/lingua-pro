// =============================================================================
// YOUR MISTAKES (v116) — the words this learner keeps missing.
//
// From the answer log (Engine.recordAttempt): every word missed in the last 30
// days that hasn't been put right since — written from memory cleanly, or got
// right twice in a row (teach.js mistakeNotebook). Each with the right form,
// its romanisation, what it means, how it was missed, and a sentence it lives
// in. One button turns the list into a lesson on exactly those words.
//
// A list of your own mistakes is the most useful thing to study and the least
// pleasant to look at, so it says plainly what is on it and how a word leaves.
// =============================================================================

import React, { useEffect, useState } from "react";
import { Button, Card, Container, Icon } from "../ui/primitives.jsx";
import { LANGUAGES, isNonLatinScript, scriptFont } from "../data/registry.js";
import { speak, hasVoiceFor } from "../audio/tts.js";
import { goBack } from "../ui/navigation.js";
import { mistakeNotebook } from "../engine/teach.js";

const ROUND = 8;

function when(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

export function Mistakes({ engine, pack, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const nonLatin = isNonLatinScript(pack.code);
  const voice = hasVoiceFor(lang.ttsCode);
  const [list, setList] = useState(null);

  useEffect(() => {
    let live = true;
    engine.getAttempts()
      .then((log) => { if (live) setList(mistakeNotebook(log, pack.vocab || [])); })
      .catch(() => { if (live) setList([]); });
    return () => { live = false; };
  }, [engine, pack]);

  const practise = () => {
    const ids = list.slice(0, ROUND).map((m) => m.item.id);
    onNavigate("lesson", { mode: "words", filter: { vocabIds: ids }, sessionSize: ids.length });
  };

  return (
    <Container style={{ paddingBottom: 120, maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => goBack(onNavigate, "hub")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
          ← Back
        </Button>
        <div className="eyebrow">{lang.name}</div>
      </div>
      <h1 style={{ fontSize: 30, margin: "0 0 6px" }}>Your mistakes</h1>
      <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.55, marginBottom: 20, maxWidth: "60ch" }}>
        Words you've missed in the last 30 days and haven't got right since. A word leaves this list when you write it
        from memory, or get it right twice in a row.
      </p>

      {list === null ? (
        <div style={{ color: "var(--text-dim)", padding: "30px 0" }} role="status">Reading your answers…</div>
      ) : list.length === 0 ? (
        <Card data-testid="mistakes-empty" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Nothing to put right</div>
          <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.55 }}>
            When you miss a word in a lesson, it appears here with the right answer until you've got it right again.
          </div>
        </Card>
      ) : (
        <>
          <Button onClick={practise} data-testid="mistakes-practise" style={{ marginBottom: 20 }}>
            Practise {Math.min(ROUND, list.length) === list.length ? (list.length === 1 ? "this word" : `these ${list.length}`) : `the ${ROUND} most missed`}
          </Button>
          <ol className="mistakes" data-testid="mistakes-list">
            {list.map(({ item, misses, lastMiss, kinds }) => {
              const ex = (item.examples || []).find((e) => e?.native);
              return (
                <li key={item.id} className="mistake">
                  <div className="mistake-head">
                    <div style={{ minWidth: 0 }}>
                      <div className="mistake-native" dir={lang.rtl ? "rtl" : "ltr"} lang={pack.code}
                        style={{ fontFamily: scriptFont(pack.code, '"Fraunces", Georgia, serif') }}>
                        {item.lemma}
                      </div>
                      {nonLatin && item.translit && <div className="mistake-tl">{item.translit}</div>}
                      <div className="mistake-en">“{item.translation}”</div>
                    </div>
                    {voice && (
                      <button type="button" className="mistake-play" aria-label={`Hear ${item.translit || item.lemma}`}
                        onClick={() => { try { speak(item.lemma, lang.ttsCode, { audioId: item.id, code: pack.code, translit: item.translit }); } catch {} }}>
                        <Icon name="speaker" size={16} />
                      </button>
                    )}
                  </div>
                  <div className="mistake-meta">
                    Missed {misses === 1 ? "once" : misses === 2 ? "twice" : `${misses} times`}, last {when(lastMiss)}
                    {kinds.length > 0 && <> · {kinds.slice(0, 3).join(", ")}</>}
                  </div>
                  {ex && (
                    <div className="mistake-ex">
                      <div dir={lang.rtl ? "rtl" : "ltr"} lang={pack.code} style={{ fontFamily: scriptFont(pack.code, undefined) }}>{ex.native}</div>
                      {nonLatin && ex.translit && <div className="mistake-tl">{ex.translit}</div>}
                      {ex.translation && <div className="mistake-en">“{ex.translation}”</div>}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </Container>
  );
}
