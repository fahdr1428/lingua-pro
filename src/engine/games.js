// =============================================================================
// games.js (v109) — the logic behind Word Rush, kept pure so it can be tested.
//
// Word Rush is a 60-second matching game: a word, four meanings, tap fast. It
// is here to make recall FUN and fast, which is its own kind of practice —
// fluent recognition is recognition without effort, and the clock is what
// pushes past effortful. Three things keep it honest as learning, not just a
// reaction test:
//
//   1. Distractors come from the same topic where possible (a food among
//      foods), so the right answer has to be KNOWN, not spotted as the odd
//      one out; and no two options ever read the same, so there is always
//      exactly one right answer.
//   2. A missed word comes back a few questions later — within-session
//      spacing — so a miss becomes a second try rather than a lost point.
//   3. It plays the words the learner has already met, topped up with the
//      next ones in the course when there are too few, and the words missed
//      can be turned straight into a real lesson afterwards.
// =============================================================================

const norm = (s) => String(s || "").trim().toLowerCase();
const bare = (s) => norm(String(s || "").replace(/\([^)]*\)/g, " ")).replace(/\s+/g, " ").trim();
const qualified = (s) => /\([^)]+\)/.test(String(s || ""));

/**
 * The separate meanings in a gloss: "spouse, wife, husband" is three, and so
 * is "is/am/are". A comma inside parentheses doesn't split — "mother (someone
 * else's, or addressing your own)" is one meaning with a note.
 */
function meanings(s) {
  const str = String(s || "");
  const out = [];
  let depth = 0, cur = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === "," || ch === ";" || ch === "/")) { out.push(cur); cur = ""; continue; }
    if (depth === 0 && str.startsWith(" or ", i)) { out.push(cur); cur = ""; i += 3; continue; }
    cur += ch;
  }
  out.push(cur);
  return out
    .map((m) => ({ core: bare(m).replace(/^(to|the|a|an) /, ""), marked: qualified(m) }))
    .filter((m) => m.core);
}

/**
 * Would these two options make the question ambiguous — could a learner pick
 * either and be right? Identical text, or any meaning they share where at
 * least one side is unqualified: "please" beside "please, go ahead", "help"
 * beside "to help", "you" beside "you (formal)". "you (familiar)" beside "you
 * (formal)" is fine — both are marked, and telling register apart (tum/aap,
 * tu/usted) is the lesson; so is "uncle (father's brother)" beside "uncle
 * (mother's brother)".
 */
function clash(a, b) {
  if (norm(a) === norm(b)) return true;
  const mb = meanings(b);
  return meanings(a).some((x) => mb.some((y) => x.core === y.core && !(x.marked && y.marked)));
}

/**
 * The words to play. Learned words (reps > 0) first; if that's fewer than
 * `min`, the next words in curriculum order fill it, so a beginner can play too.
 */
export function buildRushPool(vocab, progress = {}, { min = 12 } = {}) {
  const usable = (vocab || []).filter((v) => v && v.lemma && v.translation && !v.custom);
  const learned = usable.filter((v) => (progress[v.id]?.reps || 0) > 0);
  if (learned.length >= min) return learned;
  const fresh = usable.filter((v) => !((progress[v.id]?.reps || 0) > 0));
  return learned.concat(fresh.slice(0, min - learned.length));
}

/**
 * One question. dir "meaning": see the word, pick what it means.
 * dir "word": see the meaning, pick the word (harder — recall of the form).
 * `rand` is injectable so tests can be deterministic.
 */
export function rushQuestion(item, pool, dir = "meaning", rand = Math.random) {
  const shown = (w) => (dir === "meaning" ? w.translation : w.lemma);
  const answer = shown(item);
  const taken = [answer];
  // Same-topic words first, then anything, each group shuffled.
  const shuffle = (a) => a.map((x) => [rand(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const candidates = [
    ...shuffle(pool.filter((w) => w.id !== item.id && w.category === item.category)),
    ...shuffle(pool.filter((w) => w.id !== item.id && w.category !== item.category)),
  ];
  const distractors = [];
  for (const w of candidates) {
    const text = shown(w);
    // Never two options that read the same — including a synonym of the
    // answer, which would make a correct pick look wrong.
    if (!text || taken.some((t) => clash(t, text))) continue;
    // Nor a distractor that is itself right: another word with this meaning
    // (Japanese has two words for "tea"; Hindi दाएँ and दायाँ are both
    // "right"), or the same word under another meaning.
    if (dir === "word" && clash(w.translation, item.translation)) continue;
    if (dir === "meaning" && norm(w.lemma) === norm(item.lemma)) continue; // homograph
    taken.push(text);
    distractors.push(text);
    if (distractors.length === 3) break;
  }
  const options = shuffle([answer, ...distractors]);
  return {
    item,
    dir,
    prompt: dir === "meaning" ? item.lemma : item.translation,
    promptTranslit: dir === "meaning" ? item.translit || "" : "",
    options,
    answer,
  };
}

/** Score multiplier for a run of correct answers: ×1, ×2 from 3 in a row, ×3 from 6, ×4 from 9. */
export function comboMultiplier(streak) {
  return Math.min(4, 1 + Math.floor(Math.max(0, streak) / 3));
}

/**
 * The order words are asked in: a shuffled pass through the pool, and a word
 * that was missed is put back `gap` places ahead so it comes round again soon.
 */
export function createRushDeck(pool, rand = Math.random) {
  let queue = [];
  let last = null;
  const refill = () => {
    const fresh = pool.map((x) => [rand(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
    // Don't start a new pass with the word that just ended the old one.
    if (fresh.length > 1 && last && fresh[0].id === last.id) fresh.push(fresh.shift());
    queue = queue.concat(fresh);
  };
  return {
    next() {
      if (!queue.length) refill();
      last = queue.shift();
      return last;
    },
    missed(item, gap = 3) {
      if (!queue.length) refill();
      queue.splice(Math.min(gap, queue.length), 0, item);
    },
  };
}

/** XP for a round: one per correct answer, capped so a game never out-earns a lesson. */
export function rushXp(correct) {
  return Math.min(25, Math.max(0, correct));
}
