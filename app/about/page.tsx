import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCopy } from '@/lib/data/copy'
import { getAllListings } from '@/lib/data/listings'
import { getProjects } from '@/lib/data/projects'
import { getSettings } from '@/lib/data/settings'
import { splitPhones, telHref } from '@/content/defaults'
import { computeStats } from '@/lib/stats'
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

export default async function AboutPage() {
  const [projects, listings, settings, copy] = await Promise.all([getProjects(), getAllListings(), getSettings(), getCopy('about')])
  const groups = copy.list('what.groups').map((g) => ({ title: g.title, items: g.items.split('\n').map((x) => x.trim()).filter(Boolean) }))
  const values = copy.list('values.items')
  const stats = computeStats(settings.home.stats, projects, listings)
  const offices = settings.contact.offices

  return (
    <>
      <section className="relative isolate flex min-h-[60svh] items-end text-white">
        <Image src={copy.t('hero.image')} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_12_10/0.85)] via-[rgb(20_12_10/0.35)] to-transparent" />
        <div className="page-x pb-14 pt-28">
          <h1 className="max-w-3xl font-display text-display-xl font-medium">{copy.t('hero.title')}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">
            {copy.t('hero.intro')}
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
              {copy.t('what.title')}
            </h2>
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
              {copy.t('what.intro')}
            </p>
            <Link href="/projects" className="mt-6 inline-flex border-b border-line-strong pb-0.5 text-[0.9375rem] font-medium hover:border-ink">
              See Akristal developments
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
            {copy.t('values.title')}
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

      <section aria-labelledby="team-link-title" className="page-x-wide section-y grid gap-6 border-b border-line md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h2 id="team-link-title" className="font-display text-display-m font-medium">
            {copy.t('team.title')}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{copy.t('team.intro')}</p>
        </div>
        <Link href="/management" className={buttonClasses({ variant: 'outline' })}>
          Meet the management team
        </Link>
      </section>

      <section aria-labelledby="offices-title" className="border-t border-line bg-page-alt section-y">
        <div className="page-x grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="offices-title" className="font-display text-display-m font-medium">
              {copy.t('offices.title')}
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
            {offices.map((o) => (
              <address key={o.region + o.label} className="not-italic">
                <p className="font-display text-2xl">{o.region}</p>
                <p className="text-sm text-muted">{o.label}</p>
                <p className="mt-3 text-[0.9375rem]">{o.address}</p>
                {splitPhones(o.phones).map((p) => (
                    <a key={p} href={telHref(p)} className="tabular mt-1 block text-[0.9375rem] hover:underline">
                      {p}
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
