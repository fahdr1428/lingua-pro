# Zaban — educational architecture

How Zaban teaches. The curriculum structure is in
[ZABAN_CURRICULUM_FRAMEWORK.md](ZABAN_CURRICULUM_FRAMEWORK.md). The mechanics of
evidence and mastery are in [ZABAN_LEARNING_ENGINE.md](ZABAN_LEARNING_ENGINE.md).

## 1. The learning goal

Learners progress from **supported recognition** to **independent
communication**, along four stages that every taught item passes through:

| Stage | The learner can… | Evidence |
|---|---|---|
| **Knowledge** | recognise and understand it when it is in front of them | correct recognition (choose, match, comprehend) |
| **Recall** | retrieve it without options or hints | unaided production (write, say, construct) |
| **Application** | use it in a situation they haven't practised | success in a new context: a different sentence, a roleplay, free writing |
| **Retention** | still do it after time has passed | success on a delayed review, in a format not just seen |

"Item" means any taught unit of language: a word or phrase, a grammar structure,
a sentence pattern, or a communicative function ("make a polite request").

## 2. Principles, and what each means in practice

| Principle | In practice | Already in Zaban? |
|---|---|---|
| **Retrieval practice** | Learners pull language out of memory, not just re-read it. Recall beats recognition (Kang, McDermott & Roediger 2007; Carpenter & DeLosh 2006). | Yes, since v113: write-from-memory questions, recall-first rungs |
| **Spaced practice** | Reviews are spread out and scheduled by forgetting. The brief cites a meta-analysis of 48 experiments with 3,411 L2 learners finding medium-to-large benefits. | Yes for words (FSRS-lite). No for grammar or functions. |
| **Semantic elaboration** | New items are met in meaningful sentences and connected to what the learner knows. | Partly: every word has an example sentence, but no learner-generated sentences |
| **Scaffolding** | Support is given, then withdrawn: model → guided (hints, options) → independent. | Partly: the exercise ladder and hints, but not organised around an objective |
| **Interleaving** | Reviews mix item types and topics rather than blocking them. | Yes for words (interleaved reviews) |
| **Contextual learning** | Language is taught in the situations where it is used. | Weak: units are topics, not situations |
| **Active production** | Every lesson requires the learner to produce language: words, then sentences, then exchanges. | Partly: from-memory and speaking steps, sentence building |
| **Corrective feedback** | Errors are explained, and learners are pushed to self-correct where possible. Prompts (clarification requests, elicitation) are preferred over recasts for learner uptake (Lyster & Ranta 1997). | Yes in the AI coach; templated in lessons |
| **Appropriate challenge** | Most answers right, enough wrong that each takes effort. Roughly 85% success is the target band (Wilson et al. 2019). | Yes: `challenge.js` adjusts within a lesson |

**Repetition is never the goal in itself.** A repeat is justified only if it
retrieves, spaces, varies the format, or moves the item to a later stage.

## 3. The Zaban lesson framework

Every authored lesson follows the same seven phases. The activities inside each
phase change with the objective and the level. Typical length: **15–25 minutes**.

| # | Phase | Purpose | Typical activities | Support level |
|---|---|---|---|---|
| 1 | **Recall**: what do you already know? | Retrieve prerequisite items, which also warms up | 3–5 due review items from earlier lessons, chosen for relevance to today's objective | none (retrieval) |
| 2 | **Introduction**: what are we learning? | State the objective as a can-do; set the scene | A short scene or exchange; "By the end you'll be able to…" | n/a |
| 3 | **Teaching**: understand the concept | Explicit instruction with examples in context | Vocabulary in sentences with audio; a structure explained with 2–4 examples; a pronunciation point; a register note | full |
| 4 | **Guided practice**: try it yourself | Apply with decreasing support | Recognition → choose → fill with hints → build from tiles | high → low |
| 5 | **Application**: use what you've learned | Produce in a realistic task | Construct sentences from a prompt, complete a dialogue, a short tutor roleplay with objectives | low |
| 6 | **Assessment**: have you understood? | Test each objective without giving the answer away | Mixed formats, no hints, at least one task per objective, at least one production task | none |
| 7 | **Feedback**: what should you improve? | Explain errors, show what was achieved, schedule revision | Per-objective result; explained mistakes; items scheduled; a suggested tutor follow-up | n/a |

Rules that hold for every lesson:

- **Objectives first.** Every activity serves a named objective. An activity with
  no objective is removed.
- **Assessment tests the objectives, and only them.** The assessment phase covers
  every objective, includes at least one production task, and gives no hints.
- **Something real by the end.** Phase 5 or 6 includes a communicative task
  (a dialogue, a request, a short message), not only isolated items.
- **New load is limited.** At A1, a lesson introduces at most about 8–10 new
  lexical items and one new structure. Later levels can carry more, if the
  objectives justify it.
- **Feedback names the cause.** "That's the polite form for a friend, not a
  waiter" rather than "Wrong".
- **Revision is scheduled, not suggested.** Every item met enters the scheduler
  with the evidence gathered in the lesson.

Today's generated lessons map onto this framework partially (recall rungs exist,
teaching is a flashcard batch, no objective, assessment is not separated).
Generated lessons remain for **review sessions**. New material is taught by
authored lessons.

## 4. Choosing activities by objective

The engine chooses activity types from the objective, not at random:

| Objective type | Best activities | Avoid as the only evidence |
|---|---|---|
| Remember new vocabulary | Active recall (write/say from meaning), cloze in context | Multiple choice, matching |
| Understand a grammar structure | Explanation + examples, then sentence transformation, error correction | Choosing the right form from options |
| Construct sentences | Build from tiles, then free construction from a prompt | Tile ordering alone |
| Understand spoken language | Listening comprehension with questions, sound discrimination | Reading the transcript |
| Read | Graded passage with comprehension questions | Word-by-word translation |
| Use language naturally | Dialogue completion, tutor roleplay with objectives | Scripted single-turn prompts |
| Write accurately | Short writing task + structured correction + rewrite | Fill-the-gap only |
| Pronounce | Listen-and-repeat, shadowing, minimal pairs | Speech recognition as a "score" (see §6) |

## 5. How the three systems work together

The three systems share one learner model and exchange events, so each can act on
what the others observe.

```
             teaches                    records evidence
 ACADEMY ───────────────▶ LEARNER ──────────────────────▶ ENGINE
 (lessons,               (attempts,                      (skill states,
  objectives)             conversations)                  review items, profile)
     ▲                         ▲                              │
     │ next lesson /           │ conversation steered          │ weaknesses, due items,
     │ remedial lesson         │ toward weak items             │ known vocabulary
     └─────────── ENGINE ◀─────┴──────── TUTOR ◀───────────────┘
                                         (receives a learner-context packet,
                                          returns structured errors as evidence)
```

### Worked example: past-tense sentence construction

1. **In a lesson**, the learner fails two of three past-tense construction tasks in
   the assessment phase. The engine records three Attempts against objective
   `past-simple-construct` and its structure item `grammar.past-simple`. The skill
   state for that structure drops to *Knowledge* (recognises, cannot produce).
2. **The engine** schedules the structure item for review tomorrow. It also flags
   it as a *focus weakness* for the learner's next conversation.
3. **The next review session** includes two past-tense items in different formats:
   a sentence transformation and a free construction ("Say what you ate
   yesterday").
4. **In the next tutor conversation**, the learner-context packet lists
   `past simple: weak, focus` among the learner's weaknesses. The tutor asks
   questions that invite the past tense ("What did you do at the weekend?"). It
   corrects past-tense errors with a prompt first, and records each one as a
   structured error.
5. **The tutor's structured errors become Attempts** against the same item (format:
   `conversation`). Two successful uses in conversation, after the lesson failure
   and the review, raise the item to *Application*.
6. **A week later**, a delayed review tests it again. Success moves it to
   *Retention*. Failure returns it to frequent review, and the next lesson's
   Recall phase (phase 1) includes it.

The same loop runs in reverse: an error pattern the tutor sees repeatedly (for
example, wrong gender agreement) becomes a review item and can trigger a short
remedial lesson.

## 6. Skills and how each is taught and evidenced

| Skill | Taught through | Evidenced by | Caveat |
|---|---|---|---|
| Vocabulary | Lessons (teaching phase), reviews | Recall, then use in sentences | Recognition alone is not mastery |
| Grammar | Explicit teaching + guided practice | Transformation, construction, correct use in free production | |
| Listening | Audio in every lesson, listening activities, the input stream | Comprehension questions on unseen audio | |
| Reading | Script course, graded passages | Comprehension of unseen text | |
| Writing | Write-from-memory, sentence and message writing | Accuracy and task completion, graded by rules then rubric | AI rubric grading is reviewed against human grading (tutor spec §8) |
| Speaking | Speaking ladder, tutor conversation | Intelligibility to a recogniser, task completion in conversation | **Not** a pronunciation assessment. The browser recogniser shows that speech was understood, not how good the accent was. |
| Interaction | Roleplay, missions | Objectives met in conversation, turn-taking, repair | |

## 7. Feedback policy

- **In lessons:** immediate, specific, and explained. A wrong answer opens its
  explanation automatically (existing behaviour). Explanations come from authored
  content, or from deterministic templates; never from unreviewed AI.
- **Self-correction first.** For production errors, give a hint or prompt and a
  retry before the answer (as the from-memory hint does).
- **Beginners:** at most one correction per turn in conversation. Correct errors
  that block meaning or recur, not every slip.
- **Advanced learners:** more corrections, register and naturalness feedback,
  less scaffolding.
- **Alternatives are right.** Any valid expression of the meaning is accepted.
  Lessons list accepted alternatives, the grader recognises synonyms and other
  real words, and the tutor is instructed to accept valid alternatives.
- **Encouragement points at evidence.** "You wrote 6 of 8 from memory" rather than
  "Great job!" (existing `encourage.js` principle).

## 8. Varieties and register

Each course names one target variety and register. Content that differs by variety
carries the variants explicitly, and the learner can choose a variety where
the course supports it (existing `dialects.js`, coach regions). Rules:

- A lesson teaches one variety's forms, and *notes* the major alternatives the
  learner will hear.
- Answers in another listed variety are accepted, and marked as that variety.
- Arabic is the clearest case: a course is either Modern Standard Arabic or a named
  spoken variety (Egyptian, Levantine, Gulf, Maghrebi). It never presents one as
  the other. See [ZABAN_CURRICULUM_FRAMEWORK.md §6](ZABAN_CURRICULUM_FRAMEWORK.md).
