import { describe, expect, test, vi } from 'vitest'
import { commitRepoFile, fetchRepoFileWithSha } from './github'

const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)))

describe('fetchRepoFileWithSha', () => {
  test('returns decoded text together with blob sha', async () => {
    const f = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ content: b64('ahoj ✅'), sha: 'abc123' }),
    })) as unknown as typeof fetch
    const { text, sha } = await fetchRepoFileWithSha('log/2026-07.md', 'tok', f)
    expect(text).toBe('ahoj ✅')
    expect(sha).toBe('abc123')
  })
})

describe('commitRepoFile', () => {
  test('PUTs base64 UTF-8 content with message and sha', async () => {
    const f = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ content: { sha: 'new' } }),
    })) as unknown as typeof fetch
    await commitRepoFile('log/2026-07.md', 'obsah ✅', 'checkin: test', 'abc123', 'tok', f)
    const [url, init] = (f as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe(
      'https://api.github.com/repos/smike4658/selfimprovement/contents/log/2026-07.md',
    )
    expect(init.method).toBe('PUT')
    const body = JSON.parse(init.body)
    expect(body.message).toBe('checkin: test')
    expect(body.sha).toBe('abc123')
    expect(body.content).toBe(b64('obsah ✅'))
  })

  test('omits sha when creating a new file', async () => {
    const f = vi.fn(async () => ({
      ok: true,
      status: 201,
      json: async () => ({ content: { sha: 'new' } }),
    })) as unknown as typeof fetch
    await commitRepoFile('log/2026-08.md', 'x', 'msg', null, 'tok', f)
    const body = JSON.parse((f as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect('sha' in body).toBe(false)
  })

  test('throws GitHubError on conflict (409/422)', async () => {
    const f = vi.fn(async () => ({
      ok: false,
      status: 409,
      json: async () => ({ message: 'conflict' }),
    })) as unknown as typeof fetch
    await expect(commitRepoFile('log/x.md', 'x', 'm', 'old', 'tok', f)).rejects.toMatchObject({
      status: 409,
    })
  })
})
