// Habits CRUD — validation + slug helpers shared by the habits Edge Function.

export interface HabitRow {
  id: string
  slug: string
  name: string
  emoji: string
  phase: number
  dose_text: string | null
  frequency_per_week: number | null
  is_reward: boolean
  active: boolean
  created_at: string
}

const DIACRITICS: Record<string, string> = {
  á: 'a', č: 'c', ď: 'd', é: 'e', ě: 'e', í: 'i', ň: 'n', ó: 'o', ř: 'r',
  š: 's', ť: 't', ú: 'u', ů: 'u', ý: 'y', ž: 'z',
}

/** Slugify a habit name: strip diacritics, lowercase, dash-separate. */
export function slugify(name: string): string {
  const stripped = name
    .toLowerCase()
    .split('')
    .map((ch) => DIACRITICS[ch] ?? ch)
    .join('')
  return stripped
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export interface CreateHabitInput {
  slug?: string
  name?: string
  emoji?: string
  dose_text?: string
  frequency_per_week?: number
  is_reward?: boolean
}

export interface ValidationResult {
  ok: boolean
  error?: string
  slug?: string
}

/** Validate + derive slug for POST /habits. existingSlugs used for uniqueness check. */
export function validateCreateHabit(
  input: CreateHabitInput,
  existingSlugs: string[],
): ValidationResult {
  if (!input.name || !input.name.trim()) return { ok: false, error: 'name je povinné' }
  if (!input.emoji || !input.emoji.trim()) return { ok: false, error: 'emoji je povinné' }
  if (
    input.frequency_per_week !== undefined &&
    (!Number.isInteger(input.frequency_per_week) ||
      input.frequency_per_week < 1 ||
      input.frequency_per_week > 7)
  ) {
    return { ok: false, error: 'frequency_per_week musí být celé číslo 1–7' }
  }

  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name)
  if (!slug) return { ok: false, error: 'nepodařilo se odvodit slug z name' }
  if (existingSlugs.includes(slug)) {
    return { ok: false, error: `slug "${slug}" již existuje` }
  }
  return { ok: true, slug }
}

export interface PatchHabitInput {
  slug?: string
  name?: string
  emoji?: string
  dose_text?: string
  frequency_per_week?: number
  is_reward?: boolean
  active?: boolean
}

/** Validate PATCH /habits body. Requires the target slug + at least one field to change. */
export function validatePatchHabit(input: PatchHabitInput): ValidationResult {
  if (!input.slug || !input.slug.trim()) return { ok: false, error: 'slug je povinné' }
  const { slug: _slug, ...changes } = input
  if (Object.keys(changes).length === 0) {
    return { ok: false, error: 'žádná změna k uložení' }
  }
  if (input.name !== undefined && !input.name.trim()) {
    return { ok: false, error: 'name nesmí být prázdné' }
  }
  if (input.emoji !== undefined && !input.emoji.trim()) {
    return { ok: false, error: 'emoji nesmí být prázdné' }
  }
  if (
    input.frequency_per_week !== undefined &&
    (!Number.isInteger(input.frequency_per_week) ||
      input.frequency_per_week < 1 ||
      input.frequency_per_week > 7)
  ) {
    return { ok: false, error: 'frequency_per_week musí být celé číslo 1–7' }
  }
  return { ok: true, slug: input.slug }
}

/** Sort habits active-first, then alphabetically by name within each group. */
export function sortHabits(habits: HabitRow[]): HabitRow[] {
  return [...habits].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1
    return a.name.localeCompare(b.name, 'cs')
  })
}
