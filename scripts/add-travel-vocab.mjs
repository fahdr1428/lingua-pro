// One-off content script: adds a Connectors + Travel + Transport vocabulary
// set (21 words) to the six language packs that currently have none of those
// three categories at all — which meant the "Travel & getting around"
// learning goal (see src/data/goals.js) was effectively empty for them.
//
// Run once: node scripts/add-travel-vocab.mjs
// Idempotent: skips a language if it already has a word with the same lemma
// in the target unit (checked via a marker tag "travel-pack-v1").

import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "src/data/languages");

// meaning key -> category, used purely to assign the right bucket + example templates
const SLOTS = [
  { key: "and", category: "Connectors" },
  { key: "but", category: "Connectors" },
  { key: "because", category: "Connectors" },
  { key: "or", category: "Connectors" },
  { key: "also", category: "Connectors" },
  { key: "if", category: "Connectors" },
  { key: "car", category: "Transport" },
  { key: "bus", category: "Transport" },
  { key: "train", category: "Transport" },
  { key: "taxi", category: "Transport" },
  { key: "airport", category: "Transport" },
  { key: "right", category: "Transport" },
  { key: "left", category: "Transport" },
  { key: "hotel", category: "Travel" },
  { key: "ticket", category: "Travel" },
  { key: "passport", category: "Travel" },
  { key: "station", category: "Travel" },
  { key: "map", category: "Travel" },
  { key: "near", category: "Travel" },
  { key: "far", category: "Travel" },
  { key: "straightAhead", category: "Travel" },
];

// Per-language content. Each entry: [lemma, translit, pronunciation, translation, exampleNative, exampleEn]
// translation matches the exact English gloss used elsewhere in these packs
// (lowercase, "to X" for verbs — not applicable here, all nouns/connectors).
const DATA = {
  ar: {
    unitId: "u11", // "Getting Around" already exists in ar.json for Travel/Transport
    connectorUnitId: "u10", // "Useful Words"
    words: {
      and: ["و", "wa", "WAH", "and", "شاي و قهوة", "Tea and coffee"],
      but: ["لكن", "lakin", "LAH-kin", "but", "صغير لكن جميل", "Small but beautiful"],
      because: ["لأن", "li'anna", "lee-AN-nah", "because", "متعب لأن العمل كثير", "Tired because there's a lot of work"],
      or: ["أو", "aw", "AW", "or", "شاي أو قهوة", "Tea or coffee"],
      also: ["أيضا", "aydan", "AY-dan", "also, too", "أنا أيضا", "Me too"],
      if: ["إذا", "idha", "EE-dhah", "if", "إذا سمحت", "If you allow"],
      car: ["سيارة", "sayyara", "sah-YAH-rah", "car", "سيارتي", "My car"],
      bus: ["حافلة", "hafila", "HAH-fee-lah", "bus", "أخذ الحافلة", "Take the bus"],
      train: ["قطار", "qitar", "kih-TAR", "train", "القطار سريع", "The train is fast"],
      taxi: ["تاكسي", "taksi", "TAK-see", "taxi", "استدعاء تاكسي", "Call a taxi"],
      airport: ["مطار", "matar", "mah-TAR", "airport", "الذهاب إلى المطار", "Going to the airport"],
      right: ["يمين", "yameen", "yah-MEEN", "right (direction)", "انعطف يمين", "Turn right"],
      left: ["يسار", "yasar", "yah-SAR", "left (direction)", "انعطف يسار", "Turn left"],
      hotel: ["فندق", "funduq", "FOON-duq", "hotel", "فندق جيد", "A good hotel"],
      ticket: ["تذكرة", "tadhkira", "TAZH-ki-rah", "ticket", "تذكرة واحدة من فضلك", "One ticket please"],
      passport: ["جواز سفر", "jawaz safar", "jah-WAZ SAH-far", "passport", "جواز سفري", "My passport"],
      station: ["محطة", "mahatta", "mah-HAH-tah", "station", "محطة الحافلات", "The bus station"],
      map: ["خريطة", "khareeta", "khah-REE-tah", "map", "أعطني خريطة", "Give me a map"],
      near: ["قريب", "qareeb", "kah-REEB", "near", "قريب من الفندق", "Near the hotel"],
      far: ["بعيد", "baeed", "bah-EED", "far", "بعيد جدا", "Very far"],
      straightAhead: ["مباشرة", "mubashara", "moo-BAH-shah-rah", "straight ahead", "اذهب مباشرة", "Go straight ahead"],
    },
  },
  hi: {
    unitId: "u11",
    connectorUnitId: "u10",
    words: {
      and: ["और", "aur", "OWR", "and", "चाय और कॉफ़ी", "Tea and coffee"],
      but: ["लेकिन", "lekin", "LEH-kin", "but", "छोटा लेकिन सुंदर", "Small but beautiful"],
      because: ["क्योंकि", "kyonki", "KYOHN-kee", "because", "थका हुआ क्योंकि काम बहुत है", "Tired because there's a lot of work"],
      or: ["या", "ya", "YAH", "or", "चाय या कॉफ़ी", "Tea or coffee"],
      also: ["भी", "bhi", "BHEE", "also, too", "मैं भी", "Me too"],
      if: ["अगर", "agar", "ah-GAR", "if", "अगर आप चाहें", "If you want"],
      car: ["गाड़ी", "gaadi", "GAH-ree", "car", "मेरी गाड़ी", "My car"],
      bus: ["बस", "bas", "BUSS", "bus", "बस लो", "Take the bus"],
      train: ["ट्रेन", "train", "TRAIN", "train", "ट्रेन तेज़ है", "The train is fast"],
      taxi: ["टैक्सी", "taxi", "TAK-see", "taxi", "टैक्सी बुलाओ", "Call a taxi"],
      airport: ["हवाई अड्डा", "hawai adda", "hah-VAI AD-dah", "airport", "हवाई अड्डे जाना", "Going to the airport"],
      right: ["दायाँ", "dayan", "DAH-yan", "right (direction)", "दायें मुड़ो", "Turn right"],
      left: ["बायाँ", "bayan", "BAH-yan", "left (direction)", "बायें मुड़ो", "Turn left"],
      hotel: ["होटल", "hotel", "HO-tel", "hotel", "अच्छा होटल", "A good hotel"],
      ticket: ["टिकट", "tikat", "TI-kat", "ticket", "एक टिकट कृपया", "One ticket please"],
      passport: ["पासपोर्ट", "passport", "PASS-port", "passport", "मेरा पासपोर्ट", "My passport"],
      station: ["स्टेशन", "station", "STAY-shun", "station", "बस स्टेशन", "The bus station"],
      map: ["नक्शा", "naksha", "NAK-shah", "map", "मुझे नक्शा दो", "Give me a map"],
      near: ["पास", "paas", "PAAS", "near", "होटल के पास", "Near the hotel"],
      far: ["दूर", "door", "DOOR", "far", "बहुत दूर", "Very far"],
      straightAhead: ["सीधे", "seedhe", "SEE-dhay", "straight ahead", "सीधे जाओ", "Go straight ahead"],
    },
  },
  id: {
    unitId: "u6", // new unit created below
    connectorUnitId: "u6",
    newUnit: { id: "u6", title: "Getting Around", emoji: "🧭", description: "Connectors, transport, and travel basics" },
    words: {
      and: ["Dan", "dan", "DAHN", "and", "Teh dan kopi", "Tea and coffee"],
      but: ["Tapi", "tapi", "TAH-pee", "but", "Kecil tapi bagus", "Small but nice"],
      because: ["Karena", "karena", "kah-REH-nah", "because", "Capek karena banyak kerja", "Tired because there's a lot of work"],
      or: ["Atau", "atau", "AH-tow", "or", "Teh atau kopi", "Tea or coffee"],
      also: ["Juga", "juga", "JOO-gah", "also, too", "Saya juga", "Me too"],
      if: ["Kalau", "kalau", "KAH-low", "if", "Kalau kamu mau", "If you want"],
      car: ["Mobil", "mobil", "MOH-bil", "car", "Mobil saya", "My car"],
      bus: ["Bus", "bus", "BOOS", "bus", "Naik bus", "Take the bus"],
      train: ["Kereta", "kereta", "keh-REH-tah", "train", "Kereta cepat", "The train is fast"],
      taxi: ["Taksi", "taksi", "TAHK-see", "taxi", "Panggil taksi", "Call a taxi"],
      airport: ["Bandara", "bandara", "bahn-DAH-rah", "airport", "Pergi ke bandara", "Going to the airport"],
      right: ["Kanan", "kanan", "KAH-nahn", "right (direction)", "Belok kanan", "Turn right"],
      left: ["Kiri", "kiri", "KEE-ree", "left (direction)", "Belok kiri", "Turn left"],
      hotel: ["Hotel", "hotel", "HO-tel", "hotel", "Hotel yang bagus", "A good hotel"],
      ticket: ["Tiket", "tiket", "TEE-ket", "ticket", "Satu tiket, tolong", "One ticket please"],
      passport: ["Paspor", "paspor", "PAHS-por", "passport", "Paspor saya", "My passport"],
      station: ["Stasiun", "stasiun", "stah-see-OON", "station", "Stasiun bus", "The bus station"],
      map: ["Peta", "peta", "PEH-tah", "map", "Beri saya peta", "Give me a map"],
      near: ["Dekat", "dekat", "DEH-kaht", "near", "Dekat hotel", "Near the hotel"],
      far: ["Jauh", "jauh", "JAH-oo", "far", "Sangat jauh", "Very far"],
      straightAhead: ["Lurus", "lurus", "LOO-roos", "straight ahead", "Jalan terus lurus", "Go straight ahead"],
    },
  },
  pa: {
    // pa.json uses Shahmukhi (Perso-Arabic Punjabi script), not Gurmukhi —
    // matches the existing file's convention (see validate-vocab.mjs).
    unitId: "u6",
    connectorUnitId: "u6",
    newUnit: { id: "u6", title: "Getting Around", emoji: "🧭", description: "Connectors, transport, and travel basics" },
    words: {
      and: ["تے", "te", "TAY", "and", "چاۓ تے کافی", "Tea and coffee"],
      but: ["پر", "par", "PUR", "but", "نکا پر سوہنا", "Small but beautiful"],
      because: ["کیونجے", "kionje", "kyoon-JAY", "because", "تھکیا کیونجے کم بہت اے", "Tired because there's a lot of work"],
      or: ["یا", "ya", "YAH", "or", "چاۓ یا کافی", "Tea or coffee"],
      also: ["وی", "vi", "VEE", "also, too", "میں وی", "Me too"],
      if: ["جے", "je", "JAY", "if", "جے تسیں چاہو", "If you want"],
      car: ["گڈی", "gaddi", "GUD-dee", "car", "میری گڈی", "My car"],
      bus: ["بس", "bas", "BUSS", "bus", "بس لوو", "Take the bus"],
      train: ["ریل", "rail", "RAIL", "train", "ریل تیز اے", "The train is fast"],
      taxi: ["ٹیکسی", "taxi", "TAK-see", "taxi", "ٹیکسی سدو", "Call a taxi"],
      airport: ["ہوائی اڈا", "hawai adda", "huh-VAI UD-dah", "airport", "ہوائی اڈے جانا", "Going to the airport"],
      right: ["سجے", "sajje", "SUJ-jay", "right (direction)", "سجے مڑو", "Turn right"],
      left: ["کھبے", "khabbe", "KHUB-bay", "left (direction)", "کھبے مڑو", "Turn left"],
      hotel: ["ہوٹل", "hotel", "HO-tel", "hotel", "چنگا ہوٹل", "A good hotel"],
      ticket: ["ٹکٹ", "tikat", "TI-kut", "ticket", "اک ٹکٹ مہربانی کرکے", "One ticket please"],
      passport: ["پاسپورٹ", "passport", "PASS-port", "passport", "میرا پاسپورٹ", "My passport"],
      station: ["سٹیشن", "station", "STAY-shun", "station", "بس سٹیشن", "The bus station"],
      map: ["نقشہ", "naksha", "NUK-shah", "map", "مینوں نقشہ دیو", "Give me a map"],
      near: ["نیڑے", "nere", "NAY-ray", "near", "ہوٹل دے نیڑے", "Near the hotel"],
      far: ["دور", "door", "DOOR", "far", "بہت دور", "Very far"],
      straightAhead: ["سدھا", "siddha", "SID-dhah", "straight ahead", "سدھا جاوو", "Go straight ahead"],
    },
  },
  pcm: {
    unitId: "u6",
    connectorUnitId: "u6",
    newUnit: { id: "u6", title: "Getting Around", emoji: "🧭", description: "Connectors, transport, and travel basics" },
    words: {
      and: ["An", "an", "AND", "and", "Tea an coffee", "Tea and coffee"],
      but: ["But", "but", "BUT", "but", "E small but e sweet", "It's small but it's nice"],
      because: ["Bikos", "bikos", "bee-KOS", "because", "I tire bikos work plenty", "I'm tired because there's a lot of work"],
      or: ["Or", "or", "OR", "or", "Tea or coffee", "Tea or coffee"],
      also: ["Too", "too", "TOO", "also, too", "Me too", "Me too"],
      if: ["If", "if", "IF", "if", "If you want am", "If you want it"],
      car: ["Moto", "moto", "MOH-toh", "car", "My moto", "My car"],
      bus: ["Bus", "bus", "BUS", "bus", "Enter bus", "Take the bus"],
      train: ["Train", "train", "TRAYN", "train", "Train dey fast", "The train is fast"],
      taxi: ["Taxi", "taxi", "TAK-see", "taxi", "Call taxi", "Call a taxi"],
      airport: ["Airport", "airport", "AIR-port", "airport", "We dey go airport", "We're going to the airport"],
      right: ["Right", "right", "RITE", "right (direction)", "Turn right", "Turn right"],
      left: ["Left", "left", "LEFT", "left (direction)", "Turn left", "Turn left"],
      hotel: ["Hotel", "hotel", "ho-TEL", "hotel", "Fine hotel", "A good hotel"],
      ticket: ["Ticket", "ticket", "TIK-et", "ticket", "One ticket abeg", "One ticket please"],
      passport: ["Passport", "passport", "PASS-port", "passport", "My passport", "My passport"],
      station: ["Station", "station", "STAY-shun", "station", "Bus station", "The bus station"],
      map: ["Map", "map", "MAP", "map", "Give me map", "Give me a map"],
      near: ["Near", "near", "NEER", "near", "E near the hotel", "It's near the hotel"],
      far: ["Far", "far", "FAR", "far", "E far well well", "It's very far"],
      straightAhead: ["Go Straight", "go stret", "go STRET", "straight ahead", "Just go straight", "Just go straight ahead"],
    },
  },
  tr: {
    unitId: "u10", // "Getting By" already exists in tr.json
    connectorUnitId: "u10",
    words: {
      and: ["ve", "ve", "VEH", "and", "çay ve kahve", "Tea and coffee"],
      but: ["ama", "ama", "ah-MAH", "but", "küçük ama güzel", "Small but beautiful"],
      because: ["çünkü", "cunku", "CHEWN-kew", "because", "yorgunum çünkü iş çok", "I'm tired because there's a lot of work"],
      or: ["veya", "veya", "veh-YAH", "or", "çay veya kahve", "Tea or coffee"],
      also: ["ayrıca", "ayrica", "eye-rih-JAH", "also, too", "ben de ayrıca", "Me too"],
      if: ["eğer", "eger", "eh-YEHR", "if", "eğer istersen", "If you want"],
      car: ["araba", "araba", "ah-rah-BAH", "car", "arabam", "My car"],
      bus: ["minibüs", "minibus", "MEE-nee-bews", "minibus, shared van", "minibüse bin", "Take the minibus"],
      train: ["tren", "tren", "TREN", "train", "tren hızlı", "The train is fast"],
      taxi: ["taksi", "taksi", "tahk-SEE", "taxi", "taksi çağır", "Call a taxi"],
      airport: ["havalimanı", "havalimani", "hah-vah-lee-mah-NUH", "airport", "havalimanına gitmek", "Going to the airport"],
      right: ["sağ", "sag", "SAH", "right (direction)", "sağa dön", "Turn right"],
      left: ["sol", "sol", "SOL", "left (direction)", "sola dön", "Turn left"],
      hotel: ["otel", "otel", "oh-TEL", "hotel", "iyi bir otel", "A good hotel"],
      ticket: ["bilet", "bilet", "bee-LET", "ticket", "bir bilet lütfen", "One ticket please"],
      passport: ["pasaport", "pasaport", "pah-sah-PORT", "passport", "pasaportum", "My passport"],
      station: ["istasyon", "istasyon", "ees-tahs-YOHN", "station", "otobüs istasyonu", "The bus station"],
      map: ["harita", "harita", "hah-ree-TAH", "map", "bana harita ver", "Give me a map"],
      near: ["yakın", "yakin", "yah-KUHN", "near", "otele yakın", "Near the hotel"],
      far: ["uzak", "uzak", "oo-ZAHK", "far", "çok uzak", "Very far"],
      straightAhead: ["dosdoğru", "dosdogru", "dohs-doh-ROO", "straight ahead", "dosdoğru git", "Go straight ahead"],
    },
  },
};

let totalAdded = 0;

for (const [code, cfg] of Object.entries(DATA)) {
  const file = path.join(DIR, `${code}.json`);
  const pack = JSON.parse(fs.readFileSync(file, "utf8"));

  const alreadyDone = pack.vocab.some((w) => (w.tags || []).includes("travel-pack-v1"));
  if (alreadyDone) {
    console.log(`${code}: already applied, skipping`);
    continue;
  }

  let maxNum = 0;
  for (const w of pack.vocab) {
    const n = parseInt(w.id.split("_")[1], 10);
    if (n > maxNum) maxNum = n;
  }

  if (cfg.newUnit && !pack.units.some((u) => u.id === cfg.newUnit.id)) {
    pack.units.push(cfg.newUnit);
  }

  for (const cat of ["Connectors", "Travel", "Transport"]) {
    if (!pack.categories.includes(cat)) pack.categories.push(cat);
  }
  pack.categories.sort();

  for (const slot of SLOTS) {
    const [lemma, translit, pronunciation, translation, native, exampleEn] = cfg.words[slot.key];
    maxNum += 1;
    const unit = slot.category === "Connectors" ? cfg.connectorUnitId : cfg.unitId;
    pack.vocab.push({
      id: `${code}_${String(maxNum).padStart(4, "0")}`,
      unit,
      lemma,
      translit,
      pronunciation,
      translation,
      category: slot.category,
      difficulty: 2,
      tags: ["travel-pack-v1"],
      examples: [{ native, translation: exampleEn }],
    });
    totalAdded++;
  }

  // Preserve each file's existing indentation width so the diff stays a clean
  // append instead of a whole-file reformat (tr.json uses 1-space, most others 2).
  const raw = fs.readFileSync(file, "utf8");
  const indentMatch = raw.match(/\n( +)"/);
  const indent = indentMatch ? indentMatch[1].length : 2;
  fs.writeFileSync(file, JSON.stringify(pack, null, indent) + "\n");
  console.log(`${code}: added ${SLOTS.length} words (Connectors/Travel/Transport)`);
}

console.log(`\nDone. ${totalAdded} vocab entries added across ${Object.keys(DATA).length} languages.`);
