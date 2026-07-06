import { activeHabits, serviceClient } from '../_shared/db.ts'
import { handleOptions, json, requireUser } from '../_shared/http.ts'
import { pragueToday } from '../_shared/dates.ts'
import { syncLogMonth } from '../_shared/sync.ts'

/** Import log/<měsíc>.md → checkins (aktuální + předchozí měsíc). Idempotentní. */
Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  const unauthorized = requireUser(req)
  if (unauthorized) return unauthorized

  const db = serviceClient()
  const habits = await activeHabits(db)
  const today = pragueToday()
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

  const current = await syncLogMonth(db, habits, today)
  const previous = await syncLogMonth(db, habits, prevMonth)

  if (current === null && !Deno.env.get('GITHUB_SYNC_TOKEN')) {
    return json({ error: 'GITHUB_SYNC_TOKEN secret není nastaven' }, 500)
  }
  return json({ ok: true, current_month: current, previous_month: previous })
})
