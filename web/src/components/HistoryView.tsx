import { buildHeatmap } from '../lib/heatmap'
import { computeHistoryStats } from '../lib/historyStats'
import type { LogDay } from '../lib/markdown'
import { HeatmapGrid } from './HeatmapGrid'
import { HistoryStats } from './HistoryStats'

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
            <h2 className="font-mono text-xs tracking-widest text-ink-faint uppercase">
              Historie
            </h2>
            <div className="mt-3 rounded-xl border border-line bg-white/50 px-4 py-4">
              <HeatmapGrid grid={buildHeatmap(logDays, from, to)} />
            </div>
          </section>
          <HistoryStats stats={computeHistoryStats(logDays)} />
        </>
      )}
    </div>
  )
}
