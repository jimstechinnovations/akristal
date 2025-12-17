import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { PropertyCard } from '@/components/property-card'
import { RemoveFavoriteButton } from '@/components/remove-favorite-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type FavoriteWithProperty = {
  property_id: string
  properties: PropertyRow | null
}

export default async function BuyerFavoritesPage() {
  const user = await requireRole(['buyer', 'admin'])
  const supabase = await createClient()

  const { data: favorites } = await supabase
    .from('property_favorites')
    .select('property_id, properties(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">
              Favorites
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your saved properties
            </p>
          </div>
          <Link href="/buyer/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(favorites as FavoriteWithProperty[]).map((fav) => (
              <div
                key={fav.property_id}
                className="bg-white dark:bg-[#1e293b] rounded-lg overflow-hidden shadow-sm"
              >
                {fav.properties ? <PropertyCard property={fav.properties} /> : null}
                <div className="p-3 sm:p-4 pt-0">
                  <RemoveFavoriteButton propertyId={fav.property_id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                You haven&apos;t saved any properties yet.
              </p>
              <Link href="/properties" className="mt-4 inline-block">
                <Button className="bg-[#0d233e] hover:bg-[#0a1a2e] text-white">
                  Browse Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


