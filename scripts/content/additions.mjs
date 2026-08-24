// =============================================================================
// additions.mjs (v86) — new vocabulary, merged by scripts/merge-vocab.mjs.
//
// TWO GAPS, CHOSEN FROM THE DATA RATHER THAN FROM TASTE.
//
// Counted across all fourteen packs before writing any of this:
//   Feelings   30 words   — about two per language
//   Colors     35
//   Body       88
// against 343 verbs and 249 "Common". A learner could conjugate but not say
// they were tired.
//
// KINSHIP IS THE ONE THAT MATTERS MOST HERE, and it is the clearest case where
// this app should not do what the big apps do. Urdu had ten family words and
// not one of the four different uncles. Bengali had no grandparents at all.
//
// English flattens: one "uncle", one "aunt", one "grandmother". Urdu, Punjabi,
// Bengali, Hindi, Arabic, Chinese, Korean and Japanese do not — they mark which
// side of the family, and often birth order, and using the wrong one is not a
// small mistake, it is the kind that gets corrected at a dinner table. A course
// that teaches "uncle = چچا" has taught a learner to call their mother's
// brother by their father's brother's title.
//
// For someone learning the language their family speaks — which is who this app
// is for — these are among the first words they will actually need, because the
// people they want to talk to are relatives. Duolingo has no Tagalog, no
// Persian, and no distinction between your two grandmothers.
//
// ACCURACY. These are high-frequency everyday words, not prose: the risk is
// register and regional variation rather than outright error. Where a term
// varies by region or community I have used the most widely understood form and
// said so in `note`. The languages where a native speaker's eye is still worth
// having are listed in RESEARCH.md; nothing here changes that.
// =============================================================================

export const ADDITIONS = {
  // ---------------------------------------------------------------------------
  // URDU — kinship is precise and unavoidable in daily speech.
  // ---------------------------------------------------------------------------
  ur: [
    { unit: "u4", category: "Family", lemma: "چچا", translit: "chacha", translation: "uncle (father's younger brother)", difficulty: 2,
      note: "Urdu has four words where English has one. Which one you use says which side of the family, and often who is older.",
      examples: [{ native: "یہ میرے چچا ہیں", translit: "yeh mere chacha hain", translation: "This is my uncle (father's younger brother)" }] },
    { unit: "u4", category: "Family", lemma: "تایا", translit: "taya", translation: "uncle (father's elder brother)", difficulty: 2,
      examples: [{ native: "تایا جی گھر پر ہیں", translit: "taya ji ghar par hain", translation: "Uncle (father's elder brother) is at home" }] },
    { unit: "u4", category: "Family", lemma: "ماموں", translit: "mamu", translation: "uncle (mother's brother)", difficulty: 2,
      examples: [{ native: "میرے ماموں لاہور میں رہتے ہیں", translit: "mere mamu Lahore mein rehte hain", translation: "My uncle (mother's brother) lives in Lahore" }] },
    { unit: "u4", category: "Family", lemma: "خالہ", translit: "khala", translation: "aunt (mother's sister)", difficulty: 2,
      examples: [{ native: "خالہ نے کھانا بنایا", translit: "khala ne khana banaya", translation: "Aunt (mother's sister) made the food" }] },
    { unit: "u4", category: "Family", lemma: "پھوپھی", translit: "phuphi", translation: "aunt (father's sister)", difficulty: 2,
      examples: [{ native: "پھوپھی کل آئیں گی", translit: "phuphi kal aayengi", translation: "Aunt (father's sister) will come tomorrow" }] },
    { unit: "u4", category: "Family", lemma: "دادا", translit: "dada", translation: "grandfather (father's father)", difficulty: 1,
      examples: [{ native: "دادا بہت مہربان ہیں", translit: "dada bohot meherban hain", translation: "Grandfather is very kind" }] },
    { unit: "u4", category: "Family", lemma: "دادی", translit: "dadi", translation: "grandmother (father's mother)", difficulty: 1,
      examples: [{ native: "دادی کہانی سناتی ہیں", translit: "dadi kahani sunati hain", translation: "Grandmother tells stories" }] },
    { unit: "u4", category: "Family", lemma: "نانا", translit: "nana", translation: "grandfather (mother's father)", difficulty: 1,
      examples: [{ native: "نانا چائے پیتے ہیں", translit: "nana chai peete hain", translation: "Grandfather drinks tea" }] },
    { unit: "u4", category: "Family", lemma: "نانی", translit: "nani", translation: "grandmother (mother's mother)", difficulty: 1,
      examples: [{ native: "نانی کا گھر قریب ہے", translit: "nani ka ghar qareeb hai", translation: "Grandmother's house is nearby" }] },
    { unit: "u4", category: "Family", lemma: "کزن", translit: "cousin", translation: "cousin", difficulty: 2,
      note: "Borrowed from English and widely used. The precise terms exist but vary; this is what most people say.",
      examples: [{ native: "میرا کزن آیا ہے", translit: "mera cousin aaya hai", translation: "My cousin has come" }] },

    { unit: "u5", category: "Feelings", lemma: "تھکا ہوا", translit: "thaka hua", translation: "tired", difficulty: 2,
      examples: [{ native: "میں تھکا ہوا ہوں", translit: "main thaka hua hoon", translation: "I am tired" }] },
    { unit: "u5", category: "Feelings", lemma: "بھوکا", translit: "bhooka", translation: "hungry", difficulty: 2,
      examples: [{ native: "مجھے بھوک لگی ہے", translit: "mujhe bhook lagi hai", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "پیاسا", translit: "pyaasa", translation: "thirsty", difficulty: 2,
      examples: [{ native: "کیا تم پیاسے ہو؟", translit: "kya tum pyaase ho?", translation: "Are you thirsty?" }] },
    { unit: "u5", category: "Feelings", lemma: "خوش", translit: "khush", translation: "happy", difficulty: 1,
      examples: [{ native: "میں بہت خوش ہوں", translit: "main bohot khush hoon", translation: "I am very happy" }] },
    { unit: "u5", category: "Feelings", lemma: "اداس", translit: "udaas", translation: "sad", difficulty: 2,
      examples: [{ native: "وہ آج اداس ہے", translit: "woh aaj udaas hai", translation: "She is sad today" }] },
    { unit: "u5", category: "Feelings", lemma: "بیمار", translit: "beemar", translation: "ill, unwell", difficulty: 2,
      examples: [{ native: "میری ماں بیمار ہیں", translit: "meri maan beemar hain", translation: "My mother is unwell" }] },
    { unit: "u5", category: "Feelings", lemma: "پریشان", translit: "pareshan", translation: "worried", difficulty: 2,
      examples: [{ native: "پریشان مت ہو", translit: "pareshan mat ho", translation: "Don't worry" }] },
  ],

  // ---------------------------------------------------------------------------
  // PUNJABI (Shahmukhi) — same kinship system, different words.
  // ---------------------------------------------------------------------------
  pa: [
    { unit: "u3", category: "Family", lemma: "چاچا", translit: "chacha", translation: "uncle (father's younger brother)", difficulty: 2,
      examples: [{ native: "میرا چاچا آیا اے", translit: "mera chacha aaya ae", translation: "My uncle (father's younger brother) has come" }] },
    { unit: "u3", category: "Family", lemma: "تایا", translit: "taya", translation: "uncle (father's elder brother)", difficulty: 2,
      examples: [{ native: "تایا جی کتھے نیں؟", translit: "taya ji kithe nen?", translation: "Where is uncle (father's elder brother)?" }] },
    { unit: "u3", category: "Family", lemma: "ماما", translit: "mama", translation: "uncle (mother's brother)", difficulty: 2,
      examples: [{ native: "ماما جی چنگے نیں", translit: "mama ji change nen", translation: "Uncle (mother's brother) is well" }] },
    { unit: "u3", category: "Family", lemma: "ماسی", translit: "masi", translation: "aunt (mother's sister)", difficulty: 2,
      examples: [{ native: "ماسی نے روٹی بنائی", translit: "masi ne roti banai", translation: "Aunt (mother's sister) made bread" }] },
    { unit: "u3", category: "Family", lemma: "پھپھی", translit: "phuphi", translation: "aunt (father's sister)", difficulty: 2,
      examples: [{ native: "پھپھی گھر آئی اے", translit: "phuphi ghar aayi ae", translation: "Aunt (father's sister) has come home" }] },
    { unit: "u3", category: "Family", lemma: "دادا", translit: "dada", translation: "grandfather (father's father)", difficulty: 1,
      examples: [{ native: "دادا جی بیٹھے نیں", translit: "dada ji baithe nen", translation: "Grandfather is sitting" }] },
    { unit: "u3", category: "Family", lemma: "دادی", translit: "dadi", translation: "grandmother (father's mother)", difficulty: 1,
      examples: [{ native: "دادی جی چاء پیندے نیں", translit: "dadi ji cha peende nen", translation: "Grandmother drinks tea" }] },
    { unit: "u3", category: "Family", lemma: "نانا", translit: "nana", translation: "grandfather (mother's father)", difficulty: 1,
      examples: [{ native: "نانا جی پنڈ رہندے نیں", translit: "nana ji pind rehnde nen", translation: "Grandfather lives in the village" }] },
    { unit: "u3", category: "Family", lemma: "نانی", translit: "nani", translation: "grandmother (mother's mother)", difficulty: 1,
      examples: [{ native: "نانی جی بہت پیار کردے نیں", translit: "nani ji bohat pyar karde nen", translation: "Grandmother loves very much" }] },

    { unit: "u4", category: "Feelings", lemma: "تھکیا", translit: "thakya", translation: "tired", difficulty: 2,
      examples: [{ native: "میں تھکیا ہویا آں", translit: "main thakya hoya aan", translation: "I am tired" }] },
    { unit: "u4", category: "Feelings", lemma: "بھکھا", translit: "bhukha", translation: "hungry", difficulty: 2,
      examples: [{ native: "مینوں بھکھ لگی اے", translit: "mainu bhukh lagi ae", translation: "I am hungry" }] },
    { unit: "u4", category: "Feelings", lemma: "خوش", translit: "khush", translation: "happy", difficulty: 1,
      examples: [{ native: "اسیں بہت خوش آں", translit: "asin bohat khush aan", translation: "We are very happy" }] },
    { unit: "u4", category: "Feelings", lemma: "اداس", translit: "udaas", translation: "sad", difficulty: 2,
      examples: [{ native: "او اداس اے", translit: "oh udaas ae", translation: "He is sad" }] },
    { unit: "u4", category: "Feelings", lemma: "بیمار", translit: "beemar", translation: "ill, unwell", difficulty: 2,
      examples: [{ native: "میں بیمار آں", translit: "main beemar aan", translation: "I am unwell" }] },
  ],

  // ---------------------------------------------------------------------------
  // HINDI
  // ---------------------------------------------------------------------------
  hi: [
    { unit: "u4", category: "Family", lemma: "चाचा", translit: "chacha", translation: "uncle (father's younger brother)", difficulty: 2,
      examples: [{ native: "मेरे चाचा दिल्ली में रहते हैं", translit: "mere chacha Dilli mein rehte hain", translation: "My uncle (father's younger brother) lives in Delhi" }] },
    { unit: "u4", category: "Family", lemma: "ताऊ", translit: "tau", translation: "uncle (father's elder brother)", difficulty: 2,
      examples: [{ native: "ताऊ जी घर पर हैं", translit: "tau ji ghar par hain", translation: "Uncle (father's elder brother) is at home" }] },
    { unit: "u4", category: "Family", lemma: "मामा", translit: "mama", translation: "uncle (mother's brother)", difficulty: 2,
      examples: [{ native: "मामा जी आ रहे हैं", translit: "mama ji aa rahe hain", translation: "Uncle (mother's brother) is coming" }] },
    { unit: "u4", category: "Family", lemma: "मौसी", translit: "mausi", translation: "aunt (mother's sister)", difficulty: 2,
      examples: [{ native: "मौसी ने खाना बनाया", translit: "mausi ne khana banaya", translation: "Aunt (mother's sister) made the food" }] },
    { unit: "u4", category: "Family", lemma: "बुआ", translit: "bua", translation: "aunt (father's sister)", difficulty: 2,
      examples: [{ native: "बुआ कल आएँगी", translit: "bua kal aayengi", translation: "Aunt (father's sister) will come tomorrow" }] },
    { unit: "u4", category: "Family", lemma: "दादा", translit: "dada", translation: "grandfather (father's father)", difficulty: 1,
      examples: [{ native: "दादा जी अख़बार पढ़ते हैं", translit: "dada ji akhbaar padhte hain", translation: "Grandfather reads the newspaper" }] },
    { unit: "u4", category: "Family", lemma: "दादी", translit: "dadi", translation: "grandmother (father's mother)", difficulty: 1,
      examples: [{ native: "दादी कहानी सुनाती हैं", translit: "dadi kahani sunati hain", translation: "Grandmother tells stories" }] },
    { unit: "u4", category: "Family", lemma: "नाना", translit: "nana", translation: "grandfather (mother's father)", difficulty: 1,
      examples: [{ native: "नाना जी बग़ीचे में हैं", translit: "nana ji bagiche mein hain", translation: "Grandfather is in the garden" }] },
    { unit: "u4", category: "Family", lemma: "नानी", translit: "nani", translation: "grandmother (mother's mother)", difficulty: 1,
      examples: [{ native: "नानी का घर पास है", translit: "nani ka ghar paas hai", translation: "Grandmother's house is nearby" }] },

    { unit: "u5", category: "Feelings", lemma: "थका हुआ", translit: "thaka hua", translation: "tired", difficulty: 2,
      examples: [{ native: "मैं थका हुआ हूँ", translit: "main thaka hua hoon", translation: "I am tired" }] },
    { unit: "u5", category: "Feelings", lemma: "भूखा", translit: "bhookha", translation: "hungry", difficulty: 2,
      examples: [{ native: "मुझे भूख लगी है", translit: "mujhe bhookh lagi hai", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "प्यासा", translit: "pyaasa", translation: "thirsty", difficulty: 2,
      examples: [{ native: "क्या तुम प्यासे हो?", translit: "kya tum pyaase ho?", translation: "Are you thirsty?" }] },
    { unit: "u5", category: "Feelings", lemma: "ख़ुश", translit: "khush", translation: "happy", difficulty: 1,
      examples: [{ native: "मैं बहुत ख़ुश हूँ", translit: "main bahut khush hoon", translation: "I am very happy" }] },
    { unit: "u5", category: "Feelings", lemma: "उदास", translit: "udaas", translation: "sad", difficulty: 2,
      examples: [{ native: "वह आज उदास है", translit: "vah aaj udaas hai", translation: "She is sad today" }] },
    { unit: "u5", category: "Feelings", lemma: "बीमार", translit: "beemar", translation: "ill, unwell", difficulty: 2,
      examples: [{ native: "मेरी माँ बीमार हैं", translit: "meri maa beemar hain", translation: "My mother is unwell" }] },
  ],

  // ---------------------------------------------------------------------------
  // BENGALI — had no grandparents at all.
  // ---------------------------------------------------------------------------
  bn: [
    { unit: "u3", category: "Family", lemma: "দাদু", translit: "dadu", translation: "grandfather", difficulty: 1,
      note: "Widely used for a grandfather on either side in everyday speech; the formal terms distinguish them.",
      examples: [{ native: "দাদু চা খাচ্ছেন", translit: "dadu cha khacchen", translation: "Grandfather is drinking tea" }] },
    { unit: "u3", category: "Family", lemma: "ঠাকুরমা", translit: "thakurma", translation: "grandmother (father's mother)", difficulty: 2,
      examples: [{ native: "ঠাকুরমা গল্প বলেন", translit: "thakurma golpo bolen", translation: "Grandmother tells stories" }] },
    { unit: "u3", category: "Family", lemma: "নানি", translit: "nani", translation: "grandmother (mother's mother)", difficulty: 2,
      examples: [{ native: "নানির বাড়ি কাছে", translit: "nanir bari kachhe", translation: "Grandmother's house is near" }] },
    { unit: "u3", category: "Family", lemma: "চাচা", translit: "chacha", translation: "uncle (father's brother)", difficulty: 2,
      examples: [{ native: "চাচা বাড়িতে আছেন", translit: "chacha barite achhen", translation: "Uncle is at home" }] },
    { unit: "u3", category: "Family", lemma: "মামা", translit: "mama", translation: "uncle (mother's brother)", difficulty: 2,
      examples: [{ native: "মামা ঢাকায় থাকেন", translit: "mama Dhakay thaken", translation: "Uncle (mother's brother) lives in Dhaka" }] },
    { unit: "u3", category: "Family", lemma: "খালা", translit: "khala", translation: "aunt (mother's sister)", difficulty: 2,
      examples: [{ native: "খালা রান্না করছেন", translit: "khala ranna korchhen", translation: "Aunt (mother's sister) is cooking" }] },
    { unit: "u3", category: "Family", lemma: "ফুফু", translit: "phuphu", translation: "aunt (father's sister)", difficulty: 2,
      examples: [{ native: "ফুফু কাল আসবেন", translit: "phuphu kal ashben", translation: "Aunt (father's sister) will come tomorrow" }] },

    { unit: "u4", category: "Feelings", lemma: "ক্লান্ত", translit: "klanto", translation: "tired", difficulty: 2,
      examples: [{ native: "আমি ক্লান্ত", translit: "ami klanto", translation: "I am tired" }] },
    { unit: "u4", category: "Feelings", lemma: "ক্ষুধার্ত", translit: "khudharto", translation: "hungry", difficulty: 2,
      examples: [{ native: "আমি ক্ষুধার্ত", translit: "ami khudharto", translation: "I am hungry" }] },
    { unit: "u4", category: "Feelings", lemma: "খুশি", translit: "khushi", translation: "happy", difficulty: 1,
      examples: [{ native: "আমি খুব খুশি", translit: "ami khub khushi", translation: "I am very happy" }] },
    { unit: "u4", category: "Feelings", lemma: "দুঃখিত", translit: "dukkhito", translation: "sad, sorry", difficulty: 2,
      examples: [{ native: "আমি দুঃখিত", translit: "ami dukkhito", translation: "I am sorry" }] },
    { unit: "u4", category: "Feelings", lemma: "অসুস্থ", translit: "osustho", translation: "ill, unwell", difficulty: 2,
      examples: [{ native: "সে অসুস্থ", translit: "she osustho", translation: "He is unwell" }] },
  ],

  // ---------------------------------------------------------------------------
  // ARABIC (MSA) — paternal/maternal split is exact.
  // ---------------------------------------------------------------------------
  ar: [
    { unit: "u4", category: "Family", lemma: "عَمّ", translit: "'amm", translation: "uncle (father's brother)", difficulty: 2,
      examples: [{ native: "هٰذا عَمّي", translit: "hadha 'ammi", translation: "This is my uncle (father's brother)" }] },
    { unit: "u4", category: "Family", lemma: "خال", translit: "khaal", translation: "uncle (mother's brother)", difficulty: 2,
      examples: [{ native: "خالي يَسكُن هُنا", translit: "khaali yaskun huna", translation: "My uncle (mother's brother) lives here" }] },
    { unit: "u4", category: "Family", lemma: "عَمّة", translit: "'amma", translation: "aunt (father's sister)", difficulty: 2,
      examples: [{ native: "عَمّتي طَبّاخة", translit: "'ammati tabbakha", translation: "My aunt (father's sister) is a cook" }] },
    { unit: "u4", category: "Family", lemma: "خالة", translit: "khaala", translation: "aunt (mother's sister)", difficulty: 2,
      examples: [{ native: "خالَتي في البَيت", translit: "khaalati fi al-bayt", translation: "My aunt (mother's sister) is at home" }] },
    { unit: "u4", category: "Family", lemma: "جَدّ", translit: "jadd", translation: "grandfather", difficulty: 1,
      examples: [{ native: "جَدّي كَبير", translit: "jaddi kabeer", translation: "My grandfather is old" }] },
    { unit: "u4", category: "Family", lemma: "جَدّة", translit: "jadda", translation: "grandmother", difficulty: 1,
      examples: [{ native: "جَدَّتي طَيِّبة", translit: "jaddati tayyiba", translation: "My grandmother is kind" }] },

    { unit: "u5", category: "Feelings", lemma: "تَعبان", translit: "ta'baan", translation: "tired", difficulty: 2,
      examples: [{ native: "أَنا تَعبان", translit: "ana ta'baan", translation: "I am tired" }] },
    { unit: "u5", category: "Feelings", lemma: "جَوعان", translit: "jaw'aan", translation: "hungry", difficulty: 2,
      examples: [{ native: "أَنا جَوعان", translit: "ana jaw'aan", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "عَطشان", translit: "'atshaan", translation: "thirsty", difficulty: 2,
      examples: [{ native: "هَل أَنتَ عَطشان؟", translit: "hal anta 'atshaan?", translation: "Are you thirsty?" }] },
    { unit: "u5", category: "Feelings", lemma: "سَعيد", translit: "sa'eed", translation: "happy", difficulty: 1,
      examples: [{ native: "أَنا سَعيد جِدًّا", translit: "ana sa'eed jiddan", translation: "I am very happy" }] },
    { unit: "u5", category: "Feelings", lemma: "حَزين", translit: "hazeen", translation: "sad", difficulty: 2,
      examples: [{ native: "هُوَ حَزين اليَوم", translit: "huwa hazeen al-yawm", translation: "He is sad today" }] },
    { unit: "u5", category: "Feelings", lemma: "مَريض", translit: "mareed", translation: "ill, unwell", difficulty: 2,
      examples: [{ native: "أُمّي مَريضة", translit: "ummi mareeda", translation: "My mother is unwell" }] },
  ],
  // ---------------------------------------------------------------------------
  // MANDARIN — the most elaborate kinship system of the fourteen, and the one
  // most flattened elsewhere. Which grandmother you mean is not optional.
  // ---------------------------------------------------------------------------
  zh: [
    { unit: "u4", category: "Family", lemma: "爷爷", translit: "yéye", translation: "grandfather (father's father)", difficulty: 2,
      note: "Chinese marks which side of the family every relative is on. There is no neutral word for 'grandfather'.",
      examples: [{ native: "我爷爷很高", translit: "wǒ yéye hěn gāo", translation: "My grandfather is tall" }] },
    { unit: "u4", category: "Family", lemma: "奶奶", translit: "nǎinai", translation: "grandmother (father's mother)", difficulty: 2,
      examples: [{ native: "奶奶做饭", translit: "nǎinai zuò fàn", translation: "Grandmother cooks" }] },
    { unit: "u4", category: "Family", lemma: "外公", translit: "wàigōng", translation: "grandfather (mother's father)", difficulty: 2,
      examples: [{ native: "外公喝茶", translit: "wàigōng hē chá", translation: "Grandfather drinks tea" }] },
    { unit: "u4", category: "Family", lemma: "外婆", translit: "wàipó", translation: "grandmother (mother's mother)", difficulty: 2,
      examples: [{ native: "外婆家很近", translit: "wàipó jiā hěn jìn", translation: "Grandmother's house is close" }] },
    { unit: "u4", category: "Family", lemma: "叔叔", translit: "shūshu", translation: "uncle (father's younger brother)", difficulty: 2,
      examples: [{ native: "叔叔在北京", translit: "shūshu zài Běijīng", translation: "Uncle is in Beijing" }] },
    { unit: "u4", category: "Family", lemma: "舅舅", translit: "jiùjiu", translation: "uncle (mother's brother)", difficulty: 2,
      examples: [{ native: "舅舅是老师", translit: "jiùjiu shì lǎoshī", translation: "Uncle is a teacher" }] },
    { unit: "u4", category: "Family", lemma: "姑姑", translit: "gūgu", translation: "aunt (father's sister)", difficulty: 2,
      examples: [{ native: "姑姑来了", translit: "gūgu lái le", translation: "Aunt has come" }] },
    { unit: "u4", category: "Family", lemma: "阿姨", translit: "āyí", translation: "aunt (mother's sister)", difficulty: 2,
      examples: [{ native: "阿姨很好", translit: "āyí hěn hǎo", translation: "Aunt is very nice" }] },

    { unit: "u5", category: "Feelings", lemma: "累", translit: "lèi", translation: "tired", difficulty: 1,
      examples: [{ native: "我很累", translit: "wǒ hěn lèi", translation: "I am tired" }] },
    { unit: "u5", category: "Feelings", lemma: "饿", translit: "è", translation: "hungry", difficulty: 1,
      examples: [{ native: "我饿了", translit: "wǒ è le", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "渴", translit: "kě", translation: "thirsty", difficulty: 1,
      examples: [{ native: "你渴吗？", translit: "nǐ kě ma?", translation: "Are you thirsty?" }] },
    { unit: "u5", category: "Feelings", lemma: "高兴", translit: "gāoxìng", translation: "happy", difficulty: 1,
      examples: [{ native: "我很高兴", translit: "wǒ hěn gāoxìng", translation: "I am happy" }] },
    { unit: "u5", category: "Feelings", lemma: "难过", translit: "nánguò", translation: "sad", difficulty: 2,
      examples: [{ native: "他很难过", translit: "tā hěn nánguò", translation: "He is sad" }] },
    { unit: "u5", category: "Feelings", lemma: "生病", translit: "shēngbìng", translation: "to be ill", difficulty: 2,
      examples: [{ native: "妈妈生病了", translit: "māma shēngbìng le", translation: "Mum is ill" }] },
  ],

  // ---------------------------------------------------------------------------
  // KOREAN — sibling terms depend on the SPEAKER's gender, which is the thing
  // learners get wrong for years.
  // ---------------------------------------------------------------------------
  ko: [
    { unit: "u4", category: "Family", lemma: "오빠", translit: "oppa", translation: "older brother (said by a woman)", difficulty: 2,
      note: "Korean picks the sibling word by who is SPEAKING, not only by who is being spoken about. A man says 형 for the same brother.",
      examples: [{ native: "우리 오빠예요", translit: "uri oppa-yeyo", translation: "This is my older brother" }] },
    { unit: "u4", category: "Family", lemma: "형", translit: "hyeong", translation: "older brother (said by a man)", difficulty: 2,
      examples: [{ native: "형이 왔어요", translit: "hyeong-i wass-eoyo", translation: "My older brother has come" }] },
    { unit: "u4", category: "Family", lemma: "언니", translit: "eonni", translation: "older sister (said by a woman)", difficulty: 2,
      examples: [{ native: "언니는 학생이에요", translit: "eonni-neun haksaeng-ieyo", translation: "My older sister is a student" }] },
    { unit: "u4", category: "Family", lemma: "누나", translit: "nuna", translation: "older sister (said by a man)", difficulty: 2,
      examples: [{ native: "누나가 요리해요", translit: "nuna-ga yorihaeyo", translation: "My older sister cooks" }] },
    { unit: "u4", category: "Family", lemma: "할아버지", translit: "harabeoji", translation: "grandfather", difficulty: 1,
      examples: [{ native: "할아버지는 신문을 읽어요", translit: "harabeoji-neun sinmun-eul ilg-eoyo", translation: "Grandfather reads the newspaper" }] },
    { unit: "u4", category: "Family", lemma: "할머니", translit: "halmeoni", translation: "grandmother", difficulty: 1,
      examples: [{ native: "할머니 집에 가요", translit: "halmeoni jib-e gayo", translation: "I am going to grandmother's house" }] },
    { unit: "u4", category: "Family", lemma: "이모", translit: "imo", translation: "aunt (mother's sister)", difficulty: 2,
      examples: [{ native: "이모가 오셨어요", translit: "imo-ga osyeoss-eoyo", translation: "Aunt has come" }] },
    { unit: "u4", category: "Family", lemma: "고모", translit: "gomo", translation: "aunt (father's sister)", difficulty: 2,
      examples: [{ native: "고모는 부산에 살아요", translit: "gomo-neun Busan-e sarayo", translation: "Aunt lives in Busan" }] },

    { unit: "u5", category: "Feelings", lemma: "피곤해요", translit: "pigonhaeyo", translation: "tired", difficulty: 2,
      examples: [{ native: "오늘 피곤해요", translit: "oneul pigonhaeyo", translation: "I am tired today" }] },
    { unit: "u5", category: "Feelings", lemma: "배고파요", translit: "baegopayo", translation: "hungry", difficulty: 2,
      examples: [{ native: "저는 배고파요", translit: "jeo-neun baegopayo", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "행복해요", translit: "haengbokhaeyo", translation: "happy", difficulty: 2,
      examples: [{ native: "정말 행복해요", translit: "jeongmal haengbokhaeyo", translation: "I am really happy" }] },
    { unit: "u5", category: "Feelings", lemma: "슬퍼요", translit: "seulpeoyo", translation: "sad", difficulty: 2,
      examples: [{ native: "조금 슬퍼요", translit: "jogeum seulpeoyo", translation: "I am a little sad" }] },
    { unit: "u5", category: "Feelings", lemma: "아파요", translit: "apayo", translation: "it hurts, I am ill", difficulty: 2,
      examples: [{ native: "머리가 아파요", translit: "meori-ga apayo", translation: "My head hurts" }] },
  ],

  // ---------------------------------------------------------------------------
  // JAPANESE — uchi/soto: your own family and someone else's take different
  // words. Using the polite form for your own mother sounds wrong.
  // ---------------------------------------------------------------------------
  ja: [
    { unit: "u4", category: "Family", lemma: "お母さん", translit: "okāsan", translation: "mother (someone else's, or addressing your own)", difficulty: 2,
      note: "Japanese splits family words in two: 母 when you mention your own mother to an outsider, お母さん when you address her or mean someone else's.",
      examples: [{ native: "お母さんは元気ですか", translit: "okāsan wa genki desu ka", translation: "How is your mother?" }] },
    { unit: "u4", category: "Family", lemma: "母", translit: "haha", translation: "my mother (speaking to others)", difficulty: 2,
      examples: [{ native: "母は先生です", translit: "haha wa sensei desu", translation: "My mother is a teacher" }] },
    { unit: "u4", category: "Family", lemma: "お父さん", translit: "otōsan", translation: "father (someone else's, or addressing your own)", difficulty: 2,
      examples: [{ native: "お父さんはどこですか", translit: "otōsan wa doko desu ka", translation: "Where is your father?" }] },
    { unit: "u4", category: "Family", lemma: "父", translit: "chichi", translation: "my father (speaking to others)", difficulty: 2,
      examples: [{ native: "父は東京にいます", translit: "chichi wa Tōkyō ni imasu", translation: "My father is in Tokyo" }] },
    { unit: "u4", category: "Family", lemma: "おじいさん", translit: "ojīsan", translation: "grandfather", difficulty: 2,
      examples: [{ native: "おじいさんはお茶を飲みます", translit: "ojīsan wa ocha o nomimasu", translation: "Grandfather drinks tea" }] },
    { unit: "u4", category: "Family", lemma: "おばあさん", translit: "obāsan", translation: "grandmother", difficulty: 2,
      examples: [{ native: "おばあさんは優しいです", translit: "obāsan wa yasashii desu", translation: "Grandmother is kind" }] },

    { unit: "u5", category: "Feelings", lemma: "疲れた", translit: "tsukareta", translation: "tired", difficulty: 2,
      examples: [{ native: "今日は疲れた", translit: "kyō wa tsukareta", translation: "I am tired today" }] },
    { unit: "u5", category: "Feelings", lemma: "お腹がすいた", translit: "onaka ga suita", translation: "hungry", difficulty: 2,
      examples: [{ native: "お腹がすきました", translit: "onaka ga sukimashita", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "嬉しい", translit: "ureshii", translation: "happy, glad", difficulty: 2,
      examples: [{ native: "とても嬉しいです", translit: "totemo ureshii desu", translation: "I am very glad" }] },
    { unit: "u5", category: "Feelings", lemma: "悲しい", translit: "kanashii", translation: "sad", difficulty: 2,
      examples: [{ native: "少し悲しいです", translit: "sukoshi kanashii desu", translation: "I am a little sad" }] },
    { unit: "u5", category: "Feelings", lemma: "痛い", translit: "itai", translation: "it hurts, painful", difficulty: 1,
      examples: [{ native: "頭が痛いです", translit: "atama ga itai desu", translation: "My head hurts" }] },
  ],

  // ---------------------------------------------------------------------------
  // SPANISH / FRENCH / GERMAN / TURKISH / INDONESIAN / NIGERIAN PIDGIN
  // Feelings, which was the thin category everywhere.
  // ---------------------------------------------------------------------------
  es: [
    { unit: "u5", category: "Feelings", lemma: "cansado", translation: "tired", difficulty: 1,
      examples: [{ native: "Estoy muy cansado", translation: "I am very tired" }] },
    { unit: "u5", category: "Feelings", lemma: "hambre", translation: "hunger", difficulty: 1,
      note: "Spanish says 'I have hunger', not 'I am hungry' — tengo hambre.",
      examples: [{ native: "Tengo hambre", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "sed", translation: "thirst", difficulty: 1,
      examples: [{ native: "Tengo sed", translation: "I am thirsty" }] },
    { unit: "u5", category: "Feelings", lemma: "contento", translation: "happy, pleased", difficulty: 1,
      examples: [{ native: "Estoy contento", translation: "I am happy" }] },
    { unit: "u5", category: "Feelings", lemma: "triste", translation: "sad", difficulty: 1,
      examples: [{ native: "Ella está triste", translation: "She is sad" }] },
    { unit: "u5", category: "Feelings", lemma: "enfermo", translation: "ill, sick", difficulty: 1,
      examples: [{ native: "Mi padre está enfermo", translation: "My father is ill" }] },
    { unit: "u5", category: "Feelings", lemma: "enojado", translation: "angry", difficulty: 2,
      examples: [{ native: "No estoy enojado", translation: "I am not angry" }] },
    { unit: "u4", category: "Family", lemma: "tío", translation: "uncle", difficulty: 1,
      examples: [{ native: "Mi tío vive en Madrid", translation: "My uncle lives in Madrid" }] },
    { unit: "u4", category: "Family", lemma: "tía", translation: "aunt", difficulty: 1,
      examples: [{ native: "Mi tía cocina muy bien", translation: "My aunt cooks very well" }] },
    { unit: "u4", category: "Family", lemma: "primo", translation: "cousin", difficulty: 1,
      examples: [{ native: "Mi primo tiene diez años", translation: "My cousin is ten years old" }] },
  ],

  fr: [
    { unit: "u5", category: "Feelings", lemma: "fatigué", translation: "tired", difficulty: 1,
      examples: [{ native: "Je suis fatigué", translation: "I am tired" }] },
    { unit: "u5", category: "Feelings", lemma: "faim", translation: "hunger", difficulty: 1,
      note: "French says 'I have hunger' — j'ai faim.",
      examples: [{ native: "J'ai faim", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "soif", translation: "thirst", difficulty: 1,
      examples: [{ native: "J'ai soif", translation: "I am thirsty" }] },
    { unit: "u5", category: "Feelings", lemma: "heureux", translation: "happy", difficulty: 1,
      examples: [{ native: "Je suis heureux", translation: "I am happy" }] },
    { unit: "u5", category: "Feelings", lemma: "triste", translation: "sad", difficulty: 1,
      examples: [{ native: "Elle est triste", translation: "She is sad" }] },
    { unit: "u5", category: "Feelings", lemma: "malade", translation: "ill, sick", difficulty: 1,
      examples: [{ native: "Mon père est malade", translation: "My father is ill" }] },
    { unit: "u4", category: "Family", lemma: "oncle", translation: "uncle", difficulty: 1,
      examples: [{ native: "Mon oncle habite à Lyon", translation: "My uncle lives in Lyon" }] },
    { unit: "u4", category: "Family", lemma: "tante", translation: "aunt", difficulty: 1,
      examples: [{ native: "Ma tante est médecin", translation: "My aunt is a doctor" }] },
    { unit: "u4", category: "Family", lemma: "cousin", translation: "cousin", difficulty: 1,
      examples: [{ native: "Mon cousin arrive demain", translation: "My cousin arrives tomorrow" }] },
  ],

  de: [
    { unit: "u5", category: "Feelings", lemma: "müde", translation: "tired", difficulty: 1,
      examples: [{ native: "Ich bin müde", translation: "I am tired" }] },
    { unit: "u5", category: "Feelings", lemma: "hungrig", translation: "hungry", difficulty: 1,
      examples: [{ native: "Ich bin hungrig", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "durstig", translation: "thirsty", difficulty: 1,
      examples: [{ native: "Bist du durstig?", translation: "Are you thirsty?" }] },
    { unit: "u5", category: "Feelings", lemma: "glücklich", translation: "happy", difficulty: 1,
      examples: [{ native: "Ich bin sehr glücklich", translation: "I am very happy" }] },
    { unit: "u5", category: "Feelings", lemma: "traurig", translation: "sad", difficulty: 1,
      examples: [{ native: "Sie ist traurig", translation: "She is sad" }] },
    { unit: "u5", category: "Feelings", lemma: "krank", translation: "ill, sick", difficulty: 1,
      examples: [{ native: "Mein Vater ist krank", translation: "My father is ill" }] },
    { unit: "u4", category: "Family", lemma: "Onkel", translation: "uncle", difficulty: 1,
      examples: [{ native: "Mein Onkel wohnt in Berlin", translation: "My uncle lives in Berlin" }] },
    { unit: "u4", category: "Family", lemma: "Tante", translation: "aunt", difficulty: 1,
      examples: [{ native: "Meine Tante kocht gut", translation: "My aunt cooks well" }] },
  ],

  tr: [
    { unit: "u5", category: "Feelings", lemma: "yorgun", translation: "tired", difficulty: 1,
      examples: [{ native: "Çok yorgunum", translation: "I am very tired" }] },
    { unit: "u5", category: "Feelings", lemma: "aç", translation: "hungry", difficulty: 1,
      examples: [{ native: "Ben açım", translation: "I am hungry" }] },
    { unit: "u5", category: "Feelings", lemma: "susuz", translation: "thirsty", difficulty: 2,
      examples: [{ native: "Susadım", translation: "I got thirsty" }] },
    { unit: "u5", category: "Feelings", lemma: "mutlu", translation: "happy", difficulty: 1,
      examples: [{ native: "Çok mutluyum", translation: "I am very happy" }] },
    { unit: "u5", category: "Feelings", lemma: "üzgün", translation: "sad", difficulty: 1,
      examples: [{ native: "O üzgün", translation: "He is sad" }] },
    { unit: "u5", category: "Feelings", lemma: "hasta", translation: "ill, sick", difficulty: 1,
      examples: [{ native: "Annem hasta", translation: "My mother is ill" }] },
    { unit: "u4", category: "Family", lemma: "amca", translation: "uncle (father's brother)", difficulty: 2,
      note: "Turkish also marks the side of the family: amca is your father's brother, dayı your mother's.",
      examples: [{ native: "Amcam İstanbul'da yaşıyor", translation: "My uncle lives in Istanbul" }] },
    { unit: "u4", category: "Family", lemma: "dayı", translation: "uncle (mother's brother)", difficulty: 2,
      examples: [{ native: "Dayım geldi", translation: "My uncle (mother's brother) has come" }] },
    { unit: "u4", category: "Family", lemma: "teyze", translation: "aunt (mother's sister)", difficulty: 2,
      examples: [{ native: "Teyzem çok iyi", translation: "My aunt is very kind" }] },
    { unit: "u4", category: "Family", lemma: "hala", translation: "aunt (father's sister)", difficulty: 2,
      examples: [{ native: "Halam yarın gelecek", translation: "My aunt will come tomorrow" }] },
  ],

  id: [
    { unit: "u3", category: "Feelings", lemma: "lelah", translation: "tired", difficulty: 1,
      examples: [{ native: "Saya lelah", translation: "I am tired" }] },
    { unit: "u3", category: "Feelings", lemma: "lapar", translation: "hungry", difficulty: 1,
      examples: [{ native: "Saya lapar", translation: "I am hungry" }] },
    { unit: "u3", category: "Feelings", lemma: "haus", translation: "thirsty", difficulty: 1,
      examples: [{ native: "Apakah kamu haus?", translation: "Are you thirsty?" }] },
    { unit: "u3", category: "Feelings", lemma: "senang", translation: "happy, pleased", difficulty: 1,
      examples: [{ native: "Saya senang sekali", translation: "I am very happy" }] },
    { unit: "u3", category: "Feelings", lemma: "sedih", translation: "sad", difficulty: 1,
      examples: [{ native: "Dia sedih", translation: "He is sad" }] },
    { unit: "u3", category: "Feelings", lemma: "sakit", translation: "ill, in pain", difficulty: 1,
      examples: [{ native: "Ibu saya sakit", translation: "My mother is ill" }] },
    { unit: "u3", category: "Family", lemma: "paman", translation: "uncle", difficulty: 1,
      examples: [{ native: "Paman saya tinggal di Jakarta", translation: "My uncle lives in Jakarta" }] },
    { unit: "u3", category: "Family", lemma: "bibi", translation: "aunt", difficulty: 1,
      examples: [{ native: "Bibi memasak nasi", translation: "Aunt is cooking rice" }] },
    { unit: "u3", category: "Family", lemma: "kakek", translation: "grandfather", difficulty: 1,
      examples: [{ native: "Kakek minum teh", translation: "Grandfather drinks tea" }] },
    { unit: "u3", category: "Family", lemma: "nenek", translation: "grandmother", difficulty: 1,
      examples: [{ native: "Nenek sangat baik", translation: "Grandmother is very kind" }] },
  ],

  pcm: [
    { unit: "u3", category: "Feelings", lemma: "taya", translation: "tired", difficulty: 1,
      examples: [{ native: "I don taya", translation: "I am tired" }] },
    { unit: "u3", category: "Feelings", lemma: "hungry", translation: "hungry", difficulty: 1,
      examples: [{ native: "Hungry dey catch me", translation: "I am hungry" }] },
    { unit: "u3", category: "Feelings", lemma: "happy", translation: "happy", difficulty: 1,
      examples: [{ native: "I happy well well", translation: "I am very happy" }] },
    { unit: "u3", category: "Feelings", lemma: "vex", translation: "angry, annoyed", difficulty: 1,
      examples: [{ native: "No vex", translation: "Don't be annoyed / sorry" }] },
    { unit: "u3", category: "Feelings", lemma: "sick", translation: "ill, sick", difficulty: 1,
      examples: [{ native: "My mama dey sick", translation: "My mother is ill" }] },
    { unit: "u3", category: "Family", lemma: "uncle", translation: "uncle", difficulty: 1,
      examples: [{ native: "My uncle dey Lagos", translation: "My uncle is in Lagos" }] },
    { unit: "u3", category: "Family", lemma: "anti", translation: "aunt", difficulty: 1,
      note: "Also used respectfully for any older woman, not only a relative.",
      examples: [{ native: "Anti dey cook", translation: "Aunt is cooking" }] },
    { unit: "u3", category: "Family", lemma: "grandpapa", translation: "grandfather", difficulty: 1,
      examples: [{ native: "Grandpapa dey house", translation: "Grandfather is at home" }] },
    { unit: "u3", category: "Family", lemma: "grandmama", translation: "grandmother", difficulty: 1,
      examples: [{ native: "Grandmama sabi plenty story", translation: "Grandmother knows plenty of stories" }] },
  ],
};
