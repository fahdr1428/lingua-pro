// =============================================================================
// JOURNEY (v66) — the "reach, not position" layer.
//
// Instead of describing progress as units completed, each stop names a
// CONVERSATION the learner can hold. Behind you reads "you can…", the current
// stop reads "next you'll be able to…", ahead reads "then you can…" — the
// tense itself carries the progression.
//
// Each stop carries the actual exchange it unlocks, so a learner can see the
// conversation they're working toward before they start it.
//
// CONTENT RULE: every exchange here is web-verified before it ships. Wrong
// grammar in a feature whose whole job is "you can now say this" is the worst
// possible failure. Languages without verified stops fall back to the existing
// unit path — nothing breaks, they just don't get the capability framing yet.
//
// Sources for the Urdu set (cross-checked, July 2026): Talkpal everyday
// phrases, Preply common Urdu phrases, Eton Institute beginner phrases,
// Wikibooks Urdu/Vocabulary/Basic Phrases, ling-app conversational Urdu.
// =============================================================================

export const JOURNEY = {
  ur: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "ur-c1-s1",
        // done tense (shown once complete) / future tense (shown when current)
        done: "You can greet someone properly",
        next: "you'll be able to greet someone and answer back",
        // the conversation this stop unlocks
        they: { text: "السلام علیکم", translit: "assalam-o-alaikum", en: "peace be upon you" },
        you: { text: "وعلیکم السلام", translit: "wa alaikum assalam", en: "and upon you, peace" },
        unitIndex: 0,
      },
      {
        id: "ur-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "آپ کیسے ہیں؟", translit: "aap kaise hain?", en: "how are you?" },
        you: { text: "میں ٹھیک ہوں، شکریہ", translit: "main theek hoon, shukriya", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "ur-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "آپ کا نام کیا ہے؟", translit: "aap ka naam kya hai?", en: "what is your name?" },
        you: { text: "میرا نام … ہے", translit: "mera naam … hai", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "ur-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "آپ کہاں سے ہیں؟", translit: "aap kahan se hain?", en: "where are you from?" },
        you: { text: "میں … سے ہوں", translit: "main … se hoon", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "ur-c1-s5",
        // The reciprocity stop — the app currently only ever asks learners to
        // ANSWER, which is why practice can feel like a quiz rather than a
        // conversation. This stop hands them the question.
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "میرا نام علی ہے", translit: "mera naam Ali hai", en: "my name is Ali" },
        you: { text: "آپ کہاں سے ہیں؟", translit: "aap kahan se hain?", en: "and where are you from?" },
        unitIndex: 4,
      },
      {
        id: "ur-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "آپ سے مل کر خوشی ہوئی", translit: "aap se mil kar khushi hui", en: "pleased to meet you" },
        you: { text: "پھر ملیں گے", translit: "phir milenge", en: "see you again" },
        unitIndex: 5,
      },
    ],
  },
};

export function hasJourney(langCode) {
  return Array.isArray(JOURNEY[langCode]?.stops) && JOURNEY[langCode].stops.length > 0;
}

export function getStops(langCode) {
  return JOURNEY[langCode]?.stops || [];
}

export function getChapterTitle(langCode) {
  return JOURNEY[langCode]?.chapterTitle || null;
}

// How many stops the learner has cleared, derived from real unit progress.
// A stop counts as reached when its mapped unit is at least 60% learned —
// enough that the phrase genuinely belongs to them, not just seen once.
export function stopsReached(langCode, unitProgress = []) {
  const stops = getStops(langCode);
  let reached = 0;
  for (const s of stops) {
    const u = unitProgress[s.unitIndex];
    if (u && (u.pct || 0) >= 0.6) reached++;
    else break; // stops are sequential — stop counting at the first gap
  }
  return reached;
}
