#!/usr/bin/env node
// =============================================================================
// expand-round3.mjs — closes the last essential gaps, and gives Iraqi and
// Sudanese Arabic real content.
//
// Arabic was expanded before the gap analysis existed, so it kept the holes the
// analysis later found. Iraqi and Sudanese were offered in the dialect picker
// with nothing behind them — an empty promise is worse than an honest omission,
// so they now carry the same core spoken forms as the other varieties.
// =============================================================================

import { merge } from "./merge.mjs";
import { readFileSync, writeFileSync } from "node:fs";

merge("ar", [
  ["سيء","sayyi'","SAY-yi","bad","u10","Useful",1,[["الطقس سيء","The weather is bad"]]],
  ["يأتي","ya'ti","YAA-tee","to come","u6","Verbs",1,[["متى تأتي؟","When are you coming?"]],
    {"ar-EG":["ييجي","yigi"],"ar-LV":["يجي","yiji"]}],
  ["يملك","yamlik","YAM-lik","to have, to own","u6","Verbs",2,[["أملك سيارة","I have a car"]]],
  ["يصنع","yasna'","YAS-na","to make","u6","Verbs",2,[["أصنع الشاي","I make tea"]],
    {"ar-EG":["يعمل","yi'mil"],"ar-MA":["يدير","ydir"]}],
  ["مال","maal","MAAL","money","u10","Useful",1,[["ليس معي مال","I don't have money"]],
    {"ar-EG":["فلوس","fulus"],"ar-LV":["مصاري","masari"],"ar-GULF":["فلوس","fulus"],"ar-IQ":["فلوس","fulus"]}],
  ["وقت","waqt","WAQT","time","u8","Time",1,[["ليس لدي وقت","I don't have time"]]],
  ["رجل","rajul","RA-jul","man","u2","People",1,[["ذلك الرجل أخي","That man is my brother"]],
    {"ar-EG":["راجل","raagil"],"ar-MA":["راجل","rajel"]}],
  ["امرأة","imra'a","im-RA-a","woman","u2","People",1,[["تلك المرأة طبيبة","That woman is a doctor"]],
    {"ar-EG":["ست","sitt"],"ar-LV":["مرا","mara"]}],
  ["سعر","si'r","SIR","price","u10","Useful",2,[["كم السعر؟","What's the price?"]],
    {"ar-EG":["تمن","taman"]}],
  ["يفتح","yaftah","YAF-tah","to open","u6","Verbs",2,[["افتح الباب","Open the door"]]],
  ["أكثر","akthar","AK-thar","more","u10","Connectors",1,[["أكثر قليلا","A little more"]],
    {"ar-EG":["أكتر","aktar"],"ar-MA":["كتر","kter"]}],
  ["جدا","jiddan","JID-dan","very","u10","Connectors",1,[["جيد جدا","Very good"]],
    {"ar-EG":["قوي","awi"],"ar-LV":["كتير","ktir"],"ar-MA":["بزاف","bzzaf"]}],
  ["ليس","laysa","LAY-sa","not, is not","u10","Connectors",2,[["هذا ليس صحيحا","That is not right"]],
    {"ar-EG":["مش","mish"],"ar-LV":["مش","mish"],"ar-GULF":["مو","mu"],"ar-IQ":["ماكو","maku"],"ar-MA":["ماشي","mashi"]}],
  ["كل","kull","KULL","all, every","u10","Connectors",1,[["كل شيء بخير","Everything is fine"]]],
  ["يسار","yasar","ya-SAAR","left","u11","Transport",1,[["اتجه يسارا","Turn left"]],
    {"ar-EG":["شمال","shimal"]}],
  ["طبيب","tabib","ta-BEEB","doctor","u9","Feelings",1,[["أحتاج طبيبا","I need a doctor"]],
    {"ar-EG":["دكتور","doktor"],"ar-LV":["حكيم","hakim"]}],
]);

merge("ko", [
  ["나","na","nah","I (casual)","u2","People",1,[["나도 가요","I'm going too"]]],
  ["너","neo","naw","you (casual)","u2","People",1,[["너 어디야?","Where are you?"]]],
  ["여보세요","yeoboseyo","yaw-bo-seh-yo","hello (on the phone)","u1","Greetings",1,[["여보세요, 누구세요?","Hello, who's calling?"]]],
  ["미안해요","mianhaeyo","mee-an-heh-yo","sorry","u1","Greetings",1,[["미안해요, 몰랐어요","Sorry, I didn't know"]]],
  ["왼쪽으로","oenjjogeuro","wen-jjo-geu-ro","to the left","u13","Travel",2,[["왼쪽으로 도세요","Turn to the left"]]],
  ["오른쪽으로","oreunjjogeuro","oh-reun-jjo-geu-ro","to the right","u13","Travel",2,[["오른쪽으로 가세요","Go to the right"]]],
  ["뜨겁다","tteugeopda","tteu-gawp-tah","hot (to touch)","u5","Food",2,[["커피가 뜨거워요","The coffee is hot"]]],
  ["차갑다","chagapda","chah-gap-tah","cold (to touch)","u5","Food",2,[["물이 차가워요","The water is cold"]]],
]);

merge("tr", [
  ["siz","","SEEZ","you (formal/plural)","u2","People",1,[["Siz nerelisiniz?","Where are you from?"]]],
  ["yemek yemek","","yeh-MEK yeh-MEK","to eat","u5","Verbs",2,[["Yemek yedin mi?","Have you eaten?"]]],
  ["etmek","","ET-mek","to do","u6","Verbs",2,[["Yardım eder misin?","Would you help?"]]],
  ["oluşturmak","","o-loosh-toor-MAK","to make, to create","u6","Verbs",3,[["Bir plan oluşturalım","Let's make a plan"]]],
  ["-abilmek","","a-BEEL-mek","to be able to, can","u6","Verbs",3,[["Gidebilirim","I can go"]]],
  ["götürmek","","ger-tuer-MEK","to take (along)","u6","Verbs",3,[["Seni götürebilirim","I can take you"]]],
  ["meslek","","mes-LEK","job, profession","u2","Common",2,[["Mesleğiniz ne?","What's your profession?"]]],
  ["çok fazla","","CHOK faz-LA","very much, a lot","u8","Common",2,[["Çok fazla var","There's a lot"]]],
  ["solda","","sol-DA","on the left","u10","Travel",1,[["Solda duruyor","It's on the left"]]],
  ["sağda","","saa-DA","on the right","u10","Travel",1,[["Sağda göreceksin","You'll see it on the right"]]],
], { translitIsLemma: true });

// ---------------------------------------------------------------------------
// Iraqi and Sudanese: attach spoken forms to words the pack already teaches,
// so both varieties have something real behind them in the picker.
// ---------------------------------------------------------------------------
const IQ_SD = {
  "ماذا":   { "ar-IQ": ["شنو", "shnu"],      "ar-SD": ["شنو", "shinu"] },
  "أين":    { "ar-IQ": ["وين", "wen"],       "ar-SD": ["وين", "wen"] },
  "كيف":    { "ar-IQ": ["شلون", "shlon"],    "ar-SD": ["كيف", "kef"] },
  "لماذا":  { "ar-IQ": ["ليش", "lesh"],      "ar-SD": ["ليه", "leh"] },
  "متى":    { "ar-IQ": ["يمته", "yamta"],    "ar-SD": ["متين", "mitin"] },
  "من":     { "ar-IQ": ["منو", "minu"],      "ar-SD": ["منو", "minu"] },
  "يريد":   { "ar-IQ": ["يريد", "yrid"],     "ar-SD": ["عايز", "ayiz"] },
  "كثير":   { "ar-IQ": ["هواية", "hwaya"],   "ar-SD": ["كتير", "katir"] },
  "جيد":    { "ar-IQ": ["زين", "zen"],       "ar-SD": ["كويس", "kwayyis"] },
  "الآن":   { "ar-IQ": ["هسه", "hassa"],     "ar-SD": ["هسع", "hassa" ] },
  "كيف حالك": { "ar-IQ": ["شلونك", "shlonak"], "ar-SD": ["كيفك", "kefak"] },
  "يستطيع": { "ar-IQ": ["يگدر", "yigdar"],   "ar-SD": ["يقدر", "yagdar"] },
};

const file = "src/data/languages/ar.json";
const pack = JSON.parse(readFileSync(file, "utf8"));
let attached = 0;
for (const w of pack.vocab) {
  const extra = IQ_SD[w.lemma];
  if (!extra) continue;
  w.dialects = w.dialects || {};
  for (const [id, [lemma, translit]] of Object.entries(extra)) {
    // Same rule as everywhere: identical to the standard form teaches nothing.
    if (lemma === w.lemma) continue;
    w.dialects[id] = { lemma, translit };
    attached++;
  }
}
writeFileSync(file, JSON.stringify(pack, null, 1) + "\n");
console.log(`ar: attached ${attached} Iraqi/Sudanese forms`);
