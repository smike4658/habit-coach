import { useMemo } from 'react'
import { computeAchievements } from '../lib/achievements'
import type { LogDay } from '../lib/markdown'

/** Milníky kontinuity (razítka na trase) — žádné body, jen záznam cesty. */
export function AchievementsRow({ logDays }: { logDays: LogDay[] }) {
  const achievements = useMemo(() => computeAchievements(logDays, new Date()), [logDays])

  return (
    <section className="rise" style={{ animationDelay: '0.15s' }}>
      <h2 className="font-mono text-xs tracking-widest text-ink-faint uppercase">Vrcholová kniha</h2>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            title={`${a.name} — ${a.desc}`}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-opacity ${
              a.earned
                ? 'border-done bg-done-soft/60'
                : 'border-line bg-white/40 opacity-40 grayscale'
            }`}
          >
            <span className="text-xl leading-none">{a.emoji}</span>
            <span className="text-[10px] leading-tight font-semibold text-ink-soft">{a.name}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-right font-mono text-[10px] text-ink-faint">
        odznaky za kontinuitu a návrat — ne za výkon
      </p>
    </section>
  )
}
