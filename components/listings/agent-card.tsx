import Image from 'next/image'
import Link from 'next/link'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { site } from '@/config/site'
import type { Agent } from '@/lib/data/people'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

/** Assigned agent when there is one; otherwise the Akristal sales desk, so every home has a person to call. */
export function AgentCard({ agent, enquiry, className }: { agent: Agent | null; enquiry: string; className?: string }) {
  const name = agent?.name ?? 'Akristal sales team'
  const role = agent ? agent.title : 'Kigali head office'
  const phoneHref = agent?.phone ? `tel:${agent.phone.replace(/[^\d+]/g, '')}` : site.phone.href
  const phoneLabel = agent?.phone ?? site.phone.label
  const wa = whatsappLink(enquiry, agent?.whatsapp ?? agent?.phone ?? site.whatsapp)
  const email = agent?.email ?? site.email
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const action = 'inline-flex h-11 items-center justify-center gap-2 rounded-sm text-sm font-medium transition-colors'

  return (
    <div className={cn('rounded-md border border-line p-5', className)}>
      <div className="flex items-center gap-4">
        {agent?.avatarUrl ? (
          <Image src={agent.avatarUrl} alt="" width={56} height={56} className="size-14 rounded-full object-cover" />
        ) : agent ? (
          <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {initials}
          </span>
        ) : (
          <Image src="/brand/akristal-badge-160.webp" alt="" width={56} height={56} className="size-14 object-contain" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {agent ? (
              <Link href={`/agents/${agent.slug}`} className="hover:underline">
                {name}
              </Link>
            ) : (
              name
            )}
          </p>
          <p className="text-sm text-muted">{role}</p>
          {agent?.rating && (
            <p className="tabular text-sm">
              ★ {agent.rating.average.toFixed(1)} <span className="text-muted">({agent.rating.count} reviews)</span>
            </p>
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <a href={wa} className={cn(action, 'bg-[#1f6f4a] text-white hover:bg-[#185c3d]')}>
          <MessageCircle aria-hidden className="size-4" /> WhatsApp
        </a>
        <a href={phoneHref} className={cn(action, 'border border-line-strong hover:border-ink')}>
          <Phone aria-hidden className="size-4" /> Call
        </a>
        <a href={`mailto:${email}?subject=${encodeURIComponent(enquiry.slice(0, 120))}`} className={cn(action, 'col-span-2 border border-line-strong hover:border-ink')}>
          <Mail aria-hidden className="size-4" /> {email}
        </a>
      </div>
      <p className="tabular mt-3 text-xs text-muted">{agent ? "Direct line" : "Office line"} {phoneLabel}</p>
    </div>
  )
}
