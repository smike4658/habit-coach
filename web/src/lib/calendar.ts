import { sameDay } from './dates'
import type { LogDay } from './markdown'

export type DayAggregateStatus = 'empty' | 'done' | 'partial' | 'missed'

export interface CalendarCell {
  date: Date
  /** false = patří do zobrazeného měsíce; true = přesah z předchozího/následujícího měsíce. */
  outside: boolean
  isToday: boolean
  log: LogDay | null
}

export interface MonthGrid {
  year: number
  /** 0-indexed měsíc (0 = leden). */
  month: number
  /** Týdny pondělí–neděle, vždy 7 buněk; může přesahovat do sousedních měsíců. */
  weeks: CalendarCell[][]
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dow = d.getDay() // 0 = Sunday
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d
}

/** Builds a classic Monday-first month grid (with leading/trailing days from adjacent months). */
export function buildMonthGrid(year: number, month: number, days: LogDay[], today: Date): MonthGrid {
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)
  const gridStart = startOfWeekMonday(firstOfMonth)

  const weeks: CalendarCell[][] = []
  let cursor = new Date(gridStart)
  let week: CalendarCell[] = []

  while (true) {
    const log = days.find((d) => d.date && sameDay(d.date, cursor)) ?? null
    week.push({
      date: new Date(cursor),
      outside: cursor.getMonth() !== month || cursor.getFullYear() !== year,
      isToday: sameDay(cursor, today),
      log,
    })
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
    if (week.length === 7) {
      weeks.push(week)
      week = []
      // Stop once we've completed the week containing the last day of the month.
      const prevDay = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1)
      if (prevDay >= lastOfMonth) break
    }
  }

  return { year, month, weeks }
}

/** Aggregates a day's habit entries (ignoring unplanned) into a single visual status. */
export function dayStatus(log: LogDay | null): DayAggregateStatus {
  if (!log) return 'empty'
  const planned = log.entries.filter((e) => e.status === 'done' || e.status === 'missed')
  if (planned.length === 0) return 'empty'
  const doneCount = planned.filter((e) => e.status === 'done').length
  if (doneCount === planned.length) return 'done'
  if (doneCount === 0) return 'missed'
  return 'partial'
}
