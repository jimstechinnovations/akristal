import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { searchHref } from '@/lib/listing-search'
import { cn } from '@/lib/utils'

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, count: number): (number | '…')[] {
  const pages = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count))
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}

export function Pagination({ page, pageCount, raw }: { page: number; pageCount: number; raw: Record<string, string | undefined> }) {
  if (pageCount <= 1) return null
  const href = (p: number) => searchHref(raw, { page: p === 1 ? null : p })
  const linkClass = 'inline-flex h-10 min-w-10 items-center justify-center rounded-sm px-3 text-sm transition-colors'
  return (
    <nav aria-label="Pages" className="flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(linkClass, 'gap-1 hover:bg-page-alt')} rel="prev">
          <ChevronLeft aria-hidden className="size-4" /> Previous
        </Link>
      ) : (
        <span aria-disabled className={cn(linkClass, 'gap-1 text-muted opacity-50')}>
          <ChevronLeft aria-hidden className="size-4" /> Previous
        </span>
      )}
      <ol className="hidden items-center gap-1 sm:flex">
        {pageWindow(page, pageCount).map((p, i) =>
          p === '…' ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-current={p === page ? 'page' : undefined}
                className={cn(linkClass, p === page ? 'bg-primary text-on-primary' : 'hover:bg-page-alt')}
              >
                {p}
              </Link>
            </li>
          )
        )}
      </ol>
      <span className="px-2 text-sm text-muted sm:hidden">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={cn(linkClass, 'gap-1 hover:bg-page-alt')} rel="next">
          Next <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : (
        <span aria-disabled className={cn(linkClass, 'gap-1 text-muted opacity-50')}>
          Next <ChevronRight aria-hidden className="size-4" />
        </span>
      )}
    </nav>
  )
}
