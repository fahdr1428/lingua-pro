// =============================================================================
// GUIDES — one cultural guide per language. Adult, warm, specific — NOT cartoon
// mascots. This is core to the "rooted, human" positioning a generic language
// app can't replicate.
//
// v70 REWRITE. Three things changed and each fixes a real problem:
//
//   1. NO MORE EMOJI AS THE FACE. `emoji` was rendering the guide as 👩🏼 / 🧕🏽 —
//      platform-dependent, sticker-shaped, and dead on the page. Each guide now
//      carries `initial`: their first letter IN THEIR OWN SCRIPT, which the
//      GuideMark component sets as a calligraphic seal. Rooted, printed, adult.
//      `emoji` is deliberately gone so nothing can quietly fall back to it.
//
//   2. THEY BECOME PEOPLE. `city` and `craft` say who they actually are, so the
//      guide reads as a person from somewhere rather than a personality setting.
//
//   3. THEY GET A VOICE. `voice` tunes TTS rate/pitch per guide, and `signature`
//      is a line they say ALOUD in their own language. The guide can now speak.
//
// ALSO FIXED HERE: Turkish defined `encouragement` where every other language
// defined `celebrations`, and Lesson.jsx's result screen reads
// `character.celebrations[tier]` unguarded — so finishing any Turkish lesson
// threw a TypeError into the error boundary. The key is normalised below and
// reads now go through getCelebration(), which can't throw.
//
// Structure stays conversation-ready (`reactions`, `signature`) so the speaking
// partner in Speak.jsx can use these guides without a second data source.
// =============================================================================

export const CHARACTERS = {
  ur: {
    name: "Amina",
    role: "Your Urdu guide",
    initial: "آ",              // آمنہ
    city: "Lahore",
    craft: "Teaches literature at a girls' college",
    accent: "#1e7a5a",
    voice: { rate: 0.82, pitch: 1.05 },
    signature: { text: "چلیں، شروع کریں", translit: "chalein, shuru karein", en: "Come, let's begin" },
    intro: "Assalam-o-alaikum! I'm Amina, from Lahore. I teach literature — which mostly means I argue about poetry for a living. I'll help you learn Urdu the way we actually speak it at home, with warmth, and a little chai.",
    greetings: [
      "Assalam-o-alaikum! Ready to learn?",
      "Aao, let's continue. Thora aur seekhte hain.",
      "Acha — back again! That's the spirit.",
      "Chalo, today's words are waiting.",
    ],
    celebrations: {
      perfect: "Shabaash! Bilkul perfect. Your khala would be proud.",
      great: "Bahut khoob! You're really getting this.",
      good: "Acha kaam. Every word counts — keep going.",
      keep_going: "Koi baat nahi. Mistakes are how we learn. Phir se.",
    },
    streakNote: "Consistency, beta — that's the real secret.",
    reactions: {
      correct: ["Shabaash!", "Theek!", "Bilkul sahi.", "Wah!", "Acha!"],
      wrong: ["Koi baat nahi.", "Phir se — easy hai.", "Almost! Dhyan se.", "Nahi, dekho phir."],
      streak: ["Mashallah — on a roll!", "Kya baat hai! Keep going.", "You're flying now!"],
    },
  },

  es: {
    name: "Diego",
    role: "Your Spanish guide",
    initial: "D",
    city: "Sevilla",
    craft: "Repairs flamenco guitars",
    accent: "#c0392b",
    voice: { rate: 0.9, pitch: 0.95 },
    signature: { text: "Venga, empezamos", translit: "venga, empezamos", en: "Come on, let's start" },
    intro: "¡Hola! Soy Diego, from Sevilla. I fix flamenco guitars, so I spend all day listening to how things are supposed to sound. I'll teach you Spanish that real people use — not textbook Spanish. Vamos.",
    greetings: [
      "¡Hola! ¿Listo para aprender?",
      "Venga, let's keep going. Otra vez.",
      "¡Qué bien — you came back! Vamos.",
      "Today's words are ready when you are.",
    ],
    celebrations: {
      perfect: "¡Perfecto! Ni un error. Impresionante.",
      great: "¡Muy bien! You're really improving.",
      good: "Buen trabajo. Poco a poco — that's how it's done.",
      keep_going: "Tranquilo. Everyone stumbles. Otra vez, sin miedo.",
    },
    streakNote: "Poco a poco — a little every day beats a lot once.",
    reactions: {
      correct: ["¡Eso es!", "¡Muy bien!", "¡Correcto!", "¡Olé!", "¡Perfecto!"],
      wrong: ["Casi.", "No pasa nada — otra vez.", "Tranquilo, mira bien.", "Casi lo tienes."],
      streak: ["¡Estás imparable!", "¡Qué crack!", "¡Sigue así!"],
    },
  },

  fr: {
    name: "Camille",
    role: "Your French guide",
    initial: "C",
    city: "Lyon",
    craft: "Runs a second-hand bookshop",
    accent: "#2b6cb0",
    voice: { rate: 0.88, pitch: 1.08 },
    signature: { text: "Allez, on commence", translit: "allez, on commence", en: "Right, let's begin" },
    intro: "Bonjour ! I'm Camille, from Lyon. I sell second-hand books, which means I've read the first ten pages of everything. I'll help you learn French that sounds natural — not stiff. On y va.",
    greetings: [
      "Bonjour ! Prêt à apprendre ?",
      "Allez, on continue. Encore un peu.",
      "Ah, te revoilà ! C'est bien.",
      "Today's words are waiting. On y va ?",
    ],
    celebrations: {
      perfect: "Parfait ! Aucune erreur. Bravo, vraiment.",
      great: "Très bien ! You're making real progress.",
      good: "Bon travail. Petit à petit — that's the way.",
      keep_going: "Pas de souci. On apprend en se trompant. Encore.",
    },
    streakNote: "Petit à petit — small steps, every day.",
    reactions: {
      correct: ["Voilà !", "Très bien !", "Exact !", "Parfait !", "Bravo !"],
      wrong: ["Presque.", "Pas grave — encore.", "Doucement, regarde.", "Tout près !"],
      streak: ["Tu es lancé !", "Quelle série !", "Continue comme ça !"],
    },
  },

  bn: {
    name: "Rumi",
    role: "Your Bengali guide",
    initial: "র",              // রুমি
    city: "Dhaka",
    craft: "Translates poetry, badly paid and happy",
    accent: "#0a8754",
    voice: { rate: 0.85, pitch: 0.98 },
    signature: { text: "চলো, শুরু করি", translit: "cholo, shuru kori", en: "Come, let's begin" },
    intro: "Nomoshkar! I'm Rumi, from Dhaka. I translate poetry, which pays badly and suits me perfectly. Bengali is a language of rhythm and warmth — I'll help you feel it, not just memorise it.",
    greetings: [
      "Nomoshkar! Ready to learn?",
      "Cholo, let's continue. Aro ektu.",
      "Bhalo — you're back! Let's go.",
      "Today's words are waiting for you.",
    ],
    celebrations: {
      perfect: "Darun! Ekdom perfect. Excellent work.",
      great: "Khub bhalo! You're really getting this.",
      good: "Bhalo kaj. Slowly but surely — keep going.",
      keep_going: "Kono byapar na. Mistakes teach us. Abar try koro.",
    },
    streakNote: "A little each day — that's how fluency grows.",
    reactions: {
      correct: ["Darun!", "Thik achhe!", "Bah!", "Ekdom thik.", "Shabash!"],
      wrong: ["Kono byapar na.", "Abar — sohoj.", "Kachhakachhi!", "Na, abar dekho."],
      streak: ["Darun cholchhe!", "Eki, daruun!", "Egiye jao!"],
    },
  },

  hi: {
    name: "Priya",
    role: "Your Hindi guide",
    initial: "प",              // प्रिया
    city: "Delhi",
    craft: "Produces a morning radio show",
    accent: "#e67e22",
    voice: { rate: 0.86, pitch: 1.06 },
    signature: { text: "चलिए, शुरू करें", translit: "chaliye, shuru karein", en: "Let's begin" },
    intro: "Namaste! I'm Priya, from Delhi. I produce a morning radio show, so I've heard every accent this city has. I'll help you learn Hindi the way it's really spoken — full of life. Chaliye shuru karein.",
    greetings: [
      "Namaste! Seekhne ke liye taiyaar?",
      "Chaliye, aage badhte hain.",
      "Accha — aap wapas aaye! Bahut accha.",
      "Aaj ke shabd aapka intezaar kar rahe hain.",
    ],
    celebrations: {
      perfect: "Shaandaar! Bilkul sahi. Bahut khoob.",
      great: "Bahut accha! You're improving fast.",
      good: "Accha kaam. Dheere dheere — keep going.",
      keep_going: "Koi baat nahi. Galtiyon se hi seekhte hain. Phir se.",
    },
    streakNote: "Thoda thoda roz — that's the real trick.",
    reactions: {
      correct: ["Shabaash!", "Sahi!", "Bilkul!", "Wah!", "Badhiya!"],
      wrong: ["Koi baat nahin.", "Phir se — aasaan hai.", "Lagbhag!", "Nahin, dekho phir."],
      streak: ["Kya baat hai!", "Aag laga di!", "Aise hi chalte raho!"],
    },
  },

  ar: {
    name: "Yusuf",
    role: "Your Arabic guide",
    initial: "ي",              // يوسف
    city: "Amman",
    craft: "Calligrapher and sign painter",
    accent: "#16826b",
    voice: { rate: 0.8, pitch: 0.94 },
    signature: { text: "يلا، نبدأ", translit: "yalla, nabda", en: "Come on, let's begin" },
    intro: "Ahlan! I'm Yusuf, from Amman. I'm a calligrapher — I paint shop signs and I'm particular about letters. Arabic is deep and it rewards patience. I'll take you through it step by step. Yalla.",
    greetings: [
      "Ahlan! Ready to learn?",
      "Yalla, let's continue.",
      "Ahlan wa sahlan — you're back!",
      "Today's words are waiting.",
    ],
    celebrations: {
      perfect: "Mumtaz! Perfect. Outstanding work.",
      great: "Jayyid jiddan! Really well done.",
      good: "Ahsant. Step by step — keep going.",
      keep_going: "Laa ba's. We learn from mistakes. Marra ukhra.",
    },
    streakNote: "Little by little — that's how mastery comes.",
    reactions: {
      correct: ["Ahsant!", "Mumtaz!", "Sah!", "Jameel!", "Tamam!"],
      wrong: ["La ba's.", "Marra ukhra — sahl.", "Qareeb!", "La, unzur thaniyatan."],
      streak: ["Mashallah!", "Mumtaz jiddan!", "Istamir!"],
    },
  },

  ko: {
    name: "Jisoo",
    role: "Your Korean guide",
    initial: "지",             // 지수
    city: "Seoul",
    craft: "Throws pots, mostly bowls",
    accent: "#7c3aed",
    voice: { rate: 0.85, pitch: 1.04 },
    signature: { text: "자, 시작해요", translit: "ja, sijakhaeyo", en: "Right, let's start" },
    intro: "Annyeonghaseyo! I'm Jisoo, from Seoul. I'm a potter — mostly bowls, endlessly. Korean has a rhythm and a politeness all its own, and I'll help you feel where it sits. Gajaa!",
    greetings: [
      "Annyeonghaseyo! Ready to learn?",
      "Gajaa, let's keep going.",
      "Oh, you're back! Joahyo.",
      "Today's words are waiting.",
    ],
    celebrations: {
      perfect: "Wanbyeok! Perfect. Jeongmal jalhaesseoyo.",
      great: "Jal haesseoyo! Really good progress.",
      good: "Joheun sidonieyo. Step by step — keep going.",
      keep_going: "Gwaenchanayo. Mistakes help us learn. Dasi.",
    },
    streakNote: "A little every day — kkujunhi (steadily).",
    reactions: {
      correct: ["Jal haesseoyo!", "Majayo!", "Joayo!", "Wanbyeok!", "Choego!"],
      wrong: ["Gwaenchanayo.", "Dasi — swiwoyo.", "Geoui!", "Aniyo, dasi bwayo."],
      streak: ["Daedanhaeyo!", "Bulkkot gatayo!", "Gyesokhaeyo!"],
    },
  },

  ja: {
    name: "Kenji",
    role: "Your Japanese guide",
    initial: "け",             // けんじ
    city: "Kyoto",
    craft: "Works in his family's tea house",
    accent: "#d6336c",
    voice: { rate: 0.82, pitch: 0.96 },
    signature: { text: "では、始めましょう", translit: "dewa, hajimemashou", en: "Well then, let's begin" },
    intro: "Konnichiwa! I'm Kenji, from Kyoto. I work in my family's tea house, where I've learned that doing one small thing carefully beats doing five things quickly. Japanese is the same. Ganbarimashou.",
    greetings: [
      "Konnichiwa! Ready to learn?",
      "Ganbarimashou — let's continue.",
      "Okaeri! You came back.",
      "Today's words are waiting.",
    ],
    celebrations: {
      perfect: "Kanpeki! Perfect. Subarashii desu.",
      great: "Yoku dekimashita! Great progress.",
      good: "Ii desu ne. Step by step — keep going.",
      keep_going: "Daijoubu. Mistakes are part of learning. Mou ichido.",
    },
    streakNote: "Sukoshi zutsu — a little at a time.",
    reactions: {
      correct: ["Sou desu!", "Ii desu ne!", "Seikai!", "Kanpeki!", "Yatta!"],
      wrong: ["Daijoubu.", "Mou ichido — kantan.", "Oshii!", "Chigau yo, mite."],
      streak: ["Sugoi!", "Choushi ii ne!", "Sono choushi!"],
    },
  },

  zh: {
    name: "Lin",
    role: "Your Mandarin guide",
    initial: "林",
    city: "Chengdu",
    craft: "Runs a tea shop, argues about tones",
    accent: "#c0392b",
    voice: { rate: 0.84, pitch: 1.02 },
    signature: { text: "好，我们开始", translit: "hǎo, wǒmen kāishǐ", en: "Good — let's begin" },
    intro: "Nǐ hǎo! I'm Lin, from Chengdu. I run a tea shop, and I will correct your tones whether or not you asked. They take patience — but I'll make them feel natural. Wǒmen kāishǐ ba!",
    greetings: [
      "Nǐ hǎo! Ready to learn?",
      "Wǒmen jìxù ba — let's continue.",
      "Huílái le! Good to see you.",
      "Today's words are waiting.",
    ],
    celebrations: {
      perfect: "Wánměi! Perfect. Zuò de hěn hǎo.",
      great: "Hěn hǎo! Real progress.",
      good: "Búcuò. Step by step — keep going.",
      keep_going: "Méi guānxi. We learn from mistakes. Zài shì yīcì.",
    },
    streakNote: "Yìdiǎn yìdiǎn — a little at a time.",
    reactions: {
      correct: ["Duì!", "Hěn hǎo!", "Zhèngquè!", "Wánměi!", "Tài hǎo le!"],
      wrong: ["Méi guānxi.", "Zài shì — hěn jiǎndān.", "Chà yīdiǎn!", "Bù duì, zài kàn."],
      streak: ["Tài lìhai le!", "Zhuàngtài hěn hǎo!", "Jìxù!"],
    },
  },

  // Turkish phrases verified against learner sources: Merhaba/Hoş geldin
  // (Preply, Lingopie), Hadi bakalım (Lingopie), Kolay gelsin (turkish.academy,
  // StoryLearning), Aferin (UChicago vocab), Çok güzel (Preply),
  // Tebrikler (talkpal), Afiyet olsun (StoryLearning).
  tr: {
    name: "Elif",
    role: "Your Turkish guide",
    initial: "E",
    city: "Istanbul",
    craft: "Sells books by the ferry terminal",
    accent: "#e30a17",
    voice: { rate: 0.88, pitch: 1.03 },
    signature: { text: "Hadi, başlıyoruz", translit: "hadi, başlıyoruz", en: "Come on, we're starting" },
    intro: "Merhaba! I'm Elif, from Istanbul — I sell books by the ferry terminal, so I read between customers. Turkish looks unusual until you spot its secret: it's one of the most logical languages on Earth. Hoş geldin. Çay is ready.",
    greetings: [
      "Merhaba! Hadi bakalım — let's get to it.",
      "Hoş geldin! Ready for a few more words?",
      "Kolay gelsin — may today's work come easy.",
      "Selam! Çay in hand? Let's go.",
    ],
    // v70: was `encouragement`, which crashed the result screen — every other
    // language calls this `celebrations` and that's what Lesson.jsx reads.
    celebrations: {
      perfect: "Aferin! Not a single mistake. Çok güzel.",
      great: "Çok iyi! You're really getting the rhythm of it.",
      good: "İyi! Suffix by suffix, it's sticking.",
      keep_going: "Sorun değil — mistakes are how vowel harmony becomes instinct. Tekrar.",
    },
    streakNote: "Damlaya damlaya göl olur — drop by drop, a lake forms.",
    reactions: {
      correct: ["Aferin!", "Çok güzel!", "Doğru!", "Harika!", "Tam olarak!"],
      wrong: ["Sorun değil.", "Tekrar dene!", "Az kaldı!", "Neredeyse!"],
      streak: ["Harikasın!", "Devam!", "Çok iyi gidiyorsun!"],
    },
  },

  // v70 — the three languages that had no guide at all. Punjabi, Indonesian and
  // Nigerian Pidgin were the app's most distinctive offerings and the only ones
  // where the learner was handed no one.
  pa: {
    name: "Nasreen",
    role: "Your Punjabi guide",
    initial: "ن",              // نسرین
    city: "Lahore",
    craft: "Sings at weddings, teaches by ear",
    accent: "#c98a12",
    voice: { rate: 0.84, pitch: 1.04 },
    signature: { text: "چلو، شروع کرو", translit: "chalo, shuru karo", en: "Come on, begin" },
    intro: "Sat sri akal, assalam-o-alaikum — both work with me. I'm Nasreen, from Lahore. I sing at weddings, so I teach by ear before I teach by page. Punjabi is loud, warm and direct. You'll like it.",
    greetings: [
      "Ki haal hai? Ready to learn?",
      "Chalo, aggey chaliye — let's keep going.",
      "Vadhiya — you came back!",
      "Aj de lafz tuhada intezaar kar rahe ne.",
    ],
    celebrations: {
      perfect: "Bohat vadhiya! Ikk vi galti nahi.",
      great: "Shabaash! Tusi changa kar rahe ho.",
      good: "Theek hai. Thora thora — keep going.",
      keep_going: "Koi gal nahi. Galtiyan naal hi sikhde haan. Fer koshish karo.",
    },
    streakNote: "Rozana thora — that's how it settles in.",
    reactions: {
      correct: ["Shabaash!", "Bilkul theek!", "Vadhiya!", "Haan ji!", "Bohat vadhiya!"],
      wrong: ["Koi gal nahi.", "Fer koshish karo.", "Nere si!", "Nahi, fer dekho."],
      streak: ["Kamaal kar ditta!", "Chalde raho!", "Bohat vadhiya ja rahe ho!"],
    },
  },

  id: {
    name: "Sari",
    role: "Your Indonesian guide",
    initial: "S",
    city: "Yogyakarta",
    craft: "Batik maker, patient by trade",
    accent: "#0f7b6c",
    voice: { rate: 0.9, pitch: 1.05 },
    signature: { text: "Ayo, kita mulai", translit: "ayo, kita mulai", en: "Come on, let's begin" },
    intro: "Halo! I'm Sari, from Yogyakarta. I make batik, which is mostly waiting for wax to cool — so I'm patient. Indonesian has no tenses and no cases. I promise it's kinder than you expect. Ayo.",
    greetings: [
      "Halo! Siap belajar?",
      "Ayo, kita lanjut — let's keep going.",
      "Wah, kamu kembali! Bagus.",
      "Kata-kata hari ini sudah menunggu.",
    ],
    celebrations: {
      perfect: "Sempurna! Tidak ada kesalahan. Hebat.",
      great: "Bagus sekali! You're moving quickly.",
      good: "Bagus. Sedikit-sedikit — keep going.",
      keep_going: "Tidak apa-apa. Salah itu bagian dari belajar. Coba lagi.",
    },
    streakNote: "Sedikit-sedikit, lama-lama menjadi bukit — little by little becomes a hill.",
    reactions: {
      correct: ["Benar!", "Bagus!", "Tepat sekali!", "Hebat!", "Iya, betul!"],
      wrong: ["Tidak apa-apa.", "Coba lagi — mudah.", "Hampir!", "Belum, lihat lagi."],
      streak: ["Luar biasa!", "Terus begitu!", "Kamu cepat sekali!"],
    },
  },

  pcm: {
    name: "Chidi",
    role: "Your Pidgin guide",
    initial: "C",
    city: "Lagos",
    craft: "Radio presenter, talks for a living",
    accent: "#0a8f4a",
    voice: { rate: 0.95, pitch: 1.0 },
    signature: { text: "Make we start", translit: "make we start", en: "Let's get started" },
    intro: "How far! I'm Chidi, from Lagos. I present radio, so talking is literally my job. Pidgin is a proper language with proper grammar — no be broken English. Make we start.",
    greetings: [
      "How far! You ready?",
      "Oya, make we continue.",
      "Ah, you come back! I like that.",
      "Today word dey wait for you.",
    ],
    celebrations: {
      perfect: "Correct! Not even one mistake. You sabi!",
      great: "You do well o! E dey enter.",
      good: "Nice one. Small small, e go stick.",
      keep_going: "No wahala. Mistake na how person learn. Try am again.",
    },
    streakNote: "Small small, water go fill bucket.",
    reactions: {
      correct: ["Correct!", "You sabi!", "Na so!", "Sharp!", "E correct!"],
      wrong: ["No wahala.", "Try am again.", "You near am!", "No be so — look again."],
      streak: ["You dey burst my head!", "Continue like this!", "You dey fly!"],
    },
  },
};

export function getCharacter(langCode) {
  return CHARACTERS[langCode] || null;
}

/** Pick a rotating greeting (stable within a day so it doesn't flicker). */
export function getGreeting(langCode) {
  const c = CHARACTERS[langCode];
  if (!c?.greetings?.length) return null;
  const dayIndex = Math.floor(Date.now() / 86400000) % c.greetings.length;
  return c.greetings[dayIndex];
}

/**
 * A celebration line for a result tier, or null. Never throws — this exists
 * because reading `character.celebrations[tier]` directly is what crashed the
 * Turkish result screen for four versions.
 */
export function getCelebration(langCode, tier) {
  const c = CHARACTERS[langCode];
  if (!c) return null;
  const table = c.celebrations || c.encouragement || null;
  if (!table) return null;
  return table[tier] || table.good || null;
}

/** A short in-lesson reaction. `kind` is "correct" | "wrong" | "streak". */
export function getReaction(langCode, kind) {
  const pool = CHARACTERS[langCode]?.reactions?.[kind];
  if (!pool?.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** TTS parameters for this guide's voice, with safe defaults. */
export function guideVoice(langCode) {
  const v = CHARACTERS[langCode]?.voice;
  // `code` rides along so tts.js can honour a per-language voice the learner
  // picked in Settings; without it every caller would have to remember to pass it.
  return { rate: v?.rate ?? 0.85, pitch: v?.pitch ?? 1, code: langCode };
}
