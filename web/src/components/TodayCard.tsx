import type { CheckinStatus, LogDay, PlanDay, WeekPlan } from '../lib/markdown'

const habitEmoji = (text: string) => text.match(/^\p{Extended_Pictographic}/u)?.[0] ?? null

/** Stav z logu pro sloupec plánu — párování podle emoji návyku. */
export function statusForColumn(column: string, log: LogDay | null): CheckinStatus | null {
  const emoji = habitEmoji(column)
  if (!emoji || !log) return null
  return log.entries.find((e) => e.habit.startsWith(emoji))?.status ?? null
}

function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('http') ? (
          <a key={i} href={p} target="_blank" rel="noreferrer" className="text-done underline">
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

const STATUS_BADGE: Record<CheckinStatus, { label: string; cls: string }> = {
  done: { label: '✅ splněno', cls: 'bg-done-soft text-done' },
  missed: { label: '❌ vynecháno', cls: 'bg-miss-soft text-miss' },
  unplanned: { label: '➖ neplánováno', cls: 'bg-paper-warm text-ink-faint' },
}

export function TodayCard({
  plan,
  today,
  todayLog,
}: {
  plan: WeekPlan
  today: PlanDay | null
  todayLog: LogDay | null
}) {
  return (
    <section className="rise" style={{ animationDelay: '0.05s' }}>
      <h2 className="font-mono text-xs tracking-widest text-ink-faint uppercase">Dnes</h2>
      <div className="mt-3 rounded-xl border border-line bg-white/60 shadow-[3px_3px_0_0_var(--color-line)]">
        {!today && (
          <p className="px-5 py-6 text-sm text-ink-soft">
            Na dnešek není v týdenním plánu žádný řádek. Odpočívej — nebo mrkni na týden níž.
          </p>
        )}
        {today && (
          <ul className="divide-y divide-line">
            {plan.columns.map((col, i) => {
              const item = today.items[i]
              const status = statusForColumn(col, todayLog)
              const badge = status ? STATUS_BADGE[status] : null
              return (
                <li key={col} className="flex items-start gap-3 px-5 py-4">
                  <span className="text-xl leading-6">{habitEmoji(col) ?? '•'}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm ${item ? '' : 'text-ink-faint italic'}`}>
                      {item ?? 'dnes neplánováno'}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-faint">
                      {col.replace(/^\S+\s*/, '')}
                    </div>
                  </div>
                  {item && (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        badge ? badge.cls : 'bg-marker/30 text-ink-soft'
                      }`}
                    >
                      {badge ? badge.label : 'čeká'}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {today?.note && (
          <p className="border-t border-line px-5 py-3 text-xs text-ink-soft italic">
            {today.note}
          </p>
        )}
        {today?.detail && (
          <details className="border-t border-line">
            <summary className="cursor-pointer px-5 py-3 text-xs font-semibold text-ink-soft select-none">
              Detail dnešního plánu
            </summary>
            <div className="px-5 pb-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
              <Linkified text={today.detail} />
            </div>
          </details>
        )}
        {todayLog?.sentence && (
          <p className="border-t border-line px-5 py-3 text-sm">
            <span className="font-mono text-xs text-ink-faint">Věta dne: </span>
            {todayLog.sentence}
          </p>
        )}
      </div>
    </section>
  )
}
