import { STAGES, type ProjectStage } from '@/lib/data/projects'
import { cn } from '@/lib/utils'

export type SalesStatus = 'selling' | 'sold_out'

const SALES: { value: SalesStatus; label: string }[] = [
  { value: 'selling', label: 'Selling' },
  { value: 'sold_out', label: 'Sold out' },
]

/**
 * Two tracks side by side. Build: Off-plan → Under construction → Completed.
 * Sales: Selling or Sold out. Selling happens at any build stage, so it is its own track.
 */
export function StageTrack({
  stage,
  progressPct,
  soldOut = false,
  tone = 'light',
  className,
}: {
  stage: ProjectStage
  progressPct: number | null
  soldOut?: boolean
  tone?: 'light' | 'default'
  className?: string
}) {
  const current = STAGES.findIndex((s) => s.value === stage)
  const sales: SalesStatus = soldOut ? 'sold_out' : 'selling'
  const light = tone === 'light'
  const bar = (on: boolean) => cn('block h-[3px] rounded-full', on ? (light ? 'bg-accent' : 'bg-primary dark:bg-accent') : light ? 'bg-white/20' : 'bg-line')
  const label = (on: boolean) =>
    cn('mt-2 block text-xs leading-tight', on ? (light ? 'font-medium text-white' : 'font-medium text-ink') : light ? 'text-white/55' : 'text-muted')

  return (
    <div className={className}>
      <div className="grid grid-cols-[3fr_2fr] gap-3">
        <ol className="grid grid-cols-3 gap-1.5" aria-label="Build stage">
          {STAGES.map((s, i) => (
            <li key={s.value} aria-current={i === current ? 'step' : undefined}>
              <span className={bar(i <= current)} />
              <span className={label(i === current)}>{s.label}</span>
            </li>
          ))}
        </ol>
        <ol className={cn('grid grid-cols-2 gap-1.5 border-l pl-3', light ? 'border-white/20' : 'border-line')} aria-label="Sales">
          {SALES.map((s) => (
            <li key={s.value} aria-current={s.value === sales ? 'true' : undefined}>
              <span className={bar(s.value === sales)} />
              <span className={label(s.value === sales)}>{s.label}</span>
            </li>
          ))}
        </ol>
      </div>
      {progressPct != null && stage === 'under_construction' && (
        <p className={cn('mt-2 text-xs', light ? 'text-white/75' : 'text-muted')}>{progressPct}% built</p>
      )}
    </div>
  )
}
