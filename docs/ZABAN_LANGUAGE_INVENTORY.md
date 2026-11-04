# Zaban — language inventory and curriculum coverage

> **Generated** by `npm run build-inventory` from the content files. Do not edit by hand:
> `npm run validate-inventory` (part of `npm run check`) fails when this is out of date.

Every number below is measured from the language packs, grammar lessons, sentence patterns,
conversations, passages and journey in `src/data/`. The **course** columns describe the
structured course that `src/engine/curriculum.js` builds from that content for each language
(modules, lessons, typed objectives). Its status is **legacy-unreviewed**: built from existing
content, not yet reviewed by a qualified speaker or teacher. Nothing here is a CEFR claim. The
packs cover Pre-A1/A1 topics at most, and no level has been validated.

## 1. What each language has

| Language | Code | Script | Dir | Variety taught | Words | Units | Grammar lessons | Sentence patterns | Conversations | Reading passages | Culture notes | Verb tables | Synthetic audio | Spoken varieties |
|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Arabic | `ar` | Arabic script | RTL | Modern Standard Arabic | 278 | 12 | 5 | 5 | 10 | 4 | 8 | 4 | 79 | Modern Standard, Egyptian, Levantine, Gulf (Khaleeji), Maghrebi (Darija), Iraqi, Sudanese |
| German | `de` | Latin alphabet | LTR | Standard German (Germany) | 277 | 13 | 5 | 5 | 10 | 4 | 10 | 12 | — | Germany, Austria, Switzerland |
| Turkish | `tr` | Latin alphabet | LTR | Standard Turkish (Istanbul) | 277 | 12 | 5 | 5 | 10 | 4 | 8 | — | — | — |
| Spanish | `es` | Latin alphabet | LTR | Spanish, with Spain's everyday vocabulary (coche) | 269 | 13 | 6 | 5 | 11 | 3 | 8 | 10 | 157 | Spain, Mexico, Argentina |
| Korean | `ko` | Hangul | LTR | Standard Korean (Seoul) | 266 | 13 | 4 | 5 | 10 | 1 | 8 | 7 | 105 | — |
| Urdu | `ur` | Perso-Arabic script (Nastaliq) | RTL | Urdu as spoken in Pakistan | 264 | 13 | 6 | 5 | 11 | 4 | 8 | 8 | — | Pakistan, India |
| French | `fr` | Latin alphabet | LTR | French (France) | 261 | 13 | 6 | 5 | 11 | 2 | 8 | 8 | 143 | France, Québec |
| Hindi | `hi` | Devanagari | LTR | Standard Hindi | 256 | 12 | 6 | 5 | 10 | 4 | 8 | 5 | 79 | — |
| Mandarin | `zh` | Simplified Chinese characters | LTR | Standard Mandarin (Putonghua) | 255 | 13 | 5 | 5 | 10 | 1 | 8 | 8 | 110 | Mainland, Taiwan |
| Nigerian Pidgin | `pcm` | Latin alphabet | LTR | Nigerian Pidgin (Naijá) | 255 | 6 | 4 | 5 | 10 | 4 | 8 | — | 66 | — |
| Japanese | `ja` | Hiragana, katakana and kanji | LTR | Standard Japanese | 251 | 11 | 5 | 5 | 10 | 1 | 8 | 7 | 80 | — |
| Indonesian | `id` | Latin alphabet | LTR | Standard Indonesian (Bahasa Indonesia) | 245 | 6 | 4 | 5 | 10 | 4 | 8 | — | 69 | — |
| Punjabi | `pa` | Shahmukhi (Perso-Arabic script) | RTL | Punjabi (Pakistan), written in Shahmukhi | 245 | 6 | 4 | 5 | 10 | 4 | 8 | — | 80 | — |
| Persian | `fa` | Perso-Arabic script | RTL | Iranian Persian (Farsi), as spoken in Tehran | 240 | 8 | 5 | 5 | 10 | 0 | 8 | — | — | — |
| Malayalam | `ml` | Malayalam script | LTR | Standard Malayalam | 237 | 8 | 4 | 5 | 10 | 0 | 8 | — | — | — |
| Somali | `so` | Latin alphabet | LTR | Standard Somali | 237 | 8 | 4 | 5 | 10 | 0 | 8 | — | — | — |
| Tagalog | `tl` | Latin alphabet | LTR | Tagalog (Filipino) | 234 | 8 | 4 | 5 | 10 | 0 | 8 | — | — | — |
| Tamil | `ta` | Tamil script | LTR | Tamil, mainly spoken forms | 234 | 8 | 4 | 5 | 10 | 0 | 8 | — | — | — |
| Bengali | `bn` | Bengali script | LTR | Standard colloquial Bengali (Bangla) | 232 | 10 | 4 | 5 | 10 | 1 | 8 | 5 | 88 | — |
| Vietnamese | `vi` | Latin alphabet | LTR | Vietnamese, Northern (Hanoi) standard | 228 | 8 | 0 | 5 | 6 | 0 | 8 | — | — | — |
| Yoruba | `yo` | Latin alphabet | LTR | Standard Yoruba | 220 | 8 | 0 | 5 | 6 | 0 | 8 | — | — | — |

Synthetic audio: pre-generated text-to-speech MP3s for the first words of a pack (`public/audio`).
Every other line is spoken by the device's own voice, where it has one for the language.
Speaking practice uses the browser's speech recognition where available. It checks intelligibility
against the expected text and is not a pronunciation assessment.

## 2. Content quality, measured

| Language | Words with an example | Examples containing the taught form | Romanisation | Pronunciation guide | Words with dialect forms | Journey stops | …using their unit's words |
|---|---:|---:|---:|---:|---:|---:|---:|
| Arabic | 100% | 78% | 100% | 60% | 49 | 12 | 3 |
| German | 100% | 88% | Latin script | 65% | — | 12 | 8 |
| Turkish | 100% | 86% | Latin script | 32% | — | 12 | 4 |
| Spanish | 100% | 90% | Latin script | 13% | — | 12 | 3 |
| Korean | 100% | 76% | 100% | 46% | — | 9 | 6 |
| Urdu | 100% | 84% | 100% | 60% | — | 12 | 2 |
| French | 100% | 89% | Latin script | 15% | — | 12 | 3 |
| Hindi | 100% | 82% | 100% | 45% | — | 12 | 3 |
| Mandarin | 100% | 100% | 100% | 50% | — | 9 | 8 |
| Nigerian Pidgin | 100% | 100% | Latin script | 26% | — | 6 | 6 |
| Japanese | 100% | 88% | 100% | 42% | — | 9 | 7 |
| Indonesian | 100% | 96% | Latin script | 23% | — | 6 | 6 |
| Punjabi | 100% | 82% | 100% | 22% | — | 6 | 4 |
| Persian | 100% | 83% | 100% | 0% | — | 8 | 8 |
| Malayalam | 100% | 69% | 100% | 0% | — | 8 | 7 |
| Somali | 100% | 83% | Latin script | 0% | — | 8 | 6 |
| Tagalog | 100% | 92% | Latin script | 0% | — | 8 | 7 |
| Tamil | 100% | 91% | 100% | 0% | — | 8 | 8 |
| Bengali | 100% | 86% | 100% | 44% | — | 9 | 8 |
| Vietnamese | 100% | 100% | Latin script | 0% | — | 8 | 8 |
| Yoruba | 100% | 98% | Latin script | 0% | — | 8 | 7 |

*Examples containing the taught form* measures what a gap-fill can use. Inflecting languages
legitimately miss it for verbs (Spanish *comer* → *como*). *Using their unit's words* counts the
journey conversations whose lines contain any word of the unit the map attaches them to. A low
number is the audit's finding: the conversations were laid out in their own order, not the units'.

## 3. The structured course (curriculum coverage matrix)

| Language | Modules | Lessons | Word lessons | Conversation tasks | Recognise | Recall | Construct | Grammar (understand) | Use (conversation) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Arabic | 12 | 54 | 42 | 12 | 12 | 12 | 11 | 5 | 12 |
| German | 13 | 53 | 41 | 12 | 13 | 13 | 13 | 5 | 12 |
| Turkish | 12 | 53 | 41 | 12 | 12 | 12 | 12 | 5 | 12 |
| Spanish | 13 | 52 | 40 | 12 | 13 | 13 | 13 | 6 | 12 |
| Korean | 13 | 49 | 40 | 9 | 13 | 13 | 10 | 4 | 9 |
| Urdu | 13 | 52 | 40 | 12 | 13 | 13 | 13 | 6 | 12 |
| French | 13 | 50 | 38 | 12 | 13 | 13 | 13 | 6 | 12 |
| Hindi | 12 | 50 | 38 | 12 | 12 | 12 | 12 | 6 | 12 |
| Mandarin | 13 | 49 | 40 | 9 | 13 | 13 | 11 | 5 | 9 |
| Nigerian Pidgin | 6 | 43 | 37 | 6 | 6 | 6 | 6 | 4 | 6 |
| Japanese | 11 | 46 | 37 | 9 | 11 | 11 | 9 | 5 | 9 |
| Indonesian | 6 | 41 | 35 | 6 | 6 | 6 | 6 | 4 | 6 |
| Punjabi | 6 | 41 | 35 | 6 | 6 | 6 | 6 | 4 | 6 |
| Persian | 8 | 44 | 36 | 8 | 8 | 8 | 8 | 5 | 8 |
| Malayalam | 8 | 42 | 34 | 8 | 8 | 8 | 7 | 4 | 8 |
| Somali | 8 | 42 | 34 | 8 | 8 | 8 | 8 | 4 | 8 |
| Tagalog | 8 | 42 | 34 | 8 | 8 | 8 | 8 | 4 | 8 |
| Tamil | 8 | 42 | 34 | 8 | 8 | 8 | 7 | 4 | 8 |
| Bengali | 10 | 45 | 36 | 9 | 10 | 10 | 10 | 4 | 9 |
| Vietnamese | 8 | 41 | 33 | 8 | 8 | 8 | 8 | 0 | 8 |
| Yoruba | 8 | 40 | 32 | 8 | 8 | 8 | 8 | 0 | 8 |

Each word lesson teaches at most 7 words in seven phases: recall, introduction, teaching, guided
practice, application, assessment without hints or options, and per-objective feedback. Each
conversation task teaches one journey exchange and assesses it by having the learner build or
choose the reply. A module has a *construct* objective only when its words have example sentences
long enough to build. It has an *understand* objective only when the language has a grammar lesson
placed there.

| Level | Status, every language |
|---|---|
| Pre-A1 | Script courses (Chapter 0) for the non-Latin scripts; letters and marks for Vietnamese and Yoruba |
| A1 | Partially covered: the topics above, as generated structured lessons. **Not reviewed, not validated.** |
| A2 – C2 | **Not built** for any language. The architecture supports them; the content doesn't exist. |

## 4. Each language

### Arabic (`ar`) · العربية

- **Variety and register:** Modern Standard Arabic; Standard, neutral.
- **Writing:** Arabic script, right to left. Romanisation: Informal romanisation (marhaba, shukran) shown beside the script.
- **Structure:** VSO in formal writing; SVO is common.
- **What learners find hard:** Short vowels are usually left unwritten; Sounds English lacks: ع ح ق خ غ; Verbs and adjectives agree in gender and number, including the dual; Nobody speaks the written standard at home: spoken dialects differ.
- **Other varieties:** Spoken forms for Egyptian, Levantine, Gulf, Maghrebi, Iraqi and Sudanese Arabic are shown where a word differs (49 words so far).
- **Units:** Greetings (15), About You (38), Family (14), Numbers 1-10 (15), Food & Drink (17), Common Verbs (43), Places (24), Time (21), Feelings (9), Useful Words (52), Getting Around (18), Weather & Nature (12).
- **Grammar lessons:** The definite article: al-; Sun & moon letters; Gender: masculine & feminine; Pronoun endings; Nominal sentences (no 'is').
- **Course:** 12 modules, 54 lessons.
- **Known issues:**
  - thin units (<12 words): Feelings
  - 9 of 12 journey exchanges use none of their unit's words
- **Content still to write or fix:**
  - Write more grammar lessons (5 today) so that every A1 structure the modules use is explained.
  - Fill the thin units (under 12 words): Feelings.
  - Re-place or rewrite the 9 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Replace synthetic audio with recordings by a speaker of the variety (79 words have a pre-generated synthetic recording).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### German (`de`) · Deutsch

- **Variety and register:** Standard German (Germany); Everyday; Sie with strangers, du with friends.
- **Writing:** Latin alphabet, left to right.
- **Structure:** Verb second in main clauses; verb last in subordinate clauses.
- **What learners find hard:** Every noun is der, die or das, and the article must be learned with it; Four cases change the article (der → den → dem → des); The verb is second in a statement and last after weil, dass, wenn; Separable verbs split: ich rufe dich an.
- **Other varieties:** Austrian and Swiss forms are available as varieties for the tutor.
- **Formal exams elsewhere:** Goethe-Zertifikat, telc, TestDaF.
- **Units:** Greetings (12), About You (17), Family (21), Numbers 1-20 (12), Food & Drink (24), Common Verbs (50), Places (22), Time (20), Connecting Ideas (20), Travel Phrases (14), Body & Feelings (14), Weather & Nature (14), Everyday Life (37).
- **Grammar lessons:** Three genders, and why you can't skip them; The verb goes second. Always.; Accusative — when der becomes den; Verbs that come apart; du and Sie — getting it wrong is worse than a grammar slip.
- **Course:** 13 modules, 53 lessons.
- **Known issues:**
  - 4 of 12 journey exchanges use none of their unit's words
  - no recorded audio: relies on the device's speech voice
- **Content still to write or fix:**
  - Write more grammar lessons (5 today) so that every A1 structure the modules use is explained.
  - Re-place or rewrite the 4 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Turkish (`tr`) · Türkçe

- **Variety and register:** Standard Turkish (Istanbul); Everyday; siz with strangers.
- **Writing:** Latin alphabet, left to right.
- **Structure:** SOV.
- **What learners find hard:** Suffix vowels change to match the word (evde / okulda); Long words built from chains of suffixes; ı (dotless) and i are different letters; The verb comes last.
- **Other varieties:** Regional accents vary; the pack uses standard Istanbul Turkish.
- **Units:** Greetings (10), Being Polite (16), Numbers 1-10 (11), Family & Friends (30), Food & Drink (17), Common Verbs (50), Around Town (18), Describe It (21), Time & Days (18), Getting By (64), Body & Feelings (14), Weather & Nature (8).
- **Grammar lessons:** Words are built by stacking; Vowel harmony — endings copy the word; The verb waits until the end; No gender, no 'the'; Turning anything into a question.
- **Course:** 12 modules, 53 lessons.
- **Known issues:**
  - thin units (<12 words): Greetings, Numbers 1-10, Weather & Nature
  - 8 of 12 journey exchanges use none of their unit's words
  - no recorded audio: relies on the device's speech voice
- **Content still to write or fix:**
  - Write more grammar lessons (5 today) so that every A1 structure the modules use is explained.
  - Fill the thin units (under 12 words): Greetings, Numbers 1-10, Weather & Nature.
  - Re-place or rewrite the 8 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Add verb tables: verbs change with the person here, and there are none to practise from.
  - Resolve: The romanisation field holds a pronunciation guide, not a transliteration.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Spanish (`es`) · Español

- **Variety and register:** Spanish, with Spain's everyday vocabulary (coche); Everyday; tú with friends, usted with strangers.
- **Writing:** Latin alphabet, left to right.
- **Structure:** SVO; subject pronouns usually dropped.
- **What learners find hard:** Two verbs for 'to be': ser and estar; Nouns are masculine or feminine and adjectives agree; Verbs change for every person: hablo, hablas, habla…; The rolled r and the tapped r.
- **Other varieties:** Mexican and Argentine Spanish are available as varieties for the tutor. Latin American vocabulary (carro, jugo) is not yet labelled in lessons.
- **Formal exams elsewhere:** DELE, SIELE.
- **Units:** Greetings (13), About You (20), Family (22), Numbers 1-10 (14), Food & Drink (23), Common Verbs (47), Places (26), Time (18), Connecting Ideas (14), Travel Phrases (17), Body & Feelings (13), Weather & Nature (8), Getting Around (34).
- **Grammar lessons:** Word order: the basics; Ser vs Estar — two ways to 'be'; Gender: el and la; Adjectives agree; Present tense -ar verbs; Asking questions.
- **Course:** 13 modules, 52 lessons.
- **Known issues:**
  - thin units (<12 words): Weather & Nature
  - 9 of 12 journey exchanges use none of their unit's words
- **Content still to write or fix:**
  - Fill the thin units (under 12 words): Weather & Nature.
  - Re-place or rewrite the 9 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Replace synthetic audio with recordings by a speaker of the variety (157 words have a pre-generated synthetic recording).
  - Resolve: The pack does not label Spain-only words, so Latin American learners are not told when a word is regional.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Korean (`ko`) · 한국어

- **Variety and register:** Standard Korean (Seoul); Polite (해요체).
- **Writing:** Hangul, left to right. Romanisation: Revised Romanization (annyeonghaseyo).
- **Structure:** SOV, with particles.
- **What learners find hard:** Speech levels: the verb ending shows politeness; Topic 은/는 versus subject 이/가; Sounds change between syllables (합니다 is said hamnida); The verb comes last.
- **Other varieties:** Regional dialects are not taught.
- **Formal exams elsewhere:** TOPIK.
- **Units:** Greetings (18), About You (23), Family (24), Numbers 1-10 (11), Food & Drink (19), Common Verbs (45), Places (20), Time (15), Connecting Ideas (16), Useful Phrases (39), Body & Feelings (16), Weather & Nature (8), Getting Around (12).
- **Grammar lessons:** Word order: verb LAST; Topic & object particles; Politeness levels; Questions: same words, rising tone.
- **Course:** 13 modules, 49 lessons.
- **Known issues:**
  - thin units (<12 words): Numbers 1-10, Weather & Nature
  - 3 of 9 journey exchanges use none of their unit's words
- **Content still to write or fix:**
  - Write more grammar lessons (4 today) so that every A1 structure the modules use is explained.
  - Fill the thin units (under 12 words): Numbers 1-10, Weather & Nature.
  - Re-place or rewrite the 3 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Replace synthetic audio with recordings by a speaker of the variety (105 words have a pre-generated synthetic recording).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Urdu (`ur`) · اردو

- **Variety and register:** Urdu as spoken in Pakistan; Everyday polite (آپ).
- **Writing:** Perso-Arabic script (Nastaliq), right to left. Romanisation: Informal Roman Urdu (shukriya) shown beside the script.
- **Structure:** SOV, with postpositions.
- **What learners find hard:** The verb comes last; Verbs and adjectives agree with gender; Three levels of 'you': aap, tum, tu; Retroflex and dental consonants (ٹ / ت); ne in the past tense changes what the verb agrees with.
- **Other varieties:** Hindi shares the spoken core; script and formal vocabulary differ. Indian Urdu is available as a variety for the tutor.
- **Units:** Greetings (8), About You (21), Family (27), Numbers 1-10 (11), Food & Drink (20), Common Verbs (49), Places (22), Time (17), Connecting Ideas (13), Travel Phrases (36), Body & Feelings (13), Weather & Nature (10), Getting Around (17).
- **Grammar lessons:** Word order: verb goes LAST; Postpositions, not prepositions; Politeness: aap, tum, tu; Gender shapes the verb; Making it negative: نہیں; Yes/no questions: just ask کیا.
- **Course:** 13 modules, 52 lessons.
- **Known issues:**
  - thin units (<12 words): Greetings, Numbers 1-10, Weather & Nature
  - 10 of 12 journey exchanges use none of their unit's words
  - no recorded audio: relies on the device's speech voice
- **Content still to write or fix:**
  - Fill the thin units (under 12 words): Greetings, Numbers 1-10, Weather & Nature.
  - Re-place or rewrite the 10 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### French (`fr`) · Français

- **Variety and register:** French (France); Everyday; vous with strangers, tu with friends.
- **Writing:** Latin alphabet, left to right.
- **Structure:** SVO; object pronouns go before the verb.
- **What learners find hard:** Many written letters are silent, and liaison joins words; Nouns are masculine or feminine (le / la); Nasal vowels: an, on, in; Negation wraps the verb: ne … pas; Choosing tu or vous.
- **Other varieties:** Québec French is available as a variety for the tutor.
- **Formal exams elsewhere:** DELF, DALF, TCF.
- **Units:** Greetings (9), About You (20), Family (22), Numbers 1-10 (11), Food & Drink (23), Common Verbs (47), Places (25), Time (19), Connecting Ideas (13), Travel Phrases (16), Body & Feelings (11), Weather & Nature (8), Getting Around (37).
- **Grammar lessons:** Word order & subject pronouns; Gender: le, la, un, une; C'est vs Il/Elle est; Adjectives agree & often follow; Negation: ne … pas; Asking questions (3 ways).
- **Course:** 13 modules, 50 lessons.
- **Known issues:**
  - thin units (<12 words): Greetings, Numbers 1-10, Body & Feelings, Weather & Nature
  - 9 of 12 journey exchanges use none of their unit's words
- **Content still to write or fix:**
  - Fill the thin units (under 12 words): Greetings, Numbers 1-10, Body & Feelings, Weather & Nature.
  - Re-place or rewrite the 9 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Replace synthetic audio with recordings by a speaker of the variety (143 words have a pre-generated synthetic recording).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Hindi (`hi`) · हिन्दी

- **Variety and register:** Standard Hindi; Everyday polite (आप).
- **Writing:** Devanagari, left to right. Romanisation: Informal romanisation (dhanyavaad) shown beside the script.
- **Structure:** SOV, with postpositions.
- **What learners find hard:** The verb comes last; Verbs and adjectives agree with gender; Three levels of 'you': aap, tum, tu; Aspirated and retroflex consonants (ठ / ट / त); ने (ne) in the past tense changes what the verb agrees with.
- **Other varieties:** Urdu shares the spoken core; script and formal vocabulary differ.
- **Units:** Greetings (11), About You (32), Family (17), Numbers 1-10 (15), Food & Drink (15), Common Verbs (41), Places (23), Time (16), Feelings (11), Useful Words (44), Getting Around (19), Weather & Nature (12).
- **Grammar lessons:** Word order: verb goes LAST; Postpositions, not prepositions; Politeness: aap, tum, tu; Gender shapes the verb; Making it negative: नहीं; Questions: kya.
- **Course:** 12 modules, 50 lessons.
- **Known issues:**
  - thin units (<12 words): Greetings, Feelings
  - 9 of 12 journey exchanges use none of their unit's words
- **Content still to write or fix:**
  - Fill the thin units (under 12 words): Greetings, Feelings.
  - Re-place or rewrite the 9 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Replace synthetic audio with recordings by a speaker of the variety (79 words have a pre-generated synthetic recording).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Mandarin (`zh`) · 中文

- **Variety and register:** Standard Mandarin (Putonghua); Everyday.
- **Writing:** Simplified Chinese characters, left to right. Romanisation: Pinyin with tone marks (nǐ hǎo).
- **Structure:** SVO.
- **What learners find hard:** Four tones plus a neutral tone; Characters don't show pronunciation: pinyin does; Counting needs a measure word (一个人); Question words stay where the answer goes.
- **Other varieties:** Taiwan Mandarin is available as a variety for the tutor. Traditional characters are not taught.
- **Formal exams elsewhere:** HSK.
- **Units:** Greetings (15), About You (20), Family (25), Numbers 1-10 (11), Food & Drink (17), Common Verbs (41), Places (21), Time (17), Connecting Ideas (17), Useful Phrases (40), Body & Feelings (12), Weather & Nature (9), Getting Around (10).
- **Grammar lessons:** No conjugation, ever; Word order: SVO; Measure words; Questions with 吗 (ma); Negation: 不 and 没.
- **Course:** 13 modules, 49 lessons.
- **Known issues:**
  - thin units (<12 words): Numbers 1-10, Weather & Nature, Getting Around
  - 1 of 9 journey exchanges use none of their unit's words
- **Content still to write or fix:**
  - Write more grammar lessons (5 today) so that every A1 structure the modules use is explained.
  - Fill the thin units (under 12 words): Numbers 1-10, Weather & Nature, Getting Around.
  - Re-place or rewrite the 1 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Replace synthetic audio with recordings by a speaker of the variety (110 words have a pre-generated synthetic recording).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Nigerian Pidgin (`pcm`) · Naijá

- **Variety and register:** Nigerian Pidgin (Naijá); Everyday.
- **Writing:** Latin alphabet, left to right.
- **Structure:** SVO.
- **What learners find hard:** It looks like English, but many words mean something else (sabi = know); dey, don and go mark ongoing, finished and future actions; Spelling is not standardised.
- **Other varieties:** Spoken Pidgin varies across Nigeria and West Africa.
- **Units:** Greetings (19), About You (57), Family (27), Numbers (22), Food & Life (31), Getting Around (99).
- **Grammar lessons:** Verbs never change; 'dey' means it's happening; 'don' means it's finished; 'na' points at things.
- **Course:** 6 modules, 43 lessons.
- **Known issues:**
  - 6 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write more grammar lessons (4 today) so that every A1 structure the modules use is explained.
  - Replace synthetic audio with recordings by a speaker of the variety (66 words have a pre-generated synthetic recording).
  - Add units to cover a full A1 range of topics (6 today; the Urdu, Spanish and Mandarin packs have 13).
  - Resolve: The romanisation field holds a pronunciation guide, not a transliteration.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Japanese (`ja`) · 日本語

- **Variety and register:** Standard Japanese; Polite (です / ます).
- **Writing:** Hiragana, katakana and kanji, left to right. Romanisation: Hepburn-style rōmaji, with long vowels written ou (arigatou).
- **Structure:** SOV, with particles.
- **What learners find hard:** Three scripts: hiragana, katakana and kanji; Particles mark each phrase's role: は, が, を, に; The verb comes last; Polite and plain forms (食べます / 食べる); Counters change with what is counted.
- **Other varieties:** Regional dialects (e.g. Kansai) are not taught.
- **Formal exams elsewhere:** JLPT (N5–N1).
- **Units:** Greetings (17), About You (37), Family (13), Numbers 1-10 (11), Food & Drink (14), Common Verbs (46), Places (23), Time (18), Feelings (13), Useful Words (50), Getting Around (9).
- **Grammar lessons:** Word order: verb LAST; Particles は and を; です (desu) — polite 'is'; Questions with か (ka); No articles, no plurals.
- **Course:** 11 modules, 46 lessons.
- **Known issues:**
  - thin units (<12 words): Numbers 1-10, Getting Around
  - 2 of 9 journey exchanges use none of their unit's words
- **Content still to write or fix:**
  - Write more grammar lessons (5 today) so that every A1 structure the modules use is explained.
  - Fill the thin units (under 12 words): Numbers 1-10, Getting Around.
  - Re-place or rewrite the 2 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Replace synthetic audio with recordings by a speaker of the variety (80 words have a pre-generated synthetic recording).
  - Resolve: The pack has both 母 (haha) and はは for 'mother'.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Indonesian (`id`) · Bahasa Indonesia

- **Variety and register:** Standard Indonesian (Bahasa Indonesia); Standard polite (Anda, tidak).
- **Writing:** Latin alphabet, left to right.
- **Structure:** SVO.
- **What learners find hard:** Verbs don't change for tense: time words do the work; Prefixes change meaning: makan, makanan, dimakan; Two words for 'we': kami (not you) and kita (including you); Everyday speech differs from the standard (nggak / tidak).
- **Other varieties:** Colloquial Jakarta Indonesian is not taught.
- **Units:** Greetings (16), About You (54), Family (26), Numbers (16), Food & Drink (34), Getting Around (99).
- **Grammar lessons:** No tenses — just say when; Plurals by saying it twice; Word order like English; The me- and ber- prefixes.
- **Course:** 6 modules, 41 lessons.
- **Known issues:**
  - 6 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write more grammar lessons (4 today) so that every A1 structure the modules use is explained.
  - Replace synthetic audio with recordings by a speaker of the variety (69 words have a pre-generated synthetic recording).
  - Add units to cover a full A1 range of topics (6 today; the Urdu, Spanish and Mandarin packs have 13).
  - Resolve: The romanisation field holds a pronunciation guide (HAH-loh), not a transliteration.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Punjabi (`pa`) · پنجابی

- **Variety and register:** Punjabi (Pakistan), written in Shahmukhi; Everyday; تسیں (tusin) for respect.
- **Writing:** Shahmukhi (Perso-Arabic script), right to left. Romanisation: Informal romanisation (shukriya) shown beside the script.
- **Structure:** SOV.
- **What learners find hard:** Punjabi has tones, and the spelling doesn't mark them directly; Short vowels are usually not written; Verbs and adjectives agree with gender; tusin (respect) and tun (familiar).
- **Other varieties:** Gurmukhi script (India) is not taught. Spoken Punjabi varies by region.
- **Units:** Greetings (14), About You (57), Family (32), Numbers (22), Food & Drink (28), Getting Around (92).
- **Grammar lessons:** The verb comes last; Postpositions — 'in' comes after; The verb agrees with gender; Respect is built into the plural.
- **Course:** 6 modules, 41 lessons.
- **Known issues:**
  - 2 of 6 journey exchanges use none of their unit's words
  - 6 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write more grammar lessons (4 today) so that every A1 structure the modules use is explained.
  - Re-place or rewrite the 2 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Replace synthetic audio with recordings by a speaker of the variety (80 words have a pre-generated synthetic recording).
  - Add units to cover a full A1 range of topics (6 today; the Urdu, Spanish and Mandarin packs have 13).
  - Add verb tables: verbs change with the person here, and there are none to practise from.
  - Resolve: Device speech uses pa-IN, which reads Gurmukhi, so spoken audio may be missing on many devices.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Persian (`fa`) · فارسی

- **Variety and register:** Iranian Persian (Farsi), as spoken in Tehran; Everyday spoken; شما (shomâ) with strangers.
- **Writing:** Perso-Arabic script, right to left. Romanisation: Romanisation with â for the long a (salâm).
- **Structure:** SOV.
- **What learners find hard:** Short vowels are not written; The ezafe -e links words (ketâb-e man) and is not written; Spoken endings differ from written ones (می‌کنه / می‌کند); Many verbs are compounds: kâr kardan (to work); Taarof: polite refusal and insistence.
- **Other varieties:** Dari (Afghanistan) and Tajik are not taught; they differ in vocabulary and pronunciation.
- **Units:** Greetings (9), Politeness (6), About You (10), Family (24), Feelings (13), Food (13), Everyday (90), Out & About (75).
- **Grammar lessons:** No gender, anywhere; Ezafe — the little -e that links everything; The verb waits at the end; شما and تو — respect is not optional; می‌ makes it habitual or ongoing.
- **Course:** 8 modules, 44 lessons.
- **Known issues:**
  - no reading passages
  - thin units (<12 words): Greetings, Politeness, About You
  - no recorded audio: relies on the device's speech voice
  - 8 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write more grammar lessons (5 today) so that every A1 structure the modules use is explained.
  - Write graded reading passages (none today), so reading has evidence beyond single sentences.
  - Fill the thin units (under 12 words): Greetings, Politeness, About You.
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Add units to cover a full A1 range of topics (8 today; the Urdu, Spanish and Mandarin packs have 13).
  - Add verb tables: verbs change with the person here, and there are none to practise from.
  - Resolve: Example sentences use spoken endings; written forms are not given beside them.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Malayalam (`ml`) · മലയാളം

- **Variety and register:** Standard Malayalam; Everyday; നിങ്ങൾ (ningal) for respect.
- **Writing:** Malayalam script, left to right. Romanisation: Informal romanisation (nandi) shown beside the script.
- **Structure:** SOV.
- **What learners find hard:** Long words built from chains of suffixes; Chillu letters and conjuncts; Retroflex sounds and ഴ (zha); The verb comes last; it doesn't change for the person; Everyday speech differs from the written language.
- **Other varieties:** Regional speech in Kerala varies; the pack uses standard forms.
- **Units:** Greetings (7), Politeness (6), About You (9), Family (23), Feelings (17), Food (14), Everyday (93), Out & About (68).
- **Grammar lessons:** The verb comes last; Respect is the plural; 'And' attaches to the end; Chettan and chechi — titles for strangers.
- **Course:** 8 modules, 42 lessons.
- **Known issues:**
  - no reading passages
  - thin units (<12 words): Greetings, Politeness, About You
  - 1 of 8 journey exchanges use none of their unit's words
  - no recorded audio: relies on the device's speech voice
  - 8 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write more grammar lessons (4 today) so that every A1 structure the modules use is explained.
  - Write graded reading passages (none today), so reading has evidence beyond single sentences.
  - Fill the thin units (under 12 words): Greetings, Politeness, About You.
  - Re-place or rewrite the 1 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Add units to cover a full A1 range of topics (8 today; the Urdu, Spanish and Mandarin packs have 13).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Somali (`so`) · Soomaali

- **Variety and register:** Standard Somali; Everyday.
- **Writing:** Latin alphabet, left to right.
- **Structure:** SOV, with focus markers.
- **What learners find hard:** Statements need a focus marker: waa, baa or ayaa; x and c are throat sounds (x = ħ, c = ʕ); Double vowels are long: dal / daal; The definite article changes with the noun (-ka, -ta, -ga).
- **Other varieties:** Maay and southern varieties are not taught.
- **Units:** Greetings (9), Politeness (6), About You (9), Family (21), Feelings (14), Food (15), Everyday (94), Out & About (69).
- **Grammar lessons:** 'waa' marks a statement; The article sticks to the end; Greeting is a sequence, not a word; 'walaal' — everyone is a sibling.
- **Course:** 8 modules, 42 lessons.
- **Known issues:**
  - no reading passages
  - thin units (<12 words): Greetings, Politeness, About You
  - 2 of 8 journey exchanges use none of their unit's words
  - no recorded audio: relies on the device's speech voice
  - 8 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write more grammar lessons (4 today) so that every A1 structure the modules use is explained.
  - Write graded reading passages (none today), so reading has evidence beyond single sentences.
  - Fill the thin units (under 12 words): Greetings, Politeness, About You.
  - Re-place or rewrite the 2 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Add units to cover a full A1 range of topics (8 today; the Urdu, Spanish and Mandarin packs have 13).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Tagalog (`tl`) · Tagalog

- **Variety and register:** Tagalog (Filipino); Everyday; po and opo for respect.
- **Writing:** Latin alphabet, left to right.
- **Structure:** Verb first.
- **What learners find hard:** The verb comes first; Verb affixes show focus: -um-, mag-, -in; The markers ang, ng and sa; po and opo show respect; Mixing with English (Taglish) is normal in speech.
- **Other varieties:** Other Philippine languages (Cebuano, Ilocano…) are separate languages, not taught.
- **Units:** Greetings (9), Politeness (7), About You (10), Family (18), Feelings (14), Food (16), Everyday (90), Out & About (70).
- **Grammar lessons:** po — the word that makes it respectful; ang and ng — what the sentence is about; The verb changes to match the focus; The linker: na and -ng.
- **Course:** 8 modules, 42 lessons.
- **Known issues:**
  - no reading passages
  - thin units (<12 words): Greetings, Politeness, About You
  - 1 of 8 journey exchanges use none of their unit's words
  - no recorded audio: relies on the device's speech voice
  - 8 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write more grammar lessons (4 today) so that every A1 structure the modules use is explained.
  - Write graded reading passages (none today), so reading has evidence beyond single sentences.
  - Fill the thin units (under 12 words): Greetings, Politeness, About You.
  - Re-place or rewrite the 1 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Add units to cover a full A1 range of topics (8 today; the Urdu, Spanish and Mandarin packs have 13).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Tamil (`ta`) · தமிழ்

- **Variety and register:** Tamil, mainly spoken forms; Everyday; respectful forms for strangers.
- **Writing:** Tamil script, left to right. Romanisation: Informal romanisation (nandri) shown beside the script.
- **Structure:** SOV.
- **What learners find hard:** Spoken Tamil differs sharply from the written language; One letter can be two sounds: க is k or g; Retroflex sounds and ழ (zha); The verb comes last and ends with the person.
- **Other varieties:** Sri Lankan and Indian Tamil differ in speech; the pack doesn't label which it uses.
- **Units:** Greetings (7), Politeness (6), About You (9), Family (23), Feelings (17), Food (14), Everyday (91), Out & About (67).
- **Grammar lessons:** The verb comes last; Respect is the plural; Two Tamils: written and spoken; Anna and akka — titles for strangers.
- **Course:** 8 modules, 42 lessons.
- **Known issues:**
  - no reading passages
  - thin units (<12 words): Greetings, Politeness, About You
  - no recorded audio: relies on the device's speech voice
  - 8 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write more grammar lessons (4 today) so that every A1 structure the modules use is explained.
  - Write graded reading passages (none today), so reading has evidence beyond single sentences.
  - Fill the thin units (under 12 words): Greetings, Politeness, About You.
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Add units to cover a full A1 range of topics (8 today; the Urdu, Spanish and Mandarin packs have 13).
  - Add verb tables: verbs change with the person here, and there are none to practise from.
  - Resolve: The pack mixes spoken verb forms (இருக்கேன்) with written pronouns (நீங்கள், நாங்கள்); spoken would be நீங்க, நாங்க. A reviewer should decide and label.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Bengali (`bn`) · বাংলা

- **Variety and register:** Standard colloquial Bengali (Bangla); Everyday; আপনি (apni) for strangers.
- **Writing:** Bengali script, left to right. Romanisation: Informal romanisation (dhonnobad) shown beside the script.
- **Structure:** SOV.
- **What learners find hard:** Conjunct letters join two or three consonants into one shape; The inherent vowel (ô) is pronounced but not written; Three levels of 'you': apni, tumi, tui; The verb comes last; The classifiers টা / টি attach to nouns and numbers.
- **Other varieties:** Bangladesh and West Bengal share the standard but differ in everyday words (পানি / জল for water) and greetings.
- **Units:** Greetings (12), About You (26), Family (24), Numbers 1-10 (14), Food & Drink (12), Common Verbs (40), Places (27), Time (17), Connecting Ideas (18), Useful Phrases (42).
- **Grammar lessons:** Word order: verb LAST; No grammatical gender; Politeness: tumi, apni, tui; Postpositions.
- **Course:** 10 modules, 45 lessons.
- **Known issues:**
  - 1 of 9 journey exchanges use none of their unit's words
- **Content still to write or fix:**
  - Write more grammar lessons (4 today) so that every A1 structure the modules use is explained.
  - Re-place or rewrite the 1 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Replace synthetic audio with recordings by a speaker of the variety (88 words have a pre-generated synthetic recording).
  - Resolve: The pack mixes Bangladeshi usage (পানি, আসসালামু আলাইকুম) with West Bengal usage (নমস্কার) without labelling either. A reviewer should choose a default and label the other.
  - Resolve: Device speech uses bn-IN while the course flag is Bangladesh.
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Vietnamese (`vi`) · Tiếng Việt

- **Variety and register:** Vietnamese, Northern (Hanoi) standard; Everyday; pronouns by age and relationship.
- **Writing:** Latin alphabet, left to right.
- **Structure:** SVO.
- **What learners find hard:** Six tones change the meaning of a word; Pronouns depend on age and relationship (anh, chị, em, bạn); Counting needs a classifier (một con mèo); Text online often drops the marks that carry the tones.
- **Other varieties:** Southern words are labelled where the pack has them (dạ / vâng).
- **Units:** Greetings (16), About You (23), Family (24), Numbers (15), Food & Drink (20), Common Verbs (48), Places (27), Time & Feelings (55).
- **Course:** 8 modules, 41 lessons.
- **Known issues:**
  - no grammar lessons: structures are only met inside sentences
  - no reading passages
  - no recorded audio: relies on the device's speech voice
  - 8 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write grammar lessons: there are none, so structures are only met inside example sentences.
  - Write graded reading passages (none today), so reading has evidence beyond single sentences.
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Add units to cover a full A1 range of topics (8 today; the Urdu, Spanish and Mandarin packs have 13).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

### Yoruba (`yo`) · Èdè Yorùbá

- **Variety and register:** Standard Yoruba; Everyday; ẹ for elders and respect.
- **Writing:** Latin alphabet, left to right.
- **Structure:** SVO.
- **What learners find hard:** Three tones change the meaning of a word; Underdotted letters ẹ, ọ, ṣ are different sounds; ẹ (respect) and o (familiar); Unmarked text is ambiguous.
- **Other varieties:** Regional dialects (Ìjẹ̀ṣà, Ẹ̀gbá…) are not taught.
- **Units:** Greetings (15), About You (20), Family (23), Numbers (14), Food & Drink (19), Common Verbs (45), Places (26), Time & Feelings (58).
- **Course:** 8 modules, 40 lessons.
- **Known issues:**
  - no grammar lessons: structures are only met inside sentences
  - no reading passages
  - 1 of 8 journey exchanges use none of their unit's words
  - no recorded audio: relies on the device's speech voice
  - 8 units: short of a full A1 topic range
- **Content still to write or fix:**
  - Write grammar lessons: there are none, so structures are only met inside example sentences.
  - Write graded reading passages (none today), so reading has evidence beyond single sentences.
  - Re-place or rewrite the 1 journey conversations that use none of their own unit's words (the map now only claims them once practised, but the order is still not topical).
  - Record audio with a speaker of the course's variety. Today it relies on the device's synthetic voice.
  - Add units to cover a full A1 range of topics (8 today; the Urdu, Spanish and Mandarin packs have 13).
  - Have every lesson reviewed by a qualified speaker and a language teacher (none has been yet).

## 5. What every language shares

- One course architecture: profile (`src/data/courses.js`) → modules → lessons → typed objectives
  (`src/engine/curriculum.js`), and seven-phase lessons (`src/engine/guided.js`).
- One learner model: the answer log and skill profile (`src/engine/skills.js`), used by Home, the
  Course screen and the AI tutor (`src/ai/learnerContext.js`, `api/coach.js`).
- The same screens, drawing each script in its own direction and typeface (`scriptFont` in
  `src/data/registry.js`), tested in every language by `scripts/verify-course.mjs`.

