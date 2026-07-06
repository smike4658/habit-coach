import { parseDayLabel } from './dates.ts'

/** DB enum names (design §3): done / skipped / unplanned. */
export type CheckinStatus = 'done' | 'skipped' | 'unplanned'

export interface PlanDay {
  label: string
  date: Date | null
  /** One item per habit column; null = neplánováno ("—"). */
  items: (string | null)[]
  note: string
  detail: string | null
}

export interface WeekPlan {
  title: string
  columns: string[]
  days: PlanDay[]
}

export interface LogEntry {
  habit: string
  status: CheckinStatus | null
  note: string
}

export interface LogDay {
  label: string
  date: Date | null
  entries: LogEntry[]
  sentence: string
}

const STATUS_MARKS: Record<string, CheckinStatus> = {
  '✅': 'done',
  '❌': 'skipped',
  '➖': 'unplanned',
}

function splitRow(line: string): string[] {
  return line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
}

export function parseWeekPlan(md: string, year: number): WeekPlan {
  const lines = md.split('\n')
  const title = lines.find((l) => l.startsWith('# '))?.slice(2).trim() ?? ''

  let columns: string[] = []
  const days: PlanDay[] = []
  let inTable = false
  for (const line of lines) {
    if (!inTable && /^\|\s*Den\s*\|/.test(line)) {
      columns = splitRow(line).slice(1, -1)
      inTable = true
      continue
    }
    if (!inTable) continue
    if (!line.trim().startsWith('|')) break
    if (/^\|[\s\-|]+\|$/.test(line.trim())) continue
    const cells = splitRow(line)
    days.push({
      label: cells[0],
      date: parseDayLabel(cells[0], year),
      items: cells.slice(1, -1).map((c) => (c === '—' || c === '' ? null : c)),
      note: cells[cells.length - 1] ?? '',
      detail: null,
    })
  }

  const detailRe = /^###\s+(.+?)\s*$/
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(detailRe)
    if (!m) continue
    const day = days.find((d) => m[1].startsWith(d.label))
    if (!day) continue
    const body: string[] = []
    for (let j = i + 1; j < lines.length && !/^#{1,3}\s/.test(lines[j]); j++) body.push(lines[j])
    day.detail = body.join('\n').trim() || null
  }

  return { title, columns, days }
}

export function parseLog(md: string, year: number): { days: LogDay[] } {
  const lines = md.split('\n')
  const days: LogDay[] = []
  let current: LogDay | null = null

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      current = {
        label: heading[1],
        date: parseDayLabel(heading[1], year),
        entries: [],
        sentence: '',
      }
      days.push(current)
      continue
    }
    if (!current) continue
    const item = line.match(/^-\s+(.+?):\s*(.*)$/)
    if (!item) continue
    const [, key, rawValue] = item
    if (key.startsWith('Věta dne')) {
      current.sentence = rawValue.trim()
      continue
    }
    const mark = Object.keys(STATUS_MARKS).find((s) => rawValue.startsWith(s))
    current.entries.push({
      habit: key,
      status: mark ? STATUS_MARKS[mark] : null,
      note: mark ? rawValue.slice(mark.length).trim() : rawValue.trim(),
    })
  }

  return { days }
}
