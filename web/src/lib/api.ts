import { createClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'
import { toApiStatus } from './apiAdapter'
import type { HabitsResponse, HistoryResponse, WeekResponse } from './apiAdapter'
import type { CheckinStatus } from './markdown'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** API mód je zapnutý, když jsou nastavené Supabase env proměnné (jinak GitHub mód z fáze W). */
export const apiMode = Boolean(url && anonKey)

export const supabase = apiMode ? createClient(url!, anonKey!) : null

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  return (await supabase.auth.getSession()).data.session
}

async function invoke<T>(
  name: string,
  options?: { body?: unknown; query?: string; method?: 'GET' | 'POST' | 'PATCH' },
): Promise<T> {
  const { data: sessionData } = await supabase!.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Nepřihlášen')
  const method = options?.method ?? (options?.body ? 'POST' : 'GET')
  const res = await fetch(`${url}/functions/v1/${name}${options?.query ?? ''}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey!,
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `API chyba ${res.status}`)
  return body as T
}

export function getWeek(iso?: string): Promise<WeekResponse> {
  return invoke<WeekResponse>('week', { query: iso ? `?iso=${iso}` : '' })
}

export function getHistory(months = 3): Promise<HistoryResponse> {
  return invoke<HistoryResponse>('history', { query: `?months=${months}` })
}

export function postCheckin(
  habitSlug: string,
  status: CheckinStatus,
  note?: string,
  dateIso?: string,
) {
  return invoke('checkin', {
    body: { habit_slug: habitSlug, status: toApiStatus(status), note, date: dateIso, source: 'web' },
  })
}

export function postSentence(sentence: string) {
  return invoke('checkin', { body: { sentence } })
}

export function getHabits(): Promise<HabitsResponse> {
  return invoke<HabitsResponse>('habits')
}

export interface CreateHabitBody {
  slug?: string
  name: string
  emoji: string
  dose_text?: string
  frequency_per_week?: number
  is_reward?: boolean
}

export function postHabit(body: CreateHabitBody) {
  return invoke('habits', { body })
}

export interface PatchHabitBody {
  slug: string
  name?: string
  emoji?: string
  dose_text?: string
  frequency_per_week?: number
  is_reward?: boolean
  active?: boolean
}

export function patchHabit(body: PatchHabitBody) {
  return invoke('habits', { body, method: 'PATCH' })
}
