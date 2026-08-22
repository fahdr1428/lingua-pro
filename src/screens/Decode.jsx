// =============================================================================
// DECODE (v78) — "what does this actually say?"
//
// THE GAP THIS FILLS. Every large language app teaches from a closed set of
// sentences it wrote itself. That is a reasonable way to build a course and it
// is why none of them can help with the thing that actually happens: a message
// arrives from your mum, your khala, your abuela, your teta — and you can't read
// it. Heritage speakers overwhelmingly understand their family's language
// spoken and cannot read a line of it, because school taught them English
// literacy and nothing taught them this. They are not beginners in the language.
// They are beginners in the script, and no beginner course is aimed at them.
//
// So this screen takes whatever is on their phone. Paste it, and get:
//
//   - what it means, naturally, and word-for-word in the original order so you
//     can see how the language builds a sentence
//   - who talks like that — the register, which is the thing heritage speakers
//     most often cannot judge and most often get wrong
//   - every word, with the dictionary form next to the form as written, and a
//     note when they differ, which is where reading a script is actually learned
//   - HOW MANY OF THESE WORDS YOU ALREADY KNOW, counted against your own deck.
//     This is the emotional core of the screen. Someone who thinks they know
//     nothing pastes a message and finds out they already knew eleven of the
//     sixteen words in it. Nothing else in the app can tell them that, because
//     nothing else in the app is looking at their real life.
//   - something they could send back. Understanding a message you cannot answer
//     is half a rescue.
//
// Saved words become ordinary SRS cards (see Engine.addCustomWords) — the same
// scheduler, the same reviews. A word from your grandmother's message is worth
// more than a word from a course, and it should be treated at least as well.
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { LANGUAGES } from "../data/registry.js";
import { getCharacter } from "../data/characters.js";
import { GuideMark } from "../ui/GuideMark.jsx";
import { speak } from "../audio/tts.js";
import { guideVoice } from "../data/characters.js";
import { decodeText, probeDecode, MAX_DECODE_CHARS } from "../ai/decode.js";
import { CoachError } from "../ai/coach.js";
import { getRegion } from "../data/personas.js";
import { NeedsConnection, useOffline } from "../ui/Offline.jsx";
import { AiGate, aiAccepted, AiBadge, ReportAi } from "../ui/AiDisclosure.jsx";
import { masteryLevel } from "../engine/srs.js";

// Proper nouns aren't vocabulary. Neither are bare particles in most languages —
// they're better learned in place than as flashcards.
const NOT_WORTH_SAVING = new Set(["name"]);

export function Decode({ engine, pack, appState, setAppState, profile, onNavigate }) {
  const offline = useOffline();
  const lang = LANGUAGES[pack.code];
  const guide = getCharacter(pack.code);
  const voice = guideVoice(pack.code);

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(null);      // null = probing
  const [progress, setProgress] = useState({});
  const [chosen, setChosen] = useState(() => new Set());
  const [saved, setSaved] = useState(null);      // { added, already }
  const [mine, setMine] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    let live = true;
    probeDecode().then((p) => { if (live) setReady(!!p.configured); });
    return () => { live = false; };
  }, []);

  const reloadMine = useCallback(async () => {
    setMine(await engine.getCustomWords());
    setProgress(await engine.getProgress());
  }, [engine]);

  useEffect(() => { reloadMine(); }, [reloadMine]);

  // ---------------------------------------------------------------------------
  // The count that makes this screen worth opening. Matched on the dictionary
  // form against the learner's own progress, case-insensitively, because a pack
  // and a model will not always agree on capitalisation.
  // ---------------------------------------------------------------------------
  const known = useMemo(() => {
    if (!result?.tokens?.length) return null;
    const key = (s) => String(s || "").trim().toLowerCase();
    const byLemma = new Map();
    for (const v of pack.vocab || []) {
      if (!byLemma.has(key(v.lemma))) byLemma.set(key(v.lemma), v);
      // A learner reading real text will meet the romanised form too.
      if (v.translit && !byLemma.has(key(v.translit))) byLemma.set(key(v.translit), v);
    }

    const teachable = result.tokens.filter((t) => !NOT_WORTH_SAVING.has(t.role));
    const marks = teachable.map((t) => {
      const match = byLemma.get(key(t.lemma)) || byLemma.get(key(t.native));
      if (!match) return { token: t, state: "new" };
      const card = progress[match.id];
      if (!card) return { token: t, state: "course", match };   // in your course, not reached yet
      // masteryLevel returns 0-5; 0 means it has a card but was never reviewed.
      const level = masteryLevel(card);
      return { token: t, state: level === 0 ? "course" : "known", match, level };
    });

    return {
      marks,
      total: teachable.length,
      knownCount: marks.filter((m) => m.state === "known").length,
      newCount: marks.filter((m) => m.state === "new").length,
    };
  }, [result, pack.vocab, progress]);

  // New words start pre-selected: the learner asked to understand this, and the
  // words they didn't know are the answer to that. They can untick any.
  //
  // Keyed on the RESULT, not on `known`. `known` is derived from progress, and
  // saving changes progress — so an effect watching `known` re-fired the instant
  // you pressed save, wiped `saved` back to null, and the confirmation never
  // appeared even though the words had gone in. Found by the browser test, which
  // checked storage as well as the screen and so caught the two disagreeing.
  const initialisedFor = useRef(null);
  useEffect(() => {
    if (!known || initialisedFor.current === result) return;
    initialisedFor.current = result;
    setChosen(new Set(known.marks.filter((m) => m.state === "new").map((m) => m.token.lemma)));
    setSaved(null);
  }, [known, result]);

  async function run() {
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const region = getRegion(pack.code, profile?.region);
      const data = await decodeText({
        text: t,
        langName: lang.name,
        regionPrompt: region?.prompt || "",
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof CoachError ? e.message : "Couldn't break that one down.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!known || !chosen.size) return;
    const picked = known.marks
      .filter((m) => chosen.has(m.token.lemma) && m.state !== "known")
      .map((m) => ({
        lemma: m.token.lemma,
        translit: m.token.translit,
        translation: m.token.meaning,
        source: text.trim().slice(0, 200),
      }));
    const res = await engine.addCustomWords(picked);
    setSaved(res);
    await reloadMine();
  }

  function toggle(lemma) {
    setChosen((s) => {
      const next = new Set(s);
      next.has(lemma) ? next.delete(lemma) : next.add(lemma);
      return next;
    });
  }

  // ---------------------------------------------------------------------------
  // Gates. This is an AI feature and sends the learner's pasted text off the
  // device, so it sits behind exactly the same consent as the conversation.
  // ---------------------------------------------------------------------------
  if (!aiAccepted(appState)) {
    return (
      <Shell lang={lang} guide={guide} code={pack.code} onNavigate={onNavigate}>
        <AiGate
          appState={appState}
          setAppState={setAppState}
          guideName={guide?.name}
          langName={lang.name}
          onDecline={() => onNavigate("home")}
          onNavigate={onNavigate}
        />
      </Shell>
    );
  }

  // v81: said up front rather than after a request that was never going to work.
  if (offline) {
    return (
      <Shell lang={lang} guide={guide} code={pack.code} onNavigate={onNavigate}>
        <div className="speak-body"><NeedsConnection what="Decoding" /></div>
      </Shell>
    );
  }

  if (ready === false) {
    return (
      <Shell lang={lang} guide={guide} code={pack.code} onNavigate={onNavigate}>
        <div className="speak-body">
          <div className="result-locked">
            <b>Decoding needs the AI to be set up.</b> It reads a piece of real
            {" "}{lang.name} and breaks it down, which needs an Anthropic API key
            on the deployment (<code>ANTHROPIC_API_KEY</code>). Everything else in
            the app works without it.
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell lang={lang} guide={guide} code={pack.code} onNavigate={onNavigate}>
      <div className="speak-body">
        {!result && (
          <>
            <p className="intro-sub" style={{ margin: "0 0 6px" }}>
              A message from a relative. A sign in a photo. A line of a song, a
              recipe, a form you've been putting off. Paste it and find out what
              it says — and how much of it you already knew.
            </p>
            <div className="decode-privacy">
              <AiBadge />
              <span>
                What you paste goes to our server and to Anthropic to be read, and
                comes straight back. It isn't stored anywhere — but it's often
                someone else's private message, so it's worth knowing before you
                paste it.{" "}
                <button className="quiet-link" onClick={() => onNavigate("legal", { policy: "privacy", back: "decode" })}>
                  what leaves this device
                </button>
              </span>
            </div>

            <textarea
              ref={inputRef}
              className="decode-input"
              dir="auto"
              rows={5}
              value={text}
              maxLength={MAX_DECODE_CHARS}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Paste ${lang.name} here…`}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="decode-count">
              {text.length}/{MAX_DECODE_CHARS}
            </div>

            <button className="btn-hero" onClick={run} disabled={busy || !text.trim()}>
              {busy ? "Reading it…" : "What does this say?"}
            </button>
            {error && <div className="coach-error" style={{ marginTop: 12 }}>{error}</div>}

            {mine.length > 0 && (
              <SavedWords
                mine={mine}
                lang={lang}
                langCode={pack.code}
                progress={progress}
                onDrill={() => onNavigate("lesson", { mode: "unit", filter: { unit: "custom" }, sessionSize: Math.min(10, mine.length) })}
                onForget={async (id) => { await engine.removeCustomWord(id); reloadMine(); }}
              />
            )}
          </>
        )}

        {result && (
          <Breakdown
            result={result}
            known={known}
            chosen={chosen}
            onToggle={toggle}
            saved={saved}
            onSave={save}
            lang={lang}
            langCode={pack.code}
            voice={voice}
            appState={appState}
            setAppState={setAppState}
            source={text}
            onAgain={() => { setResult(null); setText(""); setSaved(null); }}
            onDrill={() => onNavigate("lesson", { mode: "unit", filter: { unit: "custom" }, sessionSize: 8 })}
          />
        )}
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------------------
function Shell({ lang, guide, code, onNavigate, children }) {
  return (
    <div className="speak-screen">
      <header className="speak-bar">
        <button className="speak-close" aria-label="Close" onClick={() => onNavigate("home")}>✕</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Decode</div>
          <div className="speak-title">What does this {lang.name} say?</div>
        </div>
        {guide && <GuideMark code={code} size={34} />}
      </header>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// THE BREAKDOWN
// ---------------------------------------------------------------------------
function Breakdown({
  result, known, chosen, onToggle, saved, onSave, lang, langCode, voice,
  appState, setAppState, source, onAgain, onDrill,
}) {
  const rtl = lang.rtl;

  if (!result.isTarget) {
    return (
      <div className="result-card">
        <h2 className="result-title">That doesn't look like {lang.name}</h2>
        <p className="result-sub">
          {result.detectedNote || "Try pasting something written in the language you're learning."}
        </p>
        <div className="result-actions">
          <button className="btn-hero btn-hero-sm" onClick={onAgain}>Try something else</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ---- the headline number ---- */}
      {known && known.total > 0 && (
        <div className="decode-score">
          <div className="decode-score-big">
            {known.knownCount}<span>/{known.total}</span>
          </div>
          <div className="decode-score-text">
            {known.knownCount === 0
              ? `All new to you — that's ${known.total} words this one message is worth.`
              : known.knownCount === known.total
              ? "You knew every word in this. You can read this already."
              : `You already knew ${known.knownCount} of the ${known.total} words in this.` +
                (known.newCount ? ` ${known.newCount} ${known.newCount === 1 ? "is" : "are"} new.` : "")}
          </div>
        </div>
      )}

      {/* ---- what it means ---- */}
      <div className="decode-meaning">
        <div className="eyebrow">What it means</div>
        <p className="decode-natural">{result.natural}</p>
        {result.literal && result.literal !== result.natural && (
          <p className="decode-literal">
            <span className="decode-literal-tag">word for word</span>
            {result.literal}
          </p>
        )}
        {result.register && <p className="decode-register">{result.register}</p>}
        <ReportAi
          text={[result.natural, result.register].filter(Boolean).join(" | ")}
          context={{ where: "decode", lang: langCode }}
          appState={appState}
          setAppState={setAppState}
        />
      </div>

      {/* ---- word by word ---- */}
      <div className="eyebrow" style={{ marginTop: 22, marginBottom: 8 }}>Word by word</div>
      <div className="decode-tokens">
        {result.tokens.map((t, i) => {
          const mark = known?.marks.find((m) => m.token === t);
          const state = mark?.state || "skip";
          const picked = chosen.has(t.lemma);
          const savable = state === "new" || state === "course";
          return (
            <div className={`decode-tok decode-tok-${state}`} key={i}>
              <button
                className="decode-tok-say"
                onClick={() => speak(t.lemma, lang.ttsCode, { ...voice, translit: t.translit })}
                aria-label={`Hear ${t.translit}`}
              >
                <span className="decode-tok-native" dir={rtl ? "rtl" : "ltr"} lang={langCode}>{t.native}</span>
              </button>
              <div className="decode-tok-body">
                <div className="decode-tok-translit">{t.translit}</div>
                <div className="decode-tok-meaning">{t.meaning}</div>
                {t.note && <div className="decode-tok-note">{t.note}</div>}
                {t.lemma !== t.native && (
                  <div className="decode-tok-lemma">
                    dictionary form: <span dir={rtl ? "rtl" : "ltr"} lang={langCode}>{t.lemma}</span>
                  </div>
                )}
              </div>
              <div className="decode-tok-right">
                {state === "known" && <span className="decode-flag decode-flag-known">you know this</span>}
                {state === "name" && <span className="decode-flag">name</span>}
                {savable && (
                  <label className="decode-pick">
                    <input type="checkbox" checked={picked} onChange={() => onToggle(t.lemma)} />
                    <span>save</span>
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {result.grammarNote && (
        <div className="decode-grammar">
          <div className="eyebrow">Why it's built that way</div>
          <p>{result.grammarNote}</p>
        </div>
      )}

      {/* ---- how to answer ---- */}
      {result.reply?.native && (
        <div className="decode-reply">
          <div className="eyebrow">You could send back</div>
          <button
            className="decode-reply-line"
            onClick={() => speak(result.reply.native, lang.ttsCode, { ...voice, translit: result.reply.translit })}
          >
            <span className="decode-reply-native" dir={rtl ? "rtl" : "ltr"} lang={langCode}>{result.reply.native}</span>
            <span className="decode-reply-tl">{result.reply.translit}</span>
            <span className="decode-reply-en">{result.reply.en}</span>
          </button>
          <button
            className="quiet-link"
            onClick={() => navigator.clipboard?.writeText(result.reply.native)}
          >
            copy it
          </button>
        </div>
      )}

      {/* ---- save ---- */}
      <div className="decode-save">
        {saved ? (
          <div className="decode-saved">
            {saved.added > 0
              ? `${saved.added} ${saved.added === 1 ? "word" : "words"} added to your reviews. They'll come back on the same schedule as everything else.`
              : "Those are all in your deck already."}
            {saved.added > 0 && (
              <button className="btn-hero btn-hero-sm" style={{ marginTop: 10 }} onClick={onDrill}>
                Drill them now
              </button>
            )}
          </div>
        ) : (
          <button className="btn-hero" onClick={onSave} disabled={!chosen.size}>
            {chosen.size
              ? `Add ${chosen.size} ${chosen.size === 1 ? "word" : "words"} to my reviews`
              : "Tick the words you want to keep"}
          </button>
        )}
        <button className="btn-quiet" onClick={onAgain}>Decode something else</button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
function SavedWords({ mine, lang, langCode, progress, onDrill, onForget }) {
  const [open, setOpen] = useState(false);
  const learned = mine.filter((w) => progress[w.id] && masteryLevel(progress[w.id]) >= 2).length;

  return (
    <div className="decode-mine">
      <button className="decode-mine-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>
          <b>{mine.length} {mine.length === 1 ? "word" : "words"} from your own life</b>
          <span className="decode-mine-sub">
            {learned > 0 ? `${learned} of them sticking` : "in your reviews now"}
          </span>
        </span>
        <span className="region-caret" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <>
          <div className="decode-mine-list">
            {mine.slice(0, 40).map((w) => (
              <div className="decode-mine-row" key={w.id}>
                <span className="decode-mine-native" dir={lang.rtl ? "rtl" : "ltr"} lang={langCode}>{w.lemma}</span>
                <span className="decode-mine-gloss">{w.translit} · {w.translation}</span>
                <button className="decode-forget" onClick={() => onForget(w.id)} aria-label={`Forget ${w.translit}`}>
                  forget
                </button>
              </div>
            ))}
          </div>
          <button className="btn-quiet" onClick={onDrill}>Drill just these</button>
        </>
      )}
    </div>
  );
}
