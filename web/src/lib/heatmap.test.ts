import { describe, expect, test } from 'vitest'
import { buildHeatmap } from './heatmap'
import type { LogDay } from './markdown'

function day(dateStr: string, entries: Array<[string, 'done' | 'missed' | 'unplanned' | null]>): LogDay {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return {
    label: `${d}.${m}.`,
    date,
    sentence: '',
    entries: entries.map(([habit, status]) => ({ habit, status, note: '' })),
  }
}

describe('buildHeatmap', () => {
  test('builds one cell per day in range, grouped into weeks (Mon-first)', () => {
    const days = [
      day('2026-07-06', [['💪 Cvičení', 'done']]), // Monday
      day('2026-07-07', [['💪 Cvičení', 'done'], ['📖 Čtení', 'done']]),
    ]
    const grid = buildHeatmap(days, new Date(2026, 6, 6), new Date(2026, 6, 7))
    expect(grid.weeks.length).toBe(1)
    expect(grid.weeks[0].length).toBe(7)
    const mon = grid.weeks[0][0]
    const tue = grid.weeks[0][1]
    expect(mon?.date && mon.date.getDate()).toBe(6)
    expect(mon?.doneCount).toBe(1)
    expect(tue?.doneCount).toBe(2)
  })

  test('days outside range are null placeholders, keeping week alignment', () => {
    // 2026-07-01 is a Wednesday -> week starts Mon 2026-06-29
    const days = [day('2026-07-01', [['💪 Cvičení', 'done']])]
    const grid = buildHeatmap(days, new Date(2026, 6, 1), new Date(2026, 6, 1))
    const firstWeek = grid.weeks[0]
    expect(firstWeek[0]).toBe(null) // Monday 6/29, before range
    expect(firstWeek[1]).toBe(null) // Tuesday 6/30
    expect(firstWeek[2]?.date.getDate()).toBe(1) // Wednesday 7/1
  })

  test('doneCount only counts done status, not missed/unplanned', () => {
    const days = [
      day('2026-07-06', [
        ['💪 Cvičení', 'done'],
        ['📖 Čtení', 'missed'],
        ['🧠 QA/AI', 'unplanned'],
      ]),
    ]
    const grid = buildHeatmap(days, new Date(2026, 6, 6), new Date(2026, 6, 6))
    expect(grid.weeks[0][0]?.doneCount).toBe(1)
    expect(grid.weeks[0][0]?.plannedCount).toBe(2) // done + missed, not unplanned
  })

  test('day with no log entry at all still appears as an empty cell', () => {
    const grid = buildHeatmap([], new Date(2026, 6, 6), new Date(2026, 6, 6))
    expect(grid.weeks[0][0]?.date.getDate()).toBe(6)
    expect(grid.weeks[0][0]?.doneCount).toBe(0)
    expect(grid.weeks[0][0]?.plannedCount).toBe(0)
  })

  test('intensity level buckets doneCount into 0-4 for color scale', () => {
    const days = [
      day('2026-07-06', []),
      day('2026-07-07', [['a', 'done']]),
      day('2026-07-08', [['a', 'done'], ['b', 'done']]),
      day('2026-07-09', [['a', 'done'], ['b', 'done'], ['c', 'done']]),
      day('2026-07-10', [['a', 'done'], ['b', 'done'], ['c', 'done'], ['d', 'done']]),
    ]
    const grid = buildHeatmap(days, new Date(2026, 6, 6), new Date(2026, 6, 10))
    const cells = grid.weeks[0].slice(0, 5)
    expect(cells.map((c) => c?.level)).toEqual([0, 1, 2, 3, 4])
  })
})
