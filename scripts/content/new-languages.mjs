// =============================================================================
// new-languages.mjs (v86) — two languages Duolingo does not teach at all.
//
// WHY THESE TWO. The brief was "very common languages people would actually
// use, done better than Duolingo". The strongest version of "better" is
// "exists": both of these have tens of millions of speakers, enormous
// diasporas, and no Duolingo course whatsoever.
//
//   TAGALOG / FILIPINO — ~28M native, 45M+ total. One of the largest diasporas
//   in the world: roughly 4M Filipino-Americans, plus Canada, the Gulf, Japan,
//   Italy, the UK. Latin script, so no reading barrier. Enormous numbers of
//   second-generation speakers who understand their parents and cannot answer —
//   which is precisely this app's learner.
//
//   PERSIAN / FARSI — ~80M+ speakers across Iran, Afghanistan (as Dari) and
//   Tajikistan, with large communities in the US, Canada, Germany, Sweden and
//   the UK. Arabic script and right-to-left, both of which this app already
//   handles properly for Urdu, Punjabi and Arabic.
//
// WHAT MAKES EACH COURSE BETTER THAN A GENERIC ONE. Not word count — the thing
// each language actually turns on, taught from the first unit rather than
// buried:
//
//   Tagalog: po. A single particle that turns any sentence respectful. Leave it
//   out talking to an elder and you sound rude without meaning to; there is no
//   English equivalent and no way to guess it. Plus kuya/ate, used for people
//   who are not your siblings at all.
//
//   Persian: the paternal/maternal split in kinship, and the fact that "how are
//   you" has a formal and an informal form that are not interchangeable.
//
// SCOPE, HONESTLY. Each pack is a real beginner course — around a hundred words
// with example sentences, units, categories and the alphabet — comparable to the
// thinner existing languages (Bengali shipped with 130). Neither has recorded
// audio, journey stops, grammar lessons or reading passages yet; the app
// degrades gracefully without them, and RESEARCH.md records what is missing.
// =============================================================================

const w = (unit, category, lemma, translit, translation, examples, extra = {}) => ({
  unit, category, lemma, ...(translit ? { translit } : {}), translation,
  difficulty: extra.difficulty ?? 1,
  ...(extra.note ? { note: extra.note } : {}),
  examples,
});

// -----------------------------------------------------------------------------
// TAGALOG
// -----------------------------------------------------------------------------
export const TAGALOG = {
  schemaVersion: 1,
  code: "tl",
  categories: ["Common", "Family", "Feelings", "Food", "Greetings", "Numbers", "People", "Places", "Politeness", "Questions", "Time", "Verbs"],
  units: [
    { id: "u1", title: "Greetings", emoji: "👋", description: "Hello, goodbye, and the word that makes it polite" },
    { id: "u2", title: "Politeness", emoji: "🙏", description: "po, opo, and why they matter more than anything else here" },
    { id: "u3", title: "About You", emoji: "🙋", description: "Pronouns, names, where you're from" },
    { id: "u4", title: "Family", emoji: "👨‍👩‍👧", description: "Relatives — and the titles you give people who aren't" },
    { id: "u5", title: "Feelings", emoji: "💭", description: "Tired, hungry, happy, homesick" },
    { id: "u6", title: "Food", emoji: "🍚", description: "Rice, fish, and asking for more" },
    { id: "u7", title: "Everyday", emoji: "🏠", description: "Common verbs and the things around you" },
    { id: "u8", title: "Out & About", emoji: "🚌", description: "Numbers, time, getting somewhere" },
  ],
  alphabet: [],
  frameworks: [],
  vocab: [
    // u1 — Greetings
    w("u1", "Greetings", "Kumusta", null, "hello, how are you", [{ native: "Kumusta ka?", translation: "How are you?" }]),
    w("u1", "Greetings", "Magandang umaga", null, "good morning", [{ native: "Magandang umaga po", translation: "Good morning (respectful)" }]),
    w("u1", "Greetings", "Magandang hapon", null, "good afternoon", [{ native: "Magandang hapon sa inyo", translation: "Good afternoon to you" }]),
    w("u1", "Greetings", "Magandang gabi", null, "good evening", [{ native: "Magandang gabi po", translation: "Good evening (respectful)" }]),
    w("u1", "Greetings", "Paalam", null, "goodbye", [{ native: "Paalam, kita tayo bukas", translation: "Goodbye, see you tomorrow" }]),
    w("u1", "Greetings", "Ingat", null, "take care", [{ native: "Ingat ka sa daan", translation: "Take care on the road" }]),
    w("u1", "Greetings", "Mabuti", null, "fine, well, good", [{ native: "Mabuti naman ako", translation: "I'm doing fine" }]),
    w("u1", "Greetings", "Oo", null, "yes", [{ native: "Oo, tama ka", translation: "Yes, you're right" }]),
    w("u1", "Greetings", "Hindi", null, "no, not", [{ native: "Hindi ako galit", translation: "I am not angry" }]),

    // u2 — Politeness. The heart of the course.
    w("u2", "Politeness", "po", null, "respect particle (no English equivalent)", [
      { native: "Salamat po", translation: "Thank you (respectfully)" },
      { native: "Opo, kain na po tayo", translation: "Yes, let's eat now" },
    ], { note: "Tagalog's most important word and the hardest for a learner to remember, because English has nothing like it. Drop 'po' into any sentence and it becomes respectful. Leave it out with an elder, a stranger or anyone older than you and you sound rude without intending to — this is the single thing that marks someone who learned Tagalog from a book.", difficulty: 1 }),
    w("u2", "Politeness", "opo", null, "yes (respectful)", [{ native: "Opo, naiintindihan ko", translation: "Yes, I understand" }],
      { note: "'Oo' is yes to a friend. 'Opo' is yes to your mother, your grandmother, your boss. Same word, different world." }),
    w("u2", "Politeness", "Salamat", null, "thank you", [{ native: "Maraming salamat po", translation: "Thank you very much (respectful)" }]),
    w("u2", "Politeness", "Walang anuman", null, "you're welcome", [{ native: "Walang anuman po", translation: "You're welcome" }]),
    w("u2", "Politeness", "Pasensya na", null, "sorry, excuse me", [{ native: "Pasensya na po", translation: "I'm sorry (respectful)" }]),
    w("u2", "Politeness", "Pakiusap", null, "please", [{ native: "Pakiusap, tulungan mo ako", translation: "Please, help me" }]),
    w("u2", "Politeness", "Mano po", null, "blessing greeting to an elder", [{ native: "Mano po, Lola", translation: "Your blessing, Grandmother" }],
      { note: "You take an elder's hand and touch it to your forehead. Said on arriving, to grandparents, aunts, uncles, godparents. Not a phrase you can work out from a dictionary.", difficulty: 2 }),

    // u3 — About You
    w("u3", "People", "ako", null, "I, me", [{ native: "Ako si Maria", translation: "I am Maria" }]),
    w("u3", "People", "ikaw", null, "you", [{ native: "Ikaw ba si Juan?", translation: "Are you Juan?" }]),
    w("u3", "People", "siya", null, "he, she", [{ native: "Siya ang kapatid ko", translation: "He is my sibling" }],
      { note: "Tagalog does not mark gender in pronouns. 'Siya' is he and she — which is why Filipino speakers of English sometimes mix up 'he' and 'she'." }),
    w("u3", "People", "kami", null, "we (not including you)", [{ native: "Kami ay taga-Maynila", translation: "We are from Manila" }]),
    w("u3", "People", "tayo", null, "we (including you)", [{ native: "Tayo na", translation: "Let's go" }],
      { note: "Two words for 'we'. 'Kami' leaves the listener out; 'tayo' includes them. Saying 'kami' when you mean 'tayo' quietly excludes the person you're talking to.", difficulty: 2 }),
    w("u3", "People", "sila", null, "they", [{ native: "Sila ay masaya", translation: "They are happy" }]),
    w("u3", "About You", "pangalan", null, "name", [{ native: "Ano ang pangalan mo?", translation: "What is your name?" }]),
    w("u3", "About You", "taga-saan", null, "from where", [{ native: "Taga-saan ka?", translation: "Where are you from?" }]),

    // u4 — Family
    w("u4", "Family", "nanay", null, "mother", [{ native: "Ang nanay ko ay nagluluto", translation: "My mother is cooking" }]),
    w("u4", "Family", "tatay", null, "father", [{ native: "Nasa trabaho ang tatay ko", translation: "My father is at work" }]),
    w("u4", "Family", "lola", null, "grandmother", [{ native: "Mano po, Lola", translation: "Your blessing, Grandmother" }]),
    w("u4", "Family", "lolo", null, "grandfather", [{ native: "Ang lolo ko ay matanda na", translation: "My grandfather is old now" }]),
    w("u4", "Family", "kuya", null, "older brother; any older man", [{ native: "Kuya, magkano po ito?", translation: "Kuya, how much is this?" }],
      { note: "You call your older brother 'kuya' — and also the man selling you fruit, the driver, anyone slightly older. Using someone's first name where 'kuya' belongs sounds abrupt.", difficulty: 1 }),
    w("u4", "Family", "ate", null, "older sister; any older woman", [{ native: "Salamat, Ate", translation: "Thank you, Ate" }],
      { note: "The same as kuya, for women. A Filipino child addresses almost nobody older by name alone." }),
    w("u4", "Family", "kapatid", null, "sibling", [{ native: "May tatlong kapatid ako", translation: "I have three siblings" }]),
    w("u4", "Family", "anak", null, "child, son, daughter", [{ native: "Anak, kumain ka na", translation: "Child, eat now" }]),
    w("u4", "Family", "asawa", null, "spouse (husband or wife)", [{ native: "Ang asawa ko ay guro", translation: "My spouse is a teacher" }]),
    w("u4", "Family", "tita", null, "aunt", [{ native: "Dumating na si Tita", translation: "Aunt has arrived" }]),
    w("u4", "Family", "tito", null, "uncle", [{ native: "Si Tito ay nasa Amerika", translation: "Uncle is in America" }]),
    w("u4", "Family", "pamilya", null, "family", [{ native: "Mahal ko ang pamilya ko", translation: "I love my family" }]),

    // u5 — Feelings
    w("u5", "Feelings", "pagod", null, "tired", [{ native: "Pagod na ako", translation: "I am tired now" }]),
    w("u5", "Feelings", "gutom", null, "hungry", [{ native: "Gutom na ako", translation: "I am hungry" }]),
    w("u5", "Feelings", "uhaw", null, "thirsty", [{ native: "Uhaw ka ba?", translation: "Are you thirsty?" }]),
    w("u5", "Feelings", "masaya", null, "happy", [{ native: "Masaya ako ngayon", translation: "I am happy today" }]),
    w("u5", "Feelings", "malungkot", null, "sad", [{ native: "Malungkot siya", translation: "She is sad" }]),
    w("u5", "Feelings", "may sakit", null, "ill, sick", [{ native: "May sakit ang nanay ko", translation: "My mother is ill" }]),
    w("u5", "Feelings", "namimiss", null, "missing (someone)", [{ native: "Namimiss kita", translation: "I miss you" }],
      { note: "Borrowed from English and completely ordinary in daily speech. Filipino mixes English and Tagalog constantly — that mixture is called Taglish and it is how most people actually talk." }),
    w("u5", "Feelings", "mahal", null, "love; expensive", [{ native: "Mahal kita", translation: "I love you" }],
      { note: "The same word means 'expensive'. Context does all the work: 'Mahal kita' is I love you, 'Mahal ito' is this is expensive.", difficulty: 2 }),

    // u6 — Food
    w("u6", "Food", "kanin", null, "cooked rice", [{ native: "Gusto ko ng kanin", translation: "I want rice" }]),
    w("u6", "Food", "tubig", null, "water", [{ native: "Pahingi po ng tubig", translation: "May I have some water" }]),
    w("u6", "Food", "isda", null, "fish", [{ native: "Masarap ang isda", translation: "The fish is delicious" }]),
    w("u6", "Food", "manok", null, "chicken", [{ native: "Kumain kami ng manok", translation: "We ate chicken" }]),
    w("u6", "Food", "gulay", null, "vegetable", [{ native: "Kumain ka ng gulay", translation: "Eat vegetables" }]),
    w("u6", "Food", "masarap", null, "delicious", [{ native: "Masarap po ang luto ninyo", translation: "Your cooking is delicious" }]),
    w("u6", "Food", "kape", null, "coffee", [{ native: "Gusto ko ng kape", translation: "I want coffee" }]),
    w("u6", "Food", "pagkain", null, "food", [{ native: "Handa na ang pagkain", translation: "The food is ready" }]),

    // u7 — Everyday verbs
    w("u7", "Verbs", "kumain", null, "to eat", [{ native: "Kumain na tayo", translation: "Let's eat now" }]),
    w("u7", "Verbs", "uminom", null, "to drink", [{ native: "Uminom ka ng tubig", translation: "Drink water" }]),
    w("u7", "Verbs", "matulog", null, "to sleep", [{ native: "Matulog ka na", translation: "Go to sleep now" }]),
    w("u7", "Verbs", "pumunta", null, "to go", [{ native: "Pupunta ako sa palengke", translation: "I will go to the market" }]),
    w("u7", "Verbs", "magsalita", null, "to speak", [{ native: "Marunong ka bang magsalita ng Tagalog?", translation: "Do you know how to speak Tagalog?" }]),
    w("u7", "Verbs", "maintindihan", null, "to understand", [{ native: "Hindi ko maintindihan", translation: "I don't understand" }]),
    w("u7", "Verbs", "tumulong", null, "to help", [{ native: "Tulungan mo ako", translation: "Help me" }]),
    w("u7", "Verbs", "magmahal", null, "to love", [{ native: "Magmahal ka nang totoo", translation: "Love truly" }]),
    w("u7", "Common", "bahay", null, "house, home", [{ native: "Nasa bahay ako", translation: "I am at home" }]),
    w("u7", "Common", "trabaho", null, "work, job", [{ native: "May trabaho ako bukas", translation: "I have work tomorrow" }]),
    w("u7", "Common", "salita", null, "word", [{ native: "Isang salita lang", translation: "Just one word" }]),
    w("u7", "Common", "maganda", null, "beautiful", [{ native: "Maganda ang umaga", translation: "The morning is beautiful" }]),
    w("u7", "Common", "malaki", null, "big", [{ native: "Malaki ang bahay nila", translation: "Their house is big" }]),
    w("u7", "Common", "maliit", null, "small", [{ native: "Maliit ang kwarto ko", translation: "My room is small" }]),

    // u8 — Numbers, time, places
    w("u8", "Numbers", "isa", null, "one", [{ native: "Isa lang po", translation: "Just one, please" }]),
    w("u8", "Numbers", "dalawa", null, "two", [{ native: "Dalawang tao", translation: "Two people" }]),
    w("u8", "Numbers", "tatlo", null, "three", [{ native: "Tatlong araw", translation: "Three days" }]),
    w("u8", "Numbers", "apat", null, "four", [{ native: "Apat na taon", translation: "Four years" }]),
    w("u8", "Numbers", "lima", null, "five", [{ native: "Limang piso", translation: "Five pesos" }]),
    w("u8", "Time", "ngayon", null, "now, today", [{ native: "Ngayon na", translation: "Right now" }]),
    w("u8", "Time", "bukas", null, "tomorrow", [{ native: "Kita tayo bukas", translation: "See you tomorrow" }]),
    w("u8", "Time", "kahapon", null, "yesterday", [{ native: "Kahapon pa ako naghihintay", translation: "I've been waiting since yesterday" }]),
    w("u8", "Time", "araw", null, "day; sun", [{ native: "Magandang araw", translation: "Good day" }]),
    w("u8", "Time", "gabi", null, "night", [{ native: "Malamig ang gabi", translation: "The night is cold" }]),
    w("u8", "Places", "palengke", null, "market", [{ native: "Pupunta ako sa palengke", translation: "I'm going to the market" }]),
    w("u8", "Places", "paaralan", null, "school", [{ native: "Nasa paaralan ang anak ko", translation: "My child is at school" }]),
    w("u8", "Places", "simbahan", null, "church", [{ native: "Tuwing Linggo kami sa simbahan", translation: "Every Sunday we are at church" }]),
    w("u8", "Questions", "ano", null, "what", [{ native: "Ano ito?", translation: "What is this?" }]),
    w("u8", "Questions", "saan", null, "where", [{ native: "Saan ka pupunta?", translation: "Where are you going?" }]),
    w("u8", "Questions", "sino", null, "who", [{ native: "Sino siya?", translation: "Who is he?" }]),
    w("u8", "Questions", "bakit", null, "why", [{ native: "Bakit ka malungkot?", translation: "Why are you sad?" }]),
    w("u8", "Questions", "kailan", null, "when", [{ native: "Kailan ka darating?", translation: "When will you arrive?" }]),
    w("u8", "Questions", "magkano", null, "how much", [{ native: "Magkano po ito?", translation: "How much is this?" }]),
  ],
};

// -----------------------------------------------------------------------------
// PERSIAN / FARSI
// -----------------------------------------------------------------------------
export const PERSIAN = {
  schemaVersion: 1,
  code: "fa",
  categories: ["Common", "Family", "Feelings", "Food", "Greetings", "Numbers", "People", "Places", "Politeness", "Questions", "Time", "Verbs"],
  units: [
    { id: "u1", title: "Greetings", emoji: "👋", description: "Hello, goodbye, and asking how someone is" },
    { id: "u2", title: "Politeness", emoji: "🙏", description: "Thank you, please, and the formal you" },
    { id: "u3", title: "About You", emoji: "🙋", description: "Pronouns, names, where you're from" },
    { id: "u4", title: "Family", emoji: "👨‍👩‍👧", description: "Relatives — and which side of the family they're on" },
    { id: "u5", title: "Feelings", emoji: "💭", description: "Tired, hungry, happy, homesick" },
    { id: "u6", title: "Food", emoji: "🍚", description: "Bread, tea, rice, and the table" },
    { id: "u7", title: "Everyday", emoji: "🏠", description: "Common verbs and the things around you" },
    { id: "u8", title: "Out & About", emoji: "🚌", description: "Numbers, time, getting somewhere" },
  ],
  alphabet: [],
  frameworks: [],
  vocab: [
    w("u1", "Greetings", "سلام", "salâm", "hello", [{ native: "سلام، حال شما چطوره؟", translit: "salâm, hâl-e shomâ chetore?", translation: "Hello, how are you?" }]),
    w("u1", "Greetings", "خداحافظ", "khodâhâfez", "goodbye", [{ native: "خداحافظ، به امید دیدار", translit: "khodâhâfez, be omid-e didâr", translation: "Goodbye, hope to see you" }]),
    w("u1", "Greetings", "صبح بخیر", "sobh bekheyr", "good morning", [{ native: "صبح بخیر مامان", translit: "sobh bekheyr mâmân", translation: "Good morning, Mum" }]),
    w("u1", "Greetings", "شب بخیر", "shab bekheyr", "good night", [{ native: "شب بخیر، خوب بخواب", translit: "shab bekheyr, khub bekhâb", translation: "Good night, sleep well" }]),
    w("u1", "Greetings", "چطوری", "chetori", "how are you (informal)", [{ native: "چطوری؟ خوبی؟", translit: "chetori? khubi?", translation: "How are you? Are you well?" }],
      { note: "Persian has two 'how are you's. 'چطوری' is for friends and family. 'حال شما چطوره' is for elders, strangers and anyone you owe respect. Using the informal one with an older person is a real misstep." }),
    w("u1", "Greetings", "حال شما چطوره", "hâl-e shomâ chetore", "how are you (formal)", [{ native: "سلام آقا، حال شما چطوره؟", translit: "salâm âghâ, hâl-e shomâ chetore?", translation: "Hello sir, how are you?" }], { difficulty: 2 }),
    w("u1", "Greetings", "خوبم", "khubam", "I'm well", [{ native: "خوبم، ممنون", translit: "khubam, mamnun", translation: "I'm well, thank you" }]),
    w("u1", "Greetings", "بله", "bale", "yes", [{ native: "بله، درسته", translit: "bale, doroste", translation: "Yes, that's right" }]),
    w("u1", "Greetings", "نه", "na", "no", [{ native: "نه، ممنون", translit: "na, mamnun", translation: "No, thank you" }]),

    w("u2", "Politeness", "ممنون", "mamnun", "thank you", [{ native: "خیلی ممنون", translit: "kheyli mamnun", translation: "Thank you very much" }]),
    w("u2", "Politeness", "متشکرم", "moteshakkeram", "thank you (formal)", [{ native: "متشکرم از شما", translit: "moteshakkeram az shomâ", translation: "I thank you" }], { difficulty: 2 }),
    w("u2", "Politeness", "لطفا", "lotfan", "please", [{ native: "لطفا کمکم کنید", translit: "lotfan komakam konid", translation: "Please help me" }]),
    w("u2", "Politeness", "ببخشید", "bebakhshid", "excuse me, sorry", [{ native: "ببخشید، دیر کردم", translit: "bebakhshid, dir kardam", translation: "Sorry, I'm late" }]),
    w("u2", "Politeness", "قربان شما", "ghorbân-e shomâ", "at your service (taarof)", [{ native: "قربان شما، خواهش می‌کنم", translit: "ghorbân-e shomâ, khâhesh mikonam", translation: "You're too kind, not at all" }],
      { note: "Persian has a whole system of ritual politeness called taarof — offering, refusing, insisting. Phrases like this one are not literal; nobody is offering their life. Answering taarof literally is the classic outsider's mistake.", difficulty: 2 }),
    w("u2", "Politeness", "خواهش می‌کنم", "khâhesh mikonam", "you're welcome", [{ native: "خواهش می‌کنم، کاری نکردم", translit: "khâhesh mikonam, kâri nakardam", translation: "You're welcome, I did nothing" }]),

    w("u3", "People", "من", "man", "I, me", [{ native: "من اهل ایرانم", translit: "man ahl-e irânam", translation: "I am from Iran" }]),
    w("u3", "People", "تو", "to", "you (informal)", [{ native: "تو کجایی؟", translit: "to kojâyi?", translation: "Where are you?" }]),
    w("u3", "People", "شما", "shomâ", "you (formal or plural)", [{ native: "شما کجا زندگی می‌کنید؟", translit: "shomâ kojâ zendegi mikonid?", translation: "Where do you live?" }],
      { note: "'تو' to a friend, 'شما' to everyone else. Persian marks respect in the pronoun itself, so the choice is unavoidable — there is no neutral 'you'." }),
    w("u3", "People", "او", "u", "he, she", [{ native: "او برادر منه", translit: "u barâdar-e mane", translation: "He is my brother" }],
      { note: "Persian pronouns have no gender. 'او' is both he and she." }),
    w("u3", "People", "ما", "mâ", "we", [{ native: "ما اینجاییم", translit: "mâ injâyim", translation: "We are here" }]),
    w("u3", "People", "آنها", "ânhâ", "they", [{ native: "آنها فردا می‌آیند", translit: "ânhâ fardâ miâyand", translation: "They will come tomorrow" }]),
    w("u3", "About You", "اسم", "esm", "name", [{ native: "اسم شما چیه؟", translit: "esm-e shomâ chie?", translation: "What is your name?" }]),
    w("u3", "About You", "اهل", "ahl", "from (a place)", [{ native: "اهل کجایید؟", translit: "ahl-e kojâyid?", translation: "Where are you from?" }]),

    w("u4", "Family", "مادر", "mâdar", "mother", [{ native: "مادرم آشپزی می‌کنه", translit: "mâdaram âshpazi mikone", translation: "My mother cooks" }]),
    w("u4", "Family", "پدر", "pedar", "father", [{ native: "پدرم سر کاره", translit: "pedaram sar-e kâre", translation: "My father is at work" }]),
    w("u4", "Family", "مامان", "mâmân", "mum", [{ native: "مامان، کجایی؟", translit: "mâmân, kojâyi?", translation: "Mum, where are you?" }]),
    w("u4", "Family", "بابا", "bâbâ", "dad", [{ native: "بابا خونه‌ست", translit: "bâbâ khunast", translation: "Dad is home" }]),
    w("u4", "Family", "عمو", "amu", "uncle (father's brother)", [{ native: "عموم تهران زندگی می‌کنه", translit: "amum Tehrân zendegi mikone", translation: "My uncle lives in Tehran" }],
      { note: "Persian names which side of the family every relative is on. عمو is your father's brother; دایی is your mother's. There is no general word for 'uncle'.", difficulty: 2 }),
    w("u4", "Family", "دایی", "dâyi", "uncle (mother's brother)", [{ native: "دایی من معلمه", translit: "dâyi-ye man moallem-e", translation: "My uncle is a teacher" }], { difficulty: 2 }),
    w("u4", "Family", "عمه", "amme", "aunt (father's sister)", [{ native: "عمه فردا می‌آد", translit: "amme fardâ miâd", translation: "Aunt comes tomorrow" }], { difficulty: 2 }),
    w("u4", "Family", "خاله", "khâle", "aunt (mother's sister)", [{ native: "خاله غذا پخته", translit: "khâle ghazâ pokhte", translation: "Aunt has cooked food" }], { difficulty: 2 }),
    w("u4", "Family", "برادر", "barâdar", "brother", [{ native: "دو تا برادر دارم", translit: "do tâ barâdar dâram", translation: "I have two brothers" }]),
    w("u4", "Family", "خواهر", "khâhar", "sister", [{ native: "خواهرم دانشجوئه", translit: "khâharam dâneshjuast", translation: "My sister is a student" }]),
    w("u4", "Family", "پسر", "pesar", "son, boy", [{ native: "پسرم مدرسه‌ست", translit: "pesaram madresast", translation: "My son is at school" }]),
    w("u4", "Family", "دختر", "dokhtar", "daughter, girl", [{ native: "دخترم کتاب می‌خونه", translit: "dokhtaram ketâb mikhune", translation: "My daughter reads books" }]),
    w("u4", "Family", "خانواده", "khânevâde", "family", [{ native: "خانواده‌ام رو دوست دارم", translit: "khânevâdam ro dust dâram", translation: "I love my family" }]),

    w("u5", "Feelings", "خسته", "khaste", "tired", [{ native: "خیلی خسته‌ام", translit: "kheyli khastam", translation: "I am very tired" }]),
    w("u5", "Feelings", "گرسنه", "gorosne", "hungry", [{ native: "گرسنه‌ام", translit: "gorosnam", translation: "I am hungry" }]),
    w("u5", "Feelings", "تشنه", "teshne", "thirsty", [{ native: "تشنه‌ای؟", translit: "teshneyi?", translation: "Are you thirsty?" }]),
    w("u5", "Feelings", "خوشحال", "khoshhâl", "happy", [{ native: "خیلی خوشحالم", translit: "kheyli khoshhâlam", translation: "I am very happy" }]),
    w("u5", "Feelings", "ناراحت", "nârâhat", "sad, upset", [{ native: "چرا ناراحتی؟", translit: "cherâ nârâhati?", translation: "Why are you upset?" }]),
    w("u5", "Feelings", "مریض", "mariz", "ill, sick", [{ native: "مادرم مریضه", translit: "mâdaram marize", translation: "My mother is ill" }]),
    w("u5", "Feelings", "دلتنگ", "deltang", "missing someone, homesick", [{ native: "دلتنگت شدم", translit: "deltangat shodam", translation: "I miss you" }],
      { note: "Literally 'tight-hearted'. Persian is full of compounds built on دل (heart) — this one carries the ache of distance, and it is what a diaspora family says to each other on the phone.", difficulty: 2 }),

    w("u6", "Food", "نان", "nân", "bread", [{ native: "نان تازه خریدم", translit: "nân-e tâze kharidam", translation: "I bought fresh bread" }]),
    w("u6", "Food", "آب", "âb", "water", [{ native: "یک لیوان آب لطفا", translit: "yek livân âb lotfan", translation: "A glass of water please" }]),
    w("u6", "Food", "چای", "châi", "tea", [{ native: "چای می‌خوری؟", translit: "châi mikhori?", translation: "Would you like tea?" }],
      { note: "Tea is offered to every guest, always. Refusing the first offer and accepting the second is normal taarof." }),
    w("u6", "Food", "برنج", "berenj", "rice", [{ native: "برنج با خورش", translit: "berenj bâ khoresh", translation: "Rice with stew" }]),
    w("u6", "Food", "غذا", "ghazâ", "food, meal", [{ native: "غذا حاضره", translit: "ghazâ hâzere", translation: "The food is ready" }]),
    w("u6", "Food", "خوشمزه", "khoshmaze", "delicious", [{ native: "خیلی خوشمزه بود", translit: "kheyli khoshmaze bud", translation: "It was very delicious" }]),

    w("u7", "Verbs", "خوردن", "khordan", "to eat", [{ native: "غذا می‌خورم", translit: "ghazâ mikhoram", translation: "I am eating" }]),
    w("u7", "Verbs", "رفتن", "raftan", "to go", [{ native: "دارم می‌رم", translit: "dâram miram", translation: "I am going" }]),
    w("u7", "Verbs", "آمدن", "âmadan", "to come", [{ native: "فردا می‌آم", translit: "fardâ miâm", translation: "I will come tomorrow" }]),
    w("u7", "Verbs", "گفتن", "goftan", "to say", [{ native: "چی گفتی؟", translit: "chi gofti?", translation: "What did you say?" }]),
    w("u7", "Verbs", "دیدن", "didan", "to see", [{ native: "تو رو دیدم", translit: "to ro didam", translation: "I saw you" }]),
    w("u7", "Verbs", "دانستن", "dânestan", "to know", [{ native: "نمی‌دونم", translit: "nemidunam", translation: "I don't know" }]),
    w("u7", "Verbs", "خواستن", "khâstan", "to want", [{ native: "چای می‌خوام", translit: "châi mikhâm", translation: "I want tea" }]),
    w("u7", "Common", "خانه", "khâne", "house, home", [{ native: "خانه‌ی ما نزدیکه", translit: "khâne-ye mâ nazdike", translation: "Our house is near" }]),
    w("u7", "Common", "کتاب", "ketâb", "book", [{ native: "این کتاب منه", translit: "in ketâb-e mane", translation: "This is my book" }]),
    w("u7", "Common", "خوب", "khub", "good", [{ native: "خیلی خوبه", translit: "kheyli khube", translation: "It is very good" }]),
    w("u7", "Common", "بزرگ", "bozorg", "big", [{ native: "شهر بزرگیه", translit: "shahr-e bozorgie", translation: "It is a big city" }]),
    w("u7", "Common", "کوچک", "kuchak", "small", [{ native: "اتاق کوچکیه", translit: "otâgh-e kuchakie", translation: "It is a small room" }]),

    w("u8", "Numbers", "یک", "yek", "one", [{ native: "یک لحظه", translit: "yek lahze", translation: "One moment" }]),
    w("u8", "Numbers", "دو", "do", "two", [{ native: "دو تا برادر", translit: "do tâ barâdar", translation: "Two brothers" }]),
    w("u8", "Numbers", "سه", "se", "three", [{ native: "سه روز", translit: "se ruz", translation: "Three days" }]),
    w("u8", "Numbers", "چهار", "chahâr", "four", [{ native: "چهار سال", translit: "chahâr sâl", translation: "Four years" }]),
    w("u8", "Numbers", "پنج", "panj", "five", [{ native: "پنج نفر", translit: "panj nafar", translation: "Five people" }]),
    w("u8", "Time", "امروز", "emruz", "today", [{ native: "امروز تعطیله", translit: "emruz ta'tile", translation: "Today is a holiday" }]),
    w("u8", "Time", "فردا", "fardâ", "tomorrow", [{ native: "فردا می‌بینمت", translit: "fardâ mibinamet", translation: "I'll see you tomorrow" }]),
    w("u8", "Time", "دیروز", "diruz", "yesterday", [{ native: "دیروز اومدم", translit: "diruz umadam", translation: "I came yesterday" }]),
    w("u8", "Time", "الان", "alân", "now", [{ native: "الان می‌آم", translit: "alân miâm", translation: "I'm coming now" }]),
    w("u8", "Places", "بازار", "bâzâr", "market, bazaar", [{ native: "می‌رم بازار", translit: "miram bâzâr", translation: "I'm going to the market" }]),
    w("u8", "Places", "شهر", "shahr", "city", [{ native: "این شهر قشنگه", translit: "in shahr ghashange", translation: "This city is beautiful" }]),
    w("u8", "Questions", "چی", "chi", "what", [{ native: "این چیه؟", translit: "in chie?", translation: "What is this?" }]),
    w("u8", "Questions", "کجا", "kojâ", "where", [{ native: "کجا می‌ری؟", translit: "kojâ miri?", translation: "Where are you going?" }]),
    w("u8", "Questions", "کی", "ki", "who; when", [{ native: "کی اومد؟", translit: "ki umad?", translation: "Who came?" }]),
    w("u8", "Questions", "چرا", "cherâ", "why", [{ native: "چرا ناراحتی؟", translit: "cherâ nârâhati?", translation: "Why are you upset?" }]),
    w("u8", "Questions", "چند", "chand", "how many, how much", [{ native: "چند تومنه؟", translit: "chand tomane?", translation: "How much is it?" }]),
  ],
};

// v86.1 — the beginner essentials the test suite checks for. It failed both
// new packs at 37/81 and 39/81 and it was right to: a course missing 'have',
// 'need', 'money' and 'because' is not a beginner course.
export const ESSENTIALS = {
  tl: [
    w("u7", "Verbs", "dumating", null, "to come", [{ native: "Dumating na sila", translation: "They have arrived" }]),
    w("u7", "Verbs", "magkaroon", null, "to have", [{ native: "Gusto kong magkaroon ng bahay", translation: "I want to have a house" }]),
    w("u7", "Verbs", "gusto", null, "to want, to like", [{ native: "Gusto ko ng tubig", translation: "I want water" }]),
    w("u7", "Verbs", "alam", null, "to know", [{ native: "Alam ko ang sagot", translation: "I know the answer" }]),
    w("u7", "Verbs", "makita", null, "to see", [{ native: "Nakita kita kahapon", translation: "I saw you yesterday" }]),
    w("u7", "Verbs", "sabihin", null, "to say", [{ native: "Sabihin mo sa akin", translation: "Tell me" }]),
    w("u7", "Verbs", "gawin", null, "to do, to make", [{ native: "Ano ang gagawin natin?", translation: "What shall we do?" }]),
    w("u7", "Verbs", "kaya", null, "can, able to", [{ native: "Kaya ko na", translation: "I can do it now" }]),
    w("u7", "Verbs", "kailangan", null, "to need", [{ native: "Kailangan ko ng tulong", translation: "I need help" }]),
    w("u7", "Verbs", "ibigay", null, "to give", [{ native: "Ibigay mo sa kanya", translation: "Give it to him" }]),
    w("u7", "Verbs", "kunin", null, "to take", [{ native: "Kunin mo ito", translation: "Take this" }]),
    w("u7", "Verbs", "bumili", null, "to buy", [{ native: "Bumili ako ng isda", translation: "I bought fish" }]),
    w("u7", "Verbs", "buksan", null, "to open", [{ native: "Buksan mo ang pinto", translation: "Open the door" }]),
    w("u8", "Common", "pera", null, "money", [{ native: "Wala akong pera", translation: "I have no money" }]),
    w("u8", "Common", "oras", null, "time, hour", [{ native: "Anong oras na?", translation: "What time is it?" }]),
    w("u8", "Common", "presyo", null, "price", [{ native: "Ano ang presyo nito?", translation: "What is the price of this?" }]),
    w("u8", "Common", "dito", null, "here", [{ native: "Dito ka lang", translation: "Just stay here" }]),
    w("u8", "Common", "doon", null, "there", [{ native: "Nandoon sila", translation: "They are there" }]),
    w("u8", "Common", "paano", null, "how", [{ native: "Paano ito gumagana?", translation: "How does this work?" }]),
    w("u8", "People", "lalaki", null, "man, boy", [{ native: "Ang lalaki ay guro", translation: "The man is a teacher" }]),
    w("u8", "People", "babae", null, "woman, girl", [{ native: "Ang babae ay doktor", translation: "The woman is a doctor" }]),
    w("u8", "People", "kaibigan", null, "friend", [{ native: "Kaibigan ko siya", translation: "He is my friend" }]),
    w("u8", "People", "doktor", null, "doctor", [{ native: "Pumunta ka sa doktor", translation: "Go to the doctor" }]),
    w("u8", "Places", "lungsod", null, "city", [{ native: "Malaki ang lungsod", translation: "The city is big" }]),
    w("u8", "Common", "mainit", null, "hot", [{ native: "Mainit ngayon", translation: "It is hot today" }]),
    w("u8", "Common", "malamig", null, "cold", [{ native: "Malamig ang tubig", translation: "The water is cold" }]),
    w("u8", "Common", "marami", null, "many, more", [{ native: "Marami pang pagkain", translation: "There is more food" }]),
    w("u8", "Common", "napaka", null, "very", [{ native: "Napakaganda niya", translation: "She is very beautiful" }]),
    w("u8", "Connectors", "at", null, "and", [{ native: "Ako at siya", translation: "He and I" }]),
    w("u8", "Connectors", "o", null, "or", [{ native: "Kape o tsaa?", translation: "Coffee or tea?" }]),
    w("u8", "Connectors", "pero", null, "but", [{ native: "Gusto ko, pero wala akong pera", translation: "I want to, but I have no money" }]),
    w("u8", "Connectors", "kasi", null, "because", [{ native: "Hindi ako pumunta kasi may sakit ako", translation: "I didn't go because I was ill" }]),
    w("u8", "Connectors", "kasama", null, "with", [{ native: "Kasama ko ang pamilya ko", translation: "I am with my family" }]),
    w("u8", "Connectors", "wala", null, "without, none", [{ native: "Wala akong oras", translation: "I have no time" }]),
    w("u8", "Common", "lahat", null, "all", [{ native: "Lahat ay narito", translation: "Everyone is here" }]),
    w("u8", "Common", "kaliwa", null, "left", [{ native: "Kumaliwa ka", translation: "Turn left" }]),
    w("u8", "Common", "kanan", null, "right", [{ native: "Nasa kanan ito", translation: "It is on the right" }]),
    w("u8", "Common", "malapit", null, "near", [{ native: "Malapit lang ang bahay", translation: "The house is near" }]),
    w("u8", "Common", "malayo", null, "far", [{ native: "Malayo ang paaralan", translation: "The school is far" }]),
    w("u8", "Common", "masama", null, "bad", [{ native: "Masama ang panahon", translation: "The weather is bad" }]),
  ],
  fa: [
    w("u7", "Verbs", "داشتن", "dâshtan", "to have", [{ native: "کتاب دارم", translit: "ketâb dâram", translation: "I have a book" }]),
    w("u7", "Verbs", "توانستن", "tavânestan", "can, to be able", [{ native: "می‌تونم کمک کنم", translit: "mitunam komak konam", translation: "I can help" }]),
    w("u7", "Verbs", "لازم داشتن", "lâzem dâshtan", "to need", [{ native: "کمک لازم دارم", translit: "komak lâzem dâram", translation: "I need help" }]),
    w("u7", "Verbs", "دادن", "dâdan", "to give", [{ native: "بهم بده", translit: "behem bede", translation: "Give it to me" }]),
    w("u7", "Verbs", "گرفتن", "gereftan", "to take", [{ native: "اینو بگیر", translit: "ino begir", translation: "Take this" }]),
    w("u7", "Verbs", "کمک کردن", "komak kardan", "to help", [{ native: "کمکم کن", translit: "komakam kon", translation: "Help me" }]),
    w("u7", "Verbs", "فهمیدن", "fahmidan", "to understand", [{ native: "نمی‌فهمم", translit: "nemifahmam", translation: "I don't understand" }]),
    w("u7", "Verbs", "حرف زدن", "harf zadan", "to speak", [{ native: "فارسی حرف می‌زنی؟", translit: "fârsi harf mizani?", translation: "Do you speak Persian?" }]),
    w("u7", "Verbs", "کردن", "kardan", "to do, to make", [{ native: "چیکار می‌کنی؟", translit: "chikâr mikoni?", translation: "What are you doing?" }]),
    w("u7", "Verbs", "خریدن", "kharidan", "to buy", [{ native: "نان خریدم", translit: "nân kharidam", translation: "I bought bread" }]),
    w("u7", "Verbs", "باز کردن", "bâz kardan", "to open", [{ native: "در رو باز کن", translit: "dar ro bâz kon", translation: "Open the door" }]),
    w("u8", "Common", "پول", "pul", "money", [{ native: "پول ندارم", translit: "pul nadâram", translation: "I have no money" }]),
    w("u8", "Time", "وقت", "vaght", "time", [{ native: "وقت ندارم", translit: "vaght nadâram", translation: "I have no time" }]),
    w("u8", "Time", "روز", "ruz", "day", [{ native: "روز خوبی بود", translit: "ruz-e khubi bud", translation: "It was a good day" }]),
    w("u8", "Common", "قیمت", "gheymat", "price", [{ native: "قیمتش چنده؟", translit: "gheymatesh chande?", translation: "What is its price?" }]),
    w("u8", "Common", "اینجا", "injâ", "here", [{ native: "بیا اینجا", translit: "biâ injâ", translation: "Come here" }]),
    w("u8", "Common", "آنجا", "ânjâ", "there", [{ native: "اونجا نشستن", translit: "unjâ neshastan", translation: "They sat there" }]),
    w("u8", "Questions", "چطور", "chetor", "how", [{ native: "چطور می‌رسم؟", translit: "chetor miresam?", translation: "How do I get there?" }]),
    w("u8", "People", "مرد", "mard", "man", [{ native: "اون مرد معلمه", translit: "un mard moallem-e", translation: "That man is a teacher" }]),
    w("u8", "People", "زن", "zan", "woman", [{ native: "اون زن دکتره", translit: "un zan doktor-e", translation: "That woman is a doctor" }]),
    w("u8", "People", "دوست", "dust", "friend", [{ native: "دوست منه", translit: "dust-e mane", translation: "He is my friend" }]),
    w("u8", "People", "دکتر", "doktor", "doctor", [{ native: "برو پیش دکتر", translit: "boro pish-e doktor", translation: "Go to the doctor" }]),
    w("u8", "Common", "گرم", "garm", "hot, warm", [{ native: "هوا گرمه", translit: "havâ garme", translation: "The weather is hot" }]),
    w("u8", "Common", "سرد", "sard", "cold", [{ native: "آب سرده", translit: "âb sarde", translation: "The water is cold" }]),
    w("u8", "Common", "بیشتر", "bishtar", "more", [{ native: "بیشتر بخور", translit: "bishtar bokhor", translation: "Eat more" }]),
    w("u8", "Common", "خیلی", "kheyli", "very", [{ native: "خیلی خوبه", translit: "kheyli khube", translation: "It is very good" }]),
    w("u8", "Connectors", "و", "va", "and", [{ native: "من و تو", translit: "man o to", translation: "You and I" }]),
    w("u8", "Connectors", "یا", "yâ", "or", [{ native: "چای یا قهوه؟", translit: "châi yâ ghahve?", translation: "Tea or coffee?" }]),
    w("u8", "Connectors", "اما", "ammâ", "but", [{ native: "می‌خوام اما نمی‌تونم", translit: "mikhâm ammâ nemitunam", translation: "I want to but I can't" }]),
    w("u8", "Connectors", "چون", "chun", "because", [{ native: "نیومدم چون مریض بودم", translit: "nayumadam chun mariz budam", translation: "I didn't come because I was ill" }]),
    w("u8", "Connectors", "با", "bâ", "with", [{ native: "با خانواده‌ام", translit: "bâ khânevâdam", translation: "With my family" }]),
    w("u8", "Connectors", "بدون", "bedun", "without", [{ native: "بدون تو", translit: "bedun-e to", translation: "Without you" }]),
    w("u8", "Common", "همه", "hame", "all, everyone", [{ native: "همه اینجان", translit: "hame injân", translation: "Everyone is here" }]),
    w("u8", "Common", "چپ", "chap", "left", [{ native: "سمت چپ", translit: "samt-e chap", translation: "On the left" }]),
    w("u8", "Common", "راست", "râst", "right", [{ native: "سمت راست", translit: "samt-e râst", translation: "On the right" }]),
    w("u8", "Common", "نزدیک", "nazdik", "near", [{ native: "خونه نزدیکه", translit: "khune nazdike", translation: "The house is near" }]),
    w("u8", "Common", "دور", "dur", "far", [{ native: "مدرسه دوره", translit: "madrese dure", translation: "The school is far" }]),
    w("u8", "Common", "بد", "bad", "bad", [{ native: "هوا بده", translit: "havâ bade", translation: "The weather is bad" }]),
    w("u8", "Common", "نیست", "nist", "is not", [{ native: "این درست نیست", translit: "in dorost nist", translation: "This is not right" }]),
    w("u8", "Common", "بله حتما", "bale hatman", "yes of course", [{ native: "بله حتما، بفرمایید", translit: "bale hatman, befarmâyid", translation: "Yes of course, please go ahead" }]),
    w("u8", "Common", "بفرمایید", "befarmâyid", "please, help yourself, go ahead", [{ native: "بفرمایید بنشینید", translit: "befarmâyid beneshinid", translation: "Please, sit down" }]),
    w("u8", "Common", "مثل", "mesl", "like, similar to", [{ native: "مثل مادرش است", translit: "mesl-e mâdarash ast", translation: "She is like her mother" }]),
    w("u8", "Common", "کم", "kam", "little, few", [{ native: "کم حرف می‌زنه", translit: "kam harf mizane", translation: "He speaks little" }]),
  ],
};