import { activeHabits, serviceClient } from '../_shared/db.ts'
import { handleOptions, json, requireUser } from '../_shared/http.ts'
import { historyRangeStart, pragueToday, toIsoDate } from '../_shared/dates.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  const unauthorized = requireUser(req)
  if (unauthorized) return unauthorized

  const url = new URL(req.url)
  const monthsParam = url.searchParams.get('months') ?? '3'
  const months = Number(monthsParam)
  if (!Number.isInteger(months) || months < 1 || months > 24) {
    return json({ error: 'months musí být celé číslo 1–24' }, 400)
  }

  const db = serviceClient()
  const today = pragueToday()
  const from = toIsoDate(historyRangeStart(today, months))
  const to = toIsoDate(today)

  const { data: checkins, error: cErr } = await db
    .from('checkins')
    .select('date, status, note, habits!inner(slug)')
    .gte('date', from)
    .lte('date', to)
    .order('date')
  if (cErr) return json({ error: cErr.message }, 500)

  const habits = await activeHabits(db)

  const { data: streaks, error: sErr } = await db.from('habit_streaks').select('*')
  if (sErr) return json({ error: sErr.message }, 500)

  return json({
    from,
    to,
    habits,
    checkins: (checkins ?? []).map((c) => {
      const { habits: h, ...rest } = c as unknown as {
        habits: { slug: string }
        date: string
        status: string
        note: string | null
      }
      return { ...rest, slug: h.slug }
    }),
    streaks,
  })
})
