import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import { defaultSettings, type SiteSettings } from '@/content/defaults'

/**
 * Website settings edited in Admin → Site settings. Each key falls back to the
 * built-in default, so a missing or half-filled row never breaks a page.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const { data } = await createPublicClient().from('site_settings').select('key, value')
  const byKey = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
  return {
    home: { ...defaultSettings.home, ...((byKey.home as object) ?? {}) },
    agent_programme: { ...defaultSettings.agent_programme, ...((byKey.agent_programme as object) ?? {}) },
    contact: { ...defaultSettings.contact, ...((byKey.contact as object) ?? {}) },
  }
})

export type Testimonial = { id: string; name: string; context: string | null; quote: string; rating: number | null; source: 'site' | 'google' }

/** Published client testimonials (the database refuses to publish one without recorded consent). */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const { data } = await createPublicClient()
    .from('testimonials')
    .select('id, name, context, quote, rating, source')
    .eq('is_published', true)
    .order('display_order')
    .limit(12)
  return (data ?? []).map((t) => ({ ...t, source: t.source === 'google' ? 'google' : 'site' }))
})

export type Partner = { id: string; name: string; logoUrl: string | null; websiteUrl: string | null; kind: 'partner' | 'brand' }

export const getPartners = cache(async (): Promise<Partner[]> => {
  const { data } = await createPublicClient().from('partners').select('id, name, logo_url, website_url, kind').eq('is_published', true).order('display_order')
  return (data ?? []).map((p) => ({ id: p.id, name: p.name, logoUrl: p.logo_url, websiteUrl: p.website_url, kind: p.kind === 'brand' ? 'brand' : 'partner' }))
})
