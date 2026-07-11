import { sameDay } from '../lib/dates'
import type { LogDay, WeekPlan } from '../lib/markdown'
import { statusForColumn } from './checkinStatus'

const habitEmoji = (text: string) => text.match(/^\p{Extended_Pictographic}/u)?.[0] ?? '•'

export function WeekTable({
  plan,
  logDaysByDate,
  now,
}: {
  plan: WeekPlan
  logDaysByDate: LogDay[]
  now: Date
}) {
  const logFor = (date: Date | null) =>
    date ? (logDaysByDate.find((l) => l.date && sameDay(l.date, date)) ?? null) : null

  return (
    <section className="rise" style={{ animationDelay: '0.15s' }}>
      <h2 className="font-mono text-xs tracking-widest text-ink-faint uppercase">Týden</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-2.5 font-mono text-xs font-normal text-ink-faint">den</th>
              {plan.columns.map((c) => (
                <th key={c} className="px-2 py-2.5 text-center text-base font-normal">
                  {habitEmoji(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plan.days.map((day) => {
              const isToday = !!day.date && sameDay(day.date, now)
              const log = logFor(day.date)
              return (
                <tr
                  key={day.label}
                  className={`border-b border-line/60 last:border-0 ${
                    isToday ? 'bg-marker/20' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap">
                    {day.label}
                    {isToday && <span className="ml-1.5 text-[10px] text-ink-soft">← dnes</span>}
                  </td>
                  {plan.columns.map((col, i) => {
                    const planned = day.items[i] !== null
                    const status = statusForColumn(col, log)
                    let mark = planned ? '●' : '–'
                    let cls = planned ? 'text-ink-soft' : 'text-ink-faint/60'
                    if (planned && status === 'done') {
                      mark = '✓'
                      cls = 'font-bold text-done'
                    } else if (planned && status === 'missed') {
                      mark = '✗'
                      cls = 'font-bold text-miss'
                    }
                    return (
                      <td key={col} title={day.items[i] ?? undefined} className="px-2 py-2.5 text-center">
                        <span className={cls}>{mark}</span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-right font-mono text-[10px] text-ink-faint">
        ✓ splněno · ✗ vynecháno · ● v plánu · – volno
      </p>
    </section>
  )
}
