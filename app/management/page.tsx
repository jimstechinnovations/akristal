import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { UsersRound } from 'lucide-react'
import { getTeam } from '@/lib/data/people'
import { pageMetadata } from '@/lib/seo'
import { getCopy } from '@/lib/data/copy'
import { ShowMore } from '@/components/ui/show-more'
import { buttonClasses } from '@/components/ui/button'

export const revalidate = 600

export const metadata: Metadata = pageMetadata({
  title: 'Management team',
  description: 'The engineers, surveyors, lawyers and managers who lead The Akristal Group Limited.',
  path: '/management',
})

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export default async function ManagementPage() {
  const [team, copy] = await Promise.all([getTeam(), getCopy('directories')])
  return (
    <>
      <header className="page-x-wide pb-10 pt-10 sm:pt-14">
        <h1 className="font-display text-display-l font-medium">{copy.t('management.title')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          {copy.t('management.intro')}
        </p>
      </header>

      <section aria-label="Management team" className="page-x-wide pb-20">
        {team.length ? (
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {team.map((m) => (
              <li key={m.id} className="flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-page-alt">
                  {m.imageUrl ? (
                    <Image src={m.imageUrl} alt={`Portrait of ${m.name}`} fill sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" className="object-cover object-top" />
                  ) : (
                    <span aria-hidden className="flex size-full items-center justify-center bg-brand font-display text-6xl text-white">
                      {initials(m.name)}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-lg font-semibold leading-snug">{m.name}</h2>
                {m.credentials && <p className="text-sm text-muted">{m.credentials}</p>}
                <p className="mt-1 text-[0.9375rem] text-ink/85">{m.role}</p>
                {m.details?.trim() && (
                  <ShowMore
                    text={m.details.trim()}
                    lines={4}
                    threshold={180}
                    moreLabel={`Read more about ${m.name.split(' ')[0]}`}
                    lessLabel="Read less"
                    className="mt-3 border-t border-line pt-3"
                    textClassName="text-sm text-muted"
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center">
            <UsersRound aria-hidden className="mx-auto size-10 text-muted" />
            <h2 className="mt-4 text-lg font-semibold">Team profiles are being updated</h2>
          </div>
        )}
      </section>

      <section className="border-t border-line bg-page-alt">
        <div className="page-x-wide flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-lg">Looking for someone to help you buy, sell or rent? Talk to Akristal Brokers &amp; Agents.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/agents" className={buttonClasses()}>
              Find an agent
            </Link>
            <Link href="/brokers" className={buttonClasses({ variant: 'outline' })}>
              Find a broker
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
