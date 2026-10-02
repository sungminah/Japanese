// Turns the JLPT word lists (data-vocab-nX.js) into multiple-choice questions.
//   "v" (Vocabulary): word -> meaning, meaning -> word
//   "k" (Kanji):      kanji word -> reading, meaning + reading -> kanji word
(function () {
  const HAN = /[一-鿿]/;
  const rnd = (n) => Math.floor(Math.random() * n);

  // "食べる","たべる" -> "{食|た}べる"  (furigana only over the kanji part)
  function furi(w, r) {
    if (!HAN.test(w)) return w;
    let i = 0;
    while (i < w.length && i < r.length && w[i] === r[i] && !HAN.test(w[i])) i++;
    let j = 0;
    while (j < w.length - i && j < r.length - i && w[w.length - 1 - j] === r[r.length - 1 - j] && !HAN.test(w[w.length - 1 - j])) j++;
    const mid = w.slice(i, w.length - j), rmid = r.slice(i, r.length - j);
    if (!mid || !rmid || !HAN.test(mid)) return w;
    return w.slice(0, i) + `{${mid}|${rmid}}` + w.slice(w.length - j);
  }
  const tokens = (m) => new Set((m.toLowerCase().match(/[a-z]{4,}/g) || []));
  const overlap = (a, b) => { const ta = tokens(a); for (const t of tokens(b)) if (ta.has(t)) return true; return false; };

  // Picks up to n random entries (by index) that satisfy ok(entry), without repeats.
  function pickOthers(list, self, n, ok, seenKey) {
    const out = [], used = new Set([seenKey(list[self])]);
    for (let tries = 0; tries < 80 && out.length < n; tries++) {
      const e = list[rnd(list.length)], key = seenKey(e);
      if (used.has(key) || !ok(e)) continue;
      used.add(key); out.push(e);
    }
    return out;
  }

  window.buildVocabQuestions = function (lv, kind) {
    const list = (window.VOCAB && window.VOCAB[lv]) || [];
    if (list.length < 8) return [];
    const out = [], withHan = list.map((e, i) => i).filter((i) => HAN.test(list[i][0]));
    list.forEach((e, i) => {
      const [w, r, m] = e, id = `${lv}:${w}:${r}`;
      const full = `${w}${w === r ? "" : ` (${r})`} = ${m}`;
      if (kind === "v") {
        const meanings = pickOthers(list, i, 3, (o) => !overlap(m, o[2]) && o[2] !== m, (o) => o[2]);
        if (meanings.length === 3)
          out.push({ id: "v:" + id + ":m", t: "v", lv, d: 1, p: "What does this word mean?", q: furi(w, r), big: true,
            c: [m, ...meanings.map((o) => o[2])], a: 0, en: full, note: "" });
        const words = pickOthers(list, i, 3, (o) => !overlap(m, o[2]), (o) => o[0] + o[1]);
        if (words.length === 3)
          out.push({ id: "v:" + id + ":w", t: "v", lv, d: 2, p: "Which Japanese word means this?", q: `“${m}”`, cbig: true,
            c: [furi(w, r), ...words.map((o) => furi(o[0], o[1]))], a: 0, en: full, note: "" });
      } else if (HAN.test(w)) {
        const near = (o) => HAN.test(o[0]) && Math.abs(o[1].length - r.length) <= 1 && o[1] !== r;
        const reads = pickOthers(list, i, 3, near, (o) => o[1]);
        if (reads.length === 3)
          out.push({ id: "k:" + id + ":r", t: "k", lv, d: 2, p: "How do you read this word?", q: w, big: true,
            c: [r, ...reads.map((o) => o[1])], a: 0, en: full, note: "" });
        const forms = pickOthers(list, i, 3, (o) => HAN.test(o[0]) && Math.abs(o[0].length - w.length) <= 1 && o[0] !== w, (o) => o[0]);
        if (forms.length === 3)
          out.push({ id: "k:" + id + ":w", t: "k", lv, d: 3, p: "Which word is this?", q: `“${m}” — ${r}`, cbig: true,
            c: [w, ...forms.map((o) => o[0])], a: 0, en: full, note: "" });
      }
    });
    return out;
  };
})();
