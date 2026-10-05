'use client'

import { QUICK_CURRENCIES } from '@/config/currencies'
import { formatMoney } from '@/lib/format'
import { convert, roundApprox } from '@/lib/currency'
import { AS_LISTED, useCurrency } from './currency-provider'

/**
 * A price in the visitor's chosen currency. Converted figures are marked "≈" and keep
 * the listed price in the tooltip; with no rates, the listed price shows unchanged.
 */
export function Price({
  amount,
  currency,
  compact,
  className,
}: {
  amount: number | null | undefined
  currency: string | null | undefined
  compact?: boolean
  className?: string
}) {
  const { display, rates } = useCurrency()
  const from = (currency || 'RWF').toUpperCase()
  const listed = formatMoney(amount, from, { compact })
  if (amount == null || display === AS_LISTED || display === from) return <span className={className}>{listed}</span>
  const converted = convert(amount, from, display, rates)
  if (converted == null) return <span className={className}>{listed}</span>
  return (
    <span className={className} title={`Listed at ${formatMoney(amount, from)}`}>
      <span aria-hidden>≈ </span>
      <span className="sr-only">About </span>
      {formatMoney(roundApprox(converted), display, { compact })}
    </span>
  )
}

/** "About USD 1.63M, NGN 2.5B, RWF 2.36B" under a listing price: the three currencies buyers ask for most. */
export function QuickConversions({ amount, currency, className }: { amount: number | null | undefined; currency: string; className?: string }) {
  const { rates } = useCurrency()
  if (amount == null || !rates) return null
  const items = QUICK_CURRENCIES.filter((c) => c !== currency.toUpperCase())
    .map((c) => {
      const v = convert(amount, currency.toUpperCase(), c, rates)
      return v == null ? null : formatMoney(roundApprox(v), c, { compact: true })
    })
    .filter(Boolean)
  if (!items.length) return null
  return (
    <p className={className}>
      About {items.join(', ')} <span className="opacity-75">at today&apos;s rates</span>
    </p>
  )
}
