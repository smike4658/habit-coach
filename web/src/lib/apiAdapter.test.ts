import { describe, expect, test } from 'vitest'
import {
  habitsResponseToViewModels,
  historyResponseToLogDays,
  toApiStatus,
  toWebStatus,
  weekResponseToDashboard,
} from './apiAdapter'
import type { HabitsResponse, HistoryResponse, WeekResponse } from './apiAdapter'

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

describe('status mapping', () => {
  test('excused passes through both directions (DB enum = web name)', () => {
    expect(toApiStatus('excused')).toBe('excused')
    expect(toWebStatus('excused')).toBe('excused')
  })
})

describe('historyResponseToLogDays', () => {
  const HISTORY: HistoryResponse = {
    from: '2026-04-06',
    to: '2026-07-06',
    habits: [
      { slug: 'cviceni', name: 'Cvičení', emoji: '💪', is_reward: false },
      { slug: 'cteni', name: 'Čtení', emoji: '📖', is_reward: false },
    ],
    checkins: [
      { date: '2026-07-06', status: 'done', note: 'šlo to', slug: 'cviceni' },
      { date: '2026-07-06', status: 'skipped', note: null, slug: 'cteni' },
      { date: '2026-07-05', status: 'done', note: null, slug: 'cviceni' },
    ],
    sentences: [
      { date: '2026-07-06', sentence: 'dobrý den' },
      { date: '2026-07-04', sentence: 'jen věta, žádný check-in' },
    ],
    streaks: [],
  }

  test('groups checkins by date into LogDay entries with web status names', () => {
    const days = historyResponseToLogDays(HISTORY)
    expect(days).toHaveLength(3) // 2 dny s check-iny + 1 den jen s větou
    const day6 = days.find((d) => d.date?.getDate() === 6)
    expect(day6?.entries).toEqual([
      { habit: '💪 Cvičení', status: 'done', note: 'šlo to' },
      { habit: '📖 Čtení', status: 'missed', note: '' },
    ])
  })

  test('sorts days chronologically', () => {
    const days = historyResponseToLogDays(HISTORY)
    expect(days[0].date?.getDate()).toBe(4)
    expect(days[1].date?.getDate()).toBe(5)
    expect(days[2].date?.getDate()).toBe(6)
  })

  test('merges sentences into matching days and creates sentence-only days', () => {
    const days = historyResponseToLogDays(HISTORY)
    expect(days.find((d) => d.date?.getDate() === 6)?.sentence).toBe('dobrý den')
    const sentenceOnly = days.find((d) => d.date?.getDate() === 4)
    expect(sentenceOnly?.sentence).toBe('jen věta, žádný check-in')
    expect(sentenceOnly?.entries).toEqual([])
  })
})

describe('habitsResponseToViewModels', () => {
  const HABITS: HabitsResponse = {
    habits: [
      {
        id: '1',
        slug: 'cviceni',
        name: 'Cvičení',
        emoji: '💪',
        dose_text: '10 min',
        frequency_per_week: 3,
        is_reward: false,
        active: true,
      },
      {
        id: '2',
        slug: 'sachy',
        name: 'Šachy',
        emoji: '♟️',
        dose_text: null,
        frequency_per_week: null,
        is_reward: true,
        active: true,
      },
      {
        id: '3',
        slug: 'stary-navyk',
        name: 'Starý návyk',
        emoji: '🕰️',
        dose_text: null,
        frequency_per_week: null,
        is_reward: false,
        active: false,
      },
    ],
  }

  const STREAKS = [
    { slug: 'cviceni', current_streak: 4, missed_twice: false },
    { slug: 'sachy', current_streak: 0, missed_twice: false },
  ]

  test('maps fields and merges streak info by slug', () => {
    const models = habitsResponseToViewModels(HABITS, STREAKS)
    expect(models).toHaveLength(3)
    expect(models[0]).toEqual({
      slug: 'cviceni',
      name: 'Cvičení',
      emoji: '💪',
      doseText: '10 min',
      frequencyPerWeek: 3,
      isReward: false,
      active: true,
      currentStreak: 4,
      missedTwice: false,
    })
  })

  test('defaults streak fields to 0/false when no streak entry found (e.g. archived habit)', () => {
    const models = habitsResponseToViewModels(HABITS, STREAKS)
    const archived = models.find((m) => m.slug === 'stary-navyk')
    expect(archived?.currentStreak).toBe(0)
    expect(archived?.missedTwice).toBe(false)
    expect(archived?.active).toBe(false)
  })

  test('marks reward habits', () => {
    const models = habitsResponseToViewModels(HABITS, STREAKS)
    expect(models.find((m) => m.slug === 'sachy')?.isReward).toBe(true)
  })
})
