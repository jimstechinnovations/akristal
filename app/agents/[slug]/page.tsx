import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BadgeCheck, ChevronRight, Mail, MessageCircle, Phone } from 'lucide-react'
import { getAgentListings } from '@/lib/data/listings'
import { getAgentBySlug, getAgentReviews } from '@/lib/data/people'
import { formatDate } from '@/lib/format'
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { JsonLd } from '@/components/seo/json-ld'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'
import { AgentInitials } from '@/components/agents/agent-tile'
import { AgentListingTabs } from '@/components/agents/listing-tabs'
import { ReviewForm } from '@/components/agents/review-form'
import { Stars } from '@/components/agents/stars'
import { TrackedLink } from '@/components/agents/tracked-link'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const agent = await getAgentBySlug((await params).slug)
  if (!agent) return { title: 'Agent not found', robots: { index: false } }
  const description =
    agent.bio?.slice(0, 155) ??
    `${agent.name} is ${agent.title === 'Akristal agent' ? 'an Akristal agent' : `${agent.title} at Akristal`}. See their homes for sale and rent, reviews and contact details.`
  return {
    title: `${agent.name}, ${agent.title}`,
    description,
    alternates: { canonical: `/agents/${agent.slug}` },
    openGraph: { title: agent.name, description, url: `/agents/${agent.slug}`, images: agent.avatarUrl ? [agent.avatarUrl] : undefined },
  }
}

export default async function AgentPage({ params }: PageProps) {
  const agent = await getAgentBySlug((await params).slug)
  if (!agent) notFound()
  const [groups, reviews] = await Promise.all([getAgentListings(agent.id), getAgentReviews(agent.id)])
  const firstName = agent.name.split(' ')[0]
  const phone = agent.phone?.replace(/[^\d+]/g, '')
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }))

  const counts = [
    { label: 'For sale', value: groups.forSale.length },
    { label: 'For rent', value: groups.forRent.length },
    { label: 'Sold and let', value: groups.sold.length },
  ]

  const action = 'inline-flex h-11 items-center justify-center gap-2 rounded-sm px-5 text-sm font-medium transition-colors'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: agent.name,
    url: absoluteUrl(`/agents/${agent.slug}`),
    image: agent.avatarUrl ?? undefined,
    jobTitle: agent.title,
    telephone: phone ?? undefined,
    email: agent.email ?? undefined,
    areaServed: agent.areas.length ? agent.areas : undefined,
    knowsLanguage: agent.languages.length ? agent.languages : undefined,
    worksFor: { '@id': absoluteUrl('/#organization') },
    aggregateRating: reviews.length ? { '@type': 'AggregateRating', ratingValue: average.toFixed(1), reviewCount: reviews.length } : undefined,
  }

  return (
    <>
      <JsonLd data={[jsonLd, breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Brokers & Agents', path: '/agents' }, { name: agent.name, path: `/agents/${agent.slug}` }])]} />

      <div className="page-x-wide pt-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/agents" className="hover:text-ink hover:underline">
            Agents
          </Link>
          <ChevronRight aria-hidden className="mx-1 inline size-3.5" />
          <span aria-current="page">{agent.name}</span>
        </nav>
      </div>

      {/* Split hero (SERHANT pattern): portrait | name, role, contact. */}
      <section className="page-x-wide grid gap-8 py-8 md:grid-cols-[280px_1fr] md:gap-12 lg:grid-cols-[360px_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md">
          {agent.avatarUrl ? (
            <Image src={agent.avatarUrl} alt={`Portrait of ${agent.name}`} fill priority sizes="(min-width: 768px) 360px, 100vw" className="object-cover object-top" />
          ) : (
            <AgentInitials name={agent.name} className="size-full text-7xl" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="flex items-center gap-1.5 text-sm text-muted">
            {agent.title}
            {agent.isVerified && (
              <span className="inline-flex items-center gap-1 text-success">
                <BadgeCheck aria-hidden className="size-4" /> Verified
              </span>
            )}
          </p>
          <h1 className="mt-1 font-display text-display-l font-medium">{agent.name}</h1>
          {reviews.length > 0 && (
            <a href="#reviews" className="mt-3 flex items-center gap-2 text-sm hover:underline">
              <Stars value={average} />
              <span className="tabular font-medium">{average.toFixed(1)}</span>
              <span className="text-muted">from {reviews.length} reviews</span>
            </a>
          )}

          <dl className="mt-6 grid gap-2 text-[0.9375rem]">
            {agent.areas.length > 0 && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted">Areas served</dt>
                <dd>{agent.areas.join(', ')}</dd>
              </div>
            )}
            {agent.specialties.length > 0 && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted">Specialities</dt>
                <dd>{agent.specialties.join(', ')}</dd>
              </div>
            )}
            {agent.languages.length > 0 && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted">Languages</dt>
                <dd>{agent.languages.join(', ')}</dd>
              </div>
            )}
            {agent.yearsExperience != null && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted">Experience</dt>
                <dd>{agent.yearsExperience} years</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap gap-2">
            <TrackedLink
              channel="whatsapp"
              agentId={agent.id}
              href={whatsappLink(`Hello ${firstName}, I found you on the Akristal website.`, agent.whatsapp ?? agent.phone ?? undefined)}
              className={cn(action, 'bg-[#1f6f4a] text-white hover:bg-[#185c3d]')}
            >
              <MessageCircle aria-hidden className="size-4" /> WhatsApp {firstName}
            </TrackedLink>
            {phone && (
              <TrackedLink channel="call" agentId={agent.id} href={`tel:${phone}`} className={cn(action, 'border border-line-strong hover:border-ink')}>
                <Phone aria-hidden className="size-4" /> {agent.phone}
              </TrackedLink>
            )}
            {agent.email && (
              <TrackedLink channel="email" agentId={agent.id} href={`mailto:${agent.email}`} className={cn(action, 'border border-line-strong hover:border-ink')}>
                <Mail aria-hidden className="size-4" /> Email
              </TrackedLink>
            )}
          </div>
          {Object.keys(agent.socials).length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-4 text-sm">
              {Object.entries(agent.socials).map(([name, href]) => (
                <li key={name}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="capitalize underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-auto grid grid-cols-3 border-t border-line pt-6 md:mt-10">
            {counts.map((c) => (
              <div key={c.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-muted">{c.label}</dt>
                <dd className="tabular text-3xl font-light">{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {agent.bio && (
        <section aria-labelledby="bio-title" className="page-x-wide border-t border-line py-12">
          <h2 id="bio-title" className="font-display text-display-s font-medium">
            About {firstName}
          </h2>
          <p className="mt-4 max-w-[70ch] whitespace-pre-line text-[0.9375rem] leading-relaxed">{agent.bio}</p>
        </section>
      )}

      <section aria-labelledby="homes-title" className="page-x-wide border-t border-line py-12">
        <h2 id="homes-title" className="mb-6 font-display text-display-s font-medium">
          {firstName}&apos;s homes
        </h2>
        <AgentListingTabs groups={groups} agentFirstName={firstName} />
      </section>

      <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24 border-t border-line bg-page-alt py-12">
        <div className="page-x-wide grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 id="reviews-title" className="font-display text-display-s font-medium">
              Reviews
            </h2>
            {reviews.length ? (
              <>
                <div className="mt-5 flex items-end gap-4">
                  <p className="tabular text-5xl font-light leading-none">{average.toFixed(1)}</p>
                  <div>
                    <Stars value={average} size={18} />
                    <p className="mt-1 text-sm text-muted">{reviews.length} reviews</p>
                  </div>
                </div>
                <ul className="mt-6 grid max-w-sm gap-1.5" aria-label="Rating breakdown">
                  {distribution.map((d) => (
                    <li key={d.n} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3 text-sm">
                      <span>{d.n} star</span>
                      <span className="h-2 overflow-hidden rounded-full bg-line">
                        <span className="block h-full bg-accent" style={{ width: `${(d.count / reviews.length) * 100}%` }} />
                      </span>
                      <span className="tabular text-right text-muted">{d.count}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-10 grid gap-6">
                  {reviews.slice(0, 12).map((r) => (
                    <li key={r.id} className="border-t border-line pt-6">
                      <div className="flex items-center justify-between gap-3">
                        <Stars value={r.rating} size={14} />
                        <time dateTime={r.createdAt} className="text-sm text-muted">
                          {formatDate(r.createdAt, 'short')}
                        </time>
                      </div>
                      <p className="mt-3 text-[0.9375rem] leading-relaxed">{r.body}</p>
                      <p className="mt-2 text-sm text-muted">
                        {r.authorName}
                        {r.context && `, ${r.context}`}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-[0.9375rem] text-muted">No reviews yet. If you have worked with {firstName}, you can write the first one.</p>
            )}
          </div>
          <div className="grid content-start gap-10">
            <div className="rounded-md border border-line bg-surface p-6">
              <h3 className="text-lg font-semibold">Review {firstName}</h3>
              <p className="mb-5 mt-1 text-sm text-muted">Tell other buyers and tenants what it was like.</p>
              <ReviewForm agentId={agent.id} agentName={agent.name} />
            </div>
            <div className="rounded-md border border-line bg-surface p-6">
              <h3 className="text-lg font-semibold">Message {firstName}</h3>
              <p className="mb-5 mt-1 text-sm text-muted">{firstName} will reply by phone, WhatsApp or email.</p>
              <LeadForm type="agent_contact" context={{ agentId: agent.id }} submitLabel={`Send to ${firstName}`} successText={`${firstName} has your message and will be in touch.`}>
                <ContactFields compact />
                <Field as="textarea" name="message" label="Message" rows={4} required />
              </LeadForm>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
