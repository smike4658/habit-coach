import { activeHabits, serviceClient } from '../_shared/db.ts'
import { handleOptions, json, requireUser } from '../_shared/http.ts'
import { pragueToday, toIsoDate } from '../_shared/dates.ts'
import { syncPlansForDate } from '../_shared/sync.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  const unauthorized = requireUser(req)
  if (unauthorized) return unauthorized

  const db = serviceClient()
  const habits = await activeHabits(db)
  const today = pragueToday()
  const date = toIsoDate(today)

  let { data: plan } = await db.from('plans').select('*').eq('day_date', date).maybeSingle()
  if (!plan) {
    // lazy mirror: plán pro tento týden ještě není v DB → zkus stáhnout z gitu
    await syncPlansForDate(db, habits, today).catch(() => null)
    plan = (await db.from('plans').select('*').eq('day_date', date).maybeSingle()).data
  }

  const { data: checkins, error: cErr } = await db
    .from('checkins')
    .select('status, note, source, habits!inner(slug)')
    .eq('date', date)
  if (cErr) return json({ error: cErr.message }, 500)

  const { data: streaks, error: sErr } = await db.from('habit_streaks').select('*')
  if (sErr) return json({ error: sErr.message }, 500)

  return json({
    date,
    plan: plan?.items ?? null,
    checkins: Object.fromEntries(
      (checkins ?? []).map((c) => {
        const { habits: h, ...rest } = c as unknown as {
          habits: { slug: string }
          status: string
          note: string | null
          source: string
        }
        return [h.slug, rest]
      }),
    ),
    streaks,
  })
})
