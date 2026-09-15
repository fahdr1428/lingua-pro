// =============================================================================
// tier3-fill.mjs (v104) — the twelve words that come after the everyday set.
//
// Tier 3 in coreVocabulary.js was eight concepts long and arbitrary: head,
// hand, heart, black, white, sun, rain, train. Every language already taught
// all eight, so the tier did no work — it named no gap and asked nothing of a
// new pack.
//
// This is tier 3 doing a job. Twelve concepts, chosen by measuring what all
// twenty-one packs were missing at once rather than by taste:
//
//     to wait      0/21 taught          easy        0/21
//     to pay       1/21                 difficult   0/21
//     key          1/21                 old         2/21
//     phone        1/21                 red         2/21
//     to write     3/21                 blue        2/21
//     to live      3/21                 door        3/21
//
// They are a coherent set, not a grab bag: waiting, paying, a key, a phone, a
// door, and enough adjective to describe what you are looking at. That is most
// of an afternoon out in a city where you do not speak the language — which is
// the situation this whole app is built around.
//
// Fields: [conceptId, lemma, translit, translation, category, unit, exNative,
//          exTranslit, exTranslation]
//
// translit is "" for the Latin-script languages, which carry none.
//
// ON UNIT PLACEMENT: verbs go to the verbs unit where a pack has one, and
// everything else to the most general unit that pack has — "Useful Words",
// "Everyday", "Getting By". The smaller packs (id, pa, pcm) have six units and
// no general one, so their tier-3 words land in the last unit. That is
// approximate and openly so; `category` is what the word list groups by, and
// it is exact.
//
// ON CONFIDENCE: the romanisation of each entry follows its own pack's
// existing convention — plain ASCII for Arabic and Urdu, â for Persian,
// doubled vowels for Hindi, Tamil and Malayalam, wapuro for Japanese, Revised
// Romanization for Korean, tone-marked pinyin for Chinese. Somali is the
// language here I am least sure of and it is flagged in the changelog for a
// native-speaker pass; its sentences are kept short for that reason.
// =============================================================================

export const TIER3_FILL = {
  // ===========================================================================
  // ARABIC — verbs u6, general u10, door u7
  // ===========================================================================
  ar: [
    ["to_wait", "ينتظر", "yantazir", "to wait", "Verbs", "u6",
      "أنا أنتظر صديقي", "ana antazir sadiqi", "I am waiting for my friend"],
    ["to_pay", "يدفع", "yadfa", "to pay", "Verbs", "u6",
      "أنا أدفع الآن", "ana adfa al-aan", "I am paying now"],
    ["to_write", "يكتب", "yaktub", "to write", "Verbs", "u6",
      "أكتب اسمي", "aktub ismi", "I write my name"],
    ["to_live", "يسكن", "yaskun", "to live", "Verbs", "u6",
      "أسكن في المدينة", "askun fi al-madina", "I live in the city"],
    ["easy", "سهل", "sahl", "easy", "Common", "u10",
      "هذا سهل", "hadha sahl", "This is easy"],
    ["difficult", "صعب", "saab", "difficult, hard", "Common", "u10",
      "هذا صعب جدا", "hadha saab jiddan", "This is very difficult"],
    ["old", "قديم", "qadeem", "old", "Common", "u10",
      "هذا بيت قديم", "hadha bayt qadeem", "This is an old house"],
    ["key", "مفتاح", "miftah", "key", "Useful", "u10",
      "أين المفتاح؟", "ayna al-miftah?", "Where is the key?"],
    ["phone", "هاتف", "hatif", "phone", "Useful", "u10",
      "هاتفي هنا", "hatifi huna", "My phone is here"],
    ["door", "باب", "bab", "door", "Places", "u7",
      "الباب مفتوح", "al-bab maftuh", "The door is open"],
    ["red", "أحمر", "ahmar", "red", "Colors", "u10",
      "الباب أحمر", "al-bab ahmar", "The door is red"],
    ["blue", "أزرق", "azraq", "blue", "Colors", "u10",
      "البيت أزرق", "al-bayt azraq", "The house is blue"],
  ],

  // ===========================================================================
  // BENGALI — verbs u6, general u10, door u7
  // ===========================================================================
  bn: [
    ["to_wait", "অপেক্ষা করা", "opekkha kora", "to wait", "Verbs", "u6",
      "আমি অপেক্ষা করছি", "ami opekkha korchi", "I am waiting"],
    ["to_pay", "টাকা দেওয়া", "taka deoya", "to pay", "Verbs", "u6",
      "আমি টাকা দিচ্ছি", "ami taka dichchhi", "I am paying"],
    ["to_write", "লেখা", "lekha", "to write", "Verbs", "u6",
      "আমি নাম লেখি", "ami nam lekhi", "I write my name"],
    // to_live is NOT here. Bengali থাকা already exists in the pack, glossed
    // "to have, to stay" — and the concept accepts "to stay", because থাকা
    // genuinely covers both. Adding a second থাকা would be the v100 mistake:
    // twenty-five words that looked missing were already taught under a
    // different gloss, and the fix was to widen what the concept accepts, not
    // to teach the word twice.
    ["easy", "সহজ", "shohoj", "easy", "Common", "u10",
      "এটা সহজ", "eta shohoj", "This is easy"],
    ["difficult", "কঠিন", "kothin", "difficult, hard", "Common", "u10",
      "এটা খুব কঠিন", "eta khub kothin", "This is very difficult"],
    ["old", "পুরনো", "purono", "old", "Common", "u10",
      "এটা পুরনো বাড়ি", "eta purono bari", "This is an old house"],
    ["key", "চাবি", "chabi", "key", "Useful", "u10",
      "চাবি কোথায়?", "chabi kothay?", "Where is the key?"],
    ["phone", "ফোন", "phone", "phone", "Useful", "u10",
      "আমার ফোন এখানে", "amar phone ekhane", "My phone is here"],
    ["door", "দরজা", "dorja", "door", "Places", "u7",
      "দরজা খোলা", "dorja khola", "The door is open"],
    ["red", "লাল", "lal", "red", "Colors", "u10",
      "দরজা লাল", "dorja lal", "The door is red"],
    ["blue", "নীল", "nil", "blue", "Colors", "u10",
      "বাড়ি নীল", "bari nil", "The house is blue"],
  ],

  // ===========================================================================
  // GERMAN — verbs u6, general u13 (Everyday Life), door u7
  // ===========================================================================
  de: [
    ["to_wait", "warten", "", "to wait", "Verbs", "u6",
      "Ich warte hier", "", "I am waiting here"],
    ["to_write", "schreiben", "", "to write", "Verbs", "u6",
      "Ich schreibe meinen Namen", "", "I write my name"],
    ["easy", "einfach", "", "easy, simple", "Common", "u13",
      "Das ist einfach", "", "That is easy"],
    ["difficult", "schwer", "", "difficult, hard", "Common", "u13",
      "Das ist sehr schwer", "", "That is very difficult"],
    ["old", "alt", "", "old", "Common", "u13",
      "Das ist ein altes Haus", "", "That is an old house"],
    ["door", "die Tür", "", "door", "Places", "u7",
      "Die Tür ist offen", "", "The door is open"],
    ["red", "rot", "", "red", "Colors", "u13",
      "Die Tür ist rot", "", "The door is red"],
    ["blue", "blau", "", "blue", "Colors", "u13",
      "Das Haus ist blau", "", "The house is blue"],
  ],

  // ===========================================================================
  // SPANISH — verbs u6, general u13 (Getting Around), door u7
  // ===========================================================================
  es: [
    ["to_wait", "esperar", "", "to wait", "Verbs", "u6",
      "Espero aquí", "", "I am waiting here"],
    ["to_pay", "pagar", "", "to pay", "Verbs", "u6",
      "Quiero pagar", "", "I want to pay"],
    ["easy", "fácil", "", "easy", "Common", "u13",
      "Esto es fácil", "", "This is easy"],
    ["difficult", "difícil", "", "difficult, hard", "Common", "u13",
      "Esto es muy difícil", "", "This is very difficult"],
    // "Es una casa vieja" would put a feminine agreement on screen next to a
    // masculine headword, which is a grammar lesson the card is not giving.
    ["old", "viejo", "", "old", "Common", "u13",
      "Es un hotel viejo", "", "It is an old hotel"],
    ["key", "la llave", "", "key", "Useful", "u13",
      "¿Dónde está la llave?", "", "Where is the key?"],
    ["phone", "el teléfono", "", "phone", "Useful", "u13",
      "El teléfono está aquí", "", "The phone is here"],
    ["door", "la puerta", "", "door", "Places", "u7",
      "La puerta está abierta", "", "The door is open"],
  ],

  // ===========================================================================
  // PERSIAN — verbs u7 (Everyday), general u7, door u8 (Out & About)
  // ===========================================================================
  fa: [
    ["to_wait", "منتظر بودن", "montazer budan", "to wait", "Verbs", "u7",
      "من منتظرم", "man montazeram", "I am waiting"],
    ["to_pay", "پرداختن", "pardâkhtan", "to pay", "Verbs", "u7",
      "من پرداخت می‌کنم", "man pardâkht mikonam", "I am paying"],
    ["to_write", "نوشتن", "neveshtan", "to write", "Verbs", "u7",
      "من نامم را می‌نویسم", "man nâmam râ minevisam", "I write my name"],
    ["to_live", "زندگی کردن", "zendegi kardan", "to live", "Verbs", "u7",
      "من در لندن زندگی می‌کنم", "man dar London zendegi mikonam", "I live in London"],
    ["easy", "آسان", "âsân", "easy", "Common", "u7",
      "این آسان است", "in âsân ast", "This is easy"],
    ["difficult", "سخت", "sakht", "difficult, hard", "Common", "u7",
      "این خیلی سخت است", "in kheyli sakht ast", "This is very difficult"],
    ["old", "قدیمی", "qadimi", "old", "Common", "u7",
      "این خانه قدیمی است", "in khâne qadimi ast", "This is an old house"],
    ["key", "کلید", "kelid", "key", "Useful", "u7",
      "کلید کجاست؟", "kelid kojâst?", "Where is the key?"],
    ["phone", "تلفن", "telefon", "phone", "Useful", "u7",
      "تلفن من اینجاست", "telefon-e man injâst", "My phone is here"],
    ["door", "در", "dar", "door", "Places", "u8",
      "در باز است", "dar bâz ast", "The door is open"],
    ["red", "قرمز", "qermez", "red", "Colors", "u7",
      "در قرمز است", "dar qermez ast", "The door is red"],
    ["blue", "آبی", "âbi", "blue", "Colors", "u7",
      "خانه آبی است", "khâne âbi ast", "The house is blue"],
  ],

  // ===========================================================================
  // FRENCH — verbs u6, general u13 (Getting Around), door u7
  // ===========================================================================
  fr: [
    ["to_wait", "attendre", "", "to wait", "Verbs", "u6",
      "J'attends ici", "", "I am waiting here"],
    ["to_pay", "payer", "", "to pay", "Verbs", "u6",
      "Je veux payer", "", "I want to pay"],
    ["easy", "facile", "", "easy", "Common", "u13",
      "C'est facile", "", "It is easy"],
    ["difficult", "difficile", "", "difficult, hard", "Common", "u13",
      "C'est très difficile", "", "It is very difficult"],
    // Not "une vieille maison": vieux → vieille is the one French agreement
    // that does not look like the word on the card, and a learner meeting it
    // here would reasonably conclude they had been shown the wrong word.
    ["old", "vieux", "", "old", "Common", "u13",
      "C'est un vieux marché", "", "It is an old market"],
    ["key", "la clé", "", "key", "Useful", "u13",
      "Où est la clé ?", "", "Where is the key?"],
    ["phone", "le téléphone", "", "phone", "Useful", "u13",
      "Le téléphone est ici", "", "The phone is here"],
    ["door", "la porte", "", "door", "Places", "u7",
      "La porte est ouverte", "", "The door is open"],
  ],

  // ===========================================================================
  // HINDI — verbs u6, general u10 (Useful Words), door u7
  // ===========================================================================
  hi: [
    ["to_wait", "इंतज़ार करना", "intazaar karna", "to wait", "Verbs", "u6",
      "मैं इंतज़ार कर रहा हूँ", "main intazaar kar raha hoon", "I am waiting"],
    ["to_pay", "पैसे देना", "paise dena", "to pay", "Verbs", "u6",
      "मैं पैसे देता हूँ", "main paise deta hoon", "I pay"],
    ["to_write", "लिखना", "likhna", "to write", "Verbs", "u6",
      "मैं अपना नाम लिखता हूँ", "main apna naam likhta hoon", "I write my name"],
    ["to_live", "रहना", "rehna", "to live", "Verbs", "u6",
      "मैं दिल्ली में रहता हूँ", "main Dilli mein rehta hoon", "I live in Delhi"],
    ["easy", "आसान", "aasaan", "easy", "Common", "u10",
      "यह आसान है", "yeh aasaan hai", "This is easy"],
    ["difficult", "मुश्किल", "mushkil", "difficult, hard", "Common", "u10",
      "यह बहुत मुश्किल है", "yeh bahut mushkil hai", "This is very difficult"],
    ["old", "पुराना", "puraana", "old", "Common", "u10",
      "यह पुराना घर है", "yeh puraana ghar hai", "This is an old house"],
    ["key", "चाबी", "chaabi", "key", "Useful", "u10",
      "चाबी कहाँ है?", "chaabi kahaan hai?", "Where is the key?"],
    ["phone", "फ़ोन", "phone", "phone", "Useful", "u10",
      "मेरा फ़ोन यहाँ है", "mera phone yahaan hai", "My phone is here"],
    ["door", "दरवाज़ा", "darwaaza", "door", "Places", "u7",
      "दरवाज़ा खुला है", "darwaaza khula hai", "The door is open"],
    ["red", "लाल", "laal", "red", "Colors", "u10",
      "दरवाज़ा लाल है", "darwaaza laal hai", "The door is red"],
    ["blue", "नीला", "neela", "blue", "Colors", "u10",
      "घर नीला है", "ghar neela hai", "The house is blue"],
  ],

  // ===========================================================================
  // INDONESIAN — six units only; everything lands in u6
  // ===========================================================================
  id: [
    ["to_wait", "menunggu", "", "to wait", "Verbs", "u6",
      "Saya menunggu di sini", "", "I am waiting here"],
    ["to_pay", "membayar", "", "to pay", "Verbs", "u6",
      "Saya mau membayar", "", "I want to pay"],
    ["to_write", "menulis", "", "to write", "Verbs", "u6",
      "Saya menulis nama saya", "", "I write my name"],
    ["to_live", "tinggal", "", "to live", "Verbs", "u6",
      "Saya tinggal di Jakarta", "", "I live in Jakarta"],
    ["easy", "mudah", "", "easy", "Common", "u6",
      "Ini mudah", "", "This is easy"],
    ["difficult", "sulit", "", "difficult, hard", "Common", "u6",
      "Ini sangat sulit", "", "This is very difficult"],
    ["old", "tua", "", "old", "Common", "u6",
      "Ini rumah tua", "", "This is an old house"],
    ["key", "kunci", "", "key", "Useful", "u6",
      "Di mana kunci?", "", "Where is the key?"],
    ["phone", "telepon", "", "phone", "Useful", "u6",
      "Telepon saya di sini", "", "My phone is here"],
    ["door", "pintu", "", "door", "Places", "u6",
      "Pintu terbuka", "", "The door is open"],
    ["red", "merah", "", "red", "Colors", "u6",
      "Pintu merah", "", "The door is red"],
    ["blue", "biru", "", "blue", "Colors", "u6",
      "Rumah biru", "", "The house is blue"],
  ],

  // ===========================================================================
  // JAPANESE — verbs u6, general u10 (Useful Words), door u7
  // ===========================================================================
  ja: [
    ["to_wait", "待つ", "matsu", "to wait", "Verbs", "u6",
      "ここで待ちます", "koko de machimasu", "I will wait here"],
    ["to_pay", "払う", "harau", "to pay", "Verbs", "u6",
      "お金を払います", "okane wo haraimasu", "I pay the money"],
    ["to_write", "書く", "kaku", "to write", "Verbs", "u6",
      "名前を書きます", "namae wo kakimasu", "I write my name"],
    ["to_live", "住む", "sumu", "to live", "Verbs", "u6",
      "東京に住んでいます", "Toukyou ni sunde imasu", "I live in Tokyo"],
    ["easy", "簡単", "kantan", "easy, simple", "Common", "u10",
      "これは簡単です", "kore wa kantan desu", "This is easy"],
    ["difficult", "難しい", "muzukashii", "difficult, hard", "Common", "u10",
      "これはとても難しいです", "kore wa totemo muzukashii desu", "This is very difficult"],
    ["old", "古い", "furui", "old", "Common", "u10",
      "古い家です", "furui ie desu", "It is an old house"],
    ["key", "鍵", "kagi", "key", "Useful", "u10",
      "鍵はどこですか", "kagi wa doko desu ka", "Where is the key?"],
    ["phone", "電話", "denwa", "phone", "Useful", "u10",
      "電話はここです", "denwa wa koko desu", "The phone is here"],
    ["door", "ドア", "doa", "door", "Places", "u7",
      "ドアが開いています", "doa ga aite imasu", "The door is open"],
    ["red", "赤い", "akai", "red", "Colors", "u10",
      "ドアは赤いです", "doa wa akai desu", "The door is red"],
    ["blue", "青い", "aoi", "blue", "Colors", "u10",
      "家は青いです", "ie wa aoi desu", "The house is blue"],
  ],

  // ===========================================================================
  // KOREAN — verbs u6, general u10 (Useful Phrases), door u7
  //
  // easy/difficult are given in the polite -어요 form rather than the
  // dictionary 쉽다/어렵다, because the stem changes shape when it inflects
  // (쉽다 → 쉬워요) and a learner meeting the dictionary form would not
  // recognise the one they actually hear.
  // ===========================================================================
  ko: [
    ["to_wait", "기다리다", "gidarida", "to wait", "Verbs", "u6",
      "여기에서 기다려요", "yeogieseo gidaryeoyo", "I wait here"],
    ["to_pay", "지불하다", "jibulhada", "to pay", "Verbs", "u6",
      "여기서 지불해요", "yeogiseo jibulhaeyo", "I pay here"],
    // Not "여기에 이름을 쓰세요" — extraExamples.js already gives that exact
    // sentence to 이름, and validate-translit catches the collision: a second
    // frame that repeats one the pack already has is dropped by mergeExamples,
    // so it teaches nothing.
    ["to_write", "쓰다", "sseuda", "to write", "Verbs", "u6",
      "여기에 쓰세요", "yeogie sseuseyo", "Write it here"],
    ["to_live", "살다", "salda", "to live", "Verbs", "u6",
      "서울에 살아요", "seoure sarayo", "I live in Seoul"],
    ["easy", "쉬워요", "swiwoyo", "easy", "Common", "u10",
      "이것은 쉬워요", "igeoseun swiwoyo", "This is easy"],
    ["difficult", "어려워요", "eoryeowoyo", "difficult, hard", "Common", "u10",
      "이것은 아주 어려워요", "igeoseun aju eoryeowoyo", "This is very difficult"],
    ["old", "오래된", "oraedoen", "old", "Common", "u10",
      "오래된 집이에요", "oraedoen jibieyo", "It is an old house"],
    ["key", "열쇠", "yeolsoe", "key", "Useful", "u10",
      "열쇠가 어디에 있어요?", "yeolsoega eodie isseoyo?", "Where is the key?"],
    ["phone", "전화", "jeonhwa", "phone", "Useful", "u10",
      "제 전화는 여기 있어요", "je jeonhwaneun yeogi isseoyo", "My phone is here"],
    ["door", "문", "mun", "door", "Places", "u7",
      "문이 열려 있어요", "muni yeollyeo isseoyo", "The door is open"],
    ["red", "빨간색", "ppalgansaek", "red", "Colors", "u10",
      "문은 빨간색이에요", "muneun ppalgansaegieyo", "The door is red"],
    ["blue", "파란색", "paransaek", "blue", "Colors", "u10",
      "집은 파란색이에요", "jibeun paransaegieyo", "The house is blue"],
  ],

  // ===========================================================================
  // MALAYALAM — verbs u7 (Everyday), general u7. Door already taught.
  // ===========================================================================
  ml: [
    ["to_wait", "കാത്തിരിക്കുക", "kaathirikkuka", "to wait", "Verbs", "u7",
      "ഞാൻ ഇവിടെ കാത്തിരിക്കുന്നു", "njaan ivide kaathirikkunnu", "I am waiting here"],
    ["to_pay", "പണം കൊടുക്കുക", "panam kodukkuka", "to pay", "Verbs", "u7",
      "ഞാൻ പണം കൊടുക്കുന്നു", "njaan panam kodukkunnu", "I pay the money"],
    ["to_write", "എഴുതുക", "ezhuthuka", "to write", "Verbs", "u7",
      "ഞാൻ പേര് എഴുതുന്നു", "njaan peru ezhuthunnu", "I write my name"],
    ["to_live", "താമസിക്കുക", "thaamasikkuka", "to live", "Verbs", "u7",
      "ഞാൻ കൊച്ചിയിൽ താമസിക്കുന്നു", "njaan Kochiyil thaamasikkunnu", "I live in Kochi"],
    ["easy", "എളുപ്പം", "eluppam", "easy", "Common", "u7",
      "ഇത് എളുപ്പമാണ്", "ithu eluppamaanu", "This is easy"],
    ["difficult", "പ്രയാസം", "prayaasam", "difficult, hard", "Common", "u7",
      "ഇത് വളരെ പ്രയാസമാണ്", "ithu valare prayaasamaanu", "This is very difficult"],
    ["old", "പഴയ", "pazhaya", "old", "Common", "u7",
      "ഇത് പഴയ വീടാണ്", "ithu pazhaya veedaanu", "This is an old house"],
    ["key", "താക്കോൽ", "thaakkol", "key", "Useful", "u7",
      "താക്കോൽ എവിടെ?", "thaakkol evide?", "Where is the key?"],
    ["phone", "ഫോൺ", "phone", "phone", "Useful", "u7",
      "എന്റെ ഫോൺ ഇവിടെയുണ്ട്", "ente phone ivideyundu", "My phone is here"],
    ["red", "ചുവപ്പ്", "chuvappu", "red", "Colors", "u7",
      "ഈ വീട് ചുവപ്പാണ്", "ee veedu chuvappaanu", "This house is red"],
    ["blue", "നീല", "neela", "blue", "Colors", "u7",
      "ഈ വീട് നീലയാണ്", "ee veedu neelayaanu", "This house is blue"],
  ],

  // ===========================================================================
  // PUNJABI (Shahmukhi) — six units; everything lands in u6.
  // The copula is اے (ae), not Urdu ہے — see the v98 note in sentencePatterns.
  // ===========================================================================
  pa: [
    ["to_wait", "انتظار کرنا", "intezaar karna", "to wait", "Verbs", "u6",
      "میں انتظار کردا واں", "main intezaar karda waan", "I am waiting"],
    ["to_pay", "پیسے دینا", "paise dena", "to pay", "Verbs", "u6",
      "میں پیسے دیندا واں", "main paise dinda waan", "I pay"],
    ["to_write", "لکھنا", "likhna", "to write", "Verbs", "u6",
      "میں ناں لکھدا واں", "main naan likhda waan", "I write my name"],
    ["to_live", "رہنا", "rehna", "to live", "Verbs", "u6",
      "میں لاہور وچ رہندا واں", "main Lahore wich rehnda waan", "I live in Lahore"],
    ["easy", "سوکھا", "saukha", "easy", "Common", "u6",
      "ایہ سوکھا اے", "eh saukha ae", "This is easy"],
    ["difficult", "اوکھا", "aukha", "difficult, hard", "Common", "u6",
      "ایہ بہت اوکھا اے", "eh bahut aukha ae", "This is very difficult"],
    ["old", "پرانا", "purana", "old", "Common", "u6",
      "ایہ پرانا گھر اے", "eh purana ghar ae", "This is an old house"],
    ["key", "چابی", "chaabi", "key", "Useful", "u6",
      "چابی کتھے اے؟", "chaabi kithe ae?", "Where is the key?"],
    ["phone", "فون", "phone", "phone", "Useful", "u6",
      "میرا فون ایتھے اے", "mera phone ithe ae", "My phone is here"],
    ["door", "بوہا", "boha", "door", "Places", "u6",
      "بوہا کھلا اے", "boha khulla ae", "The door is open"],
    ["red", "لال", "laal", "red", "Colors", "u6",
      "بوہا لال اے", "boha laal ae", "The door is red"],
    ["blue", "نیلا", "neela", "blue", "Colors", "u6",
      "گھر نیلا اے", "ghar neela ae", "The house is blue"],
  ],

  // ===========================================================================
  // NIGERIAN PIDGIN — six units; everything lands in u6
  // ===========================================================================
  pcm: [
    ["to_wait", "wait", "", "to wait", "Verbs", "u6",
      "I dey wait here", "", "I am waiting here"],
    ["to_pay", "pay", "", "to pay", "Verbs", "u6",
      "I wan pay now", "", "I want to pay now"],
    ["to_write", "write", "", "to write", "Verbs", "u6",
      "I dey write my name", "", "I am writing my name"],
    ["to_live", "stay", "", "to live, to stay", "Verbs", "u6",
      "I dey stay for Lagos", "", "I live in Lagos"],
    ["easy", "easy", "", "easy", "Common", "u6",
      "Dis one easy", "", "This one is easy"],
    ["difficult", "hard", "", "difficult, hard", "Common", "u6",
      "Dis one hard well well", "", "This one is very difficult"],
    ["old", "old", "", "old", "Common", "u6",
      "Na old house", "", "It is an old house"],
    ["key", "key", "", "key", "Useful", "u6",
      "Where di key?", "", "Where is the key?"],
    ["phone", "phone", "", "phone", "Useful", "u6",
      "My phone dey here", "", "My phone is here"],
    ["door", "door", "", "door", "Places", "u6",
      "Di door open", "", "The door is open"],
    ["red", "red", "", "red", "Colors", "u6",
      "Di door red", "", "The door is red"],
    ["blue", "blue", "", "blue", "Colors", "u6",
      "Di house blue", "", "The house is blue"],
  ],

  // ===========================================================================
  // SOMALI — verbs u7 (Everyday), general u7. Door already taught.
  // Sentences kept short: this is the pack I am least sure of, and it is
  // flagged for a native-speaker pass.
  // ===========================================================================
  so: [
    ["to_wait", "sugid", "", "to wait", "Verbs", "u7",
      "Halkan i sug", "", "Wait for me here"],
    ["to_pay", "bixin", "", "to pay", "Verbs", "u7",
      "Lacagta waan bixinayaa", "", "I am paying the money"],
    ["to_write", "qorid", "", "to write", "Verbs", "u7",
      "Magacayga waan qorayaa", "", "I am writing my name"],
    ["to_live", "degan", "", "to live", "Verbs", "u7",
      "Waxaan degan ahay London", "", "I live in London"],
    ["easy", "fudud", "", "easy", "Common", "u7",
      "Tani waa fudud", "", "This is easy"],
    ["difficult", "adag", "", "difficult, hard", "Common", "u7",
      "Tani aad bay u adag tahay", "", "This is very difficult"],
    ["old", "duug", "", "old", "Common", "u7",
      "Kani waa guri duug ah", "", "This is an old house"],
    ["key", "fure", "", "key", "Useful", "u7",
      "Fure baan doonayaa", "", "I want a key"],
    ["phone", "taleefan", "", "phone", "Useful", "u7",
      "Waa kan taleefankayga", "", "This is my phone"],
    ["red", "cas", "", "red", "Colors", "u7",
      "Gurigu waa cas", "", "The house is red"],
    ["blue", "buluug", "", "blue", "Colors", "u7",
      "Gurigu waa buluug", "", "The house is blue"],
  ],

  // ===========================================================================
  // TAMIL — verbs u7 (Everyday), general u7. Door already taught.
  // ===========================================================================
  ta: [
    ["to_wait", "காத்திருக்க", "kaathirukka", "to wait", "Verbs", "u7",
      "நான் இங்கே காத்திருக்கேன்", "naan inge kaathirukken", "I am waiting here"],
    ["to_pay", "பணம் கொடுக்க", "panam kodukka", "to pay", "Verbs", "u7",
      "நான் பணம் கொடுக்கேன்", "naan panam kodukken", "I pay the money"],
    ["to_write", "எழுத", "ezhutha", "to write", "Verbs", "u7",
      "நான் பேரு எழுதுறேன்", "naan peru ezhuthuren", "I write my name"],
    ["to_live", "வசிக்க", "vasikka", "to live", "Verbs", "u7",
      "நான் சென்னையில வசிக்கிறேன்", "naan Chennaiyila vasikkiren", "I live in Chennai"],
    ["easy", "சுலபம்", "sulabam", "easy", "Common", "u7",
      "இது சுலபம்", "idhu sulabam", "This is easy"],
    ["difficult", "கஷ்டம்", "kashtam", "difficult, hard", "Common", "u7",
      "இது ரொம்ப கஷ்டம்", "idhu romba kashtam", "This is very difficult"],
    ["old", "பழைய", "pazhaiya", "old", "Common", "u7",
      "இது பழைய வீடு", "idhu pazhaiya veedu", "This is an old house"],
    ["key", "சாவி", "saavi", "key", "Useful", "u7",
      "சாவி எங்கே?", "saavi enge?", "Where is the key?"],
    ["phone", "ஃபோன்", "phone", "phone", "Useful", "u7",
      "என் ஃபோன் இங்கே", "en phone inge", "My phone is here"],
    ["red", "சிவப்பு", "sivappu", "red", "Colors", "u7",
      "இந்த வீடு சிவப்பு", "indha veedu sivappu", "This house is red"],
    ["blue", "நீலம்", "neelam", "blue", "Colors", "u7",
      "இந்த வீடு நீலம்", "indha veedu neelam", "This house is blue"],
  ],

  // ===========================================================================
  // TAGALOG — verbs u7 (Everyday), general u7, door u8 (Out & About)
  // ===========================================================================
  tl: [
    ["to_wait", "maghintay", "", "to wait", "Verbs", "u7",
      "Maghintay ka dito", "", "Wait here"],
    ["to_pay", "magbayad", "", "to pay", "Verbs", "u7",
      "Gusto kong magbayad", "", "I want to pay"],
    ["to_write", "magsulat", "", "to write", "Verbs", "u7",
      "Magsulat ka ng pangalan mo", "", "Write your name"],
    ["to_live", "tumira", "", "to live", "Verbs", "u7",
      "Tumira ako sa Maynila", "", "I live in Manila"],
    ["easy", "madali", "", "easy", "Common", "u7",
      "Madali ito", "", "This is easy"],
    ["difficult", "mahirap", "", "difficult, hard", "Common", "u7",
      "Mahirap ito", "", "This is difficult"],
    ["old", "luma", "", "old", "Common", "u7",
      "Luma ang bahay", "", "The house is old"],
    ["key", "susi", "", "key", "Useful", "u7",
      "Nasaan ang susi?", "", "Where is the key?"],
    ["phone", "telepono", "", "phone", "Useful", "u7",
      "Nandito ang telepono ko", "", "My phone is here"],
    ["door", "pinto", "", "door", "Places", "u8",
      "Bukas ang pinto", "", "The door is open"],
    ["red", "pula", "", "red", "Colors", "u7",
      "Pula ang pinto", "", "The door is red"],
    ["blue", "asul", "", "blue", "Colors", "u7",
      "Asul ang bahay", "", "The house is blue"],
  ],

  // ===========================================================================
  // TURKISH — verbs u6, general u10 (Getting By), door u7 (Around Town).
  // "old" is already taught.
  // ===========================================================================
  tr: [
    ["to_wait", "beklemek", "", "to wait", "Verbs", "u6",
      "Burada bekliyorum", "", "I am waiting here"],
    ["to_pay", "ödemek", "", "to pay", "Verbs", "u6",
      "Ödemek istiyorum", "", "I want to pay"],
    ["to_write", "yazmak", "", "to write", "Verbs", "u6",
      "Adımı yazıyorum", "", "I am writing my name"],
    ["to_live", "yaşamak", "", "to live", "Verbs", "u6",
      "İstanbul'da yaşıyorum", "", "I live in Istanbul"],
    ["easy", "kolay", "", "easy", "Common", "u10",
      "Bu kolay", "", "This is easy"],
    ["difficult", "zor", "", "difficult, hard", "Common", "u10",
      "Bu çok zor", "", "This is very difficult"],
    ["key", "anahtar", "", "key", "Useful", "u10",
      "Anahtar nerede?", "", "Where is the key?"],
    ["phone", "telefon", "", "phone", "Useful", "u10",
      "Telefonum burada", "", "My phone is here"],
    ["door", "kapı", "", "door", "Places", "u7",
      "Kapı açık", "", "The door is open"],
    ["red", "kırmızı", "", "red", "Colors", "u10",
      "Kapı kırmızı", "", "The door is red"],
    ["blue", "mavi", "", "blue", "Colors", "u10",
      "Ev mavi", "", "The house is blue"],
  ],

  // ===========================================================================
  // URDU — verbs u6, general u13 (Getting Around), door u7.
  // "to write" and "old" are already taught.
  // ===========================================================================
  ur: [
    ["to_wait", "انتظار کرنا", "intezaar karna", "to wait", "Verbs", "u6",
      "میں انتظار کر رہا ہوں", "main intezaar kar raha hoon", "I am waiting"],
    ["to_pay", "پیسے دینا", "paise dena", "to pay", "Verbs", "u6",
      "میں پیسے دیتا ہوں", "main paise deta hoon", "I pay"],
    ["to_live", "رہنا", "rehna", "to live", "Verbs", "u6",
      "میں لاہور میں رہتا ہوں", "main Lahore mein rehta hoon", "I live in Lahore"],
    ["easy", "آسان", "aasaan", "easy", "Common", "u13",
      "یہ آسان ہے", "yeh aasaan hai", "This is easy"],
    ["difficult", "مشکل", "mushkil", "difficult, hard", "Common", "u13",
      "یہ بہت مشکل ہے", "yeh bahut mushkil hai", "This is very difficult"],
    ["key", "چابی", "chaabi", "key", "Useful", "u13",
      "چابی کہاں ہے؟", "chaabi kahaan hai?", "Where is the key?"],
    ["phone", "فون", "phone", "phone", "Useful", "u13",
      "میرا فون یہاں ہے", "mera phone yahaan hai", "My phone is here"],
    ["door", "دروازہ", "darwaaza", "door", "Places", "u7",
      "دروازہ کھلا ہے", "darwaaza khula hai", "The door is open"],
    ["red", "لال", "laal", "red", "Colors", "u13",
      "دروازہ لال ہے", "darwaaza laal hai", "The door is red"],
    ["blue", "نیلا", "neela", "blue", "Colors", "u13",
      "گھر نیلا ہے", "ghar neela hai", "The house is blue"],
  ],

  // ===========================================================================
  // VIETNAMESE — verbs u6, general u7 (Places), colours u8.
  // Every headword carries its full tone marks, as the whole pack does.
  // ===========================================================================
  vi: [
    ["to_wait", "đợi", "", "to wait", "Verbs", "u6",
      "Tôi đợi ở đây", "", "I wait here"],
    ["to_pay", "trả tiền", "", "to pay", "Verbs", "u6",
      "Tôi muốn trả tiền", "", "I want to pay"],
    ["to_write", "viết", "", "to write", "Verbs", "u6",
      "Tôi viết tên tôi", "", "I write my name"],
    ["to_live", "sống", "", "to live", "Verbs", "u6",
      "Tôi sống ở Hà Nội", "", "I live in Hanoi"],
    ["easy", "dễ", "", "easy", "Common", "u8",
      "Cái này dễ", "", "This is easy"],
    ["difficult", "khó", "", "difficult, hard", "Common", "u8",
      "Cái này rất khó", "", "This is very difficult"],
    ["old", "cũ", "", "old", "Common", "u8",
      "Nhà này cũ", "", "This house is old"],
    ["key", "chìa khóa", "", "key", "Useful", "u7",
      "Chìa khóa ở đâu?", "", "Where is the key?"],
    ["phone", "điện thoại", "", "phone", "Useful", "u7",
      "Điện thoại của tôi ở đây", "", "My phone is here"],
    ["door", "cửa", "", "door", "Places", "u7",
      "Cửa mở", "", "The door is open"],
    ["red", "đỏ", "", "red", "Colors", "u8",
      "Cửa màu đỏ", "", "The door is red"],
    ["blue", "xanh", "", "blue (also green)", "Colors", "u8",
      "Nhà màu xanh", "", "The house is blue"],
  ],

  // ===========================================================================
  // YORUBA — verbs u6, general u7 (Places), colours u8.
  // Full tone marks throughout, as the whole pack carries them.
  // "to wait" is dúró de — bare dúró is "to stand".
  // ===========================================================================
  yo: [
    ["to_wait", "dúró de", "", "to wait for", "Verbs", "u6",
      "Mo dúró de ọ̀rẹ́ mi", "", "I am waiting for my friend"],
    ["to_pay", "san owó", "", "to pay", "Verbs", "u6",
      "Mo fẹ́ san owó", "", "I want to pay"],
    ["to_write", "kọ", "", "to write", "Verbs", "u6",
      "Mo kọ orúkọ mi", "", "I write my name"],
    ["to_live", "gbé", "", "to live", "Verbs", "u6",
      "Mo ń gbé ní Èkó", "", "I live in Lagos"],
    ["easy", "rọrùn", "", "easy", "Common", "u8",
      "Èyí rọrùn", "", "This is easy"],
    ["difficult", "ṣòro", "", "difficult, hard", "Common", "u8",
      "Èyí ṣòro gan-an", "", "This is very difficult"],
    ["old", "àtijọ́", "", "old", "Common", "u8",
      "Ilé àtijọ́ ni", "", "It is an old house"],
    ["key", "kọ́kọ́rọ́", "", "key", "Useful", "u7",
      "Kọ́kọ́rọ́ wà níbo?", "", "Where is the key?"],
    ["phone", "fóònù", "", "phone", "Useful", "u7",
      "Fóònù mi wà níbí", "", "My phone is here"],
    ["door", "ilẹ̀kùn", "", "door", "Places", "u7",
      "Ilẹ̀kùn ṣí sílẹ̀", "", "The door is open"],
    ["red", "pupa", "", "red", "Colors", "u8",
      "Ilẹ̀kùn náà pupa", "", "The door is red"],
    ["blue", "búlùú", "", "blue", "Colors", "u8",
      "Ilé náà búlùú", "", "The house is blue"],
  ],

  // ===========================================================================
  // CHINESE — verbs u6, general u10 (Useful Phrases), door u7.
  // Pinyin carries tone marks, as the rest of the pack does.
  // ===========================================================================
  zh: [
    ["to_wait", "等", "děng", "to wait", "Verbs", "u6",
      "我在这里等", "wǒ zài zhèlǐ děng", "I am waiting here"],
    ["to_pay", "付钱", "fù qián", "to pay", "Verbs", "u6",
      "我要付钱", "wǒ yào fù qián", "I want to pay"],
    ["to_write", "写", "xiě", "to write", "Verbs", "u6",
      "我写我的名字", "wǒ xiě wǒ de míngzi", "I write my name"],
    ["to_live", "住", "zhù", "to live", "Verbs", "u6",
      "我住在北京", "wǒ zhù zài Běijīng", "I live in Beijing"],
    ["easy", "容易", "róngyì", "easy", "Common", "u10",
      "这个很容易", "zhège hěn róngyì", "This is easy"],
    ["difficult", "难", "nán", "difficult, hard", "Common", "u10",
      "这个很难", "zhège hěn nán", "This is very difficult"],
    ["old", "旧", "jiù", "old", "Common", "u10",
      "这是旧房子", "zhè shì jiù fángzi", "This is an old house"],
    ["key", "钥匙", "yàoshi", "key", "Useful", "u10",
      "钥匙在哪里？", "yàoshi zài nǎlǐ?", "Where is the key?"],
    ["phone", "电话", "diànhuà", "phone", "Useful", "u10",
      "我的电话在这里", "wǒ de diànhuà zài zhèlǐ", "My phone is here"],
    ["door", "门", "mén", "door", "Places", "u7",
      "门开着", "mén kāi zhe", "The door is open"],
    ["red", "红色", "hóngsè", "red", "Colors", "u10",
      "门是红色的", "mén shì hóngsè de", "The door is red"],
    ["blue", "蓝色", "lánsè", "blue", "Colors", "u10",
      "房子是蓝色的", "fángzi shì lánsè de", "The house is blue"],
  ],
};
