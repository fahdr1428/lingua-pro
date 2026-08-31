// =============================================================================
// coreVocabulary.js (v100) — the words every language has to teach.
//
// WHY THIS EXISTS
//
// Nineteen packs were written in different passes by different hands, and until
// this file nothing said what a pack was FOR. The result, measured:
//
//   · 420 distinct concepts across the app; only 53 taught in all 19 languages
//   · 147 concepts taught in exactly ONE language
//   · Punjabi did not teach "eat". Persian did not teach "drink". Chinese did
//     not teach "want". German did not teach "hot".
//   · Persian, Malayalam, Tamil, Somali and Tagalog had no word for "bathroom",
//     "hand", "head", "year", "car" or "hotel" — while the Sentence Lab taught
//     the sentence "Where is the bathroom?" in three of them.
//
// So which language you picked decided how much of a course you got, and a
// Persian learner finished the pack with 120 words while a Spanish learner had
// 193. That is not a curriculum, it is an accident.
//
// WHAT A CONCEPT IS
//
// A concept is a meaning, not a word. Languages carve meaning differently:
// Persian خوردن covers eat and drink, Tagalog kuya is specifically an older
// brother, Malayalam has no single "have". So each concept lists the English
// glosses that COUNT as teaching it, and the checker asks whether the pack
// teaches the meaning — not whether it contains a particular string.
//
// TIERS
//
//   1  survival    You cannot get through a day without it. A pack missing one
//                  of these fails the build.
//   2  everyday    The ordinary business of talking to family. Missing one is a
//                  warning that has to be justified or filled.
//   3  reach       Genuinely optional. Reported, never enforced.
//
// WHAT THIS IS NOT
//
// Not a claim that every language should teach identical words. It is a floor,
// not a ceiling: a pack is expected to go beyond this with what matters in that
// language — Arabic's 244 example frames, Punjabi's kinship terms, Japanese's
// registers. The spine exists so that no learner opens a language and finds a
// third of a course.
// =============================================================================

/**
 * @typedef {object} Concept
 * @property {string} id      stable key, used in reports
 * @property {string} label   what to call it in English
 * @property {string[]} accepts glosses that count as teaching this meaning
 * @property {1|2|3} tier
 * @property {string} category which pack category it belongs in
 */

/** Helper: a concept whose label is also its only accepted gloss. */
const c = (id, label, tier, category, accepts = []) => ({
  id, label, tier, category, accepts: [label, ...accepts],
});

export const CORE = [
  // --- Tier 1 · survival ----------------------------------------------------
  c("hello", "hello", 1, "Greetings", ["hi", "greetings", "peace be upon you"]),
  c("goodbye", "goodbye", 1, "Greetings", ["bye", "farewell", "see you"]),
  c("yes", "yes", 1, "Greetings", ["yeah"]),
  c("no", "no", 1, "Greetings", ["not", "nope"]),
  c("thanks", "thank you", 1, "Politeness", ["thanks", "thank you very much"]),
  c("please", "please", 1, "Politeness", ["if you please"]),
  c("sorry", "sorry", 1, "Politeness", ["excuse me", "pardon", "forgive me", "i'm sorry"]),
  c("i", "I", 1, "People", ["me"]),
  c("you", "you", 1, "People", ["you (formal)", "you (polite)", "you (singular)"]),
  c("we", "we", 1, "People", ["us"]),
  c("he", "he", 1, "People", ["he/she", "he, she", "she, he"]),
  c("she", "she", 1, "People", ["he/she", "he, she", "she, he"]),
  c("name", "name", 1, "About You", ["my name"]),
  c("water", "water", 1, "Food", []),
  c("food", "food", 1, "Food", ["meal", "dish"]),
  c("eat", "to eat", 1, "Verbs", ["eat"]),
  c("drink", "to drink", 1, "Verbs", ["drink"]),
  c("go", "to go", 1, "Verbs", ["go"]),
  c("come", "to come", 1, "Verbs", ["come"]),
  c("want", "to want", 1, "Verbs", ["want", "need", "to need", "would like"]),
  c("have", "to have", 1, "Verbs", ["have"]),
  c("know", "to know", 1, "Verbs", ["know"]),
  c("understand", "to understand", 1, "Verbs", ["understand"]),
  c("speak", "to speak", 1, "Verbs", ["speak", "talk", "to talk", "say", "to say"]),
  c("help", "to help", 1, "Verbs", ["help"]),
  c("what", "what", 1, "Questions", []),
  c("where", "where", 1, "Questions", []),
  c("who", "who", 1, "Questions", []),
  c("when", "when", 1, "Questions", []),
  c("why", "why", 1, "Questions", []),
  // Deliberately does NOT accept "price" or "cost". Knowing the noun is not
  // knowing how to ask, and asking what something costs is the survival skill.
  c("howmuch", "how much", 1, "Questions", ["how many", "how much?", "how much is it"]),
  c("bathroom", "bathroom", 1, "Places", ["toilet", "washroom", "restroom"]),
  c("house", "house", 1, "Places", ["home"]),
  c("one", "one", 1, "Numbers", []),
  c("two", "two", 1, "Numbers", []),
  c("three", "three", 1, "Numbers", []),
  c("today", "today", 1, "Time", []),
  c("tomorrow", "tomorrow", 1, "Time", []),
  c("mother", "mother", 1, "Family", ["mum", "mom", "mama"]),
  c("father", "father", 1, "Family", ["dad", "papa"]),
  c("good", "good", 1, "Common", ["well", "fine", "nice"]),
  c("bad", "bad", 1, "Common", []),

  // --- Tier 2 · everyday ----------------------------------------------------
  c("friend", "friend", 2, "People", []),
  c("man", "man", 2, "People", []),
  c("woman", "woman", 2, "People", []),
  c("brother", "brother", 2, "Family", ["older brother", "younger brother"]),
  c("sister", "sister", 2, "Family", ["older sister", "younger sister"]),
  c("son", "son", 2, "Family", ["boy"]),
  c("daughter", "daughter", 2, "Family", ["girl"]),
  c("family", "family", 2, "Family", []),
  c("grandmother", "grandmother", 2, "Family", ["grandma", "granny"]),
  c("grandfather", "grandfather", 2, "Family", ["grandpa"]),
  c("uncle", "uncle", 2, "Family", ["uncle (mother's brother)", "uncle (father's brother)"]),
  c("aunt", "aunt", 2, "Family", ["aunt (mother's sister)", "aunt (father's sister)"]),
  c("tired", "tired", 2, "Feelings", []),
  c("hungry", "hungry", 2, "Feelings", ["hunger"]),
  c("thirsty", "thirsty", 2, "Feelings", ["thirst"]),
  c("happy", "happy", 2, "Feelings", ["glad"]),
  c("sad", "sad", 2, "Feelings", ["unhappy", "sadness"]),
  c("sick", "sick", 2, "Feelings", ["ill", "unwell", "illness", "sickness"]),
  c("bread", "bread", 2, "Food", []),
  c("rice", "rice", 2, "Food", ["cooked rice", "uncooked rice"]),
  c("tea", "tea", 2, "Food", []),
  c("milk", "milk", 2, "Food", []),
  c("see", "to see", 2, "Verbs", ["see", "look", "to look", "watch"]),
  c("give", "to give", 2, "Verbs", ["give"]),
  c("take", "to take", 2, "Verbs", ["take", "get", "to get"]),
  c("do", "to do", 2, "Verbs", ["do", "make", "to make"]),
  c("buy", "to buy", 2, "Verbs", ["buy"]),
  c("open", "to open", 2, "Verbs", ["open"]),
  c("sleep", "to sleep", 2, "Verbs", ["sleep"]),
  c("think", "to think", 2, "Verbs", ["think"]),
  c("can", "to be able to", 2, "Verbs", ["can", "be able to", "to can"]),
  c("work", "work", 2, "Verbs", ["to work", "job", "employment"]),
  c("money", "money", 2, "Common", []),
  c("time", "time", 2, "Time", []),
  c("day", "day", 2, "Time", []),
  c("week", "week", 2, "Time", []),
  c("year", "year", 2, "Time", []),
  c("now", "now", 2, "Time", []),
  c("yesterday", "yesterday", 2, "Time", []),
  c("here", "here", 2, "Places", []),
  c("there", "there", 2, "Places", []),
  c("near", "near", 2, "Places", ["close", "nearby"]),
  c("far", "far", 2, "Places", ["far away", "distant"]),
  c("city", "city", 2, "Places", ["town"]),
  c("market", "market", 2, "Places", ["bazaar", "shop", "store", "marketplace"]),
  c("hotel", "hotel", 2, "Places", []),
  c("car", "car", 2, "Transport", []),
  c("doctor", "doctor", 2, "People", []),
  c("big", "big", 2, "Common", ["large"]),
  c("small", "small", 2, "Common", ["little"]),
  c("hot", "hot", 2, "Weather", ["warm"]),
  c("cold", "cold", 2, "Weather", []),
  c("left", "left", 2, "Common", []),
  c("right", "right", 2, "Common", []),
  c("and", "and", 2, "Connectors", []),
  c("or", "or", 2, "Connectors", []),
  c("but", "but", 2, "Connectors", []),
  c("because", "because", 2, "Connectors", []),
  c("with", "with", 2, "Connectors", []),
  c("very", "very", 2, "Common", ["a lot", "really"]),
  c("more", "more", 2, "Common", []),
  c("also", "also", 2, "Common", ["too", "as well"]),
  c("all", "all", 2, "Common", ["everyone", "everything"]),
  c("four", "four", 2, "Numbers", []),
  c("five", "five", 2, "Numbers", []),

  // --- Tier 3 · reach -------------------------------------------------------
  c("head", "head", 3, "Body", []),
  c("hand", "hand", 3, "Body", []),
  c("heart", "heart", 3, "Body", []),
  c("black", "black", 3, "Colors", []),
  c("white", "white", 3, "Colors", []),
  c("sun", "sun", 3, "Weather", []),
  c("rain", "rain", 3, "Weather", []),
  c("train", "train", 3, "Transport", []),
];

export const TIER_NAMES = { 1: "survival", 2: "everyday", 3: "reach" };

/** Normalise an English gloss so "to eat" and "eat" are the same thing. */
export function normalizeGloss(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")          // "uncle (father's brother)" → "uncle"
    .replace(/[^a-z\s'’]/g, " ")
    .replace(/^\s*(to|the|a|an)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Every gloss a pack teaches, as a normalised set — a translation may list several. */
export function taughtGlosses(vocab) {
  const out = new Set();
  for (const w of vocab || []) {
    for (const seg of String(w.translation || "").split(/[,;/]| or /)) {
      const g = normalizeGloss(seg);
      if (g) out.add(g);
      // "uncle (father's brother)" should also count as the fuller phrase.
      const full = normalizeGloss(seg.replace(/[()]/g, ""));
      if (full) out.add(full);
    }
  }
  return out;
}

/** Which core concepts this pack does not teach, by tier. */
export function missingConcepts(vocab) {
  const taught = taughtGlosses(vocab);
  return CORE.filter((concept) => !concept.accepts.some((a) => taught.has(normalizeGloss(a))));
}
