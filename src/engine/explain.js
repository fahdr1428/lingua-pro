// =============================================================================
// EXPLAIN — what to say the moment a learner gets something wrong.
//
// v79: THIS IS NO LONGER BEHIND A BUTTON. It used to be: you got a question
// wrong, the app said "✗ Not quite" in red, and the explanation sat behind a
// "Why?" chip that most people never pressed. A wrong answer with no
// explanation is the single most wasteful moment in a language app — the
// learner is at peak attention, actively wanting to know, and we said nothing.
// Now the explanation opens by itself on every mistake.
//
// v79 also fixes a real bug in here. Four of the templates below showed
// `examples[0].translation` — the ENGLISH gloss of the example sentence —
// without `examples[0].native`, the sentence in the language being learned.
// So the explanation for a missed Urdu word read "Used in a sentence: 'My
// father is a doctor'", which teaches nothing about Urdu. Every word in every
// pack carries a real example sentence; dropping it was throwing away the most
// valuable thing we had to show.
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
 * What to tell the learner about the answer they just gave.
 *
 * @param {object} exercise    the exercise they just answered
 * @param {string} userAnswer  what they actually picked or typed
 * @param {string} langCode
 * @param {object} opts
 * @param {boolean} opts.correct  whether they got it right
 * @param {Array}  opts.options   the choices offered, so a wrong pick can be named
 * @returns {{ title, body, special, sentence }}
 *          `sentence` is { native, translit, translation } or null — kept
 *          structured rather than mashed into `body` so the UI can render it in
 *          the right script and direction. A right-to-left sentence spliced into
 *          an English paragraph renders as a mess.
 */
export function explainAnswer(exercise, userAnswer, langCode, opts = {}) {
  const { correct = false, options = null } = opts;
  const item = exercise.item;

  // The example sentence, in the language being learned. This is the payload —
  // everything else is framing around it.
  const ex = item?.examples?.[0];
  const sentence = ex?.native
    ? { native: ex.native, translit: ex.translit || "", translation: ex.translation || "" }
    : null;

  if (!item) {
    return {
      title: correct ? "That's right" : "Here's the answer",
      body: exercise.answer ? `The answer is **${exercise.answer}**.` : "The right answer is highlighted above.",
      special: false,
      sentence: null,
    };
  }

  // 1. Hand-written explanations for the famous confusions, where a template
  //    would miss the actual teaching point (ser vs estar, tú vs usted).
  const specialMap = SPECIAL_CASES[langCode] || {};
  const specialExplanation = specialMap[`${item.lemma}→${userAnswer}`];
  if (specialExplanation) {
    return {
      title: `${item.lemma} vs ${userAnswer}`,
      body: specialExplanation,
      special: true,
      sentence,
    };
  }

  // 2. Name what they actually chose.
  //
  //    "The answer is X" tells you the answer. "You picked Y, which means Z —
  //    the one you wanted is X" tells you where your idea of the language was
  //    wrong, which is the thing that stops it happening again. Only when the
  //    wrong pick is identifiable and isn't just an empty or skipped answer.
  const missBody = [];
  if (!correct && userAnswer && options) {
    const picked = options.find(
      (o) => o?.lemma === userAnswer || o?.form === userAnswer || o === userAnswer
    );
    const pickedMeaning =
      picked?.translation || (typeof picked === "object" ? picked?.meaning : null);
    if (pickedMeaning && pickedMeaning !== item.translation) {
      missBody.push(`You went for **${userAnswer}**, which means "${pickedMeaning}".`);
    }
  }

  const parts = [...missBody];

  switch (exercise.type) {
    case EXERCISE.PICK_MEANING:
      parts.push(`**${item.lemma}** means "${item.translation}".`);
      if (item.pronunciation) parts.push(`It sounds like: ${item.pronunciation}.`);
      break;
    case EXERCISE.PICK_WORD:
      parts.push(`The word for "${item.translation}" is **${item.lemma}**.`);
      if (item.pronunciation) parts.push(`It sounds like: ${item.pronunciation}.`);
      break;
    case EXERCISE.LISTEN_PICK:
      parts.push(`What you heard was **${item.lemma}** — "${item.translation}".`);
      if (item.pronunciation) parts.push(`Said as: ${item.pronunciation}.`);
      break;
    case EXERCISE.TYPE_TRANSLATION:
      parts.push(`**${item.lemma}** is "${item.translation}".`);
      break;
    case EXERCISE.LETTER_SCRAMBLE:
      parts.push(`It's spelled **${exercise.answer || item.lemma}** — "${item.translation}".`);
      break;
    case EXERCISE.COMPLETE_SENTENCE:
      parts.push(`The missing word is **${item.lemma}** — "${item.translation}".`);
      break;
    case EXERCISE.TRUE_FALSE:
      parts.push(`**${item.lemma}** means "${item.translation}".`);
      break;
    case EXERCISE.TAP_WORDS:
    case EXERCISE.BUILD_SENTENCE:
      parts.push(`The sentence is **${exercise.answer}**.`);
      if (exercise.translation) parts.push(`It means "${exercise.translation}".`);
      parts.push("Word order carries meaning here, so it's worth saying the whole thing out loud once before moving on.");
      break;
    case EXERCISE.CONJUGATE:
    case EXERCISE.CONJUGATE_TENSE:
      parts.push(`The form you want is **${exercise.answer}**.`);
      if (item.lemma) parts.push(`It comes from **${item.lemma}** — "${item.translation}".`);
      break;
    default:
      parts.push(`The answer is **${exercise.answer || item.translation}**.`);
  }

  return {
    title: correct ? "Worth knowing" : "Here's what happened",
    body: parts.join(" "),
    special: false,
    sentence,
  };
}
