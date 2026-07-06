import { describe, expect, test } from 'vitest'
import { computeStreaks } from './streaks'
import type { LogDay } from './markdown'

function day(dateStr: string, entries: Array<[string, 'done' | 'missed' | 'unplanned' | null]>): LogDay {
  const date = new Date(dateStr)
  return {
    label: `${date.getDate()}.${date.getMonth() + 1}.`,
    date,
    sentence: '',
    entries: entries.map(([habit, status]) => ({ habit, status, note: '' })),
  }
}

describe('computeStreaks', () => {
  test('counts consecutive done days backwards from most recent record', () => {
    const days = [
      day('2026-07-01', [['💪 Cvičení', 'done']]),
      day('2026-07-02', [['💪 Cvičení', 'done']]),
      day('2026-07-03', [['💪 Cvičení', 'done']]),
    ]
    const s = computeStreaks(days)
    expect(s['💪 Cvičení'].current).toBe(3)
  })

  test('unplanned and unfilled days do not break the streak', () => {
    const days = [
      day('2026-07-01', [['📖 Čtení', 'done']]),
      day('2026-07-02', [['📖 Čtení', 'unplanned']]),
      day('2026-07-03', [['📖 Čtení', null]]),
      day('2026-07-04', [['📖 Čtení', 'done']]),
    ]
    expect(computeStreaks(days)['📖 Čtení'].current).toBe(2)
  })

  test('missed day breaks the streak', () => {
    const days = [
      day('2026-07-01', [['💪 Cvičení', 'done']]),
      day('2026-07-02', [['💪 Cvičení', 'missed']]),
      day('2026-07-03', [['💪 Cvičení', 'done']]),
    ]
    expect(computeStreaks(days)['💪 Cvičení'].current).toBe(1)
  })

  test('flags two consecutive misses (coach rule: nikdy 2× po sobě)', () => {
    const days = [
      day('2026-07-01', [['📖 Čtení', 'missed']]),
      day('2026-07-02', [['📖 Čtení', 'unplanned']]),
      day('2026-07-03', [['📖 Čtení', 'missed']]),
    ]
    const s = computeStreaks(days)['📖 Čtení']
    expect(s.current).toBe(0)
    expect(s.missedTwice).toBe(true)
  })

  test('done after miss clears the missedTwice flag', () => {
    const days = [
      day('2026-07-01', [['📖 Čtení', 'missed']]),
      day('2026-07-02', [['📖 Čtení', 'missed']]),
      day('2026-07-03', [['📖 Čtení', 'done']]),
    ]
    expect(computeStreaks(days)['📖 Čtení'].missedTwice).toBe(false)
  })

  test('aggregates across multiple habits and months (sorted by date)', () => {
    const days = [
      day('2026-07-02', [['💪 Cvičení', 'done'], ['📖 Čtení', 'missed']]),
      day('2026-07-01', [['💪 Cvičení', 'done'], ['📖 Čtení', 'done']]),
    ]
    const s = computeStreaks(days)
    expect(s['💪 Cvičení'].current).toBe(2)
    expect(s['📖 Čtení'].current).toBe(0)
    expect(s['📖 Čtení'].missedTwice).toBe(false)
  })
})
