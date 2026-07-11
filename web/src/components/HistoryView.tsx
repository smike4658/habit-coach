import { useState } from 'react'
import { buildHeatmap } from '../lib/heatmap'
import { computeHistoryStats } from '../lib/historyStats'
import type { CheckinStatus, LogDay } from '../lib/markdown'
import { AchievementsRow } from './AchievementsRow'
import { CalendarView } from './CalendarView'
import { HeatmapGrid } from './HeatmapGrid'
import { HistoryStats } from './HistoryStats'

type HistoryMode = 'heatmap' | 'calendar' | 'sentences'

/** Deník vět dne — nejnovější nahoře. Michal si pamatuje psaním; tohle je ta stopa. */
function SentencesTimeline({ logDays }: { logDays: LogDay[] }) {
  const withSentence = logDays
    .filter((d) => d.date && d.sentence)
    .sort((a, b) => b.date!.getTime() - a.date!.getTime())

  if (withSentence.length === 0) {
    return <p className="text-sm text-ink-faint">Zatím žádné věty dne. Večer jedna věta stačí.</p>
  }
  return (
    <ul className="flex flex-col gap-2">
      {withSentence.map((d) => (
        <li key={d.date!.toISOString()} className="flex gap-3 text-sm">
          <span className="w-14 shrink-0 pt-0.5 text-right font-mono text-[10px] text-ink-faint">
            {d.date!.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
          </span>
          <span className="text-ink-soft italic">„{d.sentence}“</span>
        </li>
      ))}
    </ul>
  )
}

export function HistoryView({
  logDays,
  loading,
  error,
  from,
  to,
  columns,
  onCheckin,
  saving = false,
  focusDate = null,
}: {
  logDays: LogDay[] | null
  loading: boolean
  error: string | null
  from: Date
  to: Date
  columns?: string[] | null
  onCheckin?: (date: Date, column: string, status: CheckinStatus) => void
  saving?: boolean
  /** Den k rovnou otevření v kalendáři (zkratka „Doplnit včerejšek"). */
  focusDate?: Date | null
}) {
  const [mode, setMode] = useState<HistoryMode>(focusDate ? 'calendar' : 'heatmap')

  return (
    <div className="mt-8 flex flex-col gap-8">
      {error && (
        <div className="rounded-xl border border-miss bg-miss-soft px-5 py-4 text-sm text-miss">
          Načtení historie selhalo: {error}
        </div>
      )}
      {loading && !logDays && <p className="text-sm text-ink-faint">Načítám historii…</p>}
      {logDays && (
        <>
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs tracking-widest text-ink-faint uppercase">
                Historie
              </h2>
              <div className="flex gap-1 rounded-lg border border-line bg-white/50 p-0.5">
                {(
                  [
                    { id: 'heatmap' as const, label: 'Heatmapa' },
                    { id: 'calendar' as const, label: 'Kalendář' },
                    { id: 'sentences' as const, label: 'Věty' },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      mode === opt.id ? 'bg-ink text-paper' : 'text-ink-faint hover:text-ink-soft'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-line bg-white/50 px-4 py-4">
              {mode === 'heatmap' && <HeatmapGrid grid={buildHeatmap(logDays, from, to)} />}
              {mode === 'calendar' && (
                <CalendarView
                  logDays={logDays}
                  from={from}
                  to={to}
                  columns={columns}
                  onCheckin={onCheckin}
                  saving={saving}
                  initialSelected={focusDate}
                />
              )}
              {mode === 'sentences' && <SentencesTimeline logDays={logDays} />}
            </div>
          </section>
          <AchievementsRow logDays={logDays} />
          <HistoryStats stats={computeHistoryStats(logDays)} />
        </>
      )}
    </div>
  )
}
