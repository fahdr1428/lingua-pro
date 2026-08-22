// =============================================================================
// measure-input.mjs (v83) — how much of this language does the app actually
// show anyone?
//
// WHY THIS EXISTS. Second-language acquisition research disagrees about a great
// deal, but the one thing nobody disputes is that comprehensible input — text
// and speech attended to for MEANING — is necessary. The strongest version of
// the claim (Krashen) is that it is sufficient on its own; the version the
// evidence actually supports (Lightbown and Spada's survey) is that it is the
// engine, and explicit attention to form is the steering. Either way, an app
// with no input is not a language app.
//
// This app has fourteen exercise types, a spaced-repetition scheduler fitted to
// a memory model, graduated retrieval, and a leech-recovery path. All of that is
// machinery for practising ITEMS. It says nothing about how much LANGUAGE a
// learner ever meets, and it is very easy to build more and more of the first
// while believing you are building the second — the app feels substantial,
// because it is, in the way it is substantial.
//
// So this counts the other thing, per language:
//
//   CONNECTED TEXT   the reading passages — the only place a learner meets more
//                    than one sentence in a row
//   SENTENCE INPUT   example sentences attached to vocabulary. Native-authored
//                    and real, but one line at a time inside a question.
//   FRAMES PER WORD  how many DIFFERENT sentences a word is met in. One means
//                    the word is known in exactly one frame, which is the
//                    difference between recognising it and being able to use it.
//
// It prints, it doesn't fail. The number is a judgement about the curriculum,
// not a bug — but it should be a number somebody has seen.
//
//   npm run measure-input
// =============================================================================

import { readFileSync, readdirSync } from "node:fs";
import { PASSAGES } from "../src/data/passages.js";
import { GRAMMAR } from "../src/data/grammar.js";
import { LANGUAGES } from "../src/data/registry.js";

const DIR = "src/data/languages";
const words = (s) => String(s || "").split(/\s+/).filter(Boolean).length;

// Chinese and Japanese don't put spaces between words, so a space count says
// nothing there. Characters are the honest unit; roughly 1.5 characters a word
// is the usual rule of thumb for modern Chinese, and Japanese is close enough
// for a figure at this resolution.
const DENSE = new Set(["zh", "ja"]);
const lengthOf = (s, code) =>
  DENSE.has(code) ? Math.round([...String(s || "").replace(/\s/g, "")].length / 1.6) : words(s);

const rows = [];

for (const file of readdirSync(DIR).sort()) {
  const pack = JSON.parse(readFileSync(`${DIR}/${file}`, "utf8"));
  const code = pack.code;
  const vocab = pack.vocab || [];

  const passages = PASSAGES[code] || [];
  const connected = passages.reduce(
    (n, p) => n + (p.lines || []).reduce((m, l) => m + lengthOf(l.native, code), 0), 0);

  const examples = vocab.flatMap((v) => v.examples || []);
  const sentenceInput = examples.reduce((n, e) => n + lengthOf(e.native, code), 0);
  const framesPerWord = vocab.length ? examples.length / vocab.length : 0;
  const oneFrameOnly = vocab.filter((v) => (v.examples || []).length <= 1).length;

  rows.push({
    code,
    name: LANGUAGES[code]?.name || code,
    vocab: vocab.length,
    passages: passages.length,
    connected,
    sentenceInput,
    framesPerWord,
    oneFrameOnly,
    grammar: (GRAMMAR[code] || []).length,
  });
}

const pad = (s, n) => String(s).padEnd(n);
const num = (s, n) => String(s).padStart(n);

console.log("\n  How much language does a learner actually meet?\n");
console.log(`  ${pad("", 18)}${num("words", 7)}${num("passages", 10)}${num("connected", 11)}${num("in sentences", 14)}${num("frames/word", 13)}${num("grammar", 9)}`);
console.log(`  ${"─".repeat(82)}`);
for (const r of rows.sort((a, b) => a.connected - b.connected)) {
  console.log(
    `  ${pad(r.name, 18)}${num(r.vocab, 7)}${num(r.passages, 10)}${num(r.connected, 11)}${num(r.sentenceInput, 14)}${num(r.framesPerWord.toFixed(2), 13)}${num(r.grammar, 9)}`
  );
}

const totalConnected = rows.reduce((n, r) => n + r.connected, 0);
const worst = rows[0];
const oneFrame = rows.reduce((n, r) => n + r.oneFrameOnly, 0);
const totalVocab = rows.reduce((n, r) => n + r.vocab, 0);

console.log(`\n  Connected text across all ${rows.length} languages: ~${totalConnected} words.`);
const secs = Math.max(1, Math.round((worst.connected / 200) * 60));
console.log(`  Thinnest: ${worst.name}, ~${worst.connected} words — about ${secs} second${secs === 1 ? "" : "s"} of reading.`);
console.log(`  Words met in only one sentence: ${oneFrame} of ${totalVocab} (${Math.round(oneFrame / totalVocab * 100)}%).\n`);
console.log(`  A word met in a single frame is known in that frame. Two or three`);
console.log(`  different sentences is the difference between recognising it and`);
console.log(`  being able to use it — and connected text is where that happens.\n`);
