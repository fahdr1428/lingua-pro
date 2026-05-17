// =============================================================================
// CONVERSATION STARTERS — a browsable phrasebook of real, practical exchanges.
// NOT tested or gated. Users freely explore at their own pace. This is the
// lightweight bridge between the Reading feature and the future scripted
// conversation-partner: practical, high-frequency, culturally-safe phrases.
//
// Each item: { id, situation, emoji, lines: [{ native, translit, translation,
// note? }] }  — `note` gives a usage/cultural tip where it genuinely helps.
//
// Confidence note: these are deliberately the SAFEST, highest-frequency
// expressions (greetings, politeness, basic needs) — not idioms.
// =============================================================================

export const CONVERSATIONS = {
  // ===========================================================================
  // SPANISH
  // ===========================================================================
  es: [
    { id: "es_c1", situation: "Greeting someone", emoji: "👋", lines: [
      { native: "¡Hola! ¿Qué tal?", translit: "ola, ke tal", translation: "Hi! How's it going?" },
      { native: "Muy bien, ¿y tú?", translit: "muy byen, ee too", translation: "Very well, and you?" },
    ]},
    { id: "es_c2", situation: "Introducing yourself", emoji: "🤝", lines: [
      { native: "Me llamo Ana.", translit: "me yamo ana", translation: "My name is Ana." },
      { native: "Mucho gusto.", translit: "mucho gusto", translation: "Nice to meet you.", note: "Literally 'much pleasure' — the standard polite response." },
    ]},
    { id: "es_c3", situation: "Ordering a coffee", emoji: "☕", lines: [
      { native: "Un café, por favor.", translit: "un kafe por favor", translation: "A coffee, please." },
      { native: "¿Algo más?", translit: "algo mas", translation: "Anything else?" },
      { native: "No, gracias.", translit: "no grasyas", translation: "No, thank you." },
    ]},
    { id: "es_c4", situation: "Asking for the price", emoji: "💶", lines: [
      { native: "¿Cuánto cuesta?", translit: "kwanto kwesta", translation: "How much does it cost?" },
      { native: "Son cinco euros.", translit: "son sinko euros", translation: "It's five euros." },
    ]},
    { id: "es_c5", situation: "Asking for directions", emoji: "🗺️", lines: [
      { native: "¿Dónde está el baño?", translit: "donde esta el banyo", translation: "Where is the bathroom?" },
      { native: "Allí, a la derecha.", translit: "ayee a la derecha", translation: "There, to the right." },
    ]},
    { id: "es_c6", situation: "Saying you don't understand", emoji: "🤔", lines: [
      { native: "No entiendo.", translit: "no entyendo", translation: "I don't understand." },
      { native: "¿Puede repetir, por favor?", translit: "pwede repeteer por favor", translation: "Can you repeat, please?" },
    ]},
    { id: "es_c7", situation: "Apologizing", emoji: "🙏", lines: [
      { native: "Lo siento.", translit: "lo syento", translation: "I'm sorry." },
      { native: "No pasa nada.", translit: "no pasa nada", translation: "It's no problem.", note: "Literally 'nothing happens' — a very common, friendly reassurance." },
    ]},
    { id: "es_c8", situation: "Asking how someone is", emoji: "💬", lines: [
      { native: "¿Cómo estás?", translit: "komo estas", translation: "How are you?" },
      { native: "Estoy cansado, pero bien.", translit: "estoy kansado pero byen", translation: "I'm tired, but well." },
    ]},
    { id: "es_c9", situation: "Saying goodbye", emoji: "👋", lines: [
      { native: "Tengo que irme.", translit: "tengo ke eerme", translation: "I have to go." },
      { native: "¡Hasta luego!", translit: "asta lwego", translation: "See you later!" },
    ]},
    { id: "es_c10", situation: "At a restaurant", emoji: "🍽️", lines: [
      { native: "La cuenta, por favor.", translit: "la kwenta por favor", translation: "The bill, please." },
      { native: "Enseguida.", translit: "ensegida", translation: "Right away." },
    ]},
    { id: "es_c11", situation: "Wishing someone well", emoji: "✨", lines: [
      { native: "¡Que tengas un buen día!", translit: "ke tengas un bwen dia", translation: "Have a good day!" },
      { native: "¡Igualmente!", translit: "eegwalmente", translation: "You too!" },
    ]},
  ],

  // ===========================================================================
  // FRENCH
  // ===========================================================================
  fr: [
    { id: "fr_c1", situation: "Greeting someone", emoji: "👋", lines: [
      { native: "Bonjour ! Ça va ?", translit: "bonzhoor sa va", translation: "Hello! How are you?" },
      { native: "Ça va bien, merci.", translit: "sa va byan mehrsee", translation: "I'm well, thank you." },
    ]},
    { id: "fr_c2", situation: "Introducing yourself", emoji: "🤝", lines: [
      { native: "Je m'appelle Marie.", translit: "zhuh mapell maree", translation: "My name is Marie." },
      { native: "Enchanté.", translit: "onshontay", translation: "Nice to meet you.", note: "Say 'enchantée' (same sound) if you are female." },
    ]},
    { id: "fr_c3", situation: "Ordering at a café", emoji: "☕", lines: [
      { native: "Un café, s'il vous plaît.", translit: "un kafay seel voo play", translation: "A coffee, please." },
      { native: "Bien sûr.", translit: "byan soor", translation: "Of course." },
    ]},
    { id: "fr_c4", situation: "Asking the price", emoji: "💶", lines: [
      { native: "C'est combien ?", translit: "say kombyan", translation: "How much is it?" },
      { native: "Cinq euros.", translit: "sank uhro", translation: "Five euros." },
    ]},
    { id: "fr_c5", situation: "Asking for directions", emoji: "🗺️", lines: [
      { native: "Où sont les toilettes ?", translit: "oo son lay twalet", translation: "Where are the toilets?" },
      { native: "Là-bas, à gauche.", translit: "la-ba a gohsh", translation: "Over there, on the left." },
    ]},
    { id: "fr_c6", situation: "Not understanding", emoji: "🤔", lines: [
      { native: "Je ne comprends pas.", translit: "zhuh nuh kompron pa", translation: "I don't understand." },
      { native: "Pouvez-vous répéter ?", translit: "poovay voo raypaytay", translation: "Can you repeat?" },
    ]},
    { id: "fr_c7", situation: "Apologizing", emoji: "🙏", lines: [
      { native: "Excusez-moi.", translit: "ekskoozay mwa", translation: "Excuse me / I'm sorry." },
      { native: "Ce n'est pas grave.", translit: "suh nay pa grav", translation: "It's not serious / no worries." },
    ]},
    { id: "fr_c8", situation: "Asking how someone is", emoji: "💬", lines: [
      { native: "Comment allez-vous ?", translit: "komon talay voo", translation: "How are you? (polite)" },
      { native: "Je vais bien, merci.", translit: "zhuh vay byan mehrsee", translation: "I'm well, thank you." },
    ]},
    { id: "fr_c9", situation: "Saying goodbye", emoji: "👋", lines: [
      { native: "Je dois y aller.", translit: "zhuh dwa ee alay", translation: "I have to go." },
      { native: "À bientôt !", translit: "a byantoh", translation: "See you soon!" },
    ]},
    { id: "fr_c10", situation: "At a restaurant", emoji: "🍽️", lines: [
      { native: "L'addition, s'il vous plaît.", translit: "ladisyon seel voo play", translation: "The bill, please." },
      { native: "Tout de suite.", translit: "toot sweet", translation: "Right away." },
    ]},
    { id: "fr_c11", situation: "Wishing someone well", emoji: "✨", lines: [
      { native: "Bonne journée !", translit: "bon zhoornay", translation: "Have a good day!" },
      { native: "Vous aussi !", translit: "vooz osee", translation: "You too!" },
    ]},
  ],

  // ===========================================================================
  // URDU
  // ===========================================================================
  ur: [
    { id: "ur_c1", situation: "Greeting someone", emoji: "👋", lines: [
      { native: "السلام علیکم", translit: "assalam-o-alaikum", translation: "Peace be upon you (hello).", note: "The universal Muslim greeting — appropriate any time, to anyone." },
      { native: "وعلیکم السلام", translit: "wa-alaikum-assalam", translation: "And peace be upon you (reply)." },
    ]},
    { id: "ur_c2", situation: "Asking how someone is", emoji: "💬", lines: [
      { native: "آپ کیسے ہیں؟", translit: "aap kaise hain?", translation: "How are you? (polite)" },
      { native: "میں ٹھیک ہوں، شکریہ", translit: "main theek hoon, shukriya", translation: "I'm fine, thank you." },
    ]},
    { id: "ur_c3", situation: "Introducing yourself", emoji: "🤝", lines: [
      { native: "میرا نام علی ہے", translit: "mera naam Ali hai", translation: "My name is Ali." },
      { native: "آپ سے مل کر خوشی ہوئی", translit: "aap se mil kar khushi hui", translation: "Pleased to meet you." },
    ]},
    { id: "ur_c4", situation: "Saying thank you", emoji: "🙏", lines: [
      { native: "بہت شکریہ", translit: "bahut shukriya", translation: "Thank you very much." },
      { native: "کوئی بات نہیں", translit: "koi baat nahin", translation: "It's nothing / you're welcome." },
    ]},
    { id: "ur_c5", situation: "Asking for water", emoji: "💧", lines: [
      { native: "پانی مل سکتا ہے؟", translit: "paani mil sakta hai?", translation: "Could I get some water?" },
      { native: "جی بالکل", translit: "ji bilkul", translation: "Yes, of course.", note: "'Ji' adds politeness — common when speaking respectfully." },
    ]},
    { id: "ur_c6", situation: "Talking to an elder", emoji: "🧓", lines: [
      { native: "آپ کی طبیعت کیسی ہے؟", translit: "aap ki tabiyat kaisi hai?", translation: "How is your health? (respectful)" },
      { native: "اللہ کا شکر ہے", translit: "Allah ka shukar hai", translation: "Thank God (I'm well).", note: "A very common, warm response — especially among family." },
    ]},
    { id: "ur_c7", situation: "Not understanding", emoji: "🤔", lines: [
      { native: "مجھے سمجھ نہیں آیا", translit: "mujhe samajh nahin aaya", translation: "I didn't understand." },
      { native: "دوبارہ کہیں", translit: "dobara kahein", translation: "Please say it again." },
    ]},
    { id: "ur_c8", situation: "Apologizing", emoji: "🙇", lines: [
      { native: "معاف کیجیے", translit: "maaf kijiye", translation: "Forgive me / excuse me." },
      { native: "کوئی بات نہیں", translit: "koi baat nahin", translation: "It's no problem." },
    ]},
    { id: "ur_c9", situation: "Saying goodbye", emoji: "👋", lines: [
      { native: "اب مجھے جانا ہے", translit: "ab mujhe jana hai", translation: "I have to go now." },
      { native: "خدا حافظ", translit: "khuda hafiz", translation: "Goodbye.", note: "Literally 'God protect you' — the standard farewell." },
    ]},
    { id: "ur_c10", situation: "Being a guest", emoji: "🫖", lines: [
      { native: "چائے پیجیے", translit: "chai pijiye", translation: "Please have some tea.", note: "Refusing tea once before accepting is a common politeness ritual." },
      { native: "بہت مہربانی", translit: "bahut meharbani", translation: "Very kind of you." },
    ]},
    { id: "ur_c11", situation: "Wishing someone well", emoji: "✨", lines: [
      { native: "اللہ آپ کا بھلا کرے", translit: "Allah aap ka bhala kare", translation: "May God do you good." },
      { native: "آمین", translit: "ameen", translation: "Amen." },
    ]},
  ],

  // ===========================================================================
  // HINDI
  // ===========================================================================
  hi: [
    { id: "hi_c1", situation: "Greeting someone", emoji: "🙏", lines: [
      { native: "नमस्ते", translit: "namaste", translation: "Hello / greetings.", note: "Respectful and universal — often said with palms together." },
      { native: "नमस्ते, कैसे हैं आप?", translit: "namaste, kaise hain aap?", translation: "Hello, how are you?" },
    ]},
    { id: "hi_c2", situation: "Asking how someone is", emoji: "💬", lines: [
      { native: "आप कैसे हैं?", translit: "aap kaise hain?", translation: "How are you? (polite)" },
      { native: "मैं ठीक हूँ, धन्यवाद", translit: "main theek hoon, dhanyavaad", translation: "I'm fine, thank you." },
    ]},
    { id: "hi_c3", situation: "Introducing yourself", emoji: "🤝", lines: [
      { native: "मेरा नाम राज है", translit: "mera naam Raj hai", translation: "My name is Raj." },
      { native: "आपसे मिलकर खुशी हुई", translit: "aapse milkar khushi hui", translation: "Pleased to meet you." },
    ]},
    { id: "hi_c4", situation: "Saying thank you", emoji: "🙏", lines: [
      { native: "बहुत धन्यवाद", translit: "bahut dhanyavaad", translation: "Thank you very much." },
      { native: "कोई बात नहीं", translit: "koi baat nahin", translation: "It's nothing." },
    ]},
    { id: "hi_c5", situation: "Asking for water", emoji: "💧", lines: [
      { native: "पानी मिल सकता है?", translit: "paani mil sakta hai?", translation: "Could I get some water?" },
      { native: "जी हाँ", translit: "ji haan", translation: "Yes." },
    ]},
    { id: "hi_c6", situation: "Not understanding", emoji: "🤔", lines: [
      { native: "मुझे समझ नहीं आया", translit: "mujhe samajh nahin aaya", translation: "I didn't understand." },
      { native: "फिर से कहिए", translit: "phir se kahiye", translation: "Please say it again." },
    ]},
    { id: "hi_c7", situation: "Apologizing", emoji: "🙇", lines: [
      { native: "माफ़ कीजिए", translit: "maaf kijiye", translation: "Excuse me / forgive me." },
      { native: "कोई बात नहीं", translit: "koi baat nahin", translation: "No problem." },
    ]},
    { id: "hi_c8", situation: "Asking the price", emoji: "💰", lines: [
      { native: "यह कितने का है?", translit: "yeh kitne ka hai?", translation: "How much is this?" },
      { native: "सौ रुपये", translit: "sau rupaye", translation: "One hundred rupees." },
    ]},
    { id: "hi_c9", situation: "Saying goodbye", emoji: "👋", lines: [
      { native: "अब मुझे जाना है", translit: "ab mujhe jana hai", translation: "I have to go now." },
      { native: "फिर मिलेंगे", translit: "phir milenge", translation: "We'll meet again." },
    ]},
    { id: "hi_c10", situation: "Being a guest", emoji: "🫖", lines: [
      { native: "चाय लीजिए", translit: "chai lijiye", translation: "Please have some tea." },
      { native: "बहुत मेहरबानी", translit: "bahut meharbani", translation: "Very kind of you." },
    ]},
  ],

  // ===========================================================================
  // ARABIC (Modern Standard / widely understood)
  // ===========================================================================
  ar: [
    { id: "ar_c1", situation: "Greeting someone", emoji: "👋", lines: [
      { native: "السلام عليكم", translit: "as-salamu alaykum", translation: "Peace be upon you (hello)." },
      { native: "وعليكم السلام", translit: "wa alaykum as-salam", translation: "And peace be upon you (reply)." },
    ]},
    { id: "ar_c2", situation: "Asking how someone is", emoji: "💬", lines: [
      { native: "كيف حالك؟", translit: "kayfa haluk?", translation: "How are you?" },
      { native: "بخير، الحمد لله", translit: "bikhayr, alhamdulillah", translation: "Fine, praise God.", note: "'Alhamdulillah' is the near-universal response, religious or not." },
    ]},
    { id: "ar_c3", situation: "Introducing yourself", emoji: "🤝", lines: [
      { native: "اسمي أحمد", translit: "ismee Ahmad", translation: "My name is Ahmad." },
      { native: "تشرفنا", translit: "tasharrafna", translation: "Pleased to meet you." },
    ]},
    { id: "ar_c4", situation: "Saying thank you", emoji: "🙏", lines: [
      { native: "شكراً جزيلاً", translit: "shukran jazeelan", translation: "Thank you very much." },
      { native: "عفواً", translit: "afwan", translation: "You're welcome." },
    ]},
    { id: "ar_c5", situation: "Asking for water", emoji: "💧", lines: [
      { native: "ممكن ماء؟", translit: "mumkin maa?", translation: "Could I have water?" },
      { native: "تفضل", translit: "tafaddal", translation: "Here you go.", note: "'Tafaddal' is a versatile polite word for offering something." },
    ]},
    { id: "ar_c6", situation: "Not understanding", emoji: "🤔", lines: [
      { native: "لا أفهم", translit: "la afham", translation: "I don't understand." },
      { native: "مرة أخرى من فضلك", translit: "marra ukhra min fadlik", translation: "Again, please." },
    ]},
    { id: "ar_c7", situation: "Apologizing", emoji: "🙇", lines: [
      { native: "آسف", translit: "aasif", translation: "I'm sorry.", note: "Say 'aasifa' if you are female." },
      { native: "لا بأس", translit: "la ba's", translation: "It's okay." },
    ]},
    { id: "ar_c8", situation: "Asking the price", emoji: "💰", lines: [
      { native: "بكم هذا؟", translit: "bikam hatha?", translation: "How much is this?" },
      { native: "عشرة", translit: "ashara", translation: "Ten." },
    ]},
    { id: "ar_c9", situation: "Saying goodbye", emoji: "👋", lines: [
      { native: "مع السلامة", translit: "ma'a as-salama", translation: "Goodbye (go in safety)." },
      { native: "إلى اللقاء", translit: "ila al-liqaa", translation: "Until we meet again." },
    ]},
    { id: "ar_c10", situation: "Wishing someone well", emoji: "✨", lines: [
      { native: "نهارك سعيد", translit: "naharak sa'eed", translation: "Have a good day." },
      { native: "وأنت كذلك", translit: "wa anta kathalik", translation: "You too." },
    ]},
  ],

  // ===========================================================================
  // BENGALI
  // ===========================================================================
  bn: [
    { id: "bn_c1", situation: "Greeting someone", emoji: "👋", lines: [
      { native: "নমস্কার", translit: "nomoshkar", translation: "Hello / greetings." },
      { native: "আসসালামু আলাইকুম", translit: "assalamu alaikum", translation: "Peace be upon you (hello).", note: "Used among Muslim Bengalis; 'nomoshkar' is more general." },
    ]},
    { id: "bn_c2", situation: "Asking how someone is", emoji: "💬", lines: [
      { native: "আপনি কেমন আছেন?", translit: "apni kemon achhen?", translation: "How are you? (polite)" },
      { native: "ভালো আছি, ধন্যবাদ", translit: "bhalo achhi, dhonnobad", translation: "I'm well, thank you." },
    ]},
    { id: "bn_c3", situation: "Introducing yourself", emoji: "🤝", lines: [
      { native: "আমার নাম রিয়া", translit: "amar nam Riya", translation: "My name is Riya." },
      { native: "আপনার সাথে দেখা হয়ে ভালো লাগলো", translit: "apnar shathe dekha hoye bhalo laglo", translation: "Pleased to meet you." },
    ]},
    { id: "bn_c4", situation: "Saying thank you", emoji: "🙏", lines: [
      { native: "অনেক ধন্যবাদ", translit: "onek dhonnobad", translation: "Thank you very much." },
      { native: "কোনো ব্যাপার না", translit: "kono byapar na", translation: "It's no problem." },
    ]},
    { id: "bn_c5", situation: "Asking for water", emoji: "💧", lines: [
      { native: "একটু পানি পাবো?", translit: "ektu pani pabo?", translation: "Could I get some water?" },
      { native: "হ্যাঁ, নিশ্চয়ই", translit: "hyan, nishchoi", translation: "Yes, of course." },
    ]},
    { id: "bn_c6", situation: "Not understanding", emoji: "🤔", lines: [
      { native: "আমি বুঝিনি", translit: "ami bujhini", translation: "I didn't understand." },
      { native: "আবার বলুন", translit: "abar bolun", translation: "Please say it again." },
    ]},
    { id: "bn_c7", situation: "Apologizing", emoji: "🙇", lines: [
      { native: "দুঃখিত", translit: "dukkhito", translation: "I'm sorry." },
      { native: "ঠিক আছে", translit: "thik achhe", translation: "It's okay." },
    ]},
    { id: "bn_c8", situation: "Asking the price", emoji: "💰", lines: [
      { native: "এটার দাম কত?", translit: "etar dam koto?", translation: "How much is this?" },
      { native: "একশো টাকা", translit: "eksho taka", translation: "One hundred taka." },
    ]},
    { id: "bn_c9", situation: "Saying goodbye", emoji: "👋", lines: [
      { native: "এখন আমাকে যেতে হবে", translit: "ekhon amake jete hobe", translation: "I have to go now." },
      { native: "আবার দেখা হবে", translit: "abar dekha hobe", translation: "We'll meet again." },
    ]},
    { id: "bn_c10", situation: "Being a guest", emoji: "🫖", lines: [
      { native: "চা খান", translit: "cha khan", translation: "Please have some tea." },
      { native: "অনেক ধন্যবাদ", translit: "onek dhonnobad", translation: "Thank you so much." },
    ]},
  ],

  // ===========================================================================
  // KOREAN
  // ===========================================================================
  ko: [
    { id: "ko_c1", situation: "Greeting someone", emoji: "👋", lines: [
      { native: "안녕하세요", translit: "annyeonghaseyo", translation: "Hello (polite).", note: "Safe in almost any situation. Use this, not casual '안녕', with strangers." },
      { native: "네, 안녕하세요", translit: "ne, annyeonghaseyo", translation: "Yes, hello." },
    ]},
    { id: "ko_c2", situation: "Asking how someone is", emoji: "💬", lines: [
      { native: "어떻게 지내세요?", translit: "eotteoke jinaeseyo?", translation: "How have you been?" },
      { native: "잘 지내요, 감사합니다", translit: "jal jinaeyo, gamsahamnida", translation: "I'm doing well, thank you." },
    ]},
    { id: "ko_c3", situation: "Introducing yourself", emoji: "🤝", lines: [
      { native: "저는 민수예요", translit: "jeoneun Minsu-yeyo", translation: "I'm Minsu." },
      { native: "만나서 반갑습니다", translit: "mannaseo bangapseumnida", translation: "Pleased to meet you." },
    ]},
    { id: "ko_c4", situation: "Saying thank you", emoji: "🙏", lines: [
      { native: "감사합니다", translit: "gamsahamnida", translation: "Thank you (polite)." },
      { native: "천만에요", translit: "cheonmaneyo", translation: "You're welcome." },
    ]},
    { id: "ko_c5", situation: "Asking for water", emoji: "💧", lines: [
      { native: "물 좀 주세요", translit: "mul jom juseyo", translation: "Water, please." },
      { native: "네, 여기요", translit: "ne, yeogiyo", translation: "Yes, here you go." },
    ]},
    { id: "ko_c6", situation: "Not understanding", emoji: "🤔", lines: [
      { native: "잘 모르겠어요", translit: "jal moreugesseoyo", translation: "I don't understand." },
      { native: "다시 말해 주세요", translit: "dasi malhae juseyo", translation: "Please say it again." },
    ]},
    { id: "ko_c7", situation: "Apologizing", emoji: "🙇", lines: [
      { native: "죄송합니다", translit: "joesonghamnida", translation: "I'm sorry (polite)." },
      { native: "괜찮아요", translit: "gwaenchanayo", translation: "It's okay." },
    ]},
    { id: "ko_c8", situation: "Asking the price", emoji: "💰", lines: [
      { native: "얼마예요?", translit: "eolmayeyo?", translation: "How much is it?" },
      { native: "오천 원이에요", translit: "ocheon won-ieyo", translation: "It's five thousand won." },
    ]},
    { id: "ko_c9", situation: "Saying goodbye", emoji: "👋", lines: [
      { native: "이제 가야 해요", translit: "ije gaya haeyo", translation: "I have to go now." },
      { native: "안녕히 가세요", translit: "annyeonghi gaseyo", translation: "Goodbye (to person leaving).", note: "Say '안녕히 계세요' to someone who is staying." },
    ]},
    { id: "ko_c10", situation: "At a restaurant", emoji: "🍽️", lines: [
      { native: "이거 주세요", translit: "igeo juseyo", translation: "I'll have this, please." },
      { native: "네, 알겠습니다", translit: "ne, algesseumnida", translation: "Yes, understood." },
    ]},
  ],

  // ===========================================================================
  // JAPANESE
  // ===========================================================================
  ja: [
    { id: "ja_c1", situation: "Greeting someone", emoji: "👋", lines: [
      { native: "こんにちは", translit: "konnichiwa", translation: "Hello / good afternoon." },
      { native: "おはようございます", translit: "ohayou gozaimasu", translation: "Good morning (polite)." },
    ]},
    { id: "ja_c2", situation: "Asking how someone is", emoji: "💬", lines: [
      { native: "お元気ですか？", translit: "ogenki desu ka?", translation: "How are you?" },
      { native: "元気です、ありがとう", translit: "genki desu, arigatou", translation: "I'm well, thank you." },
    ]},
    { id: "ja_c3", situation: "Introducing yourself", emoji: "🤝", lines: [
      { native: "田中です", translit: "Tanaka desu", translation: "I'm Tanaka." },
      { native: "よろしくお願いします", translit: "yoroshiku onegaishimasu", translation: "Pleased to meet you.", note: "A key phrase — used when meeting people and asking favors." },
    ]},
    { id: "ja_c4", situation: "Saying thank you", emoji: "🙏", lines: [
      { native: "ありがとうございます", translit: "arigatou gozaimasu", translation: "Thank you (polite)." },
      { native: "どういたしまして", translit: "dou itashimashite", translation: "You're welcome." },
    ]},
    { id: "ja_c5", situation: "Asking for water", emoji: "💧", lines: [
      { native: "お水をください", translit: "omizu o kudasai", translation: "Water, please." },
      { native: "はい、どうぞ", translit: "hai, douzo", translation: "Yes, here you go." },
    ]},
    { id: "ja_c6", situation: "Not understanding", emoji: "🤔", lines: [
      { native: "わかりません", translit: "wakarimasen", translation: "I don't understand." },
      { native: "もう一度お願いします", translit: "mou ichido onegaishimasu", translation: "Once more, please." },
    ]},
    { id: "ja_c7", situation: "Apologizing", emoji: "🙇", lines: [
      { native: "すみません", translit: "sumimasen", translation: "Excuse me / I'm sorry.", note: "Extremely versatile — apology, getting attention, and 'thanks' all in one." },
      { native: "大丈夫です", translit: "daijoubu desu", translation: "It's okay." },
    ]},
    { id: "ja_c8", situation: "Asking the price", emoji: "💰", lines: [
      { native: "いくらですか？", translit: "ikura desu ka?", translation: "How much is it?" },
      { native: "千円です", translit: "sen en desu", translation: "It's a thousand yen." },
    ]},
    { id: "ja_c9", situation: "Saying goodbye", emoji: "👋", lines: [
      { native: "もう行かないと", translit: "mou ikanai to", translation: "I have to go now." },
      { native: "またね", translit: "mata ne", translation: "See you." },
    ]},
    { id: "ja_c10", situation: "At a restaurant", emoji: "🍽️", lines: [
      { native: "これをください", translit: "kore o kudasai", translation: "I'll have this, please." },
      { native: "かしこまりました", translit: "kashikomarimashita", translation: "Certainly (very polite)." },
    ]},
  ],

  // ===========================================================================
  // MANDARIN
  // ===========================================================================
  zh: [
    { id: "zh_c1", situation: "Greeting someone", emoji: "👋", lines: [
      { native: "你好", translit: "nǐ hǎo", translation: "Hello." },
      { native: "你好，你好吗？", translit: "nǐ hǎo, nǐ hǎo ma?", translation: "Hello, how are you?" },
    ]},
    { id: "zh_c2", situation: "Asking how someone is", emoji: "💬", lines: [
      { native: "你好吗？", translit: "nǐ hǎo ma?", translation: "How are you?" },
      { native: "我很好，谢谢", translit: "wǒ hěn hǎo, xièxie", translation: "I'm very well, thank you." },
    ]},
    { id: "zh_c3", situation: "Introducing yourself", emoji: "🤝", lines: [
      { native: "我叫李明", translit: "wǒ jiào Lǐ Míng", translation: "My name is Li Ming." },
      { native: "很高兴认识你", translit: "hěn gāoxìng rènshi nǐ", translation: "Pleased to meet you." },
    ]},
    { id: "zh_c4", situation: "Saying thank you", emoji: "🙏", lines: [
      { native: "谢谢你", translit: "xièxie nǐ", translation: "Thank you." },
      { native: "不客气", translit: "bù kèqi", translation: "You're welcome." },
    ]},
    { id: "zh_c5", situation: "Asking for water", emoji: "💧", lines: [
      { native: "请给我水", translit: "qǐng gěi wǒ shuǐ", translation: "Please give me water." },
      { native: "好的", translit: "hǎo de", translation: "Okay / sure." },
    ]},
    { id: "zh_c6", situation: "Not understanding", emoji: "🤔", lines: [
      { native: "我不懂", translit: "wǒ bù dǒng", translation: "I don't understand." },
      { native: "请再说一次", translit: "qǐng zài shuō yí cì", translation: "Please say it once more." },
    ]},
    { id: "zh_c7", situation: "Apologizing", emoji: "🙇", lines: [
      { native: "对不起", translit: "duìbuqǐ", translation: "I'm sorry." },
      { native: "没关系", translit: "méi guānxi", translation: "It's okay / no problem." },
    ]},
    { id: "zh_c8", situation: "Asking the price", emoji: "💰", lines: [
      { native: "多少钱？", translit: "duōshǎo qián?", translation: "How much money?" },
      { native: "十块", translit: "shí kuài", translation: "Ten kuai (yuan)." },
    ]},
    { id: "zh_c9", situation: "Saying goodbye", emoji: "👋", lines: [
      { native: "我得走了", translit: "wǒ děi zǒu le", translation: "I have to go." },
      { native: "再见", translit: "zàijiàn", translation: "Goodbye." },
    ]},
    { id: "zh_c10", situation: "At a restaurant", emoji: "🍽️", lines: [
      { native: "我要这个", translit: "wǒ yào zhège", translation: "I want this one." },
      { native: "好的，请稍等", translit: "hǎo de, qǐng shāo děng", translation: "Okay, please wait a moment." },
    ]},
  ],
};

/** All conversations for a language, or [] if none. */
export function getConversations(langCode) {
  return CONVERSATIONS[langCode] || [];
}
