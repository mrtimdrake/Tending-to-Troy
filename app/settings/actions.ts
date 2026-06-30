'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Result = { ok: true } | { error: string }

// Updates the signed-in user's display name and/or the household name.
// users and households have no client write policies (RLS migration 002),
// so these go through the admin client, scoped to the caller's own ids.
export async function updateSettings(input: {
  name?: string
  householdName?: string
}): Promise<Result> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const admin = createAdminClient()

  const { data: row } = await admin
    .from('users')
    .select('household_id')
    .eq('id', user.id)
    .maybeSingle()
  if (!row) return { error: 'Could not find your account.' }

  const name = input.name?.trim()
  const householdName = input.householdName?.trim()

  if (input.name !== undefined && !name) {
    return { error: 'Your name cannot be empty.' }
  }
  if (input.householdName !== undefined && !householdName) {
    return { error: 'The home name cannot be empty.' }
  }

  if (name) {
    const { error } = await admin.from('users').update({ name }).eq('id', user.id)
    if (error) {
      console.error('updateSettings (name) failed:', error)
      return { error: 'Could not save your name.' }
    }
  }

  if (householdName) {
    const { error } = await admin
      .from('households')
      .update({ name: householdName })
      .eq('id', row.household_id)
    if (error) {
      console.error('updateSettings (household) failed:', error)
      return { error: 'Could not save the home name.' }
    }
  }

  return { ok: true }
}
