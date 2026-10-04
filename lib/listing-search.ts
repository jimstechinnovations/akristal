// Pure search over listings: URL params in, filtered/sorted/paged results out.
// Kept free of I/O so it can be unit-tested and later swapped for a database query.

import type { Listing } from '@/lib/data/listings'

export const PAGE_SIZE = 12

export const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price, low to high' },
  { value: 'price_desc', label: 'Price, high to low' },
  { value: 'size_desc', label: 'Largest' },
] as const
export type SortValue = (typeof SORTS)[number]['value']

export type SearchParams = {
  listingType: 'sale' | 'rent' | null
  market: string | null
  search: string
  type: string | null
  currency: string | null
  minPrice: number | null
  maxPrice: number | null
  bedrooms: number | null
  bathrooms: number | null
  sort: SortValue
  page: number
  view: 'grid' | 'map'
}

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined
const num = (v: string | undefined) => {
  if (!v) return null
  const n = Number(v.replace(/[,\s]/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function parseSearchParams(raw: RawParams): SearchParams {
  const listingType = first(raw.listing_type)
  const sort = first(raw.sort) as SortValue | undefined
  const page = Math.max(1, Math.floor(num(first(raw.page)) ?? 1))
  return {
    listingType: listingType === 'sale' || listingType === 'rent' ? listingType : null,
    market: first(raw.market) ?? null,
    // `city` is the old site's parameter; treat it as a search so existing links keep working.
    search: first(raw.search) ?? first(raw.city) ?? '',
    type: first(raw.type) ?? null,
    currency: first(raw.currency)?.toUpperCase() ?? null,
    minPrice: num(first(raw.minPrice)),
    maxPrice: num(first(raw.maxPrice)),
    bedrooms: num(first(raw.bedrooms)),
    bathrooms: num(first(raw.bathrooms)),
    sort: SORTS.some((s) => s.value === sort) ? sort! : 'newest',
    page,
    view: first(raw.view) === 'map' ? 'map' : 'grid',
  }
}

/** Number of narrowing filters applied (for the "Filters (n)" button). */
export function activeFilterCount(p: SearchParams) {
  return [
    p.market,
    p.type,
    p.currency && (p.minPrice != null || p.maxPrice != null),
    p.bedrooms,
    p.bathrooms,
  ].filter(Boolean).length
}

export function filterListings(listings: Listing[], p: SearchParams): Listing[] {
  const q = p.search.toLowerCase()
  return listings.filter((l) => {
    if (l.status !== 'available') return false
    if (p.listingType && l.listingType !== p.listingType) return false
    if (p.market && l.market?.slug !== p.market) return false
    if (p.type && l.propertyTypeId !== p.type) return false
    if (p.currency) {
      // Prices are only comparable within one currency.
      if (l.currency !== p.currency) return false
      if (p.minPrice != null && l.price < p.minPrice) return false
      if (p.maxPrice != null && l.price > p.maxPrice) return false
    }
    if (p.bedrooms != null && (l.bedrooms ?? 0) < p.bedrooms) return false
    if (p.bathrooms != null && (l.bathrooms ?? 0) < p.bathrooms) return false
    if (q) {
      const hay = [l.title, l.area, l.address, l.market?.name, l.market?.country, l.propertyType].join(' ').toLowerCase()
      if (!q.split(/\s+/).every((word) => hay.includes(word))) return false
    }
    return true
  })
}

export function sortListings(listings: Listing[], sort: SortValue): Listing[] {
  const out = [...listings]
  const time = (l: Listing) => (l.createdAt ? Date.parse(l.createdAt) : 0)
  switch (sort) {
    case 'price_asc':
    case 'price_desc': {
      const dir = sort === 'price_asc' ? 1 : -1
      // Group by currency first: an NGN figure and a USD figure can't be ranked against each other.
      return out.sort((a, b) => a.currency.localeCompare(b.currency) || dir * (a.price - b.price))
    }
    case 'size_desc':
      return out.sort((a, b) => (b.sizeSqm ?? -1) - (a.sizeSqm ?? -1))
    default:
      return out.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || time(b) - time(a))
  }
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(page, pageCount)
  return { items: items.slice((current - 1) * size, current * size), page: current, pageCount, total: items.length }
}

/** Builds a /properties URL from the current params with some keys changed (null removes a key). */
export function searchHref(current: Record<string, string | undefined>, changes: Record<string, string | number | null>) {
  const next = new URLSearchParams()
  for (const [k, v] of Object.entries(current)) if (v) next.set(k, v)
  for (const [k, v] of Object.entries(changes)) {
    if (v === null || v === '') next.delete(k)
    else next.set(k, String(v))
  }
  // Any filter change returns to page 1 unless the page itself is being changed.
  if (!('page' in changes)) next.delete('page')
  const qs = next.toString()
  return qs ? `/properties?${qs}` : '/properties'
}
