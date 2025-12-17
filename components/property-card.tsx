import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Building2, MapPin, Bed, Bath } from 'lucide-react'
import type { Database } from '@/types/database'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        {property.cover_image_url ? (
          <div className="relative h-48 w-full">
            <Image
              src={property.cover_image_url}
              alt={property.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
            <Building2 className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-950 dark:text-white line-clamp-1">
            {property.title}
          </h3>
          <div className="mt-1 flex items-center text-sm text-gray-700 dark:text-gray-400">
            <MapPin className="mr-1 h-4 w-4" />
            <span className="line-clamp-1">
              {property.address}, {property.city}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-700 dark:text-gray-400">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="mr-1 h-4 w-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="mr-1 h-4 w-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.size_sqm && (
              <span>{property.size_sqm} m²</span>
            )}
          </div>
          <p className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(property.price, property.currency)}
          </p>
          <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {property.property_type}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}


