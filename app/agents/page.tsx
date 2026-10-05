import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, UsersRound } from 'lucide-react'
import { site } from '@/config/site'
import { getAllListings } from '@/lib/data/listings'
import { getAgents } from '@/lib/data/people'
import { pageMetadata } from '@/lib/seo'
import { getCopy } from '@/lib/data/copy'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { buttonClasses } from '@/components/ui/button'
import { fieldClasses } from '@/components/ui/input'
import { AgentTile } from '@/components/agents/agent-tile'
import { DirectorySwitch } from '@/components/agents/directory-switch'

export const metadata: Metadata = pageMetadata({
  title: 'Find an agent',
  description: 'Akristal Brokers & Agents for buying, selling and renting homes in Kigali, Abuja, Lagos, Dubai and beyond. See their homes, reviews and contact them directly.',
  path: '/agents',
})

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? ''

export default async function AgentsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const q = one(sp.q).toLowerCase()
  const area = one(sp.area)
  const specialty = one(sp.specialty)
  const language = one(sp.language)

  const [agents, listings, copy] = await Promise.all([getAgents(), getAllListings(), getCopy('directories')])
  const live = (id: string) => listings.filter((l) => (l.agentId === id || (!l.agentId && l.sellerId === id)) && l.status === 'available').length

  const allAreas = [...new Set(agents.flatMap((a) => a.areas))].sort()
  const allSpecialties = [...new Set(agents.flatMap((a) => a.specialties))].sort()
  const allLanguages = [...new Set(agents.flatMap((a) => a.languages))].sort()

  const shown = agents.filter(
    (a) =>
      (!q || a.name.toLowerCase().includes(q)) &&
      (!area || a.areas.includes(area)) &&
      (!specialty || a.specialties.includes(specialty)) &&
      (!language || a.languages.includes(language))
  )
  const filtered = !!(q || area || specialty || language)

  const select = (name: string, label: string, value: string, options: string[]) =>
    options.length > 0 && (
      <label className="grid gap-1.5 text-xs text-muted">
        {label}
        <select name={name} defaultValue={value} className={cn(fieldClasses, 'h-10 text-sm text-ink')}>
          <option value="">Any</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
    )

  return (
    <>
      <header className="page-x-wide pb-10 pt-10 sm:pt-14">
        <DirectorySwitch current="agents" />
        <h1 className="mt-8 font-display text-display-l font-medium">{copy.t('agents.title')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          {copy.t('agents.intro')} Looking for a company?{' '}
          <Link href="/brokers" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            See Akristal Brokers
          </Link>
          .
        </p>
      </header>

      <div className="border-y border-line bg-page-alt">
        <form method="get" role="search" className="page-x-wide grid gap-3 py-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
          <label className="grid gap-1.5 text-xs text-muted">
            Name
            <span className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <input name="q" defaultValue={one(sp.q)} placeholder="Search by name" className={cn(fieldClasses, 'h-10 pl-9 text-sm text-ink')} />
            </span>
          </label>
          {select('area', 'Area', area, allAreas)}
          {select('specialty', 'Speciality', specialty, allSpecialties)}
          {select('language', 'Language', language, allLanguages)}
          <div className="flex gap-2">
            <button type="submit" className={buttonClasses({ className: 'h-10' })}>
              Search
            </button>
            {filtered && (
              <Link href="/agents" className={buttonClasses({ variant: 'ghost', className: 'h-10' })}>
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      <section aria-label="Agents" className="page-x-wide py-12">
        {shown.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((a) => (
              <li key={a.id}>
                <AgentTile agent={a} listingCount={live(a.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center">
            <UsersRound aria-hidden className="mx-auto size-10 text-muted" />
            <h2 className="mt-4 text-lg font-semibold">No agents match that search</h2>
            <p className="mt-2 text-[0.9375rem] text-muted">Clear the filters, or message the Akristal sales desk and we will match you with an agent.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/agents" className={buttonClasses({ variant: 'outline' })}>
                Clear filters
              </Link>
              <a href={whatsappLink('Hello Akristal, please match me with an agent.')} className={buttonClasses()}>
                WhatsApp the sales desk
              </a>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="join-title" className="bg-brand text-white">
        <div className="page-x-wide flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="join-title" className="font-display text-display-s font-medium">
              Selling homes is your work?
            </h2>
            <p className="mt-2 text-white/75">Join Akristal Brokers &amp; Agents and sell Akristal Developments alongside your clients&apos; homes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/join" className={buttonClasses({ variant: 'inverse' })}>
              Become an Akristal agent
            </Link>
            <Link href="/join/broker" className={buttonClasses({ variant: 'inverse' })}>
              Register a broker company
            </Link>
            <a href={site.phone.href} className="inline-flex h-11 items-center px-2 text-[0.9375rem] text-white/85 underline underline-offset-4 hover:text-white">
              {site.phone.label}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
