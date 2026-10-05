import Image from 'next/image'
import Link from 'next/link'
import type { Listing } from '@/lib/data/listings'
import type { Copy } from '@/lib/data/copy'
import { SectionHeading } from '@/components/ui/section-heading'
import { Marquee } from '@/components/ui/marquee'
import { Price } from '@/components/currency/price'
import { salesLabel } from '@/components/listings/listing-status'

const BUILD = { off_plan: 'Off-plan', under_construction: 'Under construction', completed: 'Completed' } as const

/** A slow-moving strip of every home on the market with a photo. Hidden until there are enough to loop. */
export function HomesMarquee({ listings, copy }: { listings: Listing[]; copy: Copy }) {
  const shown = listings.filter((l) => l.images[0]).slice(0, 14)
  if (shown.length < 5) return null
  return (
    <section aria-labelledby="market-now-title" className="section-y overflow-hidden">
      <div className="page-x-wide">
        <SectionHeading
          id="market-now-title"
          title={copy.t('marquee.title')}
          intro={copy.t('marquee.intro')}
          action={{ href: '/properties', label: copy.t('marquee.action') }}
        />
      </div>
      <Marquee seconds={shown.length * 6} className="mt-10" label="Homes on the market">
        {shown.map((l) => {
          const sales = salesLabel(l)
          return (
            <Link
              key={l.id}
              href={`/properties/${l.id}`}
              className="group relative mx-2.5 block h-[22rem] w-[17rem] shrink-0 overflow-hidden rounded-md bg-page-alt sm:h-[24rem] sm:w-[19rem]"
            >
              <Image src={l.images[0]} alt="" fill sizes="304px" className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
              <span className="absolute left-3 top-3 flex flex-wrap gap-1.5 text-xs font-medium">
                <span className="rounded-sm bg-white/95 px-2 py-1 text-[#1f1b19]">{l.listingType === 'rent' ? 'For rent' : 'For sale'}</span>
                {l.buildStage && <span className="rounded-sm bg-black/55 px-2 py-1 text-white backdrop-blur-sm">{BUILD[l.buildStage]}</span>}
                <span className="rounded-sm bg-black/55 px-2 py-1 text-white backdrop-blur-sm">{sales.label}</span>
              </span>
              <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                <Price amount={l.price} currency={l.currency} className="tabular block text-lg font-semibold" />
                <span className="mt-1 line-clamp-1 block text-[0.9375rem]">{l.title}</span>
                {l.area && <span className="mt-0.5 block text-sm text-white/75">{l.area}</span>}
              </span>
            </Link>
          )
        })}
      </Marquee>
    </section>
  )
}
