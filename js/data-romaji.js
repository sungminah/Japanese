// Romaji reading exercise. s = sentence with furigana markup, k = hiragana reading split into words
// (particles は/へ/を are their own tokens), en = translation, d = difficulty.
window.ROMAJI_SENTENCES = [
  { id: "r01", d: 1, s: "わたしは{学生|がくせい}です。", k: "わたし は がくせい です", en: "I am a student." },
  { id: "r02", d: 1, s: "{水|みず}をください。", k: "みず を ください", en: "Water, please." },
  { id: "r03", d: 1, s: "これは{本|ほん}です。", k: "これ は ほん です", en: "This is a book." },
  { id: "r04", d: 1, s: "{私|わたし}は{日本人|にほんじん}です。", k: "わたし は にほんじん です", en: "I am Japanese." },
  { id: "r05", d: 1, s: "{毎日|まいにち}{学校|がっこう}へ{行|い}きます。", k: "まいにち がっこう へ いきます", en: "I go to school every day." },
  { id: "r06", d: 1, s: "{朝|あさ}ごはんを{食|た}べます。", k: "あさごはん を たべます", en: "I eat breakfast." },
  { id: "r07", d: 1, s: "{先生|せんせい}は{親切|しんせつ}です。", k: "せんせい は しんせつ です", en: "The teacher is kind." },
  { id: "r08", d: 1, s: "{駅|えき}はどこですか。", k: "えき は どこ です か", en: "Where is the station?" },
  { id: "r09", d: 2, s: "{今日|きょう}は{天気|てんき}がいいです。", k: "きょう は てんき が いい です", en: "The weather is nice today." },
  { id: "r10", d: 2, s: "{図書館|としょかん}で{本|ほん}を{読|よ}みます。", k: "としょかん で ほん を よみます", en: "I read books at the library." },
  { id: "r11", d: 2, s: "{友達|ともだち}と{映画|えいが}を{見|み}ました。", k: "ともだち と えいが を みました", en: "I watched a movie with a friend." },
  { id: "r12", d: 2, s: "{七時|しちじ}に{起|お}きます。", k: "しちじ に おきます", en: "I get up at seven o'clock." },
  { id: "r13", d: 2, s: "{日本語|にほんご}は{難|むずか}しいですが、おもしろいです。", k: "にほんご は むずかしい です が おもしろい です", en: "Japanese is difficult, but it's interesting." },
  { id: "r14", d: 2, s: "{東京|とうきょう}は{大|おお}きいです。", k: "とうきょう は おおきい です", en: "Tokyo is big." },
  { id: "r15", d: 2, s: "{電車|でんしゃ}で{会社|かいしゃ}へ{行|い}きます。", k: "でんしゃ で かいしゃ へ いきます", en: "I go to the office by train." },
  { id: "r16", d: 2, s: "{昨日|きのう}は{雨|あめ}が{降|ふ}りました。", k: "きのう は あめ が ふりました", en: "It rained yesterday." },
  { id: "r17", d: 2, s: "コーヒーを{飲|の}みませんか。", k: "こーひー を のみませんか", en: "Would you like to drink some coffee?" },
  { id: "r18", d: 3, s: "{明日|あした}は{友達|ともだち}と{買|か}い{物|もの}に{行|い}きます。", k: "あした は ともだち と かいもの に いきます", en: "Tomorrow I'm going shopping with a friend." },
  { id: "r19", d: 3, s: "{毎朝|まいあさ}{六時|ろくじ}に{起|お}きて、{散歩|さんぽ}をします。", k: "まいあさ ろくじ に おきて さんぽ を します", en: "Every morning I get up at six and take a walk." },
  { id: "r20", d: 3, s: "{窓|まど}を{開|あ}けてください。", k: "まど を あけて ください", en: "Please open the window." },
  { id: "r21", d: 3, s: "{私|わたし}の{家|いえ}は{駅|えき}から{近|ちか}いです。", k: "わたし の いえ は えき から ちかい です", en: "My house is close to the station." },
  { id: "r22", d: 3, s: "{日曜日|にちようび}は{会社|かいしゃ}へ{行|い}きません。", k: "にちようび は かいしゃ へ いきません", en: "I don't go to the office on Sundays." },
  { id: "r23", d: 3, s: "{部屋|へや}にだれもいません。", k: "へや に だれ も いません", en: "There is nobody in the room." },
  { id: "r24", d: 3, s: "{東京|とうきょう}は{大阪|おおさか}より{大|おお}きいです。", k: "とうきょう は おおさか より おおきい です", en: "Tokyo is bigger than Osaka." },
  { id: "r25", d: 3, s: "{一緒|いっしょ}に{昼|ひる}ごはんを{食|た}べましょう。", k: "いっしょ に ひるごはん を たべましょう", en: "Let's eat lunch together." }
];
