import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Read-only star display with an accessible text equivalent. */
export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)))
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star aria-hidden className="absolute inset-0 text-line-strong" style={{ width: size, height: size }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star aria-hidden className="fill-accent text-accent" style={{ width: size, height: size }} />
            </span>
          </span>
        )
      })}
    </span>
  )
}
