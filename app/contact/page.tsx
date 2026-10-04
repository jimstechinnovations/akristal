import type { Metadata } from 'next'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { site } from '@/config/site'
import { pageMetadata } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'

export const metadata: Metadata = pageMetadata({
  title: 'Contact us',
  description: 'Call, WhatsApp or email The Akristal Group, or visit our head office on KK 15 Rd, Kigali. Offices in Rwanda, Nigeria and South Africa.',
  path: '/contact',
})

// Approximate position of KK 15 Rd, Kigali. Replace with the office's exact coordinates when confirmed.
const OFFICE = { lat: -1.9706, lng: 30.1044 }

export default function ContactPage() {
  const bbox = [OFFICE.lng - 0.012, OFFICE.lat - 0.008, OFFICE.lng + 0.012, OFFICE.lat + 0.008].join(',')
  const action = 'flex items-center gap-4 rounded-md border border-line p-5 transition-colors hover:border-ink'

  return (
    <>
      <header className="page-x pb-10 pt-10 sm:pt-14">
        <h1 className="font-display text-display-l font-medium">Contact us</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">The quickest way to reach us is WhatsApp. You can also call, email, or send the form below.</p>
      </header>

      <section aria-label="Ways to reach us" className="page-x grid gap-4 sm:grid-cols-3">
        <a href={whatsappLink('Hello Akristal, I have a question.')} className={action}>
          <MessageCircle aria-hidden className="size-6 shrink-0 text-[#1f6f4a] dark:text-[#7fbf9f]" />
          <span>
            <span className="block font-semibold">WhatsApp</span>
            <span className="tabular text-sm text-muted">+{site.whatsapp.replace(/^(\d{3})(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4')}</span>
          </span>
        </a>
        <a href={site.phone.href} className={action}>
          <Phone aria-hidden className="size-6 shrink-0" />
          <span>
            <span className="block font-semibold">Call</span>
            <span className="tabular text-sm text-muted">{site.phone.label}</span>
          </span>
        </a>
        <a href={`mailto:${site.email}`} className={action}>
          <Mail aria-hidden className="size-6 shrink-0" />
          <span>
            <span className="block font-semibold">Email</span>
            <span className="text-sm text-muted">{site.email}</span>
          </span>
        </a>
      </section>

      <section className="page-x section-y grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid content-start gap-10">
          {site.offices.map((o) => (
            <address key={o.region} className="not-italic">
              <p className="font-display text-2xl">{o.region}</p>
              <p className="text-sm text-muted">{o.label}</p>
              <p className="mt-3 flex items-start gap-2 text-[0.9375rem]">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
                {o.address}
              </p>
              <ul className="mt-2 grid gap-1">
                {o.phones.map((p) => (
                  <li key={p.href}>
                    <a href={p.href} className="tabular text-[0.9375rem] hover:underline">
                      {p.label}
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
          <LeadForm type="contact" submitLabel="Send message" successTitle="Message sent" successText="Thank you. Our team will reply as soon as possible.">
            <ContactFields />
            <Field
              as="select"
              name="topic"
              label="What is it about?"
              options={['Buying a home', 'Renting a home', 'Selling or letting', 'Our developments', 'Pay Small Small or mortgage', 'Interior design or furniture', 'Something else'].map((v) => ({ value: v, label: v }))}
            />
            <Field as="textarea" name="message" label="Message" rows={5} required />
          </LeadForm>
        </div>
      </section>
    </>
  )
}
