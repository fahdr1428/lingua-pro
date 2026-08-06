// =============================================================================
// TENSES — past and future tense forms, layered on top of conjugations.js
//
// v34b design notes:
//   - Separate from conjugations.js to keep changes additive — existing present-
//     tense code keeps working unchanged.
//   - Structure: TENSES[lang].past[lemma][person] = { form, translit }
//                TENSES[lang].future[lemma][person] = { form, translit }
//   - We only include verbs that ALSO appear in CONJUGATIONS — so the learner
//     sees the same verb in present/past/future, not three different sets.
//
// Per-language confidence (be honest):
//   es, fr        HIGH — preterite + going-to-future, textbook forms, web-verified
//   ur, hi        HIGH — masculine forms only, flagged honestly to learner
//   ar            MED-HIGH — past (perfect) verified against Wikibooks + Kalimah
//                            future = سوف + present
//   zh            HIGH (special) — verbs don't change. Past = verb + 了
//                                  Future = 会 + verb (the lesson IS this fact)
//   ja            MED — past = -mashita (polite past), future = polite present
//                       (Japanese has no future tense morphologically — context
//                       carries time. We teach the "tomorrow" + present pattern.)
//   ko            MED — past -았/었어요 + future -ㄹ/을 거예요, web-verified
//   bn            LOW — present-only kept; flagged for native review
//
// IMPORTANT teaching notes per language are surfaced via the lesson UI.
// =============================================================================

export const TENSES = {
  // ---------------------------------------------------------------------------
  // GERMAN — Perfekt for the past, werden for the future.
  //
  // WHY PERFEKT AND NOT PRÄTERITUM. Textbooks teach both; Germans speak one.
  // In conversation the past is almost always the Perfekt (ich habe gemacht,
  // ich bin gegangen), and the Präteritum is largely written or literary — with
  // two everyday exceptions, sein and haben, where war and hatte are what people
  // actually say. Both are taught here accordingly.
  //
  // THE AUXILIARY IS THE THING TO LEARN. Most verbs take haben; verbs of motion
  // and change of state take sein (ich BIN gegangen, ich BIN gekommen). Getting
  // it wrong is understood but instantly foreign, so the sein-verbs are in here.
  //
  // AND THE FUTURE IS USUALLY THE PRESENT. "Morgen gehe ich" — tomorrow I go —
  // is what a German says far more often than "ich werde gehen". werden is
  // taught because it's explicit and unambiguous, but the note says plainly that
  // present-plus-a-time-word is the everyday habit.
  // ---------------------------------------------------------------------------
  de: {
    pastName: "Perfekt (the spoken past)",
    pastNote: "The past you'll actually hear. Built from haben or sein plus the participle: ich habe gemacht, ich bin gegangen. Verbs of movement take sein — that's the bit worth memorising. sein and haben themselves are the exception: people say war and hatte, not 'bin gewesen'.",
    futureName: "Future with werden",
    futureNote: "werden + the infinitive, which goes to the end: ich werde morgen arbeiten. Worth knowing — but Germans usually just use the present with a time word: 'Morgen arbeite ich.'",
    past: {
      "sein":     { I:{form:"war",              translit:"var"},                    you:{form:"warst",             translit:"varst"},                 he:{form:"war",              translit:"var"},                she:{form:"war",              translit:"var"},                we:{form:"waren",              translit:"VAR-en"},               they:{form:"waren",              translit:"VAR-en"} },
      "haben":    { I:{form:"hatte",            translit:"HAT-uh"},                 you:{form:"hattest",           translit:"HAT-est"},               he:{form:"hatte",            translit:"HAT-uh"},             she:{form:"hatte",            translit:"HAT-uh"},             we:{form:"hatten",             translit:"HAT-en"},               they:{form:"hatten",             translit:"HAT-en"} },
      "gehen":    { I:{form:"bin gegangen",     translit:"bin guh-GANG-en"},        you:{form:"bist gegangen",     translit:"bist guh-GANG-en"},      he:{form:"ist gegangen",     translit:"ist guh-GANG-en"},    she:{form:"ist gegangen",     translit:"ist guh-GANG-en"},    we:{form:"sind gegangen",      translit:"zint guh-GANG-en"},     they:{form:"sind gegangen",      translit:"zint guh-GANG-en"} },
      "kommen":   { I:{form:"bin gekommen",     translit:"bin guh-KOM-en"},         you:{form:"bist gekommen",     translit:"bist guh-KOM-en"},       he:{form:"ist gekommen",     translit:"ist guh-KOM-en"},     she:{form:"ist gekommen",     translit:"ist guh-KOM-en"},     we:{form:"sind gekommen",      translit:"zint guh-KOM-en"},      they:{form:"sind gekommen",      translit:"zint guh-KOM-en"} },
      "machen":   { I:{form:"habe gemacht",     translit:"HAH-buh guh-MAKHT"},      you:{form:"hast gemacht",      translit:"hast guh-MAKHT"},        he:{form:"hat gemacht",      translit:"hat guh-MAKHT"},      she:{form:"hat gemacht",      translit:"hat guh-MAKHT"},      we:{form:"haben gemacht",      translit:"HAH-ben guh-MAKHT"},    they:{form:"haben gemacht",      translit:"HAH-ben guh-MAKHT"} },
      "sehen":    { I:{form:"habe gesehen",     translit:"HAH-buh guh-ZAY-en"},     you:{form:"hast gesehen",      translit:"hast guh-ZAY-en"},       he:{form:"hat gesehen",      translit:"hat guh-ZAY-en"},     she:{form:"hat gesehen",      translit:"hat guh-ZAY-en"},     we:{form:"haben gesehen",      translit:"HAH-ben guh-ZAY-en"},   they:{form:"haben gesehen",      translit:"HAH-ben guh-ZAY-en"} },
      "sprechen": { I:{form:"habe gesprochen",  translit:"HAH-buh guh-SHPROKH-en"}, you:{form:"hast gesprochen",   translit:"hast guh-SHPROKH-en"},   he:{form:"hat gesprochen",   translit:"hat guh-SHPROKH-en"}, she:{form:"hat gesprochen",   translit:"hat guh-SHPROKH-en"}, we:{form:"haben gesprochen",   translit:"HAH-ben guh-SHPROKH-en"}, they:{form:"haben gesprochen", translit:"HAH-ben guh-SHPROKH-en"} },
      "essen":    { I:{form:"habe gegessen",    translit:"HAH-buh guh-GES-en"},     you:{form:"hast gegessen",     translit:"hast guh-GES-en"},       he:{form:"hat gegessen",     translit:"hat guh-GES-en"},     she:{form:"hat gegessen",     translit:"hat guh-GES-en"},     we:{form:"haben gegessen",     translit:"HAH-ben guh-GES-en"},   they:{form:"haben gegessen",     translit:"HAH-ben guh-GES-en"} },
      "trinken":  { I:{form:"habe getrunken",   translit:"HAH-buh guh-TROONK-en"},  you:{form:"hast getrunken",    translit:"hast guh-TROONK-en"},    he:{form:"hat getrunken",    translit:"hat guh-TROONK-en"},  she:{form:"hat getrunken",    translit:"hat guh-TROONK-en"},  we:{form:"haben getrunken",    translit:"HAH-ben guh-TROONK-en"}, they:{form:"haben getrunken",   translit:"HAH-ben guh-TROONK-en"} },
      "arbeiten": { I:{form:"habe gearbeitet",  translit:"HAH-buh guh-AR-by-tet"},  you:{form:"hast gearbeitet",   translit:"hast guh-AR-by-tet"},    he:{form:"hat gearbeitet",   translit:"hat guh-AR-by-tet"},  she:{form:"hat gearbeitet",   translit:"hat guh-AR-by-tet"},  we:{form:"haben gearbeitet",   translit:"HAH-ben guh-AR-by-tet"}, they:{form:"haben gearbeitet", translit:"HAH-ben guh-AR-by-tet"} },
      "kaufen":   { I:{form:"habe gekauft",     translit:"HAH-buh guh-COWFT"},      you:{form:"hast gekauft",      translit:"hast guh-COWFT"},        he:{form:"hat gekauft",      translit:"hat guh-COWFT"},      she:{form:"hat gekauft",      translit:"hat guh-COWFT"},      we:{form:"haben gekauft",      translit:"HAH-ben guh-COWFT"},    they:{form:"haben gekauft",      translit:"HAH-ben guh-COWFT"} },
      "helfen":   { I:{form:"habe geholfen",    translit:"HAH-buh guh-HOLF-en"},    you:{form:"hast geholfen",     translit:"hast guh-HOLF-en"},      he:{form:"hat geholfen",     translit:"hat guh-HOLF-en"},    she:{form:"hat geholfen",     translit:"hat guh-HOLF-en"},    we:{form:"haben geholfen",     translit:"HAH-ben guh-HOLF-en"},  they:{form:"haben geholfen",     translit:"HAH-ben guh-HOLF-en"} },
    },
    future: {
      "sein":     { I:{form:"werde sein",      translit:"VAIR-duh zine"},      you:{form:"wirst sein",      translit:"veerst zine"},      he:{form:"wird sein",      translit:"veert zine"},      she:{form:"wird sein",      translit:"veert zine"},      we:{form:"werden sein",      translit:"VAIR-den zine"},      they:{form:"werden sein",      translit:"VAIR-den zine"} },
      "haben":    { I:{form:"werde haben",     translit:"VAIR-duh HAH-ben"},   you:{form:"wirst haben",     translit:"veerst HAH-ben"},   he:{form:"wird haben",     translit:"veert HAH-ben"},   she:{form:"wird haben",     translit:"veert HAH-ben"},   we:{form:"werden haben",     translit:"VAIR-den HAH-ben"},   they:{form:"werden haben",     translit:"VAIR-den HAH-ben"} },
      "gehen":    { I:{form:"werde gehen",     translit:"VAIR-duh GAY-en"},    you:{form:"wirst gehen",     translit:"veerst GAY-en"},    he:{form:"wird gehen",     translit:"veert GAY-en"},    she:{form:"wird gehen",     translit:"veert GAY-en"},    we:{form:"werden gehen",     translit:"VAIR-den GAY-en"},    they:{form:"werden gehen",     translit:"VAIR-den GAY-en"} },
      "kommen":   { I:{form:"werde kommen",    translit:"VAIR-duh KOM-en"},    you:{form:"wirst kommen",    translit:"veerst KOM-en"},    he:{form:"wird kommen",    translit:"veert KOM-en"},    she:{form:"wird kommen",    translit:"veert KOM-en"},    we:{form:"werden kommen",    translit:"VAIR-den KOM-en"},    they:{form:"werden kommen",    translit:"VAIR-den KOM-en"} },
      "machen":   { I:{form:"werde machen",    translit:"VAIR-duh MAKH-en"},   you:{form:"wirst machen",    translit:"veerst MAKH-en"},   he:{form:"wird machen",    translit:"veert MAKH-en"},   she:{form:"wird machen",    translit:"veert MAKH-en"},   we:{form:"werden machen",    translit:"VAIR-den MAKH-en"},   they:{form:"werden machen",    translit:"VAIR-den MAKH-en"} },
      "sehen":    { I:{form:"werde sehen",     translit:"VAIR-duh ZAY-en"},    you:{form:"wirst sehen",     translit:"veerst ZAY-en"},    he:{form:"wird sehen",     translit:"veert ZAY-en"},    she:{form:"wird sehen",     translit:"veert ZAY-en"},    we:{form:"werden sehen",     translit:"VAIR-den ZAY-en"},    they:{form:"werden sehen",     translit:"VAIR-den ZAY-en"} },
      "sprechen": { I:{form:"werde sprechen",  translit:"VAIR-duh SHPREKH-en"},you:{form:"wirst sprechen",  translit:"veerst SHPREKH-en"},he:{form:"wird sprechen",  translit:"veert SHPREKH-en"},she:{form:"wird sprechen",  translit:"veert SHPREKH-en"},we:{form:"werden sprechen",  translit:"VAIR-den SHPREKH-en"},they:{form:"werden sprechen",  translit:"VAIR-den SHPREKH-en"} },
      "essen":    { I:{form:"werde essen",     translit:"VAIR-duh ES-en"},     you:{form:"wirst essen",     translit:"veerst ES-en"},     he:{form:"wird essen",     translit:"veert ES-en"},     she:{form:"wird essen",     translit:"veert ES-en"},     we:{form:"werden essen",     translit:"VAIR-den ES-en"},     they:{form:"werden essen",     translit:"VAIR-den ES-en"} },
      "trinken":  { I:{form:"werde trinken",   translit:"VAIR-duh TRINK-en"},  you:{form:"wirst trinken",   translit:"veerst TRINK-en"},  he:{form:"wird trinken",   translit:"veert TRINK-en"},  she:{form:"wird trinken",   translit:"veert TRINK-en"},  we:{form:"werden trinken",   translit:"VAIR-den TRINK-en"},  they:{form:"werden trinken",   translit:"VAIR-den TRINK-en"} },
      "arbeiten": { I:{form:"werde arbeiten",  translit:"VAIR-duh AR-by-ten"}, you:{form:"wirst arbeiten",  translit:"veerst AR-by-ten"}, he:{form:"wird arbeiten",  translit:"veert AR-by-ten"}, she:{form:"wird arbeiten",  translit:"veert AR-by-ten"}, we:{form:"werden arbeiten",  translit:"VAIR-den AR-by-ten"}, they:{form:"werden arbeiten",  translit:"VAIR-den AR-by-ten"} },
      "kaufen":   { I:{form:"werde kaufen",    translit:"VAIR-duh COW-fen"},   you:{form:"wirst kaufen",    translit:"veerst COW-fen"},   he:{form:"wird kaufen",    translit:"veert COW-fen"},   she:{form:"wird kaufen",    translit:"veert COW-fen"},   we:{form:"werden kaufen",    translit:"VAIR-den COW-fen"},   they:{form:"werden kaufen",    translit:"VAIR-den COW-fen"} },
      "helfen":   { I:{form:"werde helfen",    translit:"VAIR-duh HEL-fen"},   you:{form:"wirst helfen",    translit:"veerst HEL-fen"},   he:{form:"wird helfen",    translit:"veert HEL-fen"},   she:{form:"wird helfen",    translit:"veert HEL-fen"},   we:{form:"werden helfen",    translit:"VAIR-den HEL-fen"},   they:{form:"werden helfen",    translit:"VAIR-den HEL-fen"} },
    },
  },

  // ---------------------------------------------------------------------------
  // SPANISH — preterite (completed past) + ir-a-future
  // ---------------------------------------------------------------------------
  es: {
    pastName: "Preterite (completed past)",
    pastNote: "Spanish has TWO past tenses. This is the preterite — for specific completed actions. 'I ate yesterday' = comí ayer.",
    futureName: "Going-to future",
    futureNote: "The easiest Spanish future: 'voy a' + infinitive. Like English 'I'm going to...'",
    past: {
      "Ir":    { I:{form:"fui",     translit:"fwee"},      you:{form:"fuiste",   translit:"fwee-STE"},  he:{form:"fue",     translit:"fwe"},      she:{form:"fue",     translit:"fwe"},      we:{form:"fuimos",     translit:"FWEE-mos"},      they:{form:"fueron",     translit:"FWE-ron"} },
      "Comer": { I:{form:"comí",    translit:"ko-MEE"},    you:{form:"comiste",  translit:"ko-MEES-te"}, he:{form:"comió",   translit:"ko-MYO"},   she:{form:"comió",   translit:"ko-MYO"},   we:{form:"comimos",    translit:"ko-MEE-mos"},    they:{form:"comieron",   translit:"ko-MYE-ron"} },
      "Beber": { I:{form:"bebí",    translit:"be-BEE"},    you:{form:"bebiste",  translit:"be-BEES-te"}, he:{form:"bebió",   translit:"be-BYO"},   she:{form:"bebió",   translit:"be-BYO"},   we:{form:"bebimos",    translit:"be-BEE-mos"},    they:{form:"bebieron",   translit:"be-BYE-ron"} },
      "Hablar":{ I:{form:"hablé",   translit:"ah-BLEH"},   you:{form:"hablaste", translit:"ah-BLAS-te"}, he:{form:"habló",   translit:"ah-BLO"},   she:{form:"habló",   translit:"ah-BLO"},   we:{form:"hablamos",   translit:"ah-BLA-mos"},    they:{form:"hablaron",   translit:"ah-BLA-ron"} },
      "Tener": { I:{form:"tuve",    translit:"TOO-ve"},    you:{form:"tuviste",  translit:"too-VEES-te"},he:{form:"tuvo",    translit:"TOO-vo"},   she:{form:"tuvo",    translit:"TOO-vo"},   we:{form:"tuvimos",    translit:"too-VEE-mos"},   they:{form:"tuvieron",   translit:"too-VYE-ron"} },
      "Ser":   { I:{form:"fui",     translit:"fwee"},      you:{form:"fuiste",   translit:"fwee-STE"},  he:{form:"fue",     translit:"fwe"},      she:{form:"fue",     translit:"fwe"},      we:{form:"fuimos",     translit:"FWEE-mos"},      they:{form:"fueron",     translit:"FWE-ron"} },
      "Hacer": { I:{form:"hice",    translit:"EE-the"},    you:{form:"hiciste",  translit:"ee-THEES-te"},he:{form:"hizo",    translit:"EE-tho"},   she:{form:"hizo",    translit:"EE-tho"},   we:{form:"hicimos",    translit:"ee-THEE-mos"},   they:{form:"hicieron",   translit:"ee-THYE-ron"} },
      "Querer":{ I:{form:"quise",   translit:"KEE-se"},    you:{form:"quisiste", translit:"kee-SEES-te"},he:{form:"quiso",   translit:"KEE-so"},   she:{form:"quiso",   translit:"KEE-so"},   we:{form:"quisimos",   translit:"kee-SEE-mos"},   they:{form:"quisieron",  translit:"kee-SYE-ron"} },
      "Ver":   { I:{form:"vi",      translit:"vee"},       you:{form:"viste",    translit:"VEES-te"},   he:{form:"vio",     translit:"vyo"},      she:{form:"vio",     translit:"vyo"},      we:{form:"vimos",      translit:"VEE-mos"},       they:{form:"vieron",     translit:"VYE-ron"} },
    },
    future: {
      "Ir":    { I:{form:"voy a ir",      translit:"voy a eer"},      you:{form:"vas a ir",      translit:"vas a eer"},      he:{form:"va a ir",      translit:"va a eer"},      she:{form:"va a ir",      translit:"va a eer"},      we:{form:"vamos a ir",      translit:"VA-mos a eer"},      they:{form:"van a ir",      translit:"van a eer"} },
      "Comer": { I:{form:"voy a comer",   translit:"voy a ko-MER"},   you:{form:"vas a comer",   translit:"vas a ko-MER"},   he:{form:"va a comer",   translit:"va a ko-MER"},   she:{form:"va a comer",   translit:"va a ko-MER"},   we:{form:"vamos a comer",   translit:"VA-mos a ko-MER"},   they:{form:"van a comer",   translit:"van a ko-MER"} },
      "Beber": { I:{form:"voy a beber",   translit:"voy a be-BER"},   you:{form:"vas a beber",   translit:"vas a be-BER"},   he:{form:"va a beber",   translit:"va a be-BER"},   she:{form:"va a beber",   translit:"va a be-BER"},   we:{form:"vamos a beber",   translit:"VA-mos a be-BER"},   they:{form:"van a beber",   translit:"van a be-BER"} },
      "Hablar":{ I:{form:"voy a hablar",  translit:"voy a ah-BLAR"},  you:{form:"vas a hablar",  translit:"vas a ah-BLAR"},  he:{form:"va a hablar",  translit:"va a ah-BLAR"},  she:{form:"va a hablar",  translit:"va a ah-BLAR"},  we:{form:"vamos a hablar",  translit:"VA-mos a ah-BLAR"},  they:{form:"van a hablar",  translit:"van a ah-BLAR"} },
      "Tener": { I:{form:"voy a tener",   translit:"voy a te-NER"},   you:{form:"vas a tener",   translit:"vas a te-NER"},   he:{form:"va a tener",   translit:"va a te-NER"},   she:{form:"va a tener",   translit:"va a te-NER"},   we:{form:"vamos a tener",   translit:"VA-mos a te-NER"},   they:{form:"van a tener",   translit:"van a te-NER"} },
    },
  },

  // ---------------------------------------------------------------------------
  // FRENCH — passé composé (most common past) + going-to future
  // ---------------------------------------------------------------------------
  fr: {
    pastName: "Passé composé (completed past)",
    pastNote: "The most common French past tense — 'avoir' or 'être' + past participle. 'J'ai mangé' = I ate / I have eaten.",
    futureName: "Going-to future",
    futureNote: "The easiest French future: 'aller' + infinitive. Just like English 'I'm going to...'",
    past: {
      "Aller":  { I:{form:"suis allé",    translit:"swee a-LAY"},    you:{form:"es allé",    translit:"eh a-LAY"},     he:{form:"est allé",   translit:"eh a-LAY"},     she:{form:"est allée",  translit:"eh a-LAY"},     we:{form:"sommes allés",   translit:"som a-LAY"},     they:{form:"sont allés",  translit:"son a-LAY"} },
      "Manger": { I:{form:"ai mangé",     translit:"ay mahn-ZHAY"},  you:{form:"as mangé",   translit:"ah mahn-ZHAY"}, he:{form:"a mangé",    translit:"ah mahn-ZHAY"}, she:{form:"a mangé",    translit:"ah mahn-ZHAY"}, we:{form:"avons mangé",    translit:"a-VON mahn-ZHAY"},they:{form:"ont mangé",  translit:"on mahn-ZHAY"} },
      "Boire":  { I:{form:"ai bu",        translit:"ay boo"},        you:{form:"as bu",      translit:"ah boo"},       he:{form:"a bu",       translit:"ah boo"},       she:{form:"a bu",       translit:"ah boo"},       we:{form:"avons bu",       translit:"a-VON boo"},     they:{form:"ont bu",     translit:"on boo"} },
      "Parler": { I:{form:"ai parlé",     translit:"ay par-LAY"},    you:{form:"as parlé",   translit:"ah par-LAY"},   he:{form:"a parlé",    translit:"ah par-LAY"},   she:{form:"a parlé",    translit:"ah par-LAY"},   we:{form:"avons parlé",    translit:"a-VON par-LAY"}, they:{form:"ont parlé",  translit:"on par-LAY"} },
      "Avoir":  { I:{form:"ai eu",        translit:"ay oo"},         you:{form:"as eu",      translit:"ah oo"},        he:{form:"a eu",       translit:"ah oo"},        she:{form:"a eu",       translit:"ah oo"},        we:{form:"avons eu",       translit:"a-VON oo"},      they:{form:"ont eu",     translit:"on oo"} },
      "Être":   { I:{form:"ai été",       translit:"ay ay-TAY"},     you:{form:"as été",     translit:"ah ay-TAY"},    he:{form:"a été",      translit:"ah ay-TAY"},    she:{form:"a été",      translit:"ah ay-TAY"},    we:{form:"avons été",      translit:"a-VON ay-TAY"},  they:{form:"ont été",    translit:"on ay-TAY"} },
      "Voir":   { I:{form:"ai vu",        translit:"ay voo"},        you:{form:"as vu",      translit:"ah voo"},       he:{form:"a vu",       translit:"ah voo"},       she:{form:"a vu",       translit:"ah voo"},       we:{form:"avons vu",       translit:"a-VON voo"},     they:{form:"ont vu",     translit:"on voo"} },
    },
    future: {
      "Aller":  { I:{form:"vais aller",   translit:"vay a-LAY"},     you:{form:"vas aller",  translit:"va a-LAY"},     he:{form:"va aller",   translit:"va a-LAY"},     she:{form:"va aller",   translit:"va a-LAY"},     we:{form:"allons aller",   translit:"a-LON a-LAY"},   they:{form:"vont aller", translit:"von a-LAY"} },
      "Manger": { I:{form:"vais manger",  translit:"vay mahn-ZHAY"}, you:{form:"vas manger", translit:"va mahn-ZHAY"}, he:{form:"va manger",  translit:"va mahn-ZHAY"}, she:{form:"va manger",  translit:"va mahn-ZHAY"}, we:{form:"allons manger",  translit:"a-LON mahn-ZHAY"},they:{form:"vont manger",translit:"von mahn-ZHAY"} },
      "Parler": { I:{form:"vais parler",  translit:"vay par-LAY"},   you:{form:"vas parler", translit:"va par-LAY"},   he:{form:"va parler",  translit:"va par-LAY"},   she:{form:"va parler",  translit:"va par-LAY"},   we:{form:"allons parler",  translit:"a-LON par-LAY"}, they:{form:"vont parler",translit:"von par-LAY"} },
      "Boire":  { I:{form:"vais boire",   translit:"vay bwar"},      you:{form:"vas boire",  translit:"va bwar"},      he:{form:"va boire",   translit:"va bwar"},      she:{form:"va boire",   translit:"va bwar"},      we:{form:"allons boire",   translit:"a-LON bwar"},    they:{form:"vont boire", translit:"von bwar"} },
    },
  },

  // ---------------------------------------------------------------------------
  // URDU — past simple + future simple, MASCULINE (honest flag)
  // ---------------------------------------------------------------------------
  ur: {
    pastName: "Simple past (masculine)",
    pastNote: "Forms shown are for MALE subjects. Feminine forms use ی endings (taught later).",
    futureName: "Simple future",
    futureNote: "Urdu future tense uses -گا (masc) / -گی (fem) suffixes. Forms shown are masculine.",
    past: {
      "جانا":   { I:{form:"گیا",       translit:"gaya"},        you:{form:"گئے",       translit:"gaye"},       he:{form:"گیا",      translit:"gaya"},      she:{form:"گئی",      translit:"gayi"},      we:{form:"گئے",       translit:"gaye"},       they:{form:"گئے",       translit:"gaye"} },
      "آنا":    { I:{form:"آیا",       translit:"aaya"},        you:{form:"آئے",       translit:"aaye"},       he:{form:"آیا",      translit:"aaya"},      she:{form:"آئی",      translit:"aayi"},      we:{form:"آئے",       translit:"aaye"},       they:{form:"آئے",       translit:"aaye"} },
      "کھانا":  { I:{form:"کھایا",     translit:"khaaya"},      you:{form:"کھائے",     translit:"khaaye"},     he:{form:"کھایا",    translit:"khaaya"},    she:{form:"کھائی",    translit:"khaayi"},    we:{form:"کھائے",     translit:"khaaye"},     they:{form:"کھائے",     translit:"khaaye"} },
      "پینا":   { I:{form:"پیا",       translit:"piya"},        you:{form:"پیے",       translit:"piye"},       he:{form:"پیا",      translit:"piya"},      she:{form:"پی",       translit:"pi"},        we:{form:"پیے",       translit:"piye"},       they:{form:"پیے",       translit:"piye"} },
      "بولنا":  { I:{form:"بولا",      translit:"bola"},        you:{form:"بولے",      translit:"bole"},       he:{form:"بولا",     translit:"bola"},      she:{form:"بولی",     translit:"boli"},      we:{form:"بولے",      translit:"bole"},       they:{form:"بولے",      translit:"bole"} },
      "کرنا":   { I:{form:"کیا",       translit:"kiya"},        you:{form:"کیے",       translit:"kiye"},       he:{form:"کیا",      translit:"kiya"},      she:{form:"کی",       translit:"ki"},        we:{form:"کیے",       translit:"kiye"},       they:{form:"کیے",       translit:"kiye"} },
    },
    future: {
      "جانا":   { I:{form:"جاؤں گا",   translit:"jaaoon ga"},   you:{form:"جائیں گے",  translit:"jaayein ge"}, he:{form:"جائے گا",  translit:"jaaye ga"},  she:{form:"جائے گی",  translit:"jaaye gi"},  we:{form:"جائیں گے",  translit:"jaayein ge"}, they:{form:"جائیں گے",  translit:"jaayein ge"} },
      "آنا":    { I:{form:"آؤں گا",    translit:"aaoon ga"},    you:{form:"آئیں گے",   translit:"aayein ge"},  he:{form:"آئے گا",   translit:"aaye ga"},   she:{form:"آئے گی",   translit:"aaye gi"},   we:{form:"آئیں گے",   translit:"aayein ge"},  they:{form:"آئیں گے",   translit:"aayein ge"} },
      "کھانا":  { I:{form:"کھاؤں گا",  translit:"khaaoon ga"},  you:{form:"کھائیں گے", translit:"khaayein ge"},he:{form:"کھائے گا", translit:"khaaye ga"}, she:{form:"کھائے گی", translit:"khaaye gi"}, we:{form:"کھائیں گے", translit:"khaayein ge"},they:{form:"کھائیں گے", translit:"khaayein ge"} },
      "بولنا":  { I:{form:"بولوں گا",  translit:"boloon ga"},   you:{form:"بولیں گے",  translit:"bolein ge"},  he:{form:"بولے گا",  translit:"bole ga"},   she:{form:"بولے گی",  translit:"bole gi"},   we:{form:"بولیں گے",  translit:"bolein ge"},  they:{form:"بولیں گے",  translit:"bolein ge"} },
    },
  },

  // ---------------------------------------------------------------------------
  // HINDI — parallel to Urdu, Devanagari
  // ---------------------------------------------------------------------------
  hi: {
    pastName: "Simple past (masculine)",
    pastNote: "Forms shown are for MALE subjects. Feminine forms use ी endings (taught later).",
    futureName: "Simple future",
    futureNote: "Hindi future uses -गा (masc) / -गी (fem) suffixes. Forms shown are masculine.",
    past: {
      "जाना":   { I:{form:"गया",      translit:"gaya"},       you:{form:"गए",       translit:"gaye"},       he:{form:"गया",     translit:"gaya"},     she:{form:"गई",       translit:"gayi"},     we:{form:"गए",       translit:"gaye"},       they:{form:"गए",       translit:"gaye"} },
      "खाना":   { I:{form:"खाया",     translit:"khaaya"},     you:{form:"खाए",      translit:"khaaye"},     he:{form:"खाया",    translit:"khaaya"},   she:{form:"खाई",      translit:"khaayi"},   we:{form:"खाए",      translit:"khaaye"},     they:{form:"खाए",      translit:"khaaye"} },
      "पीना":   { I:{form:"पिया",     translit:"piya"},       you:{form:"पिए",      translit:"piye"},       he:{form:"पिया",    translit:"piya"},     she:{form:"पी",       translit:"pi"},       we:{form:"पिए",      translit:"piye"},       they:{form:"पिए",      translit:"piye"} },
      "बोलना":  { I:{form:"बोला",     translit:"bola"},       you:{form:"बोले",     translit:"bole"},       he:{form:"बोला",    translit:"bola"},     she:{form:"बोली",     translit:"boli"},     we:{form:"बोले",     translit:"bole"},       they:{form:"बोले",     translit:"bole"} },
      "आना":    { I:{form:"आया",      translit:"aaya"},       you:{form:"आए",       translit:"aaye"},       he:{form:"आया",     translit:"aaya"},     she:{form:"आई",       translit:"aayi"},     we:{form:"आए",       translit:"aaye"},       they:{form:"आए",       translit:"aaye"} },
    },
    future: {
      "जाना":   { I:{form:"जाऊँगा",   translit:"jaaoonga"},   you:{form:"जाएँगे",   translit:"jaayenge"},   he:{form:"जाएगा",   translit:"jaayega"},  she:{form:"जाएगी",    translit:"jaayegi"},  we:{form:"जाएँगे",   translit:"jaayenge"},   they:{form:"जाएँगे",   translit:"jaayenge"} },
      "खाना":   { I:{form:"खाऊँगा",   translit:"khaaoonga"},  you:{form:"खाएँगे",   translit:"khaayenge"},  he:{form:"खाएगा",   translit:"khaayega"}, she:{form:"खाएगी",    translit:"khaayegi"}, we:{form:"खाएँगे",   translit:"khaayenge"},  they:{form:"खाएँगे",   translit:"khaayenge"} },
      "बोलना":  { I:{form:"बोलूँगा",  translit:"boloonga"},   you:{form:"बोलेंगे",  translit:"bolenge"},    he:{form:"बोलेगा",  translit:"bolega"},   she:{form:"बोलेगी",   translit:"bolegi"},   we:{form:"बोलेंगे",  translit:"bolenge"},    they:{form:"बोलेंगे",  translit:"bolenge"} },
    },
  },

  // ---------------------------------------------------------------------------
  // ARABIC — past (perfect) + future (سوف + present)
  // Web-verified suffixes: -tu (I), -ta (you masc), -a (he), -at (she),
  // -naa (we), -uu (they). Reference: Kalimah Center, Wikibooks.
  // ---------------------------------------------------------------------------
  ar: {
    pastName: "Past (perfect tense)",
    pastNote: "Arabic past tense embeds the subject in suffixes. ذَهَبْتُ = I went. ذَهَبَ = he went. The 'he' form is the dictionary citation.",
    futureName: "Future (سوف + present)",
    futureNote: "Arabic future = سوف (sawfa) or س (sa-) prefix + present-tense verb. سَوْفَ أَذْهَبُ = I will go.",
    past: {
      "يذهب":   { I:{form:"ذهبتُ",    translit:"dhahabtu"},    you:{form:"ذهبتَ",    translit:"dhahabta"},    he:{form:"ذهب",     translit:"dhahaba"},   she:{form:"ذهبت",     translit:"dhahabat"},  we:{form:"ذهبنا",     translit:"dhahabnaa"},   they:{form:"ذهبوا",    translit:"dhahabuu"} },
      "يأكل":   { I:{form:"أكلتُ",    translit:"akaltu"},      you:{form:"أكلتَ",    translit:"akalta"},      he:{form:"أكل",     translit:"akala"},     she:{form:"أكلت",     translit:"akalat"},    we:{form:"أكلنا",     translit:"akalnaa"},     they:{form:"أكلوا",    translit:"akaluu"} },
      "يشرب":   { I:{form:"شربتُ",    translit:"sharibtu"},    you:{form:"شربتَ",    translit:"sharibta"},    he:{form:"شرب",     translit:"shariba"},   she:{form:"شربت",     translit:"sharibat"},  we:{form:"شربنا",     translit:"sharibnaa"},   they:{form:"شربوا",    translit:"sharibuu"} },
    },
    future: {
      "يذهب":   { I:{form:"سأذهب",    translit:"sa'adhhab"},   you:{form:"ستذهب",    translit:"satadhhab"},   he:{form:"سيذهب",   translit:"sayadhhab"}, she:{form:"ستذهب",    translit:"satadhhab"}, we:{form:"سنذهب",     translit:"sanadhhab"},   they:{form:"سيذهبون",   translit:"sayadhhabuun"} },
      "يأكل":   { I:{form:"سآكل",     translit:"sa'aakul"},    you:{form:"ستأكل",    translit:"sata'kul"},    he:{form:"سيأكل",   translit:"saya'kul"},  she:{form:"ستأكل",    translit:"sata'kul"},  we:{form:"سنأكل",     translit:"sana'kul"},    they:{form:"سيأكلون",   translit:"saya'kuluun"} },
    },
  },

  // ---------------------------------------------------------------------------
  // MANDARIN — the lesson IS that there's no tense morphology.
  // Past = verb + 了 particle. Future = 会 + verb.
  // ---------------------------------------------------------------------------
  zh: {
    pastName: "Past (with 了 particle)",
    pastNote: "Mandarin verbs DON'T change for tense. Add 了 (le) after the verb to mark completion. 我吃 = I eat. 我吃了 = I ate.",
    futureName: "Future (with 会)",
    futureNote: "Add 会 (huì) BEFORE the verb to express future intention. 我去 = I go. 我会去 = I will go.",
    past: {
      "去": { I:{form:"去了",translit:"qù le"}, you:{form:"去了",translit:"qù le"}, he:{form:"去了",translit:"qù le"}, she:{form:"去了",translit:"qù le"}, we:{form:"去了",translit:"qù le"}, they:{form:"去了",translit:"qù le"} },
      "吃": { I:{form:"吃了",translit:"chī le"},you:{form:"吃了",translit:"chī le"},he:{form:"吃了",translit:"chī le"},she:{form:"吃了",translit:"chī le"},we:{form:"吃了",translit:"chī le"},they:{form:"吃了",translit:"chī le"} },
      "喝": { I:{form:"喝了",translit:"hē le"}, you:{form:"喝了",translit:"hē le"}, he:{form:"喝了",translit:"hē le"}, she:{form:"喝了",translit:"hē le"}, we:{form:"喝了",translit:"hē le"}, they:{form:"喝了",translit:"hē le"} },
      "说": { I:{form:"说了",translit:"shuō le"},you:{form:"说了",translit:"shuō le"},he:{form:"说了",translit:"shuō le"},she:{form:"说了",translit:"shuō le"},we:{form:"说了",translit:"shuō le"},they:{form:"说了",translit:"shuō le"} },
      "看": { I:{form:"看了",translit:"kàn le"},you:{form:"看了",translit:"kàn le"},he:{form:"看了",translit:"kàn le"},she:{form:"看了",translit:"kàn le"},we:{form:"看了",translit:"kàn le"},they:{form:"看了",translit:"kàn le"} },
    },
    future: {
      "去": { I:{form:"会去",translit:"huì qù"}, you:{form:"会去",translit:"huì qù"}, he:{form:"会去",translit:"huì qù"}, she:{form:"会去",translit:"huì qù"}, we:{form:"会去",translit:"huì qù"}, they:{form:"会去",translit:"huì qù"} },
      "吃": { I:{form:"会吃",translit:"huì chī"},you:{form:"会吃",translit:"huì chī"},he:{form:"会吃",translit:"huì chī"},she:{form:"会吃",translit:"huì chī"},we:{form:"会吃",translit:"huì chī"},they:{form:"会吃",translit:"huì chī"} },
      "喝": { I:{form:"会喝",translit:"huì hē"}, you:{form:"会喝",translit:"huì hē"}, he:{form:"会喝",translit:"huì hē"}, she:{form:"会喝",translit:"huì hē"}, we:{form:"会喝",translit:"huì hē"}, they:{form:"会喝",translit:"huì hē"} },
      "说": { I:{form:"会说",translit:"huì shuō"},you:{form:"会说",translit:"huì shuō"},he:{form:"会说",translit:"huì shuō"},she:{form:"会说",translit:"huì shuō"},we:{form:"会说",translit:"huì shuō"},they:{form:"会说",translit:"huì shuō"} },
    },
  },

  // ---------------------------------------------------------------------------
  // KOREAN — past -았/었어요 + future -(으)ㄹ 거예요. Web-verified.
  // ---------------------------------------------------------------------------
  ko: {
    pastName: "Past (polite -았/었어요)",
    pastNote: "Korean polite past: replace -다 with -았어요 (after ㅏ/ㅗ) or -었어요 (other vowels). Same form for all persons.",
    futureName: "Future (-ㄹ/을 거예요)",
    futureNote: "Korean polite future: add -ㄹ 거예요 (vowel ending) or -을 거예요 (consonant ending). Same form for all persons.",
    past: {
      "가다":   { I:{form:"갔어요",   translit:"gasseoyo"},   you:{form:"갔어요",   translit:"gasseoyo"},   he:{form:"갔어요",   translit:"gasseoyo"},   she:{form:"갔어요",   translit:"gasseoyo"},   we:{form:"갔어요",   translit:"gasseoyo"},   they:{form:"갔어요",   translit:"gasseoyo"} },
      "오다":   { I:{form:"왔어요",   translit:"wasseoyo"},   you:{form:"왔어요",   translit:"wasseoyo"},   he:{form:"왔어요",   translit:"wasseoyo"},   she:{form:"왔어요",   translit:"wasseoyo"},   we:{form:"왔어요",   translit:"wasseoyo"},   they:{form:"왔어요",   translit:"wasseoyo"} },
      "먹다":   { I:{form:"먹었어요", translit:"meogeosseoyo"},you:{form:"먹었어요", translit:"meogeosseoyo"},he:{form:"먹었어요", translit:"meogeosseoyo"},she:{form:"먹었어요", translit:"meogeosseoyo"},we:{form:"먹었어요", translit:"meogeosseoyo"},they:{form:"먹었어요", translit:"meogeosseoyo"} },
      "마시다": { I:{form:"마셨어요", translit:"masyeosseoyo"},you:{form:"마셨어요", translit:"masyeosseoyo"},he:{form:"마셨어요", translit:"masyeosseoyo"},she:{form:"마셨어요", translit:"masyeosseoyo"},we:{form:"마셨어요", translit:"masyeosseoyo"},they:{form:"마셨어요", translit:"masyeosseoyo"} },
      "하다":   { I:{form:"했어요",   translit:"haesseoyo"},  you:{form:"했어요",   translit:"haesseoyo"},  he:{form:"했어요",   translit:"haesseoyo"},  she:{form:"했어요",   translit:"haesseoyo"},  we:{form:"했어요",   translit:"haesseoyo"},  they:{form:"했어요",   translit:"haesseoyo"} },
    },
    future: {
      "가다":   { I:{form:"갈 거예요",   translit:"gal geoyeyo"},  you:{form:"갈 거예요",   translit:"gal geoyeyo"},  he:{form:"갈 거예요",   translit:"gal geoyeyo"},  she:{form:"갈 거예요",   translit:"gal geoyeyo"},  we:{form:"갈 거예요",   translit:"gal geoyeyo"},  they:{form:"갈 거예요",   translit:"gal geoyeyo"} },
      "오다":   { I:{form:"올 거예요",   translit:"ol geoyeyo"},   you:{form:"올 거예요",   translit:"ol geoyeyo"},   he:{form:"올 거예요",   translit:"ol geoyeyo"},   she:{form:"올 거예요",   translit:"ol geoyeyo"},   we:{form:"올 거예요",   translit:"ol geoyeyo"},   they:{form:"올 거예요",   translit:"ol geoyeyo"} },
      "먹다":   { I:{form:"먹을 거예요", translit:"meogeul geoyeyo"},you:{form:"먹을 거예요", translit:"meogeul geoyeyo"},he:{form:"먹을 거예요", translit:"meogeul geoyeyo"},she:{form:"먹을 거예요", translit:"meogeul geoyeyo"},we:{form:"먹을 거예요", translit:"meogeul geoyeyo"},they:{form:"먹을 거예요", translit:"meogeul geoyeyo"} },
      "하다":   { I:{form:"할 거예요",   translit:"hal geoyeyo"},  you:{form:"할 거예요",   translit:"hal geoyeyo"},  he:{form:"할 거예요",   translit:"hal geoyeyo"},  she:{form:"할 거예요",   translit:"hal geoyeyo"},  we:{form:"할 거예요",   translit:"hal geoyeyo"},  they:{form:"할 거예요",   translit:"hal geoyeyo"} },
    },
  },

  // ---------------------------------------------------------------------------
  // JAPANESE — past -mashita, future = polite present + time word
  // ---------------------------------------------------------------------------
  ja: {
    pastName: "Past (polite -mashita)",
    pastNote: "Japanese polite past: replace -masu with -mashita. 行きます → 行きました. Same form for all persons.",
    futureName: "Future (polite present)",
    futureNote: "Japanese has no future tense morphologically. Use the polite -masu form + a time word like 明日 (ashita, tomorrow).",
    past: {
      "行く":   { I:{form:"行きました",translit:"ikimashita"},  you:{form:"行きました",translit:"ikimashita"},  he:{form:"行きました",translit:"ikimashita"},  she:{form:"行きました",translit:"ikimashita"},  we:{form:"行きました",translit:"ikimashita"},  they:{form:"行きました",translit:"ikimashita"} },
      "来る":   { I:{form:"来ました",  translit:"kimashita"},   you:{form:"来ました",  translit:"kimashita"},   he:{form:"来ました",  translit:"kimashita"},   she:{form:"来ました",  translit:"kimashita"},   we:{form:"来ました",  translit:"kimashita"},   they:{form:"来ました",  translit:"kimashita"} },
      "食べる": { I:{form:"食べました",translit:"tabemashita"}, you:{form:"食べました",translit:"tabemashita"}, he:{form:"食べました",translit:"tabemashita"}, she:{form:"食べました",translit:"tabemashita"}, we:{form:"食べました",translit:"tabemashita"}, they:{form:"食べました",translit:"tabemashita"} },
      "飲む":   { I:{form:"飲みました",translit:"nomimashita"}, you:{form:"飲みました",translit:"nomimashita"}, he:{form:"飲みました",translit:"nomimashita"}, she:{form:"飲みました",translit:"nomimashita"}, we:{form:"飲みました",translit:"nomimashita"}, they:{form:"飲みました",translit:"nomimashita"} },
      "する":   { I:{form:"しました",  translit:"shimashita"},  you:{form:"しました",  translit:"shimashita"},  he:{form:"しました",  translit:"shimashita"},  she:{form:"しました",  translit:"shimashita"},  we:{form:"しました",  translit:"shimashita"},  they:{form:"しました",  translit:"shimashita"} },
    },
    // Japanese future = polite present, so we omit it. Future is taught via the
    // futureNote and learners use the present form when stating future plans.
  },
};

const PERSONS = ["I", "you", "he", "she", "we", "they"];

/** Does this language have past tense data? */
export function hasPastTense(langCode) {
  const t = TENSES[langCode];
  return !!(t?.past && Object.keys(t.past).length > 0);
}

/** Does this language have future tense data? */
export function hasFutureTense(langCode) {
  const t = TENSES[langCode];
  return !!(t?.future && Object.keys(t.future).length > 0);
}

/** Get a specific tense form for a verb. */
export function getTenseForm(langCode, tense, lemma, person) {
  return TENSES[langCode]?.[tense]?.[lemma]?.[person] || null;
}

/** Is a specific (lang, lemma, tense) combination available? */
export function isTenseAvailable(langCode, lemma, tense) {
  return !!TENSES[langCode]?.[tense]?.[lemma];
}

/** Get the teaching note for a tense in a language. */
export function getTenseNote(langCode, tense) {
  const t = TENSES[langCode];
  if (!t) return null;
  if (tense === "past") return t.pastNote || null;
  if (tense === "future") return t.futureNote || null;
  return null;
}

/** Get the human-readable name for a tense (e.g. "Preterite"). */
export function getTenseName(langCode, tense) {
  const t = TENSES[langCode];
  if (!t) return null;
  if (tense === "past") return t.pastName || "Past";
  if (tense === "future") return t.futureName || "Future";
  return null;
}

/** List all (lemma, tense) pairs available for a language. */
export function listAvailableTenseVerbs(langCode) {
  const t = TENSES[langCode];
  if (!t) return [];
  const results = [];
  for (const lemma of Object.keys(t.past || {})) {
    results.push({ lemma, tense: "past" });
  }
  for (const lemma of Object.keys(t.future || {})) {
    results.push({ lemma, tense: "future" });
  }
  return results;
}

export { PERSONS };
