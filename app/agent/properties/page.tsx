import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PropertyCard } from '@/components/property-card'
import { DeleteListingButton } from '@/components/delete-listing-button'
import type { Database } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']

export default async function AgentPropertiesPage() {
  const user = await requireRole(['agent', 'admin'])
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .or(`seller_id.eq.${user.id},agent_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">
              My Listings
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Listings you created or are assigned to
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/seller/properties/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#0d233e] hover:bg-[#0a1a2e] text-white">
                New Listing
              </Button>
            </Link>
            <Link href="/agent/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(properties as PropertyRow[]).map((property) => (
              <div key={property.id} className="space-y-2">
                <PropertyCard property={property} />
                <div className="flex justify-end">
                  <DeleteListingButton propertyId={property.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No listings found.
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
  )
}


