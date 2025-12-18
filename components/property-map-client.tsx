'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import { LatLngBounds } from 'leaflet'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, X } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

// Fix for default marker icons in Next.js
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

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

// Component to fit map bounds to markers
function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap()
  const validProperties = properties.filter((p) => p.latitude !== null && p.longitude !== null)

  useEffect(() => {
    if (validProperties.length > 0) {
      const bounds = new LatLngBounds(
        validProperties.map((p) => [p.latitude!, p.longitude!] as [number, number])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    } else {
      // Default to a central map view if no properties
      map.setView([-1.9441, 30.0619], 2)
    }
  }, [map, validProperties])

  return null
}

export function PropertyMapClient({ properties, onLocationSelect, selectedLocation }: PropertyMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 20]) // Default global view
  const [searchRadius, setSearchRadius] = useState(5) // km
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const validProperties = properties.filter((p) => p.latitude !== null && p.longitude !== null)

  // Component to handle map clicks
  function MapClickHandler() {
    const map = useMap()

    useEffect(() => {
      if (!showLocationPicker || !onLocationSelect) return

      const handleClick = (e: LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        setMapCenter([lat, lng])
        onLocationSelect(lat, lng, searchRadius)
        setShowLocationPicker(false)
      }

      map.on('click', handleClick)
      return () => {
        map.off('click', handleClick)
      }
    }, [map, showLocationPicker, onLocationSelect, searchRadius])

    return null
  }

  // Only render map on client side
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <Card className="h-full">
        <CardContent className="p-0">
          <div className="flex h-[600px] items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="relative h-[600px] w-full">
          <MapContainer
            key={JSON.stringify(validProperties.map((p) => p.id))}
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds properties={validProperties} />
            {onLocationSelect && <MapClickHandler />}

            {validProperties.map((property) => (
              <Marker key={property.id} position={[property.latitude!, property.longitude!]}>
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-sm mb-1">{property.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {property.address}, {property.city}
                    </p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {formatCurrency(property.price, property.currency)}
                    </p>
                    <Link href={`/properties/${property.id}`}>
                      <Button size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}

            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>
                  <div>
                    <p className="text-sm font-semibold">Search Center</p>
                    <p className="text-xs text-gray-600">Radius: {selectedLocation.radius} km</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {onLocationSelect && (
            <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location Search
                </h3>
                {selectedLocation && (
                  <button
                    onClick={() => {
                      onLocationSelect(0, 0, 0) // Reset
                      setShowLocationPicker(false)
                      window.location.href = '/properties?view=map'
                    }}
                    className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-900 dark:text-white">
                    Search Radius (km)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                    {searchRadius} km
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={showLocationPicker ? 'default' : 'outline'}
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="w-full"
                >
                  {showLocationPicker ? 'Click on map to set location' : 'Enable Location Search'}
                </Button>
                {selectedLocation && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p>Lat: {selectedLocation.lat.toFixed(4)}</p>
                    <p>Lng: {selectedLocation.lng.toFixed(4)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {showLocationPicker && (
            <div className="absolute top-4 left-4 z-[1000] bg-blue-600 text-white rounded-lg shadow-lg p-3 text-sm">
              Click anywhere on the map to set search location
            </div>
          )}

          <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {validProperties.length} {validProperties.length === 1 ? 'property' : 'properties'} shown
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

