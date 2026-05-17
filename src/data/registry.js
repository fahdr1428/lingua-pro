// =============================================================================
// LANGUAGE REGISTRY — lazy-loaded language packs.
// =============================================================================
// Each language is a JSON file. Vite's dynamic import + JSON support means
// the pack is only fetched when the user actually picks that language.
// This is what lets the platform scale to 100k+ words per language without
// blowing up the initial bundle.
//
// To add a language:
//   1. Drop a new JSON file in src/data/languages/
//   2. Add an entry to LANGUAGES below
// That's it. No code changes anywhere else.
//
// To load packs from a CDN/API instead of bundling them:
//   - Replace the dynamic import with `fetch('https://cdn.you.com/lang/' + code + '.json')`
// =============================================================================

export const LANGUAGES = {
  ur: {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    flag: "🇵🇰",
    rtl: true,
    ttsCode: "ur-PK",
    color: "#0a7c3e",
    tagline: "The poetic language of South Asia",
    niche: true,
    loader: () => import("./languages/ur.json"),
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    rtl: false,
    ttsCode: "es-ES",
    color: "#c8102e",
    tagline: "500M speakers across 20+ countries",
    niche: false,
    loader: () => import("./languages/es.json"),
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    rtl: false,
    ttsCode: "fr-FR",
    color: "#0055a4",
    tagline: "Language of diplomacy and art",
    niche: false,
    loader: () => import("./languages/fr.json"),
  },
  ja: {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    rtl: false,
    ttsCode: "ja-JP",
    color: "#bc002d",
    tagline: "Three scripts, one beautiful language",
    niche: false,
    loader: () => import("./languages/ja.json"),
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    rtl: true,
    ttsCode: "ar-SA",
    color: "#006c35",
    tagline: "Sacred language of 400M+ speakers",
    niche: false,
    loader: () => import("./languages/ar.json"),
  },
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    rtl: false,
    ttsCode: "hi-IN",
    color: "#ff9933",
    tagline: "India's most spoken language",
    niche: false,
    loader: () => import("./languages/hi.json"),
  },
  bn: {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🇧🇩",
    rtl: false,
    ttsCode: "bn-IN",
    color: "#006a4e",
    tagline: "230 million speakers, almost no apps teach it",
    niche: true,
    loader: () => import("./languages/bn.json"),
  },
  ko: {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    rtl: false,
    ttsCode: "ko-KR",
    color: "#003478",
    tagline: "The language of K-culture worldwide",
    niche: false,
    loader: () => import("./languages/ko.json"),
  },
  zh: {
    code: "zh",
    name: "Mandarin",
    nativeName: "中文",
    flag: "🇨🇳",
    rtl: false,
    ttsCode: "zh-CN",
    color: "#de2910",
    tagline: "The most spoken language on Earth",
    niche: false,
    loader: () => import("./languages/zh.json"),
  },
};

const cache = new Map();

/** Lazy-load a full language pack. Cached after first load. */
export async function loadLanguagePack(code) {
  if (cache.has(code)) return cache.get(code);
  const meta = LANGUAGES[code];
  if (!meta) throw new Error(`Unknown language: ${code}`);
  const mod = await meta.loader();
  const pack = { ...meta, ...(mod.default || mod) };
  cache.set(code, pack);
  return pack;
}

export function listLanguages() {
  return Object.values(LANGUAGES);
}
