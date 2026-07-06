import { fetchRepoFileWithSha, GitHubError, githubConfigFromEnv } from './github.ts'
import { parseLog, parseWeekPlan } from './markdown.ts'
import { logFileName, planFileName, toIsoDate } from './dates.ts'
import type { Habit } from './db.ts'
import type { serviceClient } from './db.ts'

type Db = ReturnType<typeof serviceClient>

function slugByEmoji(habits: Habit[], text: string): string | null {
  const emoji = text.match(/^\p{Extended_Pictographic}/u)?.[0]
  return habits.find((h) => emoji && h.emoji.startsWith(emoji))?.slug ?? null
}

/** Mirror plans/<week>.md → plans table. Returns number of upserted days, null when file missing. */
export async function syncPlansForDate(db: Db, habits: Habit[], date: Date): Promise<number | null> {
  const cfg = githubConfigFromEnv()
  if (!cfg) return null
  let md: string
  try {
    md = (await fetchRepoFileWithSha(cfg, planFileName(date))).text
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null
    throw e
  }
  const plan = parseWeekPlan(md, date.getFullYear())
  const slugs = plan.columns.map((c) => slugByEmoji(habits, c))
  const rows = plan.days
    .filter((d) => d.date)
    .map((d) => ({
      week_iso: planFileName(date).replace('plans/', '').replace('.md', ''),
      day_date: toIsoDate(d.date!),
      items: {
        label: d.label,
        note: d.note,
        detail: d.detail,
        items: d.items.map((text, i) => ({ slug: slugs[i], column: plan.columns[i], text })),
      },
      generated_by: 'sync-plans',
    }))
  if (rows.length === 0) return 0
  const { error } = await db.from('plans').upsert(rows, { onConflict: 'week_iso,day_date' })
  if (error) throw error
  return rows.length
}

/** Import log/<month>.md → checkins (idempotent). Returns upserted count, null when file missing. */
export async function syncLogMonth(db: Db, habits: Habit[], date: Date): Promise<number | null> {
  const cfg = githubConfigFromEnv()
  if (!cfg) return null
  let md: string
  try {
    md = (await fetchRepoFileWithSha(cfg, logFileName(date))).text
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null
    throw e
  }
  const log = parseLog(md, date.getFullYear())
  const rows = log.days.flatMap((day) =>
    !day.date ? [] : day.entries.flatMap((e) => {
      const slug = slugByEmoji(habits, e.habit)
      const habit = habits.find((h) => h.slug === slug)
      if (!habit || !e.status) return []
      return [{
        habit_id: habit.id,
        date: toIsoDate(day.date!),
        status: e.status,
        note: e.note || null,
        source: 'coach' as const,
      }]
    })
  )
  if (rows.length === 0) return 0
  const { error } = await db.from('checkins').upsert(rows, { onConflict: 'habit_id,date' })
  if (error) throw error
  return rows.length
}
