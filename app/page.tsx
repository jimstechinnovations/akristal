import type { Metadata } from 'next'
import { site } from '@/config/site'
import { getAllListings, getFeaturedListings, getMarketCounts, getPropertyTypes } from '@/lib/data/listings'
import { getFeaturedProjects, getProjects } from '@/lib/data/projects'
import { getAgents, getTeam } from '@/lib/data/people'
import { Hero } from '@/components/home/hero'
import { Developments, type Stat } from '@/components/home/developments'
import { FeaturedHomes } from '@/components/home/featured-homes'
import { Markets } from '@/components/home/markets'
import { InteriorsTeaser } from '@/components/home/interiors-teaser'
import { Finance } from '@/components/home/finance'
import { People } from '@/components/home/people'
import { SellCta } from '@/components/home/sell-cta'

// Public data only (cookie-free client), so the page is static and refreshed every 10 minutes.
export const revalidate = 600

export const metadata: Metadata = {
  title: { absolute: 'The Akristal Group | Homes in Kigali and across Africa' },
  description: site.description,
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [allProjects, featuredProjects, listings, featured, marketCounts, propertyTypes, agents, team] = await Promise.all([
    getProjects(),
    getFeaturedProjects(3),
    getAllListings(),
    getFeaturedListings(6),
    getMarketCounts(),
    getPropertyTypes(),
    getAgents(),
    getTeam(),
  ])

  // Every figure below is counted from live data; nothing is estimated or padded.
  const available = listings.filter((l) => l.status === 'available')
  const developments = new Set(allProjects.map((p) => p.name.split(':')[0].trim())).size
  const homesSold = allProjects.filter((p) => p.soldOut).reduce((n, p) => n + (p.totalUnits ?? 0), 0)
  const countries = new Set([
    ...available.map((l) => l.market?.country).filter(Boolean),
    ...allProjects.map((p) => p.country).filter(Boolean),
  ]).size
  const stats: Stat[] = [
    developments > 0 && { value: developments, label: 'Akristal developments, built or underway' },
    homesSold > 0 && { value: homesSold, label: 'homes sold at Valid Dreams Estate, Abuja' },
    available.length > 0 && { value: available.length, label: 'homes for sale and rent today' },
    countries > 0 && { value: countries, label: 'countries where we sell and let homes' },
  ].filter(Boolean) as Stat[]

  const areaSuggestions = Array.from(
    new Set([...marketCounts.map((m) => m.market.name), ...available.map((l) => l.area).filter(Boolean)])
  )

  return (
    <>
      <Hero
        markets={marketCounts.map((m) => ({ slug: m.market.slug, name: m.market.name, count: m.count }))}
        areaSuggestions={areaSuggestions}
        propertyTypes={propertyTypes}
      />
      <Developments projects={featuredProjects} stats={stats} />
      <FeaturedHomes listings={featured} />
      <Markets markets={marketCounts} />
      <InteriorsTeaser />
      <Finance />
      <People team={team} agents={agents} />
      <SellCta propertyTypes={propertyTypes} />
    </>
  )
}
