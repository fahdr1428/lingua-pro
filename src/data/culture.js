// =============================================================================
// CULTURE (v70) — the layer that makes this app feel like it comes from
// somewhere, rather than from a dataset.
//
// Every note answers a question a phrasebook won't: *why* do people say it that
// way, who are you allowed to say it to, and what will a native speaker notice
// if you get it slightly wrong. That last one is the whole point — the gap
// between "grammatically fine" and "sounds like you've actually been there".
//
// CONTENT RULES (same discipline as funFacts.js — this is the file most likely
// to embarrass us if it's sloppy):
//   - No invented statistics. No "X% of speakers". No made-up etymology.
//   - Nothing a native speaker would roll their eyes at.
//   - Observations over numbers. Etiquette over trivia.
//   - Where a practice varies by country/region, SAY so rather than flattening
//     it into one false rule.
//
// TAGS drive where a note surfaces:
//   etiquette — who you may say it to, and when
//   register  — formal / informal / intimate distinctions
//   sound     — pronunciation habits natives have that learners miss
//   gesture   — the body language that travels with the words
//   custom    — the practice the phrase sits inside
//
// `when` ties a note to a situation so it appears in context rather than as
// random trivia: a unit id ("u1"), a category ("Greetings"), or "any".
// =============================================================================

export const CULTURE = {
  de: [
    {
      id: "de-siezen",
      tag: "register",
      when: "Greetings",
      title: "Sie until you're invited to du",
      body: "Sie is the default with anyone you don't know: shopkeepers, officials, neighbours, colleagues you've just met. Switching to du is a small social event — someone offers it (\"Wollen wir uns duzen?\") and you accept. Using du unasked with an older stranger reads as either rude or foreign. Under-thirties and most tech workplaces have loosened this considerably, but the rule still holds outside those bubbles.",
    },
    {
      id: "de-gruss",
      tag: "etiquette",
      when: "Greetings",
      title: "You greet the room, not the person",
      body: "Walking into a doctor's waiting room, a small shop or a lift, people say Guten Tag to nobody in particular — and it is genuinely noticed if you don't. Leaving gets an Auf Wiedersehen or Tschüss on the way out. It costs nothing and it is the single fastest way to stop reading as a tourist.",
    },
    {
      id: "de-directness",
      tag: "custom",
      when: "any",
      title: "Directness is not rudeness",
      body: "\"Das ist falsch\" — that's wrong — is a normal thing for a German colleague to say, and it is about the work, not about you. The softening layers English uses (\"I wonder whether we might…\") are often read as vague or evasive rather than polite. It cuts both ways: praise, when it comes, means it.",
    },
    {
      id: "de-servus",
      tag: "sound",
      when: "any",
      title: "Hallo, Servus, Moin, Grüß Gott",
      body: "Which hello you use places you on a map. Moin is the north — Hamburg, Bremen, and used at any hour despite meaning morning. Grüß Gott and Servus are Bavaria and Austria. Hallo works everywhere and marks you as from nowhere in particular, which is usually the right call while you're learning.",
    },
    {
      id: "de-verb-end",
      tag: "sound",
      when: "u9",
      title: "The verb arrives last, and you must wait for it",
      body: "\"Ich glaube, dass er das Buch gestern in der Bibliothek vergessen hat.\" The thing he did — forgot — lands at the very end. Germans hold the whole sentence in their head and resolve it at the close. Learners tend to panic halfway through. Expect the wait rather than fighting it, and listening gets dramatically easier.",
    },
    {
      id: "de-ordnung",
      tag: "custom",
      when: "u13",
      title: "Anmeldung, Termin, and the paper that runs everything",
      body: "Registering your address (Anmeldung) within two weeks of moving is a legal requirement, and almost nothing else — bank account, phone contract, tax number — happens without the certificate it produces. Everything runs on the Termin, a booked appointment, often weeks out. Turning up without one usually means being sent away, politely.",
    },
    {
      id: "de-punctual",
      tag: "etiquette",
      when: "u8",
      title: "On time means five minutes early",
      body: "Arriving at the agreed minute is already slightly late for a private invitation and unambiguously late for anything professional. If you're going to be more than a few minutes behind, the expectation is that you message. This is real rather than a stereotype, and it is one of the easiest things to get right.",
    },
    {
      id: "de-du-siezen-kids",
      tag: "register",
      when: "u3",
      title: "Children, animals and God get du",
      body: "The du/Sie line has fixed exceptions: children up to roughly sixteen, pets, and — in prayer — God. Students address teachers as Sie; teachers address students as du until the upper years, when many schools switch to Sie as a small ceremony of adulthood.",
    },
    {
      id: "de-brot",
      tag: "custom",
      when: "any",
      title: "Bread is a serious subject",
      body: "There are several hundred registered bread varieties, most bakeries sell out of the good ones by mid-morning, and Abendbrot — literally evening bread — is a real meal: bread, cheese, cold cuts, eaten cold, on a weeknight. Asking a German which bakery is best is an excellent way to start a long conversation.",
    },
    {
      id: "de-handshake",
      tag: "gesture",
      when: "u2",
      title: "Handshake, eye contact, and your name",
      body: "Introductions come with a firm handshake, direct eye contact, and often just your surname. Eye contact matters again when clinking glasses — look each person in the eye as you say Prost, one at a time. Skipping it is a running superstition about seven years of bad luck, and everyone will notice.",
    },
  ],
  ur: [
    {
      id: "ur-salam",
      tag: "etiquette",
      when: "Greetings",
      title: "The greeting is a duty, and it's owed back",
      body: "Assalam-o-alaikum isn't small talk — answering it is considered an obligation, which is why the reply (wa alaikum assalam) is fixed rather than improvised. Custom holds that the person arriving greets first, and the younger person greets the elder.",
    },
    {
      id: "ur-aap",
      tag: "register",
      when: "u2",
      title: "Three levels of 'you' — pick wrong and it stings",
      body: "Aap is respectful, tum is familiar, tu is intimate or insulting depending entirely on who's listening. Learners are safe with aap for everyone; a stranger addressed as tu will notice immediately. Even siblings often use aap in more traditional families.",
    },
    {
      id: "ur-nastaliq",
      tag: "sound",
      when: "any",
      title: "Nastaliq slopes, and so does the reading",
      body: "Urdu is written in Nastaliq, which flows diagonally down-and-left rather than sitting flat on the line. Words cascade instead of marching. Reading it feels less like decoding letters and more like following a brushstroke — that's a feature, not an obstacle.",
    },
    {
      id: "ur-shukriya",
      tag: "etiquette",
      when: "Greetings",
      title: "Thanks are quieter than in English",
      body: "Shukriya is real but used more sparingly than English 'thank you'. Between close family, thanking someone for an ordinary kindness can sound oddly formal — like you're putting distance between you. Warmth is shown by insisting they eat more, not by repeated thanks.",
    },
    {
      id: "ur-chai",
      tag: "custom",
      when: "Food",
      title: "Refusing chai once means nothing",
      body: "The first refusal is treated as politeness rather than an answer, so the offer comes again. Accepting on the second or third pass is the normal rhythm. If you genuinely can't, the graceful exit is to accept a small cup rather than none.",
    },
    {
      id: "ur-inshallah",
      tag: "register",
      when: "u8",
      title: "Future tense comes with a clause attached",
      body: "Plans are habitually softened with inshallah (God willing). It functions grammatically like 'hopefully' but socially like a full stop — stating a future fact flatly can sound presumptuous. Kal milenge, inshallah is the natural shape.",
    },
    {
      id: "ur-beta",
      tag: "etiquette",
      when: "Family",
      title: "Family words are used on strangers",
      body: "Beta (child), baji (older sister), bhai (brother), uncle and auntie are the normal way to address people you aren't related to. A shopkeeper your father's age is uncle. Using someone's bare first name can read as cold.",
    },
    {
      id: "ur-poetry",
      tag: "custom",
      when: "any",
      title: "Quoting poetry mid-conversation is normal",
      body: "A couplet dropped into ordinary speech is a mark of education, not pretension, and mushaira (live poetry gatherings) draw crowds who call out encouragement after every line. Ghalib and Iqbal get quoted the way English speakers quote song lyrics.",
    },
  ],

  es: [
    {
      id: "es-tu-usted",
      tag: "register",
      when: "u2",
      title: "Tú or usted — and Spain isn't Latin America",
      body: "Spain has moved strongly toward tú, even with strangers and shopkeepers; much of Latin America stays with usted far longer, and in Colombia usted is used even inside families. When unsure, match whatever the other person uses on you.",
    },
    {
      id: "es-vosotros",
      tag: "register",
      when: "u2",
      title: "Vosotros only exists on one side of the Atlantic",
      body: "Spain uses vosotros for plural 'you'; Latin America uses ustedes for everyone, formal or not. Neither is more correct — but using vosotros in Mexico marks you instantly as someone who learned Spanish in Spain.",
    },
    {
      id: "es-dos-besos",
      tag: "gesture",
      when: "Greetings",
      title: "Two kisses, starting right",
      body: "In Spain, greeting means a light kiss on each cheek — right cheek first — between women, and between a woman and a man. Men usually shake hands or embrace. In much of Latin America it's one kiss, or none. Watch and follow rather than initiate.",
    },
    {
      id: "es-ser-estar",
      tag: "register",
      when: "u6",
      title: "Two verbs for 'to be', and the difference is meaning",
      body: "Ser is essence, estar is state — and swapping them changes what you said, not just how well you said it. Es aburrido means he is a boring person; está aburrido means he's bored right now. Learners' funniest mistakes live here.",
    },
    {
      id: "es-sobremesa",
      tag: "custom",
      when: "Food",
      title: "The meal isn't over when the food is",
      body: "Sobremesa is the stretch of conversation after eating, when nobody moves and nobody asks for the bill. It can outlast the meal itself. Standing up to leave promptly after the last plate reads as abrupt.",
    },
    {
      id: "es-horario",
      tag: "custom",
      when: "Time",
      title: "The clock runs late by British standards",
      body: "In Spain lunch is commonly 2pm and dinner 9pm or later, and shops in smaller towns still close in the afternoon. 'Por la tarde' stretches until sunset, so it covers what English would split into afternoon and evening.",
    },
    {
      id: "es-diminutive",
      tag: "register",
      when: "any",
      title: "-ito makes things kinder, not smaller",
      body: "Un momentito isn't a shorter moment than un momento — it's a softer request. Diminutives carry affection and politeness, and in Andalusia and much of Latin America they're sprinkled through everything.",
    },
    {
      id: "es-r",
      tag: "sound",
      when: "any",
      title: "The rolled r is a tap, not a growl",
      body: "Single r between vowels is one quick flick of the tongue tip — the same sound as the middle of British English 'very' said fast. Only rr and word-initial r get the full trill. Learners overdo the trill and under-do the tap.",
    },
  ],

  fr: [
    {
      id: "fr-bonjour",
      tag: "etiquette",
      when: "Greetings",
      title: "Bonjour is not optional",
      body: "Entering a shop, a lift, a waiting room, or a doctor's surgery without saying bonjour first is read as genuine rudeness, and it's the single most common reason travellers find Parisians cold. Say it before anything else — before the question, before the request.",
    },
    {
      id: "fr-tu-vous",
      tag: "register",
      when: "u2",
      title: "Vous until invited otherwise",
      body: "Vous is the default with any adult you don't know, including people your own age. Switching to tu is a small social event — there's a verb for it, tutoyer — and it's normally the older or more senior person who offers. Wait to be invited.",
    },
    {
      id: "fr-liaison",
      tag: "sound",
      when: "any",
      title: "Silent letters wake up before vowels",
      body: "Final consonants are usually silent, but they reappear when the next word starts with a vowel: nous avons becomes nou-zavons, petit ami becomes peti-tami. This liaison is what makes spoken French run together into one stream.",
    },
    {
      id: "fr-bonne-journee",
      tag: "etiquette",
      when: "Greetings",
      title: "Leaving has its own script",
      body: "You don't just say au revoir — you close with bonne journée (have a good day) or bonne soirée in the evening. Shop staff will say it to you and expect it back. Merci, au revoir, bonne journée as one breath is completely standard.",
    },
    {
      id: "fr-repas",
      tag: "custom",
      when: "Food",
      title: "Bread on the table, not on a plate",
      body: "Bread is placed directly on the tablecloth beside your plate, torn rather than cut, and used to help food onto the fork. Asking for butter with bread at dinner is a distinctly non-French move.",
    },
    {
      id: "fr-quatre-vingt",
      tag: "register",
      when: "Numbers",
      title: "Seventy to ninety-nine does arithmetic",
      body: "France counts 70 as soixante-dix (sixty-ten), 80 as quatre-vingts (four twenties), and 97 as quatre-vingt-dix-sept. Belgium and Switzerland spared themselves this with septante and nonante — and the French find that quaint.",
    },
    {
      id: "fr-si",
      tag: "register",
      when: "any",
      title: "There's a special yes for contradicting",
      body: "French has a third answer word: si. Use it to disagree with a negative question. 'Tu n'as pas faim?' — 'Si!' means yes, I am hungry. Answering oui there sounds wrong to a native ear.",
    },
    {
      id: "fr-la-bise",
      tag: "gesture",
      when: "Greetings",
      title: "La bise, and the number varies by region",
      body: "Cheek kisses between friends and family are standard, but how many depends on where you are — two in Paris, three or four in parts of the south and west. Locals argue about it. When in doubt, offer two and follow their lead.",
    },
  ],

  tr: [
    {
      id: "tr-hosgeldin",
      tag: "etiquette",
      when: "Greetings",
      title: "Welcome comes with a fixed reply",
      body: "Hoş geldin (welcome) is answered with hoş bulduk — roughly 'we found it pleasant'. It's a pair, like a call and response, and leaving the second half out makes the exchange feel unfinished.",
    },
    {
      id: "tr-vowel-harmony",
      tag: "sound",
      when: "any",
      title: "Endings change shape to match the word",
      body: "Turkish suffixes shift their vowels to agree with the vowels already in the word — evde (at home) but okulda (at school). Once your ear picks up the pattern you start guessing endings correctly without being taught them.",
    },
    {
      id: "tr-tea",
      tag: "custom",
      when: "Food",
      title: "Çay arrives whether or not you asked",
      body: "Tea is served in small tulip-shaped glasses, held by the rim, and offering it is a basic act of hospitality — in shops, offices, and barbers. It comes constantly and refusing outright is awkward; leaving a little in the glass signals you've had enough.",
    },
    {
      id: "tr-kolay-gelsin",
      tag: "etiquette",
      when: "any",
      title: "There's a phrase for someone mid-work",
      body: "Kolay gelsin — 'may it come easy' — is said to anyone you find working: a driver, a waiter, a cleaner, a colleague. English has no equivalent, and using it correctly marks you as someone who has actually spent time in Turkey.",
    },
    {
      id: "tr-abi-abla",
      tag: "etiquette",
      when: "Family",
      title: "Older brother and sister are titles for strangers",
      body: "Abi (older brother) and abla (older sister) attach to the names of people slightly older than you, related or not — Ahmet abi, Ayşe abla. A taxi driver is abi. Skipping it with someone older can sound blunt.",
    },
    {
      id: "tr-afiyet",
      tag: "custom",
      when: "Food",
      title: "Afiyet olsun comes after, not before",
      body: "Unlike bon appétit, afiyet olsun is commonly said after the meal as well as before, and to the person who cooked. The cook's reply is ellerine sağlık — 'health to your hands'.",
    },
    {
      id: "tr-nazar",
      tag: "custom",
      when: "any",
      title: "The blue eye is everywhere and it's practical",
      body: "The nazar boncuğu hangs in shops, on babies' clothes, in cars, on aeroplanes. It guards against the evil eye — envy directed at good fortune — which is why complimenting a baby too enthusiastically is often followed by a quick maşallah.",
    },
    {
      id: "tr-no-gender",
      tag: "register",
      when: "u2",
      title: "One word covers he, she and it",
      body: "O does all three, and Turkish has no grammatical gender at all. Speakers switching to English often say 'he' about a woman for exactly this reason — the distinction simply isn't in their first language.",
    },
  ],

  hi: [
    {
      id: "hi-namaste",
      tag: "gesture",
      when: "Greetings",
      title: "Namaste is hands, not just a word",
      body: "Palms together at the chest, a slight bow, no handshake needed — and it works at any distance across a room. It's respectful in every direction, which makes it the safest greeting a learner can use with an elder or a stranger.",
    },
    {
      id: "hi-aap-tum",
      tag: "register",
      when: "u2",
      title: "Aap, tum, tu — respect is built into the verb",
      body: "Aap is respectful, tum familiar, tu intimate or rude by context. The verb ending changes with each, so choosing a pronoun commits the whole sentence. Aap is the safe default for anyone older or unknown.",
    },
    {
      id: "hi-ji",
      tag: "etiquette",
      when: "Greetings",
      title: "Adding -ji makes anything polite",
      body: "Attach ji to a name or title and it becomes respectful — Rahul-ji, uncle-ji, and even haan-ji for a courteous yes. It's the cheapest politeness upgrade in the language and natives use it constantly.",
    },
    {
      id: "hi-head-nod",
      tag: "gesture",
      when: "any",
      title: "The side-to-side tilt means yes",
      body: "A gentle rocking tilt of the head signals agreement, listening, or 'go on' — not the refusal a Western reading suggests. Learners routinely misread it as hesitation when the speaker is actually agreeing with them.",
    },
    {
      id: "hi-no-thanks",
      tag: "etiquette",
      when: "Food",
      title: "Dhanyavaad is more formal than it looks",
      body: "In everyday Hindi, thanks is often carried by tone and gesture rather than the word. Dhanyavaad can sound stiff between friends; shukriya is warmer and widely used, and among family a thank-you for a small act may be skipped entirely.",
    },
    {
      id: "hi-food-refusal",
      tag: "custom",
      when: "Food",
      title: "Bas is a request, not a decision",
      body: "Guests are served more regardless of protest, and 'bas, bas' (enough) will be politely ignored at least once. Covering the plate lightly with a hand is the more effective signal, and leaving a little food shows you were served generously.",
    },
    {
      id: "hi-english-mix",
      tag: "register",
      when: "any",
      title: "Hinglish is ordinary speech, not slang",
      body: "Urban conversation switches between Hindi and English mid-sentence without anyone noticing. Words like train, phone, office and sorry are simply the normal words. Insisting on pure Hindi vocabulary can sound more formal than a native would ever be.",
    },
    {
      id: "hi-feet",
      tag: "gesture",
      when: "Family",
      title: "Feet carry meaning",
      body: "Touching an elder's feet is a gesture of deep respect at weddings, festivals and departures; pointing your feet at someone, or stepping over a person, is the opposite. Shoes come off at the door of a home almost everywhere.",
    },
  ],

  ar: [
    {
      id: "ar-salam-reply",
      tag: "etiquette",
      when: "Greetings",
      title: "The reply is longer than the greeting",
      body: "As-salamu alaykum is answered wa alaykum as-salam, and a warmer reply extends it further with wa rahmatullahi wa barakatuh. Returning a greeting is treated as owed rather than optional, and the fuller the return, the warmer the intent.",
    },
    {
      id: "ar-fusha",
      tag: "register",
      when: "any",
      title: "Nobody's mother tongue is the written language",
      body: "Modern Standard Arabic is the Arabic of news, books and formal speech; everyday conversation happens in dialect — Egyptian, Levantine, Gulf, Maghrebi — and they differ enough that speakers sometimes switch to MSA to be sure. Learn MSA to read, learn a dialect to chat.",
    },
    {
      id: "ar-inshallah",
      tag: "register",
      when: "u8",
      title: "Inshallah does real grammatical work",
      body: "Any statement about the future is normally followed by inshallah. It isn't hedging or evasion — a flat future claim sounds arrogant, because outcomes aren't treated as the speaker's to guarantee.",
    },
    {
      id: "ar-right-hand",
      tag: "etiquette",
      when: "Food",
      title: "The right hand does the giving",
      body: "Eating, passing, receiving and handing over money are all right-handed; the left is reserved for washing. Offering something with the left hand reads as careless even from a foreigner, and it's an easy habit to fix early.",
    },
    {
      id: "ar-ayn",
      tag: "sound",
      when: "any",
      title: "Some sounds come from the throat, not the mouth",
      body: "ع (ayn), ح (ha) and ق (qaf) are produced deeper in the throat than anything in English, which is why transliterations resort to apostrophes and numbers. Nobody masters ayn quickly, and every native has heard learners approximate it — approximate confidently.",
    },
    {
      id: "ar-coffee",
      tag: "custom",
      when: "Food",
      title: "Hospitality is a serious matter",
      body: "Coffee or tea is offered immediately and repeatedly, and a guest is fed before being asked anything. In much of the Gulf, gently shaking the small cup side to side signals you've had enough — otherwise it keeps being refilled.",
    },
    {
      id: "ar-script-vowels",
      tag: "sound",
      when: "any",
      title: "The short vowels aren't written",
      body: "Everyday Arabic text prints consonants and long vowels only; short vowels are marks that appear in the Qur'an, poetry and children's books. Readers supply them from knowing the word — which is why reading fluency and vocabulary grow together.",
    },
    {
      id: "ar-calligraphy",
      tag: "custom",
      when: "any",
      title: "Writing is the visual art form",
      body: "Because figurative religious imagery is largely avoided, calligraphy became the central decorative art — on mosques, manuscripts, tilework and modern logos. The script you're learning to read doubles as the region's great tradition of design.",
    },
  ],

  bn: [
    {
      id: "bn-namaskar",
      tag: "etiquette",
      when: "Greetings",
      title: "The greeting depends on community",
      body: "Nomoshkar with palms together is the common Bengali Hindu greeting; assalamu alaikum is standard among Bengali Muslims, including across most of Bangladesh. Kemon achho (how are you) works warmly for everyone.",
    },
    {
      id: "bn-tumi",
      tag: "register",
      when: "u2",
      title: "Three yous, and poetry uses the intimate one",
      body: "Apni is respectful, tumi familiar, tui intimate between close friends and siblings. Tui from a stranger is an insult; tui in a Tagore song is tenderness. Start with apni and let people invite you down.",
    },
    {
      id: "bn-adda",
      tag: "custom",
      when: "any",
      title: "Adda is a recognised activity",
      body: "Long, aimless, argumentative conversation over tea — about politics, film, football, anything — has its own name and its own cultural prestige. Being good at adda is a genuine social skill in Kolkata and Dhaka alike.",
    },
    {
      id: "bn-fish-rice",
      tag: "custom",
      when: "Food",
      title: "Machh bhaat is identity, not just dinner",
      body: "Fish and rice sit at the centre of Bengali cooking on both sides of the border, and the order dishes are eaten in — bitter first, sweet last — is genuinely structured. Mishti (sweets) close a meal and accompany every celebration.",
    },
    {
      id: "bn-no-gender",
      tag: "register",
      when: "u2",
      title: "No grammatical gender at all",
      body: "Bengali verbs and adjectives don't change for gender, and one pronoun covers he and she. After Hindi or Spanish this removes an entire category of mistakes — a real gift to learners.",
    },
    {
      id: "bn-language-day",
      tag: "custom",
      when: "any",
      title: "People died for this language",
      body: "On 21 February 1952, students in Dhaka were killed protesting for Bengali to be recognised as an official language of Pakistan. That date is now UNESCO's International Mother Language Day. Bengali speakers do not treat their language casually.",
    },
    {
      id: "bn-o-sound",
      tag: "sound",
      when: "any",
      title: "The inherent vowel leans toward 'o'",
      body: "Where Hindi reads the default vowel as 'a', Bengali leans to 'o' — the same letter shapes are voiced differently, so ক is 'ko' rather than 'ka'. Learners coming from Devanagari have to retune their ear before the script clicks.",
    },
    {
      id: "bn-dada",
      tag: "etiquette",
      when: "Family",
      title: "Kinship words for everyone",
      body: "Dada (older brother), didi (older sister), kaku and mashi (uncle and aunt) are used for neighbours, shopkeepers and colleagues. Addressing an older stranger by bare name is unusual; addressing them as dada is normal.",
    },
  ],

  ko: [
    {
      id: "ko-speech-levels",
      tag: "register",
      when: "u2",
      title: "Politeness is a verb ending, and it's not optional",
      body: "Korean encodes respect in the sentence itself. -yo is the everyday polite ending; -습니다 is formal; plain endings are for close friends and juniors. Using plain speech with someone older is a real breach, not a stylistic choice.",
    },
    {
      id: "ko-nunchi",
      tag: "custom",
      when: "any",
      title: "Nunchi — reading the room is a named skill",
      body: "Sensing the unspoken mood and adjusting to it is treated as a competence you can be praised or criticised for. Much of what feels indirect in Korean conversation is nunchi doing the work that blunt words would do in English.",
    },
    {
      id: "ko-age",
      tag: "etiquette",
      when: "u2",
      title: "Age gets established early on purpose",
      body: "Asking someone's age soon after meeting isn't nosy — it settles which speech level and which kinship terms apply. Oppa, hyung, nuna and unni all depend on relative age, so the question is practical.",
    },
    {
      id: "ko-two-hands",
      tag: "gesture",
      when: "any",
      title: "Give and receive with both hands",
      body: "Cards, gifts, money and drinks pass with two hands, or with the right hand while the left touches the forearm. When an elder pours you a drink, turning slightly away to drink it is the respectful move.",
    },
    {
      id: "ko-hangul",
      tag: "sound",
      when: "any",
      title: "Hangul was designed, and it shows",
      body: "Commissioned by King Sejong in the 15th century to make literacy achievable, its consonant shapes sketch the position of the mouth and tongue. Most learners read it within days — the script is the easiest part of Korean, not the hardest.",
    },
    {
      id: "ko-food-share",
      tag: "custom",
      when: "Food",
      title: "Dishes are communal by default",
      body: "Stews and side dishes sit in the middle and everyone eats from them; banchan are refilled free. The youngest at the table often pours for others, and the eldest is expected to start eating first.",
    },
    {
      id: "ko-jeong",
      tag: "custom",
      when: "any",
      title: "Jeong — the bond that accumulates",
      body: "Jeong is the attachment that builds up between people who share time, meals and hardship. It explains why relationships in Korea often feel obligated in a way English 'friendship' doesn't capture, and why leaving a group is a bigger deal.",
    },
    {
      id: "ko-final-consonant",
      tag: "sound",
      when: "any",
      title: "Final consonants get swallowed",
      body: "A consonant at the end of a syllable is released only faintly — 밥 (bap) ends with the lips closing, not a puff of air. Overpronouncing final consonants is the fastest way to sound foreign even with perfect vocabulary.",
    },
  ],

  ja: [
    {
      id: "ja-keigo",
      tag: "register",
      when: "u2",
      title: "Politeness is a whole parallel vocabulary",
      body: "Beyond polite endings, keigo swaps in different verbs entirely for respect and humility — taberu becomes itadaku when you're the one eating. Even Japanese speakers find keigo demanding; nobody expects a learner to have it, and the polite -masu forms are genuinely enough.",
    },
    {
      id: "ja-no-you",
      tag: "register",
      when: "u2",
      title: "Good Japanese avoids saying 'you'",
      body: "Anata is technically 'you' but sounds distant or even confrontational in most conversation, and between spouses it means 'dear'. Speakers use the person's name plus -san instead, or drop the subject entirely.",
    },
    {
      id: "ja-three-scripts",
      tag: "sound",
      when: "any",
      title: "Three scripts, each with a job",
      body: "Hiragana carries grammar, katakana marks foreign words and emphasis, kanji supplies meaning-dense roots — and all three appear in one sentence. It isn't redundancy: with no spaces between words, the script changes tell your eye where words begin.",
    },
    {
      id: "ja-bow",
      tag: "gesture",
      when: "Greetings",
      title: "The bow's depth is the message",
      body: "A slight nod suits a colleague; a deeper, slower bow shows respect or apology. Bowing while talking on the phone is common and unselfconscious. Handshakes are offered to foreigners but aren't the native default.",
    },
    {
      id: "ja-itadakimasu",
      tag: "custom",
      when: "Food",
      title: "Meals are bracketed by set phrases",
      body: "Itadakimasu before eating and gochisousama deshita after are close to universal, said even when eating alone. They acknowledge everyone who brought the food to the table, not just the cook.",
    },
    {
      id: "ja-silence",
      tag: "custom",
      when: "any",
      title: "Silence is participation",
      body: "Pauses in Japanese conversation aren't gaps to be filled. Rushing to fill them, or pressing for an immediate answer, can read as pushy — the pause may be consideration or a polite way of declining.",
    },
    {
      id: "ja-pitch",
      tag: "sound",
      when: "any",
      title: "Pitch, not stress",
      body: "English marks stressed syllables with force; Japanese distinguishes words by pitch pattern instead — hashi can be chopsticks or bridge depending on where the pitch drops. Speak flatter than instinct suggests and you'll sound closer.",
    },
    {
      id: "ja-honne",
      tag: "register",
      when: "any",
      title: "Honne and tatemae — inner and public face",
      body: "The gap between what's privately felt and what's publicly appropriate is an accepted, named feature of social life rather than hypocrisy. 'Chotto muzukashii' (a little difficult) is very often a no.",
    },
  ],

  zh: [
    {
      id: "zh-tones",
      tag: "sound",
      when: "any",
      title: "Tone is spelling, not expression",
      body: "Mā, má, mǎ, mà are four different words. Getting the tone wrong isn't an accent — it's a different word, which is why listeners genuinely can't guess your meaning. Learn each word with its tone attached from the first day.",
    },
    {
      id: "zh-characters",
      tag: "sound",
      when: "any",
      title: "Characters carry meaning, not sound",
      body: "A character tells you what a word means, not reliably how it's said — which is how speakers of mutually unintelligible varieties can read the same page. Many characters combine a meaning hint with a sound hint, so they get more guessable as you learn more.",
    },
    {
      id: "zh-simplified",
      tag: "register",
      when: "any",
      title: "Two written standards",
      body: "Mainland China and Singapore use simplified characters; Taiwan, Hong Kong and Macau use traditional. Same language, different strokes. Which you learn depends on where you're headed — and readers of one can usually manage the other.",
    },
    {
      id: "zh-numbers-luck",
      tag: "custom",
      when: "Numbers",
      title: "Some numbers cost more than others",
      body: "Eight sounds close to the word for prosperity and is prized; four sounds close to the word for death and is avoided — buildings skip fourth floors, and phone numbers and plates are priced accordingly. This is practical, not folklore.",
    },
    {
      id: "zh-chi-le-ma",
      tag: "etiquette",
      when: "Greetings",
      title: "'Have you eaten?' is a greeting",
      body: "Chī le ma? functions as a warm hello rather than an invitation, with roots in eras when the answer mattered. A simple chī le (I've eaten) closes it politely — treating it as a literal question can confuse the exchange.",
    },
    {
      id: "zh-two-hands-card",
      tag: "gesture",
      when: "any",
      title: "Both hands for cards and gifts",
      body: "Business cards are given and received with two hands and read before being put away. Gifts may be politely refused once or twice before acceptance, and are usually not opened in front of the giver.",
    },
    {
      id: "zh-measure-words",
      tag: "register",
      when: "Numbers",
      title: "You can't count nouns bare",
      body: "Between a number and a noun sits a measure word — yī gè rén, sān běn shū. Gè is the general-purpose fallback that will always be understood, and using the precise one (běn for books, zhī for pens) is what sounds fluent.",
    },
    {
      id: "zh-guanxi",
      tag: "custom",
      when: "any",
      title: "Guanxi — the network is the infrastructure",
      body: "Relationships built on reciprocal favours over time carry real weight in work and daily life. It isn't corruption or mere networking; it's an expectation that trust is accumulated between people, not granted by institutions.",
    },
  ],

  pa: [
    {
      id: "pa-two-scripts",
      tag: "sound",
      when: "any",
      title: "One language, two alphabets",
      body: "Punjabi in Pakistan is written in Shahmukhi, a Perso-Arabic script read right to left; in Indian Punjab it's written in Gurmukhi, left to right. Speech is shared, the page is not. This course teaches Shahmukhi.",
    },
    {
      id: "pa-sat-sri-akal",
      tag: "etiquette",
      when: "Greetings",
      title: "The greeting signals community",
      body: "Sat sri akal is the Sikh greeting, hands together; assalam-o-alaikum is used among Punjabi Muslims across Pakistani Punjab. Ki haal hai (how are you) is neutral and warm in every direction.",
    },
    {
      id: "pa-tones",
      tag: "sound",
      when: "any",
      title: "Punjabi has tone — unusually for the region",
      body: "Unlike Urdu or Hindi, Punjabi distinguishes some words by pitch, a trace of older aspirated consonants. Native speakers do it without thinking; learners often miss it and are still understood from context.",
    },
    {
      id: "pa-langar",
      tag: "custom",
      when: "Food",
      title: "Langar — the free kitchen",
      body: "Every gurdwara serves a free communal meal to anyone who comes, seated together on the floor regardless of status. Amritsar's Golden Temple feeds tens of thousands daily. The practice is a deliberate statement about equality.",
    },
    {
      id: "pa-warmth",
      tag: "register",
      when: "any",
      title: "Volume is affection",
      body: "Punjabi conversation runs loud, direct and physical by the standards of neighbouring languages. What sounds like an argument is often ordinary enthusiasm — and understatement can read as coldness.",
    },
    {
      id: "pa-bhangra",
      tag: "custom",
      when: "any",
      title: "Harvest music went global",
      body: "Bhangra began as Punjabi harvest dance and became one of the most exportable musical forms in South Asia, feeding into British club music from the 1980s onward. Punjabi lyrics reach far past Punjabi speakers.",
    },
    {
      id: "pa-ji",
      tag: "etiquette",
      when: "Greetings",
      title: "Ji goes on the end of everything",
      body: "Ji softens and honours — attached to names, to haan (yes), or standing alone as a respectful acknowledgement. It's the simplest way to sound courteous rather than curt.",
    },
    {
      id: "pa-partition",
      tag: "custom",
      when: "any",
      title: "The language sits across a border",
      body: "Punjab was divided in 1947, and Punjabi is now spoken on both sides by communities separated from relatives and shrines. Poetry and song from before partition — Bulleh Shah, Waris Shah — are shared inheritance for both.",
    },
  ],

  id: [
    {
      id: "id-no-tense",
      tag: "register",
      when: "any",
      title: "Verbs don't conjugate. At all.",
      body: "Makan is eat, ate, will eat and eating. Time is set by a separate word — sudah (already), akan (will), sedang (currently). No endings, no irregular verbs, no agreement. This is a large part of why Indonesian is considered so approachable.",
    },
    {
      id: "id-plural",
      tag: "register",
      when: "any",
      title: "Doubling makes plurals",
      body: "Buku is book, buku-buku is books — and often it's just left singular because context handles it. Repetition also does other work: jalan-jalan (walk) means to stroll or go out, not to walk twice.",
    },
    {
      id: "id-names",
      tag: "etiquette",
      when: "Greetings",
      title: "Bapak and Ibu carry the respect",
      body: "Address adults as Bapak/Pak (sir) and Ibu/Bu (madam) plus their first name — Pak Joko, Bu Sri. Many Indonesians, especially Javanese, have only one name, so surnames can't be relied on.",
    },
    {
      id: "id-right-hand",
      tag: "gesture",
      when: "Food",
      title: "Right hand, and never point with a finger",
      body: "Give, receive and eat with the right hand. Pointing is done with the thumb or an open hand rather than the index finger, and touching an adult's head is best avoided. Shoes come off entering homes and mosques.",
    },
    {
      id: "id-jam-karet",
      tag: "custom",
      when: "Time",
      title: "Jam karet — rubber time",
      body: "Social schedules stretch, and the phrase for it is affectionate rather than apologetic. Business and flights run on the clock; a gathering that says 7pm may fill up considerably later.",
    },
    {
      id: "id-halus",
      tag: "register",
      when: "any",
      title: "Directness is avoided on purpose",
      body: "Flat disagreement and blunt no are softened — belum (not yet) frequently stands in for no, and a smile can accompany bad news. Reading the indirect answer correctly matters more than the vocabulary.",
    },
    {
      id: "id-loanwords",
      tag: "sound",
      when: "any",
      title: "You already know some of it",
      body: "Centuries of trade and Dutch rule left recognisable words everywhere — kantor (office), buku (book), polisi, televisi, kamar (room). Sanskrit and Arabic layers sit beneath, so the vocabulary is unusually welcoming.",
    },
    {
      id: "id-lingua-franca",
      tag: "custom",
      when: "any",
      title: "Almost nobody's first language",
      body: "Indonesian was standardised from Malay to unite a country with hundreds of local languages. Most Indonesians grow up speaking Javanese, Sundanese or another regional language at home — so everyone is, in a sense, a learner too.",
    },
  ],

  pcm: [
    {
      id: "pcm-not-broken",
      tag: "register",
      when: "any",
      title: "It's a language, not bad English",
      body: "Nigerian Pidgin has its own consistent grammar, tense markers and vocabulary, and tens of millions speak it daily — including on the BBC's Pidgin service. Treating it as broken English is both wrong and audibly condescending.",
    },
    {
      id: "pcm-dey",
      tag: "register",
      when: "any",
      title: "Dey and go carry the tenses",
      body: "I dey go is I'm going; I go go is I will go; I don go is I've gone. Tense is marked by small standalone words rather than by changing the verb — regular, learnable, and nothing like English's irregular past forms.",
    },
    {
      id: "pcm-oga",
      tag: "etiquette",
      when: "Greetings",
      title: "Respect words do heavy lifting",
      body: "Oga (boss), ma, sir, aunty and uncle are used generously with anyone older or in charge, related or not. Age hierarchy is taken seriously across Nigeria, and skipping the title is what reads as rude.",
    },
    {
      id: "pcm-o",
      tag: "sound",
      when: "any",
      title: "The particles are the personality",
      body: "O, sha, na and abi at the end of a sentence carry emphasis, doubt or appeal — Na true o. You dey come, abi? Dropping them leaves you grammatically correct and completely flat.",
    },
    {
      id: "pcm-greeting-food",
      tag: "custom",
      when: "Food",
      title: "You will be offered food",
      body: "A visitor is fed, and declining outright can offend; accepting a little is the polite path. Eating with the right hand is the norm with foods like swallow, and hosts refill without asking.",
    },
    {
      id: "pcm-how-far",
      tag: "etiquette",
      when: "Greetings",
      title: "How far? is hello",
      body: "How far? works as what's up between friends, answered with I dey or I dey fine. Wetin dey happen? is the same register. None of these are literal questions about distance or events.",
    },
    {
      id: "pcm-code-switch",
      tag: "register",
      when: "any",
      title: "Switching mid-sentence is normal",
      body: "Speakers move between Pidgin, English and Yoruba, Igbo or Hausa in a single conversation, choosing register by who's present. Pidgin is the common ground across a country with hundreds of languages.",
    },
    {
      id: "pcm-music",
      tag: "custom",
      when: "any",
      title: "Afrobeats runs on Pidgin",
      body: "Much of the Nigerian music that travels globally is sung in Pidgin — which is why listeners worldwide can already recognise phrases like no wahala and my guy without ever studying it.",
    },
  ],

  // Persian — Iran.
  fa: [
    {
      id: "fa-taarof",
      tag: "etiquette",
      when: "any",
      title: "Taarof: the first offer is never the real one",
      body:
        "A shopkeeper may wave your money away — 'ghaabel nadaare', it's not worthy of you. He does not mean it. You insist, at least twice, and then you pay. Taarof runs through invitations, seats, and last helpings of food: offer what you can't spare, refuse what you want, and let the third exchange settle it.",
    },
    {
      id: "fa-shoma-to",
      tag: "register",
      when: "u2",
      title: "Shoma and to are not interchangeable",
      body:
        "Shoma is the respectful you and also the plural; to is for family, close friends, and children. Using to with someone older or newly met is not casual, it is rude. Persian has no grammatical gender to trip over, so this is the one choice that carries real social weight.",
    },
    {
      id: "fa-ghorbunet",
      tag: "etiquette",
      when: "Greetings",
      title: "Persian affection is extravagant on purpose",
      body:
        "'Ghorbunet beram' means 'may I be sacrificed for you' and is used for roughly what English does with 'you're a star'. 'Jaanam' — my soul — is ordinary between family. Taken literally it sounds alarming; taken normally it is simply warmth, and answering flatly reads as coldness.",
    },
    {
      id: "fa-shoes",
      tag: "custom",
      when: "any",
      title: "Shoes come off at the door, always",
      body:
        "Every home, without exception, and often the good carpet is exactly why. Slippers are usually offered. Keeping shoes on is the single fastest way to be remembered as the guest who did not know.",
    },
    {
      id: "fa-nowruz",
      tag: "custom",
      when: "any",
      title: "The year turns in spring, not January",
      body:
        "Nowruz begins at the exact moment of the equinox, and families sit together waiting for it. The haft-sin table holds seven things starting with the letter s. Wishing someone 'Nowruz mobarak' in late March lands far better than any January greeting.",
    },
    {
      id: "fa-not-arabic",
      tag: "sound",
      when: "any",
      title: "Persian is not a kind of Arabic",
      body:
        "It borrows the script and a good deal of vocabulary, but Persian is Indo-European — a distant cousin of English, not of Arabic. No grammatical gender, no broken plurals, no case endings. Assuming the two languages are related is a common and slightly wounding mistake.",
    },
    {
      id: "fa-poetry",
      tag: "custom",
      when: "any",
      title: "Poetry is quoted in ordinary conversation",
      body:
        "Hafez and Saadi turn up in arguments, condolences and jokes, and most people can produce a line to fit. Households keep a Hafez to open at random for guidance — fal-e Hafez. Knowing even one couplet buys more goodwill than a paragraph of correct grammar.",
    },
    {
      id: "fa-no-gesture",
      tag: "gesture",
      when: "any",
      title: "No is a tilt of the head, not a shake",
      body:
        "A small upward tilt of the chin, often with a soft tsk, means no. To an English speaker it can read as agreement or as a twitch, so the answer gets missed entirely. Watch for the eyebrows going up with it.",
    },
  ],

  // Malayalam — Kerala.
  ml: [
    {
      id: "ml-chetta-chechi",
      tag: "register",
      when: "Family",
      title: "Everyone slightly older is a brother or sister",
      body:
        "Chetta for a man, chechi for a woman — used for shopkeepers, bus conductors and colleagues, not only relatives. Addressing someone older by bare name sounds abrupt. It is the cheapest politeness in the language and the most noticed when missing.",
    },
    {
      id: "ml-nee-ningal",
      tag: "register",
      when: "u2",
      title: "Three levels of you, and the verb follows",
      body:
        "Nee is for friends and children, ningal is respectful or plural, thaangal is formal to the point of distance. Choosing wrong is not a grammar slip, it is a statement about the relationship — and Malayalis notice it instantly in a returning heritage speaker.",
    },
    {
      id: "ml-right-hand",
      tag: "etiquette",
      when: "Food",
      title: "The right hand does the eating, and the passing",
      body:
        "Food is eaten with the right hand, and anything handed to another person — money, a plate, a document — goes with the right hand or both. The left is reserved for washing. This holds even for the left-handed.",
    },
    {
      id: "ml-sadya",
      tag: "custom",
      when: "any",
      title: "Onam and the meal on a banana leaf",
      body:
        "Onam is Kerala's own festival, kept by Malayali Hindus, Christians and Muslims alike. The sadya is served on a banana leaf in a fixed order, and the leaf is folded towards you at the end to say you enjoyed it. Folding it away signals the opposite.",
    },
    {
      id: "ml-gulf",
      tag: "custom",
      when: "any",
      title: "Half of Kerala has a relative in the Gulf",
      body:
        "Migration to the Gulf shaped the modern state — the money, the houses, the long absences. 'Gulf-il aanu' explains a father seen twice a year. For a heritage learner this is often the reason the language got interrupted in the first place.",
    },
    {
      id: "ml-manglish",
      tag: "sound",
      when: "any",
      title: "Mixing English in is normal, not lazy",
      body:
        "Educated Malayalam runs on English nouns inside Malayalam grammar, and nobody considers it a failure of the language. Speaking with no English at all sounds oddly formal. Use the English word when you don't know the Malayalam one and keep going.",
    },
    {
      id: "ml-zha",
      tag: "sound",
      when: "any",
      title: "The sound in the name of the language",
      body:
        "The letter ഴ, the zha in Malayalam, exists in almost no other language on earth. The tongue curls back and the sound comes out somewhere between r, l and zh. Getting it even close marks you out; most learners never try.",
    },
    {
      id: "ml-nod",
      tag: "gesture",
      when: "any",
      title: "The sideways tilt means yes",
      body:
        "A quick side-to-side tilt of the head is agreement, acknowledgement, or 'go on' — not doubt and not no. It appears constantly in conversation, and reading it as hesitation will have you repeating yourself to someone who already agreed.",
    },
  ],

  // Tamil — Tamil Nadu and the diaspora.
  ta: [
    {
      id: "ta-neenga",
      tag: "register",
      when: "u2",
      title: "Neenga is the safe you",
      body:
        "Nee is for close friends, younger people and children; neenga is respectful and plural. Tamil speakers use neenga far more freely than the equivalent in neighbouring languages, and a heritage speaker who defaults to nee sounds younger and blunter than they mean to.",
    },
    {
      id: "ta-anna-akka",
      tag: "register",
      when: "Family",
      title: "Anna and akka are for strangers too",
      body:
        "Anna (older brother) and akka (older sister) are how you address a shopkeeper, a driver, or a colleague a few years your senior. Thambi and thangachi go the other way, to someone younger. Using a bare name across an age gap is what marks an outsider.",
    },
    {
      id: "ta-diglossia",
      tag: "sound",
      when: "any",
      title: "Written Tamil and spoken Tamil are different languages",
      body:
        "Books, news and formal speech use a literary register nobody speaks at home; conversation uses a spoken form with different verb endings and pronunciations. Learning only the written form leaves you understanding the news and lost at a dinner table. This course teaches the spoken one.",
    },
    {
      id: "ta-zha",
      tag: "sound",
      when: "any",
      title: "The sound Tamils are proud of",
      body:
        "ழ, the zha in தமிழ், is the sound Tamil speakers most enjoy hearing a foreigner attempt. It is a retroflex approximant — tongue curled back, no contact. Saying 'Tamizh' rather than 'Tamil' registers immediately.",
    },
    {
      id: "ta-right-hand",
      tag: "etiquette",
      when: "Food",
      title: "Right hand, and the leaf tells you when",
      body:
        "Eat with the right hand, pass with the right hand. At a feast the food arrives on a banana leaf in a set order, and you wait until everything is served before starting. Mixing rice with the fingers is the technique, not bad manners.",
    },
    {
      id: "ta-pongal",
      tag: "custom",
      when: "any",
      title: "The new year that thanks the sun",
      body:
        "Pongal is a four-day harvest festival in mid-January, named for the pot of rice boiled over until it spills — the spilling is the point, and the shout of 'Pongalo Pongal' goes up when it does. It is agricultural and Tamil rather than pan-Indian, which is much of why it matters.",
    },
    {
      id: "ta-cinema",
      tag: "custom",
      when: "any",
      title: "Cinema supplies the slang",
      body:
        "Tamil film dialogue enters everyday speech within weeks, and a well-placed line does the work of a joke. It also means the language moves fast: what sounds current to a returning speaker may be a decade stale, and that gap is audible.",
    },
    {
      id: "ta-vanakkam",
      tag: "gesture",
      when: "Greetings",
      title: "Vanakkam is hands, and it works at a distance",
      body:
        "Palms together at the chest with a slight bow, usable across a room and with anyone. No handshake is required, and it sidesteps every question about gender, age and touch that a handshake raises.",
    },
  ],

  // Somali — the Horn and its diaspora.
  so: [
    {
      id: "so-poetry",
      tag: "custom",
      when: "any",
      title: "A nation that argues in verse",
      body:
        "Somali was an oral language with enormous prestige placed on poetry — the gabay could settle disputes, start them, and carry news between clans. Poets are public figures. A proverb dropped into conversation is not decoration, it is how a point gets made.",
    },
    {
      id: "so-clan",
      tag: "etiquette",
      when: "any",
      title: "Do not open with the clan question",
      body:
        "Clan lineage is genuinely important and genuinely fraught, tied to a civil war within living memory. Somalis may ask each other; a learner asking early sounds like they are sorting people into camps. Wait to be told.",
    },
    {
      id: "so-nabad",
      tag: "etiquette",
      when: "Greetings",
      title: "Greetings are long, and peace is the word",
      body:
        "Nabad means peace and runs through hello and goodbye alike — 'nabad gelyo', go in peace. The exchange is not one line: you ask after family, health and the journey before getting to the point. Cutting it short reads as bad news or bad manners.",
    },
    {
      id: "so-shaah",
      tag: "custom",
      when: "Food",
      title: "Tea is the invitation you don't refuse",
      body:
        "Shaah — spiced tea with cardamom, cinnamon and a lot of sugar — arrives for any visitor. Refusing outright is difficult; taking a cup and drinking slowly is the graceful answer. Hospitality to travellers is close to an obligation.",
    },
    {
      id: "so-script",
      tag: "sound",
      when: "any",
      title: "The written language is younger than most speakers' parents",
      body:
        "Somali had no official alphabet until 1972, when a Latin script was adopted and a mass literacy campaign followed. This is why the spelling is regular and phonetic — it was designed, recently, on purpose. It also means the deep tradition is spoken, not written.",
    },
    {
      id: "so-camel",
      tag: "custom",
      when: "any",
      title: "Precision where it mattered",
      body:
        "Somali carries a dense vocabulary for camels — age, condition, milk yield, colour — the way English does for money or weather. Much of it is retreating with urban life, but the words are in the proverbs, and they are a window into what the language was built to discuss.",
    },
    {
      id: "so-right-hand",
      tag: "etiquette",
      when: "Food",
      title: "Right hand for food and greeting",
      body:
        "Eat with the right hand and offer with it. Shared plates are normal, and eating from the section in front of you rather than reaching across is the expected manner.",
    },
    {
      id: "so-adeer",
      tag: "register",
      when: "Family",
      title: "Kinship terms used well beyond kin",
      body:
        "Adeer (uncle) and eedo (aunt) are used for older people you are not related to, and walaal (sibling) for peers. It is warmer than a name and safer than guessing a title, which makes it the most useful politeness a learner can pick up early.",
    },
  ],

  // Tagalog — the Philippines.
  tl: [
    {
      id: "tl-po",
      tag: "register",
      when: "any",
      title: "Po is the whole politeness system in one syllable",
      body:
        "Po and opo are inserted into sentences addressed to anyone older or senior — 'Salamat po', 'Opo' for yes. Leaving them out is not neutral, it is disrespectful, and it is the single thing Filipino relatives notice first in a child raised abroad.",
    },
    {
      id: "tl-mano",
      tag: "gesture",
      when: "Greetings",
      title: "Mano po: the elder's hand to your forehead",
      body:
        "You take an older relative's hand and touch the back of it to your forehead, saying 'mano po'. It is expected on arriving and leaving, at family gatherings, from children and adults alike. Skipping it with a grandparent is conspicuous.",
    },
    {
      id: "tl-kuya-ate",
      tag: "register",
      when: "Family",
      title: "Kuya and ate for anyone slightly ahead of you",
      body:
        "Kuya for an older male, ate for an older female — cousins, colleagues, the person at the counter. Filipino relationships are ranked by age almost automatically, and using a bare first name upward is the mark of someone who grew up elsewhere.",
    },
    {
      id: "tl-kumain",
      tag: "etiquette",
      when: "Food",
      title: "'Have you eaten?' is a greeting",
      body:
        "'Kumain ka na?' is asked the way English asks how you are, and 'Kain tayo' — let's eat — is offered to anyone passing a meal, often without literal intent. Declining politely is fine; ignoring the offer is not.",
    },
    {
      id: "tl-lips",
      tag: "gesture",
      when: "any",
      title: "Directions are given with the lips",
      body:
        "Pointing is done by pursing the lips towards the thing, sometimes with a lift of the chin. Pointing with a finger at a person is rude. If someone seems to be pouting at you mid-sentence, they are answering your question.",
    },
    {
      id: "tl-hiya",
      tag: "register",
      when: "any",
      title: "No is said indirectly, and you have to hear it",
      body:
        "Hiya — a sense of propriety and not wanting to cause loss of face — makes flat refusal uncomfortable. 'Sige, tignan natin' (we'll see) or a vague maybe is frequently a no. Pressing for a straight answer puts the other person in a bind rather than getting you one.",
    },
    {
      id: "tl-taglish",
      tag: "sound",
      when: "any",
      title: "Taglish is the normal register",
      body:
        "Everyday Manila speech mixes English into Tagalog constantly, and it is what educated speech sounds like rather than a corruption. Pure Tagalog reads as formal or nationalist. Reaching for the English word mid-sentence is exactly what a native speaker does.",
    },
    {
      id: "tl-fiesta",
      tag: "custom",
      when: "any",
      title: "The town fiesta feeds strangers",
      body:
        "Every town keeps a patron saint's fiesta, and houses cook far more than the household can eat specifically so that visitors — including people nobody knows — can be fed. Turning up hungry is the correct behaviour, not an imposition.",
    },
  ],};

const TAG_LABELS = {
  etiquette: "Etiquette",
  register: "Register",
  sound: "Sound",
  gesture: "Body language",
  custom: "Custom",
};

export function tagLabel(tag) {
  return TAG_LABELS[tag] || "Culture";
}

export function hasCulture(langCode) {
  return Array.isArray(CULTURE[langCode]) && CULTURE[langCode].length > 0;
}

export function getCultureNotes(langCode) {
  return CULTURE[langCode] || [];
}

/**
 * Notes relevant to a situation, most-specific first.
 * `when` may be a unit id ("u3"), a category ("Greetings"), or absent.
 * Notes tagged "any" always qualify, but sort after situational matches.
 */
export function cultureFor(langCode, { unit = null, category = null } = {}) {
  const notes = getCultureNotes(langCode);
  if (!notes.length) return [];
  const specific = notes.filter(
    (n) => (unit && n.when === unit) || (category && n.when === category)
  );
  const general = notes.filter((n) => n.when === "any");
  return [...specific, ...general];
}

/**
 * One note, chosen deterministically for the day so it doesn't flicker between
 * renders but still rotates over time. Prefers a situational match when there
 * is one.
 */
export function cultureOfTheDay(langCode, situation = {}) {
  const pool = cultureFor(langCode, situation);
  if (!pool.length) return null;
  const day = Math.floor(Date.now() / 86400000);
  return pool[day % pool.length];
}
