/** Stezka stavební prvky: turistická značka + navigační ikony (docs/design/design-system.md §2.3, §6). */
import type { TrailColor } from './trailColors'

const MARK_BG: Record<TrailColor, string> = {
  red: 'bg-trail-red',
  blue: 'bg-trail-blue',
  green: 'bg-trail-green',
  yellow: 'bg-trail-yellow',
}

/** Turistická značka: bílá–barva–bílá. Identita úseku (samostatný kanál od stavu). */
export function TrailMark({ color, faded = false }: { color: TrailColor; faded?: boolean }) {
  return (
    <span className="flex h-[22px] w-[30px] shrink-0 flex-col overflow-hidden rounded-[4px] shadow-[0_1px_0_rgba(42,36,22,0.25),inset_0_0_0_1px_rgba(42,36,22,0.18)]">
      <i className="flex-1 bg-white-warm" />
      <i className={`flex-[1.2] ${MARK_BG[color]} ${faded ? 'opacity-30' : ''}`} />
      <i className="flex-1 bg-white-warm" />
    </span>
  )
}

const ICON = 'h-[22px] w-[22px]'

/** Poutník na klikaté pěšině. */
export function IconTrail({ active = false }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={ICON}>
      <path d="M4 20c3-1 4-4 5-8s2-7 7-8" />
      <circle cx="19" cy="4" r="1.6" fill={active ? 'currentColor' : 'none'} stroke="none" />
    </svg>
  )
}

/** Mapa s vrstevnicí a pěšinou. */
export function IconMap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={ICON}>
      <path d="M4 4h16v16H4z M4 9h16 M9 4v16" opacity=".55" />
      <path d="M6 17c2-3 3-6 6-6" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

/** Seznam úseků s cedulkou. */
export function IconList() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={ICON}>
      <path d="M5 5h14M5 10h14M5 15h9" />
      <rect x="4" y="18" width="7" height="3" rx="1.2" />
    </svg>
  )
}
