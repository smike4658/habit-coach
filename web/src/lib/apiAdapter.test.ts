import { describe, expect, test } from 'vitest'
import { weekResponseToDashboard } from './apiAdapter'
import type { WeekResponse } from './apiAdapter'

const WEEK: WeekResponse = {
  iso: '2026-W28',
  days: [
    {
      week_iso: '2026-W28',
      day_date: '2026-07-06',
      items: {
        label: 'Po 6.7.',
        note: 'první den',
        detail: 'Číst best practices.',
        items: [
          { slug: 'cviceni', column: '💪 Cvičení (10 min)', text: 'Trénink A' },
          { slug: 'cteni', column: '📖 Čtení (15 min)', text: 'Zaklínač' },
          { slug: 'qa-ai', column: '🧠 QA/AI', text: null },
        ],
      },
    },
    {
      week_iso: '2026-W28',
      day_date: '2026-07-07',
      items: {
        label: 'Út 7.7.',
        note: '',
        detail: null,
        items: [
          { slug: 'cviceni', column: '💪 Cvičení (10 min)', text: null },
          { slug: 'cteni', column: '📖 Čtení (15 min)', text: 'Zaklínač' },
          { slug: 'qa-ai', column: '🧠 QA/AI', text: 'PW den 2' },
        ],
      },
    },
  ],
  checkins: [
    { date: '2026-07-06', status: 'done', note: 'šlo to', source: 'web', habits: { slug: 'cviceni' } },
    { date: '2026-07-06', status: 'skipped', note: null, source: 'web', habits: { slug: 'cteni' } },
  ],
  streaks: [
    { slug: 'cviceni', emoji: '💪', name: 'Cvičení', current_streak: 3, missed_twice: false, is_reward: false },
    { slug: 'cteni', emoji: '📖', name: 'Čtení', current_streak: 0, missed_twice: true, is_reward: false },
    { slug: 'sachy', emoji: '♟️', name: 'Šachy', current_streak: 0, missed_twice: false, is_reward: true },
  ],
}

describe('weekResponseToDashboard', () => {
  const now = new Date(2026, 6, 6)
  const dash = weekResponseToDashboard(WEEK, now)

  test('builds plan with columns from items and day rows', () => {
    expect(dash.plan?.columns).toEqual([
      '💪 Cvičení (10 min)',
      '📖 Čtení (15 min)',
      '🧠 QA/AI',
    ])
    expect(dash.plan?.days).toHaveLength(2)
    expect(dash.plan?.days[0].items).toEqual(['Trénink A', 'Zaklínač', null])
    expect(dash.plan?.days[0].date?.getDate()).toBe(6)
    expect(dash.plan?.days[0].detail).toBe('Číst best practices.')
  })

  test('finds today and builds todayLog with web status names', () => {
    expect(dash.today?.label).toBe('Po 6.7.')
    expect(dash.todayLog?.entries).toEqual([
      { habit: '💪 Cvičení', status: 'done', note: 'šlo to' },
      { habit: '📖 Čtení', status: 'missed', note: '' },
    ])
  })

  test('maps streaks to emoji-name keys, excludes reward habits', () => {
    expect(dash.streaks['💪 Cvičení']).toEqual({ current: 3, missedTwice: false })
    expect(dash.streaks['📖 Čtení']).toEqual({ current: 0, missedTwice: true })
    expect(dash.streaks['♟️ Šachy']).toBeUndefined()
  })

  test('maps plan columns to habit slugs for checkin calls', () => {
    expect(dash.slugByColumn).toEqual({
      '💪 Cvičení (10 min)': 'cviceni',
      '📖 Čtení (15 min)': 'cteni',
      '🧠 QA/AI': 'qa-ai',
    })
  })

  test('builds logDays for the week table', () => {
    const monday = dash.logDays.find((d) => d.date?.getDate() === 6)
    expect(monday?.entries.find((e) => e.habit.startsWith('💪'))?.status).toBe('done')
  })
})
