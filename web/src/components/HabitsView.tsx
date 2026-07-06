import { useState } from 'react'
import type { HabitViewModel } from '../lib/apiAdapter'
import type { CreateHabitBody, PatchHabitBody } from '../lib/api'

interface FormState {
  slug: string | null // null = nový návyk, jinak editace existujícího
  name: string
  emoji: string
  doseText: string
  frequencyPerWeek: string
  isReward: boolean
}

const EMPTY_FORM: FormState = {
  slug: null,
  name: '',
  emoji: '',
  doseText: '',
  frequencyPerWeek: '',
  isReward: false,
}

function HabitForm({
  initial,
  saving,
  onCancel,
  onSubmit,
}: {
  initial: FormState
  saving: boolean
  onCancel: () => void
  onSubmit: (body: CreateHabitBody | PatchHabitBody) => void
}) {
  const [form, setForm] = useState(initial)

  return (
    <form
      className="mt-3 flex flex-col gap-3 rounded-xl border border-line bg-white/60 px-5 py-4"
      onSubmit={(e) => {
        e.preventDefault()
        const freq = form.frequencyPerWeek.trim() ? Number(form.frequencyPerWeek) : undefined
        if (form.slug) {
          onSubmit({
            slug: form.slug,
            name: form.name.trim(),
            emoji: form.emoji.trim(),
            dose_text: form.doseText.trim() || undefined,
            frequency_per_week: freq,
            is_reward: form.isReward,
          } satisfies PatchHabitBody)
        } else {
          onSubmit({
            name: form.name.trim(),
            emoji: form.emoji.trim(),
            dose_text: form.doseText.trim() || undefined,
            frequency_per_week: freq,
            is_reward: form.isReward,
          } satisfies CreateHabitBody)
        }
      }}
    >
      <div className="flex gap-3">
        <div className="w-20 shrink-0">
          <label className="font-mono text-xs text-ink-faint" htmlFor="habit-emoji">
            Emoji
          </label>
          <input
            id="habit-emoji"
            required
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line bg-white/70 px-2 py-1.5 text-center text-lg outline-none focus:ring-2 focus:ring-ink-faint"
          />
        </div>
        <div className="min-w-0 flex-1">
          <label className="font-mono text-xs text-ink-faint" htmlFor="habit-name">
            Název
          </label>
          <input
            id="habit-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line bg-white/70 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ink-faint"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <label className="font-mono text-xs text-ink-faint" htmlFor="habit-dose">
            Dávka (nepovinné)
          </label>
          <input
            id="habit-dose"
            value={form.doseText}
            onChange={(e) => setForm({ ...form, doseText: e.target.value })}
            placeholder="např. 10 min"
            className="mt-1 w-full rounded-lg border border-line bg-white/70 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ink-faint"
          />
        </div>
        <div className="w-28 shrink-0">
          <label className="font-mono text-xs text-ink-faint" htmlFor="habit-freq">
            ×/týden
          </label>
          <input
            id="habit-freq"
            type="number"
            min={1}
            max={7}
            value={form.frequencyPerWeek}
            onChange={(e) => setForm({ ...form, frequencyPerWeek: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line bg-white/70 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ink-faint"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={form.isReward}
          onChange={(e) => setForm({ ...form, isReward: e.target.checked })}
        />
        Odměna, ne úkol (jako šachy) — nikdy neplánovat jako povinnost
      </label>

      <p className="text-xs text-ink-faint italic">
        Nový návyk zapojí kouč do plánu (pravidlo: nový návyk až po 2 týdnech stabilního běhu
        stávajících).
      </p>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-paper active:scale-95 disabled:opacity-40"
        >
          {saving ? 'Ukládám…' : 'Uložit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-line bg-white/60 px-3 py-1.5 text-xs text-ink-soft active:scale-95"
        >
          Zrušit
        </button>
      </div>
    </form>
  )
}

function HabitRow({
  habit,
  onEdit,
  onArchive,
  onRestore,
  saving,
}: {
  habit: HabitViewModel
  onEdit: () => void
  onArchive: () => void
  onRestore: () => void
  saving: boolean
}) {
  // Vrací <div>, ne <li> — obal <li> dodává volající (spolu s inline formulářem).
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="text-xl leading-none">{habit.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {habit.name}
          {habit.isReward && (
            <span className="rounded-full border border-marker bg-marker/20 px-2 py-0.5 text-[10px] font-normal text-ink-soft">
              odměna, ne úkol
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-ink-faint">
          {[habit.doseText, habit.frequencyPerWeek ? `${habit.frequencyPerWeek}×/týden` : null]
            .filter(Boolean)
            .join(' · ') || '—'}
          {habit.active && (
            <>
              {' · streak '}
              {habit.currentStreak}
              {habit.currentStreak > 0 && '🔥'}
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button
          onClick={onEdit}
          disabled={saving}
          className="rounded-lg border border-line bg-white/60 px-2.5 py-1.5 text-xs text-ink-soft active:scale-95 disabled:opacity-40"
        >
          Upravit
        </button>
        {habit.active ? (
          <button
            onClick={() => {
              if (confirm(`Archivovat návyk „${habit.name}"?`)) onArchive()
            }}
            disabled={saving}
            className="rounded-lg border border-line bg-white/60 px-2.5 py-1.5 text-xs text-miss active:scale-95 disabled:opacity-40"
          >
            Archivovat
          </button>
        ) : (
          <button
            onClick={onRestore}
            disabled={saving}
            className="rounded-lg border border-line bg-white/60 px-2.5 py-1.5 text-xs text-done active:scale-95 disabled:opacity-40"
          >
            Obnovit
          </button>
        )}
      </div>
    </div>
  )
}

export function HabitsView({
  habits,
  loading,
  error,
  saving,
  saveError,
  onCreate,
  onUpdate,
  onArchive,
  onRestore,
}: {
  habits: HabitViewModel[] | null
  loading: boolean
  error: string | null
  saving: boolean
  saveError: string | null
  onCreate: (body: CreateHabitBody) => void
  onUpdate: (body: PatchHabitBody) => void
  onArchive: (slug: string) => void
  onRestore: (slug: string) => void
}) {
  const [formTarget, setFormTarget] = useState<'new' | string | null>(null)

  if (error) {
    return (
      <div className="mt-8 rounded-xl border border-miss bg-miss-soft px-5 py-4 text-sm text-miss">
        Načtení návyků selhalo: {error}
      </div>
    )
  }
  if (loading && !habits) {
    return <p className="mt-8 text-sm text-ink-faint">Načítám návyky…</p>
  }
  if (!habits) return null

  const active = habits.filter((h) => h.active)
  const archived = habits.filter((h) => !h.active)

  const closeForm = () => setFormTarget(null)

  return (
    <div className="mt-8 flex flex-col gap-8">
      {saveError && (
        <div className="rounded-xl border border-miss bg-miss-soft px-5 py-4 text-sm text-miss">
          Uložení selhalo: {saveError}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs tracking-widest text-ink-faint uppercase">Návyky</h2>
          <button
            onClick={() => setFormTarget(formTarget === 'new' ? null : 'new')}
            className="rounded-lg border border-line bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink-soft active:scale-95"
          >
            + Přidat návyk
          </button>
        </div>

        {formTarget === 'new' && (
          <HabitForm
            initial={EMPTY_FORM}
            saving={saving}
            onCancel={closeForm}
            onSubmit={(body) => {
              onCreate(body as CreateHabitBody)
              closeForm()
            }}
          />
        )}

        <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white/50">
          <ul className="divide-y divide-line">
            {active.map((h) => (
              <li key={h.slug}>
                <HabitRow
                  habit={h}
                  saving={saving}
                  onEdit={() => setFormTarget(formTarget === h.slug ? null : h.slug)}
                  onArchive={() => onArchive(h.slug)}
                  onRestore={() => onRestore(h.slug)}
                />
                {formTarget === h.slug && (
                  <div className="px-5 pb-4">
                    <HabitForm
                      initial={{
                        slug: h.slug,
                        name: h.name,
                        emoji: h.emoji,
                        doseText: h.doseText ?? '',
                        frequencyPerWeek: h.frequencyPerWeek ? String(h.frequencyPerWeek) : '',
                        isReward: h.isReward,
                      }}
                      saving={saving}
                      onCancel={closeForm}
                      onSubmit={(body) => {
                        onUpdate(body as PatchHabitBody)
                        closeForm()
                      }}
                    />
                  </div>
                )}
              </li>
            ))}
            {active.length === 0 && (
              <li className="px-5 py-6 text-sm text-ink-faint">Žádné aktivní návyky.</li>
            )}
          </ul>
        </div>
      </section>

      {archived.length > 0 && (
        <details className="rise">
          <summary className="cursor-pointer font-mono text-xs tracking-widest text-ink-faint uppercase select-none">
            Archiv ({archived.length})
          </summary>
          <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white/50">
            <ul className="divide-y divide-line">
              {archived.map((h) => (
                <li key={h.slug}>
                  <HabitRow
                    habit={h}
                    saving={saving}
                    onEdit={() => setFormTarget(formTarget === h.slug ? null : h.slug)}
                    onArchive={() => onArchive(h.slug)}
                    onRestore={() => onRestore(h.slug)}
                  />
                  {formTarget === h.slug && (
                    <div className="px-5 pb-4">
                      <HabitForm
                        initial={{
                          slug: h.slug,
                          name: h.name,
                          emoji: h.emoji,
                          doseText: h.doseText ?? '',
                          frequencyPerWeek: h.frequencyPerWeek ? String(h.frequencyPerWeek) : '',
                          isReward: h.isReward,
                        }}
                        saving={saving}
                        onCancel={closeForm}
                        onSubmit={(body) => {
                          onUpdate(body as PatchHabitBody)
                          closeForm()
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  )
}
