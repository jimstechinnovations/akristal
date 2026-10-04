'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

/** Long text collapsed to a few lines with a toggle; short text renders as-is. */
export function ShowMore({ text, lines = 6, className }: { text: string; lines?: number; className?: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const long = text.length > 420 || text.split('\n').length > lines
  return (
    <div className={className}>
      <div
        id={id}
        className={cn('whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink/90', long && !open && 'line-clamp-6')}
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
          {open ? 'Show less' : 'Read the full description'}
        </button>
      )}
    </div>
  )
}
