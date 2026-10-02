// Progress is kept in the browser (localStorage). Export/import allows backups.
(function () {
  const KEY = "jlpt-trainer-v1";
  const defaults = () => ({
    furigana: true,
    xp: 0,
    balls: 5,
    streak: 0,
    lastDay: null,
    caught: {},      // pokemon id -> { n: times caught, shiny: bool }
    wrong: {},       // question id -> times answered wrong (not yet cleared)
    right: {},       // question id -> times answered right
    placement: null  // { score, byDifficulty, ts }
  });

  let state;
  try { state = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch (e) { state = defaults(); }

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
    importJSON(text) { state = Object.assign(defaults(), JSON.parse(text)); save(); },
    reset() { state = defaults(); save(); }
  };
})();
