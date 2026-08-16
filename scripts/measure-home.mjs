import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 414, height: 896 } });
const p = await ctx.newPage();
await p.goto("http://localhost:4173");
await p.evaluate(() => localStorage.setItem("lingua:app", JSON.stringify({
  onboarded: true, currentLanguage: "ur", tutorialSeen: true, dailyGoalXp: 35, totalXp: 420,
  streak: 3, hearts: 5, heartsMax: 5, gems: 50, theme: "cream", showRomanization: true,
  sessionSize: 6, lessonsCompleted: { ur: 9 }, sessions: [], grammarSeen: {},
  learningGoal: { ur: "family" }, chaptersPassed: {}, sentenceDropsDone: {},
  lastCheckpointAt: {}, testedOut: {}, momentDone: {}, planVisited: {},
  consent: { terms: true, ageConfirmed: 13, at: 0 },
})));
await p.reload();
await p.waitForTimeout(2200);
const m = await p.evaluate(() => {
  const h = document.documentElement.scrollHeight;
  const secs = [...document.querySelectorAll(".home-container > *, .home-cols > div > *, .route > *, .route-region > *")]
    .map((e) => ({ cls: e.className?.toString().slice(0,44) || e.tagName, h: Math.round(e.getBoundingClientRect().height) }))
    .filter((x) => x.h > 4);
  return { total: h, screens: (h / 896).toFixed(1), secs };
});
console.log(`page height ${m.total}px = ${m.screens} phone screens\n`);
for (const s of m.secs) console.log(String(s.h).padStart(5) + "px  " + s.cls);
await b.close();
