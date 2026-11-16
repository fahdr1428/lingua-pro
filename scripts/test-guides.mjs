// =============================================================================
// test-guides.mjs (v119) — every guide has a face, and the face is drawable.
//
//   · every language in the registry has a guide, and every guide a look;
//   · every look names only things GuideAvatar can draw (and the list of hair
//     styles here is the list GuideAvatar actually has);
//   · skin and clothes are real colours, and no two guides share a face
//     (same skin, hair, covering and clothes);
//   · the guide's first hello fits a speech bubble, in whole sentences;
//   · a Sentence Lab title with a note in brackets splits into a short title
//     and the note, in sentence case.
//
// Each rule here was checked against a deliberately broken copy (see commit).
// =============================================================================

import { readFileSync } from "node:fs";
import { LANGUAGES } from "../src/data/registry.js";
import { CHARACTERS } from "../src/data/characters.js";
import { GUIDE_LOOKS, HAIR_STYLES, COVER_KINDS, NECKS, BEARDS, GLASSES, EARRINGS, BROWS } from "../src/data/guideLooks.js";
import { splitSkill, firstSentences } from "../src/ui/textShape.js";
import { PATTERN_SKILLS } from "../src/data/contentIndex.js";

let checks = 0;
const problems = [];
const check = (cond, msg) => { checks++; if (!cond) problems.push(msg); };
const HEX = /^#[0-9a-f]{6}$/i;

// --- every language, a guide, a face ------------------------------------------
for (const code of Object.keys(LANGUAGES)) {
  check(!!CHARACTERS[code], `${code}: no guide`);
  const look = GUIDE_LOOKS[code];
  check(!!look, `${code}: the guide has no face (no entry in GUIDE_LOOKS)`);
  if (!look) continue;
  check(Array.isArray(look.skin) && look.skin.length === 2 && look.skin.every((c) => HEX.test(c)), `${code}: skin isn't [base, shade]`);
  check(HAIR_STYLES.includes(look.hair?.style), `${code}: hair style "${look.hair?.style}" can't be drawn`);
  check(HEX.test(look.hair?.color || ""), `${code}: hair colour "${look.hair?.color}"`);
  if (look.cover) {
    check(COVER_KINDS.includes(look.cover.kind), `${code}: cover "${look.cover.kind}" can't be drawn`);
    check(HEX.test(look.cover.color || ""), `${code}: cover colour "${look.cover.color}"`);
    if (look.cover.pattern) check(HEX.test(look.cover.pattern), `${code}: cover pattern colour`);
  }
  check(HEX.test(look.garment?.color || ""), `${code}: clothes colour "${look.garment?.color}"`);
  check(!look.garment?.neck || NECKS.includes(look.garment.neck), `${code}: neckline "${look.garment?.neck}"`);
  if (look.garment?.trim) check(HEX.test(look.garment.trim), `${code}: trim colour`);
  if (look.beard) check(BEARDS.includes(look.beard), `${code}: beard "${look.beard}"`);
  if (look.glasses) check(GLASSES.includes(look.glasses), `${code}: glasses "${look.glasses}"`);
  if (look.earrings) check(EARRINGS.includes(look.earrings), `${code}: earrings "${look.earrings}"`);
  if (look.brows) check(BROWS.includes(look.brows), `${code}: brows "${look.brows}"`);
  // A hijab covers the hair and the ears — earrings or jasmine would be drawn
  // on top of the scarf, floating.
  if (look.cover?.kind === "hijab") {
    check(!look.earrings && !look.jasmine, `${code}: earrings or jasmine drawn over a hijab`);
  }
}
check(Object.keys(GUIDE_LOOKS).every((c) => LANGUAGES[c]), "a look for a language that doesn't exist");

// No two guides look the same.
const faces = Object.entries(GUIDE_LOOKS).map(([c, l]) => [c, JSON.stringify([l.skin, l.hair, l.cover || null, l.garment?.color, l.beard || null, l.glasses || null])]);
for (let i = 0; i < faces.length; i++) for (let j = i + 1; j < faces.length; j++) {
  check(faces[i][1] !== faces[j][1], `${faces[i][0]} and ${faces[j][0]} have the same face`);
}

// The hair styles the data may use are exactly the ones GuideAvatar draws.
const avatarSrc = readFileSync(new URL("../src/ui/GuideAvatar.jsx", import.meta.url), "utf8");
const hairBlock = avatarSrc.slice(avatarSrc.indexOf("const HAIR = {"), avatarSrc.indexOf("// ---- clothes"));
const drawn = [...hairBlock.matchAll(/^  (\w+): \{/gm)].map((m) => m[1]);
check(JSON.stringify([...drawn].sort()) === JSON.stringify([...HAIR_STYLES].sort()),
  `GuideAvatar draws ${drawn.join(",")} but HAIR_STYLES lists ${HAIR_STYLES.join(",")}`);

// --- the first hello fits a bubble ---------------------------------------------
for (const [code, g] of Object.entries(CHARACTERS)) {
  const hello = firstSentences(g.intro || "");
  check(hello.length > 20 && hello.length <= 140, `${code}: first hello is ${hello.length} characters: "${hello.slice(0, 60)}…"`);
  check(/[.!?]$/.test(hello), `${code}: first hello stops mid-sentence: "…${hello.slice(-30)}"`);
  check((g.intro || "").startsWith(hello), `${code}: first hello isn't the start of the intro`);
  check(!!g.signature?.text && !!g.signature?.en, `${code}: no signature line to say when the face is tapped`);
}
check(firstSentences("One. Two.", 140) === "One. Two.", "firstSentences cut a short text");
check(firstSentences("A".repeat(200) + ". B.", 140) === "A".repeat(200) + ".", "firstSentences dropped an over-long first sentence instead of keeping it");

// --- Sentence Lab titles -------------------------------------------------------
const cases = [
  ["Subject + Verb (note: verb comes LAST in Urdu)", "Subject + Verb", "Verb comes last in Urdu"],
  ["Saying who you are (no verb needed in Arabic!)", "Saying who you are", "No verb needed in Arabic"],
  ["Saying you have something (عندي)", "Saying you have something", "عندي"],
  ["Greeting someone", "Greeting someone", null],
  ["Asking (politely) for help", "Asking (politely) for help", null],
];
for (const [t, head, note] of cases) {
  const r = splitSkill(t);
  check(r.head === head && r.note === note, `splitSkill("${t}") gave ${JSON.stringify(r)}`);
}
for (const [code, skills] of Object.entries(PATTERN_SKILLS)) {
  for (const s of skills) {
    const r = splitSkill(s);
    check(r.head && !/\(note:/i.test(r.head) && !/\)$/.test(r.head), `${code}: "${s}" still has its note in the title: "${r.head}"`);
    check(!r.note || !/\b[A-Z]{3,}\b/.test(r.note.replace(/\b(OK|TV)\b/g, "")), `${code}: note still shouts: "${r.note}"`);
  }
}

console.log(`test-guides: ${checks} checks`);
if (problems.length) {
  for (const p of problems.slice(0, 40)) console.log("  ✗ " + p);
  if (problems.length > 40) console.log(`  … and ${problems.length - 40} more`);
  process.exit(1);
}
console.log("  ✓ all pass");
