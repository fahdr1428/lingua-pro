#!/usr/bin/env node
// =============================================================================
// expand-round2.mjs — the essentials still missing after the first pass.
//
// test-engine asserts every pack covers the 81 concepts a beginner course must
// have. This closes the remaining gaps it found in Japanese, Korean, Punjabi,
// Nigerian Pidgin and Turkish — mostly the small connecting words (with, without,
// not, more) that a first authoring pass always forgets and a learner cannot
// build a sentence without.
// =============================================================================

import { merge } from "./merge.mjs";

merge("ja", [
  ["値段","nedan","neh-dan","price","u10","Common",2,[["値段はいくらですか","What's the price?"]]],
  ["もっと","motto","mot-toh","more","u10","Common",1,[["もっとください","More please"]]],
  ["と","to","toh","and, with","u10","Common",1,[["パンとコーヒー","Bread and coffee"]]],
  ["なし","nashi","nah-shee","without","u10","Common",2,[["砂糖なしで","Without sugar"]]],
  ["か","ka","kah","or","u10","Common",2,[["お茶かコーヒー","Tea or coffee"]]],
  ["ない","nai","nah-ee","not, there isn't","u10","Common",1,[["時間がない","There's no time"]]],
  ["全部","zenbu","zen-boo","all, everything","u10","Common",2,[["全部ください","All of it please"]]],
  ["遠い","tooi","toh-ee","far","u11","Travel",1,[["駅は遠いですか","Is the station far?"]]],
  ["悲しい","kanashii","kah-nah-shee","sad","u9","Feelings",2,[["悲しそうです","He looks sad"]]],
]);

merge("ko", [
  ["저","jeo","jaw","I (polite)","u2","People",1,[["저는 학생이에요","I'm a student"]]],
  ["당신","dangsin","dang-shin","you","u2","People",2,[["당신은 어디에서 왔어요?","Where are you from?"]]],
  ["안녕하세요","annyeonghaseyo","an-nyawng-hah-seh-yo","hello","u1","Greetings",1,[["안녕하세요, 반갑습니다","Hello, nice to meet you"]]],
  ["죄송합니다","joesonghamnida","jweh-song-ham-nee-dah","sorry","u1","Greetings",2,[["죄송합니다, 늦었어요","Sorry, I'm late"]]],
  ["안","an","an","not","u9","Connectors",1,[["안 가요","I'm not going"]]],
  ["기쁘다","gippeuda","gee-ppeu-dah","happy, glad","u11","Body",2,[["아주 기뻐요","I'm very happy"]]],
  ["슬프다","seulpeuda","seul-peu-dah","sad","u11","Body",2,[["슬퍼 보여요","You look sad"]]],
  ["피곤하다","pigonhada","pee-gon-hah-dah","tired","u11","Body",2,[["오늘 피곤해요","I'm tired today"]]],
]);

merge("pa", [
  ["لوڑ","lorr","LORR","need","u2","Common",2,[["مینوں مدد دی لوڑ اے","I need help"]]],
  ["کل","kall","KALL","tomorrow, yesterday","u4","Time",1,[["کل ملدے آں","See you tomorrow"]]],
  ["خریدݨا","khareedna","kha-REED-na","to buy","u5","Verbs",2,[["میں روٹی خریدنا واں","I buy bread"]]],
  ["قیمت","qeemat","QEE-mat","price","u6","Common",2,[["ایہدی قیمت کی اے؟","What's the price of this?"]]],
  ["گرم","garam","GA-ram","hot","u5","Common",1,[["اَج گرمی اے","It's hot today"]]],
  ["ٹھنڈا","thanda","THAN-da","cold","u5","Common",1,[["پاݨی ٹھنڈا اے","The water is cold"]]],
  ["نئیں","nahin","na-HEEN","not, no","u2","Connectors",1,[["ایہ ٹھیک نئیں","That's not right"]]],
  ["اداس","udaas","u-DAAS","sad","u2","Common",2,[["اوہ اداس لگدا اے","He looks sad"]]],
]);

merge("pcm", [
  ["make","","MEK","to make","u5","Verbs",1,[["Make we go","Let's go"]]],
  ["now","","NAU","now","u4","Time",1,[["I dey come now","I'm coming now"]]],
  ["pass","","PAS","more than","u5","Common",2,[["Dis one betta pass dat one","This one is better than that one"]]],
  ["well","","WEL","very","u5","Common",1,[["E good well","It's very good"]]],
  ["no be","","NO BE","not, isn't","u6","Connectors",1,[["No be so","It's not like that"]]],
  ["left hand","","LEFT HAND","left","u6","Travel",1,[["Turn for left hand","Turn to the left"]]],
  ["right hand","","RAIT HAND","right","u6","Travel",1,[["Na for right hand","It's on the right"]]],
  ["sad","","SAD","sad","u2","Common",1,[["I dey sad","I'm sad"]]],
], { translitIsLemma: true });

merge("tr", [
  ["yiyecek","","yee-yeh-JEK","food","u5","Food",2,[["Yiyecek var mı?","Is there any food?"]]],
  ["var","","VAR","to have, there is","u10","Common",1,[["Zamanım var","I have time"]]],
  ["ihtiyaç","","eeh-tee-YACH","need","u10","Common",2,[["Yardıma ihtiyacım var","I need help"]]],
  ["ev","","EV","house, home","u7","Places",1,[["Evdeyim","I'm at home"]]],
  ["satın almak","","sa-TUHN al-MAK","to buy","u6","Verbs",2,[["Ekmek satın aldım","I bought bread"]]],
  ["daha","","da-HA","more","u8","Common",1,[["Biraz daha","A little more"]]],
  ["olmadan","","ol-ma-DAN","without","u10","Connectors",2,[["Şekersiz, şeker olmadan","Without sugar"]]],
  ["değil","","deh-EEL","not","u10","Connectors",1,[["Bu doğru değil","That's not right"]]],
  ["hepsi","","HEP-see","all, everything","u10","Connectors",1,[["Hepsi iyi","Everything is fine"]]],
], { translitIsLemma: true });
