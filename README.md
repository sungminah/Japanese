# JLPT Quest

A free, Pokémon-themed web app for studying Japanese from N5 up to N1.
No build step and no install: open `index.html` in a browser (or use GitHub Pages).

## Features
- **Seven routes per region:** Mixed, Grammar, Vocabulary, Kanji only, Romaji reading, Reading, Listening
- **Reading:** short passages (notices, emails, diary entries…) with comprehension questions; the passage translation appears after you answer
- **Listening:** dialogues read aloud by your browser's text-to-speech (needs a Japanese voice, e.g. Kyoko/Otoya on macOS, Haruka/Ichiro on Windows); the script stays hidden until you answer
- **Romaji reading:** a sentence with furigana is shown and you type its romanization
  (accepts `wa/ha`, `o/wo`, `shi/si`, `tsu/tu`, macrons, and long-vowel shortcuts with a tip)
- **Kanji only:** meaning, word reading, and kanji recognition for ~90 N5-level kanji
- **Catching:** 4+ correct = guaranteed catch, 3 correct = 60%, perfect run = bonus
- **Scoring:** XP and trainer level, per-skill candy (+ combo bonus), skill levels, daily streak bonus
- **Evolution:** spend candy (each evolution needs one skill's candy) to evolve your Pokémon
- **649 Pokémon (Kanto → Unova, Gen 1–5)** in one shared Pokédex. Wild spawns favour Pokémon that can evolve
  (basic forms are common, evolved forms rare); legendaries never spawn in the wild
- **Legend quests:** earn Articuno, Zapdos, Moltres, Mewtwo and Mew through study milestones (Johto legends unlock later)
- **Filters:** Pokédex and My Pokémon can be filtered by place, caught/missing/shiny/ready-to-evolve/etc., searched and sorted
- Your caught Pokémon are shown on the home page; placement test, furigana toggle, export/import of progress
- Questions answered wrong come back more often

## Regions and levels
Each JLPT level is a region with its own question pool. Skill levels (Grammar, Vocabulary, Kanji, Romaji) rise with correct answers
(25 per level). Reach the region's level in every skill that has content (Grammar, Vocabulary, Kanji, Romaji, Reading, Listening) (N5: Lv 5, N4: Lv 10, N3: Lv 15, N2: Lv 20, N1: Lv 25; N2 and N1 have base content: word-list questions, grammar patterns, a few readings, dialogues and romaji sentences, all shown without furigana) to unlock its
Gym Leader exam (5 questions per skill, pass with 80%). Passing earns a badge and opens the next region.

## Adding content
- Grammar/vocabulary: `js/data-n5.js`, `js/data-n5-more.js`, `js/data-n4.js` (furigana markup `{漢字|かんじ}`, blank `＿＿`)
- Word lists: `tools/gen_vocab.py` builds `js/data-vocab-nX.js` from the open JLPT lists; `js/vocab.js` turns them into questions
- N3 grammar patterns (`js/data-grammar-n3.js`) are turned into questions by `js/grammar.js`; wrong answers always come from a different category
- Check your edits with `node tools/check_content.js`
- Kanji: `js/data-kanji.js` (N5), `js/data-kanji-n4.js` (N4), `js/data-kanji-n3.js` (N3)
- N2 original vocabulary questions: `js/data-n2-vocab.js`; N2/N1 grammar patterns: `js/data-grammar-n2.js`, `js/data-grammar-n1.js`; N2/N1 readings and dialogues: `js/data-reading-adv.js`, `js/data-listening-adv.js`
- Reading passages: `js/data-reading.js`; listening dialogues: `js/data-listening.js`
- Romaji sentences: `js/data-romaji.js`, `js/data-romaji-n4.js`, `js/data-romaji-n3.js` (`k` is the hiragana reading, split into words)

## Regenerating Pokémon data
`python3 tools/gen_pokemon.py` rebuilds `js/pokemon.js` (names, legendaries, evolution pairs) from the
[PokeAPI data repo](https://github.com/PokeAPI/api-data). Sprites live in `img/pokemon/` (and `shiny/`).

Pokémon sprites come from [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon is a trademark of Nintendo / Game Freak / The Pokémon Company; this is a non-commercial study project.

## Credits
JLPT vocabulary lists: [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (MIT), word data from
[tanos.co.uk](http://www.tanos.co.uk/jlpt/) by Jonathan Waller (CC BY). Pokémon data: [PokeAPI](https://pokeapi.co).
