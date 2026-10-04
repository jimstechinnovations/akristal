import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import type { Database } from '@/types/supabase'
import { cleanArea, coordinatesFor, marketFor, type Market } from './markets'

type Row = Database['public']['Tables']['properties']['Row']

export type Listing = {
  id: string
  title: string
  price: number
  currency: string
  listingType: 'sale' | 'rent'
  status: Row['status']
  propertyTypeId: string | null
  propertyType: string | null
  area: string
  market: Market | null
  address: string
  bedrooms: number | null
  bathrooms: number | null
  sizeSqm: number | null
  parking: number | null
  images: string[]
  hasVideo: boolean
  isFeatured: boolean
  createdAt: string | null
  coords: { lat: number; lng: number; approximate: boolean } | null
}

const LISTING_COLUMNS =
  'id, title, price, currency, listing_type, status, property_type_id, city, district, address, country, latitude, longitude, bedrooms, bathrooms, size_sqm, parking_spaces, cover_image_url, image_urls, video_urls, is_featured, created_at'

type ListingRow = Pick<
  Row,
  | 'id' | 'title' | 'price' | 'currency' | 'listing_type' | 'status' | 'property_type_id' | 'city' | 'district' | 'address'
  | 'country' | 'bedrooms' | 'bathrooms' | 'size_sqm' | 'parking_spaces' | 'cover_image_url' | 'image_urls' | 'video_urls'
  | 'is_featured' | 'created_at' | 'latitude' | 'longitude'
>

export function toListing(row: ListingRow, typeNames: Map<string, string>): Listing {
  const market = marketFor(row)
  const gallery = [row.cover_image_url, ...(row.image_urls ?? [])].filter((u): u is string => !!u)
  return {
    id: row.id,
    title: row.title.replace(/\s+/g, ' ').trim(),
    price: Number(row.price),
    currency: (row.currency || 'RWF').toUpperCase(),
    listingType: row.listing_type === 'rent' ? 'rent' : 'sale',
    status: row.status,
    propertyTypeId: row.property_type_id,
    propertyType: row.property_type_id ? typeNames.get(row.property_type_id) ?? null : null,
    area: cleanArea(row.city, market),
    market,
    address: row.address?.trim() ?? '',
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sizeSqm: row.size_sqm,
    parking: row.parking_spaces,
    images: Array.from(new Set(gallery)),
    hasVideo: (row.video_urls ?? []).length > 0,
    isFeatured: row.is_featured,
    createdAt: row.created_at,
    coords: coordinatesFor(row, market, row.id),
  }
}

export const getPropertyTypes = cache(async () => {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('property_types')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order')
  return data ?? []
})

async function typeNameMap() {
  const types = await getPropertyTypes()
  return new Map(types.map((t) => [t.id, t.name]))
}

/** Approved, available listings: featured first, then newest. */
export const getFeaturedListings = cache(async (limit = 6): Promise<Listing[]> => {
  const supabase = createPublicClient()
  const [{ data }, names] = await Promise.all([
    supabase
      .from('properties')
      .select(LISTING_COLUMNS)
      .eq('listing_status', 'approved')
      .eq('status', 'available')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit),
    typeNameMap(),
  ])
  return (data ?? []).map((r) => toListing(r as ListingRow, names))
})

/** Every approved listing (small inventory today; paginate in the query once it grows past a few hundred). */
export const getAllListings = cache(async (): Promise<Listing[]> => {
  const supabase = createPublicClient()
  const [{ data }, names] = await Promise.all([
    supabase
      .from('properties')
      .select(LISTING_COLUMNS)
      .eq('listing_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1000),
    typeNameMap(),
  ])
  return (data ?? []).map((r) => toListing(r as ListingRow, names))
})

export type MarketCount = { market: Market; count: number }

export const getMarketCounts = cache(async (): Promise<MarketCount[]> => {
  const listings = await getAllListings()
  const counts = new Map<string, MarketCount>()
  for (const l of listings) {
    if (!l.market || l.status !== 'available') continue
    const entry = counts.get(l.market.slug) ?? { market: l.market, count: 0 }
    entry.count += 1
    counts.set(l.market.slug, entry)
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)
})
