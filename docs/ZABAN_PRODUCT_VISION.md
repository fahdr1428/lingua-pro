# Zaban — product vision

> **ZABAN**
> Learn a language. Understand it. Live it.

A structured, personalised language-learning platform combining expert-designed
lessons, intelligent practice and AI-powered conversation.

## The one distinction everything follows from

**Zaban teaches people how to use a language, not information about a language.**

A learner who can pick *pāni* out of four options knows something about Urdu. A
learner who can walk into a dhaba and get a glass of water, politely, without
switching to English, can use Urdu. Every part of the product is judged by
whether it moves people from the first to the second:

| Area | "Information about a language" | "Using a language" (Zaban) |
|---|---|---|
| Curriculum | Word lists by topic | Lessons defined by what the learner can *do* at the end |
| Lessons | Flashcards and multiple choice | Teach, guide, then make the learner produce and apply |
| Exercises | Chosen to keep people busy | Chosen for what the objective needs |
| AI | A chatbot in another tab | A tutor that knows the curriculum and the learner, and gets them using it |
| Progress | Streaks, XP, words "learned" | What the learner can do, in each skill, and whether it lasted |
| Interface | Rewards activity | Shows the next useful thing to do, and tells the truth about progress |

## Who Zaban is for

Zaban's existing positioning is its sharpest asset: **the languages the big apps
ignore or serve badly** (Urdu, Punjabi, Persian, Bengali, Tamil, Malayalam,
Yoruba, Somali, Nigerian Pidgin…), alongside widely taught ones.

Two learner groups matter most for those languages:

- **Heritage learners**: people who grew up hearing the language, often understand
  more than they can say, and frequently cannot read the script. They need
  speaking and reading, register (how to talk to elders), and a respectful start
  that doesn't make them learn "hello".
- **Purposeful adults**: partners, travellers, professionals and returning
  students who need to function in real situations, often in a specific variety
  (Egyptian rather than Modern Standard Arabic, Pakistani Urdu, Mexican Spanish).

## Three systems, one experience

1. **The Learning Academy (foundation).** Structured courses, levels, modules
   and lessons with explicit objectives. This is where new language is *taught*.
2. **The Adaptive Learning Engine (retention).** Exercise selection, answer
   evaluation, spaced repetition, mastery tracking, diagnostics and personalised
   revision. This is what makes learning *stick*.
3. **The AI Language Tutor (application).** Explanation, conversation, roleplay,
   writing correction and personalised revision. This is where learners *use* what
   they learned.

They are one system to the learner. A learner who struggles to form the past tense
in a lesson gets extra past-tense practice in their next review, and their next
conversation is steered to give them reasons to use it. A mistake made in
conversation becomes an item the engine schedules. The mechanics are specified in
[ZABAN_EDUCATIONAL_ARCHITECTURE.md §5](ZABAN_EDUCATIONAL_ARCHITECTURE.md).

## Principles

1. **Use, not information.** Every lesson ends with the learner doing something
   real with the language.
2. **Effort is the point.** Recognition is a step, not a destination. Learners
   move from supported recognition to independent production.
3. **Nothing is mastered on one right answer.** Mastery requires repeated
   evidence, in different formats, including after a delay.
4. **Never invent a number.** Proficiency is shown per skill and as an estimate,
   with "not enough evidence yet" where that is the truth. No certificates or
   formal CEFR claims from in-app exercises.
5. **Experts own the curriculum. AI personalises it.** Core explanations and
   language content are authored or reviewed by qualified speakers and educators.
   AI-generated content is a draft until a person approves it.
6. **Varieties are explicit.** Every course names the variety and register it
   teaches, and says where it is and isn't understood.
7. **Depth before breadth.** One excellent course before twenty shallow ones.

## What Zaban will not do

- Award CEFR levels or certificates. It shows *estimated* skill profiles and says
  how they were estimated.
- Claim to assess pronunciation beyond what its audio pipeline can actually
  measure.
- Let the AI invent grammar rules or curriculum, or approve its own content.
- Add languages faster than it can build and review complete courses for them.
- Optimise for streaks and time-in-app at the expense of learning. Engagement is
  measured, but reported separately from learning.

## Strategic decisions

These follow from the brief and the audit:

1. **Build one excellent curriculum first.** The architecture supports Pre-A1 to
   C2 for any language. Content is developed and validated in stages, starting
   with one complete A1 course. **Recommended pilot: Urdu A1** (owner to confirm,
   see the roadmap). Urdu is central to Zaban's positioning, has the most complete
   existing content among the underserved languages, and exercises every hard case
   the architecture must handle: a non-Latin right-to-left script, romanisation,
   three levels of formality, gendered verbs, and a variety question (Urdu and
   Hindi share a spoken core).
2. **Make the AI contextual.** The tutor knows the course, the lesson, the
   learner's vocabulary and grammar, their mistakes and their weakest skills, and
   uses that to get them producing language just beyond their current level.
3. **Make educational effectiveness the differentiator.** Measure learning
   (retention after a delay, independent production, transfer to new tasks), not
   only engagement.
4. **The other 20 languages keep working.** Existing learners keep their courses
   as they are. They are presented as practice courses without CEFR claims until
   each has a complete, reviewed curriculum.

## How we will know it works

Two sets of measures, always reported apart:

| Educational success | Product success |
|---|---|
| Delayed retention: share of previously learned items recalled after ≥7 days | Registration and activation |
| Independent production: share of objectives demonstrated without support | Lesson completion |
| Transfer: success on unfamiliar tasks using taught material | Day-1, day-7, day-30 return |
| Skill progression per skill (listening, reading, speaking, writing, interaction) | Subscription conversion |
| Improvement from diagnostic to later assessment | AI tutor usage |

Definitions are in [ZABAN_LEARNING_ENGINE.md §9](ZABAN_LEARNING_ENGINE.md).
