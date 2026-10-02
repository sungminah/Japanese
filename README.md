# JLPT Quest

A free, Pokémon-themed web app for studying Japanese from N5 up to N1.
No build step and no install: open `index.html` in a browser (or use GitHub Pages).

## Features
- **Five routes per region:** Mixed, Grammar, Vocabulary, Kanji only, Romaji reading
- **Romaji reading:** a sentence with furigana is shown and you type its romanization
  (accepts `wa/ha`, `o/wo`, `shi/si`, `tsu/tu`, macrons, and long-vowel shortcuts with a tip)
- **Kanji only:** meaning, word reading, and kanji recognition for ~90 N5-level kanji
- **Catching:** 4+ correct = guaranteed catch, 3 correct = 60%, perfect run = bonus
- **Scoring:** XP and trainer level, per-skill candy (+ combo bonus), skill levels, daily streak bonus
- **Evolution:** spend candy (each evolution needs one skill's candy) to evolve your Pokémon
- Your caught Pokémon are shown on the home page; Pokédex, placement test, furigana toggle, export/import of progress
- Questions answered wrong come back more often

## Adding content
- Grammar/vocabulary: `js/data-n5.js` (furigana markup `{漢字|かんじ}`, blank `＿＿`)
- Kanji: `js/data-kanji.js`
- Romaji sentences: `js/data-romaji.js` (`k` is the hiragana reading, split into words)

Pokémon sprites come from [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon is a trademark of Nintendo / Game Freak / The Pokémon Company; this is a non-commercial study project.
