'use client'

import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { CURRENCY_LIST } from '@/config/currencies'
import { cn } from '@/lib/utils'
import { AS_LISTED, useCurrency } from './currency-provider'

const groups = ['Main', 'World', 'Africa'] as const
const groupLabel = { Main: 'Most used', World: 'World currencies', Africa: 'African currencies' }

/** Chooses the currency prices are shown in across the site. Hidden when no rates are available. */
export function CurrencyPicker({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { display, setDisplay, rates } = useCurrency()
  const id = useId()
  if (!rates) return null
  return (
    <div className={cn('relative inline-flex items-center', withLabel && 'grid gap-1.5', className)}>
      <label htmlFor={id} className={withLabel ? 'text-sm text-muted' : 'sr-only'}>
        Show prices in
      </label>
      <span className="relative inline-flex items-center">
        <select
          id={id}
          value={display}
          onChange={(e) => setDisplay(e.target.value)}
          className={cn(
            'h-10 cursor-pointer appearance-none rounded-sm border border-current/25 bg-transparent pl-3 pr-8 text-sm font-medium text-current outline-none transition-colors hover:border-current/60 focus-visible:ring-2 focus-visible:ring-accent',
            withLabel && 'w-full border-line-strong text-ink'
          )}
        >
          <option value={AS_LISTED} className="bg-surface text-ink">
            {withLabel ? 'As listed' : 'Currency'}
          </option>
          {groups.map((g) => (
            <optgroup key={g} label={groupLabel[g]} className="bg-surface text-ink">
              {CURRENCY_LIST.filter((c) => c.group === g && rates[c.code]).map((c) => (
                <option key={c.code} value={c.code} className="bg-surface text-ink">
                  {withLabel ? `${c.code}, ${c.name}` : c.code}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 size-4 opacity-70" />
      </span>
    </div>
  )
}
