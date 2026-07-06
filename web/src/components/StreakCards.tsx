import type { Streak } from '../lib/streaks'

/** Oddělí emoji od názvu návyku, např. "💪 Cvičení" → ["💪", "Cvičení"]. */
function splitHabit(habit: string): [string, string] {
  const m = habit.match(/^(\p{Extended_Pictographic}️?)\s*(.*)$/u)
  return m ? [m[1], m[2]] : ['•', habit]
}

export function StreakCards({ streaks }: { streaks: Record<string, Streak> }) {
  const entries = Object.entries(streaks).filter(([habit]) => !habit.includes('bonus'))
  if (entries.length === 0) return null

  return (
    <section className="rise" style={{ animationDelay: '0.1s' }}>
      <h2 className="font-mono text-xs tracking-widest text-ink-faint uppercase">Streaky</h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {entries.map(([habit, s]) => {
          const [emoji, name] = splitHabit(habit)
          return (
            <div
              key={habit}
              className={`relative overflow-hidden rounded-xl border px-3 py-3 ${
                s.missedTwice ? 'border-miss bg-miss-soft' : 'border-line bg-white/50'
              }`}
            >
              <div className="text-lg leading-none">{emoji}</div>
              <div className="font-display mt-2 text-3xl font-black tabular-nums">
                {s.current}
                {s.current > 0 && <span className="ml-1 text-base">🔥</span>}
              </div>
              <div className="mt-1 truncate text-xs text-ink-soft">{name}</div>
              {s.missedTwice && (
                <div className="mt-1 text-[10px] font-semibold text-miss uppercase">
                  2× po sobě!
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
