import { useMemo, useState } from 'react'
import { buildMonthGrid, dayStatus } from '../lib/calendar'
import type { DayAggregateStatus } from '../lib/calendar'
import type { CheckinStatus, LogDay } from '../lib/markdown'
import { STATUS_BUTTONS, statusForColumn } from './checkinStatus'

const WEEKDAY_LABELS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

const STATUS_DOT_CLASS: Record<DayAggregateStatus, string> = {
  empty: 'bg-line/50',
  done: 'bg-done',
  partial: 'bg-marker',
  missed: 'bg-miss',
}

function monthTitle(year: number, month: number): string {
  const label = new Intl.DateTimeFormat('cs-CZ', { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  )
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function splitHabit(habit: string): [string, string] {
  const m = habit.match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/u)
  return m ? [m[1], m[2]] : ['•', habit]
}

export function CalendarView({
  logDays,
  from,
  to,
  columns,
  onCheckin,
  saving = false,
  initialSelected = null,
}: {
  logDays: LogDay[]
  from: Date
  to: Date
  /** Sloupce plánu pro editaci minulých dnů; bez nich je detail jen ke čtení. */
  columns?: string[] | null
  onCheckin?: (date: Date, column: string, status: CheckinStatus) => void
  saving?: boolean
  initialSelected?: Date | null
}) {
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(() => {
    const base = initialSelected ?? today
    return { year: base.getFullYear(), month: base.getMonth() }
  })
  const [selected, setSelected] = useState<Date | null>(initialSelected)

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month, logDays, today),
    [cursor, logDays, today],
  )

  const minMonth = from.getFullYear() * 12 + from.getMonth()
  const maxMonth = to.getFullYear() * 12 + to.getMonth()
  const curMonthIdx = cursor.year * 12 + cursor.month
  const canGoPrev = curMonthIdx > minMonth
  const canGoNext = curMonthIdx < maxMonth

  const goPrev = () =>
    canGoPrev &&
    setCursor((c) => {
      const m = c.year * 12 + c.month - 1
      return { year: Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  const goNext = () =>
    canGoNext &&
    setCursor((c) => {
      const m = c.year * 12 + c.month + 1
      return { year: Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })

  const selectedCell = selected
    ? grid.weeks.flat().find((c) => c.date.getTime() === selected.getTime())
    : null

  // Editace: jen dny do dneška včetně, a jen když je odkud vzít sloupce plánu a kam zapsat.
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const editable = Boolean(
    onCheckin && columns?.length && selectedCell && selectedCell.date < tomorrow,
  )
  const columnEmoji = (col: string) => col.match(/^\p{Extended_Pictographic}/u)?.[0]
  const extraEntries =
    selectedCell?.log?.entries.filter(
      (e) => !(columns ?? []).some((c) => columnEmoji(c) && e.habit.startsWith(columnEmoji(c)!)),
    ) ?? []

  return (
    <div className="rise" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="rounded-lg border border-line bg-white/60 px-2.5 py-1 text-sm transition-transform active:scale-95 disabled:opacity-30"
        >
          ←
        </button>
        <span className="font-display text-sm font-bold">{monthTitle(cursor.year, cursor.month)}</span>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="rounded-lg border border-line bg-white/60 px-2.5 py-1 text-sm transition-transform active:scale-95 disabled:opacity-30"
        >
          →
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center font-mono text-[10px] text-ink-faint">
            {d}
          </div>
        ))}
        {grid.weeks.flat().map((cell) => {
          const status = dayStatus(cell.log)
          const isSelected = selected && cell.date.getTime() === selected.getTime()
          return (
            <button
              key={cell.date.toISOString()}
              type="button"
              onClick={() => setSelected(cell.date)}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-xs transition-colors ${
                cell.outside
                  ? 'border-transparent text-ink-faint/50'
                  : 'border-line bg-white/40 text-ink-soft hover:bg-white/70'
              } ${cell.isToday ? 'border-ink font-bold text-ink' : ''} ${
                isSelected ? 'ring-2 ring-ink/60' : ''
              }`}
            >
              <span className="tabular-nums">{cell.date.getDate()}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[status]}`} />
            </button>
          )
        })}
      </div>

      <div className="mt-3 rounded-xl border border-line bg-white/50 px-4 py-3 text-sm">
        {selectedCell ? (
          <>
            <div className="font-mono text-xs text-ink-faint">
              {selectedCell.date.toLocaleDateString('cs-CZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
            {editable ? (
              <ul className="mt-2 flex flex-col gap-1">
                {columns!.map((col) => {
                  const status = statusForColumn(col, selectedCell.log)
                  const [emoji, name] = splitHabit(col)
                  return (
                    <li key={col} className="flex items-center gap-2">
                      <span className="text-base leading-none">{emoji}</span>
                      <span className="flex-1 truncate text-ink-soft">{name}</span>
                      <span className="flex shrink-0 gap-1">
                        {STATUS_BUTTONS.map((b) => (
                          <button
                            key={b.status}
                            type="button"
                            disabled={saving}
                            onClick={() => onCheckin!(selectedCell.date, col, b.status)}
                            title={b.status}
                            className={`rounded-lg px-1.5 py-1 text-sm transition-transform active:scale-90 disabled:opacity-40 ${
                              status === b.status ? b.activeCls : 'opacity-45 hover:opacity-100'
                            }`}
                          >
                            {b.mark}
                          </button>
                        ))}
                      </span>
                    </li>
                  )
                })}
                {extraEntries.map((e, i) => {
                  const [emoji, name] = splitHabit(e.habit)
                  return (
                    <li key={`extra-${i}`} className="flex items-center gap-2">
                      <span className="text-base leading-none">{emoji}</span>
                      <span className="flex-1 truncate text-ink-soft">{name}</span>
                      <span>{e.status === 'done' ? '✅' : e.status === 'missed' ? '❌' : '➖'}</span>
                    </li>
                  )
                })}
              </ul>
            ) : selectedCell.log && selectedCell.log.entries.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1">
                {selectedCell.log.entries.map((e, i) => {
                  const [emoji, name] = splitHabit(e.habit)
                  return (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-base leading-none">{emoji}</span>
                      <span className="flex-1 truncate text-ink-soft">{name}</span>
                      <span>{e.status === 'done' ? '✅' : e.status === 'missed' ? '❌' : '➖'}</span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="mt-2 text-ink-faint">Žádné záznamy tento den.</p>
            )}
            {selectedCell.log?.sentence && (
              <p className="mt-2 border-t border-line/60 pt-2 text-ink-soft italic">
                „{selectedCell.log.sentence}“
              </p>
            )}
          </>
        ) : (
          <p className="text-ink-faint">Klepni na den pro detail.</p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-end gap-3 font-mono text-[10px] text-ink-faint">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-done" /> splněno
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-marker" /> částečně
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-miss" /> vynecháno
        </span>
      </div>
    </div>
  )
}
