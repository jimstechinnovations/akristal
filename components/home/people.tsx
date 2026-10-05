import Image from 'next/image'
import Link from 'next/link'
import type { Agent } from '@/lib/data/people'
import type { Broker } from '@/lib/data/brokers'
import type { Copy } from '@/lib/data/copy'
import { SectionHeading } from '@/components/ui/section-heading'

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

const chip = 'inline-flex h-12 items-center gap-3 rounded-sm border border-line pl-1.5 pr-4 text-[0.9375rem] transition-colors hover:border-ink'

/** Akristal Brokers & Agents: people and broker companies visitors can contact directly. */
export function People({ agents, brokers, copy }: { agents: Agent[]; brokers: Broker[]; copy: Copy }) {
  if (!agents.length && !brokers.length) return null
  return (
    <section aria-labelledby="people-title" className="section-y">
      <div className="page-x-wide">
        <SectionHeading
          id="people-title"
          title={copy.t('people.title')}
          intro={copy.t('people.intro')}
          action={{ href: '/join', label: copy.t('people.action') }}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {agents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Agents</h3>
              <ul className="mt-4 flex flex-wrap gap-3">
                {agents.slice(0, 8).map((a) => (
                  <li key={a.id}>
                    <Link href={`/agents/${a.slug}`} className={chip}>
                      {a.avatarUrl ? (
                        <Image src={a.avatarUrl} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
                      ) : (
                        <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                          {initials(a.name)}
                        </span>
                      )}
                      {a.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/agents" className="inline-flex h-12 items-center px-2 text-[0.9375rem] font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                    All agents
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">Brokers</h3>
            {brokers.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-3">
                {brokers.slice(0, 8).map((b) => (
                  <li key={b.id}>
                    <Link href={`/brokers/${b.slug}`} className={chip}>
                      {b.logoUrl ? (
                        <Image src={b.logoUrl} alt="" width={36} height={36} className="size-9 rounded-sm bg-white object-contain" />
                      ) : (
                        <span aria-hidden className="flex size-9 items-center justify-center rounded-sm bg-brand text-xs font-semibold text-white">
                          {initials(b.name)}
                        </span>
                      )}
                      {b.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/brokers" className="inline-flex h-12 items-center px-2 text-[0.9375rem] font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                    All brokers
                  </Link>
                </li>
              </ul>
            ) : (
              <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted">
                {copy.t('people.noBrokers')}{' '}
                <Link href="/join/broker" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  Register a broker company
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
