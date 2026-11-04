// =============================================================================
// inventory.mjs — measures what each language ACTUALLY has.
//
// Used by scripts/build-inventory.mjs (writes docs/ZABAN_LANGUAGE_INVENTORY.md)
// and by the curriculum tests. Every number here is read from the content
// files. Nothing about a language is assumed from another language.
// =============================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGES, LATIN_SCRIPT_LANGUAGES } from "../../src/data/registry.js";
import { GRAMMAR } from "../../src/data/grammar.js";
import { SENTENCE_PATTERNS } from "../../src/data/sentencePatterns.js";
import { CONVERSATIONS } from "../../src/data/conversations.js";
import { PASSAGES } from "../../src/data/passages.js";
import { CULTURE } from "../../src/data/culture.js";
import { REGIONS } from "../../src/data/personas.js";
import { CONJUGATIONS } from "../../src/data/conjugations.js";
import { TENSES } from "../../src/data/tenses.js";
import { AUDIO_RUNS } from "../../src/data/audioIndex.js";
import { JOURNEY } from "../../src/data/journey.js";
import { mergeExamples } from "../../src/data/extraExamples.js";
import { COURSES } from "../../src/data/courses.js";
import { buildCourse, tokensOf, wordsUsedIn } from "../../src/engine/curriculum.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const LANG_DIR = path.resolve(__dirname, "..", "..", "src", "data", "languages");

/** The pack as the app sees it: registry meta + JSON + merged extra examples. */
export function loadPack(code) {
  const raw = JSON.parse(fs.readFileSync(path.join(LANG_DIR, `${code}.json`), "utf8"));
  const vocab = (raw.vocab || []).map((v) => {
    const merged = mergeExamples(code, v.lemma, v.examples || []);
    return merged === v.examples ? v : { ...v, examples: merged };
  });
  return { ...LANGUAGES[code], ...raw, vocab };
}

export function allCodes() {
  return Object.keys(LANGUAGES).sort();
}

function audioCount(code) {
  return (AUDIO_RUNS[code] || []).reduce((n, [a, b]) => n + (b - a + 1), 0);
}

/** One language, measured. */
export function measure(code) {
  const pack = loadPack(code);
  const vocab = pack.vocab || [];
  const units = pack.units || [];
  const latin = LATIN_SCRIPT_LANGUAGES.has(code);
  const course = buildCourse(pack, {
    grammar: GRAMMAR[code] || [],
    patterns: SENTENCE_PATTERNS[code] || [],
    stops: JOURNEY[code]?.stops || [],
    profile: COURSES[code],
  });

  const withExamples = vocab.filter((v) => (v.examples || []).length > 0);
  const exampleCount = vocab.reduce((n, v) => n + (v.examples || []).length, 0);
  // An example that contains the taught form is one a learner can be asked to
  // complete. Inflecting languages legitimately fail this for verbs (comer →
  // como), so it is a measure of what the gap-fill can use, not of quality.
  const exampleShowsForm = withExamples.filter((v) =>
    (v.examples || []).some((e) => wordsUsedIn(e.native || "", [v], code).length > 0)
  );
  const withTranslit = vocab.filter((v) => v.translit && v.translit !== v.lemma);
  const withPron = vocab.filter((v) => v.pronunciation);
  const withDialect = vocab.filter((v) => v.dialects && Object.keys(v.dialects).length);

  const unitSizes = units.map((u) => vocab.filter((v) => v.unit === u.id).length);
  const thinUnits = units.filter((u, i) => unitSizes[i] < 12).map((u) => u.title);

  const stops = JOURNEY[code]?.stops || [];
  const stopReport = course.modules
    .filter((m) => m.exchange)
    .map((m) => ({ id: m.exchange.id, module: m.title, covered: m.exchange.coverage }));
  const stopsUsingUnitWords = stopReport.filter((s) => s.covered.unitWords > 0).length;

  const grammar = GRAMMAR[code] || [];
  const conj = CONJUGATIONS[code] ? Object.keys(CONJUGATIONS[code].verbs || CONJUGATIONS[code]).length : 0;

  const issues = [];
  if (!grammar.length) issues.push("no grammar lessons: structures are only met inside sentences");
  if (grammar.length && grammar.length < 4) issues.push(`only ${grammar.length} grammar lessons`);
  if (!(PASSAGES[code] || []).length) issues.push("no reading passages");
  if (withExamples.length < vocab.length * 0.9)
    issues.push(`${vocab.length - withExamples.length} of ${vocab.length} words have no example sentence`);
  if (!latin && withTranslit.length < vocab.length)
    issues.push(`${vocab.length - withTranslit.length} words have no romanisation`);
  if (thinUnits.length) issues.push(`thin units (<12 words): ${thinUnits.join(", ")}`);
  if (stops.length && stopsUsingUnitWords < stops.length)
    issues.push(
      `${stops.length - stopsUsingUnitWords} of ${stops.length} journey exchanges use none of their unit's words`
    );
  if (!audioCount(code)) issues.push("no recorded audio: relies on the device's speech voice");
  if (units.length < 9) issues.push(`${units.length} units: short of a full A1 topic range`);

  return {
    code,
    name: pack.name,
    nativeName: pack.nativeName,
    rtl: !!pack.rtl,
    latin,
    profile: COURSES[code] || null,
    units: units.length,
    unitTitles: units.map((u) => u.title),
    unitSizes,
    words: vocab.length,
    withExamples: withExamples.length,
    exampleCount,
    exampleShowsForm: exampleShowsForm.length,
    withTranslit: withTranslit.length,
    withPron: withPron.length,
    withDialect: withDialect.length,
    alphabet: (pack.alphabet || []).length,
    scriptCourse: !!pack.scriptSystem,
    grammar: grammar.length,
    grammarTitles: grammar.map((g) => g.title),
    patterns: (SENTENCE_PATTERNS[code] || []).length,
    conversations: (CONVERSATIONS[code] || []).length,
    passages: (PASSAGES[code] || []).length,
    culture: (CULTURE[code] || []).length,
    conjugatedVerbs: conj,
    tenses: !!TENSES[code],
    audio: audioCount(code),
    varieties: (REGIONS[code] || []).map((r) => r.name),
    stops: stops.length,
    stopsUsingUnitWords,
    stopReport,
    course,
    issues,
  };
}

export { tokensOf };
