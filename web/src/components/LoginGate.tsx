import { useState } from 'react'
import { supabase } from '../lib/api'

export function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className="rise mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">Habit Coach</p>
      <h1 className="font-display mt-2 text-4xl font-black">Přihlásit se</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        Deník teď běží přes Supabase — přihlas se svým účtem.
      </p>
      <form
        className="mt-8 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          setBusy(true)
          setError(null)
          supabase!.auth
            .signInWithPassword({ email, password })
            .then(({ error }) => {
              if (error) setError(error.message)
              else onLogin()
            })
            .finally(() => setBusy(false))
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e-mail"
          autoComplete="username"
          className="rounded-lg border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-ink-soft"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="heslo"
          autoComplete="current-password"
          className="rounded-lg border border-line bg-white/60 px-4 py-3 text-sm outline-none focus:border-ink-soft"
        />
        <button
          type="submit"
          disabled={busy || !email || !password}
          className="rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-paper transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {busy ? 'Přihlašuji…' : 'Přihlásit'}
        </button>
        {error && <p className="text-sm text-miss">{error}</p>}
      </form>
    </div>
  )
}
