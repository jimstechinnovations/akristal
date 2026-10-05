// Currency maths shared by server and client code.

/** Converts through the US dollar. Null when either rate is missing. */
export function convert(amount: number, from: string, to: string, rates: Record<string, number> | null) {
  if (from === to) return amount
  const a = rates?.[from]
  const b = rates?.[to]
  if (!a || !b) return null
  return (amount / a) * b
}

/** Converted prices are approximate, so keep three significant figures: 1,634,512 → 1,630,000. */
export function roundApprox(n: number) {
  if (n === 0) return 0
  const digits = Math.floor(Math.log10(Math.abs(n))) + 1
  const f = Math.pow(10, Math.max(0, digits - 3))
  return Math.round(n / f) * f
}
