# v104 — back, forward, and 233 more words

## 1. The back button left the app

This app has no router. Screens were swapped with `setScreen(name)` and nothing
ever touched the history stack. Measured in a real browser against the shipped
v103 build:

```
home → Practice → Flashcards → browser back
AFTER BROWSER BACK -> url: about:blank
```

`history.length` was 2 at the home screen and **still 2 after two
navigations**. On Android, and in any installed PWA, the system back gesture is
that button — so from every screen in this app, back closed it. Nobody reports
that bug; they assume they did something wrong.

There is now a real navigation stack. Back walks up it, and only leaves from
the home screen, where leaving is correct. A stack that traps you is worse than
one that does nothing.

It also means the app finally knows **which way you are going** — a `popstate`
is a return, a `navigate()` is a departure — which is what the rest of this
release is built on.

## 2. Screens now move, and forward and back move differently

`.screen-enter` was an entrance and only an entrance: the outgoing screen
vanished on the same frame the new one began fading up, at the same 240ms, in
the same direction, whether you were going deeper or coming back. That reads as
a slideshow.

Navigation now runs through the **View Transition API**, which does the work on
the compositor — the browser snapshots the old screen, lets React swap the DOM,
snapshots the new one, and animates between two real layers. No double-mounting,
no measuring, nothing per-frame on the main thread, no library.

Verified present in this project's Chromium (141) before building on it: the
object form with `types`, `:active-view-transition-type()`, `view-transition-class`
and `skipTransition`. Where it is absent — Firefox — `navigate` just updates
state and the old `.screen-enter` plays, exactly as before.

**The two directions are deliberately not mirror images.** Going forward the
arriving screen travels the full distance and the one you are leaving eases
back a little; coming back, the screen you are *returning to* is the subject, so
it barely moves while the other gets out of the way. Exit is faster than entry
(200ms against 320ms) because the thing you are leaving does not need your
attention. That is the grammar every phone has used for a decade, and it is why
back feels like a return rather than another departure.

**What must not move is the chrome.** By default the whole document is one
snapshot, so a naive version slides the bottom nav and side rail off with the
content and the app appears to come apart. `main`, `.bottom-nav` and
`.side-rail` each get their own `view-transition-name`; only the content panel
travels. That standing-still frame is what makes it read as one place.

Two things caught by screenshotting mid-transition rather than watching it:

- `main` carries no background of its own, so the first version slid a
  **transparent** panel over the old screen and you could read both at once for
  300ms. It looked like a printing fault. At full speed it registers only as
  "that felt cheap".
- `.screen-enter` and the view transition both ran, animating the panel twice.

## 3. Scroll is remembered

`navigate` ran `window.scrollTo(0, 0)` unconditionally. Right when you go
deeper, wrong when you come back — returning to a long home screen always threw
away your place. Forward starts at the top; back puts you where you were.

And tapping the tab you are already on now returns you to the top, smoothly,
which is what every phone does and what this app previously ignored entirely.

## 4. A second and a half of "Loading…" on the busiest tabs

Seventeen screens are code-split, which is right — it keeps the first paint
small. The cost is that the first visit to a split screen fetches it. Measured
at 400kbps with 150ms latency, an ordinary phone on a weak signal:

```
Speak tab      "Loading…" for ~1400ms
Missions tab   "Loading…" for ~1500ms
```

Both are one tap from everywhere, via the bottom bar.

Those chunks are now warmed during idle time after boot — `requestIdleCallback`,
sequentially, nav destinations first, so the prefetch cannot compete with the
first render and seventeen parallel requests cannot fight each other on a slow
line.

**Save-Data is honoured**, and that is checked rather than asserted, because a
speculative download is exactly the kind of thing that setting exists to
refuse. Both arms are measured, since a check that only looks at the fast path
cannot tell "the prefetch worked" from "the harness cannot see a spinner":

```
tab         prefetched   Save-Data (prefetch off)
Speak       50ms         1400ms
Missions    0ms          1500ms
```

## 5. The word search crashed the screen in ten languages

`My words` filtered like this:

```js
!v.translation.toLowerCase().includes(q) && !v.translit.toLowerCase().includes(q)
```

`translit` is absent on Latin-script words — **612 of them**, and in
Vietnamese, Yoruba, Somali and Tagalog it is absent from *every word in the
pack*. So the moment a query failed to match a translation, `.toLowerCase()`
ran on `undefined`:

```
😵 Something went wrong — Cannot read properties of undefined (reading 'toLowerCase')
```

In those four languages that was the first keystroke, every time. Six of the
seven languages in the new check reproduce it against v103.

It also never searched the word itself — only its English gloss. You could not
find `hola` in a Spanish pack, on the screen called "My words".

And it matched literally. Nobody hunting for **chào** on an English keyboard is
going to type the grave accent, and Yoruba would need a sub-dot and two tone
marks. Query and text are now both folded to bare letters, so `chao` finds
`chào`, `degil` finds `değil`, and an exactly-typed query still matches because
folding applies to both sides. Yoruba `oko` returns the three-way minimal set
v102 documented — **ọkọ̀** vehicle, **ọkọ** husband, **oko** farm.

`đ ø ł ı ß æ œ ŋ` are handled explicitly: they are single letters in Unicode
with no accented base to strip, so NFD leaves them alone and a Vietnamese
learner typing `duong` would otherwise still miss **đường**.

## 6. The legal policies were in everybody's first download

The build had been saying so since v78:

```
(!) Legal.jsx is dynamically imported by App.jsx but also statically imported
    by screens.jsx, dynamic import will not move module into another chunk.
```

v78 split the policies out for a stated reason — *"a learner opening the app to
do a lesson downloaded the mission engine, the fluency dial, the dialect drill
and three legal policies before the first word appeared"* — and one
ordinary-looking import in `screens.jsx` silently cancelled it. Onboarding does
need the reader inline (a link that leaves the flow loses the answers), so it
now has its own lazy handle and its own Suspense. Legal is a 1.5KB chunk again.

## 7. Tier 3 was a label, not a target — now it is twelve words

`coreVocabulary.js` had a third tier of eight concepts: head, hand, heart,
black, white, sun, rain, train. **All twenty-one packs already taught all
eight.** A tier that names no gap asks nothing of a new pack and tells a
finished one nothing.

The replacement was chosen by measuring what every pack was missing at once,
not by taste:

```
to wait   0/21 taught      easy       0/21
to pay    1/21             difficult  0/21
key       1/21             old        2/21
phone     1/21             red        2/21
to write  3/21             blue       2/21
to live   3/21             door       3/21
```

They hang together: waiting, paying, a key, a phone, a door, and enough
adjective to say which one you mean. That is most of an afternoon out in a city
whose language you don't have — the situation this app is built for.

**21 languages · 3,401 → 3,634 words · 5,031 → 5,264 sentences.**

Two things the validators caught in my own content, which is what they are for:

- A Korean example, `여기에 이름을 쓰세요`, was a sentence `extraExamples.js`
  already gives to 이름. `mergeExamples` dedupes by native string, so it would
  have been dropped and taught nobody a second frame.
- Bengali **থাকা** was about to be added twice. It is already in the pack
  glossed "to have, to stay", and `to_live` accepts "to stay" — because থাকা
  genuinely covers both. Widening what the concept accepts is the fix; teaching
  the word twice is the v100 mistake.

And two I fixed by hand: Spanish *viejo* had a feminine example (`una casa
vieja`) and French *vieux* had `une vieille maison` — a learner meeting the one
French agreement that does not look like the word on the card would reasonably
conclude they had been shown the wrong word.

**Honest about the rest:** 50 of the 233 new examples do not contain their
headword literally, against a repo baseline of 343 in 5,031. That is higher
because this tier is verb-heavy and verbs are what inflects — Arabic ينتظر
appears as أنتظر, Japanese 待つ as 待ちます, Korean 기다리다 as 기다려요. It is
the soft failure `InContext` has documented since v79, not a defect, but it
does mean the highlight will not fire on those cards.

**Somali is the pack I am least sure of** and its sentences are kept short for
that reason. It wants a native-speaker pass, and so does Yoruba's `dúró de`.

## Checks added

Each was run against a build with its fix removed, and each failed there.

| | |
|---|---|
| `verify-navigation` | the stack, the direction, the chrome holding still, scroll, reduced motion — **8 failures against v103** |
| `verify-prefetch` | both arms: tabs instant when prefetching, stalling when Save-Data is set |
| `verify-word-search` | nine searches in seven languages — **6 of 7 crash against v103** |

`verify-navigation` also asserts that with `prefers-reduced-motion` set, **no
view transition runs at all**. A full-screen sliding panel is precisely what
that setting exists to stop, and the navigation still has to happen — the
movement is optional, the navigation is not.
