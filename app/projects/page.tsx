import { getCopy } from '@/lib/data/copy'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { STAGES, getProjects, type ProjectStage } from '@/lib/data/projects'
import { formatMoney } from '@/lib/format'
import { pageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { buttonClasses } from '@/components/ui/button'
import { StageTrack } from '@/components/projects/stage-track'
import { Reveal } from '@/components/motion/reveal'
import { HillsSkyline } from '@/components/illustrations/hills-skyline'

export const metadata: Metadata = pageMetadata({
  title: 'Akristal Developments',
  description:
    'Homes and neighbourhoods built by The Akristal Group (TAG): Le Centurium City in Rwamagana, Pearl View Residence in Kanzenze and more. Purchase from the off-plan stage to the finished home via Akristal.',
  path: '/projects',
})

type PageProps = { searchParams: Promise<{ stage?: string }> }

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { stage } = await searchParams
  const [projects, user, copy] = await Promise.all([getProjects(), getCurrentUser(), getCopy('projects')])
  const isAdmin = user?.profile?.role === 'admin'
  const active = STAGES.find((s) => s.value === stage)?.value as ProjectStage | undefined
  const shown = active ? projects.filter((p) => p.stage === active) : projects
  // Admins also see drafts and archived developments (hidden from the public by RLS).
  const hidden = isAdmin
    ? (((await (await createClient()).from('projects').select('id, title, name, status').in('status', ['draft', 'archived'])).data ?? []) as {
        id: string
        title: string
        name: string | null
        status: string
      }[])
    : []

  return (
    <>
      <header className="relative isolate overflow-hidden border-b border-line bg-gradient-to-b from-wash to-page">
        <HillsSkyline className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 aspect-[2.2/1] w-full text-line-art opacity-[0.16] sm:aspect-[4/1] dark:opacity-[0.3]" />
        <div className="page-x-wide pb-14 pt-12 sm:pb-20 sm:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-display-l font-medium">{copy.t('hero.title')}</h1>
              <p className="mt-4 text-base leading-relaxed text-muted">{copy.t('hero.intro')}</p>
            </div>
            {isAdmin && (
              <Link href="/projects/new" className={buttonClasses()}>
                <Plus aria-hidden className="size-4" /> New development
              </Link>
            )}
          </div>
          <nav aria-label="Filter by stage" className="mt-10 flex flex-wrap gap-2">
            {[{ value: undefined, label: 'All' }, ...STAGES].map((s) => {
              const current = s.value === active
              const count = s.value ? projects.filter((p) => p.stage === s.value).length : projects.length
              return (
                <Link
                  key={s.label}
                  href={s.value ? `/projects?stage=${s.value}` : '/projects'}
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-sm border px-4 text-sm transition-colors',
                    current ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-page/60 hover:border-ink'
                  )}
                >
                  {s.label}
                  <span className="tabular text-xs opacity-70">{count}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <section aria-label="Developments" className="page-x-wide py-14 sm:py-20">
        {shown.length ? (
          <ul className="grid gap-20">
            {shown.map((p, i) => (
              <li key={p.id}>
                <Reveal>
                  <article className="group relative grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                    <div className={cn('relative aspect-[4/3] overflow-hidden rounded-md bg-page-alt lg:col-span-7', i % 2 === 1 && 'lg:order-2')}>
                      {!p.images[0] && p.videos[0] && (
                        // Video-only development: show an early frame as the cover.
                        <video src={`${p.videos[0]}#t=1`} muted playsInline preload="metadata" aria-hidden className="absolute inset-0 size-full object-cover" />
                      )}
                      {p.images[0] && (
                        <Image
                          src={p.images[0]}
                          alt=""
                          fill
                          priority={i === 0}
                          sizes="(min-width: 1024px) 58vw, 100vw"
                          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                        />
                      )}
                      <span className="absolute left-3 top-3 rounded-sm bg-[#1f1b19]/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {p.soldOut ? 'Sold out' : p.stageLabel}
                      </span>
                    </div>
                    <div className="lg:col-span-5">
                      <p className="text-sm text-muted">{p.location}</p>
                      <h2 className="mt-2 font-display text-display-m font-medium">
                        <Link href={`/projects/${p.slug ?? p.id}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
                          {p.name}
                        </Link>
                      </h2>
                      {p.summary && <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{p.summary}</p>}
                      <StageTrack stage={p.stage} progressPct={p.progressPct} soldOut={p.soldOut} tone="default" className="mt-6 max-w-md" />
                      <p className="mt-6 text-[0.9375rem] font-medium">
                        {p.soldOut ? 'All homes sold' : p.priceFrom ? <span className="tabular">From {formatMoney(p.priceFrom.amount, p.priceFrom.currency)}</span> : 'Prices on request'}
                      </p>
                      <span className="mt-6 inline-flex border-b border-line-strong pb-0.5 text-[0.9375rem] font-medium group-hover:border-ink">
                        View development
                      </span>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-md py-12 text-center">
            <h2 className="text-lg font-semibold">{copy.t('empty.title')}</h2>
            <p className="mt-2 text-muted">{copy.t('empty.text')}</p>
            <Link href="/projects" className={buttonClasses({ className: 'mt-6' })}>
              Show all developments
            </Link>
          </div>
        )}

        {hidden.length > 0 && (
          <div className="mt-20 rounded-md border border-dashed border-line-strong p-6">
            <h2 className="text-lg font-semibold">Drafts and archived (visible to admins only)</h2>
            <ul className="mt-4 grid gap-2">
              {hidden.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 text-[0.9375rem]">
                  <Link href={`/projects/${p.id}`} className="underline underline-offset-4">
                    {p.name ?? p.title}
                  </Link>
                  <span className="text-sm capitalize text-muted">{p.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  )
}
