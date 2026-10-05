import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'

export type Broker = {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  about: string | null
  contactName: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  websiteUrl: string | null
  address: string | null
  city: string | null
  country: string | null
  areas: string[]
  registrationNumber: string | null
  isVerified: boolean
}

/** Published broker companies (RLS hides unpublished ones, including the admin's example record). */
export const getBrokers = cache(async (): Promise<Broker[]> => {
  const { data } = await createPublicClient().from('brokers').select('*').order('display_order').order('name')
  return (data ?? []).map((b) => ({
    id: b.id,
    slug: b.slug || b.id,
    name: b.name,
    logoUrl: b.logo_url,
    about: b.about,
    contactName: b.contact_name,
    phone: b.phone,
    whatsapp: b.whatsapp,
    email: b.email,
    websiteUrl: b.website_url,
    address: b.address,
    city: b.city,
    country: b.country,
    areas: b.areas ?? [],
    registrationNumber: b.registration_number,
    isVerified: b.is_verified,
  }))
})

export const getBroker = cache(async (slug: string) => (await getBrokers()).find((b) => b.slug === slug || b.id === slug) ?? null)
