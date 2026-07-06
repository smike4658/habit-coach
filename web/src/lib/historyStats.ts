import type { LogDay } from './markdown'

export interface OverallStats {
  totalCheckins: number
  doneCount: number
  /** done + missed, tj. dny, kdy byl návyk plánovaný a měl výsledek (bez unplanned). */
  plannedCount: number
  /** doneCount / plannedCount, 0 když nic nebylo plánováno. */
  successRate: number
}

export interface HabitStats {
  currentStreak: number
  longestStreak: number
}

export interface HistoryStats {
  overall: OverallStats
  perHabit: Record<string, HabitStats>
}

/** Aggregates success rate + per-habit streaks over a set of log days (any date range). */
export function computeHistoryStats(days: LogDay[]): HistoryStats {
  const sorted = [...days].sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0))

  let doneCount = 0
  let plannedCount = 0
  let totalCheckins = 0

  const history = new Map<string, ('done' | 'missed')[]>()
  for (const day of sorted) {
    for (const e of day.entries) {
      if (!e.status) continue
      totalCheckins++
      if (!history.has(e.habit)) history.set(e.habit, [])
      if (e.status === 'done') doneCount++
      if (e.status === 'done' || e.status === 'missed') {
        plannedCount++
        history.get(e.habit)!.push(e.status)
      }
    }
  }

  const perHabit: Record<string, HabitStats> = {}
  for (const [habit, statuses] of history) {
    let current = 0
    for (let i = statuses.length - 1; i >= 0 && statuses[i] === 'done'; i--) current++

    let longest = 0
    let run = 0
    for (const s of statuses) {
      run = s === 'done' ? run + 1 : 0
      if (run > longest) longest = run
    }

    perHabit[habit] = { currentStreak: current, longestStreak: longest }
  }

  return {
    overall: {
      totalCheckins,
      doneCount,
      plannedCount,
      successRate: plannedCount > 0 ? doneCount / plannedCount : 0,
    },
    perHabit,
  }
}
