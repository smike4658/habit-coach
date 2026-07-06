import { createClient } from 'npm:@supabase/supabase-js@2'

/** Service-role klient — RLS obchází, funkce si autorizaci řeší přes requireUser. */
export function serviceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
}

export interface Habit {
  id: string
  slug: string
  name: string
  emoji: string
  is_reward: boolean
  active: boolean
}

export async function activeHabits(db: ReturnType<typeof serviceClient>): Promise<Habit[]> {
  const { data, error } = await db.from('habits').select('*').eq('active', true)
  if (error) throw error
  return data as Habit[]
}
