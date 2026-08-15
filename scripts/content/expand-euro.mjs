#!/usr/bin/env node
// =============================================================================
// expand-euro.mjs — Spanish, French, German and Turkish core vocabulary.
//
// Same target as the Indic pass: the concepts a beginner cannot hold a real
// conversation without, measured against what each pack was actually missing —
// to be able to, to need, money, how, man, woman, price, near, far, doctor,
// bathroom, with, without.
//
// Latin-script packs store the lemma as its own transliteration and carry the
// say-it-like guide separately, so `translitIsLemma` is set and the third column
// is the pronunciation hint.
// =============================================================================

import { merge } from "./merge.mjs";

// [lemma, _, pronunciation, translation, unit, category, difficulty, examples]
const es = [
  ["lo siento","","lo see-EN-to","sorry","u1","Greetings",1,[["Lo siento, llego tarde","Sorry, I'm late"]]],
  ["malo","","MA-lo","bad","u9","Common",1,[["El tiempo está malo","The weather is bad"]]],
  ["venir","","be-NEER","to come","u6","Verbs",1,[["¿Vienes conmigo?","Are you coming with me?"]]],
  ["saber","","sa-BER","to know","u6","Verbs",2,[["No lo sé","I don't know"]]],
  ["poder","","po-DER","to be able to, can","u6","Verbs",2,[["¿Puedes ayudarme?","Can you help me?"]]],
  ["dinero","","dee-NE-ro","money","u10","Common",1,[["No tengo dinero","I don't have money"]]],
  ["tiempo","","tee-EM-po","time, weather","u8","Time",1,[["No tengo tiempo","I don't have time"]]],
  ["ayer","","a-YER","yesterday","u8","Time",1,[["Ayer hizo frío","Yesterday was cold"]]],
  ["cómo","","KO-mo","how","u9","Connectors",1,[["¿Cómo funciona?","How does it work?"]]],
  ["hombre","","OM-bre","man","u2","People",1,[["Ese hombre es mi hermano","That man is my brother"]]],
  ["mujer","","mu-HER","woman","u2","People",1,[["Esa mujer es médica","That woman is a doctor"]]],
  ["precio","","PRE-thyo","price","u10","Common",2,[["¿Cuál es el precio?","What's the price?"]]],
  ["abrir","","a-BREER","to open","u6","Verbs",2,[["Abre la puerta","Open the door"]]],
  ["muy","","MOO-ee","very","u9","Connectors",1,[["Muy bien, gracias","Very well, thanks"]]],
  ["con","","KON","with","u9","Connectors",1,[["Café con leche","Coffee with milk"]]],
  ["sin","","SEEN","without","u9","Connectors",1,[["Sin azúcar","Without sugar"]]],
  ["todo","","TO-do","all, everything","u9","Connectors",1,[["Todo está bien","Everything is fine"]]],
  ["izquierda","","ees-kee-ER-da","left","u13","Travel",1,[["Gira a la izquierda","Turn left"]]],
  ["derecha","","de-RE-cha","right","u13","Travel",1,[["La segunda a la derecha","The second on the right"]]],
  ["cerca","","THER-ka","near","u13","Travel",1,[["Está cerca de aquí","It's near here"]]],
  ["lejos","","LE-hos","far","u13","Travel",1,[["Está muy lejos","It's very far"]]],
  ["nombre","","NOM-bre","name","u2","About You",1,[["¿Cuál es tu nombre?","What's your name?"]]],
  ["enfermo","","en-FER-mo","sick, ill","u11","Body",1,[["Estoy enfermo","I'm ill"]]],
  ["médico","","ME-dee-ko","doctor","u11","Body",1,[["Necesito un médico","I need a doctor"]]],
  ["baño","","BA-nyo","bathroom","u7","Places",1,[["¿Dónde está el baño?","Where is the bathroom?"]]],
  ["necesitar","","ne-the-see-TAR","to need","u6","Verbs",2,[["Necesito ayuda","I need help"]]],
  ["carretera","","ka-rre-TE-ra","road","u13","Travel",2,[["La carretera está cerrada","The road is closed"]]],
];

const fr = [
  ["désolé","","de-zo-LAY","sorry","u1","Greetings",1,[["Désolé, je suis en retard","Sorry, I'm late"]]],
  ["mauvais","","mo-VAY","bad","u9","Common",1,[["Le temps est mauvais","The weather is bad"]]],
  ["nourriture","","noo-ree-TUUR","food","u5","Food",2,[["La nourriture est bonne","The food is good"]]],
  ["venir","","vuh-NEER","to come","u6","Verbs",1,[["Tu viens avec moi ?","Are you coming with me?"]]],
  ["vouloir","","voo-LWAR","to want","u6","Verbs",2,[["Je voudrais un café","I would like a coffee"]]],
  ["savoir","","sa-VWAR","to know","u6","Verbs",2,[["Je ne sais pas","I don't know"]]],
  ["pouvoir","","poo-VWAR","to be able to, can","u6","Verbs",2,[["Pouvez-vous m'aider ?","Can you help me?"]]],
  ["besoin","","buh-ZWAN","need","u6","Common",2,[["J'ai besoin d'aide","I need help"]]],
  ["argent","","ar-ZHAHN","money","u10","Common",1,[["Je n'ai pas d'argent","I don't have money"]]],
  ["temps","","TAHN","time, weather","u8","Time",1,[["Je n'ai pas le temps","I don't have time"]]],
  ["hier","","ee-YAIR","yesterday","u8","Time",1,[["Hier il faisait froid","Yesterday was cold"]]],
  ["comment","","ko-MAHN","how","u9","Connectors",1,[["Comment ça marche ?","How does it work?"]]],
  ["homme","","OM","man","u2","People",1,[["Cet homme est mon frère","That man is my brother"]]],
  ["femme","","FAM","woman","u2","People",1,[["Cette femme est médecin","That woman is a doctor"]]],
  ["prix","","PREE","price","u10","Common",2,[["Quel est le prix ?","What's the price?"]]],
  ["ouvrir","","oo-VREER","to open","u6","Verbs",2,[["Ouvre la porte","Open the door"]]],
  ["très","","TRAY","very","u9","Connectors",1,[["Très bien, merci","Very well, thanks"]]],
  ["avec","","a-VEK","with","u9","Connectors",1,[["Café avec du lait","Coffee with milk"]]],
  ["sans","","SAHN","without","u9","Connectors",1,[["Sans sucre","Without sugar"]]],
  ["tout","","TOO","all, everything","u9","Connectors",1,[["Tout va bien","Everything is fine"]]],
  ["gauche","","GOHSH","left","u13","Travel",1,[["Tournez à gauche","Turn left"]]],
  ["droite","","DRWAT","right","u13","Travel",1,[["La deuxième à droite","The second on the right"]]],
  ["près","","PRAY","near","u13","Travel",1,[["C'est près d'ici","It's near here"]]],
  ["loin","","LWAN","far","u13","Travel",1,[["C'est très loin","It's very far"]]],
  ["nom","","NOHN","name","u2","About You",1,[["Quel est votre nom ?","What's your name?"]]],
  ["malade","","ma-LAD","sick, ill","u11","Body",1,[["Je suis malade","I'm ill"]]],
  ["médecin","","med-SAN","doctor","u11","Body",2,[["J'ai besoin d'un médecin","I need a doctor"]]],
  ["toilettes","","twa-LET","bathroom, toilets","u7","Places",1,[["Où sont les toilettes ?","Where are the toilets?"]]],
  ["route","","ROOT","road","u13","Travel",1,[["La route est fermée","The road is closed"]]],
];

const de = [
  ["gross","","GROHSS","big","u12","Common",1,[["Ein grosses Haus","A big house"]]],
  ["klein","","KLINE","small","u12","Common",1,[["Ein kleines Zimmer","A small room"]]],
  ["Essen","","ES-en","food","u5","Food",1,[["Das Essen ist gut","The food is good"]]],
  ["wollen","","VOL-en","to want","u6","Verbs",2,[["Ich will nach Hause","I want to go home"]]],
  ["wissen","","VIS-en","to know (a fact)","u6","Verbs",2,[["Ich weiss es nicht","I don't know"]]],
  ["sagen","","ZAH-gen","to say","u6","Verbs",1,[["Was hast du gesagt?","What did you say?"]]],
  ["können","","KERN-en","to be able to, can","u6","Verbs",2,[["Kannst du mir helfen?","Can you help me?"]]],
  ["brauchen","","BROW-khen","to need","u6","Verbs",2,[["Ich brauche Hilfe","I need help"]]],
  ["geben","","GAY-ben","to give","u6","Verbs",2,[["Gib mir bitte das Salz","Give me the salt please"]]],
  ["nehmen","","NAY-men","to take","u6","Verbs",2,[["Ich nehme den Zug","I'll take the train"]]],
  ["Zeit","","TSITE","time","u8","Time",1,[["Ich habe keine Zeit","I don't have time"]]],
  ["Tag","","TAHK","day","u8","Time",1,[["Einen schönen Tag!","Have a nice day!"]]],
  ["was","","VAS","what","u9","Connectors",1,[["Was ist das?","What is that?"]]],
  ["wo","","VO","where","u9","Connectors",1,[["Wo bist du?","Where are you?"]]],
  ["warum","","va-ROOM","why","u9","Connectors",1,[["Warum nicht?","Why not?"]]],
  ["wie","","VEE","how","u9","Connectors",1,[["Wie funktioniert das?","How does that work?"]]],
  ["wer","","VAIR","who","u9","Connectors",1,[["Wer ist das?","Who is that?"]]],
  ["Auto","","OW-to","car","u10","Travel",1,[["Das Auto ist kaputt","The car is broken"]]],
  ["Preis","","PRICE","price","u13","Common",2,[["Wie hoch ist der Preis?","What's the price?"]]],
  ["öffnen","","ERF-nen","to open","u6","Verbs",2,[["Öffne bitte das Fenster","Open the window please"]]],
  ["mehr","","MAIR","more","u9","Connectors",1,[["Ein bisschen mehr","A little more"]]],
  ["alles","","AL-es","all, everything","u9","Connectors",1,[["Alles ist gut","Everything is fine"]]],
  ["nah","","NAH","near","u7","Places",1,[["Der Bahnhof ist nah","The station is near"]]],
  ["weit","","VITE","far","u7","Places",1,[["Ist es weit?","Is it far?"]]],
  ["Toilette","","twa-LET-uh","bathroom, toilet","u7","Places",1,[["Wo ist die Toilette?","Where is the toilet?"]]],
  ["Straße","","SHTRAH-suh","road","u10","Travel",1,[["Die Straße ist gesperrt","The road is closed"]]],
];

const tr = [
  ["ben","","BEN","I","u2","People",1,[["Ben hazırım","I'm ready"]]],
  ["sen","","SEN","you (informal)","u2","People",1,[["Sen nerelisin?","Where are you from?"]]],
  ["özür dilerim","","er-ZUER dee-LEH-rim","sorry","u2","Greetings",1,[["Özür dilerim, geç kaldım","Sorry, I'm late"]]],
  ["yemek","","yeh-MEK","food, to eat","u5","Food",1,[["Yemek çok güzel","The food is very good"]]],
  ["bilmek","","BEEL-mek","to know","u6","Verbs",2,[["Bilmiyorum","I don't know"]]],
  ["söylemek","","SER-yle-mek","to say","u6","Verbs",2,[["Ne söyledin?","What did you say?"]]],
  ["yapmak","","YAP-mak","to do, to make","u6","Verbs",1,[["Ne yapıyorsun?","What are you doing?"]]],
  ["vermek","","VER-mek","to give","u6","Verbs",2,[["Bana ver","Give it to me"]]],
  ["almak","","AL-mak","to take, to buy","u6","Verbs",2,[["Bir bilet aldım","I bought a ticket"]]],
  ["yardım","","YAR-duhm","help","u10","Common",1,[["Yardım eder misiniz?","Could you help?"]]],
  ["anlamak","","AN-la-mak","to understand","u6","Verbs",2,[["Anlamıyorum","I don't understand"]]],
  ["zaman","","za-MAN","time","u9","Time",1,[["Zamanım yok","I don't have time"]]],
  ["burada","","BOO-ra-da","here","u10","Common",1,[["Ben buradayım","I'm here"]]],
  ["orada","","O-ra-da","there","u10","Common",1,[["Eczane orada","The pharmacy is there"]]],
  ["ne","","NEH","what","u10","Common",1,[["Bu ne?","What is this?"]]],
  ["nerede","","NEH-reh-deh","where","u10","Common",1,[["Tuvalet nerede?","Where is the toilet?"]]],
  ["ne zaman","","neh za-MAN","when","u9","Time",1,[["Ne zaman geliyorsun?","When are you coming?"]]],
  ["neden","","NEH-den","why","u10","Common",1,[["Neden olmasın?","Why not?"]]],
  ["nasıl","","NA-suhl","how","u10","Common",1,[["Nasıl çalışıyor?","How does it work?"]]],
  ["kim","","KEEM","who","u10","Common",1,[["Bu kim?","Who is this?"]]],
  ["adam","","a-DAM","man","u4","People",1,[["O adam kardeşim","That man is my brother"]]],
  ["kadın","","ka-DUHN","woman","u4","People",1,[["O kadın doktor","That woman is a doctor"]]],
  ["ev","","EV","house, home","u7","Places",1,[["Evdeyim","I'm at home"]]],
  ["iş","","EESH","work, job","u2","Common",1,[["İşim bitti","My work is done"]]],
  ["fiyat","","fee-YAT","price","u10","Common",2,[["Fiyatı ne kadar?","What's the price?"]]],
  ["açmak","","ACH-mak","to open","u6","Verbs",2,[["Kapıyı aç","Open the door"]]],
  ["çok","","CHOK","very, a lot","u8","Common",1,[["Çok iyi","Very good"]]],
  ["ile","","ee-LEH","with","u10","Connectors",1,[["Sütlü kahve","Coffee with milk"]]],
  ["sol","","SOL","left","u10","Travel",1,[["Soldan dönün","Turn left"]]],
  ["sağ","","SAA","right","u10","Travel",1,[["Sağ tarafta","On the right side"]]],
  ["isim","","ee-SEEM","name","u2","About You",1,[["İsminiz ne?","What's your name?"]]],
  ["hasta","","HAS-ta","sick, ill","u11","Body",1,[["Hastayım","I'm ill"]]],
  ["doktor","","DOK-tor","doctor","u11","Body",1,[["Doktora ihtiyacım var","I need a doctor"]]],
  ["tuvalet","","too-va-LET","bathroom, toilet","u7","Places",1,[["Tuvalet nerede?","Where is the toilet?"]]],
];

const opts = { translitIsLemma: true };
merge("es", es, opts);
merge("fr", fr, opts);
merge("de", de, opts);
merge("tr", tr, opts);
