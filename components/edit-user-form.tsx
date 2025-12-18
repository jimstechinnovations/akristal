'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateUser } from '@/app/actions/admin'
import toast from 'react-hot-toast'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function EditUserForm({ user }: { user: Profile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'buyer',
    bio: user.bio || '',
    company_name: user.company_name || '',
    license_number: user.license_number || '',
    is_verified: user.is_verified || false,
    is_active: user.is_active !== false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('full_name', formData.full_name)
      formDataObj.append('phone', formData.phone)
      formDataObj.append('role', formData.role)
      formDataObj.append('bio', formData.bio)
      formDataObj.append('company_name', formData.company_name)
      formDataObj.append('license_number', formData.license_number)
      formDataObj.append('is_verified', formData.is_verified.toString())
      formDataObj.append('is_active', formData.is_active.toString())

      const result = await updateUser(user.id, formDataObj)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('User updated successfully!')
        router.push('/admin/users')
        router.refresh()
      }
    } catch (error: unknown) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-[#1e293b]">
      <CardHeader>
        <CardTitle className="text-[#0d233e] dark:text-white">User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Email (read-only)
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-100 dark:bg-gray-800"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Email cannot be changed from this interface
            </p>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Full Name
            </label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
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
            <label htmlFor="role" className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Role
            </label>
            <select
              id="role"
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Profile['role'] })}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
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
              placeholder="User bio..."
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
              placeholder="Company name (for agents/sellers)"
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
              placeholder="License number (for agents)"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_verified}
                onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Verified</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Active</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/users')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
