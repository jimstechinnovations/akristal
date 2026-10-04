// Pure mortgage maths. All results are estimates for display, not lender quotes.

export interface MortgageInput {
  price: number
  deposit: number
  /** Annual interest rate in percent, e.g. 16 for 16% */
  ratePct: number
  termYears: number
}

export interface MortgageResult {
  loan: number
  months: number
  monthly: number
  totalInterest: number
  totalPaid: number
}

export interface AmortisationRow {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export interface AmortisationYear {
  year: number
  principal: number
  interest: number
  balance: number
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const finite = (n: number) => (Number.isFinite(n) ? n : 0)

/** Level monthly payment for a fully amortising loan. Zero rate → straight division. */
export function monthlyPayment(principal: number, ratePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const r = ratePct / 100 / 12
  if (r === 0) return principal / months
  return (principal * r) / (1 - Math.pow(1 + r, -months))
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const price = Math.max(0, finite(input.price))
  const deposit = clamp(finite(input.deposit), 0, price)
  const months = Math.max(0, Math.round(finite(input.termYears) * 12))
  const loan = price - deposit
  const monthly = monthlyPayment(loan, Math.max(0, finite(input.ratePct)), months)
  const totalPaid = monthly * months
  return { loan, months, monthly, totalInterest: Math.max(0, totalPaid - loan), totalPaid }
}

/** Month-by-month schedule. The final row clears any floating-point remainder. */
export function amortisationSchedule(loan: number, ratePct: number, months: number): AmortisationRow[] {
  const rows: AmortisationRow[] = []
  if (loan <= 0 || months <= 0) return rows
  const r = ratePct / 100 / 12
  const payment = monthlyPayment(loan, ratePct, months)
  let balance = loan
  for (let m = 1; m <= months; m++) {
    const interest = balance * r
    let principal = payment - interest
    if (m === months) principal = balance
    balance = Math.max(0, balance - principal)
    rows.push({ month: m, payment: principal + interest, principal, interest, balance })
  }
  return rows
}

export function amortisationByYear(rows: AmortisationRow[]): AmortisationYear[] {
  const years: AmortisationYear[] = []
  for (const row of rows) {
    const y = Math.ceil(row.month / 12)
    const current = years[y - 1] ?? (years[y - 1] = { year: y, principal: 0, interest: 0, balance: 0 })
    current.principal += row.principal
    current.interest += row.interest
    current.balance = row.balance
  }
  return years
}

export interface AffordabilityInput {
  monthlyIncome: number
  monthlyDebts: number
  deposit: number
  ratePct: number
  termYears: number
  /** Share of gross income allowed for all debt, e.g. 0.35 */
  debtToIncome: number
}

export interface AffordabilityResult {
  maxMonthly: number
  maxLoan: number
  maxPrice: number
}

/** Largest price whose repayment fits within the debt-to-income cap. */
export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const maxMonthly = Math.max(0, finite(input.monthlyIncome) * input.debtToIncome - finite(input.monthlyDebts))
  const months = Math.round(finite(input.termYears) * 12)
  const r = Math.max(0, finite(input.ratePct)) / 100 / 12
  let maxLoan = 0
  if (maxMonthly > 0 && months > 0) {
    maxLoan = r === 0 ? maxMonthly * months : (maxMonthly * (1 - Math.pow(1 + r, -months))) / r
  }
  const deposit = Math.max(0, finite(input.deposit))
  return { maxMonthly, maxLoan, maxPrice: maxLoan + deposit }
}
