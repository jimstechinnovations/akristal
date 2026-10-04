import type { Metadata } from 'next'
import Image from 'next/image'
import { images } from '@/content/images'
import { getPropertyTypes } from '@/lib/data/listings'
import { pageMetadata } from '@/lib/seo'
import { Field, LeadForm } from '@/components/forms/lead-form'

export const metadata: Metadata = pageMetadata({
  title: 'Sell or let your home: free valuation',
  description: 'Get a price estimate for your home and a plan to sell or let it with Akristal agents in Kigali, Abuja, Lagos and beyond.',
  path: '/sell',
})

const reasons = [
  { title: 'Buyers at home and abroad', text: 'Your home is listed on akristal.com with photos, a map and monthly cost estimates that buyers in Rwanda, Nigeria and the diaspora use to decide.' },
  { title: 'An agent who knows your area', text: 'One person handles viewings, questions and offers, and keeps you updated on WhatsApp.' },
  { title: 'More ways for buyers to pay', text: 'Eligible homes can be offered with Pay Small Small instalments, which widens the pool of buyers.' },
]

const steps = [
  { title: 'Tell us about the home', text: 'Send the form. It takes two minutes.' },
  { title: 'Visit and price', text: 'An agent visits, checks comparable homes nearby and recommends a price.' },
  { title: 'Photos and listing', text: 'We prepare the listing and publish it once you approve it.' },
  { title: 'Viewings to completion', text: 'Your agent runs viewings, negotiates offers and guides the paperwork.' },
]

type PageProps = { searchParams: Promise<{ address?: string; type?: string; phone?: string }> }

export default async function SellPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const types = await getPropertyTypes()
  const img = images.homesVilla3

  return (
    <>
      <section className="grid lg:grid-cols-[1.1fr_1fr]">
        <div className="px-4 py-14 sm:px-10 lg:px-16 lg:py-20 xl:px-24">
          <h1 className="font-display text-display-l font-medium">Sell or let your home with Akristal</h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">Start with a free valuation. We will tell you what your home is likely to fetch, and how we would market it.</p>
          <div id="valuation" className="mt-10 max-w-xl rounded-md border border-line p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Request a valuation</h2>
            <p className="mb-6 mt-1 text-sm text-muted">No cost and no obligation.</p>
            <LeadForm type="valuation" submitLabel="Get my valuation" successTitle="Valuation requested" successText="An agent will contact you to arrange a visit.">
              <Field name="address" label="Address or area" required defaultValue={sp.address} placeholder="e.g. Kibagabaga, Kigali" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  as="select"
                  name="property_type"
                  label="Property type"
                  defaultValue={sp.type ?? ''}
                  options={[{ value: '', label: 'Choose one' }, ...types.map((t) => ({ value: t.name, label: t.name }))]}
                />
                <Field
                  as="select"
                  name="goal"
                  label="I want to"
                  options={['Sell', 'Let', 'Not sure yet'].map((v) => ({ value: v, label: v }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field name="bedrooms" label="Bedrooms" inputMode="numeric" />
                <Field name="size_sqm" label="Size (m²)" inputMode="numeric" />
                <Field
                  as="select"
                  name="condition"
                  label="Condition"
                  options={['Excellent', 'Good', 'Needs work', 'Under construction'].map((v) => ({ value: v, label: v }))}
                />
              </div>
              <Field name="name" label="Full name" required autoComplete="name" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="phone" label="Phone or WhatsApp" type="tel" required autoComplete="tel" defaultValue={sp.phone} placeholder="+250 788 000 000" hint="Phone or email: one is enough." />
                <Field name="email" label="Email" type="email" autoComplete="email" />
              </div>
              <Field as="textarea" name="message" label="Anything else?" rows={3} />
            </LeadForm>
          </div>
        </div>
        <div className="relative hidden min-h-full lg:block">
          <Image src={img.src} alt={img.alt} fill priority sizes="45vw" className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="why-sell" className="bg-page-alt section-y">
        <div className="page-x">
          <h2 id="why-sell" className="font-display text-display-m font-medium">
            Why owners list with us
          </h2>
          <dl className="mt-10 grid gap-10 md:grid-cols-3">
            {reasons.map((r) => (
              <div key={r.title} className="border-t border-line pt-5">
                <dt className="text-lg font-semibold">{r.title}</dt>
                <dd className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{r.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="sell-steps" className="page-x section-y">
        <h2 id="sell-steps" className="font-display text-display-m font-medium">
          From valuation to sale
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="border-t-2 border-primary pt-5">
              <span className="tabular text-sm text-muted">Step {i + 1}</span>
              <p className="mt-1 text-lg font-semibold">{s.title}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
