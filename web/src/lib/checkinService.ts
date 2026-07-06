import { logFileName, parseDayLabel, sameDay } from './dates'
import { commitRepoFile, fetchRepoFileWithSha, GitHubError } from './github'
import { setCheckin, setSentence } from './logEdit'
import type { CheckinStatus } from './markdown'

const WEEKDAYS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']

/** Day label in the coach's log format, e.g. "Po 6.7." */
export function dayLabelFor(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}.`
}

const MARKS: Record<CheckinStatus, string> = { done: '✅', missed: '❌', unplanned: '➖' }

/** Plan column ("💪 Cvičení (10 min)") → log habit key ("💪 Cvičení"). */
function habitKeyFromColumn(column: string): string {
  return column.replace(/\s*\(.*\)\s*$/, '').trim()
}

async function loadLog(token: string, date: Date, fetchImpl: typeof fetch) {
  const path = logFileName(date)
  try {
    const { text, sha } = await fetchRepoFileWithSha(path, token, fetchImpl)
    return { path, text, sha }
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) {
      const month = new Intl.DateTimeFormat('cs-CZ', { month: 'long' }).format(date)
      return {
        path,
        text: `# Log — ${month} ${date.getFullYear()}\n\nFormát: \`✅/❌/➖\` (splněno / vynecháno / neplánováno) + jedna věta.\n`,
        sha: null,
      }
    }
    throw e
  }
}

/** Section label for the date: reuse the one already in the log, else the default format. */
function labelInLog(text: string, date: Date): string {
  const headings = text.match(/^##\s+(.+)$/gm) ?? []
  for (const h of headings) {
    const label = h.replace(/^##\s+/, '').trim()
    const d = parseDayLabel(label, date.getFullYear())
    if (d && sameDay(d, date)) return label
  }
  return dayLabelFor(date)
}

/** Existing habit key in the day's section matching the column emoji, else the derived key. */
function habitKeyInLog(text: string, label: string, column: string): string {
  const emoji = column.match(/^\p{Extended_Pictographic}/u)?.[0]
  if (emoji) {
    const section = text.split(`## ${label}`)[1]?.split(/\n##\s/)[0] ?? ''
    const line = section.match(new RegExp(`^-\\s+(${emoji}[^:]*):`, 'mu'))
    if (line) return line[1].trim()
  }
  return habitKeyFromColumn(column)
}

export async function submitCheckin(
  token: string,
  date: Date,
  habitColumn: string,
  status: CheckinStatus,
  note?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const { path, text, sha } = await loadLog(token, date, fetchImpl)
  const label = labelInLog(text, date)
  const habit = habitKeyInLog(text, label, habitColumn)
  const updated = setCheckin(text, label, habit, status, note)
  const message = `checkin: ${label} ${habit.split(' ')[0]} ${MARKS[status]} (web)`
  await commitRepoFile(path, updated, message, sha, token, fetchImpl)
}

export async function submitSentence(
  token: string,
  date: Date,
  sentence: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const { path, text, sha } = await loadLog(token, date, fetchImpl)
  const label = labelInLog(text, date)
  const updated = setSentence(text, label, sentence)
  await commitRepoFile(path, updated, `checkin: ${label} věta dne (web)`, sha, token, fetchImpl)
}
