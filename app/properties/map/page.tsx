'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PropertyMap } from '@/components/property-map'
import { Card, CardContent } from '@/components/ui/card'
import { Suspense } from 'react'
import type { Database, PropertyType } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']

function MapViewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperties() {
      try {
        let query = supabase
          .from('properties')
          .select('*')
          .eq('listing_status', 'approved')
          .eq('status', 'available')

        // Apply filters from URL
        const type = searchParams.get('type')
        const city = searchParams.get('city')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')

        if (type) query = query.eq('property_type', type as PropertyType)
        if (city) query = query.eq('city', city)
        if (minPrice) query = query.gte('price', parseFloat(minPrice))
        if (maxPrice) query = query.lte('price', parseFloat(maxPrice))

        const { data, error } = await query

        if (error) throw error

        // Apply location filter if present
        const lat = searchParams.get('lat')
        const lng = searchParams.get('lng')
        const radius = searchParams.get('radius')

        if (lat && lng && radius && data) {
          const centerLat = parseFloat(lat)
          const centerLng = parseFloat(lng)
          const radiusKm = parseFloat(radius)

          const filtered = (data as PropertyRow[]).filter((property) => {
            if (property.latitude === null || property.longitude === null) return false

            const R = 6371
            const dLat = ((property.latitude - centerLat) * Math.PI) / 180
            const dLon = ((property.longitude - centerLng) * Math.PI) / 180
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((centerLat * Math.PI) / 180) *
                Math.cos((property.latitude * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const distance = R * c

            return distance <= radiusKm
          })

          setProperties(filtered)
        } else {
          setProperties((data as PropertyRow[]) || [])
        }
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [searchParams, supabase])

  const handleLocationSelect = (lat: number, lng: number, radius: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('lat', lat.toString())
    params.set('lng', lng.toString())
    params.set('radius', radius.toString())
    router.push(`/properties?${params.toString()}&view=map`)
  }

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

  return (
    <PropertyMap
      properties={properties}
      onLocationSelect={handleLocationSelect}
      selectedLocation={
        searchParams.get('lat') && searchParams.get('lng') && searchParams.get('radius')
          ? {
              lat: parseFloat(searchParams.get('lat')!),
              lng: parseFloat(searchParams.get('lng')!),
              radius: parseFloat(searchParams.get('radius')!),
            }
          : null
      }
    />
  )
}

export default function MapPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Property Map</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Explore properties on the map
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <MapViewContent />
      </Suspense>
    </div>
  )
}

