import { useState } from 'react'
import type { HeatmapGrid as HeatmapGridData } from '../lib/heatmap'

const WEEKDAY_LABELS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

const LEVEL_CLASS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-white/50 border border-line',
  1: 'bg-done-soft',
  2: 'bg-done/40',
  3: 'bg-done/70',
  4: 'bg-done',
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat('cs-CZ', { month: 'short' }).format(date)
}

export function HeatmapGrid({ grid }: { grid: HeatmapGridData }) {
  const [active, setActive] = useState<{ date: Date; doneCount: number; plannedCount: number } | null>(
    null,
  )

  // Month labels above the first week where the month changes.
  const monthMarkers: (string | null)[] = grid.weeks.map((week, i) => {
    const firstDay = week.find((c) => c !== null)
    if (!firstDay) return null
    if (i === 0) return monthLabel(firstDay.date)
    const prevWeek = grid.weeks[i - 1]
    const prevFirstDay = prevWeek.find((c) => c !== null)
    if (prevFirstDay && prevFirstDay.date.getMonth() !== firstDay.date.getMonth()) {
      return monthLabel(firstDay.date)
    }
    return null
  })

  return (
    <div className="rise" style={{ animationDelay: '0.1s' }}>
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 pt-4">
          {WEEKDAY_LABELS.map((d, i) => (
            <div
              key={d}
              className="flex h-3.5 w-6 items-center font-mono text-[9px] text-ink-faint"
            >
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {grid.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              <div className="h-3 font-mono text-[9px] whitespace-nowrap text-ink-faint">
                {monthMarkers[wi] ?? ''}
              </div>
              {week.map((cell, di) => (
                <button
                  key={di}
                  type="button"
                  disabled={!cell}
                  onClick={() => cell && setActive(cell)}
                  title={
                    cell
                      ? `${cell.date.toLocaleDateString('cs-CZ')} · ${cell.doneCount}/${cell.plannedCount || cell.doneCount} splněno`
                      : undefined
                  }
                  className={`h-3.5 w-3.5 rounded-[3px] transition-transform ${
                    cell ? `${LEVEL_CLASS[cell.level]} hover:scale-125` : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-ink-faint">
        <span>
          {active
            ? `${active.date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })} · ${active.doneCount}/${active.plannedCount || active.doneCount} splněno`
            : 'klepni na den pro detail'}
        </span>
        <span className="flex items-center gap-1">
          méně
          {([0, 1, 2, 3, 4] as const).map((l) => (
            <span key={l} className={`h-3 w-3 rounded-[2px] ${LEVEL_CLASS[l]}`} />
          ))}
          více
        </span>
      </div>
    </div>
  )
}
