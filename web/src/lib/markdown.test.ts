import { describe, expect, test } from 'vitest'
import { parseLog, parseWeekPlan } from './markdown'

const WEEK_MD = `# Týden 1 — 2026-W28 (6.–12. 7. 2026)

**Motto týdne: Nevynechat. Výkon je jedno.** Dávky jsou schválně malé.

| Den | 💪 Cvičení (10 min) | 📖 Čtení (15 min) | 🧠 QA/AI (15 min + TIL) | Pozn. |
|---|---|---|---|---|
| Po 6.7. | Trénink A (2 kola, lehce) | Zaklínač | Playwright: docs Best Practices, část 1 | první den — hlavně odstartovat |
| Út 7.7. | — | Zaklínač | PW den 2: lab setup + první test | |
| Ne 12.7. | — | — | — | 🔁 **týdenní review se mnou (15 min)** |

- 🧠 QA/AI blok jede podle kurikula.

## Denní plány

### Po 6.7. — 🧠 QA/AI vstup: Playwright Best Practices, část 1

Číst: https://playwright.dev/docs/best-practices — jen vybrané sekce.

1. *Test user-visible behavior*.
`

const LOG_MD = `# Log — červenec 2026

Formát: \`✅/❌/➖\` (splněno / vynecháno / neplánováno) + jedna věta.

## Po 6.7.
- 💪 Cvičení: ✅ Trénink A dal jsem 2 kola
- 📖 Čtení: ❌
- 🧠 QA/AI: ✅ přečteno, TIL zapsán
- ♟️ Šachy (bonus): ➖
- Věta dne: dobrý start

## Út 7.7.
- 💪 Cvičení: ➖
- 📖 Čtení:
- 🧠 QA/AI:
- ♟️ Šachy (bonus):
- Věta dne:
`

describe('parseWeekPlan', () => {
  test('extracts title and columns', () => {
    const plan = parseWeekPlan(WEEK_MD, 2026)
    expect(plan.title).toBe('Týden 1 — 2026-W28 (6.–12. 7. 2026)')
    expect(plan.columns).toEqual([
      '💪 Cvičení (10 min)',
      '📖 Čtení (15 min)',
      '🧠 QA/AI (15 min + TIL)',
    ])
  })

  test('parses day rows with dates and items, em-dash means not planned', () => {
    const plan = parseWeekPlan(WEEK_MD, 2026)
    expect(plan.days).toHaveLength(3)
    const po = plan.days[0]
    expect(po.label).toBe('Po 6.7.')
    expect(po.date?.getDate()).toBe(6)
    expect(po.items[0]).toBe('Trénink A (2 kola, lehce)')
    const ut = plan.days[1]
    expect(ut.items[0]).toBeNull() // — = neplánováno
    expect(ut.items[1]).toBe('Zaklínač')
    expect(po.note).toContain('první den')
  })

  test('attaches daily detail section to matching day', () => {
    const plan = parseWeekPlan(WEEK_MD, 2026)
    expect(plan.days[0].detail).toContain('playwright.dev/docs/best-practices')
    expect(plan.days[1].detail).toBeNull()
  })
})

describe('parseLog', () => {
  test('parses day sections with habit statuses and notes', () => {
    const log = parseLog(LOG_MD, 2026)
    expect(log.days).toHaveLength(2)
    const po = log.days[0]
    expect(po.label).toBe('Po 6.7.')
    expect(po.date?.getDate()).toBe(6)
    expect(po.entries).toEqual([
      { habit: '💪 Cvičení', status: 'done', note: 'Trénink A dal jsem 2 kola' },
      { habit: '📖 Čtení', status: 'missed', note: '' },
      { habit: '🧠 QA/AI', status: 'done', note: 'přečteno, TIL zapsán' },
      { habit: '♟️ Šachy (bonus)', status: 'unplanned', note: '' },
    ])
    expect(po.sentence).toBe('dobrý start')
  })

  test('empty values mean not yet filled (status null)', () => {
    const log = parseLog(LOG_MD, 2026)
    const ut = log.days[1]
    expect(ut.entries[1]).toEqual({ habit: '📖 Čtení', status: null, note: '' })
    expect(ut.sentence).toBe('')
  })
})
