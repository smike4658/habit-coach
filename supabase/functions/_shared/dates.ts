const WEEKDAYS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']

/** Day label in the coach's log format, e.g. "Po 6.7." */
export function dayLabelFor(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}.`
}

/** ISO 8601 week id, e.g. "2026-W28". */
export function isoWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
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

/** Local date in Europe/Prague regardless of server timezone. */
export function pragueToday(now = new Date()): Date {
  const s = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Prague' })
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}
