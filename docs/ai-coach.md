# The AI conversation coach

At the end of a Speak session the learner is offered a real conversation with
their guide: they say something, the guide answers in the target language out
loud, corrects one thing gently, and asks something back. It's the difference
between practising lines and having a conversation — and it sits where it does
on purpose, as the thing you graduate to after controlled practice.

It is **entirely optional**. Everything else in the app works without it.

---

## Turning it on

You need an Anthropic API key: <https://console.anthropic.com/settings/keys>

### On Vercel (the deployed site)

1. Vercel → your project → **Settings → Environment Variables**
2. Add `ANTHROPIC_API_KEY` = your key, for **Production** (and Preview if you
   want it on preview deploys)
3. **Redeploy.** Environment variables are read at build/run time, so an existing
   deployment won't pick up a new variable until it redeploys.

That's it. The offer appears at the end of the next Speak session.

Until a key is set, the result screen says so in as many words rather than
silently hiding the feature — an option that vanishes without explanation reads
as a bug.

### Locally

```sh
cp .env.example .env.local     # then paste your key into it
npx vercel dev                 # NOT `npm run dev`
```

`npm run dev` is plain Vite — it serves the app but has no `/api` routes, so the
coach is reported as unconfigured. `vercel dev` runs the serverless function
alongside it.

---

## What it costs

Each turn is roughly 600 input + 200 output tokens. On the default
`claude-opus-5` ($5 / $25 per million tokens) that's about **half a cent per
turn** — a 20-turn practice session is around 10¢.

To spend less, set `COACH_MODEL=claude-sonnet-5` (or `claude-haiku-4-5`) in the
same environment-variable screen. The conversation quality drops a little; the
plumbing is identical.

---

## ⚠️ Read this before you deploy with a key

**Once live, `/api/coach` is a public endpoint, and every call spends your
Anthropic credit.** Anyone who finds the URL can run up your bill.

What's already in place (`api/coach.js`):

| Guard | Value |
|---|---|
| Request body cap | 16 KB |
| Conversation history cap | 12 turns |
| Single turn cap | 400 characters |
| `max_tokens` per reply | 4096 |
| Per-IP throttle | 20 requests/minute (`/api/coach`), 8/minute (`/api/scenario`) |
| Persona / pressure / region prompt caps | 700 / 500 / 500 characters |
| Learner brief cap | 900 characters |
| Mission objectives | 8 max, ids 40 chars, labels 120 chars |
| Scenario description cap | 300 characters |

**The throttle is best-effort only.** It lives in process memory, so on
serverless it resets on every cold start and isn't shared between concurrent
instances. It stops a casual loop; it does not stop someone determined.

If this is a personal project on a URL you don't advertise, the caps above are
probably proportionate. If you share the link widely, add one of:

- A Vercel [Firewall rate limit](https://vercel.com/docs/security/vercel-firewall)
  on `/api/coach` — the least work, and it runs before your function does
- Auth in front of the endpoint, so only signed-in users can spend credit
- A spend cap on the Anthropic key itself, in the console

Set a budget alert on your Anthropic account either way.

---

## How it degrades

Failure is a designed path, not an afterthought. In every case below the learner
keeps a working app:

| Situation | What happens |
|---|---|
| No `ANTHROPIC_API_KEY` | `/api/coach` returns 501; the result screen and the Missions list both explain what's missing and how to enable it |
| Learner is offline | Turn fails with "couldn't reach the coach"; earlier turns stay on screen |
| Anthropic is down / rate limited | An honest one-line message plus a **try again** link |
| Reply takes over 30s | Times out rather than hanging |
| Model declines the request | Handled as a refusal, not a crash — the coach steers back to the conversation |
| Browser has no microphone (Firefox) | Type instead; the grading is identical |

---

## Design decisions worth knowing

**The key never reaches the browser.** All model calls go through
`api/coach.js`. Anything named `VITE_*` gets compiled into the client bundle, so
the key deliberately is not named that.

**The learner's words never enter the system prompt.** They go in a user turn.
System-prompt interpolation is how prompt injection gains authority, and the
system prompt also tells the model to treat instruction-override attempts as
off-topic.

**Replies come back as structured JSON**, not prose:
`{reply_native, reply_translit, reply_en, verdict, coaching, suggestion,
corrections, fluent_version, objectives_met, mission_over}`. The
client needs to know which part is the target language (spoken in the target
voice) and which part is English coaching (spoken in an English voice) — prose
would have to be guessed at.

**The coach's voice is English, the guide's line is not.** `src/audio/voice.js`
runs one sequential speech queue so the two never overlap, and the microphone
waits for it to finish — otherwise the recogniser transcribes the coach and
grades the learner on the coach's own words.

**`judge()` in `src/audio/speech.js` is the grading seam.** The local scorer runs
on-device with no API cost. If you ever want the model to grade pronunciation too,
that one function is the only thing that has to change.

---

## v73 — what the coach now knows (memory, missions, corrections)

The endpoint takes four more optional inputs. All of them are composed on the
client and all of them are capped and placed in clearly-labelled sections of the
system prompt rather than spliced into the instruction voice:

| Input | Comes from | What it does |
|---|---|---|
| `learnerBrief` | `summariseForPrompt()` in `src/engine/profile.js` | A few hundred characters of what this learner keeps getting wrong, what they're solid on, and the level to pitch at. This is the memory — it's why the coach doesn't start from zero every session. |
| `personaPrompt` + `pressurePrompt` | `src/data/personas.js` | Who they're talking to. A strict teacher, a sarcastic friend, an interviewer, someone in a hurry — and how much conversational pressure to apply. |
| `regionPrompt` | `src/data/personas.js` | Which variety. Rioplatense vs peninsular Spanish, Egyptian vs Levantine Arabic. |
| `mission` | `src/data/missions.js` or `/api/scenario` | The scene, the objectives, and what ends it badly. |

And returns three more:

- **`corrections`** — structured, at most two, each with a stable kebab-case `id`
  reused across sessions so repeats can be counted. The `id` stability is what
  makes "you've done this four times" possible; inconsistent ids break it.
- **`fluent_version`** — the learner's own sentence rewritten as a native would
  say the same thing. Their meaning, upgraded — not a different sentence.
- **`objectives_met`** — cumulative ids of mission objectives satisfied so far.

**Objective ids are validated twice.** The server discards any id that isn't in
the mission the client sent, and `Missions.jsx` filters again before counting
toward the pass mark. A hallucinated id must never hand out a pass nobody earned.

### `/api/scenario`

A separate function that turns a sentence the learner types ("I have to ring the
letting agent about the boiler") into a real mission with checkable objectives
and fail conditions. Same rules: key stays server-side, 501 when unconfigured,
the learner's description goes in a **user** turn, and the system prompt tells the
model to treat that description as a situation to model — never as instructions.

The model writes the objectives because the client can't: inferring "ask when
they can come" from free text without guessing is impossible, and a guessed
objective is a fabricated pass.

---

## Testing

```sh
npm run test-coach     # exercises api/coach.js + api/scenario.js with the network stubbed — costs nothing
npm run test-engine    # profile, fluency scoring, missions and personas — pure logic, no network
npm run check          # everything: validators, speech + generator + engine + coach tests, build
```

There's also a full browser walk-through of the mission flow with both endpoints
stubbed. It needs Playwright, which isn't a dependency of this project, so it
isn't part of `npm run check`:

```sh
npm run build && npx vite preview --port 4173 &
node scripts/verify-browser.mjs
```

It drives the real UI at 414px and 1440px: opens a mission, changes the persona,
sends turns, and asserts that the correction renders on the learner's own line,
that objectives tick off, that the turn lands in the stored profile, and that
**the next conversation's brief contains the error made in the previous one**.
That last assertion is the memory loop, proven end to end rather than claimed.

`test-coach` stubs `fetch`, so the real SDK builds a real request and the test
asserts on what went over the wire — model id, token headroom, JSON schema,
refusal handling, error mapping, and that learner text stays out of the system
prompt. What it can't check is whether Anthropic accepts the request; that needs
a real key.
