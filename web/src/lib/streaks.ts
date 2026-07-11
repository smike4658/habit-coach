import type { LogDay } from './markdown'

export interface Streak {
  /** Consecutive done records counting back from the newest; unplanned/unfilled days are skipped. */
  current: number
  /** Coach rule "nikdy 2× po sobě": the two most recent planned records are both missed. */
  missedTwice: boolean
}

export function computeStreaks(days: LogDay[]): Record<string, Streak> {
  const sorted = [...days].sort(
    (a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0),
  )

  // Per habit, statuses of recorded days (done/missed/excused) in chronological order.
  // Excused (⏭️ nemoc/dovolená) is neutral: skipped for the streak count, and it
  // interrupts a missed+missed pair (the coach rule targets unexcused misses in a row).
  const history = new Map<string, ('done' | 'missed' | 'excused')[]>()
  for (const day of sorted) {
    for (const e of day.entries) {
      if (e.status !== 'done' && e.status !== 'missed' && e.status !== 'excused') continue
      if (!history.has(e.habit)) history.set(e.habit, [])
      history.get(e.habit)!.push(e.status)
    }
  }

  const result: Record<string, Streak> = {}
  for (const [habit, statuses] of history) {
    let current = 0
    for (let i = statuses.length - 1; i >= 0; i--) {
      if (statuses[i] === 'excused') continue
      if (statuses[i] !== 'done') break
      current++
    }
    const missedTwice =
      statuses.length >= 2 &&
      statuses[statuses.length - 1] === 'missed' &&
      statuses[statuses.length - 2] === 'missed'
    result[habit] = { current, missedTwice }
  }
  return result
}
