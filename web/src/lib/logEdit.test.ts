import { describe, expect, test } from 'vitest'
import { setCheckin, setSentence } from './logEdit'

const LOG = `# Log — červenec 2026

Formát: \`✅/❌/➖\` + jedna věta.

## Po 6.7.
- 💪 Cvičení:
- 📖 Čtení: ❌ nestíhal jsem
- 🧠 QA/AI:
- ♟️ Šachy (bonus):
- Věta dne:
`

describe('setCheckin', () => {
  test('fills empty habit line with mark and note', () => {
    const out = setCheckin(LOG, 'Po 6.7.', '💪 Cvičení', 'done', 'Trénink A, 2 kola')
    expect(out).toContain('- 💪 Cvičení: ✅ Trénink A, 2 kola')
  })

  test('changes existing status and keeps note when note not given', () => {
    const out = setCheckin(LOG, 'Po 6.7.', '📖 Čtení', 'done')
    expect(out).toContain('- 📖 Čtení: ✅ nestíhal jsem')
    expect(out).not.toContain('- 📖 Čtení: ❌')
  })

  test('replaces note when given', () => {
    const out = setCheckin(LOG, 'Po 6.7.', '📖 Čtení', 'missed', 'dnes ne')
    expect(out).toContain('- 📖 Čtení: ❌ dnes ne')
  })

  test('does not touch other days or lines', () => {
    const md = LOG + '\n## Út 7.7.\n- 💪 Cvičení: ✅ ráno\n'
    const out = setCheckin(md, 'Po 6.7.', '💪 Cvičení', 'unplanned')
    expect(out).toContain('## Út 7.7.\n- 💪 Cvičení: ✅ ráno')
    expect(out).toContain('- 💪 Cvičení: ➖')
  })

  test('appends new day section when day is missing', () => {
    const out = setCheckin(LOG, 'Út 7.7.', '📖 Čtení', 'done', 'Zaklínač')
    expect(out).toContain('## Út 7.7.')
    expect(out).toContain('- 📖 Čtení: ✅ Zaklínač')
    expect(out.indexOf('## Út 7.7.')).toBeGreaterThan(out.indexOf('## Po 6.7.'))
  })

  test('writes ⏭️ for excused and keeps the note', () => {
    const out = setCheckin(LOG, 'Po 6.7.', '📖 Čtení', 'excused')
    expect(out).toContain('- 📖 Čtení: ⏭️ nestíhal jsem')
  })

  test('overwriting an excused mark strips ⏭️ from the kept note', () => {
    const excused = setCheckin(LOG, 'Po 6.7.', '💪 Cvičení', 'excused', 'nemoc')
    const done = setCheckin(excused, 'Po 6.7.', '💪 Cvičení', 'done')
    expect(done).toContain('- 💪 Cvičení: ✅ nemoc')
    expect(done).not.toContain('⏭️ nemoc')
  })

  test('appends habit line into existing section when habit line is missing', () => {
    const md = '# Log\n\n## Po 6.7.\n- 💪 Cvičení: ✅\n'
    const out = setCheckin(md, 'Po 6.7.', '📖 Čtení', 'done')
    expect(out).toContain('- 📖 Čtení: ✅')
    expect(out).toContain('- 💪 Cvičení: ✅')
  })
})

describe('setSentence', () => {
  test('fills the sentence line of the day', () => {
    const out = setSentence(LOG, 'Po 6.7.', 'dobrý start')
    expect(out).toContain('- Věta dne: dobrý start')
  })

  test('overwrites existing sentence', () => {
    const once = setSentence(LOG, 'Po 6.7.', 'první verze')
    const twice = setSentence(once, 'Po 6.7.', 'druhá verze')
    expect(twice).toContain('- Věta dne: druhá verze')
    expect(twice).not.toContain('první verze')
  })
})
