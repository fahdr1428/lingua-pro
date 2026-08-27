// =============================================================================
// script-systems.mjs (v91) — the half of every writing system we weren't teaching.
//
// v90 gave five languages a list of letters. A list of letters is not a script
// course, and for the hard scripts it is not even half of one:
//
//   ARABIC SCRIPT (ar, fa, ur, pa) — every letter was shown in ISOLATED form.
//     No word in any of these languages is written in isolated forms. A learner
//     who finished the entire Urdu alphabet could not read a single Urdu word.
//
//   ABUGIDAS (hi, bn, ml, ta) — consonants were taught bare. ക is "ka", but ki
//     is കി and ku is കു. The vowel signs ARE the system; without them the
//     consonant chart decodes nothing.
//
//   HANGUL (ko) — all 24 jamo, and no mention that they are never written in a
//     line. ㅎ + ㅏ + ㄴ is not ㅎㅏㄴ, it is 한.
//
// So this file carries, per language:
//   primer      — how the writing system actually works, read before letter one
//   joining     — which letters refuse to connect to the next one (Arabic script)
//   vowelSigns  — the matra set on a demo consonant (abugidas)
//   blocks      — how jamo stack (Hangul)
//   confusables — pairs that differ by one dot or one stroke, and the tell
//
// Joined forms are NOT hardcoded as presentation-form codepoints. They are
// built at render time with ZWJ (U+200D), which is what the Unicode standard
// is for and which lets the reader's own Arabic font shape them correctly.
// =============================================================================

const F = (icon, label, text) => ({ icon, label, text });

export const SCRIPT_SYSTEMS = {
  // ---------------------------------------------------------------------------
  // ARABIC SCRIPT FAMILY
  // ---------------------------------------------------------------------------
  ar: {
    primer: {
      title: "How Arabic is written",
      tagline: "28 letters, right to left, and they hold hands.",
      facts: [
        F("←", "Direction", "Right to left. Numbers stay left to right, so a phone number reads the way you expect."),
        F("🔗", "Letters join", "Letters connect to their neighbours inside a word and change shape depending on where they sit. This is the single biggest hurdle, and it is mechanical — the same letter, four positions."),
        F("🅰️", "Short vowels", "Usually not written. Native readers supply them from context, the way you read 'bk' as 'book' in a shopping list. Learners' texts add them as small marks above and below."),
        F("🔤", "No capitals", "There is no upper and lower case. One shape per position, and that is all."),
      ],
      hardest: "Six letters refuse to connect to whatever follows them. After one of those, the next letter starts fresh — which is why Arabic words look like they have gaps in them.",
      firstWin: "Once you can spot ا, ل and م you can already read الم and the word الله. Recognition comes faster than you expect.",
    },
    joining: {
      nonConnectors: ["ا", "د", "ر"],
      note: "These never connect to the letter AFTER them. Everything else connects on both sides.",
    },
    confusables: [
      { chars: ["ب", "ت", "ث"], tell: "Identical body. One dot below, two dots above, three dots above — the dots are the entire difference between b, t and th." },
      { chars: ["ج", "ح"], tell: "Same hook. The dot inside makes it Jeem; bare, it is the deep-throat Ha." },
      { chars: ["د", "ر"], tell: "Dal sits on the line, Ra dips below it. Both refuse to join forwards." },
      { chars: ["س", "ش"], tell: "Three teeth. Three dots above turns Seen into Sheen." },
    ],
  },

  fa: {
    primer: {
      title: "How Persian is written",
      tagline: "The Arabic script, plus four letters Arabic doesn't have.",
      facts: [
        F("←", "Direction", "Right to left, like Arabic — and if you read any Arabic or Urdu, most of this is already yours."),
        F("🔗", "Letters join", "Letters connect and change shape by position. Same mechanism as Arabic, same four positions."),
        F("✨", "Four extra letters", "پ (p), چ (ch), ژ (zh) and گ (g) exist in Persian and not in Arabic. They are built from Arabic letters with extra dots or a stroke."),
        F("🅰️", "Short vowels", "Not written. Persian spelling is far more regular than English, so this is less painful than it sounds."),
      ],
      hardest: "Several letters share one sound. س، ص both say s; ت، ط both say t; ز، ذ، ض، ظ all say z. They are spelling history, not pronunciation — you learn which word takes which.",
      firstWin: "Persian has no grammatical gender and no noun cases. The script is the hard part, and it is the part that ends.",
    },
    joining: {
      nonConnectors: ["ا", "د", "ر", "ز", "ژ", "و"],
      note: "These never connect to the letter AFTER them. Everything else connects on both sides.",
    },
    confusables: [
      { chars: ["ب", "پ"], tell: "One dot below is be. Three dots below is pe — the Persian addition." },
      { chars: ["ج", "چ"], tell: "One dot inside is jim. Three dots inside is che." },
      { chars: ["ز", "ژ"], tell: "One dot is ze. Three dots is zhe, the sound in 'measure'." },
      { chars: ["ک", "گ"], tell: "Add a second stroke on top and kaf becomes gaf." },
      { chars: ["ع", "غ"], tell: "Same shape. The dot makes it gheyn, a gargled g rather than a throat catch." },
    ],
  },

  ur: {
    primer: {
      title: "How Urdu is written",
      tagline: "Persian script in nastaliq — the one that slopes.",
      facts: [
        F("←", "Direction", "Right to left. Urdu uses the Persian alphabet with extra letters for sounds from Sanskrit."),
        F("🔗", "Letters join", "Letters connect and change shape. In nastaliq they also cascade DOWNWARD as they join, so a word hangs like a slope rather than sitting on a line."),
        F("🌀", "Retroflex letters", "ٹ, ڈ, ڑ are made with the tongue curled back. They are written as their plain cousins with a small ط above, and they are real, meaning-changing sounds."),
        F("💨", "Aspirated pairs", "Many consonants have a breathy twin written with ھ after them — کھ, پھ, تھ. The puff of air changes the word."),
      ],
      hardest: "Nastaliq. The same letters you learned sitting flat suddenly stack diagonally, and word shapes stop looking like the sum of their letters. It is a matter of hours of exposure, not a different alphabet.",
      firstWin: "If you read any Arabic or Persian you already have most of the letters. And Urdu spelling maps to speech far more honestly than English does.",
    },
    joining: {
      nonConnectors: ["ا", "د", "ر", "و"],
      note: "These never connect to the letter AFTER them. Everything else connects on both sides.",
    },
    confusables: [
      { chars: ["ب", "پ", "ت", "ٹ", "ث"], tell: "One body, five letters. Dots below, dots above, and a small ط for the retroflex. This family is where most early reading errors live." },
      { chars: ["ج", "چ", "ح", "خ"], tell: "One hook. Dot inside, three dots inside, nothing, dot above." },
      { chars: ["ت", "ٹ"], tell: "The small ط above makes it retroflex — tongue curled back against the roof of the mouth. Urdu does this to د and ر too." },
      { chars: ["ک", "گ"], tell: "The second stroke on top turns Kaaf into Gaaf." },
    ],
  },

  pa: {
    primer: {
      title: "How Punjabi is written",
      tagline: "Shahmukhi — the Perso-Arabic script used in Pakistan.",
      facts: [
        F("←", "Direction", "Right to left. This is Shahmukhi, which is how Punjabi is written in Pakistan and by most of the British Punjabi diaspora."),
        F("🔗", "Letters join", "Letters connect and change shape by position, exactly as in Urdu."),
        F("👥", "Two scripts", "Punjabi is also written in Gurmukhi (ਪੰਜਾਬੀ) in Indian Punjab. Same language, different alphabet — this course teaches Shahmukhi."),
        F("🎵", "Tone", "Punjabi is tonal, and the tones are not written. Words that look identical on the page can differ in pitch, so listen as much as you read."),
      ],
      hardest: "Nothing on the page tells you the tone. It comes from the audio, which is why every word in this course has it.",
      firstWin: "If you read Urdu, you can already read most Shahmukhi. The letters are the same family and the joining rules are identical.",
    },
    joining: {
      nonConnectors: ["ا"],
      note: "Alif never connects to the letter after it. Everything else here connects on both sides.",
    },
    confusables: [
      { chars: ["ب", "پ", "ت", "ٹ"], tell: "Same body. One dot below, three below, two above, and a small ط for the retroflex." },
      { chars: ["ک", "گ"], tell: "The extra stroke on top makes it Gaf." },
    ],
  },

  // ---------------------------------------------------------------------------
  // ABUGIDAS — consonant carries a built-in 'a'; vowels are marks
  // ---------------------------------------------------------------------------
  hi: {
    primer: {
      title: "How Hindi is written",
      tagline: "Devanagari — every consonant already has a vowel in it.",
      facts: [
        F("→", "Direction", "Left to right, hung from a horizontal line across the top. That line is part of the writing, not decoration."),
        F("🅰️", "Built-in vowel", "क is not 'k'. It is 'ka'. Every consonant carries a short 'a' unless something removes or replaces it."),
        F("✏️", "Vowel signs", "To get ki, ku, ke you attach a mark to the consonant. Twelve marks cover every vowel, and they are the same twelve on every letter."),
        F("🔇", "Killing the vowel", "A small stroke underneath (्) removes the built-in 'a'. That is how you write consonants that end a word."),
      ],
      hardest: "The sign for 'i' is written BEFORE the consonant but pronounced AFTER it. कि is read 'ki', not 'ik'. Everyone trips on this once, then never again.",
      firstWin: "Devanagari is close to perfectly phonetic. Once you know the letters and the twelve signs, you can pronounce a word you have never seen — something English will never give you.",
    },
    vowelSigns: {
      demo: "क", demoName: "ka",
      note: "Every one of these attaches to every consonant the same way. Learn them once on क and you have them on all of them.",
      signs: [
        { sign: "ा", combined: "का", reads: "kaa", where: "after", hint: "long a, as in 'father'" },
        { sign: "ि", combined: "कि", reads: "ki", where: "before", hint: "WRITTEN BEFORE, READ AFTER" },
        { sign: "ी", combined: "की", reads: "kee", where: "after", hint: "long ee" },
        { sign: "ु", combined: "कु", reads: "ku", where: "below", hint: "short u" },
        { sign: "ू", combined: "कू", reads: "koo", where: "below", hint: "long oo" },
        { sign: "े", combined: "के", reads: "ke", where: "above", hint: "as in 'cake'" },
        { sign: "ै", combined: "कै", reads: "kai", where: "above", hint: "open, as in 'cat'" },
        { sign: "ो", combined: "को", reads: "ko", where: "after", hint: "as in 'note'" },
        { sign: "ौ", combined: "कौ", reads: "kau", where: "after", hint: "open o" },
        { sign: "्", combined: "क्", reads: "k", where: "below", hint: "kills the vowel entirely" },
      ],
    },
    confusables: [
      { chars: ["अ", "आ"], tell: "One extra vertical stroke turns short 'a' into long 'aa'. That stroke is a whole different word." },
      { chars: ["इ", "ई"], tell: "Short i and long ee. The difference is the loop on top." },
    ],
  },

  bn: {
    primer: {
      title: "How Bengali is written",
      tagline: "One of the most beautiful scripts in the world, and a logical one.",
      facts: [
        F("→", "Direction", "Left to right, hung from a top line like Devanagari but with rounder, more flowing shapes."),
        F("🅰️", "Built-in vowel", "ক is 'ka', not 'k'. Every consonant carries a vowel already."),
        F("✏️", "Vowel signs", "Marks attach around the consonant to change that vowel. Some go before, some after, and one wraps around both sides."),
        F("🔗", "Conjuncts", "When two consonants meet with no vowel between them they fuse into a single new shape. There are a few hundred; you learn the common ones by reading, not by drilling."),
      ],
      hardest: "The 'o' sign wraps around the consonant on BOTH sides — কো is one syllable, not two letters with something between them. And the inherent vowel is 'ô' (as in 'or'), not 'a'.",
      firstWin: "Bengali and Assamese share this script, and it is close cousin to Devanagari. Learn it once and a great deal of South Asian text opens up.",
    },
    vowelSigns: {
      demo: "ক", demoName: "ka",
      note: "The same marks work on every consonant in the alphabet.",
      signs: [
        { sign: "া", combined: "কা", reads: "ka", where: "after", hint: "long a" },
        { sign: "ি", combined: "কি", reads: "ki", where: "before", hint: "WRITTEN BEFORE, READ AFTER" },
        { sign: "ী", combined: "কী", reads: "kee", where: "after", hint: "long ee" },
        { sign: "ু", combined: "কু", reads: "ku", where: "below", hint: "short u" },
        { sign: "ূ", combined: "কূ", reads: "koo", where: "below", hint: "long oo" },
        { sign: "ে", combined: "কে", reads: "ke", where: "before", hint: "written before the consonant" },
        { sign: "ো", combined: "কো", reads: "ko", where: "around", hint: "WRAPS AROUND BOTH SIDES" },
        { sign: "ৌ", combined: "কৌ", reads: "kou", where: "around", hint: "also wraps around" },
        { sign: "্", combined: "ক্", reads: "k", where: "below", hint: "kills the vowel" },
      ],
    },
    confusables: [
      { chars: ["অ", "আ"], tell: "The extra stroke on the right makes it long. অ is 'ô', আ is 'a'." },
    ],
  },

  ml: {
    primer: {
      title: "How Malayalam is written",
      tagline: "Round, dense, and far more regular than it looks.",
      facts: [
        F("→", "Direction", "Left to right. The curves come from writing on palm leaves — straight strokes would have split the leaf."),
        F("🅰️", "Built-in vowel", "ക is 'ka', not 'k'. Every consonant arrives with a short 'a' attached."),
        F("✏️", "Vowel signs", "Marks go before, after, above or below the consonant to change that vowel. Same set on every letter."),
        F("🔗", "Conjuncts", "Consonant clusters fuse into single shapes, and Malayalam has a lot of them. Reading teaches these far better than memorising does."),
      ],
      hardest: "The retroflex/dental pairs — ത vs ട, ന vs ണ, ല vs ള, ര vs റ. To English ears each pair sounds like one sound. They are different letters and different words, and getting them wrong is the thing that marks out a heritage speaker who never learned to read.",
      firstWin: "ഴ, the sound in the middle of 'Malayalam' itself, exists in almost no other language on earth. When you can make it, you have something most learners never get.",
    },
    vowelSigns: {
      demo: "ക", demoName: "ka",
      note: "Learn these ten on ക and you can read them on all 36 consonants.",
      signs: [
        { sign: "ാ", combined: "കാ", reads: "kaa", where: "after", hint: "long a" },
        { sign: "ി", combined: "കി", reads: "ki", where: "after", hint: "short i" },
        { sign: "ീ", combined: "കീ", reads: "kee", where: "after", hint: "long ee" },
        { sign: "ു", combined: "കു", reads: "ku", where: "attached", hint: "fuses onto the letter" },
        { sign: "ൂ", combined: "കൂ", reads: "koo", where: "attached", hint: "long oo" },
        { sign: "െ", combined: "കെ", reads: "ke", where: "before", hint: "WRITTEN BEFORE, READ AFTER" },
        { sign: "േ", combined: "കേ", reads: "kae", where: "before", hint: "also written before" },
        { sign: "ൊ", combined: "കൊ", reads: "ko", where: "around", hint: "WRAPS AROUND BOTH SIDES" },
        { sign: "ൈ", combined: "കൈ", reads: "kai", where: "before", hint: "the word for 'hand'" },
        { sign: "്", combined: "ക്", reads: "k", where: "after", hint: "chandrakkala — kills the vowel" },
      ],
    },
    confusables: [
      { chars: ["ന", "ണ"], tell: "Dental n and retroflex n. Tongue at the teeth vs tongue curled back — different letters, different words." },
      { chars: ["ത", "ട"], tell: "Dental t and retroflex t. The most common mistake English speakers make in Malayalam." },
      { chars: ["ല", "ള"], tell: "Plain l and retroflex l. Both are common; they are not interchangeable." },
      { chars: ["ര", "റ"], tell: "Soft r and hard r. റ is tapped harder and further back." },
    ],
  },

  ta: {
    primer: {
      title: "How Tamil is written",
      tagline: "One of the oldest scripts still in daily use — and a small one.",
      facts: [
        F("→", "Direction", "Left to right. Tamil has been written continuously for more than two thousand years."),
        F("🅰️", "Built-in vowel", "க is 'ka'. Every consonant carries a short 'a' unless a mark changes it."),
        F("🎯", "Only 18 consonants", "Tamil has far fewer consonants than its neighbours — no separate letters for aspirated or voiced sounds. Fewer letters to learn, but the same letter is pronounced differently depending on where it sits in the word."),
        F("✏️", "Vowel signs", "12 vowels × 18 consonants gives 216 combinations, all built from the same small set of marks."),
      ],
      hardest: "Three letters for 'n' (ந ன ண) and three for 'l' (ல ள ழ), and the differences are real. ழ in particular exists in almost no other language — it is in the word 'Tamil' itself (தமிழ்).",
      firstWin: "The same letter க sounds like k at the start of a word and like g between vowels. Nobody writes this down — it is a rule you absorb, and once you have it, Tamil spelling becomes predictable.",
    },
    vowelSigns: {
      demo: "க", demoName: "ka",
      note: "These marks work the same way on all 18 consonants.",
      signs: [
        { sign: "ா", combined: "கா", reads: "kaa", where: "after", hint: "long a" },
        { sign: "ி", combined: "கி", reads: "ki", where: "above", hint: "short i" },
        { sign: "ீ", combined: "கீ", reads: "kee", where: "above", hint: "long ee" },
        { sign: "ு", combined: "கு", reads: "ku", where: "attached", hint: "FUSES — the letter changes shape" },
        { sign: "ூ", combined: "கூ", reads: "koo", where: "attached", hint: "also fuses" },
        { sign: "ெ", combined: "கெ", reads: "ke", where: "before", hint: "WRITTEN BEFORE, READ AFTER" },
        { sign: "ே", combined: "கே", reads: "kae", where: "before", hint: "long e, written before" },
        { sign: "ொ", combined: "கொ", reads: "ko", where: "around", hint: "WRAPS AROUND BOTH SIDES" },
        { sign: "ை", combined: "கை", reads: "kai", where: "before", hint: "the word for 'hand'" },
        { sign: "்", combined: "க்", reads: "k", where: "above", hint: "pulli — kills the vowel" },
      ],
    },
    confusables: [
      { chars: ["ந", "ன", "ண"], tell: "Three n's. Dental, alveolar and retroflex — where your tongue sits decides which word you said." },
      { chars: ["ல", "ள", "ழ"], tell: "Three l's. The last one, ழ, is the famous Tamil sound in தமிழ் and has no English equivalent." },
      { chars: ["ர", "ற"], tell: "Soft r and hard r. ற is trilled harder and further back." },
    ],
  },

  // ---------------------------------------------------------------------------
  // HANGUL — letters that stack
  // ---------------------------------------------------------------------------
  ko: {
    primer: {
      title: "How Korean is written",
      tagline: "Invented on purpose, in 1443, to be learnable in a morning.",
      facts: [
        F("→", "Direction", "Left to right. Hangul was designed from scratch by King Sejong so that ordinary people could become literate quickly — and it works."),
        F("🧱", "Letters STACK", "Hangul letters are never written in a row. They group into square syllable blocks: ㅎ + ㅏ + ㄴ is not ㅎㅏㄴ, it is 한."),
        F("👄", "Shapes show the mouth", "The consonant shapes are diagrams of what your mouth does. ㄱ is the back of the tongue raised; ㅁ is closed lips. No other alphabet does this."),
        F("➕", "Aspiration is a stroke", "Add a line to a consonant and it gains a puff of air: ㄱ→ㅋ, ㄷ→ㅌ, ㅂ→ㅍ, ㅈ→ㅊ. The alphabet is built from a handful of shapes."),
      ],
      hardest: "Block assembly, not the letters. Where a jamo lands inside the square depends on whether the vowel is vertical (ㅏ ㅣ) or horizontal (ㅗ ㅜ ㅡ), and whether there is a final consonant.",
      firstWin: "Genuinely learnable in a day. Of every writing system in this app, Hangul gives the most reading ability for the least effort — you will be sounding out shop signs by tonight.",
    },
    blocks: {
      note: "Every Korean syllable is a square. Where the pieces go depends on the shape of the vowel.",
      patterns: [
        {
          shape: "Vertical vowel — side by side",
          parts: ["ㅎ", "ㅏ"], result: "하", reads: "ha",
          why: "Vowels with a long vertical line (ㅏ ㅓ ㅑ ㅕ ㅣ) sit to the RIGHT of the consonant.",
        },
        {
          shape: "Horizontal vowel — stacked",
          parts: ["ㄱ", "ㅗ"], result: "고", reads: "go",
          why: "Vowels with a long horizontal line (ㅗ ㅜ ㅡ ㅛ ㅠ) sit UNDERNEATH the consonant.",
        },
        {
          shape: "With a final consonant",
          parts: ["ㅎ", "ㅏ", "ㄴ"], result: "한", reads: "han",
          why: "A closing consonant — the batchim — goes along the bottom of the whole block.",
        },
        {
          shape: "Silent placeholder",
          parts: ["ㅇ", "ㅏ"], result: "아", reads: "a",
          why: "A syllable can't start with a bare vowel, so ㅇ fills the slot and says nothing. At the BOTTOM of a block the same letter says 'ng'.",
        },
        {
          shape: "Putting it together",
          parts: ["한", "국"], result: "한국", reads: "Hanguk — 'Korea'",
          why: "Two blocks, six letters. You can already read the name of the country.",
        },
      ],
    },
    confusables: [
      { chars: ["ㅏ", "ㅑ"], tell: "One tick or two. Two ticks adds a y: a → ya." },
      { chars: ["ㅗ", "ㅛ"], tell: "Same rule stacked the other way: o → yo." },
      { chars: ["ㄱ", "ㅋ"], tell: "The extra stroke adds the puff of air: g → k." },
      { chars: ["ㄷ", "ㅌ"], tell: "Same again: d → t." },
      { chars: ["ㅁ", "ㅂ"], tell: "ㅁ is a closed box (m). ㅂ has the top open (b)." },
    ],
  },

  // ---------------------------------------------------------------------------
  // SYLLABARY + LOGOGRAPHS
  // ---------------------------------------------------------------------------
  ja: {
    primer: {
      title: "How Japanese is written",
      tagline: "Three systems at once, in the same sentence.",
      facts: [
        F("あ", "Hiragana", "46 characters, each a full syllable rather than a single sound. Grammar, endings and native words. This is what this course teaches, and it is where everyone starts."),
        F("カ", "Katakana", "The same 46 syllables in a second, angular set — used for foreign words, names and emphasis. コーヒー is 'coffee'."),
        F("漢", "Kanji", "Thousands of Chinese characters carrying meaning rather than sound. About 2,000 are needed for a newspaper, and they are learned over years, not weeks."),
        F("␣", "No spaces", "Japanese does not put spaces between words. The mix of three scripts is what shows you where words begin and end."),
      ],
      hardest: "There is no way around kanji, and no shortcut. The good news is that hiragana alone lets you read children's books, menus with furigana, and every grammatical ending in the language.",
      firstWin: "Each kana is one syllable, always pronounced the same way. Japanese has no tones, no genders, and five clean vowel sounds — the pronunciation is genuinely easy.",
    },
    confusables: [
      { chars: ["さ", "き"], tell: "Nearly the same shape. き has an extra crossbar — and this is the pattern to expect: hiragana distinguishes many pairs by a single stroke." },
      { chars: ["ら", "わ"], tell: "Both are two strokes with a hook. ら hooks inward at the top right; わ has a full vertical on the left." },
    ],
  },

  zh: {
    primer: {
      title: "How Mandarin is written — and how you get in",
      tagline: "There is no alphabet. So we start with the one that was made for you.",
      facts: [
        F("字", "Characters", "Chinese is written in characters, each carrying meaning rather than sound. There is no alphabet to learn and no way to sound out a character you have never seen."),
        F("a", "Pinyin", "Pinyin spells Mandarin sounds in Latin letters. It is not Chinese writing — it is the ladder in, and it is what this course teaches first."),
        F("˥", "Four tones", "The same syllable in a different pitch is a different word. mā is mother, mǎ is horse. Tone is not expression, it is part of the word."),
        F("🧩", "Characters have parts", "Most characters are built from a meaning component and a sound component. 妈 (mā, mother) is 女 'woman' plus 马 'mǎ'. Once you see this, characters stop being pictures to memorise."),
      ],
      hardest: "The tones, and the fact that pinyin letters do not say what an English speaker expects. q is roughly 'ch', x is roughly 'sh', and zh/ch/sh are said with the tongue curled back. Learn these four wrong and every word after them is wrong.",
      firstWin: "Mandarin grammar is startlingly simple — no verb conjugation, no plurals, no gender, no tenses. Nearly all the difficulty is in the sound and the script, and none of it is in the sentences.",
    },
    confusables: [
      { chars: ["j", "zh"], tell: "j is said with the tongue flat and forward. zh is the same sound with the tongue curled back." },
      { chars: ["q", "ch"], tell: "Same pair again, aspirated: q is forward, ch is curled back." },
      { chars: ["x", "sh"], tell: "And again: x is forward and hissy, sh is curled back." },
      { chars: ["ǎ", "à"], tell: "Third tone dips down then rises. Fourth tone falls sharply, like an order." },
    ],
  },
};

// Languages genuinely written in the Latin alphabet — no script system to teach.
export const LATIN_SCRIPT = ["es", "fr", "de", "id", "tr", "pcm", "tl", "so"];
