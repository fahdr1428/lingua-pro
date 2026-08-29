// =============================================================================
// EXTRA EXAMPLES — additional example sentences merged into existing vocab.
// v28: every key here has been verified against the actual vocab lemma in the
// matching language JSON file. No silent misses.
//
// Scope: only the four highest-confidence languages (es, fr, ur, hi). Each
// extra example uses beginner vocabulary the learner will recognise.
// =============================================================================

export const EXTRA_EXAMPLES = {
  // ---------------------------------------------------------------------------
  // Spanish — keys match es.json lemmas EXACTLY (capitalised first letter).
  // ---------------------------------------------------------------------------
  es: {
    "Hola": [{ native: "Hola, ¿qué tal?", translation: "Hello, how are you?" }],
    "Gracias": [{ native: "Gracias por todo", translation: "Thanks for everything" }],
    "Por favor": [{ native: "Más café, por favor", translation: "More coffee, please" }],
    "Sí": [{ native: "Sí, claro", translation: "Yes, of course" }],
    "No": [{ native: "No, gracias", translation: "No, thank you" }],
    "Adiós": [{ native: "Adiós, hasta mañana", translation: "Goodbye, see you tomorrow" }],
    "Buenos días": [{ native: "Buenos días, señora", translation: "Good morning, madam" }],
    "Agua": [{ native: "Quiero agua fría", translation: "I want cold water" }],
    "Café": [{ native: "Un café con leche", translation: "A coffee with milk" }],
    "Pan": [{ native: "Quiero pan con mantequilla", translation: "I want bread with butter" }],
    "Leche": [{ native: "Un vaso de leche", translation: "A glass of milk" }],
    "Casa": [{ native: "Mi casa es grande", translation: "My house is big" }],
    "Comida": [{ native: "La comida está lista", translation: "The food is ready" }],
    "Amigo": [{ native: "Voy con un amigo", translation: "I'm going with a friend" }],
    "Madre": [{ native: "Mi madre cocina bien", translation: "My mother cooks well" }],
    "Padre": [{ native: "El padre de Ana", translation: "Ana's father" }],
    "Yo": [{ native: "Yo vivo aquí", translation: "I live here" }],
    "Tú": [{ native: "¿Y tú?", translation: "And you?" }],
    "Ser": [{ native: "Soy estudiante", translation: "I am a student" }],
    "Tener": [{ native: "¿Tienes tiempo?", translation: "Do you have time?" }],
    "Querer": [{ native: "Quiero más", translation: "I want more" }],
    "Comer": [{ native: "Vamos a comer", translation: "Let's go eat" }],
    "Ir": [{ native: "¿Adónde vas?", translation: "Where are you going?" }],
    "Grande": [{ native: "Mi hermano es más grande", translation: "My brother is bigger" }],
    "Pequeño": [{ native: "Un libro pequeño", translation: "A small book" }],
    "Hoy": [{ native: "Hoy no trabajo", translation: "Today I'm not working" }],
    "Mañana": [{ native: "Mañana por la mañana", translation: "Tomorrow morning" }],
    "Uno": [{ native: "Uno, dos, tres", translation: "One, two, three" }],
    "Dos": [{ native: "Dos cafés, por favor", translation: "Two coffees, please" }],
    "Tres": [{ native: "Tres amigos", translation: "Three friends" }],
    "Feliz": [{ native: "Estoy feliz de verte", translation: "I'm happy to see you" }],
    "Cansado": [{ native: "Llegué cansado del trabajo", translation: "I arrived home tired from work" }],
    "Hambre": [{ native: "Tengo mucha hambre", translation: "I'm very hungry" }],
    "Rojo": [{ native: "Un coche rojo", translation: "A red car" }],
    "Azul": [{ native: "El cielo azul", translation: "The blue sky" }],
    "De nada": [{ native: "De nada, fue un placer", translation: "You're welcome, my pleasure" }],
    "Hermano": [{ native: "Tengo dos hermanos", translation: "I have two brothers" }],
    "Hermana": [{ native: "Una hermana pequeña", translation: "A little sister" }],
    "Escuela": [{ native: "La escuela está cerca", translation: "The school is near" }],
    "Día": [{ native: "Un buen día", translation: "A good day" }],
    "Noche": [{ native: "Buenas noches, mamá", translation: "Good night, mum" }],
    "Bien": [{ native: "Estoy muy bien", translation: "I am very well" }],
    "Frío": [{ native: "Hace mucho frío", translation: "It is very cold" }],
  },

  // ---------------------------------------------------------------------------
  // French — keys match fr.json lemmas EXACTLY.
  // ---------------------------------------------------------------------------
  fr: {
    "Bonjour": [{ native: "Bonjour, ça va ?", translation: "Hello, how are you?" }],
    "Merci": [{ native: "Merci pour ton aide", translation: "Thanks for your help" }],
    "S'il vous plaît": [{ native: "Un café, s'il vous plaît", translation: "A coffee, please" }],
    "Oui": [{ native: "Oui, bien sûr", translation: "Yes, of course" }],
    "Non": [{ native: "Non, merci", translation: "No, thank you" }],
    "Au revoir": [{ native: "Au revoir, à demain", translation: "Goodbye, see you tomorrow" }],
    "Bonsoir": [{ native: "Bonsoir, madame", translation: "Good evening, madam" }],
    "Eau": [{ native: "De l'eau froide", translation: "Some cold water" }],
    "Café": [{ native: "Un café au lait", translation: "A coffee with milk" }],
    "Pain": [{ native: "Du pain frais", translation: "Some fresh bread" }],
    "Lait": [{ native: "Un café au lait", translation: "A coffee with milk" }],
    "Maison": [{ native: "Ma maison est petite", translation: "My house is small" }],
    "Ami": [{ native: "Je sors avec des amis", translation: "I'm going out with friends" }],
    "Mère": [{ native: "Ma mère est gentille", translation: "My mother is kind" }],
    "Père": [{ native: "Le père de Marie", translation: "Marie's father" }],
    "Je": [{ native: "Je sais", translation: "I know" }],
    "Tu": [{ native: "Et toi ?", translation: "And you?" }],
    "Être": [{ native: "Vous êtes très gentil", translation: "You are very kind" }],
    "Avoir": [{ native: "Tu as le temps ?", translation: "Do you have time?" }],
    "Manger": [{ native: "On va manger", translation: "We're going to eat" }],
    "Aller": [{ native: "Où vas-tu ?", translation: "Where are you going?" }],
    "Grand": [{ native: "Mon frère est plus grand", translation: "My brother is taller" }],
    "Petit": [{ native: "Un petit livre", translation: "A small book" }],
    "Aujourd'hui": [{ native: "Aujourd'hui, c'est lundi", translation: "Today is Monday" }],
    "Demain": [{ native: "Demain matin, tôt", translation: "Tomorrow morning, early" }],
    "Un": [{ native: "Un, deux, trois", translation: "One, two, three" }],
    "Deux": [{ native: "Deux cafés, s'il vous plaît", translation: "Two coffees, please" }],
    "Trois": [{ native: "Trois amis", translation: "Three friends" }],
    "Heureux": [{ native: "Je suis heureux de te voir", translation: "I'm happy to see you" }],
    "Fatigué": [{ native: "Elle rentre fatiguée du travail", translation: "She comes home tired from work" }],
    "Faim": [{ native: "J'ai très faim", translation: "I'm very hungry" }],
    "Rouge": [{ native: "Une voiture rouge", translation: "A red car" }],
    "Bleu": [{ native: "Le ciel bleu", translation: "The blue sky" }],
    "Frère": [{ native: "J'ai deux frères", translation: "I have two brothers" }],
    "Sœur": [{ native: "Ma petite sœur", translation: "My little sister" }],
    "École": [{ native: "Je vais à l'école", translation: "I go to school" }],
    "Jour": [{ native: "Un beau jour", translation: "A beautiful day" }],
    "Nuit": [{ native: "Il travaille la nuit", translation: "He works at night" }],
    "Bien": [{ native: "Je vais très bien", translation: "I am very well" }],
    "Froid": [{ native: "Il fait très froid", translation: "It is very cold" }],
    "Chaud": [{ native: "L'eau est chaude", translation: "The water is hot" }],
  },

  // ---------------------------------------------------------------------------
  // Urdu — keys match ur.json lemmas EXACTLY. Dropped 4 that don't exist as
  // standalone vocab (ہونا، کتاب، لال، نیلا) — better than wrong entries.
  // ---------------------------------------------------------------------------
  ur: {
    "سلام": [{ native: "سلام دوست", translit: "salaam dost", translation: "Hello, friend" }],
    "شکریہ": [{ native: "بہت بہت شکریہ", translit: "bohot bohot shukriya", translation: "Thank you very much" }],
    "ہاں": [{ native: "ہاں، بالکل", translit: "haan, bilkul", translation: "Yes, of course" }],
    "نہیں": [{ native: "نہیں، شکریہ", translit: "nahin, shukriya", translation: "No, thank you" }],
    "خدا حافظ": [{ native: "خدا حافظ، کل ملیں گے", translit: "khuda hafiz, kal milenge", translation: "Goodbye, see you tomorrow" }],
    "براہ کرم": [{ native: "ایک کپ چائے، براہ کرم", translit: "ek cup chai, barah-e-karam", translation: "One cup of tea, please" }],
    "معاف کریں": [{ native: "معاف کریں، میں نے سنا نہیں", translit: "maaf karein, main ne suna nahin", translation: "Sorry, I didn't hear" }],
    "پانی": [{ native: "ٹھنڈا پانی چاہیے", translit: "thanda paani chahiye", translation: "I need cold water" }],
    "چائے": [{ native: "چائے پی لیں؟", translit: "chai pee lein?", translation: "Shall we have some tea?" }],
    "روٹی": [{ native: "تازی روٹی", translit: "taazi roti", translation: "Fresh bread" }],
    "دودھ": [{ native: "دودھ والی چائے", translit: "doodh wali chai", translation: "Tea with milk" }],
    "گھر": [{ native: "میرا گھر بڑا ہے", translit: "mera ghar bada hai", translation: "My house is big" }],
    "کھانا": [{ native: "کھانا بہت مزیدار ہے", translit: "khana bohot mazedaar hai", translation: "The food is delicious" }],
    "دوست": [{ native: "وہ میرے دوست ہیں", translit: "woh mere dost hain", translation: "They are my friends" }],
    "ماں": [{ native: "میری ماں بہت اچھی ہیں", translit: "meri maan bohot achchi hain", translation: "My mother is very kind" }],
    "باپ": [{ native: "میرے باپ کا نام", translit: "mere baap ka naam", translation: "My father's name" }],
    "میں": [{ native: "میں یہاں رہتا ہوں", translit: "main yahan rehta hoon", translation: "I live here" }],
    "آپ": [{ native: "آپ کیسے ہیں؟", translit: "aap kaise hain?", translation: "How are you?" }],
    "جانا": [{ native: "مجھے جانا ہے", translit: "mujhe jaana hai", translation: "I have to go" }],
    "اچھا": [{ native: "یہ کھانا اچھا ہے", translit: "yeh khana achcha hai", translation: "This food is good" }],
    "بڑا": [{ native: "میں بڑا بھائی ہوں", translit: "main bara bhai hoon", translation: "I am the older brother" }],
    "چھوٹا": [{ native: "یہ کمرہ چھوٹا ہے", translit: "yeh kamra chhota hai", translation: "This room is small" }],
    "آج": [{ native: "آج سوموار ہے", translit: "aaj somwar hai", translation: "Today is Monday" }],
    "کل": [{ native: "کل بارش ہوئی تھی", translit: "kal barish hui thi", translation: "It rained yesterday" }],
    "ایک": [{ native: "ایک، دو، تین", translit: "ek, do, teen", translation: "One, two, three" }],
    "دو": [{ native: "دو کپ چائے", translit: "do cup chai", translation: "Two cups of tea" }],
    "تین": [{ native: "تین دوست", translit: "teen dost", translation: "Three friends" }],
    "خوش": [{ native: "میں آپ سے مل کر خوش ہوں", translit: "main aap se mil kar khush hoon", translation: "I'm happy to meet you" }],
    "تھکا": [{ native: "وہ کام سے تھکا آیا", translit: "woh kaam se thaka aaya", translation: "He came home tired from work" }],
    "بھوک": [{ native: "مجھے بہت بھوک ہے", translit: "mujhe bohot bhookh hai", translation: "I'm very hungry" }],
    "بھائی": [{ native: "میرے دو بھائی ہیں", translit: "mere do bhai hain", translation: "I have two brothers" }],
    "بہن": [{ native: "میری چھوٹی بہن", translit: "meri chhoti behan", translation: "My younger sister" }],
    "اسکول": [{ native: "میں اسکول جاتا ہوں", translit: "main school jaata hoon", translation: "I go to school" }],
    "دن": [{ native: "آج کا دن لمبا تھا", translit: "aaj ka din lamba tha", translation: "Today was a long day" }],
    "رات": [{ native: "وہ رات کو کام کرتا ہے", translit: "woh raat ko kaam karta hai", translation: "He works at night" }],
    "ٹھیک": [{ native: "سب ٹھیک ہو جائے گا", translit: "sab theek ho jayega", translation: "Everything will be fine" }],
    "ٹھنڈا": [{ native: "موسم ٹھنڈا ہے", translit: "mausam thanda hai", translation: "The weather is cold" }],
    "گرم": [{ native: "کھانا ابھی گرم ہے", translit: "khana abhi garam hai", translation: "The food is still hot" }],
  },

  // ---------------------------------------------------------------------------
  // Hindi — keys match hi.json lemmas EXACTLY. All 27 verified earlier.
  // ---------------------------------------------------------------------------
  hi: {
    "नमस्ते": [{ native: "नमस्ते, कैसे हैं आप?", translit: "namaste, kaise hain aap?", translation: "Hello, how are you?" }],
    "धन्यवाद": [{ native: "बहुत बहुत धन्यवाद", translit: "bahut bahut dhanyavaad", translation: "Thank you very much" }],
    "हाँ": [{ native: "हाँ, ज़रूर", translit: "haan, zaroor", translation: "Yes, of course" }],
    "नहीं": [{ native: "नहीं, धन्यवाद", translit: "nahin, dhanyavaad", translation: "No, thank you" }],
    "अलविदा": [{ native: "अलविदा, कल मिलेंगे", translit: "alvida, kal milenge", translation: "Goodbye, see you tomorrow" }],
    "कृपया": [{ native: "कृपया धीरे बोलिए", translit: "kripya dheere boliye", translation: "Please speak slowly" }],
    "माफ़ करना": [{ native: "माफ़ करना, मुझे देर हो गई", translit: "maaf karna, mujhe der ho gayi", translation: "Sorry, I'm late" }],
    "पानी": [{ native: "ठंडा पानी चाहिए", translit: "thanda paani chahiye", translation: "I need cold water" }],
    "चाय": [{ native: "एक कप चाय", translit: "ek cup chai", translation: "A cup of tea" }],
    "रोटी": [{ native: "ताज़ी रोटी", translit: "taazi roti", translation: "Fresh bread" }],
    "दूध": [{ native: "एक गिलास दूध", translit: "ek gilaas doodh", translation: "A glass of milk" }],
    "घर": [{ native: "मेरा घर बड़ा है", translit: "mera ghar bada hai", translation: "My house is big" }],
    "खाना": [{ native: "खाना तैयार है", translit: "khana taiyaar hai", translation: "The food is ready" }],
    "दोस्त": [{ native: "मेरा अच्छा दोस्त", translit: "mera achcha dost", translation: "My good friend" }],
    "माँ": [{ native: "माँ, मैं आ रहा हूँ", translit: "maa, main aa raha hoon", translation: "Mum, I'm coming" }],
    "पिता": [{ native: "मेरे पिता का नाम", translit: "mere pita ka naam", translation: "My father's name" }],
    "मैं": [{ native: "मैं यहाँ रहता हूँ", translit: "main yahan rehta hoon", translation: "I live here" }],
    "आप": [{ native: "आप कैसे हैं?", translit: "aap kaise hain?", translation: "How are you?" }],
    "जाना": [{ native: "मैं घर जा रहा हूँ", translit: "main ghar ja raha hoon", translation: "I am going home" }],
    "अच्छा": [{ native: "यह खाना अच्छा है", translit: "yeh khana accha hai", translation: "This food is good" }],
    "बड़ा": [{ native: "मैं बड़ा भाई हूँ", translit: "main bara bhai hoon", translation: "I am the older brother" }],
    "छोटा": [{ native: "यह कमरा छोटा है", translit: "yeh kamra chota hai", translation: "This room is small" }],
    "आज": [{ native: "आज सोमवार है", translit: "aaj somvaar hai", translation: "Today is Monday" }],
    "कल": [{ native: "कल बारिश हुई थी", translit: "kal baarish hui thi", translation: "It rained yesterday" }],
    "खुश": [{ native: "बहुत खुश", translit: "bahut khush", translation: "Very happy" }],
    "थका": [{ native: "वह काम से थका आया", translit: "woh kaam se thaka aaya", translation: "He came home tired from work" }],
    "भूखा": [{ native: "मुझे बहुत भूख है", translit: "mujhe bahut bhookh hai", translation: "I'm very hungry" }],
  },

  // ---------------------------------------------------------------------------
  // Bengali — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  bn: {
    "আমি": [{ native: "আমি জানি না", translit: "ami jani na", translation: "I don't know" }],
    "আপনি": [{ native: "আপনি কেমন আছেন?", translit: "apni kemon achen?", translation: "How are you?" }],
    "সে": [{ native: "সে আসবে না", translit: "she ashbe na", translation: "He won't come" }],
    "আমরা": [{ native: "আমরা বাড়ি যাচ্ছি", translit: "amra bari jacchi", translation: "We're going home" }],
    "কী": [{ native: "তুমি কী চাও?", translit: "tumi ki chao?", translation: "What do you want?" }],
    "কে": [{ native: "কে এসেছে?", translit: "ke eseche?", translation: "Who has come?" }],
    "ভাই": [{ native: "আমার দুই ভাই আছে", translit: "amar dui bhai achhe", translation: "I have two brothers" }],
    "বোন": [{ native: "আমার বোন ডাক্তার", translit: "amar bon daktar", translation: "My sister is a doctor" }],
    "বন্ধু": [{ native: "সে আমার পুরনো বন্ধু", translit: "she amar purono bondhu", translation: "He is my old friend" }],
    "এক": [{ native: "এক মিনিট অপেক্ষা করুন", translit: "ek minit opekkha korun", translation: "Please wait one minute" }],
    "দুই": [{ native: "দুই ঘণ্টা", translit: "dui ghonta", translation: "Two hours" }],
    "তিন": [{ native: "তিন জন লোক", translit: "tin jon lok", translation: "Three people" }],
    "ধন্যবাদ": [{ native: "সাহায্যের জন্য ধন্যবাদ", translit: "shahajjer jonno dhonnobad", translation: "Thanks for the help" }],
    "হ্যাঁ": [{ native: "হ্যাঁ, আমি রাজি", translit: "hyan, ami raji", translation: "Yes, I agree" }],
    "না": [{ native: "না, আজ নয়", translit: "na, aj noy", translation: "No, not today" }],
    "দুঃখিত": [{ native: "দেরির জন্য দুঃখিত", translit: "derir jonno dukkhito", translation: "Sorry for the delay" }],
    "দয়া করে": [{ native: "দয়া করে আস্তে বলুন", translit: "doya kore aste bolun", translation: "Please speak slowly" }],
    "বিদায়": [{ native: "বিদায়, ভালো থেকো", translit: "biday, bhalo theko", translation: "Goodbye, take care" }],
  },

  // ---------------------------------------------------------------------------
  // Arabic — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  ar: {
    "أنا": [{ native: "أنا لا أفهم", translit: "ana la afham", translation: "I don't understand" }],
    "خبز": [{ native: "أشتري الخبز كل يوم", translit: "ashtari al-khubz kull yawm", translation: "I buy bread every day" }],
    "شاي": [{ native: "أريد كوب شاي", translit: "ureed koob shay", translation: "I want a cup of tea" }],
    "واحد": [{ native: "غرفة لشخص واحد", translit: "ghurfa li-shakhs wahid", translation: "A room for one person" }],
    "اثنان": [{ native: "عندي أخوان اثنان", translit: "indi akhawan ithnan", translation: "I have two brothers" }],
    "ثلاثة": [{ native: "ثلاثة أشخاص", translit: "thalathat ashkhas", translation: "Three people" }],
    "عشرة": [{ native: "عشرة دقائق فقط", translit: "asharat daqaaiq faqat", translation: "Only ten minutes" }],
    "يذهب": [{ native: "متى تذهب؟", translit: "mata tadhhab?", translation: "When do you go?" }],
    "بيت": [{ native: "البيت قريب من السوق", translit: "al-bayt qareeb min as-sooq", translation: "The house is near the market" }],
    "اليوم": [{ native: "اليوم عندي عمل كثير", translit: "al-yawm indi amal katheer", translation: "Today I have a lot of work" }],
    "غدا": [{ native: "سأسافر غدا", translit: "sa-usafir ghadan", translation: "I will travel tomorrow" }],
    "جوعان": [{ native: "هل أنت جوعان؟", translit: "hal anta jouan?", translation: "Are you hungry?" }],
    "من فضلك": [{ native: "من فضلك، أين المحطة؟", translit: "min fadlik, ayna al-mahatta?", translation: "Please, where is the station?" }],
    "كبير": [{ native: "أخي الكبير", translit: "akhi al-kabeer", translation: "My older brother" }],
    "مرحبا": [{ native: "مرحبا، كيف الحال؟", translit: "marhaba, kayf al-haal?", translation: "Hello, how are things?" }],
    "شكرا": [{ native: "شكرا على المساعدة", translit: "shukran ala al-musaada", translation: "Thanks for the help" }],
    "نعم": [{ native: "نعم، أنا موافق", translit: "naam, ana muwafiq", translation: "Yes, I agree" }],
    "لا": [{ native: "لا، ليس اليوم", translit: "la, laysa al-yawm", translation: "No, not today" }],
  },

  // ---------------------------------------------------------------------------
  // Japanese — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  ja: {
    "私": [{ native: "私も行きます", translit: "watashi mo ikimasu", translation: "I'll go too" }],
    "水": [{ native: "水が冷たいです", translit: "mizu ga tsumetai desu", translation: "The water is cold" }],
    "ご飯": [{ native: "もうご飯を食べましたか", translit: "mō gohan o tabemashita ka", translation: "Have you eaten yet?" }],
    "お茶": [{ native: "お茶が好きです", translit: "ocha ga suki desu", translation: "I like tea" }],
    "魚": [{ native: "魚を食べません", translit: "sakana o tabemasen", translation: "I don't eat fish" }],
    "肉": [{ native: "肉と野菜", translit: "niku to yasai", translation: "Meat and vegetables" }],
    "パン": [{ native: "朝はパンだけです", translit: "asa wa pan dake desu", translation: "In the morning it's just bread" }],
    "一": [{ native: "一時に会いましょう", translit: "ichiji ni aimashō", translation: "Let's meet at one o'clock" }],
    "二": [{ native: "二回行きました", translit: "nikai ikimashita", translation: "I went twice" }],
    "三": [{ native: "三時間かかります", translit: "sanjikan kakarimasu", translation: "It takes three hours" }],
    "百": [{ native: "百人以上います", translit: "hyakunin ijō imasu", translation: "There are more than a hundred people" }],
    "行く": [{ native: "明日どこへ行きますか", translit: "ashita doko e ikimasu ka", translation: "Where are you going tomorrow?" }],
    "こんにちは": [{ native: "こんにちは、お元気ですか", translit: "konnichiwa, ogenki desu ka", translation: "Hello, how are you?" }],
    "ありがとう": [{ native: "手伝ってくれてありがとう", translit: "tetsudatte kurete arigatō", translation: "Thanks for helping me" }],
    "はい": [{ native: "はい、大丈夫です", translit: "hai, daijōbu desu", translation: "Yes, it's fine" }],
    "いいえ": [{ native: "いいえ、結構です", translit: "iie, kekkō desu", translation: "No, I'm fine" }],
    "すみません": [{ native: "遅れてすみません", translit: "okurete sumimasen", translation: "Sorry I'm late" }],
    "おはよう": [{ native: "おはよう、よく寝た？", translit: "ohayō, yoku neta?", translation: "Morning, did you sleep well?" }],
  },

  // ---------------------------------------------------------------------------
  // Korean — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  ko: {
    "안녕": [{ native: "안녕, 잘 가", translit: "annyeong, jal ga", translation: "Bye, take care" }],
    "감사합니다": [{ native: "도와주셔서 감사합니다", translit: "dowajusyeoseo gamsahamnida", translation: "Thank you for helping" }],
    "네": [{ native: "네, 알겠어요", translit: "ne, algesseoyo", translation: "Yes, I understand" }],
    "아니요": [{ native: "아니요, 아직이요", translit: "aniyo, ajigiyo", translation: "No, not yet" }],
    "실례합니다": [{ native: "실례합니다, 지나가겠습니다", translit: "sillyehamnida, jinagagesseumnida", translation: "Excuse me, coming through" }],
    "저": [{ native: "저도 몰라요", translit: "jeo-do mollayo", translation: "I don't know either" }],
    "우리": [{ native: "우리 같이 가요", translit: "uri gachi gayo", translation: "Let's go together" }],
    "이것": [{ native: "이것 좀 주세요", translit: "igeot jom juseyo", translation: "Please give me this" }],
    "무엇": [{ native: "무엇을 드릴까요?", translit: "mueos-eul deurilkkayo?", translation: "What can I get you?" }],
    "누구": [{ native: "누구랑 가요?", translit: "nugu-rang gayo?", translation: "Who are you going with?" }],
    "형": [{ native: "형이 두 명 있어요", translit: "hyeong-i du myeong isseoyo", translation: "I have two older brothers" }],
    "누나": [{ native: "누나는 의사예요", translit: "nuna-neun uisa-yeyo", translation: "My older sister is a doctor" }],
    "친구": [{ native: "친구를 만나요", translit: "chingu-reul mannayo", translation: "I'm meeting a friend" }],
    "아이": [{ native: "아이가 자고 있어요", translit: "ai-ga jago isseoyo", translation: "The child is sleeping" }],
    "하나": [{ native: "하나만 주세요", translit: "hana-man juseyo", translation: "Just one, please" }],
    "둘": [{ native: "둘 다 좋아요", translit: "dul da joayo", translation: "Both are good" }],
    "셋": [{ native: "셋이서 갔어요", translit: "seshiseo gasseoyo", translation: "The three of us went" }],
  },

  // ---------------------------------------------------------------------------
  // Mandarin — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  zh: {
    "你好": [{ native: "你好，很高兴认识你", translit: "nǐ hǎo, hěn gāoxìng rènshi nǐ", translation: "Hello, nice to meet you" }],
    "谢谢": [{ native: "谢谢你的帮助", translit: "xièxie nǐ de bāngzhù", translation: "Thank you for your help" }],
    "是": [{ native: "他是我朋友", translit: "tā shì wǒ péngyǒu", translation: "He is my friend" }],
    "不": [{ native: "我不去", translit: "wǒ bú qù", translation: "I'm not going" }],
    "再见": [{ native: "再见，路上小心", translit: "zàijiàn, lùshang xiǎoxīn", translation: "Goodbye, take care on the way" }],
    "对不起": [{ native: "对不起，我不知道", translit: "duìbùqǐ, wǒ bù zhīdào", translation: "Sorry, I didn't know" }],
    "请": [{ native: "请问一下", translit: "qǐngwèn yíxià", translation: "May I ask something" }],
    "早安": [{ native: "早安，睡得好吗？", translit: "zǎo'ān, shuì de hǎo ma?", translation: "Morning, did you sleep well?" }],
    "我": [{ native: "我也想去", translit: "wǒ yě xiǎng qù", translation: "I want to go too" }],
    "你": [{ native: "你要什么？", translit: "nǐ yào shénme?", translation: "What do you want?" }],
    "他": [{ native: "他在哪里？", translit: "tā zài nǎlǐ?", translation: "Where is he?" }],
    "她": [{ native: "她今天不在", translit: "tā jīntiān bú zài", translation: "She isn't here today" }],
    "我们": [{ native: "我们一起去吧", translit: "wǒmen yìqǐ qù ba", translation: "Let's go together" }],
    "什么": [{ native: "你在做什么？", translit: "nǐ zài zuò shénme?", translation: "What are you doing?" }],
    "谁": [{ native: "谁在门口？", translit: "shéi zài ménkǒu?", translation: "Who's at the door?" }],
    "哥哥": [{ native: "哥哥比我大三岁", translit: "gēge bǐ wǒ dà sān suì", translation: "My brother is three years older than me" }],
    "姐姐": [{ native: "姐姐在上海工作", translit: "jiějie zài Shànghǎi gōngzuò", translation: "My sister works in Shanghai" }],
    "朋友": [{ native: "我跟朋友去看电影", translit: "wǒ gēn péngyǒu qù kàn diànyǐng", translation: "I'm going to a film with a friend" }],
  },

  // ---------------------------------------------------------------------------
  // Malayalam — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  ml: {
    "നമസ്കാരം": [{ native: "നമസ്കാരം, ഞാൻ പോകുന്നു", translit: "namaskaaram, njaan pokunnu", translation: "Hello, I'm leaving" }],
    "സുഖമാണോ": [{ native: "വീട്ടിൽ എല്ലാവർക്കും സുഖമാണോ?", translit: "veettil ellaavarkkum sukhamaano?", translation: "Is everyone well at home?" }],
    "സുഖമാണ്": [{ native: "ഇപ്പോൾ സുഖമാണ്", translit: "ippol sukhamaanu", translation: "I'm fine now" }],
    "അതെ": [{ native: "അതെ, എനിക്കറിയാം", translit: "athe, enikkariyaam", translation: "Yes, I know" }],
    "അല്ല": [{ native: "അത് എന്റേതല്ല", translit: "athu entethalla", translation: "That isn't mine" }],
    "ശരി": [{ native: "ഇത് ശരിയാണോ?", translit: "ithu shariyaano?", translation: "Is this correct?" }],
    "പോയിവരാം": [{ native: "ശരി, പോയിവരാം", translit: "shari, poyivaraam", translation: "Okay, I'll be off" }],
    "നന്ദി": [{ native: "സഹായത്തിന് നന്ദി", translit: "sahaayathinu nandi", translation: "Thanks for the help" }],
    "ദയവായി": [{ native: "ദയവായി പതുക്കെ പറയൂ", translit: "dayavaayi pathukke parayoo", translation: "Please speak slowly" }],
    "ക്ഷമിക്കണം": [{ native: "ക്ഷമിക്കണം, മനസ്സിലായില്ല", translit: "kshamikkanam, manassilaayilla", translation: "Sorry, I didn't understand" }],
    "വേണ്ട": [{ native: "പഞ്ചസാര വേണ്ട", translit: "panchasaara venda", translation: "No sugar" }],
    "ഞാൻ": [{ native: "ഞാൻ നാളെ വരാം", translit: "njaan naale varaam", translation: "I'll come tomorrow" }],
    "നീ": [{ native: "നീ എന്ത് ചെയ്യുന്നു?", translit: "nee enthu cheyyunnu?", translation: "What are you doing?" }],
    "നിങ്ങൾ": [{ native: "നിങ്ങൾ ഇവിടെ ഇരിക്കൂ", translit: "ningal ivide irikkoo", translation: "Please sit here" }],
    "അവൻ": [{ native: "അവൻ ഇന്ന് വന്നില്ല", translit: "avan innu vannilla", translation: "He didn't come today" }],
    "അവൾ": [{ native: "അവൾ പാട്ട് പാടുന്നു", translit: "aval paattu paadunnu", translation: "She is singing" }],
    "ഞങ്ങൾ": [{ native: "ഞങ്ങൾ ഒരുമിച്ച് പോകാം", translit: "njangal orumichu pokaam", translation: "Let's go together" }],
    "പേര്": [{ native: "എന്റെ പേര് സാറ", translit: "ente peru Saara", translation: "My name is Sara" }],
  },

  // ---------------------------------------------------------------------------
  // Tamil — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  ta: {
    "வணக்கம்": [{ native: "வணக்கம், நான் கிளம்பறேன்", translit: "vanakkam, naan kilambaren", translation: "Hello, I'm leaving" }],
    "எப்படி இருக்கீங்க": [{ native: "வீட்ல எல்லாரும் எப்படி இருக்காங்க?", translit: "veetla ellaarum eppadi irukkaanga?", translation: "How is everyone at home?" }],
    "நல்லா இருக்கேன்": [{ native: "இப்ப நல்லா இருக்கேன்", translit: "ippa nallaa irukken", translation: "I'm fine now" }],
    "ஆமாம்": [{ native: "ஆமாம், எனக்குத் தெரியும்", translit: "aamaam, enakku theriyum", translation: "Yes, I know" }],
    "இல்லை": [{ native: "அது என்னுடையது இல்லை", translit: "adhu ennudaiyadhu illai", translation: "That isn't mine" }],
    "சரி": [{ native: "இது சரியா?", translit: "idhu sariyaa?", translation: "Is this right?" }],
    "போய்ட்டு வரேன்": [{ native: "சரி, போய்ட்டு வரேன்", translit: "sari, poyttu varen", translation: "Okay, I'll be off" }],
    "நன்றி": [{ native: "உதவிக்கு நன்றி", translit: "udhavikku nandri", translation: "Thanks for the help" }],
    "தயவுசெய்து": [{ native: "தயவுசெய்து மெதுவா பேசுங்க", translit: "thayavuseydhu medhuvaa pesunga", translation: "Please speak slowly" }],
    "மன்னிக்கவும்": [{ native: "மன்னிக்கவும், புரியலை", translit: "mannikkavum, puriyalai", translation: "Sorry, I didn't understand" }],
    "நான்": [{ native: "நான் நாளைக்கு வரேன்", translit: "naan naalaikku varen", translation: "I'll come tomorrow" }],
    "நீ": [{ native: "நீ என்ன பண்றே?", translit: "nee enna panre?", translation: "What are you doing?" }],
    "நீங்கள்": [{ native: "நீங்க இங்கே உட்காருங்க", translit: "neenga inge utkaarunga", translation: "Please sit here" }],
    "அவன்": [{ native: "அவன் இன்னைக்கு வரலை", translit: "avan innaikku varalai", translation: "He didn't come today" }],
    "அவள்": [{ native: "அவள் பாட்டு பாடறா", translit: "aval paattu paadara", translation: "She is singing" }],
    "நாங்கள்": [{ native: "நாங்க சேர்ந்து போவோம்", translit: "naanga serndhu povom", translation: "Let's go together" }],
    "பெயர்": [{ native: "என் பெயர் மீனா", translit: "en peyar Meena", translation: "My name is Meena" }],
    "அம்மா": [{ native: "அம்மா, நான் வரேன்", translit: "amma, naan varen", translation: "Mum, I'm coming" }],
  },

  // ---------------------------------------------------------------------------
  // Persian — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  fa: {
    "سلام": [{ native: "سلام، خوش آمدید", translit: "salâm, khosh âmadid", translation: "Hello, welcome" }],
    "خداحافظ": [{ native: "خداحافظ، مواظب خودت باش", translit: "khodâhâfez, movâzeb-e khodet bâsh", translation: "Goodbye, take care of yourself" }],
    "صبح بخیر": [{ native: "صبح بخیر، خوب خوابیدی؟", translit: "sobh bekheyr, khoob khâbidi?", translation: "Good morning, did you sleep well?" }],
    "شب بخیر": [{ native: "دیر شده، شب بخیر", translit: "dir shode, shab bekheyr", translation: "It's late, good night" }],
    "چطوری": [{ native: "چطوری؟ خیلی وقته ندیدمت", translit: "chetori? kheyli vaghte nadidamet", translation: "How are you? Long time no see" }],
    "خوبم": [{ native: "ممنون، خوبم", translit: "mamnoon, khubam", translation: "Thanks, I'm well" }],
    "بله": [{ native: "بله، حتما", translit: "bale, hatman", translation: "Yes, certainly" }],
    "نه": [{ native: "نه، امروز نه", translit: "na, emrooz na", translation: "No, not today" }],
    "ممنون": [{ native: "ممنون از کمکت", translit: "mamnoon az komaket", translation: "Thanks for your help" }],
    "متشکرم": [{ native: "از شما متشکرم", translit: "az shomâ moteshakkeram", translation: "I thank you" }],
    "لطفا": [{ native: "لطفا آهسته صحبت کنید", translit: "lotfan âheste sohbat konid", translation: "Please speak slowly" }],
    "ببخشید": [{ native: "ببخشید، متوجه نشدم", translit: "bebakhshid, motevajjeh nashodam", translation: "Sorry, I didn't understand" }],
    "من": [{ native: "من نمی‌دانم", translit: "man nemidânam", translation: "I don't know" }],
  },

  // ---------------------------------------------------------------------------
  // Punjabi — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  pa: {
    "شکریہ": [{ native: "مدد لئی شکریہ", translit: "madad layi shukriya", translation: "Thanks for the help" }],
    "ہاں": [{ native: "ہاں، بالکل ٹھیک", translit: "haan, bilkul theek", translation: "Yes, quite right" }],
    "نہیں": [{ native: "نہیں، اج نہیں", translit: "nahin, aj nahin", translation: "No, not today" }],
    "معاف کرنا": [{ native: "معاف کرنا، مینوں سمجھ نئیں آئی", translit: "maaf karna, mainu samajh nain aayi", translation: "Sorry, I didn't understand" }],
    "مہربانی": [{ native: "تہاڈی بڑی مہربانی", translit: "tuhaadi vaddi meherbani", translation: "That's very kind of you" }],
    "میں": [{ native: "میں کل آواں گا", translit: "main kal aawaan ga", translation: "I'll come tomorrow" }],
    "توں": [{ native: "توں کدھر جا رہیا ایں?", translit: "tun kidhar ja rahiya ain?", translation: "Where are you going?" }],
    "اوہ": [{ native: "اوہ میرا بھرا اے", translit: "oh mera bhraa ae", translation: "He is my brother" }],
    "اسیں": [{ native: "اسیں کل ملاں گے", translit: "asin kal milaan ge", translation: "We'll meet tomorrow" }],
    "کیہ": [{ native: "توں کیہ چاہندا ایں?", translit: "tun kih chaahnda ain?", translation: "What do you want?" }],
    "ٹھیک": [{ native: "سب کجھ ٹھیک ہو جائے گا", translit: "sab kujh theek ho jaave ga", translation: "Everything will be fine" }],
    "ماں": [{ native: "ماں، میں آ رہیا آں", translit: "maan, main aa rahiya aan", translation: "Mum, I'm coming" }],
    "پیو": [{ native: "میرے پیو دا ناں", translit: "mere pio da naan", translation: "My father's name" }],
  },

  // ---------------------------------------------------------------------------
  // German — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  de: {
    "Hallo": [{ native: "Hallo, ich bin neu hier.", translation: "Hello, I'm new here." }],
    "Guten Morgen": [{ native: "Guten Morgen! Hast du gut geschlafen?", translation: "Good morning! Did you sleep well?" }],
    "Tschüss": [{ native: "Tschüss, wir sehen uns.", translation: "Bye, see you around." }],
    "Bitte": [{ native: "Wie bitte? Ich habe das nicht verstanden.", translation: "Sorry? I didn't understand that." }],
    "Danke": [{ native: "Danke für deine Hilfe.", translation: "Thanks for your help." }],
    "Entschuldigung": [{ native: "Entschuldigung, ich habe mich verspätet.", translation: "Sorry, I'm late." }],
    "Ja": [{ native: "Ja, das stimmt.", translation: "Yes, that's right." }],
    "Nein": [{ native: "Nein, heute nicht.", translation: "No, not today." }],
    "ich": [{ native: "Ich komme aus London.", translation: "I come from London." }],
    "du": [{ native: "Was machst du gerade?", translation: "What are you doing right now?" }],
    "Sie": [{ native: "Wohnen Sie hier in der Nähe?", translation: "Do you live near here?" }],
    "heißen": [{ native: "Wie heißt dieses Wort auf Deutsch?", translation: "What is this word called in German?" }],
  },

  // ---------------------------------------------------------------------------
  // Turkish — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  tr: {
    "Merhaba": [{ native: "Merhaba, tanıştığımıza memnun oldum.", translation: "Hello, nice to meet you." }],
    "Günaydın": [{ native: "Günaydın! İyi uyudun mu?", translation: "Good morning! Did you sleep well?" }],
    "İyi geceler": [{ native: "Geç oldu, iyi geceler.", translation: "It's late, good night." }],
    "Hoşça kal": [{ native: "Hoşça kal, kendine iyi bak.", translation: "Goodbye, take care of yourself." }],
    "Görüşürüz": [{ native: "Yarın görüşürüz.", translation: "See you tomorrow." }],
    "İyiyim": [{ native: "Teşekkürler, iyiyim.", translation: "Thanks, I'm fine." }],
    "Teşekkür ederim": [{ native: "Yardımın için teşekkür ederim.", translation: "Thank you for your help." }],
    "Lütfen": [{ native: "Lütfen yavaş konuşun.", translation: "Please speak slowly." }],
    "Evet": [{ native: "Evet, katılıyorum.", translation: "Yes, I agree." }],
    "Hayır": [{ native: "Hayır, bugün değil.", translation: "No, not today." }],
  },

  // ---------------------------------------------------------------------------
  // Indonesian — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  id: {
    "Halo": [{ native: "Halo, senang bertemu denganmu", translation: "Hello, nice to meet you" }],
    "Selamat pagi": [{ native: "Selamat pagi, tidur nyenyak?", translation: "Good morning, did you sleep well?" }],
    "Terima kasih": [{ native: "Terima kasih atas bantuanmu", translation: "Thank you for your help" }],
    "Tolong": [{ native: "Tolong bicara pelan-pelan", translation: "Please speak slowly" }],
    "Maaf": [{ native: "Maaf, saya tidak mengerti", translation: "Sorry, I don't understand" }],
    "Ya": [{ native: "Ya, saya setuju", translation: "Yes, I agree" }],
    "Tidak": [{ native: "Tidak, bukan hari ini", translation: "No, not today" }],
    "Saya": [{ native: "Saya mau pulang sekarang", translation: "I want to go home now" }],
    "Anda": [{ native: "Di mana Anda tinggal?", translation: "Where do you live?" }],
    "Dia": [{ native: "Dia tidak datang hari ini", translation: "He didn't come today" }],
    "Selamat malam": [{ native: "Sudah larut, selamat malam", translation: "It's late, good night" }],
    "Sama-sama": [{ native: "Sama-sama, tidak apa-apa", translation: "You're welcome, it's nothing" }],
  },

  // ---------------------------------------------------------------------------
  // Nigerian Pidgin — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  pcm: {
    "How far": [{ native: "How far, wetin dey happen?", translation: "Hey, what's going on?" }],
    "How you dey": [{ native: "How you dey since morning?", translation: "How have you been since morning?" }],
    "I dey fine": [{ native: "I dey fine, no wahala", translation: "I'm fine, no problem" }],
    "Thank you": [{ native: "Thank you well well", translation: "Thank you very much" }],
    "No wahala": [{ native: "No wahala, I go do am", translation: "No problem, I'll do it" }],
    "Sorry": [{ native: "Sorry say I late", translation: "Sorry that I'm late" }],
    "Bye-bye": [{ native: "Bye-bye, make you take care", translation: "Bye, take care" }],
    "Welcome": [{ native: "You welcome, siddon", translation: "You're welcome, sit down" }],
    "I": [{ native: "I go call you tomorrow", translation: "I'll call you tomorrow" }],
    "You": [{ native: "Wetin you want?", translation: "What do you want?" }],
    "Im": [{ native: "Im no come today", translation: "He didn't come today" }],
    "We": [{ native: "We go go together", translation: "We'll go together" }],
    "Dem": [{ native: "Dem no dey house", translation: "They're not at home" }],
  },

  // ---------------------------------------------------------------------------
  // Tagalog — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  tl: {
    "Kumusta": [{ native: "Kumusta ang pamilya mo?", translation: "How is your family?" }],
    "Magandang umaga": [{ native: "Magandang umaga, mahimbing ba ang tulog mo?", translation: "Good morning, did you sleep well?" }],
    "Paalam": [{ native: "Paalam, mag-iingat ka", translation: "Goodbye, take care" }],
    "Ingat": [{ native: "Ingat, kita tayo bukas", translation: "Take care, see you tomorrow" }],
    "Mabuti": [{ native: "Mabuti na ang lahat ngayon", translation: "Everything is fine now" }],
    "Oo": [{ native: "Oo, alam ko", translation: "Yes, I know" }],
    "Hindi": [{ native: "Hindi ko naiintindihan", translation: "I don't understand" }],
    "opo": [{ native: "Opo, kumain na po ako", translation: "Yes, I have eaten" }],
    "Salamat": [{ native: "Salamat sa tulong mo", translation: "Thanks for your help" }],
    "Pasensya na": [{ native: "Pasensya na, na-late ako", translation: "Sorry, I was late" }],
    "Pakiusap": [{ native: "Pakiusap, dahan-dahan po", translation: "Please, slowly" }],
    "Magandang gabi": [{ native: "Gabi na, magandang gabi", translation: "It's late, good night" }],
  },

  // ---------------------------------------------------------------------------
  // Somali — a second frame, in a different grammatical role.
  // ---------------------------------------------------------------------------
  so: {
    "Salaan": [{ native: "Salaan qoyskaaga", translation: "Greetings to your family" }],
    "Nabad": [{ native: "Waan nabad qabaa, mahadsanid", translation: "I am well, thank you" }],
    "Nabad gelyo": [{ native: "Nabad gelyo, is ilaali", translation: "Goodbye, take care of yourself" }],
    "Haa": [{ native: "Haa, waan garanayaa", translation: "Yes, I know" }],
    "Maya": [{ native: "Maya, maanta maya", translation: "No, not today" }],
    "Subax wanaagsan": [{ native: "Subax wanaagsan, ma hurdo wanaagsan?", translation: "Good morning, did you sleep well?" }],
    "Mahadsanid": [{ native: "Mahadsanid caawimaaddaada", translation: "Thank you for your help" }],
    "Fadlan": [{ native: "Fadlan si tartiib ah u hadal", translation: "Please speak slowly" }],
    "Waan ka xumahay": [{ native: "Waan ka xumahay, ma fahmin", translation: "I'm sorry, I didn't understand" }],
    "aniga": [{ native: "Aniga ma aqaan", translation: "I don't know" }],
    "adiga": [{ native: "Adiga maxaad rabtaa?", translation: "What do you want?" }],
    "Habeen wanaagsan": [{ native: "Waa goor dambe, habeen wanaagsan", translation: "It's late, good night" }],
  },
};

/** Get the merged examples list for a vocab item (existing + extras, deduped). */
export function mergeExamples(langCode, lemma, existingExamples = []) {
  const extras = (EXTRA_EXAMPLES[langCode] || {})[lemma] || [];
  if (extras.length === 0) return existingExamples;
  // Dedupe by native string (in case existing already overlaps)
  const seen = new Set(existingExamples.map((e) => e.native));
  const merged = [...existingExamples];
  for (const ex of extras) {
    if (!seen.has(ex.native)) {
      merged.push(ex);
      seen.add(ex.native);
    }
  }
  return merged;
}
