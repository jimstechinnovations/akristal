// Listings store a neighbourhood in `city` ("Maitama", "Wuse 2", "Motor City Dubai").
// Map those to the market a visitor thinks in. Add new areas here as listings arrive.

import { images, type ImageKey } from '@/content/images'

export type Market = {
  slug: string
  name: string
  country: string
  /** Map centre used when a listing has no coordinates of its own */
  centre: [number, number]
  image?: ImageKey
  /** Lower-case fragments that identify the market in `city`, `district` or `address` */
  match: string[]
}

export const markets: Market[] = [
  {
    slug: 'kigali',
    centre: [-1.9441, 30.0619],
    name: 'Kigali',
    country: 'Rwanda',
    image: 'placesKigali',
    match: ['kigali', 'kibagabaga', 'kicukiro', 'kiyovu', 'nyarutarama', 'kacyiru', 'kimihurura', 'gacuriro', 'rebero', 'remera', 'gisozi', 'kanombe', 'gasabo', 'nyarugenge'],
  },
  {
    slug: 'abuja',
    centre: [9.0765, 7.3986],
    name: 'Abuja',
    country: 'Nigeria',
    image: 'placesAbuja',
    match: ['abuja', 'maitama', 'wuse', 'asokoro', 'guzape', 'katampe', 'life camp', 'jabi', 'gwarinpa', 'jahi', 'lokogoma'],
  },
  {
    slug: 'lagos',
    centre: [6.4541, 3.4246],
    name: 'Lagos',
    country: 'Nigeria',
    image: 'placesLagos',
    match: ['lagos', 'ikoyi', 'lekki', 'victoria island', 'banana island', 'ikeja', 'oniru', 'ajah'],
  },
  {
    slug: 'dubai',
    centre: [25.2048, 55.2708],
    name: 'Dubai',
    country: 'United Arab Emirates',
    image: 'placesDubai',
    match: ['dubai', 'mbr city', 'motor city', 'business bay', 'jvc', 'downtown', 'marina', 'palm jumeirah'],
  },
  { slug: 'kampala', centre: [0.3476, 32.5825], name: 'Kampala', country: 'Uganda', match: ['kampala', 'kololo', 'naguru', 'muyenga', 'bukasa'] },
  {
    slug: 'south-africa',
    centre: [-26.1076, 28.0567],
    name: 'South Africa',
    country: 'South Africa',
    match: ['south africa', 'johannesburg', 'waterfall', 'midrand', 'sandton', 'cape town', 'boland', 'stellenbosch', 'pretoria'],
  },
]

export function marketFor(fields: { city?: string | null; district?: string | null; address?: string | null; country?: string | null }) {
  const haystack = [fields.city, fields.district, fields.address, fields.country].filter(Boolean).join(' ').toLowerCase()
  return markets.find((m) => m.match.some((frag) => haystack.includes(frag))) ?? null
}

export function marketBySlug(slug: string | null | undefined) {
  return markets.find((m) => m.slug === slug) ?? null
}

export function marketImage(m: Market) {
  return m.image ? images[m.image] : null
}

/** Tidy a free-text neighbourhood: trims stray spaces and drops a trailing market name ("Motor City Dubai" → "Motor City"). */
export function cleanArea(city: string | null | undefined, market?: Market | null) {
  let area = (city ?? '').replace(/\s+/g, ' ').trim().replace(/,\s*$/, '')
  if (market) {
    const re = new RegExp(`[,\\s]+${market.name}$`, 'i')
    if (re.test(area) && area.toLowerCase() !== market.name.toLowerCase()) area = area.replace(re, '')
  }
  return area
}

// Neighbourhood centres for listings without coordinates (approximate pins only).
const AREA_CENTRES: [string, [number, number]][] = [
  ['maitama', [9.0882, 7.4934]],
  ['wuse 2', [9.079, 7.47]],
  ['wuse', [9.0667, 7.4833]],
  ['asokoro', [9.0435, 7.5266]],
  ['life camp', [9.0786, 7.4061]],
  ['banana island', [6.457, 3.444]],
  ['victoria island', [6.4281, 3.4219]],
  ['ikoyi', [6.4549, 3.4366]],
  ['lekki', [6.4698, 3.5852]],
  ['kibagabaga', [-1.93, 30.113]],
  ['kicukiro', [-1.99, 30.1]],
  ['nyarutarama', [-1.9365, 30.0985]],
  ['kiyovu', [-1.9499, 30.0605]],
  ['motor city', [25.045, 55.238]],
  ['mbr city', [25.17, 55.31]],
  ['waterfall', [-25.995, 28.11]],
  ['boland', [-33.73, 18.97]],
  ['bukasa', [0.3, 32.62]],
]

/** Exact coordinates when the listing has them; otherwise the neighbourhood or market centre, flagged approximate. */
export function coordinatesFor(
  fields: { latitude?: number | null; longitude?: number | null; city?: string | null; district?: string | null; address?: string | null },
  market: Market | null,
  seed: string
): { lat: number; lng: number; approximate: boolean } | null {
  if (fields.latitude != null && fields.longitude != null) {
    return { lat: Number(fields.latitude), lng: Number(fields.longitude), approximate: false }
  }
  const text = [fields.city, fields.district, fields.address].filter(Boolean).join(' ').toLowerCase()
  const centre = AREA_CENTRES.find(([key]) => text.includes(key))?.[1] ?? market?.centre
  if (!centre) return null
  // Small, stable offset so several homes in one area don't stack on a single point.
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0
  const dx = ((h & 0xff) / 255 - 0.5) * 0.012
  const dy = (((h >> 8) & 0xff) / 255 - 0.5) * 0.012
  return { lat: centre[0] + dy, lng: centre[1] + dx, approximate: true }
}
