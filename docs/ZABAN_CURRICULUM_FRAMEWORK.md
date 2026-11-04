# Zaban — curriculum framework

How Zaban's courses are organised, aligned to the CEFR, adapted per language, and
quality-controlled. The data model that stores this is in
[ZABAN_TECHNICAL_ARCHITECTURE.md §4](ZABAN_TECHNICAL_ARCHITECTURE.md). A complete
example lesson is in [ZABAN_EXAMPLE_LESSON.md](ZABAN_EXAMPLE_LESSON.md).

## 1. Hierarchy

```
Language            Urdu
└─ Course           Urdu (Pakistan), everyday spoken register, taught with Nastaliq script + romanisation
   └─ Level         A1 (target band, not a certificate)
      └─ Module     Food and drink: ordering and requests
         └─ Lesson  Ordering food and making polite requests
            ├─ Objectives       measurable can-do outcomes
            ├─ Content items    words, phrases, structures, functions, examples, audio
            ├─ Activities       configured exercises, each serving an objective
            └─ Assessment       activities that test each objective without support
```

- A **Language** can have several **Courses**, one per variety, register or script
  (e.g. *Arabic: Modern Standard* and *Arabic: Egyptian* are separate courses that
  share some content items).
- **Levels** are CEFR bands: Pre-A1, A1, A2, B1, B2, C1, C2.
- A **Module** groups lessons around one communicative situation or theme, with
  module-level outcomes.
- A **Lesson** is one 15–25 minute teaching experience following the seven-phase
  framework ([educational architecture §3](ZABAN_EDUCATIONAL_ARCHITECTURE.md)).
- **Objectives** are the unit of mastery. Content items are the unit of
  scheduling. Activities are the unit of evidence.

## 2. Levels

The CEFR (Council of Europe; *Companion Volume*, 2020) is the principal reference.
It describes proficiency in reception, production, interaction and mediation, from
Pre-A1 to C2. Zaban uses its levels as **learning targets and an estimate of
where a learner is**, never as awarded certificates. A learner can be B2 in
listening and B1 in speaking.

| Level | Stage | What the learner should achieve |
|---|---|---|
| Pre-A1 | Foundations | Recognise sounds, scripts, basic expressions and familiar words |
| A1 | Beginner | Introduce themselves, ask basic questions and handle simple situations |
| A2 | Elementary | Handle everyday conversations and describe experiences |
| B1 | Intermediate | Communicate independently, explain opinions and narrate experiences |
| B2 | Upper intermediate | Discuss complex topics, understand detailed material and communicate confidently |
| C1 | Advanced | Express nuanced ideas, understand demanding content and adapt language to context |
| C2 | Proficient | Understand and communicate with a very high degree of flexibility and precision |

### How lessons change across levels

| | Pre-A1 / A1 | A2 / B1 | B2 / C1 / C2 |
|---|---|---|---|
| Teaching language | English (or learner's L1), short | Mixed; target language where possible | Target language |
| Support | Romanisation on, audio on every item, hints | Romanisation on request, fewer hints | Authentic text and audio, minimal glossing |
| Production | Words → phrases → set sentences | Sentences → short connected speech/text | Extended discourse, argument, register shifts |
| Tutor behaviour | Simple language, known vocabulary, one correction per turn, lots of prompting | Natural pace, introduces new words with glosses, corrects patterns | Nuance, idiom, register, challenging texts; correction of naturalness |
| Assessment | Item recall + short tasks | Tasks with variation | Open tasks graded by rubric (+ human calibration) |

**Build order:** the architecture supports every level from day one. Content is
built and validated one level at a time, starting with **Pre-A1 + A1 of the
pilot course**. No level is published until its modules pass review
(§7) and its pilot shows learners can meet the objectives.

## 3. Modules

A module is designed around **what people need to do**, with the grammar and
vocabulary that doing it requires. Each module has:

- **Module outcomes**: 2–4 can-do statements the module's lessons build towards,
  demonstrated in a final module task (usually a tutor roleplay with objectives,
  plus a short written task from A2).
- **Functions** (request, ask a price, describe, narrate…), **structures**
  (grammar), **lexis** (topic vocabulary), **skills** focus, and **culture/register**
  notes.
- **Prerequisites**: modules or items it assumes. A module never relies on an item
  that no earlier lesson taught.
- **Spiral links**: items from earlier modules it deliberately recycles.

## 4. Lessons and objectives

Lesson titles state the outcome. *"Ordering food and making polite requests"*, not
*"Food vocabulary"*.

Each objective is written to be **observable and checkable**:

> **Can-do:** Order a drink and a dish politely in a café.
> **Condition:** in a simulated exchange with the tutor, without hints
> **Criterion:** the order is understandable and uses a polite request form; at least 2 of 3 items correct

Objectives are typed so the engine knows what evidence they need
([learning engine §3](ZABAN_LEARNING_ENGINE.md)):

| Objective type | Example | Evidence required |
|---|---|---|
| `recognise` | Recognise common menu items when heard | comprehension tasks |
| `recall` | Say or write the words for 6 food items from their meaning | unaided production |
| `construct` | Form a request with *mujhe … chahiye* | construction from a prompt, in more than one sentence |
| `use` | Order a meal in a simulated conversation | task success in conversation / roleplay |
| `understand` | Understand a short restaurant exchange | listening/reading comprehension, unseen |

## 5. Pilot course: Urdu A1 (proposed module map, **draft**)

*Proposal for discussion. It reuses existing units, journey exchanges and grammar
cards wherever they fit, and fixes the misalignment found in the audit. To be
reviewed by a qualified Urdu teacher before lessons are written.*

Pre-A1 already exists as **Chapter 0** (script course and reading test).

| # | Module | Module outcomes (can-do) | Key structures | Existing material to reuse |
|---|---|---|---|---|
| 1 | Greetings and introductions | Greet appropriately; say name, origin and how you are; ask the same back | *hai/hoon/hain*; verb-last word order; *aap* vs *tum* | units u1–u2; grammar ur_g1, ur_g3, ur_g6 (yes/no questions); stops c1-s1…s5 |
| 2 | Family and people | Introduce family members; say who someone is | possessives *mera/meri/mere*; gender agreement | unit u3; grammar ur_g4 |
| 3 | Numbers, prices and shopping | Count to 100; ask and understand prices; buy something | *kitna/kitne ka*; numbers; agreement with quantities | unit u4; stop c2-s2 |
| 4 | **Food and drink: ordering and requests** | Order food and drink politely; ask what's available; ask for the bill | *mujhe … chahiye*; polite imperative *-iye*; *kya … hai?* | unit u5; stop c2-s1; grammar ur_g3 recycled — **example lesson** |
| 5 | Daily life | Say what you do every day and what you're doing now | habitual present; present continuous | unit u6; stop c3-s1 |
| 6 | Places and directions | Ask where something is; understand simple directions | postpositions; *kahan hai?* | units u7, u13; grammar ur_g2; stop c2-s3 |
| 7 | Time and plans | Tell the time; talk about days and simple plans | time expressions; future *-ga/-gi* | unit u8 |
| 8 | Feeling and health | Say how you feel; say something hurts | *main … hoon*; *mujhe … hai* (experiencer) | unit u11; stop c3-s2 |
| 9 | Connecting and describing | Join ideas; describe people, places, weather | *aur, lekin, kyunki*; adjectives and agreement; negation | units u9, u12; grammar ur_g5; stop c3-s3 |

Each module has 4–6 lessons and a module task. The journey map is rebuilt from
**module outcomes**, so every ✓ certifies something its lessons actually taught.

## 6. Language and variety adaptation

The structure above is shared. What fills it is not. Each course declares:

| Field | Examples |
|---|---|
| Variety | `ur-PK` everyday spoken; `ar` Modern Standard vs `ar-EG` Egyptian; `es-MX` vs `es-ES`; `zh` Mandarin (Putonghua) |
| Register taught | everyday polite; formal; colloquial |
| Script(s) and romanisation scheme | Nastaliq + Zaban romanisation; Devanagari; Hangul; pinyin with tones |
| Writing system support | RTL, combining marks, input methods accepted |
| Accepted variants | forms from other varieties accepted and labelled |

Language-specific concerns the curriculum must plan for (non-exhaustive):

| Concern | Languages | Curriculum consequence |
|---|---|---|
| Diglossia (written vs spoken) | Arabic; Tamil | Separate courses or explicit dual forms. Never present the written standard as everyday speech without saying so. |
| Shared spoken core, different scripts | Urdu / Hindi; Punjabi in Shahmukhi / Gurmukhi | Shared spoken items; script and formal vocabulary differ by course |
| Formality systems | Urdu/Hindi *aap–tum–tu*; Bengali *apni–tumi–tui*; Korean and Japanese speech levels; French/Spanish/German formal *you* | Register is taught from A1 and part of objectives ("politely") |
| Tones | Mandarin, Vietnamese, Yoruba | Tone in teaching, listening discrimination, romanisation with tone marks; grader policy on tone marks stated per course |
| Gender and agreement | Urdu, Hindi, Arabic, French, Spanish, German | Agreement is an assessed objective, not a footnote |
| Scripts to learn | non-Latin scripts | Pre-A1 script course; romanisation scaffold withdrawn on a schedule by level |
| Counters, measure words | Mandarin, Japanese, Korean | Taught as structures with their own review items |

## 7. Quality control

### Content states

```
draft ──▶ linguistic review ──▶ pedagogical review ──▶ validated ──▶ pilot ──▶ approved
  ▲              │                      │                                   │
  └──── changes requested ◀─────────────┘                          retired / revised
```

- **draft**: written by an author, or generated by AI. Never shown to learners
  in an approved course.
- **linguistic review**: a qualified speaker of the variety checks accuracy,
  naturalness, register, script and romanisation.
- **pedagogical review**: a language educator checks objectives, difficulty,
  progression, explanation clarity and exercise design.
- **validated**: passes the automated checks (schema, scripts, romanisation, the
  item appears in its example, accepted answers parse, audio present, every
  activity linked to an objective, every objective assessed).
- **pilot**: shown to a small cohort, with outcome data reviewed.
- **approved**: published.

Every content item and lesson records **provenance** (author, origin
`human | ai-draft | imported`, sources consulted) and **reviews** (reviewer, role,
date, verdict, notes). **AI-generated content can never move itself forward.**
A person must review and approve it.

Existing content (all 21 languages) carries no review record. It is marked
`legacy-unreviewed`: it keeps working for existing learners, and is reviewed and
promoted as part of each course's build.

### Lesson review checklist

A lesson is checked for each of the following, and the checklist is stored with
the review:

- [ ] **Linguistic accuracy**: every form, gloss, romanisation and example correct for the declared variety
- [ ] **Appropriate difficulty**: new load within level limits; nothing assumed that wasn't taught
- [ ] **Clear explanations**: short, accurate, with examples; no unexplained terminology
- [ ] **Quality of examples**: natural, useful sentences a learner might actually say or hear
- [ ] **Alignment with objectives**: every activity serves an objective; every objective is taught, practised and assessed
- [ ] **Exercise diversity**: recognition, recall, construction and use all present; not only multiple choice
- [ ] **Valid answer handling**: accepted alternatives listed; common wrong answers have targeted feedback
- [ ] **Real-world relevance**: the lesson ends in a task the learner might actually need
- [ ] **Progression**: builds on earlier lessons and recycles their items
- [ ] **Variety and register**: consistent; differences from other varieties noted

The automated part of this list runs in `npm run check`, like every existing
validator.
