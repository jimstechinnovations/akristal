import Image from 'next/image'
import Link from 'next/link'
import type { MarketCount } from '@/lib/data/listings'
import { marketImage } from '@/lib/data/markets'
import { plural } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/ui/section-heading'

export function Markets({ markets }: { markets: MarketCount[] }) {
  const withImages = markets.filter((m) => marketImage(m.market))
  const others = markets.filter((m) => !marketImage(m.market))
  if (!withImages.length) return null
  // Kigali leads: it's home.
  const ordered = [...withImages].sort((a, b) => Number(b.market.slug === 'kigali') - Number(a.market.slug === 'kigali'))

  return (
    <section aria-labelledby="markets-title" className="bg-page-alt section-y">
      <div className="page-x-wide">
        <SectionHeading
          id="markets-title"
          title="Where we work"
          intro="Our head office is in Kigali. Our agents also list homes in Nigeria, the Gulf and across the region."
        />
        <ul className="mt-10 grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[260px] lg:grid-cols-4 lg:gap-4">
          {ordered.map(({ market, count }, i) => {
            const img = marketImage(market)!
            return (
              <li
                key={market.slug}
                className={cn(
                  'group relative overflow-hidden rounded-md',
                  i === 0 && 'col-span-2 row-span-2',
                  // Odd number of small tiles: the last one fills the gap.
                  i > 0 && i === ordered.length - 1 && (ordered.length - 1) % 2 === 1 && 'col-span-2'
                )}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes={i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
                  className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgb(20_12_10/0.75)] via-[rgb(20_12_10/0.1)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                  <h3 className={cn('font-display font-medium', i === 0 ? 'text-display-s lg:text-5xl' : 'text-2xl')}>
                    <Link href={`/properties?market=${market.slug}`} className="after:absolute after:inset-0">
                      {market.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    {market.country} · {plural(count, 'home')}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
        {others.length > 0 && (
          <p className="mt-6 text-[0.9375rem] text-muted">
            Also listing in{' '}
            {others.map(({ market, count }, i) => (
              <span key={market.slug}>
                {i > 0 && (i === others.length - 1 ? ' and ' : ', ')}
                <Link href={`/properties?market=${market.slug}`} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {market.name}
                </Link>{' '}
                ({count})
              </span>
            ))}
            .
          </p>
        )}
      </div>
    </section>
  )
}
