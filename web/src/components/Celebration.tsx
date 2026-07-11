const PIECES = ['🎉', '✨', '🍃', '🌲', '🎊', '✨', '🥾', '🍃']

/** Mikro-oslava po splnění všech dnešních návyků. Čistě vizuální, zmizí sama. */
export function Celebration() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="celebrate-piece absolute text-2xl"
          style={{
            left: `${8 + i * 12}%`,
            animationDelay: `${i * 0.12}s`,
          }}
        >
          {p}
        </span>
      ))}
      <div className="celebrate-pop absolute inset-0 flex items-center justify-center">
        <span className="rounded-2xl border border-done bg-done-soft px-6 py-4 text-center shadow-[4px_4px_0_0_var(--color-line)]">
          <span className="block text-3xl">🥾</span>
          <span className="mt-1 block text-sm font-bold text-ink">Etapa dojita!</span>
        </span>
      </div>
    </div>
  )
}
