// Progress is kept in the browser (localStorage). Export/import allows backups.
(function () {
  const KEY = "jlpt-trainer-v1";
  const defaults = () => ({
    furigana: true,
    xp: 0,
    balls: 5,
    streak: 0,
    lastDay: null,
    caught: {},      // pokemon id -> { n: copies owned, shiny: bool, at: time first obtained }
    dex: {},         // pokemon id -> { shiny } registered in the Pokédex (never removed)
    candy: { g: 0, v: 0, k: 0, r: 0 },                    // evolution candy per skill
    skill: { g: { c: 0, t: 0 }, v: { c: 0, t: 0 }, k: { c: 0, t: 0 }, r: { c: 0, t: 0 } }, // correct / total per skill
    wrong: {},       // question id -> times answered wrong (not yet cleared)
    right: {},       // question id -> times answered right
    placement: null  // { score, total, byDifficulty, ts }
  });

  // Fill in anything missing (older saves) and keep the Pokédex in sync with owned Pokémon.
  function fix(s) {
    const d = defaults();
    s = Object.assign(d, s || {});
    s.candy = Object.assign(defaults().candy, s.candy);
    ["g", "v", "k", "r"].forEach((t) => { s.skill[t] = Object.assign({ c: 0, t: 0 }, s.skill[t]); });
    Object.keys(s.caught).forEach((id) => { if (!s.dex[id]) s.dex[id] = { shiny: !!s.caught[id].shiny }; });
    return s;
  }

  let state;
  try { state = fix(JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch (e) { state = fix({}); }

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };
  const today = () => new Date().toISOString().slice(0, 10);

  window.Store = {
    get: () => state,
    save,
    touchStreak() {
      const t = today();
      if (state.lastDay === t) return false;
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      state.streak = state.lastDay === y ? state.streak + 1 : 1;
      state.lastDay = t;
      save();
      return true;
    },
    exportJSON: () => JSON.stringify(state, null, 2),
    importJSON(text) { state = fix(JSON.parse(text)); save(); },
    reset() { state = fix({}); save(); }
  };
})();
