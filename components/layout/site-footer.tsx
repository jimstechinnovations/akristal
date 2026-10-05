import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { legalNav, menuGroups, site } from '@/config/site'
import { splitPhones, telHref, type SiteSettings } from '@/content/defaults'
import { whatsappLink } from '@/lib/whatsapp'
import { Logo } from '@/components/brand/logo'
import { HillsSkyline } from '@/components/illustrations/hills-skyline'
import { buttonClasses } from '@/components/ui/button'

const link = 'text-ink/85 transition-colors hover:text-ink hover:underline underline-offset-4'

export function SiteFooter({ contact, blurb }: { contact: SiteSettings['contact']; blurb: string }) {
  const year = new Date().getFullYear()
  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-gradient-to-b from-page-alt to-wash text-ink">
      <div className="page-x-wide pt-16 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="max-w-sm">
            <Logo full={site.legalName} />
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-muted">
              {blurb}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink('Hello Akristal, I have a question.', contact.whatsapp || undefined)} className={buttonClasses({ className: 'bg-[#1f6f4a] text-white hover:bg-[#185c3d]' })}>
                <MessageCircle aria-hidden className="size-4" /> WhatsApp us
              </a>
              <a href={`mailto:${contact.email}`} className={buttonClasses({ variant: 'outline' })}>
                {contact.email}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {menuGroups.slice(0, 3).map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2 className="text-sm text-muted">{group.label}</h2>
                <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={link}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav aria-label="Company">
              <h2 className="text-sm text-muted">Company</h2>
              <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                {[...menuGroups[3].items, ...menuGroups[4].items].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
          {contact.offices.map((office) => (
            <address key={office.region + office.label} className="not-italic">
              <p className="font-display text-xl">{office.region}</p>
              <p className="mt-1 text-sm text-muted">{office.label}</p>
              <p className="mt-3 text-sm text-ink/85">{office.address}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {splitPhones(office.phones).map((p) => (
                  <li key={p}>
                    <a href={telHref(p)} className={`tabular ${link}`}>
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </address>
          ))}
        </div>
      </div>

      {/* Hills and homes drawn along the bottom edge. */}
      <HillsSkyline className="pointer-events-none mt-8 block aspect-[2.2/1] w-full text-line-art opacity-[0.26] sm:aspect-[4/1] dark:opacity-[0.35]" />

      <div className="border-t border-line bg-page/60 backdrop-blur-sm">
        <div className="page-x-wide flex flex-col gap-4 py-6 text-sm text-muted lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Social media">
            {site.socials.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={link}>
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>
              © {year} {site.legalName}
            </span>
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-ink hover:underline">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
