// =============================================================================
// JOURNEY MAP (v70) — the home screen's journey, drawn as a route.
//
// WHAT WAS WRONG WITH THE OLD ONE. JourneySpine drew a 1.5px vertical line with
// small dots beside a list of sentences. Functionally fine, but it read as a
// checklist: every stop looked identical, there was no sense of terrain, no sense
// of how far you'd come, and chapters didn't exist visually at all. "Your
// journey" was a heading over a to-do list.
//
// THE METAPHOR: a transit route, not a game path. Deliberately NOT the
// bubble-path every language app uses — this is a printed route diagram. A
// continuous line runs down the page through REGIONS (chapters); waypoints are
// stations on it; the line jogs sideways where one region hands over to the next,
// the way a transit map turns a corner. Behind you the line is solid and inked;
// ahead it's dashed and pale. That single change — one drawn line whose weight
// and texture carry state — is what makes it read as distance travelled.
//
// WHAT EACH WAYPOINT SAYS. A station is a CONVERSATION, never a unit number:
// "You can ask where something is". Behind you it's past tense, the current one
// is "Next", ahead is "Then". The current station opens up to show the actual
// exchange, with a listen button and a way straight into the speaking trainer —
// so the map isn't only navigation, it's the thing you practise from.
//
// HONESTY RULE: everything here derives from real unit progress. A station only
// shows as reached when its unit is genuinely 60% learned (stopsReached), and a
// locked station says plainly that it's locked. The map can't overstate what
// someone knows.
// =============================================================================

import React, { useState } from "react";
import { speak } from "../audio/tts.js";
import { GuideMark } from "../ui/GuideMark.jsx";
import { getCharacter } from "../data/characters.js";
import { getChapters } from "../data/journey.js";
import {
  UNITS_PER_CHAPTER, isChapterExamAvailable, hasPassedChapter, chapterVocabIds,
} from "../data/chapters.js";
import { isRecognitionSupported } from "../audio/speech.js";

export function JourneyMap({
  langCode, lang, stops, reached, unitProgress, appState, pack, onNavigate,
}) {
  const chapters = getChapters(langCode);
  const guide = getCharacter(langCode);
  const [openStop, setOpenStop] = useState(null);

  // v78 — THE ROUTE WAS 1,896px OF MOSTLY LOCKED FUTURE.
  //
  // Measured on a 414×896 phone: home was 3,424px, nearly four full screens, and
  // more than half of it was chapters the learner cannot open yet, rendered in
  // full. Someone on lesson three scrolled past forty locked stops to reach the
  // bottom of a page whose only actionable item was in the first screen.
  //
  // Future chapters now collapse to one line each. Nothing is removed — tapping
  // a region opens it, which matters because the test-out doors live inside
  // those stations — but the default view is what you can act on today.
  const [openRegions, setOpenRegions] = useState(() => new Set());
  const toggleRegion = (n) =>
    setOpenRegions((s) => {
      const next = new Set(s);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });

  // Stops are the written content; the course may run past them. Anything beyond
  // the last written stop still needs a way in, handled at the foot of the map.
  const lastMappedUnit = stops.length
    ? Math.max(...stops.map((s) => s.unitIndex))
    : -1;
  const beyond = unitProgress.slice(lastMappedUnit + 1);

  return (
    <div className="route">
      {chapters.map((chapter, ci) => {
        const chapterStart = chapter.startsAt;
        const chapterEnd = chapterStart + chapter.stops.length - 1;
        const doneInChapter = Math.max(0, Math.min(chapter.stops.length, reached - chapterStart));
        const isCurrentChapter = reached >= chapterStart && reached <= chapterEnd;
        const isPastChapter = reached > chapterEnd;
        const isFutureChapter = reached < chapterStart;

        // The checkpoint closing this region IS the real chapter exam — the
        // grouping in getChapters() is sized to guarantee that.
        const examAvailable = isChapterExamAvailable(unitProgress, chapter.number);
        const examPassed = hasPassedChapter(appState, langCode, chapter.number);
        const vocabIds = chapterVocabIds(pack.vocab, chapter.number);
        const showCheckpoint = unitProgress.length > chapter.endsAtUnit + 1;

        // A future chapter is collapsed unless the learner opens it. The one
        // they're in, and the ones behind them, stay open — those are the ones
        // with something to do in them.
        const collapsed = isFutureChapter && !openRegions.has(chapter.number);

        return (
          <section key={chapter.number} className={`route-region${collapsed ? " route-region-shut" : ""}`}>
            {/* ---- region header ---- */}
            <header
              className={`region-head${isFutureChapter ? " region-head-tap" : ""}`}
              onClick={isFutureChapter ? () => toggleRegion(chapter.number) : undefined}
              role={isFutureChapter ? "button" : undefined}
              tabIndex={isFutureChapter ? 0 : undefined}
              aria-expanded={isFutureChapter ? !collapsed : undefined}
              onKeyDown={
                isFutureChapter
                  ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRegion(chapter.number); } }
                  : undefined
              }
            >
              <div className="region-index">{chapter.number}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h4 className="region-title">{chapter.title}</h4>
                <div className="region-sub">
                  {collapsed
                    ? `${chapter.stops.length} stops · tap to look ahead`
                    : chapter.stops
                        .map((s) => unitProgress[s.unitIndex]?.title)
                        .filter(Boolean)
                        .join(" · ") || `${chapter.stops.length} stops`}
                </div>
              </div>
              {isFutureChapter ? (
                <div className="region-caret" aria-hidden="true">{collapsed ? "+" : "−"}</div>
              ) : (
                <div className={`region-count${isPastChapter ? " region-count-done" : ""}`}>
                  {doneInChapter}/{chapter.stops.length}
                </div>
              )}
            </header>

            {/* ---- the stations ---- */}
            {!collapsed && chapter.stops.map((stop, si) => {
              const gi = stop.globalIndex;
              const unit = unitProgress[stop.unitIndex];
              const isDone = gi < reached;
              const isNow = gi === reached;
              const unlocked = !!unit?.unlocked;
              const isLast = si === chapter.stops.length - 1;
              const open = openStop === stop.id || isNow;

              const state = isDone ? "done" : isNow ? "now" : unlocked ? "next" : "locked";

              return (
                <div className={`station station-${state}`} key={stop.id}>
                  {/* gutter: the line and the marker */}
                  <div className="station-gutter">
                    <span className={`station-dot dot-${state}`}>
                      {isDone ? "✓" : isNow ? "" : ""}
                    </span>
                    {(!isLast || showCheckpoint) && (
                      <span className={`station-line ${isDone ? "line-done" : "line-todo"}`} />
                    )}
                  </div>

                  {/* body */}
                  <div className="station-body">
                    {isNow && <div className="you-are-here">You are here</div>}

                    <button
                      className="station-head"
                      onClick={() => {
                        if (isNow || !unlocked) setOpenStop(open && !isNow ? null : stop.id);
                        else setOpenStop(open ? null : stop.id);
                      }}
                      aria-expanded={open}
                    >
                      {/* The tense carries the progression, which only works if
                          the lead-in is right: `done` is a full sentence
                          ("You can greet someone"), but `next` is written to
                          follow a lead-in ("…you'll be able to greet someone"),
                          so rendering it bare leaves a lowercase fragment. */}
                      <span className="station-label">
                        {isDone
                          ? stop.done
                          : isNow
                          ? <><strong>Next</strong> — {stop.next}</>
                          : <>Then {stop.next}</>}
                      </span>
                      {!isNow && (
                        <span className="station-caret" aria-hidden="true">{open ? "−" : "+"}</span>
                      )}
                    </button>

                    {!open && (
                      <div className="station-hint">
                        {isDone
                          ? stop.you.translit
                          : unlocked
                          ? `${stop.they.translit} → ${stop.you.translit}`
                          : "Locked — finish the stop before it"}
                      </div>
                    )}

                    {open && (
                      <div className="station-open">
                        <Exchange stop={stop} lang={lang} langCode={langCode} />

                        <div className="station-actions">
                          {unlocked ? (
                            <button
                              className="station-go"
                              data-unit={unit?.id}
                              onClick={() => onNavigate("lesson", { mode: "unit", filter: { unit: unit.id } })}
                            >
                              {isDone ? "Practise again" : "Learn this"}
                              {unit ? ` · ${unit.learned || 0}/${unit.total || 0} words` : ""}
                            </button>
                          ) : (
                            /* v78 — THE MISSING DOOR.
                               "Test out" existed since v75 but only on the
                               fallback unit list, which renders for the seven
                               languages with no written journey. On every
                               language that HAS a journey — Urdu, Arabic,
                               Punjabi, the ones people actually pick — a locked
                               stop was a dead end with an apology on it. The
                               feature was built and then unreachable for most of
                               the app's users, which from where they sit is the
                               same as never having been built. */
                            <>
                              <div className="station-locked-note">
                                Opens once you've made a start on “{unitProgress[stop.unitIndex - 1]?.title || "the stop before"}”.
                              </div>
                              {unit && (
                                <button
                                  className="station-testout"
                                  /* v79: data-TESTOUT, not data-unit. `data-unit`
                                     means "opens this unit's lesson" — the lesson
                                     fuzz finds every lesson entry point with it —
                                     and putting it on a button that opens a
                                     placement test instead sent the fuzz into the
                                     test and made it report that no lesson opened. */
                                  data-testout={unit.id}
                                  onClick={() => onNavigate("testout", { fromUnit: unit.id })}
                                >
                                  Already know this? Test out →
                                </button>
                              )}
                            </>
                          )}

                          {unlocked && (
                            <button
                              className="station-speak"
                              onClick={() => onNavigate("speak", { stopId: stop.id })}
                              title={isRecognitionSupported()
                                ? "Say it out loud and get judged gently"
                                : "Practise this line (typing — this browser has no microphone support)"}
                            >
                              Say it
                            </button>
                          )}
                        </div>

                        {isNow && guide && (
                          <div className="station-guide">
                            <GuideMark code={langCode} size={26} />
                            <span>
                              {guide.name}: “{stop.you.translit}” — this is the one worth getting comfortable with.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ---- checkpoint closing the region ---- */}
            {showCheckpoint && !collapsed && (
              <Checkpoint
                number={chapter.number}
                available={examAvailable}
                passed={examPassed}
                dim={isFutureChapter}
                onStart={() =>
                  onNavigate("lesson", {
                    mode: "chapter_exam",
                    chapter: chapter.number,
                    filter: { vocabIds },
                    sessionSize: Math.min(10, Math.max(6, vocabIds.length)),
                  })
                }
              />
            )}

            {/* ---- the jog: the line turns a corner into the next region ---- */}
            {ci < chapters.length - 1 && (
              <Jog done={reached > chapterEnd} />
            )}
          </section>
        );
      })}

      {/* Units past the written stops — the curriculum stays fully reachable
          while capability content is still being written for them. */}
      {beyond.length > 0 && (
        <section className="route-region route-beyond">
          <header className="region-head">
            <div className="region-index region-index-open">·</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 className="region-title">Further on</h4>
              <div className="region-sub">Open ground — not mapped into conversations yet</div>
            </div>
          </header>
          <div className="beyond-grid">
            {beyond.map((unit, i) => (
              /* A locked tile is no longer disabled — it opens the placement
                 test for that unit. "Locked" with nothing behind it is the
                 single most common reason someone who already speaks some of
                 the language closes the app. */
              <button
                key={unit.id}
                className={`beyond-tile${unit.unlocked ? "" : " beyond-locked"}`}
                {...(unit.unlocked ? { "data-unit": unit.id } : { "data-testout": unit.id })}
                onClick={() =>
                  unit.unlocked
                    ? onNavigate("lesson", { mode: "unit", filter: { unit: unit.id } })
                    : onNavigate("testout", { fromUnit: unit.id })
                }
              >
                <span className="beyond-name">{unit.title}</span>
                <span className="beyond-meta">
                  {unit.unlocked ? `${unit.learned || 0}/${unit.total || 0} words` : "Locked · test out"}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// The exchange, with audio. Listening is the point of this block — a learner
// looking at a phrase they can't hear has half the information.
// ---------------------------------------------------------------------------
function Exchange({ stop, lang, langCode }) {
  const [playing, setPlaying] = useState(null);
  const dir = lang?.rtl ? "rtl" : "ltr";

  async function play(side) {
    const line = stop[side];
    setPlaying(side);
    try {
      await speak(line.text, lang.ttsCode, { code: langCode, translit: line.translit });
    } finally {
      setPlaying(null);
    }
  }

  return (
    <div className="xchg">
      {["they", "you"].map((side) => {
        const line = stop[side];
        return (
          <div className="xchg-row" key={side}>
            <div className="xchg-side">{side === "they" ? "They say" : "You answer"}</div>
            <div className="xchg-main">
              <div className="xchg-native" dir={dir} lang={langCode}>{line.text}</div>
              <div className="xchg-tl">{line.translit}</div>
              <div className="xchg-en">{line.en}</div>
            </div>
            <button
              className={`xchg-play${playing === side ? " xchg-playing" : ""}`}
              onClick={() => play(side)}
              aria-label={`Listen: ${line.translit}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checkpoint — the gate at the end of a region. Drawn as a bar across the line
// rather than another station, so it reads as a barrier, not a stop.
// ---------------------------------------------------------------------------
function Checkpoint({ number, available, passed, dim, onStart }) {
  const state = passed ? "passed" : available ? "open" : "shut";
  return (
    <div className={`checkpoint checkpoint-${state}`} style={dim ? { opacity: 0.5 } : undefined}>
      <div className="station-gutter">
        <span className={`gate-mark gate-${state}`} aria-hidden="true" />
        <span className={`station-line ${passed ? "line-done" : "line-todo"}`} />
      </div>
      <button
        className="checkpoint-body"
        onClick={() => available && !passed && onStart()}
        disabled={!available || passed}
      >
        <div className="checkpoint-title">
          Checkpoint {number}
          {passed && <span className="checkpoint-badge">Cleared</span>}
        </div>
        <div className="checkpoint-sub">
          {passed
            ? "Retake any time to refresh it"
            : available
            ? "Ready — clear it to open the next region · 70% to pass, unlimited retries"
            : "Finish this region's stops to open the checkpoint"}
        </div>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The jog. A short S-curve where the route changes direction between regions —
// the one flourish that stops the map reading as a straight list.
// ---------------------------------------------------------------------------
function Jog({ done }) {
  // Fixed pixel width, not 100% — the path has to start and end exactly on the
  // 22px gutter's centre line (x=11) or the route visibly breaks at every
  // region boundary. A percentage width would rescale x=11 to something else.
  return (
    <div className="jog" aria-hidden="true">
      <svg width="120" height="34" viewBox="0 0 120 34">
        <path
          d="M11 0 C 11 13, 62 10, 62 17 C 62 24, 11 21, 11 34"
          fill="none"
          stroke={done ? "var(--root)" : "var(--border)"}
          strokeWidth="1.6"
          strokeDasharray={done ? "none" : "4 5"}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
