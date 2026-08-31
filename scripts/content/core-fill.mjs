// =============================================================================
// core-fill.mjs (v100) — the words the packs were missing.
//
// Written as data, in one reviewable place, and merged into the packs by
// merge-core-vocab.mjs. Same shape as the translit content files: the content
// is the thing to check, the merge is mechanical.
//
// Every entry carries ONE example sentence, because a word with no frame is a
// flashcard and a word with a frame is a piece of language. The example uses
// only words the pack already teaches wherever possible — validate-passages
// enforces that rule for reading passages, and it is the right rule here too.
//
// Fields: [conceptId, lemma, translit, translation, category, unit, exNative,
//          exTranslit, exTranslation]
//
// translit is "" for the Latin-script languages (de, es, fr, id, tr, pcm, tl,
// so), which do not carry one — validate-vocab only requires it for the rest.
// =============================================================================

export const CORE_FILL = {
  // ===========================================================================
  // ARABIC — no way to talk about a third person: the pack taught أنا and أنت
  // and stopped. Also the numbers stopped at three.
  // ===========================================================================
  ar: [
    ["we", "نحن", "naḥnu", "we", "People", "u2",
      "نحن من لندن", "naḥnu min London", "We are from London"],
    ["he", "هو", "huwa", "he", "People", "u2",
      "هو أخي", "huwa akhi", "He is my brother"],
    ["she", "هي", "hiya", "she", "People", "u2",
      "هي أمي", "hiya ummi", "She is my mother"],
    ["four", "أربعة", "arba'a", "four", "Numbers", "u4",
      "أربعة كتب", "arba'at kutub", "Four books"],
    ["five", "خمسة", "khamsa", "five", "Numbers", "u4",
      "خمسة أيام", "khamsat ayyam", "Five days"],
  ],

  // ===========================================================================
  // GERMAN — same hole: ich and du/Sie, and nobody else. Plus no word for food,
  // no tea, no milk, no rice, and neither "sleep" nor "think".
  //
  // Essen/essen and sie/Sie are separate words in German because case is
  // lexically contrastive there — the duplicate-lemma check in
  // validate-vocab.mjs now knows that.
  // ===========================================================================
  de: [
    ["we", "wir", "", "we", "People", "u2",
      "Wir wohnen in Berlin.", "", "We live in Berlin."],
    ["he", "er", "", "he", "People", "u2",
      "Er ist mein Bruder.", "", "He is my brother."],
    ["she", "sie", "", "she", "People", "u2",
      "Sie ist meine Schwester.", "", "She is my sister."],
    ["food", "Essen", "", "food", "Food", "u5",
      "Das Essen ist fertig.", "", "The food is ready."],
    ["tea", "Tee", "", "tea", "Food", "u5",
      "Ich trinke Tee ohne Zucker.", "", "I drink tea without sugar."],
    ["milk", "Milch", "", "milk", "Food", "u5",
      "Milch und Brot, bitte.", "", "Milk and bread, please."],
    ["rice", "Reis", "", "rice", "Food", "u5",
      "Es gibt Reis zum Abendessen.", "", "There is rice for dinner."],
    ["sleep", "schlafen", "", "to sleep", "Verbs", "u6",
      "Ich möchte schlafen.", "", "I would like to sleep."],
    ["think", "denken", "", "to think", "Verbs", "u6",
      "Ich denke an dich.", "", "I am thinking of you."],
    ["grandmother", "Oma", "", "grandmother", "Family", "u3",
      "Meine Oma wohnt in Hamburg.", "", "My grandmother lives in Hamburg."],
    ["grandfather", "Opa", "", "grandfather", "Family", "u3",
      "Mein Opa ist Arzt.", "", "My grandfather is a doctor."],
    ["hot", "heiß", "", "hot", "Weather", "u12",
      "Der Tee ist heiß.", "", "The tea is hot."],
    ["howmuch", "wie viel", "", "how much", "Questions", "u10",
      "Wie viel kostet das?", "", "How much does that cost?"],
  ],

  // ===========================================================================
  // HINDI — I and you, no he/she/we. Also no word for "family" and none for
  // "market", which is where most early Hindi actually happens.
  // ===========================================================================
  hi: [
    ["we", "हम", "hum", "we", "People", "u2",
      "हम दिल्ली से हैं", "hum Dilli se hain", "We are from Delhi"],
    ["he", "वह", "vah", "he, she", "People", "u2",
      "वह मेरा भाई है", "vah mera bhai hai", "He is my brother"],
    ["she", "यह", "yah", "she, this one", "People", "u2",
      "यह मेरी बहन है", "yah meri bahan hai", "She is my sister"],
    ["family", "परिवार", "parivaar", "family", "Family", "u3",
      "मेरा परिवार बड़ा है", "mera parivaar bada hai", "My family is big"],
    ["market", "बाज़ार", "baazaar", "market", "Places", "u7",
      "मैं बाज़ार जा रहा हूँ", "main baazaar ja raha hoon", "I am going to the market"],
    ["four", "चार", "chaar", "four", "Numbers", "u4",
      "चार लोग", "chaar log", "Four people"],
    ["five", "पाँच", "paanch", "five", "Numbers", "u4",
      "पाँच रुपये", "paanch rupaye", "Five rupees"],
  ],

  // ===========================================================================
  // JAPANESE — 私 and あなた and nobody else; and no numbers past three.
  // ===========================================================================
  ja: [
    ["we", "私たち", "watashitachi", "we", "People", "u2",
      "私たちは学生です", "watashitachi wa gakusei desu", "We are students"],
    ["he", "彼", "kare", "he", "People", "u2",
      "彼は私の兄です", "kare wa watashi no ani desu", "He is my older brother"],
    ["she", "彼女", "kanojo", "she", "People", "u2",
      "彼女は先生です", "kanojo wa sensei desu", "She is a teacher"],
    ["family", "家族", "kazoku", "family", "Family", "u3",
      "家族は四人です", "kazoku wa yonin desu", "There are four in my family"],
    ["uncle", "おじさん", "ojisan", "uncle", "Family", "u3",
      "おじさんは京都にいます", "ojisan wa Kyouto ni imasu", "My uncle is in Kyoto"],
    ["aunt", "おばさん", "obasan", "aunt", "Family", "u3",
      "おばさんの家に行きます", "obasan no ie ni ikimasu", "I am going to my aunt's house"],
    ["thirsty", "喉が渇いた", "nodo ga kawaita", "thirsty", "Feelings", "u9",
      "喉が渇きました", "nodo ga kawakimashita", "I am thirsty"],
    ["market", "市場", "ichiba", "market", "Places", "u7",
      "市場は近いです", "ichiba wa chikai desu", "The market is close"],
    ["hotel", "ホテル", "hoteru", "hotel", "Places", "u7",
      "ホテルはどこですか", "hoteru wa doko desu ka", "Where is the hotel?"],
    // Not 私も行きます — extraExamples.js already gives that exact sentence to
    // 私, and mergeExamples() dedupes by native string, so it would have been a
    // dead frame. validate-word-truth caught it.
    ["also", "も", "mo", "also, too", "Common", "u10",
      "お茶も飲みますか", "ocha mo nomimasu ka", "Will you have tea as well?"],
    ["four", "四", "yon", "four", "Numbers", "u4",
      "四時に会いましょう", "yoji ni aimashou", "Let's meet at four o'clock"],
    ["five", "五", "go", "five", "Numbers", "u4",
      "五分待ってください", "gofun matte kudasai", "Please wait five minutes"],
  ],

  // ===========================================================================
  // TURKISH — ben and sen, and no third person at all.
  // ===========================================================================
  tr: [
    ["we", "biz", "", "we", "People", "u4",
      "Biz İstanbul'dan geliyoruz.", "", "We come from Istanbul."],
    ["he", "o", "", "he, she", "People", "u4",
      "O benim kardeşim.", "", "He is my brother."],
    ["she", "o kadın", "", "she, that woman", "People", "u4",
      "O kadın benim annem.", "", "That woman is my mother."],
    ["son", "oğul", "", "son", "Family", "u4",
      "Oğlum okula gidiyor.", "", "My son is going to school."],
    ["grandmother", "büyükanne", "", "grandmother", "Family", "u4",
      "Büyükannem çay yapıyor.", "", "My grandmother is making tea."],
    ["rice", "pilav", "", "rice", "Food", "u5",
      "Pilav çok lezzetli.", "", "The rice is very tasty."],
    ["sleep", "uyumak", "", "to sleep", "Verbs", "u6",
      "Erken uyumak istiyorum.", "", "I want to sleep early."],
    ["think", "düşünmek", "", "to think", "Verbs", "u6",
      "Seni düşünüyorum.", "", "I am thinking about you."],
    ["year", "yıl", "", "year", "Time", "u9",
      "Bir yıl oldu.", "", "It has been a year."],
    ["market", "pazar", "", "market", "Places", "u7",
      "Pazara gidiyorum.", "", "I am going to the market."],
    ["howmuch", "ne kadar", "", "how much", "Questions", "u10",
      "Bu ne kadar?", "", "How much is this?"],
  ],

  // ===========================================================================
  // KOREAN — 저 and 너, no 그/그녀. Also no word for "family", which in Korean
  // is one of the first words anyone learns.
  // ===========================================================================
  ko: [
    ["he", "그", "geu", "he", "People", "u2",
      "그는 제 형이에요", "geuneun je hyeongieyo", "He is my older brother"],
    ["she", "그녀", "geunyeo", "she", "People", "u2",
      "그녀는 선생님이에요", "geunyeoneun seonsaengnimieyo", "She is a teacher"],
    ["family", "가족", "gajok", "family", "Family", "u3",
      "우리 가족은 네 명이에요", "uri gajogeun ne myeongieyo", "There are four in my family"],
    ["uncle", "삼촌", "samchon", "uncle", "Family", "u3",
      "삼촌은 부산에 살아요", "samchoneun Busane sarayo", "My uncle lives in Busan"],
    ["thirsty", "목말라요", "mongmallayo", "thirsty", "Feelings", "u11",
      "목말라요, 물 주세요", "mongmallayo, mul juseyo", "I'm thirsty, water please"],
    // 차 is both tea (茶) and car (車) and the pack already teaches it as tea,
    // so the car has to be the unambiguous 자동차.
    ["car", "자동차", "jadongcha", "car", "Transport", "u13",
      "자동차로 갈까요?", "jadongcharo galkkayo?", "Shall we go by car?"],
  ],

  // ===========================================================================
  // PERSIAN — no word for "drink" (خوردن covers eating, but نوشیدن is the verb),
  // no bathroom, no grandparents, and the thinnest pack in the app.
  // ===========================================================================
  fa: [
    ["drink", "نوشیدن", "nushidan", "to drink", "Verbs", "u7",
      "چای می‌نوشم", "chây minusham", "I drink tea"],
    ["bathroom", "دستشویی", "dastshuyi", "bathroom, toilet", "Places", "u8",
      "دستشویی کجاست؟", "dastshuyi kojâst", "Where is the bathroom?"],
    ["grandmother", "مادربزرگ", "mâdarbozorg", "grandmother", "Family", "u4",
      "مادربزرگ من در تهران است", "mâdarbozorg-e man dar Tehrân ast", "My grandmother is in Tehran"],
    ["grandfather", "پدربزرگ", "pedarbozorg", "grandfather", "Family", "u4",
      "پدربزرگ دکتر بود", "pedarbozorg doktor bud", "My grandfather was a doctor"],
    ["milk", "شیر", "shir", "milk", "Food", "u6",
      "شیر و نان می‌خواهم", "shir va nân mikhâham", "I want milk and bread"],
    ["sleep", "خوابیدن", "khâbidan", "to sleep", "Verbs", "u7",
      "می‌خواهم بخوابم", "mikhâham bekhâbam", "I want to sleep"],
    ["think", "فکر کردن", "fekr kardan", "to think", "Verbs", "u7",
      "به تو فکر می‌کنم", "be to fekr mikonam", "I am thinking of you"],
    ["work", "کار", "kâr", "work, job", "Common", "u7",
      "کار زیاد است", "kâr ziyâd ast", "There is a lot of work"],
    ["week", "هفته", "hafte", "week", "Time", "u8",
      "هفته آینده می‌آیم", "hafte-ye âyande miâyam", "I am coming next week"],
    ["year", "سال", "sâl", "year", "Time", "u8",
      "یک سال گذشت", "yek sâl gozasht", "A year has passed"],
    ["hotel", "هتل", "hotel", "hotel", "Places", "u8",
      "هتل نزدیک است", "hotel nazdik ast", "The hotel is near"],
    ["car", "ماشین", "mâshin", "car", "Places", "u8",
      "ماشین من قرمز است", "mâshin-e man ghermez ast", "My car is red"],
    ["also", "هم", "ham", "also, too", "Common", "u7",
      "من هم می‌آیم", "man ham miâyam", "I am coming too"],
    ["head", "سر", "sar", "head", "Body", "u5",
      "سرم درد می‌کند", "saram dard mikonad", "My head hurts"],
    ["hand", "دست", "dast", "hand", "Body", "u5",
      "دستت را بده", "dastet râ bede", "Give me your hand"],
    ["heart", "دل", "del", "heart", "Body", "u5",
      "دلم برایت تنگ شده", "delam barâyat tang shode", "I miss you"],
    ["black", "سیاه", "siyâh", "black", "Common", "u7",
      "چای سیاه می‌خواهم", "chây-e siyâh mikhâham", "I want black tea"],
    ["white", "سفید", "sefid", "white", "Common", "u7",
      "نان سفید", "nân-e sefid", "White bread"],
    ["sun", "خورشید", "khorshid", "sun", "Common", "u8",
      "خورشید گرم است", "khorshid garm ast", "The sun is warm"],
    ["rain", "باران", "bârân", "rain", "Common", "u8",
      "باران می‌آید", "bârân miâyad", "It is raining"],
    ["train", "قطار", "ghatâr", "train", "Places", "u8",
      "قطار دیر است", "ghatâr dir ast", "The train is late"],
  ],

  // ===========================================================================
  // MALAYALAM — no bathroom, no bread, no rice (in a Kerala pack), no year.
  // ===========================================================================
  ml: [
    ["bathroom", "കുളിമുറി", "kulimuri", "bathroom", "Places", "u8",
      "കുളിമുറി എവിടെയാണ്?", "kulimuri evideyaanu", "Where is the bathroom?"],
    ["bread", "റൊട്ടി", "rotti", "bread", "Food", "u6",
      "എനിക്ക് റൊട്ടി വേണം", "enikku rotti venam", "I want bread"],
    ["sleep", "ഉറങ്ങുക", "urangguka", "to sleep", "Verbs", "u7",
      "എനിക്ക് ഉറങ്ങണം", "enikku uranganam", "I want to sleep"],
    ["think", "വിചാരിക്കുക", "vichaarikkuka", "to think", "Verbs", "u7",
      "ഞാൻ നിന്നെ വിചാരിക്കുന്നു", "njaan ninne vichaarikkunnu", "I am thinking of you"],
    ["year", "വർഷം", "varsham", "year", "Time", "u8",
      "ഒരു വർഷം കഴിഞ്ഞു", "oru varsham kazhinju", "A year has passed"],
    ["hotel", "ഹോട്ടൽ", "hottal", "hotel", "Places", "u8",
      "ഹോട്ടൽ അടുത്താണ്", "hottal aduthaanu", "The hotel is near"],
    ["car", "കാർ", "kaar", "car", "Places", "u8",
      "കാർ വന്നു", "kaar vannu", "The car has come"],
    ["also", "കൂടി", "koodi", "also, too", "Common", "u7",
      "ഞാനും കൂടി വരാം", "njaanum koodi varaam", "I will come too"],
    ["head", "തല", "thala", "head", "Body", "u5",
      "എന്റെ തല വേദനിക്കുന്നു", "ente thala vedanikkunnu", "My head hurts"],
    ["hand", "കൈ", "kai", "hand", "Body", "u5",
      "കൈ കഴുകൂ", "kai kazhukoo", "Wash your hands"],
    ["heart", "ഹൃദയം", "hridayam", "heart", "Body", "u5",
      "എന്റെ ഹൃദയം നിറഞ്ഞു", "ente hridayam niranju", "My heart is full"],
    ["black", "കറുപ്പ്", "karuppu", "black", "Common", "u7",
      "കറുപ്പ് ചായ", "karuppu chaaya", "Black tea"],
    ["white", "വെളുപ്പ്", "veluppu", "white", "Common", "u7",
      "വെളുപ്പ് ഷർട്ട്", "veluppu shirt", "A white shirt"],
    ["sun", "സൂര്യൻ", "sooryan", "sun", "Common", "u8",
      "സൂര്യൻ ഉദിച്ചു", "sooryan udichu", "The sun has risen"],
    ["rain", "മഴ", "mazha", "rain", "Common", "u8",
      "മഴ പെയ്യുന്നു", "mazha peyyunnu", "It is raining"],
    ["train", "തീവണ്ടി", "theevandi", "train", "Places", "u8",
      "തീവണ്ടി വൈകി", "theevandi vaiki", "The train is late"],
  ],

  // ===========================================================================
  // TAMIL — same shape as Malayalam: no bathroom, no bread, no rice, no year.
  // ===========================================================================
  ta: [
    ["bathroom", "கழிவறை", "kazhivarai", "bathroom", "Places", "u8",
      "கழிவறை எங்கே?", "kazhivarai enge", "Where is the bathroom?"],
    ["bread", "ரொட்டி", "rotti", "bread", "Food", "u6",
      "எனக்கு ரொட்டி வேண்டும்", "enakku rotti vendum", "I want bread"],
    ["sleep", "தூங்க", "thoonga", "to sleep", "Verbs", "u7",
      "நான் தூங்க வேண்டும்", "naan thoonga vendum", "I need to sleep"],
    ["think", "நினைக்க", "ninaikka", "to think", "Verbs", "u7",
      "உன்னை நினைக்கிறேன்", "unnai ninaikkiren", "I am thinking of you"],
    ["year", "வருடம்", "varudam", "year", "Time", "u8",
      "ஒரு வருடம் ஆகிவிட்டது", "oru varudam aagivittathu", "A year has passed"],
    ["hotel", "ஹோட்டல்", "hottal", "hotel", "Places", "u8",
      "ஹோட்டல் அருகில் இருக்கிறது", "hottal arugil irukkirathu", "The hotel is near"],
    ["car", "கார்", "kaar", "car", "Places", "u8",
      "கார் வந்துவிட்டது", "kaar vanthuvittathu", "The car has come"],
    ["head", "தலை", "thalai", "head", "Body", "u5",
      "என் தலை வலிக்கிறது", "en thalai valikkirathu", "My head hurts"],
    ["hand", "கை", "kai", "hand", "Body", "u5",
      "கையை கழுவு", "kaiyai kazhuvu", "Wash your hands"],
    ["heart", "இதயம்", "ithayam", "heart", "Body", "u5",
      "என் இதயம் நிறைந்தது", "en ithayam nirainthathu", "My heart is full"],
    ["black", "கருப்பு", "karuppu", "black", "Common", "u7",
      "கருப்பு தேநீர்", "karuppu theneer", "Black tea"],
    ["white", "வெள்ளை", "vellai", "white", "Common", "u7",
      "வெள்ளை சட்டை", "vellai sattai", "A white shirt"],
    ["sun", "சூரியன்", "sooriyan", "sun", "Common", "u8",
      "சூரியன் உதித்தான்", "sooriyan uthithaan", "The sun has risen"],
    ["rain", "மழை", "mazhai", "rain", "Common", "u8",
      "மழை பெய்கிறது", "mazhai peygirathu", "It is raining"],
    ["train", "ரயில்", "rayil", "train", "Places", "u8",
      "ரயில் தாமதம்", "rayil thaamatham", "The train is late"],
  ],

  // ===========================================================================
  // SOMALI — no bathroom, no bread, no hungry, no year.
  // ===========================================================================
  so: [
    ["bathroom", "musqusha", "", "bathroom, toilet", "Places", "u8",
      "Musqushu waa xaggee?", "", "Where is the bathroom?"],
    ["bread", "rooti", "", "bread", "Food", "u6",
      "Waxaan doonayaa rooti.", "", "I want bread."],
    ["sleep", "hurdo", "", "to sleep, sleep", "Verbs", "u7",
      "Waan hurdayaa.", "", "I am sleeping."],
    ["think", "fikir", "", "to think, thought", "Verbs", "u7",
      "Waan ku fikirayaa.", "", "I am thinking about you."],
    ["year", "sannad", "", "year", "Time", "u8",
      "Sannad ayaa dhaafay.", "", "A year has passed."],
    ["hotel", "hudheel", "", "hotel", "Places", "u8",
      "Hudheelku waa dhow yahay.", "", "The hotel is near."],
    ["car", "gaari", "", "car", "Places", "u8",
      "Waxaan leeyahay gaari.", "", "I have a car."],
    ["also", "sidoo kale", "", "also, too", "Common", "u7",
      "Anigu sidoo kale waan imanayaa.", "", "I am coming too."],
    ["head", "madax", "", "head", "Body", "u5",
      "Madaxaygu wuu i xanuunayaa.", "", "My head hurts."],
    ["hand", "gacan", "", "hand", "Body", "u5",
      "Gacantaada i sii.", "", "Give me your hand."],
    ["heart", "wadne", "", "heart", "Body", "u5",
      "Wadnahaygu wuu buuxaa.", "", "My heart is full."],
    ["black", "madow", "", "black", "Common", "u7",
      "Shaah madow.", "", "Black tea."],
    ["white", "cadaan", "", "white", "Common", "u7",
      "Shaati cadaan ah.", "", "A white shirt."],
    ["sun", "qorrax", "", "sun", "Common", "u8",
      "Qorraxdu way kulushahay.", "", "The sun is hot."],
    ["rain", "roob", "", "rain", "Common", "u8",
      "Roob baa da'aya.", "", "It is raining."],
    ["train", "tareen", "", "train", "Places", "u8",
      "Tareenku waa daahay.", "", "The train is late."],
  ],

  // ===========================================================================
  // TAGALOG — no bathroom, no bread, no rice, no tea, no milk. A Filipino pack
  // without kanin is not a Filipino pack.
  // ===========================================================================
  tl: [
    ["bathroom", "banyo", "", "bathroom", "Places", "u8",
      "Nasaan ang banyo?", "", "Where is the bathroom?"],
    ["bread", "tinapay", "", "bread", "Food", "u6",
      "Bumili ako ng tinapay.", "", "I bought bread."],
    ["tea", "tsaa", "", "tea", "Food", "u6",
      "Gusto ko ng tsaa.", "", "I want tea."],
    ["milk", "gatas", "", "milk", "Food", "u6",
      "May gatas ba?", "", "Is there milk?"],
    ["think", "isipin", "", "to think", "Verbs", "u7",
      "Iniisip kita.", "", "I am thinking of you."],
    ["week", "linggo", "", "week", "Time", "u8",
      "Sa susunod na linggo.", "", "Next week."],
    ["year", "taon", "", "year", "Time", "u8",
      "Isang taon na ang lumipas.", "", "A year has passed."],
    ["hotel", "hotel", "", "hotel", "Places", "u8",
      "Malapit ang hotel.", "", "The hotel is near."],
    ["car", "kotse", "", "car", "Places", "u8",
      "May kotse kami.", "", "We have a car."],
    ["head", "ulo", "", "head", "Body", "u5",
      "Masakit ang ulo ko.", "", "My head hurts."],
    ["hand", "kamay", "", "hand", "Body", "u5",
      "Hugasan mo ang kamay mo.", "", "Wash your hands."],
    ["heart", "puso", "", "heart", "Body", "u5",
      "Puno ang puso ko.", "", "My heart is full."],
    ["black", "itim", "", "black", "Common", "u7",
      "Itim na kape.", "", "Black coffee."],
    ["white", "puti", "", "white", "Common", "u7",
      "Puting damit.", "", "White clothes."],
    ["rain", "ulan", "", "rain", "Common", "u8",
      "Umuulan na.", "", "It is raining."],
    ["train", "tren", "", "train", "Places", "u8",
      "Nahuli ang tren.", "", "The train was late."],
  ],

  // ===========================================================================
  // BENGALI — no bathroom, no near/far, and no way to say "me too".
  // ===========================================================================
  bn: [
    ["bathroom", "বাথরুম", "bathroom", "bathroom", "Places", "u7",
      "বাথরুম কোথায়?", "bathroom kothay?", "Where is the bathroom?"],
    ["family", "পরিবার", "poribar", "family", "Family", "u3",
      "আমার পরিবার বড়", "amar poribar boro", "My family is big"],
    ["thirsty", "তেষ্টা", "teshta", "thirst, thirsty", "Feelings", "u10",
      "আমার তেষ্টা পেয়েছে", "amar teshta peyeche", "I am thirsty"],
    ["sad", "দুঃখী", "dukkhi", "sad", "Feelings", "u10",
      "আমি আজ দুঃখী", "ami aaj dukkhi", "I am sad today"],
    ["near", "কাছে", "kache", "near, close", "Places", "u7",
      "বাজার কাছে", "bajar kache", "The market is close"],
    ["far", "দূরে", "dure", "far", "Places", "u7",
      "স্টেশন দূরে", "station dure", "The station is far"],
    ["hotel", "হোটেল", "hotel", "hotel", "Places", "u7",
      "হোটেল কোথায়?", "hotel kothay?", "Where is the hotel?"],
    ["car", "গাড়ি", "gari", "car", "Places", "u7",
      "গাড়ি এসেছে", "gari eseche", "The car has come"],
    ["also", "ও", "o", "also, too", "Connectors", "u9",
      "আমিও যাব", "amio jabo", "I will go too"],
    ["train", "ট্রেন", "train", "train", "Places", "u7",
      "ট্রেন দেরি", "train deri", "The train is late"],
  ],

  // ===========================================================================
  // PUNJABI — the pack did not teach "eat". Or bathroom, son, daughter, rice.
  // Shahmukhi, matching the rest of the pack.
  // ===========================================================================
  pa: [
    ["bathroom", "غسل خانہ", "ghusal khana", "bathroom", "Places", "u6",
      "غسل خانہ کتھے اے؟", "ghusal khana kithe ae", "Where is the bathroom?"],
    ["son", "پتر", "puttar", "son", "Family", "u3",
      "میرا پتر سکول جاندا اے", "mera puttar school jaanda ae", "My son goes to school"],
    ["daughter", "دھی", "dhee", "daughter", "Family", "u3",
      "میری دھی ڈاکٹر اے", "meri dhee doctor ae", "My daughter is a doctor"],
    ["family", "ٹبر", "tabbar", "family", "Family", "u3",
      "سارا ٹبر آیا", "saara tabbar aaya", "The whole family came"],
    ["thirsty", "تیہہ", "teh", "thirst, thirsty", "Feelings", "u6",
      "مینوں تیہہ لگی اے", "mainu teh lagi ae", "I am thirsty"],
    ["rice", "چول", "chaul", "rice", "Food", "u5",
      "چول تیار نیں", "chaul taiyaar nen", "The rice is ready"],
    ["market", "بازار", "bazaar", "market", "Places", "u6",
      "میں بازار جا رہیا ہاں", "main bazaar ja rahiya haan", "I am going to the market"],
    ["sun", "سورج", "sooraj", "sun", "Common", "u6",
      "سورج چڑھ گیا", "sooraj charh gaya", "The sun has risen"],
  ],

  // ===========================================================================
  // NIGERIAN PIDGIN — no son, daughter, family, rice, milk, market or numbers
  // past three.
  // ===========================================================================
  pcm: [
    ["son", "pikin boy", "", "son", "Family", "u3",
      "My pikin boy dey school.", "", "My son is at school."],
    ["daughter", "pikin girl", "", "daughter", "Family", "u3",
      "My pikin girl na doctor.", "", "My daughter is a doctor."],
    ["family", "famili", "", "family", "Family", "u3",
      "My famili big well well.", "", "My family is very big."],
    ["thirsty", "tosty", "", "thirsty", "Feelings", "u5",
      "Water dey? I tosty.", "", "Is there water? I'm thirsty."],
    ["rice", "rais", "", "rice", "Food", "u5",
      "I wan chop rais.", "", "I want to eat rice."],
    ["milk", "milk", "", "milk", "Food", "u5",
      "Put milk for di tea.", "", "Put milk in the tea."],
    ["market", "market", "", "market", "Places", "u6",
      "I dey go market.", "", "I am going to the market."],
    ["four", "fo", "", "four", "Numbers", "u4",
      "Fo pesin dey come.", "", "Four people are coming."],
    ["five", "faiv", "", "five", "Numbers", "u4",
      "Faiv minit remain.", "", "Five minutes left."],
  ],

  // ===========================================================================
  // INDONESIAN — no siblings, no family, no milk, no market.
  // ===========================================================================
  id: [
    ["brother", "kakak laki-laki", "", "older brother", "Family", "u3",
      "Kakak laki-laki saya guru.", "", "My older brother is a teacher."],
    ["sister", "kakak perempuan", "", "older sister", "Family", "u3",
      "Kakak perempuan saya di Jakarta.", "", "My older sister is in Jakarta."],
    ["son", "anak laki-laki", "", "son", "Family", "u3",
      "Anak laki-laki saya sekolah.", "", "My son goes to school."],
    ["daughter", "anak perempuan", "", "daughter", "Family", "u3",
      "Anak perempuan saya dokter.", "", "My daughter is a doctor."],
    ["family", "keluarga", "", "family", "Family", "u3",
      "Keluarga saya besar.", "", "My family is big."],
    ["milk", "susu", "", "milk", "Food", "u5",
      "Saya mau susu.", "", "I want milk."],
    ["market", "pasar", "", "market", "Places", "u6",
      "Saya pergi ke pasar.", "", "I am going to the market."],
  ],

  // ===========================================================================
  // SPANISH / FRENCH — small, specific holes: no word for family, hungry,
  // thirsty or tea in either.
  // ===========================================================================
  es: [
    ["family", "la familia", "", "family", "Family", "u3",
      "Mi familia es grande.", "", "My family is big."],
    ["tea", "el té", "", "tea", "Food", "u5",
      "Un té, por favor.", "", "A tea, please."],
  ],
  fr: [
    ["family", "la famille", "", "family", "Family", "u3",
      "Ma famille est grande.", "", "My family is big."],
    ["tea", "le thé", "", "tea", "Food", "u5",
      "Un thé, s'il vous plaît.", "", "A tea, please."],
    ["more", "plus", "", "more", "Common", "u9",
      "Encore un peu plus.", "", "A little more."],
  ],

  // ===========================================================================
  // URDU / CHINESE — one gap each, plus Chinese had no word for bread.
  // ===========================================================================
  ur: [
    ["family", "خاندان", "khandaan", "family", "Family", "u3",
      "میرا خاندان بڑا ہے", "mera khandaan bara hai", "My family is big"],
  ],
  zh: [
    ["family", "家人", "jiārén", "family", "Family", "u3",
      "我家人很多", "wǒ jiārén hěn duō", "I have a big family"],
    ["bread", "面包", "miànbāo", "bread", "Food", "u5",
      "我要一个面包", "wǒ yào yí ge miànbāo", "I want a piece of bread"],
  ],
};

// =============================================================================
// SECOND PASS — the four packs that had no way to ASK the price, plus two
// stragglers.
//
// These were hidden until the "how much" concept stopped accepting the noun
// "price" as proof of teaching it. Knowing the word for price is not knowing
// how to ask what something costs, and asking is the survival skill. Kept
// separate from the first pass so the record of what each pass found stays
// legible.
// =============================================================================
export const CORE_FILL_2 = {
  ml: [
    ["howmuch", "എത്ര", "ethra", "how much, how many", "Questions", "u8",
      "ഇത് എത്രയാണ്?", "ithu ethrayaanu", "How much is this?"],
  ],
  ta: [
    ["howmuch", "எவ்வளவு", "evvalavu", "how much, how many", "Questions", "u8",
      "இது எவ்வளவு?", "ithu evvalavu", "How much is this?"],
  ],
  so: [
    ["howmuch", "immisa", "", "how much, how many", "Questions", "u8",
      "Waa immisa?", "", "How much is it?"],
  ],
  pcm: [
    ["howmuch", "How much", "", "how much", "Questions", "u6",
      "How much be dis one?", "", "How much is this one?"],
    ["more", "More", "", "more", "Common", "u5",
      "Abeg give me more water.", "", "Please give me more water."],
  ],
  tl: [
    ["also", "din", "", "also, too", "Common", "u7",
      "Pupunta rin ako.", "", "I am going too."],
  ],
};
