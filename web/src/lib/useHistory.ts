import { useCallback, useEffect, useState } from 'react'
import { getHistory } from './api'
import { historyResponseToLogDays } from './apiAdapter'
import type { LogDay } from './markdown'

interface State {
  logDays: LogDay[] | null
  loading: boolean
  error: string | null
}

/** Historie za posledních `months` z Supabase API (/history). */
export function useHistory(enabled: boolean, months = 3) {
  const [state, setState] = useState<State>({ logDays: null, loading: false, error: null })

  const refresh = useCallback(() => {
    if (!enabled) return
    setState((s) => ({ ...s, loading: true, error: null }))
    getHistory(months)
      .then((history) =>
        setState({ logDays: historyResponseToLogDays(history), loading: false, error: null }),
      )
      .catch((e: unknown) =>
        setState({
          logDays: null,
          loading: false,
          error: e instanceof Error ? e.message : 'Neznámá chyba',
        }),
      )
  }, [enabled, months])

  useEffect(refresh, [refresh])

  return { ...state, refresh }
}
