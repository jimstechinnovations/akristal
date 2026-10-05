import type { HomeStat } from '@/content/defaults'
import type { Listing } from '@/lib/data/listings'
import type { Project } from '@/lib/data/projects'

export type Stat = { value: number; label: string; suffix?: string }

/**
 * Home-page figures. Each one is counted from live data unless the admin typed a number
 * ("manual"). A figure that comes out as zero is hidden rather than shown as 0.
 */
export function computeStats(config: HomeStat[], projects: Project[], listings: Listing[]): Stat[] {
  const available = listings.filter((l) => l.status === 'available')
  const auto: Record<string, number> = {
    // Phases of one development (e.g. "Le Centurium City: commercial district") count once.
    developments: new Set(projects.map((p) => p.name.split(':')[0].trim())).size,
    sold:
      projects.filter((p) => p.soldOut).reduce((n, p) => n + (p.totalUnits ?? 0), 0) +
      listings.filter((l) => l.status === 'sold').length,
    available: available.length,
    countries: new Set([...available.map((l) => l.market?.country), ...projects.map((p) => p.country)].filter(Boolean)).size,
  }
  return config
    .filter((s) => s.label?.trim())
    .map((s) => {
      const typed = s.value != null && String(s.value) !== '' ? Number(s.value) : null
      const value = s.source === 'manual' || !s.source ? typed : typed ?? auto[s.source]
      return { label: s.label.trim(), value: value ?? 0, suffix: s.suffix?.trim() || undefined }
    })
    .filter((s) => s.value > 0)
}
