#!/usr/bin/env node
/**
 * test-speech.mjs — regression tests for the lenient speech grader.
 *
 *   npm run test-speech
 *
 * Every case here is a real failure mode. The four that start out failing when
 * you loosen the scorer are the interesting ones: transliteration standards
 * disagree ("as salamu alaykum" vs "assalam-o-alaikum"), recognisers split words
 * where we don't ("bon jour"), learners add filler, and dropping a whole content
 * word must NOT pass. Exits non-zero so it can gate a push.
 */
import { scoreAttempt, judge, displayScore, recognitionLocales } from "../src/audio/speech.js";

const cases = [
  // [heard, target, expectedBand, note]
  ["assalam-o-alaikum", {native:"السلام علیکم", translit:"assalam-o-alaikum"}, "got", "exact translit"],
  ["salam alaikum",     {native:"السلام علیکم", translit:"assalam-o-alaikum"}, "got", "common short form"],
  ["as salamu alaykum", {native:"السلام علیکم", translit:"assalam-o-alaikum"}, "got", "different translit std"],
  ["um, salam alaikum yeah", {native:"السلام علیکم", translit:"assalam-o-alaikum"}, "got", "filler + extra"],
  ["السلام علیکم",       {native:"السلام علیکم", translit:"assalam-o-alaikum"}, "got", "native script exact"],
  ["السلام عليكم",       {native:"السلام علیکم", translit:"assalam-o-alaikum"}, "got", "arabic yeh/kaf variant"],
  ["good morning",      {native:"السلام علیکم", translit:"assalam-o-alaikum"}, "miss", "totally wrong"],
  ["main theek hoon",   {native:"میں ٹھیک ہوں، شکریہ", translit:"main theek hoon, shukriya"}, "close", "dropped shukriya"],
  ["main theek hoon shukriya", {native:"میں ٹھیک ہوں، شکریہ", translit:"main theek hoon, shukriya"}, "got", "full"],
  ["mera nam ali hai",  {native:"میرا نام علی ہے", translit:"mera naam Ali hai"}, "got", "naam vs nam"],
  ["bonjour",           {native:"Bonjour", translit:"bonjour"}, "got", "latin exact"],
  ["bon jour",          {native:"Bonjour", translit:"bonjour"}, "got", "split word"],
  ["merci beaucoup",    {native:"Bonjour", translit:"bonjour"}, "miss", "wrong phrase"],
  ["ni hao",            {native:"你好", translit:"nǐ hǎo"}, "got", "pinyin no tones"],
  ["kolay gelsin",      {native:"Kolay gelsin", translit:"kolay gelsin"}, "got", "turkish"],
  ["kolay gelsen",      {native:"Kolay gelsin", translit:"kolay gelsin"}, "got", "one vowel off"],
  ["",                  {native:"Bonjour", translit:"bonjour"}, "miss", "silence"],

  // ---- v74 CROSS-SCRIPT ---------------------------------------------------
  // The bug: no browser Urdu recogniser meant listening in hi-IN, which returns
  // DEVANAGARI. The grader compared it against Urdu script and a Latin
  // transliteration, matched neither, and scored a perfect utterance 0.00.
  // Every one of these was a guaranteed failure before the romanisation bridge.
  ["अस्सलाम ओ अलैकुम", {native:"السلام علیکم", translit:"assalam o alaikum"}, "got", "ur: salam heard in Devanagari"],
  ["मैं ठीक हूँ",       {native:"میں ٹھیک ہوں", translit:"main theek hoon"}, "got", "ur: I'm fine, Devanagari"],
  ["शुक्रिया",          {native:"شکریہ", translit:"shukriya"}, "got", "ur: thank you, Devanagari"],
  ["आप कैसे हैं",       {native:"آپ کیسے ہیں", translit:"aap kaise hain"}, "got", "ur: how are you, Devanagari"],
  ["पानी",             {native:"پانی", translit:"paani"}, "got", "ur: vowel-length mismatch paanee/paani"],
  ["जी हाँ",            {native:"جی ہاں", translit:"ji haan"}, "got", "ur: jee/ji folding"],
  ["ख़ुदा हाफ़िज़",       {native:"خدا حافظ", translit:"khuda hafiz"}, "got", "ur: nukta letters"],
  ["ਸਤ ਸ੍ਰੀ ਅਕਾਲ",     {native:"ست سری اکال", translit:"sat sri akal"}, "got", "pa: Gurmukhi against Shahmukhi target"],
  ["ধন্যবাদ",           {native:"ধন্যবাদ", translit:"dhonnobad"}, "got", "bn: native script still matches itself"],

  // …and the bridge must not turn wrong answers into passes.
  ["मुझे बिल्ली पसंद है", {native:"شکریہ", translit:"shukriya"}, "miss", "ur NEG: unrelated Devanagari sentence"],
  ["पानी",             {native:"شکریہ", translit:"shukriya"}, "miss", "ur NEG: wrong word, right script"],
  ["hello my friend",  {native:"شکریہ", translit:"shukriya"}, "miss", "ur NEG: English junk"],
  ["मैं ठीक हूँ",       {native:"آپ کیسے ہیں", translit:"aap kaise hain"}, "miss", "ur NEG: right language, wrong phrase"],
  ["मैं ठीक",           {native:"میں ٹھیک ہوں", translit:"main theek hoon"}, "close", "ur: dropped a word is still only close"],
];

let pass=0, fail=0;
for (const [heard, target, want, note] of cases) {
  const r = scoreAttempt(heard, target);
  const ok = r.band === want;
  ok ? pass++ : fail++;
  console.log(`${ok?"ok  ":"FAIL"} ${String(displayScore(r)).padStart(3)}%  band=${r.band.padEnd(5)} want=${want.padEnd(5)} | ${note}${ok?"":`  [missing: ${r.missing.join(",")}]`}`);
}
console.log(`\n  ${pass} pass, ${fail} fail\n`);
const j = await judge("main theek hoon", {native:"میں ٹھیک ہوں، شکریہ", translit:"main theek hoon, shukriya"}, {guideName:"Amina"});
console.log("\nfeedback sample:", j.feedback);

// ---------------------------------------------------------------------------
// The learner must never be shown the internal Latin skeleton. It exists only
// so the scorer has something comparable; showing it back as "you said
// assalaam o alaikum" when they were speaking Urdu would be a lie about what
// the microphone heard.
// ---------------------------------------------------------------------------
const cross = scoreAttempt("अस्सलाम ओ अलैकुम", { native: "السلام علیکم", translit: "assalam o alaikum" });
const shownOk = cross.heard === "अस्सलाम ओ अलैकुम";
const formOk = cross.matchedForm === "السلام علیکم" || cross.matchedForm === "assalam o alaikum";
console.log(`${shownOk ? "ok  " : "FAIL"} the transcript shown back is the real one, not the skeleton`);
console.log(`${formOk ? "ok  " : "FAIL"} the target shown back is a real form, not the skeleton`);
if (!shownOk || !formOk) fail++;

// ---------------------------------------------------------------------------
// Recognition locales: ask for the language itself first.
// ---------------------------------------------------------------------------
const urLocales = recognitionLocales("ur", "ur-PK");
const localeOk = urLocales[0] === "ur-PK" && urLocales.includes("hi-IN");
console.log(`${localeOk ? "ok  " : "FAIL"} Urdu asks for ur-PK first and keeps hi-IN as a fallback  → ${urLocales.join(" → ")}`);
if (!localeOk) fail++;

const esLocales = recognitionLocales("es", "es-ES");
const esOk = esLocales.length === 1 && esLocales[0] === "es-ES";
console.log(`${esOk ? "ok  " : "FAIL"} a well-supported language gets no pointless fallback`);
if (!esOk) fail++;

console.log(`\n  ${fail === 0 ? "all good" : fail + " failing"}\n`);
process.exit(fail ? 1 : 0);
