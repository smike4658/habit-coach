export const DATA_REPO = 'smike4658/selfimprovement'

export class GitHubError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'GitHubError'
    this.status = status
  }
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function errorFrom(res: { status: number; json: () => Promise<unknown> }) {
  const body = (await res.json().catch(() => ({}))) as { message?: string }
  return new GitHubError(res.status, body.message ?? `GitHub API error ${res.status}`)
}

function decodeContent(content: string): string {
  const bytes = Uint8Array.from(atob(content.replace(/\n/g, '')), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function encodeContent(text: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)))
}

/** Fetch a file from the data repo via the Contents API; returns text and blob sha. */
export async function fetchRepoFileWithSha(
  path: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ text: string; sha: string }> {
  const res = await fetchImpl(`https://api.github.com/repos/${DATA_REPO}/contents/${path}`, {
    headers: headers(token),
  })
  if (!res.ok) throw await errorFrom(res)
  const data = (await res.json()) as { content: string; sha: string }
  return { text: decodeContent(data.content), sha: data.sha }
}

/** Fetch a file from the data repo via the Contents API and return its text (UTF-8). */
export async function fetchRepoFile(
  path: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const { text } = await fetchRepoFileWithSha(path, token, fetchImpl)
  return text
}

/** Create or update a file in the data repo (one commit). Pass sha=null for a new file. */
export async function commitRepoFile(
  path: string,
  text: string,
  message: string,
  sha: string | null,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const res = await fetchImpl(`https://api.github.com/repos/${DATA_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: encodeContent(text),
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) throw await errorFrom(res)
}
