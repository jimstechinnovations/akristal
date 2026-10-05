import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, Building2, MapPin } from 'lucide-react'
import { getBrokers } from '@/lib/data/brokers'
import { pageMetadata } from '@/lib/seo'
import { getCopy } from '@/lib/data/copy'
import { buttonClasses } from '@/components/ui/button'
import { DirectorySwitch } from '@/components/agents/directory-switch'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Find a broker',
  description: 'Broker companies registered with The Akristal Group to sell and let homes across Africa and beyond. See where they work and contact them directly.',
  path: '/brokers',
})

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export default async function BrokersPage() {
  const [brokers, copy] = await Promise.all([getBrokers(), getCopy('directories')])
  return (
    <>
      <header className="page-x-wide pb-10 pt-10 sm:pt-14">
        <DirectorySwitch current="brokers" />
        <h1 className="mt-8 font-display text-display-l font-medium">{copy.t('brokers.title')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          {copy.t('brokers.intro')}
        </p>
      </header>

      <section aria-label="Brokers" className="page-x-wide pb-16">
        {brokers.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brokers.map((b) => (
              <li key={b.id}>
                <article className="group relative flex h-full flex-col rounded-md border border-line p-5 transition-colors hover:border-line-strong">
                  <div className="flex items-start gap-4">
                    <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                      {b.logoUrl ? (
                        <Image src={b.logoUrl} alt="" fill sizes="80px" className="object-contain p-2" />
                      ) : (
                        <span aria-hidden className="flex size-full items-center justify-center bg-brand font-display text-3xl text-white">
                          {initials(b.name)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold leading-snug">
                        <Link href={`/brokers/${b.slug}`} className="after:absolute after:inset-0 group-hover:underline">
                          {b.name}
                        </Link>
                      </h2>
                      {b.isVerified && (
                        <p className="mt-1 inline-flex items-center gap-1 text-sm text-success">
                          <BadgeCheck aria-hidden className="size-4" /> Verified by Akristal
                        </p>
                      )}
                      {(b.city || b.country) && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                          <MapPin aria-hidden className="size-3.5" />
                          {[b.city, b.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  {b.about && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">{b.about}</p>}
                  {b.areas.length > 0 && (
                    <p className="mt-auto pt-4 text-sm">
                      <span className="text-muted">Covers </span>
                      {b.areas.join(', ')}
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center">
            <Building2 aria-hidden className="mx-auto size-10 text-muted" />
            <h2 className="mt-4 text-lg font-semibold">Broker companies are joining now</h2>
            <p className="mt-2 text-[0.9375rem] text-muted">Registered brokers will be listed here. In the meantime, an Akristal agent can help you.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/agents" className={buttonClasses({ variant: 'outline' })}>
                Find an agent
              </Link>
              <Link href="/join/broker" className={buttonClasses()}>
                Register a broker company
              </Link>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="register-title" className="bg-brand text-white">
        <div className="page-x-wide flex flex-col gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 id="register-title" className="font-display text-display-s font-medium">
              {copy.t('brokers.cta')}
            </h2>
            <p className="mt-2 text-white/80">{copy.t('brokers.ctaText')}</p>
          </div>
          <Link href="/join/broker" className={buttonClasses({ className: 'bg-white text-[#1f1b19] hover:bg-[#edefec]' })}>
            Register a broker company
          </Link>
        </div>
      </section>
    </>
  )
}
