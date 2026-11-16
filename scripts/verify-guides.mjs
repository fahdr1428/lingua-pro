// =============================================================================
// verify-guides.mjs (v119) — the guides have faces, and the faces respond.
//
//   EVERY LANGUAGE (21, at 360px)
//   · Home's greeting is the guide's drawn face (an SVG portrait, not a letter
//     in a ring) beside a speech bubble with their name; the face is a button
//     with an accessible name; nothing scrolls sideways.
//   THE GUIDE TALKS (Urdu, with a stand-in speech engine)
//   · the mouth moves while the greeting is written out, and stops after;
//   · the first hello is the start of the guide's introduction, short enough
//     for a bubble, in whole sentences;
//   · tapping the face speaks the guide's own line in their language, the
//     mouth moves exactly while it plays, the line and its meaning appear in
//     the bubble, and the guide is pleased afterwards;
//   · with no voice on the device, tapping still shows the line and nothing
//     breaks.
//   LESSONS
//   · after an answer the guide reacts, and the expression matches the answer:
//     pleased for a right one, encouraging for a miss;
//   · the results screen ends with the guide's own line, encouraging after a
//     hard lesson.
//   SIGN-UP
//   · every language card shows who teaches it; picking a language brings the
//     guide, asking the first questions, into view.
//   SENTENCE LAB — the card's title has no "(note: …)" in it.
//   REDUCED MOTION — the blink stops.
// =============================================================================

import { chromium } from "playwright";
import { LANGUAGES } from "../src/data/registry.js";
import { CHARACTERS, getCelebration } from "../src/data/characters.js";
import { firstSentences } from "../src/ui/textShape.js";
import { loadPack } from "./lib/inventory.mjs";

const BASE = process.env.BASE || "http://localhost:4173";
const problems = [];
const fail = (m) => { console.log("    ✗ " + m); problems.push(m); };
const ok = (m) => console.log("    ✓ " + m);
const expect = (cond, good, bad) => (cond ? ok(good) : fail(bad));

const consent = { terms: true, ageConfirmed: 13, at: 1, policyVersion: "2026-08-06" };
const appSeed = (code, extra = {}) => ({
  onboarded: true, currentLanguage: code, tutorialSeen: true, dailyGoalXp: 35, soundEffects: false,
  sessionSize: 8, consent, themeSettled: true, theme: "ink", scriptCourse: { [code]: { passed: true } },
  lessonsCompleted: { [code]: 1 }, ...extra,
});

// A speech engine that "speaks" for 1.2s and records what it was asked to say.
const speechStub = (voiceLang) => {
  const voices = voiceLang ? [{ name: "Stand-in", lang: voiceLang, localService: true, default: false, voiceURI: "stand-in" }] : [];
  window.__spoken = [];
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      getVoices: () => voices,
      speak: (u) => { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 1200); },
      cancel() {}, pause() {}, resume() {}, speaking: false, pending: false, paused: false,
      addEventListener() {}, removeEventListener() {}, onvoiceschanged: null,
    },
  });
};

async function open(browser, { app, progress = null, stack = null, ctxOpts = {}, voice = undefined }) {
  const ctx = await browser.newContext({ viewport: { width: 414, height: 860 }, ...ctxOpts });
  if (voice !== undefined) await ctx.addInitScript(speechStub, voice);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/**", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(([a, p, s]) => {
    localStorage.clear();
    if (a) localStorage.setItem("lingua:app", a);
    if (p) localStorage.setItem("lingua:progress", p);
    if (s) sessionStorage.setItem("lingua:nav", JSON.stringify({ stack: JSON.parse(s), index: 0 }));
  }, [app && JSON.stringify(app), progress && JSON.stringify(progress), stack && JSON.stringify(stack)]);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(300);
  if (stack && stack.length > 1) {
    await page.waitForTimeout(1200);
    await page.evaluate(() => { history.pushState({ linguaIndex: 1 }, ""); history.pushState({ linguaIndex: 99 }, ""); history.back(); });
    await page.waitForTimeout(1500);
  }
  return { ctx, page, errors };
}
const avatarState = (page, sel) => page.evaluate((s) => {
  const a = document.querySelector(`${s} .guide-avatar`);
  return a ? { speaking: a.getAttribute("data-speaking") === "true", mood: a.getAttribute("data-mood") } : null;
}, sel);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

// ---------------------------------------------------------------------------
console.log("\n=== every guide has a face (21 languages, 360px) ===");
{
  const missing = [], seals = [], unnamed = [], small = [], wide = [];
  for (const code of Object.keys(LANGUAGES)) {
    const g = CHARACTERS[code];
    const { ctx, page, errors } = await open(browser, { app: appSeed(code, { metCharacters: [code] }), ctxOpts: { viewport: { width: 360, height: 740 } } });
    await page.waitForTimeout(1300);
    const r = await page.evaluate(() => {
      const box = document.querySelector("[data-testid=home-guide]");
      const svg = box?.querySelector(".guide-avatar svg");
      const btn = box?.querySelector("[data-testid=home-guide-face]");
      return {
        svg: !!svg, paths: svg ? svg.querySelectorAll("path,ellipse,circle").length : 0, text: svg ? svg.querySelectorAll("text").length : 0,
        w: svg ? svg.getBoundingClientRect().width : 0, label: btn?.getAttribute("aria-label") || "",
        bubble: box?.querySelector(".guide-bubble")?.innerText || "",
        sideways: document.scrollingElement.scrollWidth - window.innerWidth,
      };
    });
    if (!r.svg || r.paths < 12) missing.push(`${code} (${r.paths} shapes)`);
    if (r.text) seals.push(code);
    // innerText follows text-transform (the name line is in capitals).
    if (!r.label.includes(g.name) || !r.bubble.toLowerCase().includes(g.name.toLowerCase())) unnamed.push(code);
    if (r.w < 48) small.push(`${code} ${Math.round(r.w)}px`);
    if (r.sideways > 0) wide.push(`${code} +${r.sideways}px`);
    if (errors.length) fail(`${code}: page errors: ${errors.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }
  expect(!missing.length, "every Home shows its guide's drawn portrait", `no portrait on Home: ${missing.join(", ")}`);
  expect(!seals.length, "no guide is still a letter in a ring", `still a seal (an initial): ${seals.join(", ")}`);
  expect(!unnamed.length, "each face is a named button, and the bubble says who's talking", `face or bubble without the guide's name: ${unnamed.join(", ")}`);
  expect(!small.length, "every face is at least 48px", `faces too small: ${small.join(", ")}`);
  expect(!wide.length, "nothing scrolls sideways at 360px", `sideways scroll: ${wide.join(", ")}`);
}

// ---------------------------------------------------------------------------
console.log("\n=== the guide talks (Urdu) ===");
{
  const g = CHARACTERS.ur;
  const { ctx, page, errors } = await open(browser, { app: appSeed("ur"), voice: "ur-PK" });
  await page.waitForTimeout(250);
  const typing = await avatarState(page, "[data-testid=home-guide]");
  expect(typing?.speaking, "the mouth moves while the greeting is written out", "the mouth is still while the greeting is written out");
  await page.waitForTimeout(5600);
  const after = await avatarState(page, "[data-testid=home-guide]");
  expect(after && !after.speaking, "…and stops when it's written", "the mouth is still moving after the greeting is written");
  const bubble = (await page.locator("[data-testid=home-guide] .guide-bubble").innerText()).replace(/\s+/g, " ");
  const hello = firstSentences(g.intro);
  expect(bubble.includes(hello) && hello.length <= 140, `the first hello fits the bubble (${hello.length} characters), and is still there after 6 seconds`, `the bubble says "${bubble.slice(0, 160)}"`);
  const met = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}").metCharacters || []);
  expect(met.includes("ur"), "…while the meeting is recorded, so the next visit starts with a short line", `metCharacters is ${JSON.stringify(met)}`);

  await page.locator("[data-testid=home-guide-face]").click();
  await page.waitForTimeout(300);
  const during = await avatarState(page, "[data-testid=home-guide]");
  const spoken = await page.evaluate(() => window.__spoken);
  expect(spoken.includes(g.signature.text), `tapping the face says “${g.signature.text}”`, `tapping the face said ${JSON.stringify(spoken)}`);
  expect(during?.speaking, "the mouth moves while it plays", "the mouth is still while the guide speaks");
  const said = await page.locator("[data-testid=home-guide-said]").innerText().catch(() => "");
  expect(said.includes(g.signature.text) && said.includes(g.signature.en) && said.includes(g.signature.translit),
    "the line, how to say it, and what it means appear in the bubble", `the bubble shows "${said.replace(/\s+/g, " ")}"`);
  await page.waitForTimeout(1600);
  const done = await avatarState(page, "[data-testid=home-guide]");
  expect(done && !done.speaking && done.mood === "happy", "when it ends the mouth stops and the guide is pleased", `after speaking: ${JSON.stringify(done)}`);
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();

  // Tapping while the greeting is still being written.
  const mid = await open(browser, { app: appSeed("ur"), voice: "ur-PK" });
  await mid.page.waitForTimeout(200);
  await mid.page.locator("[data-testid=home-guide-face]").click();
  await mid.page.waitForTimeout(2400);
  const st = await avatarState(mid.page, "[data-testid=home-guide]");
  expect(st && !st.speaking, "tapping mid-greeting: the mouth stops when the line has been said", `tapped mid-greeting, then: ${JSON.stringify(st)}`);
  await mid.ctx.close();

  const quiet = await open(browser, { app: appSeed("ur", { metCharacters: ["ur"] }), voice: null });
  await quiet.page.waitForTimeout(1500);
  await quiet.page.locator("[data-testid=home-guide-face]").click();
  await quiet.page.waitForTimeout(600);
  const said2 = await quiet.page.locator("[data-testid=home-guide-said]").innerText().catch(() => "");
  const st2 = await avatarState(quiet.page, "[data-testid=home-guide]");
  expect(said2.includes(g.signature.en) && st2 && !st2.speaking, "with no voice on the device, tapping still shows the line", `no voice: bubble "${said2}", ${JSON.stringify(st2)}`);
  if (quiet.errors.length) fail(`page errors (no voice): ${quiet.errors.slice(0, 2).join(" | ")}`);
  await quiet.ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== the guide reacts in lessons ===");
{
  const pack = loadPack("ur");
  const { ctx, page, errors } = await open(browser, {
    app: appSeed("ur", { metCharacters: ["ur"], sessionSize: 6 }),
    stack: [{ screen: "home" }, { screen: "lesson", params: { mode: "smart" } }],
  });
  const seen = { happy: 0, encourage: 0 }, mismatched = [];
  let answered = 0, results = false;
  for (let step = 0; step < 500; step++) {
    if (await page.locator("[data-testid=lesson-results]").count()) { results = true; break; }
    const fb = page.locator("[data-testid=answer-feedback]");
    if (await fb.count()) {
      const result = await fb.getAttribute("data-result");
      const react = page.locator("[data-testid=guide-reaction]");
      if (await react.count()) {
        const mood = await react.getAttribute("data-mood");
        const faceMood = await react.locator(".guide-avatar").getAttribute("data-mood");
        if ((result === "correct") !== (mood === "happy") || faceMood !== mood) mismatched.push(`${result}→${mood}/${faceMood}`);
        seen[mood] = (seen[mood] || 0) + 1;
      }
    }
    // Answer: right for the first few questions it can work out, wrong after.
    const acted = await page.evaluate(([vocab, wantRight]) => {
      const root = document.getElementById("main");
      if (!root) return null;
      // Match pairs: try each left against each right; right pairs lock.
      if (/match each/i.test(root.innerText)) {
        const SKIP = /^(check|continue|next|skip|got it|hear|listen|play|back|close|✕)/i;
        const btns = [...root.querySelectorAll("button")].filter((b) => !b.disabled && (b.innerText || "").trim() && !SKIP.test((b.innerText || "").trim()));
        if (btns.length >= 2) {
          const half = Math.floor(btns.length / 2), L = btns.slice(0, half), R = btns.slice(half);
          for (const l of L) for (const r of R) if (!l.disabled && !r.disabled) { l.click(); r.click(); }
          if (!root.__tried) { root.__tried = 1; return "match"; }
        }
      }
      const go = [...root.querySelectorAll("button")].find((x) => !x.disabled && /^(Check|Continue|Got it|Next|Start|Start practice|I'm ready|Finish)/.test((x.innerText || "").trim()));
      if (go) { go.click(); return "go"; }
      const opts = [...root.querySelectorAll(".opt-btn:not([disabled])")];
      if (opts.length) {
        const q = (root.innerText.match(/word for "([^"]+)"/i) || [])[1];
        const item = q && vocab.find((v) => v.en.split(/[;,/(]/)[0].trim().toLowerCase() === q.toLowerCase());
        const right = item && opts.find((o) => o.innerText.includes(item.lemma) || (item.translit && o.innerText.includes(item.translit)));
        const wrong = opts.find((o) => o !== right);
        (wantRight && right ? right : wrong || opts[0]).click();
        return "opt";
      }
      const inp = root.querySelector("input[type=text], textarea");
      if (inp && !inp.value) { const set = Object.getOwnPropertyDescriptor(inp.constructor.prototype, "value").set; set.call(inp, "x"); inp.dispatchEvent(new Event("input", { bubbles: true })); return "typed"; }
      const tile = root.querySelector(".word-tile:not([disabled]), .tile:not([disabled])");
      if (tile) { tile.click(); return "tile"; }
      const skip = [...root.querySelectorAll("button")].find((x) => !x.disabled && /^(Skip|I can't listen now|Can't speak now|skip this one)/i.test((x.innerText || "").trim()));
      if (skip) { skip.click(); return "skip"; }
      return null;
    }, [pack.vocab.map((v) => ({ lemma: v.lemma, translit: v.translit, en: v.translation || "" })), answered < 6]);
    if (acted === "opt") answered++;
    await page.waitForTimeout(acted ? 260 : 600);
  }
  expect(!mismatched.length && seen.happy > 0 && seen.encourage > 0,
    `the guide's face matches every answer (${seen.happy} pleased, ${seen.encourage} encouraging)`,
    `reactions: ${JSON.stringify(seen)}; mismatched: ${mismatched.slice(0, 4).join(", ")}`);
  if (results) {
    const acc = await page.evaluate(() => Number((document.body.innerText.match(/(\d+)%/) || [])[1]));
    const tier = acc === 100 ? "perfect" : acc >= 80 ? "great" : acc >= 60 ? "good" : "keep_going";
    const line = await page.locator("[data-testid=results-guide]").innerText().catch(() => "");
    const mood = await page.locator("[data-testid=results-guide]").getAttribute("data-mood").catch(() => null);
    const want = tier === "keep_going" ? "encourage" : tier === "good" ? "idle" : "happy";
    expect(line.includes(getCelebration("ur", tier)) && mood === want,
      `the results end with ${CHARACTERS.ur.name}'s own line, ${mood} after ${acc}%`,
      `results guide: "${line.replace(/\s+/g, " ")}" mood ${mood} (wanted ${want} for ${acc}%)`);
  } else fail(`the lesson never reached its results — stopped at "${(await page.evaluate(() => document.getElementById("main")?.innerText || "")).replace(/\s+/g, " ").slice(0, 140)}"`);
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== sign-up ===");
{
  const { ctx, page, errors } = await open(browser, { app: null, ctxOpts: { viewport: { width: 390, height: 760 } } });
  await page.locator("button", { hasText: "Get started" }).click();
  await page.waitForTimeout(500);
  const faces = await page.evaluate(() => [...document.querySelectorAll("[data-testid^=lang-guide-]")].filter((e) => e.querySelector(".guide-avatar svg")).length);
  expect(faces === Object.keys(LANGUAGES).length, `every language card shows who teaches it (${faces})`, `${faces} of ${Object.keys(LANGUAGES).length} cards show their guide`);
  await page.locator("button").filter({ hasText: "Urdu" }).first().click();
  await page.waitForTimeout(1200);
  const q = await page.evaluate(() => {
    const g = document.querySelector("[data-testid=start-guide]");
    const r = document.querySelector("[data-testid=start-questions]")?.getBoundingClientRect();
    return { text: g?.innerText || "", top: r ? r.top : -1, h: window.innerHeight };
  });
  expect(/amina/i.test(q.text), "picking Urdu, Amina asks the first questions", `no guide over the questions: "${q.text}"`);
  expect(q.top >= 0 && q.top < q.h * 0.5, "…and they're brought into view", `the questions sit at ${Math.round(q.top)}px of a ${q.h}px screen`);
  if (errors.length) fail(`page errors: ${errors.slice(0, 2).join(" | ")}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== Sentence Lab card title ===");
{
  const { ctx, page } = await open(browser, { app: appSeed("ur", { metCharacters: ["ur"], lessonsCompleted: { ur: 20 }, sentenceDropsDone: { ur: 0 }, totalXp: 500 }), progress: {} });
  await page.waitForTimeout(1500);
  const eyebrow = await page.locator("[data-testid=hero-eyebrow]").innerText().catch(() => "");
  const title = await page.locator(".hero-premium").first().innerText().catch(() => "");
  if (/sentence lab/i.test(eyebrow)) {
    expect(!/\(note:|\(/.test(title.split("\n").slice(0, 2).join(" ")) && /verb comes last/i.test(title),
      "the title is short and the note sits underneath", `the card reads "${title.replace(/\s+/g, " ").slice(0, 120)}"`);
  } else fail(`Home's card was "${eyebrow}", not the Sentence Lab`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== if the face can't load ===");
{
  // The drawing is its own chunk. Blocked (offline before it was fetched, or
  // a tab older than the deploy), Home must still work.
  const ctx = await browser.newContext({ viewport: { width: 414, height: 860 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route(/GuideAvatar-[^/]*\.js$/, (r) => r.abort());
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate((a) => { localStorage.clear(); localStorage.setItem("lingua:app", a); }, JSON.stringify(appSeed("ur", { metCharacters: ["ur"] })));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(4500);
  // The app's error boundary treats a failed chunk as a stale deploy: it
  // reloads once, then says "Zaban just updated". Neither may happen here.
  const r = await page.evaluate(() => ({
    hero: !!document.querySelector(".hero-premium [data-testid=hero-go]"),
    bubble: document.querySelector("[data-testid=home-guide] .guide-bubble")?.innerText || "",
    disc: !!document.querySelector("[data-testid=home-guide] .guide-avatar-wait"),
    broken: /Something went wrong|Zaban just updated/i.test(document.body.innerText),
    reloaded: sessionStorage.getItem("lingua:chunk-reload"),
  }));
  r.broken = r.broken || r.reloaded === "1";
  expect(r.hero && !r.broken && /amina/i.test(r.bubble) && r.disc,
    "with the face's file blocked, Home still works: the guide's colour, the greeting, the lesson",
    `face blocked: ${JSON.stringify(r)}${errors.length ? " errors: " + errors.slice(0, 2).join(" | ") : ""}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------
console.log("\n=== reduced motion ===");
{
  const anim = async (reducedMotion) => {
    const { ctx, page } = await open(browser, { app: appSeed("ur", { metCharacters: ["ur"] }), ctxOpts: { reducedMotion } });
    await page.waitForTimeout(1200);
    const n = await page.evaluate(() => {
      const e = document.querySelector("[data-testid=home-guide] .ga-eyes");
      return e ? getComputedStyle(e).animationIterationCount : null;
    });
    await ctx.close();
    return n;
  };
  const normal = await anim("no-preference"), reduced = await anim("reduce");
  expect(normal === "infinite", "the guide blinks now and then", `blink animation: ${normal}`);
  expect(reduced === "1", "…and not when the device asks for less motion", `with reduced motion the blink repeats: ${reduced}`);
}

await browser.close();
console.log(problems.length ? `\nverify-guides: ${problems.length} problem(s)` : "\nverify-guides: all pass");
process.exit(problems.length ? 1 : 0);
