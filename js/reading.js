// Reading & Listening: question builders and the text-to-speech helper.
(function () {
  // Reading: every question carries its passage, so a quiz can show the passage above each question.
  window.buildReadingQuestions = function (lv) {
    const out = [];
    ((window.READING && window.READING[lv]) || []).forEach((p) => p.qs.forEach(([q, c], i) => {
      out.push({ id: `d:${lv}:${p.id}:${i}`, t: "d", lv, d: 2, group: `${lv}:${p.id}`, passage: p.text, ptrans: p.en,
        q, c, a: 0, en: `Answer: ${c[0]}`, note: "" });
    }));
    return out;
  };

  // Listening: the dialogue is spoken by the browser; the script stays hidden until you answer.
  window.buildListeningQuestions = function (lv) {
    return ((window.LISTENING && window.LISTENING[lv]) || []).map((x) => ({
      id: `l:${lv}:${x.id}`, t: "l", lv, d: 2, lines: x.lines, q: x.q, c: x.c, a: 0, en: `Answer: ${x.c[0]}`, note: "" }));
  };

  // Text-to-speech through the Web Speech API (free, built into the browser / operating system).
  window.TTS = (function () {
    const ok = () => !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
    let voices = [], token = 0, keep = null;
    const refresh = () => { try { if (ok()) voices = speechSynthesis.getVoices().filter((v) => /^ja/i.test(v.lang)); } catch (e) { voices = []; } };
    if (ok()) { refresh(); try { speechSynthesis.addEventListener("voiceschanged", refresh); } catch (e) { /* ignore */ } }
    const FEMALE = /kyoko|haruka|ayumi|nanami|mizuki|sayaka|o-ren|female|google/i;
    const MALE = /otoya|ichiro|keita|takumi|hattori|male/i;
    function pick(sp) {
      if (!voices.length) return null;
      if (sp === "m") return voices.find((v) => MALE.test(v.name) && !/female/i.test(v.name)) || (voices.length > 1 ? voices[1] : voices[0]);
      return voices.find((v) => FEMALE.test(v.name)) || voices[0];
    }
    function stop() { token++; if (ok()) speechSynthesis.cancel(); }
    // lines: [[speaker, japanese(markup)], ...]; opts: { rate, onend }
    function speak(lines, opts) {
      opts = opts || {};
      stop();
      const my = token;
      let i = 0;
      const next = () => {
        if (my !== token) return;
        if (i >= lines.length) { if (opts.onend) opts.onend(false); return; }
        const line = lines[i++];
        const u = new SpeechSynthesisUtterance(window.Ruby.plain(line[1]));
        u.lang = "ja-JP";
        const v = pick(line[0]);
        if (v) u.voice = v;
        u.rate = opts.rate || 0.9;
        u.pitch = voices.length > 1 ? 1 : line[0] === "m" ? 0.75 : 1.15;
        u.onend = () => setTimeout(next, 350);
        u.onerror = () => { if (my === token && opts.onend) opts.onend(true); };
        keep = u; // keep a reference so the utterance isn't garbage-collected mid-speech
        speechSynthesis.speak(u);
      };
      next();
    }
    return { supported: ok, hasJapanese: () => { refresh(); return voices.length > 0; }, speak, stop };
  })();
})();
