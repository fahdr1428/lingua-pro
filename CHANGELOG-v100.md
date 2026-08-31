# v100 — nineteen packs, one course

Nothing in the repo said what a language pack was *for*. Nineteen of them were
written in different passes, and they drifted. Measured before anything was
touched:

| | |
|---|---|
| distinct concepts across the app | **420** |
| taught in all 19 languages | **53** |
| taught in exactly **one** language | **147** |
| words in the Persian pack | **120** |
| words in the Spanish pack | **193** |

Which language you picked decided how much of a course you got.

## What was actually missing

Not obscure vocabulary. These:

- **Punjabi did not teach "eat".** Persian did not teach "drink". Chinese did not
  teach "want". German did not teach "hot".
- **Arabic, German, Hindi, Japanese and Turkish taught "I" and "you" and stopped.**
  No *he*, no *she*, no *we* — you could introduce yourself and then not mention
  anyone else. Arabic and Japanese also stopped counting at three.
- **Five packs had no word for "bathroom"** — while the Sentence Lab, added last
  week, teaches the sentence *"Where is the bathroom?"* in three of them.
- Persian, Malayalam, Tamil, Somali and Tagalog had no *hand*, *head*, *year*,
  *car* or *hotel*. Tagalog had no **kanin**.

## The spine

`src/data/coreVocabulary.js` — 115 concepts in three tiers. A concept is a
**meaning**, not a word, because languages carve meaning differently: Persian
خوردن covers eat and drink, and "uncle (mother's brother)" is still *uncle*. So
each concept lists the glosses that count as teaching it.

| tier | | enforcement |
|---|---|---|
| **survival** (42) | you cannot get through a day without it | build fails |
| **everyday** (65) | the ordinary business of talking to family | warning |
| **reach** (8) | genuinely optional | reported |

It's a floor, not a ceiling. Packs are expected to go past it with what matters
in that language — Arabic's 244 example frames, Punjabi's kinship terms.

## 182 words later

```
                      before          after
concept gaps            197              7   (all tier 3, all optional)
survival coverage    29/42 … 42/42    42/42 in every language
everyday coverage    55/65 … 65/65    65/65 in every language
Persian                 120            141
Tamil                   124            140
total                  2,965          3,145
```

Every word carries an example sentence. All 182 were opened in a real browser and
found on screen, in their own script.

## Half the "missing" words weren't missing

The first merge tried to add 25 words the packs already had under a different
gloss: `cooked rice` vs `rice`, `hunger` vs `hungry`, `illness` vs `sick`. That
is the same inconsistency wearing different clothes, and the fix is the concept
list accepting both — not a duplicate word. Two more were genuine finds:

- **Korean 차 is both tea and car.** The pack taught it as tea, so the car had to
  be the unambiguous 자동차.
- **Tamil கூட means "with" *and* "also".** The pack taught half of it; the gloss
  now says both, which closed the gap without adding anything.

## One card, one spelling

Second half of the ask: consistency. `validate-word-frames.mjs` asks whether a
card's romanisation agrees with the romanisation of its own example sentence. It
found 68 cards that told the learner two things:

```
suq / sooq        qalilan / qaleelan        arigatou / arigatō
khana / khaana    a'ish / aeesh             ma-eum / maeum
```

**The first version of this check was wrong**, and that matters more than the
fix. It asked whether the card's romanisation appeared *inside* the sentence's —
which fires on every inflected language in the app:

```
✗ ar "يذهب": the card says "yadhhab" and the sentence "adhhab ila al-bayt"
```

That is not an error. يذهب is the third-person form a dictionary lists, أذهب is
"I go", and Arabic inflects on the *front* of the word. 29 healthy cards
reported as broken is a check that gets switched off — and then the real
problems underneath never surface.

## The automated fix was wrong too

Having found 68, the obvious move is to normalise them. The dry run wanted to
make these changes:

```
bú shì     → bù shì          一 and 不 change tone before a fourth tone
yí ge rén  → yī ge rén       and the example is the form you SAY
xǐhuan     → xǐhuān          the second syllable goes neutral inside the word
```

Every one rewrites **correct pinyin into wrong pinyin**. `foldConvention` strips
tone marks so the *checker* tolerates sandhi; using that same fold to drive a
*rewrite* inverts its purpose and destroys the distinction it exists to
tolerate. Chinese is now reported and never failed, with the reason in the code.

Punjabi and Urdu were excluded for the opposite reason — there the card was
often the *worse* spelling (پانی is `paani`, and the card said `pani`), so "card
wins" would have degraded the example. Those eight were done by hand, choosing
the better spelling and applying it to both.

The remaining 33 — Japanese macron/wapuro, Korean hyphens, Arabic apostrophes —
were fixed automatically, and the card wins there for a concrete reason:
`audio/tts.js` feeds that field to a near-language voice, and Hindi and Urdu
convert it back to Devanagari for speech scoring. Macrons are not safe in it.

## Guardrails

- `validate-core-vocab.mjs` — fails the build on a missing survival word. Proven:
  removing Persian's new دستشویی reports `fa: missing 1 survival word(s) — bathroom`
- `validate-word-frames.mjs` — fails on a card that spells its own word two ways.
  Proven: putting one macron back reports `ja "ありがとう": the card romanises it "arigatou" and its own example writes "arigatō"`
- `verify-new-words.mjs` — opens the app and finds all 182 on screen. Proven:
  serving a build with one Urdu word removed reports it missing. It deliberately
  does **not** claim to prove lesson reachability — moving a word to an
  undefined unit changed nothing here, because the word list ignores units.
  `validate-vocab` covers that, and the header now says so.
- `scripts/lib/romanisation.mjs` — `foldConvention` and `stemMatch` are now
  shared rather than copied, so the two checks cannot disagree about what counts
  as the same word.
- **German is no longer case-folded** for duplicate lemmas. `Essen` (food) and
  `essen` (to eat), `Sie` (you) and `sie` (she), are different words, and the old
  rule would have called all four duplicates.

## Verified

- `npm run check` — 3,145 words, 4,038 sentences, every validator and audit, exit 0
- `npm run validate-core-vocab` — every language teaches every survival word
- `npm run verify-new-words` — 182 of 182 found on screen
- full browser fuzz across all 19 languages
