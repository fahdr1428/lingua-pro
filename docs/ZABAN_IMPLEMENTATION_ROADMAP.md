# Zaban — implementation roadmap

Five phases, in order. Each phase ends with a deliverable that is **verified**,
not just built: `npm run check` and the browser suite pass, new rules have tests
that are proven able to fail, and the existing 21 courses keep working.

**We do not jump to Phase 4.** Generating hundreds of lessons before the system
that makes lessons effective exists would produce content nobody can trust and
an engine that can't use it.

Sizes are relative (S ≈ days, M ≈ 1–2 weeks, L ≈ several weeks of focused work).
They are estimates for planning, not commitments.

---

## Phase 1 · Educational foundation — *this document set*

**Deliverable:** the complete educational architecture. ✔ written:
[audit](ZABAN_CURRENT_STATE_AUDIT.md) · [vision](ZABAN_PRODUCT_VISION.md) ·
[educational architecture](ZABAN_EDUCATIONAL_ARCHITECTURE.md) ·
[curriculum framework](ZABAN_CURRICULUM_FRAMEWORK.md) ·
[learning engine](ZABAN_LEARNING_ENGINE.md) · [AI tutor](ZABAN_AI_TUTOR_SPEC.md) ·
[technical architecture](ZABAN_TECHNICAL_ARCHITECTURE.md) ·
[example lesson](ZABAN_EXAMPLE_LESSON.md)

Remaining to close the phase:

| Task | Owner | Done when |
|---|---|---|
| Owner decisions (below) | owner | recorded in this file |
| Recruit a qualified reviewer for the pilot course (linguistic + pedagogical) | owner | reviewer engaged |
| Review the Urdu A1 module map and the example lesson | reviewer | review checklist completed, changes applied |
| Agree mastery thresholds and skill-profile rules | owner + reviewer | config values signed off |

## Phase 2 · Core learning engine

**Deliverable:** a functional teaching system that can run an authored lesson end
to end, alongside today's generated lessons.

| # | Work | Size | Acceptance criteria |
|---|---|---|---|
| 2.1 | **Curriculum schema and validator.** JSDoc types, `validate-curriculum` in `npm run check`, curriculum folder layout, build step producing per-course chunks | M | Validator rejects each class of defect it claims to (mutation-proven); eager bundle stays ≤1000KB |
| 2.2 | **Migrate the pilot pack to ContentItems** with the same ids, plus status `legacy-unreviewed` and provenance | S | Every existing learner card maps to an item; generated lessons unchanged (browser suite) |
| 2.3 | **Attempt log and mastery stages**, local, run in *shadow mode* first (computed and logged, not yet shown) | M | Stage rules unit-tested with mutation proofs; simulation over real lessons shows no item reaches Recall from recognition alone |
| 2.4 | **Activity registry and LessonRunner.** Port existing exercise types one at a time behind the registry; generated lessons use the same renderers | L | All 25 browser scripts pass at each step; one browser script per renderer |
| 2.5 | **New A1 activity types**: `cloze_write`, `construct`, `transform`, `error_correction`, `dialogue_complete`, `listen_comprehension` | M | Each has validation, grading, renderer, feedback, and a browser test |
| 2.6 | **Structure and function items in the scheduler** | M | Scheduler tests per item type; v113 rating policy applies to all |
| 2.7 | **Authored-lesson playback**: the reviewed example lesson runs through all seven phases, with assessment, feedback and revision scheduling | M | Browser test plays the lesson; assessment without hints; feedback lists per-objective results; items scheduled |
| 2.8 | **Fix the map's claims** (early, all languages): each journey stop is attached to the unit that teaches its exchange, or its claim is reworded to what its unit teaches | S | A validator checks every stop's model answer against its unit's words (the audit's measurement, made a gate) |

## Phase 3 · Personalisation

**Deliverable:** a personalised learning experience where lessons, reviews and the
tutor share one learner model.

| # | Work | Size | Acceptance criteria |
|---|---|---|---|
| 3.1 | **Accounts and sync** (Supabase via `StorageAdapter`), optional sign-in, consent, local-data migration on sign-in, export and delete | L | Offline still works signed-out; sync merges attempts without loss (tests); CSP updated |
| 3.2 | **Skill profile** (seven skills, confidence, "not enough evidence", estimated band) and mastery UI; the map ✓ awarded per module outcome | M | No score shown below the evidence minimum; profile values reproducible from attempts |
| 3.3 | **Learner-context packet** and **`/api/tutor`** consolidation (existing endpoints as aliases) | M | Packet within budget; contract tests on recorded responses |
| 3.4 | **Tutor modes**: Explain, Writing corrections, Personalised revision (Conversation and Roleplay upgraded) | L | Evaluation suite thresholds met (tutor spec §8) on the pilot golden set |
| 3.5 | **Cross-system loop**: tutor errors → Attempts; focus items → tutor; remedial-before-new on Home | M | The worked example (educational architecture §5) reproduced in a browser test |
| 3.6 | **Auth and quotas on AI endpoints**; rate limits in a shared store | M | Unauthenticated calls refused; quota enforced (tests) |
| 3.7 | **Diagnostic placement** (Pre-A1–A2), parallel forms | M | Seeds stages no higher than Recall; labelled as an estimate |
| 3.8 | **Learning analytics** events and an internal learning dashboard (engagement shown separately) | M | Metric definitions implemented exactly as in learning engine §9, with tests on synthetic data |

## Phase 4 · Curriculum development

**Deliverable:** substantial, quality-controlled content for one course.

| # | Work | Acceptance criteria |
|---|---|---|
| 4.1 | Urdu **Pre-A1**: bring Chapter 0 into the curriculum model (script and sound items with state) | Script items scheduled; reading test feeds the skill profile |
| 4.2 | Urdu **A1, module by module** (9 modules, 4–6 lessons each + module task), starting with Module 4 (the example lesson's module), then 1–3 | Each lesson passes the review checklist and `validate-curriculum`; status `approved` only after both reviews |
| 4.3 | **Audio** recorded by native speakers of the declared variety for every approved item and dialogue | Audio index complete for approved content |
| 4.4 | **Explanation library** for every A1 structure, reviewed | Tutor Explain mode grounded for all A1 structures |
| 4.5 | **Tutor golden sets** per module (≈50 turns per mode) | Written and reviewed by the course reviewer |

AI may draft lessons, examples and exercises in this phase, as `draft` content
only. Nothing AI-drafted is approved without both reviews.

## Phase 5 · Testing and refinement

**Deliverable:** evidence that Zaban helps people learn.

| # | Work | Acceptance criteria |
|---|---|---|
| 5.1 | Pilot cohort (e.g. 30–50 learners of the pilot course), with consent | Diagnostic at start, parallel form after ~6 weeks |
| 5.2 | Measure delayed retention, independent production, transfer and skill progression | Dashboard reports, with confidence intervals |
| 5.3 | Observe sessions (interviews, recordings with consent) | Usability issues logged and prioritised |
| 5.4 | Refine lessons flagged by the dashboard; tune scheduler and mastery thresholds on real data | Changes re-measured |
| 5.5 | Decide the next step: A2 for the pilot course, a second course, native apps | Decision recorded with the evidence behind it |

---

## Decisions needed from the owner

| # | Decision | Recommendation |
|---|---|---|
| 1 | **Pilot course** | Urdu A1. It is central to Zaban's positioning, has the most existing content among the underserved languages, and covers every hard case: RTL script, romanisation, formality, gender, and variety. Spanish would be easier to staff with reviewers, but it is not where Zaban is different. |
| 2 | **Pilot variety and register** | Urdu as spoken in Pakistan, everyday polite register, Nastaliq script + romanisation. Hindi is noted where it differs, but not taught. |
| 3 | **Reviewer** | One qualified Urdu teacher for linguistic and pedagogical review (two people if possible). Budget is needed. Phase 4 cannot be approved without them. |
| 4 | **Backend** | Supabase for auth and learner data, behind the existing adapter |
| 5 | **AI access** | Tutor requires sign-in; free quota plus paid tier; quotas enforced server-side |
| 6 | **The other 20 languages** | Keep working as practice courses (no CEFR labels). No new content for them until the pilot is validated. The map-claims fix (2.8) applies to all. |
| 7 | **Native apps** | Defer to Phase 5; keep the core framework-free so either route works |
| 8 | **Analytics consent** | Opt-in, own database only, no third-party SDK |

## Explicitly not doing now

- Generating lessons at scale with AI.
- Adding languages.
- Introducing React Native or another UI framework.
- Showing CEFR levels or certificates as achievements.
- Claiming pronunciation assessment.

## First three tasks after sign-off

1. **2.1 + 2.2**: curriculum schema, `validate-curriculum`, and the Urdu pack
   migrated to ContentItems with unchanged ids. No change visible to learners.
2. **The example lesson as data**: encode [ZABAN_EXAMPLE_LESSON.md](ZABAN_EXAMPLE_LESSON.md)
   as `content/curriculum/ur-PK/A1/04-food/01-ordering.json` with status `draft`.
   It is validated, not shipped. The reviewer's changes are applied there.
3. **2.8**: fix the map's claims, since learners see them today.
