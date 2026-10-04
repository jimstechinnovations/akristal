import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Bath, BedDouble, Calendar, Car, Check, ChevronRight, Ruler } from 'lucide-react'
import { site } from '@/config/site'
import { getListing, getSimilarListings } from '@/lib/data/listings'
import { getAgents } from '@/lib/data/people'
import { getInstallmentPlans } from '@/lib/data/plans'
import { formatArea, formatMoney } from '@/lib/format'
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { JsonLd } from '@/components/seo/json-ld'
import { Gallery } from '@/components/media/gallery'
import { ShowMore } from '@/components/ui/show-more'
import { CostCalculator } from '@/components/finance/cost-calculator'
import { AgentCard } from '@/components/listings/agent-card'
import { ViewingForm } from '@/components/listings/viewing-form'
import { ListingCard } from '@/components/listings/listing-card'
import { AccountPanel } from '@/components/listings/account-panel'
import { LocationMap, ShareAndSave, StickyActions } from '@/components/listings/detail-client'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await getListing((await params).id)
  if (!listing) return { title: 'Home not found', robots: { index: false } }
  const place = [listing.area, listing.market?.name].filter(Boolean).join(', ')
  const title = `${listing.title}${place ? `, ${place}` : ''}`
  const description = `${formatMoney(listing.price, listing.currency)}${listing.listingType === 'rent' ? ' a month' : ''}. ${[
    listing.bedrooms != null && `${listing.bedrooms} bedrooms`,
    listing.bathrooms != null && `${listing.bathrooms} bathrooms`,
    listing.sizeSqm != null && formatArea(listing.sizeSqm),
  ]
    .filter(Boolean)
    .join(', ')}. ${listing.description.slice(0, 120)}`.trim()
  const image = listing.images[0]
  return {
    title,
    description,
    alternates: { canonical: `/properties/${listing.id}` },
    openGraph: { title, description, url: `/properties/${listing.id}`, type: 'website', images: image ? [{ url: image, alt: listing.title }] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  }
}

export default async function PropertyPage({ params }: PageProps) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) notFound()

  const [similar, agents, plans] = await Promise.all([getSimilarListings(listing), getAgents(), getInstallmentPlans()])
  const agent = listing.agentId ? agents.find((a) => a.id === listing.agentId) ?? null : null
  const place = [listing.area, listing.market?.name].filter((v, i, a) => v && a.indexOf(v) === i).join(', ')
  const url = absoluteUrl(`/properties/${listing.id}`)
  const enquiry = `Hello Akristal, I'm interested in "${listing.title}" (${formatMoney(listing.price, listing.currency)}). ${url}`
  const phoneHref = agent?.phone ? `tel:${agent.phone.replace(/[^\d+]/g, '')}` : site.phone.href

  const facts = [
    listing.bedrooms != null && { icon: BedDouble, value: listing.bedrooms, label: listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms' },
    listing.bathrooms != null && { icon: Bath, value: listing.bathrooms, label: listing.bathrooms === 1 ? 'Bathroom' : 'Bathrooms' },
    listing.sizeSqm != null && { icon: Ruler, value: formatArea(listing.sizeSqm), label: 'Floor area' },
    listing.parking != null && { icon: Car, value: listing.parking, label: 'Parking' },
    listing.yearBuilt != null && { icon: Calendar, value: listing.yearBuilt, label: 'Year built' },
  ].filter(Boolean) as { icon: typeof Bath; value: string | number; label: string }[]

  const details: [string, string][] = (
    [
      ['Type', listing.propertyType],
      ['Listing', listing.listingType === 'rent' ? 'For rent' : 'For sale'],
      ['Price', `${formatMoney(listing.price, listing.currency)}${listing.listingType === 'rent' ? ' a month' : ''}`],
      ['Area', place],
      ['Address', listing.address],
      ['Reference', listing.id.slice(0, 8).toUpperCase()],
    ] as [string, string | null][]
  ).filter((r): r is [string, string] => !!r[1])

  const highlights = [...listing.amenities, ...listing.features]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    url,
    image: listing.images.slice(0, 6),
    description: listing.description.slice(0, 500),
    datePosted: listing.createdAt ?? undefined,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency,
      businessFunction: listing.listingType === 'rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
      availability: 'https://schema.org/InStock',
    },
    about: {
      '@type': listing.propertyType === 'Apartment' ? 'Apartment' : 'SingleFamilyResidence',
      numberOfRooms: listing.bedrooms ?? undefined,
      numberOfBathroomsTotal: listing.bathrooms ?? undefined,
      floorSize: listing.sizeSqm ? { '@type': 'QuantitativeValue', value: listing.sizeSqm, unitCode: 'MTK' } : undefined,
      address: { '@type': 'PostalAddress', streetAddress: listing.address || undefined, addressLocality: listing.area || listing.market?.name, addressCountry: listing.market?.country },
      geo: listing.coords && !listing.coords.approximate ? { '@type': 'GeoCoordinates', latitude: listing.coords.lat, longitude: listing.coords.lng } : undefined,
    },
  }

  return (
    <article className="pb-24 lg:pb-0">
      <JsonLd
        data={[
          jsonLd,
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Homes', path: '/properties' },
            ...(listing.market ? [{ name: listing.market.name, path: `/properties?market=${listing.market.slug}` }] : []),
            { name: listing.title, path: `/properties/${listing.id}` },
          ]),
        ]}
      />

      <div className="page-x-wide pt-6">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/properties" className="hover:text-ink hover:underline">
                Homes
              </Link>
            </li>
            {listing.market && (
              <li className="flex items-center gap-1">
                <ChevronRight aria-hidden className="size-3.5" />
                <Link href={`/properties?market=${listing.market.slug}`} className="hover:text-ink hover:underline">
                  {listing.market.name}
                </Link>
              </li>
            )}
            <li className="flex min-w-0 items-center gap-1">
              <ChevronRight aria-hidden className="size-3.5" />
              <span aria-current="page" className="truncate">
                {listing.area && listing.area !== listing.market?.name ? listing.area : listing.title}
              </span>
            </li>
          </ol>
        </nav>

        <Gallery images={listing.images} videos={listing.videos} title={listing.title} />

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-16">
          <div className="min-w-0">
            <header className="flex flex-col gap-4 border-b border-line pb-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-muted">
                  {listing.listingType === 'rent' ? 'For rent' : 'For sale'}
                  {listing.propertyType && <>, {listing.propertyType.toLowerCase()}</>}
                </p>
                <h1 className="mt-1 font-display text-display-m font-medium">{listing.title}</h1>
                {place && <p className="mt-2 text-[0.9375rem] text-muted">{place}</p>}
                <p className="tabular mt-5 text-[2rem] font-semibold tracking-tight">
                  {formatMoney(listing.price, listing.currency)}
                  {listing.listingType === 'rent' && <span className="text-base font-normal text-muted"> a month</span>}
                </p>
              </div>
              <ShareAndSave id={listing.id} title={listing.title} />
            </header>

            {facts.length > 0 && (
              <ul className="grid grid-cols-2 gap-px overflow-hidden border-b border-line sm:grid-cols-3 lg:grid-cols-5">
                {facts.map(({ icon: Icon, value, label }) => (
                  <li key={label} className="py-6 pr-4">
                    <Icon aria-hidden className="size-5 text-muted" />
                    <p className="tabular mt-2 text-xl font-semibold">{value}</p>
                    <p className="text-sm text-muted">{label}</p>
                  </li>
                ))}
              </ul>
            )}

            {listing.description && (
              <section aria-labelledby="about-title" className="border-b border-line py-10">
                <h2 id="about-title" className="font-display text-display-s font-medium">
                  About this home
                </h2>
                <ShowMore text={listing.description} className="mt-4 max-w-[70ch]" />
              </section>
            )}

            {highlights.length > 0 && (
              <section aria-labelledby="features-title" className="border-b border-line py-10">
                <h2 id="features-title" className="font-display text-display-s font-medium">
                  Features
                </h2>
                <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-[0.9375rem]">
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                      <span className="first-letter:uppercase">{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="details-title" className="border-b border-line py-10">
              <h2 id="details-title" className="font-display text-display-s font-medium">
                Details
              </h2>
              <dl className="mt-5 grid gap-x-8 sm:grid-cols-2">
                {details.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-line py-3 text-[0.9375rem]">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {listing.coords && (
              <section aria-labelledby="location-title" className="border-b border-line py-10">
                <h2 id="location-title" className="font-display text-display-s font-medium">
                  Location
                </h2>
                <p className="mt-2 text-[0.9375rem] text-muted">{place}</p>
                <div className="mt-5">
                  <LocationMap
                    listing={{
                      id: listing.id,
                      title: listing.title,
                      price: listing.price,
                      currency: listing.currency,
                      listingType: listing.listingType,
                      image: listing.images[0] ?? null,
                      place,
                      lat: listing.coords.lat,
                      lng: listing.coords.lng,
                      approximate: listing.coords.approximate,
                    }}
                  />
                </div>
              </section>
            )}

            {listing.listingType === 'sale' && (
              <div className="py-10">
                <CostCalculator price={listing.price} currency={listing.currency} plan={plans[0]} />
              </div>
            )}

            <Suspense fallback={null}>
              <AccountPanel propertyId={listing.id} />
            </Suspense>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <AgentCard agent={agent} enquiry={enquiry} />
            <section id="book-viewing" aria-labelledby="viewing-title" className="mt-6 scroll-mt-24 rounded-md border border-line p-5">
              <h2 id="viewing-title" className="text-lg font-semibold">
                Book a viewing
              </h2>
              <p className="mt-1 text-sm text-muted">Pick a day and we will confirm a time with you.</p>
              <div className="mt-5">
                <ViewingForm propertyId={listing.id} agentId={listing.agentId} title={listing.title} />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar-title" className="mt-16 border-t border-line bg-page-alt py-16">
          <div className="page-x-wide">
            <h2 id="similar-title" className="font-display text-display-m font-medium">
              Similar homes
            </h2>
            <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((l) => (
                <li key={l.id}>
                  <ListingCard listing={l} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <StickyActions phoneHref={phoneHref} whatsappHref={whatsappLink(enquiry, agent?.whatsapp ?? site.whatsapp)} />
    </article>
  )
}
