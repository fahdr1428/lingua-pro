// =============================================================================
// alphabets.mjs (v90) — the script course for the five newest languages.
//
// THE BUG THIS FIXES IS A LIE IN THE UI.
//
// Malayalam, Tamil, Persian, Tagalog and Somali all shipped with `alphabet: []`.
// The Letters & sounds screen has an empty state for that case, and the empty
// state said, hardcoded, regardless of which language you had chosen:
//
//     "Malayalam uses the Latin alphabet, so you're already set!"
//
// Malayalam does not use the Latin alphabet. Neither does Tamil, nor Persian.
// Someone who came to this app specifically to learn to READ the language their
// family writes in was told there was nothing to learn and sent away. For a
// script like Malayalam — where the vowel changes shape depending on which
// consonant it attaches to — that is the difference between the course working
// and the course being useless.
//
// WHY THE NICHE LANGUAGES NEED THIS MOST. A learner picking Spanish already
// reads Spanish. A learner picking Malayalam, Tamil or Persian usually cannot
// read a word, because they grew up speaking it at home and being schooled in
// English. That learner is the entire premise of this app, and the script is
// the first door in front of them.
//
// AND THE LATIN ONES ARE NOT EXEMPT. Somali is written in Latin letters that do
// not say what an English speaker expects: c is a throat sound, x is a hard h
// from the back of the throat, q is deeper than an English k. Reading Somali
// "as if it were English" produces something no Somali speaker will follow.
// Tagalog has ng as a single letter that can open a word. So those two get a
// SOUNDS course rather than a letters course — same screen, different job.
// =============================================================================

const L = (char, name, sound, group, note) => ({ char, name, sound, group, ...(note ? { note } : {}) });

export const ALPHABETS = {
  // ---------------------------------------------------------------------------
  // MALAYALAM — 12 vowels, 36 consonants, and vowels that change shape.
  // ---------------------------------------------------------------------------
  ml: {
    groups: [
      { id: "vowels", title: "Vowels", emoji: "🅰️", description: "അ, ആ, ഇ, ഈ — the sounds everything else hangs off" },
      { id: "consonants_1", title: "First consonants", emoji: "🔤", description: "ക, ഗ, ച, ജ, ത, ദ — the ones you'll meet first" },
      { id: "consonants_2", title: "More consonants", emoji: "🔠", description: "ന, പ, ബ, മ, യ, ര, ല, വ — filling out the set" },
      { id: "tricky", title: "The hard ones", emoji: "🎯", description: "ഴ, ണ, ള, റ — sounds English simply does not have" },
    ],
    letters: [
      L("അ", "a", "a as in 'about' — short", "vowels"),
      L("ആ", "aa", "aa as in 'father' — long", "vowels"),
      L("ഇ", "i", "i as in 'sit'", "vowels"),
      L("ഈ", "ee", "ee as in 'see'", "vowels"),
      L("ഉ", "u", "u as in 'put'", "vowels"),
      L("ഊ", "oo", "oo as in 'moon'", "vowels"),
      L("എ", "e", "e as in 'bed'", "vowels"),
      L("ഏ", "ae", "ay as in 'say' — long", "vowels"),
      L("ഒ", "o", "o as in 'hot'", "vowels"),
      L("ഓ", "oo", "o as in 'go' — long", "vowels"),
      L("ഐ", "ai", "i as in 'kite'", "vowels"),
      L("ഔ", "au", "ow as in 'cow'", "vowels"),
      L("ക", "ka", "k", "consonants_1"),
      L("ഖ", "kha", "k with a puff of air after it", "consonants_1",
        "Malayalam pairs almost every consonant with an 'aspirated' twin — same sound, plus a breath. Hold your palm in front of your mouth: ഖ moves it, ക doesn't."),
      L("ഗ", "ga", "g as in 'go'", "consonants_1"),
      L("ച", "cha", "ch as in 'chair'", "consonants_1"),
      L("ജ", "ja", "j as in 'jam'", "consonants_1"),
      L("ത", "tha", "th with the tongue on the teeth, not the roof", "consonants_1",
        "Not the 'th' of 'think'. The tongue touches the back of the upper teeth and the sound is a clean t."),
      L("ദ", "da", "d with the tongue on the teeth", "consonants_1"),
      L("ട", "ta", "t with the tongue curled back", "consonants_1",
        "A 'retroflex' — curl the tongue tip back to the roof of the mouth. English has nothing like it, and mixing it with ത changes words."),
      L("ഡ", "da", "d with the tongue curled back", "consonants_1"),
      L("ന", "na", "n", "consonants_2"),
      L("പ", "pa", "p", "consonants_2"),
      L("ബ", "ba", "b", "consonants_2"),
      L("മ", "ma", "m", "consonants_2"),
      L("യ", "ya", "y as in 'yes'", "consonants_2"),
      L("ര", "ra", "a light tapped r", "consonants_2"),
      L("ല", "la", "l", "consonants_2"),
      L("വ", "va", "v, softer than English — closer to w", "consonants_2"),
      L("സ", "sa", "s", "consonants_2"),
      L("ഹ", "ha", "h", "consonants_2"),
      L("ശ", "sha", "sh as in 'ship'", "consonants_2"),
      L("ഴ", "zha", "no English equivalent — tongue curled far back, close to an American r", "tricky",
        "The famous one. It appears in the name of the language itself (മലയാളം) and in Kozhikode. If you get ഴ right you sound like you grew up with it."),
      L("ണ", "na", "n with the tongue curled back", "tricky"),
      L("ള", "la", "l with the tongue curled back", "tricky"),
      L("റ", "ra", "a harder, trilled r", "tricky"),
      L("ങ", "nga", "ng as in 'sing'", "tricky"),
      L("ഞ", "nya", "ny as in 'canyon'", "tricky"),
    ],
  },

  // ---------------------------------------------------------------------------
  // TAMIL — famously few consonants, and no aspirated pairs at all.
  // ---------------------------------------------------------------------------
  ta: {
    groups: [
      { id: "vowels", title: "Vowels", emoji: "🅰️", description: "அ, ஆ, இ, ஈ — twelve of them, in short and long pairs" },
      { id: "consonants_1", title: "First consonants", emoji: "🔤", description: "க, ச, ட, த, ப — the five that change sound by position" },
      { id: "consonants_2", title: "More consonants", emoji: "🔠", description: "ந, ம, ய, ர, ல, வ — the rest of the everyday set" },
      { id: "tricky", title: "The hard ones", emoji: "🎯", description: "ழ, ள, ற, ண — the sounds that mark a Tamil speaker" },
    ],
    letters: [
      L("அ", "a", "a as in 'about'", "vowels"),
      L("ஆ", "aa", "aa as in 'father'", "vowels"),
      L("இ", "i", "i as in 'sit'", "vowels"),
      L("ஈ", "ee", "ee as in 'see'", "vowels"),
      L("உ", "u", "u as in 'put'", "vowels"),
      L("ஊ", "oo", "oo as in 'moon'", "vowels"),
      L("எ", "e", "e as in 'bed'", "vowels"),
      L("ஏ", "ae", "ay as in 'say'", "vowels"),
      L("ஐ", "ai", "i as in 'kite'", "vowels"),
      L("ஒ", "o", "o as in 'hot'", "vowels"),
      L("ஓ", "oo", "o as in 'go'", "vowels"),
      L("ஔ", "au", "ow as in 'cow'", "vowels"),
      L("க", "ka", "k at the start, g in the middle", "consonants_1",
        "Tamil has no separate letters for k and g, or p and b. The SAME letter is read hard at the start of a word and soft between vowels — so ka becomes ga in the middle. This is why Tamil needs so few consonants."),
      L("ச", "cha", "ch at the start, s in the middle", "consonants_1"),
      L("ட", "ta", "t with the tongue curled back", "consonants_1"),
      L("த", "tha", "th with the tongue on the teeth", "consonants_1"),
      L("ப", "pa", "p at the start, b in the middle", "consonants_1"),
      L("ந", "na", "n with the tongue on the teeth", "consonants_2"),
      L("ம", "ma", "m", "consonants_2"),
      L("ய", "ya", "y as in 'yes'", "consonants_2"),
      L("ர", "ra", "a light tapped r", "consonants_2"),
      L("ல", "la", "l", "consonants_2"),
      L("வ", "va", "v, softer than English", "consonants_2"),
      L("ஞ", "nya", "ny as in 'canyon'", "consonants_2"),
      L("ங", "nga", "ng as in 'sing'", "consonants_2"),
      L("ழ", "zha", "no English equivalent — tongue curled far back", "tricky",
        "The sound Tamil is proudest of. It is in the word தமிழ் (Tamil) itself, which is why speakers sometimes say the language is named after a sound no one else has."),
      L("ள", "la", "l with the tongue curled back", "tricky"),
      L("ற", "tra", "a hard trilled r, or 'tr' when doubled", "tricky"),
      L("ண", "na", "n with the tongue curled back", "tricky"),
      L("ன", "na", "a third n — the everyday one at the end of words", "tricky",
        "Tamil has three letters for n and they are not interchangeable in spelling, even where they sound close."),
    ],
  },

  // ---------------------------------------------------------------------------
  // PERSIAN — Arabic script, four extra letters, right to left.
  // ---------------------------------------------------------------------------
  fa: {
    groups: [
      { id: "basics", title: "The first letters", emoji: "🔤", description: "ا, ب, ت, س — start here, and read right to left" },
      { id: "persian_only", title: "The Persian four", emoji: "⭐", description: "پ, چ, ژ, گ — letters Arabic does not have" },
      { id: "common", title: "Everyday letters", emoji: "🔠", description: "د, ر, ز, ف, ک, ل, م, ن — the workhorses" },
      { id: "tricky", title: "The hard ones", emoji: "🎯", description: "ع, غ, ق, ح — throat sounds, and letters that share a sound" },
    ],
    letters: [
      L("ا", "alef", "a, or a long aa", "basics",
        "Persian is written RIGHT TO LEFT, and most letters change shape depending on whether they sit at the start, middle or end of a word. Alef is one of the few that barely changes."),
      L("ب", "be", "b", "basics"),
      L("ت", "te", "t", "basics"),
      L("س", "sin", "s", "basics"),
      L("ش", "shin", "sh as in 'ship'", "basics"),
      L("ی", "ye", "y, or a long ee", "basics"),
      L("و", "vav", "v, or a long oo", "basics"),
      L("پ", "pe", "p", "persian_only",
        "One of four letters Persian added to the Arabic alphabet for sounds Arabic doesn't have. If you already read Arabic, these four are the new ones."),
      L("چ", "che", "ch as in 'chair'", "persian_only"),
      L("ژ", "zhe", "zh — the s in 'measure'", "persian_only"),
      L("گ", "gaf", "g as in 'go'", "persian_only"),
      L("د", "dal", "d", "common"),
      L("ر", "re", "a tapped r", "common"),
      L("ز", "ze", "z", "common"),
      L("ف", "fe", "f", "common"),
      L("ک", "kaf", "k", "common"),
      L("ل", "lam", "l", "common"),
      L("م", "mim", "m", "common"),
      L("ن", "nun", "n", "common"),
      L("ه", "he", "h", "common"),
      L("ج", "jim", "j as in 'jam'", "common"),
      L("خ", "khe", "kh — a rasp from the back of the throat, like Scottish 'loch'", "tricky"),
      L("ح", "he jimi", "h — in Persian, said the same as ه", "tricky",
        "Persian keeps several letters from Arabic that it pronounces identically. ح and ه are both just h; ز، ذ، ض، ظ are all z; س، ص، ث are all s. You have to learn which words use which — the sound won't tell you."),
      L("ع", "eyn", "a catch in the throat, or silent", "tricky"),
      L("غ", "gheyn", "a gargled g from the back of the throat", "tricky"),
      L("ق", "qaf", "in Persian, the same as غ", "tricky"),
      L("ص", "sad", "s", "tricky"),
      L("ط", "ta", "t", "tricky"),
    ],
  },

  // ---------------------------------------------------------------------------
  // SOMALI — Latin letters that do not say what English speakers expect.
  // ---------------------------------------------------------------------------
  so: {
    groups: [
      { id: "surprises", title: "Letters that lie", emoji: "⚠️", description: "c, x, q, dh — the ones that don't sound like English at all" },
      { id: "vowels", title: "Vowels, short and long", emoji: "🅰️", description: "a/aa, e/ee, i/ii, o/oo, u/uu — length changes the word" },
      { id: "familiar", title: "The ones you already know", emoji: "✅", description: "b, d, f, g, h, j, k, l, m, n, r, s, t, w, y" },
    ],
    letters: [
      L("c", "c", "a tightening deep in the throat — NOT an English c", "surprises",
        "Somali's most misread letter. It is the Arabic ayn: a constriction at the base of the throat. 'Caano' (milk) does not start with a k or an s sound. Reading Somali as if it were English produces something no Somali speaker will follow."),
      L("x", "x", "a hard h from deep in the throat", "surprises",
        "Not 'ks'. Push air from the very back of the throat with the mouth open. 'Xasan' is the name English writes as Hassan."),
      L("q", "q", "a k made much further back, near the uvula", "surprises",
        "Deeper than an English k, almost swallowed. 'Qoys' (family) starts here."),
      L("dh", "dh", "d with the tongue curled back", "surprises",
        "A single letter written with two characters. The tongue tip curls up and back, like the d in Indian-English 'doctor'."),
      L("kh", "kh", "a rasp from the back of the throat, like Scottish 'loch'", "surprises"),
      L("sh", "sh", "sh as in 'ship'", "surprises"),
      L("'", "hamza", "a catch in the throat, as in 'uh-oh'", "surprises"),
      L("a / aa", "a, aa", "short a, and a held-long aa", "vowels",
        "Somali vowel LENGTH changes meaning, and it is written by doubling the letter. Getting the length wrong doesn't give you an accent, it gives you a different word."),
      L("e / ee", "e, ee", "short e, and a held-long ee", "vowels"),
      L("i / ii", "i, ii", "short i, and a held-long ii", "vowels"),
      L("o / oo", "o, oo", "short o, and a held-long oo", "vowels"),
      L("u / uu", "u, uu", "short u, and a held-long uu", "vowels"),
      L("b", "b", "b", "familiar"),
      L("d", "d", "d with the tongue on the teeth", "familiar"),
      L("g", "g", "g as in 'go'", "familiar"),
      L("j", "j", "j as in 'jam'", "familiar"),
      L("r", "r", "a rolled r", "familiar"),
      L("w", "w", "w as in 'water'", "familiar"),
      L("y", "y", "y as in 'yes'", "familiar"),
    ],
  },

  // ---------------------------------------------------------------------------
  // TAGALOG — Latin, but with its own habits.
  // ---------------------------------------------------------------------------
  tl: {
    groups: [
      { id: "surprises", title: "What's different", emoji: "⚠️", description: "ng as one letter, and the glottal stop nobody writes" },
      { id: "vowels", title: "Five clean vowels", emoji: "🅰️", description: "a, e, i, o, u — each one sound, always" },
    ],
    letters: [
      L("ng", "ng", "ng as in 'singer' — and it can START a word", "surprises",
        "Tagalog treats ng as a single letter, and unlike English it can begin a word: 'ngayon' (now), 'ngiti' (smile). English speakers find a word-initial ng almost impossible at first; practise by saying 'singing' and then dropping the 'si'."),
      L("ng (the word)", "nang", "the marker word, said 'nang'", "surprises",
        "Confusingly, 'ng' is also a grammatical word — and it is pronounced 'nang', not spelled that way. It marks the non-focus participant in a sentence."),
      L("'", "glottal stop", "a catch in the throat, usually not written", "surprises",
        "Many Tagalog words end in a catch that the spelling does not show. 'Bata' (child) ends with one; 'bata' (bathrobe) does not. Native speakers hear the difference immediately."),
      L("a", "a", "ah as in 'father' — never the a of 'cat'", "vowels"),
      L("e", "e", "eh as in 'bed'", "vowels"),
      L("i", "i", "ee as in 'see' — never the i of 'sit'", "vowels"),
      L("o", "o", "oh as in 'go'", "vowels"),
      L("u", "u", "oo as in 'moon'", "vowels",
        "Tagalog vowels are pure and never glide. English 'go' slides from o toward u; Tagalog 'o' holds one sound the whole way through."),
    ],
  },
};
