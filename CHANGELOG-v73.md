# v73 — from conversation simulator to fluency engine

The brief was blunt and correct:

> Your app is a conversation simulator. But users want a fluency engine.
> No memory, no adaptation, no pressure, no outcome. It doesn't train the user —
> it just chats.

And the priority was explicit: **real-time corrections, memory + personalisation,
fluency scoring**. Those three are the spine of this release. Everything else was
built on top of them or left out and said so.

---

## The three that mattered

### 1. Memory — `src/engine/profile.js`

One profile per language, written on every graded utterance, read on every model
request.

It stores what actually went wrong (grouped into recurring *patterns*, not one-off
slips), per-topic confidence that **decays** with time, a dated fluency history,
mission results, and the set of distinct words the learner has genuinely produced
out loud — which is a far smaller set than words they recognise in a lesson.

`summariseForPrompt()` compresses all of it into a few hundred characters that
ride on every `/api/coach` call. That's the loop: the coach opens each session
already knowing you keep dropping the past-tense ending, that you're fine at
greetings and freeze at directions.

Two rules the file keeps:

- **Never invent a number.** Not enough evidence → `null`, and the UI shows `—`.
- **Stay small.** A wall of text buries the instructions that matter.

**Adaptive difficulty** falls out of it: `difficultyFor()` returns 1–5 from a
rolling window of real scores. Deliberately sticky — one bad turn is noise, and
whiplash difficulty is worse than difficulty that's slightly wrong. It refuses to
move at all until there are six graded attempts behind it.

### 2. Real-time corrections — `api/coach.js` + `src/ui/LiveConversation.jsx`

The coach now returns structured corrections, and they render **attached to the
learner's own bubble** — the fragment struck through, the native version beside
it, one line on why, and a microphone to say it correctly on the spot. Not a
lecture at the end of a session that nobody reads.

Each correction carries a stable kebab-case `id` that's reused across sessions,
which is what makes "you've done this four times" possible rather than
decorative.

Alongside it, `fluent_version`: the learner's own sentence rewritten as a native
would say **the same thing**. Their meaning, their intent, upgraded.

### 3. Fluency score — `src/engine/fluency.js`

One number out of 100, and the four real things behind it:

| Dimension | Measured from |
|---|---|
| **Accuracy** | recency-weighted mean grade across recent utterances |
| **Responsiveness** | milliseconds from prompt-ready to your **first word** — measured from the microphone, not guessed |
| **Range** | distinct words genuinely produced out loud, against a 350-word band |
| **Pronunciation** | similarity score from the speech grader, **microphone attempts only** |

A score people don't believe is worse than no score, so the dashboard shows its
own working: how many data points each dimension has, what unlocks the ones that
are still `—`, and a `provisional` flag while the number is still moving a lot
per session. Typed answers never touch pronunciation. Typing speed never touches
responsiveness. A learner who has only typed still gets a meaningful overall,
renormalised over the dimensions they actually earned.

---

## The rest of the list

| Asked for | Built | Notes |
|---|---|---|
| **Personality mode** | ✅ | 5 personas (friendly, strict teacher, sarcastic friend, interviewer, in a hurry), each changing tone, correction style and pressure. Every high-pressure persona carries an explicit civility floor — demanding is not cruel, and that's enforced by a test. |
| **Real-life missions** | ✅ | 10 hand-written, plus custom. Each has checkable objectives, fail conditions (always including "switching to English"), a persona and a pressure level. They can be **failed**. |
| **Pressure / stress engine** | ✅ | Pressure 0–3, independent of persona, so a mission can tense up a friendly native without rewriting their character. |
| **Accent / region mode** | ✅ | Rioplatense vs peninsular vs Mexican Spanish; MSA vs Egyptian vs Levantine Arabic; Québec vs France; Taiwan vs Mainland; Pakistan vs India. |
| **Scenario generator** | ✅ | `/api/scenario` — you describe the situation you're actually dreading, and the model builds a mission with real objectives. The model writes them because the client honestly cannot. |
| **Replay & fix** | ✅ | The mission debrief replays every line you said, what a native would have said, and lets you say it again into the microphone and be graded. |
| **Goal-based learning** | ✅ | Missions are ordered by your goal and your history — unfinished first, passed last. The goal also reaches the coach's brief. |
| **Retention loop** | ✅ | Not a streak that punishes you for having a life: a number that moves when you speak and visibly softens when you don't, plus a mission counter that's a real answer to "do you speak Arabic?" |
| **AI twin** | ⚠️ partial | Built as **your own sentences upgraded** (`fluent_version` + Replay & Fix). A synthesised clone of the learner's voice needs a voice-cloning API this app doesn't have, and faking it would be worse than not shipping it. |
| **Multiplayer** | ❌ | Not built. It needs a backend, matchmaking, presence and realtime transport — none of which exist here (storage is `localStorage` behind an adapter). Shipping a fake version would be worse than shipping none. |

---

## Bugs found and fixed while building this

- **`recordTurn` never persisted the `spoken` flag.** `fluency.js` computes
  pronunciation from microphone attempts only — so with the flag dropped, the
  pronunciation dimension could **never** have shown a number, in any session,
  ever. Caught by `scripts/test-engine.mjs` asserting that spoken attempts *do*
  produce a score, rather than only asserting that typed ones don't.
- **`weakTopics()` contradicted itself.** It returned the bottom N topics
  regardless of whether they were actually weak, so a learner with two topics at
  95% and 100% got "least confident on Greetings … comfortable with Greetings" in
  the same model brief. Now gated on real thresholds with a deliberate gap
  between them, and a separate `strongTopics()`.
- **The interviewer persona had no civility floor** while running at pressure 3.
  Every other high-pressure persona had one.
- **Objective ids were validated in only one place.** The server discards ids not
  in the mission; the client now filters again before counting toward the pass
  mark, because that count is what hands out the pass.

---

## Verification

```sh
npm run check            # validators + speech + generator + engine + coach tests + build
```

- `scripts/test-engine.mjs` — **67 assertions**. New learner claims nothing;
  difficulty adapts from 2 → 5 for a strong speaker and → 1 for a struggling one
  and refuses to move on 5 turns of evidence; confidence decays over 12 weeks;
  a stale error stops being reported; identical accuracy at 1.2s vs 11s latency
  produces different overalls while accuracy stays equal; recent failure
  outweighs an old perfect record; storage is bounded; every mission is
  failable and reachable.
- `scripts/test-coach-api.mjs` — **58 assertions** against both endpoints with
  the network stubbed. Persona/region/mission/brief reach the system prompt;
  learner text never does; hallucinated objective ids are discarded; oversized
  inputs are capped rather than rejected; refusals, rate limits and upstream
  failures all map to honest messages with no key leakage.
- `scripts/verify-browser.mjs` — **78 assertions** in headless Chromium at 414px
  and 1440px, including the whole mission flow with both endpoints stubbed. The
  one that matters most: after an error is made twice in one conversation, the
  **next** conversation's request carries that error in its brief. The memory
  loop, proven rather than claimed.

The built bundle contains no Anthropic SDK, no key-shaped strings, and the only
occurrence of `ANTHROPIC_API_KEY` is the UI copy telling the deployer to set it.
