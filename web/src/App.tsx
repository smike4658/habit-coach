import { useEffect, useState } from 'react'
import { TokenGate } from './components/TokenGate'
import { LoginGate } from './components/LoginGate'
import { StreakCards } from './components/StreakCards'
import { TodayCard } from './components/TodayCard'
import { WeekTable } from './components/WeekTable'
import { HistoryView } from './components/HistoryView'
import { HabitsView } from './components/HabitsView'
import { useDashboard } from './lib/useDashboard'
import type { Dashboard } from './lib/useDashboard'
import { useApiDashboard } from './lib/useApiDashboard'
import { useHistory } from './lib/useHistory'
import { useHabits } from './lib/useHabits'
import { apiMode, getSession, postCheckin, postSentence, supabase } from './lib/api'
import { isoWeekId, toIsoDate } from './lib/dates'
import { submitCheckin, submitSentence } from './lib/checkinService'
import { yesterdayGap } from './lib/backfill'
import type { CheckinStatus } from './lib/markdown'

const TOKEN_KEY = 'habit-coach.github-token'

type Tab = 'today' | 'history' | 'habits'

interface HistoryProps {
  logDays: import('./lib/markdown').LogDay[] | null
  loading: boolean
  error: string | null
  from: Date
  to: Date
}

interface HabitsProps {
  enabled: boolean
  habits: import('./lib/apiAdapter').HabitViewModel[] | null
  loading: boolean
  error: string | null
  saving: boolean
  saveError: string | null
  onCreate: (body: import('./lib/api').CreateHabitBody) => void
  onUpdate: (body: import('./lib/api').PatchHabitBody) => void
  onArchive: (slug: string) => void
  onRestore: (slug: string) => void
}

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
  /** Check-in pro libovolný minulý den (backfill z kalendáře). */
  onBackfillCheckin: (date: Date, column: string, status: CheckinStatus) => void
  onSentence: (sentence: string) => void
  history: HistoryProps
  habits: HabitsProps
}

function TabNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'today', label: 'Dnes' },
    { id: 'history', label: 'Historie' },
    { id: 'habits', label: 'Návyky' },
  ]
  return (
    <nav className="mt-4 flex gap-1 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px rounded-t-lg border border-b-0 px-4 py-2 text-sm font-semibold transition-colors ${
            tab === t.id
              ? 'border-line bg-white/60 text-ink'
              : 'border-transparent text-ink-faint hover:text-ink-soft'
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}

function DashboardView(p: ViewProps) {
  const [tab, setTab] = useState<Tab>('today')
  const [historyFocus, setHistoryFocus] = useState<Date | null>(null)
  const now = new Date()
  const gap = p.data?.plan ? yesterdayGap(p.data.plan, p.data.logDays, now) : null
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

      <TabNav
        tab={tab}
        onChange={(t) => {
          setHistoryFocus(null)
          setTab(t)
        }}
      />

      {p.saveError && (
        <div className="mt-4 rounded-xl border border-miss bg-miss-soft px-5 py-4 text-sm text-miss">
          Zápis check-inu selhal: {p.saveError}
        </div>
      )}

      {tab === 'today' && (
        <main className="mt-8 flex flex-col gap-8">
          {p.error && (
            <div className="rounded-xl border border-miss bg-miss-soft px-5 py-4 text-sm text-miss">
              Načtení selhalo: {p.error} {p.errorExtra}
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
                {gap && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryFocus(gap.date)
                      setTab('history')
                    }}
                    className="rounded-xl border border-marker bg-marker/15 px-5 py-3 text-left text-sm text-ink-soft transition-transform active:scale-[0.99]"
                  >
                    Včera chybí záznam u {gap.missing.length}{' '}
                    {gap.missing.length === 1 ? 'návyku' : 'návyků'} — doplnit v kalendáři →
                  </button>
                )}
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
      )}

      {tab === 'history' && (
        <HistoryView
          logDays={p.history.logDays}
          loading={p.history.loading}
          error={p.history.error}
          from={p.history.from}
          to={p.history.to}
          columns={p.data?.plan?.columns ?? null}
          onCheckin={p.onBackfillCheckin}
          saving={p.saving}
          focusDate={historyFocus}
        />
      )}

      {tab === 'habits' &&
        (p.habits.enabled ? (
          <HabitsView
            habits={p.habits.habits}
            loading={p.habits.loading}
            error={p.habits.error}
            saving={p.habits.saving}
            saveError={p.habits.saveError}
            onCreate={p.habits.onCreate}
            onUpdate={p.habits.onUpdate}
            onArchive={p.habits.onArchive}
            onRestore={p.habits.onRestore}
          />
        ) : (
          <div className="mt-8 rounded-xl border border-line bg-white/50 px-5 py-6 text-sm text-ink-soft">
            Správa návyků vyžaduje API mód.
          </div>
        ))}
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

const HISTORY_MONTHS = 3

/** Fáze 1a: dashboard nad Supabase API (přihlášení e-mailem). */
function ApiApp() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  useEffect(() => {
    getSession().then((s) => setAuthed(!!s))
  }, [])

  const { data, loading, error, refresh } = useApiDashboard(authed === true)
  const {
    logDays: historyLogDays,
    loading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
  } = useHistory(authed === true, HISTORY_MONTHS)
  const { saving, saveError, mutate } = useMutation(() => {
    refresh()
    refreshHistory()
  })
  const {
    habits,
    loading: habitsLoading,
    error: habitsError,
    saving: habitsSaving,
    saveError: habitsSaveError,
    createHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
  } = useHabits(authed === true)

  if (authed === null) return null
  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />

  const now = new Date()
  const historyFrom = new Date(now.getFullYear(), now.getMonth() - HISTORY_MONTHS, now.getDate())

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
      onBackfillCheckin={(date, column, status) => {
        const slug = data?.slugByColumn?.[column]
        if (slug) mutate(() => postCheckin(slug, status, undefined, toIsoDate(date)))
      }}
      onSentence={(sentence) => mutate(() => postSentence(sentence))}
      history={{
        logDays: historyLogDays,
        loading: historyLoading,
        error: historyError,
        from: historyFrom,
        to: now,
      }}
      habits={{
        enabled: true,
        habits,
        loading: habitsLoading,
        error: habitsError,
        saving: habitsSaving,
        saveError: habitsSaveError,
        onCreate: createHabit,
        onUpdate: updateHabit,
        onArchive: archiveHabit,
        onRestore: restoreHabit,
      }}
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

  const now = new Date()
  // PAT mód: dashboard fetchuje jen aktuální + předchozí měsíc logu, historii stavíme z toho —
  // víc netahat (viz W3.4 zadání).
  const historyFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)

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
      onBackfillCheckin={(date, column, status) =>
        mutate(() => submitCheckin(token, date, column, status))
      }
      onSentence={(sentence) => mutate(() => submitSentence(token, new Date(), sentence))}
      history={{
        logDays: data?.logDays ?? null,
        loading,
        error,
        from: historyFrom,
        to: now,
      }}
      habits={{
        enabled: false,
        habits: null,
        loading: false,
        error: null,
        saving: false,
        saveError: null,
        onCreate: () => {},
        onUpdate: () => {},
        onArchive: () => {},
        onRestore: () => {},
      }}
    />
  )
}

export default function App() {
  return apiMode ? <ApiApp /> : <GitHubApp />
}
