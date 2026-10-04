import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { getInstallmentPlans } from '@/lib/data/plans'
import { pageMetadata } from '@/lib/seo'
import { buttonClasses } from '@/components/ui/button'
import { Faq } from '@/components/ui/faq'
import { InstallmentPlanner } from '@/components/finance/installment-planner'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'

export const metadata: Metadata = pageMetadata({
  title: 'Pay Small Small: buy a home in instalments',
  description:
    'Pay Small Small is Akristal’s instalment plan: pay a deposit, then spread the balance in monthly instalments, paid directly to Akristal with no bank loan.',
  path: '/pay-small-small',
})

type PageProps = { searchParams: Promise<{ price?: string; currency?: string; deposit?: string; months?: string; property?: string }> }

export default async function PaySmallSmallPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const [activePlan] = await getInstallmentPlans()
  // No active plan (switched off in the admin): keep the page, explain, and still take applications.
  const plan = activePlan ?? { id: '', name: 'Pay Small Small', description: null, minDepositPct: 30, tenures: [6, 12, 18, 24], premiumByTenure: {}, eligibility: [], termsUrl: null }
  const price = Number(sp.price) > 0 ? Number(sp.price) : undefined
  const currency = sp.currency && /^[A-Z]{3}$/.test(sp.currency) ? sp.currency : 'RWF'
  const longest = Math.max(...plan.tenures)

  const steps = [
    { title: 'Choose your home', text: 'Pick an eligible listing or a unit in an Akristal development.' },
    { title: 'Pay the deposit', text: `At least ${plan.minDepositPct}% of the price when you sign your Pay Small Small agreement.` },
    { title: 'Pay monthly', text: `Spread the balance over ${plan.tenures.join(', ').replace(/, (\d+)$/, ' or $1')} months.` },
    { title: 'Complete and move in', text: 'Your agreement sets out handover and title transfer once the plan is paid.' },
  ]

  const faqs = [
    { q: 'Do I need a bank loan?', a: 'No. You pay Akristal directly. There is no bank involved.' },
    { q: 'Which homes can I buy with Pay Small Small?', a: 'Selected listings and units in Akristal developments. Ask your agent, or look for "Pay Small Small available" on a development.' },
    { q: 'Can I pay faster than the schedule?', a: 'Tell us when you apply. Your agreement sets out how early payments work.' },
    { q: 'What if I miss a payment?', a: 'Contact us straight away. Your agreement explains what happens with late or missed payments, so read it carefully before you sign.' },
    { q: 'Is there extra cost for paying in instalments?', a: 'Any premium for longer plans is shown in the calculator above and stated in your agreement.' },
  ]

  return (
    <>
      <section className="bg-brand text-white">
        <div className="page-x grid gap-10 pb-16 pt-14 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:pb-20 lg:pt-20">
          <div>
            <h1 className="font-display text-display-xl font-medium">Pay Small Small</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              Own your home without a bank loan. Pay a deposit, then the rest in monthly instalments over up to {longest} months, directly to
              Akristal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#planner" className={buttonClasses({ className: 'bg-white text-[#1f1b19] hover:bg-[#edefec]' })}>
                Plan your payments
              </a>
              <a href="#apply" className={buttonClasses({ variant: 'inverse' })}>
                Apply for Pay Small Small
              </a>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-6 border-t border-white/20 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <dt className="text-sm text-white/70">Deposit from</dt>
              <dd className="tabular mt-1 text-4xl font-light">{plan.minDepositPct}%</dd>
            </div>
            <div>
              <dt className="text-sm text-white/70">Pay over</dt>
              <dd className="tabular mt-1 text-4xl font-light">
                {Math.min(...plan.tenures)} to {longest} <span className="text-lg">months</span>
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-sm text-white/70">Bank loan needed</dt>
              <dd className="mt-1 text-4xl font-light">None</dd>
            </div>
          </dl>
        </div>
      </section>


      <section aria-labelledby="pss-how" className="page-x section-y">
        <h2 id="pss-how" className="font-display text-display-m font-medium">
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

      <section id="planner" aria-labelledby="planner-title" className="scroll-mt-20 border-t border-line section-y">
        <div className="page-x">
          <h2 id="planner-title" className="font-display text-display-m font-medium">
            Plan your payments
          </h2>
          <p className="mb-10 mt-3 max-w-2xl text-base text-muted">Enter the price, choose your deposit and how many months, and see every payment with its due date.</p>
          <InstallmentPlanner
            plan={plan}
            initialPrice={price}
            initialCurrency={currency}
            initialDeposit={Number(sp.deposit) || undefined}
            initialMonths={Number(sp.months) || undefined}
          />
        </div>
      </section>

      <section aria-labelledby="elig-title" className="bg-page-alt section-y">
        <div className="page-x grid gap-12 lg:grid-cols-2">
          <div>
            <h2 id="elig-title" className="font-display text-display-m font-medium">
              Who can apply
            </h2>
            <ul className="mt-8 grid gap-4">
              {plan.eligibility.map((e) => (
                <li key={e} className="flex gap-3 text-[0.9375rem]">
                  <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-display-m font-medium">The terms, in plain words</h2>
            <ul className="mt-8 grid gap-3 text-[0.9375rem] leading-relaxed text-muted">
              <li>You sign a Pay Small Small agreement before paying the deposit.</li>
              <li>Instalments are due monthly on the dates shown in your schedule.</li>
              <li>Your agreement explains handover, title transfer, early payment and missed payments.</li>
              <li>Prices and plan options are confirmed by Akristal for each home.</li>
            </ul>
            {plan.termsUrl && (
              <a href={plan.termsUrl} className="mt-6 inline-block text-[0.9375rem] font-medium underline underline-offset-4">
                Read the full terms
              </a>
            )}
          </div>
        </div>
      </section>

      <section id="apply" aria-labelledby="apply-pss" className="scroll-mt-20 page-x section-y grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 id="apply-pss" className="font-display text-display-m font-medium">
            Apply for Pay Small Small
          </h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">
            Tell us which home you want and how you would like to pay. We will confirm the plan and send your agreement.
          </p>
          <p className="mt-6 text-[0.9375rem]">
            Still choosing?{' '}
            <Link href="/projects" className="underline underline-offset-4">
              See our developments
            </Link>{' '}
            or{' '}
            <Link href="/properties" className="underline underline-offset-4">
              browse homes
            </Link>
            .
          </p>
        </div>
        <div className="rounded-md border border-line p-6 sm:p-8">
          <LeadForm
            type="pay_small_small"
            context={sp.property && /^[0-9a-f-]{36}$/i.test(sp.property) ? { propertyId: sp.property } : {}}
            submitLabel="Apply for Pay Small Small"
            successTitle="Application received"
            successText="We will contact you to confirm the plan for your chosen home."
          >
            <ContactFields />
            <Field name="home" label="Which home or development?" placeholder="e.g. Pearl View Residence, 3-bedroom" defaultValue={price ? `Price ${price.toLocaleString('en')} ${currency}` : undefined} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                as="select"
                name="deposit_pct"
                label="Deposit you plan to pay"
                options={[plan.minDepositPct, 40, 50, 60].filter((v, i, a) => v >= plan.minDepositPct && a.indexOf(v) === i).map((v) => ({ value: `${v}%`, label: `${v}%` }))}
              />
              <Field as="select" name="months" label="Pay over" options={plan.tenures.map((m) => ({ value: `${m} months`, label: `${m} months` }))} />
            </div>
            <Field as="textarea" name="message" label="Questions" rows={3} />
          </LeadForm>
        </div>
      </section>

      <section aria-labelledby="pss-faq" className="page-x pb-20">
        <h2 id="pss-faq" className="mb-8 font-display text-display-m font-medium">
          Questions about Pay Small Small
        </h2>
        <Faq items={faqs} />
      </section>
    </>
  )
}
