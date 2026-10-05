import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Agents and Brokers each have their own page; this switch moves between them. */
export function DirectorySwitch({ current }: { current: 'agents' | 'brokers' }) {
  const tab = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-10 items-center rounded-sm px-4 text-[0.9375rem] font-medium transition-colors',
        active ? 'bg-primary text-on-primary' : 'text-muted hover:bg-page-alt hover:text-ink'
      )}
    >
      {label}
    </Link>
  )
  return (
    <nav aria-label="Brokers and Agents" className="inline-flex gap-1 rounded-md border border-line p-1">
      {tab('/agents', 'Agents', current === 'agents')}
      {tab('/brokers', 'Brokers', current === 'brokers')}
    </nav>
  )
}
