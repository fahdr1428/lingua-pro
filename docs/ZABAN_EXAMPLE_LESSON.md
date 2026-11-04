# Example lesson — Urdu A1 · Ordering food and making polite requests

> **STATUS: DRAFT — requires linguistic and pedagogical review before use.**
> Written to illustrate the lesson format defined in
> [ZABAN_EDUCATIONAL_ARCHITECTURE.md §3](ZABAN_EDUCATIONAL_ARCHITECTURE.md) and the
> data model in [ZABAN_TECHNICAL_ARCHITECTURE.md §4](ZABAN_TECHNICAL_ARCHITECTURE.md).
> Under Zaban's own quality rules, nothing here is approved curriculum until a
> qualified Urdu teacher has reviewed it (questions for the reviewer are in §10).

| | |
|---|---|
| **Course** | Urdu (Pakistan), everyday polite register, Nastaliq script + romanisation (`ur-PK.everyday`) |
| **Level** | A1 |
| **Module** | 4 · Food and drink: ordering and requests |
| **Lesson** | 4.1 · Ordering food and making polite requests |
| **Length** | about 20 minutes |
| **Prerequisites** | Module 1: *aap* (formal you) and politeness levels (grammar `ur_g3`), verb-last word order (`ur_g1`), yes/no questions with *kya* (`ur_g6`). Module 3: numbers 1–10. |
| **Recycled items** | چائے *chai* `ur_0034`, پانی *paani* `ur_0031`, روٹی *roti* `ur_0032`, چاول *chawal* `ur_0033`, کھانا *khana* `ur_0039`, ایک *ek* `ur_0024`, اور *aur* `ur_0067`, شکریہ *shukriya* `ur_0002`, آپ *aap* `ur_0010`, کیا *kya* `ur_0015`, دینا *dena* `ur_0138`, دکھانا *dikhana* `ur_0254` |
| **New productive items (8)** | مینو *menu*, بل *bill*, بریانی *biryani*, دال *daal*, پلیٹ *plate*, دیجیے *dijiye*, لائیے *laiye*, دکھائیے *dikhaiye* |
| **New receptive phrases (3)** | جی، کیا لیں گے؟ *ji, kya lenge?* · اور کچھ؟ *aur kuch?* · بس، شکریہ *bas, shukriya* (also productive in phase 4) |
| **New structures (2)** | `ur.structure.mujhe-chahiye`: *mujhe … chahiye* "I'd like / I need …" · `ur.structure.polite-imperative-iye`: polite requests with *-iye* |
| **Function** | `ur.function.polite-request`, `ur.function.order-food` |

## 1. Learning objectives

At the end of this lesson the learner should be able to:

| Id | Type | Can-do | Condition | Criterion |
|---|---|---|---|---|
| O1 | `recognise` | Recognise common food, drink and menu words | heard and read, in sentences | ≥ 4 of 5 correct |
| O2 | `construct` | Ask for a particular item with *mujhe … chahiye* | from an English prompt, no hints | 2 of 2 correct, with *chahiye* and *mujhe* |
| O3 | `construct` | Make a polite request with the *-iye* form | from a prompt or a casual form, no hints | 2 of 2 correct and polite |
| O4 | `understand` | Understand a basic restaurant exchange and respond | unseen dialogue | understands the waiter's questions, gives appropriate replies |
| O5 | `use` | Order a meal in a simulated conversation | tutor roleplay, at most 1 hint | drink + dish ordered politely, "anything else?" answered, bill requested |

O5 is demonstrated in this lesson at *Application* level. It becomes *Secure*
through the Module 4 task and delayed reviews.

## 2. Phase 1 · Recall (about 2 min)

Retrieval of prerequisites, with no hints. The engine fills this phase from
the learner's due items, preferring those below.

| # | Activity | Prompt | Accepted | Evidence for |
|---|---|---|---|---|
| R1 | `recall_write` | How do you write "tea"? | چائے · *chai* | `ur_0034` |
| R2 | `recall_write` | How do you write "water"? | پانی · *paani* | `ur_0031` |
| R3 | `pick_word` | You're speaking to a waiter you don't know. Which "you"? | آپ *aap* (not تم *tum*) | `ur_g3` politeness |
| R4 | `speak_prompt` (recall) | Say "one" | ایک *ek* | `ur_0024` |

## 3. Phase 2 · Introduction (about 1 min)

**Objective shown to the learner:** "By the end you'll be able to order a meal in
Urdu, politely, and ask for the bill."

**Scene:** a busy dhaba in Lahore. Model dialogue with audio (native speaker,
`ur-PK`). English shown on tap.

| Speaker | Urdu | Romanisation | English |
|---|---|---|---|
| Waiter | جی، کیا لیں گے؟ | Ji, kya lenge? | Yes, what will you have? |
| You | مینو دکھائیے۔ | Menu dikhaiye. | Please show me the menu. |
| You | مجھے ایک چائے چاہیے، اور ایک پلیٹ بریانی۔ | Mujhe ek chai chahiye, aur ek plate biryani. | I'd like a tea, and a plate of biryani. |
| Waiter | اور کچھ؟ | Aur kuch? | Anything else? |
| You | ایک گلاس پانی دیجیے۔ بس، شکریہ۔ | Ek glass paani dijiye. Bas, shukriya. | A glass of water, please. That's all, thanks. |
| You (later) | بل لائیے۔ | Bill laiye. | Please bring the bill. |

## 4. Phase 3 · Teaching (about 5 min)

### T1 · Words, in sentences

Each item: script, romanisation, meaning, audio, one example sentence (shown with
romanisation). New: *menu, bill, biryani, daal, plate*. Recycled: *chai, paani,
roti, chawal*.

### T2 · Asking for what you want: *mujhe … chahiye*

> **Explanation** (explanation-library entry `ur.expl.mujhe-chahiye`)
>
> Urdu doesn't usually say "I want tea". It says **"to me, tea is needed"**:
>
> **مجھے چائے چاہیے** · *mujhe chai chahiye* · I'd like tea / I need tea
>
> - **مجھے *mujhe*** means "to me". It is what *main* (I) becomes here.
> - **چاہیے *chahiye*** means "is needed". Like most Urdu verbs, it comes **last**.
> - To ask someone else: **کیا آپ کو چائے چاہیے؟** · *kya aap ko chai chahiye?* · Would you like tea?
>
> Common mistake: *~~main chai chahiye~~*. With *chahiye*, the person who wants is
> always *mujhe* (or *aap ko*, *us ko*…), never *main*.

Examples (audio): مجھے پانی چاہیے *mujhe paani chahiye* · مجھے ایک پلیٹ دال چاہیے
*mujhe ek plate daal chahiye* · کیا آپ کو روٹی چاہیے؟ *kya aap ko roti chahiye?*

### T3 · Polite requests: the *-iye* form

> **Explanation** (`ur.expl.polite-imperative-iye`, links to `ur_g3`)
>
> When you ask *aap* (a waiter, a stranger, an elder) to do something, the verb
> ends in **-iye**:
>
> | Verb | With a friend (*tum*) | Polite (*aap*) |
> |---|---|---|
> | dena (give) | دو *do* | **دیجیے *dijiye*** |
> | lana (bring) | لاؤ *lao* | **لائیے *laiye*** |
> | dikhana (show) | دکھاؤ *dikhao* | **دکھائیے *dikhaiye*** |
>
> *Paani do* is understood, but to a waiter it sounds abrupt. **Paani dijiye** is
> what you want. *Dena* is irregular: *dijiye*, not *deiye*.

### T4 · Sound and register notes

- *chahiye*: three syllables, *chaa-hi-ye*. *dijiye*: *dee-ji-ye*.
- **جی *ji*** from a waiter is a polite "yes / go ahead". You can use it too:
  *ji, shukriya*.

## 5. Phase 4 · Guided practice (about 5 min)

Support decreases through the phase. `challenge.js` may turn G2 or G4 into a
from-memory question if the learner is breezing.

| # | Activity | Prompt | Accepted | Hints | Targeted feedback | Obj. |
|---|---|---|---|---|---|---|
| G1 | `listen_pick` | 🔊 *biryani* | biryani | — | — | O1 |
| G2 | `complete_sentence` | ___ ایک چائے چاہیے · "___ ek chai chahiye" | مجھے *mujhe* (options: mujhe / main / mera) | "Who is the tea needed *by*?" | *main* → "With *chahiye*, use *mujhe*: 'to me'." | O2 |
| G3 | `transform` | Make it polite for a waiter: پانی دو *paani do* | پانی دیجیے *paani dijiye*; پانی دے دیجیے *paani de dijiye* | "*dena* → *dijiye*" | *paani do* unchanged → "That's how you'd ask a friend." | O3 |
| G4 | `build_sentence` | Tiles → "I'd like a plate of lentils" | مجھے ایک پلیٹ دال چاہیے | first tile | *chahiye* not last → "In Urdu the verb comes last." | O2 |
| G5 | `cloze_write` | بل ___ (please bring) · *bill ___* | لائیے *laiye*; لے آئیے *le aaiye* | 1st letter, then half (as `recall.js`) | *lao* → "Polite form, please: *laiye*." | O3 |
| G6 | `dialogue_complete` | Waiter: اور کچھ؟ *aur kuch?* → you've finished ordering | بس، شکریہ *bas, shukriya*; نہیں، شکریہ *nahin, shukriya* | "Two words: 'enough', 'thanks'" | — | O4 |

## 6. Phase 5 · Application (about 4 min)

### A1 · `construct`

> You want water and rice. Ask the waiter for them.

- **Graded by rules:** must contain *paani* and *chawal*, and a request form
  (*chahiye* | *dijiye* | *de dijiye* | *laiye*).
- **Accepted, among others:** مجھے پانی اور چاول چاہیے *mujhe paani aur chawal
  chahiye* · پانی اور چاول دیجیے *paani aur chawal dijiye* · ایک گلاس پانی اور چاول دے دیجیے.
- **Also right, with a note:** میں پانی اور چاول چاہتا ہوں *main paani aur chawal
  chahta hoon* (or *chahti hoon* for a woman). It's correct Urdu, a little more
  formal for ordering, and this lesson practises *chahiye*.

### A2 · `roleplay` (AI tutor, 2–3 min)

| | |
|---|---|
| Setting | A dhaba. The tutor is the waiter. Everyday, friendly, not rushed. |
| Objectives | 1. Order a drink · 2. Order a dish · 3. Answer *aur kuch?* · 4. Ask for the bill |
| Criteria | Each objective met politely (*-iye* or *chahiye*), understandable to a native speaker |
| Tutor rules | A1 vocabulary: known items + this lesson's. ≤ 1 correction per turn, prompt first (e.g. "How would you say that politely to a waiter?"). Accept valid alternatives. If the learner stalls, offer one romanised suggestion (counts as a hint). |
| Evidence | Each objective met → Attempt (`demand: use`, `setting: tutor`). Each correction → Attempt on its item (e.g. `ur.structure.polite-imperative-iye`). |
| No AI available | (offline or no key) a scripted waiter runs the same four turns as `dialogue_complete` items, graded by rules |

## 7. Phase 6 · Assessment (about 3 min)

No hints, no options for production tasks, variants not seen earlier in the lesson.

| # | Activity | Task | Accepted | Obj. |
|---|---|---|---|---|
| S1 | `listen_comprehension` | 🔊 "مجھے ایک پلیٹ دال اور ایک روٹی چاہیے" — What did the customer order? | lentils and one bread | O1 |
| S2 | `read_comprehension` | Menu card (5 items, script + romanisation) — Which is rice? / Which is lentils? | چاول · دال | O1 |
| S3 | `construct` | "I'd like a plate of biryani", using *chahiye* | مجھے ایک پلیٹ بریانی چاہیے | O2 |
| S4 | `construct` | "Would you like tea?" (to a guest) | کیا آپ کو چائے چاہیے؟ | O2 |
| S5 | `transform` | Make it polite: مینو دکھاؤ *menu dikhao* | مینو دکھائیے *menu dikhaiye*; مینو دکھا دیجیے | O3 |
| S6 | `recall_write` | Ask the waiter to bring water | پانی لائیے *paani laiye*; ایک گلاس پانی لائیے; پانی لے آئیے | O3 |
| S7 | `dialogue_complete` | Waiter: جی، کیا لیں گے؟ → order a tea · Waiter: اور کچھ؟ → finish | any valid order · *bas/nahin, shukriya* | O4 |
| — | (roleplay A2) | counted for O5 if completed with ≤ 1 hint | — | O5 |

**Scoring:** each objective is *demonstrated* if its criterion is met. The lesson is
always completed. Assessment results set item and objective stages (learning
engine §2) and never block progress. An objective not demonstrated triggers a
remedial review before Lesson 4.2.

## 8. Phase 7 · Feedback and revision (about 1 min)

**Shown to the learner (example):**

> **You can now:** ask for food and drink with *mujhe … chahiye* ✓ · understand a
> waiter's questions ✓ · order a meal in conversation ✓
> **Still to secure:** polite requests with *-iye*. You used *lao* once; to a
> waiter it's *laiye*. Two quick practices are in tomorrow's review.
> **You wrote 6 of 7 from memory.**
> **Next:** Lesson 4.2 · Asking what's available and what it costs. Or practise
> ordering for two with your tutor.

**Scheduled by the engine:**

| Item | Result in this lesson | Next review |
|---|---|---|
| `ur.structure.polite-imperative-iye` | 1 fail (S6), 1 pass (S5) | tomorrow, as `transform` + `construct` |
| `ur.structure.mujhe-chahiye` | passed in S3, S4, roleplay | in ~3 days, novel-context `construct` |
| new words (*menu, bill, biryani, daal, plate*) | introduced, recalled once | FSRS from their attempts. Recall-stage needs a second session. |
| `ur.function.order-food` | roleplay success | Module 4 task (end of module) |

The tutor's next conversation gets `focus: polite-imperative-iye`.

## 9. The lesson as data (excerpt)

```json
{
  "id": "ur-PK.A1.m04.l01",
  "moduleId": "ur-PK.A1.m04",
  "title": "Ordering food and making polite requests",
  "minutes": [18, 22],
  "status": "draft",
  "provenance": { "author": "zaban-curriculum-draft", "origin": "ai-draft", "sources": [], "createdAt": "2026-11-04" },
  "reviews": [],
  "objectiveIds": ["O1", "O2", "O3", "O4", "O5"],
  "newItemIds": ["ur.menu", "ur.bill", "ur.biryani", "ur.daal", "ur.plate",
                 "ur.structure.mujhe-chahiye", "ur.structure.polite-imperative-iye"],
  "reviewItemIds": ["ur_0034", "ur_0031", "ur_0032", "ur_0033", "ur_0024", "ur_0010"],
  "phases": {
    "guided": { "activityIds": ["G1", "G2", "G3", "G4", "G5", "G6"] },
    "assessment": { "activityIds": ["S1", "S2", "S3", "S4", "S5", "S6", "S7"], "hints": false }
  }
}
```

```json
{
  "id": "G3",
  "type": "transform",
  "objectiveId": "O3",
  "itemIds": ["ur.structure.polite-imperative-iye", "ur_0138", "ur_0031"],
  "demand": "construct",
  "skills": ["grammar", "writing"],
  "instructions": "Make it polite for a waiter.",
  "prompt": { "native": "پانی دو", "translit": "paani do", "en": "give water (to a friend)" },
  "accepted": ["پانی دیجیے"],
  "alternatives": ["پانی دے دیجیے", "ایک گلاس پانی دیجیے"],
  "hints": ["dena → dijiye"],
  "explanation": "ur.expl.polite-imperative-iye",
  "feedback": {
    "unchanged": "That's how you'd ask a friend. To a waiter: paani dijiye.",
    "deiye": "Nearly. Dena is irregular: dijiye."
  },
  "scoring": { "grader": "rules" },
  "difficulty": 2
}
```

Accepted answers carry romanisations too, so they are graded the way
from-memory answers are today. Checked against the current grader: *paani
dijiye*, *pani dijiye* and *paani deejiye* grade exact; *pani dijie* grades
"close"; *paani do* grades wrong. The hamza spelling دیجئے grades only "close"
against دیجیے, so the validator should require both spellings in `accepted`
(question 6).

## 10. Questions for the reviewer

1. Are the waiter's lines natural for a Lahore dhaba? Is *ji, bataiye* more typical
   than *ji, kya lenge?* Should both be taught receptively?
2. For the bill, which is most natural: *bill laiye*, *bill le aaiye* or
   *bill de dijiye*?
3. *Menu dikhaiye* or *menu dikha dijiye*: which should be taught first?
4. Is *ek plate biryani* (without *ki*) the right everyday form?
5. Is *main … chahta/chahti hoon* acceptable as an alternative for ordering, or
   should it be marked "too formal"?
6. Spelling and romanisation: should Zaban teach *chahiye*, *chahie* or
   *chaahiye*, and دیجیے or دیجئے? Every variant must be accepted, but one form
   should be taught consistently.
7. Should flexible word order (*chai chahiye mujhe*) be accepted as correct or as
   "close"?
8. Is the new-item load (8 productive + 3 receptive + 2 structures) right for A1?

## 11. How this differs from today's lessons

| Today (generated, unit "Food & Drink") | This lesson |
|---|---|
| Teaches 20 food words; no objective | Five measurable objectives built around ordering |
| A grammar card on whatever is next in rotation | Two structures the task needs, taught explicitly |
| Mostly choose-from-options, some from-memory (v113) | Recognition → guided → construction → conversation |
| No assessment phase | Every objective assessed without hints |
| The map claims "You can ask them a question back" | The module outcome is "Order food and drink politely", and this lesson teaches it |

New activity types this lesson needs (roadmap 2.5): `transform`, `cloze_write`,
`construct`, `dialogue_complete`, `listen_comprehension`, `read_comprehension`,
`roleplay`.
