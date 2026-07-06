/** ISO 8601 week id, e.g. "2026-W28". Week belongs to the year of its Thursday. */
export function isoWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum) // Thursday of this week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export function planFileName(date: Date): string {
  return `plans/${isoWeekId(date)}.md`
}

export function logFileName(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `log/${date.getFullYear()}-${m}.md`
}

/** Parse Czech day label like "Po 6.7." into a Date within the given year. */
export function parseDayLabel(label: string, year: number): Date | null {
  const m = label.match(/(\d{1,2})\.\s?(\d{1,2})\./)
  if (!m) return null
  return new Date(year, Number(m[2]) - 1, Number(m[1]))
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
