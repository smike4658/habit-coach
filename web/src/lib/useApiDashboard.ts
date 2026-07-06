import { useCallback, useEffect, useState } from 'react'
import { getWeek } from './api'
import { weekResponseToDashboard } from './apiAdapter'
import type { Dashboard } from './useDashboard'

interface State {
  data: Dashboard | null
  loading: boolean
  error: string | null
}

/** Dashboard z Supabase API (/week) — stejný tvar dat jako GitHub mód. */
export function useApiDashboard(enabled: boolean) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null })

  const refresh = useCallback(() => {
    if (!enabled) return
    setState((s) => ({ ...s, loading: true, error: null }))
    getWeek()
      .then((week) =>
        setState({ data: weekResponseToDashboard(week, new Date()), loading: false, error: null }),
      )
      .catch((e: unknown) =>
        setState({
          data: null,
          loading: false,
          error: e instanceof Error ? e.message : 'Neznámá chyba',
        }),
      )
  }, [enabled])

  useEffect(refresh, [refresh])

  return { ...state, refresh }
}
