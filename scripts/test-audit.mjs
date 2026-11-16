// =============================================================================
// test-audit.mjs (v118) — the fixes from the outside audit that are pure logic.
//
//   RESTORE A BACKUP   readBackup refuses everything that isn't a Zaban backup
//                      without touching storage; a real export restores to
//                      exactly what was saved (keys it lacks are removed).
//   HIGHLIGHT          a word in a joined script is marked whole (السلام, not
//                      ال|سلام); Latin keeps the part-word match.
//   SKILL WORDING      "your lowest score" is never said of the only score.
//   LESSON 1           no grammar lesson in any language's first module (it
//                      opened greetings with word order); every grammar lesson
//                      is still placed, once.
//   PICKER             Urdu first, every language exactly once.
//
// Each rule here was checked against a deliberately broken copy of the code it
// guards (see the v118 commit message).
// =============================================================================

// A localStorage for node, so the real adapter and the real export run.
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => { mem.set(k, String(v)); },
  removeItem: (k) => { mem.delete(k); },
  clear: () => mem.clear(),
  key: (i) => [...mem.keys()][i] ?? null,
  get length() { return mem.size; },
};
// Object.keys(localStorage) is how the adapter lists keys.
globalThis.localStorage = new Proxy(globalThis.localStorage, {
  ownKeys: () => [...mem.keys()],
  getOwnPropertyDescriptor: (t, k) => (mem.has(k) ? { enumerable: true, configurable: true, value: mem.get(k) } : Reflect.getOwnPropertyDescriptor(t, k)),
});

const { readBackup, restoreBackup, MAX_BACKUP_BYTES } = await import("../src/legal/importData.js");
const { exportEverything, EXPORT_VERSION } = await import("../src/legal/exportData.js");
const { getStorage } = await import("../src/storage/index.js");
const { highlightRange } = await import("../src/ui/highlight.js");
const { focusReason, SKILLS } = await import("../src/engine/skills.js");
const { loadCourse } = await import("../src/engine/guided.js");
const { LANGUAGES, pickerLanguages } = await import("../src/data/registry.js");
const { GRAMMAR_TITLES } = await import("../src/data/contentIndex.js");
const { allCodes, loadPack } = await import("./lib/inventory.mjs");

let checks = 0;
const problems = [];
const check = (cond, msg) => { checks++; if (!cond) problems.push(msg); };

// ---------------------------------------------------------------------------
// 1. Restore a backup
// ---------------------------------------------------------------------------
const storage = getStorage();
const wrap = (data, extra = {}) => JSON.stringify({ app: "Zaban", exportVersion: EXPORT_VERSION, exportedAt: "2026-11-01T10:00:00.000Z", data, ...extra });
const learner = {
  app: { onboarded: true, currentLanguage: "ur", streak: 4, lessonsCompleted: { ur: 6 } },
  progress: { ur: { "ur.w1": { reps: 3 }, "ur.w2": { reps: 1 }, "ur.w3": { reps: 0 } }, fr: { "fr.w1": { reps: 2 } } },
  course: { ur: { done: ["ur.m01.l1"] } },
};

const refused = [
  ["", "an empty file"],
  ["   \n", "a blank file"],
  ["not json {", "text that isn't JSON"],
  ["[1,2,3]", "a JSON array"],
  [JSON.stringify({ app: "Other", exportVersion: 1, data: learner }), "another app's export"],
  [JSON.stringify({ app: "Zaban", data: learner }), "no export version"],
  [wrap(learner, { exportVersion: EXPORT_VERSION + 1 }), "a newer export version"],
  [JSON.stringify({ app: "Zaban", exportVersion: EXPORT_VERSION }), "no data at all"],
  [wrap({}), "empty data"],
  [wrap([1, 2]), "data that is an array"],
  [wrap({ ...learner, "../etc": 1 }), "a key with a path in it"],
  [wrap({ ...learner, "a b": 1 }), "a key with a space"],
  [wrap({ progress: learner.progress }), "no learner (no app record)"],
  [wrap({ app: [1], progress: {} }), "an app record that is an array"],
  ["x".repeat(MAX_BACKUP_BYTES + 1), "a file over the size limit"],
];
for (const [text, what] of refused) {
  const r = readBackup(text);
  check(r && r.ok === false && typeof r.reason === "string" && r.reason.length > 10, `restore: ${what} was not refused with a reason (${JSON.stringify(r).slice(0, 80)})`);
}
check(readBackup(null).ok === false, "restore: a missing file was not refused");

// A real export of a real learner, through the real adapter.
mem.clear();
for (const [k, v] of Object.entries(learner)) await storage.set(k, v);
mem.set("someone-else:key", "not ours");          // another app's key on the same origin
const exported = await exportEverything();
const text = JSON.stringify(exported);
const read = readBackup(text);
check(read.ok === true, `restore: the app's own export was refused: ${read.reason}`);
if (read.ok) {
  check(read.summary.currentLanguage === "ur", `restore: summary language ${read.summary.currentLanguage}`);
  check(read.summary.streak === 4, `restore: summary streak ${read.summary.streak}`);
  check(read.summary.keyCount === 3, `restore: summary counts ${read.summary.keyCount} records, expected 3`);
  check(JSON.stringify(read.summary.languages) === JSON.stringify([{ code: "ur", words: 2 }, { code: "fr", words: 1 }]),
    `restore: summary languages ${JSON.stringify(read.summary.languages)} (words never practised must not count)`);

  // Reading touches nothing.
  const before = JSON.stringify([...mem.entries()]);
  readBackup(text);
  check(JSON.stringify([...mem.entries()]) === before, "restore: reading a backup changed storage");

  // Something else happens on this device, then the backup is restored.
  await storage.set("app", { onboarded: true, currentLanguage: "fr", streak: 0 });
  await storage.set("attempts", [{ x: 1 }]);       // a key the backup doesn't have
  const n = await restoreBackup(read.data, storage);
  check(n === 3, `restore: wrote ${n} records, expected 3`);
  for (const [k, v] of Object.entries(learner)) {
    check(JSON.stringify(await storage.get(k)) === JSON.stringify(v), `restore: "${k}" is not what the backup holds`);
  }
  check((await storage.get("attempts")) === null, "restore: a key the backup doesn't hold survived (two histories stitched together)");
  check(mem.get("someone-else:key") === "not ours", "restore: a key that isn't this app's was touched");
  check(JSON.stringify((await storage.keys()).sort()) === JSON.stringify(Object.keys(learner).sort()), `restore: keys after restore ${JSON.stringify(await storage.keys())}`);
}
let threw = false;
try { await restoreBackup({ "bad key": 1 }, storage); } catch { threw = true; }
check(threw, "restore: restoreBackup wrote data with a bad key instead of refusing");
threw = false;
try { await restoreBackup({}, storage); } catch { threw = true; }
check(threw, "restore: restoreBackup accepted an empty backup (it would have wiped everything)");

// ---------------------------------------------------------------------------
// 2. Highlight the whole word in joined scripts
// ---------------------------------------------------------------------------
const cut = (s, r) => (r ? s.slice(r[0], r[1]) : null);
const ur = "السلام علیکم، آپ کیسے ہیں؟";
check(cut(ur, highlightRange(ur, "سلام", { nonLatin: true, code: "ur" })) === "السلام", `highlight: Urdu marked "${cut(ur, highlightRange(ur, "سلام", { nonLatin: true, code: "ur" }))}", not the whole word السلام`);
check(cut(ur, highlightRange(ur, "علیکم", { nonLatin: true, code: "ur" })) === "علیکم", "highlight: Urdu word before a comma isn't marked exactly");
check(cut(ur, highlightRange(ur, "ہیں", { nonLatin: true, code: "ur" })) === "ہیں", "highlight: Urdu word before ؟ isn't marked exactly");
const ar = "مرحبا بالعالم.";
check(cut(ar, highlightRange(ar, "عالم", { nonLatin: true, code: "ar" })) === "بالعالم", "highlight: Arabic prefixed word isn't marked whole");
const hi = "मैं पानी पीता हूँ।";
check(cut(hi, highlightRange(hi, "पी", { nonLatin: true, code: "hi" })) === "पीता", "highlight: Hindi part-word match isn't widened to the word");
const es = "Yo hablo español.";
check(cut(es, highlightRange(es, "habl", { nonLatin: false, code: "es" })) === "habl", "highlight: Latin part-word match was changed");
const zh = "我喜欢喝茶。";
check(cut(zh, highlightRange(zh, "喝茶", { nonLatin: true, code: "zh" })) === "喝茶", "highlight: Chinese (no spaces) was widened");
check(highlightRange(ur, "x", { nonLatin: true, code: "ur" }) === null, "highlight: a one-letter lemma was highlighted");
check(highlightRange(ur, "کتاب", { nonLatin: true, code: "ur" }) === null, "highlight: a word not in the sentence was highlighted");

// ---------------------------------------------------------------------------
// 3. "Your lowest score" is not said of the only score
// ---------------------------------------------------------------------------
const profileWith = (scores, focus) => ({ focus, skills: Object.fromEntries(SKILLS.map((k) => [k, { score: scores[k] ?? null }])) });
const only = focusReason(profileWith({ vocabulary: 62 }, "vocabulary"));
check(!/lowest/i.test(only) && /only skill/i.test(only), `skills: one scored skill was described as "${only}"`);
const two = focusReason(profileWith({ vocabulary: 62, listening: 80 }, "vocabulary"));
check(/lowest score \(62\)/.test(two), `skills: with two scores the focus reads "${two}"`);
const none = focusReason(profileWith({ listening: 80 }, "speaking"));
check(/haven't practised speaking/i.test(none), `skills: an unscored focus reads "${none}"`);
check(focusReason({}) === null, "skills: no focus should give no reason");

// ---------------------------------------------------------------------------
// 4. Lesson 1 teaches what it says: no grammar in the first module
// ---------------------------------------------------------------------------
for (const code of allCodes()) {
  const pack = loadPack(code);
  const course = await loadCourse(pack);
  const first = course.modules[0];
  const g1 = first.lessons.flatMap((l) => l.grammar || []);
  check(g1.length === 0, `${code}: the first module (${first.title}) carries grammar: ${g1.join(", ")}`);
  const titles = GRAMMAR_TITLES[code] || [];
  const placed = course.modules.flatMap((m) => m.lessons.flatMap((l) => l.grammar || []));
  if (course.modules.length > 1) {
    check(placed.length === titles.length, `${code}: ${placed.length} grammar lessons placed of ${titles.length}`);
    check(new Set(placed).size === placed.length, `${code}: a grammar lesson is placed twice`);
  }
  // The very first lesson's words all belong to the module it's in.
  const l1 = first.lessons[0];
  const unitIds = new Set((pack.vocab || []).filter((v) => v.unit === first.unitId).map((v) => v.id));
  check(l1 && l1.items.every((id) => unitIds.has(id)), `${code}: lesson 1 has words from outside its module`);
}

// ---------------------------------------------------------------------------
// 5. The language picker leads with Urdu and lists every language once
// ---------------------------------------------------------------------------
const picker = pickerLanguages().map((l) => l.code);
check(picker[0] === "ur", `picker: first language is ${picker[0]}, not Urdu`);
check(picker.length === Object.keys(LANGUAGES).length && new Set(picker).size === picker.length,
  `picker: ${picker.length} entries for ${Object.keys(LANGUAGES).length} languages`);
check(picker.indexOf("vi") > picker.indexOf("pa") && picker.indexOf("yo") > picker.indexOf("hi"),
  "picker: Vietnamese or Yoruba ahead of the South Asian languages");

// ---------------------------------------------------------------------------
// 6. "Couldn't reach the server" is not "the AI isn't set up"
// ---------------------------------------------------------------------------
// Offline, the probe used to answer configured:false and keep that for the
// page load: Speak then said the AI "isn't switched on", and coming back
// online didn't change it.
for (const [name, mod, fn] of [["coach", "../src/ai/coach.js", "probeCoach"], ["decode", "../src/ai/decode.js", "probeDecode"]]) {
  const realFetch = globalThis.fetch;
  let calls = 0;
  let reply = () => Promise.reject(new TypeError("Failed to fetch"));
  globalThis.fetch = (...a) => { calls++; return reply(...a); };
  try {
    const m = await import(`${mod}?v118-${name}`);
    const off = await m[fn]();
    check(off.unreachable === true && !off.configured, `${name}: a network failure isn't reported as unreachable (${JSON.stringify(off)})`);
    reply = () => Promise.resolve(new Response(JSON.stringify({ configured: true, model: "m" }), { status: 200 }));
    const back = await m[fn]();
    check(back.configured === true && calls === 2, `${name}: after a network failure the probe didn't ask again (${calls} calls, ${JSON.stringify(back)})`);
    await m[fn]();
    check(calls === 2, `${name}: a real answer wasn't kept for the page load (${calls} calls)`);
  } finally { globalThis.fetch = realFetch; }
  // A real "no" (the endpoint isn't there) is an answer: kept, not unreachable.
  calls = 0;
  globalThis.fetch = () => { calls++; return Promise.resolve(new Response("not found", { status: 404 })); };
  try {
    const m = await import(`${mod}?v118-${name}-404`);
    const no = await m[fn]();
    check(no.configured === false && !no.unreachable, `${name}: a 404 is reported as ${JSON.stringify(no)}`);
    await m[fn]();
    check(calls === 1, `${name}: a 404 wasn't kept (${calls} calls)`);
  } finally { globalThis.fetch = realFetch; }
  // A page that isn't JSON (a static host's fallback page) is a "no" too.
  globalThis.fetch = () => Promise.resolve(new Response("<!doctype html><html></html>", { status: 200 }));
  try {
    const m = await import(`${mod}?v118-${name}-html`);
    const html = await m[fn]();
    check(html.configured === false && !html.unreachable, `${name}: an HTML page is reported as ${JSON.stringify(html)}`);
  } finally { globalThis.fetch = realFetch; }
}
for (const f of ["src/screens/Speak.jsx", "src/screens/Missions.jsx", "src/screens/Decode.jsx"]) {
  const src = (await import("node:fs")).readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
  check(/p\.unreachable \? null :/.test(src), `${f}: an unreachable server is treated as "not set up"`);
}

// ---------------------------------------------------------------------------
console.log(`test-audit: ${checks} checks`);
if (problems.length) {
  for (const p of problems.slice(0, 40)) console.log("  ✗ " + p);
  if (problems.length > 40) console.log(`  … and ${problems.length - 40} more`);
  process.exit(1);
}
console.log("  ✓ all pass");
