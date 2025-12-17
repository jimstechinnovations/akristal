'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import type { Database, UserRole } from '@/types/database'
import { getErrorMessage } from '@/lib/utils'
import { Suspense } from 'react'
import { createProfile } from '@/app/actions/profile'

function RegisterPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'buyer' as Exclude<UserRole, 'admin'>,
  })
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const supabase = createClient()

  // Check if user is already logged in (unless completing profile)
  useEffect(() => {
    async function checkAuth() {
      const completeProfile = searchParams.get('complete_profile')
      if (completeProfile) {
        // User needs to complete profile - show form
        setCheckingAuth(false)
        return
      }

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
        // Ignore errors, just show register form
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router, supabase, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Step 1: Create the user account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim() || null,
            phone: formData.phone.trim() || null,
            role: formData.role,
          },
          emailRedirectTo: `${window.location.origin}/verify-otp`,
        },
      })

      if (error) {
        console.error('Signup error:', error)
        throw error
      }

      // Step 2: Create profile using server action (bypasses RLS)
      if (data.user) {
        const profileResult = await createProfile(
          data.user.id,
          formData.email.trim(),
          formData.fullName.trim() || null,
          formData.phone.trim() || null,
          formData.role
        )

        if (profileResult.error) {
          console.error('Profile creation error:', profileResult.error)
          // Don't throw - user is created, profile can be completed later
          toast.error('Account created but profile setup failed. You can complete it later.')
        } else {
          toast.success('Account created! Please check your email for the 6-digit verification code.')
        }

        // Store email and redirect to verification
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingVerificationEmail', formData.email)
        }
        
        router.replace(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
      } else {
        throw new Error('User creation failed - no user data returned')
      }
    } catch (error: unknown) {
      console.error('Registration error details:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        formData: {
          email: formData.email,
          role: formData.role,
          hasFullName: !!formData.fullName,
          hasPhone: !!formData.phone,
        },
      })
      const errorMessage = getErrorMessage(error) || 'Failed to create account'
      toast.error(errorMessage)
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up to start browsing properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="0791900316"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                I want to
              </label>
              <select
                id="role"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Exclude<UserRole, 'admin'> })}
                required
              >
                <option value="buyer">Buy Properties</option>
                <option value="seller">Sell Properties</option>
                <option value="agent">Work as Agent</option>
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">Loading…</div>}>
      <RegisterPageInner />
    </Suspense>
  )
}


