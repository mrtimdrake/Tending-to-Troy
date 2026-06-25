'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ============================================================
// Sign in
// ============================================================
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Incorrect email or password.' }
  }

  redirect('/home')
}

// ============================================================
// Sign out
// ============================================================
export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/auth/sign-in')
}

// ============================================================
// Register — first user
// Creates household, generates invitation token, creates user record.
// ============================================================
export async function registerFirstUser(formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  const supabase = await createServerClient()
  const admin = createAdminClient()

  // Fail fast if any household already exists (prevents duplicate households)
  const { count } = await admin
    .from('households')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) > 0) {
    return {
      error: 'A household already exists. Please use an invitation link to join.',
    }
  }

  // Create the Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    if (authError?.message.includes('already registered')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: 'Unable to create your account. Please try again.' }
  }

  const userId = authData.user.id

  // Create household with a fresh invitation token
  const invitationToken = crypto.randomUUID()
  const { data: household, error: householdError } = await admin
    .from('households')
    .insert({ name: 'Our Home', invitation_token: invitationToken, invitation_used: false })
    .select()
    .single()

  if (householdError || !household) {
    return { error: 'Unable to set up your home. Please try again.' }
  }

  // Create the public user record
  const { error: userError } = await admin.from('users').insert({
    id: userId,
    household_id: household.id,
    name,
    email,
  })

  if (userError) {
    return { error: 'Unable to complete registration. Please try again.' }
  }

  redirect('/home')
}

// ============================================================
// Register — second user via invitation token
// Validates token, joins household, marks token used.
// ============================================================
export async function registerWithInvitation(
  token: string,
  formData: FormData
) {
  const name = (formData.get('name') as string).trim()
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string

  const admin = createAdminClient()
  const supabase = await createServerClient()

  // Validate the token
  const { data: household, error: tokenError } = await admin
    .from('households')
    .select('id, invitation_token, invitation_used')
    .eq('invitation_token', token)
    .single()

  if (tokenError || !household) {
    return { error: 'This invitation link is not valid.' }
  }

  if (household.invitation_used) {
    return { error: 'This invitation has already been used.' }
  }

  // Check the household does not already have two members
  const { count: memberCount } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', household.id)

  if ((memberCount ?? 0) >= 2) {
    return { error: 'This household is already full.' }
  }

  // Create the Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    if (authError?.message.includes('already registered')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: 'Unable to create your account. Please try again.' }
  }

  const userId = authData.user.id

  // Create the public user record
  const { error: userError } = await admin.from('users').insert({
    id: userId,
    household_id: household.id,
    name,
    email,
  })

  if (userError) {
    return { error: 'Unable to complete registration. Please try again.' }
  }

  // Mark invitation as used
  await admin
    .from('households')
    .update({ invitation_used: true })
    .eq('id', household.id)

  redirect('/home')
}

// ============================================================
// Regenerate invitation token
// Only valid if the household has fewer than two members.
// ============================================================
export async function regenerateInvitationToken() {
  const supabase = await createServerClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { data: currentUser } = await admin
    .from('users')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!currentUser) return { error: 'Unable to find your household.' }

  // Only allow regeneration if household is not yet full
  const { count } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', currentUser.household_id)

  if ((count ?? 0) >= 2) {
    return { error: 'Your household is already complete.' }
  }

  const newToken = crypto.randomUUID()
  await admin
    .from('households')
    .update({ invitation_token: newToken, invitation_used: false })
    .eq('id', currentUser.household_id)

  return { token: newToken }
}
