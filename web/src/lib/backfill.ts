import { sameDay } from './dates'
import type { LogDay, WeekPlan } from './markdown'

/** Stav z logu pro sloupec plánu — párování podle emoji návyku (stejně jako TodayCard). */
function statusForColumn(column: string, log: LogDay | null) {
  const emoji = column.match(/^\p{Extended_Pictographic}/u)?.[0]
  if (!emoji || !log) return null
  return log.entries.find((e) => e.habit.startsWith(emoji))?.status ?? null
}

/** Sloupce plánované na daný den, které v logu nemají žádný stav. */
export function missingColumnsFor(plan: WeekPlan, log: LogDay | null, date: Date): string[] {
  const day = plan.days.find((d) => d.date && sameDay(d.date, date))
  if (!day) return []
  return plan.columns.filter((col, i) => day.items[i] !== null && !statusForColumn(col, log))
}

export interface BackfillGap {
  date: Date
  missing: string[]
}

/** Včerejší mezera v logu: den je v plánu a aspoň jeden plánovaný návyk nemá záznam. */
export function yesterdayGap(
  plan: WeekPlan | null,
  logDays: LogDay[],
  now: Date,
): BackfillGap | null {
  if (!plan) return null
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const log = logDays.find((d) => d.date && sameDay(d.date, yesterday)) ?? null
  const missing = missingColumnsFor(plan, log, yesterday)
  return missing.length > 0 ? { date: yesterday, missing } : null
}
