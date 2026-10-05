import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Endless horizontal loop. The content renders twice and the track slides by half its
 * width (animate-marquee in globals.css), so there is no seam. Pauses on hover and keyboard
 * focus; with reduced motion it stands still and the row scrolls by hand instead.
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
    <div
      role={label ? 'region' : undefined}
      aria-label={label}
      className={cn(
        'group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]',
        'motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]',
        className
      )}
    >
      <div
        className={cn(
          'flex w-max animate-marquee group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none',
          reverse && '[animation-direction:reverse]'
        )}
        style={{ '--marquee-duration': `${seconds}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  )
}
