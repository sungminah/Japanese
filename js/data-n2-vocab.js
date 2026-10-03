// Original N2 vocabulary questions (no furigana): fill-in-the-blank, closest meaning, prefix/suffix.
// Row: [id, difficulty, prompt|null, question, [correct, wrong, wrong, wrong], English, note]
(function () {
  const add = (rows) => rows.forEach(([id, d, p, q, c, en, note]) => {
    const o = { id: "n2vx" + id, lv: 2, t: "v", d, q, c, a: 0, en, note };
    if (p) o.p = p;
    window.QUESTIONS.push(o);
  });
  const SYN = "Choose the word closest in meaning to the word in 【 】.";
  const AFX = "Choose the prefix / suffix that completes the word.";

  add([
    // ---- fill in the blank ----
    ["c01", 2, null, "彼は会社の＿＿を任されて、毎日忙しそうだ。", ["経営", "習慣", "印象", "近所"], "He was entrusted with running the company and seems busy every day.", "経営 (けいえい) = management."],
    ["c02", 2, null, "台風の＿＿で、新幹線が運休になった。", ["影響", "印象", "経験", "趣味"], "Because of the typhoon, the Shinkansen was suspended.", "影響 (えいきょう) = influence, effect."],
    ["c03", 2, null, "この辞書は初心者にも＿＿しやすい。", ["利用", "反対", "保存", "発見"], "This dictionary is easy even for beginners to use.", "利用 (りよう) = use."],
    ["c04", 2, null, "彼は約束を＿＿ことで有名だ。", ["破る", "折る", "割る", "切る"], "He is known for breaking promises.", "約束を破る = to break a promise."],
    ["c05", 2, null, "机の上の書類を＿＿ください。", ["片付けて", "見つけて", "決めて", "続けて"], "Please tidy up the documents on the desk.", "片付ける (かたづける) = to tidy up."],
    ["c06", 3, null, "友達の意見を＿＿にして、計画を変更した。", ["参考", "反省", "確認", "練習"], "I used my friend's opinion as a reference and changed the plan.", "〜を参考にする = to use … as a reference."],
    ["c07", 3, null, "地震に＿＿て、非常用の水を買っておいた。", ["備え", "逃げ", "続け", "通し"], "I bought emergency water in preparation for an earthquake.", "〜に備える (そなえる) = to prepare for …."],
    ["c08", 3, null, "最近、仕事が＿＿ているので、休む時間がない。", ["たまっ", "割れ", "落ち", "外れ"], "Work has piled up lately, so I have no time to rest.", "仕事がたまる = work piles up."],
    ["c09", 2, null, "彼女は誰にでも＿＿態度で接する。", ["親切な", "重大な", "深刻な", "貴重な"], "She treats everyone with a kind attitude.", "親切な (しんせつな) = kind."],
    ["c10", 3, null, "会議の＿＿を決めるために、全員の予定を確認した。", ["日程", "方針", "範囲", "原因"], "To decide the schedule of the meeting, I checked everyone's availability.", "日程 (にってい) = schedule, dates."],
    ["c11", 2, null, "この仕事には、専門的な＿＿が必要だ。", ["知識", "習慣", "行事", "気分"], "This job requires specialised knowledge.", "知識 (ちしき) = knowledge."],
    ["c12", 2, null, "子どもの＿＿を伸ばすために、いろいろな経験をさせたい。", ["能力", "気分", "関係", "状況"], "I want my child to have many experiences to develop their abilities.", "能力 (のうりょく) = ability."],
    ["c13", 3, null, "値段が＿＿ので、たくさん買ってしまった。", ["手頃な", "勝手な", "生意気な", "派手な"], "The price was reasonable, so I ended up buying a lot.", "手頃 (てごろ) = reasonable, affordable."],
    ["c14", 3, null, "彼は＿＿で、細かいところまで気がつく。", ["几帳面", "呑気", "派手", "乱暴"], "He is meticulous and notices even small details.", "几帳面 (きちょうめん) = meticulous."],
    ["c15", 2, null, "冬は空気が＿＿ので、肌が荒れやすい。", ["乾燥している", "混雑している", "満足している", "故障している"], "In winter the air is dry, so skin gets rough easily.", "乾燥 (かんそう) = dryness."],
    ["c16", 2, null, "この会議は、とても＿＿な問題を扱っている。", ["重要", "平気", "勝手", "無理"], "This meeting deals with a very important problem.", "重要 (じゅうよう) = important."],
    ["c17", 1, null, "入学試験に＿＿するために、毎日勉強している。", ["合格", "出席", "欠席", "提出"], "I study every day in order to pass the entrance exam.", "合格 (ごうかく) = passing an exam."],
    ["c18", 2, null, "彼の話は＿＿が多くて、信じられない。", ["嘘", "汗", "筋", "角"], "His stories are full of lies, so I can't believe them.", "嘘 (うそ) = lie."],
    ["c19", 3, null, "この薬は、一日に三回、食後に＿＿ください。", ["服用して", "相談して", "反対して", "経営して"], "Please take this medicine three times a day after meals.", "服用 (ふくよう) = taking medicine."],
    ["c20", 3, null, "事故のため、電車が＿＿運転を見合わせている。", ["一時", "一生", "一般", "一人"], "Because of an accident, trains have temporarily suspended operation.", "一時 (いちじ) = temporarily."],
    ["c21", 2, null, "彼は＿＿を言わずに、黙って仕事を続けた。", ["文句", "夢", "予定", "経験"], "He kept working silently without complaining.", "文句を言う = to complain."],
    ["c22", 3, null, "この服は、洗っても色が＿＿ない。", ["あせ", "くずれ", "ずれ", "はずれ"], "The colour of this garment doesn't fade even when washed.", "色があせる (あせる) = the colour fades."],
    ["c23", 2, null, "彼の考えには＿＿できない点がいくつかある。", ["賛成", "発達", "発展", "発売"], "There are several points in his idea I can't agree with.", "賛成 (さんせい) = agreement."],
    ["c24", 1, null, "雨で試合が＿＿になった。", ["中止", "中心", "中間", "中継"], "The match was cancelled because of rain.", "中止 (ちゅうし) = cancellation."],
    ["c25", 3, null, "熱が下がらないので、念のため病院で＿＿を受けた。", ["検査", "検討", "点検", "調査"], "My fever wouldn't go down, so I had a medical examination to be safe.", "検査 (けんさ) = examination, test."],
    ["c26", 3, null, "彼女は誰とでもすぐに＿＿ことができる。", ["打ち解ける", "申し込む", "見落とす", "取り上げる"], "She can quickly warm up to anyone.", "打ち解ける (うちとける) = to open up, to warm up to."],
    ["c27", 3, null, "彼の＿＿な発言が、会議の雰囲気を悪くした。", ["軽率", "貴重", "順調", "安全"], "His careless remark spoiled the atmosphere of the meeting.", "軽率 (けいそつ) = careless, rash."],
    ["c28", 1, null, "この町は＿＿が豊かで、散歩するのが楽しい。", ["自然", "自由", "自信", "自身"], "This town is rich in nature, so walking is enjoyable.", "自然 (しぜん) = nature."],
    ["c29", 2, null, "夜遅くまで騒ぐと、近所の＿＿になる。", ["迷惑", "注意", "反省", "用意"], "Making noise late at night becomes a nuisance to the neighbours.", "迷惑 (めいわく) = nuisance, trouble."],
    ["c30", 3, null, "梅雨に入って、＿＿した天気が続いている。", ["じめじめ", "さっぱり", "ぐっすり", "のんびり"], "The rainy season has begun and humid weather continues.", "じめじめ = damp, muggy."],
    ["c31", 2, null, "疲れていたので、朝まで＿＿眠った。", ["ぐっすり", "じっくり", "ぎっしり", "くっきり"], "I was tired, so I slept soundly until morning.", "ぐっすり = (sleeping) soundly."],
    ["c32", 3, null, "約束の時間に＿＿遅れてしまい、申し訳ありません。", ["大幅に", "大量に", "大型に", "大規模に"], "I'm sorry to be so far behind the appointed time.", "大幅に (おおはばに) = by a large margin."],
    // ---- closest in meaning ----
    ["s01", 2, SYN, "彼は【たちまち】有名になった。", ["すぐに", "ゆっくり", "ときどき", "ようやく"], "He became famous in no time.", "たちまち ≈ すぐに (instantly)."],
    ["s02", 3, SYN, "【やむをえない】事情で、欠席します。", ["仕方がない", "面白い", "珍しい", "恥ずかしい"], "I'll be absent for unavoidable reasons.", "やむをえない ≈ 仕方がない (can't be helped)."],
    ["s03", 3, SYN, "彼女は【せっせと】働いている。", ["熱心に", "いやいや", "ぼんやりと", "急に"], "She is working industriously.", "せっせと ≈ 熱心に (diligently)."],
    ["s04", 2, SYN, "【ついに】新しい橋が完成した。", ["とうとう", "たまに", "ゆっくり", "偶然"], "At last the new bridge was completed.", "ついに ≈ とうとう (finally)."],
    ["s05", 3, SYN, "彼はこの店を【しばしば】訪れる。", ["よく", "たまに", "決して", "初めて"], "He visits this shop frequently.", "しばしば ≈ よく (often)."],
    ["s06", 2, SYN, "【ようやく】仕事が終わった。", ["やっと", "すぐに", "偶然", "突然"], "The work has finally finished.", "ようやく ≈ やっと (at last)."],
    ["s07", 2, SYN, "彼は【おそらく】来ないだろう。", ["たぶん", "必ず", "決して", "すでに"], "He probably won't come.", "おそらく ≈ たぶん (probably)."],
    ["s08", 3, SYN, "彼女は【まれに】しか笑わない。", ["めったに", "よく", "いつも", "急に"], "She only rarely laughs.", "まれに ≈ めったに (rarely)."],
    ["s09", 3, SYN, "部屋を【片付ける】。", ["整理する", "壊す", "汚す", "飾る"], "I tidy up the room.", "片付ける ≈ 整理する (to put in order)."],
    ["s10", 3, SYN, "彼は【ひたすら】練習を続けた。", ["ただ一生懸命に", "ときどき", "いやいや", "ゆっくり"], "He devoted himself solely to continuing practice.", "ひたすら = single-mindedly."],
    ["s11", 2, SYN, "作業は【ほぼ】完成した。", ["だいたい", "まったく", "少しも", "全然"], "The work is almost complete.", "ほぼ ≈ だいたい (almost)."],
    ["s12", 3, SYN, "彼の態度は【あいまい】だ。", ["はっきりしない", "厳しい", "優しい", "丁寧な"], "His attitude is ambiguous.", "あいまい = vague, unclear."],
    ["s13", 2, SYN, "【あらかじめ】準備しておく。", ["前もって", "後で", "急いで", "時々"], "I prepare in advance.", "あらかじめ ≈ 前もって (beforehand)."],
    ["s14", 1, SYN, "【まもなく】電車が来ます。", ["もうすぐ", "さっき", "ずっと", "突然"], "The train will arrive shortly.", "まもなく ≈ もうすぐ (soon)."],
    ["s15", 3, SYN, "彼は私の話に【うなずいた】。", ["同意した", "反対した", "無視した", "驚いた"], "He nodded at what I said.", "うなずく = to nod (agreement)."],
    // ---- prefix / suffix ----
    ["a01", 2, AFX, "彼は世界＿＿な有名選手だ。", ["的", "性", "感", "化"], "He is a world-famous athlete.", "世界的 (せかいてき) = worldwide, of world level."],
    ["a02", 2, AFX, "彼は責任＿＿が強い人だ。", ["感", "的", "化", "性"], "He is a person with a strong sense of responsibility.", "責任感 (せきにんかん) = sense of responsibility."],
    ["a03", 2, AFX, "社会の国際＿＿が進んでいる。", ["化", "感", "的", "者"], "The internationalisation of society is progressing.", "国際化 (こくさいか) = internationalisation."],
    ["a04", 1, AFX, "四月に、新入＿＿を歓迎する会を開く。", ["生", "者", "家", "員"], "In April we hold a welcome party for the new students.", "新入生 (しんにゅうせい) = new student."],
    ["a05", 2, AFX, "その計画が成功する可能＿＿は高い。", ["性", "的", "感", "化"], "The likelihood that the plan will succeed is high.", "可能性 (かのうせい) = possibility."],
    ["a06", 2, AFX, "この絵は、まだ＿＿完成だ。", ["未", "不", "無", "非"], "This painting is still unfinished.", "未完成 (みかんせい) = unfinished."],
    ["a07", 2, AFX, "これは＿＿公式の会議だから、気楽に話してください。", ["非", "不", "未", "無"], "This is an unofficial meeting, so feel free to speak casually.", "非公式 (ひこうしき) = unofficial."]
  ]);
})();
