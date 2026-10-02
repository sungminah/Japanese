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
  // Each JLPT level is a region. `levels` = skill levels you must reach (in all four skills) before the Gym Leader exam.
  const REGIONS = [
    { name: "Kanto", lv: "N5", n: 5, cls: "kanto", levels: 5, guardian: 95, range: window.GEN_RANGES[0] },
    { name: "Johto", lv: "N4", n: 4, cls: "johto", levels: 10, guardian: 208, range: window.GEN_RANGES[1] },
    { name: "Hoenn", lv: "N3", n: 3, cls: "hoenn", levels: 15 },
    { name: "Sinnoh", lv: "N2", n: 2, cls: "sinnoh", levels: 20 },
    { name: "Unova", lv: "N1", n: 1, cls: "unova", levels: 25 }
  ];
  const LEVEL_STEP = 25;   // correct answers per skill level
  const PASS_RATE = 0.8;   // Gym Leader exam: 16 of 20 correct
  const EXAM_PER_SKILL = 5;
  const lvNeed = (lv) => (lv - 1) * LEVEL_STEP;      // correct answers needed to reach a skill level
  const regionLevel = (r, t) => Math.min(r.levels, Math.floor(S().prog[r.cls][t] / LEVEL_STEP) + 1);
  const isUnlocked = (r) => !!S().unlocked[r.cls];
  const earlyPass = (r) => r === REGIONS[0] && !!S().placement && S().placement.score >= 13; // strong placement result
  const bossReady = (r) => isUnlocked(r) && (earlyPass(r) || ["g", "v", "k", "r"].every((t) => S().prog[r.cls][t] >= lvNeed(r.levels)));
  const levelOf = (xp) => Math.floor(xp / 100) + 1;
  const hue = (id) => (id * 47) % 360;
  const pad = (id) => String(id).padStart(3, "0");
  const TOTAL = POKEMON.length;
  const regionOf = (id) => REGIONS.find((r) => r.range && id >= r.range[0] && id <= r.range[1]);
  const isLegend = (id) => LEGENDARY.includes(id);

  // Weighted wild spawn: basic forms are common, evolved/non-evolving forms are rare, legends never appear.
  function pickWild(region) {
    const pool = [];
    let total = 0;
    for (let id = region.range[0]; id <= region.range[1]; id++) { const w = Evo.weight(id); if (w) { pool.push([id, w]); total += w; } }
    let r = Math.random() * total;
    for (const [id, w] of pool) { r -= w; if (r <= 0) return id; }
    return pool[0][0];
  }

  let screenToken = 0, keyHandler = null, lastRoute = "mixed";
  const setKeys = (fn) => { if (keyHandler) document.removeEventListener("keydown", keyHandler); keyHandler = fn; if (fn) document.addEventListener("keydown", fn); };

  // ---------- question pools ----------
  function poolOf(t, region) {
    const lv = region.n;
    if (t === "k") return window.buildKanjiQuestions().filter((q) => q.lv === lv).concat(window.buildVocabQuestions(lv, "k"));
    if (t === "r") return window.ROMAJI_SENTENCES.filter((s) => (s.lv || 5) === lv).map((s) => ({ id: s.id, t: "r", lv, d: s.d, s: s.s, k: s.k, en: s.en }));
    const written = window.QUESTIONS.filter((q) => q.t === t && q.lv === lv);
    return t === "v" ? written.concat(window.buildVocabQuestions(lv, "v")) : written;
  }
  const contentCount = (region) => ["g", "v", "k", "r"].reduce((n, t) => n + poolOf(t, region).length, 0);
  // Questions answered wrong before are weighted heavier so they come back for review.
  function pickQuestions(pool, n) {
    const st = S();
    pool = pool.filter((q) => !st.reports[q.id]);
    return pool.map((q) => ({ q, k: Math.random() * Math.max(0.2, 1 + (st.wrong[q.id] || 0) * 3 - Math.min(st.right[q.id] || 0, 3) * 0.2) }))
      .sort((x, y) => y.k - x.k).slice(0, n).map((x) => x.q);
  }
  function pickForRoute(route, n, region) {
    if (route !== "mixed") return pickQuestions(poolOf(route, region), n);
    const order = shuffle(["g", "v", "k", "r"].filter((t) => poolOf(t, region).length)), counts = {};
    if (!order.length) return [];
    for (let i = 0; i < n; i++) counts[order[i % order.length]] = (counts[order[i % order.length]] || 0) + 1;
    let out = [];
    Object.keys(counts).forEach((t) => { out = out.concat(pickQuestions(poolOf(t, region), counts[t])); });
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
    let lvUp = "";
    if (ctx.region) {
      const reg = REGIONS.find((x) => x.cls === ctx.region), before = regionLevel(reg, t);
      st.prog[ctx.region][t]++;
      const after = regionLevel(reg, t);
      if (after > before) { ctx.lvUps = ctx.lvUps || []; ctx.lvUps.push(`📈 ${SKILLS[t].name} reached Lv ${after}/${reg.levels} in ${reg.name}`); }
    }
    const candy = 1 + (combo >= 3 ? 1 : 0);
    st.candy[t] += candy;
    ctx.candy[t] = (ctx.candy[t] || 0) + candy;
    addXp(10, ctx);
    return chip(t, `+${candy} ${SKILLS[t].candy}`) + chip("xp", "+10 XP") + lvUp + (combo >= 3 ? chip("combo", `🔥 combo ×${combo}`) : "");
  }

  // ---------- reporting questions ----------
  const questionText = (q) => (q.t === "r" ? Ruby.plain(q.s) : (q.p ? q.p + " " : "") + Ruby.plain(q.q));
  const answerText = (q) => (q.t === "r" ? Romaji.expectedVariants(q.k)[0] : Ruby.plain(q.c[q.a]));
  function reportButton(q) {
    const done = !!S().reports[q.id];
    return `<div style="margin-top:8px"><button class="linkbtn" id="report" ${done ? "disabled" : ""}>${done ? "🚩 Reported — hidden from future quizzes" : "🚩 Report a problem with this question"}</button></div>`;
  }
  function bindReport(q) {
    const b = document.getElementById("report");
    if (!b || b.disabled) return;
    b.addEventListener("click", () => {
      const note = window.prompt("What looks wrong with this question? (optional)\nIt will be hidden from your future quizzes, and you can send the list to be fixed.", "");
      if (note === null) return;
      S().reports[q.id] = { note: note.trim(), text: questionText(q), answer: answerText(q), en: q.en || "", ts: Date.now() };
      Store.save();
      b.textContent = "🚩 Reported — hidden from future quizzes";
      b.disabled = true;
    });
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
        <div style="margin-top:12px"><button class="btn gold" id="next">${i + 1 < items.length ? "Next ▶" : "Finish ▶"}</button></div>
        ${reportButton(it.q)}`;
      bindReport(it.q);
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

  function regionCard(r) {
    const st = S(), prev = REGIONS[REGIONS.indexOf(r) - 1];
    if (!isUnlocked(r)) {
      return `<div class="panel region ${r.cls} locked">
        <h3><span>🔒 ${r.name}</span> <span class="tag">${r.lv}</span></h3>
        <div class="muted">Beat the ${prev.name} Gym Leader to travel here.</div>
        <div class="muted small">${r.lv} needs Lv ${r.levels} in all four skills before its Gym Leader.${r.range ? ` Pokémon here: #${r.range[0]}–#${r.range[1]}.` : ""}</div>
      </div>`;
    }
    const noContent = contentCount(r) === 0;
    const routes = ROUTES.map((x) => {
      const empty = x.id === "mixed" ? noContent : poolOf(x.id, r).length === 0;
      return `<button class="btn ${x.cls}" data-go="encounter" data-arg="${x.id}@${r.cls}" ${empty ? "disabled" : ""}>${x.label}</button>`;
    }).join("");
    const cap = lvNeed(r.levels);
    const progress = ["g", "v", "k", "r"].map((t) => {
      const c = st.prog[r.cls][t], lvl = regionLevel(r, t), max = c >= cap, into = c % LEVEL_STEP;
      return `<div class="skill"><div class="skillname"><b class="c-${t}">${SKILLS[t].name}</b> <span>${max ? "MAX " : ""}Lv ${lvl}/${r.levels}</span></div>
        <div class="bar ${t}"><i style="width:${max ? 100 : (into / LEVEL_STEP) * 100}%"></i></div></div>`;
    }).join("");
    const total = ["g", "v", "k", "r"].reduce((n, t) => n + poolOf(t, r).length, 0);
    const ready = bossReady(r), badge = st.badges[r.cls];
    return `<div class="panel region ${r.cls}">
      <h3><span>${r.name}</span> <span class="tag">${r.lv}</span>${badge ? ' <span class="tag gold">🏅 Badge</span>' : ""}</h3>
      ${noContent ? `<div class="muted">The ${r.lv} study content is still being written — check back after the next update.</div>`
        : `<div class="muted">Pick a route. Every correct answer weakens the wild Pokémon, earns candy and raises your ${r.lv} skill levels. <span class="small">(${total} questions in this region)</span></div>`}
      <div class="row routes">${routes}</div>
      ${noContent ? "" : `<div class="progress">${progress}</div>
      <div class="row" style="margin-top:8px">
        <button class="btn gold" data-go="boss" data-arg="${r.cls}" ${ready ? "" : "disabled"}>🏆 ${badge ? "Rematch" : "Gym Leader exam"}</button>
        <span class="muted small">${ready ? (earlyPass(r) && !["g", "v", "k", "r"].every((t) => st.prog[r.cls][t] >= cap) ? "Your placement score lets you challenge early! " : "") + `${EXAM_PER_SKILL * 4} questions, pass with ${Math.ceil(EXAM_PER_SKILL * 4 * PASS_RATE)}.` : `Reach Lv ${r.levels} in all four skills to unlock the exam.`}</span>
      </div>`}
    </div>`;
  }

  // Gym Leader exam: 5 questions per skill, pass with 80%. Passing earns a badge and opens the next region.
  function boss(regionCls) {
    const r = REGIONS.find((x) => x.cls === regionCls);
    if (!r || !bossReady(r)) return home();
    let items = [];
    ["g", "v", "k", "r"].forEach((t) => { items = items.concat(pickQuestions(poolOf(t, r), EXAM_PER_SKILL)); });
    items = shuffle(items).map(prepare);
    if (!items.length) return home();
    const needed = Math.ceil(items.length * PASS_RATE), ctx = { xp: 0, candy: {}, levelUps: 0, region: r.cls };
    render(`<section class="panel arena boss" style="--h:${hue(r.guardian)}">
        <div class="pixel">🏆 ${r.name} Gym Leader exam — ${r.guardian ? `<b>${POKEMON[r.guardian - 1]}</b> guards the gym!` : ""}</div>
        ${sprite(r.guardian, false, "big float")}
        <div class="hpbar"><div id="hp" style="width:100%"></div></div>
        <div class="muted small">Answer ${needed} of ${items.length} correctly to win. No Poké Balls needed.</div>
      </section><div id="quiz"></div>`);
    runQuiz(items, {
      reward: (q, ok, combo) => applyReward(q, ok, combo, ctx),
      onUpdate: (correct, total, ok) => {
        const hp = document.getElementById("hp"), pct = 100 - (correct / needed) * 100;
        hp.style.width = Math.max(0, pct) + "%";
        hp.style.background = pct > 50 ? "#34d399" : pct > 25 ? "#fbbf24" : "#ef4444";
        const sp = document.querySelector(".arena .sprite");
        sp.classList.remove("hit", "taunt"); void sp.offsetWidth; sp.classList.add(ok ? "hit" : "taunt");
      }
    }, (correct) => finishBoss(r, correct, items.length, needed, ctx));
  }

  function finishBoss(r, correct, total, needed, ctx) {
    const st = S(), pass = correct >= needed, first = pass && !st.badges[r.cls], extras = [];
    if (pass) {
      if (first) {
        st.badges[r.cls] = true;
        st.balls += 10; addXp(100, ctx);
        extras.push(`🏅 ${r.name} badge earned! +10 Poké Balls, +100 XP`);
        const g = st.caught[r.guardian] || { n: 0, shiny: false, at: 0 };
        g.n++; g.at = Date.now(); st.caught[r.guardian] = g;
        st.dex[r.guardian] = { shiny: !!(st.dex[r.guardian] && st.dex[r.guardian].shiny) };
        extras.push(`${POKEMON[r.guardian - 1]} joined your team!`);
        const next = REGIONS[REGIONS.indexOf(r) + 1];
        if (next) { st.unlocked[next.cls] = true; extras.push(`🗺️ ${next.name} (${next.lv}) is now open!`); }
      } else { addXp(30, ctx); extras.push("+30 XP for the rematch"); }
    }
    (ctx.lvUps || []).forEach((m) => extras.push(m));
    Store.save();
    render(`<section class="panel arena result ${pass ? "win" : ""}" style="--h:${hue(r.guardian)}">
      <h2 class="pixel">${pass ? `You beat the ${r.name} Gym Leader!` : "Not this time…"}</h2>
      ${sprite(r.guardian, false, "big" + (pass ? " float" : " dim"))}
      <p>Score <b>${correct}/${total}</b> (need ${needed}) · <b>+${ctx.xp} XP</b></p>
      ${extras.length ? `<ul class="extras">${extras.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
      ${pass ? "" : '<p class="muted">Wrong answers will come back more often in your next encounters. You can retry right away.</p>'}
      <div class="row center" style="margin-top:12px">
        ${pass ? "" : `<button class="btn gold" data-go="boss" data-arg="${r.cls}">Retry exam</button>`}
        <button class="btn" data-go="home">Home</button></div></section>`);
    if (pass) confetti();
  }

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
    const regions = REGIONS.map(regionCard).join("");

    render(`
      <section class="panel hero">
        <div>
          <h2>Welcome back, Trainer!</h2>
          <div class="muted">Answer questions, catch Pokémon, and use candy to evolve them.
          ${wrongN ? `<br>Questions to review: <b>${wrongN}</b> (they come back more often).` : ""}</div>
        </div>
        <div class="row">
          <button class="btn small" data-go="placement">${st.placement ? "Retake placement test" : "Placement test"}</button>
          <button class="btn small" data-go="dex">Pokédex ${Object.keys(st.dex).length}/${TOTAL}</button>
          <button class="btn small" data-go="legends">⭐ Legend quests</button>
          <button class="btn small" data-go="settings">Settings</button>
        </div>
        ${st.placement ? `<div class="muted small">Last placement: ${st.placement.score}/${st.placement.total}. ${placementAdvice(st.placement)}</div>` : ""}
      </section>
      <section class="panel"><h2>Your Pokémon</h2>${collection}</section>
      <section class="panel"><h2>Candy bag</h2><div class="muted small">Earn candy by answering correctly. Spend it to evolve Pokémon.</div>
        <div class="row candy-row">${candyBag}</div></section>
      <div class="grid regions">${regions}</div>`);
  }

  function encounter(arg) {
    lastRoute = arg;
    const [route, regionId] = arg.split("@");
    const region = REGIONS.find((r) => r.cls === regionId) || REGIONS[0];
    const st = S();
    if (!isUnlocked(region)) return home();
    let note = "";
    if (st.balls < 1) { st.balls = 1; Store.save(); note = "The Professor handed you a spare Poké Ball."; }
    const items = pickForRoute(route, 5, region).map(prepare);
    if (!items.length) return home();
    const id = pickWild(region), shiny = Math.random() < 1 / 50, name = POKEMON[id - 1];
    const ctx = { xp: 0, candy: {}, levelUps: 0, region: region.cls, wasReady: bossReady(region) };
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
    (ctx.lvUps || []).forEach((m) => extras.push(m));
    const reg = REGIONS.find((x) => x.cls === ctx.region);
    if (reg && bossReady(reg) && !st.badges[reg.cls] && !ctx.wasReady) extras.push(`🏆 The ${reg.name} Gym Leader exam is ready!`);
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

  // ---------- filterable Pokémon lists (Pokédex and My Pokémon) ----------
  const F = {
    dex: { place: "all", status: "all", q: "", sort: "num" },
    team: { place: "all", status: "all", q: "", sort: "num" }
  };
  const STATUS = {
    dex: [
      ["all", "All", () => true],
      ["caught", "Caught", (id) => !!S().dex[id]],
      ["missing", "Not caught yet", (id) => !S().dex[id]],
      ["shiny", "✨ Shiny", (id) => !!(S().dex[id] && S().dex[id].shiny)],
      ["legend", "⭐ Legendary", isLegend]
    ],
    team: [
      ["all", "All", () => true],
      ["ready", "⬆ Ready to evolve", canEvolve],
      ["evolves", "Can evolve", (id) => Evo.options(id).length > 0],
      ["final", "Final form", (id) => Evo.options(id).length === 0],
      ["shiny", "✨ Shiny", (id) => S().caught[id].shiny],
      ["dupes", "Duplicates", (id) => S().caught[id].n > 1],
      ["legend", "⭐ Legendary", isLegend]
    ]
  };

  function listScreen(kind) {
    const isDex = kind === "dex", f = F[kind];
    const base = () => (isDex ? POKEMON.map((_, i) => i + 1) : ownedIds());
    const places = [["all", "All places"]].concat(REGIONS.filter((r) => r.range).map((r) => [r.cls, r.name]));
    render(`<section class="panel row spread"><h2 class="pixel" style="margin:0" id="ftitle"></h2>
        <button class="btn small" data-go="home">Back</button></section>
      <section class="panel filters"><div id="fchips"></div>
        <div class="row" style="margin-top:8px"><input id="fq" type="search" placeholder="Search name or number…" value="${esc(f.q)}" autocomplete="off">
        <label class="muted small">Sort
          <select id="fsort"><option value="num">Dex number</option>${isDex ? "" : '<option value="new">Newest first</option><option value="name">Name</option>'}</select></label></div>
        <div class="muted small" id="fcount" style="margin-top:6px"></div></section>
      <div id="fgrid"></div>`);
    document.getElementById("fsort").value = f.sort;

    const chips = (key, list) => `<div class="chips">${list.map(([v, label, cnt]) =>
      `<button class="fchip ${f[key] === v ? "on" : ""}" data-k="${key}" data-v="${v}">${label}${cnt != null ? ` <span>${cnt}</span>` : ""}</button>`).join("")}</div>`;

    const cell = (id) => {
      const st = S(), d = st.dex[id], owned = st.caught[id] && st.caught[id].n > 0, rg = regionOf(id);
      return `<div class="dexcell ${d && d.shiny ? "shiny" : ""} ${isLegend(id) ? "legend" : ""}" style="--h:${hue(id)}">
        ${sprite(id, d && d.shiny, d ? "" : "unknown")}
        <div class="muted small">#${pad(id)} · ${rg ? rg.name : ""}</div>
        <div>${d ? POKEMON[id - 1] + (d.shiny ? " ✨" : "") + (isLegend(id) ? " ⭐" : "") : "???"}</div>
        ${owned ? `<button class="btn small" data-go="mon" data-arg="${id}">View</button>` : ""}</div>`;
    };

    function draw() {
      const st = S(), all = base();
      document.getElementById("ftitle").textContent = isDex ? `Pokédex ${Object.keys(st.dex).length}/${TOTAL}` : `My Pokémon (${ownedIds().length})`;
      const registered = Object.keys(st.dex).map(Number);
      const placeList = places.map(([v, label]) => {
        if (v === "all") return [v, label, isDex ? `${registered.length}/${TOTAL}` : ownedIds().length];
        const r = REGIONS.find((x) => x.cls === v), size = r.range[1] - r.range[0] + 1;
        const have = (isDex ? registered : ownedIds()).filter((id) => id >= r.range[0] && id <= r.range[1]).length;
        return [v, label, isDex ? `${have}/${size}` : have];
      });
      document.getElementById("fchips").innerHTML =
        `<div class="muted small">Place</div>${chips("place", placeList)}<div class="muted small" style="margin-top:6px">Show</div>${chips("status", STATUS[kind].map(([v, l]) => [v, l]))}`;

      const pred = STATUS[kind].find((x) => x[0] === f.status)[2], q = f.q.trim().toLowerCase().replace(/^#/, "");
      let ids = all
        .filter((id) => f.place === "all" || (regionOf(id) && regionOf(id).cls === f.place))
        .filter(pred)
        .filter((id) => !q || String(id) === q || pad(id) === q || ((!isDex || st.dex[id]) && POKEMON[id - 1].toLowerCase().includes(q)));
      if (f.sort === "new") ids.sort((a, b) => (st.caught[b].at || 0) - (st.caught[a].at || 0));
      else if (f.sort === "name") ids.sort((a, b) => POKEMON[a - 1].localeCompare(POKEMON[b - 1]));
      else ids.sort((a, b) => a - b);

      document.getElementById("fcount").textContent = `Showing ${ids.length} of ${all.length}`;
      document.getElementById("fgrid").innerHTML = !ids.length
        ? `<div class="panel empty">${!isDex && !ownedIds().length ? "Nothing here yet — go catch something!" : "No Pokémon match these filters."}</div>`
        : isDex ? `<div class="grid pokedex">${ids.map(cell).join("")}</div>`
        : `<section class="panel"><div class="monstrip big">${ids.map(monCell).join("")}</div>
           <div class="muted small" style="margin-top:8px">⬆ = enough candy to evolve. Tap a Pokémon to see details.</div></section>`;
    }
    document.getElementById("fchips").addEventListener("click", (e) => {
      const b = e.target.closest(".fchip");
      if (b) { f[b.dataset.k] = b.dataset.v; draw(); }
    });
    document.getElementById("fq").addEventListener("input", (e) => { f.q = e.target.value; draw(); });
    document.getElementById("fsort").addEventListener("change", (e) => { f.sort = e.target.value; draw(); });
    draw();
  }
  const team = () => listScreen("team");
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

  const dex = () => listScreen("dex");

  // ---------- Legend quests: legendaries are earned, they never appear in the wild ----------
  const kp = (st, t) => st.prog.kanto[t];
  const LEGEND_QUESTS = [
    { id: 144, text: "Reach Grammar Lv 3 in Kanto (N5)", prog: (st) => [kp(st, "g"), lvNeed(3)] },
    { id: 145, text: "Reach Vocabulary Lv 3 in Kanto (N5)", prog: (st) => [kp(st, "v"), lvNeed(3)] },
    { id: 146, text: "Reach Kanji Lv 3 in Kanto (N5)", prog: (st) => [kp(st, "k"), lvNeed(3)] },
    { id: 150, text: "Claim Articuno, Zapdos and Moltres, and reach Romaji Lv 3 in Kanto",
      prog: (st) => [[144, 145, 146].filter((i) => st.legends[i]).length + (kp(st, "r") >= lvNeed(3) ? 1 : 0), 4], plain: true },
    { id: 151, text: "Reach a 7-day streak", prog: (st) => [Math.max(st.bestStreak || 0, st.streak), 7], plain: true }
  ];
  const JOHTO_LEGENDS = [243, 244, 245, 249, 250, 251];

  function claimLegend(id) {
    const st = S(), q = LEGEND_QUESTS.find((x) => x.id === id);
    if (!q || st.legends[id]) return;
    const [a, b] = q.prog(st);
    if (a < b) return;
    st.legends[id] = true;
    const c = st.caught[id] || { n: 0, shiny: false, at: 0 };
    c.n++; c.at = Date.now(); st.caught[id] = c;
    st.dex[id] = { shiny: !!(st.dex[id] && st.dex[id].shiny) };
    Store.save();
    confetti();
    legends();
  }

  function legends() {
    const st = S();
    const cards = LEGEND_QUESTS.map((q) => {
      const [a, b] = q.prog(st), got = !!st.legends[q.id], done = a >= b;
      return `<div class="legendcard ${got ? "got" : done ? "ready" : ""}" style="--h:${hue(q.id)}">
        ${sprite(q.id, false, got ? "float" : "unknown")}
        <h3>${POKEMON[q.id - 1]} ${got ? "✅" : ""}</h3>
        <div class="muted small">${q.text}</div>
        ${got ? `<button class="btn small" data-go="mon" data-arg="${q.id}">View</button>`
          : `<div class="bar"><i style="width:${Math.min(100, (a / b) * 100)}%;background:var(--gold)"></i></div>
             <div class="muted small">${Math.min(a, b)} / ${b}</div>
             <button class="btn gold small" data-claim="${q.id}" ${done ? "" : "disabled"}>${done ? "Claim!" : "Keep going"}</button>`}
      </div>`;
    }).join("");
    const locked = JOHTO_LEGENDS.map((id) => `<div class="legendcard locked">${sprite(id, false, "unknown")}
        <h3>???</h3><div class="muted small">🔒 Opens with Johto (N4)</div></div>`).join("");
    render(`<section class="panel row spread"><div><h2 class="pixel" style="margin:0">⭐ Legend quests</h2>
        <div class="muted small">Legendary Pokémon never appear in the wild. Earn them by studying.</div></div>
        <button class="btn small" data-go="home">Back</button></section>
      <div class="legends">${cards}${locked}</div>`);
    $app.querySelectorAll("[data-claim]").forEach((b) => b.addEventListener("click", () => claimLegend(+b.dataset.claim)));
  }
  function settings() {
    const st = S(), reps = Object.entries(st.reports);
    render(`<section class="panel"><h2 class="pixel">Settings</h2>
      <label class="toggle"><input type="checkbox" id="furi" ${st.furigana ? "checked" : ""}> Show furigana (readings above kanji) in grammar and vocabulary questions</label>
      <div class="muted small">The romaji exercise always shows furigana.</div>
      <div class="row" style="margin-top:14px">
        <button class="btn small" id="exp">Export progress</button>
        <button class="btn small" id="imp">Import progress</button>
        <button class="btn small danger" id="rst">Reset everything</button></div>
      <textarea id="io" rows="6" style="width:100%;margin-top:10px;display:none" placeholder="Paste exported progress here, then press Import again"></textarea>
      <div style="margin-top:12px"><button class="btn" data-go="home">Back</button></div></section>
      <section class="panel"><h2 class="pixel">🚩 Reported questions (${reps.length})</h2>
        ${reps.length ? `<div class="muted small">These are hidden from your quizzes. Copy the list and send it so they can be fixed.</div>
          <div class="reportlist">${reps.map(([id, r]) => `<div class="reportitem"><b>${esc(id)}</b> ${esc(r.text)}<br>
            <span class="muted small">Answer shown: ${esc(r.answer)}${r.note ? ` · Your note: ${esc(r.note)}` : ""}</span>
            <button class="linkbtn" data-unreport="${esc(id)}">Restore</button></div>`).join("")}</div>
          <div class="row" style="margin-top:8px"><button class="btn small" id="copyrep">Copy list to send</button>
            <button class="btn small" id="clearrep">Restore all</button></div>
          <textarea id="repbox" rows="6" style="width:100%;margin-top:8px;display:none"></textarea>`
        : '<div class="muted small">Nothing reported. Use the 🚩 link under a question if something looks wrong.</div>'}
      </section>`);
    $app.querySelectorAll("[data-unreport]").forEach((b) => b.addEventListener("click", () => { delete st.reports[b.dataset.unreport]; Store.save(); settings(); }));
    if (reps.length) {
      document.getElementById("clearrep").addEventListener("click", () => { st.reports = {}; Store.save(); settings(); });
      document.getElementById("copyrep").addEventListener("click", () => {
        const text = reps.map(([id, r]) => `[${id}] ${r.text} -> ${r.answer}${r.en ? ` (${r.en})` : ""}${r.note ? ` | note: ${r.note}` : ""}`).join("\n");
        const box = document.getElementById("repbox");
        const show = () => { box.style.display = "block"; box.value = text; box.select(); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => { alert("Copied!"); }, show);
        else show();
      });
    }
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
    else ({ home, placement, dex, settings, team, legends, mon: () => mon(arg), boss: () => boss(arg) }[screen] || home)();
    window.scrollTo(0, 0);
  }

  window.__app = { go, poolOf, REGIONS };   // handy for debugging in the console
  go("home");
})();
