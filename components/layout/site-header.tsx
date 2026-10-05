'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Menu, MessageCircle, Phone } from 'lucide-react'
import { primaryNav } from '@/config/site'
import { telHref, type HeaderPhone } from '@/content/defaults'
import { useAuthUser } from '@/lib/use-auth-user'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'
import { CurrencyPicker } from '@/components/currency/currency-picker'
import { AccountMenu } from './account-menu'
import { MenuSheet } from './menu-sheet'
import { ThemeToggle } from './theme-toggle'

/** Routes that open with a full-bleed hero; the header sits transparently over it until scrolled. */
const OVERLAY_ROUTES = ['/']

// Short code beside each header phone number; unknown countries use their first two letters.
const CODES: Record<string, string> = { rwanda: 'RW', nigeria: 'NG', 'south africa': 'ZA', kenya: 'KE', uganda: 'UG', ghana: 'GH', tanzania: 'TZ', uae: 'AE', dubai: 'AE', 'united arab emirates': 'AE', 'united kingdom': 'UK', uk: 'UK', usa: 'US' }
const countryCode = (label: string) => CODES[label.trim().toLowerCase()] ?? label.trim().slice(0, 2).toUpperCase()

export function SiteHeader({ phones }: { phones: HeaderPhone[] }) {
  const pathname = usePathname() ?? '/'
  const { user, signOut } = useAuthUser()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const hasHero = OVERLAY_ROUTES.includes(pathname)
  const overlay = hasHero && !scrolled && !menuOpen

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-300',
          overlay
            ? 'border-b border-transparent bg-transparent text-white'
            : 'border-b border-line bg-page/95 text-ink backdrop-blur-sm supports-[backdrop-filter]:bg-page/85'
        )}
      >
        {overlay && (
          // Keeps white header text legible on bright skies without tinting the whole hero.
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
        )}
        <div className="page-x-wide relative grid h-16 grid-cols-[1fr_auto] items-center gap-4 sm:h-20 lg:grid-cols-[1fr_auto_1fr]">
          <nav aria-label="Primary" className="hidden lg:block">
            <Suspense fallback={<NavLinks pathname={pathname} />}>
              <NavLinksWithQuery pathname={pathname} />
            </Suspense>
          </nav>

          <Logo tone={overlay ? 'light' : 'default'} priority className="lg:justify-self-center" />

          <div className="flex items-center justify-end gap-1">
            {phones.length > 0 && (
              // Every office number the admin lists (Rwanda and Nigeria by default), stacked to save width.
              <div className="hidden items-center gap-2 pr-2 xl:flex">
                <Phone aria-hidden className="size-4 shrink-0" />
                <ul aria-label="Call Akristal" className="grid">
                  {phones.slice(0, 3).map((p) => (
                    <li key={p.number}>
                      <a href={telHref(p.number)} className="tabular text-[0.8125rem] leading-[1.15rem] hover:underline">
                        <span className={cn('mr-1.5 inline-block w-[1.6rem] text-[0.6875rem] uppercase', overlay ? 'text-white/70' : 'text-muted')}>
                          {countryCode(p.label)}
                        </span>
                        <span className="sr-only">{p.label}: </span>
                        {p.number}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <CurrencyPicker className="hidden md:inline-flex" />
            <a
              href={whatsappLink('Hello Akristal, I would like some help finding a property.')}
              aria-label="Chat with Akristal on WhatsApp"
              className={cn(
                'inline-flex size-10 items-center justify-center rounded-sm lg:hidden',
                overlay ? 'hover:bg-white/10' : 'hover:bg-page-alt'
              )}
            >
              <MessageCircle aria-hidden className="size-5" />
            </a>
            <ThemeToggle className={cn('hidden sm:inline-flex', overlay && 'hover:bg-white/10')} />
            {user ? (
              <div className="hidden lg:block">
                <AccountMenu user={user} onSignOut={signOut} overlay={overlay} />
              </div>
            ) : user === null ? (
              <Link
                href="/login"
                className={cn(
                  'hidden h-10 items-center rounded-sm px-3 text-[0.9375rem] lg:inline-flex',
                  overlay ? 'hover:bg-white/10' : 'hover:bg-page-alt'
                )}
              >
                Log in
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-sm pl-2 pr-1 text-[0.9375rem] sm:pl-3',
                overlay ? 'hover:bg-white/10' : 'hover:bg-page-alt'
              )}
            >
              <span className="hidden sm:inline">Menu</span>
              <Menu aria-hidden className="size-6" />
              <span className="sr-only sm:hidden">Open menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Pages without a hero start below the fixed header. */}
      {!hasHero && <div aria-hidden className="h-16 sm:h-20" />}

      <MenuSheet open={menuOpen} onClose={closeMenu} user={user} onSignOut={signOut} phones={phones} />
    </>
  )
}

const navLinkClass =
  'relative inline-flex h-10 items-center px-3 text-[0.9375rem] transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform hover:after:scale-x-100 aria-[current=page]:after:scale-x-100'

function NavLinks({ pathname, query }: { pathname: string; query?: { get(name: string): string | null } | null }) {
  function isActive(href: string) {
    const [path, q] = href.split('?')
    if (!pathname.startsWith(path)) return false
    if (!q) return true
    if (!query) return false
    const [key, value] = q.split('=')
    return query.get(key) === value
  }
  return (
    <ul className="flex items-center gap-1">
      {primaryNav.map((item) => (
        <li key={item.href}>
          <Link href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={navLinkClass}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

// useSearchParams needs a Suspense boundary so static pages can still prerender.
function NavLinksWithQuery({ pathname }: { pathname: string }) {
  const query = useSearchParams()
  return <NavLinks pathname={pathname} query={query} />
}
