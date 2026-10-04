import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Interim raster export of the badge (the original is a 5 MB traced SVG).
// Replace /public/brand/* with exports from the client's vector logo when supplied.
export function Logo({
  tone = 'default',
  className,
  priority,
}: {
  /** `light` = white wordmark for use over photography or the Oxblood band */
  tone?: 'default' | 'light'
  className?: string
  priority?: boolean
}) {
  return (
    <Link
      href="/"
      aria-label="The Akristal Group, home"
      className={cn('group inline-flex items-center gap-2.5', className)}
    >
      <Image
        src="/brand/akristal-badge-160.webp"
        alt=""
        width={44}
        height={44}
        priority={priority}
        className="size-10 shrink-0 object-contain sm:size-11"
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-[1.65rem] font-semibold tracking-[0.01em]',
            tone === 'light' ? 'text-white' : 'text-ink'
          )}
        >
          Akristal
        </span>
        <span className={cn('mt-0.5 text-[0.6875rem] tracking-[0.04em]', tone === 'light' ? 'text-white/80' : 'text-muted')}>
          The Akristal Group
        </span>
      </span>
    </Link>
  )
}
