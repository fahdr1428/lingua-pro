// =============================================================================
// PASSAGES — short connected texts for the "Read & Understand" exercise.
// This is comprehensible input: real connected language, not isolated words.
//
// Each passage uses ONLY beginner vocabulary. Every passage has:
//   - lines: [{ native, translit, translation }]   (subtitle data — works
//     even if audio is silent on the user's device)
//   - question: a comprehension question in English
//   - options: 4 answer choices
//   - answer: the correct option
//
// Languages without passages simply don't show this exercise type — graceful.
// =============================================================================

export const PASSAGES = {
  es: [
    {
      id: "es_p1",
      title: "At the café",
      lines: [
        { native: "Hola, buenos días.", translit: "hola, buenos dias", translation: "Hello, good morning." },
        { native: "Un café, por favor.", translit: "un cafe, por favor", translation: "A coffee, please." },
        { native: "Gracias. Adiós.", translit: "gracias. adios", translation: "Thank you. Goodbye." },
      ],
      question: "What does the person order?",
      options: ["A coffee", "A water", "A tea", "Bread"],
      answer: "A coffee",
    },
    {
      id: "es_p2",
      title: "Meeting someone",
      lines: [
        { native: "Hola, ¿cómo estás?", translit: "hola, como estas", translation: "Hello, how are you?" },
        { native: "Estoy bien, gracias.", translit: "estoy bien, gracias", translation: "I am well, thank you." },
        { native: "Yo soy estudiante.", translit: "yo soy estudiante", translation: "I am a student." },
      ],
      question: "What is the second person?",
      options: ["A student", "A teacher", "A doctor", "A friend"],
      answer: "A student",
    },
    {
      id: "es_p3",
      title: "Going home",
      lines: [
        { native: "Tengo hambre.", translit: "tengo hambre", translation: "I am hungry." },
        { native: "Voy a casa.", translit: "voy a casa", translation: "I am going home." },
        { native: "En casa hay comida.", translit: "en casa hay comida", translation: "At home there is food." },
      ],
      question: "Why is the person going home?",
      options: ["They are hungry", "They are tired", "It is late", "They are sad"],
      answer: "They are hungry",
    },
  ],

  fr: [
    {
      id: "fr_p1",
      title: "At the bakery",
      lines: [
        { native: "Bonjour madame.", translit: "bonjour madam", translation: "Hello madam." },
        { native: "Du pain, s'il vous plaît.", translit: "du pan, sil voo play", translation: "Some bread, please." },
        { native: "Merci. Au revoir.", translit: "mehrsee. oh ruhvwar", translation: "Thank you. Goodbye." },
      ],
      question: "What does the person buy?",
      options: ["Bread", "Coffee", "Water", "Milk"],
      answer: "Bread",
    },
    {
      id: "fr_p2",
      title: "How are you?",
      lines: [
        { native: "Salut, ça va?", translit: "saloo, sa va", translation: "Hi, how's it going?" },
        { native: "Ça va bien, merci.", translit: "sa va byan, mehrsee", translation: "It's going well, thanks." },
        { native: "Je suis fatigué.", translit: "zhuh swee fateege", translation: "I am tired." },
      ],
      question: "How does the second person feel?",
      options: ["Tired", "Hungry", "Happy", "Sad"],
      answer: "Tired",
    },
  ],

  ur: [
    {
      id: "ur_p1",
      title: "Meeting a friend",
      lines: [
        { native: "السلام علیکم", translit: "assalam-o-alaikum", translation: "Peace be upon you (hello)." },
        { native: "آپ کیسے ہیں؟", translit: "aap kaise hain?", translation: "How are you?" },
        { native: "میں ٹھیک ہوں، شکریہ", translit: "main theek hoon, shukriya", translation: "I am fine, thank you." },
      ],
      question: "How does the person respond?",
      options: ["They are fine", "They are tired", "They are sad", "They are busy"],
      answer: "They are fine",
    },
    {
      id: "ur_p2",
      title: "Asking for water",
      lines: [
        { native: "مجھے بھوک ہے", translit: "mujhe bhook hai", translation: "I am hungry." },
        { native: "پانی چاہیے", translit: "paani chahiye", translation: "I need water." },
        { native: "شکریہ", translit: "shukriya", translation: "Thank you." },
      ],
      question: "What does the person need?",
      options: ["Water", "Food", "Tea", "Help"],
      answer: "Water",
    },
    {
      id: "ur_p3",
      title: "At the market",
      lines: [
        { native: "سلام! چاول کی قیمت کیا ہے؟", translit: "salaam! chawal ki qeemat kya hai?", translation: "Hello! What is the price of rice?" },
        { native: "زیادہ نہیں۔ آپ کو کتنا چاہیے؟", translit: "ziyada nahin. aap ko kitna chahiye?", translation: "Not much. How much do you want?" },
        { native: "دو۔ اور ایک روٹی بھی۔", translit: "do. aur ek roti bhi.", translation: "Two kilos. And one bread as well." },
        { native: "ٹھیک ہے۔ شکریہ!", translit: "theek hai. shukriya!", translation: "Fine. Thank you!" },
      ],
      question: "What does the person buy?",
      options: ["Rice and bread", "Tea and milk", "Fruit and meat", "Only rice"],
      answer: "Rice and bread",
    },
    {
      id: "ur_p4",
      title: "A tired evening",
      lines: [
        { native: "آج میں بہت تھکا ہوں۔", translit: "aaj main bohot thaka hoon.", translation: "Today I am very tired." },
        { native: "مجھے پانی چاہیے۔", translit: "mujhe pani chahiye.", translation: "I want water." },
        { native: "کھانا تیار ہے۔ آپ کھائیں گے؟", translit: "khana tayyar hai. aap khayenge?", translation: "The food is ready. Will you eat?" },
        { native: "ہاں، شکریہ۔ میں بھوکا ہوں۔", translit: "haan, shukriya. main bhooka hoon.", translation: "Yes, thank you. I am hungry." },
      ],
      question: "How does the person feel?",
      options: ["Tired and hungry", "Happy and rested", "Sick", "Cold"],
      answer: "Tired and hungry",
    },
  ],

  hi: [
    {
      id: "hi_p1",
      title: "Saying hello",
      lines: [
        { native: "नमस्ते", translit: "namaste", translation: "Hello." },
        { native: "आप कैसे हैं?", translit: "aap kaise hain?", translation: "How are you?" },
        { native: "मैं अच्छा हूँ", translit: "main accha hoon", translation: "I am good." },
      ],
      question: "How does the person feel?",
      options: ["Good", "Tired", "Hungry", "Sad"],
      answer: "Good",
    },
    {
      id: "hi_p2",
      title: "At the tea stall",
      lines: [
        { native: "नमस्ते! एक चाय, कृपया।", translit: "namaste! ek chai, kripya.", translation: "Hello! One tea, please." },
        { native: "दूध के साथ?", translit: "doodh ke saath?", translation: "With milk?" },
        { native: "हाँ, और थोड़ा रोटी भी।", translit: "haan, aur thoda roti bhi.", translation: "Yes, and a little bread too." },
        { native: "ठीक है। धन्यवाद!", translit: "theek hai. dhanyavaad!", translation: "Fine. Thank you!" },
      ],
      question: "What does the person order?",
      options: ["Tea with milk and bread", "Only tea", "Water and rice", "Coffee"],
      answer: "Tea with milk and bread",
    },
    {
      id: "hi_p3",
      title: "Where is the station?",
      lines: [
        { native: "माफ़ कीजिए, स्टेशन कहाँ है?", translit: "maaf kijiye, station kahan hai?", translation: "Excuse me, where is the station?" },
        { native: "सीधे जाओ, फिर दायाँ।", translit: "seedhe jao, phir dayan.", translation: "Go straight, then right." },
        { native: "दूर है?", translit: "door hai?", translation: "Is it far?" },
        { native: "नहीं, पास है।", translit: "nahin, paas hai.", translation: "No, it is near." },
        { native: "धन्यवाद!", translit: "dhanyavaad!", translation: "Thank you!" },
      ],
      question: "Which way is the station?",
      options: ["Straight, then right", "Straight, then left", "Far to the left", "Behind the hotel"],
      answer: "Straight, then right",
    },
    {
      id: "hi_p4",
      title: "My family",
      lines: [
        { native: "मेरा नाम सारा है।", translit: "mera naam Sara hai.", translation: "My name is Sara." },
        { native: "मेरी माँ डॉक्टर है।", translit: "meri maa doctor hai.", translation: "My mother is a doctor." },
        { native: "मेरा भाई स्कूल जाता है।", translit: "mera bhai school jata hai.", translation: "My brother goes to school." },
        { native: "हम सब खुश हैं।", translit: "hum sab khush hain.", translation: "We are all happy." },
      ],
      question: "What does the mother do?",
      options: ["She is a doctor", "She is a teacher", "She goes to school", "She works at home"],
      answer: "She is a doctor",
    },
  ],

  bn: [
    {
      id: "bn_p1",
      title: "Greeting someone",
      lines: [
        { native: "নমস্কার", translit: "nomoshkar", translation: "Hello." },
        { native: "আপনি কেমন আছেন?", translit: "apni kemon achhen?", translation: "How are you?" },
        { native: "আমি ভালো আছি", translit: "ami bhalo achhi", translation: "I am well." },
      ],
      question: "How does the person respond?",
      options: ["They are well", "They are tired", "They are hungry", "They are sad"],
      answer: "They are well",
    },
  ],

  ar: [
    {
      id: "ar_p1",
      title: "A short greeting",
      lines: [
        { native: "السلام عليكم", translit: "as-salamu alaykum", translation: "Peace be upon you (hello)." },
        { native: "كيف حالك؟", translit: "kayfa haluk?", translation: "How are you?" },
        { native: "أنا بخير، شكراً", translit: "ana bikhayr, shukran", translation: "I am fine, thank you." },
      ],
      question: "How is the person?",
      options: ["Fine", "Tired", "Sad", "Busy"],
      answer: "Fine",
    },
    {
      id: "ar_p2",
      title: "At the restaurant",
      lines: [
        { native: "مساء الخير! ماذا تريد؟", translit: "masa' al-khayr! madha tureed?", translation: "Good evening! What would you like?" },
        { native: "أريد أرز و لحم، من فضلك.", translit: "ureed aruzz wa lahm, min fadlik.", translation: "I want rice and meat, please." },
        { native: "الأكل هنا لذيذ جدا.", translit: "al-akl huna ladhidh jiddan.", translation: "The food here is very delicious." },
        { native: "الحساب من فضلك. شكرا!", translit: "al-hisab min fadlik. shukran!", translation: "The bill, please. Thank you!" },
      ],
      question: "What does the person order?",
      options: ["Rice and meat", "Bread and cheese", "Coffee", "Fruit"],
      answer: "Rice and meat",
    },
    {
      id: "ar_p3",
      title: "Where is the hotel?",
      lines: [
        { native: "من فضلك، أين الفندق؟", translit: "min fadlik, ayna al-funduq?", translation: "Please, where is the hotel?" },
        { native: "مباشرة، ثم يمين.", translit: "mubashara, thumma yameen.", translation: "Straight ahead, then right." },
        { native: "هل هو بعيد؟", translit: "hal huwa baeed?", translation: "Is it far?" },
        { native: "لا، قريب جدا.", translit: "la, qareeb jiddan.", translation: "No, very near." },
        { native: "شكرا! مع السلامة.", translit: "shukran! maa salama.", translation: "Thank you! Goodbye." },
      ],
      question: "Where is the hotel?",
      options: ["Straight ahead, then right", "Straight ahead, then left", "Very far away", "Near the station"],
      answer: "Straight ahead, then right",
    },
    {
      id: "ar_p4",
      title: "My family",
      lines: [
        { native: "اسمي حسن.", translit: "ismi Hassan.", translation: "My name is Hassan." },
        { native: "عائلتي كبيرة.", translit: "a'ilati kabeera.", translation: "My family is big." },
        { native: "أمي طبيبة في المستشفى.", translit: "ummi tabiba fi al-mustashfa.", translation: "My mother is a doctor at the hospital." },
        { native: "أبي يعمل في السوق.", translit: "abi ya'mal fi as-suq.", translation: "My father works in the market." },
        { native: "أنا سعيد جدا.", translit: "ana saeed jiddan.", translation: "I am very happy." },
      ],
      question: "Where does the father work?",
      options: ["In the market", "At the hospital", "At school", "At a hotel"],
      answer: "In the market",
    },
  ],

  ko: [
    {
      id: "ko_p1",
      title: "First meeting",
      lines: [
        { native: "안녕하세요", translit: "annyeonghaseyo", translation: "Hello." },
        { native: "저는 학생이에요", translit: "jeoneun haksaeng-ieyo", translation: "I am a student." },
        { native: "감사합니다", translit: "gamsahamnida", translation: "Thank you." },
      ],
      question: "What is the person?",
      options: ["A student", "A teacher", "A doctor", "A friend"],
      answer: "A student",
    },
  ],

  ja: [
    {
      id: "ja_p1",
      title: "Good morning",
      lines: [
        { native: "おはようございます", translit: "ohayou gozaimasu", translation: "Good morning." },
        { native: "みずをください", translit: "mizu o kudasai", translation: "Water, please." },
        { native: "ありがとう", translit: "arigatou", translation: "Thank you." },
      ],
      question: "What does the person ask for?",
      options: ["Water", "Tea", "Food", "Help"],
      answer: "Water",
    },
  ],

  zh: [
    {
      id: "zh_p1",
      title: "A polite exchange",
      lines: [
        { native: "你好", translit: "nǐ hǎo", translation: "Hello." },
        { native: "我要水", translit: "wǒ yào shuǐ", translation: "I want water." },
        { native: "谢谢", translit: "xièxie", translation: "Thank you." },
      ],
      question: "What does the person want?",
      options: ["Water", "Tea", "Food", "A book"],
      answer: "Water",
    },
  ],

  de: [
    {
      id: "de_p1",
      title: "At the café",
      lines: [
        { native: "Guten Tag! Ein Kaffee, bitte.", translit: "", translation: "Good day! A coffee, please." },
        { native: "Möchten Sie auch Kuchen?", translit: "", translation: "Would you like cake as well?" },
        { native: "Ja, bitte. Der Kuchen hier ist sehr lecker.", translit: "", translation: "Yes, please. The cake here is very tasty." },
        { native: "Die Rechnung, bitte.", translit: "", translation: "The bill, please." },
        { native: "Danke. Auf Wiedersehen!", translit: "", translation: "Thank you. Goodbye!" },
      ],
      question: "What does the person order?",
      options: ["Coffee and cake", "Only a coffee", "Bread and cheese", "A beer"],
      answer: "Coffee and cake",
    },
    {
      id: "de_p2",
      title: "My family",
      lines: [
        { native: "Ich heiße Anna.", translit: "", translation: "My name is Anna." },
        { native: "Ich habe einen Bruder und eine Schwester.", translit: "", translation: "I have a brother and a sister." },
        { native: "Meine Mutter arbeitet im Krankenhaus.", translit: "", translation: "My mother works at the hospital." },
        { native: "Mein Vater kauft Brot und Käse.", translit: "", translation: "My father buys bread and cheese." },
        { native: "Das Frühstück ist sehr gut.", translit: "", translation: "Breakfast is very good." },
      ],
      question: "Where does the mother work?",
      options: ["At a hospital", "In a shop", "At the station", "At a hotel"],
      answer: "At a hospital",
    },
    {
      id: "de_p3",
      title: "Where is the station?",
      lines: [
        { native: "Entschuldigung, wo ist der Bahnhof?", translit: "", translation: "Excuse me, where is the train station?" },
        { native: "Gehen Sie geradeaus und dann links.", translit: "", translation: "Go straight ahead and then left." },
        { native: "Ist es weit?", translit: "", translation: "Is it far?" },
        { native: "Nein, es ist sehr nah.", translit: "", translation: "No, it is very near." },
        { native: "Danke! Tschüss.", translit: "", translation: "Thanks! Bye." },
      ],
      question: "Which way is the station?",
      options: ["Straight ahead, then left", "Straight ahead, then right", "To the right only", "Back the way they came"],
      answer: "Straight ahead, then left",
    },
    {
      id: "de_p4",
      title: "A tiring day",
      lines: [
        { native: "Ich bin sehr müde.", translit: "", translation: "I am very tired." },
        { native: "Ich möchte Wasser, bitte.", translit: "", translation: "I would like water, please." },
        { native: "Kannst du mir helfen?", translit: "", translation: "Can you help me?" },
        { native: "Ja, ich gehe zum Geschäft.", translit: "", translation: "Yes, I'll go to the shop." },
        { native: "Danke. Du bist ein guter Freund.", translit: "", translation: "Thank you. You are a good friend." },
      ],
      question: "What does the person ask for?",
      options: ["Water", "Coffee", "Bread", "The bill"],
      answer: "Water",
    },
  ],


  id: [
    {
      id: "id_p1",
      title: "At the coffee shop",
      lines: [
        { native: "Selamat pagi! Saya mau kopi dan roti.", translit: "", translation: "Good morning! I want coffee and bread." },
        { native: "Baik. Berapa?", translit: "", translation: "Fine. How many?" },
        { native: "Satu kopi, dua roti.", translit: "", translation: "One coffee, two breads." },
        { native: "Terima kasih. Sampai jumpa!", translit: "", translation: "Thank you. See you!" },
      ],
      question: "What does the person order?",
      options: ["Coffee and bread", "Tea and rice", "Only coffee", "Water"],
      answer: "Coffee and bread",
    },
    {
      id: "id_p2",
      title: "My family",
      lines: [
        { native: "Ibu saya kerja di kota.", translit: "", translation: "My mother works in the city." },
        { native: "Ayah saya pergi ke stasiun hari ini.", translit: "", translation: "My father goes to the station today." },
        { native: "Saya punya satu saudara.", translit: "", translation: "I have one sibling." },
        { native: "Kami makan nasi dan teh.", translit: "", translation: "We eat rice and tea." },
      ],
      question: "Where does the father go?",
      options: ["To the station", "To the airport", "To the hotel", "To the city"],
      answer: "To the station",
    },
    {
      id: "id_p3",
      title: "Finding the hotel",
      lines: [
        { native: "Permisi, di mana hotel?", translit: "", translation: "Excuse me, where is the hotel?" },
        { native: "Lurus dan kanan.", translit: "", translation: "Straight ahead and right." },
        { native: "Jauh atau dekat?", translit: "", translation: "Far or near?" },
        { native: "Sangat dekat.", translit: "", translation: "Very near." },
        { native: "Terima kasih!", translit: "", translation: "Thank you!" },
      ],
      question: "Where is the hotel?",
      options: ["Straight ahead, then right", "Straight ahead, then left", "Far away", "At the airport"],
      answer: "Straight ahead, then right",
    },
    {
      id: "id_p4",
      title: "I am tired",
      lines: [
        { native: "Hari ini saya sangat lelah.", translit: "", translation: "Today I am very tired." },
        { native: "Saya mau tidur sekarang.", translit: "", translation: "I want to sleep now." },
        { native: "Tapi saya lapar juga.", translit: "", translation: "But I am hungry too." },
        { native: "Ada nasi di rumah.", translit: "", translation: "There is rice at home." },
        { native: "Bagus. Saya makan dan tidur.", translit: "", translation: "Good. I'll eat and sleep." },
      ],
      question: "Why does the person not sleep straight away?",
      options: ["They are hungry", "They are sick", "They must work", "It is morning"],
      answer: "They are hungry",
    },
  ],


  pcm: [
    {
      id: "pcm_p1",
      title: "Meeting a friend",
      lines: [
        { native: "How you dey?", translit: "how yu day", translation: "How are you?" },
        { native: "I dey fine, thank you.", translit: "I day fine, tank yu", translation: "I'm fine, thank you." },
        { native: "Wetin you wan chop?", translit: "WEH-tin yu wan chop", translation: "What do you want to eat?" },
        { native: "I wan bread an tea.", translit: "I wan bred an tee", translation: "I want bread and tea." },
        { native: "No wahala. Make we go.", translit: "no wah-HA-la. mek wi go", translation: "No problem. Let's go." },
      ],
      question: "What does the person want to eat?",
      options: ["Bread and tea", "Rice and water", "Nothing", "Only tea"],
      answer: "Bread and tea",
    },
    {
      id: "pcm_p2",
      title: "Going to town",
      lines: [
        { native: "I wan go town today.", translit: "I wan go town too-DAY", translation: "I want to go to town today." },
        { native: "You sabi di road?", translit: "yu SAH-bee di rod", translation: "Do you know the road?" },
        { native: "No, I no sabi. But I get map.", translit: "no, I no SAH-bee. but I get map", translation: "No, I don't know it. But I have a map." },
        { native: "Oya, make we take bus.", translit: "OH-ya, mek wi tek bus", translation: "Come on, let's take the bus." },
        { native: "Sharp sharp! Di station near.", translit: "sharp sharp! di station near", translation: "Quickly! The station is near." },
      ],
      question: "How will they travel?",
      options: ["By bus", "By taxi", "By train", "On foot"],
      answer: "By bus",
    },
    {
      id: "pcm_p3",
      title: "My people",
      lines: [
        { native: "My mama dey house.", translit: "my MAH-ma day hauz", translation: "My mother is at home." },
        { native: "My papa dey work today.", translit: "my PAH-pa day work too-DAY", translation: "My father is at work today." },
        { native: "I get one brother an one sister.", translit: "I get wan BROH-da an wan SIS-ta", translation: "I have one brother and one sister." },
        { native: "We dey happy well well.", translit: "wi day happy well well", translation: "We are very happy." },
      ],
      question: "Where is the father?",
      options: ["At work", "At home", "At school", "At the market"],
      answer: "At work",
    },
    {
      id: "pcm_p4",
      title: "I no well",
      lines: [
        { native: "I no dey fine today.", translit: "I no day fine too-DAY", translation: "I'm not well today." },
        { native: "My head no good.", translit: "my hed no good", translation: "My head isn't good." },
        { native: "You need doctor?", translit: "yu need doctor", translation: "Do you need a doctor?" },
        { native: "Yes. Abeg helep me.", translit: "yes. ah-BEG helep mi", translation: "Yes. Please help me." },
        { native: "No wahala. Make we go see doctor.", translit: "no wah-HA-la. mek wi go see doctor", translation: "No problem. Let's go and see a doctor." },
      ],
      question: "What does the person need?",
      options: ["A doctor", "Food", "A taxi", "Money"],
      answer: "A doctor",
    },
  ],


  tr: [
    {
      id: "tr_p1",
      title: "At the café",
      lines: [
        { native: "Merhaba! Bir kahve lütfen.", translit: "mer-ha-BA! beer kah-VEH LEWT-fen", translation: "Hello! A coffee, please." },
        { native: "Çay istemez misiniz?", translit: "chai ees-teh-MEZ mee-see-neez", translation: "Wouldn't you like tea?" },
        { native: "Hayır, teşekkürler.", translit: "HAH-yuhr, teh-shek-kewr-LEHR", translation: "No, thank you." },
        { native: "Hesap lütfen.", translit: "heh-SAHP LEWT-fen", translation: "The bill, please." },
        { native: "Buyurun. Görüşürüz!", translit: "BOO-yoo-roon. gur-rew-shew-REWZ", translation: "Here you are. See you!" },
      ],
      question: "What does the person drink?",
      options: ["Coffee", "Tea", "Water", "Milk"],
      answer: "Coffee",
    },
    {
      id: "tr_p2",
      title: "My family",
      lines: [
        { native: "Benim ismim Emre.", translit: "beh-NEEM ees-MEEM em-REH", translation: "My name is Emre." },
        { native: "Bir abim ve bir ablam var.", translit: "beer ah-BEEM veh beer ab-LAHM var", translation: "I have an older brother and an older sister." },
        { native: "Annem doktor.", translit: "an-NEM doktor", translation: "My mother is a doctor." },
        { native: "Babam hastanede.", translit: "bah-BAHM has-tah-neh-DEH", translation: "My father is at the hospital." },
        { native: "Ailem çok güzel.", translit: "ah-ee-LEM chok gew-ZEL", translation: "My family is very lovely." },
      ],
      question: "What is the mother's job?",
      options: ["A doctor", "A teacher", "A driver", "A cook"],
      answer: "A doctor",
    },
    {
      id: "tr_p3",
      title: "Where is the station?",
      lines: [
        { native: "Affedersiniz, istasyon nerede?", translit: "af-feh-DEHR-see-neez, ees-tas-YOHN NEH-reh-deh", translation: "Excuse me, where is the station?" },
        { native: "Dosdoğru gidin, sonra sol.", translit: "dos-doh-ROO gee-DEEN, SOHN-rah sol", translation: "Go straight ahead, then left." },
        { native: "Uzak mı?", translit: "oo-ZAHK muh", translation: "Is it far?" },
        { native: "Hayır, çok yakın.", translit: "HAH-yuhr, chok yah-KUHN", translation: "No, very near." },
        { native: "Teşekkür ederim!", translit: "teh-shek-KEWR eh-deh-REEM", translation: "Thank you!" },
      ],
      question: "Where is the station?",
      options: ["Straight ahead, then left", "Straight ahead, then right", "Far away", "Next to the hotel"],
      answer: "Straight ahead, then left",
    },
    {
      id: "tr_p4",
      title: "I am hungry",
      lines: [
        { native: "Bugün çok yorgunum.", translit: "boo-GEWN chok yor-goo-NOOM", translation: "Today I am very tired." },
        { native: "Su istiyorum.", translit: "soo ees-tee-YOH-room", translation: "I want water." },
        { native: "Aç mısın?", translit: "ach muh-SUHN", translation: "Are you hungry?" },
        { native: "Evet, ekmek ve peynir var mı?", translit: "eh-VET, ek-MEK veh pay-NEER var muh", translation: "Yes, is there bread and cheese?" },
        { native: "Evet. Afiyet olsun!", translit: "eh-VET. ah-fee-YET ol-SOON", translation: "Yes. Enjoy your meal!" },
      ],
      question: "What does the person eat?",
      options: ["Bread and cheese", "Fish and rice", "Only water", "Cake"],
      answer: "Bread and cheese",
    },
  ],


  pa: [
    {
      id: "pa_p1",
      title: "Meeting someone",
      lines: [
        { native: "السلام علیکم!", translit: "assalam alaikum", translation: "Hello!" },
        { native: "میرا نام علی اے۔", translit: "mera naam Ali ae", translation: "My name is Ali." },
        { native: "توں کتھے جانا ایں؟", translit: "tun kithe jana ain", translation: "Where are you going?" },
        { native: "میں گھر جانا آں۔", translit: "main ghar jana aan", translation: "I am going home." },
        { native: "چنگا! اللہ حافظ۔", translit: "changa! Allah hafiz", translation: "Good! Goodbye." },
      ],
      question: "Where is the person going?",
      options: ["Home", "To school", "To the market", "To the city"],
      answer: "Home",
    },
    {
      id: "pa_p2",
      title: "My family",
      lines: [
        { native: "میری ماں گھر وچ اے۔", translit: "meri maan ghar vich ae", translation: "My mother is at home." },
        { native: "میرا پیو کم کردا اے۔", translit: "mera pyo kamm karda ae", translation: "My father is working." },
        { native: "میرا اک بھائی تے اک بھین اے۔", translit: "mera ik bhai te ik bhen ae", translation: "I have one brother and one sister." },
        { native: "اسیں سارے خوش آں۔", translit: "asin saare khush aan", translation: "We are all happy." },
      ],
      question: "How many siblings does the person have?",
      options: ["One brother and one sister", "Two brothers", "Only a sister", "Three siblings"],
      answer: "One brother and one sister",
    },
    {
      id: "pa_p3",
      title: "At the tea shop",
      lines: [
        { native: "اک چاہ تے روٹی، مہربانی کرکے۔", translit: "ik chaa te roti, meharbani karke", translation: "One tea and bread, please." },
        { native: "قیمت کِنّی اے؟", translit: "qeemat kinni ae", translation: "How much is the price?" },
        { native: "تھوڑی۔", translit: "thodi", translation: "A little." },
        { native: "شکریہ!", translit: "shukriya", translation: "Thank you!" },
      ],
      question: "What does the person order?",
      options: ["Tea and bread", "Water and rice", "Only tea", "Milk"],
      answer: "Tea and bread",
    },
    {
      id: "pa_p4",
      title: "I am tired",
      lines: [
        { native: "میں اج بہت تھکیا آں۔", translit: "main ajj bohot thakya aan", translation: "I am very tired today." },
        { native: "مینوں پانی چاہیدا اے۔", translit: "mainu paani chahida ae", translation: "I need water." },
        { native: "توں بیمار ایں؟", translit: "tun beemar ain", translation: "Are you sick?" },
        { native: "نہیں، میں ٹھیک آں۔", translit: "nahin, main theek aan", translation: "No, I am fine." },
      ],
      question: "How does the person feel?",
      options: ["Tired", "Sick", "Happy", "Hungry"],
      answer: "Tired",
    },
  ],

};

/** Get a random passage for a language, or null if none exist. */
export function getPassage(langCode, seenIds = []) {
  const list = PASSAGES[langCode];
  if (!list || list.length === 0) return null;
  const unseen = list.filter((p) => !seenIds.includes(p.id));
  const pool = unseen.length > 0 ? unseen : list;
  return pool[Math.floor(Math.random() * pool.length)];
}
