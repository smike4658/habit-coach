import { assertEquals } from 'jsr:@std/assert'
import { dayLabelFor, isoWeekId, logFileName, parseDayLabel, pragueToday, toIsoDate } from './dates.ts'
import { parseLog, parseWeekPlan } from './markdown.ts'
import { setCheckin, setSentence } from './logEdit.ts'

Deno.test('isoWeekId + file names', () => {
  assertEquals(isoWeekId(new Date(2026, 6, 6)), '2026-W28')
  assertEquals(isoWeekId(new Date(2027, 0, 1)), '2026-W53')
  assertEquals(logFileName(new Date(2026, 6, 6)), 'log/2026-07.md')
})

Deno.test('dayLabelFor + parseDayLabel roundtrip', () => {
  const d = new Date(2026, 6, 6)
  assertEquals(dayLabelFor(d), 'Po 6.7.')
  assertEquals(toIsoDate(parseDayLabel('Po 6.7.', 2026)!), '2026-07-06')
})

Deno.test('pragueToday returns a date-only value', () => {
  const d = pragueToday(new Date('2026-07-06T23:30:00+02:00'))
  assertEquals(toIsoDate(d), '2026-07-06')
})

const WEEK_MD = `# Týden 1 — 2026-W28

| Den | 💪 Cvičení (10 min) | 📖 Čtení (15 min) | 🧠 QA/AI (15 min + TIL) | Pozn. |
|---|---|---|---|---|
| Po 6.7. | Trénink A | Zaklínač | Playwright 1 | první den |
| Út 7.7. | — | Zaklínač | PW den 2 | |

## Denní plány

### Po 6.7. — vstup

Detail dne.
`

Deno.test('parseWeekPlan extracts columns, rows, details', () => {
  const plan = parseWeekPlan(WEEK_MD, 2026)
  assertEquals(plan.columns.length, 3)
  assertEquals(plan.days[0].items[0], 'Trénink A')
  assertEquals(plan.days[1].items[0], null)
  assertEquals(plan.days[0].detail, 'Detail dne.')
})

const LOG_MD = `# Log

## Po 6.7.
- 💪 Cvičení: ✅ Trénink A
- 📖 Čtení: ❌
- 🧠 QA/AI: ➖
- Věta dne: dobrý start
`

Deno.test('parseLog maps marks to DB status names', () => {
  const log = parseLog(LOG_MD, 2026)
  assertEquals(log.days[0].entries[0].status, 'done')
  assertEquals(log.days[0].entries[1].status, 'skipped')
  assertEquals(log.days[0].entries[2].status, 'unplanned')
  assertEquals(log.days[0].sentence, 'dobrý start')
})

Deno.test('setCheckin updates line, keeps note, appends missing day', () => {
  const changed = setCheckin(LOG_MD, 'Po 6.7.', '📖 Čtení', 'done')
  assertEquals(changed.includes('- 📖 Čtení: ✅'), true)
  const kept = setCheckin(LOG_MD, 'Po 6.7.', '💪 Cvičení', 'skipped')
  assertEquals(kept.includes('- 💪 Cvičení: ❌ Trénink A'), true)
  const appended = setCheckin(LOG_MD, 'Út 7.7.', '💪 Cvičení', 'done', 'ráno')
  assertEquals(appended.includes('## Út 7.7.'), true)
  assertEquals(appended.includes('- 💪 Cvičení: ✅ ráno'), true)
})

Deno.test('setSentence overwrites', () => {
  const out = setSentence(setSentence(LOG_MD, 'Po 6.7.', 'a'), 'Po 6.7.', 'b')
  assertEquals(out.includes('- Věta dne: b'), true)
  assertEquals(out.includes('- Věta dne: a'), false)
})
