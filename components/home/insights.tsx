import type { Article } from '@/lib/data/articles'
import type { Copy } from '@/lib/data/copy'
import { SectionHeading } from '@/components/ui/section-heading'
import { ArticleCard } from '@/components/insights/article-card'

export function Insights({ articles, copy }: { articles: Article[]; copy: Copy }) {
  if (!articles.length) return null
  return (
    <section aria-labelledby="insights-title" className="section-y">
      <div className="page-x-wide">
        <SectionHeading
          id="insights-title"
          title={copy.t('insights.title')}
          intro={copy.t('insights.intro')}
          action={{ href: '/insights', label: 'All insights' }}
        />
        <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((a) => (
            <li key={a.id}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
