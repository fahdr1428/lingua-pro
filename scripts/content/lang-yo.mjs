// =============================================================================
// lang-yo.mjs (v102) — Yoruba.
//
// Around 45 million speakers across Nigeria, Benin and Togo, and a diaspora
// that reaches London, Houston, Toronto and Salvador da Bahia. It sits beside
// Nigerian Pidgin in this app for a reason: the same families, and the same
// gap. There is no serious Yoruba course anywhere, and the children of Yoruba
// speakers abroad routinely understand their parents and answer in English.
//
// WHAT THE MARKS DO, AND WHY THEY ARE NOT OPTIONAL
//
// Yoruba is written in the Latin alphabet with two kinds of mark, and both
// change the word:
//
//   the sub-dot   ẹ ọ ṣ    a different letter, not a decorated one
//   the tone      ó ò o    high, low, and unmarked mid
//
//     ọkọ̀  vehicle      ọkọ  husband      òkò  stone      oko  farm
//
// Written without its marks, Yoruba is genuinely ambiguous — which is why so
// much Yoruba on the internet is unreadable to learners and merely inconvenient
// to speakers. Every headword and example here carries its full marks.
//
// A NOTE ON THE COMBINING MARKS
//
// ẹ̀ and ọ̀ are a sub-dot letter PLUS a tone mark, and there is no single
// precomposed Unicode character for them. They are written here as the dotted
// letter followed by a combining accent, which is what the standard requires
// and what a correct font renders as one glyph.
//
// Format: [conceptId|null, unit, category, lemma, translation, example, exampleEn]
// =============================================================================

export const YO = {
  code: "yo",
  units: [
    { id: "u1", title: "Greetings", emoji: "👋", description: "Yoruba greets by time of day, and there is one for everything" },
    { id: "u2", title: "About You", emoji: "🙋", description: "I, you, and how to give your name" },
    { id: "u3", title: "Family", emoji: "👨‍👩‍👧", description: "The words for the people at the table" },
    { id: "u4", title: "Numbers", emoji: "🔢", description: "Counting, and asking the price" },
    { id: "u5", title: "Food & Drink", emoji: "🍲", description: "Rice, water, and eating together" },
    { id: "u6", title: "Common Verbs", emoji: "🏃", description: "Go, come, know, want" },
    { id: "u7", title: "Places", emoji: "📍", description: "Home, market, and finding your way" },
    { id: "u8", title: "Time & Feelings", emoji: "🕐", description: "Today, tomorrow, tired, hungry" },
  ],
  alphabetGroups: [
    { id: "tones", title: "The three tones", emoji: "🎵", description: "High, mid, low — and they change the word" },
    { id: "dotted", title: "The dotted letters", emoji: "⚠️", description: "ẹ, ọ, ṣ — different letters, not decorated ones" },
    { id: "sounds", title: "Sounds English doesn't have", emoji: "🅰️", description: "gb, ẹ, ọ, and the nasal vowels" },
  ],
  alphabet: [
    // --- tones -------------------------------------------------------------
    { char: "ó", name: "high tone", sound: "pitch held high — 'ó' = he/she/it", group: "tones",
      note: "The acute is not stress. Yoruba syllables are all about the same length; what changes is the musical pitch you hold." },
    { char: "o", name: "mid tone", sound: "the middle of your range, written with no mark", group: "tones",
      note: "Unmarked does not mean untoned. Mid is a real tone that has to be held level." },
    { char: "ò", name: "low tone", sound: "pitch held low — 'ò' = does not", group: "tones",
      note: "ó and ò are opposites and turn 'he does' into 'he does not'. This is the pair to get right first." },
    { char: "ọkọ̀", name: "why it matters", sound: "ọkọ̀ vehicle · ọkọ husband · oko farm", group: "tones",
      note: "Three different words, one spelling without the marks. Yoruba written bare is guesswork for a learner." },
    // --- dotted ------------------------------------------------------------
    { char: "ẹ", name: "ẹ", sound: "like the 'e' in 'bed'", group: "dotted",
      note: "A separate letter from e (which is the 'ay' of 'day'). The dot goes UNDER, and dropping it changes words." },
    { char: "ọ", name: "ọ", sound: "like the 'aw' in 'law'", group: "dotted",
      note: "A separate letter from o (which is the 'oh' of 'go')." },
    { char: "ṣ", name: "ṣ", sound: "like 'sh'", group: "dotted",
      note: "s is a plain 's'; ṣ is 'sh'. Ṣé (the question word) is 'sheh', not 'seh'." },
    // --- sounds ------------------------------------------------------------
    { char: "gb", name: "gb", sound: "a g and a b at exactly the same time", group: "sounds",
      note: "One sound, not two. Close your lips as if for b while making a g at the back. English has nothing like it, and 'gbogbo' (all) is the word to practise on." },
    { char: "p", name: "p", sound: "a k and a p at the same time", group: "sounds",
      note: "Yoruba p is really 'kp'. There is no plain English p sound in the language." },
    { char: "an", name: "an", sound: "a nasal 'ahn'", group: "sounds" },
    { char: "ẹn", name: "ẹn", sound: "a nasal 'ehn'", group: "sounds" },
    { char: "ọn", name: "ọn", sound: "a nasal 'awn'", group: "sounds" },
    { char: "un", name: "un", sound: "a nasal 'oon'", group: "sounds" },
    { char: "j", name: "j", sound: "like the 'j' in 'jam'", group: "sounds" },
    { char: "y", name: "y", sound: "like the 'y' in 'yes'", group: "sounds" },
    { char: "r", name: "r", sound: "a light tap, closer to Spanish than English", group: "sounds" },
  ],
  vocab: [
    // --- u1 greetings ------------------------------------------------------
    ["hello", "u1", "Greetings", "báwo ni", "hello, how are you", "Báwo ni? Ṣé àlàáfíà ni?", "Hello, is all well?"],
    [null, "u1", "Greetings", "ẹ káàárọ̀", "good morning", "Ẹ káàárọ̀ ma", "Good morning, ma'am"],
    [null, "u1", "Greetings", "ẹ káàsán", "good afternoon", "Ẹ káàsán, ẹ jòwó", "Good afternoon, please"],
    [null, "u1", "Greetings", "ẹ kúùrọ̀lẹ́", "good evening", "Ẹ kúùrọ̀lẹ́ o", "Good evening"],
    ["goodbye", "u1", "Greetings", "ó dàbọ̀", "goodbye", "Ó dàbọ̀, a ó tún rí", "Goodbye, we'll see each other again"],
    ["yes", "u1", "Greetings", "bẹ́ẹ̀ni", "yes", "Bẹ́ẹ̀ni, mo gbọ́", "Yes, I hear you"],
    ["no", "u1", "Greetings", "bẹ́ẹ̀kọ́", "no", "Bẹ́ẹ̀kọ́, ẹ ṣé", "No, thank you"],
    ["thanks", "u1", "Politeness", "ẹ ṣé", "thank you", "Ẹ ṣé fún ìrànlọ́wọ́ yín", "Thank you for your help"],
    ["please", "u1", "Politeness", "ẹ jọ̀ọ́", "please", "Ẹ jọ̀ọ́, ràn mí lọ́wọ́", "Please, help me"],
    ["sorry", "u1", "Politeness", "pẹ̀lẹ́", "sorry, sympathy for you", "Pẹ̀lẹ́ o, ó dáa", "Sorry, it's all right"],
    [null, "u1", "Politeness", "má bínú", "I'm sorry (lit. don't be angry)", "Má bínú, mo pẹ́", "I'm sorry, I'm late"],
    [null, "u1", "Greetings", "àlàáfíà", "peace, wellbeing", "Àlàáfíà ni", "All is well"],

    // --- u2 about you ------------------------------------------------------
    ["i", "u2", "People", "mo", "I", "Mo ń gbé ní Èkó", "I live in Lagos"],
    ["you", "u2", "People", "ìwọ", "you", "Ìwọ ni mo ń wá", "It's you I'm looking for"],
    [null, "u2", "People", "ẹ̀yin", "you (plural or respectful)", "Ẹ̀yin ni ẹ mọ̀", "You are the ones who know"],
    ["we", "u2", "People", "àwa", "we", "Àwa ti dé", "We have arrived"],
    ["he", "u2", "People", "ó", "he, she, it", "Ó jẹ́ ẹ̀gbọ́n mi", "He is my older sibling"],
    ["she", "u2", "People", "òun", "he, she (emphatic)", "Òun ni olùkọ́ mi", "She is my teacher"],
    ["name", "u2", "About You", "orúkọ", "name", "Kí ni orúkọ rẹ?", "What is your name?"],
    [null, "u2", "About You", "ọmọ", "child", "Ọmọ mi ni", "This is my child"],

    // --- u3 family ---------------------------------------------------------
    ["mother", "u3", "Family", "ìyá", "mother", "Ìyá mi ń ṣe oúnjẹ", "My mother is cooking"],
    ["father", "u3", "Family", "bàbá", "father", "Bàbá mi ti lọ sí iṣẹ́", "My father has gone to work"],
    ["brother", "u3", "Family", "ẹ̀gbọ́n ọkùnrin", "older brother", "Ẹ̀gbọ́n ọkùnrin mi wà ní Ìbàdàn", "My older brother is in Ibadan"],
    ["sister", "u3", "Family", "ẹ̀gbọ́n obìnrin", "older sister", "Ẹ̀gbọ́n obìnrin mi jẹ́ dókítà", "My older sister is a doctor"],
    ["son", "u3", "Family", "ọmọkùnrin", "son, boy", "Ọmọkùnrin mi ń lọ sí ilé-ìwé", "My son goes to school"],
    ["daughter", "u3", "Family", "ọmọbìnrin", "daughter, girl", "Ọmọbìnrin mi jẹ́ olùkọ́", "My daughter is a teacher"],
    ["family", "u3", "Family", "ìdílé", "family", "Ìdílé mi tóbi", "My family is big"],
    ["grandmother", "u3", "Family", "ìyá àgbà", "grandmother", "Ìyá àgbà mi ń sọ ìtàn", "My grandmother tells stories"],
    ["grandfather", "u3", "Family", "bàbá àgbà", "grandfather", "Bàbá àgbà mi ti darúgbó", "My grandfather has grown old"],
    ["uncle", "u3", "Family", "arákùnrin ìyá", "uncle (mother's brother)", "Arákùnrin ìyá mi ń bọ̀", "My uncle is coming"],
    ["aunt", "u3", "Family", "arábìnrin ìyá", "aunt (mother's sister)", "Mo lọ sí ilé arábìnrin ìyá mi", "I went to my aunt's house"],
    ["friend", "u3", "People", "ọ̀rẹ́", "friend", "Ọ̀rẹ́ mi ni", "He is my friend"],
    ["man", "u3", "People", "ọkùnrin", "man", "Ọkùnrin náà ń bọ̀", "The man is coming"],
    ["woman", "u3", "People", "obìnrin", "woman", "Obìnrin náà jẹ́ ìyá mi", "That woman is my mother"],
    ["doctor", "u3", "People", "dókítà", "doctor", "Mo fẹ́ rí dókítà", "I want to see a doctor"],

    // --- u4 numbers --------------------------------------------------------
    ["one", "u4", "Numbers", "ọ̀kan", "one", "Ọ̀kan ṣoṣo ló kù", "Only one is left"],
    ["two", "u4", "Numbers", "méjì", "two", "Mo ní ẹ̀gbọ́n méjì", "I have two older siblings"],
    ["three", "u4", "Numbers", "mẹ́ta", "three", "Ọjọ́ mẹ́ta sí i", "Three more days"],
    ["four", "u4", "Numbers", "mẹ́rin", "four", "Ènìyàn mẹ́rin ni", "There are four people"],
    ["five", "u4", "Numbers", "márùn-ún", "five", "Ìṣẹ́jú márùn-ún", "Five minutes"],
    [null, "u4", "Numbers", "mẹ́wàá", "ten", "Mẹ́wàá ni mo fẹ́", "I want ten"],
    ["howmuch", "u4", "Questions", "élòó", "how much", "Élòó ni èyí?", "How much is this?"],
    ["money", "u4", "Common", "owó", "money", "Mi ò ní owó", "I don't have money"],
    [null, "u4", "Common", "wọ́n", "expensive", "Ó wọ́n jù", "It's too expensive"],

    // --- u5 food -----------------------------------------------------------
    ["water", "u5", "Food", "omi", "water", "Fún mi ní omi, ẹ jọ̀ọ́", "Give me water, please"],
    ["food", "u5", "Food", "oúnjẹ", "food", "Oúnjẹ ti ṣetán", "The food is ready"],
    ["rice", "u5", "Food", "ìrẹsì", "rice", "Mo ń jẹ ìrẹsì", "I am eating rice"],
    ["bread", "u5", "Food", "búrẹ́dì", "bread", "Mo ra búrẹ́dì lọ́wọ́ọ̀rọ̀", "I bought bread this morning"],
    ["tea", "u5", "Food", "tíì", "tea", "Bàbá mi ń mu tíì", "My father drinks tea"],
    ["milk", "u5", "Food", "wàrà", "milk", "Fi wàrà sí i", "Put milk in it"],
    [null, "u5", "Food", "ẹ̀wà", "beans", "Ẹ̀wà àti ìrẹsì", "Beans and rice"],
    [null, "u5", "Food", "dídùn", "sweet, delicious", "Oúnjẹ yìí dídùn", "This food is delicious"],
    ["eat", "u5", "Verbs", "jẹ", "to eat", "Kí ni o fẹ́ jẹ?", "What do you want to eat?"],
    ["drink", "u5", "Verbs", "mu", "to drink", "Mo ń mu omi lójoojúmọ́", "I drink water every day"],

    // --- u6 verbs ----------------------------------------------------------
    ["go", "u6", "Verbs", "lọ", "to go", "Níbo ni o fẹ́ lọ?", "Where do you want to go?"],
    ["come", "u6", "Verbs", "wá", "to come", "Wá sí ilé mi", "Come to my house"],
    ["want", "u6", "Verbs", "fẹ́", "to want, to like", "Mo fẹ́ kọ́ èdè Yorùbá", "I want to learn Yoruba"],
    ["have", "u6", "Verbs", "ní", "to have", "Ṣé o ní àkókò?", "Do you have time?"],
    ["know", "u6", "Verbs", "mọ̀", "to know", "Mi ò mọ ibi yìí", "I don't know this place"],
    ["understand", "u6", "Verbs", "gbọ́", "to hear, to understand", "Mo fẹ́ gbọ́ ọ̀rọ̀ rẹ", "I want to understand you"],
    ["speak", "u6", "Verbs", "sọ", "to speak, to say", "Sọ òtítọ́ fún mi", "Tell me the truth"],
    ["help", "u6", "Verbs", "ràn lọ́wọ́", "to help", "Ṣé o lè ràn mí lọ́wọ́?", "Can you help me?"],
    ["see", "u6", "Verbs", "rí", "to see", "Mi ò rí nǹkan kan", "I don't see anything"],
    ["give", "u6", "Verbs", "fún", "to give", "Fún mi ní ọ̀kan", "Give me one"],
    ["take", "u6", "Verbs", "gbà", "to take, to receive", "Gbà á lọ́wọ́ mi", "Take it from me"],
    ["do", "u6", "Verbs", "ṣe", "to do, to make", "Kí ni o ń ṣe?", "What are you doing?"],
    ["buy", "u6", "Verbs", "rà", "to buy", "Mo rà á ní ọjà", "I bought it at the market"],
    ["open", "u6", "Verbs", "ṣí", "to open", "Ṣí ilẹ̀kùn fún mi", "Open the door for me"],
    ["sleep", "u6", "Verbs", "sùn", "to sleep", "Mo fẹ́ sùn", "I want to sleep"],
    ["think", "u6", "Verbs", "rò", "to think", "Mo ń rò nípa rẹ", "I'm thinking about you"],
    ["can", "u6", "Verbs", "lè", "can, to be able to", "Mo lè ràn ọ́ lọ́wọ́", "I can help you"],
    ["work", "u6", "Verbs", "iṣẹ́", "work, job", "Iṣẹ́ pọ̀ lónìí", "There is a lot of work today"],

    // --- u7 places ---------------------------------------------------------
    ["house", "u7", "Places", "ilé", "house, home", "Mo ń lọ sí ilé", "I am going home"],
    ["bathroom", "u7", "Places", "ilé ìwẹ̀", "bathroom", "Ilé ìwẹ̀ wà níbo?", "Where is the bathroom?"],
    ["market", "u7", "Places", "ọjà", "market", "Mo ń lọ sí ọjà", "I am going to the market"],
    ["city", "u7", "Places", "ìlú", "town, city", "Ìlú yìí tóbi", "This city is big"],
    ["hotel", "u7", "Places", "hòtẹ́ẹ̀lì", "hotel", "Hòtẹ́ẹ̀lì náà wà nítòsí", "The hotel is nearby"],
    ["here", "u7", "Places", "níbí", "here", "Jókòó níbí", "Sit here"],
    ["there", "u7", "Places", "níbẹ̀", "there", "Ó wà níbẹ̀", "It is over there"],
    ["near", "u7", "Places", "nítòsí", "near, close", "Ọjà wà nítòsí ilé mi", "The market is near my house"],
    ["far", "u7", "Places", "jìnnà", "far", "Ó jìnnà púpọ̀", "It is very far"],
    ["car", "u7", "Transport", "ọkọ̀ ayọ́kẹ́lẹ́", "car", "Ọkọ̀ ayọ́kẹ́lẹ́ mi ti dé", "My car has arrived"],
    ["train", "u7", "Transport", "ọkọ̀ ojú irin", "train", "Ọkọ̀ ojú irin pẹ́", "The train was late"],
    ["left", "u7", "Common", "òsì", "left", "Yà sí òsì", "Turn left"],
    ["right", "u7", "Common", "ọ̀tún", "right", "Ilé ìwẹ̀ wà ní ọ̀tún", "The bathroom is on the right"],

    // --- u8 time & feelings ------------------------------------------------
    ["today", "u8", "Time", "lónìí", "today", "Mi ò ṣiṣẹ́ lónìí", "I'm not working today"],
    ["tomorrow", "u8", "Time", "ọ̀la", "tomorrow", "Ọ̀la ni mo máa lọ", "Tomorrow is when I'll go"],
    ["yesterday", "u8", "Time", "àná", "yesterday", "Òjò rọ̀ àná", "It rained yesterday"],
    ["now", "u8", "Time", "báyìí", "now", "Wá báyìí", "Come now"],
    ["time", "u8", "Time", "àkókò", "time", "Mi ò ní àkókò", "I don't have time"],
    ["day", "u8", "Time", "ọjọ́", "day", "Ọjọ́ gígùn ni", "It was a long day"],
    ["week", "u8", "Time", "ọ̀sẹ̀", "week", "Ọ̀sẹ̀ tó ń bọ̀", "Next week"],
    ["year", "u8", "Time", "ọdún", "year", "Ọdún kan ti kọjá", "A year has passed"],
    ["tired", "u8", "Feelings", "ó rẹ̀ mí", "tired (lit. it tires me)", "Ó rẹ̀ mí gan-an", "I am very tired"],
    ["hungry", "u8", "Feelings", "ebi", "hunger", "Ebi ń pa mí", "I am hungry"],
    ["thirsty", "u8", "Feelings", "òùngbẹ", "thirst", "Òùngbẹ ń gbẹ mí", "I am thirsty"],
    // Yoruba says happiness as "the inside is sweet"; ayọ̀ is the noun and is
    // not what you use to say you are happy.
    ["happy", "u8", "Feelings", "inú dùn", "happy", "Inú mi dùn púpọ̀", "I am very happy"],
    ["sad", "u8", "Feelings", "ìbànújẹ́", "sadness", "Ìbànújẹ́ ń bá mi", "I am sad"],
    ["sick", "u8", "Feelings", "àìsàn", "illness, sick", "Ọmọ mi ní àìsàn", "My child is sick"],

    // --- questions & connectors --------------------------------------------
    ["what", "u2", "Questions", "kí ni", "what", "Kí ni èyí?", "What is this?"],
    ["where", "u7", "Questions", "níbo", "where", "Níbo ni o ń gbé?", "Where do you live?"],
    ["who", "u2", "Questions", "ta ni", "who", "Ta ni ó ń bọ̀?", "Who is coming?"],
    ["when", "u8", "Questions", "ìgbà wo", "when", "Ìgbà wo ni o máa dé?", "When will you arrive?"],
    ["why", "u2", "Questions", "kí ló dé", "why", "Kí ló dé tí o fi banú jẹ́?", "Why are you sad?"],
    ["and", "u2", "Connectors", "àti", "and", "Bàbá àti ìyá mi", "My father and mother"],
    ["or", "u2", "Connectors", "tàbí", "or", "Tíì tàbí kọfí?", "Tea or coffee?"],
    ["but", "u2", "Connectors", "ṣùgbọ́n", "but", "Mo fẹ́ lọ ṣùgbọ́n ó rẹ̀ mí", "I want to go but I'm tired"],
    ["because", "u2", "Connectors", "nítorí", "because", "Nítorí òjò ń rọ̀", "Because it's raining"],
    // pẹ̀lú is both "with" and "also"; one card, both glosses.
    ["with", "u2", "Connectors", "pẹ̀lú", "with, also", "Wá pẹ̀lú mi", "Come with me"],

    // --- common & describing -----------------------------------------------
    ["good", "u1", "Common", "dáadáa", "good, well", "Ó dáadáa gan-an", "It is very good"],
    ["bad", "u1", "Common", "burúkú", "bad", "Ọjọ́ burúkú ni àná", "Yesterday was a bad day"],
    ["big", "u7", "Common", "tóbi", "big", "Ilé bàbá mi tóbi", "My father's house is big"],
    ["small", "u7", "Common", "kékeré", "small", "Ilé kékeré ni", "It is a small house"],
    ["hot", "u8", "Weather", "gbóná", "hot", "Tíì náà gbóná", "The tea is hot"],
    ["cold", "u8", "Weather", "tutù", "cold", "Omi náà tutù", "The water is cold"],
    ["very", "u1", "Common", "púpọ̀", "very, much", "Ó dùn púpọ̀", "It is very sweet"],
    ["more", "u5", "Common", "sí i", "more", "Fún mi ní sí i", "Give me more"],
    ["all", "u2", "Common", "gbogbo", "all, every", "Gbogbo rẹ̀ dáa", "All of it is good"],

    // --- tier 3 ------------------------------------------------------------
    ["head", "u8", "Body", "orí", "head", "Orí mi ń fọ́", "My head hurts"],
    ["hand", "u8", "Body", "ọwọ́", "hand", "Wẹ ọwọ́ rẹ", "Wash your hands"],
    ["heart", "u8", "Body", "ọkàn", "heart", "Ọkàn mi balẹ̀", "My heart is at peace"],
    ["black", "u5", "Colors", "dúdú", "black", "Kọfí dúdú", "Black coffee"],
    ["white", "u5", "Colors", "funfun", "white", "Aṣọ funfun", "White clothes"],
    ["sun", "u8", "Weather", "oòrùn", "sun", "Oòrùn ti yọ", "The sun has risen"],
    ["rain", "u8", "Weather", "òjò", "rain", "Òjò ń rọ̀", "It is raining"],
  ],
};
