// v90 — groups for the seven packs that had letters and no way to reach them.
import { readFileSync, writeFileSync } from "node:fs";

const GROUPS = {
  // Shahmukhi — not Latin, and the whole set was unreachable.
  pa: {
    groups: [
      { id: "basics", title: "The first letters", emoji: "🔤", description: "ا, ب, ت, س — start here, right to left" },
      { id: "common", title: "Everyday letters", emoji: "🔠", description: "ک, گ, ل, م, ن — the workhorses" },
      { id: "tricky", title: "The retroflex ones", emoji: "🎯", description: "ٹ, ش, ہ — sounds English doesn't have" },
    ],
    assign: { "ا": "basics", "ب": "basics", "پ": "basics", "ت": "basics", "س": "basics",
              "ک": "common", "گ": "common", "ل": "common", "م": "common", "ن": "common", "ی": "common",
              "ٹ": "tricky", "ش": "tricky", "ہ": "tricky" },
  },
  es: {
    groups: [
      { id: "vowels", title: "The five vowels", emoji: "🅰️", description: "A, E, I, O, U — each one sound, always" },
      { id: "tricky", title: "Sounds to watch", emoji: "🎯", description: "Ñ, LL, RR, J, H — where English speakers slip" },
    ],
    assign: { A: "vowels", E: "vowels", I: "vowels", O: "vowels", U: "vowels",
              "Ñ": "tricky", LL: "tricky", RR: "tricky", J: "tricky", H: "tricky" },
  },
  fr: {
    groups: [
      { id: "accents", title: "Accented letters", emoji: "🅰️", description: "A, É, È, Ç — what the marks change" },
      { id: "combos", title: "Letter pairs", emoji: "🔠", description: "OU, EU — two letters, one sound" },
      { id: "nasal", title: "Nasal vowels", emoji: "👃", description: "AN, ON, IN — and the French R" },
    ],
    assign: { A: "accents", "É": "accents", "È": "accents", "Ç": "accents",
              OU: "combos", EU: "combos",
              AN: "nasal", ON: "nasal", IN: "nasal", R: "nasal" },
  },
  tr: {
    groups: [
      { id: "dotted", title: "The two i's", emoji: "⚠️", description: "I, ı, İ, i — Turkish has a dotted and an undotted i, and they are different letters" },
      { id: "special", title: "Turkish letters", emoji: "🔤", description: "Ç, Ğ, Ö, Ş, Ü — the ones not in English" },
    ],
    // Turkish stores its letters as upper/lower pairs in one field ("C c"),
    // which is why the first pass at this failed — a good failure, since it
    // means a mis-keyed assignment can never silently leave a letter orphaned.
    assign: { "I ı": "dotted", "İ i": "dotted",
              "C c": "special", "Ç ç": "special", "Ğ ğ": "special",
              "Ö ö": "special", "Ş ş": "special", "Ü ü": "special" },
  },
  id: {
    groups: [
      { id: "vowels", title: "Five clean vowels", emoji: "🅰️", description: "A, E, I, O, U — each one sound" },
      { id: "tricky", title: "Sounds to watch", emoji: "🎯", description: "C, NG, NY — not what English suggests" },
    ],
    assign: { A: "vowels", E: "vowels", I: "vowels", O: "vowels", U: "vowels",
              C: "tricky", NG: "tricky", NY: "tricky" },
  },
  pcm: {
    groups: [
      { id: "vowels", title: "Five vowels", emoji: "🅰️", description: "A, E, I, O, U — pure, never gliding" },
    ],
    assign: { A: "vowels", E: "vowels", I: "vowels", O: "vowels", U: "vowels" },
  },
  de: {
    groups: [
      { id: "umlauts", title: "Umlauts and ß", emoji: "🔤", description: "ä, ö, ü, ß — the four extra letters" },
      { id: "combos", title: "Letter pairs", emoji: "🔠", description: "ei, ie, eu, ch, sp, st — pairs that don't read as you'd guess" },
      { id: "consonants", title: "Consonants that shift", emoji: "🎯", description: "v, w, z, r — where German and English disagree" },
    ],
    assign: { "ä": "umlauts", "ö": "umlauts", "ü": "umlauts", "ß": "umlauts",
              ei: "combos", ie: "combos", eu: "combos", ch: "combos", sp: "combos", st: "combos",
              v: "consonants", w: "consonants", z: "consonants", r: "consonants" },
  },
};

for (const [code, cfg] of Object.entries(GROUPS)) {
  const file = `src/data/languages/${code}.json`;
  const pack = JSON.parse(readFileSync(file, "utf8"));
  let assigned = 0, orphan = [];
  pack.alphabet = (pack.alphabet || []).map((l) => {
    const g = cfg.assign[l.char];
    if (!g) { orphan.push(l.char); return l; }
    assigned++;
    return { ...l, group: g };
  });
  if (orphan.length) throw new Error(`${code}: no group assigned for ${orphan.join(" ")}`);
  pack.alphabetGroups = cfg.groups;
  writeFileSync(file, JSON.stringify(pack, null, 2) + "\n");
  console.log(`  ${code}: ${assigned} letters into ${cfg.groups.length} groups`);
}
