import { serviceClient } from '../_shared/db.ts'
import { handleOptions, json, requireUser } from '../_shared/http.ts'
import {
  sortHabits,
  validateCreateHabit,
  validatePatchHabit,
} from '../_shared/habits.ts'
import type { CreateHabitInput, HabitRow, PatchHabitInput } from '../_shared/habits.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  const unauthorized = requireUser(req)
  if (unauthorized) return unauthorized

  const db = serviceClient()

  if (req.method === 'GET') {
    const { data, error } = await db.from('habits').select('*')
    if (error) return json({ error: error.message }, 500)
    return json({ habits: sortHabits((data ?? []) as HabitRow[]) })
  }

  if (req.method === 'POST') {
    const body = (await req.json().catch(() => ({}))) as CreateHabitInput
    const { data: existing, error: exErr } = await db.from('habits').select('slug')
    if (exErr) return json({ error: exErr.message }, 500)
    const existingSlugs = (existing ?? []).map((h) => h.slug as string)

    const result = validateCreateHabit(body, existingSlugs)
    if (!result.ok) return json({ error: result.error }, 400)

    const { data, error } = await db
      .from('habits')
      .insert({
        slug: result.slug,
        name: body.name!.trim(),
        emoji: body.emoji!.trim(),
        dose_text: body.dose_text ?? null,
        frequency_per_week: body.frequency_per_week ?? null,
        is_reward: body.is_reward ?? false,
      })
      .select('*')
      .single()
    if (error) return json({ error: error.message }, 500)
    return json({ habit: data }, 201)
  }

  if (req.method === 'PATCH') {
    const body = (await req.json().catch(() => ({}))) as PatchHabitInput
    const result = validatePatchHabit(body)
    if (!result.ok) return json({ error: result.error }, 400)

    const { slug, ...changes } = body
    const update: Record<string, unknown> = {}
    if (changes.name !== undefined) update.name = changes.name.trim()
    if (changes.emoji !== undefined) update.emoji = changes.emoji.trim()
    if (changes.dose_text !== undefined) update.dose_text = changes.dose_text
    if (changes.frequency_per_week !== undefined) {
      update.frequency_per_week = changes.frequency_per_week
    }
    if (changes.is_reward !== undefined) update.is_reward = changes.is_reward
    if (changes.active !== undefined) update.active = changes.active

    const { data, error } = await db
      .from('habits')
      .update(update)
      .eq('slug', slug)
      .select('*')
      .single()
    if (error) return json({ error: error.message }, 500)
    if (!data) return json({ error: `neznámý návyk: ${slug}` }, 404)
    return json({ habit: data })
  }

  return json({ error: 'GET, POST, nebo PATCH only' }, 405)
})
