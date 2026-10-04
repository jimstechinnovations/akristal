'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '@/components/motion/animated-number'

type Tier = { name: string; share: number; requirement: string }

export function EarningsEstimator({ commissionPct, tiers, placeholder }: { commissionPct: number; tiers: Tier[]; placeholder: boolean }) {
  const [sales, setSales] = useState(6)
  const [price, setPrice] = useState(120_000_000)
  const [tier, setTier] = useState(0)
  const yearly = sales * price * (commissionPct / 100) * (tiers[tier].share / 100)
  const money = (n: number) => formatMoney(Math.round(n), 'RWF')

  return (
    <div className="grid gap-8 rounded-md border border-line p-6 md:grid-cols-2 md:p-8">
      <div className="grid content-start gap-6">
        <label className="grid gap-2">
          <span className="flex justify-between text-sm">
            Sales a year <span className="tabular font-medium">{sales}</span>
          </span>
          <input type="range" min={1} max={30} value={sales} onChange={(e) => setSales(Number(e.target.value))} className="accent-[var(--c-primary)]" />
        </label>
        <label className="grid gap-2">
          <span className="flex justify-between text-sm">
            Average sale price <span className="tabular font-medium">{formatMoney(price, 'RWF', { compact: true })}</span>
          </span>
          <input type="range" min={20_000_000} max={600_000_000} step={10_000_000} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="accent-[var(--c-primary)]" />
        </label>
        <fieldset className="grid gap-2">
          <legend className="text-sm">Your level</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {tiers.map((t, i) => (
              <button
                key={t.name}
                type="button"
                aria-pressed={tier === i}
                onClick={() => setTier(i)}
                className={cn('rounded-sm border px-3 py-2.5 text-left text-sm transition-colors', tier === i ? 'border-primary bg-primary text-on-primary' : 'border-line-strong hover:border-ink')}
              >
                <span className="block font-medium">{t.name}</span>
                <span className={cn('block text-xs', tier === i ? 'opacity-80' : 'text-muted')}>{t.share}% of commission</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="flex flex-col justify-center rounded-md bg-page-alt p-6">
        <p className="text-sm text-muted">Your estimated earnings a year</p>
        <p className="mt-2 text-[2.25rem] font-light leading-none tracking-tight">
          <AnimatedNumber value={yearly} format={money} />
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {sales} sales × {formatMoney(price, 'RWF', { compact: true })} × {commissionPct}% commission × your {tiers[tier].share}% share.
        </p>
        <p className="mt-4 text-xs text-muted">
          {placeholder ? 'Sample figures for illustration. ' : ''}Your agent agreement sets the actual commission and split.
        </p>
      </div>
    </div>
  )
}
