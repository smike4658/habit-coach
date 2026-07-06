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

async function errorFrom(res: Response) {
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

export interface GitHubConfig {
  repo: string
  token: string
}

export function githubConfigFromEnv(): GitHubConfig | null {
  const token = Deno.env.get('GITHUB_SYNC_TOKEN')
  const repo = Deno.env.get('DATA_REPO') ?? 'smike4658/selfimprovement'
  return token ? { repo, token } : null
}

export async function fetchRepoFileWithSha(
  cfg: GitHubConfig,
  path: string,
): Promise<{ text: string; sha: string }> {
  const res = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${path}`, {
    headers: headers(cfg.token),
  })
  if (!res.ok) throw await errorFrom(res)
  const data = (await res.json()) as { content: string; sha: string }
  return { text: decodeContent(data.content), sha: data.sha }
}

export async function commitRepoFile(
  cfg: GitHubConfig,
  path: string,
  text: string,
  message: string,
  sha: string | null,
): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${cfg.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers(cfg.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: encodeContent(text), ...(sha ? { sha } : {}) }),
  })
  if (!res.ok) throw await errorFrom(res)
}
