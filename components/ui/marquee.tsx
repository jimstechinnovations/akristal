import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Endless horizontal loop. The content renders twice and the track slides by half its
 * width, so there is no seam. Pauses on hover and keyboard focus; still for reduced motion.
 * The second copy is inert, so links are read and tabbed to only once.
 */
export function Marquee({
  children,
  seconds = 40,
  reverse = false,
  className,
  label,
}: {
  children: ReactNode
  seconds?: number
  reverse?: boolean
  className?: string
  /** Accessible name for the row */
  label?: string
}) {
  return (
    <div role={label ? 'region' : undefined} aria-label={label} className={cn('ak-marquee ak-marquee-mask relative overflow-hidden', className)}>
      <div className="ak-marquee-track flex w-max" data-reverse={reverse || undefined} style={{ '--marquee-duration': `${seconds}s` } as CSSProperties}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  )
}
