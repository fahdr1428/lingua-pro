# Zaban — current-state audit

*Phase 1, step 1. Written before any architectural change, from the code as it
stands at v113 (`b725866`). Every number here was measured from the repository;
where a judgement is made, it is labelled as one.*

The seven architecture documents build on this one:

| Document | Answers |
|---|---|
| [ZABAN_PRODUCT_VISION.md](ZABAN_PRODUCT_VISION.md) | What Zaban is, who it is for, what it will not do |
| [ZABAN_EDUCATIONAL_ARCHITECTURE.md](ZABAN_EDUCATIONAL_ARCHITECTURE.md) | How Zaban teaches, and how the three systems connect |
| [ZABAN_CURRICULUM_FRAMEWORK.md](ZABAN_CURRICULUM_FRAMEWORK.md) | How courses, levels, modules and lessons are organised and quality-controlled |
| [ZABAN_LEARNING_ENGINE.md](ZABAN_LEARNING_ENGINE.md) | Evidence, mastery, scheduling, activity selection, analytics |
| [ZABAN_AI_TUTOR_SPEC.md](ZABAN_AI_TUTOR_SPEC.md) | The five tutor modes, the learner context, grounding and evaluation |
| [ZABAN_TECHNICAL_ARCHITECTURE.md](ZABAN_TECHNICAL_ARCHITECTURE.md) | Data model, content pipeline, services, migration from today's code |
| [ZABAN_IMPLEMENTATION_ROADMAP.md](ZABAN_IMPLEMENTATION_ROADMAP.md) | Phases, deliverables, acceptance criteria, decisions needed |
| [ZABAN_EXAMPLE_LESSON.md](ZABAN_EXAMPLE_LESSON.md) | One complete lesson in the proposed format (Urdu A1, draft for review) |

---

## 1. What the codebase actually is

| Area | What exists | Notes |
|---|---|---|
| Platform | **Vite + React 18 single-page web app**, installable as a PWA with an offline service worker | The master specification assumes React Native / Expo. There is no React Native or Expo code in the repository. See §7 and the technical architecture for what this means. |
| Hosting | Vercel. `main` deploys to production. | Strict CSP and security headers in `vercel.json`. |
| Runtime dependencies | `react`, `react-dom`, `@anthropic-ai/sdk` | Deliberately minimal. |
| Server | Three Vercel serverless functions: `api/coach.js` (conversation turns), `api/scenario.js` (builds a mission from a free-text situation), `api/decode.js` (breaks down a pasted real message) | Anthropic key server-side only. Each degrades to `501 {configured:false}` without a key. Rate limiting is in-process (`api/_guard.js`) and resets on cold start; there is no authentication. |
| Persistence | `StorageAdapter` interface (`src/storage/`), implemented by `localStorageAdapter.js`. `supabaseAdapter.js` is a stub. | **No accounts, no sync across devices, no server-side learner data.** Progress lives in one browser. |
| Analytics | None. `src/legal/policies.js` states "No analytics product is embedded in this app." | There is currently no way to measure learning outcomes across learners. |
| Engine | Pure JavaScript, no React, in `src/engine/` | The most reusable part of the codebase. |
| Tests | `npm run check` runs 43 steps: content validators, engine tests, interface audits, and finally the build. Plus 25 Playwright browser scripts (`scripts/verify-*.mjs`). | Unusually strong for a project this size. Every content and engine change is validated. |

### The engine, file by file

| File | Responsibility |
|---|---|
| `srs.js` | FSRS-lite scheduler: stability, difficulty, retrievability, ratings AGAIN/HARD/GOOD/EASY |
| `selector.js` | Picks which words a session is about (due, weak, new, topic) |
| `generator.js` | Builds a lesson's exercises at runtime from words + SRS state. 17 exercise types. |
| `Engine.js` | Facade the UI talks to: sessions, answers, stats, unit progress |
| `recall.js` | Grades a word written from memory: script or romanisation, keyboard variants, accents, articles, other real words, synonyms, hints |
| `challenge.js` | Adjusts difficulty within a lesson toward a target success band |
| `speaking.js` | Speaking ladder: echo → recall → shadow → build a sentence |
| `explain.js` | Templated explanations after a wrong answer, plus hand-written ones for famous confusions |
| `profile.js` | The AI tutor's learner model: recurring error patterns, topic confidence, missions, words spoken |
| `fluency.js` | Speaking-fluency estimates from tutor turns |
| `grammarChecks.js` | Builds checks from grammar lessons |
| `coach.js`, `encourage.js`, `explore.js`, `gamification.js`, `games.js`, `inputStream.js` | Home-screen next step, end-of-lesson encouragement, Practice tab, XP/levels, Word Rush, listening stream |

## 2. Target languages and existing course structure

Zaban positions itself (README) as "Duolingo for the languages Duolingo ignores —
Urdu, Persian, Hindi, Arabic and friends, alongside the usual suspects." It ships
**21 languages**: ar, bn, de, es, fa, fr, hi, id, ja, ko, ml, pa, pcm, so, ta, tl,
tr, ur, vi, yo, zh.

The course structure is the same for every language:

```
Language pack (src/data/languages/<code>.json)
  └─ units[]            6–13 thematic word lists ("Greetings", "Food & Drink", …)
       └─ vocab[]       words: id, lemma, translit, translation, unit, category,
                        difficulty, frequencyRank, examples[{native, translit, translation}],
                        optional note, optional dialect forms
Chapters               every 3 units (UNITS_PER_CHAPTER), gated by a chapter exam (70%)
Journey (journey.js)   6–12 "stops" per language: a can-do sentence + a two-line exchange,
                        attached to a unit by position (unitIndex)
Chapter 0              script course and reading test for non-Latin scripts
Alongside:             grammar moments (grammar.js), Sentence Lab patterns, reading passages,
                        conversations, 10 shared missions, Speak (AI coach), Decode (AI)
```

**There is no lesson object.** A "lesson" is assembled at runtime by
`generateLesson` from the current unit's words and the learner's SRS state, with
one grammar moment spliced in. The grammar moment is the next one the learner
hasn't seen, so it is not related to what the lesson is about.

## 3. Content, measured

| Lang | Words | Units | Journey stops | Grammar lessons | Conversations | Passages |
|---|---|---|---|---|---|---|
| ar | 278 | 12 | 12 | 5 | 10 | 4 |
| bn | 232 | 10 | 9 | 4 | 10 | 1 |
| de | 277 | 13 | 12 | 5 | 10 | 4 |
| es | 269 | 13 | 12 | 6 | 11 | 3 |
| fa | 240 | 8 | 8 | 5 | 10 | 0 |
| fr | 261 | 13 | 12 | 6 | 11 | 2 |
| hi | 256 | 12 | 12 | 6 | 10 | 4 |
| id | 245 | 6 | 6 | 4 | 10 | 4 |
| ja | 251 | 11 | 9 | 5 | 10 | 1 |
| ko | 266 | 13 | 9 | 4 | 10 | 1 |
| ml | 237 | 8 | 8 | 4 | 10 | 0 |
| pa | 245 | 6 | 6 | 4 | 10 | 4 |
| pcm | 255 | 6 | 6 | 4 | 10 | 4 |
| so | 237 | 8 | 8 | 4 | 10 | 0 |
| ta | 234 | 8 | 8 | 4 | 10 | 0 |
| tl | 234 | 8 | 8 | 4 | 10 | 0 |
| tr | 277 | 12 | 12 | 5 | 10 | 4 |
| **ur** | **264** | **13** | **12** | **6** | **11** | **4** |
| vi | 228 | 8 | 8 | **0** | 6 | 0 |
| yo | 220 | 8 | 8 | **0** | 6 | 0 |
| zh | 255 | 13 | 9 | 5 | 10 | 1 |

5,261 words in total. Every word has at least one example sentence. 55 carry a
teaching note. Words with dialect forms exist for a few languages (49 in Arabic).

**What the content is, in CEFR terms (a judgement):** a vocabulary base and
a handful of grammar notes in the Pre-A1 to early-A1 range, for each of 21
languages. None of it is labelled with a CEFR level. Nothing records who wrote or
reviewed a given item.

What is strong:
- Every word sits in a real sentence, with romanisation for non-Latin scripts
  (validated by `validate-word-truth`, `validate-translit`, `validate-word-frames`).
- The answer grader (`recall.js`) is fair across five scripts, tested on every
  word and every pair of different words.
- Register, script and variety are taken seriously: the Urdu tum/aap/tu grammar
  card, the Arabic dialect forms, the regional coach personas.
- The AI coach already gives structured, pedagogically sound corrections
  (elicitation prompts rather than recasts) and holds a learner profile.

## 4. The most significant educational shortcomings

Ranked by how much each limits Zaban's ability to teach people to *use* a language.

1. **No authored lessons, so no objectives and no teaching.** Lessons are word
   drills assembled from a list. Nothing teaches a *structure* or a *function*
   ("ask for something politely", "say what you did yesterday") as the subject of
   a lesson. Grammar arrives as a rotating card unconnected to the lesson topic.
   This is the "Lesson 4: Food vocabulary" pattern the brief warns against.

2. **The map's can-do claims don't match what the units teach.** Journey stops
   are attached to units by position. In Urdu, the unit "Food & Drink" carries the
   claim "You can ask them a question back", "Numbers 1–10" carries "You can say
   where you're from", and "Places" carries "You can ask for something you want".
   Across Urdu and Spanish, most stops' model answers use none of their unit's
   words. Since v113 the ✓ waits for the unit's words to be produced from memory,
   which is more honest about *words*, but it still certifies a capability the
   unit never taught.

3. **The learner model only knows words.** The scheduler tracks one card per word.
   Grammar points, sentence patterns and communicative functions have no state,
   so the system cannot know whether someone can form a polite request, only
   whether they can produce the word "water".

4. **Two learner models that never meet.** Lesson progress (`Engine` SRS cards)
   and the tutor's profile (`profile.js`) are separate stores. Lessons never write
   to the profile. The tutor's brief (`summariseForPrompt`) contains a difficulty
   level, recurring errors and topic confidence, but not the words the learner
   knows, the current lesson, or its objectives. A struggle in a lesson cannot
   reach the next conversation, and a mistake in conversation cannot schedule
   lesson practice.

5. **Skills are not measured separately.** There is no estimate for listening,
   reading, writing, speaking or interaction. The fluency dial measures spoken
   accuracy and responsiveness only.

6. **Breadth before depth.** Twenty-one shallow courses rather than one complete
   one. Vietnamese and Yoruba have no grammar lessons at all. A learner cannot
   currently progress past roughly early A1 in any language.

7. **No content provenance or review state.** Validators check *form* (script,
   romanisation, the word appearing in its example) thoroughly. Nothing records
   whether a qualified speaker has reviewed an item, so reviewed and unreviewed
   content are indistinguishable.

8. **No way to measure learning outcomes.** No accounts and no analytics means no
   delayed-retention measurement across learners, no diagnostic-to-later
   comparison, nothing beyond one person's device.

9. **Pronunciation is not assessed.** Speech uses the browser's speech
   recogniser with lenient matching. That establishes "a recogniser understood
   it", not pronunciation quality. The app is careful not to claim more; the new
   architecture must keep it that way.

## 5. Existing features mapped to the three systems

| Proposed system | What already exists | Gap |
|---|---|---|
| **01 Learning Academy** (courses, levels, modules, lessons, objectives) | Packs, units, chapters, chapter exams, journey stops, Chapter 0 script course, grammar moments, Sentence Lab, reading passages, conversations | No authored lessons, objectives or CEFR levels. Stops misaligned with units. Grammar unconnected to topics. |
| **02 Adaptive Learning Engine** (selection, evaluation, mastery, spacing, diagnostics) | FSRS-lite, evidence-weighted ratings, recall counting, graduated exercise ladder, in-lesson challenge, recall grader, leech handling, skip-ahead placement, recovery round, explanations | Items are words only. No skill profile, no mastery states beyond `canRecall`, no attempt log, no diagnostics beyond placement. |
| **03 AI Language Tutor** (explain, converse, roleplay, correct writing, revise) | Speak (conversation coach with structured corrections, personas, regional varieties, pressure), Missions (10 roleplays with objectives and fail conditions), custom scenarios, Decode (real messages) | No Explain mode, no writing-correction mode, no AI revision mode. Tutor context lacks known vocabulary and lesson objectives. No auth or per-user quota. |

## 6. Reusable components

These should be kept and built upon, not rewritten:

- **`src/engine/` as a whole.** Pure JS with no UI dependency, so it can serve a
  web app and a future native app unchanged.
- **`recall.js`.** The production-answer grader; becomes the deterministic first
  pass of answer evaluation for all short-answer activities.
- **`srs.js` + v113 rating policy.** Becomes the scheduler for every reviewable
  item (words, structures, functions), not only words.
- **`challenge.js`.** In-lesson difficulty control, unchanged in principle.
- **`profile.js` error patterns and its "never invent a number" rule.** Becomes
  part of the unified learner model.
- **The coach's structured-correction schema** (`api/coach.js`): prompts before
  recasts, at most one correction per turn for beginners, "a native speaker would
  understand it" as the bar for "good".
- **`StorageAdapter`.** The seam for adding accounts and sync without touching the
  engine or UI.
- **The validation culture.** `npm run check` and the browser suite are the
  quality gate for the curriculum pipeline too.

## 7. What the brief assumes that isn't so

- **React Native / Expo.** Not present. Recommendation: do not introduce it now.
  Keep the engine and curriculum as framework-free modules that a native shell can
  consume later. See [ZABAN_TECHNICAL_ARCHITECTURE.md §2](ZABAN_TECHNICAL_ARCHITECTURE.md).
- **Authentication and a backend.** Not present. Accounts are a precondition for
  cross-device learning, outcome measurement and an AI tutor that can be offered
  safely at scale. See the roadmap, Phase 3.
- **A single target language.** There are 21. The brief's own principle ("a fully
  developed A1 course is much better than six shallow levels") argues for choosing
  one pilot. The documents recommend **Urdu A1**, pending the owner's decision
  (see [ZABAN_IMPLEMENTATION_ROADMAP.md, Decisions](ZABAN_IMPLEMENTATION_ROADMAP.md#decisions-needed-from-the-owner)).
