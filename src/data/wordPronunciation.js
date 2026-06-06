// =============================================================================
// WORD PRONUNCIATIONS — supplementary romanization for words/phrases that
// appear inside example sentences but carry no pronunciation in the data.
//
// Covers all non-Latin languages. For space-separated scripts (ur/hi/bn/ar/ko)
// these are per-word. For Japanese/Mandarin, example sentences aren't space-
// split, so entries are keyed by the whole sentence string.
//
// READING AID ONLY — pronunciation, never meaning. Hand-written, standard
// transliteration. Romanization systems: Urdu/Hindi (common Roman),
// Arabic (common transliteration), Korean (Revised Romanization),
// Bengali (common Roman), Japanese (Hepburn), Mandarin (Hanyu Pinyin).
// =============================================================================

export const WORD_PRONUNCIATION = {
  ur: {
    "السلام": "as-salaam", "علیکم": "alaikum", "بہت": "bahut", "بالکل": "bilkul",
    "جناب": "janaab", "بیٹھیں": "baithein", "طالب": "taalib", "علم": "ilm",
    "ہوں": "hoon", "سے": "se", "ہیں": "hain", "کرتے": "karte", "ہو": "ho",
    "ڈاکٹر": "doctor", "ہے": "hai", "کتاب": "kitaab", "میری": "meri",
    "میرا": "mera", "گھنٹے": "ghantay", "بجے": "bajay", "روپے": "rupay",
    "گلاس": "glass", "دال": "daal", "کپ": "cup", "مرغی": "murghi", "کا": "ka",
    "تازی": "taazi", "میٹھا": "meetha", "جا": "ja", "رہا": "raha", "آئے": "aaye",
    "گا": "ga", "کھاتا": "khaata", "فلم": "film", "موسیقی": "mausiqi",
    "اردو": "urdu", "خط": "khat", "کام": "kaam", "بچے": "bachay",
    "جاتے": "jaate", "بڑی": "badi", "ملیں": "milein", "گے": "ge", "آؤ": "aao",
    "اچھی": "achhi", "جاؤں": "jaaoon", "دیر": "der", "مصروف": "masroof",
    "آئیں": "aayein", "کافی": "kaafi", "رہے": "rahe", "چاہیے": "chahiye",
    "ابلا": "abla", "کالی": "kaali", "تیز": "tez", "کھڑے": "khade",
    "جاؤ": "jaao", "اڈے": "adde", "پر": "par", "اس": "is", "ہفتے": "haftay",
    "اگلے": "agle", "مہینے": "maheenay", "پرانی": "purani",
    "آنکھیں": "aankhein", "مجھے": "mujhe", "مت": "mat", "کالے": "kaale",
    "ٹھنڈی": "thandi", "نیلا": "neela", "آ": "aa", "گئی": "gayi",
    "دائیں": "daayein", "مڑو": "mudo", "بائیں": "baayein", "طرف": "taraf",
    "کپڑے": "kapde", "تھوڑا": "thoda",
  },

  hi: {
    "बहुत": "bahut", "ज़रूर": "zaroor", "फिर": "phir", "मिलेंगे": "milenge",
    "छात्र": "chhaatra", "हूँ": "hoon", "कैसे": "kaise", "हैं": "hain",
    "मेरी": "meri", "मेरे": "mere", "गिलास": "gilaas", "मसाला": "masaala",
    "स्वादिष्ट": "swaadisht", "गरम": "garam", "किताब": "kitaab", "दिन": "din",
    "रुपये": "rupaye", "हिंदी": "hindi", "मेरा": "mera", "सोमवार": "somvaar",
    "बैठिए": "baithiye", "कमरा": "kamra", "आओ": "aao", "जाओ": "jaao",
    "आपका": "aapka", "नाम?": "naam?",
  },

  bn: {
    "অনেক": "onek", "অবশ্যই": "oboshyoi", "বসুন": "boshun", "ছাত্র": "chhatro",
    "কেমন": "kemon", "আছ": "achho", "থাকেন": "thaken", "ডাক্তার": "daktar",
    "এটা": "eta", "আমার": "amar", "বই": "boi", "ঘণ্টা": "ghonta",
    "মিনিট": "minit", "টাকা": "taka", "গ্লাস": "glash", "গরম": "gorom",
    "খাও": "khao", "কাপ": "kap", "তাজা": "taja", "মুরগির": "murgir",
    "মজার": "mojar", "সিনেমা": "cinema", "বাংলা": "bangla", "কাজ": "kaj",
    "স্কুলে": "schoole", "হাসপাতালে": "hashpatale", "আজকের": "ajker",
    "হবে": "hobe", "আসো": "asho", "শুভ": "shubho", "রাত্রি": "ratri",
    "যাব": "jabo", "দেরিতে": "derite", "ব্যস্ত": "byasto", "আস": "asho",
    "কফি": "kofi", "চাই": "chai", "খুব": "khub", "কুকুর": "kukur",
  },

  ar: {
    "صديقي": "sadeeqi", "جزيلا": "jazeelan", "بالتأكيد": "bit-ta'keed",
    "ورحمة": "wa rahmat", "الله": "Allah", "طالب": "taalib", "كيف": "kayf",
    "حالك": "haaluk", "أمي": "ummi", "أبي": "abi", "العزيز": "al-azeez",
    "كأس": "ka's", "الماء": "al-maa", "طازج": "taazaj", "عربية": "arabiyya",
    "بالنعناع": "bin-na'naa", "الكتب": "al-kutub", "أيام": "ayyaam",
    "دنانير": "danaaneer", "أذهب": "adhhab", "إلى": "ila", "البيت": "al-bayt",
    "آكل": "aakul", "الخبز": "al-khubz", "أشرب": "ashrab", "أتكلم": "atakallam",
    "العربية": "al-arabiyya", "بيتي": "bayti", "المدرسة": "al-madrasa",
    "جميل": "jameel", "الغد": "al-ghad", "أختي": "ukhti", "أخي": "akhi",
    "جداً": "jiddan", "كتاب": "kitaab", "تعال": "ta'aal", "اذهب": "idhhab",
    "بارد": "baarid", "ما": "maa", "اسمك؟": "ismuk?", "أراك": "araak",
  },

  ko: {
    "정말": "jeongmal", "맞아요": "majayo", "괜찮아요": "gwaenchanayo",
    "어디예요": "eodiyeyo", "저는": "jeoneun", "학생이에요": "haksaeng-ieyo",
    "나도": "nado", "당신은": "dangsineun", "누구예요": "nuguyeyo",
    "이것은": "igeoseun", "책이에요": "chaegieyo", "무엇이에요": "mueosieyo",
    "사람은": "sarameun", "제": "je", "작은": "jageun", "두": "du",
    "사람": "saram", "중에": "junge", "시간": "sigan", "명": "myeong",
    "시": "si", "한": "han", "잔": "jan", "먹어요": "meogeoyo",
    "신선한": "sinseonhan", "따뜻한": "ttatteutan", "맛있는": "masinneun",
    "녹차": "nokcha", "학교에": "hakgyoe", "밥을": "babeul", "물을": "mureul",
    "영화를": "yeonghwareul", "한국어를": "hangugeoreul", "공부를": "gongbureul",
    "책을": "chaegeul", "가요": "gayo", "큰": "keun", "좋은": "joeun",
    "오늘은": "oneuleun", "월요일": "woryoil", "봐요": "bwayo", "종일": "jongil",
    "늦은": "neujeun", "너": "neo", "어려워요": "eoryeowoyo", "바빠요": "bappayo",
    "얼마예요": "eolmayeyo", "감사해요": "gamsahaeyo", "강아지": "gangaji",
    "내": "nae", "오른손": "oreunson", "배고파요": "baegopayo",
    "피곤해요": "pigonhaeyo", "매우": "maeu", "행복해요": "haengbokaeyo",
    "밝은": "balgeun", "비가": "biga", "와요": "wayo", "검은": "geomeun",
    "시원한": "siwonhan", "파란": "paran", "버스가": "beoseuga",
    "빠른": "ppareun", "오른쪽으로": "oreunjjogeuro", "왼쪽으로": "oenjjogeuro",
    "여기로": "yeogiro", "거기로": "geogiro", "옷을": "oseul", "집을": "jibeul",
    "조금": "jogeum",
  },

  // Japanese — example sentences aren't space-split, so key by full sentence.
  ja: {
    "田中さん": "Tanaka-san", "ございます": "gozaimasu", "そうです": "sou desu",
    "違います": "chigaimasu", "また明日": "mata ashita", "駅は": "eki wa",
    "どこですか": "doko desu ka", "私は": "watashi wa", "学生です": "gakusei desu",
    "あなたは": "anata wa", "私の": "watashi no", "水を": "mizu o",
    "ご飯を": "gohan o", "お茶を": "ocha o", "どうぞ": "douzo",
    "新鮮な": "shinsen na", "肉が": "niku ga", "好き": "suki", "パンを": "pan o",
    "一つ": "hitotsu", "二人": "futari", "三日": "mikka", "十円": "juu en",
    "百円": "hyaku en", "学校に": "gakkou ni", "日本語を": "nihongo o",
    "映画を": "eiga o", "勉強を": "benkyou o", "学校へ": "gakkou e",
    "駅で": "eki de", "待つ": "matsu", "今日は": "kyou wa", "月曜日": "getsuyoubi",
    "また": "mata", "すぐ": "sugu", "私の母": "watashi no haha",
    "私の父": "watashi no chichi", "私の姉": "watashi no ane",
    "私の兄": "watashi no ani", "とても嬉しい": "totemo ureshii",
    "疲れた": "tsukareta", "とてもいい": "totemo ii",
    "水をください": "mizu o kudasai", "大きい家": "ookii ie",
    "小さい猫": "chiisai neko", "ここに来て": "koko ni kite",
    "そこに行く": "soko ni iku", "冷たい水": "tsumetai mizu", "緑茶": "ryokucha",
    "牛乳をください": "gyuunyuu o kudasai", "家に行く": "ie ni iku",
    "ここに来る": "koko ni kuru", "今日は月曜日": "kyou wa getsuyoubi",
  },

  // Mandarin — key by full sentence (no spaces in source).
  zh: {
    "你好朋友": "nǐ hǎo péngyǒu", "非常谢谢": "fēicháng xièxie",
    "是的": "shì de", "不是": "bú shì", "明天再见": "míngtiān zàijiàn",
    "对不起，我迟到了": "duìbuqǐ, wǒ chídào le", "请坐": "qǐng zuò",
    "早安朋友": "zǎo'ān péngyǒu", "我是学生": "wǒ shì xuéshēng",
    "你好吗": "nǐ hǎo ma", "他是医生": "tā shì yīshēng",
    "她是老师": "tā shì lǎoshī", "我们是朋友": "wǒmen shì péngyǒu",
    "这是什么": "zhè shì shénme", "他是谁": "tā shì shéi",
    "我的妈妈": "wǒ de māma", "我的爸爸": "wǒ de bàba",
    "我的哥哥": "wǒ de gēge", "我的姐姐": "wǒ de jiějie",
    "好朋友": "hǎo péngyǒu", "小孩子": "xiǎo háizi", "一个人": "yí ge rén",
    "二月": "èr yuè", "三天": "sān tiān", "四小时": "sì xiǎoshí",
    "五分钟": "wǔ fēnzhōng", "十块钱": "shí kuài qián", "一百": "yì bǎi",
    "一杯水": "yì bēi shuǐ", "中国茶": "zhōngguó chá", "吃米饭": "chī mǐfàn",
    "牛肉面条": "niúròu miàntiáo", "热牛奶": "rè niúnǎi",
    "一杯咖啡": "yì bēi kāfēi", "煮鸡蛋": "zhǔ jīdàn", "鸡肉": "jīròu",
    "我去家": "wǒ qù jiā", "明天来": "míngtiān lái", "吃饭": "chī fàn",
    "喝水": "hē shuǐ", "说中文": "shuō zhōngwén", "看电影": "kàn diànyǐng",
    "做饭": "zuò fàn", "我有一本书": "wǒ yǒu yì běn shū", "我在家": "wǒ zài jiā",
    "我的家": "wǒ de jiā", "去学校": "qù xuéxiào", "大城市": "dà chéngshì",
    "小商店": "xiǎo shāngdiàn", "中国饭店": "zhōngguó fàndiàn",
    "今天星期一": "jīntiān xīngqīyī", "明天见": "míngtiān jiàn",
    "现在几点": "xiànzài jǐ diǎn", "早上好": "zǎoshang hǎo",
    "晚上好": "wǎnshang hǎo", "今年": "jīnnián", "这个月": "zhège yuè",
    "你和我": "nǐ hé wǒ", "但是很难": "dànshì hěn nán",
    "因为我累了": "yīnwèi wǒ lèi le", "茶或者咖啡": "chá huòzhě kāfēi",
    "我也是": "wǒ yě shì", "你在哪里": "nǐ zài nǎlǐ",
    "多少钱": "duōshǎo qián", "我需要帮助": "wǒ xūyào bāngzhù",
    "好酒店": "hǎo jiǔdiàn", "很好": "hěn hǎo", "很多": "hěn duō",
    "大房子": "dà fángzi", "小狗": "xiǎo gǒu", "我的头": "wǒ de tóu",
    "右手": "yòu shǒu", "大眼睛": "dà yǎnjīng", "我饿了": "wǒ è le",
    "我很累": "wǒ hěn lèi", "很高兴": "hěn gāoxìng", "别难过": "bié nánguò",
    "大太阳": "dà tàiyáng", "下雨了": "xià yǔ le", "黑云": "hēi yún",
    "凉风": "liáng fēng", "蓝天空": "lán tiānkōng", "快车": "kuài chē",
    "公共汽车来了": "gōnggòng qìchē lái le", "快火车": "kuài huǒchē",
    "向右": "xiàng yòu", "向左": "xiàng zuǒ", "来这里": "lái zhèlǐ",
    "去那里": "qù nàlǐ", "买衣服": "mǎi yīfu", "卖房子": "mài fángzi",
    "少盐": "shǎo yán", "加糖": "jiā táng", "快来": "kuài lái",
  },
};

/** Look up a single word/sentence's pronunciation for a language, or null. */
export function wordPron(langCode, word) {
  return WORD_PRONUNCIATION[langCode]?.[word] || null;
}
