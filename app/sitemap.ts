import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { createPublicClient } from '@/lib/supabase/public'

export const revalidate = 3600

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/properties', priority: 0.9, changeFrequency: 'daily' },
  { path: '/projects', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/agents', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/mortgage', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pay-small-small', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/interior-design', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/furniture', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/sell', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/join', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/support', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.1, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.1, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  try {
    const supabase = createPublicClient()
    const [{ data: properties }, { data: projects }] = await Promise.all([
      supabase.from('properties').select('id, updated_at').eq('listing_status', 'approved').limit(5000),
      supabase.from('projects').select('id, updated_at').neq('status', 'draft').neq('status', 'archived').limit(1000),
    ])
    for (const p of properties ?? []) {
      entries.push({ url: absoluteUrl(`/properties/${p.id}`), lastModified: p.updated_at ? String(p.updated_at) : now, changeFrequency: 'weekly', priority: 0.8 })
    }
    for (const p of projects ?? []) {
      entries.push({ url: absoluteUrl(`/projects/${p.id}`), lastModified: p.updated_at ? String(p.updated_at) : now, changeFrequency: 'weekly', priority: 0.8 })
    }
  } catch {
    // Database unreachable at build time: ship the static routes rather than failing the build.
  }

  return entries
}
