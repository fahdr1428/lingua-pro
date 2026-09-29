// =============================================================================
// RUSH (v109) — Word Rush: sixty seconds, how many can you match?
//
// A game, on purpose. Lessons are careful and paced; this is the other half of
// knowing a word — getting it without effort, fast. Runs of correct answers
// build a multiplier, a miss comes back a few questions later (see games.js),
// and the round ends with the words you missed turned into a real lesson.
//
// Two directions: "word → meaning" (recognition) and "meaning → word" (the
// harder one: recalling the form). Keys 1–4 answer on a keyboard.
//
// XP and today's goal: a round is logged as a session like a lesson, and pays
// one XP per correct answer, capped at 25 — a game shouldn't out-earn study.
// It does NOT write to the review schedule: a fast guess against a clock is not
// the careful signal spaced repetition needs.
// =============================================================================

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Container } from "../ui/primitives.jsx";
import { LANGUAGES, isNonLatinScript } from "../data/registry.js";
import { speak } from "../audio/tts.js";
import { playCorrect, playWrong } from "../audio/sfx.js";
import { rushQuestion, comboMultiplier, createRushDeck, rushXp } from "../engine/games.js";
import { goBack } from "../ui/navigation.js";

const DEFAULT_SECONDS = 60;

const nativeFont = (code, rtl) =>
  !rtl ? "inherit"
    : code === "ur" ? '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif'
      : '"Noto Naskh Arabic", "Noto Nastaliq Urdu", serif';

export function Rush({ engine, pack, appState, setAppState, params, onNavigate }) {
  const lang = LANGUAGES[pack.code];
  const nonLatin = isNonLatinScript(pack.code);
  const seconds = Math.max(5, Number(params?.seconds) || DEFAULT_SECONDS);
  const sounds = appState?.soundEffects !== false;

  const [pool, setPool] = useState(null);
  const [dir, setDir] = useState("meaning");
  const [phase, setPhase] = useState("ready"); // ready | playing | done
  const [q, setQ] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [missed, setMissed] = useState([]); // vocab items, unique, in order missed
  const [left, setLeft] = useState(seconds);
  const [pop, setPop] = useState(null); // "+3" floating after a correct answer
  const [result, setResult] = useState(null);

  const deck = useRef(null);
  const endsAt = useRef(0);
  const startedAt = useRef(0);
  const lock = useRef(false);
  const stats = useRef({ score: 0, correct: 0, attempts: 0, streak: 0, bestStreak: 0, missed: [] });

  const best = appState?.gameBest?.[pack.code]?.[`rush-${dir}`] || 0;

  useEffect(() => {
    let live = true;
    engine.getRushPool({ min: 12 }).then((p) => { if (live) setPool(p); }).catch(() => { if (live) setPool([]); });
    return () => { live = false; };
  }, [engine]);

  const nextQuestion = useCallback(() => {
    const item = deck.current.next();
    setQ(rushQuestion(item, pool, dir));
    setPicked(null);
    lock.current = false;
  }, [pool, dir]);

  const finish = useCallback(async () => {
    setPhase("done");
    const s = stats.current;
    const xp = rushXp(s.correct);
    const key = `rush-${dir}`;
    const prevBest = appState?.gameBest?.[pack.code]?.[key] || 0;
    const newBest = s.score > prevBest;
    setResult({ ...s, xp, newBest, prevBest });

    // Logged like a lesson, so it counts toward today's goal and the streak.
    let sessions = appState?.sessions || [];
    try {
      await engine.logSession({ correct: s.correct, total: s.attempts, xp, durationMs: Date.now() - startedAt.current, mode: "rush" });
      sessions = await engine.getSessions();
    } catch { /* a stat that doesn't save must not strand the result screen */ }
    const today = new Date().toDateString();
    setAppState((st) => {
      const wasYesterday = st.lastStudyDate === new Date(Date.now() - 86400000).toDateString();
      const played = s.attempts > 0;
      return {
        ...st,
        totalXp: (st.totalXp || 0) + xp,
        gems: (st.gems || 0) + Math.floor(xp / 10),
        sessions,
        ...(played ? {
          streak: st.lastStudyDate === today ? st.streak : wasYesterday ? (st.streak || 0) + 1 : 1,
          lastStudyDate: today,
        } : {}),
        gameBest: {
          ...(st.gameBest || {}),
          [pack.code]: { ...(st.gameBest?.[pack.code] || {}), [key]: Math.max(prevBest, s.score) },
        },
      };
    });
  }, [appState, dir, engine, pack.code, setAppState]);

  // The clock. One interval for the countdown text; the bar is a CSS animation.
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      const ms = endsAt.current - Date.now();
      setLeft(Math.max(0, Math.ceil(ms / 1000)));
      if (ms <= 0) { clearInterval(t); finish(); }
    }, 100);
    return () => clearInterval(t);
  }, [phase, finish]);

  const start = () => {
    stats.current = { score: 0, correct: 0, attempts: 0, streak: 0, bestStreak: 0, missed: [] };
    setScore(0); setStreak(0); setBestStreak(0); setCorrect(0); setAttempts(0); setMissed([]); setResult(null);
    deck.current = createRushDeck(pool);
    startedAt.current = Date.now();
    endsAt.current = Date.now() + seconds * 1000;
    setLeft(seconds);
    setPhase("playing");
    const item = deck.current.next();
    setQ(rushQuestion(item, pool, dir));
    setPicked(null);
    lock.current = false;
  };

  const answer = useCallback((opt) => {
    if (phase !== "playing" || lock.current || !q) return;
    lock.current = true;
    setPicked(opt);
    const s = stats.current;
    s.attempts += 1;
    if (opt === q.answer) {
      s.streak += 1;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      s.correct += 1;
      const gained = comboMultiplier(s.streak);
      s.score += gained;
      setPop(`+${gained}`);
      if (sounds) playCorrect();
      setTimeout(nextQuestion, 280);
    } else {
      s.streak = 0;
      if (!s.missed.some((m) => m.id === q.item.id)) s.missed.push(q.item);
      deck.current.missed(q.item);
      setPop(null);
      if (sounds) playWrong();
      // Long enough to see the right answer — that is the learning moment.
      setTimeout(nextQuestion, 900);
    }
    setScore(s.score); setStreak(s.streak); setBestStreak(s.bestStreak);
    setCorrect(s.correct); setAttempts(s.attempts); setMissed([...s.missed]);
  }, [phase, q, sounds, nextQuestion]);

  // Keys 1–4 answer, on a keyboard.
  useEffect(() => {
    if (phase !== "playing" || !q) return;
    const onKey = (e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) { e.preventDefault(); answer(q.options[n - 1]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, answer]);

  const header = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Button variant="ghost" onClick={() => goBack(onNavigate, "hub")} style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}>
          ← Back
        </Button>
        <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Game</div>
      </div>
    </>
  );

  if (pool === null) {
    return <Container style={{ paddingBottom: 120, maxWidth: 560 }}>{header}<div className="screen-loading">Loading…</div></Container>;
  }
  if (pool.length < 4) {
    return (
      <Container style={{ paddingBottom: 120, maxWidth: 560 }}>
        {header}
        <Card style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Not enough words yet</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Finish a lesson or two and come back.</div>
        </Card>
      </Container>
    );
  }

  // ---- READY -------------------------------------------------------------
  if (phase === "ready") {
    return (
      <Container style={{ paddingBottom: 120, maxWidth: 560 }}>
        {header}
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>⚡ Word Rush</h1>
        <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
          {seconds} seconds. Match as many {lang.name} words as you can — three right in a row doubles your points.
          A word you miss comes back so you can get it.
        </p>
        <div role="group" aria-label="Direction" style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {[["meaning", `${lang.name} → English`], ["word", `English → ${lang.name}`]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setDir(k)}
              aria-pressed={dir === k}
              style={{
                padding: "10px 16px", borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: "pointer",
                border: dir === k ? "2px solid var(--primary)" : "1px solid var(--border)",
                background: dir === k ? "var(--surface-hi)" : "var(--surface)", color: "var(--text)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div className="eyebrow">Your best</div>
            <div data-testid="rush-best" style={{ fontSize: 28, fontWeight: 900 }}>{best}</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", textAlign: "right" }}>
            {pool.length} words in play
          </div>
        </Card>
        <Button onClick={start}>Start</Button>
      </Container>
    );
  }

  // ---- DONE --------------------------------------------------------------
  if (phase === "done" && result) {
    const acc = result.attempts ? Math.round((result.correct / result.attempts) * 100) : 0;
    return (
      <Container style={{ paddingBottom: 120, maxWidth: 560, textAlign: "center" }}>
        {header}
        <div style={{ fontSize: 56 }} aria-hidden="true">{result.newBest ? "🏆" : "⚡"}</div>
        <div className="eyebrow" style={{ marginTop: 6 }}>{result.newBest ? "New best!" : "Time!"}</div>
        <div data-testid="rush-score" style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1 }}>{result.score}</div>
        <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 18 }} role="status">
          {result.correct} of {result.attempts} right · {acc}% · best run {result.bestStreak} · +{result.xp} XP
          {!result.newBest && result.prevBest ? ` · best ${result.prevBest}` : ""}
        </div>

        {result.missed.length > 0 && (
          <Card style={{ textAlign: "left", marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>The ones that got away</div>
            <div data-testid="rush-missed" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.missed.map((w) => (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => speak(w.lemma, lang.ttsCode, { audioId: w.id, code: pack.code, translit: w.translit })}
                    aria-label={`Hear ${w.translit || w.lemma}`}
                    style={{ border: "1px solid var(--border)", background: "var(--surface-hi)", borderRadius: 999, width: 34, height: 34, cursor: "pointer", flexShrink: 0 }}
                  >🔊</button>
                  <div style={{ minWidth: 0 }}>
                    <span dir={lang.rtl ? "rtl" : "ltr"} lang={pack.code} style={{ fontWeight: 800, fontFamily: nativeFont(pack.code, lang.rtl) }}>{w.lemma}</span>
                    {nonLatin && w.translit && <span style={{ color: "var(--text-dim)", marginLeft: 8 }}>{w.translit}</span>}
                    <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{w.translation}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              style={{ marginTop: 14 }}
              onClick={() => onNavigate("lesson", { mode: "words", filter: { vocabIds: result.missed.map((w) => w.id) }, sessionSize: Math.min(8, result.missed.length) })}
            >
              Practise {result.missed.length === 1 ? "this one" : `these ${Math.min(8, result.missed.length)}`} properly →
            </Button>
          </Card>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Button variant="secondary" onClick={() => goBack(onNavigate, "hub")}>Done</Button>
          <Button variant={result.missed.length ? "secondary" : undefined} onClick={start}>Play again</Button>
        </div>
      </Container>
    );
  }

  // ---- PLAYING -----------------------------------------------------------
  const mult = comboMultiplier(streak);
  const promptIsNative = q?.dir === "meaning";
  return (
    <Container style={{ paddingBottom: 120, maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div data-testid="rush-live-score" style={{ fontSize: 22, fontWeight: 900 }}>{score}</div>
        <div aria-live="polite" style={{ fontSize: 13, fontWeight: 800, color: mult > 1 ? "var(--accent-text)" : "var(--text-dim)" }}>
          {mult > 1 ? `🔥 ×${mult}` : streak > 0 ? `${streak} in a row` : ""}
        </div>
        <div data-testid="rush-clock" style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: left <= 10 ? "var(--miss)" : "var(--text)" }}>
          {left}s
        </div>
      </div>
      <div style={{ height: 6, background: "var(--surface-hi)", borderRadius: 999, overflow: "hidden", marginBottom: 20 }}>
        <div className="rush-clock-bar" style={{ "--rush-ms": `${seconds * 1000}ms` }} />
      </div>

      <Card style={{ textAlign: "center", padding: "26px 18px", position: "relative", marginBottom: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>{promptIsNative ? "What does it mean?" : `Which is the ${lang.name}?`}</div>
        <div
          data-testid="rush-prompt"
          dir={promptIsNative && lang.rtl ? "rtl" : "ltr"}
          lang={promptIsNative ? pack.code : "en"}
          style={{
            fontSize: promptIsNative ? (nonLatin ? 40 : 34) : 26, fontWeight: 900, overflowWrap: "anywhere",
            fontFamily: promptIsNative ? nativeFont(pack.code, lang.rtl) : "inherit",
            lineHeight: promptIsNative && pack.code === "ur" ? 1.9 : 1.3,
          }}
        >
          {q?.prompt}
        </div>
        {promptIsNative && q?.promptTranslit && nonLatin && (
          <div style={{ fontSize: 16, color: "var(--text-dim)", marginTop: 4 }}>{q.promptTranslit}</div>
        )}
        {pop && <div key={`${attempts}-pop`} className="rush-pop" aria-hidden="true">{pop}</div>}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} data-testid="rush-options">
        {q?.options.map((opt, i) => {
          const isAnswer = picked && opt === q.answer;
          const isWrong = picked === opt && opt !== q.answer;
          const optNative = q.dir === "word";
          return (
            <button
              key={`${attempts}-${i}`}
              onClick={() => answer(opt)}
              className="opt-btn"
              data-answer-key={i + 1}
              style={{
                minHeight: 72, padding: "12px 10px", borderRadius: 14, cursor: "pointer", textAlign: "center",
                fontSize: optNative ? 20 : 15, fontWeight: 800, overflowWrap: "anywhere",
                fontFamily: optNative ? nativeFont(pack.code, lang.rtl) : "inherit",
                direction: optNative && lang.rtl ? "rtl" : "ltr",
                background: isAnswer ? "var(--primary-dark)" : isWrong ? "var(--miss)" : "var(--surface)",
                color: isAnswer ? "var(--on-primary-dark)" : isWrong ? "var(--on-miss)" : "var(--text)",
                border: `2px solid ${isAnswer ? "var(--primary)" : isWrong ? "var(--miss)" : "var(--border)"}`,
              }}
            >
              <span aria-hidden="true" style={{ display: "block", fontSize: 11, opacity: 0.55, fontFamily: "inherit", marginBottom: 2 }} className="desktop-only-key">{i + 1}</span>
              {opt}
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-mute)", marginTop: 14 }}>
        {correct} right · {attempts - correct} missed
      </div>
    </Container>
  );
}
