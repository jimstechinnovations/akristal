import Link from 'next/link'
import { Quote } from 'lucide-react'
import type { Testimonial } from '@/lib/data/settings'
import { cn } from '@/lib/utils'
import { Stars } from '@/components/agents/stars'
import { buttonClasses } from '@/components/ui/button'
import { ShowMore } from '@/components/ui/show-more'
import type { Copy } from '@/lib/data/copy'

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export type ReviewSummary = { rating: number | null; count: number | null; url: string }

function ReviewCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-md border border-line bg-surface p-6">
      <Quote aria-hidden className="size-6 fill-accent text-accent" strokeWidth={0} />
      <blockquote className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink">
        <ShowMore text={t.quote} lines={6} threshold={260} moreLabel="Read more" lessLabel="Read less" />
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
          {initials(t.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{t.name}</span>
          <span className="block truncate text-xs text-muted">{t.source === 'google' ? 'Posted on Google' : t.context}</span>
        </span>
        {t.rating ? <Stars value={t.rating} size={13} /> : null}
      </figcaption>
    </figure>
  )
}

/** "Loved by Akristal clients": published reviews with a rating summary, and a way to add one. */
export function Testimonials({ items, summary, copy }: { items: Testimonial[]; summary: ReviewSummary; copy: Copy }) {
  const rated = items.filter((t) => t.rating)
  // A Google rating entered in the admin wins; otherwise the average of the published reviews.
  const rating = summary.rating ?? (rated.length ? rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length : null)
  const count = summary.count ?? (rated.length || null)

  return (
    <section aria-labelledby="testimonials-title" className="bg-page-alt section-y">
      <div className="page-x-wide grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14">
        <div>
          <h2 id="testimonials-title" className="font-display text-display-m font-medium">
            {copy.t('reviews.title')}
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
            {copy.t('reviews.intro')}
          </p>
          {rating != null && (
            <div className="mt-8 flex items-end gap-4">
              <span className="tabular font-display text-[3.5rem] font-medium leading-none">{rating.toFixed(1)}</span>
              <span className="pb-1.5">
                <Stars value={rating} size={18} />
                {count != null && <span className="mt-1 block text-sm text-muted">{count} {count === 1 ? 'review' : 'reviews'}</span>}
              </span>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/reviews#write" className={buttonClasses()}>
              Write a review
            </Link>
            {summary.url ? (
              <a href={summary.url} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'outline' })}>
                Read reviews on Google
              </a>
            ) : (
              items.length > 2 && (
                <Link href="/reviews" className={buttonClasses({ variant: 'outline' })}>
                  Read all reviews
                </Link>
              )
            )}
          </div>
        </div>

        {items.length > 0 ? (
          <ul className={cn('grid gap-5', items.length > 1 && 'sm:grid-cols-2')}>
            {items.slice(0, 4).map((t) => (
              <li key={t.id}>
                <ReviewCard t={t} />
              </li>
            ))}
          </ul>
        ) : (
          // Nothing published yet: invite the first review rather than show an empty space.
          <div className="flex flex-col justify-center rounded-md border border-dashed border-line-strong p-8 sm:p-10">
            <Quote aria-hidden className="size-8 fill-accent text-accent" strokeWidth={0} />
            <p className="mt-4 font-display text-2xl font-medium">{copy.t('reviews.emptyTitle')}</p>
            <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-muted">
              {copy.t('reviews.emptyText')}
            </p>
            <Link href="/reviews#write" className="mt-6 self-start text-[0.9375rem] font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              Share your experience
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export { ReviewCard }
