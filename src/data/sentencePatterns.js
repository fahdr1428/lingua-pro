// =============================================================================
// SENTENCE PATTERNS (v47) — the "Sentence Lab" progressive builder.
//
// Each language has a LADDER of sentence patterns ordered from simplest to most
// complex. A "drop" (shown every 2 lessons) teaches ONE pattern, built up in
// escalating steps. Across drops, the ladder climbs: 2-word sentences → adding
// objects → time words → negation → questions.
//
// DATA SHAPE per pattern:
// {
//   level: 1,                    // difficulty rung (1 = easiest)
//   skill: "Subject + Verb",     // what this teaches (shown to learner)
//   chunks: [                    // the sentence, broken into teachable pieces
//     { text, translit, gloss, role },   // role drives the color-coding
//   ],
//   translation: "I eat",        // full English meaning
//   extend: { ...pattern },      // optional: the "add one piece" step
//   twist: { prompt, chunks, translation }, // optional: the "make it your own" step
// }
//
// ROLES (for color coding): subject, verb, object, time, negation, question,
// particle, adjective, connector.
//
// HONESTY NOTE: Sentence construction is deeply language-specific (word order,
// agreement, particles, script direction). Patterns here are written ONLY for
// languages where they've been carefully checked. Languages without patterns
// fall back gracefully (the Sentence Lab simply doesn't appear for them yet),
// and we add verified patterns per-language over time. Never auto-generate
// these — a wrong pattern teaches wrong grammar.
// =============================================================================

export const SENTENCE_PATTERNS = {
  // ===========================================================================
  // SPANISH — high confidence. SVO order, like English; gender noted in gloss.
  // ===========================================================================
  es: [
    {
      level: 1,
      skill: "Subject + Verb",
      chunks: [
        { text: "Yo", translit: "yo", gloss: "I", role: "subject" },
        { text: "como", translit: "KO-mo", gloss: "eat", role: "verb" },
      ],
      translation: "I eat",
      extend: {
        skill: "Add what you eat",
        chunks: [
          { text: "Yo", translit: "yo", gloss: "I", role: "subject" },
          { text: "como", translit: "KO-mo", gloss: "eat", role: "verb" },
          { text: "pan", translit: "pan", gloss: "bread", role: "object" },
        ],
        translation: "I eat bread",
      },
      twist: {
        prompt: "Now say: I drink water",
        chunks: [
          { text: "Yo", translit: "yo", gloss: "I", role: "subject" },
          { text: "bebo", translit: "BE-bo", gloss: "drink", role: "verb" },
          { text: "agua", translit: "A-gwa", gloss: "water", role: "object" },
        ],
        translation: "I drink water",
      },
    },
    {
      level: 2,
      skill: "Subject + Verb + Object",
      chunks: [
        { text: "Ella", translit: "E-ya", gloss: "She", role: "subject" },
        { text: "tiene", translit: "TYE-ne", gloss: "has", role: "verb" },
        { text: "un libro", translit: "oon LEE-bro", gloss: "a book", role: "object" },
      ],
      translation: "She has a book",
      twist: {
        prompt: "Now say: He has a friend",
        chunks: [
          { text: "Él", translit: "el", gloss: "He", role: "subject" },
          { text: "tiene", translit: "TYE-ne", gloss: "has", role: "verb" },
          { text: "un amigo", translit: "oon a-MEE-go", gloss: "a friend", role: "object" },
        ],
        translation: "He has a friend",
      },
    },
    {
      level: 3,
      skill: "Adding 'want to' + action",
      chunks: [
        { text: "Quiero", translit: "KYE-ro", gloss: "I want", role: "verb" },
        { text: "comer", translit: "ko-MER", gloss: "to eat", role: "verb" },
        { text: "ahora", translit: "a-O-ra", gloss: "now", role: "time" },
      ],
      translation: "I want to eat now",
      twist: {
        prompt: "Now say: I want to drink now",
        chunks: [
          { text: "Quiero", translit: "KYE-ro", gloss: "I want", role: "verb" },
          { text: "beber", translit: "be-BER", gloss: "to drink", role: "verb" },
          { text: "ahora", translit: "a-O-ra", gloss: "now", role: "time" },
        ],
        translation: "I want to drink now",
      },
    },
    {
      level: 4,
      skill: "Making it negative",
      chunks: [
        { text: "Yo", translit: "yo", gloss: "I", role: "subject" },
        { text: "no", translit: "no", gloss: "don't", role: "negation" },
        { text: "hablo", translit: "A-blo", gloss: "speak", role: "verb" },
        { text: "inglés", translit: "een-GLES", gloss: "English", role: "object" },
      ],
      translation: "I don't speak English",
      twist: {
        prompt: "Now say: I don't eat meat",
        chunks: [
          { text: "Yo", translit: "yo", gloss: "I", role: "subject" },
          { text: "no", translit: "no", gloss: "don't", role: "negation" },
          { text: "como", translit: "KO-mo", gloss: "eat", role: "verb" },
          { text: "carne", translit: "KAR-ne", gloss: "meat", role: "object" },
        ],
        translation: "I don't eat meat",
      },
    },
    {
      level: 5,
      skill: "Asking a question",
      chunks: [
        { text: "¿Dónde", translit: "DON-de", gloss: "Where", role: "question" },
        { text: "está", translit: "es-TA", gloss: "is", role: "verb" },
        { text: "el baño?", translit: "el BA-nyo", gloss: "the bathroom", role: "object" },
      ],
      translation: "Where is the bathroom?",
      twist: {
        prompt: "Now ask: Where is the hotel?",
        chunks: [
          { text: "¿Dónde", translit: "DON-de", gloss: "Where", role: "question" },
          { text: "está", translit: "es-TA", gloss: "is", role: "verb" },
          { text: "el hotel?", translit: "el o-TEL", gloss: "the hotel", role: "object" },
        ],
        translation: "Where is the hotel?",
      },
    },
  ],

  // ===========================================================================
  // FRENCH — SVO, mirrors English. Negation = ne...pas around the verb.
  // High confidence (close to English structure). Gender noted in glosses.
  // ===========================================================================
  fr: [
    {
      level: 1,
      skill: "Subject + Verb",
      chunks: [
        { text: "Je", translit: "zhuh", gloss: "I", role: "subject" },
        { text: "mange", translit: "monzh", gloss: "eat", role: "verb" },
      ],
      translation: "I eat",
      extend: {
        skill: "Add what you eat",
        chunks: [
          { text: "Je", translit: "zhuh", gloss: "I", role: "subject" },
          { text: "mange", translit: "monzh", gloss: "eat", role: "verb" },
          { text: "du pain", translit: "doo pan", gloss: "bread", role: "object" },
        ],
        translation: "I eat bread",
      },
      twist: {
        prompt: "Now say: I drink water (drink = bois, water = de l'eau)",
        chunks: [
          { text: "Je", translit: "zhuh", gloss: "I", role: "subject" },
          { text: "bois", translit: "bwah", gloss: "drink", role: "verb" },
          { text: "de l'eau", translit: "duh loh", gloss: "water", role: "object" },
        ],
        translation: "I drink water",
      },
    },
    {
      level: 2,
      skill: "Subject + Verb + Object",
      chunks: [
        { text: "Elle", translit: "el", gloss: "She", role: "subject" },
        { text: "a", translit: "ah", gloss: "has", role: "verb" },
        { text: "un livre", translit: "an leevr", gloss: "a book", role: "object" },
      ],
      translation: "She has a book",
      twist: {
        prompt: "Now say: He has a friend (friend = un ami)",
        chunks: [
          { text: "Il", translit: "eel", gloss: "He", role: "subject" },
          { text: "a", translit: "ah", gloss: "has", role: "verb" },
          { text: "un ami", translit: "an a-mee", gloss: "a friend", role: "object" },
        ],
        translation: "He has a friend",
      },
    },
    {
      level: 3,
      skill: "Saying what you want to do",
      chunks: [
        { text: "Je veux", translit: "zhuh vuh", gloss: "I want", role: "verb" },
        { text: "manger", translit: "mon-zhay", gloss: "to eat", role: "verb" },
        { text: "maintenant", translit: "mant-non", gloss: "now", role: "time" },
      ],
      translation: "I want to eat now",
      twist: {
        prompt: "Now say: I want to drink now (to drink = boire)",
        chunks: [
          { text: "Je veux", translit: "zhuh vuh", gloss: "I want", role: "verb" },
          { text: "boire", translit: "bwahr", gloss: "to drink", role: "verb" },
          { text: "maintenant", translit: "mant-non", gloss: "now", role: "time" },
        ],
        translation: "I want to drink now",
      },
    },
    {
      level: 4,
      skill: "Making it negative (ne...pas wraps the verb)",
      chunks: [
        { text: "Je", translit: "zhuh", gloss: "I", role: "subject" },
        { text: "ne parle pas", translit: "nuh parl pah", gloss: "don't speak", role: "negation" },
        { text: "anglais", translit: "on-glay", gloss: "English", role: "object" },
      ],
      translation: "I don't speak English",
      note: "French wraps the verb: ne + [verb] + pas. Here 'ne parle pas' = don't speak.",
      twist: {
        prompt: "Now say: I don't eat meat (eat = mange, meat = de viande)",
        chunks: [
          { text: "Je", translit: "zhuh", gloss: "I", role: "subject" },
          { text: "ne mange pas", translit: "nuh monzh pah", gloss: "don't eat", role: "negation" },
          { text: "de viande", translit: "duh vyand", gloss: "meat", role: "object" },
        ],
        translation: "I don't eat meat",
      },
    },
    {
      level: 5,
      skill: "Asking 'where'",
      chunks: [
        { text: "Où", translit: "oo", gloss: "Where", role: "question" },
        { text: "est", translit: "eh", gloss: "is", role: "verb" },
        { text: "la toilette ?", translit: "lah twa-let", gloss: "the bathroom", role: "object" },
      ],
      translation: "Where is the bathroom?",
      twist: {
        prompt: "Now ask: Where is the hotel? (hotel = l'hôtel)",
        chunks: [
          { text: "Où", translit: "oo", gloss: "Where", role: "question" },
          { text: "est", translit: "eh", gloss: "is", role: "verb" },
          { text: "l'hôtel ?", translit: "loh-tel", gloss: "the hotel", role: "object" },
        ],
        translation: "Where is the hotel?",
      },
    },
  ],

  // ===========================================================================
  // HINDI — SOV (verb last), parallel to Urdu. Devanagari script.
  // High confidence (mirrors verified Urdu structure).
  // ===========================================================================
  hi: [
    {
      level: 1,
      skill: "Subject + Verb (verb comes LAST in Hindi)",
      chunks: [
        { text: "मैं", translit: "main", gloss: "I", role: "subject" },
        { text: "खाता हूँ", translit: "khaata hoon", gloss: "eat", role: "verb" },
      ],
      translation: "I eat",
      note: "Like Urdu, Hindi puts the verb at the END of the sentence.",
      extend: {
        skill: "Add the object (before the verb)",
        chunks: [
          { text: "मैं", translit: "main", gloss: "I", role: "subject" },
          { text: "रोटी", translit: "roti", gloss: "bread", role: "object" },
          { text: "खाता हूँ", translit: "khaata hoon", gloss: "eat", role: "verb" },
        ],
        translation: "I eat bread",
      },
      twist: {
        prompt: "Now say: I drink water (water = पानी paani, drink = पीता हूँ peeta hoon)",
        chunks: [
          { text: "मैं", translit: "main", gloss: "I", role: "subject" },
          { text: "पानी", translit: "paani", gloss: "water", role: "object" },
          { text: "पीता हूँ", translit: "peeta hoon", gloss: "drink", role: "verb" },
        ],
        translation: "I drink water",
      },
    },
    {
      level: 2,
      skill: "Subject + Object + Verb",
      chunks: [
        { text: "वह", translit: "voh", gloss: "She/He", role: "subject" },
        { text: "किताब", translit: "kitaab", gloss: "a book", role: "object" },
        { text: "पढ़ती है", translit: "parhti hai", gloss: "reads", role: "verb" },
      ],
      translation: "She reads a book",
      twist: {
        prompt: "Now say: He writes a letter (letter = पत्र patra, writes = लिखता है likhta hai)",
        chunks: [
          { text: "वह", translit: "voh", gloss: "He", role: "subject" },
          { text: "पत्र", translit: "patra", gloss: "a letter", role: "object" },
          { text: "लिखता है", translit: "likhta hai", gloss: "writes", role: "verb" },
        ],
        translation: "He writes a letter",
      },
    },
    {
      level: 3,
      skill: "Saying what you want",
      chunks: [
        { text: "मुझे", translit: "mujhe", gloss: "I (to me)", role: "subject" },
        { text: "पानी", translit: "paani", gloss: "water", role: "object" },
        { text: "चाहिए", translit: "chahiye", gloss: "want", role: "verb" },
      ],
      translation: "I want water",
      note: "For 'want', Hindi uses मुझे (mujhe, 'to me'), like Urdu.",
      twist: {
        prompt: "Now say: I want tea (tea = चाय chai)",
        chunks: [
          { text: "मुझे", translit: "mujhe", gloss: "I (to me)", role: "subject" },
          { text: "चाय", translit: "chai", gloss: "tea", role: "object" },
          { text: "चाहिए", translit: "chahiye", gloss: "want", role: "verb" },
        ],
        translation: "I want tea",
      },
    },
    {
      level: 4,
      skill: "Making it negative",
      chunks: [
        { text: "मैं", translit: "main", gloss: "I", role: "subject" },
        { text: "हिंदी", translit: "Hindi", gloss: "Hindi", role: "object" },
        { text: "नहीं", translit: "nahin", gloss: "don't", role: "negation" },
        { text: "बोलता", translit: "bolta", gloss: "speak", role: "verb" },
      ],
      translation: "I don't speak Hindi",
      note: "नहीं (nahin, 'not') goes right before the verb.",
      twist: {
        prompt: "Now say: I don't eat meat (meat = माँस maans)",
        chunks: [
          { text: "मैं", translit: "main", gloss: "I", role: "subject" },
          { text: "माँस", translit: "maans", gloss: "meat", role: "object" },
          { text: "नहीं", translit: "nahin", gloss: "don't", role: "negation" },
          { text: "खाता", translit: "khaata", gloss: "eat", role: "verb" },
        ],
        translation: "I don't eat meat",
      },
    },
    {
      level: 5,
      skill: "Asking 'where'",
      chunks: [
        { text: "बाथरूम", translit: "bathroom", gloss: "bathroom", role: "object" },
        { text: "कहाँ", translit: "kahan", gloss: "where", role: "question" },
        { text: "है?", translit: "hai", gloss: "is", role: "verb" },
      ],
      translation: "Where is the bathroom?",
      twist: {
        prompt: "Now ask: Where is the station? (station = स्टेशन station)",
        chunks: [
          { text: "स्टेशन", translit: "station", gloss: "station", role: "object" },
          { text: "कहाँ", translit: "kahan", gloss: "where", role: "question" },
          { text: "है?", translit: "hai", gloss: "is", role: "verb" },
        ],
        translation: "Where is the station?",
      },
    },
  ],

  // ===========================================================================
  // INDONESIAN — SVO, no conjugation or gender. Clean, simple structure.
  // High confidence.
  // ===========================================================================
  id: [
    {
      level: 1,
      skill: "Subject + Verb",
      chunks: [
        { text: "Saya", translit: "SA-ya", gloss: "I", role: "subject" },
        { text: "makan", translit: "MA-kan", gloss: "eat", role: "verb" },
      ],
      translation: "I eat",
      extend: {
        skill: "Add what you eat",
        chunks: [
          { text: "Saya", translit: "SA-ya", gloss: "I", role: "subject" },
          { text: "makan", translit: "MA-kan", gloss: "eat", role: "verb" },
          { text: "nasi", translit: "NA-si", gloss: "rice", role: "object" },
        ],
        translation: "I eat rice",
      },
      twist: {
        prompt: "Now say: I drink water (drink = minum, water = air)",
        chunks: [
          { text: "Saya", translit: "SA-ya", gloss: "I", role: "subject" },
          { text: "minum", translit: "MI-num", gloss: "drink", role: "verb" },
          { text: "air", translit: "A-ir", gloss: "water", role: "object" },
        ],
        translation: "I drink water",
      },
    },
    {
      level: 2,
      skill: "Subject + Verb + Object",
      chunks: [
        { text: "Dia", translit: "DI-a", gloss: "She/He", role: "subject" },
        { text: "punya", translit: "POO-nya", gloss: "has", role: "verb" },
        { text: "buku", translit: "BOO-ku", gloss: "a book", role: "object" },
      ],
      translation: "She/He has a book",
      note: "Indonesian 'dia' means both he and she — no gender!",
      twist: {
        prompt: "Now say: I have a friend (friend = teman)",
        chunks: [
          { text: "Saya", translit: "SA-ya", gloss: "I", role: "subject" },
          { text: "punya", translit: "POO-nya", gloss: "have", role: "verb" },
          { text: "teman", translit: "te-MAN", gloss: "a friend", role: "object" },
        ],
        translation: "I have a friend",
      },
    },
    {
      level: 3,
      skill: "Saying what you want to do",
      chunks: [
        { text: "Saya", translit: "SA-ya", gloss: "I", role: "subject" },
        { text: "mau", translit: "mow", gloss: "want", role: "verb" },
        { text: "makan", translit: "MA-kan", gloss: "to eat", role: "verb" },
      ],
      translation: "I want to eat",
      twist: {
        prompt: "Now say: I want to drink (to drink = minum)",
        chunks: [
          { text: "Saya", translit: "SA-ya", gloss: "I", role: "subject" },
          { text: "mau", translit: "mow", gloss: "want", role: "verb" },
          { text: "minum", translit: "MI-num", gloss: "to drink", role: "verb" },
        ],
        translation: "I want to drink",
      },
    },
    {
      level: 4,
      skill: "Making it negative (tidak before the verb)",
      chunks: [
        { text: "Saya", translit: "SA-ya", gloss: "I", role: "subject" },
        { text: "tidak", translit: "TI-dak", gloss: "don't", role: "negation" },
        { text: "makan", translit: "MA-kan", gloss: "eat", role: "verb" },
        { text: "daging", translit: "DA-ging", gloss: "meat", role: "object" },
      ],
      translation: "I don't eat meat",
      note: "'tidak' (not) goes before the verb to make it negative.",
      twist: {
        prompt: "Now say: I don't drink coffee (coffee = kopi)",
        chunks: [
          { text: "Saya", translit: "SA-ya", gloss: "I", role: "subject" },
          { text: "tidak", translit: "TI-dak", gloss: "don't", role: "negation" },
          { text: "minum", translit: "MI-num", gloss: "drink", role: "verb" },
          { text: "kopi", translit: "KO-pi", gloss: "coffee", role: "object" },
        ],
        translation: "I don't drink coffee",
      },
    },
    {
      level: 5,
      skill: "Asking 'where'",
      chunks: [
        { text: "Di mana", translit: "di MA-na", gloss: "Where", role: "question" },
        { text: "toilet?", translit: "TOI-let", gloss: "bathroom", role: "object" },
      ],
      translation: "Where is the bathroom?",
      note: "Indonesian often drops 'is' — 'Di mana toilet?' literally 'Where bathroom?'",
      twist: {
        prompt: "Now ask: Where is the hotel? (hotel = hotel)",
        chunks: [
          { text: "Di mana", translit: "di MA-na", gloss: "Where", role: "question" },
          { text: "hotel?", translit: "ho-TEL", gloss: "hotel", role: "object" },
        ],
        translation: "Where is the hotel?",
      },
    },
  ],

  // ===========================================================================
  // NIGERIAN PIDGIN — SVO, English-based. High confidence.
  // ===========================================================================
  pcm: [
    {
      level: 1,
      skill: "Subject + Verb",
      chunks: [
        { text: "I", translit: "I", gloss: "I", role: "subject" },
        { text: "dey chop", translit: "day chop", gloss: "am eating", role: "verb" },
      ],
      translation: "I am eating",
      note: "'dey' before a verb makes it ongoing — 'dey chop' = eating.",
      extend: {
        skill: "Add what you eat",
        chunks: [
          { text: "I", translit: "I", gloss: "I", role: "subject" },
          { text: "dey chop", translit: "day chop", gloss: "am eating", role: "verb" },
          { text: "rice", translit: "rice", gloss: "rice", role: "object" },
        ],
        translation: "I am eating rice",
      },
      twist: {
        prompt: "Now say: I am drinking water (drink = drink, water = water)",
        chunks: [
          { text: "I", translit: "I", gloss: "I", role: "subject" },
          { text: "dey drink", translit: "day drink", gloss: "am drinking", role: "verb" },
          { text: "water", translit: "water", gloss: "water", role: "object" },
        ],
        translation: "I am drinking water",
      },
    },
    {
      level: 2,
      skill: "Saying what you want",
      chunks: [
        { text: "I", translit: "I", gloss: "I", role: "subject" },
        { text: "wan", translit: "wan", gloss: "want", role: "verb" },
        { text: "chop", translit: "chop", gloss: "to eat", role: "verb" },
      ],
      translation: "I want to eat",
      twist: {
        prompt: "Now say: I want water (water = water)",
        chunks: [
          { text: "I", translit: "I", gloss: "I", role: "subject" },
          { text: "wan", translit: "wan", gloss: "want", role: "verb" },
          { text: "water", translit: "water", gloss: "water", role: "object" },
        ],
        translation: "I want water",
      },
    },
    {
      level: 3,
      skill: "Making it negative (no before the verb)",
      chunks: [
        { text: "I", translit: "I", gloss: "I", role: "subject" },
        { text: "no", translit: "no", gloss: "don't", role: "negation" },
        { text: "sabi", translit: "SA-bi", gloss: "know", role: "verb" },
      ],
      translation: "I don't know",
      note: "'no' before the verb makes it negative. 'sabi' = to know.",
      twist: {
        prompt: "Now say: I don't want (want = want)",
        chunks: [
          { text: "I", translit: "I", gloss: "I", role: "subject" },
          { text: "no", translit: "no", gloss: "don't", role: "negation" },
          { text: "want", translit: "want", gloss: "want", role: "verb" },
        ],
        translation: "I don't want",
      },
    },
    {
      level: 4,
      skill: "Asking a question",
      chunks: [
        { text: "Wetin", translit: "WE-tin", gloss: "What", role: "question" },
        { text: "be", translit: "be", gloss: "is", role: "verb" },
        { text: "dis?", translit: "dis", gloss: "this", role: "object" },
      ],
      translation: "What is this?",
      twist: {
        prompt: "Now ask: What is that? (that = dat)",
        chunks: [
          { text: "Wetin", translit: "WE-tin", gloss: "What", role: "question" },
          { text: "be", translit: "be", gloss: "is", role: "verb" },
          { text: "dat?", translit: "dat", gloss: "that", role: "object" },
        ],
        translation: "What is that?",
      },
    },
    {
      level: 5,
      skill: "Asking the price",
      chunks: [
        { text: "How much", translit: "how much", gloss: "How much", role: "question" },
        { text: "be", translit: "be", gloss: "is", role: "verb" },
        { text: "dis?", translit: "dis", gloss: "this", role: "object" },
      ],
      translation: "How much is this?",
      twist: {
        prompt: "Now ask: How much is that? (that = dat)",
        chunks: [
          { text: "How much", translit: "how much", gloss: "How much", role: "question" },
          { text: "be", translit: "be", gloss: "is", role: "verb" },
          { text: "dat?", translit: "dat", gloss: "that", role: "object" },
        ],
        translation: "How much is that?",
      },
    },
  ],

  // Verified against standard Urdu grammar. Translit guides pronunciation.
  // Note: Urdu verb agrees with gender/number; glosses kept simple for learners.
  // ===========================================================================
  ur: [
    {
      level: 1,
      skill: "Subject + Verb (note: verb comes LAST in Urdu)",
      chunks: [
        { text: "میں", translit: "main", gloss: "I", role: "subject" },
        { text: "کھاتا ہوں", translit: "khaata hoon", gloss: "eat", role: "verb" },
      ],
      translation: "I eat",
      note: "In Urdu the verb goes at the END of the sentence, unlike English.",
      extend: {
        skill: "Add the object (it goes BEFORE the verb)",
        chunks: [
          { text: "میں", translit: "main", gloss: "I", role: "subject" },
          { text: "روٹی", translit: "roti", gloss: "bread", role: "object" },
          { text: "کھاتا ہوں", translit: "khaata hoon", gloss: "eat", role: "verb" },
        ],
        translation: "I eat bread",
      },
      twist: {
        prompt: "Now say: I drink water (water = پانی paani, drink = پیتا ہوں peeta hoon)",
        chunks: [
          { text: "میں", translit: "main", gloss: "I", role: "subject" },
          { text: "پانی", translit: "paani", gloss: "water", role: "object" },
          { text: "پیتا ہوں", translit: "peeta hoon", gloss: "drink", role: "verb" },
        ],
        translation: "I drink water",
      },
    },
    {
      level: 2,
      skill: "Subject + Object + Verb",
      chunks: [
        { text: "وہ", translit: "woh", gloss: "She/He", role: "subject" },
        { text: "کتاب", translit: "kitaab", gloss: "a book", role: "object" },
        { text: "پڑھتی ہے", translit: "parhti hai", gloss: "reads", role: "verb" },
      ],
      translation: "She reads a book",
      twist: {
        prompt: "Now say: He writes a letter (letter = خط khat, writes = لکھتا ہے likhta hai)",
        chunks: [
          { text: "وہ", translit: "woh", gloss: "He", role: "subject" },
          { text: "خط", translit: "khat", gloss: "a letter", role: "object" },
          { text: "لکھتا ہے", translit: "likhta hai", gloss: "writes", role: "verb" },
        ],
        translation: "He writes a letter",
      },
    },
    {
      level: 3,
      skill: "Saying what you want",
      chunks: [
        { text: "مجھے", translit: "mujhe", gloss: "I (to me)", role: "subject" },
        { text: "پانی", translit: "paani", gloss: "water", role: "object" },
        { text: "چاہیے", translit: "chahiye", gloss: "want/need", role: "verb" },
      ],
      translation: "I want water",
      note: "For 'want', Urdu uses مجھے (mujhe, 'to me') instead of میں.",
      twist: {
        prompt: "Now say: I want tea (tea = چائے chai)",
        chunks: [
          { text: "مجھے", translit: "mujhe", gloss: "I (to me)", role: "subject" },
          { text: "چائے", translit: "chai", gloss: "tea", role: "object" },
          { text: "چاہیے", translit: "chahiye", gloss: "want", role: "verb" },
        ],
        translation: "I want tea",
      },
    },
    {
      level: 4,
      skill: "Making it negative",
      chunks: [
        { text: "میں", translit: "main", gloss: "I", role: "subject" },
        { text: "اردو", translit: "Urdu", gloss: "Urdu", role: "object" },
        { text: "نہیں", translit: "nahin", gloss: "don't", role: "negation" },
        { text: "بولتا", translit: "bolta", gloss: "speak", role: "verb" },
      ],
      translation: "I don't speak Urdu",
      note: "نہیں (nahin, 'not') goes right before the verb.",
      twist: {
        prompt: "Now say: I don't eat meat (meat = گوشت gosht)",
        chunks: [
          { text: "میں", translit: "main", gloss: "I", role: "subject" },
          { text: "گوشت", translit: "gosht", gloss: "meat", role: "object" },
          { text: "نہیں", translit: "nahin", gloss: "don't", role: "negation" },
          { text: "کھاتا", translit: "khaata", gloss: "eat", role: "verb" },
        ],
        translation: "I don't eat meat",
      },
    },
    {
      level: 5,
      skill: "Asking 'where'",
      chunks: [
        { text: "باتھ روم", translit: "bathroom", gloss: "bathroom", role: "object" },
        { text: "کہاں", translit: "kahan", gloss: "where", role: "question" },
        { text: "ہے؟", translit: "hai", gloss: "is", role: "verb" },
      ],
      translation: "Where is the bathroom?",
      twist: {
        prompt: "Now ask: Where is the station? (station = اسٹیشن station)",
        chunks: [
          { text: "اسٹیشن", translit: "station", gloss: "station", role: "object" },
          { text: "کہاں", translit: "kahan", gloss: "where", role: "question" },
          { text: "ہے؟", translit: "hai", gloss: "is", role: "verb" },
        ],
        translation: "Where is the station?",
      },
    },
  ],

  // ===========================================================================
  // JAPANESE — SOV (verb ALWAYS last). Particles: は (wa, topic), を (o, object).
  // Questions add か (ka) at end, no word-order change. Negation conjugates verb.
  // Web-verified (Bunpo, 8020japanese, Migaku, Tofugu sources).
  // ===========================================================================
  ja: [
    {
      level: 1,
      skill: "Topic + Verb (verb comes LAST, は marks the topic)",
      chunks: [
        { text: "私は", translit: "watashi wa", gloss: "I (topic)", role: "subject" },
        { text: "食べます", translit: "tabemasu", gloss: "eat", role: "verb" },
      ],
      translation: "I eat",
      note: "は (written 'ha', said 'wa') marks the topic. The verb always ends the sentence.",
      extend: {
        skill: "Add the object with を (o)",
        chunks: [
          { text: "私は", translit: "watashi wa", gloss: "I (topic)", role: "subject" },
          { text: "寿司を", translit: "sushi o", gloss: "sushi (object)", role: "object" },
          { text: "食べます", translit: "tabemasu", gloss: "eat", role: "verb" },
        ],
        translation: "I eat sushi",
      },
      twist: {
        prompt: "Now say: I drink water (water = 水 mizu, drink = 飲みます nomimasu)",
        chunks: [
          { text: "私は", translit: "watashi wa", gloss: "I (topic)", role: "subject" },
          { text: "水を", translit: "mizu o", gloss: "water (object)", role: "object" },
          { text: "飲みます", translit: "nomimasu", gloss: "drink", role: "verb" },
        ],
        translation: "I drink water",
      },
    },
    {
      level: 2,
      skill: "Saying what something is (X は Y です)",
      chunks: [
        { text: "これは", translit: "kore wa", gloss: "This (topic)", role: "subject" },
        { text: "本", translit: "hon", gloss: "book", role: "object" },
        { text: "です", translit: "desu", gloss: "is", role: "verb" },
      ],
      translation: "This is a book",
      note: "です (desu) means 'is/am' and goes at the very end.",
      twist: {
        prompt: "Now say: I am a student (student = 学生 gakusei)",
        chunks: [
          { text: "私は", translit: "watashi wa", gloss: "I (topic)", role: "subject" },
          { text: "学生", translit: "gakusei", gloss: "student", role: "object" },
          { text: "です", translit: "desu", gloss: "am", role: "verb" },
        ],
        translation: "I am a student",
      },
    },
    {
      level: 3,
      skill: "Drinking something at a place",
      chunks: [
        { text: "私は", translit: "watashi wa", gloss: "I (topic)", role: "subject" },
        { text: "コーヒーを", translit: "koohii o", gloss: "coffee (object)", role: "object" },
        { text: "飲みます", translit: "nomimasu", gloss: "drink", role: "verb" },
      ],
      translation: "I drink coffee",
      twist: {
        prompt: "Now say: I watch TV (TV = テレビ terebi, watch = 見ます mimasu)",
        chunks: [
          { text: "私は", translit: "watashi wa", gloss: "I (topic)", role: "subject" },
          { text: "テレビを", translit: "terebi o", gloss: "TV (object)", role: "object" },
          { text: "見ます", translit: "mimasu", gloss: "watch", role: "verb" },
        ],
        translation: "I watch TV",
      },
    },
    {
      level: 4,
      skill: "Making it negative (verb ending changes to ません)",
      chunks: [
        { text: "私は", translit: "watashi wa", gloss: "I (topic)", role: "subject" },
        { text: "肉を", translit: "niku o", gloss: "meat (object)", role: "object" },
        { text: "食べません", translit: "tabemasen", gloss: "don't eat", role: "negation" },
      ],
      translation: "I don't eat meat",
      note: "To make it negative, 食べます (tabemasu) becomes 食べません (tabemasen). The verb still ends the sentence.",
      twist: {
        prompt: "Now say: I don't drink coffee (drink negative = 飲みません nomimasen)",
        chunks: [
          { text: "私は", translit: "watashi wa", gloss: "I (topic)", role: "subject" },
          { text: "コーヒーを", translit: "koohii o", gloss: "coffee (object)", role: "object" },
          { text: "飲みません", translit: "nomimasen", gloss: "don't drink", role: "negation" },
        ],
        translation: "I don't drink coffee",
      },
    },
    {
      level: 5,
      skill: "Asking a question (just add か at the end!)",
      chunks: [
        { text: "あなたは", translit: "anata wa", gloss: "You (topic)", role: "subject" },
        { text: "日本語を", translit: "nihongo o", gloss: "Japanese (object)", role: "object" },
        { text: "話します", translit: "hanashimasu", gloss: "speak", role: "verb" },
        { text: "か", translit: "ka", gloss: "?", role: "question" },
      ],
      translation: "Do you speak Japanese?",
      note: "To ask a question, just add か (ka) at the end — the word order doesn't change!",
      twist: {
        prompt: "Now ask: Do you eat sushi? (eat = 食べます tabemasu)",
        chunks: [
          { text: "あなたは", translit: "anata wa", gloss: "You (topic)", role: "subject" },
          { text: "寿司を", translit: "sushi o", gloss: "sushi (object)", role: "object" },
          { text: "食べます", translit: "tabemasu", gloss: "eat", role: "verb" },
          { text: "か", translit: "ka", gloss: "?", role: "question" },
        ],
        translation: "Do you eat sushi?",
      },
    },
  ],

  // ===========================================================================
  // KOREAN — SOV (verb last). Topic 은/는 (eun/neun), object 을/를 (eul/reul).
  // Polite ending -요 (yo). Negation 안 (an) before the verb. Web-verified
  // (90DayKorean, Busuu, Preply, Talkpal sources).
  // ===========================================================================
  ko: [
    {
      level: 1,
      skill: "Topic + Verb (verb comes LAST, 는 marks the topic)",
      chunks: [
        { text: "저는", translit: "jeo-neun", gloss: "I (topic)", role: "subject" },
        { text: "먹어요", translit: "meog-eo-yo", gloss: "eat", role: "verb" },
      ],
      translation: "I eat",
      note: "저 (jeo) = I (polite). 는 marks the topic. The verb ends the sentence, with -요 for politeness.",
      extend: {
        skill: "Add the object with 을 (eul)",
        chunks: [
          { text: "저는", translit: "jeo-neun", gloss: "I (topic)", role: "subject" },
          { text: "밥을", translit: "bab-eul", gloss: "rice (object)", role: "object" },
          { text: "먹어요", translit: "meog-eo-yo", gloss: "eat", role: "verb" },
        ],
        translation: "I eat rice",
      },
      twist: {
        prompt: "Now say: I drink water (water = 물 mul, drink = 마셔요 masyeoyo)",
        chunks: [
          { text: "저는", translit: "jeo-neun", gloss: "I (topic)", role: "subject" },
          { text: "물을", translit: "mul-eul", gloss: "water (object)", role: "object" },
          { text: "마셔요", translit: "ma-syeo-yo", gloss: "drink", role: "verb" },
        ],
        translation: "I drink water",
      },
    },
    {
      level: 2,
      skill: "Saying what you are (저는 ... 이에요)",
      chunks: [
        { text: "저는", translit: "jeo-neun", gloss: "I (topic)", role: "subject" },
        { text: "학생", translit: "hak-saeng", gloss: "student", role: "object" },
        { text: "이에요", translit: "i-e-yo", gloss: "am", role: "verb" },
      ],
      translation: "I am a student",
      note: "이에요 (ieyo) means 'am/is' and goes at the end.",
      twist: {
        prompt: "Now say: I study Korean (Korean = 한국어 hangugeo, study = 공부해요 gongbuhaeyo)",
        chunks: [
          { text: "저는", translit: "jeo-neun", gloss: "I (topic)", role: "subject" },
          { text: "한국어를", translit: "han-gug-eo-reul", gloss: "Korean (object)", role: "object" },
          { text: "공부해요", translit: "gong-bu-hae-yo", gloss: "study", role: "verb" },
        ],
        translation: "I study Korean",
      },
    },
    {
      level: 3,
      skill: "Drinking something",
      chunks: [
        { text: "저는", translit: "jeo-neun", gloss: "I (topic)", role: "subject" },
        { text: "커피를", translit: "keo-pi-reul", gloss: "coffee (object)", role: "object" },
        { text: "마셔요", translit: "ma-syeo-yo", gloss: "drink", role: "verb" },
      ],
      translation: "I drink coffee",
      twist: {
        prompt: "Now say: I read a book (book = 책 chaek, read = 읽어요 ilgeoyo)",
        chunks: [
          { text: "저는", translit: "jeo-neun", gloss: "I (topic)", role: "subject" },
          { text: "책을", translit: "chaeg-eul", gloss: "book (object)", role: "object" },
          { text: "읽어요", translit: "ilg-eo-yo", gloss: "read", role: "verb" },
        ],
        translation: "I read a book",
      },
    },
    {
      level: 4,
      skill: "Making it negative (안 before the verb)",
      chunks: [
        { text: "저는", translit: "jeo-neun", gloss: "I (topic)", role: "subject" },
        { text: "고기를", translit: "go-gi-reul", gloss: "meat (object)", role: "object" },
        { text: "안", translit: "an", gloss: "don't", role: "negation" },
        { text: "먹어요", translit: "meog-eo-yo", gloss: "eat", role: "verb" },
      ],
      translation: "I don't eat meat",
      note: "안 (an) goes right before the verb to make it negative.",
      twist: {
        prompt: "Now say: I don't drink coffee",
        chunks: [
          { text: "저는", translit: "jeo-neun", gloss: "I (topic)", role: "subject" },
          { text: "커피를", translit: "keo-pi-reul", gloss: "coffee (object)", role: "object" },
          { text: "안", translit: "an", gloss: "don't", role: "negation" },
          { text: "마셔요", translit: "ma-syeo-yo", gloss: "drink", role: "verb" },
        ],
        translation: "I don't drink coffee",
      },
    },
    {
      level: 5,
      skill: "Asking 'where' (어디)",
      chunks: [
        { text: "화장실이", translit: "hwa-jang-sil-i", gloss: "bathroom", role: "object" },
        { text: "어디", translit: "eo-di", gloss: "where", role: "question" },
        { text: "예요?", translit: "ye-yo", gloss: "is", role: "verb" },
      ],
      translation: "Where is the bathroom?",
      twist: {
        prompt: "Now ask: Where is the station? (station = 역 yeok)",
        chunks: [
          { text: "역이", translit: "yeog-i", gloss: "station", role: "object" },
          { text: "어디", translit: "eo-di", gloss: "where", role: "question" },
          { text: "예요?", translit: "ye-yo", gloss: "is", role: "verb" },
        ],
        translation: "Where is the station?",
      },
    },
  ],

  // ===========================================================================
  // ARABIC — beginner-friendly NOMINAL sentences (no verb needed) + simple
  // verbal ones. RTL script. Negation لا (la) before verb / مش for nominal.
  // Questions with هل (hal). Web-verified (Shaykhi, AlifBee, ArabicPod101).
  // We use nominal sentences for beginners — they're correct AND simpler.
  // ===========================================================================
  ar: [
    {
      level: 1,
      skill: "Saying who you are (no verb needed in Arabic!)",
      chunks: [
        { text: "أنا", translit: "ana", gloss: "I am", role: "subject" },
        { text: "طالب", translit: "taalib", gloss: "a student", role: "object" },
      ],
      translation: "I am a student",
      note: "Arabic doesn't need a verb for 'am/is'. أنا طالب literally = 'I student'.",
      extend: {
        skill: "Describe yourself",
        chunks: [
          { text: "أنا", translit: "ana", gloss: "I am", role: "subject" },
          { text: "سعيد", translit: "sa3eed", gloss: "happy", role: "adjective" },
        ],
        translation: "I am happy",
      },
      twist: {
        prompt: "Now say: I am a teacher (teacher = مدرس mudarris)",
        chunks: [
          { text: "أنا", translit: "ana", gloss: "I am", role: "subject" },
          { text: "مدرس", translit: "mudarris", gloss: "a teacher", role: "object" },
        ],
        translation: "I am a teacher",
      },
    },
    {
      level: 2,
      skill: "Saying you have something (عندي)",
      chunks: [
        { text: "عندي", translit: "3indi", gloss: "I have", role: "verb" },
        { text: "كتاب", translit: "kitaab", gloss: "a book", role: "object" },
      ],
      translation: "I have a book",
      note: "عندي (3indi) means 'I have' — literally 'at me'.",
      twist: {
        prompt: "Now say: I have a car (car = سيارة sayyaara)",
        chunks: [
          { text: "عندي", translit: "3indi", gloss: "I have", role: "verb" },
          { text: "سيارة", translit: "sayyaara", gloss: "a car", role: "object" },
        ],
        translation: "I have a car",
      },
    },
    {
      level: 3,
      skill: "Saying what you want (أريد)",
      chunks: [
        { text: "أريد", translit: "ureed", gloss: "I want", role: "verb" },
        { text: "ماء", translit: "maa'", gloss: "water", role: "object" },
      ],
      translation: "I want water",
      twist: {
        prompt: "Now say: I want tea (tea = شاي shaay)",
        chunks: [
          { text: "أريد", translit: "ureed", gloss: "I want", role: "verb" },
          { text: "شاي", translit: "shaay", gloss: "tea", role: "object" },
        ],
        translation: "I want tea",
      },
    },
    {
      level: 4,
      skill: "Asking 'where' (أين)",
      chunks: [
        { text: "أين", translit: "ayna", gloss: "Where", role: "question" },
        { text: "الحمام؟", translit: "al-hammaam", gloss: "the bathroom", role: "object" },
      ],
      translation: "Where is the bathroom?",
      note: "أين (ayna) = where. No verb needed — 'Where the bathroom?'",
      twist: {
        prompt: "Now ask: Where is the hotel? (hotel = الفندق al-funduq)",
        chunks: [
          { text: "أين", translit: "ayna", gloss: "Where", role: "question" },
          { text: "الفندق؟", translit: "al-funduq", gloss: "the hotel", role: "object" },
        ],
        translation: "Where is the hotel?",
      },
    },
    {
      level: 5,
      skill: "Asking yes/no questions (هل at the start)",
      chunks: [
        { text: "هل", translit: "hal", gloss: "(question)", role: "question" },
        { text: "تتكلم", translit: "tatakallam", gloss: "you speak", role: "verb" },
        { text: "عربي؟", translit: "3arabi", gloss: "Arabic", role: "object" },
      ],
      translation: "Do you speak Arabic?",
      note: "هل (hal) at the start turns a sentence into a yes/no question, like 'do/does' in English.",
      twist: {
        prompt: "Now ask: Do you speak English? (English = إنجليزي ingleezi)",
        chunks: [
          { text: "هل", translit: "hal", gloss: "(question)", role: "question" },
          { text: "تتكلم", translit: "tatakallam", gloss: "you speak", role: "verb" },
          { text: "إنجليزي؟", translit: "ingleezi", gloss: "English", role: "object" },
        ],
        translation: "Do you speak English?",
      },
    },
  ],

  // ===========================================================================
  // BENGALI — SOV (verb last), like Hindi/Urdu. Negation না (na) AFTER the verb
  // at the very end. Questions add কি (ki) after subject. Web-verified
  // (Curious Linguist, ling-app, Talkpal, Wikibooks sources).
  // ===========================================================================
  bn: [
    {
      level: 1,
      skill: "Subject + Verb (verb comes LAST in Bengali)",
      chunks: [
        { text: "আমি", translit: "ami", gloss: "I", role: "subject" },
        { text: "খাই", translit: "khai", gloss: "eat", role: "verb" },
      ],
      translation: "I eat",
      note: "Like Hindi, Bengali puts the verb at the END.",
      extend: {
        skill: "Add the object (before the verb)",
        chunks: [
          { text: "আমি", translit: "ami", gloss: "I", role: "subject" },
          { text: "ভাত", translit: "bhat", gloss: "rice", role: "object" },
          { text: "খাই", translit: "khai", gloss: "eat", role: "verb" },
        ],
        translation: "I eat rice",
      },
      twist: {
        prompt: "Now say: I read a book (book = বই boi, read = পড়ি pori)",
        chunks: [
          { text: "আমি", translit: "ami", gloss: "I", role: "subject" },
          { text: "বই", translit: "boi", gloss: "a book", role: "object" },
          { text: "পড়ি", translit: "pori", gloss: "read", role: "verb" },
        ],
        translation: "I read a book",
      },
    },
    {
      level: 2,
      skill: "Subject + Object + Verb",
      chunks: [
        { text: "সে", translit: "she", gloss: "She/He", role: "subject" },
        { text: "ভাত", translit: "bhat", gloss: "rice", role: "object" },
        { text: "খায়", translit: "khay", gloss: "eats", role: "verb" },
      ],
      translation: "She eats rice",
      twist: {
        prompt: "Now say: She sings a song (song = গান gaan, sings = গায় gay)",
        chunks: [
          { text: "সে", translit: "she", gloss: "She", role: "subject" },
          { text: "গান", translit: "gaan", gloss: "a song", role: "object" },
          { text: "গায়", translit: "gay", gloss: "sings", role: "verb" },
        ],
        translation: "She sings a song",
      },
    },
    {
      level: 3,
      skill: "Drinking something (tea/water)",
      chunks: [
        { text: "আমি", translit: "ami", gloss: "I", role: "subject" },
        { text: "চা", translit: "cha", gloss: "tea", role: "object" },
        { text: "খাই", translit: "khai", gloss: "drink", role: "verb" },
      ],
      translation: "I drink tea",
      note: "Bengali often uses খাই (khai, 'eat') for drinking tea too!",
      twist: {
        prompt: "Now say: I listen to music (music = গান gaan, listen = শুনি shuni)",
        chunks: [
          { text: "আমি", translit: "ami", gloss: "I", role: "subject" },
          { text: "গান", translit: "gaan", gloss: "music", role: "object" },
          { text: "শুনি", translit: "shuni", gloss: "listen", role: "verb" },
        ],
        translation: "I listen to music",
      },
    },
    {
      level: 4,
      skill: "Making it negative (না goes AFTER the verb, at the end)",
      chunks: [
        { text: "আমি", translit: "ami", gloss: "I", role: "subject" },
        { text: "মাছ", translit: "mach", gloss: "fish", role: "object" },
        { text: "খাই", translit: "khai", gloss: "eat", role: "verb" },
        { text: "না", translit: "na", gloss: "not", role: "negation" },
      ],
      translation: "I don't eat fish",
      note: "Unlike English, না (na, 'not') goes at the very END, after the verb.",
      twist: {
        prompt: "Now say: I don't read books (read = পড়ি pori)",
        chunks: [
          { text: "আমি", translit: "ami", gloss: "I", role: "subject" },
          { text: "বই", translit: "boi", gloss: "books", role: "object" },
          { text: "পড়ি", translit: "pori", gloss: "read", role: "verb" },
          { text: "না", translit: "na", gloss: "not", role: "negation" },
        ],
        translation: "I don't read books",
      },
    },
    {
      level: 5,
      skill: "Asking a yes/no question (কি after the subject)",
      chunks: [
        { text: "তুমি", translit: "tumi", gloss: "You", role: "subject" },
        { text: "কি", translit: "ki", gloss: "(question)", role: "question" },
        { text: "ভাত", translit: "bhat", gloss: "rice", role: "object" },
        { text: "খাও?", translit: "khao", gloss: "eat", role: "verb" },
      ],
      translation: "Do you eat rice?",
      note: "কি (ki) after the subject turns it into a yes/no question.",
      twist: {
        prompt: "Now ask: Do you drink tea? (tea = চা cha)",
        chunks: [
          { text: "তুমি", translit: "tumi", gloss: "You", role: "subject" },
          { text: "কি", translit: "ki", gloss: "(question)", role: "question" },
          { text: "চা", translit: "cha", gloss: "tea", role: "object" },
          { text: "খাও?", translit: "khao", gloss: "drink", role: "verb" },
        ],
        translation: "Do you drink tea?",
      },
    },
  ],
  // ===========================================================================
  // TURKISH (v59) — high confidence, every full sentence verified verbatim
  // against learner sources (turkish.academy, turkishclass101, Dem Turkish,
  // TurkishMate, fluentinturkish): "Su lütfen", "İki ekmek lütfen",
  // "Ben kitap okuyorum", "Ben Türkçe öğreniyorum", locative evde/okulda,
  // "Film güzel mi?", "O kitap okuyor mu?", "Ben gelmiyorum", "Bilmiyorum".
  // ===========================================================================
  tr: [
    {
      level: 1,
      skill: "Ask politely: thing + lütfen",
      chunks: [
        { text: "Su", translit: "soo", gloss: "water", role: "object" },
        { text: "lütfen", translit: "LEWT-fen", gloss: "please", role: "particle" },
      ],
      translation: "Water, please",
      extend: {
        skill: "Add how many",
        chunks: [
          { text: "İki", translit: "ee-KEE", gloss: "two", role: "adjective" },
          { text: "ekmek", translit: "ek-MEK", gloss: "bread", role: "object" },
          { text: "lütfen", translit: "LEWT-fen", gloss: "please", role: "particle" },
        ],
        translation: "Two breads, please",
      },
      twist: {
        prompt: "Now ask for the bill",
        chunks: [
          { text: "Hesap", translit: "heh-SAHP", gloss: "the bill", role: "object" },
          { text: "lütfen", translit: "LEWT-fen", gloss: "please", role: "particle" },
        ],
        translation: "The bill, please",
      },
    },
    {
      level: 2,
      skill: "Verb goes LAST: Subject + Object + Verb",
      chunks: [
        { text: "Ben", translit: "ben", gloss: "I", role: "subject" },
        { text: "kitap", translit: "kee-TAHP", gloss: "book", role: "object" },
        { text: "okuyorum", translit: "oh-KOO-yoh-room", gloss: "am reading", role: "verb" },
      ],
      translation: "I am reading a book",
      extend: {
        skill: "Same shape, new meaning",
        chunks: [
          { text: "Ben", translit: "ben", gloss: "I", role: "subject" },
          { text: "Türkçe", translit: "TEWRK-cheh", gloss: "Turkish", role: "object" },
          { text: "öğreniyorum", translit: "ur-reh-NEE-yoh-room", gloss: "am learning", role: "verb" },
        ],
        translation: "I am learning Turkish",
      },
      twist: {
        prompt: "Now say: I ate an apple",
        chunks: [
          { text: "Ben", translit: "ben", gloss: "I", role: "subject" },
          { text: "bir elma", translit: "beer el-MAH", gloss: "an apple", role: "object" },
          { text: "yedim", translit: "yeh-DIM", gloss: "ate", role: "verb" },
        ],
        translation: "I ate an apple",
      },
    },
    {
      level: 3,
      skill: "Say WHERE with a suffix: -de / -da",
      chunks: [
        { text: "Kedi", translit: "keh-DEE", gloss: "the cat", role: "subject" },
        { text: "evde", translit: "ev-DEH", gloss: "at home (ev + -de)", role: "object" },
      ],
      translation: "The cat is at home",
      extend: {
        skill: "Vowel harmony picks the suffix",
        chunks: [
          { text: "Çocuk", translit: "cho-JOOK", gloss: "the child", role: "subject" },
          { text: "okulda", translit: "oh-kool-DAH", gloss: "at school (okul + -da)", role: "object" },
        ],
        translation: "The child is at school",
      },
      twist: {
        prompt: "No 'is' needed — Turkish drops it. Say: the money is in the bag",
        chunks: [
          { text: "Para", translit: "pah-RAH", gloss: "the money", role: "subject" },
          { text: "çantada", translit: "chan-tah-DAH", gloss: "in the bag (çanta + -da)", role: "object" },
        ],
        translation: "The money is in the bag",
      },
    },
    {
      level: 4,
      skill: "Turn it into a question with mi?",
      chunks: [
        { text: "Film", translit: "film", gloss: "the film", role: "subject" },
        { text: "güzel", translit: "gew-ZEL", gloss: "nice", role: "adjective" },
        { text: "mi?", translit: "mee", gloss: "(question particle)", role: "question" },
      ],
      translation: "Is the film nice?",
      extend: {
        skill: "The particle harmonises too: mu after o/u",
        chunks: [
          { text: "O", translit: "oh", gloss: "he/she", role: "subject" },
          { text: "kitap", translit: "kee-TAHP", gloss: "book", role: "object" },
          { text: "okuyor", translit: "oh-KOO-yor", gloss: "is reading", role: "verb" },
          { text: "mu?", translit: "moo", gloss: "(question particle)", role: "question" },
        ],
        translation: "Is he/she reading a book?",
      },
      twist: {
        prompt: "Ask: is the tea hot?",
        chunks: [
          { text: "Çay", translit: "chai", gloss: "the tea", role: "subject" },
          { text: "sıcak", translit: "suh-JAHK", gloss: "hot", role: "adjective" },
          { text: "mı?", translit: "muh", gloss: "(question particle)", role: "question" },
        ],
        translation: "Is the tea hot?",
      },
    },
    {
      level: 5,
      skill: "Say NO inside the verb: -m-",
      chunks: [
        { text: "Ben", translit: "ben", gloss: "I", role: "subject" },
        { text: "gelmiyorum", translit: "GEL-mee-yoh-room", gloss: "am not coming (gel + -m- + iyorum)", role: "negation" },
      ],
      translation: "I am not coming",
      extend: {
        skill: "One word can be a whole sentence",
        chunks: [
          { text: "Bilmiyorum", translit: "BIL-mee-yoh-room", gloss: "I don't know (bil + -m- + iyorum)", role: "negation" },
        ],
        translation: "I don't know",
      },
      twist: {
        prompt: "Now say: I don't understand",
        chunks: [
          { text: "Anlamıyorum", translit: "an-LAH-muh-yoh-room", gloss: "I don't understand (anla + -m- + ıyorum)", role: "negation" },
        ],
        translation: "I don't understand",
      },
    },
  ],

  // ===========================================================================
  // GERMAN — SVO on the surface, but the rule that actually governs German is
  // that the conjugated verb sits in SECOND position no matter what comes
  // first. Level 5 is that rule, because it is the one that makes a learner's
  // German stop sounding like translated English.
  // ===========================================================================
  de: [
    {
      level: 1,
      skill: "Subject + Verb",
      chunks: [
        { text: "Ich", translit: "ikh", gloss: "I", role: "subject" },
        { text: "trinke", translit: "TRIN-ke", gloss: "drink", role: "verb" },
      ],
      translation: "I drink",
      extend: {
        skill: "Add what you drink",
        chunks: [
          { text: "Ich", translit: "ikh", gloss: "I", role: "subject" },
          { text: "trinke", translit: "TRIN-ke", gloss: "drink", role: "verb" },
          { text: "Wasser", translit: "VAS-ser", gloss: "water", role: "object" },
        ],
        translation: "I drink water",
      },
      twist: {
        prompt: "Now say: I eat bread (eat = esse, bread = Brot)",
        chunks: [
          { text: "Ich", translit: "ikh", gloss: "I", role: "subject" },
          { text: "esse", translit: "ES-se", gloss: "eat", role: "verb" },
          { text: "Brot", translit: "broht", gloss: "bread", role: "object" },
        ],
        translation: "I eat bread",
      },
    },
    {
      level: 2,
      skill: "Saying you have something (and meeting the accusative)",
      chunks: [
        { text: "Ich", translit: "ikh", gloss: "I", role: "subject" },
        { text: "habe", translit: "HAH-be", gloss: "have", role: "verb" },
        { text: "einen Bruder", translit: "EYE-nen BROO-der", gloss: "a brother", role: "object" },
      ],
      translation: "I have a brother",
      note: "'A brother' is ein Bruder on its own, but einen Bruder as the object of a verb. Masculine words change; feminine and neuter ones (eine Schwester, ein Kind) don't.",
      twist: {
        prompt: "Now say: I have a sister (sister = eine Schwester — feminine, so nothing changes)",
        chunks: [
          { text: "Ich", translit: "ikh", gloss: "I", role: "subject" },
          { text: "habe", translit: "HAH-be", gloss: "have", role: "verb" },
          { text: "eine Schwester", translit: "EYE-ne SHVES-ter", gloss: "a sister", role: "object" },
        ],
        translation: "I have a sister",
      },
    },
    {
      level: 3,
      skill: "Asking for something politely (ich möchte)",
      chunks: [
        { text: "Ich", translit: "ikh", gloss: "I", role: "subject" },
        { text: "möchte", translit: "MERKH-te", gloss: "would like", role: "verb" },
        { text: "einen Kaffee", translit: "EYE-nen KA-fay", gloss: "a coffee", role: "object" },
      ],
      translation: "I would like a coffee",
      note: "ich möchte is the polite way to order or ask for anything. ich will means 'I want' and sounds blunt to the point of rude.",
      twist: {
        prompt: "Now say: I would like a beer (a beer = ein Bier — neuter, no change)",
        chunks: [
          { text: "Ich", translit: "ikh", gloss: "I", role: "subject" },
          { text: "möchte", translit: "MERKH-te", gloss: "would like", role: "verb" },
          { text: "ein Bier", translit: "eyn beer", gloss: "a beer", role: "object" },
        ],
        translation: "I would like a beer",
      },
    },
    {
      level: 4,
      skill: "Asking 'where' (Wo ist…?)",
      chunks: [
        { text: "Wo", translit: "voh", gloss: "Where", role: "question" },
        { text: "ist", translit: "ist", gloss: "is", role: "verb" },
        { text: "der Bahnhof?", translit: "dair BAHN-hohf", gloss: "the station", role: "object" },
      ],
      translation: "Where is the station?",
      note: "The question word comes first and the verb still lands in second place — Wo ist…, Wann kommt…, Wie heißt…",
      twist: {
        prompt: "Now ask: Where is the toilet? (the toilet = die Toilette)",
        chunks: [
          { text: "Wo", translit: "voh", gloss: "Where", role: "question" },
          { text: "ist", translit: "ist", gloss: "is", role: "verb" },
          { text: "die Toilette?", translit: "dee twa-LET-te", gloss: "the toilet", role: "object" },
        ],
        translation: "Where is the toilet?",
      },
    },
    {
      level: 5,
      skill: "Putting the time first — and the verb stays second",
      chunks: [
        { text: "Morgen", translit: "MOR-gen", gloss: "Tomorrow", role: "time" },
        { text: "gehe", translit: "GAY-e", gloss: "go", role: "verb" },
        { text: "ich", translit: "ikh", gloss: "I", role: "subject" },
        { text: "nach Hause", translit: "nakh HOW-ze", gloss: "home", role: "object" },
      ],
      translation: "Tomorrow I am going home",
      note: "The verb is the SECOND thing in the sentence, always. Put the time first and the subject gets pushed behind the verb: Morgen gehe ich — never Morgen ich gehe.",
      twist: {
        prompt: "Now say: Today I am working (today = Heute, work = arbeite)",
        chunks: [
          { text: "Heute", translit: "HOY-te", gloss: "Today", role: "time" },
          { text: "arbeite", translit: "AR-buy-te", gloss: "work", role: "verb" },
          { text: "ich", translit: "ikh", gloss: "I", role: "subject" },
        ],
        translation: "Today I am working",
      },
    },
  ],

  // ===========================================================================
  // MANDARIN CHINESE — no conjugation, no gender, no plurals. The two things a
  // learner actually has to absorb are measure words and where the question
  // goes: Chinese leaves the question word exactly where the answer belongs.
  // Tone marks follow the pinyin used elsewhere in the app, including the
  // sandhi on 一 (yī → yì / yí depending on what follows).
  // ===========================================================================
  zh: [
    {
      level: 1,
      skill: "Subject + Verb + Object (same order as English)",
      chunks: [
        { text: "我", translit: "wǒ", gloss: "I", role: "subject" },
        { text: "喝", translit: "hē", gloss: "drink", role: "verb" },
        { text: "水", translit: "shuǐ", gloss: "water", role: "object" },
      ],
      translation: "I drink water",
      note: "The verb never changes. 我喝 / 你喝 / 他喝 — I drink, you drink, he drinks. Same word every time.",
      twist: {
        prompt: "Now say: I eat rice (eat = 吃 chī, rice = 饭 fàn)",
        chunks: [
          { text: "我", translit: "wǒ", gloss: "I", role: "subject" },
          { text: "吃", translit: "chī", gloss: "eat", role: "verb" },
          { text: "饭", translit: "fàn", gloss: "rice", role: "object" },
        ],
        translation: "I eat rice",
      },
    },
    {
      level: 2,
      skill: "Saying you have something — and counting it",
      chunks: [
        { text: "我", translit: "wǒ", gloss: "I", role: "subject" },
        { text: "有", translit: "yǒu", gloss: "have", role: "verb" },
        { text: "一个", translit: "yí ge", gloss: "one (thing)", role: "particle" },
        { text: "姐姐", translit: "jiějie", gloss: "older sister", role: "object" },
      ],
      translation: "I have an older sister",
      note: "Chinese can't say 'one sister' — a measure word has to sit between the number and the noun. 个 (ge) is the general-purpose one and works for most things you'll want to count early on.",
      twist: {
        prompt: "Now say: I have an older brother (older brother = 哥哥 gēge)",
        chunks: [
          { text: "我", translit: "wǒ", gloss: "I", role: "subject" },
          { text: "有", translit: "yǒu", gloss: "have", role: "verb" },
          { text: "一个", translit: "yí ge", gloss: "one (thing)", role: "particle" },
          { text: "哥哥", translit: "gēge", gloss: "older brother", role: "object" },
        ],
        translation: "I have an older brother",
      },
    },
    {
      level: 3,
      skill: "Ordering something (我要)",
      chunks: [
        { text: "我", translit: "wǒ", gloss: "I", role: "subject" },
        { text: "要", translit: "yào", gloss: "want", role: "verb" },
        { text: "一杯", translit: "yì bēi", gloss: "one cup of", role: "particle" },
        { text: "茶", translit: "chá", gloss: "tea", role: "object" },
      ],
      translation: "I want a cup of tea",
      note: "杯 (bēi) is the measure word for cups and glasses — 一杯水, 一杯咖啡. In a shop 我要… is normal and not impolite; add 请 (qǐng, please) if you want to soften it.",
      twist: {
        prompt: "Now say: I want a cup of coffee (coffee = 咖啡 kāfēi)",
        chunks: [
          { text: "我", translit: "wǒ", gloss: "I", role: "subject" },
          { text: "要", translit: "yào", gloss: "want", role: "verb" },
          { text: "一杯", translit: "yì bēi", gloss: "one cup of", role: "particle" },
          { text: "咖啡", translit: "kāfēi", gloss: "coffee", role: "object" },
        ],
        translation: "I want a cup of coffee",
      },
    },
    {
      level: 4,
      skill: "Asking 'where' — the question word goes where the answer goes",
      chunks: [
        { text: "洗手间", translit: "xǐshǒujiān", gloss: "the bathroom", role: "subject" },
        { text: "在", translit: "zài", gloss: "is at", role: "verb" },
        { text: "哪里？", translit: "nǎlǐ", gloss: "where", role: "question" },
      ],
      translation: "Where is the bathroom?",
      note: "English moves 'where' to the front. Chinese doesn't move anything — 哪里 sits in the slot the answer would occupy. Answer 洗手间在那里 (it's over there) and the shape is identical.",
      twist: {
        prompt: "Now ask: Where is the station? (station = 车站 chēzhàn)",
        chunks: [
          { text: "车站", translit: "chēzhàn", gloss: "the station", role: "subject" },
          { text: "在", translit: "zài", gloss: "is at", role: "verb" },
          { text: "哪里？", translit: "nǎlǐ", gloss: "where", role: "question" },
        ],
        translation: "Where is the station?",
      },
    },
    {
      level: 5,
      skill: "Yes/no questions with 吗",
      chunks: [
        { text: "你", translit: "nǐ", gloss: "you", role: "subject" },
        { text: "会", translit: "huì", gloss: "can", role: "verb" },
        { text: "说", translit: "shuō", gloss: "speak", role: "verb" },
        { text: "中文", translit: "Zhōngwén", gloss: "Chinese", role: "object" },
        { text: "吗？", translit: "ma", gloss: "(question)", role: "question" },
      ],
      translation: "Can you speak Chinese?",
      note: "Take any statement, add 吗 to the end, and it becomes a yes/no question. Nothing else moves. 吗 is toneless.",
      twist: {
        prompt: "Now ask: Do you want tea? (want = 要 yào, tea = 茶 chá)",
        chunks: [
          { text: "你", translit: "nǐ", gloss: "you", role: "subject" },
          { text: "要", translit: "yào", gloss: "want", role: "verb" },
          { text: "茶", translit: "chá", gloss: "tea", role: "object" },
          { text: "吗？", translit: "ma", gloss: "(question)", role: "question" },
        ],
        translation: "Do you want tea?",
      },
    },
  ],

  // ===========================================================================
  // PERSIAN — verb last, always. Romanisation matches the app's packs (â for
  // the long 'a' in âb, salâm). Where the written form and the spoken form
  // differ, the note says so rather than quietly teaching one as the other.
  // ===========================================================================
  fa: [
    {
      level: 1,
      skill: "The verb comes LAST",
      chunks: [
        { text: "من", translit: "man", gloss: "I", role: "subject" },
        { text: "آب", translit: "âb", gloss: "water", role: "object" },
        { text: "می‌خورم", translit: "mikhoram", gloss: "drink", role: "verb" },
      ],
      translation: "I drink water",
      note: "Word for word this is 'I water drink'. Persian puts the verb at the end of almost every sentence — that one habit will fix most of your word order.",
      twist: {
        prompt: "Now say: I eat bread (bread = نان nân, eat = می‌خورم mikhoram — the same verb)",
        chunks: [
          { text: "من", translit: "man", gloss: "I", role: "subject" },
          { text: "نان", translit: "nân", gloss: "bread", role: "object" },
          { text: "می‌خورم", translit: "mikhoram", gloss: "eat", role: "verb" },
        ],
        translation: "I eat bread",
      },
    },
    {
      level: 2,
      skill: "Saying you have something (دارم)",
      chunks: [
        { text: "من", translit: "man", gloss: "I", role: "subject" },
        { text: "یک برادر", translit: "yek barâdar", gloss: "a brother", role: "object" },
        { text: "دارم", translit: "dâram", gloss: "have", role: "verb" },
      ],
      translation: "I have a brother",
      note: "The -am ending already means 'I', so من is optional: برادر دارم is a complete sentence.",
      twist: {
        prompt: "Now say: I have a sister (sister = خواهر khâhar)",
        chunks: [
          { text: "من", translit: "man", gloss: "I", role: "subject" },
          { text: "یک خواهر", translit: "yek khâhar", gloss: "a sister", role: "object" },
          { text: "دارم", translit: "dâram", gloss: "have", role: "verb" },
        ],
        translation: "I have a sister",
      },
    },
    {
      level: 3,
      skill: "Saying what you want (می‌خواهم)",
      chunks: [
        { text: "من", translit: "man", gloss: "I", role: "subject" },
        { text: "چای", translit: "chây", gloss: "tea", role: "object" },
        { text: "می‌خواهم", translit: "mikhâham", gloss: "want", role: "verb" },
      ],
      translation: "I want tea",
      note: "That's the written form. Out loud, almost everyone says می‌خوام (mikhâm) — you'll hear the short one far more than you'll read it.",
      twist: {
        prompt: "Now say: I want water (water = آب âb)",
        chunks: [
          { text: "من", translit: "man", gloss: "I", role: "subject" },
          { text: "آب", translit: "âb", gloss: "water", role: "object" },
          { text: "می‌خواهم", translit: "mikhâham", gloss: "want", role: "verb" },
        ],
        translation: "I want water",
      },
    },
    {
      level: 4,
      skill: "Asking 'where' (کجا)",
      chunks: [
        { text: "دستشویی", translit: "dastshuyi", gloss: "the bathroom", role: "subject" },
        { text: "کجاست؟", translit: "kojâst", gloss: "where is", role: "question" },
      ],
      translation: "Where is the bathroom?",
      note: "کجاست is کجا (where) with است (is) fused onto it — one word doing both jobs.",
      twist: {
        prompt: "Now ask: Where is the hotel? (hotel = هتل hotel)",
        chunks: [
          { text: "هتل", translit: "hotel", gloss: "the hotel", role: "subject" },
          { text: "کجاست؟", translit: "kojâst", gloss: "where is", role: "question" },
        ],
        translation: "Where is the hotel?",
      },
    },
    {
      level: 5,
      skill: "Yes/no questions — your voice does all the work",
      chunks: [
        { text: "شما", translit: "shomâ", gloss: "you (polite)", role: "subject" },
        { text: "فارسی", translit: "fârsi", gloss: "Persian", role: "object" },
        { text: "صحبت می‌کنید؟", translit: "sohbat mikonid", gloss: "speak", role: "verb" },
      ],
      translation: "Do you speak Persian?",
      note: "Nothing was added and nothing moved. Persian turns a statement into a yes/no question by raising the pitch at the end. (Formal writing can put آیا âyâ at the front, but speech rarely bothers.)",
      twist: {
        prompt: "Now ask: Do you speak English? (English = انگلیسی engelisi)",
        chunks: [
          { text: "شما", translit: "shomâ", gloss: "you (polite)", role: "subject" },
          { text: "انگلیسی", translit: "engelisi", gloss: "English", role: "object" },
          { text: "صحبت می‌کنید؟", translit: "sohbat mikonid", gloss: "speak", role: "verb" },
        ],
        translation: "Do you speak English?",
      },
    },
  ],

  // ===========================================================================
  // PUNJABI — SHAHMUKHI, not Gurmukhi. This pack writes Punjabi in the
  // Perso-Arabic script, as it is written in Pakistan, and every other screen
  // in the app shows the learner Shahmukhi. A Gurmukhi ladder here would be a
  // different script appearing without warning in the middle of the course.
  // (These patterns were first drafted in Gurmukhi and caught by the script
  // check in validate-sentence-lab.mjs, which exists because of it.)
  //
  // Verb last, and the present tense agrees with the SPEAKER's gender — level 1
  // teaches that immediately, because a learner who never meets it spends years
  // saying the wrong half of every sentence. Romanisation follows the pack:
  // اے is "ae", not Urdu's "hai".
  // ===========================================================================
  pa: [
    {
      level: 1,
      skill: "The verb comes last — and it knows who's speaking",
      chunks: [
        { text: "میں", translit: "main", gloss: "I", role: "subject" },
        { text: "پانی", translit: "paani", gloss: "water", role: "object" },
        { text: "پیندا ہاں", translit: "peenda haan", gloss: "drink (man speaking)", role: "verb" },
      ],
      translation: "I drink water",
      note: "A woman says پیندی ہاں (peendi haan). The -a / -i ending on the verb tells you the speaker's gender, and it's the single most common thing learners forget.",
      twist: {
        prompt: "Now say the same sentence as a woman would",
        chunks: [
          { text: "میں", translit: "main", gloss: "I", role: "subject" },
          { text: "پانی", translit: "paani", gloss: "water", role: "object" },
          { text: "پیندی ہاں", translit: "peendi haan", gloss: "drink (woman speaking)", role: "verb" },
        ],
        translation: "I drink water",
      },
    },
    {
      level: 2,
      skill: "Saying you have something (میرے کول)",
      chunks: [
        { text: "میرے کول", translit: "mere kol", gloss: "I have", role: "subject" },
        { text: "اک گڈی", translit: "ik gaddi", gloss: "a car", role: "object" },
        { text: "اے", translit: "ae", gloss: "is", role: "verb" },
      ],
      translation: "I have a car",
      note: "There's no verb 'to have'. میرے کول literally means 'near me', so the sentence is 'near me one car is'. And the copula is اے (ae) — Urdu's ہے (hai) is the giveaway that someone is speaking Urdu with Punjabi words.",
      twist: {
        prompt: "Now say: I have a brother (brother = بھائی bhai)",
        chunks: [
          { text: "میرے کول", translit: "mere kol", gloss: "I have", role: "subject" },
          { text: "اک بھائی", translit: "ik bhai", gloss: "a brother", role: "object" },
          { text: "اے", translit: "ae", gloss: "is", role: "verb" },
        ],
        translation: "I have a brother",
      },
    },
    {
      level: 3,
      skill: "Saying what you need (چاہیدا)",
      chunks: [
        { text: "مینوں", translit: "mainu", gloss: "to me", role: "subject" },
        { text: "پانی", translit: "paani", gloss: "water", role: "object" },
        { text: "چاہیدا اے", translit: "chahida ae", gloss: "is needed", role: "verb" },
      ],
      translation: "I want water",
      note: "Not 'I want water' but 'to me water is wanted'. چاہیدا agrees with the THING wanted, not with you: پانی is masculine so چاہیدا, but مدد (help) is feminine so مینوں مدد چاہیدی اے.",
      twist: {
        prompt: "Now say: I want tea (چاہ chaa is feminine, so use چاہیدی chahidi)",
        chunks: [
          { text: "مینوں", translit: "mainu", gloss: "to me", role: "subject" },
          { text: "چاہ", translit: "chaa", gloss: "tea", role: "object" },
          { text: "چاہیدی اے", translit: "chahidi ae", gloss: "is needed", role: "verb" },
        ],
        translation: "I want tea",
      },
    },
    {
      level: 4,
      skill: "Asking 'where' (کتھے)",
      chunks: [
        { text: "سٹیشن", translit: "station", gloss: "the station", role: "subject" },
        { text: "کتھے", translit: "kithe", gloss: "where", role: "question" },
        { text: "اے؟", translit: "ae", gloss: "is", role: "verb" },
      ],
      translation: "Where is the station?",
      note: "اے still lands at the end. The question word slots in just before it, where the answer would go — same shape as تسیں کتھے رہندے او؟ (where do you live?).",
      twist: {
        prompt: "Now ask: Where is the house? (house = گھر ghar)",
        chunks: [
          { text: "گھر", translit: "ghar", gloss: "the house", role: "subject" },
          { text: "کتھے", translit: "kithe", gloss: "where", role: "question" },
          { text: "اے؟", translit: "ae", gloss: "is", role: "verb" },
        ],
        translation: "Where is the house?",
      },
    },
    {
      level: 5,
      skill: "Yes/no questions — nothing is added",
      chunks: [
        { text: "تسیں", translit: "tusin", gloss: "you (polite)", role: "subject" },
        { text: "پنجابی", translit: "punjabi", gloss: "Punjabi", role: "object" },
        { text: "بولدے او؟", translit: "bolde ao", gloss: "speak", role: "verb" },
      ],
      translation: "Do you speak Punjabi?",
      note: "The same words as the statement 'you speak Punjabi' — only the rise at the end makes it a question. کیہ (ki) can go at the front in careful speech, but most people just let their voice do it.",
      twist: {
        prompt: "Now ask: Do you drink tea? (drink = پیندے او peende ao)",
        chunks: [
          { text: "تسیں", translit: "tusin", gloss: "you (polite)", role: "subject" },
          { text: "چاہ", translit: "chaa", gloss: "tea", role: "object" },
          { text: "پیندے او؟", translit: "peende ao", gloss: "drink", role: "verb" },
        ],
        translation: "Do you drink tea?",
      },
    },
  ],

  // ===========================================================================
  // TAMIL — verb last, and everything else is a suffix glued onto a word. The
  // ladder deliberately ends on the question suffix -ஆ, because that is the
  // clearest demonstration that Tamil builds meaning by adding endings rather
  // than by moving words. Spoken forms, matching the pack's romanisation.
  // ===========================================================================
  ta: [
    {
      level: 1,
      skill: "The verb comes last",
      chunks: [
        { text: "நான்", translit: "naan", gloss: "I", role: "subject" },
        { text: "தண்ணீர்", translit: "thanneer", gloss: "water", role: "object" },
        { text: "குடிக்கிறேன்", translit: "kudikkiren", gloss: "drink", role: "verb" },
      ],
      translation: "I drink water",
      note: "The -ஏன் (-en) ending already says 'I', so நான் is optional — குடிக்கிறேன் on its own is a full sentence.",
      twist: {
        prompt: "Now say: I eat rice (rice = சாதம் saadham, eat = சாப்பிடுகிறேன் saappidugiren)",
        chunks: [
          { text: "நான்", translit: "naan", gloss: "I", role: "subject" },
          { text: "சாதம்", translit: "saadham", gloss: "rice", role: "object" },
          { text: "சாப்பிடுகிறேன்", translit: "saappidugiren", gloss: "eat", role: "verb" },
        ],
        translation: "I eat rice",
      },
    },
    {
      level: 2,
      skill: "Saying you have something (என்னிடம்)",
      chunks: [
        { text: "என்னிடம்", translit: "ennidam", gloss: "with me", role: "subject" },
        { text: "ஒரு புத்தகம்", translit: "oru puthagam", gloss: "a book", role: "object" },
        { text: "இருக்கிறது", translit: "irukkirathu", gloss: "there is", role: "verb" },
      ],
      translation: "I have a book",
      note: "Tamil has no verb 'to have'. என்னிடம் is 'with me' — the sentence is 'with me one book exists'.",
      twist: {
        prompt: "Now say: I have a car (car = கார் kaar)",
        chunks: [
          { text: "என்னிடம்", translit: "ennidam", gloss: "with me", role: "subject" },
          { text: "ஒரு கார்", translit: "oru kaar", gloss: "a car", role: "object" },
          { text: "இருக்கிறது", translit: "irukkirathu", gloss: "there is", role: "verb" },
        ],
        translation: "I have a car",
      },
    },
    {
      level: 3,
      skill: "Saying what you want (எனக்கு … வேண்டும்)",
      chunks: [
        { text: "எனக்கு", translit: "enakku", gloss: "to me", role: "subject" },
        { text: "தேநீர்", translit: "theneer", gloss: "tea", role: "object" },
        { text: "வேண்டும்", translit: "vendum", gloss: "is wanted", role: "verb" },
      ],
      translation: "I want tea",
      note: "The wanter goes in the 'to me' form (எனக்கு), not the 'I' form. Same shape as 'to me it is needed'.",
      twist: {
        prompt: "Now say: I want water (water = தண்ணீர் thanneer)",
        chunks: [
          { text: "எனக்கு", translit: "enakku", gloss: "to me", role: "subject" },
          { text: "தண்ணீர்", translit: "thanneer", gloss: "water", role: "object" },
          { text: "வேண்டும்", translit: "vendum", gloss: "is wanted", role: "verb" },
        ],
        translation: "I want water",
      },
    },
    {
      level: 4,
      skill: "Asking 'where' (எங்கே)",
      chunks: [
        { text: "கழிவறை", translit: "kazhivarai", gloss: "the bathroom", role: "subject" },
        { text: "எங்கே?", translit: "enge", gloss: "where", role: "question" },
      ],
      translation: "Where is the bathroom?",
      note: "No word for 'is' needed. Noun, then எங்கே — that's the whole question.",
      twist: {
        prompt: "Now ask: Where is the station? (station = ரயில் நிலையம் rayil nilaiyam)",
        chunks: [
          { text: "ரயில் நிலையம்", translit: "rayil nilaiyam", gloss: "the station", role: "subject" },
          { text: "எங்கே?", translit: "enge", gloss: "where", role: "question" },
        ],
        translation: "Where is the station?",
      },
    },
    {
      level: 5,
      skill: "Yes/no questions — add -ஆ to the last word",
      chunks: [
        { text: "நீங்கள்", translit: "neengal", gloss: "you (polite)", role: "subject" },
        { text: "தமிழ்", translit: "tamizh", gloss: "Tamil", role: "object" },
        { text: "பேசுகிறீர்களா?", translit: "pesugireergala", gloss: "do speak?", role: "question" },
      ],
      translation: "Do you speak Tamil?",
      note: "பேசுகிறீர்கள் is 'you speak'. Stick -ஆ (-aa) on the end and it becomes 'do you speak?'. Nothing moves — the question is a suffix.",
      twist: {
        prompt: "Now ask: Do you drink tea? (you drink = குடிக்கிறீர்கள் kudikkireergal)",
        chunks: [
          { text: "நீங்கள்", translit: "neengal", gloss: "you (polite)", role: "subject" },
          { text: "தேநீர்", translit: "theneer", gloss: "tea", role: "object" },
          { text: "குடிக்கிறீர்களா?", translit: "kudikkireergala", gloss: "do drink?", role: "question" },
        ],
        translation: "Do you drink tea?",
      },
    },
  ],

  // ===========================================================================
  // MALAYALAM — verb last, dative subjects for wanting and having, and the
  // same trick as Tamil for questions: a suffix, not a word order change.
  // ===========================================================================
  ml: [
    {
      level: 1,
      skill: "The verb comes last",
      chunks: [
        { text: "ഞാൻ", translit: "njaan", gloss: "I", role: "subject" },
        { text: "വെള്ളം", translit: "vellam", gloss: "water", role: "object" },
        { text: "കുടിക്കുന്നു", translit: "kudikkunnu", gloss: "drink", role: "verb" },
      ],
      translation: "I drink water",
      note: "Malayalam verbs don't change for who is speaking — ഞാൻ കുടിക്കുന്നു, നിങ്ങൾ കുടിക്കുന്നു, അവൻ കുടിക്കുന്നു all use the same verb. One less thing to learn than in Tamil or Hindi.",
      twist: {
        prompt: "Now say: I eat rice (rice = ചോറ് choru, eat = കഴിക്കുന്നു kazhikkunnu)",
        chunks: [
          { text: "ഞാൻ", translit: "njaan", gloss: "I", role: "subject" },
          { text: "ചോറ്", translit: "choru", gloss: "rice", role: "object" },
          { text: "കഴിക്കുന്നു", translit: "kazhikkunnu", gloss: "eat", role: "verb" },
        ],
        translation: "I eat rice",
      },
    },
    {
      level: 2,
      skill: "Saying you have something (എനിക്ക് … ഉണ്ട്)",
      chunks: [
        { text: "എനിക്ക്", translit: "enikku", gloss: "to me", role: "subject" },
        { text: "ഒരു പുസ്തകം", translit: "oru pusthakam", gloss: "a book", role: "object" },
        { text: "ഉണ്ട്", translit: "undu", gloss: "there is", role: "verb" },
      ],
      translation: "I have a book",
      note: "No verb 'to have'. എനിക്ക് is the 'to me' form, and ഉണ്ട് means 'exists' — 'to me a book exists'.",
      twist: {
        prompt: "Now say: I have a sister (sister = ഒരു പെങ്ങൾ oru pengal)",
        chunks: [
          { text: "എനിക്ക്", translit: "enikku", gloss: "to me", role: "subject" },
          { text: "ഒരു പെങ്ങൾ", translit: "oru pengal", gloss: "a sister", role: "object" },
          { text: "ഉണ്ട്", translit: "undu", gloss: "there is", role: "verb" },
        ],
        translation: "I have a sister",
      },
    },
    {
      level: 3,
      skill: "Saying what you want (എനിക്ക് … വേണം)",
      chunks: [
        { text: "എനിക്ക്", translit: "enikku", gloss: "to me", role: "subject" },
        { text: "ചായ", translit: "chaaya", gloss: "tea", role: "object" },
        { text: "വേണം", translit: "venam", gloss: "is wanted", role: "verb" },
      ],
      translation: "I want tea",
      note: "Same 'to me' shape as having. Swap വേണം for വേണ്ട (venda) and it becomes 'I don't want' — the politest way to refuse a second helping.",
      twist: {
        prompt: "Now say: I want water (water = വെള്ളം vellam)",
        chunks: [
          { text: "എനിക്ക്", translit: "enikku", gloss: "to me", role: "subject" },
          { text: "വെള്ളം", translit: "vellam", gloss: "water", role: "object" },
          { text: "വേണം", translit: "venam", gloss: "is wanted", role: "verb" },
        ],
        translation: "I want water",
      },
    },
    {
      level: 4,
      skill: "Asking 'where' (എവിടെ)",
      chunks: [
        { text: "കുളിമുറി", translit: "kulimuri", gloss: "the bathroom", role: "subject" },
        { text: "എവിടെയാണ്?", translit: "evideyaanu", gloss: "where is", role: "question" },
      ],
      translation: "Where is the bathroom?",
      note: "എവിടെ (where) plus ആണ് (is) run together into one word. You'll hear the short എവിടെ? on its own too.",
      twist: {
        prompt: "Now ask: Where is the shop? (shop = കട kada)",
        chunks: [
          { text: "കട", translit: "kada", gloss: "the shop", role: "subject" },
          { text: "എവിടെയാണ്?", translit: "evideyaanu", gloss: "where is", role: "question" },
        ],
        translation: "Where is the shop?",
      },
    },
    {
      level: 5,
      skill: "Yes/no questions — add -ഓ to the end",
      chunks: [
        { text: "നിങ്ങൾ", translit: "ningal", gloss: "you (polite)", role: "subject" },
        { text: "മലയാളം", translit: "malayalam", gloss: "Malayalam", role: "object" },
        { text: "സംസാരിക്കുമോ?", translit: "samsaarikkumo", gloss: "do speak?", role: "question" },
      ],
      translation: "Do you speak Malayalam?",
      note: "സംസാരിക്കും is 'will speak'. The -ഓ (-o) on the end turns it into a question, and nothing else changes.",
      twist: {
        prompt: "Now ask: Do you want tea? (want = വേണം venam → വേണോ veno)",
        chunks: [
          { text: "നിങ്ങൾക്ക്", translit: "ningalkku", gloss: "to you", role: "subject" },
          { text: "ചായ", translit: "chaaya", gloss: "tea", role: "object" },
          { text: "വേണോ?", translit: "veno", gloss: "is wanted?", role: "question" },
        ],
        translation: "Do you want tea?",
      },
    },
  ],

  // ===========================================================================
  // SOMALI — the thing that makes Somali sentences work is the marker before
  // the verb: waa for a plain statement, waxaan for 'what I ... is'. A learner
  // who leaves it out produces something that isn't a sentence at all, so it
  // is level 1 rather than a footnote.
  // ===========================================================================
  so: [
    {
      level: 1,
      skill: "Every statement needs a marker (waa)",
      chunks: [
        { text: "Magacaygu", translit: "ma-ga-CAY-gu", gloss: "My name", role: "subject" },
        { text: "waa", translit: "waa", gloss: "is", role: "particle" },
        { text: "Xasan", translit: "HA-san", gloss: "Hasan", role: "object" },
      ],
      translation: "My name is Hasan",
      note: "waa isn't quite 'is' — it's the marker that says 'a statement is coming'. Somali needs one in nearly every sentence, and leaving it out is the most audible mistake a learner makes. The x in Xasan is a throaty h.",
      twist: {
        prompt: "Now say: My name is Amina",
        chunks: [
          { text: "Magacaygu", translit: "ma-ga-CAY-gu", gloss: "My name", role: "subject" },
          { text: "waa", translit: "waa", gloss: "is", role: "particle" },
          { text: "Aamina", translit: "AA-mi-na", gloss: "Amina", role: "object" },
        ],
        translation: "My name is Amina",
      },
    },
    {
      level: 2,
      skill: "Saying what you want (waxaan doonayaa)",
      chunks: [
        { text: "Waxaan", translit: "wa-HAAN", gloss: "What I", role: "particle" },
        { text: "doonayaa", translit: "doo-na-YAA", gloss: "want", role: "verb" },
        { text: "biyo", translit: "BI-yo", gloss: "water", role: "object" },
      ],
      translation: "I want water",
      note: "waxaan is wax (thing) + aan (I) — literally 'the thing I want is water'. It's the everyday way to say what you want, not a fancy construction.",
      twist: {
        prompt: "Now say: I want tea (tea = shaah)",
        chunks: [
          { text: "Waxaan", translit: "wa-HAAN", gloss: "What I", role: "particle" },
          { text: "doonayaa", translit: "doo-na-YAA", gloss: "want", role: "verb" },
          { text: "shaah", translit: "shaah", gloss: "tea", role: "object" },
        ],
        translation: "I want tea",
      },
    },
    {
      level: 3,
      skill: "Saying you have something (leeyahay)",
      chunks: [
        { text: "Waxaan", translit: "wa-HAAN", gloss: "What I", role: "particle" },
        { text: "leeyahay", translit: "lee-YA-hay", gloss: "have", role: "verb" },
        { text: "gaari", translit: "GAA-ri", gloss: "a car", role: "object" },
      ],
      translation: "I have a car",
      note: "Same waxaan frame as wanting — only the verb changes. Once you have the frame, a lot of sentences drop straight into it.",
      twist: {
        prompt: "Now say: I have a brother (brother = walaal)",
        chunks: [
          { text: "Waxaan", translit: "wa-HAAN", gloss: "What I", role: "particle" },
          { text: "leeyahay", translit: "lee-YA-hay", gloss: "have", role: "verb" },
          { text: "walaal", translit: "wa-LAAL", gloss: "a brother", role: "object" },
        ],
        translation: "I have a brother",
      },
    },
    {
      level: 4,
      skill: "Asking 'where' (xaggee)",
      chunks: [
        { text: "Musqushu", translit: "mus-QU-shu", gloss: "The bathroom", role: "subject" },
        { text: "waa", translit: "waa", gloss: "is", role: "particle" },
        { text: "xaggee?", translit: "hag-GEE", gloss: "where", role: "question" },
      ],
      translation: "Where is the bathroom?",
      note: "The question word goes at the end, where the answer belongs — and waa is still there doing its job.",
      twist: {
        prompt: "Now ask: Where is the market? (market = suuqu)",
        chunks: [
          { text: "Suuqu", translit: "SUU-qu", gloss: "The market", role: "subject" },
          { text: "waa", translit: "waa", gloss: "is", role: "particle" },
          { text: "xaggee?", translit: "hag-GEE", gloss: "where", role: "question" },
        ],
        translation: "Where is the market?",
      },
    },
    {
      level: 5,
      skill: "Yes/no questions start with ma",
      chunks: [
        { text: "Ma", translit: "ma", gloss: "(question)", role: "question" },
        { text: "ku", translit: "ku", gloss: "in", role: "particle" },
        { text: "hadashaa", translit: "ha-da-SHAA", gloss: "you speak", role: "verb" },
        { text: "Soomaali?", translit: "soo-MAA-li", gloss: "Somali", role: "object" },
      ],
      translation: "Do you speak Somali?",
      note: "ma at the front replaces waa — a sentence has one marker or the other, never both. That swap is how Somali asks yes/no questions.",
      twist: {
        prompt: "Now ask: Do you want tea? (you want = doonaysaa)",
        chunks: [
          { text: "Ma", translit: "ma", gloss: "(question)", role: "question" },
          { text: "doonaysaa", translit: "doo-nay-SAA", gloss: "you want", role: "verb" },
          { text: "shaah?", translit: "shaah", gloss: "tea", role: "object" },
        ],
        translation: "Do you want tea?",
      },
    },
  ],

  // ===========================================================================
  // TAGALOG — the verb comes FIRST, which is the opposite of English and the
  // single hardest habit to build. Everything else in the ladder is the marker
  // system: ang for the focus, ng for the object, ba for a question.
  // ===========================================================================
  tl: [
    {
      level: 1,
      skill: "The verb comes FIRST",
      chunks: [
        { text: "Kumakain", translit: "koo-ma-KA-in", gloss: "am eating", role: "verb" },
        { text: "ako", translit: "a-KO", gloss: "I", role: "subject" },
      ],
      translation: "I am eating",
      note: "Tagalog puts the verb before the person doing it — 'Eating I'. It feels backwards for about a week and then it doesn't.",
      twist: {
        prompt: "Now say: I am drinking (drinking = umiinom)",
        chunks: [
          { text: "Umiinom", translit: "oo-mi-EE-nom", gloss: "am drinking", role: "verb" },
          { text: "ako", translit: "a-KO", gloss: "I", role: "subject" },
        ],
        translation: "I am drinking",
      },
    },
    {
      level: 2,
      skill: "Adding what you're eating (ng)",
      chunks: [
        { text: "Kumakain", translit: "koo-ma-KA-in", gloss: "am eating", role: "verb" },
        { text: "ako", translit: "a-KO", gloss: "I", role: "subject" },
        { text: "ng kanin", translit: "nang KA-nin", gloss: "rice", role: "object" },
      ],
      translation: "I am eating rice",
      note: "ng marks the object. It's written as one letter pair but said 'nang'.",
      twist: {
        prompt: "Now say: I am drinking water (water = tubig)",
        chunks: [
          { text: "Umiinom", translit: "oo-mi-EE-nom", gloss: "am drinking", role: "verb" },
          { text: "ako", translit: "a-KO", gloss: "I", role: "subject" },
          { text: "ng tubig", translit: "nang TOO-big", gloss: "water", role: "object" },
        ],
        translation: "I am drinking water",
      },
    },
    {
      level: 3,
      skill: "Saying what you want (Gusto ko)",
      chunks: [
        { text: "Gusto", translit: "GOOS-to", gloss: "want", role: "verb" },
        { text: "ko", translit: "ko", gloss: "I", role: "subject" },
        { text: "ng kape", translit: "nang ka-PE", gloss: "coffee", role: "object" },
      ],
      translation: "I want coffee",
      note: "Gusto ko is the everyday 'I want' or 'I like'. Note the pronoun is ko here, not ako — Tagalog uses a different pronoun set after gusto.",
      twist: {
        prompt: "Now say: I want tea (tea = tsaa)",
        chunks: [
          { text: "Gusto", translit: "GOOS-to", gloss: "want", role: "verb" },
          { text: "ko", translit: "ko", gloss: "I", role: "subject" },
          { text: "ng tsaa", translit: "nang chaa", gloss: "tea", role: "object" },
        ],
        translation: "I want tea",
      },
    },
    {
      level: 4,
      skill: "Asking 'where' (Nasaan ang…)",
      chunks: [
        { text: "Nasaan", translit: "na-SA-an", gloss: "Where is", role: "question" },
        { text: "ang banyo?", translit: "ang BAN-yo", gloss: "the bathroom", role: "subject" },
      ],
      translation: "Where is the bathroom?",
      note: "ang is the marker for the thing the sentence is about — closest English has is 'the'. Nasaan ang… works for anything you're looking for.",
      twist: {
        prompt: "Now ask: Where is the market? (market = palengke)",
        chunks: [
          { text: "Nasaan", translit: "na-SA-an", gloss: "Where is", role: "question" },
          { text: "ang palengke?", translit: "ang pa-LENG-ke", gloss: "the market", role: "subject" },
        ],
        translation: "Where is the market?",
      },
    },
    {
      level: 5,
      skill: "Yes/no questions with ba",
      chunks: [
        { text: "Nagsasalita", translit: "nag-sa-sa-LI-ta", gloss: "speak", role: "verb" },
        { text: "ka", translit: "ka", gloss: "you", role: "subject" },
        { text: "ba", translit: "ba", gloss: "(question)", role: "question" },
        { text: "ng Tagalog?", translit: "nang ta-GA-log", gloss: "Tagalog", role: "object" },
      ],
      translation: "Do you speak Tagalog?",
      note: "ba is the question word, and it wants to sit near the front — right after the verb and its pronoun, not at the end. Gusto mo ba ng kape? = Do you want coffee?",
      twist: {
        prompt: "Now ask: Do you want coffee? (you want = gusto mo)",
        chunks: [
          { text: "Gusto", translit: "GOOS-to", gloss: "want", role: "verb" },
          { text: "mo", translit: "mo", gloss: "you", role: "subject" },
          { text: "ba", translit: "ba", gloss: "(question)", role: "question" },
          { text: "ng kape?", translit: "nang ka-PE", gloss: "coffee", role: "object" },
        ],
        translation: "Do you want coffee?",
      },
    },
  ],
};

// Color for each grammatical role (used by the Sentence Lab UI for chunks).
export const ROLE_COLORS = {
  subject:   { bg: "#3b82f6", label: "who" },       // blue
  verb:      { bg: "#ef4444", label: "action" },    // red
  object:    { bg: "#10b981", label: "what" },      // green
  time:      { bg: "#f59e0b", label: "when" },      // amber
  negation:  { bg: "#8b5cf6", label: "not" },       // purple
  question:  { bg: "#ec4899", label: "question" },  // pink
  particle:  { bg: "#6b7280", label: "particle" },  // gray
  adjective: { bg: "#14b8a6", label: "describe" },  // teal
  connector: { bg: "#a16207", label: "connector" }, // brown
};

// Does a language have sentence patterns yet?
export function hasSentencePatterns(langCode) {
  return Array.isArray(SENTENCE_PATTERNS[langCode]) && SENTENCE_PATTERNS[langCode].length > 0;
}

// Get the pattern for a given "drop number" (1-indexed). Drops climb the ladder;
// once the ladder is exhausted, it cycles back with the hardest patterns so
// practice continues. Returns null if the language has no patterns.
export function getPatternForDrop(langCode, dropNumber) {
  const ladder = SENTENCE_PATTERNS[langCode];
  if (!ladder || ladder.length === 0) return null;
  // dropNumber 1 → index 0, etc. Clamp/cycle through the higher rungs.
  const idx = (dropNumber - 1) % ladder.length;
  return ladder[idx];
}

// How many distinct patterns a language has (its ladder height).
export function ladderHeight(langCode) {
  return (SENTENCE_PATTERNS[langCode] || []).length;
}
