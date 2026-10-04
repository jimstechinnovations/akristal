import { describe, expect, it } from 'vitest'
import {
  amortisationByYear,
  amortisationSchedule,
  calculateAffordability,
  calculateMortgage,
  monthlyPayment,
} from './mortgage'
import { calculateInstallments } from './installment'

describe('monthlyPayment', () => {
  it('matches the standard annuity formula (100,000 at 6% over 30 years)', () => {
    expect(monthlyPayment(100_000, 6, 360)).toBeCloseTo(599.55, 2)
  })

  it('divides evenly when the rate is zero', () => {
    expect(monthlyPayment(120_000, 0, 120)).toBe(1_000)
  })

  it('returns 0 for an empty loan or term', () => {
    expect(monthlyPayment(0, 10, 120)).toBe(0)
    expect(monthlyPayment(1_000, 10, 0)).toBe(0)
  })
})

describe('calculateMortgage', () => {
  it('derives loan, total paid and interest from price and deposit', () => {
    const r = calculateMortgage({ price: 120_000_000, deposit: 24_000_000, ratePct: 16, termYears: 20 })
    expect(r.loan).toBe(96_000_000)
    expect(r.months).toBe(240)
    expect(r.monthly).toBeCloseTo(monthlyPayment(96_000_000, 16, 240), 6)
    expect(r.totalPaid).toBeCloseTo(r.monthly * 240, 4)
    expect(r.totalInterest).toBeCloseTo(r.totalPaid - r.loan, 4)
  })

  it('caps the deposit at the price and never goes negative', () => {
    const r = calculateMortgage({ price: 50, deposit: 80, ratePct: 10, termYears: 5 })
    expect(r.loan).toBe(0)
    expect(r.monthly).toBe(0)
    expect(r.totalInterest).toBe(0)
  })

  it('treats non-finite input as zero', () => {
    const r = calculateMortgage({ price: Number.NaN, deposit: 0, ratePct: 10, termYears: 5 })
    expect(r.loan).toBe(0)
  })
})

describe('amortisationSchedule', () => {
  it('pays the loan off exactly and principal sums to the loan', () => {
    const rows = amortisationSchedule(250_000, 7.5, 180)
    expect(rows).toHaveLength(180)
    expect(rows.at(-1)!.balance).toBe(0)
    const principal = rows.reduce((s, r) => s + r.principal, 0)
    expect(principal).toBeCloseTo(250_000, 4)
  })

  it('front-loads interest', () => {
    const rows = amortisationSchedule(100_000, 12, 120)
    expect(rows[0].interest).toBeCloseTo(1_000, 6)
    expect(rows[0].interest).toBeGreaterThan(rows[119].interest)
  })

  it('groups months into years', () => {
    const years = amortisationByYear(amortisationSchedule(100_000, 12, 30))
    expect(years).toHaveLength(3)
    expect(years[2].balance).toBe(0)
  })
})

describe('calculateAffordability', () => {
  it('turns the allowed monthly repayment into a maximum price', () => {
    const r = calculateAffordability({
      monthlyIncome: 3_000_000,
      monthlyDebts: 250_000,
      deposit: 20_000_000,
      ratePct: 16,
      termYears: 20,
      debtToIncome: 0.35,
    })
    expect(r.maxMonthly).toBe(800_000)
    // Repaying the max loan must cost exactly the allowed monthly amount.
    expect(monthlyPayment(r.maxLoan, 16, 240)).toBeCloseTo(800_000, 2)
    expect(r.maxPrice).toBeCloseTo(r.maxLoan + 20_000_000, 4)
  })

  it('returns only the deposit when debts exceed the cap', () => {
    const r = calculateAffordability({
      monthlyIncome: 1_000,
      monthlyDebts: 900,
      deposit: 5_000,
      ratePct: 10,
      termYears: 10,
      debtToIncome: 0.35,
    })
    expect(r.maxLoan).toBe(0)
    expect(r.maxPrice).toBe(5_000)
  })
})

describe('calculateInstallments (Pay Small Small)', () => {
  const start = new Date(2026, 0, 31)

  it('splits the balance after deposit into equal whole-franc instalments', () => {
    const r = calculateInstallments({ price: 100_000_000, depositPct: 30, months: 12, currency: 'RWF', startDate: start })
    expect(r.deposit).toBe(30_000_000)
    expect(r.financed).toBe(70_000_000)
    expect(r.schedule).toHaveLength(12)
    expect(Number.isInteger(r.monthly)).toBe(true)
    const sum = r.schedule.reduce((s, row) => s + row.amount, 0)
    expect(sum).toBe(70_000_000)
    expect(r.schedule.at(-1)!.balanceAfter).toBe(0)
    expect(r.totalPayable).toBe(100_000_000)
  })

  it('absorbs rounding in the last instalment', () => {
    const r = calculateInstallments({ price: 1_000_000, depositPct: 0, months: 3, currency: 'RWF', startDate: start })
    expect(r.schedule.map((x) => x.amount)).toEqual([333_333, 333_333, 333_334])
  })

  it('applies a plan premium to the financed balance only', () => {
    const r = calculateInstallments({ price: 10_000, depositPct: 50, months: 10, premiumPct: 10, currency: 'USD', startDate: start })
    expect(r.premium).toBe(500)
    expect(r.financed).toBe(5_500)
    expect(r.totalPayable).toBe(10_500)
  })

  it('keeps month-end due dates valid (31 Jan → 28 Feb)', () => {
    const r = calculateInstallments({ price: 1_200, depositPct: 0, months: 2, currency: 'USD', startDate: start })
    expect(r.schedule[0].dueDate.getMonth()).toBe(1)
    expect(r.schedule[0].dueDate.getDate()).toBe(28)
    expect(r.schedule[1].dueDate.getDate()).toBe(31)
  })

  it('handles a zero-month plan without dividing by zero', () => {
    const r = calculateInstallments({ price: 1_000, depositPct: 20, months: 0 })
    expect(r.schedule).toHaveLength(0)
    expect(r.monthly).toBe(0)
  })
})
