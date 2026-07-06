import { describe, expect, test, vi } from 'vitest'
import { fetchRepoFile, GitHubError } from './github'

function fakeFetch(status: number, body: unknown) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch
}

describe('fetchRepoFile', () => {
  test('requests Contents API with token and decodes base64 UTF-8 content', async () => {
    // "# Týden 1 — ✅" base64-encoded (UTF-8)
    const content = btoa(String.fromCharCode(...new TextEncoder().encode('# Týden 1 — ✅')))
    const f = fakeFetch(200, { content, encoding: 'base64' })
    const text = await fetchRepoFile('plans/2026-W28.md', 'tok123', f)
    expect(text).toBe('# Týden 1 — ✅')
    const [url, init] = (f as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe(
      'https://api.github.com/repos/smike4658/selfimprovement/contents/plans/2026-W28.md',
    )
    expect(init.headers.Authorization).toBe('Bearer tok123')
  })

  test('throws GitHubError with status on 404', async () => {
    const f = fakeFetch(404, { message: 'Not Found' })
    await expect(fetchRepoFile('plans/nope.md', 'tok', f)).rejects.toMatchObject({
      status: 404,
    })
    await expect(fetchRepoFile('plans/nope.md', 'tok', f)).rejects.toBeInstanceOf(GitHubError)
  })
})
