import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BadgeCheck, ChevronRight, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { getBroker } from '@/lib/data/brokers'
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { JsonLd } from '@/components/seo/json-ld'
import { TrackedLink } from '@/components/agents/tracked-link'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'

export const revalidate = 300

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const broker = await getBroker((await params).slug)
  if (!broker) return { title: 'Broker not found', robots: { index: false } }
  const description = broker.about?.slice(0, 155) ?? `${broker.name} is a broker company registered with The Akristal Group.`
  return {
    title: `${broker.name}, Akristal Broker`,
    description,
    alternates: { canonical: `/brokers/${broker.slug}` },
    openGraph: { title: broker.name, description, url: `/brokers/${broker.slug}`, images: broker.logoUrl ? [broker.logoUrl] : undefined },
  }
}

export default async function BrokerPage({ params }: PageProps) {
  const broker = await getBroker((await params).slug)
  if (!broker) notFound()
  const phone = broker.phone?.replace(/[^\d+]/g, '')
  const action = 'inline-flex h-11 items-center justify-center gap-2 rounded-sm px-5 text-sm font-medium transition-colors'

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'RealEstateAgent',
            name: broker.name,
            url: absoluteUrl(`/brokers/${broker.slug}`),
            logo: broker.logoUrl ?? undefined,
            telephone: phone ?? undefined,
            email: broker.email ?? undefined,
            address: broker.address || broker.city ? { '@type': 'PostalAddress', streetAddress: broker.address ?? undefined, addressLocality: broker.city ?? undefined, addressCountry: broker.country ?? undefined } : undefined,
            areaServed: broker.areas.length ? broker.areas : undefined,
            memberOf: { '@id': absoluteUrl('/#organization') },
          },
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Brokers', path: '/brokers' },
            { name: broker.name, path: `/brokers/${broker.slug}` },
          ]),
        ]}
      />

      <div className="page-x-wide pt-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/brokers" className="hover:text-ink hover:underline">
            Brokers
          </Link>
          <ChevronRight aria-hidden className="mx-1 inline size-3.5" />
          <span aria-current="page">{broker.name}</span>
        </nav>
      </div>

      <section className="page-x-wide grid gap-8 py-8 md:grid-cols-[240px_1fr] md:gap-12">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md border border-line bg-white">
          {broker.logoUrl ? (
            <Image src={broker.logoUrl} alt={`${broker.name} logo`} fill priority sizes="240px" className="object-contain p-6" />
          ) : (
            <span aria-hidden className="flex size-full items-center justify-center bg-brand font-display text-6xl text-white">
              {broker.name.slice(0, 1)}
            </span>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            Akristal Broker
            {broker.isVerified && (
              <span className="inline-flex items-center gap-1 text-success">
                <BadgeCheck aria-hidden className="size-4" /> Verified
              </span>
            )}
          </p>
          <h1 className="mt-1 font-display text-display-l font-medium">{broker.name}</h1>
          <dl className="mt-6 grid gap-2 text-[0.9375rem]">
            {(broker.address || broker.city) && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted">
                  <MapPin aria-hidden className="mr-1 inline size-4" />
                  Office
                </dt>
                <dd>{[broker.address, broker.city, broker.country].filter(Boolean).join(', ')}</dd>
              </div>
            )}
            {broker.areas.length > 0 && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted">Areas</dt>
                <dd>{broker.areas.join(', ')}</dd>
              </div>
            )}
            {broker.contactName && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted">Contact</dt>
                <dd>{broker.contactName}</dd>
              </div>
            )}
            {broker.registrationNumber && (
              <div className="flex gap-3">
                <dt className="w-28 shrink-0 text-muted">Registration</dt>
                <dd className="tabular">{broker.registrationNumber}</dd>
              </div>
            )}
          </dl>
          <div className="mt-8 flex flex-wrap gap-2">
            {(broker.whatsapp || broker.phone) && (
              <TrackedLink
                channel="whatsapp"
                brokerId={broker.id}
                href={whatsappLink(`Hello ${broker.name}, I found you on the Akristal website.`, broker.whatsapp ?? broker.phone ?? undefined)}
                className={cn(action, 'bg-[#1f6f4a] text-white hover:bg-[#185c3d]')}
              >
                <MessageCircle aria-hidden className="size-4" /> WhatsApp
              </TrackedLink>
            )}
            {phone && (
              <TrackedLink channel="call" brokerId={broker.id} href={`tel:${phone}`} className={cn(action, 'border border-line-strong hover:border-ink')}>
                <Phone aria-hidden className="size-4" /> {broker.phone}
              </TrackedLink>
            )}
            {broker.email && (
              <TrackedLink channel="email" brokerId={broker.id} href={`mailto:${broker.email}`} className={cn(action, 'border border-line-strong hover:border-ink')}>
                <Mail aria-hidden className="size-4" /> Email
              </TrackedLink>
            )}
            {broker.websiteUrl && (
              <a href={broker.websiteUrl} target="_blank" rel="noopener noreferrer" className={cn(action, 'border border-line-strong hover:border-ink')}>
                <Globe aria-hidden className="size-4" /> Website
              </a>
            )}
          </div>
        </div>
      </section>

      {broker.about && (
        <section aria-labelledby="about-title" className="page-x-wide border-t border-line py-12">
          <h2 id="about-title" className="font-display text-display-s font-medium">
            About {broker.name}
          </h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink/90">{broker.about}</p>
        </section>
      )}

      <section aria-labelledby="contact-title" className="border-t border-line bg-page-alt section-y">
        <div className="page-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="contact-title" className="font-display text-display-m font-medium">
              Ask {broker.name}
            </h2>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">Send a message and the Akristal team will pass it straight to the broker.</p>
          </div>
          <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
            <LeadForm type="agent_contact" context={{}} submitLabel="Send message" successTitle="Message sent" successText="The broker will get back to you soon.">
              <input type="hidden" name="broker" value={broker.name} />
              <ContactFields />
              <Field as="textarea" name="message" label="How can they help?" rows={4} />
            </LeadForm>
          </div>
        </div>
      </section>
    </>
  )
}
