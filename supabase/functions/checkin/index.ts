import { activeHabits, serviceClient } from '../_shared/db.ts'
import { handleOptions, json, requireUser } from '../_shared/http.ts'
import { dayLabelFor, logFileName, pragueToday, toIsoDate } from '../_shared/dates.ts'
import { commitRepoFile, fetchRepoFileWithSha, GitHubError, githubConfigFromEnv } from '../_shared/github.ts'
import { setCheckin, setSentence } from '../_shared/logEdit.ts'
import type { CheckinStatus } from '../_shared/markdown.ts'

const MARKS: Record<CheckinStatus, string> = { done: '✅', skipped: '❌', unplanned: '➖' }
const STATUSES: CheckinStatus[] = ['done', 'skipped', 'unplanned']

interface Body {
  habit_slug?: string
  status?: CheckinStatus
  note?: string
  sentence?: string
  source?: 'web' | 'wear' | 'android' | 'coach' | 'health'
}

/** Zápis do markdown logu (git = zdroj pravdy). Vrací true při úspěchu. */
async function mirrorToGit(body: Required<Pick<Body, 'habit_slug'>> & Body, habitLine: string) {
  const cfg = githubConfigFromEnv()
  if (!cfg) return false
  const today = pragueToday()
  const path = logFileName(today)
  let text: string
  let sha: string | null
  try {
    ;({ text, sha } = await fetchRepoFileWithSha(cfg, path))
  } catch (e) {
    if (!(e instanceof GitHubError && e.status === 404)) throw e
    const month = new Intl.DateTimeFormat('cs-CZ', { month: 'long' }).format(today)
    text = `# Log — ${month} ${today.getFullYear()}\n\nFormát: \`✅/❌/➖\` (splněno / vynecháno / neplánováno) + jedna věta.\n`
    sha = null
  }
  const label = dayLabelFor(today)
  // existující řádek návyku v sekci najdi podle emoji (např. "♟️ Šachy (bonus)")
  const emoji = habitLine.match(/^\p{Extended_Pictographic}/u)?.[0]
  const section = text.split(`## ${label}`)[1]?.split(/\n##\s/)[0] ?? ''
  const existing = emoji ? section.match(new RegExp(`^-\\s+(${emoji}[^:]*):`, 'mu'))?.[1]?.trim() : null

  let updated = text
  let message: string
  if (body.status && body.habit_slug) {
    updated = setCheckin(updated, label, existing ?? habitLine, body.status, body.note)
    message = `checkin: ${label} ${emoji ?? body.habit_slug} ${MARKS[body.status]} (api)`
  } else {
    message = `checkin: ${label} věta dne (api)`
  }
  if (body.sentence !== undefined) {
    updated = setSentence(updated, label, body.sentence)
  }
  if (updated === text) return false
  await commitRepoFile(cfg, path, updated, message, sha)
  return true
}

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options
  const unauthorized = requireUser(req)
  if (unauthorized) return unauthorized
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  const body = (await req.json().catch(() => ({}))) as Body
  if (!body.habit_slug && body.sentence === undefined) {
    return json({ error: 'habit_slug+status nebo sentence je povinné' }, 400)
  }

  const db = serviceClient()
  const habits = await activeHabits(db)
  let habitLine = ''

  if (body.habit_slug) {
    if (!body.status || !STATUSES.includes(body.status)) {
      return json({ error: `status musí být jedno z: ${STATUSES.join(', ')}` }, 400)
    }
    const habit = habits.find((h) => h.slug === body.habit_slug)
    if (!habit) return json({ error: `neznámý návyk: ${body.habit_slug}` }, 404)
    habitLine = `${habit.emoji} ${habit.name}`

    const { error } = await db.from('checkins').upsert(
      {
        habit_id: habit.id,
        date: toIsoDate(pragueToday()),
        status: body.status,
        note: body.note ?? null,
        source: body.source ?? 'web',
      },
      { onConflict: 'habit_id,date' },
    )
    if (error) return json({ error: error.message }, 500)
  }

  // git mirror je best-effort — check-in v DB platí i při výpadku GitHubu
  let mirrored = false
  try {
    mirrored = await mirrorToGit(body as Required<Pick<Body, 'habit_slug'>> & Body, habitLine)
  } catch (e) {
    console.error('git mirror failed:', e)
  }

  return json({ ok: true, mirrored })
})
