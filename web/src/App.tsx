import { useEffect, useState } from 'react'
import { TokenGate } from './components/TokenGate'
import { LoginGate } from './components/LoginGate'
import { StreakCards } from './components/StreakCards'
import { TodayCard } from './components/TodayCard'
import { WeekTable } from './components/WeekTable'
import { useDashboard } from './lib/useDashboard'
import type { Dashboard } from './lib/useDashboard'
import { useApiDashboard } from './lib/useApiDashboard'
import { apiMode, getSession, postCheckin, postSentence, supabase } from './lib/api'
import { isoWeekId } from './lib/dates'
import { submitCheckin, submitSentence } from './lib/checkinService'
import type { CheckinStatus } from './lib/markdown'

const TOKEN_KEY = 'habit-coach.github-token'

interface ViewProps {
  data: Dashboard | null
  loading: boolean
  error: string | null
  errorExtra?: React.ReactNode
  saving: boolean
  saveError: string | null
  onRefresh: () => void
  onLogout: () => void
  onCheckin: (column: string, status: CheckinStatus) => void
  onSentence: (sentence: string) => void
}

function DashboardView(p: ViewProps) {
  const now = new Date()
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
            onClick={p.onRefresh}
            disabled={p.loading}
            title="Obnovit"
            className="rounded-lg border border-line bg-white/60 px-3 py-2 text-sm transition-transform active:scale-95 disabled:opacity-40"
          >
            {p.loading ? '…' : '↻'}
          </button>
          <button
            onClick={p.onLogout}
            title="Odhlásit"
            className="rounded-lg border border-line bg-white/60 px-3 py-2 text-sm text-ink-faint transition-transform active:scale-95"
          >
            ⏏
          </button>
        </div>
      </header>

      <main className="mt-8 flex flex-col gap-8">
        {p.error && (
          <div className="rounded-xl border border-miss bg-miss-soft px-5 py-4 text-sm text-miss">
            Načtení selhalo: {p.error} {p.errorExtra}
          </div>
        )}
        {p.saveError && (
          <div className="rounded-xl border border-miss bg-miss-soft px-5 py-4 text-sm text-miss">
            Zápis check-inu selhal: {p.saveError}
          </div>
        )}

        {p.loading && !p.data && <p className="text-sm text-ink-faint">Načítám deník…</p>}

        {p.data &&
          (p.data.plan ? (
            <>
              <TodayCard
                plan={p.data.plan}
                today={p.data.today}
                todayLog={p.data.todayLog}
                onCheckin={p.onCheckin}
                onSentence={p.onSentence}
                saving={p.saving}
              />
              <StreakCards streaks={p.data.streaks} />
              <WeekTable plan={p.data.plan} logDaysByDate={p.data.logDays} now={now} />
              <p className="text-center font-mono text-[10px] text-ink-faint">
                {p.data.plan.title}
              </p>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-line bg-white/50 px-5 py-6 text-sm text-ink-soft">
                Plán pro týden {isoWeekId(now)} zatím není k dispozici.
              </div>
              <StreakCards streaks={p.data.streaks} />
            </>
          ))}
      </main>
    </div>
  )
}

function useMutation(refresh: () => void) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const mutate = (fn: () => Promise<unknown>) => {
    setSaving(true)
    setSaveError(null)
    fn()
      .then(refresh)
      .catch((e: unknown) => setSaveError(e instanceof Error ? e.message : 'Zápis selhal'))
      .finally(() => setSaving(false))
  }
  return { saving, saveError, mutate }
}

/** Fáze 1a: dashboard nad Supabase API (přihlášení e-mailem). */
function ApiApp() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  useEffect(() => {
    getSession().then((s) => setAuthed(!!s))
  }, [])

  const { data, loading, error, refresh } = useApiDashboard(authed === true)
  const { saving, saveError, mutate } = useMutation(refresh)

  if (authed === null) return null
  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />

  return (
    <DashboardView
      data={data}
      loading={loading}
      error={error}
      saving={saving}
      saveError={saveError}
      onRefresh={refresh}
      onLogout={() => supabase!.auth.signOut().then(() => setAuthed(false))}
      onCheckin={(column, status) => {
        const slug = data?.slugByColumn?.[column]
        if (slug) mutate(() => postCheckin(slug, status))
      }}
      onSentence={(sentence) => mutate(() => postSentence(sentence))}
    />
  )
}

/** Fáze W: dashboard přímo nad GitHub Contents API (PAT). */
function GitHubApp() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const { data, loading, error, unauthorized, refresh } = useDashboard(token)
  const { saving, saveError, mutate } = useMutation(refresh)

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

  return (
    <DashboardView
      data={data}
      loading={loading}
      error={error}
      errorExtra={
        unauthorized ? (
          <button onClick={clearToken} className="font-semibold underline">
            Zadat jiný token
          </button>
        ) : undefined
      }
      saving={saving}
      saveError={saveError}
      onRefresh={refresh}
      onLogout={clearToken}
      onCheckin={(column, status) => mutate(() => submitCheckin(token, new Date(), column, status))}
      onSentence={(sentence) => mutate(() => submitSentence(token, new Date(), sentence))}
    />
  )
}

export default function App() {
  return apiMode ? <ApiApp /> : <GitHubApp />
}
