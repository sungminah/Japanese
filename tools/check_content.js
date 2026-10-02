#!/usr/bin/env node
// Sanity checks for the study content. Usage: node tools/check_content.js
// - structure of every question (blank, 4 unique choices)
// - romaji sentences: furigana markup must agree with the hiragana reading
// - lists furigana pairs {漢字|よみ} that are NOT found in the JLPT word lists, for manual review
const fs = require("fs"), path = require("path");
global.window = {};
const load = (f) => { const p = path.join(__dirname, "..", "js", f); if (fs.existsSync(p)) require(p); };
["pokemon.js", "data-n5.js", "data-n5-more.js", "data-n4.js", "data-n4-more.js", "data-vocab-n5.js", "data-vocab-n4.js", "data-kanji.js", "data-kanji-n4.js", "data-romaji.js", "data-romaji-n4.js", "romaji.js"].forEach(load);
const W = window;
let problems = 0;
const bad = (m) => { console.log("PROBLEM:", m); problems++; };

// 1. question structure
const ids = new Set();
(W.QUESTIONS || []).forEach((q) => {
  if (ids.has(q.id)) bad("duplicate id " + q.id); ids.add(q.id);
  if (!q.q.includes("＿＿")) bad("no blank: " + q.id);
  if (new Set(q.c).size !== 4) bad("choices not 4 unique: " + q.id);
  if (!q.en || !q.note) bad("missing en/note: " + q.id);
});
const byLv = {};
(W.QUESTIONS || []).forEach((q) => { const k = `N${q.lv} ${q.t}`; byLv[k] = (byLv[k] || 0) + 1; });
console.log("written questions:", JSON.stringify(byLv));

// 2. romaji sentences
const plain = (s) => W.Romaji.toHira(s.replace(/\{([^|}]+)\|([^}]+)\}/g, "$2").replace(/[。、？！]/g, ""));
const rids = new Set();
(W.ROMAJI_SENTENCES || []).forEach((x) => {
  if (rids.has(x.id)) bad("duplicate romaji id " + x.id); rids.add(x.id);
  if (plain(x.s) !== W.Romaji.toHira(x.k.replace(/ /g, ""))) bad(`romaji ${x.id}: markup "${plain(x.s)}" vs reading "${x.k.replace(/ /g, "")}"`);
});
console.log("romaji sentences:", (W.ROMAJI_SENTENCES || []).length);

// 3. furigana pairs vs word lists
const known = new Set();
Object.values(W.VOCAB || {}).forEach((l) => l.forEach(([w, r]) => known.add(w + "|" + r)));
(W.KANJI || []).forEach(([c, m, on, kun, words]) => words.forEach(([w, r]) => known.add(w + "|" + r)));
const unknown = new Map();
const scan = (text, where) => { for (const m of text.matchAll(/\{([^|}]+)\|([^}]+)\}/g)) { const k = m[1] + "|" + m[2]; if (!known.has(k) && !unknown.has(k)) unknown.set(k, where); } };
(W.QUESTIONS || []).forEach((q) => { scan(q.q + q.c.join("") + q.note + q.en, q.id); });
(W.ROMAJI_SENTENCES || []).forEach((x) => scan(x.s, x.id));
console.log(`furigana pairs not in word lists (${unknown.size}) — check these by eye:`);
console.log([...unknown].map(([k, w]) => `${k.replace("|", "→")} [${w}]`).join("  "));
console.log(problems ? `\n${problems} problem(s)` : "\nno structural problems");
process.exit(problems ? 1 : 0);
