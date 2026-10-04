import Image from 'next/image'
import Link from 'next/link'
import type { Agent, TeamMember } from '@/lib/data/people'
import { SectionHeading } from '@/components/ui/section-heading'

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function People({ team, agents }: { team: TeamMember[]; agents: Agent[] }) {
  const shown = team.filter((m) => m.imageUrl).slice(0, 8)
  if (!shown.length && !agents.length) return null
  return (
    <section aria-labelledby="people-title" className="section-y">
      <div className="page-x-wide">
        <SectionHeading
          id="people-title"
          title="The people behind Akristal"
          intro="Engineers, surveyors, lawyers and agents who plan, build and sell every Akristal home."
          action={{ href: '/about#team', label: 'Meet the team' }}
        />

        {shown.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {shown.map((m) => (
              <li key={m.id}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-page-alt">
                  <Image src={m.imageUrl!} alt={`Portrait of ${m.name}`} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw" className="object-cover object-top" />
                </div>
                <p className="mt-3 text-[0.9375rem] font-medium leading-snug">{m.name}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">{m.role}</p>
              </li>
            ))}
          </ul>
        )}

        {agents.length > 0 && (
          <div className="mt-14 flex flex-col gap-5 border-t border-line pt-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Talk to an agent</h3>
              <p className="mt-1 text-sm text-muted">Message an agent directly, or call our office.</p>
            </div>
            <ul className="flex flex-wrap gap-3">
              {agents.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/agents/${a.slug}`}
                    className="inline-flex h-12 items-center gap-3 rounded-sm border border-line pl-1.5 pr-4 text-[0.9375rem] transition-colors hover:border-ink"
                  >
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
      </div>
    </section>
  )
}
