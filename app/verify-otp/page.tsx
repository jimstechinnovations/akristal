'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">Loading…</div>}>
      <VerifyOTPPageInner />
    </Suspense>
  )
}

function VerifyOTPPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    // Get email from URL params or sessionStorage
    const emailParam = searchParams.get('email')
    const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('pendingVerificationEmail') : null
    const userEmail = emailParam || storedEmail || ''
    
    if (userEmail) {
      setEmail(userEmail)
    } else {
      toast.error('No email found. Please register or login again.')
      router.push('/login')
    }
  }, [searchParams, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, '') // Only numbers
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || ''
    }
    setOtp(newOtp)
    
    // Focus last input
    if (pastedData.length === 6) {
      document.getElementById('otp-5')?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setLoading(true)

    try {
      // Verify OTP - this will create a session automatically
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      })

      if (error) throw error

      if (data.user) {
        // Ensure session is active
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Session not created. Please try again.')
        }

        // Get user profile to determine redirect
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // Wait a moment for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Verify session is active
        const { data: { session: verifySession } } = await supabase.auth.getSession()
        if (!verifySession) {
          toast.error('Session not established. Please try again.')
          return
        }

        // Clear session storage
        sessionStorage.removeItem('pendingVerificationEmail')
        sessionStorage.removeItem('pendingLogin')

        toast.success('Email verified successfully!')
        
        // If profile doesn't exist, redirect to complete profile
        if (!profile || profileError) {
          router.replace('/complete-profile')
          return
        }
        
        // Redirect based on role using full page reload
        const profileData = profile as { role?: string } | null
        const userRole = profileData?.role
        
        // Use router.replace for client-side navigation
        if (userRole === 'admin') {
          router.replace('/admin')
        } else if (userRole === 'seller' || userRole === 'agent') {
          router.replace('/seller/dashboard')
        } else {
          router.replace('/buyer/dashboard')
        }
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Invalid verification code. Please try again.')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0 || !email) return

    setResending(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) {
        // If user doesn't exist, they might need to register first
        if (error.message?.includes('User not found') || error.message?.includes('user_not_found')) {
          toast.error('No account found with this email. Please register first.')
          router.push('/register')
          return
        }
        
        // Handle rate limiting (429 Too Many Requests)
        const extra = error as unknown as { statusCode?: unknown }
        const errorStatus = error.status || (typeof extra.statusCode === 'number' ? extra.statusCode : 0)
        const errorMessage = (error.message || '').toLowerCase()
        
        if (errorStatus === 429 || errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
          toast.error('Too many verification requests. Please wait a few minutes before requesting another code.')
          setCountdown(300) // Set countdown to 5 minutes (300 seconds) for rate limit
          return
        }
        
        throw error
      }

      toast.success('Verification code sent! Please check your email.')
      setCountdown(60) // 60 second countdown
    } catch (error: unknown) {
      const extra = error as unknown as { status?: unknown; statusCode?: unknown }
      const errorStatus =
        (typeof extra.status === 'number' ? extra.status : 0) ||
        (typeof extra.statusCode === 'number' ? extra.statusCode : 0)
      const errorMessage = getErrorMessage(error).toLowerCase()
      
      if (errorStatus === 429 || errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
        toast.error('Too many verification requests. Please wait a few minutes before requesting another code.')
        setCountdown(300) // Set countdown to 5 minutes for rate limit
      } else {
        toast.error(getErrorMessage(error) || 'Failed to resend code. Please try again.')
      }
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {email || 'your email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-900 dark:text-white text-center">
                Verification Code
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-semibold"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || otp.join('').length !== 6}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              disabled={resending || countdown > 0}
              className="w-full"
            >
              {countdown > 0
                ? `Resend code in ${countdown}s`
                : resending
                ? 'Sending...'
                : 'Resend Code'}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

