import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import type { Article } from '@/lib/data/articles'
import { formatDate } from '@/lib/format'

export function ArticleCard({ article, priority }: { article: Article; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-page-alt">
        {article.coverImageUrl && (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
          />
        )}
        {article.category && (
          <span className="absolute left-3 top-3 rounded-sm bg-[#1f1b19]/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">{article.category}</span>
        )}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-sm text-muted">
        <CalendarDays aria-hidden className="size-4" />
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </p>
      <h3 className="mt-1.5 font-display text-2xl font-medium leading-snug">
        <Link href={`/insights/${article.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
          {article.title}
        </Link>
      </h3>
      {article.excerpt && <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">{article.excerpt}</p>}
    </article>
  )
}
