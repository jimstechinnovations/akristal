'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const supabase = createClient()

  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email_confirmed_at) {
          // User is logged in and confirmed - redirect to dashboard
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          const userRole = (profile as { role?: string } | null)?.role
          if (userRole === 'admin') {
            router.replace('/admin')
          } else if (userRole === 'seller' || userRole === 'agent') {
            router.replace('/seller/dashboard')
          } else {
            router.replace('/buyer/dashboard')
          }
        } else if (user && !user.email_confirmed_at) {
          // User logged in but not confirmed - redirect to verify
          router.replace(`/verify-otp?email=${encodeURIComponent(user.email || '')}`)
        }
      } catch (error) {
        // Ignore errors, just show login form
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if email is not confirmed - check multiple error formats
        const errorMessage = (error.message || '').toLowerCase()
        const extra = error as unknown as Record<string, unknown>
        const errorBody = (
          (typeof extra.error_description === 'string' ? extra.error_description : '') ||
          (typeof extra.error === 'string' ? extra.error : '') ||
          (typeof extra.msg === 'string' ? extra.msg : '')
        ).toLowerCase()
        const errorCode = (typeof extra.code === 'string' ? extra.code : '').toLowerCase()
        const fullErrorText = `${errorMessage} ${errorBody} ${errorCode}`
        
        // Check for email not confirmed in various formats
        const isEmailNotConfirmed = 
          fullErrorText.includes('email not confirmed') ||
          fullErrorText.includes('email_not_confirmed') ||
          fullErrorText.includes('email not verified') ||
          fullErrorText.includes('email_not_verified') ||
          fullErrorText.includes('unconfirmed') ||
          fullErrorText.includes('email confirmation') ||
          errorCode === 'email_not_confirmed' ||
          (error.status === 400 && (fullErrorText.includes('confirm') || fullErrorText.includes('verify')))

        // For 400 errors, always try OTP as fallback (unless clearly invalid credentials)
        // This handles cases where Supabase returns 400 for unconfirmed emails
        const isInvalidCredentials = errorMessage.includes('invalid') && 
          (errorMessage.includes('password') || errorMessage.includes('credentials') || errorMessage.includes('login'))

        if (isEmailNotConfirmed || (error.status === 400 && !isInvalidCredentials)) {
          // Try to send OTP - if it succeeds, user exists but email not confirmed
          // If it fails with "user not found", then credentials are invalid
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false,
            },
          })

          if (otpError) {
            // If OTP fails with "user not found", it means invalid credentials
            const otpErrorMessage = (otpError.message || '').toLowerCase()
            const otpExtra = otpError as unknown as { statusCode?: unknown }
            const otpErrorStatus =
              otpError.status || (typeof otpExtra.statusCode === 'number' ? otpExtra.statusCode : 0)
            
            if (otpErrorMessage.includes('user not found') || otpErrorMessage.includes('user_not_found')) {
              toast.error('Invalid email or password. Please try again.')
              return
            }
            
            // Handle rate limiting (429 Too Many Requests)
            if (otpErrorStatus === 429 || otpErrorMessage.includes('too many requests') || otpErrorMessage.includes('rate limit')) {
              toast.error('Too many verification requests. Please wait a few minutes and try again on the verification page.')
            } else {
              // Other OTP errors - still redirect to verification
              toast.error('Email not verified. You will be redirected to verify your email.')
            }
          } else {
            // OTP sent successfully - email not confirmed
            toast.success('Email not verified. A verification code has been sent to your email.')
          }

          // Store email and redirect to verification (even if OTP send failed due to rate limit)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('pendingVerificationEmail', email)
            sessionStorage.setItem('pendingLogin', 'true')
          }

          router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=login`)
          return
        }
        
        // For other errors, show user-friendly message
        const userFriendlyMessage = isInvalidCredentials
          ? 'Invalid email or password. Please try again.'
          : errorMessage.includes('user not found') || errorMessage.includes('user_not_found')
          ? 'No account found with this email. Please sign up first.'
          : error.message || 'Failed to sign in. Please try again.'
        
        toast.error(userFriendlyMessage)
        return
      }

      if (data.user) {
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          // Email not confirmed, send OTP
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false,
            },
          })

          if (otpError) {
            console.error('OTP send error:', otpError)
            toast.error('Email not verified. You will be redirected to verify your email.')
          } else {
            toast.success('Email not verified. A verification code has been sent to your email.')
          }

          // Store email and redirect to verification
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('pendingVerificationEmail', email)
            sessionStorage.setItem('pendingLogin', 'true')
          }

          router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=login`)
          return
        }

        // Wait a moment for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Verify session is active
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          toast.error('Session not established. Please try again.')
          return
        }

        // Get user profile to determine redirect
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // If profile doesn't exist, redirect to complete profile
        if (!profile || profileError) {
          toast.success('Welcome back! Please complete your profile.')
          router.replace('/complete-profile')
          return
        }

        toast.success('Welcome back!')
        
        // Redirect based on role
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
      // Only show error if it's not email confirmation related (already handled above)
      const errorMessage = getErrorMessage(error).toLowerCase()
      if (!errorMessage.includes('email not') && !errorMessage.includes('unconfirmed')) {
        toast.error(getErrorMessage(error) || 'Failed to sign in. Please check your credentials and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


