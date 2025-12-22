import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Home, Key, Building2, Car, Heart, MapPin, Store, TrendingUp, CheckCircle2, FolderKanban, Play, Video, Users } from 'lucide-react'
import Image from 'next/image'
import type { Database } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import { services } from '@/lib/services'

type FeaturedProperty = Pick<
  Database['public']['Tables']['properties']['Row'],
  'id' | 'title' | 'price' | 'currency' | 'cover_image_url' | 'city' | 'address' | 'property_type'
>

type FeaturedVideoItem = {
  id: string
  title: string
  type: 'property' | 'project'
  videoUrl: string
  price?: number
  currency?: string
  city?: string
  address?: string
  property_type?: string
  status?: string
  project_type?: string | null
  pre_selling_price?: number | null
  pre_selling_currency?: string | null
  main_price?: number | null
  main_currency?: string | null
}

export default async function HomePage() {
  const supabase = await createClient()
  
  // Fetch counts for achievements
  const [propertiesCount, paymentsCount, projectsCount, usersCount] = await Promise.all([
    supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('listing_status', 'approved'),
    supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'completed'),
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true }),
  ])

  const listingsCount = propertiesCount.count || 0
  const transactionsCount = paymentsCount.count || 0
  const projectsCountValue = projectsCount.count || 0
  const usersCountValue = usersCount.count || 0
  
  // Fetch featured properties
  const { data } = await supabase
    .from('properties')
    .select('id, title, price, currency, cover_image_url, city, address, property_type, video_urls')
    .eq('listing_status', 'approved')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)
  const featuredProperties = data as (FeaturedProperty & { video_urls?: string[] })[] | null

  // Fetch properties with videos
  const { data: propertiesWithVideosData } = await supabase
    .from('properties')
    .select('id, title, price, currency, city, address, property_type, video_urls')
    .eq('listing_status', 'approved')
    .eq('status', 'available')
    .not('video_urls', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch projects with videos
  const { data: projectsWithVideosData } = await supabase
    .from('projects')
    .select('id, title, status, type, pre_selling_price, pre_selling_currency, main_price, main_currency, media_urls')
    .eq('status', 'active')
    .not('media_urls', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6)

  // Combine and format video items
  const featuredVideos: FeaturedVideoItem[] = []
  
  // Add properties with videos
  if (propertiesWithVideosData) {
    const propertiesWithVideos = propertiesWithVideosData as Array<{
      id: string
      title: string
      price: number
      currency: string | null
      city: string
      address: string
      property_type: string
      video_urls: string[] | null
    }>
    
    propertiesWithVideos.forEach((property) => {
      if (property.video_urls && Array.isArray(property.video_urls) && property.video_urls.length > 0) {
        // Use first video URL
        const videoUrl = property.video_urls[0]
        if (videoUrl && typeof videoUrl === 'string' && videoUrl.trim()) {
          featuredVideos.push({
            id: property.id,
            title: property.title,
            type: 'property',
            videoUrl: videoUrl.trim(),
            price: property.price,
            currency: property.currency || undefined,
            city: property.city,
            address: property.address,
            property_type: property.property_type,
          })
        }
      }
    })
  }

  // Add projects with videos
  if (projectsWithVideosData) {
    const projectsWithVideos = projectsWithVideosData as Array<{
      id: string
      title: string
      status: string
      type?: string | null
      pre_selling_price?: number | null
      pre_selling_currency?: string | null
      main_price?: number | null
      main_currency?: string | null
      media_urls: string[] | null
    }>
    
    projectsWithVideos.forEach((project) => {
      const mediaUrls = Array.isArray(project.media_urls) 
        ? project.media_urls.filter((url) => url && typeof url === 'string' && url.trim())
        : []
      
      // Find first video URL (not an image)
      const videoUrl = mediaUrls.find((url: string) => {
        const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        return !isImage && url.trim()
      })
      
      if (videoUrl) {
        featuredVideos.push({
          id: project.id,
          title: project.title,
          type: 'project',
          videoUrl: videoUrl.trim(),
          status: project.status,
          project_type: project.type || null,
          pre_selling_price: project.pre_selling_price || null,
          pre_selling_currency: project.pre_selling_currency || null,
          main_price: project.main_price || null,
          main_currency: project.main_currency || null,
        })
      }
    })
  }

  // Limit to 6 items and shuffle for variety
  const shuffledVideos = featuredVideos.sort(() => Math.random() - 0.5).slice(0, 6)

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
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
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
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      {shuffledVideos.length > 0 && (
        <section className="px-4 py-4 sm:py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#0d233e] dark:text-white">Featured Videos</h2>
              <div className="flex gap-2">
                <Link href="/properties" className="text-xs sm:text-sm text-[#c89b3c] hover:underline font-medium">
                  View Properties
                </Link>
                <span className="text-xs sm:text-sm text-gray-400">|</span>
                <Link href="/projects" className="text-xs sm:text-sm text-[#c89b3c] hover:underline font-medium">
                  View Projects
                </Link>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {shuffledVideos.map((item) => (
                <Link 
                  key={`${item.type}-${item.id}`} 
                  href={item.type === 'property' ? `/properties/${item.id}` : `/projects/${item.id}`}
                  className="min-w-[280px] sm:min-w-[320px] bg-white dark:bg-[#1e293b] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-video w-full bg-black group">
                    <video
                      src={item.videoUrl}
                      className="h-full w-full object-cover"
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="rounded-full bg-white/90 p-3 sm:p-4 group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 sm:h-8 sm:w-8 text-[#0d233e] ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-[#c89b3c] text-[#0d233e] text-xs font-semibold px-2 py-1 rounded-full uppercase">
                        {item.type === 'property' ? 'Property' : 'Project'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-[#0d233e] dark:text-white mb-1.5 sm:mb-2 text-sm sm:text-base line-clamp-2">
                      {item.title}
                    </h3>
                    {item.type === 'property' && (
                      <>
                        {item.address && item.city && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1 line-clamp-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{item.address}, {item.city}</span>
                          </p>
                        )}
                        {item.price && (
                          <p className="text-base sm:text-lg font-semibold text-[#c89b3c]">
                            {formatCurrency(item.price, item.currency)}
                          </p>
                        )}
                      </>
                    )}
                    {item.type === 'project' && (
                      <>
                        {item.project_type && (
                          <p className="text-xs font-semibold text-[#c89b3c] mb-2 capitalize">
                            {item.project_type.replace(/_/g, ' ')}
                          </p>
                        )}
                        {(item.pre_selling_price || item.main_price) && (
                          <div className="space-y-1 mb-2">
                            {item.pre_selling_price && (
                              <p className="text-xs sm:text-sm font-semibold text-[#c89b3c]">
                                Pre-selling: {formatCurrency(item.pre_selling_price, item.pre_selling_currency || 'RWF')}
                              </p>
                            )}
                            {item.main_price && (
                              <p className="text-xs sm:text-sm font-semibold text-[#c89b3c]">
                                {formatCurrency(item.main_price, item.main_currency || 'RWF')}
                              </p>
                            )}
                          </div>
                        )}
                        {item.status && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            Status: {item.status}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
                      {formatCurrency(property.price, property.currency || undefined)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Services */}
      <section id="services" className="px-4 py-4 sm:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#0d233e] dark:text-white">Our Services</h2>
            <Link href="/services" className="text-xs sm:text-sm text-[#c89b3c] hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {services.slice(0, 4).map((service) => (
              <Card
                key={service.title}
                className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#1e293b]"
              >
                <div className="relative h-[120px] sm:h-[140px] w-full overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-[#0d233e] dark:text-white mb-1 text-sm sm:text-base">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="bg-gradient-to-br from-[#0d233e] to-[#1a4d3e] text-white py-8 sm:py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#c89b3c] mb-2 sm:mb-3">
              ACHIEVEMENTS
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Our Track Record of Excellence
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-[#c89b3c]/20 p-4 sm:p-5">
                  <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-[#c89b3c]" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#c89b3c] mb-2 sm:mb-3">
              {listingsCount.toLocaleString()}+
              </div>
              <div className="text-base sm:text-lg text-white/90 font-medium">
                Listings
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-[#c89b3c]/20 p-4 sm:p-5">
                  <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-[#c89b3c]" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#c89b3c] mb-2 sm:mb-3">
                {transactionsCount.toLocaleString()}+
              </div>
              <div className="text-base sm:text-lg text-white/90 font-medium">
                Transactions completed
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-[#c89b3c]/20 p-4 sm:p-5">
                  <FolderKanban className="h-8 w-8 sm:h-10 sm:w-10 text-[#c89b3c]" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#c89b3c] mb-2 sm:mb-3">
                {projectsCountValue.toLocaleString()}+
              </div>
              <div className="text-base sm:text-lg text-white/90 font-medium">
                Projects
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-[#c89b3c]/20 p-4 sm:p-5">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-[#c89b3c]" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#c89b3c] mb-2 sm:mb-3">
                {usersCountValue.toLocaleString()}+
              </div>
              <div className="text-base sm:text-lg text-white/90 font-medium">
                Users
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative text-white py-16 sm:py-24 px-4 my-8 sm:my-12 overflow-hidden w-full">
        {/* Background Image - Full Width */}
        <div className="absolute inset-0 z-0">
          {featuredProperties && featuredProperties.length > 0 && featuredProperties[0].cover_image_url ? (
            <Image
              src="/akristal-img-bg.jpg"
              alt="Property background"
              fill
              className="object-cover"
              priority
              quality={90}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0d233e] to-[#1e6b52]" />
          )}
          {/* Overlay for better text readability - lighter overlay for more visibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d233e]/80 to-[#1e6b52]/80" />
        </div>
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
            Ready to Find Your Next Property?
          </h2>
          <p className="text-base sm:text-xl text-white/95 mb-6 sm:mb-8 px-2 drop-shadow-md">
            Join thousands of satisfied customers on TheAkristalGroup
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#c89b3c] text-[#0d233e] hover:bg-[#b88a2a] font-semibold text-base sm:text-lg px-8 py-6 shadow-lg">
                Get Started Today
              </Button>
            </Link>
            <Link href="/properties" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-semibold text-base sm:text-lg px-8 py-6 shadow-lg"
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
