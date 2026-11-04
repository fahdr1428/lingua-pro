# Zaban — adaptive learning engine

The engine decides what a learner should practise, judges their answers, and
keeps the evidence of what they can do. It extends today's `src/engine/` (FSRS-lite
scheduling, evidence-weighted ratings, the recall grader, in-lesson challenge)
from **words** to **every kind of item**, and from one number per word to a
**staged mastery model per item and per skill**.

Design rule inherited from `profile.js`: **never invent a number.** Every estimate
comes from recorded attempts. Where evidence is thin, the engine says so.

## 1. What the engine tracks

### Items

Anything taught and reviewable is an **item** with its own state:

| Item type | Example | Today |
|---|---|---|
| `lexical` | *chai* "tea"; *bas, shukriya* "that's all, thanks" | yes (words) |
| `structure` | *mujhe … chahiye* (dative + *chahiye*); polite imperative *-iye* | no |
| `pattern` | "*ek* + noun + *dijiye*" (ordering formula) | partly (Sentence Lab, no state) |
| `function` | make a polite request; ask a price | no |
| `sound` / `script` | retroflex *ṭ* vs dental *t*; the letter ے | partly (script course, no state) |

### Attempts: the only source of truth

Every graded response, in a lesson, review, assessment, diagnostic or tutor
conversation, is stored as an **Attempt**:

```js
/** @typedef {Object} Attempt
 * @property {string} id
 * @property {string} learnerId
 * @property {number} at                 // timestamp
 * @property {string} itemIds[]          // items the activity exercises
 * @property {string} [objectiveId]
 * @property {string} activityType       // e.g. "recall_write", "transform", "roleplay_turn"
 * @property {"recognise"|"recall"|"construct"|"use"} demand  // what the format demanded
 * @property {"lesson"|"review"|"assessment"|"diagnostic"|"tutor"} setting
 * @property {"taught"|"novel"} context  // was this exact frame seen in teaching?
 * @property {number} hints              // hints used
 * @property {boolean} correct
 * @property {"exact"|"close"|"alternative"|"other-word"|"wrong"|"gave-up"|"partial"} verdict
 * @property {"rules"|"ai"|"human"} grader
 * @property {string} [errorPatternId]   // e.g. "ur.dative-subject-missing"
 * @property {number} [latencyMs]
 */
```

Today the engine keeps only the *result* of attempts on the word's FSRS card
(plus v113's `recalls` count). Keeping the attempts themselves makes mastery
explainable, lets the rules be re-tuned later, and is the raw material for
learning analytics.

## 2. Mastery stages

Each item has a **stage** per learner, derived from attempts. A stage is reached
only by evidence of the stated kind, so one correct multiple-choice answer can
never mean "mastered".

| Stage | Rule (defaults, all configurable) |
|---|---|
| **New** | never met |
| **Introduced** | taught (seen in a teaching phase) |
| **Knowledge** | ≥1 correct `recognise` attempt |
| **Recall** | ≥2 correct unaided `recall`/`construct` attempts (no hints, verdict exact/close/alternative), in ≥2 different sessions, in ≥2 activity formats |
| **Application** | Recall, plus ≥1 correct attempt with `context: novel` and demand `construct` or `use` (new sentence, roleplay, free writing) |
| **Secure** (retention) | Application, plus a correct unaided production ≥7 days after the previous success, and current retrievability ≥ 0.85 |

**Demotion.** A failed production attempt moves an item back one stage (never
below Knowledge) and reschedules it soon. A failed delayed review removes
*Secure*.

**Legacy cards.** Words learned before this model have FSRS cards but no attempt
log. They are mapped on migration: `recalls ≥ 1` → Recall; stability ≥ 21 days
with no recent failure → Secure; otherwise Knowledge if reviewed at all.

**Objectives** inherit from their items and their own assessment tasks. An
objective is *demonstrated* when every assessment task for it is passed without
hints, and *secure* when its items are Secure.

These rules replace v113's single `canRecall` flag. The map's ✓ will be awarded
per **module outcome** at Application or above.

## 3. Evidence required by objective type

| Objective type | Minimum evidence before "demonstrated" |
|---|---|
| `recognise` | correct comprehension on unseen material |
| `recall` | Recall stage for its items |
| `construct` | ≥2 correct constructions from prompts, at least one novel |
| `use` | task success in a conversation or roleplay with the objective's criteria met |
| `understand` | comprehension questions on an unseen passage or recording |

## 4. Scheduling

- **One scheduler for every item type.** FSRS-lite (`srs.js`), unchanged in
  principle. Ratings follow the v113 evidence policy:

  | Attempt | Rating |
  |---|---|
  | unaided production, correct | GOOD |
  | chosen from options, correct | HARD |
  | with hint, close, or alternative | HARD |
  | wrong or "show me" | AGAIN |
  | assessment and delayed-review successes | GOOD (EASY only for fast, novel-context success at Secure) |

- **Per-type defaults.** Structures and functions start with shorter initial
  stability than words. They are harder to retain and need more varied practice.
- **Configurable first, fitted later.** Parameters live in one config object.
  Once accounts give enough review logs (several thousand reviews per course),
  parameters are fitted to real learner forgetting, per course.
- **Leeches** (lapses ≥ 3) get the existing gentle path: an easier format, an
  explicit "this one keeps slipping" message, and a re-teach.

## 5. Choosing what to practise

### Inside an authored lesson

The lesson defines its phases and activities. The engine:

1. **Fills phase 1 (Recall)** with 3–5 due items, preferring the lesson's
   prerequisites, then other due items.
2. **Adjusts guided practice** with `challenge.js`: supported questions become
   from-memory when the learner is breezing, and the reverse when struggling.
   Adjustments never happen in assessment.
3. **Samples assessment variants.** Each assessment task has several equivalent
   variants. The learner gets one they haven't seen.
4. **Builds the feedback phase** from the attempts: objectives met, items to
   revise, the explained mistakes, and a suggested tutor follow-up.

### Review sessions (generated)

Today's generator becomes the review builder, over all item types:

- Due items first, then weak ones, interleaved across types and topics.
- **The format depends on stage**: Knowledge → recall formats; Recall → construction
  and novel-context formats; Application → mixed, delayed retrieval.
- At most ~25% choose-from-options questions in a review session.

### Recommending the next step

The Home screen's single "next step" (existing `coach.js` priority list) gains two
inputs:

1. **Remedial before new.** If a module's objective is not demonstrated and its
   items are due, a short remedial session comes before the next lesson.
2. **Tutor when ready.** When a module's items reach Recall, suggest the module's
   roleplay. Application evidence comes from use.

## 6. Answer evaluation

Evaluation runs as a pipeline, cheapest and most reliable first:

1. **Deterministic grading** (`recall.js` and its successors): normalisation,
   script or romanisation, keyboard variants, accents, articles, typos, other real
   words, synonyms, against the activity's **accepted answers and alternatives**.
2. **Targeted wrong-answer feedback**: authored `commonMistakes` patterns (for
   example *main chahiye* → "With *chahiye*, the person who wants is *mujhe*, not
   *main*").
3. **Structural checks**: for construction tasks, required elements present
   (e.g. a polite verb form) with authored rules.
4. **AI rubric grading** for open-ended production (free writing, conversation
   turns). It runs server-side with an authored rubric and returns a structured
   verdict. It is recorded with `grader: "ai"`, and counts toward mastery only once
   that rubric's AI grading has been calibrated against human grading
   (agreement threshold set per rubric).
5. **Speech** goes through the recogniser to text, then the same pipeline. It
   establishes **intelligibility** only.

**Valid alternatives are always right.** An answer that expresses the target
meaning correctly is accepted, even if it isn't the expected form. If it doesn't
use the lesson's target structure, the feedback says so ("Also right. This lesson
is practising *-iye*: *dijiye*").

## 7. The skill profile

Seven skills: **vocabulary, grammar, listening, reading, writing, speaking,
interaction**. Each activity type contributes evidence to one or more skills
(e.g. a listening comprehension task → listening; a roleplay → interaction and
speaking).

For each skill the profile shows:

- **Score (0–100)**: the share of that skill's objectives at the learner's current
  level that are demonstrated, weighted by stage (Knowledge 0.25, Recall 0.6,
  Application 0.85, Secure 1.0).
- **Confidence**: low / medium / high, from the amount and recency of evidence
  (e.g. high = ≥30 graded attempts across ≥5 sessions in the last 60 days).
  Below a minimum (≥10 attempts across ≥2 sessions) the profile shows **"not
  enough evidence yet"** instead of a score.
- **Estimated band**: the highest CEFR band where ≥80% of that skill's objectives
  are demonstrated. It is labelled *estimate*, with a one-line explanation of how
  it was reached. Never a certificate.
- **Recommended focus**: the lowest-scoring skill with enough evidence, and its
  weakest objectives.

## 8. Diagnostics

- **Initial placement (optional).** A short adaptive check sampling objectives
  from Pre-A1 to A2 across listening, reading and production. Results seed item
  stages up to **Knowledge or Recall**, never Secure, and are marked "estimated".
- **Skip ahead (exists).** Per-chapter test-out stays, with its higher pass bar
  (85%), and moves to per-module.
- **Parallel forms.** The diagnostic has equivalent forms, so a later re-test
  measures change rather than memory of the test.

## 9. Learning analytics

Engagement and learning are measured separately and never blended into one score.

### Events (with consent; see technical architecture §8 for privacy)

`attempt_recorded` · `lesson_started` · `lesson_completed` · `review_completed` ·
`objective_state_changed` · `item_stage_changed` · `tutor_session_completed` ·
`diagnostic_completed`

### Educational metrics (definitions)

| Metric | Definition |
|---|---|
| **Delayed retention** | Of items at Recall or above that came due ≥7 days after their last success, the share answered correctly, unaided, at that review |
| **Independent production** | Share of assessment-phase objectives demonstrated with no hints |
| **Transfer** | Share of items at Recall that succeed on their first novel-context attempt |
| **Skill progression** | Change in each skill score per 30 days of active study |
| **Learning effectiveness** | Change between diagnostic forms (pre vs later), per skill |
| **Time to Recall** | Median number of sessions from Introduced to Recall, per item type |

### Engagement metrics

Activation, lesson completion, day-1/7/30 return, sessions per week, tutor usage,
conversion.

### Dashboards

An internal **learning dashboard** per course shows the educational metrics by
module and lesson. Lessons with low independent production or retention are
flagged for review, closing the loop back to the curriculum.

## 10. Configuration and testing

- All thresholds (stage rules, ratings, skill weights, confidence minimums,
  challenge band) live in one versioned config, so they are tunable and testable.
- Each rule gets the same treatment v113's grader and challenge rules got: unit
  tests over real content, simulations of learner profiles, and **mutation
  proofs** (break the rule on purpose and confirm the test fails).
- The existing tests (`test-engine`, `test-recall`, `test-challenge`,
  `test-lessons`) are extended, not replaced.
