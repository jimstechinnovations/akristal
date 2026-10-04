'use client'

import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/lib/use-focus-trap'

/** Bottom sheet on phones, centred dialog from the `sm` breakpoint up. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[rgb(20_12_10/0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative flex max-h-[88svh] w-full flex-col rounded-t-lg bg-surface text-ink sm:max-w-lg sm:rounded-lg"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4 sm:px-6">
              <h2 className="text-base font-semibold">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-sm hover:bg-page-alt">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">{children}</div>
            {footer && <div className="shrink-0 border-t border-line px-4 py-3 sm:px-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
