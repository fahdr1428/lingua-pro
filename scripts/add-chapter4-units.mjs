// One-off content script: adds the units the v70 journey map needs, and fills
// three genuine content gaps while doing it.
//
// WHY THESE UNITS: the journey map (src/data/journey.js) runs 12 stops per
// language, and a stop is gated on the unit at the same index — so a language
// with 10 units can only ever reach stop 10, leaving two waypoints permanently
// unreachable. scripts/validate-journey.mjs now fails the build on exactly that.
// Rather than trimming the map back, we add the missing units.
//
// The gaps this closes are real, not padding:
//   - Turkish had NO body-part words and NO feelings words at all. "I'm tired"
//     was unsayable in a course with 118 words.
//   - Turkish had no weather vocabulary beyond hot/cold as adjectives.
//   - Hindi and Arabic had scattered nature words but no unit for them.
//
// Run once: node scripts/add-chapter4-units.mjs
// Idempotent: skips a language whose vocab already carries the marker tag.

import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "src/data/languages");
const MARKER = "nature-pack-v1";

// Each entry: [lemma, translit, pronunciation, translation, category, exampleNative, exampleEn]
const ADDITIONS = {
  tr: [
    {
      unit: { id: "u11", title: "Body & Feelings", emoji: "🫀", description: "Head, hand, eye — and how you're feeling" },
      words: [
        ["baş", "baş", "BAHSH", "head", "Body", "Başım ağrıyor.", "My head hurts."],
        ["el", "el", "EL", "hand", "Body", "Elini yıka.", "Wash your hand."],
        ["göz", "göz", "GOEZ", "eye", "Body", "Gözlerim yorgun.", "My eyes are tired."],
        ["kalp", "kalp", "KALP", "heart", "Body", "Kalbim hızlı atıyor.", "My heart is beating fast."],
        ["ayak", "ayak", "ah-YAHK", "foot", "Body", "Ayağım soğuk.", "My foot is cold."],
        ["mutlu", "mutlu", "moot-LOO", "happy", "Feelings", "Bugün çok mutluyum.", "I'm very happy today."],
        ["yorgun", "yorgun", "yor-GOON", "tired", "Feelings", "Çok yorgunum.", "I'm very tired."],
        ["üzgün", "üzgün", "uez-GUEN", "sad", "Feelings", "Üzgün görünüyorsun.", "You look sad."],
        ["aç", "aç", "AHCH", "hungry", "Feelings", "Ben açım.", "I'm hungry."],
        ["susuz", "susuz", "soo-SOOZ", "thirsty", "Feelings", "Susuzum, su lütfen.", "I'm thirsty, water please."],
      ],
    },
    {
      unit: { id: "u12", title: "Weather & Nature", emoji: "🌦️", description: "Sun, rain, sea, mountain — the world outside" },
      words: [
        ["güneş", "güneş", "gue-NESH", "sun", "Weather", "Bugün güneş var.", "There's sun today."],
        ["yağmur", "yağmur", "yah-MOOR", "rain", "Weather", "Yağmur yağıyor.", "It's raining."],
        ["kar", "kar", "KAHR", "snow", "Weather", "Kışın kar yağar.", "It snows in winter."],
        ["rüzgar", "rüzgar", "ruez-GAHR", "wind", "Weather", "Rüzgar çok güçlü.", "The wind is very strong."],
        ["gökyüzü", "gökyüzü", "goek-yue-ZUE", "sky", "Nature", "Gökyüzü mavi.", "The sky is blue."],
        ["deniz", "deniz", "de-NEEZ", "sea", "Nature", "Deniz çok güzel.", "The sea is very beautiful."],
        ["ağaç", "ağaç", "ah-AHCH", "tree", "Nature", "Bahçede bir ağaç var.", "There is a tree in the garden."],
        ["dağ", "dağ", "DAH", "mountain", "Nature", "Dağ çok yüksek.", "The mountain is very high."],
      ],
    },
  ],

  hi: [
    {
      unit: { id: "u12", title: "Weather & Nature", emoji: "🌦️", description: "Sun, sky, river, mountain — the world outside" },
      words: [
        ["सूरज", "sooraj", "SOO-raj", "sun", "Weather", "सूरज निकल आया।", "The sun has come out."],
        ["आसमान", "aasmaan", "aas-MAAN", "sky", "Nature", "आसमान नीला है।", "The sky is blue."],
        ["पेड़", "ped", "PAYRD", "tree", "Nature", "यह पेड़ बहुत पुराना है।", "This tree is very old."],
        ["फूल", "phool", "PHOOL", "flower", "Nature", "फूल सुंदर है।", "The flower is beautiful."],
        ["नदी", "nadi", "nuh-DEE", "river", "Nature", "नदी का पानी ठंडा है।", "The river water is cold."],
        ["पहाड़", "pahaad", "puh-HAARD", "mountain", "Nature", "पहाड़ बहुत ऊँचा है।", "The mountain is very high."],
        ["समुद्र", "samudra", "suh-MOOD-ruh", "sea", "Nature", "समुद्र यहाँ से दूर है।", "The sea is far from here."],
        ["हवा", "hawa", "huh-VAA", "wind, air", "Weather", "आज हवा ठंडी है।", "The wind is cold today."],
        ["गरम", "garam", "GUH-rum", "hot, warm", "Weather", "चाय गरम है।", "The tea is hot."],
        ["ठंडा", "thanda", "THUN-daa", "cold", "Weather", "पानी ठंडा है।", "The water is cold."],
      ],
    },
  ],

  ar: [
    {
      unit: { id: "u12", title: "Weather & Nature", emoji: "🌦️", description: "Sky, sea, mountain, moon — the world outside" },
      words: [
        ["السماء", "as-samaa", "as-sah-MAA", "sky", "Nature", "السماء صافية اليوم.", "The sky is clear today."],
        ["شجرة", "shajara", "SHA-ja-ra", "tree", "Nature", "هذه شجرة كبيرة.", "This is a big tree."],
        ["زهرة", "zahra", "ZAH-ra", "flower", "Nature", "الزهرة جميلة.", "The flower is beautiful."],
        ["نهر", "nahr", "NAHR", "river", "Nature", "النهر قريب من البيت.", "The river is near the house."],
        ["جبل", "jabal", "JA-bal", "mountain", "Nature", "الجبل عالي جدا.", "The mountain is very high."],
        ["بحر", "bahr", "BAHR", "sea", "Nature", "البحر بعيد من هنا.", "The sea is far from here."],
        ["قمر", "qamar", "QA-mar", "moon", "Nature", "القمر جميل الليلة.", "The moon is beautiful tonight."],
        ["ريح", "reeh", "REEH", "wind", "Weather", "الريح قوية اليوم.", "The wind is strong today."],
        ["حار", "haar", "HAAR", "hot", "Weather", "الجو حار جدا.", "The weather is very hot."],
        ["بارد", "baarid", "BAA-rid", "cold", "Weather", "الماء بارد.", "The water is cold."],
      ],
    },
  ],
};

// Preserve each file's existing indentation so the diff stays an append rather
// than a whole-file reformat. (Learned the hard way: tr.json is 1-space.)
function detectIndent(raw) {
  const m = raw.match(/\n(\s+)"/);
  if (!m) return 2;
  return m[1].replace(/\t/g, "  ").length;
}

let touched = 0;

for (const [code, blocks] of Object.entries(ADDITIONS)) {
  const file = path.join(DIR, `${code}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const indent = detectIndent(raw);
  const data = JSON.parse(raw);

  if ((data.vocab || []).some((v) => (v.tags || []).includes(MARKER))) {
    console.log(`  = ${code}: already has ${MARKER}, skipping`);
    continue;
  }

  // Continue the file's own id sequence rather than guessing a prefix.
  let maxNum = 0;
  for (const v of data.vocab) {
    const n = parseInt(String(v.id).split("_")[1], 10);
    if (!isNaN(n) && n > maxNum) maxNum = n;
  }

  const existingLemmas = new Set(data.vocab.map((v) => String(v.lemma).trim().toLowerCase()));
  const existingUnits = new Set((data.units || []).map((u) => u.id));
  let added = 0;

  for (const block of blocks) {
    if (existingUnits.has(block.unit.id)) {
      console.log(`  ! ${code}: unit ${block.unit.id} already exists, skipping that unit`);
      continue;
    }
    data.units.push(block.unit);

    for (const [lemma, translit, pronunciation, translation, category, exNative, exEn] of block.words) {
      if (existingLemmas.has(lemma.trim().toLowerCase())) {
        console.log(`  ! ${code}: "${lemma}" already present, skipped`);
        continue;
      }
      maxNum++;
      data.vocab.push({
        id: `${code}_${String(maxNum).padStart(4, "0")}`,
        unit: block.unit.id,
        lemma,
        translit,
        pronunciation,
        translation,
        category,
        difficulty: 2,
        tags: [MARKER],
        examples: [{ native: exNative, translation: exEn }],
      });
      existingLemmas.add(lemma.trim().toLowerCase());
      added++;
    }
  }

  // Keep the declared category list in sync — the goal-based selector reads it.
  const cats = new Set(data.categories || []);
  for (const v of data.vocab) if (v.category) cats.add(v.category);
  data.categories = [...cats].sort();

  fs.writeFileSync(file, JSON.stringify(data, null, indent) + "\n");
  console.log(`  + ${code}: ${added} words, ${blocks.length} unit(s) → ${data.vocab.length} total, ${data.units.length} units`);
  touched++;
}

console.log(`\n  ${touched} language file(s) updated\n`);
