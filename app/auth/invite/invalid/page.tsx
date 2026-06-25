import Link from 'next/link'
import { AuthShell } from '@/components/auth/AuthShell'

export default function InvalidInvitePage() {
  return (
    <AuthShell title="Invitation not found">
      <p className="mb-6 font-ui text-small text-slate">
        This invitation link is not valid. Please ask for a new one.
      </p>
      <Link
        href="/auth/sign-in"
        className="font-ui text-small text-brass underline-offset-2 hover:underline"
      >
        Return to sign in
      </Link>
    </AuthShell>
  )
}
