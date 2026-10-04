// Listings store a neighbourhood in `city` ("Maitama", "Wuse 2", "Motor City Dubai").
// Map those to the market a visitor thinks in. Add new areas here as listings arrive.

import { images, type ImageKey } from '@/content/images'

export type Market = {
  slug: string
  name: string
  country: string
  image?: ImageKey
  /** Lower-case fragments that identify the market in `city`, `district` or `address` */
  match: string[]
}

export const markets: Market[] = [
  {
    slug: 'kigali',
    name: 'Kigali',
    country: 'Rwanda',
    image: 'placesKigali',
    match: ['kigali', 'kibagabaga', 'kicukiro', 'kiyovu', 'nyarutarama', 'kacyiru', 'kimihurura', 'gacuriro', 'rebero', 'remera', 'gisozi', 'kanombe', 'gasabo', 'nyarugenge'],
  },
  {
    slug: 'abuja',
    name: 'Abuja',
    country: 'Nigeria',
    image: 'placesAbuja',
    match: ['abuja', 'maitama', 'wuse', 'asokoro', 'guzape', 'katampe', 'life camp', 'jabi', 'gwarinpa', 'jahi', 'lokogoma'],
  },
  {
    slug: 'lagos',
    name: 'Lagos',
    country: 'Nigeria',
    image: 'placesLagos',
    match: ['lagos', 'ikoyi', 'lekki', 'victoria island', 'banana island', 'ikeja', 'oniru', 'ajah'],
  },
  {
    slug: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    image: 'placesDubai',
    match: ['dubai', 'mbr city', 'motor city', 'business bay', 'jvc', 'downtown', 'marina', 'palm jumeirah'],
  },
  { slug: 'kampala', name: 'Kampala', country: 'Uganda', match: ['kampala', 'kololo', 'naguru', 'muyenga', 'bukasa'] },
  {
    slug: 'south-africa',
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
