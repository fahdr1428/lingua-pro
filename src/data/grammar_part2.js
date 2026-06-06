// =============================================================================
// GRAMMAR CURRICULUM — Part 2: ar, zh, ja, ko, bn
// Same structure as part 1. These stay strictly on well-established beginner
// fundamentals; depth is deliberately conservative where precision matters.
// =============================================================================

export const GRAMMAR_PART2 = {
  // ===========================================================================
  // ARABIC — medium-high confidence (MSA fundamentals only)
  // ===========================================================================
  ar: [
    {
      id: "ar_g1",
      title: "The definite article: al-",
      emoji: "📌",
      concept:
        "Arabic has no 'a/an'. To say 'the', attach **الـ (al-)** to the front of the word. 'kitaab' = a book; 'al-kitaab' = the book. It's written joined to the noun.",
      examples: [
        { native: "كتاب", translit: "kitaab", gloss: "a book" },
        { native: "الكتاب", translit: "al-kitaab", gloss: "the book" },
        { native: "البيت", translit: "al-bayt", gloss: "the house" },
      ],
      checks: [
        {
          q: "How do you say 'the' in Arabic?",
          options: ["Attach al- to the word", "A separate word 'the'", "Change the ending", "You can't"],
          answer: "Attach al- to the word",
          explain: "al- prefixes the noun; there's no indefinite article at all.",
        },
      ],
    },
    {
      id: "ar_g2",
      title: "Sun & moon letters",
      emoji: "🌙",
      concept:
        "The 'l' of al- is sometimes silent. Before 'sun letters' (like s, sh, t, d, n, r) the l assimilates: al-shams is pronounced 'ash-shams' (the sun). Before 'moon letters' (like b, m, k, q) it stays: al-qamar = 'al-qamar' (the moon). Spelling keeps the ل; pronunciation changes.",
      examples: [
        { native: "الشمس", translit: "ash-shams", gloss: "the sun (sun letter — l assimilates)" },
        { native: "القمر", translit: "al-qamar", gloss: "the moon (moon letter — l stays)" },
        { native: "السلام", translit: "as-salaam", gloss: "the peace (s = sun letter)" },
      ],
      checks: [
        {
          q: "Why is 'al-salaam' said 'as-salaam'?",
          options: ["s is a sun letter (l assimilates)", "Spelling error", "It's plural", "Random"],
          answer: "s is a sun letter (l assimilates)",
          explain: "Sun letters absorb the l sound; the spelling still shows ل.",
        },
      ],
    },
    {
      id: "ar_g3",
      title: "Gender: masculine & feminine",
      emoji: "♀️",
      concept:
        "Arabic nouns are masculine or feminine. Feminine usually ends in ة (taa marbuta), an 'a' sound: 'mudarris' = male teacher, 'mudarrisa' = female teacher. Adjectives and verbs agree with the noun's gender.",
      examples: [
        { native: "طالب", translit: "taalib", gloss: "male student" },
        { native: "طالبة", translit: "taaliba", gloss: "female student (+a / ة)" },
        { native: "كبيرة", translit: "kabeera", gloss: "big (feminine form)" },
      ],
      checks: [
        {
          q: "What often marks a feminine noun?",
          options: ["Ending ة (-a sound)", "Ending with l", "A prefix", "Nothing"],
          answer: "Ending ة (-a sound)",
          explain: "taa marbuta (ة) is the common feminine ending.",
        },
      ],
    },
    {
      id: "ar_g4",
      title: "Pronoun endings",
      emoji: "🔗",
      concept:
        "Arabic attaches possession as a SUFFIX, not a separate word. 'kitaab' = book; 'kitaabi' = my book; 'kitaabuka' = your book; 'kitaabuhu' = his book. The ending carries 'my/your/his'.",
      examples: [
        { native: "كتابي", translit: "kitaabi", gloss: "my book (-i = my)" },
        { native: "بيتك", translit: "baytuka", gloss: "your house (-ka = your, m)" },
        { native: "اسمه", translit: "ismuhu", gloss: "his name (-hu = his)" },
      ],
      checks: [
        {
          q: "'kitaabi' means…",
          options: ["My book", "The book", "A book", "His book"],
          answer: "My book",
          explain: "The -i suffix means 'my'.",
        },
      ],
    },
    {
      id: "ar_g5",
      title: "Nominal sentences (no 'is')",
      emoji: "⚖️",
      concept:
        "In the present tense, Arabic often has NO verb for 'is/are'. 'al-bayt kabeer' literally = 'the-house big' = 'the house is big'. You just put the two parts together.",
      examples: [
        { native: "البيت كبير", translit: "al-bayt kabeer", gloss: "the house (is) big" },
        { native: "أنا طالب", translit: "ana taalib", gloss: "I (am a) student" },
        { native: "هو طبيب", translit: "huwa tabeeb", gloss: "he (is a) doctor" },
      ],
      checks: [
        {
          q: "'ana taalib' has no word for…",
          options: ["am (the verb 'to be')", "I", "student", "the"],
          answer: "am (the verb 'to be')",
          explain: "Present-tense 'is/am/are' is simply omitted.",
        },
      ],
    },
  ],

  // ===========================================================================
  // MANDARIN — medium-high confidence (well-documented basics)
  // ===========================================================================
  zh: [
    {
      id: "zh_g1",
      title: "No conjugation, ever",
      emoji: "🎉",
      concept:
        "Great news: Mandarin verbs NEVER change. No tenses, no endings, no agreement. 我吃 (wǒ chī) = I eat / I ate / I will eat — context or time words tell you when. The verb stays identical.",
      examples: [
        { native: "我吃", translit: "wǒ chī", gloss: "I eat" },
        { native: "他吃", translit: "tā chī", gloss: "he eats (verb unchanged)" },
        { native: "明天我吃", translit: "míngtiān wǒ chī", gloss: "tomorrow I eat (time word = future)" },
      ],
      checks: [
        {
          q: "How do Mandarin verbs change for tense?",
          options: ["They don't change at all", "Add -ed", "Change the tone", "Add a suffix"],
          answer: "They don't change at all",
          explain: "Time is shown by context/time words, not the verb.",
        },
      ],
    },
    {
      id: "zh_g2",
      title: "Word order: SVO",
      emoji: "🔤",
      concept:
        "Mandarin is Subject–Verb–Object, like English. 我爱你 = 'I love you', same order. This makes basic sentences feel familiar to English speakers.",
      examples: [
        { native: "我爱你", translit: "wǒ ài nǐ", gloss: "I love you" },
        { native: "他喝水", translit: "tā hē shuǐ", gloss: "he drinks water" },
        { native: "我们学中文", translit: "wǒmen xué zhōngwén", gloss: "we study Chinese" },
      ],
      checks: [
        {
          q: "Mandarin basic word order is…",
          options: ["Subject–Verb–Object (like English)", "Verb first", "Object first", "Free"],
          answer: "Subject–Verb–Object (like English)",
          explain: "wǒ ài nǐ = I love you — same order as English.",
        },
      ],
    },
    {
      id: "zh_g3",
      title: "Measure words",
      emoji: "🔢",
      concept:
        "To count things, Mandarin needs a 'measure word' between the number and the noun: number + measure word + noun. 个 (gè) is the general one. 一个人 = 'one (gè) person', 三本书 = 'three (běn) books' (书 uses 本).",
      examples: [
        { native: "一个人", translit: "yí gè rén", gloss: "one person (gè)" },
        { native: "三本书", translit: "sān běn shū", gloss: "three books (běn for books)" },
        { native: "两杯水", translit: "liǎng bēi shuǐ", gloss: "two cups of water (bēi)" },
      ],
      checks: [
        {
          q: "What goes between a number and a noun?",
          options: ["A measure word", "A verb", "Nothing", "An article"],
          answer: "A measure word",
          explain: "e.g. yí GÈ rén. 个 is the all-purpose default.",
        },
      ],
    },
    {
      id: "zh_g4",
      title: "Questions with 吗 (ma)",
      emoji: "❓",
      concept:
        "Turn any statement into a yes/no question by adding **吗 (ma)** at the end. 你好 (you good) → 你好吗？ (are you well?). Nothing else changes — no word reordering.",
      examples: [
        { native: "你好吗？", translit: "nǐ hǎo ma?", gloss: "are you well?" },
        { native: "你吃吗？", translit: "nǐ chī ma?", gloss: "do you eat / will you eat?" },
        { native: "他是老师吗？", translit: "tā shì lǎoshī ma?", gloss: "is he a teacher?" },
      ],
      checks: [
        {
          q: "How do you make a yes/no question?",
          options: ["Add 吗 (ma) at the end", "Reverse the words", "Change the tone", "Add 不"],
          answer: "Add 吗 (ma) at the end",
          explain: "Statement + 吗 = yes/no question. Effortless.",
        },
      ],
    },
    {
      id: "zh_g5",
      title: "Negation: 不 and 没",
      emoji: "🚫",
      concept:
        "Two negators. **不 (bù)** negates present/future/habitual: 我不吃 = 'I don't eat'. **没 (méi)** negates the past or 'have not': 我没吃 = 'I didn't eat / haven't eaten'. Both go before the verb.",
      examples: [
        { native: "我不喝", translit: "wǒ bù hē", gloss: "I don't drink" },
        { native: "我没去", translit: "wǒ méi qù", gloss: "I didn't go" },
        { native: "他不是老师", translit: "tā bú shì lǎoshī", gloss: "he is not a teacher" },
      ],
      checks: [
        {
          q: "Which negator for 'I didn't go'?",
          options: ["没 (méi) — past", "不 (bù) — present", "Either", "Neither"],
          answer: "没 (méi) — past",
          explain: "没 negates completed/past actions; 不 is present/future.",
        },
      ],
    },
  ],

  // ===========================================================================
  // JAPANESE — medium-high confidence (particle fundamentals)
  // ===========================================================================
  ja: [
    {
      id: "ja_g1",
      title: "Word order: verb LAST",
      emoji: "🔤",
      concept:
        "Japanese is Subject–Object–Verb. The verb ends the sentence. 'I sushi eat' is the Japanese order. Particles (small markers) show each word's role, so word order is flexible — but the verb stays last.",
      examples: [
        { native: "私は寿司を食べる", translit: "watashi wa sushi o taberu", gloss: "I (topic) sushi (obj) eat" },
        { native: "彼は水を飲む", translit: "kare wa mizu o nomu", gloss: "he water drinks" },
        { native: "犬がいる", translit: "inu ga iru", gloss: "(a) dog exists = there's a dog" },
      ],
      checks: [
        {
          q: "Where's the verb in a Japanese sentence?",
          options: ["At the end", "At the start", "After the subject", "Anywhere"],
          answer: "At the end",
          explain: "SOV — the verb always lands last.",
        },
      ],
    },
    {
      id: "ja_g2",
      title: "Particles は and を",
      emoji: "🏷️",
      concept:
        "Japanese marks a word's job with a particle AFTER it. **は (wa)** marks the topic ('as for X…'). **を (o)** marks the direct object (the thing the verb acts on). 'watashi WA sushi O taberu' = 'as-for-me, sushi I-eat'.",
      examples: [
        { native: "私は学生です", translit: "watashi wa gakusei desu", gloss: "I (topic) am a student" },
        { native: "水を飲む", translit: "mizu o nomu", gloss: "drink water (water = object)" },
        { native: "本を読む", translit: "hon o yomu", gloss: "read a book" },
      ],
      checks: [
        {
          q: "What does を (o) mark?",
          options: ["The direct object", "The topic", "The location", "The time"],
          answer: "The direct object",
          explain: "を tags the thing the verb acts on; は tags the topic.",
        },
      ],
    },
    {
      id: "ja_g3",
      title: "です (desu) — polite 'is'",
      emoji: "⚖️",
      concept:
        "**です (desu)** is a polite way to end a sentence, roughly 'is/am/are'. 'gakusei desu' = '(I) am a student'. It makes speech polite — essential when talking to people you don't know well.",
      examples: [
        { native: "学生です", translit: "gakusei desu", gloss: "(I) am a student" },
        { native: "これは水です", translit: "kore wa mizu desu", gloss: "this is water" },
        { native: "元気です", translit: "genki desu", gloss: "(I) am well" },
      ],
      checks: [
        {
          q: "Adding です (desu) makes a sentence…",
          options: ["Polite", "Past tense", "Negative", "A question"],
          answer: "Polite",
          explain: "desu is the polite sentence-ender, ~'is/am/are'.",
        },
      ],
    },
    {
      id: "ja_g4",
      title: "Questions with か (ka)",
      emoji: "❓",
      concept:
        "Add **か (ka)** to the end to make a question — like a spoken question mark. 'gakusei desu' → 'gakusei desu ka?' (are you a student?). No word reordering needed.",
      examples: [
        { native: "学生ですか？", translit: "gakusei desu ka?", gloss: "are (you) a student?" },
        { native: "元気ですか？", translit: "genki desu ka?", gloss: "are you well?" },
        { native: "水を飲みますか？", translit: "mizu o nomimasu ka?", gloss: "will you drink water?" },
      ],
      checks: [
        {
          q: "How do you ask a question?",
          options: ["Add か (ka) at the end", "Reverse word order", "Drop です", "Add は"],
          answer: "Add か (ka) at the end",
          explain: "か turns a statement into a question, no reordering.",
        },
      ],
    },
    {
      id: "ja_g5",
      title: "No articles, no plurals",
      emoji: "🎉",
      concept:
        "Japanese has no 'a/the' and usually no plural forms. 'hon' can mean 'book', 'a book', 'the book', or 'books' — context decides. One less thing to memorize.",
      examples: [
        { native: "本", translit: "hon", gloss: "book / a book / the book / books" },
        { native: "猫がいる", translit: "neko ga iru", gloss: "there is a cat / there are cats" },
        { native: "水", translit: "mizu", gloss: "water (no article needed)" },
      ],
      checks: [
        {
          q: "How does Japanese show plural?",
          options: ["Usually it doesn't — context tells", "Add -s", "Double the word", "A particle"],
          answer: "Usually it doesn't — context tells",
          explain: "No articles and generally no plural markers for basic nouns.",
        },
      ],
    },
  ],

  // ===========================================================================
  // KOREAN — medium confidence (well-established beginner core only)
  // ===========================================================================
  ko: [
    {
      id: "ko_g1",
      title: "Word order: verb LAST",
      emoji: "🔤",
      concept:
        "Korean is Subject–Object–Verb. The verb ends the sentence, like Japanese. 'I water drink' is the Korean order. Particles mark each word's role.",
      examples: [
        { native: "저는 물을 마셔요", translit: "jeoneun mureul masyeoyo", gloss: "I (topic) water (obj) drink" },
        { native: "그는 책을 읽어요", translit: "geuneun chaegeul ilgeoyo", gloss: "he book reads" },
        { native: "저는 학생이에요", translit: "jeoneun haksaeng-ieyo", gloss: "I am a student" },
      ],
      checks: [
        {
          q: "Where's the verb in Korean?",
          options: ["At the end", "At the start", "Middle", "Anywhere"],
          answer: "At the end",
          explain: "SOV — verb lands last.",
        },
      ],
    },
    {
      id: "ko_g2",
      title: "Topic & object particles",
      emoji: "🏷️",
      concept:
        "Korean adds a particle after a word to show its role. **은/는 (eun/neun)** marks the topic. **을/를 (eul/reul)** marks the object. (The choice within each pair depends on whether the word ends in a consonant or vowel.)",
      examples: [
        { native: "저는", translit: "jeoneun", gloss: "as-for-me (topic)" },
        { native: "물을", translit: "mureul", gloss: "water (object)" },
        { native: "책을 읽어요", translit: "chaegeul ilgeoyo", gloss: "read a book (book = object)" },
      ],
      checks: [
        {
          q: "은/는 marks the…",
          options: ["Topic", "Object", "Verb", "Location"],
          answer: "Topic",
          explain: "은/는 = topic marker; 을/를 = object marker.",
        },
      ],
    },
    {
      id: "ko_g3",
      title: "Politeness levels",
      emoji: "🙏",
      concept:
        "Korean speech changes by politeness. The **-요 (-yo)** ending is the everyday polite form — safe with most people. There's a more formal style and a casual style, but as a beginner, the -yo polite form covers nearly everything.",
      examples: [
        { native: "안녕하세요", translit: "annyeonghaseyo", gloss: "hello (polite)" },
        { native: "감사합니다", translit: "gamsahamnida", gloss: "thank you (formal polite)" },
        { native: "괜찮아요", translit: "gwaenchanayo", gloss: "it's okay (everyday polite -yo)" },
      ],
      checks: [
        {
          q: "The safe everyday politeness ending is…",
          options: ["-요 (-yo)", "-다 (-da)", "no ending", "-까"],
          answer: "-요 (-yo)",
          explain: "The -yo polite form works in most everyday situations.",
        },
      ],
    },
    {
      id: "ko_g4",
      title: "Questions: same words, rising tone",
      emoji: "❓",
      concept:
        "In the polite -yo style, a question often looks the SAME as the statement — you just raise your intonation (in writing, add ?). '괜찮아요' = 'it's okay' / '괜찮아요?' = 'is it okay?'.",
      examples: [
        { native: "괜찮아요?", translit: "gwaenchanayo?", gloss: "is it okay?" },
        { native: "학생이에요?", translit: "haksaeng-ieyo?", gloss: "are you a student?" },
        { native: "어디예요?", translit: "eodiyeyo?", gloss: "where is it?" },
      ],
      checks: [
        {
          q: "In polite -yo speech, a yes/no question…",
          options: ["Looks like the statement, rising tone", "Reorders all words", "Drops the verb", "Adds 은"],
          answer: "Looks like the statement, rising tone",
          explain: "Intonation (and ? in writing) carries the question.",
        },
      ],
    },
  ],

  // ===========================================================================
  // BENGALI — medium confidence (safe fundamentals; flagged for native review)
  // ===========================================================================
  bn: [
    {
      id: "bn_g1",
      title: "Word order: verb LAST",
      emoji: "🔤",
      concept:
        "Bengali is Subject–Object–Verb. The verb comes at the end. 'I rice eat' is the Bengali order for 'I eat rice'.",
      examples: [
        { native: "আমি ভাত খাই", translit: "ami bhat khai", gloss: "I rice eat = I eat rice" },
        { native: "সে বই পড়ে", translit: "she boi pore", gloss: "he book reads" },
        { native: "আমরা বাড়ি যাই", translit: "amra bari jai", gloss: "we home go" },
      ],
      checks: [
        {
          q: "Where's the Bengali verb?",
          options: ["At the end", "At the start", "Middle", "Free"],
          answer: "At the end",
          explain: "Subject–Object–Verb order.",
        },
      ],
    },
    {
      id: "bn_g2",
      title: "No grammatical gender",
      emoji: "🎉",
      concept:
        "Good news: Bengali has NO grammatical gender. Nouns aren't masculine or feminine, and verbs don't change for the speaker's gender — unlike Hindi/Urdu. One less system to track.",
      examples: [
        { native: "আমি খাই", translit: "ami khai", gloss: "I eat (same for any speaker)" },
        { native: "সে যায়", translit: "she jay", gloss: "he/she goes (no gender change)" },
        { native: "ভালো বই", translit: "bhalo boi", gloss: "good book (adjective doesn't gender-agree)" },
      ],
      checks: [
        {
          q: "Bengali verbs change for the speaker's gender?",
          options: ["No — there's no grammatical gender", "Yes, always", "Only in past", "Only formal"],
          answer: "No — there's no grammatical gender",
          explain: "Unlike Hindi/Urdu, gender doesn't affect the verb.",
        },
      ],
    },
    {
      id: "bn_g3",
      title: "Politeness: tumi, apni, tui",
      emoji: "🙏",
      concept:
        "Bengali has politeness levels for 'you'. **আপনি (apni)** = respectful (elders, strangers). **তুমি (tumi)** = familiar/equal (friends). **তুই (tui)** = very intimate (close friends, can be rude otherwise). Default to apni when unsure.",
      examples: [
        { native: "আপনি কেমন আছেন?", translit: "apni kemon achhen?", gloss: "how are you? (respectful)" },
        { native: "তুমি কেমন আছ?", translit: "tumi kemon achho?", gloss: "how are you? (familiar)" },
        { native: "আপনার নাম?", translit: "apnar naam?", gloss: "your name? (polite)" },
      ],
      checks: [
        {
          q: "Meeting an elder — which 'you'?",
          options: ["apni (respectful)", "tumi (familiar)", "tui (intimate)", "Any"],
          answer: "apni (respectful)",
          explain: "apni shows respect to elders and strangers.",
        },
      ],
    },
    {
      id: "bn_g4",
      title: "Postpositions",
      emoji: "📍",
      concept:
        "Like Hindi/Urdu, Bengali position words come AFTER the noun. 'in the house' = 'bari-te' (house-in). Common ones attach to the noun.",
      examples: [
        { native: "বাড়িতে", translit: "barite", gloss: "house-in = in the house" },
        { native: "স্কুলে", translit: "schoole", gloss: "school-at = at school" },
        { native: "টেবিলে", translit: "tebile", gloss: "table-on = on the table" },
      ],
      checks: [
        {
          q: "Bengali position words go…",
          options: ["After the noun", "Before the noun", "At sentence start", "At sentence end"],
          answer: "After the noun",
          explain: "Postpositions: 'barite' = house-in.",
        },
      ],
    },
  ],
};
