import { useCallback, useEffect, useState } from 'react'
import { getHabits, getHistory, patchHabit, postHabit } from './api'
import type { CreateHabitBody, PatchHabitBody } from './api'
import { habitsResponseToViewModels } from './apiAdapter'
import type { HabitViewModel } from './apiAdapter'

interface State {
  habits: HabitViewModel[] | null
  loading: boolean
  error: string | null
}

/**
 * Návyky ze Supabase API (/habits) sloučené se streaky z /history (poslední 1 měsíc stačí —
 * streak je odvozený z posledních záznamů, viz habit_streaks view).
 */
export function useHabits(enabled: boolean) {
  const [state, setState] = useState<State>({ habits: null, loading: false, error: null })

  const refresh = useCallback(() => {
    if (!enabled) return
    setState((s) => ({ ...s, loading: true, error: null }))
    Promise.all([getHabits(), getHistory(1)])
      .then(([habits, history]) =>
        setState({
          habits: habitsResponseToViewModels(habits, history.streaks),
          loading: false,
          error: null,
        }),
      )
      .catch((e: unknown) =>
        setState({
          habits: null,
          loading: false,
          error: e instanceof Error ? e.message : 'Neznámá chyba',
        }),
      )
  }, [enabled])

  useEffect(refresh, [refresh])

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const runMutation = (fn: () => Promise<unknown>) => {
    setSaving(true)
    setSaveError(null)
    return fn()
      .then(() => {
        refresh()
        return true
      })
      .catch((e: unknown) => {
        setSaveError(e instanceof Error ? e.message : 'Uložení selhalo')
        return false
      })
      .finally(() => setSaving(false))
  }

  const createHabit = (body: CreateHabitBody) => runMutation(() => postHabit(body))
  const updateHabit = (body: PatchHabitBody) => runMutation(() => patchHabit(body))
  const archiveHabit = (slug: string) => runMutation(() => patchHabit({ slug, active: false }))
  const restoreHabit = (slug: string) => runMutation(() => patchHabit({ slug, active: true }))

  return { ...state, refresh, saving, saveError, createHabit, updateHabit, archiveHabit, restoreHabit }
}
