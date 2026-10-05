import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { getArticle, getArticles, parseBody, readingMinutes } from '@/lib/data/articles'
import { formatDate } from '@/lib/format'
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { ArticleCard } from '@/components/insights/article-card'

export const revalidate = 600

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle((await params).slug)
  if (!article) return { title: 'Article not found', robots: { index: false } }
  const base = pageMetadata({ title: article.title, description: article.excerpt ?? article.title, path: `/insights/${article.slug}`, image: article.coverImageUrl ?? undefined })
  return {
    ...base,
    openGraph: { ...base.openGraph, type: 'article', publishedTime: article.publishedAt },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle((await params).slug)
  if (!article) notFound()
  const more = (await getArticles()).filter((a) => a.id !== article.id).slice(0, 3)
  const blocks = parseBody(article.body)

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt ?? undefined,
            image: article.coverImageUrl ? absoluteUrl(article.coverImageUrl) : undefined,
            datePublished: article.publishedAt,
            author: { '@type': 'Organization', name: article.authorName },
            publisher: { '@id': absoluteUrl('/#organization') },
            mainEntityOfPage: absoluteUrl(`/insights/${article.slug}`),
          },
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Insights', path: '/insights' },
            { name: article.title, path: `/insights/${article.slug}` },
          ]),
        ]}
      />
      <article>
        <header className="page-x pt-6">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href="/insights" className="hover:text-ink hover:underline">
              Insights
            </Link>
            <ChevronRight aria-hidden className="mx-1 inline size-3.5" />
            <span aria-current="page">{article.category ?? 'Article'}</span>
          </nav>
          <h1 className="mt-6 max-w-3xl font-display text-display-l font-medium">{article.title}</h1>
          {article.excerpt && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{article.excerpt}</p>}
          <p className="mt-5 text-sm text-muted">
            {article.authorName}, <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>, {readingMinutes(article.body)} min read
          </p>
        </header>
        {article.coverImageUrl && (
          <div className="page-x mt-10">
            <div className="relative aspect-[16/8] overflow-hidden rounded-md bg-page-alt">
              <Image src={article.coverImageUrl} alt="" fill priority sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
            </div>
          </div>
        )}
        <div className="page-x py-12">
          <div className="mx-auto max-w-[68ch] text-[1.0625rem] leading-[1.75] text-ink/90">
            {blocks.map((b, i) =>
              b.kind === 'h2' ? (
                <h2 key={i} className="mb-3 mt-10 font-display text-[1.75rem] font-medium leading-snug text-ink">
                  {b.text}
                </h2>
              ) : b.kind === 'ul' ? (
                <ul key={i} className="mb-5 grid list-disc gap-2 pl-5 marker:text-accent">
                  {b.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="mb-5">
                  {b.text}
                </p>
              )
            )}
          </div>
        </div>
      </article>
      {more.length > 0 && (
        <section aria-labelledby="more-title" className="border-t border-line bg-page-alt section-y">
          <div className="page-x-wide">
            <h2 id="more-title" className="font-display text-display-m font-medium">
              More insights
            </h2>
            <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((a) => (
                <li key={a.id}>
                  <ArticleCard article={a} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
