// =============================================================================
// JOURNEY (v70) — the "reach, not position" layer, now a real map.
//
// Instead of describing progress as units completed, each stop names a
// CONVERSATION the learner can hold. Behind you reads "you can…", the current
// stop reads "next you'll be able to…", ahead reads "then you can…" — the tense
// itself carries the progression.
//
// v70 adds CHAPTERS. The journey is no longer one flat list of six stops; it's
// named regions the learner crosses in order, three stops each:
//
//   Chapter 1 → units 1-3      Chapter 3 → units 7-9
//   Chapter 2 → units 4-6      Chapter 4 → units 10-12
//
// Each chapter ends at a checkpoint, which is what makes the map read as terrain
// with gates rather than a to-do list.
//
// THREE STOPS PER CHAPTER IS NOT ARBITRARY: it's UNITS_PER_CHAPTER from
// chapters.js. Because a stop is gated on the unit at the same index, grouping
// stops in threes makes journey chapter N exactly chapters.js chapter N — so the
// checkpoint drawn at the end of a region on the map IS the real chapter exam
// that gates it. Group them any other way and the map's gates sit somewhere the
// app doesn't actually gate.
//
// CONTENT RULE (unchanged, and the most important rule in this file): every
// exchange here is verified before it ships. Wrong grammar in a feature whose
// entire job is "you can now say this" is the worst failure the app can have.
// Languages without verified stops fall back to the plain unit path — nothing
// breaks, they just don't get the capability framing yet.
//
// Sources cross-checked while writing these (July 2026): Urdu — Talkpal everyday
// phrases, Preply common Urdu phrases, Eton Institute beginner phrases,
// Wikibooks Urdu/Vocabulary/Basic Phrases. Spanish — SpanishDict, RAE for
// ser/estar usage. French — Lawless French, Le Robert. Turkish — turkish.academy,
// StoryLearning, Preply. Hindi — Learn Hindi (hindipod101) common phrases,
// Wikibooks Hindi. Arabic — Madinah Arabic phrasebook, ArabicPod101 basics.
// Every line was additionally checked against the language pack's own vocab so
// the journey never asks for a word the course hasn't taught.
// =============================================================================

// Fallback region names, used when the caller can't supply real unit titles.
// The map prefers titles derived from the language pack's own units (which vary
// per language), so these only show if that data hasn't loaded yet.
export const CHAPTER_TITLES = [
  "Meeting people",
  "Everyday needs",
  "Out in the world",
  "Saying more",
];

export const JOURNEY = {

  // ------------------------------------------------------------ Japanese -----
  ja: {
    chapterTitle: "Meeting people",
    stops: [
      { id: "ja-c1-s1", done: "You can greet someone properly", next: "you'll be able to greet someone and answer back",
        they: { text: "こんにちは", translit: "konnichiwa", en: "hello" },
        you: { text: "こんにちは、お元気ですか", translit: "konnichiwa, ogenki desu ka", en: "hello, how are you?" }, unitIndex: 0 },
      { id: "ja-c1-s2", done: "You can say who you are", next: "you'll be able to introduce yourself",
        they: { text: "お名前は？", translit: "onamae wa?", en: "what's your name?" },
        you: { text: "田中です、よろしくお願いします", translit: "Tanaka desu, yoroshiku onegaishimasu", en: "I'm Tanaka, pleased to meet you" }, unitIndex: 1 },
      { id: "ja-c1-s3", done: "You can talk about your family", next: "you'll be able to name your family",
        they: { text: "ご家族は？", translit: "gokazoku wa?", en: "and your family?" },
        you: { text: "母と父と姉がいます", translit: "haha to chichi to ane ga imasu", en: "I have a mother, father and older sister" }, unitIndex: 2 },
      { id: "ja-c1-s4", done: "You can count and ask how many", next: "you'll be able to handle numbers",
        they: { text: "いくつですか", translit: "ikutsu desu ka", en: "how many?" },
        you: { text: "三つ、お願いします", translit: "mittsu, onegaishimasu", en: "three, please" }, unitIndex: 3 },
      { id: "ja-c1-s5", done: "You can order food and drink", next: "you'll be able to order",
        they: { text: "ご注文は？", translit: "gochuumon wa?", en: "your order?" },
        you: { text: "お茶をお願いします", translit: "ocha o onegaishimasu", en: "tea, please" }, unitIndex: 4 },
      { id: "ja-c1-s6", done: "You can say what you're doing", next: "you'll be able to use everyday verbs",
        they: { text: "何をしていますか", translit: "nani o shite imasu ka", en: "what are you doing?" },
        you: { text: "仕事をしています", translit: "shigoto o shite imasu", en: "I'm working" }, unitIndex: 5 },
      { id: "ja-c1-s7", done: "You can say where you're going", next: "you'll be able to talk about places",
        they: { text: "どこへ行きますか", translit: "doko e ikimasu ka", en: "where are you going?" },
        you: { text: "駅へ行きます", translit: "eki e ikimasu", en: "I'm going to the station" }, unitIndex: 6 },
      { id: "ja-c1-s8", done: "You can talk about when", next: "you'll be able to say when things happen",
        they: { text: "いつ来ますか", translit: "itsu kimasu ka", en: "when will you come?" },
        you: { text: "明日の朝です", translit: "ashita no asa desu", en: "tomorrow morning" }, unitIndex: 7 },
      { id: "ja-c1-s9", done: "You can say how you feel", next: "you'll be able to say how you feel",
        they: { text: "大丈夫ですか", translit: "daijoubu desu ka", en: "are you all right?" },
        you: { text: "少し疲れました", translit: "sukoshi tsukaremashita", en: "I'm a little tired" }, unitIndex: 8 },
    ],
  },

  // -------------------------------------------------------------- Korean -----
  ko: {
    chapterTitle: "Meeting people",
    stops: [
      { id: "ko-c1-s1", done: "You can greet someone properly", next: "you'll be able to greet someone and answer back",
        they: { text: "안녕하세요", translit: "annyeonghaseyo", en: "hello" },
        you: { text: "안녕하세요, 반갑습니다", translit: "annyeonghaseyo, bangapseumnida", en: "hello, pleased to meet you" }, unitIndex: 0 },
      { id: "ko-c1-s2", done: "You can say who you are", next: "you'll be able to introduce yourself",
        they: { text: "이름이 뭐예요?", translit: "ireum-i mwoyeyo?", en: "what's your name?" },
        you: { text: "저는 민수예요", translit: "jeo-neun Minsu-yeyo", en: "I'm Minsu" }, unitIndex: 1 },
      { id: "ko-c1-s3", done: "You can talk about your family", next: "you'll be able to name your family",
        they: { text: "가족이 어떻게 되세요?", translit: "gajok-i eotteoke doeseyo?", en: "tell me about your family" },
        you: { text: "부모님과 언니가 있어요", translit: "bumonim-gwa eonni-ga iss-eoyo", en: "I have my parents and an older sister" }, unitIndex: 2 },
      { id: "ko-c1-s4", done: "You can count and ask how much", next: "you'll be able to handle numbers",
        they: { text: "얼마예요?", translit: "eolmayeyo?", en: "how much is it?" },
        you: { text: "세 개 주세요", translit: "se gae juseyo", en: "three, please" }, unitIndex: 3 },
      { id: "ko-c1-s5", done: "You can order food and drink", next: "you'll be able to order",
        they: { text: "뭐 드릴까요?", translit: "mwo deurilkkayo?", en: "what can I get you?" },
        you: { text: "물 좀 주세요", translit: "mul jom juseyo", en: "some water, please" }, unitIndex: 4 },
      { id: "ko-c1-s6", done: "You can say what you're doing", next: "you'll be able to use everyday verbs",
        they: { text: "뭐 하세요?", translit: "mwo haseyo?", en: "what are you doing?" },
        you: { text: "일하고 있어요", translit: "ilhago iss-eoyo", en: "I'm working" }, unitIndex: 5 },
      { id: "ko-c1-s7", done: "You can say where you're going", next: "you'll be able to talk about places",
        they: { text: "어디 가세요?", translit: "eodi gaseyo?", en: "where are you going?" },
        you: { text: "시장에 가요", translit: "sijang-e gayo", en: "I'm going to the market" }, unitIndex: 6 },
      { id: "ko-c1-s8", done: "You can talk about when", next: "you'll be able to say when things happen",
        they: { text: "언제 오세요?", translit: "eonje oseyo?", en: "when are you coming?" },
        you: { text: "내일 아침에요", translit: "naeil achim-eyo", en: "tomorrow morning" }, unitIndex: 7 },
      { id: "ko-c1-s9", done: "You can join two ideas together", next: "you'll be able to connect your sentences",
        they: { text: "왜 안 왔어요?", translit: "wae an wass-eoyo?", en: "why didn't you come?" },
        you: { text: "아파서 못 갔어요", translit: "apaseo mot gass-eoyo", en: "I couldn't go because I was ill" }, unitIndex: 8 },
    ],
  },

  // ------------------------------------------------------------- Mandarin -----
  zh: {
    chapterTitle: "Meeting people",
    stops: [
      { id: "zh-c1-s1", done: "You can greet someone properly", next: "you'll be able to greet someone and answer back",
        they: { text: "你好", translit: "nǐ hǎo", en: "hello" },
        you: { text: "你好，你好吗？", translit: "nǐ hǎo, nǐ hǎo ma?", en: "hello, how are you?" }, unitIndex: 0 },
      { id: "zh-c1-s2", done: "You can say who you are", next: "you'll be able to introduce yourself",
        they: { text: "你叫什么名字？", translit: "nǐ jiào shénme míngzi?", en: "what's your name?" },
        you: { text: "我叫小明", translit: "wǒ jiào Xiǎomíng", en: "my name is Xiaoming" }, unitIndex: 1 },
      { id: "zh-c1-s3", done: "You can talk about your family", next: "you'll be able to name your family",
        they: { text: "你家有几口人？", translit: "nǐ jiā yǒu jǐ kǒu rén?", en: "how many people are in your family?" },
        you: { text: "四口人：爸爸、妈妈、姐姐和我", translit: "sì kǒu rén: bàba, māma, jiějie hé wǒ", en: "four: dad, mum, older sister and me" }, unitIndex: 2 },
      { id: "zh-c1-s4", done: "You can count and ask how much", next: "you'll be able to handle numbers",
        they: { text: "多少钱？", translit: "duōshao qián?", en: "how much money?" },
        you: { text: "我要三个", translit: "wǒ yào sān gè", en: "I want three" }, unitIndex: 3 },
      { id: "zh-c1-s5", done: "You can order food and drink", next: "you'll be able to order",
        they: { text: "你要喝什么？", translit: "nǐ yào hē shénme?", en: "what would you like to drink?" },
        you: { text: "我要一杯茶", translit: "wǒ yào yì bēi chá", en: "I'd like a cup of tea" }, unitIndex: 4 },
      { id: "zh-c1-s6", done: "You can say what you're doing", next: "you'll be able to use everyday verbs",
        they: { text: "你在做什么？", translit: "nǐ zài zuò shénme?", en: "what are you doing?" },
        you: { text: "我在工作", translit: "wǒ zài gōngzuò", en: "I'm working" }, unitIndex: 5 },
      { id: "zh-c1-s7", done: "You can say where you're going", next: "you'll be able to talk about places",
        they: { text: "你去哪儿？", translit: "nǐ qù nǎr?", en: "where are you going?" },
        you: { text: "我去市场", translit: "wǒ qù shìchǎng", en: "I'm going to the market" }, unitIndex: 6 },
      { id: "zh-c1-s8", done: "You can talk about when", next: "you'll be able to say when things happen",
        they: { text: "你什么时候来？", translit: "nǐ shénme shíhou lái?", en: "when are you coming?" },
        you: { text: "明天早上", translit: "míngtiān zǎoshang", en: "tomorrow morning" }, unitIndex: 7 },
      { id: "zh-c1-s9", done: "You can join two ideas together", next: "you'll be able to connect your sentences",
        they: { text: "你为什么没来？", translit: "nǐ wèishénme méi lái?", en: "why didn't you come?" },
        you: { text: "因为我生病了", translit: "yīnwèi wǒ shēngbìng le", en: "because I was ill" }, unitIndex: 8 },
    ],
  },

  // ------------------------------------------------------------- Tagalog -----
  tl: {
    chapterTitle: "Meeting people",
    stops: [
      { id: "tl-c1-s1", done: "You can greet someone properly", next: "you'll be able to greet someone and answer back",
        they: { text: "Kumusta ka?", translit: "kumusta ka", en: "how are you?" },
        you: { text: "Mabuti naman po, salamat", translit: "mabuti naman po, salamat", en: "I'm well, thank you" }, unitIndex: 0 },
      { id: "tl-c1-s2", done: "You can speak to an elder respectfully", next: "you'll be able to use po the way it's meant",
        they: { text: "Anak, kumain ka na ba?", translit: "anak, kumain ka na ba", en: "child, have you eaten?" },
        you: { text: "Opo, salamat po", translit: "opo, salamat po", en: "yes, thank you" }, unitIndex: 1 },
      { id: "tl-c1-s3", done: "You can say who you are", next: "you'll be able to introduce yourself",
        they: { text: "Ano ang pangalan mo?", translit: "ano ang pangalan mo", en: "what is your name?" },
        you: { text: "Ako si Maria, taga-Maynila", translit: "ako si Maria, taga-Maynila", en: "I'm Maria, from Manila" }, unitIndex: 2 },
      { id: "tl-c1-s4", done: "You can talk about your family", next: "you'll be able to name your family",
        they: { text: "May kapatid ka ba?", translit: "may kapatid ka ba", en: "do you have siblings?" },
        you: { text: "May isang kuya ako", translit: "may isang kuya ako", en: "I have one older brother" }, unitIndex: 3 },
      { id: "tl-c1-s5", done: "You can say how you feel", next: "you'll be able to say how you are",
        they: { text: "Ayos ka lang ba?", translit: "ayos ka lang ba", en: "are you all right?" },
        you: { text: "Pagod lang po ako", translit: "pagod lang po ako", en: "I'm just tired" }, unitIndex: 4 },
      { id: "tl-c1-s6", done: "You can ask for food", next: "you'll be able to ask for what you want",
        they: { text: "Ano ang gusto mong kainin?", translit: "ano ang gusto mong kainin", en: "what would you like to eat?" },
        you: { text: "Kanin at isda po, salamat", translit: "kanin at isda po, salamat", en: "rice and fish please, thank you" }, unitIndex: 5 },
      { id: "tl-c1-s7", done: "You can say what you're doing", next: "you'll be able to use everyday verbs",
        they: { text: "Ano ang ginagawa mo?", translit: "ano ang ginagawa mo", en: "what are you doing?" },
        you: { text: "Nagtatrabaho po ako", translit: "nagtatrabaho po ako", en: "I'm working" }, unitIndex: 6 },
      { id: "tl-c1-s8", done: "You can ask a price and find your way", next: "you'll be able to manage out in the world",
        they: { text: "Magkano po ito?", translit: "magkano po ito", en: "how much is this?" },
        you: { text: "Limang piso lang po", translit: "limang piso lang po", en: "just five pesos" }, unitIndex: 7 },
    ],
  },

  // ------------------------------------------------------------- Persian -----
  fa: {
    chapterTitle: "Meeting people",
    stops: [
      { id: "fa-c1-s1", done: "You can greet someone properly", next: "you'll be able to greet someone and answer back",
        they: { text: "سلام", translit: "salâm", en: "hello" },
        you: { text: "سلام، حال شما چطوره؟", translit: "salâm, hâl-e shomâ chetore?", en: "hello, how are you?" }, unitIndex: 0 },
      { id: "fa-c1-s2", done: "You can be polite with a stranger", next: "you'll be able to thank someone properly",
        they: { text: "بفرمایید", translit: "befarmâyid", en: "please, go ahead" },
        you: { text: "خیلی ممنون، لطف دارید", translit: "kheyli mamnun, lotf dârid", en: "thank you very much, you're kind" }, unitIndex: 1 },
      { id: "fa-c1-s3", done: "You can say who you are", next: "you'll be able to introduce yourself",
        they: { text: "اسم شما چیه؟", translit: "esm-e shomâ chie?", en: "what is your name?" },
        you: { text: "اسم من رویاست، اهل اصفهانم", translit: "esm-e man Royâst, ahl-e Esfahânam", en: "my name is Roya, I'm from Isfahan" }, unitIndex: 2 },
      { id: "fa-c1-s4", done: "You can talk about your family", next: "you'll be able to name your family",
        they: { text: "خانواده‌تون چند نفرن؟", translit: "khânevâdetun chand nafaran?", en: "how many are in your family?" },
        you: { text: "مادرم، پدرم و یک برادر", translit: "mâdaram, pedaram va yek barâdar", en: "my mother, my father and a brother" }, unitIndex: 3 },
      { id: "fa-c1-s5", done: "You can say how you feel", next: "you'll be able to say how you are",
        they: { text: "خوبی؟ خسته‌ای؟", translit: "khubi? khastei?", en: "are you well? tired?" },
        you: { text: "کمی خسته‌ام، ممنون", translit: "kami khastam, mamnun", en: "a little tired, thank you" }, unitIndex: 4 },
      { id: "fa-c1-s6", done: "You can accept tea properly", next: "you'll be able to handle an offer",
        they: { text: "چای می‌خوری؟", translit: "châi mikhori?", en: "would you like tea?" },
        you: { text: "بله، ممنون", translit: "bale, mamnun", en: "yes, thank you" }, unitIndex: 5 },
      { id: "fa-c1-s7", done: "You can say what you're doing", next: "you'll be able to use everyday verbs",
        they: { text: "چیکار می‌کنی؟", translit: "chikâr mikoni?", en: "what are you doing?" },
        you: { text: "دارم کتاب می‌خونم", translit: "dâram ketâb mikhunam", en: "I'm reading a book" }, unitIndex: 6 },
      { id: "fa-c1-s8", done: "You can ask a price and find your way", next: "you'll be able to manage out in the world",
        they: { text: "چند تومنه؟", translit: "chand tomane?", en: "how much is it?" },
        you: { text: "خیلی گرونه، کمترش کنید", translit: "kheyli gerune, kamtarash konid", en: "that's very expensive, make it less" }, unitIndex: 7 },
    ],
  },

  // ------------------------------------------------------------- Bengali -----
  bn: {
    chapterTitle: "Meeting people",
    stops: [
      { id: "bn-c1-s1", done: "You can greet someone properly", next: "you'll be able to greet someone and answer back",
        they: { text: "নমস্কার", translit: "nomoshkar", en: "hello" },
        you: { text: "নমস্কার, কেমন আছেন?", translit: "nomoshkar, kemon achhen?", en: "hello, how are you?" }, unitIndex: 0 },
      { id: "bn-c1-s2", done: "You can say how you're doing", next: "you'll be able to say how you are",
        they: { text: "কেমন আছেন?", translit: "kemon achhen?", en: "how are you?" },
        you: { text: "ভালো আছি, ধন্যবাদ", translit: "bhalo achhi, dhonnobad", en: "I'm well, thank you" }, unitIndex: 1 },
      { id: "bn-c1-s3", done: "You can talk about your family", next: "you'll be able to name your family",
        they: { text: "আপনার পরিবারে কে কে আছেন?", translit: "apnar poribare ke ke achhen?", en: "who is in your family?" },
        you: { text: "আমার মা, বাবা আর এক ভাই আছে", translit: "amar ma, baba ar ek bhai achhe", en: "I have a mother, father and a brother" }, unitIndex: 2 },
      { id: "bn-c1-s4", done: "You can count and ask how many", next: "you'll be able to handle numbers",
        they: { text: "কয়টা লাগবে?", translit: "koyta lagbe?", en: "how many do you need?" },
        you: { text: "তিনটা, ধন্যবাদ", translit: "tinta, dhonnobad", en: "three, thank you" }, unitIndex: 3 },
      { id: "bn-c1-s5", done: "You can order food and drink", next: "you'll be able to ask for food",
        they: { text: "কী খাবেন?", translit: "ki khaben?", en: "what will you eat?" },
        you: { text: "এক কাপ চা, দয়া করে", translit: "ek cup cha, doya kore", en: "one cup of tea, please" }, unitIndex: 4 },
      { id: "bn-c1-s6", done: "You can say what you're doing", next: "you'll be able to use everyday verbs",
        they: { text: "আপনি কী করছেন?", translit: "apni ki korchhen?", en: "what are you doing?" },
        you: { text: "আমি কাজ করছি", translit: "ami kaj korchhi", en: "I am working" }, unitIndex: 5 },
      { id: "bn-c1-s7", done: "You can say where you're going", next: "you'll be able to talk about places",
        they: { text: "কোথায় যাচ্ছেন?", translit: "kothay jachchhen?", en: "where are you going?" },
        you: { text: "আমি বাজারে যাচ্ছি", translit: "ami bajare jachchhi", en: "I'm going to the market" }, unitIndex: 6 },
      { id: "bn-c1-s8", done: "You can talk about when", next: "you'll be able to say when things happen",
        they: { text: "কখন আসবেন?", translit: "kokhon ashben?", en: "when will you come?" },
        you: { text: "আগামীকাল সকালে", translit: "agamikal shokale", en: "tomorrow morning" }, unitIndex: 7 },
      { id: "bn-c1-s9", done: "You can join two ideas together", next: "you'll be able to connect your sentences",
        they: { text: "কেন আসেননি?", translit: "keno ashenni?", en: "why didn't you come?" },
        you: { text: "কারণ আমি অসুস্থ ছিলাম", translit: "karon ami osustho chhilam", en: "because I was unwell" }, unitIndex: 8 },
    ],
  },

  // ------------------------------------------------------------- Punjabi -----
  pa: {
    chapterTitle: "Meeting people",
    stops: [
      { id: "pa-c1-s1", done: "You can greet someone properly", next: "you'll be able to greet someone and answer back",
        they: { text: "سلام", translit: "salaam", en: "hello" },
        you: { text: "سلام، کی حال اے؟", translit: "salaam, ki haal ae?", en: "hello, how are you?" }, unitIndex: 0 },
      { id: "pa-c1-s2", done: "You can say how you're doing", next: "you'll be able to say how you are",
        they: { text: "کی حال اے؟", translit: "ki haal ae?", en: "how are you?" },
        you: { text: "ٹھیک آں، شکریہ", translit: "theek aan, shukriya", en: "I'm fine, thank you" }, unitIndex: 1 },
      { id: "pa-c1-s3", done: "You can talk about your family", next: "you'll be able to name your family",
        they: { text: "تہاڈے گھر وچ کون کون اے؟", translit: "tuhade ghar wich kaun kaun ae?", en: "who is in your home?" },
        you: { text: "میری ماں، پیو تے اک بھین", translit: "meri maan, pyo te ik bhain", en: "my mother, father and a sister" }, unitIndex: 2 },
      { id: "pa-c1-s4", done: "You can count and ask how many", next: "you'll be able to handle numbers",
        they: { text: "کِنّے چاہیدے نیں؟", translit: "kinne chahide nen?", en: "how many do you need?" },
        you: { text: "تِن، شکریہ", translit: "tin, shukriya", en: "three, thank you" }, unitIndex: 3 },
      { id: "pa-c1-s5", done: "You can order food and drink", next: "you'll be able to ask for food",
        they: { text: "کی کھاؤ گے؟", translit: "ki khao ge?", en: "what will you eat?" },
        you: { text: "اک چاء، جی", translit: "ik cha, ji", en: "one tea, please" }, unitIndex: 4 },
      { id: "pa-c1-s6", done: "You can find your way somewhere", next: "you'll be able to ask where things are",
        they: { text: "کِتھے جانا اے؟", translit: "kithe jana ae?", en: "where do you want to go?" },
        you: { text: "بازار جانا اے", translit: "bazaar jana ae", en: "I want to go to the market" }, unitIndex: 5 },
    ],
  },

  // ----------------------------------------------------- Nigerian Pidgin -----
  pcm: {
    chapterTitle: "Meeting people",
    stops: [
      { id: "pcm-c1-s1", done: "You can greet someone properly", next: "you'll be able to greet someone and answer back",
        they: { text: "How you dey?", translit: "how you dey", en: "how are you?" },
        you: { text: "I dey fine, thank you", translit: "I dey fine", en: "I'm fine, thank you" }, unitIndex: 0 },
      { id: "pcm-c1-s2", done: "You can say who you are", next: "you'll be able to introduce yourself",
        they: { text: "Wetin be your name?", translit: "wetin be your name", en: "what is your name?" },
        you: { text: "My name na Ada", translit: "my name na Ada", en: "my name is Ada" }, unitIndex: 1 },
      { id: "pcm-c1-s3", done: "You can talk about your family", next: "you'll be able to name your family",
        they: { text: "You get brother or sister?", translit: "you get brother or sister", en: "do you have brothers or sisters?" },
        you: { text: "I get two brother", translit: "I get two brother", en: "I have two brothers" }, unitIndex: 2 },
      { id: "pcm-c1-s4", done: "You can count and ask how much", next: "you'll be able to handle numbers and prices",
        they: { text: "How much be dis one?", translit: "how much be dis one", en: "how much is this?" },
        you: { text: "Abeg, reduce am small", translit: "abeg reduce am small", en: "please, bring the price down a little" }, unitIndex: 3 },
      { id: "pcm-c1-s5", done: "You can order food", next: "you'll be able to ask for food",
        they: { text: "Wetin you wan chop?", translit: "wetin you wan chop", en: "what do you want to eat?" },
        you: { text: "I wan chop rice, abeg", translit: "I wan chop rice abeg", en: "I want to eat rice, please" }, unitIndex: 4 },
      { id: "pcm-c1-s6", done: "You can find your way somewhere", next: "you'll be able to ask for directions",
        they: { text: "Where you dey go?", translit: "where you dey go", en: "where are you going?" },
        you: { text: "I dey go market", translit: "I dey go market", en: "I'm going to the market" }, unitIndex: 5 },
    ],
  },

  // ---------------------------------------------------------- Indonesian -----
  id: {
    chapterTitle: "Meeting people",
    stops: [
      { id: "id-c1-s1", done: "You can greet someone properly", next: "you'll be able to greet someone and answer back",
        they: { text: "Halo, apa kabar?", translit: "halo, apa kabar", en: "hello, how are you?" },
        you: { text: "Baik, terima kasih", translit: "baik, terima kasih", en: "well, thank you" }, unitIndex: 0 },
      { id: "id-c1-s2", done: "You can say who you are", next: "you'll be able to introduce yourself",
        they: { text: "Nama kamu siapa?", translit: "nama kamu siapa", en: "what is your name?" },
        you: { text: "Nama saya Sari", translit: "nama saya Sari", en: "my name is Sari" }, unitIndex: 1 },
      { id: "id-c1-s3", done: "You can talk about your family", next: "you'll be able to name your family",
        they: { text: "Kamu punya saudara?", translit: "kamu punya saudara", en: "do you have siblings?" },
        you: { text: "Saya punya satu adik", translit: "saya punya satu adik", en: "I have one younger sibling" }, unitIndex: 2 },
      { id: "id-c1-s4", done: "You can count and ask how much", next: "you'll be able to handle numbers",
        they: { text: "Berapa harganya?", translit: "berapa harganya", en: "how much is it?" },
        you: { text: "Dua ribu rupiah", translit: "dua ribu rupiah", en: "two thousand rupiah" }, unitIndex: 3 },
      { id: "id-c1-s5", done: "You can order food and drink", next: "you'll be able to ask for food",
        they: { text: "Mau pesan apa?", translit: "mau pesan apa", en: "what would you like to order?" },
        you: { text: "Saya mau nasi goreng", translit: "saya mau nasi goreng", en: "I'd like fried rice" }, unitIndex: 4 },
      { id: "id-c1-s6", done: "You can find your way somewhere", next: "you'll be able to ask for directions",
        they: { text: "Mau ke mana?", translit: "mau ke mana", en: "where do you want to go?" },
        you: { text: "Saya mau ke pasar", translit: "saya mau ke pasar", en: "I want to go to the market" }, unitIndex: 5 },
    ],
  },
  // ---------------------------------------------------------------- Urdu -----
  ur: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "ur-c1-s1",
        // done tense (shown once complete) / future tense (shown when current)
        done: "You can greet someone properly",
        next: "you'll be able to greet someone and answer back",
        they: { text: "السلام علیکم", translit: "assalam-o-alaikum", en: "peace be upon you" },
        you: { text: "وعلیکم السلام", translit: "wa alaikum assalam", en: "and upon you, peace" },
        unitIndex: 0,
      },
      {
        id: "ur-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "آپ کیسے ہیں؟", translit: "aap kaise hain?", en: "how are you?" },
        you: { text: "میں ٹھیک ہوں، شکریہ", translit: "main theek hoon, shukriya", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "ur-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "آپ کا نام کیا ہے؟", translit: "aap ka naam kya hai?", en: "what is your name?" },
        you: { text: "میرا نام … ہے", translit: "mera naam … hai", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "ur-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "آپ کہاں سے ہیں؟", translit: "aap kahan se hain?", en: "where are you from?" },
        you: { text: "میں … سے ہوں", translit: "main … se hoon", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "ur-c1-s5",
        // The reciprocity stop — the app otherwise only ever asks learners to
        // ANSWER, which is why practice can feel like a quiz rather than a
        // conversation. This stop hands them the question.
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "میرا نام علی ہے", translit: "mera naam Ali hai", en: "my name is Ali" },
        you: { text: "آپ کہاں سے ہیں؟", translit: "aap kahan se hain?", en: "and where are you from?" },
        unitIndex: 4,
      },
      {
        id: "ur-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "آپ سے مل کر خوشی ہوئی", translit: "aap se mil kar khushi hui", en: "pleased to meet you" },
        you: { text: "پھر ملیں گے", translit: "phir milenge", en: "see you again" },
        unitIndex: 5,
      },
      // ---- Chapter 2 · Getting around ----
      {
        id: "ur-c2-s1",
        done: "You can ask for something you want",
        next: "you'll be able to ask for what you want",
        they: { text: "آپ کو کیا چاہیے؟", translit: "aap ko kya chahiye?", en: "what would you like?" },
        you: { text: "مجھے پانی چاہیے", translit: "mujhe paani chahiye", en: "I'd like water" },
        unitIndex: 6,
      },
      {
        id: "ur-c2-s2",
        done: "You can ask the price of something",
        next: "you'll be able to ask how much something costs",
        they: { text: "یہ سو روپے کا ہے", translit: "yeh sau rupay ka hai", en: "this is one hundred rupees" },
        you: { text: "یہ کتنے کا ہے؟", translit: "yeh kitne ka hai?", en: "how much is this?" },
        unitIndex: 7,
      },
      {
        id: "ur-c2-s3",
        done: "You can ask where something is",
        next: "you'll be able to ask where a place is",
        they: { text: "سیدھے جائیں", translit: "seedhe jayen", en: "go straight ahead" },
        you: { text: "بازار کہاں ہے؟", translit: "bazaar kahan hai?", en: "where is the market?" },
        unitIndex: 8,
      },
      // ---- Chapter 3 · Everyday life ----
      {
        id: "ur-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "آج آپ کیا کر رہے ہیں؟", translit: "aaj aap kya kar rahe hain?", en: "what are you doing today?" },
        you: { text: "آج میں کام کر رہا ہوں", translit: "aaj main kaam kar raha hoon", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "ur-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "آپ ٹھیک ہیں؟", translit: "aap theek hain?", en: "are you alright?" },
        you: { text: "میں تھکا ہوا ہوں", translit: "main thaka hua hoon", en: "I'm tired" },
        unitIndex: 10,
      },
      {
        id: "ur-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "آپ کو چائے پسند ہے؟", translit: "aap ko chai pasand hai?", en: "do you like tea?" },
        you: { text: "ہاں، لیکن مجھے کافی زیادہ پسند ہے", translit: "haan, lekin mujhe coffee zyada pasand hai", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // ------------------------------------------------------------- Spanish -----
  es: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "es-c1-s1",
        done: "You can greet someone and be greeted back",
        next: "you'll be able to greet someone and answer back",
        they: { text: "¡Hola! Buenos días", translit: "hola, buenos días", en: "hello, good morning" },
        you: { text: "Buenos días, ¿qué tal?", translit: "buenos días, qué tal", en: "good morning, how's it going?" },
        unitIndex: 0,
      },
      {
        id: "es-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "¿Cómo estás?", translit: "cómo estás", en: "how are you?" },
        you: { text: "Estoy bien, gracias", translit: "estoy bien, gracias", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "es-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "¿Cómo te llamas?", translit: "cómo te llamas", en: "what's your name?" },
        you: { text: "Me llamo …", translit: "me llamo …", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "es-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "¿De dónde eres?", translit: "de dónde eres", en: "where are you from?" },
        you: { text: "Soy de …", translit: "soy de …", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "es-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "Me llamo Diego", translit: "me llamo Diego", en: "my name is Diego" },
        you: { text: "¿Y tú, de dónde eres?", translit: "y tú, de dónde eres", en: "and you, where are you from?" },
        unitIndex: 4,
      },
      {
        id: "es-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "Mucho gusto", translit: "mucho gusto", en: "pleased to meet you" },
        you: { text: "Igualmente. ¡Hasta luego!", translit: "igualmente, hasta luego", en: "likewise. See you later!" },
        unitIndex: 5,
      },
      {
        id: "es-c2-s1",
        done: "You can order something",
        next: "you'll be able to order food and drink",
        they: { text: "¿Qué quieres tomar?", translit: "qué quieres tomar", en: "what would you like?" },
        you: { text: "Quiero un café, por favor", translit: "quiero un café, por favor", en: "I'd like a coffee, please" },
        unitIndex: 6,
      },
      {
        id: "es-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "Son cinco euros", translit: "son cinco euros", en: "that's five euros" },
        you: { text: "¿Cuánto cuesta?", translit: "cuánto cuesta", en: "how much does it cost?" },
        unitIndex: 7,
      },
      {
        id: "es-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "Está a la derecha", translit: "está a la derecha", en: "it's on the right" },
        you: { text: "¿Dónde está el mercado?", translit: "dónde está el mercado", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "es-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "¿Qué haces hoy?", translit: "qué haces hoy", en: "what are you doing today?" },
        you: { text: "Hoy trabajo, mañana descanso", translit: "hoy trabajo, mañana descanso", en: "today I work, tomorrow I rest" },
        unitIndex: 9,
      },
      {
        id: "es-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "¿Estás bien?", translit: "estás bien", en: "are you alright?" },
        you: { text: "Estoy cansado, pero bien", translit: "estoy cansado, pero bien", en: "I'm tired, but fine" },
        unitIndex: 10,
      },
      {
        id: "es-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "¿Te gusta el té?", translit: "te gusta el té", en: "do you like tea?" },
        you: { text: "Sí, pero prefiero el café", translit: "sí, pero prefiero el café", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // -------------------------------------------------------------- French -----
  fr: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "fr-c1-s1",
        done: "You can greet someone properly",
        next: "you'll be able to greet someone and answer back",
        they: { text: "Bonjour !", translit: "bonjour", en: "hello / good day" },
        you: { text: "Bonjour, ça va ?", translit: "bonjour, ça va", en: "hello, how's it going?" },
        unitIndex: 0,
      },
      {
        id: "fr-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "Comment allez-vous ?", translit: "comment allez-vous", en: "how are you?" },
        you: { text: "Ça va bien, merci", translit: "ça va bien, merci", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "fr-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "Comment vous appelez-vous ?", translit: "comment vous appelez-vous", en: "what's your name?" },
        you: { text: "Je m'appelle …", translit: "je m'appelle …", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "fr-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "D'où venez-vous ?", translit: "d'où venez-vous", en: "where are you from?" },
        you: { text: "Je viens de …", translit: "je viens de …", en: "I come from …" },
        unitIndex: 3,
      },
      {
        id: "fr-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "Je m'appelle Camille", translit: "je m'appelle Camille", en: "my name is Camille" },
        you: { text: "Et vous, d'où venez-vous ?", translit: "et vous, d'où venez-vous", en: "and you, where are you from?" },
        unitIndex: 4,
      },
      {
        id: "fr-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "Enchanté !", translit: "enchanté", en: "pleased to meet you" },
        you: { text: "Au revoir, bonne journée !", translit: "au revoir, bonne journée", en: "goodbye, have a good day!" },
        unitIndex: 5,
      },
      {
        id: "fr-c2-s1",
        done: "You can order something",
        next: "you'll be able to order food and drink",
        they: { text: "Vous désirez ?", translit: "vous désirez", en: "what would you like?" },
        you: { text: "Je voudrais un café, s'il vous plaît", translit: "je voudrais un café, s'il vous plaît", en: "I'd like a coffee, please" },
        unitIndex: 6,
      },
      {
        id: "fr-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "Ça fait cinq euros", translit: "ça fait cinq euros", en: "that comes to five euros" },
        you: { text: "C'est combien ?", translit: "c'est combien", en: "how much is it?" },
        unitIndex: 7,
      },
      {
        id: "fr-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "C'est à droite", translit: "c'est à droite", en: "it's on the right" },
        you: { text: "Où est le marché ?", translit: "où est le marché", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "fr-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "Qu'est-ce que vous faites aujourd'hui ?", translit: "qu'est-ce que vous faites aujourd'hui", en: "what are you doing today?" },
        you: { text: "Aujourd'hui je travaille", translit: "aujourd'hui je travaille", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "fr-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "Ça va ?", translit: "ça va", en: "are you alright?" },
        you: { text: "Je suis fatigué, mais ça va", translit: "je suis fatigué, mais ça va", en: "I'm tired, but I'm fine" },
        unitIndex: 10,
      },
      {
        id: "fr-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "Vous aimez le thé ?", translit: "vous aimez le thé", en: "do you like tea?" },
        you: { text: "Oui, mais je préfère le café", translit: "oui, mais je préfère le café", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // ------------------------------------------------------------- Turkish -----
  tr: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "tr-c1-s1",
        done: "You can greet someone and be welcomed",
        next: "you'll be able to greet someone and answer back",
        they: { text: "Merhaba! Hoş geldin", translit: "merhaba, hoş geldin", en: "hello, welcome" },
        you: { text: "Hoş bulduk", translit: "hoş bulduk", en: "glad to be here (the set reply)" },
        unitIndex: 0,
      },
      {
        id: "tr-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "Nasılsın?", translit: "nasılsın", en: "how are you?" },
        you: { text: "İyiyim, teşekkürler", translit: "iyiyim, teşekkürler", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "tr-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "Adın ne?", translit: "adın ne", en: "what's your name?" },
        you: { text: "Benim adım …", translit: "benim adım …", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "tr-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "Nerelisin?", translit: "nerelisin", en: "where are you from?" },
        you: { text: "Ben …'lıyım", translit: "ben …'lıyım", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "tr-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "Benim adım Elif", translit: "benim adım Elif", en: "my name is Elif" },
        you: { text: "Sen nerelisin?", translit: "sen nerelisin", en: "and where are you from?" },
        unitIndex: 4,
      },
      {
        id: "tr-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "Memnun oldum", translit: "memnun oldum", en: "pleased to meet you" },
        you: { text: "Ben de. Görüşürüz!", translit: "ben de, görüşürüz", en: "me too. See you!" },
        unitIndex: 5,
      },
      {
        id: "tr-c2-s1",
        done: "You can order something",
        next: "you'll be able to order food and drink",
        they: { text: "Ne alırsınız?", translit: "ne alırsınız", en: "what will you have?" },
        you: { text: "Bir çay, lütfen", translit: "bir çay, lütfen", en: "one tea, please" },
        unitIndex: 6,
      },
      {
        id: "tr-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "Elli lira", translit: "elli lira", en: "fifty lira" },
        you: { text: "Ne kadar?", translit: "ne kadar", en: "how much?" },
        unitIndex: 7,
      },
      {
        id: "tr-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "Sağda", translit: "sağda", en: "on the right" },
        you: { text: "Pazar nerede?", translit: "pazar nerede", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "tr-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "Bugün ne yapıyorsun?", translit: "bugün ne yapıyorsun", en: "what are you doing today?" },
        you: { text: "Bugün çalışıyorum", translit: "bugün çalışıyorum", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "tr-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "İyi misin?", translit: "iyi misin", en: "are you alright?" },
        you: { text: "Yorgunum ama iyiyim", translit: "yorgunum ama iyiyim", en: "I'm tired but I'm fine" },
        unitIndex: 10,
      },
      {
        id: "tr-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "Çay sever misin?", translit: "çay sever misin", en: "do you like tea?" },
        you: { text: "Evet, ama kahveyi daha çok severim", translit: "evet, ama kahveyi daha çok severim", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // --------------------------------------------------------------- Hindi -----
  hi: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "hi-c1-s1",
        done: "You can greet someone properly",
        next: "you'll be able to greet someone and answer back",
        they: { text: "नमस्ते", translit: "namaste", en: "hello (respectful)" },
        you: { text: "नमस्ते, आप कैसे हैं?", translit: "namaste, aap kaise hain?", en: "hello, how are you?" },
        unitIndex: 0,
      },
      {
        id: "hi-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "आप कैसे हैं?", translit: "aap kaise hain?", en: "how are you?" },
        you: { text: "मैं ठीक हूँ, शुक्रिया", translit: "main theek hoon, shukriya", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "hi-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "आपका नाम क्या है?", translit: "aapka naam kya hai?", en: "what is your name?" },
        you: { text: "मेरा नाम … है", translit: "mera naam … hai", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "hi-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "आप कहाँ से हैं?", translit: "aap kahan se hain?", en: "where are you from?" },
        you: { text: "मैं … से हूँ", translit: "main … se hoon", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "hi-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "मेरा नाम प्रिया है", translit: "mera naam Priya hai", en: "my name is Priya" },
        you: { text: "आप कहाँ से हैं?", translit: "aap kahan se hain?", en: "and where are you from?" },
        unitIndex: 4,
      },
      {
        id: "hi-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "आपसे मिलकर खुशी हुई", translit: "aapse milkar khushi hui", en: "pleased to meet you" },
        you: { text: "फिर मिलेंगे", translit: "phir milenge", en: "see you again" },
        unitIndex: 5,
      },
      {
        id: "hi-c2-s1",
        done: "You can ask for something you want",
        next: "you'll be able to ask for what you want",
        they: { text: "आपको क्या चाहिए?", translit: "aapko kya chahiye?", en: "what would you like?" },
        you: { text: "मुझे पानी चाहिए", translit: "mujhe paani chahiye", en: "I'd like water" },
        unitIndex: 6,
      },
      {
        id: "hi-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "सौ रुपये", translit: "sau rupaye", en: "one hundred rupees" },
        you: { text: "यह कितने का है?", translit: "yeh kitne ka hai?", en: "how much is this?" },
        unitIndex: 7,
      },
      {
        id: "hi-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "सीधे जाइए", translit: "seedhe jaiye", en: "go straight ahead" },
        you: { text: "बाज़ार कहाँ है?", translit: "bazaar kahan hai?", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "hi-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "आज आप क्या कर रहे हैं?", translit: "aaj aap kya kar rahe hain?", en: "what are you doing today?" },
        you: { text: "आज मैं काम कर रहा हूँ", translit: "aaj main kaam kar raha hoon", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "hi-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "आप ठीक हैं?", translit: "aap theek hain?", en: "are you alright?" },
        you: { text: "मैं थका हुआ हूँ", translit: "main thaka hua hoon", en: "I'm tired" },
        unitIndex: 10,
      },
      {
        id: "hi-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "आपको चाय पसंद है?", translit: "aapko chai pasand hai?", en: "do you like tea?" },
        you: { text: "हाँ, लेकिन मुझे कॉफ़ी ज़्यादा पसंद है", translit: "haan, lekin mujhe coffee zyada pasand hai", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // -------------------------------------------------------------- Arabic -----
  ar: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "ar-c1-s1",
        done: "You can greet someone properly",
        next: "you'll be able to greet someone and answer back",
        they: { text: "السلام عليكم", translit: "as-salamu alaykum", en: "peace be upon you" },
        you: { text: "وعليكم السلام", translit: "wa alaykum as-salam", en: "and upon you, peace" },
        unitIndex: 0,
      },
      {
        id: "ar-c1-s2",
        done: "You can say how you are",
        next: "you'll be able to say how you're doing",
        they: { text: "كيف حالك؟", translit: "kayfa haluk?", en: "how are you?" },
        you: { text: "أنا بخير، شكرا", translit: "ana bikhayr, shukran", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "ar-c1-s3",
        done: "You can say who you are",
        next: "you'll be able to give your name",
        they: { text: "ما اسمك؟", translit: "ma ismuk?", en: "what is your name?" },
        you: { text: "اسمي …", translit: "ismi …", en: "my name is …" },
        unitIndex: 2,
      },
      {
        id: "ar-c1-s4",
        done: "You can say where you're from",
        next: "you'll be able to tell someone where you're from",
        they: { text: "من أين أنت؟", translit: "min ayna anta?", en: "where are you from?" },
        you: { text: "أنا من …", translit: "ana min …", en: "I'm from …" },
        unitIndex: 3,
      },
      {
        id: "ar-c1-s5",
        done: "You can ask them a question back",
        next: "you'll be able to ask the question back, not just answer it",
        they: { text: "اسمي يوسف", translit: "ismi Yusuf", en: "my name is Yusuf" },
        you: { text: "ومن أين أنت؟", translit: "wa min ayna anta?", en: "and where are you from?" },
        unitIndex: 4,
      },
      {
        id: "ar-c1-s6",
        done: "You can close a conversation warmly",
        next: "you'll be able to end the conversation properly",
        they: { text: "تشرفت بمعرفتك", translit: "tasharraftu bi-ma'rifatik", en: "pleased to meet you" },
        you: { text: "مع السلامة", translit: "ma'a as-salama", en: "goodbye (go in safety)" },
        unitIndex: 5,
      },
      {
        id: "ar-c2-s1",
        done: "You can ask for something you want",
        next: "you'll be able to ask for what you want",
        they: { text: "ماذا تريد؟", translit: "madha turid?", en: "what would you like?" },
        you: { text: "أريد ماء، من فضلك", translit: "urid ma', min fadlik", en: "I'd like water, please" },
        unitIndex: 6,
      },
      {
        id: "ar-c2-s2",
        done: "You can ask the price",
        next: "you'll be able to ask how much something costs",
        they: { text: "عشرة دولارات", translit: "'ashara dolarat", en: "ten dollars" },
        you: { text: "بكم هذا؟", translit: "bikam hadha?", en: "how much is this?" },
        unitIndex: 7,
      },
      {
        id: "ar-c2-s3",
        done: "You can ask where a place is",
        next: "you'll be able to ask for directions",
        they: { text: "على اليمين", translit: "'ala al-yamin", en: "on the right" },
        you: { text: "أين السوق؟", translit: "ayna as-suq?", en: "where is the market?" },
        unitIndex: 8,
      },
      {
        id: "ar-c3-s1",
        done: "You can say what you're doing today",
        next: "you'll be able to talk about today and tomorrow",
        they: { text: "ماذا تفعل اليوم؟", translit: "madha taf'al al-yawm?", en: "what are you doing today?" },
        you: { text: "اليوم أعمل", translit: "al-yawm a'mal", en: "today I'm working" },
        unitIndex: 9,
      },
      {
        id: "ar-c3-s2",
        done: "You can say how you feel",
        next: "you'll be able to say how you're feeling",
        they: { text: "هل أنت بخير؟", translit: "hal anta bikhayr?", en: "are you alright?" },
        you: { text: "أنا تعبان", translit: "ana ta'ban", en: "I'm tired" },
        unitIndex: 10,
      },
      {
        id: "ar-c3-s3",
        done: "You can join two ideas into one sentence",
        next: "you'll be able to join ideas with and, but, because",
        they: { text: "هل تحب الشاي؟", translit: "hal tuhibb ash-shay?", en: "do you like tea?" },
        you: { text: "نعم، لكن أفضل القهوة", translit: "na'am, lakin ufaddil al-qahwa", en: "yes, but I prefer coffee" },
        unitIndex: 11,
      },
    ],
  },

  // -------------------------------------------------------------- German -----
  // Checked against the de pack's own vocabulary: every line below uses only
  // words the course teaches by that unit. Verb-second order is observed
  // throughout, and the du/Sie register is consistent within each exchange.
  de: {
    chapterTitle: "Meeting people",
    stops: [
      {
        id: "de-c1-s1",
        done: "You can greet someone and be greeted back",
        next: "you'll be able to greet someone properly",
        they: { text: "Guten Tag!", translit: "GOO-ten TAHK", en: "hello / good day" },
        you: { text: "Guten Tag, wie geht es Ihnen?", translit: "GOO-ten TAHK, vee GAYT es EE-nen", en: "hello, how are you? (formal)" },
        unitIndex: 0,
      },
      {
        id: "de-c1-s2",
        done: "You can say how you're doing",
        next: "you'll be able to answer 'how are you?'",
        they: { text: "Wie geht es dir?", translit: "vee GAYT es DEER", en: "how are you? (informal)" },
        you: { text: "Mir geht es gut, danke.", translit: "MEER gayt es GOOT, DAN-kuh", en: "I'm well, thank you" },
        unitIndex: 1,
      },
      {
        id: "de-c1-s3",
        done: "You can introduce yourself",
        next: "you'll be able to give your name and where you're from",
        they: { text: "Wie heißen Sie?", translit: "vee HY-sen ZEE", en: "what's your name?" },
        you: { text: "Ich heiße … und ich komme aus England.", translit: "ikh HY-suh … oont ikh KOM-uh owss ENG-lant", en: "my name is … and I'm from England" },
        unitIndex: 2,
      },
      {
        id: "de-c2-s1",
        done: "You can order a drink",
        next: "you'll be able to order without switching to English",
        they: { text: "Was möchten Sie trinken?", translit: "vas MERKH-ten zee TRINK-en", en: "what would you like to drink?" },
        you: { text: "Einen Kaffee, bitte.", translit: "INE-en KA-fay, BIT-uh", en: "a coffee, please" },
        unitIndex: 3,
      },
      {
        id: "de-c2-s2",
        done: "You can ask what something costs",
        next: "you'll be able to ask the price and understand the answer",
        they: { text: "Das macht fünf Euro.", translit: "das MAKHT FUENF OY-ro", en: "that's five euros" },
        you: { text: "Was kostet das, bitte?", translit: "vas KOS-tet das, BIT-uh", en: "what does that cost, please?" },
        unitIndex: 4,
      },
      {
        id: "de-c2-s3",
        done: "You can ask for the bill",
        next: "you'll be able to finish a meal and pay",
        they: { text: "Hat es Ihnen geschmeckt?", translit: "HAT es EE-nen guh-SHMEKT", en: "did you enjoy it?" },
        you: { text: "Sehr lecker, danke. Die Rechnung, bitte.", translit: "zayr LEK-er, DAN-kuh. dee REKH-noong, BIT-uh", en: "very tasty, thanks. The bill, please." },
        unitIndex: 5,
      },
      {
        id: "de-c3-s1",
        done: "You can ask the way",
        next: "you'll be able to stop someone and ask directions",
        they: { text: "Immer geradeaus, dann links.", translit: "IM-mer guh-RAH-duh-owss, dan LINKS", en: "straight ahead, then left" },
        you: { text: "Entschuldigung, wo ist der Bahnhof?", translit: "ent-SHOOL-di-goong, vo IST dayr BAHN-hohf", en: "excuse me, where is the station?" },
        unitIndex: 6,
      },
      {
        id: "de-c3-s2",
        done: "You can arrange a time",
        next: "you'll be able to agree when to meet",
        they: { text: "Wann hast du Zeit?", translit: "VAN hast doo TSITE", en: "when do you have time?" },
        you: { text: "Morgen um drei Uhr.", translit: "MOR-gen oom DRY OOR", en: "tomorrow at three o'clock" },
        unitIndex: 7,
      },
      {
        id: "de-c3-s3",
        done: "You can give a reason",
        next: "you'll be able to explain why — with the verb at the end",
        they: { text: "Kommst du mit?", translit: "KOMST doo MIT", en: "are you coming along?" },
        you: { text: "Nein, weil ich arbeiten muss.", translit: "NINE, vile ikh AR-by-ten MOOSS", en: "no, because I have to work" },
        unitIndex: 8,
      },
      {
        id: "de-c4-s1",
        done: "You can buy a train ticket",
        next: "you'll be able to buy a ticket and understand the platform",
        they: { text: "Der Zug fährt von Gleis drei ab.", translit: "dayr TSOOK fairt fon GLICE DRY AP", en: "the train departs from platform three" },
        you: { text: "Eine Fahrkarte nach Hamburg, bitte.", translit: "INE-uh FAR-kar-tuh nakh HAM-boork, BIT-uh", en: "a ticket to Hamburg, please" },
        unitIndex: 9,
      },
      {
        id: "de-c4-s2",
        done: "You can say what hurts",
        next: "you'll be able to explain a problem to a doctor",
        they: { text: "Was fehlt Ihnen?", translit: "vas FAYLT EE-nen", en: "what's wrong? (at the doctor's)" },
        you: { text: "Ich bin krank und mein Kopf tut weh.", translit: "ikh bin KRANK oont mine KOPF toot VAY", en: "I'm ill and my head hurts" },
        unitIndex: 10,
      },
      {
        id: "de-c4-s3",
        done: "You can hold small talk about the weather",
        next: "you'll be able to make conversation about nothing in particular",
        they: { text: "Schönes Wetter heute, oder?", translit: "SHER-ness VET-ter HOY-tuh, OH-der", en: "nice weather today, isn't it?" },
        you: { text: "Ja, die Sonne scheint. Sehr schön!", translit: "YAH, dee ZON-nuh SHINET. zayr SHERN", en: "yes, the sun is shining. Very nice!" },
        unitIndex: 11,
      },
    ],
  },
};

export function hasJourney(langCode) {
  return Array.isArray(JOURNEY[langCode]?.stops) && JOURNEY[langCode].stops.length > 0;
}

export function getStops(langCode) {
  return JOURNEY[langCode]?.stops || [];
}

export function getChapterTitle(langCode) {
  return JOURNEY[langCode]?.chapterTitle || null;
}

// How many stops the learner has cleared, derived from real unit progress.
// A stop counts as reached when its mapped unit is at least 60% learned —
// enough that the phrase genuinely belongs to them, not just seen once.
export function stopsReached(langCode, unitProgress = []) {
  const stops = getStops(langCode);
  let reached = 0;
  for (const s of stops) {
    const u = unitProgress[s.unitIndex];
    if (u && (u.pct || 0) >= 0.6) reached++;
    else break; // stops are sequential — stop counting at the first gap
  }
  return reached;
}

// ---------------------------------------------------------------------------
// v70 — chapter grouping for the map.
// ---------------------------------------------------------------------------

// Must stay equal to UNITS_PER_CHAPTER in chapters.js — see the header note.
// Imported rather than redeclared so the two can't drift apart.
import { UNITS_PER_CHAPTER } from "./chapters.js";

/**
 * Group a language's stops into the regions the map draws.
 *
 * Grouped in UNITS_PER_CHAPTER-sized runs so journey chapter N is exactly
 * chapters.js chapter N, and the checkpoint at the end of a region on the map is
 * the real chapter exam that gates the next one.
 *
 * Returns [{ number, title, stops: [{...stop, globalIndex}], startsAt, endsAtUnit }].
 */
export function getChapters(langCode) {
  const stops = getStops(langCode);
  if (!stops.length) return [];

  const chapters = [];
  for (let i = 0, number = 1; i < stops.length; i += UNITS_PER_CHAPTER, number++) {
    const slice = stops
      .slice(i, i + UNITS_PER_CHAPTER)
      .map((s, j) => ({ ...s, globalIndex: i + j }));
    if (!slice.length) break;
    chapters.push({
      number,
      title: CHAPTER_TITLES[number - 1] || `Chapter ${number}`,
      stops: slice,
      startsAt: i,
      // The unit index this region ends on — where its checkpoint sits.
      endsAtUnit: slice[slice.length - 1].unitIndex,
    });
  }
  return chapters;
}

/** Which chapter the learner is currently standing in (1-based). */
export function currentChapterNumber(langCode, reached) {
  const chapters = getChapters(langCode);
  for (const ch of chapters) {
    if (reached < ch.startsAt + ch.stops.length) return ch.number;
  }
  return chapters.length || 1;
}
