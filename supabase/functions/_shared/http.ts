export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function handleOptions(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response('ok', { headers: corsHeaders }) : null
}

/**
 * Single-user ochrana: verify_jwt pustí i anon key, proto navíc vyžadujeme
 * JWT přihlášeného uživatele (role=authenticated z Supabase Auth), nebo
 * service_role (cron joby přes pg_cron/pg_net).
 */
export function requireUser(req: Request): Response | null {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '')
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.role === 'authenticated' || payload.role === 'service_role') return null
  } catch {
    // spadne níž na 401
  }
  return json({ error: 'Přihlášení vyžadováno (Supabase Auth)' }, 401)
}
