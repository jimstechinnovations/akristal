import { describe, expect, it } from 'vitest'
import type { Listing } from '@/lib/data/listings'
import { activeFilterCount, filterListings, paginate, parseSearchParams, searchHref, sortListings } from './listing-search'

const kigali = { slug: 'kigali', name: 'Kigali', country: 'Rwanda', centre: [0, 0] as [number, number], match: [] }
const abuja = { slug: 'abuja', name: 'Abuja', country: 'Nigeria', centre: [0, 0] as [number, number], match: [] }

function listing(over: Partial<Listing>): Listing {
  return {
    id: Math.random().toString(36).slice(2),
    title: 'Home',
    price: 100,
    currency: 'RWF',
    listingType: 'sale',
    status: 'available',
    propertyTypeId: 'house',
    propertyType: 'House',
    area: 'Kibagabaga',
    market: kigali,
    address: '',
    bedrooms: 3,
    bathrooms: 2,
    sizeSqm: 200,
    parking: null,
    images: [],
    hasVideo: false,
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
    coords: null,
    agentId: null,
    sellerId: null,
    buildStage: null,
    ...over,
  }
}

describe('parseSearchParams', () => {
  it('reads valid values and ignores junk', () => {
    const p = parseSearchParams({ listing_type: 'rent', minPrice: '1,000', bedrooms: 'x', sort: 'nope', page: '-3', view: 'map' })
    expect(p.listingType).toBe('rent')
    expect(p.minPrice).toBe(1000)
    expect(p.bedrooms).toBeNull()
    expect(p.sort).toBe('newest')
    expect(p.page).toBe(1)
    expect(p.view).toBe('map')
  })

  it('counts active filters, ignoring a price range with no currency', () => {
    expect(activeFilterCount(parseSearchParams({ market: 'kigali', minPrice: '5' }))).toBe(1)
    expect(activeFilterCount(parseSearchParams({ currency: 'rwf', minPrice: '5', bedrooms: '2' }))).toBe(2)
  })
})

describe('filterListings', () => {
  const all = [
    listing({ title: 'Villa', price: 500, bedrooms: 5 }),
    listing({ title: 'Flat', price: 80, listingType: 'rent', propertyTypeId: 'apartment' }),
    listing({ title: 'Duplex', price: 900, currency: 'NGN', market: abuja, area: 'Maitama' }),
    listing({ title: 'Sold house', status: 'sold' }),
  ]

  it('hides homes that are no longer available', () => {
    expect(filterListings(all, parseSearchParams({})).map((l) => l.title)).not.toContain('Sold house')
  })

  it('filters by sale/rent, market and type', () => {
    expect(filterListings(all, parseSearchParams({ listing_type: 'rent' })).map((l) => l.title)).toEqual(['Flat'])
    expect(filterListings(all, parseSearchParams({ market: 'abuja' })).map((l) => l.title)).toEqual(['Duplex'])
    expect(filterListings(all, parseSearchParams({ type: 'apartment' })).map((l) => l.title)).toEqual(['Flat'])
  })

  it('applies a price range only within the chosen currency', () => {
    const rwf = filterListings(all, parseSearchParams({ currency: 'RWF', minPrice: '100' })).map((l) => l.title)
    expect(rwf).toEqual(['Villa'])
    // Without a currency, a price range is ignored rather than comparing NGN with RWF.
    expect(filterListings(all, parseSearchParams({ minPrice: '100' }))).toHaveLength(3)
  })

  it('matches every word of a free-text search across title, area and market', () => {
    expect(filterListings(all, parseSearchParams({ search: 'maitama duplex' })).map((l) => l.title)).toEqual(['Duplex'])
    expect(filterListings(all, parseSearchParams({ search: 'kigali villa' })).map((l) => l.title)).toEqual(['Villa'])
  })

  it('treats bedrooms as a minimum', () => {
    expect(filterListings(all, parseSearchParams({ bedrooms: '4' })).map((l) => l.title)).toEqual(['Villa'])
  })
})

describe('sortListings', () => {
  it('ranks prices within each currency, never across currencies', () => {
    const items = [
      listing({ title: 'A', price: 300, currency: 'USD' }),
      listing({ title: 'B', price: 5, currency: 'NGN' }),
      listing({ title: 'C', price: 100, currency: 'USD' }),
    ]
    expect(sortListings(items, 'price_asc').map((l) => l.title)).toEqual(['B', 'C', 'A'])
  })

  it('puts featured homes first, then newest', () => {
    const items = [
      listing({ title: 'old', createdAt: '2025-01-01T00:00:00Z' }),
      listing({ title: 'new', createdAt: '2026-06-01T00:00:00Z' }),
      listing({ title: 'featured', isFeatured: true, createdAt: '2024-01-01T00:00:00Z' }),
    ]
    expect(sortListings(items, 'newest').map((l) => l.title)).toEqual(['featured', 'new', 'old'])
  })
})

describe('paginate and searchHref', () => {
  it('clamps the page to the last page', () => {
    const r = paginate(Array.from({ length: 25 }, (_, i) => i), 9, 12)
    expect(r.page).toBe(3)
    expect(r.items).toEqual([24])
    expect(r.pageCount).toBe(3)
  })

  it('resets to page 1 when a filter changes, and removes cleared keys', () => {
    expect(searchHref({ page: '3', market: 'kigali' }, { bedrooms: 2 })).toBe('/properties?market=kigali&bedrooms=2')
    expect(searchHref({ market: 'kigali' }, { market: null })).toBe('/properties')
    expect(searchHref({ market: 'kigali' }, { page: 2 })).toBe('/properties?market=kigali&page=2')
  })
})
