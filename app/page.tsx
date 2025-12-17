import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Home, Key, Building2, Car, Heart, MapPin, TrendingUp, Store, Briefcase } from 'lucide-react'
import Image from 'next/image'
import type { Database } from '@/types/database'

type FeaturedProperty = Pick<
  Database['public']['Tables']['properties']['Row'],
  'id' | 'title' | 'price' | 'cover_image_url' | 'city' | 'address' | 'property_type'
>

export default async function HomePage() {
  const supabase = await createClient()
  
  // Fetch featured properties
  const { data } = await supabase
    .from('properties')
    .select('id, title, price, cover_image_url, city, address, property_type')
    .eq('listing_status', 'approved')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)
  const featuredProperties = data as FeaturedProperty[] | null

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0f172a]">
      {/* Search Bar */}
      <section className="bg-white dark:bg-[#1e293b] px-4 py-4 sm:py-6 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto flex w-full max-w-3xl rounded-[30px] overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search properties, cars, businesses..."
              className="min-w-0 flex-1 px-4 py-3 sm:py-4 border-none outline-none bg-white dark:bg-[#1e293b] dark:text-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            />
            <Link
              href="/properties"
              className="flex items-center justify-center bg-[#c89b3c] text-[#0d233e] px-4 sm:px-6 font-semibold hover:bg-[#b88a2a] transition-colors min-w-[50px] sm:min-w-[60px]"
              aria-label="Search"
            >
                <Search className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 py-4 sm:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Link href="/properties?type=residential" className="flex flex-col items-center bg-white dark:bg-[#1e293b] p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-900 dark:text-white">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0d233e] dark:bg-[#c89b3c] flex items-center justify-center mb-2">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-[#c89b3c] dark:text-[#0d233e]" />
              </div>
              <span className="text-xs font-medium text-center">Buy</span>
            </Link>
            <Link href="/properties?type=rental" className="flex flex-col items-center bg-white dark:bg-[#1e293b] p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-900 dark:text-white">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0d233e] dark:bg-[#c89b3c] flex items-center justify-center mb-2">
                <Key className="h-5 w-5 sm:h-6 sm:w-6 text-[#c89b3c] dark:text-[#0d233e]" />
              </div>
              <span className="text-xs font-medium text-center">Rent</span>
            </Link>
            <Link href="/properties?type=commercial" className="flex flex-col items-center bg-white dark:bg-[#1e293b] p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-900 dark:text-white">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0d233e] dark:bg-[#c89b3c] flex items-center justify-center mb-2">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#c89b3c] dark:text-[#0d233e]" />
              </div>
              <span className="text-xs font-medium text-center">Commercial</span>
            </Link>
            <Link href="/properties" className="flex flex-col items-center bg-white dark:bg-[#1e293b] p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-900 dark:text-white">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0d233e] dark:bg-[#c89b3c] flex items-center justify-center mb-2">
                <Car className="h-5 w-5 sm:h-6 sm:w-6 text-[#c89b3c] dark:text-[#0d233e]" />
              </div>
              <span className="text-xs font-medium text-center">Vehicles</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Link href="/properties" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0d233e] text-white rounded-full whitespace-nowrap text-xs sm:text-sm font-medium shadow-sm">
              All
            </Link>
            <Link href="/properties?type=residential" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full whitespace-nowrap text-xs sm:text-sm hover:bg-[#0d233e] hover:text-white dark:hover:bg-[#0d233e] transition-colors">
              Residential
            </Link>
            <Link href="/properties?type=commercial" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full whitespace-nowrap text-xs sm:text-sm hover:bg-[#0d233e] hover:text-white dark:hover:bg-[#0d233e] transition-colors">
              Commercial
            </Link>
            <Link href="/properties?type=land" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full whitespace-nowrap text-xs sm:text-sm hover:bg-[#0d233e] hover:text-white dark:hover:bg-[#0d233e] transition-colors">
              Land
            </Link>
            <Link href="/properties" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full whitespace-nowrap text-xs sm:text-sm hover:bg-[#0d233e] hover:text-white dark:hover:bg-[#0d233e] transition-colors">
              Vehicles
            </Link>
            <Link href="/properties" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full whitespace-nowrap text-xs sm:text-sm hover:bg-[#0d233e] hover:text-white dark:hover:bg-[#0d233e] transition-colors">
              Businesses
            </Link>
            <Link href="/properties" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-[#1e293b] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full whitespace-nowrap text-xs sm:text-sm hover:bg-[#0d233e] hover:text-white dark:hover:bg-[#0d233e] transition-colors">
              Lifestyle
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties && featuredProperties.length > 0 && (
        <section className="px-4 py-4 sm:py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#0d233e] dark:text-white">Featured Properties</h2>
              <Link href="/properties" className="text-xs sm:text-sm text-[#c89b3c] hover:underline font-medium">
                View All
              </Link>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {featuredProperties.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`} className="min-w-[200px] sm:min-w-[250px] bg-white dark:bg-[#1e293b] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {property.cover_image_url ? (
                    <div className="relative h-[140px] sm:h-[180px] w-full">
                      <Image
                        src={property.cover_image_url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-[140px] sm:h-[180px] w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-[#0d233e] dark:text-white mb-1.5 sm:mb-2 text-sm sm:text-base line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1 line-clamp-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{property.address}, {property.city}</span>
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-[#c89b3c]">
                      {new Intl.NumberFormat('en-RW', {
                        style: 'currency',
                        currency: 'RWF',
                        minimumFractionDigits: 0,
                      }).format(property.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Services */}
      <section className="px-4 py-4 sm:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#0d233e] dark:text-white">Our Services</h2>
            <Link href="/about" className="text-xs sm:text-sm text-[#c89b3c] hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]">
              <div className="relative h-[100px] sm:h-[120px] w-full bg-gradient-to-br from-[#0d233e] to-[#1e6b52]">
                <Building2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 sm:h-12 sm:w-12 text-white opacity-50" />
              </div>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-[#0d233e] dark:text-white mb-1 text-sm sm:text-base">Real Estate Development</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">From concept to completion</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]">
              <div className="relative h-[100px] sm:h-[120px] w-full bg-gradient-to-br from-[#1e6b52] to-[#0d233e]">
                <Briefcase className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 sm:h-12 sm:w-12 text-white opacity-50" />
              </div>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-[#0d233e] dark:text-white mb-1 text-sm sm:text-base">Property Management</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Comprehensive solutions</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]">
              <div className="relative h-[100px] sm:h-[120px] w-full bg-gradient-to-br from-[#c89b3c] to-[#0d233e]">
                <Home className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 sm:h-12 sm:w-12 text-white opacity-50" />
              </div>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-[#0d233e] dark:text-white mb-1 text-sm sm:text-base">Home Automation</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Smart home technology</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]">
              <div className="relative h-[100px] sm:h-[120px] w-full bg-gradient-to-br from-[#0d233e] to-[#c89b3c]">
                <TrendingUp className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 sm:h-12 sm:w-12 text-white opacity-50" />
              </div>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-[#0d233e] dark:text-white mb-1 text-sm sm:text-base">Interior Design</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Create stunning spaces</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#0d233e] to-[#1e6b52] text-white py-8 sm:py-12 px-4 my-4 sm:my-6">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Find Your Next Property?</h2>
          <p className="text-sm sm:text-lg text-white/90 mb-4 sm:mb-6 px-2">
            Join thousands of satisfied customers on TheAkristalGroup
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#c89b3c] text-[#0d233e] hover:bg-[#b88a2a] font-semibold">
                Get Started Today
              </Button>
            </Link>
            <Link href="/properties" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto border border-white bg-transparent text-white hover:bg-white/10"
              >
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
