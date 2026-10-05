import Link from 'next/link'
import { financeDefaults } from '@/config/site'
import { calculateMortgage } from '@/lib/finance/mortgage'
import { calculateInstallments } from '@/lib/finance/installment'
import { formatMoney, formatTenure } from '@/lib/format'
import type { InstallmentPlan } from '@/lib/data/plans'
import type { Copy } from '@/lib/data/copy'
import { buttonClasses } from '@/components/ui/button'
import { MoneyCountUp } from './money-count-up'
import { BlueprintVilla } from '@/components/illustrations/blueprint-villa'

export function Finance({ plan: activePlan, copy }: { plan?: InstallmentPlan; copy: Copy }) {
  const d = financeDefaults.RWF
  const price = d.samplePrice
  const mortgage = calculateMortgage({ price, deposit: (price * d.depositPct) / 100, ratePct: d.rate, termYears: d.termYears })
  // Example from the live plan: a 30% deposit (within the plan's range) over three years, or the longest term offered.
  const tenures = activePlan?.tenures.length ? activePlan.tenures : [24]
  const depositPct = Math.min(activePlan?.maxDepositPct ?? 30, Math.max(activePlan?.minDepositPct ?? 30, 30))
  const months = tenures.includes(36) ? 36 : Math.max(...tenures)
  const plan = calculateInstallments({ price, depositPct, months, currency: 'RWF' })

  return (
    <section aria-labelledby="finance-title" className="relative isolate overflow-hidden border-y border-line section-y">
      <div className="page-x-wide">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,460px)]">
        <div className="max-w-2xl">
          <h2 id="finance-title" className="font-display text-display-m font-medium">
            {copy.t('finance.title')}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            {copy.t('finance.intro', { price: formatMoney(price, 'RWF', { compact: true }) })}
          </p>
        </div>
          {/* Architect's elevation: the home these numbers pay for. */}
          <BlueprintVilla className="hidden w-full text-line-art opacity-60 lg:block dark:opacity-50" />
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
          <article className="flex flex-col bg-surface p-6 sm:p-10">
            <h3 className="text-lg font-semibold">Mortgage</h3>
            <p className="mt-1 text-sm text-muted">
              {d.depositPct}% deposit, {d.rate}% interest, {d.termYears} years
            </p>
            <p className="mt-8 text-[2.25rem] font-light leading-none tracking-tight sm:text-[3rem]">
              <MoneyCountUp value={mortgage.monthly} currency="RWF" />
            </p>
            <p className="mt-2 text-sm text-muted">per month, estimated</p>
            <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
              {copy.t('finance.mortgageText')}
            </p>
            <div className="mt-auto pt-8">
              <Link href="/mortgage" className={buttonClasses({ variant: 'outline' })}>
                {copy.t('finance.mortgageCta')}
              </Link>
            </div>
          </article>

          <article className="flex flex-col bg-surface p-6 sm:p-10">
            <h3 className="text-lg font-semibold">Pay Small Small</h3>
            <p className="mt-1 text-sm text-muted">
              {depositPct}% deposit, then monthly over {formatTenure(months)}
            </p>
            <p className="mt-8 text-[2.25rem] font-light leading-none tracking-tight sm:text-[3rem]">
              <MoneyCountUp value={plan.monthly} currency="RWF" />
            </p>
            <p className="mt-2 text-sm text-muted">per month, estimated</p>
            <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
              {copy.t('finance.planText', { minDeposit: activePlan?.minDepositPct ?? depositPct, longest: formatTenure(Math.max(...tenures)) })}
            </p>
            <div className="mt-auto pt-8">
              <Link href="/pay-small-small" className={buttonClasses()}>
                {copy.t('finance.planCta')}
              </Link>
            </div>
          </article>
        </div>
        <p className="mt-4 text-xs text-muted">
          {copy.t('finance.disclaimer')}
        </p>
      </div>
    </section>
  )
}
