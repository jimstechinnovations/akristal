import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Database } from '@/types/database'

type PaymentRow = Database['public']['Tables']['payments']['Row']

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createClient()

  // Get stats
  const [usersResult, propertiesResult, paymentsResult, pendingResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('properties').select('id', { count: 'exact' }),
    supabase.from('payments').select('id, amount', { count: 'exact' }),
    supabase
      .from('properties')
      .select('id', { count: 'exact' })
      .eq('listing_status', 'pending_approval'),
  ])

  const totalUsers = usersResult.count || 0
  const totalProperties = propertiesResult.count || 0
  const totalPayments = paymentsResult.count || 0
  const pendingApprovals = pendingResult.count || 0

  const totalRevenue =
    (paymentsResult.data as Array<Pick<PaymentRow, 'amount'>> | null)?.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    ) || 0

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">
              Admin Dashboard
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your real estate marketplace
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/categories">
              <Button className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white">
                Manage Categories
              </Button>
            </Link>
          </div>
        </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="bg-white dark:bg-[#1e293b]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-[#0d233e] dark:text-white">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1e293b]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-[#0d233e] dark:text-white">{totalProperties}</div>
            {pendingApprovals > 0 && (
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#c89b3c]">
                {pendingApprovals} pending
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1e293b]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              <DollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-[#0d233e] dark:text-white">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1e293b]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-[#0d233e] dark:text-white">{totalPayments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white dark:bg-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-[#0d233e] dark:text-white">Property Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Review and approve pending property listings
            </p>
            <Link href="/admin/properties">
              <Button className="w-full sm:w-auto bg-[#0d233e] hover:bg-[#0a1a2e] text-white">Manage Properties</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-[#0d233e] dark:text-white">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              View and manage user accounts
            </p>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full sm:w-auto">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-[#0d233e] dark:text-white">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              View and manage payment transactions
            </p>
            <Link href="/admin/payments">
              <Button variant="outline" className="w-full sm:w-auto">View Payments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

