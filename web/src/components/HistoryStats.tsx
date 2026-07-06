import type { HistoryStats as HistoryStatsData } from '../lib/historyStats'

function splitHabit(habit: string): [string, string] {
  const m = habit.match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/u)
  return m ? [m[1], m[2]] : ['•', habit]
}

export function HistoryStats({ stats }: { stats: HistoryStatsData }) {
  const habitEntries = Object.entries(stats.perHabit).filter(([habit]) => !habit.includes('bonus'))
  const pct = Math.round(stats.overall.successRate * 100)

  return (
    <section className="rise" style={{ animationDelay: '0.2s' }}>
      <h2 className="font-mono text-xs tracking-widest text-ink-faint uppercase">Statistiky</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-white/50 px-4 py-3">
          <div className="font-display text-3xl font-black tabular-nums">{pct}%</div>
          <div className="mt-1 text-xs text-ink-soft">celková úspěšnost</div>
        </div>
        <div className="rounded-xl border border-line bg-white/50 px-4 py-3">
          <div className="font-display text-3xl font-black tabular-nums">
            {stats.overall.totalCheckins}
          </div>
          <div className="mt-1 text-xs text-ink-soft">check-inů celkem</div>
        </div>
      </div>

      {habitEntries.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-2 font-mono text-xs font-normal text-ink-faint">návyk</th>
                <th className="px-2 py-2 text-center font-mono text-xs font-normal text-ink-faint">
                  streak
                </th>
                <th className="px-2 py-2 text-center font-mono text-xs font-normal text-ink-faint">
                  nejdelší
                </th>
              </tr>
            </thead>
            <tbody>
              {habitEntries.map(([habit, h]) => {
                const [emoji, name] = splitHabit(habit)
                return (
                  <tr key={habit} className="border-b border-line/60 last:border-0">
                    <td className="flex items-center gap-2 px-4 py-2.5">
                      <span className="text-base leading-none">{emoji}</span>
                      <span className="truncate text-ink-soft">{name}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center font-semibold tabular-nums">
                      {h.currentStreak}
                      {h.currentStreak > 0 && <span className="ml-0.5 text-xs">🔥</span>}
                    </td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-ink-faint">
                      {h.longestStreak}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
