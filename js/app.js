(function () {
  const S = () => Store.get();
  const $app = document.getElementById("app");
  const R = (t) => Ruby.render(t, S().furigana);
  const esc = Ruby.esc;
  const rnd = (n) => Math.floor(Math.random() * n);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // Skills: g/v/k/r. Each correct answer earns XP and candy of that skill.
  const SKILLS = {
    g: { name: "Grammar", candy: "Grammar candy" },
    v: { name: "Vocabulary", candy: "Vocab candy" },
    k: { name: "Kanji", candy: "Kanji candy" },
    r: { name: "Romaji", candy: "Romaji candy" }
  };
  const ROUTES = [
    { id: "mixed", label: "Mixed route", cls: "mix" },
    { id: "g", label: "Grammar", cls: "g" },
    { id: "v", label: "Vocabulary", cls: "v" },
    { id: "k", label: "Kanji only", cls: "k" },
    { id: "r", label: "Romaji reading", cls: "r" }
  ];
  const REGIONS = [
    { name: "Kanto", lv: "N5", cls: "kanto", open: true },
    { name: "Johto", lv: "N4", cls: "johto" },
    { name: "Hoenn", lv: "N3", cls: "hoenn" },
    { name: "Sinnoh", lv: "N2", cls: "sinnoh" },
    { name: "Unova", lv: "N1", cls: "unova" }
  ];
  const levelOf = (xp) => Math.floor(xp / 100) + 1;
  const SKILL_STEP = 25; // correct answers per skill level
  const hue = (id) => (id * 47) % 360;
  const pad = (id) => String(id).padStart(3, "0");

  let screenToken = 0, keyHandler = null, lastRoute = "mixed";
  const setKeys = (fn) => { if (keyHandler) document.removeEventListener("keydown", keyHandler); keyHandler = fn; if (fn) document.addEventListener("keydown", fn); };

  // ---------- question pools ----------
  function poolOf(t) {
    if (t === "k") return window.buildKanjiQuestions();
    if (t === "r") return window.ROMAJI_SENTENCES.map((s) => ({ id: s.id, t: "r", d: s.d, s: s.s, k: s.k, en: s.en }));
    return window.QUESTIONS.filter((q) => q.t === t);
  }
  // Questions answered wrong before are weighted heavier so they come back for review.
  function pickQuestions(pool, n) {
    const st = S();
    return pool.map((q) => ({ q, k: Math.random() * Math.max(0.2, 1 + (st.wrong[q.id] || 0) * 3 - Math.min(st.right[q.id] || 0, 3) * 0.2) }))
      .sort((x, y) => y.k - x.k).slice(0, n).map((x) => x.q);
  }
  function pickForRoute(route, n) {
    if (route !== "mixed") return pickQuestions(poolOf(route), n);
    const order = shuffle(["g", "v", "k", "r"]), counts = {};
    for (let i = 0; i < n; i++) counts[order[i % 4]] = (counts[order[i % 4]] || 0) + 1;
    let out = [];
    Object.keys(counts).forEach((t) => { out = out.concat(pickQuestions(poolOf(t), counts[t])); });
    return shuffle(out);
  }
  function prepare(q) {
    if (q.t === "r") return { q };
    const idx = shuffle(q.c.map((_, i) => i));
    return { q, choices: idx.map((i) => q.c[i]), answer: idx.indexOf(q.a) };
  }
  function record(q, ok) {
    const st = S();
    if (ok) {
      st.right[q.id] = (st.right[q.id] || 0) + 1;
      if (st.wrong[q.id]) { st.wrong[q.id]--; if (!st.wrong[q.id]) delete st.wrong[q.id]; }
    } else st.wrong[q.id] = (st.wrong[q.id] || 0) + 1;
  }

  // ---------- shared UI ----------
  const ballIcon = '<span class="ball"></span>';
  function header() {
    const st = S(), into = st.xp % 100;
    return `<header class="top">
      <h1 class="logo" data-go="home">${ballIcon}<span>JLPT</span> QUEST</h1>
      <div class="stats">
        <span class="stat lvl">Lv ${levelOf(st.xp)}</span>
        <span class="stat xp" title="XP to next level"><span class="xpbar"><i style="width:${into}%"></i></span>${into}/100</span>
        <span class="stat fire">🔥 ${st.streak}</span>
        <span class="stat balls">${ballIcon} ${st.balls}</span>
      </div></header>`;
  }
  function sprite(id, shiny, cls) {
    return `<img class="sprite ${cls || ""}" alt="#${id}" src="${spriteUrl(id, shiny)}" onerror="this.style.visibility='hidden'">`;
  }
  function render(html) {
    $app.innerHTML = header() + `<main>${html}</main>`;
  }
  $app.addEventListener("click", (e) => {
    const el = e.target.closest("[data-go]");
    if (el && !el.disabled) go(el.dataset.go, el.dataset.arg);
  });
  function confetti() {
    const box = document.createElement("div");
    box.className = "confetti";
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = `hsl(${rnd(360)} 90% 60%)`;
      p.style.animationDelay = Math.random() * 0.5 + "s";
      p.style.setProperty("--dx", Math.random() * 200 - 100 + "px");
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3000);
  }
  const chip = (t, text) => `<span class="chip ${t}">${text}</span>`;
  const candyChip = (t, n) => chip(t, `${n} ${SKILLS[t].candy}`);

  // ---------- rewards ----------
  function addXp(amount, ctx) {
    const st = S(), before = levelOf(st.xp);
    st.xp += amount; ctx.xp += amount;
    const gained = levelOf(st.xp) - before;
    if (gained > 0) { st.balls += 3 * gained; ctx.levelUps += gained; }
  }
  // Every correct answer: +10 XP and +1 candy of its skill (+1 extra from a 3-answer combo).
  function applyReward(q, ok, combo, ctx) {
    const st = S(), t = q.t;
    st.skill[t].t++;
    if (!ok) return "";
    st.skill[t].c++;
    const candy = 1 + (combo >= 3 ? 1 : 0);
    st.candy[t] += candy;
    ctx.candy[t] = (ctx.candy[t] || 0) + candy;
    addXp(10, ctx);
    return chip(t, `+${candy} ${SKILLS[t].candy}`) + chip("xp", "+10 XP") + (combo >= 3 ? chip("combo", `🔥 combo ×${combo}`) : "");
  }

  // ---------- quiz runner (used by encounters and the placement test) ----------
  function questionHTML(it, i, total, combo) {
    const q = it.q;
    const head = `<div class="qhead"><span class="muted">Question ${i + 1} / ${total}</span>
      <span class="tag ${q.t}">${SKILLS[q.t].name}</span>${combo >= 2 ? `<span class="chip combo">🔥 combo ×${combo}</span>` : ""}</div>`;
    if (q.t === "r") {
      return head + `<div class="prompt">Type the romaji (romanization) of this sentence</div>
        <div class="question jp-big">${Ruby.render(q.s, true)}</div>
        <div class="row answer-row">
          <input id="ans" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="e.g. watashi wa gakusei desu">
          <button class="btn r" id="check">Check</button>
        </div>
        <div class="row"><button class="linkbtn" id="hint">💡 Show meaning</button><span class="muted" id="hintbox"></span></div>
        <div class="feedback" id="fb"></div>`;
    }
    return head + (q.p ? `<div class="prompt">${esc(q.p)}</div>` : "") +
      `<div class="question ${q.big ? "kanji-big" : ""}">${R(q.q)}</div>
       <div class="choices ${q.cbig ? "kanji-choices" : ""}">${it.choices.map((c, k) => `<button class="btn choice" data-k="${k}"><kbd>${k + 1}</kbd> ${R(c)}</button>`).join("")}</div>
       <div class="feedback" id="fb"></div>`;
  }

  // ui: { box, onUpdate(correct,total), reward(q, ok, combo) -> html }
  function runQuiz(items, ui, onDone) {
    let i = 0, correct = 0, combo = 0, maxCombo = 0, answered = false;
    const results = [];
    const box = () => document.getElementById("quiz");

    const finishStep = (ok, extraHTML, fbHTML) => {
      answered = true;
      const it = items[i];
      if (ok) { correct++; combo++; maxCombo = Math.max(maxCombo, combo); } else combo = 0;
      results.push({ q: it.q, ok });
      record(it.q, ok);
      const rewardHTML = ui.reward ? ui.reward(it.q, ok, combo) : "";
      Store.save();
      ui.onUpdate(correct, items.length, ok);
      const fb = document.getElementById("fb");
      fb.innerHTML = `<div class="verdict ${ok ? "good" : "bad"}">${ok ? "✅ Correct!" : "❌ Not quite."}</div>${fbHTML}
        ${rewardHTML ? `<div class="rewards">${rewardHTML}</div>` : ""}
        <div style="margin-top:12px"><button class="btn gold" id="next">${i + 1 < items.length ? "Next ▶" : "Finish ▶"}</button></div>`;
      document.getElementById("next").addEventListener("click", () => { i++; i < items.length ? show() : (setKeys(null), onDone(correct, results, maxCombo)); });
      document.getElementById("next").focus();
    };

    const answerChoice = (k) => {
      if (answered) return;
      const it = items[i], q = it.q, ok = k === it.answer;
      box().querySelectorAll(".choice").forEach((b, idx) => {
        b.disabled = true;
        if (idx === it.answer) b.classList.add("right");
        else if (idx === k) b.classList.add("wrong");
      });
      const filled = q.q.includes("＿＿") ? `<div class="jp">${R(q.q.replace("＿＿", q.c[q.a]))}</div>` : "";
      finishStep(ok, "", `${filled}<div>${esc(q.en)}</div>${q.note ? `<div class="muted">${R(q.note)}</div>` : ""}`);
    };

    const answerRomaji = () => {
      if (answered) return;
      const it = items[i], q = it.q, input = document.getElementById("ans");
      if (!input.value.trim()) { input.focus(); return; }
      const res = Romaji.check(q.k, input.value);
      input.disabled = true; document.getElementById("check").disabled = true;
      input.classList.add(res.ok ? "right" : "wrong");
      const hira = q.k.replace(/ /g, "");
      const tip = res.ok && !res.exact ? `<div class="muted">👍 Accepted. Tip: long vowels are written out as <b>${esc(res.expected)}</b>.</div>` : "";
      finishStep(res.ok, "", `
        ${tip}
        <div class="muted">Your answer</div><div class="mono">${esc(input.value.trim())}</div>
        <div class="muted">Correct romaji</div><div class="mono good-text">${esc(res.expected)}</div>
        <div class="jp">${esc(hira)}</div><div>${esc(q.en)}</div>`);
    };

    function show() {
      answered = false;
      const it = items[i];
      window.__current = it; // handy for debugging / tests
      box().innerHTML = `<div class="panel">${questionHTML(it, i, items.length, combo)}</div>`;
      if (it.q.t === "r") {
        const input = document.getElementById("ans");
        input.focus();
        input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); answerRomaji(); } });
        document.getElementById("check").addEventListener("click", answerRomaji);
        document.getElementById("hint").addEventListener("click", () => { document.getElementById("hintbox").textContent = it.q.en; });
        setKeys(null);
      } else {
        box().querySelectorAll(".choice").forEach((b) => b.addEventListener("click", () => answerChoice(+b.dataset.k)));
        setKeys((e) => {
          if (e.target.tagName === "INPUT") return;
          const n = +e.key;
          if (n >= 1 && n <= it.choices.length) answerChoice(n - 1);
        });
      }
    }
    show();
  }

  // ---------- screens ----------
  function canEvolve(id) {
    return Evo.options(id).some((o) => S().candy[o.type] >= o.cost);
  }
  function monCell(id) {
    const c = S().caught[id];
    const ready = canEvolve(id);
    return `<button class="mon ${c.shiny ? "shiny" : ""} ${ready ? "ready" : ""}" data-go="mon" data-arg="${id}"
        style="--h:${hue(id)}" title="${POKEMON[id - 1]}">
      ${sprite(id, c.shiny)}
      <span class="nm">${POKEMON[id - 1]}</span>
      ${c.n > 1 ? `<span class="badge n">×${c.n}</span>` : ""}${c.shiny ? '<span class="badge s">✨</span>' : ""}${ready ? '<span class="badge e">⬆</span>' : ""}
    </button>`;
  }
  const ownedIds = () => Object.keys(S().caught).map(Number).filter((id) => S().caught[id].n > 0);

  function home() {
    const st = S();
    const owned = ownedIds().sort((a, b) => (st.caught[b].at || 0) - (st.caught[a].at || 0));
    const shown = owned.slice(0, 18);
    const ready = owned.filter(canEvolve).length;
    const wrongN = Object.keys(st.wrong).length;

    const collection = owned.length
      ? `<div class="monstrip">${shown.map(monCell).join("")}</div>
         <div class="row" style="margin-top:10px"><button class="btn small" data-go="team">All my Pokémon (${owned.length})</button>
         ${ready ? `<span class="chip combo">⬆ ${ready} ready to evolve!</span>` : ""}</div>`
      : `<div class="empty">No Pokémon yet. Start an encounter below and catch your first one! ${ballIcon}</div>`;

    const candyBag = ["g", "v", "k", "r"].map((t) => candyChip(t, st.candy[t])).join("");
    const skills = ["g", "v", "k", "r"].map((t) => {
      const c = st.skill[t].c, lvl = Math.floor(c / SKILL_STEP) + 1, into = c % SKILL_STEP;
      return `<div class="skill"><div class="skillname"><b class="c-${t}">${SKILLS[t].name}</b> <span>Lv ${lvl}</span></div>
        <div class="bar ${t}"><i style="width:${(into / SKILL_STEP) * 100}%"></i></div>
        <div class="muted small">${c} correct · ${into}/${SKILL_STEP} to next level</div></div>`;
    }).join("");

    const regions = REGIONS.map((r) => `
      <div class="panel region ${r.cls} ${r.open ? "" : "locked"}">
        <h3><span>${r.open ? "" : "🔒 "}${r.name}</span> <span class="tag">${r.lv}</span></h3>
        ${r.open ? `<div class="muted">Pick a route. Every correct answer weakens the wild Pokémon and earns candy.</div>
          <div class="row routes">${ROUTES.map((x) => `<button class="btn ${x.cls}" data-go="encounter" data-arg="${x.id}">${x.label}</button>`).join("")}</div>`
        : `<div class="muted">Locked — coming in a later update.</div>`}
      </div>`).join("");

    render(`
      <section class="panel hero">
        <div>
          <h2>Welcome back, Trainer!</h2>
          <div class="muted">Answer questions, catch Pokémon, and use candy to evolve them.
          ${wrongN ? `<br>Questions to review: <b>${wrongN}</b> (they come back more often).` : ""}</div>
        </div>
        <div class="row">
          <button class="btn small" data-go="placement">${st.placement ? "Retake placement test" : "Placement test"}</button>
          <button class="btn small" data-go="dex">Pokédex ${Object.keys(st.dex).length}/151</button>
          <button class="btn small" data-go="settings">Settings</button>
        </div>
        ${st.placement ? `<div class="muted small">Last placement: ${st.placement.score}/${st.placement.total}. ${placementAdvice(st.placement)}</div>` : ""}
      </section>
      <section class="panel"><h2>Your Pokémon</h2>${collection}</section>
      <div class="two">
        <section class="panel"><h2>Candy bag</h2><div class="muted small">Earn candy by answering correctly. Spend it to evolve Pokémon.</div>
          <div class="row candy-row">${candyBag}</div></section>
        <section class="panel"><h2>Skills</h2>${skills}</section>
      </div>
      <div class="grid regions">${regions}</div>`);
  }

  function encounter(route) {
    lastRoute = route;
    const st = S();
    let note = "";
    if (st.balls < 1) { st.balls = 1; Store.save(); note = "The Professor handed you a spare Poké Ball."; }
    const items = pickForRoute(route, 5).map(prepare);
    const id = 1 + rnd(151), shiny = Math.random() < 1 / 50, name = POKEMON[id - 1];
    const ctx = { xp: 0, candy: {}, levelUps: 0 };
    render(`
      <section class="panel arena" style="--h:${hue(id)}">
        <div class="pixel">A wild ${shiny ? "✨ shiny " : ""}<b>${name}</b> appeared! <span class="muted">Lv ${5 + rnd(30)}</span></div>
        ${sprite(id, shiny, "big float")}
        <div class="hpbar"><div id="hp" style="width:100%"></div></div>
        ${note ? `<div class="muted small">${note}</div>` : ""}
      </section>
      <div id="quiz"></div>`);
    runQuiz(items, {
      reward: (q, ok, combo) => applyReward(q, ok, combo, ctx),
      onUpdate: (correct, total, ok) => {
        const hp = document.getElementById("hp"), pct = 100 - (correct / total) * 100;
        hp.style.width = pct + "%";
        hp.style.background = pct > 50 ? "#34d399" : pct > 25 ? "#fbbf24" : "#ef4444";
        const sp = document.querySelector(".arena .sprite");
        sp.classList.remove("hit", "taunt"); void sp.offsetWidth; sp.classList.add(ok ? "hit" : "taunt");
      }
    }, (correct, results, maxCombo) => finishEncounter({ id, shiny, name, correct, total: items.length, maxCombo, ctx }));
  }

  function finishEncounter(e) {
    const st = S(), ctx = e.ctx, perfect = e.correct === e.total;
    const extras = [];
    if (perfect) { addXp(20, ctx); st.balls += 1; extras.push("🌟 Perfect! +20 XP and +1 Poké Ball"); }
    if (Store.touchStreak()) {
      const bonus = 2 + Math.min(st.streak, 5);
      st.balls += bonus;
      extras.push(`📅 Daily bonus: +${bonus} Poké Balls (streak ${st.streak})`);
    }
    if (ctx.levelUps) extras.push(`⭐ Trainer level up! Now Lv ${levelOf(st.xp)} (+${3 * ctx.levelUps} Poké Balls)`);

    const chance = perfect || e.correct >= 4 ? 1 : e.correct === 3 ? 0.6 : 0;
    let caught = false, msg;
    if (chance === 0) msg = `${e.name} was too strong and ran away. Review the answers and try again!`;
    else if (st.balls <= 0) msg = `You're out of Poké Balls! ${e.name} got away.`;
    else {
      st.balls--;
      if (Math.random() < chance) {
        caught = true;
        const c = st.caught[e.id] || { n: 0, shiny: false, at: 0 };
        c.n++; c.shiny = c.shiny || e.shiny; c.at = Date.now(); st.caught[e.id] = c;
        st.dex[e.id] = { shiny: (st.dex[e.id] && st.dex[e.id].shiny) || e.shiny };
        msg = `Gotcha! ${e.name} was caught!`;
      } else msg = `Oh no! ${e.name} broke free and fled.`;
    }
    Store.save();

    const candyHTML = Object.keys(ctx.candy).map((t) => candyChip(t, "+" + ctx.candy[t])).join("") || '<span class="muted">No candy this time.</span>';
    const final = () => {
      render(`<section class="panel arena result ${caught ? "win" : ""}" style="--h:${hue(e.id)}">
        <h2 class="pixel">${msg}</h2>
        ${sprite(e.id, e.shiny, "big" + (caught ? " float" : " unknown"))}
        <p>Score <b>${e.correct}/${e.total}</b> · best combo ×${e.maxCombo} · <b>+${ctx.xp} XP</b></p>
        <div class="row center">${candyHTML}</div>
        ${extras.length ? `<ul class="extras">${extras.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
        <div class="row center" style="margin-top:12px">
          <button class="btn gold" data-go="encounter" data-arg="${lastRoute}">Another encounter</button>
          <button class="btn" data-go="home">Home</button>
          ${caught ? `<button class="btn" data-go="mon" data-arg="${e.id}">View ${e.name}</button>` : ""}
        </div></section>`);
      if (caught) confetti();
    };
    if (chance > 0 && st.balls >= 0 && !/out of Poké/.test(msg)) {
      const token = ++screenToken;
      render(`<section class="panel arena" style="--h:${hue(e.id)}"><h2 class="pixel">Go, Poké Ball!</h2>
        ${sprite(e.id, e.shiny, "big dim")}<div class="ball throw wobble"></div><div class="muted">...</div></section>`);
      setTimeout(() => { if (token === screenToken) final(); }, 1500);
    } else final();
  }

  // Detail screen: info and evolution for one owned Pokémon.
  function mon(id) {
    id = +id;
    const st = S(), c = st.caught[id];
    if (!c || c.n < 1) return home();
    const opts = Evo.options(id);
    const evoHTML = opts.length ? opts.map((o) => {
      const have = st.candy[o.type], ok = have >= o.cost;
      return `<div class="evo ${ok ? "ok" : ""}" style="--h:${hue(o.to)}">
        <div class="evopair">${sprite(id, c.shiny)}<span class="arrow">➜</span>${sprite(o.to, c.shiny, st.dex[o.to] ? "" : "unknown")}</div>
        <div><b>${st.dex[o.to] ? POKEMON[o.to - 1] : "???"}</b></div>
        <div class="muted small">Needs ${candyChip(o.type, o.cost)}</div>
        <div class="bar ${o.type}"><i style="width:${Math.min(100, (have / o.cost) * 100)}%"></i></div>
        <div class="muted small">You have ${have} / ${o.cost}</div>
        <button class="btn gold" data-evo="${o.to}" ${ok ? "" : "disabled"}>${ok ? "Evolve!" : "Not enough candy"}</button>
      </div>`;
    }).join("") : `<div class="muted">${POKEMON[id - 1]} is in its final form (or doesn't evolve in this game).</div>`;

    render(`<section class="panel arena" style="--h:${hue(id)}">
        <div class="pixel">#${pad(id)}</div><h2>${POKEMON[id - 1]} ${c.shiny ? "✨" : ""}</h2>
        ${sprite(id, c.shiny, "big float")}
        <p class="muted">You own ×${c.n}</p></section>
      <section class="panel"><h2>Evolution</h2><div class="evos">${evoHTML}</div></section>
      <div class="row"><button class="btn" data-go="team">◀ My Pokémon</button><button class="btn" data-go="home">Home</button></div>`);
    $app.querySelectorAll("[data-evo]").forEach((b) => b.addEventListener("click", () => evolve(id, +b.dataset.evo)));
  }

  function evolve(from, to) {
    const st = S(), c = st.caught[from], o = Evo.options(from).find((x) => x.to === to);
    if (!c || !o || st.candy[o.type] < o.cost) return;
    st.candy[o.type] -= o.cost;
    c.n--;
    const shiny = c.shiny;
    if (c.n < 1) delete st.caught[from];
    const d = st.caught[to] || { n: 0, shiny: false, at: 0 };
    d.n++; d.shiny = d.shiny || shiny; d.at = Date.now();
    st.caught[to] = d;
    st.dex[to] = { shiny: (st.dex[to] && st.dex[to].shiny) || shiny };
    addXp(25, { xp: 0, levelUps: 0, candy: {} });
    Store.save();
    const token = ++screenToken;
    render(`<section class="panel arena evolving" style="--h:${hue(from)}">
      <h2 class="pixel">What? ${POKEMON[from - 1]} is evolving!</h2>${sprite(from, shiny, "big evolve-flash")}</section>`);
    setTimeout(() => {
      if (token !== screenToken) return;
      render(`<section class="panel arena result win" style="--h:${hue(to)}">
        <h2 class="pixel">Congratulations! ${POKEMON[from - 1]} evolved into ${POKEMON[to - 1]}!</h2>
        ${sprite(to, shiny, "big float")}<p class="muted">+25 XP</p>
        <div class="row center"><button class="btn gold" data-go="mon" data-arg="${to}">View ${POKEMON[to - 1]}</button>
        <button class="btn" data-go="team">My Pokémon</button><button class="btn" data-go="home">Home</button></div></section>`);
      confetti();
    }, 2000);
  }

  function team() {
    const ids = ownedIds().sort((a, b) => (canEvolve(b) - canEvolve(a)) || a - b);
    render(`<section class="panel row spread"><h2 style="margin:0">My Pokémon (${ids.length})</h2>
        <button class="btn small" data-go="home">Back</button></section>
      <section class="panel">${ids.length ? `<div class="monstrip big">${ids.map(monCell).join("")}</div>
      <div class="muted small" style="margin-top:8px">⬆ = enough candy to evolve. Tap a Pokémon to see details.</div>` : '<div class="empty">Nothing here yet — go catch something!</div>'}</section>`);
  }

  function placement() {
    const pool = window.QUESTIONS, items = [];
    [1, 2, 3].forEach((d) => items.push(...shuffle(pool.filter((q) => q.d === d)).slice(0, 5)));
    render(`<section class="panel"><b class="pixel">Placement test</b>
      <div class="muted">Just answer honestly — this helps choose your starting point. (No rewards here.)</div></section><div id="quiz"></div>`);
    runQuiz(items.map(prepare), { onUpdate: () => {} }, (correct, results) => {
      const byD = { 1: 0, 2: 0, 3: 0 };
      results.forEach((r) => { if (r.ok) byD[r.q.d]++; });
      S().placement = { score: correct, total: results.length, byDifficulty: byD, ts: Date.now() };
      Store.save();
      render(`<section class="panel"><h2 class="pixel">Result: ${correct}/${results.length}</h2>
        <p>Easy ${byD[1]}/5 · Medium ${byD[2]}/5 · Hard ${byD[3]}/5</p>
        <p>${placementAdvice(S().placement)}</p>
        <button class="btn gold" data-go="home">Back to map</button></section>`);
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
      const id = i + 1, d = st.dex[id], owned = st.caught[id] && st.caught[id].n > 0;
      return `<div class="dexcell ${d && d.shiny ? "shiny" : ""}" style="--h:${hue(id)}">${sprite(id, d && d.shiny, d ? "" : "unknown")}
        <div class="muted small">#${pad(id)}</div><div>${d ? name + (d.shiny ? " ✨" : "") : "???"}</div>
        ${owned ? `<button class="btn small" data-go="mon" data-arg="${id}">View</button>` : ""}</div>`;
    }).join("");
    render(`<section class="panel row spread"><h2 class="pixel" style="margin:0">Pokédex ${Object.keys(st.dex).length}/151</h2>
      <button class="btn small" data-go="home">Back</button></section><div class="grid pokedex">${cells}</div>`);
  }

  function settings() {
    const st = S();
    render(`<section class="panel"><h2 class="pixel">Settings</h2>
      <label class="toggle"><input type="checkbox" id="furi" ${st.furigana ? "checked" : ""}> Show furigana (readings above kanji) in grammar and vocabulary questions</label>
      <div class="muted small">The romaji exercise always shows furigana.</div>
      <div class="row" style="margin-top:14px">
        <button class="btn small" id="exp">Export progress</button>
        <button class="btn small" id="imp">Import progress</button>
        <button class="btn small danger" id="rst">Reset everything</button></div>
      <textarea id="io" rows="6" style="width:100%;margin-top:10px;display:none" placeholder="Paste exported progress here, then press Import again"></textarea>
      <div style="margin-top:12px"><button class="btn" data-go="home">Back</button></div></section>`);
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
    screenToken++;
    setKeys(null);
    if (screen === "encounter") encounter(arg || "mixed");
    else ({ home, placement, dex, settings, team, mon: () => mon(arg) }[screen] || home)();
    window.scrollTo(0, 0);
  }

  window.__app = { go };   // handy for debugging in the console
  go("home");
})();
