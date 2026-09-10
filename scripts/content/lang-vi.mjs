// =============================================================================
// lang-vi.mjs (v102) — Vietnamese.
//
// ~85 million speakers, and one of the largest diasporas of any language in
// this app: roughly 2.3 million in the United States, several hundred thousand
// each in Australia, France, Canada, Germany and the Czech Republic. Almost
// every one of those communities has a second generation that understands the
// dinner table and cannot hold up their end of it. That is who this app is for.
//
// WHAT MAKES VIETNAMESE HARD, AND WHAT THAT MEANS FOR THE PACK
//
// It is written in the Latin alphabet, so a learner can read it from day one —
// and that is a trap, because the marks are not decoration:
//
//     ma  ghost      má  mother      mà  but      mả  tomb
//     mã  horse      mạ  rice seedling
//
// Six tones, all written, all contrastive. A pack that omitted them would teach
// people to say the wrong words confidently. Every headword and every example
// here carries its full diacritics.
//
// The vocabulary is NORTHERN (Hanoi) standard, which is what most teaching
// material uses. Southern speakers say and write some of these differently —
// where the difference is one a learner will actually hit, the translation
// says so rather than pretending there is one Vietnamese.
//
// Format: [conceptId|null, unit, category, lemma, translation, example, exampleEn]
// Latin script, so no transliteration field — validate-vocab only requires one
// for non-Latin packs.
// =============================================================================

export const VI = {
  code: "vi",
  units: [
    { id: "u1", title: "Greetings", emoji: "👋", description: "Hello, goodbye, and the word that changes with who you're talking to" },
    { id: "u2", title: "About You", emoji: "🙋", description: "Pronouns — and why Vietnamese has no simple 'I'" },
    { id: "u3", title: "Family", emoji: "👨‍👩‍👧", description: "The words you'll need at the table" },
    { id: "u4", title: "Numbers", emoji: "🔢", description: "Counting, and asking what things cost" },
    { id: "u5", title: "Food & Drink", emoji: "🍜", description: "Rice, tea, and ordering without pointing" },
    { id: "u6", title: "Common Verbs", emoji: "🏃", description: "Go, come, eat, know — the verbs that never change form" },
    { id: "u7", title: "Places", emoji: "📍", description: "Home, market, and finding the bathroom" },
    { id: "u8", title: "Time & Feelings", emoji: "🕐", description: "Today, tomorrow, tired, hungry" },
  ],
  alphabetGroups: [
    { id: "tones", title: "The six tones", emoji: "🎵", description: "ma má mà mả mã mạ — six different words" },
    { id: "vowels", title: "Vowels you don't have", emoji: "🅰️", description: "ơ, ư, â, ă, ê, ô — six more than English" },
    { id: "surprises", title: "Letters that lie", emoji: "⚠️", description: "đ, ng, nh, x, d — none sound like they look" },
  ],
  alphabet: [
    // --- tones -------------------------------------------------------------
    { char: "a", name: "ngang (level)", sound: "flat, no mark — 'ma' = ghost", group: "tones",
      note: "The unmarked tone. Not 'no tone' — a deliberate level pitch, and the one the other five are measured against." },
    { char: "á", name: "sắc (rising)", sound: "pitch rises sharply — 'má' = mother", group: "tones",
      note: "Rises like the end of an English question, but faster and only on the vowel." },
    { char: "à", name: "huyền (falling)", sound: "low and drifting down — 'mà' = but", group: "tones" },
    { char: "ả", name: "hỏi (dipping)", sound: "dips then rises — 'mả' = tomb", group: "tones",
      note: "The hook is not a question mark. In the north it dips and comes back up; in the south it is closer to a plain low tone." },
    { char: "ã", name: "ngã (broken)", sound: "rises with a catch in the middle — 'mã' = horse", group: "tones",
      note: "There is a glottal stop inside this one. Northern speakers make it clearly; many southern speakers merge it with hỏi." },
    { char: "ạ", name: "nặng (heavy)", sound: "short, low, cut off — 'mạ' = rice seedling", group: "tones",
      note: "The dot means the syllable is squeezed short and stops abruptly." },
    // --- vowels ------------------------------------------------------------
    { char: "ơ", name: "ơ", sound: "like the 'u' in 'fur', with no r", group: "vowels" },
    { char: "ư", name: "ư", sound: "an 'oo' said with the lips spread, not rounded", group: "vowels",
      note: "English has no equivalent. Say 'ee' and then, without moving your lips, pull your tongue back." },
    { char: "â", name: "â", sound: "a short 'uh'", group: "vowels" },
    { char: "ă", name: "ă", sound: "a very short 'a'", group: "vowels" },
    { char: "ê", name: "ê", sound: "like the 'ay' in 'day', without the glide", group: "vowels" },
    { char: "ô", name: "ô", sound: "like the 'o' in 'go', without the glide", group: "vowels" },
    // --- surprises ---------------------------------------------------------
    { char: "đ", name: "đ", sound: "an English 'd'", group: "surprises",
      note: "This is the ordinary d. The letter written 'd' is NOT — see below. Getting these two the wrong way round is the most common early mistake." },
    { char: "d", name: "d", sound: "a 'z' in the north, a 'y' in the south", group: "surprises",
      note: "Never an English d. 'Dạ' (the polite yes) is 'za' in Hanoi and 'ya' in Saigon." },
    { char: "ng", name: "ng", sound: "the 'ng' of 'singer' — and it can start a word", group: "surprises",
      note: "English only puts this sound at the end of a syllable. Vietnamese starts words with it: Nguyễn, ngon, ngủ." },
    { char: "nh", name: "nh", sound: "like the 'ñ' in 'señor'", group: "surprises" },
    { char: "x", name: "x", sound: "an 's'", group: "surprises" },
    { char: "gi", name: "gi", sound: "a 'z' in the north, a 'y' in the south", group: "surprises" },
    { char: "tr", name: "tr", sound: "a 'ch' said with the tongue curled back", group: "surprises" },
    { char: "ph", name: "ph", sound: "an 'f'", group: "surprises",
      note: "Which is why phở is 'fuh', not 'poh'." },
  ],
  // [conceptId, unit, category, lemma, translation, example, exampleEn]
  vocab: [
    // --- u1 greetings ------------------------------------------------------
    ["hello", "u1", "Greetings", "xin chào", "hello", "Xin chào, tôi là Nam", "Hello, I'm Nam"],
    [null, "u1", "Greetings", "chào", "hi (with a pronoun after it)", "Chào chị!", "Hello (to an older woman)!"],
    ["goodbye", "u1", "Greetings", "tạm biệt", "goodbye", "Tạm biệt, hẹn gặp lại", "Goodbye, see you again"],
    ["yes", "u1", "Greetings", "vâng", "yes (northern polite)", "Vâng, tôi hiểu", "Yes, I understand"],
    [null, "u1", "Greetings", "dạ", "yes (southern polite)", "Dạ, con biết rồi", "Yes, I know"],
    ["no", "u1", "Greetings", "không", "no, not", "Không, cảm ơn", "No, thank you"],
    ["thanks", "u1", "Politeness", "cảm ơn", "thank you", "Cảm ơn anh nhiều", "Thank you very much"],
    ["please", "u1", "Politeness", "làm ơn", "please", "Làm ơn giúp tôi", "Please help me"],
    ["sorry", "u1", "Politeness", "xin lỗi", "sorry, excuse me", "Xin lỗi, tôi đến muộn", "Sorry, I'm late"],
    [null, "u1", "Greetings", "khỏe không", "how are you? (lit. well or not)", "Chị khỏe không?", "How are you?"],
    [null, "u1", "Greetings", "khỏe", "well, healthy", "Tôi khỏe, cảm ơn", "I'm well, thank you"],
    [null, "u1", "Politeness", "không có gì", "you're welcome (lit. it's nothing)", "Không có gì đâu", "It's really nothing"],

    // --- u2 about you ------------------------------------------------------
    ["i", "u2", "People", "tôi", "I, me (neutral)", "Tôi sống ở Hà Nội", "I live in Hanoi"],
    ["you", "u2", "People", "bạn", "you (friend, equal)", "Bạn tên là gì?", "What's your name?"],
    [null, "u2", "People", "anh", "older brother; you (to an older man)", "Anh đi đâu đấy?", "Where are you going?"],
    [null, "u2", "People", "chị", "older sister; you (to an older woman)", "Chị ấy là bác sĩ", "She is a doctor"],
    [null, "u2", "People", "em", "younger sibling; you (to someone younger)", "Em học lớp mấy?", "What year are you in?"],
    ["we", "u2", "People", "chúng tôi", "we (not including you)", "Chúng tôi đến từ Úc", "We come from Australia"],
    ["he", "u2", "People", "anh ấy", "he", "Anh ấy là anh trai tôi", "He is my older brother"],
    ["she", "u2", "People", "chị ấy", "she", "Chị ấy nói ba thứ tiếng", "She speaks three languages"],
    ["name", "u2", "About You", "tên", "name", "Tên tôi là Linh", "My name is Linh"],
    [null, "u2", "About You", "người", "person", "Người kia là ai?", "Who is that person?"],

    // --- u3 family ---------------------------------------------------------
    ["mother", "u3", "Family", "mẹ", "mother", "Mẹ tôi nấu ăn rất ngon", "My mother cooks very well"],
    // Southerners say "ba"; it is also the word for three, so it lives here in
    // the gloss rather than as a second card with the same spelling.
    ["father", "u3", "Family", "bố", "father, dad (ba in the south)", "Bố tôi đi làm rồi", "My father has gone to work"],
    ["brother", "u3", "Family", "anh trai", "older brother", "Anh trai tôi ở Sài Gòn", "My older brother is in Saigon"],
    ["sister", "u3", "Family", "chị gái", "older sister", "Chị gái tôi là giáo viên", "My older sister is a teacher"],
    ["son", "u3", "Family", "con trai", "son", "Con trai tôi đi học", "My son goes to school"],
    ["daughter", "u3", "Family", "con gái", "daughter", "Con gái tôi bảy tuổi", "My daughter is seven"],
    ["family", "u3", "Family", "gia đình", "family", "Gia đình tôi rất đông", "My family is very big"],
    ["grandmother", "u3", "Family", "bà", "grandmother", "Bà tôi ở quê", "My grandmother is in the countryside"],
    ["grandfather", "u3", "Family", "ông", "grandfather", "Ông tôi kể chuyện hay lắm", "My grandfather tells stories well"],
    ["uncle", "u3", "Family", "chú", "uncle (father's younger brother)", "Chú tôi sống ở Huế", "My uncle lives in Hue"],
    ["aunt", "u3", "Family", "cô", "aunt (father's sister)", "Cô tôi nấu phở ngon", "My aunt makes good phở"],
    ["friend", "u3", "People", "bạn bè", "friend, friends", "Tôi đi với bạn bè", "I'm going with friends"],
    ["man", "u3", "People", "đàn ông", "man", "Người đàn ông kia là ai?", "Who is that man?"],
    ["woman", "u3", "People", "phụ nữ", "woman", "Phụ nữ ấy là mẹ tôi", "That woman is my mother"],
    ["doctor", "u3", "People", "bác sĩ", "doctor", "Tôi cần gặp bác sĩ", "I need to see a doctor"],

    // --- u4 numbers --------------------------------------------------------
    ["one", "u4", "Numbers", "một", "one", "Chỉ còn một cái", "Only one is left"],
    ["two", "u4", "Numbers", "hai", "two", "Tôi có hai chị gái", "I have two older sisters"],
    ["three", "u4", "Numbers", "ba", "three", "Ba ngày nữa", "Three more days"],
    ["four", "u4", "Numbers", "bốn", "four", "Bốn người trong gia đình", "Four people in the family"],
    // năm is five and also year. One card, both glosses.
    ["five", "u4", "Numbers", "năm", "five, year", "Đợi năm phút", "Wait five minutes"],
    [null, "u4", "Numbers", "mười", "ten", "Mười nghìn đồng", "Ten thousand dong"],
    ["howmuch", "u4", "Questions", "bao nhiêu", "how much, how many", "Cái này bao nhiêu tiền?", "How much is this?"],
    ["money", "u4", "Common", "tiền", "money", "Tôi không mang tiền", "I didn't bring money"],
    [null, "u4", "Common", "đắt", "expensive", "Cái này đắt quá", "This is too expensive"],
    [null, "u4", "Common", "rẻ", "cheap", "Ở chợ rẻ hơn", "It's cheaper at the market"],

    // --- u5 food -----------------------------------------------------------
    ["water", "u5", "Food", "nước", "water", "Cho tôi xin nước", "Water for me, please"],
    ["food", "u5", "Food", "đồ ăn", "food", "Đồ ăn ở đây ngon lắm", "The food here is very good"],
    ["rice", "u5", "Food", "cơm", "rice (cooked)", "Tôi ăn cơm mỗi ngày", "I eat rice every day"],
    ["bread", "u5", "Food", "bánh mì", "bread; the sandwich", "Sáng nay tôi ăn bánh mì", "This morning I ate bánh mì"],
    ["tea", "u5", "Food", "trà", "tea", "Ông tôi uống trà mỗi sáng", "My grandfather drinks tea every morning"],
    ["milk", "u5", "Food", "sữa", "milk", "Cho thêm sữa nhé", "Add some milk"],
    [null, "u5", "Food", "phở", "phở — the noodle soup", "Phở bò hay phở gà?", "Beef phở or chicken phở?"],
    [null, "u5", "Food", "cà phê", "coffee", "Cà phê sữa đá, cảm ơn", "Iced milk coffee, thank you"],
    [null, "u5", "Food", "ngon", "delicious", "Món này ngon quá!", "This dish is delicious!"],
    ["eat", "u5", "Verbs", "ăn", "to eat", "Bạn muốn ăn gì?", "What do you want to eat?"],
    ["drink", "u5", "Verbs", "uống", "to drink", "Tôi uống trà mỗi sáng", "I drink tea every morning"],

    // --- u6 verbs ----------------------------------------------------------
    ["go", "u6", "Verbs", "đi", "to go", "Bạn muốn đi đâu?", "Where do you want to go?"],
    ["come", "u6", "Verbs", "đến", "to come, to arrive", "Chị tôi đến ngày mai", "My sister is coming tomorrow"],
    ["want", "u6", "Verbs", "muốn", "to want", "Tôi muốn học tiếng Việt", "I want to learn Vietnamese"],
    ["have", "u6", "Verbs", "có", "to have, there is", "Bạn có thời gian không?", "Do you have time?"],
    ["know", "u6", "Verbs", "biết", "to know", "Tôi không biết chỗ này", "I don't know this place"],
    ["understand", "u6", "Verbs", "hiểu", "to understand", "Tôi muốn hiểu bạn", "I want to understand you"],
    ["speak", "u6", "Verbs", "nói", "to speak, to say", "Mẹ tôi nói ba thứ tiếng", "My mother speaks three languages"],
    ["help", "u6", "Verbs", "giúp", "to help", "Bạn giúp tôi được không?", "Can you help me?"],
    ["see", "u6", "Verbs", "thấy", "to see", "Tôi không thấy gì cả", "I can't see anything"],
    ["give", "u6", "Verbs", "cho", "to give; for", "Cho tôi một cái", "Give me one"],
    ["take", "u6", "Verbs", "lấy", "to take, to get", "Lấy giúp tôi cái kia", "Get me that one, please"],
    ["do", "u6", "Verbs", "làm", "to do, to make", "Bạn làm nghề gì?", "What work do you do?"],
    ["buy", "u6", "Verbs", "mua", "to buy", "Tôi mua ở chợ", "I bought it at the market"],
    ["open", "u6", "Verbs", "mở", "to open", "Mở cửa giúp tôi", "Open the door for me"],
    ["sleep", "u6", "Verbs", "ngủ", "to sleep", "Tôi muốn đi ngủ", "I want to go to sleep"],
    ["think", "u6", "Verbs", "nghĩ", "to think", "Tôi nghĩ về bạn", "I'm thinking about you"],
    ["can", "u6", "Verbs", "có thể", "can, to be able to", "Tôi có thể giúp bạn", "I can help you"],
    ["work", "u6", "Verbs", "làm việc", "to work", "Hôm nay tôi không làm việc", "I'm not working today"],

    // --- u7 places ---------------------------------------------------------
    ["house", "u7", "Places", "nhà", "house, home", "Tôi đang ở nhà", "I'm at home"],
    ["bathroom", "u7", "Places", "nhà vệ sinh", "bathroom, toilet", "Nhà vệ sinh ở đâu?", "Where is the bathroom?"],
    ["market", "u7", "Places", "chợ", "market", "Tôi đi chợ mua rau", "I'm going to the market to buy vegetables"],
    ["city", "u7", "Places", "thành phố", "city", "Thành phố này rất đông", "This city is very crowded"],
    ["hotel", "u7", "Places", "khách sạn", "hotel", "Khách sạn ở gần đây", "The hotel is nearby"],
    ["here", "u7", "Places", "đây", "here", "Ngồi đây đi", "Sit here"],
    ["there", "u7", "Places", "kia", "there, over there", "Cái kia của tôi", "That one over there is mine"],
    ["near", "u7", "Places", "gần", "near, close", "Chợ gần nhà tôi", "The market is near my house"],
    ["far", "u7", "Places", "xa", "far", "Ga tàu xa lắm", "The station is very far"],
    ["car", "u7", "Transport", "xe ô tô", "car", "Nhà tôi có xe ô tô", "My family has a car"],
    ["train", "u7", "Transport", "tàu hỏa", "train", "Tàu hỏa đến muộn", "The train arrived late"],
    [null, "u7", "Transport", "xe máy", "motorbike", "Ở Việt Nam ai cũng đi xe máy", "In Vietnam everyone rides a motorbike"],
    ["left", "u7", "Common", "bên trái", "left", "Rẽ bên trái", "Turn left"],
    ["right", "u7", "Common", "bên phải", "right", "Nhà vệ sinh bên phải", "The bathroom is on the right"],

    // --- u8 time & feelings ------------------------------------------------
    ["today", "u8", "Time", "hôm nay", "today", "Hôm nay tôi không làm việc", "I'm not working today"],
    ["tomorrow", "u8", "Time", "ngày mai", "tomorrow", "Ngày mai tôi đi Huế", "Tomorrow I'm going to Hue"],
    ["yesterday", "u8", "Time", "hôm qua", "yesterday", "Hôm qua trời mưa", "It rained yesterday"],
    ["now", "u8", "Time", "bây giờ", "now", "Bây giờ mấy giờ rồi?", "What time is it now?"],
    ["time", "u8", "Time", "thời gian", "time", "Tôi không có thời gian", "I don't have time"],
    ["day", "u8", "Time", "ngày", "day", "Một ngày dài", "A long day"],
    ["week", "u8", "Time", "tuần", "week", "Tuần sau tôi về", "I'm coming back next week"],
    ["tired", "u8", "Feelings", "mệt", "tired", "Tôi mệt quá", "I'm so tired"],
    ["hungry", "u8", "Feelings", "đói", "hungry", "Tôi đói rồi", "I'm hungry"],
    ["thirsty", "u8", "Feelings", "khát", "thirsty", "Tôi khát nước", "I'm thirsty"],
    ["happy", "u8", "Feelings", "vui", "happy, glad", "Tôi rất vui được gặp bạn", "I'm very glad to meet you"],
    ["sad", "u8", "Feelings", "buồn", "sad", "Hôm nay tôi hơi buồn", "I'm a bit sad today"],
    ["sick", "u8", "Feelings", "ốm", "sick, ill", "Con tôi bị ốm", "My child is sick"],

    // --- questions & connectors --------------------------------------------
    ["what", "u2", "Questions", "gì", "what", "Đây là cái gì?", "What is this?"],
    ["where", "u7", "Questions", "ở đâu", "where", "Bạn sống ở đâu?", "Where do you live?"],
    ["who", "u2", "Questions", "ai", "who", "Bạn đi với ai?", "Who are you going with?"],
    ["when", "u8", "Questions", "khi nào", "when", "Khi nào bạn đến?", "When are you arriving?"],
    ["why", "u2", "Questions", "tại sao", "why", "Tại sao bạn buồn?", "Why are you sad?"],
    ["and", "u2", "Connectors", "và", "and", "Bố và mẹ tôi", "My father and mother"],
    ["or", "u2", "Connectors", "hay", "or", "Trà hay cà phê?", "Tea or coffee?"],
    ["but", "u2", "Connectors", "nhưng", "but", "Tôi muốn đi nhưng tôi mệt", "I want to go but I'm tired"],
    ["because", "u2", "Connectors", "vì", "because", "Vì trời mưa", "Because it's raining"],
    ["with", "u2", "Connectors", "với", "with", "Đi với tôi", "Come with me"],

    // --- common & describing -----------------------------------------------
    ["good", "u1", "Common", "tốt", "good", "Đây là một ý tốt", "That's a good idea"],
    ["bad", "u1", "Common", "xấu", "bad", "Hôm qua là một ngày xấu", "Yesterday was a bad day"],
    ["big", "u7", "Common", "to", "big", "Nhà bố tôi rất to", "My father's house is very big"],
    ["small", "u7", "Common", "nhỏ", "small", "Một cái bàn nhỏ", "A small table"],
    ["hot", "u8", "Weather", "nóng", "hot", "Trà còn nóng", "The tea is still hot"],
    ["cold", "u8", "Weather", "lạnh", "cold", "Nước lạnh quá", "The water is very cold"],
    ["very", "u1", "Common", "rất", "very", "Món này rất ngon", "This dish is very good"],
    [null, "u1", "Common", "quá", "too, so (after the word)", "Đắt quá!", "Too expensive!"],
    ["more", "u5", "Common", "thêm", "more, additional", "Cho thêm một cái nữa", "Give me one more"],
    ["also", "u2", "Common", "cũng", "also, too", "Tôi cũng đi", "I'm going too"],
    ["all", "u2", "Common", "tất cả", "all, everything", "Tất cả đều tốt", "Everything is fine"],

    // --- tier 3 ------------------------------------------------------------
    ["head", "u8", "Body", "đầu", "head", "Tôi đau đầu", "I have a headache"],
    ["hand", "u8", "Body", "tay", "hand", "Rửa tay đi", "Wash your hands"],
    ["heart", "u8", "Body", "tim", "heart", "Tim tôi đập nhanh", "My heart is beating fast"],
    ["black", "u5", "Colors", "đen", "black", "Cà phê đen", "Black coffee"],
    ["white", "u5", "Colors", "trắng", "white", "Áo trắng", "A white shirt"],
    ["sun", "u8", "Weather", "mặt trời", "sun", "Mặt trời lên rồi", "The sun has risen"],
    ["rain", "u8", "Weather", "mưa", "rain, to rain", "Trời đang mưa", "It's raining"],
  ],
};
