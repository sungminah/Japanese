// Turns grammar pattern lists (data-grammar-nX.js) into multiple-choice questions.
// window.GRAMMAR[level] = [[pattern, meaning, example (furigana markup), example translation, category], ...]
// Distractors always come from a *different category*, so only one answer can be right.
(function () {
  const rnd = (n) => Math.floor(Math.random() * n);
  function pick(list, self, n, key) {
    const pool = list.filter((e) => e[4] !== self[4]);
    const out = [], used = new Set([key(self)]);
    for (let tries = 0; tries < 60 && out.length < n && pool.length; tries++) {
      const e = pool[rnd(pool.length)];
      if (used.has(key(e))) continue;
      used.add(key(e)); out.push(e);
    }
    return out;
  }
  window.buildGrammarQuestions = function (lv) {
    const list = (window.GRAMMAR && window.GRAMMAR[lv]) || [];
    if (list.length < 8) return [];
    const out = [];
    list.forEach((e) => {
      const [pattern, meaning, example, exEn] = e;
      const note = `Example: ${example} — ${exEn}`;
      const pats = pick(list, e, 3, (x) => x[0]);
      if (pats.length === 3)
        out.push({ id: `g:${lv}:${pattern}:p`, t: "g", lv, d: 3, p: "Which expression matches this meaning?", q: `“${meaning}”`, cbig: true,
          c: [pattern, ...pats.map((x) => x[0])], a: 0, en: `${window.Ruby.plain(pattern)} = ${meaning}`, note });
      const means = pick(list, e, 3, (x) => x[1]);
      if (means.length === 3)
        out.push({ id: `g:${lv}:${pattern}:m`, t: "g", lv, d: 3, p: "What does this expression mean?", q: pattern, big: true,
          c: [meaning, ...means.map((x) => x[1])], a: 0, en: `${window.Ruby.plain(pattern)} = ${meaning}`, note });
    });
    return out;
  };
})();
