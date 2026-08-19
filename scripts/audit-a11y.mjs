// =============================================================================
// audit-a11y.mjs (v80) — the accessibility half Lighthouse can't automate.
//
// Lighthouse gave this app 83 and named two failures, both since fixed. That
// score covers what a machine can check on one page load. It does not walk the
// app, so it never opened a lesson, a conversation, or the Decode screen — where
// most of the controls actually are.
//
// This walks the real screens and checks the things that most commonly go wrong
// in an app built out of inline-styled buttons:
//
//   1. CONTROLS WITH NO ACCESSIBLE NAME. An icon-only button with no aria-label
//      is announced as "button" and nothing else. For a screen-reader user that
//      is an unlabelled door.
//   2. TEXT CONTRAST below WCAG AA (4.5:1 for body, 3:1 for large text).
//      Computed from what the browser actually renders, per theme, rather than
//      from the palette — a token can be fine in isolation and fail against the
//      surface it lands on.
//   3. IMAGES WITH NO ALT ATTRIBUTE AT ALL. (alt="" is correct for decorative
//      images and is not flagged.)
//   4. INPUTS WITH NO LABEL of any kind.
//
// It reports rather than asserting a pass/fail threshold: contrast on a warm
// cream palette involves judgement, and a script that fails the build over a
// 4.4:1 ratio on a disabled hint would get switched off within a week.
//
//   node scripts/audit-a11y.mjs
// =============================================================================

import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:4173";

const SEED = {
  onboarded: true, currentLanguage: "ur", tutorialSeen: true, dailyGoalXp: 35,
  totalXp: 420, streak: 3, hearts: 5, heartsMax: 5, gems: 50, theme: "cream",
  showRomanization: true, sessionSize: 6, lessonsCompleted: { ur: 9 }, sessions: [],
  grammarSeen: {}, learningGoal: {}, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  passagesRead: {}, consent: { terms: true, ageConfirmed: 13, at: 0 },
  aiConsent: { accepted: true, at: 0, ageConfirmed: 16, version: 1 },
};

// The checks, injected into the page. Kept as one function so it can run in the
// browser context where computed styles and rendered geometry are available.
const AUDIT = `(() => {
  const out = { unnamed: [], contrast: [], images: [], inputs: [], gradients: [] };

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
  };
  const name = (el) =>
    (el.getAttribute("aria-label") || "").trim() ||
    (el.getAttribute("title") || "").trim() ||
    (el.innerText || "").trim() ||
    (el.querySelector("img[alt]")?.getAttribute("alt") || "").trim() ||
    (el.getAttribute("aria-labelledby") ? "(labelledby)" : "");

  for (const el of document.querySelectorAll("button, a[href], [role=button]")) {
    if (!visible(el)) continue;
    if (!name(el)) out.unnamed.push((el.className || el.tagName) + " :: " + el.outerHTML.slice(0, 110));
  }

  for (const img of document.querySelectorAll("img")) {
    if (!visible(img)) continue;
    if (img.getAttribute("alt") === null) out.images.push(img.getAttribute("src") || "(no src)");
  }

  for (const inp of document.querySelectorAll("input, textarea, select")) {
    if (!visible(inp)) continue;
    if (inp.type === "hidden") continue;
    const labelled =
      inp.getAttribute("aria-label") || inp.getAttribute("aria-labelledby") ||
      inp.getAttribute("placeholder") || inp.closest("label") ||
      (inp.id && document.querySelector('label[for="' + inp.id + '"]'));
    if (!labelled) out.inputs.push((inp.type || inp.tagName) + " :: " + inp.outerHTML.slice(0, 90));
  }

  // ---- contrast ----
  const parse = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1,
  });
  // Walk up for the nearest thing that actually paints a solid ground.
  //
  // A gradient has backgroundColor: transparent, so the naive walk sailed past
  // it to the page background and reported black text on a bright amber card as
  // 1.08:1 — a false failure three times over. A checker that cries wolf gets
  // switched off, so gradients are reported as UNMEASURABLE and checked by hand
  // instead of being guessed at.
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const st = getComputedStyle(n);
      if (st.backgroundImage && st.backgroundImage !== "none") return "gradient";
      const c = parse(st.backgroundColor);
      if (c && c.a > 0.95) return c;
      // Semi-transparent (the frosted cards): composite it over whatever is
      // behind rather than ignoring it. Skipping these read black text on a
      // 78%-white card as if it sat on the dark page — 1.08:1, and false.
      if (c && c.a > 0.05) {
        const under = bgOf(n.parentElement || document.body);
        if (under !== "gradient") return over(c, under);
      }
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const seen = new Set();
  for (const el of document.querySelectorAll("*")) {
    if (!visible(el)) continue;
    // Only elements holding their own text.
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
    if (text.length < 2) continue;
    const s = getComputedStyle(el);
    const fg = parse(s.color); if (!fg) continue;
    const bg = bgOf(el);
    if (bg === "gradient") {
      const key = "grad|" + s.color + "|" + text.slice(0, 20);
      if (!seen.has(key)) { seen.add(key); out.gradients.push(text.slice(0, 42)); }
      continue;
    }
    const eff = fg.a < 1 ? over(fg, bg) : fg;
    const L1 = lum(eff), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      const key = s.color + "|" + size + "|" + text.slice(0, 20);
      if (seen.has(key)) continue;
      seen.add(key);
      // A DOM path, because "class = (none)" on an inline-styled app tells you
      // nothing about where to go and look.
      const path = [];
      for (let n = el; n && n !== document.body && path.length < 5; n = n.parentElement) {
        const c = String(n.className || "").trim().split(/\s+/).filter(Boolean)[0];
        path.unshift(n.tagName.toLowerCase() + (c ? "." + c : ""));
      }
      out.contrast.push({
        ratio: Math.round(ratio * 100) / 100, need, size: Math.round(size),
        text: text.slice(0, 42), cls: String(el.className).slice(0, 34),
        where: path.join(" > "), fg: s.color, bgHex: "rgb(" + Math.round(bg.r) + "," + Math.round(bg.g) + "," + Math.round(bg.b) + ")",
      });
    }
  }
  return out;
})()`;

const SCREENS = [
  ["home", async () => {}],
  ["practice hub", async (p) => { await p.locator(".bottom-nav button", { hasText: "Practice" }).click(); }],
  ["reading", async (p) => {
    await p.locator(".bottom-nav button", { hasText: "Practice" }).click();
    await p.waitForTimeout(500);
    await p.locator("button", { hasText: "Read some" }).first().click();
  }],
  ["profile", async (p) => { await p.locator(".bottom-nav button", { hasText: "Profile" }).click(); }],
  ["settings", async (p) => {
    await p.locator(".bottom-nav button", { hasText: "Profile" }).click();
    await p.waitForTimeout(400);
    await p.locator('button[aria-label="Settings"]').click();
  }],
  ["flashcards", async (p) => {
    await p.locator(".bottom-nav button", { hasText: "Practice" }).click();
    await p.waitForTimeout(500);
    await p.locator("button", { hasText: "Flashcards" }).first().click();
  }],
  ["grammar", async (p) => {
    await p.locator(".bottom-nav button", { hasText: "Practice" }).click();
    await p.waitForTimeout(500);
    await p.locator("button", { hasText: "Grammar" }).first().click();
  }],
  ["alphabet", async (p) => {
    await p.locator(".bottom-nav button", { hasText: "Practice" }).click();
    await p.waitForTimeout(500);
    await p.locator("button", { hasText: "Letters & sounds" }).first().click();
  }],
  ["my words", async (p) => {
    await p.locator(".bottom-nav button", { hasText: "Practice" }).click();
    await p.waitForTimeout(500);
    await p.locator("button", { hasText: "My words" }).first().click();
  }],
  ["speak", async (p) => { await p.locator(".bottom-nav button", { hasText: "Speak" }).click(); }],
  ["missions", async (p) => { await p.locator(".bottom-nav button", { hasText: "Missions" }).click(); }],
  ["fluency", async (p) => { await p.locator(".home-strip .strip-card").first().click(); }],
  ["decode", async (p) => { await p.locator(".skip-invite-lead").click(); }],
  ["skip ahead", async (p) => { await p.locator(".skip-invite:not(.skip-invite-lead)").first().click(); }],
  ["legal", async (p) => {
    await p.locator(".bottom-nav button", { hasText: "Profile" }).click();
    await p.waitForTimeout(400);
    await p.locator('button[aria-label="Settings"]').click();
    await p.waitForTimeout(700);
    await p.locator(".chip", { hasText: "Privacy policy" }).click();
  }],
  ["lesson", async (p) => {
    for (let h = 0; h < 6; h++) {
      await p.locator(".station-head").nth(h).click().catch(() => {});
      await p.waitForTimeout(200);
      if (await p.locator("button[data-unit]:not([disabled])").count()) break;
    }
    await p.locator("button[data-unit]:not([disabled])").first().click();
  }],
  // The feedback states, which are where colour actually carries meaning and
  // which a static screen walk never reaches. Answer one wrong on purpose.
  ["lesson · answered wrong", async (p) => {
    for (let h = 0; h < 6; h++) {
      await p.locator(".station-head").nth(h).click().catch(() => {});
      await p.waitForTimeout(200);
      if (await p.locator("button[data-unit]:not([disabled])").count()) break;
    }
    await p.locator("button[data-unit]:not([disabled])").first().click();
    await p.waitForTimeout(1600);
    for (let i = 0; i < 14; i++) {
      if (await p.locator(".opt-btn").count() >= 2) {
        await p.locator(".opt-btn").last().click();
        await p.waitForTimeout(200);
        await p.evaluate(() => {
          const g = [...document.querySelectorAll("button")].find((b) => /^check/i.test((b.innerText || "").trim()) && !b.disabled);
          if (g) g.click();
        });
        await p.waitForTimeout(700);
        if (/here's what happened|here's the thing/i.test(await p.locator("body").innerText())) return;
      }
      await p.evaluate(() => {
        const g = [...document.querySelectorAll("button")].find((b) => /^(continue|next|got it|i've got these|start practice|done)/i.test((b.innerText || "").trim()) && !b.disabled);
        if (g) g.click();
      });
      await p.waitForTimeout(450);
    }
  }],
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let totals = { unnamed: 0, contrast: 0, images: 0, inputs: 0 };

for (const theme of ["cream", "dark", "ocean"]) {
  console.log(`\n═══ theme: ${theme} ═══`);
  for (const [label, go] of SCREENS) {
    const ctx = await browser.newContext({ viewport: { width: 414, height: 896 } });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await page.evaluate((s) => localStorage.setItem("lingua:app", JSON.stringify(s)), { ...SEED, theme });
    await page.reload();
    await page.waitForTimeout(1500);
    try { await go(page); } catch { /* screen unreachable in this state */ }
    await page.waitForTimeout(1200);

    const r = await page.evaluate(AUDIT);
    const n = r.unnamed.length + r.contrast.length + r.images.length + r.inputs.length;
    totals.unnamed += r.unnamed.length;
    totals.contrast += r.contrast.length;
    totals.images += r.images.length;
    totals.inputs += r.inputs.length;

    console.log(`\n  ${label} — ${n === 0 ? "clean" : n + " issue(s)"}`);
    for (const u of r.unnamed.slice(0, 6)) console.log(`    NO NAME   ${u}`);
    for (const c of r.contrast.slice(0, 8)) {
      console.log(`    CONTRAST  ${String(c.ratio).padStart(5)}:1 (needs ${c.need}) ${c.size}px  "${c.text}"`);
      console.log(`              ${c.fg} on ${c.bgHex}   at  ${c.where}`);
    }
    for (const i of r.images.slice(0, 4)) console.log(`    NO ALT    ${i}`);
    for (const i of r.inputs.slice(0, 4)) console.log(`    NO LABEL  ${i}`);
    for (const g of r.gradients.slice(0, 3)) console.log(`    (gradient ground — checked by hand: "${g}")`);
    await ctx.close();
  }
}

await browser.close();
console.log(
  `\n  totals — ${totals.unnamed} unnamed controls · ${totals.contrast} contrast · ` +
  `${totals.images} missing alt · ${totals.inputs} unlabelled inputs\n`
);
