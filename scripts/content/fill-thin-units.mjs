#!/usr/bin/env node
// =============================================================================
// fill-thin-units.mjs — top up the units that were too small to teach from.
//
// A unit with three or four words produces the same handful of questions every
// time you open it, and the learner reasonably concludes there's nothing there.
// The validator warns at eight; this brings every unit above that line.
//
// Family, Weather and Numbers were the consistent offenders — the units authored
// first and never revisited.
// =============================================================================

import { merge } from "./merge.mjs";

merge("hi", [
  ["माँ","maa","MAA","mother","u3","Family",1,[["मेरी माँ खाना बनाती है","My mother cooks"]]],
  ["पिता","pita","PI-ta","father","u3","Family",1,[["मेरे पिता काम करते हैं","My father works"]]],
  ["बहन","behen","BE-hen","sister","u3","Family",1,[["मेरी बहन डॉक्टर है","My sister is a doctor"]]],
  ["बेटा","beta","BE-ta","son","u3","Family",1,[["उसका बेटा सात साल का है","His son is seven"]]],
  ["बेटी","beti","BE-tee","daughter","u3","Family",1,[["मेरी बेटी हिंदी सीखती है","My daughter learns Hindi"]]],
  ["पति","pati","PA-ti","husband","u3","Family",2,[["उसका पति इंजीनियर है","Her husband is an engineer"]]],
  ["पत्नी","patni","PAT-nee","wife","u3","Family",2,[["उसकी पत्नी शिक्षिका है","His wife is a teacher"]]],
  ["दूध","doodh","DOODH","milk","u5","Food",1,[["दूध वाली चाय","Tea with milk"]]],
  ["चावल","chawal","CHA-wal","rice","u5","Food",1,[["चावल और दाल","Rice and lentils"]]],
  ["सब्ज़ी","sabzi","SAB-zee","vegetable","u5","Food",1,[["ताज़ी सब्ज़ी","Fresh vegetables"]]],
  ["मीठा","meetha","MEE-tha","sweet","u5","Food",1,[["यह बहुत मीठा है","This is very sweet"]]],
  ["गुस्सा","gussa","GUS-sa","anger, angry","u9","Feelings",2,[["वह गुस्सा है","He is angry"]]],
  ["डर","dar","DAR","fear","u9","Feelings",2,[["मुझे डर लगता है","I'm afraid"]]],
  ["प्यार","pyaar","PYAAR","love","u9","Feelings",1,[["मुझे यह पसंद है","I love this"]]],
]);

merge("ur", [
  ["ہوا","hawa","ha-WA","wind, air","u12","Weather",1,[["ہوا تیز ہے","The wind is strong"]]],
  ["برف","baraf","BA-raf","snow, ice","u12","Weather",1,[["پہاڑوں پر برف ہے","There's snow on the mountains"]]],
  ["بادل","baadal","BAA-dal","cloud","u12","Weather",2,[["آسمان پر بادل ہیں","There are clouds in the sky"]]],
  ["درخت","darakht","da-RAKHT","tree","u12","Weather",1,[["ایک پرانا درخت","An old tree"]]],
  ["پہاڑ","pahaad","pa-HAAR","mountain","u12","Weather",2,[["ہم پہاڑ جا رہے ہیں","We're going to the mountains"]]],
  ["دریا","darya","DAR-ya","river","u12","Weather",2,[["دریا کے پاس","Near the river"]]],
]);

merge("bn", [
  ["মা","ma","MA","mother","u3","Family",1,[["আমার মা রান্না করেন","My mother cooks"]]],
  ["বাবা","baba","BA-ba","father","u3","Family",1,[["আমার বাবা কাজ করেন","My father works"]]],
  ["ছেলে","chhele","CHHE-le","son, boy","u3","Family",1,[["তার ছেলে সাত বছরের","His son is seven"]]],
  ["মেয়ে","meye","ME-ye","daughter, girl","u3","Family",1,[["আমার মেয়ে স্কুলে যায়","My daughter goes to school"]]],
  ["স্বামী","shami","SHA-mee","husband","u3","Family",2,[["তার স্বামী ইঞ্জিনিয়ার","Her husband is an engineer"]]],
  ["স্ত্রী","stri","STREE","wife","u3","Family",2,[["তার স্ত্রী শিক্ষিকা","His wife is a teacher"]]],
]);

const latin = { translitIsLemma: true };
merge("es", [
  ["esposo","","es-PO-so","husband","u3","Family",2,[["Su esposo es ingeniero","Her husband is an engineer"]]],
  ["esposa","","es-PO-sa","wife","u3","Family",2,[["Su esposa es maestra","His wife is a teacher"]]],
  ["abuelo","","a-BWE-lo","grandfather","u3","Family",1,[["Mi abuelo es de Sevilla","My grandfather is from Seville"]]],
  ["abuela","","a-BWE-la","grandmother","u3","Family",1,[["Mi abuela cocina bien","My grandmother cooks well"]]],
  ["viento","","bee-EN-to","wind","u12","Weather",1,[["Hace mucho viento","It's very windy"]]],
  ["nube","","NOO-be","cloud","u12","Weather",1,[["No hay nubes hoy","There are no clouds today"]]],
  ["nieve","","nee-E-be","snow","u12","Weather",1,[["Hay nieve en la montaña","There's snow on the mountain"]]],
  ["montaña","","mon-TA-nya","mountain","u12","Weather",1,[["Vamos a la montaña","We're going to the mountain"]]],
  ["río","","REE-o","river","u12","Weather",1,[["El río está tranquilo","The river is calm"]]],
], latin);

merge("fr", [
  ["mari","","ma-REE","husband","u3","Family",2,[["Son mari est ingénieur","Her husband is an engineer"]]],
  ["épouse","","ay-POOZ","wife","u3","Family",2,[["Son épouse est professeure","His wife is a teacher"]]],
  ["grand-père","","grahn-PAIR","grandfather","u3","Family",1,[["Mon grand-père est de Lyon","My grandfather is from Lyon"]]],
  ["grand-mère","","grahn-MAIR","grandmother","u3","Family",1,[["Ma grand-mère cuisine bien","My grandmother cooks well"]]],
  ["vent","","VAHN","wind","u12","Weather",1,[["Il y a du vent","It's windy"]]],
  ["nuage","","noo-AZH","cloud","u12","Weather",1,[["Il n'y a pas de nuages","There are no clouds"]]],
  ["neige","","NEZH","snow","u12","Weather",1,[["Il y a de la neige","There's snow"]]],
  ["montagne","","mon-TA-nyuh","mountain","u12","Weather",1,[["On va à la montagne","We're going to the mountains"]]],
  ["rivière","","ree-vee-AIR","river","u12","Weather",1,[["La rivière est calme","The river is calm"]]],
], latin);

merge("zh", [
  ["爸爸","bàba","bah-bah","father, dad","u3","Family",1,[["我爸爸工作很忙","My dad's work is busy"]]],
  ["妈妈","māma","mah-mah","mother, mum","u3","Family",1,[["我妈妈做饭很好","My mum cooks well"]]],
  ["儿子","érzi","er-dz","son","u3","Family",1,[["他儿子七岁","His son is seven"]]],
  ["女儿","nǚ'ér","nyu-er","daughter","u3","Family",1,[["我女儿在上学","My daughter is at school"]]],
  ["八","bā","bah","eight","u4","Numbers",1,[["八个人","Eight people"]]],
  ["九","jiǔ","jyo","nine","u4","Numbers",1,[["九点","Nine o'clock"]]],
  ["百","bǎi","bye","hundred","u4","Numbers",2,[["一百块","A hundred yuan"]]],
  ["风","fēng","fung","wind","u12","Weather",1,[["风很大","The wind is strong"]]],
  ["雪","xuě","shweh","snow","u12","Weather",1,[["下雪了","It's snowing"]]],
  ["山","shān","shan","mountain","u12","Weather",1,[["我们去爬山","We're going to climb the mountain"]]],
]);

merge("ko", [
  ["아버지","abeoji","ah-baw-jee","father","u3","Family",1,[["아버지는 일해요","My father works"]]],
  ["어머니","eomeoni","aw-maw-nee","mother","u3","Family",1,[["어머니는 요리를 잘해요","My mother cooks well"]]],
  ["아들","adeul","ah-deul","son","u3","Family",1,[["그의 아들은 일곱 살이에요","His son is seven"]]],
  ["딸","ttal","ttal","daughter","u3","Family",1,[["제 딸은 학교에 가요","My daughter goes to school"]]],
  ["여덟","yeodeol","yaw-dawl","eight","u4","Numbers",1,[["여덟 명","Eight people"]]],
  ["아홉","ahop","ah-hop","nine","u4","Numbers",1,[["아홉 시","Nine o'clock"]]],
  ["백","baek","bek","hundred","u4","Numbers",2,[["백 원","A hundred won"]]],
  ["바람","baram","bah-ram","wind","u12","Weather",1,[["바람이 강해요","The wind is strong"]]],
  ["눈","nun","noon","snow, eye","u12","Weather",1,[["눈이 와요","It's snowing"]]],
  ["산","san","san","mountain","u12","Weather",1,[["산에 가요","We're going to the mountain"]]],
]);

merge("ja", [
  ["父","chichi","chee-chee","father","u3","Family",1,[["父は毎日働きます","My father works every day"]]],
  ["母","haha","hah-hah","mother","u3","Family",1,[["母は料理が上手です","My mother cooks well"]]],
  ["息子","musuko","moo-soo-ko","son","u3","Family",2,[["息子は七歳です","My son is seven"]]],
  ["娘","musume","moo-soo-meh","daughter","u3","Family",2,[["娘は学校に行きます","My daughter goes to school"]]],
  ["友達","tomodachi","toh-mo-dah-chee","friend","u3","People",1,[["彼は友達です","He is my friend"]]],
  ["八","hachi","hah-chee","eight","u4","Numbers",1,[["八人です","Eight people"]]],
  ["九","kyuu","kyoo","nine","u4","Numbers",1,[["九時です","It's nine o'clock"]]],
  ["十","juu","joo","ten","u4","Numbers",1,[["十分","Ten minutes"]]],
  ["百","hyaku","hyah-koo","hundred","u4","Numbers",2,[["百円","A hundred yen"]]],
  ["駅","eki","eh-kee","station","u11","Travel",1,[["駅はどこですか","Where is the station?"]]],
  ["近い","chikai","chee-kah-ee","near","u11","Travel",1,[["駅は近いです","The station is near"]]],
  ["兄","ani","ah-nee","older brother","u3","Family",2,[["兄は東京にいます","My older brother is in Tokyo"]]],
  ["姉","ane","ah-neh","older sister","u3","Family",2,[["姉は医者です","My older sister is a doctor"]]],
  ["七","nana","nah-nah","seven","u4","Numbers",1,[["七時に会いましょう","Let's meet at seven"]]],
]);

merge("hi", [
  ["चाचा","chacha","CHA-cha","uncle","u3","Family",2,[["मेरे चाचा दिल्ली में रहते हैं","My uncle lives in Delhi"]]],
  ["दादी","daadi","DAA-dee","grandmother","u3","Family",1,[["दादी कहानियाँ सुनाती हैं","Grandma tells stories"]]],
  ["दादा","daada","DAA-da","grandfather","u3","Family",1,[["दादा जी बगीचे में हैं","Grandpa is in the garden"]]],
]);
