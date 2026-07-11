import { useState } from 'react'
import type { CheckinStatus, LogDay, PlanDay, WeekPlan } from '../lib/markdown'
import { STATUS_BUTTONS, statusForColumn } from './checkinStatus'

const habitEmoji = (text: string) => text.match(/^\p{Extended_Pictographic}/u)?.[0] ?? null

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

export function TodayCard({
  plan,
  today,
  todayLog,
  onCheckin,
  onSentence,
  saving,
}: {
  plan: WeekPlan
  today: PlanDay | null
  todayLog: LogDay | null
  onCheckin: (column: string, status: CheckinStatus) => void
  onSentence: (sentence: string) => void
  saving: boolean
}) {
  const [sentence, setSentence] = useState<string | null>(null)
  const savedSentence = todayLog?.sentence ?? ''
  const draft = sentence ?? savedSentence

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
                  <div className="flex shrink-0 gap-1.5">
                    {STATUS_BUTTONS.map((b) => (
                      <button
                        key={b.status}
                        disabled={saving}
                        onClick={() => onCheckin(col, b.status)}
                        title={b.status}
                        className={`rounded-lg px-2 py-1.5 text-sm transition-transform active:scale-90 disabled:opacity-40 ${
                          status === b.status ? b.activeCls : 'opacity-45 hover:opacity-100'
                        }`}
                      >
                        {b.mark}
                      </button>
                    ))}
                  </div>
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
        <form
          className="flex items-center gap-2 border-t border-line px-5 py-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.trim() && draft !== savedSentence) onSentence(draft.trim())
          }}
        >
          <label className="shrink-0 font-mono text-xs text-ink-faint" htmlFor="sentence">
            Věta dne
          </label>
          <input
            id="sentence"
            value={draft}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="jedna věta o dnešku…"
            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-line focus:bg-white/70"
          />
          {draft.trim() && draft !== savedSentence && (
            <button
              type="submit"
              disabled={saving}
              className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-paper active:scale-95 disabled:opacity-40"
            >
              Uložit
            </button>
          )}
        </form>
      </div>
    </section>
  )
}
