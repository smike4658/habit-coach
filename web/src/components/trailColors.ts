/** Barvy turistických značek (identita úseku) — oddělené od komponent kvůli fast-refresh. */

export type TrailColor = 'red' | 'blue' | 'green' | 'yellow'

export const TRAIL_COLORS: TrailColor[] = ['red', 'blue', 'green', 'yellow']

/** Deterministická barva značky z pořadí návyku (dokud není v datech marker_color). */
export function markerColorForIndex(i: number): TrailColor {
  return TRAIL_COLORS[i % TRAIL_COLORS.length]
}
