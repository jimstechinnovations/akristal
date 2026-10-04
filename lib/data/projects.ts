import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import type { Database } from '@/types/supabase'

type Row = Database['public']['Tables']['projects']['Row']

export type ProjectStage = 'off_plan' | 'under_construction' | 'completed'

export const STAGES: { value: ProjectStage; label: string }[] = [
  { value: 'off_plan', label: 'Off-plan' },
  { value: 'under_construction', label: 'Under construction' },
  { value: 'completed', label: 'Completed' },
]

export type Project = {
  id: string
  slug: string | null
  name: string
  headline: string
  summary: string | null
  description: string | null
  stage: ProjectStage
  stageLabel: string
  progressPct: number | null
  location: string
  country: string | null
  images: string[]
  videos: string[]
  priceFrom: { amount: number; currency: string } | null
  paySmallSmall: boolean
  soldOut: boolean
  isFeatured: boolean
  completionDate: string | null
  unitTypes: UnitType[]
  /** Units stated in the unit mix; null when the mix gives no counts */
  totalUnits: number | null
}

export type UnitType = { type: string; units?: number; beds?: number; bedsMin?: number; bedsMax?: number }

const VIDEO = /\.(mp4|webm|mov|m4v)(\?|$)/i

function toProject(row: Row): Project {
  const media = (row.media_urls ?? []).filter(Boolean)
  const images = [row.cover_image_url, ...media.filter((u) => !VIDEO.test(u))].filter((u): u is string => !!u)
  const stage: ProjectStage =
    (row.stage as ProjectStage | null) ??
    (row.status === 'completed' || row.status === 'sold_out' ? 'completed' : 'off_plan')
  const price =
    row.pre_selling_price && row.pre_selling_price > 0
      ? { amount: Number(row.pre_selling_price), currency: row.pre_selling_currency || 'RWF' }
      : row.main_price && row.main_price > 0
        ? { amount: Number(row.main_price), currency: row.main_currency || 'RWF' }
        : null
  const unitTypes = (Array.isArray(row.unit_types) ? row.unit_types : []) as UnitType[]
  return {
    id: row.id,
    slug: row.slug,
    name: row.name || row.title,
    headline: row.title,
    summary: row.summary,
    description: row.description,
    stage,
    stageLabel: STAGES.find((s) => s.value === stage)!.label,
    progressPct: row.progress_pct,
    location: [row.district, row.country].filter(Boolean).join(', ') || row.city || '',
    country: row.country,
    images: Array.from(new Set(images)),
    videos: media.filter((u) => VIDEO.test(u)),
    priceFrom: price,
    paySmallSmall: row.pay_small_small,
    soldOut: row.status === 'sold_out',
    isFeatured: row.is_featured,
    completionDate: row.completion_date,
    unitTypes,
    totalUnits: unitTypes.some((u) => u.units) ? unitTypes.reduce((n, u) => n + (u.units ?? 0), 0) : null,
  }
}

/** Public developments (RLS hides drafts and archived), in the order the team set. */
export const getProjects = cache(async (): Promise<Project[]> => {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
  return (data ?? []).map(toProject)
})

/** Featured developments for the home page; projects with no photos are skipped. */
export const getFeaturedProjects = cache(async (limit = 3) => {
  const all = await getProjects()
  const withImages = all.filter((p) => p.images.length > 0)
  const featured = withImages.filter((p) => p.isFeatured)
  return (featured.length ? featured : withImages).slice(0, limit)
})

export const getProject = cache(async (idOrSlug: string) => {
  const all = await getProjects()
  return all.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null
})
