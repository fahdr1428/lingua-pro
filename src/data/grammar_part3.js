// =============================================================================
// GRAMMAR PART 3 (v88) — the seven languages that had none.
//
// Nine of sixteen languages had a grammar curriculum. German, Turkish,
// Indonesian, Punjabi, Nigerian Pidgin, Tagalog and Persian had nothing at all —
// so the Grammar screen was an empty room for anyone learning them, and the
// in-lesson grammar moment never fired, which meant those courses were pure
// vocabulary drill with no explanation of how the language is put together.
//
// That matters more than it sounds. RESEARCH.md's audit of the second-language
// acquisition literature landed on Lightbown and Spada's conclusion: explicit
// instruction on a pattern measurably improves performance on that pattern, and
// the mistake is making it the WHOLE of the course rather than including it. A
// course with no form-focus at all is on the wrong side of that finding.
//
// Each lesson is the thing the language actually turns on, not a tour of its
// terminology — the case system that breaks German sentences for English
// speakers, the suffix stacking that makes Turkish look impossible and isn't,
// the two markers that decide what a Tagalog sentence is even about.
//
// The `checks` here are the RULE questions. The application items — "which of
// these actually does it" — are generated from each lesson's own examples by
// src/engine/grammarChecks.js, so nothing invents a sentence in a language it
// has no business inventing sentences in.
// =============================================================================

export const GRAMMAR_PART3 = {

  // ===========================================================================
  // MALAYALAM
  // ===========================================================================
  ml: [
    {
      id: "ml_g1", title: "The verb comes last", emoji: "🔚",
      concept: "Malayalam is **Subject–Object–Verb**. *ഞാൻ ചോറ് കഴിക്കുന്നു* is literally 'I rice eat'. The action closes the sentence, so you hold the thought until the end — which is also why interrupting a Malayalam speaker mid-sentence loses the whole meaning.",
      examples: [
        { native: "ഞാൻ ചോറ് കഴിക്കുന്നു", translit: "njaan choru kazhikkunnu", gloss: "I eat rice (I rice eat)" },
        { native: "അവൻ പുസ്തകം വായിക്കുന്നു", translit: "avan pusthakam vaayikkunnu", gloss: "he reads a book" },
        { native: "ഞങ്ങൾ വീട്ടിൽ പോകുന്നു", translit: "njangal veettil pokunnu", gloss: "we go home" },
      ],
      checks: [{ q: "Where does the verb go?", options: ["At the end", "Second", "First", "Before the object"], answer: "At the end", explain: "Subject, object, then verb." }],
    },
    {
      id: "ml_g2", title: "Respect is the plural", emoji: "🙏",
      concept: "Malayalam shows respect by using the **plural form for one person**. *നീ* to a friend, *നിങ്ങൾ* to anyone older or unfamiliar, with plural verb endings to match. Using the singular with an elder isn't casual — it's rude, and it is the clearest sign of someone who learned the language from a book.",
      examples: [
        { native: "നീ എവിടെയാണ്?", translit: "nee evideyaanu?", gloss: "where are you? (to a friend)" },
        { native: "നിങ്ങൾ എവിടെയാണ്?", translit: "ningal evideyaanu?", gloss: "where are you? (respectful)" },
        { native: "അച്ഛൻ വന്നു", translit: "achchan vannu", gloss: "father has come" },
      ],
      checks: [{ q: "How do you address one older person respectfully?", options: ["With the plural form", "With the singular form", "By adding a suffix to their name", "By changing word order"], answer: "With the plural form", explain: "നിങ്ങൾ and plural endings, even for one person." }],
    },
    {
      id: "ml_g3", title: "'And' attaches to the end", emoji: "🔗",
      concept: "Malayalam doesn't put a word between two things. It attaches **-ഉം** to the end of *each* of them: *ചോറും മീനും*, rice-and fish-and. Both items get it, which feels like saying 'and' twice and is simply how the language joins things.",
      examples: [
        { native: "ചോറും മീനും", translit: "chorum meenum", gloss: "rice and fish" },
        { native: "ഞാനും അവനും", translit: "njaanum avanum", gloss: "he and I" },
        { native: "ചായയും പാലും", translit: "chaayayum paalum", gloss: "tea and milk" },
      ],
      checks: [{ q: "How does Malayalam join two nouns?", options: ["Adds -um to the end of both", "Puts a word between them", "Repeats the noun", "Uses word order alone"], answer: "Adds -um to the end of both", explain: "chor-um meen-um. Each item carries the ending." }],
    },
    {
      id: "ml_g4", title: "Chettan and chechi — titles for strangers", emoji: "👥",
      concept: "**ചേട്ടൻ** (older brother) and **ചേച്ചി** (older sister) are used for people who are not your siblings at all — the shopkeeper, the auto driver, a colleague a few years older. Addressing an older person by their bare name sounds abrupt to the point of rudeness. Malayalis abroad keep this habit long after they've dropped others.",
      examples: [
        { native: "ചേട്ടാ, ഇത് എത്രയാണ്?", translit: "chettaa, ithu ethrayaanu?", gloss: "chettan, how much is this?" },
        { native: "ചേച്ചി, സഹായിക്കാമോ?", translit: "chechi, sahaayikkaamo?", gloss: "chechi, could you help?" },
        { native: "എന്റെ ചേട്ടൻ ദുബായിലാണ്", translit: "ente chettan Dubaiyilaanu", gloss: "my older brother is in Dubai" },
      ],
      checks: [{ q: "Who do you call 'chettan'?", options: ["Your older brother and any man a bit older", "Only your brother", "Only family", "Anyone younger"], answer: "Your older brother and any man a bit older", explain: "The title extends well past the family." }],
    },
  ],

  // ===========================================================================
  // TAMIL
  // ===========================================================================
  ta: [
    {
      id: "ta_g1", title: "The verb comes last", emoji: "🔚",
      concept: "Tamil is **Subject–Object–Verb**. *நான் சாதம் சாப்பிடறேன்* is 'I rice eat'. Like Malayalam, Urdu and Turkish, the action arrives at the end and everything before it is setup.",
      examples: [
        { native: "நான் சாதம் சாப்பிடறேன்", translit: "naan saadham saappidaren", gloss: "I eat rice (I rice eat)" },
        { native: "அவன் புத்தகம் படிக்கிறான்", translit: "avan putthagam padikkiraan", gloss: "he reads a book" },
        { native: "நாங்க வீட்டுக்கு போறோம்", translit: "naanga veettukku poroom", gloss: "we go home" },
      ],
      checks: [{ q: "Where does the verb go?", options: ["At the end", "Second", "First", "Before the object"], answer: "At the end", explain: "Subject, object, then verb." }],
    },
    {
      id: "ta_g2", title: "Respect is the plural", emoji: "🙏",
      concept: "Tamil marks respect with the **plural for one person**: *நீ* to a friend, *நீங்க* to anyone older, and the verb takes a plural ending to match. This is not optional politeness — the wrong form is heard immediately.",
      examples: [
        { native: "நீ எங்கே?", translit: "nee enge?", gloss: "where are you? (to a friend)" },
        { native: "நீங்க எங்கே?", translit: "neenga enge?", gloss: "where are you? (respectful)" },
        { native: "அப்பா வந்தார்", translit: "appa vandhaar", gloss: "father has come (respectful ending)" },
      ],
      checks: [{ q: "Which do you use with an older stranger?", options: ["நீங்க", "நீ", "either", "neither — drop the pronoun"], answer: "நீங்க", explain: "The plural carries the respect." }],
    },
    {
      id: "ta_g3", title: "Two Tamils: written and spoken", emoji: "🗣️",
      concept: "Tamil has a formal written form and a spoken one, and they differ enough that a learner who studies only the written language cannot follow a conversation. *நான் போகிறேன்* is written; people say *நான் போறேன்*. This course teaches the spoken form, because that is what your family speaks.",
      examples: [
        { native: "நான் போறேன்", translit: "naan poren", gloss: "I'm going (spoken)" },
        { native: "என்ன பண்றீங்க?", translit: "enna panreenga?", gloss: "what are you doing? (spoken)" },
        { native: "தெரியலை", translit: "theriyalai", gloss: "I don't know (spoken)" },
      ],
      checks: [{ q: "Why does this course teach the spoken form?", options: ["Because it is what people actually say", "Because it is easier", "Because it is more formal", "Because it is older"], answer: "Because it is what people actually say", explain: "The written form won't get you through a phone call home." }],
    },
    {
      id: "ta_g4", title: "Anna and akka — titles for strangers", emoji: "👥",
      concept: "**அண்ணா** (older brother) and **அக்கா** (older sister) are used for anyone slightly older, related or not. The shopkeeper is anna. The woman at the counter is akka. Using a bare first name where a title belongs marks you instantly as an outsider — or as rude.",
      examples: [
        { native: "அண்ணா, இது எவ்வளவு?", translit: "annaa, idhu evvalavu?", gloss: "anna, how much is this?" },
        { native: "அக்கா, உதவி செய்யுங்க", translit: "akkaa, udhavi seyyunga", gloss: "akka, please help" },
        { native: "என் அண்ணா லண்டன்ல", translit: "en annaa Londonla", gloss: "my older brother is in London" },
      ],
      checks: [{ q: "Who do you call 'anna'?", options: ["Your older brother and any man a bit older", "Only your brother", "Only relatives", "Anyone younger"], answer: "Your older brother and any man a bit older", explain: "The title goes well beyond the family." }],
    },
  ],

  // ===========================================================================
  // SOMALI
  // ===========================================================================
  so: [
    {
      id: "so_g1", title: "'waa' marks a statement", emoji: "📌",
      concept: "Somali puts **waa** in front of what it's asserting: *waa run*, it is true. It isn't a translation of 'is' so much as a marker that says 'this is a statement of fact'. Sentences that leave it out are doing something else — asking, or emphasising a different part.",
      examples: [
        { native: "Waa run", gloss: "it is true" },
        { native: "Magacaygu waa Hodan", gloss: "my name is Hodan" },
        { native: "Guriga waa weyn yahay", gloss: "the house is big" },
      ],
      checks: [{ q: "What does 'waa' do?", options: ["Marks the sentence as a statement of fact", "Makes it a question", "Marks the past", "Marks the plural"], answer: "Marks the sentence as a statement of fact", explain: "Waa run, magacaygu waa Hodan." }],
    },
    {
      id: "so_g2", title: "The article sticks to the end", emoji: "📎",
      concept: "Where English puts 'the' in front, Somali attaches it to the **end** of the noun — and the form depends on gender. *Guri* is a house; *guriga* is the house. *Naag* is a woman; *naagta* is the woman. Masculine takes -ka/-ga, feminine takes -ta/-da.",
      examples: [
        { native: "guri → guriga", gloss: "a house → the house (masculine)" },
        { native: "naag → naagta", gloss: "a woman → the woman (feminine)" },
        { native: "buug → buugga", gloss: "a book → the book" },
      ],
      checks: [{ q: "Where does 'the' go in Somali?", options: ["Attached to the end of the noun", "Before the noun", "At the end of the sentence", "It doesn't exist"], answer: "Attached to the end of the noun", explain: "guri-ga, naag-ta. Gender picks the form." }],
    },
    {
      id: "so_g3", title: "Greeting is a sequence, not a word", emoji: "🤝",
      concept: "A Somali greeting runs several exchanges — peace, health, family, then the actual business. Cutting to the point immediately reads as cold. *Nabad* (peace) runs through the whole thing: you ask about peace, you answer with peace.",
      examples: [
        { native: "Iska warran?", gloss: "how are you?" },
        { native: "Nabad baan ahay", gloss: "I am well (I am at peace)" },
        { native: "Nabad gelyo", gloss: "goodbye (go in peace)" },
      ],
      checks: [{ q: "What does Somali answer 'how are you' with?", options: ["Peace — nabad", "A mood", "A number", "Nothing"], answer: "Peace — nabad", explain: "Nabad baan ahay. Peace runs through the whole greeting." }],
    },
    {
      id: "so_g4", title: "'walaal' — everyone is a sibling", emoji: "👥",
      concept: "**Walaal** means brother or sister, and Somalis use it for each other regardless of relation. It carries an assumption of belonging that survives the diaspora: two Somalis meeting in Minneapolis or Birmingham will use it in the first sentence. Learning to use it naturally does more for you than twenty more nouns.",
      examples: [
        { native: "Walaal, i caawi", gloss: "brother/sister, help me" },
        { native: "Nabad gelyo, walaal", gloss: "goodbye, brother/sister" },
        { native: "Walaalkay London buu joogaa", gloss: "my brother lives in London" },
      ],
      checks: [{ q: "Who can you call 'walaal'?", options: ["Any Somali you meet, related or not", "Only your actual siblings", "Only elders", "Only children"], answer: "Any Somali you meet, related or not", explain: "It assumes belonging, which is exactly why it's used." }],
    },
  ],
  // ===========================================================================
  // GERMAN — cases are the thing. Everything else is negotiable.
  // ===========================================================================
  de: [
    {
      id: "de_g1",
      title: "Three genders, and why you can't skip them",
      emoji: "🔤",
      concept:
        "Every German noun is **der** (masculine), **die** (feminine) or **das** (neuter), and the gender is not guessable from the thing itself — a girl, *das Mädchen*, is neuter. This matters because the article changes shape as the noun moves around the sentence, so getting the gender wrong makes the rest of the sentence wrong too. Learn each noun WITH its article: not 'Tisch' but '**der** Tisch'.",
      examples: [
        { native: "der Tisch", translit: "dair TISH", gloss: "the table" },
        { native: "die Tür", translit: "dee TOOR", gloss: "the door" },
        { native: "das Buch", translit: "dass BOOKH", gloss: "the book" },
      ],
      checks: [
        {
          q: "Why learn the article with every noun?",
          options: [
            "Because the article changes form and drags the rest of the sentence with it",
            "Because it sounds more polite",
            "Because it's only needed in writing",
            "Because German has no plurals",
          ],
          answer: "Because the article changes form and drags the rest of the sentence with it",
          explain: "Gender decides which form the article takes in each case. Wrong gender, wrong case ending, broken sentence.",
        },
      ],
    },
    {
      id: "de_g2",
      title: "The verb goes second. Always.",
      emoji: "2️⃣",
      concept:
        "In a German main clause the conjugated verb sits in **position two** — not necessarily the second word, but the second *slot*. Put anything you like first (the subject, the time, the place) and the verb still comes straight after it, with the subject bumped along behind. This is the single most common thing English speakers get wrong, because English lets the subject keep first place.",
      examples: [
        { native: "Ich gehe heute ins Kino", translit: "ikh GAY-uh HOY-tuh ins KEE-no", gloss: "I go to the cinema today" },
        { native: "Heute gehe ich ins Kino", translit: "HOY-tuh GAY-uh ikh ins KEE-no", gloss: "today go I to the cinema" },
        { native: "Morgen kommt mein Bruder", translit: "MOR-gen komt mine BROO-der", gloss: "tomorrow comes my brother" },
      ],
      checks: [
        {
          q: "You start a sentence with 'Heute' (today). What comes next?",
          options: ["The verb", "The subject", "The object", "Another time word"],
          answer: "The verb",
          explain: "Position two belongs to the verb. 'Heute gehe ich' — not 'Heute ich gehe'.",
        },
      ],
    },
    {
      id: "de_g3",
      title: "Accusative — when der becomes den",
      emoji: "🎯",
      concept:
        "When a masculine noun is on the receiving end of the verb, **der** becomes **den**. Nothing else changes shape in the accusative — die, das and the plural stay put — so this one swap covers most of what a beginner needs. *Der Hund* bites; you see *den Hund*.",
      examples: [
        { native: "Der Mann liest ein Buch", translit: "dair MAN leest ine BOOKH", gloss: "the man reads a book (der = doing it)" },
        { native: "Ich sehe den Mann", translit: "ikh ZAY-uh dane MAN", gloss: "I see the man (den = receiving it)" },
        { native: "Ich habe einen Hund", translit: "ikh HAH-buh INE-en HOONT", gloss: "I have a dog (ein → einen)" },
      ],
      checks: [
        {
          q: "'I see the man' — which article?",
          options: ["den Mann", "der Mann", "dem Mann", "das Mann"],
          answer: "den Mann",
          explain: "The man is receiving the seeing, so masculine der becomes den.",
        },
      ],
    },
    {
      id: "de_g4",
      title: "Verbs that come apart",
      emoji: "✂️",
      concept:
        "Some German verbs have a prefix that **detaches and goes to the end of the sentence**. *Aufstehen* (to get up) becomes *ich stehe … auf*. The meaning lives in the prefix, so if you stop listening before the end of a German sentence you can miss what actually happened.",
      examples: [
        { native: "Ich stehe um sieben auf", translit: "ikh SHTAY-uh oom ZEE-ben owf", gloss: "I get up at seven (aufstehen split)" },
        { native: "Er ruft mich morgen an", translit: "air ROOFT mikh MOR-gen an", gloss: "he calls me tomorrow (anrufen split)" },
        { native: "Wir kaufen im Markt ein", translit: "veer COW-fen im MARKT ine", gloss: "we shop at the market (einkaufen split)" },
      ],
      checks: [
        {
          q: "Where does the prefix of a separable verb go?",
          options: ["To the end of the sentence", "It stays attached", "To the front", "It disappears"],
          answer: "To the end of the sentence",
          explain: "'Ich rufe dich an' — the 'an' of anrufen waits at the end.",
        },
      ],
    },
    {
      id: "de_g5",
      title: "du and Sie — getting it wrong is worse than a grammar slip",
      emoji: "🤝",
      concept:
        "**du** is for friends, family, children and anyone who has offered it. **Sie** (always capitalised) is for everyone else — colleagues, strangers, officials, older people. Using *du* with someone who expects *Sie* reads as presumptuous rather than friendly. When you don't know, use Sie and wait to be offered otherwise.",
      examples: [
        { native: "Wie geht es dir?", translit: "vee gate ess DEER", gloss: "how are you? (informal, du-form)" },
        { native: "Wie geht es Ihnen?", translit: "vee gate ess EE-nen", gloss: "how are you? (formal, Sie-form)" },
        { native: "Können Sie mir helfen?", translit: "KUR-nen zee meer HEL-fen", gloss: "can you help me? (formal)" },
      ],
      checks: [
        {
          q: "You're asking a stranger for directions. Which one?",
          options: ["Sie", "du", "either is fine", "neither — drop the pronoun"],
          answer: "Sie",
          explain: "Strangers get Sie. Waiting to be offered du is the safe move.",
        },
      ],
    },
  ],

  // ===========================================================================
  // TURKISH — looks impossible, is actually the most regular of the sixteen.
  // ===========================================================================
  tr: [
    {
      id: "tr_g1",
      title: "Words are built by stacking",
      emoji: "🧱",
      concept:
        "Turkish glues endings onto a stem, one after another, and each one adds exactly one piece of meaning. *Ev* is house; *evim* my house; *evimde* in my house; *evimdeyim* I am in my house. What English needs five words for, Turkish does with one — and the pieces never change their job.",
      examples: [
        { native: "ev", translit: "ev", gloss: "house" },
        { native: "evim", translit: "e-VIM", gloss: "my house" },
        { native: "evimde", translit: "e-vim-DE", gloss: "in my house" },
      ],
      checks: [
        {
          q: "What does Turkish do instead of using separate words like 'in' and 'my'?",
          options: [
            "Adds endings to the stem, one per meaning",
            "Changes the word order",
            "Uses tone",
            "Puts them before the noun",
          ],
          answer: "Adds endings to the stem, one per meaning",
          explain: "ev → ev-im-de. Each suffix does one job and keeps doing it.",
        },
      ],
    },
    {
      id: "tr_g2",
      title: "Vowel harmony — endings copy the word",
      emoji: "🎵",
      concept:
        "The vowel in an ending changes to match the last vowel of the word it attaches to. That is why the plural is sometimes **-ler** and sometimes **-lar**: *evler* (houses) but *kitaplar* (books). Nothing is irregular here — the ending is simply agreeing with what came before it, which is what makes Turkish sound so even.",
      examples: [
        { native: "evler", translit: "ev-LER", gloss: "houses (front vowel → -ler)" },
        { native: "kitaplar", translit: "ki-tap-LAR", gloss: "books (back vowel → -lar)" },
        { native: "günler", translit: "gyoon-LER", gloss: "days (front vowel → -ler)" },
      ],
      checks: [
        {
          q: "Why is it 'kitaplar' and not 'kitapler'?",
          options: [
            "The last vowel of the word decides which form the ending takes",
            "Because it's a foreign word",
            "Because it's plural",
            "Because it starts with k",
          ],
          answer: "The last vowel of the word decides which form the ending takes",
          explain: "Kitap has a back vowel, so the ending takes its back-vowel form: -lar.",
        },
      ],
    },
    {
      id: "tr_g3",
      title: "The verb waits until the end",
      emoji: "🔚",
      concept:
        "Turkish is **Subject–Object–Verb**: the action arrives last. *Ben elma yiyorum* is literally 'I apple am-eating'. Until you hear the end of the sentence you don't know what happened — which feels backwards at first and stops feeling that way faster than you'd expect.",
      examples: [
        { native: "Ben elma yiyorum", translit: "ben el-MA yi-YO-rum", gloss: "I am eating an apple (I apple am-eating)" },
        { native: "O kitap okuyor", translit: "o ki-TAP o-KU-yor", gloss: "he is reading a book (he book is-reading)" },
        { native: "Biz eve gidiyoruz", translit: "biz e-VE gi-di-YO-ruz", gloss: "we are going home (we home are-going)" },
      ],
      checks: [
        {
          q: "Where does the verb sit in a Turkish sentence?",
          options: ["At the end", "Second", "First", "Anywhere"],
          answer: "At the end",
          explain: "Subject, then object, then verb. The action is the last thing you hear.",
        },
      ],
    },
    {
      id: "tr_g4",
      title: "No gender, no 'the'",
      emoji: "🚫",
      concept:
        "Turkish has **no grammatical gender** and **no word for 'the'**. *O* covers he, she and it. There is nothing to memorise per noun and nothing to agree with — a genuine and unusual mercy, and one of the reasons Turkish rewards a beginner faster than its reputation suggests.",
      examples: [
        { native: "O geliyor", translit: "o ge-li-YOR", gloss: "he/she/it is coming" },
        { native: "Kitap masada", translit: "ki-TAP ma-sa-DA", gloss: "the book is on the table" },
        { native: "Bir kitap okuyorum", translit: "bir ki-TAP o-ku-YO-rum", gloss: "I am reading a book" },
      ],
      checks: [
        {
          q: "How do you say 'the' in Turkish?",
          options: ["You don't — there is no word for it", "With 'bir'", "With 'o'", "By adding -de"],
          answer: "You don't — there is no word for it",
          explain: "Turkish has no definite article. Context does the work.",
        },
      ],
    },
    {
      id: "tr_g5",
      title: "Turning anything into a question",
      emoji: "❓",
      concept:
        "To ask a yes/no question, add the separate particle **mı / mi / mu / mü** — the vowel harmonising as usual — after the thing you're asking about. Word order does not change, which is far less work than English requires.",
      examples: [
        { native: "Geliyor musun?", translit: "ge-li-YOR mu-sun", gloss: "are you coming?" },
        { native: "Bu senin mi?", translit: "boo se-NIN mi", gloss: "is this yours?" },
        { native: "Kahve ister misin?", translit: "kah-VE is-TER mi-sin", gloss: "would you like coffee?" },
      ],
      checks: [
        {
          q: "How do you make a yes/no question?",
          options: [
            "Add the mı/mi/mu/mü particle",
            "Invert subject and verb",
            "Raise your voice at the end only",
            "Put the verb first",
          ],
          answer: "Add the mı/mi/mu/mü particle",
          explain: "The particle does the whole job. Word order stays exactly as it was.",
        },
      ],
    },
  ],

  // ===========================================================================
  // INDONESIAN — famously gentle, and it really is.
  // ===========================================================================
  id: [
    {
      id: "id_g1",
      title: "No tenses — just say when",
      emoji: "⏳",
      concept:
        "Indonesian verbs **never change**. Not for past, not for future, not for who is doing it. You add a time word — *sudah* (already), *akan* (will), *sedang* (in the middle of) — or you say nothing at all and let context handle it. *Saya makan* is I eat, I ate and I will eat, depending on what's around it.",
      examples: [
        { native: "Saya makan", translit: "sa-ya MA-kan", gloss: "I eat / I ate / I'm eating" },
        { native: "Saya sudah makan", translit: "sa-ya SU-dah MA-kan", gloss: "I have already eaten" },
        { native: "Saya akan makan", translit: "sa-ya A-kan MA-kan", gloss: "I will eat" },
      ],
      checks: [
        {
          q: "How does Indonesian show that something already happened?",
          options: ["With a time word like 'sudah'", "By changing the verb", "With a suffix", "By word order"],
          answer: "With a time word like 'sudah'",
          explain: "The verb stays as it is. 'Sudah' does the tense work.",
        },
      ],
    },
    {
      id: "id_g2",
      title: "Plurals by saying it twice",
      emoji: "👥",
      concept:
        "Indonesian usually leaves nouns alone — *buku* is book or books. When you genuinely need to stress plurality, you **repeat the word**: *buku-buku*, books. Most of the time a number or context makes it obvious and the repetition is unnecessary.",
      examples: [
        { native: "buku", translit: "BU-ku", gloss: "book / books" },
        { native: "buku-buku", translit: "BU-ku BU-ku", gloss: "books (explicitly plural)" },
        { native: "dua buku", translit: "DU-a BU-ku", gloss: "two books (no repetition needed)" },
      ],
      checks: [
        {
          q: "You've said 'dua' (two). Do you repeat the noun?",
          options: ["No — the number already makes it plural", "Yes, always", "Only in writing", "Only for people"],
          answer: "No — the number already makes it plural",
          explain: "Repetition is for when nothing else signals plural. With a number it's redundant.",
        },
      ],
    },
    {
      id: "id_g3",
      title: "Word order like English",
      emoji: "➡️",
      concept:
        "Indonesian is **Subject–Verb–Object**, the same shape as English, so you can build sentences from day one without rearranging your thinking. The one difference worth knowing early: adjectives come **after** the noun. Not 'big house' but *rumah besar*, house big.",
      examples: [
        { native: "Saya minum kopi", translit: "sa-ya MI-num KO-pi", gloss: "I drink coffee" },
        { native: "rumah besar", translit: "RU-mah be-SAR", gloss: "big house (house big)" },
        { native: "Dia membaca buku", translit: "di-a mem-BA-ca BU-ku", gloss: "he reads a book" },
      ],
      checks: [
        {
          q: "Where does the adjective go?",
          options: ["After the noun", "Before the noun", "At the end of the sentence", "Either way"],
          answer: "After the noun",
          explain: "rumah besar, air panas — the noun first, then what it's like.",
        },
      ],
    },
    {
      id: "id_g4",
      title: "The me- and ber- prefixes",
      emoji: "🔧",
      concept:
        "Indonesian builds verbs from roots with prefixes. **me-** usually makes a verb that acts on something (*baca* read → *membaca* to read something); **ber-** usually makes one that doesn't (*kerja* work → *bekerja* to work). In everyday speech people often drop them, so you'll hear both.",
      examples: [
        { native: "membaca", translit: "mem-BA-ca", gloss: "to read (something)" },
        { native: "bekerja", translit: "be-KER-ja", gloss: "to work" },
        { native: "berbicara", translit: "ber-bi-CA-ra", gloss: "to speak" },
      ],
      checks: [
        {
          q: "What does the ber- prefix usually signal?",
          options: [
            "A verb that doesn't act on an object",
            "Past tense",
            "Plural",
            "A question",
          ],
          answer: "A verb that doesn't act on an object",
          explain: "bekerja (to work), berbicara (to speak) — no object needed.",
        },
      ],
    },
  ],

  // ===========================================================================
  // PUNJABI — Shahmukhi, same shape as Urdu with its own machinery.
  // ===========================================================================
  pa: [
    {
      id: "pa_g1",
      title: "The verb comes last",
      emoji: "🔚",
      concept:
        "Punjabi is **Subject–Object–Verb**. *میں روٹی کھاندا آں* is literally 'I bread eat-am'. English speakers usually find this the hardest habit to build, because you have to hold the whole thought until the end — but every Punjabi sentence works this way, so it becomes automatic sooner than you think.",
      examples: [
        { native: "میں روٹی کھاندا آں", translit: "main roti khanda aan", gloss: "I eat bread (I bread eat-am)" },
        { native: "او کتاب پڑھدا اے", translit: "oh kitaab parhda ae", gloss: "he reads a book (he book reads-is)" },
        { native: "اسیں گھر جانے آں", translit: "asin ghar jaane aan", gloss: "we go home (we home go-are)" },
      ],
      checks: [
        {
          q: "Where does the verb sit?",
          options: ["At the end", "Second", "First", "Before the object"],
          answer: "At the end",
          explain: "Subject, object, then the verb. The action closes the sentence.",
        },
      ],
    },
    {
      id: "pa_g2",
      title: "Postpositions — 'in' comes after",
      emoji: "📍",
      concept:
        "Where English puts a preposition in front — *in* the house — Punjabi puts it **after**: *گھر وچ*, house-in. They are called postpositions for exactly that reason. Once you expect them at the back, the word order stops feeling scrambled.",
      examples: [
        { native: "گھر وچ", translit: "ghar wich", gloss: "in the house (house in)" },
        { native: "میز تے", translit: "mez te", gloss: "on the table (table on)" },
        { native: "میرے نال", translit: "mere naal", gloss: "with me (me with)" },
      ],
      checks: [
        {
          q: "How do you say 'in the house'?",
          options: ["house + in", "in + house", "either order", "with a prefix"],
          answer: "house + in",
          explain: "گھر وچ — the noun first, the postposition after it.",
        },
      ],
    },
    {
      id: "pa_g3",
      title: "The verb agrees with gender",
      emoji: "⚥",
      concept:
        "Punjabi verbs and adjectives change shape depending on whether the subject is masculine or feminine. A man says *میں کھاندا آں*; a woman says *میں کھاندی آں*. The ending is doing the agreeing, so this is one of the first places a learner is heard to be guessing.",
      examples: [
        { native: "میں کھاندا آں", translit: "main khanda aan", gloss: "I eat (man speaking)" },
        { native: "میں کھاندی آں", translit: "main khandi aan", gloss: "I eat (woman speaking)" },
        { native: "او جاندی اے", translit: "oh jaandi ae", gloss: "she goes" },
      ],
      checks: [
        {
          q: "A woman says 'I eat'. Which form?",
          options: ["کھاندی", "کھاندا", "either", "کھاندے"],
          answer: "کھاندی",
          explain: "The feminine ending -i agrees with the speaker.",
        },
      ],
    },
    {
      id: "pa_g4",
      title: "Respect is built into the plural",
      emoji: "🙏",
      concept:
        "Punjabi shows respect by using the **plural form for one person**. *تسیں* rather than *توں* for 'you', and plural verb endings to match. Using the singular with an elder is not casual, it is rude — and this is the single clearest sign of a learner who has only met the language in a textbook.",
      examples: [
        { native: "توں کتھے ایں؟", translit: "toon kithe ain?", gloss: "where are you? (to a friend)" },
        { native: "تسیں کتھے او؟", translit: "tusin kithe o?", gloss: "where are you? (respectful)" },
        { native: "بابا جی آ گئے نیں", translit: "baba ji aa gaye nen", gloss: "grandfather has come (plural for respect)" },
      ],
      checks: [
        {
          q: "How do you speak respectfully to one older person?",
          options: [
            "Use the plural form",
            "Use the singular form",
            "Add a suffix to the noun",
            "Change the word order",
          ],
          answer: "Use the plural form",
          explain: "تسیں and plural verb endings, even for one person.",
        },
      ],
    },
  ],

  // ===========================================================================
  // NIGERIAN PIDGIN — a real grammar, and a very economical one.
  // ===========================================================================
  pcm: [
    {
      id: "pcm_g1",
      title: "Verbs never change",
      emoji: "🧊",
      concept:
        "Nigerian Pidgin verbs have **one form**. No -s, no -ed, no irregulars. *I go*, *she go*, *dem go* — the verb sits still and small separate words carry the tense. This is a real grammatical system, not broken English, and it is why Pidgin is so quick to start speaking.",
      examples: [
        { native: "I go market", translit: "I go market", gloss: "I go / went to the market" },
        { native: "She go market", translit: "she go market", gloss: "she goes to the market" },
        { native: "Dem go market", translit: "dem go market", gloss: "they go to the market" },
      ],
      checks: [
        {
          q: "How does the verb change for 'she'?",
          options: ["It doesn't change at all", "Add -s", "Add -am", "Change to past form"],
          answer: "It doesn't change at all",
          explain: "One form for every subject. The work is done elsewhere.",
        },
      ],
    },
    {
      id: "pcm_g2",
      title: "'dey' means it's happening",
      emoji: "🔄",
      concept:
        "Put **dey** in front of a verb and the action is ongoing — the equivalent of English *-ing*. *I chop* is I eat; *I dey chop* is I am eating. On its own, *dey* also means 'to be' in a place or state: *I dey house*, I'm at home.",
      examples: [
        { native: "I dey chop", translit: "I dey chop", gloss: "I am eating" },
        { native: "She dey come", translit: "she dey come", gloss: "she is coming" },
        { native: "I dey house", translit: "I dey house", gloss: "I am at home" },
      ],
      checks: [
        {
          q: "What does 'dey' add to a verb?",
          options: ["That it's happening now / ongoing", "That it's finished", "That it's negative", "That it's a question"],
          answer: "That it's happening now / ongoing",
          explain: "I dey work = I am working. It is the -ing of Pidgin.",
        },
      ],
    },
    {
      id: "pcm_g3",
      title: "'don' means it's finished",
      emoji: "✅",
      concept:
        "**don** before a verb marks a completed action — English *have/has*. *I don chop* is I have eaten. Pair it with *dey* in your head as the two halves of the tense system: *dey* for still happening, *don* for done.",
      examples: [
        { native: "I don chop", translit: "I don chop", gloss: "I have eaten" },
        { native: "She don go", translit: "she don go", gloss: "she has gone" },
        { native: "We don finish", translit: "we don finish", gloss: "we have finished" },
      ],
      checks: [
        {
          q: "'I have eaten' in Pidgin?",
          options: ["I don chop", "I dey chop", "I chop don", "I go chop"],
          answer: "I don chop",
          explain: "don marks it as completed; dey would mean you're still eating.",
        },
      ],
    },
    {
      id: "pcm_g4",
      title: "'na' points at things",
      emoji: "👉",
      concept:
        "**na** is the 'it is' of Pidgin — it identifies or emphasises. *Na me* is it's me. *Na wetin?* is what is it? It's also how you put weight on a word: *Na today you come?* — it's TODAY you're coming?",
      examples: [
        { native: "Na me", translit: "na me", gloss: "it's me" },
        { native: "My name na Ada", translit: "my name na Ada", gloss: "my name is Ada" },
        { native: "Na wetin be dis?", translit: "na wetin be dis", gloss: "what is this?" },
      ],
      checks: [
        {
          q: "What job does 'na' do?",
          options: ["Identifies or emphasises — 'it is'", "Marks the past", "Makes a question", "Marks a plural"],
          answer: "Identifies or emphasises — 'it is'",
          explain: "Na me, na today, my name na Ada.",
        },
      ],
    },
  ],

  // ===========================================================================
  // TAGALOG — markers and focus, which is where every learner stalls.
  // ===========================================================================
  tl: [
    {
      id: "tl_g1",
      title: "po — the word that makes it respectful",
      emoji: "🙏",
      concept:
        "**po** carries no meaning of its own. Drop it anywhere in a sentence and the whole thing becomes respectful. Say *Salamat* to a friend and *Salamat po* to your grandmother, a stranger, anyone older than you. There is no English equivalent, nothing to translate it as, and leaving it out is the clearest marker of someone who learned Tagalog from a book rather than from people.",
      examples: [
        { native: "Salamat po", translit: "sa-la-mat po", gloss: "thank you (respectfully)" },
        { native: "Opo", translit: "o-po", gloss: "yes (respectfully)" },
        { native: "Hindi po ako galit", translit: "hin-di po a-ko ga-lit", gloss: "I am not angry (respectfully)" },
      ],
      checks: [
        {
          q: "What does 'po' actually mean?",
          options: [
            "Nothing on its own — it makes the sentence respectful",
            "Yes",
            "Please",
            "Thank you",
          ],
          answer: "Nothing on its own — it makes the sentence respectful",
          explain: "It has no translation. It changes the register of everything around it.",
        },
      ],
    },
    {
      id: "tl_g2",
      title: "ang and ng — what the sentence is about",
      emoji: "🎯",
      concept:
        "Tagalog marks nouns with little words instead of relying on order. **ang** points at what the sentence is centred on; **ng** (said 'nang') marks the other participant. *Kinain ng bata ang mangga* — the mango is what we're talking about, the child did the eating. Get these two the wrong way round and the sentence says something else entirely.",
      examples: [
        { native: "Kumain ang bata", translit: "ku-ma-in ang ba-ta", gloss: "the child ate (child is the focus)" },
        { native: "Kinain ng bata ang mangga", translit: "ki-na-in nang ba-ta ang mang-ga", gloss: "the child ate the mango (mango is the focus)" },
        { native: "Maganda ang bahay", translit: "ma-gan-da ang ba-hay", gloss: "the house is beautiful" },
      ],
      checks: [
        {
          q: "What does 'ang' mark?",
          options: [
            "What the sentence is centred on",
            "The past tense",
            "A question",
            "The plural",
          ],
          answer: "What the sentence is centred on",
          explain: "ang points at the focus. ng marks the other participant.",
        },
      ],
    },
    {
      id: "tl_g3",
      title: "The verb changes to match the focus",
      emoji: "🔀",
      concept:
        "This is the part that makes Tagalog feel unlike European languages. The **verb itself changes shape** depending on which participant the sentence is about — not who is doing it, but what is in focus. *Kumain* centres the eater; *kinain* centres the thing eaten. Same event, different sentence subject, different verb.",
      examples: [
        { native: "Kumain ako ng mangga", translit: "ku-ma-in a-ko nang mang-ga", gloss: "I ate a mango (I am the focus)" },
        { native: "Kinain ko ang mangga", translit: "ki-na-in ko ang mang-ga", gloss: "I ate the mango (the mango is the focus)" },
        { native: "Binili ko ang libro", translit: "bi-ni-li ko ang lib-ro", gloss: "I bought the book (the book is the focus)" },
      ],
      checks: [
        {
          q: "Why do 'kumain' and 'kinain' differ?",
          options: [
            "They centre different participants in the same event",
            "One is past, one is future",
            "One is polite",
            "One is plural",
          ],
          answer: "They centre different participants in the same event",
          explain: "kumain focuses the eater; kinain focuses the thing eaten.",
        },
      ],
    },
    {
      id: "tl_g4",
      title: "The linker: na and -ng",
      emoji: "🔗",
      concept:
        "When you join a describing word to a noun, Tagalog needs a **linker**. After a consonant it's *na*; after a vowel it attaches as *-ng*. *Magandang babae* (beautiful woman) is *maganda* + *-ng* + *babae*. Leave the linker out and it sounds like two separate words rather than one description.",
      examples: [
        { native: "magandang babae", translit: "ma-gan-dang ba-ba-e", gloss: "beautiful woman (maganda + -ng)" },
        { native: "malaking bahay", translit: "ma-la-king ba-hay", gloss: "big house" },
        { native: "mabait na tao", translit: "ma-ba-it na ta-o", gloss: "kind person (consonant → na)" },
      ],
      checks: [
        {
          q: "The word ends in a vowel. Which linker?",
          options: ["-ng attached to the word", "na as a separate word", "no linker needed", "po"],
          answer: "-ng attached to the word",
          explain: "maganda → magandang. After a consonant you'd use 'na' instead.",
        },
      ],
    },
  ],

  // ===========================================================================
  // PERSIAN — gentler than the script makes it look.
  // ===========================================================================
  fa: [
    {
      id: "fa_g1",
      title: "No gender, anywhere",
      emoji: "🚫",
      concept:
        "Persian has **no grammatical gender**. *او* is he and she. Nouns have no gender, adjectives don't agree, verbs don't change for it. For anyone arriving from French, Spanish, Arabic or Urdu, this removes a whole layer of memorisation at once.",
      examples: [
        { native: "او آمد", translit: "u âmad", gloss: "he came / she came" },
        { native: "او معلم است", translit: "u moallem ast", gloss: "he/she is a teacher" },
        { native: "دوست خوب", translit: "dust-e khub", gloss: "a good friend (no agreement)" },
      ],
      checks: [
        {
          q: "How do you say 'she came' as opposed to 'he came'?",
          options: [
            "The same way — Persian has no gender",
            "Change the verb ending",
            "Add a feminine marker",
            "Change the pronoun",
          ],
          answer: "The same way — Persian has no gender",
          explain: "او آمد covers both. Context tells you which.",
        },
      ],
    },
    {
      id: "fa_g2",
      title: "Ezafe — the little -e that links everything",
      emoji: "🔗",
      concept:
        "Persian joins a noun to what describes or owns it with an **ezafe**: an unwritten *-e* sound after the first word. *کتاب من* is said *ketâb-e man*, book-of me. It is almost never written down, so you have to hear it — and it is everywhere, in names, addresses and every possessive.",
      examples: [
        { native: "کتاب من", translit: "ketâb-e man", gloss: "my book (book-of me)" },
        { native: "خانه‌ی بزرگ", translit: "khâne-ye bozorg", gloss: "big house (house-of big)" },
        { native: "مادر علی", translit: "mâdar-e Ali", gloss: "Ali's mother (mother-of Ali)" },
      ],
      checks: [
        {
          q: "What does the ezafe do?",
          options: [
            "Links a noun to what describes or owns it",
            "Marks the past tense",
            "Makes a question",
            "Marks the plural",
          ],
          answer: "Links a noun to what describes or owns it",
          explain: "ketâb-e man, khâne-ye bozorg. It's a sound, rarely written.",
        },
      ],
    },
    {
      id: "fa_g3",
      title: "The verb waits at the end",
      emoji: "🔚",
      concept:
        "Persian is **Subject–Object–Verb**. *من نان می‌خورم* is 'I bread eat'. Like Turkish, Punjabi and Urdu, you hold the sentence until the action arrives — which also means the most important word is the last one you say.",
      examples: [
        { native: "من نان می‌خورم", translit: "man nân mikhoram", gloss: "I eat bread (I bread eat)" },
        { native: "او کتاب می‌خواند", translit: "u ketâb mikhânad", gloss: "he reads a book" },
        { native: "ما به خانه می‌رویم", translit: "mâ be khâne miravim", gloss: "we go home" },
      ],
      checks: [
        {
          q: "Where does the verb go?",
          options: ["At the end", "Second", "First", "Before the object"],
          answer: "At the end",
          explain: "Subject, object, verb — the action lands last.",
        },
      ],
    },
    {
      id: "fa_g4",
      title: "شما and تو — respect is not optional",
      emoji: "🤝",
      concept:
        "**تو** is for close friends, children and family. **شما** is for everyone else, and it also serves as the plural. Persian carries a strong culture of politeness — *taarof* — and using *تو* with someone who expects *شما* is a real misstep rather than a friendly shortcut. When you don't know, use شما.",
      examples: [
        { native: "تو کجایی؟", translit: "to kojâyi?", gloss: "where are you? (to a friend)" },
        { native: "شما کجایید؟", translit: "shomâ kojâyid?", gloss: "where are you? (respectful)" },
        { native: "حال شما چطوره؟", translit: "hâl-e shomâ chetore?", gloss: "how are you? (respectful)" },
      ],
      checks: [
        {
          q: "You're speaking to someone older you've just met. Which?",
          options: ["شما", "تو", "either", "neither — drop the pronoun"],
          answer: "شما",
          explain: "شما for anyone outside close friends and family.",
        },
      ],
    },
    {
      id: "fa_g5",
      title: "می‌ makes it habitual or ongoing",
      emoji: "🔄",
      concept:
        "The prefix **می‌** on a verb marks something as ongoing or habitual — the difference between 'I ate' and 'I eat / I am eating'. *خوردم* is I ate; *می‌خورم* is I eat. One small prefix carries what English needs a whole tense for.",
      examples: [
        { native: "می‌خورم", translit: "mikhoram", gloss: "I eat / I am eating" },
        { native: "خوردم", translit: "khordam", gloss: "I ate" },
        { native: "می‌روم", translit: "miravam", gloss: "I go / I am going" },
      ],
      checks: [
        {
          q: "What does می‌ add?",
          options: [
            "That the action is ongoing or habitual",
            "That it's finished",
            "Respect",
            "A question",
          ],
          answer: "That the action is ongoing or habitual",
          explain: "خوردم (I ate) → می‌خورم (I eat / am eating).",
        },
      ],
    },
  ],
};
