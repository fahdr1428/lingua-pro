#!/usr/bin/env node
// =============================================================================
// expand-indic.mjs — Urdu, Hindi and Punjabi core vocabulary.
//
// Targeted at the gap measured against the 85 concepts a beginner course has to
// cover to be useful at all: to have, to want, can, need, money, how, man,
// woman, work, price, near, far, doctor, bathroom. Words you cannot hold a
// single real conversation without.
//
// URDU AND HINDI ARE THE SAME SPOKEN LANGUAGE in this register, so the entries
// deliberately mirror each other — different script, near-identical words. That
// is the truth about Hindustani and it's useful for a learner to see.
//
// Verb citation forms follow each pack's existing convention: the infinitive
// (کھانا / खाना / ਖਾਣਾ). Gendered forms are given in the masculine, as the packs
// already do, and the packs' own grammar notes flag that.
// =============================================================================

import { merge } from "./merge.mjs";

// [lemma, translit, pronunciation, translation, unit, category, difficulty, examples]
const ur = [
  ["تم","tum","TUM","you (familiar)","u2","People",1,[["تم کہاں ہو؟","Where are you?"]]],
  ["ہونا","hona","HO-na","to have, to be","u6","Verbs",2,[["میرے پاس وقت ہے","I have time"]]],
  ["بنانا","banana","ba-NA-na","to make","u6","Verbs",2,[["میں چائے بناتا ہوں","I make tea"]]],
  ["سکنا","sakna","SAK-na","to be able to, can","u6","Verbs",2,[["کیا آپ مدد کر سکتے ہیں؟","Can you help?"]]],
  ["ضرورت","zaroorat","za-ROO-rat","need","u6","Common",2,[["مجھے مدد کی ضرورت ہے","I need help"]]],
  ["سمجھنا","samajhna","sa-MAJH-na","to understand","u6","Verbs",2,[["میں نہیں سمجھا","I didn't understand"]]],
  ["پیسے","paise","PAY-se","money","u10","Common",1,[["میرے پاس پیسے نہیں ہیں","I don't have money"]]],
  ["کیسے","kaise","KAY-se","how","u9","Connectors",1,[["یہ کیسے کام کرتا ہے؟","How does this work?"]]],
  ["آدمی","aadmi","AAD-mee","man","u2","People",1,[["وہ آدمی میرا بھائی ہے","That man is my brother"]]],
  ["عورت","aurat","AU-rat","woman","u2","People",1,[["وہ عورت ڈاکٹر ہے","That woman is a doctor"]]],
  ["کام","kaam","KAAM","work","u2","Common",1,[["میرا کام ختم ہوا","My work is done"]]],
  ["قیمت","qeemat","QEE-mat","price","u10","Common",2,[["اس کی قیمت کیا ہے؟","What's the price of this?"]]],
  ["کھولنا","kholna","KHOL-na","to open","u6","Verbs",2,[["دروازہ کھولیں","Open the door"]]],
  ["زیادہ","ziyada","zi-YA-da","more","u9","Connectors",1,[["تھوڑا زیادہ","A little more"]]],
  ["بہت","bohot","BO-hot","very","u9","Connectors",1,[["بہت اچھا","Very good"]]],
  ["کے ساتھ","ke saath","ke SAATH","with","u9","Connectors",1,[["دودھ کے ساتھ چائے","Tea with milk"]]],
  ["کے بغیر","ke baghair","ke ba-GHAIR","without","u9","Connectors",2,[["چینی کے بغیر","Without sugar"]]],
  ["سب","sab","SAB","all, everyone","u9","Connectors",1,[["سب ٹھیک ہے","Everything is fine"]]],
  ["بائیں","baayen","BAA-yen","left","u13","Travel",1,[["بائیں مڑیں","Turn left"]]],
  ["دائیں","daayen","DAA-yen","right","u13","Travel",1,[["دائیں طرف","On the right"]]],
  ["قریب","qareeb","qa-REEB","near","u13","Travel",1,[["یہ قریب ہے","It's near"]]],
  ["دور","door","DOOR","far","u13","Travel",1,[["بہت دور ہے","It's very far"]]],
  ["نام","naam","NAAM","name","u2","About You",1,[["آپ کا نام کیا ہے؟","What is your name?"]]],
  ["بیمار","beemar","bee-MAAR","sick, ill","u11","Body",1,[["میں بیمار ہوں","I am sick"]]],
  ["ڈاکٹر","doctor","DAAK-tar","doctor","u11","Body",1,[["مجھے ڈاکٹر چاہیے","I need a doctor"]]],
  ["باتھ روم","bathroom","BAATH-room","bathroom","u7","Places",1,[["باتھ روم کہاں ہے؟","Where is the bathroom?"]]],
  ["برا","bura","BU-ra","bad","u9","Common",1,[["موسم برا ہے","The weather is bad"]]],
  ["خریدنا","khareedna","kha-REED-na","to buy","u6","Verbs",2,[["میں روٹی خریدتا ہوں","I buy bread"]]],
  ["دینا","dena","DAY-na","to give","u6","Verbs",2,[["مجھے دو","Give me"]]],
  ["لینا","lena","LAY-na","to take","u6","Verbs",2,[["یہ لے لو","Take this"]]],
];

const hi = [
  ["तुम","tum","TUM","you (familiar)","u2","People",1,[["तुम कहाँ हो?","Where are you?"]]],
  ["होना","hona","HO-na","to have, to be","u6","Verbs",2,[["मेरे पास समय है","I have time"]]],
  ["चाहना","chahna","CHAAH-na","to want","u6","Verbs",2,[["मैं सीखना चाहता हूँ","I want to learn"]]],
  ["करना","karna","KAR-na","to do","u6","Verbs",1,[["तुम क्या कर रहे हो?","What are you doing?"]]],
  ["बनाना","banana","ba-NA-na","to make","u6","Verbs",2,[["मैं चाय बनाता हूँ","I make tea"]]],
  ["सकना","sakna","SAK-na","to be able to, can","u6","Verbs",2,[["क्या आप मदद कर सकते हैं?","Can you help?"]]],
  ["ज़रूरत","zaroorat","za-ROO-rat","need","u6","Common",2,[["मुझे मदद की ज़रूरत है","I need help"]]],
  ["पैसे","paise","PAY-se","money","u10","Useful",1,[["मेरे पास पैसे नहीं हैं","I don't have money"]]],
  ["समय","samay","SA-may","time","u8","Time",1,[["समय नहीं है","There's no time"]]],
  ["दिन","din","DIN","day","u8","Time",1,[["अच्छा दिन","A good day"]]],
  ["कल","kal","KAL","tomorrow, yesterday","u8","Time",1,[["कल मिलते हैं","See you tomorrow"]]],
  ["कैसे","kaise","KAY-se","how","u10","Useful",1,[["यह कैसे काम करता है?","How does this work?"]]],
  ["आदमी","aadmi","AAD-mee","man","u2","People",1,[["वह आदमी मेरा भाई है","That man is my brother"]]],
  ["औरत","aurat","AU-rat","woman","u2","People",1,[["वह औरत डॉक्टर है","That woman is a doctor"]]],
  ["शहर","shehar","SHE-har","city","u7","Places",1,[["यह शहर बड़ा है","This city is big"]]],
  ["काम","kaam","KAAM","work","u2","Common",1,[["मेरा काम खत्म हुआ","My work is done"]]],
  ["खरीदना","khareedna","kha-REED-na","to buy","u6","Verbs",2,[["मैं रोटी खरीदता हूँ","I buy bread"]]],
  ["कीमत","keemat","KEE-mat","price","u10","Useful",2,[["इसकी कीमत क्या है?","What's the price of this?"]]],
  ["खोलना","kholna","KHOL-na","to open","u6","Verbs",2,[["दरवाज़ा खोलिए","Open the door"]]],
  ["बहुत","bahut","ba-HUT","very, a lot","u10","Useful",1,[["बहुत अच्छा","Very good"]]],
  ["के साथ","ke saath","ke SAATH","with","u10","Connectors",1,[["दूध के साथ चाय","Tea with milk"]]],
  ["के बिना","ke bina","ke bi-NA","without","u10","Connectors",2,[["चीनी के बिना","Without sugar"]]],
  ["सब","sab","SAB","all, everyone","u10","Connectors",1,[["सब ठीक है","Everything is fine"]]],
  ["बाएँ","baayen","BAA-yen","left","u11","Transport",1,[["बाएँ मुड़िए","Turn left"]]],
  ["दाएँ","daayen","DAA-yen","right","u11","Transport",1,[["दाईं तरफ","On the right"]]],
  ["उदास","udaas","u-DAAS","sad","u9","Feelings",2,[["वह उदास लग रहा है","He looks sad"]]],
  ["बीमार","beemar","bee-MAAR","sick, ill","u9","Feelings",1,[["मैं बीमार हूँ","I am sick"]]],
  ["डॉक्टर","doctor","DAAK-tar","doctor","u7","Places",1,[["मुझे डॉक्टर चाहिए","I need a doctor"]]],
  ["बाथरूम","bathroom","BAATH-room","bathroom","u7","Places",1,[["बाथरूम कहाँ है?","Where is the bathroom?"]]],
  ["बुरा","bura","BU-ra","bad","u10","Useful",1,[["मौसम बुरा है","The weather is bad"]]],
];

// Punjabi has only six units, so everything lands in one that exists.
const pa = [
  ["تسیں","tusin","tu-SEEN","you (respectful)","u2","People",1,[["تسیں کیویں او؟","How are you?"]]],
  ["پینا","peena","PEE-na","to drink","u5","Verbs",1,[["میں پانی پیندا ہاں","I drink water"]]],
  ["ہونا","hona","HO-na","to have, to be","u2","Verbs",2,[["میرے کول ویلا اے","I have time"]]],
  ["چاہنا","chaahna","CHAAH-na","to want","u2","Verbs",2,[["میں سکھنا چاہنا واں","I want to learn"]]],
  ["بݨاؤنا","banauna","ba-NAU-na","to make","u5","Verbs",2,[["میں چاء بݨاؤنا واں","I make tea"]]],
  ["سکݨا","sakna","SAK-na","to be able to, can","u2","Verbs",2,[["تسیں مدد کر سکدے او؟","Can you help?"]]],
  ["سمجھݨا","samajhna","sa-MAJH-na","to understand","u2","Verbs",2,[["میں نئیں سمجھیا","I didn't understand"]]],
  ["پیسے","paise","PAY-se","money","u6","Common",1,[["میرے کول پیسے نئیں","I don't have money"]]],
  ["دن","din","DIN","day","u4","Time",1,[["چنگا دن","A good day"]]],
  ["کل","kal","KAL","tomorrow, yesterday","u4","Time",1,[["کل ملدے آں","See you tomorrow"]]],
  ["ہُݨ","hun","HUN","now","u4","Time",1,[["ہُݨ نئیں","Not now"]]],
  ["اِتھے","ithe","IT-they","here","u6","Common",1,[["میں اِتھے آں","I'm here"]]],
  ["اوتھے","othe","OT-they","there","u6","Common",1,[["اوہ اوتھے اے","It's there"]]],
  ["بندہ","banda","BAN-da","man","u3","People",1,[["اوہ بندہ میرا بھرا اے","That man is my brother"]]],
  ["زنانی","zanani","za-NA-nee","woman","u3","People",2,[["اوہ زنانی ڈاکٹر اے","That woman is a doctor"]]],
  ["دوست","dost","DOST","friend","u3","People",1,[["اوہ میرا دوست اے","He is my friend"]]],
  ["شہر","shehar","SHE-har","city","u6","Travel",1,[["ایہ شہر وڈا اے","This city is big"]]],
  ["کم","kamm","KAMM","work","u2","Common",1,[["میرا کم مُک گیا","My work is done"]]],
  ["کھولݨا","kholna","KHOL-na","to open","u5","Verbs",2,[["بوا کھولو","Open the door"]]],
  ["بہت","bohot","BO-hot","very, a lot","u2","Common",1,[["بہت چنگا","Very good"]]],
  ["نال","naal","NAAL","with","u2","Connectors",1,[["دُدھ نال چاء","Tea with milk"]]],
  ["بغیر","baghair","ba-GHAIR","without","u2","Connectors",2,[["کھنڈ توں بغیر","Without sugar"]]],
  ["سارے","saare","SAA-re","all, everyone","u2","Connectors",1,[["سارے ٹھیک نیں","Everyone is fine"]]],
  ["کھبے","khabbe","KHAB-be","left","u6","Travel",1,[["کھبے مُڑو","Turn left"]]],
  ["سجے","sajje","SAJ-je","right","u6","Travel",1,[["سجے پاسے","On the right"]]],
  ["نام","naam","NAAM","name","u2","About You",1,[["تہاڈا نام کی اے؟","What is your name?"]]],
  ["خوش","khush","KHUSH","happy","u2","Common",1,[["میں بہت خوش آں","I'm very happy"]]],
  ["تھکیا","thakya","THAK-ya","tired","u2","Common",2,[["میں تھکیا ہویا آں","I'm tired"]]],
  ["بیمار","beemar","bee-MAAR","sick, ill","u2","Common",1,[["میں بیمار آں","I am sick"]]],
  ["ڈاکٹر","doctor","DAAK-tar","doctor","u6","Common",1,[["مینوں ڈاکٹر چاہیدا","I need a doctor"]]],
];

merge("ur", ur);
merge("hi", hi);
merge("pa", pa);
