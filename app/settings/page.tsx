'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    company_name: '',
    license_number: '',
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          const typedProfile = profile as Database['public']['Tables']['profiles']['Row']
          setFormData({
            full_name: typedProfile.full_name || '',
            phone: typedProfile.phone || '',
            bio: typedProfile.bio || '',
            company_name: typedProfile.company_name || '',
            license_number: typedProfile.license_number || '',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to update your profile')
        return
      }

      const updateData: ProfileUpdate = {
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        bio: formData.bio.trim() || null,
        company_name: formData.company_name.trim() || null,
        license_number: formData.license_number.trim() || null,
      }

      const { error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      router.push('/profile')
    } catch (error: unknown) {
      console.error('Profile update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update your account information and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Full Name
              </label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+250791900316"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                Company Name
              </label>
              <Input
                id="company_name"
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Your company name (for agents/sellers)"
              />
            </div>

            <div>
              <label htmlFor="license_number" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                License Number
              </label>
              <Input
                id="license_number"
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                placeholder="Your license number (for agents)"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href="/profile">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
