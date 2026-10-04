import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { getAllListings, getPropertyTypes } from '@/lib/data/listings'
import { marketBySlug, markets } from '@/lib/data/markets'
import {
  activeFilterCount,
  filterListings,
  paginate,
  parseSearchParams,
  sortListings,
  type SearchParams,
} from '@/lib/listing-search'
import { plural } from '@/lib/format'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { buttonClasses } from '@/components/ui/button'
import { JsonLd } from '@/components/seo/json-ld'
import { ListingCard } from '@/components/listings/listing-card'
import { FilterBar } from '@/components/search/filter-bar'
import { MapView } from '@/components/search/map-view'
import { Pagination } from '@/components/search/pagination'

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

function heading(p: SearchParams) {
  const what = p.listingType === 'rent' ? 'Homes for rent' : p.listingType === 'sale' ? 'Homes for sale' : 'Homes for sale and rent'
  const market = marketBySlug(p.market)
  return market ? `${what} in ${market.name}` : what
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const p = parseSearchParams(await searchParams)
  const title = heading(p)
  const filtered = p.search || p.type || p.currency || p.bedrooms || p.bathrooms || p.page > 1 || p.sort !== 'newest'
  return {
    ...pageMetadata({
      title,
      description: `${title}: houses, apartments and land listed with Akristal agents, with photos, prices and monthly cost estimates.`,
      path: '/properties',
      noIndex: !!filtered, // keep only the main browse pages in search engines
    }),
  }
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const rawParams = await searchParams
  const p = parseSearchParams(rawParams)
  const raw = Object.fromEntries(
    Object.entries(rawParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  ) as Record<string, string | undefined>

  const [all, types] = await Promise.all([getAllListings(), getPropertyTypes()])
  const results = sortListings(filterListings(all, p), p.sort)
  const page = paginate(results, p.page)
  const title = heading(p)

  const marketOptions = markets
    .filter((m) => all.some((l) => l.market?.slug === m.slug && l.status === 'available'))
    .map((m) => ({ value: m.slug, label: m.name }))
  const typeOptions = types.map((t) => ({ value: t.id, label: t.name }))

  const empty = (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <SearchX aria-hidden className="size-10 text-muted" />
      <h2 className="mt-4 text-lg font-semibold">No homes match these filters</h2>
      <p className="mt-2 text-[0.9375rem] text-muted">
        Try a wider price range, another area, or fewer bedrooms.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/properties" className={buttonClasses()}>
          Clear all filters
        </Link>
        <Link href="/sell" className={buttonClasses({ variant: 'outline' })}>
          Tell us what you need
        </Link>
      </div>
    </div>
  )

  const mapListings = results
    .filter((l) => l.coords)
    .map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      currency: l.currency,
      listingType: l.listingType,
      image: l.images[0] ?? null,
      place: [l.area, l.market?.name].filter(Boolean).join(', '),
      lat: l.coords!.lat,
      lng: l.coords!.lng,
      approximate: l.coords!.approximate,
    }))

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Homes', path: '/properties' }])} />
      <div className="page-x-wide pb-6 pt-8 sm:pt-10">
        <h1 className="font-display text-display-l font-medium">{title}</h1>
        <p className="mt-2 text-[0.9375rem] text-muted" aria-live="polite">
          {results.length ? `${plural(results.length, 'home')} available` : 'No homes found'}
          {p.search && <> matching “{p.search}”</>}
        </p>
      </div>

      <FilterBar params={p} raw={raw} markets={marketOptions} propertyTypes={typeOptions} activeCount={activeFilterCount(p)} />

      {p.view === 'map' ? (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="order-2 h-[60svh] lg:sticky lg:top-[9.5rem] lg:order-none lg:col-start-2 lg:row-start-1 lg:h-[calc(100svh-9.5rem)]">
            <MapView listings={mapListings} />
          </div>
          <div className="px-4 py-8 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-10">
            {results.length ? (
              <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
                {results.map((l) => (
                  <li key={l.id}>
                    <ListingCard listing={l} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw" />
                  </li>
                ))}
              </ul>
            ) : (
              empty
            )}
          </div>
        </div>
      ) : (
        <div className="page-x-wide py-10">
          {page.items.length ? (
            <>
              <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {page.items.map((l, i) => (
                  <li key={l.id}>
                    <ListingCard listing={l} priority={i < 3} />
                  </li>
                ))}
              </ul>
              <div className="mt-14">
                <Pagination page={page.page} pageCount={page.pageCount} raw={raw} />
              </div>
            </>
          ) : (
            empty
          )}
        </div>
      )}
    </>
  )
}
