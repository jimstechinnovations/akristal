import Image from 'next/image'
import Link from 'next/link'
import type { Partner } from '@/lib/data/settings'
import { cn } from '@/lib/utils'
import type { Copy } from '@/lib/data/copy'
import { SectionHeading } from '@/components/ui/section-heading'
import { Marquee } from '@/components/ui/marquee'

function PartnerTile({ partner }: { partner: Partner }) {
  const inner = partner.logoUrl ? (
    <Image src={partner.logoUrl} alt={partner.name} width={180} height={72} className="max-h-14 w-auto object-contain" />
  ) : (
    // No logo uploaded yet: the name, set like a wordmark.
    <span className="text-center font-display text-xl font-semibold leading-tight text-ink">{partner.name}</span>
  )
  const tile = 'mx-2.5 flex h-24 w-52 shrink-0 items-center justify-center rounded-md border border-line bg-surface px-6 transition-colors'
  return partner.websiteUrl ? (
    <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" title={partner.name} className={cn(tile, 'hover:border-line-strong')}>
      {inner}
    </a>
  ) : (
    <div title={partner.name} className={tile}>
      {inner}
    </div>
  )
}

/** "Trusted by leading brands and partners". Logos scroll once there are enough to fill a row. */
export function Partners({ partners, copy }: { partners: Partner[]; copy: Copy }) {
  if (!partners.length) return null
  const moving = partners.length >= 5
  return (
    <section aria-labelledby="partners-title" className="section-y">
      <div className="page-x-wide">
        <SectionHeading
          id="partners-title"
          title={copy.t('partners.title')}
          intro={copy.t('partners.intro')}
        />
      </div>
      {moving ? (
        <Marquee seconds={partners.length * 5} className="mt-10" label="Partners">
          {partners.map((p) => (
            <PartnerTile key={p.id} partner={p} />
          ))}
        </Marquee>
      ) : (
        <ul className="page-x-wide mt-10 flex flex-wrap gap-y-5 [&>li>*]:ml-0 [&>li>*]:mr-5">
          {partners.map((p) => (
            <li key={p.id}>
              <PartnerTile partner={p} />
            </li>
          ))}
        </ul>
      )}
      <p className="page-x-wide mt-8 text-[0.9375rem] text-muted">
        {copy.t('partners.cta')}{' '}
        <Link href="/contact?topic=partnership" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          {copy.t('partners.ctaLink')}
        </Link>
      </p>
    </section>
  )
}
