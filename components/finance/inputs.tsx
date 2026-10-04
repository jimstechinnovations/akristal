'use client'

import { useId, useState } from 'react'
import { currencies } from '@/config/site'
import { cn } from '@/lib/utils'
import { fieldClasses } from '@/components/ui/input'

/** Number input that shows thousands separators while typing and reports a plain number. */
export function MoneyInput({
  label,
  value,
  onChange,
  currency,
  hint,
  className,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  currency?: string
  hint?: string
  className?: string
}) {
  const id = useId()
  const [text, setText] = useState(value ? value.toLocaleString('en') : '')
  const [lastValue, setLastValue] = useState(value)
  // Keep the text in step when the value changes from outside (e.g. a linked slider).
  if (value !== lastValue) {
    setLastValue(value)
    setText(value ? value.toLocaleString('en') : '')
  }
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <div className="relative">
        {currency && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">{currency}</span>}
        <input
          id={id}
          inputMode="numeric"
          value={text}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, '')
            const n = digits ? Number(digits) : 0
            setText(digits ? n.toLocaleString('en') : '')
            setLastValue(n)
            onChange(n)
          }}
          className={cn(fieldClasses, 'tabular', currency && 'pl-14')}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

export function CurrencySelect({ value, onChange, className }: { value: string; onChange: (c: string) => void; className?: string }) {
  const id = useId()
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-sm">
        Currency
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClasses}>
        {currencies.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </div>
  )
}

export function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display: string
}) {
  const id = useId()
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
        <span className="tabular text-sm font-medium">{display}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-[var(--c-primary)]" />
    </div>
  )
}

/** Explicit label so no figure is ever read as an offer. */
export function EstimateNote({ children }: { children?: React.ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-muted">
      <strong className="font-medium text-ink">Estimate only, not a loan offer.</strong> {children ?? 'Your lender sets the final rate, deposit and term after assessing your application.'}
    </p>
  )
}
