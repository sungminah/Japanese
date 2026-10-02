# JLPT Quest

A free, Pokémon-themed web app for studying Japanese from N5 up to N1.
No build step and no install: open `index.html` in a browser.

## Current status (step 1)
- Wild encounters: answer 5 questions, then throw a ball (4+ correct = guaranteed catch)
- Pokédex (Gen 1, with a 1-in-50 shiny chance), XP, daily streak
- Placement test, furigana toggle, export/import of progress
- N5 starter content (14 vocabulary + 15 grammar questions) in `js/data-n5.js`
- Questions answered wrong come back more often

## Adding questions
Edit `js/data-n5.js`. Furigana markup: `{漢字|かんじ}`. Blank: `＿＿`.

Pokémon sprites come from [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon is a trademark of Nintendo / Game Freak / The Pokémon Company; this is a non-commercial study project.
