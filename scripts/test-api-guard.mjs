// =============================================================================
// test-api-guard.mjs (v97) — the rate limit has to survive a liar.
//
// Every AI endpoint took the caller's address from the LEFTMOST entry of
// x-forwarded-for. That header is a chain, and everything left of the entry
// your own proxy appended is whatever the caller chose to send. So:
//
//     for i in 1..1000: POST /api/coach  X-Forwarded-For: <random>
//
// looked like a thousand different people, and the per-IP limit never fired.
// On an endpoint with no accounts in front of it that spends money per call,
// that is the whole protection gone.
//
// These tests are the reason to believe it is fixed. The first one fails
// against the old implementation and passes against the new one, which is the
// only property that makes a security test worth having.
//
//   npm run test-api-guard
// =============================================================================

import { clientIp, rateLimit, __resetLimiter } from "../api/_guard.js";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
};

const req = (headers = {}, remote = "10.0.0.1") => ({ headers, socket: { remoteAddress: remote } });

// --- how the address is derived --------------------------------------------
console.log("\n  deriving the caller's address");

ok("a spoofed x-forwarded-for does not become the identity",
  clientIp(req({ "x-forwarded-for": "1.2.3.4, 203.0.113.9" })) === "203.0.113.9",
  `got ${clientIp(req({ "x-forwarded-for": "1.2.3.4, 203.0.113.9" }))}`);

ok("the platform's own header wins over x-forwarded-for",
  clientIp(req({ "x-vercel-forwarded-for": "203.0.113.7", "x-forwarded-for": "1.2.3.4" })) === "203.0.113.7");

ok("x-real-ip is preferred over x-forwarded-for",
  clientIp(req({ "x-real-ip": "203.0.113.8", "x-forwarded-for": "1.2.3.4" })) === "203.0.113.8");

ok("a single-entry x-forwarded-for still works",
  clientIp(req({ "x-forwarded-for": "203.0.113.5" })) === "203.0.113.5");

ok("falls back to the socket when no headers are present",
  clientIp(req({}, "198.51.100.2")) === "198.51.100.2");

// --- the limit itself -------------------------------------------------------
console.log("\n  limiting");

__resetLimiter();
{
  // One honest caller, identified by the platform header.
  const mk = () => req({ "x-vercel-forwarded-for": "203.0.113.10" });
  let refusedAt = null;
  for (let i = 1; i <= 30; i++) {
    if (!rateLimit(mk(), { endpoint: "coach", max: 20 }).ok) { refusedAt = i; break; }
  }
  ok("one caller is cut off after its allowance", refusedAt === 21, `refused at call ${refusedAt}`);
}

__resetLimiter();
{
  // THE BYPASS. A caller rotating x-forwarded-for on every request, while the
  // platform header stays the same — which is what actually happens, because
  // the attacker cannot forge that one.
  const spoof = (i) => req({
    "x-vercel-forwarded-for": "203.0.113.11",
    "x-forwarded-for": `${i}.${i}.${i}.${i}`,
  });
  let refusedAt = null;
  for (let i = 1; i <= 60; i++) {
    if (!rateLimit(spoof(i), { endpoint: "coach", max: 20 }).ok) { refusedAt = i; break; }
  }
  ok("rotating x-forwarded-for does NOT buy more calls", refusedAt === 21,
    refusedAt === null ? "never refused — the bypass is open" : `refused at call ${refusedAt}`);
}

__resetLimiter();
{
  // Two genuinely different callers do not eat each other's budget.
  const a = () => req({ "x-vercel-forwarded-for": "203.0.113.20" });
  const b = () => req({ "x-vercel-forwarded-for": "203.0.113.21" });
  for (let i = 0; i < 20; i++) rateLimit(a(), { endpoint: "coach", max: 20 });
  ok("a second caller still has its own allowance", rateLimit(b(), { endpoint: "coach", max: 20 }).ok);
  ok("the first caller is now over its allowance", !rateLimit(a(), { endpoint: "coach", max: 20 }).ok);
}

__resetLimiter();
{
  // Endpoints keep their OWN allowance. Sharing a single bucket AND applying
  // each endpoint's maximum to it made the strictest endpoint unusable after
  // the chattiest one had been used — a learner who had a conversation could
  // not then build a scenario. The existing coach API suite caught that.
  const c = () => req({ "x-vercel-forwarded-for": "203.0.113.30" });
  for (let i = 0; i < 10; i++) rateLimit(c(), { endpoint: "decode", max: 10 });
  ok("using up decode does not lock you out of scenario",
    rateLimit(c(), { endpoint: "scenario", max: 8 }).ok);
}

__resetLimiter();
{
  // But the SUM is still bounded, which is what separate buckets alone got
  // wrong: 20 + 10 + 8 = 38 calls a minute from one caller.
  const c = () => req({ "x-vercel-forwarded-for": "203.0.113.31" });
  let refusedAt = null, reason = null;
  for (let i = 1; i <= 40; i++) {
    const ep = ["coach", "decode", "scenario"][i % 3];
    const r = rateLimit(c(), { endpoint: ep, max: 20 });
    if (!r.ok) { refusedAt = i; reason = r.reason; break; }
  }
  ok("the combined total across endpoints is capped", reason === "caller",
    refusedAt === null ? "never refused — the sum is unbounded" : `refused at ${refusedAt} (${reason})`);
}

__resetLimiter();
{
  // The ceiling that does not care who you say you are: a caller rotating the
  // platform header itself (a botnet, or a proxy pool) still hits a wall.
  let refusedAt = null, reason = null;
  for (let i = 1; i <= 400; i++) {
    const r = rateLimit(req({ "x-vercel-forwarded-for": `198.51.100.${i % 250}` }), { endpoint: "coach", max: 20 });
    if (!r.ok) { refusedAt = i; reason = r.reason; break; }
  }
  ok("a per-instance ceiling stops address rotation", refusedAt !== null && reason === "global",
    refusedAt === null ? "never refused — spend is unbounded" : `refused at ${refusedAt} (${reason})`);
}

console.log(`\n  ${pass} pass, ${fail} fail\n`);
process.exit(fail ? 1 : 0);
