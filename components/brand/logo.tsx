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
  /** Header: "TAG" with "The Akristal Group" under it. Footer and other roomy places: the full name with this line (e.g. the legal name) under it. */
  full?: string
}) {
  const strong = tone === 'light' ? 'text-white' : 'text-ink'
  const soft = tone === 'light' ? 'text-white/80' : 'text-muted'
  return (
    <Link href="/" aria-label="The Akristal Group (TAG), home" className={cn('group inline-flex items-center gap-2.5', className)}>
      <Image
        src="/brand/akristal-badge-160.webp"
        alt=""
        width={48}
        height={48}
        priority={priority}
        className="size-10 shrink-0 object-contain sm:size-11"
      />
      {full ? (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display text-[1.45rem] font-semibold', strong)}>The Akristal Group (TAG)</span>
          <span className={cn('mt-1 text-[0.6875rem] tracking-[0.04em]', soft)}>{full}</span>
        </span>
      ) : (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display text-[1.65rem] font-semibold tracking-[0.12em]', strong)}>TAG</span>
          <span className={cn('mt-0.5 text-[0.625rem] tracking-[0.06em]', soft)}>The Akristal Group</span>
        </span>
      )}
    </Link>
  )
}
