# v97 — the rate limit was a suggestion

The three AI endpoints (`/api/coach`, `/api/decode`, `/api/scenario`) each kept a
per-IP throttle. They were the only thing standing between an unauthenticated
endpoint and a bill on the operator's Anthropic key. All three found the IP the
same way:

```js
const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
```

`x-forwarded-for` is a **chain** — `<client>, <proxy>, <proxy>` — and everything
to the left of the entry your own proxy appended is whatever the caller typed.
Taking `[0]` reads a value the caller controls:

```
for i in 1..1000: POST /api/coach   X-Forwarded-For: <random>
```

A thousand different visitors, as far as the limiter was concerned. The limit
never fired. This is not a theoretical bypass; it is a two-line shell loop.

## What replaced it

`api/_guard.js` (the `_` prefix means Vercel does not deploy it as a route):

**The address comes only from what the caller cannot set.** `x-vercel-forwarded-for`
first — Vercel writes it and strips inbound copies — then `x-real-ip`, then, as a
last resort, the **rightmost** forwarded entry, which is the one the nearest proxy
appended. Never the leftmost.

**Three levels, because one is never enough.**

| level | bounds | why it exists |
|---|---|---|
| per endpoint | coach 20/min · decode 10/min · scenario 8/min | a chatty endpoint and an expensive one need different numbers |
| per caller | 25/min summed across endpoints | separate buckets alone handed one caller 20 + 10 + 8 = **38** |
| per instance | 120/min, whoever is asking | the only level that survives someone rotating addresses |

The last two are `AI_MAX_PER_CALLER` and `AI_MAX_PER_MINUTE`, so an operator can
tune them to a budget without editing code.

## Why you should believe it's fixed

A security test that has never failed proves nothing. Before keeping the fix I
put the old derivation back and ran the suite against it:

```
FAIL a spoofed x-forwarded-for does not become the identity — got 1.2.3.4
FAIL rotating x-forwarded-for does NOT buy more calls — never refused, the bypass is open
6 pass, 6 fail
```

Then restored the fix:

```
ok   rotating x-forwarded-for does NOT buy more calls
ok   a per-instance ceiling stops address rotation
12 pass, 0 fail
```

`npm run test-api-guard` is in `npm run check`, so the bypass cannot come back
quietly.

## A regression the existing tests caught

The first design used one bucket per caller and applied *each endpoint's* maximum
to it. Ten Decode calls then locked the learner out of Scenario, whose maximum is
eight — have a conversation, and you can no longer build a mission. `test-coach-api.mjs`
failed within a minute of the change (`too-short description is rejected before
the API call → 429`), which is the entire argument for keeping API tests that run
without an API key. The three-level design above is the fix, and there is now a
test pinning that behaviour specifically.

## Honest limits

The counters are in-process. Serverless spreads load over instances, so the true
ceiling is 120/min *times warm instances*. A shared store (Vercel KV, Upstash) is
the real answer and needs provisioning this repo does not assume. What is here
removes the trivial bypass, bounds one caller, and bounds one instance — and the
operator should still put a hard spend cap on the Anthropic key, which is the
only limit no bug can talk its way past.

## Verified

- `npm run test-api-guard` — 12 pass, 0 fail; proven to fail against the old code
- `npm run check` — every validator, audit and build, exit 0
- `verify-lessons-browser` — full fuzz across all 19 languages against this build
