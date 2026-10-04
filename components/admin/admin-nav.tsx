'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export type NavSection = { title: string; items: { href: string; label: string; badge?: number }[] }

export function AdminNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname() ?? ''
  const active = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/'))
  return (
    <nav aria-label="Admin" className="text-sm">
      {/* Phones: one scrollable row. */}
      <ul className="scrollbar-hide -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:hidden">
        {sections.flatMap((s) => s.items).map((i) => (
          <li key={i.href} className="shrink-0">
            <Link href={i.href} aria-current={active(i.href) ? 'page' : undefined} className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-line px-3 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-on-primary">
              {i.label}
              {!!i.badge && <span className="tabular rounded-full bg-error px-1.5 text-[11px] text-white">{i.badge}</span>}
            </Link>
          </li>
        ))}
      </ul>
      {/* Desktop: grouped sidebar. */}
      <div className="hidden gap-6 lg:grid">
        {sections.map((s) => (
          <div key={s.title}>
            <p className="px-3 text-xs text-muted">{s.title}</p>
            <ul className="mt-1.5 grid gap-0.5">
              {s.items.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={active(i.href) ? 'page' : undefined}
                    className={cn('flex items-center justify-between rounded-sm px-3 py-2 hover:bg-page-alt', active(i.href) && 'bg-page-alt font-medium')}
                  >
                    {i.label}
                    {!!i.badge && <span className="tabular rounded-full bg-error px-1.5 text-[11px] text-white">{i.badge}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
