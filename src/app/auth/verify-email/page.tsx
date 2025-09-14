import { EmailVerification } from '@/components/auth/email-verification'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">TPRM App</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Third-Party Risk Management Platform
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <EmailVerification />
        </Suspense>
      </div>
    </div>
  )
}
