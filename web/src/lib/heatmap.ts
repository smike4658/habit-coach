import { sameDay } from './dates'
import type { LogDay } from './markdown'

export interface HeatmapCell {
  date: Date
  /** Počet návyků splněných (status "done") tento den. */
  doneCount: number
  /** Počet plánovaných záznamů tento den (done + missed, ne unplanned). */
  plannedCount: number
  /** Bucket 0–4 pro barevnou škálu (0 = žádný splněný návyk). */
  level: 0 | 1 | 2 | 3 | 4
  log: LogDay | null
}

export interface HeatmapGrid {
  /** Týdny pondělí–neděle; buňky mimo [from, to] jsou null (zarovnání mřížky). */
  weeks: (HeatmapCell | null)[][]
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dow = d.getDay() // 0 = Sunday
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d
}

function level(doneCount: number): HeatmapCell['level'] {
  if (doneCount <= 0) return 0
  if (doneCount === 1) return 1
  if (doneCount === 2) return 2
  if (doneCount === 3) return 3
  return 4
}

/** Builds a GitHub-style week x day grid for [from, to] (inclusive), aligned to Monday-start weeks. */
export function buildHeatmap(days: LogDay[], from: Date, to: Date): HeatmapGrid {
  const gridStart = startOfWeekMonday(from)
  const weeks: (HeatmapCell | null)[][] = []

  let cursor = new Date(gridStart)
  let week: (HeatmapCell | null)[] = []
  while (cursor <= to || week.length > 0) {
    if (cursor < from || cursor > to) {
      week.push(null)
    } else {
      const log = days.find((d) => d.date && sameDay(d.date, cursor)) ?? null
      const statuses = log?.entries.map((e) => e.status) ?? []
      const doneCount = statuses.filter((s) => s === 'done').length
      const plannedCount = statuses.filter((s) => s === 'done' || s === 'missed').length
      week.push({
        date: new Date(cursor),
        doneCount,
        plannedCount,
        level: level(doneCount),
        log,
      })
    }
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
    if (cursor > to && week.length === 0) break
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  return { weeks }
}
