// N1 sentences for the romaji reading exercise (furigana is stored so the readings can be checked, but it is hidden when you play).
window.ROMAJI_SENTENCES = (window.ROMAJI_SENTENCES || []).concat([
  { id: "r501", lv: 1, d: 3, s: "{本日|ほんじつ}をもって、{閉店|へいてん}いたします。", k: "ほんじつ を もって へいてん いたします", en: "As of today, we will close the shop." },
  { id: "r502", lv: 1, d: 3, s: "この{味|あじ}は、{老舗|しにせ}ならではの{味|あじ}だ。", k: "この あじ は しにせ ならでは の あじ だ", en: "This flavour is one only a long-established shop can offer." },
  { id: "r503", lv: 1, d: 3, s: "{彼|かれ}の{態度|たいど}は{失礼極|しつれいきわ}まりない。", k: "かれ の たいど は しつれい きわまりない", en: "His attitude is extremely rude." },
  { id: "r504", lv: 1, d: 3, s: "{連休初日|れんきゅうしょにち}とあって、{駅|えき}は{大混雑|だいこんざつ}だった。", k: "れんきゅう しょにち と あって えき は だい こんざつ だった", en: "Since it was the first day of the holiday, the station was packed." },
  { id: "r505", lv: 1, d: 3, s: "{貧|まず}しさゆえに、{進学|しんがく}を{諦|あきら}めた。", k: "まずしさ ゆえ に しんがく を あきらめた", en: "Because of poverty, he gave up on going on to school." },
  { id: "r506", lv: 1, d: 3, s: "{彼|かれ}は{困難|こんなん}をものともせず、{前|まえ}に{進|すす}んだ。", k: "かれ は こんなん を ものともせず まえ に すすんだ", en: "He moved forward undaunted by the difficulties." },
  { id: "r507", lv: 1, d: 3, s: "{台風|たいふう}のため、{旅行|りょこう}の{中止|ちゅうし}を{余儀|よぎ}なくされた。", k: "たいふう の ため りょこう の ちゅうし を よぎなく された", en: "Because of the typhoon, we were forced to cancel the trip." },
  { id: "r508", lv: 1, d: 3, s: "{専門家|せんもんか}といえども、{間違|まちが}えることはある。", k: "せんもんか と いえども まちがえる こと は ある", en: "Even experts make mistakes." },
  { id: "r509", lv: 1, d: 3, s: "{細部|さいぶ}に{至|いた}るまで、{丁寧|ていねい}に{作|つく}られている。", k: "さいぶ に いたる まで ていねい に つくられて いる", en: "It is carefully made right down to the smallest details." },
  { id: "r510", lv: 1, d: 3, s: "{結局|けっきょく}、{彼|かれ}には{会|あ}えずじまいだった。", k: "けっきょく かれ に は あえずじまい だった", en: "In the end, I never got to meet him." },
  { id: "r511", lv: 1, d: 3, s: "{皆様|みなさま}のご{多幸|たこう}を{願|ねが}ってやみません。", k: "みなさま の ご たこう を ねがって やみません", en: "I never cease to wish for everyone's happiness." },
  { id: "r512", lv: 1, d: 3, s: "{彼|かれ}の{苦労|くろう}は{想像|そうぞう}に{難|かた}くない。", k: "かれ の くろう は そうぞう に かたくない", en: "It is not hard to imagine his hardship." },
  { id: "r513", lv: 1, d: 3, s: "{彼|かれ}は{会社|かいしゃ}に{勤|つと}めるかたわら、{小説|しょうせつ}を{書|か}いている。", k: "かれ は かいしゃ に つとめる かたわら しょうせつ を かいて いる", en: "While working at a company, he also writes novels." },
  { id: "r514", lv: 1, d: 3, s: "{私|わたし}は{私|わたし}なりに、{精一杯|せいいっぱい}{努力|どりょく}した。", k: "わたし は わたし なり に せいいっぱい どりょく した", en: "In my own way, I did my very best." },
  { id: "r515", lv: 1, d: 3, s: "{努力|どりょく}なくして、{成功|せいこう}はない。", k: "どりょく なくして せいこう は ない", en: "Without effort, there is no success." },
  { id: "r516", lv: 1, d: 3, s: "{前回|ぜんかい}の{反省|はんせい}をふまえて、{計画|けいかく}を{立|た}て{直|なお}した。", k: "ぜんかい の はんせい を ふまえて けいかく を たてなおした", en: "Based on the lessons from last time, we redrew the plan." },
  { id: "r517", lv: 1, d: 3, s: "{一円|いちえん}たりとも{無駄|むだ}にはできない。", k: "いちえん たりとも むだ に は できない", en: "I can't waste even a single yen." },
  { id: "r518", lv: 1, d: 3, s: "{専門家|せんもんか}だけあって、{詳|くわ}しい。", k: "せんもんか だけ あって くわしい", en: "As you'd expect of an expert, he knows a lot." },
  { id: "r519", lv: 1, d: 3, s: "{彼|かれ}は{泥|どろ}まみれになって{帰|かえ}ってきた。", k: "かれ は どろ まみれ に なって かえって きた", en: "He came home covered in mud." },
  { id: "r520", lv: 1, d: 3, s: "{東京公演|とうきょうこうえん}を{皮切|かわき}りに、{全国|ぜんこく}ツアーが{始|はじ}まる。", k: "とうきょう こうえん を かわきり に ぜんこく つあー が はじまる", en: "The nationwide tour begins, starting with the Tokyo show." }
]);
