import Link from 'next/link'
import { SignInForm } from './SignInForm'
import { AuthShell } from '@/components/auth/AuthShell'

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your home.">
      <SignInForm />
      <p className="mt-6 text-center font-ui text-small text-slate">
        No account yet?{' '}
        <Link href="/auth/register" className="text-brass underline-offset-2 hover:underline">
          Register
        </Link>
      </p>
    </AuthShell>
  )
}
