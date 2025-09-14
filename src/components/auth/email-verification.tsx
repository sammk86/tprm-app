'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'

interface EmailVerificationProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function EmailVerification({ onSuccess, redirectTo = '/dashboard' }: EmailVerificationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || 'Verification failed')
      } else {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
          router.push(redirectTo)
        }, 2000)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || 'Failed to resend verification code')
      } else {
        setError('')
        // Show success message
        setTimeout(() => {
          setError('')
        }, 3000)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Email Verified!</h2>
              <p className="text-muted-foreground mt-2">
                Your email has been successfully verified. Redirecting to dashboard...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
        <CardDescription className="text-center">
          {email ? (
            <>We&apos;ve sent a verification code to <strong>{email}</strong></>
          ) : (
            'Enter the verification code sent to your email'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyEmail} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label htmlFor="verificationCode" className="text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              disabled={isVerifying}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isVerifying || verificationCode.length !== 6}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Email
          </Button>
        </form>

        <div className="mt-6 text-center text-sm space-y-2">
          <p className="text-muted-foreground">
            Didn&apos;t receive the code?
          </p>
          <Button
            variant="outline"
            onClick={handleResendCode}
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
