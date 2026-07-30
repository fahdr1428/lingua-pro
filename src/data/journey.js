// =============================================================================
// JOURNEY (v70) — the "reach, not position" layer, now a real map.
//
// Instead of describing progress as units completed, each stop names a
// CONVERSATION the learner can hold. Behind you reads "you can…", the current
// stop reads "next you'll be able to…", ahead reads "then you can…" — the tense
// itself carries the progression.
//
// v70 adds CHAPTERS. The journey is no longer one flat list of six stops; it's
// named regions the learner crosses in order, three stops each:
//
//   Chapter 1 → units 1-3      Chapter 3 → units 7-9
//   Chapter 2 → units 4-6      Chapter 4 → units 10-12
//
// Each chapter ends at a checkpoint, which is what makes the map read as terrain
// with gates rather than a to-do list.
//
// THREE STOPS PER CHAPTER IS NOT ARBITRARY: it's UNITS_PER_CHAPTER from
// chapters.js. Because a stop is gated on the unit at the same index, grouping
// stops in threes makes journey chapter N exactly chapters.js chapter N — so the
// checkpoint drawn at the end of a region on the map IS the real chapter exam
// that gates it. Group them any other way and the map's gates sit somewhere the
// app doesn't actually gate.
//
// CONTENT RULE (unchanged, and the most important rule in this file): every
// exchange here is verified before it ships. Wrong grammar in a feature whose
// entire job is "you can now say this" is the worst failure the app can have.
// Languages without verified stops fall back to the plain unit path — nothing
// breaks, they just don't get the capability framing yet.
//
// Sources cross-checked while writing these (July 2026): Urdu — Talkpal everyday
// phrases, Preply common Urdu phrases, Eton Institute beginner phrases,
// Wikibooks Urdu/Vocabulary/Basic Phrases. Spanish — SpanishDict, RAE for
// ser/estar usage. French — Lawless French, Le Robert. Turkish — turkish.academy,
// StoryLearning, Preply. Hindi — Learn Hindi (hindipod101) common phrases,
// Wikibooks Hindi. Arabic — Madinah Arabic phrasebook, ArabicPod101 basics.
// Every line was additionally checked against the language pack's own vocab so
// the journey never asks for a word the course hasn't taught.
// =============================================================================

// Fallback region names, used when the caller can't supply real unit titles.
// The map prefers titles derived from the language pack's own units (which vary
// per language), so these only show if that data hasn't loaded yet.
export const CHAPTER_TITLES = [
  "Meeting people",
  "Everyday needs",
  "Out in the world",
  "Saying more",
];

export const JOURNEY = {
  // ---------------------------------------------------------------- Urdu -----
  ur: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "ur-c1-s1",
        // done tense (shown once complete) / future tense (shown when current)
        done: "You can greet someone properly",
        next: "you'll be able to greet someone and answer back",
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
        // The reciprocity stop — the app otherwise only ever asks learners to
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
      // ---- Chapter 2 · Getting around ----
      {
        id: "ur-c2-s1",
        done: "You can ask for something you want",
        next: "you'll be able to ask for what you want",
        they: { text: "آپ کو کیا چاہیے؟", translit: "aap ko kya chahiye?", en: "what would you like?" },
        you: { text: "مجھے پانی چاہیے", translit: "mujhe paani chahiye", en: "I'd like water" },
        unitIndex: 6,
      },
      {
        id: "ur-c2-s2",
        done: "You can ask the price of something",
        next: "you'll be able to ask how much something costs",
        they: { text: "یہ سو روپے کا ہے", translit: "yeh sau rupay ka hai", en: "this is one hundred rupees" },
        you: { text: "یہ کتنے کا ہے؟", translit: "yeh kitne ka hai?", en: "how much is this?" },
        unitIndex: 7,
      },
      {
        id: "ur-c2-s3",
        done: "You can ask where something is",
        next: "you'll be able to ask where a place is",
        they: { text: "سیدھے جائیں", translit: "seedhe jayen", en: "go straight ahead" },
        you: { text: "بازار کہاں ہے؟", translit: "bazaar kahan hai?", en: "where is the market?" },
        unitIndex: 8,
      },
      // ---- Chapter 3 · Everyday life ----
      {
        id: "ur-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "آج آپ کیا کر رہے ہیں؟", translit: "aaj aap kya kar rahe hain?", en: "what are you doing today?" },
        you: { text: "آج میں کام کر رہا ہوں", translit: "aaj main kaam kar raha hoon", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "ur-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "آپ ٹھیک ہیں؟", translit: "aap theek hain?", en: "are you alright?" },
        you: { text: "میں تھکا ہوا ہوں", translit: "main thaka hua hoon", en: "I'm tired" },
        unitIndex: 10,
      },
      {
        id: "ur-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "آپ کو چائے پسند ہے؟", translit: "aap ko chai pasand hai?", en: "do you like tea?" },
        you: { text: "ہاں، لیکن مجھے کافی زیادہ پسند ہے", translit: "haan, lekin mujhe coffee zyada pasand hai", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // ------------------------------------------------------------- Spanish -----
  es: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "es-c1-s1",
        done: "You can greet someone and be greeted back",
        next: "you'll be able to greet someone and answer back",
        they: { text: "¡Hola! Buenos días", translit: "hola, buenos días", en: "hello, good morning" },
        you: { text: "Buenos días, ¿qué tal?", translit: "buenos días, qué tal", en: "good morning, how's it going?" },
        unitIndex: 0,
      },
      {
        id: "es-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "¿Cómo estás?", translit: "cómo estás", en: "how are you?" },
        you: { text: "Estoy bien, gracias", translit: "estoy bien, gracias", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "es-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "¿Cómo te llamas?", translit: "cómo te llamas", en: "what's your name?" },
        you: { text: "Me llamo …", translit: "me llamo …", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "es-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "¿De dónde eres?", translit: "de dónde eres", en: "where are you from?" },
        you: { text: "Soy de …", translit: "soy de …", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "es-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "Me llamo Diego", translit: "me llamo Diego", en: "my name is Diego" },
        you: { text: "¿Y tú, de dónde eres?", translit: "y tú, de dónde eres", en: "and you, where are you from?" },
        unitIndex: 4,
      },
      {
        id: "es-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "Mucho gusto", translit: "mucho gusto", en: "pleased to meet you" },
        you: { text: "Igualmente. ¡Hasta luego!", translit: "igualmente, hasta luego", en: "likewise. See you later!" },
        unitIndex: 5,
      },
      {
        id: "es-c2-s1",
        done: "You can order something",
        next: "you'll be able to order food and drink",
        they: { text: "¿Qué quieres tomar?", translit: "qué quieres tomar", en: "what would you like?" },
        you: { text: "Quiero un café, por favor", translit: "quiero un café, por favor", en: "I'd like a coffee, please" },
        unitIndex: 6,
      },
      {
        id: "es-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "Son cinco euros", translit: "son cinco euros", en: "that's five euros" },
        you: { text: "¿Cuánto cuesta?", translit: "cuánto cuesta", en: "how much does it cost?" },
        unitIndex: 7,
      },
      {
        id: "es-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "Está a la derecha", translit: "está a la derecha", en: "it's on the right" },
        you: { text: "¿Dónde está el mercado?", translit: "dónde está el mercado", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "es-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "¿Qué haces hoy?", translit: "qué haces hoy", en: "what are you doing today?" },
        you: { text: "Hoy trabajo, mañana descanso", translit: "hoy trabajo, mañana descanso", en: "today I work, tomorrow I rest" },
        unitIndex: 9,
      },
      {
        id: "es-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "¿Estás bien?", translit: "estás bien", en: "are you alright?" },
        you: { text: "Estoy cansado, pero bien", translit: "estoy cansado, pero bien", en: "I'm tired, but fine" },
        unitIndex: 10,
      },
      {
        id: "es-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "¿Te gusta el té?", translit: "te gusta el té", en: "do you like tea?" },
        you: { text: "Sí, pero prefiero el café", translit: "sí, pero prefiero el café", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // -------------------------------------------------------------- French -----
  fr: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "fr-c1-s1",
        done: "You can greet someone properly",
        next: "you'll be able to greet someone and answer back",
        they: { text: "Bonjour !", translit: "bonjour", en: "hello / good day" },
        you: { text: "Bonjour, ça va ?", translit: "bonjour, ça va", en: "hello, how's it going?" },
        unitIndex: 0,
      },
      {
        id: "fr-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "Comment allez-vous ?", translit: "comment allez-vous", en: "how are you?" },
        you: { text: "Ça va bien, merci", translit: "ça va bien, merci", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "fr-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "Comment vous appelez-vous ?", translit: "comment vous appelez-vous", en: "what's your name?" },
        you: { text: "Je m'appelle …", translit: "je m'appelle …", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "fr-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "D'où venez-vous ?", translit: "d'où venez-vous", en: "where are you from?" },
        you: { text: "Je viens de …", translit: "je viens de …", en: "I come from …" },
        unitIndex: 3,
      },
      {
        id: "fr-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "Je m'appelle Camille", translit: "je m'appelle Camille", en: "my name is Camille" },
        you: { text: "Et vous, d'où venez-vous ?", translit: "et vous, d'où venez-vous", en: "and you, where are you from?" },
        unitIndex: 4,
      },
      {
        id: "fr-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "Enchanté !", translit: "enchanté", en: "pleased to meet you" },
        you: { text: "Au revoir, bonne journée !", translit: "au revoir, bonne journée", en: "goodbye, have a good day!" },
        unitIndex: 5,
      },
      {
        id: "fr-c2-s1",
        done: "You can order something",
        next: "you'll be able to order food and drink",
        they: { text: "Vous désirez ?", translit: "vous désirez", en: "what would you like?" },
        you: { text: "Je voudrais un café, s'il vous plaît", translit: "je voudrais un café, s'il vous plaît", en: "I'd like a coffee, please" },
        unitIndex: 6,
      },
      {
        id: "fr-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "Ça fait cinq euros", translit: "ça fait cinq euros", en: "that comes to five euros" },
        you: { text: "C'est combien ?", translit: "c'est combien", en: "how much is it?" },
        unitIndex: 7,
      },
      {
        id: "fr-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "C'est à droite", translit: "c'est à droite", en: "it's on the right" },
        you: { text: "Où est le marché ?", translit: "où est le marché", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "fr-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "Qu'est-ce que vous faites aujourd'hui ?", translit: "qu'est-ce que vous faites aujourd'hui", en: "what are you doing today?" },
        you: { text: "Aujourd'hui je travaille", translit: "aujourd'hui je travaille", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "fr-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "Ça va ?", translit: "ça va", en: "are you alright?" },
        you: { text: "Je suis fatigué, mais ça va", translit: "je suis fatigué, mais ça va", en: "I'm tired, but I'm fine" },
        unitIndex: 10,
      },
      {
        id: "fr-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "Vous aimez le thé ?", translit: "vous aimez le thé", en: "do you like tea?" },
        you: { text: "Oui, mais je préfère le café", translit: "oui, mais je préfère le café", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // ------------------------------------------------------------- Turkish -----
  tr: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "tr-c1-s1",
        done: "You can greet someone and be welcomed",
        next: "you'll be able to greet someone and answer back",
        they: { text: "Merhaba! Hoş geldin", translit: "merhaba, hoş geldin", en: "hello, welcome" },
        you: { text: "Hoş bulduk", translit: "hoş bulduk", en: "glad to be here (the set reply)" },
        unitIndex: 0,
      },
      {
        id: "tr-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "Nasılsın?", translit: "nasılsın", en: "how are you?" },
        you: { text: "İyiyim, teşekkürler", translit: "iyiyim, teşekkürler", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "tr-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "Adın ne?", translit: "adın ne", en: "what's your name?" },
        you: { text: "Benim adım …", translit: "benim adım …", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "tr-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "Nerelisin?", translit: "nerelisin", en: "where are you from?" },
        you: { text: "Ben …'lıyım", translit: "ben …'lıyım", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "tr-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "Benim adım Elif", translit: "benim adım Elif", en: "my name is Elif" },
        you: { text: "Sen nerelisin?", translit: "sen nerelisin", en: "and where are you from?" },
        unitIndex: 4,
      },
      {
        id: "tr-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "Memnun oldum", translit: "memnun oldum", en: "pleased to meet you" },
        you: { text: "Ben de. Görüşürüz!", translit: "ben de, görüşürüz", en: "me too. See you!" },
        unitIndex: 5,
      },
      {
        id: "tr-c2-s1",
        done: "You can order something",
        next: "you'll be able to order food and drink",
        they: { text: "Ne alırsınız?", translit: "ne alırsınız", en: "what will you have?" },
        you: { text: "Bir çay, lütfen", translit: "bir çay, lütfen", en: "one tea, please" },
        unitIndex: 6,
      },
      {
        id: "tr-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "Elli lira", translit: "elli lira", en: "fifty lira" },
        you: { text: "Ne kadar?", translit: "ne kadar", en: "how much?" },
        unitIndex: 7,
      },
      {
        id: "tr-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "Sağda", translit: "sağda", en: "on the right" },
        you: { text: "Pazar nerede?", translit: "pazar nerede", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "tr-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "Bugün ne yapıyorsun?", translit: "bugün ne yapıyorsun", en: "what are you doing today?" },
        you: { text: "Bugün çalışıyorum", translit: "bugün çalışıyorum", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "tr-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "İyi misin?", translit: "iyi misin", en: "are you alright?" },
        you: { text: "Yorgunum ama iyiyim", translit: "yorgunum ama iyiyim", en: "I'm tired but I'm fine" },
        unitIndex: 10,
      },
      {
        id: "tr-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "Çay sever misin?", translit: "çay sever misin", en: "do you like tea?" },
        you: { text: "Evet, ama kahveyi daha çok severim", translit: "evet, ama kahveyi daha çok severim", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // --------------------------------------------------------------- Hindi -----
  hi: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "hi-c1-s1",
        done: "You can greet someone properly",
        next: "you'll be able to greet someone and answer back",
        they: { text: "नमस्ते", translit: "namaste", en: "hello (respectful)" },
        you: { text: "नमस्ते, आप कैसे हैं?", translit: "namaste, aap kaise hain?", en: "hello, how are you?" },
        unitIndex: 0,
      },
      {
        id: "hi-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "आप कैसे हैं?", translit: "aap kaise hain?", en: "how are you?" },
        you: { text: "मैं ठीक हूँ, शुक्रिया", translit: "main theek hoon, shukriya", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "hi-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "आपका नाम क्या है?", translit: "aapka naam kya hai?", en: "what is your name?" },
        you: { text: "मेरा नाम … है", translit: "mera naam … hai", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "hi-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "आप कहाँ से हैं?", translit: "aap kahan se hain?", en: "where are you from?" },
        you: { text: "मैं … से हूँ", translit: "main … se hoon", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "hi-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "मेरा नाम प्रिया है", translit: "mera naam Priya hai", en: "my name is Priya" },
        you: { text: "आप कहाँ से हैं?", translit: "aap kahan se hain?", en: "and where are you from?" },
        unitIndex: 4,
      },
      {
        id: "hi-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "आपसे मिलकर खुशी हुई", translit: "aapse milkar khushi hui", en: "pleased to meet you" },
        you: { text: "फिर मिलेंगे", translit: "phir milenge", en: "see you again" },
        unitIndex: 5,
      },
      {
        id: "hi-c2-s1",
        done: "You can ask for something you want",
        next: "you'll be able to ask for what you want",
        they: { text: "आपको क्या चाहिए?", translit: "aapko kya chahiye?", en: "what would you like?" },
        you: { text: "मुझे पानी चाहिए", translit: "mujhe paani chahiye", en: "I'd like water" },
        unitIndex: 6,
      },
      {
        id: "hi-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "सौ रुपये", translit: "sau rupaye", en: "one hundred rupees" },
        you: { text: "यह कितने का है?", translit: "yeh kitne ka hai?", en: "how much is this?" },
        unitIndex: 7,
      },
      {
        id: "hi-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "सीधे जाइए", translit: "seedhe jaiye", en: "go straight ahead" },
        you: { text: "बाज़ार कहाँ है?", translit: "bazaar kahan hai?", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "hi-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "आज आप क्या कर रहे हैं?", translit: "aaj aap kya kar rahe hain?", en: "what are you doing today?" },
        you: { text: "आज मैं काम कर रहा हूँ", translit: "aaj main kaam kar raha hoon", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "hi-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "आप ठीक हैं?", translit: "aap theek hain?", en: "are you alright?" },
        you: { text: "मैं थका हुआ हूँ", translit: "main thaka hua hoon", en: "I'm tired" },
        unitIndex: 10,
      },
      {
        id: "hi-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "आपको चाय पसंद है?", translit: "aapko chai pasand hai?", en: "do you like tea?" },
        you: { text: "हाँ, लेकिन मुझे कॉफ़ी ज़्यादा पसंद है", translit: "haan, lekin mujhe coffee zyada pasand hai", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // -------------------------------------------------------------- Arabic -----
  ar: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "ar-c1-s1",
        done: "You can greet someone properly",
        next: "you'll be able to greet someone and answer back",
        they: { text: "السلام عليكم", translit: "as-salamu alaykum", en: "peace be upon you" },
        you: { text: "وعليكم السلام", translit: "wa alaykum as-salam", en: "and upon you, peace" },
        unitIndex: 0,
      },
      {
        id: "ar-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "كيف حالك؟", translit: "kayfa haluk?", en: "how are you?" },
        you: { text: "أنا بخير، شكرا", translit: "ana bikhayr, shukran", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "ar-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "ما اسمك؟", translit: "ma ismuk?", en: "what is your name?" },
        you: { text: "اسمي …", translit: "ismi …", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "ar-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "من أين أنت؟", translit: "min ayna anta?", en: "where are you from?" },
        you: { text: "أنا من …", translit: "ana min …", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "ar-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "اسمي يوسف", translit: "ismi Yusuf", en: "my name is Yusuf" },
        you: { text: "ومن أين أنت؟", translit: "wa min ayna anta?", en: "and where are you from?" },
        unitIndex: 4,
      },
      {
        id: "ar-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "تشرفت بمعرفتك", translit: "tasharraftu bi-ma'rifatik", en: "pleased to meet you" },
        you: { text: "مع السلامة", translit: "ma'a as-salama", en: "goodbye (go in safety)" },
        unitIndex: 5,
      },
      {
        id: "ar-c2-s1",
        done: "You can ask for something you want",
        next: "you'll be able to ask for what you want",
        they: { text: "ماذا تريد؟", translit: "madha turid?", en: "what would you like?" },
        you: { text: "أريد ماء، من فضلك", translit: "urid ma', min fadlik", en: "I'd like water, please" },
        unitIndex: 6,
      },
      {
        id: "ar-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "عشرة دولارات", translit: "'ashara dolarat", en: "ten dollars" },
        you: { text: "بكم هذا؟", translit: "bikam hadha?", en: "how much is this?" },
        unitIndex: 7,
      },
      {
        id: "ar-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "على اليمين", translit: "'ala al-yamin", en: "on the right" },
        you: { text: "أين السوق؟", translit: "ayna as-suq?", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "ar-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "ماذا تفعل اليوم؟", translit: "madha taf'al al-yawm?", en: "what are you doing today?" },
        you: { text: "اليوم أعمل", translit: "al-yawm a'mal", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "ar-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "هل أنت بخير؟", translit: "hal anta bikhayr?", en: "are you alright?" },
        you: { text: "أنا تعبان", translit: "ana ta'ban", en: "I'm tired" },
        unitIndex: 10,
      },
      {
        id: "ar-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "هل تحب الشاي؟", translit: "hal tuhibb ash-shay?", en: "do you like tea?" },
        you: { text: "نعم، لكن أفضل القهوة", translit: "na'am, lakin ufaddil al-qahwa", en: "yes, but I prefer coffee" },
        unitIndex: 11,
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

// ---------------------------------------------------------------------------
// v70 — chapter grouping for the map.
// ---------------------------------------------------------------------------

// Must stay equal to UNITS_PER_CHAPTER in chapters.js — see the header note.
// Imported rather than redeclared so the two can't drift apart.
import { UNITS_PER_CHAPTER } from "./chapters.js";

/**
 * Group a language's stops into the regions the map draws.
 *
 * Grouped in UNITS_PER_CHAPTER-sized runs so journey chapter N is exactly
 * chapters.js chapter N, and the checkpoint at the end of a region on the map is
 * the real chapter exam that gates the next one.
 *
 * Returns [{ number, title, stops: [{...stop, globalIndex}], startsAt, endsAtUnit }].
 */
export function getChapters(langCode) {
  const stops = getStops(langCode);
  if (!stops.length) return [];

  const chapters = [];
  for (let i = 0, number = 1; i < stops.length; i += UNITS_PER_CHAPTER, number++) {
    const slice = stops
      .slice(i, i + UNITS_PER_CHAPTER)
      .map((s, j) => ({ ...s, globalIndex: i + j }));
    if (!slice.length) break;
    chapters.push({
      number,
      title: CHAPTER_TITLES[number - 1] || `Chapter ${number}`,
      stops: slice,
      startsAt: i,
      // The unit index this region ends on — where its checkpoint sits.
      endsAtUnit: slice[slice.length - 1].unitIndex,
    });
  }
  return chapters;
}

/** Which chapter the learner is currently standing in (1-based). */
export function currentChapterNumber(langCode, reached) {
  const chapters = getChapters(langCode);
  for (const ch of chapters) {
    if (reached < ch.startsAt + ch.stops.length) return ch.number;
  }
  return chapters.length || 1;
}
