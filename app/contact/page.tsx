import type { Metadata } from 'next'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { site } from '@/config/site'
import { pageMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/data/settings'
import { getCopy } from '@/lib/data/copy'
import { splitPhones, telHref } from '@/content/defaults'
import { whatsappLink } from '@/lib/whatsapp'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'

export const metadata: Metadata = pageMetadata({
  title: 'Contact us',
  description: 'Call, WhatsApp or email The Akristal Group, or visit the Akristal head offices in Kigali (East Africa) and Abuja (West Africa).',
  path: '/contact',
})

// Approximate position of KK 15 Rd, Kigali. Replace with the office's exact coordinates when confirmed.
const OFFICE = { lat: -1.9706, lng: 30.1044 }

const TOPICS = [
  'Buying a home',
  'Renting a home',
  'Selling or letting',
  'Akristal Developments',
  'Pay Small Small or mortgage',
  'Interior design or furniture',
  'Becoming a broker or agent',
  'Partnership',
  'Something else',
]

type PageProps = { searchParams: Promise<{ topic?: string }> }

export default async function ContactPage({ searchParams }: PageProps) {
  const [{ contact }, sp, copy] = await Promise.all([getSettings(), searchParams, getCopy('directories')])
  const topic = sp.topic === 'partnership' ? 'Partnership' : undefined
  const phones = contact.headerPhones
  const bbox = [OFFICE.lng - 0.012, OFFICE.lat - 0.008, OFFICE.lng + 0.012, OFFICE.lat + 0.008].join(',')
  const action = 'flex items-center gap-4 rounded-md border border-line p-5 transition-colors hover:border-ink'

  return (
    <>
      <header className="page-x pb-10 pt-10 sm:pt-14">
        <h1 className="font-display text-display-l font-medium">{copy.t('contact.title')}</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{copy.t('contact.intro')}</p>
      </header>

      <section aria-label="Ways to reach us" className="page-x grid gap-4 sm:grid-cols-3">
        <a href={whatsappLink('Hello Akristal, I have a question.')} className={action}>
          <MessageCircle aria-hidden className="size-6 shrink-0 text-[#1f6f4a] dark:text-[#7fbf9f]" />
          <span>
            <span className="block font-semibold">WhatsApp</span>
            <span className="tabular text-sm text-muted">+{site.whatsapp.replace(/^(\d{3})(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4')}</span>
          </span>
        </a>
        {phones.length > 0 && (
          <div className={action}>
            <Phone aria-hidden className="size-6 shrink-0" />
            <span>
              <span className="block font-semibold">Call</span>
              {phones.map((p) => (
                <a key={p.number} href={telHref(p.number)} className="tabular block text-sm text-muted hover:text-ink hover:underline">
                  {p.label} {p.number}
                </a>
              ))}
            </span>
          </div>
        )}
        <a href={`mailto:${contact.email}`} className={action}>
          <Mail aria-hidden className="size-6 shrink-0" />
          <span>
            <span className="block font-semibold">Email</span>
            <span className="text-sm text-muted">{contact.email}</span>
          </span>
        </a>
      </section>

      <section className="page-x section-y grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid content-start gap-10">
          {contact.offices.map((o) => (
            <address key={o.region + o.label} className="not-italic">
              <p className="font-display text-2xl">{o.region}</p>
              <p className="text-sm text-muted">{o.label}</p>
              <p className="mt-3 flex items-start gap-2 text-[0.9375rem]">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
                {o.address}
              </p>
              <ul className="mt-2 grid gap-1">
                {splitPhones(o.phones).map((p) => (
                  <li key={p}>
                    <a href={telHref(p)} className="tabular text-[0.9375rem] hover:underline">
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </address>
          ))}
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-md border border-line">
              <iframe
                title="Map of the Akristal head office, KK 15 Rd, Kigali"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${OFFICE.lat},${OFFICE.lng}`}
                className="size-full"
                loading="lazy"
              />
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=KK+15+Rd,+Kigali,+Rwanda"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
            >
              Get directions
            </a>
          </div>
        </div>

        <div className="rounded-md border border-line p-6 sm:p-8 lg:self-start">
          <h2 className="text-lg font-semibold">Send us a message</h2>
          <p className="mb-6 mt-1 text-sm text-muted">We reply by phone, WhatsApp or email.</p>
          <LeadForm type="contact" submitLabel="Send message" successTitle="Message sent" successText="Thank you. The Akristal team will reply as soon as possible.">
            <ContactFields />
            <Field
              as="select"
              name="topic"
              label="What is it about?"
              defaultValue={topic}
              options={TOPICS.map((v) => ({ value: v, label: v }))}
            />
            <Field as="textarea" name="message" label="Message" rows={5} required />
          </LeadForm>
        </div>
      </section>
    </>
  )
}
