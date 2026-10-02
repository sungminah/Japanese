// N5-level kanji: [kanji, meaning, on-yomi, kun-yomi, [[word, reading, meaning], ...]]
window.KANJI = [
  ["一", "one", "いち", "ひと(つ)", [["一人", "ひとり", "one person"], ["一月", "いちがつ", "January"]]],
  ["二", "two", "に", "ふた(つ)", [["二人", "ふたり", "two people"], ["二月", "にがつ", "February"]]],
  ["三", "three", "さん", "みっ(つ)", [["三月", "さんがつ", "March"], ["三時", "さんじ", "three o'clock"]]],
  ["十", "ten", "じゅう", "とお", [["十月", "じゅうがつ", "October"], ["十円", "じゅうえん", "ten yen"]]],
  ["百", "hundred", "ひゃく", "—", [["百円", "ひゃくえん", "100 yen"]]],
  ["千", "thousand", "せん", "—", [["千円", "せんえん", "1,000 yen"]]],
  ["万", "ten thousand", "まん", "—", [["一万円", "いちまんえん", "10,000 yen"]]],
  ["円", "yen, circle", "えん", "まる(い)", [["円", "えん", "yen"], ["五百円", "ごひゃくえん", "500 yen"]]],
  ["日", "sun, day", "にち・じつ", "ひ・か", [["日本", "にほん", "Japan"], ["毎日", "まいにち", "every day"]]],
  ["月", "moon, month", "げつ・がつ", "つき", [["月曜日", "げつようび", "Monday"], ["今月", "こんげつ", "this month"]]],
  ["火", "fire", "か", "ひ", [["火曜日", "かようび", "Tuesday"], ["火事", "かじ", "fire (blaze)"]]],
  ["水", "water", "すい", "みず", [["水曜日", "すいようび", "Wednesday"], ["水", "みず", "water"]]],
  ["木", "tree, wood", "もく", "き", [["木曜日", "もくようび", "Thursday"], ["木", "き", "tree"]]],
  ["金", "gold, money", "きん", "かね", [["金曜日", "きんようび", "Friday"], ["お金", "おかね", "money"]]],
  ["土", "earth, soil", "ど", "つち", [["土曜日", "どようび", "Saturday"], ["土", "つち", "soil"]]],
  ["山", "mountain", "さん", "やま", [["山", "やま", "mountain"], ["富士山", "ふじさん", "Mt. Fuji"]]],
  ["川", "river", "せん", "かわ", [["川", "かわ", "river"], ["小川", "おがわ", "brook"]]],
  ["田", "rice field", "でん", "た", [["田んぼ", "たんぼ", "rice paddy"], ["田中", "たなか", "Tanaka (surname)"]]],
  ["人", "person", "じん・にん", "ひと", [["人", "ひと", "person"], ["日本人", "にほんじん", "Japanese person"]]],
  ["口", "mouth", "こう", "くち", [["口", "くち", "mouth"], ["入口", "いりぐち", "entrance"]]],
  ["目", "eye", "もく", "め", [["目", "め", "eye"]]],
  ["手", "hand", "しゅ", "て", [["手", "て", "hand"], ["手紙", "てがみ", "letter"]]],
  ["足", "foot, leg", "そく", "あし", [["足", "あし", "foot"]]],
  ["耳", "ear", "じ", "みみ", [["耳", "みみ", "ear"]]],
  ["大", "big", "だい・たい", "おお(きい)", [["大きい", "おおきい", "big"], ["大学", "だいがく", "university"]]],
  ["小", "small", "しょう", "ちい(さい)", [["小さい", "ちいさい", "small"], ["小学校", "しょうがっこう", "elementary school"]]],
  ["中", "middle, inside", "ちゅう", "なか", [["中", "なか", "inside"], ["中国", "ちゅうごく", "China"]]],
  ["上", "up, above", "じょう", "うえ", [["上", "うえ", "above"], ["上手", "じょうず", "skillful"]]],
  ["下", "down, below", "か・げ", "した", [["下", "した", "below"], ["下手", "へた", "unskillful"]]],
  ["左", "left", "さ", "ひだり", [["左", "ひだり", "left"]]],
  ["右", "right", "ゆう・う", "みぎ", [["右", "みぎ", "right"]]],
  ["学", "study", "がく", "まな(ぶ)", [["学生", "がくせい", "student"], ["大学", "だいがく", "university"]]],
  ["校", "school", "こう", "—", [["学校", "がっこう", "school"], ["高校", "こうこう", "high school"]]],
  ["先", "previous, ahead", "せん", "さき", [["先生", "せんせい", "teacher"], ["先月", "せんげつ", "last month"]]],
  ["生", "life, birth", "せい・しょう", "い(きる)・う(まれる)", [["生まれる", "うまれる", "to be born"], ["先生", "せんせい", "teacher"]]],
  ["本", "book, origin", "ほん", "もと", [["本", "ほん", "book"], ["日本", "にほん", "Japan"]]],
  ["語", "language, word", "ご", "かた(る)", [["日本語", "にほんご", "Japanese language"], ["英語", "えいご", "English language"]]],
  ["白", "white", "はく・びゃく", "しろ(い)", [["白い", "しろい", "white"]]],
  ["名", "name", "めい・みょう", "な", [["名前", "なまえ", "name"]]],
  ["友", "friend", "ゆう", "とも", [["友達", "ともだち", "friend"]]],
  ["父", "father", "ふ", "ちち", [["父", "ちち", "my father"], ["お父さん", "おとうさん", "father (honorific)"]]],
  ["母", "mother", "ぼ", "はは", [["母", "はは", "my mother"], ["お母さん", "おかあさん", "mother (honorific)"]]],
  ["子", "child", "し・す", "こ", [["子ども", "こども", "child"]]],
  ["男", "man, male", "だん・なん", "おとこ", [["男", "おとこ", "man"], ["男の人", "おとこのひと", "man (male person)"]]],
  ["女", "woman, female", "じょ", "おんな", [["女", "おんな", "woman"], ["女の人", "おんなのひと", "woman (female person)"]]],
  ["車", "car, vehicle", "しゃ", "くるま", [["車", "くるま", "car"], ["電車", "でんしゃ", "train"]]],
  ["電", "electricity", "でん", "—", [["電車", "でんしゃ", "train"], ["電話", "でんわ", "telephone"]]],
  ["駅", "station", "えき", "—", [["駅", "えき", "station"]]],
  ["店", "shop", "てん", "みせ", [["店", "みせ", "shop"], ["店員", "てんいん", "shop clerk"]]],
  ["国", "country", "こく", "くに", [["国", "くに", "country"], ["外国", "がいこく", "foreign country"]]],
  ["会", "meet, association", "かい", "あ(う)", [["会う", "あう", "to meet"], ["会社", "かいしゃ", "company"]]],
  ["社", "company, shrine", "しゃ", "やしろ", [["会社", "かいしゃ", "company"], ["神社", "じんじゃ", "shrine"]]],
  ["雨", "rain", "う", "あめ", [["雨", "あめ", "rain"]]],
  ["天", "heaven, sky", "てん", "あめ・あま", [["天気", "てんき", "weather"]]],
  ["気", "spirit, air", "き・け", "—", [["天気", "てんき", "weather"], ["元気", "げんき", "healthy, energetic"]]],
  ["食", "eat, food", "しょく", "た(べる)", [["食べる", "たべる", "to eat"], ["食事", "しょくじ", "meal"]]],
  ["飲", "drink", "いん", "の(む)", [["飲む", "のむ", "to drink"], ["飲み物", "のみもの", "drink"]]],
  ["見", "see, look", "けん", "み(る)", [["見る", "みる", "to see"]]],
  ["行", "go", "こう・ぎょう", "い(く)", [["行く", "いく", "to go"]]],
  ["来", "come", "らい", "く(る)", [["来る", "くる", "to come"], ["来年", "らいねん", "next year"]]],
  ["出", "go out, leave", "しゅつ", "で(る)", [["出る", "でる", "to go out"], ["出口", "でぐち", "exit"]]],
  ["入", "enter", "にゅう", "はい(る)・い(れる)", [["入る", "はいる", "to enter"], ["入口", "いりぐち", "entrance"]]],
  ["休", "rest", "きゅう", "やす(む)", [["休む", "やすむ", "to rest"], ["休み", "やすみ", "holiday"]]],
  ["年", "year", "ねん", "とし", [["今年", "ことし", "this year"], ["来年", "らいねん", "next year"]]],
  ["時", "time, hour", "じ", "とき", [["三時", "さんじ", "three o'clock"], ["時間", "じかん", "time"]]],
  ["分", "minute, understand", "ふん・ぷん・ぶん", "わ(かる)", [["五分", "ごふん", "five minutes"], ["分かる", "わかる", "to understand"]]],
  ["半", "half", "はん", "—", [["半分", "はんぶん", "half"], ["二時半", "にじはん", "half past two"]]],
  ["今", "now", "こん", "いま", [["今", "いま", "now"], ["今日", "きょう", "today"]]],
  ["前", "before, front", "ぜん", "まえ", [["名前", "なまえ", "name"], ["午前", "ごぜん", "morning, a.m."]]],
  ["後", "after, behind", "ご", "あと・うし(ろ)", [["午後", "ごご", "afternoon, p.m."], ["後ろ", "うしろ", "behind"]]],
  ["毎", "every", "まい", "—", [["毎日", "まいにち", "every day"], ["毎朝", "まいあさ", "every morning"]]],
  ["週", "week", "しゅう", "—", [["今週", "こんしゅう", "this week"], ["来週", "らいしゅう", "next week"]]],
  ["東", "east", "とう", "ひがし", [["東京", "とうきょう", "Tokyo"], ["東", "ひがし", "east"]]],
  ["西", "west", "せい・さい", "にし", [["西", "にし", "west"], ["西口", "にしぐち", "west exit"]]],
  ["南", "south", "なん", "みなみ", [["南", "みなみ", "south"], ["南口", "みなみぐち", "south exit"]]],
  ["北", "north", "ほく", "きた", [["北", "きた", "north"], ["北口", "きたぐち", "north exit"]]],
  ["外", "outside", "がい", "そと", [["外", "そと", "outside"], ["外国", "がいこく", "foreign country"]]],
  ["高", "tall, expensive", "こう", "たか(い)", [["高い", "たかい", "tall; expensive"], ["高校", "こうこう", "high school"]]],
  ["安", "cheap, safe", "あん", "やす(い)", [["安い", "やすい", "cheap"]]],
  ["新", "new", "しん", "あたら(しい)", [["新しい", "あたらしい", "new"]]],
  ["古", "old (things)", "こ", "ふる(い)", [["古い", "ふるい", "old"]]],
  ["長", "long", "ちょう", "なが(い)", [["長い", "ながい", "long"]]],
  ["聞", "hear, ask", "ぶん・もん", "き(く)", [["聞く", "きく", "to listen"], ["新聞", "しんぶん", "newspaper"]]],
  ["読", "read", "どく", "よ(む)", [["読む", "よむ", "to read"]]],
  ["書", "write", "しょ", "か(く)", [["書く", "かく", "to write"]]],
  ["話", "speak, story", "わ", "はな(す)", [["話す", "はなす", "to speak"], ["電話", "でんわ", "telephone"]]],
  ["買", "buy", "ばい", "か(う)", [["買う", "かう", "to buy"], ["買い物", "かいもの", "shopping"]]],
  ["私", "I, private", "し", "わたし", [["私", "わたし", "I"]]],
  ["森", "forest", "しん", "もり", [["森", "もり", "forest"]]]
];

// Builds a fresh pool of kanji-only questions with random distractors.
// Kinds: meaning (kanji -> English), reading (word -> hiragana),
//        recognize (English + reading -> kanji word), pick (English -> kanji).
window.buildKanjiQuestions = function () {
  const K = window.KANJI.map(([c, m, on, kun, w]) => ({ c, m, on, kun, w: w.map(([k, r, e]) => ({ k, r, e })) }));
  const words = [], seen = new Set();
  K.forEach((x) => x.w.forEach((w) => { if (!seen.has(w.k)) { seen.add(w.k); words.push(w); } }));

  const sample = (arr, n) => { arr = arr.slice(); const o = []; while (o.length < n && arr.length) o.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]); return o; };
  const distract = (pool, key, correct, n, near) => {
    const uniq = [...new Set(pool.map(key))].filter((v) => v !== correct);
    const close = near ? uniq.filter((v) => Math.abs(v.length - correct.length) <= 1) : [];
    const first = sample(close, n);
    return first.concat(sample(uniq.filter((v) => !first.includes(v)), n - first.length));
  };

  const out = [];
  K.forEach((x) => {
    const note = `${x.c} — on: ${x.on} · kun: ${x.kun}. Words: ` + x.w.map((w) => `${w.k} (${w.r}) ${w.e}`).join("; ");
    out.push({ id: `k:${x.c}:m`, t: "k", d: 1, p: "What does this kanji mean?", q: x.c, big: true,
      c: [x.m, ...distract(K, (y) => y.m, x.m, 3)], a: 0, en: `${x.c} = ${x.m}`, note });
    out.push({ id: `k:${x.c}:p`, t: "k", d: 2, p: "Which kanji matches this meaning?", q: `“${x.m}”`, cbig: true,
      c: [x.c, ...distract(K, (y) => y.c, x.c, 3)], a: 0, en: `${x.c} = ${x.m}`, note });
  });
  words.forEach((w) => {
    const note = ""; // the answer line already shows word, reading and meaning
    out.push({ id: `k:${w.k}:r`, t: "k", d: 2, p: "How do you read this word?", q: w.k, big: true,
      c: [w.r, ...distract(words, (y) => y.r, w.r, 3, true)], a: 0, en: `${w.k} (${w.r}) = ${w.e}`, note });
    out.push({ id: `k:${w.k}:w`, t: "k", d: 3, p: "Which word is this?", q: `“${w.e}” — ${w.r}`, cbig: true,
      c: [w.k, ...distract(words, (y) => y.k, w.k, 3, true)], a: 0, en: `${w.k} (${w.r}) = ${w.e}`, note });
  });
  return out;
};
