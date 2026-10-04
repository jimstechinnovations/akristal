import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Option, Resource } from './resources'

type Db = { from: (table: string) => any } // eslint-disable-line @typescript-eslint/no-explicit-any -- table names come from the resource config

async function db() {
  return (await createClient()) as unknown as Db
}

export async function agentOptions(): Promise<Option[]> {
  const { data } = await (await db()).from('profiles').select('id, full_name, email').eq('role', 'agent').order('full_name')
  return ((data ?? []) as { id: string; full_name: string | null; email: string }[]).map((a) => ({ value: a.id, label: a.full_name || a.email }))
}

export async function listRecords(resource: Resource, opts: { q?: string; status?: string; page?: number }) {
  const pageSize = 50
  const page = Math.max(1, opts.page ?? 1)
  let query = (await db())
    .from(resource.table)
    .select('*', { count: 'exact' })
    .order(resource.orderBy.column, { ascending: resource.orderBy.ascending })
    .range((page - 1) * pageSize, page * pageSize - 1)
  for (const [k, v] of Object.entries(resource.filter ?? {})) query = query.eq(k, v)
  if (opts.status) query = query.eq('status', opts.status)
  const q = opts.q?.trim().replace(/[%,()]/g, ' ')
  if (q && resource.searchColumns.length) query = query.or(resource.searchColumns.map((c) => `${c}.ilike.%${q}%`).join(','))
  const { data, count, error } = await query
  return { rows: (data ?? []) as Record<string, unknown>[], count: count ?? 0, page, pageSize, error: error?.message as string | undefined }
}

export async function getRecord(resource: Resource, id: string) {
  if (resource.settingKey) {
    const { data } = await (await db()).from('site_settings').select('value').eq('key', resource.settingKey).maybeSingle()
    return ((data?.value as Record<string, unknown>) ?? {}) as Record<string, unknown>
  }
  let query = (await db()).from(resource.table).select('*').eq(resource.idColumn ?? 'id', id)
  for (const [k, v] of Object.entries(resource.filter ?? {})) query = query.eq(k, v)
  const { data } = await query.maybeSingle()
  return (data as Record<string, unknown> | null) ?? null
}

/** Counts that drive the inbox badges and the setup checklist. */
export async function adminCounts() {
  const d = await db()
  const count = async (table: string, apply: (q: any) => any = (q) => q) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { count } = await apply(d.from(table).select('*', { count: 'exact', head: true }))
    return (count as number | null) ?? 0
  }
  const [newLeads, pendingReviews, newApplications, pendingListings, agentsNoPhoto, listingsNoAgent, devsNoPrice, lenders, testimonials, liveListings] = await Promise.all([
    count('leads', (q) => q.eq('status', 'new')),
    count('agent_reviews', (q) => q.eq('status', 'pending')),
    count('agent_applications', (q) => q.eq('status', 'new')),
    count('properties', (q) => q.eq('listing_status', 'pending_approval')),
    count('profiles', (q) => q.eq('role', 'agent').is('avatar_url', null)),
    count('properties', (q) => q.eq('listing_status', 'approved').is('agent_id', null)),
    count('projects', (q) => q.neq('status', 'sold_out').neq('status', 'draft').or('main_price.is.null,main_price.eq.0').or('pre_selling_price.is.null,pre_selling_price.eq.0')),
    count('lenders', (q) => q.eq('is_published', true)),
    count('testimonials', (q) => q.eq('is_published', true)),
    count('properties', (q) => q.eq('listing_status', 'approved')),
  ])
  return { newLeads, pendingReviews, newApplications, pendingListings, agentsNoPhoto, listingsNoAgent, devsNoPrice, lenders, testimonials, liveListings }
}
