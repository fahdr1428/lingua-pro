# Zaban — technical architecture

How the product architecture maps onto the code that exists, and how to get there
without a rewrite. Principle from the brief: **respect the existing
architecture**. No new frameworks or services unless they are needed.

## 1. Today

```
 Browser (PWA, offline-capable)
 ┌─────────────────────────────────────────────────────────────────┐
 │ React UI  src/screens/*, src/ui/*                                │
 │   Lesson.jsx (generated lessons), Home, JourneyMap, Speak, …     │
 │ Engine    src/engine/*  (pure JS: srs, selector, generator,      │
 │           recall, challenge, speaking, explain, profile, …)      │
 │ Content   src/data/languages/<code>.json + src/data/*.js         │
 │ Storage   StorageAdapter → localStorage   (Supabase: stub)       │
 └───────────────▲─────────────────────────────────────────────────┘
                 │ fetch /api/*
 ┌───────────────┴─────────────────────────────┐
 │ Vercel functions  api/coach · scenario · decode │──▶ Anthropic API (key server-side)
 └─────────────────────────────────────────────┘
```

Strengths to keep: the engine has no UI dependency; content is data, validated by
the 43-step `npm run check`; 25 browser test scripts; strict CSP; offline
service worker; the AI key never reaches the client.

## 2. Platform: web now, native later, one shared core

The brief assumes React Native / Expo. **The project is a Vite + React web app**,
and that is the right base to grow from now:

- It works on every phone today through the browser, and installs as a PWA.
- Introducing React Native means a second UI codebase before the curriculum it
  would display exists.

What makes native possible later is **keeping the core framework-free**:

- `src/engine/` (and the new curriculum, assessment and learner modules below)
  import nothing from React or the DOM. This is already true of the engine and
  becomes a checked rule (a validator fails the build if a core module imports
  React, `window` or `document`).
- When a native app is justified (Phase 5 evidence, store presence, offline audio,
  notifications), the options are a native shell around the web app (e.g.
  Capacitor) or an Expo app consuming the same core as a package. That decision
  is deferred until there is a validated curriculum to ship. Either way, the core
  is shared, not rewritten.

## 3. Target architecture

```
 Interfaces           Web (React PWA) ··· later: iOS / Android
                              │
 Shared core (pure JS, no React/DOM) — src/core/* (initially the existing src/engine/)
 ┌──────────────┬───────────────────┬──────────────────┬────────────────────┐
 │ Curriculum   │ Assessment        │ Revision         │ Learner model      │
 │ load, query, │ answer pipeline,  │ FSRS-lite over   │ attempts, item     │
 │ lesson plans │ mastery stages,   │ all item types,  │ stages, skills,    │
 │              │ objective status  │ review builder   │ context packet     │
 └──────────────┴───────────────────┴──────────────────┴────────────────────┘
                              │
 Services (Vercel functions)  /api/tutor (5 modes) · /api/sync · auth (Supabase)
                              │
 Data                Content: versioned JSON in the repo, compiled per course
                     Learner data: StorageAdapter → local first, synced to Supabase
```

No new microservices. Three things are added: Supabase (auth and the learner-data
database, where the adapter stub already points), one consolidated tutor function,
and a sync function.

## 4. Data model

Content entities (authored, versioned, in the repo) and learner entities (per
user, in storage). JSDoc typedefs, validated at build time and at load. A
TypeScript migration is not required for this.

### Content

```js
/** @typedef {{ id:string, name:string, varieties:string[] }} Language */
/** @typedef {{ id:string, languageId:string, variety:string, register:string,
 *              scripts:string[], romanisation:string, levels:string[], status:Status }} Course */
/** @typedef {{ id:string, courseId:string, cefr:"PreA1"|"A1"|"A2"|"B1"|"B2"|"C1"|"C2",
 *              moduleIds:string[] }} Level */
/** @typedef {{ id:string, levelId:string, title:string, outcomes:string[],   // can-do
 *              functions:string[], structureIds:string[], prerequisites:string[],
 *              lessonIds:string[], taskActivityId:string, status:Status }} Module */
/** @typedef {{ id:string, moduleId:string, title:string, minutes:[number,number],
 *              objectiveIds:string[], newItemIds:string[], reviewItemIds:string[],
 *              phases:{ recall:Phase, introduction:Phase, teaching:Phase, guided:Phase,
 *                       application:Phase, assessment:Phase, feedback:Phase },
 *              status:Status, provenance:Provenance, reviews:Review[] }} Lesson */
/** @typedef {{ id:string, type:"recognise"|"recall"|"construct"|"use"|"understand",
 *              canDo:string, condition:string, criterion:string, skills:string[],
 *              itemIds:string[] }} Objective */
/** @typedef {{ id:string, type:"lexical"|"structure"|"pattern"|"function"|"sound"|"script",
 *              courseId:string, native?:string, translit?:string, gloss:string,
 *              pos?:string, gender?:string, examples:Example[], audio?:string,
 *              explanationId?:string, variants?:Record<string,{native:string,translit?:string}>,
 *              commonMistakes?:{pattern:string, feedback:string}[], cefr?:string,
 *              difficulty?:number, status:Status, provenance:Provenance, reviews:Review[] }} ContentItem */
/** @typedef {{ id:string, type:string, objectiveId:string, itemIds:string[],
 *              demand:"recognise"|"recall"|"construct"|"use", skills:string[],
 *              instructions:string, prompt:any, accepted:string[], alternatives:string[],
 *              hints:string[], explanation:string, feedback:Record<string,string>,
 *              scoring:{ grader:"rules"|"ai"|"human", rubricId?:string, pass?:number },
 *              difficulty:number, variants?:object[] }} Activity */
/** @typedef {"draft"|"linguistic-review"|"pedagogical-review"|"validated"|"pilot"|"approved"|"legacy-unreviewed"|"retired"} Status */
/** @typedef {{ author:string, origin:"human"|"ai-draft"|"imported", sources:string[], createdAt:string }} Provenance */
/** @typedef {{ reviewer:string, role:"linguist"|"educator", date:string,
 *              verdict:"approved"|"changes"|"rejected", checklist:Record<string,boolean>, notes:string }} Review */
```

### Learner

```js
/** Attempt — see ZABAN_LEARNING_ENGINE.md §1 */
/** @typedef {{ learnerId:string, itemId:string, stage:"new"|"introduced"|"knowledge"|"recall"|"application"|"secure",
 *              card:FsrsCard, attemptsSummary:{ok:number, fail:number, novelOk:number, sessions:number},
 *              updatedAt:number }} SkillState      // one per learner × item; holds the review schedule (ReviewItem) */
/** @typedef {{ learnerId:string, itemId:string, due:number, reason:"scheduled"|"weak"|"tutor-error" }} ReviewItem */
/** @typedef {{ id:string, learnerId:string, mode:"explain"|"conversation"|"roleplay"|"writing"|"revision",
 *              courseId:string, lessonId?:string, startedAt:number, endedAt?:number,
 *              promptVersion:string, model:string, outcomes:{ objectivesMet:string[], attemptIds:string[] } }} TutorSession */
```

`ReviewItem` is a view over `SkillState.card.nextReview` plus queued tutor errors.
It does not need a separate store.

### Continuity with today's data

- Every existing word becomes a `lexical` ContentItem **with the same id**
  (`ur_0034`), so every learner's FSRS card carries over unchanged.
- Existing cards become SkillStates. Their stage is derived by the legacy rule in
  [learning engine §2](ZABAN_LEARNING_ENGINE.md).
- Units become *legacy modules* for the 20 non-pilot languages. Journey stops
  become module outcomes once modules are realigned.
- Grammar moments become `structure` items with explanation-library entries.

## 5. Content pipeline

```
content/curriculum/<course>/
  course.json
  items/*.json              ContentItems (incl. migrated pack words)
  explanations/*.json       explanation library (structure items)
  <level>/<module>/module.json
  <level>/<module>/<lesson>.json
        │
        ▼  npm run validate-curriculum   (in npm run check)
        │    schema · ids resolve · every activity → objective · every objective assessed
        │    · accepted answers grade as correct with the real grader · scripts/romanisation
        │    · new-item load per level · prerequisites taught earlier · status/provenance present
        ▼  npm run build-curriculum
  public/curriculum/<course>.<hash>.json   lazily loaded per course (cached by the service worker)
```

- **Content is separate from components.** A new lesson, module or course is a
  data change: no new screen.
- **Per-course chunks.** The eager bundle is at 996KB of its 1000KB source budget
  (`validate-content-index`). Curriculum must load per course, on demand.
- **Authoring.** Lessons are written in JSON (or a CSV/Markdown form converted by
  a script, extending today's `import-vocab`). A reviewer UI can come later. The
  review record lives in the file and is checked by the validator.
- **Approved only.** Production builds include only content at `approved`
  (plus `legacy-unreviewed` for the existing courses). Pilot builds can include
  `pilot` content.

## 6. The activity system

One registry maps each activity type to everything needed to run it:

```js
// src/core/activities/registry.js
registerActivity("recall_write", {
  validate: (cfg) => …,           // content-time validation
  demand: "recall", skills: ["vocabulary", "writing"],
  grade: (cfg, response, ctx) => …, // deterministic (recall.js) or rubric
});
// src/ui/activities/RecallWrite.jsx — the renderer, registered by type
```

`Lesson.jsx` (141KB, one large switch) is refactored **incrementally** into a
`LessonRunner` that walks a lesson's phases plus per-type renderer components.
Generated review sessions use the same renderers.

| Brief's activity | Existing type(s) | New |
|---|---|---|
| Multiple choice | pick_meaning, pick_word, listen_pick, true_false | — |
| Vocabulary recall | recall_write, speak_prompt (recall) | — |
| Word association | match_pairs, odd_one_out | — |
| Fill in the blanks | complete_sentence (options) | `cloze_write` (typed) |
| Sentence ordering | tap_words, build_sentence | — |
| Sentence construction | Sentence Lab (screen) | `construct` (from a prompt, graded by rules + rubric) |
| Translation | type_translation (to English) | `translate_write` (into the target language) |
| Grammar correction | — | `error_correction` |
| Grammar transformation | conjugate, conjugate_tense | `transform` (generalises both) |
| Listening comprehension | listen_pick (word level), Listen stream | `listen_comprehension` (recording + questions) |
| Reading comprehension | Reading screen | `read_comprehension` (as an activity) |
| Writing | — | `write_task` (tutor writing mode) |
| Dialogue completion | — | `dialogue_complete` |
| AI roleplay | Missions, Speak | `roleplay` (module tasks) |
| Speaking / pronunciation | speak_prompt (echo, shadow, recall, sentence) | `minimal_pair` (listening discrimination) |

## 7. Learner data, accounts and sync

- **Local first.** The app keeps working offline exactly as now. All learner
  writes go through `StorageAdapter`.
- **Supabase for accounts and sync.** It is where the existing adapter stub
  points, and it provides auth and Postgres without a custom backend. Tables:
  `learners`, `attempts` (append-only), `skill_states`, `tutor_sessions`,
  `settings`. Row-level security limits each learner to their own rows.
- **Sync.** Attempts are appended locally and uploaded in batches; skill states
  are recomputed from attempts, so conflicts resolve by merging attempts, not by
  last-write-wins on derived state.
- **Migration on sign-in.** Existing localStorage progress is uploaded once and
  converted (cards → skill states).
- **Accounts are optional at first.** Signed-out use stays possible; analytics and
  cross-device need sign-in and consent.

## 8. Services, security and privacy

- **`/api/tutor`** consolidates `coach`, `scenario` and `decode` behind a `mode`
  parameter, keeping the existing endpoints as thin aliases until clients move.
  It builds the prompt from the learner-context packet (sent by the client and
  size-checked) and returns schema-validated JSON.
- **Auth on AI endpoints** (Supabase JWT) and **per-user quotas** in the database.
  Rate limits leave process memory.
- **Existing rules stay:** keys server-side only, never with a `VITE_` prefix;
  learner text in user turns, never the system prompt; `/api/*` responses never
  cached; strict CSP (the Supabase origin is added to `connect-src`).
- **Privacy:** analytics events only with consent; no third-party analytics SDK
  (consistent with the current policy). Learning events go to the app's own
  database. Data export and deletion (existing export path) cover attempts and
  tutor sessions. No raw tutor transcripts stored by default.

## 9. Testing

| Area | Tests |
|---|---|
| Curriculum | `validate-curriculum`: schema, references, objective coverage, accepted answers pass the real grader, level load limits, provenance/status |
| Answer evaluation | extend `test-recall` (every accepted answer and alternative in every lesson grades correct; every listed common mistake grades wrong with its feedback) |
| Mastery and progression | unit tests for stage rules, with mutation proofs; simulated learners (as `test-challenge` does) over real lessons |
| Scheduling | `test-engine` extended to item types; ratings per evidence type |
| Tutor | schema contract tests with recorded responses (in `npm run check`, no network); live evaluation suite against the API (pre-release, not in CI) |
| UI | one browser script per activity renderer; the lesson runner played end to end for every pilot lesson; existing 25 scripts kept |
| Core purity | a validator that fails if `src/core/**` imports React or touches the DOM |

## 10. Performance budgets

- Eager bundle ≤ 1000KB of source (currently 996KB). New screens and the lesson
  runner's heavy parts load on demand.
- Curriculum per course is loaded on demand and cached offline.
- Tutor round-trip: response streaming where the UI benefits. Caps on tokens and
  history, as now.
