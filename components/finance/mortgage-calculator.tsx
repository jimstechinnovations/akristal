'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { financeDefaults, type CurrencyCode } from '@/config/site'
import { amortisationByYear, amortisationSchedule, calculateMortgage } from '@/lib/finance/mortgage'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '@/components/motion/animated-number'
import { fieldClasses } from '@/components/ui/input'
import { CurrencySelect, EstimateNote, MoneyInput, RangeField } from './inputs'

const defaultsFor = (c: string) => financeDefaults[(c in financeDefaults ? c : 'RWF') as CurrencyCode]

export function MortgageCalculator({ initialPrice, initialCurrency = 'RWF' }: { initialPrice?: number; initialCurrency?: string }) {
  const [currency, setCurrency] = useState(initialCurrency)
  const d = defaultsFor(currency)
  const [price, setPrice] = useState(initialPrice ?? d.samplePrice)
  const [depositPct, setDepositPct] = useState(d.depositPct)
  const [rate, setRate] = useState(d.rate)
  const [years, setYears] = useState(d.termYears)
  const [view, setView] = useState<'year' | 'month'>('year')

  const deposit = Math.round((price * depositPct) / 100)
  const result = useMemo(() => calculateMortgage({ price, deposit, ratePct: rate, termYears: years }), [price, deposit, rate, years])
  const rows = useMemo(() => amortisationSchedule(result.loan, rate, result.months), [result.loan, rate, result.months])
  const yearly = useMemo(() => amortisationByYear(rows), [rows])
  const money = (n: number) => formatMoney(Math.round(n), currency)
  const principalShare = result.totalPaid ? result.loan / result.totalPaid : 1

  function changeCurrency(c: string) {
    // Switching currency loads that market's typical figures; the price is in a different unit.
    const nd = defaultsFor(c)
    setCurrency(c)
    setPrice(nd.samplePrice)
    setRate(nd.rate)
    setYears(nd.termYears)
    setDepositPct(nd.depositPct)
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="grid min-w-0 grid-cols-1 content-start gap-6">
        <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
          <MoneyInput label="Home price" value={price} onChange={setPrice} currency={currency} />
          <CurrencySelect value={currency} onChange={changeCurrency} />
        </div>
        <RangeField label="Deposit" value={depositPct} min={0} max={90} step={1} onChange={setDepositPct} display={`${depositPct}%, ${money(deposit)}`} />
        <RangeField label="Interest rate" value={rate} min={1} max={35} step={0.25} onChange={setRate} display={`${rate}% a year`} />
        <label className="grid gap-1.5 text-sm">
          Loan term
          <select value={years} onChange={(e) => setYears(Number(e.target.value))} className={fieldClasses}>
            {[5, 10, 15, 20, 25, 30].map((y) => (
              <option key={y} value={y}>
                {y} years
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-muted">Starting figures are typical for {currency} mortgages; change them to match your bank&apos;s offer.</p>
      </div>

      <div className="rounded-md border border-line p-6 sm:p-8">
        <p className="text-sm text-muted">Monthly payment</p>
        <p className="mt-2 text-[2.125rem] font-light leading-none tracking-tight sm:text-[2.75rem]">
          <AnimatedNumber value={result.monthly} format={money} />
        </p>
        <div className="mt-6 flex h-3 overflow-hidden rounded-full" aria-hidden>
          <motion.div className="bg-primary" animate={{ width: `${principalShare * 100}%` }} transition={{ duration: 0.4 }} />
          <div className="flex-1 bg-accent/60" />
        </div>
        <dl className="mt-4 grid gap-2 text-[0.9375rem]">
          {[
            ['Loan amount', result.loan, 'bg-primary'],
            ['Total interest', result.totalInterest, 'bg-accent/60'],
            ['Total you repay', result.totalPaid, ''],
            ['Deposit', deposit, ''],
          ].map(([label, value, dot]) => (
            <div key={label as string} className="flex justify-between gap-4 border-b border-line py-2 last:border-0">
              <dt className="flex items-center gap-2">
                {dot && <span className={cn('size-2.5 rounded-full', dot as string)} />}
                {label as string}
              </dt>
              <dd className="tabular">{money(value as number)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6">
          <EstimateNote />
        </div>
      </div>

      <details className="group rounded-md border border-line lg:col-span-2">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium [&::-webkit-details-marker]:hidden">
          Repayment schedule
          <span className="text-sm text-muted group-open:hidden">Show</span>
          <span className="hidden text-sm text-muted group-open:inline">Hide</span>
        </summary>
        <div className="border-t border-line px-5 pb-5">
          <div role="tablist" aria-label="Schedule detail" className="my-4 flex gap-2">
            {(['year', 'month'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn('h-9 rounded-sm px-3 text-sm', view === v ? 'bg-primary text-on-primary' : 'border border-line-strong')}
              >
                {v === 'year' ? 'By year' : 'By month'}
              </button>
            ))}
          </div>
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full min-w-[520px] text-right text-sm">
              <thead className="sticky top-0 bg-surface text-muted">
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 text-left font-normal">{view === 'year' ? 'Year' : 'Month'}</th>
                  <th className="py-2 pr-4 font-normal">Principal</th>
                  <th className="py-2 pr-4 font-normal">Interest</th>
                  <th className="py-2 font-normal">Balance</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {(view === 'year' ? yearly.map((y) => ({ key: y.year, ...y })) : rows.map((r) => ({ key: r.month, ...r }))).map((r) => (
                  <tr key={r.key} className="border-b border-line">
                    <td className="py-2 pr-4 text-left">{r.key}</td>
                    <td className="py-2 pr-4">{money(r.principal)}</td>
                    <td className="py-2 pr-4">{money(r.interest)}</td>
                    <td className="py-2">{money(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  )
}
