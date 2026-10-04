import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'

import type { FurnitureCategory, FurnitureItem, InteriorProject } from './interiors-shared'

export * from './interiors-shared'

/** Published interior projects, managed in Admin → Interior portfolio. */
export const getInteriorProjects = cache(async (): Promise<InteriorProject[]> => {
  const { data } = await createPublicClient().from('interior_projects').select('*').eq('is_published', true).order('display_order')
  return (data ?? []).map((p) => ({
        slug: p.slug,
        title: p.title,
        location: p.location,
        spaceType: p.space_type as InteriorProject['spaceType'],
        services: p.services ?? [],
        cover: { src: p.cover_image_url ?? p.image_urls?.[0] ?? '', alt: p.title },
        gallery: (p.image_urls ?? []).map((src) => ({ src, alt: p.title })),
        beforeAfter: (Array.isArray(p.before_after) ? p.before_after : []) as InteriorProject['beforeAfter'],
        summary: p.summary,
      }))
})

/** Published furniture, managed in Admin → Furniture. */
export const getFurniture = cache(async (): Promise<FurnitureItem[]> => {
  const { data } = await createPublicClient().from('furniture_items').select('*').eq('is_published', true).order('display_order')
  return (data ?? []).map((f) => ({
        id: f.id,
        sku: f.sku,
        name: f.name,
        category: f.category as FurnitureCategory,
        description: f.description,
        images: (f.image_urls ?? []).map((src) => ({ src, alt: f.name })),
        price: !f.price_on_request && f.price != null ? { amount: Number(f.price), currency: f.currency } : null,
        dimensions: f.dimensions,
        materials: f.materials ?? [],
        colours: f.colours ?? [],
        leadTimeDays: f.lead_time_days,
        madeToOrder: f.made_to_order,
      }))
})
