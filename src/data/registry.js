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
  pa: {
    code: "pa",
    name: "Punjabi",
    nativeName: "پنجابی",
    flag: "🇵🇰",
    rtl: true,
    ttsCode: "pa-IN", // Web Speech API uses pa-IN; we render in Shahmukhi script
    color: "#f7a800",
    tagline: "The language of Punjab — Pakistani Shahmukhi script",
    niche: true,
    loader: () => import("./languages/pa.json"),
  },
  id: {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flag: "🇮🇩",
    rtl: false,
    ttsCode: "id-ID",
    color: "#cd1126",
    tagline: "One of the world's most learner-friendly languages",
    niche: false,
    loader: () => import("./languages/id.json"),
  },
  pcm: {
    code: "pcm",
    name: "Nigerian Pidgin",
    nativeName: "Naijá",
    flag: "🇳🇬",
    rtl: false,
    ttsCode: "en-NG", // Closest available; falls back to en-US
    color: "#008751",
    tagline: "The lingua franca of West Africa — 100M+ speakers",
    niche: true,
    loader: () => import("./languages/pcm.json"),
  },
  tr: {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    rtl: false,
    ttsCode: "tr-TR",
    color: "#e30a17",
    tagline: "The bridge between Europe and Asia — 80M+ speakers",
    niche: false,
    loader: () => import("./languages/tr.json"),
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    rtl: false,
    ttsCode: "de-DE",
    color: "#1a1a1a",
    tagline: "Europe's most spoken native language — and it's more logical than its reputation",
    niche: false,
    loader: () => import("./languages/de.json"),
  },
};

const cache = new Map();

/** Lazy-load a full language pack. Cached after first load.
 *  Also merges v28 EXTRA_EXAMPLES into vocab so every consumer sees them. */
export async function loadLanguagePack(code) {
  if (cache.has(code)) return cache.get(code);
  const meta = LANGUAGES[code];
  if (!meta) throw new Error(`Unknown language: ${code}`);
  const mod = await meta.loader();
  const pack = { ...meta, ...(mod.default || mod) };

  // v28: merge supplementary example sentences for high-confidence languages.
  // Loaded lazily so other packs aren't penalised; fail-silent if module missing.
  try {
    const { mergeExamples } = await import("./extraExamples.js");
    if (Array.isArray(pack.vocab)) {
      pack.vocab = pack.vocab.map((v) => {
        const merged = mergeExamples(code, v.lemma, v.examples || []);
        return merged === v.examples ? v : { ...v, examples: merged };
      });
    }
  } catch (e) {
    console.warn("extraExamples merge skipped:", e?.message);
  }

  cache.set(code, pack);
  return pack;
}

export function listLanguages() {
  return Object.values(LANGUAGES);
}
