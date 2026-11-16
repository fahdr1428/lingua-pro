// =============================================================================
// GUIDE LOOKS (v119) — what each guide looks like, as data for GuideAvatar.
//
// The guides were a seal: an initial in a hairline ring (GuideMark, v70). It
// was meant to read as rooted and adult; on a phone it read as a small dim
// circle with a letter most learners can't read yet. A guide is a person, so
// each one now has a face — drawn, not photographed, and not a cartoon mascot:
// adult proportions, real skin tones, and one detail from the work the guide
// does (characters.js `craft`): Meena's jasmine, Chidi's radio headphones,
// Jisoo's potter's apron, Sreeja's gold-bordered kasavu, Roya's reading
// glasses, Bọ́lá's fila.
//
// Gender is rarely stated in the guides' copy; each is drawn the way their
// name most commonly reads. Clothing is everyday, not costume.
//
// Fields (all optional except skin/hair):
//   skin      [base, shade]                 face and neck
//   hair      { style, color }              style: see GuideAvatar HAIR
//   cover     { kind, color, pattern? }     hijab | dupatta | fila
//   garment   { color, trim?, neck? }        neck: round | v | collar | high
//   brows     "soft" | "straight" | "full"
//   beard     "full" | "trim" | "stubble" | "mustache"
//   glasses   "round" | "rect"
//   earrings  "stud" | "hoop" | "jhumka"
//   nosestud, bindi, jasmine, headphones, apron : true
// =============================================================================

const SKIN = {
  porcelain: ["#f4d4bb", "#e2b597"],
  light: ["#efc8a6", "#d9a884"],
  warm: ["#e6b892", "#cc9672"],
  golden: ["#d9a477", "#bd855a"],
  tan: ["#c88b5c", "#a96f44"],
  brown: ["#a96c43", "#8a5331"],
  deep: ["#835032", "#673b22"],
  deeper: ["#61391f", "#4a2a16"],
};

const HAIR = {
  black: "#1d1714",
  soft: "#2e221b",
  brown: "#4a3122",
  chestnut: "#6b3f24",
  ash: "#8a7258",
};

export const GUIDE_LOOKS = {
  // --- South Asia ----------------------------------------------------------
  ur: { // Amina — teaches literature in Lahore
    skin: SKIN.golden, hair: { style: "parted", color: HAIR.black },
    cover: { kind: "dupatta", color: "#c25a78" },
    garment: { color: "#1e6b50", trim: "#d9b56a", neck: "round" },
    brows: "soft", earrings: "jhumka",
  },
  pa: { // Nasreen — sings at weddings in Lahore
    skin: SKIN.tan, hair: { style: "parted", color: HAIR.black },
    cover: { kind: "dupatta", color: "#d99a1e" },
    garment: { color: "#8c2f4b", trim: "#e7c46a", neck: "round" },
    brows: "soft", earrings: "jhumka", nosestud: true,
  },
  hi: { // Priya — produces a morning radio show in Delhi
    skin: SKIN.golden, hair: { style: "wavy", color: HAIR.black },
    garment: { color: "#d9731a", trim: "#f2c46b", neck: "v" },
    brows: "soft", earrings: "hoop", nosestud: true,
  },
  bn: { // Rumi — translates poetry in Dhaka
    skin: SKIN.tan, hair: { style: "wavyshort", color: HAIR.black },
    garment: { color: "#0d7a4e", trim: "#e9e3cf", neck: "collar" },
    brows: "full", beard: "mustache", glasses: "round",
  },
  ta: { // Meena — sells jasmine at the temple gate in Madurai
    skin: SKIN.deep, hair: { style: "braid", color: HAIR.black },
    garment: { color: "#8e2347", trim: "#e2b44f", neck: "round" },
    brows: "soft", earrings: "jhumka", nosestud: true, bindi: true, jasmine: true,
  },
  ml: { // Sreeja — runs a tea shop by the ferry jetty in Kochi
    skin: SKIN.brown, hair: { style: "bun", color: HAIR.black },
    garment: { color: "#f1e8d2", trim: "#c99a2e", neck: "round" },
    brows: "soft", earrings: "stud", bindi: true,
  },

  // --- Middle East & Africa ------------------------------------------------
  ar: { // Yusuf — calligrapher and sign painter in Amman
    skin: SKIN.warm, hair: { style: "short", color: HAIR.soft },
    garment: { color: "#16826b", trim: "#0e5c4b", neck: "collar" },
    brows: "full", beard: "full",
  },
  fa: { // Roya — sells poetry books in Isfahan
    skin: SKIN.light, hair: { style: "parted", color: HAIR.brown },
    cover: { kind: "dupatta", color: "#c0623e" },
    garment: { color: "#24432f", neck: "round" },
    brows: "soft", glasses: "round", earrings: "stud",
  },
  so: { // Hodan — poet in Hargeisa
    skin: SKIN.deeper, hair: { style: "short", color: HAIR.black },
    cover: { kind: "hijab", color: "#4f93e0" },
    garment: { color: "#24539a", neck: "round" },
    brows: "soft",
  },
  yo: { // Bọ́lá — talking-drum player in Ibadan
    skin: SKIN.deeper, hair: { style: "crop", color: HAIR.black },
    cover: { kind: "fila", color: "#0a8f3c", pattern: "#e9d27a" },
    garment: { color: "#f0e6cf", trim: "#0a8f3c", neck: "round" },
    brows: "full", beard: "trim",
  },
  pcm: { // Chidi — radio presenter in Lagos
    skin: SKIN.deep, hair: { style: "crop", color: HAIR.black },
    garment: { color: "#0a8f4a", trim: "#f2f2f2", neck: "collar" },
    brows: "full", beard: "stubble", headphones: true,
  },
  tr: { // Elif — sells books by the ferry terminal in Istanbul
    skin: SKIN.warm, hair: { style: "wavy", color: HAIR.brown },
    garment: { color: "#b5121b", neck: "round" },
    brows: "soft", earrings: "hoop",
  },

  // --- East & Southeast Asia -----------------------------------------------
  zh: { // Lin — runs a tea shop in Chengdu, argues about tones
    skin: SKIN.light, hair: { style: "short", color: HAIR.black },
    garment: { color: "#2a2a33", trim: "#c0392b", neck: "high" },
    brows: "straight", glasses: "rect",
  },
  ja: { // Kenji — works in his family's tea house in Kyoto
    skin: SKIN.light, hair: { style: "neat", color: HAIR.black },
    garment: { color: "#2e3a5c", trim: "#d6336c", neck: "v" },
    brows: "straight",
  },
  ko: { // Jisoo — potter in Seoul
    skin: SKIN.porcelain, hair: { style: "bob", color: HAIR.black },
    garment: { color: "#6d3fd6", neck: "round" },
    brows: "straight", earrings: "stud", apron: true,
  },
  vi: { // Linh — runs a phở shop in Hanoi
    skin: SKIN.light, hair: { style: "long", color: HAIR.black },
    garment: { color: "#c8102e", trim: "#f2d27a", neck: "high" },
    brows: "soft", earrings: "stud",
  },
  tl: { // Neneng — runs a carinderia in Quezon City
    skin: SKIN.tan, hair: { style: "bob", color: HAIR.soft },
    garment: { color: "#1f4fb5", neck: "round" },
    brows: "soft", earrings: "hoop",
  },
  id: { // Sari — batik maker in Yogyakarta
    skin: SKIN.golden, hair: { style: "short", color: HAIR.black },
    cover: { kind: "hijab", color: "#14907e", pattern: "#f3d58a" },
    garment: { color: "#7a4a1f", trim: "#f3d58a", neck: "round" },
    brows: "soft",
  },

  // --- Europe ----------------------------------------------------------------
  es: { // Diego — repairs flamenco guitars in Sevilla
    skin: SKIN.warm, hair: { style: "wavyshort", color: HAIR.soft },
    garment: { color: "#a8322a", neck: "v" },
    brows: "full", beard: "stubble",
  },
  fr: { // Camille — second-hand bookshop in Lyon
    skin: SKIN.porcelain, hair: { style: "bun", color: HAIR.chestnut },
    garment: { color: "#2b5ea8", trim: "#f4efe4", neck: "round" },
    brows: "soft", earrings: "stud",
  },
  de: { // Matthias — repairs bicycles in Leipzig
    skin: SKIN.porcelain, hair: { style: "short", color: HAIR.ash },
    garment: { color: "#3d5a80", trim: "#2b4260", neck: "collar" },
    brows: "straight", beard: "full",
  },
};

// What GuideAvatar knows how to draw. test-guides.mjs checks every look uses
// only these, so a typo can't quietly fall back to a different hairstyle.
export const HAIR_STYLES = ["short", "crop", "neat", "wavyshort", "parted", "bun", "braid", "long", "wavy", "bob"];
export const COVER_KINDS = ["hijab", "dupatta", "fila"];
export const NECKS = ["round", "v", "collar", "high"];
export const BEARDS = ["full", "trim", "stubble", "mustache"];
export const GLASSES = ["round", "rect"];
export const EARRINGS = ["stud", "hoop", "jhumka"];
export const BROWS = ["soft", "straight", "full"];

export function lookFor(code) {
  return GUIDE_LOOKS[code] || null;
}
