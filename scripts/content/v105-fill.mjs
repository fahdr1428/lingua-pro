// =============================================================================
// v105-fill.mjs — finish counting, and the words for a day at home.
//
// TWO GAPS, BOTH MEASURED RATHER THAN GUESSED.
//
// 1. NUMBERS STOPPED AT FIVE. Eleven of twenty-one packs could not count past
//    five, and eighteen were missing at least one of six–ten or a hundred:
//
//        Persian, Indonesian, Malayalam, Punjabi, Pidgin, Somali, Tamil,
//        Tagalog         — nothing after five (6 missing each)
//        Hindi, Vietnamese, Yoruba — 5 missing      Bengali — 4
//        Arabic, Korean, Chinese — 2               Japanese, Turkish — 1
//
//    75 missing words. A learner who can say "five" but not "seven" cannot
//    say a price, a time, an age or a phone number — which is most of what
//    numbers are for. six–ten and hundred are added to coreVocabulary.js at
//    tier 2 (everyday), so a future pack that skips them is reported.
//
// 2. THE WORDS FOR A DAY AT HOME. Scanning a hundred-odd high-frequency
//    meanings across every pack, these were taught by almost nobody:
//
//        to cook   0/21     to ask    0/21     medicine  0/21
//        pain      1/21     room      2/21     to sit    4/21
//        beautiful 4/21     eye       6/21     morning   8/21   night 9/21
//
//    They are one situation, not a grab bag: this app's learner is usually
//    trying to talk to family — sitting down together, what's cooking, asking
//    something, "does it hurt?", "have you taken your medicine?". Tier 3
//    (reach), matching how v104 introduced its batch.
//
// Fields: [conceptId, lemma, translit, translation, category, unit,
//          exNative, exTranslit, exTranslation]
// translit is "" for the Latin-script languages, which carry none.
//
// UNIT PLACEMENT follows each pack's own layout, measured: numbers go beside
// that pack's existing one–five; morning/night beside "today"; verbs,
// adjectives and places exactly where v104's tier-3 fill put its verbs,
// adjectives and "door"; eye/pain/medicine beside "hand" in the Body unit.
//
// COLLISIONS AVOIDED, found by checking each pack before writing:
//   · fa  نه already means "no" — "nine" is written نُه, as teaching texts do
//   · ja  聞く is already "to listen" — "to ask" is 質問する
//   · id  sakit is already "sick" — "pain" is rasa sakit
//   · pcm fine is already "fine, well" — "beautiful" is fine-fine
//   · de/es  morgen / mañana are already "tomorrow" — "am Morgen",
//            "por la mañana" (in the morning)
//   · so  "il" (eye) inflects to "ish-" and can't appear in its own sentence —
//         taught as the plural "indho", which is what you'd say anyway
//
// CONFIDENCE: Somali and Yoruba sentences are kept deliberately short and are
// flagged for a native-speaker pass, as v104's were.
// =============================================================================

export const V105_FILL = {
  ar: [
    ["six", "ستة", "sitta", "six", "Numbers", "u4", "ستة أشخاص", "sittat ashkhas", "Six people"],
    ["seven", "سبعة", "sab'a", "seven", "Numbers", "u4", "سبعة أيام", "sab'at ayyam", "Seven days"],
    ["night", "ليل", "layl", "night", "Time", "u8", "الليل بارد", "al-layl baarid", "The night is cold"],
    ["to_sit", "يجلس", "yajlis", "to sit", "Verbs", "u6", "يجلس الولد هنا", "yajlis al-walad huna", "The boy sits here"],
    ["to_cook", "يطبخ", "yatbukh", "to cook", "Verbs", "u6", "أبي يطبخ الأكل", "abi yatbukh al-akl", "My father cooks the food"],
    ["to_ask", "يسأل", "yas'al", "to ask", "Verbs", "u6", "أبي يسأل سؤالا", "abi yas'al su'alan", "My father asks a question"],
    ["beautiful", "جميل", "jameel", "beautiful", "Common", "u10", "هذا المكان جميل", "hadha al-makan jameel", "This place is beautiful"],
    ["eye", "عين", "ayn", "eye", "Body", "u2", "عيني حمراء", "ayni hamra", "My eye is red"],
    ["pain", "ألم", "alam", "pain", "Body", "u2", "عندي ألم هنا", "indi alam huna", "I have pain here"],
    ["medicine", "دواء", "dawa", "medicine", "Body", "u2", "خذ الدواء", "khudh ad-dawa", "Take the medicine"],
  ],

  bn: [
    ["six", "ছয়", "choy", "six", "Numbers", "u4", "ছয় টাকা", "choy taka", "Six taka"],
    ["seven", "সাত", "sat", "seven", "Numbers", "u4", "সাত দিন", "sat din", "Seven days"],
    ["eight", "আট", "at", "eight", "Numbers", "u4", "আট ঘণ্টা", "at ghanta", "Eight hours"],
    ["nine", "নয়", "noy", "nine", "Numbers", "u4", "নয় জন", "noy jon", "Nine people"],
    ["to_sit", "বসা", "bosa", "to sit", "Verbs", "u6", "এখানে বসা যায়", "ekhane bosa jay", "You can sit here"],
    ["to_cook", "রান্না করা", "ranna kora", "to cook", "Verbs", "u6", "মা রান্না করছে", "ma ranna korche", "Mother is cooking"],
    ["to_ask", "জিজ্ঞাসা করা", "jiggasha kora", "to ask", "Verbs", "u6", "ওকে জিজ্ঞাসা করো", "oke jiggasha koro", "Ask him"],
    ["room", "ঘর", "ghor", "room", "Places", "u7", "আমার ঘর ছোট", "amar ghor choto", "My room is small"],
    ["beautiful", "সুন্দর", "sundor", "beautiful", "Common", "u10", "শহরটা খুব সুন্দর", "shohorta khub sundor", "The city is very beautiful"],
    ["eye", "চোখ", "chokh", "eye", "Body", "u2", "আমার চোখ লাল", "amar chokh lal", "My eyes are red"],
    ["pain", "ব্যথা", "byatha", "pain", "Body", "u2", "আমার মাথায় ব্যথা", "amar mathay byatha", "I have a headache"],
    ["medicine", "ওষুধ", "oshudh", "medicine", "Body", "u2", "ওষুধ খাও", "oshudh khao", "Take the medicine"],
  ],

  de: [
    ["morning", "am Morgen", "", "in the morning", "Time", "u8", "Am Morgen trinke ich Kaffee", "", "In the morning I drink coffee"],
    ["night", "die Nacht", "", "night", "Time", "u8", "Die Nacht ist kalt", "", "The night is cold"],
    ["to_sit", "sitzen", "", "to sit", "Verbs", "u6", "Ich sitze hier", "", "I am sitting here"],
    ["to_cook", "kochen", "", "to cook", "Verbs", "u6", "Meine Mutter kocht gut", "", "My mother cooks well"],
    ["to_ask", "fragen", "", "to ask", "Verbs", "u6", "Darf ich etwas fragen?", "", "May I ask something?"],
    ["room", "das Zimmer", "", "room", "Places", "u7", "Das Zimmer ist klein", "", "The room is small"],
    ["eye", "das Auge", "", "eye", "Body", "u11", "Das Auge ist rot", "", "The eye is red"],
    ["medicine", "das Medikament", "", "medicine", "Body", "u11", "Das Medikament hilft", "", "The medicine helps"],
  ],

  es: [
    ["morning", "por la mañana", "", "in the morning", "Time", "u8", "Por la mañana bebo café", "", "In the morning I drink coffee"],
    ["to_sit", "sentarse", "", "to sit", "Verbs", "u6", "Quiero sentarme aquí", "", "I want to sit here"],
    ["to_cook", "cocinar", "", "to cook", "Verbs", "u6", "Mi madre cocina muy bien", "", "My mother cooks very well"],
    ["to_ask", "preguntar", "", "to ask", "Verbs", "u6", "¿Puedo preguntar algo?", "", "Can I ask something?"],
    ["room", "la habitación", "", "room", "Places", "u7", "La habitación es pequeña", "", "The room is small"],
    ["beautiful", "bonito", "", "beautiful, pretty", "Common", "u13", "Es un lugar muy bonito", "", "It is a very beautiful place"],
    ["pain", "el dolor", "", "pain", "Body", "u11", "El dolor es muy fuerte", "", "The pain is very strong"],
    ["medicine", "la medicina", "", "medicine", "Body", "u11", "La medicina está aquí", "", "The medicine is here"],
  ],

  fa: [
    ["six", "شش", "shesh", "six", "Numbers", "u8", "شش ماه", "shesh mâh", "Six months"],
    ["seven", "هفت", "haft", "seven", "Numbers", "u8", "هفت روز", "haft ruz", "Seven days"],
    ["eight", "هشت", "hasht", "eight", "Numbers", "u8", "هشت نفر", "hasht nafar", "Eight people"],
    ["nine", "نُه", "noh", "nine", "Numbers", "u8", "نُه سال", "noh sâl", "Nine years"],
    ["ten", "ده", "dah", "ten", "Numbers", "u8", "ده دقیقه", "dah daqiqe", "Ten minutes"],
    ["hundred", "صد", "sad", "hundred", "Numbers", "u8", "صد تومان", "sad tomân", "A hundred tomans"],
    ["morning", "صبح", "sobh", "morning", "Time", "u8", "صبح چای می‌خورم", "sobh châi mikhoram", "In the morning I drink tea"],
    ["night", "شب", "shab", "night", "Time", "u8", "شب سرد است", "shab sard ast", "The night is cold"],
    ["to_sit", "نشستن", "neshastan", "to sit", "Verbs", "u7", "او اینجا نشست", "u injâ neshast", "He sat here"],
    ["to_cook", "پختن", "pokhtan", "to cook", "Verbs", "u7", "مادرم غذا پخت", "mâdaram ghazâ pokht", "My mother cooked food"],
    ["to_ask", "پرسیدن", "porsidan", "to ask", "Verbs", "u7", "از او پرسیدم", "az u porsidam", "I asked him"],
    ["room", "اتاق", "otâgh", "room", "Places", "u8", "اتاق من کوچک است", "otâgh-e man kuchak ast", "My room is small"],
    ["beautiful", "زیبا", "zibâ", "beautiful", "Common", "u7", "این شهر زیباست", "in shahr zibâst", "This city is beautiful"],
    ["eye", "چشم", "cheshm", "eye", "Body", "u5", "چشمم درد می‌کند", "cheshmam dard mikonad", "My eye hurts"],
    ["pain", "درد", "dard", "pain", "Body", "u5", "درد دارم", "dard dâram", "I am in pain"],
    ["medicine", "دارو", "dâru", "medicine", "Body", "u5", "دارو بخور", "dâru bokhor", "Take the medicine"],
  ],

  fr: [
    ["to_sit", "s'asseoir", "", "to sit", "Verbs", "u6", "Il veut s'asseoir ici", "", "He wants to sit here"],
    ["to_cook", "cuisiner", "", "to cook", "Verbs", "u6", "Ma mère cuisine bien", "", "My mother cooks well"],
    ["to_ask", "demander", "", "to ask", "Verbs", "u6", "Je peux demander quelque chose ?", "", "Can I ask something?"],
    ["room", "la chambre", "", "room, bedroom", "Places", "u7", "La chambre est petite", "", "The room is small"],
    ["beautiful", "beau", "", "beautiful", "Common", "u13", "C'est très beau", "", "It is very beautiful"],
    ["pain", "la douleur", "", "pain", "Body", "u11", "La douleur est forte", "", "The pain is strong"],
    ["medicine", "le médicament", "", "medicine", "Body", "u11", "Le médicament est ici", "", "The medicine is here"],
  ],

  hi: [
    ["six", "छह", "chhah", "six", "Numbers", "u4", "छह बजे", "chhah baje", "Six o'clock"],
    ["seven", "सात", "saat", "seven", "Numbers", "u4", "सात दिन", "saat din", "Seven days"],
    ["eight", "आठ", "aath", "eight", "Numbers", "u4", "आठ लोग", "aath log", "Eight people"],
    ["nine", "नौ", "nau", "nine", "Numbers", "u4", "नौ रुपये", "nau rupaye", "Nine rupees"],
    ["hundred", "सौ", "sau", "hundred", "Numbers", "u4", "सौ साल", "sau saal", "A hundred years"],
    ["to_sit", "बैठना", "baithna", "to sit", "Verbs", "u6", "यहाँ बैठो", "yahan baitho", "Sit here"],
    ["to_cook", "पकाना", "pakaana", "to cook", "Verbs", "u6", "माँ खाना पकाती है", "maa khana pakaati hai", "Mother cooks food"],
    ["to_ask", "पूछना", "poochhna", "to ask", "Verbs", "u6", "उससे पूछो", "usse poochho", "Ask him"],
    ["room", "कमरा", "kamra", "room", "Places", "u7", "मेरा कमरा छोटा है", "mera kamra chota hai", "My room is small"],
    ["beautiful", "सुंदर", "sundar", "beautiful", "Common", "u10", "यह शहर सुंदर है", "yeh shehar sundar hai", "This city is beautiful"],
    ["eye", "आँख", "aankh", "eye", "Body", "u2", "मेरी आँख में दर्द है", "meri aankh mein dard hai", "I have pain in my eye"],
    ["pain", "दर्द", "dard", "pain", "Body", "u2", "मुझे दर्द है", "mujhe dard hai", "I am in pain"],
    ["medicine", "दवा", "dava", "medicine", "Body", "u2", "दवा खाओ", "dava khao", "Take the medicine"],
  ],

  id: [
    ["six", "Enam", "", "six", "Numbers", "u4", "Enam hari lagi", "", "Six more days"],
    ["seven", "Tujuh", "", "seven", "Numbers", "u4", "Jam tujuh pagi", "", "Seven in the morning"],
    ["eight", "Delapan", "", "eight", "Numbers", "u4", "Delapan orang", "", "Eight people"],
    ["nine", "Sembilan", "", "nine", "Numbers", "u4", "Sembilan ribu rupiah", "", "Nine thousand rupiah"],
    ["ten", "Sepuluh", "", "ten", "Numbers", "u4", "Sepuluh menit", "", "Ten minutes"],
    ["hundred", "Seratus", "", "hundred", "Numbers", "u4", "Seratus ribu rupiah", "", "A hundred thousand rupiah"],
    ["morning", "pagi", "", "morning", "Time", "u5", "Setiap pagi saya minum kopi", "", "Every morning I drink coffee"],
    ["night", "malam", "", "night", "Time", "u5", "Malam ini dingin", "", "It is cold tonight"],
    ["to_sit", "duduk", "", "to sit", "Verbs", "u6", "Silakan duduk", "", "Please sit down"],
    ["to_cook", "memasak", "", "to cook", "Verbs", "u6", "Ibu memasak nasi", "", "Mother is cooking rice"],
    ["to_ask", "bertanya", "", "to ask", "Verbs", "u6", "Boleh saya bertanya?", "", "May I ask?"],
    ["room", "kamar", "", "room", "Places", "u6", "Kamar saya kecil", "", "My room is small"],
    ["beautiful", "indah", "", "beautiful", "Common", "u6", "Pantai ini indah", "", "This beach is beautiful"],
    ["eye", "mata", "", "eye", "Body", "u2", "Mata saya merah", "", "My eyes are red"],
    ["pain", "rasa sakit", "", "pain", "Body", "u2", "Rasa sakitnya sudah hilang", "", "The pain is gone"],
    ["medicine", "obat", "", "medicine", "Body", "u2", "Saya perlu obat", "", "I need medicine"],
  ],

  ja: [
    ["six", "六", "roku", "six", "Numbers", "u4", "六時です", "rokuji desu", "It's six o'clock"],
    ["morning", "朝", "asa", "morning", "Time", "u8", "朝ごはんを食べます", "asagohan wo tabemasu", "I eat breakfast"],
    ["night", "夜", "yoru", "night", "Time", "u8", "夜は静かです", "yoru wa shizuka desu", "The night is quiet"],
    ["to_sit", "座る", "suwaru", "to sit", "Verbs", "u6", "私はここに座る", "watashi wa koko ni suwaru", "I will sit here"],
    ["to_cook", "料理する", "ryouri suru", "to cook", "Verbs", "u6", "母は毎日料理する", "haha wa mainichi ryouri suru", "My mother cooks every day"],
    ["to_ask", "質問する", "shitsumon suru", "to ask (a question)", "Verbs", "u6", "先生に質問する", "sensei ni shitsumon suru", "I will ask the teacher a question"],
    ["room", "部屋", "heya", "room", "Places", "u7", "私の部屋は小さいです", "watashi no heya wa chiisai desu", "My room is small"],
    ["beautiful", "きれい", "kirei", "beautiful, clean", "Common", "u10", "この花はきれいです", "kono hana wa kirei desu", "This flower is beautiful"],
    ["eye", "目", "me", "eye", "Body", "u2", "目が痛いです", "me ga itai desu", "My eye hurts"],
    ["medicine", "薬", "kusuri", "medicine", "Body", "u2", "薬を飲みます", "kusuri wo nomimasu", "I take medicine"],
  ],

  ko: [
    ["six", "여섯", "yeoseot", "six", "Numbers", "u4", "여섯 시", "yeoseot si", "Six o'clock"],
    ["seven", "일곱", "ilgop", "seven", "Numbers", "u4", "일곱 명", "ilgop myeong", "Seven people"],
    ["to_sit", "앉다", "anjda", "to sit", "Verbs", "u6", "여기 앉으세요", "yeogi anjeuseyo", "Please sit here"],
    ["to_cook", "요리하다", "yorihada", "to cook", "Verbs", "u6", "요리하는 것을 좋아해요", "yorihaneun geoseul joahaeyo", "I like cooking"],
    ["to_ask", "물어보다", "mureoboda", "to ask", "Verbs", "u6", "선생님께 물어보세요", "seonsaengnimkke mureoboseyo", "Ask the teacher"],
    ["room", "방", "bang", "room", "Places", "u7", "방이 작아요", "bangi jagayo", "The room is small"],
    ["beautiful", "아름답다", "areumdapda", "beautiful", "Common", "u10", "경치가 아름답다", "gyeongchiga areumdapda", "The view is beautiful"],
    ["medicine", "약", "yak", "medicine", "Body", "u11", "약 먹었어요?", "yak meogeosseoyo?", "Did you take your medicine?"],
  ],

  ml: [
    ["six", "ആറ്", "aaru", "six", "Numbers", "u8", "ആറ് മണി", "aaru mani", "Six o'clock"],
    ["seven", "ഏഴ്", "ezhu", "seven", "Numbers", "u8", "ഏഴ് ദിവസം", "ezhu divasam", "Seven days"],
    ["eight", "എട്ട്", "ettu", "eight", "Numbers", "u8", "എട്ട് പേർ", "ettu per", "Eight people"],
    ["nine", "ഒമ്പത്", "onpathu", "nine", "Numbers", "u8", "ഒമ്പത് മണി", "onpathu mani", "Nine o'clock"],
    ["ten", "പത്ത്", "pathu", "ten", "Numbers", "u8", "പത്ത് രൂപ", "pathu roopa", "Ten rupees"],
    ["hundred", "നൂറ്", "nooru", "hundred", "Numbers", "u8", "നൂറ് വർഷം", "nooru varsham", "A hundred years"],
    ["morning", "രാവിലെ", "raavile", "morning, in the morning", "Time", "u8", "രാവിലെ ഞാൻ ചായ കുടിക്കും", "raavile njaan chaaya kudikkum", "In the morning I drink tea"],
    ["night", "രാത്രി", "raathri", "night", "Time", "u8", "രാത്രി തണുപ്പാണ്", "raathri thanuppaanu", "The night is cold"],
    ["to_cook", "പാചകം ചെയ്യുക", "paachakam cheyyuka", "to cook", "Verbs", "u7", "അമ്മ പാചകം ചെയ്യുന്നു", "amma paachakam cheyyunnu", "Mother is cooking"],
    ["to_ask", "ചോദിക്കുക", "chodikkuka", "to ask", "Verbs", "u7", "അവനോട് ചോദിക്കൂ", "avanodu chodikkoo", "Ask him"],
    ["room", "മുറി", "muri", "room", "Places", "u7", "എന്റെ മുറി ചെറുതാണ്", "ente muri cheruthaanu", "My room is small"],
    ["beautiful", "സുന്ദരം", "sundaram", "beautiful", "Common", "u7", "ഈ സ്ഥലം സുന്ദരമാണ്", "ee sthalam sundaramaanu", "This place is beautiful"],
    ["eye", "കണ്ണ്", "kannu", "eye", "Body", "u5", "കണ്ണ് വേദനിക്കുന്നു", "kannu vedanikkunnu", "My eye hurts"],
    ["pain", "വേദന", "vedana", "pain", "Body", "u5", "എനിക്ക് വേദനയുണ്ട്", "enikku vedanayundu", "I am in pain"],
    ["medicine", "മരുന്ന്", "marunnu", "medicine", "Body", "u5", "മരുന്ന് കഴിക്കൂ", "marunnu kazhikkoo", "Take the medicine"],
  ],

  pa: [
    ["six", "چھ", "chhe", "six", "Numbers", "u4", "چھ وجے", "chhe vaje", "Six o'clock"],
    ["seven", "ست", "satt", "seven", "Numbers", "u4", "ست دن", "satt din", "Seven days"],
    ["eight", "اٹھ", "atth", "eight", "Numbers", "u4", "اٹھ بندے", "atth bande", "Eight people"],
    ["nine", "نو", "nau", "nine", "Numbers", "u4", "نو روپے", "nau rupaye", "Nine rupees"],
    ["ten", "دس", "das", "ten", "Numbers", "u4", "دس منٹ", "das minat", "Ten minutes"],
    ["hundred", "سو", "sau", "hundred", "Numbers", "u4", "سو سال", "sau saal", "A hundred years"],
    ["to_sit", "بیٹھنا", "baithna", "to sit", "Verbs", "u6", "اِتھے بیٹھو", "ithe baitho", "Sit here"],
    ["to_cook", "پکانا", "pakaana", "to cook", "Verbs", "u6", "ماں روٹی پکاندی اے", "maan roti pakaandi ae", "Mother is cooking roti"],
    ["to_ask", "پچھنا", "puchhna", "to ask", "Verbs", "u6", "اوہنوں پچھو", "ohnu puchho", "Ask him"],
    ["room", "کمرا", "kamra", "room", "Places", "u6", "میرا کمرا نکا اے", "mera kamra nikka ae", "My room is small"],
    ["beautiful", "سوہنا", "sohna", "beautiful", "Common", "u6", "پنڈ بہت سوہنا اے", "pind bahut sohna ae", "The village is very beautiful"],
    ["eye", "اکھ", "akh", "eye", "Body", "u2", "میری اکھ دکھدی اے", "meri akh dukhdi ae", "My eye hurts"],
    ["pain", "درد", "dard", "pain", "Body", "u2", "مینوں درد اے", "mainu dard ae", "I am in pain"],
    ["medicine", "دوائی", "davaai", "medicine", "Body", "u2", "دوائی کھاؤ", "davaai khao", "Take the medicine"],
  ],

  pcm: [
    ["six", "siks", "", "six", "Numbers", "u4", "Siks pikin dey house", "", "Six children are in the house"],
    ["seven", "seven", "", "seven", "Numbers", "u4", "Seven days dey one week", "", "There are seven days in a week"],
    ["eight", "eit", "", "eight", "Numbers", "u4", "Di bus go comot for eit", "", "The bus leaves at eight"],
    ["nine", "nain", "", "nine", "Numbers", "u4", "Nain pesin dey line", "", "Nine people are in the queue"],
    ["ten", "ten", "", "ten", "Numbers", "u4", "E cost ten naira", "", "It costs ten naira"],
    ["hundred", "hundred", "", "hundred", "Numbers", "u4", "Hundred naira go do", "", "A hundred naira will do"],
    ["morning", "morning", "", "morning", "Time", "u2", "Every morning I dey drink tea", "", "Every morning I drink tea"],
    ["night", "night", "", "night", "Time", "u2", "Night don reach", "", "Night has come"],
    ["to_sit", "sidon", "", "to sit, to sit down", "Verbs", "u6", "Sidon for here", "", "Sit down here"],
    ["to_cook", "cook", "", "to cook", "Verbs", "u6", "My mama dey cook rice", "", "My mother is cooking rice"],
    ["to_ask", "ask", "", "to ask", "Verbs", "u6", "Make I ask you one question", "", "Let me ask you a question"],
    ["room", "room", "", "room", "Places", "u6", "My room small", "", "My room is small"],
    ["beautiful", "fine-fine", "", "beautiful", "Common", "u6", "Dat house fine-fine", "", "That house is beautiful"],
    ["eye", "eye", "", "eye", "Body", "u2", "My eye dey pain me", "", "My eye hurts"],
    ["pain", "pain", "", "pain", "Body", "u2", "Di pain don go", "", "The pain is gone"],
    ["medicine", "medicine", "", "medicine", "Body", "u2", "Take dis medicine", "", "Take this medicine"],
  ],

  so: [
    ["six", "lix", "", "six", "Numbers", "u8", "Lix saacadood", "", "Six hours"],
    ["seven", "toddoba", "", "seven", "Numbers", "u8", "Toddoba maalmood", "", "Seven days"],
    ["eight", "siddeed", "", "eight", "Numbers", "u8", "Siddeed qof", "", "Eight people"],
    ["nine", "sagaal", "", "nine", "Numbers", "u8", "Sagaal doolar", "", "Nine dollars"],
    ["ten", "toban", "", "ten", "Numbers", "u8", "Toban daqiiqo", "", "Ten minutes"],
    ["hundred", "boqol", "", "hundred", "Numbers", "u8", "Boqol shilin", "", "A hundred shillings"],
    ["morning", "subax", "", "morning", "Time", "u8", "Subaxdii shaah baan cabbaa", "", "I drink tea in the morning"],
    ["night", "habeen", "", "night", "Time", "u8", "Habeenkii waa qabow", "", "It is cold at night"],
    ["to_cook", "karin", "", "to cook", "Verbs", "u7", "Hooyo cunto ayay karinaysaa", "", "Mother is cooking food"],
    ["to_ask", "weydiin", "", "to ask", "Verbs", "u7", "Macallinka wax weydii", "", "Ask the teacher something"],
    ["room", "qol", "", "room", "Places", "u7", "Qolkaygu waa yar", "", "My room is small"],
    ["beautiful", "qurux badan", "", "beautiful", "Common", "u7", "Magaaladan waa qurux badan", "", "This city is beautiful"],
    ["eye", "indho", "", "eyes, eye", "Body", "u5", "Indhahaygu way i xanuunayaan", "", "My eyes hurt"],
    ["pain", "xanuun", "", "pain", "Body", "u5", "Xanuun baan qabaa", "", "I am in pain"],
    ["medicine", "daawo", "", "medicine", "Body", "u5", "Daawada qaado", "", "Take the medicine"],
  ],

  ta: [
    ["six", "ஆறு", "aaru", "six", "Numbers", "u8", "ஆறு மணி", "aaru mani", "Six o'clock"],
    ["seven", "ஏழு", "ezhu", "seven", "Numbers", "u8", "ஏழு நாள்", "ezhu naal", "Seven days"],
    ["eight", "எட்டு", "ettu", "eight", "Numbers", "u8", "எட்டு பேர்", "ettu per", "Eight people"],
    ["nine", "ஒன்பது", "onbadhu", "nine", "Numbers", "u8", "ஒன்பது மணி", "onbadhu mani", "Nine o'clock"],
    ["ten", "பத்து", "pathu", "ten", "Numbers", "u8", "பத்து ரூபாய்", "pathu roopaay", "Ten rupees"],
    ["hundred", "நூறு", "nooru", "hundred", "Numbers", "u8", "நூறு வருஷம்", "nooru varusham", "A hundred years"],
    ["morning", "காலை", "kaalai", "morning", "Time", "u8", "காலையில் டீ குடிப்பேன்", "kaalaiyil tea kudippen", "I drink tea in the morning"],
    ["night", "இரவு", "iravu", "night", "Time", "u8", "இரவில் குளிராக இருக்கும்", "iravil kuliraaga irukkum", "It is cold at night"],
    ["to_cook", "சமைக்க", "samaikka", "to cook", "Verbs", "u7", "அம்மா சமைக்கிறாங்க", "amma samaikkiraanga", "Mother is cooking"],
    ["to_ask", "கேட்க", "ketka", "to ask", "Verbs", "u7", "நான் ஒரு கேள்வி கேட்கணும்", "naan oru kelvi ketkanum", "I need to ask a question"],
    ["room", "அறை", "arai", "room", "Places", "u7", "என் அறை சின்னது", "en arai chinnadhu", "My room is small"],
    ["beautiful", "அழகு", "azhagu", "beautiful, beauty", "Common", "u7", "இந்த இடம் அழகாக இருக்கிறது", "indha idam azhagaaga irukkiradhu", "This place is beautiful"],
    ["eye", "கண்", "kan", "eye", "Body", "u5", "என் கண் வலிக்கிறது", "en kan valikkiradhu", "My eye hurts"],
    ["pain", "வலி", "vali", "pain", "Body", "u5", "எனக்கு வலிக்கிறது", "enakku valikkiradhu", "It hurts"],
    ["medicine", "மருந்து", "marundhu", "medicine", "Body", "u5", "மருந்து சாப்பிடு", "marundhu saappidu", "Take the medicine"],
  ],

  tl: [
    ["six", "anim", "", "six", "Numbers", "u8", "Anim na araw", "", "Six days"],
    ["seven", "pito", "", "seven", "Numbers", "u8", "Pitong tao", "", "Seven people"],
    ["eight", "walo", "", "eight", "Numbers", "u8", "Walong oras", "", "Eight hours"],
    ["nine", "siyam", "", "nine", "Numbers", "u8", "Siyam na piso", "", "Nine pesos"],
    ["ten", "sampu", "", "ten", "Numbers", "u8", "Sampung minuto", "", "Ten minutes"],
    ["hundred", "sandaan", "", "hundred", "Numbers", "u8", "Sandaang piso lang", "", "Only a hundred pesos"],
    ["morning", "umaga", "", "morning", "Time", "u8", "Umiinom ako ng kape tuwing umaga", "", "I drink coffee every morning"],
    ["to_sit", "umupo", "", "to sit", "Verbs", "u7", "Umupo ka rito", "", "Sit here"],
    ["to_cook", "magluto", "", "to cook", "Verbs", "u7", "Marunong magluto si Lola", "", "Grandma knows how to cook"],
    ["to_ask", "magtanong", "", "to ask", "Verbs", "u7", "Puwede ba akong magtanong?", "", "May I ask something?"],
    ["room", "kuwarto", "", "room", "Places", "u8", "Maliit ang kuwarto ko", "", "My room is small"],
    ["eye", "mata", "", "eye", "Body", "u5", "Pula ang mata ko", "", "My eye is red"],
    ["pain", "sakit", "", "pain, ache", "Body", "u5", "Masakit ang ulo ko", "", "My head hurts"],
    ["medicine", "gamot", "", "medicine", "Body", "u5", "Uminom ka ng gamot", "", "Take your medicine"],
  ],

  tr: [
    ["hundred", "yüz", "", "hundred", "Numbers", "u3", "Yüz lira", "", "A hundred lira"],
    ["morning", "sabah", "", "morning", "Time", "u9", "Sabah kahvaltı yaparım", "", "I have breakfast in the morning"],
    ["night", "gece", "", "night", "Time", "u9", "Gece çok soğuk", "", "The night is very cold"],
    ["to_sit", "oturmak", "", "to sit", "Verbs", "u6", "Buraya oturun", "", "Sit here, please"],
    ["to_cook", "pişirmek", "", "to cook", "Verbs", "u6", "Annem yemek pişiriyor", "", "My mother is cooking food"],
    ["to_ask", "sormak", "", "to ask", "Verbs", "u6", "Bir şey sorabilir miyim?", "", "May I ask something?"],
    ["room", "oda", "", "room", "Places", "u7", "Odam küçük", "", "My room is small"],
    ["pain", "ağrı", "", "pain", "Body", "u11", "Başımda ağrı var", "", "I have a pain in my head"],
    ["medicine", "ilaç", "", "medicine", "Body", "u11", "Bana ilaç lazım", "", "I need medicine"],
  ],

  ur: [
    ["to_cook", "پکانا", "pakana", "to cook", "Verbs", "u6", "امی کھانا پکا رہی ہیں", "ammi khana paka rahi hain", "Mom is cooking food"],
    ["to_ask", "پوچھنا", "poochhna", "to ask", "Verbs", "u6", "ان سے پوچھو", "un se poochho", "Ask them"],
    ["pain", "درد", "dard", "pain", "Body", "u11", "مجھے درد ہے", "mujhe dard hai", "I am in pain"],
    ["medicine", "دوائی", "dawai", "medicine", "Body", "u11", "دوائی لے لو", "dawai le lo", "Take the medicine"],
  ],

  vi: [
    ["six", "sáu", "", "six", "Numbers", "u4", "Sáu giờ sáng", "", "Six in the morning"],
    ["seven", "bảy", "", "seven", "Numbers", "u4", "Một tuần có bảy ngày", "", "A week has seven days"],
    ["eight", "tám", "", "eight", "Numbers", "u4", "Tám người", "", "Eight people"],
    ["nine", "chín", "", "nine", "Numbers", "u4", "Chín giờ tối", "", "Nine in the evening"],
    ["hundred", "trăm", "", "hundred", "Numbers", "u4", "Một trăm nghìn đồng", "", "A hundred thousand dong"],
    ["morning", "buổi sáng", "", "morning", "Time", "u8", "Buổi sáng tôi uống cà phê", "", "In the morning I drink coffee"],
    ["night", "đêm", "", "night", "Time", "u8", "Đêm nay trời lạnh", "", "It is cold tonight"],
    ["to_sit", "ngồi", "", "to sit", "Verbs", "u6", "Mời ngồi", "", "Please sit"],
    ["to_cook", "nấu ăn", "", "to cook", "Verbs", "u6", "Mẹ tôi nấu ăn rất ngon", "", "My mother cooks very well"],
    ["to_ask", "hỏi", "", "to ask", "Verbs", "u6", "Tôi hỏi thầy giáo", "", "I ask the teacher"],
    ["room", "phòng", "", "room", "Places", "u7", "Phòng tôi nhỏ", "", "My room is small"],
    ["beautiful", "đẹp", "", "beautiful", "Common", "u8", "Cô ấy rất đẹp", "", "She is very beautiful"],
    ["eye", "mắt", "", "eye", "Body", "u8", "Mắt tôi đỏ", "", "My eyes are red"],
    ["pain", "đau", "", "pain, to hurt", "Body", "u8", "Tôi bị đau đầu", "", "I have a headache"],
    ["medicine", "thuốc", "", "medicine", "Body", "u8", "Uống thuốc đi", "", "Take your medicine"],
  ],

  yo: [
    ["six", "mẹ́fà", "", "six", "Numbers", "u4", "Ọmọ mẹ́fà", "", "Six children"],
    ["seven", "méje", "", "seven", "Numbers", "u4", "Ọjọ́ méje", "", "Seven days"],
    ["eight", "mẹ́jọ", "", "eight", "Numbers", "u4", "Ènìyàn mẹ́jọ", "", "Eight people"],
    ["nine", "mẹ́sàn-án", "", "nine", "Numbers", "u4", "Wákàtí mẹ́sàn-án", "", "Nine hours"],
    ["hundred", "ọgọ́rùn-ún", "", "hundred", "Numbers", "u4", "Náírà ọgọ́rùn-ún", "", "A hundred naira"],
    ["morning", "òwúrọ̀", "", "morning", "Time", "u8", "Mo jí ní òwúrọ̀", "", "I woke up in the morning"],
    ["night", "alẹ́", "", "night", "Time", "u8", "Ó ti di alẹ́", "", "It has become night"],
    ["to_sit", "jókòó", "", "to sit", "Verbs", "u6", "Jókòó síbí", "", "Sit here"],
    ["to_cook", "se oúnjẹ", "", "to cook", "Verbs", "u6", "Ìyá mi ń se oúnjẹ", "", "My mother is cooking"],
    ["to_ask", "béèrè", "", "to ask", "Verbs", "u6", "Mo fẹ́ béèrè ìbéèrè kan", "", "I want to ask a question"],
    ["room", "yàrá", "", "room", "Places", "u7", "Yàrá mi kéré", "", "My room is small"],
    ["beautiful", "lẹ́wà", "", "beautiful", "Common", "u8", "Ìlú yìí lẹ́wà", "", "This town is beautiful"],
    ["eye", "ojú", "", "eye", "Body", "u8", "Ojú mi ń dùn mí", "", "My eye hurts"],
    ["pain", "ìrora", "", "pain", "Body", "u8", "Mo ní ìrora", "", "I am in pain"],
    ["medicine", "oògùn", "", "medicine", "Body", "u8", "Lo oògùn rẹ", "", "Take your medicine"],
  ],

  zh: [
    ["six", "六", "liù", "six", "Numbers", "u4", "六点", "liù diǎn", "Six o'clock"],
    ["seven", "七", "qī", "seven", "Numbers", "u4", "七天", "qī tiān", "Seven days"],
    ["to_sit", "坐", "zuò", "to sit", "Verbs", "u6", "请坐", "qǐng zuò", "Please sit"],
    ["to_cook", "做饭", "zuò fàn", "to cook", "Verbs", "u6", "妈妈在做饭", "māma zài zuò fàn", "Mom is cooking"],
    ["to_ask", "问", "wèn", "to ask", "Verbs", "u6", "我可以问你吗？", "wǒ kěyǐ wèn nǐ ma?", "Can I ask you?"],
    ["room", "房间", "fángjiān", "room", "Places", "u7", "我的房间很小", "wǒ de fángjiān hěn xiǎo", "My room is small"],
    ["beautiful", "漂亮", "piàoliang", "beautiful, pretty", "Common", "u10", "这里很漂亮", "zhèlǐ hěn piàoliang", "It is beautiful here"],
    ["pain", "疼", "téng", "pain, to hurt", "Body", "u11", "我头疼", "wǒ tóu téng", "I have a headache"],
    ["medicine", "药", "yào", "medicine", "Body", "u11", "你吃药了吗？", "nǐ chī yào le ma?", "Have you taken your medicine?"],
  ],
};
