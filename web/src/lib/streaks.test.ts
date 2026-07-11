import { describe, expect, test } from 'vitest'
import { computeStreaks } from './streaks'
import type { LogDay, WeekPlan } from './markdown'

function day(
  dateStr: string,
  entries: Array<[string, 'done' | 'missed' | 'unplanned' | 'excused' | null]>,
): LogDay {
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

  test('excused day does not break the streak (nemoc ≠ selhání)', () => {
    const days = [
      day('2026-07-01', [['💪 Cvičení', 'done']]),
      day('2026-07-02', [['💪 Cvičení', 'excused']]),
      day('2026-07-03', [['💪 Cvičení', 'done']]),
    ]
    expect(computeStreaks(days)['💪 Cvičení'].current).toBe(2)
  })

  test('trailing excused keeps the streak alive', () => {
    const days = [
      day('2026-07-01', [['💪 Cvičení', 'done']]),
      day('2026-07-02', [['💪 Cvičení', 'done']]),
      day('2026-07-03', [['💪 Cvičení', 'excused']]),
    ]
    expect(computeStreaks(days)['💪 Cvičení'].current).toBe(2)
  })

  test('excused between two misses interrupts the "2× po sobě" pair', () => {
    const days = [
      day('2026-07-01', [['📖 Čtení', 'missed']]),
      day('2026-07-02', [['📖 Čtení', 'excused']]),
      day('2026-07-03', [['📖 Čtení', 'missed']]),
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

describe('computeStreaks with plan — nezaznamenaný plánovaný den = implicitní vynechání', () => {
  // Reálný případ z 11.7.: plán Po/St/Pá, záznam jen Po ✅ a So ✅ —
  // streak nesmí být 2, protože St a Pá zůstaly bez záznamu.
  const PLAN: WeekPlan = {
    title: '2026-W28',
    columns: ['💪 Cvičení (10 min)'],
    days: [
      { label: 'Po 6.7.', date: new Date(2026, 6, 6), items: ['Trénink A'], note: '', detail: null },
      { label: 'Út 7.7.', date: new Date(2026, 6, 7), items: [null], note: '', detail: null },
      { label: 'St 8.7.', date: new Date(2026, 6, 8), items: ['Trénink B'], note: '', detail: null },
      { label: 'Čt 9.7.', date: new Date(2026, 6, 9), items: [null], note: '', detail: null },
      { label: 'Pá 10.7.', date: new Date(2026, 6, 10), items: ['Trénink A'], note: '', detail: null },
      { label: 'So 11.7.', date: new Date(2026, 6, 11), items: [null], note: '', detail: null },
    ],
  }
  const today = new Date(2026, 6, 11, 14, 0)

  test('unrecorded planned days in the past break the streak', () => {
    const days = [
      day('2026-07-06', [['💪 Cvičení', 'done']]),
      day('2026-07-11', [['💪 Cvičení', 'done']]),
    ]
    expect(computeStreaks(days, PLAN, today)['💪 Cvičení'].current).toBe(1)
  })

  test('two unrecorded planned days in a row trigger missedTwice', () => {
    const days = [day('2026-07-06', [['💪 Cvičení', 'done']])]
    const s = computeStreaks(days, PLAN, today)['💪 Cvičení']
    expect(s.current).toBe(0)
    expect(s.missedTwice).toBe(true)
  })

  test("today's planned habit without a record stays neutral (day is not over)", () => {
    const planWithToday: WeekPlan = {
      ...PLAN,
      days: PLAN.days.map((d) =>
        d.label === 'So 11.7.' ? { ...d, items: ['Trénink B'] } : d,
      ),
    }
    const days = [
      day('2026-07-08', [['💪 Cvičení', 'done']]),
      day('2026-07-10', [['💪 Cvičení', 'done']]),
    ]
    expect(computeStreaks(days, planWithToday, today)['💪 Cvičení'].current).toBe(2)
  })

  test('excused record on a planned day keeps the streak (no implicit miss)', () => {
    const days = [
      day('2026-07-06', [['💪 Cvičení', 'done']]),
      day('2026-07-08', [['💪 Cvičení', 'excused']]),
      day('2026-07-10', [['💪 Cvičení', 'done']]),
    ]
    expect(computeStreaks(days, PLAN, today)['💪 Cvičení'].current).toBe(2)
  })

  test('without plan the behaviour stays record-only (backwards compatible)', () => {
    const days = [
      day('2026-07-06', [['💪 Cvičení', 'done']]),
      day('2026-07-11', [['💪 Cvičení', 'done']]),
    ]
    expect(computeStreaks(days)['💪 Cvičení'].current).toBe(2)
  })
})
