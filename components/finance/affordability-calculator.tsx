'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { affordabilityDebtToIncome, financeDefaults, type CurrencyCode } from '@/config/site'
import { calculateAffordability } from '@/lib/finance/mortgage'
import { formatMoney } from '@/lib/format'
import { AnimatedNumber } from '@/components/motion/animated-number'
import { CurrencySelect, EstimateNote, MoneyInput } from './inputs'

export function AffordabilityCalculator() {
  const [currency, setCurrency] = useState('RWF')
  const d = financeDefaults[(currency in financeDefaults ? currency : 'RWF') as CurrencyCode]
  const [income, setIncome] = useState(3_000_000)
  const [debts, setDebts] = useState(0)
  const [deposit, setDeposit] = useState(20_000_000)
  const r = useMemo(
    () => calculateAffordability({ monthlyIncome: income, monthlyDebts: debts, deposit, ratePct: d.rate, termYears: d.termYears, debtToIncome: affordabilityDebtToIncome }),
    [income, debts, deposit, d.rate, d.termYears]
  )
  const money = (n: number) => formatMoney(Math.round(n), currency)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="grid min-w-0 grid-cols-1 content-start gap-5">
        <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
          <MoneyInput label="Household income a month (before tax)" value={income} onChange={setIncome} currency={currency} />
          <CurrencySelect value={currency} onChange={setCurrency} />
        </div>
        <MoneyInput label="Loan and card repayments a month" value={debts} onChange={setDebts} currency={currency} hint="Car loans, other mortgages, credit cards." />
        <MoneyInput label="Deposit you have saved" value={deposit} onChange={setDeposit} currency={currency} />
      </div>
      <div className="rounded-md bg-page-alt p-6 sm:p-8">
        <p className="text-sm text-muted">You could afford a home of about</p>
        <p className="mt-2 text-[2.125rem] font-light leading-none tracking-tight sm:text-[2.75rem]">
          <AnimatedNumber value={r.maxPrice} format={money} />
        </p>
        <dl className="mt-6 grid gap-2 text-[0.9375rem]">
          <div className="flex justify-between gap-4">
            <dt>Monthly repayment within budget</dt>
            <dd className="tabular">{money(r.maxMonthly)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Loan you may qualify for</dt>
            <dd className="tabular">{money(r.maxLoan)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted">
          Assumes debts stay under {Math.round(affordabilityDebtToIncome * 100)}% of income, {d.rate}% interest and a {d.termYears}-year term.
        </p>
        {r.maxPrice > 0 && (
          <Link
            href={`/properties?currency=${currency}&maxPrice=${Math.round(r.maxPrice)}`}
            className="mt-6 inline-flex border-b border-line-strong pb-0.5 text-[0.9375rem] font-medium hover:border-ink"
          >
            See homes in your budget
          </Link>
        )}
        <div className="mt-6">
          <EstimateNote />
        </div>
      </div>
    </div>
  )
}
