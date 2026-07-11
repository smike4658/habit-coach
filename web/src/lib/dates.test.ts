import { describe, expect, test } from 'vitest'
import { isoWeekId, logFileName, parseDayLabel, planFileName, toIsoDate } from './dates'

describe('toIsoDate', () => {
  test('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(toIsoDate(new Date(2026, 6, 9))).toBe('2026-07-09')
    expect(toIsoDate(new Date(2026, 0, 1))).toBe('2026-01-01')
  })
})

describe('isoWeekId', () => {
  test('returns ISO week id for a mid-week date', () => {
    expect(isoWeekId(new Date(2026, 6, 6))).toBe('2026-W28') // Po 6.7.2026
  })

  test('handles year boundary (Jan 1 belonging to previous year week)', () => {
    expect(isoWeekId(new Date(2027, 0, 1))).toBe('2026-W53')
  })
})

describe('file names', () => {
  test('planFileName builds plans/ path from date', () => {
    expect(planFileName(new Date(2026, 6, 6))).toBe('plans/2026-W28.md')
  })

  test('logFileName builds log/ path from date', () => {
    expect(logFileName(new Date(2026, 6, 6))).toBe('log/2026-07.md')
  })
})

describe('parseDayLabel', () => {
  test('parses "Po 6.7." with year context into a date', () => {
    const d = parseDayLabel('Po 6.7.', 2026)
    expect(d?.getFullYear()).toBe(2026)
    expect(d?.getMonth()).toBe(6)
    expect(d?.getDate()).toBe(6)
  })

  test('parses label with trailing text after date', () => {
    const d = parseDayLabel('Ne 12.7.', 2026)
    expect(d?.getDate()).toBe(12)
  })

  test('returns null for non-day text', () => {
    expect(parseDayLabel('Den', 2026)).toBeNull()
  })
})
