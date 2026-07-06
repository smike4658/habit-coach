export const DATA_REPO = 'smike4658/selfimprovement'

export class GitHubError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'GitHubError'
    this.status = status
  }
}

/** Fetch a file from the data repo via the Contents API and return its text (UTF-8). */
export async function fetchRepoFile(
  path: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const res = await fetchImpl(`https://api.github.com/repos/${DATA_REPO}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new GitHubError(res.status, body.message ?? `GitHub API error ${res.status}`)
  }
  const data = (await res.json()) as { content: string }
  const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
