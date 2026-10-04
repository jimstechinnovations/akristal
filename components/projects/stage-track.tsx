import { STAGES, type ProjectStage } from '@/lib/data/projects'
import { cn } from '@/lib/utils'

/** Where a development is in its life: Off-plan → Under construction → Completed. */
export function StageTrack({
  stage,
  progressPct,
  tone = 'light',
  className,
}: {
  stage: ProjectStage
  progressPct: number | null
  tone?: 'light' | 'default'
  className?: string
}) {
  const current = STAGES.findIndex((s) => s.value === stage)
  const light = tone === 'light'
  return (
    <div className={className}>
      <ol className="grid grid-cols-3 gap-1.5" aria-label="Development stage">
        {STAGES.map((s, i) => (
          <li key={s.value} aria-current={i === current ? 'step' : undefined}>
            <span
              className={cn(
                'block h-[3px] rounded-full',
                i <= current ? (light ? 'bg-accent' : 'bg-primary') : light ? 'bg-white/20' : 'bg-line'
              )}
            />
            <span
              className={cn(
                'mt-2 block text-xs',
                i === current ? (light ? 'font-medium text-white' : 'font-medium text-ink') : light ? 'text-white/55' : 'text-muted'
              )}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ol>
      {progressPct != null && stage === 'under_construction' && (
        <p className={cn('mt-2 text-xs', light ? 'text-white/75' : 'text-muted')}>{progressPct}% built</p>
      )}
    </div>
  )
}
