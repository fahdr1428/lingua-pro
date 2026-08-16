// =============================================================================
// POLICIES (v77) — the legal text, written from what the code actually does.
//
// ⚠️ THIS IS NOT LEGAL ADVICE, AND IT IS NOT A SUBSTITUTE FOR A LAWYER. It is an
// accurate description of this application's behaviour, drafted so that a
// solicitor reviewing it has something true to work from rather than a template
// full of clauses that don't match the product. COMPLIANCE.md lists what still
// needs professional review before this ships to the public.
//
// THE RULE FOLLOWED HERE: every factual claim below is checked against the
// source. Writing "we never send your voice anywhere" would have been easy and
// wrong — Chrome streams microphone audio to Google's speech service — and a
// false privacy claim is worse than no policy at all, because it is a statement
// to users and regulators that can be held against you.
//
// PLACEHOLDERS in ALL CAPS must be filled in before publication. They are things
// only the operator knows: the legal entity, the contact address, the
// jurisdiction. They are deliberately obvious rather than plausible-looking
// defaults, so they cannot ship unnoticed.
// =============================================================================

export const LAST_UPDATED = "2026-08-06";

/** Filled in by the operator before publishing. Rendered literally if left. */
export const OPERATOR = {
  entity: "[LEGAL ENTITY NAME]",
  contactEmail: "[CONTACT EMAIL]",
  address: "[POSTAL ADDRESS]",
  jurisdiction: "[COUNTRY / STATE OF ESTABLISHMENT]",
};

/** True when the operator hasn't filled the placeholders in yet. */
export function policiesIncomplete() {
  return Object.values(OPERATOR).some((v) => /^\[.*\]$/.test(v));
}

// ---------------------------------------------------------------------------
// The AI disclosure. This is the one with a specific regulatory hook: the EU AI
// Act requires people to be told they are interacting with an AI system where
// that isn't obvious. This app deliberately gives its AI a name, a home town and
// a job, in the first person — which makes it exactly the case the rule is
// about, so the disclosure has to be prominent rather than buried.
// ---------------------------------------------------------------------------
export const AI_DISCLOSURE = {
  id: "ai",
  title: "About the AI in this app",
  summary: "Your guide is an AI. It is often wrong. Here's exactly what it does and what leaves your device.",
  sections: [
    {
      heading: "Your guide is not a person",
      body: [
        "Amina, Diego, Matthias and the other guides are characters played by an AI language model. They are not real people, they are not native speakers reviewing your work, and their life stories are written fiction.",
        "We give them names and home towns because a conversation with a character is easier to have than a conversation with a text box. That is a design choice, not a claim that anyone is there.",
      ],
    },
    {
      heading: "It gets things wrong",
      body: [
        "The AI can produce language that is grammatically wrong, regionally out of place, oddly formal, or simply invented. This is a known property of language models, not an occasional glitch.",
        "Do not rely on it for anything that matters — legal, medical, official or safety-critical wording. For the parts of the course that must be right, the vocabulary, example sentences and journey lines are written and checked by hand, not generated.",
        "If a correction it gives you contradicts the course, trust the course and tell us.",
      ],
    },
    {
      heading: "What it is not for",
      body: [
        "It is a language practice partner. It is not a translator you should trust for real documents, not a source of factual information about the world, and not any kind of adviser.",
        "It has no memory of you beyond this app's own record on your device, and it cannot act on your behalf anywhere.",
      ],
    },
    {
      heading: "What is sent, and to whom",
      body: [
        "When you use the conversation features, the following is sent to our server and from there to Anthropic, which runs the language model: what you type or say (as text), the recent turns of that conversation, the language and variety you are learning, the character you are talking to, and a short summary of your practice record — your level, the error patterns you repeat, and the topics you find hard.",
      "When you use Decode, only the text you pasted and the language you are learning are sent. Your practice record is not: the count of “words you already know” is worked out on your own device, by comparing the breakdown against your own progress, and never leaves it.",
        "That summary contains no name, no email and no identifier. It is derived from your own answers and looks like: “Level 3/5. Recurring trouble: past tense ending (4x). Least confident on: Directions.”",
        "Nothing is sent unless you open a conversation. Every other part of the app — lessons, flashcards, the route map, spaced repetition — works entirely on your device and sends nothing.",
      ],
    },
    {
      heading: "You can decline it",
      body: [
        "The AI features are optional and separable. Declining them leaves lessons, vocabulary, reading, grammar, the alphabet course, speaking drills and progress tracking fully working.",
        "You can turn the AI back on or off at any time in Settings.",
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
export const PRIVACY = {
  id: "privacy",
  title: "Privacy",
  summary: "Your progress stays on your device. Two things leave it, and only when you use those features.",
  sections: [
    {
      heading: "What we store, and where",
      body: [
        "Your progress — the words you have learned, your review schedule, streak, settings, fluency record and mission results — is stored in your browser's local storage on your own device.",
        "We do not have a user account system. We do not have a copy of your progress. If you clear your browser data or use a different device, it is gone, and we cannot restore it.",
        "We do not ask for your name, email address, phone number or date of birth beyond a single age confirmation described below.",
      ],
    },
    {
      heading: "What leaves your device",
      body: [
        "1. CONVERSATION TEXT, when you use the AI conversation features. See the AI disclosure for exactly what is included. It goes to our server and to Anthropic, which processes it to generate a reply. We do not store conversation content on our server beyond the moment it takes to answer.",
      "1b. TEXT YOU PASTE INTO “DECODE”, when you ask us to break down a piece of real writing. It goes the same way — to our server and to Anthropic — and comes back as a breakdown. We do not store it. Please note this is often a message written by somebody else, who has not agreed to anything: only paste what you are comfortable sending. Words you choose to save are kept on your device along with a short fragment of the sentence they came from, so you can see the context later; that fragment is included in your export and destroyed when you delete your data.",
        "2. MICROPHONE AUDIO, when you use a speaking exercise — but not to us. Speech recognition is performed by your browser. In Chrome and Chromium-based browsers this means the audio is sent to Google's speech service and a transcript is returned. In Safari it may be handled on the device or by Apple, depending on your device and language. This app never receives, stores or transmits your audio; your browser vendor does, under their privacy policy. If you would rather not, every speaking exercise can be answered by typing instead, and it is graded identically.",
      ],
    },
    {
      heading: "What we do not do",
      body: [
        "No advertising. No advertising identifiers. No tracking pixels. No selling or sharing of personal data. No profiling for anything other than choosing your next lesson on your own device.",
        "No analytics product is embedded in this app.",
      ],
    },
    {
      heading: "Third parties",
      body: [
        "Anthropic (AI model provider) — receives conversation text as described above, when you use those features.",
        "Your browser vendor (Google, Apple or other) — receives microphone audio when you use speech recognition, and may receive text when using a network text-to-speech voice.",
        "Our hosting provider — serves the application files and processes server logs, which typically include IP addresses, in the ordinary course of running a website.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "Because your data is on your own device, you already hold it. Settings has an Export button that downloads everything the app holds about you as a file, and a Delete button that erases all of it permanently.",
        "If you are in the UK, EU or another region with data protection law, you have rights of access, rectification, erasure, restriction, objection and portability. For the data on your device, Export and Delete give you those directly and immediately. For anything else, contact us at " + OPERATOR.contactEmail + ".",
        "You also have the right to complain to your data protection authority.",
      ],
    },
    {
      heading: "Children",
      body: [
        "This app is not directed at children under 13, and the AI conversation features are not available to anyone who tells us they are under 16.",
        "We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, contact us and we will act on it.",
      ],
    },
    {
      heading: "Cookies and similar",
      body: [
        "We set no cookies. The app uses your browser's local storage to remember your progress and settings, which is strictly necessary for the app to function at all — without it, the app forgets everything the moment you close the tab.",
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
export const TERMS = {
  id: "terms",
  title: "Terms of use",
  summary: "What you can expect from us, and what we ask of you.",
  sections: [
    {
      heading: "What this is",
      body: [
        "A language learning application, provided as-is, for personal and educational use.",
        "It is not a certified course, it does not lead to a qualification, and it makes no guarantee that you will reach any particular level.",
      ],
    },
    {
      heading: "No warranty on the language content",
      body: [
        "The hand-written course content is checked, but languages vary by region, register and generation, and no course is right for every speaker.",
        "AI-generated content is not checked before you see it and may be wrong. Do not use this app as the source for anything consequential — official forms, medical or legal wording, or anything where being misunderstood carries a cost.",
      ],
    },
    {
      heading: "Acceptable use",
      body: [
        "Do not use the conversation features to generate content that is illegal, abusive, hateful, sexual involving minors, or that harasses or impersonates a real person.",
        "Do not attempt to use the AI for purposes unrelated to language learning, or to extract or manipulate the underlying model.",
        "We may withdraw access to the AI features from anyone who does.",
      ],
    },
    {
      heading: "Reporting",
      body: [
        "Every AI reply has a report control. If the AI says something wrong, offensive or inappropriate, report it — that is the mechanism, and we would rather hear about it than not.",
      ],
    },
    {
      heading: "Availability",
      body: [
        "The AI features depend on a third-party service and may be unavailable. The rest of the app is designed to work without them.",
        "We may change or discontinue any part of the app.",
      ],
    },
    {
      heading: "Liability",
      body: [
        "To the fullest extent permitted by law, " + OPERATOR.entity + " is not liable for loss arising from your use of this app, including loss of progress data stored on your own device.",
        "Nothing here limits liability that cannot be limited by law.",
      ],
    },
    {
      heading: "Contact and governing law",
      body: [
        "Operator: " + OPERATOR.entity + ", " + OPERATOR.address + ".",
        "Contact: " + OPERATOR.contactEmail + ".",
        "Governed by the laws of " + OPERATOR.jurisdiction + ".",
      ],
    },
  ],
};

export const POLICIES = [AI_DISCLOSURE, PRIVACY, TERMS];

export function getPolicy(id) {
  return POLICIES.find((p) => p.id === id) || POLICIES[0];
}

// ---------------------------------------------------------------------------
// Age gating.
//
// WHY 16 FOR THE AI. Under GDPR Article 8 the age of digital consent is 16, with
// member states free to lower it to 13; the UK sets 13 but the Children's Code
// applies design duties well beyond that. Rather than trying to resolve which
// number applies to a given user in a given country, the app takes the highest
// common bar for the one feature that carries real risk — free-text conversation
// with a language model — and leaves everything else open to everyone.
//
// This is a self-declared check, which is what the overwhelming majority of
// consumer apps use. It is not verification. COMPLIANCE.md says so plainly.
// ---------------------------------------------------------------------------
export const AI_MIN_AGE = 16;
export const APP_MIN_AGE = 13;
