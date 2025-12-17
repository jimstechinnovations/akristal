import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database } from '@/types/database'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyDetailsProps {
  property: Property
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const amenities = Array.isArray(property.amenities) ? property.amenities : []
  const features = Array.isArray(property.features) ? property.features : []

  return (
    <div className="space-y-6">
      {amenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {typeof amenity === 'string' ? amenity : JSON.stringify(amenity)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                >
                  {typeof feature === 'string' ? feature : JSON.stringify(feature)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


