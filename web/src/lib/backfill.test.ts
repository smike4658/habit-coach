import { describe, expect, test } from 'vitest'
import { missingColumnsFor, yesterdayGap } from './backfill'
import type { LogDay, WeekPlan } from './markdown'

const PLAN: WeekPlan = {
  title: 'Týden 2026-W28',
  columns: ['💪 Cvičení (10 min)', '📖 Čtení (15 min)', '🧠 QA/AI (15 min)'],
  days: [
    {
      label: 'Čt 9.7.',
      date: new Date(2026, 6, 9),
      items: ['Trénink A', 'Zaklínač', null], // QA/AI ten den neplánováno
      note: '',
      detail: null,
    },
    {
      label: 'Pá 10.7.',
      date: new Date(2026, 6, 10),
      items: ['Trénink B', 'Zaklínač', 'PW den 4'],
      note: '',
      detail: null,
    },
  ],
}

function logDay(date: Date, entries: LogDay['entries']): LogDay {
  return { label: '', date, entries, sentence: '' }
}

describe('missingColumnsFor', () => {
  test('returns planned columns without a log status for the date', () => {
    const log = logDay(new Date(2026, 6, 10), [
      { habit: '💪 Cvičení', status: 'done', note: '' },
    ])
    expect(missingColumnsFor(PLAN, log, new Date(2026, 6, 10))).toEqual([
      '📖 Čtení (15 min)',
      '🧠 QA/AI (15 min)',
    ])
  })

  test('skips columns that are not planned that day', () => {
    expect(missingColumnsFor(PLAN, null, new Date(2026, 6, 9))).toEqual([
      '💪 Cvičení (10 min)',
      '📖 Čtení (15 min)',
    ])
  })

  test('returns empty when every planned column has a status', () => {
    const log = logDay(new Date(2026, 6, 9), [
      { habit: '💪 Cvičení', status: 'done', note: '' },
      { habit: '📖 Čtení', status: 'missed', note: '' },
    ])
    expect(missingColumnsFor(PLAN, log, new Date(2026, 6, 9))).toEqual([])
  })

  test('returns empty for a date outside the plan', () => {
    expect(missingColumnsFor(PLAN, null, new Date(2026, 6, 8))).toEqual([])
  })
})

describe('yesterdayGap', () => {
  const now = new Date(2026, 6, 11, 9, 30) // So 11.7. dopoledne

  test('returns yesterday and missing columns when the log has gaps', () => {
    const gap = yesterdayGap(PLAN, [], now)
    expect(gap?.date.getDate()).toBe(10)
    expect(gap?.missing).toHaveLength(3)
  })

  test('returns null when yesterday is fully logged', () => {
    const logs = [
      logDay(new Date(2026, 6, 10), [
        { habit: '💪 Cvičení', status: 'done', note: '' },
        { habit: '📖 Čtení', status: 'done', note: '' },
        { habit: '🧠 QA/AI', status: 'missed', note: '' },
      ]),
    ]
    expect(yesterdayGap(PLAN, logs, now)).toBeNull()
  })

  test('returns null without a plan or without a plan row for yesterday', () => {
    expect(yesterdayGap(null, [], now)).toBeNull()
    expect(yesterdayGap(PLAN, [], new Date(2026, 6, 9))).toBeNull() // včera 8.7. mimo plán
  })
})
