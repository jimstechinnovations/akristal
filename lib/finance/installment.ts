// Pay Small Small: Akristal's in-house installment plan. Pure maths, estimates only.

import { minorUnits } from '@/lib/format'

export interface InstallmentInput {
  price: number
  /** Initial deposit as a percent of price, e.g. 30 */
  depositPct: number
  months: number
  /** Optional plan premium on the financed balance, in percent (0 when the plan is interest-free) */
  premiumPct?: number
  currency?: string
  /** First instalment falls one month after this date */
  startDate?: Date
}

export interface InstallmentRow {
  number: number
  dueDate: Date
  amount: number
  balanceAfter: number
}

export interface InstallmentResult {
  deposit: number
  financed: number
  premium: number
  monthly: number
  totalPayable: number
  schedule: InstallmentRow[]
}

function roundTo(n: number, decimals: number) {
  const f = Math.pow(10, decimals)
  return Math.round(n * f) / f
}

function addMonths(date: Date, months: number) {
  const d = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(date.getDate(), lastDay))
  return d
}

/**
 * Instalments are rounded to the currency's minor unit; the final instalment absorbs
 * the rounding remainder so the schedule always sums exactly to the financed amount.
 */
export function calculateInstallments(input: InstallmentInput): InstallmentResult {
  const decimals = minorUnits(input.currency ?? 'RWF')
  const price = Math.max(0, input.price || 0)
  const depositPct = Math.min(100, Math.max(0, input.depositPct || 0))
  const months = Math.max(0, Math.round(input.months || 0))
  const deposit = roundTo((price * depositPct) / 100, decimals)
  const balance = price - deposit
  const premium = roundTo((balance * Math.max(0, input.premiumPct ?? 0)) / 100, decimals)
  const financed = balance + premium

  const schedule: InstallmentRow[] = []
  let monthly = 0
  if (months > 0 && financed > 0) {
    monthly = roundTo(financed / months, decimals)
    const start = input.startDate ?? new Date()
    let remaining = financed
    for (let i = 1; i <= months; i++) {
      const amount = i === months ? roundTo(remaining, decimals) : monthly
      remaining = roundTo(remaining - amount, decimals)
      schedule.push({ number: i, dueDate: addMonths(start, i), amount, balanceAfter: Math.max(0, remaining) })
    }
  }

  return { deposit, financed, premium, monthly, totalPayable: deposit + financed, schedule }
}
