import 'server-only'
import { cache } from 'react'
import { CURRENCY_CODES } from '@/config/currencies'

export type Rates = { base: 'USD'; rates: Record<string, number>; updatedAt: string }

/**
 * Daily mid-market rates against the US dollar from open.er-api.com (free, no key),
 * cached for 12 hours. Returns null when the service is down: prices then show only
 * in the currency they were listed in, never with a stale or invented rate.
 */
export const getRates = cache(async (): Promise<Rates | null> => {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 43_200 } })
    if (!res.ok) return null
    const json = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string }
    if (json.result !== 'success' || !json.rates) return null
    const rates: Record<string, number> = {}
    for (const code of CURRENCY_CODES) if (json.rates[code] > 0) rates[code] = json.rates[code]
    return { base: 'USD', rates, updatedAt: json.time_last_update_utc ?? '' }
  } catch {
    return null
  }
})
