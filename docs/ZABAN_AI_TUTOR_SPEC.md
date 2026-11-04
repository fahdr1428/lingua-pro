# Zaban — AI language tutor specification

The tutor is where learners **apply** what the Academy taught and the Engine
reinforced. It is central to the product, and it is **contextual**: it knows the
course, the lesson, the learner's vocabulary and grammar, their recurring mistakes
and their weakest skills.

**The tutor personalises and reinforces the curriculum. It does not invent it.**
Grammar explanations and language content come from reviewed curriculum content.
Where the tutor goes beyond it, it says so.

## 1. What exists today

| Feature | Endpoint | What it does well | Gap |
|---|---|---|---|
| **Speak** (conversation coach) | `api/coach.js` | Structured replies (native, romanisation, English, spoken coaching); verdict good/close/retry; corrections as *patterns* with an elicitation question (`ask`) rather than a recast; a fluent version of the learner's turn; regional varieties; personas; pressure levels; learner brief from `profile.js` | Brief lacks known vocabulary, current lesson and objectives; corrections aren't linked to curriculum items; no level-based correction policy beyond the brief |
| **Missions** (roleplay) | `api/coach.js` + `api/scenario.js` | Objectives, fail conditions, pass marks; custom scenarios generated from a sentence | Not tied to module outcomes |
| **Decode** (real messages) | `api/decode.js` | Word-by-word breakdown of a pasted message, marks known words, suggests a reply | Not a writing-correction mode |
| Explain | none | — | Explanations are templates (`explain.js`) |
| Writing corrections | none | — | — |
| Personalised revision | none (engine reviews only) | — | — |

Security baseline already in place and kept: the Anthropic key is server-side
only; learner text is always sent as a user turn, never in the system prompt;
request size, history length and output tokens are capped; endpoints degrade to
`501 {configured:false}` without a key. **Missing:** authentication and per-user
quotas. The in-process rate limit resets on every cold start.

## 2. The learner-context packet

Every tutor call receives a compact, structured context built by the engine
(`Engine.getLearnerContext()`), not free text assembled in each screen:

```js
/** @typedef {Object} LearnerContext
 * @property {string} course            // "ur-PK.everyday"
 * @property {string} variety           // "ur-PK"
 * @property {string} register          // "everyday polite"
 * @property {string} level             // current target band, e.g. "A1"
 * @property {{lessonId:string, title:string, objectives:string[]}} [current]  // lesson/module being studied
 * @property {string[]} completedLessons   // last N lesson titles
 * @property {{secure:string[], recall:string[], knowledge:string[]}} vocabulary // lemmas (+translit), capped per list
 * @property {{itemId:string, label:string, stage:string}[]} grammar          // structures taught, with stage
 * @property {{patternId:string, label:string, count:number, itemId?:string}[]} recurringErrors
 * @property {{skill:string, score:number|null, confidence:string}[]} skills
 * @property {{itemId:string, label:string}[]} focus   // what to steer toward this session (weak / due)
 * @property {string} [goal]            // learner's stated purpose
 */
```

- **Size budget:** about 1,500 tokens. Lists are capped and prioritised (focus and
  current-lesson items first, then recent, then the rest summarised as counts).
- **Built in one place** so every mode gets the same picture of the learner.
- **Replaces** today's `summariseForPrompt` brief (which is folded into
  `recurringErrors` and `skills`).
- **Contains no personal data** beyond learning state: no name, no email.

## 3. Grounding

- **Explanation library.** Each structure item in the curriculum has a reviewed
  explanation (a short rule, 2–4 examples, common mistakes). Tutor modes receive
  the relevant entries by ID and must base explanations on them.
- **Cite, don't invent.** Tutor explanations carry the IDs of the curriculum
  entries they used. If a learner asks about something with no curriculum entry,
  the tutor may answer, but the reply is marked `grounded: false`. The UI labels it
  "Tutor's note, not yet reviewed" and logs it as a candidate for the curriculum
  team.
- **Vocabulary control.** At A1–A2, tutor turns use known vocabulary (secure +
  recall lists) plus the current lesson's items. At most one or two new words per
  turn, each glossed. This is checked automatically (§8).
- **Variety and register** come from the course and are enforced in the prompt
  (existing regional prompts in `personas.js` are reused).

## 4. Behaviour rules (all modes)

| Rule | How it is implemented |
|---|---|
| Know what the learner has covered | context packet: vocabulary, grammar, completed lessons |
| Use language at the learner's level | level-specific instructions; vocabulary control; checked in evaluation |
| Encourage independent answers | ask before telling; hints before answers; the existing `suggestion` field only after a stall |
| Correct significant mistakes without overwhelming | correction policy by level (below) |
| Explain why a correction is needed | `why` field, grounded in the explanation library |
| Ask the learner to retry | the existing `ask` elicitation question; the client offers a retry |
| Record recurring weaknesses | every correction returns `patternId` and, where it maps, `itemId`. The engine records it as an Attempt. |
| Accept valid alternatives | explicit instruction plus evaluation cases where alternatives must be accepted |
| Challenge advanced learners | level policy: less scaffolding, register and naturalness feedback, harder texts |

### Correction policy by level

| Level | Corrections per turn | Which errors | Style |
|---|---|---|---|
| Pre-A1 / A1 | at most 1 | meaning-blocking first, then the current lesson's target structure, then recurring patterns | prompt first; reveal the form after a failed retry |
| A2 / B1 | at most 2 | plus agreement and register | prompt, then a short explanation |
| B2+ | up to 3 | plus naturalness, collocation, register shifts | brief, more recasts, focus on nuance |

"Good" means *a native speaker would understand it*. Small slips at beginner level
are not corrected unless they are the lesson's target.

## 5. The five modes

### 5.1 Explain

- **Purpose:** explain grammar, vocabulary or a confusing point at the learner's
  level.
- **Entry points:** "Ask the tutor" on any explanation card, grammar page or wrong
  answer; free question in the tutor tab.
- **Inputs:** context packet; the question; relevant explanation-library entries;
  the item or activity it was asked from.
- **Behaviour:** answers from the library entry, rephrased for the learner's level
  and illustrated with **their known vocabulary**. Ends with one check question.
- **Output:** `{ explanation, examples:[{native, translit, en}], checkQuestion,
  sourceIds:[], grounded:boolean }`
- **Evidence returned:** the check question's answer is graded by the engine and
  stored as an Attempt.

### 5.2 Conversation practice

- **Purpose:** natural conversation that gradually increases in difficulty.
- **Exists as:** Speak (`api/coach.js`). Kept, with the context packet replacing
  the brief, and `focus` items steering the topics.
- **Behaviour additions:** steer toward focus items (e.g. ask questions that invite
  the past tense); vocabulary control; correction policy by level; difficulty
  rises when the verdict is "good" several turns running (same principle as
  `challenge.js`).
- **Output:** the existing reply schema, plus `itemId` on corrections where they
  map to curriculum items, and `usedItems:[]` (target items the learner used
  correctly). These become Attempts with `setting: tutor, demand: use`.

### 5.3 Real-world scenarios (roleplay)

- **Purpose:** practise situations: ordering food, travelling, a job interview,
  meeting family.
- **Exists as:** Missions and custom scenarios. Extended so each **module task** is
  a roleplay whose objectives *are* the module outcomes.
- **Behaviour:** stays in role; the scene has objectives with checkable criteria;
  the tutor reports `objectives_met` (existing field) only when the learner
  actually did the thing; fail conditions are explicit (e.g. switching to English).
- **Evidence:** objectives met → `use`-type objective evidence for the module.

### 5.4 Writing corrections

- **Purpose:** the learner writes (a message, a short paragraph, a task answer)
  and gets corrections they understand and can act on.
- **Inputs:** context packet; the text (as a user turn); the task, if any.
- **Behaviour:** never rewrites the learner's meaning. Errors are limited by the
  correction policy and ranked by importance. For each, the tutor asks the learner
  to fix it first, then shows the correct form. A corrected version is given
  only after the learner's rewrite.
- **Output:**
  ```js
  { verdict: "clear"|"mostly-clear"|"unclear",
    errors: [{ span:[start,end], said, better, kind, why, ask, severity:"blocks-meaning"|"accuracy"|"style",
               patternId, itemId?, sourceIds:[] }],
    praise: string,           // one specific thing done well
    rewriteRequested: boolean,
    correctedText?: string }  // only after the learner's attempt
  ```
- **Evidence:** each error → failed Attempt on its item; correct uses of target
  items → successful Attempts. Grader is `ai` until calibrated (engine §6).

### 5.5 Personalised revision

- **Purpose:** "Quiz me on what I keep getting wrong."
- **Inputs:** context packet; the learner's due and weak ReviewItems (from the engine).
- **Behaviour:** the tutor runs a short, conversational quiz over those items. It
  varies the formats (translate this, say it differently, use it in a sentence),
  explains after each answer, and moves on.
- **Grading:** questions with a determinate answer are graded by the **engine's
  grader**, not the model. Open answers use the rubric path.
- **Evidence:** Attempts with `setting: review`, scheduled like any review.

## 6. Pronunciation

The current pipeline is the browser's speech recogniser plus lenient matching.
That measures whether **a recogniser understood the learner**, which is a useful
proxy for intelligibility, and nothing more. The tutor and UI must:

- describe results as "understood / not understood", never as a pronunciation
  score;
- give pronunciation *teaching* (articulation tips, minimal pairs, model audio)
  from the curriculum;
- add pronunciation assessment only with an audio pipeline built and validated for
  it (per language, against human ratings).

## 7. Prompts, models and versioning

- **Prompts are versioned files**, each with an ID that is logged with every tutor
  session. Changes go through the evaluation suite before release.
- **Model choice is deployment configuration** (`COACH_MODEL`, default the most
  capable available model; per-mode overrides allowed for cost).
- **Structured outputs everywhere** (JSON schema), as the coach already does, so
  the client never parses prose.

## 8. Evaluation

No tutor change ships without passing evaluation:

| Check | How |
|---|---|
| Schema validity | every response parses against its schema (automated) |
| Vocabulary level | share of tutor tokens outside known vocabulary + current items, per turn: A1 target ≤10% (automated, from the context packet) |
| Correction count and policy | corrections per turn within the level limit; prompts used before reveals (automated) |
| Accepting alternatives | golden cases where the learner's answer is a valid alternative must not be corrected (automated) |
| Accuracy of corrections | expert-reviewed golden set per course: flagged errors are real, real errors aren't missed (human, then LLM-as-judge calibrated against it) |
| Grounding | explanations cite library IDs; ungrounded answers are labelled (automated) |
| Safety and injection | learner turns that try to change the tutor's instructions are handled as language practice, not obeyed (automated red-team cases) |

For the pilot course, the golden set is about 50 scripted learner turns per mode,
written and reviewed by the course's language reviewer.

## 9. Security, privacy and cost

- Keys stay server-side (as now). Learner text stays in user turns (as now).
- **Authentication and per-user quotas** before the tutor is offered beyond
  personal use. Rate limits move from in-process memory to a shared store.
- **No raw transcripts stored by default.** Structured outcomes (errors, items,
  objectives met) are stored as Attempts. Transcript retention is opt-in, for
  quality review, with deletion on request (existing data-export path in
  `src/legal/exportData.js`).
- The AI disclosure UI (`AiDisclosure.jsx`) stays. Learners always know when they
  are talking to an AI.
- Cost is bounded per request (existing caps) and per user (quotas). Cost per
  learner-hour is tracked per mode.
