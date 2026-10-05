'use client'

import { useId, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { financeDefaults, type CurrencyCode } from '@/config/site'
import { calculateMortgage } from '@/lib/finance/mortgage'
import { calculateInstallments } from '@/lib/finance/installment'
import { formatMoney, formatTenure } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { InstallmentPlan } from '@/lib/data/plans'
import { AnimatedNumber } from '@/components/motion/animated-number'
import { fieldClasses } from '@/components/ui/input'

type Tab = 'mortgage' | 'plan'

function Range({ label, value, min, max, step, onChange, display }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display: string }) {
  const id = useId()
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
        <span className="tabular text-sm font-medium">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[var(--c-primary)]"
      />
    </div>
  )
}

const NO_PLAN: InstallmentPlan = { id: '', name: '', description: null, minDepositPct: 30, maxDepositPct: 50, tenures: [12], premiumByTenure: {}, eligibility: [], termsUrl: null }

export function CostCalculator({ price, currency, plan: activePlan, className }: { price: number; currency: string; plan?: InstallmentPlan; className?: string }) {
  // Without an active Pay Small Small plan, only the mortgage tab is shown.
  const plan = activePlan ?? NO_PLAN
  const defaults = financeDefaults[(currency as CurrencyCode) in financeDefaults ? (currency as CurrencyCode) : 'USD']
  const [tab, setTab] = useState<Tab>('mortgage')
  const [depositPct, setDepositPct] = useState(defaults.depositPct)
  const [rate, setRate] = useState(defaults.rate)
  const [years, setYears] = useState(defaults.termYears)
  const [planDeposit, setPlanDeposit] = useState(plan.minDepositPct)
  const [months, setMonths] = useState(plan.tenures.includes(12) ? 12 : plan.tenures[0])

  const money = (n: number) => formatMoney(Math.round(n), currency)
  const mortgage = useMemo(
    () => calculateMortgage({ price, deposit: (price * depositPct) / 100, ratePct: rate, termYears: years }),
    [price, depositPct, rate, years]
  )
  const installments = useMemo(
    () => calculateInstallments({ price, depositPct: planDeposit, months, premiumPct: plan.premiumByTenure[String(months)] ?? 0, currency }),
    [price, planDeposit, months, plan.premiumByTenure, currency]
  )
  const interestShare = mortgage.totalPaid > 0 ? mortgage.totalInterest / mortgage.totalPaid : 0

  return (
    <section aria-labelledby="cost-title" className={cn('rounded-md border border-line', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <h2 id="cost-title" className="text-lg font-semibold">
          What it costs each month
        </h2>
        <div role="tablist" aria-label="Payment method" className="flex rounded-sm bg-page-alt p-1">
          {(
            [
              ['mortgage', 'Mortgage'],
              ...(activePlan ? ([['plan', 'Pay Small Small']] as const) : []),
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn('relative h-9 rounded-[3px] px-3.5 text-sm font-medium transition-colors', tab === value ? 'text-on-primary' : 'text-ink hover:text-ink/80')}
            >
              {tab === value && <motion.span layoutId="cost-tab" className="absolute inset-0 rounded-[3px] bg-primary" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 p-5 sm:p-6 md:grid-cols-[1fr_minmax(0,0.9fr)]">
        {tab === 'mortgage' ? (
          <>
            <div className="grid content-start gap-6">
              <p className="text-sm text-muted">
                Home price <span className="tabular font-medium text-ink">{money(price)}</span>
              </p>
              <Range label="Deposit" value={depositPct} min={0} max={90} step={5} onChange={setDepositPct} display={`${depositPct}%, ${money((price * depositPct) / 100)}`} />
              <Range label="Interest rate" value={rate} min={1} max={30} step={0.25} onChange={setRate} display={`${rate}% a year`} />
              <label className="grid gap-2 text-sm">
                Loan term
                <select value={years} onChange={(e) => setYears(Number(e.target.value))} className={cn(fieldClasses, 'h-10')}>
                  {[5, 10, 15, 20, 25, 30].map((y) => (
                    <option key={y} value={y}>
                      {y} years
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="rounded-md bg-page-alt p-5">
              <p className="text-sm text-muted">Estimated monthly payment</p>
              <p className="mt-2 text-[2rem] font-light leading-none tracking-tight">
                <AnimatedNumber value={mortgage.monthly} format={money} />
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                <motion.div className="h-full bg-primary" animate={{ width: `${(1 - interestShare) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
              <dl className="mt-3 grid gap-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-primary" /> Loan
                  </dt>
                  <dd className="tabular">{money(mortgage.loan)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-line" /> Total interest
                  </dt>
                  <dd className="tabular">{money(mortgage.totalInterest)}</dd>
                </div>
              </dl>
              <Link href={`/mortgage?price=${Math.round(price)}&currency=${currency}`} className="mt-5 inline-block text-sm font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                Full mortgage calculator
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="grid content-start gap-6">
              <p className="text-sm text-muted">
                Home price <span className="tabular font-medium text-ink">{money(price)}</span>
              </p>
              <Range
                label="Initial deposit"
                value={planDeposit}
                min={plan.minDepositPct}
                max={plan.maxDepositPct}
                step={5}
                onChange={setPlanDeposit}
                display={`${planDeposit}%, ${money(installments.deposit)}`}
              />
              <fieldset className="grid gap-2">
                <legend className="text-sm">Pay the balance over</legend>
                <div className="flex flex-wrap gap-2">
                  {plan.tenures.map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={months === m}
                      onClick={() => setMonths(m)}
                      className={cn(
                        'h-10 rounded-sm border px-4 text-sm transition-colors',
                        months === m ? 'border-primary bg-primary text-on-primary' : 'border-line-strong hover:border-ink'
                      )}
                    >
                      {formatTenure(m)}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="rounded-md bg-page-alt p-5">
              <p className="text-sm text-muted">Estimated monthly instalment</p>
              <p className="mt-2 text-[2rem] font-light leading-none tracking-tight">
                <AnimatedNumber value={installments.monthly} format={money} />
              </p>
              <dl className="mt-5 grid gap-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt>Deposit today</dt>
                  <dd className="tabular">{money(installments.deposit)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{months} instalments</dt>
                  <dd className="tabular">{money(installments.financed)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-line pt-1.5 font-medium">
                  <dt>Total</dt>
                  <dd className="tabular">{money(installments.totalPayable)}</dd>
                </div>
              </dl>
              <Link
                href={`/pay-small-small?price=${Math.round(price)}&currency=${currency}&deposit=${planDeposit}&months=${months}`}
                className="mt-5 inline-block text-sm font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink"
              >
                See the payment schedule
              </Link>
            </div>
          </>
        )}
      </div>
      <p className="border-t border-line px-5 py-3 text-xs text-muted sm:px-6">
        Estimate only, not a loan offer.{' '}
        Your lender or Pay Small Small agreement sets the final figures.
      </p>
    </section>
  )
}
