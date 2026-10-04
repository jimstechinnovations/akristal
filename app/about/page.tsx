import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/config/site'
import { images } from '@/content/images'
import { getAllListings } from '@/lib/data/listings'
import { getProjects } from '@/lib/data/projects'
import { getTeam } from '@/lib/data/people'
import { pageMetadata } from '@/lib/seo'
import { buttonClasses } from '@/components/ui/button'
import { CountUp } from '@/components/motion/count-up'

export const revalidate = 600

export const metadata: Metadata = pageMetadata({
  title: 'About us',
  description:
    'The Akristal Group Limited builds, sells, finances and furnishes homes, with its head office in Kigali and teams across Africa. Meet the people behind it.',
  path: '/about',
})

// From the company's own description of its services, grouped for readability.
const groups = [
  { title: 'Build', items: ['Real estate development', 'Construction', 'Architectural design', 'Infrastructure'] },
  { title: 'Sell and let', items: ['Residential property, local and international', 'Commercial property, local and international', 'Lease and rental services', 'Property management'] },
  { title: 'Finance', items: ['In-house financing, including Pay Small Small', 'F.Y.L. Company (Fund Your Lifestyle)'] },
  { title: 'Finish', items: ['Interior and exterior decoration', 'Home automation', 'Furniture'] },
  { title: 'And more', items: ['Outsourcing management', 'Consulting for manufacturing companies', 'Event planning', 'Transport and car hire'] },
]

const values = [
  { title: 'Transparency', text: 'Clear prices, clear terms and honest advice in every transaction.' },
  { title: 'Security', text: 'Your documents, payments and personal data handled with care.' },
  { title: 'Excellence', text: 'Quality in what we build, what we list and how we finish it.' },
  { title: 'Customer focus', text: 'We start from what you need, not from what we have to sell.' },
]

export default async function AboutPage() {
  const [team, projects, listings] = await Promise.all([getTeam(), getProjects(), getAllListings()])
  const available = listings.filter((l) => l.status === 'available')
  const stats = [
    { value: new Set(projects.map((p) => p.name.split(':')[0].trim())).size, label: 'Akristal developments' },
    { value: projects.filter((p) => p.soldOut).reduce((n, p) => n + (p.totalUnits ?? 0), 0), label: 'homes sold at Valid Dreams Estate' },
    { value: available.length, label: 'homes listed today' },
    { value: new Set([...available.map((l) => l.market?.country), ...projects.map((p) => p.country)].filter(Boolean)).size, label: 'countries' },
  ].filter((s) => s.value > 0)
  const hero = images.placesKigali

  return (
    <>
      <section className="relative isolate flex min-h-[60svh] items-end text-white">
        <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_12_10/0.85)] via-[rgb(20_12_10/0.35)] to-transparent" />
        <div className="page-x pb-14 pt-28">
          <h1 className="max-w-3xl font-display text-display-xl font-medium">We build, sell and finish homes</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">
            The Akristal Group Limited is a real estate and lifestyle company with its head office in Kigali. We develop new neighbourhoods,
            sell and let homes across Africa and the Gulf, finance them with our own Pay Small Small plans, and furnish them.
          </p>
        </div>
      </section>

      {stats.length > 0 && (
        <section aria-label="Akristal in numbers" className="border-b border-line">
          <dl className="page-x grid grid-cols-2 gap-y-8 py-12 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-2 text-sm text-muted">{s.label}</dt>
                <dd>
                  <CountUp value={s.value} className="text-[2.75rem] font-light leading-none tracking-tight" />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section aria-labelledby="what-title" className="page-x section-y">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="what-title" className="font-display text-display-m font-medium">
              What we do
            </h2>
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
              Most clients come to us for a home. Many stay for the rest: the loan, the interiors, the furniture and the move.
            </p>
            <Link href="/projects" className="mt-6 inline-flex border-b border-line-strong pb-0.5 text-[0.9375rem] font-medium hover:border-ink">
              See our developments
            </Link>
          </div>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {groups.map((g) => (
              <div key={g.title} className="border-t border-line pt-5">
                <h3 className="text-lg font-semibold">{g.title}</h3>
                <ul className="mt-3 grid gap-1.5 text-[0.9375rem] text-muted">
                  {g.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="values-title" className="bg-brand text-white section-y">
        <div className="page-x">
          <h2 id="values-title" className="font-display text-display-m font-medium">
            What we stand for
          </h2>
          <dl className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="border-t border-white/20 pt-5">
                <dt className="font-display text-2xl">{v.title}</dt>
                <dd className="mt-2 text-[0.9375rem] leading-relaxed text-white/75">{v.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {team.length > 0 && (
        <section id="team" aria-labelledby="team-title" className="scroll-mt-24 page-x-wide section-y">
          <h2 id="team-title" className="font-display text-display-m font-medium">
            Our team
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {team.map((m) => (
              <li key={m.id}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-page-alt">
                  {m.imageUrl && <Image src={m.imageUrl} alt={`Portrait of ${m.name}`} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw" className="object-cover object-top" />}
                </div>
                <p className="mt-3 text-[0.9375rem] font-medium leading-snug">{m.name}</p>
                {m.credentials && <p className="text-xs text-muted">{m.credentials}</p>}
                <p className="mt-1 text-sm text-muted">{m.role}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="offices-title" className="border-t border-line bg-page-alt section-y">
        <div className="page-x grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="offices-title" className="font-display text-display-m font-medium">
              Offices
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className={buttonClasses()}>
                Contact us
              </Link>
              <Link href="/join" className={buttonClasses({ variant: 'outline' })}>
                Work with us
              </Link>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {site.offices.map((o) => (
              <address key={o.region} className="not-italic">
                <p className="font-display text-2xl">{o.region}</p>
                <p className="text-sm text-muted">{o.label}</p>
                <p className="mt-3 text-[0.9375rem]">{o.address}</p>
                {o.phones.map((p) => (
                  <a key={p.href} href={p.href} className="tabular mt-1 block text-[0.9375rem] hover:underline">
                    {p.label}
                  </a>
                ))}
              </address>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
