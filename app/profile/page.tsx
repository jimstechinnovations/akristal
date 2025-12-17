import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Shield, Building2, UserCheck, Heart } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Shield className="h-5 w-5" />
    case 'agent':
      return <UserCheck className="h-5 w-5" />
    case 'seller':
      return <Building2 className="h-5 w-5" />
    default:
      return <Heart className="h-5 w-5" />
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'agent':
      return 'Agent'
    case 'seller':
      return 'Seller'
    default:
      return 'Buyer'
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'agent':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'seller':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

export default async function ProfilePage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get full profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile = profile as Profile | null

  // Get user initial
  const getUserInitial = () => {
    if (userProfile?.full_name) {
      const names = userProfile.full_name.trim().split(' ')
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  const getDashboardLink = () => {
    const role = userProfile?.role
    if (role === 'admin') return '/admin'
    if (role === 'seller' || role === 'agent') return '/seller/dashboard'
    return '/buyer/dashboard'
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-600 text-white text-2xl font-semibold">
                {getUserInitial()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile?.full_name || 'User'}
                </h2>
                {userProfile?.role && (
                  <div className="mt-2 flex items-center space-x-2">
                    {getRoleIcon(userProfile.role)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userProfile.role)}`}>
                      {getRoleLabel(userProfile.role)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{user.email || 'Not provided'}</p>
                </div>
              </div>

              {userProfile?.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white">{userProfile.phone}</p>
                  </div>
                </div>
              )}

              {userProfile?.company_name && (
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</p>
                    <p className="text-gray-900 dark:text-white">{userProfile.company_name}</p>
                  </div>
                </div>
              )}

              {userProfile?.license_number && (
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">License Number</p>
                    <p className="text-gray-900 dark:text-white">{userProfile.license_number}</p>
                  </div>
                </div>
              )}
            </div>

            {userProfile?.bio && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Bio</p>
                <p className="text-gray-900 dark:text-white">{userProfile.bio}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link href={getDashboardLink()}>
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
              <Link href="/settings">
                <Button>Edit Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</p>
              <div className="mt-2 flex items-center space-x-2">
                {userProfile?.is_active ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Inactive</span>
                  </>
                )}
              </div>
            </div>

            {userProfile?.is_verified !== undefined && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verification</p>
                <div className="mt-2 flex items-center space-x-2">
                  {userProfile.is_verified ? (
                    <>
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Verified</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Not Verified</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {userProfile?.created_at && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="mt-2 text-sm text-gray-900 dark:text-white">
                  {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
