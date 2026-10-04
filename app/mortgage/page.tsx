import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { images } from '@/content/images'
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

const steps = [
  { title: 'Check what you can afford', text: 'Use the calculators below to set a realistic budget before you start viewing.' },
  { title: 'Get pre-qualified', text: 'Send us a few details. We review your figures and tell you which lenders fit.' },
  { title: 'Choose your home', text: 'Pick a listing or an Akristal development. Your agent negotiates the price.' },
  { title: 'Approval and handover', text: 'The bank values the home and approves the loan. You sign, pay the deposit and collect the keys.' },
]

const faqs = [
  {
    q: 'How much deposit do I need?',
    a: 'Banks usually ask for 10% to 30% of the price, depending on the country, the lender and your income. The calculator starts with a typical figure for each currency.',
  },
  {
    q: 'Can I get a mortgage if I live abroad?',
    a: 'Some lenders offer diaspora mortgages. Tell us where you live and earn in the pre-qualification form and we will point you to the options.',
  },
  {
    q: 'What documents will the bank ask for?',
    a: 'Usually ID, proof of income (payslips or business statements), bank statements for the last six to twelve months, and the sale agreement for the home.',
  },
  {
    q: 'Mortgage or Pay Small Small?',
    a: 'A mortgage spreads the cost over many years through a bank. Pay Small Small spreads it over months, paid directly to Akristal, with no bank loan. The right choice depends on your budget and how fast you want to own the home outright.',
  },
]

type PageProps = { searchParams: Promise<{ price?: string; currency?: string }> }

export default async function MortgagePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const price = Number(sp.price) > 0 ? Number(sp.price) : undefined
  const currency = sp.currency && /^[A-Z]{3}$/.test(sp.currency) ? sp.currency : 'RWF'
  const lenders = await getLenders()
  const hero = images.homesVilla2

  return (
    <>
      <section className="relative isolate flex min-h-[52svh] items-end text-white">
        <Image src={hero.src} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_12_10/0.8)] via-[rgb(20_12_10/0.35)] to-[rgb(20_12_10/0.1)]" />
        <div className="page-x pb-12 pt-28">
          <h1 className="max-w-2xl font-display text-display-l font-medium">Buy with a mortgage</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">Know your monthly payment before you fall in love with a home, then let us help you through the bank.</p>
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
          How it works
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
            Mortgage calculator
          </h2>
          <p className="mb-10 mt-3 max-w-2xl text-base text-muted">Change the price, deposit, rate and term to see your monthly payment and the full repayment schedule.</p>
          <MortgageCalculator initialPrice={price} initialCurrency={currency} />
        </div>
      </section>

      <section aria-labelledby="afford-title" className="bg-page-alt section-y">
        <div className="page-x">
          <h2 id="afford-title" className="font-display text-display-m font-medium">
            How much can you afford?
          </h2>
          <p className="mb-10 mt-3 max-w-2xl text-base text-muted">A quick guide based on your income, existing repayments and savings.</p>
          <AffordabilityCalculator />
        </div>
      </section>

      <section id="prequalify" aria-labelledby="pq-title" className="scroll-mt-20 page-x section-y grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 id="pq-title" className="font-display text-display-m font-medium">
            Get pre-qualified
          </h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">
            Tell us about your income and deposit. We will tell you which lenders fit and what to prepare. It does not affect your credit
            record.
          </p>
          <div className="mt-10 rounded-md bg-page-alt p-6">
            <h3 className="font-semibold">Our lending partners</h3>
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
                Partner lenders will be listed here. Until then, send the form and we will point you to lenders that fit your situation.
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
              Prefer to skip the bank?
            </h2>
            <p className="mt-2 text-white/80">With Pay Small Small you pay Akristal directly: a deposit, then monthly instalments over up to two years.</p>
          </div>
          <Link href="/pay-small-small" className={buttonClasses({ variant: 'inverse' })}>
            See Pay Small Small
          </Link>
        </div>
      </section>

      <section aria-labelledby="mfaq-title" className="page-x section-y">
        <h2 id="mfaq-title" className="mb-8 font-display text-display-m font-medium">
          Mortgage questions
        </h2>
        <Faq items={faqs} />
      </section>
    </>
  )
}
