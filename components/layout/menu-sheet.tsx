'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Phone, X } from 'lucide-react'
import { menuGroups, site } from '@/config/site'
import { accountLinks, roleLabel } from '@/lib/account-links'
import type { AuthUser } from '@/lib/use-auth-user'
import { whatsappLink } from '@/lib/whatsapp'
import { useFocusTrap } from '@/lib/use-focus-trap'
import { Logo } from '@/components/brand/logo'
import { CurrencyPicker } from '@/components/currency/currency-picker'
import { telHref, type HeaderPhone } from '@/content/defaults'
import { ThemeToggle } from './theme-toggle'


export function MenuSheet({
  open,
  onClose,
  user,
  onSignOut,
  phones,
}: {
  phones: HeaderPhone[]
  open: boolean
  onClose: () => void
  user: AuthUser | null | undefined
  onSignOut: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useFocusTrap(panelRef, open, onClose)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[rgb(20_12_10/0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col overflow-y-auto bg-page text-ink"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4 sm:h-20 sm:px-8">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center gap-2 rounded-sm px-3 text-sm hover:bg-page-alt"
              >
                Close
                <X aria-hidden className="size-5" />
              </button>
            </div>

            <nav aria-label="All pages" className="grid flex-1 gap-x-8 gap-y-8 px-4 py-8 sm:grid-cols-2 sm:px-8">
              {menuGroups.map((group) => (
                <div key={group.label}>
                  <h2 className="text-sm text-muted">{group.label}</h2>
                  <ul className="mt-3 space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="font-display text-[1.6rem] leading-snug underline-offset-4 hover:underline"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h2 className="text-sm text-muted">{user ? roleLabel(user.profile?.role) : 'Account'}</h2>
                <ul className="mt-3 space-y-2 text-[0.9375rem]">
                  {user ? (
                    <>
                      {accountLinks(user.profile?.role).map((l) => (
                        <li key={l.href + l.label}>
                          <Link href={l.href} onClick={onClose} className="hover:underline">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button type="button" onClick={onSignOut} className="hover:underline">
                          Sign out
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link href="/login" onClick={onClose} className="hover:underline">
                          Log in
                        </Link>
                      </li>
                      <li>
                        <Link href="/register" onClick={onClose} className="hover:underline">
                          Create an account
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </nav>

            <div className="mt-auto border-t border-line bg-page-alt px-4 py-6 sm:px-8">
              <div className="flex flex-wrap gap-3">
                <a
                  href={whatsappLink('Hello Akristal, I would like some help finding a property.')}
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-hover"
                >
                  <MessageCircle aria-hidden className="size-4" />
                  WhatsApp us
                </a>
                {phones.map((p) => (
                  <a
                    key={p.number}
                    href={telHref(p.number)}
                    className="inline-flex h-11 items-center gap-2 rounded-sm border border-line-strong px-4 text-sm font-medium hover:border-ink"
                  >
                    <Phone aria-hidden className="size-4" />
                    <span className="text-muted">{p.label}</span>
                    <span className="tabular">{p.number}</span>
                  </a>
                ))}
              </div>
              <CurrencyPicker withLabel className="mt-4 md:hidden" />
              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <a href={`mailto:${site.email}`} className="hover:text-ink hover:underline">
                  {site.email}
                </a>
                <ThemeToggle withLabel />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
