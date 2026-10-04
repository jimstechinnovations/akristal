import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'

export type Agent = {
  id: string
  slug: string
  name: string
  title: string
  avatarUrl: string | null
  bio: string | null
  areas: string[]
  specialties: string[]
  languages: string[]
  phone: string | null
  whatsapp: string | null
  email: string | null
  socials: Record<string, string>
  yearsExperience: number | null
  isVerified: boolean
  isFeatured: boolean
  rating: { average: number; count: number } | null
}

export function agentSlug(name: string, id: string) {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return base ? `${base}-${id.slice(0, 6)}` : id
}

// Accounts named like this are test or placeholder sign-ups, not people to show publicly.
const NOT_A_NAME = /^(agent|test|admin|user)\b/i

export const getAgents = cache(async (): Promise<Agent[]> => {
  const supabase = createPublicClient()
  const [{ data: rows }, { data: stats }] = await Promise.all([
    supabase.from('agent_directory').select('*'),
    supabase.from('agent_review_stats').select('*'),
  ])
  const ratings = new Map((stats ?? []).map((s) => [s.agent_id, s]))
  return (rows ?? [])
    .filter((r) => r.id && r.full_name && !NOT_A_NAME.test(r.full_name.trim()))
    .map((r) => {
      const stat = ratings.get(r.id!)
      return {
        id: r.id!,
        slug: r.slug || agentSlug(r.full_name!, r.id!),
        name: r.full_name!.trim(),
        title: r.title || 'Akristal agent',
        avatarUrl: r.avatar_url,
        bio: r.bio,
        areas: r.areas_served ?? [],
        specialties: r.specialties ?? [],
        languages: r.languages ?? [],
        phone: r.phone,
        whatsapp: r.whatsapp,
        email: r.email,
        socials: (r.socials as Record<string, string> | null) ?? {},
        yearsExperience: r.years_experience,
        isVerified: !!r.is_verified,
        isFeatured: !!r.is_featured,
        rating:
          stat && stat.review_count
            ? { average: Number(stat.average_rating), count: Number(stat.review_count) }
            : null,
      }
    })
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
})

export type TeamMember = { id: string; name: string; credentials: string | null; role: string; imageUrl: string | null; details: string }

/** "Dr. Jane Doe (PhD, FCA)" or "Jane Doe |(B-Tech) Surveyor" → name + credentials. */
function splitName(raw: string) {
  const clean = raw.replace(/\s+/g, ' ').trim()
  const m = clean.match(/^([^|(]+?)\s*[|(]\s*(.+?)\)?\s*$/)
  if (!m) return { name: clean, credentials: null }
  return { name: m[1].trim().replace(/[,.]$/, ''), credentials: m[2].replace(/^\(|\)$/g, '').trim() || null }
}

export const getTeam = cache(async (): Promise<TeamMember[]> => {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('members')
    .select('id, name, role, image_url, details, display_order')
    .eq('is_active', true)
    .order('display_order')
  return (data ?? []).map((m) => {
    const { name, credentials } = splitName(m.name)
    return {
      id: m.id,
      name,
      credentials,
      role: m.role.replace(/\s*\|\s*/g, ', ').replace(/\s+/g, ' ').trim(),
      imageUrl: m.image_url,
      details: m.details,
    }
  })
})
