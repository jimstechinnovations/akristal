import type { Metadata } from 'next'
import { site } from '@/config/site'
import { getAllListings, getFeaturedListings, getMarketCounts, getPropertyTypes } from '@/lib/data/listings'
import { getFeaturedProjects, getProjects } from '@/lib/data/projects'
import { getAgents } from '@/lib/data/people'
import { getBrokers } from '@/lib/data/brokers'
import { getArticles } from '@/lib/data/articles'
import { getPartners, getSettings, getTestimonials } from '@/lib/data/settings'
import { getInstallmentPlans } from '@/lib/data/plans'
import { getCopy } from '@/lib/data/copy'
import { computeStats } from '@/lib/stats'
import { Hero } from '@/components/home/hero'
import { Ticker } from '@/components/home/ticker'
import { Developments } from '@/components/home/developments'
import { FeaturedHomes } from '@/components/home/featured-homes'
import { Markets } from '@/components/home/markets'
import { HomesMarquee } from '@/components/home/homes-marquee'
import { InteriorsTeaser } from '@/components/home/interiors-teaser'
import { Finance } from '@/components/home/finance'
import { People } from '@/components/home/people'
import { Partners } from '@/components/home/partners'
import { Testimonials } from '@/components/home/testimonials'
import { Insights } from '@/components/home/insights'
import { SellCta } from '@/components/home/sell-cta'

// Public data only (cookie-free client), so the page is static and refreshed every 10 minutes.
export const revalidate = 600

export const metadata: Metadata = {
  title: { absolute: 'The Akristal Group (TAG) | Homes across Africa and beyond' },
  description: site.description,
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [allProjects, featuredProjects, listings, featured, marketCounts, propertyTypes, agents, brokers, settings, testimonials, partners, articles, plans, copy] =
    await Promise.all([
      getProjects(),
      getFeaturedProjects(3),
      getAllListings(),
      getFeaturedListings(6),
      getMarketCounts(),
      getPropertyTypes(),
      getAgents(),
      getBrokers(),
      getSettings(),
      getTestimonials(),
      getPartners(),
      getArticles(),
      getInstallmentPlans(),
      getCopy('home'),
    ])

  // Figures come from live data unless the admin typed a number (Admin → Home page → Figures).
  const stats = computeStats(settings.home.stats, allProjects, listings)
  const available = listings.filter((l) => l.status === 'available')
  const featuredIds = new Set(featured.map((l) => l.id))

  const areaSuggestions = Array.from(
    new Set([...marketCounts.map((m) => m.market.name), ...available.map((l) => l.area).filter(Boolean)])
  )

  return (
    <>
      <Hero
        title={settings.home.heroTitle}
        tagline={settings.home.tagline}
        image={{ src: settings.home.heroImageUrl, alt: settings.home.heroImageAlt }}
        markets={marketCounts.map((m) => ({ slug: m.market.slug, name: m.market.name, count: m.count }))}
        areaSuggestions={areaSuggestions}
        propertyTypes={propertyTypes}
      />
      <Ticker items={settings.home.tickerItems} />
      <Developments projects={featuredProjects} stats={stats} copy={copy} />
      <FeaturedHomes listings={featured} copy={copy} />
      <Markets markets={marketCounts} copy={copy} />
      {/* The moving strip skips homes already shown in the featured grid. */}
      <HomesMarquee listings={available.filter((l) => !featuredIds.has(l.id))} copy={copy} />
      <InteriorsTeaser copy={copy} />
      <Finance plan={plans[0]} copy={copy} />
      <People agents={agents} brokers={brokers} copy={copy} />
      <Partners partners={partners} copy={copy} />
      <Testimonials
        copy={copy}
        items={testimonials}
        summary={{ rating: settings.home.googleRating, count: settings.home.googleReviewCount, url: settings.home.googleReviewsUrl }}
      />
      <Insights articles={articles} copy={copy} />
      <SellCta propertyTypes={propertyTypes} copy={copy} />
    </>
  )
}
