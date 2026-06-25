'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { signIn } from '@/lib/auth/actions'

type State = { error?: string } | null

export function SignInForm() {
  const [state, action, pending] = useActionState<State, FormData>(
    (_, formData) => signIn(formData),
    null
  )

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {state?.error && (
        <p className="rounded-input bg-terracotta/10 px-4 py-2.5 font-ui text-small text-terracotta" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" loading={pending} className="mt-2 w-full">
        Sign in
      </Button>
    </form>
  )
}
