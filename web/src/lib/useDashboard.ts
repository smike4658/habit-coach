import { useCallback, useEffect, useState } from 'react'
import { fetchRepoFile, GitHubError } from './github'
import { logFileName, planFileName, sameDay } from './dates'
import { parseLog, parseWeekPlan } from './markdown'
import type { LogDay, MonthLog, PlanDay, WeekPlan } from './markdown'
import { computeStreaks } from './streaks'
import type { Streak } from './streaks'

export interface Dashboard {
  plan: WeekPlan | null
  today: PlanDay | null
  todayLog: LogDay | null
  logDays: LogDay[]
  streaks: Record<string, Streak>
  /** API mód: mapování sloupce plánu na slug návyku (z /week items). */
  slugByColumn?: Record<string, string | null>
}

interface State {
  data: Dashboard | null
  loading: boolean
  error: string | null
  unauthorized: boolean
}

async function loadDashboard(token: string, now: Date): Promise<Dashboard> {
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [planMd, logMd, prevLogMd] = await Promise.all([
    fetchRepoFile(planFileName(now), token).catch(missingAsNull),
    fetchRepoFile(logFileName(now), token).catch(missingAsNull),
    fetchRepoFile(logFileName(prevMonth), token).catch(missingAsNull),
  ])

  const plan = planMd ? parseWeekPlan(planMd, now.getFullYear()) : null
  const logs: MonthLog[] = []
  if (prevLogMd) logs.push(parseLog(prevLogMd, prevMonth.getFullYear()))
  if (logMd) logs.push(parseLog(logMd, now.getFullYear()))
  const logDays = logs.flatMap((l) => l.days)

  return {
    plan,
    today: plan?.days.find((d) => d.date && sameDay(d.date, now)) ?? null,
    todayLog: logDays.find((d) => d.date && sameDay(d.date, now)) ?? null,
    logDays,
    streaks: computeStreaks(logDays),
  }
}

function missingAsNull(e: unknown): null {
  if (e instanceof GitHubError && e.status === 404) return null
  throw e
}

export function useDashboard(token: string | null) {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
    unauthorized: false,
  })

  const refresh = useCallback(() => {
    if (!token) return
    setState((s) => ({ ...s, loading: true, error: null, unauthorized: false }))
    loadDashboard(token, new Date())
      .then((data) => setState({ data, loading: false, error: null, unauthorized: false }))
      .catch((e: unknown) => {
        const unauthorized = e instanceof GitHubError && (e.status === 401 || e.status === 403)
        setState({
          data: null,
          loading: false,
          unauthorized,
          error: e instanceof Error ? e.message : 'Neznámá chyba',
        })
      })
  }, [token])

  useEffect(refresh, [refresh])

  return { ...state, refresh }
}
