import { createClient } from '@/lib/supabase/server'
import { PropertySearch } from '@/components/property-search'
import { PropertyCard } from '@/components/property-card'
import { PropertyMap } from '@/components/property-map'
import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Map, List } from 'lucide-react'
import type { Database } from '@/types/database'

type Property = Database['public']['Tables']['properties']['Row']

type SearchParams = Record<string, string | undefined> & {
  search?: string
  type?: string
  city?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  bathrooms?: string
  lat?: string
  lng?: string
  radius?: string
  view?: string
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>
}) {
  const supabase = await createClient()
  
  // Handle searchParams as Promise (Next.js 15+) or object
  const params = searchParams instanceof Promise ? await searchParams : searchParams

  let query = supabase
    .from('properties')
    .select('*')
    .eq('listing_status', 'approved')
    .eq('status', 'available')

  // Apply filters
  if (params?.type) {
    query = query.eq('property_type', params.type)
  }
  if (params?.city) {
    query = query.eq('city', params.city)
  }
  if (params?.minPrice) {
    query = query.gte('price', parseFloat(params.minPrice))
  }
  if (params?.maxPrice) {
    query = query.lte('price', parseFloat(params.maxPrice))
  }
  if (params?.bedrooms) {
    query = query.eq('bedrooms', parseInt(params.bedrooms))
  }
  if (params?.bathrooms) {
    query = query.eq('bathrooms', parseInt(params.bathrooms))
  }
  if (params?.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%,address.ilike.%${params.search}%`
    )
  }

  // Location-based filtering (radius search)
  const { data: initialData, error } = await query.order('created_at', { ascending: false })
  let data = initialData as Property[] | null
  
  if (params?.lat && params?.lng && params?.radius) {
    const lat = parseFloat(params.lat)
    const lng = parseFloat(params.lng)
    const radiusKm = parseFloat(params.radius)
    
    // Filter properties by distance
    if (data) {
      data = data.filter((property) => {
        if (!property.latitude || !property.longitude) return false
        
        // Haversine formula for distance calculation
        const R = 6371 // Earth's radius in km
        const dLat = ((property.latitude - lat) * Math.PI) / 180
        const dLon = ((property.longitude - lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((property.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c
        
        return distance <= radiusKm
      })
    }
  }

  // Get unique cities for filter
  const { data: citiesData } = await supabase
    .from('properties')
    .select('city')
    .eq('listing_status', 'approved')
    .eq('status', 'available')

  const cities = citiesData as Array<Pick<Property, 'city'>> | null
  const uniqueCities = Array.from(new Set(cities?.map((c) => c.city) || [])).sort()

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#0d233e] dark:text-white">
            Browse Properties
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Find your perfect property in Rwanda
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Mobile: Filters as Drawer/Modal, Desktop: Sidebar */}
        <div className="mb-4 lg:hidden">
          <Suspense fallback={<div className="h-20 bg-white dark:bg-gray-800 rounded-lg animate-pulse" />}>
            <PropertySearch 
              cities={uniqueCities} 
              searchParams={params}
            />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <Suspense fallback={<div className="h-96 bg-white dark:bg-gray-800 rounded-lg animate-pulse" />}>
              <PropertySearch 
                cities={uniqueCities} 
                searchParams={params}
              />
            </Suspense>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Tabs defaultValue={params?.view || 'list'} className="w-full">
              <div className="mb-4 flex items-center justify-between">
                <TabsList className="bg-white dark:bg-gray-800">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">List</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    <span className="hidden sm:inline">Map</span>
                  </TabsTrigger>
                </TabsList>
                {data && data.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {data.length} {data.length === 1 ? 'property' : 'properties'} found
                  </span>
                )}
              </div>
              
              <TabsContent value="list" className="mt-0">
                {error ? (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
                    Error loading properties: {error.message}
                  </div>
                ) : data && data.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {data.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-white dark:bg-gray-800 p-8 text-center shadow-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      No properties found matching your criteria.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="map" className="mt-0">
                {error ? (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
                    Error loading properties: {error.message}
                  </div>
                ) : data && data.length > 0 ? (
                  <div className="h-[600px] rounded-lg overflow-hidden shadow-sm">
                    <PropertyMap
                      properties={data}
                      selectedLocation={
                        params?.lat && params?.lng && params?.radius
                          ? {
                              lat: parseFloat(params.lat),
                              lng: parseFloat(params.lng),
                              radius: parseFloat(params.radius),
                            }
                          : null
                      }
                    />
                  </div>
                ) : (
                  <div className="rounded-lg bg-white dark:bg-gray-800 p-8 text-center shadow-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      No properties found matching your criteria.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}
