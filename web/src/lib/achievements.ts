import { toIsoDate } from './dates'
import type { CheckinStatus, LogDay } from './markdown'

/**
 * Odznaky = milníky kontinuity v jazyce Habitnautu (viz BRANDING.md).
 * Záměrně žádné XP/body/levely — odměňujeme zápis, návrat a stabilitu,
 * ne výkon (feature matrix W3.1, sekce VYNECHAT).
 */
export interface Achievement {
  id: string
  emoji: string
  name: string
  desc: string
  earned: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** Nejdelší řada po sobě jdoucích kalendářních dní se záznamem (jakýkoli vyplněný stav). */
function longestRecordRun(days: LogDay[]): number {
  const dates = [
    ...new Map(
      days
        .filter((d) => d.date && d.entries.some((e) => e.status !== null))
        .map((d) => [toIsoDate(d.date!), d.date!] as const),
    ).values(),
  ].sort((a, b) => a.getTime() - b.getTime())

  let longest = 0
  let run = 0
  let prev: Date | null = null
  for (const date of dates) {
    run = prev && date.getTime() - prev.getTime() === DAY_MS ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = date
  }
  return longest
}

/** habit → (iso datum → stav) pro dotazy na konkrétní dny. */
function statusByHabitAndDate(days: LogDay[]): Map<string, Map<string, CheckinStatus>> {
  const map = new Map<string, Map<string, CheckinStatus>>()
  for (const day of days) {
    if (!day.date) continue
    for (const e of day.entries) {
      if (!e.status) continue
      if (!map.has(e.habit)) map.set(e.habit, new Map())
      map.get(e.habit)!.set(toIsoDate(day.date), e.status)
    }
  }
  return map
}

/** ❌ následované ✅ hned další den u téhož návyku. */
function hasComeback(days: LogDay[]): boolean {
  for (const [, byDate] of statusByHabitAndDate(days)) {
    for (const [iso, status] of byDate) {
      if (status !== 'missed') continue
      const [y, m, d] = iso.split('-').map(Number)
      const next = toIsoDate(addDays(new Date(y, m - 1, d), 1))
      if (byDate.get(next) === 'done') return true
    }
  }
  return false
}

/** Posledních 28 dní bez dvou missed po sobě u téhož návyku (a s ≥28 dny historie). */
function isStableOrbit(days: LogDay[], today: Date): boolean {
  const windowStart = addDays(today, -27)
  const dated = days.filter((d) => d.date && d.entries.some((e) => e.status !== null))
  if (dated.length === 0) return false
  const earliest = dated.reduce((min, d) => (d.date! < min ? d.date! : min), dated[0].date!)
  if (earliest > windowStart) return false

  const inWindow = dated
    .filter((d) => d.date! >= windowStart)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())
  if (inWindow.length === 0) return false

  const seqByHabit = new Map<string, CheckinStatus[]>()
  for (const day of inWindow) {
    for (const e of day.entries) {
      if (e.status !== 'done' && e.status !== 'missed' && e.status !== 'excused') continue
      if (!seqByHabit.has(e.habit)) seqByHabit.set(e.habit, [])
      seqByHabit.get(e.habit)!.push(e.status)
    }
  }
  for (const [, seq] of seqByHabit) {
    for (let i = 1; i < seq.length; i++) {
      if (seq[i] === 'missed' && seq[i - 1] === 'missed') return false
    }
  }
  return true
}

export function computeAchievements(days: LogDay[], today: Date): Achievement[] {
  const run = longestRecordRun(days)
  return [
    {
      id: 'prvni-orbita',
      emoji: '🛰️',
      name: 'První orbita',
      desc: '7 dní v řadě se záznamem',
      earned: run >= 7,
    },
    {
      id: 'stabilni-orbita',
      emoji: '🌍',
      name: 'Stabilní orbita',
      desc: '28 dní bez „2× po sobě"',
      earned: isStableOrbit(days, today),
    },
    {
      id: 'comeback',
      emoji: '🚀',
      name: 'Comeback',
      desc: 'po ❌ hned další den ✅',
      earned: hasComeback(days),
    },
    {
      id: 'mesic-na-orbite',
      emoji: '🌕',
      name: 'Měsíc na orbitě',
      desc: '30 dní v řadě se záznamem',
      earned: run >= 30,
    },
    {
      id: 'deep-space',
      emoji: '🌌',
      name: 'Deep space',
      desc: '100 dní v řadě se záznamem',
      earned: run >= 100,
    },
  ]
}
