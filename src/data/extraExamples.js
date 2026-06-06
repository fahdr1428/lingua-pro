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
    "Pan": [{ native: "Pan fresco", translation: "Fresh bread" }],
    "Leche": [{ native: "Leche caliente", translation: "Hot milk" }],
    "Casa": [{ native: "Mi casa es grande", translation: "My house is big" }],
    "Comida": [{ native: "La comida está lista", translation: "The food is ready" }],
    "Amigo": [{ native: "Mi mejor amigo", translation: "My best friend" }],
    "Madre": [{ native: "Mi madre cocina bien", translation: "My mother cooks well" }],
    "Padre": [{ native: "El padre de Ana", translation: "Ana's father" }],
    "Yo": [{ native: "Yo también", translation: "Me too" }],
    "Tú": [{ native: "¿Y tú?", translation: "And you?" }],
    "Ser": [{ native: "Soy estudiante", translation: "I am a student" }],
    "Tener": [{ native: "Tengo hambre", translation: "I am hungry (lit. I have hunger)" }],
    "Querer": [{ native: "Quiero más", translation: "I want more" }],
    "Comer": [{ native: "Vamos a comer", translation: "Let's go eat" }],
    "Ir": [{ native: "Voy a casa", translation: "I'm going home" }],
    "Grande": [{ native: "Una casa grande", translation: "A big house" }],
    "Pequeño": [{ native: "Un libro pequeño", translation: "A small book" }],
    "Hoy": [{ native: "Hoy es lunes", translation: "Today is Monday" }],
    "Mañana": [{ native: "Hasta mañana", translation: "Until tomorrow" }],
    "Uno": [{ native: "Uno, dos, tres", translation: "One, two, three" }],
    "Dos": [{ native: "Dos cafés, por favor", translation: "Two coffees, please" }],
    "Tres": [{ native: "Tres amigos", translation: "Three friends" }],
    "Feliz": [{ native: "Muy feliz", translation: "Very happy" }],
    "Cansado": [{ native: "Estoy cansado", translation: "I am tired" }],
    "Hambre": [{ native: "Tengo mucha hambre", translation: "I'm very hungry" }],
    "Rojo": [{ native: "Un coche rojo", translation: "A red car" }],
    "Azul": [{ native: "El cielo azul", translation: "The blue sky" }],
    "De nada": [{ native: "De nada, fue un placer", translation: "You're welcome, my pleasure" }],
    "Hermano": [{ native: "Mi hermano mayor", translation: "My older brother" }],
    "Hermana": [{ native: "Una hermana pequeña", translation: "A little sister" }],
    "Escuela": [{ native: "Voy a la escuela", translation: "I go to school" }],
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
    "Merci": [{ native: "Merci beaucoup", translation: "Thank you very much" }],
    "S'il vous plaît": [{ native: "Un café, s'il vous plaît", translation: "A coffee, please" }],
    "Oui": [{ native: "Oui, bien sûr", translation: "Yes, of course" }],
    "Non": [{ native: "Non, merci", translation: "No, thank you" }],
    "Au revoir": [{ native: "Au revoir, à demain", translation: "Goodbye, see you tomorrow" }],
    "Bonsoir": [{ native: "Bonsoir, madame", translation: "Good evening, madam" }],
    "Eau": [{ native: "De l'eau froide", translation: "Some cold water" }],
    "Café": [{ native: "Un café au lait", translation: "A coffee with milk" }],
    "Pain": [{ native: "Du pain frais", translation: "Some fresh bread" }],
    "Lait": [{ native: "Lait chaud", translation: "Hot milk" }],
    "Maison": [{ native: "Ma maison est petite", translation: "My house is small" }],
    "Ami": [{ native: "Mon meilleur ami", translation: "My best friend" }],
    "Mère": [{ native: "Ma mère est gentille", translation: "My mother is kind" }],
    "Père": [{ native: "Le père de Marie", translation: "Marie's father" }],
    "Je": [{ native: "Je sais", translation: "I know" }],
    "Tu": [{ native: "Et toi ?", translation: "And you?" }],
    "Être": [{ native: "Je suis étudiant", translation: "I am a student" }],
    "Avoir": [{ native: "J'ai faim", translation: "I am hungry (lit. I have hunger)" }],
    "Manger": [{ native: "On va manger", translation: "We're going to eat" }],
    "Aller": [{ native: "Je vais à la maison", translation: "I'm going home" }],
    "Grand": [{ native: "Une grande maison", translation: "A big house" }],
    "Petit": [{ native: "Un petit livre", translation: "A small book" }],
    "Aujourd'hui": [{ native: "Aujourd'hui, c'est lundi", translation: "Today is Monday" }],
    "Demain": [{ native: "À demain", translation: "See you tomorrow" }],
    "Un": [{ native: "Un, deux, trois", translation: "One, two, three" }],
    "Deux": [{ native: "Deux cafés, s'il vous plaît", translation: "Two coffees, please" }],
    "Trois": [{ native: "Trois amis", translation: "Three friends" }],
    "Heureux": [{ native: "Très heureux", translation: "Very happy" }],
    "Fatigué": [{ native: "Je suis fatigué", translation: "I am tired" }],
    "Faim": [{ native: "J'ai très faim", translation: "I'm very hungry" }],
    "Rouge": [{ native: "Une voiture rouge", translation: "A red car" }],
    "Bleu": [{ native: "Le ciel bleu", translation: "The blue sky" }],
    "Frère": [{ native: "Mon grand frère", translation: "My big brother" }],
    "Sœur": [{ native: "Ma petite sœur", translation: "My little sister" }],
    "École": [{ native: "Je vais à l'école", translation: "I go to school" }],
    "Jour": [{ native: "Un beau jour", translation: "A beautiful day" }],
    "Nuit": [{ native: "Bonne nuit", translation: "Good night" }],
    "Bien": [{ native: "Je vais très bien", translation: "I am very well" }],
    "Froid": [{ native: "Il fait très froid", translation: "It is very cold" }],
    "Chaud": [{ native: "L'eau est chaude", translation: "The water is hot" }],
  },

  // ---------------------------------------------------------------------------
  // Urdu — keys match ur.json lemmas EXACTLY. Dropped 4 that don't exist as
  // standalone vocab (ہونا، کتاب، لال، نیلا) — better than wrong entries.
  // ---------------------------------------------------------------------------
  ur: {
    "سلام": [{ native: "سلام دوست", translation: "Hello, friend" }],
    "شکریہ": [{ native: "بہت بہت شکریہ", translation: "Thank you very much" }],
    "ہاں": [{ native: "ہاں، بالکل", translation: "Yes, of course" }],
    "نہیں": [{ native: "نہیں، شکریہ", translation: "No, thank you" }],
    "خدا حافظ": [{ native: "خدا حافظ، کل ملیں گے", translation: "Goodbye, see you tomorrow" }],
    "براہ کرم": [{ native: "ایک کپ چائے، براہ کرم", translation: "One cup of tea, please" }],
    "معاف کریں": [{ native: "معاف کریں، میں نے سنا نہیں", translation: "Sorry, I didn't hear" }],
    "پانی": [{ native: "ٹھنڈا پانی چاہیے", translation: "I need cold water" }],
    "چائے": [{ native: "ایک کپ چائے", translation: "A cup of tea" }],
    "روٹی": [{ native: "تازی روٹی", translation: "Fresh bread" }],
    "دودھ": [{ native: "گرم دودھ", translation: "Hot milk" }],
    "گھر": [{ native: "میرا گھر بڑا ہے", translation: "My house is big" }],
    "کھانا": [{ native: "کھانا تیار ہے", translation: "The food is ready" }],
    "دوست": [{ native: "میرا اچھا دوست", translation: "My good friend" }],
    "ماں": [{ native: "میری ماں بہت اچھی ہیں", translation: "My mother is very kind" }],
    "باپ": [{ native: "میرا باپ", translation: "My father" }],
    "میں": [{ native: "میں بھی", translation: "Me too" }],
    "آپ": [{ native: "آپ کیسے ہیں؟", translation: "How are you?" }],
    "جانا": [{ native: "میں گھر جا رہا ہوں", translation: "I am going home" }],
    "اچھا": [{ native: "بہت اچھا", translation: "Very good" }],
    "بڑا": [{ native: "بڑا گھر", translation: "Big house" }],
    "چھوٹا": [{ native: "چھوٹا بچہ", translation: "Small child" }],
    "آج": [{ native: "آج سوموار ہے", translation: "Today is Monday" }],
    "کل": [{ native: "کل ملیں گے", translation: "See you tomorrow" }],
    "ایک": [{ native: "ایک، دو، تین", translation: "One, two, three" }],
    "دو": [{ native: "دو کپ چائے", translation: "Two cups of tea" }],
    "تین": [{ native: "تین دوست", translation: "Three friends" }],
    "خوش": [{ native: "بہت خوش", translation: "Very happy" }],
    "تھکا": [{ native: "میں تھکا ہوں", translation: "I am tired" }],
    "بھوک": [{ native: "مجھے بہت بھوک ہے", translation: "I'm very hungry" }],
    "بھائی": [{ native: "میرا بڑا بھائی", translation: "My older brother" }],
    "بہن": [{ native: "میری چھوٹی بہن", translation: "My younger sister" }],
    "اسکول": [{ native: "میں اسکول جاتا ہوں", translation: "I go to school" }],
    "دن": [{ native: "اچھا دن", translation: "A good day" }],
    "رات": [{ native: "اچھی رات", translation: "Good night" }],
    "ٹھیک": [{ native: "میں ٹھیک ہوں", translation: "I am fine" }],
    "ٹھنڈا": [{ native: "ٹھنڈا پانی", translation: "Cold water" }],
    "گرم": [{ native: "گرم چائے", translation: "Hot tea" }],
  },

  // ---------------------------------------------------------------------------
  // Hindi — keys match hi.json lemmas EXACTLY. All 27 verified earlier.
  // ---------------------------------------------------------------------------
  hi: {
    "नमस्ते": [{ native: "नमस्ते दोस्त", translation: "Hello, friend" }],
    "धन्यवाद": [{ native: "बहुत बहुत धन्यवाद", translation: "Thank you very much" }],
    "हाँ": [{ native: "हाँ, ज़रूर", translation: "Yes, of course" }],
    "नहीं": [{ native: "नहीं, धन्यवाद", translation: "No, thank you" }],
    "अलविदा": [{ native: "अलविदा, कल मिलेंगे", translation: "Goodbye, see you tomorrow" }],
    "कृपया": [{ native: "कृपया बैठिए", translation: "Please sit down" }],
    "माफ़ करना": [{ native: "माफ़ करना, मुझे देर हो गई", translation: "Sorry, I'm late" }],
    "पानी": [{ native: "ठंडा पानी चाहिए", translation: "I need cold water" }],
    "चाय": [{ native: "एक कप चाय", translation: "A cup of tea" }],
    "रोटी": [{ native: "ताज़ी रोटी", translation: "Fresh bread" }],
    "दूध": [{ native: "गरम दूध", translation: "Hot milk" }],
    "घर": [{ native: "मेरा घर बड़ा है", translation: "My house is big" }],
    "खाना": [{ native: "खाना तैयार है", translation: "The food is ready" }],
    "दोस्त": [{ native: "मेरा अच्छा दोस्त", translation: "My good friend" }],
    "माँ": [{ native: "मेरी माँ", translation: "My mother" }],
    "पिता": [{ native: "मेरे पिता", translation: "My father" }],
    "मैं": [{ native: "मैं भी", translation: "Me too" }],
    "आप": [{ native: "आप कैसे हैं?", translation: "How are you?" }],
    "जाना": [{ native: "मैं घर जा रहा हूँ", translation: "I am going home" }],
    "अच्छा": [{ native: "बहुत अच्छा", translation: "Very good" }],
    "बड़ा": [{ native: "बड़ा घर", translation: "Big house" }],
    "छोटा": [{ native: "छोटा बच्चा", translation: "Small child" }],
    "आज": [{ native: "आज सोमवार है", translation: "Today is Monday" }],
    "कल": [{ native: "कल मिलेंगे", translation: "See you tomorrow" }],
    "खुश": [{ native: "बहुत खुश", translation: "Very happy" }],
    "थका": [{ native: "मैं थका हूँ", translation: "I am tired" }],
    "भूखा": [{ native: "मुझे बहुत भूख है", translation: "I'm very hungry" }],
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
