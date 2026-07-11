import type { CheckinStatus, LogDay } from '../lib/markdown'

/** Stav z logu pro sloupec plánu — párování podle emoji návyku. */
export function statusForColumn(column: string, log: LogDay | null): CheckinStatus | null {
  const emoji = column.match(/^\p{Extended_Pictographic}/u)?.[0]
  if (!emoji || !log) return null
  return log.entries.find((e) => e.habit.startsWith(emoji))?.status ?? null
}

export const STATUS_BUTTONS: { status: CheckinStatus; mark: string; activeCls: string }[] = [
  { status: 'done', mark: '✅', activeCls: 'bg-done-soft ring-2 ring-done' },
  { status: 'missed', mark: '❌', activeCls: 'bg-miss-soft ring-2 ring-miss' },
  { status: 'unplanned', mark: '➖', activeCls: 'bg-paper-warm ring-2 ring-ink-faint' },
]
