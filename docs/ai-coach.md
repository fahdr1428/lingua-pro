# The AI conversation coach

The **Live coach** tab in Speak holds an actual conversation with the learner:
they say something, the guide answers in the target language out loud, corrects
one thing gently, and asks something back. It's the difference between practising
lines and having a conversation.

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

That's it. The **Live coach** tab appears on its own the next time the app loads.

### Locally

```sh
cp .env.example .env.local     # then paste your key into it
npx vercel dev                 # NOT `npm run dev`
```

`npm run dev` is plain Vite — it serves the app but has no `/api` routes, so the
coach tab won't appear. `vercel dev` runs the serverless function alongside it.

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
| Per-IP throttle | 20 requests/minute |

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
| No `ANTHROPIC_API_KEY` | `/api/coach` returns 501; the tab never appears; scripted partner is used |
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
`{reply_native, reply_translit, reply_en, verdict, coaching, suggestion}`. The
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

## Testing

```sh
npm run test-coach     # exercises api/coach.js with the network stubbed — costs nothing
npm run check          # everything: validators, speech + generator + coach tests, build
```

`test-coach` stubs `fetch`, so the real SDK builds a real request and the test
asserts on what went over the wire — model id, token headroom, JSON schema,
refusal handling, error mapping, and that learner text stays out of the system
prompt. What it can't check is whether Anthropic accepts the request; that needs
a real key.
