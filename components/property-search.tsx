'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

interface PropertySearchProps {
  cities: string[]
  searchParams: Record<string, string | undefined>
  onLocationSelect?: (lat: number, lng: number, radius: number) => void
}

export function PropertySearch({ cities, searchParams, onLocationSelect }: PropertySearchProps) {
  const router = useRouter()
  const [filters, setFilters] = useState({
    search: searchParams.search || '',
    type: searchParams.type || '',
    city: searchParams.city || '',
    minPrice: searchParams.minPrice || '',
    maxPrice: searchParams.maxPrice || '',
    bedrooms: searchParams.bedrooms || '',
    bathrooms: searchParams.bathrooms || '',
    lat: searchParams.lat || '',
    lng: searchParams.lng || '',
    radius: searchParams.radius || '',
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    router.push(`/properties?${params.toString()}`)
  }

  const handleLocationSelect = (lat: number, lng: number, radius: number) => {
    setFilters({ ...filters, lat: lat.toString(), lng: lng.toString(), radius: radius.toString() })
    if (onLocationSelect) {
      onLocationSelect(lat, lng, radius)
    }
  }

  const handleReset = () => {
    setFilters({
      search: '',
      type: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      lat: '',
      lng: '',
      radius: '',
    })
    router.push('/properties')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-950 dark:text-white">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Search</label>
          <Input
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Property Type</label>
          <select
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
            <option value="rental">Rental</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">City</label>
          <select
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Min Price</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Max Price</label>
            <Input
              type="number"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Bedrooms</label>
          <select
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Bathrooms</label>
          <select
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={filters.bathrooms}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {onLocationSelect && (filters.lat || filters.lng) && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <MapPin className="mr-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200">
                  Location filter active
                  {filters.radius && ` (${filters.radius} km radius)`}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilters({ ...filters, lat: '', lng: '', radius: '' })
                  router.push('/properties')
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1">
            Apply
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


