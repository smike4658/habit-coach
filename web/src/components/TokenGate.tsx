import { useState } from 'react'

export function TokenGate({ onSave }: { onSave: (token: string) => void }) {
  const [value, setValue] = useState('')

  return (
    <div className="rise mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">Habit Coach</p>
      <h1 className="font-display mt-2 text-4xl font-black">Připojit deník</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        Dashboard čte tvoje plány a log z privátního repa{' '}
        <span className="font-mono text-xs">smike4658/selfimprovement</span>. Potřebuje
        fine-grained personal access token — jen pro toto repo, oprávnění{' '}
        <em>Contents: Read-only</em>.
      </p>
      <form
        className="mt-8 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (value.trim()) onSave(value.trim())
        }}
      >
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="github_pat_…"
          autoComplete="off"
          className="rounded-lg border border-line bg-white/60 px-4 py-3 font-mono text-sm outline-none focus:border-ink-soft"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-paper transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          Uložit a načíst
        </button>
      </form>
      <p className="mt-4 text-xs text-ink-faint">
        Token se ukládá jen do localStorage v tomto prohlížeči.{' '}
        <a
          className="underline"
          href="https://github.com/settings/personal-access-tokens/new"
          target="_blank"
          rel="noreferrer"
        >
          Vytvořit token na GitHubu →
        </a>
      </p>
    </div>
  )
}
