'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

/** Long text collapsed to a few lines with a toggle; short text renders as-is. */
export function ShowMore({
  text,
  lines = 6,
  threshold = 420,
  moreLabel = 'Read the full description',
  lessLabel = 'Show less',
  className,
  textClassName,
}: {
  text: string
  lines?: 3 | 4 | 6
  /** Characters before the text is collapsed */
  threshold?: number
  moreLabel?: string
  lessLabel?: string
  className?: string
  textClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const long = text.length > threshold || text.split('\n').length > lines
  const clamp = { 3: 'line-clamp-3', 4: 'line-clamp-4', 6: 'line-clamp-6' }[lines]
  return (
    <div className={className}>
      <div
        id={id}
        className={cn('whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink/90', textClassName, long && !open && clamp)}
      >
        {text}
      </div>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="mt-3 text-sm font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink"
        >
          {open ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  )
}
