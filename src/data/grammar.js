// =============================================================================
// GRAMMAR — merges the two curriculum parts and exposes accessors.
// Lessons are teachable units (concept + examples + comprehension checks),
// not a dry reference. Browsable any time; never compulsory.
// =============================================================================

import { GRAMMAR_PART1 } from "./grammar_part1.js";
import { GRAMMAR_PART2 } from "./grammar_part2.js";
import { GRAMMAR_PART3 } from "./grammar_part3.js";

export const GRAMMAR = { ...GRAMMAR_PART1, ...GRAMMAR_PART2, ...GRAMMAR_PART3 };

/** All grammar lessons for a language, or [] if none. */
export function getGrammar(langCode) {
  return GRAMMAR[langCode] || [];
}

/** Does this language have a grammar curriculum? */
export function hasGrammar(langCode) {
  return (GRAMMAR[langCode] || []).length > 0;
}
