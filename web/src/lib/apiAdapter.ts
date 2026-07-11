import { sameDay } from './dates'
import type { CheckinStatus, LogDay, WeekPlan } from './markdown'
import type { Streak } from './streaks'
import type { Dashboard } from './useDashboard'

/** DB status enum (design §3) ↔ web status names. */
export type ApiStatus = 'done' | 'skipped' | 'unplanned' | 'excused'

export function toWebStatus(s: ApiStatus): CheckinStatus {
  return s === 'skipped' ? 'missed' : s
}

export function toApiStatus(s: CheckinStatus): ApiStatus {
  return s === 'missed' ? 'skipped' : s
}

export interface WeekResponse {
  iso: string
  days: {
    week_iso: string
    day_date: string
    items: {
      label: string
      note: string
      detail: string | null
      items: { slug: string | null; column: string; text: string | null }[]
    }
  }[]
  checkins: {
    date: string
    status: ApiStatus
    note: string | null
    source: string
    habits: { slug: string }
  }[]
  streaks: {
    slug: string
    emoji: string
    name: string
    current_streak: number
    missed_twice: boolean
    is_reward: boolean
  }[]
}

function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Přemapuje odpověď /week na Dashboard model, který používá stávající UI. */
export function weekResponseToDashboard(week: WeekResponse, now: Date): Dashboard {
  const habitKey = (slug: string) => {
    const s = week.streaks.find((x) => x.slug === slug)
    return s ? `${s.emoji} ${s.name}` : slug
  }

  const columns = week.days[0]?.items.items.map((i) => i.column) ?? []
  const plan: WeekPlan | null = week.days.length
    ? {
        title: week.iso,
        columns,
        days: week.days.map((d) => ({
          label: d.items.label,
          date: parseIsoDate(d.day_date),
          items: d.items.items.map((i) => i.text),
          note: d.items.note,
          detail: d.items.detail,
        })),
      }
    : null

  const logDays: LogDay[] = week.days.map((d) => {
    const date = parseIsoDate(d.day_date)
    const dayCheckins = week.checkins.filter((c) => c.date === d.day_date)
    return {
      label: d.items.label,
      date,
      sentence: '',
      entries: dayCheckins.map((c) => ({
        habit: habitKey(c.habits.slug),
        status: toWebStatus(c.status),
        note: c.note ?? '',
      })),
    }
  })

  const streaks: Record<string, Streak> = Object.fromEntries(
    week.streaks
      .filter((s) => !s.is_reward)
      .map((s) => [
        `${s.emoji} ${s.name}`,
        { current: s.current_streak, missedTwice: s.missed_twice },
      ]),
  )

  return {
    plan,
    today: plan?.days.find((d) => d.date && sameDay(d.date, now)) ?? null,
    todayLog: logDays.find((d) => d.date && sameDay(d.date, now)) ?? null,
    logDays,
    streaks,
    slugByColumn: Object.fromEntries(
      (week.days[0]?.items.items ?? []).map((i) => [i.column, i.slug]),
    ),
  }
}

export interface HistoryResponse {
  from: string
  to: string
  habits: { slug: string; name: string; emoji: string; is_reward: boolean }[]
  checkins: { date: string; status: ApiStatus; note: string | null; slug: string }[]
  /** Věty dne z git logu (markdown = zdroj pravdy; DB věty nedrží). */
  sentences?: { date: string; sentence: string }[]
  streaks: {
    slug: string
    emoji: string
    name: string
    current_streak: number
    missed_twice: boolean
    is_reward: boolean
  }[]
}

/** Přemapuje odpověď /history na LogDay[], stejný tvar dat jako GitHub log parsing. */
export function historyResponseToLogDays(history: HistoryResponse): LogDay[] {
  const habitKey = (slug: string) => {
    const h = history.habits.find((x) => x.slug === slug)
    return h ? `${h.emoji} ${h.name}` : slug
  }

  const byDate = new Map<string, LogDay>()
  for (const c of history.checkins) {
    if (!byDate.has(c.date)) {
      byDate.set(c.date, { label: c.date, date: parseIsoDate(c.date), sentence: '', entries: [] })
    }
    byDate.get(c.date)!.entries.push({
      habit: habitKey(c.slug),
      status: toWebStatus(c.status),
      note: c.note ?? '',
    })
  }

  for (const s of history.sentences ?? []) {
    if (!byDate.has(s.date)) {
      byDate.set(s.date, { label: s.date, date: parseIsoDate(s.date), sentence: '', entries: [] })
    }
    byDate.get(s.date)!.sentence = s.sentence
  }

  return [...byDate.values()].sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0))
}

export interface HabitApi {
  id: string
  slug: string
  name: string
  emoji: string
  dose_text: string | null
  frequency_per_week: number | null
  is_reward: boolean
  active: boolean
}

export interface HabitsResponse {
  habits: HabitApi[]
}

export interface HabitViewModel {
  slug: string
  name: string
  emoji: string
  doseText: string | null
  frequencyPerWeek: number | null
  isReward: boolean
  active: boolean
  currentStreak: number
  missedTwice: boolean
}

/** Přemapuje odpověď /habits + streaky z /history (nebo /week) na view modely pro obrazovku Návyky. */
export function habitsResponseToViewModels(
  habits: HabitsResponse,
  streaks: { slug: string; current_streak: number; missed_twice: boolean }[],
): HabitViewModel[] {
  return habits.habits.map((h) => {
    const s = streaks.find((x) => x.slug === h.slug)
    return {
      slug: h.slug,
      name: h.name,
      emoji: h.emoji,
      doseText: h.dose_text,
      frequencyPerWeek: h.frequency_per_week,
      isReward: h.is_reward,
      active: h.active,
      currentStreak: s?.current_streak ?? 0,
      missedTwice: s?.missed_twice ?? false,
    }
  })
}
