import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'
import { getArticles } from '@/lib/data/articles'
import { pageMetadata } from '@/lib/seo'
import { getCopy } from '@/lib/data/copy'
import { ArticleCard } from '@/components/insights/article-card'

export const revalidate = 600

export const metadata: Metadata = pageMetadata({
  title: 'Insights',
  description: 'Guides on buying off-plan, Pay Small Small, mortgages, viewings and furnishing a home in Africa, from The Akristal Group.',
  path: '/insights',
})

export default async function InsightsPage() {
  const [articles, copy] = await Promise.all([getArticles(), getCopy('directories')])
  return (
    <>
      <header className="page-x-wide pb-10 pt-10 sm:pt-14">
        <h1 className="font-display text-display-l font-medium">{copy.t('insights.title')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          {copy.t('insights.intro')}
        </p>
      </header>
      <section aria-label="Articles" className="page-x-wide pb-20">
        {articles.length ? (
          <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <li key={a.id}>
                <ArticleCard article={a} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center">
            <Newspaper aria-hidden className="mx-auto size-10 text-muted" />
            <h2 className="mt-4 text-lg font-semibold">New articles are on the way</h2>
            <p className="mt-2 text-[0.9375rem] text-muted">Check back soon for guides on buying and financing a home.</p>
          </div>
        )}
      </section>
    </>
  )
}
