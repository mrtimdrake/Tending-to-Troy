'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { registerWithInvitation } from '@/lib/auth/actions'

interface Props {
  token: string
}

type State = { error?: string } | null

export function InviteForm({ token }: Props) {
  const [state, action, pending] = useActionState<State, FormData>(
    (_, formData) => registerWithInvitation(token, formData),
    null
  )

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="Your name"
        name="name"
        type="text"
        autoComplete="given-name"
        required
      />
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
        autoComplete="new-password"
        minLength={8}
        required
      />

      {state?.error && (
        <p className="rounded-input bg-terracotta/10 px-4 py-2.5 font-ui text-small text-terracotta" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" loading={pending} className="mt-2 w-full">
        Join home
      </Button>
    </form>
  )
}
