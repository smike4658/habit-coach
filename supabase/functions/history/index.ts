import { activeHabits, serviceClient } from '../_shared/db.ts'
import { handleOptions, json, requireUser } from '../_shared/http.ts'
import { historyRangeStart, logFileName, pragueToday, toIsoDate } from '../_shared/dates.ts'
import { fetchRepoFileWithSha, GitHubError, githubConfigFromEnv } from '../_shared/github.ts'
import { parseLog } from '../_shared/markdown.ts'

/**
 * Věty dne žijí jen v markdownu (git = zdroj pravdy, DB drží jen transakce) —
 * dotáhni je z log/<měsíc>.md pro celý rozsah. Best-effort: výpadek GitHubu
 * nesmí shodit historii check-inů.
 */
async function sentencesFromGit(
  fromDate: Date,
  today: Date,
): Promise<{ date: string; sentence: string }[]> {
  const cfg = githubConfigFromEnv()
  if (!cfg) return []
  const months: Date[] = []
  let m = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)
  const last = new Date(today.getFullYear(), today.getMonth(), 1)
  while (m <= last) {
    months.push(new Date(m))
    m = new Date(m.getFullYear(), m.getMonth() + 1, 1)
  }
  const files = await Promise.all(
    months.map(async (month) => {
      try {
        return { month, text: (await fetchRepoFileWithSha(cfg, logFileName(month))).text }
      } catch (e) {
        if (e instanceof GitHubError && e.status === 404) return null
        throw e
      }
    }),
  )
  const fromIso = toIsoDate(fromDate)
  const toIso = toIsoDate(today)
  const sentences: { date: string; sentence: string }[] = []
  for (const f of files) {
    if (!f) continue
    for (const day of parseLog(f.text, f.month.getFullYear()).days) {
      if (!day.date || !day.sentence) continue
      const iso = toIsoDate(day.date)
      if (iso >= fromIso && iso <= toIso) sentences.push({ date: iso, sentence: day.sentence })
    }
  }
  return sentences.sort((a, b) => a.date.localeCompare(b.date))
}

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
  const fromDate = historyRangeStart(today, months)
  const from = toIsoDate(fromDate)
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

  let sentences: { date: string; sentence: string }[] = []
  try {
    sentences = await sentencesFromGit(fromDate, today)
  } catch (e) {
    console.error('sentences from git failed:', e)
  }

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
    sentences,
    streaks,
  })
})
