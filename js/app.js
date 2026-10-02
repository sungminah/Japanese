(function () {
  const S = () => Store.get();
  const $app = document.getElementById("app");
  const R = (t) => Ruby.render(t, S().furigana);
  const rnd = (n) => Math.floor(Math.random() * n);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const REGIONS = [
    { name: "Kanto", lv: "N5", range: [1, 151], open: true },
    { name: "Johto", lv: "N4", open: false },
    { name: "Hoenn", lv: "N3", open: false },
    { name: "Sinnoh", lv: "N2", open: false },
    { name: "Unova", lv: "N1", open: false }
  ];
  const levelOf = (xp) => Math.floor(xp / 100) + 1;

  // ---------- question selection ----------
  // Questions answered wrong before are weighted heavier so they come back for review.
  function pickQuestions(pool, n) {
    const st = S();
    const bag = [];
    pool.forEach((q) => {
      const w = 1 + (st.wrong[q.id] || 0) * 3 - Math.min(st.right[q.id] || 0, 3) * 0.2;
      bag.push({ q, k: Math.random() * Math.max(w, 0.2) });
    });
    return bag.sort((x, y) => y.k - x.k).slice(0, n).map((x) => x.q);
  }
  const poolFor = (mode) => window.QUESTIONS.filter((q) => mode === "mixed" || q.t === mode);
  function prepare(q) {
    const idx = shuffle(q.c.map((_, i) => i));
    return { q, choices: idx.map((i) => q.c[i]), answer: idx.indexOf(q.a) };
  }
  function record(q, ok) {
    const st = S();
    if (ok) { st.right[q.id] = (st.right[q.id] || 0) + 1; if (st.wrong[q.id]) { st.wrong[q.id]--; if (!st.wrong[q.id]) delete st.wrong[q.id]; } }
    else st.wrong[q.id] = (st.wrong[q.id] || 0) + 1;
  }

  // ---------- shared UI ----------
  function header() {
    const st = S();
    const lvl = levelOf(st.xp), into = st.xp % 100;
    return `<div class="row spread">
      <h1 class="pixel" style="cursor:pointer" data-go="home">JLPT QUEST</h1>
      <div class="row">
        <span class="stat">Lv ${lvl}</span><span class="stat">XP ${into}/100</span>
        <span class="stat">🔥 ${st.streak}</span><span class="stat">● ${st.balls}</span>
      </div></div>`;
  }
  function sprite(id, shiny, cls) {
    return `<img class="sprite ${cls || ""}" alt="#${id}" src="${spriteUrl(id, shiny)}" onerror="this.style.visibility='hidden'">`;
  }
  function render(html) {
    $app.innerHTML = header() + html;
    $app.querySelectorAll("[data-go]").forEach((el) => el.addEventListener("click", () => go(el.dataset.go, el.dataset.arg)));
  }

  // ---------- screens ----------
  function home() {
    const st = S();
    const regions = REGIONS.map((r) => `
      <div class="panel region ${r.open ? "" : "locked"}">
        <h3 class="pixel">${r.name} <span class="tag">${r.lv}</span></h3>
        <div class="muted">${r.open ? "Wild Pokémon are waiting on these routes." : "Locked — coming in a later update."}</div>
        ${r.open ? `<div class="row" style="margin-top:10px">
          <button class="primary" data-go="encounter" data-arg="mixed">Mixed route</button>
          <button data-go="encounter" data-arg="v">Vocabulary</button>
          <button data-go="encounter" data-arg="g">Grammar</button></div>` : ""}
      </div>`).join("");
    const caught = Object.keys(st.caught).length;
    const wrongN = Object.keys(st.wrong).length;
    render(`
      <div class="panel">
        <b>Welcome, Trainer!</b>
        <div class="muted">Answer questions to weaken wild Pokémon, then throw a ball. You caught ${caught}/151.
        ${wrongN ? `Questions to review: ${wrongN} (they appear more often).` : ""}</div>
        <div class="row" style="margin-top:10px">
          <button data-go="placement">${st.placement ? "Retake placement test" : "Placement test"}</button>
          <button data-go="dex">Pokédex</button>
          <button data-go="settings">Settings</button>
        </div>
        ${st.placement ? `<div class="muted" style="margin-top:8px">Last placement: ${st.placement.score}/${st.placement.total}. ${placementAdvice(st.placement)}</div>` : ""}
      </div>
      <div class="grid regions">${regions}</div>`);
  }

  // Generic quiz runner used by encounters and the placement test.
  function runQuiz(items, onProgress, onDone) {
    let i = 0, correct = 0;
    const results = [];
    const show = () => {
      const it = items[i];
      const body = `
        <div class="panel">
          <div class="muted">Question ${i + 1} / ${items.length} <span class="tag">${it.q.t === "v" ? "Vocabulary" : "Grammar"}</span></div>
          <div class="question">${R(it.q.q)}</div>
          <div class="choices">${it.choices.map((c, k) => `<button data-k="${k}">${R(c)}</button>`).join("")}</div>
          <div class="feedback" id="fb"></div>
        </div>`;
      onProgress(body, i, correct, items.length);
      $app.querySelectorAll(".choices button").forEach((b) => b.addEventListener("click", () => answer(+b.dataset.k)));
    };
    const answer = (k) => {
      const it = items[i], ok = k === it.answer;
      if (ok) correct++;
      results.push({ q: it.q, ok });
      record(it.q, ok); Store.save();
      $app.querySelectorAll(".choices button").forEach((b, idx) => {
        b.disabled = true;
        if (idx === it.answer) b.classList.add("right");
        else if (idx === k) b.classList.add("wrong");
      });
      const full = it.q.q.replace("＿＿", it.q.c[it.q.a]);
      document.getElementById("fb").innerHTML = `
        <div><b>${ok ? "Correct!" : "Not quite."}</b></div>
        <div class="jp">${R(full)}</div>
        <div>${Ruby.esc(it.q.en)}</div>
        <div class="muted">${R(it.q.note)}</div>
        <div style="margin-top:10px"><button class="primary" id="next">${i + 1 < items.length ? "Next" : "Finish"}</button></div>`;
      document.getElementById("next").addEventListener("click", () => { i++; i < items.length ? show() : onDone(correct, results); });
      const bar = document.getElementById("hp");
      if (bar) bar.style.width = (100 - ((ok ? correct : correct) / items.length) * 100) + "%";
    };
    show();
  }

  function encounter(mode) {
    const pool = poolFor(mode);
    const n = Math.min(5, pool.length);
    const items = pickQuestions(pool, n).map(prepare);
    const id = 1 + rnd(151);
    const shiny = Math.random() < 1 / 50;
    const name = POKEMON[id - 1];
    runQuiz(items, (body, i, correct, total) => {
      render(`<div class="panel arena">
        <div class="pixel">A wild ${shiny ? "✨shiny " : ""}${name} appeared!</div>
        ${sprite(id, shiny, "big")}
        <div class="hpbar"><div id="hp" style="width:${100 - (correct / total) * 100}%"></div></div>
        </div>${body}`);
    }, (correct, results) => finishEncounter({ id, shiny, name, correct, total: n }));
  }

  function finishEncounter(e) {
    const st = S();
    st.xp += e.correct * 10;
    Store.touchStreak();
    let msg, caught = false;
    const chance = e.correct >= 4 ? 1 : e.correct === 3 ? 0.6 : 0;
    if (st.balls <= 0 && chance > 0) { msg = "You're out of Poké Balls! The Pokémon got away."; }
    else if (chance === 0) { msg = `${e.name} was too strong and ran away. Review the answers and try again!`; }
    else {
      st.balls--;
      if (Math.random() < chance) {
        caught = true;
        const c = st.caught[e.id] || { n: 0, shiny: false };
        c.n++; c.shiny = c.shiny || e.shiny; st.caught[e.id] = c;
        msg = `Gotcha! ${e.name} was caught!`;
      } else msg = `Oh no! ${e.name} broke free and fled.`;
    }
    if (e.correct >= 4) st.balls += 1; // reward for a strong run
    Store.save();
    render(`<div class="panel arena">
      <h2 class="pixel">${msg}</h2>
      ${sprite(e.id, e.shiny, "big" + (caught ? "" : " unknown"))}
      <p>Score: ${e.correct}/${e.total} · +${e.correct * 10} XP${e.correct >= 4 ? " · +1 ball bonus" : ""}</p>
      <div class="row" style="justify-content:center">
        <button class="primary" data-go="encounter" data-arg="${modeOf(e)}">Another encounter</button>
        <button data-go="dex">Pokédex</button><button data-go="home">Home</button></div></div>`);
  }
  let lastMode = "mixed";
  const modeOf = () => lastMode;

  function placement() {
    const pool = window.QUESTIONS;
    const items = [];
    [1, 2, 3].forEach((d) => items.push(...shuffle(pool.filter((q) => q.d === d)).slice(0, 5)));
    runQuiz(items.map(prepare), (body, i, c, total) => {
      render(`<div class="panel"><b class="pixel">Placement test</b>
        <div class="muted">Just answer honestly — this helps choose your starting point.</div></div>${body}`);
    }, (correct, results) => {
      const byD = { 1: 0, 2: 0, 3: 0 };
      results.forEach((r) => { if (r.ok) byD[r.q.d]++; });
      S().placement = { score: correct, total: results.length, byDifficulty: byD, ts: Date.now() };
      Store.save();
      render(`<div class="panel"><h2 class="pixel">Result: ${correct}/${results.length}</h2>
        <p>Easy ${byD[1]}/5 · Medium ${byD[2]}/5 · Hard ${byD[3]}/5</p>
        <p>${placementAdvice(S().placement)}</p>
        <button class="primary" data-go="home">Back to map</button></div>`);
    });
  }
  function placementAdvice(p) {
    const b = p.byDifficulty;
    if (b[3] >= 4) return "Strong N5 base — N4 content will be a good next step once it unlocks.";
    if (b[2] >= 3) return "Solid on basics. Keep practising the grammar particles and te-form patterns.";
    return "Start from the Mixed route and use the vocabulary and grammar routes to build up.";
  }

  function dex() {
    const st = S();
    const cells = POKEMON.map((name, i) => {
      const id = i + 1, c = st.caught[id];
      return `<div class="dexcell ${c && c.shiny ? "shiny" : ""}">${sprite(id, c && c.shiny, c ? "" : "unknown")}
        <div>#${String(id).padStart(3, "0")}</div><div>${c ? name + (c.shiny ? " ✨" : "") : "???"}</div></div>`;
    }).join("");
    render(`<div class="panel row spread"><h2 class="pixel" style="margin:0">Pokédex ${Object.keys(st.caught).length}/151</h2>
      <button data-go="home">Back</button></div><div class="grid pokedex">${cells}</div>`);
  }

  function settings() {
    const st = S();
    render(`<div class="panel"><h2 class="pixel">Settings</h2>
      <label class="toggle"><input type="checkbox" id="furi" ${st.furigana ? "checked" : ""}> Show furigana (readings above kanji)</label>
      <div class="row" style="margin-top:14px">
        <button id="exp">Export progress</button>
        <button id="imp">Import progress</button>
        <button id="rst">Reset everything</button></div>
      <textarea id="io" rows="6" style="width:100%;margin-top:10px;display:none" placeholder="Paste exported progress here, then press Import again"></textarea>
      <div style="margin-top:12px"><button data-go="home">Back</button></div></div>`);
    document.getElementById("furi").addEventListener("change", (e) => { st.furigana = e.target.checked; Store.save(); });
    const io = document.getElementById("io");
    document.getElementById("exp").addEventListener("click", () => { io.style.display = "block"; io.value = Store.exportJSON(); io.select(); });
    document.getElementById("imp").addEventListener("click", () => {
      if (io.style.display === "none") { io.style.display = "block"; io.value = ""; return; }
      try { Store.importJSON(io.value); go("home"); } catch (e) { alert("That doesn't look like valid progress data."); }
    });
    document.getElementById("rst").addEventListener("click", () => { if (confirm("Delete all progress?")) { Store.reset(); go("home"); } });
  }

  function go(screen, arg) {
    if (screen === "encounter") { lastMode = arg || "mixed"; return encounter(lastMode); }
    ({ home, placement, dex, settings }[screen] || home)();
    window.scrollTo(0, 0);
  }

  window.__app = { go };   // handy for debugging in the console
  go("home");
})();
