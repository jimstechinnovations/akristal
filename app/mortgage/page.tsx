import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCopy } from '@/lib/data/copy'
import { getInstallmentPlans } from '@/lib/data/plans'
import { formatTenure } from '@/lib/format'
import { getLenders } from '@/lib/data/plans'
import { pageMetadata } from '@/lib/seo'
import { buttonClasses } from '@/components/ui/button'
import { Faq } from '@/components/ui/faq'
import { MortgageCalculator } from '@/components/finance/mortgage-calculator'
import { AffordabilityCalculator } from '@/components/finance/affordability-calculator'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'

export const metadata: Metadata = pageMetadata({
  title: 'Mortgage calculator and home loans',
  description:
    'Work out your monthly mortgage payment, see how much home you can afford, and get help applying for a home loan in Rwanda, Nigeria and beyond.',
  path: '/mortgage',
})

type PageProps = { searchParams: Promise<{ price?: string; currency?: string }> }

export default async function MortgagePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const price = Number(sp.price) > 0 ? Number(sp.price) : undefined
  const currency = sp.currency && /^[A-Z]{3}$/.test(sp.currency) ? sp.currency : 'RWF'
  const [lenders, copy, plans] = await Promise.all([getLenders(), getCopy('mortgage'), getInstallmentPlans()])
  const tenures = plans[0]?.tenures.length ? plans[0].tenures : [6, 60]
  const vars = { shortest: formatTenure(Math.min(...tenures)), longest: formatTenure(Math.max(...tenures)) }
  const steps = copy.list('how.steps')
  const faqs = copy.list('faq.items', vars).map((f) => ({ q: f.q, a: f.a }))

  return (
    <>
      <section className="relative isolate flex min-h-[52svh] items-end text-white">
        <Image src={copy.t('hero.image')} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_12_10/0.8)] via-[rgb(20_12_10/0.35)] to-[rgb(20_12_10/0.1)]" />
        <div className="page-x pb-12 pt-28">
          <h1 className="max-w-2xl font-display text-display-l font-medium">{copy.t('hero.title')}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">{copy.t('hero.intro')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#calculator" className={buttonClasses({ className: 'bg-white text-[#1f1b19] hover:bg-[#edefec]' })}>
              Work out your payment
            </a>
            <a href="#prequalify" className={buttonClasses({ variant: 'inverse' })}>
              Get pre-qualified
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="page-x section-y">
        <h2 id="how-title" className="font-display text-display-m font-medium">
          {copy.t('how.title')}
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

      <section id="calculator" aria-labelledby="calc-title" className="scroll-mt-20 border-t border-line section-y">
        <div className="page-x">
          <h2 id="calc-title" className="font-display text-display-m font-medium">
            {copy.t('calculator.title')}
          </h2>
          <p className="mb-10 mt-3 max-w-2xl text-base text-muted">{copy.t('calculator.intro')}</p>
          <MortgageCalculator initialPrice={price} initialCurrency={currency} />
        </div>
      </section>

      <section aria-labelledby="afford-title" className="bg-page-alt section-y">
        <div className="page-x">
          <h2 id="afford-title" className="font-display text-display-m font-medium">
            {copy.t('afford.title')}
          </h2>
          <p className="mb-10 mt-3 max-w-2xl text-base text-muted">{copy.t('afford.intro')}</p>
          <AffordabilityCalculator />
        </div>
      </section>

      <section id="prequalify" aria-labelledby="pq-title" className="scroll-mt-20 page-x section-y grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 id="pq-title" className="font-display text-display-m font-medium">
            {copy.t('prequalify.title')}
          </h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">{copy.t('prequalify.intro')}</p>
          <div className="mt-10 rounded-md bg-page-alt p-6">
            <h3 className="font-semibold">{copy.t('lenders.title')}</h3>
            {lenders.length ? (
              <ul className="mt-4 grid gap-4">
                {lenders.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                    <span className="flex items-center gap-3">
                      {l.logoUrl && <Image src={l.logoUrl} alt="" width={40} height={40} className="size-10 rounded-sm object-contain" />}
                      <span>
                        <span className="block font-medium">{l.name}</span>
                        <span className="text-sm text-muted">{l.countries.join(', ')}</span>
                      </span>
                    </span>
                    {l.rateFrom != null && <span className="tabular text-sm">from {l.rateFrom}%</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[0.9375rem] text-muted">
                {copy.t('lenders.empty')}
              </p>
            )}
          </div>
        </div>
        <div className="rounded-md border border-line p-6 sm:p-8">
          <LeadForm
            type="prequalification"
            submitLabel="Check my options"
            successTitle="Thank you. We have your details"
            successText="A finance adviser will contact you to talk through lenders and next steps."
          >
            <ContactFields />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                as="select"
                name="country"
                label="Where are you buying?"
                options={['Rwanda', 'Nigeria', 'United Arab Emirates', 'Uganda', 'South Africa', 'Not sure yet'].map((c) => ({ value: c, label: c }))}
              />
              <Field
                as="select"
                name="employment"
                label="How do you earn?"
                options={['Salaried', 'Self-employed or business owner', 'Living abroad (diaspora)', 'Other'].map((c) => ({ value: c, label: c }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="monthly_income" label="Monthly income (approx.)" inputMode="numeric" placeholder="e.g. RWF 2,500,000" />
              <Field name="deposit" label="Deposit available (approx.)" inputMode="numeric" placeholder="e.g. RWF 30,000,000" />
            </div>
            <Field name="budget" label="Price range you're looking at" placeholder="e.g. RWF 120M to 180M" />
            <Field as="textarea" name="message" label="Anything else?" rows={3} />
          </LeadForm>
        </div>
      </section>

      <section aria-labelledby="pss-title" className="bg-brand text-white">
        <div className="page-x flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="pss-title" className="font-display text-display-s font-medium">
              {copy.t('pss.title')}
            </h2>
            <p className="mt-2 text-white/80">{copy.t('pss.text', vars)}</p>
          </div>
          <Link href="/pay-small-small" className={buttonClasses({ variant: 'inverse' })}>
            See Pay Small Small
          </Link>
        </div>
      </section>

      <section aria-labelledby="mfaq-title" className="page-x section-y">
        <h2 id="mfaq-title" className="mb-8 font-display text-display-m font-medium">
          {copy.t('faq.title')}
        </h2>
        <Faq items={faqs} />
      </section>
    </>
  )
}
