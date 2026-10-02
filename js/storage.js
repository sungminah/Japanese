// Progress is kept in the browser (localStorage). Export/import allows backups.
(function () {
  const KEY = "jlpt-trainer-v1";
  const defaults = () => ({
    furigana: true,
    xp: 0,
    balls: 5,
    streak: 0,
    bestStreak: 0,
    lastDay: null,
    caught: {},      // pokemon id -> { n: copies owned, shiny: bool, at: time first obtained }
    legends: {},     // legendary id -> true once claimed from a Legend quest
    dex: {},         // pokemon id -> { shiny } registered in the Pokédex (never removed)
    candy: { g: 0, v: 0, k: 0, r: 0 },                    // evolution candy per skill
    skill: { g: { c: 0, t: 0 }, v: { c: 0, t: 0 }, k: { c: 0, t: 0 }, r: { c: 0, t: 0 } }, // correct / total per skill
    prog: {},        // region id -> { g, v, k, r } correct answers inside that region's study content
    unlocked: { kanto: true }, // regions you can travel to
    badges: {},      // region id -> true once its Gym Leader exam is passed
    reports: {},     // question id -> { note, text, answer, en, ts } flagged by you; hidden from quizzes
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
    // Per-region progress (older saves: everything so far counted as Kanto / N5).
    const oldSkill = (t) => (s.skill[t] && s.skill[t].c) || 0;
    ["kanto", "johto", "hoenn", "sinnoh", "unova"].forEach((r) => {
      const base = r === "kanto" && !(s.prog && s.prog.kanto) ? { g: oldSkill("g"), v: oldSkill("v"), k: oldSkill("k"), r: oldSkill("r") } : {};
      s.prog = s.prog || {};
      s.prog[r] = Object.assign({ g: 0, v: 0, k: 0, r: 0 }, base, s.prog[r]);
    });
    s.unlocked = Object.assign({ kanto: true }, s.unlocked);
    s.badges = s.badges || {};
    s.reports = s.reports || {};
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
      state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
      save();
      return true;
    },
    exportJSON: () => JSON.stringify(state, null, 2),
    importJSON(text) { state = fix(JSON.parse(text)); save(); },
    reset() { state = fix({}); save(); }
  };
})();
