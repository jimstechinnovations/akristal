import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import { placeholderPlan } from '@/content/placeholder-data'

export type InstallmentPlan = {
  id: string
  name: string
  description: string | null
  minDepositPct: number
  tenures: number[]
  premiumByTenure: Record<string, number>
  eligibility: string[]
  termsUrl: string | null
  /** True while terms come from the placeholder file, not the database */
  placeholder: boolean
}

/** Active Pay Small Small plans from the database, or the placeholder plan until the client publishes real terms. */
export const getInstallmentPlans = cache(async (): Promise<InstallmentPlan[]> => {
  const supabase = createPublicClient()
  const { data } = await supabase.from('installment_plans').select('*').eq('is_active', true).order('display_order')
  if (!data?.length) return [placeholderPlan]
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    minDepositPct: Number(p.min_deposit_pct),
    tenures: p.tenures_months,
    premiumByTenure: (p.premium_pct_by_tenure as Record<string, number> | null) ?? {},
    eligibility: p.eligibility ?? [],
    termsUrl: p.terms_url,
    placeholder: false,
  }))
})

export type Lender = { id: string; name: string; logoUrl: string | null; countries: string[]; rateFrom: number | null; maxTermYears: number | null; maxLtvPct: number | null; notes: string | null; websiteUrl: string | null }

/** Published partner lenders. Empty until Akristal confirms partnerships (no placeholder banks are invented). */
export const getLenders = cache(async (): Promise<Lender[]> => {
  const { data } = await createPublicClient().from('lenders').select('*').eq('is_published', true).order('display_order')
  return (data ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    logoUrl: l.logo_url,
    countries: l.countries ?? [],
    rateFrom: l.rate_from_pct != null ? Number(l.rate_from_pct) : null,
    maxTermYears: l.max_term_years,
    maxLtvPct: l.max_ltv_pct != null ? Number(l.max_ltv_pct) : null,
    notes: l.notes,
    websiteUrl: l.website_url,
  }))
})
