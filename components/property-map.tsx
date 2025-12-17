'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'

interface Property {
  id: string
  title: string
  price: number
  currency: string
  address: string
  city: string
  cover_image_url?: string | null
  latitude: number | null
  longitude: number | null
}

interface PropertyMapProps {
  properties: Property[]
  onLocationSelect?: (lat: number, lng: number, radius: number) => void
  selectedLocation?: { lat: number; lng: number; radius: number } | null
}

const PropertyMapClient = dynamic(
  () => import('./property-map-client').then((m) => m.PropertyMapClient),
  {
    ssr: false,
    loading: () => (
      <Card className="h-full">
        <CardContent className="p-0">
          <div className="flex h-[600px] items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    ),
  }
)

export function PropertyMap(props: PropertyMapProps) {
  return <PropertyMapClient {...props} />
}

