import { describe, expect, test } from 'vitest'
import { computeHistoryStats } from './historyStats'
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

describe('computeHistoryStats', () => {
  test('overall success rate = done / (done + missed), ignoring unplanned', () => {
    const days = [
      day('2026-07-01', [['💪 Cvičení', 'done']]),
      day('2026-07-02', [['💪 Cvičení', 'missed']]),
      day('2026-07-03', [['💪 Cvičení', 'done']]),
      day('2026-07-04', [['💪 Cvičení', 'unplanned']]),
    ]
    const stats = computeHistoryStats(days)
    expect(stats.overall.successRate).toBeCloseTo(2 / 3)
    expect(stats.overall.totalCheckins).toBe(4)
    expect(stats.overall.doneCount).toBe(2)
    expect(stats.overall.plannedCount).toBe(3)
  })

  test('per-habit current and longest streak', () => {
    const days = [
      day('2026-07-01', [['📖 Čtení', 'done']]),
      day('2026-07-02', [['📖 Čtení', 'done']]),
      day('2026-07-03', [['📖 Čtení', 'missed']]),
      day('2026-07-04', [['📖 Čtení', 'done']]),
      day('2026-07-05', [['📖 Čtení', 'done']]),
      day('2026-07-06', [['📖 Čtení', 'done']]),
    ]
    const stats = computeHistoryStats(days)
    const h = stats.perHabit['📖 Čtení']
    expect(h.currentStreak).toBe(3)
    expect(h.longestStreak).toBe(3) // both runs are length 2 and 3; longest is 3
  })

  test('longest streak can be in the past, distinct from current', () => {
    const days = [
      day('2026-07-01', [['💪 Cvičení', 'done']]),
      day('2026-07-02', [['💪 Cvičení', 'done']]),
      day('2026-07-03', [['💪 Cvičení', 'done']]),
      day('2026-07-04', [['💪 Cvičení', 'done']]),
      day('2026-07-05', [['💪 Cvičení', 'missed']]),
      day('2026-07-06', [['💪 Cvičení', 'done']]),
    ]
    const stats = computeHistoryStats(days)
    const h = stats.perHabit['💪 Cvičení']
    expect(h.currentStreak).toBe(1)
    expect(h.longestStreak).toBe(4)
  })

  test('empty input yields zeroed overall stats and no habits', () => {
    const stats = computeHistoryStats([])
    expect(stats.overall.totalCheckins).toBe(0)
    expect(stats.overall.successRate).toBe(0)
    expect(Object.keys(stats.perHabit)).toHaveLength(0)
  })

  test('unplanned-only history for a habit yields zero streaks without dividing by zero', () => {
    const days = [day('2026-07-01', [['🧠 QA/AI', 'unplanned']])]
    const stats = computeHistoryStats(days)
    const h = stats.perHabit['🧠 QA/AI']
    expect(h.currentStreak).toBe(0)
    expect(h.longestStreak).toBe(0)
  })
})
