import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Phone } from 'lucide-react'
import type { Agent } from '@/lib/data/people'
import { whatsappLink } from '@/lib/whatsapp'
import { plural } from '@/lib/format'
import { Stars } from './stars'
import { TrackedLink } from './tracked-link'

export function AgentInitials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span aria-hidden className={`flex items-center justify-center bg-brand font-display font-medium text-white ${className ?? ''}`}>
      {initials}
    </span>
  )
}

export function AgentTile({ agent, listingCount }: { agent: Agent; listingCount: number }) {
  const phone = agent.phone?.replace(/[^\d+]/g, '')
  return (
    <article className="group relative flex h-full flex-col rounded-md border border-line p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-md">
          {agent.avatarUrl ? (
            <Image src={agent.avatarUrl} alt="" fill sizes="80px" className="object-cover object-top" />
          ) : (
            <AgentInitials name={agent.name} className="size-full text-3xl" />
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-snug">
            <Link href={`/agents/${agent.slug}`} className="after:absolute after:inset-0 group-hover:underline">
              {agent.name}
            </Link>
          </h2>
          <p className="text-sm text-muted">{agent.title}</p>
          {agent.rating ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm">
              <Stars value={agent.rating.average} size={14} />
              <span className="tabular">{agent.rating.average.toFixed(1)}</span>
              <span className="text-muted">({agent.rating.count})</span>
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-muted">No reviews yet</p>
          )}
        </div>
      </div>

      <dl className="mt-5 grid gap-1 text-sm">
        {agent.areas.length > 0 && (
          <div className="flex gap-2">
            <dt className="text-muted">Areas</dt>
            <dd className="line-clamp-1">{agent.areas.join(', ')}</dd>
          </div>
        )}
        {agent.languages.length > 0 && (
          <div className="flex gap-2">
            <dt className="text-muted">Speaks</dt>
            <dd>{agent.languages.join(', ')}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="text-muted">Listings</dt>
          <dd className="tabular">{listingCount ? plural(listingCount, 'home') : 'None live right now'}</dd>
        </div>
      </dl>

      <div className="relative z-10 mt-auto flex gap-2 pt-5">
        <TrackedLink
          channel="whatsapp"
          agentId={agent.id}
          href={whatsappLink(`Hello ${agent.name}, I found you on the Akristal website.`, agent.whatsapp ?? agent.phone ?? undefined)}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-sm bg-[#1f6f4a] text-sm font-medium text-white hover:bg-[#185c3d]"
        >
          <MessageCircle aria-hidden className="size-4" /> WhatsApp
        </TrackedLink>
        {phone && (
          <TrackedLink channel="call" agentId={agent.id} href={`tel:${phone}`} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-sm border border-line-strong text-sm font-medium hover:border-ink">
            <Phone aria-hidden className="size-4" /> Call
          </TrackedLink>
        )}
      </div>
    </article>
  )
}
