import type { CheckinStatus } from './markdown.ts'

const MARKS: Record<CheckinStatus, string> = {
  done: '✅',
  skipped: '❌',
  unplanned: '➖',
}

const MARK_RE = /^(✅|❌|➖)\s*/

interface Section {
  start: number
  end: number
}

function findSection(lines: string[], dayLabel: string): Section {
  const start = lines.findIndex((l) => l.trim() === `## ${dayLabel}`)
  if (start === -1) return { start: -1, end: -1 }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      end = i
      break
    }
  }
  return { start, end }
}

function ensureSection(lines: string[], dayLabel: string): Section {
  const found = findSection(lines, dayLabel)
  if (found.start !== -1) return found
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop()
  lines.push('', `## ${dayLabel}`)
  return { start: lines.length - 1, end: lines.length }
}

function setLine(md: string, dayLabel: string, key: string, value: string): string {
  const lines = md.split('\n')
  const section = ensureSection(lines, dayLabel)
  const prefix = `- ${key}:`
  for (let i = section.start + 1; i < section.end; i++) {
    if (lines[i].startsWith(prefix)) {
      lines[i] = `${prefix} ${value}`.trimEnd()
      return lines.join('\n')
    }
  }
  lines.splice(section.end, 0, `${prefix} ${value}`.trimEnd())
  return lines.join('\n')
}

function currentNote(md: string, dayLabel: string, habit: string): string {
  const lines = md.split('\n')
  const section = findSection(lines, dayLabel)
  if (section.start === -1) return ''
  const prefix = `- ${habit}:`
  const line = lines.slice(section.start + 1, section.end).find((l) => l.startsWith(prefix))
  return line ? line.slice(prefix.length).trim().replace(MARK_RE, '') : ''
}

export function setCheckin(
  md: string,
  dayLabel: string,
  habit: string,
  status: CheckinStatus,
  note?: string,
): string {
  const keptNote = note ?? currentNote(md, dayLabel, habit)
  return setLine(md, dayLabel, habit, `${MARKS[status]} ${keptNote}`.trim())
}

export function setSentence(md: string, dayLabel: string, sentence: string): string {
  return setLine(md, dayLabel, 'Věta dne', sentence.trim())
}
