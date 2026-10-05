'use client'

import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import type { InstallmentPlan } from '@/lib/data/plans'
import { calculateInstallments } from '@/lib/finance/installment'
import { formatDate, formatMoney, formatTenure } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '@/components/motion/animated-number'
import { Button } from '@/components/ui/button'
import { CurrencySelect, MoneyInput, RangeField } from './inputs'

export function InstallmentPlanner({
  plan,
  initialPrice = 100_000_000,
  initialCurrency = 'RWF',
  initialDeposit,
  initialMonths,
}: {
  plan: InstallmentPlan
  initialPrice?: number
  initialCurrency?: string
  initialDeposit?: number
  initialMonths?: number
}) {
  const [price, setPrice] = useState(initialPrice)
  const [currency, setCurrency] = useState(initialCurrency)
  const [depositPct, setDepositPct] = useState(Math.min(plan.maxDepositPct, Math.max(plan.minDepositPct, initialDeposit ?? plan.minDepositPct)))
  const [useBank, setUseBank] = useState(false)
  const [bankAmount, setBankAmount] = useState(0)
  const [months, setMonths] = useState(initialMonths && plan.tenures.includes(initialMonths) ? initialMonths : plan.tenures[Math.min(1, plan.tenures.length - 1)])
  // Fixed once per visit so the schedule doesn't shift while someone is reading it.
  const [start] = useState(() => new Date())
  const premiumPct = plan.premiumByTenure[String(months)] ?? 0

  const r = useMemo(
    () => calculateInstallments({ price, depositPct, months, premiumPct, bankAmount: useBank ? bankAmount : 0, currency, startDate: start }),
    [price, depositPct, months, premiumPct, useBank, bankAmount, currency, start]
  )
  const money = (n: number) => formatMoney(n, currency)

  function downloadCsv() {
    const lines = [
      ['Payment', 'Due date', `Amount (${currency})`, `Balance after (${currency})`],
      ['Deposit', start.toISOString().slice(0, 10), String(r.deposit), String(r.financed + r.bank)],
      ...(r.bank > 0 ? [['Bank loan', 'At completion', String(r.bank), String(r.financed)]] : []),
      ...r.schedule.map((row) => [String(row.number), row.dueDate.toISOString().slice(0, 10), String(row.amount), String(row.balanceAfter)]),
    ]
    const blob = new Blob([lines.map((l) => l.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `pay-small-small-${months}-months.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="grid min-w-0 grid-cols-1 content-start gap-6">
          <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
            <MoneyInput label="Property price" value={price} onChange={setPrice} currency={currency} />
            <CurrencySelect value={currency} onChange={setCurrency} />
          </div>
          <RangeField
            label="Initial deposit"
            value={depositPct}
            min={plan.minDepositPct}
            max={plan.maxDepositPct}
            step={5}
            onChange={setDepositPct}
            display={`${depositPct}%, ${money(r.deposit)}`}
          />
          <fieldset className="grid gap-2">
            <legend className="text-sm">Spread the balance over</legend>
            <div className="flex flex-wrap gap-2">
              {plan.tenures.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={months === m}
                  onClick={() => setMonths(m)}
                  className={cn('h-10 rounded-sm border px-4 text-sm transition-colors', months === m ? 'border-primary bg-primary text-on-primary' : 'border-line-strong hover:border-ink')}
                >
                  {formatTenure(m)}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="text-sm text-muted">
            Deposit from {plan.minDepositPct}% to {plan.maxDepositPct}%, paid over {formatTenure(Math.min(...plan.tenures))} to{' '}
            {formatTenure(Math.max(...plan.tenures))}.
          </p>
          <div className="grid gap-3 rounded-md border border-line p-4">
            <label className="flex items-start gap-3 text-[0.9375rem]">
              <input type="checkbox" checked={useBank} onChange={(e) => setUseBank(e.target.checked)} className="mt-1 size-4 accent-[var(--c-primary)]" />
              <span>
                My bank can lend me part of the price
                <span className="block text-sm text-muted">Akristal works with your bank: the loan covers part of the balance, Pay Small Small covers the rest.</span>
              </span>
            </label>
            {useBank && <MoneyInput label="Amount from your bank" value={bankAmount} onChange={setBankAmount} currency={currency} />}
          </div>
        </div>

        <div className="rounded-md bg-brand p-6 text-white sm:p-8">
          <p className="text-sm text-white/70">Monthly instalment</p>
          <p className="mt-2 text-[2.125rem] font-light leading-none tracking-tight sm:text-[2.75rem]">
            <AnimatedNumber value={r.monthly} format={money} />
          </p>
          <p className="mt-2 text-sm text-white/70">for {formatTenure(months)}</p>
          <dl className="mt-8 grid gap-2 text-[0.9375rem]">
            <div className="flex justify-between gap-4 border-b border-white/15 pb-2">
              <dt>Deposit today</dt>
              <dd className="tabular">{money(r.deposit)}</dd>
            </div>
            {r.bank > 0 && (
              <div className="flex justify-between gap-4 border-b border-white/15 pb-2">
                <dt>From your bank</dt>
                <dd className="tabular">{money(r.bank)}</dd>
              </div>
            )}
            {r.premium > 0 && (
              <div className="flex justify-between gap-4 border-b border-white/15 pb-2">
                <dt>Plan premium ({premiumPct}%)</dt>
                <dd className="tabular">{money(r.premium)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-b border-white/15 pb-2">
              <dt>Paid in instalments</dt>
              <dd className="tabular">{money(r.financed)}</dd>
            </div>
            <div className="flex justify-between gap-4 font-medium">
              <dt>Total you pay</dt>
              <dd className="tabular">{money(r.totalPayable)}</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs leading-relaxed text-white/70">
            <strong className="font-medium text-white">Estimate only.</strong>{' '}
            Your signed agreement sets the final amounts and dates.
          </p>
        </div>
      </div>

      <section aria-labelledby="schedule-title" className="rounded-md border border-line">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h3 id="schedule-title" className="font-semibold">
            Payment schedule
          </h3>
          <Button variant="outline" size="sm" onClick={downloadCsv}>
            <Download aria-hidden className="size-4" /> Download (CSV)
          </Button>
        </div>
        <div className="max-h-[440px] overflow-auto px-5">
          <table className="w-full min-w-[480px] text-right text-sm">
            <thead className="sticky top-0 bg-surface text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-4 text-left font-normal">Payment</th>
                <th className="py-2 pr-4 text-left font-normal">Due</th>
                <th className="py-2 pr-4 font-normal">Amount</th>
                <th className="py-2 font-normal">Balance after</th>
              </tr>
            </thead>
            <tbody className="tabular">
              <tr className="border-b border-line">
                <td className="py-2.5 pr-4 text-left font-medium">Deposit</td>
                <td className="py-2.5 pr-4 text-left">On signing</td>
                <td className="py-2.5 pr-4">{money(r.deposit)}</td>
                <td className="py-2.5">{money(r.financed + r.bank)}</td>
              </tr>
              {r.bank > 0 && (
                <tr className="border-b border-line">
                  <td className="py-2.5 pr-4 text-left font-medium">Bank loan</td>
                  <td className="py-2.5 pr-4 text-left">Agreed with your bank</td>
                  <td className="py-2.5 pr-4">{money(r.bank)}</td>
                  <td className="py-2.5">{money(r.financed)}</td>
                </tr>
              )}
              {r.schedule.map((row) => (
                <tr key={row.number} className="border-b border-line">
                  <td className="py-2.5 pr-4 text-left">{row.number}</td>
                  <td className="py-2.5 pr-4 text-left">{formatDate(row.dueDate, 'short')}</td>
                  <td className="py-2.5 pr-4">{money(row.amount)}</td>
                  <td className="py-2.5">{money(row.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
