import { describe, expect, test } from 'vitest'
import { computeAchievements } from './achievements'
import type { CheckinStatus, LogDay } from './markdown'

const TODAY = new Date(2026, 6, 11)

function day(dateStr: string, entries: Array<[string, CheckinStatus | null]>): LogDay {
  const [y, m, d] = dateStr.split('-').map(Number)
  return {
    label: dateStr,
    date: new Date(y, m - 1, d),
    sentence: '',
    entries: entries.map(([habit, status]) => ({ habit, status, note: '' })),
  }
}

/** N po sobě jdoucích dní končících endDate, každý s jedním done záznamem. */
function run(endDate: Date, n: number, habit = '💪 Cvičení'): LogDay[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - (n - 1 - i))
    return day(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, [[habit, 'done']])
  })
}

function earned(days: LogDay[], id: string): boolean {
  return computeAchievements(days, TODAY).find((a) => a.id === id)!.earned
}

describe('computeAchievements — záznamové řady (kontinuita zápisu)', () => {
  test('7 dní v řadě se záznamem = První orbita; 6 nestačí', () => {
    expect(earned(run(TODAY, 7), 'prvni-orbita')).toBe(true)
    expect(earned(run(TODAY, 6), 'prvni-orbita')).toBe(false)
  })

  test('mezera v kalendáři řadu přeruší', () => {
    const days = [...run(new Date(2026, 6, 5), 4), ...run(TODAY, 4)] // 2.–5.7. + 8.–11.7.
    expect(earned(days, 'prvni-orbita')).toBe(false)
  })

  test('řada se počítá i v minulosti (nemusí končit dneškem)', () => {
    expect(earned(run(new Date(2026, 5, 20), 7), 'prvni-orbita')).toBe(true)
  })

  test('30 dní = Měsíc na orbitě, 100 dní = Deep space', () => {
    expect(earned(run(TODAY, 30), 'mesic-na-orbite')).toBe(true)
    expect(earned(run(TODAY, 29), 'mesic-na-orbite')).toBe(false)
    expect(earned(run(TODAY, 100), 'deep-space')).toBe(true)
  })

  test('den s jakýmkoli vyplněným stavem se počítá jako záznam, nevyplněný ne', () => {
    const days = [
      ...run(new Date(2026, 6, 9), 5),
      day('2026-7-10', [['💪 Cvičení', 'missed']]),
      day('2026-7-11', [['💪 Cvičení', null]]),
    ]
    expect(earned(days, 'prvni-orbita')).toBe(false) // 10.7. missed počítá se, 11.7. null ne → řada 6
    const withExcused = [...days.slice(0, -1), day('2026-7-11', [['💪 Cvičení', 'excused']])]
    expect(earned(withExcused, 'prvni-orbita')).toBe(true)
  })
})

describe('computeAchievements — Comeback', () => {
  test('❌ následované ✅ hned další den u stejného návyku', () => {
    const days = [
      day('2026-7-9', [['📖 Čtení', 'missed']]),
      day('2026-7-10', [['📖 Čtení', 'done']]),
    ]
    expect(earned(days, 'comeback')).toBe(true)
  })

  test('✅ u jiného návyku nebo ob den se nepočítá', () => {
    const otherHabit = [
      day('2026-7-9', [['📖 Čtení', 'missed']]),
      day('2026-7-10', [['💪 Cvičení', 'done']]),
    ]
    expect(earned(otherHabit, 'comeback')).toBe(false)
    const gap = [
      day('2026-7-8', [['📖 Čtení', 'missed']]),
      day('2026-7-10', [['📖 Čtení', 'done']]),
    ]
    expect(earned(gap, 'comeback')).toBe(false)
  })
})

describe('computeAchievements — Stabilní orbita (28 dní bez 2× po sobě)', () => {
  test('28+ dní dat bez dvou missed po sobě u téhož návyku', () => {
    const days = run(TODAY, 30)
    days[10] = day('2026-6-22', [['💪 Cvičení', 'missed']]) // ojedinělé vynechání nevadí
    expect(earned(days, 'stabilni-orbita')).toBe(true)
  })

  test('dva missed po sobě v posledních 28 dnech = neuděleno', () => {
    const days = run(TODAY, 30)
    days[20] = day('2026-7-2', [['💪 Cvičení', 'missed']])
    days[21] = day('2026-7-3', [['💪 Cvičení', 'missed']])
    expect(earned(days, 'stabilni-orbita')).toBe(false)
  })

  test('málo dat (méně než 28 dní historie) = neuděleno', () => {
    expect(earned(run(TODAY, 10), 'stabilni-orbita')).toBe(false)
  })
})

describe('computeAchievements — tvar výsledku', () => {
  test('vrací všech 5 odznaků ve stabilním pořadí s emoji a popisem', () => {
    const all = computeAchievements([], TODAY)
    expect(all.map((a) => a.id)).toEqual([
      'prvni-orbita',
      'stabilni-orbita',
      'comeback',
      'mesic-na-orbite',
      'deep-space',
    ])
    for (const a of all) {
      expect(a.emoji).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.desc).toBeTruthy()
      expect(a.earned).toBe(false)
    }
  })
})
