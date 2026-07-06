import { describe, expect, test, vi } from 'vitest'
import { dayLabelFor, submitCheckin, submitSentence } from './checkinService'

const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)))
const fromB64 = (s: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)))

const LOG = `# Log — červenec 2026

## Po 6.7.
- 💪 Cvičení:
- 📖 Čtení:
- 🧠 QA/AI:
- ♟️ Šachy (bonus):
- Věta dne:
`

function fakeApi(getStatus: number, getBody: unknown) {
  const puts: { url: string; body: { message: string; content: string; sha?: string } }[] = []
  const f = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      puts.push({ url, body: JSON.parse(init.body as string) })
      return { ok: true, status: 200, json: async () => ({}) }
    }
    return { ok: getStatus < 400, status: getStatus, json: async () => getBody }
  }) as unknown as typeof fetch
  return { f, puts }
}

const MONDAY = new Date(2026, 6, 6)

describe('dayLabelFor', () => {
  test('builds Czech day label like the coach writes', () => {
    expect(dayLabelFor(MONDAY)).toBe('Po 6.7.')
    expect(dayLabelFor(new Date(2026, 6, 12))).toBe('Ne 12.7.')
  })
})

describe('submitCheckin', () => {
  test('updates existing log via one commit, matching habit by emoji', async () => {
    const { f, puts } = fakeApi(200, { content: b64(LOG), sha: 'sha1' })
    await submitCheckin('tok', MONDAY, '💪 Cvičení (10 min)', 'done', 'Trénink A', f)
    expect(puts).toHaveLength(1)
    expect(puts[0].url).toContain('log/2026-07.md')
    expect(puts[0].body.sha).toBe('sha1')
    expect(puts[0].body.message).toContain('💪')
    expect(fromB64(puts[0].body.content)).toContain('- 💪 Cvičení: ✅ Trénink A')
  })

  test('creates log file for a new month when it does not exist', async () => {
    const { f, puts } = fakeApi(404, { message: 'Not Found' })
    await submitCheckin('tok', new Date(2026, 7, 1), '📖 Čtení (15 min)', 'done', undefined, f)
    expect(puts).toHaveLength(1)
    expect(puts[0].url).toContain('log/2026-08.md')
    expect(puts[0].body.sha).toBeUndefined()
    const text = fromB64(puts[0].body.content)
    expect(text).toContain('## So 1.8.')
    expect(text).toContain('- 📖 Čtení: ✅')
  })
})

describe('submitSentence', () => {
  test('writes the day sentence', async () => {
    const { f, puts } = fakeApi(200, { content: b64(LOG), sha: 'sha1' })
    await submitSentence('tok', MONDAY, 'dobrý den', f)
    expect(fromB64(puts[0].body.content)).toContain('- Věta dne: dobrý den')
  })
})
