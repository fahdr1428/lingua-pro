// =============================================================================
// simulate-learner.mjs (v79) — how much does someone actually learn?
//
// Unit tests tell you a function returns what it should. They cannot tell you
// that a learner doing everything right will stop making progress after three
// weeks. This does: it drives the real Engine through N days of one-lesson-a-day
// at 85% accuracy and reports what the person ends up with.
//
// It is how the worst bug in this codebase was found. The old adaptive-review
// rule zeroed new-word intake once sixteen words were due — a state a healthy
// deck reaches in a fortnight — so the simulated learner reached 26 words in 30
// days and never moved again, while the app reported a 30-day streak at them.
// Every individual function involved was behaving exactly as written.
//
//   node scripts/simulate-learner.mjs            # 90 days, 8-question sessions
//   SIZE=15 node scripts/simulate-learner.mjs    # marathon sessions
//
// Not part of `npm run check` — it is slow and its output is a judgement call,
// not a pass/fail. The assertions that guard the specific regression live in
// test-engine.mjs.
// =============================================================================

import { readFileSync } from "node:fs";
import { Engine } from "../src/engine/Engine.js";

const SIZE = Number(process.env.SIZE || 8);
const mem = new Map();
const storage = {
  async get(k){return mem.has(k)?JSON.parse(mem.get(k)):null;},
  async set(k,v){mem.set(k,JSON.stringify(v));},
  async remove(k){mem.delete(k);},
  async update(k,fn){const v=fn(await this.get(k));await this.set(k,v);return v;},
  async keys(){return [...mem.keys()];}, async clear(){mem.clear();},
};
const e = new Engine(storage);
e.pack = JSON.parse(readFileSync("src/data/languages/ur.json","utf8"));
e.languageCode = "ur";

const seen = new Map();      // wordId -> times appeared
let day = 0, newPerDay = [], mixPerLesson = [];
const realDate = Date.now;
for (day = 0; day < 90; day++) {
  Date.now = () => realDate() + day * 24*3600*1000;
  const s = await e.generateSession({ mode: "smart", sessionSize: SIZE });
  const progress = await e.getProgress();
  const ids = [...new Set(s.exercises.map(x=>x.item?.id).filter(Boolean))];
  const fresh = ids.filter(id => !seen.has(id)).length;
  newPerDay.push(fresh);
  mixPerLesson.push({ total: ids.length, fresh, review: ids.length - fresh });
  for (const id of ids) seen.set(id, (seen.get(id)||0)+1);
  // Answer: 85% right.
  for (const ex of s.exercises) {
    if (!ex.item || ex.type.startsWith("introduce")) continue;
    const right = Math.random() < 0.85;
    await e.submitAnswer(ex, right ? (ex.answer ?? "") : "___definitely_wrong___");
  }
}
Date.now = realDate;
const counts = [...seen.values()];
const avg = (a)=> (a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
console.log(`after 90 daily lessons (sessionSize ${SIZE}):`);
console.log(`  distinct words met: ${seen.size}`);
console.log(`  average times each word was seen: ${avg(counts)}`);
console.log(`  words seen only once: ${counts.filter(c=>c===1).length} (${Math.round(counts.filter(c=>c===1).length/counts.length*100)}%)`);
console.log(`  new words per lesson: ${avg(newPerDay)}   review words per lesson: ${avg(mixPerLesson.map(m=>m.review))}`);
console.log(`  lessons that were ALL new (no review at all): ${mixPerLesson.filter(m=>m.review===0).length} of 30`);
for (let b=0;b<9;b++){const blk=newPerDay.slice(b*10,(b+1)*10);console.log(`  days ${b*10+1}-${b*10+10}: ${blk.reduce((x,y)=>x+y,0)} new words`);}
