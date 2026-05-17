// =============================================================================
// CHARACTERS — one cultural guide per language. Adult, warm, authentic — NOT
// cartoon mascots. They give the app a rooted, human feel that a generic
// language app can't replicate. This is core to the "niche language expert"
// positioning.
//
// v15: NARRATOR role — greeting, milestone celebrations, encouragement, all
//      in culturally-specific voice.
// Structure is CONVERSATION-READY (the `lines` / `phrases` shape) so the
// scripted conversation-partner feature slots in next version with no rebuild.
// =============================================================================

export const CHARACTERS = {
  ur: {
    name: "Amina",
    role: "Your Urdu guide",
    emoji: "🧕🏽",
    accent: "#1e7a5a",
    // Short bio shown on first meeting
    intro: "Assalam-o-alaikum! I'm Amina, from Lahore. I'll help you learn Urdu the way we actually speak it at home — with warmth, and a little chai.",
    // Greeting variants (rotated) — shown on home screen
    greetings: [
      "Assalam-o-alaikum! Ready to learn?",
      "Aao, let's continue. Thora aur seekhte hain.",
      "Acha — back again! That's the spirit.",
      "Chalo, today's words are waiting.",
    ],
    // Milestone celebrations — culturally specific, warm, NOT generic "Awesome!"
    celebrations: {
      perfect: "Shabaash! Bilkul perfect. Your khala would be proud.",
      great: "Bahut khoob! You're really getting this.",
      good: "Acha kaam. Every word counts — keep going.",
      keep_going: "Koi baat nahi. Mistakes are how we learn. Phir se.",
    },
    streakNote: "Consistency, beta — that's the real secret.",
  },

  es: {
    name: "Diego",
    role: "Your Spanish guide",
    emoji: "🧔🏽‍♂️",
    accent: "#c0392b",
    intro: "¡Hola! Soy Diego, from Sevilla. I'll teach you Spanish that real people actually use — not textbook Spanish. Vamos.",
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
  },

  fr: {
    name: "Camille",
    role: "Your French guide",
    emoji: "👩🏼",
    accent: "#2b6cb0",
    intro: "Bonjour ! I'm Camille, from Lyon. I'll help you learn French that sounds natural — not stiff. On y va.",
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
  },

  bn: {
    name: "Rumi",
    role: "Your Bengali guide",
    emoji: "👨🏽",
    accent: "#0a8754",
    intro: "Nomoshkar! I'm Rumi, from Dhaka. Bengali is a language of poetry and warmth — I'll help you feel it, not just memorise it.",
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
  },

  hi: {
    name: "Priya",
    role: "Your Hindi guide",
    emoji: "👩🏽",
    accent: "#e67e22",
    intro: "Namaste! I'm Priya, from Delhi. I'll help you learn Hindi the way it's really spoken — full of life. Chaliye shuru karein.",
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
  },

  ar: {
    name: "Yusuf",
    role: "Your Arabic guide",
    emoji: "🧔🏽",
    accent: "#16826b",
    intro: "Ahlan! I'm Yusuf. Arabic is a deep, beautiful language — I'll guide you through it patiently, step by step. Yalla.",
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
  },

  ko: {
    name: "Jisoo",
    role: "Your Korean guide",
    emoji: "👩🏻",
    accent: "#7c3aed",
    intro: "Annyeonghaseyo! I'm Jisoo, from Seoul. Korean has a rhythm and politeness all its own — I'll help you feel it. Gajaa!",
    greetings: [
      "Annyeonghaseyo! Ready to learn?",
      "Gajaa, let's keep going.",
      "Oh, you're back! Joahyo.",
      "Today's words are waiting.",
    ],
    celebrations: {
      perfect: "Wanbyeok! Perfect. Jeongmal jalhaesseoyo.",
      great: "Jal haesseoyo! Really good progress.",
      good: "Joheun no력. Step by step — keep going.",
      keep_going: "Gwaenchanayo. Mistakes help us learn. Dasi.",
    },
    streakNote: "A little every day — kkujunhi (steadily).",
  },

  ja: {
    name: "Kenji",
    role: "Your Japanese guide",
    emoji: "👨🏻",
    accent: "#d6336c",
    intro: "Konnichiwa! I'm Kenji, from Kyoto. Japanese rewards patience and care — I'll guide you gently. Ganbarimashou.",
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
  },

  zh: {
    name: "Lin",
    role: "Your Mandarin guide",
    emoji: "👩🏻",
    accent: "#c0392b",
    intro: "Nǐ hǎo! I'm Lin, from Chengdu. Mandarin's tones take patience — but I'll make them feel natural. Wǒmen kāishǐ ba!",
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
  },
};

export function getCharacter(langCode) {
  return CHARACTERS[langCode] || null;
}

/** Pick a rotating greeting (stable within a day so it doesn't flicker). */
export function getGreeting(langCode) {
  const c = CHARACTERS[langCode];
  if (!c) return null;
  const dayIndex = Math.floor(Date.now() / 86400000) % c.greetings.length;
  return c.greetings[dayIndex];
}
