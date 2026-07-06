import { activeHabits, serviceClient } from '../_shared/db.ts'
import { handleOptions, json, requireUser } from '../_shared/http.ts'
import { pragueToday } from '../_shared/dates.ts'
import { syncPlansForDate } from '../_shared/sync.ts'

/** Mirror plans/<aktuální týden>.md (+ příští týden) do tabulky plans. */
Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  const unauthorized = requireUser(req)
  if (unauthorized) return unauthorized

  const db = serviceClient()
  const habits = await activeHabits(db)
  const today = pragueToday()
  const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)

  const current = await syncPlansForDate(db, habits, today)
  const next = await syncPlansForDate(db, habits, nextWeek).catch(() => null)

  if (current === null && !Deno.env.get('GITHUB_SYNC_TOKEN')) {
    return json({ error: 'GITHUB_SYNC_TOKEN secret není nastaven' }, 500)
  }
  return json({ ok: true, current_week_days: current, next_week_days: next })
})
