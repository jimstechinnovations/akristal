'use client'

import { formatMoney } from '@/lib/format'
import { CountUp } from '@/components/motion/count-up'

/** CountUp needs a client-side formatter; this binds one to a currency. */
export function MoneyCountUp({ value, currency, className }: { value: number; currency: string; className?: string }) {
  return <CountUp value={value} format={(n) => formatMoney(Math.round(n), currency)} className={className} />
}
