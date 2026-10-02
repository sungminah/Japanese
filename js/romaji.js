// Kana -> Hepburn romaji, plus forgiving answer checking for the romaji exercise.
window.Romaji = (function () {
  const MONO = {
    あ: "a", い: "i", う: "u", え: "e", お: "o",
    か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko", が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
    さ: "sa", し: "shi", す: "su", せ: "se", そ: "so", ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
    た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to", だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
    な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
    は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho", ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
    ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
    ま: "ma", み: "mi", む: "mu", め: "me", も: "mo", や: "ya", ゆ: "yu", よ: "yo",
    ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro", わ: "wa", を: "o"
  };
  const DI = {};
  const rows = { き: "ky", し: "sh", ち: "ch", に: "ny", ひ: "hy", み: "my", り: "ry", ぎ: "gy", じ: "j", び: "by", ぴ: "py" };
  Object.keys(rows).forEach((k) => {
    const p = rows[k]; // every prefix already ends in y (or is sh/ch/j), so just add the vowel
    DI[k + "ゃ"] = p + "a";
    DI[k + "ゅ"] = p + "u";
    DI[k + "ょ"] = p + "o";
  });

  const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

  // One word of hiragana (ー allowed) -> romaji.
  function kanaWord(word) {
    word = toHira(word);
    let out = "", i = 0, sokuon = false;
    while (i < word.length) {
      const ch = word[i];
      if (ch === "っ") { sokuon = true; i++; continue; }
      if (ch === "ー") { const last = out[out.length - 1]; if (last && "aiueo".includes(last)) out += last; i++; continue; }
      let r, len = 1;
      const two = word.slice(i, i + 2);
      if (DI[two]) { r = DI[two]; len = 2; }
      else if (ch === "ん") { const nx = word[i + 1]; r = nx && "あいうえおやゆよ".includes(nx) ? "n'" : "n"; }
      else r = MONO[ch] !== undefined ? MONO[ch] : ch;
      if (sokuon) { r = (r.startsWith("ch") ? "t" : r[0]) + r; sokuon = false; }
      out += r; i += len;
    }
    return out;
  }

  const PARTICLE = { は: ["wa", "ha"], へ: ["e", "he"], を: ["o", "wo"] };

  // "kana tokens separated by spaces" -> list of acceptable spaced romaji strings (first = preferred).
  function expectedVariants(k) {
    let variants = [[]];
    k.split(" ").forEach((tok) => {
      const opts = PARTICLE[tok] || [kanaWord(tok)];
      const next = [];
      variants.forEach((v) => opts.forEach((o) => next.push(v.concat(o))));
      variants = next;
    });
    return variants.map((v) => v.join(" "));
  }

  // Level 1: spelling variants (si/shi, tu/tsu, ...) and spacing/punctuation.
  function norm1(s) {
    return s.normalize("NFC").toLowerCase()
      .replace(/[\s'’`\-.,!?、。！？・~]/g, "")
      .replace(/sy([auo])/g, "sh$1").replace(/[tc]y([auo])/g, "ch$1").replace(/[zj]y([auo])/g, "j$1")
      .replace(/si/g, "shi").replace(/ti/g, "chi").replace(/tu/g, "tsu").replace(/(?<![sc])hu/g, "fu").replace(/zi/g, "ji")
      .replace(/cch/g, "tch").replace(/m(?=[bpm])/g, "n");
  }
  // Level 2: also ignore long-vowel differences (ō, oo, ou -> o ...).
  function norm2(s) {
    s = s.normalize("NFC").replace(/ā/g, "a").replace(/ī/g, "i").replace(/ū/g, "u").replace(/ē/g, "e").replace(/ō/g, "o");
    return norm1(s).replace(/aa/g, "a").replace(/ii/g, "i").replace(/uu/g, "u").replace(/ee/g, "e").replace(/oo|ou/g, "o");
  }

  function check(k, input) {
    const vars = expectedVariants(k);
    const expected = vars[0];
    if (!norm1(input)) return { ok: false, expected };
    const a = norm1(input);
    if (vars.some((v) => norm1(v) === a)) return { ok: true, exact: true, expected };
    const b = norm2(input);
    if (vars.some((v) => norm2(v) === b)) return { ok: true, exact: false, expected };
    return { ok: false, expected };
  }

  return { kanaWord, expectedVariants, check, toHira };
})();
