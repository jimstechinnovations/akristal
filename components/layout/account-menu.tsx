'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { accountLinks, roleLabel } from '@/lib/account-links'
import { initials, type AuthUser } from '@/lib/use-auth-user'
import { cn } from '@/lib/utils'

export function AccountMenu({
  user,
  onSignOut,
  overlay,
}: {
  user: AuthUser
  onSignOut: () => void
  overlay: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const role = user.profile?.role
  const name = user.profile?.full_name || user.email || 'Your account'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-sm pl-1 pr-2 text-sm transition-colors',
          overlay ? 'hover:bg-white/10' : 'hover:bg-page-alt'
        )}
      >
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white"
        >
          {initials(user)}
        </span>
        <span className="sr-only">Account menu for {name}</span>
        <ChevronDown aria-hidden className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-line bg-surface py-2 text-ink shadow-pop"
          >
            <div className="border-b border-line px-4 pb-3 pt-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="text-xs text-muted">{roleLabel(role)}</p>
            </div>
            <ul className="py-1">
              {accountLinks(role).map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    role="menuitem"
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-page-alt focus-visible:bg-page-alt"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-line pt-1">
              <button
                role="menuitem"
                type="button"
                onClick={onSignOut}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-page-alt"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
