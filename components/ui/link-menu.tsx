'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LinkMenuGroup = { heading?: string; links: { href: string; label: string; meta?: string }[] }

/** A trigger that opens a short list of links (hero quick filters, filter shortcuts). */
export function LinkMenu({
  label,
  caption,
  groups,
  placement = 'bottom',
  tone = 'default',
  className,
  triggerClassName,
}: {
  label: string
  caption?: string
  groups: LinkMenuGroup[]
  placement?: 'top' | 'bottom'
  tone?: 'default' | 'light'
  className?: string
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector<HTMLButtonElement>('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={cn('flex w-full items-end justify-between gap-6 text-left', triggerClassName)}
      >
        <span className="flex flex-col">
          {caption && (
            <span className={cn('font-display text-sm italic', tone === 'light' ? 'text-white/75' : 'text-muted')}>{caption}</span>
          )}
          <span className="text-[0.9375rem] font-medium">{label}</span>
        </span>
        <ChevronDown aria-hidden className={cn('mb-0.5 size-4 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: placement === 'top' ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: placement === 'top' ? 6 : -6 }}
            transition={{ duration: 0.16 }}
            className={cn(
              'absolute left-0 z-40 max-h-[60vh] w-72 overflow-y-auto rounded-md border border-line bg-surface p-2 text-ink shadow-pop',
              placement === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'
            )}
          >
            {groups.map((group, gi) => (
              <div key={group.heading ?? gi} className={cn(gi > 0 && 'mt-2 border-t border-line pt-2')}>
                {group.heading && <p className="px-3 pb-1 pt-1 text-xs text-muted">{group.heading}</p>}
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between gap-3 rounded-sm px-3 py-2 text-[0.9375rem] hover:bg-page-alt focus-visible:bg-page-alt"
                      >
                        <span>{link.label}</span>
                        {link.meta && <span className="tabular text-sm text-muted">{link.meta}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
