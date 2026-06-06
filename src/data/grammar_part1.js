// =============================================================================
// GRAMMAR CURRICULUM — teachable mini-lessons, not a dry reference.
//
// Each language has an ordered list of grammar lessons. Each lesson:
//   { id, title, emoji, concept (plain-English explanation),
//     examples: [{ native, translit, gloss }],   // gloss = literal breakdown
//     checks: [{ q, options, answer, explain }] } // quick comprehension checks
//
// CONFIDENCE POLICY: only well-established, undisputed beginner grammar.
// Examples use vocabulary learners actually encounter. Where languages share
// structure (Urdu/Hindi), lessons are parallel but each verified independently.
//
// This file is split across two modules for size; both are merged in
// grammar.js. Part 1: es, fr, ur, hi.
// =============================================================================

export const GRAMMAR_PART1 = {
  // ===========================================================================
  // SPANISH — high confidence
  // ===========================================================================
  es: [
    {
      id: "es_g1",
      title: "Word order: the basics",
      emoji: "🔤",
      concept:
        "Spanish usually follows Subject–Verb–Object, like English: 'Yo como pan' = 'I eat bread'. The big difference: Spanish often DROPS the subject pronoun, because the verb ending already tells you who is doing the action. 'Como pan' on its own still means 'I eat bread'.",
      examples: [
        { native: "Yo hablo español", translit: "yo AH-blo es-pan-YOL", gloss: "I speak Spanish" },
        { native: "Hablo español", translit: "AH-blo es-pan-YOL", gloss: "(I) speak Spanish — 'yo' dropped" },
        { native: "Ella come pan", translit: "EH-ya KO-meh pan", gloss: "She eats bread" },
      ],
      checks: [
        {
          q: "Why can Spanish drop 'yo' (I)?",
          options: ["The verb ending shows who acts", "It's optional slang", "Only in writing", "It never drops it"],
          answer: "The verb ending shows who acts",
          explain: "'-o' on 'hablo' already means 'I', so 'yo' is redundant.",
        },
      ],
    },
    {
      id: "es_g2",
      title: "Ser vs Estar — two ways to 'be'",
      emoji: "⚖️",
      concept:
        "Spanish has TWO verbs for 'to be'. **Ser** is for permanent, defining things: who/what something is (I am a doctor, she is Spanish, the table is wood). **Estar** is for temporary states and location (I am tired, he is at home, the coffee is hot). Same English word, totally different choice in Spanish.",
      examples: [
        { native: "Soy estudiante", translit: "soy es-too-dee-AN-teh", gloss: "I am a student (defining → ser)" },
        { native: "Estoy cansado", translit: "es-TOY kan-SA-do", gloss: "I am tired (temporary → estar)" },
        { native: "Estoy en casa", translit: "es-TOY en KA-sa", gloss: "I am at home (location → estar)" },
      ],
      checks: [
        {
          q: "Which 'to be' for 'I am tired'?",
          options: ["Estar (temporary state)", "Ser (permanent)", "Either works", "Neither"],
          answer: "Estar (temporary state)",
          explain: "Being tired is temporary, so it uses estar: 'estoy cansado'.",
        },
        {
          q: "'I am a teacher' uses…",
          options: ["Ser (it defines who you are)", "Estar (it's temporary)", "Both equally", "No verb"],
          answer: "Ser (it defines who you are)",
          explain: "Your profession defines you → 'soy profesor/profesora'.",
        },
      ],
    },
    {
      id: "es_g3",
      title: "Gender: el and la",
      emoji: "♀️",
      concept:
        "Every Spanish noun is masculine or feminine. 'The' is **el** for masculine, **la** for feminine. Most nouns ending in -o are masculine (el libro = the book), most ending in -a are feminine (la casa = the house) — but there are exceptions, so learn each noun WITH its article.",
      examples: [
        { native: "el libro", translit: "el LEE-bro", gloss: "the book (masculine)" },
        { native: "la casa", translit: "la KA-sa", gloss: "the house (feminine)" },
        { native: "el agua", translit: "el AH-gwa", gloss: "the water (exception — learn it!)" },
      ],
      checks: [
        {
          q: "What does the article tell you?",
          options: ["The noun's gender", "The verb tense", "How many", "Nothing"],
          answer: "The noun's gender",
          explain: "el = masculine, la = feminine. Always learn it with the noun.",
        },
      ],
    },
    {
      id: "es_g4",
      title: "Adjectives agree",
      emoji: "🔗",
      concept:
        "Adjectives change to match the noun's gender and number. A masculine noun takes a masculine adjective; feminine takes feminine; plural adds -s. 'Tired' = cansado (m) / cansada (f) / cansados / cansadas.",
      examples: [
        { native: "el coche rojo", translit: "el KO-cheh RO-ho", gloss: "the red car (m)" },
        { native: "la casa roja", translit: "la KA-sa RO-ha", gloss: "the red house (f)" },
        { native: "las casas rojas", translit: "las KA-sas RO-has", gloss: "the red houses (f, plural)" },
      ],
      checks: [
        {
          q: "'A tired woman' — which form of cansado?",
          options: ["cansada", "cansado", "cansados", "cansar"],
          answer: "cansada",
          explain: "Feminine noun → feminine adjective ending -a.",
        },
      ],
    },
    {
      id: "es_g5",
      title: "Present tense -ar verbs",
      emoji: "🎬",
      concept:
        "Most Spanish verbs end in -ar (hablar = to speak). To say who does it, drop -ar and add an ending: yo habl**o**, tú habl**as**, él/ella habl**a**, nosotros habl**amos**, ellos habl**an**. The ending IS the subject.",
      examples: [
        { native: "hablo", translit: "AH-blo", gloss: "I speak" },
        { native: "hablas", translit: "AH-blas", gloss: "you speak (informal)" },
        { native: "hablamos", translit: "ah-BLA-mos", gloss: "we speak" },
      ],
      checks: [
        {
          q: "'Hablas' means…",
          options: ["You speak", "I speak", "We speak", "They speak"],
          answer: "You speak",
          explain: "-as ending = tú (you, informal).",
        },
      ],
    },
    {
      id: "es_g6",
      title: "Asking questions",
      emoji: "❓",
      concept:
        "Spanish questions are simple: keep the words, add question marks (¡note the upside-down ¿ at the start!) and raise your voice. No 'do/does' helper like English. '¿Hablas español?' = 'Do you speak Spanish?'. Question words: qué (what), dónde (where), cómo (how), cuándo (when), por qué (why).",
      examples: [
        { native: "¿Hablas español?", translit: "AH-blas es-pan-YOL", gloss: "Do you speak Spanish?" },
        { native: "¿Dónde está?", translit: "DON-deh es-TA", gloss: "Where is it?" },
        { native: "¿Qué quieres?", translit: "keh kee-EH-res", gloss: "What do you want?" },
      ],
      checks: [
        {
          q: "How do you make 'You speak Spanish' a question?",
          options: ["Add ¿ ? and raise voice", "Add 'do' before it", "Change word order fully", "Add -ar"],
          answer: "Add ¿ ? and raise voice",
          explain: "No helper verb needed — punctuation and intonation do it.",
        },
      ],
    },
  ],

  // ===========================================================================
  // FRENCH — high confidence
  // ===========================================================================
  fr: [
    {
      id: "fr_g1",
      title: "Word order & subject pronouns",
      emoji: "🔤",
      concept:
        "French is Subject–Verb–Object like English, BUT unlike Spanish, French keeps the subject pronoun (je, tu, il…). 'Je parle français' = 'I speak French' — you can't drop 'je'.",
      examples: [
        { native: "Je parle français", translit: "zhuh parl frahn-SEH", gloss: "I speak French" },
        { native: "Tu manges du pain", translit: "too mahnzh doo pan", gloss: "You eat bread" },
        { native: "Elle aime le café", translit: "el em luh ka-FEH", gloss: "She likes coffee" },
      ],
      checks: [
        {
          q: "Can French drop 'je' like Spanish drops 'yo'?",
          options: ["No, French keeps it", "Yes, always", "Only in speech", "Only in writing"],
          answer: "No, French keeps it",
          explain: "French subject pronouns are required.",
        },
      ],
    },
    {
      id: "fr_g2",
      title: "Gender: le, la, un, une",
      emoji: "♀️",
      concept:
        "Every French noun is masculine or feminine. 'The' = **le** (m) / **la** (f). 'A' = **un** (m) / **une** (f). There's no reliable rule for which is which — you must learn the gender with each noun.",
      examples: [
        { native: "le livre", translit: "luh LEEVR", gloss: "the book (m)" },
        { native: "la table", translit: "la TABL", gloss: "the table (f)" },
        { native: "une pomme", translit: "oon POM", gloss: "an apple (f)" },
      ],
      checks: [
        {
          q: "'Une' is used with…",
          options: ["Feminine nouns", "Masculine nouns", "Plurals only", "Verbs"],
          answer: "Feminine nouns",
          explain: "un = masculine 'a', une = feminine 'a'.",
        },
      ],
    },
    {
      id: "fr_g3",
      title: "C'est vs Il/Elle est",
      emoji: "⚖️",
      concept:
        "Both translate as 'it is / he is'. Use **c'est** before a noun (c'est un chat = it's a cat). Use **il est / elle est** before an adjective (il est grand = he is tall).",
      examples: [
        { native: "C'est un livre", translit: "say tun LEEVR", gloss: "It's a book (noun → c'est)" },
        { native: "Il est grand", translit: "eel ay grahn", gloss: "He is tall (adjective → il est)" },
        { native: "C'est bon", translit: "say bohn", gloss: "It's good (set phrase exception)" },
      ],
      checks: [
        {
          q: "'It is a teacher' uses…",
          options: ["C'est (before a noun)", "Il est (before adjective)", "Either", "Neither"],
          answer: "C'est (before a noun)",
          explain: "'a teacher' is a noun → c'est un professeur.",
        },
      ],
    },
    {
      id: "fr_g4",
      title: "Adjectives agree & often follow",
      emoji: "🔗",
      concept:
        "French adjectives match gender/number (add -e for feminine, -s for plural) AND most come AFTER the noun, unlike English. 'A red car' = 'une voiture rouge' (literally 'a car red').",
      examples: [
        { native: "un livre vert", translit: "un leevr vehr", gloss: "a green book (m)" },
        { native: "une voiture verte", translit: "oon vwa-toor vehrt", gloss: "a green car (f, +e)" },
        { native: "une grande maison", translit: "oon grahnd may-ZOHN", gloss: "a big house (some come before)" },
      ],
      checks: [
        {
          q: "Where do most French adjectives go?",
          options: ["After the noun", "Before the noun", "At the end of the sentence", "It varies randomly"],
          answer: "After the noun",
          explain: "'voiture rouge' = car red. A small set (grand, petit, bon) come before.",
        },
      ],
    },
    {
      id: "fr_g5",
      title: "Negation: ne … pas",
      emoji: "🚫",
      concept:
        "French negates with TWO words wrapping the verb: **ne** … **pas**. 'Je ne parle pas' = 'I do not speak'. In casual speech the 'ne' is often dropped ('je parle pas'), but write both.",
      examples: [
        { native: "Je ne sais pas", translit: "zhuh nuh say pa", gloss: "I do not know" },
        { native: "Il ne mange pas", translit: "eel nuh mahnzh pa", gloss: "He does not eat" },
        { native: "Ce n'est pas bon", translit: "suh nay pa bohn", gloss: "It is not good" },
      ],
      checks: [
        {
          q: "How does French say 'not'?",
          options: ["ne … pas around the verb", "Just 'pas'", "Just 'non'", "Add -n't"],
          answer: "ne … pas around the verb",
          explain: "The verb sits between ne and pas.",
        },
      ],
    },
    {
      id: "fr_g6",
      title: "Asking questions (3 ways)",
      emoji: "❓",
      concept:
        "French has three question styles: (1) raise your voice — 'Tu parles français?' (2) add 'Est-ce que' at the front — 'Est-ce que tu parles français?' (3) invert verb & subject — 'Parles-tu français?' (most formal). All three are correct; style 1 is most casual.",
      examples: [
        { native: "Tu viens ?", translit: "too vee-AN", gloss: "You're coming? (intonation)" },
        { native: "Est-ce que tu viens ?", translit: "es-kuh too vee-AN", gloss: "Are you coming? (est-ce que)" },
        { native: "Viens-tu ?", translit: "vee-AN too", gloss: "Are you coming? (inversion, formal)" },
      ],
      checks: [
        {
          q: "Which is the most casual question form?",
          options: ["Just raising your voice", "Inversion (Viens-tu)", "Est-ce que", "They're equally formal"],
          answer: "Just raising your voice",
          explain: "Intonation-only is the everyday spoken form.",
        },
      ],
    },
  ],

  // ===========================================================================
  // URDU — high confidence
  // ===========================================================================
  ur: [
    {
      id: "ur_g1",
      title: "Word order: verb goes LAST",
      emoji: "🔤",
      concept:
        "Urdu is Subject–Object–Verb. The verb almost always comes at the END of the sentence, unlike English. 'I water drink' is the Urdu order for 'I drink water'. Once you expect the verb last, sentences click.",
      examples: [
        { native: "میں پانی پیتا ہوں", translit: "main paani peeta hoon", gloss: "I water drink-am = I drink water" },
        { native: "وہ کتاب پڑھتا ہے", translit: "woh kitaab parhta hai", gloss: "He book reads = He reads a book" },
        { native: "ہم گھر جاتے ہیں", translit: "hum ghar jaate hain", gloss: "We home go = We go home" },
      ],
      checks: [
        {
          q: "Where does the verb go in Urdu?",
          options: ["At the end", "At the start", "After the subject", "It varies freely"],
          answer: "At the end",
          explain: "Subject–Object–Verb: the action word lands last.",
        },
      ],
    },
    {
      id: "ur_g2",
      title: "Postpositions, not prepositions",
      emoji: "📍",
      concept:
        "English puts little words BEFORE the noun ('in the house', 'to school'). Urdu puts them AFTER ('house in', 'school to'). These are called postpositions: میں (in/at), پر (on), سے (from/with), کو (to), کا/کی/کے (of).",
      examples: [
        { native: "گھر میں", translit: "ghar mein", gloss: "house in = in the house" },
        { native: "اسکول کو", translit: "school ko", gloss: "school to = to school" },
        { native: "میز پر", translit: "mez par", gloss: "table on = on the table" },
      ],
      checks: [
        {
          q: "Urdu's position words go…",
          options: ["After the noun", "Before the noun", "At the sentence start", "Nowhere"],
          answer: "After the noun",
          explain: "'ghar mein' = house-in. The opposite of English order.",
        },
      ],
    },
    {
      id: "ur_g3",
      title: "Politeness: aap, tum, tu",
      emoji: "🙏",
      concept:
        "Urdu has THREE levels of 'you'. **آپ (aap)** = respectful (elders, strangers, anyone you'd be polite to). **تم (tum)** = friendly/equal (friends, siblings). **تو (tu)** = very intimate or rude depending on context (close family, or insulting to a stranger). When unsure, always use aap.",
      examples: [
        { native: "آپ کیسے ہیں؟", translit: "aap kaise hain?", gloss: "How are you? (respectful)" },
        { native: "تم کیسے ہو؟", translit: "tum kaise ho?", gloss: "How are you? (friendly)" },
        { native: "آپ کا نام؟", translit: "aap ka naam?", gloss: "Your name? (polite)" },
      ],
      checks: [
        {
          q: "Talking to an elder you just met — which 'you'?",
          options: ["aap (respectful)", "tum (friendly)", "tu (intimate)", "Any is fine"],
          answer: "aap (respectful)",
          explain: "Default to aap with elders and strangers — it shows respect.",
        },
        {
          q: "Using 'tu' with a stranger sounds…",
          options: ["Rude/too familiar", "Extra polite", "Neutral", "Formal"],
          answer: "Rude/too familiar",
          explain: "tu is intimate; with a stranger it can be insulting. Use aap.",
        },
      ],
    },
    {
      id: "ur_g4",
      title: "Gender shapes the verb",
      emoji: "♀️",
      concept:
        "Urdu nouns are masculine or feminine, and the VERB changes to match the subject's gender. A man says 'main jaata hoon' (I go); a woman says 'main jaati hoon'. The -a/-i ending carries the gender.",
      examples: [
        { native: "میں کھاتا ہوں", translit: "main khaata hoon", gloss: "I eat (male speaker)" },
        { native: "میں کھاتی ہوں", translit: "main khaati hoon", gloss: "I eat (female speaker)" },
        { native: "وہ جاتی ہے", translit: "woh jaati hai", gloss: "She goes (feminine)" },
      ],
      checks: [
        {
          q: "Why does 'khaata' become 'khaati'?",
          options: ["The speaker/subject is feminine", "Past tense", "It's plural", "Random variation"],
          answer: "The speaker/subject is feminine",
          explain: "Verb endings agree with gender: -a masculine, -i feminine.",
        },
      ],
    },
    {
      id: "ur_g5",
      title: "Making it negative: نہیں",
      emoji: "🚫",
      concept:
        "To negate, put **نہیں (nahin)** before the verb. 'main jaata hoon' (I go) → 'main nahin jaata' (I don't go). Often the 'hoon/hai' helper drops in the negative. nahin also means 'no' on its own.",
      examples: [
        { native: "میں نہیں جانتا", translit: "main nahin jaanta", gloss: "I don't know (m)" },
        { native: "وہ نہیں آیا", translit: "woh nahin aaya", gloss: "He didn't come" },
        { native: "نہیں، شکریہ", translit: "nahin, shukriya", gloss: "No, thank you" },
      ],
      checks: [
        {
          q: "Where does 'nahin' go to negate a verb?",
          options: ["Before the verb", "After the verb", "At the very end", "At the start always"],
          answer: "Before the verb",
          explain: "nahin sits directly before the action word.",
        },
      ],
    },
    {
      id: "ur_g6",
      title: "Yes/no questions: just ask کیا",
      emoji: "❓",
      concept:
        "For a yes/no question, you can simply add **کیا (kya)** at the start, or just raise your voice. 'aap theek hain' (you are well) → 'kya aap theek hain?' (are you well?). For 'what', kya goes in the middle: 'yeh kya hai?' = 'what is this?'.",
      examples: [
        { native: "کیا آپ ٹھیک ہیں؟", translit: "kya aap theek hain?", gloss: "Are you well?" },
        { native: "یہ کیا ہے؟", translit: "yeh kya hai?", gloss: "What is this?" },
        { native: "کیا تم آؤ گے؟", translit: "kya tum aao ge?", gloss: "Will you come?" },
      ],
      checks: [
        {
          q: "'kya' at the START of a sentence makes it…",
          options: ["A yes/no question", "Negative", "Past tense", "Polite"],
          answer: "A yes/no question",
          explain: "Front 'kya' = yes/no question marker. Mid 'kya' = 'what'.",
        },
      ],
    },
  ],

  // ===========================================================================
  // HINDI — high confidence (parallel to Urdu, verified independently)
  // ===========================================================================
  hi: [
    {
      id: "hi_g1",
      title: "Word order: verb goes LAST",
      emoji: "🔤",
      concept:
        "Hindi is Subject–Object–Verb. The verb comes at the END. 'I water drink' is the Hindi order for 'I drink water'. Hindi and Urdu share this structure almost exactly — they differ mainly in script and some vocabulary.",
      examples: [
        { native: "मैं पानी पीता हूँ", translit: "main paani peeta hoon", gloss: "I water drink = I drink water" },
        { native: "वह किताब पढ़ता है", translit: "vah kitaab parhta hai", gloss: "He book reads = He reads a book" },
        { native: "हम घर जाते हैं", translit: "hum ghar jaate hain", gloss: "We home go = We go home" },
      ],
      checks: [
        {
          q: "Where does the Hindi verb go?",
          options: ["At the end", "At the start", "Middle always", "It's free"],
          answer: "At the end",
          explain: "Subject–Object–Verb, same core order as Urdu.",
        },
      ],
    },
    {
      id: "hi_g2",
      title: "Postpositions, not prepositions",
      emoji: "📍",
      concept:
        "Hindi position words come AFTER the noun: में (in), पर (on), से (from/with), को (to), का/की/के (of). 'In the house' becomes 'house in' = 'ghar mein'.",
      examples: [
        { native: "घर में", translit: "ghar mein", gloss: "house in = in the house" },
        { native: "स्कूल को", translit: "school ko", gloss: "school to = to school" },
        { native: "मेज़ पर", translit: "mez par", gloss: "table on = on the table" },
      ],
      checks: [
        {
          q: "Hindi position words sit…",
          options: ["After the noun", "Before the noun", "At the start", "At the end of sentence"],
          answer: "After the noun",
          explain: "Postpositions: 'ghar mein' = house-in.",
        },
      ],
    },
    {
      id: "hi_g3",
      title: "Politeness: aap, tum, tu",
      emoji: "🙏",
      concept:
        "Hindi has three 'you' levels. **आप (aap)** = respectful (elders, strangers). **तुम (tum)** = friendly/equal. **तू (tu)** = very intimate or rude with strangers. Default to aap when unsure.",
      examples: [
        { native: "आप कैसे हैं?", translit: "aap kaise hain?", gloss: "How are you? (respectful)" },
        { native: "तुम कैसे हो?", translit: "tum kaise ho?", gloss: "How are you? (friendly)" },
        { native: "आपका नाम?", translit: "aapka naam?", gloss: "Your name? (polite)" },
      ],
      checks: [
        {
          q: "Meeting an elder — which 'you'?",
          options: ["aap (respectful)", "tum (friendly)", "tu (intimate)", "Any"],
          answer: "aap (respectful)",
          explain: "aap shows respect to elders and strangers.",
        },
      ],
    },
    {
      id: "hi_g4",
      title: "Gender shapes the verb",
      emoji: "♀️",
      concept:
        "Hindi nouns are masculine or feminine and verbs agree with the subject's gender. A man: 'main jaata hoon' (I go). A woman: 'main jaati hoon'. The -a/-i ending carries gender.",
      examples: [
        { native: "मैं खाता हूँ", translit: "main khaata hoon", gloss: "I eat (male speaker)" },
        { native: "मैं खाती हूँ", translit: "main khaati hoon", gloss: "I eat (female speaker)" },
        { native: "वह जाती है", translit: "vah jaati hai", gloss: "She goes (feminine)" },
      ],
      checks: [
        {
          q: "Why 'khaata' → 'khaati'?",
          options: ["Subject is feminine", "Past tense", "Plural", "Random"],
          answer: "Subject is feminine",
          explain: "-a masculine, -i feminine, agreeing with the subject.",
        },
      ],
    },
    {
      id: "hi_g5",
      title: "Making it negative: नहीं",
      emoji: "🚫",
      concept:
        "Put **नहीं (nahin)** before the verb to negate. 'main jaata hoon' → 'main nahin jaata' (I don't go). nahin alone also means 'no'.",
      examples: [
        { native: "मैं नहीं जानता", translit: "main nahin jaanta", gloss: "I don't know (m)" },
        { native: "वह नहीं आया", translit: "vah nahin aaya", gloss: "He didn't come" },
        { native: "नहीं, धन्यवाद", translit: "nahin, dhanyavaad", gloss: "No, thank you" },
      ],
      checks: [
        {
          q: "Where does 'nahin' go?",
          options: ["Before the verb", "After the verb", "Sentence end", "Sentence start always"],
          answer: "Before the verb",
          explain: "nahin directly precedes the action word.",
        },
      ],
    },
    {
      id: "hi_g6",
      title: "Questions: kya",
      emoji: "❓",
      concept:
        "Add **क्या (kya)** at the start for a yes/no question, or raise your voice. 'aap theek hain' → 'kya aap theek hain?' (are you well?). Mid-sentence, kya means 'what': 'yeh kya hai?' = 'what is this?'.",
      examples: [
        { native: "क्या आप ठीक हैं?", translit: "kya aap theek hain?", gloss: "Are you well?" },
        { native: "यह क्या है?", translit: "yeh kya hai?", gloss: "What is this?" },
        { native: "क्या तुम आओगे?", translit: "kya tum aaoge?", gloss: "Will you come?" },
      ],
      checks: [
        {
          q: "Front 'kya' makes a sentence…",
          options: ["A yes/no question", "Negative", "Past", "Formal"],
          answer: "A yes/no question",
          explain: "Front kya = yes/no marker; mid kya = 'what'.",
        },
      ],
    },
  ],
};
