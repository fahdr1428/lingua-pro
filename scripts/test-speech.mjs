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
import { scoreAttempt, judge, displayScore } from "../src/audio/speech.js";

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

process.exit(fail ? 1 : 0);
