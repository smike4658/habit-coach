import type { LogDay, WeekPlan } from './markdown'

export interface Streak {
  /** Consecutive done records counting back from the newest; unplanned/unfilled days are skipped. */
  current: number
  /** Coach rule "nikdy 2× po sobě": the two most recent planned records are both missed. */
  missedTwice: boolean
}

type EffectiveStatus = 'done' | 'missed' | 'excused'

const habitEmoji = (text: string) => text.match(/^\p{Extended_Pictographic}/u)?.[0] ?? null

/**
 * Per habit, effective statuses in chronological order.
 *
 * - Recorded done/missed/excused count; unplanned and unfilled records are neutral.
 * - With a plan: a planned day in the past WITHOUT any record is an implicit miss —
 *   streak měří plnění plánu, nezapsané vynechání ho nesmí přeskočit (bug 2026-07-11).
 *   Today stays neutral (the day is not over), stejně jako budoucí dny.
 * - Excused (⏭️ nemoc/dovolená) is neutral for the count and interrupts a missed+missed pair.
 */
function effectiveHistory(
  days: LogDay[],
  plan: WeekPlan | null | undefined,
  today: Date | undefined,
): Map<string, EffectiveStatus[]> {
  const sorted = [...days].sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0))

  const events = new Map<string, { time: number; status: EffectiveStatus }[]>()
  const recordedDates = new Map<string, Set<number>>() // habit emoji -> day timestamps with any status
  for (const day of sorted) {
    for (const e of day.entries) {
      if (!e.status) continue
      const emoji = habitEmoji(e.habit)
      if (day.date && emoji) {
        if (!recordedDates.has(emoji)) recordedDates.set(emoji, new Set())
        recordedDates.get(emoji)!.add(new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate()).getTime())
      }
      if (e.status !== 'done' && e.status !== 'missed' && e.status !== 'excused') continue
      if (!events.has(e.habit)) events.set(e.habit, [])
      events.get(e.habit)!.push({ time: day.date?.getTime() ?? 0, status: e.status })
    }
  }

  if (plan && today) {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    for (const [i, column] of plan.columns.entries()) {
      const emoji = habitEmoji(column)
      if (!emoji) continue
      // klíč návyku: preferuj existující klíč z logu (např. "💪 Cvičení"), jinak sloupec bez dávky
      const habitKey =
        [...events.keys()].find((k) => k.startsWith(emoji)) ??
        column.replace(/\s*\(.*\)\s*$/, '').trim()
      for (const planDay of plan.days) {
        if (!planDay.date || planDay.items[i] === null) continue
        if (planDay.date >= todayStart) continue
        const dayKey = new Date(
          planDay.date.getFullYear(),
          planDay.date.getMonth(),
          planDay.date.getDate(),
        ).getTime()
        if (recordedDates.get(emoji)?.has(dayKey)) continue
        if (!events.has(habitKey)) events.set(habitKey, [])
        events.get(habitKey)!.push({ time: planDay.date.getTime(), status: 'missed' })
      }
    }
  }

  const history = new Map<string, EffectiveStatus[]>()
  for (const [habit, list] of events) {
    history.set(
      habit,
      list.sort((a, b) => a.time - b.time).map((e) => e.status),
    )
  }
  return history
}

export function computeStreaks(
  days: LogDay[],
  plan?: WeekPlan | null,
  today?: Date,
): Record<string, Streak> {
  const result: Record<string, Streak> = {}
  for (const [habit, statuses] of effectiveHistory(days, plan, today)) {
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
