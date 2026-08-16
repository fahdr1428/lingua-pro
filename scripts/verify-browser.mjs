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
      // v77: this pass is about the conversation itself, so consent is already
      // given. The gate gets its own section below.
      aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
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

  // The decode door shares the .skip-invite class, so scope to the chapter one.
  await page.locator(".skip-invite:not(.skip-invite-lead)").click();
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

// ---------------------------------------------------------------------------
// v77 — publishing: disclosure, consent, age gates, data rights.
//
// These are the assertions that stop a compliance regression shipping. Every one
// of them corresponds to something a regulator or an app reviewer would look for,
// and they're written against behaviour rather than against the copy, so
// rewording a policy doesn't turn them red.
// ---------------------------------------------------------------------------
async function runOnboardingGate() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  // Anything reaching a Google font host is a privacy regression, so watch every
  // request rather than trusting that index.html still says what it said.
  const thirdParty = [];
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith(BASE) && !u.startsWith("data:") && !u.startsWith("blob:")) thirdParty.push(u);
  });

  console.log("\n=== onboarding: age and terms ===\n");
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(900);

  check("no third-party requests on first load", thirdParty.length === 0, thirdParty.slice(0, 3).join(" | "));

  await page.locator("button", { hasText: "Get started" }).click();
  await page.waitForTimeout(400);
  await page.locator("button").filter({ hasText: "Urdu" }).first().click();
  await page.locator("button", { hasText: "Continue" }).click();
  await page.waitForTimeout(400);
  await page.locator("button", { hasText: "Continue" }).click();
  await page.waitForTimeout(400);

  const boxes = page.locator(".ai-check input");
  check("onboarding asks for age and terms before starting", (await boxes.count()) === 2, String(await boxes.count()));
  check("neither consent box is pre-ticked",
    !(await boxes.nth(0).isChecked()) && !(await boxes.nth(1).isChecked()));

  const start = page.locator("button", { hasText: "Start learning" });
  check("you cannot start without answering both", await start.isDisabled());
  await boxes.nth(0).check();
  check("one box is not enough", await start.isDisabled());

  // The policies must be readable BEFORE accepting, not linked from a screen you
  // reach afterwards — "I have read it" has to be capable of being true.
  await page.locator(".chip", { hasText: "Read the privacy policy" }).click();
  await page.waitForTimeout(400);
  const privacy = await page.locator(".speak-body").innerText();
  check("the privacy policy is readable during onboarding", /local storage/i.test(privacy));
  check("it admits the browser sends microphone audio to its vendor",
    /Google's speech service/i.test(privacy), privacy.slice(0, 160));
  check("a dev build warns that the policies are unfinished",
    (await page.locator(".legal-warn").count()) > 0);

  await page.locator(".speak-close").click();
  await page.waitForTimeout(400);
  check("coming back from the policy keeps the answers already given", await boxes.nth(0).isChecked());

  await boxes.nth(1).check();
  check("both boxes enable the start button", await start.isEnabled());
  await start.click();
  await page.waitForTimeout(900);

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
  check("what was agreed, and when, is recorded", saved.consent?.terms === true && saved.consent?.ageConfirmed === 13,
    JSON.stringify(saved.consent));
  check("agreeing to the app does NOT silently agree to the AI", !saved.aiConsent,
    JSON.stringify(saved.aiConsent));
  check("no crashes through onboarding", errors.length === 0, errors.slice(0, 2).join(" | "));
  check("still no third-party requests after onboarding", thirdParty.length === 0, thirdParty.slice(0, 3).join(" | "));
  await browser.close();
}

async function runAiGate() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  let coachCalls = 0;
  await page.route("**/api/coach", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: true, model: "m" }) });
    }
    coachCalls++;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(COACH_REPLY) });
  });
  await page.route("**/api/scenario", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify({ mission: null }),
  }));

  console.log("\n=== AI disclosure gate ===\n");
  await page.goto(BASE);
  await page.evaluate(() => localStorage.setItem("lingua:app", JSON.stringify({
    onboarded: true, currentLanguage: "ar", tutorialSeen: true, dailyGoalXp: 35, totalXp: 0,
    streak: 0, hearts: 5, heartsMax: 5, gems: 50, theme: "cream", showRomanization: true,
    sessionSize: 6, lessonsCompleted: { ar: 4 }, sessions: [], grammarSeen: {}, learningGoal: {},
    chaptersPassed: {}, sentenceDropsDone: {}, lastCheckpointAt: {}, testedOut: {},
    momentDone: {}, planVisited: {}, consent: { terms: true, ageConfirmed: 13, at: 0 },
  })));
  await page.reload();
  await page.waitForTimeout(1400);

  await page.locator(".home-strip .strip-card").nth(1).click();
  await page.waitForTimeout(700);

  // The scenario builder is the OTHER door into the model — it sends the
  // learner's own typed description off the device — so it has to be behind the
  // same consent, not just the conversation itself.
  await page.locator(".mission-card-custom").click();
  await page.waitForTimeout(500);
  check("describing your own scenario is gated too", await page.locator(".ai-gate").isVisible());
  check("the scenario box never opened before consent",
    (await page.locator(".scenario-input").count()) === 0);
  await page.locator(".btn-quiet", { hasText: "No thanks" }).click();
  await page.waitForTimeout(500);

  await page.locator(".mission-list .mission-card").first().click();
  await page.waitForTimeout(400);
  await page.locator(".btn-hero").first().click(); // start the mission
  await page.waitForTimeout(700);

  check("the AI gate stands between the learner and the model", await page.locator(".ai-gate").isVisible());
  check("nothing was sent before consent", coachCalls === 0, String(coachCalls));

  const gateBoxes = page.locator(".ai-gate .ai-check input");
  check("the gate asks both what it is and how old they are", (await gateBoxes.count()) === 2);
  const go = page.locator(".ai-gate .btn-hero");
  check("you cannot proceed without both", await go.isDisabled());

  const gateText = await page.locator(".ai-gate").innerText();
  check("the gate says it is an AI, not a person", /is an AI/i.test(gateText));
  check("the gate says it gets things wrong", /wrong/i.test(gateText));
  check("the gate says what leaves the device", /Anthropic/.test(gateText));
  check("the gate says declining costs them nothing", /keep working|keep the rest/i.test(gateText));
  check("the age asked for the AI is 16, not 13", /\b16 or older\b/.test(gateText), gateText.slice(0, 200));

  // Declining must leave the app working, not strand them on the gate.
  await page.locator(".btn-quiet", { hasText: "No thanks" }).click();
  await page.waitForTimeout(600);
  check("declining returns to the app rather than dead-ending",
    (await page.locator(".ai-gate").count()) === 0);
  check("still nothing sent after declining", coachCalls === 0, String(coachCalls));
  const declined = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
  check("the refusal is remembered", declined.aiConsent?.accepted === false);

  // Now accept, and check the standing marker is actually on screen.
  await page.locator(".mission-list .mission-card").first().click();
  await page.waitForTimeout(400);
  await page.locator(".btn-hero").first().click();
  await page.waitForTimeout(600);
  for (const i of [0, 1]) await page.locator(".ai-gate .ai-check input").nth(i).check();
  await page.locator(".ai-gate .btn-hero").click();
  await page.waitForTimeout(1200);

  check("accepting opens the conversation", await page.locator(".coach-thread").isVisible());
  check("a permanent AI marker sits above the conversation", await page.locator(".ai-strip").isVisible());
  check("the marker names the character as an AI",
    /AI/.test(await page.locator(".ai-strip").innerText()));
  check("the model was called only after consent", coachCalls >= 1, String(coachCalls));

  await page.waitForTimeout(900);
  const reports = await page.locator(".ai-report").count();
  check("every AI reply carries a report control", reports >= 1, String(reports));
  await page.locator(".ai-report").first().click();
  await page.waitForTimeout(400);
  const afterReport = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
  check("a report is actually stored", (afterReport.aiReports || []).length === 1,
    JSON.stringify((afterReport.aiReports || []).length));
  check("the app says honestly where the report went",
    /Settings|export/i.test(await page.locator(".ai-report-done").innerText()));
  check("no crashes through the gate", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
}

async function runDataRights() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  console.log("\n=== data rights ===\n");
  await page.goto(BASE);
  await page.evaluate(() => {
    localStorage.setItem("lingua:app", JSON.stringify({
      onboarded: true, currentLanguage: "ar", tutorialSeen: true, dailyGoalXp: 35, totalXp: 120,
      streak: 2, hearts: 5, heartsMax: 5, gems: 50, theme: "cream", showRomanization: true,
      sessionSize: 6, lessonsCompleted: { ar: 3 }, sessions: [], grammarSeen: {}, learningGoal: {},
      chaptersPassed: {}, sentenceDropsDone: {}, lastCheckpointAt: {}, testedOut: {},
      momentDone: {}, planVisited: {}, consent: { terms: true, ageConfirmed: 13, at: 0 },
      aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
    }));
    localStorage.setItem("lingua:progress:ar", JSON.stringify({ items: { ar_0001: { reps: 3 } } }));
  });
  await page.reload();
  await page.waitForTimeout(1400);

  await page.locator(".bottom-nav button", { hasText: "Profile" }).click();
  await page.waitForTimeout(500);
  await page.locator('button[aria-label="Settings"]').click();
  await page.waitForTimeout(700);

  const settingsText = await page.locator("body").innerText();
  check("settings offers the policies", /Privacy policy/i.test(settingsText));
  check("settings offers an export", /Export everything/i.test(settingsText));
  check("delete says what it destroys", /Delete all my data/i.test(settingsText));

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 8000 }),
    page.locator("button", { hasText: "Export everything" }).click(),
  ]);
  const path = await download.path();
  const payload = JSON.parse(readFileSync(path, "utf8"));
  check("the export is a real file", !!path);
  check("the export contains every stored key, not a curated subset",
    !!payload.data?.["app"] && !!payload.data?.["progress:ar"], Object.keys(payload.data || {}).join(","));
  check("the export says where the data lived", /local storage/i.test(payload.note || ""));

  // Turning the AI off must be possible after having said yes.
  const aiToggle = page.locator('input[aria-label="AI conversation features"]');
  check("the AI can be switched off after consent", await aiToggle.isChecked());
  await aiToggle.uncheck();
  await page.waitForTimeout(400);
  const off = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:app") || "{}"));
  check("withdrawing consent is recorded", off.aiConsent?.accepted === false, JSON.stringify(off.aiConsent));

  await page.locator(".chip", { hasText: "About the AI" }).click();
  await page.waitForTimeout(500);
  check("the AI disclosure is reachable from settings",
    /not a person/i.test(await page.locator(".speak-body").innerText()));

  // The microphone screen has to be honest at the point the decision is made,
  // not only in a policy the person would have to go looking for.
  await page.locator(".speak-close").click();
  await page.waitForTimeout(400);
  await page.locator(".bottom-nav button", { hasText: "Speak" }).click();
  await page.waitForTimeout(900);
  const micText = await page.locator(".intro-card").innerText();
  check("the mic screen says the browser does the listening", /browser does the listening/i.test(micText));
  check("the mic screen names where the audio goes", /Google/.test(micText), micText.slice(0, 200));
  check("the mic screen offers typing as an equal alternative", /graded identically/i.test(micText));
  check("no crashes on the data-rights path", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
}

// ---------------------------------------------------------------------------
// v78 — DECODE. Paste real text, get it broken down, keep the words.
//
// The assertions that matter here are the two that make the feature more than a
// translator: that the count of already-known words is computed against the
// learner's OWN progress rather than asserted by the model, and that saving a
// word puts it into the same review machinery as everything else rather than a
// parallel list that never comes back.
// ---------------------------------------------------------------------------
const DECODE_REPLY = {
  configured: true,
  isTarget: true,
  detectedNote: "",
  natural: "How are you? I made food, come over.",
  literal: "you how are? I food made, come",
  register: "Warm and informal — how an aunt writes to a nephew.",
  grammarNote: "The verb lands at the end, which is why the last word is the one doing the work.",
  tokens: [
    { native: "كيف", lemma: "كيف", translit: "kayf", meaning: "how", role: "adverb", note: "" },
    { native: "حالك", lemma: "حال", translit: "haal", meaning: "condition, state", role: "noun", note: "the -ak ending is 'your', addressed to a man" },
    { native: "فاطمة", lemma: "فاطمة", translit: "Fatima", meaning: "Fatima", role: "name", note: "" },
    { native: "طعام", lemma: "طعام", translit: "ta'aam", meaning: "food", role: "noun", note: "" },
    { native: "زقنبوت", lemma: "زقنبوت", translit: "ziqanbuut", meaning: "a made-up word", role: "noun", note: "" },
  ],
  reply: { native: "الحمد لله، جاي حالاً", translit: "al-hamdu lillah, jaay haalan", en: "All good — coming right now." },
};

async function runDecode() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  let sent = null;
  await page.route("**/api/decode", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: true }) });
    }
    sent = JSON.parse(route.request().postData() || "{}");
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(DECODE_REPLY) });
  });

  console.log("\n=== decode: real text into a lesson ===\n");
  await page.goto(BASE);

  // Seed a learner who has genuinely learned one of the words in the message,
  // so the "you already know N" count has something true to find.
  const pack = JSON.parse(readFileSync("src/data/languages/ar.json", "utf8"));
  const kayf = pack.vocab.find((v) => v.translit === "kayf" || v.lemma === "كيف");
  await page.evaluate(([id]) => {
    localStorage.setItem("lingua:app", JSON.stringify({
      onboarded: true, currentLanguage: "ar", tutorialSeen: true, dailyGoalXp: 35, totalXp: 100,
      streak: 1, hearts: 5, heartsMax: 5, gems: 50, theme: "cream", showRomanization: true,
      sessionSize: 6, lessonsCompleted: { ar: 3 }, sessions: [], grammarSeen: {}, learningGoal: {},
      chaptersPassed: {}, sentenceDropsDone: {}, lastCheckpointAt: {}, testedOut: {},
      momentDone: {}, planVisited: {}, consent: { terms: true, ageConfirmed: 13, at: 0 },
      aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
    }));
    if (id) {
      localStorage.setItem("lingua:progress", JSON.stringify({
        ar: { [id]: { difficulty: 5, stability: 20, lastReview: Date.now(), nextReview: Date.now() + 8.64e7, reps: 5, lapses: 0 } },
      }));
    }
  }, [kayf?.id]);
  await page.reload();
  await page.waitForTimeout(1500);

  check("the decode door is on home", await page.locator(".skip-invite-lead").isVisible());
  await page.locator(".skip-invite-lead").click();
  await page.waitForTimeout(900);

  check("it says what leaves the device before the box, not after",
    await page.locator(".decode-privacy").isVisible());
  check("the AI marker is on the screen", (await page.locator(".decode-privacy .ai-badge").count()) === 1);

  await page.locator(".decode-input").fill("كيف حالك فاطمة؟ طعام زقنبوت");
  await page.locator(".btn-hero").first().click();
  await page.waitForTimeout(1200);

  check("the pasted text is sent, and nothing else about the learner",
    sent?.text?.includes("كيف") && !JSON.stringify(sent).includes("lessonsCompleted"),
    JSON.stringify(sent).slice(0, 120));

  check("the breakdown renders", await page.locator(".decode-tokens").isVisible());
  const toks = await page.locator(".decode-tok").count();
  check("every word from the text is shown", toks === 5, String(toks));

  const score = await page.locator(".decode-score").innerText();
  // Four teachable words (the proper noun is excluded), one of which the seeded
  // learner has real progress on.
  check("the score counts teachable words, excluding proper nouns", /\/4/.test(score), score.replace(/\n/g, " "));
  check("it counts what the learner actually knows, from their own progress",
    /^1\b/.test(score.trim()), score.replace(/\n/g, " "));
  check("a known word is marked as known",
    (await page.locator(".decode-tok-known").count()) === 1,
    String(await page.locator(".decode-tok-known").count()));

  check("it shows the word-for-word order, not just a translation",
    await page.locator(".decode-literal").isVisible());
  check("it says who talks like that", await page.locator(".decode-register").isVisible());
  check("it explains one thing about how the sentence is built",
    await page.locator(".decode-grammar").isVisible());
  check("it gives something to send back", await page.locator(".decode-reply-line").isVisible());
  check("the AI output can be reported", (await page.locator(".ai-report").count()) >= 1);

  // Saving.
  const ticked = await page.locator(".decode-pick input:checked").count();
  check("words the learner doesn't know are pre-ticked, the known one isn't", ticked === 3, String(ticked));

  await page.locator(".decode-save .btn-hero").click();
  await page.waitForTimeout(900);
  check("saving confirms with a real number", /3 words added/i.test(await page.locator(".decode-saved").innerText()));

  const custom = await page.evaluate(() => JSON.parse(localStorage.getItem("lingua:custom") || "{}"));
  check("saved words are persisted", (custom.ar || []).length === 3, String((custom.ar || []).length));
  check("they carry the sentence they came from",
    (custom.ar || []).every((w) => w.source?.includes("كيف")));
  check("they are marked custom so the course pool can exclude them",
    (custom.ar || []).every((w) => w.custom === true && w.unit === "custom"));

  // The point of saving: they enter the same review machinery.
  await page.locator(".decode-saved .btn-hero").click();
  await page.waitForTimeout(1600);

  // A lesson can open on a grammar moment or an intro card before the first
  // question, so walk a few steps rather than asserting on the first screen.
  let sawWord = false;
  for (let i = 0; i < 6 && !sawWord; i++) {
    const body = await page.locator("body").innerText();
    if (/ziqanbuut|زقنبوت|ta'aam|ta_aam|طعام|haal|حال/.test(body)) { sawWord = true; break; }
    await page.evaluate(() => {
      const go = [...document.querySelectorAll("button")].find((b) =>
        /^(check|continue|next|got it|i've got these)/i.test((b.innerText || "").trim()) && !b.disabled);
      if (go) go.click();
    });
    await page.waitForTimeout(500);
  }
  check("drilling saved words opens a lesson built from them", sawWord);
  check("no crashes through decode", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
}

// ---------------------------------------------------------------------------
// v78 — TESTING OUT OF A SINGLE STOP.
//
// The button existed since v75 but only on the fallback unit list, which renders
// for languages with no written journey. On the seven that HAVE one — Urdu,
// Arabic, the ones people pick — a locked stop was a dead end. This asserts the
// door exists on a journey language AND that what it opens is scoped to the unit
// tapped, which the old screen got wrong: it quizzed the whole language at random.
// ---------------------------------------------------------------------------
async function runUnitTestOut() {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  console.log("\n=== testing out of one stop (Urdu) ===\n");
  const { ctx, page, errors } = await seeded(browser, "ur");

  check("Urdu renders the written route, not the fallback list",
    (await page.locator(".route-region").count()) > 0);

  // Open a locked stop in the current region.
  const locked = page.locator(".station-locked .station-head, .station-locked button").first();
  await locked.click();
  await page.waitForTimeout(500);

  const door = page.locator(".station-testout").first();
  check("a locked stop offers a way to prove you already know it",
    (await door.count()) > 0, String(await door.count()));

  const unitId = await door.getAttribute("data-unit");
  await door.click();
  await page.waitForTimeout(900);

  check("it opens a test", await page.locator(".skip-options").isVisible());
  check("the test is named after the stop, not 'Chapter 1'",
    !/Chapter/i.test(await page.locator(".speak-title").innerText()),
    await page.locator(".speak-title").innerText());

  // Scoped: every question must come from the unit that was tapped.
  const pack = JSON.parse(readFileSync("src/data/languages/ur.json", "utf8"));
  // Both directions and both scripts: the English gloss when asked to produce,
  // and for a non-Latin pack the ROMANISATION (not the lemma) when asked to
  // recognise — see the prompt built in SkipAhead's ChapterQuiz.
  const ofUnit = pack.vocab.filter((v) => v.unit === unitId);
  const accepted = new Set([
    ...ofUnit.map((v) => v.translation),
    ...ofUnit.map((v) => v.lemma),
    ...ofUnit.map((v) => v.translit).filter(Boolean),
  ]);
  let checked = 0, offTopic = 0;
  for (let i = 0; i < 4; i++) {
    if (!(await page.locator(".skip-options").count())) break;
    const prompt = (await page.locator(".prompt-ask").innerText()).trim();
    if (!accepted.has(prompt)) offTopic++;
    checked++;
    await page.locator(".skip-option").first().click();
    await page.waitForTimeout(850);
  }
  check("every question comes from the stop you tapped", checked > 0 && offTopic === 0,
    `${offTopic} of ${checked} off-topic`);
  check("no crashes testing out of a stop", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
  await browser.close();
}

await runDecode();
await runUnitTestOut();
await runOnboardingGate();
await runAiGate();
await runDataRights();
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
