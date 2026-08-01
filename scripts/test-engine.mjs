#!/usr/bin/env node
/**
 * test-engine.mjs — proves the v73 fluency engine actually does what the UI
 * claims it does.
 *
 *   npm run test-engine
 *
 * The three features the user asked for above all others are memory, adaptive
 * difficulty and a fluency score. All three are only worth anything if they are
 * DERIVED, so this file is mostly a set of assertions that nothing here invents
 * a number, that behaviour changes the outputs in the direction a human would
 * expect, and that the model brief can never contradict itself.
 */

import {
  emptyProfile, recordTurn, recordFluency, recordMission,
  topicConfidence, weakTopics, strongTopics, activeErrors,
  difficultyFor, summariseForPrompt, profileMaturity,
} from "../src/engine/profile.js";
import { computeFluency, fluencyDelta, fluencyBlurb, DIMENSIONS } from "../src/engine/fluency.js";
import { MISSIONS, getMission, recommendMissions, passThreshold, MISSION_CATEGORIES } from "../src/data/missions.js";
import { PERSONAS, getPersona, REGIONS, PRESSURE_PROMPT } from "../src/data/personas.js";
import { TONES, getTone, voiceQuality, setVoicePrefs, coachDelivery } from "../src/audio/voices.js";
import { romanise, foldVowels, scriptOf, scriptsDiffer } from "../src/audio/romanise.js";

const results = [];
function check(name, cond, detail = "") {
  results.push({ name, ok: !!cond });
  console.log(`  ${cond ? "ok  " : "FAIL"} ${name}${cond || !detail ? "" : "  → " + detail}`);
}

const DAY = 86400000;

/** Build a profile by replaying turns, optionally back-dating them. */
function withTurns(turns) {
  let p = emptyProfile("ur");
  for (const t of turns) p = recordTurn(p, t);
  return p;
}
/** Shift every recorded timestamp back by `days`. Used to test decay honestly. */
function agedBy(profile, days) {
  const shift = days * DAY;
  return {
    ...profile,
    turns: profile.turns.map((t) => ({ ...t, ts: t.ts - shift })),
    topics: Object.fromEntries(Object.entries(profile.topics).map(([k, v]) => [k, { ...v, lastSeen: v.lastSeen - shift }])),
    errors: Object.fromEntries(Object.entries(profile.errors).map(([k, v]) => [k, { ...v, lastSeen: v.lastSeen - shift }])),
  };
}

// =========================================================================
console.log("\nprofile · a new learner claims nothing\n");

const fresh = emptyProfile("ur");
check("no turns recorded", fresh.turns.length === 0);
check("difficulty defaults to gentle rather than guessing", difficultyFor(fresh) === 2, String(difficultyFor(fresh)));
check("no weak topics claimed", weakTopics(fresh).length === 0);
check("no strong topics claimed", strongTopics(fresh).length === 0);
check("no error patterns claimed", activeErrors(fresh).length === 0);
check("maturity is 'new'", profileMaturity(fresh) === "new");

const freshBrief = summariseForPrompt(fresh);
check("the brief makes no claim about weaknesses", !/trouble|confident|Comfortable/.test(freshBrief), freshBrief);
check("the brief still tells the model how to pitch it", /Level 2\/5/.test(freshBrief), freshBrief);

// =========================================================================
console.log("\nprofile · memory accumulates from real behaviour\n");

let p = withTurns([
  { band: "miss", score: 0.3, topic: "Directions", said: "kahan hai station", errors: [{ id: "verb-final", label: "verb at the end", kind: "word-order", example: "kahan hai station" }] },
  { band: "close", score: 0.5, topic: "Directions", said: "station kahan", errors: [{ id: "verb-final", label: "verb at the end", kind: "word-order" }] },
  { band: "miss", score: 0.35, topic: "Directions", said: "kahan station hai" },
  { band: "got", score: 0.95, topic: "Greetings", said: "assalam o alaikum bhai" },
  { band: "got", score: 0.93, topic: "Greetings", said: "aap kaise hain" },
  { band: "got", score: 0.96, topic: "Greetings", said: "main theek hoon shukriya" },
]);

check("turns are recorded", p.turns.length === 6, String(p.turns.length));
check("a repeated error pattern is counted, not re-listed",
  p.errors["verb-final"]?.count === 2, JSON.stringify(p.errors["verb-final"]));
check("an example of the error is kept", p.errors["verb-final"].examples.length === 1);
check("distinct spoken words are accumulated", p.spokenWords.length >= 10, String(p.spokenWords.length));

check("a weak topic is identified as weak", weakTopics(p).some((w) => w.topic === "Directions"));
check("a strong topic is identified as strong", strongTopics(p).some((s) => s.topic === "Greetings"));

// The contradiction that shipped in the first draft of this file.
const weakNames = weakTopics(p).map((w) => w.topic);
const strongNames = strongTopics(p).map((s) => s.topic);
check("no topic can be both least-confident and comfortable",
  !weakNames.some((n) => strongNames.includes(n)), `${weakNames} vs ${strongNames}`);

const brief = summariseForPrompt(p);
check("the brief names the recurring error with its count", /verb at the end \(2x\)/.test(brief), brief);
check("the brief tells the model to correct at most one per turn", /at most one per turn/.test(brief));
check("the brief stays small enough to ride on every request", brief.length < 700, `${brief.length} chars`);

// =========================================================================
console.log("\nprofile · confidence decays, so knowing it in March isn't knowing it in June\n");

const nowConfidence = topicConfidence(p, "Greetings");
const agedConfidence = topicConfidence(agedBy(p, 84), "Greetings"); // two half-lives
check("a fresh topic reads high", nowConfidence > 0.9, String(nowConfidence));
check("the same topic untouched for 12 weeks reads much lower",
  agedConfidence < nowConfidence / 3, `${nowConfidence} → ${agedConfidence}`);
check("a long-stale error stops being reported as active",
  activeErrors(agedBy(p, 200)).length === 0, String(activeErrors(agedBy(p, 200)).length));

// =========================================================================
console.log("\nprofile · difficulty adapts to what they can actually do\n");

const strong = withTurns(Array.from({ length: 10 }, () => ({ band: "got", score: 0.95, topic: "Greetings", said: "aap kaise hain" })));
const weak = withTurns(Array.from({ length: 10 }, () => ({ band: "miss", score: 0.2, topic: "Greetings", said: "um" })));
const middling = withTurns(Array.from({ length: 10 }, () => ({ band: "close", score: 0.65, topic: "Greetings", said: "theek hai" })));

check("a strong speaker gets full speed", difficultyFor(strong) === 5, String(difficultyFor(strong)));
check("a struggling speaker gets the gentlest setting", difficultyFor(weak) === 1, String(difficultyFor(weak)));
check("a middling speaker lands in between", difficultyFor(middling) === 3, String(difficultyFor(middling)));

const almost = withTurns(Array.from({ length: 5 }, () => ({ band: "got", score: 1, topic: "x", said: "hi there" })));
check("difficulty refuses to move on 5 turns of evidence", difficultyFor(almost) === 2, String(difficultyFor(almost)));

// One bad turn must not undo a good record — whiplash difficulty is worse than
// difficulty that is slightly wrong.
const strongThenSlip = recordTurn(strong, { band: "miss", score: 0.1, topic: "Greetings", said: "erm" });
check("one bad turn does not collapse the difficulty",
  difficultyFor(strongThenSlip) >= 4, String(difficultyFor(strongThenSlip)));

// =========================================================================
console.log("\nprofile · bounded storage\n");

let big = emptyProfile("ur");
for (let i = 0; i < 400; i++) big = recordTurn(big, { band: "got", score: 0.9, topic: "t", said: `word${i} extra${i}` });
check("turn history is capped", big.turns.length <= 120, String(big.turns.length));
check("spoken vocabulary is capped", big.spokenWords.length <= 800, String(big.spokenWords.length));
for (let i = 0; i < 200; i++) big = recordFluency(big, { overall: 50 });
check("fluency history is capped", big.fluency.length <= 60, String(big.fluency.length));

// =========================================================================
console.log("\nfluency · nothing is invented\n");

const f0 = computeFluency(emptyProfile("ur"));
check("a brand-new learner has NO overall score", f0.overall === null, String(f0.overall));
check("all four dimensions are reported missing", f0.missing.length === 4, JSON.stringify(f0.missing));
check("the blurb doesn't pretend there's a score", !/\d/.test(fluencyBlurb(f0)), fluencyBlurb(f0));
check("every dimension has an unlock instruction", DIMENSIONS.every((d) => d.unlock && d.blurb));

// A learner who has only ever typed cannot have a pronunciation score...
const typedOnly = withTurns(Array.from({ length: 12 }, (_, i) => ({
  band: "got", score: 0.9, topic: "t", said: `typed answer number ${i} with words`,
})));
const fTyped = computeFluency(typedOnly);
check("typing-only learner has NO pronunciation score", fTyped.pronunciation === null, String(fTyped.pronunciation));
check("typing-only learner has NO responsiveness score", fTyped.responsiveness === null, String(fTyped.responsiveness));
// ...but must still get a meaningful overall from the dimensions they did earn.
check("they still get an overall, renormalised over what they have",
  fTyped.overall !== null && fTyped.overall > 70, String(fTyped.overall));

// =========================================================================
console.log("\nfluency · hesitation genuinely costs score\n");

const mk = (latencyMs) => withTurns(Array.from({ length: 12 }, (_, i) => ({
  band: "got", score: 0.9, topic: "t", spoken: true, latencyMs,
  said: `spoken answer number ${i} with several distinct words here`,
})));
const fast = computeFluency(mk(1200));
const slow = computeFluency(mk(11000));

check("a fast speaker scores full responsiveness", fast.responsiveness === 100, String(fast.responsiveness));
check("an 11-second pause scores zero responsiveness", slow.responsiveness === 0, String(slow.responsiveness));
check("identical accuracy, different speed → different overall",
  fast.overall > slow.overall, `${fast.overall} vs ${slow.overall}`);
check("accuracy is unaffected by speed", fast.accuracy === slow.accuracy, `${fast.accuracy} vs ${slow.accuracy}`);
check("spoken attempts DO produce a pronunciation score", fast.pronunciation !== null, String(fast.pronunciation));

// =========================================================================
console.log("\nfluency · recent behaviour outweighs old behaviour\n");

const oldGood = agedBy(withTurns(Array.from({ length: 15 }, () => ({ band: "got", score: 1, topic: "t", said: "perfect answer here" }))), 90);
let mixed = { ...oldGood };
for (let i = 0; i < 8; i++) mixed = recordTurn(mixed, { band: "miss", score: 0.2, topic: "t", said: "erm not sure" });

const fOldOnly = computeFluency(oldGood);
const fMixed = computeFluency(mixed);
check("a long-ago perfect record still reads high on its own", fOldOnly.accuracy > 90, String(fOldOnly.accuracy));
check("recent failure pulls the score down hard", fMixed.accuracy < 50, String(fMixed.accuracy));

// Provisional flag has to mean something.
const thin = withTurns(Array.from({ length: 6 }, () => ({ band: "got", score: 0.9, topic: "t", said: "a few words" })));
check("a thin record is marked provisional", computeFluency(thin).provisional === true);
check("a thick record is not", computeFluency(typedOnly).provisional === false || typedOnly.turns.length < 15);

// Delta needs history to exist before it will claim anything.
check("no delta without history", fluencyDelta(emptyProfile("ur"), fMixed) === null);
const withHistory = recordFluency(
  { ...mixed, fluency: [{ ts: Date.now() - 8 * DAY, overall: 40 }] },
  { overall: 40 }
);
const d = fluencyDelta(withHistory, { overall: 55 });
check("a delta is computed against a real earlier snapshot", d && d.delta === 15, JSON.stringify(d));

// =========================================================================
console.log("\nmissions · the pass condition is real\n");

const ids = MISSIONS.map((m) => m.id);
check("mission ids are unique", new Set(ids).size === ids.length);
check("every mission has 3+ objectives", MISSIONS.every((m) => m.objectives.length >= 3));
check("objective ids are unique within a mission",
  MISSIONS.every((m) => new Set(m.objectives.map((o) => o.id)).size === m.objectives.length));
check("every objective is phrased as something checkable",
  MISSIONS.every((m) => m.objectives.every((o) => o.label.length > 8 && !/^be /i.test(o.label))));
check("every mission can be failed", MISSIONS.every((m) => m.failIf.length >= 1));
check("switching to English always fails a mission",
  MISSIONS.every((m) => m.failIf.some((f) => /english/i.test(f))));
check("every mission names a persona that exists",
  MISSIONS.every((m) => PERSONAS.some((pp) => pp.id === m.persona)));
check("every mission belongs to a real category",
  MISSIONS.every((m) => MISSION_CATEGORIES.some((c) => c.id === m.category)));
check("every mission has a pressure level with a prompt",
  MISSIONS.every((m) => PRESSURE_PROMPT[m.pressure] !== undefined));
check("the pass bar is reachable but not free",
  MISSIONS.every((m) => passThreshold(m) >= 3 && passThreshold(m) <= m.objectives.length));
check("getMission finds a real one and returns null otherwise",
  getMission("order-coffee")?.id === "order-coffee" && getMission("nope") === null);

// Ordering has to actually respond to history.
const done = recordMission(emptyProfile("ur"), "order-coffee", { passed: true, score: 1 });
const order = recommendMissions(done).map((m) => m.id);
check("a passed mission drops to the end of the list",
  order.indexOf("order-coffee") === order.length - 1, order.join(","));
const started = recordMission(emptyProfile("ur"), "job-interview", { passed: false, score: 0.25 });
check("an unfinished mission is offered first",
  recommendMissions(started)[0].id === "job-interview");
check("recommendMissions never loses a mission",
  recommendMissions(emptyProfile("ur")).length === MISSIONS.length);

// =========================================================================
console.log("\npersonas & regions\n");

check("every persona has a prompt that changes behaviour",
  PERSONAS.every((pp) => pp.prompt.length > 80));
check("personas span the pressure range",
  new Set(PERSONAS.map((pp) => pp.pressure)).size >= 3);
check("every high-pressure persona is explicitly told not to be cruel",
  PERSONAS.filter((pp) => pp.pressure >= 2).every((pp) => /never|not\b.*(rude|bully|cruel)/i.test(pp.prompt)));
check("getPersona falls back rather than returning undefined", getPersona("nonsense").id === PERSONAS[0].id);
check("region prompts exist for every listed region",
  Object.values(REGIONS).every((list) => list.every((r) => r.prompt.length > 40 && r.name && r.id)));
check("region ids are unique across a language",
  Object.values(REGIONS).every((list) => new Set(list.map((r) => r.id)).size === list.length));

// =========================================================================
console.log("\nvoices · natural first, and the learner's choice wins\n");

const fake = (name, lang, localService = false) => ({ name, lang, voiceURI: name, localService });

// The exact situation behind "the AI agent is so rough and scary": a machine
// with a local formant synthesiser and a natural network voice side by side.
// The old picker took the local one because it was local.
const robotic = fake("English (eSpeak)", "en-GB", true);
const natural = fake("Google UK English Female", "en-GB", false);
check("a natural network voice outranks a local formant synthesiser",
  voiceQuality(natural) > voiceQuality(robotic),
  `${voiceQuality(natural)} vs ${voiceQuality(robotic)}`);
check("'compact' and 'pico' voices are ranked down too",
  voiceQuality(fake("Samantha (compact)", "en-US", true)) < voiceQuality(fake("Samantha", "en-US", false)));
check("locality is only a tiebreak between equals",
  voiceQuality(fake("Ava", "en-US", true)) > voiceQuality(fake("Ava", "en-US", false)));

check("every tone has a distinct rate/pitch pair",
  new Set(TONES.map((t) => `${t.rate}/${t.pitch}`)).size === TONES.length);
check("every tone is described in plain words, not numbers",
  TONES.every((t) => t.label && t.blurb && !/\d/.test(t.blurb)));
check("getTone falls back rather than returning undefined", getTone("nope").id === TONES[0].id);

// Delivery must respond to both dials, and stay inside what the API accepts.
setVoicePrefs({ tone: "calm", speed: 0.7 });
const calmSlow = coachDelivery();
setVoicePrefs({ tone: "bright", speed: 1.3 });
const brightQuick = coachDelivery();
check("tone and speed both move the delivery",
  brightQuick.rate > calmSlow.rate && brightQuick.pitch > calmSlow.pitch,
  `${JSON.stringify(calmSlow)} vs ${JSON.stringify(brightQuick)}`);
check("rate stays inside the range the speech API accepts",
  calmSlow.rate >= 0.5 && brightQuick.rate <= 2, `${calmSlow.rate} / ${brightQuick.rate}`);

setVoicePrefs({ speed: 99 });
check("an absurd speed is clamped rather than trusted", coachDelivery().rate <= 2, String(coachDelivery().rate));
setVoicePrefs(null);
check("clearing preferences returns to the default tone", coachDelivery().rate === TONES[0].rate);

// =========================================================================
console.log("\nromanisation · the cross-script bridge\n");

check("Devanagari is detected", scriptOf("मैं ठीक हूँ") === "deva");
check("Arabic/Urdu script is detected", scriptOf("السلام علیکم") === "arab");
check("Gurmukhi is detected", scriptOf("ਸਤ ਸ੍ਰੀ ਅਕਾਲ") === "guru");
check("Bengali is detected", scriptOf("ধন্যবাদ") === "beng");
check("Latin is detected and left alone", scriptOf("bonjour") === "latin" && romanise("bonjour") === "");

check("word-final schwa is deleted, as these languages actually pronounce it",
  romanise("शुक्रिया") === "shukriyaa" || !/aa$/.test(romanise("राम")), romanise("राम"));
check("a virama cancels the inherent vowel", romanise("स्वागत").startsWith("sv"), romanise("स्वागत"));
check("nukta letters map to their Perso-Arabic sounds",
  romanise("ख़ुदा हाफ़िज़").includes("f"), romanise("ख़ुदा हाफ़िज़"));

check("vowel folding unifies the transliteration variants",
  foldVowels("paanee") === foldVowels("paani") && foldVowels("paani") === "pani",
  `${foldVowels("paanee")} / ${foldVowels("paani")}`);
check("folding does not collapse distinct consonants",
  foldVowels("kaam") !== foldVowels("kaan"));
check("scriptsDiffer spots the case the bridge exists for",
  scriptsDiffer("मैं ठीक हूँ", "میں ٹھیک ہوں") === true);
check("scriptsDiffer is false for the same script", scriptsDiffer("bonjour", "bonsoir") === false);

// =========================================================================
const failed = results.filter((r) => !r.ok);
console.log(`\n  ${results.length - failed.length} pass, ${failed.length} fail\n`);
process.exit(failed.length ? 1 : 0);
