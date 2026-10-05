import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Interim raster export of the badge (the original is a 5 MB traced SVG).
// Replace /public/brand/* with exports from the client's vector logo when supplied.
export function Logo({
  tone = 'default',
  className,
  priority,
  full,
}: {
  /** `light` = white wordmark for use over photography or the Oxblood band */
  tone?: 'default' | 'light'
  className?: string
  priority?: boolean
  /** Header: badge and "TAG" only. Footer and other roomy places: "Akristal" with this full legal name under it. */
  full?: string
}) {
  return (
    <Link href="/" aria-label="The Akristal Group, home" className={cn('group inline-flex items-center gap-2.5', className)}>
      <Image
        src="/brand/akristal-badge-160.webp"
        alt=""
        width={48}
        height={48}
        priority={priority}
        className={cn('shrink-0 object-contain', full ? 'size-10 sm:size-11' : 'size-11 sm:size-12')}
      />
      {full ? (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display text-[1.65rem] font-semibold tracking-[0.01em]', tone === 'light' ? 'text-white' : 'text-ink')}>Akristal</span>
          <span className={cn('mt-0.5 text-[0.6875rem] tracking-[0.04em]', tone === 'light' ? 'text-white/80' : 'text-muted')}>{full}</span>
        </span>
      ) : (
        <span aria-hidden title="The Akristal Group" className={cn('font-display text-[1.65rem] font-semibold tracking-[0.12em]', tone === 'light' ? 'text-white' : 'text-ink')}>
          TAG
        </span>
      )}
    </Link>
  )
}
