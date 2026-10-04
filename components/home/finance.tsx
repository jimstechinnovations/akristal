import Link from 'next/link'
import { financeDefaults } from '@/config/site'
import { calculateMortgage } from '@/lib/finance/mortgage'
import { calculateInstallments } from '@/lib/finance/installment'
import { formatMoney } from '@/lib/format'
import { buttonClasses } from '@/components/ui/button'
import { MoneyCountUp } from './money-count-up'

export function Finance() {
  const d = financeDefaults.RWF
  const price = d.samplePrice
  const mortgage = calculateMortgage({ price, deposit: (price * d.depositPct) / 100, ratePct: d.rate, termYears: d.termYears })
  const plan = calculateInstallments({ price, depositPct: 30, months: 24, currency: 'RWF' })

  return (
    <section aria-labelledby="finance-title" className="border-y border-line section-y">
      <div className="page-x-wide">
        <div className="max-w-2xl">
          <h2 id="finance-title" className="font-display text-display-m font-medium">
            What a home costs each month
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Two ways to pay for a {formatMoney(price, 'RWF', { compact: true })} home: a bank mortgage, or our own Pay Small Small
            plan with no bank involved.
          </p>
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
              We help you prepare a bank application and guide you from approval to handover.
            </p>
            <div className="mt-auto pt-8">
              <Link href="/mortgage" className={buttonClasses({ variant: 'outline' })}>
                Work out your mortgage
              </Link>
            </div>
          </article>

          <article className="flex flex-col bg-surface p-6 sm:p-10">
            <h3 className="text-lg font-semibold">Pay Small Small</h3>
            <p className="mt-1 text-sm text-muted">30% deposit, then 24 monthly instalments</p>
            <p className="mt-8 text-[2.25rem] font-light leading-none tracking-tight sm:text-[3rem]">
              <MoneyCountUp value={plan.monthly} currency="RWF" />
            </p>
            <p className="mt-2 text-sm text-muted">per month, estimated</p>
            <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
              Pay Akristal directly in monthly instalments on selected homes and developments, without a bank loan.
            </p>
            <div className="mt-auto pt-8">
              <Link href="/pay-small-small" className={buttonClasses()}>
                See Pay Small Small plans
              </Link>
            </div>
          </article>
        </div>
        <p className="mt-4 text-xs text-muted">
          Estimates for illustration only, not a loan offer. Rates, deposits and terms depend on the lender or plan and are
          confirmed in writing.
        </p>
      </div>
    </section>
  )
}
