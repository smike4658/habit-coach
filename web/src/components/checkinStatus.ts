import type { CheckinStatus, LogDay } from '../lib/markdown'

/** Stav z logu pro sloupec plánu — párování podle emoji návyku. */
export function statusForColumn(column: string, log: LogDay | null): CheckinStatus | null {
  const emoji = column.match(/^\p{Extended_Pictographic}/u)?.[0]
  if (!emoji || !log) return null
  return log.entries.find((e) => e.habit.startsWith(emoji))?.status ?? null
}

export const STATUS_BUTTONS: {
  status: CheckinStatus
  mark: string
  title: string
  activeCls: string
}[] = [
  { status: 'done', mark: '✅', title: 'splněno', activeCls: 'bg-done-soft ring-2 ring-done' },
  { status: 'missed', mark: '❌', title: 'vynecháno', activeCls: 'bg-miss-soft ring-2 ring-miss' },
  {
    status: 'excused',
    mark: '⏭️',
    title: 'omluveno (nemoc, dovolená) — nezlomí streak',
    activeCls: 'bg-marker/20 ring-2 ring-marker',
  },
  {
    status: 'unplanned',
    mark: '➖',
    title: 'neplánováno',
    activeCls: 'bg-paper-warm ring-2 ring-ink-faint',
  },
]

/** Značka stavu pro zobrazení v přehledech. */
export const STATUS_MARK: Record<CheckinStatus, string> = {
  done: '✅',
  missed: '❌',
  excused: '⏭️',
  unplanned: '➖',
}
