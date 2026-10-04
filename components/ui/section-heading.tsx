import Link from 'next/link'
import { cn } from '@/lib/utils'

export function SectionHeading({
  id,
  title,
  intro,
  action,
  as: Tag = 'h2',
  tone = 'default',
  className,
}: {
  id?: string
  title: string
  intro?: React.ReactNode
  action?: { href: string; label: string }
  as?: 'h1' | 'h2'
  tone?: 'default' | 'light'
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10', className)}>
      <div className="max-w-2xl">
        <Tag id={id} className={cn('font-display text-display-m font-medium', tone === 'light' ? 'text-white' : 'text-ink')}>
          {title}
        </Tag>
        {intro && (
          <p className={cn('mt-3 text-base leading-relaxed', tone === 'light' ? 'text-white/75' : 'text-muted')}>{intro}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            'inline-flex shrink-0 items-center self-start border-b pb-0.5 text-[0.9375rem] font-medium transition-colors md:self-auto',
            tone === 'light' ? 'border-white/50 text-white hover:border-white' : 'border-line-strong text-ink hover:border-ink'
          )}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
