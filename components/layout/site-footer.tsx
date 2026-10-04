import Link from 'next/link'
import { legalNav, menuGroups, site } from '@/config/site'
import { whatsappLink } from '@/lib/whatsapp'
import { Logo } from '@/components/brand/logo'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-brand text-on-brand dark:bg-[#1a0f0c]">
      <div className="page-x-wide py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-white/75">
              We build homes in Rwanda, list homes across Africa and the Gulf, and finish them with our own
              interiors and furniture.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappLink('Hello Akristal, I have a question.')}
                className="inline-flex h-11 items-center rounded-sm bg-accent px-5 text-sm font-medium text-[#1f1b19] transition-colors hover:bg-[#d8b571]"
              >
                WhatsApp us
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex h-11 items-center rounded-sm border border-white/40 px-5 text-sm font-medium transition-colors hover:border-white"
              >
                {site.email}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {menuGroups.slice(0, 3).map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2 className="text-sm text-white/60">{group.label}</h2>
                <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-white/90 hover:text-white hover:underline">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav aria-label="Company">
              <h2 className="text-sm text-white/60">Company</h2>
              <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                {[...menuGroups[3].items, ...menuGroups[4].items].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-white/90 hover:text-white hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-white/15 pt-10 sm:grid-cols-3">
          {site.offices.map((office) => (
            <address key={office.region} className="not-italic">
              <p className="font-display text-xl">{office.region}</p>
              <p className="mt-1 text-sm text-white/60">{office.label}</p>
              <p className="mt-3 text-sm text-white/85">{office.address}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {office.phones.map((p) => (
                  <li key={p.href}>
                    <a href={p.href} className="tabular text-white/85 hover:text-white hover:underline">
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
            </address>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/15 pt-8 text-sm text-white/60 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Social media">
            {site.socials.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-white/85 hover:text-white hover:underline">
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
              <Link key={l.href} href={l.href} className="hover:text-white hover:underline">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
