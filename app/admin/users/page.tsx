import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Shield, User, Building2, UserCheck } from 'lucide-react'
import { DeleteUserButton } from '@/components/delete-user-button'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function AdminUsersPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: usersData, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Supabase typing can sometimes fall back to an unusable inferred type without an explicit row type.
  const users = (usersData ?? []) as Profile[]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5" />
      case 'agent':
        return <UserCheck className="h-5 w-5" />
      case 'seller':
        return <Building2 className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">User Management</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              View and manage all platform users
            </p>
          </div>
          <Link href="/admin/users/new">
            <Button className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white w-full sm:w-auto">
              + Add User
            </Button>
          </Link>
        </div>

      {error ? (
        <Card className="bg-white dark:bg-[#1e293b]">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">Error loading users: {error.message}</p>
          </CardContent>
        </Card>
      ) : users.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="bg-white dark:bg-[#1e293b]">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0d233e] dark:text-white text-sm sm:text-base">
                        {user.full_name || 'No name'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{user.phone}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                        <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                        {user.is_verified && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Verified
                          </Badge>
                        )}
                        {!user.is_active && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {user.company_name && (
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Company: {user.company_name}
                        </p>
                      )}
                      {user.license_number && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          License: {user.license_number}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Edit
                      </Button>
                    </Link>
                    <DeleteUserButton userId={user.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white dark:bg-[#1e293b]">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">No users found.</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}

