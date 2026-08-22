// =============================================================================
// validate-grammar-checks.mjs (v83) — the generated grammar questions must never
// have two right answers.
//
// applicationChecks builds "which one means X?" items out of the curriculum's
// own example sentences. The failure mode that matters is not a missing
// question, it's an ambiguous one: within a lesson the examples deliberately
// contrast the feature being taught, so "Yo hablo español" and "Hablo español"
// both mean "I speak Spanish" and offering both marks a correct answer wrong.
// That teaches something false, which is worse than the trivia it replaces.
//
// So this asserts, for every generated item in every language:
//   - the answer is one of the options
//   - no two options mean the same thing, by the same normalisation the
//     generator uses
//   - no option is repeated
//   - the question doesn't carry the editorial note that would give it away
//
// And it reports coverage, because a generator that quietly produces nothing
// passes every safety check ever written.
// =============================================================================

import { GRAMMAR } from "../src/data/grammar.js";
import { applicationChecks, glossKey } from "../src/engine/grammarChecks.js";

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  if (!ok) console.log(`  FAIL ${name}${detail ? "  → " + detail : ""}`);
};

let generated = 0, lessonsWith = 0, lessonsTotal = 0;

for (const [code, lessons] of Object.entries(GRAMMAR)) {
  for (const lesson of lessons) {
    lessonsTotal++;
    const items = applicationChecks(lesson, lessons);
    if (items.length) lessonsWith++;
    generated += items.length;

    // A lesson that contrasts two ways of saying the same thing must not ask
    // about it twice — the identical question with two different right answers
    // reads as the app contradicting itself.
    check(`${code}/${lesson.id}: no question is asked twice in one lesson`,
      new Set(items.map((it) => it.q)).size === items.length,
      JSON.stringify(items.map((it) => it.q)));

    for (const [i, item] of items.entries()) {
      const where = `${code}/${lesson.id}#${i}`;

      check(`${where}: the answer is on the list`,
        item.options.includes(item.answer), JSON.stringify(item.options));

      check(`${where}: three options`,
        item.options.length === 3, String(item.options.length));

      check(`${where}: no option appears twice`,
        new Set(item.options).size === item.options.length, JSON.stringify(item.options));

      // The one that matters. Map every option back to the example it came
      // from, and compare meanings.
      const all = lessons.flatMap((l) => l.examples || []);
      const meanings = item.options.map((native) => {
        const ex = all.find((e) => e.native === native);
        return ex ? glossKey(ex.gloss) : `?${native}`;
      });
      check(`${where}: no two options mean the same thing`,
        new Set(meanings).size === meanings.length,
        `${JSON.stringify(item.options)} → ${JSON.stringify(meanings)}`);

      check(`${where}: the question doesn't leak the note that names the answer`,
        !/[—–]/.test(item.q), item.q);
    }
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n  ${generated} application checks generated across ${lessonsWith}/${lessonsTotal} lessons`);
console.log(`  ${results.length - failed.length} pass, ${failed.length} fail\n`);

// A generator that produces nothing passes every assertion above.
if (generated < lessonsTotal) {
  console.log(`  [!] ${lessonsTotal - lessonsWith} lessons produced no application check — not enough`);
  console.log(`      unambiguous examples to build one from. Adding a distinct example fixes it.\n`);
}

process.exit(failed.length ? 1 : 0);
