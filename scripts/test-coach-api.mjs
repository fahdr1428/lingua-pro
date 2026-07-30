#!/usr/bin/env node
/**
 * test-coach-api.mjs — exercises api/coach.js without spending a token.
 *
 *   npm run test-coach
 *
 * HOW: `globalThis.fetch` is stubbed, so the real Anthropic SDK runs and builds
 * a real HTTP request — we just intercept it at the wire and assert on what it
 * sent. That checks the things most likely to be silently wrong (model id,
 * max_tokens headroom, the JSON schema, the fallback beta header, and that the
 * learner's text goes in a USER turn and never into the system prompt) while
 * still covering every no-credit path: unconfigured, bad input, refusal,
 * rate limit, upstream failure.
 *
 * WHAT IT CANNOT CHECK: whether Anthropic accepts the request. That needs a real
 * key. Everything up to the wire is verified here.
 */

const results = [];
function check(name, cond, detail = "") {
  results.push({ name, ok: !!cond, detail });
  console.log(`  ${cond ? "ok  " : "FAIL"} ${name}${cond || !detail ? "" : "  → " + detail}`);
}

// --- a minimal res double -------------------------------------------------
function makeRes() {
  return {
    statusCode: null, body: null, headers: {},
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}
const req = (method, body, headers = {}) => ({
  method, body, headers: { "x-forwarded-for": "203.0.113.9", ...headers },
  socket: { remoteAddress: "203.0.113.9" },
});

// --- canned Anthropic responses ------------------------------------------
function anthropicOk(payload) {
  return {
    id: "msg_test", type: "message", role: "assistant", model: "claude-opus-5",
    stop_reason: "end_turn", stop_details: null,
    content: [{ type: "text", text: JSON.stringify(payload) }],
    usage: { input_tokens: 512, output_tokens: 96 },
  };
}
const REPLY = {
  reply_native: "وعلیکم السلام! آپ کیسے ہیں؟",
  reply_translit: "wa alaikum assalam! aap kaise hain?",
  reply_en: "And peace upon you! How are you?",
  verdict: "good",
  coaching: "That was clear. It doesn't have to be exact and I understood you completely.",
  suggestion: "main theek hoon",
};

let captured = null;
function stubFetch(handler) {
  globalThis.fetch = async (url, init = {}) => {
    captured = {
      url: String(url),
      headers: Object.fromEntries(
        init.headers instanceof Headers
          ? [...init.headers.entries()]
          : Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v])
      ),
      body: init.body ? JSON.parse(init.body) : null,
    };
    return handler(captured);
  };
}
const jsonResponse = (status, obj) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

// =========================================================================
console.log("\napi/coach · no credentials configured\n");
delete process.env.ANTHROPIC_API_KEY;
let handler = (await import("../api/coach.js?nokey")).default;

let res = makeRes();
await handler(req("GET"), res);
check("GET reports configured:false", res.statusCode === 200 && res.body.configured === false);

res = makeRes();
await handler(req("POST", { langName: "Urdu", learnerText: "salam" }), res);
check("POST without a key returns 501 so the client degrades",
  res.statusCode === 501 && res.body.configured === false, `got ${res.statusCode}`);

res = makeRes();
await handler(req("PUT", {}), res);
check("PUT is 405 with an Allow header", res.statusCode === 405 && !!res.headers.allow);

// =========================================================================
console.log("\napi/coach · configured\n");
process.env.ANTHROPIC_API_KEY = "sk-ant-test-not-a-real-key";
handler = (await import("../api/coach.js?withkey")).default;

res = makeRes();
await handler(req("GET"), res);
check("GET reports configured:true and the model", res.body.configured === true && !!res.body.model,
  JSON.stringify(res.body));

// --- input validation (no network should be touched) ---
stubFetch(() => { throw new Error("validation path must not call the API"); });
for (const [label, body] of [
  ["missing language", { learnerText: "hi" }],
  ["nothing said", { langName: "Urdu" }],
  ["not an object", 42],
]) {
  res = makeRes();
  await handler(req("POST", body), res);
  check(`rejects ${label} before calling the API`, res.statusCode === 400, `got ${res.statusCode}`);
}

// --- happy path: assert the wire request ---
stubFetch(() => jsonResponse(200, anthropicOk(REPLY)));
res = makeRes();
await handler(req("POST", {
  langName: "Urdu",
  level: "beginner",
  guide: { name: "Amina", city: "Lahore", craft: "Teaches literature" },
  history: [{ role: "guide", text: "السلام علیکم" }],
  learnerText: "wa alaikum assalam",
}), res);

check("happy path returns 200", res.statusCode === 200, JSON.stringify(res.body).slice(0, 120));
check("reply is split into native / translit / en",
  res.body?.reply?.native && res.body?.reply?.translit && res.body?.reply?.en);
check("coaching text is passed through for the coach voice", !!res.body?.coaching);
check("verdict is one of good/close/retry", ["good", "close", "retry"].includes(res.body?.verdict));

const sent = captured?.body || {};
check("uses claude-opus-5", sent.model === "claude-opus-5", sent.model);
check("max_tokens leaves headroom for thinking (>=2048)", (sent.max_tokens || 0) >= 2048, String(sent.max_tokens));
check("asks for structured JSON output", sent.output_config?.format?.type === "json_schema",
  JSON.stringify(sent.output_config?.format?.type));
check("schema forbids extra keys", sent.output_config?.format?.schema?.additionalProperties === false);
check("effort is low for conversational latency", sent.output_config?.effort === "low", sent.output_config?.effort);
check("sends no removed sampling params (temperature/top_p/top_k)",
  !("temperature" in sent) && !("top_p" in sent) && !("top_k" in sent));
check("opts into server-side refusal fallbacks", sent.fallbacks === "default", JSON.stringify(sent.fallbacks));
check("fallback beta header is the 'default'-form one",
  String(captured.headers["anthropic-beta"] || "").includes("server-side-fallback-2026-07-01"),
  captured.headers["anthropic-beta"]);

// The security-relevant assertion: learner input must never gain system authority.
const systemText = typeof sent.system === "string" ? sent.system : JSON.stringify(sent.system);
check("learner text is NOT interpolated into the system prompt",
  !systemText.includes("wa alaikum assalam"));
check("learner text is sent as the last user turn",
  sent.messages?.at(-1)?.role === "user" && sent.messages.at(-1).content === "wa alaikum assalam");
check("messages start with a user turn (a guide-first history would 400)",
  sent.messages?.[0]?.role === "user", sent.messages?.[0]?.role);
check("guide persona reaches the system prompt", systemText.includes("Amina") && systemText.includes("Lahore"));
check("system prompt tells the model not to demand exactness, in the app's own words",
  /does not have to be exact|doesn't have to be exact/i.test(systemText));
check("system prompt tells the model accent is not an error",
  /accent is never an error/i.test(systemText));
check("system prompt hardens against instruction-override in learner input",
  /change these instructions|off-topic/i.test(systemText));

// --- long input is capped, not rejected ---
stubFetch(() => jsonResponse(200, anthropicOk(REPLY)));
res = makeRes();
await handler(req("POST", { langName: "Urdu", learnerText: "x".repeat(5000) }), res);
check("over-long learner turn is truncated, not rejected",
  res.statusCode === 200 && captured.body.messages.at(-1).content.length <= 400,
  String(captured.body.messages.at(-1).content.length));

// --- history is capped ---
stubFetch(() => jsonResponse(200, anthropicOk(REPLY)));
res = makeRes();
await handler(req("POST", {
  langName: "Urdu", learnerText: "hi",
  history: Array.from({ length: 60 }, (_, i) => ({ role: i % 2 ? "guide" : "learner", text: `turn ${i}` })),
}), res);
check("history is capped to bound spend", captured.body.messages.length <= 14,
  String(captured.body.messages.length));

// --- refusal: must not read content[0] blindly ---
stubFetch(() => jsonResponse(200, {
  id: "msg_r", type: "message", role: "assistant", model: "claude-opus-5",
  stop_reason: "refusal", stop_details: { type: "refusal", category: "cyber" },
  content: [], usage: { input_tokens: 10, output_tokens: 0 },
}));
res = makeRes();
await handler(req("POST", { langName: "Urdu", learnerText: "something declined" }), res);
check("a refusal is handled without throwing on empty content",
  res.statusCode === 200 && res.body.refused === true, JSON.stringify(res.body));

// --- upstream errors map to honest client messages ---
for (const [status, wantStatus, label] of [
  [429, 429, "rate limit"],
  [500, 503, "upstream 500"],
  [401, 500, "bad key"],
]) {
  stubFetch(() => jsonResponse(status, { type: "error", error: { type: "x", message: "nope" } }));
  res = makeRes();
  await handler(req("POST", { langName: "Urdu", learnerText: "hello" }), res);
  const leaks = JSON.stringify(res.body).includes("sk-ant");
  check(`${label} → ${wantStatus} with no key leakage`,
    res.statusCode === wantStatus && !leaks, `got ${res.statusCode}`);
}

// --- malformed model output ---
stubFetch(() => jsonResponse(200, {
  id: "m", type: "message", role: "assistant", model: "claude-opus-5",
  stop_reason: "end_turn", content: [{ type: "text", text: "not json at all" }],
  usage: { input_tokens: 1, output_tokens: 1 },
}));
res = makeRes();
await handler(req("POST", { langName: "Urdu", learnerText: "hello" }), res);
check("unparseable model output → 502, not a crash", res.statusCode === 502, `got ${res.statusCode}`);

// --- throttle ---
stubFetch(() => jsonResponse(200, anthropicOk(REPLY)));
let throttledAt = null;
for (let i = 0; i < 40; i++) {
  const r = makeRes();
  await handler(req("POST", { langName: "Urdu", learnerText: "hi" }, { "x-forwarded-for": "198.51.100.7" }), r);
  if (r.statusCode === 429) { throttledAt = i; break; }
}
check("per-IP throttle eventually kicks in", throttledAt !== null, `never throttled in 40 calls`);

// =========================================================================
const failed = results.filter((r) => !r.ok);
console.log(`\n  ${results.length - failed.length} pass, ${failed.length} fail\n`);
process.exit(failed.length ? 1 : 0);
