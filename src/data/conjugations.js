// =============================================================================
// CONJUGATIONS — verb forms by person/agreement, per language.
//
// v29 design notes:
//   - Keyed by VOCAB LEMMA (the citation form stored in the language pack).
//   - Each language has only the forms that are pedagogically meaningful for it.
//   - Coverage is deliberately CONSERVATIVE — when in doubt, fewer forms.
//   - Pronouns store the appropriate "subject" word for each language, used
//     to construct natural prompts like "I go" / "she goes".
//
// Per-language confidence (be honest, this matters for what we teach):
//   es, fr           HIGH — standard textbook present tense
//   ur, hi           HIGH — male-speaker masculine present tense (mark gender)
//   ar               MED-HIGH — MSA present (web-verified above)
//   zh               HIGH — no conjugation, only pronoun swap (the lesson)
//   ja               MED  — polite -masu form, person doesn't matter (the lesson)
//   ko               MED  — polite -yo form, person doesn't matter (web-verified)
//   bn               MED-LOW — present habitual, would benefit from native review
//
// IMPORTANT TEACHING NOTE we surface to the learner:
//   For ar/zh/ja/ko/bn, the SAME conjugated form is used across persons in the
//   beginner tense — what changes is the PRONOUN. That's the lesson itself.
// =============================================================================

// Each language defines:
//   pronouns: { I, you, he, she, we, they }   — display strings + translit
//   verbs:    { [vocabLemma]: { I, you, he, she, we, they } }
//             each value is { form, translit }   (no person? omit it)

export const CONJUGATIONS = {
  // ---------------------------------------------------------------------------
  // GERMAN — present indicative. HIGH confidence: standard textbook forms.
  //
  // The teaching point isn't the endings, which are regular and quickly learned.
  // It's that the du and er/sie forms of strong verbs change their STEM VOWEL:
  // sehen → du siehst, sprechen → du sprichst, essen → du isst, helfen → du hilfst.
  // Learners conjugate them regularly (du sehst) and are understood but marked
  // instantly as foreign, so those verbs are over-represented here on purpose.
  //
  // "sie" is both "she" and "they"; the verb form is what tells them apart
  // (sie spricht = she speaks, sie sprechen = they speak). Formal "Sie" takes
  // the same form as "they" — which is why it looks like plural respect, and is.
  // ---------------------------------------------------------------------------
  de: {
    pronouns: {
      I:   { form: "ich", translit: "ikh" },
      you: { form: "du",  translit: "doo" },
      he:  { form: "er",  translit: "air" },
      she: { form: "sie", translit: "zee" },
      we:  { form: "wir", translit: "veer" },
      they:{ form: "sie", translit: "zee" },
    },
    note: "German verbs take an ending for each person. Strong verbs also change their stem vowel in the du and er/sie forms — that's the part worth memorising.",
    verbs: {
      "sein":      { I:{form:"bin",      translit:"bin"},        you:{form:"bist",      translit:"bist"},        he:{form:"ist",      translit:"ist"},        she:{form:"ist",      translit:"ist"},        we:{form:"sind",      translit:"zint"},        they:{form:"sind",      translit:"zint"} },
      "haben":     { I:{form:"habe",     translit:"HAH-buh"},    you:{form:"hast",      translit:"hast"},        he:{form:"hat",      translit:"hat"},        she:{form:"hat",      translit:"hat"},        we:{form:"haben",     translit:"HAH-ben"},     they:{form:"haben",     translit:"HAH-ben"} },
      "gehen":     { I:{form:"gehe",     translit:"GAY-uh"},     you:{form:"gehst",     translit:"gayst"},       he:{form:"geht",     translit:"gayt"},       she:{form:"geht",     translit:"gayt"},       we:{form:"gehen",     translit:"GAY-en"},      they:{form:"gehen",     translit:"GAY-en"} },
      "machen":    { I:{form:"mache",    translit:"MAKH-uh"},    you:{form:"machst",    translit:"makhst"},      he:{form:"macht",    translit:"makht"},      she:{form:"macht",    translit:"makht"},      we:{form:"machen",    translit:"MAKH-en"},     they:{form:"machen",    translit:"MAKH-en"} },
      "sehen":     { I:{form:"sehe",     translit:"ZAY-uh"},     you:{form:"siehst",    translit:"zeest"},       he:{form:"sieht",    translit:"zeet"},       she:{form:"sieht",    translit:"zeet"},       we:{form:"sehen",     translit:"ZAY-en"},      they:{form:"sehen",     translit:"ZAY-en"} },
      "sprechen":  { I:{form:"spreche",  translit:"SHPREKH-uh"}, you:{form:"sprichst",  translit:"shprikhst"},   he:{form:"spricht",  translit:"shprikht"},   she:{form:"spricht",  translit:"shprikht"},   we:{form:"sprechen",  translit:"SHPREKH-en"},  they:{form:"sprechen",  translit:"SHPREKH-en"} },
      "essen":     { I:{form:"esse",     translit:"ES-uh"},      you:{form:"isst",      translit:"ist"},         he:{form:"isst",     translit:"ist"},        she:{form:"isst",     translit:"ist"},        we:{form:"essen",     translit:"ES-en"},       they:{form:"essen",     translit:"ES-en"} },
      "trinken":   { I:{form:"trinke",   translit:"TRINK-uh"},   you:{form:"trinkst",   translit:"trinkst"},     he:{form:"trinkt",   translit:"trinkt"},     she:{form:"trinkt",   translit:"trinkt"},     we:{form:"trinken",   translit:"TRINK-en"},    they:{form:"trinken",   translit:"TRINK-en"} },
      "kommen":    { I:{form:"komme",    translit:"KOM-uh"},     you:{form:"kommst",    translit:"komst"},       he:{form:"kommt",    translit:"komt"},       she:{form:"kommt",    translit:"komt"},       we:{form:"kommen",    translit:"KOM-en"},      they:{form:"kommen",    translit:"KOM-en"} },
      "arbeiten":  { I:{form:"arbeite",  translit:"AR-by-tuh"},  you:{form:"arbeitest", translit:"AR-by-test"},  he:{form:"arbeitet", translit:"AR-by-tet"},  she:{form:"arbeitet", translit:"AR-by-tet"},  we:{form:"arbeiten",  translit:"AR-by-ten"},   they:{form:"arbeiten",  translit:"AR-by-ten"} },
      "kaufen":    { I:{form:"kaufe",    translit:"COW-fuh"},    you:{form:"kaufst",    translit:"cowfst"},      he:{form:"kauft",    translit:"cowft"},      she:{form:"kauft",    translit:"cowft"},      we:{form:"kaufen",    translit:"COW-fen"},     they:{form:"kaufen",    translit:"COW-fen"} },
      "helfen":    { I:{form:"helfe",    translit:"HEL-fuh"},    you:{form:"hilfst",    translit:"hilfst"},      he:{form:"hilft",    translit:"hilft"},      she:{form:"hilft",    translit:"hilft"},      we:{form:"helfen",    translit:"HEL-fen"},     they:{form:"helfen",    translit:"HEL-fen"} },
    },
  },

  // ---------------------------------------------------------------------------
  // SPANISH — present indicative, standard textbook forms
  // ---------------------------------------------------------------------------
  es: {
    pronouns: {
      I:   { form: "yo",       translit: "yo" },
      you: { form: "tú",       translit: "too" },
      he:  { form: "él",       translit: "el" },
      she: { form: "ella",     translit: "EH-ya" },
      we:  { form: "nosotros", translit: "no-SO-tros" },
      they:{ form: "ellos",    translit: "EH-yos" },
    },
    verbs: {
      "Ir":       { I:{form:"voy",  translit:"voy"},   you:{form:"vas",  translit:"vas"},   he:{form:"va",  translit:"va"},   she:{form:"va",  translit:"va"},   we:{form:"vamos",   translit:"VA-mos"},   they:{form:"van",   translit:"van"} },
      "Comer":    { I:{form:"como", translit:"KO-mo"}, you:{form:"comes",translit:"KO-mes"}, he:{form:"come",translit:"KO-me"}, she:{form:"come",translit:"KO-me"}, we:{form:"comemos", translit:"ko-MEH-mos"}, they:{form:"comen", translit:"KO-men"} },
      "Beber":    { I:{form:"bebo", translit:"BEH-bo"},you:{form:"bebes",translit:"BEH-bes"},he:{form:"bebe",translit:"BEH-be"},she:{form:"bebe",translit:"BEH-be"},we:{form:"bebemos", translit:"beh-BEH-mos"},they:{form:"beben", translit:"BEH-ben"} },
      "Hablar":   { I:{form:"hablo",translit:"AH-blo"},you:{form:"hablas",translit:"AH-blas"},he:{form:"habla",translit:"AH-bla"},she:{form:"habla",translit:"AH-bla"},we:{form:"hablamos",translit:"ah-BLA-mos"},they:{form:"hablan", translit:"AH-blan"} },
      "Tener":    { I:{form:"tengo",translit:"TEN-go"},you:{form:"tienes",translit:"tee-EH-nes"},he:{form:"tiene",translit:"tee-EH-ne"},she:{form:"tiene",translit:"tee-EH-ne"},we:{form:"tenemos",translit:"teh-NEH-mos"},they:{form:"tienen",translit:"tee-EH-nen"} },
      "Ser":      { I:{form:"soy",  translit:"soy"},   you:{form:"eres", translit:"EH-res"}, he:{form:"es",  translit:"es"},   she:{form:"es",  translit:"es"},   we:{form:"somos",   translit:"SO-mos"},   they:{form:"son",   translit:"son"} },
      "Estar":    { I:{form:"estoy",translit:"es-TOY"},you:{form:"estás",translit:"es-TAS"},he:{form:"está",translit:"es-TA"},she:{form:"está",translit:"es-TA"},we:{form:"estamos", translit:"es-TA-mos"}, they:{form:"están", translit:"es-TAN"} },
      "Hacer":    { I:{form:"hago", translit:"AH-go"}, you:{form:"haces",translit:"AH-thes"},he:{form:"hace",translit:"AH-the"},she:{form:"hace",translit:"AH-the"},we:{form:"hacemos", translit:"ah-THEH-mos"},they:{form:"hacen", translit:"AH-then"} },
      "Querer":   { I:{form:"quiero",translit:"kee-EH-ro"},you:{form:"quieres",translit:"kee-EH-res"},he:{form:"quiere",translit:"kee-EH-re"},she:{form:"quiere",translit:"kee-EH-re"},we:{form:"queremos",translit:"keh-REH-mos"},they:{form:"quieren",translit:"kee-EH-ren"} },
      "Ver":      { I:{form:"veo",  translit:"VEH-o"}, you:{form:"ves",  translit:"ves"},   he:{form:"ve",  translit:"ve"},   she:{form:"ve",  translit:"ve"},   we:{form:"vemos",   translit:"VEH-mos"},   they:{form:"ven",   translit:"ven"} },
    },
  },

  // ---------------------------------------------------------------------------
  // FRENCH — present indicative, standard textbook forms
  // ---------------------------------------------------------------------------
  fr: {
    pronouns: {
      I:   { form: "je",    translit: "zhuh" },
      you: { form: "tu",    translit: "tew" },
      he:  { form: "il",    translit: "eel" },
      she: { form: "elle",  translit: "el" },
      we:  { form: "nous",  translit: "noo" },
      they:{ form: "ils",   translit: "eel" },
    },
    verbs: {
      "Aller":     { I:{form:"vais", translit:"vay"},   you:{form:"vas",  translit:"va"},   he:{form:"va",  translit:"va"},   she:{form:"va",  translit:"va"},   we:{form:"allons", translit:"a-LON"}, they:{form:"vont", translit:"von"} },
      "Manger":    { I:{form:"mange",translit:"mahnzh"},you:{form:"manges",translit:"mahnzh"},he:{form:"mange",translit:"mahnzh"},she:{form:"mange",translit:"mahnzh"},we:{form:"mangeons",translit:"mahn-ZHON"},they:{form:"mangent",translit:"mahnzh"} },
      "Boire":     { I:{form:"bois", translit:"bwa"},   you:{form:"bois", translit:"bwa"}, he:{form:"boit",translit:"bwa"}, she:{form:"boit",translit:"bwa"}, we:{form:"buvons", translit:"boo-VON"},they:{form:"boivent",translit:"BWAV"} },
      "Parler":    { I:{form:"parle",translit:"parl"},  you:{form:"parles",translit:"parl"},he:{form:"parle",translit:"parl"},she:{form:"parle",translit:"parl"},we:{form:"parlons",translit:"par-LON"},they:{form:"parlent",translit:"parl"} },
      "Avoir":     { I:{form:"ai",   translit:"ay"},    you:{form:"as",   translit:"ah"},   he:{form:"a",   translit:"ah"},   she:{form:"a",   translit:"ah"},   we:{form:"avons",  translit:"a-VON"}, they:{form:"ont",  translit:"on"} },
      "Être":      { I:{form:"suis", translit:"swee"},  you:{form:"es",   translit:"eh"},   he:{form:"est", translit:"eh"},   she:{form:"est", translit:"eh"},   we:{form:"sommes", translit:"som"},   they:{form:"sont", translit:"son"} },
      "Faire":     { I:{form:"fais", translit:"feh"},   you:{form:"fais", translit:"feh"}, he:{form:"fait",translit:"feh"}, she:{form:"fait",translit:"feh"}, we:{form:"faisons",translit:"fuh-ZON"},they:{form:"font", translit:"fon"} },
      "Voir":      { I:{form:"vois", translit:"vwa"},   you:{form:"vois", translit:"vwa"}, he:{form:"voit",translit:"vwa"}, she:{form:"voit",translit:"vwa"}, we:{form:"voyons", translit:"vwa-YON"},they:{form:"voient",translit:"vwa"} },
    },
  },

  // ---------------------------------------------------------------------------
  // URDU — present habitual, MASCULINE subject. We tag with gender note so
  // the lesson surfaces "with male subject" honestly to the learner.
  // ---------------------------------------------------------------------------
  ur: {
    pronouns: {
      I:   { form: "میں",  translit: "main" },
      you: { form: "آپ",   translit: "aap" },
      he:  { form: "وہ",   translit: "woh" },
      she: { form: "وہ",   translit: "woh" },
      we:  { form: "ہم",   translit: "hum" },
      they:{ form: "وہ",   translit: "woh" },
    },
    note: "Urdu verbs agree with gender. Forms shown are for MALE subjects (you'll learn feminine forms later).",
    verbs: {
      "جانا":   { I:{form:"جاتا ہوں", translit:"jaata hoon"}, you:{form:"جاتے ہیں", translit:"jaate hain"}, he:{form:"جاتا ہے", translit:"jaata hai"}, she:{form:"جاتی ہے", translit:"jaati hai"}, we:{form:"جاتے ہیں", translit:"jaate hain"}, they:{form:"جاتے ہیں", translit:"jaate hain"} },
      "آنا":    { I:{form:"آتا ہوں",  translit:"aata hoon"},  you:{form:"آتے ہیں",  translit:"aate hain"},  he:{form:"آتا ہے",  translit:"aata hai"},  she:{form:"آتی ہے",  translit:"aati hai"},  we:{form:"آتے ہیں",  translit:"aate hain"},  they:{form:"آتے ہیں",  translit:"aate hain"} },
      "کھانا":  { I:{form:"کھاتا ہوں",translit:"khaata hoon"},you:{form:"کھاتے ہیں",translit:"khaate hain"},he:{form:"کھاتا ہے",translit:"khaata hai"},she:{form:"کھاتی ہے",translit:"khaati hai"},we:{form:"کھاتے ہیں",translit:"khaate hain"},they:{form:"کھاتے ہیں",translit:"khaate hain"} },
      "پینا":   { I:{form:"پیتا ہوں", translit:"peeta hoon"}, you:{form:"پیتے ہیں", translit:"peete hain"}, he:{form:"پیتا ہے", translit:"peeta hai"}, she:{form:"پیتی ہے", translit:"peeti hai"}, we:{form:"پیتے ہیں", translit:"peete hain"}, they:{form:"پیتے ہیں", translit:"peete hain"} },
      "بولنا":  { I:{form:"بولتا ہوں",translit:"bolta hoon"},you:{form:"بولتے ہیں",translit:"bolte hain"},he:{form:"بولتا ہے",translit:"bolta hai"},she:{form:"بولتی ہے",translit:"bolti hai"},we:{form:"بولتے ہیں",translit:"bolte hain"},they:{form:"بولتے ہیں",translit:"bolte hain"} },
      "پڑھنا":  { I:{form:"پڑھتا ہوں",translit:"parhta hoon"},you:{form:"پڑھتے ہیں",translit:"parhte hain"},he:{form:"پڑھتا ہے",translit:"parhta hai"},she:{form:"پڑھتی ہے",translit:"parhti hai"},we:{form:"پڑھتے ہیں",translit:"parhte hain"},they:{form:"پڑھتے ہیں",translit:"parhte hain"} },
      "لکھنا":  { I:{form:"لکھتا ہوں",translit:"likhta hoon"},you:{form:"لکھتے ہیں",translit:"likhte hain"},he:{form:"لکھتا ہے",translit:"likhta hai"},she:{form:"لکھتی ہے",translit:"likhti hai"},we:{form:"لکھتے ہیں",translit:"likhte hain"},they:{form:"لکھتے ہیں",translit:"likhte hain"} },
      "کرنا":   { I:{form:"کرتا ہوں", translit:"karta hoon"}, you:{form:"کرتے ہیں", translit:"karte hain"}, he:{form:"کرتا ہے", translit:"karta hai"}, she:{form:"کرتی ہے", translit:"karti hai"}, we:{form:"کرتے ہیں", translit:"karte hain"}, they:{form:"کرتے ہیں", translit:"karte hain"} },
    },
  },

  // ---------------------------------------------------------------------------
  // HINDI — present habitual, MASCULINE subject (same caveat as Urdu).
  // ---------------------------------------------------------------------------
  hi: {
    pronouns: {
      I:   { form: "मैं", translit: "main" },
      you: { form: "आप",  translit: "aap" },
      he:  { form: "वह",  translit: "vah" },
      she: { form: "वह",  translit: "vah" },
      we:  { form: "हम",  translit: "hum" },
      they:{ form: "वे",  translit: "ve" },
    },
    note: "Hindi verbs agree with gender. Forms shown are for MALE subjects (you'll learn feminine forms later).",
    verbs: {
      "जाना":   { I:{form:"जाता हूँ", translit:"jaata hoon"}, you:{form:"जाते हैं", translit:"jaate hain"}, he:{form:"जाता है", translit:"jaata hai"}, she:{form:"जाती है", translit:"jaati hai"}, we:{form:"जाते हैं", translit:"jaate hain"}, they:{form:"जाते हैं", translit:"jaate hain"} },
      "खाना":   { I:{form:"खाता हूँ", translit:"khaata hoon"},you:{form:"खाते हैं", translit:"khaate hain"},he:{form:"खाता है", translit:"khaata hai"},she:{form:"खाती है", translit:"khaati hai"},we:{form:"खाते हैं", translit:"khaate hain"},they:{form:"खाते हैं", translit:"khaate hain"} },
      "पीना":   { I:{form:"पीता हूँ", translit:"peeta hoon"}, you:{form:"पीते हैं", translit:"peete hain"}, he:{form:"पीता है", translit:"peeta hai"}, she:{form:"पीती है", translit:"peeti hai"}, we:{form:"पीते हैं", translit:"peete hain"}, they:{form:"पीते हैं", translit:"peete hain"} },
      "बोलना":  { I:{form:"बोलता हूँ",translit:"bolta hoon"},you:{form:"बोलते हैं",translit:"bolte hain"},he:{form:"बोलता है",translit:"bolta hai"},she:{form:"बोलती है",translit:"bolti hai"},we:{form:"बोलते हैं",translit:"bolte hain"},they:{form:"बोलते हैं",translit:"bolte hain"} },
      "आना":    { I:{form:"आता हूँ",  translit:"aata hoon"},  you:{form:"आते हैं",  translit:"aate hain"},  he:{form:"आता है",  translit:"aata hai"},  she:{form:"आती है",  translit:"aati hai"},  we:{form:"आते हैं",  translit:"aate hain"},  they:{form:"आते हैं",  translit:"aate hain"} },
    },
  },

  // ---------------------------------------------------------------------------
  // ARABIC — MSA present tense (mudari'). Web-verified above.
  // Note: dictionary citation form IS the 3rd-masc-singular (he/it).
  // ---------------------------------------------------------------------------
  ar: {
    pronouns: {
      I:   { form: "أنا",   translit: "ana" },
      you: { form: "أنتَ",  translit: "anta" },
      he:  { form: "هو",    translit: "huwa" },
      she: { form: "هي",    translit: "hiya" },
      we:  { form: "نحن",   translit: "nahnu" },
      they:{ form: "هم",    translit: "hum" },
    },
    note: "Arabic dictionary forms ARE the 'he' form. Other persons change prefixes/suffixes.",
    verbs: {
      "يذهب":   { I:{form:"أذهب",   translit:"adhhab"},   you:{form:"تذهب",   translit:"tadhhab"},   he:{form:"يذهب",   translit:"yadhhab"},   she:{form:"تذهب",   translit:"tadhhab"},   we:{form:"نذهب",   translit:"nadhhab"},   they:{form:"يذهبون",   translit:"yadhhabuun"} },
      "يأكل":   { I:{form:"آكل",    translit:"aakul"},    you:{form:"تأكل",   translit:"ta'kul"},    he:{form:"يأكل",   translit:"ya'kul"},    she:{form:"تأكل",   translit:"ta'kul"},    we:{form:"نأكل",   translit:"na'kul"},    they:{form:"يأكلون",   translit:"ya'kuluun"} },
      "يشرب":   { I:{form:"أشرب",   translit:"ashrab"},   you:{form:"تشرب",   translit:"tashrab"},   he:{form:"يشرب",   translit:"yashrab"},   she:{form:"تشرب",   translit:"tashrab"},   we:{form:"نشرب",   translit:"nashrab"},   they:{form:"يشربون",   translit:"yashrabuun"} },
      "يتكلم":  { I:{form:"أتكلم",  translit:"atakallam"},you:{form:"تتكلم",  translit:"tatakallam"},he:{form:"يتكلم",  translit:"yatakallam"},she:{form:"تتكلم",  translit:"tatakallam"},we:{form:"نتكلم",  translit:"natakallam"},they:{form:"يتكلمون",  translit:"yatakallamuun"} },
    },
  },

  // ---------------------------------------------------------------------------
  // MANDARIN — verbs DON'T conjugate. The whole "lesson" is pronoun-swap +
  // showing the form never changes. This is itself pedagogically valuable.
  // ---------------------------------------------------------------------------
  zh: {
    pronouns: {
      I:   { form: "我",    translit: "wǒ" },
      you: { form: "你",    translit: "nǐ" },
      he:  { form: "他",    translit: "tā" },
      she: { form: "她",    translit: "tā" },
      we:  { form: "我们",  translit: "wǒmen" },
      they:{ form: "他们",  translit: "tāmen" },
    },
    note: "Mandarin verbs NEVER change. The same form is used for every person — only the pronoun changes.",
    verbs: {
      "去": { I:{form:"去",translit:"qù"}, you:{form:"去",translit:"qù"}, he:{form:"去",translit:"qù"}, she:{form:"去",translit:"qù"}, we:{form:"去",translit:"qù"}, they:{form:"去",translit:"qù"} },
      "来": { I:{form:"来",translit:"lái"},you:{form:"来",translit:"lái"},he:{form:"来",translit:"lái"},she:{form:"来",translit:"lái"},we:{form:"来",translit:"lái"},they:{form:"来",translit:"lái"} },
      "吃": { I:{form:"吃",translit:"chī"},you:{form:"吃",translit:"chī"},he:{form:"吃",translit:"chī"},she:{form:"吃",translit:"chī"},we:{form:"吃",translit:"chī"},they:{form:"吃",translit:"chī"} },
      "喝": { I:{form:"喝",translit:"hē"}, you:{form:"喝",translit:"hē"}, he:{form:"喝",translit:"hē"}, she:{form:"喝",translit:"hē"}, we:{form:"喝",translit:"hē"}, they:{form:"喝",translit:"hē"} },
      "说": { I:{form:"说",translit:"shuō"},you:{form:"说",translit:"shuō"},he:{form:"说",translit:"shuō"},she:{form:"说",translit:"shuō"},we:{form:"说",translit:"shuō"},they:{form:"说",translit:"shuō"} },
      "看": { I:{form:"看",translit:"kàn"},you:{form:"看",translit:"kàn"},he:{form:"看",translit:"kàn"},she:{form:"看",translit:"kàn"},we:{form:"看",translit:"kàn"},they:{form:"看",translit:"kàn"} },
      "做": { I:{form:"做",translit:"zuò"},you:{form:"做",translit:"zuò"},he:{form:"做",translit:"zuò"},she:{form:"做",translit:"zuò"},we:{form:"做",translit:"zuò"},they:{form:"做",translit:"zuò"} },
      "有": { I:{form:"有",translit:"yǒu"},you:{form:"有",translit:"yǒu"},he:{form:"有",translit:"yǒu"},she:{form:"有",translit:"yǒu"},we:{form:"有",translit:"yǒu"},they:{form:"有",translit:"yǒu"} },
    },
  },

  // ---------------------------------------------------------------------------
  // JAPANESE — polite -masu form. Same form across persons; subject pronoun
  // is often dropped in real Japanese, but we keep it explicit for learning.
  // ---------------------------------------------------------------------------
  ja: {
    pronouns: {
      I:   { form: "私",     translit: "watashi" },
      you: { form: "あなた", translit: "anata" },
      he:  { form: "彼",     translit: "kare" },
      she: { form: "彼女",   translit: "kanojo" },
      we:  { form: "私たち", translit: "watashi-tachi" },
      they:{ form: "彼ら",   translit: "karera" },
    },
    note: "Japanese polite -masu form: SAME verb for every person, only the pronoun changes. (Persons are often dropped in real speech, but here we show them explicitly.)",
    verbs: {
      "行く":   { I:{form:"行きます",translit:"ikimasu"},   you:{form:"行きます",translit:"ikimasu"},   he:{form:"行きます",translit:"ikimasu"},   she:{form:"行きます",translit:"ikimasu"},   we:{form:"行きます",translit:"ikimasu"},   they:{form:"行きます",translit:"ikimasu"} },
      "来る":   { I:{form:"来ます",  translit:"kimasu"},    you:{form:"来ます",  translit:"kimasu"},    he:{form:"来ます",  translit:"kimasu"},    she:{form:"来ます",  translit:"kimasu"},    we:{form:"来ます",  translit:"kimasu"},    they:{form:"来ます",  translit:"kimasu"} },
      "食べる": { I:{form:"食べます",translit:"tabemasu"}, you:{form:"食べます",translit:"tabemasu"}, he:{form:"食べます",translit:"tabemasu"}, she:{form:"食べます",translit:"tabemasu"}, we:{form:"食べます",translit:"tabemasu"}, they:{form:"食べます",translit:"tabemasu"} },
      "飲む":   { I:{form:"飲みます",translit:"nomimasu"}, you:{form:"飲みます",translit:"nomimasu"}, he:{form:"飲みます",translit:"nomimasu"}, she:{form:"飲みます",translit:"nomimasu"}, we:{form:"飲みます",translit:"nomimasu"}, they:{form:"飲みます",translit:"nomimasu"} },
      "話す":   { I:{form:"話します",translit:"hanashimasu"},you:{form:"話します",translit:"hanashimasu"},he:{form:"話します",translit:"hanashimasu"},she:{form:"話します",translit:"hanashimasu"},we:{form:"話します",translit:"hanashimasu"},they:{form:"話します",translit:"hanashimasu"} },
      "見る":   { I:{form:"見ます",  translit:"mimasu"},    you:{form:"見ます",  translit:"mimasu"},    he:{form:"見ます",  translit:"mimasu"},    she:{form:"見ます",  translit:"mimasu"},    we:{form:"見ます",  translit:"mimasu"},    they:{form:"見ます",  translit:"mimasu"} },
      "する":   { I:{form:"します",  translit:"shimasu"},   you:{form:"します",  translit:"shimasu"},   he:{form:"します",  translit:"shimasu"},   she:{form:"します",  translit:"shimasu"},   we:{form:"します",  translit:"shimasu"},   they:{form:"します",  translit:"shimasu"} },
    },
  },

  // ---------------------------------------------------------------------------
  // KOREAN — polite -yo form. Web-verified above.
  // Same form across persons; person comes from the pronoun.
  // ---------------------------------------------------------------------------
  ko: {
    pronouns: {
      I:   { form: "저는",   translit: "jeoneun" },
      you: { form: "당신은", translit: "dangsineun" },
      he:  { form: "그는",   translit: "geuneun" },
      she: { form: "그녀는", translit: "geunyeoneun" },
      we:  { form: "우리는", translit: "urineun" },
      they:{ form: "그들은", translit: "geudeureun" },
    },
    note: "Korean polite -yo form: SAME verb for every person — only the pronoun changes. -yo is the everyday polite ending (safe in most situations).",
    verbs: {
      "가다":   { I:{form:"가요",   translit:"gayo"},   you:{form:"가요",   translit:"gayo"},   he:{form:"가요",   translit:"gayo"},   she:{form:"가요",   translit:"gayo"},   we:{form:"가요",   translit:"gayo"},   they:{form:"가요",   translit:"gayo"} },
      "오다":   { I:{form:"와요",   translit:"wayo"},   you:{form:"와요",   translit:"wayo"},   he:{form:"와요",   translit:"wayo"},   she:{form:"와요",   translit:"wayo"},   we:{form:"와요",   translit:"wayo"},   they:{form:"와요",   translit:"wayo"} },
      "먹다":   { I:{form:"먹어요", translit:"meogeoyo"}, you:{form:"먹어요", translit:"meogeoyo"}, he:{form:"먹어요", translit:"meogeoyo"}, she:{form:"먹어요", translit:"meogeoyo"}, we:{form:"먹어요", translit:"meogeoyo"}, they:{form:"먹어요", translit:"meogeoyo"} },
      "마시다": { I:{form:"마셔요", translit:"masyeoyo"}, you:{form:"마셔요", translit:"masyeoyo"}, he:{form:"마셔요", translit:"masyeoyo"}, she:{form:"마셔요", translit:"masyeoyo"}, we:{form:"마셔요", translit:"masyeoyo"}, they:{form:"마셔요", translit:"masyeoyo"} },
      "보다":   { I:{form:"봐요",   translit:"bwayo"},  you:{form:"봐요",   translit:"bwayo"},  he:{form:"봐요",   translit:"bwayo"},  she:{form:"봐요",   translit:"bwayo"},  we:{form:"봐요",   translit:"bwayo"},  they:{form:"봐요",   translit:"bwayo"} },
      "말하다": { I:{form:"말해요", translit:"malhaeyo"},you:{form:"말해요", translit:"malhaeyo"},he:{form:"말해요", translit:"malhaeyo"},she:{form:"말해요", translit:"malhaeyo"},we:{form:"말해요", translit:"malhaeyo"},they:{form:"말해요", translit:"malhaeyo"} },
      "하다":   { I:{form:"해요",   translit:"haeyo"},  you:{form:"해요",   translit:"haeyo"},  he:{form:"해요",   translit:"haeyo"},  she:{form:"해요",   translit:"haeyo"},  we:{form:"해요",   translit:"haeyo"},  they:{form:"해요",   translit:"haeyo"} },
    },
  },

  // ---------------------------------------------------------------------------
  // BENGALI — present simple. Conservative coverage. WOULD BENEFIT FROM
  // NATIVE-SPEAKER REVIEW before being fully trusted.
  // ---------------------------------------------------------------------------
  bn: {
    pronouns: {
      I:   { form: "আমি",     translit: "ami" },
      you: { form: "তুমি",    translit: "tumi" },     // familiar; "apni" is respectful
      he:  { form: "সে",      translit: "she" },
      she: { form: "সে",      translit: "she" },
      we:  { form: "আমরা",    translit: "amra" },
      they:{ form: "তারা",    translit: "tara" },
    },
    note: "Bengali simple present. Forms shown match the standard textbook pattern; native review recommended.",
    verbs: {
      "যাওয়া":  { I:{form:"যাই", translit:"jai"},   you:{form:"যাও", translit:"jao"},   he:{form:"যায়", translit:"jay"},   she:{form:"যায়", translit:"jay"},   we:{form:"যাই", translit:"jai"},   they:{form:"যায়", translit:"jay"} },
      "আসা":    { I:{form:"আসি", translit:"ashi"},  you:{form:"আসো", translit:"asho"},  he:{form:"আসে", translit:"ashe"},  she:{form:"আসে", translit:"ashe"},  we:{form:"আসি", translit:"ashi"},  they:{form:"আসে", translit:"ashe"} },
      "খাওয়া":  { I:{form:"খাই", translit:"khai"},  you:{form:"খাও", translit:"khao"},  he:{form:"খায়", translit:"khay"},  she:{form:"খায়", translit:"khay"},  we:{form:"খাই", translit:"khai"},  they:{form:"খায়", translit:"khay"} },
      "বলা":    { I:{form:"বলি", translit:"boli"},  you:{form:"বল",  translit:"bolo"},  he:{form:"বলে", translit:"bole"},  she:{form:"বলে", translit:"bole"},  we:{form:"বলি", translit:"boli"},  they:{form:"বলে", translit:"bole"} },
      "করা":    { I:{form:"করি", translit:"kori"},  you:{form:"কর",  translit:"koro"},  he:{form:"করে", translit:"kore"},  she:{form:"করে", translit:"kore"},  we:{form:"করি", translit:"kori"},  they:{form:"করে", translit:"kore"} },
    },
  },
};

// =============================================================================
// API
// =============================================================================

const PERSONS = ["I", "you", "he", "she", "we", "they"];

/** Does this language have any conjugation data at all? */
export function hasConjugations(langCode) {
  const c = CONJUGATIONS[langCode];
  return !!(c && c.verbs && Object.keys(c.verbs).length > 0);
}

/** Is a SPECIFIC vocab item conjugatable? (verbs only; not all verbs are covered) */
export function isConjugatable(langCode, lemma) {
  const c = CONJUGATIONS[langCode];
  return !!(c && c.verbs && c.verbs[lemma]);
}

/** Get all conjugatable lemmas for a language. */
export function listConjugatableLemmas(langCode) {
  const c = CONJUGATIONS[langCode];
  if (!c || !c.verbs) return [];
  return Object.keys(c.verbs);
}

/** Get the full conjugation table for a verb (or null). */
export function getConjugation(langCode, lemma) {
  return CONJUGATIONS[langCode]?.verbs?.[lemma] || null;
}

/** Get the pronoun set + teaching note for the language. */
export function getPronouns(langCode) {
  return CONJUGATIONS[langCode]?.pronouns || null;
}

export function getLangNote(langCode) {
  return CONJUGATIONS[langCode]?.note || null;
}

/** All persons we model. Useful when building distractors. */
export { PERSONS };
