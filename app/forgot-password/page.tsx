'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Send OTP for password reset
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) {
        // Check if user doesn't exist
        const errorMessage = (error.message || '').toLowerCase()
        if (errorMessage.includes('user not found') || errorMessage.includes('user_not_found')) {
          toast.error('No account found with this email. Please check and try again.')
          return
        }
        
        // Handle rate limiting
        const extra = error as unknown as { statusCode?: unknown }
        const errorStatus = error.status || (typeof extra.statusCode === 'number' ? extra.statusCode : 0)
        if (errorStatus === 429 || errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
          toast.error('Too many requests. Please wait a few minutes and try again.')
          return
        }
        
        console.error('Password reset OTP error:', error)
        toast.error('Failed to send verification code. Please try again.')
        return
      }

      // Success - store email and redirect to OTP verification
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingPasswordResetEmail', email)
      }
      
      toast.success('Verification code sent! Check your email.')
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=password-reset`)
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error(getErrorMessage(error) || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a 6-digit verification code to reset your password
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
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

