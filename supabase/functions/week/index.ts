import { serviceClient } from '../_shared/db.ts'
import { handleOptions, json, requireUser } from '../_shared/http.ts'
import { isoWeekId, pragueToday } from '../_shared/dates.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  const unauthorized = requireUser(req)
  if (unauthorized) return unauthorized

  const url = new URL(req.url)
  const iso = url.searchParams.get('iso') ?? isoWeekId(pragueToday())
  if (!/^\d{4}-W\d{2}$/.test(iso)) return json({ error: 'iso musí být např. 2026-W28' }, 400)

  const db = serviceClient()
  const { data: days, error: pErr } = await db
    .from('plans')
    .select('*')
    .eq('week_iso', iso)
    .order('day_date')
  if (pErr) return json({ error: pErr.message }, 500)

  const dates = (days ?? []).map((d) => d.day_date as string)
  let checkins: unknown[] = []
  if (dates.length > 0) {
    const { data, error } = await db
      .from('checkins')
      .select('date, status, note, source, habits!inner(slug)')
      .in('date', dates)
    if (error) return json({ error: error.message }, 500)
    checkins = data ?? []
  }

  const { data: streaks, error: sErr } = await db.from('habit_streaks').select('*')
  if (sErr) return json({ error: sErr.message }, 500)

  return json({ iso, days: days ?? [], checkins, streaks })
})
