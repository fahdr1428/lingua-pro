// =============================================================================
// COURSES — what each language's course IS, stated per language.
//
// One shared architecture, 21 different languages. This file is where they
// differ: which variety and register the pack teaches, how it is written, what
// its grammar asks of a learner, what learners find hard, and what the tutor
// must do differently. The curriculum builder, the lesson screens and the tutor
// all read it, so nothing downstream assumes a language behaves like English.
//
// HOW THIS WAS WRITTEN. Each `variety` describes the content the pack actually
// contains, checked against marker words in the pack (e.g. Spanish uses
// "coche", Persian examples use colloquial Tehran endings, the Tamil pack mixes
// spoken and written forms). Where the pack is inconsistent, `contentNotes`
// says so instead of describing the course we would like to have.
//
// STATUS. Every profile is `review: "unreviewed"`. The descriptions are general
// linguistic facts, but nobody qualified in each language has signed them off,
// and the app must not say otherwise. validate-curriculum enforces the field.
//
// Loaded lazily (by the course screen, structured lessons and the tutor), so it
// costs nothing on first load.
// =============================================================================

/** Features the curriculum and tutor know how to treat. validate-curriculum
 *  rejects anything else, so a typo can't silently switch a behaviour off. */
export const FEATURES = {
  tones: "Pitch or tone changes the meaning of a word",
  gender: "Nouns have grammatical gender, and other words agree with it",
  cases: "Nouns, pronouns or articles change form for their role in the sentence",
  formality: "There is more than one word for 'you', chosen by respect or closeness",
  honorifics: "Verb forms change with politeness or the listener's status",
  particles: "Small words or suffixes mark the role of each phrase",
  classifiers: "Counting things needs a classifier or measure word",
  agglutinative: "Words are built by adding chains of suffixes",
  diglossia: "The written standard differs noticeably from everyday speech",
  "vowel-harmony": "Suffix vowels change to match the word they attach to",
  "verb-agreement": "Verbs change with the person (and sometimes gender) of the subject",
  focus: "The verb or a marker shows which phrase is in focus",
  "unwritten-vowels": "Short vowels are usually not written",
  "non-latin": "Written in a script the learner must learn to read",
};

export const SCRIPTS = {
  arabic: { name: "Arabic script", dir: "rtl" },
  nastaliq: { name: "Perso-Arabic script (Nastaliq)", dir: "rtl" },
  persian: { name: "Perso-Arabic script", dir: "rtl" },
  shahmukhi: { name: "Shahmukhi (Perso-Arabic script)", dir: "rtl" },
  devanagari: { name: "Devanagari", dir: "ltr" },
  bengali: { name: "Bengali script", dir: "ltr" },
  malayalam: { name: "Malayalam script", dir: "ltr" },
  tamil: { name: "Tamil script", dir: "ltr" },
  hangul: { name: "Hangul", dir: "ltr" },
  kana: { name: "Hiragana, katakana and kanji", dir: "ltr" },
  hanzi: { name: "Simplified Chinese characters", dir: "ltr" },
  latin: { name: "Latin alphabet", dir: "ltr" },
};

export const COURSES = {
  ar: {
    variety: "Modern Standard Arabic",
    varietyCode: "ar",
    register: "Standard, neutral",
    script: "arabic",
    romanisation: "Informal romanisation (marhaba, shukran) shown beside the script",
    wordOrder: "VSO in formal writing; SVO is common",
    features: ["gender", "unwritten-vowels", "diglossia", "verb-agreement", "non-latin"],
    difficulties: [
      "Short vowels are usually left unwritten",
      "Sounds English lacks: ع ح ق خ غ",
      "Verbs and adjectives agree in gender and number, including the dual",
      "Nobody speaks the written standard at home: spoken dialects differ",
    ],
    otherVarieties:
      "Spoken forms for Egyptian, Levantine, Gulf, Maghrebi, Iraqi and Sudanese Arabic are shown where a word differs (49 words so far).",
    tutor:
      "Teach Modern Standard Arabic. If the learner has chosen a spoken variety, give that form too and say which is which. Never present MSA as everyday speech. Show romanisation after the Arabic. Vowel marks only when they help.",
    contentNotes: [],
  },
  bn: {
    variety: "Standard colloquial Bengali (Bangla)",
    varietyCode: "bn",
    register: "Everyday; আপনি (apni) for strangers",
    script: "bengali",
    romanisation: "Informal romanisation (dhonnobad) shown beside the script",
    wordOrder: "SOV",
    features: ["formality", "classifiers", "verb-agreement", "non-latin"],
    difficulties: [
      "Conjunct letters join two or three consonants into one shape",
      "The inherent vowel (ô) is pronounced but not written",
      "Three levels of 'you': apni, tumi, tui",
      "The verb comes last",
      "The classifiers টা / টি attach to nouns and numbers",
    ],
    otherVarieties:
      "Bangladesh and West Bengal share the standard but differ in everyday words (পানি / জল for water) and greetings.",
    tutor:
      "Use standard colloquial Bengali in Bengali script with romanisation. Default to apni with strangers. When a word differs between Bangladesh and West Bengal, give both and say where each is used.",
    contentNotes: [
      "The pack mixes Bangladeshi usage (পানি, আসসালামু আলাইকুম) with West Bengal usage (নমস্কার) without labelling either. A reviewer should choose a default and label the other.",
      "Device speech uses bn-IN while the course flag is Bangladesh.",
    ],
  },
  de: {
    variety: "Standard German (Germany)",
    varietyCode: "de-DE",
    register: "Everyday; Sie with strangers, du with friends",
    script: "latin",
    romanisation: null,
    wordOrder: "Verb second in main clauses; verb last in subordinate clauses",
    features: ["gender", "cases", "formality", "verb-agreement"],
    difficulties: [
      "Every noun is der, die or das, and the article must be learned with it",
      "Four cases change the article (der → den → dem → des)",
      "The verb is second in a statement and last after weil, dass, wenn",
      "Separable verbs split: ich rufe dich an",
    ],
    otherVarieties: "Austrian and Swiss forms are available as varieties for the tutor.",
    tutor:
      "Teach Standard German. Always give nouns with their article. Default to Sie with strangers. Correct word order (verb second) before minor ending errors at A1.",
    exams: "Goethe-Zertifikat, telc, TestDaF",
    contentNotes: [],
  },
  es: {
    variety: "Spanish, with Spain's everyday vocabulary (coche)",
    varietyCode: "es-ES",
    register: "Everyday; tú with friends, usted with strangers",
    script: "latin",
    romanisation: null,
    wordOrder: "SVO; subject pronouns usually dropped",
    features: ["gender", "formality", "verb-agreement"],
    difficulties: [
      "Two verbs for 'to be': ser and estar",
      "Nouns are masculine or feminine and adjectives agree",
      "Verbs change for every person: hablo, hablas, habla…",
      "The rolled r and the tapped r",
    ],
    otherVarieties:
      "Mexican and Argentine Spanish are available as varieties for the tutor. Latin American vocabulary (carro, jugo) is not yet labelled in lessons.",
    tutor:
      "Teach the pack's variety. Accept Latin American forms as correct and name where they are used. Do not use vosotros unless the learner chose Spain. Correct ser/estar and agreement before accents at A1.",
    exams: "DELE, SIELE",
    contentNotes: ["The pack does not label Spain-only words, so Latin American learners are not told when a word is regional."],
  },
  fa: {
    variety: "Iranian Persian (Farsi), as spoken in Tehran",
    varietyCode: "fa-IR",
    register: "Everyday spoken; شما (shomâ) with strangers",
    script: "persian",
    romanisation: "Romanisation with â for the long a (salâm)",
    wordOrder: "SOV",
    features: ["formality", "diglossia", "unwritten-vowels", "verb-agreement", "non-latin"],
    difficulties: [
      "Short vowels are not written",
      "The ezafe -e links words (ketâb-e man) and is not written",
      "Spoken endings differ from written ones (می‌کنه / می‌کند)",
      "Many verbs are compounds: kâr kardan (to work)",
      "Taarof: polite refusal and insistence",
    ],
    otherVarieties: "Dari (Afghanistan) and Tajik are not taught; they differ in vocabulary and pronunciation.",
    tutor:
      "Use colloquial Tehran Persian and give the written form when it differs. Use shomâ with strangers. Show romanisation with â.",
    contentNotes: ["Example sentences use spoken endings; written forms are not given beside them."],
  },
  fr: {
    variety: "French (France)",
    varietyCode: "fr-FR",
    register: "Everyday; vous with strangers, tu with friends",
    script: "latin",
    romanisation: null,
    wordOrder: "SVO; object pronouns go before the verb",
    features: ["gender", "formality", "verb-agreement"],
    difficulties: [
      "Many written letters are silent, and liaison joins words",
      "Nouns are masculine or feminine (le / la)",
      "Nasal vowels: an, on, in",
      "Negation wraps the verb: ne … pas",
      "Choosing tu or vous",
    ],
    otherVarieties: "Québec French is available as a variety for the tutor.",
    tutor: "Teach standard French of France. Default to vous with strangers. Accept Québec forms and name them.",
    exams: "DELF, DALF, TCF",
    contentNotes: [],
  },
  hi: {
    variety: "Standard Hindi",
    varietyCode: "hi-IN",
    register: "Everyday polite (आप)",
    script: "devanagari",
    romanisation: "Informal romanisation (dhanyavaad) shown beside the script",
    wordOrder: "SOV, with postpositions",
    features: ["gender", "formality", "verb-agreement", "non-latin"],
    difficulties: [
      "The verb comes last",
      "Verbs and adjectives agree with gender",
      "Three levels of 'you': aap, tum, tu",
      "Aspirated and retroflex consonants (ठ / ट / त)",
      "ने (ne) in the past tense changes what the verb agrees with",
    ],
    otherVarieties: "Urdu shares the spoken core; script and formal vocabulary differ.",
    tutor:
      "Use everyday Hindi in Devanagari with romanisation, not Sanskritised formal vocabulary. Default to aap. Agreement errors matter from A1.",
    contentNotes: [],
  },
  id: {
    variety: "Standard Indonesian (Bahasa Indonesia)",
    varietyCode: "id-ID",
    register: "Standard polite (Anda, tidak)",
    script: "latin",
    romanisation: null,
    wordOrder: "SVO",
    features: [],
    difficulties: [
      "Verbs don't change for tense: time words do the work",
      "Prefixes change meaning: makan, makanan, dimakan",
      "Two words for 'we': kami (not you) and kita (including you)",
      "Everyday speech differs from the standard (nggak / tidak)",
    ],
    otherVarieties: "Colloquial Jakarta Indonesian is not taught.",
    tutor:
      "Use standard Indonesian. When everyday speech differs (nggak, aku), mention it as informal. Indonesian marks time with words, so do not invent tense endings.",
    contentNotes: ["The romanisation field holds a pronunciation guide (HAH-loh), not a transliteration."],
  },
  ja: {
    variety: "Standard Japanese",
    varietyCode: "ja-JP",
    register: "Polite (です / ます)",
    script: "kana",
    romanisation: "Hepburn-style rōmaji, with long vowels written ou (arigatou)",
    wordOrder: "SOV, with particles",
    features: ["particles", "honorifics", "classifiers", "non-latin"],
    difficulties: [
      "Three scripts: hiragana, katakana and kanji",
      "Particles mark each phrase's role: は, が, を, に",
      "The verb comes last",
      "Polite and plain forms (食べます / 食べる)",
      "Counters change with what is counted",
    ],
    otherVarieties: "Regional dialects (e.g. Kansai) are not taught.",
    tutor:
      "Use polite です/ます Japanese at A1–A2. Write kanji with kana readings for anything beyond the learner's level, and rōmaji only when the learner needs it.",
    exams: "JLPT (N5–N1)",
    contentNotes: ["The pack has both 母 (haha) and はは for 'mother'."],
  },
  ko: {
    variety: "Standard Korean (Seoul)",
    varietyCode: "ko-KR",
    register: "Polite (해요체)",
    script: "hangul",
    romanisation: "Revised Romanization (annyeonghaseyo)",
    wordOrder: "SOV, with particles",
    features: ["particles", "honorifics", "agglutinative", "non-latin"],
    difficulties: [
      "Speech levels: the verb ending shows politeness",
      "Topic 은/는 versus subject 이/가",
      "Sounds change between syllables (합니다 is said hamnida)",
      "The verb comes last",
    ],
    otherVarieties: "Regional dialects are not taught.",
    tutor:
      "Use polite 해요체 by default and name formal 합니다체 when it appears. Write Hangul first, romanisation only as support.",
    exams: "TOPIK",
    contentNotes: [],
  },
  ml: {
    variety: "Standard Malayalam",
    varietyCode: "ml-IN",
    register: "Everyday; നിങ്ങൾ (ningal) for respect",
    script: "malayalam",
    romanisation: "Informal romanisation (nandi) shown beside the script",
    wordOrder: "SOV",
    features: ["agglutinative", "formality", "diglossia", "non-latin"],
    difficulties: [
      "Long words built from chains of suffixes",
      "Chillu letters and conjuncts",
      "Retroflex sounds and ഴ (zha)",
      "The verb comes last; it doesn't change for the person",
      "Everyday speech differs from the written language",
    ],
    otherVarieties: "Regional speech in Kerala varies; the pack uses standard forms.",
    tutor: "Use standard spoken Malayalam with romanisation. Use ningal with strangers.",
    contentNotes: [],
  },
  pa: {
    variety: "Punjabi (Pakistan), written in Shahmukhi",
    varietyCode: "pa-PK",
    register: "Everyday; تسیں (tusin) for respect",
    script: "shahmukhi",
    romanisation: "Informal romanisation (shukriya) shown beside the script",
    wordOrder: "SOV",
    features: ["gender", "tones", "formality", "verb-agreement", "unwritten-vowels", "non-latin"],
    difficulties: [
      "Punjabi has tones, and the spelling doesn't mark them directly",
      "Short vowels are usually not written",
      "Verbs and adjectives agree with gender",
      "tusin (respect) and tun (familiar)",
    ],
    otherVarieties: "Gurmukhi script (India) is not taught. Spoken Punjabi varies by region.",
    tutor: "Use Pakistani Punjabi in Shahmukhi with romanisation. Use tusin with strangers.",
    contentNotes: ["Device speech uses pa-IN, which reads Gurmukhi, so spoken audio may be missing on many devices."],
  },
  pcm: {
    variety: "Nigerian Pidgin (Naijá)",
    varietyCode: "pcm-NG",
    register: "Everyday",
    script: "latin",
    romanisation: null,
    wordOrder: "SVO",
    features: [],
    difficulties: [
      "It looks like English, but many words mean something else (sabi = know)",
      "dey, don and go mark ongoing, finished and future actions",
      "Spelling is not standardised",
    ],
    otherVarieties: "Spoken Pidgin varies across Nigeria and West Africa.",
    tutor:
      "Use everyday Nigerian Pidgin. Do not correct the learner towards English. Accept common spelling variants. Show respect with address terms (Oga, Madam, Aunty), not a separate 'you'.",
    contentNotes: ["The romanisation field holds a pronunciation guide, not a transliteration."],
  },
  so: {
    variety: "Standard Somali",
    varietyCode: "so-SO",
    register: "Everyday",
    script: "latin",
    romanisation: null,
    wordOrder: "SOV, with focus markers",
    features: ["gender", "focus", "tones"],
    difficulties: [
      "Statements need a focus marker: waa, baa or ayaa",
      "x and c are throat sounds (x = ħ, c = ʕ)",
      "Double vowels are long: dal / daal",
      "The definite article changes with the noun (-ka, -ta, -ga)",
    ],
    otherVarieties: "Maay and southern varieties are not taught.",
    tutor: "Use standard Somali in the official Latin spelling. Explain focus markers when correcting statements.",
    contentNotes: [],
  },
  ta: {
    variety: "Tamil, mainly spoken forms",
    varietyCode: "ta",
    register: "Everyday; respectful forms for strangers",
    script: "tamil",
    romanisation: "Informal romanisation (nandri) shown beside the script",
    wordOrder: "SOV",
    features: ["agglutinative", "diglossia", "formality", "verb-agreement", "non-latin"],
    difficulties: [
      "Spoken Tamil differs sharply from the written language",
      "One letter can be two sounds: க is k or g",
      "Retroflex sounds and ழ (zha)",
      "The verb comes last and ends with the person",
    ],
    otherVarieties: "Sri Lankan and Indian Tamil differ in speech; the pack doesn't label which it uses.",
    tutor:
      "Use spoken Tamil (இருக்கேன்) and give the written form (இருக்கிறேன்) when the learner asks or is reading. Use respectful forms with strangers.",
    contentNotes: [
      "The pack mixes spoken verb forms (இருக்கேன்) with written pronouns (நீங்கள், நாங்கள்); spoken would be நீங்க, நாங்க. A reviewer should decide and label.",
    ],
  },
  tl: {
    variety: "Tagalog (Filipino)",
    varietyCode: "tl-PH",
    register: "Everyday; po and opo for respect",
    script: "latin",
    romanisation: null,
    wordOrder: "Verb first",
    features: ["focus", "particles"],
    difficulties: [
      "The verb comes first",
      "Verb affixes show focus: -um-, mag-, -in",
      "The markers ang, ng and sa",
      "po and opo show respect",
      "Mixing with English (Taglish) is normal in speech",
    ],
    otherVarieties: "Other Philippine languages (Cebuano, Ilocano…) are separate languages, not taught.",
    tutor: "Use everyday Tagalog. Add po with elders and strangers. Don't penalise common English loanwords.",
    contentNotes: [],
  },
  tr: {
    variety: "Standard Turkish (Istanbul)",
    varietyCode: "tr-TR",
    register: "Everyday; siz with strangers",
    script: "latin",
    romanisation: null,
    wordOrder: "SOV",
    features: ["agglutinative", "vowel-harmony", "cases", "formality", "verb-agreement"],
    difficulties: [
      "Suffix vowels change to match the word (evde / okulda)",
      "Long words built from chains of suffixes",
      "ı (dotless) and i are different letters",
      "The verb comes last",
    ],
    otherVarieties: "Regional accents vary; the pack uses standard Istanbul Turkish.",
    tutor: "Use standard Turkish. Use siz with strangers. When correcting a suffix, explain vowel harmony.",
    contentNotes: ["The romanisation field holds a pronunciation guide, not a transliteration."],
  },
  ur: {
    variety: "Urdu as spoken in Pakistan",
    varietyCode: "ur-PK",
    register: "Everyday polite (آپ)",
    script: "nastaliq",
    romanisation: "Informal Roman Urdu (shukriya) shown beside the script",
    wordOrder: "SOV, with postpositions",
    features: ["gender", "formality", "verb-agreement", "unwritten-vowels", "non-latin"],
    difficulties: [
      "The verb comes last",
      "Verbs and adjectives agree with gender",
      "Three levels of 'you': aap, tum, tu",
      "Retroflex and dental consonants (ٹ / ت)",
      "ne in the past tense changes what the verb agrees with",
    ],
    otherVarieties: "Hindi shares the spoken core; script and formal vocabulary differ. Indian Urdu is available as a variety for the tutor.",
    tutor:
      "Use everyday Pakistani Urdu in Nastaliq with Roman Urdu. Default to aap. Accept common Roman Urdu spellings. Agreement errors matter from A1.",
    contentNotes: [],
  },
  vi: {
    variety: "Vietnamese, Northern (Hanoi) standard",
    varietyCode: "vi-VN",
    register: "Everyday; pronouns by age and relationship",
    script: "latin",
    romanisation: null,
    wordOrder: "SVO",
    features: ["tones", "classifiers"],
    difficulties: [
      "Six tones change the meaning of a word",
      "Pronouns depend on age and relationship (anh, chị, em, bạn)",
      "Counting needs a classifier (một con mèo)",
      "Text online often drops the marks that carry the tones",
    ],
    otherVarieties: "Southern words are labelled where the pack has them (dạ / vâng).",
    tutor:
      "Use Northern Vietnamese with full diacritics. Choose pronouns by the relationship in the scene, and explain the choice.",
    contentNotes: [],
  },
  yo: {
    variety: "Standard Yoruba",
    varietyCode: "yo-NG",
    register: "Everyday; ẹ for elders and respect",
    script: "latin",
    romanisation: null,
    wordOrder: "SVO",
    features: ["tones", "formality"],
    difficulties: [
      "Three tones change the meaning of a word",
      "Underdotted letters ẹ, ọ, ṣ are different sounds",
      "ẹ (respect) and o (familiar)",
      "Unmarked text is ambiguous",
    ],
    otherVarieties: "Regional dialects (Ìjẹ̀ṣà, Ẹ̀gbá…) are not taught.",
    tutor: "Write Yoruba with full tone marks and underdots. Use ẹ with elders.",
    contentNotes: [],
  },
  zh: {
    variety: "Standard Mandarin (Putonghua)",
    varietyCode: "zh-CN",
    register: "Everyday",
    script: "hanzi",
    romanisation: "Pinyin with tone marks (nǐ hǎo)",
    wordOrder: "SVO",
    features: ["tones", "classifiers", "non-latin"],
    difficulties: [
      "Four tones plus a neutral tone",
      "Characters don't show pronunciation: pinyin does",
      "Counting needs a measure word (一个人)",
      "Question words stay where the answer goes",
    ],
    otherVarieties: "Taiwan Mandarin is available as a variety for the tutor. Traditional characters are not taught.",
    tutor: "Use Simplified characters with pinyin and tone marks. Tone-mark errors in typed pinyin are minor at A1.",
    exams: "HSK",
    contentNotes: [],
  },
};

// Nobody qualified in each language has reviewed these profiles yet. Stated on
// every profile so a screen showing one can't omit it, and so a reviewed one
// has to be marked deliberately (validate-curriculum checks the values).
for (const c of Object.values(COURSES)) if (!c.review) c.review = "unreviewed";

/** The profile for a language, or null. */
export function getCourse(code) {
  return COURSES[code] || null;
}

/** Text direction of the course's script. */
export function courseDir(code) {
  const c = COURSES[code];
  return (c && SCRIPTS[c.script]?.dir) || "ltr";
}
