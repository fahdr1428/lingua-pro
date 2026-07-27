# Adding words to Zaban

Lessons are **generated**, not written. `generateLesson` builds every exercise at
runtime from vocabulary + the learner's SRS state. So to add lessons, you add
**words** — the lessons appear on their own.

## The loop

1. Verify the words. A native speaker, a dictionary, or a reliable source —
   never a machine translation. This is the only step that can't be automated.
2. Put them in a CSV named after the language code (`ur.csv`, `pa.csv`, …).
3. Preview:  `npm run import-vocab -- content/ur.csv --dry`
4. Apply:    `npm run import-vocab -- content/ur.csv`
5. Check:    `npm run validate-vocab`
6. Build and push as usual.

## CSV columns

| column | required | notes |
|---|---|---|
| `lemma` | yes | the word in its own script |
| `translit` | yes for non-Latin | how to say it — heritage learners rely on this |
| `translation` | yes | English meaning |
| `unit` | yes | `u1`, `u2`, … must exist in the language's `units[]` |
| `category` | no | e.g. Greetings, Family |
| `pronunciation` | no | rough phonetic hint |
| `example_native` / `example_translation` | no | one example sentence |
| `id` | no | leave blank for new words; set it to **edit** an existing word |

See `TEMPLATE.csv`.

## Why merge, not replace

Existing words keep their IDs, because FSRS progress is keyed by word ID.
Change an ID and a learner's history for that word is orphaned. The importer
matches on `id` first, then on `lemma`, and only ever appends what's genuinely
new. `--replace` exists but demands an explicit confirmation flag.

## What the validator catches

Duplicate IDs, missing translations or transliterations, words in the wrong
script (an Urdu row still in English, Punjabi typed in Gurmukhi rather than
Shahmukhi), units that don't exist, and units too thin to make a decent lesson.
It exits non-zero, so it can go into CI later.
