import Link from 'next/link'
import { AuthShell } from '@/components/auth/AuthShell'

export default function UsedInvitePage() {
  return (
    <AuthShell title="Invitation already used">
      <p className="mb-6 font-ui text-small text-slate">
        This invitation has already been accepted. If you already have an account, sign in below.
      </p>
      <Link
        href="/auth/sign-in"
        className="font-ui text-small text-brass underline-offset-2 hover:underline"
      >
        Sign in
      </Link>
    </AuthShell>
  )
}
