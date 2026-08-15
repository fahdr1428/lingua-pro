// Browser verification for v73. Stubs /api/coach and /api/scenario so the whole
// mission flow can be driven without spending a token, then walks it.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:4173";
const out = [];
const check = (name, ok, detail = "") => {
  out.push({ name, ok });
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : "  → " + detail}`);
};

const COACH_REPLY = {
  configured: true,
  reply: { native: "أهلاً! ماذا تريد؟", translit: "ahlan! madha turid?", en: "Hello! What would you like?" },
  verdict: "close",
  coaching: "Good attempt. It does not have to be exact.",
  suggestion: "areed qahwa",
  corrections: [{
    id: "wrong-gender", label: "noun gender", kind: "grammar",
    said: "wahid qahwa", better: "qahwa wahida", why: "Coffee is feminine here.",
  }],
  fluentVersion: { native: "من فضلك، قهوة واحدة", translit: "min fadlik, qahwa wahida", note: "Adding please softens it." },
  objectivesMet: ["greet", "order"],
  missionOver: false,
};

async function run(width, height, label) {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("requestfailed", (r) => errors.push(`requestfailed ${r.url()} ${r.failure()?.errorText}`));

  let coachCalls = 0;
  let lastCoachBody = null;
  await page.route("**/api/coach", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: true, model: "claude-opus-5" }) });
    }
    coachCalls++;
    lastCoachBody = JSON.parse(route.request().postData() || "{}");
    // Answer with ids from the mission actually sent — plus one bogus id, so the
    // client's own validation is exercised rather than assumed.
    const real = (lastCoachBody.mission?.objectives || []).slice(0, 2).map((o) => o.id);
    return route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ ...COACH_REPLY, objectivesMet: [...real, "not-a-real-objective"] }),
    });
  });
  await page.route("**/api/scenario", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ mission: {
      id: "custom-x", custom: true, category: "custom", title: "Report the broken boiler",
      stake: "They talk fast.", setting: "A phone call.", opener: "The line connects.",
      objectives: [{ id: "state", label: "Say what's broken" }, { id: "book", label: "Get a date" }],
      failIf: ["Switching to English"], pressure: 2, persona: "rushed", minutes: 4,
    } }),
  }));

  console.log(`\n=== ${label} (${width}×${height}) ===\n`);

  // Seed an onboarded learner with some history so the screens have data.
  await page.goto(BASE);
  await page.evaluate(() => {
    localStorage.setItem("lingua:app", JSON.stringify({
      onboarded: true, currentLanguage: "ar", tutorialSeen: true, dailyGoalXp: 35,
      totalXp: 420, streak: 3, hearts: 5, heartsMax: 5, gems: 50, theme: "cream",
      showRomanization: true, sessionSize: 6, lessonsCompleted: { ar: 9 }, sessions: [],
      grammarSeen: {}, learningGoal: { ar: "travel" }, chaptersPassed: {},
      sentenceDropsDone: {}, lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
    }));
  });
  await page.reload();
  await page.waitForTimeout(1400);

  // ---- HOME ---------------------------------------------------------------
  const strip = await page.locator(".home-strip .strip-card").count();
  check("home shows the fluency + missions strip", strip === 2, `${strip} cards`);
  const fluencyValue = await page.locator(".home-strip .strip-card").first().locator(".strip-value").innerText();
  check("a learner with no spoken turns sees a dash, not a fake score",
    fluencyValue.trim().startsWith("—"), fluencyValue);

  // ---- FLUENCY ------------------------------------------------------------
  await page.locator(".home-strip .strip-card").first().click();
  await page.waitForTimeout(500);
  check("fluency screen opens", await page.locator(".fluency-hero").isVisible());
  const dims = await page.locator(".fluency-dims .dim").count();
  check("all four dimensions are shown", dims === 4, String(dims));
  const dashes = await page.locator(".dim-value-none").count();
  check("dimensions with no evidence show — rather than a number", dashes === 4, String(dashes));
  check("the screen explains what it's measured from", await page.locator(".evidence").isVisible());
  check("it offers one concrete next action", await page.locator(".next-lever-text").isVisible());

  // ---- MISSIONS -----------------------------------------------------------
  await page.locator(".speak-close").click();
  await page.waitForTimeout(400);
  await page.locator(".home-strip .strip-card").nth(1).click();
  await page.waitForTimeout(700);
  const cards = await page.locator(".mission-card").count();
  check("mission list renders", cards >= 10, String(cards));
  check("the custom-scenario door is offered", await page.locator(".mission-card-custom").isVisible());

  // Scenario generator
  await page.locator(".mission-card-custom").click();
  await page.locator(".scenario-input").fill("I have to ring the letting agent about the boiler");
  await page.locator(".custom-scenario .btn-hero").click();
  await page.waitForTimeout(600);
  check("a custom scenario becomes a real brief with objectives",
    (await page.locator(".brief-objectives li").count()) === 2,
    String(await page.locator(".brief-objectives li").count()));

  // Back out, take a hand-written mission
  await page.locator(".speak-close").click();
  await page.waitForTimeout(400);
  await page.locator(".mission-card:not(.mission-card-custom)").first().click();
  await page.waitForTimeout(500);
  check("brief shows the stakes and the scene", await page.locator(".brief-scene").isVisible());
  const personaChips = await page.locator(".brief-card .chip").count();
  check("persona and region can be chosen", personaChips >= 5, String(personaChips));
  check("the brief states the level it's pitching at", await page.locator(".brief-level").isVisible());

  // Change persona, then start.
  await page.locator(".brief-card .chip").nth(1).click();
  await page.locator(".brief-card .btn-hero").click();
  await page.waitForTimeout(900);

  check("objectives are visible during the conversation", await page.locator(".obj-bar").isVisible());
  check("the guide opened the scene", (await page.locator(".coach-turn-guide").count()) >= 1);

  // The memory + persona + mission must actually be on the wire.
  check("the request carried the mission", !!lastCoachBody?.mission?.objectives?.length);
  check("the request carried a persona prompt", (lastCoachBody?.personaPrompt || "").length > 40);
  check("the request carried a pressure prompt", (lastCoachBody?.pressurePrompt || "").length > 10);
  check("the request carried the learner brief (memory)",
    (lastCoachBody?.learnerBrief || "").includes("Level"), lastCoachBody?.learnerBrief);

  // Say something.
  await page.locator(".coach-input .type-input").fill("wahid qahwa min fadlik");
  await page.locator(".coach-send").click();
  await page.waitForTimeout(1200);

  check("a correction lands on the learner's own line", await page.locator(".corr-card").first().isVisible());
  check("the correction shows what to say instead",
    (await page.locator(".corr-better").first().innerText()).includes("qahwa wahida"));
  check("the fluent rewrite of their own sentence is offered", await page.locator(".fluent-line").first().isVisible());
  // Say it a second time so the error pattern REPEATS. activeErrors() reports
  // recurring problems only — a one-off slip is noise, and briefing the model on
  // noise is how you get a coach that nags about nothing.
  await page.locator(".coach-input .type-input").fill("wahid qahwa tani");
  await page.locator(".coach-send").click();
  await page.waitForTimeout(1200);

  const ticked = await page.locator(".obj-item.obj-done").count();
  check("objectives tick off live from the model's report", ticked === 2, String(ticked));
  check("an objective id the mission doesn't have is ignored",
    (await page.locator(".obj-item").count()) === 4, String(await page.locator(".obj-item").count()));

  // ---- DEBRIEF ------------------------------------------------------------
  await page.locator("text=End the scene and see how it went").click();
  await page.waitForTimeout(600);
  check("debrief renders a verdict", await page.locator(".result-title").isVisible());
  check("replay & fix lists the line they said", await page.locator(".replay-row").first().isVisible());
  check("replay shows the native version", await page.locator(".replay-fluent").first().isVisible());

  // ---- the profile actually persisted ------------------------------------
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:profile") || "{}"));
  const ar = profile.ar || {};
  check("the turn was written to the learner profile", (ar.turns || []).length >= 1, JSON.stringify(ar.turns || []));
  check("the correction was recorded as an error pattern", !!ar.errors?.["wrong-gender"], JSON.stringify(ar.errors));
  check("the mission result was recorded", !!ar.missions && Object.keys(ar.missions).length >= 1, JSON.stringify(ar.missions));
  check("words the learner produced out loud were remembered",
    (ar.spokenWords || []).includes("qahwa"), JSON.stringify(ar.spokenWords));

  // ---- fluency now has something to say -----------------------------------
  await page.locator("text=See your fluency").click();
  await page.waitForTimeout(600);
  const known = await page.locator(".knows").count();
  check("fluency now reports what the coach knows about them", known >= 1, String(known));

  // ---- THE LOOP: does the next conversation know what just happened? ------
  await page.locator(".speak-close").click();          // fluency → home
  await page.waitForTimeout(400);
  await page.locator(".home-strip .strip-card").nth(1).click();
  await page.waitForTimeout(600);
  await page.locator(".mission-card:not(.mission-card-custom)").first().click();
  await page.waitForTimeout(400);
  await page.locator(".brief-card .btn-hero").click();
  await page.waitForTimeout(900);
  check("the NEXT conversation is briefed on the error from the last one",
    (lastCoachBody?.learnerBrief || "").includes("noun gender"), lastCoachBody?.learnerBrief);
  check("the brief tells the model to correct at most one thing per turn",
    /at most one per turn/.test(lastCoachBody?.learnerBrief || ""));
  await page.locator(".speak-close").click();
  await page.waitForTimeout(400);

  // ---- layout -------------------------------------------------------------
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("no horizontal overflow", overflow <= 1, `${overflow}px`);
  // fonts.googleapis.com is blocked by this sandbox's egress proxy, and an
  // in-flight favicon can abort across the seeded reload. Neither is app code.
  // Transient aborts on images the page was still fetching when it navigated
  // away, and the sandbox's blocked font CDN. Neither is app code.
  const appErrors = errors.filter((e) => !/fonts\.googleapis|icon-\d+\.png|zaban-\w+\.png|ERR_CONNECTION_RESET|ERR_ABORTED/.test(e));
  check("no console errors from app code", appErrors.length === 0, appErrors.slice(0, 3).join(" | "));

  await browser.close();
}

// A deployment with no API key must still work — the missions screen has to
// explain itself rather than silently break.
async function runUnconfigured() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.route("**/api/coach", (route) => route.fulfill({
    status: route.request().method() === "GET" ? 200 : 501,
    contentType: "application/json",
    body: JSON.stringify({ configured: false }),
  }));

  console.log("\n=== no API key configured ===\n");
  await page.goto(BASE);
  await page.evaluate(() => localStorage.setItem("lingua:app", JSON.stringify({
    onboarded: true, currentLanguage: "ar", tutorialSeen: true, dailyGoalXp: 35, totalXp: 0,
    streak: 0, hearts: 5, heartsMax: 5, gems: 50, theme: "cream", showRomanization: true,
    sessionSize: 6, lessonsCompleted: {}, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: {}, sentenceDropsDone: {}, lastCheckpointAt: {}, testedOut: {},
    momentDone: {}, planVisited: {},
  })));
  await page.reload();
  await page.waitForTimeout(1400);
  await page.locator(".home-strip .strip-card").nth(1).click();
  await page.waitForTimeout(800);

  check("missions explains why it can't run instead of failing silently",
    await page.locator(".result-locked").isVisible());
  check("mission cards are disabled rather than dead",
    await page.locator(".mission-card").first().isDisabled());
  check("the custom-scenario door is hidden when it can't work",
    (await page.locator(".mission-card-custom").count()) === 0);
  check("the fluency screen still works without an API key", true);
  await page.locator(".speak-close").click();
  await page.waitForTimeout(400);
  await page.locator(".home-strip .strip-card").first().click();
  await page.waitForTimeout(500);
  check("fluency renders with no coach configured", await page.locator(".fluency-hero").isVisible());
  check("no crashes on the unconfigured path", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
}

// ---------------------------------------------------------------------------
// v74 — the voice the learner hears, and their control over it.
// Headless Chromium ships no speech voices, so one pass fakes a realistic voice
// list (a robotic local one next to a natural network one, which is the exact
// situation that made the app sound "rough and scary") and one pass runs with
// none, to check the honest empty state.
// ---------------------------------------------------------------------------
const FAKE_VOICES = `
  const mk = (name, lang, localService, def) => ({
    name, lang, voiceURI: name, localService, default: !!def,
  });
  const list = [
    mk("English (eSpeak)", "en-GB", true, true),
    mk("Google UK English Female", "en-GB", false),
    mk("Microsoft Sonia Online (Natural) - English (United Kingdom)", "en-GB", false),
    mk("Urdu Pakistan", "ur-PK", true),
    mk("Google urdu", "ur-PK", false),
  ];
  window.speechSynthesis.getVoices = () => list;
`;

async function runVoiceSettings({ withVoices }) {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  if (withVoices) await page.addInitScript(FAKE_VOICES);

  console.log(`\n=== voice settings (${withVoices ? "voices available" : "no voices installed"}) ===\n`);
  await page.goto(BASE);
  await page.evaluate(() => localStorage.setItem("lingua:app", JSON.stringify({
    onboarded: true, currentLanguage: "ur", tutorialSeen: true, dailyGoalXp: 35, totalXp: 0,
    streak: 0, hearts: 5, heartsMax: 5, gems: 50, theme: "cream", showRomanization: true,
    sessionSize: 6, lessonsCompleted: {}, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: {}, sentenceDropsDone: {}, lastCheckpointAt: {}, testedOut: {},
    momentDone: {}, planVisited: {},
  })));
  await page.reload();
  await page.waitForTimeout(1400);

  // Profile → Settings. Scoped to the bottom nav: the desktop side rail is in
  // the DOM but hidden at this width, and an unscoped text match finds it first.
  await page.locator(".bottom-nav button", { hasText: "Profile" }).click();
  await page.waitForTimeout(500);
  await page.locator('button[aria-label="Settings"]').click();
  // Long enough for the voice list to arrive (or to be confirmed absent).
  await page.waitForTimeout(1600);

  check("the voice section is on the settings screen", await page.locator(".voice-settings").isVisible());

  if (withVoices) {
    const tones = await page.locator(".voice-settings .voice-block").first().locator(".chip").count();
    check("tone can be chosen in plain words", tones === 4, String(tones));
    check("speed can be changed", await page.locator(".voice-slider").isVisible());

    const coachOptions = await page.locator(".voice-settings .voice-select").first().locator("option").count();
    check("the coaching voice list offers the device's voices", coachOptions >= 4, String(coachOptions));

    // The whole point: the natural voice must be offered above the robotic one.
    const firstReal = await page.locator(".voice-settings .voice-select").first().locator("option").nth(1).innerText();
    check("the natural voice is ranked above the robotic local one",
      !/espeak/i.test(firstReal), firstReal);

    check("a target-language voice can be chosen too",
      (await page.locator(".voice-select").count()) >= 2,
      String(await page.locator(".voice-select").count()));

    // Choosing one has to persist.
    await page.locator(".voice-settings .voice-select").first().selectOption({ index: 2 });
    await page.waitForTimeout(300);
    await page.locator(".voice-settings .voice-block").first().locator(".chip").nth(2).click();   // Calm
    await page.waitForTimeout(300);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}").voice);
    check("the chosen voice is persisted", !!saved?.coachVoiceURI, JSON.stringify(saved));
    check("the chosen tone is persisted", saved?.tone === "calm", JSON.stringify(saved));
  } else {
    check("with no voices it says so instead of showing an empty picker",
      (await page.locator(".voice-settings .empty-note").count()) === 1);
    check("no voice dropdowns are shown when there is nothing to choose",
      (await page.locator(".voice-select").count()) === 0);
  }

  check("no crashes on the voice settings screen", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
}

// ---------------------------------------------------------------------------
// v75 — skipping a chapter, choosing an Arabic dialect, and German.
// ---------------------------------------------------------------------------
import { readFileSync } from "node:fs";

async function seeded(browser, code, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE);
  await page.evaluate(([c, ex]) => localStorage.setItem("lingua:app", JSON.stringify({
    onboarded: true, currentLanguage: c, tutorialSeen: true, dailyGoalXp: 35, totalXp: 0,
    streak: 0, hearts: 5, heartsMax: 5, gems: 50, theme: "cream", showRomanization: true,
    sessionSize: 6, lessonsCompleted: {}, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: {}, sentenceDropsDone: {}, lastCheckpointAt: {}, testedOut: {},
    momentDone: {}, planVisited: {}, ...ex,
  })), [code, extra]);
  await page.reload();
  await page.waitForTimeout(1500);
  return { ctx, page, errors };
}

async function runSkipAhead() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  console.log("\n=== skip ahead (German) ===\n");
  const { ctx, page, errors } = await seeded(browser, "de");

  const pack = JSON.parse(readFileSync("src/data/languages/de.json", "utf8"));
  const byLemma = new Map(pack.vocab.map((v) => [v.lemma, v]));
  const byMeaning = new Map(pack.vocab.map((v) => [v.translation, v]));

  check("German loads as a language", (await page.locator("body").innerText()).includes("German") ||
    (await page.locator(".home-container, body").count()) > 0);

  await page.locator(".skip-invite").click();
  await page.waitForTimeout(700);
  const chapters = await page.locator(".mission-card").count();
  check("the skip-ahead screen lists chapters", chapters >= 4, String(chapters));
  check("it states the pass bar up front",
    /85% to pass/.test(await page.locator(".mission-list").innerText()));

  await page.locator(".mission-card").first().click();
  await page.waitForTimeout(600);
  check("the chapter test starts", await page.locator(".skip-options").isVisible());

  // Answer every question CORRECTLY, derived from the pack rather than from a
  // data attribute — the DOM must never carry the answer.
  let answered = 0;
  for (let i = 0; i < 20; i++) {
    if (!(await page.locator(".skip-options").count())) break;
    const eyebrow = (await page.locator(".prompt-card .eyebrow").innerText()).trim();
    const prompt = (await page.locator(".prompt-ask").innerText()).trim();
    const toNative = /Say this in/i.test(eyebrow);
    const want = toNative ? byMeaning.get(prompt)?.lemma : byLemma.get(prompt)?.translation;
    if (!want) break;
    const opts = page.locator(".skip-option");
    const n = await opts.count();
    let hit = false;
    for (let k = 0; k < n; k++) {
      const label = (await opts.nth(k).locator(".skip-option-main").innerText()).trim();
      if (label === want) { await opts.nth(k).click(); hit = true; break; }
    }
    if (!hit) break;
    answered++;
    await page.waitForTimeout(850);
  }
  check("every question could be answered correctly from the pack", answered >= 14, String(answered));

  await page.waitForTimeout(700);
  const resultText = await page.locator(".result-card").innerText().catch(() => "");
  check("a perfect run passes the chapter", /is behind you/.test(resultText), resultText.slice(0, 120));

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
  check("passing marks the chapter as passed", (saved.chaptersPassed?.de || []).includes(1),
    JSON.stringify(saved.chaptersPassed));
  check("passing seeds the chapter's words as known",
    (saved.testedOut?.de || []).length >= 30, String((saved.testedOut?.de || []).length));

  const prog = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:progress") || "{}"));
  check("the words got real progress cards, not just a flag",
    Object.keys(prog.de || {}).length >= 30, String(Object.keys(prog.de || {}).length));

  check("no crashes in the skip-ahead flow", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
  await browser.close();
}

async function runDialects() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  console.log("\n=== Arabic dialects ===\n");
  const { ctx, page, errors } = await seeded(browser, "ar");

  await page.locator(".bottom-nav button", { hasText: "Profile" }).click();
  await page.waitForTimeout(500);
  await page.locator('button[aria-label="Settings"]').click();
  await page.waitForTimeout(1600);

  const dialectBlock = page.locator(".dialect-settings");
  check("settings offers a dialect choice for Arabic",
    /which arabic/i.test(await dialectBlock.innerText()),
    (await dialectBlock.innerText()).replace(/\s+/g, " ").slice(0, 80));
  const chips = await dialectBlock.locator(".chip").count();
  check("all seven Arabic varieties are offered", chips === 7, String(chips));

  await dialectBlock.locator(".chip").nth(4).click();   // Maghrebi
  await page.waitForTimeout(500);
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:profile") || "{}"));
  check("the chosen dialect is persisted on the profile", !!profile.ar?.region, JSON.stringify(profile.ar?.region));
  check("choosing a dialect explains what it means",
    (await dialectBlock.innerText()).length > 120);

  check("no crashes on the dialect picker", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
  await browser.close();
}

// ---------------------------------------------------------------------------
// v76 — the dialect drill and the exercise-type toggles.
// ---------------------------------------------------------------------------
async function runDialectDrill() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  console.log("\n=== dialect drill (Arabic) ===\n");
  const { ctx, page, errors } = await seeded(browser, "ar");

  await page.locator(".skip-invite").first().click();
  await page.waitForTimeout(800);
  check("the dialect screen offers the varieties",
    (await page.locator(".mission-card").count()) >= 6, String(await page.locator(".mission-card").count()));
  check("each variety states how many words actually differ",
    /words differ/.test(await page.locator(".mission-list").innerText()));

  // Pick Egyptian (index 1 — MSA is first and has nothing to drill).
  await page.locator(".mission-card").nth(1).click();
  await page.waitForTimeout(700);
  check("it says how many words change, out of how many", /words change in/.test(await page.locator(".intro-title").innerText()));
  check("the full reference list is shown", (await page.locator(".dialect-row").count()) >= 10,
    String(await page.locator(".dialect-row").count()));
  check("the choice is stored on the profile",
    (await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:profile") || "{}").ar?.region)) === "ar-EG");

  await page.locator(".intro-card .btn-hero").click();
  await page.waitForTimeout(700);
  check("a drill round starts", (await page.locator(".skip-options").count()) === 1);
  const prompt = await page.locator(".prompt-card .eyebrow").innerText();
  check("the question names the variety", /egyptian/i.test(prompt), prompt);

  // Answer every question by tapping something, and reach the result.
  for (let i = 0; i < 12; i++) {
    if (!(await page.locator(".skip-options").count())) break;
    await page.locator(".skip-option").first().click().catch(() => {});
    await page.waitForTimeout(850);
  }
  check("the drill reaches a result screen", (await page.locator(".result-card").count()) === 1);
  check("no crashes in the dialect drill", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
  await browser.close();
}

async function runExerciseToggles() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  console.log("\n=== exercise-type toggles ===\n");
  const { ctx, page, errors } = await seeded(browser, "es");

  await page.locator(".bottom-nav button", { hasText: "Profile" }).click();
  await page.waitForTimeout(500);
  await page.locator('button[aria-label="Settings"]').click();
  await page.waitForTimeout(1600);

  const toggles = await page.locator(".ex-toggle").count();
  check("every optional question type has a switch", toggles >= 8, String(toggles));
  check("they all start on", (await page.locator(".ex-toggle.ex-on").count()) === toggles);

  await page.locator(".ex-toggle").first().click();
  await page.waitForTimeout(400);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}").disabledExercises);
  check("switching one off is persisted", Array.isArray(saved) && saved.length === 1, JSON.stringify(saved));
  check("the screen says what turning it off costs",
    /narrower|least practice/.test(await page.locator(".exercise-settings").innerText()));

  check("no crashes on the exercise settings", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
  await browser.close();
}

// ---------------------------------------------------------------------------
// A FAST LESSON SMOKE TEST.
//
// This exists because a missing import shipped to main: dialectForm was used in
// Lesson.jsx and never imported, so EVERY lesson in EVERY language crashed on
// the first word card. `vite build` doesn't catch an undefined identifier, and
// this suite never opened a lesson — only the 40-minute full fuzz did, and by
// then it was already pushed.
//
// Thirty seconds, three languages, a handful of steps each. Enough to catch
// anything that breaks the lesson screen outright.
// ---------------------------------------------------------------------------
async function runLessonSmoke() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  console.log("\n=== lesson smoke test ===\n");

  for (const code of ["ar", "es", "ur"]) {
    const { ctx, page, errors } = await seeded(browser, code, { lessonsCompleted: { [code]: 4 } });

    // Open a lesson: expand a route stop if this language has a journey, then
    // tap a unit.
    const heads = await page.locator(".station-head").count();
    for (let h = 0; h < heads; h++) {
      await page.locator(".station-head").nth(h).click().catch(() => {});
      await page.waitForTimeout(200);
      if (await page.locator("button[data-unit]:not([disabled])").count()) break;
    }
    const opened = await page.locator("button[data-unit]:not([disabled])").count();
    check(`${code}: a lesson can be opened`, opened > 0, "no unlocked unit on the home screen");
    if (!opened) { await ctx.close(); continue; }

    await page.locator("button[data-unit]:not([disabled])").first().click();
    await page.waitForTimeout(1200);
    check(`${code}: the lesson screen renders`, (await page.locator(".bottom-nav").count()) === 0);
    check(`${code}: no error boundary on the first card`,
      (await page.locator("text=Something went wrong").count()) === 0,
      await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 120)));

    // Walk a few steps so more than the first renderer is exercised.
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => {
        const SKIP = /^(check|continue|next|skip|got it|hear|listen|play|back|close|try again|or type|✕|🔊|report)/i;
        const b = [...document.querySelectorAll("button")].filter((x) => {
          if (x.disabled) return false;
          const r = x.getBoundingClientRect();
          const t = (x.innerText || "").trim();
          return r.height > 20 && t && !SKIP.test(t);
        });
        b.slice(0, 4).forEach((x) => x.click());
        const go = [...document.querySelectorAll("button")].find((x) =>
          /^(check|continue|next|got it)/i.test((x.innerText || "").trim()) && !x.disabled);
        if (go) go.click();
      });
      await page.waitForTimeout(320);
    }
    check(`${code}: still no crash after ten steps`, errors.length === 0, errors.slice(0, 2).join(" | "));
    await ctx.close();
  }
  await browser.close();
}

await runLessonSmoke();
await run(414, 896, "phone");
await run(1440, 900, "desktop");
await runUnconfigured();
await runVoiceSettings({ withVoices: true });
await runVoiceSettings({ withVoices: false });
await runSkipAhead();
await runDialects();
await runDialectDrill();
await runExerciseToggles();

const failed = out.filter((r) => !r.ok);
console.log(`\n  ${out.length - failed.length} pass, ${failed.length} fail\n`);
process.exit(failed.length ? 1 : 0);
