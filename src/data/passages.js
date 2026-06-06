// =============================================================================
// PASSAGES — short connected texts for the "Read & Understand" exercise.
// This is comprehensible input: real connected language, not isolated words.
//
// Each passage uses ONLY beginner vocabulary. Every passage has:
//   - lines: [{ native, translit, translation }]   (subtitle data — works
//     even if audio is silent on the user's device)
//   - question: a comprehension question in English
//   - options: 4 answer choices
//   - answer: the correct option
//
// Languages without passages simply don't show this exercise type — graceful.
// =============================================================================

export const PASSAGES = {
  es: [
    {
      id: "es_p1",
      title: "At the café",
      lines: [
        { native: "Hola, buenos días.", translit: "hola, buenos dias", translation: "Hello, good morning." },
        { native: "Un café, por favor.", translit: "un cafe, por favor", translation: "A coffee, please." },
        { native: "Gracias. Adiós.", translit: "gracias. adios", translation: "Thank you. Goodbye." },
      ],
      question: "What does the person order?",
      options: ["A coffee", "A water", "A tea", "Bread"],
      answer: "A coffee",
    },
    {
      id: "es_p2",
      title: "Meeting someone",
      lines: [
        { native: "Hola, ¿cómo estás?", translit: "hola, como estas", translation: "Hello, how are you?" },
        { native: "Estoy bien, gracias.", translit: "estoy bien, gracias", translation: "I am well, thank you." },
        { native: "Yo soy estudiante.", translit: "yo soy estudiante", translation: "I am a student." },
      ],
      question: "What is the second person?",
      options: ["A student", "A teacher", "A doctor", "A friend"],
      answer: "A student",
    },
    {
      id: "es_p3",
      title: "Going home",
      lines: [
        { native: "Tengo hambre.", translit: "tengo hambre", translation: "I am hungry." },
        { native: "Voy a casa.", translit: "voy a casa", translation: "I am going home." },
        { native: "En casa hay comida.", translit: "en casa hay comida", translation: "At home there is food." },
      ],
      question: "Why is the person going home?",
      options: ["They are hungry", "They are tired", "It is late", "They are sad"],
      answer: "They are hungry",
    },
  ],

  fr: [
    {
      id: "fr_p1",
      title: "At the bakery",
      lines: [
        { native: "Bonjour madame.", translit: "bonjour madam", translation: "Hello madam." },
        { native: "Du pain, s'il vous plaît.", translit: "du pan, sil voo play", translation: "Some bread, please." },
        { native: "Merci. Au revoir.", translit: "mehrsee. oh ruhvwar", translation: "Thank you. Goodbye." },
      ],
      question: "What does the person buy?",
      options: ["Bread", "Coffee", "Water", "Milk"],
      answer: "Bread",
    },
    {
      id: "fr_p2",
      title: "How are you?",
      lines: [
        { native: "Salut, ça va?", translit: "saloo, sa va", translation: "Hi, how's it going?" },
        { native: "Ça va bien, merci.", translit: "sa va byan, mehrsee", translation: "It's going well, thanks." },
        { native: "Je suis fatigué.", translit: "zhuh swee fateege", translation: "I am tired." },
      ],
      question: "How does the second person feel?",
      options: ["Tired", "Hungry", "Happy", "Sad"],
      answer: "Tired",
    },
  ],

  ur: [
    {
      id: "ur_p1",
      title: "Meeting a friend",
      lines: [
        { native: "السلام علیکم", translit: "assalam-o-alaikum", translation: "Peace be upon you (hello)." },
        { native: "آپ کیسے ہیں؟", translit: "aap kaise hain?", translation: "How are you?" },
        { native: "میں ٹھیک ہوں، شکریہ", translit: "main theek hoon, shukriya", translation: "I am fine, thank you." },
      ],
      question: "How does the person respond?",
      options: ["They are fine", "They are tired", "They are sad", "They are busy"],
      answer: "They are fine",
    },
    {
      id: "ur_p2",
      title: "Asking for water",
      lines: [
        { native: "مجھے بھوک ہے", translit: "mujhe bhook hai", translation: "I am hungry." },
        { native: "پانی چاہیے", translit: "paani chahiye", translation: "I need water." },
        { native: "شکریہ", translit: "shukriya", translation: "Thank you." },
      ],
      question: "What does the person need?",
      options: ["Water", "Food", "Tea", "Help"],
      answer: "Water",
    },
  ],

  hi: [
    {
      id: "hi_p1",
      title: "Saying hello",
      lines: [
        { native: "नमस्ते", translit: "namaste", translation: "Hello." },
        { native: "आप कैसे हैं?", translit: "aap kaise hain?", translation: "How are you?" },
        { native: "मैं अच्छा हूँ", translit: "main accha hoon", translation: "I am good." },
      ],
      question: "How does the person feel?",
      options: ["Good", "Tired", "Hungry", "Sad"],
      answer: "Good",
    },
  ],

  bn: [
    {
      id: "bn_p1",
      title: "Greeting someone",
      lines: [
        { native: "নমস্কার", translit: "nomoshkar", translation: "Hello." },
        { native: "আপনি কেমন আছেন?", translit: "apni kemon achhen?", translation: "How are you?" },
        { native: "আমি ভালো আছি", translit: "ami bhalo achhi", translation: "I am well." },
      ],
      question: "How does the person respond?",
      options: ["They are well", "They are tired", "They are hungry", "They are sad"],
      answer: "They are well",
    },
  ],

  ar: [
    {
      id: "ar_p1",
      title: "A short greeting",
      lines: [
        { native: "السلام عليكم", translit: "as-salamu alaykum", translation: "Peace be upon you (hello)." },
        { native: "كيف حالك؟", translit: "kayfa haluk?", translation: "How are you?" },
        { native: "أنا بخير، شكراً", translit: "ana bikhayr, shukran", translation: "I am fine, thank you." },
      ],
      question: "How is the person?",
      options: ["Fine", "Tired", "Sad", "Busy"],
      answer: "Fine",
    },
  ],

  ko: [
    {
      id: "ko_p1",
      title: "First meeting",
      lines: [
        { native: "안녕하세요", translit: "annyeonghaseyo", translation: "Hello." },
        { native: "저는 학생이에요", translit: "jeoneun haksaeng-ieyo", translation: "I am a student." },
        { native: "감사합니다", translit: "gamsahamnida", translation: "Thank you." },
      ],
      question: "What is the person?",
      options: ["A student", "A teacher", "A doctor", "A friend"],
      answer: "A student",
    },
  ],

  ja: [
    {
      id: "ja_p1",
      title: "Good morning",
      lines: [
        { native: "おはようございます", translit: "ohayou gozaimasu", translation: "Good morning." },
        { native: "みずをください", translit: "mizu o kudasai", translation: "Water, please." },
        { native: "ありがとう", translit: "arigatou", translation: "Thank you." },
      ],
      question: "What does the person ask for?",
      options: ["Water", "Tea", "Food", "Help"],
      answer: "Water",
    },
  ],

  zh: [
    {
      id: "zh_p1",
      title: "A polite exchange",
      lines: [
        { native: "你好", translit: "nǐ hǎo", translation: "Hello." },
        { native: "我要水", translit: "wǒ yào shuǐ", translation: "I want water." },
        { native: "谢谢", translit: "xièxie", translation: "Thank you." },
      ],
      question: "What does the person want?",
      options: ["Water", "Tea", "Food", "A book"],
      answer: "Water",
    },
  ],
};

/** Get a random passage for a language, or null if none exist. */
export function getPassage(langCode, seenIds = []) {
  const list = PASSAGES[langCode];
  if (!list || list.length === 0) return null;
  const unseen = list.filter((p) => !seenIds.includes(p.id));
  const pool = unseen.length > 0 ? unseen : list;
  return pool[Math.floor(Math.random() * pool.length)];
}
