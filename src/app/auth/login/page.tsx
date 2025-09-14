import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">TPRM App</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Third-Party Risk Management Platform
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
