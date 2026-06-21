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
