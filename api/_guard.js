// =============================================================================
// _guard.js (v97) — who is calling, and how often.
//
// Files in /api whose name starts with "_" are not deployed as routes, so this
// is shared code rather than an endpoint.
//
// WHY THIS EXISTS
//
// All three AI endpoints throttled per IP, and all three derived the IP the
// same way:
//
//     (req.headers["x-forwarded-for"] || "").split(",")[0].trim()
//
// x-forwarded-for is a CHAIN — "<client>, <proxy>, <proxy>" — and anything to
// the left of the entry your own proxy appended is whatever the caller chose to
// send. Taking [0] therefore reads a value the caller controls. Send a fresh
// X-Forwarded-For on every request and the rate limit counts each one as a new
// visitor: no limit at all, on an endpoint that spends money per call, with no
// accounts in front of it.
//
// This takes the IP only from headers the platform sets itself, and falls back
// to the RIGHTMOST forwarded-for entry — the one appended by the proxy nearest
// us — never the leftmost.
//
// AND A CEILING THAT DOESN'T CARE ABOUT IPs
//
// Per-IP limiting cannot survive someone rotating addresses, which is cheap.
// So there is also a per-instance ceiling across all endpoints: whatever the
// caller claims to be, one warm instance will not exceed it. It is deliberately
// generous for a real learner (a session is a handful of calls a minute) and
// hard for a script.
//
// Both limits are in-process, which is honest rather than ideal: serverless
// spreads load across instances, so the true ceiling is this times the number
// of warm instances. A shared store (Vercel KV, Upstash) is the real fix and
// needs provisioning this repo does not assume. What is here removes the
// trivial bypass and bounds the damage.
// =============================================================================

/**
 * The caller's address, taken only from sources the caller cannot set.
 *
 * @param {import("http").IncomingMessage} req
 * @returns {string}
 */
export function clientIp(req) {
  const h = req.headers || {};

  // Vercel sets these itself and strips inbound copies. Prefer them.
  const vercelFwd = h["x-vercel-forwarded-for"];
  if (vercelFwd) return String(vercelFwd).split(",")[0].trim() || "unknown";

  const realIp = h["x-real-ip"];
  if (realIp) return String(realIp).trim() || "unknown";

  // Last resort. The RIGHTMOST entry is the one the closest proxy appended;
  // everything left of it may have come from the caller.
  const xff = String(h["x-forwarded-for"] || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (xff.length) return xff[xff.length - 1];

  return req.socket?.remoteAddress || "unknown";
}

const WINDOW_MS = 60_000;

// Three levels, because one is never enough:
//
//   perEndpoint  what this endpoint allows one caller. Scenario is expensive
//                and rare, coach is cheap and chatty; they need their own
//                numbers or the strict one becomes unusable the moment the
//                chatty one has been used.
//   perCaller    the sum across endpoints. Separate buckets alone gave one
//                caller 20 + 10 + 8 = 38 calls a minute.
//   global       this instance, whoever is asking — the only thing that
//                survives someone rotating addresses.
const perEndpoint = new Map();   // "ip|endpoint" -> timestamps
const perCaller = new Map();     // "ip"          -> timestamps
let global = [];

/** Drop timestamps older than the window. */
const fresh = (times, now) => times.filter((t) => now - t < WINDOW_MS);

function bump(map, key, now) {
  const times = fresh(map.get(key) || [], now);
  times.push(now);
  map.set(key, times);
  return times.length;
}

function sweep(map, now) {
  if (map.size <= 500) return;
  for (const [key, times] of map) {
    if (!fresh(times, now).length) map.delete(key);
  }
}

/**
 * Record a call and say whether it should be refused.
 *
 * @param {import("http").IncomingMessage} req
 * @param {{ endpoint: string, max: number, totalMax?: number, globalMax?: number }} opts
 * @returns {{ ok: boolean, reason?: "endpoint"|"caller"|"global", ip: string }}
 */
export function rateLimit(req, {
  endpoint,
  max,
  totalMax = Number(process.env.AI_MAX_PER_CALLER) || 25,
  globalMax = Number(process.env.AI_MAX_PER_MINUTE) || 120,
}) {
  const now = Date.now();
  const ip = clientIp(req);

  const mine = bump(perEndpoint, `${ip}|${endpoint}`, now);
  const total = bump(perCaller, ip, now);
  global = fresh(global, now);
  global.push(now);

  sweep(perEndpoint, now);
  sweep(perCaller, now);

  if (mine > max) return { ok: false, reason: "endpoint", ip };
  if (total > totalMax) return { ok: false, reason: "caller", ip };
  if (global.length > globalMax) return { ok: false, reason: "global", ip };
  return { ok: true, ip };
}

/** Test seam — the limiter is in-process, so tests need a clean slate. */
export function __resetLimiter() {
  perEndpoint.clear();
  perCaller.clear();
  global = [];
}
