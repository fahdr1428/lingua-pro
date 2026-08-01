// =============================================================================
// LEARNER PROFILE (v73) — the memory the app didn't have.
//
// THE DIAGNOSIS THIS FIXES: every conversation started from nothing. The coach
// had no idea the learner had fluffed the past tense four sessions running, or
// that they're fine ordering food and freeze at directions. Without that, an app
// can only ever chat — it can't train, because training means knowing what to
// work on next.
//
// This is the store that remembers. One profile per language, holding:
//
//   errors    what actually goes wrong, grouped into patterns rather than
//             one-off mistakes, so "you keep dropping the verb ending" can be
//             said with evidence behind it
//   topics    per-topic attempt/success counts → a confidence number that decays,
//             because knowing something in March doesn't mean knowing it in June
//   fluency   a dated history of scores, so progress is a line rather than a claim
//   missions  what's been attempted, passed, and how well
//   spoken    distinct words actually PRODUCED out loud, which is a different and
//             much smaller set than words recognised in a lesson
//
// TWO RULES THIS FILE KEEPS:
//
//   1. NEVER INVENT A NUMBER. Every value here is derived from something the
//      learner actually did. Where there isn't enough evidence, the accessor
//      returns null and the UI shows "—" rather than a comforting fiction.
//   2. STAY SMALL. This gets injected into an LLM prompt on every turn, so
//      summariseForPrompt() emits a few hundred characters of the most decision-
//      relevant facts, not a dump.
// =============================================================================

export const PROFILE_VERSION = 1;

const KEY = "profile";

// Confidence decays with time — six weeks without touching a topic and a "solid"
// reading should have softened back toward unproven.
const HALF_LIFE_DAYS = 42;

// Rolling windows. Big enough to be stable, small enough to track improvement.
const MAX_TURNS = 120;
const MAX_FLUENCY_POINTS = 60;
const MAX_ERROR_EXAMPLES = 3;

export function emptyProfile(langCode) {
  return {
    version: PROFILE_VERSION,
    langCode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    persona: "friendly",
    region: null,
    // Every graded utterance, trimmed to a rolling window.
    turns: [],          // { ts, band, score, latencyMs, spoken, topic, words }
    errors: {},         // patternId -> { id, label, kind, count, lastSeen, examples[] }
    topics: {},         // topic -> { attempts, good, lastSeen }
    fluency: [],        // { ts, overall, grammar, speed, range, pronunciation }
    missions: {},       // missionId -> { attempts, passed, bestScore, lastAt }
    spokenWords: [],    // distinct normalised words the learner has actually said
    goal: null,         // what they're training FOR
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export async function loadProfile(storage, langCode) {
  const all = (await storage.get(KEY)) || {};
  const found = all[langCode];
  if (!found || found.version !== PROFILE_VERSION) return emptyProfile(langCode);
  // Defensive: a hand-edited or partially-written profile shouldn't crash the app.
  return { ...emptyProfile(langCode), ...found, langCode };
}

export async function saveProfile(storage, langCode, profile) {
  const all = (await storage.get(KEY)) || {};
  all[langCode] = { ...profile, langCode, updatedAt: Date.now() };
  await storage.set(KEY, all);
  return all[langCode];
}

export async function updateProfile(storage, langCode, fn) {
  const current = await loadProfile(storage, langCode);
  const next = fn(current) || current;
  return saveProfile(storage, langCode, next);
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

const norm = (s) => String(s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();

/**
 * Record one graded utterance.
 *
 * @param {object} profile
 * @param {object} turn
 * @param {string} turn.band       "got" | "close" | "miss"
 * @param {number} turn.score      0–1
 * @param {number} [turn.latencyMs] time from prompt to speech — drives the speed score
 * @param {string} [turn.topic]    unit/category, for per-topic confidence
 * @param {string} [turn.said]     what the learner actually produced
 * @param {Array}  [turn.errors]   [{ id, label, kind }] from the coach
 */
export function recordTurn(profile, turn) {
  const p = { ...profile };
  const ts = Date.now();

  p.turns = [
    ...p.turns,
    {
      ts,
      band: turn.band,
      score: typeof turn.score === "number" ? turn.score : null,
      latencyMs: typeof turn.latencyMs === "number" ? turn.latencyMs : null,
      // Did this go through a microphone? fluency.js computes pronunciation from
      // spoken attempts ONLY, so dropping this flag here would silently pin that
      // dimension to null forever — which is exactly what it did before v73.1.
      spoken: !!turn.spoken,
      topic: turn.topic || null,
      words: turn.said ? norm(turn.said).split(/\s+/).filter(Boolean).length : null,
    },
  ].slice(-MAX_TURNS);

  if (turn.topic) {
    const t = p.topics[turn.topic] || { attempts: 0, good: 0, lastSeen: 0 };
    p.topics = {
      ...p.topics,
      [turn.topic]: {
        attempts: t.attempts + 1,
        good: t.good + (turn.band === "got" ? 1 : 0),
        lastSeen: ts,
      },
    };
  }

  if (turn.said) {
    const words = norm(turn.said).split(/\s+/).filter((w) => w.length > 1);
    if (words.length) {
      // A Set keeps this O(1) and deduped; the cap stops a long user from
      // growing the profile without bound.
      const set = new Set(p.spokenWords);
      for (const w of words) set.add(w);
      p.spokenWords = [...set].slice(-800);
    }
  }

  if (Array.isArray(turn.errors) && turn.errors.length) {
    const errors = { ...p.errors };
    for (const e of turn.errors.slice(0, 4)) {
      if (!e?.id) continue;
      const prev = errors[e.id] || { id: e.id, label: e.label || e.id, kind: e.kind || "grammar", count: 0, examples: [] };
      errors[e.id] = {
        ...prev,
        label: e.label || prev.label,
        kind: e.kind || prev.kind,
        count: prev.count + 1,
        lastSeen: ts,
        examples: e.example
          ? [e.example, ...prev.examples.filter((x) => x !== e.example)].slice(0, MAX_ERROR_EXAMPLES)
          : prev.examples,
      };
    }
    p.errors = errors;
  }

  return p;
}

export function recordFluency(profile, scores) {
  const p = { ...profile };
  p.fluency = [...p.fluency, { ts: Date.now(), ...scores }].slice(-MAX_FLUENCY_POINTS);
  return p;
}

export function recordMission(profile, missionId, { passed, score }) {
  const p = { ...profile };
  const prev = p.missions[missionId] || { attempts: 0, passed: false, bestScore: 0, lastAt: 0 };
  p.missions = {
    ...p.missions,
    [missionId]: {
      attempts: prev.attempts + 1,
      passed: prev.passed || !!passed,
      bestScore: Math.max(prev.bestScore, typeof score === "number" ? score : 0),
      lastAt: Date.now(),
    },
  };
  return p;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/** Decay factor for something last seen `days` ago. 1 = today, 0.5 = one half-life. */
function decay(lastSeen) {
  if (!lastSeen) return 0;
  const days = (Date.now() - lastSeen) / 86400000;
  return Math.pow(0.5, days / HALF_LIFE_DAYS);
}

/**
 * Per-topic confidence, 0–1, decayed by time since last practised.
 * Returns null for a topic with too little evidence to say anything honest.
 */
export function topicConfidence(profile, topic) {
  const t = profile.topics?.[topic];
  if (!t || t.attempts < 3) return null;
  return (t.good / t.attempts) * decay(t.lastSeen);
}

// Above this, a topic is genuinely comfortable; below it, genuinely shaky. The
// gap between them is deliberate — a topic in the middle belongs on neither list.
export const SHAKY_BELOW = 0.7;
export const SOLID_ABOVE = 0.8;

/**
 * Topics that are actually weak — not merely the bottom of the list.
 *
 * The distinction matters: a learner with two topics at 95% and 100% has no weak
 * topics, and ranking one of them "least confident" would put a flat
 * contradiction in the model's brief ("least confident on Greetings … comfortable
 * with Greetings") and undermine the coaching.
 */
export function weakTopics(profile, limit = 3) {
  return Object.keys(profile.topics || {})
    .map((topic) => ({ topic, confidence: topicConfidence(profile, topic) }))
    .filter((x) => x.confidence !== null && x.confidence < SHAKY_BELOW)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, limit);
}

/** Topics with enough evidence to be called solid. */
export function strongTopics(profile, limit = 3) {
  return Object.keys(profile.topics || {})
    .map((topic) => ({ topic, confidence: topicConfidence(profile, topic) }))
    .filter((x) => x.confidence !== null && x.confidence >= SOLID_ABOVE)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

/** The error patterns worth mentioning: recurring, and recent enough to matter. */
export function activeErrors(profile, limit = 3) {
  return Object.values(profile.errors || {})
    .filter((e) => e.count >= 2 && decay(e.lastSeen) > 0.35)
    .sort((a, b) => b.count * decay(b.lastSeen) - a.count * decay(a.lastSeen))
    .slice(0, limit);
}

/**
 * Difficulty 1–5, from real performance. Deliberately sticky: it moves on a
 * rolling window rather than the last answer, because one bad turn is noise and
 * whiplash difficulty is worse than difficulty that's slightly wrong.
 *
 * Returns 2 ("gentle") until there's enough evidence — pitching someone too low
 * costs them a little boredom, pitching too high costs you the user.
 */
export function difficultyFor(profile) {
  const recent = (profile.turns || []).slice(-20);
  if (recent.length < 6) return 2;
  const graded = recent.filter((t) => typeof t.score === "number");
  if (graded.length < 6) return 2;
  const mean = graded.reduce((n, t) => n + t.score, 0) / graded.length;
  if (mean >= 0.9) return 5;
  if (mean >= 0.78) return 4;
  if (mean >= 0.62) return 3;
  if (mean >= 0.45) return 2;
  return 1;
}

export const DIFFICULTY_LABEL = {
  1: "very gentle — short sentences, common words, plenty of time",
  2: "gentle — everyday vocabulary, present tense, no rush",
  3: "steady — natural pace, some past and future, occasional idiom",
  4: "brisk — native pace, mixed tenses, colloquial phrasing",
  5: "full speed — talk to them as you would to another native",
};

/**
 * A compact brief for the model. This is the whole point of the profile: the
 * coach opens every conversation already knowing who it's talking to.
 *
 * Kept to a few hundred characters — it rides on every request, and a wall of
 * text buries the instructions that matter.
 */
export function summariseForPrompt(profile) {
  if (!profile) return "";
  const bits = [];

  const d = difficultyFor(profile);
  bits.push(`Level ${d}/5 — pitch it ${DIFFICULTY_LABEL[d]}.`);

  const errs = activeErrors(profile, 3);
  if (errs.length) {
    bits.push(
      `Recurring trouble: ${errs.map((e) => `${e.label} (${e.count}x)`).join("; ")}. ` +
      `Watch for these, but correct at most one per turn.`
    );
  }

  const weak = weakTopics(profile, 2);
  if (weak.length) {
    bits.push(`Least confident on: ${weak.map((w) => w.topic).join(", ")}.`);
  }

  const strong = strongTopics(profile, 2);
  if (strong.length) {
    bits.push(`Comfortable with: ${strong.map((s) => s.topic).join(", ")} — don't over-explain these.`);
  }

  if (profile.goal) bits.push(`They are learning in order to: ${profile.goal}.`);

  const said = (profile.spokenWords || []).length;
  if (said >= 20) bits.push(`They have produced about ${said} distinct words out loud so far.`);

  return bits.join(" ");
}

/** Has this learner done enough for the profile to mean anything? */
export function profileMaturity(profile) {
  const turns = (profile?.turns || []).length;
  if (turns >= 40) return "established";
  if (turns >= 12) return "forming";
  return "new";
}
