// Evolution lines (generated pairs in pokemon.js). Each evolution costs candy of one skill type:
// g = Grammar, v = Vocabulary, k = Kanji, r = Romaji, d = Reading, l = Listening.
window.Evo = (function () {
  const TYPES = ["g", "v", "k", "r", "d", "l"];
  const EEVEE = { 134: "v", 135: "k", 136: "g", 196: "d", 197: "l" };
  const genOf = (id) => window.GEN_RANGES.findIndex((r) => id >= r[0] && id <= r[1]) + 1;
  const next = {}, pre = {};
  window.EVO_PAIRS.forEach(([f, t]) => { (next[f] = next[f] || []).push(t); (pre[t] = pre[t] || []).push(f); });
  Object.keys(next).forEach((k) => next[k].sort((a, b) => a - b));
  // Baby forms from a later generation (e.g. Pichu -> Pikachu) don't count as a "previous stage",
  // so Pikachu still behaves like a basic Kanto Pokémon.
  const effPre = (id) => (pre[id] || []).filter((p) => genOf(p) <= genOf(id));

  function options(id) {
    return (next[id] || []).map((to, i) => ({
      to,
      type: id === 133 ? EEVEE[to] : TYPES[(id + i) % 6],
      cost: id === 133 ? 25 : effPre(id).length ? 30 : next[to] ? 15 : 20
    }));
  }
  // basic / middle / final / single (no evolution) / legend
  function tier(id) {
    if (window.LEGENDARY.includes(id)) return "legend";
    const hasPre = effPre(id).length > 0, hasNext = !!next[id];
    return hasPre ? (hasNext ? "middle" : "final") : (hasNext ? "basic" : "single");
  }
  // Wild spawn weights: basic forms are common, evolved forms are rare, legends never spawn.
  const WEIGHT = { legend: 0, basic: 10, middle: 3, final: 1, single: 1 };
  return { options, tier, genOf, weight: (id) => WEIGHT[tier(id)] };
})();
