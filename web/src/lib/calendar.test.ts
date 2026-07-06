import { describe, expect, test } from 'vitest'
import { buildMonthGrid, dayStatus } from './calendar'
import type { LogDay } from './markdown'

function day(dateStr: string, entries: Array<[string, 'done' | 'missed' | 'unplanned' | null]>, sentence = ''): LogDay {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return {
    label: `${d}.${m}.`,
    date,
    sentence,
    entries: entries.map(([habit, status]) => ({ habit, status, note: '' })),
  }
}

describe('buildMonthGrid', () => {
  test('builds 6 weeks x 7 days for a month, Monday-first', () => {
    // July 2026: 1st is Wednesday
    const grid = buildMonthGrid(2026, 6, [], new Date(2026, 6, 6))
    expect(grid.weeks.length).toBeGreaterThanOrEqual(5)
    for (const week of grid.weeks) {
      expect(week.length).toBe(7)
    }
  })

  test('leading days from previous month are marked outside=true', () => {
    // July 2026 starts Wed -> Mon 6/29 and Tue 6/30 are leading padding
    const grid = buildMonthGrid(2026, 6, [], new Date(2026, 6, 6))
    const firstWeek = grid.weeks[0]
    expect(firstWeek[0].date.getMonth()).toBe(5) // June
    expect(firstWeek[0].outside).toBe(true)
    expect(firstWeek[2].date.getMonth()).toBe(6) // July 1st
    expect(firstWeek[2].outside).toBe(false)
  })

  test('trailing days from next month are marked outside=true', () => {
    const grid = buildMonthGrid(2026, 6, [], new Date(2026, 6, 6))
    const lastWeek = grid.weeks[grid.weeks.length - 1]
    const lastCell = lastWeek[lastWeek.length - 1]
    // July has 31 days, last week should spill into August if 31st isn't a Sunday
    if (lastCell.date.getMonth() !== 6) {
      expect(lastCell.outside).toBe(true)
    }
  })

  test('marks today when it falls in the grid', () => {
    const today = new Date(2026, 6, 6)
    const grid = buildMonthGrid(2026, 6, [], today)
    const cell = grid.weeks.flat().find((c) => c.date.getDate() === 6 && c.date.getMonth() === 6)
    expect(cell?.isToday).toBe(true)
    const otherCell = grid.weeks.flat().find((c) => c.date.getDate() === 7 && c.date.getMonth() === 6)
    expect(otherCell?.isToday).toBe(false)
  })

  test('attaches matching LogDay to each cell', () => {
    const days = [day('2026-07-06', [['a', 'done']])]
    const grid = buildMonthGrid(2026, 6, days, new Date(2026, 6, 6))
    const cell = grid.weeks.flat().find((c) => c.date.getDate() === 6 && c.date.getMonth() === 6)
    expect(cell?.log?.entries[0].habit).toBe('a')
  })

  test('cell with no log entry has log=null', () => {
    const grid = buildMonthGrid(2026, 6, [], new Date(2026, 6, 6))
    const cell = grid.weeks.flat().find((c) => c.date.getDate() === 6 && c.date.getMonth() === 6)
    expect(cell?.log).toBe(null)
  })
})

describe('dayStatus', () => {
  test('returns "empty" for a day with no log', () => {
    expect(dayStatus(null)).toBe('empty')
  })

  test('returns "empty" for a log with no entries', () => {
    expect(dayStatus(day('2026-07-06', []))).toBe('empty')
  })

  test('returns "done" when all planned entries are done', () => {
    expect(dayStatus(day('2026-07-06', [['a', 'done'], ['b', 'done']]))).toBe('done')
  })

  test('returns "partial" when some done and some missed', () => {
    expect(dayStatus(day('2026-07-06', [['a', 'done'], ['b', 'missed']]))).toBe('partial')
  })

  test('returns "missed" when all planned entries are missed', () => {
    expect(dayStatus(day('2026-07-06', [['a', 'missed'], ['b', 'missed']]))).toBe('missed')
  })

  test('ignores unplanned entries when computing status', () => {
    expect(dayStatus(day('2026-07-06', [['a', 'done'], ['b', 'unplanned']]))).toBe('done')
  })

  test('returns "empty" when only unplanned entries exist', () => {
    expect(dayStatus(day('2026-07-06', [['a', 'unplanned']]))).toBe('empty')
  })
})
