// =============================================================================
// EXPLAIN — generate "why is the right answer right?" content shown after a
// wrong answer, when the user taps the "Why?" button.
//
// Two layers:
//   1. SPECIAL CASES — hand-written explanations for famous gotchas where
//      the templated version would miss the real teaching point. Example:
//      ser vs estar (both mean "to be" in Spanish), tu vs vous (formality).
//   2. GENERIC TEMPLATE — for every other case, build a clear explanation
//      from the data we already have: meaning, example sentence, the word
//      the user picked instead.
// =============================================================================

import { EXERCISE } from "./generator.js";

// -----------------------------------------------------------------------------
// Special cases keyed by language code + a pair of words
// (correct_lemma → wrong_lemma → custom explanation)
// -----------------------------------------------------------------------------
const SPECIAL_CASES = {
  // ===========================================================================
  // SPANISH
  // ===========================================================================
  es: {
    "Ser→Estar": "Both mean 'to be', but **ser** is for permanent traits (I am tall, I am Spanish) and **estar** is for temporary states (I am tired, I am here). 'I am a doctor' = ser. 'I am at work' = estar.",
    "Estar→Ser": "Both mean 'to be', but **estar** is for temporary states or locations (I am tired, I am at home) and **ser** is for permanent traits (I am tall, I am Spanish). 'I am here' = estar. 'I am Spanish' = ser.",
    "Soy→Estoy": "**Soy** comes from *ser* (permanent: I am a teacher, I am Mexican). **Estoy** comes from *estar* (temporary: I am tired, I am at home).",
    "Estoy→Soy": "**Estoy** is for how you are RIGHT NOW (tired, happy, at the park). **Soy** is for who you ARE (a doctor, Spanish, tall).",
    "Tú→Usted": "Both mean 'you', but **tú** is informal (friends, family, kids) and **usted** is formal (strangers, elders, professionals). When in doubt with a stranger, use usted.",
    "Usted→Tú": "**Usted** is the polite/formal 'you'. **Tú** is informal — only for friends, family, and children.",
    "Por→Para": "Both can mean 'for', but **por** = reason/cause/duration (because of, through, during), **para** = purpose/destination (in order to, for the benefit of, by a deadline).",
    "Para→Por": "**Para** points toward a goal or recipient (this is FOR you, in order TO eat). **Por** explains a reason or path (BECAUSE of, THROUGH, DURING).",
    "El→La": "Spanish has gendered articles: **el** for masculine nouns, **la** for feminine. Most -o words are masculine (el libro), most -a words are feminine (la casa) — but always memorize gender with each new word.",
    "La→El": "**La** is for feminine nouns (la casa, la mesa). **El** is for masculine (el libro, el coche). Get this wrong and the sentence sounds broken to natives.",
    "Hablo→Habla": "Spanish verb endings change based on WHO is speaking. **Hablo** = I speak. **Habla** = he/she speaks. The ending tells you the subject — that's why Spanish often drops 'yo'.",
    "Bueno→Bien": "**Bueno** is an adjective ('good food'). **Bien** is an adverb ('I'm doing well'). 'How are you?' → 'I am bien' (not bueno). 'Is this restaurant good?' → 'Es bueno'.",
  },

  // ===========================================================================
  // FRENCH
  // ===========================================================================
  fr: {
    "Tu→Vous": "Both mean 'you', but **tu** is informal (friends, family, kids) and **vous** is formal (strangers, elders, professionals) OR plural. When unsure, use vous.",
    "Vous→Tu": "**Vous** can be formal singular OR plural 'you'. **Tu** is only informal singular. Use tu only with friends, family, or children.",
    "C'est→Il est": "Both can mean 'it is / he is', but **c'est** is used before a noun (c'est un chat = it's a cat) and **il est** is used before an adjective (il est grand = he is tall).",
    "Le→La": "French has gendered articles: **le** for masculine nouns, **la** for feminine. There's no reliable rule — memorize the article with each new word. *Le livre* (the book), *la table* (the table).",
    "La→Le": "**La** is for feminine nouns. **Le** is for masculine. Get the gender wrong and even simple phrases sound broken. When learning a new noun, learn its article alongside it.",
    "Avoir→Être": "Both are essential, but **avoir** = 'to have' (I have a book = j'ai un livre) and **être** = 'to be' (I am tired = je suis fatigué). They also help form different past tenses.",
    "Être→Avoir": "**Être** = 'to be' (je suis = I am). **Avoir** = 'to have' (j'ai = I have). They look similar but mean very different things.",
    "Bon→Bien": "**Bon** is an adjective ('a good meal' = un bon repas). **Bien** is an adverb ('I'm doing well' = je vais bien). Wrong one = sounds off.",
    "Je suis→J'ai": "**Je suis** = 'I am' (I am tall). **J'ai** = 'I have'. Note: French uses 'have' where English uses 'be' for things like age (j'ai 25 ans = I'm 25, literally 'I have 25 years').",
  },

  // ===========================================================================
  // KOREAN
  // ===========================================================================
  ko: {
    "안녕→안녕하세요": "**안녕** is casual 'hi' (between friends). **안녕하세요** is the standard polite hello — use it with strangers, elders, or anyone you don't know well. Wrong politeness level = sounds rude.",
    "안녕하세요→안녕": "**안녕하세요** is the polite hello. **안녕** is casual 'hi' for close friends only. Korean politeness levels matter — don't use 안녕 with a stranger.",
    "저→나": "Both mean 'I', but **저** is humble/polite (use with strangers, in formal situations) and **나** is casual (use with close friends, family). Wrong choice = sounds rude or weirdly formal.",
    "나→저": "**나** is casual 'I' for friends and family. **저** is the humble form for formal situations. When unsure, use 저.",
    "당신→너": "Both can mean 'you', but Korean usually drops 'you' entirely. **당신** is awkward in conversation — better to use the person's name or title. **너** is casual.",
    "은→는": "**은** and **는** are the same particle (topic marker). Use **은** after a consonant ending, **는** after a vowel. 책은 (book is...), 저는 (I am...).",
    "이→가": "**이** and **가** are the same particle (subject marker). Use **이** after a consonant, **가** after a vowel. 책이 좋아요 (the book is good), 차가 좋아요 (the car is good).",
    "을→를": "**을** and **를** are the same particle (object marker). Use **을** after a consonant, **를** after a vowel. 밥을 먹다 (eat rice), 차를 마시다 (drink tea).",
    "감사합니다→고마워": "**감사합니다** is the formal 'thank you' (use with strangers, elders, in writing). **고마워** is casual (close friends only). When in doubt, formal.",
    "이에요→이다": "**이에요** is the polite version of 'is/am' (저는 학생이에요 = I am a student). **이다** is the dictionary/casual form. Always learn ~에요 first — it's the safe form.",
  },

  // ===========================================================================
  // JAPANESE
  // ===========================================================================
  ja: {
    "は→が": "Both are subject markers, but **は** marks the TOPIC (what we're talking about) and **が** marks the SUBJECT (the new info). 'I am Tanaka' = 私はタナカです. 'It's RAINING' = 雨がふっています.",
    "が→は": "**が** introduces new or specific information. **は** marks an already-known topic. If you're answering 'who did it?', use が. If you're talking about something already in context, use は.",
    "を→は": "**を** marks the direct object (what's being acted on). **は** marks the topic. 'I eat sushi' = 寿司を食べる. The sushi is the object of eating, so it gets を.",
    "に→で": "Both can mean 'at/in', but **に** marks a destination or specific point (I go TO school). **で** marks where an action HAPPENS (I study AT school).",
    "で→に": "**で** is where the action takes place (eating AT a restaurant). **に** is the destination or target (going TO the restaurant).",
    "ます→る": "**ます** is the polite verb form (use with strangers, in formal situations). **る/う** is the dictionary/casual form (with friends, family). Always start with ます — it's safer.",
    "る→ます": "**る** is the dictionary form (casual, used with close friends or in writing about general truths). **ます** is the polite form for everyday speech with everyone else. Default to ます.",
    "です→だ": "**です** is the polite copula ('is/am/are'). **だ** is casual. With anyone you don't know well, always use です.",
    "私→僕": "**私** (watashi) is the safe, neutral 'I'. **僕** (boku) is masculine, used by boys/men in casual situations. Women rarely use 僕.",
    "ありがとう→どうも": "**ありがとう** is 'thank you'. **どうも** is more like 'thanks' (casual). For real gratitude, use ありがとうございます (very polite).",
  },

  // ===========================================================================
  // MANDARIN
  // ===========================================================================
  zh: {
    "是→在": "Both can mean 'be', but **是** = 'to be' (identity: I AM a student). **在** = 'to be at/in' (location: I am AT home). 'I am Chinese' = 是. 'I'm at work' = 在.",
    "在→是": "**在** is for location ('at, in, on'). **是** is for identity ('to be X'). 'I'm at home' = 在. 'I'm a teacher' = 是.",
    "你→您": "Both mean 'you', but **您** is the formal version (use with elders, strangers, in business). **你** is normal/casual.",
    "您→你": "**您** is the respectful 'you' for elders, customers, business situations. **你** is normal everyday 'you' — fine for friends and casual conversation.",
    "几→多少": "Both ask 'how many', but **几** is for small numbers (under 10) and **多少** is for larger or unknown amounts. 'How old is the kid?' = 几. 'How much money?' = 多少.",
    "了→过": "Both mark past tense, but **了** = completed action ('I ate' = 我吃了). **过** = experience ever ('I've eaten this before' = 我吃过). Different feel — 了 is finished, 过 is 'have you ever?'.",
    "的→得": "Both pronounced 'de', but **的** = possessive/descriptive (我的书 = my book). **得** = adverbial linker (跑得快 = runs fast). Wrong character = wrong meaning.",
    "什么→怎么": "**什么** = 'what' (asks about a thing). **怎么** = 'how' (asks about manner). 'What is this?' = 这是什么? 'How do you say it?' = 怎么说?",
    "和→跟": "Both mean 'and/with' between people. **和** is more formal/written. **跟** is more casual/spoken. Both are correct in everyday speech.",
  },

  // ===========================================================================
  // URDU
  // ===========================================================================
  ur: {
    "آپ→تم": "Both mean 'you', but **آپ** (aap) is formal (use with strangers, elders) and **تم** (tum) is familiar (with friends, younger people). Using تم with a stranger is rude.",
    "تم→آپ": "**تم** (tum) is familiar 'you' for friends and family. **آپ** (aap) is the formal version for everyone else. Default to آپ when in doubt.",
    "ہاں→جی": "Both mean 'yes', but **جی** (ji) is more polite/respectful, especially when responding to elders. **ہاں** (haan) is casual.",
    "میں→ہم": "**میں** (main) = 'I' (singular). **ہم** (hum) = 'we' (plural). Don't confuse them — using ہم for yourself sounds royal/strange.",
    "ہے→ہیں": "**ہے** (hai) = 'is' (singular: he/she/it). **ہیں** (hain) = 'are' (plural OR formal). With آپ you always use ہیں, even for one person.",
    "کیا→کون": "**کیا** (kya) = 'what' (asking about things). **کون** (kaun) = 'who' (asking about people). 'What is this?' uses کیا. 'Who is that?' uses کون.",
    "اچھا→ٹھیک": "Both can mean 'okay/good', but **اچھا** (achcha) = 'good' (quality). **ٹھیک** (theek) = 'fine/okay' (status). 'It's a good book' = اچھی کتاب. 'I'm fine' = میں ٹھیک ہوں.",
    "بڑا→بہت": "**بڑا** (bara) = 'big' (size). **بہت** (bahut) = 'very/a lot' (intensifier). 'Big house' = بڑا گھر. 'Very good' = بہت اچھا.",
    "جانا→آنا": "**جانا** (jana) = 'to go' (away from speaker). **آنا** (aana) = 'to come' (toward speaker). Direction matters: 'I'm going home' = جا رہا ہوں, 'come here' = یہاں آؤ.",
  },

  // ===========================================================================
  // HINDI
  // ===========================================================================
  hi: {
    "आप→तुम": "Both mean 'you', but **आप** (aap) is formal/respectful and **तुम** (tum) is familiar. Using तुम with elders or strangers is considered rude.",
    "तुम→आप": "**तुम** is for friends and family. **आप** is the polite form for everyone else. When unsure, use आप.",
    "है→हैं": "**है** = 'is' (singular). **हैं** = 'are' (plural OR with respectful आप). Even when talking about one person, if you used आप, you must use हैं.",
    "क्या→कौन": "**क्या** (kya) = 'what' (things). **कौन** (kaun) = 'who' (people). Don't mix them.",
    "मैं→हम": "**मैं** (main) = 'I'. **हम** (hum) = 'we'. Note: in casual Hindi, हम is sometimes used to mean 'I' in some regions, but standard usage is plural.",
  },

  // ===========================================================================
  // BENGALI
  // ===========================================================================
  bn: {
    "আপনি→তুমি": "Both mean 'you', but **আপনি** (apni) is formal (strangers, elders) and **তুমি** (tumi) is familiar (friends, younger). Bengali also has a third intimate form **তুই** (tui) — only with very close friends.",
    "তুমি→আপনি": "**তুমি** is informal 'you' for friends. **আপনি** is the polite form. Default to আপনি with anyone you don't know well.",
    "আমি→আমরা": "**আমি** (ami) = 'I'. **আমরা** (amra) = 'we'. Singular vs plural — keep them straight.",
    "ভালো→ঠিক": "**ভালো** (bhalo) = 'good' (quality). **ঠিক** (thik) = 'okay/right'. 'Good food' = ভালো খাবার. 'I'm fine' = আমি ঠিক আছি.",
    "যাওয়া→আসা": "**যাওয়া** = 'to go' (away). **আসা** = 'to come' (toward). 'I'm going home' = বাড়ি যাচ্ছি. 'Come here' = এখানে আসো.",
  },

  // ===========================================================================
  // ARABIC
  // ===========================================================================
  ar: {
    "أنا→أنت": "**أنا** (ana) = 'I'. **أنت** (anta/anti) = 'you'. Note: Arabic differs by gender — أنت for male, أنتِ for female.",
    "هو→هي": "**هو** (huwa) = 'he'. **هي** (hiya) = 'she'. Arabic verbs and adjectives also change based on gender — get the pronoun right and the rest follows.",
    "في→على": "**في** = 'in/inside'. **على** = 'on/upon'. 'In the house' = في البيت. 'On the table' = على الطاولة.",
  },
};

/**
 * Generate an explanation for why an answer was wrong (or right).
 * Always returns a friendly explanation — never null.
 *
 * @param {object} exercise - the exercise the user just answered
 * @param {string} userAnswer - what the user picked/typed
 * @param {string} langCode - language code (es, fr, ja, etc.)
 * @returns {object} { title, body, special: bool }
 */
export function explainAnswer(exercise, userAnswer, langCode) {
  const item = exercise.item;
  if (!item) {
    return {
      title: "Why this answer?",
      body: "The correct answer is highlighted above.",
      special: false,
    };
  }

  // 1. Check special cases (handwritten explanations for famous gotchas)
  const specialMap = SPECIAL_CASES[langCode] || {};
  const specialKey = `${item.lemma}→${userAnswer}`;
  const specialExplanation = specialMap[specialKey];
  if (specialExplanation) {
    return {
      title: `${item.lemma} vs ${userAnswer}`,
      body: specialExplanation,
      special: true,
    };
  }

  // 2. Templated explanation built from the word's data
  const parts = [];

  if (exercise.type === EXERCISE.PICK_MEANING) {
    parts.push(`**${item.lemma}** means "${item.translation}".`);
    if (item.pronunciation) parts.push(`Pronounced: ${item.pronunciation}.`);
    if (item.examples?.[0]) {
      parts.push(`Used in a sentence: "${item.examples[0].translation}"`);
    }
  } else if (exercise.type === EXERCISE.PICK_WORD) {
    parts.push(`The word for "${item.translation}" is **${item.lemma}**.`);
    if (item.pronunciation) parts.push(`Pronounced: ${item.pronunciation}.`);
    if (item.examples?.[0]) {
      parts.push(`Example: "${item.examples[0].translation}"`);
    }
  } else if (exercise.type === EXERCISE.LISTEN_PICK) {
    parts.push(`The word you heard was **${item.lemma}** — meaning "${item.translation}".`);
    if (item.pronunciation) parts.push(`It's pronounced: ${item.pronunciation}.`);
  } else if (exercise.type === EXERCISE.TYPE_TRANSLATION) {
    parts.push(`**${item.lemma}** translates to "${item.translation}" in English.`);
    if (item.examples?.[0]) {
      parts.push(`Example: "${item.examples[0].translation}"`);
    }
  } else if (exercise.type === EXERCISE.COMPLETE_SENTENCE) {
    parts.push(`The missing word is **${item.lemma}** — meaning "${item.translation}".`);
    if (item.examples?.[0]) {
      parts.push(`The full sentence: "${item.examples[0].native}" = "${item.examples[0].translation}".`);
    }
  } else if (exercise.type === EXERCISE.TAP_WORDS || exercise.type === EXERCISE.BUILD_SENTENCE) {
    parts.push(`The correct sentence is: **${exercise.answer}**`);
    if (exercise.translation) parts.push(`Which means: "${exercise.translation}"`);
    parts.push(`Tip: word order matters in this language. Try saying it out loud a few times.`);
  } else {
    parts.push(`The correct answer is **${exercise.answer || item.translation}**.`);
  }

  return {
    title: "Why this answer?",
    body: parts.join(" "),
    special: false,
  };
}
