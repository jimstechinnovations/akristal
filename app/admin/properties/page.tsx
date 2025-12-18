import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PropertyCard } from '@/components/property-card'
import { formatCurrency } from '@/lib/utils'
import { PropertyApprovalActions } from '@/components/property-approval-actions'
import { DeletePropertyButton } from '@/components/delete-property-button'
import Link from 'next/link'
import type { Database } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type SellerProfile = Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email'>
type PropertyWithSeller = PropertyRow & { profiles: SellerProfile | null }

export default async function AdminPropertiesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from('properties')
    .select('*, profiles:seller_id(full_name, email)')
    .order('created_at', { ascending: false })

  const typedProperties = (properties as PropertyWithSeller[]) || []
  const pendingProperties = typedProperties.filter((p) => p.listing_status === 'pending_approval')
  const approvedProperties = typedProperties.filter((p) => p.listing_status === 'approved')

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">
              Property Management
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Review and manage property listings
            </p>
          </div>
          <Link href="/seller/properties/new">
            <Button className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white w-full sm:w-auto">
              + Add Property
            </Button>
          </Link>
        </div>

      {pendingProperties && pendingProperties.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-semibold text-[#0d233e] dark:text-white">
            Pending Approval ({pendingProperties.length})
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {pendingProperties.map((property) => (
              <Card key={property.id} className="p-4 bg-white dark:bg-[#1e293b]">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0d233e] dark:text-white">{property.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {property.address}, {property.city}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-[#c89b3c]">
                      {formatCurrency(property.price, property.currency)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Listed by: {property.profiles?.full_name || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PropertyApprovalActions property={property} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-semibold text-[#0d233e] dark:text-white">
          All Properties ({typedProperties.length || 0})
        </h2>
        {typedProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {typedProperties.map((property) => (
              <div key={property.id} className="bg-white dark:bg-[#1e293b] rounded-lg overflow-hidden shadow-sm">
                <PropertyCard property={property} />
                <div className="p-3 sm:p-4 pt-0 flex gap-2">
                  <Link href={`/admin/properties/${property.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <div className="flex-1">
                    <DeletePropertyButton propertyId={property.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">No properties found.</p>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}

