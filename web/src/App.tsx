import { useState } from 'react'
import { TokenGate } from './components/TokenGate'
import { StreakCards } from './components/StreakCards'
import { TodayCard } from './components/TodayCard'
import { WeekTable } from './components/WeekTable'
import { useDashboard } from './lib/useDashboard'
import { isoWeekId } from './lib/dates'
import { submitCheckin, submitSentence } from './lib/checkinService'
import type { CheckinStatus } from './lib/markdown'

const TOKEN_KEY = 'habit-coach.github-token'

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const { data, loading, error, unauthorized, refresh } = useDashboard(token)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const now = new Date()

  const mutate = (fn: () => Promise<void>) => {
    if (!token) return
    setSaving(true)
    setSaveError(null)
    fn()
      .then(refresh)
      .catch((e: unknown) => setSaveError(e instanceof Error ? e.message : 'Zápis selhal'))
      .finally(() => setSaving(false))
  }

  const handleCheckin = (column: string, status: CheckinStatus) =>
    mutate(() => submitCheckin(token!, new Date(), column, status))

  const handleSentence = (sentence: string) =>
    mutate(() => submitSentence(token!, new Date(), sentence))

  if (!token) {
    return (
      <TokenGate
        onSave={(t) => {
          localStorage.setItem(TOKEN_KEY, t)
          setToken(t)
        }}
      />
    )
  }

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  const formatted = new Intl.DateTimeFormat('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now)
  const dateLabel = formatted.charAt(0).toUpperCase() + formatted.slice(1)

  return (
    <div className="mx-auto max-w-xl px-5 pt-10 pb-16">
      <header className="rise flex items-end justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
            Habit Coach · {isoWeekId(now)}
          </p>
          <h1 className="font-display mt-1 text-4xl font-black">{dateLabel}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            title="Obnovit"
            className="rounded-lg border border-line bg-white/60 px-3 py-2 text-sm transition-transform active:scale-95 disabled:opacity-40"
          >
            {loading ? '…' : '↻'}
          </button>
          <button
            onClick={clearToken}
            title="Zapomenout token"
            className="rounded-lg border border-line bg-white/60 px-3 py-2 text-sm text-ink-faint transition-transform active:scale-95"
          >
            ⏏
          </button>
        </div>
      </header>

      <main className="mt-8 flex flex-col gap-8">
        {error && (
          <div className="rounded-xl border border-miss bg-miss-soft px-5 py-4 text-sm text-miss">
            {unauthorized ? (
              <>
                GitHub token nefunguje ({error}).{' '}
                <button onClick={clearToken} className="font-semibold underline">
                  Zadat jiný token
                </button>
              </>
            ) : (
              <>Načtení selhalo: {error}</>
            )}
          </div>
        )}

        {saveError && (
          <div className="rounded-xl border border-miss bg-miss-soft px-5 py-4 text-sm text-miss">
            Zápis check-inu selhal: {saveError}. Zkontroluj, že token má oprávnění{' '}
            <em>Contents: Read and write</em>.
          </div>
        )}

        {loading && !data && <p className="text-sm text-ink-faint">Načítám deník…</p>}

        {data && (
          <>
            {data.plan ? (
              <>
                <TodayCard
                  plan={data.plan}
                  today={data.today}
                  todayLog={data.todayLog}
                  onCheckin={handleCheckin}
                  onSentence={handleSentence}
                  saving={saving}
                />
                <StreakCards streaks={data.streaks} />
                <WeekTable plan={data.plan} logDaysByDate={data.logDays} now={now} />
                <p className="text-center font-mono text-[10px] text-ink-faint">
                  {data.plan.title}
                </p>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-line bg-white/50 px-5 py-6 text-sm text-ink-soft">
                  Plán pro týden {isoWeekId(now)} v repu zatím není (
                  <span className="font-mono text-xs">plans/{isoWeekId(now)}.md</span>).
                </div>
                <StreakCards streaks={data.streaks} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
