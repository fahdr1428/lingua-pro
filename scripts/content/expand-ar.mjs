#!/usr/bin/env node
// =============================================================================
// expand-ar.mjs — Arabic vocabulary expansion, frequency-first, with dialects.
//
// TWO THINGS THIS FIXES.
//
// 1. THE PACK WAS TOO THIN TO TEACH FROM. 110 words, with "Family" holding two
//    of them and "Common Verbs" holding four. A unit that small produces the
//    same three questions over and over, and the learner correctly concludes the
//    app has nothing to teach them.
//
// 2. IT ONLY TAUGHT MSA. Modern Standard Arabic is the language of news and
//    books and nobody's mother tongue. A learner who memorises ماذا and then
//    lands in Cairo will hear إيه and not recognise it. So the words where the
//    dialects genuinely diverge now carry the real spoken forms, and the app
//    shows the one for the variety the learner picked.
//
// DIALECT RULE: a `dialects` entry only exists where the word ACTUALLY differs.
// Padding every noun with four identical forms would teach the learner that
// dialects differ everywhere, which is false and unhelpful — the useful signal
// is precisely which words change.
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/data/languages/ar.json";
const pack = JSON.parse(readFileSync(FILE, "utf8"));

// [lemma, translit, pronunciation, translation, unit, category, difficulty, examples, dialects?]
// dialects: { "ar-EG": [lemma, translit], "ar-LV": [...], "ar-GULF": [...], "ar-MA": [...] }
const NEW = [
  // ---- u1 Greetings -------------------------------------------------------
  ["أهلا وسهلا","ahlan wa sahlan","AH-lan wa SAH-lan","welcome","u1","Greetings",1,[["أهلا وسهلا بك","Welcome to you"]]],
  ["صباح الخير","sabah al-khayr","sa-BAH al-KHAYR","good morning","u1","Greetings",1,[["صباح الخير يا أستاذ","Good morning, teacher"]]],
  ["مساء الخير","masa' al-khayr","ma-SAA al-KHAYR","good evening","u1","Greetings",1,[["مساء الخير جميعا","Good evening everyone"]]],
  ["مع السلامة","ma'a as-salama","MA-a as-sa-LA-ma","goodbye","u1","Greetings",1,[["مع السلامة، أراك غدا","Goodbye, see you tomorrow"]]],
  ["تفضل","tafaddal","ta-FAD-dal","please, go ahead, help yourself","u1","Greetings",2,[["تفضل، اجلس","Please, sit down"]]],
  ["عفوا","afwan","AF-wan","excuse me, you're welcome","u1","Greetings",1,[["عفوا، أين المحطة؟","Excuse me, where is the station?"]]],
  ["آسف","aasif","AA-sif","sorry","u1","Greetings",1,[["آسف، تأخرت","Sorry, I'm late"]]],
  ["كيف حالك","kayfa haluk","KAY-fa HA-luk","how are you?","u1","Greetings",1,[["كيف حالك اليوم؟","How are you today?"]],
    {"ar-EG":["إزيك","izzayyak"],"ar-LV":["كيفك","kifak"],"ar-GULF":["شلونك","shlonak"],"ar-MA":["لباس","labas"]}],
  ["بخير","bi-khayr","bi-KHAYR","fine, well","u1","Greetings",1,[["أنا بخير، شكرا","I'm fine, thank you"]],
    {"ar-EG":["كويس","kwayyis"],"ar-LV":["منيح","mnih"],"ar-GULF":["زين","zein"],"ar-MA":["بخير","bikhir"]}],

  // ---- u2 About You -------------------------------------------------------
  ["اسمي","ismi","IS-mee","my name is","u2","About You",1,[["اسمي علي","My name is Ali"]]],
  ["من أين أنت","min ayna anta","min AY-na AN-ta","where are you from?","u2","About You",2,[["من أين أنت؟ أنا من مصر","Where are you from? I'm from Egypt"]],
    {"ar-EG":["إنت منين","inta minen"],"ar-LV":["من وين إنت","min wen inta"],"ar-GULF":["إنت من وين","inta min wen"]}],
  ["أعيش","a'ish","a-EESH","I live","u2","About You",2,[["أعيش في القاهرة","I live in Cairo"]]],
  ["أدرس","adrus","AD-rus","I study","u2","About You",2,[["أدرس العربية","I study Arabic"]]],
  ["أعمل","a'mal","AA-mal","I work","u2","About You",2,[["أعمل في مستشفى","I work at a hospital"]]],
  ["قليلا","qalilan","qa-LEE-lan","a little","u2","About You",1,[["أتكلم العربية قليلا","I speak a little Arabic"]],
    {"ar-EG":["شوية","shwayya"],"ar-LV":["شوي","shway"],"ar-GULF":["شوي","shway"]}],
  ["صديق","sadiq","sa-DEEQ","friend","u2","People",1,[["هو صديقي","He is my friend"]],
    {"ar-EG":["صاحب","sahib"],"ar-MA":["صاحب","sahb"]}],

  // ---- u3 Family (was 2 words) --------------------------------------------
  ["أم","umm","OOM","mother","u3","Family",1,[["أمي تطبخ جيدا","My mother cooks well"]],
    {"ar-EG":["ماما","mama"],"ar-LV":["إمي","immi"]}],
  ["أب","ab","AB","father","u3","Family",1,[["أبي يعمل كثيرا","My father works a lot"]],
    {"ar-EG":["بابا","baba"],"ar-LV":["بيي","bayyi"]}],
  ["أخ","akh","AKH","brother","u3","Family",1,[["لي أخ واحد","I have one brother"]]],
  ["أخت","ukht","OKHT","sister","u3","Family",1,[["أختي طبيبة","My sister is a doctor"]]],
  ["ابن","ibn","IBN","son","u3","Family",1,[["ابنه في المدرسة","His son is at school"]]],
  ["بنت","bint","BINT","daughter, girl","u3","Family",1,[["بنتي تحب القراءة","My daughter loves reading"]]],
  ["زوج","zawj","ZAWJ","husband","u3","Family",2,[["زوجها مهندس","Her husband is an engineer"]],
    {"ar-EG":["جوز","goz"]}],
  ["زوجة","zawja","ZAW-ja","wife","u3","Family",2,[["زوجته معلمة","His wife is a teacher"]]],
  ["طفل","tifl","TIFL","child","u3","Family",1,[["الطفل نائم","The child is sleeping"]]],
  ["جد","jadd","JADD","grandfather","u3","Family",2,[["جدي من دمشق","My grandfather is from Damascus"]]],
  ["جدة","jadda","JAD-da","grandmother","u3","Family",2,[["جدتي تحكي قصصا","My grandmother tells stories"]]],
  ["عائلة","a'ila","AA-i-la","family","u3","Family",1,[["عائلتي كبيرة","My family is big"]]],

  // ---- u4 Numbers ---------------------------------------------------------
  ["ثمانية","thamaniya","tha-MAA-ni-ya","eight","u4","Numbers",1,[["ثمانية أيام","Eight days"]]],
  ["تسعة","tis'a","TIS-a","nine","u4","Numbers",1,[["تسعة أشخاص","Nine people"]]],
  ["عشرة","ashara","A-sha-ra","ten","u4","Numbers",1,[["عشرة دنانير","Ten dinars"]]],
  ["عشرون","ishrun","ISH-roon","twenty","u4","Numbers",2,[["عشرون دقيقة","Twenty minutes"]]],
  ["مئة","mi'a","MI-a","hundred","u4","Numbers",2,[["مئة في المئة","A hundred percent"]]],
  ["كم","kam","KAM","how much, how many","u4","Numbers",1,[["كم الساعة؟","What time is it?"]],
    {"ar-EG":["بكام","bikam"],"ar-LV":["قديش","addesh"],"ar-GULF":["كم","cham"],"ar-MA":["شحال","shhal"]}],

  // ---- u5 Food & Drink ----------------------------------------------------
  ["ماء","maa'","MAA","water","u5","Food",1,[["أريد ماء من فضلك","I'd like water please"]]],
  ["خبز","khubz","KHOBZ","bread","u5","Food",1,[["خبز طازج","Fresh bread"]],
    {"ar-EG":["عيش","aish"],"ar-MA":["خبز","khubz"]}],
  ["قهوة","qahwa","QAH-wa","coffee","u5","Food",1,[["قهوة بدون سكر","Coffee without sugar"]]],
  ["شاي","shay","SHAY","tea","u5","Food",1,[["شاي بالنعناع","Tea with mint"]]],
  ["أكل","akl","AKL","food","u5","Food",1,[["الأكل لذيذ","The food is delicious"]]],
  ["لحم","lahm","LAHM","meat","u5","Food",1,[["لا آكل اللحم","I don't eat meat"]]],
  ["أرز","aruzz","A-rozz","rice","u5","Food",1,[["أرز باللحم","Rice with meat"]]],
  ["فاكهة","fakiha","FAA-ki-ha","fruit","u5","Food",2,[["أحب الفاكهة","I love fruit"]]],
  ["لذيذ","ladhidh","la-DHEEDH","delicious","u5","Food",1,[["هذا لذيذ جدا","This is very delicious"]],
    {"ar-EG":["حلو","hilw"],"ar-LV":["طيب","tayyib"]}],
  ["الحساب","al-hisab","al-hi-SAAB","the bill","u5","Food",2,[["الحساب من فضلك","The bill, please"]],
    {"ar-EG":["الحساب","el-hisab"],"ar-LV":["الحساب","el-hsab"]}],
  ["مطعم","mat'am","MAT-am","restaurant","u5","Places",1,[["مطعم قريب من هنا","A restaurant near here"]]],

  // ---- u6 Common Verbs (was 4 words) --------------------------------------
  ["يكون","yakun","ya-KOON","to be","u6","Verbs",2,[["أين تكون غدا؟","Where will you be tomorrow?"]]],
  ["عنده","indahu","IN-da-hu","he has","u6","Verbs",2,[["عنده سيارة","He has a car"]],
    {"ar-EG":["عنده","andu"],"ar-LV":["عنده","indo"]}],
  ["يأكل","ya'kul","YAA-kul","to eat","u6","Verbs",1,[["نأكل في الثامنة","We eat at eight"]]],
  ["يشرب","yashrab","YASH-rab","to drink","u6","Verbs",1,[["ماذا تشرب؟","What are you drinking?"]]],
  ["يريد","yurid","yu-REED","to want","u6","Verbs",1,[["أريد أن أتعلم","I want to learn"]],
    {"ar-EG":["عايز","ayiz"],"ar-LV":["بدي","biddi"],"ar-GULF":["أبي","abi"],"ar-MA":["بغيت","bghit"]}],
  ["يعرف","ya'rif","YAA-rif","to know","u6","Verbs",2,[["لا أعرف","I don't know"]],
    {"ar-EG":["يعرف","yi'raf"],"ar-MA":["يعرف","y'ref"]}],
  ["يتكلم","yatakallam","ya-ta-KAL-lam","to speak","u6","Verbs",2,[["هل تتكلم الإنجليزية؟","Do you speak English?"]],
    {"ar-EG":["يتكلم","yitkallim"],"ar-MA":["يهضر","yhder"]}],
  ["يفهم","yafham","YAF-ham","to understand","u6","Verbs",2,[["لا أفهم","I don't understand"]]],
  ["يرى","yara","YA-ra","to see","u6","Verbs",2,[["لا أرى شيئا","I can't see anything"]],
    {"ar-EG":["يشوف","yishuf"],"ar-LV":["يشوف","yshuf"],"ar-GULF":["يشوف","yshuf"]}],
  ["يعمل","ya'mal","YAA-mal","to do, to work","u6","Verbs",1,[["ماذا تعمل؟","What are you doing?"]],
    {"ar-EG":["يعمل","yi'mil"],"ar-MA":["يدير","ydir"]}],
  ["يساعد","yusa'id","yu-SAA-id","to help","u6","Verbs",2,[["هل يمكنك مساعدتي؟","Can you help me?"]]],
  ["يشتري","yashtari","yash-TA-ree","to buy","u6","Verbs",2,[["أشتري الخبز","I'm buying bread"]]],
  ["يعطي","yu'ti","YOO-tee","to give","u6","Verbs",2,[["أعطني إياه من فضلك","Give it to me please"]],
    {"ar-EG":["يدي","yiddi"],"ar-LV":["يعطي","ya'ti"]}],
  ["يستطيع","yastati'","yas-ta-TEE","to be able to, can","u6","Verbs",3,[["لا أستطيع اليوم","I can't today"]],
    {"ar-EG":["يقدر","yi'dar"],"ar-LV":["فيه","fi"],"ar-GULF":["يقدر","yigdar"]}],

  // ---- u7 Places ----------------------------------------------------------
  ["مدرسة","madrasa","MAD-ra-sa","school","u7","Places",1,[["المدرسة قريبة","The school is near"]]],
  ["مستشفى","mustashfa","mus-TASH-fa","hospital","u7","Places",2,[["أين المستشفى؟","Where is the hospital?"]]],
  ["سوق","suq","SOOQ","market","u7","Places",1,[["نذهب إلى السوق","We're going to the market"]]],
  ["فندق","funduq","FUN-duq","hotel","u7","Places",1,[["الفندق في الوسط","The hotel is central"]]],
  ["شارع","shari'","SHAA-ri","street","u7","Places",1,[["هذا الشارع طويل","This street is long"]]],
  ["مدينة","madina","ma-DEE-na","city","u7","Places",1,[["المدينة جميلة","The city is beautiful"]]],
  ["غرفة","ghurfa","GHUR-fa","room","u7","Places",1,[["غرفة لشخصين","A room for two"]],
    {"ar-EG":["أوضة","oda"]}],
  ["حمام","hammam","ham-MAAM","bathroom","u7","Places",1,[["أين الحمام؟","Where is the bathroom?"]]],

  // ---- u8 Time ------------------------------------------------------------
  ["الآن","al-aan","al-AAN","now","u8","Time",1,[["ليس الآن","Not now"]],
    {"ar-EG":["دلوقتي","dilwa'ti"],"ar-LV":["هلق","hallaq"],"ar-GULF":["الحين","al-heen"],"ar-MA":["دابا","daba"]}],
  ["دقيقة","daqiqa","da-QEE-qa","minute","u8","Time",1,[["خمس دقائق","Five minutes"]]],
  ["ساعة","sa'a","SAA-a","hour, clock","u8","Time",1,[["بعد ساعة","In an hour"]]],
  ["صباح","sabah","sa-BAAH","morning","u8","Time",1,[["في الصباح الباكر","Early in the morning"]]],
  ["مساء","masaa'","ma-SAA","evening","u8","Time",1,[["في المساء","In the evening"]]],
  ["أمس","ams","AMS","yesterday","u8","Time",1,[["كان أمس باردا","Yesterday was cold"]],
    {"ar-EG":["إمبارح","imbareh"],"ar-LV":["مبارح","mbareh"]}],
  ["دائما","daa'iman","DAA-i-man","always","u8","Time",2,[["هو دائما متأخر","He's always late"]]],
  ["أحيانا","ahyanan","AH-ya-nan","sometimes","u8","Time",2,[["أحيانا أمشي","Sometimes I walk"]]],
  ["بعد","ba'd","BAAD","after","u8","Time",1,[["بعد الغداء","After lunch"]]],
  ["قبل","qabl","QABL","before","u8","Time",1,[["قبل الظهر","Before noon"]]],

  // ---- u9 Feelings --------------------------------------------------------
  ["سعيد","sa'id","sa-EED","happy","u9","Feelings",1,[["أنا سعيد جدا","I'm very happy"]],
    {"ar-EG":["مبسوط","mabsut"],"ar-LV":["مبسوط","mabsut"]}],
  ["حزين","hazin","ha-ZEEN","sad","u9","Feelings",2,[["يبدو حزينا","He looks sad"]],
    {"ar-EG":["زعلان","za'lan"],"ar-LV":["زعلان","za'lan"]}],
  ["تعبان","ta'ban","taa-BAAN","tired","u9","Feelings",1,[["أنا تعبان اليوم","I'm tired today"]]],
  ["جوعان","jaw'an","jaw-AAN","hungry","u9","Feelings",1,[["أنا جوعان","I'm hungry"]]],
  ["مريض","marid","ma-REED","ill, sick","u9","Feelings",2,[["هي مريضة","She is ill"]]],
  ["خائف","kha'if","KHAA-if","afraid","u9","Feelings",2,[["لا تكن خائفا","Don't be afraid"]],
    {"ar-EG":["خايف","khayif"],"ar-LV":["خايف","khayif"]}],

  // ---- u10 Useful Words ---------------------------------------------------
  ["ماذا","madha","MAA-dha","what","u10","Useful",1,[["ماذا تريد؟","What do you want?"]],
    {"ar-EG":["إيه","eh"],"ar-LV":["شو","shu"],"ar-GULF":["شنو","shnu"],"ar-MA":["شنو","shnu"]}],
  ["أين","ayna","AY-na","where","u10","Useful",1,[["أين تسكن؟","Where do you live?"]],
    {"ar-EG":["فين","fen"],"ar-LV":["وين","wen"],"ar-GULF":["وين","wen"],"ar-MA":["فين","fin"]}],
  ["متى","mata","MA-ta","when","u10","Useful",1,[["متى تصل؟","When do you arrive?"]],
    {"ar-EG":["إمتى","imta"],"ar-LV":["إيمتى","emta"],"ar-GULF":["متى","mita"],"ar-MA":["إمتى","imta"]}],
  ["لماذا","limadha","li-MAA-dha","why","u10","Useful",1,[["لماذا تسأل؟","Why do you ask?"]],
    {"ar-EG":["ليه","leh"],"ar-LV":["ليش","lesh"],"ar-GULF":["ليش","lesh"],"ar-MA":["علاش","alash"]}],
  ["كيف","kayfa","KAY-fa","how","u10","Useful",1,[["كيف أصل إلى هناك؟","How do I get there?"]],
    {"ar-EG":["إزاي","izzay"],"ar-LV":["كيف","kif"],"ar-GULF":["شلون","shlon"],"ar-MA":["كيفاش","kifash"]}],
  ["من","man","MAN","who","u10","Useful",1,[["من هذا؟","Who is this?"]],
    {"ar-EG":["مين","meen"],"ar-LV":["مين","meen"],"ar-GULF":["منو","minu"],"ar-MA":["شكون","shkun"]}],
  ["هنا","huna","HU-na","here","u10","Useful",1,[["أنا هنا","I'm here"]],
    {"ar-EG":["هنا","hena"],"ar-GULF":["هني","hnee"]}],
  ["هناك","hunak","hu-NAAK","there","u10","Useful",1,[["الصيدلية هناك","The pharmacy is there"]],
    {"ar-EG":["هناك","henak"]}],
  ["كثير","kathir","ka-THEER","a lot, much","u10","Useful",1,[["شكرا كثيرا","Thank you very much"]],
    {"ar-EG":["كتير","kitir"],"ar-LV":["كتير","ktir"],"ar-GULF":["وايد","wayid"],"ar-MA":["بزاف","bzzaf"]}],
  ["قليل","qalil","qa-LEEL","a little, few","u10","Useful",1,[["وقت قليل","A little time"]]],
  ["كبير","kabir","ka-BEER","big","u10","Useful",1,[["بيت كبير","A big house"]]],
  ["صغير","saghir","sa-GHEER","small","u10","Useful",1,[["كوب صغير","A small cup"]]],
  ["جديد","jadid","ja-DEED","new","u10","Useful",1,[["هاتف جديد","A new phone"]]],
  ["جيد","jayyid","JAY-yid","good","u10","Useful",1,[["عمل جيد","Good work"]],
    {"ar-EG":["كويس","kwayyis"],"ar-LV":["منيح","mnih"],"ar-GULF":["زين","zein"],"ar-MA":["مزيان","mezyan"]}],
  ["ممكن","mumkin","MUM-kin","possible, may I","u10","Useful",1,[["ممكن سؤال؟","May I ask a question?"]]],
  ["مع","ma'a","MA-a","with","u10","Connectors",1,[["قهوة مع حليب","Coffee with milk"]]],
  ["بدون","bidun","bi-DOON","without","u10","Connectors",1,[["بدون سكر","Without sugar"]]],
  ["لكن","lakin","LAA-kin","but","u10","Connectors",1,[["صغير لكن جميل","Small but beautiful"]],
    {"ar-EG":["بس","bass"],"ar-LV":["بس","bass"]}],
  ["لأن","li'anna","li-AN-na","because","u10","Connectors",2,[["أبقى لأن الجو ممطر","I'm staying because it's raining"]],
    {"ar-EG":["علشان","alashan"],"ar-LV":["لأنو","la'anno"]}],
  ["أيضا","aydan","AY-dan","also, too","u10","Connectors",1,[["أنا أيضا","Me too"]],
    {"ar-EG":["كمان","kaman"],"ar-LV":["كمان","kaman"]}],
  ["فقط","faqat","FA-qat","only","u10","Connectors",1,[["واحد فقط","Only one"]],
    {"ar-EG":["بس","bass"],"ar-LV":["بس","bass"]}],

  // ---- u11 Getting Around -------------------------------------------------
  ["يمين","yamin","ya-MEEN","right","u11","Transport",1,[["الشارع الثاني يمين","The second street on the right"]]],
  ["يسار","yasar","ya-SAAR","left","u11","Transport",1,[["ثم يسار","Then left"]],
    {"ar-EG":["شمال","shimal"]}],
  ["مباشرة","mubasharatan","mu-BAA-sha-ra-tan","straight ahead","u11","Transport",2,[["امش مباشرة","Walk straight ahead"]],
    {"ar-EG":["على طول","ala tul"],"ar-LV":["دغري","dughri"]}],
  ["تذكرة","tadhkira","TADH-ki-ra","ticket","u11","Transport",2,[["تذكرة إلى بيروت","A ticket to Beirut"]]],
  ["مطار","matar","ma-TAAR","airport","u11","Transport",2,[["إلى المطار من فضلك","To the airport please"]]],
  ["حقيبة","haqiba","ha-QEE-ba","bag, suitcase","u11","Travel",2,[["حقيبتي ضاعت","My bag is lost"]],
    {"ar-EG":["شنطة","shanta"]}],
  ["بعيد","ba'id","ba-EED","far","u11","Transport",1,[["هل هو بعيد؟","Is it far?"]]],
  ["قريب","qarib","qa-REEB","near","u11","Transport",1,[["قريب جدا","Very near"]]],

  // ---- u12 Weather & Nature -----------------------------------------------
  ["حار","harr","HARR","hot","u12","Weather",1,[["الجو حار اليوم","The weather is hot today"]]],
  ["بارد","barid","BAA-rid","cold","u12","Weather",1,[["الماء بارد","The water is cold"]]],
  ["مطر","matar","MA-tar","rain","u12","Weather",1,[["المطر لا يتوقف","The rain won't stop"]]],
  ["شمس","shams","SHAMS","sun","u12","Weather",1,[["الشمس مشرقة","The sun is shining"]]],
  ["بحر","bahr","BAHR","sea","u12","Nature",1,[["البحر هادئ","The sea is calm"]]],
  ["جبل","jabal","JA-bal","mountain","u12","Nature",2,[["نذهب إلى الجبل","We're going to the mountain"]]],
];

// ---------------------------------------------------------------------------
const existing = new Set(pack.vocab.map((v) => v.lemma));
const existingTranslations = new Set(pack.vocab.map((v) => v.translation));
let nextId = Math.max(...pack.vocab.map((v) => Number(v.id.split("_")[1]))) + 1;

/**
 * Build the dialect map, dropping any variety whose written form is IDENTICAL
 * to the standard one.
 *
 * Several of these were authored by hand and several turned out to be the same
 * word — خبز is خبز in Morocco, هناك is هناك in Egypt. Keeping them would show
 * the learner an arrow pointing from a word to itself and imply a difference
 * that isn't there, which is worse than saying nothing. The validator now fails
 * the build on it; this is the other half of that rule.
 */
function dialectMap(dialects, standardLemma) {
  if (!dialects) return null;
  const out = {};
  for (const [id, [dl, dt]] of Object.entries(dialects)) {
    if (!dl || dl === standardLemma) continue;
    out[id] = { lemma: dl, translit: dt };
  }
  return Object.keys(out).length ? out : null;
}

const byLemma = new Map(pack.vocab.map((v) => [v.lemma, v]));

const added = [];
const enriched = [];
const skipped = [];
for (const [lemma, translit, pronunciation, translation, unit, category, difficulty, examples, dialects] of NEW) {
  // ALREADY TAUGHT? Then don't skip it — merge in what's new.
  //
  // Most of the dialect value sits on words the pack ALREADY has: أين, ماذا,
  // كيف, يريد are the highest-frequency words in the language and the ones whose
  // spoken forms differ most. Skipping them as duplicates would have thrown away
  // the entire point of this pass and left dialect coverage at a sixth of what
  // it should be.
  const already = byLemma.get(lemma);
  if (already) {
    let touched = false;
    const d = dialectMap(dialects, lemma);
    if (d && !already.dialects) { already.dialects = d; touched = true; }
    if (!already.pronunciation && pronunciation) { already.pronunciation = pronunciation; touched = true; }
    // A second example sentence is a second chance for the generator to build a
    // fill-the-gap exercise, and a word with only one is a word that gets tested
    // the same way every time.
    const haveNatives = new Set((already.examples || []).map((e) => e.native));
    for (const [native, t] of examples) {
      if (!haveNatives.has(native) && (already.examples || []).length < 3) {
        already.examples = [...(already.examples || []), { native, translation: t }];
        touched = true;
      }
    }
    if (touched) enriched.push(lemma);
    else skipped.push(`${lemma} (already complete)`);
    continue;
  }
  if (existingTranslations.has(translation)) { skipped.push(`${lemma} → "${translation}" (meaning already taught)`); continue; }
  existing.add(lemma);
  existingTranslations.add(translation);
  const entry = {
    id: `ar_${String(nextId++).padStart(4, "0")}`,
    lemma, translit, pronunciation, translation, category, difficulty,
    unit,
    examples: examples.map(([native, t]) => ({ native, translation: t })),
  };
  const d = dialectMap(dialects, lemma);
  if (d) entry.dialects = d;
  added.push(entry);
}

pack.vocab = [...pack.vocab, ...added];

// ---------------------------------------------------------------------------
// Re-rank by real usefulness. The old ranks were sparse and partly arbitrary;
// what the selector needs is a dense, honest ordering so the most useful words
// are introduced first. Order: difficulty, then unit (which is roughly a
// teaching order), then the hand-written order within a unit.
// ---------------------------------------------------------------------------
const unitOrder = Object.fromEntries((pack.units || []).map((u, i) => [u.id, i]));
const ordered = [...pack.vocab].sort((a, b) => {
  if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
  const ua = unitOrder[a.unit] ?? 99, ub = unitOrder[b.unit] ?? 99;
  if (ua !== ub) return ua - ub;
  return (a.frequencyRank || 999) - (b.frequencyRank || 999);
});
ordered.forEach((v, i) => { v.frequencyRank = i + 1; });

pack.categories = [...new Set(pack.vocab.map((v) => v.category))].sort();

writeFileSync(FILE, JSON.stringify(pack, null, 1) + "\n");

const perUnit = {};
for (const v of pack.vocab) perUnit[v.unit] = (perUnit[v.unit] || 0) + 1;
const withDialects = pack.vocab.filter((v) => v.dialects).length;

console.log(`ar.json: ${pack.vocab.length} words (+${added.length} new, ${enriched.length} enriched)`);
console.log(`  with dialect forms: ${withDialects}`);
console.log(`  per unit: ${(pack.units || []).map((u) => `${u.id}:${perUnit[u.id] || 0}`).join(" ")}`);
if (skipped.length) console.log(`  skipped ${skipped.length}:\n    ${skipped.join("\n    ")}`);
