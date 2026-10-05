import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { getInstallmentPlans } from '@/lib/data/plans'
import { formatTenure } from '@/lib/format'
import { getCopy } from '@/lib/data/copy'
import { pageMetadata } from '@/lib/seo'
import { buttonClasses } from '@/components/ui/button'
import { Faq } from '@/components/ui/faq'
import { InstallmentPlanner } from '@/components/finance/installment-planner'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'

export const metadata: Metadata = pageMetadata({
  title: 'Pay Small Small: buy a home in instalments',
  description:
    'Pay Small Small is Akristal’s instalment plan: pay a 10% to 50% deposit, then spread the balance monthly over six months to five years, paid directly to Akristal. Your own bank loan can cover part of it.',
  path: '/pay-small-small',
})

type PageProps = { searchParams: Promise<{ price?: string; currency?: string; deposit?: string; months?: string; property?: string }> }

export default async function PaySmallSmallPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const [activePlan] = await getInstallmentPlans()
  // No active plan (switched off in the admin): keep the page, explain, and still take applications.
  const plan = activePlan ?? { id: '', name: 'Pay Small Small', description: null, minDepositPct: 10, maxDepositPct: 50, tenures: [6, 12, 18, 24, 36, 48, 60], premiumByTenure: {}, eligibility: [], termsUrl: null }
  const price = Number(sp.price) > 0 ? Number(sp.price) : undefined
  const currency = sp.currency && /^[A-Z]{3}$/.test(sp.currency) ? sp.currency : 'RWF'
  const longest = Math.max(...plan.tenures)
  const shortest = Math.min(...plan.tenures)
  const depositOptions = Array.from(new Set([plan.minDepositPct, 20, 30, 40, 50, plan.maxDepositPct])).filter((v) => v >= plan.minDepositPct && v <= plan.maxDepositPct).sort((a, b) => a - b)

  const copy = await getCopy('pay-small-small')
  const vars = { minDeposit: plan.minDepositPct, maxDeposit: plan.maxDepositPct, shortest: formatTenure(shortest), longest: formatTenure(longest) }
  const steps = copy.list('how.steps', vars).map((s) => ({ title: s.title, text: s.text }))
  const faqs = copy.list('faq.items', vars).map((f) => ({ q: f.q, a: f.a }))

  return (
    <>
      <section className="bg-brand text-white">
        <div className="page-x grid gap-10 pb-16 pt-14 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:pb-20 lg:pt-20">
          <div>
            <h1 className="font-display text-display-xl font-medium">{copy.t('hero.title')}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              {copy.t('hero.intro', vars)}
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
              <dt className="text-sm text-white/70">Deposit</dt>
              <dd className="tabular mt-1 text-4xl font-light">
                {plan.minDepositPct}% <span className="text-lg">to</span> {plan.maxDepositPct}%
              </dd>
            </div>
            <div>
              <dt className="text-sm text-white/70">Pay over</dt>
              <dd className="tabular mt-1 text-4xl font-light">
                {shortest < 12 ? shortest : shortest / 12} <span className="text-lg">{shortest < 12 ? 'months' : 'years'} to</span> {longest % 12 === 0 ? longest / 12 : longest}{' '}
                <span className="text-lg">{longest % 12 === 0 ? 'years' : 'months'}</span>
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-sm text-white/70">{copy.t('bank.label')}</dt>
              <dd className="mt-1 text-4xl font-light">{copy.t('bank.value')}</dd>
              <dd className="mt-1 text-sm text-white/70">{copy.t('bank.note')}</dd>
            </div>
          </dl>
        </div>
      </section>


      <section aria-labelledby="pss-how" className="page-x section-y">
        <h2 id="pss-how" className="font-display text-display-m font-medium">
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

      <section id="planner" aria-labelledby="planner-title" className="scroll-mt-20 border-t border-line section-y">
        <div className="page-x">
          <h2 id="planner-title" className="font-display text-display-m font-medium">
            {copy.t('planner.title')}
          </h2>
          <p className="mb-10 mt-3 max-w-2xl text-base text-muted">
            {copy.t('planner.intro')}
          </p>
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
              {copy.t('eligibility.title')}
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
            <h2 className="font-display text-display-m font-medium">{copy.t('terms.title')}</h2>
            <ul className="mt-8 grid gap-3 text-[0.9375rem] leading-relaxed text-muted">
              {copy.list('terms.items', vars).map((t) => (
                <li key={t.text}>{t.text}</li>
              ))}
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
            {copy.t('apply.title')}
          </h2>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">
            {copy.t('apply.intro')}
          </p>
          <p className="mt-6 text-[0.9375rem]">
            Still choosing?{' '}
            <Link href="/projects" className="underline underline-offset-4">
              See Akristal Developments
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
                options={depositOptions.map((v) => ({ value: `${v}%`, label: `${v}%` }))}
              />
              <Field as="select" name="months" label="Pay over" options={plan.tenures.map((m) => ({ value: formatTenure(m), label: formatTenure(m) }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="bank" label="Bank that can lend you part" placeholder="e.g. Bank of Kigali, Access Bank" />
              <Field name="bank_amount" label="Amount the bank may lend" placeholder="e.g. 40,000,000 RWF" />
            </div>
            <Field as="textarea" name="message" label="Questions" rows={3} />
          </LeadForm>
        </div>
      </section>

      <section aria-labelledby="pss-faq" className="page-x pb-20">
        <h2 id="pss-faq" className="mb-8 font-display text-display-m font-medium">
          {copy.t('faq.title')}
        </h2>
        <Faq items={faqs} />
      </section>
    </>
  )
}
