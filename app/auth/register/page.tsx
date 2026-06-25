import Link from 'next/link'
import { AuthShell } from '@/components/auth/AuthShell'
import { RegisterForm } from './RegisterForm'

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your home"
      subtitle="Set up the household. You'll invite your partner next."
    >
      <RegisterForm />
      <p className="mt-6 text-center font-ui text-small text-slate">
        Already have an account?{' '}
        <Link href="/auth/sign-in" className="text-brass underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
