import { useState } from 'react'
import { buildHeatmap } from '../lib/heatmap'
import { computeHistoryStats } from '../lib/historyStats'
import type { LogDay } from '../lib/markdown'
import { CalendarView } from './CalendarView'
import { HeatmapGrid } from './HeatmapGrid'
import { HistoryStats } from './HistoryStats'

type HistoryMode = 'heatmap' | 'calendar'

export function HistoryView({
  logDays,
  loading,
  error,
  from,
  to,
}: {
  logDays: LogDay[] | null
  loading: boolean
  error: string | null
  from: Date
  to: Date
}) {
  const [mode, setMode] = useState<HistoryMode>('heatmap')

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
              {mode === 'heatmap' ? (
                <HeatmapGrid grid={buildHeatmap(logDays, from, to)} />
              ) : (
                <CalendarView logDays={logDays} from={from} to={to} />
              )}
            </div>
          </section>
          <HistoryStats stats={computeHistoryStats(logDays)} />
        </>
      )}
    </div>
  )
}
