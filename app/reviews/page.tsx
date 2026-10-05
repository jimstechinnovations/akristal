import type { Metadata } from 'next'
import { getSettings, getTestimonials } from '@/lib/data/settings'
import { pageMetadata } from '@/lib/seo'
import { getCopy } from '@/lib/data/copy'
import { Stars } from '@/components/agents/stars'
import { ReviewForm } from '@/components/agents/review-form'
import { ReviewCard } from '@/components/home/testimonials'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Client reviews',
  description: 'What buyers, tenants and investors say about The Akristal Group, and how to share your own experience.',
  path: '/reviews',
})

export default async function ReviewsPage() {
  const [items, { home }, copy] = await Promise.all([getTestimonials(), getSettings(), getCopy('directories')])
  const rated = items.filter((t) => t.rating)
  const average = home.googleRating ?? (rated.length ? rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length : null)
  return (
    <>
      <header className="page-x-wide pb-10 pt-10 sm:pt-14">
        <h1 className="font-display text-display-l font-medium">{copy.t('reviews.title')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{copy.t('reviews.intro')}</p>
        {average != null && (
          <p className="mt-6 flex items-center gap-3">
            <span className="tabular font-display text-4xl font-medium">{average.toFixed(1)}</span>
            <Stars value={average} size={18} />
          </p>
        )}
      </header>
      {items.length > 0 && (
        <section aria-label="Reviews" className="page-x-wide pb-16">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <li key={t.id}>
                <ReviewCard t={t} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <section id="write" aria-labelledby="write-title" className="scroll-mt-24 border-t border-line bg-page-alt section-y">
        <div className="page-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="write-title" className="font-display text-display-m font-medium">
              {copy.t('reviews.formTitle')}
            </h2>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">
              {copy.t('reviews.formIntro')}
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
            <ReviewForm agentName="Akristal" />
          </div>
        </div>
      </section>
    </>
  )
}
