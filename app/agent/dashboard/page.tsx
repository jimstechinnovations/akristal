import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyCard } from '@/components/property-card'
import { Plus, FileText } from 'lucide-react'
import type { Database } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']

export default async function AgentDashboard() {
  const user = await requireRole(['agent', 'admin'])
  const supabase = await createClient()

  // Agents can see properties they own (seller_id) OR are assigned to (agent_id)
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .or(`seller_id.eq.${user.id},agent_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const typedProperties = (properties as PropertyRow[]) || []
  const stats = {
    total: typedProperties.length,
    approved: typedProperties.filter((p) => p.listing_status === 'approved').length,
    pending: typedProperties.filter((p) => p.listing_status === 'pending_approval').length,
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">
              Agent Dashboard
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your assigned listings
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/seller/properties/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#0d233e] hover:bg-[#0a1a2e] text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Listing
              </Button>
            </Link>
            <Link href="/agent/properties" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                My Listings
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#0d233e] dark:text-white">
              Recent Listings
            </h2>
            <Link href="/agent/properties">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {typedProperties.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {typedProperties.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-[#1e293b]">
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No listings found yet.
                </p>
                <Link href="/seller/properties/new" className="mt-4 inline-block">
                  <Button className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white">
                    Create a Listing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


