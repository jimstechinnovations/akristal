'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types/database'
import { completeProfile } from '@/app/actions/profile'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    role: 'buyer' as Exclude<UserRole, 'admin'>,
  })
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const supabase = createClient()

  // Check if user is authenticated and if profile already exists
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/login')
          return
        }

        // Check if profile already exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          // Profile exists, redirect to dashboard
          const userRole = (profile as { role?: string } | null)?.role
          if (userRole === 'admin') {
            router.replace('/admin')
          } else if (userRole === 'seller' || userRole === 'agent') {
            router.replace('/seller/dashboard')
          } else {
            router.replace('/buyer/dashboard')
          }
          return
        }

        // Pre-fill email if available
        if (user.email) {
          // Email is already known, just need other details
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      toast.error('Full name is required')
      return
    }

    setLoading(true)

    try {
      const result = await completeProfile(
        formData.fullName,
        formData.phone || null,
        formData.role
      )

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Profile completed successfully!')

      // Redirect based on role
      if (formData.role === 'seller' || formData.role === 'agent') {
        router.replace('/seller/dashboard')
      } else {
        router.replace('/buyer/dashboard')
      }
    } catch (error: unknown) {
      console.error('Profile completion error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to complete profile'
      )
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
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide some additional information to complete your account setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Full Name *
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
              <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+250791900316"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                I want to *
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Completing profile...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
