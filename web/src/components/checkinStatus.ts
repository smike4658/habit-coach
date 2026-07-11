import type { CheckinStatus, LogDay } from '../lib/markdown'

/** Stav z logu pro sloupec plánu — párování podle emoji návyku. */
export function statusForColumn(column: string, log: LogDay | null): CheckinStatus | null {
  const emoji = column.match(/^\p{Extended_Pictographic}/u)?.[0]
  if (!emoji || !log) return null
  return log.entries.find((e) => e.habit.startsWith(emoji))?.status ?? null
}

// Stezka pořadí: Projito · Odpočívadlo · Mimo trasu · Sešel z cesty.
// „Sešel z cesty" (selhání) je záměrně vpravo — neakcentovat ho (koučovská filozofie).
export const STATUS_BUTTONS: {
  status: CheckinStatus
  mark: string
  title: string
  activeCls: string
}[] = [
  { status: 'done', mark: '✅', title: 'Projito', activeCls: 'bg-done-soft ring-2 ring-done' },
  {
    status: 'excused',
    mark: '⏭️',
    title: 'Odpočívadlo (nemoc, dovolená) — nezlomí stezku',
    activeCls: 'bg-marker/20 ring-2 ring-marker',
  },
  {
    status: 'unplanned',
    mark: '➖',
    title: 'Mimo trasu (neplánováno)',
    activeCls: 'bg-paper-warm ring-2 ring-ink-faint',
  },
  {
    status: 'missed',
    mark: '❌',
    title: 'Sešel jsem z cesty (vynecháno)',
    activeCls: 'bg-miss-soft ring-2 ring-miss',
  },
]

/** Značka stavu pro zobrazení v přehledech. */
export const STATUS_MARK: Record<CheckinStatus, string> = {
  done: '✅',
  missed: '❌',
  excused: '⏭️',
  unplanned: '➖',
}
