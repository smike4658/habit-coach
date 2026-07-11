/**
 * Dev-only náhled Stezka designu s fixture daty (obchází přihlášení).
 * Slouží k vizuální iteraci re-skinu — NENÍ součástí produkčního buildu
 * (vlastní entry preview.html, mimo index.html). Spuštění: `npm run dev`
 * → /preview.html.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { DashboardView } from './App'
import type { Dashboard } from './lib/useDashboard'
import type { LogDay, PlanDay, WeekPlan } from './lib/markdown'

const COLUMNS = ['💪 Cvičení (10 min)', '📖 Čtení (15 min)', '🧠 QA/AI (15 min + TIL)']

function planDay(date: Date, label: string, items: (string | null)[], note = ''): PlanDay {
  return { label, date, items, note, detail: null }
}

const now = new Date()
const d = (offset: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)

const plan: WeekPlan = {
  title: 'Týden 28 — Nevynechat. Výkon je jedno.',
  columns: COLUMNS,
  days: [
    planDay(d(-5), 'Po', ['Trénink A', 'Zaklínač', 'Playwright 1'], 'první den'),
    planDay(d(-4), 'Út', [null, 'Zaklínač', 'PW den 2']),
    planDay(d(-3), 'St', ['Trénink B', 'Zaklínač', 'PW den 3']),
    planDay(d(-2), 'Čt', ['Trénink A', null, 'PW den 4']),
    planDay(d(-1), 'Pá', ['Trénink B', 'Zaklínač', 'PW den 5']),
    planDay(d(0), 'So', ['Trénink B — kruhy, lehce', 'Zaklínač, kapitola dál', 'PW den 6 + zápis'], 'víkendová etapa'),
    planDay(d(1), 'Ne', [null, null, null], '🔁 týdenní review'),
  ],
}

function logDay(date: Date, entries: [string, LogDay['entries'][0]['status']][], sentence = ''): LogDay {
  return {
    label: '',
    date,
    sentence,
    entries: entries.map(([habit, status]) => ({ habit, status, note: '' })),
  }
}

const logDays: LogDay[] = [
  logDay(d(-5), [['💪 Cvičení', 'done'], ['📖 Čtení', 'done'], ['🧠 QA/AI', 'done']], 'dobrý start'),
  logDay(d(-4), [['💪 Cvičení', 'excused'], ['📖 Čtení', 'done'], ['🧠 QA/AI', 'done']]),
  logDay(d(-3), [['💪 Cvičení', 'done'], ['📖 Čtení', 'missed'], ['🧠 QA/AI', 'done']], 'čtení nestíhám'),
  logDay(d(-2), [['💪 Cvičení', 'done'], ['🧠 QA/AI', 'done']]),
  logDay(d(-1), [['💪 Cvičení', 'done'], ['📖 Čtení', 'done'], ['🧠 QA/AI', 'excused']], 'držím tempo'),
  logDay(d(0), [['💪 Cvičení', 'done']], 'dneska to šlo samo'),
]

const todayLog = logDays[logDays.length - 1]

const dashboard: Dashboard = {
  plan,
  today: plan.days.find((x) => x.date && x.date.getDate() === now.getDate()) ?? plan.days[5],
  todayLog,
  logDays,
  streaks: {
    '💪 Cvičení': { current: 6, missedTwice: false },
    '📖 Čtení': { current: 0, missedTwice: false },
    '🧠 QA/AI': { current: 5, missedTwice: false },
  },
  slugByColumn: { [COLUMNS[0]]: 'cviceni', [COLUMNS[1]]: 'cteni', [COLUMNS[2]]: 'qa-ai' },
}

const noop = () => {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DashboardView
      data={dashboard}
      loading={false}
      error={null}
      saving={false}
      saveError={null}
      onRefresh={noop}
      onLogout={noop}
      onCheckin={noop}
      onBackfillCheckin={noop}
      onSentence={noop}
      history={{ logDays, loading: false, error: null, from: d(-60), to: now }}
      habits={{
        enabled: false,
        habits: null,
        loading: false,
        error: null,
        saving: false,
        saveError: null,
        onCreate: noop,
        onUpdate: noop,
        onArchive: noop,
        onRestore: noop,
      }}
    />
  </StrictMode>,
)
